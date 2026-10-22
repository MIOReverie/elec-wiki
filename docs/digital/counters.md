---
title: 06 · 计数器与寄存器
description: 模 N 计数器与「模」的含义、异步行波与同步计数器的结构与频率上限、用 74LS161 的清零法与置数法拼任意进制、寄存器与移位寄存器的串并转换、555 定时器的两个公式；配六张图与五道例题。
---

# 06 · 计数器与寄存器

<Meta time="50 min" level="核心" note="三个坑最深：清零法接 N 而置数法接 N−1；异步计数器忘了累积延迟；555 公式里漏掉 2R₂" />

**这一页要解决什么**：上一页给了你单个触发器，它能存一位、能二分频。这一页把触发器成组用起来，解决两件事：**怎样按节拍数数**（计数器），以及**怎样按节拍搬一串数据**（寄存器与移位寄存器）。读完你应该能：说清「模 N」到底指什么、判断一个计数器是同步还是异步以及它最快能跑多快、用一片 74LS161 加一个门拼出任意进制的计数器并算对检测码、画出移位寄存器的串并转换过程、以及用 555 算出方波频率和单稳脉宽。

::: tip 读这页之前
- **需要会**：触发器的特性方程与边沿触发（[05 · 触发器](./flip-flops.md)）、建立时间与最高频率的算法（<Prereq id="setup-hold" />）、组合逻辑里「用与非门收若干根线」的做法（[04 · 组合逻辑电路](./combinational.md)）。
- **这一页用到的符号**：$Q_3Q_2Q_1Q_0$ 是四位输出，合起来表示一个 4 位二进制数（$Q_3$ 是最高位）；**模**记作 $N$ 或「模 $N$」，指一个循环里有几个状态；$\bar R_D$ 是**异步清零端**（横杠表示低电平有效，$D$ 表示作用于 D 触发器）；$\bar{LD}$ 是**同步置数端**（装载，load）；$f$、$T$ 是频率与周期；$t_{pd}$ 是单级传输延迟。全部约定见[符号与约定](../guide/notation.md)。
- **两个词先给一句话**：**计数器**（counter）是「每来一个时钟，输出按固定规律变一次」的电路，最简单的规律就是数数；**寄存器**（register）是「一组共用一个时钟的触发器」，作用是在沿上同时存下一个字。
- **会用到一点对数**：判断需要几位触发器时用 $\lceil\log_2 N\rceil$（向上取整），例如 $N=10$ 需要 4 位（因为 $2^3=8<10\le16=2^4$）。
:::

先看一个真实的麻烦。你要给一块板子做一个 1 秒的节拍：拿一个 32.768 kHz 的晶振，希望每 32768 个脉冲输出一次。最自然的做法是把触发器一级级接起来分频——一级除 2、两级除 4、十五级除 32768。可 32.768 kHz 不是 2 的整数次幂乘出来的整数关系吗？恰好是：$32768=2^{15}$，所以十五级刚好。

再换一个：你要一个 0~59 的秒计数（六十进制）。这就不是 2 的幂了——再怎么级联二分频也拼不出 60。于是必须换一种做法：**让它数到 60 就自己归零**。

两件事问的是同一个问题：**一个计数器凭什么知道「该归零了」，以及它归零的那一瞬间会不会出问题**。这一页的核心就是这两个问题，外加一个绕不开的邻居——555 定时器，很多板子的第一个时钟就是它给的。

## 结论先行

1. **模 $N$** 指一个循环里的状态数：模 6 就是 0→1→2→3→4→5→0，共 6 个状态。$N$ 不必须是 2 的幂，所以「任意进制」是计数器的常规需求而不是特例。
2. 计数器分两类：**异步**（低位输出直接当高位的时钟，一位一位波浪式翻）与**同步**（所有位共用一个时钟，靠组合逻辑同时算出各自次态）。前者简单但慢，后者快但要额外进位逻辑。
3. 任意模 $N$ 有两个做法：**清零法**（数到 $N$ 的瞬间强制清 0，检测码是 $N$）与**置数法**（数到 $N-1$ 时准备好，下一个沿装回 0，检测码是 $N-1$）。两者差 1，混淆必错。
4. **寄存器**是并排的 D 触发器，一拍存一个字；**移位寄存器**让数据在触发器之间串行流动，从而完成串行↔并行的转换。
5. **555 定时器**靠一个电容在 $1/3V_{CC}$ 与 $2/3V_{CC}$ 之间来回充放电产生方波，$f\approx\dfrac{1.43}{(R_1+2R_2)C}$；接成单稳态时输出定宽脉冲 $t_W\approx1.1RC$。

::: tip 一句话抓住本质
计数器 = **一个会自己回头的状态机**。所有「任意进制」的技巧，本质都是同一招：**在某个特定状态上产生一个控制信号，把状态强行拉回起点**。想清楚「在哪个状态拉、这个信号是立刻生效还是要等时钟」，这页就没有难点了。
:::

## 一、模 N：一个计数器的全部信息就是「循环长度」

这一节把「模」这个字定义清楚，并说清它决定了什么。

**模**（modulus，记作 $N$ 或写作「模 $N$」）就是一个循环里经过的状态数。模 6 的计数器输出序列是 $0,1,2,3,4,5,0,1,\dots$，一共 6 个状态；模 10 就是 $0\sim9$ 十个状态。二进制计数器（$0,1,2,\dots,2^n-1$ 再回 0）只是模 $N=2^n$ 的特例。

<FigBox title="模 6：六个状态围成一圈" kind="结构" note="每个时钟沿往前走一格，走满一圈回到起点。三个触发器能表示 8 个状态，模 6 只用了其中 6 个 —— 剩下那两个状态必须保证永远不会被走进去，否则计数器会跑飞。">

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

三个数必须分清，混了就全错：

| 量 | 意思 | 模 6 的例子 |
| --- | --- | --- |
| 模 $N$ | 一个循环的状态数 | $N=6$ |
| 触发器位数 $n$ | 能表示多少状态，取 $\lceil\log_2 N\rceil$ | 3 位（能表示 8 个状态） |
| 空闲状态 | $2^n-N$ 个用不到的编码 | 6、7 两个 |

空闲状态是「任意进制」最容易出事的地方。异步清零的电路如果上电时恰好落进状态 6 或 7，它可能永远出不来（因为清零条件只在「等于 $N$」时成立，而 6 或 7 的编码可能永远不再出现）——这称为**不能自启动**。工程上要么选能自启动的接法，要么上电时用复位强制进入有效状态。这个问题在第三节还会再提。

知道了「模」是什么意思，下一个问题是结构上的：这些触发器怎么接？是让低位去触发高位，还是大家共用一个时钟？这个选择直接决定了速度上限。

## 二、异步与同步：差别在「谁去触发谁」

这一节只回答一个问题：两种接法的电路差在哪，代价分别是什么。

**异步计数器**（也叫**行波计数器**，ripple counter）的接法极其省事：把前一级的输出 $Q$ 直接接到后一级的时钟端。后一级就「跟着」前一级的翻转而翻转，像波浪一样从低位传到高位。

**同步计数器**的接法相反：所有触发器的时钟端并联，接同一个时钟；每一位该不该翻转，由组合逻辑根据「当前所有位的值」算出来，在同一个沿上一起翻。

<FigBox title="两种接法：一位传一位，还是一起动" kind="结构" note="上：行波结构，Q₀ 就是 Q₁ 的时钟，Q₁ 就是 Q₂ 的时钟 —— 延迟一级级累加。下：同步结构，四位的时钟并联在同一根线上，各输入由组合逻辑同时给出 —— 只有两级延迟（触发器 + 一次组合逻辑），与位数基本无关。">

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
  <text x="138" y="60" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q₀</text>
  <text x="244" y="60" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q₁</text>
  <text x="350" y="60" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q₂</text>
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

这个差别直接变成频率上限的差别。异步计数器里，最高位要等前面所有位都翻完：$n$ 位串起来，最坏路径就是 $n$ 倍的 $t_{pd}$。同步计数器里，一条时钟沿同时到达所有触发器，最坏路径只有「触发器延迟 + 一级进位逻辑」。

用波形看更直观。下面这张图里，CLK 是时钟，$Q_1$、$Q_2$ 是低两位的输出，进位 $C$ 只在「前两位都是 1」时才有效：

<FigBox title="二进制计数器的时序：每一位的频率都是前一位的一半" kind="波形" note="Q₁ 每个时钟周期翻一次，Q₂ 每两个周期翻一次，再往上每四个 —— 频率逐级对半，所以计数器天生就是分频器。进位 C 的宽度只有一个时钟周期，它标出「这一拍之后要往高一位进」。">

<WavePreset kind="logic" />
</FigBox>

看清两件事。**第一**，$Q$ 的频率逐级减半，所以「4 位二进制计数器」同时就是一个 16 分频器——上一章例 3 讲的级联分频，在结构上就是这同一件事。**第二**，进位信号的脉冲很窄（只有一个周期），这也是为什么同步计数器要用组合逻辑预先算好进位，而不能「等前一位翻完再说」。

异步结构的延迟代价，下一节会用具体数字算一遍；而真正决定数字电路速度的，是同步结构的时钟周期预算（上一章第四节）。这里要先解决一个更实际的问题：模不是 2 的幂时，怎么让它乖乖回头。

## 三、任意模 N：清零法与置数法

这一节给出用集成计数器拼任意进制的两种标准做法，并说清那个「差 1」的坑。

集成计数器 **74LS161** 是这事的标准件：4 位**同步**二进制计数器（模 16），带四个额外引脚：

| 引脚 | 名字 | 作用 | 生效时机 |
| --- | --- | --- | --- |
| $\overline{R_D}$ | 异步清零 | 强制 $Q_3Q_2Q_1Q_0=0000$ | **立刻**，不等时钟 |
| $\overline{LD}$ | 同步置数 | 把 $D_3D_2D_1D_0$ 装进输出 | **下一个时钟沿** |
| $CT_P$、$CT_T$ | 计数使能 | 两个都有效时才计数 | 时钟沿 |
| $CO$ | 进位输出 | 计到 15 时给出高电平 | 组合输出 |

注意前两行的区别，这就是整个第三节的要害：**清零是「立刻」，置数是「等下一个沿」**。这一个时间差，导致两者的检测码差 1。

**做法一：异步清零法**。让它自然数，数到 $N$ 出现的那一瞬间，用清零端把它拉回 0。所以检测码就是 $N$ 本身。

**做法二：同步置数法**。所有 $D_i$ 接地，数到 $N-1$ 时让置数端有效；因为置数要等下一个沿，所以下一个沿到来时它从 $N-1$ 直接跳到 0——于是循环是 $0\sim N-1$，正好 $N$ 个状态。检测码是 $N-1$。

<FigBox title="同一个模 6，两种做法的检测码差 1" kind="时序" note="上面是状态序列：数到 5 之后再走一步就是 6。异步清零在「6 一闪现」的瞬间就把它打回 0（检测码 6 = 0110）；同步置数在「5 出现时」就准备好，等下一个沿才装 0（检测码 5 = 0101）。">

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

一张表把常见模数一次列完（都按 74LS161 的接法）：

| 目标 | 需要的位 | 异步清零检测码 | 同步置数检测码 |
| --- | --- | --- | --- |
| 模 6（$N=6$） | 3 位 | `0110` = 6 | `0101` = 5 |
| 模 10（十进制） | 4 位 | `1010` = 10 | `1001` = 9 |
| 模 12（十二进制） | 4 位 | `1100` = 12 | `1011` = 11 |

注意模 6 用 3 位就够、模 10 和模 12 都要 4 位——这就是第一节那个 $\lceil\log_2 N\rceil$ 的应用。另外注意模 10 的清零检测码 `1010`，它的两个 1 出现在 $Q_3$ 和 $Q_1$ 上，所以「$Q_3Q_1$ 同时为 1」就是检测条件，一个与非门足够。

异步清零有个副作用值得记住：$N$ 那个状态会**极短暂地出现在输出上**（图里那个一闪即消的尖峰）。多数场合无害，但如果输出还接着译码器或比较器，那个尖峰可能被当成一个有效状态——这时应该改用同步置数法，它的输出序列干净，从不出现 $N$。

两种做法各有取舍，工程上还有第三个选择：直接买一个模数正好对得上的成品（如 74LS160 是十进制、74LS162 是十进制同步清零）。能用现成的就用现成的，这是个成本问题而不是智商问题。下一节换个方向：从「数数」转到「搬数据」。

## 四、寄存器与移位寄存器

这一节讲两种「存」的用法：整体存一个字，以及一位一位地搬。

**寄存器**（register）最简单的形态就是上一章例 2 说的那个：几个 D 触发器并排，共用一个时钟，一个沿存下一个字。加一个「输入选择」就可以做成**双向**的：要么装外部数据（并行输入），要么保持不动。

**移位寄存器**（shift register）把触发器串起来：每一个的输出接下一个的输入，所有触发器共用一个时钟。于是每来一个沿，整个内容整体右移一格，新的那一位从最左边挤进来。

<FigBox title="串行进、并行出：四个沿把 1011 装满" kind="结构" note="上面是四级移位寄存器，串行输入只占一根线。下面是四个时钟拍的过程：初态 0000，每拍移一格并送入一位，四拍之后并行输出端正好是 1011。这就是「串并转换」——串口通信、ADC 采样、LED 驱动芯片都靠它。">

<svg viewBox="0 0 480 300" role="img" aria-label="四级移位寄存器结构，以及四个时钟拍把串行数据 1011 移入并在并行输出端得到 1011 的过程">
<defs>
  <marker id="ct-s1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="6" y="60" font-size="10" fill="var(--vp-c-text-3)">串入</text>
  <line x1="40" y1="56" x2="62" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ct-s1)" />
  <rect x="64" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="97" y="62" text-anchor="middle" font-size="10.5">FF₃</text>
  <rect x="164" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="197" y="62" text-anchor="middle" font-size="10.5">FF₂</text>
  <rect x="264" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="297" y="62" text-anchor="middle" font-size="10.5">FF₁</text>
  <rect x="364" y="38" width="66" height="38" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="397" y="62" text-anchor="middle" font-size="10.5">FF₀</text>

  <line x1="130" y1="56" x2="160" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ct-s1)" />
  <line x1="230" y1="56" x2="260" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ct-s1)" />
  <line x1="330" y1="56" x2="360" y2="56" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ct-s1)" />

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
  <polyline points="44,216 74,216 74,196 104,196 104,216 134,216 134,196 164,196 164,216 194,216 194,196 224,196 224,216 284,216" fill="none" stroke="#f59e0b" stroke-width="2" />
  <text x="89" y="192" font-size="9.5" fill="#f59e0b" text-anchor="middle">1</text>
  <text x="149" y="192" font-size="9.5" fill="#f59e0b" text-anchor="middle">0</text>
  <text x="209" y="192" font-size="9.5" fill="#f59e0b" text-anchor="middle">1</text>
  <text x="239" y="192" font-size="9.5" fill="#f59e0b" text-anchor="middle">1</text>

  <text x="14" y="250" fill="var(--vp-c-text-3)">内容</text>
  <text x="86" y="250" font-size="10.5">0000</text>
  <text x="146" y="250" font-size="10.5">0001</text>
  <text x="206" y="250" font-size="10.5">0010</text>
  <text x="266" y="250" font-size="10.5">0101</text>
  <text x="326" y="250" font-size="10.5" fill="var(--vp-c-brand-1)">1011</text>
  <text x="386" y="250" font-size="9.5" fill="var(--vp-c-text-3)">四拍装满</text>
  <text x="44" y="276" font-size="10" fill="var(--vp-c-text-3)">每拍：整体右移一格，最左位让给新来的串行数据</text>
  <text x="44" y="294" font-size="10" fill="var(--vp-c-brand-1)">四拍 = 4 个数据位，所以四位移位寄存器要 4 个时钟周期完成一次串并转换</text>
</g>
</svg>

</FigBox>

移位寄存器有三种常见形态，区别只在「从两头进还是从一头上」：

| 形态 | 数据流向 | 典型用途 |
| --- | --- | --- |
| 串入串出（SISO） | 一端进、一端出 | 延时线，多拍延迟 |
| 串入并出（SIPO） | 一端进，全体一起出 | 串口收数据（UART 接收）、74HC595 驱动数码管 |
| 并入串出（PISO） | 全体一起进，一端出 | 串口发数据（UART 发送）、把并行数据转成串行 |

还有**双向移位寄存器**（如 74LS194），可以左移也可以右移，靠两个控制端选择方向。**移位**这件事在硬件里就是「接线方式」：左移是把每个输出接到左边邻居的输入，右移是接到右边邻居——所以方向切换只需要多一层选择器。

到这里，「数」和「存」这两件事都有了。剩下最后一块拼图：这个时钟本身从哪来？很多板子的第一个时钟源不是晶振，而是那颗八条腿的 **555**。下一节解释它为什么能产生稳定的方波。

## 五、555 定时器：一个模拟电路怎么变成时钟源

这一节只回答两个问题：555 凭什么自己振荡，以及那两个常用公式从哪来。

555 是个「模数混血」的器件：内部是模拟的比较器和分压电阻，输出却是干净的数字电平。核心结构只有三样东西：**三个 5 kΩ 电阻**（555 这个名字就是从这来的）串在 $V_{CC}$ 与地之间，得到 $2/3V_{CC}$ 和 $1/3V_{CC}$ 两个参考电平；**两个比较器**分别盯着「阈值电压 TH 是否超过 $2/3V_{CC}$」和「触发电压 TR 是否低于 $1/3V_{CC}$」；**一个 RS 触发器**把比较结果变成输出，并且控制一个**放电管**（DIS 引脚）。

接成**多谐振荡器**（astable multivibrator，就是「自己一直振荡」）时，外面只加两个电阻一个电容：电容通过 $R_1$ 和 $R_2$ 从 $V_{CC}$ 充电，充到 $2/3V_{CC}$ 时上比较器翻转，放电管导通，电容通过 $R_2$ 放电；放到 $1/3V_{CC}$ 时下比较器翻转，放电管关断，又开始充电。周而复始，输出就是一串方波。

<FigBox title="电容在 1/3 与 2/3 Vcc 之间来回，输出就是方波" kind="结构" note="左边的接法里，充电路径经过 R₁+R₂，放电路径只经过 R₂ —— 这个不对称就是公式里出现 2R₂ 的原因，也是 555 的占空比永远大于 50% 的原因。右边是电容电压（锯齿）与输出（方波）的关系。">

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
  <line x1="66" y1="92" x2="120" y2="92" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#ct-v1)" />
  <text x="124" y="88" font-size="9" fill="var(--vp-c-brand-1)">DIS</text>
  <rect x="56" y="108" width="20" height="34" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="84" y="128" font-size="9.5">R₂</text>
  <line x1="66" y1="142" x2="66" y2="176" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <circle cx="66" cy="160" r="2.5" fill="var(--vp-c-brand-1)" />
  <line x1="66" y1="160" x2="120" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#ct-v1)" />
  <text x="124" y="156" font-size="9" fill="var(--vp-c-brand-1)">TH / TR</text>
  <line x1="42" y1="190" x2="90" y2="190" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <line x1="42" y1="198" x2="90" y2="198" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <text x="96" y="198" font-size="9.5">C</text>
  <line x1="66" y1="198" x2="66" y2="220" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="66" y="236" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">GND</text>

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
  <polyline points="286,168 352,168 352,148 358,148 358,168 424,168 424,148 430,148 430,168 462,168" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="300" y="188" font-size="8.5" fill="var(--vp-c-text-3)">充电段=高电平</text>
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

后一个式子说明一件容易忽略的事：**555 的多谐振荡器做不出 50% 占空比的方波**，因为充电永远比放电多经过一个 $R_1$。想要对称方波，要么在 $R_2$ 两端并一个二极管把充放电路径分开，要么改用别的方案。

接成**单稳态**（monostable，就是「按一下，输出一个固定宽度的脉冲」）时，$R$、$C$ 只有一个，脉宽：

$$
t_W\approx1.1RC
$$

这个 1.1 来自 $0.693\times\ln3$——电容从 0 充到 $2/3V_{CC}$ 的时间。不需要背推导，但要记住它的含义：**脉宽只由 $R$ 和 $C$ 决定，与触发信号的宽度无关**（只要触发够窄）。这就是「定时」功能的本质：你不需要精确控制「按多久」，只需要选一对 $R$、$C$，脉宽就定死了。

到这里，计数、寄存、定时三件事都齐了。下面五道题按「器件→时序→公式」的顺序排，每题先看「先想什么」。

## 六、例题

这一节五道题：第一道是清零法的标准做法，第二道算异步结构的频率上限，第三道做串并转换，第四道跑 555 的两个公式，第五道是新加的「同步置数法对比」。每题先看「先想什么」。

::: tip 例 1 · 用 74LS161 构成十进制计数器 {#ex-ctr-1}
**题目**：用一片 74LS161 加最少的门，构成 0~9 循环的十进制计数器。

图见第三节那张「检测码差 1」的阶梯图（把状态数换成 0~9 就是本题）。

**先想什么**：先确定「用清零法还是置数法」，这决定检测码。两者都对，但清零法少一个门（不用接 $D_3\sim D_0$），所以先用清零法。然后用第三章那张表查：模 10 的异步清零检测码是 $N=10$ 的二进制 `1010`。

**步骤**：

1. 位数：$2^3=8<10\le16=2^4$，用 4 位（161 本来就是 4 位，不用选）。
2. 检测码：$10_{10}=1010_2$，也就是 $Q_3=1$、$Q_1=1$、其余为 0。*（为什么要写二进制而不写十进制：电路只认识线上的高低电平，检测条件的实现方式就是「把对应那几根线接进与非门」。）*
3. 检测条件用「$Q_3$ 与 $Q_1$ 同时为 1」实现，接一个两输入与非门，输出送 $\overline{R_D}$。因为 $\overline{R_D}$ 是**低电平有效**，所以「与非门输出 0」正好表示清零有效。
4. 使能端 $CT_P$、$CT_T$ 接高，让它一直计数。

**验算**：数到 9（`1001`）时 $Q_3Q_1=10$，与非门输出 1，不清零；数到 10（`1010`）时 $Q_3Q_1=11$，与非门输出 0，$\overline{R_D}$ 有效、立刻清零 ✓。序列是 $0,1,\dots,9$（10 一闪即消）→0，共 10 个状态 ✓。

**一个必须检查的边界**：上电瞬间如果输出恰好是 `1010`~`1111` 中的某个值会怎样？`1010`、`1011`、`1110`、`1111` 都含 $Q_3Q_1=11$，会立刻被清零，能自启动 ✓；但 `1100`、`1101` 只含 $Q_3=1$、$Q_1=0$，检测条件不成立——它会继续数到 `1110` 才被清零。所以这个电路是能自启动的，但要多走两拍。**这类检查一定要做，否则板子第一次上电就可能显示一个荒唐的值。**
:::

::: tip 例 2 · 4 位异步计数器的最高工作频率 {#ex-ctr-2}
**题目**：4 位行波计数器，每位触发器传输延迟 $t_{pd}=20$ ns。求最高时钟频率；若时钟 10 MHz，还剩多少余量？

结构见第二节那张对比图的上半部分。

**先想什么**：行波计数器的要害是「最高位要等前面所有位翻完」。所以最坏路径是 $n$ 级串联，不是一级。这道题里 $n=4$。**为什么不是 1 级：因为第 3 位的时钟来自第 2 位的输出，第 2 位又来自第 1 位——链条是一级级串起来的。**

**步骤**：

1. 最坏路径：$4\times20=80$ ns。*（为什么乘 4：每一级都要等前一级的输出稳定，四级就是四次等待。）*
2. 最高频率：$f_{max}=1/80\ \text{ns}=12.5$ MHz。这是理论极限，实际要留余量。
3. 10 MHz 时周期 $T=100$ ns，余量 $100-80=20$ ns。

**验算**：用另一种算法交叉检查——异步计数器的输出频率是 $f/16$，4 位翻转一个完整周期需要 16 个输入周期；如果 80 ns 刚好是「一次进位传递」的时间，那么这 80 ns 必须小于一个输入周期 100 ns，比值 0.8 说明还有 20% 余量 ✓。

**结论与推论**：余量只有 20%，温度升高或换批次器件就会出问题。**要么降频到 8 MHz 以下，要么改同步结构**——同步 4 位计数器的最坏路径只有「触发器延迟 + 一级与门」，同样的器件能把上限做到 50 MHz 以上。这就是第二节那个结构差别在数值上的体现。
:::

::: tip 例 3 · 4 位移位寄存器做串并转换（方向与次序都要约定） {#ex-ctr-3}
**题目**：4 位移位寄存器初态 `0000`，串行输入按时间先后为「1、0、1、1」。分别求「右移（新数据进最高位）」与「左移（新数据进最低位）」两种接法下，四拍之后并行输出端的值。

结构与时序见第四节那张图。

**先想什么**：这类题唯一会错的地方是**方向**。先把「右移」说清：整个内容往低位方向挪一格，最高位空出来接纳新数据。所以每拍的动作是「内容右移一位，新数据塞进最高位」。判断方向的通用办法只有一句：**看新数据从哪一头进**——从最高位进就是右移，从最低位进就是左移。方向定了，四拍就是四次机械的移位+填位。

**步骤**（$Q_3$ 是最高位，$Q_0$ 是最低位）：

| 拍 | 右移（新数据进 $Q_3$） | 左移（新数据进 $Q_0$） |
| --- | --- | --- |
| 初态 | `0000` | `0000` |
| 第 1 拍（入 1） | `1000` | `0001` |
| 第 2 拍（入 0） | `0100` | `0010` |
| 第 3 拍（入 1） | `1010` | `0101` |
| 第 4 拍（入 1） | `1101` | `1011` |

右移第一拍值得单独看：初态全 0，右移之后还是全 0，真正改变内容的只有「填最高位」这一步。*（为什么这一点重要：很多人以为移位一定改变数值，其实空寄存器移几次都还是空的，进去的只有新数据。）*

**验算**：两种接法的结果 `1101` 与 `1011` **互为位反序**——把 `1101` 从右往左读就是 `1011`。这不是巧合：右移把最先到的位推到最高位，左移把它推到最低位，所以同一条输入序列在两种接法下得到的是同一个字的两种「视角」✓。

**这题的真正教训**：想让并行输出**正好等于串入的位序**（1、0、1、1 → `1011`），就必须用左移；用右移得到的是 `1101`，位是反的。串并转换的结果永远依赖两个约定——**移的方向**与**位的先后**。实际器件（如 74HC595、SPI 的收发寄存器）手册里把这两条写得明明白白，抄错任何一条，输出就是位反序的乱码。这也是调试 SPI、I²C 时最常见的「波形看着对、数值就是不对」的原因。
:::

::: tip 例 4 · 555 多谐振荡器与单稳态 {#ex-ctr-4}
**题目**：555 接成多谐振荡器，$R_1=R_2=10\ \text{k}\Omega$、$C=0.1\ \mu\text{F}$。求振荡频率与占空比；若改接成单稳态（只用 $R_1$、$C$），求输出脉宽。

接法与波形见第五节那张图。

**先想什么**：先分清「要不要 2 倍」。多谐振荡器的公式里 $R_2$ 要乘 2，因为电容充电走 $R_1+R_2$、放电只走 $R_2$；单稳态只有一个 $R$，所以是 $1.1RC$。**记不住时就回到「充电路径 vs 放电路径」这个物理图像，别硬背。**

**步骤**：

1. 多谐频率：
   $$f=\frac{1.43}{(R_1+2R_2)C}=\frac{1.43}{(10+20)\times10^3\times0.1\times10^{-6}}=\frac{1.43}{3\times10^{-3}}=476.7\ \text{Hz}$$
   *（为什么分母是 3 ms：$30\ \text{k}\Omega\times0.1\ \mu\text{F}=3$ ms，先算出时间常数再看倒数，比直接代数字更不容易错。）*
2. 占空比：$\dfrac{R_1+R_2}{R_1+2R_2}=\dfrac{20}{30}=66.7\%$。
3. 单稳脉宽：$t_W=1.1R_1C=1.1\times10^4\times10^{-7}=1.10$ ms。

**验算**：用周期核一遍。$f=476.7$ Hz 对应 $T=2.098$ ms；而 $t_{高}+t_{低}=0.693\times20\ \text{k}\times0.1\ \mu+0.693\times10\ \text{k}\times0.1\ \mu=1.386+0.693=2.079$ ms，两者差 0.9%，来自 1.43 与 $1/0.693=1.443$ 的取整差 ✓，量级完全对得上。

**一个常见追问**：想让占空比接近 50% 怎么办？在 $R_2$ 上并一个二极管（阳极朝电容），让充电也变成只经过 $R_2$——这样两条路径对称，占空比就接近 50%。代价是频率公式变成 $1.44/(2R_2C)$ 量级，要重新算。
:::

::: tip 例 5 · 同一模数，两种做法对比 {#ex-ctr-5}
**题目**：要求 0~5 循环（模 6）。分别用异步清零法和同步置数法，写出各自的检测条件，并说明输出序列的差别。

图见第三节的阶梯图（正是模 6 的情形）。

**先想什么**：这题的价值不在算出答案，而在**看清检测码为什么差 1**。抓住一句：清零是「立刻生效」，所以它必须在 $N$ 出现的那一刻动手；置数是「等下一个沿」，所以它提前一步在 $N-1$ 时就准备好。谁等时钟，谁就提前一格。

**步骤**：

1. 异步清零法：检测 $N=6$ 的二进制 `0110`，即 $Q_2Q_1$ 同时为 1，接一个与非门到 $\overline{R_D}$。
2. 同步置数法：检测 $N-1=5$ 的二进制 `0101`，即 $Q_2Q_0$ 同时为 1，接一个与非门到 $\overline{LD}$（$D_3\sim D_0$ 全接地）。
3. 输出序列的差别：清零法的序列是 $0,1,2,3,4,5$（`0110` 一闪即消）；置数法的序列是 $0,1,2,3,4,5$，从不出现 `0110`。

**验算**：两种做法都是 6 个状态，所以都是模 6 ✓。差别在「有没有那个尖峰」：接译码器显示时，清零法会在尖峰期间短暂点亮「6」的那一段——肉眼看不见，但如果是接比较器或中断触发，那个尖峰就是一个真实事件。**这就是选同步置数法的唯一理由，也是它值得多接四根线的理由。**
:::

## 七、工程实例

- **电子秒表的个位**：74LS161 做十进制（例 1），输出经 74LS48 译码驱动共阴数码管，进位输出 $CO$ 送下一级的时钟——这就是一个完整的十进位链。两位、三位只是把这个结构重复。
- **分频链**：32.768 kHz 晶振经 15 级二分频得 1 Hz，是所有石英钟的核心。**为什么选 32768**：它等于 $2^{15}$，用纯二分频链就能整除，而且这个频率的晶振可以做得很小。
- **串口通信**：UART 收数据时，把串行线上的位一位一位移进移位寄存器（SIPO），凑满 8 位后一起读走；发数据时反过来（PISO）。两个方向都是这页第四节的电路。
- **LED 驱动（74HC595）**：三根控制线就能点亮几十个 LED，靠的就是「串入并出」——数据一位一位移进去，装满后一个锁存脉冲同时更新所有输出。这是「用时间换引脚」的典型设计。
- **看门狗与上电复位**：模数不是 2 的幂的计数器在这里很常见（比如数到 65535 或某个特定值就复位）。这类电路最怕的就是「不能自启动」——上电时若落进空闲状态，整个系统就再也起不来。
- **555 的实际定位**：它便宜、耐操、外围简单，但它做不高精度（受电阻电容容差影响，1%~5% 很常见），也做不高频率（典型上限几百 kHz）。所以现代设计里它多用于「亮个灯、响个蜂鸣器、做个复位延时」，而精确时钟一律用晶振加锁相环。

## 八、易错清单（按踩坑频率排序）

1. **清零法接 $N$、置数法也接 $N$** → 置数法会少数一个状态（模数差 1）→ 记住：清零检测 $N$，置数检测 $N-1$，差别来自「等不等时钟」。
2. **异步计数器忽略累积延迟** → 算出的上限比实际能跑的高出好几倍，实物偶发丢数 → 最坏路径是 $n\times t_{pd}$，不是 $1\times t_{pd}$。
3. **555 公式里漏掉 $2R_2$** → 频率算成两倍多，实际接上去完全不对 → 记住充电路径走两个电阻、放电只走一个。
4. **以为 555 能出 50% 占空比** → 按 50% 设计时序，结果高电平偏长 → 占空比恒为 $(R_1+R_2)/(R_1+2R_2)>50\%$，要对称必须加二极管。
5. **忘了检查自启动** → 上电落进空闲状态，整个计数器卡死 → 每个任意进制电路都要问一句「上电时如果落在 $N\sim2^n-1$，下一拍会去哪」。
6. **移位方向与位的先后搞反** → 串并转换的结果位反序，数据「看起来对但值不对」→ 先明确「新数据进哪一位」，再排串入顺序。
7. **把「模」和「位数」混为一谈** → 用 4 位就以为一定是模 16 → 位数只决定「最多能表示多少状态」，模是实际用到的状态数。
8. **异步清零的尖峰喂给了下游** → 下游看到一个本不该存在的状态，触发一次误动作 → 对尖峰敏感时改用同步置数法。

## 九、自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. 「模 12 的计数器」和「4 位二进制计数器」有什么区别？分别在什么情况下用？
2. 用 74LS161 做模 12，异步清零的检测码是什么？同步置数的检测码是什么？为什么差 1？
3. 一个 4 位行波计数器的 $t_{pd}=15$ ns，它最快能跑多少？如果想跑 20 MHz，你会怎么改？

## 下一步

到这里，数字电路的骨干（门、组合逻辑、触发器、计数器与寄存器）已经齐了。你手上有一套能用门和触发器搭出任意功能的工具。但真实芯片不是这样设计的——没有人手工画几十万个门。下一章换个视角：**用编程语言描述电路**，让工具替你去优化、布线、验证。

<Prereq id="clock-tree" /> → [09 · 硬件描述语言与 FPGA](./09-verilog-fpga.md)
