import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-[90%] w-[400px]">
      <div className="bg-gray-900/90 text-white text-sm px-4 py-3 rounded-2xl shadow-lg text-center">
        {message}
      </div>
    </div>,
    document.body
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const show = (msg: string) => setMessage(msg);
  const toast = message ? (
    <Toast message={message} onClose={() => setMessage(null)} />
  ) : null;
  return { show, toast };
}

export function Layout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mobile-container pb-32 ${className}`}>
      {children}
    </div>
  );
}

export function BackHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-40 bg-[#b2e8e0]/95 backdrop-blur px-5 pt-10 pb-3 flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-lg shadow"
        >
          ←
        </button>
      )}
      <h1 className="text-xl font-black text-brand-dark">{title}</h1>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    discovered: 'bg-orange-100 text-orange-600',
    saved: 'bg-blue-100 text-blue-600',
    hospital: 'bg-purple-100 text-purple-600',
    treated: 'bg-green-100 text-green-600',
    adoption: 'bg-pink-100 text-pink-600',
    homeward: 'bg-teal-100 text-teal-600',
    closed: 'bg-gray-100 text-gray-500',
  };
  const labels: Record<string, string> = {
    discovered: '刚发现',
    saved: '已控制',
    hospital: '送医中',
    treated: '已检查',
    adoption: '待领养',
    homeward: '已回家',
    closed: '已结案',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${colors[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}

export function ProgressBar({ status }: { status: string }) {
  const steps = [
    { key: 'discovered', label: '发现' },
    { key: 'saved', label: '救了' },
    { key: 'hospital', label: '送医' },
    { key: 'treated', label: '检查' },
    { key: 'adoption', label: '领养' },
  ];
  const order = ['discovered', 'saved', 'hospital', 'treated', 'adoption', 'homeward', 'closed'];
  const idx = order.indexOf(status);

  return (
    <div className="flex justify-between px-2 py-4">
      {steps.map((step, i) => {
        const stepIdx = order.indexOf(step.key);
        let dotClass = 'progress-dot pending';
        if (stepIdx < idx) dotClass = 'progress-dot done';
        else if (stepIdx === idx) dotClass = 'progress-dot active';
        return (
          <div key={step.key} className="progress-step">
            <div className={dotClass}>{stepIdx < idx ? '✓' : i + 1}</div>
            <span className="text-[10px] mt-1 text-gray-500 font-medium">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DidiCard({
  hospital,
  onCallDidi,
  onCopy,
}: {
  hospital: { name: string; address: string; distance_km?: number };
  onCallDidi: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="clay-card-blue p-4">
      <h3 className="font-black text-lg text-brand-dark mb-1">🚗 带猫去医院</h3>
      <p className="text-sm text-brand-muted font-medium mb-1">
        目的地：{hospital.name}
        {hospital.distance_km !== undefined && `（${(hospital.distance_km < 1 ? Math.round(hospital.distance_km * 1000) + 'm' : hospital.distance_km.toFixed(1) + 'km')}）`}
      </p>
      <p className="text-xs text-gray-600 mb-3">{hospital.address}</p>
      <div className="flex gap-2">
        <button onClick={onCallDidi} className="fab-main flex-1 py-3 rounded-2xl font-bold text-sm">
          叫滴滴宠物专车
        </button>
        <button onClick={onCopy} className="clay-btn-yellow px-4 py-3 rounded-2xl text-sm">
          复制地址
        </button>
      </div>
      <ul className="mt-3 text-[11px] text-gray-600 space-y-1">
        <li>· 请使用航空箱/猫包，猫放后排</li>
        <li>· 首次需在滴滴填写宠物档案</li>
        <li>· 上海可选宠物专车，全国可用宠物快车</li>
      </ul>
    </div>
  );
}

export function ActionModal({
  open,
  onClose,
  onPublish,
  onHospital,
}: {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  onHospital: () => void;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (open) setTimeout(() => setActive(true), 10);
    else setActive(false);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end max-w-[480px] mx-auto left-0 right-0"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-t-[32px] p-6 pb-12 ${active ? 'modal-enter-active' : 'modal-enter'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <h3 className="text-2xl font-black text-center mb-6">下一步怎么做？</h3>
        <div className="space-y-4">
          <button
            className="w-full clay-card-blue py-4 px-6 flex justify-between items-center text-left"
            onClick={onPublish}
          >
            <div>
              <p className="text-lg font-bold text-gray-900">发布求助动态</p>
              <p className="text-sm text-gray-600 font-medium">要不起，求同城接力</p>
            </div>
            <span className="text-2xl">📢</span>
          </button>
          <button
            className="w-full clay-btn-yellow py-4 px-6 flex justify-between items-center text-left"
            onClick={onHospital}
          >
            <div>
              <p className="text-lg font-bold text-gray-900">去附近友好医院</p>
              <p className="text-sm text-gray-700 font-medium">一键叫滴滴宠物专车</p>
            </div>
            <span className="text-2xl">🏥</span>
          </button>
        </div>
        <button className="mt-6 w-full py-3 text-gray-400 font-bold" onClick={onClose}>
          取消
        </button>
      </div>
    </div>,
    document.body
  );
}

export function LoginModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (body: { phone?: string; code?: string; nickname?: string }) => Promise<void>;
}) {
  const [mode, setMode] = useState<'quick' | 'phone'>('quick');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'quick') {
        if (!nickname.trim()) throw new Error('请输入昵称');
        await onLogin({ nickname: nickname.trim() });
      } else {
        if (!phone || !code) throw new Error('请输入手机号和验证码');
        await onLogin({ phone, code });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center max-w-[480px] mx-auto">
      <div className="bg-white rounded-t-[32px] p-6 pb-10 w-full">
        <h3 className="text-2xl font-black text-center mb-4">欢迎来到捡到猫了</h3>
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded-full font-bold text-sm ${mode === 'quick' ? 'clay-btn-yellow' : 'bg-gray-100'}`}
            onClick={() => setMode('quick')}
          >
            快速体验
          </button>
          <button
            className={`flex-1 py-2 rounded-full font-bold text-sm ${mode === 'phone' ? 'clay-btn-yellow' : 'bg-gray-100'}`}
            onClick={() => setMode('phone')}
          >
            手机号登录
          </button>
        </div>
        {mode === 'quick' ? (
          <input
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 mb-3"
            placeholder="你的昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        ) : (
          <>
            <input
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 mb-3"
              placeholder="手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 mb-3"
              placeholder="验证码（演示：123456）"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </>
        )}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          className="fab-main w-full py-3 rounded-2xl font-bold"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '登录中...' : '开始救助'}
        </button>
        <button className="mt-3 w-full py-2 text-gray-400" onClick={onClose}>
          取消
        </button>
      </div>
    </div>,
    document.body
  );
}
