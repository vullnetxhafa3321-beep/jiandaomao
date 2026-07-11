import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Layout, BackHeader, useToast } from '../components/UI';
import { AnimalRecognition } from '../components/AnimalRecognition';
import type { AnimalRecognitionData } from '../utils/baiduAI';

export default function ForumPostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState('北京市大兴区西红门镇');
  const [contact, setContact] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [recognizingFile, setRecognizingFile] = useState<File | null>(null);
  const [breedScores, setBreedScores] = useState<AnimalRecognitionData['results']>([]);
  const [submitting, setSubmitting] = useState(false);
  const { show, toast } = useToast();

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const next = [...images, ...files].slice(0, 9);
    setImages(next);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, reader.result as string].slice(0, 9));
      reader.readAsDataURL(f);
    });
    if (files[0]) setRecognizingFile(files[0]);
  };

  const handleRecognitionResult = (data: AnimalRecognitionData) => {
    setBreedScores(data.results || []);
    if (data.topName && data.topName !== '未知') {
      setBreed((prev) => prev || data.topName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim() || !contact.trim()) return;
    setSubmitting(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch { /* use server default fuzz */ }
      }
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('content', content);
      fd.append('address', address.trim());
      fd.append('contact', contact.trim());
      fd.append('breed', breed);
      fd.append('age', age);
      if (lat != null) fd.append('lat', String(lat));
      if (lng != null) fd.append('lng', String(lng));
      if (breedScores.length) fd.append('breed_scores', JSON.stringify(breedScores));
      images.forEach((img) => fd.append('images', img));

      const { post } = await api.createForumPost(fd);
      show('发布成功！位置已模糊到1km内');
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
        <div className="clay-card-white p-4">
          <label className="block text-sm font-bold text-brand-dark mb-2">照片</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <img key={i} src={p} alt="" className="w-20 h-20 rounded-xl object-cover" />
            ))}
            {previews.length < 9 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer">
                📷
                <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">上传后自动用免费 API 识别品种</p>
        </div>

        <AnimalRecognition file={recognizingFile} onResult={handleRecognitionResult} />

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
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="AI 自动填充，可改"
              className="w-full p-3 rounded-2xl border border-gray-200 bg-white"
            />
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
          <p className="text-[10px] text-amber-700 mt-1">为安全起见，发布后地图只显示 1km 内模糊定位</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-dark mb-1">联系方式 *（微信/手机）</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="如：微信 cat_helper_01"
            required
            className="w-full p-3 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
          />
          <p className="text-[10px] text-gray-500 mt-1">他人可通过联系方式向你询问具体地址</p>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !address.trim() || !contact.trim() || submitting}
          className="w-full py-4 clay-btn-yellow rounded-2xl font-black text-lg disabled:opacity-40"
        >
          {submitting ? '发布中...' : '发布'}
        </button>
      </form>
    </Layout>
  );
}
