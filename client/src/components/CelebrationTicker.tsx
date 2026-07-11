import { useMemo, useState, useEffect } from 'react';
import type { Rescue } from '../types';
import { rescueToCatProfile } from './CatCarousel';

const TACKY_MESSAGES = [
  '🎉 热烈祝贺 上海市 橘橘 成功找到领养家庭！！撒花撒花 🎊',
  '🔥 喜报！静安区 小灰 已被爱心铲屎官接走～ 喵生圆满！',
  '🏆 恭喜 浦东新区 奶茶 领养成功！从此不用风餐露宿啦',
  '✨ 杨浦区 团子 找到家啦！感谢各位云养姨姨叔叔',
  '🎊 喜提铲屎官！徐汇区 花花 正式入住温馨小窝',
  '💐 黄浦区 咪咪 领养结案！祝喵生幸福长长长长～',
  '🥳 好消息！闵行区 小虎 被领养啦～ 撒花鼓掌！',
  '📣 长宁区 黑豆 找到长期饭票！恭喜恭喜！',
  '🎈 本台讯：又一只小流浪猫喜提新家，功德+1',
  '👏 领养喜报连播中… 下一位幸运小猫会是你家的吗？',
];

const CITY_FROM_ADDRESS = (addr: string) => {
  const sh = addr.match(/上海市(.+?)区/);
  if (sh) return `${sh[1]}区`;
  const bj = addr.match(/北京市(.+?)区/);
  if (bj) return `${bj[1]}区`;
  return addr.split('·')[0] || '本市';
};

export interface CelebrationItem {
  text: string;
  key: string;
}

interface CelebrationTickerProps {
  rescues?: Rescue[];
  catalogCelebrations?: string[];
  pauseMs?: number;
}

export function CelebrationTicker({
  rescues = [],
  catalogCelebrations = [],
  pauseMs = 3800,
}: CelebrationTickerProps) {
  const messages = useMemo(() => {
    const items: CelebrationItem[] = [];

    catalogCelebrations.forEach((text, i) => {
      items.push({ text, key: `cat-${i}` });
    });

    rescues
      .filter((r) => ['adoption', 'homeward', 'closed'].includes(r.status))
      .forEach((r, i) => {
        const cat = rescueToCatProfile(r, i);
        const city = CITY_FROM_ADDRESS(r.address_display);
        items.push({
          key: `rescue-${r.id}`,
          text: `🎉 热烈祝贺 ${city} ${cat.name} 成功找到领养家庭！！`,
        });
      });

    TACKY_MESSAGES.forEach((text, i) => {
      items.push({ text, key: `tacky-${i}` });
    });

    return items;
  }, [rescues, catalogCelebrations]);

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

  const current = messages[index];

  return (
    <div className="celebration-wrap">
      <div className="celebration-badge">领养喜报</div>
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
        {index + 1}/{messages.length}
      </span>
    </div>
  );
}
