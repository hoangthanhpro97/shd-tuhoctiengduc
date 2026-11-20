# SHD · Schreiben Module Data Contract (đề xuất)

**Mục tiêu:** Đồng bộ phân hệ Schreiben với Speaking đang sử dụng trên SHD Tự học tiếng Đức, trong khi giữ cấu trúc và rubric riêng cho từng kỳ thi.

## 1. Các nguyên tắc tương thích với `speaking-contract.md`

Giữ các tên trường chung: `id`, `slug`, `examProvider`, `level`, `part`, `taskType`, `title`, `topic`, `durationSeconds`, `instructionDe`, `instructionVi`, `bulletPoints`, `redemittel`. Trường `redemittel` giữ chính xác cấu trúc `{ phraseDe, phraseVi, category }`. Không tái sử dụng `SpeakingTaskTypeSchema` cho Schreiben: hai kỹ năng dùng **hai tập taskType khác nhau**.

Tính năng học chung có thể dùng layout SHD, lựa chọn chứng chỉ và cấp độ, lưu tiến độ, trình hiển thị DE/VI, sao chép mẫu câu. Các phần đặc thù của Schreiben là `requirements`, `outline`, `modelAnswer`, `writingTarget`, `rubric` và trình soạn thảo.

## 2. Zod schema đề xuất

```ts
import { z } from 'zod';

export const WritingExamProviderSchema = z.enum([
  'goethe_b1',
  'goethe_b2',
  'osd_zb1',
  'osd_zdo_b1',
  'osd_zb2',
]);

export const WritingTaskTypeSchema = z.enum([
  'INFORMAL_EMAIL',
  'FORUM_POST',
  'FORMAL_EMAIL',
  'REPLY_EMAIL',
  'FORMAL_MESSAGE',
  'ARGUMENTATIVE_TEXT',
]);

export const WritingRequirementSchema = z.object({
  textDe: z.string(),
  textVi: z.string(),
  functionLabel: z.string(), // Beschreiben, Begründen, Vorschlagen, ...
});

export const WritingTaskSchema = z.object({
  id: z.string(),
  slug: z.string(),
  examProvider: WritingExamProviderSchema,
  level: z.enum(['B1', 'B2']),
  part: z.number().int().min(1).max(3),
  partLabel: z.string(), // Aufgabe 1, Teil 2, Schreiben, ...
  taskType: WritingTaskTypeSchema,
  title: z.string(),
  topic: z.string(),
  durationSeconds: z.number().int().positive(),
  durationScope: z.enum(['TASK', 'MODULE']),
  instructionDe: z.string(),
  instructionVi: z.string(),
  bulletPoints: z.array(z.string()),
  requirements: z.array(WritingRequirementSchema),

  writingTarget: z.object({
    approximateWords: z.number().int().positive().nullable(),
    register: z.enum(['informal', 'formal', 'semi_formal', 'neutral']),
    textTypeLabel: z.string(),
  }),
  outline: z.array(z.object({
    section: z.string(),
    suggestionDe: z.string(),
    tipVi: z.string().optional(),
  })),
  modelAnswer: z.object({
    textDe: z.string(),
    textVi: z.string(),
    annotations: z.array(z.object({
      phraseDe: z.string(),
      explanationVi: z.string(),
    })).optional(),
  }),
  redemittel: z.array(z.object({
    phraseDe: z.string(),
    phraseVi: z.string(),
    category: z.string(),
  })),
  exercise: z.object({
    questionVi: z.string(),
    choices: z.array(z.string()),
    correctIndex: z.number().int().nonnegative(),
  }).optional(),
  rubric: z.object({
    rubricId: z.string(),
    provider: WritingExamProviderSchema,
    criteria: z.array(z.object({
      key: z.string(),
      labelDe: z.string(),
      explanationVi: z.string(),
      maxPoints: z.number().nullable().optional(),
    })),
  }),
  source: z.object({
    contentOrigin: z.enum(['SHD_AUTHORED', 'LICENSED', 'OFFICIAL_LINKED']),
    isOfficialExamTask: z.boolean(),
    officialInfoUrl: z.string().url().optional(),
    reviewerId: z.string().optional(),
    reviewedAt: z.string().optional(),
  }),
});

export type WritingTask = z.infer<typeof WritingTaskSchema>;
```

**Lưu ý kỹ thuật:** `part` là chỉ số thứ tự trong mô-đun đang chọn, còn `partLabel` là nhãn hiển thị do đơn vị khảo thí sử dụng; không giả định mọi chứng chỉ đều có ba phần. Với `durationScope = MODULE`, đồng hồ phải ghi rõ tổng thời gian mô-đun, không quảng bá là thời gian chính thức cho một Aufgabe riêng lẻ.

## 3. Mapping dạng bài theo chứng chỉ

| `examProvider` | Phần thi | `taskType` | Lưu ý |
|---|---|---|---|
| `goethe_b1` | Aufgabe 1 | `INFORMAL_EMAIL` | Email cá nhân, khoảng 80 từ |
| `goethe_b1` | Aufgabe 2 | `FORUM_POST` | Trình bày quan điểm, khoảng 80 từ |
| `goethe_b1` | Aufgabe 3 | `FORMAL_EMAIL` | Email trang trọng ngắn, khoảng 40 từ |
| `osd_zb1` | Aufgabe 1–3 | Nhóm tương ứng Goethe B1 | Tổng 60 phút cho mô-đun |
| `osd_zdo_b1` | Schreiben | `REPLY_EMAIL` | Một email trả lời với bốn gợi ý, 40 phút |
| `goethe_b2` | Teil 1–2 | `FORUM_POST`, `FORMAL_MESSAGE` | Tổng mô-đun 75 phút; kiểm tra rubric B2 riêng |
| `osd_zb2` | Aufgabe 1–2 | `FORMAL_EMAIL`, `ARGUMENTATIVE_TEXT` | Tổng mô-đun 90 phút; kiểm tra rubric ÖSD B2 riêng |

Những thông tin trên dùng để *cấu hình giao diện*, không phải một bộ rubric chung. Rubric cần dữ liệu gốc và rà soát bởi chuyên gia khảo thí trước khi dùng để chấm điểm.

Nguồn đối chiếu:
- Goethe B1 Modellsatz: https://bfu.goethe.de/b1_mod/schreiben.php
- ÖSD Zertifikat B1: https://osd.at/portfolio-item/osd-zertifikat-b1-zb1/
- ÖSD Zertifikat Deutsch Österreich B1: https://osd.at/portfolio-item/osd-zertifikat-deutsch-osterreich-b1-zdo-b1/

## 4. Tương tác và ranh giới giữa miễn phí và trả phí

- Miễn phí: đề bài, phân tích yêu cầu, bài mẫu, bản dịch, Redemittel, một bài tập nhỏ, tự viết, đếm từ, checklist và lưu bản nháp cục bộ.
- Chỉ kiểm tra tự động điều kiện **có thể xác thực trực tiếp** (ví dụ: độ dài, một số dấu hiệu lời chào/kết thư), không mặc định chấm đúng–sai nội dung bằng regex.
- Giai đoạn thương mại: CTA “Nhận góp ý bài viết” dẫn đến dịch vụ giáo viên/AI đã được kiểm chứng, kết nối tài khoản/CRM/đặt lịch khi backend sẵn sàng.
- Theo dõi funnel: `writing_lesson_view`, `writing_sample_open`, `writing_started`, `writing_selfcheck`, `writing_review_cta_click`, `writing_lead_created`, `writing_purchase_completed`.

## 5. Trạng thái prototype HTML hiện tại

`SHD_Schreiben_Hub.html` là bản giao diện tương tác độc lập, có lựa chọn Goethe B1/B2, ÖSD ZB1/ZDÖ B1/B2, đổi nhiệm vụ, timer, ghi chú, checklist, dàn ý, bài mẫu, bản dịch, bài tập lựa chọn, soạn thảo và tự lưu cục bộ. Chưa có backend tài khoản, đánh giá ngữ nghĩa, giáo viên, CRM hay thanh toán. Các đề trong prototype là ví dụ minh họa tự biên soạn.
