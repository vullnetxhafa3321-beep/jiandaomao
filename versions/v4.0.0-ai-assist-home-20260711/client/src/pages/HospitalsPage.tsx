import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { NearbyFriendlyHospital } from '../types';
import { Layout, BackHeader, DidiCard, useToast } from '../components/UI';
import { formatDistance } from '../utils/helpers';
import { useLocationContext } from '../context/LocationContext';
import { amapNavUrl, amapMarkerUrl } from '../utils/community';
import { jumpToDidiPetTrip, copyToClipboard } from '../config/didi';

export default function HospitalsPage() {
  const [items, setItems] = useState<NearbyFriendlyHospital[]>([]);
  const [selected, setSelected] = useState<NearbyFriendlyHospital | null>(null);
  const [filterPartner, setFilterPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lat, lng, regionLabel } = useLocationContext();
  const { show, toast } = useToast();

  useEffect(() => {
    setLoading(true);
    api
      .nearbyFriendlyHospitals(lat ?? undefined, lng ?? undefined, 12)
      .then((r) => setItems([...r.items].sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const list = filterPartner ? items.filter((h) => h.isPartner) : items;

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="附近友好医院" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <p className="text-sm text-[var(--ink-muted)] font-medium px-1">
          根据你的定位生成附近流浪猫友好医院（含折扣说明）· {regionLabel}
        </p>

        <div className="flex justify-end px-1">
          <button
            type="button"
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${filterPartner ? 'bg-[var(--coral-500)] text-white' : 'bg-[var(--cream-100)] text-[var(--ink-700)]'}`}
            onClick={() => setFilterPartner((v) => !v)}
          >
            {filterPartner ? '只看合作' : '全部医院'}
          </button>
        </div>

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
        ) : list.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无医院数据，请稍后重试</p>
        ) : (
          <div className="space-y-3">
            {list.map((h) => (
              <div
                key={h.id}
                className={`frog-card p-4 cursor-pointer ${selected?.id === h.id ? 'ring-2 ring-[var(--coral-500)]' : ''}`}
                onClick={() => setSelected(h)}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold text-[var(--ink-900)] text-sm">{h.name}</h3>
                  {h.distance_km !== undefined && (
                    <span className="text-xs text-[var(--sky-500)] font-bold flex-shrink-0">{formatDistance(h.distance_km)}</span>
                  )}
                </div>
                {h.isPartner && (
                  <span className="inline-block text-[10px] font-bold text-[var(--coral-500)] mb-1">流浪猫友好合作</span>
                )}
                <a
                  className="text-xs text-[var(--sky-deep)] underline block mb-2"
                  href={amapMarkerUrl(h.lng, h.lat, h.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  📍 {h.address}
                </a>
                {h.friendly_note && (
                  <p className="text-[11px] text-[var(--ink-700)] leading-relaxed mb-2 bg-[rgba(87,187,251,0.1)] rounded-xl p-2">
                    {h.friendly_note}
                  </p>
                )}
                <p className="text-xs text-[var(--coral-500)] font-semibold mb-2">🎟 {h.discount_note || h.partnerDiscount}</p>
                {h.prices?.length > 0 && (
                  <ul className="text-[10px] text-[var(--ink-muted)] space-y-0.5 mb-2">
                    {h.prices.slice(0, 4).map((p) => (
                      <li key={p.item} className="flex justify-between gap-2">
                        <span>{p.item}</span>
                        <span className={p.free ? 'text-[var(--grass-500)] font-bold' : ''}>
                          {p.free ? '免费' : `${p.price}${p.unit}`}
                          {p.note ? ` · ${p.note}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <a className="map-action-btn primary flex-1" href={amapNavUrl(h.lng, h.lat, h.name)} target="_blank" rel="noopener noreferrer">
                    导航
                  </a>
                  {h.phone && (
                    <a className="map-action-btn secondary flex-1" href={`tel:${h.phone}`}>
                      电话
                    </a>
                  )}
                </div>
                <p className="text-[9px] text-[var(--ink-muted)] mt-2">营业 {h.hours} · 演示落点请到院再确认优惠</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
