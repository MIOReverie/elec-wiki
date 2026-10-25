---
title: 02 · 矩阵及其运算
description: 经典结构版矩阵一章，对齐同济《线性代数》第二章：从方程组系数抄成一张表讲起，矩阵、加减与数乘、行乘列、方阵行列式、转置、伴随矩阵、用伴随求逆、分块矩阵一句带过；三道例题沿用第一章那个行列式等于 1 的方阵，全部 node 验算。
---

# 02 · 矩阵及其运算

<Meta time="30 min" level="核心" note="最容易翻车的两处：乘法的「左列 = 右行」没看、伴随矩阵漏了最后一步转置" />

**这一页要解决的三类题**：

1. 两张数字表能不能相乘，乘出来是什么；
2. 给一张方阵表，算它的转置、行列式，以及「由代数余子式排出来的那张表」；
3. 判一张方阵表可不可逆；可逆就把逆求出来，再乘回去核对。

**对应同济《线性代数》第二章「矩阵及其运算」**：矩阵的定义、运算、转置、方阵的行列式、逆矩阵、分块矩阵。

::: tip 读这页之前
- **需要会**：上一页的**代数余子式** $A_{ij}=(-1)^{i+j}M_{ij}$（划掉第 $i$ 行第 $j$ 列，剩下的小行列式再乘符号），以及行列式 $\lvert A\rvert$ 怎么算。这一页的求逆全靠它。
- **会出现的记号**：$E$ 是单位矩阵（对角线全 $1$、其余全 $0$，有的书写 $I$）；$A^T$ 转置、$A^*$ 伴随、$A^{-1}$ 逆、$O$ 零矩阵。首次出现处都会解释。
:::

## 一、把方程组的系数单独抄出来：一张能做运算的表

上一页解方程组时，你真正盯着看的只是系数和等号右边的数。把它们分行抄下来，再把三个未知数也排成一列：

$$
\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}
\begin{bmatrix}x_1\\x_2\\x_3\end{bmatrix}
=\begin{bmatrix}14\\14\\17\end{bmatrix}
$$

读一遍：左边第一个括号里是本页那张 $M$，横着三行分别是三个方程里 $x_1,x_2,x_3$ 的系数；第二个括号是三个未知数竖着排一列；右边是三个方程的右端。整句的意思是「$M$ 的第 $i$ 行与未知数那一列对应相乘再相加，等于第 $i$ 个方程的左端」——所以这个写法只是三个方程的缩写，符号后面没有新东西。

这个「按行按列排好的数表」就叫**矩阵**，表里每个数叫**元素**，$a_{ij}$ 是第 $i$ 行第 $j$ 列那个。行数 $m$、列数 $n$ 合起来叫它的**型**，记作 $m\times n$；行数等于列数的叫**方阵**。这里要说清一件事：说矩阵「是一张表」只是在说明怎么记，真正要学的是这张表之间能做哪些运算——表能相乘、能求逆，这才是重点，把它当成一张死表格就停在背公式上了。

**单位矩阵** $E$：对角线全是 $1$、其余全是 $0$ 的方阵。它在乘法里的地位相当于数里的 $1$：阶数合适时 $AE=EA=A$。

## 二、加减与数乘：逐格做，型不变

同型的两个矩阵才能相加，规则是**对应的格子相加**；减法就是加上负矩阵；数 $k$ 乘矩阵，是**每个格子都乘 $k$**。拿本页那张 $M$ 试一下：

$$
2M=\begin{bmatrix}2&4&6\\0&2&8\\10&12&0\end{bmatrix}
$$

三条都满足熟悉的运算律：$A+B=B+A$、$(A+B)+C=A+(B+C)$、$k(A+B)=kA+kB$。一句话记住：**加减数乘都是逐格运算，型不变、位置不变**。它们是零件，但乘法不按这个来——下一节是本页最容易错的地方。

## 三、乘法：行乘列，而且不交换

**定义**：$A$ 是 $m\times s$ 矩阵、$B$ 是 $s\times n$ 矩阵，则 $AB$ 是 $m\times n$ 矩阵，第 $i$ 行第 $j$ 列那个元素等于 $A$ 的第 $i$ 行与 $B$ 的第 $j$ 列对应相乘再相加：

$$
(AB)_{ij}=a_{i1}b_{1j}+a_{i2}b_{2j}+\cdots+a_{is}b_{sj}=\sum_{k=1}^{s}a_{ik}b_{kj}
$$

读一遍：$s$ 是左边那张表的列数，也必须是右边那张表的行数——否则 $a_{ik}$ 与 $b_{kj}$ 的下标 $k$ 配不上对，这一步就做不下去。整句读作「左边第 $i$ 行、右边第 $j$ 列，逐对相乘再加起来」。形状上记「**左列 = 右行**」，乘积的形状是「左行 × 右列」，中间那个 $s$ 被吃掉。

拿两张小表走一遍（图 1）：

$$
\begin{bmatrix}1&2&3\\2&0&1\end{bmatrix}
\begin{bmatrix}1&0\\2&1\\0&3\end{bmatrix}
=\begin{bmatrix}5&11\\2&3\end{bmatrix}
$$

第一个元素是 $1\times1+2\times2+3\times0=5$，第二行第一列是 $2\times1+0\times2+1\times0=2$，另外两个同理。

<FigBox title="行乘列：A 的第 1 行 × B 的第 1 列 = C 的 (1,1)" kind="结构" hint="左：输入的 A（2×3），第 1 行高亮；中：输入的 B（3×2），第 1 列高亮；右：结果 C（2×2），被点亮的那格就是两者逐对相乘的和。" note="看图能读出什么：左边高亮的 3 个数与中间高亮的 3 个数一一配对，1×1＋2×2＋3×0＝5，正好落在 C 的 (1,1)；换一行一列就换一个格子，所以 C 一共 4 个格子要算 4 次。">
<svg viewBox="0 0 720 260" class="sf" role="img" aria-label="矩阵乘法行乘列示意：A 第一行与 B 第一列配对相乘，得到 C 的 (1,1) 等于 5">
  <text x="36" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="72" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">A（2×3）与 B（3×2）</text>
  <text x="470" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <text x="506" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">C ＝ AB（2×2）</text>
  <rect x="36" y="90" width="120" height="40" fill="var(--vp-c-brand-1)" fill-opacity="0.14"/>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="36" y1="90" x2="156" y2="90"/><line x1="36" y1="130" x2="156" y2="130"/><line x1="36" y1="170" x2="156" y2="170"/>
    <line x1="36" y1="90" x2="36" y2="170"/><line x1="76" y1="90" x2="76" y2="170"/><line x1="116" y1="90" x2="116" y2="170"/><line x1="156" y1="90" x2="156" y2="170"/>
  </g>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="56" y="115">1</text><text x="96" y="115">2</text><text x="136" y="115">3</text>
    <text x="56" y="155">2</text><text x="96" y="155">0</text><text x="136" y="155">1</text>
  </g>
  <text x="186" y="134" font-size="20" text-anchor="middle" fill="var(--vp-c-text-2)">×</text>
  <rect x="216" y="70" width="40" height="120" fill="var(--vp-c-danger-1)" fill-opacity="0.14"/>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="216" y1="70" x2="296" y2="70"/><line x1="216" y1="110" x2="296" y2="110"/><line x1="216" y1="150" x2="296" y2="150"/><line x1="216" y1="190" x2="296" y2="190"/>
    <line x1="216" y1="70" x2="216" y2="190"/><line x1="256" y1="70" x2="256" y2="190"/><line x1="296" y1="70" x2="296" y2="190"/>
  </g>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="236" y="95">1</text><text x="276" y="95">0</text>
    <text x="236" y="135">2</text><text x="276" y="135">1</text>
    <text x="236" y="175">0</text><text x="276" y="175">3</text>
  </g>
  <text x="326" y="134" font-size="20" text-anchor="middle" fill="var(--vp-c-text-2)">＝</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="396" y1="90" x2="476" y2="90"/><line x1="396" y1="130" x2="476" y2="130"/><line x1="396" y1="170" x2="476" y2="170"/>
    <line x1="396" y1="90" x2="396" y2="170"/><line x1="436" y1="90" x2="436" y2="170"/><line x1="476" y1="90" x2="476" y2="170"/>
  </g>
  <rect x="396" y="90" width="40" height="40" fill="var(--vp-c-brand-1)" fill-opacity="0.22"/>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="416" y="115">5</text><text x="456" y="115">11</text>
    <text x="416" y="155">2</text><text x="456" y="155">3</text>
  </g>
  <g font-size="12.5" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="510" y="104">c₁₁ ＝ 1×1 ＋ 2×2 ＋ 3×0 ＝ 5</text>
    <text x="510" y="132">c₂₁ ＝ 2×1 ＋ 0×2 ＋ 1×0 ＝ 2</text>
    <text x="510" y="176" fill="var(--vp-c-text-2)">A 的每一行都要和 B 的</text>
    <text x="510" y="198" fill="var(--vp-c-text-2)">每一列各配一次</text>
  </g>
</svg>
</FigBox>

两条和普通数不一样的地方，都要记住。

**不交换。** 取 $A=\begin{bmatrix}1&2\\3&4\end{bmatrix}$、$B=\begin{bmatrix}0&1\\1&0\end{bmatrix}$，则 $AB=\begin{bmatrix}2&1\\4&3\end{bmatrix}$，而 $BA=\begin{bmatrix}3&4\\1&2\end{bmatrix}$，不是同一张表。上面那个例子更直接：$BA$ 是 $3\times3$，连形状都变了。

**不满足消去律。** 取 $A=\begin{bmatrix}1&0\\0&0\end{bmatrix}$、$B=\begin{bmatrix}0&0\\0&1\end{bmatrix}$、$C=\begin{bmatrix}0&0\\0&2\end{bmatrix}$：$AB$ 与 $AC$ 都是零矩阵 $O$，但 $B\ne C$。这同时说明 $AB=O$ 推不出 $A=O$ 或 $B=O$——数字里「乘起来是 0 就必有一个是 0」的习惯，到这里不能用了。

## 四、算三样东西：行列式、转置、伴随

行列式和伴随只对方阵定义；转置则任何矩阵都能做。

**行列式** $\lvert A\rvert$（也写作 $\det A$）：就是上一页那个数。本页那张 $M$ 的 $\lvert M\rvert=1$。三条常用性质先记下：$\lvert A^T\rvert=\lvert A\rvert$、$\lvert kA\rvert=k^n\lvert A\rvert$（$n$ 阶方阵，因为每行都被乘了 $k$）、$\lvert AB\rvert=\lvert A\rvert\lvert B\rvert$。

**转置** $A^T$：行变成列、列变成行，原来第 $i$ 行第 $j$ 列的数跑到第 $j$ 行第 $i$ 列。长方形矩阵也能转置，转置后行数与列数互换。本页那张 $M$ 转置后是

$$
M^T=\begin{bmatrix}1&0&5\\2&1&6\\3&4&0\end{bmatrix}
$$

（图 2 标了其中一个数怎么走。）乘积的转置要**反序**：$(AB)^T=B^TA^T$。若 $A^T=A$，即沿主对角线两边对称，就叫**对称矩阵**。

<FigBox title="转置：行变列、列变行" kind="结构" hint="左：输入的 M，用颜色点出第 1 行第 2 列那个 2；中：操作，行与列互换；右：输出的 M^T，同一个 2 出现在第 2 行第 1 列。" note="看图能读出什么：每个数只是换了位置，(1,2) 与 (2,1) 互为镜像；行数、列数也互换，所以转置前后行列式是同一个数。">
<svg viewBox="0 0 720 260" class="sf" role="img" aria-label="转置示意：M 中第 1 行第 2 列的 2 在 M 的转置里变成第 2 行第 1 列">
  <defs>
      <marker id="c02-f2-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
      </marker>
    </defs>
  <text x="36" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="72" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">M（3×3）</text>
  <text x="300" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="336" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">行与列互换</text>
  <text x="520" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <text x="556" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">转置后的 M（3×3）</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="60" y1="76" x2="204" y2="76"/><line x1="60" y1="126" x2="204" y2="126"/>
    <line x1="60" y1="176" x2="204" y2="176"/><line x1="60" y1="226" x2="204" y2="226"/>
    <line x1="60" y1="76" x2="60" y2="226"/><line x1="108" y1="76" x2="108" y2="226"/>
    <line x1="156" y1="76" x2="156" y2="226"/><line x1="204" y1="76" x2="204" y2="226"/>
  </g>
  <rect x="108" y="76" width="48" height="50" fill="var(--vp-c-brand-1)" fill-opacity="0.16"/>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="84" y="106">1</text><text x="132" y="106" fill="var(--vp-c-brand-1)">2</text><text x="180" y="106">3</text>
    <text x="84" y="156">0</text><text x="132" y="156">1</text><text x="180" y="156">4</text>
    <text x="84" y="206">5</text><text x="132" y="206">6</text><text x="180" y="206">0</text>
  </g>
  <line x1="222" y1="150" x2="316" y2="150" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c02-f2-arrow)"/>

  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="340" y1="76" x2="484" y2="76"/><line x1="340" y1="126" x2="484" y2="126"/>
    <line x1="340" y1="176" x2="484" y2="176"/><line x1="340" y1="226" x2="484" y2="226"/>
    <line x1="340" y1="76" x2="340" y2="226"/><line x1="388" y1="76" x2="388" y2="226"/>
    <line x1="436" y1="76" x2="436" y2="226"/><line x1="484" y1="76" x2="484" y2="226"/>
  </g>
  <rect x="340" y="126" width="48" height="50" fill="var(--vp-c-brand-1)" fill-opacity="0.16"/>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="364" y="106">1</text><text x="412" y="106">0</text><text x="460" y="106">5</text>
    <text x="364" y="156" fill="var(--vp-c-brand-1)">2</text><text x="412" y="156">1</text><text x="460" y="156">6</text>
    <text x="364" y="206">3</text><text x="412" y="206">4</text><text x="460" y="206">0</text>
  </g>
  <g font-size="12.5" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="520" y="106">(1,2) 的那个 2</text>
    <text x="520" y="130">跑到 (2,1)</text>
    <text x="520" y="180" fill="var(--vp-c-text-2)">每个数都这样换位，</text>
    <text x="520" y="202" fill="var(--vp-c-text-2)">表就翻过来</text>
  </g>
</svg>
</FigBox>

**伴随矩阵** $A^*$：把每个元素换成它的**代数余子式**，摆回原位置得到一张新表，**再转置**。等价地说，$(A^*)_{ij}=A_{ji}$——伴随的第 $i$ 行第 $j$ 列，放的是原来第 $j$ 行第 $i$ 列那个元素的代数余子式。最后这一步转置最容易漏，漏了整张表就错了。

伴随只有一条核心性质，但它撑起整个求逆：

$$
AA^*=A^*A=\lvert A\rvert E
$$

对二阶方阵有个能直接背的结果：$\begin{bmatrix}a&b\\c&d\end{bmatrix}^*=\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$，主对角线对调、副对角线变号。三阶的那个伴随在例 2 里完整算一遍。

**分块矩阵**一句带过：把一张大表用横竖线切成几块，把每块当成一个元素来算；只要切法对得上（对应块能乘、能加），结果和整表算出来的一样。认得这个词就够了，本页不展开。

## 五、求逆：先判可逆，再算逆

**逆矩阵**：对 $n$ 阶方阵 $A$，若存在同阶方阵 $B$ 使

$$
AB=BA=E
$$

就称 $A$ 可逆，$B$ 叫 $A$ 的逆矩阵，记作 $A^{-1}$。判据只有一条：$A$ 可逆 $\iff\lvert A\rvert\ne0$。$\lvert A\rvert=0$ 的叫**奇异矩阵**，没有逆——所以求逆之前第一件事永远是先算 $\lvert A\rvert$。

由 $AA^*=\lvert A\rvert E$ 两边同除 $\lvert A\rvert$（能除，因为 $\lvert A\rvert\ne0$）就得到求逆公式：

$$
A^{-1}=\frac{1}{\lvert A\rvert}A^*
$$

读一遍：$\lvert A\rvert$ 是上一页算出来的那个数，$A^*$ 是刚定义的伴随；整句读作「把伴随里的每个数都除以 $\lvert A\rvert$，得到的就是逆」。二阶套上面那个结果，直接写成

$$
\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}
$$

本页那张 $M$ 的 $\lvert M\rvert=1$，除以 $1$ 不变，所以 $M^{-1}$ 就等于 $M^*$（例 3 走完这一步并乘回去验）。

<FigBox title="伴随法求逆：三步走完" kind="结构" hint="左：输入方阵 A；中间两步是操作——先算 |A| 判可不可逆，再求伴随 A*；右：结果，把伴随每个数除以 |A| 就是逆矩阵。" note="看图能读出什么：三步的顺序不能换——第一步 |A|＝0 就直接结束（没有逆），只有 |A|≠0 才值得去算伴随；本页那张 M 的 |M|＝1，所以第三步的除没有改变数值。">
<svg viewBox="0 0 720 220" class="sf" role="img" aria-label="伴随法求逆的三步流程：算行列式判可逆、求伴随矩阵、除以行列式得逆矩阵">
  <defs>
      <marker id="c02-f3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
      </marker>
    </defs>

  <text x="34" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="70" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">一个方阵</text>
  <text x="196" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="232" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">三步，顺序不能换</text>
  <text x="580" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <rect x="30" y="80" width="150" height="80" rx="12" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.4"/>
  <rect x="216" y="80" width="160" height="80" rx="12" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
  <rect x="412" y="80" width="160" height="80" rx="12" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
  <rect x="550" y="80" width="150" height="80" rx="12" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.4"/>
  <g text-anchor="middle" class="sf-t">
    <text x="105" y="112" font-size="13.5" font-weight="700" fill="var(--vp-c-text-1)">A</text>
    <text x="105" y="136" font-size="11.5" fill="var(--vp-c-text-2)">方阵</text>
    <text x="296" y="108" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)">① 算 |A|</text>
    <text x="296" y="132" font-size="11.5" fill="var(--vp-c-text-2)">|A| ≠ 0 才继续</text>
    <text x="492" y="108" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)">② 求伴随 A*</text>
    <text x="492" y="132" font-size="11.5" fill="var(--vp-c-text-2)">代数余子式再转置</text>
    <text x="625" y="108" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)">A⁻¹ ＝ A* / |A|</text>
    <text x="625" y="132" font-size="11.5" fill="var(--vp-c-text-2)">逐数相除</text>
  </g>
  <line x1="184" y1="120" x2="210" y2="120" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c02-f3-arrow)"/>
  <line x1="380" y1="120" x2="406" y2="120" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c02-f3-arrow)"/>
  <line x1="508" y1="166" x2="560" y2="166" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c02-f3-arrow)"/>
  <text x="534" y="196" font-size="11.5" fill="var(--vp-c-text-2)" text-anchor="middle" class="sf-t">③ 除以 |A|</text>
</svg>
</FigBox>

还有一条路先知道名字：第 3 章会用初等行变换把 $(A\mid E)$ 化成 $(E\mid A^{-1})$，三阶以上比伴随更省手算，本页不展开。

## 例题

::: tip 例 1 · 行乘列，并验它不交换
**题目**：算 $AB$ 与 $BA$，其中 $A=\begin{bmatrix}1&2&3\\2&0&1\end{bmatrix}$、$B=\begin{bmatrix}1&0\\2&1\\0&3\end{bmatrix}$。

**先猜**：$A$ 是 $2\times3$、$B$ 是 $3\times2$，左列 $3$ = 右行 $3$，能乘，结果是 $2\times2$ 四个格子；反过来 $B$ 是 $3\times2$ 乘 $A$ 是 $2\times3$，得到 $3\times3$ 九个格子。形状都不同，所以 $AB\ne BA$ 是必然的。

**再算**：

$$
AB=\begin{bmatrix}1&2&3\\2&0&1\end{bmatrix}\begin{bmatrix}1&0\\2&1\\0&3\end{bmatrix}=\begin{bmatrix}5&11\\2&3\end{bmatrix},\qquad
BA=\begin{bmatrix}1&0\\2&1\\0&3\end{bmatrix}\begin{bmatrix}1&2&3\\2&0&1\end{bmatrix}=\begin{bmatrix}1&2&3\\4&4&7\\6&0&3\end{bmatrix}
$$

*（为什么逐格这么算：$AB$ 的第 1 行第 1 列是 $1\times1+2\times2+3\times0=5$；$AB$ 的第 2 行第 1 列是 $2\times1+0\times2+1\times0=2$——行取左边的表、列取右边的表，位置不能调。）*

**再回代**：用形状核对——$AB$ 是 $2\times2$、$BA$ 是 $3\times3$，两张表连阶数都不同，不相等这件事一眼就成立；再把 $AB$ 的第 1 行第 1 列 $5$ 与手算的 $1+4+0=5$ 对一次。
:::

::: tip 例 2 · 求转置、行列式与伴随
**题目**：对 $M=\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}$ 求 $M^T$、$\lvert M\rvert$、$M^*$。

**先猜**：$M^T$ 是把 $M$ 翻过来，数字不变、只是换位置；$\lvert M\rvert$ 上一页用三种办法算过，是 $1$；伴随有九个代数余子式要算，符号按棋盘 $\pm$ 交替，量级十几到二十几。

**再算**：先把九个代数余子式按原位置摆好（只展开第一行示范，其余同法）：

$$
A_{11}=(-1)^{1+1}\begin{vmatrix}1&4\\6&0\end{vmatrix}=-24,\quad
A_{12}=(-1)^{1+2}\begin{vmatrix}0&4\\5&0\end{vmatrix}=20,\quad
A_{13}=(-1)^{1+3}\begin{vmatrix}0&1\\5&6\end{vmatrix}=-5
$$

$$
\begin{bmatrix}A_{11}&A_{12}&A_{13}\\A_{21}&A_{22}&A_{23}\\A_{31}&A_{32}&A_{33}\end{bmatrix}
=\begin{bmatrix}-24&20&-5\\18&-15&4\\5&-4&1\end{bmatrix}
\quad\xrightarrow{\text{再转置}}\quad
M^*=\begin{bmatrix}-24&18&5\\20&-15&-4\\-5&4&1\end{bmatrix}
$$

*（为什么还要转置：伴随的第 $i$ 行第 $j$ 列要放 $A_{ji}$，所以刚算好的那张表必须整体翻一次；这一步漏了，后面求逆全错。）*

**再回代**：把 $M$ 与 $M^*$ 乘起来，看是否等于 $\lvert M\rvert E$。逐格算第一行第一列：$1\times(-24)+2\times20+3\times(-5)=-24+40-15=1$；第一行第二列：$1\times18+2\times(-15)+3\times4=18-30+12=0$。继续算完恰好是 $E$（因为 $\lvert M\rvert=1$），核对通过。
:::

::: tip 例 3 · 求逆并乘回去
**题目**：求 $M^{-1}$，并验证 $MM^{-1}=E$。

**先猜**：$\lvert M\rvert=1\ne0$，所以可逆；既然要除以 $\lvert M\rvert=1$，$M^{-1}$ 应当和例 2 算出的 $M^*$ 一模一样，全是整数。

**再算**：

$$
M^{-1}=\frac{1}{\lvert M\rvert}M^*=\frac{1}{1}\begin{bmatrix}-24&18&5\\20&-15&-4\\-5&4&1\end{bmatrix}
$$

*（为什么可以直接写：除数是 $1$，什么都不变；换一个 $\lvert M\rvert=2$ 的例子，这里就要把每个数都除以 $2$。）*

**再回代**：乘回去验。第一行乘 $M$ 的第一列：$(-24)\times1+18\times0+5\times5=1$；第一行乘第二列：$(-24)\times2+18\times1+5\times6=0$；第一行乘第三列：$(-24)\times3+18\times4+5\times0=0$。三格正是 $E$ 的第一行，其余两行同法，全部对上——$MM^{-1}=E$ 成立。
:::

## 这一页带走三句话

1. 矩阵是按行、列排好的一张表，用它的地方在于表之间的运算：加减与数乘逐格做，乘法是「左列 = 右行」的行乘列。
2. 乘法不交换、也不满足消去律；$AB=O$ 推不出 $A=O$ 或 $B=O$。
3. 只有方阵有行列式和伴随；转置任何矩阵都能做，乘积转置要反序；$A$ 可逆 $\iff\lvert A\rvert\ne0$，逆由 $A^{-1}=A^*/\lvert A\rvert$ 算出，伴随记得最后转置。

下一步是 [03 · 矩阵的初等变换与线性方程组](./03-elementary)：这一页这些工具（尤其是 $(A\mid E)$ 那条求逆的路）到那里会变成解方程组的流水线。想懂「矩阵为什么会动、乘法为什么是先后顺序」，读现代版第 2 章 [02 · 矩阵与线性变换](../linalg/02-matrices)。
