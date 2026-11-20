-- Server-side grading boundary. The runtime roles never receive direct SELECT on answer_keys.

REVOKE ALL ON answer_keys FROM shd_app, shd_worker, shd_staff_api, shd_readonly;
GRANT SELECT ON skills, levels, exam_versions, exams, sections, questions, question_options, answer_keys, attempt_answers, exam_attempts TO shd_grader;
GRANT SELECT ON skills, levels TO shd_grader;

CREATE OR REPLACE FUNCTION load_grading_snapshot(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_attempt record;
    v_snapshot jsonb;
BEGIN
    SELECT
        ea.id,
        ea.status,
        ea.version_id,
        ea.expires_at,
        ev.exam_id,
        e.code AS exam_code,
        e.passing_percentage,
        e.benchmark_scale_config,
        l.code AS level_code
    INTO v_attempt
    FROM exam_attempts ea
    JOIN exam_versions ev ON ev.id = ea.version_id
    JOIN exams e ON e.id = ev.exam_id
    JOIN levels l ON l.id = e.level_id
    WHERE ea.id = p_attempt_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NOT_FOUND: Attempt does not exist' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt.status NOT IN ('submitted', 'graded') THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Attempt must be submitted before grading' USING ERRCODE = '22000';
    END IF;

    SELECT jsonb_build_object(
        'attemptId', v_attempt.id,
        'status', v_attempt.status,
        'versionId', v_attempt.version_id,
        'examId', v_attempt.exam_id,
        'examCode', v_attempt.exam_code,
        'levelCode', v_attempt.level_code,
        'expiresAt', v_attempt.expires_at,
        'passingPercentage', v_attempt.passing_percentage,
        'scoringPolicy', COALESCE(v_attempt.benchmark_scale_config -> 'scoringPolicy', '{}'::jsonb),
        'sections', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'sectionId', s.id,
                    'sourceSectionId', s.source_section_id,
                    'skill', sk.code,
                    'sectionOrder', s.section_order,
                    'maxScore', COALESCE((
                        SELECT SUM(q.points)
                        FROM questions q
                        WHERE q.section_id = s.id AND q.version_id = v_attempt.version_id
                    ), 0),
                    'questions', COALESCE((
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'questionId', q.id,
                                'sourceQuestionId', q.source_question_id,
                                'order', q.question_order,
                                'part', q.part_number,
                                'points', q.points,
                                'selectedOption', aa.selected_option_label,
                                'correctOption', ak.correct_option_label,
                                'citation', ak.citation,
                                'trapExplanationVi', ak.trap_explanation_vi,
                                'tags', ak.tags
                            ) ORDER BY q.question_order
                        )
                        FROM questions q
                        JOIN answer_keys ak ON ak.question_id = q.id
                        LEFT JOIN attempt_answers aa
                            ON aa.question_id = q.id AND aa.attempt_id = p_attempt_id
                        WHERE q.section_id = s.id AND q.version_id = v_attempt.version_id
                    ), '[]'::jsonb)
                ) ORDER BY s.section_order
            )
            FROM sections s
            JOIN skills sk ON sk.id = s.skill_id
            WHERE s.version_id = v_attempt.version_id
        ), '[]'::jsonb)
    ) INTO v_snapshot;

    RETURN v_snapshot;
END;
$$;

ALTER FUNCTION load_grading_snapshot(uuid) OWNER TO shd_grader;
REVOKE ALL ON FUNCTION load_grading_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION load_grading_snapshot(uuid) TO shd_worker;
GRANT EXECUTE ON FUNCTION load_grading_snapshot(uuid) TO shd_attempt_mgr;

CREATE OR REPLACE FUNCTION persist_grading_result(p_attempt_id uuid, p_result jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_attempt_status varchar(32);
    v_result_id uuid;
    v_item record;
    v_section record;
BEGIN
    SELECT status INTO v_attempt_status
    FROM exam_attempts
    WHERE id = p_attempt_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NOT_FOUND: Attempt does not exist' USING ERRCODE = 'P0002';
    END IF;

    IF v_attempt_status = 'graded' THEN
        SELECT id INTO v_result_id FROM results WHERE attempt_id = p_attempt_id;
        RETURN jsonb_build_object('attemptId', p_attempt_id, 'resultId', v_result_id, 'status', 'already_graded');
    END IF;

    IF v_attempt_status <> 'submitted' THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Attempt must be submitted before persisting a result' USING ERRCODE = '22000';
    END IF;

    INSERT INTO results (
        attempt_id,
        total_score,
        max_possible_score,
        percentage,
        passing_percentage_snapshot,
        cefr_estimate_code,
        benchmark_status_code,
        graded_at
    ) VALUES (
        p_attempt_id,
        (p_result ->> 'totalScore')::numeric(8, 2),
        (p_result ->> 'maxPossibleScore')::numeric(8, 2),
        (p_result ->> 'percentage')::numeric(5, 2),
        COALESCE((p_result ->> 'passingPercentage')::numeric(5, 2), 60.00),
        COALESCE(p_result ->> 'cefrEstimateCode', 'A1'),
        COALESCE(p_result ->> 'benchmarkStatusCode', CASE WHEN COALESCE((p_result ->> 'isPassed')::boolean, false) THEN 'pass' ELSE 'not_pass' END),
        clock_timestamp()
    )
    ON CONFLICT (attempt_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        max_possible_score = EXCLUDED.max_possible_score,
        percentage = EXCLUDED.percentage,
        passing_percentage_snapshot = EXCLUDED.passing_percentage_snapshot,
        cefr_estimate_code = EXCLUDED.cefr_estimate_code,
        benchmark_status_code = EXCLUDED.benchmark_status_code,
        graded_at = clock_timestamp()
    RETURNING id INTO v_result_id;

    FOR v_section IN
        SELECT * FROM jsonb_to_recordset(COALESCE(p_result -> 'sectionScores', '[]'::jsonb)) AS x(
            section_id uuid,
            score numeric(8, 2),
            max_score numeric(8, 2),
            cefr_code varchar(16)
        )
    LOOP
        INSERT INTO result_section_scores (result_id, section_id, score, max_score, cefr_code)
        VALUES (v_result_id, v_section.section_id, v_section.score, v_section.max_score, COALESCE(v_section.cefr_code, 'A1'))
        ON CONFLICT (result_id, section_id) DO UPDATE SET
            score = EXCLUDED.score,
            max_score = EXCLUDED.max_score,
            cefr_code = EXCLUDED.cefr_code;
    END LOOP;

    FOR v_item IN
        SELECT * FROM jsonb_to_recordset(COALESCE(p_result -> 'itemScores', '[]'::jsonb)) AS x(
            question_id uuid,
            is_correct boolean,
            earned_points numeric(8, 2)
        )
    LOOP
        INSERT INTO result_item_scores (result_id, question_id, is_correct, earned_points)
        VALUES (v_result_id, v_item.question_id, v_item.is_correct, v_item.earned_points)
        ON CONFLICT (result_id, question_id) DO UPDATE SET
            is_correct = EXCLUDED.is_correct,
            earned_points = EXCLUDED.earned_points;
    END LOOP;

    UPDATE exam_attempts
    SET status = 'graded'
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object('attemptId', p_attempt_id, 'resultId', v_result_id, 'status', 'graded');
END;
$$;

ALTER FUNCTION persist_grading_result(uuid, jsonb) OWNER TO shd_grader;
REVOKE ALL ON FUNCTION persist_grading_result(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION persist_grading_result(uuid, jsonb) TO shd_worker;
GRANT EXECUTE ON FUNCTION persist_grading_result(uuid, jsonb) TO shd_attempt_mgr;

CREATE OR REPLACE FUNCTION submit_attempt(
    p_attempt_id uuid,
    p_caller_token_hash varchar(64)
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_status varchar(32);
    v_expires_at timestamptz;
BEGIN
    SELECT ea.status, ea.expires_at
    INTO v_status, v_expires_at
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'FORBIDDEN: Cannot submit this attempt' USING ERRCODE = '42501';
    END IF;

    IF v_status = 'graded' OR v_status = 'submitted' THEN
        RETURN true;
    END IF;

    UPDATE exam_attempts
    SET status = 'submitted',
        submission_type = CASE WHEN clock_timestamp() >= v_expires_at THEN 'timeout' ELSE 'manual' END,
        submitted_at = clock_timestamp()
    WHERE id = p_attempt_id;

    RETURN true;
END;
$$;

ALTER FUNCTION submit_attempt(uuid, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION submit_attempt(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_attempt(uuid, varchar) TO shd_app;

CREATE OR REPLACE FUNCTION finalize_expired_attempts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_count integer := 0;
BEGIN
    WITH expired AS (
        SELECT id
        FROM exam_attempts
        WHERE status = 'in_progress'
          AND expires_at < clock_timestamp()
        FOR UPDATE SKIP LOCKED
    )
    UPDATE exam_attempts ea
    SET status = 'submitted', submission_type = 'timeout', submitted_at = clock_timestamp()
    FROM expired
    WHERE ea.id = expired.id;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

ALTER FUNCTION finalize_expired_attempts() OWNER TO shd_grader;
REVOKE ALL ON FUNCTION finalize_expired_attempts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION finalize_expired_attempts() TO shd_worker;
