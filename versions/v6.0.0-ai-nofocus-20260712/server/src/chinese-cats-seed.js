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

/** Cute nicknames by coat/breed — index cycles per breed (no more 奶牛猫1) */
export const BREED_NICKNAMES = {
  橘猫: ['小橘子', '柿饼', '金豆'],
  狸花猫: ['狸花卷', '斑斑', '小狸'],
  奶牛猫: ['牛奶糖', '奥利奥', '黑白配'],
  三花猫: ['花花', '锦鲤', '三花妹'],
  玳瑁猫: ['玳瑁壳', '琥珀', '小玳'],
  黑猫: ['小墨', '夜行', '煤球'],
  白猫: ['小雪', '棉花糖', '团子'],
  灰猫: ['烟灰', '雾雾', '小灰'],
  简州猫: ['简简', '巴适', '州州'],
  临清狮子猫: ['狮狮', '临临', '白绒'],
};

const breedIndex = Object.create(null);

export function nicknameForBreed(breedName, catId, explicitNickname) {
  if (explicitNickname) return explicitNickname;
  const pool = BREED_NICKNAMES[breedName];
  if (!pool?.length) {
    const n = String(catId || '').split('-').pop() || '1';
    return `${breedName}${n}`;
  }
  const key = breedName;
  const i = breedIndex[key] || 0;
  breedIndex[key] = i + 1;
  return pool[i % pool.length];
}

export function resetNicknameCounters() {
  for (const k of Object.keys(breedIndex)) delete breedIndex[k];
}

/** Point within ~0.5–3 km of center (golden-angle spiral) */
export function nearOffsetKm(lat, lng, index, baseKm = 0.7) {
  const angle = ((index * 137.5) % 360) * (Math.PI / 180);
  const rKm = Math.min(2.95, baseKm + (index % 8) * 0.28);
  const dLat = (rKm / 111) * Math.cos(angle);
  const dLng = (rKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
  return { lat: lat + dLat, lng: lng + dLng, rKm };
}

export function loadChineseCats() {
  const file = path.join(__dirname, '..', 'data', 'chinese-cats.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function chineseCatsToForumSeed(cats) {
  resetNicknameCounters();
  return cats.map((cat, i) => {
    const nick = nicknameForBreed(cat.name, cat.id, cat.nickname);
    const street = STREETS[i % STREETS.length];
    const p = nearOffsetKm(XHM_LAT, XHM_LNG, i, 0.55);
    // Snap to ~1km fuzzy point for safety
    const grid = 0.009;
    const fuzzyLat = Math.round(p.lat / grid) * grid + ((i % 5) - 2) * 0.0008;
    const fuzzyLng = Math.round(p.lng / grid) * grid + ((i % 7) - 3) * 0.0008;
    const status = i % 7 === 0 ? 'rescued' : i % 11 === 0 ? 'adopted' : 'found';
    const isFeatured = cat.id === 'shanhua' || cat.nickname === '山花';
    return {
      title: `${street} · ${nick}`,
      content: `${cat.description}。性格：${cat.personality}。花色：${cat.name}。${cat.note || '急需同城接力关注。'}具体位置请私信联系人确认。`,
      breed: isFeatured ? '短毛三花母猫' : cat.name,
      age: AGES[i % AGES.length],
      address: `${XHM} ${street}附近`,
      lat: fuzzyLat,
      lng: fuzzyLng,
      status,
      user_name: i % 2 === 0 ? '西红门爱猫人' : '北大猫协志愿者',
      contact: `微信：xhm_${String(cat.id || `cat${i + 1}`).replace(/-/g, '_')}`,
      rescuer_name: status === 'rescued' ? (i % 2 === 0 ? '暖心铲屎官阿花' : '路人甲志愿者') : null,
      created_at: isFeatured
        ? '2026-07-11T23:59:00'
        : `2026-07-${String(10 - (i % 8)).padStart(2, '0')}T${String(9 + (i % 10)).padStart(2, '0')}:00:00`,
      images: [cat.photoSquare || cat.photo],
      source_id: cat.id,
      nickname: nick,
    };
  });
}

export function chineseCatsToAdoptionSeed(cats) {
  resetNicknameCounters();
  return cats.slice(0, 18).map((cat, i) => {
    const nick = nicknameForBreed(cat.name, cat.id, cat.nickname);
    const street = STREETS[i % STREETS.length];
    const p = nearOffsetKm(XHM_LAT, XHM_LNG, i + 3, 0.8);
    const isFeatured = cat.id === 'shanhua' || cat.nickname === '山花';
    return {
      pet_name: nick,
      pet_type: 'cat',
      breed: isFeatured ? '短毛三花母猫' : cat.name,
      age: AGES[i % AGES.length],
      gender: cat.gender === 'female' || cat.gender === '母' ? 'female'
        : cat.gender === 'male' || cat.gender === '公' ? 'male'
        : i % 3 === 0 ? 'male' : i % 3 === 1 ? 'female' : 'unknown',
      health: i % 2 === 0 ? '已驱虫、已疫苗' : '已驱虫、待绝育',
      address: `${XHM} ${street}`,
      requirements: '封窗、室内养、科学喂养',
      contact: `微信：adopt_${String(cat.id || `cat${i + 1}`).replace(/-/g, '_')}`,
      status: 'available',
      description: `${cat.coat ? cat.coat + '·' : ''}${cat.description}。${cat.personality}。花色：${cat.name}。`,
      created_at: isFeatured
        ? '2026-07-11T23:59:00'
        : `2026-07-${String(6 + (i % 5)).padStart(2, '0')}T10:00:00`,
      images: [cat.photoSquare || cat.photo],
      source_id: cat.id,
      lat: p.lat,
      lng: p.lng,
    };
  });
}
