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

const app = express();

// Criar pasta uploads se não existir
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Auth routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/me', authenticateToken, AuthController.me);

// Announcement routes
app.post('/api/announcements', authenticateToken, upload.single('image'), AnnouncementController.create);
app.get('/api/announcements', AnnouncementController.getAll);
app.get('/api/my-announcements', authenticateToken, AnnouncementController.getMyAnnouncements);
app.patch('/api/announcements/:id/status', authenticateToken, AnnouncementController.updateStatus);

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