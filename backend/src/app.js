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

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/me', authenticateToken, AuthController.me);

app.post('/api/announcements', authenticateToken, upload, AnnouncementController.create);
app.get('/api/announcements', AnnouncementController.getAll);
app.get('/api/my-announcements', authenticateToken, AnnouncementController.getMyAnnouncements);
app.patch('/api/announcements/:id/status', authenticateToken, AnnouncementController.updateStatus);

app.post('/api/announcements/:announcement_id/comments', authenticateToken, CommentController.create);
app.get('/api/announcements/:announcement_id/comments', CommentController.getByAnnouncement);

app.get('/api/neighborhoods', LocationController.getNeighborhoods);
app.post('/api/get-location', LocationController.getLocationFromCoords);

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Pet Finder Salvador - Backend (PostgreSQL) funcionando!',
    database: 'PostgreSQL'
  });
});

module.exports = app;