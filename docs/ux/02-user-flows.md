# Sơ Đồ Luồng Người Dùng & Các Nhánh Lỗi (User Flows & Error Paths)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Đơn vị phát triển:** SHD Education (Hệ sinh thái SHD Corp)  
> **Tài liệu:** UX Architecture - Core Flows & Edge Case State Machines

---

## 1. Luồng A: Khách ẩn danh làm bài → Nộp bài → Xem kết quả → Lead Gate → Thành công

Luồng chính yếu (Happy Path) dẫn dắt khách vãng lai trải nghiệm thi thử và chuyển đổi thành Lead tiềm năng thông qua điểm chặn giá trị.

```mermaid
flowchart TD
    Start(["Khách truy cập Catalog"]) --> SelectExam["Xem chi tiết đề thi & bấm 'Làm bài ngay'"]
    SelectExam --> InitSession["Khởi tạo anonymous_session_id & tải đề thi"]
    InitSession --> ExamRoom["Màn hình Phòng thi (Split-screen Đọc / Nghe)"]
    
    subgraph ExamProgress ["Quá trình làm bài"]
        ExamRoom --> DoQuestions["Làm bài: Đọc văn bản / Nghe audio & chọn đáp án"]
        DoQuestions --> AutoSave["Hệ thống tự động lưu nháp mỗi câu hoặc định kỳ 15s"]
        AutoSave --> ClickSubmit["Người học bấm nút 'Nộp bài'"]
    end

    ClickSubmit --> ConfirmModal{"Hộp thoại xác nhận: Còn câu chưa làm không?"}
    ConfirmModal -- "Còn câu chưa làm" --> ShowWarning["Cảnh báo số câu chưa chọn & hỏi xác nhận nộp"]
    ShowWarning -- "Xác nhận nộp" --> ForceSubmit["Gửi bài về Server chấm điểm"]
    ConfirmModal -- "Đã làm hết" --> ForceSubmit

    ForceSubmit --> ResultPage["Màn hình Kết quả bài thi"]
    
    subgraph ResultView ["Xem kết quả & Điểm chạm Lead Gate"]
        ResultPage --> ViewScores["Xem Điểm tổng & Điểm theo kỹ năng (Miễn phí)"]
        ViewScores --> ViewFreeExplanations["Xem Lời giải chi tiết Câu 1 & Câu 2 (Miễn phí)"]
        ViewFreeExplanations --> ReachGate{"Hành động tiếp theo của người học?"}
        
        ReachGate -- "Bấm xem Câu 3+" --> TriggerGate1["Kích hoạt Lead Gate: Mở khóa giải thích"]
        ReachGate -- "Bấm 'Lưu lịch sử bài thi'" --> TriggerGate2["Kích hoạt Lead Gate: Lưu tiến trình"]
        ReachGate -- "Bấm 'Đăng ký Test 1-1'" --> TriggerGate3["Kích hoạt Lead Gate: Nhận tư vấn chuyên sâu"]
    end

    TriggerGate1 --> OpenModal["Mở Modal Lead Gate (Bước 1: Điền thông tin)"]
    TriggerGate2 --> OpenModal
    TriggerGate3 --> OpenModal

    subgraph LeadCapture ["Xử lý Lead & Xác thực"]
        OpenModal --> FillForm["Nhập: Họ tên, SĐT/Zalo, Email, Mục tiêu, Thời gian dự kiến thi"]
        FillForm --> CheckConsents{"Kiểm tra 3 ô Checkbox đồng ý"}
        CheckConsents -- "Chưa tích ô Bắt buộc" --> DisableBtn["Nút 'Nhận mã OTP' bị khóa (kèm nhắc nhở)"]
        CheckConsents -- "Đã tích ô Bắt buộc" --> RequestOTP["Gửi mã OTP 6 số qua Zalo ZNS / SMS"]
        RequestOTP --> EnterOTP["Bước 2: Nhập mã OTP (Đếm ngược 60s)"]
        EnterOTP --> ValidateOTP{"Server kiểm tra mã OTP"}
        ValidateOTP -- "Hợp lệ" --> SuccessState["Bước 3: Trạng thái Thành công"]
    end

    SuccessState --> UnlockedResult["Mở khóa toàn bộ lời giải chi tiết từ Câu 3+"]
    SuccessState --> ScheduleCall["Kích hoạt hàng đợi tư vấn viên SHD liên hệ"]
    UnlockedResult --> End(["Hoàn thành chuyển đổi"])
```

---

## 2. Luồng B: Người học quay lại và Tiếp tục phiên làm bài (Returning Learner)

Xử lý trường hợp người học đang làm bài dở dang thì đóng trình duyệt hoặc quay lại sau một khoảng thời gian.

```mermaid
flowchart TD
    ReturnUser(["Người học quay lại tuhoctiengduc"]) --> CheckStorage{"Kiểm tra localStorage & Cookie"}
    
    CheckStorage -- "Không có phiên dở dang" --> ShowCatalogDefault["Hiển thị Danh mục đề thi bình thường"]
    
    CheckStorage -- "Tìm thấy active_exam_session" --> VerifyServer{"Gửi heartbeat kiểm tra với Server"}
    
    VerifyServer -- "Server: Phiên đã hết giờ thi" --> ExpiredSession["Cập nhật trạng thái: Đã hết giờ"]
    ExpiredSession --> DirectToResult["Tự động chuyển đến Trang Kết quả để xem điểm"]
    
    VerifyServer -- "Server: Phiên vẫn còn hiệu lực" --> PromptResume["Hiển thị Banner: 'Bạn có bài thi đang làm dở'"]
    PromptResume --> UserChoice{"Người học lựa chọn?"}
    
    UserChoice -- "Hủy bài thi cũ" --> ClearSession["Xóa cache phiên cũ & đưa về Danh mục"]
    UserChoice -- "Tiếp tục làm bài" --> LoadExamRoom["Mở lại Phòng thi"]
    
    LoadExamRoom --> RestoreData["Phục hồi danh sách đáp án đã chọn & số lượt nghe"]
    RestoreData --> SyncTimer["Đồng bộ lại đồng hồ đếm ngược theo thời gian thực Server"]
    SyncTimer --> ContinueExam["Tiếp tục làm bài từ vị trí đang dừng"]
```

---

## 3. Luồng C: Nhánh Người dùng Dưới 18 tuổi & Xác nhận từ Phụ huynh (Parental Branch)

Tuân thủ nghiêm ngặt Nghị định 13/2023/NĐ-CP về xử lý dữ liệu trẻ em và bảo vệ quyền lợi người học vị thành niên.

```mermaid
flowchart TD
    LeadStep1(["Người học ở Bước 1 Lead Gate"]) --> SelectAge["Chọn đối tượng: 'Học sinh (< 18 tuổi)'"]
    SelectAge --> ExpandParentFields["Form tự động mở rộng trường Phụ huynh"]
    
    subgraph ParentInputSection ["Thu thập thông tin Phụ huynh"]
        ExpandParentFields --> InputParentPhone["Bắt buộc nhập: Số Zalo của Cha/Mẹ/Người giám hộ"]
        InputParentPhone --> ShowLegalNotice["Hiển thị thông báo pháp lý: 'Theo quy định, SHD sẽ gửi thông tin kết quả thi tới Phụ huynh để xác nhận trước khi tư vấn'"]
    end

    ShowLegalNotice --> StudentCheckConsents["Học sinh tích chọn ô Đồng ý Bắt buộc"]
    StudentCheckConsents --> SendStudentOTP["Hệ thống gửi OTP đến SĐT của Học sinh"]
    SendStudentOTP --> StudentVerifyOTP["Học sinh xác thực OTP thành công"]
    
    StudentVerifyOTP --> ImmediateUnlock["Học sinh được Mở khóa giải thích bài thi ngay lập tức"]
    
    subgraph ParentConfirmationFlow ["Quy trình xác nhận phía Phụ huynh"]
        StudentVerifyOTP --> TriggerZNS["Server tự động gửi tin nhắn Zalo ZNS tới Phụ huynh"]
        TriggerZNS --> ParentReceive["Phụ huynh nhận ZNS: 'Con bạn vừa thi thử tiếng Đức... Bấm để xem kết quả'"]
        ParentReceive --> ParentClickLink["Phụ huynh nhấp link xác nhận an toàn"]
        ParentClickLink --> ParentLandingPage["Trang xem nhanh kết quả thi của con"]
        ParentLandingPage --> ParentConsentChoice{"Phụ huynh bấm đồng ý tư vấn?"}
        
        ParentConsentChoice -- "Đồng ý tư vấn" --> MarkParentApproved["CRM cập nhật Lead: 'Đã có xác nhận Phụ huynh'"]
        MarkParentApproved --> TelesaleCall["Tư vấn viên SHD gọi điện trao đổi trực tiếp với Phụ huynh"]
        
        ParentConsentChoice -- "Từ chối / Bỏ qua" --> MarkNoContact["CRM ghi nhận: 'Không liên hệ tiếp thị'"]
        MarkNoContact --> CloseLead["Không làm phiền, chỉ lưu kết quả của học sinh"]
    end
```

---

## 4. Luồng D: Các nhánh lỗi và Ngoại lệ (Edge Cases & Error Paths)

### D1. Hết giờ làm bài (Server-Authoritative Timeout)
```mermaid
flowchart TD
    TimerTick["Đồng hồ đếm ngược server_time_remaining = 0"] --> LockUI["Giao diện lập tức khóa toàn bộ ô chọn đáp án"]
    LockUI --> ShowTimeoutModal["Hiện hộp thoại thông báo: 'Đã hết thời gian làm bài!'"]
    ShowTimeoutModal --> AutoPayloadPack["Hệ thống tự động đóng gói toàn bộ câu đã làm"]
    AutoPayloadPack --> SendToServer["Gửi bài về Server (Force Submit)"]
    SendToServer --> NavResult["Tự động chuyển hướng sang Trang Kết quả"]
```

### D2. Mất kết nối mạng & Khôi phục (Offline & Recovery)
```mermaid
flowchart TD
    OnlineState["Đang làm bài bình thường (Trạng thái Online)"] --> NetLoss["Sự kiện 'offline' kích hoạt (Mất mạng / Sóng yếu)"]
    NetLoss --> UpdateStatusUI["Đổi chỉ báo trạng thái: Icon Vàng 'Mất kết nối - Đang lưu ngoại tuyến'"]
    UpdateStatusUI --> FallbackStorage["Lưu tạm từng thao tác chọn đáp án vào IndexedDB / localStorage"]
    FallbackStorage --> NetBack["Sự kiện 'online' kích hoạt trở lại"]
    NetBack --> FlushQueue["Gửi gói dữ liệu lưu ngoại tuyến đồng bộ với Server"]
    FlushQueue --> SyncSuccess{"Server phản hồi 200 OK?"}
    SyncSuccess -- "Thành công" --> GreenStatus["Đổi chỉ báo: Icon Xanh 'Đã tự động lưu'"]
    SyncSuccess -- "Thất bại / Server bận" --> RetryQueue["Tự động thử lại sau 5 giây (Exponential Backoff)"]
```

### D3. Lỗi trình phát âm thanh (Audio Hören Error)
```mermaid
flowchart TD
    ClickPlay["Người học bấm Phát âm thanh bài Nghe"] --> AudioLoading["Trạng thái: Đang tải dữ liệu (Loading Spinner)"]
    AudioLoading --> AudioEvent{"Trình duyệt tải file âm thanh"}
    AudioEvent -- "Tải thành công" --> PlayingState["Trạng thái: Đang phát (Playing) & Đếm lượt: Lượt 1/2"]
    AudioEvent -- "Lỗi mạng / 404 / Media Decode Error" --> ErrorState["Trạng thái: Lỗi âm thanh"]
    
    ErrorState --> CheckCount["KHÔNG trừ lượt nghe của người học"]
    CheckCount --> ShowRetryBtn["Hiển thị nút 'Thử lại tải âm thanh' & Hướng dẫn kiểm tra loa/mạng"]
    ShowRetryBtn --> ClickRetry["Người học bấm Thử lại"]
    ClickRetry --> AudioLoading
```

### D4. Nhập sai hoặc Hết hạn mã OTP
```mermaid
flowchart TD
    EnterCode["Người dùng nhập mã OTP 6 số"] --> CheckLength{"Đủ 6 chữ số?"}
    CheckLength -- "Chưa đủ" --> WaitInput["Đợi nhập đủ 6 số"]
    CheckLength -- "Đã đủ" --> VerifyAPI["Gửi API xác thực OTP"]
    
    VerifyAPI --> APIResult{"Kết quả trả về"}
    APIResult -- "Thành công" --> StepSuccess["Chuyển sang Bước Thành công"]
    
    APIResult -- "Mã sai" --> IncrAttempt["Tăng biến đếm lần sai (attempts++)"]
    IncrAttempt --> CheckMaxAttempts{"Số lần sai < 3?"}
    CheckMaxAttempts -- "Còn lượt thử" --> ShowInlineErr["Báo lỗi đỏ: 'Mã xác thực không đúng. Còn lại X lần'"]
    CheckMaxAttempts -- "Đã sai quá 3 lần" --> LockOTPSlot["Khóa nhập 15 phút để chống brute-force"]
    
    APIResult -- "Mã hết hạn (> 60s)" --> ExpiredMsg["Báo lỗi: 'Mã đã hết hạn, vui lòng bấm Gửi lại'"]
    ExpiredMsg --> EnableResend["Nút 'Gửi lại mã OTP' sáng lên (Hỗ trợ fallback sang SMS)"]
```

### D5. Xử lý từ chối các điều khoản đồng ý (Consent Refusal)
```mermaid
flowchart TD
    ReviewConsents["Người dùng xem 3 ô Checkbox đồng ý"] --> AnalyzeState{"Tình trạng tích chọn của người dùng"}
    
    AnalyzeState -- "Không tích ô [1] Bắt buộc" --> BlockSubmit["Nút 'Nhận kết quả' bị vô hiệu hóa"]
    BlockSubmit --> ShowExplanation["Tooltip giải thích: 'SHD cần sự đồng ý của bạn để xử lý dữ liệu chấm điểm'"]
    
    AnalyzeState -- "Tích [1] Bắt buộc, KHÔNG tích [2] Tư vấn khóa học" --> AllowUnlockScore["Hệ thống VẪN CHO MỞ KHÓA KẾT QUẢ ĐẦY ĐỦ"]
    AllowUnlockScore --> TagLeadNoCall["Ghi nhãn Lead trong CRM: marketing_consent = FALSE"]
    TagLeadNoCall --> BlockTelesale["Chặn quyền xuất số điện thoại cho đội Telesale gọi điện"]
    
    AnalyzeState -- "Tích [1] Bắt buộc, Tích [2] Tư vấn, KHÔNG tích [3] Du học/18b" --> PartialConsent["Chỉ phân phối Lead cho phòng Đào tạo tiếng Đức SHD Education"]
    PartialConsent --> Block18bSharing["Không chia sẻ dữ liệu cho SHD Career / SHD International"]
```

