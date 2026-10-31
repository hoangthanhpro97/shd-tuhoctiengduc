#!/usr/bin/env bash
set -e

echo "Starting initialization of SHD databases and roles..."

# Create databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE shd_tuhoctiengduc;
    CREATE DATABASE shd_test;
EOSQL

# Create 7 NOLOGIN roles and 5 LOGIN roles in shd_tuhoctiengduc
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "shd_tuhoctiengduc" <<-EOSQL
    -- 7 NOLOGIN roles
    CREATE ROLE shd_migrator_owner NOLOGIN;
    CREATE ROLE shd_ledger_admin NOLOGIN;
    CREATE ROLE shd_attempt_mgr NOLOGIN;
    CREATE ROLE shd_auth_admin NOLOGIN;
    CREATE ROLE shd_exam_admin NOLOGIN;
    CREATE ROLE shd_privacy_admin NOLOGIN;
    CREATE ROLE shd_grader NOLOGIN;

    -- 5 LOGIN roles with passwords from environment variables
    -- shd_migrator is member of all admin roles to manage schema, tables, and functions
    CREATE ROLE shd_migrator WITH LOGIN PASSWORD '${SHD_MIGRATOR_PASSWORD}' IN ROLE shd_migrator_owner, shd_ledger_admin, shd_attempt_mgr, shd_auth_admin, shd_exam_admin, shd_privacy_admin, shd_grader;
    CREATE ROLE shd_app WITH LOGIN PASSWORD '${SHD_APP_PASSWORD}';
    CREATE ROLE shd_worker WITH LOGIN PASSWORD '${SHD_WORKER_PASSWORD}';
    CREATE ROLE shd_staff_api WITH LOGIN PASSWORD '${SHD_STAFF_API_PASSWORD}';
    CREATE ROLE shd_readonly WITH LOGIN PASSWORD '${SHD_READONLY_PASSWORD}';

    -- Database Ownership & Base Grants
    ALTER DATABASE shd_tuhoctiengduc OWNER TO shd_migrator_owner;
    ALTER DATABASE shd_test OWNER TO shd_migrator_owner;
    GRANT CONNECT ON DATABASE shd_tuhoctiengduc TO shd_migrator, shd_app, shd_worker, shd_staff_api, shd_readonly;
    GRANT CONNECT ON DATABASE shd_test TO shd_migrator;
EOSQL

echo "SHD databases and roles initialized successfully."
