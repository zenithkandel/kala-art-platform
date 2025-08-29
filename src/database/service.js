const { query, queryOne, transaction } = require('./connection');
const bcrypt = require('bcrypt');

class DatabaseService {
  // ============= ADMIN METHODS =============
  
  async createAdmin(username, password) {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
    return result.insertId;
  }
  
  async getAdminByUsername(username) {
    return await queryOne(
      'SELECT admin_id, username, password_hash, last_login_at FROM admins WHERE username = ?',
      [username]
    );
  }
  
  async updateAdminLastLogin(adminId) {
    await query(
      'UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE admin_id = ?',
      [adminId]
    );
  }
  
  async verifyAdminPassword(username, password) {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return null;
    
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) return null;
    
    await this.updateAdminLastLogin(admin.admin_id);
    return {
      admin_id: admin.admin_id,
      username: admin.username,
      last_login_at: admin.last_login_at
    };
  }
  
  // ============= ARTIST METHODS =============
  
  async createArtist(data) {
    const { full_name, avatar_path, specialty, age, bio, contact_email, contact_phone, instagram, slug } = data;
    const result = await query(
      `INSERT INTO artists (full_name, avatar_path, specialty, age, bio, contact_email, contact_phone, instagram, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, avatar_path, specialty, age, bio, contact_email, contact_phone, instagram, slug]
    );
    return result.insertId;
  }
  
  async getArtists(filters = {}) {
    let sql = 'SELECT * FROM artists WHERE deleted_at IS NULL';
    const params = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY joined_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    return await query(sql, params);
  }
  
  async getArtistById(artistId) {
    return await queryOne(
      'SELECT * FROM artists WHERE artist_id = ? AND deleted_at IS NULL',
      [artistId]
    );
  }
  
  async updateArtist(artistId, data) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(artistId);
    
    await query(
      `UPDATE artists SET ${fields} WHERE artist_id = ?`,
      values
    );
  }
  
  async deleteArtist(artistId) {
    await query(
      'UPDATE artists SET deleted_at = CURRENT_TIMESTAMP WHERE artist_id = ?',
      [artistId]
    );
  }
  
  // ============= ARTIST APPLICATION METHODS =============
  
  async createArtistApplication(data) {
    const { full_name, age, started_art_since, school, location, extra_message, contact_email, contact_phone, instagram } = data;
    const result = await query(
      `INSERT INTO artist_applications (full_name, age, started_art_since, school, location, extra_message, contact_email, contact_phone, instagram)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, age, started_art_since, school, location, extra_message, contact_email, contact_phone, instagram]
    );
    return result.insertId;
  }
  
  async getArtistApplications(status = null) {
    let sql = 'SELECT * FROM artist_applications';
    const params = [];
    
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY submitted_at DESC';
    return await query(sql, params);
  }
  
  async updateApplicationStatus(applicationId, status) {
    await query(
      'UPDATE artist_applications SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE application_id = ?',
      [status, applicationId]
    );
  }
  
  // ============= ART METHODS =============
  
  async createArt(data) {
    const { artist_id, title, type, description, materials, paper, style, width_mm, height_mm, colors, price, stock, slug } = data;
    const result = await query(
      `INSERT INTO arts (artist_id, title, type, description, materials, paper, style, width_mm, height_mm, colors, price, stock, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [artist_id, title, type, description, materials, paper, style, width_mm, height_mm, colors, price, stock, slug]
    );
    return result.insertId;
  }
  
  async getArts(filters = {}) {
    let sql = `
      SELECT a.*, ar.full_name as artist_name, ai.thumb_path as image_thumb
      FROM arts a
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      LEFT JOIN art_images ai ON a.primary_image_id = ai.image_id
      WHERE a.deleted_at IS NULL
    `;
    const params = [];
    
    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }
    
    if (filters.artist_id) {
      sql += ' AND a.artist_id = ?';
      params.push(filters.artist_id);
    }
    
    if (filters.type) {
      sql += ' AND a.type = ?';
      params.push(filters.type);
    }
    
    sql += ' ORDER BY a.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    return await query(sql, params);
  }
  
  async getArtById(artId) {
    return await queryOne(
      `SELECT a.*, ar.full_name as artist_name
       FROM arts a
       LEFT JOIN artists ar ON a.artist_id = ar.artist_id
       WHERE a.art_id = ? AND a.deleted_at IS NULL`,
      [artId]
    );
  }
  
  // ============= ORDER METHODS =============
  
  async createOrder(data) {
    const { order_code, buyer_name, contact_phone, contact_email, note, total_amount } = data;
    const result = await query(
      `INSERT INTO orders (order_code, buyer_name, contact_phone, contact_email, note, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_code, buyer_name, contact_phone, contact_email, note, total_amount]
    );
    return result.insertId;
  }
  
  async addOrderItem(orderId, artId, title, price, image, qty = 1) {
    await query(
      `INSERT INTO order_items (order_id, art_id, title_snapshot, price_snapshot, image_snapshot, qty)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, artId, title, price, image, qty]
    );
  }
  
  async getOrders(filters = {}) {
    let sql = 'SELECT * FROM orders WHERE deleted_at IS NULL';
    const params = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    return await query(sql, params);
  }
  
  async getOrderById(orderId) {
    return await queryOne(
      'SELECT * FROM orders WHERE order_id = ? AND deleted_at IS NULL',
      [orderId]
    );
  }
  
  async getOrderItems(orderId) {
    return await query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );
  }
  
  async updateOrderStatus(orderId, status) {
    await query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, orderId]
    );
  }
  
  // ============= CONTACT MESSAGE METHODS =============
  
  async createContactMessage(data) {
    const { full_name, email, phone, subject, message } = data;
    const result = await query(
      'INSERT INTO contact_messages (full_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone, subject, message]
    );
    return result.insertId;
  }
  
  async getContactMessages(status = null) {
    let sql = 'SELECT * FROM contact_messages';
    const params = [];
    
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }
  
  async markMessageAsRead(messageId) {
    await query(
      'UPDATE contact_messages SET status = ? WHERE message_id = ?',
      ['read', messageId]
    );
  }
  
  // ============= ANALYTICS METHODS =============
  
  async getDashboardStats() {
    const stats = {};
    
    // Total artists
    const artistCount = await queryOne('SELECT COUNT(*) as count FROM artists WHERE deleted_at IS NULL');
    stats.totalArtists = artistCount.count;
    
    // Approved artists
    const approvedArtistCount = await queryOne('SELECT COUNT(*) as count FROM artists WHERE deleted_at IS NULL AND status = ?', ['active']);
    stats.approvedArtists = approvedArtistCount.count;
    
    // Total arts
    const artCount = await queryOne('SELECT COUNT(*) as count FROM arts WHERE deleted_at IS NULL');
    stats.totalArts = artCount.count;
    
    // Total orders
    const orderCount = await queryOne('SELECT COUNT(*) as count FROM orders WHERE deleted_at IS NULL');
    stats.totalOrders = orderCount.count;
    
    // Pending applications
    const pendingApps = await queryOne('SELECT COUNT(*) as count FROM artist_applications WHERE status = ?', ['pending']);
    stats.pendingApplications = pendingApps.count;
    
    // Recent applications
    stats.recentApplications = await query(
      'SELECT application_id, full_name, contact_email, age, location, status, submitted_at FROM artist_applications ORDER BY submitted_at DESC LIMIT 5'
    );
    
    // Recent orders
    stats.recentOrders = await query(
      'SELECT order_id, order_code, buyer_name, total_amount, status, created_at FROM orders WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5'
    );
    
    // Total page views
    const totalViews = await queryOne('SELECT SUM(views) as total FROM page_views_daily');
    stats.totalViews = totalViews.total || 0;
    
    return stats;
  }
  
  async getAllOrders() {
    return await query(`
      SELECT 
        o.*,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `);
  }
  
  async getAnalyticsData() {
    try {
      // Get basic stats
      const [artistCount] = await query('SELECT COUNT(*) as count FROM artists WHERE status = "approved"');
      const [artworkCount] = await query('SELECT COUNT(*) as count FROM arts');
      const [orderCount] = await query('SELECT COUNT(*) as count FROM orders');
      const [viewCount] = await query('SELECT SUM(views) as count FROM page_views_daily');
      
      // Get top artists
      const topArtists = await query(`
        SELECT 
          a.full_name as name,
          COUNT(arts.art_id) as artCount,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as totalRevenue
        FROM artists a
        LEFT JOIN arts ON a.artist_id = arts.artist_id
        LEFT JOIN order_items oi ON arts.art_id = oi.art_id
        WHERE a.status = 'approved'
        GROUP BY a.artist_id
        ORDER BY totalRevenue DESC, artCount DESC
        LIMIT 5
      `);
      
      // Get recent activity (simplified)
      const recentActivity = await query(`
        SELECT 
          'order' as type,
          CONCAT('New order from ', buyer_name) as description,
          created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      return {
        totalViews: viewCount.count || 0,
        totalArtists: artistCount.count || 0,
        totalArtworks: artworkCount.count || 0,
        totalOrders: orderCount.count || 0,
        topArtists: topArtists || [],
        recentActivity: recentActivity || []
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        totalViews: 0,
        totalArtists: 0,
        totalArtworks: 0,
        totalOrders: 0,
        topArtists: [],
        recentActivity: []
      };
    }
  }
  
  async recordPageView(date = null) {
    const viewDate = date || new Date().toISOString().split('T')[0];
    await query(
      'INSERT INTO page_views_daily (view_date, views) VALUES (?, 1) ON DUPLICATE KEY UPDATE views = views + 1',
      [viewDate]
    );
  }
}

module.exports = new DatabaseService();
