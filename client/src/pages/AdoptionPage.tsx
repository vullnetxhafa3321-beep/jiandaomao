import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AdoptionListing } from '../types';
import { Layout, PageHeader, useToast } from '../components/UI';
import { LocationRegionBadge, HospitalAddressLink } from '../components/HospitalAddressLink';
import { ADOPTION_STATUS, GENDER_LABELS } from '../utils/community';

const TABS: { key: string; label: string }[] = [
  { key: 'cat', label: '🐱 猫咪' },
  { key: 'other', label: '🐰 其他' },
];

export default function AdoptionPage() {
  const navigate = useNavigate();
  const [petType, setPetType] = useState('cat');
  const [items, setItems] = useState<AdoptionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    setLoading(true);
    api
      .adoptions(petType)
      .then(({ items: list }) => setItems(list.filter((a) => a.pet_type !== 'dog')))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, [petType]);

  return (
    <Layout className="pb-nav">
      {toast}
      <PageHeader
        title="🏠 待领养"
        subtitle="领养前建议先了解附近友好医院"
        right={<LocationRegionBadge />}
      />
      <div className="px-5 pb-2">
        <HospitalAddressLink />
      </div>

      <div className="px-5 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPetType(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                petType === tab.key ? 'bg-brand-dark text-white' : 'bg-white/80 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 px-1">{items.length} 只等待领养</p>

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((a) => {
              const st = ADOPTION_STATUS[a.status];
              const cover = a.images?.[0];
              return (
                <Link
                  key={a.id}
                  to={`/adoption/${a.id}`}
                  className="block clay-card-white overflow-hidden active:scale-[0.98] transition-transform"
                >
                  <div className="aspect-[4/3] bg-[#fff8e8] overflow-hidden">
                    {cover ? (
                      <img src={cover} alt={a.pet_name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🐱</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{a.pet_name}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-orange-700 font-bold">
                      {a.breed || '田园猫'} · {a.age || '年龄未知'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {GENDER_LABELS[a.gender]}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/adoption/post')}
        className="fixed bottom-[5.5rem] right-5 w-12 h-12 frog-btn rounded-full text-xl font-black z-30 flex items-center justify-center"
      >
        ＋
      </button>
    </Layout>
  );
}
