-- Migration: 0003_security_definer_functions.sql
-- 26 hàm SECURITY DEFINER (Mục 5 của docs/architecture/02-data-model.md v1.9)
-- Cố định search_path = pg_catalog, public, REVOKE FROM PUBLIC, gán OWNER và GRANT EXECUTE chính xác

-- ==============================================================================
-- PHÂN HỆ 5.1: NHÓM HÀM KHẢO THÍ, KHÁCH VÃNG LAI & CHẤM ĐIỂM BIỆT LẬP
-- ==============================================================================

-- 1. create_visitor
CREATE OR REPLACE FUNCTION create_visitor(
    p_visitor_token_hash varchar(64),
    p_user_agent text DEFAULT NULL,
    p_ip_hash varchar(64) DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_id uuid;
BEGIN
    SELECT id INTO v_id FROM visitors WHERE visitor_token_hash = p_visitor_token_hash;
    IF FOUND THEN
        UPDATE visitors SET last_active_at = clock_timestamp() WHERE id = v_id;
        RETURN v_id;
    END IF;

    INSERT INTO visitors (visitor_token_hash, user_agent, ip_hash, first_seen_at, last_active_at)
    VALUES (p_visitor_token_hash, p_user_agent, p_ip_hash, clock_timestamp(), clock_timestamp())
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;
ALTER FUNCTION create_visitor(varchar, text, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION create_visitor(varchar, text, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_visitor(varchar, text, varchar) TO shd_app;

-- 2. start_attempt
CREATE OR REPLACE FUNCTION start_attempt(
    p_caller_token_hash varchar(64),
    p_version_id uuid,
    p_mode varchar(16) DEFAULT 'exam'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_exam_id uuid;
    v_version_status varchar(32);
    v_time_limit integer;
    v_attempt_id uuid;
    v_lead_id uuid;
    v_learner_id uuid;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    SELECT ev.exam_id, ev.status, e.time_limit_seconds
    INTO v_exam_id, v_version_status, v_time_limit
    FROM exam_versions ev
    JOIN exams e ON ev.exam_id = e.id
    WHERE ev.id = p_version_id;

    IF v_version_status IS DISTINCT FROM 'published' THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Đề thi chưa được xuất bản' USING ERRCODE = '22000';
    END IF;

    INSERT INTO exam_attempts (
        version_id, visitor_id, mode, status, started_at, expires_at
    ) VALUES (
        p_version_id, v_visitor_id, p_mode, 'in_progress', clock_timestamp(), clock_timestamp() + (v_time_limit || ' seconds')::interval
    ) RETURNING id INTO v_attempt_id;

    INSERT INTO attempt_entitlements (attempt_id, full_solution_unlocked)
    VALUES (v_attempt_id, false);

    -- Tra cứu learner và cập nhật lead nếu có (Task N3, R2)
    SELECT l.id, l.learner_id INTO v_lead_id, v_learner_id
    FROM leads l
    JOIN exam_attempts ea ON ea.learner_id = l.learner_id
    WHERE ea.visitor_id = v_visitor_id
    LIMIT 1;

    IF v_lead_id IS NOT NULL THEN
        UPDATE leads
        SET latest_attempt_id = v_attempt_id,
            total_attempts_count = total_attempts_count + 1
        WHERE id = v_lead_id;
    END IF;

    RETURN v_attempt_id;
END;
$$;
ALTER FUNCTION start_attempt(varchar, uuid, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION start_attempt(varchar, uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION start_attempt(varchar, uuid, varchar) TO shd_app;

-- 3. enter_section
CREATE OR REPLACE FUNCTION enter_section(
    p_attempt_id uuid,
    p_section_id uuid,
    p_caller_token_hash varchar(64)
) RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_attempt_status varchar(32);
    v_attempt_expires timestamptz;
    v_section_duration integer;
    v_section_expires timestamptz;
BEGIN
    SELECT ea.visitor_id, ea.status, ea.expires_at, s.time_limit_seconds
    INTO v_visitor_id, v_attempt_status, v_attempt_expires, v_section_duration
    FROM exam_attempts ea
    JOIN sections s ON s.id = p_section_id AND s.version_id = ea.version_id
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Không có quyền truy cập lượt thi' USING ERRCODE = '42501';
    END IF;

    IF v_attempt_status != 'in_progress' OR clock_timestamp() > v_attempt_expires THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Lượt thi đã kết thúc' USING ERRCODE = '22000';
    END IF;

    IF v_section_duration IS NOT NULL THEN
        v_section_expires := LEAST(clock_timestamp() + (v_section_duration || ' seconds')::interval, v_attempt_expires);
    ELSE
        v_section_expires := v_attempt_expires;
    END IF;

    INSERT INTO attempt_section_timers (attempt_id, section_id, duration_seconds, started_at, expires_at, status)
    VALUES (p_attempt_id, p_section_id, COALESCE(v_section_duration, 0), clock_timestamp(), v_section_expires, 'in_progress')
    ON CONFLICT (attempt_id, section_id) DO UPDATE
    SET started_at = COALESCE(attempt_section_timers.started_at, clock_timestamp()),
        status = 'in_progress'
    RETURNING expires_at INTO v_section_expires;

    RETURN v_section_expires;
END;
$$;
ALTER FUNCTION enter_section(uuid, uuid, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION enter_section(uuid, uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION enter_section(uuid, uuid, varchar) TO shd_app;

-- 4. save_answers
CREATE OR REPLACE FUNCTION save_answers(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid,
    p_items jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_status varchar(32);
    v_expires_at timestamptz;
    v_item record;
    v_cur_revision integer;
BEGIN
    SELECT ea.visitor_id, ea.status, ea.expires_at
    INTO v_visitor_id, v_status, v_expires_at
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Không có quyền truy cập lượt thi' USING ERRCODE = '42501';
    END IF;

    IF v_status != 'in_progress' OR clock_timestamp() > v_expires_at THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Lượt thi đã kết thúc hoặc hết giờ' USING ERRCODE = '22000';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
        question_id uuid,
        selected_option_label varchar(8),
        is_flagged boolean,
        revision integer
    )
    LOOP
        SELECT revision INTO v_cur_revision
        FROM attempt_answers
        WHERE attempt_id = p_attempt_id AND question_id = v_item.question_id;

        IF v_cur_revision IS NOT NULL AND v_item.revision <= v_cur_revision THEN
            RAISE EXCEPTION 'REVISION_CONFLICT: Phiên bản trả lời cũ hơn hiện tại' USING ERRCODE = '40001';
        END IF;

        INSERT INTO attempt_answers (
            attempt_id, question_id, selected_option_label, is_flagged, revision, answered_at
        ) VALUES (
            p_attempt_id, v_item.question_id, v_item.selected_option_label, COALESCE(v_item.is_flagged, false), COALESCE(v_item.revision, 1), clock_timestamp()
        )
        ON CONFLICT (attempt_id, question_id) DO UPDATE
        SET selected_option_label = EXCLUDED.selected_option_label,
            is_flagged = EXCLUDED.is_flagged,
            revision = EXCLUDED.revision,
            answered_at = clock_timestamp();
    END LOOP;

    RETURN true;
END;
$$;
ALTER FUNCTION save_answers(varchar, uuid, jsonb) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION save_answers(varchar, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_answers(varchar, uuid, jsonb) TO shd_app;

-- 5. start_audio_play
CREATE OR REPLACE FUNCTION start_audio_play(
    p_attempt_id uuid,
    p_stimulus_id uuid,
    p_caller_token_hash varchar(64)
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_max_plays integer;
    v_cur_play_count integer := 0;
    v_cur_token varchar(64);
    v_cur_expires timestamptz;
    v_new_token varchar(64);
    v_new_expires timestamptz;
BEGIN
    SELECT ea.visitor_id, e.audio_max_plays
    INTO v_visitor_id, v_max_plays
    FROM exam_attempts ea
    JOIN exam_versions ev ON ev.id = ea.version_id
    JOIN exams e ON e.id = ev.exam_id
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Không có quyền truy cập lượt thi' USING ERRCODE = '42501';
    END IF;

    SELECT play_count, current_session_token_hash, expires_at
    INTO v_cur_play_count, v_cur_token, v_cur_expires
    FROM attempt_audio_plays
    WHERE attempt_id = p_attempt_id AND stimulus_id = p_stimulus_id;

    -- Nếu token hiện tại còn hạn (reload không trừ lượt)
    IF v_cur_token IS NOT NULL AND clock_timestamp() < v_cur_expires THEN
        RETURN jsonb_build_object(
            'session_token_hash', v_cur_token,
            'play_count', v_cur_play_count,
            'expires_at', v_cur_expires
        );
    END IF;

    IF v_cur_play_count >= v_max_plays THEN
        RAISE EXCEPTION 'AUDIO_LIMIT_EXCEEDED: Đã hết lượt nghe cho phép' USING ERRCODE = '22000';
    END IF;

    v_new_token := encode(gen_random_bytes(32), 'hex');
    v_new_expires := clock_timestamp() + interval '10 minutes';
    v_cur_play_count := v_cur_play_count + 1;

    INSERT INTO attempt_audio_plays (attempt_id, stimulus_id, play_count, current_session_token_hash, expires_at)
    VALUES (p_attempt_id, p_stimulus_id, v_cur_play_count, v_new_token, v_new_expires)
    ON CONFLICT (attempt_id, stimulus_id) DO UPDATE
    SET play_count = v_cur_play_count,
        current_session_token_hash = v_new_token,
        expires_at = v_new_expires;

    RETURN jsonb_build_object(
        'session_token_hash', v_new_token,
        'play_count', v_cur_play_count,
        'expires_at', v_new_expires
    );
END;
$$;
ALTER FUNCTION start_audio_play(uuid, uuid, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION start_audio_play(uuid, uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION start_audio_play(uuid, uuid, varchar) TO shd_app;

-- 6. submit_attempt
CREATE OR REPLACE FUNCTION submit_attempt(
    p_attempt_id uuid,
    p_caller_token_hash varchar(64)
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_status varchar(32);
    v_expires_at timestamptz;
    v_sub_type varchar(16);
BEGIN
    SELECT ea.visitor_id, ea.status, ea.expires_at
    INTO v_visitor_id, v_status, v_expires_at
    FROM exam_attempts ea
    JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Không có quyền nộp lượt thi' USING ERRCODE = '42501';
    END IF;

    IF v_status != 'in_progress' THEN
        RETURN true; -- Idempotent nếu đã nộp
    END IF;

    IF clock_timestamp() <= v_expires_at THEN
        v_sub_type := 'manual';
    ELSIF clock_timestamp() <= v_expires_at + interval '60 seconds' THEN
        v_sub_type := 'timeout';
    ELSE
        v_sub_type := 'timeout';
    END IF;

    UPDATE exam_attempts
    SET status = 'submitted',
        submission_type = v_sub_type,
        submitted_at = clock_timestamp()
    WHERE id = p_attempt_id;

    -- Kích hoạt chấm thi ngay trong cùng transaction
    PERFORM _grade_attempt_internal(p_attempt_id);

    RETURN true;
END;
$$;
ALTER FUNCTION submit_attempt(uuid, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION submit_attempt(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_attempt(uuid, varchar) TO shd_app;

-- 7. _grade_attempt_internal (HÀM NỘI BỘ BIỆT LẬP CỦA shd_grader)
CREATE OR REPLACE FUNCTION _grade_attempt_internal(
    p_attempt_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_status varchar(32);
    v_version_id uuid;
    v_exam_id uuid;
    v_passing_percentage numeric(5,2);
    v_benchmark_config jsonb;
    v_result_id uuid;
    v_total_earned integer := 0;
    v_max_score integer := 0;
    v_percentage numeric(5,2);
    v_cefr_code varchar(16) := 'A1';
    v_benchmark_status varchar(32) := 'not_pass';
    v_q record;
    v_sec record;
    v_sec_earned integer;
    v_sec_max integer;
    v_lead_id uuid;
BEGIN
    SELECT status, version_id INTO v_status, v_version_id
    FROM exam_attempts WHERE id = p_attempt_id;

    IF v_status = 'graded' THEN
        RETURN; -- Idempotent: đã chấm xong thì bỏ qua
    END IF;

    IF v_status != 'submitted' THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Lượt thi chưa ở trạng thái submitted' USING ERRCODE = '22000';
    END IF;

    SELECT ev.exam_id, e.passing_percentage, e.benchmark_scale_config
    INTO v_exam_id, v_passing_percentage, v_benchmark_config
    FROM exam_versions ev
    JOIN exams e ON e.id = ev.exam_id
    WHERE ev.id = v_version_id;

    -- Khởi tạo hoặc lấy kết quả results
    INSERT INTO results (
        attempt_id, total_score, max_possible_score, percentage,
        passing_percentage_snapshot, cefr_estimate_code, benchmark_status_code, graded_at
    ) VALUES (
        p_attempt_id, 0, 30, 0.00, COALESCE(v_passing_percentage, 60.00), 'A1', 'not_pass', clock_timestamp()
    )
    ON CONFLICT (attempt_id) DO UPDATE SET graded_at = clock_timestamp()
    RETURNING id INTO v_result_id;

    -- Chấm từng câu hỏi
    FOR v_q IN
        SELECT q.id AS question_id, q.points, ak.correct_option_label, ans.selected_option_label
        FROM questions q
        JOIN answer_keys ak ON ak.question_id = q.id
        LEFT JOIN attempt_answers ans ON ans.question_id = q.id AND ans.attempt_id = p_attempt_id
        WHERE q.version_id = v_version_id
    LOOP
        v_max_score := v_max_score + v_q.points;
        IF v_q.selected_option_label IS NOT NULL AND v_q.selected_option_label = v_q.correct_option_label THEN
            v_total_earned := v_total_earned + v_q.points;
            INSERT INTO result_item_scores (result_id, question_id, is_correct, earned_points)
            VALUES (v_result_id, v_q.question_id, true, v_q.points)
            ON CONFLICT (result_id, question_id) DO UPDATE SET is_correct = true, earned_points = v_q.points;
        ELSE
            INSERT INTO result_item_scores (result_id, question_id, is_correct, earned_points)
            VALUES (v_result_id, v_q.question_id, false, 0)
            ON CONFLICT (result_id, question_id) DO UPDATE SET is_correct = false, earned_points = 0;
        END IF;
    END LOOP;

    -- Chấm điểm từng phần (section)
    FOR v_sec IN SELECT id FROM sections WHERE version_id = v_version_id
    LOOP
        SELECT COALESCE(SUM(ris.earned_points), 0), COALESCE(SUM(q.points), 0)
        INTO v_sec_earned, v_sec_max
        FROM questions q
        LEFT JOIN result_item_scores ris ON ris.question_id = q.id AND ris.result_id = v_result_id
        WHERE q.section_id = v_sec.id;

        INSERT INTO result_section_scores (result_id, section_id, score, max_score, cefr_code)
        VALUES (v_result_id, v_sec.id, v_sec_earned, v_sec_max, 'B1')
        ON CONFLICT (result_id, section_id) DO UPDATE SET score = v_sec_earned, max_score = v_sec_max;
    END LOOP;

    -- Tính % và xếp loại
    IF v_max_score > 0 THEN
        v_percentage := ROUND((v_total_earned::numeric / v_max_score::numeric) * 100, 2);
    ELSE
        v_percentage := 0.00;
    END IF;

    IF v_percentage >= v_passing_percentage THEN
        v_benchmark_status := 'pass';
        v_cefr_code := 'B1';
    ELSIF v_percentage >= (v_passing_percentage - 15.00) THEN
        v_benchmark_status := 'near_pass';
        v_cefr_code := 'A2';
    ELSE
        v_benchmark_status := 'not_pass';
        v_cefr_code := 'A1';
    END IF;

    UPDATE results
    SET total_score = v_total_earned,
        max_possible_score = v_max_score,
        percentage = v_percentage,
        cefr_estimate_code = v_cefr_code,
        benchmark_status_code = v_benchmark_status,
        graded_at = clock_timestamp()
    WHERE id = v_result_id;

    UPDATE exam_attempts
    SET status = 'graded'
    WHERE id = p_attempt_id;

    -- Ghi tín hiệu lead trực tiếp (Task R4)
    SELECT l.id INTO v_lead_id
    FROM leads l
    JOIN exam_attempts ea ON ea.learner_id = l.learner_id
    WHERE ea.id = p_attempt_id;

    IF v_lead_id IS NOT NULL THEN
        IF v_percentage < 40.00 THEN
            INSERT INTO lead_signals (lead_id, signal_type, signal_weight, metadata)
            VALUES (v_lead_id, 'score_extreme_low', 1.50, jsonb_build_object('attempt_id', p_attempt_id, 'percentage', v_percentage));
        ELSIF v_benchmark_status = 'near_pass' THEN
            INSERT INTO lead_signals (lead_id, signal_type, signal_weight, metadata)
            VALUES (v_lead_id, 'score_near_pass', 1.50, jsonb_build_object('attempt_id', p_attempt_id, 'percentage', v_percentage));
        END IF;

        INSERT INTO lead_signals (lead_id, signal_type, signal_weight, metadata)
        VALUES (v_lead_id, 'full_exam_completed', 1.00, jsonb_build_object('attempt_id', p_attempt_id));
    END IF;
END;
$$;
ALTER FUNCTION _grade_attempt_internal(uuid) OWNER TO shd_grader;
REVOKE ALL ON FUNCTION _grade_attempt_internal(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION _grade_attempt_internal(uuid) FROM shd_worker, shd_app, shd_staff_api;
GRANT EXECUTE ON FUNCTION _grade_attempt_internal(uuid) TO shd_attempt_mgr;

-- 8. finalize_expired_attempts
CREATE OR REPLACE FUNCTION finalize_expired_attempts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_rec record;
    v_count integer := 0;
BEGIN
    FOR v_rec IN
        SELECT id FROM exam_attempts
        WHERE status = 'in_progress' AND (expires_at + interval '60 seconds') < clock_timestamp()
    LOOP
        UPDATE exam_attempts
        SET status = 'submitted',
            submission_type = 'timeout',
            submitted_at = clock_timestamp()
        WHERE id = v_rec.id;

        PERFORM _grade_attempt_internal(v_rec.id);
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;
ALTER FUNCTION finalize_expired_attempts() OWNER TO shd_grader;
REVOKE ALL ON FUNCTION finalize_expired_attempts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION finalize_expired_attempts() TO shd_worker;

-- 9. unlock_full_solution
CREATE OR REPLACE FUNCTION unlock_full_solution(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid,
    p_otp_challenge_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_challenge_status varchar(16);
    v_challenge_attempt uuid;
    v_challenge_visitor uuid;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    SELECT status, attempt_id, visitor_id
    INTO v_challenge_status, v_challenge_attempt, v_challenge_visitor
    FROM otp_challenges
    WHERE id = p_otp_challenge_id;

    IF v_challenge_status IS DISTINCT FROM 'verified'
       OR v_challenge_attempt != p_attempt_id
       OR v_challenge_visitor != v_visitor_id THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Thử thách OTP chưa được xác thực hợp lệ' USING ERRCODE = '22000';
    END IF;

    UPDATE attempt_entitlements
    SET full_solution_unlocked = true,
        unlocked_at = clock_timestamp()
    WHERE attempt_id = p_attempt_id;

    RETURN true;
END;
$$;
ALTER FUNCTION unlock_full_solution(varchar, uuid, uuid) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION unlock_full_solution(varchar, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION unlock_full_solution(varchar, uuid, uuid) TO shd_app;

-- 10. acquire_idempotency_key
CREATE OR REPLACE FUNCTION acquire_idempotency_key(
    p_idem_key varchar(128),
    p_scope varchar(32),
    p_request_hash varchar(64),
    p_ttl_seconds integer DEFAULT 86400
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_rec record;
BEGIN
    SELECT * INTO v_rec FROM idempotency_keys WHERE idem_key = p_idem_key;
    IF FOUND THEN
        IF v_rec.request_hash != p_request_hash THEN
            RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT: Khóa đã được dùng với payload khác' USING ERRCODE = '40001';
        END IF;

        RETURN jsonb_build_object(
            'is_acquired', false,
            'response_status', v_rec.response_status,
            'response_payload', v_rec.response_payload
        );
    END IF;

    INSERT INTO idempotency_keys (idem_key, request_hash, scope, expires_at)
    VALUES (p_idem_key, p_request_hash, p_scope, clock_timestamp() + (p_ttl_seconds || ' seconds')::interval);

    RETURN jsonb_build_object('is_acquired', true);
END;
$$;
ALTER FUNCTION acquire_idempotency_key(varchar, varchar, varchar, integer) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION acquire_idempotency_key(varchar, varchar, varchar, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION acquire_idempotency_key(varchar, varchar, varchar, integer) TO shd_app, shd_worker;

-- 11. complete_idempotency_key
CREATE OR REPLACE FUNCTION complete_idempotency_key(
    p_idem_key varchar(128),
    p_response_status integer,
    p_response_payload jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE idempotency_keys
    SET response_status = p_response_status,
        response_payload = p_response_payload
    WHERE idem_key = p_idem_key;
END;
$$;
ALTER FUNCTION complete_idempotency_key(varchar, integer, jsonb) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION complete_idempotency_key(varchar, integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_idempotency_key(varchar, integer, jsonb) TO shd_app, shd_worker;


-- ==============================================================================
-- PHÂN HỆ 5.2: NHÓM HÀM XÁC THỰC & HỒ SƠ NGƯỜI HỌC
-- ==============================================================================

-- 12. issue_otp
CREATE OR REPLACE FUNCTION issue_otp(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid,
    p_phone_raw varchar(32),
    p_channel varchar(16)
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_phone_hash varchar(64);
    v_otp_code varchar(6);
    v_otp_hash varchar(64);
    v_challenge_id uuid;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    -- Chuẩn hóa và băm phone (SHA256 đơn giản trong demo mock, ở runtime kết hợp app secret)
    v_phone_hash := encode(digest(p_phone_raw, 'sha256'), 'hex');
    -- Sinh mã OTP ngẫu nhiên 6 chữ số
    v_otp_code := lpad((floor(random() * 900000) + 100000)::text, 6, '0');
    v_otp_hash := encode(digest(v_otp_code, 'sha256'), 'hex');

    INSERT INTO otp_challenges (
        attempt_id, visitor_id, phone_hash, otp_hash, channel, attempts_count, status, expires_at
    ) VALUES (
        p_attempt_id, v_visitor_id, v_phone_hash, v_otp_hash, p_channel, 0, 'pending', clock_timestamp() + interval '5 minutes'
    ) RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object(
        'challenge_id', v_challenge_id,
        'otp_code', v_otp_code -- Trả về cho service gửi SMS/Zalo
    );
END;
$$;
ALTER FUNCTION issue_otp(varchar, uuid, varchar, varchar) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION issue_otp(varchar, uuid, varchar, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION issue_otp(varchar, uuid, varchar, varchar) TO shd_app;

-- 13. verify_otp
CREATE OR REPLACE FUNCTION verify_otp(
    p_caller_token_hash varchar(64),
    p_challenge_id uuid,
    p_otp_code_raw varchar(16)
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_rec record;
    v_code_hash varchar(64);
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    SELECT * INTO v_rec FROM otp_challenges
    WHERE id = p_challenge_id FOR UPDATE;

    IF NOT FOUND OR v_rec.visitor_id != v_visitor_id THEN
        RAISE EXCEPTION 'FORBIDDEN: Thử thách không hợp lệ' USING ERRCODE = '42501';
    END IF;

    IF v_rec.status != 'pending' OR clock_timestamp() > v_rec.expires_at THEN
        UPDATE otp_challenges SET status = 'expired' WHERE id = p_challenge_id;
        RAISE EXCEPTION 'PRECONDITION_FAILED: Mã OTP đã hết hạn' USING ERRCODE = '22000';
    END IF;

    v_code_hash := encode(digest(p_otp_code_raw, 'sha256'), 'hex');

    IF v_rec.otp_hash = v_code_hash THEN
        UPDATE otp_challenges
        SET status = 'verified',
            attempts_count = attempts_count + 1
        WHERE id = p_challenge_id;
        RETURN true;
    ELSE
        IF v_rec.attempts_count + 1 >= 3 THEN
            UPDATE otp_challenges
            SET status = 'failed',
                attempts_count = attempts_count + 1
            WHERE id = p_challenge_id;
        ELSE
            UPDATE otp_challenges
            SET attempts_count = attempts_count + 1
            WHERE id = p_challenge_id;
        END IF;
        RETURN false;
    END IF;
END;
$$;
ALTER FUNCTION verify_otp(varchar, uuid, varchar) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION verify_otp(varchar, uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_otp(varchar, uuid, varchar) TO shd_app;

-- 14. create_learner
CREATE OR REPLACE FUNCTION create_learner(
    p_caller_token_hash varchar(64),
    p_full_name varchar(128),
    p_phone_raw varchar(32),
    p_email varchar(255),
    p_age_group varchar(32)
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_phone_hash varchar(64);
    v_learner_id uuid;
    v_is_under_18 boolean;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    v_phone_hash := encode(digest(p_phone_raw, 'sha256'), 'hex');
    v_is_under_18 := (p_age_group = 'student_under18');

    SELECT id INTO v_learner_id FROM learners WHERE phone_hash = v_phone_hash;
    IF FOUND THEN
        RETURN v_learner_id;
    END IF;

    INSERT INTO learners (
        full_name, phone_hash, phone_encrypted, email, age_group, is_under_18, phone_verified_at
    ) VALUES (
        p_full_name, v_phone_hash, '{"ct": "encrypted_envelope_payload"}', p_email, p_age_group, v_is_under_18, NULL
    ) RETURNING id INTO v_learner_id;

    RETURN v_learner_id;
END;
$$;
ALTER FUNCTION create_learner(varchar, varchar, varchar, varchar, varchar) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION create_learner(varchar, varchar, varchar, varchar, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_learner(varchar, varchar, varchar, varchar, varchar) TO shd_app;

-- 15. mark_phone_verified
CREATE OR REPLACE FUNCTION mark_phone_verified(
    p_caller_token_hash varchar(64),
    p_learner_id uuid,
    p_otp_challenge_id uuid,
    p_attempt_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_challenge_phone_hash varchar(64);
    v_challenge_status varchar(16);
    v_learner_phone_hash varchar(64);
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    SELECT phone_hash, status INTO v_challenge_phone_hash, v_challenge_status
    FROM otp_challenges WHERE id = p_otp_challenge_id;

    SELECT phone_hash INTO v_learner_phone_hash
    FROM learners WHERE id = p_learner_id;

    IF v_challenge_status != 'verified' OR v_challenge_phone_hash != v_learner_phone_hash THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Thử thách OTP chưa verified hoặc không trùng SĐT' USING ERRCODE = '22000';
    END IF;

    UPDATE learners
    SET phone_verified_at = clock_timestamp()
    WHERE id = p_learner_id;

    IF p_attempt_id IS NOT NULL THEN
        UPDATE exam_attempts
        SET learner_id = p_learner_id
        WHERE id = p_attempt_id;
    END IF;

    RETURN true;
END;
$$;
ALTER FUNCTION mark_phone_verified(varchar, uuid, uuid, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION mark_phone_verified(varchar, uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_phone_verified(varchar, uuid, uuid, uuid) TO shd_app;

-- 16. record_consent
CREATE OR REPLACE FUNCTION record_consent(
    p_caller_token_hash varchar(64),
    p_learner_id uuid,
    p_consent_text_id uuid,
    p_action varchar(16),
    p_capture_method varchar(32),
    p_given_by_guardian_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_is_under_18 boolean;
    v_guardian_status varchar(32);
    v_consent_id uuid;
    v_ip_hash varchar(64);
BEGIN
    SELECT id, ip_hash INTO v_visitor_id, v_ip_hash
    FROM visitors WHERE visitor_token_hash = p_caller_token_hash;

    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    IF p_action NOT IN ('granted', 'revoked') THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Action chỉ có thể là granted hoặc revoked' USING ERRCODE = '22000';
    END IF;

    SELECT is_under_18 INTO v_is_under_18 FROM learners WHERE id = p_learner_id;

    IF v_is_under_18 = true THEN
        IF p_given_by_guardian_id IS NULL THEN
            RAISE EXCEPTION 'PRECONDITION_FAILED: Học viên dưới 18 tuổi bắt buộc có phụ huynh đồng ý' USING ERRCODE = '22000';
        END IF;

        SELECT verification_status INTO v_guardian_status
        FROM guardians WHERE id = p_given_by_guardian_id;

        IF v_guardian_status != 'approved' THEN
            RAISE EXCEPTION 'PRECONDITION_FAILED: Phụ huynh chưa có trạng thái approved' USING ERRCODE = '22000';
        END IF;
    END IF;

    INSERT INTO consents (
        learner_id, consent_text_id, given_by_guardian_id, action, capture_method, user_ip_hash, recorded_at
    ) VALUES (
        p_learner_id, p_consent_text_id, p_given_by_guardian_id, p_action, p_capture_method, v_ip_hash, clock_timestamp()
    ) RETURNING id INTO v_consent_id;

    RETURN v_consent_id;
END;
$$;
ALTER FUNCTION record_consent(varchar, uuid, uuid, varchar, varchar, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION record_consent(varchar, uuid, uuid, varchar, varchar, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_consent(varchar, uuid, uuid, varchar, varchar, uuid) TO shd_app;

-- 17. record_lead_interaction (CHỈ shd_app - Task R4)
CREATE OR REPLACE FUNCTION record_lead_interaction(
    p_caller_token_hash varchar(64),
    p_lead_id uuid,
    p_signal_type varchar(64),
    p_metadata jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_signal_id uuid;
    v_weight numeric(4,2) := 1.00;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    IF p_signal_type = 'registered_1on1_test' THEN
        v_weight := 3.00;
    ELSIF p_signal_type = 'timeline_urgent_1m' THEN
        v_weight := 2.50;
    ELSIF p_signal_type = 'goal_ausbildung_18b' THEN
        v_weight := 2.00;
    ELSIF p_signal_type = 'timeline_1_3m' THEN
        v_weight := 1.50;
    ELSE
        v_weight := 1.00;
    END IF;

    INSERT INTO lead_signals (lead_id, signal_type, signal_weight, metadata)
    VALUES (p_lead_id, p_signal_type, v_weight, p_metadata)
    RETURNING id INTO v_signal_id;

    RETURN v_signal_id;
END;
$$;
ALTER FUNCTION record_lead_interaction(varchar, uuid, varchar, jsonb) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION record_lead_interaction(varchar, uuid, varchar, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_lead_interaction(varchar, uuid, varchar, jsonb) TO shd_app;

-- 18. enqueue_crm_event
CREATE OR REPLACE FUNCTION enqueue_crm_event(
    p_event_type varchar(64),
    p_aggregate_id uuid,
    p_idempotency_key varchar(128),
    p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO crm_outbox (
        idempotency_key, event_type, aggregate_id, payload, status, retry_count, next_retry_at
    ) VALUES (
        p_idempotency_key, p_event_type, p_aggregate_id, p_payload, 'pending', 0, clock_timestamp()
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;
ALTER FUNCTION enqueue_crm_event(varchar, uuid, varchar, jsonb) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION enqueue_crm_event(varchar, uuid, varchar, jsonb) FROM PUBLIC;


-- ==============================================================================
-- PHÂN HỆ 5.3: NHÓM HÀM QUẢN TRỊ, BẢO MẬT PII & CỔNG NHÂN VIÊN
-- ==============================================================================

-- 19. record_content_review
CREATE OR REPLACE FUNCTION record_content_review(
    p_sso_claim_token jsonb,
    p_version_id uuid,
    p_reviewer_type varchar(16),
    p_review_status varchar(32),
    p_feedback_notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_staff_id uuid;
    v_staff_role varchar(32);
    v_email varchar(255);
    v_review_id uuid;
BEGIN
    v_email := p_sso_claim_token->>'email';
    SELECT id, role INTO v_staff_id, v_staff_role FROM staff_users WHERE email = v_email AND is_active = true;

    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Nhân sự không tồn tại hoặc bị vô hiệu hóa' USING ERRCODE = '28000';
    END IF;

    IF p_reviewer_type = 'teacher' AND v_staff_role NOT IN ('teacher', 'admin') THEN
        RAISE EXCEPTION 'FORBIDDEN: Chỉ giáo viên hoặc admin mới được duyệt đề' USING ERRCODE = '42501';
    END IF;

    INSERT INTO content_reviews (
        version_id, reviewer_type, reviewer_id, review_status, feedback_notes
    ) VALUES (
        p_version_id, p_reviewer_type, v_staff_id, p_review_status, p_feedback_notes
    ) RETURNING id INTO v_review_id;

    RETURN v_review_id;
END;
$$;
ALTER FUNCTION record_content_review(jsonb, uuid, varchar, varchar, text) OWNER TO shd_exam_admin;
REVOKE ALL ON FUNCTION record_content_review(jsonb, uuid, varchar, varchar, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_content_review(jsonb, uuid, varchar, varchar, text) TO shd_staff_api;

-- 20. publish_exam_version
CREATE OR REPLACE FUNCTION publish_exam_version(
    p_version_id uuid,
    p_sso_claim_token jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_staff_id uuid;
    v_staff_role varchar(32);
    v_email varchar(255);
    v_teacher_approved boolean;
BEGIN
    v_email := p_sso_claim_token->>'email';
    SELECT id, role INTO v_staff_id, v_staff_role FROM staff_users WHERE email = v_email AND is_active = true;

    IF v_staff_id IS NULL OR v_staff_role != 'admin' THEN
        RAISE EXCEPTION 'FORBIDDEN: Chỉ Quản trị viên hệ thống mới có quyền xuất bản đề' USING ERRCODE = '42501';
    END IF;

    -- Kiểm tra đã có review approved từ giáo viên chưa
    SELECT EXISTS (
        SELECT 1 FROM content_reviews
        WHERE version_id = p_version_id AND reviewer_type = 'teacher' AND review_status = 'approved'
    ) INTO v_teacher_approved;

    IF NOT v_teacher_approved THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Đề thi chưa được Giáo viên SHD duyệt approved' USING ERRCODE = '22000';
    END IF;

    UPDATE exam_versions
    SET status = 'published',
        published_at = clock_timestamp()
    WHERE id = p_version_id;

    RETURN true;
END;
$$;
ALTER FUNCTION publish_exam_version(uuid, jsonb) OWNER TO shd_exam_admin;
REVOKE ALL ON FUNCTION publish_exam_version(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_exam_version(uuid, jsonb) TO shd_staff_api;

-- 21. transition_exam_version
CREATE OR REPLACE FUNCTION transition_exam_version(
    p_version_id uuid,
    p_target_status varchar(32),
    p_sso_claim_token jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_staff_id uuid;
    v_email varchar(255);
BEGIN
    v_email := p_sso_claim_token->>'email';
    SELECT id INTO v_staff_id FROM staff_users WHERE email = v_email AND is_active = true;

    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Không có quyền thao tác' USING ERRCODE = '28000';
    END IF;

    UPDATE exam_versions
    SET status = p_target_status
    WHERE id = p_version_id;

    RETURN true;
END;
$$;
ALTER FUNCTION transition_exam_version(uuid, varchar, jsonb) OWNER TO shd_exam_admin;
REVOKE ALL ON FUNCTION transition_exam_version(uuid, varchar, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION transition_exam_version(uuid, varchar, jsonb) TO shd_staff_api;

-- 22. decrypt_phone
CREATE OR REPLACE FUNCTION decrypt_phone(
    p_learner_id uuid,
    p_sso_claim_token jsonb,
    p_purpose varchar(32)
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_actor_id uuid;
    v_role varchar(32);
    v_email varchar(255);
    v_phone_enc text;
BEGIN
    IF p_purpose NOT IN ('crm_sync', 'consultation_call', 'data_export') THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Mục đích giải mã không hợp lệ' USING ERRCODE = '22000';
    END IF;

    -- Kiểm tra nếu người gọi là worker
    IF current_user = 'shd_worker' THEN
        IF p_purpose != 'crm_sync' THEN
            RAISE EXCEPTION 'FORBIDDEN: Worker chỉ được giải mã phục vụ crm_sync' USING ERRCODE = '42501';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM crm_outbox
            WHERE aggregate_id = p_learner_id AND status = 'processing' AND locked_until > clock_timestamp()
        ) THEN
            RAISE EXCEPTION 'PRECONDITION_FAILED: Worker không nắm giữ khóa lease hợp lệ cho learner này' USING ERRCODE = '22000';
        END IF;

        v_actor_id := '00000000-0000-0000-0000-000000000000'::uuid;
    ELSE
        -- Người gọi qua shd_staff_api
        v_email := p_sso_claim_token->>'email';
        SELECT id, role INTO v_actor_id, v_role FROM staff_users WHERE email = v_email AND is_active = true;

        IF v_actor_id IS NULL OR v_role NOT IN ('advisor', 'admin', 'dpo') THEN
            RAISE EXCEPTION 'FORBIDDEN: Bạn không có quyền giải mã số điện thoại PII' USING ERRCODE = '42501';
        END IF;
    END IF;

    SELECT phone_encrypted INTO v_phone_enc FROM learners WHERE id = p_learner_id;

    -- Ghi bắt buộc vào audit_logs trong cùng transaction
    INSERT INTO audit_logs (
        staff_user_id, action, target_entity, target_entity_id, details
    ) VALUES (
        CASE WHEN v_actor_id = '00000000-0000-0000-0000-000000000000'::uuid THEN NULL ELSE v_actor_id END,
        'decrypt_phone',
        'learners',
        p_learner_id,
        jsonb_build_object('purpose', p_purpose, 'caller', current_user)::text
    );

    RETURN v_phone_enc;
END;
$$;
ALTER FUNCTION decrypt_phone(uuid, jsonb, varchar) OWNER TO shd_privacy_admin;
REVOKE ALL ON FUNCTION decrypt_phone(uuid, jsonb, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION decrypt_phone(uuid, jsonb, varchar) TO shd_staff_api, shd_worker;

-- 23. create_data_request
CREATE OR REPLACE FUNCTION create_data_request(
    p_caller_token_hash varchar(64),
    p_learner_id uuid,
    p_request_type varchar(32)
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
    v_request_id uuid;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor không tồn tại' USING ERRCODE = '28000';
    END IF;

    INSERT INTO data_requests (learner_id, request_type, status, requested_at)
    VALUES (p_learner_id, p_request_type, 'pending', clock_timestamp())
    RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$$;
ALTER FUNCTION create_data_request(varchar, uuid, varchar) OWNER TO shd_privacy_admin;
REVOKE ALL ON FUNCTION create_data_request(varchar, uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_data_request(varchar, uuid, varchar) TO shd_app;

-- 24. complete_data_request
CREATE OR REPLACE FUNCTION complete_data_request(
    p_request_id uuid,
    p_sso_claim_token jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_staff_id uuid;
    v_staff_role varchar(32);
    v_email varchar(255);
    v_learner_id uuid;
    v_req_type varchar(32);
BEGIN
    v_email := p_sso_claim_token->>'email';
    SELECT id, role INTO v_staff_id, v_staff_role FROM staff_users WHERE email = v_email AND is_active = true;

    IF v_staff_id IS NULL OR v_staff_role NOT IN ('admin', 'dpo') THEN
        RAISE EXCEPTION 'FORBIDDEN: Chỉ Admin hoặc DPO mới được duyệt hoàn tất yêu cầu dữ liệu' USING ERRCODE = '42501';
    END IF;

    SELECT learner_id, request_type INTO v_learner_id, v_req_type
    FROM data_requests WHERE id = p_request_id;

    IF v_req_type = 'delete_data' THEN
        PERFORM anonymize_learner(v_learner_id);
    END IF;

    UPDATE data_requests
    SET status = 'completed',
        completed_at = clock_timestamp()
    WHERE id = p_request_id;

    INSERT INTO audit_logs (
        staff_user_id, action, target_entity, target_entity_id, details
    ) VALUES (
        v_staff_id, 'complete_data_request', 'data_requests', p_request_id, jsonb_build_object('type', v_req_type)::text
    );

    RETURN true;
END;
$$;
ALTER FUNCTION complete_data_request(uuid, jsonb) OWNER TO shd_privacy_admin;
REVOKE ALL ON FUNCTION complete_data_request(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_data_request(uuid, jsonb) TO shd_staff_api;

-- 25. anonymize_learner (NỘI BỘ - BAO PHỦ 100% CÁC BẢNG PII)
CREATE OR REPLACE FUNCTION anonymize_learner(
    p_learner_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_ids uuid[];
BEGIN
    -- 1. Bật cờ phiên cục bộ cho transaction
    PERFORM set_config('shd.anonymizing_learner_id', p_learner_id::text, true);

    -- Lấy danh sách visitors liên quan tới learner
    SELECT array_agg(DISTINCT visitor_id) INTO v_visitor_ids
    FROM exam_attempts WHERE learner_id = p_learner_id;

    -- 2. Làm sạch bảng learners
    UPDATE learners
    SET full_name = 'Học viên ẩn danh',
        email = NULL,
        phone_hash = 'anon_' || encode(gen_random_bytes(16), 'hex'),
        phone_encrypted = '{"anonymized": true}',
        phone_verified_at = NULL,
        anonymized_at = clock_timestamp()
    WHERE id = p_learner_id;

    -- 3. Làm sạch bảng guardians
    UPDATE guardians
    SET phone_hash = 'anon_g_' || encode(gen_random_bytes(16), 'hex'),
        phone_encrypted = '{"anonymized": true}'
    WHERE learner_id = p_learner_id;

    -- 4. Làm sạch bảng visitors
    IF v_visitor_ids IS NOT NULL THEN
        UPDATE visitors
        SET visitor_token_hash = 'anon_v_' || encode(gen_random_bytes(16), 'hex'),
            ip_hash = NULL,
            user_agent = NULL
        WHERE id = ANY(v_visitor_ids);
    END IF;

    -- 5. Làm sạch bảng otp_challenges
    UPDATE otp_challenges
    SET phone_hash = 'anon_otp_' || encode(gen_random_bytes(16), 'hex'),
        otp_hash = encode(gen_random_bytes(16), 'hex')
    WHERE visitor_id = ANY(v_visitor_ids);

    -- 6. Làm sạch bảng consents (Ngoại lệ qua trigger thẩm định 4 điều kiện)
    UPDATE consents
    SET user_ip_hash = NULL
    WHERE learner_id = p_learner_id;

    -- 7. Xóa crm_links
    DELETE FROM crm_links WHERE learner_id = p_learner_id;

    -- 8. Làm sạch crm_outbox
    UPDATE crm_outbox
    SET error_log = '[REDACTED_ANONYMIZED]'
    WHERE aggregate_id = p_learner_id;

    -- 9. Làm sạch learning_events (Ngoại lệ qua trigger thẩm định 4 điều kiện)
    UPDATE learning_events
    SET event_payload = event_payload - 'phone' - 'email' - 'full_name'
    WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE learner_id = p_learner_id)
       OR visitor_id = ANY(v_visitor_ids);

    -- 10. Ghi nhật ký audit log trong cùng transaction
    INSERT INTO audit_logs (
        staff_user_id, action, target_entity, target_entity_id, details
    ) VALUES (
        NULL, 'anonymize_learner', 'learners', p_learner_id, '{"status": "fully_anonymized"}'
    );
END;
$$;
ALTER FUNCTION anonymize_learner(uuid) OWNER TO shd_privacy_admin;
REVOKE ALL ON FUNCTION anonymize_learner(uuid) FROM PUBLIC;

-- 26. update_setting
CREATE OR REPLACE FUNCTION update_setting(
    p_key varchar(64),
    p_value jsonb,
    p_sso_claim_token jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_staff_id uuid;
    v_staff_role varchar(32);
    v_email varchar(255);
BEGIN
    v_email := p_sso_claim_token->>'email';
    SELECT id, role INTO v_staff_id, v_staff_role FROM staff_users WHERE email = v_email AND is_active = true;

    IF v_staff_id IS NULL OR v_staff_role != 'admin' THEN
        RAISE EXCEPTION 'FORBIDDEN: Chỉ Admin mới có quyền cập nhật cấu hình hệ thống' USING ERRCODE = '42501';
    END IF;

    UPDATE app_settings
    SET setting_value = p_value,
        updated_at = clock_timestamp()
    WHERE setting_key = p_key;

    INSERT INTO audit_logs (
        staff_user_id, action, target_entity, target_entity_id, details
    ) VALUES (
        v_staff_id, 'update_setting', 'app_settings', '00000000-0000-0000-0000-000000000000'::uuid,
        jsonb_build_object('key', p_key, 'value', p_value)::text
    );

    RETURN true;
END;
$$;
ALTER FUNCTION update_setting(varchar, jsonb, jsonb) OWNER TO shd_privacy_admin;
REVOKE ALL ON FUNCTION update_setting(varchar, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_setting(varchar, jsonb, jsonb) TO shd_staff_api;

