const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Checking database structure...\n');

    // Check arts table
    console.log('=== ARTS TABLE ===');
    const [artsCols] = await connection.execute('DESCRIBE arts');
    artsCols.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Default}`);
    });
    
    // Check art_images table if it exists
    try {
      console.log('\n=== ART_IMAGES TABLE ===');
      const [artImagesCols] = await connection.execute('DESCRIBE art_images');
      artImagesCols.forEach(col => {
        console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Default}`);
      });
    } catch (error) {
      console.log('ART_IMAGES table does not exist');
    }

    // Check order_items table if it exists
    try {
      console.log('\n=== ORDER_ITEMS TABLE ===');
      const [orderItemsCols] = await connection.execute('DESCRIBE order_items');
      orderItemsCols.forEach(col => {
        console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Default}`);
      });
    } catch (error) {
      console.log('ORDER_ITEMS table does not exist');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure();
