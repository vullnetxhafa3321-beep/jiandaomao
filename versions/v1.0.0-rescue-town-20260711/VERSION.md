# 捡到猫了 · v1.0.0 rescue-town

| 字段 | 内容 |
| --- | --- |
| 版本号 | v1.0.0-rescue-town |
| 打包日期 | 2026-07-11 |
| Git commit | 见 `GIT_COMMIT.txt` |
| 视觉基调 | STYLE_BASELINE 低多边形救助小镇 |

## 本版本包含

1. 首页 50/50：Leaflet 真实地图 + 救助流程手册
2. 地图标记 API：求助帖 / 医院 / 救助站；🐱 跳转流浪发现
3. 医院真实坐标 + 打车 / 导航
4. chinese-cats 30 只猫种子数据（论坛 + 待领养）
5. 底部「地图」Tab；首次欢迎卡片（可关闭不再弹出）
6. 每页右上角「首页」入口
7. STYLE_BASELINE 色板 + 统一 SVG Icon / IconBadge

## 启动方式

```bash
cd v1.0.0-rescue-town-20260711
npm run install:all
npm run serve
```

打开 http://127.0.0.1:3001

## 说明

- 本目录为完整源码快照，不含 `node_modules` / `dist` / `.git`
- 风格文档：`others/STYLE_BASELINE.md`
