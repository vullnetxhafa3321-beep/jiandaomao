import { useMemo } from 'react';
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
  const m = addr.match(/上海市(.+?)区/);
  return m ? `${m[1]}区` : '上海市';
};

interface CelebrationTickerProps {
  rescues?: Rescue[];
}

export function CelebrationTicker({ rescues = [] }: CelebrationTickerProps) {
  const messages = useMemo(() => {
    const dynamic = rescues
      .filter((r) => r.status === 'adoption' || r.status === 'homeward' || r.status === 'closed')
      .map((r, i) => {
        const cat = rescueToCatProfile(r, i);
        const city = CITY_FROM_ADDRESS(r.address_display);
        const templates = [
          `🎉 热烈祝贺 ${city} ${cat.name} 成功找到领养家庭！！`,
          `🔥 喜报！${city} ${cat.name} 已被接回家～ 喵生圆满！`,
          `🎊 恭喜 ${city} ${cat.name} 领养成功！撒花撒花 ✨`,
        ];
        return templates[i % templates.length];
      });

    return [...dynamic, ...TACKY_MESSAGES];
  }, [rescues]);

  const loop = [...messages, ...messages];

  return (
    <div className="celebration-wrap">
      <div className="celebration-badge">领养喜报</div>
      <div className="celebration-track-outer">
        <div className="celebration-track">
          {loop.map((msg, i) => (
            <span key={i} className="celebration-item">
              {msg}
              <span className="celebration-spark">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="celebration-ribbon celebration-ribbon-left">喜</div>
      <div className="celebration-ribbon celebration-ribbon-right">报</div>
    </div>
  );
}
