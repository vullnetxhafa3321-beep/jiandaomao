import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { haversineKm } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bjHospitals = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bj-hospitals.json'), 'utf-8'));
const shHospitals = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hospitals.json'), 'utf-8'));

const DEFAULT_PRICES = [
  { item: '流浪公猫绝育', price: 99, unit: '元', note: '含住院', free: false },
  { item: '流浪母猫绝育', price: 189, unit: '元', note: '含住院', free: false },
  { item: '基础体检', price: 0, unit: '元', note: '流浪动物免费', free: true },
  { item: '体内外驱虫', price: 30, unit: '元', note: '', free: false },
];

const FRIENDLY_TEMPLATES = [
  '凭「捡到猫了」求助帖可走流浪动物通道；支持诱捕笼暂存与绝育后留观。',
  '接受志愿者送医；TNR（诱捕-绝育-放归）单独报价；急诊可电话预约留位。',
  '允许脏猫进隔离间；可无主登记；简易航空箱可借用（押金可退）。',
  '夜间急诊接流浪猫；基本治疗公益折扣；支持到院门口交接。',
  '每周开放流浪猫义诊时段；价格透明，可不做强制套餐。',
  '合作救助组织定点医院：外伤清创优先排期，检查项目享折扣。',
];

function nearOffsetKm(lat, lng, index, baseKm = 0.7) {
  const angle = ((index * 137.5) % 360) * (Math.PI / 180);
  const rKm = Math.min(4.5, baseKm + (index % 8) * 0.35);
  const dLat = (rKm / 111) * Math.cos(angle);
  const dLng = (rKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
  return { lat: lat + dLat, lng: lng + dLng, rKm };
}

function brandName(name) {
  return String(name || '宠物医院')
    .replace(/（.*?）/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/上海|北京|徐汇|静安|浦东|朝阳|海淀|大兴|西红门|分院|总院|店/g, '')
    .trim() || '宠物医院';
}

function normalizeTemplate(h, i) {
  const prices = Array.isArray(h.prices) && h.prices.length ? h.prices : DEFAULT_PRICES;
  const discount =
    h.partnerDiscount ||
    h.discount_note ||
    '流浪猫绝育优惠 · 基础体检免费（演示）';
  return {
    source_id: h.id || `tpl-${i}`,
    brand: brandName(h.name),
    phone: h.phone || `010-88${String(80000 + (i % 9000)).padStart(5, '0')}`,
    hours: h.hours || '09:00–21:00',
    isPartner: h.isPartner !== false,
    discount_note: discount,
    friendly_note: FRIENDLY_TEMPLATES[i % FRIENDLY_TEMPLATES.length],
    prices,
    tags: h.tags?.length ? h.tags : ['流浪猫友好', '绝育优惠', '可送医'],
  };
}

/** Deduped brand templates from real SH + BJ hospital lists */
function loadTemplates() {
  const seen = new Set();
  const out = [];
  [...bjHospitals, ...shHospitals].forEach((h, i) => {
    const t = normalizeTemplate(h, i);
    const key = t.brand;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  });
  return out;
}

const TEMPLATES = loadTemplates();

const BRANCH_SUFFIX = ['分院', '门诊部', '宠物中心', '社区店', '动物医院'];

/**
 * Build nearby hospitals around user — never empty, at least 10.
 * Uses real hospital brands as templates, relocates to user vicinity (demo).
 * Only a random subset are marked 流浪猫友好 (isPartner).
 * Always sorted by distance_km ascending.
 */
export function buildNearbyFriendlyHospitals(lat, lng, limit = 12) {
  const baseLat = Number.isFinite(lat) ? lat : 39.785;
  const baseLng = Number.isFinite(lng) ? lng : 116.362;
  const target = Math.max(10, Math.min(limit || 12, 20));

  const pool = [];
  let i = 0;
  while (pool.length < target) {
    const t = TEMPLATES[i % Math.max(TEMPLATES.length, 1)] || {
      source_id: `pad-${i}`,
      brand: '暖爪宠物医院',
      phone: `010-88${String(80000 + i).padStart(5, '0')}`,
      hours: '09:00–21:00',
      isPartner: false,
      discount_note: '',
      friendly_note: '',
      prices: DEFAULT_PRICES,
      tags: ['可送医'],
    };
    const round = Math.floor(i / Math.max(TEMPLATES.length, 1));
    const suffix = BRANCH_SUFFIX[round % BRANCH_SUFFIX.length];
    /* 约 1/3 标记为流浪猫友好，其余为普通医院 */
    const friendly = i % 3 === 0;
    pool.push({
      t,
      i,
      id: `near-${t.source_id}-r${round}-${i}`,
      name: `${t.brand}（${suffix}）`,
      friendly,
    });
    i += 1;
    if (i > 80) break; // safety
  }

  return pool
    .map(({ t, i: idx, id, name, friendly }) => {
      const p = nearOffsetKm(baseLat, baseLng, idx, 0.45);
      const dist = haversineKm(baseLat, baseLng, p.lat, p.lng);
      return {
        id,
        name,
        address: `距你约 ${dist.toFixed(1)} km · 模拟落点（参考真实品牌）`,
        lat: p.lat,
        lng: p.lng,
        phone: t.phone,
        hours: t.hours,
        isPartner: friendly,
        discount_note: friendly ? t.discount_note : null,
        partnerDiscount: friendly ? t.discount_note : null,
        friendly_note: friendly ? t.friendly_note : null,
        prices: friendly ? t.prices : null,
        tags: friendly ? t.tags : ['宠物医院', '可送医'],
        distance_km: Number(dist.toFixed(2)),
        priceUpdatedAt: '2026-07-01',
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km);
}

/** ~1km fuzzy grid for rescue safety */
export function fuzzLatLng(lat, lng, salt = 0) {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: null, lng: null };
  }
  const grid = 0.009; // ≈ 1 km
  const jitterLat = ((salt % 5) - 2) * 0.0008;
  const jitterLng = ((salt % 7) - 3) * 0.0008;
  return {
    lat: Math.round(lat / grid) * grid + jitterLat,
    lng: Math.round(lng / grid) * grid + jitterLng,
  };
}

export function fuzzyAddressLabel(address) {
  const raw = String(address || '').trim();
  if (!raw) return '发现地附近';
  const area = raw
    .replace(/（[^）]*模糊[^）]*）/g, '')
    .replace(/\([^)]*模糊[^)]*\)/g, '')
    .replace(/（1km内[^）]*）/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\d+号.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const head = area.slice(0, 24) || '发现地';
  return `${head}附近`;
}
