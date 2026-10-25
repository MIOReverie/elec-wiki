---
title: 03 · 高斯消元与线性方程组
description: 从初中的加减消元出发，把方程组写成一张只抄系数的表，用三种不改变解集的行变换把它削成阶梯形，再从最后一行倒着代回去；顺带判清唯一解、无解、无穷多解，并说明 A=LU 就是把削的过程存下来。
---

# 03 · 高斯消元与线性方程组

<Meta time="24 min" level="核心" note="最容易错的一处：消元要整行一起做，右端也得跟着变；只削系数不动右端，解就错了" />

**这一页要解决什么**：两个未知数你会加减消元，三个以上就手忙脚乱，也说不清什么时候根本没有解。读完这一页，你能把任何方程组写成一张表、一步步削成阶梯形、从最后一行倒着解回去，并看出解是唯一、没有、还是无穷多。

::: tip 读之前
- 需要会：初中的加减消元（把一个方程乘个倍数、加到另一个上去）；上一页 [02 · 矩阵与线性变换](./02-matrices.md) 的 $A\mathbf x$——把 $A$ 的各列按 $\mathbf x$ 的分量加权相加，本页还会再用。
- 本页记号：$[A\ \ \mathbf b]$ 表示把系数和右端并排写成一张表（竖线只是分隔，不是除法）；$R_i$ 指第 $i$ 行；$U$ 是削完的阶梯形，$L$ 是存乘子的下三角表。
:::

先回到最熟的画面。解 $\begin{cases}x+y=3\\ x-y=1\end{cases}$ 就是把两个方程相加：$2x=4$，得 $x=2$，再回代得 $y=1$。图上，这两个方程是两条直线，解 $(2,1)$ 是它们的交点。

两个未知数可以这样干，三个呢？三个方程各自是一张平面，解是三张平面的公共点：可能交于一点，也可能交成一条线（无穷多解），还可能凑不到一起（无解）。先猜一下本页要算的方程组：右端是 4、9、5 这种小整数，解大概率是 1 到 3 之间的整数，而且只有一个。

## 一、先把方程组翻译成一张表

未知数一多，每步都要重抄 $x,y,z$，容易抄错。既然动的只是系数和右端，名字可以不写，只抄数。把三个方程

$$
\begin{cases}x+y+z=4\\ 2x+3y+z=9\\ x+y+2z=5\end{cases}
$$

写成一张表，叫**增广矩阵**：

$$
\left[\begin{array}{ccc|c}1&1&1&4\\ 2&3&1&9\\ 1&1&2&5\end{array}\right]
$$

逐项读这张表：每一行是原来的一个方程，前三个数依次是 $x,y,z$ 的系数，竖线右边是右端；每一列是「同一个未知数在所有方程里的系数」。所以它没有丢信息——左边三个数配上 $x,y,z$、右边那个数留在等号后面，就是原方程。

表上允许做三种操作，叫**初等行变换**：

| 变换 | 写法 | 为什么解集不变 |
| --- | --- | --- |
| 交换两行 | $R_1\leftrightarrow R_2$ | 一组解要同时满足所有方程，与方程排第几无关 |
| 某行乘一个非零数 | $R_2\gets cR_2$ | 等式两边同乘，还能再除回去 |
| 某行减去另一行的倍数 | $R_2\gets R_2-cR_1$ | 等量替换，加回来就还原 |

第二条强调「非零」：乘 0 会把方程抹掉，抹掉就还不回来。

拿解 $(1,2,1)$ 试第三条：原第 2 行左边是 $2+6+1=9$，减掉第 1 行的 2 倍（$8$）剩 1，正是新第 2 行的 $0+1\cdot2-1\cdot1=1$；右端同样减：$9-2\times4=1$。所以「整行一起做」：左边怎么减，右边就怎么减。

## 二、把表削成阶梯形，再从下往上代回去

削的目标是：第一列只剩左上角一个非零，第二列只剩第二个，依此类推，形如台阶。每一列里负责「把下方削成 0」的那个非零数叫**主元**（pivot）；要削的行该列的数除以主元，叫**乘子**（multiplier），它就是「这一行要减掉主元行的几倍」。

拿上面的表开工。第一列的主元是 $1$，第 2、3 行的乘子分别是 $2/1=2$ 与 $1/1=1$：

$$
R_2\gets R_2-2R_1,\quad R_3\gets R_3-R_1
\quad\Longrightarrow\quad
\left[\begin{array}{ccc|c}1&1&1&4\\ 0&1&-1&1\\ 0&0&1&1\end{array}\right]
$$

具体算一遍第 2 行：$(2,3,1\,|\,9)-2(1,1,1\,|\,4)=(0,1,-1\,|\,1)$；第 3 行：$(1,1,2\,|\,5)-(1,1,1\,|\,4)=(0,0,1\,|\,1)$。

接着看第二列。主元是第 2 行的 $1$，第 3 行该列是 $0$，乘子就是 $0/1=0$——这一行不用动。所以表已经是阶梯形了，记作 $U$。

<FigBox title="削一次：乘子记下来，表就变成了阶梯形" kind="结构" note="输入：左边的增广矩阵，前三个数是系数、竖线右边是右端，红圈是第一列的主元 1。操作：用第 1 行削第 2、3 行，减掉的倍数（乘子 2 与 1）标在箭头上；第二列的乘子是 0，因为第 3 行第 2 列本来就是 0。结果：右边的阶梯形 U，三个主元各居一列。看图能读出什么：消元只改行不改列，未知数个数始终没变。">
<svg viewBox="0 0 430 200" role="img" aria-label="消元示意：左边增广矩阵，用第一行削掉下面两行的第一列，得到右边的上三角矩阵">
<defs>
  <marker id="k1-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)" />
  </marker>
</defs>
<text x="86" y="20" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">增广矩阵（输入）</text>
<text x="330" y="20" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">阶梯形 U（结果）</text>
<g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
  <text x="44" y="52">1</text><text x="70" y="52">1</text><text x="96" y="52">1</text><text x="128" y="52">4</text>
  <text x="44" y="76">2</text><text x="70" y="76">3</text><text x="96" y="76">1</text><text x="128" y="76">9</text>
  <text x="44" y="100">1</text><text x="70" y="100">1</text><text x="96" y="100">2</text><text x="128" y="100">5</text>
</g>
<g fill="none" stroke="var(--vp-c-divider)" stroke-width="1.2">
  <rect x="26" y="36" width="118" height="76" />
  <line x1="112" y1="36" x2="112" y2="112" stroke-dasharray="3 3" />
</g>
<circle cx="44" cy="46" r="12" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6" />
<g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
  <text x="252" y="52">1</text><text x="278" y="52">1</text><text x="304" y="52">1</text><text x="336" y="52">4</text>
  <text x="252" y="76">0</text><text x="278" y="76">1</text><text x="304" y="76">−1</text><text x="336" y="76">1</text>
  <text x="252" y="100">0</text><text x="278" y="100">0</text><text x="304" y="100">1</text><text x="336" y="100">1</text>
</g>
<g fill="none" stroke="var(--vp-c-divider)" stroke-width="1.2">
  <rect x="234" y="36" width="118" height="76" />
  <line x1="320" y1="36" x2="320" y2="112" stroke-dasharray="3 3" />
</g>
<circle cx="252" cy="46" r="12" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6" />
<circle cx="278" cy="70" r="12" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6" />
<circle cx="304" cy="94" r="12" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6" />
<line x1="152" y1="74" x2="224" y2="74" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#k1-a)" />
<text x="188" y="46" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₂←R₂−2R₁</text>
<text x="188" y="62" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₃←R₃−R₁</text>
<text x="215" y="140" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">乘子 m₂₁=2、m₃₁=1、m₃₂=0</text>
<text x="215" y="162" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">三个主元各占一列，所以三个未知数都被钉住</text>
</svg>
</FigBox>

**回代**是从最后一行往上代：第 3 行说 $z=1$；第 2 行 $y-z=1$ 代入得 $y=2$；第 1 行 $x+y+z=4$ 代入得 $x=1$。每上一步，右边只剩一个未知数，所以不会卡住。

<FigBox title="回代：从最后一行往上，每步只解一个未知数" kind="结构" note="输入：阶梯形最下面一行 z=1。操作：把已解出的数往上代。结果：y=2、x=1，解 (1,2,1)。看图能读出什么：回代不会乱，是因为台阶保证「往上每走一行，恰好少一个未知数」。">
<svg viewBox="0 0 400 210" role="img" aria-label="回代路径：从底部 z=1 往上依次得 y=2、x=1">
<defs>
  <marker id="k2-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<rect x="30" y="130" width="300" height="34" rx="5" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="180" y="152" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="middle">第 3 行：z = 1</text>
<rect x="30" y="84" width="300" height="34" rx="5" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="180" y="106" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="middle">第 2 行：y − z = 1，代入 z 得 y = 2</text>
<rect x="30" y="38" width="300" height="34" rx="5" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="180" y="60" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="middle">第 1 行：x + y + z = 4，代入得 x = 1</text>
<line x1="180" y1="128" x2="180" y2="122" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#k2-a)" />
<line x1="180" y1="82" x2="180" y2="76" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#k2-a)" />
<text x="196" y="126" font-size="11" fill="var(--vp-c-brand-1)">代入</text>
<text x="196" y="80" font-size="11" fill="var(--vp-c-brand-1)">代入</text>
<text x="180" y="188" font-size="12" font-weight="600" fill="var(--vp-c-brand-1)" text-anchor="middle">解：(x, y, z) = (1, 2, 1)</text>
</svg>
</FigBox>

代回原方程核对，三条都要成立：$1+2+1=4$、$2\cdot1+3\cdot2+1=9$、$1+2+2\cdot1=5$。三条全对，解才算坐实。

## 三、什么时候没有唯一解

削出来的阶梯形会把答案说出来，顺序固定：**先找矛盾行，再看有没有空列**（整列都没有主元的列）。

| 削完出现的东西 | 它说明什么 | 结论 |
| --- | --- | --- |
| 有一行形如 $0=k$（$k\ne0$） | 某个方程要求「0 等于非零数」，与原方程组矛盾 | 无解（有它就不必再往下看） |
| 没有矛盾行，但有一列没有主元 | 那个未知数不受任何方程约束，能自由取值 | 无穷多解 |
| 没有矛盾行，且每一列都有主元 | 每个未知数都被钉住 | 唯一解 |

注意 $0=0$ 本身判不出什么，它只说明「这个方程多余」；若同一张表里既有 $0=0$ 又有 $0=k$，说了算的是矛盾行——照样无解。只有「没有矛盾行 + 有空列」同时成立才无穷多。

换一张系数表配两个右端。取 $A'=\begin{bmatrix}1&2&3\\ 2&4&6\\ 1&1&1\end{bmatrix}$：第 2 行是第 1 行的两倍，最多两个管用的方程，三个未知数必然不唯一，问题只在有没有解。

**无穷多的情形**，右端取 $\mathbf b=\begin{bmatrix}1\\2\\1\end{bmatrix}$。$R_2\gets R_2-2R_1$ 得 $(0,0,0\,|\,0)$，这行多余；$R_3\gets R_3-R_1$ 得 $(0,-1,-2\,|\,0)$。没有矛盾行，而 $z$ 那一列没有主元——上表第二行：只剩 $x+2y+3z=1$ 与 $y=-2z$，得 $x=1+z$，$z$ 任取，解是 $(1+z,\,-2z,\,z)$。

**无解的情形**，右端取 $\mathbf b=\begin{bmatrix}1\\3\\1\end{bmatrix}$。第 2 行减两倍第 1 行后，系数是 0，右端却剩 $3-2\cdot1=1$，冒出 $0=1$：按上表第一行直接无解——哪怕还有空列、还有自由未知数也救不回来。「第 2 行系数是第 1 行的两倍」这件事在右端上对不上。

几何上这样说更准：$0=k$ 表示两个方程要不到一起去，公共点不存在；$0=0$ 只表示这行没添新限制——可能是两方程其实描述同一张面，也可能只是多了一张重复的。公共部分到底是点、线还是面，要看还剩几个能自由取值的未知数。下图是最简的二维对照：两方程时，两线重合恰好就是无穷多。

<FigBox title="二维里的三种结局：交点、平行、重合" kind="几何" note="输入：每个方程是一条直线，两条画在一张纸上。操作：看它们怎么相处。结果：左交于一点（唯一解），中平行（无解），右叠成一条（无穷多）。看图能读出什么：$0=k$ 对应中图；右图重合只在两方程时等于无穷多。">
<svg viewBox="0 0 340 200" role="img" aria-label="三条小图：两条直线相交于一点、平行不相交、完全重合，分别对应唯一解、无解、无穷多解">
<g stroke="var(--vp-c-divider)" stroke-width="1.2" fill="none">
  <line x1="13" y1="95" x2="93" y2="95" /><line x1="53" y1="55" x2="53" y2="135" />
  <line x1="120" y1="95" x2="200" y2="95" /><line x1="160" y1="55" x2="160" y2="135" />
  <line x1="227" y1="95" x2="307" y2="95" /><line x1="267" y1="55" x2="267" y2="135" />
</g>
<line x1="21" y1="111" x2="85" y2="47" stroke="var(--vp-c-danger-1)" stroke-width="2" />
<line x1="21" y1="47" x2="85" y2="111" stroke="var(--vp-c-brand-1)" stroke-width="2" />
<circle cx="53" cy="79" r="3.4" fill="var(--vp-c-danger-1)" />
<line x1="128" y1="111" x2="192" y2="47" stroke="var(--vp-c-danger-1)" stroke-width="2" />
<line x1="128" y1="143" x2="192" y2="79" stroke="var(--vp-c-brand-1)" stroke-width="2" />
<line x1="235" y1="111" x2="299" y2="47" stroke="var(--vp-c-danger-1)" stroke-width="2" />
<line x1="235" y1="111" x2="299" y2="47" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="6 5" />
<g font-size="12" fill="var(--vp-c-text-2)" text-anchor="middle">
  <text x="53" y="158">相交 · 唯一解</text>
  <text x="160" y="158">平行 · 无解</text>
  <text x="267" y="158">重合 · 无穷多解</text>
  <text x="160" y="184" font-size="11" fill="var(--vp-c-text-3)">每个方程是一条直线，解是公共点</text>
</g>
</svg>
</FigBox>

主元的个数，第 4 章会给它一个正式名字（秩）；本页只用它判解。

## 四、把削的过程存下来

回头看一眼刚才的乘子：$m_{21}=2$、$m_{31}=1$、$m_{32}=0$。它们被用一次就丢了，有点可惜——如果把它们按位置抄进一张表，对角线填 1，其余空位填 0，就得到一个下三角的表

$$
L=\begin{bmatrix}1&0&0\\ 2&1&0\\ 1&0&1\end{bmatrix}
$$

神奇的是，这样抄出来的 $L$ 和削完的 $U$，乘起来正好还原 $A$：

$$
LU=\begin{bmatrix}1&0&0\\ 2&1&0\\ 1&0&1\end{bmatrix}\begin{bmatrix}1&1&1\\ 0&1&-1\\ 0&0&1\end{bmatrix}
=\begin{bmatrix}1&1&1\\ 2&3&1\\ 1&1&2\end{bmatrix}=A
$$

逐项读这个等式：$L$ 记「每步减掉了主元行的几倍」，$U$ 记「削完长什么样」，一乘就拼回 $A$。道理是：每步消元都是「某行减去主元行的倍数」，倒过来写成「加上」，倍数不变、符号相反，落在 $L$ 的对应格子。

用处在于：同一个 $A$、很多个右端时，分解只做一次。解 $A\mathbf x=\mathbf b$ 拆两段——先从 $L$ 往下代（前代）得 $\mathbf c$，再从 $U$ 往上代得 $\mathbf x$。本例前代给 $\mathbf c=(4,1,1)$，正是阶梯形那张表的右端。

说清楚一点：本页例子没换过行。真要换行，乘子位置会被打乱，$A=LU$ 得改写成带置换矩阵的样子，本页不涉及。

## 例题

::: tip 例 1 · 完整走一遍：削、代、再代回
**题目**：解 $\begin{cases}x+y+z=4\\ 2x+3y+z=9\\ x+y+2z=5\end{cases}$。

**先猜**：右端都是小整数，解大概是 1 到 3 之间的整数；又因为 $x+y+z=4$，三数不可能都大于 1。

**再算**：
1. 写成表：$\left[\begin{array}{ccc|c}1&1&1&4\\ 2&3&1&9\\ 1&1&2&5\end{array}\right]$。*（为什么只抄数：动的只有系数和右端。）*
2. 第一列主元 1，乘子 $2$、$1$：$R_2\gets R_2-2R_1$、$R_3\gets R_3-R_1$，得 $\left[\begin{array}{ccc|c}1&1&1&4\\ 0&1&-1&1\\ 0&0&1&1\end{array}\right]$。*（为什么整行一起减：右端不跟着变，等式不成立。）*
3. 第二列主元 1，第 3 行该列是 0，乘子 0，已是阶梯形。
4. 回代：$z=1$；$y-z=1\Rightarrow y=2$；$x+y+z=4\Rightarrow x=1$。*（为什么从下往上：最后一行只有一个未知数，先解它。）*

**再回代**：把 $(1,2,1)$ 代回原方程：$1+2+1=4$、$2+6+1=9$、$1+2+2=5$，三条都成立，与猜测一致。
:::

::: tip 例 2 · 同一张系数表，两个右端，两种结局
**题目**：$A'=\begin{bmatrix}1&2&3\\ 2&4&6\\ 1&1&1\end{bmatrix}$。（a）右端 $\mathbf b=\begin{bmatrix}1\\2\\1\end{bmatrix}$；（b）右端 $\mathbf b=\begin{bmatrix}1\\3\\1\end{bmatrix}$。各判有没有解、有几个。

**先猜**：$A'$ 第 2 行是第 1 行的两倍，管用的方程最多两个，未知数三个——不可能是唯一解。（a）右端也成两倍，该自洽；（b）右端 $3\ne2\times1$，该无解。

**再算**：
1. （a）$R_2\gets R_2-2R_1$ 得 $(0,0,0\,|\,0)$，这行多余；$R_3\gets R_3-R_1$ 得 $(0,-1,-2\,|\,0)$。剩 $x+2y+3z=1$ 与 $y=-2z$，解是 $(1+z,\,-2z,\,z)$。*（为什么 z 能随便取：它那一列没有主元，没有方程把它钉住。）*
2. （b）同样两步后，第 2 行变成 $(0,0,0\,|\,1)$，冒出 $0=1$。

**再回代**：（a）取 $z=0$ 得 $(1,0,0)$、$z=2$ 得 $(3,-4,2)$，代回都是 $1,2,1$；不同的 $z$ 给出不同的解，所以无穷多。（b）那行 $0=1$ 代什么数都不成立，无解。
:::

::: tip 例 3 · 写出 LU，并验乘
**题目**：对 $A=\begin{bmatrix}1&1&1\\ 2&3&1\\ 1&1&2\end{bmatrix}$，按例 1 的乘子写出 $L$ 与 $U$，验 $LU=A$，再用两段代法复核解。

**先猜**：非零乘子只有 $2$、$1$（$m_{32}=0$），所以 $L$ 里只有第 1 列下方两个格子非零，对角线全是 1。

**再算**：
1. $L=\begin{bmatrix}1&0&0\\ 2&1&0\\ 1&0&1\end{bmatrix}$、$U=\begin{bmatrix}1&1&1\\ 0&1&-1\\ 0&0&1\end{bmatrix}$。*（为什么乘子照抄不改符号：$L$ 记的是「倒回去要加回的倍数」，与减掉时同号，位置换到下三角。）*
2. 验乘：$L$ 第 1 行 $\times$ $U$ 得 $(1,1,1)$；第 2 行 $2(1,1,1)+(0,1,-1)=(2,3,1)$；第 3 行 $1(1,1,1)+0\cdot(0,1,-1)+1\cdot(0,0,1)=(1,1,2)$。三行正是 $A$。

**再回代**：前代 $L\mathbf c=\mathbf b$ 得 $c_1=4$、$2c_1+c_2=9\Rightarrow c_2=1$、$c_1+c_3=5\Rightarrow c_3=1$，即 $\mathbf c=(4,1,1)$，与阶梯形那张表右端一致；再回代 $U\mathbf x=\mathbf c$ 得 $z=1$、$y=2$、$x=1$，同例 1。
:::

## 这一页带走三句话

1. 方程组可以只抄系数和右端写成一张表；三种行变换都能倒回去，解集不变，操作时整行一起做。
2. 消元就是把表削成阶梯形：每列找一个主元，用乘子把下方削成 0；再从最后一行往上，每步只解一个未知数。
3. 判解顺序：有 $0=k$ 就无解；没有矛盾行时，空列带来自由取值，无穷多解；每列都有主元才唯一。乘子存进 $L$ 就是 $A=LU$。

::: warning 本页最容易混的三处
- 只削系数、忘了右端。整行一起变，右端不动就解错。
- 把 $0=0$ 当成无解。它只说明这行多余，不是矛盾；但也不能只凭它就说是无穷多——还得看有没有 $0=k$、有没有空列。
- 主元为 0 还硬除。这一列主元是 0 时，先和下面某行换一换，再继续消。
:::

下一站是[04 · 向量空间与四大子空间](./04-subspaces.md)：这一页数出来的主元个数、以及那些能让未知数自由取值的列，下一章会换一个角度重新讲一遍。
