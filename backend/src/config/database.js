const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'petfinder',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  // Primeiro criar tabela de usuários
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

  // Depois criar tabela de anúncios com TODAS as colunas
  const createAnnouncementsTable = `
    DROP TABLE IF EXISTS announcements;
    
    CREATE TABLE announcements (
      id SERIAL PRIMARY KEY,
      pet_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('perdido', 'encontrado')),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      image_url VARCHAR(500),
      neighborhood VARCHAR(255) NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'encontrado', 'inativo')),
      found_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('🔧 Criando tabelas...');
    await pool.query(createUsersTable);
    console.log('✅ Tabela users criada');
    
    await pool.query(createAnnouncementsTable);
    console.log('✅ Tabela announcements criada');
    
    // Inserir alguns dados de teste
    const insertTestUser = `
      INSERT INTO users (name, email, password, phone) 
      VALUES ('Admin Test', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(71) 99999-9999')
      ON CONFLICT (email) DO NOTHING;
    `;
    
    await pool.query(insertTestUser);
    console.log('✅ Usuário de teste criado');
    
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
  }
};

createTables();

module.exports = pool;