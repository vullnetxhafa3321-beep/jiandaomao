import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 档案参考北大猫协公众号公开报道 · 照片为品种示意 */
const FORUM_SEED = [
  {
    title: '燕园哲学楼附近 · 姜丝鸭',
    content: '橘白田园猫，叫声特别，在车棚下躲雨。北大猫协同学已投喂，急需接力救助。',
    breed: '橘白田园猫',
    age: '青年',
    address: '北京大学燕园校区 哲学楼附近',
    lat: 39.992,
    lng: 116.310,
    status: 'found',
    user_name: '北大猫协',
    created_at: '2026-07-09T14:30:00',
    images: ['/cats/ginger.jpg'],
  },
  {
    title: '未名湖南岸 · 李美人出没',
    content: '燕园第一美猫（公），长毛三花脸，性格高冷但亲人。疑似走失家猫，请附近同学留意。',
    breed: '长毛三花（公）',
    age: '成年',
    address: '北京大学 未名湖南岸',
    lat: 39.995,
    lng: 116.306,
    status: 'found',
    user_name: '爱猫的小李',
    created_at: '2026-07-09T10:15:00',
    images: ['/cats/calico.jpg'],
  },
  {
    title: '理教旁 · 一帆已带去医院',
    content: '狸花公猫，约两岁，已绝育疫苗齐全。猫协报道过的乖宝宝，现隔离观察中。',
    breed: '狸花猫',
    age: '约2岁',
    address: '北京大学 理教附近',
    lat: 39.989,
    lng: 116.312,
    status: 'rescued',
    user_name: '北大猫协',
    created_at: '2026-07-08T18:00:00',
    images: ['/cats/tabby.jpg'],
  },
  {
    title: '静园草地 · 一窝幼猫求助',
    content: '畅菊同款橘猫家族，4只幼猫眼睛刚睁开，在纸箱里。母猫未见，急需有经验同学。',
    breed: '中华田园橘猫',
    age: '幼猫（3周）',
    address: '北京大学 静园草地',
    lat: 39.991,
    lng: 116.308,
    status: 'found',
    user_name: '学生救助',
    created_at: '2026-07-08T09:30:00',
    images: ['/cats/kitten.jpg'],
  },
  {
    title: '畅春园 · 薏米（异瞳公主）',
    content: '异瞳三花母猫，白色长毛，蓝眼睛，很漂亮。猫协档案有记录，疑为走失宠物猫。',
    breed: '异瞳三花长毛',
    age: '青年',
    address: '北京大学 畅春园社区',
    lat: 39.988,
    lng: 116.305,
    status: 'found',
    user_name: '路过的好心人',
    created_at: '2026-07-07T16:00:00',
    images: ['/cats/white.jpg'],
  },
  {
    title: '姜丝鸭已成功救助！',
    content: '之前求助的橘白已被猫协接收，体检完毕，谢谢各位云养姨姨叔叔！',
    breed: '橘白田园猫',
    age: '青年',
    address: '北京市海淀区·燕园',
    lat: 39.992,
    lng: 116.310,
    status: 'adopted',
    user_name: '北大猫协',
    created_at: '2026-07-07T12:00:00',
    images: ['/cats/stray.jpg'],
  },
];

const ADOPTION_SEED = [
  {
    pet_name: '李美人', pet_type: 'cat', breed: '长毛三花（公）', age: '成年', gender: 'male',
    health: '已驱虫、已绝育、疫苗齐全', address: '北京市海淀区·燕园',
    requirements: '室内养、封窗、科学喂养、接受回访', contact: '微信：pku_cat_assoc',
    status: 'available', description: '燕园知名美猫，猫协公众号常客，等待有缘人。',
    created_at: '2026-07-09T14:00:00', images: ['/cats/calico.jpg'],
  },
  {
    pet_name: '畅菊', pet_type: 'cat', breed: '橘猫', age: '青年', gender: 'female',
    health: '已驱虫、已打两针疫苗', address: '北京市海淀区·燕园',
    requirements: '封窗封阳台、定期疫苗、适龄绝育', contact: '微信：pku_cat_assoc',
    status: 'available', description: '静园草地常客，性格亲人，猫协推荐领养。',
    created_at: '2026-07-08T16:00:00', images: ['/cats/ginger.jpg'],
  },
  {
    pet_name: '一帆', pet_type: 'cat', breed: '狸花猫', age: '约2岁', gender: 'male',
    health: '已驱虫、已疫苗、已绝育', address: '北京市海淀区·燕园',
    requirements: '室内养、封窗、科学喂养', contact: '微信：cat_lover_li',
    status: 'available', description: '猫协报道过的乖宝宝，会用猫砂，不挑食。',
    created_at: '2026-07-07T11:00:00', images: ['/cats/tabby.jpg'],
  },
  {
    pet_name: '橘橘', pet_type: 'cat', breed: '中华田园橘猫', age: '约3个月', gender: 'male',
    health: '已驱虫、已打第一针疫苗', address: '北京朝阳区',
    requirements: '封窗、适龄绝育、不弃养', contact: '微信：meow_rescue',
    status: 'available', description: '小区车棚发现，性格很好很亲人，会蹭腿。',
    created_at: '2026-07-06T09:00:00', images: ['/cats/kitten.jpg'],
  },
  {
    pet_name: '雪球', pet_type: 'cat', breed: '白猫', age: '青年', gender: 'female',
    health: '已驱虫、已疫苗', address: '北京顺义区',
    requirements: '封窗、适龄绝育、不弃养', contact: '电话：13801234567',
    status: 'available', description: '蓝眼睛白毛，活泼好动，喜欢玩逗猫棒。',
    created_at: '2026-07-05T14:00:00', images: ['/cats/white.jpg'],
  },
  {
    pet_name: '三花妹', pet_type: 'cat', breed: '三花短毛猫', age: '幼猫', gender: 'female',
    health: '已驱虫、已体检', address: '北京通州区',
    requirements: '有养幼猫经验、封窗', contact: '微信：cat_rescue_bj',
    status: 'pending', description: '楼道发现，很亲人，求有经验家庭。',
    created_at: '2026-07-04T10:00:00', images: ['/cats/calico.jpg'],
  },
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
  const needsForumRefresh = !db.prepare("SELECT 1 FROM forum_posts WHERE breed IS NOT NULL AND breed != '' LIMIT 1").get();
  if (needsForumRefresh) {
    db.prepare('DELETE FROM forum_posts').run();
    insertForumRows();
    console.log(`Refreshed ${FORUM_SEED.length} forum posts with PKU profiles.`);
  }

  db.prepare('DELETE FROM adoption_listings').run();
  insertAdoptionRows();
  console.log(`Refreshed ${ADOPTION_SEED.length} adoption listings with photos.`);
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
