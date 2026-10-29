---
title: 01 · 行列式：从对角线到克拉默法则
description: 同济第一章的走法：从二元方程组的分母引出二阶行列式，三阶用对角线法则，化简靠五条性质，降阶靠按行列展开，最后用克拉默法则直接写解。
---

# 01 · 行列式：从对角线到克拉默法则

<Meta time="35 min" level="核心" note="最容易错的两处：换两行忘了变号、代数余子式漏掉 (−1)^(i+j)" />

解 $\begin{cases}2x+3y=7\\ x-y=1\end{cases}$ 这种题，中学就练过：第二式给出 $y=x-1$，代进第一式得 $2x+3(x-1)=7$，于是 $x=2$、$y=1$。

题目一换就没这么轻松了。要是系数不是 2、3、1 而是字母，或者未知数变成三个，一步步消元能算完，可每一步都得重抄一遍，还看不出结果长什么样。这条路上会冒出一个很有用的数：它单独出现时只是一个分母，攒起来之后却能把安排好的答案直接写出来。下面就从那个分母开始。

跟课堂进度的话，这页对应同济《线性代数》第一章「行列式」，讲二阶三阶、性质、按行（列）展开、克拉默法则。至于「$n$ 阶行列式的定义」那一节，这里只讲到读得懂公式为止，做题用不上它。

::: tip 读这页之前
中学的加减消元得会，也就是会解 $\begin{cases}2x+3y=7\\x-y=1\end{cases}$ 这样的题，第一节就从它开始。

会出现的记号：$a_{ij}$（第 $i$ 行第 $j$ 列那个数）、$\lvert A\rvert$ 与 $\det A$（都读作「$A$ 的行列式」，同一个东西）、$M_{ij}$（余子式）、$A_{ij}$（代数余子式）、$D$ 与 $D_j$（第五节）。首次出现时都会解释。

不用会：矩阵的写法、转置、$A\mathbf x=\mathbf b$，那是第 2 章的内容，这页一次都不用。
:::

## 一、解个方程组，分母上冒出一个数

先把已经会的事做一遍，就是开头那道题，答案 $x=2$、$y=1$。

把系数换成字母再走一遍。对 $\begin{cases}a_{11}x+a_{12}y=b_1\\ a_{21}x+a_{22}y=b_2\end{cases}$ 消掉 $y$，剩下的 $x$ 前面必然带着这一个括号：

$$
(a_{11}a_{22}-a_{12}a_{21})\,x=b_1a_{22}-b_2a_{12}
$$

它读作「左上乘右下，减去右上乘左下」。换一组系数它换成另一个数，但位置和作用不变。回到刚才那组数字，它是 $2\times(-1)-3\times1=-5$，于是

$$
x=\frac{7\times(-1)-3\times1}{-5}=2,\qquad y=\frac{2\times1-7\times1}{-5}=1
$$

和消元的结果一致。这个「分母上的数」值得有个名字：**二阶行列式**，记作

$$
\begin{vmatrix}a_{11}&a_{12}\\ a_{21}&a_{22}\end{vmatrix}=a_{11}a_{22}-a_{12}a_{21}
$$

两条竖线只是记号，跟绝对值无关；它也可以写成 $\lvert A\rvert$ 或 $\det A$。一条边界现在就要记住：它等于 $0$ 时不能做分母，直接写解的办法就失效。回消元后的式子可能得到 $0=\text{非零数}$，也可能得到 $0=0$，不能一概说成无解，第五节还会用。

三阶呢？二阶就是一张 $2\times2$ 的表，两条对角线相减；三阶是一张 $3\times3$ 的表，把线补到六条：

$$
\begin{vmatrix}a_{11}&a_{12}&a_{13}\\ a_{21}&a_{22}&a_{23}\\ a_{31}&a_{32}&a_{33}\end{vmatrix}
=a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}
-a_{13}a_{22}a_{31}-a_{11}a_{23}a_{32}-a_{12}a_{21}a_{33}
$$

每项三个数相乘，每行恰取一个、每列恰取一个；前三项取正、后三项取负，共 $3!=6$ 项。

拿下面这张要用到底的表试一下：

$$
\lvert M\rvert=\begin{vmatrix}1&2&3\\ 0&1&4\\ 5&6&0\end{vmatrix}
$$

三条实线（$1\times1\times0$、$2\times4\times5$、$3\times0\times6$）加起来 $40$，三条虚线（$3\times1\times5$、$1\times4\times6$、$2\times0\times0$）加起来 $39$，相减得 $\lvert M\rvert=1$。这个 $1$ 后面还会用两种别的办法各算一次，三条路应当落到同一个数上。

<FigBox title="对角线法则：六条线各取三个数" kind="结构" hint="把后两列照抄一份出来，六条线才画得直。" note="左边的表后面接了两列抄来的数，实线取正、虚线取负。看完该看出每条线穿过不同的行与列，40 减 39 得 1。">
<svg viewBox="0 0 720 300" class="sf" role="img" aria-label="三阶行列式的对角线法则：五列布局，三条实线取正、三条虚线取负，实线和 40 减虚线和 39 得 1">
  <text x="40" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="76" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">三阶表，后两列照抄第 1、2 列</text>
  <text x="368" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="404" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">六条线，每条乘三个数</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="40" y1="78" x2="320" y2="78"/>
    <line x1="40" y1="134" x2="320" y2="134"/>
    <line x1="40" y1="190" x2="320" y2="190"/>
    <line x1="40" y1="246" x2="320" y2="246"/>
    <line x1="40" y1="78" x2="40" y2="246"/>
    <line x1="96" y1="78" x2="96" y2="246"/>
    <line x1="152" y1="78" x2="152" y2="246"/>
    <line x1="264" y1="78" x2="264" y2="246"/>
    <line x1="320" y1="78" x2="320" y2="246"/>
  </g>
  <line x1="208" y1="70" x2="208" y2="254" stroke="var(--vp-c-text-2)" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="236" y="270" font-size="11" fill="var(--vp-c-text-3)" class="sf-t" text-anchor="middle">照抄区</text>
  <g stroke="var(--vp-c-brand-1)" stroke-width="1.6" stroke-opacity="0.55">
    <line x1="68" y1="106" x2="180" y2="218"/>
    <line x1="124" y1="106" x2="236" y2="218"/>
    <line x1="180" y1="106" x2="292" y2="218"/>
  </g>
  <g stroke="var(--vp-c-danger-1)" stroke-width="1.6" stroke-opacity="0.55" stroke-dasharray="7 5">
    <line x1="180" y1="106" x2="68" y2="218"/>
    <line x1="236" y1="106" x2="124" y2="218"/>
    <line x1="292" y1="106" x2="180" y2="218"/>
  </g>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="68" y="111">1</text><text x="124" y="111">2</text><text x="180" y="111">3</text><text x="236" y="111">1</text><text x="292" y="111">2</text>
    <text x="68" y="167">0</text><text x="124" y="167">1</text><text x="180" y="167">4</text><text x="236" y="167">0</text><text x="292" y="167">1</text>
    <text x="68" y="223">5</text><text x="124" y="223">6</text><text x="180" y="223">0</text><text x="236" y="223">5</text><text x="292" y="223">6</text>
  </g>
  <g font-size="12.5" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="368" y="96" fill="var(--vp-c-brand-1)">三条实线（正号）</text>
    <text x="368" y="120">1×1×0 ＋ 2×4×5 ＋ 3×0×6 ＝ 40</text>
    <text x="368" y="152" fill="var(--vp-c-danger-1)">三条虚线（负号）</text>
    <text x="368" y="176">3×1×5 ＋ 1×4×6 ＋ 2×0×0 ＝ 39</text>
    <text x="368" y="216" font-weight="700">结果：40 − 39 ＝ 1</text>
    <text x="368" y="240" fill="var(--vp-c-text-2)">也就是 |M| ＝ 1</text>
  </g>
</svg>
</FigBox>

对角线法则只有二阶、三阶能用。四阶一共 $4!=24$ 项，画线必漏。

教材里还有一个 $n$ 阶的一般定义，用「排列」「逆序数」把六项写成一行式子：每行每列各取一个相乘，符号看列下标排列里逆序数的奇偶，共 $n!$ 项。这两个词后面用不到，在教材上见到不陌生就够了。

## 二、先把表改简单：五条不改值的动作

阶数一高，画线就废了。手算的正路是先改简单、再算。下面五条动作做完，值不变或者只差一个符号，按手算时用到的频率排，每条后面立刻看它省了什么。

一、换两行，值变号。$\lvert M\rvert$ 的第 1、2 行对调，得 $\begin{vmatrix}0&1&4\\1&2&3\\5&6&0\end{vmatrix}=-1$。用处是：要拿来做支点的位置是 $0$ 时，先把非零数换上来，代价只记一个负号。

二、某一行整体乘 $k$，值就乘 $k$；反过来把公因子 $k$ 提到行列式外面，剩下的数当然也小了一圈。第 1 行乘 $2$：$\begin{vmatrix}2&4&6\\0&1&4\\5&6&0\end{vmatrix}=2\lvert M\rvert=2$。反过来用更常见：某行有公因子就提出来，数字立刻变小。

三、一行的 $k$ 倍加到另一行（$k$ 是任意一个数），值不变。最常用的一条，专门造 $0$：第 3 行减去第 1 行的 $5$ 倍，得 $\begin{vmatrix}1&2&3\\0&1&4\\0&-4&-15\end{vmatrix}$，仍等于 $1$。

四、两行成比例（含两行相同），值为 $0$。$\begin{vmatrix}1&2&3\\2&4&6\\5&6&0\end{vmatrix}=0$，第 2 行正是第 1 行的 $2$ 倍。这条不用算，所以手算第一步永远先看有没有这种情况。

五、某一行每个数都是两数之和时，可拆成两个行列式相加。

$$
\begin{vmatrix}5&7\\2&3\end{vmatrix}=\begin{vmatrix}2&1\\2&3\end{vmatrix}+\begin{vmatrix}3&6\\2&3\end{vmatrix}=4+(-3)=1
$$

边界要留意：能拆的只有某一行，不能对整个表拆。$\begin{vmatrix}1&0\\0&0\end{vmatrix}$ 与 $\begin{vmatrix}0&0\\0&1\end{vmatrix}$ 都是 $0$，逐格相加却是 $1$。

上面五条之外再单列一条，它不用算、只要记住：转置（行与列整体互换）值不变。有了这一条，五条动作对「列」也同样成立。$\lvert M\rvert$ 与转置后的 $\begin{vmatrix}1&0&5\\2&1&6\\3&4&0\end{vmatrix}$ 都是 $1$。

## 三、按一行展开：把三阶降成三个二阶

四阶不能画线，但可以不画：把大表拆成几个小表。划掉某个数所在的行和列，剩下的小一号行列式叫它的**余子式** $M_{ij}$；再配一个符号就是**代数余子式** $A_{ij}=(-1)^{i+j}M_{ij}$。符号只跟位置有关，摆出来是个棋盘：左上角为正，往右、往下一格就变号。

于是有了把阶数降一级的办法，按第 $i$ 行展开：

$$
\lvert A\rvert=a_{i1}A_{i1}+a_{i2}A_{i2}+\cdots+a_{in}A_{in}
$$

读一遍：$a_{i1}$ 是第 $i$ 行第 1 列的原始数字，$A_{i1}$ 是「划掉这一行这一列剩下的小行列式再乘 $\pm1$」。整句读作「沿第 $i$ 行，把每个数字乘上它那份带符号的小行列式，再加起来」。$n$ 个数各配一个 $(n-1)$ 阶行列式，所以阶数降了一级，四阶五阶才手算得动。

拿 $\lvert M\rvert$ 按第 2 行（$0,1,4$）展开：

$$
A_{21}=(-1)^{2+1}\begin{vmatrix}2&3\\6&0\end{vmatrix}=18,\quad
A_{22}=(-1)^{2+2}\begin{vmatrix}1&3\\5&0\end{vmatrix}=-15,\quad
A_{23}=(-1)^{2+3}\begin{vmatrix}1&2\\5&6\end{vmatrix}=4
$$

于是 $\lvert M\rvert=0\times18+1\times(-15)+4\times4=-15+16=1$。三项分别拿到 $0$、$-15$、$16$，其中 $18$ 那一项被系数 $0$ 整个抵掉；剩下的两个数一负一正，正好抵成 $1$，与第一节对角线算出的结果一致。

<FigBox title="按第 2 行展开：系数 × 代数余子式" kind="展开" hint="第 2 行（0、1、4）就是用来乘的三个系数。" note="中间那张棋盘写着每个位置的符号，左上为正、相邻交替。看完该看出第一个系数是 0，那一项直接作废；$A_{22}$ 与 $A_{23}$ 一负一正，$-15$ 与 $16$ 正好抵成 1。">
<svg viewBox="0 0 720 300" class="sf" role="img" aria-label="按第二行展开的示意：左为高亮第二行的三阶表，中为代数余子式的符号棋盘，右为三项乘积相加得 1">
  <text x="40" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="76" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">三阶表，第 2 行高亮</text>
  <text x="286" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="322" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">定符号</text>
  <text x="492" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <rect x="52" y="128" width="168" height="56" fill="var(--vp-c-brand-1)" fill-opacity="0.12"/>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="52" y1="72" x2="220" y2="72"/><line x1="52" y1="128" x2="220" y2="128"/>
    <line x1="52" y1="184" x2="220" y2="184"/><line x1="52" y1="240" x2="220" y2="240"/>
    <line x1="52" y1="72" x2="52" y2="240"/><line x1="108" y1="72" x2="108" y2="240"/>
    <line x1="164" y1="72" x2="164" y2="240"/><line x1="220" y1="72" x2="220" y2="240"/>
  </g>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="80" y="105">1</text><text x="136" y="105">2</text><text x="192" y="105">3</text>
    <text x="80" y="161" fill="var(--vp-c-brand-1)">0</text><text x="136" y="161" fill="var(--vp-c-brand-1)">1</text><text x="192" y="161" fill="var(--vp-c-brand-1)">4</text>
    <text x="80" y="217">5</text><text x="136" y="217">6</text><text x="192" y="217">0</text>
  </g>
  <text x="252" y="161" font-size="18" fill="var(--vp-c-text-2)" text-anchor="middle">×</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="284" y1="72" x2="452" y2="72"/><line x1="284" y1="128" x2="452" y2="128"/>
    <line x1="284" y1="184" x2="452" y2="184"/><line x1="284" y1="240" x2="452" y2="240"/>
    <line x1="284" y1="72" x2="284" y2="240"/><line x1="340" y1="72" x2="340" y2="240"/>
    <line x1="396" y1="72" x2="396" y2="240"/><line x1="452" y1="72" x2="452" y2="240"/>
  </g>
  <rect x="284" y="128" width="168" height="56" fill="var(--vp-c-brand-1)" fill-opacity="0.12"/>
  <g font-size="16" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="312" y="105">＋</text><text x="368" y="105">−</text><text x="424" y="105">＋</text>
    <text x="312" y="161">−</text><text x="368" y="161">＋</text><text x="424" y="161">−</text>
    <text x="312" y="217">＋</text><text x="368" y="217">−</text><text x="424" y="217">＋</text>
  </g>
  <text x="480" y="161" font-size="18" fill="var(--vp-c-text-2)" text-anchor="middle">＝</text>
  <g font-size="12.5" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="506" y="96">0 × 18 ＝ 0</text>
    <text x="506" y="126">1 × (−15) ＝ −15</text>
    <text x="506" y="156">4 × (＋4) ＝ ＋16</text>
    <line x1="506" y1="170" x2="678" y2="170" stroke="var(--vp-c-divider)" stroke-width="1"/>
    <text x="506" y="196" font-weight="700">加起来 ＝ 1</text>
    <text x="506" y="222" fill="var(--vp-c-text-2)">与对角线法则一致</text>
  </g>
</svg>
</FigBox>

经验只有一条：挑 $0$ 最多的那一行（列）展开，那个 $0\times18$ 根本不用算。

## 四、化到三角：只剩对角线连乘

上三角指主对角线左下方全是 $0$，这种表的值就是对角线连乘：

$$
\begin{vmatrix}1&2&3\\ 0&1&4\\ 0&0&1\end{vmatrix}=1\times1\times1=1
$$

为什么？按第 1 列展开，只有最上面那个 $1$ 配的余子式不是 $0$，剩下的还是上三角，一路降到底就只剩对角线。

这是手算最省的一条路：用第二节的动作把表化成上三角，再乘对角线。$\lvert M\rvert$ 走一遍：

$$
\lvert M\rvert=\begin{vmatrix}1&2&3\\0&1&4\\5&6&0\end{vmatrix}
\xrightarrow{R_3-5R_1}\begin{vmatrix}1&2&3\\0&1&4\\0&-4&-15\end{vmatrix}
\xrightarrow{R_3+4R_2}\begin{vmatrix}1&2&3\\0&1&4\\0&0&1\end{vmatrix}=1
$$

两步都只用性质三，值一路不变，最后乘对角线。其中第二步 $R_3+4R_2$ 消掉的，正是第 3 行第 2 列那个 $-4$。记号 $R_3-5R_1$ 读作「第 3 行减去第 1 行的 $5$ 倍」。

把路线收成一串动作，以后照这个顺序走：

1. 先看有没有一行全 $0$、或两行成比例，有就直接写 $0$；
2. 某行有公因数先提出来；
3. 选一个 $1$ 或小整数当支点，用它把同列其他位置消成 $0$；
4. 化到上三角就乘对角线；不方便化就用 $0$ 最多的行（列）展开；
5. 换一条路再算一遍。

## 五、克拉默法则：分母不为零，才敢直接写答案

回到第一节那条边界。分母不为 $0$ 时，解可以直接写成分母之比，一般化就是**克拉默法则**：$n$ 个未知数、$n$ 个方程的方程组，若系数表算出的那个行列式 $D\ne0$，则解唯一，且

$$
x_j=\frac{D_j}{D}\qquad(j=1,2,\dots,n)
$$

读一遍：$D$ 是系数表算出的数，也就是第一节那个分母；$D_j$ 是把第 $j$ 列（$x_j$ 的系数那一整列）换成等号右边那列数后，用同样办法算出的数。整句读作「$x_j$ 等于把第 $j$ 列换掉算出的数除以 $D$」，第几个未知数就换第几列，换列这一步画在例 3 的图里。

用第一节那道题验收：$D=\begin{vmatrix}2&3\\1&-1\end{vmatrix}=-5$，$D_1=-10$、$D_2=-5$，于是 $x=2$、$y=1$，与消元一致。

前提要盯紧：$D=0$ 时法则给不出答案，但不等于「无解」。可能无解也可能无穷多解，要等第 3 章用初等变换判；套公式前先算 $D$。

## 例题

::: tip 例 1 · 用五条动作化三角，算一个三阶行列式
题目：算 $D=\begin{vmatrix}1&2&3\\2&5&2\\1&3&4\end{vmatrix}$。

先猜：第 1 列有现成的 $1$ 当支点，先清左下角应比六项直接乘快；对角线那一项是 $20$，结果该不大。

再算：

$$
D=\begin{vmatrix}1&2&3\\2&5&2\\1&3&4\end{vmatrix}
\xrightarrow{R_2-2R_1,\ R_3-R_1}\begin{vmatrix}1&2&3\\0&1&-4\\0&1&1\end{vmatrix}
\xrightarrow{R_3-R_2}\begin{vmatrix}1&2&3\\0&1&-4\\0&0&5\end{vmatrix}=1\times1\times5=5
$$

*（为什么可以这么改：两步都只是「一行的倍数加到另一行」即性质三，值不变；最后成了上三角，乘对角线。）*

再回代：换对角线法则直接算。实线 $1\times5\times4+2\times2\times1+3\times2\times3=42$，虚线 $3\times5\times1+1\times2\times3+2\times2\times4=37$，$42-37=5$，一致。
:::

::: tip 例 2 · 该按哪一行展开
题目：算 $\begin{vmatrix}3&1&5\\0&0&2\\4&6&1\end{vmatrix}$。

先猜：第 2 行有两个 $0$，按它展开只剩一项；位置 $(2,3)$ 的符号是 $(-1)^{2+3}=-1$，所以结果应当是负数。

再算：

$$
\lvert A\rvert=2\cdot A_{23}=2\times(-1)\times\begin{vmatrix}3&1\\4&6\end{vmatrix}=2\times(-1)\times(18-4)=-28
$$

*（为什么只留一项：$0$ 乘任何代数余子式都是 $0$；那个负号来自棋盘上 $(2,3)$ 这一格。）*

再回代：用对角线法则核一遍。实线 $3\times0\times1+1\times2\times4+5\times0\times6=8$，虚线 $5\times0\times4+3\times2\times6+1\times0\times1=36$，$8-36=-28$，符号与数值都和猜测一致。
:::

::: tip 例 3 · 克拉默法则解一个三元方程组
题目：解方程组

$$
\begin{cases}x_1+2x_2+3x_3=14\\ x_2+4x_3=14\\ 5x_1+6x_2=17\end{cases}
$$

它的系数表正是前面那张 $M$，等号右边是 $(14,14,17)$。

先猜：$D=\lvert M\rvert=1$（已用三种办法算过），$D\ne0$ 所以解唯一；除以 $1$ 不改数值，$x_j$ 就等于 $D_j$，应是三个整数。

再算：把第 $j$ 列换成 $(14,14,17)$ 再算：

$$
D_1=\begin{vmatrix}14&2&3\\14&1&4\\17&6&0\end{vmatrix}=1,\qquad
D_2=\begin{vmatrix}1&14&3\\0&14&4\\5&17&0\end{vmatrix}=2,\qquad
D_3=\begin{vmatrix}1&2&14\\0&1&14\\5&6&17\end{vmatrix}=3
$$

于是 $x_1=1/1=1$、$x_2=2/1=2$、$x_3=3/1=3$。

<FigBox title="换第 2 列：解出来的就是 x₂" kind="替换" hint="第 2 列整列被右端替掉，另外两列原样不动。" note="左边是系数表 D，中间那一列被 14、14、17 换上，得到 D₂。看完该看出换哪一列就解出哪个未知数，图上 D＝1、D₂＝2，与上面的计算对上。">
<svg viewBox="0 0 720 260" class="sf" role="img" aria-label="克拉默法则的换列示意：D 高亮第二列，把第二列换成常数项得到 D2，x2 等于 D2 除以 D">
  <defs>
      <marker id="c01-f3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
      </marker>
    </defs>
  <text x="40" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="76" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">D：系数表</text>
  <text x="300" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="336" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">第 2 列整列换掉</text>
  <text x="540" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <rect x="148" y="74" width="56" height="168" fill="var(--vp-c-brand-1)" fill-opacity="0.12"/>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="36" y1="74" x2="204" y2="74"/><line x1="36" y1="130" x2="204" y2="130"/>
    <line x1="36" y1="186" x2="204" y2="186"/><line x1="36" y1="242" x2="204" y2="242"/>
    <line x1="36" y1="74" x2="36" y2="242"/><line x1="92" y1="74" x2="92" y2="242"/>
    <line x1="148" y1="74" x2="148" y2="242"/><line x1="204" y1="74" x2="204" y2="242"/>
  </g>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="64" y="107">1</text><text x="120" y="107" fill="var(--vp-c-brand-1)">2</text><text x="176" y="107">3</text>
    <text x="64" y="163">0</text><text x="120" y="163" fill="var(--vp-c-brand-1)">1</text><text x="176" y="163">4</text>
    <text x="64" y="219">5</text><text x="120" y="219" fill="var(--vp-c-brand-1)">6</text><text x="176" y="219">0</text>
  </g>
  <text x="120" y="60" font-size="11" fill="var(--vp-c-brand-2)" text-anchor="middle" class="sf-t">x2 的系数</text>
  <line x1="216" y1="158" x2="316" y2="158" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c01-f3-arrow)"/>

  <rect x="412" y="74" width="56" height="168" fill="var(--vp-c-brand-1)" fill-opacity="0.12"/>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="300" y1="74" x2="468" y2="74"/><line x1="300" y1="130" x2="468" y2="130"/>
    <line x1="300" y1="186" x2="468" y2="186"/><line x1="300" y1="242" x2="468" y2="242"/>
    <line x1="300" y1="74" x2="300" y2="242"/><line x1="356" y1="74" x2="356" y2="242"/>
    <line x1="412" y1="74" x2="412" y2="242"/><line x1="468" y1="74" x2="468" y2="242"/>
  </g>
  <g font-size="15" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="328" y="107">1</text><text x="384" y="107" fill="var(--vp-c-brand-1)">14</text><text x="440" y="107">3</text>
    <text x="328" y="163">0</text><text x="384" y="163" fill="var(--vp-c-brand-1)">14</text><text x="440" y="163">4</text>
    <text x="328" y="219">5</text><text x="384" y="219" fill="var(--vp-c-brand-1)">17</text><text x="440" y="219">0</text>
  </g>
  <g font-size="12.5" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="540" y="110">D2 ＝ 2</text>
    <text x="540" y="138">D  ＝ 1</text>
    <text x="540" y="176" font-weight="700">x2 ＝ 2 ÷ 1 ＝ 2</text>
    <text x="540" y="204" fill="var(--vp-c-text-2)">第几个未知数，</text>
    <text x="540" y="226" fill="var(--vp-c-text-2)">就换第几列</text>
  </g>
</svg>
</FigBox>

*（为什么能这样换：$D_j$ 换掉的正是 $x_j$ 的系数那一列，另外两列不动；$D\ne0$ 保证分母能除。）*

再回代：把 $(1,2,3)$ 代回三个方程，$1+4+9=14$、$2+12=14$、$5+12=17$，三式全成立。
:::

## 收尾

到底要会到什么程度？给你三个能当场自测的动作：

1. 随便写一张三阶表，能同时用对角线法则和按行展开各算一次，两个数还对得上；
2. 看见一张数字很大的表，知道先提公因子、再造 $0$、最后化三角，而不是硬乘六项；
3. 看见「未知数个数 = 方程个数」的题，先算 $D$，$D\ne0$ 才往下写 $x_j=D_j/D$。

四阶起是 $n!$ 项，画线必漏，所以老手都改成化三角或者按行列展开。下一步是 [02 · 矩阵及其运算](./02-matrices)：表还能加减乘、求逆，这页的 $\lvert M\rvert=1$ 到那里正好判它可不可逆。想懂它的几何含义（面积、体积被放大的倍数，负号表示翻面），读现代版第 5 章 [05 · 行列式](../linalg/05-determinant)。
