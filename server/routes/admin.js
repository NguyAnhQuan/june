const router = require('express').Router();
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const adminCtrl = require('../controllers/adminController');
const categoryCtrl = require('../controllers/categoryController');
const productCtrl = require('../controllers/productController');
const orderCtrl = require('../controllers/orderController');
const couponCtrl = require('../controllers/couponController');
const bannerCtrl = require('../controllers/bannerController');
const reviewCtrl = require('../controllers/reviewController');
const postCtrl = require('../controllers/postController');
const contactCtrl = require('../controllers/contactController');

router.use(authenticate, authorizeAdmin);

// Dashboard
router.get('/dashboard', adminCtrl.getDashboard);

// Categories
router.get('/categories', categoryCtrl.getAllAdmin);
router.post('/categories', categoryCtrl.create);
router.put('/categories/:id', categoryCtrl.update);
router.delete('/categories/:id', categoryCtrl.remove);

// Products
router.get('/products', productCtrl.getAllAdmin);
router.post('/products', productCtrl.create);
router.put('/products/:id', productCtrl.update);
router.delete('/products/:id', productCtrl.remove);

// Orders
router.get('/orders', orderCtrl.getAllOrders);
router.get('/orders/:id', orderCtrl.getOrderDetailAdmin);
router.put('/orders/:id/status', orderCtrl.updateOrderStatus);

// Customers
router.get('/customers', adminCtrl.getCustomers);
router.get('/customers/:id', adminCtrl.getCustomerDetail);
router.put('/customers/:id/toggle-status', adminCtrl.toggleCustomerStatus);

// Coupons
router.get('/coupons', couponCtrl.getAll);
router.post('/coupons', couponCtrl.create);
router.put('/coupons/:id', couponCtrl.update);
router.delete('/coupons/:id', couponCtrl.remove);

// Banners
router.get('/banners', bannerCtrl.getAll);
router.post('/banners', bannerCtrl.create);
router.put('/banners/:id', bannerCtrl.update);
router.delete('/banners/:id', bannerCtrl.remove);

// Reviews
router.get('/reviews', reviewCtrl.getAllAdmin);
router.put('/reviews/:id', reviewCtrl.approve);
router.delete('/reviews/:id', reviewCtrl.remove);

// Posts
router.get('/posts', postCtrl.getAll);
router.post('/posts', postCtrl.create);
router.put('/posts/:id', postCtrl.update);
router.delete('/posts/:id', postCtrl.remove);

// Contacts
router.get('/contacts', contactCtrl.getAll);
router.put('/contacts/:id/read', contactCtrl.markRead);
router.delete('/contacts/:id', contactCtrl.remove);

// Reports
router.get('/reports/revenue', adminCtrl.getRevenue);
router.get('/reports/revenue/export', adminCtrl.exportRevenue);
router.get('/reports/inventory', adminCtrl.getInventory);


// Settings
router.get('/settings', adminCtrl.getSettings);
router.put('/settings', adminCtrl.updateSettings);

module.exports = router;
