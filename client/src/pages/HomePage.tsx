import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue } from '../types';
import { Layout, useToast } from '../components/UI';
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
  const [activeFace, setActiveFace] = useState(0);
  const { user } = useAuth();
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

  return (
    <Layout className="cute-home pb-nav">
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
          <span>燕园猫档案</span>
          <span className="cute-paw-badge">{cats.length || 0}</span>
        </div>
        <p className="text-[10px] text-gray-500 px-5 -mt-2 mb-2">
          名字与品种参考北大猫协公众号 · 本地真实猫咪示意照片
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
          左右滑动查看 · 卡片含品种与年龄
        </p>
      </section>

      <section className="px-5 mt-6 space-y-4 pb-4">
        <div className="cute-section-label mb-2">
          <span>🗺️</span>
          <span>救助工具箱</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📍', title: '附近救助站', desc: '找到最近的救助机构', path: '/shelters', cls: 'cute-feature-orange' },
            { icon: '🏥', title: '附近医院', desc: '上海+北京友好医院', path: '/hospitals', cls: 'cute-feature-green', badge: '关键' },
            { icon: '📋', title: '全流程指南', desc: '从捡到到收养', path: '/guide', cls: 'cute-feature-blue' },
            { icon: '⚠️', title: '安全须知', desc: '救助前先看这个', path: '/safety', cls: 'cute-feature-white' },
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
    </Layout>
  );
}
