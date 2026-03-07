-- Create Views for Common Queries

-- View for Order Summary with Customer Details
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_type,
    o.payment_status,
    o.total_amount,
    o.paid_amount,
    o.pickup_address,
    o.delivery_address,
    o.logistics_tracking_number,
    o.risk_level,
    o.buyer_intent,
    o.created_at,
    o.updated_at,
    o.dispatched_at,
    o.delivered_at,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    c.customer_type,
    COUNT(oi.id) as item_count,
    COALESCE(SUM(oi.quantity), 0) as total_quantity
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, c.first_name, c.last_name, c.email, c.phone, c.customer_type;

-- View for Payment Summary
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    p.id,
    p.transaction_id,
    p.gateway_transaction_id,
    p.gateway,
    p.status,
    p.type,
    p.amount,
    p.created_at,
    p.updated_at,
    p.failure_reason,
    o.order_number,
    o.customer_id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email as customer_email
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN customers c ON o.customer_id = c.id;

-- View for Customer Order Statistics
CREATE OR REPLACE VIEW customer_order_stats AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.customer_type,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(SUM(CASE WHEN o.payment_status = 'PAID' THEN o.total_amount ELSE 0 END), 0) as paid_amount,
    MAX(o.created_at) as last_order_date,
    COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'RTO' THEN 1 END) as rto_orders
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.customer_type;

-- View for Daily Order Statistics
CREATE OR REPLACE VIEW daily_order_stats AS
SELECT 
    DATE(o.created_at) as order_date,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COUNT(CASE WHEN o.payment_type = 'COD' THEN 1 END) as cod_orders,
    COUNT(CASE WHEN o.payment_type = 'CASHFREE' THEN 1 END) as online_orders,
    COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN o.status = 'RTO' THEN 1 END) as rto_orders,
    COUNT(CASE WHEN o.payment_status = 'PAID' THEN 1 END) as paid_orders
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- View for Product Sales Statistics
CREATE OR REPLACE VIEW product_sales_stats AS
SELECT 
    oi.product_name,
    oi.sku,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as average_unit_price,
    MIN(oi.unit_price) as minimum_unit_price,
    MAX(oi.unit_price) as maximum_unit_price,
    MAX(o.created_at) as last_sold_date
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE oi.active = true
GROUP BY oi.product_name, oi.sku
ORDER BY total_revenue DESC;
