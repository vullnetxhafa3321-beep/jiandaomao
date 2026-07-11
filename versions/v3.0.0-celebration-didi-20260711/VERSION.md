# 捡到猫了 · v3.0.0 celebration-didi

| 字段 | 内容 |
| --- | --- |
| 版本号 | v3.0.0-celebration-didi |
| 打包日期 | 2026-07-11 |
| Git commit | 见 `GIT_COMMIT.txt` |
| 视觉基调 | 喜庆喜报条 + 滴滴 SSO 入口 |

## 相对 v2 本版本新增 / 调整

1. **喜报条**：左侧红底金字「喜」「报」竖章样式，二字垂直居中于章标中部，条幅整体尺寸不变
2. **滴滴宠物专车**：统一跳转 `http://sso.sts.didiglobal.com/login`，并复制医院地址
3. **品种识别**：百度动物识别（密钥仅存 Vercel / 本地 `.env`，不入库）

## 启动方式

```bash
cd v3.0.0-celebration-didi-20260711
npm run install:all
npm run serve
```

打开 http://127.0.0.1:3001

## 说明

- 本目录为完整源码快照，不含 `node_modules` / `dist` / `.git` / `.env`
- 百度 Key 请自行配置 `BAIDU_API_KEY` / `BAIDU_SECRET_KEY`，切勿提交密钥
- **我的位置**：地图标记改为常见红色定位针（非猫头）
