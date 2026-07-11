import type { Hospital } from '../types';

export const DIDI_CONFIG = {
  miniProgramAppId: 'wxaf35009675aa0b2a',
  wechatUrlLink: '',
  shortLinkFallback: '#小程序://滴滴出行丨打车骑行火车租车代驾/O0XDqP6JaIWJXRc',
  appSchemeTemplate:
    'OneTravel://dache/sendorder?dlat={lat}&dlon={lng}&dname={name}&source=jiandaomao',
  appDownloadUrl: 'https://www.didiglobal.com/download',
};

export type EnvType = 'wechat' | 'ios' | 'android' | 'other';

export function detectEnv(): EnvType {
  const ua = navigator.userAgent.toLowerCase();
  if (/micromessenger/.test(ua)) return 'wechat';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'other';
}

function fillTemplate(template: string, hospital: Hospital) {
  return template
    .replace('{lat}', String(hospital.lat))
    .replace('{lng}', String(hospital.lng))
    .replace('{name}', encodeURIComponent(hospital.name));
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

export async function jumpToDidiPetTrip(
  hospital: Hospital,
  onFallback?: (msg: string) => void
): Promise<string> {
  const env = detectEnv();

  if (env === 'wechat' && DIDI_CONFIG.wechatUrlLink) {
    window.location.href = DIDI_CONFIG.wechatUrlLink;
    return 'wechat_mp';
  }

  if (DIDI_CONFIG.appSchemeTemplate && env !== 'wechat') {
    const scheme = fillTemplate(DIDI_CONFIG.appSchemeTemplate, hospital);
    window.location.href = scheme;
    setTimeout(async () => {
      await copyToClipboard(hospital.address);
      onFallback?.(
        '未能自动打开滴滴？地址已复制。请打开滴滴 App → 首页「宠物出行」→ 粘贴目的地'
      );
    }, 1500);
    return 'app_scheme';
  }

  await copyToClipboard(hospital.address);
  onFallback?.(
    '地址已复制。请打开滴滴 App 或微信搜索「滴滴出行」小程序 → 首页「宠物出行」→ 粘贴目的地'
  );
  return 'copy_fallback';
}

export function getMapNavUrl(hospital: Hospital, env: EnvType) {
  const { lat, lng, name, address } = hospital;
  if (env === 'ios') {
    return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`;
  }
  return `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&coordinate=gaode`;
}
