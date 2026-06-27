const router = require('express').Router();
const ctrl = require('../controllers/bannerController');

router.get('/', ctrl.getActive);

module.exports = router;
