import type { Metadata } from 'next';
import { SampleProviderSummary } from '../../../../components/model-answers/SampleProviderSummary';

export const metadata: Metadata = {
  title: 'telc · Bài mẫu Schreiben & Sprechen B1 - B2 | SHD Tự Học Tiếng Đức',
  description: 'Kho bài mẫu Sprechen & Schreiben chuẩn cấu trúc đề thi telc Deutsch B1 - B2 miễn phí tại SHD Tự Học Tiếng Đức.',
};

export default function TelcSampleSummaryPage() {
  return <SampleProviderSummary provider="telc" />;
}
