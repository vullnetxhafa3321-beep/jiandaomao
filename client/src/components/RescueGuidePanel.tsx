import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { GuideStep } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance } from '../utils/helpers';
import { Icon, IconBadge, type IconName } from './Icon';

const STEP_ICONS: IconName[] = ['search', 'shield', 'hospital', 'book', 'heart'];

export function RescueGuidePanel() {
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [active, setActive] = useState(0);
  const { nearest, regionLabel } = useLocationContext();
  const navigate = useNavigate();

  useEffect(() => {
    api.guideSteps().then(({ items }) => setSteps(items)).catch(() => {});
  }, []);

  const step = steps[active];
  const stepIcon = (i: number): IconName => STEP_ICONS[i % STEP_ICONS.length];

  return (
    <section className="frog-guide-half">
      <div className="frog-guide-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconBadge name="book" tone="cream" size={28} />
          <div>
            <h2 className="frog-guide-title">救助流程手册</h2>
            <p className="frog-guide-sub">{regionLabel}</p>
          </div>
        </div>
      </div>

      {nearest && (
        <button type="button" className="frog-card p-3 mb-3 w-full text-left flex items-center gap-2" onClick={() => navigate('/hospitals')}>
          <IconBadge name="hospital" tone="sky" size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[var(--frog-stone)]">最近友好医院</p>
            <p className="font-bold text-sm truncate">{nearest.name}</p>
            {'distance_km' in nearest && nearest.distance_km != null && (
              <p className="text-xs font-bold text-[var(--coral-500)] mt-0.5">{formatDistance(nearest.distance_km)} · 打车送医</p>
            )}
          </div>
          <Icon name="chevron-right" size={16} />
        </button>
      )}

      <div className="frog-guide-steps flex gap-1.5 overflow-x-auto pb-2 mb-2">
        {steps.map((s, i) => (
          <button
            key={s.step}
            type="button"
            className={`frog-guide-step-tab flex-shrink-0 ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            <Icon name={stepIcon(i)} size={12} /> {s.step}
          </button>
        ))}
      </div>

      {step && (
        <div className="frog-card p-3 flex-1 overflow-y-auto">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-1.5">
            <IconBadge name={stepIcon(active)} tone="coral" size={22} /> {step.title}
          </h3>
          <p className="text-xs text-[var(--ink-700)] leading-relaxed mb-2">{step.content}</p>
          <p className="text-[10px] font-bold text-[var(--grass-500)] mb-1 flex items-center gap-1">
            <Icon name="check" size={11} /> 要做
          </p>
          <ul className="text-[10px] text-[var(--frog-stone)] space-y-0.5 mb-2">
            {step.dos.map((d) => <li key={d}>· {d}</li>)}
          </ul>
          <p className="text-[10px] font-bold text-[var(--coral-500)] mb-1 flex items-center gap-1">
            <Icon name="close" size={11} /> 别做
          </p>
          <ul className="text-[10px] text-[var(--frog-stone)] space-y-0.5">
            {step.donts.map((d) => <li key={d}>· {d}</li>)}
          </ul>
        </div>
      )}

      <button type="button" className="frog-btn-green w-full py-2 mt-2 text-sm font-bold flex items-center justify-center gap-1.5" onClick={() => navigate('/guide')}>
        查看完整手册 <Icon name="chevron-right" size={14} />
      </button>
    </section>
  );
}
