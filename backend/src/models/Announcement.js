const pool = require('../config/database');

// Coordenadas dos bairros de Salvador
const neighborhoodCoords = {
  'pelourinho': { lat: -12.9714, lng: -38.5014 },
  'barra': { lat: -12.9818, lng: -38.4652 },
  'itapuã': { lat: -12.9398, lng: -38.4087 },
  'pituba': { lat: -12.9934, lng: -38.4506 },
  'liberdade': { lat: -12.9055, lng: -38.3364 },
  'campo grande': { lat: -12.9645, lng: -38.5105 },
  'rio vermelho': { lat: -12.9547, lng: -38.4920 },
  'ondina': { lat: -12.9666, lng: -38.5134 },
  'federação': { lat: -12.9562, lng: -38.5015 },
  'brotas': { lat: -12.9234, lng: -38.4567 },
  'nazaré': { lat: -12.9678, lng: -38.5089 },
  'barris': { lat: -12.9612, lng: -38.5178 },
  'graça': { lat: -12.9589, lng: -38.5145 },
  'vitória': { lat: -12.9723, lng: -38.5234 },
  'corredor da vitória': { lat: -12.9756, lng: -38.5189 },
  'canela': { lat: -12.9634, lng: -38.5098 },
  'imbuí': { lat: -12.9845, lng: -38.4234 },
  'caminho das árvores': { lat: -12.9789, lng: -38.4345 },
  'pituaçu': { lat: -12.9823, lng: -38.4123 },
  'costa azul': { lat: -12.9712, lng: -38.4089 },
  'armação': { lat: -12.9567, lng: -38.3989 },
  'patamares': { lat: -12.9434, lng: -38.3812 }
};

class Announcement {
  static async create(data) {
    // Se não tem coordenadas, usar as do bairro
    let finalLat = data.latitude;
    let finalLng = data.longitude;

    if (!finalLat || !finalLng) {
      const coords = neighborhoodCoords[data.neighborhood.toLowerCase()];
      if (coords) {
        finalLat = coords.lat;
        finalLng = coords.lng;
      }
    }

    const query = `
      INSERT INTO announcements (
        pet_name, description, type, user_id, image_url, 
        neighborhood, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.pet_name,
      data.description,
      data.type,
      data.user_id,
      data.image_url,
      data.neighborhood,
      finalLat,
      finalLng
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(status = 'ativo') {
    const query = `
      SELECT a.*, u.name as user_name, u.phone as user_phone, u.email as user_email
      FROM announcements a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = $1
      ORDER BY a.created_at DESC
    `;
    
    const result = await pool.query(query, [status]);
    return result.rows.map(row => ({
      ...row,
      user: {
        name: row.user_name,
        phone: row.user_phone,
        email: row.user_email
      }
    }));
  }

  static async findByUserId(userId, status = null) {
    let query = `
      SELECT a.*, u.name as user_name, u.phone as user_phone, u.email as user_email
      FROM announcements a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ' AND a.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      user: {
        name: row.user_name,
        phone: row.user_phone,
        email: row.user_email
      }
    }));
  }

  static async updateStatus(id, status, userId) {
    const query = `
      UPDATE announcements 
      SET status = $1, updated_at = CURRENT_TIMESTAMP, 
          found_date = CASE WHEN $1 = 'encontrado' THEN CURRENT_TIMESTAMP ELSE found_date END
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id, userId]);
    return result.rows[0];
  }
}

module.exports = Announcement;