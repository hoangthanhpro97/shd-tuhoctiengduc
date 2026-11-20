import { describe, expect, it } from 'vitest';
import {
  shouldShowGlobalAnnouncementBar,
  shouldShowHeroAnnouncementBar,
  shouldShowPromoBanners,
} from '../lib/banner-visibility';

describe('Promotional banner visibility policy', () => {
  const allowedGlobalRoutes = [
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
  ];

  const allowedHeroRoutes = [
    '/de-thi',
    '/de-thi/osd',
    '/luyen-doc',
    '/luyen-doc/osd',
    '/luyen-nghe',
    '/luyen-nghe/osd',
    '/bai-mau',
    '/bai-mau-schreiben',
    '/bai-mau-sprechen',
  ];

  const strictlyForbiddenRoutes = [
    // Không gian tập đề / chi tiết đề / giải thích / đáp án
    '/de-thi/osd-zb1-tap-1',
    '/de-thi/osd-zb1-tap-4',
    '/de-thi/osd-b1-test-15',
    '/de-thi/osd-b1-test-15/de-va-dap-an',
    '/de-thi/osd-b1-test-15/giai-thich',
    // Phòng thi & phòng luyện full-screen
    '/lam-bai/local-osd-b1-test-15-exam-lesen-123',
    '/lam-bai/local-osd-b2-test-10-exam-hoeren-456',
    '/luyen-doc/osd-b1-mock-01-lesen-1/lam-bai',
    '/luyen-nghe/osd-b1-mock-01-hoeren-1/lam-bai',
    // Không gian ôn tập luyện đề lẻ
    '/luyen-doc/osd-b1-mock-01-lesen-1',
    '/luyen-nghe/osd-b1-mock-01-hoeren-1',
    '/bai-mau-schreiben/goethe-b1-email-freund',
    '/bai-mau-sprechen/goethe-b1-teil-1-party-planen',
    // Khu vực chép chính tả
    '/chep-chinh-ta',
    '/chep-chinh-ta/diktat-a2-am-arbeitsplatz',
    // Kết quả, học tập cá nhân & tài khoản
    '/ket-qua/local-attempt-1',
    '/hoc-tap',
    '/tai-khoan',
    '/tai-khoan-pro',
  ];

  it('allows global announcement + floating banner on homepage and secondary hub pages only', () => {
    for (const route of allowedGlobalRoutes) {
      expect(shouldShowGlobalAnnouncementBar(route), route).toBe(true);
      expect(shouldShowHeroAnnouncementBar(route), route).toBe(false);
      expect(shouldShowPromoBanners(route), route).toBe(true);
    }
  });

  it('allows hero announcement + floating banner on primary catalog hub pages without duplicating global banner', () => {
    for (const route of allowedHeroRoutes) {
      expect(shouldShowHeroAnnouncementBar(route), route).toBe(true);
      expect(shouldShowGlobalAnnouncementBar(route), route).toBe(false);
      expect(shouldShowPromoBanners(route), route).toBe(true);
    }
  });

  it('strictly blocks ALL promotional banners on exam spaces, test rooms, practice workspaces, and dictation', () => {
    for (const route of strictlyForbiddenRoutes) {
      expect(shouldShowGlobalAnnouncementBar(route), route).toBe(false);
      expect(shouldShowHeroAnnouncementBar(route), route).toBe(false);
      expect(shouldShowPromoBanners(route), route).toBe(false);
    }
  });

  it('normalizes trailing slashes and query parameters cleanly', () => {
    expect(shouldShowHeroAnnouncementBar('/de-thi/osd/?ref=nav')).toBe(true);
    expect(shouldShowPromoBanners('/de-thi/osd-zb1-tap-1/?skill=lesen')).toBe(false);
    expect(shouldShowPromoBanners('/chep-chinh-ta/')).toBe(false);
    expect(shouldShowPromoBanners(null)).toBe(false);
  });
});
