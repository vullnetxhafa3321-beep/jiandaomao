# 团队协作指南

## 仓库结构

```
jiandaomao/
├── client/     ← 前端负责（页面、组件、样式）
├── server/     ← 后端负责（API、数据库、上传）
├── docs/       ← 产品文档、协作说明
└── package.json
```

## 克隆与启动

```bash
git clone <仓库地址>
cd jiandaomao
npm run install:all

# 方式 A：本地联调（推荐开发时）
npm run dev
# 前端 http://localhost:5173  后端 http://localhost:3001

# 方式 B：只跑前端，连线上后端
cd client
cp .env.example .env.local
# 编辑 .env.local，填入后端部署地址：
# VITE_API_BASE=https://xxx.railway.app
npm run dev
```

## 分支规范

| 分支 | 用途 |
|------|------|
| `main` | 稳定可 demo 的版本，只通过 PR 合并 |
| `feat/ui-*` | 前端功能（你） |
| `feat/api-*` | 后端接口（后端同学） |
| `fix/*` | Bug 修复 |

```bash
# 开新功能前，先拉最新代码
git checkout main
git pull
git checkout -b feat/ui-detail-page

# 开发完提交
git add client/
git commit -m "feat(ui): 完善救助详情页进度条"
git push -u origin feat/ui-detail-page
```

## 分工边界

| 目录 | 负责人 | 说明 |
|------|--------|------|
| `client/src/pages/` | 前端 | 7 个页面 UI |
| `client/src/components/` | 前端 | 通用组件 |
| `client/src/api/client.ts` | 前端主导 | 调接口的唯一入口 |
| `client/src/types.ts` | **双方对齐** | 改字段先商量 |
| `server/src/` | 后端 | API、鉴权、数据库 |
| `server/data/hospitals.json` | 后端 | 医院种子数据 |

## 接口契约（连接前后端的关键）

前端通过 `client/src/api/client.ts` 调后端，后端按 PRD 第 7 节实现。

**改接口的流程：**
1. 在 `types.ts` 里更新类型
2. 在 `api/client.ts` 里加/改方法
3. 后端同学按新方法实现路由
4. 提 PR，对方 review 后合并

**当前接口列表：**

| 方法 | 路径 | 前端调用 |
|------|------|----------|
| POST | `/api/auth/login` | `api.login()` |
| GET | `/api/auth/me` | `api.me()` |
| GET | `/api/feed` | `api.feed()` |
| POST | `/api/rescues` | `api.createRescue()` |
| GET | `/api/rescues/:id` | `api.getRescue()` |
| PATCH | `/api/rescues/:id/status` | `api.updateStatus()` |
| POST | `/api/rescues/:id/hospital` | `api.bindHospital()` |
| POST | `/api/rescues/:id/reports` | `api.uploadReports()` |
| GET | `/api/hospitals/nearby` | `api.nearbyHospitals()` |
| GET | `/api/me/rescues` | `api.myRescues()` |

Mock 验证码：`123456`

## 避免冲突的技巧

1. **你改 `client/`，她改 `server/`，尽量不交叉**
2. **只有 `types.ts` 需要双方同步** — 改之前群里说一声
3. **每天合并一次 `main`**，不要攒到最后
4. **大改动用 PR**，不要直接推 main

## 邀请队友

仓库管理员在 GitHub 上：
`Settings → Collaborators → Add people` → 输入队友 GitHub 用户名

## 部署（答辩用）

```bash
npm run build   # 打包前端
npm start       # 后端同时提供 API + 静态页面
```

最终 Demo 链接发给评委即可。
