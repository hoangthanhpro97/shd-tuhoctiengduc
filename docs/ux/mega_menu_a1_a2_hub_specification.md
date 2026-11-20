# ĐẶC TẢ THIẾT KẾ: HỆ THỐNG MEGA MENU, A1-A2 HUB & HERO QUICK FILTER
**Dự án:** `shd-tuhoctiengduc` (SHD Education)  
**Mục tiêu:** Quy chuẩn hóa toàn bộ cấu trúc điều hướng phân cấp (Hierarchical Navigation) chuẩn DOL Tự Học, trang tổng hợp A1–A2 6 hàng và bộ lọc nhanh trang chủ.

---

## 1. NGUYÊN TẮC THƯƠNG HIỆU & DESIGN SYSTEM
- **Phông chữ:** Montserrat toàn cục (`font-sans`).
- **Màu thương hiệu chủ đạo:** Đỏ SHD `#da2527` (`rgb(218, 37, 39)`), kết hợp các sắc độ `hover:bg-[#b81e20]`, nền nhạt `bg-red-50`, viền `border-red-200`.
- **Thẻ Card:** Nền trắng `bg-white`, bo góc lớn `rounded-2xl`, viền mỏng `border border-slate-200`, đổ bóng mềm `shadow-sm` hoặc `shadow-xl` khi bay nổi (dropdown).
- **Trạng thái Active:** Gạch chân hoặc chữ đỏ `#da2527` khi đường dẫn hiện tại khớp với tiền tố danh mục (`pathname.startsWith(...)`).

---

## 2. KIẾN TRÚC MEGA MENU (SITEHEADER)

### 2.1. Cấu Trúc Tổng Thể Của Thanh Navigation
```text
THANH ĐIỀU HƯỚNG CHÍNH (Sticky Header)
├── Trang chủ (/)
├── Đề thi (/de-thi) ──────────────► Mega Menu 4 Cột (Goethe | ÖSD | TELC | A1-A2)
├── Luyện nghe (/luyen-nghe) ──────► Mega Menu 2 Cột (Goethe | ÖSD)
├── Luyện đọc (/luyen-doc) ────────► Mega Menu 2 Cột (Goethe | ÖSD)
├── Chép chính tả (/chep-chinh-ta) ─► Link trực tiếp
└── Bài mẫu (/bai-mau) ────────────► Mega Menu 2 Cột (Goethe | ÖSD)
```

---

### 2.2. Chi Tiết Menu "ĐỀ THI" (Khung Dropdown 4 Cột)
- **Container Dropdown:** `w-[920px] grid grid-cols-4 gap-4 p-5 bg-white rounded-2xl shadow-2xl border border-slate-200`
- **Định vị:** `absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50`

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ĐỀ THI THỬ ĐA CHUẨN                                       │
├───────────────────┬───────────────────┬───────────────────┬─────────────────────────────────────┤
│   CỘT 1: GOETHE   │    CỘT 2: ÖSD     │    CỘT 3: TELC    │       CỘT 4: CẤP ĐỘ A1 - A2         │
├───────────────────┼───────────────────┼───────────────────┼─────────────────────────────────────┤
│ [Goethe B1]       │ [ÖSD B1]          │ [TELC B1]         │ ┌─────────────────────────────────┐ │
│ • Modellsatz B1   │ • Zertifikat B1   │ • Übungstest B1   │ │ CẤP ĐỘ A1 - A2                  │ │
│ • Luyện thi 4 Teil│ • Đề ZB1 / ZDÖ    │ • Trắc nghiệm     │ │ Kho đề thi nền tảng ──►         │ │
│                   │                   │                   │ │ (Trỏ thẳng vào /de-thi/a1-a2)   │ │
│ [Goethe B2]       │ [ÖSD B2]          │ [TELC B2]         │ └─────────────────────────────────┘ │
│ • Modellsatz B2   │ • Zertifikat B2   │ • Übungstest B2   │ • Đề thi Goethe A1 - A2             │
│ • Full Mock Test  │ • Chuẩn Áo        │ • Thi công việc   │ • Đề thi ÖSD A1 - A2                │
│                   │                   │                   │ • Đề thi TELC A1 - A2               │
└───────────────────┴───────────────────┴───────────────────┴─────────────────────────────────────┘
```

**Mã nguồn JSX mẫu Cột 4 (A1 - A2):**
```tsx
<div className="space-y-3 border-l border-slate-100 pl-4">
  <Link 
    href="/de-thi/a1-a2"
    className="block p-3 rounded-xl bg-red-50/80 border border-red-200 hover:bg-red-100 transition-all group/a1a2"
  >
    <div className="text-[11px] font-bold text-[#da2527] uppercase tracking-wider">Cấp độ A1 - A2</div>
    <div className="text-xs font-semibold text-slate-800 group-hover/a1a2:text-[#da2527] mt-0.5">
      Kho đề thi nền tảng →
    </div>
    <p className="text-[10px] text-slate-500 mt-1">Đầy đủ chuẩn Goethe, ÖSD, TELC</p>
  </Link>
  <div className="space-y-1">
    <Link href="/de-thi/a1-a2#goethe" className="block text-xs font-medium text-slate-700 hover:text-[#da2527] hover:bg-red-50/50 p-1.5 rounded-lg transition-all">
      Đề thi Goethe A1 - A2
    </Link>
    <Link href="/de-thi/a1-a2#osd" className="block text-xs font-medium text-slate-700 hover:text-[#da2527] hover:bg-red-50/50 p-1.5 rounded-lg transition-all">
      Đề thi ÖSD A1 - A2
    </Link>
    <Link href="/de-thi/a1-a2#telc" className="block text-xs font-medium text-slate-700 hover:text-[#da2527] hover:bg-red-50/50 p-1.5 rounded-lg transition-all">
      Đề thi TELC A1 - A2
    </Link>
  </div>
</div>
```

---

### 2.3. Chi Tiết Menu "BÀI MẪU" (Khung Dropdown 2 Cột Đối Xứng)
- **Container Dropdown:** `w-[580px] grid grid-cols-2 gap-6 p-5 bg-white rounded-2xl shadow-2xl border border-slate-200`

| Cột 1: GOETHE | Cột 2: ÖSD |
| :--- | :--- |
| **SCHREIBEN GOETHE** (Phần trên)<br>• Bài mẫu Schreiben Goethe B1 (`/bai-mau-schreiben/goethe-b1`)<br>• Bài mẫu Schreiben Goethe B2 (`/bai-mau-schreiben/goethe-b2`) | **SCHREIBEN ÖSD** (Phần trên)<br>• Bài mẫu Schreiben ÖSD B1 (`/bai-mau-schreiben/osd-b1`)<br>• Bài mẫu Schreiben ÖSD B2 (`/bai-mau-schreiben/osd-b2`) |
| *--- Đường kẻ phân cách nhạt (`border-slate-100`) ---* | *--- Đường kẻ phân cách nhạt (`border-slate-100`) ---* |
| **SPRECHEN GOETHE** (Phần dưới)<br>• Bài mẫu Sprechen Goethe B1 (`/bai-mau-sprechen/goethe-b1`)<br>• Bài mẫu Sprechen Goethe B2 (`/bai-mau-sprechen/goethe-b2`) | **SPRECHEN ÖSD** (Phần dưới)<br>• Bài mẫu Sprechen ÖSD B1 (`/bai-mau-sprechen/osd-b1`)<br>• Bài mẫu Sprechen ÖSD B2 (`/bai-mau-sprechen/osd-b2`) |

---

### 2.4. Chi Tiết Menu "LUYỆN NGHE" & "LUYỆN ĐỌC" (Khung Dropdown 2 Cột)
- **Container:** `w-[540px] grid grid-cols-2 gap-5 p-5 bg-white rounded-2xl shadow-xl border border-slate-200`
- **Cột 1 (Goethe):**
  - Nhóm B1 (Trên): Luyện tập chuyên sâu B1 kèm transcript song ngữ.
  - Nhóm B2 (Dưới): Luyện tập nâng cao B2 phân tích bẫy từ vựng.
- **Cột 2 (ÖSD):**
  - Nhóm B1 (Trên): Luyện tập chuyên sâu ÖSD B1.
  - Nhóm B2 (Dưới): Luyện tập nâng cao ÖSD B2.

---

## 3. THIẾT KẾ TRANG HUB ĐỀ THI SƠ CẤP A1 - A2 (`/de-thi/a1-a2`)

### 3.1. Bố Cục Trang
- **Container:** `max-w-7xl mx-auto px-4 py-8 font-sans space-y-10`
- **Banner Hero:** Tiêu đề H1 "Kho Đề Thi Sơ Cấp A1 - A2", mô tả hệ thống bài thi nền tảng dành cho học viên mới bắt đầu tiếp cận tiếng Đức.
- **Thanh Neo Nhanh (Anchor Tabs):** Nút nhảy nhanh đến `[#goethe]`, `[#osd]`, `[#telc]`.

### 3.2. Cấu Trúc 6 Hàng Nội Dung (6 Horizontal Sections)
Mỗi hàng là một section độc lập gồm:
1. **Section Header:**
   - Badge thương hiệu (Goethe đỏ `#da2527`, ÖSD xanh `#1e40af`, TELC cam `#ea580c`).
   - Tiêu đề cấp độ & kỳ thi.
   - Nút "Xem tất cả →".
2. **Lưới bài thi (Exam Grid):** Hiển thị 2-3 `ExamCard` bìa sách với số câu, thời lượng và nút "Bắt đầu làm bài".

```text
HÀNG 1: Goethe-Zertifikat A1 (Start Deutsch 1) [id="goethe"]
        ├── Đề thi Goethe A1 Modellsatz 01 (Lesen & Hören)
        ├── Đề thi Goethe A1 Modellsatz 02
        └── Đề thi Goethe A1 Đọc hiểu biển báo & hình ảnh

HÀNG 2: Goethe-Zertifikat A2
        ├── Đề thi Goethe A2 Modellsatz 01
        └── Đề thi Goethe A2 Modellsatz 02

HÀNG 3: ÖSD Zertifikat A1 (ZA1) [id="osd"]
        ├── Đề thi ÖSD ZA1 Modellsatz 01 (Chuẩn Áo)
        └── Đề thi ÖSD ZA1 Modellsatz 02

HÀNG 4: ÖSD Zertifikat A2 (ZA2)
        ├── Đề thi ÖSD ZA2 Modellsatz 01
        └── Đề thi ÖSD ZA2 Modellsatz 02

HÀNG 5: TELC Deutsch A1 [id="telc"]
        ├── Đề thi TELC A1 Übungstest 01
        └── Đề thi TELC A1 Übungstest 02

HÀNG 6: TELC Deutsch A2
        ├── Đề thi TELC A2 Übungstest 01
        └── Đề thi TELC A2 Übungstest 02
```

---

## 4. ĐẶC TẢ COMPONENT HERO QUICK FILTER (`HeroQuickFilter.tsx`)

### 4.1. Vị Trí & Vai Trò
- **Vị trí:** Đặt tại Hero Section của Trang chủ (`/`), bên dưới tiêu đề H1.
- **Vai trò:** Cầu nối trực tiếp phân luồng học viên 1 chạm vào đúng bài tập mong muốn mà không cần duyệt menu.

### 4.2. Giao Diện & Trạng Thái State
- `level`: `'A1' | 'A2' | 'B1' | 'B2'` (Mặc định: `'B1'`)
- `provider`: `'goethe' | 'osd' | 'telc'` (Mặc định: `'goethe'`)
- `category`: `'de-thi' | 'luyen-nghe' | 'luyen-doc' | 'bai-mau'` (Mặc định: `'de-thi'`)

### 4.3. Ma Trận Điều Hướng (Routing Logic)
```ts
const handleSearch = () => {
  // 1. Phân luồng cấp độ A1 - A2: Nhảy thẳng về Hub A1-A2 kèm neo chứng chỉ
  if (level === 'A1' || level === 'A2') {
    router.push(`/de-thi/a1-a2#${provider}`);
    return;
  }

  // 2. Phân luồng B1 - B2 theo từng phân hệ kỹ năng
  const targetLevel = level.toLowerCase();
  switch (category) {
    case 'de-thi':
      router.push(`/de-thi/${provider}-${targetLevel}`);
      break;
    case 'luyen-nghe':
      router.push(`/luyen-nghe/${provider}-${targetLevel}`);
      break;
    case 'luyen-doc':
      router.push(`/luyen-doc/${provider}-${targetLevel}`);
      break;
    case 'bai-mau':
      router.push(`/bai-mau-schreiben/${provider}-${targetLevel}`);
      break;
  }
};
```

---

## 5. MA TRẬN ROUTE TỔNG HỢP (ROUTE MAPPING MATRIX)

| Kỹ năng / Mục | Cột 1: Goethe | Cột 2: ÖSD | Cột 3: TELC | Cột 4: A1-A2 |
| :--- | :--- | :--- | :--- | :--- |
| **Đề thi** | `/de-thi/goethe-b1`<br>`/de-thi/goethe-b2` | `/de-thi/osd-b1`<br>`/de-thi/osd-b2` | `/de-thi/telc-b1`<br>`/de-thi/telc-b2` | **`/de-thi/a1-a2`** (Hub 6 hàng) |
| **Bài mẫu Viết** | `/bai-mau-schreiben/goethe-b1`<br>`/bai-mau-schreiben/goethe-b2` | `/bai-mau-schreiben/osd-b1`<br>`/bai-mau-schreiben/osd-b2` | — | — |
| **Bài mẫu Nói** | `/bai-mau-sprechen/goethe-b1`<br>`/bai-mau-sprechen/goethe-b2` | `/bai-mau-sprechen/osd-b1`<br>`/bai-mau-sprechen/osd-b2` | — | — |
| **Luyện Nghe** | `/luyen-nghe/goethe-b1`<br>`/luyen-nghe/goethe-b2` | `/luyen-nghe/osd-b1`<br>`/luyen-nghe/osd-b2` | — | — |
| **Luyện Đọc** | `/luyen-doc/goethe-b1`<br>`/luyen-doc/goethe-b2` | `/luyen-doc/osd-b1`<br>`/luyen-doc/osd-b2` | — | — |
| **Chép chính tả** | Tuyến độc lập: `/chep-chinh-ta` | — | — | — |