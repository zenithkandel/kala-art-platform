const { query } = require('../src/database/connection');

async function addSimpleData() {
  try {
    console.log('Adding sample data for कला Art Platform...\n');

    // First, check what columns exist in the arts table
    console.log('🔍 Checking arts table structure...');
    const columns = await query('DESCRIBE arts');
    console.log('Arts table columns:', columns.map(col => col.Field).join(', '));

    // Add sample artists
    console.log('\n📊 Adding sample artists...');
    await query(`
      INSERT IGNORE INTO artists (artist_id, slug, full_name, bio, specialty, age, school, location, contact_email, status) VALUES
      (1, 'alice-patel', 'Alice Patel', 'Young landscape artist from Kathmandu', 'Landscape Painting', 16, 'Kathmandu Model Secondary School', 'Kathmandu', 'alice.patel@example.com', 'active'),
      (2, 'rajesh-shrestha', 'Rajesh Shrestha', 'Digital artist creating modern art', 'Digital Art', 17, 'Patan Arts Academy', 'Lalitpur', 'rajesh.shrestha@example.com', 'active'),
      (3, 'priya-gurung', 'Priya Gurung', 'Portrait artist specializing in portraits', 'Portrait Art', 15, 'Pokhara Valley School', 'Pokhara', 'priya.gurung@example.com', 'active'),
      (4, 'suman-tamang', 'Suman Tamang', 'Abstract artist exploring colors', 'Abstract Art', 16, 'Bhaktapur Art Institute', 'Bhaktapur', 'suman.tamang@example.com', 'active'),
      (5, 'maya-rai', 'Maya Rai', 'Traditional artist with cultural themes', 'Traditional Art', 17, 'Dharan Arts College', 'Dharan', 'maya.rai@example.com', 'active')
    `);
    console.log('✅ Sample artists added (5 artists)');

    // Add basic sample artworks (using actual column names)
    console.log('📊 Adding sample artworks...');
    await query(`
      INSERT IGNORE INTO arts (art_id, artist_id, slug, title, description, price, materials, width_mm, height_mm, status) VALUES
      (1, 1, 'himalayan-sunrise', 'Himalayan Sunrise', 'Beautiful sunrise over the Himalayas', 3500.00, 'Oil on Canvas', 400, 600, 'listed'),
      (2, 1, 'valley-mist', 'Valley in Morning Mist', 'Peaceful morning scene', 2800.00, 'Watercolor', 300, 450, 'listed'),
      (3, 1, 'temple-reflection', 'Temple Reflection', 'Ancient temple reflected in water', 3200.00, 'Oil on Canvas', 350, 500, 'listed'),
      (4, 2, 'digital-mandala', 'Digital Mandala Dreams', 'Contemporary digital mandala art', 2200.00, 'Digital Print', 500, 500, 'listed'),
      (5, 2, 'cyber-city', 'Cyber Kathmandu 2050', 'Futuristic vision of Kathmandu', 2800.00, 'Digital Print', 600, 400, 'listed'),
      (6, 3, 'grandmother-portrait', 'Portrait of Grandmother', 'Loving portrait in traditional dress', 4200.00, 'Acrylic on Canvas', 450, 600, 'listed'),
      (7, 3, 'young-monk', 'Young Monk in Meditation', 'Serene portrait of young monk', 3800.00, 'Oil on Canvas', 400, 550, 'listed'),
      (8, 4, 'emotion-waves', 'Waves of Emotion', 'Abstract representation of emotions', 2500.00, 'Mixed Media', 500, 700, 'listed'),
      (9, 4, 'mountain-spirits', 'Mountain Spirits', 'Abstract mountain energy', 2900.00, 'Acrylic on Canvas', 600, 800, 'listed'),
      (10, 5, 'festival-colors', 'Festival of Colors', 'Traditional Nepali festival scene', 3600.00, 'Tempera on Wood', 450, 600, 'listed'),
      (11, 1, 'sunset-peak', 'Golden Sunset Peak', 'Mountain peak in golden light', 3100.00, 'Oil on Canvas', 350, 500, 'sold'),
      (12, 2, 'heritage-digital', 'Digital Heritage', 'Digital art celebrating culture', 2400.00, 'Digital Print', 400, 600, 'sold')
    `);
    console.log('✅ Sample artworks added (12 artworks, 2 sold)');

    // Add sample orders
    console.log('📊 Adding sample orders...');
    await query(`
      INSERT IGNORE INTO orders (order_id, order_code, customer_name, customer_email, customer_phone, total_amount, status) VALUES
      (1, 'KLA2025001', 'Amit Sharma', 'amit.sharma@email.com', '9841234567', 3100.00, 'delivered'),
      (2, 'KLA2025002', 'Sunita Thapa', 'sunita.thapa@email.com', '9847654321', 2400.00, 'delivered'),
      (3, 'KLA2025003', 'Ramesh Yadav', 'ramesh.yadav@email.com', '9845678901', 2800.00, 'preparing'),
      (4, 'KLA2025004', 'Kamala Devi', 'kamala.devi@email.com', '9842567890', 4200.00, 'confirmed'),
      (5, 'KLA2025005', 'Bikash Rana', 'bikash.rana@email.com', '9843456789', 2500.00, 'delivering')
    `);
    console.log('✅ Sample orders added (5 orders, 2 delivered)');

    console.log('\n🎉 Database setup complete!');
    console.log('📊 Current stats should show:');
    console.log('   - 5 Active Artists');
    console.log('   - 10 Listed Artworks');
    console.log('   - 2 Arts Sold');
    console.log('   - 3 Active Orders');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

addSimpleData();
