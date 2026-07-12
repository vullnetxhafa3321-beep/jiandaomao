import { useEffect, useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  id,
  title,
  badge,
  defaultOpen = true,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const storageKey = `jiandaomao_section_${id}`;
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) return saved === '1';
    } catch {
      /* ignore */
    }
    return defaultOpen;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [open, storageKey]);

  return (
    <section className={className}>
      <button
        type="button"
        className="cute-section-label w-full justify-between pr-5"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {title}
          {badge}
        </span>
        <span className="text-xs text-[var(--frog-stone)] font-bold">{open ? '收起 ▲' : '展开 ▼'}</span>
      </button>
      {open && children}
    </section>
  );
}
