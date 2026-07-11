import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { ForumPost } from '../types';
import { Layout, PageHeader, useToast } from '../components/UI';
import { formatTimeAgo } from '../utils/helpers';
import { FORUM_STATUS } from '../utils/community';
import { forumCoverImage, shareForumPost } from '../utils/shareCard';

export default function ForumPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { show, toast } = useToast();

  useEffect(() => {
    api
      .forumPosts()
      .then(({ items }) => setPosts(items))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async (e: React.MouseEvent, post: ForumPost) => {
    e.preventDefault();
    e.stopPropagation();
    setSharingId(post.id);
    try {
      await shareForumPost(post, show);
    } finally {
      setSharingId(null);
    }
  };

  return (
    <Layout className="pb-nav">
      {toast}
      <PageHeader title="📸 流浪发现" subtitle="大兴区西红门 · 北大猫协档案参考" />

      <div className="px-5 space-y-3">
        <p className="text-xs text-gray-500 px-1">{posts.length} 条发现记录</p>

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          posts.map((post) => {
            const st = FORUM_STATUS[post.status];
            const cover = forumCoverImage(post);
            return (
              <div key={post.id} className="clay-card-white overflow-hidden">
                <Link to={`/forum/${post.id}`} className="block active:scale-[0.99] transition-transform">
                  {cover && (
                    <img
                      src={cover}
                      alt=""
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-sm flex-1 mr-2">{post.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    {(post.breed || post.age) && (
                      <p className="text-xs text-orange-700 font-bold mb-2">
                        {post.breed} · {post.age}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-400">
                      <span>📍 {post.address}</span>
                      <span>🕐 {formatTimeAgo(post.created_at)}</span>
                      <span>👤 {post.user_name}</span>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    disabled={sharingId === post.id}
                    onClick={(e) => handleShare(e, post)}
                    className="w-full py-2.5 clay-btn-yellow rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {sharingId === post.id ? '生成中...' : '📤 一键分享'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/forum/post')}
        className="fixed bottom-[5.5rem] right-5 w-12 h-12 frog-btn rounded-full text-xl font-black z-30 flex items-center justify-center"
      >
        ＋
      </button>
    </Layout>
  );
}
