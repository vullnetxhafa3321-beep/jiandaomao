import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AdoptionListing, PetType } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { ADOPTION_STATUS, GENDER_LABELS, PET_TYPE_EMOJI } from '../utils/community';

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: '🐾 全部' },
  { key: 'cat', label: '🐱 猫咪' },
  { key: 'dog', label: '🐶 狗狗' },
  { key: 'other', label: '🐰 其他' },
];

export default function AdoptionPage() {
  const navigate = useNavigate();
  const [petType, setPetType] = useState('all');
  const [items, setItems] = useState<AdoptionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    setLoading(true);
    api
      .adoptions(petType)
      .then(({ items: list }) => setItems(list))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, [petType]);

  return (
    <Layout className="pb-24">
      {toast}
      <BackHeader title="🏠 待领养" onBack={() => navigate('/')} />

      <div className="px-5 space-y-3">
        <p className="text-sm text-brand-muted font-medium px-1">给流浪的它们找一个温暖的家</p>

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
          items.map((a) => {
            const st = ADOPTION_STATUS[a.status];
            return (
              <Link
                key={a.id}
                to={`/adoption/${a.id}`}
                className="block clay-card-white p-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-[#fff8e8] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    {PET_TYPE_EMOJI[a.pet_type as PetType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{a.pet_name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {a.breed} · {a.age} · {GENDER_LABELS[a.gender]}
                    </p>
                    {a.health && <p className="text-xs text-green-600 mt-1">✅ {a.health}</p>}
                    {a.address && <p className="text-xs text-gray-400 mt-1">📍 {a.address}</p>}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/adoption/post')}
        className="fixed bottom-8 right-6 max-w-[480px] mr-[calc(50vw-240px)] w-14 h-14 clay-btn-yellow rounded-full shadow-lg text-2xl font-black z-40"
      >
        ＋
      </button>
    </Layout>
  );
}
