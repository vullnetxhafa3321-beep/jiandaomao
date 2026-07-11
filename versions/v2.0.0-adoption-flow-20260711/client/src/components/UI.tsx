import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { HomeLink } from './HomeLink';
import { Icon } from './Icon';

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-[90%] w-[400px]">
      <div className="frog-toast text-sm px-4 py-3 text-center">{message}</div>
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
      <HomeLink />
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  icon,
}: {
  title: string;
  right?: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--cream-50)] px-5 pt-10 pb-3 border-b-2 border-[rgba(44,36,28,0.25)]">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2.5 min-w-0">
          {icon}
          <div className="min-w-0">
            <h1 className="text-xl font-black text-[var(--ink-900)] font-title">{title}</h1>
            {subtitle && <p className="text-xs text-[var(--ink-muted)] mt-1 font-semibold">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

export function BackHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--cream-50)] px-5 pt-10 pb-3 flex items-center gap-3 border-b-2 border-[rgba(44,36,28,0.25)]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="modal-back-btn static w-10 h-10"
          aria-label="返回"
        >
          ←
        </button>
      )}
      <h1 className="text-xl font-black text-[var(--ink-900)] font-title">{title}</h1>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    discovered: 'bg-[var(--awning-yellow)] text-[var(--ink-900)]',
    saved: 'bg-[var(--sea-400)] text-[var(--ink-900)]',
    hospital: 'bg-[var(--sky-300)] text-[var(--ink-900)]',
    treated: 'bg-[var(--olive-400)] text-[var(--ink-900)]',
    adoption: 'bg-[#f5c4c4] text-[var(--sign-red-deep)]',
    homeward: 'bg-[var(--cream-100)] text-[var(--ink-900)]',
    closed: 'bg-[var(--sand-300)] text-[var(--ink-muted)]',
  };
  const labels: Record<string, string> = {
    discovered: '刚发现',
    saved: '已控制',
    hospital: '送医中',
    treated: '已就医',
    adoption: '待领养',
    homeward: '已回家',
    closed: '已结案',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-bold border-2 border-[rgba(44,36,28,0.35)] shadow-block-sm ${colors[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}

export function ProgressBar({ status }: { status: string }) {
  const steps = [
    { key: 'discovered', label: '发现' },
    { key: 'saved', label: '救了' },
    { key: 'hospital', label: '送医' },
    { key: 'treated', label: '就医' },
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
  onTreated,
  treatedLoading,
}: {
  hospital: { name: string; address: string; distance_km?: number };
  onCallDidi: () => void;
  onCopy: () => void;
  /** 已就医 → 进入发布领养；不传时默认跳转领养发布页 */
  onTreated?: () => void;
  treatedLoading?: boolean;
}) {
  const navigate = useNavigate();
  const goAdoption = () => {
    if (onTreated) onTreated();
    else navigate('/adoption/post');
  };

  return (
    <div className="clay-card-blue p-4">
      <h3 className="font-black text-lg text-brand-dark mb-1">🚗 带猫去医院</h3>
      <p className="text-sm text-brand-muted font-medium mb-1">
        目的地：{hospital.name}
        {hospital.distance_km !== undefined && `（${(hospital.distance_km < 1 ? Math.round(hospital.distance_km * 1000) + 'm' : hospital.distance_km.toFixed(1) + 'km')}）`}
      </p>
      <p className="text-xs text-gray-600 mb-3">{hospital.address}</p>
      <div className="flex gap-2">
        <button type="button" onClick={onCallDidi} className="fab-main flex-1 py-3 rounded-2xl font-bold text-sm">
          叫滴滴宠物专车
        </button>
        <button type="button" onClick={onCopy} className="clay-btn-yellow px-4 py-3 rounded-2xl text-sm">
          复制地址
        </button>
      </div>
      <button
        type="button"
        onClick={goAdoption}
        disabled={treatedLoading}
        className="mt-3 w-full py-3.5 rounded-2xl font-black text-sm clay-btn-yellow disabled:opacity-50"
      >
        {treatedLoading ? '提交中...' : '已就医 · 去发布领养'}
      </button>
      <ul className="mt-3 text-[11px] text-gray-600 space-y-1">
        <li>· 点击后唤起滴滴 App / 小程序，并自动复制医院地址</li>
        <li>· 打开后点「宠物出行」→ 粘贴目的地 → 选专车/快车</li>
        <li>· 请使用航空箱/猫包；首次需填写宠物档案</li>
        <li>· 到院检查后点「已就医」，即可发布领养贴</li>
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
    if (open) {
      setTimeout(() => setActive(true), 10);
    } else {
      setActive(false);
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`frog-parchment p-6 pb-10 max-h-[85vh] overflow-y-auto relative ${active ? 'modal-enter-active' : 'modal-enter'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-back-btn" onClick={onClose} aria-label="返回首页">
          <Icon name="chevron-left" size={16} />
        </button>

        <div className="pt-8 text-center mb-5 flex flex-col items-center">
          <Icon name="paw" size={48} />
          <h3 className="text-xl font-black text-[var(--ink-700)] mt-2">下一步怎么做？</h3>
          <p className="text-xs text-[var(--frog-stone)] mt-1">选择一条救助路线</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button type="button" className="frog-check-item flex-col items-center text-center py-5" onClick={onPublish}>
            <Icon name="megaphone" size={40} />
            <p className="font-bold text-sm text-[var(--ink-700)] mt-2">发布求助</p>
            <p className="text-[10px] text-[var(--frog-stone)] mt-1">要不起，求同城接力</p>
          </button>

          <button type="button" className="frog-check-item flex-col items-center text-center py-5" onClick={onHospital}>
            <Icon name="hospital" size={40} />
            <p className="font-bold text-sm text-[var(--ink-700)] mt-2">友好医院</p>
            <p className="text-[10px] text-[var(--frog-stone)] mt-1">地图 · 滴滴宠物专车</p>
          </button>
        </div>

        <div className="frog-card p-4 mb-4">
          <p className="font-bold text-xs text-[var(--ink-700)] mb-2 flex items-center gap-1.5">
            <Icon name="book" size={22} /> 注意事项
          </p>
          <ul className="text-[11px] text-[var(--frog-stone)] space-y-1.5">
            <li>· 勿徒手抓野猫，使用诱捕笼或航空箱</li>
            <li>· 临时带回家请先隔离，详见安全须知</li>
            <li>· 家里已有宠物需分室安置 7–14 天</li>
          </ul>
        </div>

        <button type="button" className="w-full py-3 text-[var(--frog-stone)] font-bold text-sm" onClick={onClose}>
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
    <div className="modal-overlay items-end">
      <div className="frog-parchment p-6 pb-10 w-full">
        <h3 className="text-xl font-black text-center mb-4 text-[var(--ink-900)] font-title">欢迎来到捡到猫了</h3>
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
