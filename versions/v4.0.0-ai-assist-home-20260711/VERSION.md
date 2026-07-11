# 捡到猫了 · v4.0.0 ai-assist-home

| 字段 | 内容 |
| --- | --- |
| 版本号 | v4.0.0-ai-assist-home |
| 打包日期 | 2026-07-11 |
| Git commit | 见 `GIT_COMMIT.txt` |

## 相对 v3 本版本新增 / 调整

1. **AI 问答**：点「我捡到猫了」后以介绍卡片进入，展开对话；快捷标签一键发送
2. **首页文案**：副标题「捡猫 救助 领养 一站式帮助平台」；云朵样式优化
3. **地图页**：去掉右上角手册/个人入口；全流程指南移至「我的」
4. **安全须知**：「临时带回家」合并为一段
5. **API 安全**：停用开放百度 token/animal 代理；识别仅服务端持钥；文档强调 Vercel 环境变量

## 启动方式

```bash
cd v4.0.0-ai-assist-home-20260711
npm run install:all
# 可选：server/.env 写入 BAIDU_API_KEY / BAIDU_SECRET_KEY / JWT_SECRET
npm run serve
```

打开 http://127.0.0.1:3001

## 说明

- 快照不含 `node_modules` / `dist` / `.git` / `.env`
- **切勿**把百度 Key 或 JWT_SECRET 提交进仓库
