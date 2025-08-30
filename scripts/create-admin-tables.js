const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Create admins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id     INT AUTO_INCREMENT PRIMARY KEY,
        username     VARCHAR(100) NOT NULL UNIQUE,
        email        VARCHAR(150) NOT NULL UNIQUE,
        password     VARCHAR(255) NOT NULL,
        full_name    VARCHAR(200) NOT NULL,
        role         ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
        last_login   TIMESTAMP NULL,
        is_active    BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_admins_username (username),
        INDEX idx_admins_email (email),
        INDEX idx_admins_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Admins table created/verified');

    // Create admin_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        log_id       INT AUTO_INCREMENT PRIMARY KEY,
        admin_id     INT NOT NULL,
        action       VARCHAR(100) NOT NULL,
        details      JSON NULL,
        ip_address   VARCHAR(45) NULL,
        user_agent   TEXT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_logs_admin (admin_id),
        INDEX idx_admin_logs_action (action),
        INDEX idx_admin_logs_created (created_at),
        FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Admin logs table created/verified');

    // Check if default admin exists
    const [admins] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    
    if (admins[0].count === 0) {
      // Create default admin (password: admin123)
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(`
        INSERT INTO admins (username, email, password, full_name, role) 
        VALUES ('admin', 'admin@kala.com', ?, 'System Administrator', 'super_admin')
      `, [hashedPassword]);
      
      console.log('✅ Default admin created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@kala.com');
    } else {
      console.log('✅ Admin users already exist');
    }

    console.log('\n🎉 Admin tables setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating admin tables:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminTables();
