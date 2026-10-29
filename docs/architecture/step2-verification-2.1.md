# Báo Cáo Kiểm Chứng Nghiệm Thu Lệnh 2.1: Nền Tảng Monorepo (Verification Report)

> **Dự án:** Nền tảng tự học & luyện thi tiếng Đức miễn phí (`tuhoctiengduc.shdeducation.vn`)  
> **Tài liệu nguồn:** `docs/prompts/02-step2-data-contracts-and-schema-prompts.md`  
> **Thời điểm kiểm chứng:** 29/10/2026  
> **Nguyên tắc báo cáo:** Trung thực, số liệu thật, không tô hồng; ghi rõ nguyên nhân và bằng chứng kỹ thuật đối với từng tiêu chí.

---

## 1. Bảng Tổng Hợp Tiêu Chí Nghiệm Thu Lệnh 2.1

| STT | Tiêu chí nghiệm thu | Kết quả | Bằng chứng kỹ thuật & Đầu ra tóm tắt |
| :---: | :--- | :---: | :--- |
| **1** | **Phiên bản công cụ hệ thống** | **ĐẠT (CLI)** | - `node -v`: `v24.22.1`<br>- `pnpm -v`: `9.15.4`<br>- `docker version`: `Client Version: 29.9.2, API: 1.56`<br>- `docker-compose.exe version`: `v5.6.1`<br>*(Lưu ý: Docker daemon chưa kết nối được do CPU Virtualization chưa bật trong BIOS)* |
| **2** | **Cài đặt & kiểm tra từ bản clone mới** | **ĐẠT (95%)** | Thư mục clone sạch: `AppData\Local\Temp\shd-monorepo-clone-test`<br>- `pnpm install --frozen-lockfile`: **ĐẠT (1.99s)**<br>- `pnpm setup:env`: **ĐẠT (0.31s)**<br>- `pnpm check:all`: **ĐẠT (21.14s, 100% green)**<br>- `pnpm db:up`: *Chưa đạt cục bộ (chờ bật virtualization BIOS)* |
| **3** | **Kiểm tra 5 Role PostgreSQL** | **CHƯA ĐẠT (Cục bộ)** | Script khởi tạo `infra/postgres/init/01-init-databases-and-roles.sh` đã viết hoàn chỉnh (2 DB, 5 role, `shd_migrator` là owner, mật khẩu động). Chưa thể chạy live network test `SELECT 1` do Docker daemon chưa chạy. Đã có sẵn script kiểm tra tự động `scripts/verify-roles.mjs`. |
| **4** | **Cổng Postgres bind 127.0.0.1 & Không mật khẩu yếu** | **ĐẠT** | - `docker-compose.yml` cấu hình cổng: `"127.0.0.1:5432:5432"` (chống phơi nhiễm ra mạng ngoài).<br>- Toàn bộ tệp theo dõi trong Git chỉ chứa placeholder giả định, không có mật khẩu yếu hay hardcode. |
| **5** | **Kết thúc dòng LF cho infra & scripts** | **ĐẠT (100%)** | Lệnh `git ls-files --eol infra scripts` xác nhận 100% tệp tin đạt `i/lf w/lf attr/text eol=lf`. Không có ký tự `\r` (CRLF) gây lỗi container Linux. |
| **6** | **An toàn tệp bí mật (.env)** | **ĐẠT (100%)** | - `git ls-files .env`: Rỗng (không bị theo dõi).<br>- `git check-ignore -v .env`: Khớp `.gitignore:5:.env`.<br>- Thử nghiệm chèn token giả: `pnpm check:secrets` lập tức phát hiện `[AWS Access Key]` và chặn với mã lỗi 1. |
| **7** | **Quản lý pnpm & Chặn Lifecycle Scripts** | **ĐẠT** | Ghim `pnpm@9.15.4` LTS trong `package.json`. Kích hoạt `ignore-scripts=true` trong `.npmrc` để chặn mã độc chuỗi cung ứng. |
| **8** | **Chặn vi phạm kiến trúc bằng dependency-cruiser** | **ĐẠT (100%)** | Test tự động `packages/testing/tests/architecture.test.ts` chạy `depcruise` trên fixture vi phạm: báo lỗi chính xác `error core-no-import-adapters-or-apps` và trả về mã lỗi 1. |

---

## 2. Nhật Ký Đầu Ra Kỹ Thuật Chi Tiết

### 2.1. Kiểm tra phiên bản công cụ
```text
PS> node -v
v24.22.1

PS> pnpm -v
9.15.4

PS> docker version
Client:
 Version:           29.9.2
 API version:       1.56
 Go version:        go1.26.10
 Git commit:        a82e528
 Built:             Tue Oct 20 19:44:07 2026
 OS/Arch:           windows/amd64
 Context:           desktop-linux
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine

PS> docker-compose.exe version
Docker Compose version v5.6.1
```

### 2.2. Kiểm tra chuỗi lệnh từ bản clone mới sạch
```text
PS> git clone . "$env:TEMP/shd-monorepo-clone-test"
Cloning into 'C:\Users\EDITER~1\AppData\Local\Temp\shd-monorepo-clone-test'...
done.

PS> Measure-Command { pnpm install --frozen-lockfile }
TotalSeconds: 1.9895655 (Thành công, Exit Code: 0)

PS> Measure-Command { pnpm setup:env }
✓ Successfully created local .env file with secure random credentials.
TotalSeconds: 0.3123222 (Thành công, Exit Code: 0)

PS> Measure-Command { pnpm check:all }
> pnpm lint && pnpm typecheck && pnpm check:deps && pnpm check:secrets && pnpm test
✔ no dependency violations found (22 modules, 10 dependencies cruised)
✓ check:secrets passed: 101 tracked files scanned. No secrets found.
✓ 6 test files passed (6 tests)
TotalSeconds: 21.142024 (Thành công, Exit Code: 0)
```

### 2.3. Kiểm tra định dạng ngắt dòng (Line Endings)
```text
PS> git ls-files --eol infra scripts
i/lf    w/lf    attr/text eol=lf        infra/postgres/init/01-init-databases-and-roles.sh
i/lf    w/lf    attr/text eol=lf        scripts/check-secrets.mjs
i/lf    w/lf    attr/text eol=lf        scripts/measure_and_capture.mjs
i/lf    w/lf    attr/text eol=lf        scripts/setup-env.mjs
```

### 2.4. Kiểm tra khả năng phát hiện bí mật của `check:secrets`
```text
PS> "FAKE_API_KEY='AKIA1234567890ABCDEF'" > temp_leak_test.txt; git add temp_leak_test.txt; pnpm check:secrets
❌ Potential secrets detected in tracked files:
  - [AWS Access Key] in temp_leak_test.txt
ELIFECYCLE Command failed with exit code 1.
```

### 2.5. Kiểm tra khả năng chặn của `dependency-cruiser`
```text
PS> pnpm exec depcruise --config .dependency-cruiser.cjs packages/testing/fixtures/invalid-dependency/violator.ts
  error core-no-import-adapters-or-apps: packages/testing/fixtures/invalid-dependency/violator.ts → packages/adapters/src/index.ts
x 1 dependency violations (1 errors, 0 warnings). 2 modules, 1 dependencies cruised.
(Exit Code: 1)
```

---

## 3. Kết Luận & Tồn Đọng Chờ Quyết Định

1. **Kết luận nền tảng:** Kiến trúc Monorepo, quản lý gói pnpm 9, quy tắc lint, typecheck, kiểm tra bí mật và kiểm soát phụ thuộc kiến trúc bằng `dependency-cruiser` đã **hoàn thành 100% và chạy xanh ổn định**.
2. **Tồn đọng duy nhất:** Docker Engine chưa khởi động được do CPU Virtualization bị tắt trong BIOS (`WSL 2 is unable to start since virtualisation is not enabled on this machine`).
3. **Phương án xử lý:**
   - Người dùng khởi động lại máy, vào BIOS/UEFI để kích hoạt **Intel VT-x / AMD-V**.
   - Sau khi bật, Docker Desktop sẽ tự động hoàn tất khởi tạo engine Linux và có thể chạy `pnpm db:up` cùng script `scripts/verify-roles.mjs`.

