const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const upload = require('./middleware/upload');
const authenticateToken = require('./middleware/auth');
const AuthController = require('./controllers/authController');
const AnnouncementController = require('./controllers/announcementController');
const LocationController = require('./controllers/locationController');
const CommentController = require('./controllers/CommentController');

const app = express();

// Criar pasta uploads se não existir
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());

// IMPORTANTE: express.json DEVE vir ANTES das rotas
// Aumentar o limite para aceitar Base64 grandes (até 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Auth routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/me', authenticateToken, AuthController.me);

// TESTE TEMPORÁRIO - Middleware de debug
app.use('/api/announcements', (req, res, next) => {
  if (req.method === 'POST') {
    console.log('\n=== MIDDLEWARE DEBUG ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body existe?', !!req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'VAZIO');
    console.log('Body.image_data existe?', !!req.body?.image_data);
    console.log('Body.image_data length:', req.body?.image_data?.length || 0);
    console.log('========================\n');
  }
  next();
});

// Announcement routes
// O middleware condicional detecta automaticamente JSON vs FormData
app.post('/api/announcements', authenticateToken, upload, AnnouncementController.create);
app.get('/api/announcements', AnnouncementController.getAll);
app.get('/api/my-announcements', authenticateToken, AnnouncementController.getMyAnnouncements);
app.patch('/api/announcements/:id/status', authenticateToken, AnnouncementController.updateStatus);

// Comment routes
app.post('/api/announcements/:announcement_id/comments', authenticateToken, CommentController.create);
app.get('/api/announcements/:announcement_id/comments', CommentController.getByAnnouncement);

// Location routes
app.get('/api/neighborhoods', LocationController.getNeighborhoods);
app.post('/api/get-location', LocationController.getLocationFromCoords);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Pet Finder Salvador - Backend (PostgreSQL) funcionando!',
    database: 'PostgreSQL'
  });
});

module.exports = app;