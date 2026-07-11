import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { GuideStep } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance } from '../utils/helpers';

export function RescueGuidePanel() {
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [active, setActive] = useState(0);
  const { nearest, regionLabel } = useLocationContext();
  const navigate = useNavigate();

  useEffect(() => {
    api.guideSteps().then(({ items }) => setSteps(items)).catch(() => {});
  }, []);

  const step = steps[active];

  return (
    <section className="frog-guide-half">
      <div className="frog-guide-head">
        <h2 className="frog-guide-title">📋 救助流程手册</h2>
        <p className="frog-guide-sub">{regionLabel}</p>
      </div>

      {nearest && (
        <button type="button" className="frog-card-wood p-3 mb-3 w-full text-left" onClick={() => navigate('/hospitals')}>
          <p className="text-[10px] text-[var(--frog-stone)]">最近友好医院</p>
          <p className="font-bold text-sm">{nearest.name}</p>
          <p className="text-[10px]">{nearest.address}</p>
          {'distance_km' in nearest && nearest.distance_km != null && (
            <p className="text-xs font-bold text-[var(--frog-green)] mt-1">{formatDistance(nearest.distance_km)} · 打车送医</p>
          )}
        </button>
      )}

      <div className="frog-guide-steps flex gap-1 overflow-x-auto pb-2 mb-2">
        {steps.map((s, i) => (
          <button
            key={s.step}
            type="button"
            className={`frog-guide-step-tab flex-shrink-0 ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.icon} {s.step}
          </button>
        ))}
      </div>

      {step && (
        <div className="frog-card p-3 flex-1 overflow-y-auto">
          <h3 className="font-bold text-sm mb-1">{step.icon} {step.title}</h3>
          <p className="text-xs text-[var(--frog-ink)] leading-relaxed mb-2">{step.content}</p>
          <p className="text-[10px] font-bold text-[var(--frog-green)] mb-1">✓ 要做</p>
          <ul className="text-[10px] text-[var(--frog-stone)] space-y-0.5 mb-2">
            {step.dos.map((d) => <li key={d}>· {d}</li>)}
          </ul>
          <p className="text-[10px] font-bold text-[#c45c4a] mb-1">✗ 别做</p>
          <ul className="text-[10px] text-[var(--frog-stone)] space-y-0.5">
            {step.donts.map((d) => <li key={d}>· {d}</li>)}
          </ul>
        </div>
      )}

      <button type="button" className="frog-btn-green w-full py-2 mt-2 text-sm font-bold" onClick={() => navigate('/guide')}>
        查看完整手册 →
      </button>
    </section>
  );
}
