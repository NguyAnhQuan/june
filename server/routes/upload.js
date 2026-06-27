const router = require('express').Router();
const ctrl = require('../controllers/uploadController');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const multer = require('multer');

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Lỗi tải file: ' + err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Lỗi tải file' });
  }
  next();
};

router.post('/', authenticate, upload.single('image'), handleMulterError, ctrl.uploadImage);
router.post('/multiple', authenticate, upload.array('images', 10), handleMulterError, ctrl.uploadMultiple);
router.delete('/', authenticate, ctrl.deleteImage);

module.exports = router;
