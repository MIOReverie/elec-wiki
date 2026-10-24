---
title: 05 · 行列式：面积缩放的因子
description: 行列式的几何意义（二维=平行四边形面积缩放倍数，三维=体积，负号=翻转方向），三条性质，代数余子式展开，三角矩阵行列式，det=0 等价不可逆，克拉默法则一句话。
---

# 05 · 行列式：面积缩放的因子

<Meta time="45 min" level="核心" note="行列式不是一串要背的运算，而是『线性变换把面积/体积放大了多少倍』这一个数；最容易错的是交换两行后忘了变号" />

**这一页要解决什么**：前面几章你已经把矩阵看成一个「变换」——它把箭头掰到新位置、把网格拉伸成新网格。这一页给这个变换配一个唯一的数字：**行列式（determinant）**，记作 $\det A$ 或 $|A|$。它回答一个非常具体的问题：这个变换把图形（先从平面里的面积说起）放大或缩小了多少倍。读完你应该能：说出 2×2 行列式的几何含义、用三条性质快速算行列式、理解为什么 $\det A=0$ 意味着变换把空间「压扁」，并会在算完后用性质自检符号。

::: tip 读这页之前
- **需要会**：向量的列坐标与线性组合（[01 · 向量、线性组合与张成](./01-vectors.md)）；矩阵作为线性变换、列就是基向量的像（[02 · 矩阵与线性变换](./02-matrices.md)）；高斯消元把矩阵化成上三角（[03 · 高斯消元与线性方程组](./03-elimination.md)）；列空间与零空间的一层直觉（[04 · 向量空间与四大子空间](./04-subspaces.md)）。
- **高中数学里已经埋好的伏笔**：两条向量张成的平行四边形面积，等于两列作「叉积」的绝对值，三角形面积是它的一半。这一页就是把这个面积公式升级成矩阵的语言。
- **这一页用到的符号**：$A$（矩阵）、$\det A$ 或 $|A|$（行列式）、$A^T$（转置）、$A^{-1}$（逆）、$I$（单位矩阵）。约定见[符号与约定](../guide/notation.md)。
- **先给两个直觉**：「面积缩放的倍数」和「翻转方向」。这一页全部内容都是这两个直觉的展开。
:::

**场景引入**：想象你在屏幕上画了一个单位正方形——四个角是 $(0,0)$、$(1,0)$、$(1,1)$、$(0,1)$，面积正好是 $1$。现在让矩阵

$$
A=\begin{bmatrix}3&1\\2&4\end{bmatrix}
$$

作用上去：底边 $\mathbf i=(1,0)$ 被掰到 $\mathbf a=(3,2)$，左边 $\mathbf j=(0,1)$ 被掰到 $\mathbf b=(1,4)$，于是整个正方形被「拉伸 + 倾斜」成一个平行四边形，顶点变成 $0,\ \mathbf a,\ \mathbf a+\mathbf b,\ \mathbf b$。它不再是正方形，面积也变了——**新的面积是 $10$**。这个从 $1$ 到 $10$ 的倍数，就是 $A$ 的行列式：

$$
\det A = 3\times 4 - 2\times 1 = 10
$$

<FigBox title="单位正方形被变换拉伸成平行四边形：面积从 1 变成 det" kind="几何" note="左边是变换前的单位正方形，面积 1；右边是 A 作用后的平行四边形，由列向量 a=(3,2) 与 b=(1,4) 张成，面积 det A = 3×4 − 2×1 = 10。行列式就是『面积被放大的倍数』。" >
<svg viewBox="0 0 340 214" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
<marker id="detArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="var(--vp-c-text-1)"/>
</marker>
</defs>
<line x1="40" y1="158" x2="114" y2="158"/>
<line x1="64" y1="184" x2="64" y2="118"/>
<rect x="64" y="132" width="26" height="26" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)"/>
<line x1="64" y1="158" x2="90" y2="158" marker-end="url(#detArrow)"/>
<line x1="64" y1="158" x2="64" y2="132" marker-end="url(#detArrow)"/>
<text x="90" y="174" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">i</text>
<text x="46" y="128" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">j</text>
<text x="77" y="150" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">面积=1</text>
<text x="64" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">变换前</text>
<line x1="188" y1="158" x2="326" y2="158"/>
<line x1="236" y1="184" x2="236" y2="60"/>
<path d="M236 158 L278 130 L292 74 L250 102 Z" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)"/>
<line x1="236" y1="158" x2="278" y2="130" marker-end="url(#detArrow)"/>
<line x1="236" y1="158" x2="250" y2="102" marker-end="url(#detArrow)"/>
<text x="282" y="144" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">a=(3,2)</text>
<text x="224" y="92" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">b=(1,4)</text>
<text x="268" y="96" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">面积=det=10</text>
<text x="236" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">变换后</text>
</svg>
</FigBox>

**看图能读出什么**：左图的单位正方形面积是 1；右图同一个正方形被掰成平行四边形后，面积变成 10。行列式就是那个「10」。它不是随便定义出来的数字，而是变换自带的一个客观属性——你可以数格子数出来。

## 结论先行

1. 行列式是一个数，它度量线性变换对**面积（二维）或体积（三维）的缩放倍数**；$\det I = 1$，因为恒等变换什么都不缩放。
2. 行列式的**符号**表示方向是否翻转：负号意味着变换把平面「翻了个面」，图形的定向反了。
3. 三条性质撑起全部计算：交换两行变号、某一行是另外几行的线性组合则行列式为 0、行列式对每一行都是线性的。
4. 三角矩阵的行列式等于对角线元素相乘——这是高斯消元之后最省事的算法。
5. $\det A = 0$ 与「不可逆」等价，几何上就是变换把空间**压扁**（零空间非平凡）。

一句话收尾：所有计算规则都从「面积缩放倍数」这一个几何事实推导出来，后面只是把它们串成可以手算的步骤。

## 一、几何图景：行列式是面积缩放的因子

这一节只回答一个问题：为什么一个数字能完整描述「变换对面积做了什么」。

对于一个 2×2 矩阵 $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$，它的两列就是两个向量 $\mathbf a=(a,c)$、$\mathbf b=(b,d)$。这两个向量张成一个平行四边形，它的（带符号）面积就是：

$$
\det A = ad - bc
$$

为什么是这个式子？把两个向量并排写成两列，$ad-bc$ 正是「第一列横 × 第二列纵 − 第一列纵 × 第二列横」——也就是两列作叉积的 $z$ 分量。当 $\mathbf a,\mathbf b$ 不共线时，它的绝对值就是平行四边形面积；当两列共线时面积塌成 0，行列式也正好是 0。

这里有个关键点值得现在就记下：**行列式不是「计算之后才知道面积」，而是它本来就等于面积**。任何图形（不一定是正方形）经 $A$ 变换后，面积都乘以同一个数 $\det A$——三角形、圆、不规则形状全都一样，因为线性变换把「小方格」都按同一比例拉伸，再对面积积分（求和取极限）就得到这个公共倍数。这个「所有图形共享一个缩放因子」的事实，正是下一节能定义体积版行列式的根据。

## 二、负号与定向：翻转方向的记录

这一节只回答一个问题：行列式为什么会出现负数，负数到底意味着什么。

面积本身没有正负，但 $\det A$ 可以取负。负号记录的不是「面积变小」，而是**定向（orientation）翻转**：变换把平面「翻了个面」。

怎么判断翻转了没有？看两个基向量的相对顺序。变换前，$\mathbf i=(1,0)$ 在右、$\mathbf j=(0,1)$ 在上，从 $\mathbf i$ 转到 $\mathbf j$ 是**逆时针**；变换后看 $\mathbf a=A\mathbf i$ 与 $\mathbf b=A\mathbf j$：如果从 $\mathbf a$ 转到 $\mathbf b$ 还是逆时针，$\det A>0$；如果变成了**顺时针**，$\det A<0$，说明整个平面被翻转了。

<FigBox title="负号 = 定向翻转" kind="几何" note="左图：i 在上方、j 在右侧，i 到 j 逆时针，det>0。右图：变换后 a=(1,2) 在 b=(3,4) 的『上方』（角度更大），从 a 到 b 变成顺时针，det = 1×4 − 3×2 = −2，平面被翻了个面。" >
<svg viewBox="0 0 340 180" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
<marker id="detArrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="var(--vp-c-text-1)"/>
</marker>
</defs>
<line x1="70" y1="150" x2="128" y2="150"/>
<line x1="70" y1="162" x2="70" y2="108"/>
<line x1="70" y1="150" x2="110" y2="150" marker-end="url(#detArrow2)"/>
<line x1="70" y1="150" x2="70" y2="110" marker-end="url(#detArrow2)"/>
<path d="M92 148 A22 22 0 0 0 72 128" stroke-dasharray="4 3"/>
<text x="110" y="150" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">i</text>
<text x="70" y="106" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">j</text>
<text x="70" y="146" text-anchor="end" dominant-baseline="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">逆时针 → det>0</text>
<line x1="240" y1="150" x2="322" y2="150"/>
<line x1="240" y1="162" x2="240" y2="60"/>
<line x1="240" y1="150" x2="260" y2="110" marker-end="url(#detArrow2)"/>
<line x1="240" y1="150" x2="300" y2="70" marker-end="url(#detArrow2)"/>
<path d="M262 116 A20 20 0 0 1 292 78" stroke-dasharray="4 3"/>
<text x="262" y="104" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">a=(1,2)</text>
<text x="302" y="68" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">b=(3,4)</text>
<text x="240" y="146" text-anchor="end" dominant-baseline="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">顺时针 → det<0</text>
</svg>
</FigBox>

**看图能读出什么**：翻转不是「图形被压扁」，而是「里外调了个」——把纸翻过来看，所有顺时针都变成逆时针。所以面积大小看 $|\det A|$，方向是否翻面看 $\det A$ 的符号。平面里的直觉建立后，把「面积」换成「体积」，行列式就自动升级到三维。

## 三、三维与 n 维：体积缩放，一次类推

这一节只回答一个问题：3×3 行列式的几何含义是什么，更高维怎么类推。

三维里，矩阵 $A$ 的三列是三个向量 $\mathbf a,\mathbf b,\mathbf c$，它们张成一个**平行六面体（parallelepiped）**。它的（带符号）体积就是 $\det A$：

$$
\det A = \text{三列张成平行六面体的带符号体积}
$$

符号仍由定向决定，三维里的定向用右手定则判断：$\mathbf a\to\mathbf b\to\mathbf c$ 满足右手定则则 $\det A>0$，反过来则 $\det A<0$。上一页你见过两列张成面积的 2×2 公式，这里三列作「混合积」$\mathbf a\cdot(\mathbf b\times\mathbf c)$ 就是体积——这和 2×2 的 $ad-bc$ 是同一个思想。

再往 $n$ 维推：$n\times n$ 矩阵的行列式是「$n$ 维超体积被放大的倍数」。$n$ 维超体积没法画，但规则完全一样：单位 $n$ 维立方体（超体积 1）经 $A$ 变换后被拉伸成 $n$ 维平行体，其超体积就是 $\det A$。几何图景在二维、三维看清之后，更高维只是「照此办理」。

有了几何含义，接下来必须回答「怎么算」。计算不靠硬背 $n!$ 个乘积，而是靠三条性质——它们是行列式的「宪法」，一切公式都由它们推出。

## 四、三条性质：一切计算的根基

这一节给出三条性质，并说明每一条都来自「面积缩放」这个几何事实。

**性质 0（起点）：$\det I = 1$。** 单位矩阵不动任何图形，缩放倍数当然是 1。

**性质 1：交换两行（或两列），行列式变号。**

$$
\det\begin{bmatrix}c&d\\a&b\end{bmatrix}=cb-ad=-(ad-bc)=-\det\begin{bmatrix}a&b\\c&d\end{bmatrix}
$$

几何上，交换两列等于把 $\mathbf a,\mathbf b$ 调个顺序，定向翻转，面积大小不变、符号相反。**这是最容易忘的一条**：每交换一次就乘一个 $-1$。

**性质 2：若两行相等（或成比例，更一般地某一行是其他行的线性组合），则行列式为 0。** 两列共线时平行四边形压成一条线段，面积自然是 0。

**性质 3：行列式对每一行都是线性的。** 把某一行乘 $k$，行列式也乘 $k$；把某一行拆成两个向量之和，行列式对应拆成两个行列式之和：

$$
\det\begin{bmatrix}ka&kb\\c&d\end{bmatrix}=k\det\begin{bmatrix}a&b\\c&d\end{bmatrix}
$$

这三条合起来推出两个「免费」的推论，也是计算时真正用的：

- **行替换不改变行列式**：把某一行的 $k$ 倍加到另一行上，$\det$ 不变（由性质 2、3 推出）。这正是高斯消元里的那一步——所以消元可以放心用来化简行列式。
- **乘法与逆**：$\det(AB)=\det A\det B$（复合变换的缩放倍数等于两个倍数的乘积）；$\det A^T=\det A$（转置不翻转定向）；若 $A$ 可逆，$\det A^{-1}=\dfrac{1}{\det A}$。

这三条性质是「宪法」，下面两节的计算公式只是它的「实施细则」。先看最经典的一条：代数余子式展开。

## 五、计算：2×2 公式与代数余子式展开

这一节把 2×2 公式推广到 n×n，并解释「代数余子式」这个词。

2×2 是地基：

$$
\det\begin{bmatrix}a&b\\c&d\end{bmatrix}=ad-bc
$$

3×3 呢？把第一行展开，每一项是「元素 × 它划掉所在行列后剩下的 2×2 行列式 × 一个正负号」：

$$
\det\begin{bmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{bmatrix}
=a_{11}\begin{vmatrix}a_{22}&a_{23}\\a_{32}&a_{33}\end{vmatrix}
-a_{12}\begin{vmatrix}a_{21}&a_{23}\\a_{31}&a_{33}\end{vmatrix}
+a_{13}\begin{vmatrix}a_{21}&a_{22}\\a_{31}&a_{32}\end{vmatrix}
$$

这里先引入两个词。**余子式（minor）** $M_{ij}$：划掉第 $i$ 行第 $j$ 列后剩下的子矩阵的行列式。**代数余子式（cofactor）** $C_{ij}$：给余子式配上符号，$C_{ij}=(-1)^{i+j}M_{ij}$——符号像棋盘一样交错，左上角 $+$。于是沿第 $i$ 行展开就是：

$$
\det A = a_{i1}C_{i1}+a_{i2}C_{i2}+\dots+a_{in}C_{in}
$$

也可以沿任意一列展开，结果相同。**选零最多的一行或一列展开**，计算量最小——这是手算的第一个技巧。

顺带交代符号为什么长这样：n×n 行列式有一个「大公式」，把所有 $n$ 个排列的项加起来，每项是 $n$ 个元素相乘再乘一个 $\pm 1$，符号由该排列的**逆序（inversion）**的个数决定——「逆序」指排列中「前一个数比后一个数大」这样的一对，逆序个数是奇数就取负号。代数余子式展开正是这个大公式按第一行分组重排后的写法。这个公式我们不在这一页展开，只要知道它存在，且它解释了 $(-1)^{i+j}$ 的来历。

代数余子式展开对 3×3、4×4 还好，但复杂度随 $n$ 增长得极快（约 $n!$），20×20 靠它手算是不现实的。有没有更快的路？有——回到高斯消元。

## 六、三角矩阵：对角线相乘，消元后最省事

这一节说明为什么「消元到三角」是算行列式最快的路。

**三角矩阵（上三角或下三角）的行列式等于对角线元素相乘**：

$$
\det\begin{bmatrix}d_1&*&*\\0&d_2&*\\0&0&d_3\end{bmatrix}=d_1d_2d_3
$$

为什么？看 2×2 就懂：$\det\begin{bmatrix}d_1&*\\0&d_2\end{bmatrix}=d_1d_2-0=d_1d_2$。几何上，三角矩阵的列依次「只沿一个新的坐标方向伸展」，每一步的缩放倍数独立相乘，乘积就是对角线之积。

于是算行列式的通用算法呼之欲出：**用行替换（不改变 det）把 $A$ 化成上三角，途中每交换一次行就记一次变号，最后乘对角线**。这与[03 · 高斯消元](./03-elimination.md)里的消元是同一套动作，只是多了「记录交换次数」这一步。例如：

$$
\begin{bmatrix}1&2&1\\2&5&2\\1&2&3\end{bmatrix}
\xrightarrow{R_2-2R_1}
\begin{bmatrix}1&2&1\\0&1&0\\1&2&3\end{bmatrix}
\xrightarrow{R_3-R_1}
\begin{bmatrix}1&2&1\\0&1&0\\0&0&2\end{bmatrix}
\;\Rightarrow\;\det A=1\times1\times2=2
$$

三角化之后，行列式只剩一个数字，而且顺带回答了下节要问的最重要的问题：这个矩阵到底可不可逆。

## 七、det = 0：空间被压扁，不可逆

这一节把 $\det A=0$ 与「不可逆」「零空间非平凡」这三件事钉在一起。

**可逆（invertible）**：存在矩阵 $A^{-1}$ 使 $A^{-1}A=AA^{-1}=I$，即变换可以被完全「还原」回去。可逆的变换必须是「一对一的」——每个输出只有一个输入，面积不会塌掉。

下面五句话说的是同一件事，任意一条成立其余都成立：

1. $\det A=0$。
2. $A$ 的列线性相关（某列是其余列的线性组合）。
3. 变换把空间**压扁**：平行四边形/平行六面体面积/体积为 0。
4. 存在非零向量 $\mathbf x$ 使 $A\mathbf x=0$，即**零空间非平凡**（不只是 $\mathbf 0$）。
5. $A$ 不可逆。

<FigBox title="det=0：两个列向量共线，平行四边形压成一条线段" kind="几何" note="两列成比例时（这里是 (2,1) 与 (4,2)，后者是前者的 2 倍），平行四边形退化成一维线段，面积=0。面积塌掉意味着有非零向量被压到原点，变换不可逆。" >
<svg viewBox="0 0 340 170" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
<marker id="detArrow3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="var(--vp-c-text-1)"/>
</marker>
</defs>
<line x1="60" y1="140" x2="300" y2="140"/>
<line x1="90" y1="156" x2="90" y2="80"/>
<line x1="90" y1="140" x2="250" y2="60" stroke-dasharray="4 3" stroke="var(--vp-c-text-3)"/>
<line x1="90" y1="140" x2="134" y2="118" marker-end="url(#detArrow3)"/>
<line x1="90" y1="140" x2="178" y2="96" marker-end="url(#detArrow3)"/>
<text x="138" y="114" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">a=(2,1)</text>
<text x="182" y="92" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">b=(4,2)=2a</text>
<text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">平行四边形退化：面积=0 → det=0</text>
</svg>
</FigBox>

**看图能读出什么**：当两列落在同一条直线上时，它们再也扫不出二维区域，面积塌成 0。此时变换不是一对一的——整条「垂直于这条线的方向」都被压到原点，所以零空间里塞满了非零向量。这就是 $\det A=0$ 的几何真相。

反过来，$\det A\neq0$ 时变换没有压扁任何方向，可以还原，$A$ 可逆。这个等价关系是下一章特征值那套 $\det(A-\lambda I)=0$ 的入口。行列式在历史上还有一个著名应用，值得用一句话点到。

## 八、克拉默法则：一句话，不展开

这一节只告诉你克拉默法则是什么、什么时候用得上，不展开推导。

**克拉默法则（Cramer's rule）**：当 $\det A\neq0$ 时，方程组 $A\mathbf x=\mathbf b$ 的唯一解是

$$
x_i=\frac{\det A_i}{\det A}
$$

其中 $A_i$ 是把 $A$ 的第 $i$ 列换成 $\mathbf b$ 得到的矩阵。一句话记住：**每个未知数的解，等于「把那一列换成常数项后的行列式」除以「原行列式」**。它很漂亮，但计算量巨大（要算 $n+1$ 个行列式），工程上几乎不用它解大规模方程组——知道它存在、能看懂它在说什么就够了。

到这里，几何含义、三条性质、两种算法、det=0 的判定、克拉默法则的一句话都齐了。下面三道例题把「算」和「为什么」连起来。

## 例题

三道题按顺序排：例 1 是 2×2 的几何意义 + 公式，例 2 是 3×3 的代数余子式展开，例 3 用性质把计算化简到只剩一步。

::: tip 例 1 · 2×2 行列式：面积从 1 到 10 {#ex-det-1}
**题目**：$A=\begin{bmatrix}3&1\\2&4\end{bmatrix}$。求 $\det A$，并说明它的几何含义。

<FigBox title="例 1 的平行四边形：数格子读出面积 10" kind="几何" note="列向量 a=(3,2)、b=(1,4) 张成平行四边形。det = 3×4 − 2×1 = 10，也就是这个平行四边形的面积；网格每格是 1。" >
<svg viewBox="0 0 340 190" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<g stroke="var(--vp-c-divider)" stroke-width="1">
<line x1="60" y1="150" x2="60" y2="42"/>
<line x1="78" y1="150" x2="78" y2="60"/>
<line x1="96" y1="150" x2="96" y2="78"/>
<line x1="114" y1="150" x2="114" y2="96"/>
<line x1="132" y1="150" x2="132" y2="114"/>
<line x1="60" y1="150" x2="150" y2="150"/>
<line x1="60" y1="132" x2="168" y2="132"/>
<line x1="60" y1="114" x2="186" y2="114"/>
<line x1="60" y1="96" x2="204" y2="96"/>
<line x1="60" y1="78" x2="222" y2="78"/>
<line x1="60" y1="60" x2="240" y2="60"/>
</g>
<path d="M60 150 L114 114 L132 42 L78 78 Z" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)"/>
<defs>
<marker id="detArrow4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="var(--vp-c-text-1)"/>
</marker>
</defs>
<line x1="60" y1="150" x2="114" y2="114" marker-end="url(#detArrow4)"/>
<line x1="60" y1="150" x2="78" y2="78" marker-end="url(#detArrow4)"/>
<text x="116" y="126" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">a=(3,2)</text>
<text x="66" y="72" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">b=(1,4)</text>
<text x="118" y="104" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">det=10</text>
</svg>
</FigBox>

**先想什么**：2×2 直接用 $ad-bc$，但先想清楚两列是什么——第一列 $(3,2)$、第二列 $(1,4)$。

**计算**：

$$
\det A=\begin{vmatrix}3&1\\2&4\end{vmatrix}=3\times4-1\times2=12-2=10
$$

**为什么是面积**：两列张成的平行四边形面积就是 $10$。单位正方形经 $A$ 变换后面积从 $1$ 变成 $10$，所以 $\det A=10$。$10>0$ 说明从 $(3,2)$ 到 $(1,4)$ 仍是逆时针，平面没有被翻面。

**验算（node）**：`3*4 - 1*2` 得 `10`。用交换两列检查符号：$\det\begin{bmatrix}1&3\\4&2\end{bmatrix}=1\times2-3\times4=2-12=-10$，正好是 $-10$，符合性质 1。
:::

::: tip 例 2 · 3×3 行列式：沿零最多的一列展开 {#ex-det-2}
**题目**：求 $\det A$，其中

$$
A=\begin{bmatrix}1&2&3\\0&4&5\\1&0&6\end{bmatrix}
$$

**先想什么**：3×3 用代数余子式展开，先挑零最多的行或列。第 2 列只有一个非零元素（$a_{12}=2$），沿它展开最省；也可以沿第 1 列展开（有一个 0）。这里沿第 1 列展开示范。

**沿第 1 列展开**：$a_{11}=1,\ a_{21}=0,\ a_{31}=1$，余子式符号依次 $+,-,+$：

$$
\det A = 1\cdot\begin{vmatrix}4&5\\0&6\end{vmatrix}-0\cdot(\cdots)+1\cdot\begin{vmatrix}2&3\\4&5\end{vmatrix}
$$

$$
=1\times(4\times6-5\times0)+1\times(2\times5-3\times4)=24+(10-12)=24-2=22
$$

**验算（node）**：手写 3×3 展开 `1*(4*6-5*0) - 0 + 1*(2*5-3*4)` 得 `22`。换沿第 2 列展开再验一次：$a_{12}=2$（符号 $-$）、$a_{22}=4$（符号 $+$）、$a_{32}=0$：

$$
\det A=-2\begin{vmatrix}0&5\\1&6\end{vmatrix}+4\begin{vmatrix}1&3\\1&6\end{vmatrix}=(-2)(0\times6-5\times1)+4(1\times6-3\times1)=(-2)(-5)+4\times3=10+12=22
$$

两条路线结果一致 ✓。

**这一题最该带走的一句**：**选零最多的一行/一列展开**，把三阶拆成两三个二阶，比硬背大公式快得多。
:::

::: tip 例 3 · 用性质简化：三角化与成比例行 {#ex-det-3}
**题目**：分别求（a）$\det\begin{bmatrix}1&2&1\\2&5&2\\1&2&3\end{bmatrix}$ 与（b）$\det\begin{bmatrix}2&4&6\\1&2&3\\5&7&9\end{bmatrix}$。

**先想什么**：（a）不急着展开，先用**行替换**（不改变 det）化成三角；（b）一眼看第 2 行是第 1 行的一半——两行成比例，det 直接是 0。

**（a）三角化**：$R_2-2R_1$、$R_3-R_1$：

$$
\begin{bmatrix}1&2&1\\2&5&2\\1&2&3\end{bmatrix}
\to
\begin{bmatrix}1&2&1\\0&1&0\\1&2&3\end{bmatrix}
\to
\begin{bmatrix}1&2&1\\0&1&0\\0&0&2\end{bmatrix}
$$

无交换，所以 $\det A=1\times1\times2=2$。

**验算（node）**：直接 3×3 展开 `1*(5*3-2*2) - 2*(2*3-2*1) + 1*(2*2-5*1)` 得 `11 - 8 - 1 = 2` ✓，与三角化结果一致。

**（b）成比例行**：第 1 行 $[2,4,6]$ 是第 2 行 $[1,2,3]$ 的 2 倍，两行成比例 ⇒ 行列式为 0。

**验算（node）**：直接展开得 `0` ✓。同时 $\det A=0$ 意味着这个矩阵不可逆、零空间非平凡——事实上 $\mathbf x=(1,-2,1)$ 满足 $A\mathbf x=\mathbf 0$（三行点积都是 0），零空间里确有非零向量。

**这一题最该带走的一句**：**能先用性质化简就先化简**——行替换 + 三角化把一个 3×3 化简到「乘三个数」，而成比例行一眼判 0，比展开快得多。
:::

三道题做完，用一份清单把这一页的坑排一遍。

## 易错清单

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. **交换两行后忘了变号** → 符号反了，绝对值对但答案错 → 每交换一次就乘一个 $-1$，用「交换次数是奇是偶」记最终符号。
2. **把 $|A|$ 当成绝对值** → 行列式为负时强行取正 → $|A|$ 在这里是行列式记号，可以是负的；面积/体积的大小才是 $|\det A|$。
3. **代数余子式符号记错** → 展开时某一项少个负号，结果整个错 → 符号是棋盘 $(-1)^{i+j}$，左上角为正，交错排列。
4. **把「某行乘 k」与「整个矩阵乘 k」搞混** → 3×3 里差 $k^3$ 倍 → 只乘一行行列式乘 $k$；整个矩阵每行都乘 $k$，则 $\det(kA)=k^n\det A$。
5. **以为 $\det(A+B)=\det A+\det B$** → 误用线性性 → 行列式只对**每一行**线性，不对整个矩阵相加线性；乘法才是 $\det(AB)=\det A\det B$。
6. **det=0 就以为「没解」** → 与方程组判定混淆 → det=0 对应 $A\mathbf x=\mathbf b$ **可能无解也可能无穷多解**（取决于 $\mathbf b$ 是否在列空间），而 $A\mathbf x=0$ 必有非零解。

## 自检

1. 矩阵 $A=\begin{bmatrix}2&0\\0&3\end{bmatrix}$ 把单位正方形变成什么形状？面积是多少？$\det A$ 是多少？
2. 交换 $A$ 的两列之后，行列式变成多少？为什么？
3. 一个 3×3 矩阵有两行完全相同，它的行列式是多少？这说明了什么（可逆吗、零空间平凡吗）？
4. 三角矩阵 $\begin{bmatrix}4&1&9\\0&-2&7\\0&0&5\end{bmatrix}$ 的行列式是多少？

## 下一步

行列式回答了「变换把面积/体积放大了多少倍、有没有翻面、有没有压扁」。下一章把它用在最关键的地方：找那些「方向不变、只被拉伸」的向量——特征向量，而判定依据正是 $\det(A-\lambda I)=0$。

下一章：[06 · 特征值、特征向量与对角化](./06-eigenvalues.md)
