-- Runtime grants for consent lookup and entitlement unlock.
GRANT SELECT ON consent_purposes, consent_texts TO shd_app;
GRANT INSERT, UPDATE ON consents TO shd_auth_admin;
GRANT SELECT, UPDATE ON attempt_entitlements TO shd_attempt_mgr;
REVOKE DELETE ON attempt_entitlements FROM shd_attempt_mgr;
