import type { ForumStatus, AdoptionStatus, PetType } from '../types';

export const FORUM_STATUS: Record<ForumStatus, { label: string; color: string }> = {
  found: { label: '🔴 待救助', color: 'bg-red-50 text-red-600' },
  rescued: { label: '🟢 已救助', color: 'bg-green-50 text-green-600' },
  adopted: { label: '🏠 已领养', color: 'bg-blue-50 text-blue-600' },
};

export const ADOPTION_STATUS: Record<AdoptionStatus, { label: string; color: string }> = {
  available: { label: '待领养', color: 'bg-green-50 text-green-700' },
  pending: { label: '审核中', color: 'bg-amber-50 text-amber-700' },
  adopted: { label: '已领养', color: 'bg-gray-100 text-gray-500' },
};

export const GENDER_LABELS: Record<string, string> = {
  male: '♂ 公',
  female: '♀ 母',
  unknown: '性别未知',
};

export const PET_TYPE_LABELS: Record<PetType, string> = {
  cat: '🐱 猫',
  dog: '🐶 狗',
  other: '🐰 其他',
};

export const PET_TYPE_EMOJI: Record<PetType, string> = {
  cat: '🐱',
  dog: '🐶',
  other: '🐰',
};

export function amapNavUrl(lng: number, lat: number, name?: string) {
  const dest = name ? `${lng},${lat},${name}` : `${lng},${lat}`;
  return `https://uri.amap.com/navigation?to=${dest}`;
}
