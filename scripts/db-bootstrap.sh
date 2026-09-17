#!/usr/bin/env bash
# MediKiosk local database bootstrap (idempotent).
# Creates the roles and database, applies db/schema.sql, and seeds staff accounts.
# Requires: local PostgreSQL running as the postgres superuser (sudo -u postgres).
set -euo pipefail

cd "$(dirname "$0")/.."

DB_NAME="${MEDIKIOSK_DB:-medikiosk}"
APP_PASSWORD="${MEDIKIOSK_APP_PASSWORD:-medikiosk_local_dev}"
ADMIN_DSN="${MEDIKIOSK_ADMIN_DSN:-postgresql://medikiosk_owner:owner_local_dev@127.0.0.1:5432/${DB_NAME}}"

psql_as_owner() {
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" "$@"
}

# 1. Roles
sudo -u postgres psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_roles WHERE rolname='medikiosk_owner'" | grep -q 1 \
  || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE medikiosk_owner LOGIN SUPERUSER PASSWORD 'owner_local_dev';"

sudo -u postgres psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_roles WHERE rolname='medikiosk_app'" | grep -q 1 \
  || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE medikiosk_app LOGIN PASSWORD '${APP_PASSWORD}';"

# 2. Database
sudo -u postgres psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER medikiosk_owner;"

# 3. Schema (idempotent DDL, run as owner)
psql_as_owner -v ON_ERROR_STOP=1 -f db/schema.sql

# 4. Staff seed (idempotent)
DATABASE_URL="${ADMIN_DSN}" node scripts/seed-staff.mjs

echo "DATABASE_BOOTSTRAP_DONE"
