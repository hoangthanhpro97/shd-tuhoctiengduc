# Apps: Web Client & API Gateway

Ứng dụng Next.js App Router duy nhất của repository, kết nối PostgreSQL qua các API Route Handlers:

```powershell
pnpm web:dev
```

Mở `http://localhost:3000` để trải nghiệm:

- Danh mục đề mô phỏng đọc từ PostgreSQL.
- Trang thông tin đề tại `/de-thi/[slug]`.
- Phòng thi split-screen tại `/lam-bai/[attemptId]`.
- Autosave persistent với optimistic concurrency control.
- Chấm điểm server-side qua `@shd/core` và role `shd_worker`.
- Kết quả và lead gate OTP mock tại `/ket-qua/[attemptId]`.

Mã nguồn UI nằm trong `app/` và `components/`, server services trong `lib/server/`, dữ liệu seed tại `content/exams/`.

OTP hiện dùng mock provider ở development/test. ZNS/SMS production và CRM outbox vẫn là các tích hợp riêng ở phase sau.
