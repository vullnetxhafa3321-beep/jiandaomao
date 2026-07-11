import type { ForumPost } from '../types';
import { FORUM_STATUS } from './community';

const CARD_W = 750;
const CARD_H = 1100;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const chars = [...text];
  let line = '';
  let lineCount = 0;
  let cy = y;

  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = chars[i];
      cy += lineHeight;
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.slice(0, -1) + '…', x, cy);
        return cy + lineHeight;
      }
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

export async function generateForumShareCard(post: ForumPost): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_H);
  gradient.addColorStop(0, '#b2e8e0');
  gradient.addColorStop(1, '#dcf8f4');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const imgH = 420;
  const imgUrl = post.images?.[0] || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80';

  try {
    const img = await loadImage(imgUrl);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(40, 40, CARD_W - 80, imgH, 24);
    ctx.clip();
    const scale = Math.max((CARD_W - 80) / img.width, imgH / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, 40 + (CARD_W - 80 - sw) / 2, 40 + (imgH - sh) / 2, sw, sh);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.roundRect(40, 40, CARD_W - 80, imgH, 24);
    ctx.fill();
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐱', CARD_W / 2, 40 + imgH / 2 + 30);
    ctx.textAlign = 'left';
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(32, imgH + 24, CARD_W - 64, CARD_H - imgH - 56, 28);
  ctx.fill();

  const status = FORUM_STATUS[post.status];
  ctx.font = 'bold 28px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = post.status === 'found' ? '#dc2626' : post.status === 'rescued' ? '#16a34a' : '#2563eb';
  ctx.fillText(status.label.replace(/[🔴🟢🏠]\s*/, ''), 56, imgH + 80);

  ctx.font = 'bold 40px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#1c2331';
  let y = wrapText(ctx, post.title, 56, imgH + 140, CARD_W - 112, 48, 2);

  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`📍 ${post.address}`, 56, y + 16);
  y += 56;

  ctx.fillStyle = '#374151';
  y = wrapText(ctx, post.content, 56, y + 8, CARD_W - 112, 40, 3);

  if (post.breed || post.age) {
    ctx.font = 'bold 26px "PingFang SC", sans-serif';
    ctx.fillStyle = '#ea580c';
    ctx.fillText(`${post.breed || ''} · ${post.age || ''}`.replace(/^ · | · $/, ''), 56, y + 12);
    y += 40;
  }

  ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`👤 ${post.user_name}`, 56, CARD_H - 120);

  ctx.font = 'bold 36px "ZCOOL KuaiLe", "PingFang SC", cursive';
  ctx.fillStyle = '#1c2331';
  ctx.fillText('捡到猫了', 56, CARD_H - 64);

  ctx.font = '22px "PingFang SC", sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'right';
  ctx.fillText('扫码一起救助流浪动物', CARD_W - 56, CARD_H - 64);
  ctx.textAlign = 'left';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('生成分享图失败'));
    }, 'image/png');
  });
}

export async function shareForumPost(post: ForumPost, showToast: (msg: string) => void) {
  try {
    const blob = await generateForumShareCard(post);
    const file = new File([blob], `捡到猫了-${post.title.slice(0, 12)}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: post.title,
        text: `${post.title} · ${post.address} · 捡到猫了`,
      });
      showToast('分享成功');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast('分享图已保存到相册');
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      showToast(err instanceof Error ? err.message : '分享失败');
    }
  }
}

export function forumCoverImage(post: ForumPost): string | null {
  return post.images?.[0] || null;
}
