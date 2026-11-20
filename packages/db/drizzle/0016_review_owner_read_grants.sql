-- Review/result SECURITY DEFINER functions validate visitor ownership internally.
GRANT SELECT ON visitors, exam_attempts, attempt_answers, attempt_entitlements, questions, question_options, explanations, answer_keys, results, result_section_scores, result_item_scores TO shd_grader;
REVOKE INSERT, UPDATE, DELETE ON visitors, exam_attempts, attempt_answers, attempt_entitlements, questions, question_options, explanations, answer_keys FROM shd_grader;
