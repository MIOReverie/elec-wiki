---
title: 01 · 行列式：从对角线到克拉默法则
description: 经典结构版行列式一章，对齐同济《线性代数》第一章：二阶三阶对角线法则、n 阶行列式的逆序数定义、行列式六条性质、按行（列）展开与代数余子式、三角行列式、克拉默法则，附「先化简再展开」的计算步骤与 node 验算例题。
---

# 01 · 行列式：从对角线到克拉默法则

<Meta time="60 min" level="核心" note="算行列式先看能不能用性质化简：换行提公因子、倍加化零、化三角再乘对角线；最容易错的是换行忘了变号和代数余子式的符号" />

**对应教材第一章**：本章对齐同济《线性代数》第一章「行列式」，覆盖教材里的二阶/三阶、n 阶定义、性质、按行（列）展开与克拉默法则几节。跟着教材进度走时，看到哪一节就翻到本页对应的小节。

**这一页要解决什么**：学会三件事——① 把二阶、三阶行列式用对角线法则直接算出来；② 用行列式的性质把任意阶行列式「先化简、再计算」，化到三角就乘对角线；③ 用克拉默法则解「系数行列式不为零」的线性方程组。读完你应该能独立算出一道 4 阶行列式，并说清每一步为什么可以这么做。

::: tip 读这页之前
- **需要会**：中学的二元、三元一次方程组加减消元；会用矩阵写法 $A\mathbf x=\mathbf b$ 表示方程组；知道转置 $A^T$ 是「行列互换」（本版第二章会系统讲，这里只需会看符号）。
- **这一页用到的符号**：$A$（方阵）、$|A|$ 与 $\det A$（都表示行列式）、$M_{ij}$（余子式）、$A_{ij}$（代数余子式）、$D$（系数行列式）。约定见[符号与约定](../guide/notation.md)。
- **一个提醒**：本版只讲「怎么算」。想懂行列式的几何意义（面积/体积缩放、负号=翻转），翻现代版[05 · 行列式：面积缩放的因子](../linalg/05-determinant.md)，那一页把「为什么」讲透了。
:::

## 结论先行

1. 二阶行列式 = 主对角线乘积 − 副对角线乘积；三阶用对角线法则（三条实线乘积之和 − 三条虚线乘积之和），**四阶及以上没有对角线法则**。
2. 行列式是「由方阵算出的一个数」：转置不变、换行变号、某行乘 $k$ 则行列式乘 $k$、两行成比例则为 $0$。
3. 算行列式的第一反应永远是**先用性质化简**：提公因子、倍加化零、化成上三角，再乘对角线——比展开快得多。
4. 按行（列）展开：任取一行（列），每个元素乘它的代数余子式再求和；代数余子式自带符号棋盘 $(-1)^{i+j}$，左上角为正。
5. 克拉默法则只在**系数行列式 $D\neq0$** 时给出唯一解 $x_j=\dfrac{D_j}{D}$；$D=0$ 时法则失效，要回消元去判定解的情况。

## 一、二阶与三阶：对角线法则

这一节的目标是给你一个能直接上手算的工具——二阶、三阶行列式的对角线法则，同时把「行列式」这个术语第一次讲清楚。

由 $n\times n$ 个数（元素）排成的方阵，按固定规则算出来的**一个数**，叫这个方阵的**行列式**，记作 $|A|$ 或 $\det A$。它只对方阵（行数等于列数）有意义，结果是数、不是矩阵；这个数可正可负可为 $0$。

二阶行列式的值就是「主对角线乘积减副对角线乘积」：

$$
\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}=a_{11}a_{22}-a_{12}a_{21}
$$

三阶行列式用**对角线法则**（也叫萨鲁斯法则）：把矩阵右边再抄一列，三条「平行于主对角线」的实线各乘一条，三条「平行于副对角线」的虚线各乘一条，实线之和减虚线之和：

$$
\begin{vmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{vmatrix}
=a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}-a_{13}a_{22}a_{31}-a_{11}a_{23}a_{32}-a_{12}a_{21}a_{33}
$$

例如 $\begin{vmatrix}1&2\\3&4\end{vmatrix}=1\times4-2\times3=-2$。记住这条边界：对角线法则**只对二阶、三阶成立**，四阶及以上按对角线画线会漏掉大量项。

为什么二阶三阶能画对角线、更高阶不行？因为 $n$ 阶展开式一共有 $n!$ 项，$2!=2$、$3!=6$，正好是两条、六条对角线；而 $4!=24$，四条对角线远不够。这条「项数」的线索，正是下一节 n 阶定义要正面回答的。

## 二、n 阶行列式：逆序数与展开式

这一节的目标是把行列式从二阶、三阶推广到任意 $n$ 阶，并讲清展开式里每一项的正负号来自哪里——答案就是「逆序数」。

把 $1,2,\dots,n$ 排成一种顺序叫一个排列；在一个排列里，一个较大的数排在较小数前面，就构成一个**逆序**；一个排列中逆序的总数叫它的**逆序数**，记作 $\tau$。例如排列 $3,1,2$：$3$ 在 $1$ 前、$3$ 在 $2$ 前，共 $2$ 个逆序，$\tau(3,1,2)=2$。逆序数为奇数的排列叫奇排列，为偶数的叫偶排列。

$n$ 阶行列式定义为对所有 $n!$ 个排列求和：

$$
D=\det(a_{ij})=\sum_{p_1p_2\cdots p_n}(-1)^{\tau(p_1p_2\cdots p_n)}\,a_{1p_1}a_{2p_2}\cdots a_{np_n}
$$

每项是「不同行、不同列各取一个元素」的乘积，共 $n!$ 项，正负各半；正负号由列下标排列的逆序数奇偶决定。把这句话记成口诀：**每行每列只取一个，乘起来；符号看列下标排列的奇偶性**。

这个定义是 n 阶行列式的「宪法」，考试里几乎不直接用它算题（$n!$ 项太慢），它主要用来证明性质、推导展开定理。算题真正靠的是下一节的性质。

## 三、行列式的性质：化简的六件工具

这一节的目标是列出化简行列式最常用的七条性质——它们是「先化简、再计算」的全部依据，也是后面展开定理和克拉默法则的基石。

1. **转置不变**：$|A^T|=|A|$。行列互换值不变，所以「行」成立的性质，对「列」同样成立。
2. **换行变号**：互换两行（列），行列式变号（乘 $-1$）。
3. **两行（列）相同**：行列式为 $0$（这是性质 2 的直接推论，常单列一条）。
4. **倍乘**：某一行（列）的所有元素都乘 $k$，等于整个行列式乘 $k$。推论：某行（列）全为 $0$ 则行列式为 $0$；整个方阵每行都乘 $k$，则 $|kA|=k^n|A|$。
5. **两行（列）成比例**：行列式为 $0$。
6. **拆项**：某一行（列）的元素是两组数之和，可拆成两个行列式之和。注意这只对「某一行」线性，**不能**推广成 $|A+B|=|A|+|B|$。
7. **倍加不变**：把某一行（列）的 $k$ 倍加到另一行（列），行列式不变。这是化简里最常用的一条，能主动「造 0」。

其中性质 7（倍加造 0）配合性质 1（转置让行与列等价），让「按行展开」和「按列展开」完全对称——这正是下一节展开定理的底气。

## 四、按行（列）展开与代数余子式

这一节的目标是学会「降阶」：把一个 $n$ 阶行列式按某一行（列）展开成若干个 $n-1$ 阶行列式之和，这是手算四阶以上行列式的主力方法。

划掉 $a_{ij}$ 所在的行和列，剩下的 $n-1$ 阶行列式叫 $a_{ij}$ 的**余子式**，记作 $M_{ij}$。再乘一个符号，得到**代数余子式**：

$$
A_{ij}=(-1)^{i+j}M_{ij}
$$

符号由位置决定，呈棋盘状：左上角 $a_{11}$ 处为正，相邻位置交替变号（$+,-,+,-,\dots$）。

**展开定理**：$n$ 阶行列式等于它任意一行（列）的各元素与其对应代数余子式乘积之和。按第 $i$ 行展开：

$$
D=\sum_{j=1}^{n}a_{ij}A_{ij}=a_{i1}A_{i1}+a_{i2}A_{i2}+\cdots+a_{in}A_{in}
$$

按第 $j$ 列展开同理。口诀：**按哪行（列）展开，就取哪行（列）的元素逐个乘它的代数余子式再求和**；选 $0$ 最多的行（列）展开最省事。另一个常考推论：某行元素与**另一行**的代数余子式相乘再求和等于 $0$。

展开能把 4 阶降到 3 阶、3 阶降到 2 阶，但更快的路是先用性质把某行（列）化到只剩一个非零元素再展开。这条「先化简」的思路，先看下一节最漂亮的一个直接结论——三角行列式。

## 五、三角行列式：直接乘对角线

这一节的目标是给出最省事的一类行列式的公式——三角行列式（含对角行列式）直接乘对角线。

上三角（主对角线以下全 $0$）、下三角（主对角线以上全 $0$）、对角（只有对角线非 $0$）行列式，都等于对角线元素的乘积：

$$
|A|=\prod_{i=1}^{n}a_{ii}=a_{11}a_{22}\cdots a_{nn}
$$

为什么成立：反复沿第一列（或第一行）展开，每次只留下第一个元素乘它的余子式，余子式仍是三角，一直降到二阶，就只剩对角线连乘。

于是「算行列式」的最短路径浮出水面：用性质把矩阵化成上三角。而另一个「用行列式直接给答案」的场景是解方程组——下一节的克拉默法则。

## 六、克拉默法则：系数行列式不为零才有唯一解

这一节的目标是学会用行列式直接写出线性方程组的解——克拉默法则，并死死记住它的前提：系数行列式不为零才有唯一解。

对 $n$ 个未知数、$n$ 个方程的线性方程组 $A\mathbf x=\mathbf b$，若系数行列式 $D=|A|\neq0$，则方程组有**唯一解**，这就是**克拉默法则**：

$$
x_j=\frac{D_j}{D}\quad(j=1,2,\dots,n)
$$

其中 $D_j$ 是把 $D$ 的第 $j$ 列换成常数项 $\mathbf b$ 得到的行列式。一句话记忆：**用常数项替换哪一列，解出来的就是哪个未知数**。

前提必须强调：$D\neq0$ 才有唯一解；$D=0$ 时克拉默法则失效，方程组可能无解也可能无穷多解，要改用消元判定（本版第三章专门讲）。所以算题第一步永远是先算 $D$——下一节把这套流程收拢成标准步骤。

## 七、算行列式的标准步骤

这一节的目标是把前面所有工具收拢成一套可以照做的流程，核心只有一句：**先看能否用性质化简**。

1. **先观察**：有没有两行（列）相同或成比例？有，直接写 $0$，一秒收工。
2. **再提公因子**：某行（列）有公因数 $k$，先提出来，数字变小、符号变简单。
3. **倍加化零**：选一个 $1$（或小整数）当「支点」，用性质 7 把它所在列（行）的其他位置化成 $0$。
4. **化三角或展开**：化到上三角就乘对角线；否则沿 $0$ 最多的行（列）展开降阶。
5. **记录符号**：每交换一次两行就乘一个 $-1$；代数余子式自带 $(-1)^{i+j}$，两者都别漏。
6. **验算**：换一种方法（比如直接展开一阶）核对结果，或对三角行列式只核对角线符号。

流程记熟，剩下的就是练。下面三道例题分别对应三条主线：性质化三角、按行展开、克拉默法则。

## 例题：三道吃透行列式

### 例 1 · 用性质化三角算三阶行列式

::: tip 例 1 · 用性质化三角
计算 $D=\begin{vmatrix}1&2&3\\2&5&2\\1&3&4\end{vmatrix}$。

**先想什么**：不急着套对角线法则，先看能不能用性质把下三角削成 $0$，化到上三角直接乘对角线。

**步骤**（$R_i$ 表示第 $i$ 行，记号「$R_2-2R_1$」读作「第 2 行减去第 1 行的 2 倍」）：

$$
\begin{vmatrix}1&2&3\\2&5&2\\1&3&4\end{vmatrix}
\xrightarrow{R_2-2R_1,\ R_3-R_1}
\begin{vmatrix}1&2&3\\0&1&-4\\0&1&1\end{vmatrix}
\xrightarrow{R_3-R_2}
\begin{vmatrix}1&2&3\\0&1&-4\\0&0&5\end{vmatrix}=1\times1\times5=5
$$

**为什么**：两步都是「倍加不变」（性质 7），所以行列式的值始终没变；最后得到上三角，按对角线相乘得 $5$。

<FigBox title="行阶梯示意：两次倍加，把三阶化成上三角" kind="步骤" note="从左到右：先 R2−2R1、R3−R1 把第 1 列下方清成 0，再 R3−R2 把第 2 列下方清成 0，得到上三角；每一步都只做倍加（性质 7），行列式不变，最后乘对角线 1×1×5。" >
<svg viewBox="0 0 660 210" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
<marker id="e1arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="var(--vp-c-text-1)"/>
</marker>
</defs>
<rect x="54" y="72" width="92" height="76" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<text x="70" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="100" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="130" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="70" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="100" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">5</text>
<text x="130" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="70" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="100" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="130" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">4</text>
<line x1="146" y1="110" x2="184" y2="110" marker-end="url(#e1arrow)"/>
<text x="165" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">R2−2R1、R3−R1</text>
<rect x="284" y="72" width="92" height="76" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<text x="300" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="330" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="360" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="300" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">0</text>
<text x="330" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="360" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−4</text>
<text x="300" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">0</text>
<text x="330" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="360" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<line x1="376" y1="110" x2="414" y2="110" marker-end="url(#e1arrow)"/>
<text x="395" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">R3−R2</text>
<rect x="514" y="72" width="92" height="76" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<text x="530" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="560" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="590" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="530" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">0</text>
<text x="560" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="590" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−4</text>
<text x="530" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">0</text>
<text x="560" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">0</text>
<text x="590" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">5</text>
<text x="330" y="196" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t ">最后乘对角线 1 × 1 × 5 = 5</text>
</svg>
</FigBox>

**看图能读出什么**：每次行变换都只「倍加」，所以三个矩阵的行列式相等；最后一个矩阵只有对角线上有非零「阶梯」，答案就是对角线连乘 $5$。

**验算（node）**：直接用三阶对角线法则 `1*5*4 + 2*2*1 + 3*2*3 - 3*5*1 - 1*2*3 - 2*2*4` 得 `20 + 4 + 18 - 15 - 6 - 16 = 5` ✓，与三角化结果一致。
:::

### 例 2 · 按行展开算四阶行列式

::: tip 例 2 · 按行展开降阶
计算 $D=\begin{vmatrix}3&1&-1&2\\-5&1&3&-4\\2&0&1&-1\\1&-5&3&-3\end{vmatrix}$。

**先想什么**：四阶没有对角线法则，先观察哪一行（列）$0$ 最多、数字最小——第 $3$ 行含一个 $0$，就用它展开，把 4 阶降到 3 阶。

**步骤**：按第 $3$ 行展开（元素依次为 $a_{31}=2$、$a_{32}=0$、$a_{33}=1$、$a_{34}=-1$）：

$$
D=2A_{31}+0\cdot A_{32}+1\cdot A_{33}+(-1)\cdot A_{34}=2M_{31}+M_{33}+M_{34}
$$

符号按棋盘 $(-1)^{i+j}$ 取：$A_{31}=+M_{31}$、$A_{33}=+M_{33}$、$A_{34}=-M_{34}$，所以最后一项 $(-1)(-M_{34})=+M_{34}$。三个三阶余子式各用对角线法则算：

$$
M_{31}=\begin{vmatrix}1&-1&2\\1&3&-4\\-5&3&-3\end{vmatrix}=16,\quad
M_{33}=\begin{vmatrix}3&1&2\\-5&1&-4\\1&-5&-3\end{vmatrix}=-40,\quad
M_{34}=\begin{vmatrix}3&1&-1\\-5&1&3\\1&-5&3\end{vmatrix}=48
$$

于是 $D=2\times16+(-40)+48=32-40+48=40$。

**为什么**：展开定理把 $n$ 阶降到 $n-1$ 阶，选含 $0$ 的行能少算一项；余子式的符号来自棋盘 $(-1)^{i+j}$，这一步最容易被漏掉。

<FigBox title="展开示意：第 3 行展开 + 符号棋盘" kind="展开" note="左：4 阶行列式，第 3 行高亮，用它展开，只留 2、1、−1 三个非零系数。右：代数余子式的符号棋盘 (−1)^(i+j)，左上角为正、相邻交替，用来给每个余子式定符号。" >
<svg viewBox="0 0 660 230" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<rect x="90" y="63" width="120" height="104" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<rect x="92" y="115" width="116" height="26" fill="var(--vp-c-brand-soft)" stroke="none"/>
<text x="105" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="135" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="165" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−1</text>
<text x="195" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="105" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−5</text>
<text x="135" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="165" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="195" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−4</text>
<text x="105" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">2</text>
<text x="135" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">0</text>
<text x="165" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">1</text>
<text x="195" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">−1</text>
<text x="105" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">1</text>
<text x="135" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−5</text>
<text x="165" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="195" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−3</text>
<text x="150" y="52" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">4 阶行列式（第 3 行高亮）</text>
<rect x="400" y="63" width="120" height="104" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<text x="415" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">+</text>
<text x="445" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−</text>
<text x="475" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">+</text>
<text x="505" y="76" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−</text>
<text x="415" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−</text>
<text x="445" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">+</text>
<text x="475" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−</text>
<text x="505" y="102" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">+</text>
<text x="415" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">+</text>
<text x="445" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">−</text>
<text x="475" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">+</text>
<text x="505" y="128" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">−</text>
<text x="415" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−</text>
<text x="445" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">+</text>
<text x="475" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">−</text>
<text x="505" y="154" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">+</text>
<text x="460" y="52" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">符号棋盘 (−1)^(i+j)</text>
<text x="330" y="210" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t ">第 3 行展开：D = 2·M31 + M33 + M34</text>
</svg>
</FigBox>

**看图能读出什么**：左图第 3 行高亮，非零元素只有 $2,1,-1$，展开后只需算 $M_{31},M_{33},M_{34}$ 三个三阶余子式；右图棋盘告诉我们 $A_{31},A_{33}$ 取正、$A_{34}$ 取负。

**验算（node）**：用脚本按第一行递归展开 `det4([[3,1,-1,2],[-5,1,3,-4],[2,0,1,-1],[1,-5,3,-3]])` 得 `40` ✓，与按第 3 行展开的结果一致。
:::

### 例 3 · 克拉默法则解三元方程组

::: tip 例 3 · 克拉默法则
解方程组 $\begin{cases}x_1+2x_2+3x_3=6\\2x_1+5x_2+2x_3=9\\x_1+3x_2+4x_3=8\end{cases}$。

**先想什么**：系数矩阵就是例 1 那个，已知 $D=5\neq0$，所以有唯一解，直接套克拉默法则算 $D_1,D_2,D_3$。

**步骤**：

$$
D=\begin{vmatrix}1&2&3\\2&5&2\\1&3&4\end{vmatrix}=5,\quad
D_1=\begin{vmatrix}6&2&3\\9&5&2\\8&3&4\end{vmatrix}=5,\quad
D_2=\begin{vmatrix}1&6&3\\2&9&2\\1&8&4\end{vmatrix}=5,\quad
D_3=\begin{vmatrix}1&2&6\\2&5&9\\1&3&8\end{vmatrix}=5
$$

$$
x_1=\frac{D_1}{D}=1,\quad x_2=\frac{D_2}{D}=1,\quad x_3=\frac{D_3}{D}=1
$$

**为什么**：$D_j$ 就是把 $D$ 的第 $j$ 列换成常数项 $\mathbf b=(6,9,8)$；因为 $D\neq0$，克拉默法则保证解唯一，且各未知数等于对应替换行列式除以 $D$。

<FigBox title="替换列示意：D 与 D1（第 1 列换成常数项）" kind="替换" note="左：系数行列式 D，第 1 列是 x1 的系数。右：把第 1 列换成常数项 b=(6,9,8)，得到 D1；D2、D3 同理换第 2、第 3 列。每个 D_j 除以 D 就得到 x_j。" >
<svg viewBox="0 0 660 210" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
<marker id="e3arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M0 0 L10 5 L0 10 z" fill="var(--vp-c-text-1)"/>
</marker>
</defs>
<rect x="104" y="72" width="92" height="76" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<rect x="106" y="74" width="30" height="72" fill="var(--vp-c-brand-soft)" stroke="none"/>
<text x="120" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">1</text>
<text x="150" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="180" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="120" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">2</text>
<text x="150" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">5</text>
<text x="180" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="120" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">1</text>
<text x="150" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="180" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">4</text>
<text x="150" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">D（系数行列式）</text>
<line x1="196" y1="110" x2="274" y2="110" marker-end="url(#e3arrow)"/>
<text x="235" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">换第 1 列</text>
<rect x="374" y="72" width="92" height="76" rx="4" fill="none" stroke="var(--vp-c-text-3)"/>
<rect x="376" y="74" width="30" height="72" fill="var(--vp-c-brand-soft)" stroke="none"/>
<text x="390" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">6</text>
<text x="420" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="450" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="390" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">9</text>
<text x="420" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">5</text>
<text x="450" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">2</text>
<text x="390" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t ">8</text>
<text x="420" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">3</text>
<text x="450" y="134" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t ">4</text>
<text x="420" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-2)" class="sf-t ">D1（第 1 列换成 b）</text>
<text x="330" y="196" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t ">x1 = D1 / D = 5 / 5 = 1</text>
</svg>
</FigBox>

**看图能读出什么**：$D_1$ 只换第一列，其余两列原样不动；换哪一列，解出来的就是哪个未知数。因为 $D=5\neq0$，三个未知数都唯一。

**验算（node）**：把 $(1,1,1)$ 代回原方程组，$1+2+3=6$、$2+5+2=9$、$1+3+4=8$ 三式都成立 ✓；node 再算 $D_1=D_2=D_3=5$ ✓。
:::

**这一题最该带走的一句**：算 $D$ 是第一道闸门——先看 $D$ 等不等于 $0$，等于 $0$ 就别套法则，直接回去消元。三道例题练完，下面把最容易踩的坑排一遍。

## 易错清单

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. **交换两行忘了变号** → 绝对值对、符号错 → 每交换一次就乘一个 $-1$，用「交换次数的奇偶」记最终符号。
2. **把对角线法则用到四阶** → 画线漏项、结果错 → 四阶及以上只能用「性质化简 + 按行展开」，没有对角线法则。
3. **代数余子式漏掉 $(-1)^{i+j}$** → 展开差一个负号 → 记棋盘：左上角为正，相邻交替变号。
4. **$|kA|$ 当成 $k|A|$** → $n$ 阶差 $k^n$ 倍 → 只有「某一行」乘 $k$ 才是行列式乘 $k$；每行都乘 $k$ 则乘 $k^n$。
5. **写 $|A+B|=|A|+|B|$** → 误用线性性 → 行列式只对「每一行」线性，不对整个矩阵相加线性。
6. **$D=0$ 就写「无解」** → 与方程组判定混淆 → $D=0$ 可能无解也可能无穷多解，克拉默法则失效，回消元判定。
7. **展开时用错了「另一行」的代数余子式** → 求和结果当行列式 → 某行元素与另一行代数余子式相乘求和恒为 $0$，别和本行展开搞混。

## 自检

1. 计算 $\begin{vmatrix}2&1\\4&3\end{vmatrix}$ 与 $\begin{vmatrix}1&2&3\\0&1&4\\0&0&5\end{vmatrix}$，各得多少？
2. 把 $\begin{vmatrix}1&2\\3&4\end{vmatrix}$ 的两行交换，行列式变成多少？再把它转置呢？
3. 一个 $4$ 阶行列式有两行完全相同，它的值是多少？这说明对应的方阵可逆吗？
4. 用克拉默法则解 $\begin{cases}2x_1+x_2=5\\x_1+3x_2=10\end{cases}$，先算什么？$D$ 是多少？

## 下一步

行列式这一章回答的是「一个方阵能算出一个什么样的数、这个数怎么又快又准地算出来」。想懂它的几何意义（面积/体积被放大多少倍、负号就是翻转），看现代版[05 · 行列式：面积缩放的因子](../linalg/05-determinant.md)。

本版下一章是「02 · 矩阵及其运算」（对应同济《线性代数》第二章），会系统讲矩阵的加减乘、转置、方阵的行列式、逆矩阵与分块——这一章算出来的 $D\neq0$，到那里正好用来判断一个方阵可不可逆、逆矩阵怎么求。建议接着往下读。
