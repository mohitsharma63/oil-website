-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    company VARCHAR(100),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'RETAIL',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Customers Table
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Create Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Sample Data
INSERT INTO customers (first_name, last_name, email, phone, address, city, state, pincode, customer_type) VALUES
('Raj', 'Kumar', 'raj.kumar@email.com', '9876543210', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'RETAIL'),
('Priya', 'Sharma', 'priya.sharma@email.com', '9876543211', '456 Park Avenue', 'Delhi', 'Delhi', '110001', 'WHOLESALE'),
('Amit', 'Patel', 'amit.patel@email.com', '9876543212', '789 Market Road', 'Ahmedabad', 'Gujarat', '380001', 'RETAIL'),
('Sunita', 'Reddy', 'sunita.reddy@email.com', '9876543213', '321 Commercial St', 'Bangalore', 'Karnataka', '560001', 'CORPORATE'),
('Vikram', 'Singh', 'vikram.singh@email.com', '9876543214', '654 Business Center', 'Kolkata', 'West Bengal', '700001', 'RETAIL');
