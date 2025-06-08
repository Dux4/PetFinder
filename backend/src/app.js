const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const announcementRoutes = require('./routes/announcements');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/announcements', announcementRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

module.exports = app;