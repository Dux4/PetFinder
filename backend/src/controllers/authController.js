const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pet-finder-secret-key';

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const user = await User.create({ name, email, password, phone });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await User.findByEmail(email);
      if (!user || !User.validatePassword(password, user.password)) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async me(req, res) {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    });
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, email, phone, password } = req.body;

      // Validações básicas
      if (name !== undefined && (!name || name.trim().length === 0)) {
        return res.status(400).json({ error: 'O nome não pode estar vazio' });
      }

      if (email !== undefined && (!email || !email.includes('@'))) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      if (phone !== undefined && (!phone || phone.trim().length === 0)) {
        return res.status(400).json({ error: 'O telefone não pode estar vazio' });
      }

      if (password !== undefined && password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
      }

      // Verificar se o email já está em uso por outro usuário
      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      }

      // Atualizar o perfil
      const updatedUser = await User.update(userId, { name, email, phone, password });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = AuthController;