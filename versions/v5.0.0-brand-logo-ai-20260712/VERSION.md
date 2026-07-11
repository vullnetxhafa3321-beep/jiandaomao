# 捡到猫了 · v5.0.0 brand-logo-ai

| 字段 | 内容 |
| --- | --- |
| 版本号 | v5.0.0-brand-logo-ai |
| 打包日期 | 2026-07-12 |
| Git commit | 见 `GIT_COMMIT.txt` |

## 相对 v4 本版本新增 / 调整

1. **品牌 Logo**：去白底圆形 Logo 替换全部「猫爪」图标（首页、我捡到猫了 FAB、空状态等）
2. **Favicon / 触控图标**：使用同一品牌 Logo
3. **AI 问答**：接入 OpenAI 兼容接口（默认免费 Pollinations；可选 Groq 等）；密钥仅服务端
4. **地图文案**：推荐医院 / 推荐救助站；求助地址去掉「模糊定位」字样；医院仅部分标注友好
5. **流浪求助**：模块命名由「流浪发现」统一更名
6. **待领养**：去掉「其他」类型

## 启动方式

```bash
cd v5.0.0-brand-logo-ai-20260712
npm run install:all
# 可选：server/.env 写入 BAIDU_* / JWT_SECRET / AI_*（切勿提交）
npm run serve
```

打开 http://127.0.0.1:3001

## 说明

- 快照不含 `node_modules` / `dist` / `.git` / `.env`
- **切勿**把百度 Key、JWT_SECRET、AI_API_KEY 提交进仓库
