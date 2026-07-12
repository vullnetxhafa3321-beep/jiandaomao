import type { SVGProps, ReactElement } from 'react';

/**
 * Neko Atsume–inspired icons: thick warm outlines, bean bodies,
 * dot eyes, flat pastel fills. Used across nav, map pins, badges.
 */
export type IconName =
  | 'home' | 'paw' | 'map-pin' | 'compass' | 'user'
  | 'megaphone' | 'hospital' | 'flag' | 'book' | 'shield'
  | 'heart' | 'camera' | 'search' | 'plus' | 'chat'
  | 'chevron-left' | 'chevron-right' | 'close' | 'check' | 'car'
  | 'shelter';

const OUTLINE = '#5C4033';

/** Shared cute cat face helpers as SVG fragments */
function catFace({
  body = '#F5E6D3',
  ear = '#E8C4A8',
  eyeClosed = false,
}: {
  body?: string;
  ear?: string;
  eyeClosed?: boolean;
} = {}) {
  return (
    <>
      {/* ears */}
      <path d="M7 9.5 5.2 5.5 9.2 7.2Z" fill={ear} stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M17 9.5 18.8 5.5 14.8 7.2Z" fill={ear} stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" />
      {/* head */}
      <ellipse cx="12" cy="13" rx="7.2" ry="6.4" fill={body} stroke={OUTLINE} strokeWidth="1.5" />
      {/* eyes */}
      {eyeClosed ? (
        <>
          <path d="M8.8 12.2c.6.5 1.4.5 2 0" fill="none" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M13.2 12.2c.6.5 1.4.5 2 0" fill="none" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="9.6" cy="12.4" r="1.05" fill={OUTLINE} />
          <circle cx="14.4" cy="12.4" r="1.05" fill={OUTLINE} />
        </>
      )}
      {/* nose / mouth */}
      <path d="M12 13.6c-.35.45-.9.45-1.25 0" fill="none" stroke={OUTLINE} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12 13.6c.35.45.9.45 1.25 0" fill="none" stroke={OUTLINE} strokeWidth="1.1" strokeLinecap="round" />
    </>
  );
}

const paths: Record<Exclude<IconName, 'paw'>, ReactElement> = {
  /* 我的 — cream cat */
  user: catFace({ body: '#FFF6EB', ear: '#F0D0B8' }),

  /* 地图 — pin with cat head */
  'map-pin': (
    <>
      <path
        d="M12 21s-6.5-5.2-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.8 12 21 12 21Z"
        fill="#B8D9F0"
        stroke={OUTLINE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="12" cy="10.2" rx="4.2" ry="3.8" fill="#FFF6EB" stroke={OUTLINE} strokeWidth="1.3" />
      <path d="M9.3 8.2 8.2 5.8 10.6 6.9Z" fill="#F0D0B8" stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M14.7 8.2 15.8 5.8 13.4 6.9Z" fill="#F0D0B8" stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
      <circle cx="10.6" cy="10" r="0.7" fill={OUTLINE} />
      <circle cx="13.4" cy="10" r="0.7" fill={OUTLINE} />
      <path d="M11.3 11.1c.3.35.8.35 1.1 0" fill="none" stroke={OUTLINE} strokeWidth="0.9" strokeLinecap="round" />
    </>
  ),

  /* 流浪求助 / compass — curious tabby peeking */
  compass: (
    <>
      <circle cx="12" cy="12" r="9" fill="#FFF0E0" stroke={OUTLINE} strokeWidth="1.5" />
      <ellipse cx="12" cy="13.2" rx="5.5" ry="5" fill="#E8B888" stroke={OUTLINE} strokeWidth="1.3" />
      <path d="M8.2 10.2 6.8 6.8 10 8.4Z" fill="#D49A6A" stroke={OUTLINE} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M15.8 10.2 17.2 6.8 14 8.4Z" fill="#D49A6A" stroke={OUTLINE} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M10 11.5h.01M14 11.5h.01" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.2 13c.4.5 1.2.5 1.6 0" fill="none" stroke={OUTLINE} strokeWidth="1" strokeLinecap="round" />
      <path d="M9.5 14.8c1 .8 2.5.8 3.5 0" fill="none" stroke="#C4885A" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </>
  ),

  /* 待领养 — cat with heart */
  heart: (
    <>
      {catFace({ body: '#FFD6E0', ear: '#F5B0C0' })}
      <path
        d="M17.5 7.2c-1.1-1.1-2.9-.4-2.9 1.1 0 1.8 2.9 3.2 2.9 3.2s2.9-1.4 2.9-3.2c0-1.5-1.8-2.2-2.9-1.1Z"
        fill="#E85A7A"
        stroke={OUTLINE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </>
  ),

  /* 我捡到猫了 / paw — 品牌 Logo（Icon 组件内用 img 渲染，不走 SVG paths） */

  /* 求助 / megaphone — worried orange cat with ! */
  megaphone: (
    <>
      {catFace({ body: '#F4B183', ear: '#E8956A' })}
      <circle cx="18.2" cy="7.2" r="3.2" fill="#FFE8A3" stroke={OUTLINE} strokeWidth="1.3" />
      <path d="M18.2 5.6v2.2" stroke={OUTLINE} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="18.2" cy="9.1" r="0.55" fill={OUTLINE} />
    </>
  ),

  /* 医院 — clinic building + red cross (no cat) */
  hospital: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="1.5" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M4 11h16" stroke={OUTLINE} strokeWidth="1.2" />
      <rect x="9.5" y="3.5" width="5" height="5" rx="0.8" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="1.3" />
      <path d="M12 4.5v3M10.5 6h3" stroke="#E85A5A" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 14h2v4h-2z" fill="#E85A5A" />
      <path d="M10 15.5h4v1.2h-4z" fill="#E85A5A" />
      <rect x="6.2" y="13.2" width="2.2" height="2.2" rx="0.3" fill="#C9E4F7" stroke={OUTLINE} strokeWidth="0.8" />
      <rect x="15.6" y="13.2" width="2.2" height="2.2" rx="0.3" fill="#C9E4F7" stroke={OUTLINE} strokeWidth="0.8" />
    </>
  ),

  /* 救助站 — 爱心小屋（对齐设计稿：米屋顶 / 奶油墙 / 薄荷绿门 / 粉心） */
  shelter: (
    <>
      <path d="M3.5 11.5 12 4 20.5 11.5" fill="#E5D0A8" stroke={OUTLINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5.5 11V19.5h13V11" fill="#FFF8F0" stroke={OUTLINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10.2 19.5v-4.5h3.6v4.5" fill="#A8D5C0" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d="M12 10.6c-1.15-1.05-2.85-.35-2.85 1.25 0 1.85 2.85 3.35 2.85 3.35s2.85-1.5 2.85-3.35c0-1.6-1.7-2.3-2.85-1.25Z"
        fill="#F2A0B4"
        stroke={OUTLINE}
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </>
  ),

  home: (
    <>
      <path d="M4 12 12 4.8 20 12v7.2a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 19.2V12Z" fill="#FFE8C8" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="12" cy="14.5" rx="4" ry="3.6" fill="#F5E6D3" stroke={OUTLINE} strokeWidth="1.2" />
      <circle cx="10.5" cy="14" r="0.7" fill={OUTLINE} />
      <circle cx="13.5" cy="14" r="0.7" fill={OUTLINE} />
      <path d="M11.3 15.2c.35.4 1.05.4 1.4 0" fill="none" stroke={OUTLINE} strokeWidth="1" strokeLinecap="round" />
    </>
  ),

  flag: (
    <>
      {catFace({ body: '#E8D4F0', ear: '#D0B8E0', eyeClosed: true })}
      <path d="M18 5v8" stroke={OUTLINE} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 5.5h4l-1.2 2 1.2 2H18" fill="#7EB8E8" stroke={OUTLINE} strokeWidth="1.1" strokeLinejoin="round" />
    </>
  ),

  book: (
    <>
      <path d="M5 5.2h12.5v14H6.2A1.2 1.2 0 0 0 5 20.4V5.2Z" fill="#FFF8F0" stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" />
      <ellipse cx="12.5" cy="12" rx="4" ry="3.6" fill="#F4B183" stroke={OUTLINE} strokeWidth="1.2" />
      <circle cx="11" cy="11.5" r="0.65" fill={OUTLINE} />
      <circle cx="14" cy="11.5" r="0.65" fill={OUTLINE} />
      <path d="M11.8 12.8c.3.35.9.35 1.2 0" fill="none" stroke={OUTLINE} strokeWidth="0.9" strokeLinecap="round" />
    </>
  ),

  shield: (
    <>
      <path d="M12 3.2 5 6v5.5c0 4.2 3.1 7.2 7 8.2 3.9-1 7-4 7-8.2V6l-7-2.8Z" fill="#D4E8C2" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="12" cy="11.5" rx="4" ry="3.5" fill="#FFF6EB" stroke={OUTLINE} strokeWidth="1.2" />
      <circle cx="10.5" cy="11" r="0.65" fill={OUTLINE} />
      <circle cx="13.5" cy="11" r="0.65" fill={OUTLINE} />
      <path d="M11.3 12.4c.35.4 1.05.4 1.4 0" fill="none" stroke={OUTLINE} strokeWidth="0.9" strokeLinecap="round" />
    </>
  ),

  camera: (
    <>
      <rect x="3.5" y="8" width="17" height="11" rx="2" fill="#E8F0F8" stroke={OUTLINE} strokeWidth="1.4" />
      <circle cx="12" cy="13.5" r="3.8" fill="#FFF6EB" stroke={OUTLINE} strokeWidth="1.3" />
      <circle cx="10.8" cy="13" r="0.7" fill={OUTLINE} />
      <circle cx="13.2" cy="13" r="0.7" fill={OUTLINE} />
      <path d="M11.3 14.3c.35.35.95.35 1.3 0" fill="none" stroke={OUTLINE} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M8 8 9.2 5.8h5.6L16 8" fill="#B8D9F0" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),

  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" fill="#FFF6EB" stroke={OUTLINE} strokeWidth="1.5" />
      <ellipse cx="10.5" cy="11" rx="3.5" ry="3.1" fill="#F5E6D3" stroke={OUTLINE} strokeWidth="1.1" />
      <circle cx="9.3" cy="10.6" r="0.55" fill={OUTLINE} />
      <circle cx="11.7" cy="10.6" r="0.55" fill={OUTLINE} />
      <path d="M9.9 11.8c.3.3.8.3 1.1 0" fill="none" stroke={OUTLINE} strokeWidth="0.85" strokeLinecap="round" />
      <path d="m15.2 15.2 4.3 4.3" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),

  plus: (
    <>
      <circle cx="12" cy="12" r="9" fill="#C9E4F7" stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M12 7.5v9M7.5 12h9" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  chat: (
    <>
      <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-5.5L9 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z" fill="#FFF6EB" stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="0.9" fill={OUTLINE} />
      <circle cx="12" cy="11" r="0.9" fill={OUTLINE} />
      <circle cx="15" cy="11" r="0.9" fill={OUTLINE} />
    </>
  ),

  'chevron-left': <path d="m14.5 6-6 6 6 6" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  'chevron-right': <path d="m9.5 6 6 6-6 6" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="M6 6l12 12M18 6 6 18" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />,
  check: <path d="m5 12 4.5 4.5L19 7" fill="none" stroke={OUTLINE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,

  car: (
    <>
      <path d="M4 15.5v-2l1.6-4.2A1.8 1.8 0 0 1 7.3 8h9.4a1.8 1.8 0 0 1 1.7 1.3L20 13.5v2" fill="#B8D9F0" stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="3.5" y="14.5" width="17" height="4" rx="1.2" fill="#7EB8E8" stroke={OUTLINE} strokeWidth="1.3" />
      <circle cx="8" cy="18.5" r="1.5" fill={OUTLINE} />
      <circle cx="16" cy="18.5" r="1.5" fill={OUTLINE} />
      <ellipse cx="12" cy="11.5" rx="2.2" ry="1.8" fill="#FFF6EB" stroke={OUTLINE} strokeWidth="1" />
      <circle cx="11.2" cy="11.2" r="0.35" fill={OUTLINE} />
      <circle cx="12.8" cy="11.2" r="0.35" fill={OUTLINE} />
    </>
  ),
};

type IconTone = 'cream' | 'wood' | 'coral' | 'grass' | 'sky' | 'ink' | 'ghost';

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = '',
  ...rest
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number; strokeWidth?: number }) {
  /* 品牌 Logo：替换原猫爪图标 */
  if (name === 'paw') {
    return (
      <img
        src="/icons/logo-jiandaomao.png"
        alt=""
        width={size}
        height={size}
        className={`brand-logo-icon ${className}`.trim()}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
        draggable={false}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

const toneClass: Record<IconTone, string> = {
  cream: 'town-badge-cream',
  wood: 'town-badge-wood',
  coral: 'town-badge-coral',
  grass: 'town-badge-grass',
  sky: 'town-badge-sky',
  ink: 'town-badge-ink',
  ghost: 'town-badge-ghost',
};

export function IconBadge({
  name,
  tone = 'cream',
  size = 36,
  className = '',
}: {
  name: IconName;
  tone?: IconTone;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`town-badge ${toneClass[tone]} ${className}`} style={{ width: size, height: size }}>
      <Icon name={name} size={Math.round(size * 0.72)} />
    </span>
  );
}

/** Leaflet HTML snippets for map pins — same Neko style */
export function mapPinHtml(kind: 'forum' | 'hospital' | 'shelter' | 'user'): string {
  const common = `width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(92,64,51,0.28);box-sizing:border-box;`;
  if (kind === 'hospital') {
    return `<div style="${common}background:#E8F5E9"><svg viewBox="0 0 24 24" width="28" height="28">${svgHospital()}</svg></div>`;
  }
  if (kind === 'shelter') {
    return `<div style="${common}background:#D6EAF8;overflow:hidden;padding:3px"><img src="/icons/shelter-heart-home.png" width="34" height="34" alt="" style="width:100%;height:100%;object-fit:contain;display:block;border-radius:50%"/></div>`;
  }
  if (kind === 'user') {
    return `<div class="map-user-location-pin" aria-hidden="true"><svg viewBox="0 0 28 40" width="28" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#E53935" stroke="#B71C1C" stroke-width="1.2"/><circle cx="14" cy="14" r="5.5" fill="#fff"/><circle cx="14" cy="14" r="2.4" fill="#E53935"/></svg></div>`;
  }
  return `<div style="${common}background:#FFEBEE"><svg viewBox="0 0 24 24" width="28" height="28">${svgHelp()}</svg></div>`;
}

function svgHelp() {
  return `<path d="M7 9.5 5.2 5.5 9.2 7.2Z" fill="#E8956A" stroke="#5C4033" stroke-width="1.4" stroke-linejoin="round"/><path d="M17 9.5 18.8 5.5 14.8 7.2Z" fill="#E8956A" stroke="#5C4033" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="12" cy="13" rx="7.2" ry="6.4" fill="#F4B183" stroke="#5C4033" stroke-width="1.5"/><circle cx="9.6" cy="12.4" r="1.05" fill="#5C4033"/><circle cx="14.4" cy="12.4" r="1.05" fill="#5C4033"/><path d="M12 13.6c-.35.45-.9.45-1.25 0M12 13.6c.35.45.9.45 1.25 0" fill="none" stroke="#5C4033" stroke-width="1.1" stroke-linecap="round"/><circle cx="18.2" cy="7.2" r="3" fill="#FFE8A3" stroke="#5C4033" stroke-width="1.2"/><path d="M18.2 5.7v2" stroke="#5C4033" stroke-width="1.3" stroke-linecap="round"/><circle cx="18.2" cy="9" r=".5" fill="#5C4033"/>`;
}

function svgHospital() {
  return `<rect x="4" y="8" width="16" height="12" rx="1.5" fill="#fff" stroke="#5C4033" stroke-width="1.5"/><path d="M4 11h16" stroke="#5C4033" stroke-width="1.2"/><rect x="9.5" y="3.5" width="5" height="5" rx="0.8" fill="#fff" stroke="#5C4033" stroke-width="1.3"/><path d="M12 4.5v3M10.5 6h3" stroke="#E85A5A" stroke-width="1.6" stroke-linecap="round"/><path d="M11 14h2v4h-2z" fill="#E85A5A"/><path d="M10 15.5h4v1.2h-4z" fill="#E85A5A"/>`;
}

function svgShelter() {
  return `<path d="M4 12 12 4.8 20 12" fill="#E8C4A0" stroke="#5C4033" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.2 11.2V19.2h11.6v-8" fill="#FFF6EB" stroke="#5C4033" stroke-width="1.5"/><path d="M10.2 19.2v-4.2h3.6v4.2" fill="#D4E8C2" stroke="#5C4033" stroke-width="1.2"/><path d="M12 11.2c-1-.9-2.5-.3-2.5 1.1 0 1.6 2.5 2.9 2.5 2.9s2.5-1.3 2.5-2.9c0-1.4-1.5-2-2.5-1.1Z" fill="#E85A7A" stroke="#5C4033" stroke-width="1.1"/>`;
}

function svgUser() {
  return `<path d="M7 9.5 5.2 5.5 9.2 7.2Z" fill="#F0D0B8" stroke="#5C4033" stroke-width="1.3"/><path d="M17 9.5 18.8 5.5 14.8 7.2Z" fill="#F0D0B8" stroke="#5C4033" stroke-width="1.3"/><ellipse cx="12" cy="13" rx="7.2" ry="6.4" fill="#FFF6EB" stroke="#5C4033" stroke-width="1.4"/><circle cx="9.6" cy="12.4" r="1" fill="#5C4033"/><circle cx="14.4" cy="12.4" r="1" fill="#5C4033"/><path d="M12 13.6c-.35.45-.9.45-1.25 0M12 13.6c.35.45.9.45 1.25 0" fill="none" stroke="#5C4033" stroke-width="1.1" stroke-linecap="round"/>`;
}
