-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'STORE_ORDER',
    payment_type VARCHAR(20) NOT NULL DEFAULT 'COD',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    pickup_address VARCHAR(500),
    delivery_address VARCHAR(500),
    notes VARCHAR(1000),
    logistics_tracking_number VARCHAR(100),
    risk_level VARCHAR(50) DEFAULT 'LOW',
    buyer_intent VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    CONSTRAINT fk_orders_customer 
        FOREIGN KEY (customer_id) 
        REFERENCES customers(id) 
        ON DELETE RESTRICT
);

-- Create Indexes for Orders Table
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_type ON orders(payment_type);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_logistics_tracking ON orders(logistics_tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Create Trigger for updated_at timestamp
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Sample Data
INSERT INTO orders (order_number, customer_id, status, payment_type, payment_status, total_amount, pickup_address, delivery_address, risk_level, buyer_intent) VALUES
('ORD20231201001', 1, 'STORE_ORDER', 'COD', 'PENDING', 1500.00, 'Warehouse A, Mumbai', '123 Main Street, Mumbai', 'LOW', 'Regular customer'),
('ORD20231201002', 2, 'READY_TO_DISPATCH', 'CASHFREE', 'PAID', 2500.00, 'Warehouse B, Delhi', '456 Park Avenue, Delhi', 'MEDIUM', 'First time buyer'),
('ORD20231201003', 3, 'DISPATCH', 'COD', 'PENDING', 1200.00, 'Warehouse A, Mumbai', '789 Market Road, Ahmedabad', 'LOW', 'Repeat customer'),
('ORD20231201004', 4, 'INTRANSIT', 'CASHFREE', 'PAID', 3500.00, 'Warehouse C, Bangalore', '321 Commercial St, Bangalore', 'HIGH', 'Bulk order'),
('ORD20231201005', 5, 'DELIVERED', 'COD', 'PAID', 800.00, 'Warehouse B, Delhi', '654 Business Center, Kolkata', 'LOW', 'Regular order');
