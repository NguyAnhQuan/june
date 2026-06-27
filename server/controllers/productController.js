const { Op } = require('sequelize');
const slugify = require('slugify');
const { Product, ProductImage, ProductVariant, Category, Review, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, min_price, max_price, sort, brand } = req.query;
    const offset = (page - 1) * limit;
    const where = { is_active: true };

    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
    }
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (min_price) where.price = { ...where.price, [Op.gte]: min_price };
    if (max_price) where.price = { ...where.price, [Op.lte]: max_price };
    if (brand) where.brand = brand;

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'newest') order = [['created_at', 'DESC']];
    else if (sort === 'best_selling') order = [['sold_count', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary'] },
        { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'stock'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    res.json({
      products: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm' });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Review, as: 'reviews', where: { is_approved: true }, required: false, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }], order: [['created_at', 'DESC']] },
      ],
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết sản phẩm' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, is_active: true },
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Review, as: 'reviews', where: { is_approved: true }, required: false, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }] },
      ],
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết sản phẩm' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, original_price, category_id, brand, images, variants } = req.body;
    const slug = slugify(name, { lower: true, locale: 'vi', strict: true }) + '-' + Date.now();
    const product = await Product.create({ name, slug, description, price, original_price: original_price || 0, category_id, brand: brand || '' });

    if (images && images.length > 0) {
      const imageRecords = images.map((img, i) => ({ product_id: product.id, image_url: img, is_primary: i === 0 }));
      await ProductImage.bulkCreate(imageRecords);
    }
    if (variants && variants.length > 0) {
      const variantRecords = variants.map(v => ({ product_id: product.id, size: v.size, color: v.color, stock: v.stock || 0, sku: v.sku || '' }));
      await ProductVariant.bulkCreate(variantRecords);
    }

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'images' }, { model: ProductVariant, as: 'variants' }],
    });
    res.status(201).json({ message: 'Thêm sản phẩm thành công', product: fullProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi thêm sản phẩm' });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const { name, description, price, original_price, category_id, brand, is_active, images, variants } = req.body;
    const slug = name ? slugify(name, { lower: true, locale: 'vi', strict: true }) + '-' + product.id : product.slug;
    await product.update({ name: name || product.name, slug, description: description !== undefined ? description : product.description, price: price || product.price, original_price: original_price !== undefined ? original_price : product.original_price, category_id: category_id || product.category_id, brand: brand !== undefined ? brand : product.brand, is_active: is_active !== undefined ? is_active : product.is_active });

    if (images) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      if (images.length > 0) {
        const imageRecords = images.map((img, i) => ({ product_id: product.id, image_url: img, is_primary: i === 0 }));
        await ProductImage.bulkCreate(imageRecords);
      }
    }
    if (variants) {
      await ProductVariant.destroy({ where: { product_id: product.id } });
      if (variants.length > 0) {
        const variantRecords = variants.map(v => ({ product_id: product.id, size: v.size, color: v.color, stock: v.stock || 0, sku: v.sku || '' }));
        await ProductVariant.bulkCreate(variantRecords);
      }
    }

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'images' }, { model: ProductVariant, as: 'variants' }, { model: Category, as: 'category' }],
    });
    res.json({ message: 'Cập nhật sản phẩm thành công', product: fullProduct });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật sản phẩm' });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    await ProductImage.destroy({ where: { product_id: product.id } });
    await ProductVariant.destroy({ where: { product_id: product.id } });
    await product.destroy();
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sản phẩm' });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    res.json({ products: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm' });
  }
};
