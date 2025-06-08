const express = require('express');
const upload = require('../middleware/upload');
const AnnouncementController = require('../controllers/announcementController');

const router = express.Router();

// POST /api/announcements - Criar anúncio
router.post('/', upload.single('image'), AnnouncementController.create);

// GET /api/announcements - Listar todos os anúncios
router.get('/', AnnouncementController.getAll);

// GET /api/announcements/nearby - Buscar anúncios próximos
router.get('/nearby', AnnouncementController.getNearby);

module.exports = router;