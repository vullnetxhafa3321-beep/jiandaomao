# 部署说明 — 让别人也能用「捡到猫了」

## 公开链接（直接打开就能用）

- **网站：** https://jiandaomao.vercel.app  
- **仓库：** https://github.com/vullnetxhafa3321-beep/jiandaomao  

Vercel 上同时托管前端与 `/api` 后端（Express + SQLite）。冷启动会自动写入演示数据（医院、流浪发现、待领养），使用方式接近本地 `npm run serve`。

> Serverless 的 `/tmp` 数据在实例回收后可能重置，适合演示与黑客松。需要永久存盘时再用 Render/Railway。

---

## 自己本地跑

```bash
git clone https://github.com/vullnetxhafa3321-beep/jiandaomao.git
cd jiandaomao
npm run install:all
npm run serve
```

浏览器打开 `http://127.0.0.1:3001`。

---

## 可选：Render / Railway 长驻全栈

见根目录 `render.yaml`、`Dockerfile`、`railway.toml`。
