import { notFound, redirect } from 'next/navigation';
import { getSkillExercise } from '../../../../lib/server/exam-content-loader';
import { LearningDetail } from '../../../../components/learning/LearningDetail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = await getSkillExercise('Lesen', slug); return { title: item ? `${item.title} | SHD Tự học tiếng Đức` : 'Bài luyện đọc' }; }
export default async function ReadingDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const legacy = /^(osd|goethe)-(b1|b2)$/i.exec(slug); if (legacy) redirect(`/luyen-doc/${legacy[1].toLowerCase()}#${legacy[2].toLowerCase()}`); const item = await getSkillExercise('Lesen', slug); if (!item) notFound(); return <LearningDetail exercise={item} />; }
