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
const PORT = process.env.PORT || 3001;
const uploadsDir = path.join(__dirname, '..', 'uploads');
const hospitalsPath = path.join(__dirname, '..', 'data', 'hospitals.json');
const catCatalogPath = path.join(__dirname, '..', 'data', 'cat-catalog.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

initDb();

import { seedDatabase } from './seed.js';

seedDatabase();

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
  limits: { fileSize: 2 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json());
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
    address_display || '上海市'
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
  hospital: { next: 'treated', label: '已到院 / 已检查' },
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
  const { lat, lng, limit = 10 } = req.query;
  if (!lat || !lng) {
    return res.json({ items: hospitals.slice(0, parseInt(limit)) });
  }

  const items = hospitals
    .map((h) => ({
      ...h,
      distance_km: haversineKm(parseFloat(lat), parseFloat(lng), h.lat, h.lng),
    }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, parseInt(limit));

  res.json({ items });
});

app.get('/api/hospitals/:id', (req, res) => {
  const hospital = hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: '医院不存在' });
  res.json({ hospital });
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

// Serve frontend in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🐱 捡到猫 API running at http://localhost:${PORT}`);
});

export { STATUS_ACTIONS, STATUS_ORDER };
