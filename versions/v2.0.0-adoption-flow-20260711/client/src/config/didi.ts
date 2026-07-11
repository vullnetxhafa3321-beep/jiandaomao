import type { Hospital } from '../types';

/**
 * 滴滴宠物出行 — 真实可用跳转链路
 * 官方小程序 AppID: wxaf35009675aa0b2a（滴滴出行）
 * App 包名: com.sdu.didi.psnger / iOS App Store id554499054
 *
 * 说明：滴滴未公开「宠物出行」子页的稳定 deeplink，
 * 策略为：唤起滴滴 App/小程序并带上医院目的地 → 引导用户点「宠物出行」。
 */
export const DIDI_CONFIG = {
  /** 微信小程序 AppID（滴滴出行官方） */
  miniProgramAppId: 'wxaf35009675aa0b2a',

  /**
   * 微信内打开滴滴小程序的 Short Link（官方分享链）
   * 真机微信中可直接唤起「滴滴出行」小程序
   */
  wechatShortLink: '#小程序://滴滴出行丨打车骑行火车租车代驾/O0XDqP6JaIWJXRc',

  /**
   * 微信 URL Link / H5 入口（浏览器或微信内均可尝试打开滴滴）
   * https://v.didi.cn 为滴滴官方 Universal Link 网关
   */
  wechatUrlLink: 'https://v.didi.cn/p/passenger',

  /** 官方 App Universal Link（唤起乘客端） */
  appUniversalLink: 'https://v.didi.cn/',

  /**
   * App Scheme：打开打车发单页并预填目的地
   * 用户到达后点首页「宠物出行」即可叫宠物专车/快车
   */
  appSchemeTemplate:
    'OneTravel://dache/sendorder?dlat={lat}&dlon={lng}&dname={name}&from_lat={fromLat}&from_lng={fromLng}&source=jiandaomao_pet',

  /** Android Intent（未装 App 时跳应用商店） */
  androidIntentTemplate:
    'intent://dache/sendorder?dlat={lat}&dlon={lng}&dname={name}#Intent;scheme=OneTravel;package=com.sdu.didi.psnger;S.browser_fallback_url=https%3A%2F%2Fv.didi.cn%2F;end',

  /** 应用商店 */
  iosAppStore: 'https://apps.apple.com/cn/app/id554499054',
  androidMarket: 'market://details?id=com.sdu.didi.psnger',
  androidWebDownload: 'https://www.didiglobal.com/download',

  /** 图文指引备用页（外链打开滴滴官网下载/唤起） */
  petGuideFallbackUrl: 'https://v.didi.cn/',
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

function fill(template: string, hospital: Dest, from?: { lat?: number; lng?: number }) {
  return template
    .replace(/\{lat\}/g, String(hospital.lat))
    .replace(/\{lng\}/g, String(hospital.lng))
    .replace(/\{name\}/g, encodeURIComponent(hospital.name))
    .replace(/\{fromLat\}/g, from?.lat != null ? String(from.lat) : '')
    .replace(/\{fromLng\}/g, from?.lng != null ? String(from.lng) : '');
}

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
 * 一键叫滴滴宠物专车（多级真实链路）
 * 1. 复制医院地址
 * 2. 微信 → Short Link 打开滴滴小程序
 * 3. iOS/Android → App Scheme / Universal Link / Intent
 * 4. 降级 → 打开滴滴官方入口 + 指引
 */
export async function jumpToDidiPetTrip(
  hospital: Dest,
  onFallback?: (msg: string) => void,
  from?: { lat?: number; lng?: number }
): Promise<string> {
  const env = detectEnv();
  const destText = `${hospital.name} ${hospital.address}`;
  await copyToClipboard(destText);

  const tip =
    '目的地已复制。请在滴滴点「宠物出行」→ 粘贴医院地址 → 选宠物专车/快车';

  if (env === 'wechat') {
    // 微信内优先 Short Link（真实小程序链）
    try {
      window.location.href = DIDI_CONFIG.wechatShortLink;
    } catch {
      /* continue */
    }
    setTimeout(() => {
      window.location.href = DIDI_CONFIG.wechatUrlLink;
    }, 400);
    onFallback?.(tip);
    return 'wechat_miniprogram';
  }

  if (env === 'android') {
    const intent = fill(DIDI_CONFIG.androidIntentTemplate, hospital, from);
    const scheme = fill(DIDI_CONFIG.appSchemeTemplate, hospital, from);
    window.location.href = intent;
    setTimeout(() => {
      window.location.href = scheme;
    }, 600);
    setTimeout(() => {
      openUrl(DIDI_CONFIG.appUniversalLink);
      onFallback?.(tip);
    }, 1600);
    return 'android_intent';
  }

  if (env === 'ios') {
    const scheme = fill(DIDI_CONFIG.appSchemeTemplate, hospital, from);
    window.location.href = scheme;
    setTimeout(() => {
      // Universal Link 唤起 App；失败则仍停留在浏览器
      window.location.href = DIDI_CONFIG.appUniversalLink;
      onFallback?.(tip);
    }, 1200);
    return 'ios_scheme';
  }

  // 桌面 / 其他：打开滴滴官方入口，并复制地址
  openUrl(DIDI_CONFIG.appUniversalLink);
  onFallback?.(
    `${tip}（也可打开滴滴 App → 首页「宠物出行」或「更多服务」→「宠物出行」）`
  );
  return 'h5_universal';
}

/** 直接打开滴滴官方入口（不含目的地参数） */
export function openDidiOfficial() {
  openUrl(DIDI_CONFIG.appUniversalLink);
}

export function getMapNavUrl(hospital: Hospital, env: EnvType) {
  const { lat, lng, name } = hospital;
  if (env === 'ios') {
    return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`;
  }
  return `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&coordinate=gaode`;
}
