import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.VERCEL ? null : 'jiandaomao-hackathon-secret');

if (!JWT_SECRET) {
  console.warn(
    '[auth] 未设置 JWT_SECRET。Vercel 生产环境请在 Environment Variables 中配置随机密钥。'
  );
}

const EFFECTIVE_SECRET = JWT_SECRET || 'jiandaomao-hackathon-secret';
const MOCK_CODE = '123456';

/**
 * JWT 仍有效但用户行可能已丢失（Serverless /tmp SQLite 冷启动重置）。
 * 按 token 声明重建用户，避免 FOREIGN KEY 导致发布失败。
 */
export function ensureUserFromReq(req) {
  if (!req.user?.id) return null;
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.id);
  if (existing) return req.user.id;
  const nickname = String(req.user.nickname || '好心人').slice(0, 20) || '好心人';
  db.prepare('INSERT INTO users (id, nickname, avatar_url) VALUES (?, ?, ?)').run(
    req.user.id,
    nickname,
    '🐾'
  );
  return req.user.id;
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    req.user = jwt.verify(header.slice(7), EFFECTIVE_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期' });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), EFFECTIVE_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, nickname: user.nickname },
    EFFECTIVE_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyMockCode(code) {
  return code === MOCK_CODE;
}
