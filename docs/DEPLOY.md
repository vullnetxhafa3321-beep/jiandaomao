# 部署说明 — 让别人也能用「捡到猫了」

本地是 **Vite 前端 + Express/SQLite 后端**。  
**Vercel 只能稳定托管前端**，无法长期保存 SQLite 文件，所以「和本地完全一样」要走下面任一全栈方案。

代码已在 GitHub：https://github.com/vullnetxhafa3321-beep/jiandaomao

---

## 推荐：Render 一键全栈（最接近本地）

1. 打开 https://dashboard.render.com → **New** → **Blueprint**
2. 连接 GitHub 仓库 `vullnetxhafa3321-beep/jiandaomao`
3. 识别到根目录 `render.yaml` 后创建
4. 部署完成后得到类似：`https://jiandaomao.onrender.com`
5. 把这个链接发给别人即可（页面 + API 同域，和本地 `npm run serve` 一样）

免费实例会休眠，冷启动约 30–60 秒属正常。

---

## 备选：Railway 全栈

1. https://railway.app → New Project → Deploy from GitHub
2. 选本仓库，使用根目录 `Dockerfile` / `railway.toml`
3. 生成公开域名后分享

---

## 继续用 Vercel 前端 + 远程 API

若只要 https://jiandaomao.vercel.app ：

1. 先用上面方案部署出 API 地址，例如 `https://jiandaomao.onrender.com`
2. Vercel 项目 → Settings → Environment Variables：
   - `VITE_API_BASE` = `https://jiandaomao.onrender.com`（不要末尾斜杠）
3. Redeploy

前端请求会打到远程 API；数据与本地演示种子一致（医院/流浪发现/待领养等）。

---

## 别人自己跑（GitHub clone）

```bash
git clone https://github.com/vullnetxhafa3321-beep/jiandaomao.git
cd jiandaomao
npm run install:all
npm run serve
```

浏览器打开终端里打印的地址（一般是 `http://127.0.0.1:3001`）。

---

## 为什么不能「全部塞进 Vercel」？

| 能力 | Vercel | Render / Railway |
|------|--------|------------------|
| 静态前端 | ✅ | ✅ |
| Express 长驻进程 | ❌（无状态函数） | ✅ |
| SQLite 写盘持久化 | ❌ | ✅ |
| 上传图片到本地 uploads | ❌ | ✅ |

所以：**分享给别人用 = GitHub 开源 + Render/Railway 全栈链接**。
