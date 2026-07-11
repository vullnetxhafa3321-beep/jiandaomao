import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue, ForumNotification } from '../types';
import { Layout, PageHeader, StatusBadge, LoginModal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { formatTimeAgo } from '../utils/helpers';

const SEEN_KEY = 'jiandaomao_comments_seen_at';

export default function MePage() {
  const { user, login, logout } = useAuth();
  const [rescues, setRescues] = useState<Rescue[]>([]);
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.myRescues().then(({ items }) => setRescues(items)).catch(() => {});
      api.forumNotifications()
        .then(({ items }) => setNotifications(items))
        .catch(() => {});
    }
  }, [user]);

  const markCommentsSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (notifications.length > 0) {
      markCommentsSeen();
    }
  }, [notifications]);

  return (
    <Layout className="pb-nav">
      <PageHeader title="个人中心" subtitle="我的救助与评论提醒" />

      <div className="px-5 space-y-4">
        {user ? (
          <div className="clay-card-white p-5 flex items-center gap-4">
            <span className="text-4xl">{user.avatar_url}</span>
            <div>
              <p className="font-black text-lg">{user.nickname}</p>
              {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
            </div>
            <button className="ml-auto text-sm text-gray-400" onClick={logout}>
              退出
            </button>
          </div>
        ) : (
          <div className="clay-card-white p-5 text-center">
            <p className="text-gray-500 mb-3">登录后发布救助动态</p>
            <button className="clay-btn-yellow px-6 py-2 rounded-full font-bold" onClick={() => setLoginOpen(true)}>
              登录 / 快速体验
            </button>
          </div>
        )}

        {user && notifications.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3 px-1">💬 与我相关的新评论</h3>
            <div className="space-y-2">
              {notifications.slice(0, 8).map((n) => (
                <Link key={n.id} to={`/forum/${n.post_id}`} className="block frog-card p-3">
                  <p className="text-xs text-[var(--frog-stone)]">{n.post_title}</p>
                  <p className="text-sm font-bold text-[var(--frog-ink)] mt-1">
                    {n.user_name}：{n.content}
                  </p>
                  <p className="text-[10px] text-[var(--frog-stone)] mt-1">{formatTimeAgo(n.created_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-bold text-lg mb-3 px-1">我的救助</h3>
          {rescues.length === 0 ? (
            <div className="clay-card-white p-8 text-center">
              <p className="text-4xl mb-2">🐾</p>
              <p className="text-gray-500">还没有记录，遇到猫别划走</p>
              <Link to="/publish" className="inline-block mt-3 clay-btn-yellow px-4 py-2 rounded-full text-sm font-bold">
                发布第一条
              </Link>
            </div>
          ) : (
            rescues.map((r) => (
              <Link key={r.id} to={`/r/${r.id}`} className="block mb-3">
                <div className="clay-card-white p-4">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1 flex-1">{r.content}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(r.created_at)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="clay-card-white p-4 space-y-2 text-sm">
          <Link to="/safety" className="block py-2 text-gray-600 font-medium">
            ⚠️ 安全须知
          </Link>
          <Link to="/" className="block py-2 text-gray-600 font-medium">
            🗺️ 救助地图
          </Link>
          <Link to="/hospitals" className="block py-2 text-gray-600 font-medium">
            🏥 附近友好医院
          </Link>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
    </Layout>
  );
}
