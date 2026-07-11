import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Hospital } from '../types';
import { Layout, BackHeader, DidiCard, useToast } from '../components/UI';
import { formatDistance } from '../utils/helpers';
import { jumpToDidiPetTrip, copyToClipboard } from '../config/didi';

export default function HospitalSelectPage() {
  const { id } = useParams<{ id: string }>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();
  const { show, toast } = useToast();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        api
          .nearbyHospitals(p.coords.latitude, p.coords.longitude, 10)
          .then(({ items }) => setHospitals(items))
          .finally(() => setLoading(false));
      },
      () => {
        api
          .nearbyHospitals(undefined, undefined, 10)
          .then(({ items }) => setHospitals(items))
          .finally(() => setLoading(false));
      }
    );
  }, []);

  const handleSelect = async (hospital: Hospital) => {
    if (!id) return;
    try {
      await api.bindHospital(id, hospital.id);
      setSelected(hospital);
      show(`已选择 ${hospital.name}`);
    } catch (e) {
      show(e instanceof Error ? e.message : '选择失败');
    }
  };

  const handleDidi = async () => {
    if (!selected || !id) return;
    const channel = await jumpToDidiPetTrip(selected, show);
    api.logDidiJump(id, selected.id, channel).catch(() => {});
  };

  const handleTreated = async () => {
    if (!id) return;
    setMarking(true);
    try {
      await api.updateStatus(id, 'treated', '已就医');
      show('去发布领养信息');
      navigate(`/adoption/post?rescue_id=${id}`);
    } catch (e) {
      show(e instanceof Error ? e.message : '操作失败');
    } finally {
      setMarking(false);
    }
  };

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="选择友好医院" onBack={() => navigate(`/r/${id}`)} />

      <div className="px-5 space-y-4">
        {selected && (
          <>
            <DidiCard
              hospital={selected}
              onCallDidi={handleDidi}
              onCopy={async () => {
                await copyToClipboard(selected.address);
                show('地址已复制');
              }}
              onTreated={handleTreated}
              treatedLoading={marking}
            />
            <button
              type="button"
              className="w-full py-3 rounded-2xl font-bold text-sm text-gray-600 bg-white/80"
              onClick={() => navigate(`/r/${id}`)}
            >
              稍后再说，先返回详情
            </button>
          </>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          hospitals.map((h) => (
            <div
              key={h.id}
              className={`clay-card-white p-4 cursor-pointer transition-all ${
                selected?.id === h.id ? 'ring-2 ring-orange-400' : ''
              }`}
              onClick={() => handleSelect(h)}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-800">{h.name}</h3>
                {h.distance_km !== undefined && (
                  <span className="text-xs text-orange-500 font-bold">{formatDistance(h.distance_km)}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">{h.address}</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {h.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-green-600 font-medium">{h.discount_note}</p>
              <p className="text-xs text-gray-400 mt-1">🕐 {h.hours} · 📞 {h.phone}</p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
