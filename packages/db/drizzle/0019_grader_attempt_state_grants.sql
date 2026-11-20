-- persist_grading_result finalizes the attempt under the grading owner role.
GRANT SELECT, UPDATE ON exam_attempts TO shd_grader;
REVOKE INSERT, DELETE ON exam_attempts FROM shd_grader;
