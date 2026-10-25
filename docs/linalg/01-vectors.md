---
title: 01 · 向量、线性组合与张成
description: 从一段位移出发，把一支箭记成两个数；用接起来走和按倍数拉长拼出新箭，再用解二元方程组回答反问题：给定终点，两个方向各走几遍。最后用同一套解方程的本事判断哪一支是多余的。
---

# 01 · 向量、线性组合与张成

<Meta time="22 min" level="核心" note="最容易错的一处：把 (3,2) 当成「(3,2) 那个点」——它记的是「怎么走到 (3,2)」那一段位移" />

**这一页要解决什么**：你画得出箭，也算得动两个数，但一看到「这两支箭能凑出什么、能不能凑到某个位置」就停住。读完这一页，你能把一支箭和它的两个读数来回翻译；能说清两个方向各走几遍可以到达某个终点；也能看出给出的几支箭里有没有哪一支是多余的。

::: tip 读之前
- 需要会：平面直角坐标（一个位置用两个数表示）、二元一次方程组的代入消元。这两样本页都会当场重算一遍，忘了也能跟上。
- 本页记号：粗体小写 $\mathbf v$ 表示一段位移；普通小写 $c,d$ 是标量，就是「几倍」里的那个倍数；$\begin{bmatrix}3\\2\end{bmatrix}$ 这种竖排的两个数叫列坐标，读作「三、二」；$\mathbf 0$ 是零向量，两个分量都是 0，表示哪也不去。
:::

你在方格纸上从某一格走到另一格：向右 3 格、向上 2 格。这趟走法和从哪一格出发没有关系——换个起点，走完还是「右 3、上 2」。那么，能不能只用两个数就把这趟走法记下来？能。而且记下来之后，两趟可以接起来走，一趟也可以走两遍、走一半、或者掉头。

## 一、一支箭、两个读数，还有第三样容易混的东西

把起点摆到原点上，箭尖落在横 3 纵 2 的位置，这趟走法就记成

$$
\mathbf v=\begin{bmatrix}3\\2\end{bmatrix}
$$

逐项读：左边 $\mathbf v$ 是这段位移的名字；右边上面的 3 是「沿横轴走 3」，下面的 2 是「沿纵轴走 2」；上下排列加方括号只表示「一个整体」。所以它读作「先右 3、再上 2 的那一趟走法」。

把它搬到别的起点，方向没变、长度没变，它还是同一段位移。**这正是「位移」和「位置」的区别：位移不绑在某一格上，它只回答「往哪走、走多远」。** 数学里给这个东西一个名字：**向量**（vector）。跟它对照的是**标量**（scalar）——一个只有大小的数，比如「3 倍」里的那个倍数，本页的 $c,d$ 全是标量。

<FigBox title="同一段位移摆在两个起点，读数只有一个" kind="几何" note="输入：一段「右 3、上 2」的位移。操作：图①起点摆在原点，图②把同一段位移挪到别处，起点记作 P。结果：图①可以直接读出 (3,2)，图②要先挪回原点，读数仍是 (3,2)。看图能读出什么：位移与起点无关，读数才是相对这两根轴的东西。">
<svg viewBox="0 0 520 210" role="img" aria-label="同一段位移摆在两个起点：左图起点在原点读出横 3 纵 2，右图起点在别处但仍是同一段位移">
<defs>
  <marker id="m1-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="m1-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<text x="112" y="22" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">① 起点放在原点：读得出两个数</text>
<text x="390" y="22" font-size="12" font-weight="600" fill="var(--vp-c-text-2)" text-anchor="middle">② 换个起点：还是同一段位移</text>
<line x1="30" y1="170" x2="205" y2="170" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="192" x2="60" y2="40" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="150" y1="110" x2="150" y2="170" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
<line x1="150" y1="110" x2="60" y2="110" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
<line x1="60" y1="170" x2="150" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#m1-a)" />
<text x="158" y="106" font-size="12.5" font-weight="600" fill="var(--vp-c-brand-1)">v = (3, 2)</text>
<text x="150" y="186" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">3</text>
<text x="52" y="114" font-size="11" fill="var(--vp-c-text-3)" text-anchor="end">2</text>
<text x="48" y="186" font-size="11" fill="var(--vp-c-text-3)">O</text>
<circle cx="60" cy="170" r="2.6" fill="var(--vp-c-text-2)" />
<line x1="266" y1="20" x2="266" y2="196" stroke="var(--vp-c-divider)" stroke-width="1.2" stroke-dasharray="5 4" />
<line x1="270" y1="170" x2="500" y2="170" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="300" y1="192" x2="300" y2="40" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="300" y1="170" x2="390" y2="110" stroke="var(--vp-c-text-3)" stroke-width="1.8" stroke-dasharray="5 3" marker-end="url(#m1-b)" />
<line x1="330" y1="140" x2="420" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#m1-a)" />
<text x="326" y="156" font-size="11" fill="var(--vp-c-text-3)">P</text>
<circle cx="330" cy="140" r="2.8" fill="var(--vp-c-text-2)" />
<text x="505" y="70" font-size="12" fill="var(--vp-c-brand-1)" text-anchor="end">还是右 3、上 2</text>
<text x="424" y="196" font-size="11" fill="var(--vp-c-text-3)" text-anchor="end">虚线：搬到原点再读</text>
<circle cx="300" cy="170" r="2.6" fill="var(--vp-c-text-2)" />
<text x="288" y="186" font-size="11" fill="var(--vp-c-text-3)">O</text>
</svg>
</FigBox>

还有第三样更容易混的东西：**列坐标**是「按两根轴各走多少」的读数，前提是先选定两根轴。同一个「右 3、上 2」，换一对斜着的轴去读，读数就变成另外两个数——位移没变，读数变了。所以读数跟着轴走，位移不跟。

**位置向量**专指起点摆在原点的那支箭；它只是向量的一种画法，不是定义。

## 二、接起来走、拉长、掉头

两趟走法可以接起来走。先走 $\mathbf v$（右 3、上 2），从它的终点再走 $\mathbf w$（右 1、上 2），总位移就是「右 4、上 4」：

$$
\mathbf v+\mathbf w=\begin{bmatrix}3+1\\2+2\end{bmatrix}=\begin{bmatrix}4\\4\end{bmatrix}
$$

逐项读：两个列坐标只在同一行上相加——上面的数管横、下面的数管纵，两条账各算各的。这就是加法可以逐分量做的原因。

图上还有第二种画法：把 $\mathbf v,\mathbf w$ 都从原点出发，用它们作两条邻边补成平行四边形，从原点出发的那条对角线就是 $\mathbf v+\mathbf w$。两条折线的走法顺序不同，所以图里画成一条实线、一条虚线；但它们的起点和终点相同，因此两种画法落在同一个点上。

<FigBox title="加法：两种走法，同一个终点 (4,4)" kind="几何" note="输入：v=(3,2) 与 w=(1,2) 都从原点出发。操作：实线先走 v 再走 w；虚线是另一种走法，先走 w。结果：两种走法都落在 (4,4)，即平行四边形从原点出发的对角线。看图能读出什么：加法与先后无关，所以能逐分量算。">
<svg viewBox="0 0 380 220" role="img" aria-label="加法平行四边形：v 等于三二，w 等于一二，和为四四">
<defs>
  <marker id="m2-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="m2-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)" />
  </marker>
</defs>
<line x1="20" y1="180" x2="360" y2="180" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="70" y1="204" x2="70" y2="20" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<polygon points="70,180 154,124 182,68 98,124" fill="var(--vp-c-brand-1)" opacity="0.12" />
<line x1="70" y1="180" x2="154" y2="124" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#m2-a)" />
<text x="158" y="132" font-size="12" fill="var(--vp-c-brand-1)">v</text>
<line x1="70" y1="180" x2="98" y2="124" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#m2-b)" />
<text x="76" y="120" font-size="12" fill="var(--vp-c-brand-2)">w</text>
<line x1="154" y1="124" x2="182" y2="68" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="98" y1="124" x2="182" y2="68" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="70" y1="180" x2="182" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#m2-a)" />
<text x="188" y="64" font-size="12.5" font-weight="600" fill="var(--vp-c-brand-1)">v + w = (4, 4)</text>
<text x="70" y="200" font-size="11" fill="var(--vp-c-text-3)">O</text>
<circle cx="70" cy="180" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

数乘是另一件事：把这段位移按倍数拉长、压短、或者掉头。

$$
2\mathbf v=\begin{bmatrix}6\\4\end{bmatrix},\qquad
-\mathbf v=\begin{bmatrix}-3\\-2\end{bmatrix},\qquad
0\,\mathbf v=\begin{bmatrix}0\\0\end{bmatrix}
$$

读法：$c\mathbf v$ 里 $c$ 是倍数。正数只改长度不改方向；负数先改长度再掉头 180°；$c=0$ 把整段位移压成零向量。坐标上是两个分量同时乘 $c$——只乘一个，箭头就歪了，这是本页最常见的错。

顺带记两个最小的走法：$\mathbf i=\begin{bmatrix}1\\0\end{bmatrix}$ 是「向右一格」，$\mathbf j=\begin{bmatrix}0\\1\end{bmatrix}$ 是「向上一格」；任何一趟走法都是「几个 $\mathbf i$ 加几个 $\mathbf j$」。

## 三、线性组合，以及它的反问题

先算一个具体的：$2\mathbf v+3\mathbf w$。按字面做，各拉各的，再相加：

$$
2\mathbf v+3\mathbf w
=2\begin{bmatrix}3\\2\end{bmatrix}+3\begin{bmatrix}1\\2\end{bmatrix}
=\begin{bmatrix}6\\4\end{bmatrix}+\begin{bmatrix}3\\6\end{bmatrix}
=\begin{bmatrix}9\\10\end{bmatrix}
$$

「给每个方向配一个倍数，各自拉长，再全部接起来」这个动作叫**线性组合**（linear combination）。$c\mathbf v+d\mathbf w$ 就是「$\mathbf v$ 走 $c$ 遍、$\mathbf w$ 走 $d$ 遍，两段位移接起来」。这里「线性」没有别的意思，就是说只许做两件事：乘一个数、相加；出现平方或者两支箭相乘，就不叫线性组合了。

<FigBox title="组合就是接起来走：先 2 个 v，再 3 个 w，落到 (9,10)" kind="几何" note="输入：两段位移 v=(3,2) 与 w=(1,2)。操作：先沿 v 走两遍到 (6,4)，再从那里沿 w 走三遍。结果：终点 (9,10)，与直接把系数代进坐标算出来的一致（虚线是直达的一条，实线是两段折线）。看图能读出什么：组合式里的两个系数，就是两条折线各走几遍。">
<svg viewBox="0 0 380 230" role="img" aria-label="线性组合 2v 加 3w 的折线路径，终点为九、十">
<defs>
  <marker id="m3-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="m3-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)" />
  </marker>
  <marker id="m3-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-danger-1)" />
  </marker>
</defs>
<line x1="30" y1="195" x2="360" y2="195" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="55" y1="216" x2="55" y2="10" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="55" y1="195" x2="163" y2="123" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#m3-a)" />
<text x="120" y="130" font-size="12" fill="var(--vp-c-brand-1)">2v</text>
<line x1="163" y1="123" x2="217" y2="15" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#m3-b)" />
<text x="176" y="72" font-size="12" fill="var(--vp-c-brand-2)">3w</text>
<line x1="55" y1="195" x2="217" y2="15" stroke="var(--vp-c-danger-1)" stroke-width="2.4" stroke-dasharray="5 3" marker-end="url(#m3-c)" />
<text x="226" y="30" font-size="12" font-weight="600" fill="var(--vp-c-danger-1)">b = (9, 10)</text>
<text x="55" y="212" font-size="11" fill="var(--vp-c-text-3)">O</text>
<circle cx="55" cy="195" r="2.6" fill="var(--vp-c-text-2)" />
<circle cx="163" cy="123" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

反过来问才有意思：如果终点是 $(9,10)$，问「$\mathbf v$ 走几遍、$\mathbf w$ 走几遍能到那里」？也就是求两个倍数 $c,d$：

$$
c\begin{bmatrix}3\\2\end{bmatrix}+d\begin{bmatrix}1\\2\end{bmatrix}
=\begin{bmatrix}9\\10\end{bmatrix}
\qquad\Longleftrightarrow\qquad
\begin{cases}3c+d=9\\ 2c+2d=10\end{cases}
$$

逐项读这个转换：上下两个分量各自相等，所以一个向量方程拆成两个普通方程。上面那行是横坐标的账（$3c$ 里的 3 来自 $\mathbf v$ 的横坐标，$d$ 里的 1 来自 $\mathbf w$ 的横坐标），下面那行是纵坐标的账。

这两个方程初中就会解。第一式给 $d=9-3c$，代入第二式：$2c+2(9-3c)=10$，即 $18-4c=10$，得 $c=2$；再回代 $d=3$。所以 $(9,10)=2\mathbf v+3\mathbf w$——正是刚才正着算出来的那一组数。正着算是组合，反着解是解二元方程组，同一件事的两个方向。

那什么时候反着问会出问题？看这两个方程代表的两条直线：不平行就有一个交点，给唯一的一组系数；平行或重合时，要么没有系数、要么有一整排系数。这件事得有个专门的说法，下一节就给它。

## 四、系数放开能扫到哪，以及哪一支是多余的

把 $c,d$ 从「这一组具体的数」放开成「任取实数」，$c\mathbf v+d\mathbf w$ 的终点就会扫过一片地方。这片地方叫 $\mathbf v,\mathbf w$ 的**张成**（span）。

在这个平面上，两支不共线的时候扫出来就是整个平面：随便给一个终点，横纵两笔账总解得出唯一的一组 $c,d$。但只要有一支躺在另一支那条直线上——比如把 $\mathbf w$ 换成 $\mathbf w'=\begin{bmatrix}6\\4\end{bmatrix}=2\mathbf v$——两笔账并成一笔，扫出来的只剩那一条直线，直线外的位置永远到不了。

<FigBox title="系数放开后扫到哪：一条线，还是整个平面" kind="几何" note="输入：左边是 v=(3,2) 与它的两倍 w′=(6,4)，右边是 v=(3,2) 与 w=(1,2)。操作：让两个系数各自取遍所有实数，把所有组合的终点画出来。结果：左边全被钉在那条虚线上，右边阴影里每一点都到得了，放开系数就铺满整张纸。看图能读出什么：能扫多大，只看两支箭是否指向不同方向。">
<svg viewBox="0 0 400 200" role="img" aria-label="共线时只能扫出一条直线，不共线时能扫满整个平面">
<defs>
  <marker id="m4-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="m4-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)" />
  </marker>
</defs>
<text x="96" y="24" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">共线 → 只剩一条线</text>
<text x="300" y="24" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">不共线 → 铺满平面</text>
<line x1="196" y1="10" x2="196" y2="190" stroke="var(--vp-c-divider)" stroke-width="1.4" stroke-dasharray="5 4" />
<line x1="26" y1="192" x2="176" y2="92" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="6 4" />
<line x1="46" y1="178" x2="102" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#m4-a)" />
<text x="106" y="136" font-size="11" fill="var(--vp-c-brand-1)">v</text>
<line x1="46" y1="178" x2="158" y2="102" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#m4-b)" />
<text x="110" y="98" font-size="11" fill="var(--vp-c-brand-2)">w′ = 2v</text>
<circle cx="46" cy="178" r="2.4" fill="var(--vp-c-text-2)" />
<polygon points="240,168 300,138 336,80 276,110" fill="var(--vp-c-brand-1)" opacity="0.14" />
<line x1="240" y1="168" x2="300" y2="138" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#m4-a)" />
<text x="304" y="140" font-size="11" fill="var(--vp-c-brand-1)">v</text>
<line x1="240" y1="168" x2="276" y2="110" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#m4-b)" />
<text x="262" y="104" font-size="11" fill="var(--vp-c-brand-2)">w</text>
<circle cx="240" cy="168" r="2.4" fill="var(--vp-c-text-2)" />
<text x="300" y="186" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">放开系数后铺满整张纸</text>
</svg>
</FigBox>

这里说的是「平面里两支箭」的情形。支数更多时规则不变，但张成有多大由「能扫出几个互不重复的方向」决定，不由支数决定——空间里三支箭若都躺在同一张平面上，扫出的就是那张平面，多一支不会自动多一个方向。

于是有了本页最后一个词。一组方向里，如果有一支能被其余几支凑出来（$\mathbf w'=2\mathbf v$ 就是），这一支是多余的，这组叫**线性相关**（linearly dependent）；反过来，谁也不能被其余几支凑出来，就叫**线性无关**（linearly independent）。

判断有没有多余，用的还是同一套解方程的本事。把倍数配上去凑零向量，问「除了全取 0，还有没有别的解」：

$$
c\mathbf v+d\mathbf w=\mathbf 0
$$

- 只有 $c=d=0$ 这一个解：没有多余的方向，线性无关。
- 还有别的解：有冗余，线性相关。

逐项读这条判据：左边是一段位移，右边是「哪也不去」。两支箭指向不同方向时，想让合位移为零只能两段都不走；它们在同一条直线上时，一段走两格、另一段反着走一格就抵掉了。拿本页的数字试：$\mathbf v=(3,2)$、$\mathbf w=(1,2)$ 时，$3c+d=0$ 与 $2c+2d=0$ 只有 $c=d=0$，无关；换成 $\mathbf w'=(6,4)$，取 $c=-2$、$d=1$ 就有 $-2\mathbf v+\mathbf w'=\mathbf 0$，非零解出现，相关。

顺带一个名字：像 $\mathbf i,\mathbf j$ 这样「够用又没有多余」的一组方向，叫平面的一组**基**（basis）。正式定义第 4 章给，本页不展开。

## 例题

::: tip 例 1 · 正着算一遍，反着再解一遍
**题目**：取 $\mathbf v=\begin{bmatrix}3\\2\end{bmatrix}$、$\mathbf w=\begin{bmatrix}1\\2\end{bmatrix}$、$\mathbf b=\begin{bmatrix}9\\10\end{bmatrix}$。（a）求 $2\mathbf v+3\mathbf w$；（b）把 $\mathbf b$ 写成 $\mathbf v,\mathbf w$ 的组合，求两个倍数。

**先猜**：两列分量都为正，倍数应当也是正数；纵坐标 10 是 2 的五倍，纵方向那支要多走几遍。

**再算**：
1. （a）各拉各的再相加：$2\mathbf v=\begin{bmatrix}6\\4\end{bmatrix}$、$3\mathbf w=\begin{bmatrix}3\\6\end{bmatrix}$，合起来 $(9,10)$。*（为什么：两条账互不干扰。）*
2. （b）设 $\mathbf b=c\mathbf v+d\mathbf w$，拆成 $\begin{cases}3c+d=9\\ 2c+2d=10\end{cases}$。*（为什么能拆：向量相等就是上下两个分量分别相等。）*
3. 由第一式 $d=9-3c$，代入第二式：$2c+2(9-3c)=10$，$18-4c=10$，$c=2$，回代得 $d=3$。

**再回代**：$c=2,d=3$ 代回两式：$3\times2+3=9$、$2\times2+2\times3=10$，都对上；按组合算 $2\mathbf v+3\mathbf w=(9,10)$，与（a）一致。
:::

::: tip 例 2 · 哪一组里有冗余
**题目**：判断（a）$\mathbf v=\begin{bmatrix}3\\2\end{bmatrix}$ 与 $\mathbf w=\begin{bmatrix}1\\2\end{bmatrix}$；（b）$\mathbf v$ 与 $\mathbf w'=\begin{bmatrix}6\\4\end{bmatrix}$，各是无关还是相关。

**先猜**：（a）两支箭方向明显不同，谁也不是谁的倍数，应该无关；（b）$6=2\times3$、$4=2\times2$，一支就是另一支的两倍，应该相关。

**再算**：
1. （a）解 $c\mathbf v+d\mathbf w=\mathbf 0$，即 $3c+d=0$、$2c+2d=0$。$d=-3c$ 代入第二式：$2c-6c=-4c=0$，只有 $c=d=0$。*（为什么这样就够：有非零解才算相关。）*
2. （b）解 $3c+6d=0$、$2c+4d=0$，两式其实是同一条，取 $d=1$ 得 $c=-2$。

**再回代**：把 $c=-2,d=1$ 代回组合：$-2\begin{bmatrix}3\\2\end{bmatrix}+\begin{bmatrix}6\\4\end{bmatrix}=\begin{bmatrix}0\\0\end{bmatrix}$，确实凑出了零向量，所以（b）相关；（a）只有全零解，无关。与「是否成倍数」的观察一致。
:::

## 这一页带走三句话

1. 向量是一段位移，列坐标是它在两根轴上的读数；点只有位置，位移不绑起点。
2. $c\mathbf v+d\mathbf w$ 就是「各走几遍、接起来」；正着算是组合，反着解是解二元方程组，同一件事。
3. 系数放开后扫到的地方叫张成；没有哪一支能被其余凑出来叫线性无关，判据是凑零向量只有全零解。

::: warning 本页最容易混的三处
- 把 $\begin{bmatrix}3\\2\end{bmatrix}$ 当成「(3,2) 那个点」。点回答在哪，位移回答怎么走。
- 数乘只乘了一个分量。$c\mathbf v$ 是两条腿一起乘 $c$。
- 看到分量不同就说无关。$(3,2)$ 与 $(6,4)$ 数字不同，但一支是另一支的两倍，它们相关。
:::

下一站是[02 · 矩阵与线性变换](./02-matrices.md)：换一个问法——不是「两支箭能凑到哪」，而是「整张纸被一条规则同时搬走」。
