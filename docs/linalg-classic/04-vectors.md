---
title: 04 · 向量组的线性相关性
description: 同济第四章的走法：一捆向量里有没有白搭的那一支，用齐次方程、主元个数、行列式三档判法判定，再挑出极大无关组，把秩、基、维数落到同一个数上。
---

# 04 · 向量组的线性相关性

<Meta time="30 min" level="核心" note="最容易错的两处：把线性无关当成『两两不成比例』；求极大无关组时从阶梯形里取列，而不是回原矩阵按主元列号取" />

取四个三维向量摆成一捆：$\gamma_1=(1,1,0)^T$、$\gamma_2=(0,1,1)^T$、$\gamma_3=(1,0,1)^T$、$\gamma_4=(2,2,2)^T$。光看坐标串看不出关系，那就给每个配一个数，加起来试试：

$$
\gamma_1+\gamma_2+\gamma_3=(1+0+1,\ 1+1+0,\ 0+1+1)^T=(2,2,2)^T=\gamma_4
$$

结果正好落在 $\gamma_4$ 上。第四支不是新东西，它是前三个加起来的结果。这种「每个向量乘一个数再全部加起来」的动作，叫这组向量的一个线性组合。把 $\gamma_4$ 挪到左边：

$$
\gamma_1+\gamma_2+\gamma_3-\gamma_4=\mathbf 0
$$

四个系数 $(1,1,1,-1)$ 里至少有一个不是零，却把这一捆凑成了零向量。一捆向量能自己互相抵消，就叫**线性相关**：存在不全为零的系数 $k_1,\dots,k_m$，使 $k_1\alpha_1+\cdots+k_m\alpha_m=\mathbf 0$。反过来，只有「系数全取零」这一种凑法，就叫**线性无关**，也就是没有一支是白搭的。上一章那两支解向量 $\xi_1,\xi_2$「彼此凑不出对方」，说的就是它们无关。

一个偷懒的理解要挡住：线性相关不等于「有两个向量成比例」。上面这捆没有两个成比例，照样相关，成比例只是最简单的一种。

跟课堂进度的话，这页对应同济《线性代数》第四章「向量组的线性相关性」。

::: tip 读这页之前
化行阶梯形、数主元得会（[03 · 矩阵的初等变换与线性方程组](03-elementary.md)），$A\mathbf x=\mathbf 0$ 何时有非零解也在那一页；行列式怎么算见 [01 · 行列式](01-determinant.md)。

记号：向量写成一列数，$\alpha_1=(1,1,0)^T$ 就是 $\begin{bmatrix}1\\1\\0\end{bmatrix}$；$m$ 是向量个数，$n$ 是分量个数；$r(A)$ 是矩阵的秩，$r(\alpha_1,\dots,\alpha_m)$ 是向量组的秩。
:::

<FigBox title="相关与无关：两支箭在不在同一条过原点的直线上" kind="几何" note="左图 v=2u，两支同线，1·v−2·u=0 的系数不全为零；右图 p、q 不同线，只有 0·p+0·q=0 这一种凑法。看完该看出相关的判据就是「能不能凑出零向量」，同线只是它最直观的一种长相。">
<svg viewBox="0 0 480 288" role="img" aria-label="左图两个共线向量线性相关，右图两个不共线向量线性无关">
  <defs>
    <marker id="c4f1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)"/>
    </marker>
    <marker id="c4f2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)"/>
    </marker>
  </defs>
  <text x="130" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="var(--vp-c-text-1)">左：v 是 u 的两倍（相关）</text>
  <text x="360" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="var(--vp-c-text-1)">右：两支不成倍数（无关）</text>
  <line x1="20" y1="186" x2="235" y2="186" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="42" y1="206" x2="42" y2="42" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="42" y1="186" x2="96" y2="132" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#c4f1)"/>
  <line x1="42" y1="186" x2="150" y2="78" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#c4f1)"/>
  <circle cx="42" cy="186" r="2.6" fill="var(--vp-c-text-2)"/>
  <text x="106" y="148" font-size="12.5" fill="var(--vp-c-brand-1)">u</text>
  <text x="154" y="74" font-size="12.5" fill="var(--vp-c-brand-1)">v=2u</text>
  <text x="128" y="208" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-3)">1·v−2·u=0</text>
  <line x1="255" y1="186" x2="470" y2="186" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="285" y1="206" x2="285" y2="42" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="285" y1="186" x2="355" y2="158" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#c4f2)"/>
  <line x1="285" y1="186" x2="318" y2="94" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#c4f1)"/>
  <circle cx="285" cy="186" r="2.6" fill="var(--vp-c-text-2)"/>
  <text x="358" y="154" font-size="12.5" fill="var(--vp-c-brand-2)">p</text>
  <text x="322" y="90" font-size="12.5" fill="var(--vp-c-brand-1)">q</text>
  <text x="360" y="208" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-3)">只有 0·p+0·q=0</text>
  <line x1="20" y1="226" x2="470" y2="226" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="20" y="246" font-size="11.5" fill="var(--vp-c-text-2)">输入：两支箭，都从原点量起。</text>
  <text x="20" y="262" font-size="11.5" fill="var(--vp-c-text-2)">操作：看一支是不是另一支的倍数。</text>
  <text x="20" y="278" font-size="11.5" fill="var(--vp-c-text-2)">结果：左能凑出零向量，右不能。</text>
</svg>
</FigBox>

## 一、判相关：三个动作，一个比一个便宜

定义里那句「存在不全为零的系数」，最直接的判法是把它翻译成方程。把这些向量按列排成 $A=[\alpha_1\ \cdots\ \alpha_m]$，那么 $k_1\alpha_1+\cdots+k_m\alpha_m=\mathbf 0$ 就是

$$
A\mathbf x=\mathbf 0,\qquad \mathbf x=(k_1,\dots,k_m)^T
$$

读一遍：$A$ 有 $n$ 行 $m$ 列，行数是分量个数，列数是向量个数；$\mathbf x$ 是 $m$ 个数的一列，乘出来是 $n$ 个数的一列，和右端的 $\mathbf 0$ 对得上。于是「有没有不全为零的系数」变成「这个齐次方程组有没有非零解」，工具借第三章的。同一条翻译还管另一件事：$\beta$ 能不能由这捆向量表出，就是非齐次方程 $A\mathbf x=\beta$ 有没有解。

动作一，最保险也最慢：解 1 次齐次方程，像前面那 4 支向量，要一路化到 3 个主元才算完。拿上面那捆 $\gamma$ 来试：

$$
A=\begin{bmatrix}1&0&1&2\\1&1&0&2\\0&1&1&2\end{bmatrix}
\xrightarrow{R_2-R_1}\begin{bmatrix}1&0&1&2\\0&1&-1&0\\0&1&1&2\end{bmatrix}
\xrightarrow{R_3-R_2}\begin{bmatrix}1&0&1&2\\0&1&-1&0\\0&0&2&2\end{bmatrix}
$$

三个主元、四个未知数，还剩一个自由变量，所以有非零解，这捆相关。要写出系数：末行给 $x_4=-x_3$，取 $x_3=1$ 得 $x_4=-1$；中行给 $x_2=1$；首行给 $x_1=-x_3-2x_4=1$。于是 $\mathbf x=(1,1,1,-1)^T$，正是开头那个式子。

动作二，省一半事：只数主元，不解到底，第 1 步化完就能收工。主元个数就是秩 $r$，与向量个数 $m$ 比：$r<m$ 相关，$r=m$ 无关。理由很直白，主元 $r$ 个、未知数 $m$ 个，就有 $m-r$ 个自由变量。这里 $r=3$、$m=4$，直接相关。

动作三，最便宜，只在个数等于分量个数时能用：算 1 个行列式。当 $m=n$ 时 $A$ 是方阵，齐次方程有非零解等价于 $|A|=0$（$|A|$ 也写作 $\det A$）。用 2 个二维向量试：$\beta_1=(1,2)^T$、$\beta_2=(2,1)^T$ 排成 $\begin{bmatrix}1&2\\2&1\end{bmatrix}$，$|A|=1\times1-2\times2=-3\ne 0$，所以无关。凭的是第一章那条：$|A|\ne0$ 等价于齐次方程只有零解。

还有一条连算都不用：$m>n$ 时必定相关。$A$ 只有 $n$ 行、主元最多 $n$ 个，$r\le n<m$。

## 二、挑出骨架：为什么必须回原矩阵取列

一捆相关的向量里一定有白搭的。全挑掉之后剩下的一小撮要满足两条：自己无关，原捆里其余每一个都能由它表出。这样的部分组叫这捆向量的一个**极大无关组**。怎么找？主元在第几列，就回原矩阵取第几列：$\gamma$ 那捆的主元在第 1、2、3 列，所以 $\{\gamma_1,\gamma_2,\gamma_3\}$ 是一组。4 支里挑 3 支，多出来的那 1 支就是 $\gamma_4$。

为什么强调「回原矩阵」？初等行变换只动行，列与列之间的线性关系不变：阶梯形里第 4 列等于前 3 列之和，原矩阵里也一样；但阶梯形里的列已经被消元改过分量，不再是原来那些向量，拿它们当答案，答的不是题目问的那捆。所以要记的是主元列号。

极大无关组一般不唯一，$\{\gamma_1,\gamma_2,\gamma_4\}$ 也是一组；但不管取哪一组，里面的个数都是 3。三支箭首尾相接、落点与 $\gamma_4$ 重合，画的就是这件事。

<FigBox title="三支箭首尾相接，终点正是 γ₄ 的箭头尖" kind="几何" hint="γ₁、γ₂、γ₃ 都从原点画，后两支平行搬到前一支的尖上。" note="三支走完，落点与 γ₄ 的箭头尖重合。看完该看出第四支没带来新方向。图是三维到平面的线性投影，长度不代表坐标比例，但「三支投影相加 = γ₄ 投影」严格成立。">
<svg viewBox="0 0 720 380" class="sf" role="img" aria-label="三维到平面的线性投影中，γ1、γ2、γ3 首尾相接，终点正好落在 γ4 的箭头尖上">
  <defs>
    <marker id="c4f3a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)"/>
    </marker>
    <marker id="c4f3b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)"/>
    </marker>
    <marker id="c4f3c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-danger-1)"/>
    </marker>
    <marker id="c4f3d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-1)"/>
    </marker>
  </defs>
  <text x="350" y="40" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">输入</text>
  <text x="386" y="40" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">三支箭，都从原点画</text>
  <text x="350" y="76" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">操作</text>
  <text x="386" y="76" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">后两支搬到前一支的尖上</text>
  <text x="350" y="112" font-size="12.5" font-weight="700" fill="var(--vp-c-brand-1)" class="sf-t">结果</text>
  <text x="386" y="112" font-size="12.5" fill="var(--vp-c-text-2)" class="sf-t">终点落在 γ₄ 的箭头尖上</text>
  <line x1="60" y1="340" x2="330" y2="340" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="70" y1="350" x2="70" y2="60" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="70" y1="340" x2="210" y2="260" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#c4f3a)"/>
  <line x1="70" y1="340" x2="140" y2="220" stroke="var(--vp-c-brand-2)" stroke-width="2" marker-end="url(#c4f3b)"/>
  <line x1="70" y1="340" x2="90" y2="280" stroke="var(--vp-c-danger-1)" stroke-width="2" marker-end="url(#c4f3c)"/>
  <line x1="210" y1="260" x2="280" y2="140" stroke="var(--vp-c-brand-2)" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#c4f3b)"/>
  <line x1="280" y1="140" x2="300" y2="80" stroke="var(--vp-c-danger-1)" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#c4f3c)"/>
  <line x1="70" y1="340" x2="300" y2="80" stroke="var(--vp-c-text-1)" stroke-width="2.8" marker-end="url(#c4f3d)"/>
  <circle cx="70" cy="340" r="2.8" fill="var(--vp-c-text-2)"/>
  <circle cx="210" cy="260" r="3" fill="var(--vp-c-brand-1)"/>
  <circle cx="280" cy="140" r="3" fill="var(--vp-c-brand-2)"/>
  <circle cx="300" cy="80" r="4" fill="var(--vp-c-danger-1)"/>
  <text x="150" y="252" font-size="12.5" fill="var(--vp-c-brand-1)" class="sf-t">γ₁</text>
  <text x="112" y="212" font-size="12.5" fill="var(--vp-c-brand-2)" class="sf-t">γ₂</text>
  <text x="96" y="286" font-size="12.5" fill="var(--vp-c-danger-1)" class="sf-t">γ₃</text>
  <text x="196" y="200" font-size="11.5" fill="var(--vp-c-brand-2)" class="sf-t">γ₂ 搬到这里</text>
  <text x="236" y="120" font-size="11.5" fill="var(--vp-c-danger-1)" class="sf-t">γ₃ 搬到这里</text>
  <text x="240" y="66" font-size="11.5" fill="var(--vp-c-text-1)" class="sf-t">落点 = γ₄ 的尖</text>
  <text x="350" y="170" font-size="12.5" font-weight="700" fill="var(--vp-c-text-1)" class="sf-t">γ₄ = γ₁＋γ₂＋γ₃ = (2,2,2)</text>
  <text x="350" y="204" font-size="12" fill="var(--vp-c-text-2)" class="sf-t">γ₄ 被前三支凑出来了。</text>
  <line x1="350" y1="228" x2="700" y2="228" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="350" y="250" font-size="11.5" fill="var(--vp-c-text-3)" class="sf-t">（线性投影示意，长度不代表比例）</text>
</svg>
</FigBox>

## 三、向量组的秩：一个数，三种问法

极大无关组里向量的个数，叫这捆向量的**秩**，记 $r(\alpha_1,\dots,\alpha_m)$。它不随选哪一组变，所以能代表这捆向量本身，并且和第三章矩阵的秩是同一个数：

$$
r(\alpha_1,\dots,\alpha_m)=r(A),\qquad A=[\alpha_1\ \cdots\ \alpha_m]
$$

读一遍：右边是矩阵化成阶梯形后数出来的主元个数，左边是极大无关组里向量的支数。两者相等，因为动作二数主元数的正是「最多能挑出几支无关的列」。所以那个数一次答了三个问题：矩阵的秩、向量组的秩、极大无关组有几支。

最后一个问题：这捆向量撑起了多大一块空间？把系数放开，$k_1\alpha_1+\cdots+k_m\alpha_m$ 能取到的全部向量凑成一个集合，叫这组向量张成的子空间；它的一组不多不少的向量叫**基**，基里向量的个数叫**维数**。$\gamma_1,\gamma_2,\gamma_3$ 有 3 个分量又彼此无关，能张成整个 $\mathbb R^3$，所以它们是 $\mathbb R^3$ 的一组基，维数是 3。三个名字、一个数：

$$
\dim\operatorname{span}\{\alpha_1,\dots,\alpha_m\}=r(\alpha_1,\dots,\alpha_m)=r(A)
$$

左边是子空间的维数，中间是向量组的秩，右边是矩阵的秩。算的时候只做一件事：按列排、化阶梯形、数主元。

## 例题

::: tip 例 1 · 三个二维向量：先秒杀，再走完动作 {#ex-vec-1}
题目：判断 $\alpha_1=(1,2)^T$、$\alpha_2=(2,4)^T$、$\alpha_3=(1,1)^T$ 是否线性相关；若相关，给出一组不全为零的系数。

<FigBox title="例 1：平面里塞三个向量，必有一支冗余" kind="几何" note="红的两支共线，虚线是 α₁=(1,2) 的两倍 α₂=(2,4)，蓝色那支 α₃=(1,1) 指向别处。看完该看出二维里最多 2 支互相独立，第 3 支只能是白搭的。">
<svg viewBox="0 0 440 236" role="img" aria-label="三个二维向量，其中两支共线，第三支指向别处">
  <defs>
    <marker id="c4f4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)"/>
    </marker>
  </defs>
  <line x1="40" y1="160" x2="420" y2="160" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="70" y1="190" x2="70" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <line x1="70" y1="160" x2="98" y2="104" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#c4f4)"/>
  <line x1="70" y1="160" x2="126" y2="48" stroke="var(--vp-c-brand-1)" stroke-width="2.2" stroke-dasharray="6 4" marker-end="url(#c4f4)"/>
  <line x1="70" y1="160" x2="98" y2="132" stroke="var(--vp-c-brand-2)" stroke-width="2.6" marker-end="url(#c4f4)"/>
  <circle cx="70" cy="160" r="2.8" fill="var(--vp-c-text-2)"/>
  <text x="74" y="90" font-size="12.5" fill="var(--vp-c-brand-1)">α₁</text>
  <text x="130" y="42" font-size="12.5" fill="var(--vp-c-brand-1)">α₂=2α₁</text>
  <text x="102" y="142" font-size="12.5" fill="var(--vp-c-brand-2)">α₃</text>
  <line x1="20" y1="194" x2="420" y2="194" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="20" y="212" font-size="11.5" fill="var(--vp-c-text-2)">输入：三个二维向量，个数多于分量个数。</text>
  <text x="20" y="228" font-size="11.5" fill="var(--vp-c-text-2)">操作：找倍数关系。结果：α₂=2α₁，α₂ 白搭。</text>
</svg>
</FigBox>

先猜：个数多于分量个数，不用算就是相关；$(2,4)$ 是 $(1,2)$ 的两倍，猜 $\alpha_2=2\alpha_1$。

再算：按列排成矩阵，第二行减第一行的两倍：

$$
A=\begin{bmatrix}1&2&1\\2&4&1\end{bmatrix}
\xrightarrow{R_2-2R_1}\begin{bmatrix}1&2&1\\0&0&-1\end{bmatrix}
$$

*（为什么只做一次行变换：阶梯形只要求主元逐行右移，第二行第一个非零元已落在第 3 列。）* 主元在第 1、3 列，$r=2$，向量个数 $m=3$，$r<m$，相关。

再回代：第二行给 $-x_3=0$；第一行给 $x_1+2x_2+x_3=0$，取 $x_2=1$ 得 $x_1=-2$。于是 $-2\alpha_1+\alpha_2=\mathbf 0$，系数 $(-2,1,0)$ 不全为零。代回去：$-2(1,2)+(2,4)=(0,0)$，与猜测一致。极大无关组由主元列读出：$\{\alpha_1,\alpha_3\}$。
:::

::: tip 例 2 · 个数等于分量个数：行列式一票定 {#ex-vec-2}
题目：判断 $\gamma_1=(1,1,0)^T$、$\gamma_2=(0,1,1)^T$、$\gamma_3=(1,0,1)^T$ 是否线性无关。

先猜：个数正好等于分量个数，可以用动作三；三支各有位置取 0，像坐标轴的错位版，猜无关。

再算：按列排成方阵，按第一章的第一行展开（第一行有个 0，挑它省一次乘法）：

$$
B=\begin{bmatrix}1&0&1\\1&1&0\\0&1&1\end{bmatrix},\qquad
|B|=1\cdot\begin{vmatrix}1&0\\1&1\end{vmatrix}-0+1\cdot\begin{vmatrix}1&1\\0&1\end{vmatrix}=1+1=2
$$

$|B|=2\ne0$，所以三支线性无关。

再回代：换动作二核对，前面那份阶梯形的前三列正好三个主元，与 $|B|\ne0$ 一致。三支三维向量无关，它们是 $\mathbb R^3$ 的一组基，维数是 3。
:::

::: tip 例 3 · 同一捆向量：求极大无关组与秩 {#ex-vec-3}
题目：对 $\gamma_1,\gamma_2,\gamma_3,\gamma_4$ 求一个极大无关组，写出其余向量由它表出的式子，并给出向量组的秩。

先猜：4 支三维向量必相关（$m=4>n=3$），骨架最多 3 支；前面主元落在第 1、2、3 列，猜极大无关组是 $\{\gamma_1,\gamma_2,\gamma_3\}$。

再算：沿用那份阶梯形，主元在第 1、2、3 列。记住列号，回原矩阵取第 1、2、3 列，得 $\{\gamma_1,\gamma_2,\gamma_3\}$，秩 $r=3$。*（为什么不取第 4 列：它在阶梯形里没有主元，说明是前面几列的组合。）*

再回代：表出式由开头给出，$\gamma_4=\gamma_1+\gamma_2+\gamma_3$。代回去：$(1,1,0)+(0,1,1)+(1,0,1)=(2,2,2)=\gamma_4$，成立。$\{\gamma_1,\gamma_2,\gamma_4\}$ 也能用（$\gamma_3=\gamma_4-\gamma_1-\gamma_2$），个数仍是 3。
:::

## 一句话判据，三档速度

判相关这件事，从头到尾只有一个判据：$A\mathbf x=\mathbf 0$ 除了零解还有没有别的解。三种动作只是同一个判据的三档速度：老老实实解方程、数主元跟 $m$ 比、方阵时算行列式。挑骨架时记住列号要回原矩阵取，那一撮的个数就是秩，也等于基的个数、张成空间的维数。

两个坑，都在这页出现过：

- 从阶梯形里取那几列当极大无关组。那些列的分量已经被消元改过，不再是题目给的那捆；只记主元列号，回原矩阵取。
- 把「线性无关」当成「两两不成比例」。$\gamma$ 就是反例，没有两支成比例，照样相关。

下一站是[05 · 特征值与特征向量](05-eigen.md)：那里把「$A\mathbf x$ 与 $\mathbf x$ 只差一个倍数」翻译成齐次方程组，用的正是这一页的第一个动作。想看懂向量、张成、子空间的画面，翻现代版 [04 · 向量空间与四大子空间](../linalg/04-subspaces)。
