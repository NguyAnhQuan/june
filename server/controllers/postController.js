const slugify = require('slugify');
const { Post } = require('../models');

exports.getPublished = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { count, rows } = await Post.findAndCountAll({
      where: { is_published: true },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({ posts: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bài viết' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug, is_published: true } });
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bài viết' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['created_at', 'DESC']] });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bài viết' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, thumbnail, is_published } = req.body;
    const slug = slugify(title, { lower: true, locale: 'vi', strict: true }) + '-' + Date.now();
    const post = await Post.create({ title, slug, content, thumbnail: thumbnail || '', is_published: is_published || false });
    res.status(201).json({ message: 'Thêm bài viết thành công', post });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm bài viết' });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    const { title, content, thumbnail, is_published } = req.body;
    const slug = title ? slugify(title, { lower: true, locale: 'vi', strict: true }) + '-' + post.id : post.slug;
    await post.update({ title: title || post.title, slug, content: content !== undefined ? content : post.content, thumbnail: thumbnail !== undefined ? thumbnail : post.thumbnail, is_published: is_published !== undefined ? is_published : post.is_published });
    res.json({ message: 'Cập nhật bài viết thành công', post });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật bài viết' });
  }
};

exports.remove = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    await post.destroy();
    res.json({ message: 'Xóa bài viết thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa bài viết' });
  }
};
