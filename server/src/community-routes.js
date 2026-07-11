import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db, parseJson, haversineKm } from './db.js';
import { authMiddleware, optionalAuth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const shelters = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'shelters.json'), 'utf-8'));
const bjHospitals = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bj-hospitals.json'), 'utf-8'));
const guideSteps = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'guide-steps.json'), 'utf-8'));

function formatForum(row) {
  return { ...row, images: parseJson(row.images) };
}

function formatAdoption(row) {
  return { ...row, images: parseJson(row.images) };
}

export function registerCommunityRoutes(app) {
  app.get('/api/shelters', (req, res) => {
    const { lat, lng } = req.query;
    let items = shelters;
    if (lat && lng) {
      items = shelters
        .map((s) => ({
          ...s,
          distance_km: haversineKm(parseFloat(lat), parseFloat(lng), s.lat, s.lng),
        }))
        .sort((a, b) => a.distance_km - b.distance_km);
    }
    res.json({ items });
  });

  app.get('/api/hospitals/priced', (req, res) => {
    const { lat, lng } = req.query;
    let items = bjHospitals;
    if (lat && lng) {
      items = bjHospitals
        .map((h) => ({
          ...h,
          distance_km: haversineKm(parseFloat(lat), parseFloat(lng), h.lat, h.lng),
        }))
        .sort((a, b) => a.distance_km - b.distance_km);
    }
    res.json({ items });
  });

  app.get('/api/guide/steps', (_req, res) => {
    res.json({ items: guideSteps });
  });

  app.get('/api/forum/posts', (_req, res) => {
    const rows = db.prepare('SELECT * FROM forum_posts ORDER BY created_at DESC').all();
    res.json({ items: rows.map(formatForum) });
  });

  app.get('/api/forum/posts/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: '帖子不存在' });
    res.json({ post: formatForum(row) });
  });

  app.post('/api/forum/posts', optionalAuth, (req, res) => {
    const { title, content, address, lat, lng, status = 'found', breed, age } = req.body;
    if (!title?.trim() || !address?.trim()) {
      return res.status(400).json({ error: '请填写标题和地址' });
    }
    const id = uuid();
    const user_name = req.user?.nickname || '匿名好心人';
    db.prepare(`
      INSERT INTO forum_posts (id, user_id, user_name, title, content, images, breed, age, address, lat, lng, status)
      VALUES (?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?)
    `).run(id, req.user?.id || null, user_name, title, content || '', breed || '', age || '', address, lat || null, lng || null, status);
    const post = formatForum(db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(id));
    res.status(201).json({ post });
  });

  app.get('/api/forum/posts/:id/comments', (req, res) => {
    const rows = db.prepare(
      'SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at ASC'
    ).all(req.params.id);
    res.json({ items: rows });
  });

  app.post('/api/forum/posts/:id/comments', optionalAuth, (req, res) => {
    const { content, user_name: guestName } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: '请填写评论内容' });
    }
    const post = db.prepare('SELECT id FROM forum_posts WHERE id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    const id = uuid();
    const user_name = req.user?.nickname || guestName?.trim() || '游客';
    db.prepare(`
      INSERT INTO forum_comments (id, post_id, user_id, user_name, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.params.id, req.user?.id || null, user_name.slice(0, 30), content.trim());

    const comment = db.prepare('SELECT * FROM forum_comments WHERE id = ?').get(id);
    res.status(201).json({ comment });
  });

  app.get('/api/adoptions', (req, res) => {
    const { pet_type } = req.query;
    let rows = db.prepare('SELECT * FROM adoption_listings ORDER BY created_at DESC').all();
    if (pet_type && pet_type !== 'all') {
      rows = rows.filter((r) => r.pet_type === pet_type);
    }
    res.json({ items: rows.map(formatAdoption) });
  });

  app.get('/api/adoptions/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM adoption_listings WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: '领养信息不存在' });
    res.json({ listing: formatAdoption(row) });
  });

  app.post('/api/adoptions', optionalAuth, (req, res) => {
    const {
      pet_name, pet_type, breed, age, gender, health, description,
      address, requirements, contact, status = 'available',
    } = req.body;
    if (!pet_name?.trim() || !contact?.trim()) {
      return res.status(400).json({ error: '请填写宠物名字和联系方式' });
    }
    const id = uuid();
    db.prepare(`
      INSERT INTO adoption_listings (id, user_id, pet_name, pet_type, breed, age, gender, health, address, requirements, contact, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user?.id || null, pet_name, pet_type || 'cat', breed || '', age || '',
      gender || 'unknown', health || '', address || '', requirements || '',
      contact, status, description || ''
    );
    const listing = formatAdoption(db.prepare('SELECT * FROM adoption_listings WHERE id = ?').get(id));
    res.status(201).json({ listing });
  });
}
