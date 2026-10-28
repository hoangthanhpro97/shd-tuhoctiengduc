# Nhật Ký Thay Đổi & Sửa Lỗi UX/Wireframe (Change Log)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Phiên bản:** Revision 2 (Fixing Polish, Business Rules & SSOT Consistency)  
> **Ngày cập nhật:** 28/10/2026

---

## 1. Tóm Tắt Các Nhóm Sửa Lỗi

### A. Lỗi Trình Bày & Định Dạng (Polish & Visual Formatting)
- **Ký hiệu LaTeX & Markdown trong HTML:**
  - Thay thế toàn bộ các ký hiệu toán học nguyên văn (`$\rightarrow$`, `$\ge 44\text{px}$`, `$\leftrightarrow$`) thành ký tự Unicode chuẩn (`→`, `≥ 44px`, `↔`).
  - Thay thế các dấu backtick lạc chỗ trong văn bản HTML bằng thẻ `<code>` ngữ nghĩa chuẩn (ví dụ: `<code>exam-room.html</code>`).
- **Tràn viền màn hình 375px trên `index.html`:**
  - Áp dụng `overflow-wrap: anywhere; word-break: break-word;` cho tiêu đề và tên miền `(tuhoctiengduc.shdeducation.vn)`.
  - Bọc bảng "Kịch bản kiểm tra" trong container cuộn ngang riêng `.table-container { overflow-x: auto; width: 100%; }`, loại bỏ 100% tình trạng vỡ layout hoặc thanh cuộn ngang trang.
- **Tràn viền Modal Lead Gate trên `result-and-gate.html` ở 375px:**
  - Chuyển toàn bộ các hàng 2 cột (`.grid-2col`, `.radio-pill-group`) sang 1 cột duy nhất dưới 480px.
  - Thiết lập thuộc tính `min-width: 0;` cho mọi phần tử con trong grid để ngăn chặn ô input/select bị cắt mép phải.
  - Tách nút X đóng cửa sổ ra góc trên riêng biệt (`position: absolute; top: 10px; right: 10px;`) với kích thước chuẩn 44×44px; rút gọn nhãn các bước trên mobile để không bị nút X đè lên.

### B. Nhất Quán Nội Dung & Single Source of Truth
- **Tạo tài liệu `docs/ux/08-sample-exam-spec.md`:**
  - Chuẩn hóa đề thi mẫu 30 câu: 15 câu Đọc hiểu (Lesen Teil 1–3: 1–15) và 15 câu Nghe hiểu (Hören Teil 1–3: 16–30).
  - Khớp phiên làm bài mẫu chính xác với trang kết quả: Tổng điểm 21/30 (Lesen: 12/15, Hören: 9/15, thời gian 38 phút 20 giây).
- **Đồng bộ hóa `exam-room.html`:**
  - Tab Lesen chỉ hiện câu hỏi Đọc (Aufgaben 1–5), tab Hören chỉ hiện câu hỏi Nghe (Aufgaben 16–20), chấm dứt hoàn toàn việc lặp lại câu hỏi Lesen sang tab Hören.
  - Ma trận câu hỏi 1–30 được chia thành 2 khối kỹ năng riêng biệt: *📖 Leseverstehen (1–15)* và *🎧 Hörverstehen (16–30)*.
  - Cột trái (Bài đọc/Audio) trên Desktop được cố định (sticky) và cuộn độc lập với cột câu hỏi bên phải. Trên mobile có thanh tab chuyển nhanh "Đề bài" và "Phiếu câu hỏi".
- **Chuẩn hóa `catalog.html`:**
  - Triển khai bộ lọc JavaScript tương tác thời gian thực trên dữ liệu mẫu: lọc theo Kỳ thi, Trình độ, Kỹ năng, Trạng thái. Tự động cập nhật số lượng "Tìm thấy N đề" và hiển thị trạng thái rỗng (empty state) khi không có kết quả.
  - Đưa kỳ thi ÖSD về trạng thái vô hiệu hóa (`disabled`) kèm nhãn *"ÖSD (Sắp có)"*.
  - Loại bỏ hoàn toàn chữ "band" (thuật ngữ IELTS) và chữ "DOL" khỏi toàn bộ giao diện công khai.

### C. Quy Tắc Nghiệp Vụ & Bảo Mật Dữ Liệu
- **Bảo mật đáp án câu 3–30 trên `result-and-gate.html`:**
  - Điểm tổng và điểm kỹ năng xem miễn phí; nhãn đúng/sai và bộ lọc đúng/sai chỉ áp dụng cho Câu 1–2 công khai. Từ Câu 3 trở đi **tuyệt đối không** hiển thị nhãn đúng/sai trước khi qua Lead Gate (tránh suy luận đáp án).
  - Lớp làm mờ phía sau khối khóa sử dụng văn bản giả lập vô nghĩa (dummy text). Trình duyệt client không nhận payload lời giải thật trước khi mở khóa.
- **Chuẩn hóa thông điệp kết quả:**
  - Thay "ĐẠT (BESTANDEN)" bằng **"ĐẠT NGƯỠNG THAM KHẢO (70%)"**, kèm ghi chú: *"Điểm luyện tập chỉ mang tính tham khảo, không phải kết quả thi chính thức"*.
  - Thay "Khá vững B1" bằng **"Gần mức B1"**.
- **Tối ưu hóa phễu Lead Gate:**
  - Gộp các nút mở khóa phân tán thành một lời kêu gọi nhất quán duy nhất: *"Mở khóa toàn bộ lời giải chi tiết và phân tích lỗi sai"*.
  - Không chọn sẵn (unselected) bất kỳ giá trị nào cho "Mục tiêu học", "Thời gian thi", "Nhóm đối tượng/Độ tuổi" để bảo vệ tính chính xác của dữ liệu Hot Lead CRM.
  - Chuyển trường Email thành tùy chọn (chỉ bắt buộc khi người dùng cần nhận tài liệu Ebook).
  - Xây dựng màn hình/trạng thái trực quan riêng cho nhánh học sinh dưới 18 tuổi và quy trình Phụ huynh nhận tin nhắn ZNS xác nhận đồng ý tư vấn.
- **Trình phát nghe Hören:**
  - Thanh tiến trình chỉ đóng vai trò hiển thị (read-only), cấm hoàn toàn thao tác tua nhanh/chậm.
  - Bổ sung cấu hình bật/tắt nút tạm dừng (Pause) theo quy chế từng kỳ thi.

---

## 2. Số Liệu Kiểm Thử & Đo Đạc Thực Tế (Automated Audit Metrics)

Toàn bộ 4 trang wireframe ở mọi trạng thái và kích thước viewport đã được đo tự động bằng Chrome DevTools Protocol (`scripts/measure_and_capture.mjs`).

| Trang | Trạng thái (Scenario) | Viewport | scrollWidth | clientWidth | scrollWidth ≤ clientWidth | Touch Targets < 44px |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `index.html` | Mặc định (Hub) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `index.html` | Mặc định (Hub) | 1280px | 1265px | 1265px | **ĐẠT (PASS)** | 0 phần tử |
| `catalog.html` | Đã lọc kết quả (B1) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `catalog.html` | Không có kết quả (Empty) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `catalog.html` | Đã lọc kết quả (B1) | 1280px | 1265px | 1265px | **ĐẠT (PASS)** | 0 phần tử |
| `catalog.html` | Không có kết quả (Empty) | 1280px | 1265px | 1265px | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Tab Đọc (Lesen) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Tab Nghe (Hören) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Giả lập mất mạng | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Giả lập lỗi Audio | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Hết giờ làm bài (Timeout) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Hộp thoại xác nhận nộp bài | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `exam-room.html` | Tất cả trạng thái trên | 1280px | 1265px | 1265px | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Kết quả tổng quan | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Modal Gate Bước 1 (Form) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Nhánh dưới 18 tuổi | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Modal Gate Bước 2 (OTP) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Modal Gate Bước 3 (Thành công) | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Phụ huynh xác nhận ZNS | 375px | **375px** | **375px** | **ĐẠT (PASS)** | 0 phần tử |
| `result-and-gate.html` | Tất cả trạng thái trên | 1280px | 1265px | 1265px | **ĐẠT (PASS)** | 0 phần tử |

---

## 3. Danh Mục 30 Ảnh Chụp Màn Hình Đã Tạo Mới Trong `docs/ux/screenshots/`

- `index_375px_default.png`, `index_1280px_default.png`
- `catalog_375px_filtered.png`, `catalog_1280px_filtered.png`
- `catalog_375px_empty.png`, `catalog_1280px_empty.png`
- `exam_room_375px_lesen.png`, `exam_room_1280px_lesen.png`
- `exam_room_375px_hoeren.png`, `exam_room_1280px_hoeren.png`
- `exam_room_375px_offline.png`, `exam_room_1280px_offline.png`
- `exam_room_375px_audio_error.png`, `exam_room_1280px_audio_error.png`
- `exam_room_375px_timeout.png`, `exam_room_1280px_timeout.png`
- `exam_room_375px_submit_modal.png`, `exam_room_1280px_submit_modal.png`
- `result_375px_overview.png`, `result_1280px_overview.png`
- `result_375px_gate_step1.png`, `result_1280px_gate_step1.png`
- `result_375px_gate_under18.png`, `result_1280px_gate_under18.png`
- `result_375px_gate_step2_otp.png`, `result_1280px_gate_step2_otp.png`
- `result_375px_gate_step3_success.png`, `result_1280px_gate_step3_success.png`
- `result_375px_parent_approval.png`, `result_1280px_parent_approval.png`

---

## 4. Chi Tiết Bản Cập Nhật Lệnh 2.0 (Dọn Tồn Đọng Bước 1)

1. **Nút X đóng Lead Gate Modal:**
   - Đưa nút X vào thanh tiêu đề độc lập (`.modal-top-bar`) nằm phía trên `.step-bar`.
   - Loại bỏ hoàn toàn hiện tượng nút X đè lên nhãn "3. Mở khóa" tại 360px và 375px.
2. **Nhánh Người dùng dưới 18 tuổi:**
   - Xây dựng 3 trạng thái giao diện trực quan riêng biệt:
     - Trạng thái 18a: Biểu mẫu điền thêm số Zalo của Cha/Mẹ (`result_375px_gate_under18_form.png`).
     - Trạng thái 18b: Màn hình "Đã gửi tin xác nhận cho phụ huynh, đang chờ" (`result_375px_gate_under18_pending.png`).
     - Trạng thái 18c: Màn hình phụ huynh xem kết quả và bấm xác nhận đồng ý (`result_375px_gate_under18_parent_approval.png`).
3. **Phòng thi trên Mobile (`exam-room.html`):**
   - Trình phát Hören: Thống nhất trạng thái sẵn sàng ban đầu là `00:00 / 03:05`, thanh tiến trình `0%`, hiển thị rõ `Lượt nghe 1/2`.
   - Thanh demo bar màu đen: Gộp vào nút "🛠️ Công cụ demo ▾", mặc định thu gọn khi màn hình $\le 480\text{px}$.
4. **Pháp lý và Thuật ngữ:**
   - Cập nhật trích dẫn Nghị định 13/2023 sang **Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP** (kèm ghi chú "chờ pháp chế xác nhận").
   - Mục B-03 trong `00-assumptions.md`: sửa thành "cần pháp chế xác nhận; thiết kế mặc định KHÔNG liên hệ khi thiếu đồng ý".
   - Mục C-02 trong `00-assumptions.md`: tách thời gian hiệu lực OTP (đề xuất 5 phút) khỏi thời gian chờ gửi lại (60 giây).
   - Mục B-01 & DEC-09: Thống nhất chế độ Thi thử cấm tua, Luyện tập cho tua; thêm câu hỏi mở về chế độ Luyện tập trong MVP.
   - Thay toàn bộ "chuẩn TELC/Goethe" thành "mô phỏng định dạng TELC/Goethe". Thêm Mục 6 "Giả định về cấu trúc đề" vào `docs/ux/08-sample-exam-spec.md`.

