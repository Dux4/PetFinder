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
    
    let query;
    let values;

    if (password) {
      // Se a senha foi fornecida, atualizá-la também
      const hashedPassword = bcrypt.hashSync(password, 10);
      query = `
        UPDATE users 
        SET name = $1, email = $2, phone = $3, password = $4
        WHERE id = $5
        RETURNING id, name, email, phone, created_at
      `;
      values = [name, email, phone, hashedPassword, id];
    } else {
      // Atualizar apenas nome, email e telefone
      query = `
        UPDATE users 
        SET name = $1, email = $2, phone = $3
        WHERE id = $4
        RETURNING id, name, email, phone, created_at
      `;
      values = [name, email, phone, id];
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;