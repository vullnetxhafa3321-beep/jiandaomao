import type { RescueStatus } from '../types';

export const STATUS_LABELS: Record<RescueStatus, string> = {
  discovered: '刚发现',
  saved: '已控制',
  hospital: '送医中',
  treated: '已检查',
  adoption: '待领养',
  homeward: '已回家',
  closed: '已结案',
};

export const STATUS_COLORS: Record<RescueStatus, string> = {
  discovered: 'bg-orange-100 text-orange-600',
  saved: 'bg-blue-100 text-blue-600',
  hospital: 'bg-purple-100 text-purple-600',
  treated: 'bg-green-100 text-green-600',
  adoption: 'bg-pink-100 text-pink-600',
  homeward: 'bg-teal-100 text-teal-600',
  closed: 'bg-gray-100 text-gray-500',
};

export const STATUS_ORDER: RescueStatus[] = [
  'discovered',
  'saved',
  'hospital',
  'treated',
  'adoption',
  'homeward',
  'closed',
];

export const SHARE_TITLES: Record<RescueStatus, string> = {
  discovered: '我捡到猫了但要不起，求支招🐱',
  saved: '救了！一只猫被我安全控制住了',
  hospital: '正在送医，希望没事',
  treated: '检查完毕，等一个家',
  adoption: '上海 · 一只猫找领养',
  homeward: '小猫找到家了 🏠',
  closed: '救助已结案',
};

export function formatDistance(km?: number) {
  if (km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export function getProgressIndex(status: RescueStatus) {
  return STATUS_ORDER.indexOf(status);
}

export async function getLocation(): Promise<{ lat: number; lng: number; address: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: '北京市大兴区西红门镇（当前位置）',
        });
      },
      () => reject(new Error('定位失败，请允许位置权限')),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function defaultRescueLocation() {
  return {
    lat: 39.785,
    lng: 116.362,
    address: '北京市大兴区西红门镇',
  };
}

export function getShareUrl(rescueId: string) {
  return `${window.location.origin}/r/${rescueId}`;
}
