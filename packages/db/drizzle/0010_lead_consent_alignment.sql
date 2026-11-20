-- Align the web lead gate with granular education/career consent semantics.

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
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor does not exist' USING ERRCODE = '28000';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM exam_attempts WHERE id = p_attempt_id AND visitor_id = v_visitor_id
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: OTP attempt does not belong to visitor' USING ERRCODE = '42501';
    END IF;
    IF p_channel NOT IN ('sms', 'zalo_zns') THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Unsupported OTP channel' USING ERRCODE = '22000';
    END IF;

    v_phone_hash := encode(digest(p_phone_raw, 'sha256'), 'hex');
    v_otp_code := lpad((floor(random() * 900000) + 100000)::text, 6, '0');
    v_otp_hash := encode(digest(v_otp_code, 'sha256'), 'hex');

    INSERT INTO otp_challenges (attempt_id, visitor_id, phone_hash, otp_hash, channel, attempts_count, status, expires_at)
    VALUES (p_attempt_id, v_visitor_id, v_phone_hash, v_otp_hash, p_channel, 0, 'pending', clock_timestamp() + interval '5 minutes')
    RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object('challenge_id', v_challenge_id, 'otp_code', v_otp_code);
END;
$$;

ALTER FUNCTION issue_otp(varchar, uuid, varchar, varchar) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION issue_otp(varchar, uuid, varchar, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION issue_otp(varchar, uuid, varchar, varchar) TO shd_app;

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
        SELECT 1
        FROM learners l
        JOIN exam_attempts ea ON ea.learner_id = l.id AND ea.visitor_id = v_visitor_id
        WHERE l.id = p_learner_id AND l.is_under_18 = true
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: Guardian learner is not owned by visitor' USING ERRCODE = '42501';
    END IF;

    INSERT INTO guardians (learner_id, phone_hash, phone_encrypted, relationship, verification_status)
    VALUES (p_learner_id, p_parent_phone_hash, p_parent_phone_encrypted, p_relationship, 'pending')
    ON CONFLICT (learner_id) DO UPDATE SET
        phone_hash = EXCLUDED.phone_hash,
        phone_encrypted = EXCLUDED.phone_encrypted,
        relationship = EXCLUDED.relationship,
        verification_status = CASE WHEN guardians.verification_status = 'approved' THEN guardians.verification_status ELSE 'pending' END,
        requested_at = clock_timestamp()
    RETURNING id INTO v_guardian_id;
    RETURN v_guardian_id;
END;
$$;

ALTER FUNCTION create_guardian(varchar, uuid, varchar, text, varchar) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION create_guardian(varchar, uuid, varchar, text, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_guardian(varchar, uuid, varchar, text, varchar) TO shd_app;

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
    WHERE id = p_attempt_id AND visitor_id = v_visitor_id AND status = 'in_progress';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'FORBIDDEN: Attempt does not belong to visitor or is not writable' USING ERRCODE = '42501';
    END IF;
    RETURN true;
END;
$$;

ALTER FUNCTION attach_learner_to_attempt(varchar, uuid, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION attach_learner_to_attempt(varchar, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION attach_learner_to_attempt(varchar, uuid, uuid) TO shd_app;

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
    v_challenge_attempt uuid;
    v_learner_phone_hash varchar(64);
BEGIN
    SELECT id INTO v_visitor_id FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor does not exist' USING ERRCODE = '28000';
    END IF;
    SELECT phone_hash, status, attempt_id
    INTO v_challenge_phone_hash, v_challenge_status, v_challenge_attempt
    FROM otp_challenges
    WHERE id = p_otp_challenge_id AND visitor_id = v_visitor_id;
    SELECT phone_hash INTO v_learner_phone_hash FROM learners WHERE id = p_learner_id;
    IF v_challenge_status IS DISTINCT FROM 'verified' OR v_challenge_phone_hash IS DISTINCT FROM v_learner_phone_hash THEN
        RAISE EXCEPTION 'PRECONDITION_FAILED: OTP is not verified for learner phone' USING ERRCODE = '22000';
    END IF;
    IF p_attempt_id IS NOT NULL AND v_challenge_attempt IS DISTINCT FROM p_attempt_id THEN
        RAISE EXCEPTION 'FORBIDDEN: OTP challenge does not belong to attempt' USING ERRCODE = '42501';
    END IF;
    UPDATE learners SET phone_verified_at = clock_timestamp() WHERE id = p_learner_id;
    IF p_attempt_id IS NOT NULL THEN
        UPDATE exam_attempts SET learner_id = p_learner_id WHERE id = p_attempt_id AND visitor_id = v_visitor_id;
    END IF;
    RETURN true;
END;
$$;

ALTER FUNCTION mark_phone_verified(varchar, uuid, uuid, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION mark_phone_verified(varchar, uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_phone_verified(varchar, uuid, uuid, uuid) TO shd_app;

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
    v_purpose_code varchar(32);
    v_guardian_status varchar(32);
    v_consent_id uuid;
    v_ip_hash varchar(64);
BEGIN
    SELECT id, ip_hash INTO v_visitor_id, v_ip_hash FROM visitors WHERE visitor_token_hash = p_caller_token_hash;
    IF v_visitor_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Visitor does not exist' USING ERRCODE = '28000';
    END IF;
    IF p_action NOT IN ('granted', 'revoked') THEN
        RAISE EXCEPTION 'INVALID_ARGUMENT: Invalid consent action' USING ERRCODE = '22000';
    END IF;

    SELECT l.is_under_18, cp.code
    INTO v_is_under_18, v_purpose_code
    FROM learners l
    JOIN consent_texts ct ON ct.id = p_consent_text_id
    JOIN consent_purposes cp ON cp.id = ct.purpose_id
    WHERE l.id = p_learner_id
      AND EXISTS (
          SELECT 1 FROM exam_attempts ea WHERE ea.learner_id = l.id AND ea.visitor_id = v_visitor_id
      );

    IF v_purpose_code IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: Learner or consent text is not owned by visitor' USING ERRCODE = '42501';
    END IF;

    IF p_given_by_guardian_id IS NOT NULL THEN
        SELECT verification_status INTO v_guardian_status
        FROM guardians
        WHERE id = p_given_by_guardian_id AND learner_id = p_learner_id;
        IF v_guardian_status IS NULL THEN
            RAISE EXCEPTION 'FORBIDDEN: Guardian does not belong to learner' USING ERRCODE = '42501';
        END IF;
    END IF;

    IF v_is_under_18 = true AND v_purpose_code = 'shd_career' THEN
        IF v_guardian_status IS DISTINCT FROM 'approved' THEN
            RAISE EXCEPTION 'PRECONDITION_FAILED: Career consent requires approved guardian' USING ERRCODE = '22000';
        END IF;
    END IF;

    INSERT INTO consents (learner_id, consent_text_id, given_by_guardian_id, action, capture_method, user_ip_hash, recorded_at)
    VALUES (p_learner_id, p_consent_text_id, p_given_by_guardian_id, p_action, p_capture_method, v_ip_hash, clock_timestamp())
    RETURNING id INTO v_consent_id;
    RETURN v_consent_id;
END;
$$;

ALTER FUNCTION record_consent(varchar, uuid, uuid, varchar, varchar, uuid) OWNER TO shd_auth_admin;
REVOKE ALL ON FUNCTION record_consent(varchar, uuid, uuid, varchar, varchar, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_consent(varchar, uuid, uuid, varchar, varchar, uuid) TO shd_app;

CREATE OR REPLACE VIEW v_contactable_leads WITH (security_barrier = true) AS
SELECT l.id AS lead_id, lr.id AS learner_id, overlay(lr.full_name placing '***' from 3 for 10) AS full_name_masked,
       l.lead_temperature, lg.code AS learning_goal_code, l.exam_timeline
FROM leads l
JOIN learners lr ON l.learner_id = lr.id
JOIN learning_goals lg ON l.learning_goal_id = lg.id
WHERE lr.phone_verified_at IS NOT NULL
  AND (SELECT c.action FROM consents c JOIN consent_texts ct ON c.consent_text_id = ct.id JOIN consent_purposes cp ON ct.purpose_id = cp.id
       WHERE c.learner_id = lr.id AND cp.code = 'shd_career' ORDER BY c.recorded_at DESC, c.id DESC LIMIT 1) = 'granted'
  AND (lr.is_under_18 = false OR EXISTS (SELECT 1 FROM guardians g WHERE g.learner_id = lr.id AND g.verification_status = 'approved'));
ALTER VIEW v_contactable_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_contactable_leads TO shd_staff_api;

CREATE OR REPLACE VIEW v_worker_contactable_leads WITH (security_barrier = true) AS
SELECT l.id AS lead_id, lr.id AS learner_id
FROM leads l JOIN learners lr ON l.learner_id = lr.id
WHERE lr.phone_verified_at IS NOT NULL
  AND (SELECT c.action FROM consents c JOIN consent_texts ct ON c.consent_text_id = ct.id JOIN consent_purposes cp ON ct.purpose_id = cp.id
       WHERE c.learner_id = lr.id AND cp.code = 'shd_career' ORDER BY c.recorded_at DESC, c.id DESC LIMIT 1) = 'granted'
  AND (lr.is_under_18 = false OR EXISTS (SELECT 1 FROM guardians g WHERE g.learner_id = lr.id AND g.verification_status = 'approved'));
ALTER VIEW v_worker_contactable_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_worker_contactable_leads TO shd_worker;

CREATE OR REPLACE VIEW v_readonly_contactable_leads WITH (security_barrier = true) AS
SELECT l.id AS lead_id, lr.age_group, lr.is_under_18, l.lead_temperature, lg.code AS learning_goal_code,
       l.exam_timeline, CASE WHEN g.verification_status = 'approved' THEN true ELSE false END AS guardian_verified, l.created_at
FROM leads l JOIN learners lr ON l.learner_id = lr.id JOIN learning_goals lg ON l.learning_goal_id = lg.id
LEFT JOIN guardians g ON g.learner_id = lr.id
WHERE lr.phone_verified_at IS NOT NULL
  AND (SELECT c.action FROM consents c JOIN consent_texts ct ON c.consent_text_id = ct.id JOIN consent_purposes cp ON ct.purpose_id = cp.id
       WHERE c.learner_id = lr.id AND cp.code = 'shd_career' ORDER BY c.recorded_at DESC, c.id DESC LIMIT 1) = 'granted'
  AND (lr.is_under_18 = false OR EXISTS (SELECT 1 FROM guardians g2 WHERE g2.learner_id = lr.id AND g2.verification_status = 'approved'));
ALTER VIEW v_readonly_contactable_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_readonly_contactable_leads TO shd_readonly, shd_staff_api;
