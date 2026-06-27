const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');

router.post('/vnpay/create', authenticate, ctrl.createVnpayUrl);
router.get('/vnpay/return', ctrl.vnpayReturn);

module.exports = router;
