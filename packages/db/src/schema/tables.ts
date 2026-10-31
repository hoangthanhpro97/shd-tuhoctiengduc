import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  bigint,
  check,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ==============================================================================
// PHÂN HỆ 1: NỘI DUNG ĐỀ THI & BẢNG TRA CỨU (17 BẢNG)
// ==============================================================================

// 1. tracks
export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 2. exam_standards
export const examStandards = pgTable('exam_standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackId: uuid('track_id')
    .notNull()
    .references(() => tracks.id, { onDelete: 'restrict' }),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// 3. levels
export const levels = pgTable('levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 16 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  rankOrder: integer('rank_order').notNull().unique(),
});

// 4. skills
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
});

// 5. question_types
export const questionTypes = pgTable('question_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  scoringMethod: varchar('scoring_method', { length: 32 }).notNull().default('exact_match'),
});

// 6. learning_goals
export const learningGoals = pgTable('learning_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// 7. persona_types
export const personaTypes = pgTable('persona_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// 8. exams
export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  standardId: uuid('standard_id')
    .notNull()
    .references(() => examStandards.id, { onDelete: 'restrict' }),
  levelId: uuid('level_id')
    .notNull()
    .references(() => levels.id, { onDelete: 'restrict' }),
  code: varchar('code', { length: 64 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  timeLimitSeconds: integer('time_limit_seconds').notNull().default(3900),
  passingPercentage: numeric('passing_percentage', { precision: 5, scale: 2 }).notNull().default('60.00'),
  benchmarkScaleConfig: jsonb('benchmark_scale_config').notNull(),
  audioPauseAllowed: boolean('audio_pause_allowed').notNull().default(false),
  audioMaxPlays: integer('audio_max_plays').notNull().default(2),
  publicExplanationCount: integer('public_explanation_count').notNull().default(2),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 9. exam_versions
export const examVersions = pgTable(
  'exam_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    examId: uuid('exam_id')
      .notNull()
      .references(() => exams.id, { onDelete: 'restrict' }),
    versionNumber: integer('version_number').notNull(),
    status: varchar('status', { length: 32 }).notNull(),
    contentHash: varchar('content_hash', { length: 64 }),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_exam_versions_exam_id_version_number').on(table.examId, table.versionNumber),
    uniqueIndex('uq_exam_published_version')
      .on(table.examId)
      .where(sql`${table.status} = 'published'`),
    check(
      'chk_exam_versions_status',
      sql`${table.status} IN ('draft', 'ai_checked', 'teacher_approved', 'published', 'archived')`
    ),
  ]
);

// 40. staff_users (được định nghĩa sớm để content_reviews và audit_logs tham chiếu)
export const staffUsers = pgTable(
  'staff_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('full_name', { length: 128 }).notNull(),
    role: varchar('role', { length: 32 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_staff_users_role',
      sql`${table.role} IN ('admin', 'teacher', 'advisor', 'dpo', 'auditor')`
    ),
  ]
);

// 10. content_reviews
export const contentReviews = pgTable(
  'content_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => examVersions.id, { onDelete: 'restrict' }),
    reviewerType: varchar('reviewer_type', { length: 16 }).notNull(),
    reviewerId: uuid('reviewer_id').references(() => staffUsers.id, { onDelete: 'restrict' }),
    reviewStatus: varchar('review_status', { length: 32 }).notNull(),
    feedbackNotes: text('feedback_notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_content_reviews_reviewer_type',
      sql`${table.reviewerType} IN ('ai', 'teacher')`
    ),
    check(
      'chk_content_reviews_review_status',
      sql`${table.reviewStatus} IN ('approved', 'rejected', 'needs_revision')`
    ),
    check(
      'chk_content_reviews_teacher',
      sql`(${table.reviewerType} = 'teacher' AND ${table.reviewerId} IS NOT NULL) OR (${table.reviewerType} = 'ai')`
    ),
  ]
);

// 11. sections
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id')
    .notNull()
    .references(() => examVersions.id, { onDelete: 'restrict' }),
  skillId: uuid('skill_id')
    .notNull()
    .references(() => skills.id, { onDelete: 'restrict' }),
  sectionOrder: integer('section_order').notNull(),
  title: varchar('title', { length: 128 }).notNull(),
  instructions: text('instructions'),
  timeLimitSeconds: integer('time_limit_seconds'),
});

// 12. assets
export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assetType: varchar('asset_type', { length: 16 }).notNull(),
    storagePath: text('storage_path').notNull(),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
    durationSeconds: integer('duration_seconds'),
    mimeType: varchar('mime_type', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_assets_asset_type',
      sql`${table.assetType} IN ('audio_mp3', 'image_png', 'image_webp')`
    ),
  ]
);

// 13. stimuli
export const stimuli = pgTable(
  'stimuli',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'restrict' }),
    partNumber: integer('part_number').notNull().default(1),
    stimulusType: varchar('stimulus_type', { length: 16 }).notNull(),
    title: varchar('title', { length: 255 }),
    contentText: text('content_text'),
    assetId: uuid('asset_id').references(() => assets.id, { onDelete: 'restrict' }),
  },
  (table) => [
    check(
      'chk_stimuli_stimulus_type',
      sql`${table.stimulusType} IN ('text', 'audio', 'image')`
    ),
    check(
      'chk_stimulus_audio_asset',
      sql`(${table.stimulusType} = 'audio' AND ${table.assetId} IS NOT NULL) OR (${table.stimulusType} != 'audio')`
    ),
  ]
);

// 14. questions
export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => examVersions.id, { onDelete: 'restrict' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'restrict' }),
    stimulusId: uuid('stimulus_id').references(() => stimuli.id, { onDelete: 'restrict' }),
    typeId: uuid('type_id')
      .notNull()
      .references(() => questionTypes.id, { onDelete: 'restrict' }),
    questionOrder: integer('question_order').notNull(),
    promptText: text('prompt_text').notNull(),
    points: integer('points').notNull().default(1),
  },
  (table) => [
    unique('uq_questions_version_id_question_order').on(table.versionId, table.questionOrder),
  ]
);

// 15. question_options
export const questionOptions = pgTable(
  'question_options',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'restrict' }),
    optionLabel: varchar('option_label', { length: 8 }).notNull(),
    contentText: text('content_text').notNull(),
    optionOrder: integer('option_order').notNull(),
  },
  (table) => [
    unique('uq_question_options_question_id_option_label').on(table.questionId, table.optionLabel),
  ]
);

// 16. answer_keys
export const answerKeys = pgTable('answer_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id')
    .notNull()
    .unique()
    .references(() => questions.id, { onDelete: 'restrict' }),
  correctOptionLabel: varchar('correct_option_label', { length: 8 }).notNull(),
  scoringNotes: text('scoring_notes'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 17. explanations
export const explanations = pgTable('explanations', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id')
    .notNull()
    .unique()
    .references(() => questions.id, { onDelete: 'restrict' }),
  explanationText: text('explanation_text').notNull(),
  translationText: text('translation_text'),
  vocabularyNotes: jsonb('vocabulary_notes'),
  isPublicPreview: boolean('is_public_preview').notNull().default(false),
});

// ==============================================================================
// PHÂN HỆ 2: LÀM BÀI & CHẤM ĐIỂM (10 BẢNG)
// ==============================================================================

// 18. visitors
export const visitors = pgTable('visitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorTokenHash: varchar('visitor_token_hash', { length: 64 }).notNull().unique(),
  userAgent: text('user_agent'),
  ipHash: varchar('ip_hash', { length: 64 }),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 28. learners (định nghĩa sớm để exam_attempts tham chiếu)
export const learners = pgTable(
  'learners',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fullName: varchar('full_name', { length: 128 }).notNull(),
    phoneHash: varchar('phone_hash', { length: 64 }).notNull().unique(),
    phoneEncrypted: text('phone_encrypted').notNull(),
    email: varchar('email', { length: 255 }),
    ageGroup: varchar('age_group', { length: 32 }).notNull(),
    isUnder18: boolean('is_under_18').notNull().default(false),
    phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    anonymizedAt: timestamp('anonymized_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    check(
      'chk_learners_age_group',
      sql`${table.ageGroup} IN ('student_under18', 'university', 'worker', 'parent')`
    ),
    check(
      'chk_learner_under18_age',
      sql`(${table.isUnder18} = true AND ${table.ageGroup} = 'student_under18') OR (${table.isUnder18} = false AND ${table.ageGroup} != 'student_under18')`
    ),
  ]
);

// 19. exam_attempts
export const examAttempts = pgTable(
  'exam_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => examVersions.id, { onDelete: 'restrict' }),
    visitorId: uuid('visitor_id')
      .notNull()
      .references(() => visitors.id, { onDelete: 'restrict' }),
    learnerId: uuid('learner_id').references(() => learners.id, { onDelete: 'restrict' }),
    mode: varchar('mode', { length: 16 }).notNull().default('exam'),
    status: varchar('status', { length: 32 }).notNull().default('in_progress'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' }),
    submissionType: varchar('submission_type', { length: 16 }),
  },
  (table) => [
    check('chk_exam_attempts_mode', sql`${table.mode} IN ('exam', 'practice')`),
    check('chk_exam_attempts_status', sql`${table.status} IN ('in_progress', 'submitted', 'graded')`),
    check(
      'chk_exam_attempts_submission_type',
      sql`${table.submissionType} IS NULL OR ${table.submissionType} IN ('manual', 'timeout')`
    ),
  ]
);

// 20. attempt_section_timers
export const attemptSectionTimers = pgTable(
  'attempt_section_timers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => examAttempts.id, { onDelete: 'restrict' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'restrict' }),
    durationSeconds: integer('duration_seconds').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
    status: varchar('status', { length: 16 }).notNull().default('not_started'),
  },
  (table) => [
    unique('uq_attempt_section_timers_attempt_section').on(table.attemptId, table.sectionId),
    check(
      'chk_attempt_section_timers_status',
      sql`${table.status} IN ('not_started', 'in_progress', 'completed', 'expired')`
    ),
  ]
);

// 21. attempt_answers
export const attemptAnswers = pgTable(
  'attempt_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => examAttempts.id, { onDelete: 'restrict' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'restrict' }),
    selectedOptionLabel: varchar('selected_option_label', { length: 8 }),
    isFlagged: boolean('is_flagged').notNull().default(false),
    revision: integer('revision').notNull().default(1),
    answeredAt: timestamp('answered_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_attempt_answers_attempt_question').on(table.attemptId, table.questionId),
  ]
);

// 22. attempt_audio_plays
export const attemptAudioPlays = pgTable(
  'attempt_audio_plays',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => examAttempts.id, { onDelete: 'restrict' }),
    stimulusId: uuid('stimulus_id')
      .notNull()
      .references(() => stimuli.id, { onDelete: 'restrict' }),
    playCount: integer('play_count').notNull().default(0),
    currentSessionTokenHash: varchar('current_session_token_hash', { length: 64 }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    unique('uq_attempt_audio_plays_attempt_stimulus').on(table.attemptId, table.stimulusId),
  ]
);

// 23. attempt_entitlements
export const attemptEntitlements = pgTable('attempt_entitlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id')
    .notNull()
    .unique()
    .references(() => examAttempts.id, { onDelete: 'restrict' }),
  fullSolutionUnlocked: boolean('full_solution_unlocked').notNull().default(false),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true, mode: 'date' }),
});

// 24. results
export const results = pgTable(
  'results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .unique()
      .references(() => examAttempts.id, { onDelete: 'restrict' }),
    totalScore: integer('total_score').notNull(),
    maxPossibleScore: integer('max_possible_score').notNull().default(30),
    percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(),
    passingPercentageSnapshot: numeric('passing_percentage_snapshot', { precision: 5, scale: 2 })
      .notNull()
      .default('60.00'),
    cefrEstimateCode: varchar('cefr_estimate_code', { length: 16 }).notNull(),
    benchmarkStatusCode: varchar('benchmark_status_code', { length: 32 }).notNull(),
    gradedAt: timestamp('graded_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_results_benchmark_status',
      sql`${table.benchmarkStatusCode} IN ('pass', 'near_pass', 'not_pass')`
    ),
  ]
);

// 25. result_section_scores
export const resultSectionScores = pgTable(
  'result_section_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resultId: uuid('result_id')
      .notNull()
      .references(() => results.id, { onDelete: 'restrict' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'restrict' }),
    score: integer('score').notNull(),
    maxScore: integer('max_score').notNull(),
    cefrCode: varchar('cefr_code', { length: 16 }).notNull(),
  },
  (table) => [
    unique('uq_result_section_scores_result_section').on(table.resultId, table.sectionId),
  ]
);

// 26. result_item_scores
export const resultItemScores = pgTable(
  'result_item_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resultId: uuid('result_id')
      .notNull()
      .references(() => results.id, { onDelete: 'restrict' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'restrict' }),
    isCorrect: boolean('is_correct').notNull(),
    earnedPoints: integer('earned_points').notNull(),
  },
  (table) => [
    unique('uq_result_item_scores_result_question').on(table.resultId, table.questionId),
  ]
);

// 27. learning_events
export const learningEvents = pgTable('learning_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id').references(() => examAttempts.id, { onDelete: 'restrict' }),
  visitorId: uuid('visitor_id').references(() => visitors.id, { onDelete: 'restrict' }),
  eventName: varchar('event_name', { length: 64 }).notNull(),
  eventPayload: jsonb('event_payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// ==============================================================================
// PHÂN HỆ 3: NGƯỜI HỌC, PHỤ HUYNH, XÁC THỰC & ĐỒNG Ý (6 BẢNG)
// ==============================================================================

// 29. guardians
export const guardians = pgTable(
  'guardians',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .unique()
      .references(() => learners.id, { onDelete: 'restrict' }),
    phoneHash: varchar('phone_hash', { length: 64 }).notNull(),
    phoneEncrypted: text('phone_encrypted').notNull(),
    relationship: varchar('relationship', { length: 32 }).notNull().default('parent'),
    verificationStatus: varchar('verification_status', { length: 32 }).notNull().default('pending'),
    zaloTrackingId: varchar('zalo_tracking_id', { length: 128 }),
    requestedAt: timestamp('requested_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    check(
      'chk_guardians_relationship',
      sql`${table.relationship} IN ('father', 'mother', 'legal_guardian', 'parent')`
    ),
    check(
      'chk_guardians_verification_status',
      sql`${table.verificationStatus} IN ('pending', 'approved', 'rejected', 'expired')`
    ),
  ]
);

// 30. otp_challenges
export const otpChallenges = pgTable(
  'otp_challenges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => examAttempts.id, { onDelete: 'restrict' }),
    visitorId: uuid('visitor_id')
      .notNull()
      .references(() => visitors.id, { onDelete: 'restrict' }),
    phoneHash: varchar('phone_hash', { length: 64 }).notNull(),
    otpHash: varchar('otp_hash', { length: 64 }).notNull(),
    channel: varchar('channel', { length: 16 }).notNull(),
    attemptsCount: integer('attempts_count').notNull().default(0),
    status: varchar('status', { length: 16 }).notNull().default('pending'),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check('chk_otp_challenges_channel', sql`${table.channel} IN ('sms', 'zalo_zns')`),
    check(
      'chk_otp_challenges_status',
      sql`${table.status} IN ('pending', 'verified', 'failed', 'expired')`
    ),
  ]
);

// 31. consent_purposes
export const consentPurposes = pgTable('consent_purposes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  isMandatory: boolean('is_mandatory').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// 32. consent_texts
export const consentTexts = pgTable(
  'consent_texts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    purposeId: uuid('purpose_id')
      .notNull()
      .references(() => consentPurposes.id, { onDelete: 'restrict' }),
    versionNumber: integer('version_number').notNull(),
    targetAudience: varchar('target_audience', { length: 16 }).notNull().default('learner'),
    legalContent: text('legal_content').notNull(),
    recipientEntities: text('recipient_entities').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_consent_texts_target_audience',
      sql`${table.targetAudience} IN ('learner', 'guardian')`
    ),
    unique('uq_consent_texts_purpose_ver_audience').on(
      table.purposeId,
      table.versionNumber,
      table.targetAudience
    ),
  ]
);

// 33. consents
export const consents = pgTable(
  'consents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => learners.id, { onDelete: 'restrict' }),
    consentTextId: uuid('consent_text_id')
      .notNull()
      .references(() => consentTexts.id, { onDelete: 'restrict' }),
    givenByGuardianId: uuid('given_by_guardian_id').references(() => guardians.id, {
      onDelete: 'restrict',
    }),
    action: varchar('action', { length: 16 }).notNull(),
    captureMethod: varchar('capture_method', { length: 32 }).notNull(),
    userIpHash: varchar('user_ip_hash', { length: 64 }),
    recordedAt: timestamp('recorded_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [check('chk_consents_action', sql`${table.action} IN ('granted', 'revoked')`)]
);

// ==============================================================================
// PHÂN HỆ 4: LEAD TUYỂN SINH, CRM OUTBOX & IDEMPOTENCY KEYS (6 BẢNG)
// ==============================================================================

// 34. leads
export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .unique()
      .references(() => learners.id, { onDelete: 'restrict' }),
    latestAttemptId: uuid('latest_attempt_id').references(() => examAttempts.id, {
      onDelete: 'restrict',
    }),
    learningGoalId: uuid('learning_goal_id')
      .notNull()
      .references(() => learningGoals.id, { onDelete: 'restrict' }),
    examTimeline: varchar('exam_timeline', { length: 32 }).notNull(),
    personaTypeId: uuid('persona_type_id')
      .notNull()
      .references(() => personaTypes.id, { onDelete: 'restrict' }),
    leadTemperature: varchar('lead_temperature', { length: 16 }).notNull().default('nurture'),
    totalAttemptsCount: integer('total_attempts_count').notNull().default(1),
    lastTemperatureCalculatedAt: timestamp('last_temperature_calculated_at', {
      withTimezone: true,
      mode: 'date',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_leads_exam_timeline',
      sql`${table.examTimeline} IN ('1m', '1_3m', '3_6m', 'gt6m', 'unknown')`
    ),
    check(
      'chk_leads_lead_temperature',
      sql`${table.leadTemperature} IN ('hot', 'warm', 'nurture')`
    ),
  ]
);

// 35. lead_signals
export const leadSignals = pgTable(
  'lead_signals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'restrict' }),
    signalType: varchar('signal_type', { length: 64 }).notNull(),
    signalWeight: numeric('signal_weight', { precision: 4, scale: 2 }).notNull(),
    metadata: jsonb('metadata'),
    capturedAt: timestamp('captured_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_lead_signals_signal_type',
      sql`${table.signalType} IN ('registered_1on1_test', 'timeline_urgent_1m', 'timeline_1_3m', 'score_extreme_low', 'score_near_pass', 'goal_ausbildung_18b', 'full_exam_completed', 'multiple_replays')`
    ),
  ]
);

// 36. crm_outbox
export const crmOutbox = pgTable(
  'crm_outbox',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    idempotencyKey: varchar('idempotency_key', { length: 128 }).notNull().unique(),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    aggregateId: uuid('aggregate_id').notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 16 }).notNull().default('pending'),
    lockedBy: varchar('locked_by', { length: 64 }),
    lockedUntil: timestamp('locked_until', { withTimezone: true, mode: 'date' }),
    retryCount: integer('retry_count').notNull().default(0),
    maxRetries: integer('max_retries').notNull().default(5),
    nextRetryAt: timestamp('next_retry_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    errorLog: text('error_log'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'chk_crm_outbox_status',
      sql`${table.status} IN ('pending', 'processing', 'delivered', 'failed', 'dead_letter')`
    ),
    check(
      'chk_crm_outbox_payload_no_pii',
      sql`NOT (${table.payload} ?| ARRAY['phone', 'phone_raw', 'phone_encrypted', 'phone_decrypted', 'email', 'full_name', 'otp_code', 'password', 'parent_phone'])`
    ),
  ]
);

// 37. crm_links
export const crmLinks = pgTable('crm_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerId: uuid('learner_id')
    .notNull()
    .unique()
    .references(() => learners.id, { onDelete: 'restrict' }),
  oneCenterStudentId: varchar('one_center_student_id', { length: 64 }).notNull().unique(),
  crmStatus: varchar('crm_status', { length: 32 }),
  currentEnrolledLevel: varchar('current_enrolled_level', { length: 16 }),
  syncedAt: timestamp('synced_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 38. crm_inbound_events
export const crmInboundEvents = pgTable('crm_inbound_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalEventId: varchar('external_event_id', { length: 64 }).notNull().unique(),
  eventType: varchar('event_type', { length: 64 }).notNull(),
  payload: jsonb('payload').notNull(),
  processed: boolean('processed').notNull().default(false),
  receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 39. idempotency_keys
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    idemKey: varchar('idem_key', { length: 128 }).notNull().unique(),
    requestHash: varchar('request_hash', { length: 64 }).notNull(),
    scope: varchar('scope', { length: 32 }).notNull(),
    responseStatus: integer('response_status'),
    responsePayload: jsonb('response_payload'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    check(
      'chk_idempotency_keys_scope',
      sql`${table.scope} IN ('api_request', 'crm_outbox', 'crm_inbound')`
    ),
  ]
);

// ==============================================================================
// PHÂN HỆ 5: QUẢN TRỊ & VẬN HÀNH (4 BẢNG - staffUsers đã ở trên)
// ==============================================================================

// 41. audit_logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffUserId: uuid('staff_user_id').references(() => staffUsers.id, { onDelete: 'restrict' }),
  action: varchar('action', { length: 64 }).notNull(),
  targetEntity: varchar('target_entity', { length: 64 }).notNull(),
  targetEntityId: uuid('target_entity_id').notNull(),
  ipHash: varchar('ip_hash', { length: 64 }),
  details: text('details'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// 42. data_requests
export const dataRequests = pgTable(
  'data_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => learners.id, { onDelete: 'restrict' }),
    requestType: varchar('request_type', { length: 32 }).notNull(),
    status: varchar('status', { length: 16 }).notNull().default('pending'),
    requestedAt: timestamp('requested_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    check(
      'chk_data_requests_request_type',
      sql`${table.requestType} IN ('export_data', 'delete_data', 'revoke_consent')`
    ),
    check(
      'chk_data_requests_status',
      sql`${table.status} IN ('pending', 'processing', 'completed', 'rejected')`
    ),
  ]
);

// 43. app_settings
export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  settingKey: varchar('setting_key', { length: 64 }).notNull().unique(),
  settingValue: jsonb('setting_value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

