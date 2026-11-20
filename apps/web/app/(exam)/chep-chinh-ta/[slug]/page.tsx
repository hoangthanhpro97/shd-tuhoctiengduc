import { notFound } from 'next/navigation';
import { DiktatWorkspace } from '../../../../components/diktat/DiktatWorkspace';
import {
  getDiktatExerciseBySlug,
  importedDiktatPackages,
  type DiktatExercisePackage,
} from '../../../../data/diktat-imported';
import { diktatExercises } from '../../../../data/learning-fixtures';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const importedPkg = getDiktatExerciseBySlug(slug);
  if (importedPkg) {
    return {
      title: `${importedPkg.title} | Chép chính tả Diktat SHD`,
      description: `${importedPkg.subtitle} · ${importedPkg.questionCount} câu trình độ B1.`,
    };
  }
  const legacy = diktatExercises.find((candidate) => candidate.slug === slug);
  if (legacy) {
    return {
      title: `${legacy.title} | Chép chính tả Diktat SHD`,
    };
  }
  return { title: 'Chép chính tả Diktat | SHD Tự học tiếng Đức' };
}

export default async function DiktatPracticeRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const importedPkg = getDiktatExerciseBySlug(slug);

  if (importedPkg) {
    return <DiktatWorkspace exercise={importedPkg} />;
  }

  // Fallback support for legacy 3 fixtures
  const legacy = diktatExercises.find((candidate) => candidate.slug === slug);
  if (!legacy) notFound();

  const adaptedPackage: DiktatExercisePackage = {
    slug: legacy.slug,
    title: legacy.title,
    subtitle: 'Luyện nghe chép chính tả và phản xạ tiếng Đức',
    level: legacy.level === 'B1' ? 'B1' : 'B1',
    questionCount: legacy.sentences.length,
    items: legacy.sentences.map((sentence, idx) => ({
      id: `legacy-${idx + 1}`,
      textDe: sentence,
      textVi: 'Bản dịch đang được cập nhật.',
      audioUrlMale: null,
      audioUrlFemale: null,
      audioUrl: '',
      wordCount: sentence.split(/\s+/u).filter(Boolean).length,
      vocabulary: [],
    })),
  };

  return <DiktatWorkspace exercise={adaptedPackage} />;
}
