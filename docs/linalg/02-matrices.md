---
title: 02 · 矩阵与线性变换
description: 把矩阵读成一份记录：两根轴上的单位箭头被搬到了哪。顺着这份记录，读出乘向量、串联两台机器、倒带和翻面四件事。
---

# 02 · 矩阵与线性变换

<Meta time="26 min" level="核心" note="最容易错的一处：$AB$ 是「先做 $B$ 再做 $A$」，右边那台先动手，所以 $AB$ 和 $BA$ 通常不是同一台机器" />

桌上铺一张方格纸。捏住四个角，可以拉长它、斜推它、把它转一个角度，但有三条不许破：钉在原点的那个钉子不动；原来直的线，搬完还是直的；原来平行的格线，搬完仍平行、间距仍均匀。

这样一次整体搬动，怎么用几个数记下来？记下来之后还有一串动作要跟上：让它作用在一支箭上、把两台串起来、倒着走回去、沿对角线翻个面。四个动作各有各的坑，最后一个坑是「顺序」。

::: tip 读之前
上一页 [01 · 向量、线性组合与张成](./01-vectors.md) 的线性组合得会，$c\mathbf v+d\mathbf w$ 就是「各走几遍、接起来」。那一页的两个单位箭头 $\mathbf i=\begin{bmatrix}1\\0\end{bmatrix}$、$\mathbf j=\begin{bmatrix}0\\1\end{bmatrix}$ 也一直要用。

记号：大写斜体 $A$ 是一台变换，它的两列就是那份记录；$A\mathbf x$ 读作「$A$ 作用在 $\mathbf x$ 上」；$I$ 是单位矩阵，干的是「什么都不做」；$A^{-1}$ 是逆，$A^T$ 是转置。
:::

## 一、搬一次，信息只剩两列

盯住一个事实：任何一段位移都能写成「几个 $\mathbf i$ 加几个 $\mathbf j$」，而这类搬动只认「乘倍数、相加」两种动作（「线性」两个字就是这个意思）。所以只要知道两根单位箭头搬到了哪，整张纸上每一处的位置就都定了。

记录方式因此很省地方：两根单位箭头的新位置各写一列，并排放进方括号。

$$
A=\begin{bmatrix}2&1\\0&3\end{bmatrix}
$$

逐项读这个式子：第一列 $\begin{bmatrix}2\\0\end{bmatrix}$ 说的是「$\mathbf i$ 搬到了 $(2,0)$」，第二列 $\begin{bmatrix}1\\3\end{bmatrix}$ 说的是「$\mathbf j$ 搬到了 $(1,3)$」。读一个矩阵，就是读两句话：横轴那根单位箭去了哪、纵轴那根去了哪。这个矩阵里再没有别的信息。

<FigBox title="一次搬动的前后：网格线仍直、原点不动，两根单位箭换了位置" kind="结构" note="左右两侧刻度相同，左边每格 1 个单位，右边是搬完的样子。看完该看出：i 去了 (2,0)、j 去了 (1,3)，阴影那两条边正是 A 的两列。">
<svg viewBox="0 0 700 300" role="img" aria-label="变换前后对比：左右同一刻度，左侧标准网格与 i、j，右侧 A 作用后的平行四边形网格与 i′、j′">
<defs>
  <marker id="n1-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="n1-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-danger-1)" />
  </marker>
  <marker id="n1-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
  <clipPath id="n1-clip"><rect x="376" y="84" width="196" height="190" /></clipPath>
</defs>
<text x="150" y="96" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">搬之前（每格 1 个单位）</text>
<g stroke="var(--vp-c-divider)" stroke-width="1">
  <line x1="94" y1="124" x2="94" y2="236" /><line x1="122" y1="124" x2="122" y2="236" />
  <line x1="150" y1="124" x2="150" y2="236" /><line x1="178" y1="124" x2="178" y2="236" />
  <line x1="206" y1="124" x2="206" y2="236" />
  <line x1="94" y1="124" x2="206" y2="124" /><line x1="94" y1="152" x2="206" y2="152" />
  <line x1="94" y1="180" x2="206" y2="180" /><line x1="94" y1="208" x2="206" y2="208" />
  <line x1="94" y1="236" x2="206" y2="236" />
</g>
<polygon points="150,180 178,180 178,152 150,152" fill="var(--vp-c-brand-1)" opacity="0.16" />
<line x1="84" y1="180" x2="216" y2="180" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
<line x1="150" y1="112" x2="150" y2="248" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
<line x1="150" y1="180" x2="178" y2="180" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n1-a)" />
<line x1="150" y1="180" x2="150" y2="152" stroke="var(--vp-c-danger-1)" stroke-width="2.4" marker-end="url(#n1-b)" />
<text x="182" y="176" font-size="11" fill="var(--vp-c-brand-1)">i</text>
<text x="142" y="146" font-size="11" fill="var(--vp-c-danger-1)">j</text>
<text x="140" y="196" font-size="11" fill="var(--vp-c-text-3)">O</text>
<line x1="240" y1="180" x2="300" y2="180" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n1-g)" />
<text x="270" y="170" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">搬一次 A</text>
<text x="470" y="52" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">搬之后（同一刻度）</text>
<g clip-path="url(#n1-clip)">
  <g transform="matrix(56 0 28 -84 470 180)" stroke="var(--vp-c-divider)" stroke-width="1" vector-effect="non-scaling-stroke" fill="none">
    <line x1="-1" y1="-1" x2="-1" y2="1" /><line x1="0" y1="-1" x2="0" y2="1" /><line x1="1" y1="-1" x2="1" y2="1" />
    <line x1="-1" y1="-1" x2="1" y2="-1" /><line x1="-1" y1="0" x2="1" y2="0" /><line x1="-1" y1="1" x2="1" y2="1" />
  </g>
</g>
<polygon points="470,180 526,180 554,96 498,96" fill="var(--vp-c-brand-1)" opacity="0.16" />
<line x1="414" y1="180" x2="526" y2="180" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
<line x1="442" y1="264" x2="498" y2="96" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
<line x1="470" y1="180" x2="526" y2="180" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n1-a)" />
<line x1="470" y1="180" x2="498" y2="96" stroke="var(--vp-c-danger-1)" stroke-width="2.4" marker-end="url(#n1-b)" />
<text x="534" y="176" font-size="11" fill="var(--vp-c-brand-1)">i′ = (2, 0)</text>
<text x="502" y="88" font-size="11" fill="var(--vp-c-danger-1)">j′ = (1, 3)</text>
<text x="458" y="196" font-size="11" fill="var(--vp-c-text-3)">O</text>
<text x="470" y="288" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">同一刻度下，右边只放得下中心 2×2 格：纸被放大了</text>
</svg>
</FigBox>

有一个矩阵值得单独认识：$I=\begin{bmatrix}1&0\\0&1\end{bmatrix}$。它的第一列说 $\mathbf i$ 原地不动，第二列说 $\mathbf j$ 原地不动，所以它干的是「什么都不做」。后面讲倒带，回到的就是它。

## 二、作用在一支箭上

取 $\mathbf x=\begin{bmatrix}1\\1\end{bmatrix}$，它就是上一页 $\mathbf i$ 与 $\mathbf j$ 各走一遍。搬动保持「乘倍数、相加」不变，所以搬完之后它还是「$\mathbf i$ 的新位置走 1 遍、$\mathbf j$ 的新位置走 1 遍」：

$$
A\mathbf x
=1\begin{bmatrix}2\\0\end{bmatrix}+1\begin{bmatrix}1\\3\end{bmatrix}
=\begin{bmatrix}2+1\\0+3\end{bmatrix}
=\begin{bmatrix}3\\3\end{bmatrix}
$$

逐项读这个式子：$A$ 是 $2\times2$，$\mathbf x$ 是两个数的一列，所以结果也是两个数的一列，形状对得上。它说的是：把 $A$ 的第 1 列乘上 $\mathbf x$ 的第 1 个分量、第 2 列乘上第 2 个分量，再相加。也就是说，$A\mathbf x$ 永远是「$A$ 的两列按 $\mathbf x$ 的两个分量加权求和」。

课本上还有一套逐行算的算法：结果的第 1 个分量是 $A$ 的第 1 行与 $\mathbf x$ 逐项相乘再相加，$2\times1+1\times1=3$；第 2 个分量是 $0\times1+3\times1=3$。两套算法给出同一列数，原因就在上面的读法里：按列加权时 $\mathbf x$ 的分量是「几遍」，逐行算只是把同一个和换了个记账顺序。

<FigBox title="一支箭被搬走：x=(1,1) 落到 (3,3)" kind="结构" note="左边是进去的箭 x=(1,1)，右边是出来的 A x=(3,3)，两根单位箭也标了新位置 i′=(2,0)、j′=(1,3)。看完该看出：落点就是沿新方向各走 1 遍接起来的地方。">
<svg viewBox="0 0 486 210" role="img" aria-label="矩阵乘向量：输入 (1,1)，输出 (3,3)，并标出两根单位箭头的新位置 i′ 与 j′">
<defs>
  <marker id="n2-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="n2-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-danger-1)" />
  </marker>
  <marker id="n2-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<line x1="30" y1="120" x2="150" y2="120" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
<line x1="90" y1="40" x2="90" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
<line x1="90" y1="120" x2="120" y2="90" stroke="var(--vp-c-text-3)" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#n2-g)" />
<text x="122" y="84" font-size="12" fill="var(--vp-c-text-2)">x = (1, 1)</text>
<text x="90" y="34" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">输入</text>
<line x1="168" y1="120" x2="228" y2="120" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n2-g)" />
<text x="198" y="110" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">乘 A</text>
<line x1="318" y1="120" x2="366" y2="120" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#n2-a)" />
<line x1="318" y1="120" x2="342" y2="48" stroke="var(--vp-c-danger-1)" stroke-width="1.8" marker-end="url(#n2-b)" />
<line x1="318" y1="120" x2="390" y2="48" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#n2-a)" />
<text x="370" y="132" font-size="11" fill="var(--vp-c-brand-1)">i′ = (2, 0)</text>
<text x="300" y="44" font-size="11" fill="var(--vp-c-danger-1)" text-anchor="end">j′ = (1, 3)</text>
<text x="394" y="42" font-size="12" font-weight="600" fill="var(--vp-c-brand-1)">A x = (3, 3)</text>
<text x="318" y="34" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">输出</text>
</svg>
</FigBox>

## 三、两台机器串起来：右边那台先动手

再拿一台机器 $B=\begin{bmatrix}0&-1\\1&0\end{bmatrix}$：第一列说 $\mathbf i$ 去了 $(0,1)$，第二列说 $\mathbf j$ 去了 $(-1,0)$，整张纸绕原点转了 90°。

把两台串起来，就有了**矩阵乘法**：$AB$ 的意思是「先做 $B$，再做 $A$」。写的时候右边那台 $B$ 先动手，因为 $(AB)\mathbf x=A(B\mathbf x)$，最靠近 $\mathbf x$ 的是 $B$。

这个乘积怎么算？还是那套「读列」的办法：$AB$ 的两列，就是「$B$ 的两列各自再被 $A$ 送一次」。

$$
AB=\begin{bmatrix}2&1\\0&3\end{bmatrix}\begin{bmatrix}0&-1\\1&0\end{bmatrix}
=\begin{bmatrix}1&-2\\3&0\end{bmatrix}
$$

逐项读：第 1 列 $A\begin{bmatrix}0\\1\end{bmatrix}=\begin{bmatrix}1\\3\end{bmatrix}$，$\mathbf i$ 先被 $B$ 送到 $(0,1)$，再被 $A$ 送到 $(1,3)$；第 2 列 $A\begin{bmatrix}-1\\0\end{bmatrix}=\begin{bmatrix}-2\\0\end{bmatrix}$。所以 $AB$ 的第一列是 $(1,3)$、第二列是 $(-2,0)$，与上面那个结果一致。

顺序换不得。把两台换个先后：

$$
BA=\begin{bmatrix}0&-1\\1&0\end{bmatrix}\begin{bmatrix}2&1\\0&3\end{bmatrix}
=\begin{bmatrix}0&-3\\2&1\end{bmatrix}
$$

拿同一支箭分别试一下。$\mathbf x=\begin{bmatrix}1\\0\end{bmatrix}$：$(AB)\mathbf x=\begin{bmatrix}1\\3\end{bmatrix}$，而 $(BA)\mathbf x=\begin{bmatrix}0\\2\end{bmatrix}$。同一支箭、同样的两台机器，只因为先后不同，落点就不一样。所以 $AB$ 不是 $BA$，这两个乘积得分开算。

课本里背的那句「左边第 $i$ 行与右边第 $j$ 列逐项相乘再相加」，也可以从这里读出来：$AB$ 的第 $j$ 列是 $A$ 作用于 $B$ 第 $j$ 列的结果，而这个结果的第 $i$ 个分量，正好是 $A$ 第 $i$ 行与 $B$ 第 $j$ 列逐项相乘再相加。行乘列不是新规定，它只是把复合变换的每一列，一行一行写下来。

<FigBox title="两条路，两个落点：先 B 后 A 与先 A 后 B" kind="结构" note="同一支箭 (1,0) 分两条路走，一条先被转 90° 再被拉，另一条反过来。看完该看出两个落点 (1,3) 与 (0,2) 不重合，所以 AB 与 BA 是两台不同的机器。">
<svg viewBox="0 0 500 260" role="img" aria-label="复合变换两条路径：先 B 后 A 落到 (1,3)，先 A 后 B 落到 (0,2)">
<defs>
  <marker id="n3-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="n3-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<text x="60" y="22" font-size="12" font-weight="600" fill="var(--vp-c-text-2)">第一条路：先 B（转 90°），再 A</text>
<g stroke="var(--vp-c-text-3)" stroke-width="1.2">
  <line x1="30" y1="110" x2="130" y2="110" /><line x1="60" y1="60" x2="60" y2="150" />
  <line x1="200" y1="110" x2="300" y2="110" /><line x1="230" y1="60" x2="230" y2="150" />
  <line x1="370" y1="110" x2="470" y2="110" /><line x1="400" y1="20" x2="400" y2="150" />
</g>
<line x1="60" y1="110" x2="86" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n3-a)" />
<text x="60" y="128" font-size="11" fill="var(--vp-c-brand-1)">(1, 0)</text>
<line x1="230" y1="110" x2="230" y2="84" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n3-a)" />
<text x="236" y="80" font-size="11" fill="var(--vp-c-brand-1)">(0, 1)</text>
<line x1="400" y1="110" x2="426" y2="32" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n3-a)" />
<text x="430" y="34" font-size="11" font-weight="600" fill="var(--vp-c-brand-1)">(1, 3)</text>
<g font-size="11" fill="var(--vp-c-text-3)">
  <text x="60" y="52" text-anchor="middle">出发</text>
  <text x="230" y="52" text-anchor="middle">乘 B</text>
  <text x="400" y="12" text-anchor="middle">乘 A</text>
</g>
<line x1="140" y1="110" x2="190" y2="110" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n3-g)" />
<line x1="310" y1="110" x2="360" y2="110" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n3-g)" />
<text x="60" y="150" font-size="12" font-weight="600" fill="var(--vp-c-text-2)">第二条路：先 A，再 B</text>
<g stroke="var(--vp-c-text-3)" stroke-width="1.2">
  <line x1="30" y1="230" x2="130" y2="230" /><line x1="60" y1="180" x2="60" y2="250" />
  <line x1="200" y1="230" x2="300" y2="230" /><line x1="230" y1="180" x2="230" y2="250" />
  <line x1="370" y1="230" x2="470" y2="230" /><line x1="400" y1="170" x2="400" y2="250" />
</g>
<line x1="60" y1="230" x2="86" y2="230" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n3-a)" />
<text x="60" y="248" font-size="11" fill="var(--vp-c-brand-1)">(1, 0)</text>
<line x1="230" y1="230" x2="282" y2="230" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n3-a)" />
<text x="284" y="226" font-size="11" fill="var(--vp-c-brand-1)">(2, 0)</text>
<line x1="400" y1="230" x2="400" y2="178" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n3-a)" />
<text x="406" y="178" font-size="11" font-weight="600" fill="var(--vp-c-brand-1)">(0, 2)</text>
<g font-size="11" fill="var(--vp-c-text-3)">
  <text x="60" y="172" text-anchor="middle">出发</text>
  <text x="230" y="172" text-anchor="middle">乘 A</text>
  <text x="400" y="162" text-anchor="middle">乘 B</text>
</g>
<line x1="140" y1="230" x2="190" y2="230" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n3-g)" />
<line x1="310" y1="230" x2="360" y2="230" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n3-g)" />
</svg>
</FigBox>

## 四、倒带和翻面

### 倒带：什么时候倒得回去

$A$ 把 $\mathbf i,\mathbf j$ 搬到两个新方向。如果这两个新方向仍然指向不同方向，那么每一步都能倒着走回去，存在一台机器 $A^{-1}$，使得

$$
A^{-1}A=AA^{-1}=I
$$

「方向仍然不同就能倒回去」只是直觉，真要判定，得用第 5 章的行列式，或者第 3 章的方程组去验证。这里只做一件事：把候选的 $A^{-1}$ 乘回去，看是不是 $I$。

对 $A=\begin{bmatrix}2&1\\0&3\end{bmatrix}$，倒带机是 $A^{-1}=\frac{1}{6}\begin{bmatrix}3&-1\\0&2\end{bmatrix}=\begin{bmatrix}\frac12&-\frac16\\0&\frac13\end{bmatrix}$。检验一遍：$A$ 的第 1 列 $(2,0)$ 被 $A^{-1}$ 送回 $\left(\frac12\cdot2,\ 0\right)=(1,0)$，第 2 列 $(1,3)$ 被送回 $\left(\frac12-\frac36,\ 1\right)=(0,1)$，两根轴都回原位，所以乘完是 $I$。

2×2 有一个现成的公式：$A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$ 时，

$$
A^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}
$$

分母 $ad-bc$ 这个数，管的就是「有没有压扁」。$A$ 里 $ad-bc=2\times3-1\times0=6$，不为零，所以有逆；把它换成 $\begin{bmatrix}1&1\\2&2\end{bmatrix}$，两列成了倍数，$ad-bc=1\times2-1\times2=0$，整张纸被压到一条直线上，信息丢了，倒不回去。这个数第 5 章会正式命名为**行列式**，这里只要会算它、并知道它等于 0 就没有逆。

<FigBox title="倒带：A 把 (1,1) 送到 (3,3)，A⁻¹ 再把它送回来" kind="结构" note="三步并排放：原来的箭 (1,1)、被 A 送到 (3,3) 的箭、被 A⁻¹ 送回 (1,1) 的箭。看完该看出一来一回两根轴都回原位，所以两个方向的乘积都等于单位矩阵。">
<svg viewBox="0 0 400 190" role="img" aria-label="逆变换示意：向量 (1,1) 被 A 送到 (3,3)，再被 A 的逆送回 (1,1)">
<defs>
  <marker id="n4-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="n4-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g stroke="var(--vp-c-text-3)" stroke-width="1.2">
  <line x1="30" y1="130" x2="120" y2="130" /><line x1="70" y1="70" x2="70" y2="160" />
  <line x1="170" y1="130" x2="290" y2="130" /><line x1="210" y1="30" x2="210" y2="160" />
  <line x1="320" y1="130" x2="390" y2="130" /><line x1="350" y1="70" x2="350" y2="160" />
</g>
<line x1="70" y1="130" x2="94" y2="106" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n4-a)" />
<text x="70" y="150" font-size="11" fill="var(--vp-c-brand-1)">(1, 1)</text>
<line x1="210" y1="130" x2="282" y2="58" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n4-a)" />
<text x="240" y="120" font-size="11" fill="var(--vp-c-brand-1)">(3, 3)</text>
<line x1="350" y1="130" x2="374" y2="106" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#n4-a)" />
<text x="340" y="150" font-size="11" fill="var(--vp-c-brand-1)">(1, 1)</text>
<line x1="130" y1="130" x2="162" y2="130" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n4-g)" />
<line x1="298" y1="130" x2="318" y2="130" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#n4-g)" />
<text x="146" y="120" font-size="11" fill="var(--vp-c-text-1)" text-anchor="middle">乘 A</text>
<text x="308" y="120" font-size="11" fill="var(--vp-c-text-1)" text-anchor="middle">乘 A⁻¹</text>
<text x="200" y="182" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">一来一回，两根轴都回到原位：A⁻¹A = I</text>
</svg>
</FigBox>

### 翻面：转置

另一件常做的事，是把矩阵沿主对角线（左上到右下）翻个面：第 $i$ 行搬到第 $i$ 列的位置，记作 $A^T$。

$$
A=\begin{bmatrix}2&1\\0&3\end{bmatrix},\qquad
A^T=\begin{bmatrix}2&0\\1&3\end{bmatrix}
$$

读法：$A$ 的第一列 $(2,0)$ 翻过去成了 $A^T$ 的第一行；第二列 $(1,3)$ 成了第二行。它跟倒带是两件事，倒带要把变换后的箭头送回原处，$A^T$ 只是把行与列交换。至于它把图形变成什么样、面积怎样变，第 5 章会算；这里只认准位置怎么换。

翻两次就翻回来：$(A^T)^T=A$。串联的时候顺序会反：$(AB)^T=B^TA^T$。上一节的 $AB=\begin{bmatrix}1&-2\\3&0\end{bmatrix}$ 翻面得 $\begin{bmatrix}1&3\\-2&0\end{bmatrix}$；而 $B^TA^T=\begin{bmatrix}0&1\\-1&0\end{bmatrix}\begin{bmatrix}2&0\\1&3\end{bmatrix}=\begin{bmatrix}1&3\\-2&0\end{bmatrix}$，两边一致。为什么顺序要反？转置把「先读列」换成了「先读行」，两段动作的先后也就跟着倒过来。

如果翻完和原来一模一样（$A^T=A$），这样的矩阵叫**对称矩阵**，例如 $\begin{bmatrix}2&0\\0&3\end{bmatrix}$：主对角线两边天然一样。

## 例题

::: tip 例 1 · 两种算法算同一支箭，再把它送回去
题目：$A=\begin{bmatrix}2&1\\0&3\end{bmatrix}$，$\mathbf x=\begin{bmatrix}1\\1\end{bmatrix}$。求 $A\mathbf x$：先用按列加权，再用逐行算，两法对照；最后用倒带机把结果送回去。

先猜：$A$ 的两列 $(2,0)$、$(1,3)$ 坐标都非负，而 $\mathbf x$ 的两个分量都是正的，所以结果的两个分量都该是正的，而且横坐标至少是 2、纵坐标至少是 3。

再算：
1. 按列加权：$A\mathbf x=1\begin{bmatrix}2\\0\end{bmatrix}+1\begin{bmatrix}1\\3\end{bmatrix}=\begin{bmatrix}3\\3\end{bmatrix}$。*（为什么：$\mathbf x$ 的两个分量就是「几遍」。）*
2. 逐行算：第 1 行 $2\times1+1\times1=3$，第 2 行 $0\times1+3\times1=3$，同样得 $(3,3)$。

再回代：把 $(3,3)$ 乘倒带机：$A^{-1}\begin{bmatrix}3\\3\end{bmatrix}=\begin{bmatrix}\frac12\cdot3-\frac16\cdot3\\ 0+\frac13\cdot3\end{bmatrix}=\begin{bmatrix}1\\1\end{bmatrix}$，回到出发的 $\mathbf x$，与「倒带」的含义一致；两个分量都是正数，也与猜测相符。
:::

::: tip 例 2 · 顺序不同，落点不同
题目：接上例的 $A$，另取 $B=\begin{bmatrix}0&-1\\1&0\end{bmatrix}$。（a）算 $AB$ 与 $BA$；（b）用 $\mathbf v=\begin{bmatrix}0\\1\end{bmatrix}$ 分别试这两台机器。

先猜：$AB$ 与 $BA$ 都把纸搬成同样大小的图形（先转再拉、先拉再转），但方向不同，所以两个乘积应该不一样；对同一支箭，落点也应该不同。

再算：
1. $AB$：第 1 列 $=A\begin{bmatrix}0\\1\end{bmatrix}=\begin{bmatrix}1\\3\end{bmatrix}$，第 2 列 $=A\begin{bmatrix}-1\\0\end{bmatrix}=\begin{bmatrix}-2\\0\end{bmatrix}$，所以 $AB=\begin{bmatrix}1&-2\\3&0\end{bmatrix}$。*（为什么这么算：$AB$ 的列就是 $B$ 的列再被 $A$ 送一次。）*
2. $BA$：第 1 列 $=B\begin{bmatrix}2\\0\end{bmatrix}=\begin{bmatrix}0\\2\end{bmatrix}$，第 2 列 $=B\begin{bmatrix}1\\3\end{bmatrix}=\begin{bmatrix}-3\\1\end{bmatrix}$，所以 $BA=\begin{bmatrix}0&-3\\2&1\end{bmatrix}$。
3. （b）$(AB)\begin{bmatrix}0\\1\end{bmatrix}$ 取 $AB$ 的第 2 列 $=(-2,0)$；$(BA)\begin{bmatrix}0\\1\end{bmatrix}$ 取 $BA$ 的第 2 列 $=(-3,1)$。

再回代：把两条路按「两步」重走一遍核对。$B\begin{bmatrix}0\\1\end{bmatrix}=\begin{bmatrix}-1\\0\end{bmatrix}$，再 $A\begin{bmatrix}-1\\0\end{bmatrix}=\begin{bmatrix}-2\\0\end{bmatrix}$，与 $AB$ 的第 2 列一致；另一条 $A\begin{bmatrix}0\\1\end{bmatrix}=\begin{bmatrix}1\\3\end{bmatrix}$，再 $B\begin{bmatrix}1\\3\end{bmatrix}=\begin{bmatrix}-3\\1\end{bmatrix}$，与 $BA$ 的第 2 列一致。这也说明「先做谁」真的会改变结果。
:::

::: tip 例 3 · 求倒带机并回乘验算
题目：$A=\begin{bmatrix}2&1\\0&3\end{bmatrix}$，求 $A^{-1}$，并两边回乘验算；再说明 $\begin{bmatrix}1&1\\2&2\end{bmatrix}$ 为什么没有逆。

先猜：$ad-bc=6\ne0$，所以有逆；分子是 $\begin{bmatrix}3&-1\\0&2\end{bmatrix}$，分母 6，所以 $A^{-1}$ 的元素都是 $\frac12$、$\frac16$、$\frac13$ 这类简单分数；又因为 $A$ 的左下角是 0，$A^{-1}$ 的左下角也该是 0。

再算：
1. 按公式 $A^{-1}=\frac16\begin{bmatrix}3&-1\\0&2\end{bmatrix}=\begin{bmatrix}\frac12&-\frac16\\0&\frac13\end{bmatrix}$。*（为什么用这个公式：它把「两条边各退回去」写成了四个数，分母正是「有没有压扁」的判据。）*
2. $AA^{-1}$：第 1 列 $A\begin{bmatrix}\frac12\\0\end{bmatrix}=\begin{bmatrix}1\\0\end{bmatrix}$，第 2 列 $A\begin{bmatrix}-\frac16\\\frac13\end{bmatrix}=\begin{bmatrix}-\frac13+\frac13\\1\end{bmatrix}=\begin{bmatrix}0\\1\end{bmatrix}$，合起来是 $I$。
3. $A^{-1}A$：第 1 列 $A^{-1}\begin{bmatrix}2\\0\end{bmatrix}=\begin{bmatrix}1\\0\end{bmatrix}$，第 2 列 $A^{-1}\begin{bmatrix}1\\3\end{bmatrix}=\begin{bmatrix}\frac12-\frac12\\1\end{bmatrix}=\begin{bmatrix}0\\1\end{bmatrix}$，同样是 $I$。

再回代：把猜的三条逐条核对。分母 6 用上了；$A^{-1}$ 左下角确实是 0；两边回乘都得到 $I$。再看 $\begin{bmatrix}1&1\\2&2\end{bmatrix}$：$ad-bc=1\times2-1\times2=0$，两列成倍数，整张纸被压到一条线上，同一个落点有无数支箭被送过来，分不清原来是谁，所以没有逆。
:::

## 收尾只剩两条

四条路可以画成一张图：矩阵是记录（两列就是两根单位箭的新位置）；乘向量是把两列按分量加权；乘法是串联，右边那台先动手；逆是倒带，前提是纸没被压扁。以 $A$ 为例，第 1 列 $(2,0)$、第 2 列 $(1,3)$，两个数各管一根轴。

正着用这台机器，是给一个 $\mathbf x$ 求 $A\mathbf x$；反过来给 $\mathbf b$ 求 $\mathbf x$，就是 $A\mathbf x=\mathbf b$，下一页的活。

::: warning 两处最容易翻车
- 把矩阵当成一张数字表去背乘法。先读两列：$\mathbf i$ 去哪、$\mathbf j$ 去哪。
- 把 $AB\ne BA$ 当成算错了。它们是两台不同的机器，落点本来就不同；每台机器也未必能倒带，两列成倍数（$ad-bc=0$）时就没有逆。
:::

下一站换个问法：[03 · 高斯消元与线性方程组](./03-elimination.md)，不追「一支箭被搬到哪」，改成「哪支箭会被搬到指定位置」。
