# Thiết Kế Kiến Trúc Dữ Liệu & Data Model (Data Architecture Specification)

> **Tài liệu:** `docs/architecture/02-data-model.md`  
> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Phiên bản:** v1.3 (Hoàn thiện kiến trúc Zero-Direct-Write & Security Definer Gateways - Hard Gate 1)  
> **Vai trò:** Data Architect & Lead Systems Engineer  
> **Tài liệu đầu vào:** `docs/ux/00-assumptions.md`, `docs/ux/02-user-flows.md`, `docs/ux/03-screen-inventory.md`, `docs/ux/08-sample-exam-spec.md`, `docs/engineering-rules.md`.  
> **Trạng thái:** Chờ Duyệt (Điểm Dừng 1 - Hard Gate 1)

---

## 1. Tổng Quan Kiến Trúc & Các Quyết Định Bất Biến Đã Chốt

Mô hình dữ liệu của nền tảng được thiết kế xoay quanh 7 nguyên tắc kiến trúc cốt lõi:
1. **Server-Side Grading & Cô Lập Quyền Hạn Bằng Security Definer:** Bảng `answer_keys` lưu trữ đáp án đúng hoàn toàn độc lập với bảng câu hỏi. Role ứng dụng `shd_app` bị thu hồi quyền `SELECT` trên bảng `answer_keys` ở cấp độ PostgreSQL. Việc chấm điểm được thực thi thông qua hàm `SECURITY DEFINER` `grade_attempt(p_attempt_id, p_caller_token_hash)` thuộc sở hữu của role `shd_grader` (`NOLOGIN`), cố định `search_path = pg_catalog, public`. Role `shd_grader` phụ trách chấm thi biệt lập và hoàn toàn không có quyền đọc bảng dữ liệu định danh cá nhân (PII).
2. **Nguyên Tắc Zero-Direct-Write Trên Các Bảng Bảo Mật:** Role ứng dụng `shd_app` **hoàn toàn không có quyền `INSERT`, `UPDATE`, `DELETE` trực tiếp** trên bất kỳ bảng nào chứa cột bảo mật, quyền lợi hoặc trạng thái (`exam_attempts`, `attempt_section_timers`, `attempt_audio_plays`, `attempt_entitlements`, `learners`, `otp_challenges`, `lead_signals`, `exam_versions`, `data_requests`, `app_settings`...). Mọi thao tác ghi hoặc chuyển trạng thái bắt buộc phải đi qua các hàm `SECURITY DEFINER` do các role chuyên trách `NOLOGIN` sở hữu (`shd_grader`, `shd_auth_admin`, `shd_attempt_mgr`, `shd_exam_admin`, `shd_privacy_admin`), với `search_path = pg_catalog, public` cố định, và **tự xác minh danh tính người gọi** từ token phiên đã băm (cho học viên/khách qua bảng `visitors`/`learners`) hoặc claim SSO (cho nhân viên qua bảng `staff_users`), tuyệt đối không nhận danh tính từ tham số tự do.
3. **Phiên Bản Đề Bất Biến (Immutable Exam Versions):** Đề thi được quản lý theo vòng đời phiên bản (`draft` $\rightarrow$ `ai_checked` $\rightarrow$ `teacher_approved` $\rightarrow$ `published` $\rightarrow$ `archived`). Khi đã chuyển sang `published`, toàn bộ cây nội dung (sections, stimuli, questions, options, answer_keys, explanations) bị khóa cứng bằng database trigger. Mọi thao tác chuyển trạng thái xuất bản bắt buộc thông qua hàm quản trị `publish_exam_version()`.
4. **Sổ Cái Đồng Ý Chỉ-Ghi-Thêm (Append-Only Consent Ledger):** Mọi hành vi cho phép hoặc rút lại sự đồng ý xử lý dữ liệu cá nhân đều được ghi thành dòng mới trong bảng `consents`. Trạng thái đồng ý hiện hành và khả năng liên hệ lead (`v_contactable_leads`) được suy ra thông qua database views có cờ `security_barrier`, tuân thủ Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP.
5. **Bảo Mật PII & Mã Hóa Có Phong Bì (Envelope Encryption):** Số điện thoại và dữ liệu nhạy cảm được mã hóa đối xứng AES-256-GCM theo cấu trúc Envelope chứa `{v, kid, iv, tag, ct}` hỗ trợ xoay khóa không downtime. Số điện thoại, địa chỉ IP, mã token khách vãng lai (`visitor_token`) và token phiên phát audio (`current_session_token`) đều được lưu dạng băm HMAC-SHA256 với các khóa bí mật riêng biệt (`PHONE_HASH_PEPPER`, `IP_HASH_PEPPER`, `TOKEN_HASH_PEPPER`, `AUDIO_TOKEN_PEPPER`) để tra cứu chống trùng lặp mà không lộ dữ liệu thô.
6. **Khả Năng Mở Rộng Đa Ngôn Ngữ & Lookup Data (Non-German Hardcoded):** Không dùng enum cố định gắn với tiếng Đức. Các trục phân loại Ngôn ngữ (`tracks`), Chuẩn khảo thí (`exam_standards`), Cấp độ CEFR (`levels`), Kỹ năng (`skills`), Dạng câu hỏi (`question_types`), Mục tiêu học (`learning_goals`), và Nhóm đối tượng (`persona_types`) đều được quản lý bằng bảng tra cứu (lookup tables) có ràng buộc toàn vẹn.
7. **Đồng Hồ Tổng Luôn Thắng & Quản Lý Cưỡng Chế Server:** Thời điểm kết thúc phiên làm bài tổng (`exam_attempts.expires_at`) luôn cưỡng chế nộp bài bất kể section timer. Mọi bài thi quá hạn tự động được đóng nguyên tử bởi hàm `finalize_expired_attempts()` của worker sau khoảng ân hạn 60 giây.

---

## 2. Sơ Đồ Thực Thể - Mối Quan Hệ (Entity-Relationship Diagrams v1.3)

Hệ thống bao gồm **43 bảng logic** được chia thành 5 phân hệ dữ liệu:

```mermaid
classDiagram
    direction TB
    class Tracks {
        UUID id PK
        string code UK
        string name
        bool is_active
    }
    class ExamStandards {
        UUID id PK
        UUID track_id FK
        string code UK
        string name
    }
    class Levels {
        UUID id PK
        string code UK
        string name
        int rank_order
    }
    class Skills {
        UUID id PK
        string code UK
        string name
    }
    class QuestionTypes {
        UUID id PK
        string code UK
        string name
    }
    class LearningGoals {
        UUID id PK
        string code UK
        string name
    }
    class PersonaTypes {
        UUID id PK
        string code UK
        string name
    }
    class Exams {
        UUID id PK
        UUID standard_id FK
        UUID level_id FK
        string code UK
        string title
        int time_limit_seconds
        numeric passing_percentage
        jsonb benchmark_scale_config
        bool audio_pause_allowed
        int audio_max_plays
        int public_explanation_count
    }
    class ExamVersions {
        UUID id PK
        UUID exam_id FK
        int version_number
        string status
        string content_hash
        timestamptz published_at
    }
    class ContentReviews {
        UUID id PK
        UUID version_id FK
        string reviewer_type
        UUID reviewer_id FK
        string review_status
        text feedback_notes
    }
    class Sections {
        UUID id PK
        UUID version_id FK
        UUID skill_id FK
        int section_order
        string title
        int time_limit_seconds
    }
    class Stimuli {
        UUID id PK
        UUID section_id FK
        int part_number
        string stimulus_type
        text content_text
        UUID asset_id FK
    }
    class Assets {
        UUID id PK
        string asset_type
        text storage_path
        int duration_seconds
    }
    class Questions {
        UUID id PK
        UUID version_id FK
        UUID section_id FK
        UUID stimulus_id FK
        UUID type_id FK
        int question_order
        text prompt_text
        int points
    }
    class QuestionOptions {
        UUID id PK
        UUID question_id FK
        string option_label
        text content_text
    }
    class AnswerKeys {
        UUID id PK
        UUID question_id FK UK
        string correct_option_label
        text scoring_notes
    }
    class Explanations {
        UUID id PK
        UUID question_id FK UK
        text explanation_text
        text translation_text
        bool is_public_preview
    }

    Tracks "1" <-- "n" ExamStandards
    ExamStandards "1" <-- "n" Exams
    Levels "1" <-- "n" Exams
    Exams "1" <-- "n" ExamVersions
    ExamVersions "1" <-- "n" ContentReviews
    ExamVersions "1" <-- "n" Sections
    ExamVersions "1" <-- "n" Questions
    Skills "1" <-- "n" Sections
    Sections "1" <-- "n" Stimuli
    Sections "1" <-- "n" Questions
    Stimuli "0..1" <-- "n" Questions
    Assets "0..1" <-- "n" Stimuli
    QuestionTypes "1" <-- "n" Questions
    Questions "1" <-- "n" QuestionOptions
    Questions "1" <-- "1" AnswerKeys
    Questions "1" <-- "1" Explanations
```

### 2.1. Phân Hệ 2: Làm Bài & Chấm Điểm (Attempts, Section Timers & Results)

```mermaid
classDiagram
    direction TB
    class Visitors {
        UUID id PK
        string visitor_token_hash UK
        string user_agent
        string ip_hash
        timestamptz first_seen_at
        timestamptz last_active_at
    }
    class ExamAttempts {
        UUID id PK
        UUID version_id FK
        UUID visitor_id FK
        UUID learner_id FK
        string mode
        string status
        timestamptz started_at
        timestamptz expires_at
        timestamptz submitted_at
        string submission_type
    }
    class AttemptSectionTimers {
        UUID id PK
        UUID attempt_id FK
        UUID section_id FK
        int duration_seconds
        timestamptz started_at
        timestamptz expires_at
        string status
    }
    class AttemptAnswers {
        UUID id PK
        UUID attempt_id FK
        UUID question_id FK
        string selected_option_label
        bool is_flagged
        int revision
        timestamptz answered_at
    }
    class AttemptAudioPlays {
        UUID id PK
        UUID attempt_id FK
        UUID stimulus_id FK
        int play_count
        string current_session_token_hash
        timestamptz session_expires_at
        timestamptz last_played_at
    }
    class AttemptEntitlements {
        UUID id PK
        UUID attempt_id FK UK
        bool full_solution_unlocked
        timestamptz unlocked_at
        string unlock_source
    }
    class Results {
        UUID id PK
        UUID attempt_id FK UK
        int total_score
        int max_score
        numeric percentage
        numeric passing_percentage_snapshot
        string benchmark_status_code
        string cefr_estimate_code
        timestamptz calculated_at
    }
    class ResultSectionScores {
        UUID id PK
        UUID result_id FK
        UUID section_id FK
        UUID skill_id FK
        int score
        int max_score
        numeric percentage
    }
    class ResultItemScores {
        UUID id PK
        UUID result_id FK
        UUID question_id FK
        bool is_correct
        int earned_points
    }
    class LearningEvents {
        UUID id PK
        UUID attempt_id FK
        UUID visitor_id FK
        string event_name
        jsonb event_payload
        timestamptz created_at
    }

    Visitors "1" <-- "n" ExamAttempts
    ExamAttempts "1" <-- "n" AttemptSectionTimers
    ExamAttempts "1" <-- "n" AttemptAnswers
    ExamAttempts "1" <-- "n" AttemptAudioPlays
    ExamAttempts "1" <-- "1" AttemptEntitlements
    ExamAttempts "1" <-- "1" Results
    Results "1" <-- "n" ResultSectionScores
    Results "1" <-- "n" ResultItemScores
    ExamAttempts "1" <-- "n" LearningEvents
```

### 2.2. Phân Hệ 3: Người Học, Phụ Huynh, Xác Thực OTP & Sổ Cái Đồng Ý

```mermaid
classDiagram
    direction TB
    class Learners {
        UUID id PK
        string full_name
        string phone_hash UK
        text phone_encrypted
        string email
        string age_group
        bool is_under_18
        timestamptz phone_verified_at
        timestamptz created_at
        timestamptz anonymized_at
    }
    class Guardians {
        UUID id PK
        UUID learner_id FK UK
        string parent_phone_hash
        text parent_phone_encrypted
        string verification_status
        timestamptz requested_at
        timestamptz verified_at
        string zns_message_id
    }
    class OtpChallenges {
        UUID id PK
        UUID visitor_id FK
        UUID attempt_id FK
        string phone_hash
        string otp_hash
        string channel
        int attempts_count
        string status
        timestamptz expires_at
        timestamptz created_at
    }
    class ConsentPurposes {
        UUID id PK
        string code UK
        string name
        bool is_mandatory
    }
    class ConsentTexts {
        UUID id PK
        UUID purpose_id FK
        int version_number
        string target_audience
        text legal_content
        text recipient_entities
        timestamptz published_at
    }
    class Consents {
        UUID id PK
        UUID learner_id FK
        UUID consent_text_id FK
        UUID given_by_guardian_id FK
        string action
        string capture_method
        string user_ip_hash
        timestamptz recorded_at
    }

    Learners "1" <-- "0..1" Guardians
    Learners "1" <-- "n" Consents
    Guardians "0..1" <-- "n" Consents
    ConsentPurposes "1" <-- "n" ConsentTexts
    ConsentTexts "1" <-- "n" Consents
    Learners "1" <-- "n" ExamAttempts
    ExamAttempts "0..1" <-- "n" OtpChallenges
```

### 2.3. Phân Hệ 4: Lead Tuyển Sinh, Tín Hiệu Điểm, CRM Outbox Có Lease & Khóa Idempotency

```mermaid
classDiagram
    direction TB
    class Leads {
        UUID id PK
        UUID learner_id FK UK
        UUID latest_attempt_id FK
        UUID learning_goal_id FK
        string exam_timeline
        UUID persona_type_id FK
        string lead_temperature
        int total_attempts_count
        timestamptz last_temperature_calculated_at
        timestamptz created_at
    }
    class LeadSignals {
        UUID id PK
        UUID lead_id FK
        string signal_type
        numeric signal_weight
        jsonb metadata
        timestamptz captured_at
    }
    class CrmOutbox {
        UUID id PK
        string idempotency_key UK
        string event_type
        UUID aggregate_id
        jsonb payload
        string status
        string locked_by
        timestamptz locked_until
        int retry_count
        int max_retries
        timestamptz next_retry_at
        text error_log
        timestamptz created_at
    }
    class CrmLinks {
        UUID id PK
        UUID learner_id FK UK
        string one_center_student_id UK
        string crm_status
        string current_enrolled_level
        timestamptz synced_at
    }
    class CrmInboundEvents {
        UUID id PK
        string external_event_id UK
        string event_type
        jsonb payload
        bool processed
        timestamptz received_at
    }
    class IdempotencyKeys {
        UUID id PK
        string idem_key UK
        string request_hash
        string scope
        int response_status
        jsonb response_payload
        timestamptz created_at
        timestamptz expires_at
    }

    Learners "1" <-- "1" Leads
    Leads "1" <-- "n" LeadSignals
    LearningGoals "1" <-- "n" Leads
    PersonaTypes "1" <-- "n" Leads
    Learners "1" <-- "1" CrmLinks
    Leads .. CrmOutbox : Outbox Pattern
```

### 2.4. Phân Hệ 5: Quản Trị & Vận Hành (Staff, Audit Logs 5 Năm & Data Requests)

```mermaid
classDiagram
    direction TB
    class StaffUsers {
        UUID id PK
        string email UK
        string full_name
        string role
        bool is_active
        timestamptz created_at
    }
    class AuditLogs {
        UUID id PK
        UUID staff_user_id FK
        string action
        string target_entity
        UUID target_entity_id
        string ip_hash
        text details
        timestamptz created_at
    }
    class DataRequests {
        UUID id PK
        UUID learner_id FK
        string request_type
        string status
        timestamptz requested_at
        timestamptz completed_at
    }
    class AppSettings {
        UUID id PK
        string setting_key UK
        jsonb setting_value
        string description
        timestamptz updated_at
    }

    StaffUsers "1" <-- "n" AuditLogs
    Learners "1" <-- "n" DataRequests
```

---

## 3. Từ Điển Bảng Dữ Liệu Chi Tiết (Table Dictionary v1.3 - 43 Bảng)

### Nhóm 1: Nội Dung Đề Thi & Bảng Tra Cứu (17 Bảng)

#### 1. `tracks`
- **Mục đích:** Lưu trữ các đường đua ngôn ngữ (tiếng Đức, tiếng Hàn, tiếng Nhật...). Mở rộng không sửa cấu trúc.
- **Nguồn yêu cầu:** Kiến trúc nền tảng đa ngôn ngữ (Non-German hardcoded).
- **Cột chính:** `id` (UUID PK), `code` (varchar(32) UK), `name` (varchar(128)), `is_active` (boolean default true), `created_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 2. `exam_standards`
- **Mục đích:** Danh mục chuẩn khảo thí theo từng ngôn ngữ (TELC, Goethe-Institut, ÖSD, TestDaF...).
- **Nguồn yêu cầu:** SCR-01 (Bộ lọc danh mục đề thi theo kỳ thi).
- **Cột chính:** `id` (UUID PK), `track_id` (UUID FK tracks), `code` (varchar(32) UK), `name` (varchar(128)), `is_active` (boolean default true).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 3. `levels`
- **Mục đích:** Khung cấp độ năng lực ngôn ngữ theo CEFR (A1, A2, B1, B2, C1, C2).
- **Nguồn yêu cầu:** SCR-01 (Bộ lọc trình độ), SCR-05 (Ước lượng CEFR).
- **Cột chính:** `id` (UUID PK), `code` (varchar(16) UK), `name` (varchar(64)), `rank_order` (int UK).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 4. `skills`
- **Mục đích:** Kỹ năng ngôn ngữ (Lesen - Đọc, Hören - Nghe, Schreiben - Viết, Sprechen - Nói).
- **Nguồn yêu cầu:** SCR-01 (Bộ lọc kỹ năng), SCR-02, SCR-03 (Phân tách phòng thi Đọc và Nghe).
- **Cột chính:** `id` (UUID PK), `code` (varchar(32) UK), `name` (varchar(64)).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 5. `question_types`
- **Mục đích:** Dạng thức câu hỏi trắc nghiệm (`single_choice`, `true_false`, `matching`).
- **Nguồn yêu cầu:** SCR-02, SCR-03 (Quy chuẩn định dạng câu hỏi TELC/Goethe).
- **Cột chính:** `id` (UUID PK), `code` (varchar(32) UK), `name` (varchar(64)).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 6. `learning_goals`
- **Mục đích:** Danh mục mục tiêu học tập của người học (`cert`, `ausbildung`, `visa18b`, `comms`).
- **Nguồn yêu cầu:** SCR-07 (Trường mục tiêu học tập trong Lead Gate Form).
- **Cột chính:** `id` (UUID PK), `code` (varchar(32) UK), `name` (varchar(128)), `description` (text null), `is_active` (boolean default true).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 7. `persona_types`
- **Mục đích:** Danh mục nhóm đối tượng người học (`student_under18`, `university`, `worker`, `parent`).
- **Nguồn yêu cầu:** SCR-07 (Trường nhóm đối tượng trong Lead Gate Form).
- **Cột chính:** `id` (UUID PK), `code` (varchar(32) UK), `name` (varchar(128)), `is_active` (boolean default true).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn (Master Data).

#### 8. `exams`
- **Mục đích:** Thực thể bài thi cấp cao. Chứa cấu hình chung, ngưỡng điểm đạt và thang quy đổi CEFR.
- **Nguồn yêu cầu:** SCR-01 (Thẻ đề thi), SCR-02 (Cấu hình thời gian làm bài).
- **Cột chính:** 
  - `id` (UUID PK), `standard_id` (UUID FK exam_standards), `level_id` (UUID FK levels).
  - `code` (varchar(64) UK), `title` (varchar(255)).
  - `time_limit_seconds` (int not null default 3900 - quy định 65 phút).
  - `passing_percentage` (numeric(5,2) not null default 60.00 - ngưỡng tham khảo).
  - `benchmark_scale_config` (jsonb not null - thang điểm và CEFR).
  - `audio_pause_allowed` (boolean not null default false).
  - `audio_max_plays` (int not null default 2 - số lần phát tối đa do server quản lý).
  - `public_explanation_count` (int not null default 2 - số câu mở trước lead gate, từ câu 1 đến N).
  - `is_active` (boolean default true), `created_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn.

#### 9. `exam_versions`
- **Mục đích:** Quản lý vòng đời và tính bất biến của nội dung đề thi.
- **Nguồn yêu cầu:** Kiểm soát chất lượng nội dung và tính bất biến khảo thí.
- **Cột chính:** `id` (UUID PK), `exam_id` (UUID FK exams), `version_number` (int not null), `status` (varchar(32) not null check in (`draft`, `ai_checked`, `teacher_approved`, `published`, `archived`)), `content_hash` (varchar(64) null), `published_at` (timestamptz null), `created_at` (timestamptz UTC).
- **Ràng buộc:** `UNIQUE(exam_id, version_number)`; Partial Unique Index: `CREATE UNIQUE INDEX uq_exam_published_version ON exam_versions(exam_id) WHERE status = 'published'`.
- **Chuyển trạng thái:** Chỉ được cập nhật thông qua hàm `SECURITY DEFINER` `transition_exam_version()`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn.

#### 10. `content_reviews`
- **Mục đích:** Lưu lịch sử phê duyệt chất lượng đề thi của AI và giáo viên bản ngữ SHD.
- **Nguồn yêu cầu:** Quy trình kiểm định học thuật trước khi xuất bản đề.
- **Cột chính:** 
  - `id` (UUID PK), `version_id` (UUID FK exam_versions).
  - `reviewer_type` (varchar(16) check in (`ai`, `teacher`)).
  - `reviewer_id` (UUID FK staff_users null - **Ràng buộc:** bắt buộc NOT NULL khi `reviewer_type = 'teacher'`).
  - `review_status` (varchar(32) check in (`approved`, `rejected`, `needs_revision`)).
  - `feedback_notes` (text), `created_at` (timestamptz UTC).
- **Ràng buộc:** `CONSTRAINT chk_content_reviews_teacher CHECK ((reviewer_type = 'teacher' AND reviewer_id IS NOT NULL) OR (reviewer_type = 'ai'))`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** 5 năm (kiểm định học thuật).

#### 11. `sections`
- **Mục đích:** Các phần thi thành phần trong phiên bản đề (Section 1 = Lesen, Section 2 = Hören).
- **Nguồn yêu cầu:** SCR-02, SCR-03 (Phân tách kỹ năng Đọc và Nghe).
- **Cột chính:** `id` (UUID PK), `version_id` (UUID FK exam_versions), `skill_id` (UUID FK skills), `section_order` (int not null), `title` (varchar(128)), `instructions` (text), `time_limit_seconds` (int null).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_versions`.

#### 12. `stimuli`
- **Mục đích:** Ngữ liệu bài thi: bài đọc hoặc audio track dùng chung cho một nhóm câu hỏi (Teil).
- **Nguồn yêu cầu:** SCR-02 (Văn bản bài đọc), SCR-03 (Đoạn băng âm thanh Hören).
- **Cột chính:** `id` (UUID PK), `section_id` (UUID FK sections), `part_number` (int not null default 1), `stimulus_type` (varchar(16) check in (`text`, `audio`, `image`)), `title` (varchar(255)), `content_text` (text null), `asset_id` (UUID FK assets null).
- **Ràng buộc:** `CONSTRAINT chk_stimulus_audio_asset CHECK ((stimulus_type = 'audio' AND asset_id IS NOT NULL) OR (stimulus_type != 'audio'))`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_versions`.

#### 13. `assets`
- **Mục đích:** Lưu trữ đường dẫn tệp âm thanh nghe Hören và hình ảnh trên cloud storage.
- **Nguồn yêu cầu:** SCR-03 (Trình phát âm thanh Hören).
- **Cột chính:** `id` (UUID PK), `asset_type` (varchar(16) check in (`audio_mp3`, `image_png`, `image_webp`)), `storage_path` (text not null), `file_size_bytes` (bigint), `duration_seconds` (int null), `mime_type` (varchar(64)), `created_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn.

#### 14. `questions`
- **Mục đích:** Định nghĩa các câu hỏi trắc nghiệm (từ Câu 1 đến 30).
- **Nguồn yêu cầu:** SCR-02, SCR-03 (Danh sách câu hỏi 1-30).
- **Cột chính:** `id` (UUID PK), `version_id` (UUID FK exam_versions not null), `section_id` (UUID FK sections not null), `stimulus_id` (UUID FK stimuli null), `type_id` (UUID FK question_types not null), `question_order` (int not null), `prompt_text` (text not null), `points` (int not null default 1).
- **Ràng buộc:** `UNIQUE(version_id, question_order)`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_versions`.

#### 15. `question_options`
- **Mục đích:** Các lựa chọn phương án của từng câu hỏi (A, B, C hoặc Richtig/Falsch).
- **Nguồn yêu cầu:** SCR-02, SCR-03 (Các phương án lựa chọn A, B, C).
- **Cột chính:** `id` (UUID PK), `question_id` (UUID FK questions), `option_label` (varchar(8) not null), `content_text` (text not null), `option_order` (int not null).
- **Ràng buộc:** `UNIQUE(question_id, option_label)`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_versions`.

#### 16. `answer_keys` (BẢNG BẢO MẬT TỐI CAO - CÔ LẬP ROLE)
- **Mục đích:** Lưu đáp án đúng của từng câu hỏi. Bảng độc lập hoàn toàn.
- **Nguồn yêu cầu:** Server-Side Grading, cô lập đáp án chống gian lận.
- **Cột chính:** `id` (UUID PK), `question_id` (UUID FK questions UK), `correct_option_label` (varchar(8) not null), `scoring_notes` (text null), `created_at` (timestamptz UTC).
- **Phân quyền bảo vệ:** `REVOKE ALL ON answer_keys FROM PUBLIC; GRANT SELECT ON answer_keys TO shd_grader; REVOKE ALL ON answer_keys FROM shd_app;`. Role `shd_app` chỉ có thể gọi hàm `grade_attempt` (SECURITY DEFINER) chứ không thể SELECT bảng này.
- **Mức nhạy cảm PII:** Không chứa PII nhưng là dữ liệu tối mật kinh doanh (Business Critical).
- **Thời hạn lưu trữ:** Theo vòng đời `exam_versions`.

#### 17. `explanations`
- **Mục đích:** Lời giải thích sư phạm chi tiết bằng tiếng Việt, phân tích từ vựng và dịch bài đọc.
- **Nguồn yêu cầu:** SCR-06 (Lời giải thích & bản dịch bài đọc).
- **Cột chính:** `id` (UUID PK), `question_id` (UUID FK questions UK), `explanation_text` (text not null), `translation_text` (text null), `vocabulary_notes` (jsonb null), `is_public_preview` (boolean not null default false).
- **Phân quyền:** Role `shd_app` không SELECT trực tiếp bảng này mà truy cập qua view `v_public_explanations` hoặc view kiểm tra entitlement.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_versions`.

---

### Nhóm 2: Làm Bài & Chấm Điểm (10 Bảng)

#### 18. `visitors`
- **Mục đích:** Định danh khách vãng lai ẩn danh truy cập qua Cookie / LocalStorage trước khi điền Lead Gate.
- **Nguồn yêu cầu:** SCR-01, SCR-02 (Lưu vết tiến trình làm bài của khách vãng lai).
- **Cột chính:** `id` (UUID PK), `visitor_token_hash` (varchar(64) UK not null - HMAC-SHA256 kèm `TOKEN_HASH_PEPPER`), `user_agent` (text null), `ip_hash` (varchar(64) null - HMAC-SHA256 kèm `IP_HASH_PEPPER`), `first_seen_at` (timestamptz UTC), `last_active_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Định danh gián tiếp / Dữ liệu hành vi.
- **Thời hạn lưu trữ:** 90 ngày kể từ lần hoạt động cuối [DEC-ARCH-01].

#### 19. `exam_attempts`
- **Mục đích:** Phiên làm bài thi thử của người học. Nguồn sự thật duy nhất về thời gian và kết quả nộp bài.
- **Nguồn yêu cầu:** SCR-02, SCR-03, SCR-04, SCR-05 (Vòng đời phiên thi).
- **Cột chính:** `id` (UUID PK), `version_id` (UUID FK exam_versions), `visitor_id` (UUID FK visitors not null), `learner_id` (UUID FK learners null), `mode` (varchar(16) not null default 'exam' check in (`exam`, `practice`)), `status` (varchar(32) not null check in (`in_progress`, `submitted`, `graded`, `abandoned`)), `started_at` (timestamptz UTC not null), `expires_at` (timestamptz UTC not null), `submitted_at` (timestamptz UTC null), `submission_type` (varchar(16) null check in (`manual`, `timeout`)).
- **Quy tắc Zero-Direct-Write (INV-34):** Role `shd_app` **CẤM INSERT/UPDATE/DELETE trực tiếp** bảng này!
  - Khởi tạo phiên qua `start_attempt()`.
  - Nộp bài qua `submit_attempt()`.
  - Gắn hồ sơ qua `mark_phone_verified()`.
  - Đóng bài quá hạn qua `finalize_expired_attempts()`.
- **Mức nhạy cảm PII:** Hành vi học tập.
- **Thời hạn lưu trữ:** 3 năm phục vụ báo cáo năng lực [DEC-ARCH-01].

#### 20. `attempt_section_timers`
- **Mục đích:** Quản lý thời gian độc lập cho từng phần thi (Section) do server giám sát và cưỡng chế.
- **Nguồn yêu cầu:** SCR-02, SCR-03 (Đồng hồ đếm ngược riêng từng phần Đọc/Nghe).
- **Cột chính:** `id` (UUID PK), `attempt_id` (UUID FK exam_attempts), `section_id` (UUID FK sections), `duration_seconds` (int not null), `started_at` (timestamptz UTC null), `expires_at` (timestamptz UTC null), `status` (varchar(16) not null default 'not_started' check in (`not_started`, `in_progress`, `completed`, `expired`)).
- **Ràng buộc:** `UNIQUE(attempt_id, section_id)`.
- **Quy tắc Zero-Direct-Write:** Role `shd_app` **CẤM INSERT/UPDATE trực tiếp**. Bắt đầu phần thi qua `enter_section()`, hoàn tất phần thi qua `complete_section()`.
- **Mức nhạy cảm PII:** Dữ liệu thời gian làm bài.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_attempts`.

#### 21. `attempt_answers`
- **Mục đích:** Ghi nhận phương án người học lựa chọn cho từng câu hỏi (Optimistic Concurrency Control).
- **Nguồn yêu cầu:** SCR-02, SCR-03 (Lưu nháp câu trả lời, gắn cờ xem lại).
- **Cột chính:** `id` (UUID PK), `attempt_id` (UUID FK exam_attempts), `question_id` (UUID FK questions), `selected_option_label` (varchar(8) null), `is_flagged` (boolean default false), `revision` (int not null default 1), `answered_at` (timestamptz UTC).
- **Ràng buộc:** `UNIQUE(attempt_id, question_id)`.
- **Cơ chế xung đột:** Server chỉ chấp nhận nếu `revision_client == revision_db`, sau đó tăng `revision = revision + 1`. Nếu không khớp, trả về lỗi `REVISION_CONFLICT` (HTTP 409).
- **Mức nhạy cảm PII:** Hành vi học tập.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_attempts`.

#### 22. `attempt_audio_plays`
- **Mục đích:** SERVER-AUTHORITATIVE AUDIOPLAY COUNTER VỚI PHIÊN PHÁT CÓ TOKEN BĂM. Kiểm soát số lần nghe Hören theo quy định. Tải lại trang không bị trừ thêm lượt.
- **Nguồn yêu cầu:** SCR-03 (Kiểm soát 2 lượt nghe Hören).
- **Cột chính:** `id` (UUID PK), `attempt_id` (UUID FK exam_attempts), `stimulus_id` (UUID FK stimuli), `play_count` (int not null default 0 check (play_count >= 0)), `current_session_token_hash` (varchar(64) null - HMAC-SHA256 kèm `AUDIO_TOKEN_PEPPER`), `session_expires_at` (timestamptz UTC null), `last_played_at` (timestamptz UTC).
- **Ràng buộc:** `UNIQUE(attempt_id, stimulus_id)`.
- **Quy tắc Zero-Direct-Write:** Role `shd_app` **CẤM INSERT/UPDATE trực tiếp** bảng này! Bắt buộc gọi hàm `SECURITY DEFINER` `start_audio_play(attempt_id, stimulus_id, caller_token_hash)`.
- **Mức nhạy cảm PII:** Hành vi học tập.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_attempts`.

#### 23. `attempt_entitlements`
- **Mục đích:** Quyền lợi xem lời giải chi tiết gắn với phiên làm bài.
- **Nguồn yêu cầu:** SCR-06, SCR-09 (Khóa câu 3-30 và Mở khóa sau Lead Gate).
- **Cột chính:** `id` (UUID PK), `attempt_id` (UUID FK exam_attempts UK), `full_solution_unlocked` (boolean not null default false), `unlocked_at` (timestamptz UTC null), `unlock_source` (varchar(32) null).
- **Quy tắc Zero-Direct-Write:** Role `shd_app` **CẤM INSERT/UPDATE trực tiếp**! Mở khóa bắt buộc qua hàm `SECURITY DEFINER` `unlock_full_solution(attempt_id, caller_token_hash, otp_challenge_id)`.
- **Mức nhạy cảm PII:** Quyền lợi dịch vụ.
- **Thời hạn lưu trữ:** Theo vòng đời `exam_attempts`.

#### 24. `results`
- **Mục đích:** Bảng điểm tổng quan sau khi nộp bài.
- **Nguồn yêu cầu:** SCR-05 (Màn hình kết quả thi).
- **Cột chính:** 
  - `id` (UUID PK), `attempt_id` (UUID FK exam_attempts UK).
  - `total_score` (int not null), `max_score` (int not null default 30), `percentage` (numeric(5,2) not null).
  - `passing_percentage_snapshot` (numeric(5,2) not null default 60.00 - snapshot ngưỡng đạt tại thời điểm nộp [DEC-ARCH-15]).
  - `benchmark_status_code` (varchar(32) not null - `passed_reference`, `below_reference`).
  - `cefr_estimate_code` (varchar(16) not null - `B1`, `B1_MINUS`, `A2`).
  - `calculated_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Kết quả học tập.
- **Thời hạn lưu trữ:** 3 năm [DEC-ARCH-01].

#### 25. `result_section_scores`
- **Mục đích:** Điểm chi tiết từng kỹ năng/phần thi đa ngôn ngữ (Lesen 12/15, Hören 9/15).
- **Nguồn yêu cầu:** SCR-05 (Thẻ điểm theo kỹ năng).
- **Cột chính:** `id` (UUID PK), `result_id` (UUID FK results), `section_id` (UUID FK sections), `skill_id` (UUID FK skills), `score` (int not null), `max_score` (int not null), `percentage` (numeric(5,2) not null).
- **Ràng buộc:** `UNIQUE(result_id, section_id)`.
- **Mức nhạy cảm PII:** Kết quả học tập.
- **Thời hạn lưu trữ:** Theo vòng đời `results`.

#### 26. `result_item_scores`
- **Mục đích:** Điểm chi tiết từng câu do hàm `grade_attempt` tính toán đối chiếu với `answer_keys`.
- **Nguồn yêu cầu:** SCR-05, SCR-06 (Danh sách kết quả chi tiết từng câu).
- **Cột chính:** `id` (UUID PK), `result_id` (UUID FK results), `question_id` (UUID FK questions), `is_correct` (boolean not null), `earned_points` (int not null).
- **Ràng buộc:** `UNIQUE(result_id, question_id)`.
- **Phân quyền & Security Barrier:** Role `shd_app` **CẤM SELECT trực tiếp bảng này**! Chỉ truy cập qua view `v_attempt_item_scores` có cờ `security_barrier`, che giấu `is_correct = NULL` cho câu 3–30 khi chưa mở khóa.
- **Mức nhạy cảm PII:** Kết quả học tập.
- **Thời hạn lưu trữ:** Theo vòng đời `results`.

#### 27. `learning_events` (SỔ CÁI HÀNH VI CHỈ-GHI-THÊM)
- **Mục đích:** Nhật ký phân tích hành vi học tập (Analytics Event Log). CẤM UPDATE/DELETE.
- **Nguồn yêu cầu:** Phân tích hành vi, đo lường tỷ lệ rớt (Drop-off Rate), tối ưu CRO.
- **Cột chính:** `id` (UUID PK), `attempt_id` (UUID FK exam_attempts null), `visitor_id` (UUID FK visitors null), `event_name` (varchar(64) not null), `event_payload` (jsonb not null), `created_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Dữ liệu hành vi.
- **Thời hạn lưu trữ:** 12 tháng.

---

### Nhóm 3: Người Học, Phụ Huynh, Xác Thực & Đồng Ý (6 Bảng)

#### 28. `learners`
- **Mục đích:** Hồ sơ học viên sau khi điền thông tin Lead Gate.
- **Nguồn yêu cầu:** SCR-07 (Thu thập thông tin học viên để mở khóa và tư vấn).
- **Cột chính:** 
  - `id` (UUID PK), `full_name` (varchar(128) not null).
  - `phone_hash` (varchar(64) not null UK - HMAC-SHA256 tra cứu).
  - `phone_encrypted` (text not null - Envelope JSON AES-256-GCM).
  - `email` (varchar(255) null).
  - `age_group` (varchar(32) not null check in (`student_under18`, `university`, `worker`, `parent`)).
  - `is_under_18` (boolean not null default false).
  - `phone_verified_at` (timestamptz UTC null - **NGUỒN SỰ THẬT DUY NHẤT VỀ XÁC THỰC SĐT**).
  - `created_at` (timestamptz UTC), `anonymized_at` (timestamptz UTC null).
- **Ràng buộc:** `CONSTRAINT chk_learner_under18_age CHECK ((is_under_18 = true AND age_group = 'student_under18') OR (is_under_18 = false AND age_group != 'student_under18'))`.
- **Quy tắc Zero-Direct-Write (INV-34):** Role `shd_app` **CẤM INSERT/UPDATE trực tiếp** bảng này! Tạo qua `create_learner()`, xác thực qua `mark_phone_verified()`.
- **Mức nhạy cảm PII:** **ĐỊNH DANH TRỰC TIẾP (Direct PII)**.
- **Thời hạn lưu trữ:** Lưu trữ đến khi có yêu cầu xóa hoặc 3 năm không tương tác [DEC-ARCH-01].

#### 29. `guardians`
- **Mục đích:** Thông tin cha mẹ/người giám hộ bắt buộc đối với học viên dưới 18 tuổi theo Luật 91/2025/QH15.
- **Nguồn yêu cầu:** SCR-07 (Nhánh dưới 18 tuổi yêu cầu SĐT phụ huynh), Điều 19 Luật 91.
- **Cột chính:** `id` (UUID PK), `learner_id` (UUID FK learners UK), `parent_phone_hash` (varchar(64) not null - HMAC tra cứu), `parent_phone_encrypted` (text not null - Envelope JSON AES-256-GCM), `verification_status` (varchar(32) not null default 'pending' check in (`pending`, `approved`, `rejected`, `expired`)), `requested_at` (timestamptz UTC), `verified_at` (timestamptz UTC null), `zns_message_id` (varchar(64) null).
- **Mức nhạy cảm PII:** **ĐỊNH DANH TRỰC TIẾP (Direct PII)**.
- **Thời hạn lưu trữ:** Theo vòng đời tài khoản học viên vị thành niên.

#### 30. `otp_challenges`
- **Mục đích:** Quản lý vòng đời mã xác thực OTP gửi qua Zalo ZNS / SMS.
- **Nguồn yêu cầu:** SCR-08 (Modal nhập mã OTP).
- **Cột chính:** `id` (UUID PK), `visitor_id` (UUID FK visitors), `attempt_id` (UUID FK exam_attempts null), `phone_hash` (varchar(64) not null), `otp_hash` (varchar(64) not null - HMAC băm với `OTP_HASH_PEPPER`), `channel` (varchar(16) not null default 'zalo_zns' check in (`zalo_zns`, `sms`)), `attempts_count` (int not null default 0 check(attempts_count <= 3)), `status` (varchar(16) not null default 'pending' check in (`pending`, `verified`, `expired`, `failed`)), `expires_at` (timestamptz UTC not null - 5 phút sau khi tạo), `created_at` (timestamptz UTC not null).
- **Quy tắc Zero-Direct-Write (A1):** Role `shd_app` **CẤM INSERT/UPDATE trực tiếp**!
  - Cấp mã qua `issue_otp()`.
  - Xác thực qua `verify_otp()`.
- **Mức nhạy cảm PII:** Dữ liệu xác thực.
- **Thời hạn lưu trữ:** 7 ngày (đối soát chi phí viễn thông).

#### 31. `consent_purposes`
- **Mục đích:** Danh mục các mục đích xử lý dữ liệu cá nhân theo Luật 91/2025/QH15.
- **Nguồn yêu cầu:** Điều 13, Luật 91/2025/QH15 & Nghị định 356/2025/NĐ-CP.
- **Cột chính:** `id` (UUID PK), `code` (varchar(32) UK - `scoring_history`, `course_consulting`, `study_abroad_18b`), `name` (varchar(128)), `is_mandatory` (boolean not null), `is_active` (boolean default true).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn.

#### 32. `consent_texts`
- **Mục đích:** Văn bản pháp lý chi tiết của từng điều khoản đồng ý (phân tách học viên và phụ huynh).
- **Nguồn yêu cầu:** SCR-07 (Nội dung pháp lý hiển thị cạnh 3 checkbox đồng ý).
- **Cột chính:** `id` (UUID PK), `purpose_id` (UUID FK consent_purposes), `version_number` (int not null), `target_audience` (varchar(16) not null default 'learner' check in (`learner`, `guardian`)), `legal_content` (text not null), `recipient_entities` (text not null), `published_at` (timestamptz UTC).
- **Ràng buộc:** `UNIQUE(purpose_id, version_number, target_audience)`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn.

#### 33. `consents` (SỔ CÁI ĐỒNG Ý CHỈ-GHI-THÊM)
- **Mục đích:** Sổ cái ghi nhận hành vi đồng ý hoặc rút lại đồng ý của người học và phụ huynh. CẤM UPDATE/DELETE.
- **Nguồn yêu cầu:** SCR-07, Điều 13 Luật 91/2025/QH15.
- **Cột chính:** `id` (UUID PK), `learner_id` (UUID FK learners), `consent_text_id` (UUID FK consent_texts), `given_by_guardian_id` (UUID FK guardians null - lưu ID phụ huynh nếu con <18 tuổi), `action` (varchar(16) not null check in (`granted`, `revoked`)), `capture_method` (varchar(32) not null - 'web_checkbox', 'zalo_button'), `user_ip_hash` (varchar(64) null - HMAC), `recorded_at` (timestamptz UTC not null).
- **Ràng buộc trẻ em (INV-29):** Nếu học viên dưới 18 tuổi, bắt buộc `given_by_guardian_id IS NOT NULL` và phụ huynh phải có trạng thái `approved` tại thời điểm ghi nhận.
- **Mức nhạy cảm PII:** Bằng chứng pháp lý gắn với định danh.
- **Thời hạn lưu trữ:** 5 năm sau khi kết thúc tương tác [DEC-ARCH-01, DEC-ARCH-07].

---

### Nhóm 4: Lead Tuyển Sinh, Tín Hiệu Điểm, CRM Outbox & Khóa Idempotency (6 Bảng)

#### 34. `leads`
- **Mục đích:** Thực thể Lead phục vụ đội ngũ tuyển sinh. Thiết kế theo quan hệ **1 Lead duy nhất cho mỗi Học viên (Lead per Learner)**, cập nhật theo thời gian.
- **Nguồn yêu cầu:** Phễu tuyển sinh khóa học trả phí và du học nghề.
- **Cột chính:** 
  - `id` (UUID PK), `learner_id` (UUID FK learners UK).
  - `latest_attempt_id` (UUID FK exam_attempts).
  - `learning_goal_id` (UUID FK learning_goals not null).
  - `exam_timeline` (varchar(32) not null check in (`1m`, `1_3m`, `3_6m`, `gt6m`, `unknown`)).
  - `persona_type_id` (UUID FK persona_types not null).
  - `lead_temperature` (varchar(16) not null check in (`hot`, `warm`, `nurture`)).
  - `total_attempts_count` (int not null default 1).
  - `last_temperature_calculated_at` (timestamptz UTC).
  - `created_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Định danh thương mại.
- **Thời hạn lưu trữ:** 2 năm [DEC-ARCH-01].

#### 35. `lead_signals` (BẢNG GHI NHẬN TÍN HIỆU THEO THỜI ĐIỂM)
- **Mục đích:** Ghi vết các tín hiệu hành vi, điểm số, đăng ký test 1-1 theo thời điểm để tính toán nhiệt độ lead khách quan và có thể truy vết.
- **Nguồn yêu cầu:** Cơ chế Lead Scoring đa chỉ báo phục vụ telesale.
- **Cột chính:** 
  - `id` (UUID PK), `lead_id` (UUID FK leads not null).
  - `signal_type` (varchar(64) not null check in (`registered_1on1_test`, `timeline_urgent_1m`, `timeline_1_3m`, `score_extreme_low`, `score_near_pass`, `goal_ausbildung_18b`, `full_exam_completed`, `multiple_replays`)).
  - `signal_weight` (numeric(4,2) not null - tự động gán bởi database trigger từ `app_settings`).
  - `metadata` (jsonb null - ví dụ: `{ "attempt_id": "...", "score": 21 }`).
  - `captured_at` (timestamptz UTC not null default clock_timestamp()).
- **Quy tắc Zero-Direct-Write (A6):** Role `shd_app` **CẤM INSERT trực tiếp** bảng này! Bắt buộc thông qua trigger hệ thống hoặc hàm `record_lead_interaction()`.
- **Mức nhạy cảm PII:** Dữ liệu hành vi thương mại.
- **Thời hạn lưu trữ:** Theo vòng đời `leads`.

#### 36. `crm_outbox` (TRANSACTIONAL OUTBOX PATTERN VỚI KHÓA LEASE ĐỒNG BỘ)
- **Mục đích:** Hàng đợi transactional outbox gửi dữ liệu sang One Center CRM. Hỗ trợ khóa thuê (Lease) cho worker chạy song song an toàn bằng `FOR UPDATE SKIP LOCKED`.
- **Nguồn yêu cầu:** Đồng bộ Eventual Consistency sang CRM One Center, chống mất lead.
- **Cột chính:** 
  - `id` (UUID PK), `idempotency_key` (varchar(128) not null UK).
  - `event_type` (varchar(64) not null - 'lead.created', 'parent.verified').
  - `aggregate_id` (UUID not null).
  - `payload` (jsonb not null - **CHỈ CHỨA ID VÀ TRƯỜNG TỐI THIỂU**, tuyệt đối không lưu SĐT thô trong DB!).
  - `status` (varchar(16) not null default 'pending' check in (`pending`, `processing`, `delivered`, `failed`, `dead_letter`)).
  - `locked_by` (varchar(64) null - ID instance worker).
  - `locked_until` (timestamptz UTC null - thời hạn lease 5 phút).
  - `retry_count` (int not null default 0), `max_retries` (int not null default 5).
  - `next_retry_at` (timestamptz UTC not null default clock_timestamp()).
  - `error_log` (text null), `created_at` (timestamptz UTC).
- **Ràng buộc trạng thái thống nhất:** `CHECK (status IN ('pending', 'processing', 'delivered', 'failed', 'dead_letter'))`.
- **Mức nhạy cảm PII:** Payload chỉ chứa ID; không chứa PII dạng rõ.
- **Thời hạn lưu trữ:** Xóa dữ liệu thành công sau 30 ngày; giữ log lỗi 90 ngày.

#### 37. `crm_links`
- **Mục đích:** Lưu trữ liên kết học viên giữa hệ thống thi thử và One Center CRM.
- **Nguồn yêu cầu:** Đồng bộ 2 chiều giữa Web thi thử và One Center CRM.
- **Cột chính:** `id` (UUID PK), `learner_id` (UUID FK learners UK), `one_center_student_id` (varchar(64) not null UK), `crm_status` (varchar(32)), `current_enrolled_level` (varchar(16) null), `synced_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Liên kết mã định danh ngoài.
- **Thời hạn lưu trữ:** Theo vòng đời học viên.

#### 38. `crm_inbound_events`
- **Mục đích:** Tiếp nhận webhook từ One Center CRM (học viên nhập học, đóng học phí).
- **Nguồn yêu cầu:** Webhook tiếp nhận sự kiện từ One Center CRM.
- **Cột chính:** `id` (UUID PK), `external_event_id` (varchar(64) not null UK), `event_type` (varchar(64) not null), `payload` (jsonb not null), `processed` (boolean not null default false), `received_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** Sự kiện nghiệp vụ.
- **Thời hạn lưu trữ:** 90 ngày.

#### 39. `idempotency_keys`
- **Mục đích:** Kiểm soát chống xử lý trùng lặp cho các yêu cầu API và giao tiếp liên dịch vụ.
- **Nguồn yêu cầu:** Chống xử lý trùng lặp giao dịch (API Idempotency Pattern).
- **Cột chính:** 
  - `id` (UUID PK), `idem_key` (varchar(128) not null UK - đổi tên tránh từ khóa SQL).
  - `request_hash` (varchar(64) not null - băm SHA256 của request payload để phát hiện sai lệch payload).
  - `scope` (varchar(32) not null check in (`api_request`, `crm_outbox`, `crm_inbound`)).
  - `response_status` (int null), `response_payload` (jsonb null).
  - `created_at` (timestamptz UTC), `expires_at` (timestamptz UTC not null).
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** 7 ngày (tự động dọn dẹp khi hết hạn).

---

### Nhóm 5: Quản Trị & Vận Hành (4 Bảng)

#### 40. `staff_users`
- **Mục đích:** Tài khoản cán bộ tuyển sinh, giáo viên duyệt đề và quản trị viên SHD.
- **Nguồn yêu cầu:** Xác thực và phân quyền RBAC cổng nội bộ Staff Portal.
- **Cột chính:** `id` (UUID PK), `email` (varchar(255) not null UK), `full_name` (varchar(128)), `role` (varchar(32) check in (`admin`, `teacher`, `advisor`, `dpo`, `auditor`)), `is_active` (boolean default true), `created_at` (timestamptz UTC).
- **Mức nhạy cảm PII:** PII nội bộ nhân sự.
- **Thời hạn lưu trữ:** Vĩnh viễn hoặc theo hợp đồng lao động.

#### 41. `audit_logs` (SỔ CÁI AUDIT CHỈ-GHI-THÊM - BẮT BUỘC 5 NĂM)
- **Mục đích:** Ghi vết mọi hành vi truy cập PII (giải mã SĐT) và thao tác quản trị viên. CẤM UPDATE/DELETE.
- **Nguồn yêu cầu:** Tiêu chuẩn kiểm toán bảo vệ dữ liệu cá nhân (Luật 91/2025/QH15).
- **Cột chính:** `id` (UUID PK), `staff_user_id` (UUID FK staff_users null), `action` (varchar(64) not null - 'decrypt_phone', 'approve_exam_version', 'anonymize_learner'), `target_entity` (varchar(64) not null), `target_entity_id` (UUID not null), `ip_hash` (varchar(64)), `details` (text null), `created_at` (timestamptz UTC not null).
- **Mức nhạy cảm PII:** Nhật ký giám sát an ninh.
- **Thời hạn lưu trữ:** **BẮT BUỘC 5 NĂM** (tuân thủ quy định an toàn thông tin mạng).

#### 42. `data_requests`
- **Mục đích:** Tiếp nhận và theo dõi xử lý quyền của chủ thể dữ liệu (Rút đồng ý, Xóa dữ liệu, Xuất PII) theo Luật 91/2025/QH15.
- **Nguồn yêu cầu:** Điều 14, Luật 91/2025/QH15 (Quyền của chủ thể dữ liệu).
- **Cột chính:** `id` (UUID PK), `learner_id` (UUID FK learners), `request_type` (varchar(32) check in (`export_data`, `delete_data`, `revoke_consent`)), `status` (varchar(16) default 'pending' check in (`pending`, `processing`, `completed`, `rejected`)), `requested_at` (timestamptz UTC), `completed_at` (timestamptz UTC null).
- **Xử lý:** Chỉ thực hiện qua hàm `complete_data_request()` bởi DPO/Admin.
- **Mức nhạy cảm PII:** Yêu cầu quyền riêng tư.
- **Thời hạn lưu trữ:** 3 năm phục vụ kiểm toán tuân thủ.

#### 43. `app_settings`
- **Mục đích:** Lưu trữ cấu hình toàn cục không cần build lại mã nguồn (ví dụ: trọng số lead signals, thời gian OTP...).
- **Nguồn yêu cầu:** Cấu hình tham số hệ thống linh hoạt cho ban vận hành.
- **Cột chính:** `id` (UUID PK), `setting_key` (varchar(64) not null UK), `setting_value` (jsonb not null), `description` (text), `updated_at` (timestamptz UTC).
- **Cập nhật:** Chỉ cập nhật qua hàm `update_setting()`.
- **Mức nhạy cảm PII:** Không có.
- **Thời hạn lưu trữ:** Vĩnh viễn.

---

## 4. Máy Trạng Thái Cốt Lõi (State Machines v1.3)

```mermaid
stateDiagram-v2
    direction LR

    state "Vòng Đời Phiên Bản Đề (exam_versions)" as SM_Exam {
        [*] --> Draft
        Draft --> AIChecked : AI rà soát lỗi
        AIChecked --> TeacherApproved : Giáo viên SHD duyệt
        TeacherApproved --> Published : Hàm publish_exam_version() (BẤT BIẾN)
        Published --> Archived : Ngừng làm bài
        Archived --> [*]
    }

    state "Phiên Làm Bài (exam_attempts)" as SM_Attempt {
        [*] --> InProgress
        InProgress --> Submitted_Manual : submit_attempt() (trong giờ)
        InProgress --> Submitted_Timeout : submit_attempt() (ân hạn 60s)
        InProgress --> Submitted_Timeout_Auto : finalize_expired_attempts()
        InProgress --> Abandoned : Quá hạn 24h không tương tác
        Submitted_Manual --> Graded : Hàm grade_attempt()
        Submitted_Timeout --> Graded : Hàm grade_attempt()
        Submitted_Timeout_Auto --> Graded : Atomic trong cùng transaction
        Graded --> [*]
    }

    state "Thử Thách OTP (otp_challenges)" as SM_OTP {
        [*] --> Pending_OTP : issue_otp()
        Pending_OTP --> Verified : verify_otp() đúng mã
        Pending_OTP --> Expired : Quá 5 phút
        Pending_OTP --> Failed : verify_otp() sai quá 3 lần
    }

    state "Xác Nhận Phụ Huynh (guardians)" as SM_Guardian {
        [*] --> Pending_Parent : Gửi ZNS Cha/Mẹ
        Pending_Parent --> Parent_Approved : Phụ huynh bấm Đồng ý
        Pending_Parent --> Parent_Rejected : Phụ huynh từ chối
        Pending_Parent --> Expired_Parent : Quá 7 ngày
    }

    state "Hàng Đợi Outbox Đồng Bộ (crm_outbox)" as SM_Outbox {
        [*] --> Pending
        Pending --> Processing : Worker lock (lease 5 phút)
        Processing --> Delivered : CRM 200 OK
        Processing --> Pending : Lease hết hạn (timeout crash)
        Processing --> Failed : CRM lỗi / 5xx (tăng retry_count)
        Failed --> Processing : Đến hạn next_retry_at (retry < 5)
        Failed --> DeadLetter : retry_count >= 5
    }
```

---

## 5. Danh Mục Các Hàm Security Definer & Đặc Tả An Ninh

Toàn bộ các thao tác ghi dữ liệu nhạy cảm hoặc chuyển trạng thái nghiệp vụ bắt buộc phải thực thi qua các hàm `SECURITY DEFINER`. Mỗi hàm có một role `NOLOGIN` sở hữu riêng biệt, cố định `SET search_path = pg_catalog, public`, và **tự xác minh danh tính người gọi**:

### 5.1. Nhóm Hàm Khảo Thí & Chấm Điểm

| Tên Hàm & Tham Số | Role Sở Hữu (`NOLOGIN`) | Cơ Chế Xác Minh Người Gọi | Hành Vi Nghiệp Vụ & Bảo Mật |
| :--- | :--- | :--- | :--- |
| **`start_attempt(p_caller_token_hash, p_version_id, p_mode)`** | `shd_attempt_mgr` | Tra cứu `p_caller_token_hash` trong bảng `visitors` | Kiểm tra version đã `published`, lấy `time_limit_seconds`, chèn `exam_attempts` và `attempt_entitlements` (`unlocked = false`). |
| **`enter_section(p_attempt_id, p_section_id, p_caller_token_hash)`** | `shd_attempt_mgr` | Đối soát attempt thuộc về `visitors.id` của caller | Tính `expires_at = LEAST(started_at + duration, attempt.expires_at)`. Chèn/cập nhật `attempt_section_timers`. |
| **`start_audio_play(p_attempt_id, p_stimulus_id, p_caller_token_hash)`** | `shd_attempt_mgr` | Đối soát attempt thuộc về caller | Kiểm tra section Hören đang `in_progress`. Nếu token băm còn hạn thì giữ nguyên count; nếu bắt đầu lượt mới thì tăng `play_count` (chặn nếu `play_count >= max_plays`). |
| **`submit_attempt(p_attempt_id, p_caller_token_hash)`** | `shd_attempt_mgr` | Đối soát attempt thuộc về caller | Nếu nộp trong giờ: `submission_type = 'manual'`. Nếu nộp quá giờ nhưng trong ân hạn 60s: `submission_type = 'timeout'`. Cập nhật `status = 'submitted'` và gọi ngay `grade_attempt()` trong cùng transaction! |
| **`grade_attempt(p_attempt_id, p_caller_token_hash)`** | `shd_grader` | Đối soát attempt thuộc về caller (hoặc được gọi từ worker/submit_attempt) | `REVOKE EXECUTE FROM PUBLIC`. Chỉ chấm khi `status = 'submitted'`. So khớp `attempt_answers` và `answer_keys`. Chèn `result_item_scores`, `results`, `result_section_scores`. Cập nhật `status = 'graded'`. Bảo đảm idempotent khi gọi lại. |
| **`finalize_expired_attempts()`** | `shd_grader` | Được gọi định kỳ bởi `shd_worker` (không nhận tham số tự do) | Quét attempt `in_progress` quá hạn + 60s ân hạn; cập nhật `status = 'submitted'`, `submission_type = 'timeout'` và chấm điểm nguyên tử trong cùng transaction. |
| **`unlock_full_solution(p_attempt_id, p_caller_token_hash, p_otp_challenge_id)`** | `shd_attempt_mgr` | Đối soát attempt thuộc về caller | Kiểm tra `otp_challenges.status = 'verified'`. Cập nhật `attempt_entitlements.full_solution_unlocked = true`. |

### 5.2. Nhóm Hàm Xác Thực & Hồ Sơ Người Học

| Tên Hàm & Tham Số | Role Sở Hữu (`NOLOGIN`) | Cơ Chế Xác Minh Người Gọi | Hành Vi Nghiệp Vụ & Bảo Mật |
| :--- | :--- | :--- | :--- |
| **`issue_otp(p_caller_token_hash, p_attempt_id, p_phone_raw, p_channel)`** | `shd_auth_admin` | Xác minh caller tồn tại trong `visitors` | Chuẩn hóa SĐT, tính `phone_hash`, sinh OTP ngẫu nhiên, lưu `otp_hash` (HMAC), kiểm tra rate-limit theo ngày. Chèn `otp_challenges`. Trả về OTP thô cho gateway. |
| **`verify_otp(p_challenge_id, p_otp_code_raw)`** | `shd_auth_admin` | Kiểm tra challenge tồn tại và chưa hết hạn 5 phút | Trong CÙNG HÀM: đọc FOR UPDATE, tăng `attempts_count = attempts_count + 1`. So khớp HMAC của mã code. Nếu đúng gán `status = 'verified'`, nếu sai quá 3 lần gán `status = 'failed'`. |
| **`create_learner(p_caller_token_hash, p_full_name, p_phone_raw, p_email, p_age_group)`** | `shd_auth_admin` | Xác minh caller tồn tại trong `visitors` | Chuẩn hóa SĐT, tính `phone_hash`, mã hóa Envelope AES-256-GCM. Gán `is_under_18 = (age_group == 'student_under18')`. Chèn `learners` (`phone_verified_at = NULL`) và `leads`. |
| **`mark_phone_verified(p_learner_id, p_otp_challenge_id, p_attempt_id)`** | `shd_auth_admin` | Kiểm tra `otp_challenges.status = 'verified'` | Cập nhật `learners.phone_verified_at = clock_timestamp()`, đồng thời liên kết `exam_attempts.learner_id = p_learner_id` cho attempt tương ứng. |
| **`record_lead_interaction(p_caller_token_hash, p_lead_id, p_signal_type, p_metadata)`** | `shd_auth_admin` | Xác minh caller là chủ sở hữu lead qua `learners` | Chèn `lead_signals`, trigger tự động đọc trọng số từ `app_settings` gán vào `signal_weight` và tính lại `lead_temperature`. |

### 5.3. Nhóm Hàm Quản Trị, Bảo Mật PII & Vận Hành

| Tên Hàm & Tham Số | Role Sở Hữu (`NOLOGIN`) | Cơ Chế Xác Minh Người Gọi | Hành Vi Nghiệp Vụ & Bảo Mật |
| :--- | :--- | :--- | :--- |
| **`decrypt_phone(p_learner_id, p_purpose)`** | `shd_privacy_admin` | Xác thực người gọi là `shd_worker` hoặc nhân viên có quyền trong `staff_users` | Giải mã SĐT từ JSON envelope theo `kid`. **Bắt buộc chèn bản ghi vào `audit_logs` trong cùng transaction!** |
| **`publish_exam_version(p_version_id, p_sso_claim_email)`** | `shd_exam_admin` | Xác thực `staff_users.role = 'admin'` qua claim SSO | Kiểm tra đã có review approved của AI và Giáo viên SHD; kiểm tra câu công khai liên tục 1..N. Cập nhật `status = 'published'`, kích hoạt trigger khóa đề bất biến. |
| **`transition_exam_version(p_version_id, p_target_status, p_sso_claim_email)`** | `shd_exam_admin` | Xác thực role tương ứng trong `staff_users` | Quản lý chuyển trạng thái vòng đời đề thi theo đúng máy trạng thái. |
| **`complete_data_request(p_request_id, p_sso_claim_email)`** | `shd_privacy_admin` | Xác thực `staff_users.role IN ('admin', 'dpo')` | Gọi hàm `anonymize_learner()`, cập nhật `data_requests.status = 'completed'`, ghi `audit_logs`. |
| **`anonymize_learner(p_learner_id)`** | `shd_privacy_admin` | Được gọi nội bộ từ `complete_data_request` | Xóa/thay thế băm ngẫu nhiên trên toàn bộ các bảng PII (INV-19). Bảo lưu điểm thi khảo thí. |
| **`update_setting(p_key, p_value, p_sso_claim_email)`** | `shd_privacy_admin` | Xác thực `staff_users.role = 'admin'` qua claim SSO | Cập nhật `app_settings` và ghi nhật ký thao tác quản trị vào `audit_logs`. |

### 5.4. Đặc Tả An Ninh Giải Mã PII & Quy Trình Xoay Khóa (`decrypt_phone`)

- **Đối tượng được phép gọi:**
  1. Worker nền đồng bộ CRM (`shd_worker`): Khi lấy bản ghi outbox từ `crm_outbox`, gọi `decrypt_phone` để giải mã SĐT và gửi qua HTTPS tới API của One Center CRM.
  2. Cán bộ tư vấn tuyển sinh (`advisor`, `admin`): Khi xem hồ sơ học viên trên Staff Portal được phân quyền RBAC.
- **Audit trong cùng Transaction:**
  Mỗi lần giải mã SĐT, hàm `decrypt_phone()` bắt buộc chèn 1 bản ghi vào bảng `audit_logs` với các trường: `staff_user_id` (hoặc định danh worker), `action = 'decrypt_phone'`, `target_entity = 'learners'`, `target_entity_id = p_learner_id`, `ip_hash`, `details = p_purpose`, `created_at = clock_timestamp()`. Nếu thao tác ghi audit thất bại, giao dịch giải mã bị rollback hoàn toàn.
- **Quy trình xoay khóa theo `kid` không Downtime:**
  - Định dạng JSON envelope: `{"v": 1, "kid": "kms-key-2026-v1", "iv": "...", "tag": "...", "ct": "..."}`.
  - Khi xoay khóa: Khóa mới được đăng ký trên Cloud KMS với `kid` mới (ví dụ `kms-key-2027-v1`) và đặt làm khóa mã hóa mặc định trong cấu hình ứng dụng.
  - Hàm `decrypt_phone` đọc `kid` từ envelope, tra cứu khóa giải mã tương ứng để giải mã bản ghi cũ.
  - Một background worker định kỳ quét các bản ghi mang `kid` cũ, giải mã và mã hóa lại (re-encrypt) bằng khóa mới mà không ảnh hưởng tới người dùng.

---

## 6. Ma Trận Phân Quyền Theo Role Cơ Sở Dữ Liệu (Role Privilege Matrix v1.3)

> **Cấu trúc Role Cơ sở Dữ liệu:**  
> - `shd_migrator`: Role sở hữu schema (DDL Owner), được cấu hình `NOLOGIN` trong vận hành thực tế.  
> - `shd_app`: Role kết nối từ ứng dụng Web/API. **Tuyệt đối không có quyền INSERT/UPDATE/DELETE trực tiếp trên các bảng bảo mật.** Mọi thao tác ghi thực hiện qua `EXECUTE` hàm `SECURITY DEFINER`.  
> - `shd_grader`: Role `NOLOGIN` chuyên trách chấm thi. Sở hữu hàm `grade_attempt` và `finalize_expired_attempts`. Có quyền SELECT trên `answer_keys`.  
> - `shd_worker`: Role kết nối tác vụ nền (Outbox / Background Worker). Chỉ có quyền cập nhật hàng đợi `crm_outbox`, `crm_inbound_events` và `EXECUTE` các hàm cần thiết.  
> - `shd_readonly`: Role báo cáo và kiểm toán. Bị tước 100% quyền SELECT trên bảng PII gốc, chỉ được SELECT trên các masked view có cờ `security_barrier`.

| Bảng / View / Hàm | `shd_migrator` (DDL Owner - NOLOGIN) | `shd_app` (Web API Server) | `shd_grader` (Chấm Thi Biệt Lập) | `shd_worker` (Outbox Worker) | `shd_readonly` (Báo Cáo & Audit) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`tracks, exam_standards, levels, skills, question_types`** | ALL + DDL | SELECT | SELECT | SELECT | SELECT |
| **`learning_goals, persona_types`** | ALL + DDL | SELECT | SELECT | SELECT | SELECT |
| **`exams, exam_versions, sections, stimuli, assets, questions, question_options`** | ALL + DDL | SELECT | SELECT | SELECT | SELECT |
| **`content_reviews`** | ALL + DDL | SELECT | NONE | NONE | SELECT |
| **`answer_keys` (ĐÁP ÁN ĐÚNG)** | ALL + DDL | **NONE (CẤM SELECT)** | **SELECT** | **NONE (CẤM)** | **NONE (CẤM)** |
| **`explanations` (BẢNG GỐC)** | ALL + DDL | **NONE (CẤM SELECT)** | SELECT | NONE | SELECT |
| **View `v_public_explanations` (security_barrier)** | ALL + DDL | **SELECT** | SELECT | NONE | SELECT |
| **`visitors`** | ALL + DDL | SELECT, INSERT, UPDATE | NONE | NONE | SELECT |
| **`exam_attempts`** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | SELECT, UPDATE *(qua hàm)* | SELECT | SELECT |
| **`attempt_section_timers`** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | SELECT | NONE | SELECT |
| **`attempt_answers`** | ALL + DDL | SELECT, INSERT, UPDATE | SELECT | NONE | SELECT |
| **`attempt_audio_plays`** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | NONE | NONE | SELECT |
| **`attempt_entitlements`** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | NONE | NONE | SELECT |
| **`results, result_section_scores`** | ALL + DDL | SELECT | SELECT, INSERT, UPDATE | NONE | SELECT |
| **`result_item_scores` (BẢNG GỐC)** | ALL + DDL | **NONE (CẤM SELECT)** | SELECT, INSERT, UPDATE | NONE | SELECT |
| **View `v_attempt_item_scores` (security_barrier)** | ALL + DDL | **SELECT** | SELECT | NONE | SELECT |
| **`learning_events` (Sổ cái Append-Only)** | ALL + DDL | INSERT | NONE | NONE | SELECT |
| **`learners, guardians` (PII GỐC)** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | **NONE (CẤM)** | **SELECT** | **NONE (CẤM)** |
| **View `v_masked_learners`, `v_masked_guardians`** | ALL + DDL | SELECT | NONE | SELECT | **SELECT** |
| **`otp_challenges`** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | NONE | NONE | SELECT |
| **`consent_purposes, consent_texts`** | ALL + DDL | SELECT | NONE | SELECT | SELECT |
| **`consents` (SỔ CÁI)** | ALL + DDL | SELECT, INSERT | NONE | SELECT | SELECT |
| **`leads` (BẢNG GỐC)** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | NONE | SELECT, UPDATE | **NONE (CẤM)** |
| **`lead_signals`** | ALL + DDL | SELECT *(CẤM GHI TRỰC TIẾP)* | NONE | SELECT | SELECT |
| **View `v_masked_leads` (security_barrier)** | ALL + DDL | SELECT | NONE | SELECT | **SELECT** |
| **`crm_outbox`** | ALL + DDL | INSERT *(chỉ ID)* | NONE | SELECT, UPDATE, DELETE | SELECT |
| **`crm_links, crm_inbound_events`** | ALL + DDL | SELECT | NONE | SELECT, INSERT, UPDATE | SELECT |
| **`idempotency_keys`** | ALL + DDL | SELECT, INSERT, UPDATE | NONE | SELECT, INSERT, UPDATE | SELECT |
| **`staff_users`** | ALL + DDL | SELECT | NONE | NONE | SELECT |
| **`audit_logs` (Sổ cái 5 năm)** | ALL + DDL | **INSERT** | NONE | **INSERT** | SELECT |
| **`data_requests`** | ALL + DDL | **SELECT, INSERT** | NONE | NONE | SELECT |
| **`app_settings`** | ALL + DDL | SELECT | SELECT | SELECT | SELECT |
| **Hàm Chấm thi & Attempt (`start_attempt`, `submit_attempt`, `grade_attempt`...)** | ALL + DDL | **EXECUTE** | **OWNER / EXECUTE** | **EXECUTE** | NONE |
| **Hàm OTP & Learner (`issue_otp`, `verify_otp`, `create_learner`, `mark_phone_verified`)** | ALL + DDL | **EXECUTE** | NONE | NONE | NONE |
| **Hàm Quản trị & PII (`decrypt_phone`, `complete_data_request`, `publish_exam_version`)** | ALL + DDL | **EXECUTE (theo SSO claim)**| NONE | **EXECUTE (`decrypt_phone`)** | NONE |
| **View `v_contactable_leads` (security_barrier)** | ALL + DDL | SELECT | **NONE (CẤM)** | **SELECT** | SELECT |

---

## 7. Đặc Tả Danh Sách Cột Cho Các Security Barrier Views

Nhằm triệt tiêu nguy cơ rò rỉ dữ liệu qua các hàm do người dùng định nghĩa trong mệnh đề WHERE, toàn bộ các View dưới đây bắt buộc khai báo `WITH (security_barrier = true)` và định nghĩa danh sách cột tường minh:

1. **`v_public_explanations`:**
   - Cột: `question_id`, `explanation_text`, `translation_text`, `vocabulary_notes`, `is_public_preview`.
   - Điều kiện: `WHERE is_public_preview = true`.
2. **`v_attempt_item_scores`:**
   - Cột: `result_id`, `question_id`, 
     `CASE WHEN e.is_public_preview = true OR ent.full_solution_unlocked = true THEN ris.is_correct ELSE NULL END AS is_correct`,
     `CASE WHEN e.is_public_preview = true OR ent.full_solution_unlocked = true THEN ris.earned_points ELSE NULL END AS earned_points`.
   - Kết nối: `result_item_scores ris JOIN results r ON ris.result_id = r.id JOIN exam_attempts ea ON r.attempt_id = ea.id JOIN attempt_entitlements ent ON ent.attempt_id = ea.id JOIN explanations e ON e.question_id = ris.question_id`.
3. **`v_masked_learners`:**
   - Cột: `id`, `overlay(full_name placing '***' from 3 for 10) as full_name_masked`, `overlay(email placing '***' from 2 for position('@' in email)-2) as email_masked`, `age_group`, `is_under_18`, `phone_verified_at`, `created_at`. (Không xuất `phone_encrypted` hay `phone_hash`).
4. **`v_masked_guardians`:**
   - Cột: `id`, `learner_id`, `verification_status`, `requested_at`, `verified_at`. (Không xuất số điện thoại phụ huynh).
5. **`v_masked_leads`:**
   - Cột: `id`, `learning_goal_id`, `exam_timeline`, `persona_type_id`, `lead_temperature`, `total_attempts_count`, `last_temperature_calculated_at`, `created_at`. (Không có thông tin cá nhân).
6. **`v_contactable_leads`:**
   - Cột: `lead_id`, `learner_id`, `full_name`, `phone_encrypted`, `email`, `lead_temperature`, `learning_goal_code`, `exam_timeline`.
   - Điều kiện lọc nghiêm ngặt:
     `WHERE l.phone_verified_at IS NOT NULL AND EXISTS (SELECT 1 FROM consents c JOIN consent_texts ct ON c.consent_text_id = ct.id JOIN consent_purposes cp ON ct.purpose_id = cp.id WHERE c.learner_id = l.id AND cp.code = 'course_consulting' AND c.action = 'granted') AND (l.is_under_18 = false OR EXISTS (SELECT 1 FROM guardians g WHERE g.learner_id = l.id AND g.verification_status = 'approved'))`.

---

## 8. Danh Sách 37 Bất Biến Bắt Buộc Kiểm Chứng (Invariants Inventory v1.3)

1. **`INV-01` (Bảo mật Đáp án cấp độ Role):** Bảng `answer_keys` lưu đáp án đúng độc lập; role cơ sở dữ liệu `shd_app` bị từ chối truy cập (Permission Denied 42501) khi thực hiện lệnh `SELECT` trên bảng `answer_keys`.
2. **`INV-02` (Tính Bất Biến của Đề đã Xuất Bản):** Sau khi `exam_versions.status = 'published'`, mọi thao tác `INSERT`, `UPDATE`, `DELETE` trên bảng `sections`, `stimuli`, `questions`, `question_options`, `answer_keys`, `explanations` thuộc phiên bản đó đều bị chặn bởi database trigger.
3. **`INV-03` (Phiên Bản Xuất Bản Duy Nhất):** Mỗi đề thi (`exams`) tại bất kỳ thời điểm nào chỉ được phép có tối đa MỘT phiên bản ở trạng thái `published` (bảo đảm bằng partial unique index `WHERE status = 'published'`).
4. **`INV-04` (Toàn Vẹn Phiên Làm Bài):** Mỗi phiên làm bài `exam_attempts` bắt buộc phải tham chiếu tới một `exam_versions` đang có trạng thái `published`.
5. **`INV-05` (Quyền Mở Khóa Lời Giải Lưu Trong DB):** Trạng thái mở khóa đầy đủ lời giải (`full_solution_unlocked`) được xác định bởi bản ghi trong bảng `attempt_entitlements`, tuyệt đối không tin cậy tham số boolean do client gửi lên.
6. **`INV-06` (Quản Lý Lượt Nghe Audio Bằng Token Băm Không Trừ Lượt Khi Reload):** Lượt nghe audio Hören được cấp quyền thông qua `current_session_token_hash`; hành động tải lại trang (reload) hoặc ngắt kết nối mạng trong khi token phiên còn hiệu lực không làm tăng `play_count`; server từ chối cấp token phát mới khi `play_count >= exams.audio_max_plays`.
7. **`INV-07` (Đồng Hồ Server Là Nguồn Sự Thật Tuyệt Đối):** Thời điểm hết hạn `exam_attempts.expires_at` do server ấn định khi khởi tạo; mọi bài thi nộp khi `clock_timestamp() > expires_at` bắt buộc bị đánh dấu `submission_type = 'timeout'`.
8. **`INV-08` (Tạm Dừng Audio Không Dừng Giờ Đề):** Trạng thái tạm dừng âm thanh (`audio_pause_allowed = true`) không làm thay đổi giá trị của `expires_at` trên phiên làm bài tổng.
9. **`INV-09` (Sổ Cái Đồng Ý Chỉ-Ghi-Thêm):** Bảng `consents` là cấu trúc Append-Only; mọi thao tác `UPDATE` hoặc `DELETE` đều bị chặn bởi database trigger.
10. **`INV-10` (Trạng Thái Đồng Ý Suy Ra Từ Bản Ghi Mới Nhất):** Trạng thái đồng ý của một người học đối với một mục đích xử lý dữ liệu được tính toán dựa trên bản ghi có `recorded_at` mới nhất trong bảng `consents`.
11. **`INV-11` (Điều Kiện Lọc Lead Đủ Quyền Liên Hệ):** Database view `v_contactable_leads` chỉ xuất ra các lead thỏa mãn đồng thời 3 điều kiện: (a) SĐT đã xác thực (`learners.phone_verified_at IS NOT NULL`), (b) có đồng ý tư vấn hiện hành (`purpose = 'course_consulting'`, `action = 'granted'`), và (c) nếu `is_under_18 = true` thì bắt buộc phải có `guardians.verification_status = 'approved'`.
12. **`INV-12` (Băm Chuẩn Hóa Số Điện Thoại Tra Cứu):** Cột `phone_hash` được tính bằng thuật toán HMAC-SHA256 trên số điện thoại chuẩn hóa E.164 kèm khóa bí mật `PHONE_HASH_PEPPER`; chống trùng lặp không cần lưu SĐT thô.
13. **`INV-13` (Băm Mã Xác Thực OTP):** Cột `otp_hash` trong `otp_challenges` được băm bằng HMAC-SHA256 với `OTP_HASH_PEPPER`; cơ sở dữ liệu hoàn toàn không lưu trữ mã OTP dạng số thô.
14. **`INV-14` (Ràng Buộc Thời Gian & Lần Thử OTP):** Bản ghi `otp_challenges` hết hạn sau đúng 300 giây (`expires_at = created_at + interval '5 minutes'`); số lần thử tối đa không vượt quá 3 (`attempts_count <= 3`).
15. **`INV-15` (Chống Xử Lý Lặp Outbox Bằng Khóa Idempotency):** Cột `crm_outbox.idempotency_key` có ràng buộc duy nhất `UNIQUE`; hệ thống từ chối chèn hai sự kiện cùng khóa.
16. **`INV-16` (Xử Lý Outbox Không Xung Đột Bằng Skip Locked):** Truy vấn lấy việc của worker tác vụ nền bắt buộc sử dụng mệnh đề `FOR UPDATE SKIP LOCKED` để đảm bảo không bị khóa chết khi nhiều worker chạy song song.
17. **`INV-17` (Idempotent Webhook CRM Đến):** Bảng `crm_inbound_events` có ràng buộc duy nhất trên `external_event_id`; từ chối ghi nhận trùng lặp sự kiện gửi từ One Center CRM.
18. **`INV-18` (Sổ Cái Audit Giám Sát Truy Cập PII):** Mọi hành động truy xuất bản mã số điện thoại (`decrypt_phone`) bắt buộc phải ghi nhận vào bảng `audit_logs` trong cùng một database transaction.
19. **`INV-19` (Thủ Tục Ẩn Danh Hóa Xóa PII Đầy Đủ & Thay Băm Ngẫu Nhiên):** Thủ tục `anonymize_learner(p_learner_id)` cập nhật chính xác: `learners.full_name = 'ANONYMIZED'`, `learners.email = NULL`, `learners.phone_encrypted = NULL`, thay `learners.phone_hash = 'anon_' || encode(gen_random_bytes(16), 'hex')`, `learners.phone_verified_at = NULL`; xóa `guardians.parent_phone_encrypted = NULL`, thay `guardians.parent_phone_hash = 'anon_g_' || encode(gen_random_bytes(16), 'hex')`, `guardians.zns_message_id = NULL`; xóa `consents.user_ip_hash = NULL`; thay `visitors.visitor_token_hash = 'anon_v_' || encode(gen_random_bytes(16), 'hex')`, `visitors.user_agent = NULL`, `visitors.ip_hash = NULL`; thay `otp_challenges.phone_hash = 'anon_otp_' || encode(gen_random_bytes(16), 'hex')`; cập nhật `data_requests.status = 'completed'`; bảo lưu nguyên vẹn điểm số trong `results`, `result_section_scores`, `result_item_scores` và `exam_attempts`.
20. **`INV-20` (Số Lượng Lời Giải Mở Khóa Động Liên Tục Từ 1 Đến N):** Số câu hỏi có `explanations.is_public_preview = true` trên mỗi đề thi được xác thực tự động bằng database trigger khi xuất bản: bắt buộc phải là dãy câu hỏi liên tục bắt đầu từ 1 đến N (`question_order` từ $1$ đến $N$, với $N = \text{exams.public_explanation_count}$, mặc định $N = 2$). Không cho phép mở ngắt quãng.
21. **`INV-21` (Độc Lập Ngôn Ngữ Bằng Lookup Data):** Không có cột nào sử dụng Postgres Enum cứng gắn với tiếng Đức. Các trục phân loại được cấu hình linh hoạt qua bảng tra cứu `tracks`, `exam_standards`, `levels`, `skills`, `learning_goals`, `persona_types`.
22. **`INV-22` (Ràng Buộc Thời Gian Cấp Phần Thi):** Nếu phần thi có cấu hình `sections.time_limit_seconds` riêng, giá trị này không được lớn hơn `exams.time_limit_seconds` của bài thi tổng.
23. **`INV-23` (Quyền Thực Thi Hàm Chấm Điểm Biệt Lập):** Hàm `grade_attempt(UUID)` là hàm `SECURITY DEFINER` với `search_path = pg_catalog, public`; chỉ cấp quyền `EXECUTE` cho role `shd_app` (và `shd_worker`), role `shd_app` tuyệt đối không có quyền `SELECT` trực tiếp trên `answer_keys`.
24. **`INV-24` (Khóa Thuê Lease Outbox Chống Đụng Độ Worker):** Bản ghi `crm_outbox` khi được worker xử lý bắt buộc phải được gán `locked_by` và `locked_until` (tối đa 5 phút); các worker khác bỏ qua bản ghi này trừ khi lease đã hết hạn (`locked_until < clock_timestamp()`).
25. **`INV-25` (Kiểm Soát Xung Đột Ghi Nháp Bằng Revision):** Bảng `attempt_answers` quản lý xung đột đồng thời bằng cột `revision`; server từ chối cập nhật và trả về mã lỗi `REVISION_CONFLICT` (HTTP 409) nếu `revision` gửi lên không khớp với cơ sở dữ liệu.
26. **`INV-26` (Đồng Hồ Tổng Luôn Cưỡng Chế Nộp Bài):** Thời điểm hết hạn của phiên làm bài tổng (`exam_attempts.expires_at`) luôn có quyền ưu tiên cao nhất so với `attempt_section_timers.expires_at`. Khi đồng hồ tổng chạm 0, bài thi bị cưỡng chế kết thúc ngay lập tức.
27. **`INV-27` (Cưỡng Chế Thời Gian Từng Phần Thi Tại Server):** Server từ chối mọi thao tác ghi nhận câu trả lời cho một section khi `clock_timestamp() > attempt_section_timers.expires_at`.
28. **`INV-28` (Bảo Mật Băm Token Khách & IP):** Các bảng `visitors`, `attempt_audio_plays` và `consents` chỉ lưu trữ chuỗi băm HMAC-SHA256 kèm muối bí mật (`TOKEN_HASH_PEPPER`, `AUDIO_TOKEN_PEPPER`, `IP_HASH_PEPPER`), không bao giờ lưu trữ token thô hoặc địa chỉ IP thô.
29. **`INV-29` (Bảo Vệ Đồng Ý Học Viên Vị Thành Niên):** Đối với học viên dưới 18 tuổi (`learners.is_under_18 = true`), mọi bản ghi đồng ý trong bảng `consents` bắt buộc phải có `given_by_guardian_id IS NOT NULL`, và người giám hộ đó bắt buộc phải có `guardians.verification_status = 'approved'` tại thời điểm ghi nhận đồng ý. Mọi hành vi tự cấp consent từ tài khoản vị thành niên mà không có xác nhận hợp lệ của phụ huynh đều bị chặn bởi database trigger.
30. **`INV-30` (Sổ Cái Audit & Learning Events Chỉ-Ghi-Thêm):** Bảng `audit_logs` và `learning_events` là cấu trúc Append-Only; mọi thao tác `UPDATE` hoặc `DELETE` đều bị chặn hoàn toàn bởi database trigger ở cấp độ cơ sở dữ liệu.
31. **`INV-31` (Cấm Update Trực Tiếp Cột Bảo Mật Nhạy Cảm):** Các cột `expires_at`, `play_count`, `full_solution_unlocked`, `phone_verified_at`, `is_under_18` bị cấm `UPDATE` trực tiếp bởi role `shd_app`; bắt buộc phải thông qua các hàm `SECURITY DEFINER` chuyên trách (`start_audio_play`, `enter_section`, `unlock_full_solution`, `mark_phone_verified`).
32. **`INV-32` (Tính Idempotent Của Hàm Chấm Điểm Biệt Lập):** Hàm `grade_attempt(UUID)` kiểm tra trạng thái và chỉ thực thi chấm khi `exam_attempts.status = 'submitted'`. Nếu attempt đã ở trạng thái `'graded'`, hàm trả về kết quả hiện tại mà không tính toán lại, bảo đảm tính idempotent.
33. **`INV-33` (Đóng Bài Thi Quá Hạn Nguyên Tử):** Hàm `finalize_expired_attempts()` tự động nộp và chấm điểm các bài thi quá hạn (`expires_at + 60s < clock_timestamp()`) trong cùng một transaction, đảm bảo không có bài thi nào bị treo ở trạng thái dở dang.
34. **`INV-34` (Zero-Direct-Write Trên Các Bảng Bảo Mật):** Role `shd_app` bị thu hồi hoàn toàn quyền `INSERT`, `UPDATE`, `DELETE` trực tiếp trên `exam_attempts`, `attempt_section_timers`, `attempt_audio_plays`, `attempt_entitlements`, `learners`, `otp_challenges`, `lead_signals`; mọi thao tác ghi bắt buộc phải đi qua các hàm `SECURITY DEFINER`.
35. **`INV-35` (Xác Minh Người Gọi Bằng Token Băm / Claim SSO):** Toàn bộ các hàm `SECURITY DEFINER` cho học viên bắt buộc tự kiểm tra danh tính người gọi thông qua `p_caller_token_hash` đối chiếu với `visitors`/`learners`; các hàm cho nhân viên bắt buộc kiểm tra qua claim email SSO đối chiếu với `staff_users.role`. Tuyệt đối không chấp nhận ID định danh tự do từ client.
36. **`INV-36` (Che Giấu Điểm Chi Tiết Chưa Mở Khóa Qua Security Barrier):** View `v_attempt_item_scores` bắt buộc khai báo `WITH (security_barrier = true)` và trả về `is_correct = NULL`, `earned_points = NULL` đối với các câu từ 3–30 khi bài thi chưa có quyền xem đầy đủ lời giải (`full_solution_unlocked = false`).
37. **`INV-37` (Bảo Đảm Tính Toàn Vẹn Của Khóa Idempotency Kèm Hash):** Bảng `idempotency_keys` lưu trữ `idem_key` kèm `request_hash`; server từ chối yêu cầu và trả về lỗi xung đột nếu cùng một `idem_key` được gửi với `request_hash` khác nhau.

---

## 9. Bảng Truy Vết Toàn Diện Yêu Cầu ↔ Bảng Dữ Liệu (Traceability Matrix v1.3)

Toàn bộ **43 bảng** trong cơ sở dữ liệu đều có nguồn gốc rõ ràng từ: (1) Màn hình giao diện người dùng, (2) Yêu cầu pháp lý & quyền riêng tư, hoặc (3) Cơ chế vận hành & kiến trúc nền tảng. Không có bất kỳ bảng mồ côi nào.

### 9.1. Truy Vết Từ Màn Hình Giao Diện Wireframe (SCR-01 Đến SCR-10)

| Mã Màn Hình | Trường hiển thị trên Wireframe | Bảng & Cột dữ liệu tương ứng trong Database | Nguồn & Loại dữ liệu |
| :--- | :--- | :--- | :---: |
| **SCR-01** (Catalog) | Tên đề thi, Badge kỳ thi, Trình độ | `exams.title`, `exam_standards.name`, `levels.code` | Trực tiếp |
| **SCR-01** (Catalog) | Thời gian làm bài, Số lượng câu hỏi | `exams.time_limit_seconds`, `COUNT(questions.id)` | Trực tiếp / Suy ra |
| **SCR-01** (Catalog) | Bộ lọc: Ngôn ngữ, Kỳ thi, Trình độ, Kỹ năng | `tracks.code`, `exam_standards.code`, `levels.code`, `skills.code` | Bảng tra cứu |
| **SCR-02** (Phòng thi Đọc) | Đồng hồ đếm ngược server bài thi & phần thi | `exam_attempts.expires_at`, `attempt_section_timers.expires_at` | Dữ liệu suy ra |
| **SCR-02** (Phòng thi Đọc) | Văn bản bài đọc tiếng Đức (Beispieltext) | `stimuli.content_text` (nơi `stimulus_type = 'text'`) | Trực tiếp |
| **SCR-02** (Phòng thi Đọc) | Danh sách câu hỏi 1–15 & Dạng trắc nghiệm | `questions.prompt_text`, `question_types.code`, `question_options.content_text` | Trực tiếp |
| **SCR-02** (Phòng thi Đọc) | Trạng thái đã chọn, Cờ gắn lại & Revision nháp | `attempt_answers.selected_option_label`, `is_flagged`, `revision` | Trực tiếp |
| **SCR-03** (Phòng thi Nghe) | Trình phát Hören & File âm thanh | `assets.storage_path`, `stimuli.title`, `sections.title` | Trực tiếp |
| **SCR-03** (Phòng thi Nghe) | Đếm số lượt nghe còn lại ("Lượt 1/2") & Token băm | `attempt_audio_plays.play_count`, `current_session_token_hash` | Trực tiếp / Suy ra |
| **SCR-03** (Phòng thi Nghe) | Cấu hình bật/tắt nút Pause | `exams.audio_pause_allowed` (boolean) | Cấu hình đề |
| **SCR-04** (Xác nhận nộp) | Số câu đã làm, số câu chưa làm, gắn cờ | `COUNT(attempt_answers)` theo nhóm `is_flagged`, `selected` | Dữ liệu suy ra |
| **SCR-05** (Trang kết quả) | Điểm tổng 21/30, % Đúng 70% | `results.total_score`, `results.percentage` | Trực tiếp |
| **SCR-05** (Trang kết quả) | Đạt ngưỡng tham khảo, Gần mức B1 | `results.benchmark_status_code`, `results.cefr_estimate_code` | Trực tiếp |
| **SCR-05** (Trang kết quả) | Điểm Lesen (12/15) & Điểm Hören (9/15) | `result_section_scores.score`, `result_section_scores.max_score` | Trực tiếp |
| **SCR-06** (Lời giải & Khóa)| Lời giải Câu 1 & 2 mở công khai | View `v_public_explanations` nơi `is_public_preview = true` | Trực tiếp |
| **SCR-06** (Lời giải & Khóa)| Khối khóa Câu 3–30 (Mờ sau Lead Gate) | Kiểm tra `attempt_entitlements.full_solution_unlocked` | Quyền dữ liệu |
| **SCR-07** (Lead Gate Form)| Họ và tên, SĐT/Zalo, Email | `learners.full_name`, `phone_encrypted`, `email` | Trực tiếp (PII) |
| **SCR-07** (Lead Gate Form)| Mục tiêu học, Thời gian thi, Đối tượng | `leads.learning_goal_id`, `exam_timeline`, `persona_type_id` | Bảng tra cứu |
| **SCR-07** (Lead Gate Form)| Nhánh < 18 tuổi: SĐT Cha/Mẹ | `guardians.parent_phone_encrypted` | Trực tiếp (PII) |
| **SCR-07** (Lead Gate Form)| 3 Checkbox đồng ý pháp lý | `consents.action = 'granted'` gắn với `consent_texts.id` | Sổ cái pháp lý |
| **SCR-08** (OTP Modal) | Mã OTP gửi Zalo ZNS / SMS | `otp_challenges.otp_hash`, `channel`, `expires_at` | Trực tiếp |
| **SCR-09** (Thành công) | Mở khóa 30 câu giải thích & Tặng Ebook | `attempt_entitlements.full_solution_unlocked = true` | Trực tiếp |

### 9.2. Truy Vết Từ Yêu Cầu Pháp Lý & Bảo Vệ Quyền Riêng Tư (Luật 91/2025/QH15)

| Nguồn Yêu Cầu Pháp Lý | Điều Khoản & Quy Định Căn Cứ | Bảng Dữ Liệu & Cơ Chế Phục Vụ |
| :--- | :--- | :--- |
| **Sổ cái đồng ý có thể chứng minh** | Điều 13, Luật 91/2025/QH15 & Nghị định 356/2025/NĐ-CP | `consent_purposes`, `consent_texts`, `consents` (Append-Only) |
| **Bảo vệ trẻ em (<18 tuổi)** | Điều 19, Luật 91/2025/QH15: Bắt buộc cha mẹ đồng ý | `guardians`, `consent_texts` (guardian), `consents.given_by_guardian_id` (INV-29) |
| **Quyền của chủ thể dữ liệu** | Điều 14, Luật 91/2025/QH15: Quyền rút đồng ý, xóa, xuất PII | `data_requests`, hàm `complete_data_request()`, thủ tục `anonymize_learner` |
| **Giám sát truy cập PII** | Tiêu chuẩn kiểm toán an ninh dữ liệu cá nhân | `audit_logs` (Lưu trữ bắt buộc 5 năm, INV-30) |
| **Bảo mật kênh truyền & lưu trữ** | Mã hóa dữ liệu định danh trực tiếp | `learners.phone_encrypted` (Envelope AES-256-GCM) |

### 9.3. Truy Vết Từ Yêu Cầu Vận Hành, Hệ Thống & CRM Outbox

| Nguồn Yêu Cầu Kỹ Thuật | Mục Đích Kỹ Thuật & Vận Hành | Bảng Dữ Liệu & Cơ Chế Phục Vụ |
| :--- | :--- | :--- |
| **Chống lộ đề thi & đáp án** | Server-Side Grading, cô lập Role DB | `answer_keys`, hàm `grade_attempt` (SECURITY DEFINER, `shd_grader`) |
| **Đóng bài thi quá hạn tự động** | Grace period 60s, chấm bài atomic trong cùng transaction | Hàm `finalize_expired_attempts()` (INV-33) |
| **Cưỡng chế thời gian phần thi** | Server-authoritative section timers | `attempt_section_timers`, hàm `enter_section()` |
| **Kiểm soát nghe Hören linh hoạt** | Token băm phiên phát, loại bỏ CHECK cứng count | `attempt_audio_plays`, hàm `start_audio_play()` |
| **Kiểm định chất lượng đề thi** | Đảm bảo đề qua AI & Giáo viên SHD duyệt | `content_reviews`, hàm `publish_exam_version()` |
| **Transactional Outbox sang CRM** | Eventual Consistency, chống mất lead, worker song song | `crm_outbox` (Lease pattern), `crm_links`, `crm_inbound_events` |
| **Chống xử lý lặp toàn hệ thống** | Idempotency cho Webhook và API requests kèm request hash | `idempotency_keys` (`idem_key`, `request_hash`) |
| **Đánh giá nhiệt độ Lead đa tín hiệu** | Ghi nhận tín hiệu theo thời điểm để tính nhiệt độ lead | `leads`, `lead_signals` |
| **Phân loại phễu tuyển sinh động** | Tra cứu mục tiêu và chân dung học viên không hardcode | `learning_goals`, `persona_types` |
| **Phân tích hành vi & CRO** | Theo dõi tương tác nút bấm, audio, drop-off rate | `learning_events` (Append-Only, INV-30) |
| **Tài khoản quản trị & Cấu hình** | Nhân sự SHD quản trị và cấu hình tham số toàn cục | `staff_users`, `app_settings`, hàm `update_setting()` |

---

## 10. Mục Cần Duyệt & Các Giả Định Chờ Quyết Định (Decisions Needing Approval v1.3)

| Mã | Nội dung đề xuất | Căn cứ & Rủi ro | Tác động schema nếu thay đổi | Trạng thái |
| :---: | :--- | :--- | :--- | :--- |
| **DEC-ARCH-01** (C1) | **Thời hạn lưu trữ PII & Sổ cái** | Đề xuất: PII học viên lưu đến khi yêu cầu xóa hoặc 3 năm không tương tác; `audit_logs` bắt buộc 5 năm; sổ cái `consents` giữ 5 năm. Cần pháp chế SHD xác nhận chính thức theo Luật 91/2025/QH15. | Chỉ ảnh hưởng chính sách worker dọn dẹp, không đổi cấu trúc bảng. | **[CẦN DUYỆT]** |
| **DEC-ARCH-02** (C2) | **Lưu Hash HMAC cho IP, Visitor Token và Audio Token** | `visitors`, `attempt_audio_plays` và `consents` chỉ lưu `ip_hash`, `visitor_token_hash` và `current_session_token_hash` (băm HMAC-SHA256 kèm pepper bí mật) nhằm triệt tiêu rủi ro rò rỉ định danh gián tiếp nếu DB bị lộ. | Đã chuẩn hóa kiểu varchar(64). | **[CẦN DUYỆT]** |
| **DEC-ARCH-03** (C3) | **Tạm dừng Audio không dừng giờ làm bài tổng** | Nút tạm dừng của file âm thanh Hören (nếu đề cho phép) chỉ dừng phát băng, không dừng đồng hồ đếm ngược của phòng thi. | Khóa cứng `expires_at` của attempt không đổi. | **[CẦN DUYỆT]** |
| **DEC-ARCH-04** (C4) | **Đồng hồ tổng luôn thắng (Master Clock Precedence)** | Nếu cả đồng hồ tổng và đồng hồ từng phần (`attempt_section_timers`) cùng chạy: khi đồng hồ tổng chạm 0, toàn bộ bài thi cưỡng chế nộp ngay lập tức bất kể section còn giờ hay không. | Cưỡng chế tại logic server và database validation. | **[CẦN DUYỆT]** |
| **DEC-ARCH-05** (C5) | **Số câu giải thích công khai mặc định 2 câu (1..N)** | Đặt mặc định là `2` câu trong cấu hình đề (`exams.public_explanation_count = 2`). Quy tắc bắt buộc là dãy liên tục từ câu 1 đến N. | Đã tích hợp kiểm tra trong trigger xuất bản đề. | **[CẦN DUYỆT]** |
| **DEC-ARCH-06** (C6) | **Quy trình kích hoạt Lead của người dưới 18 tuổi** | View `v_contactable_leads` loại bỏ hoàn toàn học viên dưới 18 tuổi nếu phụ huynh chưa bấm đồng ý xác nhận qua Zalo ZNS. Đội ngũ telesale SHD tuyệt đối không được phân bổ các lead này. | Cấu trúc View đã lọc cứng điều kiện `guardians.verification_status = 'approved'`. | **[CẦN DUYỆT]** |
| **DEC-ARCH-07** (C7) | **Xung đột Pháp lý: Lưu Sổ cái Consent 5 năm vs Quyền được xóa PII** | Luật 91/2025/QH15 quy định quyền được xóa PII của người học, nhưng cũng yêu cầu doanh nghiệp phải lưu vết chứng minh đã có sự đồng ý xử lý dữ liệu trong quá khứ (5 năm). Đề xuất: Khi ẩn danh hóa (`anonymize_learner`), thay `phone_hash` bằng UUID ngẫu nhiên và xóa `user_ip_hash`, bảo lưu dòng log consent dưới dạng ẩn danh (pseudonymized audit trail). Cần pháp chế SHD chốt phương án. | Thủ tục `anonymize_learner` thực thi theo đề xuất. | **[CẦN DUYỆT]** |
| **DEC-ARCH-08** (C8) | **Cơ chế Quản lý Khóa Mã hóa (Key Management Service)** | Đề xuất sử dụng Cloud KMS (AWS KMS hoặc GCP Cloud KMS) với chu kỳ tự động xoay khóa 12 tháng/lần. Trường `kid` trong JSON envelope cho phép hỗ trợ giải mã đa thế hệ khóa. Cần IT SHD duyệt nền tảng Cloud KMS được phép dùng. | Cấu trúc JSON envelope `{v, kid, iv, tag, ct}` đã sẵn sàng. | **[CẦN DUYỆT]** |
| **DEC-ARCH-09** (C9) | **Vị trí Địa lý One Center CRM & Chuyển Dữ Liệu Ra Nước Ngoài** | Nếu máy chủ One Center CRM đặt tại nước ngoài, việc đồng bộ PII qua `crm_outbox` sẽ kích hoạt Điều 25 Luật 91/2025/QH15 (Đánh giá tác động chuyển dữ liệu cá nhân ra nước ngoài). Cần Ban Công nghệ SHD xác nhận vị trí đặt máy chủ của One Center CRM. | Không đổi cấu trúc bảng `crm_outbox`. | **[CẦN DUYỆT]** |
| **DEC-ARCH-10** | **Trọng số & Ma trận tính điểm Hot Lead (lead_signals)** | Đề xuất bảng trọng số: Test 1-1 (+3.0 điểm), Timeline 1m (+2.5 điểm), Mục tiêu Ausbildung/Visa 18b (+2.0 điểm), Điểm thi <50% hoặc >70% (+1.5 điểm), Timeline 1-3m (+1.5 điểm). Tổng điểm $\ge 5.0$ là Hot, $3.0 - 4.9$ là Warm, $<3.0$ là Nurture. Cần Giám đốc Tuyển sinh SHD chốt trọng số phân bổ. | Lưu trong `app_settings` và tính toán qua `lead_signals`. | **[CẦN DUYỆT]** |
| **DEC-ARCH-11** | **Cơ chế Đăng Nhập Quản Trị Viên / Giáo Viên Duyệt Đề** | Đề xuất xác thực tài khoản nội bộ SHD (`staff_users`) thông qua Google Workspace SSO (`@shdeducation.vn`) kết hợp phân quyền RBAC thay vì lưu mật khẩu cục bộ. Cần IT SHD duyệt phương án SSO. | Bảng `staff_users` không cần lưu cột password_hash. | **[CẦN DUYỆT]** |
| **DEC-ARCH-12** | **Mô hình Quan hệ Lead: Lead per Learner vs Lead per Attempt** | Đề xuất chọn mô hình **1 Lead / Học viên duy nhất** (`UNIQUE(learner_id)` trong bảng `leads`), lượt thi mới sẽ cập nhật `latest_attempt_id` và ghi tín hiệu vào `lead_signals`. Cần Giám đốc Tuyển sinh duyệt: có muốn mỗi lần thi sinh ra một Lead độc lập hay gom chung theo học viên. | Bảng `leads` hiện để `UNIQUE(learner_id)`. | **[CẦN DUYỆT]** |
| **DEC-ARCH-13** | **Xác thực độ tuổi tự khai & Trách nhiệm pháp lý người dùng** | Học viên tự chọn `age_group` trên form Lead Gate (có thể cố tình chọn trên 18 tuổi để bỏ qua bước xác nhận phụ huynh). Đề xuất: Bổ sung điều khoản pháp lý quy định người dùng tự chịu trách nhiệm về tính trung thực, ghi rõ gian lận độ tuổi sẽ dẫn đến hủy quyền lợi tư vấn/khóa học theo Luật 91/2025/QH15. Cần Pháp chế SHD duyệt điều khoản. | Cập nhật nội dung văn bản `consent_texts`. | **[CẦN DUYỆT]** |
| **DEC-ARCH-14** | **Phân loại Hot Lead khi chỉ có Timeline 1m đơn lẻ** | Nếu học viên chọn `exam_timeline = '1m'` (+2.5 điểm) nhưng không có tín hiệu khác (tổng điểm < 5.0): Có kích hoạt xếp loại Hot Lead ngay lập tức hay phải chờ đạt ngưỡng tổng điểm $\ge 5.0$? Cần Giám đốc Tuyển sinh chốt quy tắc ưu tiên. | Tác động logic hàm tính `lead_temperature`. | **[CẦN DUYỆT]** |
| **DEC-ARCH-15** | **Snapshot Ngưỡng Đạt Tham Khảo Cố Định Theo Bài Thi** | Cột `passing_percentage_snapshot` (mặc định 60.00%) được lưu trực tiếp trong bảng `results` tại thời điểm nộp bài. Đảm bảo nếu ban học thuật điều chỉnh ngưỡng đạt trong tương lai thì kết quả lịch sử của học viên không bị sai lệch. Cần Ban Học thuật xác nhận cơ chế snapshot. | Cột `passing_percentage_snapshot` đã có trong `results`. | **[CẦN DUYỆT]** |
