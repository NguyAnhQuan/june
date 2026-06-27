const router = require('express').Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/slug/:slug', ctrl.getBySlug);

module.exports = router;
