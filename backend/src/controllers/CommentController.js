const Comment = require('../models/Comment');

class CommentController {
  static async create(req, res) {
    try {
      const { announcement_id } = req.params;
      const { content } = req.body;

      // Validações
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const commentData = {
        announcement_id: parseInt(announcement_id),
        user_id: req.user.id,
        content: content.trim()
      };

      console.log('Criando comentário:', commentData);

      // Criar comentário
      const newComment = await Comment.create(commentData);
      console.log('Comentário criado:', newComment);
      
      // Buscar o comentário com dados do usuário
      const commentWithUser = await Comment.findByIdWithUser(newComment.id);
      console.log('Comentário com usuário:', commentWithUser);

      if (!commentWithUser) {
        return res.status(500).json({ error: 'Erro ao recuperar comentário criado' });
      }

      res.status(201).json({
        message: 'Comentário criado com sucesso',
        comment: commentWithUser
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getByAnnouncement(req, res) {
    try {
      const { announcement_id } = req.params;
      
      if (!announcement_id || isNaN(parseInt(announcement_id))) {
        return res.status(400).json({ error: 'ID do anúncio inválido' });
      }

      console.log('Buscando comentários para anúncio:', announcement_id);
      
      const comments = await Comment.findByAnnouncementId(parseInt(announcement_id));
      console.log('Comentários encontrados:', comments.length);
      
      res.json(comments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = CommentController;