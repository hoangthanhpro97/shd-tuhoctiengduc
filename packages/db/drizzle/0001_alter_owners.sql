-- Migration: 0001_alter_owners.sql
-- Gán chủ sở hữu (Owner) cho 43 bảng theo Ma trận Phân quyền Mục 6 của docs/architecture/02-data-model.md v1.9

-- 1. shd_exam_admin (16 bảng nội dung khảo thí & tra cứu)
ALTER TABLE "tracks" OWNER TO shd_exam_admin;
ALTER TABLE "exam_standards" OWNER TO shd_exam_admin;
ALTER TABLE "levels" OWNER TO shd_exam_admin;
ALTER TABLE "skills" OWNER TO shd_exam_admin;
ALTER TABLE "question_types" OWNER TO shd_exam_admin;
ALTER TABLE "learning_goals" OWNER TO shd_exam_admin;
ALTER TABLE "persona_types" OWNER TO shd_exam_admin;
ALTER TABLE "exams" OWNER TO shd_exam_admin;
ALTER TABLE "exam_versions" OWNER TO shd_exam_admin;
ALTER TABLE "content_reviews" OWNER TO shd_exam_admin;
ALTER TABLE "sections" OWNER TO shd_exam_admin;
ALTER TABLE "stimuli" OWNER TO shd_exam_admin;
ALTER TABLE "assets" OWNER TO shd_exam_admin;
ALTER TABLE "questions" OWNER TO shd_exam_admin;
ALTER TABLE "question_options" OWNER TO shd_exam_admin;
ALTER TABLE "explanations" OWNER TO shd_exam_admin;

-- 2. shd_grader (4 bảng chấm điểm & đáp án đúng)
ALTER TABLE "answer_keys" OWNER TO shd_grader;
ALTER TABLE "results" OWNER TO shd_grader;
ALTER TABLE "result_section_scores" OWNER TO shd_grader;
ALTER TABLE "result_item_scores" OWNER TO shd_grader;

-- 3. shd_attempt_mgr (7 bảng phiên làm bài, timers, nháp câu trả lời, audio & idempotency)
ALTER TABLE "visitors" OWNER TO shd_attempt_mgr;
ALTER TABLE "exam_attempts" OWNER TO shd_attempt_mgr;
ALTER TABLE "attempt_section_timers" OWNER TO shd_attempt_mgr;
ALTER TABLE "attempt_answers" OWNER TO shd_attempt_mgr;
ALTER TABLE "attempt_audio_plays" OWNER TO shd_attempt_mgr;
ALTER TABLE "attempt_entitlements" OWNER TO shd_attempt_mgr;
ALTER TABLE "idempotency_keys" OWNER TO shd_attempt_mgr;

-- 4. shd_ledger_admin (2 bảng sổ cái chỉ-ghi-thêm)
ALTER TABLE "consents" OWNER TO shd_ledger_admin;
ALTER TABLE "learning_events" OWNER TO shd_ledger_admin;

-- 5. shd_auth_admin (10 bảng người học, phụ huynh, OTP, lead & CRM)
ALTER TABLE "learners" OWNER TO shd_auth_admin;
ALTER TABLE "guardians" OWNER TO shd_auth_admin;
ALTER TABLE "otp_challenges" OWNER TO shd_auth_admin;
ALTER TABLE "consent_purposes" OWNER TO shd_auth_admin;
ALTER TABLE "consent_texts" OWNER TO shd_auth_admin;
ALTER TABLE "leads" OWNER TO shd_auth_admin;
ALTER TABLE "lead_signals" OWNER TO shd_auth_admin;
ALTER TABLE "crm_outbox" OWNER TO shd_auth_admin;
ALTER TABLE "crm_links" OWNER TO shd_auth_admin;
ALTER TABLE "crm_inbound_events" OWNER TO shd_auth_admin;

-- 6. shd_privacy_admin (4 bảng nhân sự, audit 5 năm, yêu cầu quyền riêng tư & cấu hình)
ALTER TABLE "staff_users" OWNER TO shd_privacy_admin;
ALTER TABLE "audit_logs" OWNER TO shd_privacy_admin;
ALTER TABLE "data_requests" OWNER TO shd_privacy_admin;
ALTER TABLE "app_settings" OWNER TO shd_privacy_admin;
