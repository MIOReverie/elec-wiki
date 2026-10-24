---
title: 02 · 矩阵与线性变换
description: 矩阵就是线性变换：把整张网格拉伸、旋转、剪切。这一页用基向量 i、j 的去向读懂矩阵乘向量、矩阵乘法、逆矩阵与转置。
---

# 02 · 矩阵与线性变换

<Meta time="26 min" level="核心" note="矩阵 = 线性变换：看基向量 i、j 被挪到哪，就懂了矩阵乘法、逆矩阵与转置" />

**这一页要解决什么**：你以前可能把矩阵当成「一堆数排成表格」，背过乘法口诀却不知道它到底在干什么。这一页换一个视角：**矩阵是一台机器，把整个平面均匀地掰变形**。读完这一页，你能回答三件事——矩阵里那两列数字到底藏了什么几何信息；矩阵乘矩阵为什么顺序不能乱；以及「逆」和「转置」分别对应几何上的什么动作。

::: tip 读这页之前
- **需要会**：本系列上一章「向量、张成与线性组合」里讲的——向量是平面上的箭头，坐标是它沿基向量走的步数；把向量看成 $c_1\mathbf i + c_2\mathbf j$ 这种线性组合。如果这两点忘了，先回去补那一章，再回来看矩阵。
- **符号约定**：[符号与约定](../guide/notation.md) 里明确过：向量用小写粗体 $\mathbf v$、矩阵用大写 $A$、单位阵 $I$、转置 $A^T$、逆 $A^{-1}$。本页沿用，另外新增两个基向量记号：$\mathbf i = (1,0)$ 与 $\mathbf j = (0,1)$，它们就是坐标轴的「最小单位」。
- **需要的数学**：平面直角坐标、把 $(x,y)$ 画成点或箭头，高中数学就够。
:::

**场景引入**：想象桌上铺了一张方格纸，每个格子上画着横平竖直的线。现在你捏住这张纸的四个角，可以**旋转**它、**拉伸**它、也可以**斜着推**它——但有三条铁律：纸上的原点（那个钉子）永远不动；原来直的线还是直的；原来平行的网格线，变形后仍然平行、间距仍然均匀。这张纸发生的一切形变，就是「线性变换」；而**矩阵，就是给这台变形机器拍的一张说明书**。

## 结论先行

1. **矩阵 = 线性变换**：把整张网格做一次「原点不动、直线仍直、网格线仍平行等距」的形变，旋转、拉伸、剪切都是它的例子。
2. **矩阵的每一列，就是基向量 $\mathbf i,\mathbf j$ 变形后的新位置**——所以读矩阵就是读「$\mathbf i$ 去了哪、$\mathbf j$ 去了哪」。
3. **矩阵乘向量** $A\mathbf x$：把 $\mathbf x$ 看成 $\mathbf i,\mathbf j$ 的线性组合，再按它们的新位置重新组合，得到的箭头就是结果。
4. **矩阵乘法** $AB$ = 复合变换「先做 $B$、再做 $A$」，顺序不能换。
5. **逆矩阵** $A^{-1}$ 把变换原样还原；**转置** $A^T$ 沿主对角线翻个面（旋转矩阵里 $A^T = A^{-1}$）。

## 一、先记住一句话：矩阵就是线性变换

这一节的目标，是把「矩阵」从一张数字表，重新装进你的几何直觉里——记住一句口诀：**矩阵 = 线性变换**。

**线性变换**（首次出现，先给图景）是一种特殊的「空间形变」：它把平面上的每一个箭头，按同一条规则搬到一个新位置，并且满足两条硬约束——**原点必须原地不动**；**直线变完还是直线**。直线仍直这个要求其实很苛刻：它意味着变形后的网格，每条线依然平行、格与格依然等距，不可能出现「某一块被捏皱、某一块被抻成曲线」的情况。旋转、缩放、剪切、以及它们的组合，都是线性变换；而把平面「平移」一格则不是——比如把整张纸向右推一格，原点从 O 被挪走，就违反了「原点不动」这条铁律。

那么怎么**记录**一次线性变换？由于「直线仍直 + 原点不动」，只要知道两条坐标轴上的单位向量去了哪，整个变换就被唯一决定了。我们把 $\mathbf i = (1,0)$ 和 $\mathbf j = (0,1)$ 变形后的新位置分别记为两列，写进一个方括号里：

$$
A = \begin{bmatrix} 2 & -1 \\ 1 & 2 \end{bmatrix}
$$

读法：**第一列 $\begin{bmatrix}2\\1\end{bmatrix}$ 是 $\mathbf i$ 的新家，第二列 $\begin{bmatrix}-1\\2\end{bmatrix}$ 是 $\mathbf j$ 的新家**。这就是「矩阵的列是基向量的像」——「像」就是「映射之后落在的位置」。矩阵里没有任何多余信息，两列数字就是两张「搬家地址」。

**单位矩阵**（首次出现）$I = \begin{bmatrix}1&0\\0&1\end{bmatrix}$ 是那个「什么都不做」的变换：第一列说明 $\mathbf i$ 留在 $(1,0)$，第二列说明 $\mathbf j$ 留在 $(0,1)$。它是线性变换里的「0 号动作」，后面讲逆矩阵时它就是「回到原点」的终点。

下面这张图是本页最重要的一张：左边是变换前的标准网格，右边是矩阵 $A = \begin{bmatrix}2&-1\\1&2\end{bmatrix}$ 作用后的网格。请你盯着它看三件事：**网格线仍然平行等距**、**原点 O 纹丝不动**、**基向量 $\mathbf i,\mathbf j$ 分别被搬到了 $(2,1)$ 和 $(-1,2)$**。

<FigBox title="变换前的网格 vs 变换后的网格" kind="结构" note="A 把 i=(1,0) 送到 (2,1)、把 j=(0,1) 送到 (−1,2)：整张网格被「放大 √5 倍并旋转」，但线仍直、格仍平行、原点不动。">
<svg viewBox="0 0 680 240" role="img" aria-label="线性变换对比图：左侧标准网格，右侧矩阵 A=[2,-1;1,2] 作用后的旋转放大网格，标出基向量 i、j 的新位置">
  <defs>
    <marker id="t2-i" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-brand-1)"/></marker>
    <marker id="t2-j" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-danger-1)"/></marker>
    <marker id="t2-g" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-text-3)"/></marker>
    <clipPath id="t2-rclip"><rect x="400" y="16" width="240" height="228"/></clipPath>
  </defs>

  <g stroke="var(--vp-c-divider)" stroke-width="1">
    <line x1="76" y1="46" x2="76" y2="214"/>
    <line x1="118" y1="46" x2="118" y2="214"/>
    <line x1="160" y1="46" x2="160" y2="214"/>
    <line x1="202" y1="46" x2="202" y2="214"/>
    <line x1="244" y1="46" x2="244" y2="214"/>
    <line x1="76" y1="46" x2="244" y2="46"/>
    <line x1="76" y1="88" x2="244" y2="88"/>
    <line x1="76" y1="130" x2="244" y2="130"/>
    <line x1="76" y1="172" x2="244" y2="172"/>
    <line x1="76" y1="214" x2="244" y2="214"/>
  </g>
  <g stroke="var(--vp-c-text-3)" stroke-width="1.3">
    <line x1="76" y1="130" x2="244" y2="130"/>
    <line x1="160" y1="46" x2="160" y2="214"/>
  </g>
  <line x1="160" y1="130" x2="202" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="2.5" marker-end="url(#t2-i)"/>
  <line x1="160" y1="130" x2="160" y2="88" stroke="var(--vp-c-danger-1)" stroke-width="2.5" marker-end="url(#t2-j)"/>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="206" y="124" fill="var(--vp-c-brand-1)">i</text>
    <text x="150" y="82" fill="var(--vp-c-danger-1)">j</text>
    <text x="150" y="144" fill="var(--vp-c-text-3)">O</text>
    <text x="160" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">变换前</text>
    <text x="238" y="146" text-anchor="middle" fill="var(--vp-c-text-3)">x</text>
    <text x="168" y="50" text-anchor="middle" fill="var(--vp-c-text-3)">y</text>
  </g>

  <line x1="292" y1="130" x2="368" y2="130" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#t2-g)"/>
  <text x="330" y="120" text-anchor="middle" font-size="12" fill="var(--vp-c-text-1)">乘 A</text>

  <g clip-path="url(#t2-rclip)">
    <g transform="matrix(60 -30 -30 -60 520 130)" stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
      <line x1="-3" y1="-3" x2="-3" y2="3"/>
      <line x1="-2" y1="-3" x2="-2" y2="3"/>
      <line x1="-1" y1="-3" x2="-1" y2="3"/>
      <line x1="0" y1="-3" x2="0" y2="3"/>
      <line x1="1" y1="-3" x2="1" y2="3"/>
      <line x1="2" y1="-3" x2="2" y2="3"/>
      <line x1="3" y1="-3" x2="3" y2="3"/>
      <line x1="-3" y1="-3" x2="3" y2="-3"/>
      <line x1="-3" y1="-2" x2="3" y2="-2"/>
      <line x1="-3" y1="-1" x2="3" y2="-1"/>
      <line x1="-3" y1="0" x2="3" y2="0"/>
      <line x1="-3" y1="1" x2="3" y2="1"/>
      <line x1="-3" y1="2" x2="3" y2="2"/>
      <line x1="-3" y1="3" x2="3" y2="3"/>
    </g>
  </g>
  <g stroke="var(--vp-c-text-3)" stroke-width="1.3">
    <line x1="400" y1="190" x2="640" y2="70"/>
    <line x1="463" y1="16" x2="577" y2="244"/>
  </g>
  <line x1="520" y1="130" x2="580" y2="100" stroke="var(--vp-c-brand-1)" stroke-width="2.5" marker-end="url(#t2-i)"/>
  <line x1="520" y1="130" x2="490" y2="70" stroke="var(--vp-c-danger-1)" stroke-width="2.5" marker-end="url(#t2-j)"/>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="584" y="94" fill="var(--vp-c-brand-1)">i′ = (2, 1)</text>
    <text x="466" y="60" fill="var(--vp-c-danger-1)">j′ = (−1, 2)</text>
    <text x="510" y="144" fill="var(--vp-c-text-3)">O</text>
    <text x="520" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">变换后</text>
  </g>
</svg>
</FigBox>

看图能读出什么：$\mathbf i$ 和 $\mathbf j$ 原本互相垂直、等长；变换后 $\mathbf i'=(2,1)$ 与 $\mathbf j'=(-1,2)$ 仍然垂直、仍然等长（长度都是 $\sqrt5$），只是整体被放大约 2.24 倍并转了一个角度。这就是「旋转 + 均匀放大」型变换的几何指纹：**两列正交且等长**。下一节我们把视角从「整张网格」拉近到「单个箭头」，看矩阵怎么搬动一个具体的向量。

## 二、矩阵乘向量：把箭头搬到新位置

这一节的目标，是掌握 $A\mathbf x$ 的两种等价算法——逐行点积和「列的线性组合」——并确认后者才是几何本质。

先给结论：矩阵乘向量，就是**把 $\mathbf x$ 的坐标重新读一遍**。既然 $\mathbf x = (x_1, x_2)$ 本意是「沿 $\mathbf i$ 走 $x_1$ 步、沿 $\mathbf j$ 走 $x_2$ 步」，那么变换后的位置就该是「沿新的 $\mathbf i'$ 走 $x_1$ 步、沿新的 $\mathbf j'$ 走 $x_2$ 步」：

$$
A\mathbf x = x_1\begin{bmatrix}a\\c\end{bmatrix} + x_2\begin{bmatrix}b\\d\end{bmatrix}
$$

这就是「列的线性组合」视角：$A\mathbf x$ 永远是 $A$ 的两列按 $x_1,x_2$ 加权相加。它和你在课本里背的「行乘列、逐项求和」算出来完全一样，只是前者把「为什么」讲了出来。

::: tip 例 1 · 一个箭头被掰到哪去了
**先想什么**：先不套公式，先问「$\mathbf i$ 和 $\mathbf j$ 会被送到哪」。给定 $A = \begin{bmatrix}2&1\\0&3\end{bmatrix}$，读列：$\mathbf i\to(2,0)$，$\mathbf j\to(1,3)$。再算 $\mathbf x=(1,1)$ 去哪。

<FigBox title="向量 (1,1) 被 A=[2,1;0,3] 送到 (3,3)" kind="结构" note="左：输入 x=(1,1)；右：基向量被拉到 i′=(2,0)、j′=(1,3)，于是 x=1·i+1·j 被送到 1·(2,0)+1·(1,3)=(3,3)。">
<svg viewBox="0 0 460 200" role="img" aria-label="矩阵乘向量示意：左侧输入向量 (1,1)，右侧输出向量 (3,3)，并标出变换后的基向量 i′=(2,0)、j′=(1,3)">
  <defs>
    <marker id="e1-i" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-brand-1)"/></marker>
    <marker id="e1-j" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-danger-1)"/></marker>
    <marker id="e1-g" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-text-3)"/></marker>
  </defs>
  <g stroke="var(--vp-c-text-3)" stroke-width="1.2">
    <line x1="10" y1="110" x2="190" y2="110"/>
    <line x1="100" y1="20" x2="100" y2="200"/>
    <line x1="250" y1="110" x2="410" y2="110"/>
    <line x1="330" y1="20" x2="330" y2="200"/>
  </g>
  <line x1="100" y1="110" x2="140" y2="70" stroke="var(--vp-c-text-3)" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#e1-g)"/>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="144" y="62" fill="var(--vp-c-text-2)">x=(1,1)</text>
    <text x="92" y="40" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">输入</text>
  </g>
  <line x1="205" y1="110" x2="240" y2="110" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#e1-g)"/>
  <text x="222" y="100" text-anchor="middle" font-size="12" fill="var(--vp-c-text-1)">乘 A</text>
  <line x1="330" y1="110" x2="378" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#e1-i)"/>
  <line x1="330" y1="110" x2="354" y2="38" stroke="var(--vp-c-danger-1)" stroke-width="1.6" marker-end="url(#e1-j)"/>
  <line x1="330" y1="110" x2="402" y2="38" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#e1-i)"/>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="382" y="122" fill="var(--vp-c-brand-1)">i′=(2,0)</text>
    <text x="356" y="32" fill="var(--vp-c-danger-1)">j′=(1,3)</text>
    <text x="404" y="32" fill="var(--vp-c-brand-1)">Ax=(3,3)</text>
    <text x="322" y="40" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">输出</text>
  </g>
</svg>
</FigBox>

**为什么**：把 $\mathbf x=(1,1)$ 写开就是 $\mathbf x = 1\cdot\mathbf i + 1\cdot\mathbf j$。变换后按新基向量重新组合：

$$A\begin{bmatrix}1\\1\end{bmatrix} = 1\cdot\begin{bmatrix}2\\0\end{bmatrix} + 1\cdot\begin{bmatrix}1\\3\end{bmatrix} = \begin{bmatrix}2+1\\0+3\end{bmatrix} = \begin{bmatrix}3\\3\end{bmatrix}$$

**验算**（逐行点积，两者必须一致）：第一行 $2\times1 + 1\times1 = 3$，第二行 $0\times1 + 3\times1 = 3$，结果 $(3,3)$。用 node 手写矩阵乘向量的小函数核对：`A=[2,1;0,3]`、`x=[1,1]`，输出 `[3,3]`，与手算一致。
:::

两种算法殊途同归：逐行点积适合「算」，列的线性组合适合「懂」。以后每次算 $A\mathbf x$，心里都可以默念一句「$\mathbf x$ 就是让两列按这个比例拌在一起」。有了这个视角，下一节「矩阵乘矩阵」就不再是新的咒语，而是同一个动作连做两次。

## 三、矩阵乘法 = 复合变换：先做 B 再做 A

这一节的目标，是把矩阵乘法 $AB$ 从「一行对一列的死记硬背」换成「两台机器先后启动」。

**矩阵乘法**（首次出现，先给图景）：$AB$ 表示**先做 $B$、再做 $A$**。写 $AB$ 时，右边那个 $B$ 先动手——这跟函数复合 $f(g(x))$ 一样，最里层的先算。为什么这么排？因为 $A\mathbf x$ 是「把 $\mathbf x$ 送到新位置」，$AB$ 作用于 $\mathbf x$ 时，最靠近 $\mathbf x$ 的是 $B$，所以 $(AB)\mathbf x = A(B\mathbf x)$。

几何上有个漂亮的验法：**$AB$ 的列，就是 $B$ 的两列分别再被 $A$ 送一次**。因为 $B$ 的列是 $\mathbf i,\mathbf j$ 被 $B$ 送到的位置，再让 $A$ 作用一下，就得到复合变换后的 $\mathbf i',\mathbf j'$。

**顺序不能换**，这是本节最容易翻车的一点：$AB \ne BA$。几何原因很直白——先旋转再剪切，和先剪切再旋转，纸上的网格落点不同。

顺手把课本里背过的那条口诀也接上：$(AB)_{ij}$ 等于「$A$ 的第 $i$ 行」与「$B$ 的第 $j$ 列」逐项相乘再相加。它不是新规定——因为 $AB$ 的第 $j$ 列，就是 $A$ 对 $B$ 第 $j$ 列这个向量做的变换，这个向量的第 $i$ 个分量，恰好等于 $A$ 第 $i$ 行与 $B$ 第 $j$ 列的点积。所以「行乘列」只是把复合变换每一列的坐标，一行一行写出来而已。

::: tip 例 2 · 先旋转再剪切 ≠ 先剪切再旋转
**先想什么**：取两个最简单的变换——旋转 $B = \begin{bmatrix}0&-1\\1&0\end{bmatrix}$（逆时针转 90°）和剪切 $A = \begin{bmatrix}1&1\\0&1\end{bmatrix}$（把 $\mathbf j$ 向右推成 $(1,1)$）。算两种复合，并各追踪一个箭头 $\mathbf v=(1,0)$。

<FigBox title="复合变换：先 B（转90°）再 A（剪切），v=(1,0) 落到 (1,1)" kind="结构" note="v 先被 B 旋转成 (0,1)，再被 A 剪切成 (1,1)。若顺序反过来（先 A 后 B），v 会落到 (0,1)，结果不同——顺序决定落点。">
<svg viewBox="0 0 480 190" role="img" aria-label="复合变换示意：向量 (1,0) 先被旋转90度得到 (0,1)，再被剪切得到 (1,1)">
  <defs>
    <marker id="e2-i" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-brand-1)"/></marker>
    <marker id="e2-g" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-text-3)"/></marker>
  </defs>
  <g stroke="var(--vp-c-text-3)" stroke-width="1.2">
    <line x1="30" y1="105" x2="130" y2="105"/>
    <line x1="80" y1="40" x2="80" y2="170"/>
    <line x1="190" y1="105" x2="290" y2="105"/>
    <line x1="240" y1="40" x2="240" y2="170"/>
    <line x1="350" y1="105" x2="450" y2="105"/>
    <line x1="400" y1="40" x2="400" y2="170"/>
  </g>
  <line x1="80" y1="105" x2="118" y2="105" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#e2-i)"/>
  <line x1="240" y1="105" x2="240" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#e2-i)"/>
  <line x1="400" y1="105" x2="438" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#e2-i)"/>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="110" y="98" fill="var(--vp-c-brand-1)">v=(1,0)</text>
    <text x="222" y="60" fill="var(--vp-c-brand-1)">Bv=(0,1)</text>
    <text x="404" y="60" fill="var(--vp-c-brand-1)">A(Bv)=(1,1)</text>
    <text x="80" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">出发</text>
    <text x="240" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">先 B</text>
    <text x="400" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">再 A</text>
  </g>
  <line x1="138" y1="105" x2="182" y2="105" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#e2-g)"/>
  <line x1="298" y1="105" x2="342" y2="105" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#e2-g)"/>
</svg>
</FigBox>

**为什么**：按定义逐个算。

$$AB = \begin{bmatrix}1&1\\0&1\end{bmatrix}\begin{bmatrix}0&-1\\1&0\end{bmatrix} = \begin{bmatrix}1&-1\\1&0\end{bmatrix}$$

第一列：$A$ 作用于 $B$ 的第一列 $(0,1)$，得到 $(1,1)$；第二列：$A$ 作用于 $B$ 的第二列 $(-1,0)$，得到 $(-1,0)$。所以 $AB$ 把 $\mathbf v=(1,0)$ 送到 $(1,1)$。再看反过来的顺序：

$$BA = \begin{bmatrix}0&-1\\1&0\end{bmatrix}\begin{bmatrix}1&1\\0&1\end{bmatrix} = \begin{bmatrix}0&-1\\1&1\end{bmatrix}$$

$BA$ 作用于同一个 $\mathbf v$：$A\mathbf v$ 先把 $(1,0)$ 留在原地（剪切不动 $\mathbf i$），再被 $B$ 转 90°，落到 $(0,1)$。

**验算**（node）：`A=[1,1;0,1]`、`B=[0,-1;1,0]`，算 `AB=[1,-1;1,0]`、`BA=[0,-1;1,1]`；再各乘 `v=[1,0]`，得 `(AB)v=[1,1]`、`(BA)v=[0,1]`，两两不等，与上图一致。
:::

一句话收口：**矩阵乘法不交换，但满足结合律** $(AB)C = A(BC)$——因为「先后三台机器」无论怎么加括号，都是同一个先后顺序。这个结论下一节直接用得上：求逆时我们要找「能把 $A$ 抵消掉」的那台机器。

## 四、逆矩阵：把变换还原回去

这一节的目标，是理解 $A^{-1}$ 的几何意义——它是一台「倒带机」——并学会对 2×2 矩阵求逆与验算。

**逆矩阵**（首次出现，先给图景）：如果 $A$ 是一次没有压扁信息的变形（没有把某个方向完全压没），就存在一台反向机器 $A^{-1}$，让「先 $A$ 再 $A^{-1}$」等于什么都没做。写成式子：

$$A^{-1}A = AA^{-1} = I$$

右边那个 $I$ 就是上一节的**单位阵**（什么都不做的变换）。几何上，$A^{-1}$ 把 $A$ 掰过的每根线、每个箭头，原样掰回原位。

什么时候没有逆？当 $A$ 把平面**压扁**到一条直线甚至一个点时（比如两列共线），信息丢了，再也还原不回来——这对应 $ad-bc = 0$（这个量叫**行列式**，下一章会正式登场）。只要 $ad-bc \ne 0$，2×2 矩阵的逆就是：

$$A^{-1} = \frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$$

::: tip 例 3 · 给剪切找一台倒带机
**先想什么**：剪切 $A = \begin{bmatrix}1&1\\0&1\end{bmatrix}$ 把 $\mathbf j$ 向右推成 $(1,1)$。要还原，就得再向左推回来——直觉上逆应该还是剪切，只是方向相反：$A^{-1} = \begin{bmatrix}1&-1\\0&1\end{bmatrix}$。用公式验证。

<FigBox title="剪切 A 把 (0,1) 送到 (1,1)，逆变换 A⁻¹ 再把它送回 (0,1)" kind="结构" note="v=(0,1) 被 A 向右剪切成 (1,1)，再被 A⁻¹ 向左剪回 (0,1)：来回一趟回到原样，A⁻¹A=I。">
<svg viewBox="0 0 480 190" role="img" aria-label="逆变换示意：向量 (0,1) 先被剪切到 (1,1)，再被逆剪切送回 (0,1)">
  <defs>
    <marker id="e3-i" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-brand-1)"/></marker>
    <marker id="e3-g" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--vp-c-text-3)"/></marker>
  </defs>
  <g stroke="var(--vp-c-text-3)" stroke-width="1.2">
    <line x1="30" y1="105" x2="130" y2="105"/>
    <line x1="80" y1="40" x2="80" y2="170"/>
    <line x1="190" y1="105" x2="290" y2="105"/>
    <line x1="240" y1="40" x2="240" y2="170"/>
    <line x1="350" y1="105" x2="450" y2="105"/>
    <line x1="400" y1="40" x2="400" y2="170"/>
  </g>
  <line x1="80" y1="105" x2="80" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#e3-i)"/>
  <line x1="240" y1="105" x2="278" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#e3-i)"/>
  <line x1="400" y1="105" x2="400" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#e3-i)"/>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="62" y="60" fill="var(--vp-c-brand-1)">v=(0,1)</text>
    <text x="244" y="60" fill="var(--vp-c-brand-1)">Av=(1,1)</text>
    <text x="382" y="60" fill="var(--vp-c-brand-1)">A⁻¹Av=(0,1)</text>
    <text x="80" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">出发</text>
    <text x="240" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">乘 A</text>
    <text x="400" y="24" text-anchor="middle" fill="var(--vp-c-text-2)" font-weight="600">乘 A⁻¹</text>
  </g>
  <line x1="138" y1="105" x2="182" y2="105" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#e3-g)"/>
  <line x1="298" y1="105" x2="342" y2="105" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#e3-g)"/>
</svg>
</FigBox>

**为什么**：这里 $a=1, b=1, c=0, d=1$，于是 $ad-bc = 1\times1 - 1\times0 = 1$。代入公式：

$$A^{-1} = \frac{1}{1}\begin{bmatrix}1&-1\\0&1\end{bmatrix} = \begin{bmatrix}1&-1\\0&1\end{bmatrix}$$

和直觉完全一致——逆剪切就是朝反方向推。

**验算**（node，必须两边都乘到）：$A A^{-1}$ 与 $A^{-1}A$ 都应等于单位阵。

$$AA^{-1} = \begin{bmatrix}1&1\\0&1\end{bmatrix}\begin{bmatrix}1&-1\\0&1\end{bmatrix} = \begin{bmatrix}1&0\\0&1\end{bmatrix} = I$$

用 node 核对：`S=[1,1;0,1]`、`Sinv=[1,-1;0,1]`，`S*Sinv` 与 `Sinv*S` 都输出 `[1,0;0,1]`，判定 `A*Ainv === I` 为 `true`，验算通过。
:::

注意一个反向直觉：**$(AB)^{-1} = B^{-1}A^{-1}$，顺序也反过来**——要倒放「先穿袜子再穿鞋」，就得「先脱鞋再脱袜子」。这和下一节的转置规则是同一套「顺序反转」逻辑，放在一起记。

## 五、转置：沿主对角线翻个面

这一节的目标，是给转置一个几何图像——它不是「还原」，而是「镜像」。

**转置**（首次出现，先给图景）：把矩阵沿着**主对角线**（左上到右下那条）翻个面，行变列、列变行。第 $i$ 行第 $j$ 列的元素，跑到第 $j$ 行第 $i$ 列：

$$\left(A^T\right)_{ij} = A_{ji}$$

例如 $A = \begin{bmatrix}2&1\\0&3\end{bmatrix}$ 翻面后 $A^T = \begin{bmatrix}2&0\\1&3\end{bmatrix}$：第一列 $(2,0)$ 变成了第一行，第二列 $(1,3)$ 变成了第二行。几何上，转置是关于 45° 主对角线的**镜面反射**——把「列」这条竖着读的信息，换成「行」这条横着读的同一份信息。

转置有三条规则，其中后两条和复合、逆的「顺序反转」互相呼应：

1. $(A^T)^T = A$（翻两次翻回来）；
2. $(AB)^T = B^T A^T$（**先做 $B$ 再做 $A$ 的复合，转置后顺序反过来**）；
3. 若 $A$ 是旋转型（正交）矩阵，则 $A^T = A^{-1}$（旋转的镜像恰好就是反旋转）。

拿第二节的旋转 $B = \begin{bmatrix}0&-1\\1&0\end{bmatrix}$ 验证第 3 条：$B^T = \begin{bmatrix}0&1\\-1&0\end{bmatrix}$，而转回原位的逆矩阵正是 $B^{-1} = \begin{bmatrix}0&1\\-1&0\end{bmatrix}$，两者相等。这就是为什么「转置」在几何里常被当作「反向旋转」来用。

**验算**（第 2 条，用例 2 的 $A,B$）：$AB = \begin{bmatrix}1&-1\\1&0\end{bmatrix}$，故 $(AB)^T = \begin{bmatrix}1&1\\-1&0\end{bmatrix}$；而 $B^T A^T = \begin{bmatrix}0&1\\-1&0\end{bmatrix}\begin{bmatrix}1&0\\1&1\end{bmatrix} = \begin{bmatrix}1&1\\-1&0\end{bmatrix}$，两者相等。node 里手写转置与乘法核对，结论一致。

还有个特例值得记：如果 $A = A^T$（翻面后不变），就称 $A$ 是**对称矩阵**——几何上它是一个「自身镜像对称」的变换，比如纯缩放 $\begin{bmatrix}2&0\\0&3\end{bmatrix}$ 转置后还是它自己。物理和统计里很多矩阵天然是对称的，正是因为它描述的是「同一个东西在两个方向上的同一份关系」，沿主对角线两边天然一样。

转置是后面「内积 $\mathbf u\cdot\mathbf v = \mathbf u^T\mathbf v$」和「二次型 $\mathbf x^T A\mathbf x$」的底座，先在这认识它，后面用到时不陌生。

## 六、易错清单 + 自检

- [ ] **矩阵 ≠ 数字表，矩阵 = 变换**：每看到一个矩阵，先问「它把 $\mathbf i$、$\mathbf j$ 送到哪」，而不是先想着怎么乘。
- [ ] 矩阵乘法 $AB$ 是「先 $B$ 后 $A$」：右边先动手，$AB \ne BA$。
- [ ] $A\mathbf x$ 用「列的线性组合」来理解：$x_1$ 倍第一列加 $x_2$ 倍第二列。
- [ ] 逆矩阵只对 $ad-bc\ne0$ 的方阵存在；压扁空间（两列共线）就没有逆。
- [ ] $(AB)^{-1} = B^{-1}A^{-1}$、$(AB)^T = B^T A^T$：复合的逆和转置都**顺序反转**。
- [ ] 转置不是「还原」，是「镜像」；只有旋转型（正交）矩阵才有 $A^T = A^{-1}$。

**自检**：给 $A = \begin{bmatrix}1&2\\0&1\end{bmatrix}$ 求 $A^{-1}$，再算 $A A^{-1}$ 看是否等于 $I$。（答案：$A^{-1} = \begin{bmatrix}1&-2\\0&1\end{bmatrix}$，乘回后确为单位阵。）

---

把矩阵当成变换，是一切线代直觉的起点。下一章我们继续在这个网格上量面积——变换后每个小方格被放大了几倍、什么时候会「翻面」，那正是**行列式**要回答的问题。
