import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <button type="button" className="welcome-close" onClick={dismiss}>✕</button>
        <div className="text-center pt-2 pb-3">
          <p className="text-3xl mb-1">🐱</p>
          <h2 className="text-lg font-black">捡到猫了</h2>
          <p className="text-[10px] text-[var(--frog-stone)]">地图找求助 · 手册学救助</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" className="frog-check-item flex-col py-3 text-center" onClick={() => { dismiss(); navigate('/publish'); }}>
            <span className="text-xl">📢</span><span className="text-xs font-bold">发布求助</span>
          </button>
          <button type="button" className="frog-check-item flex-col py-3 text-center" onClick={() => { dismiss(); navigate('/hospitals'); }}>
            <span className="text-xl">🏥</span><span className="text-xs font-bold">友好医院</span>
          </button>
        </div>
        <button type="button" className="frog-wood-sign w-full py-2.5 font-black text-sm" onClick={() => { dismiss(); onRescue(); }}>
          🐱 我捡到猫了
        </button>
        <button type="button" className="w-full py-2 text-[10px] text-[var(--frog-stone)]" onClick={dismiss}>知道了，不再显示</button>
      </div>
    </div>
  );
}
