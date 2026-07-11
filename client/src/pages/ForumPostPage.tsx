import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Layout, BackHeader, useToast } from '../components/UI';

export default function ForumPostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState('北京市大兴区西红门镇');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { show, toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) return;
    setSubmitting(true);
    try {
      const { post } = await api.createForumPost({ title, content, address, breed, age });
      show('发布成功！');
      navigate(`/forum/${post.id}`);
    } catch (err) {
      show(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="发布流浪发现" onBack={() => navigate('/forum')} />

      <form onSubmit={handleSubmit} className="px-5 space-y-4">
        <div className="clay-card-white p-5 border-2 border-dashed border-gray-200 text-center">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm text-gray-500">照片上传即将上线</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-dark mb-1">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：朝阳区发现一只橘猫"
            required
            className="w-full p-3 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-dark mb-1">描述</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="描述流浪动物的状况、你在哪里看到的..."
            rows={5}
            className="w-full p-3 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-brand-dark mb-1">品种</label>
            <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="如：橘猫" className="w-full p-3 rounded-2xl border border-gray-200 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-dark mb-1">年龄</label>
            <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="如：青年" className="w-full p-3 rounded-2xl border border-gray-200 bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-dark mb-1">📍 发现位置 *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="如：西红门荟聚附近"
            required
            className="w-full p-3 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !address.trim() || submitting}
          className="w-full py-4 clay-btn-yellow rounded-2xl font-black text-lg disabled:opacity-40"
        >
          {submitting ? '发布中...' : '发布'}
        </button>
      </form>
    </Layout>
  );
}
