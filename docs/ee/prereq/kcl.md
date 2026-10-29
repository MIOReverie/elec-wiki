---
title: 基尔霍夫电流定律 KCL
description: 结点上电流为什么必须带符号相加、负号意味着什么、广义结点怎么把一大块电路缩成一个式子，以及高频下它为什么失效。
---

# 基尔霍夫电流定律 KCL

<Meta time="5 min" level="卡片" note="KCL 用的是参考方向下的代数值，不是绝对值；先定「流入为正」再代数相加，符号自己会告诉你答案" />

一道题算出 $I_3=-1$ A，学生擦掉重算，连算三遍还是负的。其实负号就是答案：电流方向和他画的箭头相反。KCL 里没有「算错」的负电流，只有还没读懂的负号。

## 一个结点，任何一个时刻

日常那句话说得很准：三通水管上，进来的水等于出去的水，水不会在接口处凭空多出来。搬到电路里，就是任一结点、任一时刻，穿过该结点各支路电流的代数和为零：

$$
\sum I = 0 \quad \Longleftrightarrow \quad \sum I_{入} = \sum I_{出}
$$

背后的原因是电荷守恒：结点不能堆积电荷。假如流入真的不等于流出，多出来的电荷会把结点电位一路推高，直到电流自己停下来，这跟稳态矛盾。落到纸面上就是 $\sum I = 0$ 这一行。

::: tip 一句话抓住本质
KCL 说的不是「电流守恒」，是电荷守恒在结点上的投影。它跟元件性质无关：电阻、电容、电源、受控源一视同仁，线性非线性、直流交流都成立。
:::

| 符号 | 含义 |
| --- | --- |
| $I$ | 电流，带参考方向 |
| $I_{入}$、$I_{出}$ | 相对于该结点的流入电流、流出电流 |
| 结点 | 三条或三条以上支路相接的连接点 |

## 唯一的坑：方向

每个 $I$ 都带着它相对结点的方向，不是各支路电流的绝对值相加。做法只有一步：全题统一约定「流入为正、流出为负」，然后代数相加。

算得负值，说明实际方向与你假设的箭头相反。别说「电流是负的」，物理上没有这回事。

<CircuitFig kind="node-loop" title="KCL 对结点，KVL 对回路" note="左边是「点」：几条支路在一个结点相遇，电流的代数和为零。右边是「圈」：沿一个回路走一圈，各段电压的代数和为零。后面所有分析方法都是这两件事的不同写法。" />

## 广义结点：把一大块电路缩成一个点

电路里任意一块区域，只要用闭合面圈起来，穿过这个面的电流代数和也是 0。

这是 KCL 最省时间的用法。想知道「流入某一块电路的总电流」，不必逐条支路去算，在那一块外面画个圈，对穿过这个圈的电流列一次 KCL，一个方程收工。

<FigBox title="广义结点：圈住一块电路，只数穿过边界的电流" kind="结构" note="闭合面内部有多少结点、多少支路都不重要，穿进穿出的电流代数和为零。求某块电路的总电流、求放大器输入端的偏置电流，都用这一招。">

<svg viewBox="0 0 470 222" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<rect x="140" y="58" width="200" height="120" rx="14" stroke-dasharray="6 4"/>
<text x="240" y="114" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">闭合面</text>
<text x="240" y="136" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">可圈住任意一块电路</text>
<line x1="56" y1="88" x2="140" y2="88"/>
<line x1="70" y1="88" x2="124.4" y2="88"/>
<path d="M130 88 L122.7 91.26 L122.7 84.74 Z" class="sf-solid"/>
<text x="64" y="70" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">I₁</text>
<line x1="140" y1="158" x2="56" y2="158"/>
<line x1="126" y1="158" x2="71.6" y2="158"/>
<path d="M66 158 L73.3 154.74 L73.3 161.26 Z" class="sf-solid"/>
<text x="64" y="180" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">I₂</text>
<line x1="340" y1="112" x2="424" y2="112"/>
<line x1="352" y1="112" x2="406.4" y2="112"/>
<path d="M412 112 L404.7 115.26 L404.7 108.74 Z" class="sf-solid"/>
<text x="424" y="94" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">I₃</text>
<text x="240" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">ΣI入 = ΣI出：穿过这个面的电流一样守恒</text>
</svg>

</FigBox>

## 五个坑，一个比一个贵

1. 把 $\sum I=0$ 当绝对值相加。方程恒不成立，或者解出荒唐值。每个 $I$ 都带相对结点的符号，先定「流入为正」再相加。
2. 解出负电流就以为算错，改数字凑正数。负号是结论：实际方向与箭头相反。
3. 以为 KCL 只对正经的结点成立。遇到复杂网络就不会用。广义结点对任意闭合面都成立。
4. 以为 KCL 依赖元件性质。碰上非线性元件就不敢列式。KCL 只依赖连接方式。
5. 在长线、高频下照用，结论与实际对不上。分布参数电路要换传输线理论。

## 例题

::: tip 例 1 · 一个结点的 KCL
题目：一个结点上接三条支路。支路 1 流入 $I_1=2$ A，支路 2 流出 $I_2=3$ A，支路 3 也是流出，电流 $I_3$ 未知。求 $I_3$。

先想什么：题目只问电流、不问电压，所以只需要 KCL，KVL 在这道题里没有用武之地。*（先看未知量的类型再选定律，这是省时间的关键。）*

步骤：

1. 定符号规则：流入为正、流出为负。
2. 列 KCL：$I_1 - I_2 - I_3 = 0$。
3. 代入：$2 - 3 - I_3 = 0 \Rightarrow I_3 = -1\ \text{A}$。

验算，把结果代回原式，按「流入为正、流出为负」求和：$2 - 3 - (-1) = 0$ ✓。

结果的物理意义：$I_3<0$ 说明支路 3 的实际方向与箭头相反，也就是流入该结点 1 A。此时结点上流入 $2+1=3$ A，流出 $3$ A，仍然守恒 ✓。

最后一句该带走的：若还要求电压，先用电阻关系算出各支路电流，再用 KVL 求电压。顺序永远是先电流后电压，反过来会多出未知数。
:::

## 后面的方法都从它长出来

> 完整内容见 [02 · 基尔霍夫定律与电位](../01-basics/kcl-kvl.md)

KCL 就是结点电压法的全部内容，列出来的每个方程都是一条 KCL。支路电流法要用它，戴维南定理求等效电阻（加一个测试电流源）也要用它。题目一问「某条支路里有多少电流」「某块电路吸收多少总电流」，先想 KCL。
