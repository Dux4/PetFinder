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

// Função auxiliar para converter o buffer da imagem para Base64
const convertImageToBase64 = (imageData, mimeType) => {
  if (!imageData) return null;
  // Transforma o buffer em string Base64 e adiciona o prefixo de formato
  return `data:${mimeType};base64,${imageData.toString('base64')}`;
};

class Announcement {
  static async create(data) {
    console.log('create - Dados recebidos:', data);
    
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
        pet_name, description, type, user_id, image_data, image_mime_type, 
        neighborhood, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      data.pet_name,
      data.description,
      data.type,
      data.user_id,
      data.image_data, // Passa o buffer diretamente
      data.image_mime_type, // Passa o tipo MIME
      data.neighborhood,
      finalLat,
      finalLng
    ];

    console.log('create - Query:', query);
    console.log('create - Valores:', values.map(v => v instanceof Buffer ? `Buffer(${v.length})` : v));

    try {
      const result = await pool.query(query, values);
      const row = result.rows[0];
      
      // Retorna a imagem já em Base64 para o controller
      return {
        ...row,
        image_data: convertImageToBase64(row.image_data, row.image_mime_type),
      };
    } catch (error) {
      console.error('create - Erro na query:', error);
      throw error;
    }
  }

  static async findAll(status = 'ativo') {
    console.log('findAll - Status solicitado:', status);
    
    const query = `
      SELECT a.*, u.name as user_name, u.phone as user_phone, u.email as user_email
      FROM announcements a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = $1
      ORDER BY a.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [status]);
      console.log('findAll - Encontrados:', result.rows.length, 'anúncios');
      
      return result.rows.map(row => ({
        ...row,
        // Converte a imagem para Base64 antes de enviar para o front-end
        image_data: convertImageToBase64(row.image_data, row.image_mime_type),
        user: {
          name: row.user_name,
          phone: row.user_phone,
          email: row.user_email
        }
      }));
    } catch (error) {
      console.error('findAll - Erro na query:', error);
      throw error;
    }
  }

  static async findByUserId(userId, status = null) {
    console.log('findByUserId - UserId:', userId, 'Status:', status);
    
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
    
    try {
      const result = await pool.query(query, params);
      console.log('findByUserId - Encontrados:', result.rows.length, 'anúncios');
      
      return result.rows.map(row => ({
        ...row,
        // Converte a imagem para Base64 antes de enviar para o front-end
        image_data: convertImageToBase64(row.image_data, row.image_mime_type),
        user: {
          name: row.user_name,
          phone: row.user_phone,
          email: row.user_email
        }
      }));
    } catch (error) {
      console.error('findByUserId - Erro na query:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, userId) {
    console.log('updateStatus - Dados recebidos:', {
      id,
      idType: typeof id,
      status,
      statusType: typeof status,
      userId,
      userIdType: typeof userId
    });

    const numericId = parseInt(id, 10);
    const numericUserId = parseInt(userId, 10);
    const stringStatus = String(status).toLowerCase();

    if (isNaN(numericId) || isNaN(numericUserId)) {
      console.error('updateStatus - IDs inválidos:', { id, userId });
      throw new Error('IDs devem ser números válidos');
    }

    if (!['ativo', 'encontrado', 'inativo'].includes(stringStatus)) {
      console.error('updateStatus - Status inválido:', stringStatus);
      throw new Error('Status deve ser: ativo, encontrado ou inativo');
    }

    console.log('updateStatus - Chamando Announcement.updateStatus com:', {
      id: numericId,
      status: stringStatus,
      userId: numericUserId
    });

    const params = [stringStatus, numericId, numericUserId];
    
    console.log('updateStatus - Parâmetros:', {
      id: numericId,
      idType: typeof numericId,
      status: stringStatus,
      statusType: typeof stringStatus,
      userId: numericUserId,
      userIdType: typeof numericUserId
    });

    const query = `
      UPDATE announcements
      SET status = $1::VARCHAR,
          updated_at = CURRENT_TIMESTAMP,
          found_date = CASE WHEN $1::VARCHAR = 'encontrado' THEN CURRENT_TIMESTAMP ELSE found_date END
      WHERE id = $2::INTEGER AND user_id = $3::INTEGER
      RETURNING *
    `;

    console.log('updateStatus - Query:');
    console.log(query);
    console.log('updateStatus - Valores:', params);

    try {
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        console.log('updateStatus - Nenhum registro atualizado');
        return null;
      }

      console.log('updateStatus - Sucesso:', result.rows[0]);
      const row = result.rows[0];
      
      // Retorna a imagem em Base64 para o controller
      return {
        ...row,
        image_data: convertImageToBase64(row.image_data, row.image_mime_type),
      };
    } catch (error) {
      console.error('updateStatus - Erro na query:', error);
      console.error('updateStatus - Erro:', error);
      throw error;
    }
  }
}

module.exports = Announcement;

//versao antiga
// const pool = require('../config/database');

// // Coordenadas dos bairros de Salvador
// const neighborhoodCoords = {
//   'pelourinho': { lat: -12.9714, lng: -38.5014 },
//   'barra': { lat: -12.9818, lng: -38.4652 },
//   'itapuã': { lat: -12.9398, lng: -38.4087 },
//   'pituba': { lat: -12.9934, lng: -38.4506 },
//   'liberdade': { lat: -12.9055, lng: -38.3364 },
//   'campo grande': { lat: -12.9645, lng: -38.5105 },
//   'rio vermelho': { lat: -12.9547, lng: -38.4920 },
//   'ondina': { lat: -12.9666, lng: -38.5134 },
//   'federação': { lat: -12.9562, lng: -38.5015 },
//   'brotas': { lat: -12.9234, lng: -38.4567 },
//   'nazaré': { lat: -12.9678, lng: -38.5089 },
//   'barris': { lat: -12.9612, lng: -38.5178 },
//   'graça': { lat: -12.9589, lng: -38.5145 },
//   'vitória': { lat: -12.9723, lng: -38.5234 },
//   'corredor da vitória': { lat: -12.9756, lng: -38.5189 },
//   'canela': { lat: -12.9634, lng: -38.5098 },
//   'imbuí': { lat: -12.9845, lng: -38.4234 },
//   'caminho das árvores': { lat: -12.9789, lng: -38.4345 },
//   'pituaçu': { lat: -12.9823, lng: -38.4123 },
//   'costa azul': { lat: -12.9712, lng: -38.4089 },
//   'armação': { lat: -12.9567, lng: -38.3989 },
//   'patamares': { lat: -12.9434, lng: -38.3812 }
// };

// class Announcement {
//   static async create(data) {
//     console.log('create - Dados recebidos:', data);
    
//     // Se não tem coordenadas, usar as do bairro
//     let finalLat = data.latitude;
//     let finalLng = data.longitude;

//     if (!finalLat || !finalLng) {
//       const coords = neighborhoodCoords[data.neighborhood.toLowerCase()];
//       if (coords) {
//         finalLat = coords.lat;
//         finalLng = coords.lng;
//       }
//     }

//     const query = `
//       INSERT INTO announcements (
//         pet_name, description, type, user_id, image_url, 
//         neighborhood, latitude, longitude
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       RETURNING *
//     `;
    
//     const values = [
//       data.pet_name,
//       data.description,
//       data.type,
//       data.user_id,
//       data.image_url,
//       data.neighborhood,
//       finalLat,
//       finalLng
//     ];

//     console.log('create - Query:', query);
//     console.log('create - Valores:', values);

//     try {
//       const result = await pool.query(query, values);
//       console.log('create - Sucesso:', result.rows[0]);
//       return result.rows[0];
//     } catch (error) {
//       console.error('create - Erro na query:', error);
//       throw error;
//     }
//   }

//   static async findAll(status = 'ativo') {
//     console.log('findAll - Status solicitado:', status);
    
//     const query = `
//       SELECT a.*, u.name as user_name, u.phone as user_phone, u.email as user_email
//       FROM announcements a
//       JOIN users u ON a.user_id = u.id
//       WHERE a.status = $1
//       ORDER BY a.created_at DESC
//     `;
    
//     try {
//       const result = await pool.query(query, [status]);
//       console.log('findAll - Encontrados:', result.rows.length, 'anúncios');
      
//       return result.rows.map(row => ({
//         ...row,
//         user: {
//           name: row.user_name,
//           phone: row.user_phone,
//           email: row.user_email
//         }
//       }));
//     } catch (error) {
//       console.error('findAll - Erro na query:', error);
//       throw error;
//     }
//   }

//   static async findByUserId(userId, status = null) {
//     console.log('findByUserId - UserId:', userId, 'Status:', status);
    
//     let query = `
//       SELECT a.*, u.name as user_name, u.phone as user_phone, u.email as user_email
//       FROM announcements a
//       JOIN users u ON a.user_id = u.id
//       WHERE a.user_id = $1
//     `;
    
//     const params = [userId];
    
//     if (status) {
//       query += ' AND a.status = $2';
//       params.push(status);
//     }
    
//     query += ' ORDER BY a.created_at DESC';
    
//     try {
//       const result = await pool.query(query, params);
//       console.log('findByUserId - Encontrados:', result.rows.length, 'anúncios');
      
//       return result.rows.map(row => ({
//         ...row,
//         user: {
//           name: row.user_name,
//           phone: row.user_phone,
//           email: row.user_email
//         }
//       }));
//     } catch (error) {
//       console.error('findByUserId - Erro na query:', error);
//       throw error;
//     }
//   }

//   static async updateStatus(id, status, userId) {
//     console.log('updateStatus - Dados recebidos:', {
//       id,
//       idType: typeof id,
//       status,
//       statusType: typeof status,
//       userId,
//       userIdType: typeof userId
//     });

//     // Garantir que os tipos estão corretos
//     const numericId = parseInt(id, 10);
//     const numericUserId = parseInt(userId, 10);
//     const stringStatus = String(status).toLowerCase();

//     // Validar valores
//     if (isNaN(numericId) || isNaN(numericUserId)) {
//       console.error('updateStatus - IDs inválidos:', { id, userId });
//       throw new Error('IDs devem ser números válidos');
//     }

//     if (!['ativo', 'encontrado', 'inativo'].includes(stringStatus)) {
//       console.error('updateStatus - Status inválido:', stringStatus);
//       throw new Error('Status deve ser: ativo, encontrado ou inativo');
//     }

//     console.log('updateStatus - Chamando Announcement.updateStatus com:', {
//       id: numericId,
//       status: stringStatus,
//       userId: numericUserId
//     });

//     // Preparar parâmetros com tipos explícitos
//     const params = [stringStatus, numericId, numericUserId];
    
//     console.log('updateStatus - Parâmetros:', {
//       id: numericId,
//       idType: typeof numericId,
//       status: stringStatus,
//       statusType: typeof stringStatus,
//       userId: numericUserId,
//       userIdType: typeof numericUserId
//     });

//     const query = `
//       UPDATE announcements
//       SET status = $1::VARCHAR,
//           updated_at = CURRENT_TIMESTAMP,
//           found_date = CASE WHEN $1::VARCHAR = 'encontrado' THEN CURRENT_TIMESTAMP ELSE found_date END
//       WHERE id = $2::INTEGER AND user_id = $3::INTEGER
//       RETURNING *
//     `;

//     console.log('updateStatus - Query:');
//     console.log(query);
//     console.log('updateStatus - Valores:', params);

//     try {
//       const result = await pool.query(query, params);
      
//       if (result.rows.length === 0) {
//         console.log('updateStatus - Nenhum registro atualizado');
//         return null;
//       }

//       console.log('updateStatus - Sucesso:', result.rows[0]);
//       return result.rows[0];
//     } catch (error) {
//       console.error('updateStatus - Erro na query:', error);
//       console.error('updateStatus - Erro:', error);
//       throw error;
//     }
//   }
// }

// module.exports = Announcement;
//versao antiga