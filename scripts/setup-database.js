const { query } = require('../src/database/connection');

async function createEssentialTables() {
  try {
    console.log('Creating essential tables for कला Art Platform...\n');

    // Create artists table
    console.log('📝 Creating artists table...');
    await query(`
      CREATE TABLE IF NOT EXISTS artists (
        artist_id        INT AUTO_INCREMENT PRIMARY KEY,
        slug             VARCHAR(200) UNIQUE NOT NULL,
        full_name        VARCHAR(200) NOT NULL,
        profile_picture  VARCHAR(255) DEFAULT NULL,
        bio              TEXT,
        specialty        VARCHAR(200),
        age              INT CHECK (age >= 10 AND age <= 25),
        school           VARCHAR(200),
        location         VARCHAR(200),
        contact_email    VARCHAR(150),
        phone            VARCHAR(50),
        status           ENUM('pending', 'active', 'inactive', 'suspended') DEFAULT 'pending',
        featured         BOOLEAN DEFAULT FALSE,
        total_artworks   INT DEFAULT 0,
        total_sales      DECIMAL(10,2) DEFAULT 0.00,
        join_date        DATE DEFAULT (CURRENT_DATE),
        last_active      TIMESTAMP NULL,
        social_instagram VARCHAR(200),
        social_facebook  VARCHAR(200),
        social_website   VARCHAR(200),
        deleted_at       TIMESTAMP NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_artists_slug (slug),
        INDEX idx_artists_status (status),
        INDEX idx_artists_featured (featured),
        INDEX idx_artists_deleted (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Artists table created');

    // Create arts table
    console.log('📝 Creating arts table...');
    await query(`
      CREATE TABLE IF NOT EXISTS arts (
        art_id           INT AUTO_INCREMENT PRIMARY KEY,
        artist_id        INT NOT NULL,
        slug             VARCHAR(200) UNIQUE NOT NULL,
        title            VARCHAR(255) NOT NULL,
        description      TEXT,
        price            DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        category         VARCHAR(100) NOT NULL,
        medium           VARCHAR(100),
        dimensions       VARCHAR(100),
        year_created     YEAR,
        colors           JSON,
        tags             JSON,
        image_primary    VARCHAR(500),
        images_gallery   JSON,
        status           ENUM('draft', 'listed', 'sold', 'reserved', 'unlisted') DEFAULT 'draft',
        featured         BOOLEAN DEFAULT FALSE,
        views            INT DEFAULT 0,
        likes            INT DEFAULT 0,
        commission_available BOOLEAN DEFAULT FALSE,
        is_original      BOOLEAN DEFAULT TRUE,
        edition_size     INT NULL,
        edition_number   INT NULL,
        certificate_authenticity BOOLEAN DEFAULT FALSE,
        shipping_included BOOLEAN DEFAULT FALSE,
        processing_days  INT DEFAULT 7,
        weight_grams     INT,
        deleted_at       TIMESTAMP NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_arts_artist (artist_id),
        INDEX idx_arts_slug (slug),
        INDEX idx_arts_status (status),
        INDEX idx_arts_category (category),
        INDEX idx_arts_featured (featured),
        INDEX idx_arts_price (price),
        INDEX idx_arts_created (created_at),
        INDEX idx_arts_deleted (deleted_at),
        FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Arts table created');

    // Create orders table
    console.log('📝 Creating orders table...');
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id         INT AUTO_INCREMENT PRIMARY KEY,
        order_code       VARCHAR(50) UNIQUE NOT NULL,
        customer_name    VARCHAR(200) NOT NULL,
        customer_email   VARCHAR(150) NOT NULL,
        customer_phone   VARCHAR(50) NOT NULL,
        customer_address TEXT,
        customer_city    VARCHAR(100),
        customer_postal  VARCHAR(20),
        total_amount     DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
        currency         VARCHAR(3) DEFAULT 'NPR',
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Orders table created');

    // Add sample data
    console.log('\n📊 Adding sample data...');
    
    // Sample artists
    await query(`
      INSERT IGNORE INTO artists (artist_id, slug, full_name, bio, specialty, age, school, location, contact_email, status) VALUES
      (1, 'alice-patel', 'Alice Patel', 'Young landscape artist from Kathmandu with a passion for capturing Nepal natural beauty', 'Landscape Painting', 16, 'Kathmandu Model Secondary School', 'Kathmandu', 'alice.patel@example.com', 'active'),
      (2, 'rajesh-shrestha', 'Rajesh Shrestha', 'Digital artist creating modern interpretations of traditional Nepali culture', 'Digital Art', 17, 'Patan Arts Academy', 'Lalitpur', 'rajesh.shrestha@example.com', 'active'),
      (3, 'priya-gurung', 'Priya Gurung', 'Portrait artist specializing in traditional and contemporary portraits', 'Portrait Art', 15, 'Pokhara Valley School', 'Pokhara', 'priya.gurung@example.com', 'active'),
      (4, 'suman-tamang', 'Suman Tamang', 'Abstract artist exploring colors and emotions through mixed media', 'Abstract Art', 16, 'Bhaktapur Art Institute', 'Bhaktapur', 'suman.tamang@example.com', 'active'),
      (5, 'maya-rai', 'Maya Rai', 'Traditional artist working with local materials and cultural themes', 'Traditional Art', 17, 'Dharan Arts College', 'Dharan', 'maya.rai@example.com', 'active')
    `);
    
    // Sample artworks
    await query(`
      INSERT IGNORE INTO arts (art_id, artist_id, slug, title, description, price, category, medium, dimensions, status) VALUES
      (1, 1, 'himalayan-sunrise', 'Himalayan Sunrise', 'Breathtaking sunrise over the Himalayan peaks captured in vibrant oils', 3500.00, 'Landscape', 'Oil on Canvas', '40x60 cm', 'listed'),
      (2, 1, 'kathmandu-valley-mist', 'Kathmandu Valley in Morning Mist', 'Peaceful morning scene of Kathmandu valley shrouded in mist', 2800.00, 'Landscape', 'Watercolor', '30x45 cm', 'listed'),
      (3, 1, 'temple-reflection', 'Temple Reflection', 'Ancient temple reflected in still waters', 3200.00, 'Landscape', 'Oil on Canvas', '35x50 cm', 'listed'),
      (4, 2, 'digital-mandala', 'Digital Mandala Dreams', 'Contemporary digital interpretation of traditional Nepali mandala art', 2200.00, 'Digital', 'Digital Print', '50x50 cm', 'listed'),
      (5, 2, 'cyber-kathmandu', 'Cyber Kathmandu 2050', 'Futuristic vision of Kathmandu blending tradition with technology', 2800.00, 'Digital', 'Digital Print', '60x40 cm', 'listed'),
      (6, 3, 'grandmother-portrait', 'Portrait of Grandmother', 'Loving portrait of elderly Nepali woman in traditional dress', 4200.00, 'Portrait', 'Acrylic on Canvas', '45x60 cm', 'listed'),
      (7, 3, 'young-monk', 'Young Monk in Meditation', 'Serene portrait of a young Buddhist monk', 3800.00, 'Portrait', 'Oil on Canvas', '40x55 cm', 'listed'),
      (8, 4, 'emotion-waves', 'Waves of Emotion', 'Abstract representation of human emotions in bold colors', 2500.00, 'Abstract', 'Mixed Media', '50x70 cm', 'listed'),
      (9, 4, 'mountain-spirits', 'Mountain Spirits', 'Abstract interpretation of mountain energy and spirits', 2900.00, 'Abstract', 'Acrylic on Canvas', '60x80 cm', 'listed'),
      (10, 5, 'traditional-festival', 'Festival of Colors', 'Traditional Nepali festival scene with vibrant celebrations', 3600.00, 'Traditional', 'Tempera on Wood', '45x60 cm', 'listed'),
      (11, 1, 'sunset-peak', 'Golden Sunset Peak', 'Majestic mountain peak bathed in golden sunset light', 3100.00, 'Landscape', 'Oil on Canvas', '35x50 cm', 'sold'),
      (12, 2, 'heritage-digital', 'Digital Heritage', 'Modern digital art celebrating Nepali cultural heritage', 2400.00, 'Digital', 'Digital Print', '40x60 cm', 'sold')
    `);
    
    // Sample orders (some delivered = sold artworks)
    await query(`
      INSERT IGNORE INTO orders (order_id, order_code, customer_name, customer_email, customer_phone, total_amount, status) VALUES
      (1, 'KLA2025001', 'Amit Sharma', 'amit.sharma@email.com', '9841234567', 3100.00, 'delivered'),
      (2, 'KLA2025002', 'Sunita Thapa', 'sunita.thapa@email.com', '9847654321', 2400.00, 'delivered'),
      (3, 'KLA2025003', 'Ramesh Yadav', 'ramesh.yadav@email.com', '9845678901', 2800.00, 'preparing'),
      (4, 'KLA2025004', 'Kamala Devi', 'kamala.devi@email.com', '9842567890', 4200.00, 'confirmed'),
      (5, 'KLA2025005', 'Bikash Rana', 'bikash.rana@email.com', '9843456789', 2500.00, 'delivering')
    `);
    
    console.log('✅ Sample artists added (5 artists)');
    console.log('✅ Sample artworks added (12 artworks, 2 sold)');
    console.log('✅ Sample orders added (5 orders, 2 delivered)');
    
    console.log('\n🎉 Database setup complete!');
    console.log('📊 Current stats:');
    console.log('   - 5 Active Artists');
    console.log('   - 10 Listed Artworks');
    console.log('   - 2 Arts Sold');
    console.log('   - 3 Active Orders');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

createEssentialTables();
