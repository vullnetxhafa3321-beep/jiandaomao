import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { chat, type AIChatMessage } from '../api/aiClient';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME: Message = {
  id: 0,
  role: 'assistant',
  text: '喵~ 你好！我是「捡到猫了」小助手。你可以问我：\n• 捡到猫了怎么办？\n• 附近有哪些宠物医院？\n• 领养需要什么条件？\n• 怎么安全抓猫？',
};

const QUICK = ['捡到猫了怎么办', '附近医院', '领养条件', '抓猫安全'] as const;
const SHRINK_THRESHOLD = 80;

/** 离线兜底（上游 AI 不可用时） */
function mockReply(input: string): string {
  const q = input.trim();
  if (/捡到|捡了|发现.*猫|猫.*怎么办/.test(q)) {
    return '别慌！按这几步来：\n1. 先观察猫咪状态，不要贸然靠近\n2. 准备航空箱或纸箱+毛巾\n3. 戴上厚手套，用食物引诱\n4. 控制住后立即拍照发布求助\n5. 尽快送最近的宠物医院检查\n\n需要我帮你找附近医院吗？点底部「我捡到猫了」即可。';
  }
  if (/医院|看病|检查|兽医/.test(q)) {
    return '地图页可查看推荐医院，部分标注「友好」的院所更适合流浪动物送医。\n也可在发布页获取定位后查看附近医院。';
  }
  if (/领养|收养|条件|要求/.test(q)) {
    return '待领养猫咪的基本要求：\n• 年满18岁，有稳定收入和住所\n• 家人/房东同意养猫\n• 同意绝育、定期驱虫疫苗\n• 接受送猫上门+视频回访\n• 不笼养、不散养、科学喂养';
  }
  if (/抓猫|安全|咬|手套/.test(q)) {
    return '抓猫安全要点：\n🐱 戴厚防抓手套，穿长袖\n🐱 用食物引诱，不要强行抓捕\n🐱 优先使用航空箱或诱捕笼\n🐱 避免徒手接触流浪猫口腔\n🐱 被抓咬后立即用肥皂水冲洗并就医';
  }
  return '网络助手暂时忙不过来…你可以先试试问：捡到猫了怎么办 / 附近医院 / 领养条件 / 抓猫安全';
}

function CatFaceIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <ellipse cx="14" cy="15" rx="9" ry="7.5" fill="#fff" />
      <path d="M9 12 7 7.5 11 9Z" fill="#fff" />
      <path d="M19 12 21 7.5 17 9Z" fill="#fff" />
      <circle cx="11" cy="14.5" r="1.2" fill="#243447" />
      <circle cx="17" cy="14.5" r="1.2" fill="#243447" />
      <path d="M12 17c1 .7 3 .7 4 0" stroke="#243447" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * AI 问答（对接 /api/ai → 免费 Pollinations / 可选 Groq）
 * - floating：右下角 FAB + 全屏面板
 * - embedded：嵌入弹层入口，点开后全屏；下滑/上滑可缩小收回
 */
export default function ChatAssistant({
  variant = 'floating',
  defaultOpen = false,
}: {
  variant?: 'floating' | 'embedded';
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [dragY, setDragY] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, pending]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const shrink = () => {
    abortRef.current?.abort();
    setOpen(false);
    setDragY(0);
  };

  const onDragStart = (clientY: number) => {
    dragStartY.current = clientY;
  };

  const onDragMove = (clientY: number) => {
    if (dragStartY.current == null) return;
    const dy = clientY - dragStartY.current;
    setDragY(dy);
  };

  const onDragEnd = () => {
    if (dragStartY.current == null) return;
    if (Math.abs(dragY) >= SHRINK_THRESHOLD) shrink();
    else setDragY(0);
    dragStartY.current = null;
  };

  const sendText = async (raw: string) => {
    const text = raw.trim();
    if (!text || pending) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setPending(true);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const history: AIChatMessage[] = [...messages, userMsg]
      .filter((m) => m.id !== 0)
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const replyText = await chat(history, ac.signal);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: replyText }]);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      console.warn('[ai]', err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: mockReply(text) },
      ]);
    } finally {
      setPending(false);
    }
  };

  const send = () => void sendText(input);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const panel = (
    <div
      className="chat-panel"
      style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, opacity: dragY ? Math.max(0.55, 1 - Math.abs(dragY) / 400) : undefined }}
    >
      <div
        className="chat-panel-drag"
        onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
        onTouchEnd={onDragEnd}
        onMouseDown={(e) => onDragStart(e.clientY)}
        onMouseMove={(e) => {
          if (dragStartY.current != null) onDragMove(e.clientY);
        }}
        onMouseUp={onDragEnd}
        onMouseLeave={() => {
          if (dragStartY.current != null) onDragEnd();
        }}
        role="presentation"
      >
        <div className="chat-panel-drag-bar" />
      </div>
      <p className="chat-panel-hint">上下滑动可缩小</p>

      <div className="chat-header">
        <div className="flex items-center gap-2.5">
          <div className="chat-avatar">
            <CatFaceIcon size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-[var(--ink-900)]">捡到猫了 · AI 助手</p>
            <p className="text-[10px] text-[var(--ink-muted)] font-semibold">在线 · 随时问我</p>
          </div>
        </div>
        <button type="button" className="chat-close" onClick={shrink} aria-label="缩小">
          ✕
        </button>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
          >
            {m.role === 'assistant' && (
              <div className="chat-bubble-avatar">
                <CatFaceIcon size={16} />
              </div>
            )}
            <div className="chat-bubble-body">
              {m.text.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        ))}
        {pending && (
          <div className="chat-bubble chat-bubble-assistant">
            <div className="chat-bubble-avatar">
              <CatFaceIcon size={16} />
            </div>
            <div className="chat-bubble-body chat-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="chat-quick">
        {QUICK.map((label) => (
          <button
            key={label}
            type="button"
            className="chat-quick-btn"
            disabled={pending}
            onClick={() => void sendText(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="chat-input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="输入你的问题…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button type="button" className="chat-send" onClick={send} disabled={!input.trim() || pending}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 12 20 4l-4 16-4-5.5L16 9l-6 6.5Z" fill="#fff" />
          </svg>
        </button>
      </div>
    </div>
  );

  const fullscreen = open && typeof document !== 'undefined' ? createPortal(panel, document.body) : null;

  if (variant === 'embedded') {
    return (
      <>
        <button type="button" className="chat-entry-card" onClick={() => setOpen(true)}>
          <span className="chat-entry-icon">
            <CatFaceIcon size={28} />
          </span>
          <span className="chat-entry-text">
            <span className="chat-entry-title">捡到猫了 · AI 助手</span>
            <span className="chat-entry-desc">
              捡到猫怎么办、附近医院、领养条件、安全抓猫——点这里开始提问
            </span>
          </span>
          <span className="chat-entry-arrow">›</span>
        </button>
        {fullscreen}
      </>
    );
  }

  return (
    <>
      {!open && (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="打开AI助手">
          <CatFaceIcon size={28} />
        </button>
      )}
      {fullscreen}
    </>
  );
}
