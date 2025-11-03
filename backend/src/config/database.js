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
    if (process.env.NODE_ENV !== 'development') return; // Guard: only run in development

    // Criar tabela de usuários (se não existir)
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

    // Criar tabela de anúncios com a nova coluna BYTEA para a imagem
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

    // Criar tabela de coment��rios
    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Índices úteis
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

    // Inserir usuário de teste apenas se não existir
    const insertTestUser = `
      INSERT INTO users (name, email, password, phone) 
      VALUES ('Admin Test', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(71) 99999-9999')
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(insertTestUser);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Erro ao criar tabelas (dev bootstrap):', err);
    }
  }
};

createTables();

module.exports = pool;

//versao antiga
// config/database.js - CONFIGURAÇÃO COMPLETA COM COMENTÁRIOS
// const { Pool } = require('pg');

// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'petfinder',
//   password: process.env.DB_PASSWORD || 'postgres',
//   port: process.env.DB_PORT || 5432,
// });

// const createTables = async () => {
//   try {
//     console.log('🔧 Verificando tabelas...');
    
//     // Criar tabela de usuários (se não existir)
//     const createUsersTable = `
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         phone VARCHAR(20) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;

//     // Criar tabela de anúncios SEM DROP - só se não existir
//     const createAnnouncementsTable = `
//       CREATE TABLE IF NOT EXISTS announcements (
//         id SERIAL PRIMARY KEY,
//         pet_name VARCHAR(255) NOT NULL,
//         description TEXT NOT NULL,
//         type VARCHAR(10) NOT NULL CHECK (type IN ('perdido', 'encontrado')),
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         image_url VARCHAR(500),
//         neighborhood VARCHAR(255) NOT NULL,
//         latitude DECIMAL(10, 8),
//         longitude DECIMAL(11, 8),
//         status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'encontrado', 'inativo')),
//         found_date TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;

//     // NOVA: Criar tabela de comentários
//     const createCommentsTable = `
//       CREATE TABLE IF NOT EXISTS comments (
//         id SERIAL PRIMARY KEY,
//         announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         content TEXT NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;

//     // Criar índices para otimizar buscas
//     const createIndexes = `
//       CREATE INDEX IF NOT EXISTS idx_comments_announcement_id ON comments(announcement_id);
//       CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
//     `;

//     // Executar criação das tabelas
//     await pool.query(createUsersTable);
//     console.log('✅ Tabela users OK');
    
//     await pool.query(createAnnouncementsTable);
//     console.log('✅ Tabela announcements OK');
    
//     await pool.query(createCommentsTable);
//     console.log('✅ Tabela comments OK');
    
//     await pool.query(createIndexes);
//     console.log('✅ Índices criados');
    
//     // Inserir usuário de teste apenas se não existir
//     const insertTestUser = `
//       INSERT INTO users (name, email, password, phone) 
//       VALUES ('Admin Test', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(71) 99999-9999')
//       ON CONFLICT (email) DO NOTHING;
//     `;
    
//     await pool.query(insertTestUser);
//     console.log('✅ Setup completo - Database ready!');
    
//   } catch (err) {
//     console.error('❌ Erro ao criar tabelas:', err);
//   }
// };

// createTables();

// module.exports = pool;
//versao antiga