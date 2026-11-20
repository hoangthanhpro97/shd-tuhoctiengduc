import { ComingSoonPlaceholder } from '../../../../components/exam/ComingSoonPlaceholder';

export const metadata = {
  title: 'Kho đề A1 - A2 | SHD Tự học tiếng Đức',
  description: 'Các bộ đề A1 - A2 đang được cập nhật.',
};

export default function A1A2ExamHubPage() {
  return <ComingSoonPlaceholder exam={{ slug: 'a1-a2', provider: 'SHD', level: 'A1', title: 'Kho đề A1 - A2', description: 'Các bộ đề Goethe, ÖSD và TELC trình độ A1 - A2 đang được biên tập và sẽ mở sau khi hoàn tất kiểm duyệt.' }} />;
}
