---
title: 05 · 行列式：面积缩放的因子
description: 给一台变换配一个数：面积被放大了几倍、有没有翻面、有没有压扁。顺带用它判可逆、解方程组。
---

# 05 · 行列式：面积缩放的因子

<Meta time="18 min" level="核心" note="最容易错的是把行列式当成「面积」——它其实是面积被放大的倍数，还带符号；交换两行之后忘了变号是第二大坑" />

屏幕上画一个单位正方形：四个角是 $(0,0)$、$(1,0)$、$(1,1)$、$(0,1)$，面积正好是 $1$。它的两条边就是 $\mathbf i$ 和 $\mathbf j$。

现在让第 2 章那台机器 $A=\begin{bmatrix}2&1\\0&3\end{bmatrix}$ 作用上去：$\mathbf i$ 被送到 $(2,0)$，$\mathbf j$ 被送到 $(1,3)$。正方形于是被拉成一个平行四边形，四个角是 $(0,0)$、$(2,0)$、$(3,3)$、$(1,3)$。

先猜它的面积。底边从 $(0,0)$ 到 $(2,0)$，长 $2$；另一条边从 $(0,0)$ 到 $(1,3)$，它把图形抬到高度 $3$。底乘高，$2\times3=6$。面积从 $1$ 变成 $6$，与四个角的坐标 $(0,0)$、$(2,0)$、$(3,3)$、$(1,3)$ 对得上。

这个 $6$ 就是下面一切的主角。

::: tip 读之前
矩阵的两列就是 $\mathbf i=(1,0)$、$\mathbf j=(0,1)$ 被送到的地方（[第 2 章](02-matrices.md)）。一句复习：$A$ 的第一列是 $A\mathbf i$，第二列是 $A\mathbf j$，整个图形由这两列张成。

零空间那件事（[第 4 章](04-subspaces.md)）也要带着：除了零向量还有别的东西落在零空间里，就说明这台机器把某个方向压没了。

记号：$\det A$ 和 $|A|$ 是同一个东西，都读作「$A$ 的行列式」，两种写法都用；$I$ 是单位矩阵；$A^T$ 是转置；$A^{-1}$ 是逆。
:::

## 一、量一量：面积被放大了几倍

那个「$1$ 变 $6$」的倍数，名字叫**行列式**，记作 $\det A$（也写作 $|A|$，指的是同一个数）。

二阶矩阵有一个一步就能算的公式：

$$
\det A=\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc=2\times3-1\times0=6
$$

读一遍：$a=2$、$b=1$ 是第一行的两个数，$c=0$、$d=3$ 是第二行的两个数；但更该按列读。第一列是 $(a,c)=(2,0)$，也就是 $A\mathbf i$；第二列是 $(b,d)=(1,3)$，也就是 $A\mathbf j$。于是 $ad$ 是「第一列的横坐标 × 第二列的纵坐标」，$bc$ 是「第一列的纵坐标 × 第二列的横坐标」，两者相减就是这两列张出的平行四边形的（带符号）面积。$2\times3-1\times0=6$，与数格子的结果一致。

为什么一个数就能管住所有图形？线性变换把每个小方格都按同一比例拉，任何图形都是小方格拼起来的，于是面积统一乘上 $|\det A|$。注意是绝对值，面积本身没有负的；带符号的 $\det A$ 额外记下了有没有翻面。正方形、三角形、圆，面积乘的都是同一个 $|\det A|$。

<FigBox title="单位正方形被拉成平行四边形：面积从 1 变成 det A = 6" kind="几何" note="左边是单位正方形（面积 1），右边是被 A 拉出来的平行四边形：底 2、高 3（两轴同为每单位 30 像素），面积 6。看完该看出 1 进去 6 出来，倍数就是 det A。">
<svg viewBox="0 0 660 250" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="110" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：单位正方形（面积 1）</text>
  <text x="330" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">操作：A</text>
  <text x="545" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果：平行四边形</text>
  <line x1="46" y1="176" x2="206" y2="176" stroke="var(--vp-c-text-3)"/>
  <line x1="80" y1="220" x2="80" y2="80" stroke="var(--vp-c-text-3)"/>
  <rect x="80" y="124" width="52" height="52" fill="#3b82f6" fill-opacity="0.13" stroke="#3b82f6" stroke-width="1.8"/>
  <line x1="80" y1="176" x2="132" y2="176" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M132 176 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="138" y="180" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">i</text>
  <line x1="80" y1="176" x2="80" y2="124" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M80 124 l-3 8 l6 0 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="86" y="118" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">j</text>
  <text x="106" y="150" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-1)" stroke="none">面积 1</text>
  <line x1="232" y1="176" x2="288" y2="176" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M288 176 l-8 -3.4 l0 6.8 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="260" y="146" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">i ↦ (2,0)</text>
  <text x="260" y="200" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">j ↦ (1,3)</text>
  <line x1="400" y1="186" x2="600" y2="186" stroke="var(--vp-c-text-3)"/>
  <line x1="420" y1="216" x2="420" y2="66" stroke="var(--vp-c-text-3)"/>
  <polygon points="420,186 480,186 510,96 450,96" fill="#3b82f6" fill-opacity="0.13" stroke="#3b82f6" stroke-width="1.8"/>
  <line x1="450" y1="96" x2="450" y2="186" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3"/>
  <text x="456" y="146" font-size="11" fill="var(--vp-c-text-2)" stroke="none">高 3</text>
  <text x="450" y="206" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">底 2</text>
  <text x="482" y="202" text-anchor="middle" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(2,0)</text>
  <text x="444" y="88" text-anchor="end" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(1,3)</text>
  <text x="518" y="92" font-size="11.5" fill="#3b82f6" stroke="none">面积 6</text>
</svg>
</FigBox>

## 二、符号说翻面，零说压扁

换一台机器看符号。$B=\begin{bmatrix}1&2\\3&4\end{bmatrix}$，它的两列是 $(1,3)$ 与 $(2,4)$，$\det B=1\times4-2\times3=-2$。

面积放大倍数取绝对值：$|{-2}|=2$。负号说的是另一件事：平面被翻了个面。判断方法看两列的前后顺序：变换前从 $\mathbf i$ 转到 $\mathbf j$ 是逆时针；变换后从 $(1,3)$ 转到 $(2,4)$ 变成顺时针，顺序反了，符号就负。

零则更严重。拿 $S=\begin{bmatrix}2&4\\1&2\end{bmatrix}$，两列 $(2,1)$ 与 $(4,2)$ 成倍数，$\det S=2\times2-4\times1=0$。这时平行四边形退化成一条线段，面积塌成 $0$。同一个矩阵还藏着一个非零箭头：$S(-2,1)=(0,0)$。所以下面三句话说的是同一件事：

- 两列成倍数，整个平面被拍到一条线上；
- 零空间里有非零箭头（第 4 章的说法）；
- 这台机器没有逆，拍扁了就做不回去。

<FigBox title="负号 = 翻面：两列的前后顺序反了" kind="几何" note="左边 i 到 j 是逆时针，右边 B 把 i 送到 (1,3)、j 送到 (2,4)，顺序变成顺时针（两轴同为每单位 24 像素，斜率 3 与 2 按原比例画）。看完该看出方向反了，det B 就是 −2，面积大小仍取 2。">
<svg viewBox="0 0 660 210" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="112" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：i 到 j 是逆时针</text>
  <text x="330" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">操作：B</text>
  <text x="545" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果：变成顺时针</text>
  <line x1="48" y1="150" x2="196" y2="150" stroke="var(--vp-c-text-3)"/>
  <line x1="76" y1="190" x2="76" y2="80" stroke="var(--vp-c-text-3)"/>
  <line x1="76" y1="150" x2="100" y2="150" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M100 150 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="106" y="154" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">i</text>
  <line x1="76" y1="150" x2="76" y2="126" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M76 126 l-3 8 l6 0 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="84" y="122" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">j</text>
  <path d="M100 146 A24 24 0 0 0 80 128" stroke-dasharray="4 3" stroke="var(--vp-c-text-3)"/>
  <text x="110" y="104" font-size="10.5" fill="var(--vp-c-text-2)" stroke="none">逆时针 → det&gt;0</text>
  <line x1="230" y1="150" x2="286" y2="150" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M286 150 l-8 -3.4 l0 6.8 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="258" y="132" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">det B = −2</text>
  <line x1="420" y1="180" x2="620" y2="180" stroke="var(--vp-c-text-3)"/>
  <line x1="440" y1="200" x2="440" y2="60" stroke="var(--vp-c-text-3)"/>
  <line x1="440" y1="180" x2="464" y2="108" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M464 108 l-1.6 -8.4 l-6.2 4.8 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="436" y="102" text-anchor="end" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">(1,3)</text>
  <line x1="440" y1="180" x2="488" y2="84" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M488 84 l-8.2 -1.6 l1.8 6.6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="492" y="80" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">(2,4)</text>
  <path d="M464 114 A24 24 0 0 1 486 92" stroke-dasharray="4 3" stroke="#ef4444"/>
  <text x="500" y="124" font-size="10.5" fill="#ef4444" stroke="none">顺时针：平面被翻面</text>
</svg>
</FigBox>

## 三、三条性质撑起全部计算

画图只能量二阶，而且量不出三阶。要把计算交出去，只需要三条性质，其余公式都由它们推出来。

第一条是起点：$\det I=1$。恒等变换什么都不动，面积倍数当然是 $1$。

第二条：交换两行或两列，符号变。二阶可以直接验，$\det\begin{bmatrix}1&2\\3&4\end{bmatrix}=-2$，交换两列得 $\det\begin{bmatrix}2&1\\4&3\end{bmatrix}=2\times3-1\times4=2$，正好差一个负号。

第三条：对每一行（每一列）是线性的。把某一行的每个数都乘 $k$，整个行列式乘 $k$；把某一行写成两组数之和，行列式就是两个行列式之和。

由这三条能推出两条日常用的规则。

一是两行（或两列）成倍数，行列式为 $0$。两行一样时交换一下，矩阵没变而符号反了，只好等于 $0$；成倍数时先把倍数提出来，回到「两行一样」。

二是把一行的 $k$ 倍加到另一行，行列式不变。第 4 章消元里那些 R2−2R1 的式子，每一步都在做这件事，拆开之后多出来的那个行列式两行成倍数、等于 $0$，所以白加。

有了这些，$ad-bc$ 就不必背了。把第一列写成 $a(1,0)+c(0,1)$、第二列写成 $b(1,0)+d(0,1)$，按「对每一列线性」拆成四项：

$$
\det A=ab\det[\mathbf e_1,\mathbf e_1]+ad\det[\mathbf e_1,\mathbf e_2]+cb\det[\mathbf e_2,\mathbf e_1]+cd\det[\mathbf e_2,\mathbf e_2]
$$

这里 $\det[\ \cdot\ ,\ \cdot\ ]$ 表示把这两列并排作列算出的行列式，$\mathbf e_1=(1,0)$、$\mathbf e_2=(0,1)$。两个有两列相同的项按「成倍数为零」得 $0$；$\det[\mathbf e_1,\mathbf e_2]=\det I=1$；交换一列变号，得 $\det[\mathbf e_2,\mathbf e_1]=-1$。四项收拾起来就是 $ad-bc$。

三角矩阵（上三角或下三角）可以直接乘对角线：$\begin{vmatrix}d_1&*&*\\0&d_2&*\\0&0&d_3\end{vmatrix}=d_1d_2d_3$。理由是沿第一列展开只有 $d_1$ 那一项活下来，剩下的又是一个三角行列式，一层层剥下去就剩对角线相乘。所以「化成三角、乘对角线」是手算最快的路，而化三角用的正是上面那条「倍加不变」。顺带一句：转置不改变这个数，$\det A^T=\det A$。

## 四、三阶：沿一行展开

三阶有 6 个乘积项，硬背容易漏；4 阶是 24 项，更背不动。手算靠的是「沿一行展开」，只要认出两个词。

余子式 $M_{ij}$：把第 $i$ 行、第 $j$ 列划掉，剩下那个二阶行列式。

**代数余子式** $C_{ij}$：给余子式配上符号，$C_{ij}=(-1)^{i+j}M_{ij}$。符号像棋盘一样交错，左上角是 $+$。

$$
\det A=a_{i1}C_{i1}+a_{i2}C_{i2}+a_{i3}C_{i3}
$$

读一遍：$a_{i1}$ 是第 $i$ 行第 1 列那个数，$C_{i1}$ 是它自己的代数余子式（划掉它所在行列，算二阶行列式，再乘符号）。整句读作「沿这一行，把每个数乘上它自己的代数余子式，再加起来」。沿任意一行、任意一列展开都得到同一个数，所以挑零最多的那一行或一列，能省掉一整项。

## 五、它还有一个用处：坐分母上

前面算出了 $\det A=6\ne0$，所以 $A\mathbf x=\mathbf b$ 有唯一解。对这样的方程组，**克拉默法则**直接给出 $x_i=\det A_i/\det A$：$A_i$ 是把 $A$ 的第 $i$ 列换成右端 $\mathbf b$、其他列不动的矩阵。

比如 $\mathbf b=(8,9)$，换第 1 列得 $\det A_1=15$，换第 2 列得 $\det A_2=18$，所以 $x_1=15/6=2.5$、$x_2=18/6=3$。回代 $A(2.5,3)=(8,9)$ 成立。若 $\det A=0$，分母为零，这套公式就不能用了。

## 例题

::: tip 例 1 · 两法算同一个数，再验符号
题目：$A=\begin{bmatrix}2&1\\0&3\end{bmatrix}$，求 $\det A$ 并说出它的几何含义；再把两列交换，看符号怎么变。

先猜：单位正方形面积是 $1$，$A$ 把底边拉到 $2$、把另一条边抬到高度 $3$，面积大概 $6$；两列顺序没动过，符号应该是正的。

再算：$\det A=2\times3-1\times0=6$。几何上：平行四边形四个角是 $(0,0)$、$(2,0)$、$(3,3)$、$(1,3)$，底 $2$ 乘高 $3$ 得 $6$，与公式同一个数。*（为什么两个数必须相等：这个变换把每个小方格都放大 $6$ 倍，正方形面积 $1$ 当然变成 $6$。）*

再回代：交换两列得 $\begin{bmatrix}1&2\\3&0\end{bmatrix}$，$\det=1\times0-2\times3=-6$，正好是原来的相反数，与「交换两列变号」对上；负号也说明这一版把平面翻了个面。
:::

::: tip 例 2 · 三阶沿第一行展开
题目：$M=\begin{bmatrix}3&0&0\\1&2&5\\4&1&3\end{bmatrix}$，求 $\det M$。

先猜：第一行有两个 $0$，沿它展开只剩一项，答案应该是 $3$ 乘上某个二阶行列式，量级在 $10$ 以内；而二阶行列式的两个数都不大，所以猜个位数。

再算：沿第一行展开，符号依次是 $+,-,+$：

$$
\det M=3\begin{vmatrix}2&5\\1&3\end{vmatrix}-0\begin{vmatrix}1&5\\4&3\end{vmatrix}+0\begin{vmatrix}1&2\\4&1\end{vmatrix}=3\times(6-5)-0+0=3
$$

<FigBox title="例 2 的符号棋盘：沿第一行展开只活下来一项" kind="结构" note="左边是 M 的三行三列，第一行有两个 0；中间是 + − + / − + − / + − + 的符号棋盘。看完该看出沿第一行只剩一项：3 × (2×3 − 5×1) = 3 × 1 = 3。">
<svg viewBox="0 0 660 210" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="118" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：M</text>
  <rect x="56" y="44" width="126" height="34" fill="#3b82f6" fill-opacity="0.12" stroke="none"/>
  <path d="M62 40 L52 40 L52 170 L62 170" stroke="var(--vp-c-text-3)"/>
  <path d="M176 40 L186 40 L186 170 L176 170" stroke="var(--vp-c-text-3)"/>
  <text x="82" y="68" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">3</text>
  <text x="118" y="68" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="154" y="68" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="82" y="108" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="118" y="108" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="154" y="108" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">5</text>
  <text x="82" y="148" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">4</text>
  <text x="118" y="148" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="154" y="148" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">3</text>
  <line x1="204" y1="106" x2="268" y2="106" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
  <path d="M268 106 l-9 -3.2 l0 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="236" y="90" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">沿第一行展开</text>
  <text x="236" y="130" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">乘符号棋盘</text>
  <path d="M300 40 L290 40 L290 170 L300 170" stroke="var(--vp-c-text-3)"/>
  <path d="M414 40 L424 40 L424 170 L414 170" stroke="var(--vp-c-text-3)"/>
  <text x="330" y="68" text-anchor="middle" font-size="14" fill="#16a34a" stroke="none">+</text>
  <text x="366" y="68" text-anchor="middle" font-size="14" fill="#ef4444" stroke="none">−</text>
  <text x="402" y="68" text-anchor="middle" font-size="14" fill="#16a34a" stroke="none">+</text>
  <text x="330" y="108" text-anchor="middle" font-size="14" fill="#ef4444" stroke="none">−</text>
  <text x="366" y="108" text-anchor="middle" font-size="14" fill="#16a34a" stroke="none">+</text>
  <text x="402" y="108" text-anchor="middle" font-size="14" fill="#ef4444" stroke="none">−</text>
  <text x="330" y="148" text-anchor="middle" font-size="14" fill="#16a34a" stroke="none">+</text>
  <text x="366" y="148" text-anchor="middle" font-size="14" fill="#ef4444" stroke="none">−</text>
  <text x="402" y="148" text-anchor="middle" font-size="14" fill="#16a34a" stroke="none">+</text>
  <text x="514" y="72" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">det M = 3 × (2×3 − 5×1)</text>
  <text x="514" y="96" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">= 3 × 1 = 3</text>
  <text x="514" y="126" font-size="11" fill="var(--vp-c-text-2)" stroke="none">另外两项的系数都是 0</text>
</svg>
</FigBox>

再回代：换沿第二行展开再算一遍：$-1\times\begin{vmatrix}0&0\\1&3\end{vmatrix}+2\times\begin{vmatrix}3&0\\4&3\end{vmatrix}-5\times\begin{vmatrix}3&0\\4&1\end{vmatrix}=0+18-15=3$，符号 $-+-$ 用对了，两条路线同一个答案 ✓。
:::

::: tip 例 3 · 先用性质化简成三角
题目：$N=\begin{bmatrix}1&2&1\\2&5&2\\1&2&3\end{bmatrix}$，求 $\det N$。

先猜：元素都在 $1$ 到 $5$ 之间，第二行几乎就是第一行的两倍，行列式应该是个不大的整数；先把第一列下方清成 $0$，最后乘对角线就完事。

再算：$R_2-2R_1$ 得 $(0,1,0)$，$R_3-R_1$ 得 $(0,0,2)$。两次都是「一行的倍数加到另一行」，行列式不变，也没有交换过行，所以符号是正的。矩阵化成上三角后：

$$
\det N=1\times1\times2=2
$$

<FigBox title="例 3 的两步倍加：化成上三角后只剩对角线" kind="结构" note="左边是 N 的三行（1、2、1 / 2、5、2 / 1、2、3），中间 R₂−2R₁、R₃−R₁ 两步都是倍加，没有交换行。看完该看出右边已是上三角，对角线 1、1、2，乘起来是 2。">
<svg viewBox="0 0 660 200" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="106" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：N</text>
  <path d="M52 40 L42 40 L42 164 L52 164" stroke="var(--vp-c-text-3)"/>
  <path d="M162 40 L172 40 L172 164 L162 164" stroke="var(--vp-c-text-3)"/>
  <text x="72" y="72" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="107" y="72" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="142" y="72" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="72" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="107" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">5</text>
  <text x="142" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="72" y="152" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="107" y="152" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="142" y="152" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">3</text>
  <line x1="190" y1="102" x2="252" y2="102" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
  <path d="M252 102 l-9 -3.2 l0 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="222" y="82" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">R₂−2R₁</text>
  <text x="222" y="126" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">R₃−R₁</text>
  <text x="386" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果：上三角</text>
  <path d="M320 40 L310 40 L310 164 L320 164" stroke="var(--vp-c-text-3)"/>
  <path d="M430 40 L440 40 L440 164 L430 164" stroke="var(--vp-c-text-3)"/>
  <text x="340" y="72" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="375" y="72" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="410" y="72" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="340" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="375" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="410" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="340" y="152" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="375" y="152" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="410" y="152" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <circle cx="340" cy="68" r="12" stroke="#3b82f6" stroke-width="1.6"/>
  <circle cx="375" cy="108" r="12" stroke="#3b82f6" stroke-width="1.6"/>
  <circle cx="410" cy="148" r="12" stroke="#3b82f6" stroke-width="1.6"/>
  <text x="520" y="82" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">det N = 1 × 1 × 2</text>
  <text x="520" y="106" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">= 2</text>
  <text x="520" y="136" font-size="11" fill="var(--vp-c-text-2)" stroke="none">没有交换行，所以不用变号</text>
</svg>
</FigBox>

再回代：直接展开核对：$1\times(5\times3-2\times2)-2\times(2\times3-2\times1)+1\times(2\times2-5\times1)=11-8-1=2$ ✓。三角化与硬展开同一个答案，而三角化只做了两步加法。
:::

## 三个说法是同一件事

$\det A=0$、有非零箭头被送成零、这台机器没有逆，三句话说的是一回事；再往下走一步：$A\mathbf x=\mathbf b$ 有没有解，还要另外看右端对不对得上，别拿 $\det A=0$ 直接当「没解」。

面积（三维是体积）被放大的倍数才是 $\det$ 的正身，负号只负责报「翻面」。三条性质（$\det I=1$、交换两行变号、对每行线性）撑起全部计算，$ad-bc$ 也是从它们推出来的。判定与计算分开想：看 $\det A$ 是不是 $0$ 就知道压没压扁，面积大小乘的是 $|\det A|$，算数值则用倍加化三角。

::: warning 两处最容易翻车
- 把 $|A|$ 当成绝对值。它只是行列式的另一种记号，可以是负数；面积大小才是 $|\det A|$。
- 交换两行后忘了变号。每交换一次乘一个 $-1$，最后回代时先数交换次数再定符号。
:::

下一站是[第 6 章 · 特征值](06-eigenvalues.md)：那里要问「哪些箭头被变换之后方向没变」，判据正是 $\det(A-\lambda I)=0$，这一页的 $\det$ 会直接上岗。想按教材把三阶展开、克拉默练成手速，去经典版第 1 章。
