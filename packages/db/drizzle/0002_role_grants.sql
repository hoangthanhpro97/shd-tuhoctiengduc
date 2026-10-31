-- Migration: 0002_role_grants.sql
-- Cấp và thu hồi quyền truy cập bảng chi tiết theo Ma trận Mục 6 & Mục 6.1

-- 1. Thu hồi toàn bộ quyền mặc định trên schema public khỏi PUBLIC
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;

-- 2. Phân quyền cho Connecting Role: shd_app (Web Học Viên - Zero-Direct-Write trên mọi bảng bảo mật)
GRANT SELECT ON
    tracks, exam_standards, levels, skills, question_types,
    learning_goals, persona_types,
    exams, exam_versions, sections, stimuli, assets, questions, question_options,
    visitors,
    exam_attempts,
    attempt_section_timers,
    attempt_answers,
    attempt_audio_plays,
    attempt_entitlements,
    results, result_section_scores,
    learners,
    otp_challenges,
    consent_purposes, consent_texts,
    consents,
    leads,
    lead_signals,
    crm_links,
    idempotency_keys,
    data_requests,
    app_settings
TO shd_app;

GRANT INSERT ON learning_events TO shd_app;

-- 3. Phân quyền cho Connecting Role: shd_staff_api (Cổng Nội Bộ - Cấm SELECT trực tiếp trên learners, guardians)
GRANT SELECT ON
    tracks, exam_standards, levels, skills, question_types,
    learning_goals, persona_types,
    exams, exam_versions, sections, stimuli, assets, questions, question_options,
    content_reviews,
    explanations,
    exam_attempts,
    attempt_section_timers,
    attempt_answers,
    results, result_section_scores,
    result_item_scores,
    consent_purposes, consent_texts,
    consents,
    leads,
    lead_signals,
    crm_links,
    staff_users,
    data_requests,
    app_settings
TO shd_staff_api;

-- 4. Phân quyền cho Connecting Role: shd_worker (Outbox Dispatcher & Timeout Job - Cấm SELECT trên learners, guardians)
GRANT SELECT ON
    tracks, exam_standards, levels, skills, question_types,
    learning_goals, persona_types,
    exams, exam_versions, sections, stimuli, assets, questions, question_options,
    exam_attempts,
    consent_purposes, consent_texts,
    consents,
    leads,
    lead_signals,
    app_settings,
    idempotency_keys
TO shd_worker;

GRANT SELECT, UPDATE, DELETE ON crm_outbox TO shd_worker;
GRANT SELECT, INSERT, UPDATE ON crm_links TO shd_worker;
GRANT SELECT, INSERT, UPDATE ON crm_inbound_events TO shd_worker;

-- 5. Phân quyền cho Connecting Role: shd_readonly (Báo Cáo & Kiểm Toán - Tước 100% SELECT trên bảng PII gốc)
GRANT SELECT ON
    tracks, exam_standards, levels, skills, question_types,
    learning_goals, persona_types,
    exams, exam_versions, sections, stimuli, assets, questions, question_options,
    content_reviews,
    explanations,
    visitors,
    exam_attempts,
    attempt_section_timers,
    attempt_answers,
    attempt_audio_plays,
    attempt_entitlements,
    results, result_section_scores, result_item_scores,
    learning_events,
    consent_purposes, consent_texts,
    lead_signals,
    crm_outbox,
    crm_links,
    crm_inbound_events,
    idempotency_keys,
    staff_users,
    audit_logs,
    data_requests,
    app_settings
TO shd_readonly;

-- 6. Bảng Quyền Liên Owner (Cross-Owner Permission Matrix - Mục 6.1)
-- 6.1 shd_attempt_mgr
GRANT SELECT (id, learner_id, latest_attempt_id) ON leads TO shd_attempt_mgr;
GRANT UPDATE (latest_attempt_id, total_attempts_count) ON leads TO shd_attempt_mgr;
GRANT SELECT ON exam_versions, sections, stimuli, exams TO shd_attempt_mgr;
GRANT SELECT (id, attempt_id, visitor_id, status) ON otp_challenges TO shd_attempt_mgr;

-- 6.2 shd_auth_admin
GRANT UPDATE (learner_id) ON exam_attempts TO shd_auth_admin;
GRANT SELECT (id, visitor_token_hash) ON visitors TO shd_auth_admin;
GRANT SELECT (id, visitor_id) ON exam_attempts TO shd_auth_admin;
GRANT SELECT (setting_key, setting_value) ON app_settings TO shd_auth_admin;
GRANT INSERT (learner_id, consent_text_id, action, capture_method, given_by_guardian_id, user_ip_hash, recorded_at) ON consents TO shd_auth_admin;
GRANT SELECT (id, learner_id, consent_text_id, action, recorded_at) ON consents TO shd_auth_admin;

-- 6.3 shd_grader
GRANT SELECT ON exam_attempts TO shd_grader;
GRANT UPDATE (status, submission_type, submitted_at) ON exam_attempts TO shd_grader;
GRANT SELECT (attempt_id, question_id, selected_option_label) ON attempt_answers TO shd_grader;
GRANT SELECT (id, version_id, question_order, points) ON questions TO shd_grader;
GRANT SELECT (id, passing_percentage, benchmark_scale_config) ON exams TO shd_grader;
GRANT SELECT (id, time_limit_seconds) ON sections TO shd_grader;
GRANT SELECT (id, learner_id) ON leads TO shd_grader;
GRANT INSERT (lead_id, signal_type, signal_weight, metadata) ON lead_signals TO shd_grader;

-- 6.4 shd_exam_admin
GRANT SELECT (id, role, is_active) ON staff_users TO shd_exam_admin;

-- 6.5 shd_privacy_admin
GRANT UPDATE (full_name, email, phone_hash, phone_encrypted, phone_verified_at, anonymized_at) ON learners TO shd_privacy_admin;
GRANT UPDATE (phone_hash, phone_encrypted) ON guardians TO shd_privacy_admin;
GRANT UPDATE (visitor_token_hash, ip_hash, user_agent) ON visitors TO shd_privacy_admin;
GRANT UPDATE (phone_hash, otp_hash) ON otp_challenges TO shd_privacy_admin;
GRANT UPDATE (user_ip_hash) ON consents TO shd_privacy_admin;
GRANT DELETE ON crm_links TO shd_privacy_admin;
GRANT UPDATE (payload) ON crm_inbound_events TO shd_privacy_admin;
GRANT UPDATE (error_log) ON crm_outbox TO shd_privacy_admin;
GRANT UPDATE (event_payload) ON learning_events TO shd_privacy_admin;
GRANT SELECT (id, phone_encrypted) ON learners TO shd_privacy_admin;
GRANT SELECT (aggregate_id, status, locked_by, locked_until) ON crm_outbox TO shd_privacy_admin;
GRANT SELECT (id, role, is_active) ON staff_users TO shd_privacy_admin;
GRANT INSERT ON audit_logs TO shd_privacy_admin;

