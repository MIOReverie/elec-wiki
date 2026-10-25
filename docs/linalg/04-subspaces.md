---
title: 04 · 向量空间与四大子空间
description: 从一台把平面拍扁的变换出发：先认出「加法和数乘都关得住」的区域（子空间），再给「能到哪些位置」和「哪些箭头被送成零」分别命名（列空间、零空间），用基与维数把两个空间量出来，最后结算秩与 dim C(A)+dim N(A)=n。
---

# 04 · 向量空间与四大子空间

<Meta time="20 min" level="核心" note="最容易错在把零空间当成「只含零向量的空间」，以及把秩当成「行数或列数」——秩是列空间的维数，只有化成阶梯形数主元才拿到它" />

**这一页要解决什么**：上一页你盯的是一支箭被送到了哪，这一页看整体——这台机器总共能到达哪些位置？哪些箭会被它送成零？两个答案各是一块区域；读完你能把这两块区域的大小亲手算出来，也能说出它们各自住在哪一侧。

::: tip 读之前
- **需要会**：线性组合与线性无关（[第 1 章](01-vectors.md)。一句复习：$c\mathbf v+d\mathbf w$ 就是各取几份再加起来；两支箭成倍数就叫有冗余）；$A\mathbf x$ 是把各列按 $\mathbf x$ 的分量加权再相加（[第 2 章](02-matrices.md)）；消元化成阶梯形、认出主元与自由变量（[第 3 章](03-elimination.md)）。
- **这一页的记号**：$A$ 是 $m\times n$（$m$ 行 $n$ 列）；$C(A)$、$N(A)$、$\operatorname{rank}(A)$、$\dim V$ 分别读作「列空间」「零空间」「秩」「维数」。
:::

第 2 章把矩阵看成一整台机器：给一支箭 $\mathbf x$，吐出 $A\mathbf x$。这一页不追一支箭，看整张平面发生了什么。拿最简单的 $A_0=\begin{bmatrix}1&1\\0&0\end{bmatrix}$ 试，它第一行算 $x+y$，第二行永远是 $0$：

$$
A_0\begin{bmatrix}x\\y\end{bmatrix}=\begin{bmatrix}x+y\\0\end{bmatrix}
$$

于是 $(1,0)$ 落到 $(1,0)$，$(0,1)$ 也落到 $(1,0)$，$(3,2)$ 落到 $(5,0)$——整张平面被拍到了 $x$ 轴上。这台机器身上有两件事值得问，各要一个名字：它能到达的位置一共多大一块？它把哪些箭弄丢了？两块区域各有大小，稍后我们会学怎样计算。

## 一、先把「自己关得住的那块区域」认出来

在平面上取一条直线试试。过原点的 $y=2x$：线上任取两支箭相加，和还在这条线上；乘任意实数也还在线上；原点自己也在线上（乘个 $0$ 就得到）。怎么折腾都出不去。把它往上平移一格得 $y=2x+1$，它不含原点（$0=2\cdot0+1$ 不成立），线上两点相加也会跑到线外。

这种「加法和数乘都关得住」的区域需要一个名字：**子空间**。判断一个集合 $W$ 是不是子空间，查三条：

1. $\mathbf 0\in W$：原点在里面；
2. 若 $\mathbf u,\mathbf v\in W$，则 $\mathbf u+\mathbf v\in W$：怎么加都还在里面；
3. 若 $\mathbf u\in W$、$c$ 是实数，则 $c\mathbf u\in W$：怎么伸缩都还在里面。

三条一起查最省心；课本里「向量空间」的八条公理，本页一条用不到。

<FigBox title="三条检验怎么用：过原点的直线过关，平移过的不过关" kind="几何" note="输入：两个候选集合 · 操作：逐条查含零、加法封闭、数乘封闭 · 结果：一个三条全过，一个第一条就被拦下">
<svg viewBox="0 0 680 246" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="140" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：两个候选集合</text>
  <text x="372" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">操作：逐条查三条</text>
  <text x="580" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果</text>
  <line x1="258" y1="32" x2="258" y2="232" stroke="var(--vp-c-divider)" stroke-dasharray="4 4"/>
  <line x1="486" y1="32" x2="486" y2="232" stroke="var(--vp-c-divider)" stroke-dasharray="4 4"/>
  <line x1="60" y1="110" x2="230" y2="110" stroke="var(--vp-c-text-3)"/>
  <line x1="150" y1="150" x2="150" y2="42" stroke="var(--vp-c-text-3)"/>
  <line x1="115" y1="150" x2="185" y2="70" stroke="#16a34a" stroke-width="2.4"/>
  <circle cx="150" cy="110" r="3.6" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="140" y="126" font-size="11" fill="var(--vp-c-text-2)" stroke="none">0</text>
  <text x="188" y="66" font-size="11.5" fill="#16a34a" stroke="none">过原点</text>
  <text x="276" y="76" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">① 含零 ✓</text>
  <text x="276" y="98" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">② 加法封闭 ✓</text>
  <text x="276" y="120" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">③ 数乘封闭 ✓</text>
  <text x="520" y="98" text-anchor="middle" font-size="13" font-weight="700" fill="#16a34a" stroke="none">是子空间</text>
  <line x1="60" y1="206" x2="230" y2="206" stroke="var(--vp-c-text-3)"/>
  <line x1="150" y1="232" x2="150" y2="146" stroke="var(--vp-c-text-3)"/>
  <line x1="105" y1="216" x2="190" y2="152" stroke="#ef4444" stroke-width="2.4"/>
  <circle cx="150" cy="206" r="3.6" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="158" y="222" font-size="11" fill="var(--vp-c-text-2)" stroke="none">0 不在这条线上</text>
  <text x="196" y="150" font-size="11.5" fill="#ef4444" stroke="none">不过原点</text>
  <text x="276" y="176" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">① 含零 ✗</text>
  <text x="276" y="198" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">② 加法封闭 ✗</text>
  <text x="276" y="220" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">③ 数乘封闭 ✗</text>
  <text x="520" y="198" text-anchor="middle" font-size="13" font-weight="700" fill="#ef4444" stroke="none">不是子空间</text>
</svg>
</FigBox>

回看这两个例子：过原点的直线、过原点的平面都是子空间，不过原点的都不是——**「过原点」正是第 1 条检验在几何里的长相。**

## 二、这台机器总共能到哪些位置

回到 $A_0$。它的两列都是 $(1,0)$，记 $\mathbf c_1=\mathbf c_2=(1,0)$。而 $A_0\mathbf x$ 按第 2 章是把各列按 $\mathbf x$ 的分量加权相加，所以两列重合这件事直接决定了输出：

$$
A_0\begin{bmatrix}x\\y\end{bmatrix}=x\begin{bmatrix}1\\0\end{bmatrix}+y\begin{bmatrix}1\\0\end{bmatrix}=(x+y)\begin{bmatrix}1\\0\end{bmatrix}
$$

读一遍这个式子：$A_0$ 是 $2\times2$，$\mathbf x$ 是 $2$ 个数的一列；等号右边是「取 $x$ 份第 1 列、取 $y$ 份第 2 列，再加起来」。两列都指向 $(1,0)$，加来加去出不了这条线——这就是为什么输出的第二个数永远是 $0$。

第一个问题的答案有了：$A_0$ 所有可能的输出就是两列张成的那条 $x$ 轴。给它一个名字：**列空间** $C(A)$，指的是各列的全部线性组合，也就是这台机器能到达的所有位置。$C(A_0)$ 是 $x$ 轴，一维；平面上其余的位置它一个都到不了。

## 三、哪些箭头被它送成了零

第二个问题：哪些输入会落到原点？解 $A_0\mathbf x=\mathbf 0$，也就是 $x+y=0$。这是一条过原点的直线，方向取 $(1,-1)$（取 $(-1,1)$ 是同一条线）。代进去：$A_0(1,-1)=(0,0)$。

这个集合也有名字：**零空间**，记作 $N(A)$，指的是 $A\mathbf x=\mathbf 0$ 的全部解，也就是「被送成零的那些箭头」的全体。两点必须当场说清：

- 零空间一定含零向量（$\mathbf x=\mathbf 0$ 永远是解），所以它从不空着；只有当各列彼此没有冗余时（第 1 章叫线性无关），它才只剩零向量。
- 它为什么配叫「空间」：若 $A\mathbf u=\mathbf 0$、$A\mathbf v=\mathbf 0$，则 $A(\mathbf u+\mathbf v)=\mathbf 0$、$A(c\mathbf u)=\mathbf 0$，三条检验自动过关。

<FigBox title="A₀ 把整张平面拍到 x 轴上，对角线上的箭头全堆到原点" kind="几何" note="输入：平面上的箭头，标出零空间那条对角线 · 操作：A₀ 把每个箭头送到 (x+y,0)，两支基箭都落到 (1,0) · 结果：输出只剩 x 轴，对角线上所有箭头落在原点（两轴同为每单位 20 像素）">
<svg viewBox="0 0 700 250" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="118" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：平面</text>
  <text x="330" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">操作：A₀</text>
  <text x="560" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果：只剩 x 轴</text>
  <line x1="40" y1="176" x2="216" y2="176" stroke="var(--vp-c-text-3)"/>
  <line x1="110" y1="228" x2="110" y2="76" stroke="var(--vp-c-text-3)"/>
  <line x1="60" y1="226" x2="176" y2="110" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="5 4"/>
  <text x="178" y="106" font-size="11" fill="#ef4444" stroke="none">零空间 x+y=0</text>
  <line x1="110" y1="176" x2="130" y2="176" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M130 176 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="136" y="172" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">i</text>
  <line x1="110" y1="176" x2="110" y2="156" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M110 156 l-3 8 l6 0 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="118" y="152" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">j</text>
  <line x1="110" y1="176" x2="170" y2="136" stroke="var(--vp-c-text-2)" stroke-width="1.8"/>
  <circle cx="170" cy="136" r="3" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="176" y="132" font-size="11" fill="var(--vp-c-text-2)" stroke="none">(3,2)</text>
  <line x1="232" y1="176" x2="286" y2="176" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M286 176 l-8 -3.4 l0 6.8 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="259" y="160" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">(x,y) ↦ (x+y,0)</text>
  <text x="259" y="200" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">i、j 都落到 (1,0)</text>
  <line x1="404" y1="176" x2="640" y2="176" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="404" cy="176" r="4" fill="#ef4444" stroke="none"/>
  <circle cx="424" cy="176" r="3.4" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="424" y="166" text-anchor="middle" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(1,0)</text>
  <text x="404" y="212" font-size="11" fill="#ef4444" stroke="none">零空间里的箭头全堆到这里</text>
  <text x="640" y="164" text-anchor="end" font-size="11.5" fill="#3b82f6" stroke="none">列空间 = x 轴（1 维）</text>
</svg>
</FigBox>

看图能读出两件事：输出侧活下来的只有那条线（列空间），输入侧有一条被压没的对角线（零空间）。这里先保留这个画面，下一节给两块区域的大小一个算法。

## 四、数一数它有多大：基、维数、秩

一条直线里最少要几支箭才能走遍它？一支。一张平面里呢？两支，不许共线。这个「不多不少、恰好够用」的组有个名字：**基**。一组箭是空间 $V$ 的基，要同时满足两条：能张成 $V$（$V$ 里每支箭都能用它们凑出来），且其中没有一支能由其余向量线性组合出来（第 1 章的线性无关）。

**维数**就是一组基里箭的个数，记作 $\dim V$。它与选哪组基无关：平面上拿 $(1,0),(0,1)$ 是一组基，拿 $(3,2),(1,2)$ 也是一组（后者不共线，$c(3,2)+d(1,2)=\mathbf 0$ 只有 $c=d=0$），所以 $\dim\mathbb R^2=2$。

现在把维数对准列空间：$\dim C(A)$ 是「这台机器能到达的位置有几维」，它值一个专门的名字：**秩**，记作 $\operatorname{rank}(A)$。

怎么不靠眼睛把秩算出来？数主元。把 $A$ 化成阶梯形，主元的个数就是秩。理由一句话：行变换只动行，不动列与列之间的凑法——原矩阵里「第 3 列 = 第 1 列 + 第 2 列」这类关系，化完之后依然成立。所以「哪几列真正独立」看主元列就够了。但**列空间的基要回原矩阵去取**那几列：阶梯形里的列已经被行变换改过，不再是原来的列。

$A_0$ 的阶梯形就是它自己，主元只有一个，秩 $1$，与「列空间是 $x$ 轴」对得上。换一台更难看的机器：$A_1=\begin{bmatrix}1&2&3\\2&5&7\\3&7&10\end{bmatrix}$。它的三列 $\mathbf c_1=(1,2,3)$、$\mathbf c_2=(2,5,7)$、$\mathbf c_3=(3,7,10)$ 里，$\mathbf c_3=\mathbf c_1+\mathbf c_2$，所以独立列最多两支，秩最多 $2$。确切数字要消元才定得下来，例 1、例 2 把这台机器算完。

## 五、两笔账加起来正好是输入的维数

先看 $A_0$：列空间 $1$ 维，零空间 $1$ 维，$1+1=2$，而输入是平面上 $2$ 个数的一列。这不是巧合：

$$
\dim C(A)+\dim N(A)=n
$$

读一遍：$n$ 是 $A$ 的列数，也就是输入那一列里数的个数；左边第一项是「能到达的位置有几维」，第二项是「被送成零的方向有几维」。依据只是一条数数：把 $A$ 化成阶梯形后，$n$ 列被分成带主元的和不带主元的两拨——带主元的列有 $\operatorname{rank}(A)$ 个，不带主元的列有 $n-\operatorname{rank}(A)$ 个，两拨加起来还是 $n$；而不带主元的每一列都带来一个自由变量，也就带来一个被送成零的独立方向。所以这两个维数相加只能是 $n$。

对 $A_1$：秩若是 $2$，零空间就是 $3-2=1$ 维（例 2 的回代会核对）。

还有两个名字你迟早遇到，本页只给名字、不算例题：把 $A$ 沿主对角线翻面得到 $A^T$（第 2 章的转置），$A^T$ 也有自己的列空间与零空间。四个放到一张表里：

| 空间 | 记号 | 住在哪一侧 | 维数 |
| --- | --- | --- | --- |
| 列空间 | $C(A)$ | $\mathbb R^m$（输出那一侧） | $r=\operatorname{rank}(A)$ |
| 零空间 | $N(A)$ | $\mathbb R^n$（输入那一侧） | $n-r$ |
| 行空间 | $C(A^T)$ | $\mathbb R^n$ | $r$ |
| 左零空间 | $N(A^T)$ | $\mathbb R^m$ | $m-r$ |

第三行是各行张成的空间，第四行是 $A^T\mathbf y=\mathbf 0$ 的解。这两行认得名字就行，本页后面用不到。盯住前两行的「住在哪一侧」：列空间在输出那一侧、零空间在输入那一侧，这是最容易把 $m$ 和 $n$ 用反的地方。

## 例题

::: tip 例 1 · 求 A₁ 的零空间的基
**题目**：$A_1=\begin{bmatrix}1&2&3\\2&5&7\\3&7&10\end{bmatrix}$，求 $N(A_1)$ 的一组基与它的维数。

**先猜**：$A_1$ 三行三列，但三列里有一支是另两支的和，所以秩最多 $2$，零空间至少有 $3-2=1$ 维。会不会更多？只有算完才知道，先按一条线去算。

**再算**：

1. 解 $A_1\mathbf x=\mathbf 0$，消元只动行：$R_2-2R_1$ 得 $(0,1,1)$，$R_3-3R_1$ 也得 $(0,1,1)$，再 $R_3-R_2$ 得全零行。阶梯形是 $\begin{bmatrix}1&2&3\\0&1&1\\0&0&0\end{bmatrix}$。*（为什么只动行：每一步都能倒回去，解集不变，第 3 章。）*
2. 读回方程：主元在第 1、2 列，所以 $x_1,x_2$ 是主元变量，$x_3$ 是自由变量。第二行给 $x_2+x_3=0$，即 $x_2=-x_3$；代回第一行 $x_1+2x_2+3x_3=0$，得 $x_1=-x_3$。
3. 自由变量取一个好算的值 $x_3=1$：$\mathbf v=(-1,-1,1)$。

<FigBox title="例 1 的阶梯形：两个主元，第三列是自由变量" kind="结构" note="输入：A₁ 的三行三列 · 操作：三次行变换，只动行 · 结果：主元 2 个（秩 2），第 3 列没有主元，对应自由变量 x₃">
<svg viewBox="0 0 660 210" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="112" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入 A₁</text>
  <path d="M56 46 L46 46 L46 168 L56 168" stroke="var(--vp-c-text-3)"/>
  <path d="M168 46 L178 46 L178 168 L168 168" stroke="var(--vp-c-text-3)"/>
  <text x="90" y="76" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="126" y="76" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="160" y="76" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">3</text>
  <text x="90" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="126" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">5</text>
  <text x="160" y="112" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">7</text>
  <text x="90" y="148" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">3</text>
  <text x="126" y="148" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">7</text>
  <text x="160" y="148" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">10</text>
  <line x1="196" y1="106" x2="272" y2="106" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
  <path d="M272 106 l-9 -3.2 l0 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="234" y="92" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">R₂−2R₁</text>
  <text x="234" y="126" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">R₃−3R₁、R₃−R₂</text>
  <text x="430" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果：阶梯形</text>
  <rect x="438" y="44" width="34" height="114" fill="#3b82f6" fill-opacity="0.1" stroke="none"/>
  <path d="M372 46 L362 46 L362 168 L372 168" stroke="var(--vp-c-text-3)"/>
  <path d="M484 46 L494 46 L494 168 L484 168" stroke="var(--vp-c-text-3)"/>
  <circle cx="383" cy="60" r="13" stroke="#3b82f6" stroke-width="1.8"/>
  <circle cx="419" cy="96" r="13" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="383" y="65" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="419" y="65" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">2</text>
  <text x="455" y="65" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">3</text>
  <text x="383" y="101" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="419" y="101" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="455" y="101" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">1</text>
  <text x="383" y="137" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="419" y="137" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="455" y="137" text-anchor="middle" font-size="13" fill="var(--vp-c-text-1)" stroke="none">0</text>
  <text x="455" y="188" text-anchor="middle" font-size="11" fill="#3b82f6" stroke="none">第 3 列无主元 → 自由变量 x₃</text>
  <text x="383" y="188" text-anchor="middle" font-size="11" fill="#3b82f6" stroke="none">主元 2 个</text>
  <text x="540" y="80" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">秩 = 主元数 = 2</text>
  <text x="540" y="104" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">零空间 = 3 − 2 = 1 维</text>
</svg>
</FigBox>

**再回代**：$A_1\mathbf v=(-1-2+3,\,-2-5+7,\,-3-7+10)=(0,0,0)$ ✓。零空间就是这条线，$\dim N(A_1)=1$；秩 $=3-1=2$，与「最多两支独立」的猜测吻合。
:::

::: tip 例 2 · 用同一份阶梯形读出秩和列空间的基
**题目**：接例 1，求 $\operatorname{rank}(A_1)$ 与 $C(A_1)$ 的一组基。

**先猜**：阶梯形有两个主元，所以秩是 $2$；列空间的基应该是主元对应的**原矩阵**那两列，也就是 $\mathbf c_1,\mathbf c_2$。

**再算**：数主元得 $\operatorname{rank}(A_1)=2$；回原矩阵拿第 1、2 列，$\mathbf c_1=(1,2,3)$、$\mathbf c_2=(2,5,7)$；剩下那列 $\mathbf c_3=\mathbf c_1+\mathbf c_2$，落在 $\mathbf c_1,\mathbf c_2$ 张成的平面里，不提供新方向。

<FigBox title="三列里有一支是另两支的和：列空间是三维空间里的一个平面" kind="几何" note="输入：三个列向量 c₁、c₂、c₃ · 操作：把 c₃ 与 c₁+c₂ 比一比 · 结果：c₃ 落在 c₁、c₂ 张成的平面上，独立方向只有两个">
<svg viewBox="0 0 460 240" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="230" y="20" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">三维示意：列空间 = 过原点的平面</text>
  <line x1="120" y1="160" x2="330" y2="184" stroke="var(--vp-c-text-3)"/>
  <line x1="120" y1="160" x2="56" y2="196" stroke="var(--vp-c-text-3)"/>
  <line x1="120" y1="160" x2="120" y2="56" stroke="var(--vp-c-text-3)"/>
  <polygon points="120,160 246,116 276,158 150,202" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1.2"/>
  <line x1="120" y1="160" x2="246" y2="116" stroke="#3b82f6" stroke-width="2.2"/>
  <path d="M246 116 l-9 -2 l1.2 6.4 Z" fill="#3b82f6" stroke="none"/>
  <text x="252" y="110" font-size="12" fill="#3b82f6" stroke="none">c₁</text>
  <line x1="120" y1="160" x2="150" y2="202" stroke="#3b82f6" stroke-width="2.2"/>
  <path d="M150 202 l-1.4 8.4 l-6 -5.6 Z" fill="#3b82f6" stroke="none"/>
  <text x="132" y="220" font-size="12" fill="#3b82f6" stroke="none">c₂</text>
  <line x1="120" y1="160" x2="276" y2="158" stroke="var(--vp-c-text-1)" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M276 158 l-8.4 -2 l1.4 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="284" y="162" font-size="12" fill="var(--vp-c-text-1)" stroke="none">c₃ = c₁ + c₂</text>
  <circle cx="120" cy="160" r="3.4" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="112" y="150" text-anchor="end" font-size="11" fill="var(--vp-c-text-2)" stroke="none">原点</text>
  <text x="286" y="196" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">秩 2，零空间 1 维</text>
</svg>
</FigBox>

**再回代**：$\mathbf c_1,\mathbf c_2$ 不成倍数，所以独立；$\mathbf c_3$ 确实是它俩的和。于是 $C(A_1)$ 是三维空间里过原点的一个平面，$\dim C(A_1)=2$，而 $2+1=3=n$ ✓。
:::

::: tip 例 3 · 这三个集合，哪个是子空间
**题目**：判断 (a) 直线 $y=2x$ 上的全部箭头；(b) 直线 $y=2x+1$ 上的全部箭头；(c) 闭第一象限（含两条坐标轴）里的全部箭头。

**先猜**：(a) 过原点，应该过；(b) 不过原点，大概第一条就被拦；(c) 看着是一整块，可负数乘可能要出事。

**再算**：(a) 含零（$0=2\cdot0$）；两支斜率 2 的箭相加，斜率还是 2；乘任意实数还是斜率 2。三条全过，是子空间。(b) 不含零（$0\ne2\cdot0+1$），第一条就不过，不是子空间。(c) 含零（按「闭第一象限含边界」的约定，原点算在里面），加法也封闭，但数乘不封闭：$(1,1)$ 在里面，$-1\cdot(1,1)=(-1,-1)$ 不在。

**再回代**：给 (b) 补一个具体反例。$(0,1)$ 与 $(1,3)$ 都在 $y=2x+1$ 上（$1=0+1$、$3=2+1$），加起来是 $(1,4)$，而 $4\ne2\cdot1+1=3$，跑出线外 ✓。三个里只有 (a) 是子空间。
:::

## 这一页带走三句话

1. 子空间就是「含原点、加法与数乘都关得住」的一块区域；不过原点的直线、平面都不是。
2. 列空间是这台变换能到达的所有位置，零空间是被它送成零的所有箭头；两者的维数相加等于输入的列数 $n$。
3. 秩 = 主元个数 = 列空间的维数；列空间的基回原矩阵取主元列，零空间的基靠自由变量取 $1$。

::: warning 最容易错的两处
- **以为秩等于行数或列数。** 秩是列空间的维数，只有各列彼此独立时才等于列数；$A_0$ 是两行两列，秩只有 $1$。
- **拿阶梯形的列当列空间的基。** 行变换把列改过了，必须回原矩阵取主元所在的列。
:::

下一站是[第 5 章 · 行列式](05-determinant.md)：它给这台变换配一个数，回答面积被放大了几倍。想按教材章号把「求秩、求基础解系」练成步骤，去经典版第 3、4 章。
