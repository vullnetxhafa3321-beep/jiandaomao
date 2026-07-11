import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, IconBadge } from './Icon';

const KEY = 'jiandaomao_welcome_dismissed';

export function WelcomeOverlay({ onRescue }: { onRescue: () => void }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try { setVisible(localStorage.getItem(KEY) !== '1'); } catch { setVisible(true); }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-card frog-parchment">
        <button type="button" className="welcome-close" onClick={dismiss} aria-label="关闭">
          <Icon name="close" size={14} />
        </button>
        <div className="text-center pt-2 pb-3 flex flex-col items-center">
          <IconBadge name="paw" tone="coral" size={44} className="mb-1" />
          <h2 className="text-lg font-black font-title text-[var(--ink-900)]">捡到猫了</h2>
          <p className="text-[10px] text-[var(--ink-muted)] font-semibold">海边小镇 · 地图找猫 · 手册送医</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" className="frog-check-item flex-col py-3 text-center items-center" onClick={() => { dismiss(); navigate('/publish'); }}>
            <IconBadge name="megaphone" tone="wood" size={32} className="mb-1" />
            <span className="text-xs font-bold">发布求助</span>
          </button>
          <button type="button" className="frog-check-item flex-col py-3 text-center items-center" onClick={() => { dismiss(); navigate('/hospitals'); }}>
            <IconBadge name="hospital" tone="sky" size={32} className="mb-1" />
            <span className="text-xs font-bold">友好医院</span>
          </button>
        </div>
        <button type="button" className="frog-wood-sign w-full py-2.5 font-black text-sm flex items-center justify-center gap-2" onClick={() => { dismiss(); onRescue(); }}>
          <Icon name="paw" size={18} strokeWidth={2} /> 我捡到猫了
        </button>
        <button type="button" className="w-full py-2 text-[10px] text-[var(--frog-stone)]" onClick={dismiss}>知道了，不再显示</button>
      </div>
    </div>
  );
}
