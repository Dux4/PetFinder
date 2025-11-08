const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'petfinder',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
});

const createTables = async () => {
  try {
    if (process.env.NODE_ENV !== 'development') return;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createAnnouncementsTable = `
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        pet_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('perdido', 'encontrado')),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        image_data BYTEA,
        image_mime_type VARCHAR(50),
        neighborhood VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'encontrado', 'inativo')),
        found_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_comments_announcement_id ON comments(announcement_id);
      CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_announcements_status_created_at ON announcements(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_announcements_user_id_created_at ON announcements(user_id, created_at DESC);
    `;

    await pool.query(createUsersTable);
    await pool.query(createAnnouncementsTable);
    await pool.query(createCommentsTable);
    await pool.query(createIndexes);

    const insertTestUser = `
      INSERT INTO users (name, email, password, phone) 
      VALUES ('Admin Test', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(71) 99999-9999')
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(insertTestUser);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao criar tabelas:', err);
    }
  }
};

createTables();

module.exports = pool;
