import { useMemo, useState, useEffect } from 'react';
import { api } from '../api/client';

const FALLBACK = [
  '🎉 热烈祝贺「小橘子」被网友「暖心阿花」成功救助！！撒花 🎊',
  '🔥 喜报！「牛奶糖」找到长期饭票～ 喵生圆满！',
  '🏆 恭喜「狸花卷」领养成功！从此不用风餐露宿啦',
  '✨ 「花花」已被好心人接走送医！功德+10086',
  '🎊 喜提铲屎官！「小墨」正式入住温馨小窝',
  '💐 本台讯：又一只街猫喜提新家，土味祝福送到！',
  '🥳 好消息！路过好心人出手，「夜行」有救了～',
  '📣 救助喜报连播中… 下一位幸运小猫会是你家的吗？',
];

interface CelebrationTickerProps {
  pauseMs?: number;
}

export function CelebrationTicker({ pauseMs = 3800 }: CelebrationTickerProps) {
  const [remote, setRemote] = useState<string[]>([]);

  useEffect(() => {
    api.celebrations()
      .then((r) => setRemote(r.items || []))
      .catch(() => setRemote([]));
  }, []);

  const messages = useMemo(() => {
    const list = remote.length ? remote : FALLBACK;
    return list.map((text, i) => ({ text, key: `c-${i}-${text.slice(0, 8)}` }));
  }, [remote]);

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setFade(true);
      }, 280);
    }, pauseMs);
    return () => clearInterval(timer);
  }, [messages.length, pauseMs]);

  if (messages.length === 0) return null;

  const current = messages[index % messages.length];

  return (
    <div className="celebration-wrap" role="status" aria-live="polite">
      <div className="celebration-badge">喜报</div>
      <div className="celebration-track-outer celebration-pause-mode">
        <p
          key={current.key + index}
          className={`celebration-pause-text ${fade ? 'celebration-fade-in' : 'celebration-fade-out'}`}
        >
          {current.text}
        </p>
        <div className="celebration-progress">
          <div
            className="celebration-progress-bar"
            style={{ animationDuration: `${pauseMs}ms` }}
            key={index}
          />
        </div>
      </div>
      <div className="celebration-ribbon celebration-ribbon-left">喜</div>
      <div className="celebration-ribbon celebration-ribbon-right">报</div>
      <span className="celebration-index">
        {(index % messages.length) + 1}/{messages.length}
      </span>
    </div>
  );
}
