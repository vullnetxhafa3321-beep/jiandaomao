import app from './app.js';

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
