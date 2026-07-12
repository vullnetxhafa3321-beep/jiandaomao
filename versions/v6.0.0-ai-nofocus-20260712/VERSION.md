# 捡到猫了 · v6.0.0 ai-nofocus

| 字段 | 内容 |
| --- | --- |
| 版本号 | v6.0.0-ai-nofocus |
| 打包日期 | 2026-07-12 |
| Git commit | 见 `GIT_COMMIT.txt` |

## 相对 v5.1 本版本调整

1. **AI 助手**：打开全屏对话时不再自动 focus 输入框，避免手机立刻弹出输入法
2. 其余功能与 v5.1 一致（品牌 Logo、Pollinations + 领域守卫/知识库）

## 启动方式

```bash
cd v6.0.0-ai-nofocus-20260712
npm run install:all
npm run serve
```

打开 http://127.0.0.1:3001

## 说明

- 快照不含 `node_modules` / `dist` / `.git` / `.env`
- **切勿**把 API Key / JWT_SECRET 提交进仓库
