require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dbService = require('../src/database/service');

async function initializeDatabase() {
  console.log('🚀 Initializing कला Art Platform Database...\n');
  
  try {
    // Create database connection without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'kala-art-platform';
    console.log(`📦 Creating database: ${dbName}`);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created successfully');
    
    // Switch to the database
    await connection.execute(`USE \`${dbName}\``);
    
    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔨 Executing ${statements.length} schema statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database schema created successfully');
    
    await connection.end();
    
    // Create default admin user
    console.log('\n👑 Creating default admin user...');
    
    try {
      const adminId = await dbService.createAdmin('admin', 'admin123');
      console.log('✅ Default admin user created successfully');
      console.log('📋 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   🚨 IMPORTANT: Change the password after first login!');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️  Admin user already exists, skipping creation');
      } else {
        throw error;
      }
    }
    
    // Insert sample data
    console.log('\n📊 Adding sample data...');
    
    // Add sample page views
    await dbService.recordPageView('2025-08-01');
    await dbService.recordPageView('2025-08-28');
    await dbService.recordPageView('2025-08-29');
    
    console.log('✅ Sample data added successfully');
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n🔗 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Visit admin panel: http://localhost:3000/admin/login');
    console.log('3. Login with admin/admin123');
    console.log('4. Change the default password');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase().then(() => process.exit(0));
}

module.exports = initializeDatabase;
