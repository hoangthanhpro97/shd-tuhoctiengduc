-- Public exam route needs read-only access to published content projections.
GRANT SELECT ON exams, exam_versions, levels, sections, skills, stimuli, assets, questions, question_options, explanations TO shd_app;
REVOKE SELECT ON answer_keys FROM shd_app;
