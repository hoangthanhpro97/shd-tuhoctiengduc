# Homepage Verification

## Trạng thái

Build và typecheck đã chạy đạt. Repository không có Playwright nên chưa chụp ảnh; không tự cài phần mềm theo yêu cầu.

## Đầu ra đã chạy

- `pnpm install`: thành công, workspace nhận diện 9 project.
- Historical snapshot: the former standalone frontend was later merged into `apps/web`.
- Current verification command: `pnpm --filter @shd/web build`.
- `pnpm exec vitest run apps/web/tests/demo.test.mjs`: 3 tests passed.
- `pnpm exec vitest run`: 8 test files passed, 11 tests passed; gồm test bảo vệ payload homepage.
- Current dev command: `pnpm web:dev`.
- `Invoke-WebRequest http://localhost:3100`: HTTP 200.

## Lệnh cần chạy sau khi cài dependency

```powershell
pnpm install
pnpm web:dev
pnpm --filter @shd/web build
pnpm typecheck
```

## Mốc cần kiểm

- 375px: header drawer, horizontal card scroller, cookie banner.
- 1280px: hero deck, floating actions, bốn cột footer.
- Payload homepage không chứa `correct`, `answerKey`, `isCorrect`.
