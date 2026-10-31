-- Migration: 0004_triggers.sql
-- Các Database Triggers bảo vệ tính toàn vẹn và bất biến (Invariants Inventory v1.9)

-- ==============================================================================
-- 1. INV-02: TÍNH BẤT BIẾN CỦA ĐỀ ĐÃ XUẤT BẢN (exam_versions.status = 'published')
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_check_immutable_published_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_status varchar(32);
    v_version_id uuid;
BEGIN
    IF TG_TABLE_NAME = 'sections' THEN
        v_version_id := COALESCE(NEW.version_id, OLD.version_id);
    ELSIF TG_TABLE_NAME = 'questions' THEN
        v_version_id := COALESCE(NEW.version_id, OLD.version_id);
    ELSIF TG_TABLE_NAME = 'stimuli' THEN
        SELECT version_id INTO v_version_id FROM sections WHERE id = COALESCE(NEW.section_id, OLD.section_id);
    ELSIF TG_TABLE_NAME = 'question_options' OR TG_TABLE_NAME = 'answer_keys' OR TG_TABLE_NAME = 'explanations' THEN
        SELECT version_id INTO v_version_id FROM questions WHERE id = COALESCE(NEW.question_id, OLD.question_id);
    END IF;

    IF v_version_id IS NOT NULL THEN
        SELECT status INTO v_status FROM exam_versions WHERE id = v_version_id;
        IF v_status = 'published' THEN
            RAISE EXCEPTION 'CANNOT_MODIFY_PUBLISHED_EXAM: Đề thi đã xuất bản là bất biến, không thể sửa đổi nội dung'
            USING ERRCODE = '22000';
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_sections ON sections;
CREATE TRIGGER trg_immutable_sections
BEFORE INSERT OR UPDATE OR DELETE ON sections
FOR EACH ROW EXECUTE FUNCTION trg_check_immutable_published_version();

DROP TRIGGER IF EXISTS trg_immutable_stimuli ON stimuli;
CREATE TRIGGER trg_immutable_stimuli
BEFORE INSERT OR UPDATE OR DELETE ON stimuli
FOR EACH ROW EXECUTE FUNCTION trg_check_immutable_published_version();

DROP TRIGGER IF EXISTS trg_immutable_questions ON questions;
CREATE TRIGGER trg_immutable_questions
BEFORE INSERT OR UPDATE OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION trg_check_immutable_published_version();

DROP TRIGGER IF EXISTS trg_immutable_options ON question_options;
CREATE TRIGGER trg_immutable_options
BEFORE INSERT OR UPDATE OR DELETE ON question_options
FOR EACH ROW EXECUTE FUNCTION trg_check_immutable_published_version();

DROP TRIGGER IF EXISTS trg_immutable_keys ON answer_keys;
CREATE TRIGGER trg_immutable_keys
BEFORE INSERT OR UPDATE OR DELETE ON answer_keys
FOR EACH ROW EXECUTE FUNCTION trg_check_immutable_published_version();

DROP TRIGGER IF EXISTS trg_immutable_explanations ON explanations;
CREATE TRIGGER trg_immutable_explanations
BEFORE INSERT OR UPDATE OR DELETE ON explanations
FOR EACH ROW EXECUTE FUNCTION trg_check_immutable_published_version();


-- ==============================================================================
-- 2. INV-09: SỔ CÁI CONSENTS CHỈ-GHI-THÊM KÈM NGOẠI LỆ 4 ĐIỀU KIỆN (SECURITY INVOKER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_consents_append_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_flag text;
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Bảng consents cấm DELETE tuyệt đối' USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Kiểm tra đồng thời 4 điều kiện ngoại lệ làm sạch PII:
        -- (a) Cờ phiên shd.anonymizing_learner_id có giá trị
        v_flag := NULLIF(current_setting('shd.anonymizing_learner_id', true), '');
        IF v_flag IS NULL THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Bảng consents cấm UPDATE ngoại trừ quy trình ẩn danh hóa' USING ERRCODE = '42501';
        END IF;

        -- (b) current_user của phiên thực thi UPDATE là thành viên của shd_privacy_admin
        IF NOT pg_has_role(current_user, 'shd_privacy_admin', 'member') THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Chỉ thành viên role shd_privacy_admin mới được thực thi ngoại lệ làm sạch' USING ERRCODE = '42501';
        END IF;

        -- (c) learner_id của dòng trùng cờ
        IF OLD.learner_id != v_flag::uuid THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: learner_id của dòng không trùng khớp với cờ ẩn danh hóa' USING ERRCODE = '42501';
        END IF;

        -- (d) Chỉ đổi cột user_ip_hash và giá trị mới là NULL
        IF NEW.user_ip_hash IS NOT NULL
           OR NEW.learner_id != OLD.learner_id
           OR NEW.consent_text_id != OLD.consent_text_id
           OR NEW.action != OLD.action
           OR NEW.capture_method != OLD.capture_method
           OR NEW.recorded_at != OLD.recorded_at
           OR NEW.given_by_guardian_id IS DISTINCT FROM OLD.given_by_guardian_id THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Ngoại lệ chỉ cho phép gán user_ip_hash = NULL' USING ERRCODE = '42501';
        END IF;

        -- Ghi nhận audit log bắt buộc trong cùng transaction
        INSERT INTO audit_logs (
            staff_user_id, action, target_entity, target_entity_id, details
        ) VALUES (
            NULL, 'anonymize_learner_sanitize', 'consents', OLD.id, '{"field": "user_ip_hash", "status": "redacted"}'
        );

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_consents_append_only ON consents;
CREATE TRIGGER trg_consents_append_only
BEFORE UPDATE OR DELETE ON consents
FOR EACH ROW EXECUTE FUNCTION trg_consents_append_only();


-- ==============================================================================
-- 3. INV-30: SỔ CÁI LEARNING_EVENTS CHỈ-GHI-THÊM KÈM NGOẠI LỆ 4 ĐIỀU KIỆN (SECURITY INVOKER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_learning_events_append_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_flag text;
    v_derived_learner_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Bảng learning_events cấm DELETE tuyệt đối' USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Kiểm tra đồng thời 4 điều kiện ngoại lệ:
        -- (a) Cờ phiên shd.anonymizing_learner_id có giá trị
        v_flag := NULLIF(current_setting('shd.anonymizing_learner_id', true), '');
        IF v_flag IS NULL THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Bảng learning_events cấm UPDATE' USING ERRCODE = '42501';
        END IF;

        -- (b) current_user của phiên thực thi UPDATE là thành viên của shd_privacy_admin
        IF NOT pg_has_role(current_user, 'shd_privacy_admin', 'member') THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Chỉ thành viên shd_privacy_admin mới được thực thi ngoại lệ làm sạch' USING ERRCODE = '42501';
        END IF;

        -- (c) Suy ra learner_id qua exam_attempts (attempt_id hoặc visitor_id)
        IF OLD.attempt_id IS NOT NULL THEN
            SELECT learner_id INTO v_derived_learner_id FROM exam_attempts WHERE id = OLD.attempt_id;
        ELSIF OLD.visitor_id IS NOT NULL THEN
            SELECT learner_id INTO v_derived_learner_id
            FROM exam_attempts
            WHERE visitor_id = OLD.visitor_id AND learner_id IS NOT NULL
            ORDER BY created_at DESC LIMIT 1;
        END IF;

        IF v_derived_learner_id IS DISTINCT FROM v_flag::uuid THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Dòng learning_events không thuộc về learner đang ẩn danh hóa' USING ERRCODE = '42501';
        END IF;

        -- (d) Chỉ đổi cột event_payload thành JSONB đã làm sạch
        IF NEW.id != OLD.id
           OR NEW.attempt_id IS DISTINCT FROM OLD.attempt_id
           OR NEW.visitor_id IS DISTINCT FROM OLD.visitor_id
           OR NEW.event_name != OLD.event_name
           OR NEW.created_at != OLD.created_at THEN
            RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Ngoại lệ chỉ cho phép cập nhật event_payload' USING ERRCODE = '42501';
        END IF;

        -- Ghi nhận audit log bắt buộc trong cùng transaction
        INSERT INTO audit_logs (
            staff_user_id, action, target_entity, target_entity_id, details
        ) VALUES (
            NULL, 'anonymize_learner_sanitize', 'learning_events', OLD.id, '{"field": "event_payload", "status": "redacted"}'
        );

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_learning_events_append_only ON learning_events;
CREATE TRIGGER trg_learning_events_append_only
BEFORE UPDATE OR DELETE ON learning_events
FOR EACH ROW EXECUTE FUNCTION trg_learning_events_append_only();


-- ==============================================================================
-- 4. SỔ CÁI AUDIT_LOGS CHỈ-GHI-THÊM (CẤM 100% UPDATE/DELETE)
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_audit_logs_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'APPEND_ONLY_VIOLATION: Bảng audit_logs là sổ cái kiểm toán 5 năm, cấm UPDATE và DELETE tuyệt đối'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_append_only ON audit_logs;
CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION trg_audit_logs_append_only();


-- ==============================================================================
-- 5. INV-41: BẤT BIẾN visitor_token_hash TRÊN BẢNG visitors
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_visitors_immutable_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_flag text;
BEGIN
    IF NEW.visitor_token_hash != OLD.visitor_token_hash THEN
        v_flag := NULLIF(current_setting('shd.anonymizing_learner_id', true), '');
        -- Cho phép đổi khi có cờ ẩn danh hóa bắt đầu bằng anon_v_
        IF v_flag IS NOT NULL AND NEW.visitor_token_hash LIKE 'anon_v_%' THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'IMMUTABLE_VIOLATION: Cột visitor_token_hash là bất biến sau khi tạo'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visitors_immutable_token ON visitors;
CREATE TRIGGER trg_visitors_immutable_token
BEFORE UPDATE ON visitors
FOR EACH ROW EXECUTE FUNCTION trg_visitors_immutable_token();


-- ==============================================================================
-- 6. TÍNH TOÁN NHIỆT ĐỘ LEAD TỪ TÍN HIỆU (lead_signals -> leads)
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_calculate_lead_temperature()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_weight numeric(6,2);
    v_new_temp varchar(16);
BEGIN
    SELECT COALESCE(SUM(signal_weight), 0.00) INTO v_total_weight
    FROM lead_signals WHERE lead_id = NEW.lead_id;

    IF v_total_weight >= 5.00 THEN
        v_new_temp := 'hot';
    ELSIF v_total_weight >= 3.00 THEN
        v_new_temp := 'warm';
    ELSE
        v_new_temp := 'nurture';
    END IF;

    UPDATE leads
    SET lead_temperature = v_new_temp,
        last_temperature_calculated_at = clock_timestamp()
    WHERE id = NEW.lead_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calculate_lead_temperature ON lead_signals;
CREATE TRIGGER trg_calculate_lead_temperature
AFTER INSERT ON lead_signals
FOR EACH ROW EXECUTE FUNCTION trg_calculate_lead_temperature();


-- ==============================================================================
-- 7. INV-20: KIỂM TRA CÂU HỎI MỞ CÔNG KHAI LIÊN TỤC 1..N KHI XUẤT BẢN ĐỀ
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_check_public_questions_sequential()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_public_count integer;
    v_actual_public_orders integer[];
    v_expected_orders integer[];
    i integer;
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        SELECT public_explanation_count INTO v_public_count
        FROM exams WHERE id = NEW.exam_id;

        IF v_public_count > 0 THEN
            SELECT array_agg(q.question_order ORDER BY q.question_order)
            INTO v_actual_public_orders
            FROM questions q
            JOIN explanations exp ON exp.question_id = q.id
            WHERE q.version_id = NEW.id AND exp.is_public_preview = true;

            v_expected_orders := ARRAY[]::integer[];
            FOR i IN 1..v_public_count LOOP
                v_expected_orders := array_append(v_expected_orders, i);
            END LOOP;

            IF v_actual_public_orders IS DISTINCT FROM v_expected_orders THEN
                RAISE EXCEPTION 'PRECONDITION_FAILED: Các câu hỏi xem trước công khai bắt buộc phải là dãy liên tục từ 1 đến %', v_public_count
                USING ERRCODE = '22000';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_public_questions_sequential ON exam_versions;
CREATE TRIGGER trg_check_public_questions_sequential
BEFORE UPDATE ON exam_versions
FOR EACH ROW EXECUTE FUNCTION trg_check_public_questions_sequential();


-- ==============================================================================
-- 8. INV-22: THỜI LƯỢNG TỪNG PHẦN THI KHÔNG ĐƯỢC LỚN HƠN TỔNG THỜI GIAN ĐỀ
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_check_section_time_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_exam_time_limit integer;
BEGIN
    IF NEW.time_limit_seconds IS NOT NULL THEN
        SELECT e.time_limit_seconds INTO v_exam_time_limit
        FROM exam_versions ev
        JOIN exams e ON e.id = ev.exam_id
        WHERE ev.id = NEW.version_id;

        IF NEW.time_limit_seconds > v_exam_time_limit THEN
            RAISE EXCEPTION 'INVALID_ARGUMENT: Thời lượng phần thi (%s) không được vượt quá thời gian tổng đề (%s)',
                NEW.time_limit_seconds, v_exam_time_limit
            USING ERRCODE = '22000';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_section_time_limit ON sections;
CREATE TRIGGER trg_check_section_time_limit
BEFORE INSERT OR UPDATE ON sections
FOR EACH ROW EXECUTE FUNCTION trg_check_section_time_limit();
