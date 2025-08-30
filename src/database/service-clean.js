const { query, queryOne, transaction } = require('./connection');

class DatabaseService {
  // ============= ARTIST METHODS =============
  
  async createArtist(data) {
    const { full_name, avatar_path, specialty, age, bio, contact_email, contact_phone, instagram, slug } = data;
    const result = await query(
      `INSERT INTO artists (full_name, profile_picture, specialty, age, bio, contact_email, contact_phone, instagram, slug)
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
    
    sql += ' ORDER BY created_at DESC';
    
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
  
  async getArtistBySlug(slug) {
    return await queryOne(
      'SELECT * FROM artists WHERE slug = ? AND deleted_at IS NULL',
      [slug]
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
    const { artist_id, title, style, description, materials, paper, width_mm, height_mm, colors, price, stock, slug } = data;
    const result = await query(
      `INSERT INTO arts (artist_id, title, style, description, materials, paper_type, width_mm, height_mm, colors_used, price, stock_quantity, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [artist_id, title, style, description, materials, paper, width_mm, height_mm, colors, price, stock, slug]
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
    
    if (filters.style) {
      sql += ' AND a.style = ?';
      params.push(filters.style);
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
    const { order_code, customer_name, customer_phone, customer_email, customer_message, total_amount } = data;
    const result = await query(
      `INSERT INTO orders (order_code, customer_name, customer_phone, customer_email, customer_message, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_code, customer_name, customer_phone, customer_email, customer_message, total_amount]
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
  
  async recordPageView(page, userAgent = null) {
    try {
      // First check if today's record exists
      const existingRecord = await queryOne(`
        SELECT view_date FROM page_views_daily WHERE view_date = CURDATE()
      `);
      
      if (existingRecord) {
        // Update existing record
        await query(`
          UPDATE page_views_daily 
          SET total_views = total_views + 1,
              home_views = CASE WHEN ? = 'home' THEN home_views + 1 ELSE home_views END,
              art_views = CASE WHEN ? = 'art' THEN art_views + 1 ELSE art_views END,
              artist_views = CASE WHEN ? = 'artist' THEN artist_views + 1 ELSE artist_views END
          WHERE view_date = CURDATE()
        `, [page, page, page]);
      } else {
        // Create new record for today
        await query(`
          INSERT INTO page_views_daily (view_date, total_views, home_views, art_views, artist_views) 
          VALUES (CURDATE(), 1, 
            CASE WHEN ? = 'home' THEN 1 ELSE 0 END,
            CASE WHEN ? = 'art' THEN 1 ELSE 0 END,
            CASE WHEN ? = 'artist' THEN 1 ELSE 0 END
          )
        `, [page, page, page]);
      }
      
      console.log(`📊 Page view recorded: ${page} (${userAgent || 'N/A'})`);
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  }
  
  // ============= HOMEPAGE STATS METHODS =============
  
  async getHomepageStats() {
    try {
      // Get today's views instead of total views
      const todayViews = await queryOne(`
        SELECT COALESCE(total_views, 0) as daily_views 
        FROM page_views_daily 
        WHERE view_date = CURDATE()
      `);
      
      // Get other basic stats for homepage
      let total_arts = 0;
      let total_sold = 0;
      let total_artists = 0;
      
      try {
        const artCount = await queryOne(`SELECT COUNT(*) as count FROM arts WHERE status = 'listed' AND deleted_at IS NULL`);
        total_arts = artCount ? artCount.count : 0;
        
        const soldCount = await queryOne(`SELECT COUNT(*) as count FROM arts WHERE status = 'sold' AND deleted_at IS NULL`);
        total_sold = soldCount ? soldCount.count : 0;
        
        const artistCount = await queryOne(`SELECT COUNT(*) as count FROM artists WHERE status = 'active' AND deleted_at IS NULL`);
        total_artists = artistCount ? artistCount.count : 0;
      } catch (err) {
        console.log('Error getting homepage stats, using defaults');
      }
      
      return {
        daily_views: todayViews ? todayViews.daily_views : 0,
        total_arts,
        total_sold,
        total_artists
      };
    } catch (error) {
      console.error('Error getting homepage stats:', error);
      return {
        daily_views: 0,
        total_arts: 0,
        total_sold: 0,
        total_artists: 0
      };
    }
  }

  // ============= ADMIN DASHBOARD STATS METHODS =============
  
  async getDashboardStats() {
    try {
      // Get platform statistics with fallback for missing tables
      const stats = await queryOne(`
        SELECT 
          (SELECT COALESCE(COUNT(*), 0) FROM information_schema.tables 
           WHERE table_schema = DATABASE() AND table_name = 'artists') as artists_table_exists,
          (SELECT COALESCE(COUNT(*), 0) FROM information_schema.tables 
           WHERE table_schema = DATABASE() AND table_name = 'arts') as arts_table_exists,
          (SELECT COALESCE(COUNT(*), 0) FROM information_schema.tables 
           WHERE table_schema = DATABASE() AND table_name = 'orders') as orders_table_exists,
          (SELECT COALESCE(SUM(total_views), 0) FROM page_views_daily) as total_views,
          (SELECT COALESCE(COUNT(*), 0) FROM information_schema.tables 
           WHERE table_schema = DATABASE() AND table_name = 'contact_messages') as messages_table_exists,
          (SELECT COALESCE(COUNT(*), 0) FROM information_schema.tables 
           WHERE table_schema = DATABASE() AND table_name = 'artist_applications') as applications_table_exists
      `);
      
      // Get actual counts only if tables exist
      let total_artists = 0;
      let total_arts = 0;
      let total_sold = 0;
      let unread_messages = 0;
      let pending_applications = 0;
      let active_orders = 0;
      let total_revenue = 0;
      let total_messages = 0;
      let total_applications = 0;
      let approved_applications = 0;
      let rejected_applications = 0;
      
      if (stats.artists_table_exists > 0) {
        try {
          const artistCount = await queryOne(`SELECT COUNT(*) as count FROM artists WHERE status = 'active' AND deleted_at IS NULL`);
          total_artists = artistCount ? artistCount.count : 0;
        } catch (err) {
          console.log('Artists table exists but query failed, using 0');
        }
      }
      
      if (stats.arts_table_exists > 0) {
        try {
          const artCount = await queryOne(`SELECT COUNT(*) as count FROM arts WHERE status = 'listed' AND deleted_at IS NULL`);
          total_arts = artCount ? artCount.count : 0;
          
          const soldCount = await queryOne(`SELECT COUNT(*) as count FROM arts WHERE status = 'sold' AND deleted_at IS NULL`);
          total_sold = soldCount ? soldCount.count : 0;
        } catch (err) {
          console.log('Arts table exists but query failed, using 0');
        }
      }
      
      if (stats.orders_table_exists > 0) {
        try {
          const activeCount = await queryOne(`SELECT COUNT(*) as count FROM orders WHERE status IN ('received', 'viewed', 'contacted', 'confirmed', 'preparing', 'delivering')`);
          active_orders = activeCount ? activeCount.count : 0;
          
          const revenueQuery = await queryOne(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered'`);
          total_revenue = revenueQuery ? revenueQuery.total : 0;
        } catch (err) {
          console.log('Orders table exists but query failed, using 0');
        }
      }
      
      if (stats.messages_table_exists > 0) {
        try {
          const messageCount = await queryOne(`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'`);
          unread_messages = messageCount ? messageCount.count : 0;
          
          const totalMessageCount = await queryOne(`SELECT COUNT(*) as count FROM contact_messages`);
          total_messages = totalMessageCount ? totalMessageCount.count : 0;
        } catch (err) {
          console.log('Messages table exists but query failed, using 0');
        }
      }
      
      if (stats.applications_table_exists > 0) {
        try {
          const appCount = await queryOne(`SELECT COUNT(*) as count FROM artist_applications WHERE status = 'pending'`);
          pending_applications = appCount ? appCount.count : 0;
          
          const totalAppCount = await queryOne(`SELECT COUNT(*) as count FROM artist_applications`);
          total_applications = totalAppCount ? totalAppCount.count : 0;
          
          const approvedCount = await queryOne(`SELECT COUNT(*) as count FROM artist_applications WHERE status = 'approved'`);
          approved_applications = approvedCount ? approvedCount.count : 0;
          
          const rejectedCount = await queryOne(`SELECT COUNT(*) as count FROM artist_applications WHERE status = 'rejected'`);
          rejected_applications = rejectedCount ? rejectedCount.count : 0;
        } catch (err) {
          console.log('Applications table exists but query failed, using 0');
        }
      }
      
      return {
        total_artists,
        total_arts,
        total_sold,
        total_views: stats.total_views || 0,
        unread_messages,
        pending_applications,
        active_orders,
        total_revenue,
        total_messages,
        total_applications,
        approved_applications,
        rejected_applications
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        total_artists: 0,
        total_arts: 0,
        total_sold: 0,
        total_views: 0,
        unread_messages: 0,
        pending_applications: 0,
        active_orders: 0,
        total_revenue: 0,
        total_messages: 0,
        total_applications: 0,
        approved_applications: 0,
        rejected_applications: 0
      };
    }
  }

  // ============= ADMIN LOGGING METHODS =============
  
  async logAdminActivity(adminId, action, details = null) {
    try {
      await query(
        'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
        [adminId, action, details]
      );
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
}

module.exports = new DatabaseService();
