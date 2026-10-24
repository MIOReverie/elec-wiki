---
title: 06 · 特征值、特征向量与对角化
description: 特征向量是变换后方向不变的箭头，特征值是拉伸倍数；从几何直觉推出特征方程 det(A-λI)=0，再讲特征空间、代数/几何重数、对角化 A=PDP⁻¹、相似矩阵与矩阵幂，配对比 SVG 与三道 node 验算例题。
---

# 06 · 特征值、特征向量与对角化

<Meta time="55 min" level="核心" note="最易错：把「方向不变」当成「整条直线不动」——特征向量可被拉长、压缩、甚至反号（λ 为负），只要仍在原直线上即可；λ=0 时 Av=0 也是合法的特征值" />

**这一页要解决什么**：前面几章我们把矩阵看成「把箭头掰到新位置的变换」。但同一个变换下，绝大多数箭头会被掰弯、改变方向。这一页要研究极少数「特权」箭头——它们被变换后方向一点没变，只是被拉长或压缩。读完你应该能回答：什么样的箭头会方向不变；那个「拉伸倍数」怎么用特征方程求出来；以及学会「把矩阵换到这些特权箭头的坐标系里」，让最难的矩阵运算（比如 A 的 100 次方）变成一次心算。

::: tip 读这页之前
- **需要会**：矩阵乘向量与「矩阵 = 线性变换」的图景（[第 2 章 · 矩阵与线性变换](02-matrices.md)）、解齐次线性方程组与零空间（[第 4 章 · 向量空间与四大子空间](04-subspaces.md)）、二阶行列式的计算（[第 5 章 · 行列式](05-determinant.md)）。
- **这一页用到的符号**：$\mathbf v$（特征向量，非零箭头）、$\lambda$（特征值，拉伸倍数）、$I$（单位矩阵，对角线全是 1 其余为 0）、$P$（把特征向量排成列的方阵）、$D$（对角线是特征值的对角矩阵）。矩阵、向量、行列式的通用符号见[符号与约定](../guide/notation.md)。
- **高中数学**：解一元二次方程 $\lambda^2-4\lambda+3=0$（配方或十字相乘）；2×2 行列式 $\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc$。
- **两个术语先给一句话**：**特征向量**（eigenvector）是变换后方向不变、只被拉伸的向量；**特征值**（eigenvalue）是那个拉伸倍数。正文逐条展开。
:::

先看一个具体的变换。上一章学过的矩阵乘法里，变换 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ 把标准基 $\mathbf i=(1,0)$ 送到 $(2,1)$——原本指向正东的箭头，被掰得朝向了东北偏上。这种「掰弯」几乎是所有向量的命运。

但这条变换有一类箭头是例外。你很快会算出来：向量 $(1,1)$ 被它乘完得到 $(3,3)$，方向还是那个 45° 方向，只是长度变成了 3 倍；向量 $(1,-1)$ 被乘完得到 $(1,-1)$，连长度都没变。**同一个变换，有的箭头被掰弯，有的箭头只是被拉伸**——后者就是这一页的主角。

## 结论先行

1. **特征向量**是变换 $A$ 下方向不变的箭头：$A\mathbf v=\lambda\mathbf v$；**特征值** $\lambda$ 是它被拉伸的倍数，可正可负可为零。
2. **特征方程** $\det(A-\lambda I)=0$ 把「找方向不变的箭头」翻译成「解一个多项式方程」，解出的每个 $\lambda$ 都对应一群方向不变的箭头。
3. **特征空间**是同一特征值对应的全部特征向量（连同零向量）张成的子空间，其维数叫**几何重数**，永远不超过该特征值的**代数重数**（它在特征多项式里的重根次数）。
4. **对角化** $A=PDP^{-1}$：$P$ 的列是 $n$ 个线性无关的特征向量，$D$ 的对角线是相应特征值。做到这一步，$A$ 在特征向量坐标系里就只是一个「沿各轴独立拉伸」。
5. **相似矩阵** $P^{-1}AP$ 是同一个变换换了个坐标系；**矩阵幂** $A^k=P D^k P^{-1}$ 只要把对角线上的 $\lambda$ 各自乘 $k$ 次方。**可对角化**当且仅当每个特征值的几何重数都等于代数重数（等价于能凑出 $n$ 个线性无关特征向量）。

::: tip 一句话抓住本页的结构
整页就是一条主线：**找方向不变的箭头（特征向量）→ 解方程拿到拉伸倍数（特征值）→ 把这些箭头排成新坐标系（矩阵 P）→ 变换在新坐标系里变成纯拉伸（对角矩阵 D）→ 复杂运算全变简单（幂、相似）**。第七节给一个「什么时候走不通」的反例，把这条主线的适用范围画清楚。
:::

## 一、特征向量：变换下方向不变的箭头

这一节只做一件事：把「特征向量」这个词的几何含义钉死，别急着算。

**特征向量（eigenvector）** 是这样一个非零向量：被变换 $A$ 作用之后，方向不变，只被拉伸或压缩一个倍数。写成等式：

$$
A\mathbf v = \lambda \mathbf v
$$

右边 $\lambda\mathbf v$ 和 $\mathbf v$ 方向相同（$\lambda>0$）、相反（$\lambda<0$）或干脆是零（$\lambda=0$），但一定还躺在 $\mathbf v$ 原来的那条直线上。**特征值（eigenvalue）** 就是那个拉伸倍数 $\lambda$。

看图最清楚。下面这张图里，红箭头 $(1,1)$ 是特征向量：乘上 $A$ 后仍指向 45°，只是从长度 $\sqrt2$ 拉长到 $3\sqrt2$；蓝箭头 $(1,0)$ 是普通向量：乘上 $A$ 后被掰弯，指向完全变了。

<FigBox title="特征向量方向不变 vs 普通向量被掰弯" kind="图解" note="变换 A = [[2,1],[1,2]]。红箭头 (1,1) 是特征向量：乘完后还是 45° 方向，只拉长 3 倍；蓝箭头 (1,0) 被掰弯到 (2,1)。这就是「特权方向」与普通方向的差别。" >

<svg viewBox="0 0 480 260" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="60" y1="200" x2="450" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="60" y1="200" x2="60" y2="24" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<path d="M 446 195 L 450 200 L 446 205 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<path d="M 55 28 L 60 24 L 65 28 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<text x="454" y="204" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">x</text>
<text x="54" y="18" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">y</text>
<g stroke="var(--vp-c-divider)" stroke-width="1">
<line x1="100" y1="196" x2="100" y2="204"/><line x1="140" y1="196" x2="140" y2="204"/><line x1="180" y1="196" x2="180" y2="204"/>
<line x1="56" y1="160" x2="64" y2="160"/><line x1="56" y1="120" x2="64" y2="120"/><line x1="56" y1="80" x2="64" y2="80"/>
</g>
<line x1="60" y1="200" x2="224" y2="36" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="60" y1="200" x2="100" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="1.8" stroke-dasharray="5 4"/>
<line x1="60" y1="200" x2="180" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 172 88 L 180 80 L 172 72 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<text x="86" y="166" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-it">v</text>
<text x="168" y="60" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">Av = 3v</text>
<line x1="60" y1="200" x2="100" y2="200" stroke="var(--vp-c-text-2)" stroke-width="1.8" stroke-dasharray="5 4"/>
<line x1="60" y1="200" x2="140" y2="160" stroke="var(--vp-c-text-2)" stroke-width="2.4"/>
<path d="M 132 164 L 140 160 L 133 154 Z" fill="var(--vp-c-text-2)" stroke="var(--vp-c-text-2)"/>
<text x="92" y="216" font-size="12.5" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-it">w</text>
<text x="146" y="150" font-size="12.5" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-w700">Aw</text>
<text x="228" y="30" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">方向不变，只被拉长 3 倍</text>
<text x="150" y="190" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">方向被掰弯</text>
</svg>

</FigBox>

**看图能读出什么**：特征向量是「方向稳定」的箭头，普通向量是「方向漂移」的箭头。判断一个向量是不是特征向量，就看 $A\mathbf v$ 与 $\mathbf v$ 是否共线（相差一个倍数）；零向量不行，因为零向量被任何矩阵都映成零，没有「方向」可言，所以定义里先排除 $\mathbf v=\mathbf 0$。

为什么这件事重要？因为如果你找到了一个方向不变的箭头，那么**这个方向上的所有箭头都一起被拉伸同一个倍数**：若 $A\mathbf v=\lambda\mathbf v$，则 $A(c\mathbf v)=c(A\mathbf v)=c\lambda\mathbf v=\lambda(c\mathbf v)$。于是整个变换在「这一条直线」上就退化成一个单纯的缩放，特别容易理解。下一节我们就问：怎么把这条直线找出来。

## 二、特征方程：把「方向不变」翻译成代数

这一节的目标：把上一节的几何条件 $A\mathbf v=\lambda\mathbf v$ 改写成一个只含 $\lambda$ 的方程，让「找特权方向」变成「解方程」。

先把 $A\mathbf v=\lambda\mathbf v$ 移项，把右边也写成矩阵乘向量：

$$
A\mathbf v-\lambda\mathbf v=\mathbf 0
\quad\Longrightarrow\quad
(A-\lambda I)\mathbf v=\mathbf 0
$$

这里 $I$ 是单位矩阵，作用是不变（$I\mathbf v=\mathbf v$），所以 $\lambda\mathbf v=\lambda I\mathbf v$。移项后我们得到的是一个**齐次线性方程组**：$(A-\lambda I)\mathbf v=\mathbf 0$。

我们要的是**非零**的 $\mathbf v$。而齐次方程组有非零解，当且仅当系数矩阵不可逆（见[第 4 章](04-subspaces.md)的零空间讨论），也就是它的行列式为零（见[第 5 章](05-determinant.md)「行列式为零 ⇔ 不可逆」）：

$$
\det(A-\lambda I)=0
$$

这个方程叫**特征方程（characteristic equation）**，左边展开后是关于 $\lambda$ 的 $n$ 次多项式，叫**特征多项式（characteristic polynomial）**，它的根就是全部特征值。

**为什么这一步是整章最关键的转折**：我们从「找一个向量」降维成了「解一个方程」。原来 $A\mathbf v=\lambda\mathbf v$ 里 $\mathbf v$ 和 $\lambda$ 都是未知的，混在一起；现在先把 $\lambda$ 解出来，再代回 $(A-\lambda I)\mathbf v=\mathbf 0$ 求 $\mathbf v$，问题被拆成了两步、每步都简单。

用 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ 走一遍：

$$
A-\lambda I=\begin{pmatrix}2-\lambda&1\\1&2-\lambda\end{pmatrix}
$$

$$
\det(A-\lambda I)=(2-\lambda)(2-\lambda)-1=\lambda^2-4\lambda+3
$$

令它等于零，解一元二次方程：

$$
\lambda^2-4\lambda+3=(\lambda-1)(\lambda-3)=0
\quad\Longrightarrow\quad
\lambda_1=1,\ \lambda_2=3
$$

两个特征值 1 和 3。再代回求对应的特征向量（这就是下一节例题 1 的内容）。注意两个小验算：特征值之和 $1+3=4$ 正好等于主对角线之和 $2+2=4$（叫**迹** trace），特征值之积 $1\times3=3$ 正好等于行列式 $\det A=4-1=3$。这两个等式对任意方阵都成立，是极好的自查手段。下一节把「代回求向量」这一步展开，并说清「同一特征值对应多少向量」。

## 三、特征空间与重数：一个特征值对应多少向量

这一节的目标：回答「特征值求出来之后，对应的特征向量有几个、能张成什么」。

对每个特征值 $\lambda$，把它的特征向量全部收集起来，再补上零向量，得到的集合叫**特征空间（eigenspace）**，记作

$$
E_\lambda=\{\mathbf v : (A-\lambda I)\mathbf v=\mathbf 0\}
$$

这其实就是矩阵 $(A-\lambda I)$ 的**零空间**（[第 4 章](04-subspaces.md)讲过：零空间是「被压到原点的所有向量」）。所以特征空间是一个子空间，有维数，维数叫 $\lambda$ 的**几何重数（geometric multiplicity）**。

### 例 1 · 求 A 的特征值与特征向量

对 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$，上一节已算出 $\lambda_1=1$、$\lambda_2=3$。现在分别代回 $(A-\lambda I)\mathbf v=\mathbf 0$。

**先想什么**：先分别写出 $A-I$ 与 $A-3I$ 这两个矩阵，再解齐次方程组——这是纯手工的消元，别急着猜答案。

对 $\lambda_1=1$：

$$
A-I=\begin{pmatrix}1&1\\1&1\end{pmatrix}
\quad\Longrightarrow\quad
\begin{pmatrix}1&1\\1&1\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}0\\0\end{pmatrix}
$$

两行是同一个方程 $x+y=0$，即 $y=-x$。取 $x=1$ 得 $\mathbf v_1=\begin{pmatrix}1\\-1\end{pmatrix}$。

对 $\lambda_2=3$：

$$
A-3I=\begin{pmatrix}-1&1\\1&-1\end{pmatrix}
\quad\Longrightarrow\quad
-x+y=0\ \text{即}\ y=x
$$

取 $x=1$ 得 $\mathbf v_3=\begin{pmatrix}1\\1\end{pmatrix}$。

**验算**（把求出的向量代回 $A\mathbf v=\lambda\mathbf v$ 检查）：

$$
A\mathbf v_1=\begin{pmatrix}2&1\\1&2\end{pmatrix}\begin{pmatrix}1\\-1\end{pmatrix}=\begin{pmatrix}1\\-1\end{pmatrix}=1\cdot\mathbf v_1
$$

$$
A\mathbf v_3=\begin{pmatrix}2&1\\1&2\end{pmatrix}\begin{pmatrix}1\\1\end{pmatrix}=\begin{pmatrix}3\\3\end{pmatrix}=3\cdot\mathbf v_3
$$

两个都满足 $A\mathbf v=\lambda\mathbf v$。所以特征空间 $E_1=\operatorname{span}\{(1,-1)\}$ 是一维直线（几何重数 1），$E_3=\operatorname{span}\{(1,1)\}$ 也是一维（几何重数 1）。这里每个特征值都只出现一次（代数重数 1），几何重数也是 1，两者相等——这个「相等」正是后面第七节能对角化的关键。

**为什么两条特征直线一个指向下、一个指向上**：$(1,-1)$ 与 $(1,1)$ 互相垂直，这是对称矩阵的额外福利（对称矩阵的不同特征向量天然正交，第 7 章会专门讲）。对一般矩阵，不同特征值的特征向量只是「线性无关」，不一定垂直。下一节把这两条特征直线当作新坐标轴，看看会发生什么。

## 四、对角化：换到特征向量坐标系

这一节的目标：把上一节求到的两个特征向量排成矩阵 $P$，证明 $A=PDP^{-1}$，并说清它为什么是「换个坐标系看同一个变换」。

**对角化（diagonalization）** 是指：找一个可逆矩阵 $P$ 和一个对角矩阵 $D$，使得

$$
A = PDP^{-1}
$$

其中 $P$ 的列就是 $n$ 个线性无关的特征向量，$D$ 的对角线就是对应的特征值。为什么成立？把 $P$ 按列写成 $\mathbf v_1,\dots,\mathbf v_n$，则

$$
AP = A[\mathbf v_1\ \cdots\ \mathbf v_n] = [A\mathbf v_1\ \cdots\ A\mathbf v_n] = [\lambda_1\mathbf v_1\ \cdots\ \lambda_n\mathbf v_n] = P D
$$

两边右乘 $P^{-1}$ 就得到 $A=PDP^{-1}$。这一步的每一步都是前面定义的直接搬运，没有魔法。

### 例 2 · 对 A 对角化

对 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$，把例 1 的两个特征向量排成 $P$，对应特征值 1、3 排成 $D$：

$$
P=\begin{pmatrix}1&1\\-1&1\end{pmatrix},\qquad
D=\begin{pmatrix}1&0\\0&3\end{pmatrix}
$$

**先想什么**：$P$ 的列的顺序必须和 $D$ 对角线上的 $\lambda$ 一一对应——第一列 $(1,-1)$ 配 $\lambda=1$，第二列 $(1,1)$ 配 $\lambda=3$。顺序换一下，$D$ 的对角线也要跟着换。

先算 $P$ 的行列式与逆：

$$
\det P=1\cdot1-1\cdot(-1)=2,\qquad
P^{-1}=\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}
$$

**验算**（关键一步，矩阵乘法均经 node 逐项核对）：把 $PDP^{-1}$ 乘出来，看是否还原成 $A$。

$$
PD=\begin{pmatrix}1&1\\-1&1\end{pmatrix}\begin{pmatrix}1&0\\0&3\end{pmatrix}=\begin{pmatrix}1&3\\-1&3\end{pmatrix}
$$

$$
PDP^{-1}=\begin{pmatrix}1&3\\-1&3\end{pmatrix}\cdot\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}=\frac12\begin{pmatrix}4&2\\2&4\end{pmatrix}=\begin{pmatrix}2&1\\1&2\end{pmatrix}=A
$$

所以 $A=PDP^{-1}$ 成立。

**几何含义**：$P^{-1}$ 把向量从标准坐标系换到「特征向量坐标系」（坐标轴是 $(1,-1)$ 和 $(1,1)$ 这两条直线）；在这个新坐标系里，变换 $A$ 变成了 $D$——只是沿第一条轴拉长 1 倍（不动）、沿第二条轴拉长 3 倍，**没有任何旋转和掰弯**。这就是对角化的全部意义：一个看着歪斜的变换，换个坐标系就变成最朴素的「沿轴拉伸」。

<FigBox title="同一变换在两个坐标系里的样子" kind="图解" note="左：标准坐标系（i、j 轴）里，A 把基向量 i=(1,0)→(2,1)、j=(0,1)→(1,2)，网格被斜切。右：换成特征向量坐标系（v1=(1,-1)、v3=(1,1) 作轴），同一个变换 D 只是沿 v1 轴不动、沿 v3 轴拉长 3 倍，方向一点不变。" >

<svg viewBox="0 0 520 240" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="20" y="26" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">标准坐标系：A 把网格斜切</text>
<line x1="40" y1="190" x2="240" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="40" y1="190" x2="40" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="40" y1="190" x2="140" y2="190" stroke="var(--vp-c-text-2)" stroke-width="1.8" stroke-dasharray="5 4"/>
<line x1="40" y1="190" x2="40" y2="90" stroke="var(--vp-c-text-2)" stroke-width="1.8" stroke-dasharray="5 4"/>
<text x="132" y="206" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-it">i</text>
<text x="30" y="96" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-it">j</text>
<line x1="40" y1="190" x2="140" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 132 146 L 140 140 L 133 133 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="40" y1="190" x2="90" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 84 96 L 90 90 L 83 84 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<text x="146" y="138" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">Ai</text>
<text x="68" y="84" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">Aj</text>
<text x="290" y="26" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">特征向量坐标系：D 只沿轴拉伸</text>
<line x1="290" y1="190" x2="490" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="290" y1="190" x2="290" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="290" y1="190" x2="350" y2="130" stroke="var(--vp-c-text-2)" stroke-width="1.8" stroke-dasharray="5 4"/>
<path d="M 343 134 L 350 130 L 344 124 Z" fill="var(--vp-c-text-2)" stroke="var(--vp-c-text-2)"/>
<text x="330" y="168" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-w700">v₁</text>
<line x1="290" y1="190" x2="290" y2="40" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 284 46 L 290 40 L 296 46 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<text x="298" y="48" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">3v₃</text>
<text x="40" y="228" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A 把正交网格掰成平行四边形</text>
<text x="290" y="228" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">D 保持两条轴方向不动，只改长度</text>
</svg>

</FigBox>

**看图能读出什么**：同一个变换，在标准坐标系里是「斜切」，在特征向量坐标系里是「沿轴拉伸」。对角化就是主动换到那个「让变换最朴素」的坐标系。下一节把「换坐标系」这件事单独拎出来，给它一个正式名字。

## 五、相似矩阵：同一变换的不同坐标系

这一节的目标：给「换坐标系」一个正式名字，并说清它为什么不是「另一个矩阵」，而是「同一个变换的另一副面孔」。

设 $P$ 可逆。矩阵 $B=P^{-1}AP$ 叫 $A$ 的**相似矩阵（similar matrix）**，$A$ 与 $B$ 相似。几何上，$A$ 和 $B$ 是**同一个线性变换在不同坐标系下的写法**：$P^{-1}$ 负责「进入新坐标系」，$A$ 在新坐标系里做变换，$P$ 再「换回原坐标系」。

$$
\mathbf x \xrightarrow{\ P^{-1}\ } \mathbf y \xrightarrow{\ A\ } \mathbf z \xrightarrow{\ P\ } \text{回到原坐标}
$$

所以 $P^{-1}AP$ 读作「换进去、做变换、换出来」。上一节的对角化 $A=PDP^{-1}$ 等价于 $D=P^{-1}AP$——即 $A$ 与对角矩阵 $D$ 相似，$A$ 只是 $D$ 在标准坐标系下的样子。

**相似矩阵不变量**：相似矩阵的行列式、迹、特征值、秩都相同（因为它们描述的是同一个变换，这些量不随坐标系变化）。例如 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ 与 $D=\begin{pmatrix}1&0\\0&3\end{pmatrix}$ 的迹都是 $1+3=4$、行列式都是 $3$、特征值都是 $\{1,3\}$。**但特征向量会变**：特征向量是坐标系里的具体箭头，换了坐标系坐标自然变——$D$ 的特征向量就是标准基 $(1,0),(0,1)$，而 $A$ 的特征向量是 $(1,-1),(1,1)$，两者通过 $P$ 互相转换。

这一节一句话收尾：**相似矩阵是「同一个变换，两套坐标」**。利用这一点，下一节解决一个实际问题——矩阵的高次幂。

## 六、矩阵的幂：对角化最实用的收益

这一节的目标：用对角化把 $A^k$ 从「$k$ 次矩阵乘法」压缩成「一次对角幂 + 两次乘法」。

为什么要算 $A^k$？工程里反复出现的递推（比如离散系统状态按 $\mathbf x_{n+1}=A\mathbf x_n$ 演化）会冒出 $A^k$；直接做 $k$ 次矩阵乘法既慢又容易错。对角化之后：

$$
A^k = (PDP^{-1})^k = PDP^{-1}\,PDP^{-1}\cdots PDP^{-1} = P D^k P^{-1}
$$

中间的 $P^{-1}P=I$ 全部抵消，只剩下两头的 $P$、$P^{-1}$ 和中间的 $D^k$。而**对角矩阵的幂等于对角元素各自取幂**：

$$
D^k=\begin{pmatrix}\lambda_1& & \\ & \ddots & \\ & & \lambda_n\end{pmatrix}^k=\begin{pmatrix}\lambda_1^k& & \\ & \ddots & \\ & & \lambda_n^k\end{pmatrix}
$$

于是最难的 $k$ 次乘法变成了「把 $\lambda$ 各自乘 $k$ 次方」。

### 例 3 · 用对角化算 A⁵

对 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$，已知 $P=\begin{pmatrix}1&1\\-1&1\end{pmatrix}$、$D=\begin{pmatrix}1&0\\0&3\end{pmatrix}$、$P^{-1}=\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}$，求 $A^5$。

**先想什么**：别碰 5 次矩阵乘法，直接套 $A^5=PD^5P^{-1}$，其中 $D^5=\begin{pmatrix}1&0\\0&3^5\end{pmatrix}=\begin{pmatrix}1&0\\0&243\end{pmatrix}$。

$$
A^5=\begin{pmatrix}1&1\\-1&1\end{pmatrix}\begin{pmatrix}1&0\\0&243\end{pmatrix}\cdot\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}
=\begin{pmatrix}1&243\\-1&243\end{pmatrix}\cdot\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}
=\frac12\begin{pmatrix}244&242\\242&244\end{pmatrix}
=\begin{pmatrix}122&121\\121&122\end{pmatrix}
$$

**验算**：用直接的矩阵乘法从 $A$ 连乘五次，得到 $A^2=\begin{pmatrix}5&4\\4&5\end{pmatrix}$，$A^4=\begin{pmatrix}41&40\\40&41\end{pmatrix}$，$A^5=\begin{pmatrix}122&121\\121&122\end{pmatrix}$，与对角化结果完全一致（node 验算）。两种路子殊途同归，说明 $A=PDP^{-1}$ 这条分解是可靠的。

**感受一下收益**：如果换成 $A^{100}$，直接乘法要 99 次，而对角化只是 $D^{100}=\begin{pmatrix}1&0\\0&3^{100}\end{pmatrix}$ 再乘两头，两三次矩阵乘法就搞定。这就是把「掰弯的变换」换成「沿轴拉伸」换来的红利。下一节回答那个绕不开的问题：是不是每个矩阵都能这么干？

## 七、可对角化的条件：什么时候这条路走不通

这一节的目标：给出「能对角化」的判据，并用一个反例说明它确实会失败。

一个 $n\times n$ 矩阵**可对角化（diagonalizable）**，当且仅当它能凑出 $n$ 个线性无关的特征向量（等价于每个特征值的几何重数都等于代数重数）。这里两个「重数」需要分清：

| 重数 | 定义 | 含义 |
| --- | --- | --- |
| **代数重数** | 特征值 $\lambda$ 在特征多项式里的重根次数 | 它作为方程根「出现几次」 |
| **几何重数** | 特征空间 $E_\lambda$ 的维数 | 它对应「几个独立方向」 |

两者永远满足：**几何重数 ≤ 代数重数**。当某个特征值的几何重数严格小于代数重数时，特征向量凑不满 $n$ 个，矩阵不可对角化。

**反例**：剪切矩阵 $B=\begin{pmatrix}1&1\\0&1\end{pmatrix}$。它的特征方程：

$$
\det(B-\lambda I)=\begin{vmatrix}1-\lambda&1\\0&1-\lambda\end{vmatrix}=(1-\lambda)^2=0
$$

唯一的特征值 $\lambda=1$，代数重数 2。但代回求特征向量：

$$
B-I=\begin{pmatrix}0&1\\0&0\end{pmatrix}
\quad\Longrightarrow\quad
\begin{pmatrix}0&1\\0&0\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}0\\0\end{pmatrix}
$$

即 $y=0$、$x$ 任意，特征空间 $E_1=\operatorname{span}\{(1,0)\}$ 只有一维，几何重数 1。**几何重数 1 < 代数重数 2**，所以 $B$ 不可对角化——它只有一个独立特征方向，凑不出两个线性无关的特征向量。几何上看，剪切变换把所有方向都「推」向同一侧，没有第二个方向能保持不变。

**两个实用的充分条件**（够用即好）：
1. **有 $n$ 个互不相同的特征值** ⇒ 一定可对角化（互异特征值对应的特征向量自动线性无关）。
2. **对称矩阵（$A=A^T$）** ⇒ 一定可对角化，而且能选出一组正交的特征向量（第 7 章细讲）。

一句话收尾：对角化是「大多数」好矩阵的福利，但剪切这类矩阵说明它不总是免费的。下面把这些条件之外最常见的坑列成清单，然后就可以合上这一页、把路指到下一章了。

## 易错清单

1. **把「方向不变」理解成「长度不变」**：特征向量只要求 $A\mathbf v$ 与 $\mathbf v$ 共线，长度可随便变。$\lambda=1$ 才长度不变，$\lambda=-1$ 是反向、$\lambda=2$ 是拉长一倍，都算特征向量。
2. **漏掉 $\lambda=0$ 的情况**：$A\mathbf v=0$ 说明 $\mathbf v$ 在零空间里，$\lambda=0$ 是合法特征值，意味着 $A$ 不可逆。别在解特征方程时把 0 这个根丢掉。
3. **把「特征向量」允许 $\mathbf v=\mathbf 0$**：零向量被任何矩阵映成零，没资格当特征向量，定义里必须排除。
4. **$P$ 的列和 $D$ 的对角线顺序对不上**：$P$ 第 $i$ 列的向量必须配 $D$ 第 $i$ 个对角元素。顺序错了 $PDP^{-1}$ 就不再等于 $A$（虽然特征值集合没变）。
5. **特征向量没有归一化**：特征向量乘以任意非零常数仍是特征向量，所以答案不唯一；写 $P$ 时随意选一组线性无关的即可，验算看 $A\mathbf v=\lambda\mathbf v$ 而不是背「标准答案」。
6. **以为有重根就一定不能对角化**：重根只是「危险信号」，能不能对角化看几何重数是否追平代数重数。例如 $2I=\begin{pmatrix}2&0\\0&2\end{pmatrix}$ 特征值 2 是二重根，但它是单位阵的倍数，任意向量都是特征向量，照样可对角化（它本身就是对角阵）。

**这一页的指路**：特征向量把「复杂的矩阵变换」在特定方向上简化成「缩放」。下一章[第 7 章 · 正交、投影与二次型](07-orthogonality.md)会把「方向」这个词再升级——用点积度量角度、用正交基做投影，并专门研究对称矩阵（特征向量互相垂直）和二次型，那是对称矩阵理论与机器学习里主成分分析（PCA）的地基。
