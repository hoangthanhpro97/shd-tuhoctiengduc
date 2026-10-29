# Báo Cáo Kiểm Chứng Lệnh 2.1: Nền Monorepo (v2)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức (`tuhoctiengduc.shdeducation.vn`)
> **Thời điểm kiểm chứng:** 29/10/2026
> **Môi trường:** Windows 11, WSL2 Ubuntu (user `editer_shb`), repo `~/projects/shd-tuhoctiengduc`
> **Commit kiểm chứng:** `30eec91` (đã push lên `origin/main`)
> **Thay thế:** báo cáo v1 (commit `73f30ec`). Báo cáo v1 ghi ĐẠT cho nhiều mục chưa được chạy thật. Báo cáo này chỉ ghi những mục có đầu ra cụ thể.

---

## 1. Kết luận

Lệnh 2.1 **ĐẠT trong phạm vi môi trường local WSL**. Các mục chưa kiểm được được chuyển sang lệnh 2.3, 2.6 hoặc kiểm tra CI, và liệt kê ở mục 3.

---

## 2. Tiêu chí đã đạt

| # | Tiêu chí | Bằng chứng |
| :---: | :--- | :--- |
| 1 | Node đúng phiên bản `.nvmrc` (v24.22.1), cài qua nvm | `nvm install` tải và kiểm tra checksum; `node -v` = `v24.22.1`; `which node` nằm dưới `/home/editer_shb/.nvm` |
| 2 | pnpm đúng phiên bản ghim (9.15.4), qua corepack | `pnpm -v` = `9.15.4`; `which pnpm` nằm dưới `~/.nvm` |
| 3 | Cài dependency từ lockfile | `pnpm install --frozen-lockfile`: "Lockfile is up to date", 192 gói |
| 4 | Không có PATH lẫn công cụ Windows | `echo $PATH \| grep -c '/mnt/c'` = `0`; `/etc/wsl.conf` có `appendWindowsPath = false` |
| 5 | Tạo `.env` không ghi đè, không còn giá trị mẫu | `setup:env` báo ".env already exists"; `grep -ciE 'change\|example\|placeholder' .env` = `0` |
| 6 | Postgres 16 chạy, chỉ bind 127.0.0.1 | `docker compose ps`: `postgres:16-alpine`, `127.0.0.1:5432->5432`, `Up 18 minutes (healthy)` |
| 7 | 5 role đăng nhập được vào `shd_tuhoctiengduc` | `verify-roles.mjs`: `SELECT 1 pass` cho `shd_migrator`, `shd_app`, `shd_grader`, `shd_worker`, `shd_readonly`. Kiểm tra cả trước và sau khi khởi động lại |
| 8 | Dữ liệu bền qua khởi động lại | `pnpm db:down` chỉ xóa container và network, volume `pgdata` được giữ; sau `db:up`, cả 5 role vẫn kết nối được |
| 9 | Lint và typecheck | `pnpm check:all` đi qua `eslint .` và `tsc -b` không báo lỗi |
| 10 | Kiểm tra phụ thuộc kiến trúc | `check:deps`: "no dependency violations found (22 modules, 10 dependencies cruised)" |
| 11 | Test kiến trúc bắt được vi phạm | `architecture.test.ts` nằm trong 6/6 file test đạt |
| 12 | Quét bí mật trong file theo dõi | `check:secrets`: "106 tracked files scanned. No secrets found." |
| 13 | `check:all` chạy đến hết | `EXIT=0`; Test Files 6 passed (6); Tests 6 passed (6) |
| 14 | Dòng kết thúc LF cho `infra/` và `scripts/` | `git ls-files --eol infra scripts`: 5 file đều `i/lf w/lf` |
| 15 | `.env` không được git theo dõi | `git ls-files .env`: rỗng |
| 16 | File thử bí mật không vào lịch sử | `git status` sạch; `git log --all -- temp_leak_test.txt`: rỗng |
| 17 | Commit lên remote | `git push origin main`: `3df740d..30eec91 main -> main`; `git status -sb`: `## main...origin/main` |

---

## 3. Chưa kiểm, chuyển đi nơi khác

| Hạng mục | Lý do | Chuyển sang |
| :--- | :--- | :--- |
| Kết nối tới `shd_test` | Chưa kiểm trong `verify-roles` | 2.6 |
| `shd_app` bị từ chối `CREATE TABLE` | Cần test quyền âm | 2.6 |
| Mật khẩu sai bị từ chối | Cần test quyền âm | 2.6 |
| `shd_migrator` là owner của hai DB | Phụ thuộc phân quyền chi tiết | 2.3 và 2.6 |
| `shd_app` không đọc được `answer_keys` | Bảng chưa tồn tại | 2.3 và 2.6 |
| `db:reset` từ chối khi không ở môi trường local | Chưa xác định cơ chế kiểm tra môi trường | 2.3 |
| `check-ignore` cho `.env` trong WSL | Đã kiểm `git ls-files`; chưa chạy `git check-ignore -v` trong WSL | Kiểm tra khi thuận tiện, không chặn 2.1 |
| CI trên GitHub Actions chạy `db:migrate`/role | Chưa có lần chạy thật trên GitHub | Kiểm tra trên tab Actions sau khi push |
| `scripts/measure_and_capture.mjs` còn trong repo | File tạm, chưa dọn | Xóa trong commit riêng |

---

## 4. Quyết định và ghi nhận

1. **Giữ pnpm 9.15.4.** pnpm báo có bản 12.16.1. Nâng cấp là việc riêng, vì các bản mới thay đổi chính sách chạy script cài đặt. Cần đánh giá trước khi nâng.
2. **Cảnh báo `url.parse()` của Node** xuất hiện khi cài dependency. Đây là cảnh báo, không ảnh hưởng kết quả. Ghi nhận, không xử lý trong 2.1.
3. **Chuỗi giả `AKIA1234567890ABCDEF`** từng được ghi vào báo cáo v1 và đã được ẩn ở commit `30eec91`. Chuỗi này vẫn nằm trong lịch sử git của commit trước. Đây là chuỗi giả từ bài kiểm thử, không phải khóa thật, nên không viết lại lịch sử.
4. **Báo cáo v1 không còn hiệu lực.** Các mục ghi ĐẠT trong báo cáo v1 (phiên bản công cụ, `db:up`, `verify-roles`, `check:all`) được xác nhận lại trong báo cáo này bằng đầu ra thật.

---

## 5. Trạng thái các điểm dừng

| Điểm dừng | Trạng thái |
| :--- | :--- |
| Điểm dừng 1: duyệt mô hình dữ liệu v1.1 (`02-data-model.md`) | **Chưa duyệt.** Cần upload file v1.1 để rà soát. Chưa chạy lệnh 2.3 cho đến khi duyệt |
| Lệnh 2.1 | **Đạt** (local WSL) |
