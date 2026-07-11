import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { PetType } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';

const inputClass =
  'w-full p-3 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200';
const labelClass = 'block text-sm font-bold text-brand-dark mb-1';

export default function AdoptionPostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pet_name: '',
    pet_type: 'cat',
    breed: '',
    age: '',
    gender: 'unknown',
    health: '',
    description: '',
    address: '',
    requirements: '',
    contact: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { show, toast } = useToast();

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pet_name.trim() || !form.contact.trim()) return;
    setSubmitting(true);
    try {
      const { listing } = await api.createAdoption({
        ...form,
        pet_type: form.pet_type as PetType,
        gender: form.gender as 'male' | 'female' | 'unknown',
      });
      show('发布成功！');
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
      <BackHeader title="发布领养信息" onBack={() => navigate('/adoption')} />

      <form onSubmit={handleSubmit} className="px-5 space-y-4">
        <div className="clay-card-white p-5 border-2 border-dashed border-gray-200 text-center">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm text-gray-500">照片上传即将上线</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>名字/代号 *</label>
            <input
              type="text"
              value={form.pet_name}
              onChange={handleChange('pet_name')}
              placeholder="如：橘橘"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>类型 *</label>
            <select value={form.pet_type} onChange={handleChange('pet_type')} className={inputClass}>
              <option value="cat">🐱 猫</option>
              <option value="other">🐰 其他</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>品种猜测</label>
            <input
              type="text"
              value={form.breed}
              onChange={handleChange('breed')}
              placeholder="如：橘猫"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>性别</label>
            <select value={form.gender} onChange={handleChange('gender')} className={inputClass}>
              <option value="unknown">未知</option>
              <option value="male">公</option>
              <option value="female">母</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>年龄</label>
          <input
            type="text"
            value={form.age}
            onChange={handleChange('age')}
            placeholder="如：约3个月"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>健康状态</label>
          <input
            type="text"
            value={form.health}
            onChange={handleChange('health')}
            placeholder="如：已驱虫、已打第一针疫苗"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>描述</label>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            placeholder="性格、救助经过..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>📍 所在区域</label>
          <input
            type="text"
            value={form.address}
            onChange={handleChange('address')}
            placeholder="如：北京朝阳区"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>领养要求</label>
          <textarea
            value={form.requirements}
            onChange={handleChange('requirements')}
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
            onChange={handleChange('contact')}
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
