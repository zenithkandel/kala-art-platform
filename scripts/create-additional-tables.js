const { query } = require('../src/database/connection');

async function createAdditionalTables() {
  try {
    console.log('🔧 Creating additional tables for कला Platform...\n');

    // Create artist_applications table
    console.log('📝 Creating artist_applications table...');
    await query(`
      CREATE TABLE IF NOT EXISTS artist_applications (
        application_id   INT AUTO_INCREMENT PRIMARY KEY,
        full_name        VARCHAR(200) NOT NULL,
        age              INT NOT NULL CHECK (age >= 10 AND age <= 25),
        started_art_since INT,
        school           VARCHAR(200),
        location         VARCHAR(200),
        contact_email    VARCHAR(150),
        contact_phone    VARCHAR(50),
        instagram        VARCHAR(200),
        portfolio_link   VARCHAR(500),
        extra_message    TEXT,
        status           ENUM('pending', 'approved', 'rejected', 'on_hold') DEFAULT 'pending',
        admin_notes      TEXT,
        reviewed_by      INT NULL,
        reviewed_at      TIMESTAMP NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_applications_status (status),
        INDEX idx_applications_created (created_at),
        INDEX idx_applications_email (contact_email),
        FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Artist applications table created');

    // Create contact_messages table
    console.log('📝 Creating contact_messages table...');
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        message_id      INT AUTO_INCREMENT PRIMARY KEY,
        full_name       VARCHAR(200) NOT NULL,
        email           VARCHAR(150) NOT NULL,
        phone           VARCHAR(50),
        subject         VARCHAR(200),
        message         TEXT NOT NULL,
        ip_address      VARCHAR(45),
        user_agent      TEXT,
        status          ENUM('unread', 'read', 'replied', 'archived', 'spam') DEFAULT 'unread',
        priority        ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        category        VARCHAR(100),
        admin_reply     TEXT,
        replied_by      INT NULL,
        replied_at      TIMESTAMP NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_messages_status (status),
        INDEX idx_messages_priority (priority),
        INDEX idx_messages_created (created_at),
        INDEX idx_messages_email (email),
        FOREIGN KEY (replied_by) REFERENCES admins(admin_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Contact messages table created');

    // Create categories table for better organization
    console.log('📝 Creating categories table...');
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id     INT AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(100) NOT NULL UNIQUE,
        slug            VARCHAR(100) NOT NULL UNIQUE,
        description     TEXT,
        icon            VARCHAR(50),
        sort_order      INT DEFAULT 0,
        is_active       BOOLEAN DEFAULT TRUE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_categories_active (is_active),
        INDEX idx_categories_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Categories table created');

    // Add sample data
    console.log('\n📊 Adding sample data...');
    
    // Sample artist applications
    await query(`
      INSERT IGNORE INTO artist_applications (application_id, full_name, age, school, location, contact_email, contact_phone, status) VALUES
      (1, 'Anita Shrestha', 16, 'Kathmandu Arts High School', 'Kathmandu', 'anita.shrestha@example.com', '9841111111', 'pending'),
      (2, 'Bikram Adhikari', 17, 'Pokhara Valley School', 'Pokhara', 'bikram.adhikari@example.com', '9842222222', 'pending'),
      (3, 'Chhiring Lama', 15, 'Everest English School', 'Lalitpur', 'chhiring.lama@example.com', '9843333333', 'pending'),
      (4, 'Deepika Karki', 16, 'National Model College', 'Bhaktapur', 'deepika.karki@example.com', '9844444444', 'approved'),
      (5, 'Eshaan Rai', 17, 'St. Marys School', 'Dharan', 'eshaan.rai@example.com', '9845555555', 'rejected')
    `);
    console.log('✅ Sample artist applications added');

    // Sample contact messages
    await query(`
      INSERT IGNORE INTO contact_messages (message_id, full_name, email, phone, subject, message, status) VALUES
      (1, 'Rajesh Kumar', 'rajesh.kumar@email.com', '9851111111', 'Inquiry about custom artwork', 'I would like to commission a portrait of my family. Can you help me connect with the right artist?', 'unread'),
      (2, 'Sita Devi', 'sita.devi@email.com', '9852222222', 'Art exhibition proposal', 'I represent a local gallery and would like to discuss featuring young artists from your platform.', 'unread'),
      (3, 'Krishna Bahadur', 'krishna.bahadur@email.com', '9853333333', 'Payment issue', 'I made a payment for an artwork but have not received confirmation. Order ID: KLA2025003', 'read'),
      (4, 'Maya Gurung', 'maya.gurung@email.com', '9854444444', 'Artist partnership', 'I run an art supply store and would like to partner with young artists for discounts.', 'replied'),
      (5, 'Arjun Thapa', 'arjun.thapa@email.com', '9855555555', 'Website feedback', 'The platform is amazing! Just wanted to appreciate the work you are doing for young artists.', 'archived')
    `);
    console.log('✅ Sample contact messages added');

    // Sample categories
    await query(`
      INSERT IGNORE INTO categories (category_id, name, slug, description, icon, sort_order) VALUES
      (1, 'Landscape', 'landscape', 'Beautiful landscape paintings and drawings', 'fas fa-mountain', 1),
      (2, 'Portrait', 'portrait', 'Human portraits and character studies', 'fas fa-user', 2),
      (3, 'Abstract', 'abstract', 'Abstract and modern art pieces', 'fas fa-shapes', 3),
      (4, 'Digital Art', 'digital-art', 'Digital illustrations and designs', 'fas fa-laptop', 4),
      (5, 'Traditional', 'traditional', 'Traditional Nepali art and cultural pieces', 'fas fa-temple', 5),
      (6, 'Still Life', 'still-life', 'Still life paintings and studies', 'fas fa-apple-alt', 6)
    `);
    console.log('✅ Sample categories added');

    console.log('\n🎉 Additional tables setup complete!');
    console.log('📊 Added:');
    console.log('   - 5 Artist Applications (3 pending, 1 approved, 1 rejected)');
    console.log('   - 5 Contact Messages (2 unread, 1 read, 1 replied, 1 archived)');
    console.log('   - 6 Art Categories');
    
  } catch (error) {
    console.error('❌ Error creating additional tables:', error);
  }
}

createAdditionalTables();
