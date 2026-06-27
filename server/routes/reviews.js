const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/auth');

router.get('/product/:productId', ctrl.getByProduct);
router.post('/', authenticate, ctrl.create);

module.exports = router;
