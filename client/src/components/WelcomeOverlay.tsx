import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'jiandaomao_welcome_dismissed';

interface WelcomeOverlayProps {
  onRescue: () => void;
}

export function WelcomeOverlay({ onRescue }: WelcomeOverlayProps) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="welcome-overlay" role="dialog" aria-label="欢迎引导">
      <div className="welcome-card frog-parchment">
        <button type="button" className="welcome-close" onClick={dismiss} aria-label="关闭">
          ✕
        </button>

        <div className="text-center pt-2 pb-4">
          <p className="text-4xl mb-2">🐱</p>
          <h2 className="text-xl font-black text-[var(--frog-ink)]">捡到猫了</h2>
          <p className="text-xs text-[var(--frog-stone)] mt-1">地图查看求助 · 医院 · 救助站</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            className="frog-check-item flex-col items-center text-center py-4"
            onClick={() => {
              dismiss();
              navigate('/publish');
            }}
          >
            <span className="text-2xl mb-1">📢</span>
            <p className="font-bold text-sm">发布求助</p>
            <p className="text-[10px] text-[var(--frog-stone)]">要不起，求接力</p>
          </button>
          <button
            type="button"
            className="frog-check-item flex-col items-center text-center py-4"
            onClick={() => {
              dismiss();
              navigate('/hospitals');
            }}
          >
            <span className="text-2xl mb-1">🏥</span>
            <p className="font-bold text-sm">友好医院</p>
            <p className="text-[10px] text-[var(--frog-stone)]">地图 · 打车</p>
          </button>
        </div>

        <button type="button" className="frog-wood-sign w-full py-3 font-black" onClick={() => { dismiss(); onRescue(); }}>
          🐱 我捡到猫了
        </button>

        <button type="button" className="w-full py-2 mt-2 text-xs text-[var(--frog-stone)]" onClick={dismiss}>
          知道了，不再显示
        </button>
      </div>
    </div>
  );
}
