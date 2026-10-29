---
title: 06 · 计数器与寄存器
description: 模 N 是「一圈几个状态」、异步与同步差在谁触发谁、一片 74LS161 怎么拼出任意进制、移位寄存器怎么把串行搬成并行，以及 555 那两个公式的来历。九张图、五道例题，每道都从「先想清楚要用什么办法」走到验算。
---

# 06 · 计数器与寄存器

<Meta time="50 min" level="核心" note="三个坑最深：清零法接 N 而置数法接 N−1；异步计数器忘了延迟是一级级累加的；555 的公式里漏掉 2R₂。" />

板子上要一个 1 秒的节拍，手边只有一颗 32.768 kHz 的晶振，希望每 32768 个脉冲输出一次。最顺手的办法是把触发器一级级接起来分频：一级除 2、两级除 4、十五级除 32768。32768 是不是刚好能这么除尽？是的，$32768=2^{15}$，十五级刚好整除。

换一个需求就没这么巧了。0~59 的秒计数（六十进制）里，60 不是 2 的幂，再怎么级联二分频也拼不出来，只能换一种做法：让它数到 60 就自己归零。

两件事问的是同一个问题：一个计数器凭什么知道「该归零了」，以及它归零的那一瞬间会不会出问题。下面几节就回答这两个问题，外加一个绕不开的邻居 555，很多板子的第一个时钟源就是它给的。

::: tip 读这页之前
要会触发器的特性方程与边沿触发（[05 · 触发器](./flip-flops.md)），知道建立时间那个预算怎么算（<Prereq id="setup-hold" />），也会用与非门把几根线收成一个信号（[04 · 组合逻辑电路](./combinational.md)）。忘了也能跟上，用到的地方会把式子重写一遍。

符号先交代清楚：$Q_3Q_2Q_1Q_0$ 是四位输出，合起来表示一个 4 位二进制数，$Q_3$ 是最高位；模记作 $N$ 或写作「模 $N$」，指一个循环里有几个状态；$\bar R_D$ 是异步清零端，横杠表示低电平有效，$D$ 表示作用于 D 触发器；$\bar{LD}$ 是同步置数端（load，装载）；$f$、$T$ 是频率与周期；$t_{pd}$ 是单级传输延迟。全部约定见[符号与约定](../guide/notation.md)。

两个词各一句话：计数器（counter）是「每来一个时钟，输出按固定规律变一次」的电路，最简单的规律就是数数；寄存器（register）是「一组共用一个时钟的触发器」，作用是在同一个沿上同时存下一个字。

还要用一点对数：判断需要几位触发器时用 $\lceil\log_2 N\rceil$（向上取整），例如 $N=10$ 需要 4 位（因为 $2^3=8<10\le16=2^4$）。
:::

::: tip 一句话抓住本质
计数器就是一个会自己回头的状态机。所有「任意进制」的技巧都是同一招：在某个特定状态上产生一个控制信号，把状态强行拉回起点。想清楚两件事，在哪个状态拉、这个信号是立刻生效还是要等时钟，剩下的就顺了。
:::

## 一、模：一个循环里有几个状态

**模**（modulus，记作 $N$）就是一个循环里经过的状态数。从 0 数起，数到 5，再回 0，这就是一个模 6 的循环。模 6 的计数器输出序列是 $0,1,2,3,4,5,0,1,\dots$，一共 6 个状态；模 10 就是 $0\sim9$ 十个状态。二进制计数器（$0,1,2,\dots,2^n-1$ 再回 0）只是模 $N=2^n$ 的特例。

<FigBox title="模 6：六个状态围成一圈" kind="结构" note="每个时钟沿往前走一格，走满一圈回到起点。三个触发器能表示 8 个状态，模 6 只用了其中 6 个，剩下那两个必须保证永远不会被走进去，否则计数器会跑飞。">

<svg viewBox="0 0 470 250" role="img" aria-label="模 6 计数器的状态环：六个状态 0 到 5 顺时针排列，最后一个状态回到 0">
<defs>
  <marker id="ct-r1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <line x1="136" y1="58" x2="200" y2="88" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-r1)" />
  <line x1="216" y1="116" x2="216" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-r1)" />
  <line x1="200" y1="178" x2="136" y2="198" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-r1)" />
  <line x1="90" y1="200" x2="56" y2="180" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-r1)" />
  <line x1="44" y1="148" x2="44" y2="116" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-r1)" />
  <line x1="60" y1="84" x2="86" y2="64" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-r1)" />

  <circle cx="130" cy="44" r="17" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="130" y="49" text-anchor="middle" font-weight="700">0</text>
  <circle cx="216" cy="96" r="17" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="216" y="101" text-anchor="middle" font-weight="700">1</text>
  <circle cx="216" cy="170" r="17" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="216" y="175" text-anchor="middle" font-weight="700">2</text>
  <circle cx="130" cy="212" r="17" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="130" y="217" text-anchor="middle" font-weight="700">3</text>
  <circle cx="44" cy="170" r="17" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="44" y="175" text-anchor="middle" font-weight="700">4</text>
  <circle cx="44" cy="96" r="17" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="44" y="101" text-anchor="middle" font-weight="700">5</text>

  <text x="262" y="52" font-size="11" fill="var(--vp-c-text-2)">模 N = 一圈的状态数</text>
  <text x="262" y="74" font-size="11" fill="var(--vp-c-text-2)">模 6 → 循环 0~5 共 6 个</text>
  <text x="262" y="102" font-size="11" fill="var(--vp-c-text-3)">需要 3 位触发器：</text>
  <text x="262" y="120" font-size="11" fill="var(--vp-c-text-3)">⌈log₂6⌉ = 3 位</text>
  <text x="262" y="148" font-size="11" fill="var(--vp-c-text-3)">空闲状态 6、7 必须</text>
  <text x="262" y="166" font-size="11" fill="var(--vp-c-text-3)">能被自启动拉回环内</text>
  <text x="262" y="196" font-size="11" fill="var(--vp-c-brand-1)">模不是 2 的幂时，「回头」</text>
  <text x="262" y="214" font-size="11" fill="var(--vp-c-brand-1)">要靠一个额外的控制信号</text>
</g>
</svg>

</FigBox>

有三个数必须分清，混了就全错：

| 量 | 意思 | 模 6 的例子 |
| --- | --- | --- |
| 模 $N$ | 一个循环的状态数 | $N=6$ |
| 触发器位数 $n$ | 能表示多少状态，取 $\lceil\log_2 N\rceil$ | 3 位（能表示 8 个状态） |
| 空闲状态 | $2^n-N$ 个用不到的编码 | 6、7 两个 |

三个触发器一共 8 个编码，环里用掉 6 个，剩下 2 个空着，麻烦就出在这 2 个空编码上。

空闲状态是「任意进制」最容易出事的地方。异步清零的电路如果上电时恰好落进状态 6 或 7，它可能永远出不来：清零条件只在「等于 $N$」时成立，而 6 或 7 的编码可能永远不再出现。这种电路叫**不能自启动**。工程上要么选能自启动的接法，要么上电时用复位强制进入有效状态。这个问题在第三节还会再提一次。

所以 $N$ 不必是 2 的幂，「任意进制」是计数器的常规需求，不是特例。石英钟里那颗 32.768 kHz 的晶振，走的正是 2 的幂这条顺路。

知道了模是什么意思，下一个问题是结构上的：这些触发器怎么接？让低位去触发高位，还是大家共用一个时钟？这个选择直接决定速度上限。

## 二、异步与同步：差在谁去触发谁

**异步计数器**（也叫**行波计数器**，ripple counter）的接法极其省事：把前一级的输出 $Q$ 直接接到后一级的时钟端。后一级「跟着」前一级的翻转而翻转，像波浪一样从低位传到高位。

**同步计数器**的接法相反：所有触发器的时钟端并联，接同一个时钟；每一位该不该翻转，由组合逻辑根据当前所有位的值算出来，在同一个沿上一起翻。

<FigBox title="两种接法：一位传一位，还是一起动" kind="结构" note="上：行波结构，Q₀ 就是 Q₁ 的时钟，Q₁ 就是 Q₂ 的时钟，延迟一级级累加。下：同步结构，四位的时钟并联在同一根线上，各输入由组合逻辑同时给出，只有两级延迟（触发器加一次组合逻辑），与位数基本无关。">

<svg viewBox="0 0 480 300" role="img" aria-label="上图是行波计数器，前一级输出驱动后一级时钟；下图是同步计数器，四位共用时钟并由组合逻辑给出各自的翻转条件">
<defs>
  <marker id="ct-c1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="ct-c2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="16" y="20" fill="var(--vp-c-text-3)">异步（行波）：Q 当时钟用</text>
  <text x="6" y="72" font-size="10">CLK</text>
  <line x1="34" y1="68" x2="52" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-c1)" />
  <rect x="54" y="48" width="66" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="87" y="72" text-anchor="middle" font-size="10.5">T′₀</text>
  <rect x="160" y="48" width="66" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="193" y="72" text-anchor="middle" font-size="10.5">T′₁</text>
  <rect x="266" y="48" width="66" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="299" y="72" text-anchor="middle" font-size="10.5">T′₂</text>
  <rect x="372" y="48" width="66" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="405" y="72" text-anchor="middle" font-size="10.5">T′₃</text>
  <line x1="120" y1="68" x2="156" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-c1)" />
  <line x1="226" y1="68" x2="262" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-c1)" />
  <line x1="332" y1="68" x2="368" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-c1)" />
  <text x="142" y="72" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q₂</text>
  <text x="244" y="72" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q₁</text>
  <text x="350" y="72" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q₀</text>
  <text x="120" y="108" font-size="10" fill="var(--vp-c-text-3)">每一位都要「等」前一位翻完 → 延迟逐级累加</text>

  <line x1="16" y1="128" x2="466" y2="128" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />

  <text x="16" y="150" fill="var(--vp-c-text-3)">同步：时钟并联，翻转条件由组合逻辑算</text>
  <line x1="20" y1="250" x2="466" y2="250" stroke="var(--vp-c-text-3)" stroke-width="1.8" />
  <text x="24" y="266" font-size="10" fill="var(--vp-c-text-3)">CLK（一根线，四位共用）</text>
  <line x1="87" y1="250" x2="87" y2="228" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ct-c2)" />
  <line x1="193" y1="250" x2="193" y2="228" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ct-c2)" />
  <line x1="299" y1="250" x2="299" y2="228" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ct-c2)" />
  <line x1="405" y1="250" x2="405" y2="228" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ct-c2)" />

  <rect x="54" y="186" width="66" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="87" y="211" text-anchor="middle" font-size="10.5">FF₀</text>
  <rect x="160" y="186" width="66" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="193" y="211" text-anchor="middle" font-size="10.5">FF₁</text>
  <rect x="266" y="186" width="66" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="299" y="211" text-anchor="middle" font-size="10.5">FF₂</text>
  <rect x="372" y="186" width="66" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="405" y="211" text-anchor="middle" font-size="10.5">FF₃</text>

  <rect x="146" y="166" width="94" height="14" rx="4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="193" y="162" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">T = Q₀</text>
  <rect x="252" y="166" width="94" height="14" rx="4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="299" y="162" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">T = Q₁Q₀</text>
  <rect x="358" y="166" width="94" height="14" rx="4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="405" y="162" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">T = Q₂Q₁Q₀</text>
  <text x="20" y="286" font-size="10" fill="var(--vp-c-brand-1)">一条沿同时到达四位：延迟与位数无关，代价是多几级与门</text>
</g>
</svg>

</FigBox>

行波结构里第 0 位先翻，第 1 位等它，第 2 位再等第 1 位，一位一位传到第 3 位。同步结构里没有这种排队。

这个差别直接变成频率上限的差别。异步计数器里，最高位要等前面所有位都翻完：$n$ 位串起来，最坏路径就是 $n$ 倍的 $t_{pd}$。同步计数器里，一条时钟沿同时到达所有触发器，最坏路径只有「触发器延迟加一级进位逻辑」。

给个量级印象：4 位、每级 20 ns 的器件，行波结构最坏要 4 级串起来，就是 80 ns；同步结构只要「触发器 20 ns 加一级与门 10 ns」，30 ns 就够。前者折 12.5 MHz，后者折 33 MHz 上下，差 2 倍多，细账留到例 2。

波形上更直观。下面这张图里，CLK 是时钟，$Q_1$、$Q_2$ 是低两位的输出，进位 $C$ 只在「前两位都是 1」时才有效：

<FigBox title="二进制计数器的时序：每一位的频率都是前一位的一半" kind="波形" note="Q₁ 每个时钟周期翻一次，Q₂ 每两个周期翻一次，再往上每四个，频率逐级对半，所以计数器天生就是分频器。进位 C 的宽度只有一个时钟周期，它标出这一拍之后要往高一位进。">

<WavePreset kind="logic" />
</FigBox>

这里能看清两件事。一是 $Q$ 的频率逐级减半，所以「4 位二进制计数器」同时就是一个 16 分频器，上一章例 3 讲的级联分频，在结构上就是这同一件事。二是进位信号的脉冲很窄，只有一个周期，这也是同步计数器要用组合逻辑预先算好进位、而不能「等前一位翻完再说」的理由。

异步结构的延迟代价，第三节会用具体数字算一遍；而决定数字电路速度的，是同步结构的时钟周期预算（上一章第四节）。不过先要解决一个更实际的问题：模不是 2 的幂时，怎么让它乖乖回头。

## 三、任意模 N：清零法接 N，置数法接 N−1

模 $N$ 不是 2 的幂时，拼法只有两种，区别就在「什么时候动手」。

集成计数器 **74LS161** 是干这事的标准件：4 位同步二进制计数器（模 16），带四个额外引脚：

| 引脚 | 名字 | 作用 | 生效时机 |
| --- | --- | --- | --- |
| $\overline{R_D}$ | 异步清零 | 强制 $Q_3Q_2Q_1Q_0=0000$ | 立刻，不等时钟 |
| $\overline{LD}$ | 同步置数 | 把 $D_3D_2D_1D_0$ 装进输出 | 下一个时钟沿 |
| $CT_P$、$CT_T$ | 计数使能 | 两个都有效时才计数 | 时钟沿 |
| $CO$ | 进位输出 | 计到 15 时给出高电平 | 组合输出 |

注意前两行的区别，这是整个第三节的要害：**清零是立刻生效的，置数要等下一个沿**。这一个时间差，让两者的检测码差 1。

做法一，异步清零法：让它自然数，数到 $N$ 出现的那一瞬间，用清零端把它拉回 0。检测码就是 $N$ 本身。

做法二，同步置数法：所有 $D_i$ 接地，数到 $N-1$ 时让置数端有效。因为置数要等下一个沿，所以下一个沿到来时它从 $N-1$ 直接跳到 0，循环是 $0\sim N-1$，正好 $N$ 个状态。检测码是 $N-1$。

<FigBox title="同一个模 6，两种做法的检测码差 1" kind="时序" note="上面是状态序列：数到 5 之后再走一步就是 6。异步清零在 6 一闪现的瞬间就把它打回 0，检测码 6 即 0110；同步置数在 5 出现时就准备好，等下一个沿才装 0，检测码 5 即 0101。">

<svg viewBox="0 0 480 300" role="img" aria-label="模 6 计数器的状态阶梯图，以及异步清零脉冲与同步置数准备信号的位置对比">
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="14" y="26" fill="var(--vp-c-text-3)">状态</text>
  <text x="14" y="74">5</text>
  <text x="14" y="104">4</text>
  <text x="14" y="134">3</text>
  <text x="14" y="164">2</text>
  <text x="14" y="194">1</text>
  <text x="14" y="224">0</text>

  <polyline points="44,220 84,220 84,190 124,190 124,160 164,160 164,130 204,130 204,100 244,100 244,70 284,70 284,220 324,220 324,190 364,190 364,160 404,160 404,130 444,130" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <text x="86" y="242" font-size="9.5" fill="var(--vp-c-text-3)">0</text>
  <text x="126" y="242" font-size="9.5" fill="var(--vp-c-text-3)">1</text>
  <text x="166" y="242" font-size="9.5" fill="var(--vp-c-text-3)">2</text>
  <text x="206" y="242" font-size="9.5" fill="var(--vp-c-text-3)">3</text>
  <text x="246" y="242" font-size="9.5" fill="var(--vp-c-text-3)">4</text>
  <text x="266" y="66" font-size="9.5" fill="var(--vp-c-brand-1)">5</text>
  <text x="286" y="242" font-size="9.5" fill="var(--vp-c-brand-1)">回到 0</text>

  <line x1="284" y1="60" x2="284" y2="230" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="290" y="58" font-size="9.5" fill="var(--vp-c-text-3)">异步清零脉冲出现在这里</text>

  <text x="14" y="272" fill="var(--vp-c-text-3)">R̄_D</text>
  <polyline points="44,288 280,288 280,268 292,268 292,288 470,288" fill="none" stroke="#f43f5e" stroke-width="2" />
  <text x="300" y="284" font-size="9.5" fill="#f43f5e">检测 0110 = 6，一闪即消</text>

  <text x="14" y="252" fill="var(--vp-c-text-3)">L̄D</text>
  <polyline points="44,258 244,258 244,244 284,244 284,258 470,258" fill="none" stroke="#34d399" stroke-width="2" />
  <text x="290" y="254" font-size="9.5" fill="#34d399">检测 0101 = 5，等下一个沿才装数</text>
</g>
</svg>

</FigBox>

常见模数一张表列完，都按 74LS161 的接法：

| 目标 | 需要的位 | 异步清零检测码 | 同步置数检测码 |
| --- | --- | --- | --- |
| 模 6（$N=6$） | 3 位 | `0110` = 6 | `0101` = 5 |
| 模 10（十进制） | 4 位 | `1010` = 10 | `1001` = 9 |
| 模 12（十二进制） | 4 位 | `1100` = 12 | `1011` = 11 |

模 6 用 3 位就够，模 10 和模 12 都要 4 位，这就是那个 $\lceil\log_2 N\rceil$ 的用处。另外看模 10 的清零检测码 `1010`，两个 1 出现在 $Q_3$ 和 $Q_1$ 上，所以「$Q_3Q_1$ 同时为 1」就是检测条件，一个与非门足够。检测码是 4 位二进制，从 $Q_3$ 排到 $Q_0$，哪一位是 1 就要接哪一根线。

异步清零有个副作用值得记住：$N$ 那个状态会极短暂地出现在输出上，就是图里一闪即消的尖峰。多数场合无害，但如果输出还接着译码器或比较器，那个尖峰可能被当成一个有效状态。这时应该改用同步置数法，它的输出序列干净，从不出现 $N$。

两条口诀抄在这里：**清零检测 $N$，置数检测 $N-1$**，差的那 1 只因为一个等时钟、一个不等。

两种做法各有取舍，工程上还有第三个选择：直接买一个模数正好对得上的成品，比如 74LS160 是十进制、74LS162 是十进制同步清零。能用现成的就用现成的，这是个成本问题，不是智商问题。同一块板子上更常见的分工是：555 只管按时钟，数数交给 74LS161。

## 四、寄存器与移位寄存器：存一个字，搬一串位

**寄存器**（register，一组共用一个时钟的触发器）最简单的形态就是上一章例 2 说的那个：几个 D 触发器并排，共用一个时钟，一个沿存下一个字。加一个输入选择就可以做成双向的：要么装外部数据（并行输入），要么保持不动。

**移位寄存器**（shift register）把触发器串起来：每一个的输出接下一个的输入，所有触发器共用一个时钟。于是每来一个沿，整个内容整体右移一格，新的那一位从最左边挤进来。

<FigBox title="串行进、并行出：四个沿把 1011 装满" kind="结构" note="上面是四级移位寄存器，串行输入只占一根线。下面是四个时钟拍的过程：初态 0000，每拍移一格并送入一位，四拍之后并行输出端正好是 1011。串口通信、ADC 采样、LED 驱动芯片都靠这个动作。">

<svg viewBox="0 0 480 300" role="img" aria-label="四级移位寄存器结构，以及四个时钟拍把串行数据 1011 移入并在并行输出端得到 1011 的过程">
<defs>
  <marker id="ct-s1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="438" y="26" font-size="10" fill="var(--vp-c-text-3)">串入</text>
  <line x1="474" y1="56" x2="431" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-s1)" />
  <rect x="64" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="97" y="62" text-anchor="middle" font-size="10.5">FF₃</text>
  <rect x="164" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="197" y="62" text-anchor="middle" font-size="10.5">FF₂</text>
  <rect x="264" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="297" y="62" text-anchor="middle" font-size="10.5">FF₁</text>
  <rect x="364" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="397" y="62" text-anchor="middle" font-size="10.5">FF₀</text>

  <line x1="164" y1="56" x2="134" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ct-s1)" />
  <line x1="264" y1="56" x2="234" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ct-s1)" />
  <line x1="364" y1="56" x2="334" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ct-s1)" />

  <line x1="97" y1="76" x2="97" y2="92" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="197" y1="76" x2="197" y2="92" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="297" y1="76" x2="297" y2="92" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="397" y1="76" x2="397" y2="92" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="97" y="106" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">Q₃</text>
  <text x="197" y="106" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">Q₂</text>
  <text x="297" y="106" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">Q₁</text>
  <text x="397" y="106" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">Q₀</text>
  <text x="64" y="126" font-size="9.5" fill="var(--vp-c-text-3)">并行输出：Q₃Q₂Q₁Q₀ 一起读走</text>

  <line x1="16" y1="146" x2="466" y2="146" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />

  <text x="14" y="174" fill="var(--vp-c-text-3)">CLK</text>
  <polyline points="44,182 74,182 74,162 104,162 104,182 134,182 134,162 164,162 164,182 194,182 194,162 224,162 224,182 254,182 254,162 284,162 284,182 470,182" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.8" />

  <text x="14" y="208" fill="var(--vp-c-text-3)">串入</text>
  <polyline points="44,196 104,196 104,216 164,216 164,196 470,196" fill="none" stroke="#f59e0b" stroke-width="2" />
  <text x="86" y="190" font-size="9.5" fill="#f59e0b" text-anchor="middle">1</text>
  <text x="130" y="212" font-size="9.5" fill="#f59e0b" text-anchor="middle">0</text>
  <text x="188" y="190" font-size="9.5" fill="#f59e0b" text-anchor="middle">1</text>
  <text x="248" y="190" font-size="9.5" fill="#f59e0b" text-anchor="middle">1</text>

  <text x="14" y="250" fill="var(--vp-c-text-3)">内容</text>
  <text x="86" y="250" font-size="10.5">0000</text>
  <text x="146" y="250" font-size="10.5">0001</text>
  <text x="206" y="250" font-size="10.5">0010</text>
  <text x="266" y="250" font-size="10.5">0101</text>
  <text x="326" y="250" font-size="10.5" fill="var(--vp-c-brand-1)">1011</text>
  <text x="386" y="250" font-size="9.5" fill="var(--vp-c-text-3)">四拍装满</text>
  <text x="44" y="276" font-size="10" fill="var(--vp-c-text-3)">每拍：整体左移一格，最低位（最右）让给新来的串行数据</text>
  <text x="44" y="294" font-size="10" fill="var(--vp-c-brand-1)">四拍 = 4 个数据位，所以四位移位寄存器要 4 个时钟周期完成一次串并转换</text>
</g>
</svg>

</FigBox>

移位寄存器有三种常见形态，区别只在数据从两头进还是从一头上：

| 形态 | 数据流向 | 典型用途 |
| --- | --- | --- |
| 串入串出（SISO） | 一端进、一端出 | 延时线，多拍延迟 |
| 串入并出（SIPO） | 一端进，全体一起出 | 串口收数据（UART 接收）、74HC595 驱动数码管 |
| 并入串出（PISO） | 全体一起进，一端出 | 串口发数据（UART 发送）、把并行数据转成串行 |

还有双向移位寄存器（如 74LS194），可以左移也可以右移，靠两个控制端选方向。移位在硬件里就是接线方式：左移是把每个输出接到左边邻居的输入，右移是接到右边邻居。所以方向切换只需要多一层选择器。

数数和存数这两件事到这里都有了。剩下最后一块拼图：这个时钟本身从哪来？很多板子的第一个时钟源常常就是那颗八条腿的 555，未必是晶振。

## 五、555：一个模拟电路怎么当上时钟源

555 是个模数混血的器件：内部是模拟的比较器和分压电阻，输出却是干净的数字电平。核心结构只有三样东西。三个 5 kΩ 电阻串在 $V_{CC}$ 与地之间，得到 $2/3V_{CC}$ 和 $1/3V_{CC}$ 两个参考电平，555 这个名字就是从这三个 5 来的。两个比较器分别盯着「阈值电压 TH 是否超过 $2/3V_{CC}$」和「触发电压 TR 是否低于 $1/3V_{CC}$」。一个 RS 触发器把比较结果变成输出，并且控制一只放电管（DIS 引脚）。

接成**多谐振荡器**（astable multivibrator，就是自己一直振荡）时，555 外面只加两个电阻一个电容：电容通过 $R_1$ 和 $R_2$ 从 $V_{CC}$ 充电，充到 $2/3V_{CC}$ 时上比较器翻转，放电管导通，电容通过 $R_2$ 放电；放到 $1/3V_{CC}$ 时下比较器翻转，放电管关断，又开始充电。周而复始，输出就是一串方波。

<FigBox title="电容在 1/3 与 2/3 Vcc 之间来回，输出就是方波" kind="结构" note="左边的接法里，充电路径经过 R₁+R₂，放电路径只经过 R₂。这个不对称就是公式里出现 2R₂ 的原因，也是 555 的占空比永远大于 50% 的原因。右边是电容电压（锯齿）与输出（方波）的关系。">

<svg viewBox="0 0 480 280" role="img" aria-label="555 多谐振荡器的外部接法与波形：电容电压在三分之一与三分之二电源电压之间锯齿变化，输出为方波">
<defs>
  <marker id="ct-v1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="18" y="24" font-size="10" fill="var(--vp-c-text-3)">Vcc</text>
  <line x1="48" y1="20" x2="164" y2="20" stroke="var(--vp-c-text-3)" stroke-width="1.6" />
  <line x1="66" y1="20" x2="66" y2="42" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <rect x="56" y="42" width="20" height="34" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="84" y="62" font-size="9.5">R₁</text>
  <line x1="66" y1="76" x2="66" y2="108" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <circle cx="66" cy="92" r="2.5" fill="var(--vp-c-brand-1)" />
  <line x1="66" y1="92" x2="160" y2="92" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#ct-v1)" />
  <text x="124" y="86" font-size="9" fill="var(--vp-c-brand-1)">DIS</text>
  <rect x="56" y="108" width="20" height="34" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="84" y="128" font-size="9.5">R₂</text>
  <line x1="66" y1="142" x2="66" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <circle cx="66" cy="160" r="2.5" fill="var(--vp-c-brand-1)" />
  <line x1="66" y1="160" x2="160" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#ct-v1)" />
  <text x="124" y="154" font-size="9" fill="var(--vp-c-brand-1)">TH / TR</text>
  <line x1="42" y1="190" x2="90" y2="190" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <line x1="42" y1="198" x2="90" y2="198" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <text x="96" y="198" font-size="9.5">C</text>
  <line x1="66" y1="198" x2="66" y2="222" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="52" y1="222" x2="80" y2="222" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="57" y1="227" x2="75" y2="227" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="62" y1="232" x2="70" y2="232" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="66" y="246" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">GND</text>

  <rect x="160" y="70" width="76" height="100" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="198" y="108" text-anchor="middle" font-weight="700">555</text>
  <text x="198" y="126" text-anchor="middle" font-size="8.5" fill="var(--vp-c-text-3)">两比较器 + RS</text>
  <text x="198" y="140" text-anchor="middle" font-size="8.5" fill="var(--vp-c-text-3)">+ 放电管</text>
  <line x1="236" y1="120" x2="276" y2="120" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-v1)" />
  <text x="244" y="112" font-size="9" fill="var(--vp-c-brand-1)">OUT</text>

  <line x1="280" y1="24" x2="280" y2="276" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />

  <text x="288" y="44" font-size="9.5" fill="var(--vp-c-text-3)">电容电压</text>
  <line x1="282" y1="60" x2="466" y2="60" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="462" y="56" text-anchor="end" font-size="8.5" fill="var(--vp-c-text-3)">2/3 Vcc</text>
  <line x1="282" y1="108" x2="466" y2="108" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="462" y="104" text-anchor="end" font-size="8.5" fill="var(--vp-c-text-3)">1/3 Vcc</text>
  <polyline points="286,108 352,60 358,108 424,60 430,108 462,60" fill="none" stroke="#f59e0b" stroke-width="2" />

  <text x="288" y="140" font-size="9.5" fill="var(--vp-c-text-3)">输出</text>
  <polyline points="286,148 352,148 352,168 358,168 358,148 424,148 424,168 430,168 430,148 462,148" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="292" y="188" font-size="8.5" fill="var(--vp-c-text-3)">充电段=高电平（长）</text>
  <text x="360" y="200" font-size="8.5" fill="var(--vp-c-text-3)">放电段=低电平（很短）</text>
  <text x="288" y="230" font-size="9" fill="var(--vp-c-brand-1)">T = 0.693(R₁+2R₂)C</text>
  <text x="288" y="248" font-size="9" fill="var(--vp-c-text-3)">f ≈ 1.43 / [(R₁+2R₂)C]</text>
  <text x="288" y="266" font-size="9" fill="var(--vp-c-text-3)">占空比 = (R₁+R₂)/(R₁+2R₂)</text>
</g>
</svg>

</FigBox>

公式的来历只看两个数：充电时间 $t_{高}=0.693(R_1+R_2)C$（两条路径都参与），放电时间 $t_{低}=0.693R_2C$（只有 $R_2$ 参与）。加起来周期 $T=0.693(R_1+2R_2)C$，取倒数并取 $1/0.693\approx1.44$（教材习惯写 1.43）得

$$
f\approx\frac{1.43}{(R_1+2R_2)C}, \qquad \text{占空比}=\frac{R_1+R_2}{R_1+2R_2}>50\%
$$

后一个式子说明一件容易忽略的事：555 的多谐振荡器做不出 50% 占空比的方波，因为充电永远比放电多经过一个 $R_1$。想要对称方波，要么在 $R_2$ 两端并一个二极管把充放电路径分开，要么改用别的方案。

接成**单稳态**（monostable，按一下输出一个固定宽度的脉冲）时，$R$、$C$ 只有一个，脉宽：

$$
t_W\approx1.1RC
$$

这个 1.1 来自 $0.693\times\ln3$，也就是电容从 0 充到 $2/3V_{CC}$ 的时间。推导不必背，但含义要记住：脉宽只由 $R$ 和 $C$ 决定，与触发信号的宽度无关（只要触发够窄）。这就是定时的本质，你不需要精确控制按多久，只需要选一对 $R$、$C$，脉宽就定死了。

说到底，555 的整个故事就是一只电容在 $1/3V_{CC}$ 与 $2/3V_{CC}$ 之间来回跑，跑一趟的长度被折算成了时间。

计数、寄存、定时三件事都齐了，剩下的五道题按器件、时序、公式的顺序排，每题先看「先想什么」。

## 六、五道题：把上面的坑各踩一遍

::: tip 例 1 · 用 74LS161 构成十进制计数器 {#ex-ctr-1}
题目：用一片 74LS161 加最少的门，构成 0~9 循环的十进制计数器。

图见第三节那张「检测码差 1」的阶梯图，把状态数换成 0~9 就是本题。

先想什么：先确定用清零法还是置数法，这决定检测码。两者都对，但清零法少一个门（不用接 $D_3\sim D_0$），所以先用清零法。然后用上面那张表查：模 10 的异步清零检测码是 $N=10$ 的二进制 `1010`。

步骤：

1. 位数：$2^3=8<10\le16=2^4$，用 4 位（161 本来就是 4 位，不用选）。
2. 检测码：$10_{10}=1010_2$，也就是 $Q_3=1$、$Q_1=1$、其余为 0。*（为什么要写二进制而不写十进制：电路只认识线上的高低电平，检测条件的实现方式就是把对应那几根线接进与非门。）*
3. 检测条件用「$Q_3$ 与 $Q_1$ 同时为 1」实现，接一个两输入与非门，输出送 $\overline{R_D}$。$\overline{R_D}$ 低电平有效，所以「与非门输出 0」正好表示清零有效。
4. 使能端 $CT_P$、$CT_T$ 接高，让它一直计数。

验算：数到 9（`1001`）时 $Q_3Q_1=10$，与非门输出 1，不清零；数到 10（`1010`）时 $Q_3Q_1=11$，与非门输出 0，$\overline{R_D}$ 有效、立刻清零 ✓。序列是 $0,1,\dots,9$（10 一闪即消）→0，共 10 个状态 ✓。

一个必须检查的边界：上电瞬间如果输出恰好是 `1010`~`1111` 中的某个值会怎样？`1010`、`1011`、`1110`、`1111` 都含 $Q_3Q_1=11$，会立刻被清零，能自启动 ✓；但 `1100`、`1101` 只含 $Q_3=1$、$Q_1=0$，检测条件不成立，它会继续数到 `1110` 才被清零。所以这个电路能自启动，只是要多走两拍。这类检查一定要做，否则板子第一次上电就可能显示一个荒唐的值。
:::

::: tip 例 2 · 4 位异步计数器的最高工作频率 {#ex-ctr-2}
题目：4 位行波计数器，每位触发器传输延迟 $t_{pd}=20$ ns。求最高时钟频率；若时钟 10 MHz，还剩多少余量？

结构见第二节那张对比图的上半部分。

先想什么：行波计数器的要害是最高位要等前面所有位翻完，所以**最坏路径是 $n$ 级串联，不是一级**。这道题里 $n=4$。为什么不是 1 级：第 3 位的时钟来自第 2 位的输出，第 2 位又来自第 1 位，链条是一级级串起来的。

步骤：

1. 最坏路径：$4\times20=80$ ns。*（为什么乘 4：每一级都要等前一级的输出稳定，四级就是四次等待。）*
2. 最高频率：$f_{max}=1/80\ \text{ns}=12.5$ MHz。这是理论极限，实际要留余量。
3. 10 MHz 时周期 $T=100$ ns，余量 $100-80=20$ ns。

验算：换一种算法交叉检查。异步计数器的输出频率是 $f/16$，4 位翻转一个完整周期需要 16 个输入周期；如果 80 ns 刚好是「一次进位传递」的时间，那么这 80 ns 必须小于一个输入周期 100 ns，比值 0.8 说明还有 20% 余量 ✓。

结论与推论：余量只有 20%，温度升高或换批次器件就会出问题。要么降频到 8 MHz 以下，要么改同步结构。同步 4 位计数器的最坏路径只有「触发器延迟加一级与门」，同样的器件能把上限做到 50 MHz 以上，这就是第二节那个结构差别在数值上的体现。
:::

::: tip 例 3 · 4 位移位寄存器做串并转换（方向与次序都要约定） {#ex-ctr-3}
题目：4 位移位寄存器初态 `0000`，串行输入按时间先后为「1、0、1、1」。分别求「右移（新数据进最高位）」与「左移（新数据进最低位）」两种接法下，四拍之后并行输出端的值。

结构与时序见第四节那张图。

先想什么：这类题唯一会错的地方是方向。先把右移说清：整个内容往低位方向挪一格，最高位空出来接纳新数据，所以每拍的动作是「内容右移一位，新数据塞进最高位」。判断方向的通用办法只有一句：看新数据从哪一头进，从最高位进就是右移，从最低位进就是左移。方向定了，四拍就是四次机械的移位加填位。

步骤（$Q_3$ 是最高位，$Q_0$ 是最低位）：

| 拍 | 右移（新数据进 $Q_3$） | 左移（新数据进 $Q_0$） |
| --- | --- | --- |
| 初态 | `0000` | `0000` |
| 第 1 拍（入 1） | `1000` | `0001` |
| 第 2 拍（入 0） | `0100` | `0010` |
| 第 3 拍（入 1） | `1010` | `0101` |
| 第 4 拍（入 1） | `1101` | `1011` |

右移第一拍值得单独看：初态全 0，右移之后还是全 0，真正改变内容的只有填最高位这一步。*（为什么这一点重要：很多人以为移位一定改变数值，而空寄存器移几次还是空的，进去的只有新数据。）*

验算：两种接法的结果 `1101` 与 `1011` 互为位反序，把 `1101` 从右往左读就是 `1011`。这不是巧合：右移把最先到的位推到最高位，左移把它推到最低位，所以同一条输入序列在两种接法下得到的是同一个字的两种视角 ✓。

这题的教训：想让并行输出正好等于串入的位序（1、0、1、1 → `1011`），就必须用左移；用右移得到的是 `1101`，位是反的。串并转换的结果永远依赖两个约定：移的方向，与位的先后。实际器件（如 74HC595、SPI 的收发寄存器）手册里把这两条写得明明白白，抄错任何一条，输出就是位反序的乱码。这也是调 SPI、I²C 时最常见的「波形看着对、数值就是不对」的原因。
:::

::: tip 例 4 · 555 多谐振荡器与单稳态 {#ex-ctr-4}
题目：555 接成多谐振荡器，$R_1=R_2=10\ \text{k}\Omega$、$C=0.1\ \mu\text{F}$。求振荡频率与占空比；若改接成单稳态（只用 $R_1$、$C$），求输出脉宽。

接法与波形见第五节那张图。

先想什么：先分清要不要 2 倍。多谐振荡器的公式里 $R_2$ 要乘 2，因为电容充电走 $R_1+R_2$、放电只走 $R_2$；单稳态只有一个 $R$，所以是 $1.1RC$。记不住时就回到充电路径和放电路径这个物理图像，别硬背。

步骤：

1. 多谐频率：
   $$f=\frac{1.43}{(R_1+2R_2)C}=\frac{1.43}{(10+20)\times10^3\times0.1\times10^{-6}}=\frac{1.43}{3\times10^{-3}}=476.7\ \text{Hz}$$
   *（为什么分母是 3 ms：$30\ \text{k}\Omega\times0.1\ \mu\text{F}=3$ ms，先算出时间常数再看倒数，比直接代数字更不容易错。）*
2. 占空比：$\dfrac{R_1+R_2}{R_1+2R_2}=\dfrac{20}{30}=66.7\%$。
3. 单稳脉宽：$t_W=1.1R_1C=1.1\times10^4\times10^{-7}=1.10$ ms。

验算：用周期核一遍。$f=476.7$ Hz 对应 $T=2.098$ ms；而 $t_{高}+t_{低}=0.693\times20\ \text{k}\times0.1\ \mu+0.693\times10\ \text{k}\times0.1\ \mu=1.386+0.693=2.079$ ms，两者差 0.9%，来自 1.43 与 $1/0.693=1.443$ 的取整差 ✓，量级完全对得上。

一个常见追问：想让占空比接近 50% 怎么办？在 $R_2$ 上并一个二极管（阳极朝电容），让充电也变成只经过 $R_2$，这样两条路径对称，占空比就接近 50%。代价是频率公式变成 $1.44/(2R_2C)$ 量级，要重新算。
:::

::: tip 例 5 · 同一模数，两种做法对比 {#ex-ctr-5}
题目：要求 0~5 循环（模 6）。分别用异步清零法和同步置数法，写出各自的检测条件，并说明输出序列的差别。

图见第三节的阶梯图，正是模 6 的情形。

先想什么：这题的价值不在算出答案，而在**看清检测码为什么差 1**。抓住一句：清零立刻生效，所以它必须在 $N$ 出现的那一刻动手；置数要等下一个沿，所以它提前一步在 $N-1$ 时就准备好。谁等时钟，谁就提前一格。

步骤：

1. 异步清零法：检测 $N=6$ 的二进制 `0110`，即 $Q_2Q_1$ 同时为 1，接一个与非门到 $\overline{R_D}$。
2. 同步置数法：检测 $N-1=5$ 的二进制 `0101`，即 $Q_2Q_0$ 同时为 1，接一个与非门到 $\overline{LD}$（$D_3\sim D_0$ 全接地）。
3. 输出序列的差别：清零法的序列是 $0,1,2,3,4,5$（`0110` 一闪即消）；置数法的序列是 $0,1,2,3,4,5$，从不出现 `0110`。

验算：两种做法都是 6 个状态，所以都是模 6 ✓。顺着看一遍检测码：清零法测的是 $N$，置数法测的是 $N-1$，后者永远提前一格。差别在有没有那个尖峰：接译码器显示时，清零法会在尖峰期间短暂点亮「6」的那一段，肉眼看不见；但如果是接比较器或中断触发，那个尖峰就是一个真实事件。这就是选同步置数法的理由，也是它值得多接四根线的理由。
:::

## 七、工程实例

1. 电子秒表的个位：74LS161 做十进制（例 1），输出经 74LS48 译码驱动共阴数码管，进位输出 $CO$ 送下一级的时钟，这就是一条完整的十进位链。两位、三位只是把这个结构重复。
2. 分频链：32.768 kHz 晶振经 15 级二分频得 1 Hz，是所有石英钟的核心。第 0 级输入 32768 Hz，第 1 级 16384 Hz，一路减半，第 15 级正好 1 Hz。为什么选 32768：它等于 $2^{15}$，用纯二分频链就能整除，而且这个频率的晶振可以做得很小。
3. 串口通信：UART 收数据时，把串行线上的位一位一位移进移位寄存器（SIPO），凑满 8 位后一起读走；发数据时反过来（PISO）。两个方向用的都是第四节的电路。
4. LED 驱动（74HC595）：三根控制线就能点亮几十个 LED，靠的就是串入并出，数据一位一位移进去，装满后一个锁存脉冲同时更新所有输出。这是用时间换引脚的典型设计。
5. 看门狗与上电复位：模数不是 2 的幂的计数器在这里很常见（比如数到 65535 或某个特定值就复位）。这类电路最怕的就是不能自启动，上电时若落进空闲状态，整个系统就再也起不来。
6. 555 的实际定位：便宜、耐操、外围简单，但照 $f\approx\dfrac{1.43}{(R_1+2R_2)C}$ 和 $t_W\approx1.1RC$ 算出来的值只能当参考，电阻电容容差 1%~5% 很常见，定时就跟着飘。它也做不高频率，典型上限几百 kHz。所以现代设计里 555 多用于亮个灯、响个蜂鸣器、做个复位延时，精确时钟一律用晶振加锁相环。

## 八、易错清单（按踩坑频率排序）

1. 清零法接 $N$、置数法也接 $N$，会让置数法少数一个状态（模数差 1）。记住：清零检测 $N$，置数检测 $N-1$，差别来自等不等时钟。
2. 异步计数器忽略累积延迟，算出的上限比实际能跑的高出好几倍，实物偶发丢数。最坏路径是 $n\times t_{pd}$，不是 $1\times t_{pd}$。
3. 555 公式里漏掉 $2R_2$，频率算成两倍多，实际接上去完全不对。记住充电路径走两个电阻、放电只走一个。
4. 以为 555 能出 50% 占空比，按 50% 设计时序，结果高电平偏长。占空比恒为 $(R_1+R_2)/(R_1+2R_2)>50\%$，要对称必须加二极管。
5. 忘了检查自启动，上电落进空闲状态，整个计数器卡死。每个任意进制电路都要问一句：上电时如果落在 $N\sim2^n-1$，下一拍会去哪。
6. 移位方向与位的先后搞反，串并转换的结果位反序，数据看起来对但值不对。先明确新数据进哪一位，再排串入顺序。
7. 把模 $N$ 和位数混为一谈，用 4 位就以为一定是模 16。位数只决定最多能表示多少状态，模是实际用到的状态数。
8. 异步清零的尖峰喂给了下游，下游看到一个本不该存在的状态，触发一次误动作。对尖峰敏感时改用同步置数法。

## 九、自检

合上页面自己说一遍：

1. 「模 12 的计数器」和「4 位二进制计数器」有什么区别？模 $N$ 与「4 位」这两个说法，分别在什么情况下用？
2. 用 74LS161 做模 12，异步清零的检测码是什么？同步置数的检测码是什么？为什么差 1？
3. 一个 4 位行波计数器的 $t_{pd}=15$ ns，它最快能跑多少？如果想跑 20 MHz，你会怎么改？
4. 555 的多谐振荡器为什么做不出 50% 占空比？真想调到 50% 附近，电路要怎么动？

## 十、时序逻辑怎么设计：从状态图到方程

前面几章讲的计数器、寄存器都是现成的具体电路。可有些时序电路没有对应器件，规律藏在输入序列的历史里，只能自己从头设计。一套通用做法是五步：状态转换图 → 状态表 → 状态化简 → 状态编码 → 次态方程与输出方程，最后落到 D 触发器。全程用一个检测 `1101` 的序列检测器（sequence detector）走一遍，并对照 Verilog 里 `always @(posedge clk)` 的状态机写法。

::: tip 术语，首现即解释
- 状态图（state diagram）：一个圆圈代表一个状态，一根箭头代表一次转移，箭头旁标「输入 / 输出」。它把「去过哪、看到什么、下一步去哪」画成一张图。
- 状态表（state table）：把状态图里所有箭头排成一张表，行是现态、列是输入，格子里写「次态 / 输出」。图和表是同一件事的两种记法。
- 状态编码（state encoding）：给每个状态分配一个二进制码。编码不同，最后化简出的方程会不同，这一步直接决定门电路的复杂程度。
- 次态方程（next-state equation）：把「下一拍去哪」写成布尔函数 $Q^{n+1}=f(Q^n,x)$，它是触发器输入该接什么的依据。
- Mealy 与 Moore 一句话：Mealy 机的输出同时取决于现态与输入，Moore 机的输出只取决于现态，所以同一个功能，Mealy 通常状态更少，Moore 输出更稳（不随输入瞬变）。
:::

第三节的计数器也是个状态机，只是它的规律太规整（加 1、回头），查表就能拼出来。序列检测器不行，它的规律只能一步步把历史切成有限个状态，再逐个状态写方程。

### 10.1 状态转换图：先把「记住多少历史」切成状态

序列检测器的任务是：输入是一根串行线，每个时钟来一位 $x$；当最近若干位恰好是 `1101` 时，输出 $z=1$。允许重叠，`1101101` 里有两个 `1101`（第 1~4 位、第 4~7 位），两个都要报出来。

关键的一问是：为了判断后面几位凑起来是不是 1101，电路需要记住多少历史？答案是记住「当前已经匹配到 1101 的前缀到哪了」。前缀只有四种：

| 已匹配的前缀 | 状态名 | 含义 |
| --- | --- | --- |
| （空） | A | 还没看到任何有用的开头 |
| `1` | B | 看到过一个 1，可能是 1101 的开头 |
| `11` | C | 看到过 11 |
| `110` | D | 看到过 110，再来一个 1 就中 |

于是状态图长这样，箭头旁的 $x/z$ 表示「输入 $x$ 时输出 $z$」：

<FigBox title="1101 检测器的状态转换图（Mealy 型）" kind="结构" note="四个圈是四个状态，箭头旁标注输入与输出。注意 D 到 B 的那根 1/1 箭头：它既输出 1（检测到 1101），又把状态拉回 B，因为末尾的 1 可以当作下一次检测的开头，这就是重叠检测的来源。">

<svg viewBox="0 0 500 320" role="img" aria-label="1101 序列检测器的状态转换图：四个状态 A、B、C、D，箭头标注输入斜杠输出，其中 D 到 B 的 1/1 箭头表示检测到 1101">
<defs>
  <marker id="fsm-a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="fsm-a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="40" y1="36" x2="120" y2="60" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#fsm-a1)" />
  <text x="46" y="32" font-size="10" fill="var(--vp-c-text-3)">复位</text>

  <line x1="144" y1="86" x2="356" y2="86" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="250" y="74" text-anchor="middle" font-size="10.5">1/0</text>
  <line x1="356" y1="108" x2="144" y2="108" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="250" y="122" text-anchor="middle" font-size="10.5">0/0</text>

  <line x1="380" y1="112" x2="380" y2="208" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="394" y="164" font-size="10.5">1/0</text>
  <line x1="356" y1="232" x2="144" y2="232" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="250" y="248" text-anchor="middle" font-size="10.5">0/0</text>

  <line x1="120" y1="208" x2="120" y2="112" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="104" y="164" text-anchor="end" font-size="10.5">0/0</text>

  <path d="M 98 100 C 56 104 56 72 98 76" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="56" y="94" text-anchor="middle" font-size="10.5">0/0</text>
  <path d="M 402 216 C 444 212 444 252 402 248" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-a1)" />
  <text x="454" y="238" text-anchor="middle" font-size="10.5">1/0</text>

  <line x1="141" y1="220" x2="358" y2="101" stroke="#f59e0b" stroke-width="2" marker-end="url(#fsm-a2)" />
  <text x="252" y="166" text-anchor="middle" font-size="11" font-weight="700" fill="#f59e0b">1/1</text>

  <circle cx="120" cy="88" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="120" y="86" text-anchor="middle" font-weight="700" font-size="13">A</text>
  <text x="120" y="101" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">00</text>
  <circle cx="380" cy="88" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="380" y="86" text-anchor="middle" font-weight="700" font-size="13">B</text>
  <text x="380" y="101" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">01</text>
  <circle cx="380" cy="232" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="380" y="230" text-anchor="middle" font-weight="700" font-size="13">C</text>
  <text x="380" y="245" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">11</text>
  <circle cx="120" cy="232" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="120" y="230" text-anchor="middle" font-weight="700" font-size="13">D</text>
  <text x="120" y="245" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">10</text>

  <text x="120" y="288" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">A=空，B=已见 1</text>
  <text x="380" y="288" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">C=已见 11，D=已见 110</text>
</g>
</svg>

</FigBox>

读这张图只有两条规则：在哪个状态、看到什么输入，就沿对应箭头走到下一个状态，并输出箭头旁那个值。比如在 D，来一个 0，沿 `0/0` 回 A（`1100` 的结尾是 0，前缀清零）；来一个 1，沿 `1/1` 去 B 并输出 1（`1101` 命中）。重叠就藏在 D 那根 `1/1` 指向 B 这件事上：检测完不归零，带着末尾那个 1 继续。

### 10.2 状态表与状态化简：拍平成表，看有没有能合并的

状态图好读，但不好算。把它每根箭头抄进表格，就是状态表：

| 现态 | 符号（含义） | $x=0$：次态/输出 | $x=1$：次态/输出 |
| --- | --- | --- | --- |
| 00 | A（空） | 00 / 0 | 01 / 0 |
| 01 | B（已见 `1`） | 00 / 0 | 11 / 0 |
| 11 | C（已见 `11`） | 10 / 0 | 11 / 0 |
| 10 | D（已见 `110`） | 00 / 0 | 01 / 1 |

状态化简问的是：有没有两个状态行为完全一样、可以合并成一个？判据是：两个状态等价，当且仅当对任意输入，它们给出相同输出、并且去到的次态也等价。这个「任意输入」要一直追问下去，因为等价是递归定义的。

对上面四个状态逐个试：

| 状态对 | 区分输入 | 两状态各自的输出 |
| --- | --- | --- |
| A 与 D、B 与 D、C 与 D | `1` | 前者出 0，D 出 1 |
| B 与 C | `01` | B 出 `00`，C 出 `01` |
| A 与 B、A 与 C | `101` | A 出 `000`，对方出 `001` |

六个状态对全都能找到区分序列，所以四个状态两两不等价，已经是最简，没有可合并的。

一句话记结论：状态化简就是找区分序列，找不到区分序列的两个状态才能合并。这个例子恰好没有冗余，但方法本身必须会，现实里随手画的状态图常有两个状态本来就是一回事。

### 10.3 状态编码与次态方程：给状态编号，写出布尔式

下一步给四个状态分配二进制码。两个触发器能表示 4 个状态，就用 $Q_1Q_0$ 两位。编码不是唯一的，这里故意选格雷码 A=00、B=01、C=11、D=10：沿「前缀越来越长」的那条主链，相邻状态的编码只差一位。选它是为了让方程特别简单，这就是状态编码的全部意义：

$$
Q_0^{n+1}=x, \qquad Q_1^{n+1}=Q_0\,(Q_1+x), \qquad z=Q_1\,\bar Q_0\,x
$$

怎么读这三个式子：

- $Q_0^{n+1}=x$：$Q_0$ 永远跟着输入走，它记的就是上一个输入位。所以 $x=1$ 时下一拍 $Q_0=1$（去 B 或 C），$x=0$ 时下一拍 $Q_0=0$（去 A 或 D）。
- $Q_1^{n+1}=Q_0(Q_1+x)$：只有「上一拍是 1（$Q_0=1$）且（已经在 11 里，或这拍又来了 1）」时，$Q_1$ 才置 1；其余时候清 0。对照状态图：进 C（11）的只有「B 收到 1」与「C 收到 1」两条路，正好被这个式子覆盖。
- $z=Q_1\bar Q_0 x$：输出 1 当且仅当现态是 D（$Q_1=1,Q_0=0$）且输入是 1，也就是 `110` 后面紧跟一个 1。

用 node 把 8 个（状态，输入）组合全部代一遍，方程与状态表逐格一致 ✓（输入 `1101101` 应输出 `0001001`，两次命中 ✓）。

### 10.4 D 触发器实现：方程就是接线图

有了次态方程，搭电路就是机械操作：每个触发器一个，$D$ 端接它的次态方程。D 触发器的特性是 $Q^{n+1}=D$（见 [05 · 触发器](./flip-flops.md)），所以 $D_0=Q_0^{n+1}$、$D_1=Q_1^{n+1}$：

<FigBox title="1101 检测器：两个 D 触发器加三个门" kind="结构" note="D₀ 直接接 x；D₁ 接「Q₀ 与（Q₁ 或 x）」，对应 Q₁⁺¹ = Q₀(Q₁+x)；输出 z 是三输入的与（Q₁、Q̄₀、x）。两个触发器共用同一路 CLK。">

<svg viewBox="0 0 560 300" role="img" aria-label="1101 检测器的 D 触发器实现：输入 x 接 FF0 的 D0，Q0 与「Q1 或 x」的与接 FF1 的 D1，Q1、反相 Q0 与 x 送进三输入与门给出 z">
<defs>
  <marker id="fsm-c1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="fsm-c2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="14" y="50" font-size="10" fill="var(--vp-c-text-3)">x（串行输入）</text>
  <line x1="8" y1="60" x2="96" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-c1)" />
  <circle cx="8" cy="60" r="2.6" fill="var(--vp-c-brand-1)" />
  <line x1="8" y1="20" x2="8" y2="118" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="8" y1="118" x2="250" y2="118" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#fsm-c1)" />
  <path d="M 8 20 L 476 20 L 476 80" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#fsm-c2)" />

  <rect x="96" y="40" width="86" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="139" y="58" text-anchor="middle" font-size="10.5">FF₀</text>
  <text x="139" y="72" text-anchor="middle" font-size="8" fill="var(--vp-c-text-3)">Q₀⁺¹ = x</text>
  <path d="M 96 70 L 96 78 L 104 74 z" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="64" y1="74" x2="96" y2="74" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="40" y="86" font-size="8.5" fill="var(--vp-c-text-3)">CLK</text>

  <path d="M 182 60 L 353 60 L 353 110" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#fsm-c1)" />
  <text x="190" y="52" font-size="9.5" fill="var(--vp-c-brand-1)">Q₀</text>
  <circle cx="353" cy="100" r="2.6" fill="var(--vp-c-brand-1)" />
  <line x1="353" y1="100" x2="452" y2="100" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <circle cx="456" cy="100" r="3.4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.1" />
  <text x="400" y="92" font-size="9" fill="var(--vp-c-text-3)">Q̄₀</text>

  <rect x="250" y="110" width="46" height="32" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="273" y="130" text-anchor="middle" font-size="9.5">或</text>
  <rect x="330" y="110" width="46" height="32" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="353" y="130" text-anchor="middle" font-size="9.5">与</text>
  <line x1="296" y1="126" x2="330" y2="126" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#fsm-c1)" />

  <line x1="376" y1="126" x2="376" y2="200" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#fsm-c1)" />
  <text x="384" y="166" font-size="9" fill="var(--vp-c-brand-1)">D₁ = Q₀(Q₁+x)</text>

  <rect x="330" y="200" width="86" height="40" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="373" y="218" text-anchor="middle" font-size="10.5">FF₁</text>
  <text x="373" y="232" text-anchor="middle" font-size="8" fill="var(--vp-c-text-3)">Q₁⁺¹ = Q₀(Q₁+x)</text>
  <path d="M 330 228 L 330 236 L 338 232 z" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="300" y1="232" x2="330" y2="232" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="294" y="226" font-size="8.5" fill="var(--vp-c-text-3)">CLK</text>

  <line x1="416" y1="224" x2="440" y2="224" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="420" y="216" font-size="9.5" fill="var(--vp-c-brand-1)">Q₁</text>
  <path d="M 440 224 L 440 270 L 273 270 L 273 142" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#fsm-c1)" />
  <path d="M 440 224 L 508 224 L 508 172" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#fsm-c1)" />
  <circle cx="440" cy="224" r="2.6" fill="var(--vp-c-brand-1)" />

  <rect x="460" y="80" width="64" height="92" rx="6" fill="var(--vp-c-bg-soft)" stroke="#f59e0b" stroke-width="1.4" />
  <text x="492" y="130" text-anchor="middle" font-size="9.5" fill="#f59e0b">与</text>
  <text x="492" y="146" text-anchor="middle" font-size="8" fill="#f59e0b">3 输入</text>
  <line x1="524" y1="126" x2="546" y2="126" stroke="#f59e0b" stroke-width="1.6" marker-end="url(#fsm-c2)" />
  <text x="532" y="120" font-size="11" fill="#f59e0b">z</text>
  <text x="388" y="36" font-size="9" fill="#f59e0b">z = Q₁·Q̄₀·x</text>
</g>
</svg>

</FigBox>

这张图把「方程到电路」的映射一次说清：次态方程就是 $D$ 端的接线，$Q^{n+1}=D$ 让这一步没有任何推导，直接抄。数一下代价：2 个触发器加 1 个或门、2 个与门（其中一个三输入）。比买现成计数器多几个门，换来的是「任意规律都能实现」的自由，这也是从用现成计数器走向自己设计时序电路的分界。

### 10.5 对照 Verilog：同一个状态机，两种写法

纸上的状态图、状态表、次态方程，在 [09 · Verilog 与 FPGA](./09-verilog-fpga.md) 里对应 `always @(posedge clk)` 状态机的两种写法。先看行为级：直接按状态表写 `case`，让综合工具替你去算次态方程：

```verilog
// 1101 序列检测器（重叠，Mealy 型），与上面的状态表一一对应
module det1101 (
    input  wire clk, rst_n, x,
    output reg  z
);
    localparam A = 2'd0, B = 2'd1, C = 2'd3, D = 2'd2; // 00 / 01 / 11 / 10
    reg [1:0] state;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) state <= A;
        else begin
            case (state)
                A: state <= x ? B : A;
                B: state <= x ? C : A;
                C: state <= x ? C : D;
                D: state <= x ? B : A;
            endcase
        end
    end

    // Mealy 输出：组合逻辑，随现态和输入即时更新（对应 z = Q1·Q̄0·x）
    always @(*) z = (state == D) && x;
endmodule
```

再看结构级：把上面化简出的方程直接写出来，和 $Q_0^{n+1}=x$、$Q_1^{n+1}=Q_0(Q_1+x)$、$z=Q_1\bar Q_0x$ 一字不差：

```verilog
always @(posedge clk or negedge rst_n) begin
    if (!rst_n) {Q1, Q0} <= 2'd0;
    else begin
        Q0 <= x;
        Q1 <= Q0 & (Q1 | x);
    end
end
assign z = Q1 & ~Q0 & x;
```

对照能看出三件事：

1. `state <= ...` 那一句就是状态表的每一行，`case` 的分支数等于状态数，`state` 这个两位寄存器就是纸上的两个 D 触发器。纸上的状态化简、编码、化简次态方程，Verilog 里全交给综合工具，你要管的只剩「把状态切对」。
2. Mealy 输出必须放在 `always @(*)` 组合块里（或用 `assign`），因为它取决于现态和输入；如果把它也写进 `always @(posedge clk)`，输出会晚一拍、变成 Moore 机的行为。这是纸面设计里最容易漏的一处。
3. 复位分支不可省：纸上画状态图默认有个「上电进 A」，代码里就是 `if (!rst_n) state <= A`。少写这一句，上电后状态未知，检测器可能从 C 或 D 出发，永远检测不到 `1101` 的开头。

从想法到状态图，再到方程、电路、代码，整条链到这里走通了。下面两道例题再各练一遍，第二道顺便把 Moore 机的差别落地。

### 10.6 再练两道

::: tip 例 1 · 检测 101 的 Mealy 机 {#ex-fsm-1}
题目：设计一个重叠检测 `101` 的 Mealy 型序列检测器，画出状态图，写出状态表与次态/输出方程，并给出 D 触发器实现。

先想什么：和 1101 完全同一套动作，只是前缀从四种变成三种。重叠检测意味着检测完后要带着末尾的 `1` 继续，而不是归零。

步骤：

1. 切状态：前缀只有「空、`1`、`10`」三种，对应 A、B、C 三个状态。
2. 状态图（箭头旁 $x/z$）：

<FigBox title="101 检测器（Mealy）状态图" kind="结构" note="三个状态。C 收到 1 时输出 1 并回到 B，末尾的 1 保留下来，实现重叠；C 收到 0 时回 A，因为 100 的结尾是 0，前缀清零。">

<svg viewBox="0 0 480 300" role="img" aria-label="101 序列检测器状态图：三个状态 A、B、C，C 收到 1 输出 1 并回到 B">
<defs>
  <marker id="fsm-d1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="fsm-d2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="120" y1="44" x2="120" y2="64" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#fsm-d1)" />
  <text x="126" y="56" font-size="10" fill="var(--vp-c-text-3)">复位</text>

  <line x1="144" y1="86" x2="356" y2="86" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-d1)" />
  <text x="250" y="74" text-anchor="middle" font-size="10.5">1/0</text>

  <path d="M 98 98 C 56 102 56 70 98 74" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-d1)" />
  <text x="52" y="92" text-anchor="middle" font-size="10.5">0/0</text>
  <path d="M 402 98 C 444 102 444 70 402 74" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-d1)" />
  <text x="456" y="92" text-anchor="middle" font-size="10.5">1/0</text>

  <path d="M 372 110 C 424 164 340 236 166 236" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-d1)" />
  <text x="414" y="182" text-anchor="middle" font-size="10.5">0/0</text>

  <line x1="127" y1="216" x2="135" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-d1)" />
  <text x="176" y="186" text-anchor="middle" font-size="10.5">0/0</text>

  <path d="M 158 220 C 214 190 300 130 364 106" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#fsm-d2)" />
  <text x="276" y="172" text-anchor="middle" font-size="11" font-weight="700" fill="#f59e0b">1/1</text>

  <circle cx="120" cy="90" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="120" y="88" text-anchor="middle" font-weight="700" font-size="13">A</text>
  <text x="120" y="103" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">00</text>
  <circle cx="380" cy="90" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="380" y="88" text-anchor="middle" font-weight="700" font-size="13">B</text>
  <text x="380" y="103" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">01</text>
  <circle cx="140" cy="238" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="140" y="236" text-anchor="middle" font-weight="700" font-size="13">C</text>
  <text x="140" y="251" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">10</text>

  <text x="120" y="288" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">A=空，B=已见 1，C=已见 10</text>
</g>
</svg>

</FigBox>

3. 状态表（编码 A=00、B=01、C=10，`11` 是未用态）：

| 现态 | 含义 | $x=0$ | $x=1$ |
| --- | --- | --- | --- |
| 00 | A（空） | 00 / 0 | 01 / 0 |
| 01 | B（已见 `1`） | 10 / 0 | 01 / 0 |
| 10 | C（已见 `10`） | 00 / 0 | 01 / 1 |

4. 次态方程与输出方程（用 node 对 8 个组合逐格核过 ✓）：

$$
Q_1^{n+1}=\bar Q_1\,Q_0\,\bar x, \qquad Q_0^{n+1}=x\,\overline{Q_1Q_0}, \qquad z=Q_1\,\bar Q_0\,x
$$

$Q_0^{n+1}=x\,\overline{Q_1Q_0}$ 读作「$x=1$ 且现态不是 `11` 时 $Q_0$ 才置 1」。未用态 `11` 无论输入什么，下一拍都回 `00`（代入两个方程：$Q_1^{n+1}=0\cdot1\cdot\bar x=0$，$Q_0^{n+1}=x\cdot0=0$），所以不会卡死在未用态上。

5. D 触发器实现：$D_0=x\,\overline{Q_1Q_0}$，$D_1=\bar Q_1 Q_0 \bar x$，$z=Q_1\bar Q_0 x$，两个 D 触发器加一个或门、一个与门、一个反相器（$Q_0^{n+1}$ 里的 $\bar x$），再加一个输出与门。

验算：输入 `10101`（重叠），按状态图走 A→B→C→B→C→B，输出 `00101`，两次命中 ✓。再验未用态：`11` 收到 0 → `00`、收到 1 → `00`，能自启动 ✓。
:::

::: tip 例 2 · 检测 1101 的 Moore 机 {#ex-fsm-2}
题目：把 1101 检测器改写成 Moore 型，说明它比 Mealy 型多用了什么、换来什么。

先想什么：Moore 的输出只能挂在状态上，所以「检测到 1101」这个事实必须单独成为一个状态 E，输出 $z=1$ 只在这个状态有效。这正是 Moore 与 Mealy 的根本差别：输出是状态的函数，而不是状态加输入的函数。

状态图（E 是命中态，输出 1；箭头旁只标输入）：

<FigBox title="1101 检测器（Moore）状态图：多一个命中态 E" kind="结构" note="与 Mealy 相比多了一个状态 E（已命中 1101）。E 里的输出是 1；E 收到 0 回 A，收到 1 去 C（11011 的结尾是 11，保留重叠）。输出只写在状态圈里，不再写在箭头上。">

<svg viewBox="0 0 560 320" role="img" aria-label="1101 检测器的 Moore 型状态图：五个状态 A 到 E，输出只标注在状态圈内，命中态 E 输出 1">
<defs>
  <marker id="fsm-e1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="fsm-e2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="16" y1="150" x2="46" y2="150" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#fsm-e1)" />
  <text x="20" y="142" font-size="10" fill="var(--vp-c-text-3)">复位</text>

  <line x1="94" y1="142" x2="156" y2="142" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="125" y="132" text-anchor="middle" font-size="10.5">1</text>
  <line x1="156" y1="164" x2="94" y2="164" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="125" y="178" text-anchor="middle" font-size="10.5">0</text>

  <line x1="204" y1="142" x2="266" y2="142" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="235" y="132" text-anchor="middle" font-size="10.5">1</text>
  <line x1="314" y1="142" x2="376" y2="142" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="345" y="132" text-anchor="middle" font-size="10.5">0</text>
  <line x1="424" y1="142" x2="486" y2="142" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="455" y="132" text-anchor="middle" font-size="10.5">1</text>

  <path d="M 276 132 C 266 104 314 100 304 128" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="288" y="104" text-anchor="middle" font-size="10.5">1</text>
  <path d="M 87 133 C 96 104 44 104 53 133" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="70" y="100" text-anchor="middle" font-size="10.5">0</text>

  <path d="M 400 174 C 310 248 160 248 70 174" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="235" y="242" text-anchor="middle" font-size="10.5">0</text>

  <path d="M 510 126 C 430 62 360 62 290 126" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="400" y="76" text-anchor="middle" font-size="10.5">1</text>

  <path d="M 492 172 C 430 296 150 296 62 170" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#fsm-e1)" />
  <text x="260" y="296" text-anchor="middle" font-size="10.5">0</text>

  <circle cx="70" cy="150" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="70" y="146" text-anchor="middle" font-weight="700" font-size="13">A</text>
  <text x="70" y="162" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">z=0</text>
  <circle cx="180" cy="150" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="180" y="146" text-anchor="middle" font-weight="700" font-size="13">B</text>
  <text x="180" y="162" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">z=0</text>
  <circle cx="290" cy="150" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="290" y="146" text-anchor="middle" font-weight="700" font-size="13">C</text>
  <text x="290" y="162" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">z=0</text>
  <circle cx="400" cy="150" r="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="400" y="146" text-anchor="middle" font-weight="700" font-size="13">D</text>
  <text x="400" y="162" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">z=0</text>
  <circle cx="510" cy="150" r="24" fill="var(--vp-c-bg-soft)" stroke="#f59e0b" stroke-width="1.8" />
  <text x="510" y="144" text-anchor="middle" font-weight="700" font-size="13" fill="#f59e0b">E</text>
  <text x="510" y="160" text-anchor="middle" font-size="9.5" fill="#f59e0b">z=1</text>

  <text x="280" y="312" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">箭头旁只标输入；输出写在圈里（Moore 的约定）</text>
</g>
</svg>

</FigBox>

对比：Mealy 型 4 个状态、2 个触发器，输出 $z=Q_1\bar Q_0 x$ 是组合函数，输入 $x$ 一变，$z$ 可能立刻跳一下（有毛刺，但只持续到下一拍）；Moore 型 5 个状态、3 个触发器，输出只认状态 E，只要状态稳定，$z$ 就稳定，代价是多一个触发器、输出晚一拍。一句话取舍：能接受输出早一拍且不介意毛刺，用 Mealy（省状态）；要输出干净，用 Moore（多状态）。

验算：输入 `1101101`，Moore 输出（按状态）是 `00001001`，两次命中 ✓；比 Mealy 的 `0001001` 晚一个时钟周期，因为命中要先进 E 状态才反映到输出上。
:::

说到这儿，这套设计法和前面的计数器不是两套东西。计数器是规律已经写死的状态机，这里的是规律要你自己画出来的状态机；前者查表拼器件，后者画图写方程，最后殊途同归到 D 触发器（或 `always @(posedge clk)`）上。

## 下一步

数字电路的骨干到这里齐了：门、组合逻辑、触发器、计数器与寄存器。你手上有一套能用门和触发器搭出任意功能的工具。可真实芯片不是这么设计的，没有人手工画几十万个门。下一章换个视角，用编程语言描述电路，让工具替你去优化、布线、验证。

<Prereq id="clock-tree" /> → [09 · 硬件描述语言与 FPGA](./09-verilog-fpga.md)
