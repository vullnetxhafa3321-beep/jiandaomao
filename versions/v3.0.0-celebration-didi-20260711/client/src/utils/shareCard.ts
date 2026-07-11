import QRCode from 'qrcode';
import type { ForumPost } from '../types';
import { FORUM_STATUS } from './community';

const CARD_W = 750;
const CARD_H = 1100;

const FROG = {
  canvas: '#EAE3D3',
  paper: '#F5EFE3',
  ink: '#4A3F35',
  border: '#5A4E45',
  green: '#8CB866',
  wood: '#C2A88D',
  stone: '#A2A8A4',
};

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

function drawHandBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.strokeStyle = FROG.border;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [r, r * 0.75, r * 1.1, r * 0.6]);
  ctx.stroke();
}

export async function generateForumShareCard(post: ForumPost): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = FROG.canvas;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const imgH = 400;
  const imgUrl = post.images?.[0] || '/cats/stray.jpg';
  const shareUrl = `${window.location.origin}/forum/${post.id}`;

  try {
    const img = await loadImage(imgUrl);
    ctx.save();
    ctx.fillStyle = FROG.paper;
    ctx.beginPath();
    ctx.roundRect(36, 36, CARD_W - 72, imgH, [22, 16, 24, 14]);
    ctx.fill();
    drawHandBorder(ctx, 36, 36, CARD_W - 72, imgH, 22);
    ctx.beginPath();
    ctx.roundRect(48, 48, CARD_W - 96, imgH - 24, [18, 14, 20, 12]);
    ctx.clip();
    const scale = Math.max((CARD_W - 96) / img.width, (imgH - 24) / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, 48 + (CARD_W - 96 - sw) / 2, 48 + (imgH - 24 - sh) / 2, sw, sh);
    ctx.restore();
  } catch {
    ctx.fillStyle = FROG.paper;
    ctx.beginPath();
    ctx.roundRect(36, 36, CARD_W - 72, imgH, [22, 16, 24, 14]);
    ctx.fill();
    drawHandBorder(ctx, 36, 36, CARD_W - 72, imgH, 22);
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐱', CARD_W / 2, 36 + imgH / 2 + 30);
    ctx.textAlign = 'left';
  }

  const panelY = imgH + 20;
  const panelH = CARD_H - panelY - 36;
  ctx.fillStyle = FROG.paper;
  ctx.beginPath();
  ctx.roundRect(28, panelY, CARD_W - 56, panelH, [24, 18, 28, 16]);
  ctx.fill();
  drawHandBorder(ctx, 28, panelY, CARD_W - 56, panelH, 24);

  const status = FORUM_STATUS[post.status];
  ctx.font = 'bold 26px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = FROG.green;
  ctx.fillText(status.label.replace(/[🔴🟢🏠]\s*/, ''), 52, panelY + 48);

  ctx.font = 'bold 38px "ZCOOL KuaiLe", "PingFang SC", cursive';
  ctx.fillStyle = FROG.ink;
  let y = wrapText(ctx, post.title, 52, panelY + 100, CARD_W - 200, 46, 2);

  ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = FROG.stone;
  ctx.fillText(`📍 ${post.address}`, 52, y + 12);
  y += 52;

  ctx.fillStyle = FROG.ink;
  ctx.font = '26px "PingFang SC", sans-serif';
  y = wrapText(ctx, post.content, 52, y + 8, CARD_W - 200, 38, 3);

  if (post.breed || post.age) {
    ctx.font = 'bold 24px "PingFang SC", sans-serif';
    ctx.fillStyle = FROG.wood;
    ctx.fillText(`${post.breed || ''} · ${post.age || ''}`.replace(/^ · | · $/, ''), 52, y + 12);
    y += 36;
  }

  ctx.font = '22px "PingFang SC", sans-serif';
  ctx.fillStyle = FROG.stone;
  ctx.fillText(`👤 ${post.user_name}`, 52, CARD_H - 100);

  ctx.font = 'bold 32px "ZCOOL KuaiLe", "PingFang SC", cursive';
  ctx.fillStyle = FROG.ink;
  ctx.fillText('捡到猫了', 52, CARD_H - 52);

  const qrSize = 120;
  const qrX = CARD_W - 52 - qrSize;
  const qrY = CARD_H - 52 - qrSize;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: qrSize,
    margin: 1,
    color: { dark: FROG.ink, light: FROG.paper },
  });
  const qrImg = await loadImage(qrDataUrl);
  ctx.fillStyle = FROG.paper;
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  drawHandBorder(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.font = '18px "PingFang SC", sans-serif';
  ctx.fillStyle = FROG.stone;
  ctx.textAlign = 'right';
  ctx.fillText('扫码查看', qrX + qrSize, qrY - 12);
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
    showToast('分享图已保存（含右下角二维码）');
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      showToast(err instanceof Error ? err.message : '分享失败');
    }
  }
}

export function forumCoverImage(post: ForumPost): string | null {
  return post.images?.[0] || null;
}
