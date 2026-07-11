import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue } from '../types';
import { formatDistance, formatTimeAgo } from '../utils/helpers';
import {
  Layout,
  StatusBadge,
  ActionModal,
  LoginModal,
  useToast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [tab, setTab] = useState<'nearby' | 'latest'>('latest');
  const [items, setItems] = useState<Rescue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { show, toast } = useToast();

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords({ lat: 31.2304, lng: 121.4737 })
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .feed({
        tab,
        lat: coords?.lat,
        lng: coords?.lng,
        radius: 10,
      })
      .then(({ items }) => setItems(items))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, [tab, coords]);

  const requireLogin = (action: () => void) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    action();
  };

  return (
    <Layout>
      {toast}
      <div className="pt-12 px-6 pb-4 relative">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black text-brand-dark tracking-tight title-font mb-2 relative z-10">
              捡到猫
            </h1>
            <p className="text-brand-muted font-medium text-lg tracking-wide relative z-10">
              让流浪的爪，找到停靠的岸
            </p>
          </div>
          <Link
            to="/me"
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-lg shadow z-10"
          >
            {user?.avatar_url || '👤'}
          </Link>
        </div>
        <div className="absolute top-8 right-14 flex space-x-[-10px] z-0 pointer-events-none">
          <div className="mock-3d-element transform rotate-[-10deg]">🐱</div>
          <div className="mock-3d-element transform rotate-[5deg] mt-6">🐶</div>
        </div>
      </div>

      <div className="px-5 mt-4 relative z-10">
        <div className="clay-card-blue p-5 flex flex-row items-center relative overflow-hidden">
          <div className="w-1/3 flex justify-center items-end relative h-32">
            <div className="mock-3d-element absolute bottom-0 z-10">🌱</div>
            <div className="mock-3d-element absolute bottom-0 right-[-10px] text-xl z-20">🐈</div>
          </div>
          <div className="w-2/3 pl-2 flex flex-col justify-center">
            <h2 className="text-[22px] font-black text-brand-dark mb-1">附近友好医院</h2>
            <p className="text-brand-muted text-xs mb-4 font-medium">22家上海流浪猫友好医院</p>
            <button
              className="clay-btn-yellow px-5 py-2 text-sm w-fit"
              onClick={() => navigate('/hospitals')}
            >
              查看医院 →
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8">
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-xl font-bold text-brand-dark">同城急救动态</h3>
          <span className="text-sm text-brand-muted font-medium">📍 上海市</span>
        </div>

        <div className="flex gap-2 mb-4">
          {(['nearby', 'latest'] as const).map((t) => (
            <button
              key={t}
              className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                tab === t ? 'clay-btn-yellow' : 'bg-white/60 text-gray-500'
              }`}
              onClick={() => setTab(t)}
            >
              {t === 'nearby' ? '附近' : '最新'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : items.length === 0 ? (
          <div className="clay-card-white p-8 text-center">
            <p className="text-4xl mb-2">🐱</p>
            <p className="text-gray-500 font-medium">附近还没有故事，做第一个捡到猫的人吧</p>
          </div>
        ) : (
          items.map((item) => (
            <Link key={item.id} to={`/r/${item.id}`} className="block mb-4">
              <div className="clay-card-white p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                      {item.user?.avatar_url || '👤'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.user?.nickname}</p>
                      <p className="text-xs text-gray-400">
                        {formatTimeAgo(item.created_at)}
                        {item.distance_km !== undefined && ` · 距离 ${formatDistance(item.distance_km)}`}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-gray-700 font-medium mb-3 line-clamp-2">{item.content}</p>
                <div className="flex space-x-2 flex-wrap gap-1">
                  {item.images.slice(0, 3).map((img, i) => (
                    <div
                      key={i}
                      className="h-20 w-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden text-2xl"
                    >
                      {img.startsWith('/') ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        img
                      )}
                    </div>
                  ))}
                </div>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto pb-8 pt-4 px-6 bg-gradient-to-t from-[#dcf86f] to-transparent z-40 pointer-events-none">
        <button
          onClick={() => requireLogin(() => setModalOpen(true))}
          className="pointer-events-auto fab-main w-full py-4 rounded-3xl text-xl font-black flex items-center justify-center space-x-2 active:scale-95 transition-transform"
        >
          <span className="text-2xl">🚨</span>
          <span>我捡到猫了</span>
        </button>
      </div>

      <ActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPublish={() => {
          setModalOpen(false);
          navigate('/publish');
        }}
        onHospital={() => {
          setModalOpen(false);
          navigate('/hospitals');
        }}
      />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
    </Layout>
  );
}
