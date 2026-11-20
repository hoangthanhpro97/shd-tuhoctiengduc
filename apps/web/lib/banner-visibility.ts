// Centralized allowlist controlling where promotional/advertising banners
// (`TopAnnouncementBar` and `FloatingSupportBar`) are permitted to appear.
//
// Policy:
// - ONLY allowed on the Homepage (`/`) and top-level catalog/hub pages ("trang tổng").
// - STRICTLY FORBIDDEN on exam spaces (`/de-thi/[slug]`, `/de-va-dap-an`, `/giai-thich`),
//   live exam & practice rooms (`/lam-bai/[attemptId]`, `/[skill]/[slug]/lam-bai`),
//   individual skill practice pages (`/luyen-doc/[slug]`, `/luyen-nghe/[slug]`,
//   `/bai-mau-schreiben/[slug]`, `/bai-mau-sprechen/[slug]`),
//   all dictation pages (`/chep-chinh-ta`, `/chep-chinh-ta/[slug]`),
//   result pages (`/ket-qua/[attemptId]`), personal learning dashboard (`/hoc-tap`),
//   and account pages (`/tai-khoan`, `/tai-khoan-pro`).

/** Hub pages that render `<TopAnnouncementBar placement="hero" />` inside their own Hero header. */
export const HERO_ANNOUNCEMENT_ROUTES = new Set<string>([
  '/de-thi',
  '/de-thi/osd',
  '/luyen-doc',
  '/luyen-doc/osd',
  '/luyen-nghe',
  '/luyen-nghe/osd',
  '/bai-mau',
  '/bai-mau-schreiben',
  '/bai-mau-sprechen',
]);

/** Homepage and remaining hub pages that render `<TopAnnouncementBar placement="global" />` via SiteHeader. */
export const GLOBAL_ANNOUNCEMENT_ROUTES = new Set<string>([
  '/',
  '/de-thi/goethe',
  '/de-thi/telc',
  '/de-thi/a1-a2',
  '/luyen-doc/goethe',
  '/luyen-doc/telc',
  '/luyen-nghe/goethe',
  '/luyen-nghe/telc',
  '/bai-mau/osd',
  '/bai-mau/goethe',
  '/bai-mau/telc',
]);

export function normalizeBannerPathname(pathname: string | null | undefined): string {
  if (!pathname) return '';
  const withoutQuery = pathname.split(/[?#]/u)[0] ?? '';
  if (withoutQuery === '/') return '/';
  return withoutQuery.replace(/\/+$/u, '');
}

export function shouldShowHeroAnnouncementBar(pathname: string | null | undefined): boolean {
  return HERO_ANNOUNCEMENT_ROUTES.has(normalizeBannerPathname(pathname));
}

export function shouldShowGlobalAnnouncementBar(pathname: string | null | undefined): boolean {
  return GLOBAL_ANNOUNCEMENT_ROUTES.has(normalizeBannerPathname(pathname));
}

export function shouldShowPromoBanners(pathname: string | null | undefined): boolean {
  const normalized = normalizeBannerPathname(pathname);
  return GLOBAL_ANNOUNCEMENT_ROUTES.has(normalized) || HERO_ANNOUNCEMENT_ROUTES.has(normalized);
}
