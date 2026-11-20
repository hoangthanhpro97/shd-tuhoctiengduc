-- Answer autosave security function validates options under shd_attempt_mgr.
GRANT SELECT ON question_options TO shd_attempt_mgr;
REVOKE SELECT ON answer_keys FROM shd_attempt_mgr;
