-- Fix schema migration by dropping dependent views
-- This script should be run before Hibernate schema migration

-- Drop views that depend on customer_type column
DROP VIEW IF EXISTS order_summary;
DROP VIEW IF EXISTS customer_order_stats;

-- After Hibernate migration completes, recreate the views
-- The views will be recreated by the 05_create_views.sql script
