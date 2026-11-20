-- Content integrity rules for canonical fixtures and published versions.

ALTER TABLE questions DROP CONSTRAINT IF EXISTS uq_questions_version_id_question_order;

CREATE OR REPLACE FUNCTION trg_check_public_questions_sequential()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_public_count integer;
    v_section record;
    v_actual_orders integer[];
    v_expected_orders integer[];
    v_expected_count integer;
    i integer;
BEGIN
    IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
        SELECT public_explanation_count INTO v_public_count
        FROM exams WHERE id = NEW.exam_id;

        FOR v_section IN SELECT id FROM sections WHERE version_id = NEW.id ORDER BY section_order LOOP
            SELECT array_agg(q.question_order ORDER BY q.question_order)
            INTO v_actual_orders
            FROM questions q
            JOIN explanations exp ON exp.question_id = q.id
            WHERE q.section_id = v_section.id
              AND exp.is_public_preview = true;

            v_expected_count := LEAST(
                COALESCE(v_public_count, 0),
                (SELECT count(*) FROM questions WHERE section_id = v_section.id)
            );
            v_expected_orders := ARRAY[]::integer[];
            IF v_expected_count > 0 THEN
                FOR i IN 1..v_expected_count LOOP
                    v_expected_orders := array_append(v_expected_orders, i);
                END LOOP;
            END IF;

            IF COALESCE(v_actual_orders, ARRAY[]::integer[]) IS DISTINCT FROM v_expected_orders THEN
                RAISE EXCEPTION 'PRECONDITION_FAILED: Public explanations must be sequential per section for version %', NEW.id
                    USING ERRCODE = '22000';
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_public_questions_sequential ON exam_versions;
CREATE TRIGGER trg_check_public_questions_sequential
BEFORE UPDATE ON exam_versions
FOR EACH ROW EXECUTE FUNCTION trg_check_public_questions_sequential();

CREATE OR REPLACE FUNCTION trg_check_question_option_and_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.points <= 0 THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: question points must be positive' USING ERRCODE = '22000';
    END IF;
    IF NEW.question_order <= 0 OR NEW.part_number <= 0 THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: question order and part number must be positive' USING ERRCODE = '22000';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_question_option_and_points ON questions;
CREATE TRIGGER trg_check_question_option_and_points
BEFORE INSERT OR UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION trg_check_question_option_and_points();

CREATE OR REPLACE FUNCTION trg_check_answer_key_option()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM question_options
        WHERE question_id = NEW.question_id AND option_label = NEW.correct_option_label
    ) THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: answer key option does not belong to question %', NEW.question_id
            USING ERRCODE = '22000';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_answer_key_option ON answer_keys;
CREATE TRIGGER trg_check_answer_key_option
BEFORE INSERT OR UPDATE ON answer_keys
FOR EACH ROW EXECUTE FUNCTION trg_check_answer_key_option();
