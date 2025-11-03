const multer = require('multer');

// Usamos memoryStorage para que o arquivo fique em memória (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware condicional que detecta o tipo de requisição
const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Se for JSON, pula o Multer completamente
  if (contentType.includes('application/json')) {
    console.log('Middleware: Detectado JSON - pulando Multer');
    return next();
  }
  
  // Se for multipart/form-data, usa o Multer
  if (contentType.includes('multipart/form-data')) {
    console.log('Middleware: Detectado FormData - usando Multer');
    const uploadSingle = upload.single('image');
    return uploadSingle(req, res, (err) => {
      if (err) {
        console.error('Middleware: Erro no Multer:', err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }
  
  // Para outros tipos, continua sem processar
  console.log('Middleware: Content-Type desconhecido, continuando...');
  next();
};

module.exports = conditionalUpload;

//versao antiga

// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Apenas imagens são permitidas!'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB
//   }
// });

// module.exports = upload;
//versao antiga