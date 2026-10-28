# Báo Cáo Tự Đánh Giá Nghiệm Thu (UX & Wireframe Self-Review)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Đơn vị phát triển:** SHD Education (Hệ sinh thái SHD Corp)  
> **Vai trò:** Senior Product Designer & Senior Front-end Engineer  
> **Ngày đánh giá:** 28/10/2026

---

## 1. Bảng Đối Soát 7 Tiêu Chí Nghiệm Thu (Acceptance Criteria Checklist)

| STT | Tiêu chí nghiệm thu | Kết quả | Chi tiết đối soát & Bằng chứng kỹ thuật |
| :---: | :--- | :---: | :--- |
| **1** | **Luồng có đủ đường chính và đường lỗi nêu trên** | **ĐẠT (PASS)** | Tài liệu `docs/ux/02-user-flows.md` đã mô hình hóa đầy đủ 4 luồng chính bằng Mermaid: (A) Khách ẩn danh làm bài $\rightarrow$ nộp $\rightarrow$ xem kết quả $\rightarrow$ Lead Gate $\rightarrow$ thành công; (B) Người học quay lại tiếp tục phiên; (C) Nhánh $<18$ tuổi và phụ huynh; (D) Đủ 5 kịch bản lỗi: D1 Hết giờ tự nộp (Timeout), D2 Mất kết nối & lưu ngoại tuyến, D3 Lỗi tải audio Hören, D4 Nhập sai/hết hạn OTP, D5 Từ chối các điều khoản đồng ý. |
| **2** | **Không wireframe nào hiện đáp án đúng trước khi nộp bài** | **ĐẠT (PASS)** | Trong file `wireframes/exam-room.html`, toàn bộ các thẻ câu hỏi và lựa chọn chỉ hiển thị nội dung câu hỏi và trạng thái đã chọn của người dùng (`checked`), hoàn toàn không có class `.correct-answer`, thuộc tính đánh dấu hay bất kỳ gợi ý đáp án đúng nào trong DOM trước khi nộp bài. |
| **3** | **Các ô đồng ý đều chưa tích sẵn và tách riêng** | **ĐẠT (PASS)** | Trong modal Lead Gate tại `wireframes/result-and-gate.html`, cả 3 ô checkbox đồng ý đều ở trạng thái chưa tích sẵn (unckecked). Chúng được phân định rõ ràng: (1) Bắt buộc: xử lý dữ liệu để chấm điểm; (2) Tùy chọn: tư vấn khóa học; (3) Tùy chọn: chia sẻ đối tác SHD để tư vấn du học nghề / 18b. Mọi nội dung pháp lý đều mang nhãn `[PLACEHOLDER – chờ pháp chế duyệt]`. |
| **4** | **Có nhánh người dùng dưới 18 tuổi** | **ĐẠT (PASS)** | Tại Bước 1 form Lead Gate, khi người dùng chọn đối tượng "Học sinh (<18 tuổi)", giao diện tự động mở rộng trường nhập "Số điện thoại / Zalo của Cha/Mẹ/Người giám hộ" (bắt buộc) kèm ghi chú pháp lý và quy trình gửi Zalo ZNS xác nhận đến phụ huynh trước khi đội ngũ tuyển sinh được phép liên hệ. |
| **5** | **Mọi wireframe chạy offline và đúng ở 375px và 1280px** | **ĐẠT (PASS)** | Cả 4 file HTML (`index.html`, `exam-room.html`, `result-and-gate.html`, `catalog.html`) 100% không dùng thư viện ngoài, không có link CDN, sử dụng font hệ thống (`system-ui`). Đã được tối ưu hóa responsive không bị thanh cuộn ngang ở 375px (Mobile First) và hiển thị split-screen chuẩn ở 1280px (Desktop). Mọi nút bấm đều đạt chiều cao vùng chạm tối thiểu $\ge 44\text{px}$. |
| **6** | **Mỗi màn hình có danh sách sự kiện phân tích** | **ĐẠT (PASS)** | Tài liệu `docs/ux/03-screen-inventory.md` đã liệt kê 10 màn hình thành phần từ SCR-01 đến SCR-10 cùng bảng từ điển 13 sự kiện phân tích cốt lõi (Analytics Event Tracking Schema) đầy đủ tên sự kiện, điểm kích hoạt, thuộc tính tham số và ý nghĩa nghiệp vụ. |
| **7** | **docs/ux/05-self-review.md đã điền trung thực** | **ĐẠT (PASS)** | Báo cáo này được lập trung thực, chỉ rõ các điểm đã đạt chuẩn và các khoảng trống/giả định kỹ thuật cần giải quyết ở Bước 2. |

---

## 2. Khoảng Trống Còn Lại & Giới Hạn Của Bước 1 (Gaps & Limitations)

1. **Dữ liệu đề thi thực tế (Exam Content):**
   - Hiện tại wireframe sử dụng nội dung giả định tiếng Đức chuẩn mực (`Beispielfrage 1`, `Beispieltext`), chưa đưa toàn bộ ngân hàng đề thi thật vào do nằm ngoài phạm vi Bước 1.
2. **Xác thực OTP thực tế (Real Auth & Telephony Backend):**
   - Luồng OTP trong wireframe hiện chạy dưới dạng JavaScript giả lập tương tác (người dùng nhập `123456` là kích hoạt bước thành công). Chưa kết nối API Zalo ZNS hay SMS Gateway của SHD.
3. **Lưu trữ dữ liệu ngoại tuyến quy mô lớn (Persistent Storage Engine):**
   - Wireframe đã mô phỏng thanh thông báo và logic đổi trạng thái "Lưu ngoại tuyến". Khi bước vào giai đoạn lập trình Front-end hoàn chỉnh (Bước 2), cần triển khai IndexedDB Service Worker để đảm bảo lưu trữ hàng trăm câu hỏi khi mất mạng kéo dài.
4. **Pháp chế phê duyệt điều khoản:**
   - Các điều khoản đồng ý (Consents) và thông báo pháp lý cho đối tượng dưới 18 tuổi hiện mang nhãn `[PLACEHOLDER – chờ pháp chế duyệt]`, cần văn bản chính thức từ phòng Pháp chế SHD Corp trước khi đưa vào sản xuất.

---

## 3. Kiến Nghị Cho Giai Đoạn Tiếp Theo (Next Steps)

1. **Review Wireframe cùng Ban Giám đốc & Phòng Tuyển sinh SHD:** Trực tiếp tương tác trên 3 file wireframe để thống nhất vị trí và tần suất xuất hiện của CTA *"Đăng ký test đầu vào 1-1 miễn phí"*.
2. **Phê duyệt 3 điều khoản bảo vệ dữ liệu:** Trình phòng Pháp chế văn bản thỏa thuận xử lý dữ liệu cá nhân theo Nghị định 13.
3. **Đăng ký Template Zalo ZNS:** Đăng ký mẫu tin nhắn gửi OTP và mẫu tin nhắn gửi phụ huynh với Zalo OA của SHD Education.
4. **Chuyển sang Bước 2 (UI Design & Front-end Component Build):** Thiết kế giao diện chi tiết (Hi-Fi Prototype) với bảng màu thương hiệu SHD Education và phát triển component hoàn chỉnh.
