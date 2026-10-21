# 电学手记

四门电学课（**电工学 / 数字电路 / 模拟电子 / 嵌入式开发**）的学习站点：结论先行、公式可查、演示可拖，每节标注难度与耗时。

> 这不是教材的电子版。它解决三件事：**时间有限时先读什么**、**前置知识不用跳走**、**结论记不住时能自己拖出来验证**。

- 站点内容：57 节正文、50 处 DemoBox 交互演示（44 个仿真组件）、58 个图解框、公式速查表、知识依赖图谱、B 站网课推荐
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

`crawl` 从首页广度遍历，校验每个站内链接返回 200，并列出没被任何页面链接到的页面（`/404` 在白名单里，它本来就只给不存在的路径兜底）。零死链时退出码为 0；孤儿页只提示，不算失败。

### 部署说明

- **分支**：`.github/workflows/deploy.yml` 同时监听 `main` 与 `master` 推送，本地仓库当前在 `master`。
- **缓存头**：`docs/public/_headers` 声明静态托管语义——`/assets/*` 与字体文件 `max-age=31536000, immutable`，HTML `max-age=0, must-revalidate`（支持 Cloudflare Pages / Netlify 类平台；GitHub Pages 忽略该文件）。
- **GitHub Pages**：`docs/public/.nojekyll` 避免 Jekyll 处理下划线开头的资源文件。
- **CI 自检**：`ci.yml` 在构建后起本地服务跑 `crawl`，并断言 `index.html` 与 `assets/` 存在；`deploy.yml` 断言 `sitemap.xml` 存在（SITE_URL 推导失效会直接构建失败而不是静默上线无 sitemap 的站点）。

子路径部署自检：

```bash
SITE_URL=https://<用户名>.github.io/<仓库名>/ DOCS_BASE=/<仓库名>/ npm run build

# 本地模拟子路径（GitHub Pages 语义）
MSYS_NO_PATHCONV=1 node tools/serve.mjs docs/.vitepress/dist 4174 /<仓库名>/
node tools/crawl.mjs http://localhost:4174/<仓库名>/ docs/.vitepress/dist
```

> **Windows / Git Bash（MSYS2）坑**：`DOCS_BASE=/仓库名/` 与 `serve.mjs` 的 base 参数会被 MSYS 自动转换成 Windows 路径（构建出的资源会带上 `C:/Users/...` 前缀）。本地构建时在命令前加 `MSYS_NO_PATHCONV=1`；GitHub Actions（Linux）不受影响。


## 目录

```
docs/
├── .vitepress/
│   ├── config.mts              站点配置：导航、侧边栏、搜索、head、sitemap
│   ├── data/catalog.ts         扫描章节 → 生成侧边栏 / 路线图 / 状态表（单一数据源）
│   ├── data/catalog.data.ts    把目录交给 Vue 组件
│   └── theme/                  布局、组件、样式、KaTeX 插件、仿真
├── ee/         电工学（22 节 + 3 节数电速览）
├── digital/    数字电路（9 节）
├── analog/     模拟电子（10 节）
├── embedded/   嵌入式开发（13 节）
├── shared/     公式速查表
├── guide/      关于 / 怎么用 / 内容状态 / 全部页面 / 贡献指南
└── public/     logo、robots.txt、og.png、_headers、.nojekyll
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

**GitHub Pages**：推送到 `main` 或 `master` 后会跑 `.github/workflows/deploy.yml`，`DOCS_BASE` 与 `SITE_URL` 由工作流按仓库名自动推导（用户站点与项目页都适用），通常不需要改。
`SITE_URL` 只影响 sitemap 与 canonical；不设置就不输出这两样，避免写出错的绝对地址。

**Vercel**：导入仓库，Build Command `npm run build`，Output Directory `docs/.vitepress/dist`，环境变量同上（根站点不需要 `DOCS_BASE`）。

### PR 预览（artifact，不部署）

`.github/workflows/preview.yml` 在每次 `pull_request` 上跑：`npm ci` → `npm run lint` → `npx vitepress build docs --outDir dist` → 用 `tools/check-dist.mjs` 自检产物 → 上传 artifact。**不部署、不评论 PR**，所以不需要任何仓库密钥，fork 来的 PR 也能跑。

取用预览产物的两种方式：

1. **网页下载**：打开该 PR 的 Actions 运行 → 页面底部 `Artifacts` → 下载 `preview-sha`（zip，保留 14 天）→ 解压后在**解压目录的父级**起本地服务器查看：

   ```bash
   unzip preview-sha.zip -d preview
   node tools/serve.mjs ./preview 4174
   ```

   注意：直接双击 `index.html`（`file://`）会白屏，VitePress 产物的资源路径以 `/` 开头，必须经由 HTTP 提供。

2. **命令行下载**（需要已登录的 `gh`）：

   ```bash
   gh run download <run-id> -n preview-sha -D preview
   node tools/serve.mjs ./preview 4174
   ```

`check-dist.mjs` 检查的是「构建成功但产物不可用」的那类问题：`index.html` 缺失、`assets/` 缺失或没有 `.js`、`index.html` 引用了产物里不存在的资源。本地可以对着任意构建目录跑：`node tools/check-dist.mjs docs/.vitepress/dist`。

### serve.mjs 端口自动递增

`tools/serve.mjs <distDir> <port> [base]` 在端口被占用时**自动递增**（最多往后试 20 个），并以日志打印的端口为准——那是真实在监听的端口，不是命令行里写的那个：

```
[INFO] 端口 4174 被占用，已自动递增到 4175
serving F:\代码\学习\elec-wiki\docs\.vitepress\dist at http://localhost:4175/ (base=/)
```

所以可以放心同时开两个服务（例如一边 `serve` 旧产物、一边对比新构建）；`npm run crawl` 的默认地址是 `http://localhost:4174`，如果日志显示换成了 4175，记得给 crawl 传对地址。另有 `node tools/check-dist.mjs <distDir>` 校验产物完整性。


## 许可

代码 MIT，正文与图示 CC BY-NC-SA 4.0。内容基于秦曾煌《电工学》、康华光《电子技术基础》等教材整理，详见 `docs/guide/about.md`。
