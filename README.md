# SHD Tự Học Tiếng Đức — Monorepo Platform

> Nền tảng tự học và luyện thi thử tiếng Đức trực tuyến miễn phí (`tuhoctiengduc.shdeducation.vn`), tối ưu thu hút và chuyển đổi học viên cho hệ sinh thái **SHD Education (SHD Corp)**.

---

## 1. Yêu Cầu Phần Mềm (Prerequisites)

Dự án được tối ưu hóa cho môi trường phát triển Windows 11 và CI Ubuntu Linux:
1. **Node.js:** Phiên bản Modern / LTS (khuyến nghị Node v24.x trở lên, kiểm tra bằng `node -v`).
2. **pnpm (thông qua Corepack):**
   - Kích hoạt pnpm bằng lệnh:
     ```powershell
     corepack enable pnpm
     ```
   - Phiên bản pnpm ghim trong dự án: `pnpm@9.15.4`.
3. **Git:** Phiên bản 2.40+ (đảm bảo cấu hình ngắt dòng LF: `git config --global core.autocrlf false` hoặc tuân thủ tệp `.gitattributes`).
4. **Docker Desktop (Tùy chọn cho cơ sở dữ liệu PostgreSQL 16 cục bộ):**
   - Cài đặt [Docker Desktop cho Windows](https://www.docker.com/products/docker-desktop/) với WSL 2 backend.
   - Khởi động Docker Desktop trước khi chạy `pnpm db:up`.

---

## 2. Hướng Dẫn Cài Đặt Từ Bản Clone Mới (Getting Started)

Chạy tuần tự các lệnh sau từ thư mục gốc của repository:

```powershell
# Bước 1: Cài đặt toàn bộ thư viện phụ thuộc (Workspace Monorepo)
pnpm install

# Bước 2: Sinh tệp cấu hình môi trường (.env) với mật khẩu ngẫu nhiên bảo mật cao
pnpm setup:env

# Bước 3: Khởi chạy PostgreSQL 16 với 2 database và 5 role đăng nhập (yêu cầu Docker Desktop)
pnpm db:up

# Bước 4: Chạy toàn bộ bộ kiểm tra tự động (Lint, Typecheck, Check Deps, Check Secrets, Tests)
pnpm check:all
```

---

## 3. Cấu Trúc Thư Mục Monorepo (Modular Architecture)

```
.
├── apps/                         # Thư mục chứa các ứng dụng đầu cuối (lắp ghép cấu hình)
│   ├── web/                      # Ứng dụng Web / API Gateway (Next.js/Fastify)
│   └── worker/                   # Background Task Worker (CRM Outbox, ZNS sync)
├── packages/                     # Thư viện dùng chung dạng module hóa nghiêm ngặt
│   ├── config/                   # Quản lý nạp cấu hình và biến môi trường (@shd/config)
│   ├── contracts/                # Định nghĩa Zod Schemas & mã lỗi API (@shd/contracts)
│   ├── core/                     # Domain Entities & Business Rules thuần túy (@shd/core)
│   ├── db/                       # Drizzle ORM Schema, Migrations & DB Client (@shd/db)
│   ├── adapters/                 # Tích hợp dịch vụ ngoại vi: Zalo ZNS, One Center CRM (@shd/adapters)
│   └── testing/                  # Tiện ích kiểm thử, test fixtures & mock helpers (@shd/testing)
├── content/                      # Kho lưu trữ đề thi mẫu dạng JSON mô phỏng minh họa
├── infra/                        # Hạ tầng cấu hình Docker, script khởi tạo database
│   └── postgres/init/            # Script tạo 2 database và 5 login roles
├── docs/                         # Tài liệu kiến trúc, UX và quy tắc kỹ thuật
│   ├── engineering-rules.md      # Quy tắc kỹ thuật cốt lõi (Bảo mật đáp án, PII, hướng phụ thuộc)
│   ├── architecture/             # Tài liệu thiết kế hệ thống, data model, hợp đồng API
│   └── ux/                       # Wireframes spec, self-review và nhật ký kiểm thử
├── scripts/                      # Script tự động hóa kiểm tra bí mật và cấu hình môi trường
├── docker-compose.yml            # Docker Compose chạy PostgreSQL 16
├── pnpm-workspace.yaml           # Cấu hình workspace của pnpm
└── tsconfig.base.json            # Cấu hình TypeScript Strict dùng chung
```

---

## 4. Danh Sách Lệnh Thao Tác (Scripts Reference)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `pnpm setup:env` | Sinh tệp `.env` cục bộ với mật khẩu ngẫu nhiên (không hardcode). |
| `pnpm check:all` | Chạy toàn bộ chuỗi: Lint $\rightarrow$ Typecheck $\rightarrow$ Check Deps $\rightarrow$ Check Secrets $\rightarrow$ Tests. |
| `pnpm check:deps` | Kiểm tra hướng phụ thuộc 4 tầng bằng `dependency-cruiser`. |
| `pnpm check:secrets` | Quét toàn bộ tệp được Git theo dõi để ngăn rò rỉ khóa/token. |
| `pnpm lint` | Kiểm tra lỗi mã nguồn bằng ESLint 9 (Flat Config). |
| `pnpm typecheck` | Kiểm tra kiểu dữ liệu toàn bộ workspace bằng `tsc -b --noEmit`. |
| `pnpm test` | Chạy toàn bộ test suites bằng `vitest`. |
| `pnpm db:up` | Khởi chạy container PostgreSQL 16 (bind `127.0.0.1:5432`). |
| `pnpm db:down` | Dừng và hủy container PostgreSQL cục bộ. |
| `pnpm db:reset` | Reset toàn bộ volume database và chạy lại script khởi tạo. |

---

## 5. Quy Tắc Kỹ Thuật Bắt Buộc

Xem chi tiết trong [`docs/engineering-rules.md`](file:///c:/Users/Editer%20SHB/shd-tuhoctiengduc/docs/engineering-rules.md):
- **Server-Side Grading:** Đáp án (`answer_keys`) không bao giờ ra khỏi server; role `shd_app` bị cấm `SELECT` đáp án.
- **Bảo Vệ Dữ Liệu Cá Nhân:** Tuân thủ Luật 91/2025/QH15 & Nghị định 356/2025/NĐ-CP; SĐT và OTP chỉ lưu dạng băm HMAC.
- **Quy tắc Kiến trúc:** `core` không import `adapters`/`apps`; `contracts` không import `core`/`db`; `db` không import `core`.
