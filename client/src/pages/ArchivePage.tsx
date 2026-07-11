import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue, RescueEvent, ReportImage } from '../types';
import { Layout, BackHeader, StatusBadge } from '../components/UI';
import { formatTimeAgo, STATUS_LABELS } from '../utils/helpers';

export default function ArchivePage() {
  const { id } = useParams<{ id: string }>();
  const [rescue, setRescue] = useState<Rescue | null>(null);
  const [events, setEvents] = useState<RescueEvent[]>([]);
  const [reports, setReports] = useState<ReportImage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.getRescue(id).then((data) => {
      setRescue(data.rescue);
      setEvents(data.events);
      setReports(data.reports);
    });
  }, [id]);

  if (!rescue) {
    return (
      <Layout>
        <p className="text-center py-20 text-gray-400">加载中...</p>
      </Layout>
    );
  }

  return (
    <Layout className="pb-8">
      <BackHeader title="救助档案" onBack={() => navigate(`/r/${id}`)} />

      <div className="px-5 space-y-4">
        <div className="clay-card-white p-5">
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">
              {rescue.cover_url?.startsWith('/') ? (
                <img src={rescue.cover_url} alt="" className="w-20 h-20 rounded-2xl mx-auto object-cover" />
              ) : (
                rescue.cover_url || '🐱'
              )}
            </div>
            <h2 className="font-black text-xl text-brand-dark">救助档案</h2>
            <StatusBadge status={rescue.status} />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">救助者</span>
              <span className="font-bold">{rescue.user?.nickname}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">发现地点</span>
              <span className="font-medium text-right max-w-[60%]">{rescue.address_display}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">当前状态</span>
              <span className="font-bold">{STATUS_LABELS[rescue.status]}</span>
            </div>
            {rescue.hospital && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400">就诊医院</span>
                <span className="font-medium text-right max-w-[60%]">{rescue.hospital.name}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400">创建时间</span>
              <span>{formatTimeAgo(rescue.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="clay-card-white p-4">
          <h3 className="font-bold mb-2">情况描述</h3>
          <p className="text-sm text-gray-600">{rescue.content}</p>
        </div>

        {reports.length > 0 && (
          <div className="clay-card-white p-4">
            <h3 className="font-bold mb-3">检查报告</h3>
            <div className="grid grid-cols-3 gap-2">
              {reports.map((r) => (
                <img key={r.id} src={r.url} alt="报告" className="w-full aspect-square rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <div className="clay-card-white p-4">
          <h3 className="font-bold mb-3">完整时间线</h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="text-sm border-l-2 border-orange-200 pl-3">
                <p className="font-medium">{STATUS_LABELS[ev.to_status]}</p>
                {ev.note && <p className="text-gray-500">{ev.note}</p>}
                <p className="text-xs text-gray-400">{formatTimeAgo(ev.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
