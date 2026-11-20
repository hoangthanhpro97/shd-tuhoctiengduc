-- Align the relational model with the canonical exam contract and seed keys.

-- PostgreSQL requires dependent views to be recreated around numeric type changes.
DROP VIEW IF EXISTS v_attempt_item_scores;

ALTER TABLE exams ADD COLUMN IF NOT EXISTS slug varchar(128);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS provider_format varchar(128);

UPDATE exams
SET slug = COALESCE(NULLIF(slug, ''), code),
    provider_format = COALESCE(NULLIF(provider_format, ''), 'unknown')
WHERE slug IS NULL OR slug = '' OR provider_format IS NULL OR provider_format = '';

ALTER TABLE exams ALTER COLUMN slug SET NOT NULL;
ALTER TABLE exams ALTER COLUMN provider_format SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS exams_slug_unique ON exams (slug);

ALTER TABLE sections ADD COLUMN IF NOT EXISTS source_section_id varchar(128);
UPDATE sections
SET source_section_id = COALESCE(NULLIF(source_section_id, ''), id::text)
WHERE source_section_id IS NULL OR source_section_id = '';
ALTER TABLE sections ALTER COLUMN source_section_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS sections_version_source_id_unique
  ON sections (version_id, source_section_id);
CREATE UNIQUE INDEX IF NOT EXISTS sections_version_order_unique
  ON sections (version_id, section_order);

ALTER TABLE stimuli ADD COLUMN IF NOT EXISTS dialogue_transcript jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS stimuli_section_part_unique
  ON stimuli (section_id, part_number);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS source_question_id varchar(128);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS part_number integer NOT NULL DEFAULT 1;
UPDATE questions
SET source_question_id = COALESCE(NULLIF(source_question_id, ''), id::text)
WHERE source_question_id IS NULL OR source_question_id = '';
ALTER TABLE questions ALTER COLUMN source_question_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS questions_version_section_order_unique
  ON questions (version_id, section_id, question_order);
CREATE UNIQUE INDEX IF NOT EXISTS questions_version_source_id_unique
  ON questions (version_id, source_question_id);

ALTER TABLE questions
  ALTER COLUMN points TYPE numeric(8, 2)
  USING points::numeric(8, 2);

ALTER TABLE answer_keys ADD COLUMN IF NOT EXISTS citation text;
ALTER TABLE answer_keys ADD COLUMN IF NOT EXISTS trap_explanation_vi text;
ALTER TABLE answer_keys ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb;
UPDATE answer_keys
SET citation = COALESCE(NULLIF(citation, ''), NULLIF(scoring_notes, ''), '(legacy key)'),
    trap_explanation_vi = COALESCE(NULLIF(trap_explanation_vi, ''), '(legacy explanation)')
WHERE citation IS NULL OR citation = '' OR trap_explanation_vi IS NULL OR trap_explanation_vi = '';
ALTER TABLE answer_keys ALTER COLUMN citation SET NOT NULL;
ALTER TABLE answer_keys ALTER COLUMN trap_explanation_vi SET NOT NULL;

ALTER TABLE results
  ALTER COLUMN total_score TYPE numeric(8, 2)
  USING total_score::numeric(8, 2),
  ALTER COLUMN max_possible_score TYPE numeric(8, 2)
  USING max_possible_score::numeric(8, 2);

ALTER TABLE result_section_scores
  ALTER COLUMN score TYPE numeric(8, 2)
  USING score::numeric(8, 2),
  ALTER COLUMN max_score TYPE numeric(8, 2)
  USING max_score::numeric(8, 2);

ALTER TABLE result_item_scores
  ALTER COLUMN earned_points TYPE numeric(8, 2)
  USING earned_points::numeric(8, 2);

CREATE UNIQUE INDEX IF NOT EXISTS assets_storage_path_unique ON assets (storage_path);

CREATE OR REPLACE VIEW v_attempt_item_scores WITH (security_barrier = true) AS
SELECT
    ris.result_id,
    ris.question_id,
    CASE
        WHEN exp.is_public_preview = true OR ent.full_solution_unlocked = true THEN ris.is_correct
        ELSE NULL
    END AS is_correct,
    CASE
        WHEN exp.is_public_preview = true OR ent.full_solution_unlocked = true THEN ris.earned_points
        ELSE NULL
    END AS earned_points
FROM result_item_scores ris
JOIN results r ON r.id = ris.result_id
JOIN attempt_entitlements ent ON ent.attempt_id = r.attempt_id
LEFT JOIN explanations exp ON exp.question_id = ris.question_id;

ALTER VIEW v_attempt_item_scores OWNER TO shd_grader;
GRANT SELECT ON v_attempt_item_scores TO shd_app, shd_staff_api, shd_readonly;
