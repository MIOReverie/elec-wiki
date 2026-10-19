# 速通 Wiki

四门电学课（**电工学 / 数字电路 / 模拟电子 / 嵌入式开发**）的学习站点：结论先行、公式可查、演示可拖，每节标注难度与耗时。

> 这不是教材的电子版。它解决三件事：**时间有限时先读什么**、**前置知识不用跳走**、**结论记不住时能自己拖出来验证**。

- 站点内容：54 节正文、29 个可交互演示、公式速查表、知识依赖图谱
- 内容状态（字数 / 例题 / 成熟度）由构建脚本扫描正文生成，见站内「内容状态与成熟度」
- 纯静态：VitePress + Vue 3 + KaTeX，无后端、无追踪；图形与仿真全部手写 Canvas / SVG

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # 内容检查（引号 / 标签 / 公式 / 表格 / 组件名）
npm run build      # lint + 构建到 docs/.vitepress/dist
npm run preview    # 预览构建产物
npm run check      # CI 用：lint + 构建到独立目录，不覆盖 dist
```

Windows 下也可以双击 `start.bat`（自动找 node、缺依赖时自动安装、启动后打开浏览器），`stop.bat` 关闭本地服务。

### 上线前自检

```bash
npm run build
npm run serve      # 用「GitHub Pages 语义」托管构建产物：http://localhost:4174
npm run crawl      # 另开一个终端：爬全站，报死链与没有任何入口的孤儿页
```

`crawl` 从首页广度遍历，校验每个站内链接返回 200，并列出没被任何页面链接到的页面（当前只允许 `/404`）。子路径部署自检：

```bash
SITE_URL=https://<用户名>.github.io/<仓库名>/ DOCS_BASE=/<仓库名>/ npm run build
```


## 目录

```
docs/
├── .vitepress/
│   ├── config.mts              站点配置：导航、侧边栏、搜索、head、sitemap
│   ├── data/catalog.ts         扫描章节 → 生成侧边栏 / 路线图 / 状态表（单一数据源）
│   ├── data/catalog.data.ts    把目录交给 Vue 组件
│   └── theme/                  布局、组件、样式、KaTeX 插件、仿真
├── ee/         电工学（22 节 + 3 节数电速览）
├── digital/    数字电路（8 节）
├── analog/     模拟电子（9 节）
├── embedded/   嵌入式开发（12 节）
├── shared/     公式速查表
├── guide/      关于 / 怎么用 / 内容状态 / 全部页面 / 贡献指南
└── public/     logo、robots.txt、og.png
```

**新增章节不用改配置**：把 `.md` 放进课程目录，标题带两位序号（`09 · RLC 串联与阻抗`），构建时自动出现在侧边栏、课程路线图、全部页面与内容状态表里。

## 写作约定

详细版在站内 `docs/guide/contributing.md`。要点：

- 页面骨架：`结论先行 → 推导 / 图解 → 交互演示 → 例题 → 工程实例 → 易错点 → 考点速记`
- 例题用 `::: tip 例 N · 标题`，关键步骤后写 `> **为什么这么想**`
- **组件属性里禁止英文双引号**（Vue 会提前闭合属性），强调用「」
- 不要在 HTML 块里写公式（不解析 Markdown），用 VitePress 容器
- 提交前跑 `npm run lint`；死链检查已并入构建（`ignoreDeadLinks: false`），写错链接会直接构建失败

## 部署

静态产物在 `docs/.vitepress/dist`，丢到任何静态托管即可。

**GitHub Pages**：推送到 `main` 后会跑 `.github/workflows/deploy.yml`，`DOCS_BASE` 与 `SITE_URL` 由工作流按仓库名自动推导（用户站点与项目页都适用），通常不需要改。
`SITE_URL` 只影响 sitemap 与 canonical；不设置就不输出这两样，避免写出错的绝对地址。

**Vercel**：导入仓库，Build Command `npm run build`，Output Directory `docs/.vitepress/dist`，环境变量同上（根站点不需要 `DOCS_BASE`）。

## 许可

代码 MIT，正文与图示 CC BY-NC-SA 4.0。内容基于秦曾煌《电工学》、康华光《电子技术基础》等教材整理，详见 `docs/guide/about.md`。
