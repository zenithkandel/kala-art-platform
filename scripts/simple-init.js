const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    console.log('🚀 Starting simple database initialization...');
    
    let connection;
    try {
        // First connect without specifying database to create it
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ Connected to MySQL server');

        // Create database
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log('✅ Database created');

        // Close current connection and reconnect to the specific database
        await connection.end();
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME
        });
        
        console.log('✅ Connected to database');

        // Create admins table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Admins table created');

        // Create artists table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS artists (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                location VARCHAR(100),
                art_type VARCHAR(50),
                experience_years INT,
                bio TEXT,
                profile_image VARCHAR(255),
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Artists table created');

        // Create default admin user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.execute(`
            INSERT IGNORE INTO admins (username, password, email) 
            VALUES (?, ?, ?)
        `, ['admin', hashedPassword, 'admin@kala.com']);
        
        console.log('✅ Default admin user created (username: admin, password: admin123)');
        console.log('🎉 Database initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDatabase();
