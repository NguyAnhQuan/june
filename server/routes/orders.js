const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.post('/', ctrl.create);
router.get('/', ctrl.getMyOrders);
router.get('/:id', ctrl.getOrderDetail);
router.put('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
