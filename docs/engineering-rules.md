# Quy Tắc Kỹ Thuật Dự Án (Engineering Rules)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Áp dụng cho:** Toàn bộ kỹ sư phần mềm, kiến trúc sư dữ liệu và AI coding agents.

---

### 1. Hướng Phụ Thuộc Kiến Trúc (Architecture Dependency Rules)
- **Monorepo 4 tầng:** Phải tuân thủ nghiêm ngặt và được kiểm soát bằng công cụ `dependency-cruiser` (`pnpm check:deps`):
  - `core` KHÔNG được import `adapters` hay `apps`.
  - `contracts` KHÔNG được import `core` hay `db`.
  - `db` KHÔNG được import `core`.
  - `apps` (web, worker) là nơi duy nhất lắp ghép và tích hợp các package.

### 2. Bảo Mật Đáp Án & Chấm Điểm Server (Server-Side Grading)
- Bảng `answer_keys` lưu trữ đáp án đúng độc lập. **Đáp án đúng KHÔNG BAO GIỜ được gửi xuống trình duyệt client trước khi nộp bài và qua cổng kiểm soát.**
- Role cơ sở dữ liệu `shd_app` **tuyệt đối không có quyền SELECT** trên bảng `answer_keys`. Chỉ có role chấm thi biệt lập `shd_grader` được quyền đọc đáp án.

### 3. Bảo Vệ Dữ Liệu Cá Nhân (PII) & Vị Thành Niên (< 18 tuổi)
- **Tuyệt đối không đưa PII** (Họ tên, SĐT, email) vào log, console, telemetry hoặc gửi vào prompt của các mô hình AI bên ngoài.
- Số điện thoại được lưu kèm chuỗi băm HMAC có muối bí mật (`PHONE_HASH_PEPPER`) để tra cứu chống trùng lặp. Mã OTP chỉ lưu bản băm (`OTP_HASH_PEPPER`).
- Học viên dưới 18 tuổi bắt buộc phải có sự xác nhận đồng ý của Phụ huynh qua Zalo ZNS trước khi được xếp vào danh sách liên hệ tư vấn.

### 4. Quy Chuẩn Cơ Sở Dữ Liệu & Migration
- Chiến lược migration: **Chỉ tiến lên (forward-only)**, áp dụng mô hình **mở rộng rồi thu hẹp (expand and contract)**.
- **Tuyệt đối không chỉnh sửa** tệp migration SQL đã được áp dụng vào môi trường.
- Quy ước đặt tên: Cột và bảng trong DB dùng `snake_case`; thuộc tính trong TypeScript/JSON dùng `camelCase`.
- Định danh khóa chính: Dùng **UUID** (sinh UUIDv7 ở tầng ứng dụng, `gen_random_uuid()` làm mặc định dự phòng ở DB).
- Thời gian: Sử dụng kiểu `timestamptz` theo chuẩn **UTC**. Đồng hồ server là nguồn sự thật (server-authoritative clock).

### 5. Chuẩn Hóa API & Giao Tiếp Ngoại Vi
- Toàn bộ phản hồi lỗi từ API phải tuân thủ chuẩn RFC 7807 `application/problem+json` (gồm `type`, `title`, `status`, `detail`, `code`).
- Sử dụng mô hình Outbox Pattern trong PostgreSQL với `FOR UPDATE SKIP LOCKED` cho mọi tác vụ đồng bộ CRM và gửi tin ZNS để đảm bảo tính idempotent.

### 6. Không Sử Dụng Dữ Liệu Thật
- 100% nội dung đề thi, dữ liệu người học và số điện thoại trong môi trường phát triển và kiểm thử là **dữ liệu minh họa/giả lập**. Không sao chép đề thi có bản quyền.

### 7. Quy Ước Thông Điệp Git Commit
- Bắt buộc tuân thủ chuẩn **Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`. Ví dụ: `feat(contracts): add exam submit payload schema`.

