const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/addresses', ctrl.getAddresses);
router.post('/addresses', ctrl.createAddress);
router.put('/addresses/:id', ctrl.updateAddress);
router.put('/addresses/:id/default', ctrl.setDefaultAddress);
router.delete('/addresses/:id', ctrl.deleteAddress);


module.exports = router;
