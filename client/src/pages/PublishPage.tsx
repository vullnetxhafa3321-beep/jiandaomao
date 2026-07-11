import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { getLocation, defaultRescueLocation } from '../utils/helpers';
import { Layout, BackHeader, useToast } from '../components/UI';

const TEMPLATES = [
  '刚捡到一只猫，要不起，求支招 🐱',
  '猫已进航空箱，准备送医',
  '检查完了，等一个家',
];

const TAGS = ['要不起', '已控制', '受伤', '幼猫'];

export default function PublishPage() {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [safetyOk, setSafetyOk] = useState(false);
  const [alsoAdopt, setAlsoAdopt] = useState(false);
  const [contact, setContact] = useState('');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { show, toast } = useToast();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 9));
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, reader.result as string].slice(0, 9));
      reader.readAsDataURL(f);
    });
  };

  const handleLocate = async () => {
    try {
      const loc = await getLocation();
      setLocation(loc);
      show('定位成功');
    } catch {
      const loc = defaultRescueLocation();
      setLocation(loc);
      show('已使用西红门默认位置');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return show('请填写描述');
    if (!location) return show('请先获取定位');
    if (!safetyOk) return show('请阅读并确认安全须知');
    if (alsoAdopt && !contact.trim()) return show('同步待领养需填写联系方式');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content);
      fd.append('tags', JSON.stringify(selectedTags));
      fd.append('lat', String(location.lat));
      fd.append('lng', String(location.lng));
      fd.append('address_display', location.address);
      if (alsoAdopt) {
        fd.append('also_post_adoption', 'true');
        fd.append('contact', contact.trim());
        fd.append('pet_name', petName.trim());
        fd.append('breed', breed.trim());
        fd.append('age', age.trim());
      }
      images.forEach((img) => fd.append('images', img));

      const { rescue, adoption } = await api.createRescue(fd);
      show(adoption ? '发布成功，已同步待领养！' : '发布成功！');
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
      <BackHeader title="发布救助动态" onBack={() => navigate(-1)} />

      <div className="px-5 space-y-4">
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

        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">描述</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full"
                onClick={() => setContent(t)}
              >
                {t.slice(0, 12)}...
              </button>
            ))}
          </div>
          <textarea
            className="w-full border-2 border-gray-100 rounded-2xl p-3 text-sm min-h-[100px]"
            placeholder="描述一下情况..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">标签</label>
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selectedTags.includes(tag) ? 'clay-btn-yellow' : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
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
          <p className="text-[10px] text-gray-400 mt-1">默认区域：北京市大兴区西红门镇</p>
        </div>

        <div className="clay-card-white p-4 space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={alsoAdopt}
              onChange={(e) => setAlsoAdopt(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm font-bold text-gray-700">同时发布到「待领养」</span>
          </label>
          {alsoAdopt && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-600">我的联系方式 *</label>
                <input
                  className="w-full border-2 border-gray-100 rounded-xl p-2 text-sm mt-1"
                  placeholder="微信：xxx 或 电话：xxx"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-600">名字/代号</label>
                  <input className="w-full border-2 border-gray-100 rounded-xl p-2 text-sm mt-1" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="如：小橘" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">品种</label>
                  <input className="w-full border-2 border-gray-100 rounded-xl p-2 text-sm mt-1" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="如：橘猫" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">年龄</label>
                <input className="w-full border-2 border-gray-100 rounded-xl p-2 text-sm mt-1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="如：约3个月" />
              </div>
            </div>
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
          {loading ? '发布中...' : '发布动态'}
        </button>
      </div>
    </Layout>
  );
}
