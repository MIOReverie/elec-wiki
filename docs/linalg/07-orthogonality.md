---
title: 07 · 正交、投影与二次型
description: 点积与正交、标准正交基、向量投影到直线与平面的垂足、Gram-Schmidt 正交化、最小二乘法方程、二次型与正定性（碗/马鞍/椭圆的几何）、SVD 一句话；配「投影 = 垂足」与「正定 = 开口向上的碗」两张几何图与三道 node 验算例题。
---

# 07 · 正交、投影与二次型

<Meta time="45 min" level="核心" note="最深的三个坑：投影忘了『垂足才是最短距离』；Gram-Schmidt 每步漏减前面所有向量的投影；正定只会背定义、不会用特征值与主元判断" />

**这一页要解决什么**：前面几章你学会了把向量写成坐标、把矩阵看成变换、把方程组看成「$A\mathbf x=\mathbf b$ 有没有落在列空间里」。这一页把「角度」这个一直被忽略的几何量拉回来：两个向量什么时候「垂直」，一个向量怎么「垂直砸」到直线或平面上，以及当 $A\mathbf x=\mathbf b$ 没有解时怎么找「最接近的解」。读完你应该能：说清正交为什么等于点积为零；心算一个向量到一条直线/一个平面上的投影；用 Gram-Schmidt 把任意一组基「摆正」；用最小二乘给一堆带噪声的数据拟合直线；最后用「碗开口向上还是马鞍」判断一个二次型是否正定。

::: tip 读这页之前
- **需要会**：向量的坐标与点积（[01 · 向量、线性组合与张成](./01-vectors.md)）、矩阵乘法与转置（[02 · 矩阵与线性变换](./02-matrices.md)）、高斯消元解方程组（[03 · 高斯消元与线性方程组](./03-elimination.md)）、列空间与子空间（[04 · 向量空间与四大子空间](./04-subspaces.md)）、特征值与对角化（[06 · 特征值、特征向量与对角化](./06-eigenvalues.md)）、行列式（[05 · 行列式：面积缩放的因子](./05-determinant.md)）。记不清时点回去，每页开头都有「结论先行」可以 30 秒捡回来。
- **这一页用到的符号**：$\mathbf u \cdot \mathbf v$ 是点积；$\mathbf u \perp \mathbf v$ 表示两者垂直；$|\mathbf v|$ 是向量的长度（模）；$A^T$ 是转置；$Q$ 专门用来表示列向量标准正交的矩阵；$q(\mathbf x)=\mathbf x^T A\mathbf x$ 是二次型。全部约定见[符号与约定](../guide/notation.md)。
- **一个术语先解释**：**投影**（projection）在本页专指「垂直投影」——把向量沿「与目标子空间垂直」的方向砸过去得到的影子，也就是垂足；不是斜着照过去的影子。
- **会用到一点「最小」**：最小二乘里那个「最小」不需要你求导，它完全可以用几何（垂足到平面上任一点都最近）推出来，本页就用几何推。
:::

先看一个谁都遇到过的具体场景。你在实验室测一根电阻的伏安特性，得到三个数据点 $(1,1)$、$(2,2)$、$(3,4)$——按理想欧姆定律它们该严格落在一条过原点的直线上，可第三点明显偏高。你想画一条「最好」的直线穿过它们：这条直线不可能同时穿过三个点（三点不共线），那什么叫「最好」？直觉是「每个点到直线的竖直距离的平方和最小」。这一页要证明：这个「最好」的直线，恰好是「把数据点投影到直线张成的空间里」这件事，而它背后的一整套工具——正交、投影、Gram-Schmidt、最小二乘——最终还会把你带到二次型的「碗」和 SVD 的「总装车间」。

## 结论先行

1. **正交 = 点积为零 = 夹角 90°**，它是本页所有概念的地基：$\mathbf u \perp \mathbf v \iff \mathbf u \cdot \mathbf v = 0$。
2. **投影 = 垂足 = 最短距离**：子空间里离 $\mathbf b$ 最近的点，就是从 $\mathbf b$ 垂直砸下来的影子，误差 $\mathbf e$ 永远与子空间垂直。
3. **Gram-Schmidt = 反复「减掉投影」**：每一步把当前向量减去它在前面所有正交向量上的投影，剩下的自然垂直，再归一就得到标准正交基。
4. **最小二乘 = 先投影再解**：$A\mathbf x=\mathbf b$ 无解时，把 $\mathbf b$ 投影到 $A$ 的列空间，解 $A^T A\hat{\mathbf x}=A^T\mathbf b$，得到的 $\hat{\mathbf x}$ 让误差平方和最小。
5. **二次型正定 = 碗口向上 = 特征值全正**：$\mathbf x^T A\mathbf x>0$ 恒成立、几何上是开口向上的碗、代数是所有特征值（等价地所有主元）都大于零，三者是一回事。

::: tip 一句话抓住本质
正交与投影其实是「把向量拆成『贴着子空间的部分』和『垂直于子空间的部分』」两种工具，最小二乘是它的直接应用，而二次型正定就是问「这张碗到底朝上还是朝下」。把「垂直拆分」想明白，这一页就通了。
:::

## 一、点积与正交：两向量「重叠」了多少

这一节只回答一个问题：两个向量之间的「角度」不用量角器，怎么算。

答案是**点积**。两个 $n$ 维向量 $\mathbf u=(u_1,\dots,u_n)$ 与 $\mathbf v=(v_1,\dots,v_n)$ 的点积是坐标逐项相乘再相加：

$$
\mathbf u \cdot \mathbf v = u_1 v_1 + u_2 v_2 + \cdots + u_n v_n.
$$

它的几何含义是一句能背一辈子的话：**点积等于一个向量在另一个向量方向上的「投影长度」再乘上那个向量的长度**，写成公式是

$$
\mathbf u \cdot \mathbf v = |\mathbf u|\,|\mathbf v|\cos\theta,
$$

其中 $\theta$ 是两者的夹角。把 $\mathbf u$ 和自己点积，得到 $\mathbf u \cdot \mathbf u = |\mathbf u|^2$，于是长度 $|\mathbf u|=\sqrt{\mathbf u \cdot \mathbf u}$。这一切的关键在 $\cos\theta$：当两个向量**正交**（orthogonal，指夹角为 $90°$）时，$\cos\theta=0$，点积正好归零。所以「正交」这个几何概念拿到了一个纯粹代数的判据：

$$
\mathbf u \perp \mathbf v \quad \iff \quad \mathbf u \cdot \mathbf v = 0.
$$

::: tip 为什么这个判据值钱
「画一个直角」在二维平面上容易，在 100 维的数据空间里你没法画。但「算一个点积看它是不是零」在任何维数都只花一次逐项相乘相加。这就是线性代数把几何搬进高维空间的办法：**把『垂直』翻译成『点积为零』**。
:::

有了长度和垂直，你还能定义**单位向量**（长度为 1 的向量，$|\mathbf u|=1$），以及马上要用的核心对象：**标准正交**（orthonormal）——一组向量两两垂直，且每个都是单位向量。下一节就从这里出发：如果一组基恰好是标准正交的，求坐标会变成一件几乎不用算的事。

## 二、正交基：坐标变成点积

这一节回答：为什么大家都愿意把基「摆正」——因为标准正交基让「求坐标」退化成「点积」。

回忆第一章：把 $\mathbf x$ 在一组基 $\mathbf v_1,\dots,\mathbf v_n$ 下展开成 $\mathbf x=c_1\mathbf v_1+\cdots+c_n\mathbf v_n$，求坐标 $c_1,\dots,c_n$ 通常要解一个 $n$ 元方程组。可如果这组基是**标准正交的**（记作 $\mathbf q_1,\dots,\mathbf q_n$，两两垂直且长度都是 1），奇迹出现了：拿 $\mathbf q_i$ 去点积展开式两边，右边除 $c_i$ 自己那一项外全部是零（正交），而 $\mathbf q_i\cdot\mathbf q_i=1$（单位），于是

$$
c_i = \mathbf q_i \cdot \mathbf x.
$$

**坐标就是点积**，每个系数互不干扰、可以单独取出来，不用解任何方程组。这就像直角坐标系里「横坐标就是往 x 轴方向的投影」在高维空间的推广。

把标准正交基的向量按列排成一个方阵，就得到**正交矩阵** $Q$。它的定义式把所有「两两垂直且单位」压缩成一句话：

$$
Q^T Q = I,
$$

也就是说 $Q$ 的逆就是它的转置：$Q^{-1}=Q^T$。这件事在工程上极其省事——求一个正交矩阵的逆，不用消元，转置一下就完了。到这里你已经有了两件武器（点积判正交、正交基免解方程），下一节把它们用在第一个几何动作上：**投影**。

## 三、投影：垂足就是最短距离

这一节回答：一个向量怎么「垂直砸」到一条直线、一个平面上，以及为什么砸下来的影子是最近的。

**投影**（projection）的几何图景一句话：把 $\mathbf b$ 沿「与目标子空间垂直」的方向推到子空间上，得到的那个点就是投影，记为 $\hat{\mathbf b}$。先做最简单的一维情形——投影到由单个向量 $\mathbf a$ 张成的直线上。$\hat{\mathbf b}$ 一定落在 $\mathbf a$ 的方向上，所以是 $\mathbf a$ 的某个倍数：$\hat{\mathbf b}=\hat{x}\,\mathbf a$。关键是「垂直」这个约束：误差 $\mathbf e=\mathbf b-\hat{\mathbf b}$ 必须垂直于 $\mathbf a$（否则投影就还能再往里挪），即 $\mathbf a \cdot (\mathbf b-\hat{x}\mathbf a)=0$，解出

$$
\hat{\mathbf b} = \frac{\mathbf a \cdot \mathbf b}{\mathbf a \cdot \mathbf a}\,\mathbf a.
$$

中间那个系数 $\dfrac{\mathbf a \cdot \mathbf b}{\mathbf a \cdot \mathbf a}$ 就是 $\mathbf b$ 在 $\mathbf a$ 方向上的「分量长度」。

<FigBox title="投影 = 垂足" kind="几何" note="把 b 沿垂直于直线 L 的方向砸下去，得到垂足 b̂（读作 b-hat）。阴影垂直段 e = b − b̂ 永远垂直于 a，所以它就是到直线上所有点里最近的那一个；任何别的点都会让 e 变长。">

<svg viewBox="0 0 360 230" role="img" aria-label="向量 b 垂直投影到向量 a 张成的直线上得到垂足 b̂，误差 e 与直线垂直">
<defs>
  <marker id="prj-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-2)">
  <line x1="30" y1="190" x2="330" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="30" y1="190" x2="30" y2="30" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <text x="322" y="208">x</text>
  <text x="14" y="34">y</text>
</g>
<g font-size="12.5">
  <line x1="40" y1="176" x2="130" y2="56" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="120" y="44" fill="var(--vp-c-text-3)">直线 L = span(a)</text>
  <line x1="30" y1="190" x2="96" y2="102" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#prj-arr)" />
  <text x="72" y="130" fill="var(--vp-c-brand-1)">a=(3,4)</text>
  <line x1="30" y1="190" x2="140" y2="190" stroke="var(--vp-c-brand-2)" stroke-width="2.2" marker-end="url(#prj-arr)" />
  <text x="138" y="182" fill="var(--vp-c-brand-2)">b=(5,0)</text>
  <line x1="30" y1="190" x2="70" y2="137" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#prj-arr)" />
  <text x="16" y="150" fill="var(--vp-c-brand-1)">b̂</text>
  <line x1="140" y1="190" x2="70" y2="137" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-dasharray="4 3" />
  <text x="108" y="172" fill="var(--vp-c-text-1)">e = b − b̂</text>
  <path d="M 76 137 L 84 143 L 70 151" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4" />
  <circle cx="70" cy="137" r="4" fill="var(--vp-c-brand-1)" />
  <text x="52" y="128" fill="var(--vp-c-text-2)">垂足</text>
</g>
</svg>

</FigBox>

把它写成矩阵形式，投影这个动作就是一个**投影矩阵** $P$ 在作用：$\hat{\mathbf b}=P\mathbf b$，其中

$$
P = \frac{\mathbf a \mathbf a^T}{\mathbf a^T \mathbf a}.
$$

（$\mathbf a\mathbf a^T$ 是列向量乘行向量，得到的是矩阵，分母 $\mathbf a^T\mathbf a$ 是那个数 $\mathbf a\cdot\mathbf a$。）投影矩阵有两个一眼能背的性质：$P^2=P$（已经砸下去了，再砸一次还是它自己）和 $P=P^T$（对称）。而误差向量满足

$$
\mathbf a \cdot \mathbf e = 0,\qquad |\mathbf b|^2 = |\hat{\mathbf b}|^2 + |\mathbf e|^2.
$$

第二个式子是勾股定理：$\mathbf b$ 被「垂直拆分」成了贴着直线的部分 $\hat{\mathbf b}$ 和垂直部分 $\mathbf e$，所以长度平方正好相加。

推广到**投影到平面**（更一般地投影到矩阵 $A$ 的列空间）：只要 $A$ 的列线性无关，投影矩阵是

$$
P = A(A^T A)^{-1} A^T.
$$

直观还是同一句话：$\hat{\mathbf b}=P\mathbf b$ 落在列空间里，而误差 $\mathbf e=\mathbf b-\hat{\mathbf b}$ 垂直于列空间里的每一个向量。为什么投影是「最近的」？因为对列空间里任何别的点 $\mathbf y$，$\mathbf b-\mathbf y$ 都能拆成「$\mathbf b-\hat{\mathbf b}$（垂直段）加 $\hat{\mathbf b}-\mathbf y$（在列空间里的段）」，勾股定理立刻给出 $|\mathbf b-\mathbf y|^2=|\mathbf b-\hat{\mathbf b}|^2+|\hat{\mathbf b}-\mathbf y|^2\ge|\mathbf b-\hat{\mathbf b}|^2$，等号只在 $\mathbf y=\hat{\mathbf b}$ 时取到——**垂足就是最短距离**。这个结论下一节直接变成 Gram-Schmidt 的每一步。

## 四、Gram-Schmidt：把一组基摆正

这一节回答：给一组「歪」的线性无关向量，怎么自动造出一组标准正交基。

**Gram-Schmidt 正交化**（Gram-Schmidt orthogonalization）的思路只有一个，重复用上一节的投影：让第 $k$ 个向量减去它在前面所有正交向量上的投影之和，剩下的部分自然与它们全部垂直。给定线性无关的 $\mathbf v_1,\dots,\mathbf v_n$：

$$
\mathbf u_1=\mathbf v_1,\quad \mathbf q_1=\frac{\mathbf u_1}{|\mathbf u_1|},
$$

$$
\mathbf u_k=\mathbf v_k-\sum_{j=1}^{k-1}(\mathbf q_j\cdot\mathbf v_k)\,\mathbf q_j,\qquad \mathbf q_k=\frac{\mathbf u_k}{|\mathbf u_k|}.
$$

读法：$\mathbf q_j\cdot\mathbf v_k$ 是 $\mathbf v_k$ 在 $\mathbf q_j$ 方向上的分量长度，乘回 $\mathbf q_j$ 得到那段投影向量，全部减掉之后 $\mathbf u_k$ 就只剩「垂直于前面所有 $\mathbf q_j$」的部分，最后除以 $|\mathbf u_k|$ 归一成单位向量。例 2 会把这个过程走一遍数字。

::: tip 别只背公式，想清楚「减几遍」
最容易错的不是算错除法，而是**只减了对最后一个向量的投影**。公式里是对 $j=1$ 到 $k-1$ 求和：每进一个新向量，要把它在**前面每一个** $\mathbf q_j$ 上的投影都减掉。少减一个，结果就不垂直，后面所有步全错。
:::

把整个过程的每一步系数攒起来，就得到**QR 分解**：

$$
A = QR,
$$

其中 $Q$ 的列是标准正交的（就是那一串 $\mathbf q$），$R$ 是上三角矩阵（对角线是各步的 $|\mathbf u_k|$）。QR 分解的价值：它把「一组基」免费升级成「一组标准正交基」，而标准正交基的坐标等于点积（第二节）、逆等于转置——求解最小二乘的正规方程时，数值上用的就是它。下一节正好轮到最小二乘。

## 五、最小二乘：当 Ax=b 无解

这一节回答：方程组无解时，怎么找「最接近的解」，以及为什么投影就是答案。

**最小二乘**（least squares）要解决的问题是：$A\mathbf x=\mathbf b$ 没有精确解——典型情形是方程个数比未知数多（超定方程组），比如三个数据点要过同一条直线。无解的几何原因是 $\mathbf b$ 不在 $A$ 的列空间里。既然够不着，就退而求其次：找 $\hat{\mathbf x}$，使误差向量 $A\mathbf x-\mathbf b$ 的**长度平方 $|A\mathbf x-\mathbf b|^2$ 最小**。名字「最小二乘」里的「二乘」就是「平方」。

上一节的结论直接给答案：列空间里离 $\mathbf b$ 最近的点就是它的投影 $\hat{\mathbf b}=A\hat{\mathbf x}$，而误差 $\mathbf e=\mathbf b-A\hat{\mathbf x}$ 垂直于整个列空间。垂直于列空间，等价于与 $A$ 的每一行都正交，写成矩阵就是 $A^T\mathbf e=0$，展开得到

$$
A^T A\,\hat{\mathbf x} = A^T \mathbf b.
$$

这就是**法方程**（normal equations）。当 $A$ 的列线性无关时，$A^T A$ 可逆，解为

$$
\hat{\mathbf x} = (A^T A)^{-1} A^T \mathbf b.
$$

注意整个过程没有求导：$\hat{\mathbf x}$ 之所以让平方和最小，纯粹是因为「垂足最短」这个几何事实。例 3 会用三个数据点走一遍完整的法方程。

::: tip 什么时候最小二乘「正好是精确解」
如果 $\mathbf b$ 恰好落在列空间里，投影就是它自己，误差为零，法方程给出的 $\hat{\mathbf x}$ 就是原方程组的精确解。所以最小二乘不是「换一个近似问题」，而是「把精确解的定义从列空间里放松到列空间外」。
:::

最小二乘把「投影」变成了数据拟合的引擎。接下来换一个完全不同的几何对象：二次型——投影处理的是「向量之间的角度」，二次型处理的是「一张碗的形状」。

## 六、二次型与正定性：碗、马鞍与椭圆

这一节回答：$\mathbf x^T A\mathbf x$ 这个式子在几何上是什么，以及怎么判断它是碗还是马鞍。

**二次型**（quadratic form）是只含二次项的函数

$$
q(\mathbf x) = \mathbf x^T A \mathbf x = \sum_{i,j} a_{ij} x_i x_j,
$$

习惯上要求 $A$ 对称（若不对称，就用 $\dfrac{A+A^T}{2}$ 替换，二次型的值不变）。在二维，它长成 $q(x,y)=ax^2+2bxy+cy^2$。这个式子的几何图景来自「等高线」：固定一个常数 $c$，方程 $q(x,y)=c$ 画出的曲线决定这张曲面的形状——是椭圆（碗）、双曲线（马鞍），还是别的。

**正定**（positive definite）的定义很朴素：对一切 $\mathbf x\neq 0$ 都有 $q(\mathbf x)>0$。几何上，这就是一张**开口向上的碗**：无论从原点往哪个方向走，函数值都往上长，原点是最低点。反过来，负定是开口向下的碗，**不定**（indefinite）是马鞍面（有的方向往上、有的往下），半正定则是碗「沿某个方向被压平」（有零特征值）。

<FigBox title="正定 = 开口向上的碗" kind="几何" note="左图是碗的截面：一条开口向上的抛物线，原点（碗底）是唯一最低点。右图从正上方看这张碗，等高线 q(x,y)=c 是一圈圈椭圆——沿每个方向走，值都在增大，这就是『正定』的几何判据。若等高线是双曲线，那就是马鞍（不定）。">

<svg viewBox="0 0 340 210" role="img" aria-label="左边是开口向上的抛物线碗截面，右边是同心椭圆等高线">
<defs>
  <marker id="pd-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-2)">
  <line x1="18" y1="170" x2="18" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1" marker-end="url(#pd-arr)" />
  <text x="26" y="176">碗底 O（最低点）</text>
  <path d="M 20 115 Q 85 40 150 115" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <circle cx="85" cy="77" r="4" fill="var(--vp-c-brand-1)" />
  <line x1="24" y1="105" x2="146" y2="105" stroke="var(--vp-c-text-1)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="150" y="108" fill="var(--vp-c-text-1)">等高面</text>
  <text x="36" y="30" fill="var(--vp-c-text-3)">碗的截面：开口向上</text>

  <ellipse cx="250" cy="100" rx="58" ry="34" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <ellipse cx="250" cy="100" rx="40" ry="23" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <ellipse cx="250" cy="100" rx="22" ry="12" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="250" cy="100" r="3" fill="var(--vp-c-brand-1)" />
  <text x="206" y="152" fill="var(--vp-c-text-3)">俯视：等高线 q(x,y)=c 是一圈圈椭圆</text>
</g>
</svg>

</FigBox>

判断正定有三种**等价**的方法，从几何到代数依次是：

1. **特征值法**（连回第六章）：把 $A$ 对角化成 $\lambda_1 x_1^2+\cdots+\lambda_n x_n^2$ 之后，二次型的形状完全由特征值决定——**正定 $\iff$ 所有特征值 $>0$**。特征向量给出碗的主轴方向，这就是「主轴定理」。
2. **主元法**（连回第三章）：对 $A$ 做高斯消元，**正定 $\iff$ 所有主元 $>0$**。
3. **顺序主子式法**（连回第五章，Sylvester 判据）：从左上角依次取 $1\times1$、$2\times2$、…… 的子矩阵，**正定 $\iff$ 每个顺序主子式的行列式都 $>0$**。

三条判据记一条就够用，但要知道它们说的是同一件事。例如 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$：特征值是 $3$ 和 $1$（全正），主元是 $2$ 和 $\tfrac{3}{2}$（全正），顺序主子式是 $2$ 和 $3$（全正），所以它正定，对应的 $q(x,y)=2x^2+2xy+2y^2=2\!\left(x+\tfrac{y}{2}\right)^2+\tfrac32 y^2$ 确实恒正、是一张开口向上的碗。下一节用一句话把这一页和前面六章全部收进一个定理。

## 七、SVD：一句话（选学）

这一节给一个「总装」视角，把正交基、投影、特征值拼成一个最著名的分解。

**SVD（奇异值分解，singular value decomposition）**说：任何一个矩阵 $A$（不要求方阵、不要求可逆）都能写成

$$
A = U \Sigma V^T,
$$

读作「先旋转/镜像（$V^T$），再沿坐标轴拉伸（$\Sigma$ 的对角元 $\sigma_1,\sigma_2,\dots$ 是拉伸倍数），最后再旋转/镜像（$U$）」。$U$ 和 $V$ 的列都是标准正交基，对角元 $\sigma_i$ 叫**奇异值**，满足 $\sigma_i^2$ 等于 $A^T A$ 的特征值。换句话说，**任意线性变换 = 两次正交换基夹一次纯拉伸**——你本页学的「正交基」给了那两次换基，上一章学的「特征值」给了中间的拉伸量。这一章到这里闭环，下面是三道例题，把公式变成能算的东西。

## 八、例题

::: tip 例 1 · 投影到一条直线
**题目**：在平面上，$\mathbf a=(3,4)$，$\mathbf b=(5,0)$。求 $\mathbf b$ 在 $\mathbf a$ 方向上的投影 $\hat{\mathbf b}$，并写出投影矩阵 $P$，验证误差 $\mathbf e=\mathbf b-\hat{\mathbf b}$ 与 $\mathbf a$ 垂直。

**图**：见第三节的「投影 = 垂足」图——$\mathbf a$ 指右上、$\mathbf b$ 指正右，垂足就是 $\hat{\mathbf b}$。

**先想什么**：投影向量一定在 $\mathbf a$ 方向上，所以只要求出那个「分量长度」系数，再乘回 $\mathbf a$；投影矩阵则是把这个动作写成矩阵形式。

**步骤**：
1. 算点积：$\mathbf a\cdot\mathbf a=3^2+4^2=25$，$\mathbf a\cdot\mathbf b=3\cdot5+4\cdot0=15$。*（为什么先算这两个：投影系数就是它们相除。）*
2. 系数 $\hat{x}=\dfrac{15}{25}=\dfrac35$，所以 $\hat{\mathbf b}=\dfrac35(3,4)=\left(\dfrac95,\dfrac{12}5\right)=(1.8,\,2.4)$。*（为什么是这个倍数：$\hat{\mathbf b}$ 必须落在直线 span(a) 上。）*
3. 投影矩阵 $P=\dfrac{\mathbf a\mathbf a^T}{\mathbf a^T\mathbf a}=\dfrac{1}{25}\begin{pmatrix}9&12\\12&16\end{pmatrix}$，检查 $P\mathbf b=\dfrac1{25}(9\cdot5,\,12\cdot5)=\left(\dfrac95,\dfrac{12}5\right)=\hat{\mathbf b}$ ✓。
4. 误差 $\mathbf e=\mathbf b-\hat{\mathbf b}=(5-1.8,\,0-2.4)=(3.2,\,-2.4)$，点积 $\mathbf a\cdot\mathbf e=3\cdot3.2+4\cdot(-2.4)=9.6-9.6=0$ ✓。

**验算**：用勾股定理回代——$|\mathbf b|^2=25$，$|\hat{\mathbf b}|^2=1.8^2+2.4^2=9$，$|\mathbf e|^2=3.2^2+2.4^2=16$，而 $9+16=25$ ✓。垂直拆分后的长度平方正好相加。
:::

::: tip 例 2 · Gram-Schmidt 把一组基摆正
**题目**：对 $\mathbf v_1=(3,4)$ 与 $\mathbf v_2=(1,3)$ 做 Gram-Schmidt，求标准正交基 $\mathbf q_1,\mathbf q_2$。

<FigBox title="Gram-Schmidt：减去投影后剩下的自然垂直" kind="几何" note="v₂ 减去它在 v₁ 方向上的投影（蓝色虚线），剩下的 u₂ 与 v₁ 垂直；这个例子里 |u₂| 恰好等于 1，所以 q₂ = u₂ 不用再除。">

<svg viewBox="0 0 320 210" role="img" aria-label="v1 指向右上，v2 减去它在 v1 上的投影后得到垂直的 u2">
<defs>
  <marker id="gs-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12.5">
  <line x1="40" y1="190" x2="40" y2="30" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="40" y1="190" x2="300" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="40" y1="190" x2="100" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#gs-arr)" />
  <text x="92" y="134" fill="var(--vp-c-brand-1)">v₁=(3,4)</text>
  <line x1="40" y1="190" x2="60" y2="130" stroke="var(--vp-c-brand-2)" stroke-width="2.2" marker-end="url(#gs-arr)" />
  <text x="58" y="150" fill="var(--vp-c-brand-2)">v₂=(1,3)</text>
  <line x1="40" y1="190" x2="76" y2="142" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#gs-arr)" />
  <text x="52" y="172" fill="var(--vp-c-brand-1)">投影</text>
  <line x1="60" y1="130" x2="76" y2="142" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-dasharray="4 3" />
  <path d="M 70 148 L 76 141 L 83 146" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4" />
  <line x1="40" y1="190" x2="24" y2="178" stroke="var(--vp-c-text-1)" stroke-width="2.2" marker-end="url(#gs-arr)" />
  <text x="12" y="186" fill="var(--vp-c-text-1)">u₂</text>
</g>
</svg>

</FigBox>

**先想什么**：第一个向量不用减任何东西，先归一；第二个向量要减去「它在第一个方向上的投影」。

**步骤**：
1. $\mathbf u_1=\mathbf v_1=(3,4)$，长度 $|\mathbf u_1|=\sqrt{25}=5$，所以 $\mathbf q_1=\left(\dfrac35,\dfrac45\right)$。*（为什么先归一：后面减投影时用单位向量，系数就是点积。）*
2. 求 $\mathbf v_2$ 在 $\mathbf q_1$ 上的分量：$\mathbf q_1\cdot\mathbf v_2=\dfrac35\cdot1+\dfrac45\cdot3=\dfrac{15}5=3$。*（为什么是点积：标准正交基下坐标 = 点积。）*
3. 减掉投影：$\mathbf u_2=\mathbf v_2-3\,\mathbf q_1=(1,3)-\left(\dfrac95,\dfrac{12}5\right)=\left(-\dfrac45,\dfrac35\right)=(-0.8,\,0.6)$。*（为什么减 3 倍 q₁：这 3 是 v₂ 在 q₁ 方向上的全长。）*
4. $|\mathbf u_2|=\sqrt{0.64+0.36}=1$，正好是单位向量，$\mathbf q_2=\left(-\dfrac45,\dfrac35\right)$。*（为什么这题选得巧：|u₂|=1，省一次除法。）*

**验算**：$\mathbf q_1\cdot\mathbf q_2=\dfrac35\cdot\left(-\dfrac45\right)+\dfrac45\cdot\dfrac35=-\dfrac{12}{25}+\dfrac{12}{25}=0$ ✓，且 $|\mathbf q_1|=|\mathbf q_2|=1$ ✓，所以 $\{\mathbf q_1,\mathbf q_2\}$ 是标准正交基。写成 QR：$A=\begin{pmatrix}3&1\\4&3\end{pmatrix}=QR$，其中 $R$ 是上三角阵 $\begin{pmatrix}5&3\\0&1\end{pmatrix}$。
:::

::: tip 例 3 · 最小二乘拟合直线
**题目**：三个数据点 $(1,1)$、$(2,2)$、$(3,4)$ 不共线。用最小二乘求直线 $y=C+Dx$，使三个点到此直线的竖直距离平方和最小，并验算平方误差。

<FigBox title="最小二乘：把数据投影到列空间" kind="几何" note="三个点不共线，任何直线都无法同时穿过它们。最小二乘选的是让三条竖直虚线（残差）的平方和最小的那条：C=−2/3、D=3/2。">

<svg viewBox="0 0 320 220" role="img" aria-label="三个数据点与最小二乘拟合直线，竖直虚线表示残差">
<defs>
  <marker id="ls-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-2)">
  <line x1="40" y1="190" x2="300" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1" marker-end="url(#ls-arr)" />
  <line x1="40" y1="190" x2="40" y2="30" stroke="var(--vp-c-text-3)" stroke-width="1" marker-end="url(#ls-arr)" />
  <text x="292" y="208">x</text>
  <text x="24" y="34">y</text>
  <line x1="67" y1="188" x2="233" y2="62" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="236" y="60" fill="var(--vp-c-brand-1)">y = 1.5x − 2/3</text>
  <circle cx="95" cy="162" r="4.5" fill="var(--vp-c-brand-1)" />
  <circle cx="150" cy="134" r="4.5" fill="var(--vp-c-brand-1)" />
  <circle cx="205" cy="78" r="4.5" fill="var(--vp-c-brand-1)" />
  <line x1="95" y1="162" x2="95" y2="167" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-dasharray="4 3" />
  <line x1="150" y1="134" x2="150" y2="125" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-dasharray="4 3" />
  <line x1="205" y1="78" x2="205" y2="83" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-dasharray="4 3" />
  <text x="68" y="176" fill="var(--vp-c-text-2)">残差（竖直距离）</text>
</g>
</svg>

</FigBox>

**先想什么**：把三个点的方程写成矩阵形式，未知数是 $C,D$ 两个，方程有三个，多半无解——这正是最小二乘的主场。

**步骤**：
1. 列方程：$C+1D=1$，$C+2D=2$，$C+3D=4$，即 $A=\begin{pmatrix}1&1\\1&2\\1&3\end{pmatrix}$，$\mathbf b=\begin{pmatrix}1\\2\\4\end{pmatrix}$。*（为什么这样列：每一行对应一个数据点，第一列全是 1 来自常数项 C。）*
2. 写法方程 $A^T A\,\hat{\mathbf x}=A^T\mathbf b$：$A^T A=\begin{pmatrix}3&6\\6&14\end{pmatrix}$，$A^T\mathbf b=\begin{pmatrix}7\\17\end{pmatrix}$。*（为什么左乘 Aᵀ：误差要垂直于列空间，等价于 Aᵀe=0。）*
3. 解 $\begin{pmatrix}3&6\\6&14\end{pmatrix}\begin{pmatrix}C\\D\end{pmatrix}=\begin{pmatrix}7\\17\end{pmatrix}$：由第一式 $C=(7-6D)/3$ 代入第二式，得 $2(7-6D)+14D=17$，即 $2D=3$，故 $D=\dfrac32=1.5$，回代 $C=\dfrac{7-9}{3}=-\dfrac23\approx-0.667$。*（为什么这样代：2×2 手算最稳的是消元代入。）*
4. 拟合直线 $y=\dfrac32 x-\dfrac23$。

**验算**（用 node 复算过）：三个残差分别是 $1-\left(\tfrac32-\tfrac23\right)=\tfrac16$，$2-(3-\tfrac23)=-\tfrac13$，$4-\left(\tfrac92-\tfrac23\right)=\tfrac16$，平方和 $\left(\tfrac16\right)^2+\left(\tfrac13\right)^2+\left(\tfrac16\right)^2=\tfrac16\approx0.1667$。这是所有直线里能达到的最小平方误差，任何别的 $(C,D)$ 都会更大。
:::

## 九、易错清单（按踩坑频率排序）

1. **把投影算成「斜着照的影子」** → 得到的分量不是垂直投影，误差不垂直，最小二乘结果错 → 永远用 $\dfrac{\mathbf a\cdot\mathbf b}{\mathbf a\cdot\mathbf a}\mathbf a$，并拿 $\mathbf a\cdot\mathbf e=0$ 验一遍。
2. **Gram-Schmidt 只减了对最后一个向量的投影** → 后面的向量与前几个 $\mathbf q_j$ 不垂直，整组基报废 → 每一步对 $j=1$ 到 $k-1$ **全部**求和。
3. **忘了在每步之后归一** → 得到的基正交但不标准，点积坐标公式 $c_i=\mathbf q_i\cdot\mathbf x$ 里 $\mathbf q_i\cdot\mathbf q_i\neq1$ 会引入分母错误 → 每步除 $|\mathbf u_k|$。
4. **最小二乘直接解 $A^T A\mathbf x=A^T\mathbf b$ 却不检查 $A^T A$ 是否可逆** → 当 $A$ 列相关时 $A^T A$ 奇异，解不唯一或不存在 → 先确认 $A$ 列满秩；列相关时答案本来就不唯一。
5. **把「正定」只背成 $\mathbf x^T A\mathbf x>0$，不会用判据** → 遇到具体矩阵无从下手 → 记住三条等价判据：特征值全正、主元全正、顺序主子式全正，任选一条。
6. **二次型忘了把 $A$ 对称化** → 交叉项系数算错，特征值/主元判据失效 → 非对称时先换成 $\dfrac{A+A^T}{2}$。
7. **投影矩阵 $P=A(A^T A)^{-1}A^T$ 写成 $P=A^T A(A^T A)^{-1}$** → 得到的是单位矩阵 $I$，投影变成恒等 → 记住顺序：$A$ 在左、$(A^T A)^{-1}$ 在中间、$A^T$ 在右。

## 十、自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. 为什么「正交」能用一个点积判据 $\mathbf u\cdot\mathbf v=0$ 代替量角器？标准正交基下求坐标为什么不用解方程组？
2. 投影到直线、投影到平面的投影矩阵各是什么？为什么投影一定是「到子空间最近的点」？
3. $A\mathbf x=\mathbf b$ 无解时，法方程 $A^T A\hat{\mathbf x}=A^T\mathbf b$ 是怎么从「误差垂直列空间」推出来的？
4. 判断 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ 正定，你至少能说出两种理由；换 $\begin{pmatrix}1&0\\0&-1\end{pmatrix}$ 又是哪种形状？

## 下一步

到这里，本板块的七章主线走完了：从向量与张成、矩阵变换、消元与方程组、四大子空间、行列式、特征值，到这页的**正交与投影**——最后 SVD 把「旋转—拉伸—旋转」钉成一条总纲。回到本板块首页看一遍七章之间的依赖地图（入口页会把七章串起来），确认入口还能找到；复习时如果某章忘了，直接点回那一页的「结论先行」。

**这一页的指路**：七章至此全部读完。想再捡一遍整条主线，从左侧目录回到本板块首页；对特征值与对角化不熟的话，回 [06 · 特征值、特征向量与对角化](./06-eigenvalues.md) 复习——那里说清了对角化，而本页的正定判据与 SVD 都建立在对角化的地基上。
