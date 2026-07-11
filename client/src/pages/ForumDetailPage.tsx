import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { ForumPost, ForumComment } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { FORUM_STATUS, amapNavUrl } from '../utils/community';
import { forumCoverImage, shareForumPost } from '../utils/shareCard';
import { formatTimeAgo } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function ForumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show, toast } = useToast();

  const loadComments = () => {
    if (!id) return;
    api.forumComments(id).then(({ items }) => setComments(items)).catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([api.forumPost(id), api.forumComments(id)])
      .then(([p, c]) => {
        setPost(p.post);
        setComments(c.items);
      })
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

  const handleComment = async () => {
    if (!id || !commentText.trim()) return;
    if (!user && !guestName.trim()) return show('游客请填写昵称');
    setSubmitting(true);
    try {
      await api.createForumComment(id, {
        content: commentText.trim(),
        user_name: user ? undefined : guestName.trim(),
      });
      setCommentText('');
      loadComments();
      show('评论成功');
    } catch (e) {
      show(e instanceof Error ? e.message : '评论失败');
    } finally {
      setSubmitting(false);
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
          {cover && <img src={cover} alt="" className="w-full h-48 object-cover" />}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.color}`}>{st.label}</span>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>

            <h2 className="text-lg font-black text-brand-dark mb-2">{post.title}</h2>
            {(post.breed || post.age) && (
              <p className="text-sm text-orange-700 font-bold mb-2">
                {post.breed} · {post.age}
              </p>
            )}
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

        <section className="clay-card-white p-4">
          <h3 className="font-bold text-sm mb-3">💬 评论 ({comments.length})</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">还没有评论，来说两句吧</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span className="font-bold text-gray-600">{c.user_name}</span>
                    <span>{formatTimeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              ))
            )}
          </div>
          {!user && (
            <input
              className="w-full border-2 border-gray-100 rounded-xl p-2 text-sm mb-2"
              placeholder="你的昵称（游客必填）"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          )}
          <textarea
            className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm min-h-[72px] mb-2"
            placeholder="写下你的留言..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="button"
            disabled={submitting || !commentText.trim()}
            onClick={handleComment}
            className="w-full py-2.5 clay-btn-yellow rounded-xl text-sm font-bold disabled:opacity-40"
          >
            {submitting ? '发送中...' : '发表评论'}
          </button>
        </section>
      </div>
    </Layout>
  );
}
