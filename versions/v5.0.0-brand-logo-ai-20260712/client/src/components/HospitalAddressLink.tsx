import { useNavigate } from 'react-router-dom';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance } from '../utils/helpers';
import { amapNavUrl } from '../utils/community';

interface HospitalAddressLinkProps {
  prefix?: string;
  className?: string;
  showNav?: boolean;
}

export function HospitalAddressLink({
  prefix = '🏥',
  className = '',
  showNav = false,
}: HospitalAddressLinkProps) {
  const navigate = useNavigate();
  const { nearest, loading, regionLabel } = useLocationContext();

  if (loading) {
    return <span className={`text-xs text-[var(--frog-stone)] ${className}`}>定位中…</span>;
  }

  if (!nearest) {
    return (
      <button
        type="button"
        className={`text-xs font-bold text-[var(--frog-green)] underline-offset-2 hover:underline ${className}`}
        onClick={() => navigate('/hospitals')}
      >
        {prefix} 查看附近友好医院
      </button>
    );
  }

  const dist = nearest.distance_km !== undefined ? ` · ${formatDistance(nearest.distance_km)}` : '';

  if (showNav && 'lat' in nearest && nearest.lat && nearest.lng) {
    return (
      <a
        href={amapNavUrl(nearest.lng, nearest.lat, nearest.name)}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs font-bold text-[var(--frog-ink)] underline-offset-2 hover:underline block text-left ${className}`}
      >
        {prefix} {nearest.name}{dist}
        <span className="block text-[10px] text-[var(--frog-stone)] font-normal mt-0.5">{nearest.address}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`text-xs font-bold text-[var(--frog-ink)] underline-offset-2 hover:underline text-left ${className}`}
      onClick={() => navigate('/hospitals')}
    >
      {prefix} {nearest.name}{dist}
      <span className="block text-[10px] text-[var(--frog-stone)] font-normal mt-0.5">{nearest.address}</span>
    </button>
  );
}

export function LocationRegionBadge({ className = '' }: { className?: string }) {
  const { regionLabel, loading, refresh } = useLocationContext();

  return (
    <button
      type="button"
      className={`text-[10px] font-bold text-[var(--frog-ink)] bg-[var(--frog-paper)] border-2 border-[var(--frog-border)] px-2 py-1 frog-radius-sm ${className}`}
      onClick={refresh}
      title="点击刷新定位"
    >
      📍 {loading ? '定位中…' : regionLabel}
    </button>
  );
}
