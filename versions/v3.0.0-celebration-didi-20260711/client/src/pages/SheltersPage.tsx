import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Shelter } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { formatDistance } from '../utils/helpers';
import { useLocation } from '../hooks/useLocation';
import { amapNavUrl } from '../utils/community';

export default function SheltersPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedTag, setSelectedTag] = useState('全部');
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    api
      .shelters(location?.lat, location?.lng)
      .then(({ items }) => setShelters(items))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, [location?.lat, location?.lng]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    shelters.forEach((s) => s.tags.forEach((t) => tags.add(t)));
    return ['全部', ...Array.from(tags)];
  }, [shelters]);

  const filtered =
    selectedTag === '全部' ? shelters : shelters.filter((s) => s.tags.includes(selectedTag));

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="📍 附近救助站" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <p className="text-sm text-brand-muted font-medium px-1">
          北京地区救助机构 · {location ? '已按距离排序' : '开启定位可排序'}
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                selectedTag === tag
                  ? 'bg-brand-dark text-white'
                  : 'bg-white/80 text-gray-600 shadow-sm'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 px-1">共 {filtered.length} 个救助站</p>

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="clay-card-white p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{s.name}</h3>
                {s.distance_km !== undefined && (
                  <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                    {formatDistance(s.distance_km)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">📍 {s.address}</p>
              <p className="text-xs text-gray-500 mb-2">🕐 {s.hours}</p>
              <p className="text-sm text-gray-600 mb-3">{s.description}</p>
              <div className="flex gap-1 flex-wrap mb-3">
                {s.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-mint-50 text-teal-700 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <a
                  href={amapNavUrl(s.lng, s.lat, s.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 clay-btn-yellow text-xs font-bold rounded-xl"
                >
                  🧭 导航
                </a>
                <a
                  href={`tel:${s.phone}`}
                  className="flex-1 text-center py-2.5 bg-green-100 text-green-700 text-xs font-bold rounded-xl"
                >
                  📞 电话
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
