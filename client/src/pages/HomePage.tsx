import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue } from '../types';
import { Layout, useToast } from '../components/UI';
import { CatCarousel, type CatProfile } from '../components/CatCarousel';
import { CelebrationTicker } from '../components/CelebrationTicker';
import { RescueMap } from '../components/RescueMap';
import { HandDrawnCat } from '../components/HandDrawnCat';
import { catalogToCatProfile } from '../utils/catCatalog';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [items, setItems] = useState<Rescue[]>([]);
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [celebrations, setCelebrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLevel, setMapLevel] = useState(0);
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
    <Layout className="frog-home pb-nav">
      {toast}

      <header className="frog-header">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <HandDrawnCat size={44} />
              <h1 className="frog-title">捡到猫了</h1>
            </div>
            <p className="frog-subtitle">大兴区西红门 · 救助闯关地图</p>
          </div>
          <Link to="/me" className="frog-avatar-btn" aria-label="我的">
            {user?.avatar_url || '🐾'}
          </Link>
        </div>
      </header>

      <CelebrationTicker
        rescues={items}
        catalogCelebrations={celebrations}
        pauseMs={4000}
      />

      <div className="cute-section-label">
        <span>🗺️</span>
        <span>救助闯关</span>
        <span className="cute-paw-badge">5 关</span>
      </div>

      <RescueMap activeIndex={mapLevel} onLevelClick={setMapLevel} />

      <div className="rescue-map-tools">
        <button type="button" className="rescue-tool-btn" onClick={() => navigate('/shelters')}>
          <span>📍</span>
          <span className="text-xs font-bold text-[var(--frog-ink)]">附近救助站</span>
        </button>
        <button type="button" className="rescue-tool-btn" onClick={() => navigate('/hospitals')}>
          <span>🏥</span>
          <span className="text-xs font-bold text-[var(--frog-ink)]">医院地图</span>
        </button>
        <button type="button" className="rescue-tool-btn" onClick={() => navigate('/guide')}>
          <span>📋</span>
          <span className="text-xs font-bold text-[var(--frog-ink)]">全流程指南</span>
        </button>
        <button type="button" className="rescue-tool-btn" onClick={() => navigate('/safety')}>
          <span>⚠️</span>
          <span className="text-xs font-bold text-[var(--frog-ink)]">安全须知</span>
        </button>
      </div>

      <section className="cute-carousel-section mt-2">
        <div className="cute-section-label">
          <span>🐾</span>
          <span>燕园猫档案</span>
          <span className="cute-paw-badge">{cats.length || 0}</span>
        </div>
        <p className="text-[10px] text-[var(--frog-stone)] px-5 -mt-2 mb-2">
          名字与品种参考北大猫协 · 左右滑动查看
        </p>

        {loading ? (
          <div className="cat-carousel-empty flex flex-col items-center py-12">
            <HandDrawnCat size={64} />
            <p className="mt-3 text-[var(--frog-stone)] text-sm">小猫们正在赶来...</p>
          </div>
        ) : (
          <CatCarousel cats={cats} onLike={(cat) => show(`已收藏 ${cat.name} ♡`)} />
        )}
      </section>

      {items.length > 0 && (
        <section className="px-5 mt-4 pb-4">
          <p className="text-sm font-bold text-[var(--frog-ink)] mb-2">最新动态</p>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/r/${item.id}`}
                className="snap-start flex-shrink-0 w-36 cute-mini-card"
              >
                <div className="text-2xl mb-1">
                  {item.cover_url?.startsWith('/') ? (
                    <img src={item.cover_url} alt="" className="w-12 h-12 object-cover frog-radius-sm" />
                  ) : (
                    item.cover_url || '🐱'
                  )}
                </div>
                <p className="text-xs font-medium text-[var(--frog-ink)] line-clamp-2">{item.content}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
