const Announcement = require('../models/Announcement');

class AnnouncementController {
  static async create(req, res) {
    try {
      // TESTE: Log completo do body para debug
      console.log('=== BODY COMPLETO ===');
      console.log('Type of req.body:', typeof req.body);
      console.log('Is array:', Array.isArray(req.body));
      console.log('Keys:', Object.keys(req.body));
      console.log('=====================');
      
      const {
        pet_name,
        description,
        type,
        neighborhood,
        latitude,
        longitude,
        image_data, // Base64 string (mobile)
        image_mime_type // MIME type (mobile)
      } = req.body;

      console.log('=== CREATE ANNOUNCEMENT DEBUG ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Platform:', req.file ? 'WEB (FormData)' : 'MOBILE (JSON Base64)');
      console.log('Has req.file:', !!req.file);
      console.log('Has image_data in body:', !!image_data);
      console.log('image_data length:', image_data ? image_data.length : 0);
      console.log('image_mime_type:', image_mime_type);
      console.log('req.body keys:', Object.keys(req.body));
      console.log('Dados do body:', {
        pet_name,
        type,
        neighborhood,
        latitude,
        longitude,
        description: description?.substring(0, 50)
      });
      console.log('================================');

      if (!pet_name || !description || !type || !neighborhood) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      let imageBuffer = null;
      let mimeType = null;

      // Se veio um arquivo (Web - FormData)
      if (req.file) {
        console.log('create - Usando imagem do FormData (Web)');
        imageBuffer = req.file.buffer;
        mimeType = req.file.mimetype;
      } 
      // Se veio Base64 (Mobile - JSON)
      else if (image_data && image_mime_type) {
        console.log('create - Usando imagem Base64 (Mobile)');
        console.log('create - Base64 recebido:', {
          length: image_data.length,
          mime: image_mime_type,
          starts_with: image_data.substring(0, 50)
        });
        
        try {
          // Converte Base64 string para Buffer
          imageBuffer = Buffer.from(image_data, 'base64');
          mimeType = image_mime_type;
          console.log(`create - Buffer criado com sucesso. Tamanho: ${imageBuffer.length} bytes`);
          
          // Validar se o buffer foi criado corretamente
          if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Buffer vazio após conversão');
          }
        } catch (error) {
          console.error('create - Erro ao converter Base64 para Buffer:', error);
          return res.status(400).json({ 
            error: 'Imagem inválida. Verifique o formato.',
            details: error.message 
          });
        }
      } else {
        console.log('create - Nenhuma imagem fornecida (ok, campo opcional)');
      }

      const announcementData = {
        pet_name,
        description,
        type,
        user_id: req.user.id,
        image_data: imageBuffer,
        image_mime_type: mimeType,
        neighborhood,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      };

      console.log('create - Criando anúncio:', {
        ...announcementData,
        image_data: imageBuffer ? `Buffer(${imageBuffer.length} bytes)` : null
      });

      const announcement = await Announcement.create(announcementData);

      res.status(201).json({
        message: 'Anúncio criado com sucesso',
        announcement
      });
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAll(req, res) {
    try {
      const { status = 'ativo' } = req.query;
      console.log('getAll - Status solicitado:', status);
      
      const announcements = await Announcement.findAll(status);
      res.json(announcements);
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getMyAnnouncements(req, res) {
    try {
      const { status } = req.query;
      console.log('getMyAnnouncements - UserId:', req.user.id, 'Status:', status);
      
      const announcements = await Announcement.findByUserId(req.user.id, status);
      res.json(announcements);
    } catch (error) {
      console.error('Erro ao buscar meus anúncios:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log('updateStatus - Dados recebidos:', {
        id,
        status,
        userId: req.user.id
      });

      // Validações
      if (!id) {
        return res.status(400).json({ error: 'ID do anúncio é obrigatório' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      // Validar status
      const validStatuses = ['ativo', 'encontrado', 'inativo'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Status inválido. Use: ativo, encontrado ou inativo' 
        });
      }

      // Tentar atualizar
      const announcement = await Announcement.updateStatus(id, status, req.user.id);
      
      if (!announcement) {
        return res.status(404).json({ 
          error: 'Anúncio não encontrado ou você não tem permissão para editá-lo' 
        });
      }

      console.log('updateStatus - Sucesso:', announcement);

      res.json({ 
        success: true,
        message: 'Status atualizado com sucesso', 
        data: announcement 
      });
    } catch (error) {
      console.error('updateStatus - Erro no controller:', error);
      
      // Resposta de erro mais específica
      let errorMessage = 'Erro interno do servidor';
      let statusCode = 500;

      if (error.message.includes('IDs devem ser números válidos')) {
        errorMessage = 'ID inválido fornecido';
        statusCode = 400;
      } else if (error.message.includes('Status deve ser')) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (error.code === '23503') {
        errorMessage = 'Anúncio ou usuário não encontrado';
        statusCode = 404;
      } else if (error.code === '42P08') {
        errorMessage = 'Erro de tipo de dados. Tente novamente.';
        statusCode = 400;
      }

      res.status(statusCode).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AnnouncementController;

//versao antiga
// const Announcement = require('../models/Announcement');

// class AnnouncementController {
//   static async create(req, res) {
//     try {
//       const {
//         pet_name,
//         description,
//         type,
//         neighborhood,
//         latitude,
//         longitude
//       } = req.body;

//       console.log('create - Dados recebidos:', req.body);

//       if (!pet_name || !description || !type || !neighborhood) {
//         return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
//       }

//       const image_url = req.file ? `/uploads/${req.file.filename}` : null;

//       const announcementData = {
//         pet_name,
//         description,
//         type,
//         user_id: req.user.id,
//         image_url,
//         neighborhood,
//         latitude: latitude ? parseFloat(latitude) : null,
//         longitude: longitude ? parseFloat(longitude) : null
//       };

//       const announcement = await Announcement.create(announcementData);

//       res.status(201).json({
//         message: 'Anúncio criado com sucesso',
//         announcement
//       });
//     } catch (error) {
//       console.error('Erro ao criar anúncio:', error);
//       res.status(500).json({ error: 'Erro interno do servidor' });
//     }
//   }

//   static async getAll(req, res) {
//     try {
//       const { status = 'ativo' } = req.query;
//       console.log('getAll - Status solicitado:', status);
      
//       const announcements = await Announcement.findAll(status);
//       res.json(announcements);
//     } catch (error) {
//       console.error('Erro ao buscar anúncios:', error);
//       res.status(500).json({ error: 'Erro interno do servidor' });
//     }
//   }

//   static async getMyAnnouncements(req, res) {
//     try {
//       const { status } = req.query;
//       console.log('getMyAnnouncements - UserId:', req.user.id, 'Status:', status);
      
//       const announcements = await Announcement.findByUserId(req.user.id, status);
//       res.json(announcements);
//     } catch (error) {
//       console.error('Erro ao buscar meus anúncios:', error);
//       res.status(500).json({ error: 'Erro interno do servidor' });
//     }
//   }

//   static async updateStatus(req, res) {
//     try {
//       const { id } = req.params;
//       const { status } = req.body;

//       console.log('updateStatus - Dados recebidos:', {
//         id,
//         idType: typeof id,
//         status,
//         statusType: typeof status,
//         userId: req.user.id,
//         userIdType: typeof req.user.id,
//         body: req.body,
//         params: req.params
//       });

//       // Validações
//       if (!id) {
//         return res.status(400).json({ error: 'ID do anúncio é obrigatório' });
//       }

//       if (!status) {
//         return res.status(400).json({ error: 'Status é obrigatório' });
//       }

//       // Validar status
//       const validStatuses = ['ativo', 'encontrado', 'inativo'];
//       if (!validStatuses.includes(status.toLowerCase())) {
//         return res.status(400).json({ 
//           error: 'Status inválido. Use: ativo, encontrado ou inativo' 
//         });
//       }

//       // Tentar atualizar
//       const announcement = await Announcement.updateStatus(id, status, req.user.id);
      
//       if (!announcement) {
//         return res.status(404).json({ 
//           error: 'Anúncio não encontrado ou você não tem permissão para editá-lo' 
//         });
//       }

//       console.log('updateStatus - Sucesso:', announcement);

//       res.json({ 
//         success: true,
//         message: 'Status atualizado com sucesso', 
//         data: announcement 
//       });
//     } catch (error) {
//       console.error('updateStatus - Erro no controller:', error);
      
//       // Resposta de erro mais específica
//       let errorMessage = 'Erro interno do servidor';
//       let statusCode = 500;

//       if (error.message.includes('IDs devem ser números válidos')) {
//         errorMessage = 'ID inválido fornecido';
//         statusCode = 400;
//       } else if (error.message.includes('Status deve ser')) {
//         errorMessage = error.message;
//         statusCode = 400;
//       } else if (error.code === '23503') {
//         errorMessage = 'Anúncio ou usuário não encontrado';
//         statusCode = 404;
//       } else if (error.code === '42P08') {
//         errorMessage = 'Erro de tipo de dados. Tente novamente.';
//         statusCode = 400;
//       }

//       res.status(statusCode).json({ 
//         error: errorMessage,
//         details: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
// }

// module.exports = AnnouncementController;
//versao antiga