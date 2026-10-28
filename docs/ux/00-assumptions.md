# Bảng Giả Định & Câu Hỏi Mở (Assumptions & Open Questions)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Đơn vị phát triển:** SHD Education (Hệ sinh thái SHD Corp)  
> **Tài liệu:** UX Architecture & Product Design Foundation  
> **Nguyên tắc:** Khi thiếu thông tin chi tiết từ phía các bên liên quan, toàn bộ quyết định thiết kế giai đoạn 1 được xây dựng dựa trên các giả định dưới đây.

---

## 1. Phân loại theo mức độ ảnh hưởng

### A. Mức độ ảnh hưởng CAO (High Impact)
*Ảnh hưởng trực tiếp đến tỷ lệ chuyển đổi Lead, tuân thủ pháp lý và kiến trúc kỹ thuật cốt lõi.*

| Mã | Hạng mục | Giả định thiết kế (Design Assumptions) | Câu hỏi mở & Quyết định cần chốt (Open Questions) | Rủi ro nếu giả định sai |
| :--- | :--- | :--- | :--- | :--- |
| **A-01** | **Xác thực OTP & Kênh gửi** | Sử dụng Zalo ZNS (Zalo Notification Service) làm kênh ưu tiên số 1 vì chi phí rẻ hơn SMS và người dùng học tiếng Đức tại VN đều dùng Zalo. SMS Brandname đóng vai trò kênh dự phòng (fallback) khi gửi ZNS thất bại sau 30 giây. | SHD đã có tài khoản Zalo OA doanh nghiệp đã xác thực và đăng ký template ZNS cho `tuhoctiengduc` chưa? Hạn mức chi phí cho OTP mỗi tháng là bao nhiêu? | Tỷ lệ chuyển đổi rớt mạnh nếu OTP không tới được điện thoại người dùng hoặc phát sinh chi phí SMS quá lớn. |
| **A-02** | **Pháp lý người dùng vị thành niên (<18 tuổi)** | Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, xử lý dữ liệu trẻ em cần có sự đồng ý của cha mẹ/người giám hộ. Thiết kế giả định: Khi người học chọn đối tượng "Học sinh (<18 tuổi)", hệ thống bắt buộc nhập SĐT Zalo của Cha/Mẹ, gửi ZNS xác nhận đến phụ huynh trước khi telesale được phép gọi điện. | Quy trình telesale của SHD có chấp nhận độ trễ (delay) chờ phụ huynh xác nhận qua Zalo không, hay telesale sẽ chủ động gọi điện trực tiếp cho phụ huynh để xin phép bằng lời nói? | Vi phạm Nghị định 13 nếu gọi điện/tiếp thị trực tiếp tới học sinh chưa đủ 18 tuổi mà chưa có xác nhận từ phụ huynh. |
| **A-03** | **Điểm chặn Lead Gate (2 câu đầu mở)** | Khách làm bài xong được xem ngay Điểm tổng (Overall Score) và Điểm kỹ năng (Lesen/Hören). Lời giải chi tiết của Câu 1 & Câu 2 mở công khai để chứng minh chất lượng sư phạm; từ Câu 3 trở đi khóa sau Lead Gate (yêu cầu điền thông tin + OTP). | Tỷ lệ 2 câu mở có đủ tạo "aha-moment" không? Có nên cho phép người dùng xem thêm 1 câu nếu chia sẻ mạng xã hội, hay giữ cố định 2 câu? | Nếu giá trị của 2 câu đầu quá ít, người dùng rời bỏ (bounce) thay vì để lại số điện thoại. |
| **A-04** | **Đồng hồ server & tính toàn vẹn bài thi** | Client chỉ nhận `time_remaining_seconds` từ server khi bắt đầu và đồng bộ heartbeat định kỳ mỗi 30s. Khi đồng hồ về 0, giao diện tự động khóa và gửi payload bài làm về server (Force Submit). Người dùng không thể can thiệp bằng cách chỉnh giờ thiết bị. | Đề thi trên nền tảng là đề luyện tập tự do (có cho tạm dừng không) hay mô phỏng thi thật nghiêm ngặt (không cho tạm dừng)? | Người học cảm thấy áp lực nếu đề tự học hàng ngày lại áp đặt đếm ngược quá cứng nhắc. |

---

### B. Mức độ ảnh hưởng TRUNG BÌNH (Medium Impact)
*Ảnh hưởng đến trải nghiệm người dùng trên thiết bị di động và luồng tương tác.*

| Mã | Hạng mục | Giả định thiết kế (Design Assumptions) | Câu hỏi mở & Quyết định cần chốt (Open Questions) | Rủi ro nếu giả định sai |
| :--- | :--- | :--- | :--- | :--- |
| **B-01** | **Giới hạn lượt nghe Hören** | Mỗi bài nghe cho phép nghe tối đa 2 lần (chuẩn theo format thi Goethe/TELC B1). Trình phát không hỗ trợ thanh tua nhanh/chậm tự do trong lần nghe đầu để phản ánh thực tế phòng thi. Có thanh đếm: "Lượt nghe: 1/2". | SHD có muốn cung cấp chế độ "Luyện nghe xả láng" (Practice Mode - không giới hạn) bên cạnh chế độ "Thi thử" (Exam Mode) không? | Người mới bắt đầu học (A1-A2) cảm thấy quá khó và nản lòng nếu bị khóa lượt nghe nghiêm ngặt. |
| **B-02** | **Cơ chế lưu tạm khi rớt mạng** | Hệ thống lưu trạng thái chọn đáp án vào `localStorage` hoặc `IndexedDB` ngay khi người dùng chọn. Khi mất mạng, hiện cảnh báo vàng *"Mất kết nối - Đang lưu ngoại tuyến"*, cho phép làm bài tiếp và tự đồng bộ khi có mạng trở lại. | Nếu người học đóng tab hoặc tắt trình duyệt khi đang offline rồi mở lại trên thiết bị khác, server chỉ khôi phục được tới lần đồng bộ cuối cùng. SHD có chấp nhận điều này không? | Người dùng phản ánh mất bài thi nếu đổi máy giữa chừng khi mạng chập chờn. |
| **B-03** | **Tách bạch 3 điều khoản đồng ý (Consents)** | 3 checkbox tách rời và KHÔNG tích sẵn: (1) Bắt buộc: chấm điểm & lưu lịch sử; (2) Tùy chọn: tư vấn khóa học tiếng Đức SHD; (3) Tùy chọn: chia sẻ đối tác SHD Academy/Career/International để tư vấn du học nghề / visa 18b. | Nếu người dùng chỉ tích ô (1) mà không tích ô (2) và (3), đội ngũ tư vấn tuyển sinh có được phép liên hệ không? (Về luật là KHÔNG). | Tỷ lệ lead đủ điều kiện liên hệ (marketable leads) có thể thấp hơn kỳ vọng ban đầu nếu người dùng bỏ qua checkbox tùy chọn. |
| **B-04** | **Trải nghiệm Mobile-first cho phòng thi** | Màn hình 375px không đủ không gian chia đôi 2 cột. Giả định chuyển sang dạng 2 tab: Tab 1 `[Nội dung Đọc/Nghe]` và Tab 2 `[Phiếu trả lời]`, kèm thanh nổi bên dưới chuyển đổi nhanh và drawer danh sách câu hỏi 1–30. | Người dùng mobile có thấy phiền khi phải bấm qua lại giữa bài đọc và câu hỏi không? Có cần tính năng split-view dọc (nửa trên bài đọc, nửa dưới câu hỏi) trên mobile không? | Cuộn quá nhiều trên màn hình nhỏ gây mỏi mắt và khó đối chiếu thông tin câu hỏi. |

---

### C. Mức độ ảnh hưởng THẤP (Low Impact)
*Ảnh hưởng đến vi tương tác và tiện ích phụ trợ.*

| Mã | Hạng mục | Giả định thiết kế (Design Assumptions) | Câu hỏi mở & Quyết định cần chốt (Open Questions) | Ghi chú kỹ thuật |
| :--- | :--- | :--- | :--- | :--- |
| **C-01** | **Bộ ký tự tiếng Đức** | Đề thi tiếng Đức có các ký tự đặc biệt (ä, ö, ü, ß). Đa số bàn phím điện thoại tiếng Việt cần gõ Telex hoặc đè phím. Các bài thi trắc nghiệm (Multiple Choice / True-False) không yêu cầu gõ phím nên không cần bàn phím ảo riêng. | Về sau có bài thi Viết (Schreiben) hoặc điền từ vào chỗ trống không? | Nếu có điền từ, cần bổ sung cụm nút bấm nhanh cho 4 ký tự `ä, ö, ü, ß` ngay trên thanh công cụ. |
| **C-02** | **Thời hạn hiệu lực của OTP** | Mã OTP gồm 6 chữ số, có hiệu lực trong vòng 60 giây. Cho phép bấm "Gửi lại mã" sau 60 giây, tối đa 3 lần/ngày/số điện thoại để chống spam SMS. | Có cần chặn các đầu số rác hoặc yêu cầu reCAPTCHA v3 trước khi gửi OTP không? | Cần thiết lập rate limit tại API Gateway. |
| **C-03** | **Quản lý phiên làm bài của Khách ẩn danh** | Khi khách vãng lai chưa điền form, phiên làm bài gắn với một mã `anonymous_session_id` lưu trong cookie/localStorage thời hạn 7 ngày. Sau khi điền form Lead Gate, toàn bộ lịch sử gắn kết vào SĐT/Email. | Nếu khách xóa cookie trình duyệt trước khi mở Lead Gate, kết quả có cần khôi phục được qua link tra cứu không? | Chấp nhận rủi ro người dùng mất kết quả nếu chủ động xóa lịch sử duyệt web khi chưa đăng ký. |

---

## 2. Danh sách câu hỏi mở cần SHD Education phê duyệt chính thức

1. **Về quy chế liên hệ người dưới 18 tuổi:** Đội ngũ tư vấn của SHD sẽ gửi thông điệp tự động mời phụ huynh tham gia nhóm Zalo hay gọi điện trực tiếp phụ huynh sau khi phụ huynh bấm nút đồng ý trên Zalo?
2. **Về việc xử lý Lead không đồng ý tiếp thị:** Với những người học hoàn thành bài thi nhưng không tích ô "Đồng ý nhận tư vấn khóa học", SHD có chính sách nuôi dưỡng (nurture) tự động chỉ qua Email bản tin hay hoàn toàn không liên hệ?
3. **Về kho đề thi:** Tỷ lệ đề thi TELC vs Goethe vs Đề tổng hợp trên hệ thống dự kiến như thế nào để tối ưu bộ lọc ban đầu?
4. **Về quà tặng kích hoạt Lead:** Ebook tải về và suất Test đầu vào 1-1 miễn phí có sẵn tài liệu/lịch hẹn ngay khi người dùng hoàn thành OTP không?
