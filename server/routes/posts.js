const router = require('express').Router();
const ctrl = require('../controllers/postController');

router.get('/', ctrl.getPublished);
router.get('/:slug', ctrl.getBySlug);

module.exports = router;
