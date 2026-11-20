-- Public preview explanations are open; full solutions require entitlement.
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
            'access', CASE WHEN v_unlocked THEN 'full' WHEN exp.is_public_preview THEN 'open' ELSE 'locked' END,
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
