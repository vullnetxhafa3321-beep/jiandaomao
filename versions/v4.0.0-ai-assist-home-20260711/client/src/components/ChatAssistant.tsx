import { useState, useRef, useEffect } from 'react';

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

function mockReply(input: string): string {
  const q = input.trim();
  if (/捡到|捡了|发现.*猫|猫.*怎么办/.test(q)) {
    return '别慌！按这几步来：\n1. 先观察猫咪状态，不要贸然靠近\n2. 准备航空箱或纸箱+毛巾\n3. 戴上厚手套，用食物引诱\n4. 控制住后立即拍照发布求助\n5. 尽快送最近的宠物医院检查\n\n需要我帮你找附近医院吗？点「友好医院」即可。';
  }
  if (/医院|看病|检查|兽医/.test(q)) {
    return '我们合作了多家流浪动物友好医院，提供免费基础检查或绝育优惠。\n点「友好医院」，或在发布页获取定位后，系统会推荐最近的合作医院。';
  }
  if (/领养|收养|条件|要求/.test(q)) {
    return '待领养猫咪的基本要求：\n• 年满18岁，有稳定收入和住所\n• 家人/房东同意养猫\n• 同意绝育、定期驱虫疫苗\n• 接受送猫上门+视频回访\n• 不笼养、不散养、科学喂养\n每只猫的具体要求可能不同，详见待领养详情页。';
  }
  if (/抓猫|安全|咬|手套/.test(q)) {
    return '抓猫安全要点：\n🐱 戴厚防抓手套，穿长袖\n🐱 用食物引诱，不要强行抓捕\n🐱 优先使用航空箱或诱捕笼\n🐱 避免徒手接触流浪猫口腔\n🐱 被抓咬后立即用肥皂水冲洗并就医';
  }
  if (/品种|什么猫|什么狗|识别/.test(q)) {
    return '你可以上传照片，我会用 AI 帮你识别动物品种！\n在发布求助页面选择照片后可触发识别。目前支持猫、狗、兔子、仓鼠等常见宠物。';
  }
  if (/感谢|谢谢|很好|不错|棒/.test(q)) {
    return '不客气喵~ 能帮到你我也很开心！有其他问题随时问我。';
  }
  return '这个问题我还不太会回答…你可以试试问我：\n• 捡到猫了怎么办\n• 附近医院\n• 领养条件\n• 抓猫安全';
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
 * AI 问答（对齐 MnAuRb AI问答模块_V1展示）
 * - floating：右下角 FAB + 面板
 * - embedded：嵌入弹层，点卡片展开完整对话
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
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, pending]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text || pending) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setPending(true);
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, role: 'assistant', text: mockReply(text) };
      setMessages((prev) => [...prev, reply]);
      setPending(false);
    }, 600 + Math.random() * 600);
  };

  const send = () => sendText(input);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const panel = (
    <div className={`chat-panel ${variant === 'embedded' ? 'chat-panel-embedded' : ''}`}>
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
        {(variant === 'floating' || variant === 'embedded') && (
          <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="关闭">
            ✕
          </button>
        )}
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
            onClick={() => sendText(label)}
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

  if (variant === 'embedded') {
    if (!open) {
      return (
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
      );
    }
    return panel;
  }

  return (
    <>
      {!open && (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="打开AI助手">
          <CatFaceIcon size={28} />
        </button>
      )}
      {open && panel}
    </>
  );
}
