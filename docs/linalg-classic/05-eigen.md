---
title: 05 · 特征值与特征向量
description: 特征向量是被矩阵乘后方向不变、只被拉伸的非零向量，特征值是拉伸倍数；特征方程 |λI-A|=0 把求特征值变成解多项式，代入 (λI-A)x=0 解齐次方程组得到特征向量，再拼出 P 完成相似对角化，配特征方向与对角化示意图、三道 node 验算例题。
---

# 05 · 特征值与特征向量

<Meta time="50 min" level="核心" note="最易错：把特征向量写成零向量，或对角化时 P 的列顺序与 D 对角线上特征值的顺序对不上" />

**这一页对应教材第几章**：同济《线性代数》第五章「相似矩阵及二次型」的前半部分——特征值与特征向量、相似矩阵与相似对角化、实对称矩阵的对角化（二次型留到下一章）。

**这一页要解决什么**：读完你能独立完成三件事：给定一个方阵，第一求它的全部特征值与特征向量，第二判断它能否对角化、并写出 $P$ 与对角矩阵 $D$ 使 $A=PDP^{-1}$，第三对实对称矩阵用正交矩阵把它化成对角形。三件事对应一句口诀「求特征值 → 代入求特征向量 → 对角化」。

::: tip 读这页之前
- **需要会**：二阶、三阶行列式的计算（见[现代版 · 行列式](../linalg/05-determinant.md)）；矩阵乘法与逆矩阵（见[现代版 · 矩阵与线性变换](../linalg/02-matrices.md)）；解齐次线性方程组（见[现代版 · 高斯消元与线性方程组](../linalg/03-elimination.md)）。
- **这一页用到的符号**：$\lambda$（特征值）、$\mathbf x$（特征向量，必须非零）、$I$（单位矩阵）、$P$（特征向量排成的方阵）、$D$（对角矩阵）、$\operatorname{tr}A$（迹）、$\det A$（行列式）。通用符号见[符号与约定](../guide/notation.md)。
- **高中数学**：解一元二次方程（配方或十字相乘）；二阶行列式 $\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc$。
- **两个术语先给一句话**：**特征向量**（eigenvector）是被 $A$ 乘后方向不变、只被拉伸的向量；**特征值**（eigenvalue）是那个拉伸倍数。
:::

先看一个数字。矩阵 $A=\begin{pmatrix}3&-1\\-1&3\end{pmatrix}$ 作用在向量 $\mathbf x=(1,1)$ 上：$A(1,1)=(2,2)=2(1,1)$，方向还是 45°，长度变成了 2 倍；作用在 $(1,-1)$ 上：$A(1,-1)=(4,-4)=4(1,-1)$，方向还是 -45°，长度变成 4 倍。**有的向量被矩阵掰弯，有的向量只是被拉长**——后者就是本章的主角。

## 结论先行

1. **特征向量**是被 $A$ 乘后方向不变、只被拉伸的**非零**向量：$A\mathbf x=\lambda\mathbf x$；**特征值** $\lambda$ 是拉伸倍数，可正可负可为零。
2. **求特征值走特征方程** $|\lambda I-A|=0$：写成 $\lambda$ 的多项式、解出所有根。
3. **求特征向量走齐次方程组** $(\lambda I-A)\mathbf x=\mathbf 0$ 的**非零解**：每个 $\lambda$ 代回解一次，永远别把 $\mathbf x=\mathbf 0$ 算进去。
4. **特征值之和 = 迹、之积 = 行列式**：$\sum\lambda_i=\operatorname{tr}A$、$\prod\lambda_i=\det A$，是每步都能用的自查。
5. **对角化** $A=PDP^{-1}$：$P$ 的列是 $n$ 个线性无关特征向量，$D$ 对角线是相应特征值；凑不满 $n$ 个就不可对角化，实对称矩阵一定能对角化、还能选正交的 $Q$。

::: tip 一句话抓住本章结构
整章一条主线：**找方向不变的向量（特征向量）→ 解方程拿到拉伸倍数（特征值）→ 把这些向量排成 $P$（换坐标系）→ 变换变成纯拉伸（对角阵 $D$）**。第五节回答「换坐标系」的正式名字（相似矩阵），第七节讲实对称矩阵的额外福利（正交对角化）。
:::

## 一、特征值与特征向量：方向不变、只被拉伸

这一节的目标：把「特征值」和「特征向量」两个词的定义钉死，先别急着算。

设 $A$ 是 $n$ 阶方阵，如果存在一个数 $\lambda$ 和一个**非零**列向量 $\mathbf x$，使得

$$
A\mathbf x = \lambda\mathbf x
$$

就称 $\lambda$ 是 $A$ 的一个**特征值（eigenvalue）**，$\mathbf x$ 是 $A$ 的属于 $\lambda$ 的一个**特征向量（eigenvector）**。

拆开看这句话：左边 $A\mathbf x$ 是「被矩阵作用后的结果」，右边 $\lambda\mathbf x$ 是「原来那个向量乘一个数」。两者相等，说明**作用的结果还躺在原来那条直线上**——$\lambda>0$ 时同向伸长，$\lambda<0$ 时反向，$\lambda=0$ 时被压成零。但不管怎样，方向（所在的直线）不变，所以叫「特征方向」。

**为什么必须排除 $\mathbf x=\mathbf 0$**：零向量被任何矩阵都映成零，$A\mathbf 0=\lambda\mathbf 0$ 对任意 $\lambda$ 都成立，它会冒充任何数的特征向量，把「特征值」这个概念架空。所以定义里先约定 $\mathbf x\neq\mathbf 0$。

一条有用的小结论：若 $\mathbf x$ 是特征向量，那么**同一条直线上的所有非零倍数** $c\mathbf x$（$c\neq0$）也是特征向量，因为 $A(c\mathbf x)=c\,A\mathbf x=c\,\lambda\mathbf x=\lambda(c\mathbf x)$。所以特征向量**不唯一**，答案给「一个代表」即可。下一节问：怎么把满足 $A\mathbf x=\lambda\mathbf x$ 的 $\lambda$ 找出来。

## 二、特征方程：把求 λ 变成解 |λI-A|=0

这一节的目标：把 $A\mathbf x=\lambda\mathbf x$ 里两个未知量（$\lambda$ 和 $\mathbf x$）拆开，先把 $\lambda$ 解出来。

把 $A\mathbf x=\lambda\mathbf x$ 移项，右边写成矩阵乘向量（$\lambda\mathbf x=\lambda I\mathbf x$）：

$$
A\mathbf x-\lambda I\mathbf x=\mathbf 0
\quad\Longrightarrow\quad
(\lambda I-A)\mathbf x=\mathbf 0
$$

这是一个**齐次线性方程组**。我们要的是**非零解** $\mathbf x$。回忆前面的结论：齐次方程组有非零解，当且仅当系数矩阵的行列式为零。于是：

$$
|\lambda I-A|=0
$$

这个方程叫**特征方程（characteristic equation）**，左边 $|\lambda I-A|$ 展开后是关于 $\lambda$ 的 $n$ 次多项式，叫**特征多项式**，它的根就是全部特征值。

**这一步为什么是转折**：原来「找一个向量」要同时猜 $\lambda$ 和 $\mathbf x$，现在先只解一个关于 $\lambda$ 的方程，$\lambda$ 到手后再代回 $(\lambda I-A)\mathbf x=\mathbf 0$ 求 $\mathbf x$，两步各自都简单。

> **两个约定**：教材里也常写 $\det(\lambda E-A)=0$（$E$ 即单位矩阵 $I$），或 $\det(A-\lambda I)=0$。$\lambda I-A$ 与 $A-\lambda I$ 只差一个负号，**齐次方程组的解完全相同**，特征值也相同（特征多项式最多差 $(-1)^n$ 倍），做题用哪个都行，本章统一用 $|\lambda I-A|=0$。

下面两节把「解出 $\lambda$、代回求 $\mathbf x$」落成可操作的三步。

## 三、计算方法：求特征值与特征向量（三步路线 + 前两步）

这一节的目标：给一条死记就能用的步骤，并完整走完前两步。

整章的算法就一句话：**求特征值 → 代入求特征向量 → 对角化**。前两步是：

**第 1 步 · 求特征值**：写 $\lambda I-A$，算 $|\lambda I-A|$，令它等于 0，解出所有 $\lambda$。

**第 2 步 · 代入求特征向量**：对每个 $\lambda$，把它代进 $(\lambda I-A)\mathbf x=\mathbf 0$，解这个齐次方程组的**非零解**，就是该特征值对应的特征向量。

第三步（对角化）在第六节展开。先把前两步走一道例题。

::: tip 例 1 · 求特征值与特征向量 {#ex-eigen-1}

**题干**：求 $A=\begin{pmatrix}3&-1\\-1&3\end{pmatrix}$ 的全部特征值与特征向量。

**先想什么**：先写 $\lambda I-A$，再算行列式；别急着跳到最后一步。

**第 1 步 · 求特征值**：

$$
\lambda I-A=\begin{pmatrix}\lambda-3&1\\1&\lambda-3\end{pmatrix}
$$

$$
|\lambda I-A|=(\lambda-3)^2-1=\lambda^2-6\lambda+8=(\lambda-2)(\lambda-4)=0
$$

解出两个特征值：$\lambda_1=2$、$\lambda_2=4$。

**第 2 步 · 代入求特征向量**：

对 $\lambda_1=2$，代回 $(\lambda I-A)\mathbf x=\mathbf 0$：

$$
2I-A=\begin{pmatrix}-1&1\\1&-1\end{pmatrix}
\quad\Longrightarrow\quad
\begin{pmatrix}-1&1\\1&-1\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}0\\0\end{pmatrix}
$$

两行是同一个方程 $-x+y=0$，即 $y=x$。取 $x=1$，得特征向量 $\mathbf x_1=\begin{pmatrix}1\\1\end{pmatrix}$。

对 $\lambda_2=4$：

$$
4I-A=\begin{pmatrix}1&1\\1&1\end{pmatrix}
\quad\Longrightarrow\quad
x+y=0
$$

即 $y=-x$。取 $x=1$，得 $\mathbf x_2=\begin{pmatrix}1\\-1\end{pmatrix}$。

**为什么强调「非零解」**：$(\lambda I-A)\mathbf x=\mathbf 0$ 永远有零解，但它不是特征向量。我们是在零解之外找一个方向，所以解完总要保证取到的是 $\mathbf x\neq\mathbf 0$。

**验算（node 逐项核对）**：

$$
A\mathbf x_1=\begin{pmatrix}3&-1\\-1&3\end{pmatrix}\begin{pmatrix}1\\1\end{pmatrix}=\begin{pmatrix}2\\2\end{pmatrix}=2\mathbf x_1
$$

$$
A\mathbf x_2=\begin{pmatrix}3&-1\\-1&3\end{pmatrix}\begin{pmatrix}1\\-1\end{pmatrix}=\begin{pmatrix}4\\-4\end{pmatrix}=4\mathbf x_2
$$

两条都满足 $A\mathbf x=\lambda\mathbf x$。
:::

<FigBox title="特征方向：变换后方向不变，只被拉伸" kind="图解" note="A = [[3,-1],[-1,3]]。两条特征直线 y=x（λ=2）与 y=-x（λ=4）互相垂直；变换后 v₁ 方向不动、长度 ×2，v₂ 方向不动、长度 ×4。普通向量 w 被掰弯到 A w，方向变了。" >

<svg viewBox="0 0 460 360" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="60" y1="180" x2="440" y2="180" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="80" y1="180" x2="80" y2="24" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<path d="M 436 175 L 440 180 L 436 185 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<path d="M 75 28 L 80 24 L 85 28 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<text x="444" y="184" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">x</text>
<text x="74" y="18" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">y</text>
<line x1="40" y1="220" x2="200" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="40" y1="140" x2="200" y2="300" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="80" y1="180" x2="120" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
<path d="M 112 132 L 120 140 L 112 148 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="80" y1="180" x2="160" y2="100" stroke="var(--vp-c-brand-1)" stroke-width="2.6"/>
<path d="M 152 92 L 160 100 L 152 108 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="80" y1="180" x2="120" y2="220" stroke="var(--vp-c-brand-2)" stroke-width="2.2"/>
<path d="M 112 212 L 120 220 L 112 228 Z" fill="var(--vp-c-brand-2)" stroke="var(--vp-c-brand-2)"/>
<line x1="80" y1="180" x2="240" y2="340" stroke="var(--vp-c-brand-2)" stroke-width="2.6"/>
<path d="M 232 332 L 240 340 L 232 348 Z" fill="var(--vp-c-brand-2)" stroke="var(--vp-c-brand-2)"/>
<line x1="80" y1="180" x2="160" y2="140" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="5 4"/>
<path d="M 155 149 L 160 140 L 150 138 Z" fill="var(--vp-c-text-2)" stroke="var(--vp-c-text-2)"/>
<line x1="80" y1="180" x2="280" y2="140" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="5 4"/>
<path d="M 273 147 L 280 140 L 271 136 Z" fill="var(--vp-c-text-2)" stroke="var(--vp-c-text-2)"/>
<text x="108" y="128" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">v₁</text>
<text x="150" y="88" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">A v₁ = 2v₁</text>
<text x="108" y="238" font-size="12.5" stroke="none" fill="var(--vp-c-brand-2)" class="sf-t sf-w700">v₂</text>
<text x="216" y="330" font-size="12.5" stroke="none" fill="var(--vp-c-brand-2)" class="sf-t sf-w700">A v₂ = 4v₂</text>
<text x="148" y="150" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-it">w</text>
<text x="286" y="132" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">A w（方向变了）</text>
</svg>

</FigBox>

**看图能读出什么**：两条特征直线上的箭头只被拉长、不转弯；而普通向量 $w$ 被掰离原来的直线。判断是不是特征向量，就看 $A\mathbf x$ 与 $\mathbf x$ 是否共线（相差一个倍数），零向量不算。下一节把两个特征值代入 $\lambda$ 的两个特殊性质——「和」与「积」。

## 四、特征值的两个性质：λ 之和 = 迹，λ 之积 = 行列式

这一节的目标：给两个一秒钟就能用的验算公式，边做边自查。

把方阵 $A=(a_{ij})$ 主对角线上的元素加起来，这个和叫**迹（trace）**，记作

$$
\operatorname{tr}A=a_{11}+a_{22}+\cdots+a_{nn}
$$

特征值有两个「不变量」性质，对任意 $n$ 阶方阵都成立：

$$
\lambda_1+\lambda_2+\cdots+\lambda_n=\operatorname{tr}A
$$

$$
\lambda_1\lambda_2\cdots\lambda_n=\det A
$$

第一行说：特征值之和等于迹；第二行说：特征值之积等于行列式。

用例 1 自查：$A=\begin{pmatrix}3&-1\\-1&3\end{pmatrix}$ 的特征值是 2 和 4，迹是 $3+3=6$，行列式是 $3\cdot3-(-1)(-1)=8$；果然 $2+4=6$、$2\times4=8$，全对。

这两个公式的最大用处是**抓错**：解出特征值后立刻算一遍和与积，只要和 $\operatorname{tr}A$ 或积 $\det A$ 对不上，就是行列式或分解错了。下一节把「$A$ 和它的对角阵」这类换坐标系的关系正式命名。

## 五、相似矩阵与相似不变量

这一节的目标：给「换坐标系」一个正式名字，并列出换坐标不改变的量。

设 $P$ 可逆，称 $B=P^{-1}AP$ 为 $A$ 的**相似矩阵（similar matrix）**，$A$ 与 $B$ 相似。它读作「先换进新坐标系、做变换、再换回来」——所以 $A$ 和 $B$ 是**同一个线性变换在不同坐标系下的写法**，不是两个不同的变换。

**相似不变量**：相似矩阵的这些量完全相同——行列式、迹、特征值、秩。因为它们描述的是同一个变换，这些量不随坐标系变化。**但特征向量会变**：特征向量是坐标系里的具体箭头，换坐标系后坐标自然变。

一句话收尾：**相似矩阵是「同一个变换，两套坐标」**。利用它，下一节把「$A$ 与对角矩阵相似」这件事做成标准动作。

## 六、对角化：条件与做法（三步路线第三步）

这一节的目标：完成第三步「对角化」，并说清什么时候走不通。

**对角化（diagonalization）** 是指：找可逆矩阵 $P$ 和对角矩阵 $D$，使得

$$
A=PDP^{-1}
$$

其中 $P$ 的列是 $n$ 个**线性无关**的特征向量，$D$ 的对角线是对应的特征值。

**可对角化的条件**：$n$ 阶矩阵 $A$ 能对角化，当且仅当它有 $n$ 个线性无关的特征向量（等价说法：每个特征值的几何重数都等于代数重数）。两个实用的充分条件：① $A$ 有 $n$ 个**互不相同**的特征值；② $A$ 是**实对称矩阵**。

**对角化的三步做法**：

1. 求出全部特征值 $\lambda_1,\dots,\lambda_n$（含重根）；
2. 对每个特征值求出对应的特征向量，凑出 $n$ 个线性无关的 $\mathbf x_1,\dots,\mathbf x_n$；
3. 把 $\mathbf x_i$ 按列排成 $P$，把 $\lambda_i$ 按**同样顺序**放在 $D$ 的对角线上，即得 $A=PDP^{-1}$。

::: tip 例 2 · 对一般矩阵对角化 {#ex-eigen-2}

**题干**：把 $A=\begin{pmatrix}4&-2\\1&1\end{pmatrix}$ 对角化，并验证 $A=PDP^{-1}$。

**先想什么**：这是非对称矩阵，特征向量不一定正交，但照样按「求特征值 → 求特征向量 → 排 P、D」走。

**第 1 步 · 求特征值**：

$$
\lambda I-A=\begin{pmatrix}\lambda-4&2\\-1&\lambda-1\end{pmatrix}
$$

$$
|\lambda I-A|=(\lambda-4)(\lambda-1)+2=\lambda^2-5\lambda+6=(\lambda-2)(\lambda-3)=0
$$

得 $\lambda_1=2$、$\lambda_2=3$。

**第 2 步 · 求特征向量**：

对 $\lambda_1=2$：$2I-A=\begin{pmatrix}-2&2\\-1&1\end{pmatrix}$，解 $-2x+2y=0$ 得 $y=x$，取 $\mathbf x_1=\begin{pmatrix}1\\1\end{pmatrix}$。

对 $\lambda_2=3$：$3I-A=\begin{pmatrix}-1&2\\-1&2\end{pmatrix}$，解 $-x+2y=0$ 得 $x=2y$，取 $\mathbf x_2=\begin{pmatrix}2\\1\end{pmatrix}$。

**第 3 步 · 排 P 和 D**：

$$
P=\begin{pmatrix}1&2\\1&1\end{pmatrix},\qquad
D=\begin{pmatrix}2&0\\0&3\end{pmatrix}
$$

**为什么顺序要对上**：$P$ 第一列是 $\mathbf x_1=(1,1)$，对应 $\lambda_1=2$，所以 $D$ 第一个对角元是 2；第二列 $\mathbf x_2=(2,1)$ 对应 $\lambda_2=3$。列的顺序和 $\lambda$ 的顺序一一绑定，换列就要同步换 $D$ 的对角线。

**验算（node 逐项核对）**：先求 $P^{-1}$（$\det P=1\cdot1-2\cdot1=-1$）：

$$
P^{-1}=\frac{1}{-1}\begin{pmatrix}1&-2\\-1&1\end{pmatrix}=\begin{pmatrix}-1&2\\1&-1\end{pmatrix}
$$

$$
PD=\begin{pmatrix}1&2\\1&1\end{pmatrix}\begin{pmatrix}2&0\\0&3\end{pmatrix}=\begin{pmatrix}2&6\\2&3\end{pmatrix}
$$

$$
PDP^{-1}=\begin{pmatrix}2&6\\2&3\end{pmatrix}\begin{pmatrix}-1&2\\1&-1\end{pmatrix}=\begin{pmatrix}4&-2\\1&1\end{pmatrix}=A
$$

所以 $A=PDP^{-1}$ 成立，$A$ 可对角化。
:::

<FigBox title="对角化：换到特征向量坐标系，斜切变成沿轴拉伸" kind="图解" note="A = [[4,-2],[1,1]]。左图标准坐标系里，A 把基向量 e₁=(1,0)、e₂=(0,1) 分别送到 (4,1)、(-2,1)，网格被斜切。右图换成特征向量坐标系（v₁=(1,1)、v₂=(2,1) 作轴），同一个变换 D 只沿 v₁ 轴拉 2 倍、沿 v₂ 轴拉 3 倍，方向不变。" >

<svg viewBox="0 0 520 260" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="18" y="26" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">标准坐标系：A 把基向量斜切</text>
<line x1="50" y1="190" x2="250" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="120" y1="190" x2="120" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<path d="M 246 185 L 250 190 L 246 195 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<path d="M 115 44 L 120 40 L 125 44 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<line x1="120" y1="190" x2="150" y2="190" stroke="var(--vp-c-text-2)" stroke-width="1.8" stroke-dasharray="5 4"/>
<line x1="120" y1="190" x2="120" y2="160" stroke="var(--vp-c-text-2)" stroke-width="1.8" stroke-dasharray="5 4"/>
<text x="142" y="206" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-it">e₁</text>
<text x="110" y="156" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t sf-it">e₂</text>
<line x1="120" y1="190" x2="240" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 233 152 L 240 160 L 232 163 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="120" y1="190" x2="60" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 68 157 L 60 160 L 68 163 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<text x="244" y="156" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">A e₁</text>
<text x="16" y="156" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">A e₂</text>
<text x="288" y="26" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">特征向量坐标系：D 只沿轴拉伸</text>
<line x1="300" y1="190" x2="500" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="370" y1="190" x2="370" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<path d="M 496 185 L 500 190 L 496 195 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<path d="M 365 44 L 370 40 L 375 44 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<line x1="370" y1="190" x2="400" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
<path d="M 393 154 L 400 160 L 394 167 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="370" y1="190" x2="430" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="2.6"/>
<path d="M 421 124 L 430 130 L 424 138 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="370" y1="190" x2="410" y2="210" stroke="var(--vp-c-brand-2)" stroke-width="2.2"/>
<path d="M 403 203 L 410 210 L 402 217 Z" fill="var(--vp-c-brand-2)" stroke="var(--vp-c-brand-2)"/>
<line x1="370" y1="190" x2="460" y2="235" stroke="var(--vp-c-brand-2)" stroke-width="2.6"/>
<path d="M 453 229 L 460 235 L 451 241 Z" fill="var(--vp-c-brand-2)" stroke="var(--vp-c-brand-2)"/>
<text x="402" y="150" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">v₁</text>
<text x="436" y="120" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">2v₁</text>
<text x="414" y="222" font-size="12" stroke="none" fill="var(--vp-c-brand-2)" class="sf-t sf-w700">v₂</text>
<text x="466" y="248" font-size="12" stroke="none" fill="var(--vp-c-brand-2)" class="sf-t sf-w700">3v₂</text>
<text x="40" y="232" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A 把正交网格掰成平行四边形</text>
<text x="288" y="232" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">D 保持两条轴方向不动，只改长度</text>
</svg>

</FigBox>

**看图能读出什么**：同一个变换，在标准坐标系里是「斜切」，在特征向量坐标系里是「沿轴拉伸」。对角化就是主动换到「让变换最朴素」的坐标系。但要注意：特征向量坐标系的两条轴一般**不垂直**（本例 $v_1,v_2$ 的夹角不是 90°），只有实对称矩阵才天然垂直——下一节讲这个。

## 七、实对称矩阵与正交对角化（简要）

这一节的目标：把实对称矩阵的「额外福利」说清，并给正交对角化的做法。

若 $A$ 是实对称矩阵（$A=A^T$），它有三条专属性质：

1. $A$ 的特征值全是实数；
2. 属于**不同**特征值的特征向量**互相正交**；
3. $A$ 一定能对角化，而且能选出一组**正交且单位**的特征向量，拼成**正交矩阵** $Q$，使 $Q^TAQ=D$（对角阵）。

**正交对角化的做法**：先照常求特征值与特征向量，再把每个特征向量**单位化**（除以它的长度），按列排成 $Q$。因为不同特征值的特征向量已正交，同特征值的特征向量可用施密特正交化处理（本页不展开），最终 $Q$ 满足 $Q^TQ=I$，于是 $Q^{-1}=Q^T$，对角化式变成 $A=QDQ^T$。

::: tip 例 3 · 实对称矩阵正交对角化 {#ex-eigen-3}

**题干**：把 $A=\begin{pmatrix}3&-1\\-1&3\end{pmatrix}$ 正交对角化，写出正交矩阵 $Q$ 与 $D$。

**先想什么**：例 1 已经求出特征向量 $(1,1)$（属于 $\lambda=2$）和 $(1,-1)$（属于 $\lambda=4$），它们点积 $1\cdot1+1\cdot(-1)=0$，已经正交，只需各自单位化。

单位化：$\|\mathbf x_1\|=\sqrt{1^2+1^2}=\sqrt2$，$\|\mathbf x_2\|=\sqrt{1^2+(-1)^2}=\sqrt2$。于是

$$
Q=\begin{pmatrix}\frac{1}{\sqrt{2}}&\frac{1}{\sqrt{2}}\\\frac{1}{\sqrt{2}}&-\frac{1}{\sqrt{2}}\end{pmatrix},\qquad
D=\begin{pmatrix}2&0\\0&4\end{pmatrix}
$$

**验算（node 逐项核对）**：$Q$ 是对称矩阵，$Q^TQ=\begin{pmatrix}1&0\\0&1\end{pmatrix}=I$，且

$$
Q^TAQ=\begin{pmatrix}2&0\\0&4\end{pmatrix}=D
$$

所以 $A=QDQ^T$，正交对角化完成。
:::

<FigBox title="正交对角化：把坐标轴转到两条互相垂直的特征方向" kind="图解" note="A = [[3,-1],[-1,3]]。两条特征直线 y=x（λ=2）与 y=-x（λ=4）恰好垂直，把坐标轴旋转 45° 对齐它们，得到正交矩阵 Q；在新坐标系里 A 变成纯拉伸 D=diag(2,4)。" >

<svg viewBox="0 0 440 320" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="40" y1="170" x2="420" y2="170" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<line x1="80" y1="170" x2="80" y2="24" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<path d="M 416 165 L 420 170 L 416 175 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<path d="M 75 28 L 80 24 L 85 28 Z" fill="var(--vp-c-text-3)" stroke="var(--vp-c-text-3)"/>
<text x="424" y="174" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">x</text>
<text x="74" y="18" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">y</text>
<line x1="80" y1="170" x2="180" y2="70" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
<path d="M 173 64 L 180 70 L 174 78 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)"/>
<line x1="80" y1="170" x2="180" y2="270" stroke="var(--vp-c-brand-2)" stroke-width="2.2"/>
<path d="M 173 262 L 180 270 L 174 278 Z" fill="var(--vp-c-brand-2)" stroke="var(--vp-c-brand-2)"/>
<line x1="116" y1="134" x2="134" y2="116" stroke="var(--vp-c-text-2)" stroke-width="1.4"/>
<line x1="134" y1="116" x2="134" y2="134" stroke="var(--vp-c-text-2)" stroke-width="1.4"/>
<line x1="80" y1="170" x2="40" y2="210" stroke="var(--vp-c-text-2)" stroke-width="1.2" stroke-dasharray="4 4"/>
<line x1="80" y1="170" x2="40" y2="130" stroke="var(--vp-c-text-2)" stroke-width="1.2" stroke-dasharray="4 4"/>
<text x="182" y="64" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">q₁（λ=2）</text>
<text x="182" y="288" font-size="12.5" stroke="none" fill="var(--vp-c-brand-2)" class="sf-t sf-w700">q₂（λ=4）</text>
<text x="136" y="128" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">90°</text>
<text x="26" y="222" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">Q 轴</text>
<text x="46" y="118" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">Q 轴</text>
</svg>

</FigBox>

**看图能读出什么**：两条特征方向画出了直角，说明特征向量正交；把坐标轴转到这两条方向，$Q$ 就是旋转矩阵（正交矩阵），$A$ 在新坐标系里只做轴拉伸。正交对角化是二次型化标准形的地基，下一章会接过去。到这里，把本章最容易踩的坑列成清单收尾。

## 易错清单

1. **把 $\mathbf x=\mathbf 0$ 当特征向量**：零向量被任何矩阵映成零，会冒充任何特征值的特征向量。定义里必须排除零向量，做题取非零解。
2. **漏掉 $\lambda=0$**：$A\mathbf x=0$ 里的 0 是合法特征值，意味着 $A$ 不可逆。解特征方程时别把 0 这个根丢掉。
3. **$\lambda I-A$ 与 $A-\lambda I$ 写混**：两者只差负号，特征值相同、齐次方程解相同，但**整页要自洽**，别一步用 $\lambda I-A$、下一步又用 $A-\lambda I$ 还不处理符号。
4. **$P$ 的列和 $D$ 的对角线顺序对不上**：$P$ 第 $i$ 列必须配 $D$ 第 $i$ 个对角元。顺序错了 $PDP^{-1}$ 就不再等于 $A$。
5. **特征向量没有归一化就写正交矩阵**：正交对角化要求 $Q$ 的列是**单位**向量，光正交不够，还要除以长度。
6. **以为有重根就一定能或一定不能对角化**：重根只是「危险信号」，能不能对角化看几何重数是否追平代数重数。如 $2I=\begin{pmatrix}2&0\\0&2\end{pmatrix}$ 特征值 2 是二重根，但它本身就是对角阵，任意向量都是特征向量，照样可对角化。

**这一页的指路**：特征值把「复杂矩阵」在特定方向上简化成「缩放」，对角化则把整个变换换成最朴素的样子。想懂它背后的几何图景（特征空间、代数/几何重数的直观），看[现代版 · 特征值、特征向量与对角化](../linalg/06-eigenvalues.md)；想接着学对称矩阵如何把二次型化成标准形、判正定，看[现代版 · 正交、投影与二次型](../linalg/07-orthogonality.md)。
