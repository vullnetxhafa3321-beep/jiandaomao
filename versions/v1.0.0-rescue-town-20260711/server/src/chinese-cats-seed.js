import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const XHM = '北京市大兴区西红门镇';
const XHM_LAT = 39.785;
const XHM_LNG = 116.362;

const STREETS = [
  '荟聚北侧', '地铁B口', '欣海北街', '宏福路', '兴海路',
  '团河路', '欣宝街', '欣荣北大街', '宏业路', '嘉悦广场',
];

const AGES = ['幼猫', '青年', '成年', '约1岁', '约2岁'];

export function loadChineseCats() {
  const file = path.join(__dirname, '..', 'data', 'chinese-cats.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function chineseCatsToForumSeed(cats) {
  return cats.map((cat, i) => {
    const offset = ((i % 7) - 3) * 0.0015;
    const lngOff = ((i % 5) - 2) * 0.0018;
    return {
      title: `${STREETS[i % STREETS.length]} · ${cat.name}${cat.id.split('-').pop()}`,
      content: `${cat.description}。性格：${cat.personality}。${cat.note || '急需同城接力关注。'}`,
      breed: cat.name,
      age: AGES[i % AGES.length],
      address: `${XHM} ${STREETS[i % STREETS.length]}`,
      lat: XHM_LAT + offset,
      lng: XHM_LNG + lngOff,
      status: i % 7 === 0 ? 'rescued' : i % 11 === 0 ? 'adopted' : 'found',
      user_name: i % 2 === 0 ? '西红门爱猫人' : '北大猫协志愿者',
      created_at: `2026-07-${String(10 - (i % 8)).padStart(2, '0')}T${String(9 + (i % 10)).padStart(2, '0')}:00:00`,
      images: [cat.photoSquare || cat.photo],
      source_id: cat.id,
    };
  });
}

export function chineseCatsToAdoptionSeed(cats) {
  return cats.slice(0, 18).map((cat, i) => ({
    pet_name: `${cat.name}·${cat.id.split('-').pop()}`,
    pet_type: 'cat',
    breed: cat.name,
    age: AGES[i % AGES.length],
    gender: i % 3 === 0 ? 'male' : i % 3 === 1 ? 'female' : 'unknown',
    health: i % 2 === 0 ? '已驱虫、已疫苗' : '已驱虫、待绝育',
    address: XHM,
    requirements: '封窗、室内养、科学喂养',
    contact: `微信：xhm_cat_${cat.id.replace(/-/g, '')}`,
    status: i % 5 === 0 ? 'pending' : 'available',
    description: `${cat.description}。${cat.personality}。`,
    created_at: `2026-07-${String(6 + (i % 5)).padStart(2, '0')}T10:00:00`,
    images: [cat.photoSquare || cat.photo],
    source_id: cat.id,
  }));
}
