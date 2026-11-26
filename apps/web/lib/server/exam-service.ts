import 'server-only';
import { ExamPublicPayloadSchema } from '@shd/contracts';
import { getExamBySlug } from './exam-content-loader';
import { getAppPool } from './db';
import { examSlugCandidates } from '../../data/exam-book-sets';

type ExamRow = {
  exam_id: string;
  exam_code: string;
  slug: string;
  title: string;
  provider_format: string;
  cefr_level: string;
  disclaimer: string;
  total_duration_minutes: number;
  pass_percentage: number;
  scoring_policy: Record<string, unknown>;
  sections: unknown;
};

const syntheticExamPattern = /synthetic|demo/i;

function isPublicExamRow(row: Pick<ExamRow, 'slug' | 'title' | 'provider_format'>) {
  const searchable = `${row.slug} ${row.title} ${row.provider_format}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase();
  return (searchable.includes('osd') || searchable.includes('oesd') || searchable.includes('goethe')) && !syntheticExamPattern.test(searchable);
}

export async function getPublicExamBySlug(slug: string) {
  try {
    const resolvedSlugs = examSlugCandidates(slug);
    const result = await getAppPool().query<ExamRow>(
    `SELECT
       e.id AS exam_id,
       e.code AS exam_code,
       e.slug,
       e.title,
       e.provider_format,
       l.code AS cefr_level,
       e.description AS disclaimer,
       ROUND(e.time_limit_seconds / 60.0)::int AS total_duration_minutes,
       e.passing_percentage::float AS pass_percentage,
       e.benchmark_scale_config -> 'scoringPolicy' AS scoring_policy,
       COALESCE(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
         'sectionId', s.source_section_id,
         'skill', sk.code,
         'title', s.title,
         'durationMinutes', ROUND(s.time_limit_seconds / 60.0)::int,
         'totalQuestions', (SELECT count(*) FROM questions sq WHERE sq.section_id = s.id),
         'stimulus', CASE WHEN st.id IS NULL THEN NULL ELSE jsonb_strip_nulls(jsonb_build_object(
           'type', st.stimulus_type,
           'title', st.title,
           'content', st.content_text,
           'audioUrl', a.storage_path,
           'dialogueTranscript', st.dialogue_transcript
         )) END,
         'questions', (
           SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
             'id', q.source_question_id,
             'order', q.question_order,
             'part', q.part_number,
              'prompt', q.prompt_text,
              'questionType', CASE WHEN qt.code = 'single_choice' THEN 'multiple_choice' ELSE qt.code END,
              'options', COALESCE((
                SELECT jsonb_agg(jsonb_build_object('id', qo.option_label, 'text', qo.content_text) ORDER BY qo.option_order)
                FROM question_options qo WHERE qo.question_id = q.id
              ), '[]'::jsonb),
             'publicExplanation', CASE WHEN ex.is_public_preview THEN ex.explanation_text ELSE NULL END
           )) ORDER BY q.question_order)
            FROM questions q
            JOIN question_types qt ON qt.id = q.type_id
           LEFT JOIN explanations ex ON ex.question_id = q.id
           WHERE q.section_id = s.id
         )
       )) ORDER BY s.section_order), '[]'::jsonb) AS sections
     FROM exams e
     JOIN levels l ON l.id = e.level_id
     JOIN exam_versions ev ON ev.exam_id = e.id AND ev.status = 'published'
     JOIN sections s ON s.version_id = ev.id
     JOIN skills sk ON sk.id = s.skill_id
     LEFT JOIN stimuli st ON st.section_id = s.id AND st.part_number = 1
     LEFT JOIN assets a ON a.id = st.asset_id
      WHERE e.slug = ANY($1::text[]) AND e.is_active = true
     GROUP BY e.id, e.code, e.slug, e.title, e.provider_format, l.code, e.description,
       e.time_limit_seconds, e.passing_percentage, e.benchmark_scale_config`,
      [resolvedSlugs],
     );
      const row = result.rows[0];
      if (!row) return getExamBySlug(slug);
     if (!isPublicExamRow(row)) return null;
    const scoringPolicy = row.scoring_policy ?? {};
    return ExamPublicPayloadSchema.parse({
    examMetadata: {
      examId: row.exam_code,
      slug: row.slug,
      title: row.title,
      cefrLevel: row.cefr_level,
      providerFormat: row.provider_format,
      disclaimer: row.disclaimer,
      totalDurationMinutes: row.total_duration_minutes,
      passPercentage: row.pass_percentage,
      scoringPolicy: {
        lesenMaxPoints: Number(scoringPolicy.lesenMaxPoints ?? 0),
        hoerenMaxPoints: Number(scoringPolicy.hoerenMaxPoints ?? 0),
        minPassingScorePerSkill: Number(scoringPolicy.minPassingScorePerSkill ?? 0),
      },
    },
    sections: row.sections,
    });
  } catch (error) {
    console.warn(`Falling back to file exam content for ${slug}:`, error instanceof Error ? error.message : error);
    return getExamBySlug(slug);
  }
}
