const pool = require('../config/database');

class Comment {
  static async create(data) {
    const query = `
      INSERT INTO comments (announcement_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [data.announcement_id, data.user_id, data.content];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar comentário no banco:', error);
      throw error;
    }
  }

  static async findByAnnouncementId(announcementId) {
    const query = `
      SELECT 
        c.id,
        c.announcement_id,
        c.user_id,
        c.content,
        c.created_at,
        u.name as user_name,
        u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.announcement_id = $1
      ORDER BY c.created_at ASC
    `;
    
    try {
      const result = await pool.query(query, [announcementId]);
      return result.rows.map(row => ({
        id: row.id,
        announcement_id: row.announcement_id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.created_at,
        user: {
          name: row.user_name,
          email: row.user_email
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar comentários no banco:', error);
      throw error;
    }
  }

  static async findByIdWithUser(commentId) {
    const query = `
      SELECT 
        c.id,
        c.announcement_id,
        c.user_id,
        c.content,
        c.created_at,
        u.name as user_name,
        u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    
    try {
      const result = await pool.query(query, [commentId]);
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        announcement_id: row.announcement_id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.created_at,
        user: {
          name: row.user_name,
          email: row.user_email
        }
      };
    } catch (error) {
      console.error('Erro ao buscar comentário no banco:', error);
      throw error;
    }
  }
}

module.exports = Comment;