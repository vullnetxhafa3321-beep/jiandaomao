import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { ForumPost } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { formatTimeAgo } from '../utils/helpers';
import { FORUM_STATUS } from '../utils/community';

export default function ForumPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    api
      .forumPosts()
      .then(({ items }) => setPosts(items))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout className="pb-24">
      {toast}
      <BackHeader title="📸 流浪发现" onBack={() => navigate('/')} />

      <div className="px-5 space-y-3">
        <p className="text-sm text-brand-muted font-medium px-1">
          附近的流浪动物发现记录 · {posts.length} 条
        </p>

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          posts.map((post) => {
            const st = FORUM_STATUS[post.status];
            return (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block clay-card-white p-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-sm flex-1 mr-2">{post.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{post.content}</p>
                <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
                  <span>📍 {post.address}</span>
                  <span>🕐 {formatTimeAgo(post.created_at)}</span>
                  <span>👤 {post.user_name}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/forum/post')}
        className="fixed bottom-8 right-6 max-w-[480px] mr-[calc(50vw-240px)] w-14 h-14 clay-btn-yellow rounded-full shadow-lg text-2xl font-black z-40"
      >
        ＋
      </button>
    </Layout>
  );
}
