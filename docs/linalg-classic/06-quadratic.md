---
title: 06 · 二次型：把交叉项配成平方
description: 二次型就是二次齐次多项式，写成矩阵时交叉项系数对半分到对称位置；配方法与正交变换法两步化成标准形，惯性定理锁定正负项个数，正定性用顺序主子式全正来判。三道 node 验算例题。
---

# 06 · 二次型：把交叉项配成平方

<Meta time="45 min" level="核心" note="全页只有一句话：二次型矩阵必须写成对称矩阵，交叉项系数对半分；化标准形只有两条路——配方法与正交变换法" />

**这一页对应教材第几章**：对应同济《线性代数》第五章（二次型部分）。前面第五章上半讲的是特征值与对称矩阵的正交对角化，本页把它用到最后一个目标上——把含交叉项的二次多项式「摆正」成只有平方项。

**这一页要解决什么**：你见过 $x_1^2+x_2^2$ 这种只含平方项的式子，也见过 $2x_1x_2$ 这种交叉项，但一看到它们混在一起就不知道该怎么处理。读完这一页，你应该能：把任意二次型写成对称矩阵；用**配方法**和**正交变换法**两种方法把它化成标准形；用惯性定理检查自己没算错；再用**顺序主子式**判断一个二次型是不是正定。三种题型都有固定的操作步骤，照着做即可。

::: tip 读这页之前
- **需要会**：矩阵的转置与乘法、行列式的计算（用来算顺序主子式）、特征值与对称矩阵的正交对角化。前两样是本板块第 2、5 章的内容，最后一键是第五章上半的内容；记不清时点回现代版复习：[02 · 矩阵与线性变换](../linalg/02-matrices.md)、[05 · 行列式](../linalg/05-determinant.md)、[06 · 特征值、特征向量与对角化](../linalg/06-eigenvalues.md)。
- **这一页用到的符号**：$\mathbf x=(x_1,\dots,x_n)^T$ 是列向量，$A$ 是矩阵，$A^T$ 是转置，$Q$ 专指列向量两两正交且单位化的正交矩阵（$Q^T=Q^{-1}$）。二次型统一写成 $\mathbf x^T A\mathbf x$。符号约定见[符号与约定](../guide/notation.md)。
:::

先看一个具体问题。给你一个三元式子 $f=x_1^2+2x_2^2+5x_3^2+2x_1x_2+2x_1x_3+6x_2x_3$，它里面既有平方项、又有交叉项，很难一眼看出它的性质。这一页做的只有一件事：**通过一次可逆的变量替换，把交叉项全部消掉**，让 $f$ 变成只有平方项的简单形状。消掉交叉项有两条路——配方（代数里就会的「配完全平方」）和正交变换（用第五章的特征值）。下面先把「二次型」这个词说准，再给出两条路的完整步骤。

## 结论先行

1. **二次型 = 二次齐次多项式**；写矩阵时**平方项系数放对角线、交叉项系数对半分到对称的两个位置**，这样得到的矩阵必是对称阵。
2. **标准形 = 只含平方项**（交叉项全清零）；**规范形 = 平方项系数只剩 $+1,-1,0$**，比标准形再规范一步。
3. 化标准形两条路：**配方法**（有平方项就配、没有先造）；**正交变换法**（矩阵 → 特征值 → 正交矩阵 $Q$，令 $\mathbf x=Q\mathbf y$）。
4. **惯性定理**：不管用哪种可逆变换化标准形，**正项个数 $p$ 与负项个数 $q$ 永远不变**，标准形可以不一样、但 $p,q$ 不变。
5. **正定判据**：$f=\mathbf x^T A\mathbf x>0$ 对一切非零 $\mathbf x$ 成立，等价于 $A$ 的**所有顺序主子式全大于零**。

## 一、二次型及其矩阵：交叉项系数对半分

这一节的目标，是让你能把手里的二次型一眼翻译成对称矩阵，并且记住那条最容易错的规则——交叉项系数必须对半分。

**二次型**（quadratic form）是 $n$ 个变量 $x_1,\dots,x_n$ 的**二次齐次多项式**：每一项都是二次的，要么是平方项 $a_{ii}x_i^2$，要么是交叉项 $a_{ij}x_ix_j\ (i\neq j)$，不含一次项、也不含常数项。例如 $x_1^2+2x_1x_2+3x_2^2$ 是二次型，而 $x_1^2+x_1+1$ 不是（多了 $x_1$ 和常数 $1$）。

任何二次型都能写成**矩阵形式**：

$$
f = \mathbf x^T A\,\mathbf x = \sum_{i,j} a_{ij}x_ix_j
$$

其中 $\mathbf x=(x_1,\dots,x_n)^T$，$A=(a_{ij})$ 是 $n$ 阶矩阵。关键是 $A$ 要取成**对称矩阵**（symmetric matrix，满足 $A^T=A$）。规则就一条：

- **平方项系数直接放对角线**：$a_{ii}=$ $x_i^2$ 的系数；
- **交叉项系数对半分**：$x_ix_j$ 的系数一半给 $a_{ij}$、一半给 $a_{ji}$。

为什么必须对半分？因为展开 $\mathbf x^T A\mathbf x$ 时，$x_ix_j$ 会出现两次（一次来自 $a_{ij}x_ix_j$、一次来自 $a_{ji}x_jx_i$），合并后系数是 $2a_{ij}$。所以反过来，交叉项系数要除以 $2$ 才是 $a_{ij}$ 和 $a_{ji}$。**二次型矩阵必须写成对称矩阵**，这是全页第一铁律——非对称的「矩阵」根本不能用来表示二次型。

举例：$f=x_1^2+2x_2^2+5x_3^2+2x_1x_2+2x_1x_3+6x_2x_3$。平方项系数 $1,2,5$ 放对角线；$2x_1x_2$ 的系数 $2$ 对半分给 $a_{12}=a_{21}=1$，$2x_1x_3$ 对半分给 $a_{13}=a_{31}=1$，$6x_2x_3$ 对半分给 $a_{23}=a_{32}=3$：

$$
A = \begin{bmatrix} 1 & 1 & 1 \\ 1 & 2 & 3 \\ 1 & 3 & 5 \end{bmatrix}
$$

<FigBox title="二次型写成对称矩阵：对角线放平方项、对称位置对半分" kind="结构" note="对角线上的 1、2、5 分别来自 x₁²、x₂²、x₃² 的系数；蓝绿色格子成对出现、数值相等，是交叉项系数对半分的产物。看图能读出什么：矩阵关于主对角线对称，a₁₂=a₂₁=1、a₁₃=a₃₁=1、a₂₃=a₃₂=3。">
<svg viewBox="0 0 360 230" role="img" aria-label="三元二次型的对称矩阵：对角线放平方项系数 1、2、5，对称位置放交叉项系数对半分的 1、1、3">
<g font-size="16" font-weight="600" text-anchor="middle">
  <rect x="168" y="58" width="38" height="38" rx="6" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
  <text x="187" y="82" fill="var(--vp-c-text-1)">1</text>
  <rect x="206" y="58" width="38" height="38" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16" />
  <text x="225" y="82" fill="var(--vp-c-text-1)">1</text>
  <rect x="244" y="58" width="38" height="38" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16" />
  <text x="263" y="82" fill="var(--vp-c-text-1)">1</text>
  <rect x="168" y="96" width="38" height="38" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16" />
  <text x="187" y="120" fill="var(--vp-c-text-1)">1</text>
  <rect x="206" y="96" width="38" height="38" rx="6" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
  <text x="225" y="120" fill="var(--vp-c-text-1)">2</text>
  <rect x="244" y="96" width="38" height="38" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16" />
  <text x="263" y="120" fill="var(--vp-c-text-1)">3</text>
  <rect x="168" y="134" width="38" height="38" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16" />
  <text x="187" y="158" fill="var(--vp-c-text-1)">1</text>
  <rect x="206" y="134" width="38" height="38" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16" />
  <text x="225" y="158" fill="var(--vp-c-text-1)">3</text>
  <rect x="244" y="134" width="38" height="38" rx="6" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
  <text x="263" y="158" fill="var(--vp-c-text-1)">5</text>
</g>
<text x="150" y="206" font-size="12" fill="var(--vp-c-text-2)">主对角线 = 平方项系数</text>
<rect x="16" y="198" width="14" height="14" rx="3" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1" />
<rect x="212" y="198" width="14" height="14" rx="3" fill="var(--vp-c-brand-2)" opacity="0.16" />
<text x="236" y="210" font-size="12" fill="var(--vp-c-text-2)">对称位置 = 交叉项系数 ÷ 2</text>
</svg>
</FigBox>

把二次型写成矩阵只是第一步；矩阵给了我们一个「抓手」，后面所有操作——配方法也好、正交变换也好——都能说成对矩阵做的事。下面先看我们要把它整理成多简单的形状，那就是标准形。

## 二、标准形与规范形：把交叉项清零

这一节的目标，是说清两个名词——标准形与规范形——的区别，以及怎么从结果里读出一个二次型的关键数字。

**标准形**（canonical form）是**只含平方项**的二次型：

$$
f = d_1y_1^2 + d_2y_2^2 + \cdots + d_ny_n^2
$$

没有 $y_iy_j\ (i\neq j)$ 这种交叉项；系数 $d_i$ 可以是正、负或零（为零的项通常省写）。**规范形**（normal form）再进一步，把每个平方项的系数归一成 $+1$、$-1$ 或 $0$：

$$
f = z_1^2 + \cdots + z_p^2 - z_{p+1}^2 - \cdots - z_r^2
$$

这里 $r$ 是二次型的**秩**（rank，等于标准形里非零系数的个数，也等于矩阵 $A$ 的秩），$p$ 叫**正惯性指数**（positive index of inertia，正项个数），$q=r-p$ 叫**负惯性指数**（negative index of inertia，负项个数）。**惯性指数**这个词就是「标准形里正项、负项各有多少个」。

一句话分清两者：标准形只要「交叉项清零」，系数可以是任意非零数；规范形要「系数也只留符号」，只剩 $+1,-1,0$。比如 $3y_1^2-\frac12y_2^2$ 是标准形但不是规范形，令 $z_1=\sqrt3\,y_1,\ z_2=\frac{1}{\sqrt2}y_2$ 就得到规范形 $z_1^2-z_2^2$。

标准形人人都想要，但问题是**怎么变过去**。下面两节给两条可操作的路：先讲最贴近「配完全平方」的配方法。

## 三、配方法：一次配掉一个变量

这一节的目标，是给出配方法的完整步骤，并示范怎么一次配掉一个变量，直到交叉项清零。

配方法（method of completing the square）的思路就是初中的「配完全平方」，只是变量更多。**配方法化标准形步骤**：

1. **找平方项**。看有没有系数非零的平方项；有就先拿它开刀。
2. **配一个变量**。把含这个变量（比如 $x_1$）的所有项集中起来，配成「（$x_1$ + 其余变量的线性式）$^2$」，配完剩下的部分不再含 $x_1$。
3. **没有平方项就先造**。若二次型全是交叉项（如 $2x_1x_2$），先作可逆替换 $x_1=y_1+y_2,\ x_2=y_1-y_2$，就有 $x_1x_2=y_1^2-y_2^2$，造出了平方项。
4. **对剩余变量重复**，直到所有交叉项清零；最后把替换写成 $\mathbf x=C\mathbf y$（要求 $|C|\neq0$ 可逆），标准形就出来了。

::: tip 例 1 · 配方法化标准形
**题目**：用配方法把 $f=x_1^2+2x_2^2+5x_3^2+2x_1x_2+2x_1x_3+6x_2x_3$ 化成标准形，并写出所用的可逆变换。

<FigBox title="例 1：配方法两步流程" kind="结构" note="每一步都「配掉」一个变量：先配 x₁，剩余部分不含 x₁；再配 x₂，剩余部分只剩平方项。看图能读出什么：配方法就是逐变量消交叉项，配完一个就少一个变量。">
<svg viewBox="0 0 360 250" role="img" aria-label="配方法两步流程：原始二次型，配 x1，配 x2，得到标准形">
<rect x="20" y="16" width="320" height="42" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
<text x="180" y="34" font-size="12" fill="var(--vp-c-text-2)" text-anchor="middle">f = x₁²+2x₂²+5x₃²+2x₁x₂+2x₁x₃+6x₂x₃</text>
<text x="180" y="52" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">原始二次型</text>
<line x1="180" y1="58" x2="180" y2="72" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#q1-arw)" />
<text x="192" y="68" font-size="11" fill="var(--vp-c-brand-1)">配 x₁</text>
<rect x="20" y="76" width="320" height="42" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
<text x="180" y="94" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">(x₁+x₂+x₃)² + x₂² + 4x₃² + 4x₂x₃</text>
<text x="180" y="112" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">配完 x₁，剩余不含 x₁</text>
<line x1="180" y1="118" x2="180" y2="132" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#q1-arw)" />
<text x="192" y="128" font-size="11" fill="var(--vp-c-brand-1)">配 x₂</text>
<rect x="20" y="136" width="320" height="42" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
<text x="180" y="154" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">(x₁+x₂+x₃)² + (x₂+2x₃)²</text>
<text x="180" y="172" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">交叉项清零</text>
<line x1="180" y1="178" x2="180" y2="192" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#q1-arw)" />
<text x="192" y="188" font-size="11" fill="var(--vp-c-brand-1)">令 y</text>
<rect x="20" y="196" width="320" height="42" rx="8" fill="var(--vp-c-brand-1)" opacity="0.1" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
<text x="180" y="214" font-size="13" font-weight="600" fill="var(--vp-c-brand-1)" text-anchor="middle">标准形 f = y₁² + y₂²</text>
<text x="180" y="232" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">秩 2 · 正惯性指数 2 · 负惯性指数 0</text>
<defs>
  <marker id="q1-arw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
</svg>
</FigBox>

**先想什么**：有 $x_1^2$ 这个平方项，直接从 $x_1$ 开始配；不要一上来动所有项，只集中含 $x_1$ 的项。

**步骤**：
1. 集中含 $x_1$ 的项 $x_1^2+2x_1x_2+2x_1x_3$，配方：$(x_1+x_2+x_3)^2$ 展开后是 $x_1^2+x_2^2+x_3^2+2x_1x_2+2x_1x_3+2x_2x_3$，于是 $x_1^2+2x_1x_2+2x_1x_3=(x_1+x_2+x_3)^2-x_2^2-x_3^2-2x_2x_3$；
2. 代回并合并：$f=(x_1+x_2+x_3)^2+x_2^2+4x_3^2+4x_2x_3$；*（为什么剩余不含 $x_1$：配完全平方后，含 $x_1$ 的部分全被收进了那个平方，这正是配方法的目的。）*
3. 再配 $x_2$：$x_2^2+4x_2x_3+4x_3^2=(x_2+2x_3)^2$，于是 $f=(x_1+x_2+x_3)^2+(x_2+2x_3)^2$；
4. 令 $y_1=x_1+x_2+x_3,\ y_2=x_2+2x_3,\ y_3=x_3$，得标准形 $f=y_1^2+y_2^2$。*（为什么补一个 $y_3=x_3$：替换必须可逆，三个旧变量要配三个新变量；少一个就退化成不可逆替换。）*

反向解出 $\mathbf x=C\mathbf y$：$x_3=y_3,\ x_2=y_2-2y_3,\ x_1=y_1-y_2+y_3$，即

$$
C = \begin{bmatrix} 1 & -1 & 1 \\ 0 & 1 & -2 \\ 0 & 0 & 1 \end{bmatrix}, \qquad |C| = 1 \neq 0
$$

**验算**（node）：随机取若干组 $(x_1,x_2,x_3)$，算 $f$ 与 $y_1^2+y_2^2$ 逐点相等，误差在 $10^{-9}$ 内；$|C|=1\times1\times1=1\neq0$ 可逆。标准形 $y_1^2+y_2^2$ 说明秩 $r=2$、正惯性指数 $p=2$、负惯性指数 $q=0$。
:::

配方法上手快、不用求特征值，但它给出的变换矩阵 $C$ 一般不是正交的——也就是说，它不保长度、不保角度。如果你想要一个「旋转坐标系」般的正交变换，就换下一节的三步法。

## 四、正交变换法：三步换成特征值

这一节的目标，是给出正交变换法的三步，用特征值直接写标准形，并说明它和配方法的关系。

正交变换法（orthogonal transformation method，也叫主轴定理）让变换矩阵是**正交矩阵**（orthogonal matrix，满足 $Q^T=Q^{-1}$，即列向量两两正交且都是单位向量），好处是变换保长度、保角度。**正交变换法三步**：

1. **写对称矩阵** $A$（交叉项系数对半分）；
2. **求特征值与正交单位特征向量**：解 $|A-\lambda I|=0$ 得特征值 $\lambda_1,\dots,\lambda_n$，对每个特征值求特征向量，再把属于不同特征值的特征向量（对称阵的它们天然正交）单位化，排成列得正交矩阵 $Q$；
3. **代换 $\mathbf x=Q\mathbf y$**，标准形就是 $f=\lambda_1y_1^2+\cdots+\lambda_ny_n^2$，**系数正好是特征值**。

::: tip 例 2 · 正交变换法化标准形
**题目**：用正交变换把 $f=3x_1^2+3x_2^2+2x_1x_2$ 化成标准形，并写出所用的正交矩阵。

<FigBox title="例 2：正交变换 = 把椭圆的主轴转到坐标轴上" kind="几何" note="左：二次型 3x₁²+3x₂²+2x₁x₂=1 的图形是一个斜放的椭圆，两条虚线是它的主轴（沿特征向量方向）；右：换成 y 坐标后变成正放的椭圆 2y₁²+4y₂²=1。看图能读出什么：正交变换不改变形状，只旋转坐标系，交叉项消失是因为主轴对齐了坐标轴。">
<svg viewBox="0 0 360 220" role="img" aria-label="正交变换把斜放的椭圆旋转成正放的椭圆：左边斜椭圆带主轴虚线，右边正椭圆">
<line x1="16" y1="180" x2="164" y2="180" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="200" x2="60" y2="12" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="158" y="196" font-size="11" fill="var(--vp-c-text-3)">x₁</text>
<text x="66" y="16" font-size="11" fill="var(--vp-c-text-3)">x₂</text>
<line x1="17.6" y1="152.4" x2="102.4" y2="67.6" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 3" />
<line x1="17.6" y1="67.6" x2="102.4" y2="152.4" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 3" />
<g transform="rotate(-45 60 110)">
  <ellipse cx="60" cy="110" rx="60" ry="30" fill="var(--vp-c-brand-1)" opacity="0.14" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
</g>
<text x="60" y="206" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle">斜放的椭圆</text>
<line x1="196" y1="180" x2="344" y2="180" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="240" y1="200" x2="240" y2="12" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="338" y="196" font-size="11" fill="var(--vp-c-text-3)">y₁</text>
<text x="246" y="16" font-size="11" fill="var(--vp-c-text-3)">y₂</text>
<ellipse cx="270" cy="110" rx="60" ry="30" fill="var(--vp-c-brand-1)" opacity="0.14" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<line x1="210" y1="110" x2="330" y2="110" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 3" />
<line x1="270" y1="50" x2="270" y2="170" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 3" />
<text x="270" y="206" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle">正放的椭圆</text>
</svg>
</FigBox>

**先想什么**：先写对称矩阵 $A=\begin{bmatrix}3&1\\1&3\end{bmatrix}$（交叉项 $2x_1x_2$ 的系数 $2$ 对半分给 $a_{12}=a_{21}=1$），再求特征值。

**步骤**：
1. 特征方程 $|A-\lambda I|=\begin{vmatrix}3-\lambda&1\\1&3-\lambda\end{vmatrix}=(3-\lambda)^2-1=\lambda^2-6\lambda+8=0$，得 $\lambda_1=2,\ \lambda_2=4$；
2. 求特征向量并单位化：$\lambda=2$ 时解 $(A-2I)\mathbf v=\mathbf 0$ 得方向 $(1,-1)^T$，单位化 $\mathbf q_1=\frac{1}{\sqrt2}(1,-1)^T$；$\lambda=4$ 时得方向 $(1,1)^T$，单位化 $\mathbf q_2=\frac{1}{\sqrt2}(1,1)^T$。两向量点积为 $0$、模为 $1$，正交且单位；*（为什么对称阵的不同特征向量天然正交：这是第五章的结论，省去了施密特正交化。）*
3. 排成正交矩阵 $Q=\frac{1}{\sqrt2}\begin{bmatrix}1&1\\-1&1\end{bmatrix}$，令 $\mathbf x=Q\mathbf y$，即 $x_1=\frac{1}{\sqrt2}(y_1+y_2),\ x_2=\frac{1}{\sqrt2}(-y_1+y_2)$，得标准形

$$
f = 2y_1^2 + 4y_2^2
$$

**验算**（node）：随机取 $(y_1,y_2)$，按上式算出 $(x_1,x_2)$ 代入 $3x_1^2+3x_2^2+2x_1x_2$，与 $2y_1^2+4y_2^2$ 逐点相等；再验 $\mathbf q_1\cdot\mathbf q_2=0$、$|\mathbf q_1|=|\mathbf q_2|=1$。标准形的系数 $2,4$ 正好是特征值，正惯性指数 $p=2$、负惯性指数 $q=0$。
:::

两条路都能到标准形，但标准形「长什么样」会随方法变吗？换一种配方，中间可能不同。下面用惯性定理回答这个担心——它告诉你什么变了、什么永远不变。

## 五、惯性定理：正负个数改不了

这一节的目标，是用一句话记下惯性定理，并说明它在「检查自己算得对不对」时怎么用。

**惯性定理**（Sylvester 惯性定律，law of inertia）：二次型无论用哪种**可逆**线性变换化标准形，标准形里**正项的个数 $p$ 与负项的个数 $q$ 都保持不变**（零项个数也由 $r=p+q$ 锁定）。

也就是说，标准形本身可以不唯一——例 1 的配方若换一种配法，得到的标准形可能不是 $y_1^2+y_2^2$——但正惯性指数 $p$、负惯性指数 $q$ 一定相同。这正是「惯性指数」这个名字的由来：它们是二次型**不随坐标变换而变**的固有属性，就像物体的质量不随你换秤而变。

惯性定理有两个日常用法：一是**验算**——你用配方法和正交变换法算同一个二次型，若两种方法得到的正、负项个数对不上，说明至少有一个算错了；二是**分类**——$p=n$（全正）时二次型是正定的，$q=n$（全负）时是负定的，其余是半定或不定的。

惯性指数里「正项个数 $p$」还有一个重要用途：它直接决定了二次型是不是**正定**的，而正定有一整套只看行列式就能判定的方法，这是下一节。

## 六、正定二次型：顺序主子式全正

这一节的目标，是给出正定的定义，并掌握不用配方、直接看行列式就能判定的顺序主子式法。

**正定**（positive definite）二次型的定义：对任意非零 $\mathbf x\neq\mathbf 0$，都有 $f=\mathbf x^T A\mathbf x>0$，就称 $f$ 为正定二次型，$A$ 为正定矩阵。直观地说，正定二次型「恒取正值」，在二元时它的图形是开口向上的「碗」，三元时是只往上翘的曲面；想懂这层几何意义，见现代版[07 · 正交、投影与二次型](../linalg/07-orthogonality.md)。

判断正定最实用的办法是**顺序主子式判据**（不用解特征值、不用配方）：

> $A$ 正定 $\iff$ $A$ 的所有顺序主子式全大于零。

**顺序主子式**（leading principal minor）是指取 $A$ 左上角 $k\times k$ 子块的行列式，$k=1,2,\dots,n$：$\Delta_1=a_{11}$，$\Delta_2=\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}$，$\Delta_3=\begin{vmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{vmatrix}$，一直到 $\Delta_n=|A|$。要**每一个**都大于零，少一个都不行。

::: tip 例 3 · 用顺序主子式判断正定
**题目**：判断二次型 $f=2x_1^2+3x_2^2+2x_3^2+2x_1x_2+2x_2x_3$ 是否正定。

<FigBox title="例 3：三个顺序主子式就是左上角 1×1、2×2、3×3 的行列式" kind="结构" note="红色框从左上角逐层往外扩：Δ₁ 取一个格子，Δ₂ 取左上 2×2，Δ₃ 取整个 3×3。看图能读出什么：顺序主子式只看左上角，且必须一个个从小到大全大于零，缺一不可。">
<svg viewBox="0 0 360 230" role="img" aria-label="三乘三矩阵的三个顺序主子式，左上角一层层往外扩，标出 Δ1 等于 2、Δ2 等于 5、Δ3 等于 8">
<g font-size="15" font-weight="600" text-anchor="middle">
  <rect x="176" y="56" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="196" y="82" fill="var(--vp-c-text-1)">2</text>
  <rect x="216" y="56" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="236" y="82" fill="var(--vp-c-text-1)">1</text>
  <rect x="256" y="56" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="276" y="82" fill="var(--vp-c-text-1)">0</text>
  <rect x="176" y="96" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="196" y="122" fill="var(--vp-c-text-1)">1</text>
  <rect x="216" y="96" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="236" y="122" fill="var(--vp-c-text-1)">3</text>
  <rect x="256" y="96" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="276" y="122" fill="var(--vp-c-text-1)">1</text>
  <rect x="176" y="136" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="196" y="162" fill="var(--vp-c-text-1)">0</text>
  <rect x="216" y="136" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="236" y="162" fill="var(--vp-c-text-1)">1</text>
  <rect x="256" y="136" width="40" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="276" y="162" fill="var(--vp-c-text-1)">2</text>
</g>
<rect x="174" y="54" width="44" height="44" rx="7" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.8" />
<text x="170" y="48" font-size="12" font-weight="600" fill="var(--vp-c-danger-1)">Δ₁=2</text>
<rect x="174" y="54" width="84" height="84" rx="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
<text x="262" y="74" font-size="12" font-weight="600" fill="var(--vp-c-brand-1)">Δ₂=5</text>
<rect x="174" y="54" width="124" height="124" rx="7" fill="none" stroke="var(--vp-c-brand-2)" stroke-width="1.8" />
<text x="304" y="100" font-size="12" font-weight="600" fill="var(--vp-c-brand-2)">Δ₃=8</text>
<text x="180" y="210" font-size="12" fill="var(--vp-c-text-2)">三个顺序主子式 2、5、8 全大于零，正定</text>
</svg>
</FigBox>

**先想什么**：先把 $f$ 写成对称矩阵。平方项系数 $2,3,2$ 放对角线；$2x_1x_2$ 对半分给 $a_{12}=a_{21}=1$，$2x_2x_3$ 对半分给 $a_{23}=a_{32}=1$，没有 $x_1x_3$ 项故 $a_{13}=a_{31}=0$。

**步骤**：
1. $A=\begin{bmatrix}2&1&0\\1&3&1\\0&1&2\end{bmatrix}$；
2. 算三个顺序主子式：$\Delta_1=2$；$\Delta_2=\begin{vmatrix}2&1\\1&3\end{vmatrix}=2\times3-1\times1=5$；$\Delta_3=|A|=2\begin{vmatrix}3&1\\1&2\end{vmatrix}-1\begin{vmatrix}1&1\\0&2\end{vmatrix}+0=2(6-1)-1(2-0)=8$；
3. 三个都大于零，$A$ 正定，故 $f$ 正定。*（为什么不用配方：顺序主子式法直接看行列式，比配方快，判「是不是正定」一步到位。）*

**验算**（node）：`det([[2,1],[1,3]]) = 5`、`det([[2,1,0],[1,3,1],[0,1,2]]) = 8`。作为对照，若取 $B=\begin{bmatrix}1&2\\2&1\end{bmatrix}$，$\Delta_1=1>0$ 但 $\Delta_2=1-4=-3<0$，不满足「全正」，故 $B$ 不正定——这正说明不能只看到一个主子式为正就下结论。
:::

到这里，二次型的主线走完：矩阵表示 → 标准形/规范形 → 两条化标准形的路 → 惯性定理 → 正定判据。下面把全页最容易踩的坑集中列一遍，并给你指路到几何直觉版，把「怎么算」和「为什么」接起来。

## 易错清单 + 自检

- **交叉项系数忘了对半分**：这是本页最高频的错误。$f=2x_1x_2$ 的矩阵是 $\begin{bmatrix}0&1\\1&0\end{bmatrix}$，不是 $\begin{bmatrix}0&2\\0&0\end{bmatrix}$。后者不对称，根本不是二次型的矩阵；写出非对称矩阵，后面一切全错。
- **配方法漏了「先造平方项」**：二次型全是交叉项时（如 $2x_1x_2$）不能直接配，要先做 $x_1=y_1+y_2,\ x_2=y_1-y_2$ 造出 $y_1^2-y_2^2$，再往下配。
- **替换必须可逆**：标准形成立的前提是 $\mathbf x=C\mathbf y$ 中 $|C|\neq0$；配完要顺手算一下 $|C|$，不可逆的替换会改变二次型的本质（比如把正定的变成不正定）。
- **标准形不唯一、但 $p,q$ 唯一**：换一种配方，标准形可能不同，正负项个数却一定相同（惯性定理）。规范形（系数只留 $+1,-1,0$）则是唯一确定的。
- **顺序主子式是「左上角」，且要全正**：不是任意主子式，而是 $1\times1,2\times2,\dots,n\times n$ 依次左上角子块；有一个 $\le0$ 就立刻不是正定（可能是负定或不定），别看到一个正的就说正定。
- **正定与特征值全正是一回事**：顺序主子式全正 ⇔ 特征值全正 ⇔ $p=n$。三种说法等价，考试里看哪种数据好算就用哪种。

**自检**：随手写一个含交叉项的三元二次型，先把它写成对称矩阵，再用配方法化标准形，核对正、负项个数；然后求它的对称矩阵特征值，看标准形系数是否等于特征值；最后算顺序主子式，判断是否正定。三条路的结果对得上（$p,q$ 一致、正定与否一致），这一页就真正是你的了。

**这一页的指路**：想懂二次型「为什么长这样」——为什么正定对应开口向上的碗、为什么标准形就是主轴——回到现代版的[07 · 正交、投影与二次型](../linalg/07-orthogonality.md)，那一页从几何出发讲同一件事；对正交对角化那一步不熟，先回[06 · 特征值、特征向量与对角化](../linalg/06-eigenvalues.md)补第五章上半。至此，经典结构版的行列式 → 矩阵 → 方程组 → 向量组 → 特征值 → 二次型六章全部走完。
