import { describe, expect, it } from 'vitest';
import { importedDiktatPackages, getDiktatExerciseBySlug } from '../data/diktat-imported';
import fs from 'node:fs';
import path from 'node:path';

describe('Diktat 5-Package & Audio Verification', () => {
  it('has exactly 5 packages with 77 total unique sentences', () => {
    expect(importedDiktatPackages).toHaveLength(5);
    const totalSentences = importedDiktatPackages.reduce((acc, pkg) => acc + pkg.items.length, 0);
    expect(totalSentences).toBe(77);
  });

  it('has dual-voice package with 15 dual-voice sentences', () => {
    const dualPkg = getDiktatExerciseBySlug('diktat-b1-phan-xa-song-giong');
    expect(dualPkg).toBeDefined();
    expect(dualPkg?.items).toHaveLength(15);
    dualPkg?.items.forEach((item) => {
      expect(item.audioUrlMale).toBeTruthy();
      expect(item.audioUrlFemale).toBeTruthy();
      expect(item.audioUrlMale).toContain('/audio/diktat/nam-');
      expect(item.audioUrlFemale).toContain('/audio/diktat/nu-');
    });
  });

  it('audio URLs conform to valid /audio/diktat/ path format', () => {
    importedDiktatPackages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        if (item.audioUrlMale) {
          expect(item.audioUrlMale).toMatch(/^\/audio\/diktat\/nam-\d{2}\.mp3$/);
        }
        if (item.audioUrlFemale) {
          expect(item.audioUrlFemale).toMatch(/^\/audio\/diktat\/nu-\d{2}\.mp3$/);
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
        if (item.audioUrlMale) {
          const filePath = path.join(publicAudioDir, item.audioUrlMale.replace(/^\//, ''));
          expect(fs.existsSync(filePath), `Missing male audio: ${filePath}`).toBe(true);
        }
        if (item.audioUrlFemale) {
          const filePath = path.join(publicAudioDir, item.audioUrlFemale.replace(/^\//, ''));
          expect(fs.existsSync(filePath), `Missing female audio: ${filePath}`).toBe(true);
        }
      });
    });
  });

  it('all 5 packages are retrievable by slug', () => {
    const slugs = [
      'diktat-b1-phan-xa-song-giong',
      'diktat-b1-giao-tiep-phan-xa',
      'diktat-b1-truong-hoc-cong-viec',
      'diktat-b1-tinh-huong-xa-hoi',
      'diktat-b1-cau-phuc-menh-de-phu',
    ];
    slugs.forEach((slug) => {
      const found = getDiktatExerciseBySlug(slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(slug);
      expect(found?.level).toBe('B1');
    });
  });
});
