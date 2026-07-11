import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { ForumPost } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { FORUM_STATUS, amapNavUrl } from '../utils/community';
import { forumCoverImage, shareForumPost } from '../utils/shareCard';

export default function ForumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const { show, toast } = useToast();

  useEffect(() => {
    if (!id) return;
    api
      .forumPost(id)
      .then(({ post: p }) => setPost(p))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!post) return;
    setSharing(true);
    try {
      await shareForumPost(post, show);
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <BackHeader title="帖子详情" onBack={() => navigate('/forum')} />
        <p className="text-center text-gray-400 py-8">加载中...</p>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <BackHeader title="帖子详情" onBack={() => navigate('/forum')} />
        <div className="text-center py-16 px-5">
          <div className="text-4xl mb-4">😿</div>
          <p className="text-gray-500 mb-4">帖子不存在或已删除</p>
          <button type="button" onClick={() => navigate('/forum')} className="text-orange-600 font-bold">
            ← 返回列表
          </button>
        </div>
      </Layout>
    );
  }

  const st = FORUM_STATUS[post.status];
  const cover = forumCoverImage(post);

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="帖子详情" onBack={() => navigate('/forum')} />

      <div className="px-5 space-y-4">
        <div className="clay-card-white overflow-hidden">
          {cover && (
            <img src={cover} alt="" className="w-full h-48 object-cover" />
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.color}`}>{st.label}</span>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>

            <h2 className="text-lg font-black text-brand-dark mb-2">{post.title}</h2>
            <p className="text-sm text-gray-500 mb-4">📍 {post.address}</p>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>

            <div className="text-xs text-gray-400">
              👤 {post.user_name} · 发布于 {new Date(post.created_at).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={sharing}
          onClick={handleShare}
          className="w-full py-3.5 clay-btn-yellow rounded-2xl font-black text-base disabled:opacity-50"
        >
          {sharing ? '生成分享图中...' : '📤 一键分享'}
        </button>

        {post.lat && post.lng && (
          <a
            href={amapNavUrl(post.lng, post.lat)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-3 bg-white/80 rounded-2xl font-bold text-gray-700"
          >
            🧭 导航到发现位置
          </a>
        )}
      </div>
    </Layout>
  );
}
