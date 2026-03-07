-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE
);

-- Create Indexes for Order Items Table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_name ON order_items(product_name);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);
CREATE INDEX IF NOT EXISTS idx_order_items_active ON order_items(active);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

-- Create Trigger for updated_at timestamp
CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Sample Data
INSERT INTO order_items (order_id, product_name, sku, unit_price, quantity, description) VALUES
(1, 'Organic Mustard Oil', 'OMO-001', 150.00, 2, 'Cold pressed organic mustard oil'),
(1, 'Organic Groundnut Oil', 'OGO-001', 200.00, 3, 'Pure groundnut oil'),
(1, 'Organic Coconut Oil', 'OCO-001', 250.00, 2, 'Extra virgin coconut oil'),
(2, 'Organic Mustard Oil', 'OMO-001', 150.00, 5, 'Cold pressed organic mustard oil'),
(2, 'Organic Sunflower Oil', 'OSO-001', 180.00, 4, 'Premium sunflower oil'),
(2, 'Organic Sesame Oil', 'OSE-001', 220.00, 3, 'Cold pressed sesame oil'),
(3, 'Organic Groundnut Oil', 'OGO-001', 200.00, 3, 'Pure groundnut oil'),
(3, 'Organic Olive Oil', 'OOO-001', 300.00, 2, 'Extra virgin olive oil'),
(4, 'Organic Mustard Oil', 'OMO-001', 150.00, 10, 'Bulk order - mustard oil'),
(4, 'Organic Groundnut Oil', 'OGO-001', 200.00, 8, 'Bulk order - groundnut oil'),
(4, 'Organic Coconut Oil', 'OCO-001', 250.00, 6, 'Bulk order - coconut oil'),
(5, 'Organic Sunflower Oil', 'OSO-001', 180.00, 2, 'Premium sunflower oil'),
(5, 'Organic Sesame Oil', 'OSE-001', 220.00, 2, 'Cold pressed sesame oil');
