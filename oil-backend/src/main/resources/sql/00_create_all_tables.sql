-- Master Script to Create All Tables and Objects
-- Run this script to set up the complete database schema

-- Create the sql directory if it doesn't exist (for reference)
-- This file should be executed to create all database objects

\echo 'Creating database schema for Order Management System...'

-- Execute all table creation scripts in order
\echo 'Creating customers table...'
\i 01_create_customers_table.sql

\echo 'Creating orders table...'
\i 02_create_orders_table.sql

\echo 'Creating order_items table...'
\i 03_create_order_items_table.sql

\echo 'Creating payments table...'
\i 04_create_payments_table.sql

\echo 'Creating views...'
\i 05_create_views.sql

\echo 'Creating stored procedures...'
\i 06_create_procedures.sql

\echo 'Database schema creation completed successfully!'

-- Verify tables were created
\echo 'Verifying table creation...'
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('customers', 'orders', 'order_items', 'payments')
ORDER BY table_name;

-- Show sample data counts
\echo 'Sample data counts:'
SELECT 
    'customers' as table_name, 
    COUNT(*) as record_count 
FROM customers
UNION ALL
SELECT 
    'orders' as table_name, 
    COUNT(*) as record_count 
FROM orders
UNION ALL
SELECT 
    'order_items' as table_name, 
    COUNT(*) as record_count 
FROM order_items
UNION ALL
SELECT 
    'payments' as table_name, 
    COUNT(*) as record_count 
FROM payments;

\echo 'Setup complete! You can now start using the Order Management System.'
