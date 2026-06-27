const router = require('express').Router();
const multer = require('multer');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');
const ragCtrl = require('../controllers/ragController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get('/chat/history', optionalAuth, ragCtrl.proxyChatHistory);
router.delete('/chat/history', optionalAuth, ragCtrl.proxyClearHistory);
router.post('/chat', optionalAuth, ragCtrl.proxyChat);
router.post('/session/upload', upload.single('file'), ragCtrl.proxySessionUpload);

router.get('/admin/documents', authenticate, authorizeAdmin, ragCtrl.proxyListDocuments);
router.post('/admin/documents', authenticate, authorizeAdmin, upload.single('file'), ragCtrl.proxyUploadDocument);
router.delete('/admin/documents/:id', authenticate, authorizeAdmin, ragCtrl.proxyDeleteDocument);

module.exports = router;
