-- The grading owner must be able to persist result projections through SECURITY DEFINER functions.
GRANT SELECT, INSERT, UPDATE ON results, result_section_scores, result_item_scores TO shd_grader;
REVOKE DELETE ON results, result_section_scores, result_item_scores FROM shd_grader;
