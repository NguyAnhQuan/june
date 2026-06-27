import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatDate } from '../utils/format';
import Loading from '../components/common/Loading';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${slug}`).then(res => setPost(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loading />;
  if (!post) return <div className="text-center py-20 text-gray-500">Không tìm thấy bài viết</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/posts" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">Quay lại tin tức</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
      <p className="text-sm text-gray-400 mb-8">{formatDate(post.createdAt)}</p>
      {post.thumbnail && <img src={post.thumbnail} alt={post.title} className="w-full rounded-lg mb-8" />}
      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}