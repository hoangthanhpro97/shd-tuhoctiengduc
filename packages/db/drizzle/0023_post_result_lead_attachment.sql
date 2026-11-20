-- Lead gate is shown after grading, so learner attachment must support submitted/graded attempts.
CREATE OR REPLACE FUNCTION attach_learner_to_attempt(
    p_caller_token_hash varchar(64),
    p_attempt_id uuid,
    p_learner_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_visitor_id uuid;
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor does not exist' USING ERRCODE = '28000';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM learners WHERE id = p_learner_id) THEN
        RAISE EXCEPTION 'NOT_FOUND: Learner does not exist' USING ERRCODE = 'P0002';
    END IF;
    UPDATE exam_attempts
    SET learner_id = p_learner_id
    WHERE id = p_attempt_id
      AND visitor_id = v_visitor_id
      AND status IN ('in_progress', 'submitted', 'graded');
    IF NOT FOUND THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor or cannot accept learner' USING ERRCODE = '42501';
    END IF;
    RETURN true;
END;
$$;

ALTER FUNCTION attach_learner_to_attempt(varchar, uuid, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION attach_learner_to_attempt(varchar, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION attach_learner_to_attempt(varchar, uuid, uuid) TO shd_app;
