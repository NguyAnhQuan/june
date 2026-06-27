require('dotenv').config();
const { sequelize, User, Address, Category, Product, ProductImage, ProductVariant, CartItem, Order, OrderItem, Review, Wishlist, Coupon, Banner, Post, Notification, Contact, Setting, Payment } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Đã tạo lại database');

  // ==================== USERS ====================
  const admin = await User.create({ name: 'Admin', email: 'admin@june.vn', password: 'admin123', role: 'admin', phone: '0901234567' });
  const user1 = await User.create({ name: 'Nguyễn Văn A', email: 'user@june.vn', password: 'user123', role: 'user', phone: '0912345678' });
  const user2 = await User.create({ name: 'Trần Thị B', email: 'tranthib@gmail.com', password: 'user123', role: 'user', phone: '0923456789' });
  const user3 = await User.create({ name: 'Lê Minh C', email: 'leminhc@gmail.com', password: 'user123', role: 'user', phone: '0934567890' });
  const user4 = await User.create({ name: 'Phạm Thuỳ D', email: 'phamthuyd@gmail.com', password: 'user123', role: 'user', phone: '0945678901' });
  const user5 = await User.create({ name: 'Hoàng Anh E', email: 'hoanganhe@gmail.com', password: 'user123', role: 'user', phone: '0956789012' });
  console.log('Đã tạo 6 tài khoản');

  // ==================== ADDRESSES ====================
  const addr1 = await Address.create({ user_id: user1.id, name: 'Nguyễn Văn A', phone: '0912345678', province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', detail: '123 Đường Nguyễn Huệ', is_default: true });
  await Address.create({ user_id: user1.id, name: 'Nguyễn Văn A', phone: '0912345678', province: 'TP. Hồ Chí Minh', district: 'Quận 7', ward: 'Phường Tân Phong', detail: '456 Đường Nguyễn Thị Thập', is_default: false });
  const addr2 = await Address.create({ user_id: user2.id, name: 'Trần Thị B', phone: '0923456789', province: 'Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Tràng Tiền', detail: '78 Phố Tràng Tiền', is_default: true });
  const addr3 = await Address.create({ user_id: user3.id, name: 'Lê Minh C', phone: '0934567890', province: 'Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Thạch Thang', detail: '12 Đường Bạch Đằng', is_default: true });
  const addr4 = await Address.create({ user_id: user4.id, name: 'Phạm Thuỳ D', phone: '0945678901', province: 'TP. Hồ Chí Minh', district: 'Quận 3', ward: 'Phường Võ Thị Sáu', detail: '234 Đường Hai Bà Trưng', is_default: true });
  const addr5 = await Address.create({ user_id: user5.id, name: 'Hoàng Anh E', phone: '0956789012', province: 'TP. Hồ Chí Minh', district: 'Quận Bình Thạnh', ward: 'Phường 25', detail: '567 Đường Xô Viết Nghệ Tĩnh', is_default: true });
  console.log('Đã tạo địa chỉ');

  // ==================== CATEGORIES ====================
  const ao = await Category.create({ name: 'Áo', slug: 'ao', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop' });
  const quan = await Category.create({ name: 'Quần', slug: 'quan', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop' });
  const vay = await Category.create({ name: 'Váy', slug: 'vay', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop' });
  const phukien = await Category.create({ name: 'Phụ kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=500&fit=crop' });
  console.log('Đã tạo danh mục');

  // ==================== PRODUCTS ====================
  const productsData = [
    {
      info: { name: 'Áo thun trơn cổ tròn', slug: 'ao-thun-tron-co-tron', price: 250000, original_price: 350000, category_id: ao.id, brand: 'June', description: 'Áo thun trơn chất liệu cotton 100%, thoáng mát, phù hợp mặc hàng ngày.' },
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop'],
      colors: ['Đen', 'Trắng', 'Xám', 'Navy'],
    },
    {
      info: { name: 'Áo sơ mi trắng dài tay', slug: 'ao-so-mi-trang-dai-tay', price: 450000, original_price: 550000, category_id: ao.id, brand: 'June', description: 'Áo sơ mi trắng form regular, chất liệu vải kate mềm mịn.' },
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop'],
      colors: ['Trắng', 'Xanh nhạt', 'Hồng nhạt'],
    },
    {
      info: { name: 'Quần jean slim fit', slug: 'quan-jean-slim-fit', price: 550000, original_price: 700000, category_id: quan.id, brand: 'June', description: 'Quần jean nam form slim fit, co giãn tốt, thoải mái khi vận động.' },
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop'],
      colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
    },
    {
      info: { name: 'Quần tây công sở', slug: 'quan-tay-cong-so', price: 480000, original_price: 600000, category_id: quan.id, brand: 'June', description: 'Quần tây nam form regular, phù hợp mặc đi làm, đi sự kiện.' },
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop'],
      colors: ['Đen', 'Xám đậm', 'Be', 'Navy'],
    },
    {
      info: { name: 'Váy liền hoa nhí', slug: 'vay-lien-hoa-nhi', price: 380000, original_price: 500000, category_id: vay.id, brand: 'June', description: 'Váy liền nữ họa tiết hoa nhí, chất liệu voan nhẹ nhàng.' },
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop'],
      colors: ['Hồng', 'Xanh mint', 'Vàng nhạt'],
    },
    {
      info: { name: 'Váy midi xếp ly', slug: 'vay-midi-xep-ly', price: 420000, original_price: 520000, category_id: vay.id, brand: 'June', description: 'Váy midi xếp ly thanh lịch, phù hợp đi chơi, đi làm.' },
      images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaef?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=600&h=800&fit=crop'],
      colors: ['Đen', 'Be', 'Nâu', 'Đỏ đô'],
    },
    {
      info: { name: 'Áo polo nam classic', slug: 'ao-polo-nam-classic', price: 320000, original_price: 420000, category_id: ao.id, brand: 'June', description: 'Áo polo nam phong cách lịch sự, chất liệu cotton pha co giãn.' },
      images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=800&fit=crop'],
      colors: ['Trắng', 'Đen', 'Xanh rêu', 'Đỏ'],
    },
    {
      info: { name: 'Áo khoác bomber', slug: 'ao-khoac-bomber', price: 650000, original_price: 850000, category_id: ao.id, brand: 'June', description: 'Áo khoác bomber unisex, chất liệu dù nhẹ chống gió.' },
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1544923246-77307dd270b1?w=600&h=800&fit=crop'],
      colors: ['Đen', 'Xanh rêu', 'Be'],
    },
  ];

  const sizes = ['S', 'M', 'L', 'XL'];
  const allProducts = [];
  const allVariants = [];

  for (const p of productsData) {
    const product = await Product.create(p.info);
    allProducts.push(product);
    for (let i = 0; i < p.images.length; i++) {
      await ProductImage.create({ product_id: product.id, image_url: p.images[i], is_primary: i === 0 });
    }
    for (const size of sizes) {
      for (const color of p.colors) {
        const variant = await ProductVariant.create({ product_id: product.id, size, color, stock: Math.floor(Math.random() * 80) + 20, sku: `${product.slug}-${size}-${color}`.toUpperCase().replace(/\s/g, '-') });
        allVariants.push(variant);
      }
    }
  }
  console.log('Đã tạo sản phẩm + biến thể');

  // ==================== COUPONS ====================
  await Coupon.bulkCreate([
    { code: 'WELCOME10', discount_type: 'percent', discount_value: 10, min_order: 300000, max_discount: 100000, start_date: '2026-01-01', end_date: '2026-12-31', usage_limit: 100, used_count: 12 },
    { code: 'SALE50K', discount_type: 'fixed', discount_value: 50000, min_order: 500000, max_discount: 50000, start_date: '2026-01-01', end_date: '2026-06-30', usage_limit: 50, used_count: 8 },
    { code: 'SUMMER20', discount_type: 'percent', discount_value: 20, min_order: 400000, max_discount: 200000, start_date: '2026-05-01', end_date: '2026-08-31', usage_limit: 200, used_count: 0 },
    { code: 'FREESHIP', discount_type: 'fixed', discount_value: 30000, min_order: 0, max_discount: 30000, start_date: '2026-01-01', end_date: '2026-12-31', usage_limit: 0, used_count: 25 },
    { code: 'VIP30', discount_type: 'percent', discount_value: 30, min_order: 1000000, max_discount: 500000, start_date: '2026-03-01', end_date: '2026-03-31', usage_limit: 20, used_count: 3 },
  ]);
  console.log('Đã tạo mã giảm giá');

  // ==================== ORDERS + ORDER ITEMS + PAYMENTS ====================
  // Helper tạo order code
  const genCode = (i) => `JN${String(Date.now()).slice(-6)}${String(i).padStart(3, '0')}`;

  const ordersData = [
    // User 1 - 3 đơn hàng
    { user: user1, addr: addr1, status: 'completed', payStatus: 'paid', method: 'cod', items: [
      { productIdx: 0, variantFilter: { size: 'L', color: 'Đen' }, qty: 2 },
      { productIdx: 2, variantFilter: { size: 'M', color: 'Xanh đậm' }, qty: 1 },
    ], discount: 0, note: 'Giao giờ hành chính', daysAgo: 25, coupon: '' },
    { user: user1, addr: addr1, status: 'shipping', payStatus: 'paid', method: 'vnpay', items: [
      { productIdx: 7, variantFilter: { size: 'L', color: 'Đen' }, qty: 1 },
    ], discount: 50000, note: '', daysAgo: 3, coupon: 'SALE50K' },
    { user: user1, addr: addr1, status: 'pending', payStatus: 'pending', method: 'cod', items: [
      { productIdx: 6, variantFilter: { size: 'M', color: 'Trắng' }, qty: 1 },
      { productIdx: 1, variantFilter: { size: 'M', color: 'Trắng' }, qty: 1 },
    ], discount: 0, note: 'Gọi trước khi giao', daysAgo: 0, coupon: '' },

    // User 2 - 2 đơn hàng
    { user: user2, addr: addr2, status: 'completed', payStatus: 'paid', method: 'vnpay', items: [
      { productIdx: 4, variantFilter: { size: 'S', color: 'Hồng' }, qty: 1 },
      { productIdx: 5, variantFilter: { size: 'S', color: 'Be' }, qty: 1 },
      { productIdx: 1, variantFilter: { size: 'S', color: 'Hồng nhạt' }, qty: 1 },
    ], discount: 100000, note: '', daysAgo: 20, coupon: 'WELCOME10' },
    { user: user2, addr: addr2, status: 'confirmed', payStatus: 'pending', method: 'cod', items: [
      { productIdx: 7, variantFilter: { size: 'M', color: 'Be' }, qty: 1 },
    ], discount: 0, note: 'Giao buổi chiều', daysAgo: 2, coupon: '' },

    // User 3 - 2 đơn hàng
    { user: user3, addr: addr3, status: 'completed', payStatus: 'paid', method: 'cod', items: [
      { productIdx: 2, variantFilter: { size: 'L', color: 'Đen' }, qty: 2 },
      { productIdx: 3, variantFilter: { size: 'L', color: 'Navy' }, qty: 1 },
    ], discount: 0, note: '', daysAgo: 15, coupon: '' },
    { user: user3, addr: addr3, status: 'cancelled', payStatus: 'failed', method: 'vnpay', items: [
      { productIdx: 0, variantFilter: { size: 'XL', color: 'Navy' }, qty: 3 },
    ], discount: 0, note: 'Đổi ý không mua nữa', daysAgo: 10, coupon: '' },

    // User 4 - 2 đơn hàng
    { user: user4, addr: addr4, status: 'completed', payStatus: 'paid', method: 'cod', items: [
      { productIdx: 4, variantFilter: { size: 'M', color: 'Xanh mint' }, qty: 1 },
      { productIdx: 5, variantFilter: { size: 'M', color: 'Đỏ đô' }, qty: 1 },
    ], discount: 50000, note: '', daysAgo: 18, coupon: 'SALE50K' },
    { user: user4, addr: addr4, status: 'shipping', payStatus: 'paid', method: 'vnpay', items: [
      { productIdx: 6, variantFilter: { size: 'S', color: 'Đỏ' }, qty: 1 },
      { productIdx: 0, variantFilter: { size: 'S', color: 'Trắng' }, qty: 2 },
    ], discount: 0, note: '', daysAgo: 1, coupon: '' },

    // User 5 - 2 đơn hàng
    { user: user5, addr: addr5, status: 'completed', payStatus: 'paid', method: 'vnpay', items: [
      { productIdx: 7, variantFilter: { size: 'XL', color: 'Xanh rêu' }, qty: 1 },
      { productIdx: 3, variantFilter: { size: 'XL', color: 'Đen' }, qty: 1 },
      { productIdx: 0, variantFilter: { size: 'XL', color: 'Xám' }, qty: 1 },
    ], discount: 0, note: '', daysAgo: 12, coupon: '' },
    { user: user5, addr: addr5, status: 'pending', payStatus: 'pending', method: 'cod', items: [
      { productIdx: 1, variantFilter: { size: 'L', color: 'Xanh nhạt' }, qty: 1 },
    ], discount: 30000, note: 'Giao cuối tuần', daysAgo: 0, coupon: 'FREESHIP' },
  ];

  const createdOrders = [];
  for (let i = 0; i < ordersData.length; i++) {
    const od = ordersData[i];
    const orderItems = [];
    let subtotal = 0;

    for (const item of od.items) {
      const product = allProducts[item.productIdx];
      const variant = allVariants.find(v => v.product_id === product.id && v.size === item.variantFilter.size && v.color === item.variantFilter.color);
      const itemTotal = Number(product.price) * item.qty;
      subtotal += itemTotal;
      orderItems.push({
        variant_id: variant.id,
        product_name: product.name,
        product_image: '',
        size: item.variantFilter.size,
        color: item.variantFilter.color,
        quantity: item.qty,
        price: product.price,
      });
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal - od.discount + shippingFee;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - od.daysAgo);

    const order = await Order.create({
      user_id: od.user.id,
      order_code: genCode(i + 1),
      receiver_name: od.addr.name,
      receiver_phone: od.addr.phone,
      address: `${od.addr.detail}, ${od.addr.ward}, ${od.addr.district}, ${od.addr.province}`,
      note: od.note,
      subtotal,
      discount: od.discount,
      shipping_fee: shippingFee,
      total,
      coupon_code: od.coupon,
      payment_method: od.method,
      payment_status: od.payStatus,
      order_status: od.status,
      created_at: createdAt,
      updated_at: createdAt,
    });
    createdOrders.push(order);

    for (const oi of orderItems) {
      await OrderItem.create({ order_id: order.id, ...oi });
    }

    // Cập nhật sold_count cho sản phẩm đã hoàn thành
    if (od.status === 'completed') {
      for (const item of od.items) {
        const product = allProducts[item.productIdx];
        await product.increment('sold_count', { by: item.qty });
      }
    }

    // Tạo payment
    await Payment.create({
      order_id: order.id,
      method: od.method,
      vnpay_transaction_id: od.method === 'vnpay' && od.payStatus === 'paid' ? `VNP${Date.now()}${i}` : '',
      amount: total,
      status: od.payStatus === 'paid' ? 'paid' : od.payStatus === 'failed' ? 'failed' : 'pending',
      created_at: createdAt,
      updated_at: createdAt,
    });
  }
  console.log(`Đã tạo ${ordersData.length} đơn hàng + thanh toán`);

  // ==================== REVIEWS ====================
  const reviewsData = [
    { user: user1, productIdx: 0, rating: 5, comment: 'Chất vải rất thoáng mát, mặc rất thoải mái. Sẽ mua thêm màu khác.', orderId: createdOrders[0].id },
    { user: user1, productIdx: 2, rating: 4, comment: 'Quần đẹp, form slim fit vừa vặn. Chất jean co giãn tốt.', orderId: createdOrders[0].id },
    { user: user2, productIdx: 4, rating: 5, comment: 'Váy rất xinh, vải voan nhẹ nhàng. Mặc đi chơi rất hợp!', orderId: createdOrders[3].id },
    { user: user2, productIdx: 5, rating: 4, comment: 'Váy xếp ly đẹp, thanh lịch. Hơi dài so với mình.', orderId: createdOrders[3].id },
    { user: user2, productIdx: 1, rating: 5, comment: 'Sơ mi đẹp lắm, vải mềm mịn không nhăn. Rất ưng ý!', orderId: createdOrders[3].id },
    { user: user3, productIdx: 2, rating: 5, comment: 'Jean rất chất lượng, đường may cẩn thận. Đã mua lần 2.', orderId: createdOrders[5].id },
    { user: user3, productIdx: 3, rating: 4, comment: 'Quần tây đẹp, form chuẩn. Mặc đi làm rất lịch sự.', orderId: createdOrders[5].id },
    { user: user4, productIdx: 4, rating: 4, comment: 'Váy đẹp, giao hàng nhanh. Màu xanh mint rất dễ thương.', orderId: createdOrders[7].id },
    { user: user4, productIdx: 5, rating: 5, comment: 'Váy midi rất sang trọng, vải dày dặn. Mặc đi làm cực đẹp!', orderId: createdOrders[7].id },
    { user: user5, productIdx: 7, rating: 5, comment: 'Áo khoác bomber đẹp xuất sắc, chất dù nhẹ mà ấm. Rất đáng tiền!', orderId: createdOrders[9].id },
    { user: user5, productIdx: 3, rating: 3, comment: 'Quần tây ổn, nhưng hơi rộng ở phần eo. Nên chọn nhỏ hơn 1 size.', orderId: createdOrders[9].id },
    { user: user5, productIdx: 0, rating: 4, comment: 'Áo thun tốt, nhưng sau vài lần giặt hơi xù lông. Nhìn chung vẫn ok.', orderId: createdOrders[9].id },
    // Vài review chưa duyệt
    { user: user1, productIdx: 6, rating: 5, comment: 'Áo polo rất đẹp, chất cotton mát. Form vừa vặn!', orderId: null, approved: false },
    { user: user4, productIdx: 6, rating: 4, comment: 'Polo đẹp, màu đỏ rất nổi bật. Giao hàng hơi lâu.', orderId: null, approved: false },
  ];

  for (const r of reviewsData) {
    const product = allProducts[r.productIdx];
    await Review.create({
      user_id: r.user.id,
      product_id: product.id,
      order_id: r.orderId,
      rating: r.rating,
      comment: r.comment,
      is_approved: r.approved !== undefined ? r.approved : true,
    });
  }
  console.log('Đã tạo đánh giá');

  // ==================== WISHLISTS ====================
  await Wishlist.bulkCreate([
    { user_id: user1.id, product_id: allProducts[4].id },
    { user_id: user1.id, product_id: allProducts[7].id },
    { user_id: user2.id, product_id: allProducts[0].id },
    { user_id: user2.id, product_id: allProducts[6].id },
    { user_id: user2.id, product_id: allProducts[7].id },
    { user_id: user3.id, product_id: allProducts[1].id },
    { user_id: user4.id, product_id: allProducts[0].id },
    { user_id: user4.id, product_id: allProducts[2].id },
    { user_id: user5.id, product_id: allProducts[4].id },
    { user_id: user5.id, product_id: allProducts[5].id },
  ]);
  console.log('Đã tạo danh sách yêu thích');

  // ==================== CART ITEMS ====================
  // User 2 có vài sản phẩm trong giỏ hàng
  const cartVariant1 = allVariants.find(v => v.product_id === allProducts[0].id && v.size === 'M' && v.color === 'Trắng');
  const cartVariant2 = allVariants.find(v => v.product_id === allProducts[7].id && v.size === 'L' && v.color === 'Đen');
  const cartVariant3 = allVariants.find(v => v.product_id === allProducts[3].id && v.size === 'M' && v.color === 'Be');
  await CartItem.bulkCreate([
    { user_id: user2.id, variant_id: cartVariant1.id, quantity: 2 },
    { user_id: user2.id, variant_id: cartVariant2.id, quantity: 1 },
    { user_id: user3.id, variant_id: cartVariant3.id, quantity: 1 },
  ]);
  console.log('Đã tạo giỏ hàng');

  // ==================== BANNERS ====================
  await Banner.create({ title: 'Bộ sưu tập Hè 2026', image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=500&fit=crop', link: '/products', position: 1 });
  await Banner.create({ title: 'Giảm giá 50% toàn bộ', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=500&fit=crop', link: '/products', position: 2 });
  await Banner.create({ title: 'Xu hướng thời trang mới', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=500&fit=crop', link: '/products', position: 3 });
  await Banner.create({ title: 'Flash Sale cuối tuần', image_url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=700&h=400&fit=crop', link: '/products?sort=best_selling', position: 10 });
  await Banner.create({ title: 'Miễn phí vận chuyển đơn từ 500K', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=700&h=400&fit=crop', link: '/products', position: 11 });
  await Banner.create({ title: 'Bộ sưu tập Váy mới', image_url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=700&h=400&fit=crop', link: '/products?category=vay', position: 12 });
  console.log('Đã tạo banner');

  // ==================== POSTS ====================
  await Post.bulkCreate([
    {
      title: 'Xu hướng thời trang Hè 2026 không thể bỏ lỡ',
      slug: 'xu-huong-thoi-trang-he-2026',
      content: 'Mùa hè 2026 hứa hẹn sẽ là mùa của những bộ trang phục thoải mái, năng động. Các tông màu pastel như xanh mint, hồng nhạt, vàng nhạt tiếp tục thống trị sàn diễn thời trang. Chất liệu cotton, linen và voan mỏng được ưa chuộng vì sự thoáng mát.\n\nBên cạnh đó, phong cách minimalist với các item basic như áo thun trơn, quần jean slim fit vẫn là lựa chọn an toàn cho mọi dịp. Váy midi xếp ly và váy hoa nhí cũng là must-have cho các bạn nữ trong mùa hè này.\n\nJune Fashion mang đến cho bạn những bộ sưu tập mới nhất, cập nhật xu hướng nhanh chóng với giá cả hợp lý.',
      thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',
      is_published: true,
    },
    {
      title: 'Cách phối đồ công sở vừa đẹp vừa thoải mái',
      slug: 'cach-phoi-do-cong-so',
      content: 'Đi làm hàng ngày không có nghĩa là bạn phải hy sinh phong cách. Với một vài mẹo nhỏ, bạn có thể vừa lịch sự vừa thời trang.\n\n1. Áo sơ mi + Quần tây: Combo kinh điển nhưng không bao giờ lỗi thời. Chọn áo sơ mi màu pastel thay vì trắng đơn điệu.\n\n2. Polo + Chinos: Phong cách smart casual, phù hợp với môi trường công sở hiện đại.\n\n3. Váy midi + Blazer: Dành cho các bạn nữ muốn vừa thanh lịch vừa nữ tính.\n\nHãy ghé June Fashion để tìm cho mình những item công sở chất lượng nhất!',
      thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=400&fit=crop',
      is_published: true,
    },
    {
      title: '5 lý do bạn nên sở hữu một chiếc áo khoác bomber',
      slug: '5-ly-do-nen-so-huu-ao-khoac-bomber',
      content: 'Áo khoác bomber không chỉ là item thời trang mà còn là món đầu tư thông minh:\n\n1. Phù hợp mọi thời tiết: Chất liệu dù nhẹ, chống gió hiệu quả.\n\n2. Dễ phối đồ: Mix được với áo thun, sơ mi, hoodie.\n\n3. Unisex: Cả nam và nữ đều mặc được.\n\n4. Bền bỉ: Chất liệu dù bền, ít phai màu, dễ giặt.\n\n5. Đa năng: Mặc đi chơi, đi làm, đi du lịch đều phù hợp.\n\nÁo khoác bomber của June Fashion được thiết kế với form chuẩn, chất liệu dù cao cấp. Hãy sắm ngay một chiếc cho tủ đồ của bạn!',
      thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=400&fit=crop',
      is_published: true,
    },
    {
      title: 'Hướng dẫn chọn size quần jean phù hợp',
      slug: 'huong-dan-chon-size-quan-jean',
      content: 'Chọn đúng size quần jean là bước quan trọng để có được phong cách hoàn hảo. Dưới đây là hướng dẫn chi tiết:\n\n- Size S: Eo 68-72cm, mông 88-92cm\n- Size M: Eo 72-76cm, mông 92-96cm\n- Size L: Eo 76-80cm, mông 96-100cm\n- Size XL: Eo 80-84cm, mông 100-104cm\n\nMẹo: Nếu bạn thích form slim fit, nên chọn đúng size. Nếu thích form rộng thoải mái, chọn lên 1 size.',
      thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=400&fit=crop',
      is_published: true,
    },
    {
      title: 'Chương trình ưu đãi tháng 6 - Mừng sinh nhật June',
      slug: 'uu-dai-thang-6-sinh-nhat-june',
      content: 'Nhân dịp kỷ niệm ngày thành lập, June Fashion dành tặng hàng loạt ưu đãi hấp dẫn cho khách hàng:\n\n- Giảm 20% tất cả sản phẩm với mã SUMMER20\n- Miễn phí vận chuyển toàn quốc với mã FREESHIP\n- Tặng voucher 100K cho đơn hàng từ 500K\n\nChương trình áp dụng từ 01/06 đến 30/06/2026. Số lượng mã có hạn, nhanh tay để không bỏ lỡ!',
      thumbnail: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop',
      is_published: false,
    },
  ]);
  console.log('Đã tạo bài viết');

  // ==================== CONTACTS ====================
  await Contact.bulkCreate([
    { name: 'Nguyễn Thanh Tùng', email: 'thanhtung@gmail.com', phone: '0901111222', message: 'Cho mình hỏi sản phẩm áo khoác bomber có bảo hành không ạ? Mình muốn mua số lượng lớn cho công ty.', is_read: true },
    { name: 'Lê Thị Hương', email: 'huongle@gmail.com', phone: '0903334444', message: 'Mình muốn đổi size quần jean từ M sang L. Đơn hàng vừa nhận hôm qua. Nhờ tư vấn giúp mình quy trình đổi trả.', is_read: true },
    { name: 'Trần Đức Mạnh', email: 'ducmanh@gmail.com', phone: '0905556666', message: 'Shop có nhận hợp tác với influencer không ạ? Mình có kênh TikTok 50K followers về thời trang.', is_read: false },
    { name: 'Phạm Ngọc Ánh', email: 'ngocanh@gmail.com', phone: '0907778888', message: 'Sản phẩm váy hoa nhí size S còn hàng không ạ? Trên web hết màu hồng rồi. Bao giờ có hàng lại?', is_read: false },
    { name: 'Võ Minh Khôi', email: 'minhkhoi@gmail.com', phone: '', message: 'Mình rất thích thiết kế của June. Hy vọng shop sẽ ra thêm nhiều mẫu áo polo màu sắc đa dạng hơn nữa nhé!', is_read: false },
  ]);
  console.log('Đã tạo liên hệ');

  // ==================== NOTIFICATIONS ====================
  const notifData = [];
  // Thông báo cho các đơn hoàn thành
  for (const order of createdOrders) {
    if (order.order_status === 'completed') {
      notifData.push({ user_id: order.user_id, title: 'Đơn hàng hoàn thành', message: `Đơn hàng #${order.order_code} đã được giao thành công. Cảm ơn bạn đã mua sắm tại June!`, type: 'order', is_read: true });
    }
    if (order.order_status === 'shipping') {
      notifData.push({ user_id: order.user_id, title: 'Đơn hàng đang giao', message: `Đơn hàng #${order.order_code} đang được giao đến bạn. Vui lòng chú ý điện thoại.`, type: 'order', is_read: false });
    }
    if (order.order_status === 'confirmed') {
      notifData.push({ user_id: order.user_id, title: 'Đơn hàng đã xác nhận', message: `Đơn hàng #${order.order_code} đã được xác nhận và đang chuẩn bị hàng.`, type: 'order', is_read: false });
    }
  }
  // Thông báo khuyến mãi
  notifData.push({ user_id: user1.id, title: 'Ưu đãi đặc biệt', message: 'Nhập mã SUMMER20 để giảm 20% cho đơn hàng từ 400K. Áp dụng đến hết 31/08/2026.', type: 'promotion', is_read: false });
  notifData.push({ user_id: user2.id, title: 'Ưu đãi đặc biệt', message: 'Nhập mã SUMMER20 để giảm 20% cho đơn hàng từ 400K. Áp dụng đến hết 31/08/2026.', type: 'promotion', is_read: false });
  notifData.push({ user_id: user3.id, title: 'Chào mừng thành viên mới', message: 'Cảm ơn bạn đã đăng ký tài khoản June. Nhập mã WELCOME10 để giảm 10% đơn hàng đầu tiên!', type: 'promotion', is_read: true });
  notifData.push({ user_id: user4.id, title: 'Sản phẩm yêu thích đang giảm giá', message: 'Áo thun trơn cổ tròn bạn yêu thích đang giảm 29%. Mua ngay kẻo hết!', type: 'promotion', is_read: false });
  notifData.push({ user_id: user5.id, title: 'Đánh giá đơn hàng', message: 'Hãy đánh giá sản phẩm trong đơn hàng gần đây để nhận 50 điểm tích luỹ!', type: 'order', is_read: false });
  await Notification.bulkCreate(notifData);
  console.log('Đã tạo thông báo');

  // ==================== SETTINGS ====================
  await Setting.bulkCreate([
    { key: 'shop_name', value: 'June Fashion' },
    { key: 'shop_phone', value: '0901234567' },
    { key: 'shop_email', value: 'contact@june.vn' },
    { key: 'shop_address', value: '123 Đường ABC, Quận 1, TP.HCM' },
    { key: 'shipping_fee', value: '30000' },
    { key: 'free_shipping_min', value: '500000' },
  ]);
  console.log('Đã tạo cấu hình');

  console.log('\n========================================');
  console.log('  SEED HOÀN TẤT - DỮ LIỆU ĐẦY ĐỦ');
  console.log('========================================');
  console.log('Tài khoản:');
  console.log('  Admin: admin@june.vn / admin123');
  console.log('  User:  user@june.vn / user123');
  console.log('  User2: tranthib@gmail.com / user123');
  console.log('  User3: leminhc@gmail.com / user123');
  console.log('  User4: phamthuyd@gmail.com / user123');
  console.log('  User5: hoanganhe@gmail.com / user123');
  console.log('Mã giảm giá: WELCOME10, SALE50K, SUMMER20, FREESHIP, VIP30');
  console.log('========================================');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
