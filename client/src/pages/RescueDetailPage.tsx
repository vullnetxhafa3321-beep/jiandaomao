import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Rescue, RescueEvent, ReportImage } from '../types';
import type { RescueStatus } from '../types';
import {
  Layout,
  BackHeader,
  StatusBadge,
  ProgressBar,
  DidiCard,
  useToast,
} from '../components/UI';
import {
  getShareUrl,
  SHARE_TITLES,
  formatTimeAgo,
} from '../utils/helpers';
import {
  jumpToDidiPetTrip,
  copyToClipboard,
  getMapNavUrl,
  detectEnv,
} from '../config/didi';

export default function RescueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [rescue, setRescue] = useState<Rescue | null>(null);
  const [events, setEvents] = useState<RescueEvent[]>([]);
  const [reports, setReports] = useState<ReportImage[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { show, toast } = useToast();

  const load = () => {
    if (!id) return;
    api
      .getRescue(id)
      .then((data) => {
        setRescue(data.rescue);
        setEvents(data.events);
        setReports(data.reports);
        setIsOwner(data.is_owner);
        document.title = `${SHARE_TITLES[data.rescue.status as RescueStatus]} - 捡到猫`;
      })
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatus = async (status: string) => {
    if (!id) return;
    try {
      const { rescue: updated } = await api.updateStatus(id, status);
      setRescue(updated);
      load();
      show('状态已更新');
    } catch (e) {
      show(e instanceof Error ? e.message : '操作失败');
    }
  };

  const handleShare = async () => {
    const url = getShareUrl(id!);
    await copyToClipboard(url);
    if (navigator.share) {
      try {
        await navigator.share({
          title: SHARE_TITLES[rescue!.status as RescueStatus],
          text: rescue!.content.slice(0, 50),
          url,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    show('链接已复制，可分享到微信群');
  };

  const handleDidi = async () => {
    if (!rescue?.hospital || !id) return;
    const channel = await jumpToDidiPetTrip(rescue.hospital, show);
    api.logDidiJump(id, rescue.hospital.id, channel).catch(() => {});
  };

  const handleCopyAddress = async () => {
    if (!rescue?.hospital) return;
    await copyToClipboard(rescue.hospital.address);
    show('地址已复制');
  };

  const renderAction = () => {
    if (!isOwner || !rescue) return null;
    const { status } = rescue;

    if (status === 'discovered') {
      return (
        <button className="fab-main w-full py-3 rounded-2xl font-bold" onClick={() => handleStatus('saved')}>
          猫已安全控制 · 救了
        </button>
      );
    }
    if (status === 'saved') {
      return (
        <button className="fab-main w-full py-3 rounded-2xl font-bold" onClick={() => navigate(`/r/${id}/hospital`)}>
          准备去医院
        </button>
      );
    }
    if (status === 'hospital') {
      return (
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm font-bold text-gray-600 mb-1 block">上传检查报告</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-sm"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files?.length || !id) return;
                const fd = new FormData();
                Array.from(files).forEach((f) => fd.append('images', f));
                try {
                  const { rescue: updated } = await api.uploadReports(id, fd);
                  setRescue(updated);
                  load();
                  show('报告已上传');
                } catch (err) {
                  show(err instanceof Error ? err.message : '上传失败');
                }
              }}
            />
          </label>
          <button className="clay-btn-yellow w-full py-3 rounded-2xl font-bold" onClick={() => handleStatus('treated')}>
            已到院 / 已检查
          </button>
        </div>
      );
    }
    if (status === 'treated') {
      return (
        <div className="flex gap-2">
          <button className="fab-main flex-1 py-3 rounded-2xl font-bold text-sm" onClick={() => handleStatus('adoption')}>
            开放领养
          </button>
          <button className="clay-btn-yellow flex-1 py-3 rounded-2xl font-bold text-sm" onClick={() => handleStatus('homeward')}>
            自己带回家
          </button>
        </div>
      );
    }
    if (status === 'adoption' || status === 'homeward') {
      return (
        <button className="clay-btn-yellow w-full py-3 rounded-2xl font-bold" onClick={() => handleStatus('closed')}>
          结案
        </button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-20 text-gray-400">加载中...</p>
      </Layout>
    );
  }

  if (!rescue) {
    return (
      <Layout>
        <p className="text-center py-20 text-gray-400">记录不存在</p>
      </Layout>
    );
  }

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="救助详情" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <div className="clay-card-white p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{rescue.user?.avatar_url}</span>
              <div>
                <p className="font-bold">{rescue.user?.nickname}</p>
                <p className="text-xs text-gray-400">{formatTimeAgo(rescue.created_at)}</p>
              </div>
            </div>
            <StatusBadge status={rescue.status} />
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto">
            {rescue.images.map((img, i) => (
              <div key={i} className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-3xl">
                {img.startsWith('/') ? <img src={img} alt="" className="w-full h-full object-cover" /> : img}
              </div>
            ))}
          </div>

          <p className="text-gray-700 font-medium">{rescue.content}</p>
          <p className="text-xs text-gray-400 mt-2">📍 {rescue.address_display}</p>

          {rescue.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {rescue.tags.map((t) => (
                <span key={t} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
          )}
        </div>

        <div className="clay-card-white p-4">
          <h3 className="font-bold mb-2">救助进度</h3>
          <ProgressBar status={rescue.status} />
          {renderAction()}
        </div>

        {rescue.hospital && (
          <DidiCard
            hospital={rescue.hospital}
            onCallDidi={handleDidi}
            onCopy={handleCopyAddress}
          />
        )}

        {rescue.hospital && (
          <a
            href={getMapNavUrl(rescue.hospital, detectEnv())}
            target="_blank"
            rel="noreferrer"
            className="block text-center clay-btn-yellow py-3 rounded-2xl font-bold text-sm"
          >
            🗺️ 导航去医院
          </a>
        )}

        <div className="flex gap-2">
          <button className="clay-btn-yellow flex-1 py-3 rounded-2xl font-bold text-sm" onClick={handleShare}>
            📤 分享链接
          </button>
          <Link to={`/r/${id}/archive`} className="clay-card-blue flex-1 py-3 rounded-2xl font-bold text-sm text-center">
            📋 查看档案
          </Link>
        </div>

        <div className="clay-card-white p-4">
          <h3 className="font-bold mb-3">时间线</h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">
                    <StatusBadge status={ev.to_status} />
                    {ev.note && <span className="ml-2 text-gray-500">{ev.note}</span>}
                  </p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(ev.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {reports.length > 0 && (
          <div className="clay-card-white p-4">
            <h3 className="font-bold mb-2">检查报告</h3>
            <div className="flex gap-2 flex-wrap">
              {reports.map((r) => (
                <img key={r.id} src={r.url} alt="报告" className="w-20 h-20 rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
