const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, phone } = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, created_at
    `;
    
    const result = await pool.query(query, [name, email, hashedPassword, phone]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, phone, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  static async update(id, userData) {
    const { name, email, phone, password } = userData;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (password !== undefined) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, created_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;