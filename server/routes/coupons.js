const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { authenticate } = require('../middlewares/auth');

router.post('/apply', authenticate, ctrl.apply);

module.exports = router;
