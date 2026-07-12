import type { Hospital } from '../types';

/**
 * 滴滴宠物专车入口
 * 统一跳转滴滴 SSO 登录页（宠物专车相关流程从此进入）
 */
export const DIDI_CONFIG = {
  /** 滴滴统一登录 / 宠物专车入口 */
  petTripUrl: 'http://sso.sts.didiglobal.com/login',

  /** 兼容旧字段：一律指向同一入口 */
  wechatUrlLink: 'http://sso.sts.didiglobal.com/login',
  appUniversalLink: 'http://sso.sts.didiglobal.com/login',
  petGuideFallbackUrl: 'http://sso.sts.didiglobal.com/login',
  iosAppStore: 'http://sso.sts.didiglobal.com/login',
  androidWebDownload: 'http://sso.sts.didiglobal.com/login',
};

export type EnvType = 'wechat' | 'ios' | 'android' | 'other';

export function detectEnv(): EnvType {
  const ua = navigator.userAgent.toLowerCase();
  if (/micromessenger/.test(ua)) return 'wechat';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'other';
}

type Dest = Pick<Hospital, 'lat' | 'lng' | 'name' | 'address'> & Partial<Hospital>;

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

function openUrl(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 一键叫滴滴宠物专车
 * 复制医院地址后打开滴滴 SSO 登录页
 */
export async function jumpToDidiPetTrip(
  hospital: Dest,
  onFallback?: (msg: string) => void,
  _from?: { lat?: number; lng?: number }
): Promise<string> {
  const destText = `${hospital.name} ${hospital.address}`;
  await copyToClipboard(destText);

  openUrl(DIDI_CONFIG.petTripUrl);
  onFallback?.(
    '目的地已复制。已打开滴滴登录页，登录后请使用「宠物出行」并粘贴医院地址'
  );
  return 'didi_sso_login';
}

/** 直接打开滴滴宠物专车入口 */
export function openDidiOfficial() {
  openUrl(DIDI_CONFIG.petTripUrl);
}

export function getMapNavUrl(hospital: Hospital, env: EnvType) {
  const { lat, lng, name } = hospital;
  if (env === 'ios') {
    return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`;
  }
  return `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&coordinate=gaode`;
}
