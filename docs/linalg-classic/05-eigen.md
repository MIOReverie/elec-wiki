---
title: 05 · 特征值与特征向量
description: 同济第五章前半的走法：从「乘完方向不变」认出特征值与特征向量，用特征方程求 λ、代回解齐次方程求向量，拼出 P 做相似对角化，实对称矩阵再正交对角化。
---

# 05 · 特征值与特征向量

<Meta time="35 min" level="核心" note="最容易错的两处：把零向量当特征向量；对角化时 P 的列序与 D 的对角元错位" />

取 $A=\begin{bmatrix}3&-1\\-1&3\end{bmatrix}$，算两次乘法：

$$
A\begin{bmatrix}1\\1\end{bmatrix}=\begin{bmatrix}3-1\\-1+3\end{bmatrix}=\begin{bmatrix}2\\2\end{bmatrix}=2\begin{bmatrix}1\\1\end{bmatrix},
\qquad
A\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}3+1\\-1-3\end{bmatrix}=\begin{bmatrix}4\\-4\end{bmatrix}=4\begin{bmatrix}1\\-1\end{bmatrix}
$$

第一个结果还在 45° 那条线上，长度变成 2 倍；第二个在 −45° 那条线上，长度变成 4 倍。换一个向量试：$A\begin{bmatrix}1\\0\end{bmatrix}=\begin{bmatrix}3\\-1\end{bmatrix}$，方向从水平被掰到斜下方，不在原来那条线上了。

大多数向量被掰弯，少数方向只被拉长。把这些方向找出来、把拉伸倍数量成数，就是下面要办的事。这一步做对了，后面换坐标、算高次幂都是顺水推舟。

跟课堂进度的话，这页对应同济《线性代数》第五章「相似矩阵及二次型」的前半：第五章第一节的向量内积与正交，以及特征值与特征向量、相似矩阵、实对称矩阵的对角化。

::: tip 读这页之前
行列式怎么算（[01 · 行列式](01-determinant.md)）；矩阵乘法、逆矩阵、转置（[02 · 矩阵及其运算](02-matrices.md)）；解齐次方程组、数秩（[03 · 矩阵的初等变换与线性方程组](03-elementary.md)）。这三样都要在手上。

第 4 章的线性无关也可以先读：一组向量里没有哪一支能被其余几支凑出来就叫无关，有一支能被凑出来就叫相关。跳过 04 也能往下读，要回查就看 [04 · 向量组的线性相关性](04-vectors.md) 第一节。

点积、垂直、长度忘了也不要紧，第四节开头会写全，那是教材第五章第一节「向量的内积」。

记号：$E$ 是单位矩阵（同济写法，教材上也写 $I$）；$\lambda$ 是一个要找的数，$\mathbf x$ 是列向量；$P$ 是特征向量按列排成的方阵，$D$ 是对角矩阵；$\operatorname{tr}A$ 是主对角线元素之和，叫迹。
:::

## 一、两条线不动，别的都被掰弯

设 $A$ 是 $n$ 阶方阵。如果有一个数 $\lambda$ 和一个非零向量 $\mathbf x$，使

$$
A\mathbf x=\lambda\mathbf x
$$

就把 $\lambda$ 叫 $A$ 的**特征值**，把 $\mathbf x$ 叫属于 $\lambda$ 的**特征向量**。

读一遍：左边 $A\mathbf x$ 是 $A$ 作用在 $\mathbf x$ 上的新向量，右边 $\lambda\mathbf x$ 是把 $\mathbf x$ 整体乘 $\lambda$ 倍。两边相等，说的是新旧向量在同一条直线上：$\lambda>0$ 同向、$\lambda<0$ 掉头、$\lambda=0$ 被压成零向量。「方向不变」不等于「向量不变」，长度可以变。

为什么强调非零？零向量乘完还是零，$A\mathbf 0=\lambda\mathbf 0$ 对任何 $\lambda$ 都成立，不排除它，每个数都能冒充特征值。同一线上的非零倍数也是特征向量（$A(c\mathbf x)=cA\mathbf x=\lambda(c\mathbf x)$），所以答案不唯一，写一个代表就行。

<FigBox title="两条特征线上只拉长，别的方向被掰弯" kind="图解" note="图里有 v₁=(1,1)、v₂=(1,−1) 和一个普通向量 w，各乘一次 A。看完该看出 v₁、v₂ 只变长，w 被掰弯，判据只看 Ax 与 x 是否共线。">
<svg viewBox="0 0 460 360" role="img" aria-label="两条特征方向上的向量被拉长，普通向量被掰弯">
  <defs>
    <marker id="c5f1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)"/>
    </marker>
    <marker id="c5f2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)"/>
    </marker>
    <marker id="c5f3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <line x1="30" y1="170" x2="430" y2="170" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="90" y1="200" x2="90" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="40" y1="220" x2="190" y2="70" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="40" y1="120" x2="190" y2="270" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="90" y1="170" x2="120" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#c5f1)"/>
  <line x1="90" y1="170" x2="150" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#c5f1)"/>
  <line x1="90" y1="170" x2="120" y2="200" stroke="var(--vp-c-brand-2)" stroke-width="2" marker-end="url(#c5f2)"/>
  <line x1="90" y1="170" x2="210" y2="290" stroke="var(--vp-c-brand-2)" stroke-width="2.6" marker-end="url(#c5f2)"/>
  <line x1="90" y1="170" x2="160" y2="140" stroke="var(--vp-c-text-2)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#c5f3)"/>
  <line x1="90" y1="170" x2="250" y2="136" stroke="var(--vp-c-text-2)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#c5f3)"/>
  <circle cx="90" cy="170" r="2.6" fill="var(--vp-c-text-2)"/>
  <text x="104" y="134" font-size="12" fill="var(--vp-c-brand-1)">v₁</text>
  <text x="140" y="104" font-size="12" fill="var(--vp-c-brand-1)">Av₁=2v₁</text>
  <text x="104" y="216" font-size="12" fill="var(--vp-c-brand-2)">v₂</text>
  <text x="216" y="294" font-size="12" fill="var(--vp-c-brand-2)">Av₂=4v₂</text>
  <text x="150" y="132" font-size="12" fill="var(--vp-c-text-2)">w</text>
  <text x="256" y="132" font-size="12" fill="var(--vp-c-text-2)">Aw（方向变了）</text>
  <line x1="20" y1="310" x2="440" y2="310" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="20" y="328" font-size="11.5" fill="var(--vp-c-text-2)">输入：v₁、v₂ 与 w。</text>
  <text x="20" y="346" font-size="11.5" fill="var(--vp-c-text-2)">操作：各乘一次 A；结果：v₁、v₂ 只变长，w 被掰弯。</text>
</svg>
</FigBox>

## 二、写成方程，λ 自己就出来了

$A\mathbf x=\lambda\mathbf x$ 里有两个未知：数 $\lambda$ 和向量 $\mathbf x$，一起猜没法猜。先把右边写成矩阵乘向量，$\lambda\mathbf x=\lambda E\mathbf x$，再移项：

$$
A\mathbf x-\lambda E\mathbf x=(A-\lambda E)\mathbf x=\mathbf 0
$$

这一步把两个未知变成一个带参数的齐次方程组，而我们要的是非零解。第三章的结论直接可用：齐次方程组有非零解，当且仅当系数矩阵的行列式为零。于是

$$
|\lambda E-A|=0
$$

读一遍：$E$ 与 $A$ 同尺寸，$\lambda E$ 把单位矩阵的 1 换成 $\lambda$；$\lambda E-A$ 的对角线上是 $\lambda-a_{ii}$，其余位置是 $-a_{ij}$。整句读作：把 $A$ 的对角线上各减一次 $\lambda$，算这个新矩阵的行列式，让它等于零。左边展开后是关于 $\lambda$ 的 $n$ 次多项式，右边是 0，所以这是「求多项式的根」，不是矩阵方程。这个方程叫**特征方程**，左边叫特征多项式。

约定一句：教材上也写 $|A-\lambda E|=0$，两者只差整体一个负号（最多差 $(-1)^n$），等于 0 的根一样，这里统一用 $|\lambda E-A|=0$。

于是做法固定成两步：解特征方程拿到全部 $\lambda$，再把每个 $\lambda$ 代回 $(\lambda E-A)\mathbf x=\mathbf 0$ 取非零解。拿到 $\lambda$ 后先自查两条，对任意 $n$ 阶方阵都成立：

$$
\lambda_1+\cdots+\lambda_n=\operatorname{tr}A,\qquad \lambda_1\lambda_2\cdots\lambda_n=|A|
$$

特征值之和等于迹，之积等于行列式。例 1 会当场用它们核对。

## 三、换到特征方向上看：对角化省了什么

先给「换坐标」一个名字：若存在可逆矩阵 $P$ 使 $B=P^{-1}AP$，就说 $A$ 与 $B$ **相似**。$P$ 的列是新坐标轴：$\mathbf x=P\mathbf y$ 把新坐标换成原坐标，$P^{-1}$ 把原坐标读回新坐标，所以 $B=P^{-1}AP$ 的动作依次是「换成原坐标，$A$ 做变换，读回新坐标」。$A$ 与 $B$ 是同一个变换在两套坐标下的两个写法：行列式、迹、秩、特征值都相同，只是坐标变了。

如果相似的那个矩阵恰好是对角阵，就叫 $A$ 可对角化：

$$
A=PDP^{-1},\qquad D=\operatorname{diag}(\lambda_1,\dots,\lambda_n)
$$

读一遍：$P$ 的每一列是一个特征向量，$D$ 的对角线上是它对应的特征值，第 $i$ 列配第 $i$ 个对角元。做法三步：求特征值；每个特征值求特征向量，凑够 $n$ 个无关的（无关就是这组里没有哪一支能被其余几支凑出来，第 4 章的定义，这里只用这一条）；按列排 $P$、按同样顺序填 $D$。

实际动手时更顺手的是把上式右乘 $P$，写成

$$
AP=PD
$$

它的意思是逐列相等：左边 $[A\mathbf v_1\ \ A\mathbf v_2]$，右边 $[\lambda_1\mathbf v_1\ \ \lambda_2\mathbf v_2]$，同一列对同一列。$A\mathbf v_i=\lambda_i\mathbf v_i$ 本来就是定义，所以这个等式不用额外证明，它只是把 $\lambda$ 与列的对应摆出来，顺序错了立刻看得出来。

省了什么？$A^2=PDP^{-1}PDP^{-1}=PD^2P^{-1}$，所以 $A^{k}=PD^{k}P^{-1}$，而对角阵的 $k$ 次方只是对角线上各自取 $k$ 次方。求高次幂于是变成：$n$ 个数各取 $k$ 次方，再做 2 次矩阵乘法，比 3 阶以上硬乘一遍遍快得多。第六章化二次型还要再用一次。

什么时候走不通？需要 $n$ 个无关的特征向量。例如 $A=\begin{bmatrix}1&1\\0&1\end{bmatrix}$，$|\lambda E-A|=(\lambda-1)^2$ 只有一个特征值 1；代回解 $(E-A)\mathbf x=\mathbf 0$，即 $-x_2=0$，特征向量只能是 $(1,0)$ 的倍数。1 支凑不够 2 支，所以它不可对角化，这种矩阵只有一条特征方向。

<FigBox title="A 只把两条特征方向拉长；按列配对就得到 AP=PD" kind="图解" note="左图 v₁、v₂ 各乘一次 A，分别变 2、4 倍，方向没动；右图把两列结果与 P 的两列一一配对。看完该看出按列排成 P，就把 A 换成了对角阵。">
<svg viewBox="0 0 540 330" role="img" aria-label="两条特征方向上的向量只被拉长，以及 AP 与 PD 的逐列对应">
  <defs>
    <marker id="c5f4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)"/>
    </marker>
    <marker id="c5f6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)"/>
    </marker>
  </defs>
  <text x="140" y="20" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)">左：两条特征方向只变长</text>
  <line x1="25" y1="170" x2="250" y2="170" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="110" y1="215" x2="110" y2="55" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="55" y1="225" x2="195" y2="85" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="55" y1="115" x2="195" y2="225" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="110" y1="170" x2="138" y2="142" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#c5f4)"/>
  <line x1="110" y1="170" x2="166" y2="114" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#c5f4)"/>
  <line x1="110" y1="170" x2="138" y2="198" stroke="var(--vp-c-brand-2)" stroke-width="2" marker-end="url(#c5f6)"/>
  <line x1="110" y1="170" x2="222" y2="282" stroke="var(--vp-c-brand-2)" stroke-width="2.6" marker-end="url(#c5f6)"/>
  <circle cx="110" cy="170" r="2.6" fill="var(--vp-c-text-2)"/>
  <text x="140" y="120" font-size="12" fill="var(--vp-c-brand-1)">v₁</text>
  <text x="172" y="108" font-size="12" fill="var(--vp-c-brand-1)">Av₁=2v₁</text>
  <text x="118" y="208" font-size="12" fill="var(--vp-c-brand-2)">v₂</text>
  <text x="150" y="306" font-size="12" fill="var(--vp-c-brand-2)">Av₂=4v₂</text>
  <text x="400" y="20" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)">右：AP 与 PD 逐列对上</text>
  <text x="270" y="62" font-size="12" fill="var(--vp-c-text-1)">P 的两列 = v₁、v₂</text>
  <text x="270" y="88" font-size="12" fill="var(--vp-c-text-1)">AP 的两列 = Av₁、Av₂</text>
  <text x="270" y="114" font-size="12" fill="var(--vp-c-text-1)">= 2v₁、4v₂ = PD 的两列</text>
  <text x="270" y="140" font-size="12" fill="var(--vp-c-text-1)">D 的对角线就是 2、4</text>
  <text x="270" y="184" font-size="11.5" fill="var(--vp-c-text-3)">输入：A 与两个特征向量。</text>
  <text x="270" y="204" font-size="11.5" fill="var(--vp-c-text-3)">操作：算 Av₁、Av₂ 并按列配对。</text>
  <text x="270" y="224" font-size="11.5" fill="var(--vp-c-text-3)">结果：两列相同，故 AP=PD。</text>
</svg>
</FigBox>

## 四、实对称矩阵：特征方向天然垂直，只差单位化

先把「垂直」变成算术：同维两向量逐分量相乘再相加，得到的数叫点积；点积为 $0$ 就说它们垂直（也叫正交）；向量与自己的点积开根号就是长度。这三条属教材第五章第一节「向量的内积」，这里只用它们。

若 $A^T=A$（沿主对角线翻面不变），它有三条别人没有的好处：特征值全是实数；不同特征值的特征向量互相垂直；一定能对角化，而且能挑出一组两两垂直、长度为 1 的特征向量。

例 1 那两支正好能验：点积 $1\times1+1\times(-1)=0$，长度各是 $\sqrt{1^2+1^2}=\sqrt2$，垂直和长度都是算出来的，不是看出来的。把这样一组向量按列排成的矩阵记作 $Q$，它满足 $Q^TQ=E$，也就是 $Q^{-1}=Q^T$。这样的矩阵叫**正交矩阵**。

读一遍 $Q^TQ=E$：$Q$ 的列是 $q_1,\dots,q_n$，$Q^T$ 的行是 $q_1^T,\dots,q_n^T$，相乘后第 $(i,j)$ 位正好是 $q_i$ 与 $q_j$ 的点积。所以它逐条说的是：同一列与自己的点积为 $1$（长度平方为 $1$，即长度为 $1$），不同两列的点积为 $0$（垂直）。一句话，列两两垂直，长度都是 $1$。

对角化式于是写成

$$
Q^TAQ=D,\qquad A=QDQ^T
$$

读一遍：$Q$ 的列是单位特征向量，$Q^T$ 就是 $Q^{-1}$，$D$ 是特征值排成的对角阵、顺序与列一一对应。$Q$ 只换坐标轴（最多顺手翻个面），不拉伸不压扁，所以保长度、保夹角，第六章化二次型靠的正是这一点。

所以「单位化」不是可选项：$Q^TQ=E$ 要求每列自己的点积为 $1$；只做到两两垂直时 $Q^TQ$ 只是对角阵，不等于 $E$。

## 例题

例 1 求出全部特征值与特征向量并自查，例 2 用它完成对角化，例 3 换成正交矩阵。

::: tip 例 1 · 求特征值与特征向量 {#ex-eigen-1}
题目：求 $A=\begin{bmatrix}3&-1\\-1&3\end{bmatrix}$ 的全部特征值与特征向量。

先猜：$A$ 对称，两个特征值都是实数；迹是 $3+3=6$、行列式是 $9-1=8$，猜两数相加得 6、相乘得 8，也就是 2 和 4。

再算，先求 $\lambda$：

$$
\lambda E-A=\begin{bmatrix}\lambda-3&1\\1&\lambda-3\end{bmatrix},\qquad
|\lambda E-A|=(\lambda-3)^2-1=\lambda^2-6\lambda+8=(\lambda-2)(\lambda-4)
$$

令它等于零，得 $\lambda_1=2$、$\lambda_2=4$。

再算，再求特征向量：$\lambda_1=2$ 时 $2E-A=\begin{bmatrix}-1&1\\1&-1\end{bmatrix}$，方程 $-x_1+x_2=0$，取 $x_1=1$ 得 $\mathbf x_1=(1,1)^T$。$\lambda_2=4$ 时 $4E-A=\begin{bmatrix}1&1\\1&1\end{bmatrix}$，方程 $x_1+x_2=0$，取 $\mathbf x_2=(1,-1)^T$。

再回代：$A\mathbf x_1=(2,2)^T=2\mathbf x_1$、$A\mathbf x_2=(4,-4)^T=4\mathbf x_2$，两条定义式都成立；再用两条性质核对，$2+4=6=\operatorname{tr}A$、$2\times4=8=|A|$，与猜测一致。
:::

::: tip 例 2 · 对角化，并把高次幂写成两个幂次 {#ex-eigen-2}
题目：用例 1 的结果把 $A$ 对角化，并写出 $A^{k}$。

先猜：例 1 已拿到两支无关的特征向量，$n=2$ 凑够，可对角化；$P$ 按 $\lambda=2,4$ 排，$D$ 的对角线就是 2、4。

再算：$P=\begin{bmatrix}1&1\\1&-1\end{bmatrix}$，$D=\begin{bmatrix}2&0\\0&4\end{bmatrix}$。$|P|=1\times(-1)-1\times1=-2$，所以

$$
P^{-1}=\frac{1}{-2}\begin{bmatrix}-1&-1\\-1&1\end{bmatrix}=\begin{bmatrix}1/2&1/2\\1/2&-1/2\end{bmatrix}
$$

再回代：

$$
PD=\begin{bmatrix}2&4\\2&-4\end{bmatrix},\qquad
PDP^{-1}=\begin{bmatrix}2&4\\2&-4\end{bmatrix}\begin{bmatrix}1/2&1/2\\1/2&-1/2\end{bmatrix}=\begin{bmatrix}3&-1\\-1&3\end{bmatrix}=A
$$

乘回来正是原来的矩阵，所以 $A=PDP^{-1}$，从而 $A^{k}=P\begin{bmatrix}2^k&0\\0&4^k\end{bmatrix}P^{-1}$：只算两个数的 $k$ 次方，比连乘 $k$ 次省得多。顺序核对一遍：$P$ 第 1 列 $(1,1)$ 属于 2，$D$ 第 1 个对角元就是 2；两列一调换，$D$ 也得跟着换。
:::

::: tip 例 3 · 实对称矩阵正交对角化 {#ex-eigen-3}
题目：对同一个 $A$ 写出正交矩阵 $Q$ 与 $D$，并验证 $Q^TQ=E$、$Q^TAQ=D$。

先猜：例 1 的 $\mathbf x_1=(1,1)$、$\mathbf x_2=(1,-1)$ 点积为 $1-1=0$，已经垂直；两支长度都是 $\sqrt2$，各除以 $\sqrt2$ 就够。

再算：$Q=\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\end{bmatrix}$，$D=\begin{bmatrix}2&0\\0&4\end{bmatrix}$。

$$
Q^TQ=\frac12\begin{bmatrix}1&1\\1&-1\end{bmatrix}\begin{bmatrix}1&1\\1&-1\end{bmatrix}=\frac12\begin{bmatrix}2&0\\0&2\end{bmatrix}=E
$$

<FigBox title="把坐标轴转到两条互相垂直的特征方向" kind="图解" note="两条特征线是 y=x 与 y=−x，把坐标轴旋 45° 对齐它们。看完该看出新轴 q₁（λ=2）与 q₂（λ=4）互相垂直，正交对角化做的就是把特征方向立成新坐标轴。">
<svg viewBox="0 0 440 300" role="img" aria-label="坐标轴旋转四十五度对齐两条垂直的特征方向">
  <defs>
    <marker id="c5f5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)"/>
    </marker>
  </defs>
  <line x1="40" y1="150" x2="400" y2="150" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="90" y1="210" x2="90" y2="30" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="90" y1="150" x2="190" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#c5f5)"/>
  <line x1="90" y1="150" x2="190" y2="250" stroke="var(--vp-c-brand-2)" stroke-width="2.2" marker-end="url(#c5f5)"/>
  <line x1="126" y1="114" x2="144" y2="114" stroke="var(--vp-c-text-2)" stroke-width="1.3"/>
  <line x1="144" y1="114" x2="144" y2="132" stroke="var(--vp-c-text-2)" stroke-width="1.3"/>
  <text x="146" y="130" font-size="11" fill="var(--vp-c-text-2)">90°</text>
  <text x="196" y="46" font-size="12" fill="var(--vp-c-brand-1)">q₁（λ=2）</text>
  <text x="196" y="264" font-size="12" fill="var(--vp-c-brand-2)">q₂（λ=4）</text>
  <line x1="20" y1="274" x2="420" y2="274" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="20" y="292" font-size="11.5" fill="var(--vp-c-text-2)">输入：两条特征线；操作：旋 45° 对齐；结果：新轴垂直。</text>
</svg>
</FigBox>

再回代：

$$
Q^TAQ=\frac12\begin{bmatrix}1&1\\1&-1\end{bmatrix}\begin{bmatrix}3&-1\\-1&3\end{bmatrix}\begin{bmatrix}1&1\\1&-1\end{bmatrix}=\begin{bmatrix}2&0\\0&4\end{bmatrix}=D
$$

对角线上的 2、4 正是例 1 的两个特征值，顺序与 $Q$ 的列一致。与例 2 只差一处：那里的 $P$ 不保长度，这里的 $Q$ 只换坐标轴。
:::

## 三步换一套坐标

整条线只有 3 步：解 $|\lambda E-A|=0$ 拿 $\lambda$，代回 $(\lambda E-A)\mathbf x=\mathbf 0$ 拿向量，凑够 $n$ 支无关的把坐标换掉。拿到 $\lambda$ 别急着往下走，先看和是不是迹、积是不是行列式，这两条对任何方阵都成立，算错立刻露馅。

两个坑也顺手记住：$\mathbf x=\mathbf 0$ 不是特征向量，它对任何 $\lambda$ 都成立，等于什么都没说；$P$ 的列序与 $D$ 的对角线必须对上，第 $i$ 列永远配第 $i$ 个对角元，配错了 $PDP^{-1}$ 算出来就不是 $A$。单位化那一步也别省，实对称矩阵单位化之后才有 $Q^{-1}=Q^T$。

下一站是[06 · 二次型](06-quadratic.md)：那里把 $x^TAx$ 用正交对角化化简，交叉项就是靠它消掉的。想懂几何画面，翻现代版 [06 · 特征值、特征向量与对角化](../linalg/06-eigenvalues)。
