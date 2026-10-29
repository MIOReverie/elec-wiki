---
title: 04 · 组合逻辑电路
description: 一眼判断电路有没有记忆、分析四步与设计五步、用译码器或数据选择器直接把函数填进器件、加法器的进位链，以及恒为 1 的输出为什么会冒毛刺；八张图、四道例题。
---

# 04 · 组合逻辑电路

<Meta time="45 min" level="核心" note="两个坑最深：把带反馈的电路当成组合逻辑；用 138 时忘了它的输出是低电平有效。" />

考试题要求「三个人投票，至少两人同意时输出 1」。有人老老实实画三个与门、三个或门再加一堆非门，涂满半页；同桌只用一片 74LS138 加一个与非门，三根线接完。功能一模一样，器件数差了五倍。差在知不知道该用中规模器件，不在聪明程度。

另一件事更难受。一个逻辑表达式静态分析下来输出应该恒为 1，可你把示波器探头搭上去，每次输入 $A$ 出现跳变，输出就掉下去一个 10 ns 宽的负脉冲。逻辑上完全正确，物理上却偶尔出错。

两件事问的是同一个东西的两面：同样的功能有多少种搭法，以及搭法本身会带来什么代价。给你一张门电路图，你要能说出它干什么；给你一句需求，你要能画出图来。这两件事都有固定套路，难点只有两个：怎么一眼看出一个电路有没有记忆，以及为什么恒为 1 的输出会冒负脉冲。

::: tip 读这页之前
要会与、或、非三种运算和真值表（<Prereq id="boolean-algebra" />），会圈卡诺图（<Prereq id="kmap" />），也知道门电路延迟与扇出是怎么回事（<Prereq id="gate-fanout" />）。二进制与十六进制的读写见 [01 · 数制与编码](./number-systems.md)。忘了就回头翻一眼，不影响往下读。

符号先交代：$A$、$B$、$C$ 是输入变量，$Y$、$F$ 是输出；$m_i$ 是最小项，也就是第 $i$ 个输入组合对应的乘积项，三变量时 $m_5=\bar AB C$，编号 5 就是 `101` 的十进制值；$\sum m(\dots)$ 读作「这些最小项相或」；$\oplus$ 是异或，两输入不同时输出 1；字母上方的横杠 $\bar A$ 是逻辑非。全部约定见[符号与约定](../guide/notation.md)。

两个词各一句话：组合逻辑的每个输出只由当前输入决定；时序逻辑的输出还取决于之前存下来的状态。这两句话就是整章的骨架。

本页例题里的 4 位加法只用到逢二进一，不涉及补码，不必提前复习。
:::

::: tip 一句话抓住本质
组合逻辑就是一张查表。你写的表达式、画的卡诺图、用的 138 或 151，都只是在用不同方式描述同一张表。所以判断对错最硬的办法永远是：列真值表，逐行对。
:::

## 一、判据：先问有没有记忆

判据不是看它用了几个门，而是看它的输出有没有依赖过去。用一句话检验：把输入拨到某个组合，等电路稳定，读输出；然后把输入随便乱拨一通再拨回原来的组合，再读一次输出。两次读数一样，是组合逻辑；可能不一样，是时序逻辑。

<FigBox title="同一张输入，会不会得到同一个输出" kind="结构" note="上：输出只由当前输入经过门电路算出，与历史无关。下：输出里有一部分存进了触发器，又被引回组合逻辑的输入，于是上一次的结果参与了这一次的计算，这就是记忆。">

<svg viewBox="0 0 470 244" role="img" aria-label="组合逻辑与时序逻辑的结构对比：上图输入经组合逻辑直达输出，下图多了存储块并把状态反馈回组合逻辑">
<defs>
  <marker id="cb-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="cb-ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <text x="16" y="20" fill="var(--vp-c-text-3)">组合逻辑：一条直路</text>
  <text x="16" y="62">输入</text>
  <line x1="52" y1="57" x2="96" y2="57" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#cb-ar)" />
  <rect x="98" y="34" width="112" height="46" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="154" y="62" text-anchor="middle">组合逻辑 f</text>
  <line x1="212" y1="57" x2="262" y2="57" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#cb-ar)" />
  <text x="270" y="62">输出 Y = f(现在)</text>
  <text x="270" y="82" fill="var(--vp-c-text-3)">与历史无关</text>

  <line x1="16" y1="110" x2="454" y2="110" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />

  <text x="16" y="132" fill="var(--vp-c-text-3)">时序逻辑：绕了一个圈</text>
  <text x="16" y="176">输入</text>
  <line x1="52" y1="171" x2="88" y2="171" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#cb-ar)" />
  <rect x="90" y="148" width="104" height="46" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="142" y="176" text-anchor="middle">组合逻辑</text>
  <line x1="196" y1="171" x2="228" y2="171" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#cb-ar)" />
  <rect x="230" y="148" width="96" height="46" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.8" />
  <text x="278" y="170" text-anchor="middle">触发器</text>
  <text x="278" y="186" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">存一位</text>
  <line x1="328" y1="171" x2="368" y2="171" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#cb-ar)" />
  <text x="374" y="176">输出</text>
  <path d="M 278 196 L 278 214 L 142 214 L 142 196" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#cb-ar2)" />
  <text x="210" y="228" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="11">状态反馈：上一拍的结果参与这一拍</text>
</g>
</svg>

</FigBox>

工程上还有一个更省事的判据：看电路里有没有输出绕回输入的路径。只要存在一条从某个门的输出出发、经过若干门又回到自己输入的闭合路径，电路就可能有记忆。注意是「可能」，因为两条路径的逻辑可能在数学上互相抵消。但只要你看到反馈，就要提高警惕，先按时序逻辑处理。

反过来，只有单向路径、每一级输出都只往右走的电路，一定是组合逻辑。这个单向的画面后面反复用：分析时按「从输入到输出逐级写」就是这个道理；讨论竞争冒险时，也正是因为信号要分几路往右走、各路快慢不同，才出了问题。

判据清楚了，下面两节把两套流程各自固定下来。先学手上有一张图的情形，再学手上只有一句话的情形。

## 二、分析：从图读出功能

四步固定不变：从输入到输出逐级写表达式 → 化简 → 列真值表 → 归纳功能。第一步没有技巧，全部靠耐心；第二步用公式法或卡诺图（见 [02 · 逻辑代数与卡诺图](./boolean-kmap.md)）；第三步是机械活；第四步才真正体现理解，你要把它认成加法器、比较器还是多数表决器。

<FigBox title="分析和设计是同一张表的两头" kind="结构" note="上半支路是分析：图 → 表达式 → 化简 → 真值表 → 功能。下半支路是设计：功能 → 真值表 → 表达式 → 化简 → 图。中间那一列是真值表，所以任何一道题做不出来，第一反应都应该是先把表列出来。">

<svg viewBox="0 0 470 220" role="img" aria-label="分析与设计两条流程共用真值表的双向框图">
<defs>
  <marker id="cb-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="cb-f2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="26" y="30" width="104" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.5" />
  <text x="78" y="55" text-anchor="middle">逻辑图</text>
  <rect x="176" y="30" width="112" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.5" />
  <text x="232" y="48" text-anchor="middle">表达式</text>
  <text x="232" y="63" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">化简</text>
  <rect x="334" y="30" width="112" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="390" y="55" text-anchor="middle">真值表</text>
  <line x1="132" y1="50" x2="172" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-f)" />
  <line x1="290" y1="50" x2="330" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-f)" />

  <rect x="26" y="152" width="104" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.5" />
  <text x="78" y="177" text-anchor="middle">一句话需求</text>
  <rect x="176" y="152" width="112" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.5" />
  <text x="232" y="170" text-anchor="middle">表达式</text>
  <text x="232" y="185" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">化简</text>
  <rect x="334" y="152" width="112" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="390" y="177" text-anchor="middle">逻辑图</text>
  <line x1="132" y1="172" x2="172" y2="172" stroke="var(--vp-c-text-3)" stroke-width="1.6" marker-end="url(#cb-f2)" />
  <line x1="290" y1="172" x2="330" y2="172" stroke="var(--vp-c-text-3)" stroke-width="1.6" marker-end="url(#cb-f2)" />

  <line x1="390" y1="74" x2="390" y2="148" stroke="var(--vp-c-brand-1)" stroke-width="1.4" stroke-dasharray="5 4" />
  <text x="402" y="112" fill="var(--vp-c-text-3)" font-size="10.5">同一张表</text>
  <text x="232" y="112" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10.5">分析往上走，设计往下走</text>
</g>
</svg>

</FigBox>

举个小例子把四步走一遍。图是两级：第一级 $A$、$B$ 进一个与非门，输出记作 $N$；第二级把 $N$ 与 $C$ 送进一个或门，输出 $Y$。

1. 逐级写：$N=\overline{AB}$，$Y=N+C=\overline{AB}+C$。*（为什么先给中间节点起名字：多级电路里直接写一个大式子最容易错，命名中间节点等于给每一步留一个可单独验算的落点。）*
2. 化简：由德摩根定律 $\overline{AB}=\bar A+\bar B$，所以 $Y=\bar A+\bar B+C$。*（这一步不只是为了好看：化简成三项相或之后，每一项对应一个让输出为 1 的条件，功能立刻可读。）*
3. 列真值表：三变量 8 行，逐行代 $Y=\bar A+\bar B+C$。$Y=0$ 只可能发生在三项全为 0 的时候，也就是 $\bar A=0$、$\bar B=0$、$C=0$，即 `A=1,B=1,C=0` 这一行。
4. 归纳功能：$Y$ 只在 `110` 这一行为 0，其余全为 1。读成一句话就是，$C$ 是使能端：$C=1$ 时无论 $A$、$B$ 是什么都输出 1；只有 $C=0$ 时才轮到「$A$ 与 $B$ 同时为 1 就输出 0」这条规则生效。

四步里最容易省掉的是第二步。省掉的后果是：真值表列完你手上有一张表，却说不出功能。而归纳功能恰恰是考试和调试时真正要的东西。

分析是看着图说功能，反过来就是拿着需求画图。

## 三、设计：从功能画到图

五步：定变量并赋值 → 列真值表 → 写与或式 → 化简 → 按手头的门变换形式并画图。第三步有个机械做法：把真值表里输出为 1 的每一行写成一个乘积项（该行输入为 1 写原变量、为 0 写反变量），再把所有乘积项或起来。

需求是「三个人 $A$、$B$、$C$ 投票，至少两人同意（为 1）时输出 $Y=1$」。真值表只有 8 行，逐行填：

| A | B | C | Y | 对应最小项 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | — |
| 0 | 0 | 1 | 0 | — |
| 0 | 1 | 0 | 0 | — |
| 0 | 1 | 1 | 1 | $m_3$ |
| 1 | 0 | 0 | 0 | — |
| 1 | 0 | 1 | 1 | $m_5$ |
| 1 | 1 | 0 | 1 | $m_6$ |
| 1 | 1 | 1 | 1 | $m_7$ |

输出为 1 的行是第 4、6、7、8 行，对应最小项 $\bar AB C$、$A\bar B C$、$AB\bar C$、$ABC$，于是

$$
Y=\bar AB C+A\bar B C+AB\bar C+ABC=\sum m(3,5,6,7)
$$

化简：$m_3$ 与 $m_7$ 相邻（只差 $A$）合并成 $BC$；$m_5$ 与 $m_7$ 合并成 $AC$；$m_6$ 与 $m_7$ 合并成 $AB$。所以

$$
\boxed{Y=AB+BC+AC}
$$

三项、每项两个字面，就是三个二输入与门加一个三输入或门（手头没有三输入或门时，用两个二输入或门串起来），一共四个门。记法：三人表决的三个乘积项正好是「从三个人里挑两个」的全部组合，共 $C_3^2=3$ 项，所以三项都对。这个对应不是巧合，它就是「至少两个 1」这个条件的直接翻译。

流程走到这儿本该完事，但有个对比值得留意：这个功能用四个门实现，而同样的功能在上面那个场景里只用了一片 138 加一个与非门。多出来的三个门不是浪费在设计上，是浪费在没用现成器件上。

## 四、中规模器件：把化简这一步省掉

译码器、数据选择器、加法器、比较器，这四类现成器件之所以能省事，是因为它们内部已经把「所有可能的输入组合」穷举好了。你只需要做一件很轻的活：把自己的函数对应到它们已经算好的结果上。

### 1. 译码器：输出就是全部最小项

**译码器**（decoder）把 $n$ 位二进制码翻译成 $2^n$ 根输出线里唯一有效的一根。以 3-8 线 74LS138 为例：三根地址 $A$、$B$、$C$ 进来，八根输出 $Y_0\sim Y_7$ 里只有 1 根是低电平，另外 7 根都是高，选中哪一根由三根地址决定。一片 74LS138 内部说到底就是 8 个与非门在干活，没有别的花样。

关键性质一句话：第 $i$ 根输出恰好就是最小项 $m_i$，只不过它是低电平有效的，也就是 $\bar Y_i=\bar m_i$，反过来说 $Y_i=\overline{m_i}$。

**低电平有效**（active low）的意思是：这根线起效时是 0 而不是 1。经验约定是引脚上画一个小圆圈表示低有效，下面这张图右侧那排小圆圈就是这个记号。

<FigBox title="74LS138 直接拼出任意三变量函数" kind="结构" note="左边三根地址选出一个最小项，右边八根输出里只有一根是低电平（画小圆圈表示低有效）。把需要的那几根引出来，送进一个与非门，输出就是这几个最小项之和，不需要化简。">

<svg viewBox="0 0 520 312" role="img" aria-label="74LS138 接线示意：三根地址输入、八根低有效输出，其中五根送进一个五输入与非门得到函数输出">
<defs>
  <marker id="cb-d1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="cb-d2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="86" y="40" width="112" height="226" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="142" y="62" text-anchor="middle" font-weight="700">74LS138</text>
  <text x="142" y="78" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">3-8 译码器</text>

  <text x="12" y="105">A</text>
  <line x1="30" y1="101" x2="86" y2="101" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-d1)" />
  <text x="12" y="135">B</text>
  <line x1="30" y1="131" x2="86" y2="131" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-d1)" />
  <text x="12" y="165">C</text>
  <line x1="30" y1="161" x2="86" y2="161" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-d1)" />
  <text x="10" y="212" font-size="10.5" fill="var(--vp-c-text-3)">使能</text>
  <line x1="30" y1="230" x2="86" y2="230" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#cb-d2)" />

  <circle cx="201" cy="66" r="3.4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="204" y1="66" x2="246" y2="66" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
  <text x="252" y="60" fill="var(--vp-c-text-3)">Y₀</text>
  <circle cx="201" cy="92" r="3.4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="252" y="86" fill="var(--vp-c-brand-1)" font-weight="700">Y₁</text>
  <circle cx="201" cy="118" r="3.4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="204" y1="118" x2="246" y2="118" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
  <text x="252" y="112" fill="var(--vp-c-text-3)">Y₂</text>
  <circle cx="201" cy="144" r="3.4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="252" y="138" fill="var(--vp-c-brand-1)" font-weight="700">Y₃</text>
  <circle cx="201" cy="170" r="3.4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="204" y1="170" x2="246" y2="170" stroke="var(--vp-c-text-3)" stroke-width="1.3" />
  <text x="252" y="164" fill="var(--vp-c-text-3)">Y₄</text>
  <circle cx="201" cy="196" r="3.4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="252" y="190" fill="var(--vp-c-brand-1)" font-weight="700">Y₅</text>
  <circle cx="201" cy="222" r="3.4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="252" y="216" fill="var(--vp-c-brand-1)" font-weight="700">Y₆</text>
  <circle cx="201" cy="248" r="3.4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="252" y="242" fill="var(--vp-c-brand-1)" font-weight="700">Y₇</text>

  <path d="M 204 92 H 340 V 104 H 400" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <path d="M 204 144 H 350 V 118 H 400" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <path d="M 204 196 H 360 V 132 H 400" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <path d="M 204 222 H 370 V 146 H 400" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <path d="M 204 248 H 380 V 160 H 400" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />

  <path d="M 400 96 L 424 96 A 47 47 0 0 1 424 190 L 400 190 Z" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.6" />
  <circle cx="475" cy="143" r="4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="479" y1="143" x2="500" y2="143" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="406" y="150" font-size="10.5" fill="var(--vp-c-text-3)">与非</text>
  <text x="504" y="147" fill="var(--vp-c-brand-1)" font-weight="700">F</text>

  <text x="12" y="282" font-size="10.5" fill="var(--vp-c-text-3)">使能端必须有效：G₁ 接高、Ḡ₂ₐ 与 Ḡ₂ᵦ 接低</text>
  <text x="12" y="298" font-size="10.5" fill="var(--vp-c-text-3)">灰线是本题用不到的 Y₀ Y₂ Y₄，悬空即可</text>
</g>
</svg>

</FigBox>

所以任意三变量函数 $Y=\sum m(\dots)$，做法就是：把对应那几个输出端引出来，用一个与非门收起来：

$$
Y=\overline{Y_{i_1}\cdot Y_{i_2}\cdot\ \cdots\ }=\sum m(i_1,i_2,\dots)
$$

这里有个容易绕的地方值得说清。逐个符号看：选中第 $i$ 个最小项时 $Y_i=0$、其余 $Y$ 为 1，所以 $Y_i=\overline{m_i}$，反过来 $\bar Y_i=m_i$，也就是说取反之后的输出才等于最小项本身。现在把几个 $Y_i$ 送进与非门：

$$
\overline{Y_{i_1}Y_{i_2}\cdots}=\overline{\overline{m_{i_1}}\cdot\overline{m_{i_2}}\cdots}=m_{i_1}+m_{i_2}+\cdots
$$

第一次取反来自与非门，第二次取反来自每个 $Y_i$ 自己已经带的反，两次抵消，于是低有效的输出被还原成正逻辑的和。为什么必须用与非而不是与门：与门会得到 $\overline{m_{i_1}}\cdot\overline{m_{i_2}}\cdots$，那表示「这几个最小项一个都没选中」，是原函数的反，逻辑整体反了。

### 2. 数据选择器：把地址当变量，数据端接 0 或 1

**数据选择器**（multiplexer，常缩写 MUX，也叫多路开关）是反过来的器件：$2^n$ 根数据线里，由 $n$ 根地址选一根送到唯一输出。以 8 选 1 的 74LS151 为例：

$$
Y=\sum_{i=0}^{7} m_i D_i
$$

这个式子的意思是：地址选中哪一项，输出就等于那一项的数据端。于是把地址端当成你的逻辑变量、数据端当常数接 0 或 1，函数就被填进器件里了。要 $F(A,B,C)=\sum m(1,2,4,7)$，就把 $D_1=D_2=D_4=D_7$ 接 1，其余接 0。

| 最小项（地址 $CBA$） | 数据端 | 接法 | 含义 |
| --- | --- | --- | --- |
| $m_0$ `000` | $D_0$ | 0 | 该行输出 0 |
| $m_1$ `001` | $D_1$ | 1 | 该行输出 1 |
| $m_2$ `010` | $D_2$ | 1 | 该行输出 1 |
| $m_3$ `011` | $D_3$ | 0 | 该行输出 0 |
| $m_4$ `100` | $D_4$ | 1 | 该行输出 1 |
| $m_5$ `101` | $D_5$ | 0 | 该行输出 0 |
| $m_6$ `110` | $D_6$ | 0 | 该行输出 0 |
| $m_7$ `111` | $D_7$ | 1 | 该行输出 1 |

手头没有 8 选 1、只有 4 选 1 时，还有个把器件省一半的做法：三个变量里拿两个当地址，第三个接到数据端，四个数据端按真值表接成 0、1、$C$ 或 $\bar C$。原理还是那张表，只是有一半的信息挪到了数据端上。

MUX 这条路的好处是连化简都不用，真值表逐行照抄到数据端就完事。74LS151 的地址是 3 位，数据端 8 个，正好对应八行真值表，一行都不多。考试里它是偷懒神器，工程里也确实被这么用：一片 LUT（查找表，FPGA 里最小的可编程单元）本质就是这个结构。

### 3. 加法器：组合逻辑的样板工程

**半加器**（half adder）只处理两个 1 位数的相加，不管低位来的进位：$S=A\oplus B$，进位 $C=AB$。**全加器**（full adder）多了一个进位输入 $C_{in}$，能级联：

$$
S=A\oplus B\oplus C_{in}, \qquad C_{out}=AB+(A\oplus B)C_{in}
$$

多位加法器就是全加器串起来：低位的进位输出接高位的进位输入。这种接法叫**串行进位**（也叫行波进位），结构最简单，缺点很要命，高位的和必须等低位的进位一路爬上来。

<FigBox title="一位全加器，以及四个它串起来的 4 位加法器" kind="结构" note="上：一位全加器三个输入、两个输出，和为异或、进位为多数函数。下：四位串联，C₁ 要等第 0 位算完，C₂ 要等 C₁，最坏情况下最高位要等四级门延迟，这就是串行进位的代价。">

<svg viewBox="0 0 480 302" role="img" aria-label="上半部分是一位全加器方块，下半部分是四个全加器串行进位组成的四位加法器，进位从低位逐级传到高位">
<defs>
  <marker id="cb-a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="cb-a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="14" y="18" fill="var(--vp-c-text-3)">一位全加器 FA</text>
  <text x="14" y="44">A</text>
  <line x1="30" y1="40" x2="72" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1.5" marker-end="url(#cb-a2)" />
  <text x="14" y="68">B</text>
  <line x1="30" y1="64" x2="72" y2="64" stroke="var(--vp-c-text-3)" stroke-width="1.5" marker-end="url(#cb-a2)" />
  <text x="4" y="92" font-size="10.5">C<tspan dy="3" font-size="8">in</tspan></text>
  <line x1="30" y1="88" x2="72" y2="88" stroke="var(--vp-c-text-3)" stroke-width="1.5" marker-end="url(#cb-a2)" />
  <rect x="74" y="24" width="86" height="78" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="117" y="70" text-anchor="middle" font-weight="700">FA</text>
  <line x1="160" y1="44" x2="212" y2="44" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-a1)" />
  <text x="218" y="48">S = A⊕B⊕C<tspan dy="3" font-size="8">in</tspan></text>
  <line x1="160" y1="86" x2="212" y2="86" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-a1)" />
  <text x="218" y="90">C<tspan dy="3" font-size="8">out</tspan><tspan dy="-3"> 向高位进位</tspan></text>

  <line x1="14" y1="120" x2="466" y2="120" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="14" y="140" fill="var(--vp-c-text-3)">四位串行进位加法器</text>

  <text x="18" y="180" font-size="10.5" fill="var(--vp-c-text-3)">C₀</text>
  <line x1="38" y1="176" x2="58" y2="176" stroke="var(--vp-c-text-3)" stroke-width="1.5" marker-end="url(#cb-a2)" />
  <rect x="60" y="150" width="72" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="96" y="172" text-anchor="middle" font-size="11">FA₀</text>
  <text x="96" y="188" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">A₀ B₀</text>
  <rect x="158" y="150" width="72" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="194" y="172" text-anchor="middle" font-size="11">FA₁</text>
  <text x="194" y="188" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">A₁ B₁</text>
  <rect x="256" y="150" width="72" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="292" y="172" text-anchor="middle" font-size="11">FA₂</text>
  <text x="292" y="188" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">A₂ B₂</text>
  <rect x="354" y="150" width="72" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="390" y="172" text-anchor="middle" font-size="11">FA₃</text>
  <text x="390" y="188" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">A₃ B₃</text>

  <line x1="132" y1="162" x2="156" y2="162" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-a1)" />
  <text x="144" y="154" text-anchor="middle" font-size="9.5" fill="var(--vp-c-brand-1)">C₁</text>
  <line x1="230" y1="162" x2="254" y2="162" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-a1)" />
  <text x="242" y="154" text-anchor="middle" font-size="9.5" fill="var(--vp-c-brand-1)">C₂</text>
  <line x1="328" y1="162" x2="352" y2="162" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-a1)" />
  <text x="340" y="154" text-anchor="middle" font-size="9.5" fill="var(--vp-c-brand-1)">C₃</text>
  <line x1="426" y1="162" x2="456" y2="162" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-a1)" />
  <text x="446" y="154" text-anchor="middle" font-size="9.5" fill="var(--vp-c-brand-1)">C₄</text>

  <text x="60" y="228" font-size="10.5" fill="var(--vp-c-text-3)">求和位 S₀～S₃ 从各方块上方引出，图中省略</text>
  <text x="60" y="250" font-size="10.5" fill="var(--vp-c-text-3)">最坏路径：C₀ → FA₀ → FA₁ → FA₂ → FA₃，共四级</text>
  <text x="60" y="270" font-size="10.5" fill="var(--vp-c-brand-1)">超前进位：用生成 G=AB 与传播 P=A⊕B 直接把每一位的进位算出来</text>
  <text x="60" y="286" font-size="10.5" fill="var(--vp-c-text-3)">四个进位同时出结果，不必排队 —— 代价是进位逻辑的门数随位数增长</text>
</g>
</svg>

</FigBox>

**超前进位**（carry look-ahead）就是为了解决这个排队。做法是把进位展开成能直接算的形式：定义生成 $G_i=A_iB_i$（本位一定产生进位）和传播 $P_i=A_i\oplus B_i$（本位会把低位进位往上送），则

$$
C_{i+1}=G_i+P_iC_i \;\Longrightarrow\; C_2=G_1+P_1G_0+P_1P_0C_0
$$

右边全是各级输入的直接组合，不经过前面几级加法器，所以四个进位可以同时算出来，延迟与位数基本无关。代价是进位逻辑的门数随位数增长，位数很多时要分组。

### 4. 数值比较器

1 位比较器的结论很短：$A>B$ 当且仅当 $A\bar B=1$。多位比较从高位往低位看：高位不等就立刻定结果，高位相等才看下一位。这条规则的直觉是字典序，比较两个单词时，第一个字母分出胜负就结束了。集成比较器 74LS85 就是把这个逻辑级联起来，并带有高位结果优先的级联输入。

### 5. 顺便认识两个邻居

**编码器**（encoder）是译码器的反向：$2^n$ 根输入里有一根为 1，输出它的编号。实际用的是优先编码器（74LS148 是 8-3 线），因为真实系统里可能同时按下多个键，需要一个规则决定谁说了算。规则是下标大的优先，$I_7$ 优先级最高。这个约定和直觉相反，很多人以为 $I_0$ 最先响应，接错顺序就会出现抢答错误。

器件讲到这里，工具箱算是齐了：同样的功能有很多种搭法。但所有这些搭法都默认了一件事，门是瞬时的。真实门有 10 ns 左右的延迟，而延迟就是下一节所有麻烦的来源。

## 五、竞争冒险：为什么恒为 1 的输出会冒负脉冲

先把两个词分开。**竞争**（race）指的是同一个信号经过不同路径、以不同的时间到达同一个门，字面意思就是赛跑。**冒险**（hazard）指的是竞争在输出上造成的后果：一个本来不该出现的窄脉冲。窄脉冲有个俗称，叫毛刺（glitch）。

判断会不会冒险，有个很省事的判据：看表达式里有没有某个变量同时以原变量和反变量出现。像 $Y=A+\bar A$ 这种形式，两个乘积项各自都一直为 1，但它们不是同一时刻变的，一个被延迟了，另一个没有。延迟差的那段时间里，两个项可能同时为 0，输出就掉下去了。

看一个具体电路：$Y=AB+\bar AC$。固定 $B=C=1$ 不变，则 $Y=A\cdot1+\bar A\cdot1=A+\bar A$，逻辑上恒等于 1。设每个门（与门、非门）延迟都是 10 ns，当 $A$ 从 1 跳到 0：

<FigBox title="10 ns 毛刺是怎么冒出来的" kind="时序" note="A 在 0 ns 处下落。路径 AB 只过一个与门，10 ns 后就变 0；路径 ĀC 要先过一个非门再过一个与门，20 ns 后才变 1。中间那 10 ns 里两条路同时为 0，输出掉下去一格，这就是静态 1 型冒险。">

<svg viewBox="0 0 480 300" role="img" aria-label="时序图：A 在 0 纳秒下降，乘积项 AB 在 10 纳秒变低，乘积项 A 非 C 在 20 纳秒变高，输出 Y 在 10 到 20 纳秒之间出现负向毛刺">
<defs>
  <marker id="cb-t1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="240" y="200" width="44" height="52" fill="var(--vp-c-brand-soft)" stroke="none" />
  <line x1="80" y1="278" x2="470" y2="278" stroke="var(--vp-c-divider)" stroke-width="1.2" marker-end="url(#cb-t1)" />
  <g stroke="var(--vp-c-divider)" stroke-width="0.9" stroke-dasharray="3 4">
    <line x1="80" y1="26" x2="80" y2="272" />
    <line x1="120" y1="26" x2="120" y2="272" />
    <line x1="160" y1="26" x2="160" y2="272" />
    <line x1="200" y1="26" x2="200" y2="272" />
    <line x1="240" y1="26" x2="240" y2="272" />
    <line x1="280" y1="26" x2="280" y2="272" />
    <line x1="320" y1="26" x2="320" y2="272" />
    <line x1="360" y1="26" x2="360" y2="272" />
    <line x1="400" y1="26" x2="400" y2="272" />
    <line x1="440" y1="26" x2="440" y2="272" />
  </g>

  <text x="66" y="52" text-anchor="end">A</text>
  <polyline points="80,40 200,40 200,74 470,74" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="66" y="112" text-anchor="end">AB</text>
  <polyline points="80,100 240,100 240,134 470,134" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />
  <text x="66" y="176" text-anchor="end" font-size="10.5">ĀC</text>
  <polyline points="80,198 280,198 280,164 470,164" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />
  <text x="66" y="240" text-anchor="end">Y</text>
  <polyline points="80,228 240,228 240,262 280,262 280,228 470,228" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />

  <line x1="200" y1="40" x2="240" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 2" />
  <line x1="240" y1="40" x2="240" y2="100" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 2" />
  <text x="248" y="58" font-size="10.5" fill="var(--vp-c-text-3)">+10 ns：AB 变 0</text>
  <line x1="280" y1="198" x2="280" y2="164" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <text x="288" y="156" font-size="10.5" fill="var(--vp-c-text-3)">+20 ns：ĀC 才变 1</text>
  <text x="300" y="252" font-size="10.5" fill="var(--vp-c-brand-1)">毛刺宽 10 ns</text>

  <text x="200" y="294" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">0</text>
  <text x="240" y="294" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">10</text>
  <text x="280" y="294" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">20</text>
  <text x="320" y="294" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">30</text>
  <text x="352" y="294" font-size="10" fill="var(--vp-c-text-3)">ns</text>
</g>
</svg>

</FigBox>

用卡诺图看同一件事，冒险点会变得非常直观：$AB$ 圈住 $m_6,m_7$，$\bar AC$ 圈住 $m_1,m_3$。$A$ 跳变对应从 $m_7$ 走到 $m_3$，这两格相邻，却分属两个不同的圈。圈与圈交接的地方就是冒险点。拿示波器看，这个负脉冲的宽度正好是一个门的延迟，也就是 10 ns 上下。

<FigBox title="圈与圈相邻却不相接的地方，就是冒险点" kind="图解" note="绿色圈是 AB，蓝色圈是 ĀC，两圈在 m₃ 与 m₇ 之间擦肩而过。补一个冗余项 BC（橙色圈），把交接处也圈住，毛刺就被托住了，而真值表一格没变。">

<svg viewBox="0 0 470 250" role="img" aria-label="三变量卡诺图：AB 圈覆盖 m6 与 m7，A 非 C 圈覆盖 m1 与 m3，冗余项 BC 圈覆盖 m3 与 m7，正好堵住两圈交接处">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="60" y="42" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">C = 0</text>
  <text x="150" y="42" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">C = 1</text>
  <text x="18" y="70" font-size="10.5" fill="var(--vp-c-text-3)">AB</text>

  <g stroke="var(--vp-c-divider)" stroke-width="1.2" fill="none">
    <rect x="60" y="52" width="90" height="40" />
    <rect x="150" y="52" width="90" height="40" />
    <rect x="60" y="92" width="90" height="40" />
    <rect x="150" y="92" width="90" height="40" />
    <rect x="60" y="132" width="90" height="40" />
    <rect x="150" y="132" width="90" height="40" />
    <rect x="60" y="172" width="90" height="40" />
    <rect x="150" y="172" width="90" height="40" />
  </g>

  <text x="50" y="78" text-anchor="end" font-size="10.5">00</text>
  <text x="50" y="118" text-anchor="end" font-size="10.5">01</text>
  <text x="50" y="158" text-anchor="end" font-size="10.5">11</text>
  <text x="50" y="198" text-anchor="end" font-size="10.5">10</text>

  <text x="105" y="78" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="195" y="78" text-anchor="middle" font-weight="700">1</text>
  <text x="105" y="118" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="195" y="118" text-anchor="middle" font-weight="700">1</text>
  <text x="105" y="158" text-anchor="middle" font-weight="700">1</text>
  <text x="195" y="158" text-anchor="middle" font-weight="700">1</text>
  <text x="105" y="198" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="195" y="198" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>

  <ellipse cx="150" cy="158" rx="94" ry="24" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="6 4" />
  <ellipse cx="195" cy="92" rx="46" ry="44" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 4" />
  <ellipse cx="195" cy="132" rx="46" ry="44" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4" />

  <text x="276" y="60" fill="#34d399" font-size="11">AB：圈住 m₆ m₇</text>
  <text x="276" y="86" fill="#38bdf8" font-size="11">ĀC：圈住 m₁ m₃</text>
  <text x="276" y="112" fill="#f59e0b" font-size="11">BC：补的冗余项</text>
  <text x="276" y="146" font-size="10.5" fill="var(--vp-c-text-3)">m₇ → m₃ 是 A 跳变</text>
  <text x="276" y="166" font-size="10.5" fill="var(--vp-c-text-3)">两圈在此擦肩 → 冒险</text>
  <text x="276" y="196" font-size="10.5" fill="var(--vp-c-brand-1)">加 BC 后 Y = AB+ĀC+BC</text>
  <text x="276" y="216" font-size="10.5" fill="var(--vp-c-text-3)">B=C=1 时 BC 恒为 1，托住输出</text>
</g>
</svg>

</FigBox>

消除冒险有三招，按代价从低到高排：

1. 加冗余项，最稳，也最推荐：在卡诺图上把圈与圈的交接处再圈一个圈。上例补 $BC$ 后 $Y=AB+\bar AC+BC$。$B=C=1$ 时 $BC$ 恒为 1，输出被它托住，毛刺消失；而真值表逐格对下来完全没变，逻辑功能不变，只是增加了冗余覆盖。
2. 加选通脉冲：不去修电路，而是等它稳定了再采样。做法是用一个延迟过的脉冲去把输出放行，等毛刺过去之后才开门。
3. 加滤波电容：最简单也最粗暴，靠电容把窄脉冲吸收掉。代价是边沿被拖慢，高速电路里通常不可接受。

还有一个概念要分清：功能冒险是逻辑设计本身就有的，改逻辑才能消；逻辑冒险是同一变量走不同路径造成的，加冗余项就能消。上面的 $A+\bar A$ 型是逻辑冒险。功能冒险出现在输入同时改变两位以上时，靠冗余项解决不了，只能靠选通脉冲或改状态编码。

把探头的游标拉开量一下，这个坑只有 10 ns 宽，逻辑分析仪上却是一个干干净净的 0，看上去什么都没发生。

知道竞争冒险的存在，会改变你对数字电路的整个看法：逻辑正确只是必要条件，**时间上正确才是充分条件**。这句话在下一章会更狠，触发器把时间直接写进了它的规格里。不过在离开这章之前，先把上面这些动作变成题目走一遍。

## 六、四道题：从门的内到器件的外

四道题难度递进：第一道是器件内部的最小单元，第二道把单元串起来算数值，第三道和第四道是用中规模器件实现函数的两种主流解法。每题先看「先想什么」，那是方法选择，比算出数字重要。

::: tip 例 1 · 全加器算 1+1+1 {#ex-comb-1}
题目：$A=1$、$B=1$、$C_{in}=1$，求本位和 $S$ 与向高位的进位 $C_{out}$。

<FigBox title="三个 1 相加：本位留 1，进一位" kind="结构" note="从数值上看 1+1+1=3，写成二进制是 11，所以本位和为 1、进位为 1。用公式算一遍和用十进制验算一遍，两条路必须给出同一个答案。">

<svg viewBox="0 0 460 190" role="img" aria-label="全加器输入三个 1，输出本位和 1 与进位 1 的示意">
<defs>
  <marker id="cb-e1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <rect x="40" y="40" width="52" height="34" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="66" y="63" text-anchor="middle">A=1</text>
  <rect x="40" y="84" width="52" height="34" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="66" y="107" text-anchor="middle">B=1</text>
  <rect x="40" y="128" width="62" height="34" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="71" y="151" text-anchor="middle">Cᵢₙ=1</text>

  <line x1="102" y1="57" x2="176" y2="84" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="102" y1="101" x2="176" y2="98" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="102" y1="145" x2="176" y2="112" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <rect x="178" y="66" width="92" height="64" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="224" y="104" text-anchor="middle" font-weight="700">FA</text>

  <line x1="270" y1="84" x2="330" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.7" marker-end="url(#cb-e1)" />
  <text x="336" y="62" font-weight="700">S = 1</text>
  <text x="336" y="80" font-size="10" fill="var(--vp-c-text-3)">本位留 1</text>
  <line x1="270" y1="112" x2="330" y2="136" stroke="var(--vp-c-brand-1)" stroke-width="1.7" marker-end="url(#cb-e1)" />
  <text x="336" y="138" font-weight="700">C<tspan dy="3" font-size="9">out</tspan><tspan dy="-3"> = 1</tspan></text>
  <text x="336" y="156" font-size="10" fill="var(--vp-c-text-3)">往高一位送 1</text>
  <text x="336" y="180" font-size="10.5" fill="var(--vp-c-brand-1)">合起来 11₂ = 3 ✓</text>
</g>
</svg>

</FigBox>

先想什么：这题不考计算，考的是别把 $S$ 和 $C_{out}$ 的作用搞反。$S$ 是留在本位的数，$C_{out}$ 是送给高一位的数。所以先把它当成十进制加法：$1+1+1=3$，写成二进制是 `11`，低位 1、高位 1。有了这个预期再去套公式，算出来不对马上就知道。

步骤：

1. 本位和：$S=A\oplus B\oplus C_{in}=1\oplus1\oplus1$。两个 1 异或得 0，再与第三个 1 异或得 1，所以 $S=1$。*（为什么异或能算和：异或的定义就是不进位的加法，三个 1 相加的个位正好是 1。）*
2. 进位：$C_{out}=AB+(A\oplus B)C_{in}=1\cdot1+0\cdot1=1+0=1$。*（为什么分两项：$AB$ 是两个输入都要求进位，$(A\oplus B)C_{in}$ 是两个输入不同、且低位已经要求进位，两者只要有一个成立就进位。）*

验算：$S+2C_{out}=1+2=3$，与 $A+B+C_{in}=3$ 相等 ✓。这条验算关系 $A+B+C_{in}=S+2C_{out}$ 对任何输入都成立，是检查全加器算错的通用办法。

动手看一眼：把 <CombinationalDemo /> 切到「1 位全加器」，三个开关全拨到 1，输出应当正好是 $S=1$、$C_{out}=1$。
:::

::: tip 例 2 · 4 位加法器算 9 + 7 {#ex-comb-2}
题目：用 4 位串行进位加法器算 $1001_2+0111_2$，写出每一位的和与最终进位。

<FigBox title="逐位加、逐位进：9 + 7 溢出成 16" kind="结构" note="四位能表示的最大数是 15，9+7=16 超出了范围，所以结果的低四位全是 0、进位 C₄ 为 1。这个进位为 1 在 CPU 里就是溢出标志的来源之一。">

<svg viewBox="0 0 470 210" role="img" aria-label="四位加法器逐位计算 1001 加 0111，得到 0000 并进位 1">
<g font-size="12" fill="var(--vp-c-text-1)">
  <text x="24" y="34" fill="var(--vp-c-text-3)" font-size="10.5">位号</text>
  <text x="90" y="34" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10.5">3</text>
  <text x="160" y="34" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10.5">2</text>
  <text x="230" y="34" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10.5">1</text>
  <text x="300" y="34" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10.5">0</text>

  <text x="24" y="66" font-size="11">A = 9</text>
  <text x="90" y="66" text-anchor="middle">1</text>
  <text x="160" y="66" text-anchor="middle">0</text>
  <text x="230" y="66" text-anchor="middle">0</text>
  <text x="300" y="66" text-anchor="middle">1</text>
  <text x="24" y="94" font-size="11">B = 7</text>
  <text x="90" y="94" text-anchor="middle">0</text>
  <text x="160" y="94" text-anchor="middle">1</text>
  <text x="230" y="94" text-anchor="middle">1</text>
  <text x="300" y="94" text-anchor="middle">1</text>

  <line x1="56" y1="106" x2="332" y2="106" stroke="var(--vp-c-text-3)" stroke-width="1.4" />

  <text x="24" y="132" font-size="11">进位 C</text>
  <text x="90" y="132" text-anchor="middle" fill="var(--vp-c-brand-1)">1</text>
  <text x="160" y="132" text-anchor="middle" fill="var(--vp-c-brand-1)">1</text>
  <text x="230" y="132" text-anchor="middle" fill="var(--vp-c-brand-1)">1</text>
  <text x="300" y="132" text-anchor="middle" fill="var(--vp-c-brand-1)">1</text>
  <text x="24" y="160" font-size="11">和 S = 0</text>
  <text x="90" y="160" text-anchor="middle">0</text>
  <text x="160" y="160" text-anchor="middle">0</text>
  <text x="230" y="160" text-anchor="middle">0</text>
  <text x="300" y="160" text-anchor="middle">0</text>

  <text x="352" y="66" font-size="10.5" fill="var(--vp-c-text-3)">9</text>
  <text x="352" y="94" font-size="10.5" fill="var(--vp-c-text-3)">+ 7</text>
  <text x="352" y="160" font-size="10.5" fill="var(--vp-c-brand-1)">= 16</text>
  <text x="352" y="132" font-size="10.5" fill="var(--vp-c-brand-1)">C₄ = 1</text>
  <text x="56" y="192" font-size="10.5" fill="var(--vp-c-text-3)">最低位 1+1 先产生进位，这个 1 再往上一级一级传，四位都要参与</text>
</g>
</svg>

</FigBox>

先想什么：这种题最省事的做法是从最低位往上逐位做，并且每一位都写清本位和与进位两个数。别一上来写个 8 位结果，4 位加法器的结果只有 4 位加一个进位，多出来的位是错的。

步骤（第 0 位是最低位）：

1. 第 0 位：$1+1+C_0\,(=0)=2$ → 本位和 0、进位 $C_1=1$。*（为什么先算它：低位的进位是高位计算的输入，顺序不能倒。）*
2. 第 1 位：$0+1+C_1=2$ → 本位和 0、进位 $C_2=1$。
3. 第 2 位：$0+1+C_2=2$ → 本位和 0、进位 $C_3=1$。
4. 第 3 位：$1+0+C_3=2$ → 本位和 0、进位 $C_4=1$。

结果是低四位 `0000`、$C_4=1$，合起来 $10000_2=16$。

验算：十进制 $9+7=16$ ✓；再查一次四位能表示的最大值，$15<16$，所以溢出是必然的，$C_4=1$ 与这个预期一致 ✓。另外，$C_4=1$ 说明真实结果需要 5 位才能放下，这正是很多芯片里进位标志的含义。
:::

::: tip 例 3 · 用 74LS138 实现 $F=\sum m(1,3,5,6,7)$ {#ex-comb-3}
题目：用一片 74LS138 和一个与非门实现三变量函数 $F=\sum m(1,3,5,6,7)$。

图见第四节那张 138 接线图，这道题的接线就是它。

先想什么：先判断能不能用 138，能用的条件是变量数不超过 3。这道题三个变量，正好一片搞定。然后要抓住 138 的唯一关键点：输出是低有效的。低有效意味着这根线为 0 代表这个最小项成立，所以把成立的那些线接进与非门，逻辑就对了。

步骤：

1. 目标函数包含 $m_1,m_3,m_5,m_6,m_7$ 五项，对应 138 的 $Y_1,Y_3,Y_5,Y_6,Y_7$ 五个输出。
2. 这五根线送进一个五输入与非门。因为 $Y_i=\overline{m_i}$，所以
   $$F=\overline{Y_1 Y_3 Y_5 Y_6 Y_7}=\overline{\bar m_1\cdot\bar m_3\cdot\bar m_5\cdot\bar m_6\cdot\bar m_7}=m_1+m_3+m_5+m_6+m_7$$
   *（为什么两次取反正好还原：与非门先把五个低有效信号与起来再取反，而每个信号本身已经带了一次取反。）*
3. 使能端接对：$G_1$ 接高、$\bar G_{2A}$ 与 $\bar G_{2B}$ 接低，否则片子根本不工作。

验算：取一组输入 `A B C = 1 0 1`（即 $m_5$）。138 的 $Y_5$ 输出低电平、其余为高，与非门输入端有一个 0，输出为 1 ✓，与 $F$ 该项应为 1 吻合。再取 `0 0 0`（$m_0$，不在和里）：所有被接的输出都是高，与非门输出 0 ✓。

一个反例记住教训：如果把与非门换成与门，输出会变成 $\bar m_1\bar m_3\bar m_5\bar m_6\bar m_7$，也就是这五个最小项一个都不成立时为 1，正好是原函数的反。这是用 138 时最常见的错误。
:::

::: tip 例 4 · 用 74LS151 实现 $F(A,B,C)=\sum m(1,2,4,7)$ {#ex-comb-4}
题目：用一片 8 选 1 数据选择器 74LS151 实现 $F(A,B,C)=\sum m(1,2,4,7)$，画出数据端的接法。

<FigBox title="把真值表逐行抄到数据端" kind="结构" note="地址 CBA 从 000 数到 111，数据端按真值表逐行接 0 或 1。整个过程不需要卡诺图、不需要化简，这就是 MUX 法最舒服的地方。">

<svg viewBox="0 0 470 252" role="img" aria-label="8 选 1 数据选择器的数据端接法：D1 D2 D4 D7 接高电平，其余接低电平">
<defs>
  <marker id="cb-m1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="14" y="30" font-size="10" fill="var(--vp-c-text-3)">Dᵢ</text>
  <text x="52" y="30" font-size="10" fill="var(--vp-c-text-3)">接法</text>
  <text x="104" y="30" font-size="10" fill="var(--vp-c-text-3)">地址</text>

  <text x="14" y="56">D₀</text>
  <text x="52" y="56" fill="var(--vp-c-text-3)">0</text>
  <text x="104" y="56" fill="var(--vp-c-text-3)">000</text>
  <text x="14" y="78">D₁</text>
  <text x="52" y="78" fill="var(--vp-c-brand-1)" font-weight="700">1</text>
  <text x="104" y="78" fill="var(--vp-c-text-3)">001</text>
  <text x="14" y="100">D₂</text>
  <text x="52" y="100" fill="var(--vp-c-brand-1)" font-weight="700">1</text>
  <text x="104" y="100" fill="var(--vp-c-text-3)">010</text>
  <text x="14" y="122">D₃</text>
  <text x="52" y="122" fill="var(--vp-c-text-3)">0</text>
  <text x="104" y="122" fill="var(--vp-c-text-3)">011</text>
  <text x="14" y="144">D₄</text>
  <text x="52" y="144" fill="var(--vp-c-brand-1)" font-weight="700">1</text>
  <text x="104" y="144" fill="var(--vp-c-text-3)">100</text>
  <text x="14" y="166">D₅</text>
  <text x="52" y="166" fill="var(--vp-c-text-3)">0</text>
  <text x="104" y="166" fill="var(--vp-c-text-3)">101</text>
  <text x="14" y="188">D₆</text>
  <text x="52" y="188" fill="var(--vp-c-text-3)">0</text>
  <text x="104" y="188" fill="var(--vp-c-text-3)">110</text>
  <text x="14" y="210">D₇</text>
  <text x="52" y="210" fill="var(--vp-c-brand-1)" font-weight="700">1</text>
  <text x="104" y="210" fill="var(--vp-c-text-3)">111</text>

  <rect x="176" y="42" width="120" height="180" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="236" y="128" text-anchor="middle" font-weight="700">74LS151</text>
  <text x="236" y="146" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">8 选 1</text>
  <text x="236" y="164" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">Y = Σ mᵢ Dᵢ</text>

  <line x1="150" y1="52" x2="172" y2="52" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="150" y1="74" x2="172" y2="74" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="150" y1="96" x2="172" y2="96" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="150" y1="118" x2="172" y2="118" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="150" y1="140" x2="172" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="150" y1="162" x2="172" y2="162" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="150" y1="184" x2="172" y2="184" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="150" y1="206" x2="172" y2="206" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />

  <text x="320" y="96" font-size="10.5" fill="var(--vp-c-text-3)">地址 CBA</text>
  <line x1="206" y1="222" x2="206" y2="200" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#cb-m1)" />
  <line x1="236" y1="222" x2="236" y2="200" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#cb-m1)" />
  <line x1="266" y1="222" x2="266" y2="200" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#cb-m1)" />
  <text x="206" y="236" text-anchor="middle" font-size="10">C</text>
  <text x="236" y="236" text-anchor="middle" font-size="10">B</text>
  <text x="266" y="236" text-anchor="middle" font-size="10">A</text>
  <text x="320" y="128" font-size="10.5" fill="var(--vp-c-text-3)">四根粗线接 1</text>
  <text x="320" y="148" font-size="10.5" fill="var(--vp-c-text-3)">四根细线接 0</text>
</g>
</svg>

</FigBox>

先想什么：这是省事型题，方法选对了，计算量是零。判断依据是：函数已经写成最小项之和，而 MUX 的输出表达式正好是 $\sum m_iD_i$，形式完全对得上，逐行照抄就行。如果给的是没写成最小项式的逻辑表达式，先去列出真值表，再抄。

步骤：

1. 把地址端按 $C$、$B$、$A$ 的顺序接（高位对高位，接反会让真值表的行全部错位）。
2. 函数含 $m_1,m_2,m_4,m_7$，所以 $D_1=D_2=D_4=D_7$ 接高电平，$D_0=D_3=D_5=D_6$ 接地。
3. 输出端就是 $F$：$F=\sum m_iD_i=m_1+m_2+m_4+m_7$。

验算：取地址 `CBA=100`（$m_4$）：MUX 选中 $D_4$，它接的是 1，输出 1 ✓，与 $F$ 在 `100` 行应为 1 一致。再取 `CBA=110`（$m_6$）：选中 $D_6$ 接 0，输出 0 ✓。

代价提醒：MUX 法省了化简，但用的是完整的 8 选 1。如果函数很稀疏（只有一两个最小项），它未必比一个与门便宜。工程上选哪种，取决于器件库存和布线成本，跟哪种更聪明没关系。
:::

四道题走完，方法层面的东西已经齐了。下面把这些器件放回真实系统里，看它们各自出现在什么位置、又各自在什么场合出问题。

## 七、工程实例

1. 数码管译码：74LS48 把 4 位 BCD 码翻成七段显示信号，本质就是一张 4 输入 7 输出的真值表。这是译码器最典型的用法，也是 [01 章](./number-systems.md) 讲的 BCD 码落地的地方。
2. 三人表决用 138：需求「至少两人同意」对应 $\sum m(3,5,6,7)$，一片 138 的四个输出接一个四输入与非门就完成了，比第三节的四个门方案器件更少、布线更整齐。这就是中规模器件被称为函数发生器的原因。
3. FPGA 里的 LUT：查找表本质就是一个小型 MUX，$n$ 输入的 LUT 用 $2^n$ 个存储位存真值表，地址就是输入。所以前面学的用 MUX 实现函数，就是 FPGA 内部实际在干的事。
4. 竞争冒险在现场：最常见的后果往往不是算错数，是复位或使能信号上出现毛刺，把触发器误触发一次，系统偶发死机。这类问题往往跑一万次才出现一次，只能靠示波器抓。防护手段就是第五节那三招，其中加冗余项在综合工具里对应一个选项（常写作 redundant logic 或 hazard cover）。
5. 超前进位的真实取舍：4 位用超前进位几乎免费，32 位就要分组（每 4 位一组，组间再超前进位），再往上就干脆改成流水线。芯片设计里到处是这种用面积换延迟的折中。

## 八、易错清单（按踩坑频率排序）

1. 把有反馈的电路当成组合逻辑，分析时表达式写不下去，或者真值表列出来自相矛盾。看到输出绕回输入就先按时序逻辑处理。
2. 用 138 时忘了输出低有效，把与非门换成与门，函数整体取反，测试全错。记住口诀：**低有效的输出要用与非门收**。
3. 138 和 151 的使能端没接，片子完全不工作，输出恒为某个电平，看起来像芯片坏了。$G_1$ 接高、$\bar G_{2A}$、$\bar G_{2B}$ 接低。
4. MUX 的地址顺序接反，真值表的行整体错位，看起来像某些最小项错了。高位对高位，铭牌上标 $S_2S_1S_0$ 就按它接。
5. 优先编码器优先级记反，多个输入同时有效时选中了错的那个。下标越大优先级越高，$I_7$ 最高。
6. 设计时省掉真值表直接写表达式，漏项或多出无关项，而且无法自查。先列 8 行表，再从输出为 1 的行抄。
7. 把竞争冒险当成逻辑错误，反复改逻辑也改不好，因为逻辑本来就是对的。先确认静态分析没错，再按时间问题处理（冗余项、选通、滤波）。
8. 用加法器时不检查溢出，4 位加法算出 16 却只写 `0000`，丢掉了 $C_4$。结果要连进位一起写，并说明需要几位。

## 九、自检

合上页面自己说一遍：

1. 给你一张门电路图，你怎么在十秒内判断它是组合逻辑还是时序逻辑？判据是什么？
2. 用一片 74LS138 实现 $F=\sum m(0,2,4,6)$，需要引出哪几根输出线？用与门还是与非门？
3. 表达式 $Y=AB+\bar AC$ 在 $B=C=1$ 时逻辑上恒为 1，为什么实际输出会掉一个窄脉冲？补哪一项能消掉它？

## 下一步

前面讲的都是没有记忆的电路。可所有真实系统都需要记忆，不然算完的结果下一秒就没了。下一章进入触发器，那里会出现一个前面没碰过的量：时钟。而一旦有了时钟，时间就不再只是延迟不同这种麻烦，而是变成了写进器件规格里的硬约束。

<Prereq id="setup-hold" /> → [05 · 触发器](./flip-flops.md)
