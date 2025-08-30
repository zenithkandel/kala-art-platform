const dbService = require('../src/database/service');

async function addSampleData() {
  try {
    console.log('Adding sample data for testing...');
    
    // Add some sample artists (if table exists)
    try {
      await dbService.query(`
        INSERT IGNORE INTO artists (artist_id, slug, full_name, bio, specialty, age, school, location, contact_email, status) VALUES
        (1, 'alice-johnson', 'Alice Johnson', 'Young painter specializing in landscapes', 'Landscape Painting', 16, 'Central High School', 'Kathmandu', 'alice@example.com', 'active'),
        (2, 'bob-smith', 'Bob Smith', 'Digital artist creating modern art', 'Digital Art', 17, 'Arts Academy', 'Pokhara', 'bob@example.com', 'active'),
        (3, 'carol-williams', 'Carol Williams', 'Portrait artist with traditional techniques', 'Portrait Art', 15, 'Valley School', 'Lalitpur', 'carol@example.com', 'active')
      `);
      console.log('✅ Sample artists added');
    } catch (err) {
      console.log('ℹ️ Artists table not found, skipping sample artists');
    }
    
    // Add some sample artworks (if table exists)
    try {
      await dbService.query(`
        INSERT IGNORE INTO arts (art_id, artist_id, title, description, price, category, medium, dimensions, status) VALUES
        (1, 1, 'Mountain Sunset', 'Beautiful sunset over the Himalayas', 2500.00, 'Landscape', 'Oil on Canvas', '30x40 cm', 'listed'),
        (2, 1, 'Valley Morning', 'Peaceful morning in Kathmandu valley', 2000.00, 'Landscape', 'Watercolor', '25x35 cm', 'listed'),
        (3, 2, 'Digital Dreams', 'Abstract digital composition', 1800.00, 'Digital', 'Digital Print', '20x30 cm', 'listed'),
        (4, 2, 'Cyber City', 'Futuristic cityscape', 2200.00, 'Digital', 'Digital Print', '40x60 cm', 'listed'),
        (5, 3, 'Portrait of Hope', 'Young girl with bright future', 3000.00, 'Portrait', 'Acrylic', '35x45 cm', 'listed')
      `);
      console.log('✅ Sample artworks added');
    } catch (err) {
      console.log('ℹ️ Arts table not found, skipping sample artworks');
    }
    
    // Add some sample orders (if table exists)
    try {
      await dbService.query(`
        INSERT IGNORE INTO orders (order_id, order_code, customer_name, customer_email, customer_phone, total_amount, status) VALUES
        (1, 'KLA001', 'John Doe', 'john@example.com', '9841234567', 2500.00, 'delivered'),
        (2, 'KLA002', 'Jane Smith', 'jane@example.com', '9847654321', 2000.00, 'delivered'),
        (3, 'KLA003', 'Mike Johnson', 'mike@example.com', '9845678901', 1800.00, 'preparing')
      `);
      console.log('✅ Sample orders added');
    } catch (err) {
      console.log('ℹ️ Orders table not found, skipping sample orders');
    }
    
    // Add some sample contact messages (if table exists)
    try {
      await dbService.query(`
        INSERT IGNORE INTO contact_messages (message_id, full_name, email, subject, message, status) VALUES
        (1, 'Sarah Wilson', 'sarah@example.com', 'Inquiry about artwork', 'I am interested in commissioning a portrait', 'unread'),
        (2, 'David Brown', 'david@example.com', 'Art exhibition', 'Would like to discuss featuring young artists', 'unread')
      `);
      console.log('✅ Sample contact messages added');
    } catch (err) {
      console.log('ℹ️ Contact messages table not found, skipping sample messages');
    }
    
    // Add some sample artist applications (if table exists)
    try {
      await dbService.query(`
        INSERT IGNORE INTO artist_applications (application_id, full_name, email, age, school, portfolio_link, status) VALUES
        (1, 'Emma Davis', 'emma@example.com', 16, 'Art High School', 'https://example.com/portfolio', 'pending'),
        (2, 'Tom Wilson', 'tom@example.com', 17, 'Creative Academy', 'https://example.com/portfolio2', 'pending')
      `);
      console.log('✅ Sample artist applications added');
    } catch (err) {
      console.log('ℹ️ Artist applications table not found, skipping sample applications');
    }
    
    console.log('\n🎉 Sample data setup complete!');
    console.log('Visit http://localhost:3000 to generate some page views');
    console.log('Then check the admin dashboard to see the statistics');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

addSampleData();
