# 捡到猫（Jiandaomao）

城市流浪猫救助引导 H5 —— 发布动态、附近友好医院、滴滴宠物专车跳转、救助档案。

## 功能

- 📢 发布救助动态（图文 + 定位）
- 🏥 上海 22 家流浪猫友好医院（距离排序 + 优惠说明）
- 🚗 一键跳转滴滴宠物专车（多级降级 + 复制地址）
- 📋 救助状态闭环（发现 → 救了 → 送医 → 检查 → 领养/回家）
- 📤 链接分享 + OG 预览
- 👤 昵称快速体验 / 手机号 mock 登录（验证码 `123456`）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vite + React + TypeScript + Tailwind |
| 后端 | Node.js + Express + SQLite |
| 数据 | better-sqlite3 + JSON 种子医院 |

## 团队协作

详见 **[docs/COLLAB.md](docs/COLLAB.md)** — 分支规范、分工边界、接口契约。

```bash
git clone https://github.com/vullnetxhafa3321-beep/jiandaomao.git
cd jiandaomao
npm run install:all
npm run dev
```

前端连远程后端：复制 `client/.env.example` 为 `client/.env.local`，填入 `VITE_API_BASE`。

## 快速开始

```bash
# 安装依赖
npm run install:all

# 启动开发（前端 :5173，后端 :3001）
npm run dev
```

浏览器打开：**http://localhost:5173**

## 生产部署

```bash
npm run build
npm start
```

后端会在 `http://localhost:3001` 同时提供 API 和前端静态文件。

## 项目结构

```
jiandaomao/
├── client/          # React 前端
├── server/          # Express API
│   ├── data/        # hospitals.json + SQLite
│   └── uploads/     # 用户上传图片
├── docs/PRD.md      # 产品需求文档
└── gemini_ui.html   # 原始 UI 参考
```

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/feed` | 动态流 |
| POST | `/api/rescues` | 发布救助 |
| GET | `/api/rescues/:id` | 详情 |
| PATCH | `/api/rescues/:id/status` | 状态流转 |
| POST | `/api/rescues/:id/hospital` | 绑定医院 |
| POST | `/api/rescues/:id/reports` | 上传报告 |
| GET | `/api/hospitals/nearby` | 附近医院 |

## 滴滴跳转配置

编辑 `client/src/config/didi.ts`：

- `wechatUrlLink` — 微信内 URL Link（真机验证后填入）
- `appSchemeTemplate` — App 唤起 scheme
- `shortLinkFallback` — 小程序 Short Link 备用

## Demo 流程

1. 首页 → 「我捡到猫了」→ 快速体验登录
2. 发布动态（模板 + 定位）
3. 详情页 → 「救了」→ 选医院 → 「叫滴滴宠物专车」
4. 上传报告 → 开放领养 → 分享链接

## 团队

黑客松 48h MVP · 基于 PRD v1.1
