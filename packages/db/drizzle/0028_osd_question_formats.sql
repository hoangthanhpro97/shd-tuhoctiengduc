-- Keep source answer IDs intact and allow private short-text keys without public answer options.
ALTER TABLE question_options ALTER COLUMN option_label TYPE text;
ALTER TABLE answer_keys ALTER COLUMN correct_option_label TYPE text;
ALTER TABLE attempt_answers ALTER COLUMN selected_option_label TYPE text;

GRANT SELECT ON question_types TO shd_app, shd_attempt_mgr;

CREATE OR REPLACE FUNCTION trg_check_answer_key_option()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF length(NEW.correct_option_label) = 0 THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Answer key cannot be empty' USING ERRCODE = '22000';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM questions q JOIN question_types qt ON qt.id = q.type_id
        WHERE q.id = NEW.question_id AND qt.code = 'short_text'
    ) AND NOT EXISTS (
        SELECT 1 FROM question_options WHERE question_id = NEW.question_id AND option_label = NEW.correct_option_label
    ) THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Answer key option does not belong to question %', NEW.question_id USING ERRCODE = '22000';
    END IF;
    RETURN NEW;
END;
$$;

-- A skill may span several part-sections; only its first questions have public previews.
CREATE OR REPLACE FUNCTION trg_check_public_questions_sequential()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_public_count integer;
    v_skill uuid;
    v_actual_ids uuid[];
    v_expected_ids uuid[];
BEGIN
    IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
        SELECT public_explanation_count INTO v_public_count FROM exams WHERE id = NEW.exam_id;
        FOR v_skill IN SELECT DISTINCT skill_id FROM sections WHERE version_id = NEW.id LOOP
            SELECT array_agg(q.id ORDER BY s.section_order, q.question_order) INTO v_actual_ids
            FROM questions q JOIN sections s ON s.id = q.section_id
            JOIN explanations exp ON exp.question_id = q.id AND exp.is_public_preview
            WHERE s.version_id = NEW.id AND s.skill_id = v_skill;
            SELECT array_agg(candidate.id ORDER BY candidate.section_order, candidate.question_order) INTO v_expected_ids
            FROM (
                SELECT q.id, s.section_order, q.question_order
                FROM questions q JOIN sections s ON s.id = q.section_id
                WHERE s.version_id = NEW.id AND s.skill_id = v_skill
                ORDER BY s.section_order, q.question_order LIMIT COALESCE(v_public_count, 0)
            ) candidate;
            IF COALESCE(v_actual_ids, ARRAY[]::uuid[]) IS DISTINCT FROM COALESCE(v_expected_ids, ARRAY[]::uuid[]) THEN
                RAISE EXCEPTION 'PRECONDITION_FAILED: Public explanations must be sequential per skill for version %', NEW.id USING ERRCODE = '22000';
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION save_attempt_answer(
    p_caller_token_hash varchar,
    p_attempt_id uuid,
    p_question_id uuid,
    p_selected_option_label varchar,
    p_expected_revision integer,
    p_time_spent_seconds integer DEFAULT 0
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
    v_visitor_id uuid;
    v_status varchar(32);
    v_expires_at timestamptz;
    v_version_id uuid;
    v_question_type text;
    v_current_revision integer;
    v_new_revision integer;
BEGIN
    SELECT ea.visitor_id, ea.status, ea.expires_at, ea.version_id
    INTO v_visitor_id, v_status, v_expires_at, v_version_id
    FROM exam_attempts ea JOIN visitors v ON v.id = ea.visitor_id
    WHERE ea.id = p_attempt_id AND v.visitor_token_hash = p_caller_token_hash FOR UPDATE;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;
    IF v_status <> 'in_progress' OR clock_timestamp() > v_expires_at THEN
        RAISE EXCEPTION 'ATTEMPT_EXPIRED: Attempt is no longer writable' USING ERRCODE = '22000';
    END IF;
    SELECT qt.code INTO v_question_type FROM questions q JOIN question_types qt ON qt.id = q.type_id
    WHERE q.id = p_question_id AND q.version_id = v_version_id;
    IF v_question_type IS NULL THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Question does not belong to attempt version' USING ERRCODE = '22000';
    END IF;
    IF p_selected_option_label IS NOT NULL AND (length(p_selected_option_label) = 0 OR (
        v_question_type <> 'short_text' AND NOT EXISTS (
            SELECT 1 FROM question_options WHERE question_id = p_question_id AND option_label = p_selected_option_label
        )
    )) THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Selected option does not belong to question' USING ERRCODE = '22000';
    END IF;
    IF p_expected_revision IS NULL OR p_expected_revision < 0 OR p_time_spent_seconds IS NULL OR p_time_spent_seconds < 0 THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Revision and time spent must be non-negative' USING ERRCODE = '22000';
    END IF;
    SELECT revision INTO v_current_revision FROM attempt_answers
    WHERE attempt_id = p_attempt_id AND question_id = p_question_id FOR UPDATE;
    IF COALESCE(v_current_revision, 0) <> p_expected_revision THEN
        RAISE EXCEPTION 'REVISION_CONFLICT: Expected revision does not match stored answer state' USING ERRCODE = '40001';
    END IF;
    v_new_revision := p_expected_revision + 1;
    INSERT INTO attempt_answers (attempt_id, question_id, selected_option_label, revision, answered_at)
    VALUES (p_attempt_id, p_question_id, p_selected_option_label, v_new_revision, clock_timestamp())
    ON CONFLICT (attempt_id, question_id) DO UPDATE SET
        selected_option_label = EXCLUDED.selected_option_label,
        revision = EXCLUDED.revision, answered_at = EXCLUDED.answered_at;
    RETURN jsonb_build_object('questionId', p_question_id, 'revision', v_new_revision, 'savedAt', clock_timestamp());
END;
$$;
ALTER FUNCTION save_attempt_answer(varchar, uuid, uuid, varchar, integer, integer) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION save_attempt_answer(varchar, uuid, uuid, varchar, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_attempt_answer(varchar, uuid, uuid, varchar, integer, integer) TO shd_app;

-- Retain the bulk API but delegate its validation to the same ownership/version/type boundary.
CREATE OR REPLACE FUNCTION save_answers(p_caller_token_hash varchar, p_attempt_id uuid, p_items jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
    v_item record;
    v_revision integer;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
        question_id uuid, selected_option_label text, is_flagged boolean, revision integer
    ) LOOP
        SELECT revision INTO v_revision FROM attempt_answers WHERE attempt_id = p_attempt_id AND question_id = v_item.question_id;
        PERFORM save_attempt_answer(p_caller_token_hash, p_attempt_id, v_item.question_id,
            v_item.selected_option_label::varchar, COALESCE(v_item.revision - 1, v_revision, 0), 0);
        UPDATE attempt_answers SET is_flagged = COALESCE(v_item.is_flagged, false)
        WHERE attempt_id = p_attempt_id AND question_id = v_item.question_id;
    END LOOP;
    RETURN true;
END;
$$;
ALTER FUNCTION save_answers(varchar, uuid, jsonb) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION save_answers(varchar, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_answers(varchar, uuid, jsonb) TO shd_app;
