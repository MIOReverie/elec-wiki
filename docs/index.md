---
layout: home
description: 速通 Wiki 首页：电工学、数字电路、模拟电子与嵌入式开发四门课的入口，结论先行、公式可查、演示可拖，每节标注核心程度与预计耗时。

hero:
  name: 速通 Wiki
  text: 四门电学课
  tagline: 电工学、数字电路、模拟电子与嵌入式开发。结论先行、公式可查、演示可拖——每节标注「核心 / 了解 / 可跳过」与预计耗时，先读该读的那部分。
  image:
    src: /hero.svg
    alt: 速通 Wiki 概念图：结论先行的正文、参数可拖的演示卡与公式速查卡
  actions:
    - theme: brand
      text: 从电工学开始
      link: /ee/
    - theme: alt
      text: 第一次来？先看怎么用
      link: /guide/start
    - theme: alt
      text: 公式速查表
      link: /shared/cheatsheet

features:
  - icon:
      src: /feature-icons/bolt.svg
      width: 24
      height: 24
    title: 交互演示
    details: 相量旋转、RLC 阻抗三角形、三相中性点位移、RC/RL 暂态、电机 T-n 曲线、卡诺图、PWM 波形……参数拖动即时重算，结论自己验证。
  - icon:
      src: /feature-icons/bookmark.svg
      width: 24
      height: 24
    title: 概念就地展开
    details: 正文里的前置知识是胶囊按钮，点开右侧抽屉看卡片，读完按 Esc 回到原处，不打断阅读、不丢位置。
  - icon:
      src: /feature-icons/compass.svg
      width: 24
      height: 24
    title: 标注档位与耗时
    details: 每节都有「核心 / 了解 / 可跳过」和预计分钟数，并给出三条学习路径。时间有限时，按标注跳过是有依据的。
  - icon:
      src: /feature-icons/ruler.svg
      width: 24
      height: 24
    title: 公式有据可查
    details: 全部公式集中在速查表；依赖顺序画成图谱；内容成熟度由构建脚本扫描正文生成，不写漂亮话。
---

<HomeStats />

## 课程

<HomeCourses />

<HomeRecent />

## 这个 wiki 怎么用

::: tip 三条最常用的入口
- **系统学一遍**：从[电工学路线图](./ee/)进入，按 01 → 22 顺序读；每章前面有前置知识胶囊兜底。
- **只差考前突击**：直接翻[公式速查表](./shared/cheatsheet)和每章末尾的「易错点 / 考点速记」。
- **查某个概念**：点右上角搜索（或按 <kbd>Ctrl</kbd> + <kbd>K</kbd>），中文按 2-gram 分词，输「戴维南」「转差率」都能命中。
:::

## 这里有什么，没有什么

**有**：四门课的正文、可以自己拖的演示、前置知识卡片、公式速查、依赖图谱，以及一份由脚本生成的[内容状态表](./guide/status)——哪些章节能当教材读、哪些还只是提纲，写得很直白。

**没有**：不做教材替代，不覆盖全部考纲，不承诺每道题都有标准答案。正文是学习笔记，引用与勘误见[关于本站](./guide/about)。
