-- Review/result security-definer functions need read-only access to their projections.
GRANT SELECT ON attempt_entitlements, explanations, results, result_section_scores, result_item_scores TO shd_grader;
REVOKE INSERT, UPDATE, DELETE ON attempt_entitlements, explanations, results, result_section_scores, result_item_scores FROM shd_grader;
