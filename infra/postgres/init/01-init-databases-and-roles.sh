#!/usr/bin/env bash
set -e

echo "Starting initialization of SHD databases and roles..."

# Create databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE shd_tuhoctiengduc;
    CREATE DATABASE shd_test;
EOSQL

# Create 5 login roles with passwords from environment variables
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "shd_tuhoctiengduc" <<-EOSQL
    -- 1. shd_migrator: Schema owner, runs DDL migrations
    CREATE ROLE shd_migrator WITH LOGIN PASSWORD '${SHD_MIGRATOR_PASSWORD}';
    ALTER DATABASE shd_tuhoctiengduc OWNER TO shd_migrator;
    ALTER DATABASE shd_test OWNER TO shd_migrator;

    -- 2. shd_app: Main web/API application role
    CREATE ROLE shd_app WITH LOGIN PASSWORD '${SHD_APP_PASSWORD}';

    -- 3. shd_grader: Isolated exam grading role (can access answer_keys)
    CREATE ROLE shd_grader WITH LOGIN PASSWORD '${SHD_GRADER_PASSWORD}';

    -- 4. shd_worker: Background task & CRM sync worker role
    CREATE ROLE shd_worker WITH LOGIN PASSWORD '${SHD_WORKER_PASSWORD}';

    -- 5. shd_readonly: Readonly reporting & audit role
    CREATE ROLE shd_readonly WITH LOGIN PASSWORD '${SHD_READONLY_PASSWORD}';
EOSQL

echo "SHD databases and roles initialized successfully."

