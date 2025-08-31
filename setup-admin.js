const bcrypt = require('bcrypt');
const { query } = require('./src/database/connection');

async function setupAdmin() {
    try {
        console.log('🔧 Setting up admin user...');
        
        // Create admin password hash
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Insert or update admin user
        await query(`
            INSERT INTO admins (username, password_hash, created_at) 
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            password_hash = VALUES(password_hash)
        `, ['admin', passwordHash]);
        
        console.log('✅ Admin user setup completed!');
        console.log('📝 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('🌐 Admin URL: http://localhost:3000/admin/login');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up admin:', error);
        process.exit(1);
    }
}

setupAdmin();
