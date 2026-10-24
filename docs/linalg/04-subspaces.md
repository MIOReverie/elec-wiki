---
title: 04 · 向量空间与四大子空间
description: 向量空间公理一句带过、子空间判定、列空间（像空间）与零空间、基与维数、秩等于主元数等于像空间维数、秩-零化度定理，以及行空间与左零空间构成的四大子空间全景。
---

# 04 · 向量空间与四大子空间

<Meta time="45 min" level="核心" note="最容易错在把零空间当成『只有零向量』，以及以为秩等于行数或列数——秩是像空间的维数，等于主元个数，与矩阵是几行几列没有必然相等关系" />

**这一页要解决什么**：前几页把矩阵当成了「把箭头掰到新位置的变换」，但你只看到单个箭头被送去了哪里。这一页问的是整体：矩阵 A 这张变换，总共能把输入空间压成什么形状？又有哪些箭头会被它压成零向量？读完你应该能对任意矩阵回答四个问题——列空间几维、零空间几维、秩是多少、两者加起来为什么一定等于列数 n，并且能把「求零空间基」「求秩」完整算下来。

::: tip 读这页之前
- **需要会**：向量、线性组合与张成（[01 · 向量、线性组合与张成](01-vectors.md)）；矩阵 = 线性变换、列是基向量的像（[02 · 矩阵与线性变换](02-matrices.md)）；高斯消元与主元（[03 · 高斯消元与线性方程组](03-elimination.md)）。
- **这一页用到的符号**：$A$（$m\times n$ 矩阵）、$\mathbf x$（$n$ 维输入向量）、$A\mathbf x=\mathbf b$、$\mathbf 0$（零向量）、$C(A)$（列空间）、$N(A)$（零空间）、$\dim$（维数）、$\operatorname{rank}$（秩）、$\mathbb R^n$（$n$ 维实坐标空间）。
- **先建立的直觉**：矩阵 A 是一台「压路机」，把输入空间里每一个箭头 $\mathbf x$ 送到新位置 $A\mathbf x$。本页只关心两件事——压路机能压出哪些位置（列空间），以及哪些箭头会被压成零向量（零空间）。
:::

拿一个最简单的压路机 $A=\begin{bmatrix}1&1\\0&0\end{bmatrix}$：它把平面上每个箭头 $\mathbf x=(x,y)$ 都送到 $(x+y,\ 0)$，也就是把整个平面**拍扁到 x 轴上**。现在问两个问题。第一，这台机器总共能扫出哪些位置？答案是只有 x 轴这一条线——平面上 $y\ne 0$ 的点它一个都到不了。第二，哪些箭头会被它压成零向量？答案是满足 $x+y=0$ 的所有箭头，也就是那条斜率 $-1$ 的对角线。第一个问题的答案叫**列空间**，第二个问题的答案叫**零空间**。这一页就讲这两个空间，以及它们和秩、维数怎么挂钩。

## 结论先行

1. 列空间 $C(A)$ 是 A 的列向量张成的空间，也是 A 作为线性变换「能扫到的所有位置」——它的维数就是秩。
2. 零空间 $N(A)$ 是齐次方程 $A\mathbf x=\mathbf 0$ 的全部解，是「被 A 压到原点 0 的所有箭头」——它的维数叫零化度。
3. 子空间的判据只有三条：含零向量、对加法封闭、对数乘封闭（后两条其实推出第一条，但三条一起查最稳）。
4. 秩 = 非零主元个数 = 列空间维数 = 行空间维数。
5. 秩-零化度定理：$\dim C(A)+\dim N(A)=n$（$n$ 是列数）——列空间与零空间把输入空间的维度瓜分干净，一个都不丢。

::: tip 一句话抓住本质，后面全是它的展开

- **列空间 = A 能扫出的所有位置**（输出端活下来的维度）。
- **零空间 = 被 A 压到 0 的所有箭头**（输入端被压没的维度）。
- **秩 = 活下来的维度数**，**零化度 = 压没的维度数**，两者相加等于输入端总维数 $n$。

:::

## 一、向量空间：公理一句带过

这一节只回答一个问题：为什么值得给「向量空间」单独立一个总名称，而不是把所有东西都直接叫 $\mathbb R^n$。

**向量空间**（vector space）是一个集合 $V$，上面定义了两个运算——**加法**（两个元素相加结果还在 $V$ 里）和**数乘**（一个元素乘一个实数结果还在 $V$ 里）——并且这两种运算满足八条公理：有零元、每个元素有负元、加法可交换可结合、数乘对加法和实数乘法有分配律等等。这八条不必背，它们保证的是同一件事：**这个集合里的元素可以像普通向量一样加加减减、伸缩缩放，而且永远算不到集合外面去**。几何上，向量空间就是「过原点、能随意拉伸相加、封闭」的一块区域。

最熟的例子是 $\mathbb R^2$（平面上全部箭头）和 $\mathbb R^3$（空间里全部箭头）。但向量空间不一定非得是箭头：全体 $2\times 2$ 矩阵按矩阵加法与数乘也构成一个向量空间，全体多项式按多项式加法与数乘同样构成一个。只要把「加」和「乘数」定义好、公理满足，它就是向量空间。本页只关心 $\mathbb R^n$ 的子集。

有了总名称，才能说清「A 扫出的位置」和「被 A 压扁的箭头」这两团东西到底是什么。下一节先看一类最重要的子集：子空间。

## 二、子空间：三条检验就够了

这一节只回答一个问题：怎么判断 $\mathbb R^n$ 里的一个子集是不是自成一个向量空间。

**子空间**（subspace）是向量空间 $V$ 的一个非空子集 $W$，它**自己**在同样的加法与数乘下也构成一个向量空间。换句话说，子空间是一块「关起门来自给自足」的区域。

判定一个子集是不是子空间，不用去验八条公理，只要验三条：

1. **含零向量**：$\mathbf 0\in W$。
2. **加法封闭**：若 $\mathbf u,\mathbf v\in W$，则 $\mathbf u+\mathbf v\in W$。
3. **数乘封闭**：若 $\mathbf u\in W$、$c$ 是任意实数，则 $c\mathbf u\in W$。

严格说后两条已经蕴含第一条——取 $c=0$ 就得到零向量——但三条一起记最不容易漏。

几何对应一目了然：在 $\mathbb R^3$ 里，**过原点的直线和过原点的平面都是子空间；不过原点的直线和平面都不是子空间**，因为它不含零向量，第一条就过不去。

<FigBox title="过原点才算子空间" kind="几何" note="左：过原点的直线，含零向量、加法和数乘封闭，是子空间。右：不过原点的直线，不含零向量，两个点相加会跑到直线外，不是子空间。判据第一条『含零向量』就把后者一票否决。">

<svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="40" y1="90" x2="180" y2="90" stroke="var(--vp-c-text-3)"/>
  <line x1="110" y1="150" x2="110" y2="30" stroke="var(--vp-c-text-3)"/>
  <line x1="55" y1="120" x2="165" y2="60" stroke="#16a34a" stroke-width="2.4"/>
  <circle cx="110" cy="90" r="3.5" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="110" y="168" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">过原点：是子空间</text>
  <line x1="250" y1="90" x2="390" y2="90" stroke="var(--vp-c-text-3)"/>
  <line x1="320" y1="150" x2="320" y2="30" stroke="var(--vp-c-text-3)"/>
  <line x1="250" y1="80" x2="390" y2="30" stroke="#ef4444" stroke-width="2.4"/>
  <circle cx="320" cy="90" r="3.5" fill="var(--vp-c-text-3)" stroke="none"/>
  <text x="320" y="168" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">不过原点：不是子空间</text>
</svg>

</FigBox>

为什么这一条这么重要？因为列空间和零空间都是子空间，而判断它们的维数时，要反复用「含零向量 + 封闭」这两条性质。下面看第一个主角：列空间。

## 三、列空间：A 能扫出的所有位置

这一节只回答一个问题：给定矩阵 $A$，所有可能的输出 $A\mathbf x$ 铺满了怎样的一块区域。

**列空间**（column space），记作 $C(A)$，是 $A$ 的各列向量所有线性组合构成的集合。因为 $A\mathbf x$ 正好是把 $A$ 的各列按 $\mathbf x$ 的分量做线性组合：

$$
A\mathbf x=\begin{bmatrix} | & & | \\ \mathbf a_1 & \cdots & \mathbf a_n \\ | & & | \end{bmatrix}\begin{bmatrix}x_1\\ \vdots\\ x_n\end{bmatrix}=x_1\mathbf a_1+\cdots+x_n\mathbf a_n
$$

所以列空间 = 列向量张成的空间 = $A$ 的**像**（image，也叫值域）。几何上它回答开头的问题：把输入空间里**所有**的 $\mathbf x$ 都喂给 $A$，扫出来的所有位置，就是 $C(A)$。

一句最顺口的话：**列空间是 A 能扫出的所有位置。**

它永远是 $\mathbb R^m$ 的子空间（$m$ 是 $A$ 的行数）：零向量一定在（取 $\mathbf x=\mathbf 0$ 就行），而且两个输出的和还是输出、输出的数乘还是输出。

对 $A=\begin{bmatrix}1&1\\0&0\end{bmatrix}$，列空间是 $\operatorname{span}\{(1,0)\}$，也就是 x 轴——平面上其余位置这台压路机一个都到不了。列空间的孪生兄弟是零空间，下一节的图把两者并排画出来。

## 四、零空间：被 A 压到 0 的所有箭头

这一节只回答一个问题：$A\mathbf x=\mathbf 0$ 的解集长什么样，为什么它也配叫「空间」。

**零空间**（null space），记作 $N(A)$，是齐次方程 $A\mathbf x=\mathbf 0$ 的**全部解**构成的集合：

$$
N(A)=\{\mathbf x\in\mathbb R^n:A\mathbf x=\mathbf 0\}
$$

几何上：它是所有**被 A 压到原点 0 的箭头**。任何一个 $\mathbf x\in N(A)$，喂给这台压路机，出来的都是零向量。

零空间永远是 $\mathbb R^n$ 的子空间（$n$ 是 $A$ 的**列数**，也是输入向量的维数）。为什么是子空间？它含零向量（$\mathbf x=\mathbf 0$ 是解），而且若 $A\mathbf u=\mathbf 0$、$A\mathbf v=\mathbf 0$，则 $A(\mathbf u+\mathbf v)=A\mathbf u+A\mathbf v=\mathbf 0$、$A(c\mathbf u)=cA\mathbf u=\mathbf 0$——加法和数乘都封闭。这正是矩阵乘法线性的直接结果。

<FigBox title="列空间 vs 零空间" kind="几何" note="左：变换前，零空间是那条斜率 −1 的对角线（x+y=0）。右：变换后整个平面被拍扁到 x 轴（列空间），对角线上每个箭头都被压到原点；i 与 j 两个基向量都落到 (1,0)。">

<svg viewBox="0 0 660 250" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="165" y="22" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)" stroke="none">变换前（ℝ²）</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1">
    <line x1="97" y1="62" x2="97" y2="198"/><line x1="131" y1="62" x2="131" y2="198"/>
    <line x1="165" y1="62" x2="165" y2="198"/><line x1="199" y1="62" x2="199" y2="198"/><line x1="233" y1="62" x2="233" y2="198"/>
    <line x1="97" y1="62" x2="233" y2="62"/><line x1="97" y1="96" x2="233" y2="96"/>
    <line x1="97" y1="130" x2="233" y2="130"/><line x1="97" y1="164" x2="233" y2="164"/><line x1="97" y1="198" x2="233" y2="198"/>
  </g>
  <line x1="97" y1="130" x2="233" y2="130" stroke="var(--vp-c-text-3)"/>
  <line x1="165" y1="62" x2="165" y2="198" stroke="var(--vp-c-text-3)"/>
  <line x1="165" y1="130" x2="199" y2="130" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M199 130 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="206" y="146" font-size="12" fill="var(--vp-c-text-1)" stroke="none">i</text>
  <line x1="165" y1="130" x2="165" y2="96" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M165 96 l-3 8 l6 0 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="174" y="92" font-size="12" fill="var(--vp-c-text-1)" stroke="none">j</text>
  <line x1="111" y1="76" x2="219" y2="184" stroke="#ef4444" stroke-width="2.4"/>
  <text x="224" y="178" font-size="11.5" fill="#ef4444" stroke="none">零空间 x+y=0</text>
  <text x="485" y="22" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)" stroke="none">变换后（A 的像）</text>
  <line x1="417" y1="130" x2="553" y2="130" stroke="#3b82f6" stroke-width="3"/>
  <line x1="485" y1="70" x2="485" y2="190" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="485" y1="130" x2="519" y2="130" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M519 130 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="512" y="150" font-size="11" fill="var(--vp-c-text-1)" stroke="none">i、j 都落到 (1,0)</text>
  <circle cx="485" cy="130" r="4" fill="#ef4444" stroke="none"/>
  <text x="485" y="212" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">零空间箭头全被压到这里</text>
  <text x="553" y="118" text-anchor="end" font-size="11.5" fill="#3b82f6" stroke="none">列空间 = x 轴</text>
</svg>

</FigBox>

看图能读出什么：**列空间是变换后还活着的那条线，零空间是变换后被压没了的那条线**。两者的维数相加，后面会证明恰好等于输入空间的维数 $n$。而「零空间是几维」这件事，就是秩-零化度定理的一半。下一节先补工具：怎么度量一个空间的大小。

## 五、基与维数：生成又要独立

这一节只回答一个问题：怎么数一个向量空间有多大。

**基**（basis）是一组向量，满足两个条件：**能张成整个空间**（空间里任何向量都能写成它们的线性组合），而且**线性无关**（组里没有一个能由其余几个表示出来）。基就是「不多不少、恰好够用」的那一组生成元——少一个就张不满，多一个就冗余。（张成与线性无关的定义见[01 · 向量、线性组合与张成](01-vectors.md)。）

**维数**（dimension），记作 $\dim$，就是基里向量的个数。这个数不随你选哪组基而变：一个空间里任何两组基，个数都相等。所以「维数」是空间本身的属性，不是「某组向量」的属性。

标准例子：$\mathbb R^2$ 的维数是 2（标准基 $\mathbf i,\mathbf j$，或者任意两个不共线的向量都能当基）；$\mathbb R^3$ 的维数是 3。只含零向量的空间 $\{\mathbf 0\}$ 维数规定为 0。

给 $A=\begin{bmatrix}1&2&3\\2&4&6\end{bmatrix}$ 求零空间基时就会用到这套说法：先求出一组「生成零空间、又彼此独立」的向量，数一数个数就是零空间的维数。而列空间的维数也有专门的名字，就是下一节的秩。

## 六、秩：主元数 = 像空间维数

这一节只回答一个问题：列空间到底几维，以及怎么不靠肉眼、光靠消元把它算出来。

**秩**（rank），记作 $\operatorname{rank}(A)$，是 $A$ 的列空间的维数，也就是 $A$ 的线性无关列向量的个数：

$$
\operatorname{rank}(A)=\dim C(A)
$$

关键结论：**秩 = 主元数**。把 $A$ 用高斯消元化到行阶梯形，非零主元的个数就是秩。为什么？因为行变换**不改变列之间的线性相关关系**：原来「第 3 列 = 第 1 列 + 第 2 列」这种关系，消元后依然成立，反过来也成立。所以数「哪些列独立」这件事，看阶梯形里「哪些列有主元」就够了，主元列对应的原矩阵列就是列空间的一组基。

于是下面四条是同一个数：

1. 秩 = 非零主元个数；
2. 秩 = 线性无关列的个数；
3. 秩 = 列空间（像空间）的维数；
4. 秩 = 行空间（$C(A^T)$）的维数，即线性无关行的个数——第八节补全。

对 $A=\begin{bmatrix}1&1\\0&0\end{bmatrix}$：阶梯形就是它自己，主元只有第 1 行的 1，秩 = 1，列空间是 1 维的直线，与图一致。

算秩是例 2 的主角。但只有秩还不够：秩只告诉我们「输出能铺满几维」，零空间「被压没了几维」还要另一个数。下一节把两者合起来。

## 七、秩-零化度定理：两半拼成 n

这一节只回答一个问题：输入空间 $\mathbb R^n$ 被 A 分成了怎样的两半。

**秩-零化度定理**（rank-nullity theorem）：

$$
\dim C(A)+\dim N(A)=n
$$

其中 $n$ 是 $A$ 的**列数**（输入空间的维数）。等号左边第一项是列空间（像）的维数，第二项是零空间（核）的维数，所以它常写成：

$$
\operatorname{rank}(A)+\operatorname{nullity}(A)=n
$$

这里的 $\operatorname{nullity}$ 读作**零化度**，就是零空间的维数。

几何解释最漂亮：把 $\mathbb R^n$ 想成一块 $n$ 维的输入大陆，A 这张压路机把它压成一块 $\dim C(A)$ 维的输出大陆，而**被压没的那部分维度**正好是 $\dim N(A)$。压出来的维数 + 压没的维数 = 原来的总维数 $n$。一个维度都不会凭空消失，只会要么变成输出的维数，要么变成零空间的维数。

对 $A=\begin{bmatrix}1&1\\0&0\end{bmatrix}$：$\dim C(A)=1$，$\dim N(A)=1$，$1+1=2=n$，吻合。例 3 会用消元完整走一遍这条定理。

这是全页最重要的一条公式。第八节把最后两个子空间补上，凑成四大子空间的全景图。

## 八、四大子空间全景：补上后两个

这一节只回答一个问题：除了列空间和零空间，还有哪两个子空间，四者怎么摆成一张图。

把 $A$（$m\times n$）转置一下，$A^T$ 也有自己的列空间和零空间，它们就是剩下的两个：

- **行空间** $C(A^T)$：$A$ 的各行张成的空间，是 $\mathbb R^n$ 的子空间，维数也等于 $\operatorname{rank}(A)$（行秩 = 列秩）。
- **左零空间** $N(A^T)$：满足 $A^T\mathbf y=\mathbf 0$ 的 $\mathbf y$，等价于 $\mathbf y^T A=\mathbf 0$——零向量乘在 $A$ 的左边，所以叫「左」零空间。它是 $\mathbb R^m$ 的子空间，维数是 $m-\operatorname{rank}(A)$。

四者的维数一张表记全：

| 子空间 | 记号 | 生活在 | 维数 |
| --- | --- | --- | --- |
| 列空间（像） | $C(A)$ | $\mathbb R^m$ | $r=\operatorname{rank}(A)$ |
| 零空间（核） | $N(A)$ | $\mathbb R^n$ | $n-r$ |
| 行空间 | $C(A^T)$ | $\mathbb R^n$ | $r$ |
| 左零空间 | $N(A^T)$ | $\mathbb R^m$ | $m-r$ |

一句话全景：**列空间和左零空间住在输出空间 $\mathbb R^m$，零空间和行空间住在输入空间 $\mathbb R^n$；在输入端，行空间 + 零空间 = n；在输出端，列空间 + 左零空间 = m**。本页重点在 $C(A)$ 与 $N(A)$，$C(A^T)$ 与 $N(A^T)$ 到 06、07 章用正交与投影时再展开。

工具齐了，接下来用三道例题把「求零空间基」和「求秩」各走一遍。

## 例题

三道题按难度排：例 1 求零空间的基（两个自由变量），例 2 用消元求秩与列空间的基，例 3 把两者合起来验证秩-零化度定理。每题先问「该求哪个空间」。

::: tip 例 1 · 求零空间的基 {#ex-null-basis}
**题目**：$A=\begin{bmatrix}1&2&3\\2&4&6\end{bmatrix}$。求零空间 $N(A)$ 的一组基和它的维数。

<FigBox title="例 1：A 把 R³ 压成一条直线，零空间是一个平面" kind="几何" note="输入是三维空间，输出只有一维（列空间是 R² 里的直线，秩 1）。被压到原点的所有箭头构成一个过原点的平面（零空间，维数 2）。维数关系 2+1=3。" >

<svg viewBox="0 0 560 210" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <polygon points="90,130 150,140 140,190 80,180" fill="#ef4444" fill-opacity="0.12" stroke="#ef4444" stroke-width="1.4"/>
  <line x1="90" y1="130" x2="180" y2="152" stroke="var(--vp-c-text-3)"/>
  <line x1="90" y1="130" x2="60" y2="162" stroke="var(--vp-c-text-3)"/>
  <line x1="90" y1="130" x2="90" y2="40" stroke="var(--vp-c-text-3)"/>
  <circle cx="90" cy="130" r="3" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="150" y="166" text-anchor="middle" font-size="11" fill="#ef4444" stroke="none">零空间（过原点的平面，维 2）</text>
  <text x="132" y="42" text-anchor="middle" font-size="12" fill="var(--vp-c-text-1)" stroke="none">ℝ³</text>
  <line x1="205" y1="102" x2="298" y2="102" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M298 102 l-9 -3.2 l0 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="251" y="90" text-anchor="middle" font-size="13" font-weight="700" fill="var(--vp-c-text-1)" stroke="none">A</text>
  <line x1="330" y1="140" x2="500" y2="140" stroke="var(--vp-c-text-3)"/>
  <line x1="415" y1="185" x2="415" y2="55" stroke="var(--vp-c-text-3)"/>
  <line x1="330" y1="140" x2="500" y2="140" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="415" cy="140" r="3" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="415" y="202" text-anchor="middle" font-size="11" fill="#3b82f6" stroke="none">列空间（直线，维 1）</text>
  <text x="500" y="60" text-anchor="end" font-size="12" fill="var(--vp-c-text-1)" stroke="none">ℝ²</text>
</svg>

</FigBox>

**先想什么**：$A$ 是 $2\times 3$，输入 $\mathbf x$ 是 3 维，输出是 2 维。两行方程、三个未知数，解集一般不止零向量——零空间多半有正维数。*（列数减秩就是零空间维数，先预估一下不会懵。）*

**第一步，列齐次方程。** $A\mathbf x=\mathbf 0$ 展开：

$$
\begin{aligned}
x_1+2x_2+3x_3&=0\\
2x_1+4x_2+6x_3&=0
\end{aligned}
$$

第二行是第一行的两倍，冗余，真正独立的只有一条：$x_1+2x_2+3x_3=0$。

**第二步，分主元变量与自由变量。** 矩阵已经是阶梯形（主元是第 1 行第 1 列的 1，第 2 行全零）。所以 $x_1$ 是主元变量，$x_2,x_3$ 是自由变量（可以随便取）。解出：

$$
x_1=-2x_2-3x_3
$$

**第三步，写通解，拆出基。** 让自由变量各取一组值：先取 $(x_2,x_3)=(1,0)$，再取 $(0,1)$：

$$
\mathbf x=x_2\begin{bmatrix}-2\\1\\0\end{bmatrix}+x_3\begin{bmatrix}-3\\0\\1\end{bmatrix}
$$

所以零空间的一组基是 $\mathbf v_1=(-2,1,0)$ 与 $\mathbf v_2=(-3,0,1)$，维数 $\dim N(A)=2$。

**验算**：$A\mathbf v_1=\begin{bmatrix}1&2&3\\2&4&6\end{bmatrix}\begin{bmatrix}-2\\1\\0\end{bmatrix}=\begin{bmatrix}-2+2+0\\-4+4+0\end{bmatrix}=\begin{bmatrix}0\\0\end{bmatrix}$ ✓；$A\mathbf v_2=\begin{bmatrix}-3+0+3\\-6+0+6\end{bmatrix}=\begin{bmatrix}0\\0\end{bmatrix}$ ✓。（数值已用 node 验算。）
:::

::: tip 例 2 · 用消元求秩 {#ex-rank}
**题目**：$A=\begin{bmatrix}1&2&3\\2&4&6\\1&1&2\end{bmatrix}$。求 $\operatorname{rank}(A)$ 与列空间的一组基。

<FigBox title="例 2：秩 2，列空间是 R³ 里的一个平面" kind="几何" note="三个列向量里 c₃ = c₁ + c₂，只有两个独立。列空间是 c₁、c₂ 张成的过原点平面（维数 2），秩 = 2；c₃ 是这个平行四边形的一条对角线。" >

<svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="120" y1="140" x2="260" y2="150" stroke="var(--vp-c-text-3)"/>
  <line x1="120" y1="140" x2="60" y2="175" stroke="var(--vp-c-text-3)"/>
  <line x1="120" y1="140" x2="120" y2="45" stroke="var(--vp-c-text-3)"/>
  <polygon points="120,140 250,110 280,155 150,185" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-width="1.2"/>
  <line x1="120" y1="140" x2="250" y2="110" stroke="#3b82f6" stroke-width="2.2"/>
  <path d="M250 110 l-8 -3 l0 6 Z" fill="#3b82f6" stroke="none"/>
  <line x1="120" y1="140" x2="150" y2="185" stroke="#3b82f6" stroke-width="2.2"/>
  <path d="M150 185 l-1 8.4 l-6.2 -5.8 Z" fill="#3b82f6" stroke="none"/>
  <line x1="120" y1="140" x2="280" y2="155" stroke="var(--vp-c-text-1)" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M280 155 l-8.2 -2 l1.8 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <circle cx="120" cy="140" r="3" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="262" y="108" font-size="12" fill="#3b82f6" stroke="none">c₁</text>
  <text x="142" y="202" font-size="12" fill="#3b82f6" stroke="none">c₂</text>
  <text x="290" y="158" font-size="12" fill="var(--vp-c-text-1)" stroke="none">c₃ = c₁ + c₂</text>
  <text x="120" y="216" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)" stroke="none">列空间 = 过原点的平面（维 2）</text>
</svg>

</FigBox>

**先想什么**：数秩就是数「线性无关的列有几个」。三个列向量 $\mathbf c_1=(1,2,1)$、$\mathbf c_2=(2,4,1)$、$\mathbf c_3=(3,6,2)$，肉眼能看出 $\mathbf c_3=\mathbf c_1+\mathbf c_2$，所以最多两个独立。但肉眼不可靠，用消元给出确定答案。

**第一步，化行阶梯形。** 对 $A$ 做行变换（只动行，列之间的线性关系不变）：

$$
\begin{bmatrix}1&2&3\\2&4&6\\1&1&2\end{bmatrix}\xrightarrow{R_2-2R_1}\begin{bmatrix}1&2&3\\0&0&0\\1&1&2\end{bmatrix}\xrightarrow{R_3-R_1}\begin{bmatrix}1&2&3\\0&0&0\\0&-1&-1\end{bmatrix}
$$

交换第 2、3 行，并把第 2 行除以 $-1$，得到行阶梯形：

$$
\begin{bmatrix}1&2&3\\0&1&1\\0&0&0\end{bmatrix}
$$

**第二步，数主元。** 主元在第 1 列与第 2 列，共 2 个，所以 $\operatorname{rank}(A)=2$。

**第三步，列空间的一组基。** 主元列对应的**原矩阵**列：$\mathbf c_1=(1,2,1)$ 与 $\mathbf c_2=(2,4,1)$。它们线性无关，构成 $C(A)$ 的一组基，$\dim C(A)=2$。而 $\mathbf c_3=\mathbf c_1+\mathbf c_2=(3,6,2)$ 确实落在 $\mathbf c_1,\mathbf c_2$ 张成的平面里。

**验算**：node 算出的行最简形是 $\begin{bmatrix}1&0&1\\0&1&1\\0&0&0\end{bmatrix}$，与手推一致，主元 2 个 ✓。
:::

::: tip 例 3 · 秩-零化度定理的验证 {#ex-rank-nullity}
**题目**：接例 2 的 $A$，求零空间的维数，验证 $\dim C(A)+\dim N(A)=3$。

**先想什么**：例 2 已经得到 $\operatorname{rank}(A)=2$，而 $n=3$，按定理零空间维数应该是 $3-2=1$。现在把它真算出来，看是不是一条线。

**第一步，解 $A\mathbf x=\mathbf 0$。** 用例 2 的行阶梯形（与原方程组同解）：

$$
\begin{bmatrix}1&2&3\\0&1&1\\0&0&0\end{bmatrix}\begin{bmatrix}x_1\\x_2\\x_3\end{bmatrix}=\begin{bmatrix}0\\0\\0\end{bmatrix}
$$

即 $x_2+x_3=0$ 与 $x_1+2x_2+3x_3=0$。由第一式 $x_2=-x_3$，代入第二式得 $x_1+2(-x_3)+3x_3=x_1+x_3=0$，故 $x_1=-x_3$。

**第二步，写通解。** $\mathbf x=x_3(-1,-1,1)$，零空间是一维，基是 $\mathbf v=(-1,-1,1)$。

**第三步，验证定理。**

$$
\dim C(A)+\dim N(A)=2+1=3=n
$$

**验算**：$A\mathbf v=\begin{bmatrix}1&2&3\\2&4&6\\1&1&2\end{bmatrix}\begin{bmatrix}-1\\-1\\1\end{bmatrix}=\begin{bmatrix}-1-2+3\\-2-4+6\\-1-1+2\end{bmatrix}=\begin{bmatrix}0\\0\\0\end{bmatrix}$ ✓。（node 验算通过。）
:::

三道题做完，再用一份清单把这一页的坑排一遍。

## 易错清单

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. **把零空间当成「只有零向量」** → 漏掉无穷多解，秩-零化度定理对不上 → 零空间是齐次方程的全部解；当且仅当 A 的列线性无关时才只有零向量。
2. **以为秩等于行数或列数** → 把「满秩」当成默认 → 秩 = 主元数 = 列空间维数，只在列满秩时才等于列数，只在行满秩时才等于行数。
3. **数秩时看阶梯形里「哪些列」而不是「哪些主元列」** → 拿阶梯形的列当列空间基 → 必须回原矩阵取主元列对应的列，消元改变的是数值不是列向量本身。
4. **忘了先验「含零向量」就判断子空间** → 把不过原点的直线/平面当成子空间 → 子空间第一条就是含零向量，一票否决。
5. **把列空间和零空间的「生活空间」搞混** → 维数公式 $m$、$n$ 用反 → 列空间住在 $\mathbb R^m$（行数），零空间住在 $\mathbb R^n$（列数），公式是 $\dim C(A)+\dim N(A)=n$。
6. **自由变量取成了主元变量** → 基向量不独立或张不满 → 只有主元列定主元变量，其余都是自由变量，自由变量逐个取 1、其余取 0。

## 自检

1. $A$ 是 $3\times 5$ 矩阵，秩为 2。列空间和零空间各是几维？各住在 $\mathbb R^m$ 还是 $\mathbb R^n$？
2. 判断：平面 $x+y+z=0$ 是不是 $\mathbb R^3$ 的子空间？平面 $x+y+z=1$ 呢？为什么？
3. 一个 $2\times 2$ 矩阵把整个平面压成一条直线。它的秩是多少？零空间是几维？秩-零化度定理给出什么等式？

## 下一步

这一页的秩、零空间、列空间是后面所有章节的公共语言：下一章[05 · 行列式：面积缩放的因子](05-determinant.md)用它们解释「变换到底把面积/体积放大了几倍」，再往后[06 · 特征值、特征向量与对角化](06-eigenvalues.md)找「方向不变、只被拉伸」的特殊向量。
