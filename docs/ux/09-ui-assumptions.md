# Giả định UI Homepage

- The Next.js app is consolidated in `apps/web`; the former standalone frontend and Node demo runtime were removed.
- Workspace chưa có Next.js, Tailwind, Zod, lucide-react hoặc Playwright; package của app mới khai báo dependency cần thiết nhưng chưa tự cài trong phạm vi thay đổi này.
- Hotline và địa chỉ dùng biến môi trường `SITE_HOTLINE` và `SITE_ADDRESS`; khi không có giá trị, footer ẩn hai dòng này.
- Logo chính thức chưa có nên dùng wordmark tạm SHD và hình học SVG/CSS tự vẽ, không tải ảnh bên thứ ba.
- Các route đích như `/de-thi`, `/luyen-nghe` là liên kết giao diện chờ module danh mục; route đề demo đã chỉ rõ `/de-thi/demo-b1-mock-02`.
- Nội dung fixture phía homepage chỉ có metadata, không chứa trường `correct`, `answerKey` hoặc `isCorrect`.
