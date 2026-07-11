import { Link, useLocation } from 'react-router-dom';

export function HomeLink({ className = '' }: { className?: string }) {
  const { pathname } = useLocation();
  if (pathname === '/') return null;

  return (
    <Link
      to="/"
      className={`home-link-tag ${className}`}
      aria-label="返回首页"
    >
      🏠 首页
    </Link>
  );
}
