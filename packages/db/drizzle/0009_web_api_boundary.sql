-- API boundary for persistent autosave, attempt state and entitlement-aware review.

CREATE OR REPLACE FUNCTION save_attempt_answer(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid,
    p_question_id uuid,
    p_selected_option_label varchar(8),
    p_expected_revision integer,
    p_time_spent_seconds integer DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_status varchar(32);
    v_expires_at timestamptz;
    v_version_id uuid;
    v_current_revision integer;
    v_new_revision integer;
BEGIN
    SELECT ea.visitor_id, ea.status, ea.expires_at, ea.version_id
    INTO v_visitor_id, v_status, v_expires_at, v_version_id
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash
    FOR UPDATE;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;
    IF v_status <> 'in_progress' OR clock_timestamp() > v_expires_at THEN
        RAISE EXCEPTION 'ATTEMPT_EXPIRED: Attempt is no longer writable' USING ERRCODE = '22000';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM questions
        WHERE id = p_question_id AND version_id = v_version_id
    ) THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Question does not belong to attempt version' USING ERRCODE = '22000';
    END IF;
    IF p_selected_option_label IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM question_options
        WHERE question_id = p_question_id AND option_label = p_selected_option_label
    ) THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Selected option does not belong to question' USING ERRCODE = '22000';
    END IF;
    IF p_expected_revision < 0 OR p_time_spent_seconds < 0 THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Revision and time spent must be non-negative' USING ERRCODE = '22000';
    END IF;

    SELECT revision INTO v_current_revision
    FROM attempt_answers
    WHERE attempt_id = p_attempt_id AND question_id = p_question_id
    FOR UPDATE;

    IF v_current_revision IS NULL THEN
        IF p_expected_revision <> 0 THEN
            RAISE EXCEPTION 'REVISION_CONFLICT: Expected revision does not match initial answer state' USING ERRCODE = '40001';
        END IF;
        v_new_revision := 1;
        INSERT INTO attempt_answers (attempt_id, question_id, selected_option_label, revision, answered_at)
        VALUES (p_attempt_id, p_question_id, p_selected_option_label, v_new_revision, clock_timestamp());
    ELSE
        IF p_expected_revision <> v_current_revision THEN
            RAISE EXCEPTION 'REVISION_CONFLICT: Expected revision does not match stored answer state' USING ERRCODE = '40001';
        END IF;
        v_new_revision := v_current_revision + 1;
        UPDATE attempt_answers
        SET selected_option_label = p_selected_option_label,
            revision = v_new_revision,
            answered_at = clock_timestamp()
        WHERE attempt_id = p_attempt_id AND question_id = p_question_id;
    END IF;

    RETURN jsonb_build_object(
        'questionId', p_question_id,
        'revision', v_new_revision,
        'savedAt', clock_timestamp()
    );
END;
$$;

ALTER FUNCTION save_attempt_answer(varchar, uuid, uuid, varchar, integer, integer) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION save_attempt_answer(varchar, uuid, uuid, varchar, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_attempt_answer(varchar, uuid, uuid, varchar, integer, integer) TO shd_app;

CREATE OR REPLACE FUNCTION get_attempt_state(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_state jsonb;
BEGIN
    SELECT jsonb_build_object(
        'attemptId', ea.id,
        'examId', e.code,
        'slug', e.slug,
        'versionId', ea.version_id,
        'status', ea.status,
        'startedAt', ea.started_at,
        'expiresAt', ea.expires_at,
        'serverNow', clock_timestamp(),
        'answers', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'questionId', q.source_question_id,
                'selectedOption', aa.selected_option_label,
                'revision', aa.revision,
                'answeredAt', aa.answered_at
            ) ORDER BY q.question_order)
            FROM attempt_answers aa
            JOIN questions q ON q.id = aa.question_id
            WHERE aa.attempt_id = ea.id
        ), '[]'::jsonb)
    ) INTO v_state
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    JOIN exam_versions ev ON ev.id = ea.version_id
    JOIN exams e ON e.id = ev.exam_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;

    IF v_state IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;
    RETURN v_state;
END;
$$;

ALTER FUNCTION get_attempt_state(varchar, uuid) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION get_attempt_state(varchar, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_attempt_state(varchar, uuid) TO shd_app;

CREATE OR REPLACE FUNCTION get_attempt_review(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_unlocked boolean;
    v_result_id uuid;
    v_review jsonb;
BEGIN
    SELECT ea.visitor_id, ent.full_solution_unlocked, r.id
    INTO v_visitor_id, v_unlocked, v_result_id
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    JOIN attempt_entitlements ent ON ent.attempt_id = ea.id
    LEFT JOIN results r ON r.attempt_id = ea.id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;
    IF v_result_id IS NULL THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Attempt has no result yet' USING ERRCODE = '22000';
    END IF;

    SELECT jsonb_build_object(
        'attemptId', p_attempt_id,
        'unlocked', v_unlocked,
        'items', COALESCE(jsonb_agg(jsonb_build_object(
            'questionId', q.source_question_id,
            'selectedOption', aa.selected_option_label,
            'access', CASE WHEN exp.is_public_preview OR v_unlocked THEN 'full' ELSE 'locked' END,
            'isCorrect', CASE WHEN exp.is_public_preview OR v_unlocked THEN ris.is_correct ELSE NULL END,
            'correctOption', CASE WHEN v_unlocked THEN ak.correct_option_label ELSE NULL END,
            'citation', CASE WHEN v_unlocked THEN ak.citation ELSE NULL END,
            'trapExplanationVi', CASE WHEN v_unlocked THEN ak.trap_explanation_vi ELSE NULL END,
            'tags', CASE WHEN v_unlocked THEN ak.tags ELSE NULL END,
            'explanation', CASE WHEN exp.is_public_preview OR v_unlocked THEN exp.explanation_text ELSE NULL END
        ) ORDER BY q.question_order), '[]'::jsonb)
    ) INTO v_review
    FROM result_item_scores ris
    JOIN results r ON r.id = ris.result_id
    JOIN questions q ON q.id = ris.question_id
    LEFT JOIN attempt_answers aa ON aa.attempt_id = p_attempt_id AND aa.question_id = q.id
    JOIN answer_keys ak ON ak.question_id = q.id
    LEFT JOIN explanations exp ON exp.question_id = q.id
    WHERE r.id = v_result_id;

    RETURN v_review;
END;
$$;

ALTER FUNCTION get_attempt_review(varchar, uuid) OWNER TO shd_grader;
REVOKE ALL ON FUNCTION get_attempt_review(varchar, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_attempt_review(varchar, uuid) TO shd_app;

CREATE OR REPLACE FUNCTION create_guardian(
    p_caller_token_hash varchar(64),
    p_learner_id uuid,
    p_parent_phone_hash varchar(64),
    p_parent_phone_encrypted text,
    p_relationship varchar(32) DEFAULT 'parent'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_guardian_id uuid;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor does not exist' USING ERRCODE = '28000';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM learners WHERE id = p_learner_id AND is_under_18 = true
    ) THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Guardian can only be attached to an under-18 learner' USING ERRCODE = '22000';
    END IF;

    INSERT INTO guardians (learner_id, phone_hash, phone_encrypted, relationship, verification_status)
    VALUES (p_learner_id, p_parent_phone_hash, p_parent_phone_encrypted, p_relationship, 'pending')
    ON CONFLICT (learner_id) DO UPDATE SET
        phone_hash = EXCLUDED.phone_hash,
        phone_encrypted = EXCLUDED.phone_encrypted,
        relationship = EXCLUDED.relationship,
        verification_status = CASE
            WHEN guardians.verification_status = 'approved' THEN guardians.verification_status
            ELSE 'pending'
        END,
        requested_at = clock_timestamp()
    RETURNING id INTO v_guardian_id;
    RETURN v_guardian_id;
END;
$$;

ALTER FUNCTION create_guardian(varchar, uuid, varchar, text, varchar) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION create_guardian(varchar, uuid, varchar, text, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_guardian(varchar, uuid, varchar, text, varchar) TO shd_app;

CREATE OR REPLACE FUNCTION get_attempt_result(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_result jsonb;
BEGIN
    SELECT ea.visitor_id INTO v_visitor_id
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;

    SELECT jsonb_build_object(
        'attemptId', r.attempt_id,
        'totalScore', r.total_score,
        'maxPossibleScore', r.max_possible_score,
        'percentage', r.percentage,
        'isPassed', r.benchmark_status_code = 'pass',
        'benchmarkStatusCode', r.benchmark_status_code,
        'cefrEstimateCode', r.cefr_estimate_code,
        'sectionScores', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'sectionId', rss.section_id,
                'score', rss.score,
                'maxScore', rss.max_score,
                'percentage', CASE WHEN rss.max_score = 0 THEN 0 ELSE ROUND((rss.score / rss.max_score) * 100, 2) END
            ) ORDER BY rss.section_id)
            FROM result_section_scores rss WHERE rss.result_id = r.id
        ), '[]'::jsonb),
        'review', get_attempt_review(p_caller_token_hash, p_attempt_id)
    ) INTO v_result
    FROM results r
    WHERE r.attempt_id = p_attempt_id;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Attempt has no result yet' USING ERRCODE = '22000';
    END IF;
    RETURN v_result;
END;
$$;

ALTER FUNCTION get_attempt_result(varchar, uuid) OWNER TO shd_grader;
REVOKE ALL ON FUNCTION get_attempt_result(varchar, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_attempt_result(varchar, uuid) TO shd_app;

INSERT INTO consent_purposes (code, name, is_mandatory)
VALUES
    ('shd_education', 'SHD Education learning services', true),
    ('shd_career', 'SHD Career consultation', false)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO consent_texts (purpose_id, version_number, target_audience, legal_content, recipient_entities)
SELECT cp.id, 1, 'learner',
       CASE cp.code
           WHEN 'shd_education' THEN 'Tôi đồng ý để SHD Education xử lý dữ liệu cần thiết cho việc chấm điểm, lưu kết quả và hỗ trợ học tập.'
           ELSE 'Tôi đồng ý nhận tư vấn lộ trình học tập và thông tin khóa học từ SHD Career.'
       END,
       'SHD Education / SHD Career'
FROM consent_purposes cp
WHERE cp.code IN ('shd_education', 'shd_career')
ON CONFLICT (purpose_id, version_number, target_audience) DO NOTHING;

CREATE OR REPLACE FUNCTION get_verified_otp_learner(
    p_caller_token_hash varchar(64),
    p_challenge_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_phone_hash varchar(64);
    v_attempt_id uuid;
    v_learner_id uuid;
BEGIN
    SELECT v.id, oc.phone_hash, oc.attempt_id
    INTO v_visitor_id, v_phone_hash, v_attempt_id
    FROM otp_challenges oc
    JOIN visitors v ON v.id = oc.visitor_id
    WHERE oc.id = p_challenge_id AND v.visitor_token_hash = p_caller_token_hash AND oc.status = 'verified';
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: OTP challenge is not verified' USING ERRCODE = '22000';
    END IF;

    SELECT id INTO v_learner_id FROM learners WHERE phone_hash = v_phone_hash;
    IF v_learner_id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND: Verified learner was not found' USING ERRCODE = 'P0002';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM exam_attempts WHERE id = v_attempt_id AND visitor_id = v_visitor_id
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: OTP challenge attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;
    RETURN v_learner_id;
END;
$$;

ALTER FUNCTION get_verified_otp_learner(varchar, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION get_verified_otp_learner(varchar, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_verified_otp_learner(varchar, uuid) TO shd_app;
