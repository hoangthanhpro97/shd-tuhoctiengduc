-- Attempt state functions run as shd_attempt_mgr and need only public question metadata.
GRANT SELECT ON exams, exam_versions, questions TO shd_attempt_mgr;
REVOKE SELECT ON answer_keys FROM shd_attempt_mgr;
