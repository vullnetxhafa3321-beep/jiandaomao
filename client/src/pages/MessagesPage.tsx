import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { ForumPost, AdoptionListing } from '../types';
import { Layout, PageHeader, useToast } from '../components/UI';
import { formatTimeAgo } from '../utils/helpers';

interface MessageItem {
  id: string;
  type: 'forum' | 'adoption';
  title: string;
  preview: string;
  time: string;
  link: string;
  image?: string;
}

export default function MessagesPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    Promise.all([api.forumPosts(), api.adoptions()])
      .then(([forum, adoption]) => {
        const forumMsgs: MessageItem[] = forum.items.slice(0, 4).map((p: ForumPost) => ({
          id: `f-${p.id}`,
          type: 'forum',
          title: `流浪发现 · ${p.title}`,
          preview: p.content.slice(0, 40),
          time: p.created_at,
          link: `/forum/${p.id}`,
          image: p.images?.[0],
        }));
        const adoptMsgs: MessageItem[] = adoption.items.slice(0, 4).map((a: AdoptionListing) => ({
          id: `a-${a.id}`,
          type: 'adoption',
          title: `待领养 · ${a.pet_name}`,
          preview: `${a.breed || '田园猫'} · ${a.age || '年龄未知'}`,
          time: a.created_at,
          link: `/adoption/${a.id}`,
          image: a.images?.[0],
        }));
        const merged = [...forumMsgs, ...adoptMsgs].sort(
          (x, y) => new Date(y.time).getTime() - new Date(x.time).getTime()
        );
        setItems(merged);
      })
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout className="pb-nav">
      {toast}
      <PageHeader title="消息" subtitle="社区动态与领养提醒" />

      <div className="px-5 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-12">加载中...</p>
        ) : items.length === 0 ? (
          <div className="clay-card-white p-10 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500">暂无新消息</p>
          </div>
        ) : (
          items.map((msg) => (
            <Link key={msg.id} to={msg.link} className="block clay-card-white p-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#fff8e8] flex-shrink-0 flex items-center justify-center">
                  {msg.image ? (
                    <img src={msg.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{msg.type === 'forum' ? '📸' : '🏠'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{msg.title}</h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(msg.time)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{msg.preview}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Layout>
  );
}
