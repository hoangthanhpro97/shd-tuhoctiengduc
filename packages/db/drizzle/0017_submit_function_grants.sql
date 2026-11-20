-- submit_attempt runs as shd_attempt_mgr and validates visitor ownership before updating the attempt.
GRANT SELECT, UPDATE ON exam_attempts TO shd_attempt_mgr;
GRANT SELECT ON visitors TO shd_attempt_mgr;
REVOKE INSERT, DELETE ON exam_attempts FROM shd_attempt_mgr;
