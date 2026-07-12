import app from './app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** 本地加载 server/.env（Vercel 用控制台环境变量） */
try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] == null) process.env[key] = val;
    }
  }
} catch {
  /* ignore */
}

const PORT = process.env.PORT || 3001;
const HOST =
  process.env.HOST ||
  (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.PORT ? '0.0.0.0' : '127.0.0.1');

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🐱 捡到猫服务已启动');
  console.log(`   监听: http://${HOST}:${PORT}`);
  console.log(`   API:  /api/feed`);
  console.log(`   页面: http://${HOST}:${PORT}  （需先 npm run build --prefix client）`);
  if (HOST === '127.0.0.1') {
    console.log('   ⚠️  本地请用 127.0.0.1 不要用 localhost');
  }
  console.log('');
});
