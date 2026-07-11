import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { defaultRescueLocation } from '../utils/helpers';
import { Layout, BackHeader, useToast } from '../components/UI';
import { HospitalAddressLink } from '../components/HospitalAddressLink';
import { useLocationContext } from '../context/LocationContext';
import { AnimalRecognition } from '../components/AnimalRecognition';
import type { AnimalRecognitionData } from '../utils/baiduAI';

const TEMPLATES = [
  '刚捡到一只猫，要不起，求支招 🐱',
  '猫已进航空箱，准备送医',
  '检查完了，等一个家',
];

const TAGS = ['要不起', '已控制', '受伤', '幼猫'];

export default function PublishPage() {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['要不起']);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [recognizingFile, setRecognizingFile] = useState<File | null>(null);
  const [aiBreed, setAiBreed] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [safetyOk, setSafetyOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { show, toast } = useToast();
  const { lat, lng, nearest, regionLabel, refresh } = useLocationContext();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => {
      if (prev.length === 0 && files[0]) setRecognizingFile(files[0]);
      return [...prev, ...files].slice(0, 9);
    });
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, reader.result as string].slice(0, 9));
      reader.readAsDataURL(f);
    });
  };

  const handleRecognitionResult = (data: AnimalRecognitionData) => {
    if (data.topName && data.topName !== '未知') setAiBreed(data.topName);
  };

  const handleLocate = () => {
    refresh();
    if (lat != null && lng != null) {
      setLocation({
        lat,
        lng,
        address: nearest
          ? `当前位置 · 最近医院 ${nearest.name}（${nearest.address}）`
          : `当前位置（${lat.toFixed(4)}, ${lng.toFixed(4)}）`,
      });
      show('定位成功，已关联最近医院');
      return;
    }
    const loc = defaultRescueLocation();
    setLocation({
      ...loc,
      address: nearest ? `默认位置 · 最近 ${nearest.name}（${nearest.address}）` : loc.address,
    });
    show('已使用默认位置');
  };

  const handleSubmit = async () => {
    if (!content.trim()) return show('请填写描述');
    if (!location) return show('请先获取定位');
    if (!safetyOk) return show('请阅读并确认安全须知');

    setLoading(true);
    try {
      const fd = new FormData();
      const desc = aiBreed ? `${content.trim()}\n\n【AI 品种推测：${aiBreed}】` : content;
      fd.append('content', desc);
      fd.append('tags', JSON.stringify(selectedTags.length ? selectedTags : ['要不起']));
      fd.append('lat', String(location.lat));
      fd.append('lng', String(location.lng));
      fd.append('address_display', location.address);
      images.forEach((img) => fd.append('images', img));

      const { rescue } = await api.createRescue(fd);
      show('发布成功！可在流浪求助同步关注（要不起）');
      navigate(`/r/${rescue.id}`);
    } catch (e) {
      show(e instanceof Error ? e.message : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="发布求助 · 要不起" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <p className="text-xs text-[var(--ink-muted)] px-1 leading-relaxed">
          流浪求助仅用于「要不起」求助。送医检查后请走救助流程发布<strong>待领养</strong>贴，勿在此同步领养信息。
        </p>

        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">照片（可选）</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <img key={i} src={p} alt="" className="w-20 h-20 rounded-xl object-cover" />
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer">
              📷
              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleImages} />
            </label>
          </div>
        </div>

        <AnimalRecognition file={recognizingFile} onResult={handleRecognitionResult} />

        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">描述 *</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                className="text-[10px] px-2 py-1 rounded-full bg-orange-50 text-orange-600"
                onClick={() => setContent(t)}
              >
                {t.slice(0, 12)}…
              </button>
            ))}
          </div>
          <textarea
            className="w-full border-2 border-gray-100 rounded-2xl p-3 text-sm min-h-[100px]"
            placeholder="说说情况：在哪捡到、状态如何、为什么要不起…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">标签</label>
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                  selectedTags.includes(tag) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">定位</label>
          <button type="button" className="clay-btn-yellow px-4 py-2 text-sm" onClick={handleLocate}>
            📍 获取当前位置
          </button>
          {location && <p className="text-sm text-gray-500 mt-2">{location.address}</p>}
          <div className="mt-2">
            <HospitalAddressLink />
          </div>
          {!location && (
            <p className="text-[10px] text-gray-400 mt-1">{regionLabel}</p>
          )}
        </div>

        <div className="clay-card-white p-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={safetyOk} onChange={(e) => setSafetyOk(e.target.checked)} className="mt-1" />
            <span className="text-sm text-gray-600">
              我已阅读
              <Link to="/safety" className="text-orange-500 underline mx-1">抓猫安全提示</Link>
              ，了解相关风险
            </span>
          </label>
        </div>

        <button
          type="button"
          className="fab-main w-full py-4 rounded-3xl text-lg font-black"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '发布中...' : '发布求助（要不起）'}
        </button>
      </div>
    </Layout>
  );
}
