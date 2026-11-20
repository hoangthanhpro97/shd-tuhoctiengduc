# CHỈ THỊ KỸ THUẬT: TÁI CẤU TRÚC BỘ COMPONENT CÂU HỎI ĐA HÌNH & NÂNG CẤP HUB BÀI MẪU NÓI/VIẾT (ÖSD & GOETHE)

**Mã tài liệu:** `TASK-UI-04`  
**Dự án:** `shd-tuhoctiengduc` (`apps/web`)  
**Độ ưu tiên:** High | **Trạng thái:** Ready for Implementation  
**Mục tiêu:** 
1. Xây dựng bộ thành phần câu hỏi đa hình (Polymorphic Question Components) cho phòng thi trực tuyến (`/lam-bai/[attemptId]`).
2. Nâng cấp giao diện học tập chuyên sâu cho Bài mẫu Viết (`/bai-mau-schreiben`) và Bài mẫu Nói (`/bai-mau-sprechen`) đáp ứng chuẩn khảo thí ÖSD và Goethe từ B1 đến B2.
3. Bảo đảm tính tương thích với cơ chế Server-side Grading và Design System thương hiệu SHD Education (Màu đỏ chủ đạo `#da2527`, font Montserrat, bo góc `rounded-2xl`).

---

## I. XÂY DỰNG BỘ THÀNH PHẦN CÂU HỎI ĐA HÌNH (POLYMORPHIC QUESTION CARDS)

Vị trí thư mục: `apps/web/components/exam-room/questions/`

Thay thế cơ chế hiển thị câu hỏi đơn điệu bằng bộ 4 thẻ câu hỏi chuyên biệt được điều phối qua `QuestionRenderer.tsx`:

### 1. `BinaryChoiceCard.tsx` (Đúng/Sai - Richtig/Falsch hoặc Ja/Nein)
- **Áp dụng cho:** Đọc/Nghe Goethe B1 Teil 1, ÖSD B1/B2 Teil 1 & Teil 3.
- **Quy chuẩn giao diện:**
  - Tiêu đề câu hỏi, số thứ tự `displayNumber` lấy từ `flattenExamQuestions()`.
  - Hai nút lựa chọn lớn nằm ngang: **Richtig (Đúng)** và **Falsch (Sai)** (hoặc **Ja / Nein** tùy theo `providerFormat`).
  - Trạng thái chưa chọn: `bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100`.
  - Trạng thái đã chọn: `bg-red-50 border-2 border-[#da2527] text-[#da2527] font-bold shadow-xs`.

### 2. `MatchingCard.tsx` (Ghép nối thông tin / Tiêu đề / Quảng cáo)
- **Áp dụng cho:** Đọc hiểu ÖSD B2 Teil 2 (ghép tiêu đề Überschriften A–G), Goethe B1 Teil 3 (ghép quảng cáo Anzeige với tình huống người cần tìm).
- **Quy chuẩn giao diện:**
  - Hiển thị danh sách tình huống/đoạn trích bên trái.
  - Dropdown chọn nhãn ghép nối (A, B, C, D,...) hoặc kéo thả (Drag & Drop) trực quan.
  - Tự động đánh dấu phương án đã được ghép để tránh chọn trùng lặp.

### 3. `MultipleChoiceCard.tsx` (Trắc nghiệm 3 hoặc 4 phương án)
- **Áp dụng cho:** Các phần thi trắc nghiệm A/B/C hoặc A/B/C/D truyền thống.
- **Quy chuẩn giao diện:**
  - Danh sách phương án hiển thị dạng thẻ dọc: `p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all`.
  - Badge ký tự lựa chọn hình tròn: `w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs`.
  - Khi kích hoạt: Viền đỏ `#da2527`, nền `bg-red-50/60`, ký tự màu trắng trên nền đỏ tròn.

### 4. `FillInBlankCard.tsx` (Điền từ ngắn / Hoàn thành biểu mẫu thông tin)
- **Áp dụng cho:** Nghe hiểu ÖSD B1/B2 Teil 2 (ghi lại thông tin tin nhắn thoại, điền mẫu đơn, số điện thoại, thời gian).
- **Quy chuẩn giao diện:**
  - Ô input gõ từ đơn/cụm từ ngắn: `px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527] text-slate-900 font-medium`.
  - Hỗ trợ dải phím bấm nhanh các ký tự đặc biệt tiếng Đức: `[ä, ö, ü, ß]`.

### 5. `QuestionRenderer.tsx` (Bộ điều phối đa hình)
- Nhận diện loại câu hỏi (`question.type` hoặc suy luận qua cấu trúc `options`) để render đúng thẻ tương ứng.
- Đảm bảo đồng bộ ngay lập tức với Zustand store (`examSessionStore`) khi người học thay đổi lựa chọn.

---

## II. NÂNG CẤP PHÂN HỆ BÀI MẪU VIẾT (SCHREIBEN HUB)

Vị trí: `apps/web/components/model-answers/writing/`  
Route: `/bai-mau-schreiben/[slug]`

### 1. `WritingPromptCard.tsx` (Thẻ Đề bài & Checklist Leitpunkte)
- Hiển thị đề bài gốc tiếng Đức kèm bản dịch tiếng Việt ẩn/hiện.
- Danh sách 3–4 gạch đầu dòng (Leitpunkte) bắt buộc kèm checkbox tương tác để người học tick xác nhận đã xử lý từng ý trong bài viết.
- Badge phân loại kỳ thi (`Goethe B1/B2` hoặc `ÖSD B1/B2`), đối tượng nhận thư (Thân mật - Informell, Trang trọng - Formell, hoặc Diễn đàn - Forumsbeitrag).

### 2. `WritingWorkspace.tsx` (Khung Soạn Thảo & Đếm Từ Trực Tiếp)
- Khung `textarea` soạn thảo văn bản với kích thước co giãn linh hoạt (`min-h-[280px]`).
- **Bộ đếm từ thời gian thực (Live Word Counter):**
  - Tự động tính số lượng từ tiếng Đức khi gõ.
  - Thanh tiến độ (Progress Bar) đổi màu thông minh:
    - *Chưa đạt độ dài tối thiểu (< 80% yêu cầu):* Màu xám/vàng.
    - *Đạt chuẩn độ dài yêu cầu (ví dụ: 80 - 100 từ cho B1):* Màu xanh lá cây `#16a34a`.
    - *Vượt quá dài (> 140%):* Cảnh báo nhẹ màu cam.
- Dải phím gõ nhanh biến âm tiếng Đức: nút bấm gắn ký tự `ä`, `ö`, `ü`, `ß`, `Ä`, `Ö`, `Ü` chèn trực tiếp vào vị trí con trỏ.
- Nút "Xuất file nháp (.txt)" tải bài làm về máy cá nhân.

### 3. `WritingModelSample.tsx` (Bài Mẫu Song Ngữ & Tiêu Chí Chấm)
- Bố cục 2 cột song song (Desktop): Cột trái tiếng Đức, Cột phải bản dịch tiếng Việt.
- Tích hợp tính năng Highlight cụm từ liên kết (Redemittel Highlighter): Bấm nút để làm sáng các liên từ và mẫu câu đắt giá trong bài.
- Khung Accordion: Phân tích tiêu chí chấm điểm chuẩn ÖSD/Goethe (Nhiệm vụ - Aufgabenerfüllung, Mạch lạc - Kohärenz, Từ vựng - Wortschatz, Cấu trúc ngữ pháp - Strukturen).

---

## III. NÂNG CẤP PHÂN HỆ BÀI MẪU NÓI (SPRECHEN HUB)

Vị trí: `apps/web/components/model-answers/speaking/`  
Route: `/bai-mau-sprechen/[slug]`

### 1. `SpeakingSlidesViewer.tsx` (Trình Chiếu 5 Folien Thuyết Trình B1/B2)
- Thanh điều hướng 5 bước tương ứng với cấu trúc thuyết trình chuẩn:
  - *Folie 1:* Giới thiệu chủ đề & Cấu trúc bài nói (Thema & Struktur).
  - *Folie 2:* Trải nghiệm cá nhân (Persönliche Erfahrung).
  - *Folie 3:* Tình hình tại quê hương (Situation im Heimatland).
  - *Folie 4:* Ưu & nhược điểm (Vor- und Nachteile).
  - *Folie 5:* Kết luận & Cảm ơn (Abschluss & Dank).
- Nút chuyển đổi: "Ẩn bài mẫu để tự luyện tập" (giúp người học nhìn slide trống để tự nói theo dàn ý).

### 2. `SpeakingDialogViewer.tsx` (Hội Thoại Phân Vai A/B Cho Teil 1)
- Hiển thị kịch bản thảo luận theo dạng bong bóng chat 2 bên: Nhân vật A bên trái, Nhân vật B bên phải.
- Mỗi lượt thoại đi kèm nhãn chức năng giao tiếp (Ví dụ: `[ĐỀ XUẤT]`, `[ĐỒNG Ý]`, `[TỪ CHỐI & ĐƯA RA GIẢI PHÁP THAY THẾ]`).
- Tích hợp nút phát audio cho từng câu riêng lẻ để luyện kỹ thuật Shadowing.

### 3. `SpeakingPracticeWorkspace.tsx` (Phòng Tự Luyện Nói Độc Lập)
- **Đồng hồ đếm ngược đa chế độ (Preparation & Speaking Timer):**
  - Chế độ chuẩn bị: Đếm ngược 10 hoặc 15 phút.
  - Chế độ trình bày: Đếm ngược 3 đến 5 phút (kèm âm báo nhẹ khi hết giờ).
- Khung ghi chú nháp Spickzettel: Cho phép ghi dàn ý nhanh, tự động lưu vào `localStorage` của trình duyệt.
- Checklist tự đánh giá phát âm, độ lưu loát và từ nối Redemittel.

---

## IV. BẢO MẬT & HỢP ĐỒNG DỮ LIỆU (DATA CONTRACTS INTEGRATION)

1. **Tuân thủ cơ chế Server-side Grading:**
   - Dữ liệu câu hỏi nạp vào giao diện thi thử chỉ nhận định dạng `PublicQuestionSchema` (tuyệt đối không chứa trường `correctOption` hay `trapExplanationVi` từ câu 3 trở đi).
   - Đáp án đúng và giải thích chi tiết chỉ được mở khóa khi máy chủ trả về kết quả chấm điểm hợp lệ.
2. **Hỗ trợ cờ nhận diện Đơn vị Khảo thí (`providerFormat`):**
   - Đề ÖSD: Sử dụng thuật ngữ *Richtig/Falsch*, hiển thị cấu trúc bài thi ÖSD và tiêu chí chấm điểm ÖSD.
   - Đề Goethe: Sử dụng thuật ngữ tương ứng, tự động căn chỉnh tỷ lệ thời gian và bố cục từng Teil.

---

## V. CHECKLIST KIỂM THỬ & NGHIỆM THU (VERIFICATION)

- [ ] Toàn bộ mã nguồn chạy qua `pnpm --filter @shd/web build` và `pnpm --filter @shd/contracts test` đạt 100% không lỗi typecheck.
- [ ] Phòng thi hiển thị mượt mà cả 4 loại thẻ câu hỏi (`BinaryChoiceCard`, `MatchingCard`, `MultipleChoiceCard`, `FillInBlankCard`) trên cả Desktop và Mobile.
- [ ] Phân hệ Luyện viết tự động đếm từ chính xác, dải phím ký tự Đức hoạt động bình thường.
- [ ] Phân hệ Luyện nói chuyển mượt mà giữa 5 Folien thuyết trình và chat phân vai A/B.
- [ ] Chụp ảnh kiểm thử giao diện bằng Playwright lưu tại `screenshots/desktop/` để nghiệm thu trực quan.