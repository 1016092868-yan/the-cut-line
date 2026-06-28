# 🏃 The Cut Line · 斩杀线

> **策略跑酷 × 人生模拟 × Roguelike**
>
> 22岁 → 35岁，穿越人生的13年。做出选择，躲避障碍，收集机遇——**愿你跑赢自己的斩杀线。**
>
> *May you outrun your own Cut Line.*

---

## 🎮 快速开始

```bash
git clone https://github.com/1016092868-yan/the-cut-line.git
cd the-cut-line
# 双击 index.html 或
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

**无需 Node.js、无需 npm、无需 Docker** — 纯静态 HTML，双击即玩。

> ⚠️ 首次加载需联网下载 Three.js CDN 库（~600KB），之后浏览器缓存。

---

## 🕹️ 操作说明

| 操作 | 键盘 | 移动端 |
|------|------|--------|
| 切换跑道（企业） | `1` / `A` | 左滑 |
| 切换跑道（创业） | `2` / `S` | — |
| 切换跑道（副业） | `3` / `D` | 右滑 |
| 跳跃 | `Space` / `↑` / `W` | 上滑 |
| 滑铲 | `↓` | 下滑 |
| 商店 | `B` | 点击按钮 |
| 暂停 | `P` / `Esc` | 双击 |

---

## 🎯 游戏机制

### 三条跑道，三种人生

| 跑道 | 体力消耗 | 收入 | 风险 |
|------|----------|------|------|
| 🏢 企业 Corporate | 低 | 稳定 | 低 |
| 🚀 创业 Startup | 中 | 波动 | 中 |
| 💼 副业 Hustle | 高 | 高 | 高 |

### 五维属性

**体力 · 社交 · 教育 · 财富 · 职业** — 每个角色有 S/A/B/C/D 五档评级，影响全局玩法。

### 斩杀线

四重斩杀线同时逼近：
- 💰 **经济线** — 净资产持续为负
- ❤️ **体力线** — 体力耗尽
- 🤝 **社交线** — 社会关系崩塌
- ⏰ **时间线** — 13年人生终点

### Combo 连击

完美闪避叠加 Combo 倍率（最高 ×2.0），连击越高收入加成越大。

---

## 🧑 角色

20 位可玩角色，分三个梯队：

| 梯队 | 数量 | 解锁条件 |
|------|------|----------|
| 新手 Beginner | 6 | 初始解锁 |
| 进阶 Advanced | 7 | World 1 通关 |
| 高手 Expert | 7 | World 3 通关 |

每局随机 3 选 1，Roguelike 风格。

---

## 🌍 关卡

| World | 名称 | 关卡数 | 主题 |
|-------|------|--------|------|
| 1 | First Steps · 初入社会 | 5 | 🏫 校园 → 职场 |
| 2 | The Hustle · 奋斗爬升 | 4 | 🏙 企业竞争 |
| 3 | Settling Down · 成家立业 | 5 | 🏡 家庭责任 |
| 4 | The System · 系统博弈 | 5 | 🏦 金融博弈 |
| 5 | The Cut Line · 斩杀线 | 5 | 🔴 终极挑战 |

+ 9 个趣味 Bonus 关卡

---

## 🛠️ 技术架构

```
the-cut-line/
├── index.html           # 主页面
├── css/style.css        # 712 行 PvZ 漫画风格样式
├── js/
│   ├── engine.js        # 3D 跑酷引擎（60fps 固定步长）
│   ├── game3d.js        # Three.js 场景管理
│   ├── player3d.js      # 低多边形角色 + 动画
│   ├── obstacles3d.js   # 6 种障碍物 + 碰撞检测
│   ├── collectibles3d.js # 5 种收集品
│   ├── cutline3d.js     # Shader 激光斩杀墙
│   ├── economy.js       # 经济系统（收入/支出/净资产）
│   ├── stamina.js       # 体力系统（消耗/恢复/资产加成）
│   ├── combo.js         # Combo 连击倍率系统
│   ├── events.js        # 32 个随机事件（5 世界差异化）
│   ├── settlement.js    # 500m 周期结算
│   ├── settlement-panel.js # 深度结算报告 + Canvas 图表
│   ├── shop.js          # 12 商品 5 分类商店
│   ├── audio.js         # Web Audio API 15 种程序化音效
│   ├── tutorial.js      # 6 步交互式教程
│   ├── characters.js    # 20 角色数据 + 5 维属性
│   ├── levels.js        # 24 关 + 9 Bonus 关
│   └── ...              # 共 30 个 JS 模块
├── assets/
│   ├── characters/      # 20 张 AI 角色卡牌（1024×1024）
│   ├── worlds/          # 5 张 AI 世界场景（1024×1024）
│   └── items/           # 11 张 AI 道具/障碍物图标
└── server/main.py       # FastAPI 后端存档 API（可选）
```

**技术栈：** Three.js 3D 引擎 · Canvas 2D 图表 · Web Audio API · PvZ 漫画美术风格

---

## 📝 设计文档

项目根目录下包含完整设计文档：
- `the-cut-line-final-design.md` — 最终设计决策书
- `the-cut-line-level-design-optimized.md` — 关卡优化方案
- `the-cut-line-ui-design.md` — UI 视觉规范
- `the-cut-line-visual-upgrade-plan.md` — 视觉升级方案

---

## 📄 License

MIT — 自由使用、修改、分发。

---

> *"22岁 → 35岁，13年，4745天。每一天都是一次闪避，每一次选择都在改写结局。"*
>
> *"22 to 35, 13 years, 4745 days. Every day is a dodge, every choice rewrites the ending."*
