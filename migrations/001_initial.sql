// migration.js - Run this in your Cloudflare Worker
export async function migrateDatabase(env) {
    const migrations = [
        // 1. Create brands table
        `CREATE TABLE IF NOT EXISTS brands (
            brand_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            artist_id TEXT UNIQUE REFERENCES artists(artist_id),
            brand_name TEXT NOT NULL,
            brand_slug TEXT UNIQUE NOT NULL,
            brand_email TEXT,
            brand_phone TEXT,
            logo_url TEXT,
            brand_feeling TEXT,
            primary_color TEXT DEFAULT '#000000',
            secondary_color TEXT DEFAULT '#ffffff',
            accent_color TEXT DEFAULT '#ff6b6b',
            font_primary TEXT DEFAULT 'Inter',
            font_secondary TEXT DEFAULT 'Inter',
            store_status TEXT DEFAULT 'draft',
            store_hours TEXT,
            whatsapp_number TEXT,
            custom_domain TEXT,
            subscription_plan TEXT DEFAULT 'launch',
            subscription_status TEXT DEFAULT 'active',
            is_founder BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            deleted_at TEXT
        )`,
        
        // 2. Link artists to brands (for existing data)
        `INSERT OR IGNORE INTO brands (artist_id, brand_name, brand_slug, brand_email, brand_phone)
         SELECT 
            artist_id,
            artist_name,
            lower(replace(artist_name, ' ', '-')),
            email,
            phone
         FROM artists 
         WHERE artist_id NOT IN (SELECT artist_id FROM brands WHERE artist_id IS NOT NULL)`,
        
        // 3. Add new columns to existing tables
        `ALTER TABLE products ADD COLUMN brand_id TEXT REFERENCES brands(brand_id)`,
        `ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'draft'`,
        `ALTER TABLE products ADD COLUMN sku TEXT UNIQUE`,
        `ALTER TABLE products ADD COLUMN weight_grams INTEGER`,
        `ALTER TABLE products ADD COLUMN dimensions TEXT`,
        `ALTER TABLE products ADD COLUMN mockup_data TEXT`,
        `ALTER TABLE products ADD COLUMN published_at TEXT`,
        `ALTER TABLE products ADD COLUMN is_mockup_generated BOOLEAN DEFAULT 0`,
        `ALTER TABLE products ADD COLUMN design_id TEXT`,
        
        // 4. Update products with brand_id
        `UPDATE products 
         SET brand_id = (
             SELECT brand_id FROM brands 
             WHERE brands.artist_id = products.artist_id 
             LIMIT 1
         )
         WHERE artist_id IS NOT NULL AND brand_id IS NULL`,
        
        // 5. Create designs table
        `CREATE TABLE IF NOT EXISTS designs (
            design_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            brand_id TEXT REFERENCES brands(brand_id),
            product_id TEXT REFERENCES products(product_id),
            design_name TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            width_px INTEGER,
            height_px INTEGER,
            has_transparency BOOLEAN DEFAULT 0,
            is_transparent BOOLEAN DEFAULT 0,
            print_ready BOOLEAN DEFAULT 0,
            placement_data TEXT,
            status TEXT DEFAULT 'uploaded',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // 6. Add columns to product_variants
        `ALTER TABLE product_variants ADD COLUMN brand_id TEXT REFERENCES brands(brand_id)`,
        `ALTER TABLE product_variants ADD COLUMN color_hex TEXT`,
        `ALTER TABLE product_variants ADD COLUMN price_adjustment REAL DEFAULT 0`,
        `ALTER TABLE product_variants ADD COLUMN low_stock_threshold INTEGER DEFAULT 5`,
        `ALTER TABLE product_variants ADD COLUMN mockup_url TEXT`,
        
        // 7. Create domains table
        `CREATE TABLE IF NOT EXISTS domains (
            domain_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            brand_id TEXT REFERENCES brands(brand_id),
            domain_name TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'pending',
            is_primary BOOLEAN DEFAULT 0,
            ssl_status TEXT DEFAULT 'pending',
            dns_records TEXT,
            verification_token TEXT,
            verified_at TEXT,
            expires_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // 8. Add columns to orders
        `ALTER TABLE orders ADD COLUMN brand_id TEXT REFERENCES brands(brand_id)`,
        `ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE`,
        `ALTER TABLE orders ADD COLUMN shipping_province TEXT`,
        `ALTER TABLE orders ADD COLUMN shipping_country TEXT DEFAULT 'Zimbabwe'`,
        `ALTER TABLE orders ADD COLUMN shipping_postal_code TEXT`,
        `ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0`,
        `ALTER TABLE orders ADD COLUMN tax_amount REAL DEFAULT 0`,
        `ALTER TABLE orders ADD COLUMN shipping_amount REAL DEFAULT 0`,
        `ALTER TABLE orders ADD COLUMN production_method TEXT`,
        `ALTER TABLE orders ADD COLUMN fulfilment_data TEXT`,
        `ALTER TABLE orders ADD COLUMN tracking_number TEXT`,
        `ALTER TABLE orders ADD COLUMN shipping_carrier TEXT`,
        `ALTER TABLE orders ADD COLUMN estimated_delivery TEXT`,
        `ALTER TABLE orders ADD COLUMN delivered_at TEXT`,
        
        // 9. Generate order numbers
        `UPDATE orders 
         SET order_number = 'ORD-' || substr(hex(randomblob(4)), 1, 8) || '-' || substr(order_id, 1, 6)
         WHERE order_number IS NULL`,
        
        // 10. Add columns to users
        `ALTER TABLE users ADD COLUMN brand_id TEXT REFERENCES brands(brand_id)`,
        `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'`,
        `ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1`,
        `ALTER TABLE users ADD COLUMN last_login TEXT`,
        `ALTER TABLE users ADD COLUMN whatsapp_otp TEXT`,
        `ALTER TABLE users ADD COLUMN whatsapp_otp_expires TEXT`,
        
        // 11. Create audit_logs
        `CREATE TABLE IF NOT EXISTS audit_logs (
            log_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            brand_id TEXT REFERENCES brands(brand_id),
            user_id TEXT REFERENCES users(user_id),
            action TEXT NOT NULL,
            resource TEXT NOT NULL,
            resource_id TEXT,
            changes TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // 12. Create whatsapp_otps
        `CREATE TABLE IF NOT EXISTS whatsapp_otps (
            otp_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            phone_number TEXT NOT NULL,
            otp_code TEXT NOT NULL,
            attempts INTEGER DEFAULT 0,
            is_used BOOLEAN DEFAULT 0,
            expires_at TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // 13. Create subscription_history
        `CREATE TABLE IF NOT EXISTS subscription_history (
            history_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            brand_id TEXT REFERENCES brands(brand_id),
            plan TEXT NOT NULL,
            status TEXT NOT NULL,
            fee_percentage INTEGER,
            max_products INTEGER,
            changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            changed_by TEXT REFERENCES users(user_id)
        )`,
        
        // 14. Add indexes for performance
        `CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON orders(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_variants_brand_id ON product_variants(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_users_brand_id ON users(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_designs_brand_id ON designs(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_domains_brand_id ON domains(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_audit_brand_id ON audit_logs(brand_id)`,
        `CREATE INDEX IF NOT EXISTS idx_sub_history_brand_id ON subscription_history(brand_id)`,
    ];
    
    // Execute migrations
    for (const sql of migrations) {
        try {
            await env.DB.exec(sql);
            console.log(`✅ Migration executed successfully`);
        } catch (error) {
            console.error(`❌ Migration failed: ${error.message}`);
            // Continue with next migration
        }
    }
}
