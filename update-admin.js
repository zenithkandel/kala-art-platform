const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAdminPassword() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
    });

    // Update admin password with correct hash
    const correctHash = '$2b$10$0/0mPX9wDseUZF9aWZ4N3OclYJbCil6EgQdLeJIN398UnnKV.bSPG';
    
    await connection.execute(
        'UPDATE admins SET password_hash = ? WHERE username = ?',
        [correctHash, 'admin']
    );
    
    console.log('✅ Admin password updated successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    await connection.end();
}

updateAdminPassword().catch(console.error);
