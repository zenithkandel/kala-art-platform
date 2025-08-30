-- =========================================================
-- कला (KALA) ART PLATFORM - DATABASE SCHEMA
-- =========================================================
-- Created for: Young Artist Showcase & Sales Platform
-- Author: Zenith Kandel
-- Purpose: Supporting young artists (Grade 9-11) with recognition and income
-- Database: MySQL/MariaDB
-- Charset: UTF8MB4 for full Unicode support including Devanagari script
-- =========================================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS `kala_art_platform` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `kala_art_platform`;

-- =========================================================
--  TABLE: admins (Admin Authentication & Management)
-- =========================================================
CREATE TABLE IF NOT EXISTS admins (
    admin_id     INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,  -- bcrypt hashed password
    full_name    VARCHAR(200) NOT NULL,
    role         ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    last_login   TIMESTAMP NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admins_username (username),
    INDEX idx_admins_email (email),
    INDEX idx_admins_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: artists (Approved Artists on Platform)
-- =========================================================
CREATE TABLE IF NOT EXISTS artists (
    artist_id        INT AUTO_INCREMENT PRIMARY KEY,
    slug             VARCHAR(200) UNIQUE NOT NULL, -- URL-friendly identifier
    full_name        VARCHAR(200) NOT NULL,
    profile_picture  VARCHAR(255) DEFAULT NULL,
    bio              TEXT,
    specialty        VARCHAR(200), -- e.g., "Portrait Artist", "Digital Art"
    age              INT CHECK (age >= 10 AND age <= 25),
    school           VARCHAR(200),
    location         VARCHAR(200),
    contact_email    VARCHAR(150),
    contact_phone    VARCHAR(50),
    instagram        VARCHAR(150),
    other_socials    JSON, -- Store additional social media links
    open_to_commissions BOOLEAN DEFAULT FALSE,
    hireable         BOOLEAN DEFAULT FALSE,
    arts_uploaded    INT DEFAULT 0, -- Cached count for performance
    arts_sold        INT DEFAULT 0, -- Cached count for performance
    total_earnings   DECIMAL(12,2) DEFAULT 0.00,
    joined_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status           ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    featured         BOOLEAN DEFAULT FALSE, -- For highlighting special artists
    deleted_at       TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_artists_slug (slug),
    INDEX idx_artists_status (status),
    INDEX idx_artists_featured (featured),
    INDEX idx_artists_specialty (specialty),
    FULLTEXT idx_artists_search (full_name, bio, specialty, location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: artist_applications (New Artist Registration Requests)
-- =========================================================
CREATE TABLE IF NOT EXISTS artist_applications (
    application_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name        VARCHAR(200) NOT NULL,
    age              INT CHECK (age >= 10 AND age <= 25),
    started_art_since YEAR,
    school           VARCHAR(200),
    location         VARCHAR(200),
    extra_message    TEXT,
    contact_email    VARCHAR(150) NOT NULL,
    contact_phone    VARCHAR(50),
    instagram        VARCHAR(150),
    portfolio_links  TEXT, -- Links to existing portfolios/social media
    status           ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    admin_notes      TEXT, -- Internal notes for admin review
    submitted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      TIMESTAMP NULL,
    reviewed_by      INT NULL, -- FK to admins table
    created_artist_id INT NULL, -- FK to artists table when approved
    INDEX idx_applications_status (status),
    INDEX idx_applications_submitted (submitted_at),
    FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id) ON DELETE SET NULL,
    FOREIGN KEY (created_artist_id) REFERENCES artists(artist_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: art_categories (Categories for Better Organization)
-- =========================================================
CREATE TABLE IF NOT EXISTS art_categories (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    slug          VARCHAR(100) NOT NULL UNIQUE,
    description   TEXT,
    icon_class    VARCHAR(100), -- FontAwesome icon class
    display_order INT DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO art_categories (name, slug, description, icon_class, display_order) VALUES
('Sketches', 'sketches', 'Hand-drawn sketches and pencil art', 'fa-pencil', 1),
('Paintings', 'paintings', 'Watercolor, acrylic, and oil paintings', 'fa-palette', 2),
('Portraits', 'portraits', 'Human and animal portraits', 'fa-user-tie', 3),
('Digital Art', 'digital', 'Digital illustrations and artwork', 'fa-tablet-screen-button', 4),
('Abstract', 'abstract', 'Abstract and conceptual art', 'fa-shapes', 5),
('Landscapes', 'landscapes', 'Nature and landscape art', 'fa-mountain', 6);

-- =========================================================
--  TABLE: arts (Sellable Artworks)
-- =========================================================
CREATE TABLE IF NOT EXISTS arts (
    art_id          INT AUTO_INCREMENT PRIMARY KEY,
    artist_id       INT NOT NULL,
    category_id     INT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    materials       VARCHAR(255), -- e.g., "Graphite on 300gsm paper"
    paper_type      VARCHAR(100), -- e.g., "300gsm cold press"
    style           VARCHAR(100), -- e.g., "Realism", "Abstract"
    width_mm        INT, -- Artwork dimensions
    height_mm       INT,
    colors_used     TEXT, -- Description of colors/palette
    price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price  DECIMAL(10,2) NULL, -- For sale/discount tracking
    stock_quantity  INT DEFAULT 1 CHECK (stock_quantity >= 0),
    is_original     BOOLEAN DEFAULT TRUE, -- Original vs Print
    is_framed       BOOLEAN DEFAULT FALSE,
    tags            TEXT, -- Comma-separated tags for search
    view_count      INT DEFAULT 0,
    like_count      INT DEFAULT 0,
    status          ENUM('draft', 'listed', 'unlisted', 'sold', 'reserved') DEFAULT 'listed',
    featured        BOOLEAN DEFAULT FALSE,
    admin_approved  BOOLEAN DEFAULT FALSE,
    primary_image   VARCHAR(255), -- Main display image (watermarked)
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    INDEX idx_arts_artist (artist_id),
    INDEX idx_arts_category (category_id),
    INDEX idx_arts_slug (slug),
    INDEX idx_arts_status (status),
    INDEX idx_arts_featured (featured),
    INDEX idx_arts_price (price),
    INDEX idx_arts_created (created_at),
    FULLTEXT idx_arts_search (title, description, materials, style, tags),
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES art_categories(category_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: art_images (Multiple Images per Artwork)
-- =========================================================
CREATE TABLE IF NOT EXISTS art_images (
    image_id          INT AUTO_INCREMENT PRIMARY KEY,
    art_id            INT NOT NULL,
    file_name         VARCHAR(255) NOT NULL,
    original_path     VARCHAR(500) NOT NULL, -- Full resolution without watermark
    watermarked_path  VARCHAR(500) NOT NULL, -- Public display version
    thumbnail_path    VARCHAR(500) NOT NULL, -- Small preview
    file_size_kb      INT,
    width_px          INT,
    height_px         INT,
    mime_type         VARCHAR(100),
    is_primary        BOOLEAN DEFAULT FALSE,
    display_order     INT DEFAULT 0,
    alt_text          VARCHAR(255), -- Accessibility
    uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_art_images_art (art_id),
    INDEX idx_art_images_primary (is_primary),
    FOREIGN KEY (art_id) REFERENCES arts(art_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: orders (Customer Purchase Requests)
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id         INT AUTO_INCREMENT PRIMARY KEY,
    order_code       VARCHAR(20) NOT NULL UNIQUE, -- Human-readable order ID
    customer_name    VARCHAR(200) NOT NULL,
    customer_phone   VARCHAR(50) NOT NULL,
    customer_email   VARCHAR(150),
    shipping_address TEXT,
    customer_message TEXT,
    total_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    item_count       INT NOT NULL DEFAULT 0,
    status           ENUM('received', 'viewed', 'contacted', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled', 'refunded') DEFAULT 'received',
    payment_status   ENUM('pending', 'advance_paid', 'full_paid', 'refunded') DEFAULT 'pending',
    estimated_delivery DATE NULL,
    actual_delivery   DATE NULL,
    admin_notes      TEXT,
    tracking_info    VARCHAR(255),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_code (order_code),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_customer (customer_phone, customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: order_items (Items in Each Order - Supports Cart)
-- =========================================================
CREATE TABLE IF NOT EXISTS order_items (
    item_id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    art_id          INT NULL, -- NULL if art is deleted later
    quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    -- Snapshot data at time of order (preserves info if art is modified/deleted)
    art_title       VARCHAR(255) NOT NULL,
    art_price       DECIMAL(10,2) NOT NULL,
    art_image       VARCHAR(500),
    artist_name     VARCHAR(200),
    line_total      DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_art (art_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (art_id) REFERENCES arts(art_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: contact_messages (Contact Form Submissions)
-- =========================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    message_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(200) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(50),
    subject         VARCHAR(200),
    message         TEXT NOT NULL,
    ip_address      VARCHAR(45), -- For spam prevention
    user_agent      TEXT,
    status          ENUM('unread', 'read', 'replied', 'archived', 'spam') DEFAULT 'unread',
    admin_reply     TEXT,
    replied_at      TIMESTAMP NULL,
    replied_by      INT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_status (status),
    INDEX idx_contact_created (created_at),
    FOREIGN KEY (replied_by) REFERENCES admins(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: newsletter_subscriptions (Email Newsletter)
-- =========================================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    full_name       VARCHAR(200),
    status          ENUM('active', 'unsubscribed', 'bounced') DEFAULT 'active',
    ip_address      VARCHAR(45),
    subscribed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_newsletter_email (email),
    INDEX idx_newsletter_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: page_views (Site Analytics)
-- =========================================================
CREATE TABLE IF NOT EXISTS page_views (
    view_id       INT AUTO_INCREMENT PRIMARY KEY,
    page_type     VARCHAR(50) NOT NULL, -- 'home', 'art_detail', 'artist_profile', etc.
    page_id       INT NULL, -- ID of specific art/artist if applicable
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    referrer      VARCHAR(500),
    session_id    VARCHAR(100),
    view_date     DATE NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_views_date (view_date),
    INDEX idx_views_page (page_type, page_id),
    INDEX idx_views_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: page_views_daily (Aggregated Daily Stats)
-- =========================================================
CREATE TABLE IF NOT EXISTS page_views_daily (
    view_date    DATE PRIMARY KEY,
    total_views  INT NOT NULL DEFAULT 0,
    unique_visitors INT NOT NULL DEFAULT 0,
    home_views   INT NOT NULL DEFAULT 0,
    art_views    INT NOT NULL DEFAULT 0,
    artist_views INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: site_settings (Configurable Platform Settings)
-- =========================================================
CREATE TABLE IF NOT EXISTS site_settings (
    setting_id    INT AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type  ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description   TEXT,
    is_public     BOOLEAN DEFAULT FALSE, -- Can be accessed via API
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    INT NULL,
    FOREIGN KEY (updated_by) REFERENCES admins(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'कला', 'string', 'Platform name', true),
('site_description', 'A platform for young artists to showcase and sell their artwork', 'string', 'Site description', true),
('contact_email', 'hello@kala.art', 'string', 'Primary contact email', true),
('featured_arts_limit', '12', 'number', 'Number of featured arts on homepage', false),
('order_confirmation_email', 'true', 'boolean', 'Send order confirmation emails', false),
('min_artist_age', '10', 'number', 'Minimum age for artist registration', false),
('max_artist_age', '25', 'number', 'Maximum age for artist registration', false);

-- =========================================================
--  TABLE: admin_activity_log (Admin Action Tracking)
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
    log_id        INT AUTO_INCREMENT PRIMARY KEY,
    admin_id      INT NOT NULL,
    action        VARCHAR(100) NOT NULL, -- 'login', 'create_art', 'approve_artist', etc.
    table_name    VARCHAR(50), -- Which table was affected
    record_id     INT, -- ID of affected record
    old_values    JSON, -- Previous values (for updates)
    new_values    JSON, -- New values
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_log_admin (admin_id),
    INDEX idx_admin_log_action (action),
    INDEX idx_admin_log_created (created_at),
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TRIGGERS (Automated Data Maintenance)
-- =========================================================

-- Update artist stats when arts are added/sold
DELIMITER $$

CREATE TRIGGER update_artist_stats_after_art_insert
AFTER INSERT ON arts
FOR EACH ROW
BEGIN
    UPDATE artists 
    SET arts_uploaded = arts_uploaded + 1 
    WHERE artist_id = NEW.artist_id;
END$$

CREATE TRIGGER update_artist_stats_after_art_delete
AFTER DELETE ON arts
FOR EACH ROW
BEGIN
    UPDATE artists 
    SET arts_uploaded = GREATEST(arts_uploaded - 1, 0)
    WHERE artist_id = OLD.artist_id;
END$$

CREATE TRIGGER update_artist_sales_after_order_delivered
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE artists a
        INNER JOIN order_items oi ON oi.art_id IN (
            SELECT art_id FROM arts WHERE artist_id = a.artist_id
        )
        INNER JOIN orders o ON o.order_id = oi.order_id
        SET a.arts_sold = a.arts_sold + oi.quantity,
            a.total_earnings = a.total_earnings + oi.line_total
        WHERE o.order_id = NEW.order_id;
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- VIEWS (Convenience Queries)
-- =========================================================

-- Active arts with artist info
CREATE OR REPLACE VIEW active_arts_view AS
SELECT 
    a.art_id, a.slug, a.title, a.description, a.price, a.primary_image,
    a.view_count, a.like_count, a.featured, a.created_at,
    ar.artist_id, ar.full_name as artist_name, ar.slug as artist_slug,
    ac.name as category_name, ac.slug as category_slug
FROM arts a
INNER JOIN artists ar ON a.artist_id = ar.artist_id
LEFT JOIN art_categories ac ON a.category_id = ac.category_id
WHERE a.status = 'listed' 
    AND a.deleted_at IS NULL 
    AND ar.status = 'active' 
    AND ar.deleted_at IS NULL
ORDER BY a.featured DESC, a.created_at DESC;

-- Order summary with items
CREATE OR REPLACE VIEW order_summary_view AS
SELECT 
    o.order_id, o.order_code, o.customer_name, o.customer_phone,
    o.status, o.total_amount, o.item_count, o.created_at,
    GROUP_CONCAT(CONCAT(oi.art_title, ' (₹', oi.art_price, ')') SEPARATOR ', ') as items_summary
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY o.order_id
ORDER BY o.created_at DESC;

-- Platform statistics
CREATE OR REPLACE VIEW platform_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM artists WHERE status = 'active' AND deleted_at IS NULL) as total_artists,
    (SELECT COUNT(*) FROM arts WHERE status = 'listed' AND deleted_at IS NULL) as total_arts,
    (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as total_sales,
    (SELECT COALESCE(SUM(total_views), 0) FROM page_views_daily) as total_views,
    (SELECT COUNT(*) FROM contact_messages WHERE status = 'unread') as unread_messages,
    (SELECT COUNT(*) FROM artist_applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM orders WHERE status IN ('received', 'viewed', 'contacted', 'confirmed', 'preparing', 'delivering')) as active_orders;

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_arts_status_featured ON arts(status, featured, created_at);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_page_views_date_type ON page_views(view_date, page_type);

-- =========================================================
-- INITIAL DATA (Default Admin User)
-- =========================================================

-- Insert default admin (password: 'admin123' - CHANGE IN PRODUCTION!)
INSERT INTO admins (username, email, password, full_name, role) VALUES 
('admin', 'admin@kala.art', '$2b$12$mj0yXy1E04VQN30mG/ArZuo5lqf3bOeoN2raRvdbDzTMFvU1i.E82', 'Platform Administrator', 'super_admin');

-- =========================================================
-- SCHEMA COMPLETE
-- =========================================================
-- This schema supports:
-- ✅ Young artist registration and approval
-- ✅ Artwork upload and management
-- ✅ Custom order system (no payment gateway)
-- ✅ Admin dashboard with full analytics
-- ✅ Contact forms and newsletter
-- ✅ Multi-image support for artworks
-- ✅ SEO-friendly URLs with slugs
-- ✅ Comprehensive analytics and reporting
-- ✅ Role-based admin access
-- ✅ Soft deletes for data preservation
-- ✅ Performance optimized with proper indexing
-- =========================================================
