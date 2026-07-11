import { useRef, useState, useCallback, useEffect, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Rescue } from '../types';
import { StatusBadge } from './UI';
import { formatDistance } from '../utils/helpers';

export interface CatProfile {
  id: string;
  rescueId: string;
  name: string;
  breed: string;
  gender: string;
  age: string;
  location: string;
  image: string;
  color: string;
  status: string;
  story: string;
}

const CARD_COLORS = [
  '#a8d8ea',
  '#7ec8b8',
  '#e8c547',
  '#f8b4c4',
  '#c9b8e8',
  '#ffd4a3',
];

const CAT_NAMES = ['橘橘', '小灰', '奶茶', '黑豆', '花花', '团子', '咪咪', '小虎'];

export function rescueToCatProfile(rescue: Rescue, index: number): CatProfile {
  const tag = rescue.tags[0] || '';
  const name =
    rescue.status === 'adoption'
      ? CAT_NAMES[index % CAT_NAMES.length]
      : tag === '幼猫'
        ? '小奶猫'
        : `小猫${index + 1}`;

  return {
    id: rescue.id,
    rescueId: rescue.id,
    name,
    breed: tag ? `流浪${tag === '幼猫' ? '幼猫' : '猫'}` : '中华田园猫',
    gender: index % 2 === 0 ? '未知' : '待确认',
    age: tag === '幼猫' ? '幼猫' : rescue.status === 'adoption' ? '约1岁' : '未知',
    location: rescue.address_display,
    image: rescue.cover_url,
    color: CARD_COLORS[index % CARD_COLORS.length],
    status: rescue.status,
    story: rescue.content,
  };
}

interface CatCarouselProps {
  cats: CatProfile[];
  onLike?: (cat: CatProfile) => void;
}

export function CatCarousel({ cats, onLike }: CatCarouselProps) {
  const [active, setActive] = useState(0);
  const touchStart = useRef(0);
  const navigate = useNavigate();

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => Math.max(0, Math.min(cats.length - 1, i + dir)));
    },
    [cats.length]
  );

  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
  };

  useEffect(() => {
    if (active >= cats.length && cats.length > 0) setActive(cats.length - 1);
  }, [cats.length, active]);

  if (cats.length === 0) {
    return (
      <div className="cat-carousel-empty">
        <span className="text-6xl">🐱</span>
        <p className="mt-4 text-gray-600 font-medium">还没有小猫故事</p>
        <p className="text-sm text-gray-400">做第一个捡到猫的人吧～</p>
      </div>
    );
  }

  return (
    <div className="cat-carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button
        type="button"
        className="carousel-arrow carousel-arrow-left"
        onClick={() => go(-1)}
        disabled={active === 0}
        aria-label="上一张"
      >
        ‹
      </button>

      <div className="carousel-track">
        {cats.map((cat, i) => {
          const offset = i - active;
          const isActive = i === active;
          return (
            <div
              key={cat.id}
              className={`cat-card ${isActive ? 'cat-card-active' : ''}`}
              style={{
                backgroundColor: cat.color,
                transform: `translateX(calc(${offset * 72}% + ${offset * 12}px)) scale(${isActive ? 1 : 0.82})`,
                opacity: Math.abs(offset) > 1 ? 0 : Math.abs(offset) === 1 ? 0.55 : 1,
                zIndex: isActive ? 10 : 5 - Math.abs(offset),
              }}
              onClick={() => isActive && navigate(`/r/${cat.rescueId}`)}
            >
              <div className="cat-card-photo-wrap">
                <div className="cat-card-photo">
                  {cat.image.startsWith('/') ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    <span className="cat-emoji">{cat.image || '🐱'}</span>
                  )}
                </div>
              </div>

              <div className="cat-card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="cat-card-name">{cat.name}</h2>
                    <p className="cat-card-breed">{cat.breed}</p>
                  </div>
                  <button
                    type="button"
                    className="cat-heart"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike?.(cat);
                    }}
                    aria-label="收藏"
                  >
                    ♡
                  </button>
                </div>
                <p className="cat-card-meta">
                  {cat.gender} · {cat.age}
                </p>
                <p className="cat-card-location">📍 {cat.location}</p>
                {isActive && (
                  <p className="cat-card-story line-clamp-2">{cat.story}</p>
                )}
                {isActive && (
                  <div className="mt-2">
                    <StatusBadge status={cat.status} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="carousel-arrow carousel-arrow-right"
        onClick={() => go(1)}
        disabled={active === cats.length - 1}
        aria-label="下一张"
      >
        ›
      </button>

      <div className="carousel-dots">
        {cats.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`carousel-dot ${i === active ? 'carousel-dot-active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`第 ${i + 1} 张`}
          />
        ))}
      </div>

      <p className="carousel-counter">
        {active + 1} / {cats.length}
      </p>
    </div>
  );
}
