const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'art_gallery'
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

class DatabaseService {
  // Test database connection
  async testConnection() {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Admin related methods
  async getAdminByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM admin WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting admin by username:', error);
      throw error;
    }
  }

  async createAdmin(username, hashedPassword) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO admin (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const stats = {};
      
      // Get total arts
      const [artsResult] = await pool.execute('SELECT COUNT(*) as count FROM arts');
      stats.totalArts = artsResult[0].count;
      
      // Get total artists
      const [artistsResult] = await pool.execute('SELECT COUNT(*) as count FROM artists');
      stats.totalArtists = artistsResult[0].count;
      
      // Get total orders (if orders table exists)
      try {
        const [ordersResult] = await pool.execute('SELECT COUNT(*) as count FROM orders');
        stats.totalOrders = ordersResult[0].count;
      } catch (error) {
        stats.totalOrders = 0;
      }
      
      // Get total sales (if sales table exists)
      try {
        const [salesResult] = await pool.execute('SELECT SUM(amount) as total FROM sales');
        stats.totalSales = salesResult[0].total || 0;
      } catch (error) {
        stats.totalSales = 0;
      }
      
      // Get total applications (if applications table exists)
      try {
        const [applicationsResult] = await pool.execute('SELECT COUNT(*) as count FROM applications');
        stats.totalApplications = applicationsResult[0].count;
      } catch (error) {
        stats.totalApplications = 0;
      }
      
      // Get total messages (if messages table exists)
      try {
        const [messagesResult] = await pool.execute('SELECT COUNT(*) as count FROM messages');
        stats.totalMessages = messagesResult[0].count;
      } catch (error) {
        stats.totalMessages = 0;
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalArts: 0,
        totalArtists: 0,
        totalOrders: 0,
        totalSales: 0,
        totalApplications: 0,
        totalMessages: 0
      };
    }
  }

  // Arts management
  async getAllArts() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM arts ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all arts:', error);
      return [];
    }
  }

  async getArtById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM arts WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting art by id:', error);
      return null;
    }
  }

  // Artists management
  async getAllArtists() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM artists ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all artists:', error);
      return [];
    }
  }

  async getArtistById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM artists WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting artist by id:', error);
      return null;
    }
  }

  // Orders management (placeholder - implement when orders table exists)
  async getAllOrders() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM orders ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all orders:', error);
      return [];
    }
  }

  // Sales management (placeholder - implement when sales table exists)
  async getAllSales() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM sales ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all sales:', error);
      return [];
    }
  }

  // Applications management (placeholder - implement when applications table exists)
  async getAllApplications() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM applications ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all applications:', error);
      return [];
    }
  }

  // Upload management (placeholder - implement when uploads table exists)
  async getAllUploads() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM uploads ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all uploads:', error);
      return [];
    }
  }

  // Messages management (placeholder - implement when messages table exists)
  async getAllMessages() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM messages ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all messages:', error);
      return [];
    }
  }

  // Generic query execution
  async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Close pool connection
  async close() {
    try {
      await pool.end();
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
  }
}

module.exports = new DatabaseService();
