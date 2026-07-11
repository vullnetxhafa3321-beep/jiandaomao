import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db, initDb, fuzzyCoords } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initDb();

const hospitalsPath = path.join(__dirname, '..', 'data', 'hospitals.json');
const catalogPath = path.join(__dirname, '..', 'data', 'cat-catalog.json');
const hospitals = JSON.parse(fs.readFileSync(hospitalsPath, 'utf-8'));
const catCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

export function seedDatabase() {
  const existingUsers = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (existingUsers.c > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const users = [
    { id: uuid(), nickname: '北大猫协志愿者', avatar_url: '🎓', phone: '13800000001' },
    { id: uuid(), nickname: '上海救助者', avatar_url: '👩', phone: '13800000002' },
    { id: uuid(), nickname: '云养姨姨', avatar_url: '🧔', phone: '13800000003' },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (id, phone, nickname, avatar_url) VALUES (?, ?, ?, ?)'
  );
  users.forEach((u) => insertUser.run(u.id, u.phone, u.nickname, u.avatar_url));

  const hospitalIds = ['h004', 'h020', 'h007', 'h017', 'h014', 'h019', 'h003'];

  const insertRescue = db.prepare(`
    INSERT INTO rescues (id, user_id, status, title, content, cover_url, images, tags, lat, lng, address_display, hospital_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO rescue_events (id, rescue_id, from_status, to_status, note)
    VALUES (?, ?, ?, ?, ?)
  `);

  const slugToId = {};

  catCatalog.forEach((cat, idx) => {
    const fuzzy = fuzzyCoords(31.2 + idx * 0.01, 121.45 + idx * 0.01);
    const id = uuid();
    slugToId[cat.slug] = id;
    const user = users[idx % users.length];

    insertRescue.run(
      id,
      user.id,
      cat.status,
      cat.content.slice(0, 50),
      cat.content,
      cat.image,
      JSON.stringify([cat.image]),
      JSON.stringify(cat.tags),
      fuzzy.lat,
      fuzzy.lng,
      cat.address,
      hospitalIds[idx % hospitalIds.length] || null
    );

    insertEvent.run(uuid(), id, null, 'discovered', '发布了救助动态');
    if (cat.status !== 'discovered') {
      insertEvent.run(uuid(), id, 'discovered', 'saved', '猫已安全控制');
    }
    if (['adoption', 'homeward', 'closed'].includes(cat.status)) {
      insertEvent.run(uuid(), id, 'saved', 'hospital', '前往医院');
      insertEvent.run(uuid(), id, 'hospital', 'treated', '完成检查');
      if (cat.status === 'adoption') {
        insertEvent.run(uuid(), id, 'treated', 'adoption', '开放领养');
      } else {
        insertEvent.run(uuid(), id, 'treated', 'homeward', '已找到家');
        insertEvent.run(uuid(), id, 'homeward', 'closed', '领养结案');
      }
    }
  });

  // 额外一条「刚发现」用于演示完整流程
  const discoveredId = uuid();
  insertRescue.run(
    discoveredId,
    users[1].id,
    'discovered',
    '要不起，求附近姐妹支招！',
    '要不起，求附近姐妹支招！猫在小区草丛里不敢动，疑似受伤。',
    '/cats/stray.jpg',
    JSON.stringify(['/cats/stray.jpg']),
    JSON.stringify(['要不起', '受伤']),
    fuzzyCoords(31.2304, 121.4737).lat,
    fuzzyCoords(31.2304, 121.4737).lng,
    '上海市黄浦区人民广场附近',
    null
  );
  insertEvent.run(uuid(), discoveredId, null, 'discovered', '发布了救助动态');
  slugToId['discovered-demo'] = discoveredId;

  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'cat-slug-map.json'),
    JSON.stringify(slugToId, null, 2)
  );

  console.log(
    `Seeded ${users.length} users, ${catCatalog.length + 1} rescues from cat catalog, ${hospitals.length} hospitals.`
  );
}

const isMain = process.argv[1]?.endsWith('seed.js');
if (isMain) {
  seedDatabase();
}
