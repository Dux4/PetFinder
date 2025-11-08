const multer = require('multer');

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
    fileSize: 10 * 1024 * 1024
  }
});

const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('application/json')) {
    return next();
  }
  
  if (contentType.includes('multipart/form-data')) {
    const uploadSingle = upload.single('image');
    return uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }
  
  next();
};

module.exports = conditionalUpload;
