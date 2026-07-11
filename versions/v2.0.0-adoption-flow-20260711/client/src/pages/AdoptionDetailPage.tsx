import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { AdoptionListing, PetType } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import {
  ADOPTION_STATUS,
  GENDER_LABELS,
  PET_TYPE_EMOJI,
  PET_TYPE_LABELS,
} from '../utils/community';

export default function AdoptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<AdoptionListing | null>(null);
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    if (!id) return;
    api
      .adoption(id)
      .then(({ listing }) => setData(listing))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <BackHeader title="领养详情" onBack={() => navigate('/adoption')} />
        <p className="text-center text-gray-400 py-8">加载中...</p>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <BackHeader title="领养详情" onBack={() => navigate('/adoption')} />
        <div className="text-center py-16 px-5">
          <div className="text-4xl mb-4">😿</div>
          <p className="text-gray-500 mb-4">信息不存在</p>
          <button type="button" onClick={() => navigate('/adoption')} className="text-orange-600 font-bold">
            ← 返回列表
          </button>
        </div>
      </Layout>
    );
  }

  const st = ADOPTION_STATUS[data.status];

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title={`${data.pet_name}的领养信息`} onBack={() => navigate('/adoption')} />

      <div className="px-5">
        <div className="clay-card-white overflow-hidden">
          <div className="h-52 bg-[#fff8e8] overflow-hidden">
            {data.images?.[0] ? (
              <img src={data.images[0]} alt={data.pet_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {PET_TYPE_EMOJI[data.pet_type as PetType]}
              </div>
            )}
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.color}`}>
                {st.label}
              </span>
              <span className="text-xs text-gray-400">
                发布于 {new Date(data.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-brand-dark mb-1">{data.pet_name}</h2>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>{PET_TYPE_LABELS[data.pet_type as PetType]}</span>
                {data.breed && <span>· {data.breed}</span>}
                {data.age && <span>· {data.age}</span>}
                <span>· {GENDER_LABELS[data.gender]}</span>
                {data.address && <span>· 📍 {data.address}</span>}
              </div>
            </div>

            {data.health && (
              <div className="bg-green-50 rounded-2xl p-3 text-sm text-green-800">
                <span className="font-bold">健康状况：</span>
                {data.health}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {data.sterilized === 'yes' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold">已绝育</span>
              )}
              {data.sterilized === 'no' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold">未绝育</span>
              )}
              {data.vaccinated === 'yes' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">已接种疫苗</span>
              )}
              {data.vaccinated === 'no' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-bold">未接种疫苗</span>
              )}
            </div>

            {data.description && (
              <div>
                <h3 className="font-bold text-sm mb-1">📝 简介</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
              </div>
            )}

            {data.requirements && (
              <div>
                <h3 className="font-bold text-sm mb-1">📋 领养要求</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {data.requirements}
                </p>
              </div>
            )}

            <div className="clay-card-yellow p-4">
              <h3 className="font-bold text-sm text-orange-800 mb-1">📞 联系方式</h3>
              <p className="text-orange-700 font-bold">{data.contact}</p>
            </div>

            <button
              type="button"
              onClick={async () => {
                const text = data.contact?.trim() || '';
                if (!text) {
                  show('暂无联系方式，请稍后再试');
                  return;
                }
                try {
                  await navigator.clipboard.writeText(text);
                  show(`已复制联系方式：${text}，快去联系送养人吧！`);
                } catch {
                  show(`请手动复制联系方式：${text}`);
                }
              }}
              className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-lg active:scale-95 transition-transform"
            >
              我想领养 {data.pet_name}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
