import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db } from './db.js';
import { loadChineseCats, chineseCatsToForumSeed, chineseCatsToAdoptionSeed } from './chinese-cats-seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const XHM = '北京市大兴区西红门镇';
const XHM_LAT = 39.785;
const XHM_LNG = 116.362;

/** 北大猫协档案猫（保留） */
const PKU_FORUM = [
  {
    title: '西红门荟聚附近 · 姜丝鸭',
    content: '橘白田园猫，叫声像公鸭，在车棚下躲雨。参考燕园猫协档案，本地发现，急需接力救助。',
    breed: '橘白田园猫', age: '青年',
    address: `${XHM} 荟聚购物中心北侧`, lat: XHM_LAT + 0.002, lng: XHM_LNG + 0.001,
    status: 'found', user_name: '北大猫协志愿者', created_at: '2026-07-10T14:30:00',
    images: ['/cats/ginger.jpg'],
  },
  {
    title: '西红门地铁口 · 李美人',
    content: '长毛三花脸公猫，高颜值，性格高冷但亲人。猫协档案「李美人」，疑似走失家猫。',
    breed: '长毛三花（公）', age: '成年',
    address: `${XHM} 西红门地铁站B口`, lat: XHM_LAT, lng: XHM_LNG,
    status: 'found', user_name: '爱猫的小李', created_at: '2026-07-10T10:15:00',
    images: ['/cats/calico.jpg'],
  },
];

const PKU_ADOPTION = [
  { pet_name: '李美人', pet_type: 'cat', breed: '长毛三花（公）', age: '成年', gender: 'male', health: '已驱虫、已绝育', address: XHM, requirements: '室内养、封窗、接受回访', contact: '微信：pku_cat_xhm', status: 'available', description: '猫协档案参考，西红门发现，等待有缘人。', created_at: '2026-07-10T14:00:00', images: ['/cats/calico.jpg'] },
  { pet_name: '大盘鸡', pet_type: 'cat', breed: '对眼长毛橘猫', age: '成年', gender: 'male', health: '已驱虫、已疫苗', address: XHM, requirements: '封窗、科学喂养', contact: '微信：xhm_rescue', status: 'available', description: '亲人，吃饭时可以摸，猫协知名学长。', created_at: '2026-07-09T16:00:00', images: ['/cats/tabby.jpg'] },
];

function buildForumSeed() {
  const chinese = chineseCatsToForumSeed(loadChineseCats());
  return [...PKU_FORUM, ...chinese];
}

function buildAdoptionSeed() {
  const chinese = chineseCatsToAdoptionSeed(loadChineseCats());
  return [...PKU_ADOPTION, ...chinese];
}

function insertForumRows(posts) {
  const insertForum = db.prepare(`
    INSERT INTO forum_posts (id, user_name, title, content, images, breed, age, address, lat, lng, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const ids = [];
  posts.forEach((p) => {
    const id = uuid();
    ids.push(id);
    insertForum.run(
      id, p.user_name, p.title, p.content,
      JSON.stringify(p.images || []), p.breed, p.age,
      p.address, p.lat, p.lng, p.status, p.created_at
    );
  });
  return ids;
}

function seedDemoComments(postIds) {
  const insert = db.prepare(`
    INSERT INTO forum_comments (id, post_id, user_name, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const samples = ['加油！我可以帮忙联系医院', '已带航空箱过去', '这只猫好可爱，注意安全', '附近医院可以打车去'];
  postIds.slice(0, 4).forEach((pid, i) => {
    insert.run(uuid(), pid, '热心邻居', samples[i], `2026-07-11T0${8 + i}:30:00`);
  });
}

function insertAdoptionRows(listings) {
  const insertAdoption = db.prepare(`
    INSERT INTO adoption_listings (id, pet_name, pet_type, breed, age, gender, health, images, address, requirements, contact, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  listings.forEach((a) => {
    insertAdoption.run(
      uuid(), a.pet_name, a.pet_type, a.breed, a.age, a.gender, a.health,
      JSON.stringify(a.images), a.address, a.requirements, a.contact, a.status, a.description, a.created_at
    );
  });
}

export function patchCommunityData() {
  const hasChineseCats = db.prepare("SELECT 1 FROM forum_posts WHERE title LIKE '%橘猫%' OR title LIKE '%狸花猫%' OR title LIKE '%奶牛猫%' LIMIT 1").get();
  if (!hasChineseCats) {
    db.prepare('DELETE FROM forum_comments').run();
    db.prepare('DELETE FROM forum_posts').run();
    const ids = insertForumRows(buildForumSeed());
    seedDemoComments(ids);
    console.log(`Refreshed forum with PKU + chinese-cats (${buildForumSeed().length} posts).`);
  }

  db.prepare('DELETE FROM adoption_listings').run();
  insertAdoptionRows(buildAdoptionSeed());
  console.log(`Refreshed ${buildAdoptionSeed().length} adoption listings (PKU + chinese-cats).`);
}

export function seedCommunity() {
  const forumCount = db.prepare('SELECT COUNT(*) as c FROM forum_posts').get().c;
  if (forumCount > 0) {
    patchCommunityData();
    return;
  }
  const ids = insertForumRows(buildForumSeed());
  seedDemoComments(ids);
  insertAdoptionRows(buildAdoptionSeed());
  console.log(`Seeded ${buildForumSeed().length} forum posts, ${buildAdoptionSeed().length} adoption listings.`);
}