import { describe, expect, it } from 'vitest';
import { importedDiktatPackages, getDiktatExerciseBySlug } from '../data/diktat-imported';
import fs from 'node:fs';
import path from 'node:path';

describe('Diktat 11-Package & Audio Dynamic Verification', () => {
  it('has exactly 11 packages with 172 total items', () => {
    expect(importedDiktatPackages).toHaveLength(11);
    const totalSentences = importedDiktatPackages.reduce((acc, pkg) => acc + pkg.items.length, 0);
    expect(totalSentences).toBe(172);

    // 7 packages with 16 items, 4 packages with 15 items
    const pkgSizes = importedDiktatPackages.map((p) => p.items.length);
    expect(pkgSizes.filter((s) => s === 16)).toHaveLength(7);
    expect(pkgSizes.filter((s) => s === 15)).toHaveLength(4);
  });

  it('each package has interleaved male and female voices and no duplicate text', () => {
    importedDiktatPackages.forEach((pkg) => {
      const textsInPkg = new Set<string>();
      let maleCount = 0;
      let femaleCount = 0;

      pkg.items.forEach((item) => {
        // Zero duplicate text in any package
        const normalized = item.textDe.toLowerCase().replace(/[.,!?–-]/gu, '').replace(/\s+/gu, ' ').trim();
        expect(textsInPkg.has(normalized), `Duplicate text in package ${pkg.slug}: ${item.textDe}`).toBe(false);
        textsInPkg.add(normalized);

        if (item.voice === 'male') {
          maleCount++;
          expect(item.audioUrlMale).toBeTruthy();
          expect(item.audioUrl).toContain('nam-');
        } else {
          femaleCount++;
          expect(item.audioUrlFemale).toBeTruthy();
          expect(item.audioUrl).toContain('nu-');
        }
      });

      // Both voices are present in every package
      expect(maleCount).toBeGreaterThan(0);
      expect(femaleCount).toBeGreaterThan(0);
    });
  });

  it('audio URLs conform to valid /audio/diktat/ 3-digit path format', () => {
    importedDiktatPackages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        expect(item.audioUrl).toMatch(/^\/audio\/diktat\/(nam|nu)-\d{3}\.mp3$/);
        if (item.audioUrlMale) {
          expect(item.audioUrlMale).toMatch(/^\/audio\/diktat\/nam-\d{3}\.mp3$/);
        }
        if (item.audioUrlFemale) {
          expect(item.audioUrlFemale).toMatch(/^\/audio\/diktat\/nu-\d{3}\.mp3$/);
        }
      });
    });
  });

  it('verifies audio files on disk when audio directory is present', () => {
    const publicAudioDir = path.resolve(__dirname, '../public');
    const diktatDir = path.join(publicAudioDir, 'audio', 'diktat');
    if (!fs.existsSync(diktatDir)) {
      // In CI, public/audio/ is in .gitignore so audio assets are hosted on CDN/storage
      return;
    }
    importedDiktatPackages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        const filePath = path.join(publicAudioDir, item.audioUrl.replace(/^\//, ''));
        expect(fs.existsSync(filePath), `Missing audio: ${filePath}`).toBe(true);
      });
    });
  });

  it('all 11 packages and legacy aliases are retrievable by slug', () => {
    for (let i = 1; i <= 11; i++) {
      const slug = `diktat-b1-bai-${String(i).padStart(2, '0')}`;
      const found = getDiktatExerciseBySlug(slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(slug);
      expect(found?.level).toBe('B1');
    }

    // Verify legacy aliases resolve
    const legacySlugs = [
      'diktat-b1-phan-xa-song-giong',
      'diktat-b1-giao-tiep-phan-xa',
      'diktat-b1-truong-hoc-cong-viec',
      'diktat-b1-tinh-huong-xa-hoi',
      'diktat-b1-cau-phuc-menh-de-phu',
    ];
    legacySlugs.forEach((slug) => {
      const found = getDiktatExerciseBySlug(slug);
      expect(found).toBeDefined();
    });
  });
});
