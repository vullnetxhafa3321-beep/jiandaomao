import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db, initDb, fuzzyCoords } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initDb();

const hospitalsPath = path.join(__dirname, '..', 'data', 'hospitals.json');
const hospitals = JSON.parse(fs.readFileSync(hospitalsPath, 'utf-8'));

export function seedDatabase() {
const existingUsers = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (existingUsers.c > 0) {
  console.log('Database already seeded, skipping.');
  return;
}

const users = [
  { id: uuid(), nickname: '王小明', avatar_url: '🧑', phone: '13800000001' },
  { id: uuid(), nickname: '李救助', avatar_url: '👩', phone: '13800000002' },
  { id: uuid(), nickname: '张爱心', avatar_url: '🧔', phone: '13800000003' },
];

const insertUser = db.prepare(
  'INSERT INTO users (id, phone, nickname, avatar_url) VALUES (?, ?, ?, ?)'
);
users.forEach((u) => insertUser.run(u.id, u.phone, u.nickname, u.avatar_url));

const seedRescues = [
  {
    user: users[0],
    content: '要不起，求附近姐妹支招！猫在小区草丛里不敢动，疑似受伤。',
    tags: ['要不起', '受伤'],
    status: 'discovered',
    lat: 31.2304,
    lng: 121.4737,
    address: '上海市黄浦区人民广场附近',
    cover: '🐱',
  },
  {
    user: users[1],
    content: '猫已进航空箱，准备送医，求推荐附近友好医院！',
    tags: ['已控制'],
    status: 'saved',
    lat: 31.2089,
    lng: 121.4452,
    address: '上海市静安区静安寺附近',
    cover: '📦',
  },
  {
    user: users[2],
    content: '检查完了，小猫健康状况良好，现在等一个家～',
    tags: ['幼猫'],
    status: 'adoption',
    lat: 31.2156,
    lng: 121.5278,
    address: '上海市浦东新区陆家嘴附近',
    cover: '😺',
    hospital_id: 'h004',
  },
  {
    user: users[0],
    content: '在楼道发现一只三花小母猫，很亲人，求领养！',
    tags: ['幼猫'],
    status: 'adoption',
    lat: 31.1923,
    lng: 121.4512,
    address: '上海市徐汇区天钥桥路附近',
    cover: '🐈',
    hospital_id: 'h020',
  },
  {
    user: users[1],
    content: '橘猫弟弟，已绝育疫苗齐全，性格超好，等一个家。',
    tags: ['要不起'],
    status: 'adoption',
    lat: 31.2656,
    lng: 121.5189,
    address: '上海市杨浦区五角场附近',
    cover: '😸',
    hospital_id: 'h007',
  },
];

const insertRescue = db.prepare(`
  INSERT INTO rescues (id, user_id, status, title, content, cover_url, images, tags, lat, lng, address_display, hospital_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertEvent = db.prepare(`
  INSERT INTO rescue_events (id, rescue_id, from_status, to_status, note)
  VALUES (?, ?, ?, ?, ?)
`);

seedRescues.forEach((r) => {
  const fuzzy = fuzzyCoords(r.lat, r.lng);
  const id = uuid();
  const title = r.content.slice(0, 50);
  insertRescue.run(
    id,
    r.user.id,
    r.status,
    title,
    r.content,
    r.cover,
    JSON.stringify([r.cover]),
    JSON.stringify(r.tags),
    fuzzy.lat,
    fuzzy.lng,
    r.address,
    r.hospital_id || null
  );
  insertEvent.run(uuid(), id, null, 'discovered', '发布了救助动态');
  if (r.status !== 'discovered') {
    insertEvent.run(uuid(), id, 'discovered', 'saved', '猫已安全控制');
  }
  if (r.status === 'adoption') {
    insertEvent.run(uuid(), id, 'saved', 'hospital', '前往医院');
    insertEvent.run(uuid(), id, 'hospital', 'treated', '完成检查');
    insertEvent.run(uuid(), id, 'treated', 'adoption', '开放领养');
  }
});

console.log(`Seeded ${users.length} users, ${seedRescues.length} rescues, ${hospitals.length} hospitals in JSON.`);
}

const isMain = process.argv[1]?.endsWith('seed.js');
if (isMain) {
  initDb();
  seedDatabase();
}
