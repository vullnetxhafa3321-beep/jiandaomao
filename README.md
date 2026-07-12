<p align="center">
  <img src="client/public/icons/logo-jiandaomao.png" alt="捡到猫了 Logo" width="140" />
</p>

<h1 align="center">捡到猫了（Jiandaomao）</h1>

<p align="center">
  <b>捡猫 · 救助 · 领养</b> 一站式帮助平台<br/>
  面向城市流浪动物的移动端 H5：发现求助、附近医院/救助站、待领养、社区接力与 AI 救助问答。
</p>

<p align="center">
  <a href="https://github.com/vullnetxhafa3321-beep/jiandaomao">GitHub 仓库</a> ·
  <a href="https://jiandaomao.vercel.app">在线演示</a>
</p>

---

## 评测 / 分享请用这一个链接

**https://github.com/vullnetxhafa3321-beep/jiandaomao**

`main` 主干即为**当前最新完整版本**（含源码、本 README 运行说明、依赖清单、原创增量声明）。  
直接打开仓库首页或 `README.md` 即可，无需再切换多个 release 标签。

```bash
git clone https://github.com/vullnetxhafa3321-beep/jiandaomao.git
cd jiandaomao
npm run install:all
npm run serve
```

浏览器打开 **http://127.0.0.1:3001**（请用 `127.0.0.1`，不要用 `localhost`）。

在线试用：**https://jiandaomao.vercel.app**

---

## 产品简介

「捡到猫了」帮助普通人在街头遇到流浪猫时，快速完成：**定位求助 → 找医院/救助站 → 发布/领养 → 问 AI 怎么办**。

| 模块 | 做什么 |
|------|--------|
| 地图首页 | 查看附近流浪求助、推荐医院、推荐救助站 |
| 我捡到猫了 | 行动引导：发布求助、友好医院、AI 助手 |
| 流浪求助 | 「要不起」等求助贴（位置模糊保护） |
| 待领养 | 送医后的领养信息发布与浏览 |
| AI 助手 | 领域守卫 + 宠物知识库 + 免费模型问答 |
| 滴滴宠物专车 | 一键引导跳转送医出行 |

品牌 Logo 见上方圆形标识（摸猫头 + 绿丛），全站「猫爪」入口已统一为该 Logo。

---

## 运行说明

### 环境要求

- Node.js 18+（推荐 20/22）
- npm 9+

### 安装与启动

```bash
# 安装依赖（根目录 + client + server）
npm run install:all

# 方式 A：开发（前端 :5173，后端 :3001）
npm run dev

# 方式 B：生产同域（推荐评测）
npm run serve
```

### 可选环境变量

复制 `server/.env.example` → `server/.env`（**切勿提交 `.env`**）：

| 变量 | 说明 |
|------|------|
| `BAIDU_API_KEY` / `BAIDU_SECRET_KEY` | 百度动物识别（可选） |
| `JWT_SECRET` | 登录 token（生产建议配置） |

AI 问答默认使用免费 [Pollinations](https://text.pollinations.ai/openai)，**无需密钥**。  
部署细节见 [docs/DEPLOY.md](docs/DEPLOY.md)。

---

## 依赖清单

由 `npm run install:all` 安装（版本以各目录 `package.json` / lockfile 为准）。

### 根目录

| 包 | 用途 |
|----|------|
| `concurrently` | 同时启动前后端 |

### 前端 `client/`

| 包 | 用途 |
|----|------|
| `react` / `react-dom` | UI |
| `react-router-dom` | 路由 |
| `leaflet` / `react-leaflet` | 地图 |
| `qrcode` | 分享二维码 |
| `vite` / `@vitejs/plugin-react` / `typescript` | 构建 |
| `tailwindcss` / `postcss` / `autoprefixer` | 样式 |

### 后端 `server/`

| 包 | 用途 |
|----|------|
| `express` | HTTP API |
| `better-sqlite3` | SQLite |
| `cors` / `multer` / `jsonwebtoken` / `uuid` | 跨域、上传、登录、ID |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vite + React + TypeScript + Tailwind |
| 后端 | Node.js + Express + SQLite |
| 部署 | Vercel 全栈演示 |

---

## 原创增量与开源引用声明

本仓库为团队实现的完整产品工程（页面与交互、Express/SQLite 业务、地图与社区、领养流程、品牌与部署等），**主体业务代码为本团队原创增量**。

为避免版权争议，声明参考来源及边界：

| 参考来源 | 用途 | 本团队原创增量 |
|----------|------|----------------|
| [MnAuRb AI问答模块_v2接口](https://github.com/MnAuRb/Picked-up_Stray-cat-rescue-/tree/main/AI%E9%97%AE%E7%AD%94%E6%A8%A1%E5%9D%97_v2%E6%8E%A5%E5%8F%A3) | 客户端接口形态参考 | 服务端代理、产品内嵌 UI、业务集成 |
| [MnAuRb AI问答模块_v3知识库](https://github.com/MnAuRb/Picked-up_Stray-cat-rescue-/tree/main/AI%E9%97%AE%E7%AD%94%E6%A8%A1%E5%9D%97_v3%E7%9F%A5%E8%AF%86%E5%BA%93) | 领域守卫与知识库结构参考 | `/api/ai`、Pollinations 默认上游、产品流程 |
| React / Express / Leaflet 等 npm 包 | 运行时框架 | 按各包许可证使用 |

密钥不入库；第三方能力仅通过环境变量配置。

---

## 项目结构

```
jiandaomao/
├── client/          # React 前端（含品牌 Logo）
├── server/          # Express API + SQLite + AI 知识库
├── versions/        # 历史版本快照（可选查阅）
├── docs/            # PRD / 部署 / 协作
└── README.md        # ← 你正在看的入口文档
```

## Demo 路径

1. 打开演示站或本地 `3001`  
2. 地图浏览求助 / 医院 / 救助站  
3. 点「我捡到猫了」→ AI 或发布求助  
4. 浏览「待领养」「流浪求助」  

## 团队

黑客松项目 · 最新代码始终在 **`main`**
