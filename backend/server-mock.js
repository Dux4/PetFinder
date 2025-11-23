const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'pet-finder-secret-key';

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads-mock')));

// Upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads-mock';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Mock Data
let users = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@email.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '(71) 99999-0001',
    created_at: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@email.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '(71) 99999-0002',
    created_at: new Date('2024-01-20')
  }
];

let announcements = [
  {
    id: '1',
    pet_name: 'Rex',
    description: 'Cachorro de porte médio, cor marrom, muito dócil. Desapareceu durante passeio.',
    type: 'perdido',
    user_id: '1',
    image_url: '/uploads/rex.jpg',
    neighborhood: 'Pelourinho',
    latitude: -12.9714,
    longitude: -38.5014,
    status: 'ativo',
    created_at: new Date('2024-03-15'),
    updated_at: new Date('2024-03-15')
  },
  {
    id: '2',
    pet_name: 'Mimi',
    description: 'Gata persa, cor branca com manchas cinzas, muito carinhosa.',
    type: 'perdido',
    user_id: '2',
    image_url: '/uploads/mimi.jpg',
    neighborhood: 'Barra',
    latitude: -12.9818,
    longitude: -38.4652,
    status: 'ativo',
    created_at: new Date('2024-03-20'),
    updated_at: new Date('2024-03-20')
  },
  {
    id: '3',
    pet_name: 'Buddy',
    description: 'Cachorro golden retriever, cor dourada, coleira azul.',
    type: 'encontrado',
    user_id: '1',
    image_url: '/uploads/buddy.jpg',
    neighborhood: 'Itapuã',
    latitude: -12.9398,
    longitude: -38.4087,
    status: 'ativo',
    created_at: new Date('2024-03-18'),
    updated_at: new Date('2024-03-18')
  },
  {
    id: '4',
    pet_name: 'Simba',
    description: 'Gato laranja, castrado, muito carinhoso. Reunido com a família!',
    type: 'perdido',
    user_id: '2',
    image_url: '/uploads/simba.jpg',
    neighborhood: 'Liberdade',
    latitude: -12.9055,
    longitude: -38.3364,
    status: 'encontrado',
    found_date: new Date('2024-03-22'),
    created_at: new Date('2024-03-10'),
    updated_at: new Date('2024-03-22')
  }
];

const salvadorNeighborhoods = [
  'Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Liberdade', 'Campo Grande',
  'Rio Vermelho', 'Ondina', 'Federação', 'Brotas', 'Nazaré', 'Barris',
  'Graça', 'Vitória', 'Corredor da Vitória', 'Canela', 'Imbuí', 
  'Caminho das Árvores', 'Pituaçu', 'Costa Azul', 'Armação', 'Patamares'
];

const neighborhoodCoords = {
  'pelourinho': { lat: -12.9714, lng: -38.5014 },
  'barra': { lat: -12.9818, lng: -38.4652 },
  'itapuã': { lat: -12.9398, lng: -38.4087 },
  'pituba': { lat: -12.9934, lng: -38.4506 },
  'liberdade': { lat: -12.9055, lng: -38.3364 },
  'campo grande': { lat: -12.9645, lng: -38.5105 },
  'rio vermelho': { lat: -12.9547, lng: -38.4920 },
  'ondina': { lat: -12.9666, lng: -38.5134 },
  'federação': { lat: -12.9562, lng: -38.5015 },
  'brotas': { lat: -12.9234, lng: -38.4567 },
  'nazaré': { lat: -12.9678, lng: -38.5089 },
  'barris': { lat: -12.9612, lng: -38.5178 },
  'graça': { lat: -12.9589, lng: -38.5145 },
  'vitória': { lat: -12.9723, lng: -38.5234 },
  'corredor da vitória': { lat: -12.9756, lng: -38.5189 },
  'canela': { lat: -12.9634, lng: -38.5098 },
  'imbuí': { lat: -12.9845, lng: -38.4234 },
  'caminho das árvores': { lat: -12.9789, lng: -38.4345 },
  'pituaçu': { lat: -12.9823, lng: -38.4123 },
  'costa azul': { lat: -12.9712, lng: -38.4089 },
  'armação': { lat: -12.9567, lng: -38.3989 },
  'patamares': { lat: -12.9434, lng: -38.3812 }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Pet Finder Salvador - Backend Mock funcionando!',
    mode: 'mock',
    stats: {
      users: users.length,
      announcements: announcements.length,
      active_announcements: announcements.filter(a => a.status === 'ativo').length,
      found_pets: announcements.filter(a => a.status === 'encontrado').length
    }
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    phone,
    created_at: new Date()
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({
    message: 'Usuário criado com sucesso',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    message: 'Login realizado com sucesso',
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone
  });
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const { name, email, phone, password } = req.body;

  // Verificar se o email já está em uso por outro usuário
  if (email && email !== user.email) {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
  }

  // Atualizar os campos fornecidos
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (password !== undefined) {
    user.password = bcrypt.hashSync(password, 10);
  }

  res.json({
    message: 'Perfil atualizado com sucesso',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// Announcement routes
app.post('/api/announcements', authenticateToken, upload.single('image'), (req, res) => {
  const { pet_name, description, type, neighborhood, latitude, longitude } = req.body;

  if (!pet_name || !description || !type || !neighborhood) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  // Se não tem coordenadas, usar as do bairro
  let finalLat = latitude ? parseFloat(latitude) : null;
  let finalLng = longitude ? parseFloat(longitude) : null;

  if (!finalLat || !finalLng) {
    const coords = neighborhoodCoords[neighborhood.toLowerCase()];
    if (coords) {
      finalLat = coords.lat;
      finalLng = coords.lng;
    }
  }

  const newAnnouncement = {
    id: uuidv4(),
    pet_name,
    description,
    type,
    user_id: req.user.id,
    image_url,
    neighborhood,
    latitude: finalLat,
    longitude: finalLng,
    status: 'ativo',
    created_at: new Date(),
    updated_at: new Date()
  };

  announcements.push(newAnnouncement);
  res.status(201).json({ message: 'Anúncio criado com sucesso', announcement: newAnnouncement });
});

app.get('/api/announcements', (req, res) => {
  const { status = 'ativo' } = req.query;
  
  const filteredAnnouncements = announcements
    .filter(a => a.status === status)
    .map(announcement => {
      const user = users.find(u => u.id === announcement.user_id);
      return {
        ...announcement,
        user: user ? { 
          name: user.name, 
          phone: user.phone, 
          email: user.email 
        } : null
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(filteredAnnouncements);
});

app.get('/api/my-announcements', authenticateToken, (req, res) => {
  const { status } = req.query;
  
  let myAnnouncements = announcements.filter(a => a.user_id === req.user.id);
  
  if (status) {
    myAnnouncements = myAnnouncements.filter(a => a.status === status);
  }

  const enrichedAnnouncements = myAnnouncements
    .map(announcement => {
      const user = users.find(u => u.id === announcement.user_id);
      return {
        ...announcement,
        user: user ? { 
          name: user.name, 
          phone: user.phone, 
          email: user.email 
        } : null
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(enrichedAnnouncements);
});

app.patch('/api/announcements/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const announcement = announcements.find(a => a.id === id);
  if (!announcement) {
    return res.status(404).json({ error: 'Anúncio não encontrado' });
  }

  if (announcement.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Apenas o dono do anúncio pode alterar o status' });
  }

  announcement.status = status;
  announcement.updated_at = new Date();
  
  if (status === 'encontrado') {
    announcement.found_date = new Date();
  }

  res.json({ message: 'Status atualizado com sucesso', announcement });
});

// Location routes
app.get('/api/neighborhoods', (req, res) => {
  res.json(salvadorNeighborhoods);
});

app.post('/api/get-location', (req, res) => {
  const { latitude, longitude } = req.body;
  
  const neighborhoods = ['Pelourinho', 'Barra', 'Itapuã', 'Pituba', 'Rio Vermelho'];
  const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  
  res.json({
    neighborhood: randomNeighborhood,
    latitude,
    longitude,
    address: `${randomNeighborhood}, Salvador - BA`
  });
});

// Initialize mock images
function initializeMockImages() {
  const mockDir = 'uploads-mock';
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir, { recursive: true });
  }
  
  const petImages = ['rex.jpg', 'mimi.jpg', 'buddy.jpg', 'simba.jpg'];
  petImages.forEach(filename => {
    const filepath = path.join(mockDir, filename);
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, 'mock-image-data');
    }
  });
}

initializeMockImages();

app.listen(PORT, () => {
  console.log(`🐾 Pet Finder Salvador - Servidor Mock rodando na porta ${PORT}`);
  console.log(`📊 Dados: ${users.length} usuários, ${announcements.length} anúncios`);
  console.log(`🔐 Usuários de teste: maria@email.com / joao@email.com (senha: 123456)`);
  console.log(`🌐 Acesse: http://localhost:${PORT}/api/health`);
});