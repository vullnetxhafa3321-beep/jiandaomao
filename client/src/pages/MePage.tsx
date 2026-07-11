import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue } from '../types';
import { Layout, PageHeader, StatusBadge, LoginModal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { formatTimeAgo } from '../utils/helpers';

export default function MePage() {
  const { user, login, logout } = useAuth();
  const [rescues, setRescues] = useState<Rescue[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.myRescues().then(({ items }) => setRescues(items)).catch(() => {});
    }
  }, [user]);

  return (
    <Layout className="pb-nav">
      <PageHeader title="个人中心" subtitle="我的救助与设置" />

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
          <Link to="/hospitals" className="block py-2 text-gray-600 font-medium">
            🏥 附近友好医院
          </Link>
          <p className="py-2 text-gray-400 text-xs">
            本平台为民间互助信息工具，不提供医疗诊断。跳转滴滴后适用滴滴用户协议。
          </p>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
    </Layout>
  );
}
