-- Submit is a state transition only. Core grading owns the single server-side grading path.
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
    v_submission_type varchar(16);
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

    IF v_status IN ('submitted', 'graded') THEN
        RETURN true;
    END IF;
    IF v_status <> 'in_progress' THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: Attempt is not writable' USING ERRCODE = '22000';
    END IF;

    v_submission_type := CASE WHEN clock_timestamp() >= v_expires_at THEN 'timeout' ELSE 'manual' END;
    UPDATE exam_attempts
    SET status = 'submitted',
        submission_type = v_submission_type,
        submitted_at = clock_timestamp()
    WHERE id = p_attempt_id;

    RETURN true;
END;
$$;

ALTER FUNCTION submit_attempt(uuid, varchar) OWNER TO shd_attempt_mgr;
REVOKE ALL ON FUNCTION submit_attempt(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_attempt(uuid, varchar) TO shd_app;

GRANT SELECT, UPDATE ON exam_attempts TO shd_grader;
REVOKE INSERT, DELETE ON exam_attempts FROM shd_grader;
