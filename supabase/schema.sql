-- ==============================================================================
-- ZOMATO MENU SETUP & INVENTORY HUB (FIESTA) - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- This script sets up the full database schema, foreign keys, triggers,
-- row-level security (RLS), views, and seed data.
--
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Navigate to the SQL Editor
-- 3. Paste this script and click "Run"
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. DROP EXISTING TABLES (Clean Re-run Support)
-- ==============================================================================
DROP VIEW IF EXISTS v_active_menu CASCADE;
DROP VIEW IF EXISTS v_low_stock_dishes CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- 2.1 Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 Dishes (Menu Items) Table
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    zomato_id VARCHAR(50) NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    image_url TEXT,
    dish_emoji VARCHAR(10) DEFAULT '🍛',
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
    live_stock INTEGER NOT NULL DEFAULT 0 CHECK (live_stock >= 0),
    min_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_stock_threshold >= 0),
    zomato_status VARCHAR(20) NOT NULL DEFAULT 'In Stock' CHECK (zomato_status IN ('In Stock', 'Low Stock', 'Sold Out')),
    sys_state VARCHAR(50) NOT NULL DEFAULT 'Idle',
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Pricing Rules Table
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('discount', 'surge')),
    adjustment_percentage NUMERIC(5, 2) NOT NULL, -- e.g. -15.00 for 15% discount or 10.00 for 10% surge
    time_start TIME,
    time_end TIME,
    days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday, 6=Saturday
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 Live Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
    dish_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'PRICE_UPDATE', 'STOCK_DEPLETED', 'SURGE_ACTIVATED', 'STATUS_CHANGE', 'MANUAL_OVERRIDE'
    description TEXT NOT NULL,
    actor VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) DEFAULT '',
    actor_color VARCHAR(20) DEFAULT '#E23744',
    avatar_bg VARCHAR(20) DEFAULT '#FEE2E2',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 Inventory Stock Change History
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    reason VARCHAR(255),
    actor VARCHAR(100) DEFAULT 'System Sync',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE INDEX idx_dishes_zomato_status ON dishes(zomato_status);
CREATE INDEX idx_dishes_zomato_id ON dishes(zomato_id);
CREATE INDEX idx_pricing_rules_dish_id ON pricing_rules(dish_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_inventory_logs_dish_id ON inventory_logs(dish_id);

-- ==============================================================================
-- 4. AUTOMATED FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 4.1 Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dishes_updated_at
BEFORE UPDATE ON dishes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pricing_rules_updated_at
BEFORE UPDATE ON pricing_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Auto-calculate zomato_status based on live_stock & threshold
CREATE OR REPLACE FUNCTION auto_calculate_dish_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.live_stock <= 0 THEN
        NEW.zomato_status := 'Sold Out';
    ELSIF NEW.live_stock <= NEW.min_stock_threshold THEN
        NEW.zomato_status := 'Low Stock';
    ELSE
        NEW.zomato_status := 'In Stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dishes_status_calc
BEFORE INSERT OR UPDATE OF live_stock, min_stock_threshold ON dishes
FOR EACH ROW EXECUTE FUNCTION auto_calculate_dish_status();

-- 4.3 Trigger to log stock changes to inventory_logs automatically
CREATE OR REPLACE FUNCTION auto_log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.live_stock <> NEW.live_stock) THEN
        INSERT INTO inventory_logs (
            dish_id,
            previous_stock,
            new_stock,
            change_amount,
            reason,
            actor
        ) VALUES (
            NEW.id,
            OLD.live_stock,
            NEW.live_stock,
            NEW.live_stock - OLD.live_stock,
            CASE 
                WHEN NEW.live_stock = 0 THEN 'Stock depleted to 0 (Auto Locked)'
                WHEN NEW.live_stock < OLD.live_stock THEN 'Stock consumed / sales sync'
                ELSE 'Stock replenished'
            END,
            'System Sync'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dishes_stock_log
AFTER UPDATE OF live_stock ON dishes
FOR EACH ROW EXECUTE FUNCTION auto_log_stock_change();

-- ==============================================================================
-- 5. DATABASE VIEWS
-- ==============================================================================

-- 5.1 Active Menu with category details & active pricing rule summary
CREATE OR REPLACE VIEW v_active_menu AS
SELECT 
    d.id,
    d.name,
    d.zomato_id,
    c.name AS category_name,
    c.slug AS category_slug,
    d.description,
    d.image_url,
    d.dish_emoji,
    d.base_price,
    d.live_stock,
    d.min_stock_threshold,
    d.zomato_status,
    d.sys_state,
    d.is_available,
    pr.id AS active_rule_id,
    pr.rule_name,
    pr.rule_type,
    pr.adjustment_percentage,
    pr.time_start,
    pr.time_end,
    CASE 
        WHEN pr.rule_type = 'discount' THEN ROUND(d.base_price * (1 - (ABS(pr.adjustment_percentage) / 100.0)), 2)
        WHEN pr.rule_type = 'surge' THEN ROUND(d.base_price * (1 + (ABS(pr.adjustment_percentage) / 100.0)), 2)
        ELSE d.base_price
    END AS effective_price,
    d.created_at,
    d.updated_at
FROM dishes d
LEFT JOIN categories c ON d.category_id = c.id
LEFT JOIN pricing_rules pr ON d.id = pr.dish_id AND pr.is_active = true;

-- 5.2 Low Stock & Sold Out Alert View
CREATE OR REPLACE VIEW v_low_stock_dishes AS
SELECT 
    d.id,
    d.name,
    d.zomato_id,
    c.name AS category_name,
    d.live_stock,
    d.min_stock_threshold,
    d.zomato_status,
    d.sys_state
FROM dishes d
LEFT JOIN categories c ON d.category_id = c.id
WHERE d.live_stock <= d.min_stock_threshold OR d.zomato_status IN ('Low Stock', 'Sold Out')
ORDER BY d.live_stock ASC;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all catalog tables
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on dishes" ON dishes FOR SELECT USING (true);
CREATE POLICY "Allow public read on pricing_rules" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Allow public read on audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public read on inventory_logs" ON inventory_logs FOR SELECT USING (true);

-- Allow public / authenticated write access (insert, update, delete) for app operation
CREATE POLICY "Allow all access on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on dishes" ON dishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on pricing_rules" ON pricing_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on inventory_logs" ON inventory_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. SEED DATA
-- ==============================================================================

-- 7.1 Insert Categories
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
('11111111-1111-1111-1111-111111111101', 'Appetizers', 'appetizers', 'Starters, tandoori treats, and small plates', 1),
('11111111-1111-1111-1111-111111111102', 'Main Course', 'main-course', 'Rich curries, gravies, and specialties', 2),
('11111111-1111-1111-1111-111111111103', 'Breads', 'breads', 'Fresh tandoori rotis, naans, and parathas', 3),
('11111111-1111-1111-1111-111111111104', 'Dessert', 'dessert', 'Authentic traditional sweets and treats', 4),
('11111111-1111-1111-1111-111111111105', 'Beverages', 'beverages', 'Refreshing lassis, coolers, and beverages', 5)
ON CONFLICT (name) DO NOTHING;

-- 7.2 Insert Dishes
INSERT INTO dishes (id, name, zomato_id, category_id, description, dish_emoji, base_price, live_stock, min_stock_threshold, sys_state) VALUES
('22222222-2222-2222-2222-222222222201', 'Tandoori Chicken (Full)', 'Zomato ID: KDM-1042', '11111111-1111-1111-1111-111111111101', 'Whole chicken marinated in traditional spices and roasted in clay oven.', '🍗', 580.00, 28, 5, 'Idle'),
('22222222-2222-2222-2222-222222222202', 'Paneer Butter Masala', 'Zomato ID: KDM-1043', '11111111-1111-1111-1111-111111111102', 'Cottage cheese cubes simmered in rich creamy tomato and cashew gravy.', '🧀', 310.00, 3, 5, 'Reordering...'),
('22222222-2222-2222-2222-222222222203', 'Butter Naan', 'Zomato ID: KDM-1044', '11111111-1111-1111-1111-111111111103', 'Leavened flatbread brushed generously with fresh salted butter.', '🫓', 45.00, 140, 15, 'Idle'),
('22222222-2222-2222-2222-222222222204', 'Mutton Rogan Josh', 'Zomato ID: KDM-1046', '11111111-1111-1111-1111-111111111102', 'Kashmiri delicacy cooked with tender mutton in aromatic spiced gravy.', '🍖', 520.00, 0, 5, 'Idle'),
('22222222-2222-2222-2222-222222222205', 'Gulab Jamun (Double)', 'Zomato ID: KDM-1048', '11111111-1111-1111-1111-111111111104', 'Golden fried milk solids soaked in cardamom rose sugar syrup.', '🍩', 90.00, 12, 10, 'Idle'),
('22222222-2222-2222-2222-222222222206', 'Dal Makhani Premium', 'Zomato ID: KDM-1050', '11111111-1111-1111-1111-111111111102', 'Slow-cooked black lentils overnight with fresh cream and butter.', '🍛', 280.00, 45, 10, 'Idle'),
('22222222-2222-2222-2222-222222222207', 'Tandoori Paneer Tikka', 'Zomato ID: KDM-1052', '11111111-1111-1111-1111-111111111101', 'Marinated cottage cheese and bell peppers char-grilled on skewers.', '🍢', 310.00, 22, 5, 'Idle'),
('22222222-2222-2222-2222-222222222208', 'Sweet Kesar Lassi', 'Zomato ID: KDM-1055', '11111111-1111-1111-1111-111111111105', 'Thick yogurt blend infused with premium saffron and crushed pistachios.', '🥛', 120.00, 50, 10, 'Idle')
ON CONFLICT (zomato_id) DO NOTHING;

-- 7.3 Insert Pricing Rules
INSERT INTO pricing_rules (id, dish_id, rule_name, rule_type, adjustment_percentage, time_start, time_end, is_active) VALUES
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222206', 'Lunch Special Discount', 'discount', -15.00, '12:00:00', '15:30:00', true),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222207', 'Dinner Rush Surge', 'surge', 10.00, '18:00:00', '21:00:00', true)
ON CONFLICT DO NOTHING;

-- 7.4 Insert Audit Trail Entries
INSERT INTO audit_logs (dish_id, dish_name, action_type, description, actor, actor_role, actor_color, avatar_bg, created_at) VALUES
('22222222-2222-2222-2222-222222222202', 'Paneer Butter Masala', 'PRICE_UPDATE', 'Price updated ₹320 → ₹310', 'Aman S.', 'Chef', '#E23744', '#FEE2E2', timezone('utc'::text, now()) - INTERVAL '3 minutes'),
('22222222-2222-2222-2222-222222222203', 'Butter Naan', 'STOCK_DEPLETED', 'Stock depleted to 0 (Auto Locked)', 'System Sync', '', '#1BA672', '#D1FAE5', timezone('utc'::text, now()) - INTERVAL '14 minutes'),
('22222222-2222-2222-2222-222222222205', 'Gulab Jamun (Double)', 'SURGE_ACTIVATED', 'Surge rule ''Dinner Rush'' activated', 'Rahul K.', 'Manager', '#F59E0B', '#FEF3C7', timezone('utc'::text, now()) - INTERVAL '42 minutes'),
('22222222-2222-2222-2222-222222222201', 'Tandoori Chicken (Full)', 'PRICE_UPDATE', 'Price updated ₹540 → ₹580', 'Rahul K.', 'Manager', '#F59E0B', '#FEF3C7', timezone('utc'::text, now()) - INTERVAL '1 hour'),
('22222222-2222-2222-2222-222222222204', 'Mutton Rogan Josh', 'STATUS_CHANGE', 'Marked Out of Stock', 'System Sync', '', '#1BA672', '#D1FAE5', timezone('utc'::text, now()) - INTERVAL '2 hours');
