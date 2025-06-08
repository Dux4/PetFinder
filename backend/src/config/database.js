const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'petfinder',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Criação da tabela se não existir
const createTable = async () => {
  const createTableQuery = `
    CREATE EXTENSION IF NOT EXISTS postgis;
    
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      pet_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('perdido', 'encontrado')),
      contact_name VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(20) NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      image_url VARCHAR(500),
      location GEOGRAPHY(POINT, 4326) NOT NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Tabela criada/verificada com sucesso');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
  }
};

createTable();

module.exports = pool;