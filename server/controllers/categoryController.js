const { Category } = require('../models');
const slugify = require('slugify');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [{ model: Category, as: 'children', where: { is_active: true }, required: false }],
      order: [['name', 'ASC']],
    });
    const roots = categories.filter(c => !c.parent_id);
    res.json(roots);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh mục' });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'children', required: false }],
      order: [['id', 'DESC']],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh mục' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, image, parent_id } = req.body;
    const slug = slugify(name, { lower: true, locale: 'vi', strict: true });
    const category = await Category.create({ name, slug, image: image || '', parent_id: parent_id || null });
    res.status(201).json({ message: 'Thêm danh mục thành công', category });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm danh mục' });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    const { name, image, parent_id, is_active } = req.body;
    const slug = name ? slugify(name, { lower: true, locale: 'vi', strict: true }) : category.slug;
    await category.update({ name: name || category.name, slug, image: image !== undefined ? image : category.image, parent_id: parent_id !== undefined ? parent_id : category.parent_id, is_active: is_active !== undefined ? is_active : category.is_active });
    res.json({ message: 'Cập nhật danh mục thành công', category });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục' });
  }
};

exports.remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    await category.destroy();
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa danh mục' });
  }
};
