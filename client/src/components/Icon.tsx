import type { SVGProps, ReactElement } from 'react';

export type IconName =
  | 'home' | 'paw' | 'map-pin' | 'compass' | 'user'
  | 'megaphone' | 'hospital' | 'flag' | 'book' | 'shield'
  | 'heart' | 'camera' | 'search' | 'plus' | 'chat'
  | 'chevron-left' | 'chevron-right' | 'close' | 'check' | 'car'
  | 'shelter';

const paths: Record<IconName, ReactElement> = {
  home: (
    <>
      <path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-7.8Z" />
      <path d="M10 20.5v-5h4v5" />
    </>
  ),
  paw: (
    <>
      <circle cx="6.5" cy="10" r="1.8" />
      <circle cx="17.5" cy="10" r="1.8" />
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <path d="M12 12c-3 0-5 2.4-5 4.6 0 1.6 1.2 2.6 2.6 2.6.9 0 1.6-.4 2.4-.4s1.5.4 2.4.4c1.4 0 2.6-1 2.6-2.6 0-2.2-2-4.6-5-4.6Z" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 3.5c-3.9 0-7 3-7 6.8 0 5 7 10.2 7 10.2s7-5.2 7-10.2c0-3.8-3.1-6.8-7-6.8Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.2 8.8-4.6 1.8-1.8 4.6 4.6-1.8 1.8-4.6Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.4" />
      <path d="M5 20.5c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" />
    </>
  ),
  megaphone: (
    <>
      <path d="m4 14.5 12-5.5V19l-12-5.5Z" />
      <path d="M4 11v3.5" />
      <path d="M8.5 15v3.5a2 2 0 0 0 4 0V16" />
    </>
  ),
  hospital: (
    <>
      <rect x="4.5" y="6" width="15" height="14" rx="1.8" />
      <path d="M12 9v8M8 13h8" />
      <path d="M4.5 10h15" />
    </>
  ),
  flag: (
    <>
      <path d="M6 4v17" />
      <path d="M6 5h11l-2 3.5L17 12H6" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18v14H6.5A1.5 1.5 0 0 0 5 19.5v-14Z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H18" />
      <path d="M9 8h5M9 11h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v6c0 4.4 3.2 7.6 7 8.5 3.8-.9 7-4.1 7-8.5V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5c0 5.1-7 9.5-7 9.5Z" />
  ),
  camera: (
    <>
      <path d="M4 8h3.2l1.4-2h6.8l1.4 2H20a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 8Z" />
      <circle cx="12" cy="13.5" r="3.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chat: (
    <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-6l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 15.5v-9A1.5 1.5 0 0 1 5 5Z" />
  ),
  'chevron-left': <path d="m14.5 6-6 6 6 6" />,
  'chevron-right': <path d="m9.5 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  car: (
    <>
      <path d="M4 15v-2l1.5-4.5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.5L20 13v2" />
      <rect x="3.5" y="14.5" width="17" height="4.5" rx="1.2" />
      <circle cx="8" cy="19" r="1.4" />
      <circle cx="16" cy="19" r="1.4" />
    </>
  ),
  shelter: (
    <>
      <path d="M4 12 12 5l8 7" />
      <path d="M6 11v9h12v-9" />
      <path d="M10 20v-4h4v4" />
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
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
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
      <Icon name={name} size={Math.round(size * 0.55)} />
    </span>
  );
}
