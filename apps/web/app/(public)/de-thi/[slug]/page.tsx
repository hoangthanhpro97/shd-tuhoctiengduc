import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getPublicExamBySlug } from '../../../../lib/server/exam-service';
import { getPublicExamsByProviderLevel } from '../../../../lib/server/exam-content-loader';
import { ComingSoonPlaceholder, getComingSoonExam } from '../../../../components/exam/ComingSoonPlaceholder';
import { ExamDetailView } from '../../../../components/exam/ExamDetailView';
import { buildGoetheBookSets, examBookSets, getBookSetExamSlugs, getExamBookSet } from '../../../../data/exam-book-sets';

export const dynamic = 'force-dynamic';

const legacyProviderLevelSlugs = {
  'goethe-b1': { provider: 'goethe', level: 'b1' },
  'goethe-b2': { provider: 'goethe', level: 'b2' },
  'osd-b1': { provider: 'osd', level: 'b1' },
  'osd-b2': { provider: 'osd', level: 'b2' },
  'telc-b1': { provider: 'telc', level: 'b1' },
  'telc-b2': { provider: 'telc', level: 'b2' },
} as const;

function getLegacyProviderLevel(slug: string) {
  return legacyProviderLevelSlugs[slug as keyof typeof legacyProviderLevelSlugs] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const goetheBookSets = buildGoetheBookSets(await getPublicExamsByProviderLevel('goethe', 'B1'));
  const bookSet = getExamBookSet(slug, goetheBookSets);
  if (bookSet && slug === bookSet.slug) return { title: `${bookSet.title} | SHD Tự học tiếng Đức`, description: bookSet.description };
  const legacyProviderLevel = getLegacyProviderLevel(slug);
  if (legacyProviderLevel) return { title: `${legacyProviderLevel.provider.toUpperCase()} ${legacyProviderLevel.level.toUpperCase()} | SHD Tự học tiếng Đức`, alternates: { canonical: `/de-thi/${legacyProviderLevel.provider}#${legacyProviderLevel.level}` } };
  const exam = await getPublicExamBySlug(slug);
  const comingSoon = getComingSoonExam(slug);
  return exam
    ? { title: `${exam.examMetadata.title} | SHD Tự học tiếng Đức`, description: exam.examMetadata.disclaimer }
    : comingSoon
      ? { title: `${comingSoon.title} | SHD Tự học tiếng Đức`, description: comingSoon.description }
    : { title: 'Không tìm thấy đề thi | SHD Tự học tiếng Đức' };
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const legacyProviderLevel = getLegacyProviderLevel(slug);
  if (legacyProviderLevel) redirect(`/de-thi/${legacyProviderLevel.provider}#${legacyProviderLevel.level}`);
  const goetheBookSets = buildGoetheBookSets(await getPublicExamsByProviderLevel('goethe', 'B1'));
  const bookSet = getExamBookSet(slug, goetheBookSets);
  const bookSetExam = bookSet && bookSet.examSlugs.includes(slug)
    ? getBookSetExamSlugs(bookSet).find((item) => item.canonicalSlug === slug)
    : null;
  const firstSlug = bookSetExam?.sourceSlug ?? (bookSet ? getBookSetExamSlugs(bookSet)[0]?.sourceSlug : slug);
  const exam = await getPublicExamBySlug(firstSlug ?? slug);
  if (exam) {
    const set = bookSet ?? getExamBookSet(exam.examMetadata.slug, goetheBookSets);
    const isGoethe = set?.provider === 'goethe' || exam.examMetadata.providerFormat.toLowerCase().includes('goethe');
    const relatedBookSets = isGoethe ? goetheBookSets : examBookSets;
    const testSlugs = set ? getBookSetExamSlugs(set) : [{ canonicalSlug: slug, sourceSlug: exam.examMetadata.slug }];
    const tests = await Promise.all(testSlugs.map(async ({ canonicalSlug, sourceSlug }) => {
      const payload = canonicalSlug === slug || sourceSlug === exam.examMetadata.slug ? exam : await getPublicExamBySlug(sourceSlug);
      return payload ? { canonicalSlug, exam: payload } : null;
    }));
    return <ExamDetailView exam={exam} requestedSlug={slug} bookSet={set} relatedBookSets={relatedBookSets} tests={tests.filter((test): test is { canonicalSlug: string; exam: NonNullable<typeof exam> } => Boolean(test))} />;
  }
  const comingSoon = getComingSoonExam(slug);
  if (comingSoon) return <ComingSoonPlaceholder exam={comingSoon} />;
  notFound();
}
