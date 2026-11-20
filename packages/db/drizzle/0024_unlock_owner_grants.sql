-- Unlock entitlement is updated by unlock_full_solution under shd_attempt_mgr.
GRANT SELECT, UPDATE ON attempt_entitlements TO shd_attempt_mgr;
REVOKE DELETE ON attempt_entitlements FROM shd_attempt_mgr;
