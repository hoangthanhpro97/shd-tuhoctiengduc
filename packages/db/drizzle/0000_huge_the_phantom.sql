CREATE TABLE "answer_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"correct_option_label" varchar(8) NOT NULL,
	"scoring_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answer_keys_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_type" varchar(16) NOT NULL,
	"storage_path" text NOT NULL,
	"file_size_bytes" bigint,
	"duration_seconds" integer,
	"mime_type" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_assets_asset_type" CHECK ("assets"."asset_type" IN ('audio_mp3', 'image_png', 'image_webp'))
);
--> statement-breakpoint
CREATE TABLE "content_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"reviewer_type" varchar(16) NOT NULL,
	"reviewer_id" uuid,
	"review_status" varchar(32) NOT NULL,
	"feedback_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_content_reviews_reviewer_type" CHECK ("content_reviews"."reviewer_type" IN ('ai', 'teacher')),
	CONSTRAINT "chk_content_reviews_review_status" CHECK ("content_reviews"."review_status" IN ('approved', 'rejected', 'needs_revision')),
	CONSTRAINT "chk_content_reviews_teacher" CHECK (("content_reviews"."reviewer_type" = 'teacher' AND "content_reviews"."reviewer_id" IS NOT NULL) OR ("content_reviews"."reviewer_type" = 'ai'))
);
--> statement-breakpoint
CREATE TABLE "exam_standards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "exam_standards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "exam_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"status" varchar(32) NOT NULL,
	"content_hash" varchar(64),
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_exam_versions_exam_id_version_number" UNIQUE("exam_id","version_number"),
	CONSTRAINT "chk_exam_versions_status" CHECK ("exam_versions"."status" IN ('draft', 'ai_checked', 'teacher_approved', 'published', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"standard_id" uuid NOT NULL,
	"level_id" uuid NOT NULL,
	"code" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"time_limit_seconds" integer DEFAULT 3900 NOT NULL,
	"passing_percentage" numeric(5, 2) DEFAULT '60.00' NOT NULL,
	"benchmark_scale_config" jsonb NOT NULL,
	"audio_pause_allowed" boolean DEFAULT false NOT NULL,
	"audio_max_plays" integer DEFAULT 2 NOT NULL,
	"public_explanation_count" integer DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "explanations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"explanation_text" text NOT NULL,
	"translation_text" text,
	"vocabulary_notes" jsonb,
	"is_public_preview" boolean DEFAULT false NOT NULL,
	CONSTRAINT "explanations_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "learning_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "learning_goals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" varchar(64) NOT NULL,
	"rank_order" integer NOT NULL,
	CONSTRAINT "levels_code_unique" UNIQUE("code"),
	CONSTRAINT "levels_rank_order_unique" UNIQUE("rank_order")
);
--> statement-breakpoint
CREATE TABLE "persona_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "persona_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_label" varchar(8) NOT NULL,
	"content_text" text NOT NULL,
	"option_order" integer NOT NULL,
	CONSTRAINT "uq_question_options_question_id_option_label" UNIQUE("question_id","option_label")
);
--> statement-breakpoint
CREATE TABLE "question_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(64) NOT NULL,
	"scoring_method" varchar(32) DEFAULT 'exact_match' NOT NULL,
	CONSTRAINT "question_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"stimulus_id" uuid,
	"type_id" uuid NOT NULL,
	"question_order" integer NOT NULL,
	"prompt_text" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "uq_questions_version_id_question_order" UNIQUE("version_id","question_order")
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"section_order" integer NOT NULL,
	"title" varchar(128) NOT NULL,
	"instructions" text,
	"time_limit_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(64) NOT NULL,
	CONSTRAINT "skills_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stimuli" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"part_number" integer DEFAULT 1 NOT NULL,
	"stimulus_type" varchar(16) NOT NULL,
	"title" varchar(255),
	"content_text" text,
	"asset_id" uuid,
	CONSTRAINT "chk_stimuli_stimulus_type" CHECK ("stimuli"."stimulus_type" IN ('text', 'audio', 'image')),
	CONSTRAINT "chk_stimulus_audio_asset" CHECK (("stimuli"."stimulus_type" = 'audio' AND "stimuli"."asset_id" IS NOT NULL) OR ("stimuli"."stimulus_type" != 'audio'))
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tracks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_label" varchar(8),
	"is_flagged" boolean DEFAULT false NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_attempt_answers_attempt_question" UNIQUE("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "attempt_audio_plays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"stimulus_id" uuid NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"current_session_token_hash" varchar(64),
	"expires_at" timestamp with time zone,
	CONSTRAINT "uq_attempt_audio_plays_attempt_stimulus" UNIQUE("attempt_id","stimulus_id")
);
--> statement-breakpoint
CREATE TABLE "attempt_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"full_solution_unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp with time zone,
	CONSTRAINT "attempt_entitlements_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "attempt_section_timers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"duration_seconds" integer NOT NULL,
	"started_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" varchar(16) DEFAULT 'not_started' NOT NULL,
	CONSTRAINT "uq_attempt_section_timers_attempt_section" UNIQUE("attempt_id","section_id"),
	CONSTRAINT "chk_attempt_section_timers_status" CHECK ("attempt_section_timers"."status" IN ('not_started', 'in_progress', 'completed', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "exam_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"visitor_id" uuid NOT NULL,
	"learner_id" uuid,
	"mode" varchar(16) DEFAULT 'exam' NOT NULL,
	"status" varchar(32) DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"submission_type" varchar(16),
	CONSTRAINT "chk_exam_attempts_mode" CHECK ("exam_attempts"."mode" IN ('exam', 'practice')),
	CONSTRAINT "chk_exam_attempts_status" CHECK ("exam_attempts"."status" IN ('in_progress', 'submitted', 'graded')),
	CONSTRAINT "chk_exam_attempts_submission_type" CHECK ("exam_attempts"."submission_type" IS NULL OR "exam_attempts"."submission_type" IN ('manual', 'timeout'))
);
--> statement-breakpoint
CREATE TABLE "learning_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid,
	"visitor_id" uuid,
	"event_name" varchar(64) NOT NULL,
	"event_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_item_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"is_correct" boolean NOT NULL,
	"earned_points" integer NOT NULL,
	CONSTRAINT "uq_result_item_scores_result_question" UNIQUE("result_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "result_section_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"cefr_code" varchar(16) NOT NULL,
	CONSTRAINT "uq_result_section_scores_result_section" UNIQUE("result_id","section_id")
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"total_score" integer NOT NULL,
	"max_possible_score" integer DEFAULT 30 NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"passing_percentage_snapshot" numeric(5, 2) DEFAULT '60.00' NOT NULL,
	"cefr_estimate_code" varchar(16) NOT NULL,
	"benchmark_status_code" varchar(32) NOT NULL,
	"graded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "results_attempt_id_unique" UNIQUE("attempt_id"),
	CONSTRAINT "chk_results_benchmark_status" CHECK ("results"."benchmark_status_code" IN ('pass', 'near_pass', 'not_pass'))
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_token_hash" varchar(64) NOT NULL,
	"user_agent" text,
	"ip_hash" varchar(64),
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visitors_visitor_token_hash_unique" UNIQUE("visitor_token_hash")
);
--> statement-breakpoint
CREATE TABLE "consent_purposes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_mandatory" boolean NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "consent_purposes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "consent_texts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purpose_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"target_audience" varchar(16) DEFAULT 'learner' NOT NULL,
	"legal_content" text NOT NULL,
	"recipient_entities" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_consent_texts_purpose_ver_audience" UNIQUE("purpose_id","version_number","target_audience"),
	CONSTRAINT "chk_consent_texts_target_audience" CHECK ("consent_texts"."target_audience" IN ('learner', 'guardian'))
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"consent_text_id" uuid NOT NULL,
	"given_by_guardian_id" uuid,
	"action" varchar(16) NOT NULL,
	"capture_method" varchar(32) NOT NULL,
	"user_ip_hash" varchar(64),
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_consents_action" CHECK ("consents"."action" IN ('granted', 'revoked'))
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"phone_hash" varchar(64) NOT NULL,
	"phone_encrypted" text NOT NULL,
	"relationship" varchar(32) DEFAULT 'parent' NOT NULL,
	"verification_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"zalo_tracking_id" varchar(128),
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	CONSTRAINT "guardians_learner_id_unique" UNIQUE("learner_id"),
	CONSTRAINT "chk_guardians_relationship" CHECK ("guardians"."relationship" IN ('father', 'mother', 'legal_guardian', 'parent')),
	CONSTRAINT "chk_guardians_verification_status" CHECK ("guardians"."verification_status" IN ('pending', 'approved', 'rejected', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "learners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"phone_hash" varchar(64) NOT NULL,
	"phone_encrypted" text NOT NULL,
	"email" varchar(255),
	"age_group" varchar(32) NOT NULL,
	"is_under_18" boolean DEFAULT false NOT NULL,
	"phone_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"anonymized_at" timestamp with time zone,
	CONSTRAINT "learners_phone_hash_unique" UNIQUE("phone_hash"),
	CONSTRAINT "chk_learners_age_group" CHECK ("learners"."age_group" IN ('student_under18', 'university', 'worker', 'parent')),
	CONSTRAINT "chk_learner_under18_age" CHECK (("learners"."is_under_18" = true AND "learners"."age_group" = 'student_under18') OR ("learners"."is_under_18" = false AND "learners"."age_group" != 'student_under18'))
);
--> statement-breakpoint
CREATE TABLE "otp_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"visitor_id" uuid NOT NULL,
	"phone_hash" varchar(64) NOT NULL,
	"otp_hash" varchar(64) NOT NULL,
	"channel" varchar(16) NOT NULL,
	"attempts_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_otp_challenges_channel" CHECK ("otp_challenges"."channel" IN ('sms', 'zalo_zns')),
	CONSTRAINT "chk_otp_challenges_status" CHECK ("otp_challenges"."status" IN ('pending', 'verified', 'failed', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "crm_inbound_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_event_id" varchar(64) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_inbound_events_external_event_id_unique" UNIQUE("external_event_id")
);
--> statement-breakpoint
CREATE TABLE "crm_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"one_center_student_id" varchar(64) NOT NULL,
	"crm_status" varchar(32),
	"current_enrolled_level" varchar(16),
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_links_learner_id_unique" UNIQUE("learner_id"),
	CONSTRAINT "crm_links_one_center_student_id_unique" UNIQUE("one_center_student_id")
);
--> statement-breakpoint
CREATE TABLE "crm_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" varchar(128) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"locked_by" varchar(64),
	"locked_until" timestamp with time zone,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 5 NOT NULL,
	"next_retry_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error_log" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crm_outbox_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "chk_crm_outbox_status" CHECK ("crm_outbox"."status" IN ('pending', 'processing', 'delivered', 'failed', 'dead_letter')),
	CONSTRAINT "chk_crm_outbox_payload_no_pii" CHECK (NOT ("crm_outbox"."payload" ?| ARRAY['phone', 'phone_raw', 'phone_encrypted', 'phone_decrypted', 'email', 'full_name', 'otp_code', 'password', 'parent_phone']))
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idem_key" varchar(128) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"scope" varchar(32) NOT NULL,
	"response_status" integer,
	"response_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "idempotency_keys_idem_key_unique" UNIQUE("idem_key"),
	CONSTRAINT "chk_idempotency_keys_scope" CHECK ("idempotency_keys"."scope" IN ('api_request', 'crm_outbox', 'crm_inbound'))
);
--> statement-breakpoint
CREATE TABLE "lead_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"signal_type" varchar(64) NOT NULL,
	"signal_weight" numeric(4, 2) NOT NULL,
	"metadata" jsonb,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_lead_signals_signal_type" CHECK ("lead_signals"."signal_type" IN ('registered_1on1_test', 'timeline_urgent_1m', 'timeline_1_3m', 'score_extreme_low', 'score_near_pass', 'goal_ausbildung_18b', 'full_exam_completed', 'multiple_replays'))
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"latest_attempt_id" uuid,
	"learning_goal_id" uuid NOT NULL,
	"exam_timeline" varchar(32) NOT NULL,
	"persona_type_id" uuid NOT NULL,
	"lead_temperature" varchar(16) DEFAULT 'nurture' NOT NULL,
	"total_attempts_count" integer DEFAULT 1 NOT NULL,
	"last_temperature_calculated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_learner_id_unique" UNIQUE("learner_id"),
	CONSTRAINT "chk_leads_exam_timeline" CHECK ("leads"."exam_timeline" IN ('1m', '1_3m', '3_6m', 'gt6m', 'unknown')),
	CONSTRAINT "chk_leads_lead_temperature" CHECK ("leads"."lead_temperature" IN ('hot', 'warm', 'nurture'))
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar(64) NOT NULL,
	"setting_value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_user_id" uuid,
	"action" varchar(64) NOT NULL,
	"target_entity" varchar(64) NOT NULL,
	"target_entity_id" uuid NOT NULL,
	"ip_hash" varchar(64),
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"request_type" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "chk_data_requests_request_type" CHECK ("data_requests"."request_type" IN ('export_data', 'delete_data', 'revoke_consent')),
	CONSTRAINT "chk_data_requests_status" CHECK ("data_requests"."status" IN ('pending', 'processing', 'completed', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "staff_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"role" varchar(32) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_users_email_unique" UNIQUE("email"),
	CONSTRAINT "chk_staff_users_role" CHECK ("staff_users"."role" IN ('admin', 'teacher', 'advisor', 'dpo', 'auditor'))
);
--> statement-breakpoint
ALTER TABLE "answer_keys" ADD CONSTRAINT "answer_keys_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_version_id_exam_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."exam_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewer_id_staff_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."staff_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_standards" ADD CONSTRAINT "exam_standards_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_versions" ADD CONSTRAINT "exam_versions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_standard_id_exam_standards_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."exam_standards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explanations" ADD CONSTRAINT "explanations_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_version_id_exam_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."exam_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_stimulus_id_stimuli_id_fk" FOREIGN KEY ("stimulus_id") REFERENCES "public"."stimuli"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_type_id_question_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."question_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_version_id_exam_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."exam_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stimuli" ADD CONSTRAINT "stimuli_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stimuli" ADD CONSTRAINT "stimuli_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_audio_plays" ADD CONSTRAINT "attempt_audio_plays_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_audio_plays" ADD CONSTRAINT "attempt_audio_plays_stimulus_id_stimuli_id_fk" FOREIGN KEY ("stimulus_id") REFERENCES "public"."stimuli"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_entitlements" ADD CONSTRAINT "attempt_entitlements_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_section_timers" ADD CONSTRAINT "attempt_section_timers_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_section_timers" ADD CONSTRAINT "attempt_section_timers_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_version_id_exam_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."exam_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_item_scores" ADD CONSTRAINT "result_item_scores_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_item_scores" ADD CONSTRAINT "result_item_scores_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_section_scores" ADD CONSTRAINT "result_section_scores_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_section_scores" ADD CONSTRAINT "result_section_scores_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_texts" ADD CONSTRAINT "consent_texts_purpose_id_consent_purposes_id_fk" FOREIGN KEY ("purpose_id") REFERENCES "public"."consent_purposes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_consent_text_id_consent_texts_id_fk" FOREIGN KEY ("consent_text_id") REFERENCES "public"."consent_texts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_given_by_guardian_id_guardians_id_fk" FOREIGN KEY ("given_by_guardian_id") REFERENCES "public"."guardians"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_links" ADD CONSTRAINT "crm_links_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_signals" ADD CONSTRAINT "lead_signals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_latest_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("latest_attempt_id") REFERENCES "public"."exam_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_learning_goal_id_learning_goals_id_fk" FOREIGN KEY ("learning_goal_id") REFERENCES "public"."learning_goals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_persona_type_id_persona_types_id_fk" FOREIGN KEY ("persona_type_id") REFERENCES "public"."persona_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_staff_user_id_staff_users_id_fk" FOREIGN KEY ("staff_user_id") REFERENCES "public"."staff_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_exam_published_version" ON "exam_versions" USING btree ("exam_id") WHERE "exam_versions"."status" = 'published';