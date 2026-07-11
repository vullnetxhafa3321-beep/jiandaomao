/**
 * 百度智能云「动物识别」API（免费额度约 500 次/天）
 * 密钥放服务端：BAIDU_API_KEY / BAIDU_SECRET_KEY
 * （兼容 VITE_BAIDU_* 便于本地一份 .env）
 */

let cachedToken = null;
let cachedExpiry = 0;

function apiKeys() {
  const apiKey = process.env.BAIDU_API_KEY || '';
  const secretKey = process.env.BAIDU_SECRET_KEY || '';
  // 仅本地非 Vercel：兼容误写在 VITE_* 的开发配置（不会打进前端包）
  if ((!apiKey || !secretKey) && !process.env.VERCEL) {
    return {
      apiKey: apiKey || process.env.VITE_BAIDU_API_KEY || '',
      secretKey: secretKey || process.env.VITE_BAIDU_SECRET_KEY || '',
    };
  }
  return { apiKey, secretKey };
}

export function baiduConfigured() {
  const { apiKey, secretKey } = apiKeys();
  return Boolean(apiKey && secretKey);
}

function inferPetType(name) {
  const lower = String(name || '').toLowerCase();
  const catBreeds = [
    '猫', '橘猫', '狸花', '英短', '美短', '布偶', '暹罗', '三花', '奶牛猫', '白猫', '黑猫',
    '加菲', '波斯', '折耳', '中华田园猫', '田园猫',
  ];
  const dogBreeds = [
    '狗', '田园犬', '金毛', '拉布拉多', '泰迪', '柯基', '哈士奇', '柴犬', '萨摩耶', '边牧',
    '比熊', '法斗', '阿拉斯加', '博美', '雪纳瑞', '中华田园犬',
  ];
  for (const kw of catBreeds) {
    if (lower.includes(kw.toLowerCase()) || name.includes(kw)) return 'cat';
  }
  for (const kw of dogBreeds) {
    if (lower.includes(kw.toLowerCase()) || name.includes(kw)) return 'dog';
  }
  if (/猫|cat|kitten/i.test(name)) return 'cat';
  if (/狗|犬|dog|puppy/i.test(name)) return 'dog';
  return 'other';
}

const COMMON_PETS = new Set([
  '猫', '橘猫', '狸花猫', '英短', '美短', '布偶猫', '暹罗猫', '三花猫', '奶牛猫', '白猫', '黑猫',
  '波斯猫', '加菲猫', '中华田园猫', '折耳猫', '田园猫',
  '狗', '中华田园犬', '金毛', '拉布拉多', '泰迪', '柯基', '哈士奇', '柴犬', '萨摩耶', '边牧',
  '比熊', '法斗', '阿拉斯加', '博美', '雪纳瑞',
]);

function pickBest(results) {
  const pet = results.find((r) => {
    const name = r.name || '';
    return (
      COMMON_PETS.has(name) ||
      name.includes('猫') ||
      name.includes('狗') ||
      name.includes('犬') ||
      /(cat|dog|kitten|puppy)/i.test(r.keyword || '')
    );
  });
  return pet || results[0] || null;
}

export function normalizeBaiduResult(data) {
  const results = (data.result || []).map((r) => ({
    name: r.name,
    score: Number(r.score) || 0,
    petType: inferPetType(r.name),
    keyword: r.keyword || '',
  }));
  const best = pickBest(results);
  return {
    results,
    best,
    topName: best?.name || '未知',
    topScore: best?.score || 0,
    topPetType: best?.petType || 'other',
  };
}

export async function getBaiduAccessToken() {
  if (cachedToken && Date.now() < cachedExpiry) return cachedToken;

  const { apiKey, secretKey } = apiKeys();
  if (!apiKey || !secretKey) {
    throw new Error('百度 AI 密钥未配置（BAIDU_API_KEY / BAIDU_SECRET_KEY）');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: secretKey,
  });
  const res = await fetch(`https://aip.baidubce.com/oauth/2.0/token?${params}`);
  if (!res.ok) throw new Error(`获取 token 失败: HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) {
    throw new Error(`获取 token 失败: ${data.error_description || data.error}`);
  }

  cachedToken = data.access_token;
  const expiresIn = (data.expires_in || 2592000) * 1000;
  cachedExpiry = Date.now() + expiresIn - 86400000;
  return cachedToken;
}

export async function recognizeAnimalBase64(base64) {
  const token = await getBaiduAccessToken();
  const body = new URLSearchParams();
  body.append('image', base64);
  body.append('top_num', '5');
  body.append('baike_num', '0');

  const res = await fetch(
    `https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  );
  if (!res.ok) throw new Error(`识别请求失败: HTTP ${res.status}`);
  const data = await res.json();
  if (data.error_code) {
    throw new Error(`识别失败: ${data.error_msg || `错误码 ${data.error_code}`}`);
  }
  return normalizeBaiduResult(data);
}

export async function recognizeAnimalBuffer(buffer) {
  const base64 = Buffer.from(buffer).toString('base64');
  return recognizeAnimalBase64(base64);
}
