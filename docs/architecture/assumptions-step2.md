# Giả Định Kiến Trúc Bước 2: Hợp Đồng Dữ Liệu & Schema (Assumptions Step 2)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Tài liệu nguồn:** `docs/prompts/02-step2-data-contracts-and-schema-prompts.md`  
> **Cập nhật:** Lệnh 2.1 - Nền Monorepo (Kiểm chứng thực tế ngày 29/10/2026)

---

## 1. Giả Định Về Môi Trường & Hạ Tầng

| Mã | Giả định | Lý do / Tác động | Trạng thái |
| :---: | :--- | :--- | :---: |
| **ENV-01** | **Docker Desktop & Engine trên Windows 11** | Đã cài đặt Docker Desktop v29.9.2 (Compose v5.6.1) tại `AppData\Local\Programs\DockerDesktop\resources\bin`. **Hiện trạng:** Docker daemon chưa thể kết nối do WSL 2 báo lỗi ảo hóa phần cứng chưa bật trong BIOS (`WSL 2 is unable to start since virtualisation is not enabled on this machine`). Cần kích hoạt Intel VT-x/AMD-V trong BIOS để daemon chạy. | **[ĐÃ CÀI ĐẶT - CHỜ BẬT VIRTUALIZATION]** |
| **ENV-02** | **Quản lý Package qua Corepack** | Dự án ghim `pnpm@9.15.4` thông qua trường `packageManager` trong `package.json` và Corepack v0.36.0 đi kèm Node v24.22.1. | **[ĐÃ XÁC LẬP]** |
| **ENV-03** | **Chuẩn xuống dòng LF bắt buộc** | Mọi tệp script `.sh` và `.sql` chạy trong container Linux phải giữ chuẩn kết thúc dòng LF (ngăn lỗi `\r: command not found`). Được bảo đảm bởi `.gitattributes` và `.editorconfig`. | **[ĐÃ KHÓA CỨNG - KIỂM CHỨNG 100% LF]** |
| **ENV-04** | **Chặn Lifecycle Scripts (ignore-scripts)** | Giữ phiên bản `pnpm@9.15.4` LTS ổn định cao, bổ sung cấu hình `ignore-scripts=true` trong `.npmrc` để chặn tự động chạy mã lệnh của các gói phụ thuộc (phòng chống tấn công chuỗi cung ứng supply-chain attack). | **[ĐÃ KÍCH HOẠT]** |
| **ENV-05** | **Kịch bản kiểm chứng Role DB tự động** | Đã chuẩn bị sẵn script `scripts/verify-roles.mjs` để kiểm tra kết nối 5 role, quyền sở hữu của `shd_migrator` và chặn DDL của `shd_app` ngay khi Docker daemon được kích hoạt. | **[SẴN SÀNG]** |

---

## 2. Giả Định Về Mô Hình Dữ Liệu & Bảo Mật

| Mã | Giả định | Lý do / Tác động | Trạng thái |
| :---: | :--- | :--- | :---: |
| **SEC-01** | **Bảo mật Đáp án cấp độ Role Database** | Role ứng dụng `shd_app` tuyệt đối không được cấp quyền `SELECT` trên bảng `answer_keys`. Chỉ role `shd_grader` được đọc bảng này để chấm thi. | **[CHỐT]** |
| **SEC-02** | **Bảo mật Tra cứu SĐT và OTP** | SĐT được lưu kèm chuỗi băm HMAC có muối bí mật (`PHONE_HASH_PEPPER`); mã OTP chỉ lưu bản băm (`OTP_HASH_PEPPER`). Bản thô không lưu trong DB. | **[CHỐT]** |
| **SEC-03** | **Khởi tạo 5 Role Database ở Lệnh 2.1** | Lệnh 2.1 chỉ khởi tạo tài khoản đăng nhập cho 5 role: `shd_migrator`, `shd_app`, `shd_grader`, `shd_worker`, `shd_readonly`. Phân quyền chi tiết trên từng bảng/view sẽ thực hiện ở Lệnh 2.3. | **[CHỐT]** |
| **SEC-04** | **Pháp lý Bảo vệ Dữ liệu** | Căn cứ pháp lý áp dụng là Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 và Nghị định 356/2025/NĐ-CP (hiệu lực 01/01/2026). Các điều khoản cụ thể ghi chú `[Cần pháp chế xác nhận]`. | **[CHỐT]** |
| **SEC-05** | **Đồng hồ đếm ngược Server-Authoritative** | Schema v1 không hỗ trợ tạm dừng đồng hồ đếm ngược server trong phòng thi (ghi nhận ADR mở rộng sau). Đồng hồ server là nguồn sự thật duy nhất. | **[CHỐT]** |
