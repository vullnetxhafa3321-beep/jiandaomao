import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db, parseJson, haversineKm } from './db.js';
import { optionalAuth } from './auth.js';
import {
  buildNearbyFriendlyHospitals,
  fuzzLatLng,
  fuzzyAddressLabel,
} from './nearby-hospitals.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const shelters = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'shelters.json'), 'utf-8'));
const guideSteps = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'guide-steps.json'), 'utf-8'));

const DEFAULT_CENTER = { lat: 39.785, lng: 116.362 };

function nowIso() {
  return new Date().toISOString();
}

function formatForum(row) {
  return {
    ...row,
    images: parseJson(row.images),
    contact: row.contact || '',
    rescuer_name: row.rescuer_name || null,
    location_fuzzy: true,
  };
}

function formatAdoption(row) {
  return {
    ...row,
    images: parseJson(row.images),
    sterilized: row.sterilized || null,
    vaccinated: row.vaccinated || null,
  };
}

function formatComment(row) {
  return { ...row, images: parseJson(row.images || '[]') };
}

export function registerCommunityRoutes(app, upload) {
  if (!upload) {
    throw new Error('registerCommunityRoutes requires multer upload middleware');
  }
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

  /** Unified nearby friendly — registered in app.js before :id; keep thin wrappers for compat */
  app.get('/api/hospitals/nearby-friendly', (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const limit = Math.max(10, parseInt(req.query.limit, 10) || 12);
    const items = buildNearbyFriendlyHospitals(
      Number.isFinite(lat) ? lat : DEFAULT_CENTER.lat,
      Number.isFinite(lng) ? lng : DEFAULT_CENTER.lng,
      limit
    );
    res.json({ items, center: { lat: Number.isFinite(lat) ? lat : DEFAULT_CENTER.lat, lng: Number.isFinite(lng) ? lng : DEFAULT_CENTER.lng } });
  });

  app.get('/api/hospitals/priced', (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const items = buildNearbyFriendlyHospitals(
      Number.isFinite(lat) ? lat : DEFAULT_CENTER.lat,
      Number.isFinite(lng) ? lng : DEFAULT_CENTER.lng,
      12
    );
    res.json({ items });
  });

  app.get('/api/map/markers', (req, res) => {
    const lat = parseFloat(req.query.lat) || DEFAULT_CENTER.lat;
    const lng = parseFloat(req.query.lng) || DEFAULT_CENTER.lng;

    const forum = db
      .prepare('SELECT * FROM forum_posts WHERE lat IS NOT NULL AND lng IS NOT NULL')
      .all()
      .map((row) => ({
        ...formatForum(row),
        distance_km: haversineKm(lat, lng, row.lat, row.lng),
      }));

    const shelterMarkers = shelters
      .map((s) => {
        const p = fuzzLatLng(s.lat, s.lng, String(s.id).length);
        return {
          ...s,
          lat: p.lat ?? s.lat,
          lng: p.lng ?? s.lng,
          address: fuzzyAddressLabel(s.address),
          distance_km: haversineKm(lat, lng, p.lat ?? s.lat, p.lng ?? s.lng),
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    const hospitalMarkers = buildNearbyFriendlyHospitals(lat, lng, 12);

    res.json({ center: { lat, lng }, forum, shelters: shelterMarkers, hospitals: hospitalMarkers });
  });

  app.get('/api/guide/steps', (_req, res) => {
    res.json({ items: guideSteps });
  });

  /** 土味喜报条幅数据 */
  app.get('/api/celebrations', (_req, res) => {
    const rescued = db
      .prepare("SELECT title, user_name, rescuer_name, breed, status, created_at FROM forum_posts WHERE status IN ('rescued','adopted') ORDER BY created_at DESC LIMIT 20")
      .all();
    const adopted = db
      .prepare("SELECT pet_name, contact, status, created_at FROM adoption_listings WHERE status = 'adopted' ORDER BY created_at DESC LIMIT 10")
      .all();

    const items = [];
    rescued.forEach((r) => {
      const nick = (r.title || '').split('·').pop()?.trim() || r.breed || '小猫';
      if (r.status === 'adopted') {
        items.push(`🎉 喜报！恭喜「${nick}」找到长期饭票，正式入住温馨小窝！！`);
      } else {
        const who = r.rescuer_name || '热心网友';
        items.push(`🔥 喜报！「${nick}」已被网友「${who}」成功救助～功德无量！！`);
      }
    });
    adopted.forEach((a) => {
      items.push(`🏆 热烈祝贺「${a.pet_name}」领养成功！！撒花撒花 🎊`);
    });

    const tacky = [
      '📣 本台讯：又一只小流浪猫喜提新家，功德+1',
      '👏 救助喜报连播中… 下一位幸运小猫会是你家的吗？',
      '✨ 恭喜路过好心人出手相助，喵星人有救了！',
      '🎈 土味祝福：愿每一只街猫都有碗热饭、一扇窗！',
    ];
    if (items.length < 4) items.push(...tacky);
    else items.push(...tacky.slice(0, 2));

    res.json({ items });
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
    const { title, content, address, lat, lng, status = 'found', breed, age, contact } = req.body;
    if (!title?.trim() || !address?.trim()) {
      return res.status(400).json({ error: '请填写标题和地址' });
    }
    if (!contact?.trim()) {
      return res.status(400).json({ error: '请填写联系方式，方便他人询问具体位置' });
    }
    const id = uuid();
    const user_name = req.user?.nickname || '匿名好心人';
    const fuzzyAddr = fuzzyAddressLabel(address);
    const fuzzy = fuzzLatLng(
      lat != null ? parseFloat(lat) : DEFAULT_CENTER.lat,
      lng != null ? parseFloat(lng) : DEFAULT_CENTER.lng,
      title.length
    );
    db.prepare(`
      INSERT INTO forum_posts (id, user_id, user_name, title, content, images, breed, age, address, lat, lng, status, contact, created_at)
      VALUES (?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user?.id || null, user_name, title, content || '', breed || '', age || '',
      fuzzyAddr, fuzzy.lat, fuzzy.lng, status, contact.trim().slice(0, 60), nowIso()
    );
    const post = formatForum(db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(id));
    res.status(201).json({ post });
  });

  /** 标记已救助 / 已领养，留下网名 */
  app.patch('/api/forum/posts/:id/status', optionalAuth, (req, res) => {
    const { status, rescuer_name } = req.body;
    if (!['found', 'rescued', 'adopted'].includes(status)) {
      return res.status(400).json({ error: '无效状态' });
    }
    const row = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: '帖子不存在' });

    const name =
      (rescuer_name && String(rescuer_name).trim()) ||
      req.user?.nickname ||
      null;

    if ((status === 'rescued' || status === 'adopted') && !name) {
      return res.status(400).json({ error: '请留下你的网名' });
    }

    db.prepare(
      'UPDATE forum_posts SET status = ?, rescuer_name = ? WHERE id = ?'
    ).run(status, status === 'found' ? null : name.slice(0, 30), req.params.id);

    const post = formatForum(db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id));
    res.json({ post });
  });

  app.get('/api/forum/posts/:id/comments', (req, res) => {
    const rows = db.prepare(
      'SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at ASC'
    ).all(req.params.id);
    res.json({ items: rows.map(formatComment) });
  });

  app.post('/api/forum/posts/:id/comments', optionalAuth, upload.array('images', 5), (req, res) => {
    const { content, user_name: guestName } = req.body;
    const imageUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
    if (!content?.trim() && imageUrls.length === 0) {
      return res.status(400).json({ error: '请填写评论或上传图片' });
    }
    const post = db.prepare('SELECT id FROM forum_posts WHERE id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    const id = uuid();
    const user_name = req.user?.nickname || guestName?.trim() || '游客';
    db.prepare(`
      INSERT INTO forum_comments (id, post_id, user_id, user_name, content, images, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.params.id,
      req.user?.id || null,
      user_name.slice(0, 30),
      (content || '').trim(),
      JSON.stringify(imageUrls),
      nowIso()
    );

    const comment = formatComment(db.prepare('SELECT * FROM forum_comments WHERE id = ?').get(id));
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

  app.post('/api/adoptions', optionalAuth, upload.array('images', 9), (req, res) => {
    const {
      pet_name, pet_type, breed, age, gender, health, sterilized, vaccinated,
      description, address, requirements, contact, status = 'available', rescue_id,
    } = req.body;
    if (!pet_name?.trim() || !contact?.trim()) {
      return res.status(400).json({ error: '请填写宠物名字和联系方式' });
    }
    const imageUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const id = uuid();
    db.prepare(`
      INSERT INTO adoption_listings (
        id, user_id, pet_name, pet_type, breed, age, gender, health, sterilized, vaccinated,
        images, address, requirements, contact, status, description, rescue_id, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user?.id || null,
      pet_name.trim(),
      pet_type || 'cat',
      breed || '',
      age || '',
      gender || 'unknown',
      health || '',
      sterilized || null,
      vaccinated || null,
      JSON.stringify(imageUrls),
      address || '',
      requirements || '',
      contact.trim(),
      status,
      description || '',
      rescue_id || null,
      nowIso()
    );
    const listing = formatAdoption(db.prepare('SELECT * FROM adoption_listings WHERE id = ?').get(id));
    res.status(201).json({ listing });
  });
}
