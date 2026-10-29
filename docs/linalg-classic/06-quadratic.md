---
title: 06 · 二次型：把交叉项配成平方
description: 同济第五章后半的走法：把含交叉项的二次多项式写成对称矩阵，用配方法与正交变换法化成标准形，惯性定理核对正负项个数，顺序主子式判正定。
---

# 06 · 二次型：把交叉项配成平方

<Meta time="35 min" level="核心" note="最容易错的两处：交叉项系数忘了对半分；判正定时只看最后一个顺序主子式" />

取一个三元式子：

$$
f=x_1^2+2x_2^2+5x_3^2+2x_1x_2+2x_1x_3+6x_2x_3
$$

每一项都是二次的：要么平方项 $x_i^2$，要么交叉项 $x_ix_j$（$i\ne j$），没有一次项、没有常数项。这样的式子叫**二次型**。

先摆一个问题：$f$ 会不会取到负值？平方项都带正号，交叉项却可能把总和拉下去，一眼看不出来。要回答它，得先把这堆项整理成能看懂的形状，两条路都通向同一个地方。

跟课堂进度的话，这页对应同济《线性代数》第五章后半：二次型及其标准形、惯性定理、正定二次型。

::: tip 读这页之前
转置与矩阵乘法（[02 · 矩阵及其运算](02-matrices.md)）；行列式要会算（[01 · 行列式](01-determinant.md)），算顺序主子式全靠它；特征值与实对称矩阵的正交对角化（[05 · 特征值与特征向量](05-eigen.md)）也要带着。

记号：$\mathbf x=(x_1,\dots,x_n)^T$ 是列向量，$A^T$ 是转置，$D$ 是对角矩阵，$Q$ 是列向量两两垂直且长度为 1 的正交矩阵（$Q^{-1}=Q^T$）；二次型统一写成 $\mathbf x^TA\mathbf x$。
:::

## 一、交叉项是怎么进到矩阵里去的

二次型都能写成矩阵乘法的样子：

$$
f=\mathbf x^TA\mathbf x=\sum_{i,j}a_{ij}x_ix_j
$$

规则两条：平方项系数放对角线（$a_{ii}$ 就是 $x_i^2$ 的系数）；交叉项 $x_ix_j$ 的系数对半分给 $a_{ij}$ 和 $a_{ji}$。按这条规则，上面的 $f$ 对应

$$
A=\begin{bmatrix}1&1&1\\1&2&3\\1&3&5\end{bmatrix}
$$

读一遍这个对应：$x_1^2$、$x_2^2$、$x_3^2$ 的系数 $1,2,5$ 落对角线；$2x_1x_2$ 的系数 2 分给 $a_{12}=a_{21}=1$，$2x_1x_3$ 分给 $a_{13}=a_{31}=1$，$6x_2x_3$ 分给 $a_{23}=a_{32}=3$。

为什么两格各放 1？把 $\mathbf x^TA\mathbf x$ 展开，$x_ix_j$ 会出现两次（$a_{ij}x_ix_j$ 与 $a_{ji}x_jx_i$），合并后的系数是 $a_{ij}+a_{ji}$，只要这个和等于原来的 2 就行。也就是说，同一个 $f$ 也能写成不对称的矩阵，比如 $2x_1x_2$ 这一项，把 2 整个塞进 $a_{12}$、让 $a_{21}=0$，展开还是同一个式子。

那为什么规定对半分？因为这样得到的那一个矩阵是唯一的，而且它是对称矩阵（$A^T=A$），后面求特征值、做正交对角化正好套第五章的实对称结论。所以此后说「二次型的矩阵」都指对半分得到的那个对称矩阵。

<FigBox title="对称矩阵的布局：对角线放平方项，成对位置放交叉项的一半" kind="结构" note="对角线三个格子是 1、2、5，成对位置是 1、1、3。看完该看出矩阵关于主对角线对称，$a_{12}=a_{21}$ 这类等式是填法的直接后果。">
<svg viewBox="0 0 400 264" role="img" aria-label="三元二次型的对称矩阵：对角线放平方项系数，成对位置放交叉项系数的一半">
  <g font-size="16" font-weight="600" text-anchor="middle">
    <rect x="200" y="46" width="40" height="40" rx="6" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1.2"/>
    <text x="220" y="72" fill="var(--vp-c-text-1)">1</text>
    <rect x="240" y="46" width="40" height="40" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16"/>
    <text x="260" y="72" fill="var(--vp-c-text-1)">1</text>
    <rect x="280" y="46" width="40" height="40" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16"/>
    <text x="300" y="72" fill="var(--vp-c-text-1)">1</text>
    <rect x="200" y="86" width="40" height="40" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16"/>
    <text x="220" y="112" fill="var(--vp-c-text-1)">1</text>
    <rect x="240" y="86" width="40" height="40" rx="6" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1.2"/>
    <text x="260" y="112" fill="var(--vp-c-text-1)">2</text>
    <rect x="280" y="86" width="40" height="40" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16"/>
    <text x="300" y="112" fill="var(--vp-c-text-1)">3</text>
    <rect x="200" y="126" width="40" height="40" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16"/>
    <text x="220" y="152" fill="var(--vp-c-text-1)">1</text>
    <rect x="240" y="126" width="40" height="40" rx="6" fill="var(--vp-c-brand-2)" opacity="0.16"/>
    <text x="260" y="152" fill="var(--vp-c-text-1)">3</text>
    <rect x="280" y="126" width="40" height="40" rx="6" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1.2"/>
    <text x="300" y="152" fill="var(--vp-c-text-1)">5</text>
  </g>
  <rect x="18" y="188" width="14" height="14" rx="3" fill="var(--vp-c-brand-1)" opacity="0.18" stroke="var(--vp-c-brand-1)" stroke-width="1"/>
  <text x="40" y="200" font-size="12" fill="var(--vp-c-text-2)">对角线：平方项系数</text>
  <rect x="18" y="212" width="14" height="14" rx="3" fill="var(--vp-c-brand-2)" opacity="0.16"/>
  <text x="40" y="224" font-size="12" fill="var(--vp-c-text-2)">成对位置：交叉项系数 ÷ 2</text>
  <text x="18" y="250" font-size="12" fill="var(--vp-c-text-3)">输入六项系数 → 按两条规则填格 → 得对称矩阵 A</text>
</svg>
</FigBox>

我们想把 $f$ 整理成什么形状？只剩平方项、交叉项全为零：

$$
f=d_1y_1^2+d_2y_2^2+\cdots+d_ny_n^2
$$

这种形状叫**标准形**；若再把系数归成 $+1$、$-1$、$0$，叫规范形。下面两条路都奔着标准形去。

## 二、配方法：一次配掉一个变量

配方法就是初中的配完全平方，只是变量多了，得一个一个来：找平方项；把含这个变量的所有项收进一个完全平方；剩下的部分不再含这个变量；对剩下的变量重复，直到交叉项清零。

拿 $f$ 现场配。含 $x_1$ 的项是 $x_1^2+2x_1x_2+2x_1x_3$，先看 $(x_1+x_2+x_3)^2$ 展开成什么：

$$
(x_1+x_2+x_3)^2=x_1^2+x_2^2+x_3^2+2x_1x_2+2x_1x_3+2x_2x_3
$$

多出来的 $x_2^2+x_3^2+2x_2x_3$ 要减掉，代回去再合并：

$$
f=(x_1+x_2+x_3)^2+x_2^2+4x_3^2+4x_2x_3
$$

第一项之外已经没有 $x_1$ 了，这一步的目的达到。剩下 3 项是 $x_2^2$、$4x_3^2$、$4x_2x_3$，全都不含 $x_1$。再配 $x_2$：$x_2^2+4x_2x_3+4x_3^2=(x_2+2x_3)^2$，所以

$$
f=(x_1+x_2+x_3)^2+(x_2+2x_3)^2
$$

令 $y_1=x_1+x_2+x_3$、$y_2=x_2+2x_3$、$y_3=x_3$，标准形就是 $y_1^2+y_2^2$（第三个平方项的系数是 0）。补 $y_3=x_3$ 是为了三个旧变量对三个新变量，换元 $\mathbf x=C\mathbf y$ 必须可逆，少一个就退化了。若二次型一开始没有平方项（比如只剩 $2x_1x_2$），先作替换 $x_1=y_1+y_2$、$x_2=y_1-y_2$ 造出 $y_1^2-y_2^2$，再按上面的步骤配。

<FigBox title="配方法：一次配掉一个变量" kind="结构" note="上面的框是原始六项式，中间先收 x₁、再收 x₂，下面的框只剩两个平方。看完该看出每配一次，含该变量的项就全被收进一个括号，交叉项逐层减少。">
<svg viewBox="0 0 380 250" role="img" aria-label="配方法两步流程">
  <defs>
    <marker id="c6f1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)"/>
    </marker>
  </defs>
  <rect x="18" y="14" width="344" height="38" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="190" y="38" font-size="11.5" fill="var(--vp-c-text-2)" text-anchor="middle">输入：f = x₁²+2x₂²+5x₃²+2x₁x₂+2x₁x₃+6x₂x₃</text>
  <line x1="190" y1="54" x2="190" y2="70" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#c6f1)"/>
  <text x="200" y="66" font-size="11" fill="var(--vp-c-brand-1)">收 x₁</text>
  <rect x="18" y="72" width="344" height="38" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="190" y="96" font-size="11.5" fill="var(--vp-c-text-1)" text-anchor="middle">(x₁+x₂+x₃)² + x₂² + 4x₃² + 4x₂x₃</text>
  <line x1="190" y1="112" x2="190" y2="128" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#c6f1)"/>
  <text x="200" y="124" font-size="11" fill="var(--vp-c-brand-1)">收 x₂</text>
  <rect x="18" y="130" width="344" height="38" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="190" y="154" font-size="11.5" fill="var(--vp-c-text-1)" text-anchor="middle">(x₁+x₂+x₃)² + (x₂+2x₃)²</text>
  <line x1="190" y1="170" x2="190" y2="186" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#c6f1)"/>
  <text x="200" y="182" font-size="11" fill="var(--vp-c-brand-1)">令 y</text>
  <rect x="18" y="188" width="344" height="38" rx="8" fill="var(--vp-c-brand-1)" opacity="0.1" stroke="var(--vp-c-brand-1)" stroke-width="1.2"/>
  <text x="190" y="212" font-size="12.5" font-weight="600" fill="var(--vp-c-brand-1)" text-anchor="middle">结果：f = y₁² + y₂² + 0·y₃²</text>
  <text x="190" y="240" font-size="11.5" fill="var(--vp-c-text-3)" text-anchor="middle">操作：逐层收变量；结果：交叉项清零</text>
</svg>
</FigBox>

配完能回答开头那个问题了：$f$ 是 2 个平方之和，永远 $\ge0$；只有两个括号同时为 0（$x_2=-2x_3$、$x_1=x_3$）时才等于 0，例如 $(1,-2,1)$。所以 $f$ 不取负值，但会取到 0，第 1 个零系数就是这么来的，这种情形第四节给名字。

## 三、正交变换法：标准形的系数就是特征值

配方法给的替换 $C$ 一般不正交，换完不保长度、也不保夹角。想要一个保长度、保夹角的换法，就借第五章的正交对角化。

做法三步：第 1 步写对称矩阵 $A$；第 2 步求特征值与单位化的特征向量（对称矩阵不同特征值的特征向量天然垂直，只需各自单位化）；令 $\mathbf x=Q\mathbf y$，标准形的系数就是特征值。

为什么系数正好是特征值，一行式子就够：

$$
\mathbf x^TA\mathbf x=(Q\mathbf y)^TA(Q\mathbf y)=\mathbf y^T(Q^TAQ)\mathbf y=\mathbf y^TD\mathbf y=\lambda_1y_1^2+\cdots+\lambda_ny_n^2
$$

读一遍：第一个等号是代入 $\mathbf x=Q\mathbf y$；第二个把 $Q^T$ 与 $Q$ 收在一起；第三个用第五章的 $Q^TAQ=D$；最后一步 $D$ 是对角阵，展开只剩平方项。所以交叉项消失不是碰巧：坐标轴被转到了特征方向上，原先斜着的交叉项在新坐标里对不上任何一对不同的轴。

两条路的区别：配方法快，但换元不保长度；正交变换法多做几步，换完保长度、保夹角（可能是旋转，也可能翻个面），系数直接读特征值。

<FigBox title="正交变换：把斜椭圆的轴转到坐标轴上" kind="几何" note="左右是同一条曲线，左边斜放、右边摆正，变的只是坐标轴的方向。看完该看出形状没变，交叉项消失是因为主轴对齐了坐标轴。">
<svg viewBox="0 0 380 226" role="img" aria-label="正交变换把斜放的椭圆旋转成正放的椭圆">
  <line x1="16" y1="150" x2="170" y2="150" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
  <line x1="62" y1="186" x2="62" y2="20" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
  <line x1="24" y1="112" x2="100" y2="188" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 3"/>
  <line x1="24" y1="188" x2="100" y2="112" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 3"/>
  <g transform="rotate(-45 62 150)">
    <ellipse cx="62" cy="150" rx="52" ry="24" fill="var(--vp-c-brand-1)" opacity="0.14" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/>
  </g>
  <text x="62" y="204" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle">斜放：带交叉项</text>
  <line x1="206" y1="150" x2="360" y2="150" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
  <line x1="282" y1="186" x2="282" y2="20" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
  <ellipse cx="282" cy="150" rx="52" ry="24" fill="var(--vp-c-brand-1)" opacity="0.14" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/>
  <text x="292" y="204" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle">转正：只剩平方项</text>
  <text x="18" y="222" font-size="11.5" fill="var(--vp-c-text-3)">输入同一条曲线 → 换个坐标轴看 → 交叉项消失</text>
</svg>
</FigBox>

## 四、惯性定理与正定：正负个数换不掉

同一个二次型，用两种方法化出来的标准形系数可以不同，但正项个数、负项个数一定相同：不管用哪种可逆换元，正项个数 $p$ 与负项个数 $q$ 都不变，只由二次型自己决定。这就是**惯性定理**，$p$、$q$ 叫惯性指数。

它的第一个用处是验算：两条路各算一遍，正负项个数对不上就说明有一处算错了。回到前面那个 $f$：标准形是 $y_1^2+y_2^2+0\cdot y_3^2$，两正、零负、一个零项，所以 $p=2$、$q=0$、秩 2。零项意味着这个二次型在某个非零向量上取到 0，正是第二节算出来的 $(1,-2,1)$。

第二个用处是给「正定」当判据。若对一切非零 $\mathbf x$ 都有 $\mathbf x^TA\mathbf x>0$，就说 $f$（和 $A$）**正定**；只保证 $\ge0$、且有非零向量让它等于 0，叫半正定。前面那个 $f$ 就是半正定，不是正定。

判正定最省事的办法不看特征值、也不配方，只看左上角那串行列式。$A$ 的 $k$ 阶**顺序主子式** $\Delta_k$ 是左上角 $k\times k$ 子块的行列式：$\Delta_1=a_{11}$，$\Delta_2=\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}$，一直到 $\Delta_n=|A|$。判据是

$$
A\ \text{正定}\iff \Delta_1>0,\ \Delta_2>0,\ \dots,\ \Delta_n>0
$$

读一遍：这 $n$ 个数必须每一个都是正的，少看一个就会错。用前面的 $A$ 试：$\Delta_1=1$、$\Delta_2=1\times2-1\times1=1$、$\Delta_3=|A|=0$，最后一个是 0，所以 $f$ 不正定，与配方法得到的「有个零系数」一致。

反过来，元素全正的矩阵也可能不正定：$\begin{bmatrix}1&2\\2&1\end{bmatrix}$ 的 $\Delta_1=1>0$，但 $\Delta_2=1-4=-3<0$，它在 $\mathbf x=(1,-1)$ 上取值 $1-4+1=-2<0$。所以「元素都正」不是判据。

## 例题

::: tip 例 1 · 配方法：写出换元矩阵并核对一个点 {#ex-quad-1}
题目：把 $f$ 化成标准形，写出可逆换元 $\mathbf x=C\mathbf y$，并用一个点核对。

先猜：两个平方项都带正号，标准形里不会有负号；第三个新变量没有平方项，所以会出现 0 系数，$\Delta_3=|A|$ 应该是 0。

再算：第二节已经配出 $y_1=x_1+x_2+x_3$、$y_2=x_2+2x_3$、$y_3=x_3$。反解出 $\mathbf x$：$x_3=y_3$、$x_2=y_2-2y_3$、$x_1=y_1-y_2+y_3$，即

$$
C=\begin{bmatrix}1&-1&1\\0&1&-2\\0&0&1\end{bmatrix},\qquad |C|=1\cdot1\cdot1=1\ne0
$$

再回代：取 $\mathbf x=(1,2,3)$，则 $y_1=1+2+3=6$、$y_2=2+2\times3=8$。直接算 $f$：$1+8+45+4+6+36=100$；而 $y_1^2+y_2^2=36+64=100$，两边相等。所以 $f$ 的标准形是两正零负：$p=2$、$q=0$、秩 2。
:::

::: tip 例 2 · 正交变换法：把斜椭圆摆正 {#ex-quad-2}
题目：用正交变换把 $f_2=2x_1^2+2x_1x_2+2x_2^2$ 化成标准形，并写出正交矩阵。

先猜：平方项系数都是 2，交叉项系数 2 对半分给两格 1；对角元相同，两个特征值应该一个比 2 小、一个比 2 大。

再算：$A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$，$|\lambda E-A|=(\lambda-2)^2-1=(\lambda-1)(\lambda-3)$，得 $\lambda_1=1$、$\lambda_2=3$。求特征向量：$\lambda_1=1$ 时 $E-A=\begin{bmatrix}-1&-1\\-1&-1\end{bmatrix}$，方程 $x_1+x_2=0$，取 $(1,-1)^T$ 并单位化得 $\mathbf q_1=\frac{1}{\sqrt2}(1,-1)^T$；$\lambda_2=3$ 时 $3E-A=\begin{bmatrix}1&-1\\-1&1\end{bmatrix}$，方程 $x_1-x_2=0$，取 $(1,1)^T$ 单位化得 $\mathbf q_2=\frac{1}{\sqrt2}(1,1)^T$。于是 $Q=\frac{1}{\sqrt2}\begin{bmatrix}1&1\\-1&1\end{bmatrix}$，令 $\mathbf x=Q\mathbf y$。

再回代：标准形是 $y_1^2+3y_2^2$。取 $\mathbf x=(1,1)$：直接算 $f_2=2+2+2=6$；而 $\mathbf y=Q^T\mathbf x=\frac{1}{\sqrt2}(0,2)=(0,\sqrt2)$，$y_1^2+3y_2^2=0+3\times2=6$，两边相等。两个系数 1、3 正是特征值，顺序与 $Q$ 的列一致。
:::

::: tip 例 3 · 顺序主子式判正定 {#ex-quad-3}
题目：判断 $f_3=2x_1^2+2x_2^2+2x_3^2+2x_1x_2+2x_2x_3$ 是否正定。

先猜：平方项系数都是 2，交叉项只连着相邻变量，三个顺序主子式多半都是正的；但要防最后一个不是正数。

再算：$A=\begin{bmatrix}2&1&0\\1&2&1\\0&1&2\end{bmatrix}$（$2x_1x_2$、$2x_2x_3$ 的系数各对半分给 1；没有 $x_1x_3$ 项，所以 $a_{13}=a_{31}=0$）。三个顺序主子式：

$$
\Delta_1=2,\qquad \Delta_2=\begin{vmatrix}2&1\\1&2\end{vmatrix}=2\times2-1\times1=3,\qquad
\Delta_3=2\begin{vmatrix}2&1\\1&2\end{vmatrix}-1\begin{vmatrix}1&1\\0&2\end{vmatrix}+0=6-2=4
$$

再回代：三个都大于零，所以 $A$ 正定，$f_3$ 正定。抽查两点：$\mathbf x=(1,0,0)$ 给 $f_3=2>0$；$\mathbf x=(1,-1,1)$ 给 $2+2+2-2-2=2>0$，没有负值。对照前面那个 $f$：它的 $\Delta_3=0$，所以只是半正定，两者差的就是这一个数。
:::

## 六章走完

六章到这里走完一条链：算行列式，会矩阵运算，化成阶梯形判解，判相关求秩，解特征方程，最后配方判正定。这条链上每一次换算，用的都是前一章的工具。

这页真正要带走的是一个换算习惯：见到含交叉项的二次多项式，先把它写成对称矩阵（交叉项对半分），之后无论是配方还是求特征值，都在这个矩阵上做。

::: warning 两个坑
- 交叉项系数忘了对半分。写出的矩阵不对称，后面求特征值、算顺序主子式就没法套实对称的结论。$2x_1x_2$ 的矩阵统一写成 $\begin{bmatrix}0&1\\1&0\end{bmatrix}$；$\begin{bmatrix}0&2\\0&0\end{bmatrix}$ 展开也对，但不是那个唯一的对称矩阵。
- 判正定时只看最后一个顺序主子式。漏掉 $\Delta_1$、$\Delta_2$ 为负的情形就会误判，要从左上角起逐个算，全正才叫正定。
:::

想回头对一遍整条路线，看[经典版路线图](./index.md)；想懂二次型的几何（为什么正定就是碗口朝上），看现代版的 [07 · 正交、投影与二次型](../linalg/07-orthogonality)。
