import { Link, useLocation } from 'react-router-dom';
import { IconBadge } from './Icon';

export function HomeLink({ className = '' }: { className?: string }) {
  const { pathname } = useLocation();
  if (pathname === '/') return null;

  return (
    <Link to="/" className={`home-link-tag ${className}`} aria-label="返回首页">
      <IconBadge name="home" tone="coral" size={18} />
      <span>首页</span>
    </Link>
  );
}
