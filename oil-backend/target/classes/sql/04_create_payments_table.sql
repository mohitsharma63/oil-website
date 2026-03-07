-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    gateway_transaction_id VARCHAR(100),
    gateway VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    type VARCHAR(20) NOT NULL DEFAULT 'FULL_PAYMENT',
    amount DECIMAL(10,2) NOT NULL,
    gateway_response TEXT,
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payments_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE RESTRICT
);

-- Create Indexes for Payments Table
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(gateway);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create Trigger for updated_at timestamp
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Sample Data
INSERT INTO payments (order_id, transaction_id, gateway, status, type, amount, gateway_response) VALUES
(1, 'COD_001', 'COD', 'PENDING', 'FULL_PAYMENT', 1500.00, 'COD payment initialized'),
(2, 'CF_001', 'CASHFREE', 'SUCCESS', 'FULL_PAYMENT', 2500.00, 'Payment completed successfully'),
(3, 'COD_002', 'COD', 'PENDING', 'FULL_PAYMENT', 1200.00, 'COD payment initialized'),
(4, 'CF_002', 'CASHFREE', 'SUCCESS', 'FULL_PAYMENT', 3500.00, 'Payment completed successfully'),
(5, 'COD_003', 'COD', 'SUCCESS', 'FULL_PAYMENT', 800.00, 'COD payment collected on delivery');
