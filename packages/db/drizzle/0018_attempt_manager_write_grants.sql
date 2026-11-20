-- start_attempt and submit_attempt persist attempt state under shd_attempt_mgr.
GRANT SELECT, INSERT, UPDATE ON exam_attempts TO shd_attempt_mgr;
REVOKE DELETE ON exam_attempts FROM shd_attempt_mgr;
