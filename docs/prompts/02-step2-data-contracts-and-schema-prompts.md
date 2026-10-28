# Bước 2: Hợp đồng dữ liệu và Schema. Bộ lệnh cho Antigravity IDE

Lưu file này vào `docs/prompts/02-step2-data-contracts-and-schema-prompts.md`. Mỗi khối trong dấu ba backtick là một lệnh hoàn chỉnh, dán nguyên vào Antigravity.

## Cách dùng

1. Chạy tuần tự 2.0 → 2.7, mỗi lệnh một lượt riêng. Chờ xong, kiểm tra kết quả, rồi mới sang lệnh sau. Đừng gộp lệnh.
2. Với 2.3 đến 2.6 (schema, hợp đồng, bảo mật dữ liệu), dùng mô hình mạnh nhất có trong danh sách. Đây là phần khó sửa nhất về sau.
3. Bật chế độ lập kế hoạch nếu có, đọc kế hoạch trước khi duyệt.
4. Môi trường là Windows. Cần có sẵn Node.js (bản LTS), Docker Desktop, Git. Thiếu gì thì ghi vào README, đừng để agent tự cài phần mềm hệ thống.
5. Không dùng dữ liệu người thật hay khóa thật ở bất kỳ bước nào.

## Tổng quan

| Lệnh | Mục tiêu | Sản phẩm chính | Điều kiện qua cổng |
|---|---|---|---|
| 2.0 | Dọn tồn đọng bước 1 | Wireframe và tài liệu UX đã sửa | Ảnh nhánh dưới 18 tuổi thật, assumptions cập nhật |
| 2.1 | Nền monorepo | Repo, Docker Postgres, CI, quy tắc kỹ thuật | Bản clone mới chạy được `check:all` |
| 2.2 | Mô hình dữ liệu (tài liệu) | `docs/architecture/02-data-model.md` | **Điểm dừng 1: bạn gửi mình duyệt** |
| 2.3 | Schema và migration | Drizzle schema, SQL migration, role, view | Migrate sạch, không lệch schema |
| 2.4 | Hợp đồng API | `packages/contracts`, mã lỗi, tài liệu endpoint | **Điểm dừng 2: bạn gửi mình duyệt** |
| 2.5 | Seed và kiểm tra khớp spec | Đề mẫu 30 câu, fixture 21/12/9 | Test đối chiếu bảng 08 đạt |
| 2.6 | Kiểm thử bảo mật dữ liệu | Test quyền, bất biến, consent, outbox | Mọi bất biến đều có test |
| 2.7 | Đóng bước 2 | ADR, báo cáo, ma trận truy vết | **Điểm dừng 3: bạn gửi mình duyệt** |

---

## Lệnh 2.0. Dọn tồn đọng bước 1 (chỉ sửa tài liệu và wireframe)

```
BỐI CẢNH
Rà soát ảnh chụp cho thấy các tồn đọng nhỏ ở bước 1. Lần này CHỈ sửa wireframe và tài liệu trong docs/ux, không thêm tính năng hay màn hình mới, không cài gói. Lập kế hoạch ngắn, không hỏi lại tôi giữa chừng (thiếu thông tin thì ghi giả định vào docs/ux/00-assumptions.md), commit nhỏ cho từng nhóm sửa.

VIỆC CẦN LÀM
1. result-and-gate.html, modal ở 375px: nút X còn đè lên nhãn bước "3. Mở khóa". Dời nút X ra hàng riêng phía trên thanh bước (hoặc góc trên cùng), kiểm tra không che chữ ở 360px và 375px.
2. Ảnh nhánh dưới 18 tuổi hiện trùng với ảnh bước 1 nên chưa chứng minh được gì. Chọn "Nhóm đối tượng = Học sinh (dưới 18 tuổi)", rồi chụp lại ở 375px cho ba trạng thái: (a) form có thêm ô số Zalo của cha/mẹ, (b) màn "Đã gửi tin xác nhận cho phụ huynh, đang chờ", (c) màn phụ huynh xác nhận đồng ý. Lưu vào docs/ux/screenshots/ với tên nói rõ trạng thái. Nếu wireframe chưa có trạng thái nào trong số này thì bổ sung.
3. exam-room.html trên mobile:
   a) Trình phát Hören đang ghi "Sẵn sàng phát" nhưng thanh tiến trình đã ở 01:14. Thống nhất các trạng thái: sẵn sàng (00:00), đang phát, tạm dừng (chỉ khi cấu hình cho phép), hết lượt. Hiển thị "Lượt nghe 1/2" rõ ràng.
   b) Thanh demo màu đen chiếm khoảng một phần tư màn hình mobile. Gộp vào một nút "Công cụ demo" mở/đóng, mặc định thu gọn ở dưới 480px.
4. docs/ux/00-assumptions.md:
   a) Mục A-02 đang dẫn Nghị định 13/2023. Đổi thành Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP (hiệu lực từ 01/01/2026, thay Nghị định 13). Thêm ghi chú "pháp chế xác nhận điều khoản cụ thể".
   b) Mục B-03 đang viết "Về luật là KHÔNG". Sửa thành "cần pháp chế xác nhận; thiết kế mặc định KHÔNG liên hệ khi thiếu đồng ý".
   c) Mục C-02: tách "thời gian hiệu lực OTP" (đề xuất 5 phút, vì tin Zalo/SMS có thể đến trễ) khỏi "thời gian chờ gửi lại" (60 giây). Đánh dấu cần duyệt.
   d) B-01 và DEC-09 đang hơi mâu thuẫn. Thống nhất: chế độ Thi thử (exam) không cho tua, cho phép tạm dừng tùy cấu hình đề; chế độ Luyện tập (practice) cho phép tua. Thêm câu hỏi mở "MVP có làm chế độ Luyện tập không?". Giả định mặc định: MVP chỉ có Thi thử, nhưng dữ liệu phải hỗ trợ cả hai.
5. Mọi chỗ ghi "chuẩn TELC", "chuẩn Goethe" trên wireframe và spec thay bằng "mô phỏng định dạng". Thêm vào docs/ux/08-sample-exam-spec.md một mục "Giả định về cấu trúc đề": số câu, thời gian và các Teil là dữ liệu minh họa, KHÔNG phải định dạng chính thức của kỳ thi nào; giảng viên phải xác nhận trước khi xuất bản đề thật.
6. Cập nhật docs/ux/05-self-review.md và docs/ux/06-change-log.md. Commit.

CÁCH LÀM
Không cài gói, không chạy lệnh phá hủy, không dữ liệu cá nhân thật. Khi xong, trả lời tối đa 10 dòng: đã sửa gì, còn tồn đọng gì, giả định nào cần tôi quyết.
```

---

## Lệnh 2.1. Nền monorepo (chưa có nghiệp vụ)

```
VAI TRÒ
Bạn là Staff Engineer thiết lập nền tảng cho dự án. Lập kế hoạch ngắn rồi làm. Không hỏi lại tôi giữa chừng; thiếu thông tin thì ghi giả định vào docs/architecture/assumptions-step2.md. Tài liệu viết tiếng Việt, tên file và mã nguồn bằng tiếng Anh.

BỐI CẢNH
SHD Education xây nền tảng tuhoctiengduc.shdeducation.vn: kho đề thi thử và công cụ tự học tiếng Đức miễn phí, thu lead cho các khóa học trả phí. Dữ liệu cá nhân của học viên nhạy cảm (số điện thoại, người dưới 18 tuổi), đáp án đề thi phải tuyệt đối không lộ ra trình duyệt. Môi trường phát triển là Windows 11.

QUYẾT ĐỊNH KIẾN TRÚC ĐÃ CHỐT
- Monolith dạng module trong monorepo (pnpm workspaces), TypeScript strict.
- Cấu trúc: apps/ (chỉ để thư mục giữ chỗ có README: web, worker; CHƯA viết mã), packages/contracts, packages/core, packages/db, packages/adapters, packages/config, packages/testing, content/, infra/, docs/.
- Hướng phụ thuộc, bắt buộc kiểm bằng công cụ (dependency-cruiser): core KHÔNG được import adapters hay apps; contracts KHÔNG được import core hay db; db KHÔNG được import core; apps chỉ được lắp ghép ở một chỗ duy nhất.
- PostgreSQL 16 chạy bằng Docker Compose. Kiểm thử chạy trên Postgres thật, không dùng mock cho DB.

VIỆC CẦN LÀM
1. Kiểm tra máy có node, pnpm (qua corepack), docker, git chưa. Thiếu thì ghi hướng dẫn cài vào README, KHÔNG tự cài phần mềm hệ thống.
2. Khởi tạo workspace: pnpm-workspace.yaml, tsconfig.base.json (strict, noUncheckedIndexedAccess), ghim phiên bản Node (.nvmrc) và pnpm (trường packageManager). .gitattributes với "* text=auto eol=lf" và .editorconfig (BẮT BUỘC: script chạy trong container Linux sẽ hỏng nếu dòng kết thúc là CRLF).
3. Công cụ kiểm tra: ESLint, Prettier, Vitest, dependency-cruiser. Chỉ dùng gói phổ biến, đang được bảo trì. Ghim phiên bản chính xác, tránh bản phát hành trong 14 ngày gần nhất nếu kiểm tra được, không thêm gói ngoài danh sách cần thiết, chặn script cài đặt không cần thiết nếu pnpm hỗ trợ.
4. docker-compose.yml: postgres:16 có healthcheck, volume, cổng chỉ bind 127.0.0.1. Script khởi tạo (đặt trong infra/postgres/init/) tạo 2 database (shd_tuhoctiengduc và shd_test) và 5 role đăng nhập: shd_migrator (chủ sở hữu, chạy DDL), shd_app, shd_grader, shd_worker, shd_readonly. Mật khẩu lấy từ biến môi trường, KHÔNG hardcode. Chỉ tạo role ở bước này; phân quyền chi tiết làm ở lệnh sau.
5. .env.example chỉ chứa giá trị giả; .gitignore loại .env. Viết script "pnpm setup:env" (Node/TypeScript, chạy được trên Windows, không phụ thuộc bash) sinh .env cục bộ với mật khẩu ngẫu nhiên, gồm cả PHONE_HASH_PEPPER và OTP_HASH_PEPPER. Tuyệt đối không commit .env.
6. Script trong package.json gốc (đều chạy được trên Windows): lint, typecheck, test, check:deps, check:secrets (quét mẫu khóa/token đơn giản trên file đã theo dõi), db:up, db:down, db:reset, check:all (chạy lint, typecheck, check:deps, check:secrets, test).
7. docs/engineering-rules.md (ngắn, tối đa 1 trang): hướng phụ thuộc; đáp án (answer_keys) không bao giờ ra khỏi server; không đưa PII vào log hay prompt AI; migration kiểu mở rộng rồi thu hẹp, chỉ tiến lên, không sửa migration đã áp dụng; tên cột snake_case trong DB, camelCase trong TypeScript; ID dạng UUID; mọi thời gian timestamptz theo UTC; lỗi theo chuẩn problem+json; không dùng dữ liệu thật; quy ước thông điệp commit.
8. CI: .github/workflows/ci.yml. Cài với lockfile đóng băng, chạy lint, typecheck, check:deps, check:secrets, test với dịch vụ Postgres 16. Ghim phiên bản các action (ưu tiên mã SHA đầy đủ hoặc tag chính thức của hãng). Thêm bước báo cáo "pnpm audit" ở chế độ chỉ báo cáo.
9. Mỗi package có package.json, tsconfig, thư mục src và một test mẫu rất ngắn để CI có gì để chạy. KHÔNG viết nghiệp vụ.
10. Thêm một test chứng minh dependency-cruiser thật sự chặn: tạo import vi phạm (core import adapters) trong một thư mục fixture và xác nhận check:deps báo lỗi.
11. README gốc: cách chạy từ máy sạch (các lệnh theo thứ tự), yêu cầu phần mềm, cấu trúc thư mục.

TIÊU CHÍ HOÀN THÀNH
Từ một bản clone mới: pnpm install, pnpm setup:env, pnpm db:up, pnpm check:all chạy xanh. Test của dependency-cruiser chứng minh được việc chặn. Không có bí mật nào trong git.

CÁCH LÀM
Commit nhỏ theo thông điệp chuẩn. Không dữ liệu thật. Khi xong, trả lời tối đa 10 dòng: những gì đã làm, những gì chưa kiểm được trên máy này, giả định cần tôi quyết.
```

---

## Lệnh 2.2. Mô hình dữ liệu (CHỈ TÀI LIỆU, chưa viết SQL)

Sau khi chạy xong lệnh này, **gửi mình `docs/architecture/02-data-model.md` để duyệt** trước khi chạy 2.3.

```
VAI TRÒ
Bạn là Data Architect. Lệnh này CHỈ tạo tài liệu thiết kế dữ liệu, KHÔNG viết SQL hay mã. Lập kế hoạch ngắn, không hỏi lại tôi giữa chừng; điều chưa chắc ghi vào mục "Cần duyệt" của tài liệu.

ĐẦU VÀO PHẢI ĐỌC
docs/ux/00-assumptions.md, 02-user-flows.md, 03-screen-inventory.md, 08-sample-exam-spec.md, docs/engineering-rules.md.

SẢN PHẨM
docs/architecture/02-data-model.md (tiếng Việt) gồm:
1. Sơ đồ ERD bằng Mermaid, chia 5 nhóm: Nội dung đề thi; Làm bài và chấm điểm; Người học, đồng ý và xác thực; Lead và đồng bộ CRM; Vận hành (cấu hình, nhật ký, yêu cầu dữ liệu).
2. Từ điển bảng: tên bảng, mục đích, cột chính, ràng buộc, mức độ nhạy cảm PII (định danh trực tiếp / gián tiếp / hành vi / không), thời hạn lưu trữ ĐỀ XUẤT (đánh dấu rõ là đề xuất, cần pháp chế duyệt).
3. Máy trạng thái: phiên bản đề (draft → ai_checked → teacher_approved → published → archived), phiên làm bài, OTP, xác nhận của phụ huynh, hàng đợi outbox, nhiệt độ lead (hot/warm/nurture).
4. Danh sách bất biến (invariants): mỗi bất biến là một câu kiểm chứng được, đánh số INV-01 trở đi, tối thiểu 20 điều. Các test ở lệnh 2.6 sẽ kiểm từng điều.
5. Ma trận quyền theo role DB (shd_migrator, shd_app, shd_grader, shd_worker, shd_readonly) cho từng bảng và view.
6. Bảng truy vết: mỗi màn hình và mỗi trường trong docs/ux/03-screen-inventory.md ↔ bảng/cột hoặc "dữ liệu suy ra". Mỗi bảng phải phục vụ ít nhất một yêu cầu; không để bảng mồ côi.
7. Mục "Cần duyệt" liệt kê mọi quyết định chưa chắc.

CÁC QUYẾT ĐỊNH ĐÃ CHỐT (không đổi)
- ID là UUID, sinh ở tầng ứng dụng (UUIDv7); DB để gen_random_uuid() làm mặc định dự phòng. Mọi thời gian dùng timestamptz (UTC). Đồng hồ server là nguồn sự thật.
- Không dùng enum cứng gắn với tiếng Đức. Dùng bảng tra (lookup) hoặc ràng buộc CHECK để thêm ngôn ngữ/kỳ thi (ví dụ tiếng Hàn) bằng dữ liệu, không sửa cấu trúc.
- Đáp án nằm ở bảng riêng answer_keys, chỉ role shd_grader được SELECT. Lời giải có cờ hiển thị công khai/bị khóa; số câu giải thích công khai mỗi đề là cấu hình (mặc định 2), không hardcode.
- Phiên bản đề BẤT BIẾN sau khi xuất bản; mỗi đề chỉ có tối đa một phiên bản đang xuất bản; phiên làm bài trỏ tới phiên bản đề.
- Quyền xem lời giải đầy đủ là dữ liệu (bảng quyền lợi gắn với phiên làm bài), không phải cờ ở client.
- Số lượt nghe audio do SERVER đếm (bảng lượt phát theo phiên làm bài); client chỉ hiển thị.
- Chưa hỗ trợ tạm dừng đồng hồ ở schema v1 (ghi thành ADR, thêm sau bằng cách mở rộng). Hỗ trợ thời gian tổng của đề và thời gian riêng từng phần (có thể rỗng). Có trường chế độ làm bài (exam/practice).
- Đồng ý (consent) lưu theo kiểu sổ cái chỉ-ghi-thêm: mỗi lần cho/rút là một dòng mới; có phiên bản văn bản đồng ý; có danh sách đơn vị nhận khi chia sẻ trong nhóm SHD. View "đồng ý hiện hành" suy ra từ sổ cái.
- Khả năng liên hệ lead được suy ra bằng view: SĐT đã xác thực, có đồng ý tư vấn hiện hành, và nếu người học dưới 18 tuổi thì phải có phụ huynh xác nhận còn hiệu lực. Thiếu một điều kiện thì KHÔNG nằm trong view.
- SĐT lưu dạng chuẩn hóa kèm bản băm HMAC (có pepper từ biến môi trường) để chống trùng; OTP chỉ lưu bản băm.
- Outbox trong Postgres: khóa idempotency duy nhất, trạng thái, số lần thử, thời điểm thử tiếp theo, hỗ trợ nhiều worker lấy việc bằng FOR UPDATE SKIP LOCKED. Payload chỉ chứa PII tối thiểu cần thiết.
- Bảng liên kết CRM (crm_links) lưu mã One Center, trạng thái học viên và cấp độ hiện tại do CRM trả về; bảng sự kiện CRM nhận vào có khóa duy nhất theo mã sự kiện ngoài để chống xử lý lặp.
- Nhật ký audit chỉ-ghi-thêm (xem SĐT, thao tác quản trị); bảng yêu cầu dữ liệu (xuất, xóa, rút đồng ý); bảng cấu hình (ngưỡng Hot/Warm, hiệu lực OTP, số câu giải thích công khai).
- Có thủ tục ẩn danh hóa người học (xóa PII, giữ thống kê tổng hợp).
- Danh sách bảng gợi ý (được phép chỉnh nếu nêu lý do trong tài liệu): tracks, exam_standards, levels, skills, question_types, exams, exam_versions, content_reviews, sections, stimuli, assets, questions, question_options, answer_keys, explanations; visitors, learners, guardians, otp_challenges, exam_attempts, attempt_answers, attempt_audio_plays, attempt_entitlements, results, result_item_scores, learning_events; consent_purposes, consent_texts, consents; leads, crm_outbox, crm_links, crm_inbound_events; staff_users, audit_logs, data_requests, app_settings.

LƯU Ý
Không ghi bất kỳ khẳng định pháp lý nào như thể đã chắc chắn. Mọi điều liên quan Luật 91/2025/QH15 và Nghị định 356/2025/NĐ-CP ghi là "cần pháp chế xác nhận". Thời hạn lưu trữ và việc lưu IP là đề xuất.

CÁCH LÀM
Commit nhỏ. Khi xong, trả lời tối đa 10 dòng: số bảng, số bất biến, các mục "Cần duyệt" quan trọng nhất.
```

---

## Lệnh 2.3. Schema và migration

Chạy sau khi bạn (và mình) đã duyệt tài liệu ở 2.2.

```
VAI TRÒ
Bạn là Database Engineer. Lập kế hoạch ngắn rồi làm. Không hỏi lại tôi giữa chừng.

ĐẦU VÀO
docs/architecture/02-data-model.md (bản đã duyệt) và docs/engineering-rules.md. KHÔNG thêm bảng hay cột ngoài tài liệu. Nếu thấy cần, cập nhật tài liệu trước, nêu lý do, rồi mới làm.

VIỆC CẦN LÀM
1. Cài Drizzle ORM, drizzle-kit và driver pg (ghim phiên bản). Viết schema trong packages/db/src/schema/, chia file theo 5 nhóm của tài liệu. Dùng drizzle-kit để sinh migration SQL vào packages/db/migrations (đây là nguồn sự thật; file migration đã áp dụng KHÔNG được sửa).
2. Ràng buộc: khóa ngoại với ON DELETE RESTRICT (trừ chỗ tài liệu nêu khác); CHECK cho các giá trị hữu hạn; mọi timestamp là timestamptz; UNIQUE (exam_version_id, question_number); UNIQUE (attempt_id, question_id); UNIQUE trên bản băm SĐT; chỉ mục duy nhất một phần để mỗi đề chỉ có một phiên bản đang xuất bản; chỉ mục phục vụ truy vấn danh mục (lọc theo kỳ thi/cấp độ/kỹ năng), phiên làm bài theo người dùng, và chỉ mục một phần cho outbox (trạng thái pending/failed, sắp theo next_attempt_at).
3. Migration SQL tùy chỉnh (drizzle-kit generate --custom), mỗi loại một file có chú thích rõ mục đích:
   a) Phân quyền cho 5 role theo đúng ma trận quyền trong tài liệu. shd_app KHÔNG có quyền gì trên answer_keys. shd_grader đọc được answer_keys nhưng KHÔNG đọc được bảng chứa PII. shd_readonly chỉ truy cập view đã che.
   b) Trigger bất biến: chặn INSERT/UPDATE/DELETE trên các bảng con của một phiên bản đề đã xuất bản. Trigger chặn chuyển trạng thái sai thứ tự của vòng đời phiên bản đề (và ghi content_reviews).
   c) Chỉ-ghi-thêm: chặn UPDATE/DELETE trên audit_logs, consents, learning_events (kể cả với shd_app).
   d) Trigger cập nhật updated_at.
   e) View: v_learner_masked (SĐT che, ví dụ 09xxxxxx78), v_current_consents (suy ra từ sổ cái), v_contactable_leads (theo đúng điều kiện trong tài liệu), v_attempt_scores_by_skill.
   f) Hàm anonymize_learner(learner_id): xóa/băm PII ở learners, guardians, leads, otp_challenges và dữ liệu nhận dạng trong consents; giữ lại thống kê tổng hợp; ghi một dòng audit_logs.
4. Script (Node/TypeScript, chạy được trên Windows): db:migrate (chạy bằng shd_migrator), db:reset (xóa và dựng lại DB cục bộ, chỉ cho phép khi biến môi trường cho biết đây là môi trường local), db:check-drift (chạy drizzle-kit generate rồi báo lỗi nếu sinh ra thay đổi mới).
5. CI: thêm bước db:migrate trên Postgres của CI và db:check-drift. Thêm script check:migrations quét migration mới và cảnh báo (fail) khi có DROP COLUMN, DROP TABLE, RENAME, ALTER COLUMN TYPE trừ khi file có dòng chú thích "-- expand-contract-approved: <lý do>".
6. Kiểm thử cơ bản ngay trong lệnh này: migrate từ DB rỗng lên mới nhất thành công; chạy lại là no-op; schema Drizzle khớp migration (không lệch).
7. Cập nhật docs/architecture/02-data-model.md nếu có chỗ khác với thiết kế và nêu lý do.

TIÊU CHÍ HOÀN THÀNH
Migrate sạch từ DB rỗng; db:check-drift xanh; check:migrations hoạt động; mọi role tồn tại và có quyền đúng ma trận (kiểm chi tiết ở 2.6).

CÁCH LÀM
Commit nhỏ theo từng nhóm. Không dữ liệu thật, không bí mật trong git. Khi xong, trả lời tối đa 10 dòng: số bảng/view/trigger đã tạo, điểm lệch so với tài liệu, rủi ro còn lại.
```

---

## Lệnh 2.4. Hợp đồng API (packages/contracts)

Sau lệnh này, **gửi mình `docs/architecture/03-api-contract-v1.md` cùng thư mục `packages/contracts/src`** để duyệt.

```
VAI TRÒ
Bạn là API Designer. Lập kế hoạch ngắn rồi làm. KHÔNG viết máy chủ hay logic nghiệp vụ; chỉ viết hợp đồng. Không hỏi lại tôi giữa chừng.

ĐẦU VÀO
docs/architecture/02-data-model.md, docs/ux/02-user-flows.md, 03-screen-inventory.md, 00-assumptions.md, 08-sample-exam-spec.md.

VIỆC CẦN LÀM
1. Trong packages/contracts, dùng Zod (ghim phiên bản) để định nghĩa schema NGHIÊM NGẶT (strict, không nhận trường lạ) cho yêu cầu và phản hồi của các endpoint /v1 sau (được phép chỉnh nếu nêu lý do):
   - Danh mục: GET /v1/exams (lọc theo kỳ thi, cấp độ, kỹ năng, từ khóa, phân trang), GET /v1/exams/{slug}.
   - Làm bài: POST /v1/exams/{examId}/attempts (bắt đầu), GET /v1/attempts/{id} (tiếp tục: đề KHÔNG có đáp án, giây còn lại do server tính, các câu đã lưu), PUT /v1/attempts/{id}/answers (tự lưu theo lô, có số revision để chống ghi chồng), POST /v1/attempts/{id}/audio-plays (server ghi nhận và cấp quyền một lượt nghe), POST /v1/attempts/{id}/submit.
   - Kết quả: GET /v1/attempts/{id}/result (điểm tổng và điểm theo kỹ năng), GET /v1/attempts/{id}/review (danh sách theo từng câu).
   - Cổng lead: POST /v1/gate/start (gửi form, tạo thử thách OTP), POST /v1/gate/verify (xác thực OTP; trong một giao dịch tạo người học, lead, bản ghi đồng ý và quyền xem đầy đủ), POST /v1/gate/guardian-confirm (phụ huynh xác nhận qua token).
   - Quyền dữ liệu: POST /v1/consents/withdraw, POST /v1/data-requests.
   - CRM: POST /v1/crm/events (webhook có chữ ký HMAC).
   - Quản trị: GET /v1/admin/leads (SĐT đã che), POST /v1/admin/leads/{id}/reveal-phone (ghi audit_logs).
   - Hệ thống: GET /v1/healthz, GET /v1/readyz.
2. GET review dùng union phân biệt theo trường access: "open" (câu công khai: có đúng/sai, đáp án, lời giải), "locked" (CHỈ có số câu, kỹ năng và cờ locked; TUYỆT ĐỐI không có đúng/sai, đáp án hay lời giải), "full" (sau khi có quyền). Biến thể locked phải là strict.
3. Chuẩn lỗi problem+json: các mã tối thiểu SESSION_EXPIRED, GATE_REQUIRED, CONSENT_REQUIRED, GUARDIAN_PENDING, GUARDIAN_EXPIRED, OTP_INVALID, OTP_EXPIRED, OTP_RATE_LIMITED, AUDIO_PLAYS_EXHAUSTED, REVISION_CONFLICT, VALIDATION_FAILED, NOT_FOUND, FORBIDDEN, RATE_LIMITED. Mỗi mã có HTTP status, mô tả, và thông điệp tiếng Việt thân thiện cho người dùng.
4. Hàm chuẩn hóa số điện thoại Việt Nam (nhận 0xxxxxxxxx, +84..., có dấu cách hoặc chấm; trả dạng chuẩn hóa; đầu số hợp lệ đặt trong cấu hình chứ không hardcode trong logic). Có test.
5. Header Idempotency-Key bắt buộc cho submit và gate/verify; ghi rõ ngữ nghĩa trong tài liệu.
6. Test "không lộ đáp án": một test duyệt MỌI schema phản hồi dành cho người học và FAIL nếu chúng có thể chứa các khóa bị cấm (correct, correctAnswer, answerKey, answer_key, isCorrect, explanationGated...) ngoài các biến thể được liệt kê rõ là được phép (access = open hoặc full). Kèm test chứng minh nó thật sự bắt được lỗi (thêm một schema cố ý sai trong fixture và xác nhận test fail).
7. Fixture JSON mẫu cho từng endpoint (dùng dữ liệu của 08-sample-exam-spec.md), được kiểm bằng chính các schema.
8. Tài liệu docs/architecture/03-api-contract-v1.md: bảng endpoint (phương thức, đường dẫn, xác thực, yêu cầu, phản hồi, mã lỗi, idempotency, nhóm giới hạn tần suất), ví dụ, quy tắc đặt phiên bản (/v1, thay đổi phá vỡ thì /v2). Nếu có thư viện đáng tin cậy tương thích phiên bản Zod đang dùng thì xuất thêm OpenAPI 3.1; nếu không chắc về độ tương thích, tự viết script xuất Markdown và ghi rõ giới hạn.

TIÊU CHÍ HOÀN THÀNH
check:all xanh; test không-lộ-đáp án xanh và có test chứng minh nó bắt được lỗi; mọi fixture hợp lệ; tài liệu khớp với schema.

CÁCH LÀM
Commit nhỏ. Khi xong, trả lời tối đa 10 dòng: số endpoint, số mã lỗi, điểm chưa chắc cần tôi quyết.
```

---

## Lệnh 2.5. Seed và kiểm tra khớp với spec

```
VAI TRÒ
Bạn là Data Engineer. Lập kế hoạch ngắn rồi làm. Không hỏi lại tôi giữa chừng.

ĐẦU VÀO
docs/ux/08-sample-exam-spec.md (nguồn sự thật cho dữ liệu demo), docs/architecture/02-data-model.md, packages/db, packages/contracts.

VIỆC CẦN LÀM
1. Tạo content/exams/demo-b1-mock-02.json: một đề mẫu 30 câu đúng theo bảng ở mục 4 của 08-sample-exam-spec.md (Lesen câu 1–15, Hören câu 16–30; các Teil, số lượt nghe, thời gian như trong spec). Nội dung chữ là chữ giả/ngắn mô phỏng ("Beispielfrage n", "Beispieltext"), TUYỆT ĐỐI không chép đề thật của Goethe, telc, ÖSD hay giáo trình. Gắn cờ is_demo = true. Lời giải tiếng Việt cho câu 1–2 là công khai, câu 3–30 là bị khóa (nội dung giả). Audio chỉ là bản ghi tài nguyên giữ chỗ (khóa lưu trữ giả), không cần file thật.
2. File JSON được kiểm bằng schema Zod (đặt trong packages/db hoặc packages/testing, không đặt trong contracts của API). Tính content_hash cho phiên bản đề.
3. Seed runner (Node/TypeScript, idempotent): chạy lại không nhân đôi dữ liệu (so theo content_hash). Đưa phiên bản đề đi qua đủ các trạng thái draft → ai_checked → teacher_approved → published, ghi content_reviews với tác nhân "seed". Mặc định số câu giải thích công khai là 2 lấy từ cấu hình, không hardcode.
4. Fixture phiên làm bài mẫu: tạo phiên làm bài với đúng các lựa chọn ở cột "Người dùng chọn" trong spec, kèm kết quả kỳ vọng.
5. Test khớp spec (chạy trên Postgres thật, dùng role shd_grader): tính điểm bằng cách nối attempt_answers với answer_keys và kiểm tổng = 21/30, Lesen = 12/15, Hören = 9/15. Kiểm từng câu: test ĐỌC bảng Markdown trong 08-sample-exam-spec.md làm chuẩn đối chiếu (parse bảng), so với đáp án và kết quả trong DB. Nếu ai sửa spec mà không sửa seed (hoặc ngược lại), test phải fail.
6. Test vòng đời: không thể xuất bản phiên bản đề không có phần/câu hỏi; sau khi xuất bản không sửa được nội dung.
7. Script db:seed và cập nhật README (cách nạp đề mẫu).

TIÊU CHÍ HOÀN THÀNH
db:reset rồi db:migrate rồi db:seed chạy sạch hai lần liên tiếp mà không nhân đôi dữ liệu; test khớp spec xanh; không có nội dung đề thật nào trong repo.

CÁCH LÀM
Commit nhỏ. Không dữ liệu cá nhân thật. Khi xong, trả lời tối đa 10 dòng.
```

---

## Lệnh 2.6. Kiểm thử bảo mật dữ liệu

```
VAI TRÒ
Bạn là Security QA Engineer. Mục tiêu là CỐ GẮNG PHÁ thiết kế dữ liệu, rồi viết test để nó không bị phá. Lập kế hoạch ngắn rồi làm. Không hỏi lại tôi giữa chừng.

ĐẦU VÀO
docs/architecture/02-data-model.md (danh sách bất biến INV-xx và ma trận quyền), packages/db, nội dung seed.

VIỆC CẦN LÀM
Viết test bằng Vitest trên Postgres thật, mỗi nhóm kết nối bằng đúng role cần kiểm (shd_app, shd_grader, shd_worker, shd_readonly, shd_migrator):
1. Quyền: shd_app đọc answer_keys phải bị từ chối (mã lỗi 42501); shd_app không sửa được phiên bản đề đã xuất bản, không xóa được audit_logs, consents; shd_grader đọc được answer_keys nhưng KHÔNG đọc được learners, guardians, leads; shd_readonly chỉ đọc được view và SĐT trong view đã che.
2. Bất biến nội dung: mọi INSERT/UPDATE/DELETE trên bảng con của phiên bản đề đã xuất bản đều thất bại; một đề không thể có hai phiên bản đang xuất bản; chuyển trạng thái sai thứ tự bị chặn.
3. Sổ cái đồng ý: không sửa/xóa được; v_current_consents đúng sau chuỗi cho → rút → cho lại.
4. Khả năng liên hệ: v_contactable_leads LOẠI các trường hợp: thiếu đồng ý tư vấn, SĐT chưa xác thực, người học dưới 18 tuổi chưa có phụ huynh xác nhận, xác nhận của phụ huynh đã hết hạn hoặc bị từ chối, đồng ý đã rút. Và BAO GỒM trường hợp hợp lệ. Mỗi trường hợp một test riêng.
5. OTP: chỉ lưu bản băm (quét cột để chắc không có mã thô); số lần thử và số lần gửi lại bị giới hạn bằng ràng buộc hoặc truy vấn kiểm; thử thách hết hạn không dùng lại được.
6. Outbox: khóa idempotency trùng bị từ chối; hai kết nối đồng thời lấy việc bằng FOR UPDATE SKIP LOCKED nhận về các dòng KHÁC nhau (không trùng); dòng quá số lần thử chuyển sang trạng thái dead.
7. Làm bài: UNIQUE (attempt_id, question_id); revision không được lùi (ghi chồng cũ hơn bị từ chối); không thể nộp bài hai lần; lượt nghe vượt số cho phép bị từ chối ở tầng dữ liệu hoặc truy vấn kiểm.
8. Ẩn danh hóa: sau anonymize_learner không còn PII ở bất kỳ bảng nào (liệt kê bảng và quét cột), thống kê tổng hợp vẫn còn, có dòng audit_logs.
9. Quét rò rỉ: script quét toàn bộ cột và view mà shd_app/shd_readonly đọc được để cảnh báo nếu có cột tên giống PII chưa được che hoặc chưa được phân loại trong tài liệu.
10. Bảng bao phủ: tạo docs/architecture/02-invariant-coverage.md ánh xạ từng INV-xx tới test tương ứng. Bất biến nào chưa có test phải được liệt kê rõ lý do. Đừng giả vờ đã bao phủ hết.
11. Nếu trong quá trình viết test phát hiện lỗ hổng thiết kế, SỬA migration (bằng migration mới, không sửa migration cũ), cập nhật tài liệu và ghi vào docs/ux/06-change-log.md hoặc docs/architecture/step2-findings.md.

TIÊU CHÍ HOÀN THÀNH
check:all xanh; test thất bại khi cố tình nới lỏng quyền (chứng minh bằng một test "cố phá" tạm thời, rồi hoàn lại); bảng bao phủ trung thực.

CÁCH LÀM
Commit nhỏ. Khi xong, trả lời tối đa 10 dòng: lỗ hổng tìm được và đã vá, bất biến chưa có test, rủi ro còn lại.
```

---

## Lệnh 2.7. Đóng bước 2

Sau lệnh này, **gửi mình `docs/architecture/step2-report.md`, `02-invariant-coverage.md` và danh sách quyết định còn mở**.

```
VAI TRÒ
Bạn là Tech Lead kiểm tra chất lượng trước khi đóng bước 2. Lập kế hoạch ngắn rồi làm. Không hỏi lại tôi giữa chừng. Chỉ viết tài liệu, kiểm chứng và sửa lỗi nhỏ; KHÔNG thêm tính năng.

VIỆC CẦN LÀM
1. ADR ngắn (tối đa 1 trang mỗi file, tiếng Việt) trong docs/adr/: 0001 monolith dạng module trong monorepo; 0002 migration là nguồn sự thật và mô hình role DB; 0003 ID và thời gian; 0004 xử lý PII, băm SĐT và sổ cái đồng ý; 0005 cổng lead và quyền xem lời giải là dữ liệu; 0006 outbox cho đồng bộ CRM; 0007 phiên bản đề bất biến; 0008 vì sao chưa hỗ trợ tạm dừng đồng hồ. Mỗi ADR có: bối cảnh, quyết định, hệ quả, phương án đã loại, điều kiện cần xem lại.
2. Kiểm chứng từ bản clone sạch: clone repo vào một thư mục mới, chạy theo đúng README: pnpm install, setup:env, db:up, db:migrate, db:seed, check:all. Ghi lệnh, kết quả và thời gian chạy vào docs/architecture/step2-report.md. Nếu có bước nào hỏng hoặc cần thao tác thủ công ngoài README, sửa README.
3. docs/architecture/01-system-architecture-overview.md (ngắn, có sơ đồ Mermaid): các thành phần, hướng phụ thuộc, luồng chính (làm bài và chấm, cổng lead, đồng bộ CRM).
4. Ma trận truy vết trong step2-report.md: màn hình wireframe ↔ endpoint ↔ bảng. Chỉ ra chỗ nào còn thiếu.
5. Danh sách quyết định kinh doanh/pháp lý còn mở, gộp từ docs/ux/00-assumptions.md và các điểm "Cần duyệt" của tài liệu dữ liệu, mỗi mục có: câu hỏi, ai cần quyết, ảnh hưởng nếu chậm quyết. Gồm tối thiểu: thời hạn lưu trữ dữ liệu, có lưu IP hay không, hiệu lực OTP, thời gian riêng từng phần của đề, tạm dừng đồng hồ, chế độ Luyện tập ở MVP, quy trình liên hệ người dưới 18 tuổi, chính sách nuôi dưỡng lead không đồng ý tiếp thị.
6. Báo cáo trung thực: những gì đã kiểm được, chưa kiểm được, giới hạn đã biết (ví dụ chưa thử tải, chưa kiểm trên môi trường production).
7. Đặt git tag step2-complete sau khi mọi thứ xanh.

TIÊU CHÍ HOÀN THÀNH
Bản clone sạch chạy được toàn bộ quy trình theo README; check:all xanh; mọi ADR có đủ năm mục; báo cáo không có phần nào tô hồng.

CÁCH LÀM
Commit nhỏ. Khi xong, trả lời tối đa 10 dòng: kết quả chạy từ bản clone sạch, các điểm còn mở quan trọng nhất.
```
