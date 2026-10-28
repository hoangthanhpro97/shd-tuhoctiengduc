# Báo Cáo Tự Đánh Giá Nghiệm Thu (UX & Wireframe Self-Review - Bản Cập Nhật)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Đơn vị phát triển:** SHD Education (Hệ sinh thái SHD Corp)  
> **Vai trò:** Senior Product Designer & Senior Front-end Engineer  
> **Ngày đánh giá:** 28/10/2026 (Đã nghiệm thu đo đạc tự động bằng Chrome DevTools Protocol)

---

## 1. Bảng Đối Soát 7 Tiêu Chí Nghiệm Thu (Acceptance Criteria Checklist)

| STT | Tiêu chí nghiệm thu | Kết quả | Chi tiết đối soát & Bằng chứng kỹ thuật bằng số liệu thực tế |
| :---: | :--- | :---: | :--- |
| **1** | **Luồng có đủ đường chính và đường lỗi nêu trên** | **ĐẠT (PASS)** | Tài liệu `docs/ux/02-user-flows.md` mô hình hóa đầy đủ 4 luồng chính: (A) Khách ẩn danh làm bài → nộp → xem kết quả → Lead Gate → thành công; (B) Người học quay lại tiếp tục phiên; (C) Nhánh dưới 18 tuổi và phụ huynh xác nhận; (D) Đủ 5 kịch bản lỗi: D1 Hết giờ tự nộp (Timeout), D2 Mất kết nối & lưu ngoại tuyến, D3 Lỗi tải audio Hören, D4 Nhập sai/hết hạn OTP, D5 Từ chối các điều khoản đồng ý. |
| **2** | **Không wireframe nào hiện đáp án đúng trước khi nộp bài** | **ĐẠT (PASS)** | Trong file `wireframes/exam-room.html`, toàn bộ các câu hỏi trắc nghiệm (Lesen 1–5 và Hören 16–20) chỉ hiển thị phương án lựa chọn và trạng thái người dùng đã chọn (`checked`). DOM hoàn toàn không chứa class hay thuộc tính gợi ý đáp án đúng trước khi nộp bài. Khớp hoàn toàn với spec `docs/ux/08-sample-exam-spec.md`. |
| **3** | **Các ô đồng ý đều chưa tích sẵn và tách riêng** | **ĐẠT (PASS)** | Trong modal Lead Gate tại `wireframes/result-and-gate.html`, cả 3 ô checkbox đồng ý đều ở trạng thái chưa tích sẵn (unchecked): (1) Bắt buộc: chấm điểm & lưu lịch sử; (2) Tùy chọn: tư vấn khóa học; (3) Tùy chọn: tư vấn du học nghề / 18b. Mang nhãn pháp lý `[PLACEHOLDER – chờ pháp chế duyệt]`. |
| **4** | **Có nhánh người dùng dưới 18 tuổi** | **ĐẠT (PASS)** | Form Lead Gate yêu cầu người dùng tự chọn độ tuổi. Khi chọn "Học sinh (<18 tuổi)", hệ thống tự động mở rộng trường SĐT/Zalo của Cha/Mẹ (bắt buộc). Có trạng thái trực quan mô phỏng tin nhắn Zalo ZNS gửi phụ huynh và màn hình phụ huynh xác nhận đồng ý trước khi đội ngũ tuyển sinh được phép liên hệ. |
| **5** | **Mọi wireframe chạy offline và đúng ở 375px và 1280px** | **ĐẠT (PASS)** | Cả 4 file HTML chạy 100% offline, không thư viện ngoài, không CDN, dùng font hệ thống. **Số đo thực tế tự động:** 100% kịch bản tại 375px có `scrollWidth = 375px <= clientWidth = 375px` (hoàn toàn không cuộn ngang). Bảng kịch bản trên `index.html` được bọc container cuộn riêng; form Lead Gate chuyển thành 1 cột mượt mà dưới 480px. Vùng chạm tất cả các nút chính đều đạt `≥ 44px`. |
| **6** | **Mỗi màn hình có danh sách sự kiện phân tích** | **ĐẠT (PASS)** | Tài liệu `docs/ux/03-screen-inventory.md` đã liệt kê 10 màn hình thành phần từ SCR-01 đến SCR-10 cùng bảng từ điển 13 sự kiện phân tích cốt lõi (Analytics Event Tracking Schema) đầy đủ tên sự kiện, điểm kích hoạt, thuộc tính tham số và ý nghĩa nghiệp vụ. |
| **7** | **docs/ux/05-self-review.md đã điền trung thực** | **ĐẠT (PASS)** | Báo cáo này được cập nhật đầy đủ kèm số đo tự động từ `docs/ux/audit_results.json` và bộ ảnh chụp kiểm chứng trong `docs/ux/screenshots/`. |

---

## 2. Bảng Số Liệu Đo Đạc Kỹ Thuật Thực Tế Tại 375px (Mobile Viewport)

Dữ liệu được trích xuất tự động từ phiên chạy headless audit thông qua Chrome DevTools Protocol:

| Tên màn hình / Kịch bản đo | scrollWidth | clientWidth | scrollWidth ≤ clientWidth | Đánh giá hiển thị |
| :--- | :---: | :---: | :---: | :--- |
| `index.html` (Mặc định) | 375px | 375px | **PASS (100%)** | Tiêu đề ngắt từ mượt mà, bảng kiểm tra cuộn nội bộ |
| `catalog.html` (Lọc theo B1) | 375px | 375px | **PASS (100%)** | Lưới thẻ xếp chồng 1 cột, bộ lọc tương tác mượt |
| `catalog.html` (Mô phỏng 0 kết quả) | 375px | 375px | **PASS (100%)** | Thẻ Empty state căn giữa, nút đặt lại chuẩn chạm |
| `exam-room.html` (Tab Đọc - Lesen) | 375px | 375px | **PASS (100%)** | Thanh chuyển Đề bài ↔ Câu hỏi chuẩn mobile |
| `exam-room.html` (Tab Nghe - Hören) | 375px | 375px | **PASS (100%)** | Trình phát an toàn cấm tua, hiện đúng câu 16–20 |
| `exam-room.html` (Giả lập mất mạng) | 375px | 375px | **PASS (100%)** | Banner cảnh báo vàng lưu ngoại tuyến không vỡ khung |
| `exam-room.html` (Giả lập lỗi audio) | 375px | 375px | **PASS (100%)** | Hộp lỗi hiện nút thử lại không trừ lượt nghe |
| `exam-room.html` (Hết giờ làm bài) | 375px | 375px | **PASS (100%)** | Đồng hồ cảnh báo đỏ 00:00 |
| `exam-room.html` (Hộp xác nhận nộp) | 375px | 375px | **PASS (100%)** | Modal căn giữa, số liệu 21/30 câu khớp spec |
| `result-and-gate.html` (Tổng quan điểm) | 375px | 375px | **PASS (100%)** | Thẻ điểm 21/30, ghi chú tham khảo, câu 3+ chữ giả mờ |
| `result-and-gate.html` (Lead Gate Bước 1) | 375px | 375px | **PASS (100%)** | Lưới 1 cột, min-width: 0, không bị cắt mép phải |
| `result-and-gate.html` (Nhánh < 18 tuổi) | 375px | 375px | **PASS (100%)** | Mở rộng trường Zalo Cha/Mẹ mượt mà |
| `result-and-gate.html` (Lead Gate Bước 2) | 375px | 375px | **PASS (100%)** | 6 ô OTP căn giữa, đồng hồ đếm ngược 54s |
| `result-and-gate.html` (Lead Gate Bước 3) | 375px | 375px | **PASS (100%)** | Trạng thái mở khóa thành công, nút CTA lớn |
| `result-and-gate.html` (Phụ huynh xác nhận)| 375px | 375px | **PASS (100%)** | Tin nhắn ZNS mô phỏng và nút xác nhận đồng ý |

---

## 3. Rà Soát Kích Thước Vùng Chạm (Touch Targets Audit)

- Toàn bộ các nút bấm tương tác chính (`.btn-card-action`, `.btn-submit-exam`, `.tab-btn`, `.mobile-view-btn`, `.btn-step-submit`, `.btn-cta-primary`, `.btn-unlock-gate`, `.filter-pill`, `.palette-btn`) đều được cấu hình đạt chiều cao **tối thiểu 44px**.
- Toàn bộ các ô nhập liệu (`input[type="text"]`, `input[type="tel"]`, `input[type="email"]`, `select`) đều đạt chiều cao **44px đến 48px**.
- Các nhãn lựa chọn đáp án (`.option-label`, `.pill-radio-label`) đạt chiều cao **48px**, diện tích chạm toàn dòng ngón tay.
- Nút X đóng modal đã được nâng lên **44×44px** và đặt tách biệt tại góc trên cùng bên phải.
- Một số nút điều khiển phụ dành riêng cho thanh công cụ mô phỏng demo của reviewer (`.demo-btn`: 30px) và link chữ inline (`.btn-reset-filters`) được giữ nhỏ để tránh chiếm dụng không gian hiển thị của giao diện người dùng thực tế.

---

## 4. Bằng Chứng Hình Ảnh Kiểm Chứng (Screenshots)

Bộ 30 hình ảnh độ phân giải cao tại 375px và 1280px đã được tạo tự động và lưu trữ tại thư mục:  
`docs/ux/screenshots/` (Bao gồm đầy đủ các trạng thái của Catalog, Exam Room, Result Page, Modal Lead Gate và Nhánh phụ huynh).
