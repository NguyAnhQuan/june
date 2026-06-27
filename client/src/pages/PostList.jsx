import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/format';
import Loading from '../components/common/Loading';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts').then(res => setPosts(res.data.posts)).catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gray-900 text-white py-14 px-4 mb-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Tin tức & Xu hướng</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Thời trang & Phong cách</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Cập nhật xu hướng thời trang mới nhất, tips phối đồ và câu chuyện thương hiệu.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">Chưa có bài viết nào</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featured && (
              <Link to={`/post/${featured.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 mb-10 hover:border-gray-200 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-[16/10] lg:aspect-auto overflow-hidden bg-gray-100">
                    {featured.thumbnail ? (
                      <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
                        <BookOpen size={48} className="text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Bài nổi bật</span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-brand-600 transition-colors line-clamp-3">
                      {featured.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                      <Calendar size={13} />
                      <span>{formatDate(featured.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-600 text-sm font-medium">
                      Đọc tiếp <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Other Posts */}
            {rest.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Bài viết gần đây</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map(post => (
                    <Link key={post.id} to={`/post/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors flex flex-col">
                      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                        {post.thumbnail ? (
                          <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <BookOpen size={32} className="text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 flex-1 mb-3">
                          {post.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar size={11} />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <ArrowRight size={13} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}