import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Hospital } from '../types';
import { Layout, BackHeader, DidiCard, useToast } from '../components/UI';
import { formatDistance } from '../utils/helpers';
import { jumpToDidiPetTrip, copyToClipboard } from '../config/didi';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { show, toast } = useToast();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        api
          .nearbyHospitals(p.coords.latitude, p.coords.longitude, 22)
          .then(({ items }) => setHospitals(items))
          .finally(() => setLoading(false));
      },
      () => {
        api
          .nearbyHospitals(undefined, undefined, 22)
          .then(({ items }) => setHospitals(items))
          .finally(() => setLoading(false));
      }
    );
  }, []);

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="附近友好医院" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <p className="text-sm text-brand-muted font-medium px-1">
          上海 22 家流浪猫友好医院，按距离排序
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
          hospitals.map((h) => (
            <div
              key={h.id}
              className={`clay-card-white p-4 ${selected?.id === h.id ? 'ring-2 ring-orange-400' : ''}`}
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
          ))
        )}
      </div>
    </Layout>
  );
}
