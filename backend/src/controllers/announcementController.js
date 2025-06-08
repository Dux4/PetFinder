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
        longitude
      } = req.body;

      if (!pet_name || !description || !type || !neighborhood) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const announcementData = {
        pet_name,
        description,
        type,
        user_id: req.user.id,
        image_url,
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

      const announcement = await Announcement.updateStatus(id, status, req.user.id);
      
      if (!announcement) {
        return res.status(404).json({ error: 'Anúncio não encontrado ou você não tem permissão' });
      }

      res.json({ message: 'Status atualizado com sucesso', announcement });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = AnnouncementController;