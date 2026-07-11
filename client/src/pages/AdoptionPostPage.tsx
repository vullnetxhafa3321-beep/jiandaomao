import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import type { PetType } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';
import { AnimalRecognition } from '../components/AnimalRecognition';
import type { AnimalRecognitionData } from '../utils/baiduAI';

const inputClass =
  'w-full p-3 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200';
const labelClass = 'block text-sm font-bold text-brand-dark mb-1';

const AGE_PRESETS = ['约2月', '约6月', '约1岁', '约2岁', '约3岁', '约5岁+', '自定义'];
const HEALTH_OPTIONS = ['健康', '有猫鼻支', '有猫藓', '有猫冠状病毒', '其他疾病', '残疾'];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
        active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

export default function AdoptionPostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rescueId = searchParams.get('rescue_id') || '';
  const [form, setForm] = useState({
    pet_name: '',
    pet_type: 'cat' as PetType,
    breed: '',
    age: '',
    gender: 'unknown' as 'male' | 'female' | 'unknown',
    health: '',
    sterilized: '' as '' | 'yes' | 'no',
    vaccinated: '' as '' | 'yes' | 'no',
    description: '',
    address: '',
    requirements: '',
    contact: '',
  });
  const [agePreset, setAgePreset] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [recognizingFile, setRecognizingFile] = useState<File | null>(null);
  const [breedScores, setBreedScores] = useState<AnimalRecognitionData['results']>([]);
  const [submitting, setSubmitting] = useState(false);
  const { show, toast } = useToast();

  useEffect(() => {
    if (!rescueId) return;
    api
      .getRescue(rescueId)
      .then(({ rescue }) => {
        setForm((f) => ({
          ...f,
          pet_name: rescue.title?.slice(0, 20) || f.pet_name || '待命名小猫',
          description: rescue.content || f.description,
          address: rescue.address_display || f.address,
        }));
      })
      .catch(() => {});
  }, [rescueId]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => {
      if (prev.length === 0 && files[0]) setRecognizingFile(files[0]);
      return [...prev, ...files].slice(0, 9);
    });
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, reader.result as string].slice(0, 9));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setRecognizingFile(null);
      setBreedScores([]);
    }
  };

  const handleRecognitionResult = (data: AnimalRecognitionData) => {
    setBreedScores(data.results || []);
    setForm((f) => ({
      ...f,
      breed: f.breed || (data.topName !== '未知' ? data.topName : ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pet_name.trim() || !form.contact.trim()) return show('请填写名字和联系方式');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('pet_name', form.pet_name.trim());
      fd.append('pet_type', form.pet_type);
      fd.append('breed', form.breed);
      fd.append('age', form.age);
      fd.append('gender', form.gender);
      fd.append('health', form.health);
      if (form.sterilized) fd.append('sterilized', form.sterilized);
      if (form.vaccinated) fd.append('vaccinated', form.vaccinated);
      fd.append('description', form.description);
      fd.append('address', form.address);
      fd.append('requirements', form.requirements);
      fd.append('contact', form.contact.trim());
      if (breedScores.length) fd.append('breed_scores', JSON.stringify(breedScores));
      if (rescueId) fd.append('rescue_id', rescueId);
      images.forEach((img) => fd.append('images', img));

      const { listing } = await api.createAdoption(fd);
      if (rescueId) {
        try {
          await api.updateStatus(rescueId, 'adoption', '已发布领养信息');
        } catch {
          /* 非本人求助单可忽略 */
        }
      }
      show('领养信息已发布');
      navigate(`/adoption/${listing.id}`);
    } catch (err) {
      show(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="发布领养信息" onBack={() => navigate(-1)} />

      <form onSubmit={handleSubmit} className="px-5 space-y-4">
        {rescueId && (
          <p className="text-xs text-[var(--ink-muted)] px-1 leading-relaxed">
            送医检查后的领养贴：可添加标签、简短描述和照片，供人领养。
          </p>
        )}

        <div className="clay-card-white p-4">
          <label className={labelClass}>照片</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative">
                <img src={p} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {previews.length < 9 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer">
                📷
                <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">上传后自动识别品种并填充下方字段</p>
        </div>

        <AnimalRecognition file={recognizingFile} onResult={handleRecognitionResult} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>名字/代号 *</label>
            <input
              type="text"
              value={form.pet_name}
              onChange={(e) => setForm({ ...form, pet_name: e.target.value })}
              placeholder="如：橘橘"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>类型</label>
            <select
              value={form.pet_type}
              onChange={(e) => setForm({ ...form, pet_type: e.target.value as PetType })}
              className={inputClass}
            >
              <option value="cat">🐱 猫</option>
              <option value="other">🐰 其他</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>品种猜测</label>
          <input
            type="text"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            placeholder="AI 自动填充，可改"
            className={inputClass}
          />
        </div>

        <div className="clay-card-white p-4 space-y-3">
          <div>
            <label className={labelClass}>性别</label>
            <div className="flex gap-2 flex-wrap">
              <Chip active={form.gender === 'female'} onClick={() => setForm({ ...form, gender: 'female' })}>
                女孩
              </Chip>
              <Chip active={form.gender === 'male'} onClick={() => setForm({ ...form, gender: 'male' })}>
                男孩
              </Chip>
              <Chip active={form.gender === 'unknown'} onClick={() => setForm({ ...form, gender: 'unknown' })}>
                未知
              </Chip>
            </div>
          </div>

          <div>
            <label className={labelClass}>绝育</label>
            <div className="flex gap-2 flex-wrap">
              <Chip
                active={form.sterilized === 'yes'}
                onClick={() => setForm({ ...form, sterilized: 'yes' })}
              >
                已绝育
              </Chip>
              <Chip
                active={form.sterilized === 'no'}
                onClick={() => setForm({ ...form, sterilized: 'no' })}
              >
                未绝育
              </Chip>
            </div>
          </div>

          <div>
            <label className={labelClass}>疫苗</label>
            <div className="flex gap-2 flex-wrap">
              <Chip
                active={form.vaccinated === 'yes'}
                onClick={() => setForm({ ...form, vaccinated: 'yes' })}
              >
                已接种疫苗
              </Chip>
              <Chip
                active={form.vaccinated === 'no'}
                onClick={() => setForm({ ...form, vaccinated: 'no' })}
              >
                未接种疫苗
              </Chip>
            </div>
          </div>

          <div>
            <label className={labelClass}>年龄</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {AGE_PRESETS.map((a) => (
                <Chip
                  key={a}
                  active={agePreset === a}
                  onClick={() => {
                    setAgePreset(a);
                    if (a !== '自定义') setForm({ ...form, age: a });
                  }}
                >
                  {a}
                </Chip>
              ))}
            </div>
            {agePreset === '自定义' && (
              <input
                type="text"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="如：约4岁"
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>健康状况</label>
            <div className="flex gap-2 flex-wrap">
              {HEALTH_OPTIONS.map((h) => (
                <Chip
                  key={h}
                  active={form.health === h}
                  onClick={() => setForm({ ...form, health: h })}
                >
                  {h}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>简短描述</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="性格、救助经过、目前状态…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>📍 所在区域</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="如：北京朝阳区"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>领养要求</label>
          <textarea
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            placeholder="如：封窗、定期疫苗、接受回访"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>联系方式 *</label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="微信：xxx 或 电话：xxx"
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={!form.pet_name.trim() || !form.contact.trim() || submitting}
          className="w-full py-4 clay-btn-yellow rounded-2xl font-black text-lg disabled:opacity-40"
        >
          {submitting ? '发布中...' : '发布领养信息'}
        </button>
      </form>
    </Layout>
  );
}
