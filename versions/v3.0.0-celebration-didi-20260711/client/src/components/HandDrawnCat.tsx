/** 旅行青蛙风格 2D 手绘小猫 SVG */
export function HandDrawnCat({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#C2A88D" stroke="#5A4E45" strokeWidth="2.5" />
      <path d="M22 38 L14 18 L28 32 Z" fill="#C2A88D" stroke="#5A4E45" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M58 38 L66 18 L52 32 Z" fill="#C2A88D" stroke="#5A4E45" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="40" cy="42" rx="16" ry="14" fill="#EAE3D3" stroke="#5A4E45" strokeWidth="2.5" />
      <ellipse cx="32" cy="40" rx="3" ry="4" fill="#4A3F35" />
      <ellipse cx="48" cy="40" rx="3" ry="4" fill="#4A3F35" />
      <ellipse cx="33" cy="39" rx="1" ry="1.2" fill="#EAE3D3" />
      <ellipse cx="49" cy="39" rx="1" ry="1.2" fill="#EAE3D3" />
      <path d="M36 46 Q40 50 44 46" stroke="#5A4E45" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M30 44 L26 43 M50 44 L54 43" stroke="#5A4E45" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 58 Q40 68 52 58" stroke="#5A4E45" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M18 52 Q12 48 10 42" stroke="#8CB866" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
