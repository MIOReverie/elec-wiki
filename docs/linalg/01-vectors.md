---
title: 01 · 向量、线性组合与张成
description: 把向量先看成平面与空间里的箭头，再落到列坐标；用箭头建立线性组合、张成、线性无关与标准基的几何图景，最后用 node 验算把数字坐实。
---

# 01 · 向量、线性组合与张成

<Meta time="40 min" level="核心" note="全页只有一句话：箭头与列坐标是同一个东西的两面，线性组合、张成、线性无关全是从这句话长出来的" />

**这一页要解决什么**：你见过向量、也背过「线性相关」的定义，但一看到两个箭头就发懵——它们到底「扫出」了什么？读完这一页，你应该能：把平面里的箭头和它的列坐标自由切换；说出两个向量相加、数乘、线性组合在图上各是什么动作；判断两个（以及一组）向量什么时候张成直线、什么时候张成整个平面；并一眼看出「线性无关」的几何含义——没有一个箭头躺在别的箭头扫出的线里。

::: tip 读这页之前
- **需要会**：高中数学里的平面向量（箭头、坐标、平行四边形法则）与三元一次方程组的代入消元。这是本板块第一章，没有更靠前的前置章；后面每一章都会从这里的概念长出来。
- **这一页用到的符号**：向量用小写粗体 $\mathbf v$、$\mathbf w$，标量用普通小写 $c$、$k$；$c_1\mathbf v_1+c_2\mathbf v_2$ 读作「$c_1$ 倍的 $\mathbf v_1$ 加 $c_2$ 倍的 $\mathbf v_2$」。本章正文里每个术语第一次出现都当场解释，不要求你提前记得。
:::

先想象一个具体场景。你在纸上画了一个箭头，从原点指向 $(3,2)$ 那个点；你又画了第二个箭头指向 $(1,2)$。现在问你：这两个箭头加起来是什么？你隐约记得「平行四边形法则」，但更想知道——这两个箭头「扫」出来的是一整片区域，还是一条线？如果再加一个箭头，情况会不会变？这一页就是把这几个词——**线性组合、张成、线性无关、基**——全部翻译成「箭头扫过哪里」的画面，再告诉你每个画面对应的那行坐标怎么算。

## 结论先行

1. **向量先看图、再看坐标**：一个向量就是平面（或空间）里一段「有方向、有长度」的箭头；写成列向量 $\begin{bmatrix}3\\2\end{bmatrix}$ 只是把箭头的落点记下来，两者是同一个东西。
2. **加法和数乘都是「掰箭头」**：加法是首尾相接走折线（平行四边形对角线），数乘是把箭头拉伸 $c$ 倍、$c<0$ 时掉头，坐标上就是逐分量加、逐分量乘。
3. **线性组合 = 每个箭头先拉伸、再相加**：$c_1\mathbf v_1+c_2\mathbf v_2$ 里让两个系数各自跑遍所有实数，箭头扫出的就是**张成**。
4. **两个向量的张成只有三种结局**：都为零向量 → 一个点；共线 → 一条直线；不共线 → 整个平面。
5. **线性无关 = 谁也不在别人扫出的线上**：一组向量线性无关，等价于「只有全零系数才能让它们的组合等于零向量」，也等价于它们张成的空间维数等于向量个数。

## 一、向量：先看见箭头，再写坐标

这一节的目标是让你在「几何箭头」和「列坐标」之间来回切换不费力——先记住向量是一段箭头，然后明白坐标只是箭头的落点记录。

**向量**（vector）是两个信息的组合：**方向**和**长度**（长度也叫模或范数）。在平面上它就是一段箭头，从某一点出发，指向另一点；和物理里的「位移」同源——从 A 走到 B，方向是 A 指向 B，长度是两点的距离。与它相对的是**标量**（scalar）：一个孤零零的实数，只有大小、没有方向，比如温度、质量、或者是下面马上要用来「拉伸」箭头的那几个系数。

把箭头放进坐标系，就有了最省事的记录方式：**列向量**（column vector）只记箭头末端相对于原点的坐标。箭头从原点 $O$ 指向 $(3,2)$，就写成

$$
\mathbf v = \begin{bmatrix}3\\2\end{bmatrix}
$$

第一行是横坐标（沿 $x$ 轴走多远），第二行是纵坐标（沿 $y$ 轴走多远）。**这两个数不是「点的坐标」，而是「怎么从原点走到箭头尖」的路线**：先向右 3、再向上 2。

<FigBox title="同一个向量：左边是箭头，右边是列坐标" kind="几何" note="箭头从原点出发落到 (3,2)；两条虚线分别是它向 x 轴、y 轴的投影，落点 3 和 2 就是列向量的两个分量。看图能读出什么：向量完全由方向和长度决定，把它平移到任何起点都不变——所以习惯上都把起点放在原点，只记终点的两个数。">
<svg viewBox="0 0 340 220" role="img" aria-label="坐标系里的向量箭头，从原点指向 3,2，虚线标出横坐标 3 与纵坐标 2">
<defs>
  <marker id="fig1-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="20" y1="188" x2="328" y2="188" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="44" y1="210" x2="44" y2="14" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="332" y="192" font-size="11" fill="var(--vp-c-text-3)">x</text>
<text x="50" y="18" font-size="11" fill="var(--vp-c-text-3)">y</text>
<line x1="164" y1="108" x2="164" y2="188" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
<line x1="164" y1="108" x2="44" y2="108" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
<line x1="44" y1="188" x2="164" y2="108" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#fig1-ah)" />
<text x="170" y="104" font-size="12.5" font-weight="600" fill="var(--vp-c-brand-1)">v = (3, 2)</text>
<text x="160" y="202" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">3</text>
<text x="36" y="112" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="end">2</text>
<circle cx="44" cy="188" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

把向量当成「路线」而不是「点」，是后面一切直觉的地基：加两个向量，就是先走第一段路、再走第二段路；数乘一个向量，就是把这段路按比例拉长或掉头。下面两节就是这两个动作的图上画法和坐标算法。

## 二、向量加减与数乘：平行四边形与拉伸

这一节的目标是搞清两个最基础的动作——把两个箭头「接起来走」是加法，把箭头「按比例拉长」是数乘——并且让图上动作与坐标算法一一对应。

**加法**的几何规则是**首尾相接**：要算 $\mathbf v+\mathbf w$，把 $\mathbf w$ 的起点搬到 $\mathbf v$ 的终点，再走完 $\mathbf w$，总位移就是 $\mathbf v+\mathbf w$。因为平移不改变向量，也可以把两个向量都从原点出发，用它们作邻边补成一个平行四边形——**对角线就是和**，这就是高中数学里的平行四边形法则。坐标上就是**逐分量相加**：两个列向量把对应位置的两个数各自加起来。

**数乘**（scalar multiplication）是「拉伸」：$c\,\mathbf v$ 把箭头的长度变成原来的 $|c|$ 倍，方向不变；$c<0$ 时再掉头 180°，$c=0$ 时缩成零向量 $\mathbf 0$（没有方向、长度为零的特殊向量）。坐标上就是**每个分量都乘 $c$**。

<FigBox title="向量加法：平行四边形，对角线就是和" kind="几何" note="v=(3,1) 与 w=(1,2) 作邻边，阴影是平行四边形，对角线 v+w=(4,3)。两条虚线是「把 w 平移接到 v 的终点」与「把 v 平移接到 w 的终点」，殊途同归到同一个顶点。看图能读出什么：加法与谁先谁后无关，两条虚线指向同一个点，说明 v+w=w+v。">
<svg viewBox="0 0 340 220" role="img" aria-label="向量加法的平行四边形：v 与 w 为邻边，阴影平行四边形，对角线为 v 加 w">
<defs>
  <marker id="fig2-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="20" y1="188" x2="328" y2="188" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="44" y1="210" x2="44" y2="14" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<text x="332" y="192" font-size="11" fill="var(--vp-c-text-3)">x</text>
<text x="50" y="18" font-size="11" fill="var(--vp-c-text-3)">y</text>
<polygon points="44,188 164,148 204,68 84,108" fill="var(--vp-c-brand-1)" opacity="0.12" />
<line x1="44" y1="188" x2="84" y2="108" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig2-ah)" />
<text x="50" y="104" font-size="12" fill="var(--vp-c-brand-2)">w</text>
<line x1="44" y1="188" x2="164" y2="148" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig2-ah)" />
<text x="168" y="152" font-size="12" fill="var(--vp-c-brand-1)">v</text>
<line x1="164" y1="148" x2="204" y2="68" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="84" y1="108" x2="204" y2="68" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="44" y1="188" x2="204" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#fig2-ah)" />
<text x="210" y="66" font-size="12.5" font-weight="600" fill="var(--vp-c-brand-1)">v + w</text>
<circle cx="44" cy="188" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

<FigBox title="数乘：把箭头拉伸、压短或掉头" kind="几何" note="v=(2,1) 与它的 2 倍、−1 倍落在同一条直线上。看图能读出什么：数乘只改长度和朝向，不改这条直线本身——这也是下一节线性相关判断的种子：一条直线上的向量永远只能扫出这条直线。">
<svg viewBox="0 0 320 220" role="img" aria-label="数乘示意图：向量 v 及其两倍、负一倍沿同一直线方向拉伸或反向">
<defs>
  <marker id="fig3-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="16" y1="140" x2="310" y2="140" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="120" y1="210" x2="120" y2="14" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="170" x2="240" y2="80" stroke="var(--vp-c-divider)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="120" y1="140" x2="180" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig3-ah)" />
<text x="150" y="104" font-size="12" fill="var(--vp-c-brand-1)">v</text>
<line x1="120" y1="140" x2="240" y2="80" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig3-ah)" />
<text x="244" y="78" font-size="12" fill="var(--vp-c-brand-2)">2v</text>
<line x1="120" y1="140" x2="60" y2="170" stroke="var(--vp-c-danger-1)" stroke-width="2.4" marker-end="url(#fig3-ah)" />
<text x="28" y="178" font-size="12" fill="var(--vp-c-danger-1)">−v</text>
<circle cx="120" cy="140" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

代数上两件事都「傻到不用记公式」：加法逐分量加，数乘逐分量乘。比如 $\mathbf v=\begin{bmatrix}3\\1\end{bmatrix}$、$\mathbf w=\begin{bmatrix}1\\2\end{bmatrix}$，则 $\mathbf v+\mathbf w=\begin{bmatrix}3+1\\1+2\end{bmatrix}=\begin{bmatrix}4\\3\end{bmatrix}$，$2\mathbf v=\begin{bmatrix}6\\2\end{bmatrix}$。这两个动作之所以重要，是因为它们能「拼」出任何新箭头——把「拉伸」和「相加」串起来，就得到本页的核心概念：线性组合。下面这一节就把这两个动作合成一个词。

## 三、线性组合：每个箭头先拉伸，再相加

这一节的目标是把前两节的两个动作打包成一个词——线性组合——并说清它在图上是「扫过一片区域」，而不是随便算出一个点。

**线性组合**（linear combination）就是：给一组向量 $\mathbf v_1,\mathbf v_2,\dots$ 各配一个标量系数 $c_1,c_2,\dots$，先各自拉伸、再把结果相加：

$$
c_1\mathbf v_1 + c_2\mathbf v_2 + \cdots
$$

「线性」的意思正是「只许拉伸 + 相加」，不许出现 $\mathbf v_1^2$、$\mathbf v_1\mathbf v_2$、$\sin(\mathbf v_1)$ 这类非线性操作。系数就是每个箭头的「音量旋钮」：转大一点，这个箭头贡献多；设成零，这个箭头退场；设成负，这个箭头反向拉伸。

图上的读法是：让两个系数各自独立地跑遍所有实数，$c_1\mathbf v_1+c_2\mathbf v_2$ 的终点就**扫过一片区域**。先把两个系数都限制在 $0\le c\le1$，扫出的恰好是以 $\mathbf v_1,\mathbf v_2$ 为邻边的平行四边形；放开限制，这片平行四边形沿两个方向无限铺开，盖满一块更大的地方——那块地方就是下一节要定义的「张成」。

<FigBox title="线性组合：先拉伸再相加，扫出平行四边形" kind="几何" note="v₁=(2,1)、v₂=(−1,2)。阴影是 0≤c₁,c₂≤1 时所有组合扫出的平行四边形；红色虚线是具体一个组合 2v₁+v₂=(3,4)，它落在了平行四边形之外——系数超过 1 就能扫到外面去。看图能读出什么：改变两个系数，终点能在整个平面里游走，游走范围就是这两个箭头的张成。">
<svg viewBox="0 0 340 220" role="img" aria-label="线性组合示意图：两个向量扫出的阴影平行四边形，以及一个具体组合 2v1 加 v2 的虚线箭头">
<defs>
  <marker id="fig4-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="16" y1="188" x2="328" y2="188" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="210" x2="60" y2="14" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<polygon points="60,188 132,152 96,80 24,116" fill="var(--vp-c-brand-1)" opacity="0.14" />
<line x1="132" y1="152" x2="96" y2="80" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
<line x1="24" y1="116" x2="96" y2="80" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
<line x1="60" y1="188" x2="132" y2="152" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig4-ah)" />
<text x="140" y="154" font-size="12" fill="var(--vp-c-brand-1)">v₁</text>
<line x1="60" y1="188" x2="24" y2="116" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig4-ah)" />
<text x="4" y="112" font-size="12" fill="var(--vp-c-brand-2)">v₂</text>
<line x1="60" y1="188" x2="168" y2="44" stroke="var(--vp-c-danger-1)" stroke-width="2.4" marker-end="url(#fig4-ah)" stroke-dasharray="5 3" />
<text x="174" y="46" font-size="12" fill="var(--vp-c-danger-1)">2v₁ + v₂ = (3,4)</text>
<circle cx="60" cy="188" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

线性组合的威力在于「参数化」：一个组合式里藏着无穷多个结果，转动系数就能走遍一片区域。于是自然的问题来了——这片区域到底有多大？是一条线、一个平面、还是整个空间？这就是下一节要回答的问题，也是「张成」这个词的全部内容。

## 四、张成 span：两个箭头扫出线、面还是空间

这一节的目标是给「张成」下一个能算的定义，并记住两个向量扫出的三种结局——零向量扫出点、共线扫出直线、不共线扫出平面。

**张成**（span）是一组向量所有线性组合组成的集合：

$$
\operatorname{span}\{\mathbf v_1,\mathbf v_2,\dots\}
= \bigl\{\,c_1\mathbf v_1+c_2\mathbf v_2+\cdots \,\bigm|\, c_i\in\mathbb R \,\bigr\}
$$

换句话说，张成就是「把系数旋钮全部转到最大自由度，箭头尖能到达的所有地方」。单独一个非零向量，数乘只能沿它自己那根直线伸缩，所以 span 是一条过原点的直线；两个向量就不一定了，分三种情况：

- 两个都为零向量：只能组合出原点这一个点；
- 两个共线（一个是另一个的倍数）：所有组合仍在同一根直线上，span 还是一条线；
- 两个不共线：两个方向各铺一条直线，组合起来盖满整个平面，span 是整个 $\mathbb R^2$。

<FigBox title="张成的两种结局：共线扫直线，不共线扫平面" kind="几何" note="左：v₁=(2,4) 与 v₂=(1,2) 共线，所有组合都被钉在同一条直线上；右：v₁=(2,1) 与 v₂=(−1,3) 不共线，阴影平行四边形沿两个方向铺开，盖满整个平面。看图能读出什么：能否扫出平面，只取决于两个箭头是否「指向不同方向」。">
<svg viewBox="0 0 340 210" role="img" aria-label="张成对比图：左侧共线两个向量只扫出直线，右侧不共线两个向量扫出整个平面">
<defs>
  <marker id="fig5-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<text x="90" y="24" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">共线 → 一条线</text>
<text x="270" y="24" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">不共线 → 平面</text>
<line x1="180" y1="10" x2="180" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.4" stroke-dasharray="5 4" />
<!-- 左：共线 -->
<line x1="40" y1="180" x2="130" y2="0" stroke="var(--vp-c-divider)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="55" y1="150" x2="115" y2="30" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig5-ah)" />
<line x1="55" y1="150" x2="85" y2="90" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig5-ah)" />
<text x="120" y="32" font-size="11" fill="var(--vp-c-brand-1)">v₁</text>
<text x="88" y="92" font-size="11" fill="var(--vp-c-brand-2)">v₂</text>
<circle cx="55" cy="150" r="2.4" fill="var(--vp-c-text-2)" />
<!-- 右：不共线 -->
<polygon points="250,150 298,126 274,54 226,78" fill="var(--vp-c-brand-1)" opacity="0.16" />
<line x1="250" y1="150" x2="298" y2="126" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig5-ah)" />
<text x="302" y="128" font-size="11" fill="var(--vp-c-brand-1)">v₁</text>
<line x1="250" y1="150" x2="226" y2="78" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig5-ah)" />
<text x="206" y="76" font-size="11" fill="var(--vp-c-brand-2)">v₂</text>
<line x1="298" y1="126" x2="274" y2="54" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
<line x1="226" y1="78" x2="274" y2="54" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
<circle cx="250" cy="150" r="2.4" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

所以「两个箭头能扫出多大地方」完全由「它们是否指向同一根直线」决定。这个「是否共线」的判断，正是下一节的**线性无关/线性相关**——它把刚才的几何观察升级成一个可以推广到任意多个向量的代数判据。

## 五、线性无关与线性相关：谁也别躺在别人扫出的线上

这一节的目标是给「共线」这件事一个可计算的判据：线性无关，并且说清为什么「无关」是后面基与维数的地基。

先给术语。**线性相关**（linearly dependent）：这组向量里，至少有一个向量能被其余向量的线性组合表示出来——换句话说，有一个向量「躺在」别人扫出的空间里，它是多余的。**线性无关**（linearly independent）：组里没有任何一个向量能被其余向量组合出来——谁也不是多余的，每个向量都给张成增加一个新的独立方向。

判据用零向量写最干净：一组向量 $\mathbf v_1,\dots,\mathbf v_n$ 线性无关，当且仅当方程

$$
c_1\mathbf v_1+c_2\mathbf v_2+\cdots+c_n\mathbf v_n=\mathbf 0
$$

**只有零解**（$c_1=c_2=\cdots=c_n=0$）。若存在一组不全为零的系数也能把它凑成零向量，就是线性相关。两个向量的特例最直观：$\mathbf v_1,\mathbf v_2$ 线性相关 $\iff$ 共线（一个是另一个的倍数）$\iff$ 它们围出的平行四边形面积为 0；无关 $\iff$ 不共线 $\iff$ 面积不为 0。面积在坐标上有一个现成的计算：把两个向量当列排成 $2\times2$ 矩阵，**行列式**（determinant，记作 $\det$）的绝对值就是那面积——行列式的完整讲法在后面章节，这里只借用「面积为零」这一句。

有了「无关」才有「基」：无关保证没有冗余，张成保证够用。下面最后一节把这两个条件合起来，给出全平面最顺手的一组基。

## 六、标准基：两根坐标轴上的单位箭头

这一节的目标是引出「基」这个词，并用 $\mathbf i,\mathbf j$ 说明任何一个平面向量都能唯一地写成它们的线性组合。

**基**（basis）是一组向量，同时满足两条：它**张成**整个空间（组合够用），且**线性无关**（没有冗余）。平面 $\mathbb R^2$ 最自然的一组基是两根坐标轴方向的单位箭头：

$$
\mathbf e_1=\begin{bmatrix}1\\0\end{bmatrix},\qquad
\mathbf e_2=\begin{bmatrix}0\\1\end{bmatrix}
$$

习惯上也记作 $\mathbf i=\begin{bmatrix}1\\0\end{bmatrix}$、$\mathbf j=\begin{bmatrix}0\\1\end{bmatrix}$。任何一个向量都能唯一地拆成它们的线性组合：$\begin{bmatrix}3\\2\end{bmatrix}=3\mathbf i+2\mathbf j$，系数 3 和 2 就是列向量的两个分量——这正是第一节把坐标读作「路线」的由来。

<FigBox title="标准基 i、j：任何向量都能拆成它们的线性组合" kind="几何" note="i=(1,0)、j=(0,1) 是两根轴方向的单位箭头。v=(3,2) 先沿 i 走 3 格（3i），再沿 j 走 2 格（2j），阴影矩形记录这条路线。看图能读出什么：i 和 j 不共线、又够用，所以能唯一地表示平面里每一个向量——「基」就是这一组坐标轴。">
<svg viewBox="0 0 320 200" role="img" aria-label="标准基示意图：i 和 j 两根单位箭头，向量 v 等于 3 个 i 加 2 个 j">
<defs>
  <marker id="fig6-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="20" y1="172" x2="310" y2="172" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="196" x2="60" y2="12" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<polygon points="60,172 180,172 180,92 60,92" fill="var(--vp-c-brand-1)" opacity="0.1" />
<line x1="60" y1="172" x2="100" y2="172" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig6-ah)" />
<text x="100" y="190" font-size="11" fill="var(--vp-c-brand-1)" text-anchor="middle">i</text>
<line x1="60" y1="172" x2="60" y2="132" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig6-ah)" />
<text x="48" y="132" font-size="11" fill="var(--vp-c-brand-2)" text-anchor="end">j</text>
<line x1="60" y1="172" x2="180" y2="172" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#fig6-ah)" />
<text x="180" y="190" font-size="11" fill="var(--vp-c-brand-1)" text-anchor="middle">3i</text>
<line x1="180" y1="172" x2="180" y2="92" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#fig6-ah)" />
<text x="188" y="120" font-size="11" fill="var(--vp-c-brand-2)">2j</text>
<line x1="60" y1="172" x2="180" y2="92" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#fig6-ah)" />
<text x="186" y="88" font-size="12.5" font-weight="600" fill="var(--vp-c-brand-1)">v = (3,2)</text>
<circle cx="60" cy="172" r="2.6" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

基的妙处是「唯一」：无关排除了冗余、张成保证了够用，两者合起来，每个向量对基的系数组合**有且只有一种**。这一句是全书最值钱的伏笔——后面讲矩阵、线性变换、坐标变换时，本质都是「换一组基，重新读同一堆箭头」。到这里，概念全部落地，下面三道例题把数字坐实。

## 典型例题（数字均经 node 验算）

::: tip 例 1 · 向量加法与数乘的坐标账
**题目**：$\mathbf v_1=\begin{bmatrix}3\\2\end{bmatrix}$、$\mathbf v_2=\begin{bmatrix}1\\4\end{bmatrix}$，求 $\mathbf v_1+\mathbf v_2$、$2\mathbf v_1$、$-\mathbf v_1$。

<FigBox title="例 1：平行四边形加法与数乘" kind="几何" note="v₁=(3,2)、v₂=(1,4) 作邻边，对角线 v₁+v₂=(4,6)；同一条直线上的箭头是数乘 2v₁、−v₁。看图能读出什么：加法和数乘在图上互不干扰，加法走对角线，数乘只拉伸方向不变。">
<svg viewBox="0 0 300 220" role="img" aria-label="例1平行四边形加法：v1 加 v2 等于 4,6，及数乘 2v1 与负 v1">
<defs>
  <marker id="ex1-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="16" y1="200" x2="292" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="56" y1="218" x2="56" y2="12" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<polygon points="56,200 128,152 152,56 80,104" fill="var(--vp-c-brand-1)" opacity="0.12" />
<line x1="56" y1="200" x2="80" y2="104" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#ex1-ah)" />
<text x="62" y="100" font-size="11" fill="var(--vp-c-brand-2)">v₂</text>
<line x1="56" y1="200" x2="128" y2="152" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#ex1-ah)" />
<text x="134" y="156" font-size="11" fill="var(--vp-c-brand-1)">v₁</text>
<line x1="128" y1="152" x2="152" y2="56" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="80" y1="104" x2="152" y2="56" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="56" y1="200" x2="152" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="2.6" marker-end="url(#ex1-ah)" />
<text x="158" y="54" font-size="11.5" font-weight="600" fill="var(--vp-c-brand-1)">v₁+v₂=(4,6)</text>
<circle cx="56" cy="200" r="2.4" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

**先想什么**：加法逐分量加、数乘逐分量乘，没有要背的公式；容易错的是把 $-\mathbf v_1$ 的分量符号漏一个。

**步骤**：
1. $\mathbf v_1+\mathbf v_2=\begin{bmatrix}3+1\\2+4\end{bmatrix}=\begin{bmatrix}4\\6\end{bmatrix}$；
2. $2\mathbf v_1=\begin{bmatrix}2\times3\\2\times2\end{bmatrix}=\begin{bmatrix}6\\4\end{bmatrix}$；*（为什么每个分量都乘 2：数乘是把整段箭头按比例拉长，横纵两条腿一起拉。）*
3. $-\mathbf v_1=\begin{bmatrix}-3\\-2\end{bmatrix}$。*（为什么是负号：负系数等于掉头 180°，两个分量同时取反。）*

**验算**：`[3,2]+[1,4] = [4,6]`、`2*[3,2] = [6,4]`、`-1*[3,2] = [-3,-2]`，与图上平行四边形对角线、同一直线上的拉伸方向一致。
:::

::: tip 例 2 · 线性组合与反向分解
**题目**：$\mathbf v_1=\begin{bmatrix}2\\1\end{bmatrix}$、$\mathbf v_2=\begin{bmatrix}-1\\3\end{bmatrix}$。（a）求 $2\mathbf v_1+3\mathbf v_2$；（b）把 $\mathbf b=\begin{bmatrix}1\\11\end{bmatrix}$ 写成 $\mathbf v_1,\mathbf v_2$ 的线性组合。

<FigBox title="例 2：线性组合的首尾相接分解" kind="几何" note="从原点先走 2v₁，再从它的终点走 3v₂，恰好到达 b=(1,11)。看图能读出什么：解「b 是不是 v₁、v₂ 的组合」就是解「沿这两个方向各走多少步能到 b」，代数上对应解一个二元一次方程组。">
<svg viewBox="0 0 300 210" role="img" aria-label="例2线性组合分解：2v1 加 3v2 等于向量 b 为 1,11">
<defs>
  <marker id="ex2-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="16" y1="190" x2="292" y2="190" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="206" x2="60" y2="12" stroke="var(--vp-c-divider)" stroke-width="1.2" />
<line x1="60" y1="190" x2="116" y2="162" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#ex2-ah)" />
<text x="88" y="178" font-size="11" fill="var(--vp-c-brand-1)">2v₁</text>
<line x1="116" y1="162" x2="74" y2="36" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#ex2-ah)" />
<text x="104" y="100" font-size="11" fill="var(--vp-c-brand-2)">3v₂</text>
<line x1="60" y1="190" x2="74" y2="36" stroke="var(--vp-c-danger-1)" stroke-width="2.4" marker-end="url(#ex2-ah)" stroke-dasharray="5 3" />
<text x="30" y="40" font-size="11.5" font-weight="600" fill="var(--vp-c-danger-1)">b=(1,11)</text>
<circle cx="60" cy="190" r="2.4" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

**先想什么**：（a）直接逐分量算；（b）本质是解方程组——把 $\mathbf b$ 的横纵坐标分别等于组合式的横纵坐标。

**步骤**：
1. $2\mathbf v_1+3\mathbf v_2=\begin{bmatrix}4\\2\end{bmatrix}+\begin{bmatrix}-3\\9\end{bmatrix}=\begin{bmatrix}1\\11\end{bmatrix}$；*（为什么先乘后加：线性组合的定义就是「先各自拉伸，再相加」。）*
2. 设 $\mathbf b=c_1\mathbf v_1+c_2\mathbf v_2$，即 $\begin{bmatrix}2c_1-c_2\\c_1+3c_2\end{bmatrix}=\begin{bmatrix}1\\11\end{bmatrix}$，得方程组 $2c_1-c_2=1,\ c_1+3c_2=11$；
3. 由第一式 $c_2=2c_1-1$ 代入第二式：$c_1+3(2c_1-1)=11\Rightarrow7c_1=14\Rightarrow c_1=2,\ c_2=3$。*（为什么恰好与（a）的系数相同：同一个组合式，正反两个方向，答案自然一致。）*

**验算**：`2*[2,1]+3*[-1,3] = [1,11]` ✓；回代 $2\times2-3=1$、$2+3\times3=11$ ✓。这也说明（a）（b）是同一件事的两个问法：正着组合、反着分解。
:::

::: tip 例 3 · 线性相关的判定
**题目**：判断（a）$\mathbf v_1=\begin{bmatrix}2\\4\end{bmatrix},\mathbf v_2=\begin{bmatrix}1\\2\end{bmatrix}$；（b）$\mathbf u_1=\begin{bmatrix}2\\1\end{bmatrix},\mathbf u_2=\begin{bmatrix}-1\\3\end{bmatrix}$ 各是否线性无关。

<FigBox title="例 3：共线相关、不共线无关" kind="几何" note="左：(2,4) 与 (1,2) 共线，围成的平行四边形退化成一条线，面积（行列式）为 0，相关；右：(2,1) 与 (−1,3) 不共线，围出面积为 7 的平行四边形，无关。看图能读出什么：线性无关的几何本质就是「两个箭头指向不同方向、能围出一块非零面积」。">
<svg viewBox="0 0 340 210" role="img" aria-label="例3线性相关判定：左侧共线两个向量围成零面积，右侧不共线围成非零面积">
<defs>
  <marker id="ex3-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<text x="90" y="24" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">相关：面积 0</text>
<text x="270" y="24" font-size="12" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">无关：面积 7</text>
<line x1="180" y1="10" x2="180" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.4" stroke-dasharray="5 4" />
<line x1="40" y1="180" x2="130" y2="0" stroke="var(--vp-c-divider)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="55" y1="150" x2="115" y2="30" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#ex3-ah)" />
<text x="120" y="32" font-size="11" fill="var(--vp-c-brand-1)">v₁</text>
<line x1="55" y1="150" x2="85" y2="90" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#ex3-ah)" />
<text x="88" y="92" font-size="11" fill="var(--vp-c-brand-2)">v₂</text>
<circle cx="55" cy="150" r="2.4" fill="var(--vp-c-text-2)" />
<polygon points="250,150 298,126 274,54 226,78" fill="var(--vp-c-brand-1)" opacity="0.16" />
<line x1="250" y1="150" x2="298" y2="126" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#ex3-ah)" />
<text x="302" y="128" font-size="11" fill="var(--vp-c-brand-1)">u₁</text>
<line x1="250" y1="150" x2="226" y2="78" stroke="var(--vp-c-brand-2)" stroke-width="2.4" marker-end="url(#ex3-ah)" />
<text x="206" y="76" font-size="11" fill="var(--vp-c-brand-2)">u₂</text>
<line x1="298" y1="126" x2="274" y2="54" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
<line x1="226" y1="78" x2="274" y2="54" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
<circle cx="250" cy="150" r="2.4" fill="var(--vp-c-text-2)" />
</svg>
</FigBox>

**先想什么**：两个向量时，判断无关只需看「是否共线」，即一个是另一个的倍数；要更机械化，就算它们当列排成的矩阵行列式是否为零。

**步骤**：
1. （a）$\mathbf v_2=\frac12\mathbf v_1$，共线，所以线性相关；行列式 $\begin{vmatrix}2&1\\4&2\end{vmatrix}=2\times2-4\times1=0$，面积为零，两者互相印证；
2. （b）$\mathbf u_1,\mathbf u_2$ 没有倍数关系，不共线，线性无关；行列式 $\begin{vmatrix}2&-1\\1&3\end{vmatrix}=2\times3-1\times(-1)=7\neq0$，面积非零。

**验算**：`det([[2,1],[4,2]]) = 0`、`det([[2,-1],[1,3]]) = 7` ✓。（a）中只要取 $c_1=-1,c_2=2$ 就有 $-1\,\mathbf v_1+2\,\mathbf v_2=\mathbf 0$，存在非零解，故相关；（b）中 $c_1\mathbf u_1+c_2\mathbf u_2=\mathbf 0$ 解出只有 $c_1=c_2=0$，故无关。
:::

## 易错清单 + 自检

- **向量不是点**：$\begin{bmatrix}3\\2\end{bmatrix}$ 不是「$(3,2)$ 这个点」，而是「从原点走到 $(3,2)$ 的路线」。平移不改变向量，所以所有箭头都默认从原点出发。
- **数乘别只乘一个分量**：$c\mathbf v$ 是把横纵两条腿一起乘 $c$，漏一个分量箭头就「歪」了。
- **张成三种结局要分清**：零向量 → 点；共线 → 直线；不共线 → 平面。看到「两个向量张成什么」，先看它们是否共线。
- **相关不等于「完全一样」**：$\begin{bmatrix}2\\4\end{bmatrix}$ 与 $\begin{bmatrix}1\\2\end{bmatrix}$ 不相等，但一个躺在另一个扫出的线上，照样线性相关；判断看方向、看行列式，不看分量是否相等。
- **零解判据要双向记**：无关 $\iff$ 只有零解；只要找到一组不全为零的系数凑出零向量，就立刻是相关。

**自检**：任取 $\mathbf v_1=\begin{bmatrix}2\\1\end{bmatrix}$，问自己——$\operatorname{span}\{\mathbf v_1\}$ 是什么图形？再加一个 $\mathbf v_2=\begin{bmatrix}4\\2\end{bmatrix}$，span 变没变、为什么？换成 $\mathbf v_2=\begin{bmatrix}-1\\3\end{bmatrix}$ 呢？三个问题都能用「箭头扫过哪里」答上来，这一页就真正是你的了。下一章我们把这套箭头语言用到一个新动作上：把整张坐标网格「掰」到新位置——那就是矩阵与线性变换。
