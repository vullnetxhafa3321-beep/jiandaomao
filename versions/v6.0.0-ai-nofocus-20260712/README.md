# 捡到猫了（Jiandaomao）

城市流浪动物救助引导 H5：地图求助、友好/推荐医院与救助站、待领养、流浪求助社区、滴滴宠物专车引导、AI 救助问答。

**推荐版本标签：** [`v6.0.0`](https://github.com/vullnetxhafa3321-beep/jiandaomao/releases/tag/v6.0.0)  
**公开仓库：** https://github.com/vullnetxhafa3321-beep/jiandaomao  
**在线演示：** https://jiandaomao.vercel.app

---

## 运行说明

### 环境要求

- Node.js 18+（推荐 20/22）
- npm 9+

### 安装依赖

```bash
git clone https://github.com/vullnetxhafa3321-beep/jiandaomao.git
cd jiandaomao
git checkout v6.0.0   # 提交评测请固定到 v6
npm run install:all   # 安装根目录 + client + server 全部依赖
```

### 本地开发

```bash
npm run dev
```

- 前端：http://127.0.0.1:5173  
- 后端 API：http://127.0.0.1:3001  

### 本地生产同域运行（推荐）

```bash
npm run serve
```

浏览器打开：**http://127.0.0.1:3001**（请用 `127.0.0.1`，不要用 `localhost`）

### 可选环境变量

复制 `server/.env.example` 为 `server/.env`（**切勿提交 `.env`**）：

| 变量 | 说明 |
|------|------|
| `BAIDU_API_KEY` / `BAIDU_SECRET_KEY` | 百度动物识别（可选） |
| `JWT_SECRET` | 登录 token 密钥（生产必填） |

AI 问答默认走免费 Pollinations，**无需密钥**。

更完整的部署说明见 [docs/DEPLOY.md](docs/DEPLOY.md)。

---

## 依赖清单

根目录 `npm run install:all` 会安装以下依赖（版本以各目录 `package.json` / lockfile 为准）。

### 根目录（编排）

| 包 | 用途 |
|----|------|
| `concurrently` | 同时启动前后端开发进程 |

### 前端 `client/`

| 包 | 用途 |
|----|------|
| `react` / `react-dom` | UI |
| `react-router-dom` | 路由 |
| `leaflet` / `react-leaflet` | 地图 |
| `qrcode` | 分享二维码 |
| `vite` / `@vitejs/plugin-react` | 构建 |
| `typescript` | 类型 |
| `tailwindcss` / `postcss` / `autoprefixer` | 样式 |

### 后端 `server/`

| 包 | 用途 |
|----|------|
| `express` | HTTP API |
| `better-sqlite3` | SQLite |
| `cors` | 跨域 |
| `multer` | 上传 |
| `jsonwebtoken` | 登录 JWT |
| `uuid` | ID 生成 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vite + React + TypeScript + Tailwind |
| 后端 | Node.js + Express + SQLite |
| 数据 | better-sqlite3 + JSON 种子数据 |
| 部署 | Vercel（全栈演示） |

---

## 功能概览（v6）

- 地图：流浪求助 / 推荐医院 / 推荐救助站
- 待领养发布与浏览
- 流浪求助（原「流浪发现」）社区贴与评论
- 「我捡到猫了」行动引导 + 品牌 Logo
- 滴滴宠物专车跳转引导
- AI 助手：领域守卫 + 宠物知识库检索 + Pollinations 免费模型
- 动物品种识别（百度，可选配置）

版本快照目录：`versions/v6.0.0-ai-nofocus-20260712/`

---

## 原创增量与开源引用声明（版权说明）

本仓库为团队在黑客松场景下独立实现的完整产品工程（前端页面与交互、Express/SQLite 后端、地图与社区业务、领养流程、部署与版本快照等），**主体业务代码为本团队原创增量**。

为避免版权争议，特此声明参考/借鉴的开源资料及其边界：

| 参考来源 | 用途 | 本团队原创增量 |
|----------|------|----------------|
| [MnAuRb/Picked-up_Stray-cat-rescue- · AI问答模块_v2接口](https://github.com/MnAuRb/Picked-up_Stray-cat-rescue-/tree/main/AI%E9%97%AE%E7%AD%94%E6%A8%A1%E5%9D%97_v2%E6%8E%A5%E5%8F%A3) | OpenAI 兼容客户端接口形态参考 | 服务端代理、产品内嵌 UI、与业务路由集成 |
| [MnAuRb/Picked-up_Stray-cat-rescue- · AI问答模块_v3知识库](https://github.com/MnAuRb/Picked-up_Stray-cat-rescue-/tree/main/AI%E9%97%AE%E7%AD%94%E6%A8%A1%E5%9D%97_v3%E7%9F%A5%E8%AF%86%E5%BA%93) | 领域守卫与宠物知识库结构/条目参考 | 接入本 App 的 `/api/ai`、Pollinations 默认上游、UI/产品流程 |
| 地图/瓦片与第三方 SDK（高德瓦片、滴滴跳转等） | 能力调用 | 业务封装与降级策略为本团队实现 |
| 开源 npm 依赖（React、Express、Leaflet 等） | 运行时框架 | 按各包许可证使用，见 `package-lock.json` |

**说明：** 未将第三方私有密钥写入仓库；百度等密钥仅通过环境变量配置。若评测需要核对 v6 固定版本，请使用标签 `v6.0.0`。

---

## 项目结构

```
jiandaomao/
├── client/           # React 前端
├── server/           # Express API + SQLite
│   ├── data/         # 医院/救助站/猫档案等种子数据
│   └── src/ai/       # AI 领域守卫 + 知识库
├── versions/         # 版本快照（含 v6.0.0）
├── docs/             # PRD / 部署 / 协作
└── README.md
```

## 团队协作

见 [docs/COLLAB.md](docs/COLLAB.md)。

## Demo 流程

1. 首页地图 → 「我捡到猫了」→ 体验登录  
2. AI 助手提问 / 发布流浪求助 / 查看推荐医院  
3. 待领养浏览与发布  
4. 详情页引导送医与滴滴宠物专车  

## 团队

黑客松项目 · 当前公开版本 **v6.0.0**
