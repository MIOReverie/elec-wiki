---
title: 03 · 矩阵的初等变换与线性方程组
description: 同济第三章的走法：把加减消元写成三种初等行变换，化行阶梯形与行最简形，用两个秩判解，再写通解（特解加齐次解），顺带用 (A|E)→(E|A⁻¹) 求逆。
---

# 03 · 矩阵的初等变换与线性方程组

<Meta time="32 min" level="核心" note="最容易错的一处：判解只看两个秩是否相等，与有没有 0 行无关；自由度是 n−r，不是 r" />

中学解方程组的动作只有三种：换个次序、把一个方程两边同乘非零数、把一个方程的倍数加到另一个方程上。三种都能倒回去（换回来、除以它、减回去），所以解一个不多、一个不少。

这三个动作有个共同点：动的是系数和右端，未知数的名字从头到尾没被碰过。既然如此，名字可以不写，只抄数。抄完就变成一张表，表能做的操作比方程组多，判解也变成数一数的事。

跟课堂进度的话，这页对应同济《线性代数》第三章「矩阵的初等变换与线性方程组」。

::: tip 读这页之前
上一页的矩阵与型（$m\times n$）、单位矩阵 $E$ 得会，$A\mathbf x=\mathbf b$ 这个写法也要认得：$A$ 是系数表、$\mathbf x$ 是一列未知数、$\mathbf b$ 是右端那列。

会出现的记号：$[A\mid\mathbf b]$（增广矩阵，竖线右边是右端）、$r(A)$（秩）、$R_i$（第 $i$ 行）、$O$（零矩阵）。首次出现处都会解释。
:::

## 一、三件只动系数的事

既然只动系数，就把系数和右端抄成一张表：竖线左边 $A$、右边 $\mathbf b$，叫**增广矩阵**：

$$
[A\mid\mathbf b]=\left[\begin{array}{cccc|c}1&2&-1&1&1\\2&4&-3&2&2\\3&6&-4&3&3\end{array}\right]
$$

读一遍：竖线只是提醒，右边那列是等号右边的数，不是某个未知数的系数；消元必须整行一起动，右边跟着变，解才不会错。这张表对应 $x_1$–$x_4$ 四个未知数，下面从头用到尾。

允许对这张表做的三件事，叫**初等行变换**：

| 变换 | 记号 | 为什么解集不变 |
| --- | --- | --- |
| 交换两行 | $R_i\leftrightarrow R_j$ | 换次序不改「同时成立」 |
| 某行乘非零数 $k$ | $R_i\leftarrow kR_i$ | 同乘非零数，能除回去 |
| 某行加另一行的 $k$ 倍 | $R_i\leftarrow R_i+kR_j$ | 等量替换，能减回去 |

三种都可逆，走完整条流水线解集不变。另有对列做同样动作的列变换，解方程组时不用：列一动，未知数与列的对应就乱了，而这里判定全靠「第几列是第几个未知数」。

初等矩阵先认个名字：单位矩阵做一次初等变换得到的表。用它左乘 $A$，等于对 $A$ 做一次同样的行变换。例如

$$
\begin{bmatrix}1&0&0\\2&1&0\\0&0&1\end{bmatrix}
\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}
=\begin{bmatrix}1&2&3\\2&5&10\\5&6&0\end{bmatrix}
$$

第 2 行正是「原来的第 2 行加第 1 行的 $2$ 倍」。用处只有一句：行变换能写成乘法，「可逆变换不改变秩」就能靠它论证。认得这个词就够了。

## 二、化成阶梯形，主元个数就是秩

要化成的形状叫**行阶梯形**：全零行在最下面；每个非零行从左往右第一个非零数所在的列，随行数增加严格右移。那个数叫**主元**。再收两条，主元都等于 $1$、主元所在列其余位置全是 $0$，就叫**行最简形**。

化阶梯形四步，走熟了不看也能走：

1. 定位：当前列从当前行往下，找第一个非零数；
2. 换行：把含它的那一行换到当前行，挑 $1$ 或小整数当主元，口算方便；
3. 消：用主元把当前列下面的数全消成 $0$；
4. 前进：下移一行、右移一列，回到第 1 步。

拿前面那张表走一遍（$R_i$ 表示第 $i$ 行）：

$$
[A\mid\mathbf b]\xrightarrow{R_2-2R_1,\ R_3-3R_1}
\left[\begin{array}{cccc|c}1&2&-1&1&1\\0&0&-1&0&0\\0&0&-1&0&0\end{array}\right]
\xrightarrow{R_3-R_2}
\left[\begin{array}{cccc|c}1&2&-1&1&1\\0&0&-1&0&0\\0&0&0&0&0\end{array}\right]
$$

主元落在第 1 列和第 3 列，共 $2$ 个。

**秩**的定义是这样：矩阵里非零子式的最高阶数叫矩阵的秩，记 $r(A)$。子式就是任取 $k$ 行 $k$ 列、交叉处那些数按原位置组成的 $k$ 阶行列式，也就是上一页算的那种。这个定义只是让你在教材上读得懂，算的时候不用它：把表化成阶梯形，主元的个数就是秩，上面那张表的 $r(A)=2$。

为什么能这样数？阶梯形里每个主元独占一行，主元数等于非零行数，而每步都是可逆变换、秩不变。范围 $0\le r(A)\le\min(m,n)$，取到上界叫满秩。

<FigBox title="行阶梯形与行最简形：主元画圈，阶梯线逐行右移" kind="结构" hint="左边是阶梯形，主元在第一、三列，末行全 0；右边把主元上方也清成 0，就是最简形。" note="两种形状的非零行数相同，都等于秩 2。看完该看出差别只在主元列有没有清到底：最简形每行能直接读出一个未知数。">
<svg viewBox="0 0 720 250" class="sf" role="img" aria-label="行阶梯形与行最简形对比：左侧主元在第一与第三列、末行全零；右侧主元列上下都清成零">
  <defs>
    <marker id="c03-f1-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <text x="34" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="70" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">消完的阶梯形</text>
  <text x="330" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="366" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">主元列往上也清 0</text>
  <text x="580" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <text x="616" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">行最简形</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="60" y1="70" x2="290" y2="70"/><line x1="60" y1="120" x2="290" y2="120"/>
    <line x1="60" y1="170" x2="290" y2="170"/><line x1="60" y1="220" x2="290" y2="220"/>
    <line x1="60" y1="70" x2="60" y2="220"/><line x1="106" y1="70" x2="106" y2="220"/>
    <line x1="152" y1="70" x2="152" y2="220"/><line x1="198" y1="70" x2="198" y2="220"/>
    <line x1="244" y1="70" x2="244" y2="220"/><line x1="290" y1="70" x2="290" y2="220"/>
  </g>
  <line x1="66" y1="76" x2="66" y2="214" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="244" y1="70" x2="244" y2="220" stroke="var(--vp-c-text-2)" stroke-width="2.4"/>
  <g font-size="14" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="83" y="99">1</text><text x="129" y="99">2</text><text x="175" y="99">−1</text><text x="221" y="99">1</text><text x="267" y="99">1</text>
    <text x="83" y="149">0</text><text x="129" y="149">0</text><text x="175" y="149">−1</text><text x="221" y="149">0</text><text x="267" y="149">0</text>
    <text x="83" y="199">0</text><text x="129" y="199">0</text><text x="175" y="199">0</text><text x="221" y="199">0</text><text x="267" y="199">0</text>
  </g>
  <circle cx="83" cy="93" r="13" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6"/>
  <circle cx="175" cy="143" r="13" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6"/>
  <polyline points="68,86 90,86 90,136 160,136 160,186 200,186" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.2" stroke-dasharray="5 3"/>
  <line x1="308" y1="145" x2="344" y2="145" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f1-arrow)"/>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="380" y1="70" x2="610" y2="70"/><line x1="380" y1="120" x2="610" y2="120"/>
    <line x1="380" y1="170" x2="610" y2="170"/><line x1="380" y1="220" x2="610" y2="220"/>
    <line x1="380" y1="70" x2="380" y2="220"/><line x1="426" y1="70" x2="426" y2="220"/>
    <line x1="472" y1="70" x2="472" y2="220"/><line x1="518" y1="70" x2="518" y2="220"/>
    <line x1="564" y1="70" x2="564" y2="220"/><line x1="610" y1="70" x2="610" y2="220"/>
  </g>
  <line x1="564" y1="70" x2="564" y2="220" stroke="var(--vp-c-text-2)" stroke-width="2.4"/>
  <g font-size="14" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="403" y="99">1</text><text x="449" y="99">2</text><text x="495" y="99">0</text><text x="541" y="99">1</text><text x="587" y="99">1</text>
    <text x="403" y="149">0</text><text x="449" y="149">0</text><text x="495" y="149">1</text><text x="541" y="149">0</text><text x="587" y="149">0</text>
    <text x="403" y="199">0</text><text x="449" y="199">0</text><text x="495" y="199">0</text><text x="541" y="199">0</text><text x="587" y="199">0</text>
  </g>
  <circle cx="403" cy="93" r="13" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6"/>
  <circle cx="495" cy="143" r="13" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1.6"/>
  <text x="345" y="240" font-size="11.5" fill="var(--vp-c-text-3)" text-anchor="middle" class="sf-t">左：主元 2 个 → 秩 2 · 右：主变量 x1、x3 直接读出</text>
</svg>
</FigBox>

## 三、判解：两个秩一比，三种结局

对 $n$ 个未知数的方程组 $A\mathbf x=\mathbf b$（$A$ 是 $m\times n$）：先把增广矩阵化成阶梯形，再比较两个秩。

- $r(A)<r(A\mid\mathbf b)$：增广矩阵多出一个非零行，这一行读出来是 $0=k$（$k\ne0$），矛盾，无解；
- $r(A)=r(A\mid\mathbf b)=n$：每个未知数都被一个主元管住，唯一解；
- $r(A)=r(A\mid\mathbf b)=r<n$：有 $n-r$ 列没有主元，对应未知数可以随便取，无穷多解，自由度 $n-r$。

自由度为什么是 $n-r$？表有 $n$ 列（$n$ 个未知数），主元列恰好 $r$ 个，剩下 $n-r$ 个非主元列对应的未知数没人约束、可以自由取值，另外 $r$ 个由主元列唯一定出。主元数加自由变量数等于未知数个数，这条恒等式就是 $n-r$ 的全部来源。

同一张系数表配不同右端，结局会变，这也是 $0=k$ 唯一可能出现的地方。取 $A=\begin{bmatrix}1&2&3\\2&4&6\\1&1&1\end{bmatrix}$：

- $\mathbf b=(1,2,1)$：$R_2-2R_1$ 得全零行，$R_3-R_1$ 得 $(0,-1,-2\mid0)$，两秩都是 $2$、$n=3$，无穷多解（$z$ 自由，$x=1+z$、$y=-2z$）；
- $\mathbf b=(1,3,1)$：$R_2-2R_1$ 得 $(0,0,0\mid1)$ 即 $0=1$，$r(A)=2<r(A\mid\mathbf b)=3$，无解。

<FigBox title="判解：先化阶梯形，再比两个秩" kind="结构" hint="从增广矩阵出发，化成阶梯形后分别数两个秩。" note="两个秩不相等就没有解，因为某行会读出 0=k。看完该看出相等时还得跟 n 比一次：等于 n 唯一解，小于 n 无穷多解，自由度 n−r。">
<svg viewBox="0 0 720 300" class="sf" role="img" aria-label="判解流程图：化阶梯形后比较系数矩阵与增广矩阵的秩，分三种结局">
  <defs>
    <marker id="c03-f2-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <text x="30" y="30" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="66" y="30" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">增广矩阵 [A|b]</text>
  <text x="250" y="30" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="286" y="30" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">化阶梯形、数两个秩</text>
  <text x="540" y="30" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <rect x="30" y="52" width="180" height="56" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.4"/>
  <text x="120" y="86" font-size="13" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">[A | b]</text>
  <line x1="216" y1="80" x2="262" y2="80" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f2-arrow)"/>
  <rect x="268" y="52" width="196" height="56" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
  <text x="366" y="78" font-size="12.5" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">化成行阶梯形</text>
  <text x="366" y="98" font-size="11.5" text-anchor="middle" fill="var(--vp-c-text-2)" class="sf-t">数 r(A) 与 r(A|b)</text>
  <line x1="366" y1="112" x2="366" y2="140" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f2-arrow)"/>
  <rect x="252" y="146" width="228" height="44" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
  <text x="366" y="173" font-size="12.5" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">r(A) ＝ r(A|b) 吗？</text>
  <line x1="252" y1="168" x2="196" y2="168" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f2-arrow)"/>
  <text x="224" y="160" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle" class="sf-t">不相等</text>
  <rect x="30" y="146" width="162" height="44" rx="10" fill="var(--vp-c-danger-1)" fill-opacity="0.10" stroke="var(--vp-c-danger-1)" stroke-width="1.4"/>
  <text x="111" y="166" font-size="12.5" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">无解</text>
  <text x="111" y="182" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-2)" class="sf-t">某行读出来 0 = k</text>
  <line x1="480" y1="168" x2="524" y2="168" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f2-arrow)"/>
  <text x="502" y="160" font-size="11" fill="var(--vp-c-text-2)" text-anchor="middle" class="sf-t">相等</text>
  <rect x="530" y="146" width="160" height="44" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.4"/>
  <text x="610" y="173" font-size="12" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">再跟 n 比一次</text>
  <line x1="610" y1="192" x2="610" y2="214" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f2-arrow)"/>
  <rect x="500" y="220" width="196" height="40" rx="10" fill="var(--vp-c-brand-1)" fill-opacity="0.10" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
  <text x="598" y="245" font-size="12" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">r ＝ n → 唯一解</text>
  <rect x="270" y="220" width="218" height="40" rx="10" fill="var(--vp-c-brand-1)" fill-opacity="0.10" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
  <text x="379" y="245" font-size="12" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">r ＜ n → 无穷多解（自由度 n−r）</text>
  <line x1="530" y1="240" x2="496" y2="240" stroke="var(--vp-c-text-2)" stroke-width="1.2" stroke-dasharray="4 3"/>
</svg>
</FigBox>

## 四、无穷多解怎么写全：一个特解 + 齐次解的几支

先把两类方程组分开：右端全 $0$ 的 $A\mathbf x=\mathbf 0$ 叫齐次方程组，它永远有解（全取 $0$ 就是）；$A\mathbf x=\mathbf b$ 叫非齐次。

把那张表继续往上清，得到行最简形：

$$
[A\mid\mathbf b]\to\left[\begin{array}{cccc|c}1&2&0&1&1\\0&0&1&0&0\\0&0&0&0&0\end{array}\right]
$$

读一遍：主元在第 1、3 列，所以 $x_1,x_3$ 是主变量，$x_2,x_4$ 是自由变量；第 1 行读出 $x_1+2x_2+x_4=1$，第 2 行读出 $x_3=0$。

往下三步，让自由变量轮流取 $1$、其余取 $0$。注意第 1 步代的是右端为 $(1,2,3)$ 的非齐次方程，后两步代的是右端全 $0$ 的齐次方程 $A\mathbf x=\mathbf 0$，主变量要用右端 $0$ 重算，不能沿用第 1 步的 1：

1. 特解（右端是 $(1,2,3)$）：自由变量全取 $0$，得 $x_1=1$、$x_3=0$，即 $\eta=(1,0,0,0)$；
2. 第一支（右端全 $0$）：$x_2=1$、$x_4=0$，由 $x_1+2x_2+x_4=0$ 得 $x_1=-2$，即 $\xi_1=(-2,1,0,0)$；
3. 第二支（右端全 $0$）：$x_2=0$、$x_4=1$，同样由 $x_1=-2x_2-x_4$ 得 $x_1=-1$，即 $\xi_2=(-1,0,0,1)$。

于是全部解可以写成一条式子：

$$
\mathbf x=(1,0,0,0)+c_1(-2,1,0,0)+c_2(-1,0,0,1)\qquad(c_1,c_2\ \text{任意})
$$

为什么是加？两个非齐次解相减，右端抵消，剩下的是齐次解；反过来特解加任何齐次解还是非齐次解，所以「所有非齐次解 = 一个特解 + 所有齐次解」。教材把 $\xi_1,\xi_2$ 这两支叫**基础解系**：齐次方程的一组「谁也凑不出谁」的解，由它们能拼出齐次方程的全部解。这里为了不提前用第 4 章的词，只叫「齐次解的两支」；这两支为什么够用、为什么彼此凑不出对方，第 4 章才正式证明。看到教材上「基础解系」四个字，回来对上它们即可。

## 五、顺带：同一套行变换还能求逆

把 $A$ 和单位阵并排放成 $(A\mid E)$，只做行变换把左半化成 $E$，右半就自动变成 $A^{-1}$。为什么？每步行变换都是左乘一个可逆矩阵，把 $A$ 变成 $E$ 的那串乘法的积按定义就是 $A^{-1}$，它作用在 $E$ 上就是右半。

用上一章那张 $M$ 走一遍（上一章已算出 $\lvert M\rvert=1$、$M^{-1}=M^*$，正好互验）：

$$
\left[\begin{array}{ccc|ccc}1&2&3&1&0&0\\0&1&4&0&1&0\\5&6&0&0&0&1\end{array}\right]
\xrightarrow{R_3-5R_1}
\left[\begin{array}{ccc|ccc}1&2&3&1&0&0\\0&1&4&0&1&0\\0&-4&-15&-5&0&1\end{array}\right]
\xrightarrow{R_3+4R_2}
\left[\begin{array}{ccc|ccc}1&2&3&1&0&0\\0&1&4&0&1&0\\0&0&1&-5&4&1\end{array}\right]
$$

再依次 $R_2-4R_3$、$R_1-3R_3$、$R_1-2R_2$，把主元上方的数也清干净：

$$
\to\left[\begin{array}{ccc|ccc}1&0&0&-24&18&5\\0&1&0&20&-15&-4\\0&0&1&-5&4&1\end{array}\right]
$$

右半正是上一章的 $M^*$。两条完全不同的路算出同一张表，这就是最好的核对。

<FigBox title="并排做行变换：(A | E) 化到 (E | A⁻¹)" kind="结构" hint="竖线左边是 A，右边贴着单位阵 E，只做行变换。" note="左右同步变化，把 A 变成 E 的那串动作作用在 E 上，就得到逆矩阵。看完该看出右半与上一章的伴随矩阵一模一样，两条路互验。">
<svg viewBox="0 0 720 250" class="sf" role="img" aria-label="把 A 与单位阵并排后只用行变换，左半化成单位阵的同时右半变成逆矩阵">
  <defs>
      <marker id="c03-f3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
      </marker>
    </defs>
  <text x="34" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="70" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">(A | E)</text>
  <text x="330" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="366" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">只做行变换</text>
  <text x="540" y="34" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <text x="576" y="34" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">(E | A⁻¹)</text>
  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="30" y1="76" x2="306" y2="76"/><line x1="30" y1="116" x2="306" y2="116"/>
    <line x1="30" y1="156" x2="306" y2="156"/><line x1="30" y1="196" x2="306" y2="196"/>
    <line x1="30" y1="76" x2="30" y2="196"/><line x1="76" y1="76" x2="76" y2="196"/>
    <line x1="122" y1="76" x2="122" y2="196"/><line x1="168" y1="76" x2="168" y2="196"/>
    <line x1="214" y1="76" x2="214" y2="196"/><line x1="260" y1="76" x2="260" y2="196"/>
    <line x1="306" y1="76" x2="306" y2="196"/>
  </g>
  <line x1="168" y1="76" x2="168" y2="196" stroke="var(--vp-c-text-2)" stroke-width="2.4"/>
  <g font-size="13" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="53" y="101">1</text><text x="99" y="101">2</text><text x="145" y="101">3</text>
    <text x="191" y="101">1</text><text x="237" y="101">0</text><text x="283" y="101">0</text>
    <text x="53" y="141">0</text><text x="99" y="141">1</text><text x="145" y="141">4</text>
    <text x="191" y="141">0</text><text x="237" y="141">1</text><text x="283" y="141">0</text>
    <text x="53" y="181">5</text><text x="99" y="181">6</text><text x="145" y="181">0</text>
    <text x="191" y="181">0</text><text x="237" y="181">0</text><text x="283" y="181">1</text>
  </g>
  <line x1="316" y1="136" x2="352" y2="136" stroke="var(--vp-c-text-2)" stroke-width="1.6" marker-end="url(#c03-f3-arrow)"/>

  <g stroke="var(--vp-c-divider)" stroke-width="1" fill="none">
    <line x1="392" y1="76" x2="668" y2="76"/><line x1="392" y1="116" x2="668" y2="116"/>
    <line x1="392" y1="156" x2="668" y2="156"/><line x1="392" y1="196" x2="668" y2="196"/>
    <line x1="392" y1="76" x2="392" y2="196"/><line x1="438" y1="76" x2="438" y2="196"/>
    <line x1="484" y1="76" x2="484" y2="196"/><line x1="530" y1="76" x2="530" y2="196"/>
    <line x1="576" y1="76" x2="576" y2="196"/><line x1="622" y1="76" x2="622" y2="196"/>
    <line x1="668" y1="76" x2="668" y2="196"/>
  </g>
  <line x1="530" y1="76" x2="530" y2="196" stroke="var(--vp-c-text-2)" stroke-width="2.4"/>
  <g font-size="13" text-anchor="middle" fill="var(--vp-c-text-1)" class="sf-t">
    <text x="415" y="101">1</text><text x="461" y="101">0</text><text x="507" y="101">0</text>
    <text x="553" y="101">−24</text><text x="599" y="101">18</text><text x="645" y="101">5</text>
    <text x="415" y="141">0</text><text x="461" y="141">1</text><text x="507" y="141">0</text>
    <text x="553" y="141">20</text><text x="599" y="141">−15</text><text x="645" y="141">−4</text>
    <text x="415" y="181">0</text><text x="461" y="181">0</text><text x="507" y="181">1</text>
    <text x="553" y="181">−5</text><text x="599" y="181">4</text><text x="645" y="181">1</text>
  </g>
  <text x="360" y="230" font-size="11.5" fill="var(--vp-c-text-3)" text-anchor="middle" class="sf-t">行变换序列：R₃−5R₁ → R₃＋4R₂ → R₂−4R₃ → R₁−3R₃ → R₁−2R₂</text>
</svg>
</FigBox>

## 例题

::: tip 例 1 · 化阶梯形，数秩
题目：求 $A=\begin{bmatrix}1&2&3&4\\1&3&5&7\\2&5&8&11\end{bmatrix}$ 的秩。

先猜：第 3 行像是前两行加起来（$1+1=2$、$2+3=5$、$3+5=8$、$4+7=11$）；若如此，消完末行会变全零，秩应当是 $2$。

再算：$R_2-R_1$ 得 $(0,1,2,3)$，$R_3-2R_1$ 得 $(0,1,2,3)$，再 $R_3-R_2$ 得全零行：

$$
\begin{bmatrix}1&2&3&4\\1&3&5&7\\2&5&8&11\end{bmatrix}
\xrightarrow{R_2-R_1,\ R_3-2R_1}
\begin{bmatrix}1&2&3&4\\0&1&2&3\\0&1&2&3\end{bmatrix}
\xrightarrow{R_3-R_2}
\begin{bmatrix}1&2&3&4\\0&1&2&3\\0&0&0&0\end{bmatrix}
$$

主元两个，$r(A)=2$。

*（为什么能这么数：每步都是可逆行变换，秩不变；阶梯形里主元个数就是非零行数。）*

再回代：用子式核一遍。第 1、2 行与第 1、2 列组成的 $\begin{vmatrix}1&2\\1&3\end{vmatrix}=1\ne0$，二阶非零子式存在；三阶子式只能取这三行，而第 3 行是前两行之和，所以全是 $0$。最高非零子式 2 阶，与阶梯形一致。
:::

::: tip 例 2 · 判唯一解并求解
题目：解方程组 $\begin{cases}x+y+z=6\\ x-y+z=2\\ x+y-z=0\end{cases}$。

先猜：三个方程互相独立（第 2 式含 $-y$、第 3 式含 $-z$，都不是别式的倍数），系数表多半满秩，$r=n=3$ 该唯一解。

再算：

$$
\left[\begin{array}{ccc|c}1&1&1&6\\1&-1&1&2\\1&1&-1&0\end{array}\right]
\xrightarrow{R_2-R_1,\ R_3-R_1}
\left[\begin{array}{ccc|c}1&1&1&6\\0&-2&0&-4\\0&0&-2&-6\end{array}\right]
$$

三个主元，$r(A)=r(A\mid\mathbf b)=3=n$，唯一解。由最后一行 $-2z=-6$ 得 $z=3$，第二行 $-2y=-4$ 得 $y=2$，代回第一行 $x+2+3=6$ 得 $x=1$。

*（为什么从下往上代：最下面那行只含一个新未知数，解出来才能喂给上一行。）*

再回代：把 $(1,2,3)$ 代回原方程，$1+2+3=6$、$1-2+3=2$、$1+2-3=0$，三式全成立。
:::

::: tip 例 3 · 无穷多解，写通解
题目：求前面那张表对应方程组的全部解：

$$
\begin{cases}x_1+2x_2-x_3+x_4=1\\ 2x_1+4x_2-3x_3+2x_4=2\\ 3x_1+6x_2-4x_3+3x_4=3\end{cases}
$$

先猜：第 2、3 行像是第 1 行改了一点，秩应小于 3；右端也跟着改（$2$、$3$），两秩很可能相等。

再算：化成阶梯形与最简形，第二节已经走完：

$$
\left[\begin{array}{cccc|c}1&2&0&1&1\\0&0&1&0&0\\0&0&0&0&0\end{array}\right]
$$

两秩相等且 $r=2$，$n=4$，所以无穷多解，自由度 $4-2=2$；主变量 $x_1,x_3$，自由变量 $x_2,x_4$。按第四节的三步取特解 $\eta=(1,0,0,0)$、$\xi_1=(-2,1,0,0)$、$\xi_2=(-1,0,0,1)$，得

$$
\mathbf x=(1,0,0,0)+c_1(-2,1,0,0)+c_2(-1,0,0,1)
$$

*（为什么这样取：自由变量轮流取 $1$，每支只在一个自由变量上有分量。）*

再回代：取 $c_1=3$、$c_2=5$ 得 $x=(-10,3,0,5)$，代回原方程组：$-10+6+0+5=1$、$-20+12+0+10=2$、$-30+18+0+15=3$，三式都对；$\xi_1,\xi_2$ 代进齐次方程也都得 $(0,0,0)$。
:::

## 一条流水线，四步走完

这几类题最后都归到同一个动作：把表化成阶梯形，然后数主元。$r(A)=r(A\mid\mathbf b)$ 才有解，而且 $=n$ 唯一解、$<n$ 无穷多解、自由度 $n-r$。以那张 4 个未知数、2 个主元的表为例，自由度就是 $4-2=2$，全部解就是把自由变量轮流取 $1$ 凑出的那几支，加 1 支特解，任意组合。

四步里最费神的是第 1 步和第 3 步：第 1 步定位找错主元，后面全歪；第 3 步消的时候忘了整行一起动，右端就错了。求逆是同一套动作的副产物：$(A\mid E)$ 化到 $(E\mid A^{-1})$，左半变单位阵，右半自己就成了逆。行变换是唯一被允许的动作，列只在认名字时出现过一次，之后就再也没动过。

下一步是 [04 · 向量组的线性相关性](./04-vectors)：这里数出的秩、写出的那几支齐次解，到那里换成向量组的语言再讲一遍。想从几何上看「$0=k$ 为什么就是方程打架」，读现代版第 3 章 [03 · 高斯消元与线性方程组](../linalg/03-elimination)。
