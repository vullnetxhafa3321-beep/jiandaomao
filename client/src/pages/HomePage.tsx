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
              <span className="cute-handwrite">捡到猫了</span>
            </div>
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
        <div className="cute-section-label mb-2">
          <span>🗺️</span>
          <span>救助工具箱</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📍', title: '附近救助站', desc: '找到最近的救助机构', path: '/shelters', cls: 'cute-feature-orange' },
            { icon: '🏥', title: '附近医院', desc: '上海22家+北京合作医院', path: '/hospitals', cls: 'cute-feature-green', badge: '关键' },
            { icon: '📋', title: '全流程指南', desc: '从捡到到收养', path: '/guide', cls: 'cute-feature-blue' },
            { icon: '📸', title: '流浪发现', desc: '发现身边的它们', path: '/forum', cls: 'cute-feature-amber' },
            { icon: '🏠', title: '待领养', desc: '给它们找个家', path: '/adoption', cls: 'cute-feature-rose' },
          ].map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`cute-feature-card text-left ${item.cls} ${item.path === '/guide' ? 'col-span-2' : ''}`}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="flex items-center gap-1">
                <span className="cute-feature-title text-sm">{item.title}</span>
                {item.badge && (
                  <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="cute-feature-desc text-[10px]">{item.desc}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="w-full cute-feature-card cute-feature-white text-left"
          onClick={() => navigate('/safety')}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="cute-feature-title text-base">安全须知</h3>
              <p className="cute-feature-desc text-xs">救助前先看这个</p>
            </div>
            <span className="text-3xl">⚠️</span>
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
