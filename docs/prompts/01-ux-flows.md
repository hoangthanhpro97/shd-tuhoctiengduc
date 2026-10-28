VAI TRÒ VÀ CÁCH LÀM VIỆC
Bạn là Product Designer kiêm Front-end Engineer cấp cao. Hãy lập kế hoạch trước, sau đó thực hiện từng bước nhỏ. KHÔNG hỏi lại tôi giữa chừng: khi thiếu thông tin, hãy nêu giả định và ghi vào docs/ux/00-assumptions.md. Mọi tài liệu viết bằng tiếng Việt, tên file bằng tiếng Anh.

BỐI CẢNH DỰ ÁN
SHD Education (Việt Nam, đào tạo tiếng Đức, thuộc hệ sinh thái SHD Corp) xây nền tảng tuhoctiengduc.shdeducation.vn: kho đề thi thử và công cụ tự học tiếng Đức MIỄN PHÍ. Mục tiêu kinh doanh: biến người học tiếng Đức thành lead cho các khóa học trả phí (A1–C1, học online, giáo viên bản xứ, giao tiếp), về sau mới giới thiệu chương trình du học nghề/18b. Người dùng: học sinh, sinh viên, người đi làm dưới 35 tuổi, phụ huynh của học sinh. Phần lớn truy cập bằng điện thoại, nên thiết kế mobile-first. Giao diện tiếng Việt, nội dung đề bằng tiếng Đức.
Tham khảo phong cách: trang danh mục dạng lưới thẻ như DOL Tự Học. Nếu có ảnh đính kèm, chỉ lấy ý tưởng bố cục, tuyệt đối không sao chép hình ảnh, thương hiệu, văn bản.

PHẠM VI CỦA LẦN NÀY (CHỈ BƯỚC 1)
Luồng người dùng và wireframe thô cho các màn "ra tiền", theo thứ tự ưu tiên:
1. Phòng thi chia đôi màn hình (Đọc/Lesen và Nghe/Hören), có bản mobile và desktop.
2. Trang kết quả + điểm chặn lead (lead gate) + biểu mẫu đồng ý, gồm nhánh người dùng chưa đủ 18 tuổi.
3. Trang danh mục đề thi (lọc theo kỳ thi TELC/Goethe, trình độ, kỹ năng).
Nếu còn thời gian, phác thêm: trang chủ, khối đăng ký test đầu vào 1-1, danh sách lead của admin (chỉ danh sách).
NGOÀI PHẠM VI: backend, cơ sở dữ liệu, đăng nhập thật, giao diện hoàn thiện, cài framework hay thư viện, hình ảnh thật, nội dung đề thật.

QUY TẮC NGHIỆP VỤ PHẢI THỂ HIỆN
- Câu hỏi và lựa chọn hiển thị bình thường, nhưng đáp án đúng KHÔNG BAO GIỜ hiện trước khi nộp bài.
- Sau khi nộp: điểm tổng và điểm theo kỹ năng xem miễn phí. Giải thích chi tiết: Câu 1 và Câu 2 của mỗi đề công khai; từ Câu 3 trở đi bị khóa sau lead gate.
- Đồng hồ đếm ngược do server quyết định; giao diện chỉ hiển thị, hết giờ tự nộp bài. Có chỉ báo tự lưu và luồng khôi phục khi mất kết nối.
- Phần Nghe: trình phát không có nút tải xuống; có đủ trạng thái đang tải, đang phát, đã hết, lỗi/thử lại; số lần nghe cấu hình được theo từng đề; thiết kế cho mạng yếu.
- Lead gate có 3 điểm kích hoạt: (a) mở khóa giải thích từ Câu 3, (b) lưu tiến trình và thống kê lỗi sai, (c) tải ebook hoặc đăng ký test đầu vào 1-1 miễn phí.
- Trường cần thu: họ tên; SĐT/Zalo (xác thực OTP); email; mục tiêu học (thi chứng chỉ / đi làm hoặc định cư / du học nghề / giao tiếp, du lịch / học cho con em); thời gian dự kiến thi (trong 1 tháng / 1–3 tháng / 3–6 tháng / chưa rõ); độ tuổi hoặc đối tượng.
- Đồng ý tách riêng, KHÔNG tích sẵn: (1) bắt buộc: xử lý dữ liệu để chấm điểm và lưu lịch sử học; (2) tùy chọn: được liên hệ tư vấn khóa học; (3) tùy chọn: chia sẻ cho SHD Academy / Career / International để tư vấn du học nghề, 18b. Kèm liên kết chính sách bảo mật. Mọi câu chữ pháp lý ghi rõ nhãn [PLACEHOLDER – chờ pháp chế duyệt].
- Nếu người dùng dưới 18 tuổi: hỏi số Zalo của cha/mẹ và có bước phụ huynh xác nhận trước khi liên hệ tư vấn.
- Trên trang kết quả có lời kêu gọi chính: "Đăng ký test đầu vào 1-1 miễn phí".

SẢN PHẨM CẦN TẠO (đúng đường dẫn)
- docs/ux/00-assumptions.md: các giả định và câu hỏi mở, xếp theo mức ảnh hưởng.
- docs/ux/01-personas-and-jobs.md: 3 persona ngắn (học sinh/sinh viên, người đi làm, phụ huynh) và việc họ cần hoàn thành.
- docs/ux/02-user-flows.md: sơ đồ Mermaid cho (A) khách ẩn danh làm bài → nộp → kết quả → lead gate → thành công; (B) người học quay lại và tiếp tục phiên; (C) nhánh dưới 18 tuổi/phụ huynh; (D) các đường lỗi: hết giờ, mất mạng, lỗi audio, OTP sai/hết hạn, từ chối đồng ý.
- docs/ux/03-screen-inventory.md: bảng gồm màn hình, mục đích, hành động chính, dữ liệu cần hiển thị, các trạng thái (rỗng/đang tải/lỗi), và tên sự kiện phân tích cần ghi nhận.
- wireframes/index.html: trang liên kết tới các wireframe.
- wireframes/exam-room.html: có nút chuyển giữa trạng thái Đọc và Nghe, bảng chọn câu 1–30, đồng hồ, chỉ báo tự lưu, hộp xác nhận nộp bài.
- wireframes/result-and-gate.html: tổng quan điểm, điểm theo kỹ năng, phần giải thích bị khóa, cửa sổ lead gate (bước điền thông tin, bước OTP, nhánh phụ huynh, trạng thái thành công).
- wireframes/catalog.html: lưới thẻ đề thi kèm bộ lọc.
- docs/ux/05-self-review.md: tự kiểm tra từng tiêu chí bên dưới, ghi đạt/chưa đạt và các khoảng trống còn lại.

YÊU CẦU KỸ THUẬT CHO WIREFRAME
Mỗi file là HTML + CSS thuần, mở bằng cách nhấp đúp là chạy, không công cụ build, không thư viện, không CDN, không gọi mạng. Tông xám đơn sắc, font hệ thống, hộp và nhãn mô tả. Responsive: xem tốt ở 375px và 1280px, không cuộn ngang. Vùng chạm tối thiểu 44px, độ tương phản đủ, điều hướng được bằng bàn phím, có chú thích trạng thái. Nội dung mẫu chỉ dùng chữ giả như "Beispielfrage 1", "Beispieltext"; KHÔNG chép đề thi thật của Goethe/telc/ÖSD hay giáo trình; KHÔNG dùng logo của tổ chức khảo thí; KHÔNG dùng dữ liệu cá nhân thật.

TIÊU CHÍ HOÀN THÀNH
1. Luồng có đủ đường chính và đường lỗi nêu trên.
2. Không wireframe nào hiện đáp án đúng trước khi nộp bài.
3. Các ô đồng ý đều chưa tích sẵn và tách riêng.
4. Có nhánh dưới 18 tuổi.
5. Mọi wireframe chạy offline và đúng ở 375px và 1280px.
6. Mỗi màn hình có danh sách sự kiện phân tích.
7. docs/ux/05-self-review.md đã điền trung thực.

CÁCH LÀM
Git: nếu chưa là repo thì git init; commit sau mỗi sản phẩm hoàn thành với thông điệp ngắn rõ ràng; không commit bí mật. Không cài gói, không chạy lệnh phá hủy. Khi xong, trả lời tối đa 10 dòng: danh sách file đã tạo, các giả định cần tôi quyết, và những điểm bạn chưa chắc.