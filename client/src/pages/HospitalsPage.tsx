import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Hospital, PricedHospital } from '../types';
import { Layout, BackHeader, DidiCard, useToast } from '../components/UI';
import { formatDistance } from '../utils/helpers';
import { useLocation } from '../hooks/useLocation';
import { amapNavUrl } from '../utils/community';
import { jumpToDidiPetTrip, copyToClipboard } from '../config/didi';

type Tab = 'shanghai' | 'beijing';

export default function HospitalsPage() {
  const [tab, setTab] = useState<Tab>('shanghai');
  const [shanghaiHospitals, setShanghaiHospitals] = useState<Hospital[]>([]);
  const [bjHospitals, setBjHospitals] = useState<PricedHospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [filterPartner, setFilterPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { location } = useLocation();
  const { show, toast } = useToast();

  useEffect(() => {
    setLoading(true);
    if (tab === 'shanghai') {
      api
        .nearbyHospitals(location?.lat, location?.lng, 22)
        .then(({ items }) => setShanghaiHospitals(items))
        .finally(() => setLoading(false));
    } else {
      api
        .pricedHospitals(location?.lat, location?.lng)
        .then(({ items }) => setBjHospitals(items))
        .finally(() => setLoading(false));
    }
  }, [tab, location?.lat, location?.lng]);

  const bjFiltered = filterPartner ? bjHospitals.filter((h) => h.isPartner) : bjHospitals;

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="🏥 附近医院" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setTab('shanghai'); setSelected(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === 'shanghai' ? 'clay-btn-yellow' : 'bg-white/80 text-gray-600'
            }`}
          >
            上海 · 友好医院
          </button>
          <button
            type="button"
            onClick={() => { setTab('beijing'); setSelected(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === 'beijing' ? 'clay-btn-yellow' : 'bg-white/80 text-gray-600'
            }`}
          >
            北京 · 透明价格
          </button>
        </div>

        {tab === 'shanghai' ? (
          <>
            <p className="text-sm text-brand-muted font-medium px-1">
              上海 22 家流浪猫友好医院{location ? ' · 按距离排序' : ''}
            </p>

            {selected && (
              <DidiCard
                hospital={selected}
                onCallDidi={async () => {
                  const channel = await jumpToDidiPetTrip(selected, show);
                  show(`已尝试跳转（${channel}）`);
                }}
                onCopy={async () => {
                  await copyToClipboard(selected.address);
                  show('地址已复制');
                }}
              />
            )}

            {loading ? (
              <p className="text-center text-gray-400 py-8">加载中...</p>
            ) : (
              shanghaiHospitals.map((h) => (
                <div
                  key={h.id}
                  className={`clay-card-white p-4 cursor-pointer ${selected?.id === h.id ? 'ring-2 ring-orange-400' : ''}`}
                  onClick={() => setSelected(h)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-sm">{h.name}</h3>
                    {h.distance_km !== undefined && (
                      <span className="text-xs text-orange-500 font-bold">
                        {formatDistance(h.distance_km)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{h.address}</p>
                  <div className="flex gap-1 flex-wrap mb-1">
                    {h.tags.map((t) => (
                      <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-green-600">{h.discount_note}</p>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilterPartner(!filterPartner)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  filterPartner ? 'bg-green-500 text-white' : 'bg-white/80 text-gray-600'
                }`}
              >
                {filterPartner ? '✅ 仅合作医院' : '🔽 全部医院'}
              </button>
              {location && <span className="text-xs text-gray-400">已按距离排序</span>}
            </div>

            {loading ? (
              <p className="text-center text-gray-400 py-8">加载中...</p>
            ) : (
              bjFiltered.map((h) => (
                <div key={h.id} className="clay-card-white overflow-hidden">
                  <div className="p-4 pb-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-800">{h.name}</h3>
                        {h.isPartner && (
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            ★合作医院
                          </span>
                        )}
                      </div>
                      {h.distance_km !== undefined && (
                        <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                          {formatDistance(h.distance_km)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">📍 {h.address}</p>
                    <p className="text-xs text-gray-500">🕐 {h.hours}</p>
                  </div>

                  <div className="px-4 pb-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400">
                          <th className="text-left py-2 font-normal">服务项目</th>
                          <th className="text-right py-2 font-normal w-20">价格</th>
                        </tr>
                      </thead>
                      <tbody>
                        {h.prices.map((p, i) => (
                          <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="py-2">{p.item}</td>
                            <td className="py-2 text-right font-bold">
                              {p.free ? (
                                <span className="text-green-600">免费</span>
                              ) : (
                                <span>¥{p.price}</span>
                              )}
                              <span className="text-gray-400 font-normal">/{p.unit}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {h.partnerDiscount && (
                    <div className="mx-4 mb-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-xl">
                      💡 {h.partnerDiscount}
                    </div>
                  )}
                  <div className="px-4 pb-2 text-[10px] text-gray-400">
                    📅 价格更新于 {h.priceUpdatedAt}
                  </div>

                  <div className="flex border-t border-gray-100">
                    <a
                      href={amapNavUrl(h.lng, h.lat, h.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-3 text-orange-600 font-bold text-sm border-r border-gray-100"
                    >
                      🧭 导航
                    </a>
                    <a
                      href={`tel:${h.phone}`}
                      className="flex-1 text-center py-3 text-green-600 font-bold text-sm"
                    >
                      📞 电话
                    </a>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
