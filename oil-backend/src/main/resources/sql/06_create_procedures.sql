-- Create Stored Procedures for Common Operations

-- Procedure to Update Order Status with Timestamp
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id BIGINT,
    p_new_status VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    current_status VARCHAR(50);
BEGIN
    -- Get current status
    SELECT status INTO current_status FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with ID % not found', p_order_id;
    END IF;
    
    -- Update status and appropriate timestamp
    UPDATE orders SET 
        status = p_new_status,
        updated_at = CURRENT_TIMESTAMP,
        dispatched_at = CASE WHEN p_new_status = 'DISPATCH' THEN CURRENT_TIMESTAMP ELSE dispatched_at END,
        delivered_at = CASE WHEN p_new_status = 'DELIVERED' THEN CURRENT_TIMESTAMP ELSE delivered_at END
    WHERE id = p_order_id;
    
    -- Update payment status for COD orders when dispatched
    IF p_new_status = 'DISPATCH' THEN
        UPDATE orders SET payment_status = 'PAID' 
        WHERE id = p_order_id AND payment_type = 'COD';
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating order status: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Procedure to Process Payment
CREATE OR REPLACE FUNCTION process_payment(
    p_transaction_id VARCHAR(100),
    p_gateway VARCHAR(50),
    p_status VARCHAR(20),
    p_amount DECIMAL(10,2),
    p_gateway_response TEXT,
    p_failure_reason VARCHAR(500) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    payment_record RECORD;
    order_id BIGINT;
BEGIN
    -- Get payment record
    SELECT * INTO payment_record FROM payments WHERE transaction_id = p_transaction_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment with transaction ID % not found', p_transaction_id;
    END IF;
    
    order_id := payment_record.order_id;
    
    -- Update payment record
    UPDATE payments SET
        status = p_status,
        gateway_response = p_gateway_response,
        failure_reason = p_failure_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = p_transaction_id;
    
    -- Update order payment status
    IF p_status = 'SUCCESS' THEN
        UPDATE orders SET
            payment_status = 'PAID',
            paid_amount = p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = order_id;
    ELSIF p_status = 'FAILED' THEN
        UPDATE orders SET
            payment_status = 'FAILED',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = order_id;
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error processing payment: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Procedure to Get Order Statistics
CREATE OR REPLACE FUNCTION get_order_statistics(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE(
    total_orders BIGINT,
    total_revenue DECIMAL(10,2),
    paid_orders BIGINT,
    cod_orders BIGINT,
    online_orders BIGINT,
    delivered_orders BIGINT,
    rto_orders BIGINT,
    pending_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COUNT(CASE WHEN o.payment_status = 'PAID' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN o.payment_type = 'COD' THEN 1 END) as cod_orders,
        COUNT(CASE WHEN o.payment_type = 'CASHFREE' THEN 1 END) as online_orders,
        COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN o.status = 'RTO' THEN 1 END) as rto_orders,
        COUNT(CASE WHEN o.status IN ('STORE_ORDER', 'READY_TO_DISPATCH') THEN 1 END) as pending_orders
    FROM orders o
    WHERE 
        (p_start_date IS NULL OR DATE(o.created_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(o.created_at) <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Procedure to Get Customer Statistics
CREATE OR REPLACE FUNCTION get_customer_statistics(p_customer_id BIGINT)
) RETURNS TABLE(
    total_orders BIGINT,
    total_spent DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    delivered_orders BIGINT,
    rto_orders BIGINT,
    last_order_date TIMESTAMP,
    average_order_value DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(SUM(CASE WHEN o.payment_status = 'PAID' THEN o.total_amount ELSE 0 END), 0) as paid_amount,
        COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN o.status = 'RTO' THEN 1 END) as rto_orders,
        MAX(o.created_at) as last_order_date,
        CASE WHEN COUNT(o.id) > 0 THEN COALESCE(AVG(o.total_amount), 0) ELSE 0 END as average_order_value
    FROM orders o
    WHERE o.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    new_order_number VARCHAR(100);
    order_count BIGINT;
BEGIN
    -- Get count of orders today
    SELECT COUNT(*) INTO order_count 
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate order number with date and sequence
    new_order_number := 'ORD' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD((order_count + 1)::TEXT, 3, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number) LOOP
        order_count := order_count + 1;
        new_order_number := 'ORD' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD((order_count + 1)::TEXT, 3, '0');
    END LOOP;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;
