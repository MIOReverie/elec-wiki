---
title: 07 · 正交、投影与二次型
description: 把「角度」请回来：点积量垂直，垂足是最近点，把 b 投到 A 的列空间就得到最小二乘的法方程；再往前一步，同一套「垂直」判一个二次型是碗还是马鞍，正定等价于特征值全正、顺序主子式全正。
---

# 07 · 正交、投影与二次型

<Meta time="24 min" level="核心" note="最容易错的是把投影当成「斜着照的影子」——投影是垂足，误差必须与目标空间垂直；判正定也别只看矩阵元素是不是都正" />

**这一页要解决什么**：前面几页把「位置」和「方向不变」都讲完了，但一直没量过角度。这一页把角度请回来：两个方向怎么算垂直、一支箭怎么垂直砸到直线或平面上、方程组无解时怎么找「最接近的解」。最后用同一套垂直关系，判断一类「只有平方项和交叉项」的式子画出来是碗还是马鞍。

::: tip 读之前
- **需要会**：向量的坐标、几支箭按系数拼起来（[第 1 章](01-vectors.md)）。一句复习：$\mathbf x=(x_1,x_2)$ 就是一列数，加法与数乘都是逐分量做的。
- **需要会**：转置 $A^T$ 是把第 $i$ 行变成第 $i$ 列（[第 2 章](02-matrices.md)）；列空间是 $A$ 能到达的所有位置（[第 4 章](04-subspaces.md)）。一句复习：$A\mathbf x=\mathbf b$ 无解，就说明 $\mathbf b$ 不在列空间里。
- **需要会**：特征值与对角化（[第 6 章](06-eigenvalues.md)）。一句补充（第 6 章没讲，本页直接用它）：实对称矩阵的特征值都是实数；对本页那个具体矩阵，第 6 章已经算出两个特征值是 1 和 3。
- **这一页的记号**：$\mathbf u\cdot\mathbf v$ 是点积，$|\mathbf v|$ 是长度；$\mathbf u\perp\mathbf v$ 读作「两者垂直」；$\hat{\mathbf b}$ 读作「$\mathbf b$ 的投影」；$Q$ 表示列向量两两垂直且长度为 $1$ 的矩阵；$q(\mathbf x)=\mathbf x^TA\mathbf x$ 是二次型。
:::

先说一个谁都遇到过的情况。你在实验室量一根电阻的伏安特性，得到三个数据点 $(1,1)$、$(2,2)$、$(3,4)$。理想情况下它们该落在同一条直线上，可第三点明显偏高。你想画一条「最好」的直线穿过它们——但三个点不共线，任何直线都不可能同时穿过。

那什么叫「最好」？直觉是：每个点到直线的竖直距离的平方和最小。这一页要回答的正是这件事：怎么量垂直、怎么找最近的垂足、怎么算出那条线。而「垂直」这套工具最后还会顺手解决另一个问题：一张曲面是碗还是马鞍。

## 一、先学会量「垂直」：点积

两个方向之间的夹角，不用量角器就能算。把两支箭的分量逐项相乘再相加，得到的这个数叫**点积**：

$$
\mathbf u\cdot\mathbf v=u_1v_1+u_2v_2+\cdots+u_nv_n
$$

读一遍：$\mathbf u,\mathbf v$ 各有 $n$ 个数；对应位置相乘，全部加起来，得到一个**数**（不是向量）。拿 $\mathbf a=(2,1)$、$\mathbf b=(3,4)$ 试：$\mathbf a\cdot\mathbf b=2\times3+1\times4=10$；$\mathbf a\cdot\mathbf a=2\times2+1\times1=5$。

自己点自己一定是非负的，所以长度能读出来：$|\mathbf a|=\sqrt{\mathbf a\cdot\mathbf a}=\sqrt5$。而一般的点积有一个几何身份，$\mathbf u\cdot\mathbf v=|\mathbf u||\mathbf v|\cos\theta$——$\theta$ 是两者的夹角。于是当夹角是 90° 时 $\cos\theta=0$，点积归零。这就给了「垂直」一个纯算术的判据。线性代数里「垂直」也叫**正交**，就是本页标题里的那个词：

$$
\mathbf u\perp\mathbf v\quad\Longleftrightarrow\quad\mathbf u\cdot\mathbf v=0
$$

验一个：取 $\mathbf a=(2,1)$、$\mathbf e=(-1,2)$，$\mathbf a\cdot\mathbf e=-2+2=0$，所以这两支箭互相垂直。一百维的数据里没法画直角，但「相乘再相加看是不是零」照样一行算完。

顺带记住一组特殊的向量：**两两垂直、每个长度都是 1** 的一组向量。在这样一组基下求坐标不用解方程组——把 $\mathbf x=c_1\mathbf q_1+\cdots+c_n\mathbf q_n$ 两边点一下 $\mathbf q_i$，别的项全归零（垂直），只剩 $c_i=\mathbf q_i\cdot\mathbf x$。把这些 $\mathbf q$ 按列排成 $Q$，「两两垂直且长度为 1」就写成一句 $Q^TQ=I$。

## 二、垂直砸下去：投影的垂足

现在做第一个几何动作。给定 $\mathbf b=(3,4)$ 和一条由 $\mathbf a=(2,1)$ 张成的直线，问：这条直线上哪个点离 $\mathbf b$ 最近？

最近的那个点一定在直线上，所以它形如 $\hat{x}\mathbf a$。关键是「垂直」这个条件：连接 $\mathbf b$ 与 $\hat{x}\mathbf a$ 的那一段（叫误差 $\mathbf e=\mathbf b-\hat{x}\mathbf a$）必须与 $\mathbf a$ 垂直，否则这个点还能再往线上挪一点。写成方程就是 $\mathbf a\cdot(\mathbf b-\hat{x}\mathbf a)=0$，解出

$$
\hat{\mathbf b}=\frac{\mathbf a\cdot\mathbf b}{\mathbf a\cdot\mathbf a}\,\mathbf a
$$

读一遍：分母 $\mathbf a\cdot\mathbf a$ 是 $\mathbf a$ 长度的平方；分子 $\mathbf a\cdot\mathbf b$ 等于「$\mathbf a$ 的长度」乘上「$\mathbf b$ 在 $\mathbf a$ 方向上的分量长度」，因为 $\mathbf a\cdot\mathbf b=|\mathbf a||\mathbf b|\cos\theta$。两者相除，把长度除掉、只留下倍数，再乘回 $\mathbf a$ 就落到了直线上。代数字：$\mathbf a\cdot\mathbf b=10$、$\mathbf a\cdot\mathbf a=5$，倍数是 $2$，所以 $\hat{\mathbf b}=2(2,1)=(4,2)$；误差 $\mathbf e=(3,4)-(4,2)=(-1,2)$，而 $\mathbf a\cdot\mathbf e=-2+2=0$ ✓。

<FigBox title="投影 = 垂足：沿垂直于直线的方向砸下去" kind="几何" note="输入：b=(3,4) 与直线 L=span(a)，a=(2,1)（两轴同为每单位 25 像素）· 操作：沿与 a 垂直的方向把 b 砸到 L 上 · 结果：垂足 b̂=(4,2)，误差 e=(−1,2)，且 a·e=0">
<svg viewBox="0 0 460 240" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="40" y1="220" x2="300" y2="90" stroke="var(--vp-c-text-3)" stroke-dasharray="5 4"/>
  <text x="304" y="86" font-size="11.5" fill="var(--vp-c-text-3)" stroke="none">直线 L</text>
  <line x1="80" y1="200" x2="155" y2="100" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
  <path d="M155 100 l-8.4 -1.6 l1.6 6.6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="160" y="96" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">b = (3,4)</text>
  <line x1="80" y1="200" x2="180" y2="150" stroke="#3b82f6" stroke-width="3"/>
  <path d="M180 150 l-8.6 -2 l1.4 6.4 Z" fill="#3b82f6" stroke="none"/>
  <text x="186" y="146" font-size="11.5" fill="#3b82f6" stroke="none">b̂ = (4,2)</text>
  <line x1="155" y1="100" x2="180" y2="150" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M180 150 l-8.6 -2 l1.4 6.4 Z" fill="#ef4444" stroke="none"/>
  <text x="150" y="126" text-anchor="end" font-size="11.5" fill="#ef4444" stroke="none">e = (−1,2)</text>
  <path d="M188.9 145.5 L193.4 154.5 L184.5 158.9" fill="none" stroke="#ef4444" stroke-width="1.4"/>
  <line x1="80" y1="200" x2="130" y2="175" stroke="#16a34a" stroke-width="2.4"/>
  <path d="M130 175 l-8.6 -2 l1.4 6.4 Z" fill="#16a34a" stroke="none"/>
  <text x="96" y="166" text-anchor="end" font-size="11.5" fill="#16a34a" stroke="none">a = (2,1)</text>
  <circle cx="80" cy="200" r="3" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="200" y="168" font-size="11" fill="var(--vp-c-text-2)" stroke="none">a·e = 0</text>
</svg>
</FigBox>

为什么垂足就是最近点？在直线上随便另取一点 $\mathbf y$，把 $\mathbf b-\mathbf y$ 拆成两段：一段是 $\mathbf b-\hat{\mathbf b}$（垂直于直线），一段是 $\hat{\mathbf b}-\mathbf y$（躺在直线上）。两段垂直，用勾股定理就得 $|\mathbf b-\mathbf y|^2=|\mathbf e|^2+|\hat{\mathbf b}-\mathbf y|^2\ge|\mathbf e|^2$，而且等号只在 $\mathbf y=\hat{\mathbf b}$ 时成立。所以「垂直砸下去的那个点」就是最近点，不是比喻，是勾股定理的直接后果。

## 三、Ax=b 无解时：把 b 投到列空间

把直线换成 $A$ 的列空间，同一套推理原样搬过来。$A\mathbf x=\mathbf b$ 无解的几何原因很直白：$\mathbf b$ 不在列空间里（第 4 章：列空间是 $A$ 能到达的所有位置）。既然够不着，就退一步：在列空间里找离 $\mathbf b$ 最近的点 $\hat{\mathbf b}=A\hat{\mathbf x}$，也就是让误差长度的平方最小。这套找最近近似解的做法叫**最小二乘**。

最近点的条件还是那个：误差 $\mathbf e=\mathbf b-A\hat{\mathbf x}$ 必须垂直于列空间里的每一个向量。而「垂直于列空间」等价于「垂直于 $A$ 的每一列」——因为列空间里的每个向量都是列的组合。而 $A^T\mathbf e$ 的每个分量正是「某一列与 $\mathbf e$ 的点积」，所以这句话写成 $A^T\mathbf e=\mathbf 0$，展开就是

$$
A^TA\,\hat{\mathbf x}=A^T\mathbf b
$$

读一遍：$A$ 是 $m\times n$（$m$ 个数据点、$n$ 个要解的系数），$A^T$ 是 $n\times m$，所以左边的系数矩阵 $A^TA$ 是 $n\times n$，右边 $A^T\mathbf b$ 是 $n$ 个数的一列。整句是一个「$n$ 个方程、$n$ 个未知数」的方程组，只不过它是从「误差要垂直」推出来的，而不是从原题抄下来的。它的名字叫**法方程**。

顺带一个好消息：如果 $\mathbf b$ 本来就落在列空间里，投影就是它自己、误差为零，法方程解出来的就是原方程组的精确解。所以最小二乘不是换了一道题，而是把「解」的定义从列空间里放松到列空间外。

## 四、把一组歪基摆正：Gram-Schmidt

手上有一组线性无关但互相不垂直的向量，能不能造出一组两两垂直、长度都是 1 的？能，而且只用上一节的投影：**第 1 个照抄，后面每一个都减掉它在前面所有向量上的投影。**

拿 $\mathbf a_1=(1,1)$、$\mathbf a_2=(2,0)$ 走一遍：

1. $\mathbf q_1=\dfrac{\mathbf a_1}{|\mathbf a_1|}=\dfrac{1}{\sqrt2}(1,1)$。*（为什么先归一：后面算投影系数时用单位向量，系数就是点积，省一次除法。）*
2. $\mathbf a_2$ 在 $\mathbf q_1$ 上的分量长度是 $\mathbf q_1\cdot\mathbf a_2=\dfrac{2}{\sqrt2}=\sqrt2$，所以那段投影是 $\sqrt2\cdot\dfrac{1}{\sqrt2}(1,1)=(1,1)$。
3. 减掉它：$\mathbf u_2=(2,0)-(1,1)=(1,-1)$。这一步之后 $\mathbf u_2$ 与 $\mathbf q_1$ 垂直，验一下：$\mathbf q_1\cdot\mathbf u_2=\dfrac{1}{\sqrt2}-\dfrac{1}{\sqrt2}=0$ ✓。
4. $|\mathbf u_2|=\sqrt2$，归一得 $\mathbf q_2=\dfrac{1}{\sqrt2}(1,-1)$。

减法的几何读法是**首尾相接**：$\mathbf a_2$ 与那段投影都从原点画出，从投影的终点连到 $\mathbf a_2$ 的终点，这一小段就是 $\mathbf a_2-\text{投影}=\mathbf u_2$；同一支箭从原点看也是它，所以图里 $\mathbf u_2$ 画了两次（一次在原点，一次接在投影终点上）。

<FigBox title="Gram-Schmidt：减掉投影，剩下的自然垂直" kind="几何" note="输入：a₁=(1,1)、a₂=(2,0)，两者不垂直（两轴同为每单位 50 像素）· 操作：把 a₂ 在 a₁ 方向上的投影减掉——首尾相接，从投影终点连到 a₂ 终点 · 结果：得到 u₂=(1,−1)，与 a₁ 垂直，归一后就是 q₂">
<svg viewBox="0 0 460 240" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="40" y1="120" x2="200" y2="120" stroke="var(--vp-c-text-3)"/>
  <line x1="90" y1="210" x2="90" y2="40" stroke="var(--vp-c-text-3)"/>
  <line x1="90" y1="120" x2="190" y2="120" stroke="var(--vp-c-text-2)" stroke-width="2"/>
  <path d="M190 120 l-8 -3 l0 6 Z" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="196" y="124" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">a₂ = (2,0)</text>
  <line x1="90" y1="120" x2="140" y2="70" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
  <path d="M140 70 l-8.4 -1.4 l1.6 6.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="146" y="66" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">a₁ = 投影 = (1,1)</text>
  <line x1="140" y1="70" x2="190" y2="120" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
  <path d="M190 120 l-8.4 -1.4 l1.6 6.4 Z" fill="#ef4444" stroke="none"/>
  <path d="M147 62.9 L154.1 70 L147 77.1" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.4"/>
  <line x1="90" y1="120" x2="140" y2="170" stroke="#16a34a" stroke-width="2.4"/>
  <path d="M140 170 l-8.4 1.4 l4.4 5 Z" fill="#16a34a" stroke="none"/>
  <text x="146" y="178" font-size="11.5" fill="#16a34a" stroke="none">u₂ = (1,−1)</text>
  <text x="196" y="96" font-size="10.5" fill="#ef4444" stroke="none">同一支 u₂，接在投影终点上</text>
  <text x="200" y="70" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">q₁·u₂ = 0</text>
</svg>
</FigBox>

最容易错的不是除法，而是**少减了几项**：第 $k$ 个向量要减掉它在前面**每一个**单位向量上的投影，不是只减最后一个。三个以上向量时少减一项，整组就白算了。

## 五、碗口朝哪：二次型与正定

换一个对象：不再问两支箭的夹角，而问一个「只含二次项」的式子。它的标准写法是

$$
q(\mathbf x)=\mathbf x^TA\mathbf x,\qquad A=A^T
$$

读一遍：$\mathbf x$ 是一列数，$\mathbf x^T$ 是把它转成一行；一行夹一个方阵再乘一列，结果是一个**数**。因为每个位置都是两个分量相乘，它叫**二次型**。取第 6 章那台机器 $A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$，展开就是 $q(x,y)=2x^2+2xy+2y^2$，代 $(1,1)$ 得 $6$。

这个式子在几何上是一张曲面。把「$q(\mathbf x)>0$ 对所有非零 $\mathbf x$ 都成立」叫**正定**——它说的是：从原点往任何方向走，函数值都往上长，所以原点是最低点，整张曲面像一只开口向上的碗。反过来，若有些方向往上、有些方向往下，那就是马鞍。

判断的话有两把尺子，都要会，因为互相能验：

- **看特征值**：$A$ 的特征值是 $1$ 和 $3$（第 6 章算过），全为正 ⇒ 正定。特征向量给出碗的主轴方向。
- **看顺序主子式**：从左上角开始取 $1\times1$、$2\times2$、…… 的行列式。这里 $\Delta_1=2>0$、$\Delta_2=\det A=3>0$，全正 ⇒ 正定。

<FigBox title="正定 = 开口向上的碗，等高线是一圈圈椭圆" kind="几何" note="输入：二次型 q(x,y)=2x²+2xy+2y² · 操作：沿各个方向代点算值，并画等高线 q=c · 结果：每条方向都往上长，原点处 q=0 是最低点，俯视的等高线是同心椭圆">
<svg viewBox="0 0 620 230" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="118" y="18" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">碗的截面：开口向上</text>
  <line x1="30" y1="130" x2="212" y2="130" stroke="var(--vp-c-text-3)"/>
  <line x1="30" y1="205" x2="30" y2="55" stroke="var(--vp-c-text-3)"/>
  <text x="216" y="134" font-size="11" fill="var(--vp-c-text-3)" stroke="none">x</text>
  <text x="24" y="52" font-size="11" fill="var(--vp-c-text-3)" stroke="none">q</text>
  <path d="M50 60 Q120 200 190 60" stroke="#3b82f6" stroke-width="2.4"/>
  <circle cx="120" cy="130" r="3.6" fill="#3b82f6" stroke="none"/>
  <text x="120" y="150" text-anchor="middle" font-size="10.5" fill="#3b82f6" stroke="none">最低点</text>
  <text x="120" y="86" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-2)" stroke="none">沿各方向 q 都增大</text>
  <text x="430" y="18" text-anchor="middle" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">俯视：等高线 q = c 是椭圆</text>
  <ellipse cx="430" cy="120" rx="86" ry="46" stroke="#3b82f6" stroke-width="1.6"/>
  <ellipse cx="430" cy="120" rx="60" ry="32" stroke="#3b82f6" stroke-width="1.6"/>
  <ellipse cx="430" cy="120" rx="32" ry="17" stroke="#3b82f6" stroke-width="1.6"/>
  <circle cx="430" cy="120" r="3.4" fill="#3b82f6" stroke="none"/>
  <line x1="344" y1="120" x2="516" y2="120" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3"/>
  <line x1="430" y1="74" x2="430" y2="166" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3"/>
  <text x="430" y="196" text-anchor="middle" font-size="11" fill="var(--vp-c-text-3)" stroke="none">若等高线是双曲线，就是马鞍</text>
</svg>
</FigBox>

但「元素都是正的」不是判据。看 $C=\begin{bmatrix}1&2\\2&1\end{bmatrix}$：两个 $1$、两个 $2$，元素全正，可是取 $\mathbf x=(1,-1)$ 算一下：$q=1\times1+4\times1\times(-1)+1\times1=-2<0$——它取到了负值，所以绝不正定。用特征值看更清楚：迹是 $2$、行列式是 $-3$，所以两个特征值是 $3$ 与 $-1$，一正一负，正是马鞍。顺序主子式也会当场露馅：$\Delta_1=1>0$ 但 $\Delta_2=-3<0$。

## 例题

::: tip 例 1 · 投影到一条直线，再验垂直
**题目**：$\mathbf a=(2,1)$、$\mathbf b=(3,4)$。求 $\mathbf b$ 在 $\mathbf a$ 方向上的投影，并验证误差与 $\mathbf a$ 垂直。

**先猜**：$\mathbf b$ 的长度是 $5$，与 $\mathbf a$ 的夹角不大，垂足应该落在 $\mathbf a$ 的两倍附近，也就是 $(4,2)$ 一带；误差会指向左上。

**再算**：$\mathbf a\cdot\mathbf a=2^2+1^2=5$，$\mathbf a\cdot\mathbf b=2\times3+1\times4=10$，倍数 $\hat{x}=\dfrac{10}{5}=2$，所以 $\hat{\mathbf b}=2(2,1)=(4,2)$。误差 $\mathbf e=\mathbf b-\hat{\mathbf b}=(3-4,\ 4-2)=(-1,2)$。

**再回代**：$\mathbf a\cdot\mathbf e=2\times(-1)+1\times2=0$ ✓，垂足条件成立；再拿勾股核对长度：$|\mathbf b|^2=25$，$|\hat{\mathbf b}|^2=4^2+2^2=20$，$|\mathbf e|^2=1+4=5$，而 $20+5=25$ ✓。垂直拆分之后，长度的平方正好相加。
:::

::: tip 例 2 · 三个点拟合一条直线
**题目**：三个数据点 $(1,1)$、$(2,2)$、$(3,4)$ 不共线。求 $y=C+Dx$，使三个点到它的竖直距离平方和最小。

**先猜**：三点整体在上升，斜率该略大于 $1$；第 3 点偏高，会把拟合线往上拉一点，所以截距该略小于 $0$。先按「斜率约 $1.5$、截距约 $-0.5$」去算。

**再算**：

1. 把模型写成方程的形状：每个数据点给一条 $C+Dx_i=y_i$，于是 $A=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix}$、$\mathbf b=(1,2,4)$。*（为什么这么排：每一行是一个数据点，第 1 列管截距、第 2 列管斜率。）*
2. 写法方程：$A^TA=\begin{bmatrix}3&6\\6&14\end{bmatrix}$，$A^T\mathbf b=(7,17)$。*（为什么是它：误差要垂直于列空间，等价于 $A^T\mathbf e=\mathbf 0$。）*
3. 解 $\begin{cases}3C+6D=7\\6C+14D=17\end{cases}$：由第一式 $C=\dfrac{7-6D}{3}$，代入第二式得 $2(7-6D)+14D=17$，即 $2D=3$，所以 $D=\dfrac32$、$C=\dfrac{7-9}{3}=-\dfrac23$。拟合直线是 $y=\dfrac32x-\dfrac23$。

<FigBox title="例 2 的拟合结果：三条竖直残差，平方和 1/6" kind="几何" note="输入：三个数据点 (1,1)、(2,2)、(3,4) · 操作：把 b 投到 A 的列空间，解出 C=−2/3、D=3/2 · 结果：直线 y=3x/2−2/3（x 每单位 40 像素、y 每单位 30 像素），三条竖直残差是 1/6、−1/3、1/6">
<svg viewBox="0 0 460 250" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="60" y1="200" x2="400" y2="200" stroke="var(--vp-c-text-3)"/>
  <line x1="80" y1="235" x2="80" y2="45" stroke="var(--vp-c-text-3)"/>
  <text x="120" y="216" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">1</text>
  <text x="160" y="216" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">2</text>
  <text x="200" y="216" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">3</text>
  <text x="72" y="174" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">1</text>
  <text x="72" y="144" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">2</text>
  <text x="72" y="114" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">3</text>
  <text x="72" y="84" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">4</text>
  <line x1="80" y1="220" x2="224" y2="58" stroke="#3b82f6" stroke-width="2"/>
  <text x="228" y="62" font-size="11.5" fill="#3b82f6" stroke="none">y = 3x/2 − 2/3</text>
  <line x1="120" y1="170" x2="120" y2="175" stroke="#ef4444" stroke-width="2.6"/>
  <line x1="160" y1="140" x2="160" y2="130" stroke="#ef4444" stroke-width="2.6"/>
  <line x1="200" y1="80" x2="200" y2="85" stroke="#ef4444" stroke-width="2.6"/>
  <circle cx="120" cy="170" r="4" fill="var(--vp-c-text-1)" stroke="none"/>
  <circle cx="160" cy="140" r="4" fill="var(--vp-c-text-1)" stroke="none"/>
  <circle cx="200" cy="80" r="4" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="114" y="166" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-2)" stroke="none">(1,1)</text>
  <text x="154" y="136" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-2)" stroke="none">(2,2)</text>
  <text x="194" y="76" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-2)" stroke="none">(3,4)</text>
  <text x="240" y="142" font-size="11" fill="#ef4444" stroke="none">残差：1/6、−1/3、1/6</text>
  <text x="240" y="162" font-size="10.5" fill="var(--vp-c-text-2)" stroke="none">三段都很短，说明拟合得好</text>
</svg>
</FigBox>

**再回代**：把 $x=1,2,3$ 代回直线：$\dfrac56$、$\dfrac73$、$\dfrac{23}{6}$。三个残差是 $1-\dfrac56=\dfrac16$、$2-\dfrac73=-\dfrac13$、$4-\dfrac{23}{6}=\dfrac16$，平方和 $\dfrac{1}{36}+\dfrac{1}{9}+\dfrac{1}{36}=\dfrac16$。再验「残差与列空间垂直」这一条：残差与第一列 $(1,1,1)$ 的点积是 $\dfrac16-\dfrac13+\dfrac16=0$ ✓，与第二列 $(1,2,3)$ 的点积是 $\dfrac16-\dfrac23+\dfrac12=0$ ✓。结论与猜测的「斜率 $1.5$、截距略负」对上了。
:::

::: tip 例 3 · 判正定：两把尺子互相验
**题目**：判断 $A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$ 与 $C=\begin{bmatrix}1&2\\2&1\end{bmatrix}$ 是不是正定。

**先猜**：$A$ 就是第 6 章那台机器，特征值 $1$、$3$ 都正，应该正定。$C$ 的元素也全是正的，但交叉项是 $4xy$，比平方项还猛，我怀疑它能取到负值。

**再算**：

- $A$：特征值 $1,3$ 全正；顺序主子式 $\Delta_1=2>0$、$\Delta_2=\det A=3>0$。两把尺子都说正定。
- $C$：迹 $2$、行列式 $1-4=-3$，所以特征值是 $3$ 与 $-1$，一正一负；顺序主子式 $\Delta_1=1>0$ 但 $\Delta_2=-3<0$，第二关就不过。

**再回代**：直接代点验第二把尺子的结论。$A$ 的二次型是 $2x^2+2xy+2y^2$，代 $(1,-1)$ 得 $2-2+2=2>0$；$C$ 的二次型是 $x^2+4xy+y^2$，代同一个点得 $1-4+1=-2<0$。所以「元素全正」完全不代表正定，$C$ 是一张马鞍。
:::

## 这一页带走三句话

1. 垂直就是点积为零；垂足是用「误差垂直于目标」定出来的点，而勾股定理保证它最近。
2. $A\mathbf x=\mathbf b$ 无解时，把 $\mathbf b$ 投到列空间：误差垂直于每一列，写成 $A^T\mathbf e=\mathbf 0$，就得到法方程 $A^TA\hat{\mathbf x}=A^T\mathbf b$。
3. 正定是「从原点往任何方向都往上走」，等价于特征值全正、也等价于顺序主子式全正；元素全正说明不了任何事。

::: warning 最容易错的两处
- **把投影当成斜着照的影子。** 只有沿垂直方向砸下去才是投影；算完一定要验 $\mathbf a\cdot\mathbf e=0$。
- **Gram-Schmidt 只减了最后一项。** 第 $k$ 个向量要减掉前面每一个单位向量上的投影，少一项整组就不垂直了。
:::

七章到这里走完：从向量与张成，到变换、消元、子空间、行列式、特征值，再到这一页的角度与最近。想回顾整条路线，回[现代版路线图](index.md)；想按教材章号把二次型配方、正定判别练成步骤，去经典版第 6 章。
