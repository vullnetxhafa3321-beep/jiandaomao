/**
 * Neko Atsume–style cat head SVGs for map pins.
 * Thick warm outline, oval head, triangle ears, "w" muzzle, flat fills.
 */

const O = '#5C4033';

export type NekoCoat =
  | 'white'
  | 'cream'
  | 'grey'
  | 'black'
  | 'orange'
  | 'tabby-orange'
  | 'tabby-grey'
  | 'tabby-brown'
  | 'tuxedo'
  | 'grey-white'
  | 'calico'
  | 'tortie'
  | 'point'
  | 'patch-orange'
  | 'patch-black'
  | 'snowshoe';

export const NEKO_COATS: NekoCoat[] = [
  'white',
  'cream',
  'grey',
  'black',
  'orange',
  'tabby-orange',
  'tabby-grey',
  'tabby-brown',
  'tuxedo',
  'grey-white',
  'calico',
  'tortie',
  'point',
  'patch-orange',
  'patch-black',
  'snowshoe',
];

/** Stable coat from any id string */
export function coatFromId(id: string): NekoCoat {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return NEKO_COATS[h % NEKO_COATS.length];
}

/** Prefer breed-matching coat when known */
export function coatFromBreed(breed?: string, fallbackId = ''): NekoCoat {
  const b = (breed || '').toLowerCase();
  if (/奶牛|礼服|黑白|tuxedo/.test(b)) return 'tuxedo';
  if (/三花|calico/.test(b)) return 'calico';
  if (/玳瑁|tortie/.test(b)) return 'tortie';
  if (/橘|橙|姜|ginger|orange/.test(b)) return 'tabby-orange';
  if (/狸花|简州|tabby/.test(b)) return 'tabby-grey';
  if (/灰/.test(b)) return 'grey';
  if (/黑/.test(b)) return 'black';
  if (/白|狮子/.test(b)) return 'white';
  if (/暹罗|重点|point/.test(b)) return 'point';
  return coatFromId(fallbackId || breed || 'neko');
}

function ears(fill: string, inner?: string) {
  const inn = inner
    ? `<path d="M6.8 8.8 5.6 6.2 8.4 7.4Z" fill="${inner}"/><path d="M17.2 8.8 18.4 6.2 15.6 7.4Z" fill="${inner}"/>`
    : '';
  return `<path d="M6.2 9.2 4.6 5.2 9 7.2Z" fill="${fill}" stroke="${O}" stroke-width="1.35" stroke-linejoin="round"/><path d="M17.8 9.2 19.4 5.2 15 7.2Z" fill="${fill}" stroke="${O}" stroke-width="1.35" stroke-linejoin="round"/>${inn}`;
}

function head(fill: string) {
  return `<ellipse cx="12" cy="13.2" rx="7.4" ry="6.5" fill="${fill}" stroke="${O}" stroke-width="1.5"/>`;
}

function face(opts?: { closed?: boolean; leftEye?: string; rightEye?: string }) {
  const closed = opts?.closed;
  const le = opts?.leftEye || O;
  const re = opts?.rightEye || O;
  if (closed) {
    return `<path d="M8.6 12.4c.7.55 1.6.55 2.3 0" fill="none" stroke="${O}" stroke-width="1.25" stroke-linecap="round"/><path d="M13.1 12.4c.7.55 1.6.55 2.3 0" fill="none" stroke="${O}" stroke-width="1.25" stroke-linecap="round"/><path d="M11.1 14.1c.4.5 1.4.5 1.8 0" fill="none" stroke="${O}" stroke-width="1.1" stroke-linecap="round"/>`;
  }
  return `<circle cx="9.5" cy="12.5" r="1.05" fill="${le}"/><circle cx="14.5" cy="12.5" r="1.05" fill="${re}"/><path d="M11.15 14.15c.4.5 1.3.5 1.7 0" fill="none" stroke="${O}" stroke-width="1.1" stroke-linecap="round"/>`;
}

function stripes(color: string) {
  return `<path d="M9.2 8.6c.4 1.2.6 2 .4 2.8" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round"/><path d="M12 8.2c0 1.4.1 2.4 0 3.2" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round"/><path d="M14.8 8.6c-.4 1.2-.6 2-.4 2.8" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round"/>`;
}

/** Full 24×24 SVG inner markup for a coat */
export function nekoHeadInner(coat: NekoCoat): string {
  switch (coat) {
    case 'white':
      return `${ears('#FFF8F0', '#F5E0D0')}${head('#FFF8F0')}${face({ closed: true })}`;
    case 'cream':
      return `${ears('#F5E6D3', '#E8C4A8')}${head('#F5E6D3')}${face()}`;
    case 'grey':
      return `${ears('#A8B0B8', '#8A929A')}${head('#C5CCD4')}${face()}`;
    case 'black':
      return `${ears('#2A2A2A')}${head('#2A2A2A')}${face({ leftEye: '#F5D76E', rightEye: '#F5D76E' })}`;
    case 'orange':
      return `${ears('#E8956A', '#D4784A')}${head('#F4B183')}${face()}`;
    case 'tabby-orange':
      return `${ears('#E8956A', '#D4784A')}${head('#F4B183')}${stripes('#D4784A')}${face()}`;
    case 'tabby-grey':
      return `${ears('#8A929A')}${head('#B8C0C8')}${stripes('#6A727A')}${face()}`;
    case 'tabby-brown':
      return `${ears('#8B6914')}${head('#C4A35A')}${stripes('#8B6914')}${face()}`;
    case 'tuxedo':
      return `${ears('#2A2A2A')}${head('#2A2A2A')}<ellipse cx="12" cy="15.2" rx="4.2" ry="3.2" fill="#FFF8F0"/><path d="M8.2 11.2h7.6" fill="none" stroke="#FFF8F0" stroke-width="3.2" stroke-linecap="round"/>${face()}`;
    case 'grey-white':
      return `${ears('#8A929A')}${head('#A8B0B8')}<ellipse cx="12" cy="15.4" rx="4" ry="3" fill="#FFF8F0"/>${face()}`;
    case 'calico':
      return `${ears('#F4B183', '#2A2A2A')}${head('#FFF8F0')}<path d="M5.5 11.5c1.5-2 4-2.5 5-.2Z" fill="#F4B183"/><path d="M13.5 9.5c2-.5 4.5.8 5 2.8-1.5 1-3.5 1.2-5 .2Z" fill="#2A2A2A"/><path d="M9 16.5c1.2 1.5 3.5 1.2 4.2-.2Z" fill="#F4B183"/>${face()}`;
    case 'tortie':
      return `${ears('#2A2A2A', '#E8956A')}${head('#3A3030')}<path d="M6 12c2-2.5 4.5-1.5 5 .5Z" fill="#E8956A"/><path d="M14 10.5c2-1 4 .5 4.5 2.5Z" fill="#C4784A"/><path d="M10 16c1.5 1.2 3.2.8 3.5-.5Z" fill="#E8956A"/>${face()}`;
    case 'point':
      return `${ears('#6B4A2A')}${head('#F5E6D3')}<ellipse cx="12" cy="13.5" rx="4.5" ry="4" fill="#8B6914" opacity=".85"/><ellipse cx="12" cy="14.8" rx="3.2" ry="2.4" fill="#F5E6D3"/>${face()}`;
    case 'patch-orange':
      return `${ears('#FFF8F0', '#F4B183')}${head('#FFF8F0')}<ellipse cx="9" cy="11.5" rx="3.2" ry="3" fill="#F4B183"/>${face()}`;
    case 'patch-black':
      return `${ears('#FFF8F0', '#2A2A2A')}${head('#FFF8F0')}<ellipse cx="15" cy="11.2" rx="3" ry="2.8" fill="#2A2A2A"/>${face()}`;
    case 'snowshoe':
      return `${ears('#4A3A2A')}${head('#FFF8F0')}<path d="M5.8 10.5c1.2-1.8 3.5-2 4.2-.2L8.5 14Z" fill="#5C4033"/><path d="M18.2 10.5c-1.2-1.8-3.5-2-4.2-.2L15.5 14Z" fill="#5C4033"/>${face({ leftEye: '#F5D76E', rightEye: '#70C8C8' })}`;
    default:
      return `${ears('#F5E6D3')}${head('#F5E6D3')}${face()}`;
  }
}

export function nekoHeadSvgMarkup(coat: NekoCoat, size = 28): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${nekoHeadInner(coat)}</svg>`;
}

/** Leaflet pin HTML — white ring, soft shadow, varied cat head */
export function mapNekoPinHtml(coat: NekoCoat, bg = '#FFF6EB'): string {
  const common =
    'width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(92,64,51,0.28);box-sizing:border-box;';
  return `<div style="${common}background:${bg}">${nekoHeadSvgMarkup(coat, 30)}</div>`;
}

function pinShell(bg: string, svgInner: string): string {
  const common =
    'width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(92,64,51,0.28);box-sizing:border-box;';
  return `<div style="${common}background:${bg}"><svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">${svgInner}</svg></div>`;
}

/** Hospital: clinic building + red cross (no cat) */
function hospitalPinSvg() {
  return `<rect x="4" y="8" width="16" height="12" rx="1.5" fill="#FFFFFF" stroke="${O}" stroke-width="1.5"/><path d="M4 11h16" stroke="${O}" stroke-width="1.2"/><rect x="9.5" y="3.5" width="5" height="5" rx="0.8" fill="#FFFFFF" stroke="${O}" stroke-width="1.3"/><path d="M12 4.5v3M10.5 6h3" stroke="#E85A5A" stroke-width="1.6" stroke-linecap="round"/><path d="M11 14h2v4h-2z" fill="#E85A5A"/><path d="M10 15.5h4v1.2h-4z" fill="#E85A5A"/><rect x="6.2" y="13.2" width="2.2" height="2.2" rx="0.3" fill="#C9E4F7" stroke="${O}" stroke-width="0.8"/><rect x="15.6" y="13.2" width="2.2" height="2.2" rx="0.3" fill="#C9E4F7" stroke="${O}" stroke-width="0.8"/>`;
}

/** Shelter: house with heart (no cat) */
function shelterPinSvg() {
  return `<path d="M4 12 12 4.8 20 12" fill="#E8C4A0" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.2 11.2V19.2h11.6v-8" fill="#FFF6EB" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/><path d="M10.2 19.2v-4.2h3.6v4.2" fill="#D4E8C2" stroke="${O}" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 11.2c-1-.9-2.5-.3-2.5 1.1 0 1.6 2.5 2.9 2.5 2.9s2.5-1.3 2.5-2.9c0-1.4-1.5-2-2.5-1.1Z" fill="#E85A7A" stroke="${O}" stroke-width="1.1" stroke-linejoin="round"/>`;
}

/** Map pins: cats only for forum/user; hospital & shelter stay institutional */
export function mapPinHtmlByKind(
  kind: 'forum' | 'hospital' | 'shelter' | 'user',
  coat?: NekoCoat
): string {
  if (kind === 'hospital') {
    return pinShell('#E8F5E9', hospitalPinSvg());
  }
  if (kind === 'shelter') {
    return pinShell('#E3F2FD', shelterPinSvg());
  }
  if (kind === 'user') {
    return mapNekoPinHtml(coat || 'white', '#BBDEFB');
  }
  return mapNekoPinHtml(coat || 'orange', '#FFEBEE');
}
