import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const XHM = '北京市大兴区西红门镇';
const XHM_LAT = 39.785;
const XHM_LNG = 116.362;

/** 名字/品种参考北大猫协公众号公开报道 · 照片为品种示意 */
const FORUM_SEED = [
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
  {
    title: '欣海北街 · 大盘鸡',
    content: '对眼长毛橘猫，被猫协称为「北大燕小六」，很亲人，吃饭时可以一直摸。',
    breed: '对眼长毛橘猫', age: '成年',
    address: `${XHM} 欣海北街`, lat: XHM_LAT - 0.001, lng: XHM_LNG + 0.002,
    status: 'found', user_name: '云养人', created_at: '2026-07-09T18:00:00',
    images: ['/cats/tabby.jpg'],
  },
  {
    title: '宏福路 · 大威',
    content: '狸花公猫，猫协档案在校9年的元老，性格稳定，已做基础投喂。',
    breed: '狸花猫', age: '老年（约9年+）',
    address: `${XHM} 宏福路`, lat: XHM_LAT + 0.001, lng: XHM_LNG - 0.001,
    status: 'rescued', user_name: '北大猫协', created_at: '2026-07-09T09:30:00',
    images: ['/cats/tabby.jpg'],
  },
  {
    title: '兴海路 · 薛定谔的亲人',
    content: '白猫，时亲时躲，猫协取名「薛定谔的亲人」，在小区垃圾站附近出没。',
    breed: '白猫', age: '青年',
    address: `${XHM} 兴海路`, lat: XHM_LAT - 0.002, lng: XHM_LNG,
    status: 'found', user_name: '路过的好心人', created_at: '2026-07-08T16:00:00',
    images: ['/cats/white.jpg'],
  },
  {
    title: '团河路 · 薏米（异瞳公主）',
    content: '异瞳三花母猫，白色长毛，蓝眼睛。猫协知名公主，本地发现需隔离观察。',
    breed: '异瞳三花长毛', age: '青年',
    address: `${XHM} 团河路`, lat: XHM_LAT, lng: XHM_LNG + 0.003,
    status: 'found', user_name: '学生救助', created_at: '2026-07-08T09:30:00',
    images: ['/cats/yimi.jpg'],
  },
  {
    title: '欣宝街 · 一窝幼猫求助',
    content: '4只幼猫眼睛刚睁开，在纸箱里。参考猫协幼猫救助流程，急需有经验同学。',
    breed: '中华田园猫', age: '幼猫（3周）',
    address: `${XHM} 欣宝街`, lat: XHM_LAT + 0.003, lng: XHM_LNG - 0.002,
    status: 'found', user_name: '西红门邻居', created_at: '2026-07-07T11:00:00',
    images: ['/cats/kitten.jpg'],
  },
  {
    title: '姜丝鸭已成功救助！',
    content: '之前求助的橘白已被接收，体检完毕，感谢各位云养姨姨叔叔！',
    breed: '橘白田园猫', age: '青年',
    address: XHM, lat: XHM_LAT, lng: XHM_LNG,
    status: 'adopted', user_name: '北大猫协', created_at: '2026-07-07T12:00:00',
    images: ['/cats/stray.jpg'],
  },
];

const ADOPTION_SEED = [
  { pet_name: '李美人', pet_type: 'cat', breed: '长毛三花（公）', age: '成年', gender: 'male', health: '已驱虫、已绝育', address: XHM, requirements: '室内养、封窗、接受回访', contact: '微信：pku_cat_xhm', status: 'available', description: '猫协档案参考，西红门发现，等待有缘人。', created_at: '2026-07-10T14:00:00', images: ['/cats/calico.jpg'] },
  { pet_name: '大盘鸡', pet_type: 'cat', breed: '对眼长毛橘猫', age: '成年', gender: 'male', health: '已驱虫、已疫苗', address: XHM, requirements: '封窗、科学喂养', contact: '微信：xhm_rescue', status: 'available', description: '亲人，吃饭时可以摸，猫协知名学长。', created_at: '2026-07-09T16:00:00', images: ['/cats/tabby.jpg'] },
  { pet_name: '畅菊', pet_type: 'cat', breed: '橘猫', age: '青年', gender: 'female', health: '已打两针疫苗', address: XHM, requirements: '封窗、适龄绝育', contact: '微信：pku_cat_xhm', status: 'available', description: '性格亲人，猫协推荐领养。', created_at: '2026-07-08T11:00:00', images: ['/cats/ginger.jpg'] },
  { pet_name: '薏米', pet_type: 'cat', breed: '异瞳三花长毛', age: '青年', gender: 'female', health: '已驱虫、待绝育', address: XHM, requirements: '室内养、封窗', contact: '微信：yimi_home', status: 'available', description: '异瞳公主，猫协档案参考。', created_at: '2026-07-07T14:00:00', images: ['/cats/yimi.jpg'] },
  { pet_name: '橘橘', pet_type: 'cat', breed: '中华田园橘猫', age: '约3个月', gender: 'male', health: '已驱虫、第一针疫苗', address: XHM, requirements: '封窗、不弃养', contact: '微信：meow_xhm', status: 'available', description: '车棚发现，很亲人。', created_at: '2026-07-06T09:00:00', images: ['/cats/kitten.jpg'] },
  { pet_name: '薛定谔的亲人', pet_type: 'cat', breed: '白猫', age: '青年', gender: 'unknown', health: '待体检', address: XHM, requirements: '有耐心、封窗', contact: '电话：13801234567', status: 'pending', description: '时亲时躲，需要耐心磨合。', created_at: '2026-07-05T10:00:00', images: ['/cats/white.jpg'] },
];

function insertForumRows() {
  const insertForum = db.prepare(`
    INSERT INTO forum_posts (id, user_name, title, content, images, breed, age, address, lat, lng, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  FORUM_SEED.forEach((p) => {
    insertForum.run(
      uuid(), p.user_name, p.title, p.content,
      JSON.stringify(p.images || []), p.breed, p.age,
      p.address, p.lat, p.lng, p.status, p.created_at
    );
  });
}

function insertAdoptionRows() {
  const insertAdoption = db.prepare(`
    INSERT INTO adoption_listings (id, pet_name, pet_type, breed, age, gender, health, images, address, requirements, contact, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  ADOPTION_SEED.forEach((a) => {
    insertAdoption.run(
      uuid(), a.pet_name, a.pet_type, a.breed, a.age, a.gender, a.health,
      JSON.stringify(a.images), a.address, a.requirements, a.contact, a.status, a.description, a.created_at
    );
  });
}

export function patchCommunityData() {
  const hasXihongmen = db.prepare("SELECT 1 FROM forum_posts WHERE address LIKE '%西红门%' LIMIT 1").get();
  if (!hasXihongmen) {
    db.prepare('DELETE FROM forum_comments').run();
    db.prepare('DELETE FROM forum_posts').run();
    insertForumRows();
    console.log(`Refreshed ${FORUM_SEED.length} forum posts (西红门 + 猫协档案).`);
  }

  db.prepare('DELETE FROM adoption_listings').run();
  insertAdoptionRows();
  console.log(`Refreshed ${ADOPTION_SEED.length} adoption listings.`);
}

export function seedCommunity() {
  const forumCount = db.prepare('SELECT COUNT(*) as c FROM forum_posts').get().c;
  if (forumCount > 0) {
    patchCommunityData();
    return;
  }
  insertForumRows();
  insertAdoptionRows();
  console.log(`Seeded ${FORUM_SEED.length} forum posts, ${ADOPTION_SEED.length} adoption listings.`);
}
