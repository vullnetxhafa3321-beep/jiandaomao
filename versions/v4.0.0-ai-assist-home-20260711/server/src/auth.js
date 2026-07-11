import jwt from 'jsonwebtoken';

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
