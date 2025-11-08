const Comment = require('../models/Comment');

class CommentController {
  static async create(req, res) {
    try {
      const { announcement_id } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
      }

      const commentData = {
        announcement_id: parseInt(announcement_id),
        user_id: req.user.id,
        content: content.trim()
      };

      const newComment = await Comment.create(commentData);
      const commentWithUser = await Comment.findByIdWithUser(newComment.id);

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

      const comments = await Comment.findByAnnouncementId(parseInt(announcement_id));
      
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