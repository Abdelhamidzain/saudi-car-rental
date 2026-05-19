-- =============================================================================
-- Migration: 20260519000001_init_extensions
-- Purpose:   Enable Postgres extensions required by the schema.
--
-- pgcrypto  -> gen_random_uuid() for UUID primary keys
-- citext    -> case-insensitive text type used for email columns
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";
