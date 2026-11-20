-- Auth SECURITY DEFINER functions validate and persist learner/OTP ownership.
GRANT SELECT ON visitors, exam_attempts, learners, otp_challenges, guardians, consent_purposes, consent_texts TO shd_auth_admin;
GRANT INSERT, UPDATE ON learners, otp_challenges, guardians, consents, exam_attempts TO shd_auth_admin;
REVOKE DELETE ON learners, otp_challenges, guardians, consents, exam_attempts FROM shd_auth_admin;
