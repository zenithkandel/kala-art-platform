const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLargeNumbersTest() {
  let connection;
  
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kala_art',
      port: process.env.DB_PORT || 3306
    };
    
    connection = await mysql.createConnection(config);
    console.log('Connected to database');

    // Update existing page views to large numbers
    console.log('Adding large page view numbers...');
    
    // Insert/update large numbers for testing
    await connection.execute(`
      INSERT INTO page_views_daily (view_date, total_views, unique_visitors, home_views, art_views, artist_views) 
      VALUES ('2025-08-30', 5672, 1200, 3000, 1500, 1172)
      ON DUPLICATE KEY UPDATE total_views = 5672, unique_visitors = 1200, home_views = 3000, art_views = 1500, artist_views = 1172
    `);
    
    await connection.execute(`
      INSERT INTO page_views_daily (view_date, total_views, unique_visitors, home_views, art_views, artist_views) 
      VALUES ('2025-08-29', 125000, 25000, 75000, 35000, 15000)
      ON DUPLICATE KEY UPDATE total_views = 125000, unique_visitors = 25000, home_views = 75000, art_views = 35000, artist_views = 15000
    `);
    
    // Add large revenue orders
    console.log('Adding large revenue orders...');
    await connection.execute(`
      INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, total_amount, item_count, status, created_at) 
      VALUES ('ORD-LARGE-001', 'Large Buyer 1', 'large1@test.com', '9876543210', 250000, 1, 'delivered', NOW())
    `);
    
    await connection.execute(`
      INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, total_amount, item_count, status, created_at) 
      VALUES ('ORD-LARGE-002', 'Large Buyer 2', 'large2@test.com', '9876543211', 1500000, 1, 'delivered', NOW())
    `);
    
    await connection.execute(`
      INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, total_amount, item_count, status, created_at) 
      VALUES ('ORD-MEGA-001', 'Mega Buyer', 'mega@test.com', '9876543212', 3200000, 2, 'delivered', NOW())
    `);
    
    console.log('✅ Large numbers test data added successfully');
    console.log('- Added page views: 5,672 and 125,000 total views');
    console.log('- Added revenue: 250,000, 1,500,000, and 3,200,000 NPR');
    console.log('- These should display as 5.7k, 125k, 250k, 1.5m, and 3.2m respectively');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addLargeNumbersTest();
