const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleArts() {
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

    // First, let's add some sample artists if they don't exist
    console.log('Adding sample artists...');
    
    const artists = [
      { name: 'Maya Chen', specialty: 'Watercolor Paintings', age: 17, school: 'Art Academy High' },
      { name: 'Raj Patel', specialty: 'Pencil Sketches', age: 16, school: 'Central Arts School' },
      { name: 'Sofia Rodriguez', specialty: 'Portrait Art', age: 18, school: 'Creative Institute' },
      { name: 'Alex Kim', specialty: 'Digital Art', age: 17, school: 'Tech Arts College' },
      { name: 'Jordan Liu', specialty: 'Abstract Paintings', age: 16, school: 'Modern Art School' },
      { name: 'Sam Taylor', specialty: 'Character Design', age: 18, school: 'Design Academy' }
    ];

    for (const artist of artists) {
      await connection.execute(`
        INSERT IGNORE INTO artists (slug, full_name, specialty, age, school, status, created_at) 
        VALUES (?, ?, ?, ?, ?, 'active', NOW())
      `, [
        artist.name.toLowerCase().replace(/\\s+/g, '-'),
        artist.name,
        artist.specialty,
        artist.age,
        artist.school
      ]);
    }

    // Now add sample artworks
    console.log('Adding sample artworks...');
    
    const artworks = [
      { artist_id: 1, title: 'Sunset Dreams', style: 'painting', description: 'A beautiful watercolor sunset landscape', price: 15000, materials: 'Watercolor, Paper' },
      { artist_id: 2, title: 'City Sketch', style: 'sketch', description: 'Urban landscape pencil drawing', price: 7500, materials: 'Pencil, Paper' },
      { artist_id: 3, title: 'Portrait Study', style: 'portrait', description: 'Realistic portrait in charcoal', price: 20000, materials: 'Charcoal, Canvas' },
      { artist_id: 4, title: 'Digital Landscape', style: 'digital', description: 'Futuristic digital landscape', price: 12000, materials: 'Digital Art' },
      { artist_id: 5, title: 'Abstract Forms', style: 'painting', description: 'Modern abstract composition', price: 30000, materials: 'Acrylic, Canvas' },
      { artist_id: 6, title: 'Character Design', style: 'digital', description: 'Fantasy character illustration', price: 18000, materials: 'Digital Art' },
      { artist_id: 1, title: 'Morning Mist', style: 'painting', description: 'Serene morning landscape', price: 16000, materials: 'Watercolor, Paper' },
      { artist_id: 2, title: 'Street Scene', style: 'sketch', description: 'Busy street corner sketch', price: 8000, materials: 'Pencil, Paper' },
      { artist_id: 3, title: 'Self Portrait', style: 'portrait', description: 'Artist self-portrait', price: 22000, materials: 'Oil, Canvas' },
      { artist_id: 4, title: 'Cyber City', style: 'digital', description: 'Cyberpunk cityscape', price: 14000, materials: 'Digital Art' }
    ];

    for (const art of artworks) {
      const slug = art.title.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await connection.execute(`
        INSERT IGNORE INTO arts (artist_id, title, style, description, materials, price, slug, status, stock_quantity, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'listed', 1, NOW())
      `, [
        art.artist_id,
        art.title,
        art.style,
        art.description,
        art.materials,
        art.price,
        slug
      ]);
    }
    
    console.log('✅ Sample arts and artists added successfully');
    console.log('- Added 6 sample artists');
    console.log('- Added 10 sample artworks');
    console.log('- All artworks are listed and ready to display');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSampleArts();
