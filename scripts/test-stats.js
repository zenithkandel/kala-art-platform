const dbService = require('../src/database/service');

async function testStats() {
  try {
    console.log('🔍 Testing कला Platform Statistics...\n');
    
    const stats = await dbService.getDashboardStats();
    
    console.log('📊 Current Statistics:');
    console.log('====================================');
    console.log(`👁️  Total Visitors: ${stats.total_views}`);
    console.log(`🎨 Listed Artworks: ${stats.total_arts}`);
    console.log(`✅ Arts Sold: ${stats.total_sold}`);
    console.log(`👨‍🎨 Active Artists: ${stats.total_artists}`);
    console.log(`📧 Unread Messages: ${stats.unread_messages}`);
    console.log(`📝 Pending Applications: ${stats.pending_applications}`);
    console.log(`📦 Active Orders: ${stats.active_orders}`);
    console.log('====================================\n');
    
    // Test individual table counts
    console.log('🔍 Individual Table Verification:');
    
    try {
      const artistCount = await dbService.query('SELECT COUNT(*) as count FROM artists WHERE status = ?', ['active']);
      console.log(`Artists table: ${artistCount[0].count} active artists`);
    } catch (err) {
      console.log('Artists table: Not accessible or empty');
    }
    
    try {
      const artCount = await dbService.query('SELECT COUNT(*) as count FROM arts WHERE status = ?', ['listed']);
      console.log(`Arts table: ${artCount[0].count} listed artworks`);
    } catch (err) {
      console.log('Arts table: Not accessible or empty');
    }
    
    try {
      const soldCount = await dbService.query('SELECT COUNT(*) as count FROM arts WHERE status = ?', ['sold']);
      console.log(`Arts sold: ${soldCount[0].count} sold artworks`);
    } catch (err) {
      console.log('Arts sold: Not accessible or empty');
    }
    
    try {
      const orderCount = await dbService.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['delivered']);
      console.log(`Orders table: ${orderCount[0].count} delivered orders`);
    } catch (err) {
      console.log('Orders table: Not accessible or empty');
    }
    
    try {
      const viewCount = await dbService.query('SELECT SUM(total_views) as total FROM page_views_daily');
      console.log(`Page views: ${viewCount[0].total || 0} total views`);
    } catch (err) {
      console.log('Page views: Not accessible or empty');
    }
    
    console.log('\n✅ Statistics test complete!');
    
  } catch (error) {
    console.error('❌ Error testing stats:', error);
  }
}

testStats();
