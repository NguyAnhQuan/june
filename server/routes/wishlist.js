const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.toggle);
router.delete('/:id', ctrl.remove);

module.exports = router;
