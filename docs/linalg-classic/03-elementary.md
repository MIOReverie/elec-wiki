---
title: 03 · 矩阵的初等变换与线性方程组
description: 按同济《线性代数》第三章的顺序，把解方程组这件事拆成可操作的四步：三种初等行变换、化行阶梯形与行最简形、初等矩阵、矩阵的秩、有解判定与解的结构；给「化阶梯形求秩判解」的完整步骤，强调秩相等才有解、自由度等于 n 减 r。
---

# 03 · 矩阵的初等变换与线性方程组

<Meta time="35 min" level="核心" note="本章只有一件大事：把增广矩阵化成行阶梯形，数非零行得秩，再用秩和未知数个数比较来判定解。" />

**对应教材**：同济《线性代数》第三章「矩阵的初等变换与线性方程组」。

**这一页要解决什么**：前面两章给了你「行列式会算、矩阵会乘」的手艺，这一章把它们合起来做一件更实际的事——判断一个线性方程组**有没有解、有几个解、怎么把全部解写出来**。读完你应该能：对任意增广矩阵走完「化行阶梯形」的完整流程；数出矩阵的秩；用 $r(A)$ 与 $r(A\mid\mathbf b)$ 的大小关系判定唯一解、无穷多解还是无解；并在无穷多解时写出「特解 + 基础解系」形式的通解。

::: tip 读这页之前
- **需要会**：矩阵与增广矩阵的概念（经典版第 2 章《矩阵及其运算》）、$k$ 阶行列式的展开（经典版第 1 章《行列式》，秩的定义会借「子式」这个词）。这两章同板块尚未在页面中展开时可先看现代版对应概念。
- **符号约定**：矩阵用大写粗体 $A$，未知数列向量记 $\mathbf x$，常数项列向量记 $\mathbf b$；增广矩阵写作 $[A \mid \mathbf b]$ 或 $(A,\mathbf b)$。完整符号表见 [符号与约定](../guide/notation.md)。
- **本页术语**：增广矩阵、初等行变换、行阶梯形、行最简形、初等矩阵、矩阵的秩、基础解系，正文首次出现处都会解释。
- **学完去哪**：本页是经典版第 4 章《向量组的线性相关性》的入口——「秩」和「基础解系」会在那里换成向量组的语言再讲一遍。
:::

先把高中那套「加减消元」升级成能上机器、且永远不出错的流程。解方程组时，你反复做的其实只有三种动作：**换两行的顺序、把某一行整体乘一个非零数、把某一行的倍数加到另一行**。这三种动作有个共同点——都可逆，所以解集一个都不多、一个都不少。这一页的全部方法，就是把这三件小事按固定顺序做到底，再从结果里读出答案。

## 结论先行

1. **初等行变换只有三种，且都不改变解集**：交换两行、某行乘非零常数、某行加另一行的倍数——它们都可逆，所以等价。
2. **化行阶梯形的四步**：换（主元非零）→ 消（下方清零）→ 换到下一行下一列 → 重复。削完之后**非零行的行数就是矩阵的秩**。
3. **有解 ⇔ 秩相等**：$r(A)=r(A\mid\mathbf b)$ 才有解；一旦 $r(A)<r(A\mid\mathbf b)$，阶梯形里必出现 $0=k$（$k\neq0$），无解。
4. **解的自由度 = $n-r$**：$n$ 是未知数个数、$r$ 是秩。$r=n$ 唯一解；$r<n$ 无穷多解，其中 $n-r$ 个未知数可以自由取。
5. **通解 = 特解 + 基础解系**：无穷多解时，先求一个特解 $\eta^\*$，再求齐次方程 $A\mathbf x=\mathbf 0$ 的 $n-r$ 个线性无关解（基础解系），两者相加就是全部解。

## 一、初等行变换：只做三件事，解集不变

这一节的目标是把「加减消元」里的合法动作列成一张只有三项的清单，并说明为什么它们不会把解改坏——这是后面所有机械步骤的前提。

解方程组时，把系数和常数项并排写成一张表最方便。对 $A\mathbf x=\mathbf b$，把系数矩阵 $A$ 和常数项 $\mathbf b$ 拼成一张表，中间画一条竖线分开：

$$
[A \mid \mathbf b] = \left[\begin{array}{ccc|c}
a_{11}&a_{12}&\cdots&b_1\\
a_{21}&a_{22}&\cdots&b_2\\
\vdots&\vdots&\ddots&\vdots
\end{array}\right]
$$

这张表叫**增广矩阵（augmented matrix）**——「增广」就是「在系数矩阵旁边多贴一列常数项」。竖线左边是 $A$，右边是 $\mathbf b$，消元时必须对整行一起做，竖线右边的数也跟着变，解才不会错。

对增广矩阵只允许做三种**初等行变换（elementary row operations）**：

| 变换 | 记号 | 为什么解集不变 |
| --- | --- | --- |
| 交换两行 | $R_i\leftrightarrow R_j$ | 方程先后顺序不影响「同时成立」 |
| 某行乘非零数 $k$ | $R_i\leftarrow kR_i\ (k\neq0)$ | 等式两边同乘，可逆 |
| 某行加另一行的倍数 | $R_i\leftarrow R_i+kR_j$ | 等量替换，可逆 |

三种变换都**可逆**：换回去、除以 $k$、减掉 $kR_j$ 就能回到原样。既然每步可逆，方程组的解集在每一步前后完全一样，所以「化阶梯形」这个看似改动了矩阵的过程，其实一个解都没丢、也没多出来。对应的还有**初等列变换**（对列做同样的三件事），但解方程组时只用行变换，因为列变换会打乱未知数的对应关系；列变换主要用于求矩阵的秩。

把这三件小事按固定顺序做，就得到了下一节的行阶梯形——那是所有判定的「仪表盘」。

## 二、行阶梯形与行最简形

这一节的目标是定义两个「形状规范」的矩阵——行阶梯形与行最简形——并给出把它们变出来的四步流程，因为秩和解的判定全部从这两个形状读。

**行阶梯形（row echelon form）**：一个矩阵若满足两条，就是行阶梯形——（1）若存在零行（整行全 0），零行都在非零行的下方；（2）每个非零行从左往右的第一个非零元，其所在列随行数增加而严格右移。这个「第一个非零元」叫**主元（pivot）**，它们连起来正好是一级一级的阶梯，主元下方全是 0。

在行阶梯形基础上再收紧两条，得到**行最简形（reduced row echelon form）**：（3）每个主元都等于 1；（4）每个主元所在列的其余元素全为 0。行最简形比行阶梯形「削得更干净」，回代一步到位，是求基础解系时的首选。

<FigBox title="行阶梯形与行最简形：主元下方清零、再上方清零" kind="结构" note="左图是行阶梯形，主元 2、3、4 逐行右移，下方全是 0，阶梯线正是主元连成的折线；右图是行最简形，主元都变成 1，且主元列上方的元素也全被削成 0。看图能读出什么：两种形状的非零行数相同，都等于矩阵的秩——形状只在主元列是否「清到底」上有差别。">
<svg viewBox="0 0 460 200" role="img" aria-label="左图三行四列的行阶梯形矩阵，主元二三四逐行右移；右图行最简形，主元都为一且主元列其余为零">
  <defs>
    <marker id="fig-echelon-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <text x="100" y="22" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">行阶梯形</text>
  <text x="350" y="22" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">行最简形</text>
  <!-- 左：行阶梯形 -->
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="55" y="52">2</text><text x="95" y="52">1</text><text x="135" y="52">1</text><text x="175" y="52">5</text>
    <text x="55" y="86">0</text><text x="95" y="86">3</text><text x="135" y="86">−1</text><text x="175" y="86">2</text>
    <text x="55" y="120">0</text><text x="95" y="120">0</text><text x="135" y="120">4</text><text x="175" y="120">8</text>
  </g>
  <polyline points="42,46 82,46 82,80 122,80 122,114 162,114" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" stroke-dasharray="5 3"/>
  <circle cx="55" cy="46" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="95" cy="80" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="135" cy="114" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <!-- 右：行最简形 -->
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="305" y="52">1</text><text x="345" y="52">0</text><text x="385" y="52">0</text><text x="425" y="52">a</text>
    <text x="305" y="86">0</text><text x="345" y="86">1</text><text x="385" y="86">0</text><text x="425" y="86">b</text>
    <text x="305" y="120">0</text><text x="345" y="120">0</text><text x="385" y="120">1</text><text x="425" y="120">c</text>
  </g>
  <circle cx="305" cy="46" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="345" cy="80" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="385" cy="114" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <line x1="185" y1="84" x2="295" y2="84" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#fig-echelon-arrow)"/>
  <text x="240" y="74" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle">主元变 1、上方清零</text>
  <text x="240" y="152" font-size="12" fill="var(--vp-c-text-3)" text-anchor="middle">两种形状非零行数相同，都等于秩</text>
</svg>
</FigBox>

**化行阶梯形的四步**（手算就按这个走）：

1. **定位**：从第 1 行第 1 列开始，看当前列从当前行往下有没有非零元；全为 0 就右移一列再看。
2. **换**：找到非零元后，把含它的那一行换到当前行（主元尽量选 1 或绝对值小的数，方便后面口算）。
3. **消**：用主元把当前列下方所有行削成 0——对下方第 $i$ 行做 $R_i \leftarrow R_i - \dfrac{a_{i,\text{主元列}}}{a_{\text{主元行},\text{主元列}}}R_{\text{主元行}}$。
4. **前进**：当前行下移一行、当前列右移一列，回到第 1 步，直到没有行或列可处理。

这套流程纯机械，不靠灵感。它能走通，靠的是每一步都可逆——而「可逆」这件事，可以写成矩阵乘法，这正是下一节初等矩阵要说的。

## 三、初等矩阵：初等行变换 = 左乘一个初等矩阵

这一节的目标是给「初等变换」一个代数身份——它等价于乘一个特殊矩阵——顺便拿到下一节最关键的一条定理：初等变换不改变矩阵的秩。

**初等矩阵（elementary matrix）**：单位矩阵 $I$ 经过**一次**初等变换得到的矩阵。三种初等变换对应三种初等矩阵。例如对 $3\times3$ 单位阵交换前两行，得到

$$
E = \begin{bmatrix}0&1&0\\1&0&0\\0&0&1\end{bmatrix}
$$

关键的对应关系是：**对 $A$ 做一次初等行变换，等于左乘相应的初等矩阵 $EA$；做一次初等列变换，等于右乘 $AE$**。比如「把第 1 行的 2 倍加到第 2 行」对应的初等矩阵是在单位阵第 $(2,1)$ 位置填 2：

$$
E_{21}(2)=\begin{bmatrix}1&0&0\\2&1&0\\0&0&1\end{bmatrix},
\qquad E_{21}(2)A \ \text{正是把 $A$ 的第 2 行加上第 1 行的 2 倍}
$$

初等矩阵有两个直接后果：**初等矩阵都可逆**（三种变换都能「撤销」，逆矩阵还是同类初等矩阵）；于是**初等变换不改变矩阵的秩**——因为左乘可逆矩阵相当于做可逆变换，秩这个量在可逆变换下不变。这句「不改变秩」是整个消元法求秩的合法性来源，下一节就把它用起来。

## 四、矩阵的秩：化阶梯形，数非零行

这一节的目标是给「秩」下一个能算的定义，并确定求法：不用算一堆行列式，直接化行阶梯形、数非零行。

先从定义说起。在 $m\times n$ 矩阵 $A$ 中，任取 $k$ 行和 $k$ 列，交叉处的 $k^2$ 个元素按原来相对位置组成的 $k$ 阶行列式，叫 $A$ 的一个 **$k$ 阶子式（minor）**。$A$ 中非零子式的**最高阶数**，就是**矩阵的秩（rank）**，记作 $r(A)$ 或 $\operatorname{rank}(A)$。零矩阵没有非零子式，规定它的秩为 0。

子式定义便于理解「秩是矩阵里线性无关信息的条数」，但直接算太慢。好在有上一节的定理：**初等变换不改变矩阵的秩**。所以求秩的实用方法是——**把 $A$ 用初等行变换化成行阶梯形，非零行的行数就是秩**。行阶梯形里主元逐行右移，每个非零行贡献一个主元，主元个数 = 非零行数，正好等于非零子式的最高阶数。

**求秩的完整步骤**（就四步，和化阶梯形一模一样）：

1. 对 $A$ 做初等行变换化成行阶梯形（换 → 消 → 前进，见第二节）；
2. 数非零行的行数；
3. 这个数就是 $r(A)$。

秩的基本范围是 $0 \le r(A) \le \min(m,n)$；当 $r(A)=\min(m,n)$ 时称 $A$ **满秩**。$n$ 阶方阵满秩 $\iff$ 它的行列式不为 0 $\iff$ 可逆，这几件事在经典版第 2 章讲逆矩阵时已经埋下伏笔。秩算出来了，下一步就看它怎么决定方程组的解。

## 五、线性方程组有解判定：秩相等才有解

这一节的目标是把「有没有解、有几个解」翻译成两个秩的比较，并给出从增广矩阵直达结论的判定流程。

对 $n$ 个未知数的方程组 $A\mathbf x=\mathbf b$（$A$ 是 $m\times n$ 矩阵），有解判定定理只有一句：

$$
A\mathbf x=\mathbf b \ \text{有解} \iff r(A) = r(A\mid\mathbf b)
$$

即**系数矩阵的秩等于增广矩阵的秩，才有解**。道理在阶梯形里一眼可见：若 $r(A)<r(A\mid\mathbf b)$，说明增广矩阵比系数矩阵多出一个非零行，那行形如 $0=k$（$k\neq0$），自相矛盾，无解。若两秩相等，设都等于 $r$，再与未知数个数 $n$ 比较：

| 条件 | 结论 | 几何/直观说法 |
| --- | --- | --- |
| $r(A)<r(A\mid\mathbf b)$ | 无解 | 出现 $0=k$，方程打架 |
| $r(A)=r(A\mid\mathbf b)=n$ | 唯一解 | 每个未知数都被主元钉死 |
| $r(A)=r(A\mid\mathbf b)=r<n$ | 无穷多解 | 有 $n-r$ 个未知数可以自由取 |

**判定流程（照做即可）**：

1. 写出增广矩阵 $[A\mid\mathbf b]$；
2. 用初等行变换化成行阶梯形；
3. 分别数系数矩阵部分的非零行（得 $r(A)$）和整个增广矩阵的非零行（得 $r(A\mid\mathbf b)$）；
4. 两秩不相等 → 无解；相等且等于 $n$ → 唯一解；相等且小于 $n$ → 无穷多解，**自由度 = $n-r$**。

把「自由度 = $n-r$」记成口诀：**未知数有 $n$ 个，只有 $r$ 个被主元管住，剩下 $n-r$ 个没人管，爱取什么取什么**。唯一解时 $r=n$、自由度为 0，无穷多解时 $r<n$、自由度为 $n-r$。判定清楚了，最后一节解决「无穷多解到底怎么写全」。

## 六、解的结构：通解 = 特解 + 基础解系

这一节的目标是学会把无穷多解**一次性写完整**——方法就一条：先求一个特解，再求齐次方程的基础解系，两者相加。

先分两类。**齐次方程组** $A\mathbf x=\mathbf 0$ 永远有解（至少零解 $\mathbf x=\mathbf 0$）；它的全部解组成一个「解空间」，这个空间的基就是**基础解系（fundamental system of solutions）**——一组个数最多、且线性无关的解向量。**非齐次方程组** $A\mathbf x=\mathbf b$ 的通解，等于它自己的**一个特解**，加上导出组（也就是把 $\mathbf b$ 换成 $\mathbf 0$ 的齐次方程）基础解系的任意线性组合：

$$
\mathbf x = \eta^\* + c_1\xi_1 + c_2\xi_2 + \cdots + c_{n-r}\xi_{n-r}
$$

其中 $\eta^\*$ 是特解，$\xi_1,\dots,\xi_{n-r}$ 是基础解系，$c_i$ 是任意常数。为什么是加？因为非齐次解减特解后正好满足齐次方程，所以「所有非齐次解 = 特解 + 所有齐次解」。

**求基础解系的完整步骤**（含 $n-r$ 个解向量）：

1. 把系数矩阵 $A$ 化成**行最简形**；
2. 标出主元列（对应**主变量**）与非主元列（对应**自由变量**），自由变量有 $n-r$ 个；
3. 让自由变量依次取 $\begin{bmatrix}1\\0\\ \vdots\\0\end{bmatrix},\begin{bmatrix}0\\1\\ \vdots\\0\end{bmatrix},\dots$ 这组单位值，每取一组，回代解出主变量的值；
4. 每次得到的一个解向量就是一个 $\xi_i$，共 $n-r$ 个，它们线性无关，构成基础解系。

步骤 3 里「自由变量轮流取 1、其余取 0」能保证解出来的向量自动线性无关，这是最省事的取法。到这里，理论闭环，下面三道例题把数字坐实。

## 典型例题（数字均经 node 验算）

::: tip 例 1 · 化行阶梯形求矩阵的秩 {#ex-elem-1}
**题目**：求矩阵 $A=\begin{bmatrix}1&2&0&1\\2&4&1&0\\3&6&1&1\end{bmatrix}$ 的秩。

<FigBox title="例 1：三行四列矩阵化阶梯形，数非零行得秩" kind="结构" note="从左到右依次是原矩阵 A、消第 1 列、行阶梯形。主元用红圈标出：第 1 列的 1 和第 3 列的 1，共两个主元，最后一整行被削成 0。看图能读出什么：非零行只有两行，所以秩等于 2。">
<svg viewBox="0 0 500 190" role="img" aria-label="三行四列矩阵从原矩阵经消第一列到行阶梯形，两个主元用红圈标出，末行全零">
  <defs>
    <marker id="ex1-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <text x="100" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">A（原矩阵）</text>
  <text x="260" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">消第 1 列</text>
  <text x="410" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">行阶梯形</text>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="52" y="50">1</text><text x="90" y="50">2</text><text x="128" y="50">0</text><text x="166" y="50">1</text>
    <text x="52" y="84">2</text><text x="90" y="84">4</text><text x="128" y="84">1</text><text x="166" y="84">0</text>
    <text x="52" y="118">3</text><text x="90" y="118">6</text><text x="128" y="118">1</text><text x="166" y="118">1</text>
  </g>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="212" y="50">1</text><text x="250" y="50">2</text><text x="288" y="50">0</text><text x="326" y="50">1</text>
    <text x="212" y="84">0</text><text x="250" y="84">0</text><text x="288" y="84">1</text><text x="326" y="84">−2</text>
    <text x="212" y="118">0</text><text x="250" y="118">0</text><text x="288" y="118">1</text><text x="326" y="118">−2</text>
  </g>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="360" y="50">1</text><text x="398" y="50">2</text><text x="436" y="50">0</text><text x="474" y="50">1</text>
    <text x="360" y="84">0</text><text x="398" y="84">0</text><text x="436" y="84">1</text><text x="474" y="84">−2</text>
    <text x="360" y="118">0</text><text x="398" y="118">0</text><text x="436" y="118">0</text><text x="474" y="118">0</text>
  </g>
  <circle cx="52" cy="44" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="212" cy="44" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="288" cy="78" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="360" cy="44" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="436" cy="78" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <line x1="176" y1="84" x2="204" y2="84" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#ex1-arrow)"/>
  <line x1="336" y1="84" x2="352" y2="84" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#ex1-arrow)"/>
  <text x="190" y="74" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₂−2R₁, R₃−3R₁</text>
  <text x="344" y="74" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₃−R₂</text>
  <text x="250" y="150" font-size="12" fill="var(--vp-c-text-3)" text-anchor="middle">两个主元 → 非零行 2 行 → 秩 r(A)=2</text>
</svg>
</FigBox>

**先想什么**：不用算任何行列式，直接做初等行变换化成阶梯形，数非零行。

**步骤**：
1. 主元 $a_{11}=1$，做 $R_2\leftarrow R_2-2R_1$、$R_3\leftarrow R_3-3R_1$：第二、三行第 1 列变成 0；
2. 第 2 列从第 2 行往下全为 0，右移到第 3 列，主元 $a_{23}=1$，做 $R_3\leftarrow R_3-R_2$：第三行第 3 列变成 0；
3. 得到行阶梯形，非零行有 2 行，所以 $r(A)=2$。

**为什么**：初等变换不改变秩，而阶梯形里每个主元独占一行，非零行数直接等于秩。

**验算**：`rank([[1,2,0,1],[2,4,1,0],[3,6,1,1]]) = 2` ✓（node 验算）。另外按子式定义也能复核：存在一个 2 阶非零子式 $\begin{vmatrix}1&0\\2&1\end{vmatrix}=1\neq0$，而所有 3 阶子式都含两行成比例的行，全为 0，故最高非零子式是 2 阶，秩确为 2。
:::

::: tip 例 2 · 判定唯一解并求解 {#ex-elem-2}
**题目**：判定方程组 $\begin{cases}x+y+z=6\\x-y+z=2\\x+y-z=0\end{cases}$ 的解，并求出唯一解。

<FigBox title="例 2：增广矩阵化阶梯形，三个主元判唯一解" kind="结构" note="左是增广矩阵，右是两步行变换后的阶梯形。竖线右边是常数项，消元时一起变。三个主元分别在 1、−2、−2 三个位置，铺满三列。看图能读出什么：三个未知数都被主元管住，r(A)=r(A|b)=3=n，唯一解。">
<svg viewBox="0 0 400 190" role="img" aria-label="三行四列增广矩阵经消元得到三个主元的阶梯形，判定唯一解">
  <defs>
    <marker id="ex2-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <text x="104" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">增广矩阵</text>
  <text x="296" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">阶梯形</text>
  <line x1="150" y1="40" x2="150" y2="126" stroke="var(--vp-c-divider)" stroke-width="1.4"/>
  <line x1="332" y1="40" x2="332" y2="126" stroke="var(--vp-c-divider)" stroke-width="1.4"/>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="48" y="50">1</text><text x="84" y="50">1</text><text x="120" y="50">1</text><text x="176" y="50">6</text>
    <text x="48" y="84">1</text><text x="84" y="84">−1</text><text x="120" y="84">1</text><text x="176" y="84">2</text>
    <text x="48" y="118">1</text><text x="84" y="118">1</text><text x="120" y="118">−1</text><text x="176" y="118">0</text>
  </g>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="232" y="50">1</text><text x="268" y="50">1</text><text x="304" y="50">1</text><text x="360" y="50">6</text>
    <text x="232" y="84">0</text><text x="268" y="84">−2</text><text x="304" y="84">0</text><text x="360" y="84">−4</text>
    <text x="232" y="118">0</text><text x="268" y="118">0</text><text x="304" y="118">−2</text><text x="360" y="118">−6</text>
  </g>
  <circle cx="48" cy="44" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="84" cy="78" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="120" cy="112" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="232" cy="44" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="268" cy="78" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="304" cy="112" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <line x1="196" y1="84" x2="224" y2="84" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#ex2-arrow)"/>
  <text x="210" y="74" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₂−R₁, R₃−R₁</text>
  <text x="200" y="150" font-size="12" fill="var(--vp-c-text-3)" text-anchor="middle">三个主元 → r(A)=r(A|b)=3=n → 唯一解</text>
</svg>
</FigBox>

**先想什么**：先消元看秩，不急着回代；确认两秩相等且都等于 3，再回代。

**步骤**：
1. 增广矩阵 $\left[\begin{array}{ccc|c}1&1&1&6\\1&-1&1&2\\1&1&-1&0\end{array}\right]$，做 $R_2\leftarrow R_2-R_1$、$R_3\leftarrow R_3-R_1$，得 $\left[\begin{array}{ccc|c}1&1&1&6\\0&-2&0&-4\\0&0&-2&-6\end{array}\right]$；
2. 三个主元，$r(A)=r(A\mid\mathbf b)=3=n$，唯一解；
3. 回代：由 $-2z=-6$ 得 $z=3$，由 $-2y=-4$ 得 $y=2$，再由 $x+y+z=6$ 得 $x=1$。

**为什么**：两秩相等且等于未知数个数，说明每个未知数都被一个主元唯一确定，回代每步只剩一个未知数。

**验算**：`[1,2,3]` 代回三式：$1+2+3=6$、$1-2+3=2$、$1+2-3=0$，全成立（node 验算：$A\cdot[1,2,3]=[6,2,0]$）。
:::

::: tip 例 3 · 无穷多解：通解 = 特解 + 基础解系 {#ex-elem-3}
**题目**：求方程组 $\begin{cases}x_1+2x_2+x_3+x_4=1\\2x_1+4x_2+2x_3+3x_4=5\\3x_1+6x_2+3x_3+4x_4=6\end{cases}$ 的全部解。

<FigBox title="例 3：四未知数方程组化阶梯形，两主元判无穷多解" kind="结构" note="左是四未知数的增广矩阵，右是阶梯形：第 1、4 列是主元列（红圈），第 2、3 列是自由列（浅色带），末行被削成 0=0。看图能读出什么：主元 2 个、未知数 4 个，r(A)=r(A|b)=2&lt;4，无穷多解，自由度 4−2=2。">
<svg viewBox="0 0 460 190" role="img" aria-label="四未知数增广矩阵经消元得两个主元的阶梯形，末行全零，判定无穷多解">
  <defs>
    <marker id="ex3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <text x="104" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">增广矩阵</text>
  <text x="300" y="22" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">阶梯形</text>
  <line x1="150" y1="40" x2="150" y2="126" stroke="var(--vp-c-divider)" stroke-width="1.4"/>
  <line x1="344" y1="40" x2="344" y2="126" stroke="var(--vp-c-divider)" stroke-width="1.4"/>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="30" y="50">1</text><text x="62" y="50">2</text><text x="94" y="50">1</text><text x="126" y="50">1</text><text x="176" y="50">1</text>
    <text x="30" y="84">2</text><text x="62" y="84">4</text><text x="94" y="84">2</text><text x="126" y="84">3</text><text x="176" y="84">5</text>
    <text x="30" y="118">3</text><text x="62" y="118">6</text><text x="94" y="118">3</text><text x="126" y="118">4</text><text x="176" y="118">6</text>
  </g>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="224" y="50">1</text><text x="256" y="50">2</text><text x="288" y="50">1</text><text x="320" y="50">1</text><text x="370" y="50">1</text>
    <text x="224" y="84">0</text><text x="256" y="84">0</text><text x="288" y="84">0</text><text x="320" y="84">1</text><text x="370" y="84">3</text>
    <text x="224" y="118">0</text><text x="256" y="118">0</text><text x="288" y="118">0</text><text x="320" y="118">0</text><text x="370" y="118">0</text>
  </g>
  <rect x="246" y="40" width="56" height="86" fill="var(--vp-c-brand-1)" opacity="0.07"/>
  <text x="274" y="35" font-size="10.5" fill="var(--vp-c-brand-2)">自由列</text>
  <circle cx="224" cy="44" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <circle cx="320" cy="78" r="13" fill="none" stroke="#e5484d" stroke-width="1.6"/>
  <line x1="188" y1="84" x2="216" y2="84" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#ex3-arrow)"/>
  <text x="202" y="74" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₂−2R₁, R₃−3R₁, R₃−R₂</text>
  <text x="230" y="150" font-size="12" fill="var(--vp-c-text-3)" text-anchor="middle">两个主元 → r(A)=r(A|b)=2&lt;4 → 无穷多解，自由度 2</text>
</svg>
</FigBox>

**先想什么**：看到第 2、3 行是第 1 行的倍数，猜秩只有 2；消元验证后，自由变量取单位值回代求基础解系。

**步骤**：
1. 增广矩阵做 $R_2\leftarrow R_2-2R_1$、$R_3\leftarrow R_3-3R_1$，再 $R_3\leftarrow R_3-R_2$，得阶梯形 $\left[\begin{array}{cccc|c}1&2&1&1&1\\0&0&0&1&3\\0&0&0&0&0\end{array}\right]$；
2. 两秩相等且等于 2，$n=4$，无穷多解，自由度 $n-r=2$；主变量是 $x_1,x_4$，自由变量是 $x_2,x_3$；
3. 回代：$x_4=3$，$x_1+2x_2+x_3+x_4=1\Rightarrow x_1=-2-2x_2-x_3$；
4. 令 $x_2=c_1,\ x_3=c_2$，通解 $\mathbf x=\begin{bmatrix}-2-2c_1-c_2\\c_1\\c_2\\3\end{bmatrix}=\begin{bmatrix}-2\\0\\0\\3\end{bmatrix}+c_1\begin{bmatrix}-2\\1\\0\\0\end{bmatrix}+c_2\begin{bmatrix}-1\\0\\1\\0\end{bmatrix}$。

**为什么**：特解取自由变量为 0 得 $\eta^\*=(-2,0,0,3)$；基础解系让自由变量 $(x_2,x_3)$ 轮流取 $(1,0)$ 和 $(0,1)$，回代得 $\xi_1=(-2,1,0,0)$、$\xi_2=(-1,0,1,0)$，两者线性无关，正好 $n-r=2$ 个。

**验算**：`rank(A)=2`、`rank([A|b])=2`；`A·特解=[1,5,6]`；`A·ξ1=[0,0,0]`、`A·ξ2=[0,0,0]`，全部成立（node 验算）。代回原方程组也逐一吻合。
:::

## 易错清单 + 自检

- **只消系数矩阵、忘了常数项**：初等行变换必须对增广矩阵整行一起做，竖线右边的 $\mathbf b$ 也要跟着变，否则秩算对了、解算错了。
- **主元为 0 却不换行**：当前列主元恰好是 0 时，先和下方某行交换换出非零主元，不能硬除；交换行也是合法初等行变换。
- **把「无解」和「无穷多解」混为一谈**：$0=k$（$k\neq0$）是无解、$0=0$ 是无穷多解，判据是**两秩是否相等**，不是「有没有 0 行」。
- **自由度算错**：自由度是 $n-r$，其中 $n$ 是**未知数个数**（增广矩阵列数减 1），不是方程个数、不是行数。
- **基础解系个数不对**：齐次方程 $A\mathbf x=\mathbf 0$ 的基础解系含 $n-r$ 个解向量；漏一个自由变量取单位值，就会少一个、写不全通解。
- **回代顺序颠倒**：阶梯形必须从最后一行往上代；行最简形则可以每行直接读出一个变量。

**自检**：任取 $\begin{cases}x+y+z=1\\x+y+z=2\end{cases}$，问自己——$r(A)$ 与 $r(A\mid\mathbf b)$ 各是多少、有无解？再取 $\begin{cases}x+y+z=1\\x+y+z=1\end{cases}$，$r$、$n$、自由度各是多少？两个都能用「化阶梯形、比秩」答出来，这一页就是你的了。

## 接下来

这一章你掌握了「消元求秩、比秩判解」这套标准动作，它和现代版是同一件事的两种讲法：想从几何上看「$0=k$ 为什么是两条平行直线、$n-r$ 个自由变量为什么张成解空间」，顺着读现代版第 3 章 [高斯消元与线性方程组](../linalg/03-elimination) 和第 4 章 [向量空间与四大子空间](../linalg/04-subspaces)。下一章经典版第 4 章《向量组的线性相关性》会把「秩」和「基础解系」换成向量组的语言重新讲一遍，建议紧接着读。
