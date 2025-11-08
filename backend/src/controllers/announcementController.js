const Announcement = require('../models/Announcement');

class AnnouncementController {
  static async create(req, res) {
    try {
      const {
        pet_name,
        description,
        type,
        neighborhood,
        latitude,
        longitude,
        image_data,
        image_mime_type
      } = req.body;

      if (!pet_name || !description || !type || !neighborhood) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      let imageBuffer = null;
      let mimeType = null;

      if (req.file) {
        imageBuffer = req.file.buffer;
        mimeType = req.file.mimetype;
      } else if (image_data && image_mime_type) {
        try {
          imageBuffer = Buffer.from(image_data, 'base64');
          mimeType = image_mime_type;
          
          if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Buffer vazio após conversão');
          }
        } catch (error) {
          return res.status(400).json({ 
            error: 'Imagem inválida. Verifique o formato.',
            details: error.message 
          });
        }
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

      if (!id) {
        return res.status(400).json({ error: 'ID do anúncio é obrigatório' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const validStatuses = ['ativo', 'encontrado', 'inativo'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Status inválido. Use: ativo, encontrado ou inativo' 
        });
      }

      const announcement = await Announcement.updateStatus(id, status, req.user.id);
      
      if (!announcement) {
        return res.status(404).json({ 
          error: 'Anúncio não encontrado ou você não tem permissão para editá-lo' 
        });
      }

      res.json({ 
        success: true,
        message: 'Status atualizado com sucesso', 
        data: announcement 
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
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
