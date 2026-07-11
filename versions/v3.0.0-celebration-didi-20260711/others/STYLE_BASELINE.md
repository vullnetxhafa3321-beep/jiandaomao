# 捡到猫 · 视觉风格基调文档

| 字段 | 内容 |
| --- | --- |
| 文档版本 | v0.1 |
| 创建日期 | 2026-07-11 |
| 适用范围 | H5 App、首页小镇、二级页面头图、AI 插画资产、产品宣传图 |
| 视觉基调 | 明亮治愈的低多边形 3D 猫咪救助小镇 |
| 核心目标 | 统一后续 AI 出图、界面设计和前端实现的风格口径 |

## 1. 参考图

### 1.1 目标产品图：猫咪救助小镇首页

![猫咪救助小镇首页参考](assets/style-reference-generated-home.png)

这张图是当前产品视觉目标的主参考：竖版移动端、功能建筑融入小镇、猫咪状态点位、轻量 UI 浮层和底部主行动木牌。

### 1.2 风格来源图：低多边形海边小镇

![低多边形海边小镇风格参考](assets/style-reference-low-poly-town-crop.png)

这张图从原始截图中裁出有效画面，提供底层美术语言：低多边形块面、平面着色、明亮蓝天、海湾/湖泊、简化建筑、微缩箱庭感。

## 2. 一句话风格定义

「捡到猫」的视觉世界是一个明亮、可信、温暖、可行动的 2.5D 低多边形猫咪救助小镇：像治愈系独立游戏里的海边箱庭，既可爱、有细节，也保持公益产品需要的清爽、可靠和行动感。

## 3. 风格 DNA

| 维度 | 规则 |
| --- | --- |
| 美术类型 | 风格化 3D 插画、Low Poly、2.5D、轻微卡通渲染 |
| 氛围 | 阳光、治愈、清爽、温暖、可信、轻公益 |
| 构图 | 竖版移动端优先，横向小镇场景嵌入 9:16 画布 |
| 细节密度 | 中高细节，但保持干净，不堆满卡片和复杂纹理 |
| 材质 | 纯色块、低纹理、轻纸感、木牌感、奶油白 UI |
| 交互隐喻 | 建筑是功能入口，猫咪是事件入口，木牌是主行动 |
| 情绪边界 | 可爱但不幼稚，温暖但不廉价，游戏化但不做重度游戏感 |

## 4. 画面构成规范

### 4.1 场景层

场景应像一个可以探索的小镇，而不是普通 App 背景图。

- 远景：晴空蓝天空、白色低多边形山体、湖泊或海湾、少量帆船/飞鸟。
- 中景：猫咪救助站、宠物医院、领养咖啡馆、物资仓库、小镇公告、邮箱/信箱。
- 近景：草坡、小花、小路、木栅栏、长椅、猫窝、纸箱、告示牌。
- 动线：小路从底部主行动区域通向核心建筑，让用户自然理解「我捡到猫了」会进入救助流程。
- 留白：天空和水面承担呼吸感，避免全屏都被建筑和文字塞满。

### 4.2 功能建筑

建筑不是装饰，是一级入口。

| 建筑 | 视觉隐喻 | 产品含义 |
| --- | --- | --- |
| 猫咪救助站 | 屋顶露台、爪印招牌、藤蔓、小猫 | 救助流程、附近救助站、指南 |
| 宠物医院 | 十字标识、浅蓝绿招牌、干净窗户 | 医院列表、治疗状态、送医 |
| 领养咖啡馆 | 暖色遮阳棚、咖啡杯、小黑板 | 待领养、领养详情 |
| 物资仓库 | 木屋、箱子、推车、补给标记 | 物资申请/捐助 |
| 小镇公告 | 木质公告栏、贴纸、照片、地图 | 社区动态、安全须知、公告 |
| 邮箱/信箱 | 小红顶邮箱、信件图标 | 消息、通知 |

建筑标签优先由前端 DOM 渲染，AI 图里只保留干净招牌区域，避免中文乱码。

### 4.3 猫咪与状态

猫咪是场景里的「内容入口」，不是纯装饰。

- 猫咪数量：主画面 4-7 只，分散在屋顶、窗台、草地、纸箱、咖啡馆旁。
- 姿态：坐着、趴着、探头、睡在窝里、看向用户，避免过度拟人。
- 状态气泡：求助中、治疗中、待领养、已安置、补给中。
- 状态标记：小旗帜、爪印 pin、圆形徽章、轻气泡都可以，但要统一圆润、低浮层、少文字。
- 真实猫照片：仅用于档案卡或详情，不嵌入场景主体，避免和风格化 3D 冲突。

## 5. UI 融入原则

这套风格的关键不是「插画背景 + 普通卡片」，而是让 UI 像小镇原生物件。

| UI 类型 | 推荐表现 | 避免 |
| --- | --- | --- |
| 主 CTA | 珊瑚红木牌、救援告示牌、悬挂绳结 | 普通圆角渐变按钮 |
| 顶部信息 | 爪印徽章、经验条、纸片城市便签、资源小牌 | 大面积导航栏 |
| 信息卡 | 奶油白纸片、夹子、贴纸、低透明阴影 | 玻璃拟态、强毛玻璃 |
| 状态标签 | 小圆章、爪印 pin、轻量胶囊 | 高饱和警告色大面积铺开 |
| 二级页面入口 | 木牌、纸条、建筑招牌、公告贴纸 | 堆叠营销卡片 |
| 底部导航 | 可在二级页保留，但首页优先用小镇建筑导航 | 首页传统 Tab 抢走沉浸感 |

## 6. 色彩系统

整体配色是「晴空蓝 + 湖水蓝 + 奶油白 + 暖米木色 + 草地绿 + 珊瑚红」。饱满但克制，避免大面积浅薄荷绿和廉价儿童感。

| Token | 色值 | 用途 |
| --- | --- | --- |
| `sky-500` | `#57BBFB` | 主天空、清爽背景 |
| `sky-300` | `#8EC4E8` | 远山、水面高光、轻浮层 |
| `lake-600` | `#4C89A9` | 湖水深色、信息辅助 |
| `cream-50` | `#FFF7EA` | 档案卡、纸片、页面底色 |
| `cream-100` | `#F4E7D7` | 卡片底、便签、弹窗 |
| `sand-300` | `#E5D1B6` | 建筑墙面、次级面 |
| `wood-500` | `#CBA76C` | 木牌、栅栏、路径点缀 |
| `wood-700` | `#9E6549` | 木牌文字、屋顶暗部、边缘 |
| `grass-500` | `#8FBF58` | 草地、积极状态、自然元素 |
| `moss-700` | `#4E584D` | 深绿阴影、远树、正文深色替代 |
| `coral-500` | `#EF755D` | 主行动按钮、关键提示 |
| `brick-600` | `#C65E46` | 屋顶、危险/紧急状态辅助 |
| `ink-700` | `#6B4C3D` | 中文标题、深色正文 |

### 6.1 配色比例

- 天空/水面/远景：35%-45%。
- 草地/自然元素：20%-30%。
- 建筑暖色/木色：15%-25%。
- 奶油白 UI：10%-15%。
- 珊瑚红行动色：3%-6%，只用于最重要行动。

### 6.2 状态色

| 状态 | 色值 | 使用 |
| --- | --- | --- |
| 求助中 | `#EF755D` | 紧急但温暖，不用刺眼红 |
| 治疗中 | `#64B6C6` | 医疗、送医、检查 |
| 待领养 | `#F4A64F` | 温暖期待 |
| 已安置 | `#79B86D` | 成功、归档 |
| 补给中 | `#D9A35B` | 物资、仓库 |

## 7. 形状、光影与材质

### 7.1 低多边形规则

- 山体、云、树冠、草坡用明显块面切分。
- 建筑保持简化几何体，不追求真实建筑细节。
- 色块边缘干净，少用复杂笔触、噪点、厚涂纹理。
- 曲线可以存在于 UI 和猫咪轮廓，但环境主体要保持几何块面感。

### 7.2 光影规则

- 光源：默认左上或右上自然阳光，全项目保持一致。
- 阴影：柔和、短、浅，不做强烈写实投影。
- 高光：用于屋顶边、窗户、水面、按钮上沿。
- 材质：木牌可以有轻微纹理，但不要粗糙写实木纹；纸片可以有轻微奶油纸感。

### 7.3 圆角与边框

- 产品 UI 圆角建议 12-20px，卡片不超过 24px。
- 不使用粗黑手绘描边作为主风格。
- 可以用轻微内阴影、上沿高光、浅棕描边来形成 3D 纸片感。
- 重点按钮可有 2-4px 的木牌厚度或下投影。

## 8. 字体与文字

### 8.1 字体气质

中文应清晰、温暖、易读。标题可以略圆润，正文保持系统字体或可读性强的圆体。

- 标题：偏圆润、饱满、有亲和力。
- 正文：系统 sans-serif，保证移动端阅读。
- 数字：清晰、游戏 HUD 感可略强，但不要像重度游戏数值面板。

### 8.2 文案口吻

- 有行动感：我捡到猫了、立即上报、帮它回家。
- 有温度：附近的小猫正在等待帮助。
- 不卖惨：避免过度悲情、惊悚或沉重。
- 不过度幼稚：少用连串语气词和低龄化拟声词。

## 9. 页面级使用规范

### 9.1 首页

首页是沉浸式小镇，不做传统卡片流。

- 第一屏必须看到小镇主体、猫咪、主行动木牌。
- 建筑入口坐标稳定，支持热区点击。
- 档案卡浮在中下方，不能遮挡核心建筑。
- 底部主行动始终最高优先级。

### 9.2 二级页面

二级页面不必全部做复杂场景，但要继承同一套材质和色彩。

- 顶部可使用低多边形小插画横幅。
- 内容区使用奶油纸片、浅木牌标题、小圆章标签。
- 列表卡片减少边框厚度，保持可读和可扫视。
- 不用整页大面积高饱和背景，避免疲劳。

### 9.3 弹窗与抽屉

- 半屏抽屉像「小镇告示纸」或「建筑说明牌」。
- 弹窗背景用奶油白/暖米色，按钮用珊瑚红或木色。
- 状态变化用轻微弹跳、浮起、呼吸，不做复杂粒子。

## 10. AI 出图统一母提示词

后续生成首页、插画、宣传图或功能页头图时，优先使用下面这段作为基础提示词，再替换中括号里的具体场景。

```text
4K ultra high definition, vertical 9:16 mobile app concept art, a bright stylized 3D low-poly miniature town scene for a warm stray cat rescue product called "捡到猫". The visual style is healing indie game art, clean sunny atmosphere, low-poly geometric surfaces, simplified 3D forms, cel-shading feeling, soft shadows, no realistic texture, no heavy painterly brushwork.

Scene: [在这里填写具体页面/功能场景，例如：a seaside cat rescue town homepage / a friendly pet hospital corner / an adoption cafe garden / a supply warehouse notice board]. The environment includes clear blue sky, distant white low-poly mountains, lake or sea bay, sunny grass slope, small flowers, stone path, wooden fences, trees, warm beige buildings, terracotta roofs, cream paper signs, coral red action sign, and several cute but natural cats.

Product UI is integrated into the scene, not ordinary stacked cards. Buildings and objects look like interactive app entrances. Use cream-white paper cards, wooden rescue signs, paw badges, small status pins, rounded icon badges, and light game-like HUD details. Keep the interface hierarchy clear and suitable for a mobile H5 app.

Mood keywords: premium cute, trustworthy, warm, healing, sunny, clean, refreshing, public-good product, action-oriented, not childish, not realistic, not toy plastic. Color palette: sky blue, lake blue, cream white, warm beige, terracotta red, wood brown, grass green, coral red, small warm yellow accents. Detailed but uncluttered, polished, high-end cute 3D illustration.
```

### 10.1 中文版母提示词

```text
4K 超高清，竖版 9:16 移动端 App 概念图，一个明亮治愈的「捡到猫」流浪猫救助小镇。整体风格是风格化 3D 插画、低多边形块面、2.5D 微缩箱庭、治愈系独立游戏美术、干净阳光、清爽高级。不是写实，不是厚涂，不是普通小程序模板。

画面场景：[填写具体页面或功能，例如：首页海边救助小镇 / 友好宠物医院角落 / 领养咖啡馆花园 / 物资仓库告示牌]。环境包含晴空蓝天空、远处白色低多边形山体、湖泊或海湾、阳光草坡、小花、石板路、木栅栏、树木、暖米色建筑、砖红屋顶、奶油白纸片标牌、珊瑚红行动木牌，以及几只自然可爱的小猫。

产品 UI 融入场景，不要普通卡片堆叠。建筑和物件像可交互的 App 功能入口。使用奶油白纸片卡、木质救援告示牌、爪印徽章、小状态 pin、圆润图标徽章、轻量游戏 HUD 细节。界面层级清晰，适合手机端 H5。

情绪关键词：高级可爱、可信赖、温暖、治愈、阳光、清爽、公益产品、行动感、可爱但不幼稚。配色：晴空蓝、湖水蓝、奶油白、暖米色、砖红色、木棕色、草绿色、珊瑚红、少量暖黄色。细节精致但不拥挤，整体像一个可信赖又可爱的猫咪救助小世界。
```

## 11. AI 负向提示词

每次出图建议追加下面这段，减少风格跑偏。

```text
Do not copy any specific building, hotel sign, restaurant sign, text, or composition from the reference image. No black borders, no screenshot frame, no unreadable garbled text, no realistic photo collage, no heavy oil painting, no cyberpunk, no plastic toy feeling, no glassmorphism, no generic mini-program template, no large pale mint green background, no thick hand-drawn black outlines, no dark gloomy mood, no horror, no dirty street realism, no excessive UI cards, no over-saturated childish palette.
```

中文版：

```text
不要复制参考图中的具体建筑、酒店招牌、餐厅招牌、文字或构图。不要黑边，不要截图界面，不要文字乱码，不要真实照片拼贴，不要厚重油画，不要赛博朋克，不要塑料玩具感，不要玻璃拟态，不要普通小程序模板，不要大面积浅薄荷绿，不要粗黑手绘描边，不要阴暗脏乱，不要恐怖感，不要过多 UI 卡片，不要低龄化高饱和配色。
```

## 12. 可替换场景短语

| 用途 | 替换短语 |
| --- | --- |
| 首页 | `a full mobile homepage showing a seaside stray cat rescue town with interactive buildings and cat status markers` |
| 宠物医院 | `a friendly pet hospital building in the same low-poly seaside rescue town, with soft blue-green medical signs and cats waiting safely` |
| 领养页 | `a warm adoption cafe garden with cats resting near cream paper profile cards and small adoption badges` |
| 物资页 | `a cozy supply warehouse corner with wooden crates, cat food bags, rescue tools, and warm donation notice boards` |
| 公告页 | `a town bulletin board covered with neat rescue notices, tiny cat photos, pins, maps, and public-good announcements` |
| 空状态 | `a quiet sunny grass path with a small cat paw sign and gentle empty-state feeling, still warm and hopeful` |
| 成功状态 | `a celebratory but restrained rescue completion scene, cats safely resting, warm sunlight, small flowers, soft confetti-like paper pieces` |

## 13. 前端落地提示

为了让实现和 AI 图保持一致，建议逐步替换当前偏手绘的 `frog-*` 风格。

- 视觉变量从 `frog` 命名迁移到 `town` 或 `rescue-town` 命名。
- 旧的粗边框、怪异手绘圆角减少使用，改为奶油纸片、浅阴影、低多边形色块。
- 首页背景优先使用完整场景图或分层插画资产；建筑热区和中文标签由前端渲染。
- 所有中文关键字、金额、进度、状态都用 DOM，不依赖 AI 图片文字。
- 图标优先使用圆润线性图标或爪印/小旗帜徽章，不用复杂拟物图标。
- 动效保持轻：点击下压、气泡浮起、猫咪点位轻微呼吸、卡片 160-220ms 切换。

## 14. 质量检查清单

出图或实现后，用这张清单判断是否统一。

- 是否一眼是低多边形 3D 治愈小镇，而不是普通卡片 App？
- 是否能看出猫咪救助主题，而不是泛宠物/旅游/餐饮？
- 建筑是否能自然对应功能入口？
- 主行动「我捡到猫了」是否足够醒目？
- UI 是否融入场景，而不是贴在插画上的外来卡片？
- 色彩是否明亮但克制，没有大面积浅薄荷绿或过度儿童化？
- 中文是否清晰可读，且关键文字由前端渲染？
- 猫咪是否自然可爱，没有过度拟人或真实照片拼贴感？
- 阴影和材质是否轻，避免塑料玩具和厚重油画？
- 页面是否仍然像一个可信赖的公益产品，而不只是游戏皮肤？
