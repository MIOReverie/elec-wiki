---
title: 06 · 特征值、特征向量与对角化
description: 大多数箭头被变换掰弯，少数只被伸缩。那些方向叫特征向量，伸缩倍数叫特征值；找齐了就能把矩阵的高次幂变成一次取幂。
---

# 06 · 特征值、特征向量与对角化

<Meta time="24 min" level="核心" note="最容易错的是把「方向不变」当成「长度不变」——特征向量可以被拉长、压短、甚至掉头；另外 P 的列序与 D 的对角线必须一一对上" />

拿一个具体的机器开场：$A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$。

$A(1,0)=(2,1)$，本来指向正东的箭头被掰向了东北。$A(2,1)=(5,4)$，方向也变了。掰弯几乎是所有箭头的命运。

但有例外。$A(1,1)=(3,3)$：方向还是那条与横轴成 45° 的线，只是长度变成了 $3$ 倍。$A(1,-1)=(1,-1)$：连长度都没变。同一个变换，有的箭头被掰弯，有的箭头只是被拉伸。

这些拉伸不改变方向的箭头值钱在哪？把它们当新坐标轴，变换就只剩「沿轴伸缩」，连 $A$ 的五次方都能两三步算出来。前提是凑得够数，有时候凑不够。

::: tip 读之前
$A\mathbf x$ 是把各列按 $\mathbf x$ 的分量加权相加（[第 2 章](02-matrices.md)）。一句复习：$A(1,0)$ 就是 $A$ 的第一列。

齐次方程 $A\mathbf x=\mathbf 0$ 什么时候有非零解、零空间是什么（[第 4 章](04-subspaces.md)）；$\det A$ 与「压扁」的关系（[第 5 章](05-determinant.md)）。一句复习：$\det A=0$ 等价于有非零箭头被送成零。

记号：$\mathbf v$ 是特征向量（一支非零箭头），$\lambda$ 是特征值（一个数，可正可负可为 $0$）；$I$ 是单位矩阵；$P$ 是把特征向量按列排成的方阵；$D$ 是对角线放特征值的对角矩阵。
:::

## 一、四条箭头，两条不为所动

把刚才那几下摆在一起看：

| 输入 | 输出 | 方向变了吗 |
| --- | --- | --- |
| $(1,0)$ | $(2,1)$ | 变了 |
| $(2,1)$ | $(5,4)$ | 变了 |
| $(1,1)$ | $(3,3)$ | 没变，长度乘 $3$ |
| $(1,-1)$ | $(1,-1)$ | 没变，长度也没变 |

输出那一列里的 $(3,3)$ 与输入 $(1,1)$ 在同一条过原点的直线上，差的只是一个倍数 $3$；$(1,-1)$ 更直接，输出与输入一模一样。而 $(2,1)$ 与 $(5,4)$ 不成倍数，落在两条不同的线上。

<FigBox title="四条箭头里，两条被掰弯，两条留在原来的直线上" kind="几何" note="左边四条箭头，两条绿虚线是 45° 与 −45° 两条过原点的直线；右边只画了留下来的两支——(1,1) 被拉 3 倍、(1,−1) 原地不动；跑到线外的 (1,0)→(2,1) 与 (2,1)→(5,4) 见中间一列（两轴同为每单位 24 像素）。看完该看出绿线上那条方向整条都是例外。">
<svg viewBox="0 0 640 262" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="130" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：四条箭头</text>
  <text x="340" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">操作：A 逐条作用</text>
  <text x="545" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果</text>
  <line x1="40" y1="190" x2="230" y2="190" stroke="var(--vp-c-text-3)"/>
  <line x1="80" y1="250" x2="80" y2="60" stroke="var(--vp-c-text-3)"/>
  <line x1="60" y1="210" x2="134" y2="136" stroke="#16a34a" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="60" y1="170" x2="140" y2="250" stroke="#16a34a" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="80" y1="190" x2="104" y2="190" stroke="var(--vp-c-text-2)" stroke-width="2"/>
  <path d="M104 190 l-8 -3 l0 6 Z" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="110" y="194" font-size="11" fill="var(--vp-c-text-2)" stroke="none">(1,0)</text>
  <line x1="80" y1="190" x2="128" y2="166" stroke="var(--vp-c-text-2)" stroke-width="2"/>
  <path d="M128 166 l-8.4 -1.4 l1.6 6.4 Z" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="134" y="160" font-size="11" fill="var(--vp-c-text-2)" stroke="none">(2,1)</text>
  <line x1="80" y1="190" x2="104" y2="166" stroke="#16a34a" stroke-width="2.4"/>
  <path d="M104 166 L99.9 174.6 L95.4 170.1 Z" fill="#16a34a" stroke="none"/>
  <text x="98" y="158" text-anchor="end" font-size="11" fill="#16a34a" stroke="none">(1,1)</text>
  <line x1="80" y1="190" x2="104" y2="214" stroke="var(--vp-c-text-1)" stroke-width="2.4"/>
  <path d="M104 214 L95.4 209.9 L99.9 205.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="110" y="224" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(1,−1)</text>
  <text x="240" y="92" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">A(1,1) = (3,3)</text>
  <text x="240" y="122" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">A(1,−1) = (1,−1)</text>
  <text x="240" y="152" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">A(1,0) = (2,1)</text>
  <text x="240" y="182" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">A(2,1) = (5,4)</text>
  <line x1="430" y1="190" x2="630" y2="190" stroke="var(--vp-c-text-3)"/>
  <line x1="470" y1="250" x2="470" y2="60" stroke="var(--vp-c-text-3)"/>
  <line x1="450" y1="210" x2="524" y2="136" stroke="#16a34a" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="450" y1="170" x2="530" y2="250" stroke="#16a34a" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="470" y1="190" x2="542" y2="118" stroke="#16a34a" stroke-width="2.6"/>
  <path d="M542 118 L537.9 126.6 L533.4 122.1 Z" fill="#16a34a" stroke="none"/>
  <text x="548" y="112" font-size="11" fill="#16a34a" stroke="none">(3,3) = 3(1,1)</text>
  <line x1="470" y1="190" x2="494" y2="214" stroke="var(--vp-c-text-1)" stroke-width="2.4"/>
  <path d="M494 214 L485.4 209.9 L489.9 205.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="500" y="224" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(1,−1) 不动</text>
  <text x="470" y="246" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">两条绿线没被掰弯</text>
</svg>
</FigBox>

图上两条绿线，被 $A$ 送回了自己身上；别的箭头都跑到线外去了。要找的就是这两条线。

## 二、把「方向不变」写成式子

「被作用之后方向不变、只被伸缩」的箭头需要一个名字：**特征向量**；那个伸缩倍数也有名字：**特征值**，记作 $\lambda$。写成等式就是

$$
A\mathbf v=\lambda\mathbf v,\qquad \mathbf v\ne\mathbf 0
$$

读一遍：$\mathbf v$ 是一支非零箭头，$\lambda$ 是一个数；左边是「$A$ 作用在 $\mathbf v$ 上得到的新箭头」，右边是「把 $\mathbf v$ 整体伸缩 $\lambda$ 倍」。整句说的是这两个结果是同一支箭。所以 $\mathbf v$ 与 $A\mathbf v$ 落在同一条过原点的直线上，正是上一节图上那两条绿线。

关于 $\lambda$ 的三件事先说清，它们都是后面判正误的标准：

- $\lambda$ 可以是负的：那时整支箭掉头，还留在同一条直线上；
- $\lambda$ 可以是 $0$：那时 $\mathbf v$ 被送成了零，说明它在零空间里；
- $\lambda=1$ 表示长度不变，$\lambda=2$ 表示拉长一倍，$\lambda=1/2$ 表示压短一半。

零向量要排除。$A\mathbf 0=\lambda\mathbf 0$ 对任何 $\lambda$ 都成立，什么信息都没给，所以定义里直接要求 $\mathbf v\ne\mathbf 0$。

还有一个好用的推论：一条线上的箭头是「一起」被伸缩的。若 $A\mathbf v=\lambda\mathbf v$，则 $A(c\mathbf v)=cA\mathbf v=\lambda(c\mathbf v)$，整条线都是特权方向，不必逐个去试。

## 三、变成能算的方程

$A\mathbf v=\lambda\mathbf v$ 里有两个未知量（箭头 $\mathbf v$ 和数 $\lambda$），混在一起没法直接解。移项，把右边也写成矩阵乘向量：

$$
A\mathbf v-\lambda\mathbf v=\mathbf 0\quad\Longrightarrow\quad(A-\lambda I)\mathbf v=\mathbf 0
$$

这里 $I$ 是单位矩阵，它的作用是「什么都不做」：$I\mathbf v=\mathbf v$，所以 $\lambda\mathbf v=\lambda I\mathbf v$ 才能和 $A\mathbf v$ 相减。

读一遍这个新式子：$A$ 是方阵，$I$ 与它同尺寸，$\lambda$ 是一个还没定下来的数；整句读作「把 $A$ 的对角线各减去 $\lambda$，拿这个新矩阵去乘 $\mathbf v$，结果必须是零向量」。形状也对得上：左边是一列数，右边也是一列数。

关键的一步在这里：我们要的是非零的 $\mathbf v$。而「$(A-\lambda I)\mathbf v=\mathbf 0$ 有非零解」按第 4 章的说法，就是「$A-\lambda I$ 把某个方向压成了零」；按第 5 章的说法，压扁等价于行列式为零。于是得到判据：

$$
\det(A-\lambda I)=0
$$

读一遍：左边是关于 $\lambda$ 的一个多项式，二阶时是 3 项的一元二次，右边是 $0$。所以这是一个「求多项式的根」的问题，不是矩阵方程；解出来的每个根就是一个特征值。

拿 $A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$ 走一遍：$A-\lambda I=\begin{bmatrix}2-\lambda&1\\1&2-\lambda\end{bmatrix}$，于是

$$
\det(A-\lambda I)=(2-\lambda)(2-\lambda)-1=\lambda^2-4\lambda+3=(\lambda-1)(\lambda-3)=0
$$

得 $\lambda_1=1$、$\lambda_2=3$。当场做两个自查：$1+3=4$，正好等于对角线之和 $2+2$（这个和叫迹）；$1\times3=3$，正好等于 $\det A=4-1=3$。这两条对任何方阵都成立，算错了立刻能发现。

## 四、代回去把方向找出来

$\lambda$ 有了，$\mathbf v$ 就好办：把 $\lambda$ 代回 $(A-\lambda I)\mathbf v=\mathbf 0$，解一个齐次方程。这一步就是第 4 章求零空间。

$\lambda_1=1$：$A-I=\begin{bmatrix}1&1\\1&1\end{bmatrix}$，方程是 $x+y=0$，即 $y=-x$。取 $x=1$ 得 $\mathbf v_1=(1,-1)$。

$\lambda_2=3$：$A-3I=\begin{bmatrix}-1&1\\1&-1\end{bmatrix}$，方程是 $-x+y=0$，即 $y=x$。取 $x=1$ 得 $\mathbf v_2=(1,1)$。

回代核对，这一条不能省：$A(1,-1)=(2-1,\ 1-2)=(1,-1)=1\cdot(1,-1)$ ✓；$A(1,1)=(2+1,\ 1+2)=(3,3)=3\cdot(1,1)$ ✓。

顺带说一句：特征向量不唯一。$(2,-2)$、$(-1,1)$ 都满足 $A\mathbf v=1\cdot\mathbf v$，它们只是 $\mathbf v_1$ 的倍数。所以核对永远看 $A\mathbf v=\lambda\mathbf v$ 是否成立，不要去背「标准答案」。

## 五、把这组方向当坐标轴

现在把两条特权方向按列排成一个矩阵，对应的 $\lambda$ 按同样的顺序放到对角线上：

$$
P=\begin{bmatrix}1&1\\-1&1\end{bmatrix},\qquad D=\begin{bmatrix}1&0\\0&3\end{bmatrix}
$$

顺序必须一一对上：$P$ 的第 1 列 $(1,-1)$ 配 $D$ 的第 1 个对角元 $1$，第 2 列 $(1,1)$ 配 $3$。换一下顺序，$D$ 的对角线也得跟着换。

为什么 $A=PDP^{-1}$ 成立：把 $P$ 按列写开，$AP=[A\mathbf v_1\ \ A\mathbf v_2]=[\lambda_1\mathbf v_1\ \ \lambda_2\mathbf v_2]=PD$，两边右乘 $P^{-1}$ 就得到它。每一步用的都是 $A\mathbf v=\lambda\mathbf v$ 这一条，没有别的花招。

验算：$\det P=1\cdot1-1\cdot(-1)=2$，$P^{-1}=\dfrac12\begin{bmatrix}1&-1\\1&1\end{bmatrix}$；$PD=\begin{bmatrix}1&3\\-1&3\end{bmatrix}$；再乘 $P^{-1}$ 得 $\begin{bmatrix}2&1\\1&2\end{bmatrix}=A$ ✓。

这件事的几何意思是：$A$ 与 $D$ 描述的是同一个变换，只是坐标换了一套。在特征向量这套坐标里，$D$ 只沿两条轴伸缩：$\mathbf v_1$ 方向不动，$\mathbf v_2$ 方向拉 $3$ 倍，一点斜切都没有。这种「同一个变换、两套坐标」的关系有个名字：**相似**，$P^{-1}AP$ 与 $A$ 相似；迹、行列式、特征值都不随换坐标改变（这里都是 $4$ 和 $3$）。

<FigBox title="同一台机器，两套坐标：斜切 vs 纯伸缩" kind="几何" note="左边在标准坐标 $(i,j)$ 里看，两根基箭都被掰弯；右边换成特征坐标 $(v_1,v_2)$，只剩沿两条轴伸缩：$v_1$ 方向不动，$v_2$ 方向拉 3 倍（两轴同为每单位 24 像素）。看完该看出同一台机器换套坐标就变成了对角矩阵。">
<svg viewBox="0 0 660 250" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="140" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">标准坐标：A 把网格斜切</text>
  <text x="450" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">特征坐标：D 只沿轴伸缩</text>
  <line x1="40" y1="200" x2="250" y2="200" stroke="var(--vp-c-text-3)"/>
  <line x1="80" y1="240" x2="80" y2="60" stroke="var(--vp-c-text-3)"/>
  <line x1="80" y1="200" x2="104" y2="200" stroke="var(--vp-c-text-3)" stroke-dasharray="5 4"/>
  <line x1="80" y1="200" x2="80" y2="176" stroke="var(--vp-c-text-3)" stroke-dasharray="5 4"/>
  <text x="110" y="204" font-size="11" fill="var(--vp-c-text-2)" stroke="none">i</text>
  <text x="86" y="172" font-size="11" fill="var(--vp-c-text-2)" stroke="none">j</text>
  <line x1="80" y1="200" x2="128" y2="176" stroke="#3b82f6" stroke-width="2.4"/>
  <path d="M128 176 l-8.6 -1.2 l1.2 6.4 Z" fill="#3b82f6" stroke="none"/>
  <text x="134" y="170" font-size="11.5" fill="#3b82f6" stroke="none">Ai = (2,1)</text>
  <line x1="80" y1="200" x2="104" y2="152" stroke="#3b82f6" stroke-width="2.4"/>
  <path d="M104 152 L102.8 161.5 L97.1 158.6 Z" fill="#3b82f6" stroke="none"/>
  <text x="110" y="146" font-size="11.5" fill="#3b82f6" stroke="none">Aj = (1,2)</text>
  <text x="145" y="232" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)" stroke="none">两条基箭都被掰弯</text>
  <line x1="370" y1="230" x2="490" y2="110" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3"/>
  <line x1="390" y1="130" x2="490" y2="230" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3"/>
  <line x1="430" y1="170" x2="454" y2="146" stroke="var(--vp-c-text-2)" stroke-width="1.8"/>
  <path d="M454 146 L449.9 154.6 L445.4 150.1 Z" fill="var(--vp-c-text-2)" stroke="none"/>
  <text x="460" y="140" font-size="11.5" fill="var(--vp-c-text-2)" stroke="none">v₂</text>
  <line x1="430" y1="170" x2="502" y2="98" stroke="#3b82f6" stroke-width="2.6"/>
  <path d="M502 98 L497.9 106.6 L493.4 102.1 Z" fill="#3b82f6" stroke="none"/>
  <text x="508" y="94" font-size="11.5" fill="#3b82f6" stroke="none">3v₂：拉 3 倍</text>
  <line x1="430" y1="170" x2="454" y2="194" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M454 194 L445.4 189.9 L449.8 185.4 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="460" y="202" font-size="11.5" fill="var(--vp-c-text-1)" stroke="none">v₁ 方向：不动</text>
</svg>
</FigBox>

对角化最实际的收益是算幂。把 $A^k$ 展开写成 $(PDP^{-1})(PDP^{-1})\cdots(PDP^{-1})$，中间的 $P^{-1}P=I$ 一个个抵消，只剩两头和中间的 $D^k$：

$$
A^k=PD^kP^{-1}=P\begin{bmatrix}\lambda_1^k&0\\0&\lambda_2^k\end{bmatrix}P^{-1}
$$

读一遍：$A^k=PD^kP^{-1}$ 作用在一支箭上时，是从右往左依次进行的。$P^{-1}$ 先把「标准坐标下的读数」换成「特征坐标下的读数」，这套坐标的两条轴就是 $\mathbf v_1,\mathbf v_2$；$D^k$ 在那套坐标里把每个方向各自乘 $k$ 次幂（对角矩阵的幂就是对角线各自取幂）；最后由 $P$ 把结果换回标准坐标。于是 $k$ 次矩阵乘法变成「一次取幂 + 两次乘法」。例 2 会用它算 $A^5$。

## 例题

::: tip 例 1 · 换一台机器，把四个数都算出来
题目：$B=\begin{bmatrix}4&1\\2&3\end{bmatrix}$，求它的全部特征值与特征向量。

先猜：迹是 $4+3=7$，行列式是 $4\times3-1\times2=10$，两个数先摆在这里。特征值之和该是 $7$、之积该是 $10$，所以猜一对正数 $2$ 和 $5$。

再算：

1. 写特征方程：$B-\lambda I=\begin{bmatrix}4-\lambda&1\\2&3-\lambda\end{bmatrix}$，$\det(B-\lambda I)=(4-\lambda)(3-\lambda)-2=\lambda^2-7\lambda+10$。*（为什么可以这样算：第 5 章的二阶行列式公式 $ad-bc$。）*
2. 解 $\lambda^2-7\lambda+10=(\lambda-2)(\lambda-5)=0$，得 $\lambda_1=2$、$\lambda_2=5$，与猜测一致。
3. 代回求向量：$B-2I=\begin{bmatrix}2&1\\2&1\end{bmatrix}$ 给 $2x+y=0$，取 $\mathbf v_1=(1,-2)$；$B-5I=\begin{bmatrix}-1&1\\2&-2\end{bmatrix}$ 给 $-x+y=0$，取 $\mathbf v_2=(1,1)$。

再回代：$B(1,-2)=(4-2,\ 2-6)=(2,-4)=2\cdot(1,-2)$ ✓；$B(1,1)=(5,\ 5)=5\cdot(1,1)$ ✓；再核对两条自查：$2+5=7=$ 迹，$2\times5=10=$ 行列式 ✓。
:::

::: tip 例 2 · 用这组坐标算 A 的五次方
题目：接第四节，$P=\begin{bmatrix}1&1\\-1&1\end{bmatrix}$、$D=\begin{bmatrix}1&0\\0&3\end{bmatrix}$、$P^{-1}=\dfrac12\begin{bmatrix}1&-1\\1&1\end{bmatrix}$，求 $A^5$。

先猜：$A$ 的元素都不大，每乘一次大致让它涨一倍多，五次之后应该在一百上下；而且 $A$ 的两行两列对称，$A^5$ 应该还是 $\begin{bmatrix}a&b\\b&a\end{bmatrix}$ 这个形状。先按「$a$ 在一百二、$b$ 在一百二附近」去算。

再算：$D^5=\begin{bmatrix}1^5&0\\0&3^5\end{bmatrix}=\begin{bmatrix}1&0\\0&243\end{bmatrix}$。于是

$$
A^5=P D^5 P^{-1}=\begin{bmatrix}1&1\\-1&1\end{bmatrix}\begin{bmatrix}1&0\\0&243\end{bmatrix}\cdot\frac12\begin{bmatrix}1&-1\\1&1\end{bmatrix}
=\begin{bmatrix}1&243\\-1&243\end{bmatrix}\cdot\frac12\begin{bmatrix}1&-1\\1&1\end{bmatrix}
=\frac12\begin{bmatrix}244&242\\242&244\end{bmatrix}=\begin{bmatrix}122&121\\121&122\end{bmatrix}
$$

*（为什么中间那步能这么乘：先把 $P$ 与 $D^5$ 乘起来，得第一列还是 $1$、第二列变成 $243$ 倍的那两列。）*

再回代：不走对角化，直接连乘核对：$A^2=\begin{bmatrix}5&4\\4&5\end{bmatrix}$，$A^4=\begin{bmatrix}41&40\\40&41\end{bmatrix}$，$A^5=A^4A=\begin{bmatrix}122&121\\121&122\end{bmatrix}$ ✓。两条路同一个答案，形状也确实是对称的。若换成 $A^{100}$，对角化只要算 $3^{100}$ 再乘两头，而直乘要做 $99$ 次。
:::

::: tip 例 3 · 什么时候走不通：只有一个特权方向
题目：$C=\begin{bmatrix}1&1\\0&1\end{bmatrix}$（把平面往右推的剪切）。求它的特征值，并说明它能不能凑出两条独立的特权方向。

先猜：剪切把所有箭头都往同一侧推，估计只有一个方向不动，也就是 $\mathbf i=(1,0)$；另一个方向大概会被推歪。

再算：$\det(C-\lambda I)=(1-\lambda)(1-\lambda)-0=(1-\lambda)^2=0$，只有一个特征值 $\lambda=1$（重根）。代回：$C-I=\begin{bmatrix}0&1\\0&0\end{bmatrix}$ 给 $y=0$，即 $x$ 轴，只有 $(1,0)$ 这一条线。

再回代：试第二个方向，$C(0,1)=(1,1)$，它与 $(0,1)$ 不成倍数 ✓，所以确实没有第二条特权方向。凑不出两条独立特征向量，就写不成 $PDP^{-1}$，这类矩阵叫不可对角化。

<FigBox title="剪切：所有箭头被推向同一侧，只有 x 轴方向不动" kind="几何" note="左边方格与两根基箭，右边是 C 作用之后：每一点 (x,y) 送到 (x+y,y)，越往上推得越远。看完该看出竖直边被推成斜边、上边仍是水平，只有 x 轴方向原样保留。">
<svg viewBox="0 0 620 230" class="sf" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="120" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">输入：方格</text>
  <text x="300" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">操作：C 把 (x,y) 送到 (x+y,y)</text>
  <text x="545" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="var(--vp-c-text-2)" stroke="none">结果：被推歪</text>
  <line x1="50" y1="180" x2="200" y2="180" stroke="var(--vp-c-text-3)"/>
  <line x1="80" y1="215" x2="80" y2="100" stroke="var(--vp-c-text-3)"/>
  <rect x="80" y="130" width="50" height="50" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6"/>
  <line x1="80" y1="180" x2="130" y2="180" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M130 180 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="136" y="184" font-size="11" fill="var(--vp-c-text-1)" stroke="none">i</text>
  <line x1="80" y1="180" x2="80" y2="130" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M80 130 l-3 8 l6 0 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="88" y="126" font-size="11" fill="var(--vp-c-text-1)" stroke="none">j</text>
  <line x1="236" y1="152" x2="276" y2="152" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M276 152 l-8 -3.4 l0 6.8 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <line x1="270" y1="180" x2="600" y2="180" stroke="var(--vp-c-text-3)"/>
  <line x1="300" y1="215" x2="300" y2="100" stroke="var(--vp-c-text-3)"/>
  <polygon points="300,180 350,180 400,130 350,130" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6"/>
  <line x1="300" y1="180" x2="350" y2="180" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M350 180 l-8 -3 l0 6 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="356" y="184" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(1,0) 没动</text>
  <line x1="300" y1="180" x2="350" y2="130" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <path d="M350 130 L345.9 138.6 L341.4 134.1 Z" fill="var(--vp-c-text-1)" stroke="none"/>
  <text x="330" y="112" text-anchor="end" font-size="11" fill="var(--vp-c-text-1)" stroke="none">(0,1) ↦ (1,1)</text>
  <line x1="315" y1="155" x2="250" y2="122" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="246" y="118" text-anchor="end" font-size="11" fill="#ef4444" stroke="none">竖直边被推成斜边</text>
  <text x="405" y="124" font-size="11" fill="var(--vp-c-text-2)" stroke="none">上边仍是水平的</text>
</svg>
</FigBox>

上面对比的就是判断标准：能不能凑出 $n$ 条彼此独立的特征向量。凑得出，$A=PDP^{-1}$；凑不出，这条路就断了。像 $C$ 这样的剪切矩阵，只有一条，所以走不通。
:::

## 一条线索串到底

特征向量是「被 $A$ 作用后方向不变」的非零箭头，伸缩倍数就是特征值。$\lambda$ 可以为负，可以为 $0$，那时箭头被压成了零；$\lambda=2$ 是拉长、$\lambda=-1$ 是掉头，都算特征向量。

求 $\lambda$ 靠 $\det(A-\lambda I)=0$，那是求多项式的根；求 $\mathbf v$ 靠把 $\lambda$ 代回解齐次方程。算完用两条自查收尾：$\lambda$ 之和 $=$ 迹，$\lambda$ 之积 $=$ 行列式。

凑得出 $n$ 条独立特征向量时，才有 $A=PDP^{-1}$，$A^k$ 于是只剩「对角线取幂 + 两次乘法」；凑不够就老老实实连乘。例 3 那个剪切只有 $1$ 条，3 阶矩阵也可能只有 2 条甚至 1 条，凑不齐时这条路就走不通，只能回到 $0$ 次幂那种笨办法：一次次乘。

::: warning 两处最容易翻车
- 把「方向不变」当成「长度不变」。$\lambda=2$ 是拉长、$\lambda=-1$ 是掉头、$\lambda=0$ 是被压成零，三种都算特征向量。
- $P$ 的列序与 $D$ 的对角线错位。第 $i$ 列必须配第 $i$ 个 $\lambda$，否则 $PDP^{-1}$ 不再等于 $A$。
:::

下一站是[第 7 章 · 正交、投影与二次型](07-orthogonality.md)：那里要问「这些特权方向能不能互相垂直」，正定判据也直接用这一页的 $\lambda$。想按教材把特征方程、正交对角化练成标准步骤，去经典版第 5 章。
