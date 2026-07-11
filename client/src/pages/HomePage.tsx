import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue } from '../types';
import {
  Layout,
  ActionModal,
  LoginModal,
  useToast,
} from '../components/UI';
import { CatCarousel, type CatProfile } from '../components/CatCarousel';
import { CelebrationTicker } from '../components/CelebrationTicker';
import { catalogToCatProfile } from '../utils/catCatalog';
import { useAuth } from '../context/AuthContext';

const CAT_FACES = ['🐱', '🐈', '😺', '😸', '🐈‍⬛', '😻'];

export default function HomePage() {
  const [items, setItems] = useState<Rescue[]>([]);
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [celebrations, setCelebrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeFace, setActiveFace] = useState(0);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { show, toast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([api.feed({ tab: 'latest' }), api.catCatalog()])
      .then(([feed, catalog]) => {
        setItems(feed.items);
        setCats(
          catalog.items.map((entry, i) =>
            catalogToCatProfile(entry, i, entry.rescue_id || undefined)
          )
        );
        setCelebrations(catalog.items.map((c) => c.celebration));
      })
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const requireLogin = (action: () => void) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    action();
  };

  return (
    <Layout className="cute-home">
      {toast}

      <header className="cute-header">
        <div className="flex justify-between items-start">
          <div className="cute-title-block">
            <div className="flex items-end gap-1 flex-wrap">
              <span className="cute-bubble">喵</span>
              <span className="cute-handwrite">妙啊～</span>
            </div>
            <p className="cute-subtitle">让流浪的爪，找到停靠的岸</p>
          </div>
          <Link to="/me" className="cute-avatar-btn">
            {user?.avatar_url || '🐾'}
          </Link>
        </div>

        <div className="cute-cat-faces">
          {CAT_FACES.map((face, i) => (
            <button
              key={i}
              type="button"
              className={`cute-cat-face ${activeFace === i ? 'cute-cat-face-active' : ''}`}
              onClick={() => setActiveFace(i)}
            >
              {face}
            </button>
          ))}
        </div>
      </header>

      <CelebrationTicker
        rescues={items}
        catalogCelebrations={celebrations}
        pauseMs={4000}
      />

      <section className="cute-carousel-section">
        <div className="cute-section-label">
          <span>🐾</span>
          <span>同城小猫档案</span>
          <span className="cute-paw-badge">{cats.length || 0}</span>
        </div>
        <p className="text-[10px] text-gray-500 px-5 -mt-2 mb-2">
          档案名参考北大猫协公开报道 · 照片为真实流浪猫示意（Unsplash）
        </p>

        {loading ? (
          <div className="cat-carousel-empty">
            <span className="text-4xl animate-bounce">🐱</span>
            <p className="mt-3 text-gray-500">小猫们正在赶来...</p>
          </div>
        ) : (
          <CatCarousel
            cats={cats}
            onLike={(cat) => show(`已收藏 ${cat.name} ♡`)}
          />
        )}

        <p className="text-center text-xs text-gray-500 mt-2 px-6">
          左右滑动查看不同小猫 · 点击卡片查看救助详情
        </p>
      </section>

      <section className="px-5 mt-6 space-y-4">
        <div className="cute-feature-card cute-feature-green">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="cute-feature-title">小流浪驿站</h3>
              <p className="cute-feature-desc">发布求助 · 接力救助</p>
            </div>
            <span className="text-5xl">🧺</span>
          </div>
        </div>

        <div className="cute-feature-card cute-feature-blue">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌱</span>
            <div className="flex-1">
              <h3 className="cute-feature-title text-base">AI领养缘分匹配师</h3>
              <p className="cute-feature-desc text-xs">寻找与你最有缘的小流浪</p>
            </div>
            <button
              type="button"
              className="clay-btn-yellow px-4 py-2 text-xs"
              onClick={() => show('AI 匹配即将上线～')}
            >
              测一测 &gt;
            </button>
          </div>
        </div>

        <button
          type="button"
          className="w-full cute-feature-card cute-feature-white text-left"
          onClick={() => navigate('/hospitals')}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="cute-feature-title text-base">附近友好医院</h3>
              <p className="cute-feature-desc text-xs">22家上海流浪猫友好医院</p>
            </div>
            <span className="text-3xl">🏥</span>
          </div>
        </button>

        {items.length > 0 && (
          <div className="cute-feed-preview">
            <p className="text-sm font-bold text-brand-dark mb-2 px-1">最新动态</p>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/r/${item.id}`}
                  className="snap-start flex-shrink-0 w-36 cute-mini-card"
                >
                  <div className="text-2xl mb-1">
                    {item.cover_url?.startsWith('/') ? (
                      <img src={item.cover_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      item.cover_url || '🐱'
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.content}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto pb-8 pt-4 px-6 bg-gradient-to-t from-[#b2e8e0] via-[#b2e8e0]/90 to-transparent z-40 pointer-events-none">
        <button
          type="button"
          onClick={() => requireLogin(() => setModalOpen(true))}
          className="pointer-events-auto fab-main w-full py-4 rounded-3xl text-xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
