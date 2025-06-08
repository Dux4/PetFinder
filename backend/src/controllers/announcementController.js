const Announcement = require('../models/Announcement');

class AnnouncementController {
  static async create(req, res) {
    try {
      const {
        pet_name,
        description,
        type,
        contact_name,
        contact_phone,
        contact_email,
        latitude,
        longitude,
        address
      } = req.body;

      // Validações básicas
      if (!pet_name || !description || !type || !contact_name || !contact_phone || !contact_email || !latitude || !longitude) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (!['perdido', 'encontrado'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser "perdido" ou "encontrado"' });
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const announcementData = {
        pet_name,
        description,
        type,
        contact_name,
        contact_phone,
        contact_email,
        image_url,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
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
      const announcements = await Announcement.findAll();
      res.json(announcements);
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getNearby(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
      }

      const announcements = await Announcement.findNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      res.json(announcements);
    } catch (error) {
      console.error('Erro ao buscar anúncios próximos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = AnnouncementController;