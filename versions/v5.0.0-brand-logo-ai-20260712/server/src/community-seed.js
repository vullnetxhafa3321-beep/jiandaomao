import { v5 as uuidv5 } from 'uuid';
import { db } from './db.js';
import { loadChineseCats, chineseCatsToForumSeed, chineseCatsToAdoptionSeed } from './chinese-cats-seed.js';

/** Bump when demo JSON/content must rebuild on existing DBs */
const COMMUNITY_SEED_VERSION = 'v2.1.2-shanhua-stable-unique';
const SEED_NS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function seedId(kind, key) {
  return uuidv5(`${kind}:${key}`, SEED_NS);
}

const XHM = '北京市大兴区西红门镇';
const XHM_LAT = 39.785;
const XHM_LNG = 116.362;

/** 北大猫协档案猫（保留） */
const PKU_FORUM = [
  {
    source_id: 'pku-ginger',
    title: '西红门荟聚附近 · 姜丝鸭',
    content: '橘白田园猫，叫声像公鸭，在车棚下躲雨。参考燕园猫协档案，本地发现，急需接力救助。具体位置请私信确认。',
    breed: '橘白田园猫', age: '青年',
    address: `${XHM}荟聚附近`,
    lat: Math.round((XHM_LAT + 0.002) / 0.009) * 0.009,
    lng: Math.round((XHM_LNG + 0.001) / 0.009) * 0.009,
    status: 'found', user_name: '北大猫协志愿者',
    contact: '微信：pku_ginger_duck',
    created_at: '2026-07-10T14:30:00.000Z',
    images: ['/cats/ginger.jpg'],
  },
  {
    source_id: 'pku-limeiren',
    title: '西红门地铁口 · 李美人',
    content: '长毛三花脸公猫，高颜值，性格高冷但亲人。猫协档案「李美人」，疑似走失家猫。具体位置请私信确认。',
    breed: '长毛三花（公）', age: '成年',
    address: `${XHM}地铁口附近`,
    lat: Math.round(XHM_LAT / 0.009) * 0.009,
    lng: Math.round(XHM_LNG / 0.009) * 0.009,
    status: 'rescued', user_name: '爱猫的小李',
    contact: '微信：lili_calico',
    rescuer_name: '好心人阿强',
    created_at: '2026-07-10T10:15:00.000Z',
    images: ['/cats/calico.jpg'],
  },
];

const PKU_ADOPTION = [
  {
    source_id: 'pku-adopt-limeiren',
    pet_name: '李美人', pet_type: 'cat', breed: '长毛三花（公）', age: '成年', gender: 'male',
    health: '已驱虫、已绝育', address: XHM, requirements: '室内养、封窗、接受回访',
    contact: '微信：pku_cat_xhm', status: 'available',
    description: '猫协档案参考，西红门发现，等待有缘人。',
    created_at: '2026-07-10T14:00:00.000Z', images: ['/cats/calico.jpg'],
  },
];

function ensureMetaTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

function getMeta(key) {
  ensureMetaTable();
  return db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key)?.value || null;
}

function setMeta(key, value) {
  ensureMetaTable();
  db.prepare(
    'INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value);
}

function buildForumSeed() {
  const chinese = chineseCatsToForumSeed(loadChineseCats());
  const featured = chinese.filter((p) => p.source_id === 'shanhua' || p.nickname === '山花');
  const rest = chinese.filter((p) => !(p.source_id === 'shanhua' || p.nickname === '山花'));
  return [...featured, ...rest, ...PKU_FORUM];
}

function buildAdoptionSeed() {
  const chinese = chineseCatsToAdoptionSeed(loadChineseCats());
  const featured = chinese.filter((a) => a.source_id === 'shanhua' || a.pet_name === '山花');
  const rest = chinese.filter((a) => !(a.source_id === 'shanhua' || a.pet_name === '山花'));
  return [...featured, ...rest, ...PKU_ADOPTION];
}

function insertForumRows(posts) {
  const insertForum = db.prepare(`
    INSERT INTO forum_posts (id, user_name, title, content, images, breed, age, address, lat, lng, status, contact, rescuer_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const ids = [];
  posts.forEach((p, i) => {
    // Include index — chinese-cats.json reuses ids across coat groups (e.g. tabby-1)
    const key = `${p.source_id || p.title}|${p.breed || ''}|${i}`;
    const id = seedId('forum', key);
    ids.push(id);
    insertForum.run(
      id, p.user_name, p.title, p.content,
      JSON.stringify(p.images || []), p.breed, p.age,
      p.address, p.lat, p.lng, p.status,
      p.contact || '', p.rescuer_name || null, p.created_at
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
    insert.run(
      seedId('comment', `${pid}:${i}`),
      pid,
      '热心邻居',
      samples[i],
      `2026-07-11T0${8 + i}:30:00.000Z`
    );
  });
}

function insertAdoptionRows(listings) {
  const insertAdoption = db.prepare(`
    INSERT INTO adoption_listings (id, pet_name, pet_type, breed, age, gender, health, images, address, requirements, contact, status, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  listings.forEach((a, i) => {
    const key = `${a.source_id || a.pet_name}|${a.breed || ''}|${i}`;
    insertAdoption.run(
      seedId('adoption', key), a.pet_name, a.pet_type, a.breed, a.age, a.gender, a.health,
      JSON.stringify(a.images), a.address, a.requirements, a.contact, a.status, a.description, a.created_at
    );
  });
}

function rebuildCommunitySeed(reason) {
  db.prepare('DELETE FROM forum_comments').run();
  db.prepare('DELETE FROM forum_posts').run();
  db.prepare('DELETE FROM adoption_listings').run();
  const ids = insertForumRows(buildForumSeed());
  seedDemoComments(ids);
  insertAdoptionRows(buildAdoptionSeed());
  setMeta('community_seed_version', COMMUNITY_SEED_VERSION);
  console.log(`Community seed rebuilt (${reason}): ${ids.length} forum, ${buildAdoptionSeed().length} adoptions.`);
}

/** Keep existing user comments unless seed version changed. */
export function seedCommunity() {
  ensureMetaTable();
  const version = getMeta('community_seed_version');
  const forumCount = db.prepare('SELECT COUNT(*) as c FROM forum_posts').get().c;
  const hasShanhua = db.prepare(
    "SELECT 1 FROM forum_posts WHERE title LIKE '%山花%' OR contact LIKE '%xhm_shanhua%' LIMIT 1"
  ).get();

  if (forumCount === 0 || version !== COMMUNITY_SEED_VERSION || !hasShanhua) {
    rebuildCommunitySeed(
      forumCount === 0 ? 'empty' : version !== COMMUNITY_SEED_VERSION ? 'version-bump' : 'missing-shanhua'
    );
    return;
  }
  // Already on current seed — do not wipe (preserves comments within an instance)
}

/** Force rebuild (local JSON edits). */
export function patchCommunityData() {
  rebuildCommunitySeed('manual-patch');
}
