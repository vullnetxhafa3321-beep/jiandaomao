/** 百度动物识别 — 前端客户端（经服务端 /api/baidu/* 代理） */

export interface RecognitionResult {
  name: string;
  score: number;
  petType?: string;
  keyword?: string;
}

export interface AnimalRecognitionData {
  results: RecognitionResult[];
  best: RecognitionResult | null;
  topName: string;
  topScore: number;
  topPetType: string;
}

const memoryCache = new Map<string, AnimalRecognitionData>();

function apiBase() {
  const base = import.meta.env.VITE_API_BASE || '';
  return base.replace(/\/$/, '');
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

export async function recognizeAnimalFile(file: File): Promise<AnimalRecognitionData> {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${apiBase()}/api/baidu/recognize`, {
    method: 'POST',
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `识别失败 HTTP ${res.status}`);
  return data as AnimalRecognitionData;
}

export async function recognizeAnimalUrl(imageUrl: string): Promise<AnimalRecognitionData> {
  const key = imageUrl;
  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const sessionKey = `breed_ai:${key}`;
    const raw = sessionStorage.getItem(sessionKey);
    if (raw) {
      const parsed = JSON.parse(raw) as AnimalRecognitionData;
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    /* ignore */
  }

  const res = await fetch(`${apiBase()}/api/baidu/recognize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `识别失败 HTTP ${res.status}`);
  const result = data as AnimalRecognitionData;
  memoryCache.set(key, result);
  try {
    sessionStorage.setItem(`breed_ai:${key}`, JSON.stringify(result));
  } catch {
    /* ignore quota */
  }
  return result;
}

export function scorePercent(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.round(score <= 1 ? score * 100 : score);
}
