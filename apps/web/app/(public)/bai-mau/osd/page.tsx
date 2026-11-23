import type { Metadata } from 'next';
import { SampleProviderSummary } from '../../../../components/model-answers/SampleProviderSummary';

export const metadata: Metadata = {
  title: 'ÖSD · Bài mẫu Schreiben & Sprechen B1 - B2 | SHD Tự Học Tiếng Đức',
  description: 'Kho bài mẫu Sprechen & Schreiben chuẩn cấu trúc đề thi ÖSD Zertifikat B1 - B2 miễn phí tại SHD Tự Học Tiếng Đức.',
};

export default function OsdSampleSummaryPage() {
  return <SampleProviderSummary provider="osd" />;
}
