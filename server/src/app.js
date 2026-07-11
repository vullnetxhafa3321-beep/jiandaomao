import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import {
  db,
  initDb,
  parseJson,
  haversineKm,
  fuzzyCoords,
  getNextStatus,
  STATUS_ORDER,
} from './db.js';
import { authMiddleware, optionalAuth, signToken, verifyMockCode } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const writableRoot = isServerless ? '/tmp' : path.join(__dirname, '..');
const uploadsDir = path.join(writableRoot, 'uploads');
const hospitalsPath = path.join(__dirname, '..', 'data', 'hospitals.json');
const catCatalogPath = path.join(__dirname, '..', 'data', 'cat-catalog.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

initDb();

import { seedDatabase } from './seed.js';
import { seedCommunity } from './community-seed.js';
import { registerCommunityRoutes } from './community-routes.js';
import { buildNearbyFriendlyHospitals } from './nearby-hospitals.js';
import {
  baiduConfigured,
  normalizeBaiduResult,
  recognizeAnimalBuffer,
} from './baidu-animal.js';
import https from 'https';

seedDatabase();
seedCommunity();

const hospitals = JSON.parse(fs.readFileSync(hospitalsPath, 'utf-8'));
const catCatalog = JSON.parse(fs.readFileSync(catCatalogPath, 'utf-8'));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use('/uploads', express.static(uploadsDir));

function formatRescue(row, extra = {}) {
  if (!row) return null;
  const user = db.prepare('SELECT id, nickname, avatar_url FROM users WHERE id = ?').get(row.user_id);
  let hospital = null;
  if (row.hospital_id) {
    hospital = hospitals.find((h) => h.id === row.hospital_id) || null;
  }
  return {
    ...row,
    images: parseJson(row.images),
    tags: parseJson(row.tags),
    user,
    hospital,
    ...extra,
  };
}

// --- Auth ---
app.post('/api/auth/login', (req, res) => {
  const { phone, code, nickname } = req.body;

  if (nickname && !phone) {
    const id = uuid();
    db.prepare('INSERT INTO users (id, nickname, avatar_url) VALUES (?, ?, ?)').run(
      id,
      nickname.slice(0, 20),
      '🐾'
    );
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return res.json({ token: signToken(user), user });
  }

  if (!phone || !code) {
    return res.status(400).json({ error: '请提供手机号和验证码，或使用昵称快速体验' });
  }
  if (!verifyMockCode(code)) {
    return res.status(400).json({ error: '验证码错误（演示码：123456）' });
  }

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) {
    const id = uuid();
    db.prepare('INSERT INTO users (id, phone, nickname, avatar_url) VALUES (?, ?, ?, ?)').run(
      id,
      phone,
      `用户${phone.slice(-4)}`,
      '👤'
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  res.json({ token: signToken(user), user });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, phone, nickname, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// --- Feed ---
app.get('/api/feed', optionalAuth, (req, res) => {
  const { tab = 'latest', lat, lng, radius = 5 } = req.query;
  const rows = db
    .prepare('SELECT * FROM rescues ORDER BY created_at DESC')
    .all();

  let items = rows.map((row) => {
    const item = formatRescue(row);
    if (lat && lng) {
      item.distance_km = haversineKm(parseFloat(lat), parseFloat(lng), row.lat, row.lng);
    }
    return item;
  });

  if (tab === 'nearby' && lat && lng) {
    const r = parseFloat(radius);
    items = items
      .filter((i) => i.distance_km !== undefined && i.distance_km <= r)
      .sort((a, b) => a.distance_km - b.distance_km);
  }

  res.json({ items });
});

// --- Rescues ---
app.post('/api/rescues', authMiddleware, upload.array('images', 9), (req, res) => {
  const { content, tags, lat, lng, address_display } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ error: '请填写描述' });
  }
  if (!lat || !lng) {
    return res.status(400).json({ error: '请提供定位' });
  }

  const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
  const fuzzy = fuzzyCoords(parseFloat(lat), parseFloat(lng));

  const imageUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const cover = imageUrls[0] || '🐱';
  const id = uuid();

  db.prepare(`
    INSERT INTO rescues (id, user_id, status, title, content, cover_url, images, tags, lat, lng, address_display)
    VALUES (?, ?, 'discovered', ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.user.id,
    content.slice(0, 50),
    content,
    cover,
    JSON.stringify(imageUrls.length ? imageUrls : ['🐱']),
    JSON.stringify(parsedTags),
    fuzzy.lat,
    fuzzy.lng,
    address_display || '北京市大兴区西红门镇'
  );

  db.prepare(
    'INSERT INTO rescue_events (id, rescue_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)'
  ).run(uuid(), id, null, 'discovered', '发布了救助动态');

  const rescue = formatRescue(db.prepare('SELECT * FROM rescues WHERE id = ?').get(id));
  res.status(201).json({ rescue });
});

app.get('/api/rescues/:id', optionalAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '救助记录不存在' });

  const events = db
    .prepare('SELECT * FROM rescue_events WHERE rescue_id = ? ORDER BY created_at ASC')
    .all(req.params.id);

  const reports = db
    .prepare('SELECT * FROM report_images WHERE rescue_id = ? ORDER BY created_at ASC')
    .all(req.params.id);

  res.json({
    rescue: formatRescue(row),
    events,
    reports,
    is_owner: req.user?.id === row.user_id,
  });
});

const STATUS_ACTIONS = {
  discovered: { next: 'saved', label: '猫已安全控制 · 救了' },
  saved: { next: 'hospital', redirect: 'hospital' },
  hospital: { next: 'treated', label: '已就医' },
  treated: { branches: ['adoption', 'homeward'] },
  adoption: { next: 'closed', label: '已找到家 · 结案' },
  homeward: { next: 'closed', label: '结案' },
};

app.patch('/api/rescues/:id/status', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '救助记录不存在' });
  if (row.user_id !== req.user.id) return res.status(403).json({ error: '仅发布者可操作' });

  const { status: targetStatus, note } = req.body;
  const expected = getNextStatus(row.status);

  // treated -> adoption or homeward branch
  if (row.status === 'treated' && ['adoption', 'homeward'].includes(targetStatus)) {
    // ok
  } else if (targetStatus !== expected) {
    return res.status(400).json({ error: `当前状态 ${row.status} 无法变更为 ${targetStatus}` });
  }

  db.prepare("UPDATE rescues SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    targetStatus,
    req.params.id
  );

  db.prepare(
    'INSERT INTO rescue_events (id, rescue_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)'
  ).run(uuid(), req.params.id, row.status, targetStatus, note || null);

  const rescue = formatRescue(db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id));
  res.json({ rescue });
});

app.post('/api/rescues/:id/hospital', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '救助记录不存在' });
  if (row.user_id !== req.user.id) return res.status(403).json({ error: '仅发布者可操作' });

  const { hospital_id } = req.body;
  const hospital = hospitals.find((h) => h.id === hospital_id);
  if (!hospital) return res.status(400).json({ error: '医院不存在' });

  const newStatus = row.status === 'saved' ? 'hospital' : row.status;
  db.prepare("UPDATE rescues SET hospital_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?").run(
    hospital_id,
    newStatus,
    req.params.id
  );

  if (row.status === 'saved') {
    db.prepare(
      'INSERT INTO rescue_events (id, rescue_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)'
    ).run(uuid(), req.params.id, 'saved', 'hospital', `选择了${hospital.name}`);
  }

  const rescue = formatRescue(db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id));
  res.json({ rescue, hospital });
});

app.post('/api/rescues/:id/reports', authMiddleware, upload.array('images', 5), (req, res) => {
  const row = db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '救助记录不存在' });
  if (row.user_id !== req.user.id) return res.status(403).json({ error: '仅发布者可操作' });

  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: '请上传图片' });

  const insert = db.prepare(
    'INSERT INTO report_images (id, rescue_id, url) VALUES (?, ?, ?)'
  );

  files.forEach((f) => {
    insert.run(uuid(), req.params.id, `/uploads/${f.filename}`);
  });

  if (row.status === 'hospital') {
    db.prepare("UPDATE rescues SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
      'treated',
      req.params.id
    );
    db.prepare(
      'INSERT INTO rescue_events (id, rescue_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)'
    ).run(uuid(), req.params.id, 'hospital', 'treated', '上传了检查报告');
  }

  const reports = db
    .prepare('SELECT * FROM report_images WHERE rescue_id = ? ORDER BY created_at ASC')
    .all(req.params.id);

  const rescue = formatRescue(db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id));
  res.json({ reports, rescue });
});

app.post('/api/rescues/:id/didi-jump', optionalAuth, (req, res) => {
  const { hospital_id, channel } = req.body;
  db.prepare(
    'INSERT INTO didi_jump_logs (id, rescue_id, hospital_id, channel) VALUES (?, ?, ?, ?)'
  ).run(uuid(), req.params.id, hospital_id, channel || 'unknown');
  res.json({ ok: true });
});

// --- Hospitals ---
app.get('/api/hospitals/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const limit = Math.max(10, parseInt(req.query.limit, 10) || 12);
  const items = buildNearbyFriendlyHospitals(
    Number.isFinite(lat) ? lat : 39.785,
    Number.isFinite(lng) ? lng : 116.362,
    limit
  );
  res.json({ items });
});

// 必须在 /hospitals/:id 之前注册，否则 nearby-friendly / priced 会被当成 id
app.get('/api/hospitals/nearby-friendly', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const limit = Math.max(10, parseInt(req.query.limit, 10) || 12);
  const items = buildNearbyFriendlyHospitals(
    Number.isFinite(lat) ? lat : 39.785,
    Number.isFinite(lng) ? lng : 116.362,
    limit
  );
  res.json({
    items,
    center: {
      lat: Number.isFinite(lat) ? lat : 39.785,
      lng: Number.isFinite(lng) ? lng : 116.362,
    },
  });
});

app.get('/api/hospitals/priced', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const items = buildNearbyFriendlyHospitals(
    Number.isFinite(lat) ? lat : 39.785,
    Number.isFinite(lng) ? lng : 116.362,
    12
  );
  res.json({ items });
});

// --- Cat catalog (北大猫协公开档案 + 真实照片) ---
app.get('/api/cat-catalog', (_req, res) => {
  const rescues = db.prepare('SELECT id, cover_url, content, status FROM rescues').all();
  const items = catCatalog.map((cat) => {
    const match = rescues.find(
      (r) => r.cover_url === cat.image || r.content === cat.content
    );
    return {
      ...cat,
      rescue_id: match?.id || null,
      status: match?.status || cat.status,
    };
  });
  res.json({ items });
});

// --- User rescues ---
app.get('/api/me/rescues', authMiddleware, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM rescues WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json({ items: rows.map((r) => formatRescue(r)) });
});

// --- Baidu animal recognition (free tier) ---
function resolveLocalImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const clean = imageUrl.split('?')[0];
  if (clean.startsWith('/uploads/')) {
    return path.join(uploadsDir, path.basename(clean));
  }
  if (clean.startsWith('/cats/') || clean.startsWith('/assets/')) {
    const rel = clean.replace(/^\//, '');
    const candidates = [
      path.join(__dirname, '..', '..', 'client', 'public', rel),
      path.join(__dirname, '..', '..', 'client', 'dist', rel),
    ];
    return candidates.find((p) => fs.existsSync(p)) || null;
  }
  return null;
}

async function loadImageBufferFromUrl(imageUrl, req) {
  const local = resolveLocalImagePath(imageUrl);
  if (local && fs.existsSync(local)) return fs.readFileSync(local);

  let absolute = imageUrl;
  if (imageUrl.startsWith('/')) {
    const host = req.get('x-forwarded-host') || req.get('host');
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    absolute = `${proto}://${host}${imageUrl}`;
  }
  const res = await fetch(absolute);
  if (!res.ok) throw new Error(`无法读取图片: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** 兼容参考仓库：代理 token */
app.get('/api/baidu/token', (req, res) => {
  const params = new URLSearchParams(req.query).toString();
  https
    .get(`https://aip.baidubce.com/oauth/2.0/token?${params}`, (proxyRes) => {
      res.status(proxyRes.statusCode || 200);
      proxyRes.pipe(res);
    })
    .on('error', () => res.status(502).json({ error: '代理请求失败' }));
});

/** 兼容参考仓库：代理动物识别 */
app.post('/api/baidu/animal', (req, res) => {
  const params = new URLSearchParams(req.query).toString();
  const url = `https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?${params}`;
  const proxyReq = https.request(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
      },
    },
    (proxyRes) => {
      res.status(proxyRes.statusCode || 200);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', () => res.status(502).json({ error: '代理请求失败' }));
  req.pipe(proxyReq);
});

/** 推荐：服务端持钥识别（上传文件 / base64 / 已有图片 URL） */
app.post('/api/baidu/recognize', upload.single('image'), async (req, res) => {
  try {
    if (!baiduConfigured() && !req.query.access_token && !req.body?.access_token) {
      // 若服务端未配置密钥，仍允许客户端自带 token（开发兼容）
      if (!req.file && !req.body?.image && !req.body?.image_url && !req.body?.image_base64) {
        return res.status(503).json({
          error: '百度 AI 未配置。请在服务端设置 BAIDU_API_KEY 与 BAIDU_SECRET_KEY（免费额度约 500 次/天）',
          configured: false,
        });
      }
    }

    let buffer = null;
    if (req.file) {
      buffer = fs.readFileSync(req.file.path);
      try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
    } else if (req.body?.image_base64 || req.body?.image) {
      const raw = String(req.body.image_base64 || req.body.image);
      const b64 = raw.includes(',') ? raw.split(',')[1] : raw;
      buffer = Buffer.from(b64, 'base64');
    } else if (req.body?.image_url) {
      buffer = await loadImageBufferFromUrl(String(req.body.image_url), req);
    } else {
      return res.status(400).json({ error: '请上传图片或提供 image_url / image_base64' });
    }

    let data;
    if (baiduConfigured()) {
      data = await recognizeAnimalBuffer(buffer);
    } else {
      // 无服务端密钥时：用请求里的 access_token 直调（与参考仓库一致）
      const token = req.body.access_token || req.query.access_token;
      if (!token) {
        return res.status(503).json({
          error: '百度 AI 未配置。请设置 BAIDU_API_KEY / BAIDU_SECRET_KEY',
          configured: false,
        });
      }
      const formBody = new URLSearchParams();
      formBody.append('image', buffer.toString('base64'));
      formBody.append('top_num', '5');
      formBody.append('baike_num', '0');
      const r = await fetch(
        `https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody.toString(),
        }
      );
      const raw = await r.json();
      if (raw.error_code) throw new Error(raw.error_msg || `错误码 ${raw.error_code}`);
      data = normalizeBaiduResult(raw);
    }

    res.json({ ...data, configured: true });
  } catch (err) {
    console.error('[baidu/recognize]', err);
    res.status(502).json({ error: err.message || '识别失败', configured: baiduConfigured() });
  }
});

app.get('/api/baidu/status', (_req, res) => {
  res.json({ configured: baiduConfigured() });
});

// --- Community routes (队友功能) ---
registerCommunityRoutes(app, upload);

// Multer / upload errors → JSON (avoid opaque "network error" on client)
app.use((err, _req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '图片太大，请压缩到 10MB 以内后再上传' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '一次上传图片过多' });
    }
    return res.status(400).json({ error: `上传失败：${err.message}` });
  }
  if (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || '服务器错误' });
  }
  return next();
});


// 放在具体路径之后，避免吃掉 nearby / nearby-friendly / priced
app.get('/api/hospitals/:id', (req, res) => {
  const reserved = new Set(['nearby', 'nearby-friendly', 'priced']);
  if (reserved.has(req.params.id)) {
    return res.status(404).json({ error: '路由未匹配' });
  }
  const hospital = hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: '医院不存在' });
  res.json({ hospital });
});

// --- OG meta for sharing ---
app.get('/api/og/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM rescues WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });

  const statusTitles = {
    discovered: '我捡到猫了但要不起，求支招🐱',
    saved: '救了！一只猫被我安全控制住了',
    hospital: '正在送医，希望没事',
    treated: '检查完毕，等一个家',
    adoption: '上海 · 一只猫找领养',
    homeward: '小猫找到家了 🏠',
    closed: '救助已结案',
  };

  res.json({
    title: statusTitles[row.status] || row.title,
    description: row.content.slice(0, 100),
    image: row.cover_url?.startsWith('/') ? row.cover_url : undefined,
    url: `/r/${row.id}`,
  });
});

// 静态资源：本地 / Docker 同域托管；Vercel 由 CDN 托管前端，API 函数不托管 SPA
if (!process.env.VERCEL) {
  const clientPublic = path.join(__dirname, '..', '..', 'client', 'public');
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(clientPublic)) {
    app.use(express.static(clientPublic));
  }
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

export { STATUS_ACTIONS, STATUS_ORDER };
export default app;
