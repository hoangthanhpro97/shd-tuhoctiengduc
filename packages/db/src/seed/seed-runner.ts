import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createDatabasePool, loadLocalEnv } from '../client.js';
import { loadSeedFixtures } from './seed-preflight.js';
import { getQuestionPoints, getQuestionTypeCode, getSkillName, getStandardCode, getStimulusAssetPath, getStimulusContent, getTrackCode } from './seed-mappings.js';
import type { SeedMode } from './seed-types.js';

const repositoryRoot = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const useTestDatabase = process.argv.includes('--test');
const seedMode: SeedMode = process.argv.includes('--draft') ? 'draft' : 'published';
loadLocalEnv(repositoryRoot);

function connectionString(): string {
  const envKey = useTestDatabase ? 'TEST_DATABASE_URL' : 'MIGRATOR_DATABASE_URL';
  const value = process.env[envKey];
  if (!value) throw new Error(`${envKey} is required to seed the database`);
  return value;
}

async function one<T extends pg.QueryResultRow>(client: pg.PoolClient, text: string, values: unknown[]): Promise<T> {
  const result = await client.query<T>(text, values);
  if (!result.rows[0]) throw new Error(`Expected one row from query: ${text}`);
  return result.rows[0];
}

async function seedFixture(client: pg.PoolClient, fixture: ReturnType<typeof loadSeedFixtures>[number]): Promise<void> {
  const metadata = fixture.publicPayload.examMetadata;
  const policy = metadata.scoringPolicy;
  const track = await one<{ id: string }>(client,
    `INSERT INTO tracks (code, name) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [getTrackCode(), 'German'],
  );
  const standard = await one<{ id: string }>(client,
    `INSERT INTO exam_standards (track_id, code, name) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [track.id, getStandardCode(metadata.providerFormat), metadata.providerFormat],
  );
  const level = await one<{ id: string }>(client,
    `INSERT INTO levels (code, name, rank_order) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [metadata.cefrLevel, `CEFR ${metadata.cefrLevel}`, { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 }[metadata.cefrLevel]],
  );
  const exam = await one<{ id: string }>(client,
    `INSERT INTO exams (standard_id, level_id, code, slug, provider_format, title, description, time_limit_seconds, passing_percentage, benchmark_scale_config, audio_pause_allowed, audio_max_plays, public_explanation_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, 2, 2)
     ON CONFLICT (code) DO UPDATE SET standard_id = EXCLUDED.standard_id, level_id = EXCLUDED.level_id, slug = EXCLUDED.slug, provider_format = EXCLUDED.provider_format, title = EXCLUDED.title, description = EXCLUDED.description, time_limit_seconds = EXCLUDED.time_limit_seconds, passing_percentage = EXCLUDED.passing_percentage, benchmark_scale_config = EXCLUDED.benchmark_scale_config
     RETURNING id`,
    [standard.id, level.id, metadata.examId, metadata.slug, metadata.providerFormat, metadata.title, metadata.disclaimer, metadata.totalDurationMinutes * 60, metadata.passPercentage, JSON.stringify({ cefrLevel: metadata.cefrLevel, providerFormat: metadata.providerFormat, slug: metadata.slug, scoringPolicy: { ...policy, passPercentage: metadata.passPercentage }, sourceFile: fixture.fileName })],
  );
  const existingVersion = await client.query<{ id: string; status: string; content_hash: string | null }>(
    `SELECT id, status, content_hash FROM exam_versions WHERE exam_id = $1 AND version_number = 1`, [exam.id],
  );
  if (existingVersion.rows[0]?.status === 'published' && existingVersion.rows[0].content_hash !== fixture.contentHash) {
    throw new Error(`${fixture.fileName}: published version hash changed; create a new version instead`);
  }
  if (existingVersion.rows[0]?.status === 'published') return;
  const version = await one<{ id: string }>(client,
    `INSERT INTO exam_versions (exam_id, version_number, status, content_hash)
     VALUES ($1, 1, 'draft', $2)
     ON CONFLICT (exam_id, version_number) DO UPDATE SET content_hash = EXCLUDED.content_hash
     RETURNING id`,
    [exam.id, fixture.contentHash],
  );
  const skillIds = new Map<string, string>();
  const questionTypes = new Map<string, string>();
  const keyMap = new Map(fixture.serverPayload.keys.map((key) => [key.questionId, key]));
  for (const [sectionIndex, section] of fixture.publicPayload.sections.entries()) {
    const skillCode = section.skill;
    const existingSkill = skillIds.get(skillCode) ?? (await one<{ id: string }>(client,
      `INSERT INTO skills (code, name) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [skillCode, getSkillName(section.skill)],
    )).id;
    skillIds.set(skillCode, existingSkill);
    const sectionRow = await one<{ id: string }>(client,
      `INSERT INTO sections (version_id, skill_id, source_section_id, section_order, title, instructions, time_limit_seconds) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (version_id, source_section_id) DO UPDATE SET skill_id = EXCLUDED.skill_id, section_order = EXCLUDED.section_order, title = EXCLUDED.title, instructions = EXCLUDED.instructions, time_limit_seconds = EXCLUDED.time_limit_seconds RETURNING id`,
      [version.id, existingSkill, section.sectionId, sectionIndex + 1, section.title, null, section.durationMinutes * 60],
    );
    let stimulusId: string | null = null;
    if (section.stimulus) {
      let assetId: string | null = null;
      const assetPath = getStimulusAssetPath(section.stimulus);
      if (assetPath) {
        assetId = (await one<{ id: string }>(client,
          `INSERT INTO assets (asset_type, storage_path, mime_type) VALUES ('audio_mp3', $1, 'audio/mpeg') ON CONFLICT (storage_path) DO UPDATE SET mime_type = EXCLUDED.mime_type RETURNING id`, [assetPath],
        )).id;
      }
      stimulusId = (await one<{ id: string }>(client,
        `INSERT INTO stimuli (section_id, part_number, stimulus_type, title, content_text, asset_id, dialogue_transcript) VALUES ($1, 1, $2, $3, $4, $5, $6)
         ON CONFLICT (section_id, part_number) DO UPDATE SET stimulus_type = EXCLUDED.stimulus_type, title = EXCLUDED.title, content_text = EXCLUDED.content_text, asset_id = EXCLUDED.asset_id, dialogue_transcript = EXCLUDED.dialogue_transcript RETURNING id`,
        [sectionRow.id, section.stimulus.type, section.stimulus.title ?? null, getStimulusContent(section.stimulus), assetId, section.stimulus.dialogueTranscript ? JSON.stringify(section.stimulus.dialogueTranscript) : null],
      )).id;
    }
    for (const question of section.questions) {
      const typeCode = getQuestionTypeCode(question);
      const typeId = questionTypes.get(typeCode) ?? (await one<{ id: string }>(client,
        `INSERT INTO question_types (code, name) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [typeCode, typeCode],
      )).id;
      questionTypes.set(typeCode, typeId);
      const key = keyMap.get(question.id);
      if (!key) throw new Error(`${fixture.fileName}: missing key for ${question.id}`);
      const questionRow = await one<{ id: string }>(client,
        `INSERT INTO questions (version_id, section_id, source_question_id, stimulus_id, type_id, question_order, part_number, prompt_text, points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (version_id, source_question_id) DO UPDATE SET section_id = EXCLUDED.section_id, stimulus_id = EXCLUDED.stimulus_id, type_id = EXCLUDED.type_id, question_order = EXCLUDED.question_order, part_number = EXCLUDED.part_number, prompt_text = EXCLUDED.prompt_text, points = EXCLUDED.points RETURNING id`,
        [version.id, sectionRow.id, question.id, stimulusId, typeId, question.order, question.part, question.prompt, getQuestionPoints(key)],
      );
      for (const [optionIndex, option] of question.options.entries()) {
        await client.query(
          `INSERT INTO question_options (question_id, option_label, content_text, option_order) VALUES ($1, $2, $3, $4)
           ON CONFLICT (question_id, option_label) DO UPDATE SET content_text = EXCLUDED.content_text, option_order = EXCLUDED.option_order`,
          [questionRow.id, option.id, option.text, optionIndex + 1],
        );
      }
      await client.query(
        `INSERT INTO answer_keys (question_id, correct_option_label, scoring_notes, citation, trap_explanation_vi, tags) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (question_id) DO UPDATE SET correct_option_label = EXCLUDED.correct_option_label, scoring_notes = EXCLUDED.scoring_notes, citation = EXCLUDED.citation, trap_explanation_vi = EXCLUDED.trap_explanation_vi, tags = EXCLUDED.tags`,
        [questionRow.id, key.correctOption, key.trapExplanationVi, key.citation, key.trapExplanationVi, JSON.stringify(key.tags)],
      );
      if (question.publicExplanation) {
        await client.query(
          `INSERT INTO explanations (question_id, explanation_text, is_public_preview) VALUES ($1, $2, true)
           ON CONFLICT (question_id) DO UPDATE SET explanation_text = EXCLUDED.explanation_text, is_public_preview = true`,
          [questionRow.id, question.publicExplanation],
        );
      }
    }
  }
  if (seedMode === 'published') {
    await client.query(
      `UPDATE exam_versions SET status = 'published', published_at = COALESCE(published_at, clock_timestamp()) WHERE id = $1`,
      [version.id],
    );
  }
}

export async function runSeed(): Promise<void> {
  const fixtures = loadSeedFixtures(repositoryRoot);
  const pool = createDatabasePool(connectionString());
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['shd-tuhoctiengduc-seed']);
    for (const fixture of fixtures) await seedFixture(client, fixture);
    await client.query('COMMIT');
    console.log(`Seeded ${fixtures.length} canonical exam fixtures.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runSeed().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
