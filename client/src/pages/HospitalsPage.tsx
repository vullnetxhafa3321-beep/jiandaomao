import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Hospital, PricedHospital } from '../types';
import { Layout, BackHeader, DidiCard, useToast } from '../components/UI';
import { formatDistance } from '../utils/helpers';
import { useLocationContext } from '../context/LocationContext';
import { amapNavUrl } from '../utils/community';
import { jumpToDidiPetTrip, copyToClipboard } from '../config/didi';

export default function HospitalsPage() {
  const [shanghaiHospitals, setShanghaiHospitals] = useState<Hospital[]>([]);
  const [bjHospitals, setBjHospitals] = useState<PricedHospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [filterPartner, setFilterPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lat, lng, regionLabel } = useLocationContext();
  const { show, toast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.nearbyHospitals(lat ?? undefined, lng ?? undefined, 22),
      api.pricedHospitals(lat ?? undefined, lng ?? undefined),
    ])
      .then(([sh, bj]) => {
        setShanghaiHospitals(sh.items);
        setBjHospitals(bj.items);
      })
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const bjFiltered = filterPartner ? bjHospitals.filter((h) => h.isPartner) : bjHospitals;

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="🏥 附近医院" onBack={() => navigate('/')} />

      <div className="px-5 space-y-6">
        <p className="text-sm text-brand-muted font-medium px-1">
          上海 22 家友好医院 + 北京合作医院 · {regionLabel}
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
          <>
            <section>
              <h2 className="text-sm font-black text-brand-dark mb-3 px-1">
                上海友好医院 <span className="text-gray-400 font-bold">({shanghaiHospitals.length})</span>
              </h2>
              <div className="space-y-3">
                {shanghaiHospitals.map((h) => (
                  <div
                    key={h.id}
                    className={`clay-card-white p-4 cursor-pointer ${selected?.id === h.id ? 'ring-2 ring-orange-400' : ''}`}
                    onClick={() => setSelected(h)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 text-sm">{h.name}</h3>
                      {h.distance_km !== undefined && (
                        <span className="text-xs text-orange-500 font-bold">{formatDistance(h.distance_km)}</span>
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
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-black text-brand-dark">
                  北京合作医院 <span className="text-gray-400 font-bold">({bjFiltered.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setFilterPartner(!filterPartner)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    filterPartner ? 'bg-green-500 text-white' : 'bg-white/80 text-gray-600'
                  }`}
                >
                  {filterPartner ? '仅合作' : '全部'}
                </button>
              </div>
              <div className="space-y-4">
                {bjFiltered.map((h) => (
                  <div key={h.id} className="clay-card-white overflow-hidden">
                    <div className="p-4 pb-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-sm">{h.name}</h3>
                          {h.isPartner && (
                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                              ★合作
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
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
