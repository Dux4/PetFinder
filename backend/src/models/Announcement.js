const pool = require('../config/database');

class Announcement {
  static async create(data) {
    const query = `
      INSERT INTO announcements (
        pet_name, description, type, contact_name, contact_phone, 
        contact_email, image_url, location, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326), $10)
      RETURNING *
    `;
    
    const values = [
      data.pet_name,
      data.description,
      data.type,
      data.contact_name,
      data.contact_phone,
      data.contact_email,
      data.image_url,
      data.longitude,
      data.latitude,
      data.address
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT 
        id, pet_name, description, type, contact_name, contact_phone,
        contact_email, image_url, address, created_at,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude
      FROM announcements 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findNearby(latitude, longitude, radiusKm = 10) {
    const query = `
      SELECT 
        id, pet_name, description, type, contact_name, contact_phone,
        contact_email, image_url, address, created_at,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)) / 1000 as distance_km
      FROM announcements 
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3 * 1000)
      ORDER BY distance_km ASC
    `;
    
    const values = [latitude, longitude, radiusKm];
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Announcement;