-- kalaa (art) platform schema
-- Note: Uses simple MySQL tables (InnoDB) suitable for mysql2 + prepared statements.
-- This schema supports:
-- - Admin login and management
-- - Artists + applications
-- - Arts (sellable artworks) with multiple images (original, watermarked, thumbnail)
-- - Orders with order_items for cart or single-art checkout
-- - Contact messages
-- - Daily page views (aggregate lifetime from sums)
--
-- Conventions
-- - Timestamps default to CURRENT_TIMESTAMP; updated_at auto-updates where applicable
-- - Soft deletes via deleted_at where historical data matters
-- - Slugs for pretty URLs on artists and arts
-- - Minimal constraints; enforce additional business rules at the app layer

-- Ensure proper engine and charset per table

-- =========================================================
--  TABLE: admins
-- =========================================================
CREATE TABLE IF NOT EXISTS admins (
    admin_id       INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(100) NOT NULL UNIQUE,
    -- Optionally add email later if needed
    password_hash  VARCHAR(255) NOT NULL,
    last_login_at  TIMESTAMP NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: artists
-- =========================================================
CREATE TABLE IF NOT EXISTS artists (
    artist_id        INT AUTO_INCREMENT PRIMARY KEY,
    slug             VARCHAR(200) UNIQUE,
    full_name        VARCHAR(200) NOT NULL,
    avatar_path      VARCHAR(255),
    specialty        VARCHAR(200),
    age              INT,
    bio              TEXT,
    contact_email    VARCHAR(150),
    contact_phone    VARCHAR(50),
    instagram        VARCHAR(150),
    open_to_commissions BOOLEAN DEFAULT FALSE,
    hireable         BOOLEAN DEFAULT FALSE,
    joined_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status           ENUM('active','inactive') DEFAULT 'active',
    deleted_at       TIMESTAMP NULL,
    INDEX idx_artists_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: artist_applications (Register Artist Requests)
-- =========================================================
CREATE TABLE IF NOT EXISTS artist_applications (
    application_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name        VARCHAR(200) NOT NULL,
    age              INT,
    started_art_since YEAR,
    school           VARCHAR(200),
    location         VARCHAR(200),
    extra_message    TEXT,
    contact_email    VARCHAR(150),
    contact_phone    VARCHAR(50),
    instagram        VARCHAR(150),
    status           ENUM('pending','approved','rejected') DEFAULT 'pending',
    submitted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      TIMESTAMP NULL,
    INDEX idx_artist_applications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: arts (sellable artworks)
-- =========================================================
CREATE TABLE IF NOT EXISTS arts (
    art_id          INT AUTO_INCREMENT PRIMARY KEY,
    artist_id       INT NOT NULL,
    slug            VARCHAR(255) UNIQUE,
    title           VARCHAR(255) NOT NULL,
    type            VARCHAR(100), -- e.g., sketch, portrait, watercolor, etc.
    description     TEXT,
    materials       VARCHAR(255), -- e.g., graphite, acrylic
    paper           VARCHAR(255), -- e.g., 300gsm cold press
    style           VARCHAR(100), -- e.g., realism, abstract
    width_mm        INT,
    height_mm       INT,
    colors          TEXT,         -- freeform/CSV description of colors used
    price           DECIMAL(10,2) NOT NULL,
    stock           INT DEFAULT 1, -- one-of-a-kind defaults to 1
    status          ENUM('draft','listed','unlisted','sold') DEFAULT 'listed',
    primary_image_id INT NULL, -- FK to art_images.image_id (cover)
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    CONSTRAINT fk_arts_artist
        FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_arts_artist (artist_id),
    INDEX idx_arts_status (status),
    INDEX idx_arts_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: art_images (multiple images per artwork)
-- =========================================================
CREATE TABLE IF NOT EXISTS art_images (
    image_id          INT AUTO_INCREMENT PRIMARY KEY,
    art_id            INT NOT NULL,
    original_path     VARCHAR(255) NOT NULL,
    watermarked_path  VARCHAR(255) NOT NULL,
    thumb_path        VARCHAR(255) NOT NULL,
    mime              VARCHAR(100),
    width_px          INT,
    height_px         INT,
    size_kb           INT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_art_images_art
        FOREIGN KEY (art_id) REFERENCES arts(art_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_art_images_art (art_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link arts.primary_image_id to art_images
ALTER TABLE arts
    ADD CONSTRAINT fk_arts_primary_image
    FOREIGN KEY (primary_image_id) REFERENCES art_images(image_id)
    ON UPDATE SET NULL ON DELETE SET NULL;

-- =========================================================
--  TABLE: orders (buying requests; delivered => sold products)
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    order_code      VARCHAR(32) NOT NULL UNIQUE, -- human-readable code generated by app
    buyer_name      VARCHAR(200) NOT NULL,
    contact_phone   VARCHAR(50)  NOT NULL,
    contact_email   VARCHAR(150),
    note            TEXT, -- extra message from buyer
    status          ENUM('received','viewed','contacted','delivering','delivered','cancelled') DEFAULT 'received',
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reservation_expires_at DATETIME NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    INDEX idx_orders_status (status),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: order_items (supports cart or single-item orders)
-- =========================================================
CREATE TABLE IF NOT EXISTS order_items (
    item_id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    art_id          INT NULL, -- keep nullable so orders remain intact if art is later removed
    title_snapshot  VARCHAR(255) NOT NULL,
    price_snapshot  DECIMAL(10,2) NOT NULL,
    image_snapshot  VARCHAR(255), -- optional cover image path at time of purchase
    qty             INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_order_items_art
        FOREIGN KEY (art_id) REFERENCES arts(art_id)
        ON UPDATE SET NULL ON DELETE SET NULL,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_art (art_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: contact_messages (About/Contact page submissions)
-- =========================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    message_id     INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(200) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    phone          VARCHAR(50),
    subject        VARCHAR(200),
    message        TEXT NOT NULL,
    status         ENUM('unread','read','deleted') DEFAULT 'unread',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_messages_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
--  TABLE: page_views_daily (aggregate counts per day)
-- =========================================================
CREATE TABLE IF NOT EXISTS page_views_daily (
    view_date DATE PRIMARY KEY,
    views     INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional view to simplify "sold products" queries (delivered orders)
-- CREATE OR REPLACE VIEW sold_orders AS
-- SELECT o.order_id, o.order_code, o.buyer_name, o.contact_phone, o.contact_email,
--        o.total_amount, o.created_at AS ordered_at, o.updated_at AS delivered_at
-- FROM orders o
-- WHERE o.status = 'delivered' AND o.deleted_at IS NULL;

-- End of schema
