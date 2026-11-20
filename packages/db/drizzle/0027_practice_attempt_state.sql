-- Expose attempt mode to the client. Practice mode still submits to server grading,
-- but the client can avoid the exam-only countdown/auto-submit experience.
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
        'mode', ea.mode,
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
