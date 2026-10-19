---
title: 写作与贡献指南
description: 这个 Wiki 的内容约定：目录结构、页面骨架、可用组件、公式与例题规范、构建前检查。
---

# 写作与贡献指南

<Meta time="6 min" level="指南" note="按这套约定写，页面才会和别的章节长得一样" />

## 目录即结构

```
docs/
├── ee/            电工学      ee/index.md 是课程主页
├── digital/       数字电路
├── analog/        模拟电子
├── embedded/      嵌入式
├── shared/        工具页（公式速查表）
├── guide/         说明页（本页、关于、内容状态、全部页面）
└── .vitepress/
    ├── config.mts             站点配置（导航、搜索、构建）
    ├── data/catalog.ts        自动扫描章节、生成侧边栏与路线图
    └── theme/                 组件、样式、KaTeX 插件
```

**新增一节 = 在那个课程的目录里放一个 `.md`**。侧边栏、课程路线图、首页统计、内容状态表都会自动更新，不需要改 `config.mts`。

## 页面骨架

```markdown
---
title: 09 · RLC 串联与阻抗
description: 一句话说清本页讲什么（用于搜索结果与分享卡片）
---

# 09 · RLC 串联与阻抗

<Meta time="45 min" level="核心" note="阻抗三角形是本页的核心图像" />

## 结论先行
…

（推导 / 图解 / 演示）

## 例题

::: tip 例 1 · RC 充电电路的完整过程
**题干**：……

**解**

**第 1 步：求 $t = 0_-$ 的电路状态**

> **为什么这么想**
> 这里最容易犯的错是……
:::

## 工程实例
## 易错点
## 考点速记
## 下一步
```

要求：`title` 前缀带两位序号（路线图按它排序）；`level` 只用 **核心 / 了解 / 可跳过 / 指南 / 工具**；`time` 写成 `"45 min"` 由脚本解析。

## 可用组件

已全局注册，直接用（无需 import）：

| 组件 | 作用 |
| --- | --- |
| `<Meta time="" level="" note="" />` | 页头标签条 |
| `<Prereq id="thevenin" text="自定义文字" />` | 前置知识胶囊，点击开抽屉 |
| `<DemoBox title="" hint="">…</DemoBox>` | 交互演示容器（插槽里放仿真组件） |
| `<FigBox title="" kind="" note="">…</FigBox>` | 图解容器（SVG、波形） |
| `<WavePreset kind="rc" :p="3" />` | 预设波形图，kind 见下方清单 |
| `<Ctrl label="" v-model="x" :min="" :max="" unit="" :log="true" />` | 滑块 |
| `<Seg v-model="m" :options="[{value,label}]" />` | 分段按钮 |
| `<CourseRoadmap course="digital" />` | 自动生成的章节路线表 |
| `<StatusTable />` | 内容成熟度表（全部课程） |

仿真组件按课分组放在 `theme/components/sim/`，命名以 `Demo` 结尾的由 `theme/index.ts` 统一注册。

`<WavePreset kind="…">` 支持：`threephase` `threewire` `rc` `rl` `resonance` `magnetize` `damped` `logic` `source` `ladder` `loadline` `nodepot` `maxpower` `superpose` `sinesum` `phasorref` `reactance` `powertriangle` `pfcurve` `qfamily` `parares` `neutraldisp` `instp3` `twowatt` `traeff` `vadjust` `rotfield` `torslip` `startcurve` `dcmotor` `relaytime` `scancycle` `humanbody` `stepvolt` `rectify3` `loadreg`。

## 公式与排版

- 行内 `$…$`，块级 `$$…$$`，由站点自带的 KaTeX 插件渲染（复用顶层 `katex@0.16`，保证与 CSS 同版本）。
- **不要在 HTML 块里写公式**：`<div>` / `<span>` 开头的块级 HTML 内部不解析 Markdown，公式会原样显示。自定义框请用 VitePress 容器 `::: tip 标题`。
- **组件属性里禁止英文双引号**：Vue 会把它当属性结束符。强调请用「」或『』。
- 表格里尽量用短公式；长公式放块级。

## 例题规范

- 用 `::: tip 例 N · 标题` 容器，N 在页内连续编号；
- 先写「题干 → 解」，关键步骤后加一行 `> **为什么这么想**`；
- 数值必须自己算过一遍（可以用 `node -e` 验算），结果保留合理有效数字。

## 提交前检查

```bash
npm run lint    # 内容检查：引号、标签配对、$ / $$ 配对、表格列数、重复标题、空链接、未注册组件
npm run check   # lint + 构建到独立目录（含死链检查），CI 跑的就是这个
npm run build   # 完整构建到 docs/.vitepress/dist
```

死链检查已并入构建（`ignoreDeadLinks: false`），链接写错会直接让构建失败——这是有意的：wiki 的第一条底线是「点得到」。

## 新增一门课

1. 建 `docs/<slug>/index.md`，frontmatter 写 `title: 课程名 · 课程主页`、`description: …`；
2. 在 `docs/.vitepress/data/catalog.ts` 的 `COURSE_META` 里加一条（名称、短名、一句话定位）；
3. 在 `SECTION_LABELS` 里按目录规划分组（二级目录 → 分组标题）；
4. 在 `config.mts` 的 `sidebar` 里加 `'/<slug>/': courseSidebar('<slug>')`。

首页课程卡片、导航下拉、全部页面索引会自动带上新课。
