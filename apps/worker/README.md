# Apps: Background Worker

Thư mục giữ chỗ cho worker xử lý tác vụ nền (CRM outbox queue, Zalo ZNS notification, chấm điểm bất đồng bộ).
Theo kế hoạch kiến trúc Bước 2, **chưa viết mã nguồn nghiệp vụ** tại thư mục này ở Lệnh 2.1.
Worker sử dụng role `shd_worker` để lấy việc qua cơ chế `FOR UPDATE SKIP LOCKED`.

