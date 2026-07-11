import { useNavigate } from 'react-router-dom';
import { HandDrawnCat } from './HandDrawnCat';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance } from '../utils/helpers';

export const RESCUE_LEVELS = [
  {
    id: 'discovered',
    icon: '🌿',
    title: '草丛发现',
    desc: '要不起？先拍照定位，求同城接力',
    action: 'forum' as const,
  },
  {
    id: 'saved',
    icon: '🧤',
    title: '安全控制',
    desc: '诱捕笼、航空箱，勿徒手抓猫',
    action: 'safety' as const,
  },
  {
    id: 'hospital',
    icon: '🏥',
    title: '友好医院',
    desc: '附近医院地图 · 滴滴宠物专车',
    action: 'hospitals' as const,
    useHospital: true,
  },
  {
    id: 'archive',
    icon: '📋',
    title: '建档登记',
    desc: '体检驱虫，记录品种年龄',
    action: 'guide' as const,
  },
  {
    id: 'home',
    icon: '🏠',
    title: '温馨小窝',
    desc: '待领养或临时安置，等一个家',
    action: 'adoption' as const,
  },
];

const ACTION_PATHS: Record<string, string> = {
  forum: '/forum',
  safety: '/safety',
  hospitals: '/hospitals',
  guide: '/guide',
  adoption: '/adoption',
};

interface RescueMapProps {
  activeIndex?: number;
  onLevelClick?: (index: number) => void;
}

export function RescueMap({ activeIndex = 0, onLevelClick }: RescueMapProps) {
  const navigate = useNavigate();
  const { nearest, loading } = useLocationContext();
  const active = Math.min(Math.max(activeIndex, 0), RESCUE_LEVELS.length - 1);

  const handleNode = (index: number) => {
    onLevelClick?.(index);
    const level = RESCUE_LEVELS[index];
    const path = ACTION_PATHS[level.action];
    if (path) navigate(path);
  };

  return (
    <section className="rescue-map" aria-label="救助闯关地图">
      <div className="rescue-map-path" aria-hidden />

      <div className="rescue-map-nodes">
        {RESCUE_LEVELS.map((level, i) => {
          let stateClass = 'rescue-node-locked';
          if (i < active) stateClass = 'rescue-node-done';
          else if (i === active) stateClass = 'rescue-node-active';

          const hospitalDesc =
            level.useHospital && nearest
              ? `${nearest.name} · ${formatDistance(nearest.distance_km)}`
              : level.useHospital && loading
                ? '定位最近医院中…'
                : level.desc;

          return (
            <button
              key={level.id}
              type="button"
              className={`rescue-node ${stateClass}`}
              onClick={() => handleNode(i)}
            >
              <div className="rescue-node-marker">
                {i === active ? <HandDrawnCat size={36} /> : level.icon}
              </div>
              <div className="rescue-node-body">
                <p className="rescue-node-label">第 {i + 1} 关</p>
                <p className="rescue-node-title">{level.title}</p>
                <p className="rescue-node-desc">{hospitalDesc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
