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
}

module.exports = User;