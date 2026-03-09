-- Add description column to workspaces table
-- Target: PostgreSQL
-- Date: 2026-03-09

BEGIN;

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS description VARCHAR(1000);

COMMIT;

