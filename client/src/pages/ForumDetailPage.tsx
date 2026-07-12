import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { ForumPost, ForumComment } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { HospitalAddressLink } from '../components/HospitalAddressLink';
import { FORUM_STATUS, amapNavUrl } from '../utils/community';
import { forumCoverImage, shareForumPost } from '../utils/shareCard';
import { formatTimeLabel } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { ZoomableImage } from '../components/ZoomableImage';
import { compressImageFiles } from '../utils/compressImage';
import { BreedGuess } from '../components/BreedGuess';

export default function ForumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [commentPreviews, setCommentPreviews] = useState<string[]>([]);
  const [guestName, setGuestName] = useState('');
  const [rescuerName, setRescuerName] = useState('');
  const [marking, setMarking] = useState(false);
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

  const handleCommentImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setCommentImages(files);
    const urls: string[] = [];
    let done = 0;
    if (files.length === 0) {
      setCommentPreviews([]);
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result as string);
        done += 1;
        if (done === files.length) setCommentPreviews([...urls]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleComment = async () => {
    if (!id) return;
    if (!commentText.trim() && commentImages.length === 0) return show('请填写文字或上传图片');
    if (!user && !guestName.trim()) return show('游客请填写昵称');
    setSubmitting(true);
    try {
      const files = await compressImageFiles(commentImages);
      const fd = new FormData();
      fd.append('content', commentText.trim());
      if (!user) fd.append('user_name', guestName.trim());
      files.forEach((img) => fd.append('images', img));
      await api.createForumComment(id, fd);
      setCommentText('');
      setCommentImages([]);
      setCommentPreviews([]);
      loadComments();
      show('评论成功');
    } catch (e) {
      show(e instanceof Error ? e.message : '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkRescued = async () => {
    if (!id || !post) return;
    const name = (user?.nickname || rescuerName).trim();
    if (!name) return show('请留下你的网名');
    setMarking(true);
    try {
      const { post: updated } = await api.updateForumStatus(id, {
        status: 'rescued',
        rescuer_name: name,
      });
      setPost(updated);
      show(`已标记救助成功 · 感谢 ${name}`);
    } catch (e) {
      show(e instanceof Error ? e.message : '操作失败');
    } finally {
      setMarking(false);
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
  const canSubmit = Boolean(commentText.trim() || commentImages.length > 0);

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="帖子详情" onBack={() => navigate('/forum')} />

      <div className="px-5 space-y-4">
        <div className="clay-card-white overflow-hidden">
          {cover && (
            <>
              <ZoomableImage
                src={cover}
                alt={post.title}
                images={post.images}
                className="w-full"
                loading="eager"
              />
              <div className="px-3 py-2 bg-[#fff8e8]">
                <BreedGuess
                  breed={post.breed}
                  scores={post.breed_scores}
                  imageUrl={cover}
                  mode="detail"
                />
              </div>
            </>
          )}
          {(post.images?.length ?? 0) > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-[#fff8e8]/border-b border-orange-50">
              {post.images!.map((src, i) => (
                <ZoomableImage
                  key={`${src}-${i}`}
                  src={src}
                  alt={`${post.title} ${i + 1}`}
                  images={post.images}
                  index={i}
                  className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                />
              ))}
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.color}`}>{st.label}</span>
              <span className="text-xs text-gray-500 font-medium">
                发布时间 {formatTimeLabel(post.created_at)}
              </span>
            </div>

            <h2 className="text-lg font-black text-brand-dark mb-2">{post.title}</h2>
            {post.age && (
              <p className="text-sm text-orange-700 font-bold mb-2">{post.age}</p>
            )}
            <p className="text-sm text-gray-500 mb-1">📍 发现：{post.address?.replace(/（1km内模糊定位）|（模糊定位）/g, '')}</p>
            <p className="text-[11px] text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-2 leading-relaxed">
              为救助安全，地图位置已做模糊处理。请通过联系方式询问具体地址后再出发。
            </p>
            {post.contact && (
              <p className="text-sm font-bold text-[var(--ink-900)] mb-3">
                联系人：<span className="text-[var(--sky-deep)] select-all">{post.contact}</span>
                <span className="text-[11px] font-normal text-gray-400 ml-2">（长按复制，询问精确位置）</span>
              </p>
            )}
            {post.rescuer_name && post.status !== 'found' && (
              <p className="text-sm text-green-700 font-bold mb-3">
                ✅ 已由网友「{post.rescuer_name}」标记{post.status === 'adopted' ? '领养' : '救助'}
              </p>
            )}
            <div className="mb-4">
              <HospitalAddressLink showNav />
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>

            <div className="text-xs text-gray-500">
              👤 {post.user_name}
              <span className="mx-1">·</span>
              <time dateTime={post.created_at}>发布时间 {formatTimeLabel(post.created_at)}</time>
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
            🧭 导航到附近位置
          </a>
        )}

        {post.status === 'found' && (
          <section className="frog-card p-4">
            <h3 className="font-bold text-sm mb-2">🙋 我已救助这只猫</h3>
            <p className="text-[11px] text-[var(--ink-muted)] mb-3">
              标记后首页喜报会播报，并留下你的网名。请确认猫已安全控制或送医。
            </p>
            {!user && (
              <input
                className="w-full border-2 border-gray-100 rounded-xl p-2 text-sm mb-2"
                placeholder="你的网名"
                value={rescuerName}
                onChange={(e) => setRescuerName(e.target.value)}
              />
            )}
            {user && (
              <p className="text-xs text-gray-500 mb-2">将使用昵称：{user.nickname}</p>
            )}
            <button
              type="button"
              disabled={marking}
              onClick={handleMarkRescued}
              className="w-full py-3 frog-wood-sign text-sm font-black disabled:opacity-50"
            >
              {marking ? '提交中...' : '✅ 标记为已救助'}
            </button>
          </section>
        )}

        <section className="clay-card-white p-4">
          <h3 className="font-bold text-sm mb-3">💬 评论 ({comments.length})</h3>
          <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">还没有评论，可留言或上传新照片</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between gap-2 text-[10px] text-gray-500 mb-1">
                    <span className="font-bold text-gray-600">{c.user_name}</span>
                    <time dateTime={c.created_at} className="text-right flex-shrink-0">
                      评论于 {formatTimeLabel(c.created_at)}
                    </time>
                  </div>
                  {c.content ? <p className="text-sm text-gray-700 mb-2">{c.content}</p> : null}
                  {c.images && c.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {c.images.map((src, i) => (
                        <ZoomableImage
                          key={`${c.id}-${src}-${i}`}
                          src={src}
                          alt="评论图片"
                          images={c.images}
                          index={i}
                          className="w-20 h-20 rounded-lg overflow-hidden"
                        />
                      ))}
                    </div>
                  )}
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
            placeholder="写下你的留言，或上传现场新照片…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap mb-2">
            {commentPreviews.map((p, i) => (
              <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ))}
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-lg cursor-pointer">
              📷
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleCommentImages} />
            </label>
          </div>
          <button
            type="button"
            disabled={submitting || !canSubmit}
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
