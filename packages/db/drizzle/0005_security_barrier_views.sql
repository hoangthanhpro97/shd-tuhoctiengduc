-- Migration: 0005_security_barrier_views.sql
-- 10 Security Barrier Views theo Mục 7 của docs/architecture/02-data-model.md v1.9

-- 1. v_public_explanations
CREATE OR REPLACE VIEW v_public_explanations WITH (security_barrier = true) AS
SELECT
    question_id,
    explanation_text,
    translation_text,
    vocabulary_notes,
    is_public_preview
FROM explanations
WHERE is_public_preview = true;

ALTER VIEW v_public_explanations OWNER TO shd_exam_admin;
GRANT SELECT ON v_public_explanations TO shd_app, shd_staff_api, shd_readonly;

-- 2. v_attempt_item_scores
CREATE OR REPLACE VIEW v_attempt_item_scores WITH (security_barrier = true) AS
SELECT
    ris.result_id,
    ris.question_id,
    CASE
        WHEN exp.is_public_preview = true OR ent.full_solution_unlocked = true THEN ris.is_correct
        ELSE NULL
    END AS is_correct,
    CASE
        WHEN exp.is_public_preview = true OR ent.full_solution_unlocked = true THEN ris.earned_points
        ELSE NULL
    END AS earned_points
FROM result_item_scores ris
JOIN results r ON r.id = ris.result_id
JOIN attempt_entitlements ent ON ent.attempt_id = r.attempt_id
LEFT JOIN explanations exp ON exp.question_id = ris.question_id;

ALTER VIEW v_attempt_item_scores OWNER TO shd_grader;
GRANT SELECT ON v_attempt_item_scores TO shd_app, shd_staff_api, shd_readonly;

-- 3. v_masked_learners
CREATE OR REPLACE VIEW v_masked_learners WITH (security_barrier = true) AS
SELECT
    id,
    overlay(full_name placing '***' from 3 for 10) AS full_name_masked,
    CASE
        WHEN email IS NOT NULL AND position('@' in email) > 2 THEN
            overlay(email placing '***' from 2 for position('@' in email) - 2)
        ELSE '***@***.***'
    END AS email_masked,
    age_group,
    is_under_18,
    phone_verified_at,
    created_at
FROM learners;

ALTER VIEW v_masked_learners OWNER TO shd_auth_admin;
GRANT SELECT ON v_masked_learners TO shd_app, shd_staff_api, shd_readonly;

-- 4. v_masked_guardians
CREATE OR REPLACE VIEW v_masked_guardians WITH (security_barrier = true) AS
SELECT
    id,
    learner_id,
    relationship,
    verification_status,
    requested_at,
    verified_at
FROM guardians;

ALTER VIEW v_masked_guardians OWNER TO shd_auth_admin;
GRANT SELECT ON v_masked_guardians TO shd_staff_api, shd_readonly;

-- 5. v_masked_leads
CREATE OR REPLACE VIEW v_masked_leads WITH (security_barrier = true) AS
SELECT
    id,
    learning_goal_id,
    exam_timeline,
    persona_type_id,
    lead_temperature,
    total_attempts_count,
    last_temperature_calculated_at,
    created_at
FROM leads;

ALTER VIEW v_masked_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_masked_leads TO shd_app, shd_staff_api, shd_worker, shd_readonly;

-- 6. v_masked_otp_challenges
CREATE OR REPLACE VIEW v_masked_otp_challenges WITH (security_barrier = true) AS
SELECT
    id,
    attempt_id,
    channel,
    attempts_count,
    status,
    expires_at,
    created_at
FROM otp_challenges;

ALTER VIEW v_masked_otp_challenges OWNER TO shd_auth_admin;
GRANT SELECT ON v_masked_otp_challenges TO shd_app, shd_staff_api, shd_readonly;

-- 7. v_masked_consents
CREATE OR REPLACE VIEW v_masked_consents WITH (security_barrier = true) AS
SELECT
    id,
    learner_id,
    consent_text_id,
    action,
    capture_method,
    recorded_at
FROM consents;

ALTER VIEW v_masked_consents OWNER TO shd_auth_admin;
GRANT SELECT ON v_masked_consents TO shd_app, shd_staff_api, shd_worker, shd_readonly;

-- 8. v_contactable_leads (Dành riêng cho shd_staff_api - Task N1, không có SĐT/Email)
CREATE OR REPLACE VIEW v_contactable_leads WITH (security_barrier = true) AS
SELECT 
    l.id AS lead_id,
    lr.id AS learner_id,
    overlay(lr.full_name placing '***' from 3 for 10) AS full_name_masked,
    l.lead_temperature,
    lg.code AS learning_goal_code,
    l.exam_timeline
FROM leads l
JOIN learners lr ON l.learner_id = lr.id
JOIN learning_goals lg ON l.learning_goal_id = lg.id
WHERE lr.phone_verified_at IS NOT NULL
  AND (
    SELECT c.action
    FROM consents c
    JOIN consent_texts ct ON c.consent_text_id = ct.id
    JOIN consent_purposes cp ON ct.purpose_id = cp.id
    WHERE c.learner_id = lr.id AND cp.code = 'course_consulting'
    ORDER BY c.recorded_at DESC
    LIMIT 1
  ) = 'granted'
  AND (lr.is_under_18 = false OR EXISTS (
    SELECT 1 FROM guardians g WHERE g.learner_id = lr.id AND g.verification_status = 'approved'
  ));

ALTER VIEW v_contactable_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_contactable_leads TO shd_staff_api;

-- 9. v_worker_contactable_leads (Dành riêng cho shd_worker - Task N1, chỉ có ID tối thiểu)
CREATE OR REPLACE VIEW v_worker_contactable_leads WITH (security_barrier = true) AS
SELECT 
    l.id AS lead_id,
    lr.id AS learner_id
FROM leads l
JOIN learners lr ON l.learner_id = lr.id
WHERE lr.phone_verified_at IS NOT NULL
  AND (
    SELECT c.action
    FROM consents c
    JOIN consent_texts ct ON c.consent_text_id = ct.id
    JOIN consent_purposes cp ON ct.purpose_id = cp.id
    WHERE c.learner_id = lr.id AND cp.code = 'course_consulting'
    ORDER BY c.recorded_at DESC
    LIMIT 1
  ) = 'granted'
  AND (lr.is_under_18 = false OR EXISTS (
    SELECT 1 FROM guardians g WHERE g.learner_id = lr.id AND g.verification_status = 'approved'
  ));

ALTER VIEW v_worker_contactable_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_worker_contactable_leads TO shd_worker;

-- 10. v_readonly_contactable_leads (Dành cho shd_readonly - Báo cáo phi PII)
CREATE OR REPLACE VIEW v_readonly_contactable_leads WITH (security_barrier = true) AS
SELECT 
    l.id AS lead_id,
    lr.age_group,
    lr.is_under_18,
    l.lead_temperature,
    lg.code AS learning_goal_code,
    l.exam_timeline,
    CASE WHEN g.verification_status = 'approved' THEN true ELSE false END AS guardian_verified,
    l.created_at
FROM leads l
JOIN learners lr ON l.learner_id = lr.id
JOIN learning_goals lg ON l.learning_goal_id = lg.id
LEFT JOIN guardians g ON g.learner_id = lr.id
WHERE lr.phone_verified_at IS NOT NULL
  AND (
    SELECT c.action
    FROM consents c
    JOIN consent_texts ct ON c.consent_text_id = ct.id
    JOIN consent_purposes cp ON ct.purpose_id = cp.id
    WHERE c.learner_id = lr.id AND cp.code = 'course_consulting'
    ORDER BY c.recorded_at DESC
    LIMIT 1
  ) = 'granted'
  AND (lr.is_under_18 = false OR EXISTS (
    SELECT 1 FROM guardians g2 WHERE g2.learner_id = lr.id AND g2.verification_status = 'approved'
  ));

ALTER VIEW v_readonly_contactable_leads OWNER TO shd_auth_admin;
GRANT SELECT ON v_readonly_contactable_leads TO shd_readonly, shd_staff_api;

