import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db, parseJson } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FORUM_SEED = [
  {
    title: '朝阳大悦城附近发现一只橘猫',
    content: '在小区门口车棚下面看到的，大概3个月大，很瘦，看起来饿了好几天',
    address: '朝阳大悦城附近',
    lat: 39.92,
    lng: 116.475,
    status: 'found',
    user_name: '小文',
    created_at: '2026-07-09T14:30:00',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80'],
  },
  {
    title: '海淀黄庄地铁站B口 小黑狗',
    content: '黑色小土狗，脖子上有旧的红色项圈，可能是走失的。很亲人',
    address: '海淀黄庄地铁站B口',
    lat: 39.9766,
    lng: 116.319,
    status: 'found',
    user_name: '宠物达人小王',
    created_at: '2026-07-09T10:15:00',
    images: ['https://images.unsplash.com/photo-1547404364-022c86e5ad8f?w=800&q=80'],
  },
  {
    title: '通州万达旁边的花猫 已经带去医院了',
    content: '打了疫苗做了驱虫，医生说大概半岁，母猫。现在在我家隔离中',
    address: '通州万达广场',
    lat: 39.8912,
    lng: 116.6622,
    status: 'rescued',
    user_name: '爱猫的小李',
    created_at: '2026-07-08T18:00:00',
    images: ['https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80'],
  },
  {
    title: '房山良乡发现一窝小猫 求助',
    content: '一共4只，眼睛刚睁开，在纸箱里被人丢在垃圾桶旁边',
    address: '房山区良乡镇',
    lat: 39.7352,
    lng: 116.1317,
    status: 'found',
    user_name: '学生救助',
    created_at: '2026-07-08T09:30:00',
    images: ['https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80'],
  },
  {
    title: '西直门立交桥下白色猫咪',
    content: '白色长毛猫，蓝眼睛，很漂亮，不像是流浪猫',
    address: '西直门立交桥',
    lat: 39.94,
    lng: 116.353,
    status: 'found',
    user_name: '路过的好心人',
    created_at: '2026-07-07T16:00:00',
    images: ['https://images.unsplash.com/photo-1533749013568-3d27eddf6b71?w=800&q=80'],
  },
  {
    title: '已成功救助！感谢大家',
    content: '之前发的那只橘猫已经被救助站接收了，谢谢各位！',
    address: '朝阳区',
    lat: 39.92,
    lng: 116.462,
    status: 'adopted',
    user_name: '小文',
    created_at: '2026-07-07T12:00:00',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80'],
  },
];

const ADOPTION_SEED = [
  { pet_name: '橘橘', pet_type: 'cat', breed: '橘猫', age: '约3个月', gender: 'male', health: '已驱虫、已打第一针疫苗', address: '北京朝阳区', requirements: '封窗封阳台、定期疫苗、适龄绝育', contact: '微信：meow_rescue', status: 'available', description: '性格很好很亲人，会蹭腿', created_at: '2026-07-09T14:00:00' },
  { pet_name: '小黑', pet_type: 'dog', breed: '中华田园犬', age: '约1岁', gender: 'female', health: '已驱虫、已疫苗、已绝育', address: '北京海淀区', requirements: '办狗证、每天遛、不散养', contact: '微信：dog_lover_wang', status: 'available', description: '特别聪明，会坐下和握手', created_at: '2026-07-08T16:00:00' },
  { pet_name: '花花', pet_type: 'cat', breed: '三花猫', age: '约半岁', gender: 'female', health: '已驱虫、已打两针疫苗、已绝育', address: '北京通州区', requirements: '室内养、封窗、科学喂养', contact: '微信：cat_lover_li', status: 'available', description: '会用猫砂，不挑食', created_at: '2026-07-07T11:00:00' },
  { pet_name: '阿黄', pet_type: 'dog', breed: '金毛串串', age: '约2岁', gender: 'male', health: '已驱虫、已疫苗', address: '北京丰台区', requirements: '有稳定住所、每天遛两次', contact: '微信：dog_rescue_01', status: 'pending', description: '性格温顺，不叫不闹', created_at: '2026-07-06T09:00:00' },
  { pet_name: '小白', pet_type: 'cat', breed: '白猫', age: '约4个月', gender: 'male', health: '已驱虫、已打第一针疫苗', address: '北京顺义区', requirements: '封窗、适龄绝育、不弃养', contact: '电话：13801234567', status: 'available', description: '很活泼好动，喜欢玩逗猫棒', created_at: '2026-07-05T14:00:00' },
  { pet_name: '豆豆', pet_type: 'other', breed: '兔子', age: '约1岁', gender: 'female', health: '健康，已体检', address: '北京昌平区', requirements: '有养兔经验', contact: '微信：rabbit_home', status: 'available', description: '性格温顺，会用兔厕所', created_at: '2026-07-04T10:00:00' },
];

export function patchForumImages() {
  const update = db.prepare(`
    UPDATE forum_posts SET images = ?
    WHERE title = ? AND (images = '[]' OR images IS NULL OR images = '')
  `);
  let patched = 0;
  FORUM_SEED.forEach((p) => {
    if (!p.images?.length) return;
    const result = update.run(JSON.stringify(p.images), p.title);
    patched += result.changes;
  });
  if (patched > 0) console.log(`Patched ${patched} forum posts with images.`);
}

export function seedCommunity() {
  const forumCount = db.prepare('SELECT COUNT(*) as c FROM forum_posts').get().c;
  if (forumCount > 0) {
    patchForumImages();
    return;
  }

  const insertForum = db.prepare(`
    INSERT INTO forum_posts (id, user_name, title, content, images, address, lat, lng, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  FORUM_SEED.forEach((p) => {
    insertForum.run(
      uuid(), p.user_name, p.title, p.content,
      JSON.stringify(p.images || []),
      p.address, p.lat, p.lng, p.status, p.created_at
    );
  });

  const insertAdoption = db.prepare(`
    INSERT INTO adoption_listings (id, pet_name, pet_type, breed, age, gender, health, images, address, requirements, contact, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?)
  `);
  ADOPTION_SEED.forEach((a) => {
    insertAdoption.run(
      uuid(), a.pet_name, a.pet_type, a.breed, a.age, a.gender, a.health,
      a.address, a.requirements, a.contact, a.status, a.description, a.created_at
    );
  });

  console.log(`Seeded ${FORUM_SEED.length} forum posts, ${ADOPTION_SEED.length} adoption listings.`);
}
