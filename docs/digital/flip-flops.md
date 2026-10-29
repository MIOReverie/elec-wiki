---
title: 05 · 触发器
description: 两个反相器为什么能记住一位、四种触发器的特性方程与互相换算、电平触发和主从和边沿触发差在哪、建立时间与保持时间怎么变成时钟频率上限、亚稳态为什么只是偶尔出错、同步复位与异步复位怎么取舍；六张时序图、五道例题。
---

# 05 · 触发器

<Meta time="50 min" level="核心" note="三个坑最深：把电平触发当边沿触发；漏掉建立时间；以为异步复位想什么时候按都行。" />

墙上有个电灯开关。按下去，灯亮了，可如果触点在闭合那一瞬间弹了两下，你的单片机就读到「按、松、按」，一次按键被当成两次，计数器多加了一次。在软件里加个延时也不行：延时期间正好来了一次真正的新按键，就被吞掉了。

再换一个场景。8 位计数器，仿真波形完美。烧进芯片跑起来，绝大多数时候正常，偶尔有一位数多加了 1。把时钟从 50 MHz 降到 25 MHz，故障就消失了。

两件事指向同一个东西：「什么时候采一下输入」这件事必须被明确规定，不能靠「什么时候都行」。触发器和它背后那套时间约束，解决的就是这个问题。

上一页的电路还有一个共同缺陷：输入一变，输出立刻跟着变，算完的结果留不住。触发器给数字电路装上第一个记忆元件。

::: tip 读这页之前
要会与或非运算和真值表（<Prereq id="boolean-algebra" />），看过组合逻辑怎么表示、怎么分析（[04 · 组合逻辑电路](./combinational.md)），也知道门的延迟与扇出（<Prereq id="gate-fanout" />）。这些忘了不影响往下读，用到时会重说。

符号先交代：$Q^n$ 是现态，也就是当前这一拍的状态；$Q^{n+1}$ 是次态，下一个时钟沿之后的状态；**上标只是第几拍的编号，不是指数**。$\bar Q$ 是互补输出，永远与 $Q$ 相反。$D$、$J$、$K$、$T$、$S$、$R$ 是各触发器的输入。$t_{su}$ 是建立时间，$t_h$ 是保持时间，$t_{co}$ 是时钟沿到输出稳定的延迟，$t_{pd}$ 是门或走线的传输延迟。全部约定见[符号与约定](../guide/notation.md)。

一个术语先解释：时钟（clock，常写作 CLK）是一路不停在 0 和 1 之间来回的方波，它不给电路传递数据，只负责打拍子。所有触发器都在同一个沿上动作，整个系统才可能同步。

还会用到一点概率：亚稳态那一节用 $e^{-t/\tau}$ 描述「还没稳定下来」的概率，只需要知道它随时间迅速衰减。
:::

::: tip 一句话抓住本质
触发器就是一个只在特定瞬间才允许改变的组合逻辑。要同时记住两件事：它记什么（特性方程），和它什么时候记（时钟沿加建立保持窗口）。只记前者的人，仿真永远是对的，板子永远是偶尔出错的。
:::

## 一、双稳态：两个反相器凭什么能记住一位

一个没有任何机械零件的电路，怎么把 1 这个状态一直保持下去？

答案不在「存」这个动作上，在正反馈上。把两个反相器首尾相接成一个环：第一个的输出接第二个的输入，第二个的输出接回第一个的输入。

<FigBox title="两级反相器接成一个环，就有两个稳定点" kind="结构" note="环上只有两个自洽的解：A=1、B=0，或者 A=0、B=1。第三个数学解 A=B=0.5 是不稳定的，任何一点扰动都会被正反馈放大，最后滚向两个稳定点之一。这就是双稳态这个名字的来历。">

<svg viewBox="0 0 470 210" role="img" aria-label="两个反相器首尾相接构成环形正反馈，形成 A 与 B 两个节点，只有一高一低两个稳定状态">
<defs>
  <marker id="ff-b1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <polygon points="110,26 170,50 110,74" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <circle cx="176" cy="50" r="5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <polygon points="170,106 110,130 170,154" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <circle cx="104" cy="130" r="5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />

  <line x1="182" y1="50" x2="250" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ff-b1)" />
  <line x1="250" y1="50" x2="250" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="250" y1="130" x2="176" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ff-b1)" />
  <line x1="98" y1="130" x2="48" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="48" y1="130" x2="48" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="48" y1="50" x2="104" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ff-b1)" />

  <text x="212" y="42" text-anchor="middle" fill="var(--vp-c-brand-1)" font-weight="700">A</text>
  <text x="212" y="152" text-anchor="middle" fill="var(--vp-c-brand-1)" font-weight="700">B</text>
  <text x="140" y="94" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">反相器 1</text>
  <text x="140" y="176" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">反相器 2（朝左）</text>

  <text x="272" y="66" font-size="11" fill="var(--vp-c-text-2)">稳定点① A=1, B=0</text>
  <text x="272" y="86" font-size="11" fill="var(--vp-c-text-2)">稳定点② A=0, B=1</text>
  <text x="272" y="112" font-size="11" fill="var(--vp-c-text-3)">A=B=0.5 不稳定：</text>
  <text x="272" y="130" font-size="11" fill="var(--vp-c-text-3)">稍有扰动就被放大</text>
  <text x="272" y="158" font-size="11" fill="var(--vp-c-brand-1)">正反馈 = 记忆</text>
</g>
</svg>

</FigBox>

为什么第三个解（$A=B=0.5$）不稳定？因为反相器有增益。假设 $A$ 比 0.5 高了那么一点点（0.51），经过一级反相放大，$B$ 就比 0.5 低得更多（比如 0.45）；再反一次，$A$ 又抬到 0.6。每一圈都把偏差放大一倍多，直到撞到 0 或 1 才停。放大到饱和，这就是所有双稳态电路的工作方式，也是后面讨论亚稳态时要回头用的图像。

这个环能存住的只有 0 和 1 两个值，中间那些电平一个都站不住。它有两个输出，工程上记作 $Q$ 和 $\bar Q$，两者永远相反；约定 $Q=1$ 表示这一位存的是 1。记忆这件事到这里就不神秘了：它只需要一个能让两种状态都自洽的反馈结构，别的什么都不用。断电则两者都归零，所以 SRAM 断电丢数据，闪存不丢。

有了能存一位的东西，紧接着的问题是：怎样按我们的意愿把它写成 1 或 0。四种主流方案，区别全在给什么输入、什么时候生效。

## 二、四种触发器：特性方程就是一张表

描述触发器的标准方式不是真值表，是特性方程（也叫状态方程）：把次态写成输入与现态的函数。输入端的名字各器件不同（$D$、$J$、$K$、$T$），要回答的问题却是同一个：下一个沿之后，这一位该变成什么。

| 触发器 | 特性方程 | 一句话记住 |
| --- | --- | --- |
| **D** 型 | $Q^{n+1}=D$ | 时钟一到，$Q$ 就变成 $D$，最听话，也最常用 |
| **JK** 型 | $Q^{n+1}=J\bar Q^n+\bar KQ^n$ | $J$ 管置 1、$K$ 管清 0；两个都给就翻转 |
| **T** 型 | $Q^{n+1}=T\oplus Q^n$ | $T=1$ 翻转，$T=0$ 保持；它就是 $J=K=T$ 的 JK |
| **RS** 型 | $Q^{n+1}=S+\bar RQ^n$ | 有约束 $SR=0$，两个同时给 1 是非法输入 |

这四行要背到能默写：$Q^{n+1}=D$、$Q^{n+1}=J\bar Q^n+\bar KQ^n$、$Q^{n+1}=T\oplus Q^n$、$Q^{n+1}=S+\bar RQ^n$（RS 型的约束 $SR=0$ 别忘）。

四个方程里只有 JK 需要多看一眼，因为它是唯一一个「输入为 1 反而表示取反」的。把 $J$、$K$ 四种组合代进去走一遍，就得到那张经典的功能表：

| $J$ | $K$ | $Q^{n+1}$ | 操作名 |
| --- | --- | --- | --- |
| 0 | 0 | $Q^n$ | 保持 |
| 0 | 1 | 0 | 清 0 |
| 1 | 0 | 1 | 置 1 |
| 1 | 1 | $\bar Q^n$ | 翻转 |

JK 是最全的一个，四种操作它一个不缺，所以老教材喜欢拿它当万能件。D 型只能跟随，但正因为它简单，在芯片里占绝对主流：现代综合工具里所有触发器都是 D 型，JK 只活在教材和少数老器件（如 74LS112）里。

互相换算是考试的常客，套路只有一条：把目标方程改写成 $Q^{n+1}=(\dots)\bar Q^n+(\dots)Q^n$ 的形式，再对照源方程读出输入该接什么。比如要把 JK 接成 T 型：JK 是 $J\bar Q+\bar KQ$，T 型要的是 $T\bar Q+\bar TQ$，对应位置相等即 $J=T$、$\bar K=\bar T$，也就是 $J=K=T$。

四种器件的「记什么」都清楚了，但还有一个更基本的问题没解决：它们什么时候记。

## 三、电平触发、主从触发、边沿触发：差别在什么时候看输入

三种方式的共同点是都有时钟，区别在于时钟的哪个部分有效：

- 电平触发（latch，锁存器）：时钟为高（或为低）的整段时间里，输出都跟着输入走。这段时间电路是透明的，所以又叫透明锁存器。
- 主从触发（master-slave）：两级锁存器串联，主级在时钟高电平期间接收、从级在高电平期间锁存，等时钟变低才把数据送到输出。
- 边沿触发（edge-triggered）：内部做到只在时钟跳变的那一瞬间（上升沿或下降沿）采一次，其余时间输入怎么变都不管。

图上看最清楚。下面这张图里，$D$ 在一个时钟高电平期间变了两次：

<FigBox title="同一个 D，在同一路时钟下，两种触发方式给出两个答案" kind="时序" note="CLK 高电平期间（阴影段）数据变化了两次：电平触发的 Q 跟着翻两次，这叫空翻；边沿触发的 Q 只在上升沿采一次，中间怎么变都不理。这就是现代设计一律用边沿触发的理由。">

<svg viewBox="0 0 480 300" role="img" aria-label="时序对比：D 在时钟高电平期间变化两次，电平触发输出跟着变两次，边沿触发只在上升沿更新一次">
<defs>
  <marker id="ff-t1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="120" y="20" width="80" height="240" fill="var(--vp-c-brand-soft)" stroke="none" />
  <rect x="280" y="20" width="80" height="240" fill="var(--vp-c-brand-soft)" stroke="none" />

  <text x="66" y="52" text-anchor="end">CLK</text>
  <polyline points="80,70 120,70 120,40 200,40 200,70 280,70 280,40 360,40 360,70 440,70 440,40 470,40" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />

  <text x="66" y="112" text-anchor="end">D</text>
  <polyline points="80,130 140,130 140,100 175,100 175,130 230,130 230,100 300,100 300,130 470,130" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />

  <text x="66" y="172" text-anchor="end" font-size="10.5">Q 电平触发</text>
  <polyline points="80,190 140,190 140,160 175,160 175,190 280,190 280,160 300,160 300,190 470,190" fill="none" stroke="#f59e0b" stroke-width="2.2" />

  <text x="66" y="232" text-anchor="end" font-size="10.5">Q 边沿触发</text>
  <polyline points="80,250 280,250 280,220 440,220 440,250 470,250" fill="none" stroke="#34d399" stroke-width="2.2" />

  <line x1="120" y1="20" x2="120" y2="262" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />
  <line x1="280" y1="20" x2="280" y2="262" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="126" y="284" font-size="10" fill="var(--vp-c-brand-1)">↑ 采样</text>
  <text x="286" y="284" font-size="10" fill="var(--vp-c-brand-1)">↑ 采样</text>

  <text x="178" y="212" font-size="10" fill="#f59e0b">一次高电平里翻了两次 → 空翻</text>
  <text x="200" y="238" font-size="10" fill="#34d399">沿之外不动作</text>
</g>
</svg>

</FigBox>

电平触发的病叫**空翻**。整个高电平期间输出都跟着输入走，如果输入本身又是由这个输出算出来的（时序电路里太常见了），一个时钟周期内就可能翻转好几次，节拍全乱。空翻谈不上偶尔，它是电平触发在反馈电路里的必然结果。

主从触发怎么治：把两级锁存器串起来，让接收数据和送出数据分成两个时段。主级在高电平期间接收，从级在高电平期间锁存，于是时钟高电平期间输出不会跟着输入变。

但主从结构留下一个小毛病，叫**一次变化现象**。要理解它，得先看清两级各自什么时候透明：主级在 CLK=1 期间透明，从级在 CLK=0 期间透明。于是输出在 CLK=1 的整段时间里被从级锁住、一动不动，只在下降沿那一刻把主级记住的值送出来。一个周期里 $Q$ 只变一次，不会像电平触发那样翻好几次。

麻烦在于它记住的是哪一刻的值：主级在整个高电平期间都敞开着，所以它记住的是高电平结束前最后一次的输入，而不是上升沿那一刻的输入。如果输入在高电平期间变了，边沿触发和主从触发会给出不同的答案。这也是考试爱考的点：主从 JK 不是边沿触发，它把采样点从整个高电平缩小到了高电平末尾，但没有缩到一个点。

边沿触发怎么做到：内部用一个窄脉冲（或叫引导脉冲）只在跳变瞬间打开采样门，宽度只有门延迟量级，所以它在沿之外完全不响应输入。现代芯片里的触发器（74LS74、74HC74 这类 D 触发器，以及所有 FPGA 内部触发器）都是边沿触发的。

顺带说清一个常见混淆：锁存器（latch）和触发器（flip-flop）在中文教材里有时混用。严格区分是，锁存器电平敏感（透明），触发器边沿敏感。老教材把两者都叫触发器，看题时以「有没有明确写边沿」为准。

顺带说一句为什么寄存器几乎不用电平触发来做：只要电路里有反馈（计数器就是），透明期就会让一个周期内的翻转次数失控，谁都算不准下一拍会停在哪。这也是主从结构慢慢被边沿结构取代的原因。

到这里，边沿触发看起来完美了。可它其实什么都没解决，只是把「什么时候采」规定成了「沿那一瞬间」。而只要在规定的那一瞬间采样，就必须回答一个更狠的问题：那一瞬间的前后，数据要不要稳住？

## 四、建立时间与保持时间：数据必须在窗口里稳住

触发器不是理想的开关。时钟沿到达后，内部的采样节点需要一段时间才能把电压拉到位，这段时间叫时钟到输出的延迟 $t_{co}$（clock-to-Q）。反过来，在时钟沿到达之前，数据也必须已经稳定了一段时间，否则内部节点来不及建立电荷，采到的值可能是错的。这段时间叫**建立时间** $t_{su}$（setup time）。沿之后数据还得再稳一会儿，因为内部锁存动作还在进行，这叫**保持时间** $t_h$（hold time）。

三段合起来，就是每个触发器都有的采样窗口：

<FigBox title="采样窗口：沿前 t_su、沿后 t_h，数据不许动" kind="时序" note="上：合格数据在窗口外变化，沿到来时值已经稳定。下：数据在保持时间里才变化，踩进了窗口，采到的可能是旧值也可能是新值，甚至两者都不是。中间那段阴影就是窗口的全部，宽度为 t_su 加 t_h。">

<svg viewBox="0 0 480 302" role="img" aria-label="时序图：时钟上升沿前 t_su、沿后 t_h 构成采样窗口，合格的数据在窗口外变化，违规的数据在保持时间内变化">
<defs>
  <marker id="ff-su" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="200" y="18" width="80" height="248" fill="var(--vp-c-brand-soft)" stroke="none" />
  <line x1="240" y1="18" x2="240" y2="272" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />

  <text x="66" y="52" text-anchor="end">CLK</text>
  <polyline points="80,60 240,60 240,30 470,30" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />
  <text x="220" y="14" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">↑ 时钟沿</text>

  <text x="66" y="112" text-anchor="end" font-size="10.5">D（合格）</text>
  <polyline points="80,140 140,140 140,110 330,110 330,140 470,140" fill="none" stroke="#34d399" stroke-width="2.2" />
  <text x="256" y="104" font-size="10" fill="#34d399">窗口内不动 ✓</text>

  <text x="66" y="202" text-anchor="end" font-size="10.5">D（违规）</text>
  <polyline points="80,230 250,230 250,200 470,200" fill="none" stroke="#f43f5e" stroke-width="2.2" />
  <text x="258" y="244" font-size="10" fill="#f43f5e">在 t_h 内变化 ✗</text>

  <line x1="200" y1="272" x2="240" y2="272" stroke="var(--vp-c-text-3)" stroke-width="1" marker-start="url(#ff-su)" marker-end="url(#ff-su)" />
  <text x="220" y="286" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">t_su</text>
  <line x1="240" y1="272" x2="280" y2="272" stroke="var(--vp-c-text-3)" stroke-width="1" marker-start="url(#ff-su)" marker-end="url(#ff-su)" />
  <text x="260" y="286" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">t_h</text>
</g>
</svg>

</FigBox>

这两个数不是设计者随便定的，是器件手册给出的硬指标。典型量级：分立器件 74LS74 的 $t_{su}$ 约 20 ns，现代 CMOS 触发器在 0.5～1 ns 量级。为什么沿之后还要保持？因为采样的内部节点在沿的时刻才开始动作，如果数据这时又变回旧值，内部节点会被拉回去，锁存结果不确定。记法可以很土：沿前要求「已经到齐」，沿后要求「别走」。

有了窗口，就能算芯片能跑多快。两个触发器之间夹一段组合逻辑，信号要在下一拍的时钟沿之前赶到：

<FigBox title="时钟周期的三段预算" kind="结构" note="从 FF1 的时钟沿算到 FF2 的下一个时钟沿，必须在 T 之内走完三段：FF1 输出稳定（t_co）、组合逻辑传播（t_comb）、FF2 采样前建立（t_su）。三段之和就是最小周期，倒数就是最高频率。">

<svg viewBox="0 0 480 240" role="img" aria-label="两个触发器之间夹一段组合逻辑，时钟周期由 t_co、t_comb、t_su 三段预算构成">
<defs>
  <marker id="ff-p1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="40" y="46" width="76" height="56" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="78" y="80" text-anchor="middle">FF1</text>
  <rect x="196" y="50" width="104" height="48" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.6" />
  <text x="248" y="79" text-anchor="middle" font-size="11">组合逻辑</text>
  <rect x="380" y="46" width="76" height="56" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="418" y="80" text-anchor="middle">FF2</text>

  <line x1="116" y1="74" x2="192" y2="74" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ff-p1)" />
  <text x="154" y="64" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">t_co</text>
  <line x1="300" y1="74" x2="376" y2="74" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ff-p1)" />
  <text x="338" y="64" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">t_comb</text>

  <line x1="78" y1="102" x2="78" y2="128" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ff-p1)" />
  <line x1="418" y1="102" x2="418" y2="128" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ff-p1)" />
  <text x="78" y="146" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">CLK</text>
  <text x="418" y="146" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">CLK</text>
  <line x1="368" y1="102" x2="368" y2="128" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="4 3" />
  <text x="368" y="146" text-anchor="middle" font-size="10" fill="#f59e0b">t_su</text>

  <text x="40" y="186" font-size="12" fill="var(--vp-c-text-1)">T ≥ t_co + t_comb + t_su</text>
  <text x="40" y="208" font-size="11" fill="var(--vp-c-text-3)">代入例 4 的数：2 + 5 + 1.5 = 8.5 ns，f ≤ 117.6 MHz</text>
  <text x="40" y="228" font-size="11" fill="var(--vp-c-brand-1)">想更快只有两条路：减 t_comb（加流水线），或换更快的器件</text>
</g>
</svg>

</FigBox>

写成式子：

$$
T \ge t_{co}+t_{comb}+t_{su} \quad\Longrightarrow\quad f_{max}=\frac{1}{t_{co}+t_{comb}+t_{su}}
$$

注意这个式子没有包含 $t_h$。保持时间的检查是另一条独立的规则，方向相反：

$$
t_{co}+t_{comb,min} \ge t_h
$$

它的意思是：新数据不能来得太快。如果组合逻辑特别快（比如两拍之间只隔一根线），新数据可能在旧数据还被要求保持的时候就冲到了下一级，把旧值冲掉。所以提速时建立时间变松、保持时间变紧，此消彼长。

这两条约束解释了开头第二个场景：把时钟降到一半，故障消失，因为 $T$ 变大，建立条件自然满足。但它没解释为什么只是偶尔错。如果时序违反了，应该每次都错才对。

## 五、亚稳态：数据来得太晚会发生什么

回到那个反相器环。正常工作时它只停在两个稳定点之一。可如果采样正好发生在数据跳变的瞬间，内部节点会被推到一个中间电平，然后靠正反馈慢慢滚向某一侧。滚的过程需要时间，而这段时间里输出的电平既不是 0 也不是 1，这就是**亚稳态**。判决电路这时候读到什么，全看运气，而下游可能拿这个 0 或 1 去做了别的事。

<FigBox title="亚稳态：输出卡在中间，什么时候下来不确定" kind="时序" note="数据在窗口内变化（下面那条虚线附近），输出没有干脆地翻到高电平，而是先爬进中间的不确定区、晃一会儿才落定。落定到哪一侧也不保证，可能本该是 1 却停在 0，这叫判决错误。">

<svg viewBox="0 0 480 300" role="img" aria-label="时序图：数据在采样窗口内变化时，触发器输出进入中间电平的不确定区，经过一段指数衰减后才落定">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="238" y="196" width="120" height="46" fill="var(--vp-c-brand-soft)" stroke="none" />
  <line x1="240" y1="196" x2="470" y2="196" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 4" />
  <line x1="240" y1="242" x2="470" y2="242" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 4" />
  <text x="472" y="200" text-anchor="end" font-size="9.5" fill="var(--vp-c-text-3)">判决上限</text>
  <text x="472" y="256" text-anchor="end" font-size="9.5" fill="var(--vp-c-text-3)">判决下限</text>

  <text x="66" y="52" text-anchor="end">CLK</text>
  <polyline points="80,60 240,60 240,30 470,30" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />
  <line x1="240" y1="22" x2="240" y2="286" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />

  <text x="66" y="122" text-anchor="end" font-size="10.5">D</text>
  <polyline points="80,140 250,140 250,110 470,110" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="256" y="104" font-size="10" fill="var(--vp-c-brand-1)">改得太晚</text>

  <text x="66" y="182" text-anchor="end" font-size="10.5">Q（理想）</text>
  <polyline points="80,180 240,180 240,150 470,150" fill="none" stroke="#34d399" stroke-width="2" />
  <text x="256" y="146" font-size="10" fill="#34d399">干脆利落</text>

  <text x="66" y="222" text-anchor="end" font-size="10.5">Q（实际）</text>
  <path d="M80,240 L240,240 C268,240 282,232 296,220 C314,204 326,190 344,184 L470,184" fill="none" stroke="#f43f5e" stroke-width="2.2" />
  <text x="300" y="278" font-size="10" fill="#f43f5e">在不确定区停留了一段指数衰减的时间</text>
</g>
</svg>

</FigBox>

关键性质有三条，都很反直觉：

1. 落定的方向不可预测。它在中间电平停留之后，可能滚向 1，也可能滚向 0。所以后果有两种：延迟（输出晚了一拍才到）和判决错误（输出取了错的值）。前者比后者温和得多。
2. 停留时间服从指数分布。设时间常数为 $\tau$（由电路增益带宽决定），那么过了 $t$ 时间还没落定的概率近似为 $e^{-t/\tau}$。这就是偶尔出错的来源：绝大多数情况下它很快就落定了，极小概率下它拖了很久，刚好被下一级采到。
3. 不能消除，只能降低概率。任何两级独立时钟域之间都存在这个窗口，物理上无法避免。工程上通常加两级同步器（两级 D 触发器串联），让第一级随便怎么亚稳态，第二级多等整整一拍再采，把落定概率压到可接受的水平。

算一下这个概率掉得多快：设 $\tau=0.2$ ns，等 1 ns（也就是 $5\tau$），残余概率是 $e^{-5}\approx0.67\%$。如果时钟是 100 MHz（周期 10 ns），那么第一级有足足 10 ns 去落定，对应 $50\tau$，残余概率是 $e^{-50}\approx2\times10^{-22}$。两级同步器几乎总够用，原因就在这里。但要注意：如果系统上亿次每秒在采这个信号，$10^{-22}$ 也不能说绝对不会发生，工程上还要算 MTBF（平均无故障时间），而不是说概率为零。

两级同步器在图纸上就是两个 D 触发器首尾相接：第一级直接吃异步信号，第二级把结果再打一拍。FPGA 里还会给它加一条属性（常见写法是 ASYNC_REG），提醒综合工具别把这两级合并或者优化掉，因为一旦被合并成一级，那多等的一拍就没了。

亚稳态这件事，让「数字电路只有 0 和 1」这个信念破产了一半：0 和 1 是两个稳态，中间还有一片谁都不想要的中间地带，而电路偶尔会掉进去。

## 六、同步复位与异步复位

还剩一个很具体的工程问题：按复位键时，触发器应该立刻清零，还是等下一个时钟沿？

两种做法都合理，代价不同。

异步复位（asynchronous reset）走的是触发器的异步端，常用 $\bar R_D$ 表示，D 下标表示它作用于 D 触发器，横杠表示低电平有效。它不经过时钟，只要电平有效就立刻把 $Q$ 强制清 0，同一瞬间 $\bar Q$ 被拉成 1。与之配套的还有异步置位端 $\bar S_D$，能立刻把 $Q$ 强制置 1。这两个端优先级最高，时钟、数据统统让路。

同步复位（synchronous reset）没有专用引脚，复位信号被当成一路普通数据送进 $D$ 端，通常写成 $D=\text{RST}\ ?\ 0:\text{输入}$，于是它只在时钟沿生效，办法是让 $Q$ 在沿上采到一个 0。

<FigBox title="同一时刻按下复位，两种复位方式清零点不一样" kind="时序" note="RST 在两次时钟沿之间拉高。异步复位立刻把 Q 拉低（不等时钟）；同步复位要等到下一个上升沿才把 Q 拉低。异步复位的隐患在释放端：RST 在哪一刻变低是随机的，如果正好贴着时钟沿，就会踩进采样窗口引起亚稳态。">

<svg viewBox="0 0 480 320" role="img" aria-label="时序对比：复位信号拉高后，异步复位立即清零，同步复位等到下一个时钟上升沿才清零">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="66" y="52" text-anchor="end">CLK</text>
  <polyline points="80,60 120,60 120,30 200,30 200,60 240,60 240,30 320,30 320,60 360,60 360,30 470,30" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />

  <text x="66" y="122" text-anchor="end">RST</text>
  <polyline points="80,130 150,130 150,100 300,100 300,130 470,130" fill="none" stroke="#f59e0b" stroke-width="2.2" />
  <text x="156" y="94" font-size="10" fill="#f59e0b">按下（与时钟无关）</text>

  <text x="66" y="192" text-anchor="end" font-size="10.5">Q 异步复位</text>
  <polyline points="80,170 150,170 150,200 470,200" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <line x1="150" y1="150" x2="150" y2="210" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="156" y="222" font-size="10" fill="var(--vp-c-brand-1)">立刻清 0</text>

  <text x="66" y="262" text-anchor="end" font-size="10.5">Q 同步复位</text>
  <polyline points="80,240 240,240 240,270 470,270" fill="none" stroke="#34d399" stroke-width="2.2" />
  <line x1="240" y1="150" x2="240" y2="280" stroke="#34d399" stroke-width="1" stroke-dasharray="3 3" />
  <text x="246" y="296" font-size="10" fill="#34d399">等到 ↑ 沿才清 0</text>
  <text x="80" y="316" font-size="10" fill="var(--vp-c-text-3)">同步复位多等了一个沿，换来的是「行为可预测」</text>
</g>
</svg>

</FigBox>

取舍很清楚：

| 对比项 | 异步复位 | 同步复位 |
| --- | --- | --- |
| 生效时机 | 立刻，不等时钟 | 下一个有效时钟沿 |
| 能否在无时钟时复位 | 能（上电、时钟未起振时这是唯一办法） | 不能 |
| 复位释放时刻 | 不可控，可能踩进采样窗口 | 与时钟对齐，天然安全 |
| 抗毛刺能力 | 差（毛刺会被当成复位） | 好（毛刺在沿外被忽略） |
| 需要的资源 | 触发器要带异步端 | 复位信号占一路数据逻辑 |

工程上的标准答案是两者拼起来：**异步复位、同步释放**。做法是让复位信号先进一个两级同步器再送给触发器的异步端，按下时立刻生效，释放时被同步到时钟沿上。这一招在两个时钟域之间传递复位信号时几乎是强制的，因为没有它，不同触发器会在不同的拍退出复位，状态机可能进入一个从未设计过的状态。

记什么、什么时候记、违反了会怎样、出错后怎么拉回来，四件事到这里都清楚了。下面用五道题把它们逐个用一遍。

## 七、五道题：从方程代入到概率估算

::: tip 例 1 · JK 的四种操作一次走完 {#ex-ff-1}
题目：JK 触发器，现态 $Q^n$ 分别取 0 和 1，输入 $(J,K)$ 取四种组合，求次态并归纳功能。

<FigBox title="J 管置 1，K 管清 0，两个都给就翻转" kind="时序" note="四段分别对应保持、清 0、置 1、翻转。翻转段里每来一个时钟沿 Q 就翻一次（0→1→0→1），所以翻转段中 Q 的周期正好是两个时钟周期，输出频率是时钟的一半。">

<svg viewBox="0 0 480 250" role="img" aria-label="JK 触发器四种操作的时序：保持段 Q 不变、清零段 Q 为 0、置一段 Q 为 1、翻转段 Q 每个沿翻转一次">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="80" y="20" width="90" height="200" fill="var(--vp-c-bg-soft)" stroke="none" />
  <rect x="170" y="20" width="90" height="200" fill="var(--vp-c-brand-soft)" stroke="none" />
  <rect x="260" y="20" width="90" height="200" fill="var(--vp-c-bg-soft)" stroke="none" />
  <rect x="350" y="20" width="120" height="200" fill="var(--vp-c-brand-soft)" stroke="none" />
  <text x="125" y="34" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">J K = 0 0</text>
  <text x="215" y="34" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">0 1 清 0</text>
  <text x="305" y="34" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">1 0 置 1</text>
  <text x="410" y="34" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">1 1 翻转</text>

  <text x="66" y="72" text-anchor="end">CLK</text>
  <polyline points="80,80 125,80 125,56 147,56 147,80 170,80 170,56 192,56 192,80 215,80 215,56 237,56 237,80 260,80 260,56 282,56 282,80 305,80 305,56 327,56 327,80 350,80 350,56 372,56 372,80 395,80 395,56 417,56 417,80 440,80 440,56 462,56 462,80 470,80" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />

  <text x="66" y="142" text-anchor="end">Q</text>
  <polyline points="80,130 170,130 170,160 260,160 260,130 350,130 350,160 395,160 395,130 440,130 440,160 470,160" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />

  <text x="125" y="196" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">Q 不变</text>
  <text x="215" y="196" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">Q 归 0</text>
  <text x="305" y="196" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">Q 变 1</text>
  <text x="410" y="196" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">每沿翻一次</text>
  <text x="80" y="232" font-size="10" fill="var(--vp-c-text-3)">翻转段里 Q 的周期是 CLK 的两倍 → 天然二分频</text>
</g>
</svg>

</FigBox>

先想什么：这类题唯一的技巧是别凭记忆答，代方程。四个组合里只有 $J=K=1$ 反直觉（输入为 1 却表示取反），其余三个都能用一句「$J$ 是置 1 的请求、$K$ 是清 0 的请求」推出来。两个请求同时出现时才有歧义，而 JK 的选择是让它们互相抵消成翻转。

步骤（代入 $Q^{n+1}=J\bar Q^n+\bar KQ^n$）：

1. $J=0,K=0$：$Q^{n+1}=0\cdot\bar Q^n+1\cdot Q^n=Q^n$，保持。*（为什么是保持：没有请求，器件就维持原状，这正是记忆的含义。）*
2. $J=0,K=1$：$Q^{n+1}=0+\bar1\cdot Q^n=0$，清 0，与现态无关。
3. $J=1,K=0$：$Q^{n+1}=1\cdot\bar Q^n+\bar0\cdot Q^n=\bar Q^n+Q^n=1$，置 1，与现态无关。
4. $J=1,K=1$：$Q^{n+1}=\bar Q^n+\bar1\cdot Q^n=\bar Q^n$，翻转。

验算：把四种结果代回功能表逐条比对 ✓；再检查一个边界，第 2、3 条「与现态无关」说明现态取任何值都得到同一结果，这在计算时表现为 $Q^n$ 项被系数 0 消掉了，可以当作解题时的自检信号（如果结果里还留着 $Q^n$，那这一项就不该叫无条件清 0）。
:::

::: tip 例 2 · D 触发器的「跟随」与寄存器 {#ex-ff-2}
题目：四个 D 触发器并行摆好，共用同一个时钟，$D_3D_2D_1D_0=1011$，求一个时钟沿之后各触发器的输出。

先想什么：D 触发器没有保持这种操作，它的次态永远等于输入，所以它只能做一件事：在沿的时刻把当时的输入抄下来。因此这题的答案与现态无关，只与沿到来那一刻的 $D$ 有关。工程含义也在这里：因为是同时抄，多个 D 触发器并行就能存下一个字（word），这就是寄存器（register）。

步骤：

1. 每个触发器独立：$Q_i^{n+1}=D_i$，所以沿之后 $Q_3Q_2Q_1Q_0=1011$。
2. 沿之前 Q 是什么值完全不影响结果。这正是同步的价值：所有位在同一时刻更新，不会出现「更新到一半」的中间状态。

验算：如果四个触发器不是共用一个时钟（比如时钟走线长度差很多，导致沿到达时间差了几纳秒），那么在两个沿之间的短暂时段里，某些位已经是新值、某些还是旧值，下游电路可能读到一个从未存在过的组合（`1011` 变成 `1001` 之类的中间值）。这解释了为什么寄存器在布局时要保证时钟偏斜（clock skew）足够小。

动手看一眼：把 <FlipFlopDemo /> 切到「D 触发器」，拨 $D=1$ 后连点两次「↑ 发一个时钟脉冲」，$Q$ 第一次就变 1、第二次保持 1；再把 $D$ 拨回 0 但先不发时钟，$Q$ 不变，这就是沿之外不响应。
:::

::: tip 例 3 · 一个触发器就是一分频器 {#ex-ff-3}
题目：把 JK 接成 $J=K=1$（即 T 型，$T=1$），时钟 12 MHz，求 $Q$ 的频率；再级联 4 级，求末级频率。

<FigBox title="翻转一次用掉一个时钟周期：输出周期翻倍" kind="波形" note="Q 每来一个时钟沿翻转一次，所以一个完整的 Q 周期需要两个时钟周期，频率减半。级联 n 级就是除以 2ⁿ，这就是分频链，也是计数器的最简形式。">

<svg viewBox="0 0 470 200" role="img" aria-label="二分频波形：时钟每个上升沿 Q 翻转一次，Q 的周期是时钟的两倍">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="78" y="56" text-anchor="end">CLK 12 MHz</text>
  <polyline points="80,64 100,64 100,40 140,40 140,64 180,64 180,40 220,40 220,64 260,64 260,40 300,40 300,64 340,64 340,40 380,40 380,64 420,64 420,40 460,40" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.8" />

  <text x="78" y="126" text-anchor="end">Q 6 MHz</text>
  <polyline points="80,100 100,100 100,130 180,130 180,100 260,100 260,130 340,130 340,100 420,100 420,130 460,130" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />

  <line x1="100" y1="34" x2="100" y2="142" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <line x1="180" y1="34" x2="180" y2="142" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <line x1="260" y1="34" x2="260" y2="142" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />

  <text x="80" y="166" font-size="10.5" fill="var(--vp-c-text-3)">每个 ↑ 沿翻一次 → 一个 Q 周期 = 两个 CLK 周期</text>
  <text x="80" y="186" font-size="10.5" fill="var(--vp-c-brand-1)">4 级级联 = ÷2⁴ = ÷16 → 12 MHz / 16 = 750 kHz</text>
</g>
</svg>

</FigBox>

先想什么：分频谈不上特殊功能，它就是翻转这个操作的直接后果。所以判断能不能分频，只需问一句：这个接法在时钟沿上会不会翻转？会翻转，就是分频，而且是二分频。

步骤：

1. $J=K=1$ 时每沿翻转，$Q$ 的一个完整周期包含两次翻转，即两个时钟周期：$f_Q=12/2=6$ MHz。
2. 四级级联，每级再除 2：$12/2^4=12/16=0.75$ MHz = 750 kHz。
3. 反过来也常用：已知想要的频率，反推级数。要 1 kHz，从 12 MHz 出发需要 $12\times10^6/10^3=12000$ 倍分频，而 $2^{13}=8192$、$2^{14}=16384$，所以纯 2 分频链做不到整数 12000，必须用模 12000 计数器，而不是简单的分频链。

验算：用时间独立算一遍。12 MHz 的周期是 $83.3$ ns 左右；四级级联意味着输出走完一个周期要 16 个时钟周期，$16\times83.3=1333$ ns，取倒数得 $750$ kHz ✓，与除法算的完全一致。

这里要专门提醒一条最容易错的地方：$n$ 级级联对应 $2^n$ 个时钟周期，不是 $2n$ 个。四级是 16 个周期（$16\times83.3=1333$ ns），不是 8 个周期（$8\times83.3=667$ ns，对应 1.5 MHz，差了一倍）。凡是用时间验算得到的结果和用除法算的对不上，先回头数这个 2 的幂次。
:::

::: tip 例 4 · 算最高时钟频率 {#ex-ff-4}
题目：某同步电路两个触发器之间夹一段组合逻辑。$t_{co}=2$ ns、组合逻辑最长延迟 $t_{comb}=5$ ns、最短延迟 $t_{comb,min}=0.5$ ns、$t_{su}=1.5$ ns、$t_h=0.5$ ns，时钟偏斜忽略。求最高时钟频率，并检查保持时间是否满足。

图见第四节的「时钟周期三段预算」。

先想什么：先分清两条约束的方向。建立约束写成 $T\ge t_{co}+t_{comb}+t_{su}$，管的是太慢：信号必须在一个周期内赶到，所以它给的是频率上限。保持约束管太快：新数据不能冲掉还没采完的旧数据，所以它给的是延迟下限。两者用的延迟量也不同，建立用最大值（最坏情况），保持用最小值（最好情况）。这一点最容易失分。

步骤：

1. 建立约束：$T\ge t_{co}+t_{comb}+t_{su}=2+5+1.5=8.5$ ns。
2. 求频率：$f_{max}=1/8.5\ \text{ns}=117.6$ MHz。*（为什么取倒数：一个周期就是这三段之和，周期越短频率越高，所以三段之和给出周期的下限、频率的上限。）*
3. 保持约束：$t_{co}+t_{comb,min}\ge t_h$，即 $2+0.5=2.5\ \text{ns}\ge0.5$ ns，满足 ✓。*（这里代的是最短延迟 0.5 ns，不是 5 ns：保持检查关心新数据最早能多早到，所以取最快的那条路径。）*

验算：把结论代回原式，$117.6$ MHz 对应周期 $8.5$ ns，正好等于三段之和，没有余量。工程上要留余量（通常按 10%~20% 降频，或把 $t_{comb}$ 按最坏工艺角取值），所以这块电路实际会跑在 100 MHz 左右，117.6 MHz 那个数只是纸面上的天花板。这也解释了为什么手册标的频率总是整数，那是留过余量的结果。

一个反向问题：如果要求跑 200 MHz（周期 5 ns），三段预算只有 5 ns，而 $t_{co}+t_{su}$ 已经吃掉 3.5 ns，留给组合逻辑的只有 1.5 ns。这时候唯一的路是加流水线：把 5 ns 的组合逻辑切成两段，中间插一级触发器，代价是多一拍延迟。
:::

::: tip 例 5 · 亚稳态的残余概率 {#ex-ff-5}
题目：某触发器的时间常数 $\tau=0.2$ ns，时钟 100 MHz。若只用一级触发器采样异步信号，它为下一级留下多长时间落定？残余的亚稳态概率是多少？加一级同步器后呢？

先想什么：这题的关键不是公式，而是「留给它多少时间」这个量从哪来。答案是一个完整时钟周期，因为下一级只在下个沿才看它，所以它有一整拍去落定。先算周期，再算周期是 $\tau$ 的多少倍，最后取指数。

步骤：

1. 周期：$T=1/100\ \text{MHz}=10$ ns。
2. 以 $\tau$ 为单位：$10/0.2=50$，即 $50\tau$。
3. 残余概率：$e^{-50}\approx2\times10^{-22}$。*（为什么是指数：正反馈是指数式放大，每过 $\tau$ 偏差放大 $e$ 倍，所以要等 $n\tau$ 才能把概率压到 $e^{-n}$。）*
4. 加一级同步器：第一级有整整一拍去落定，第二级再采一次，两级都把概率乘上同一个因子，总残余概率是 $(e^{-50})^2=e^{-100}\approx4\times10^{-44}$。

验算：换个角度看数量级合不合理。假设该异步信号每秒跳变 $10^6$ 次（很激进的假设），那么每秒期望的亚稳态事件数是 $10^6\times2\times10^{-22}=2\times10^{-16}$ 次/秒，即平均 $5\times10^{15}$ 秒才发生一次，约 $1.6$ 亿年，远超设备寿命 ✓。

边界要记住：这个估算依赖 $\tau$ 的准确值，而 $\tau$ 随温度、电压、工艺角变化很大（高温低压时明显变差）。所以工程上算 MTBF 时不会用亿年这种数字自我安慰，而是按最坏条件算，并且把两级同步器当成最低标准而非优化项。
:::

## 八、工程实例

1. 按键消抖：机械按键松开时会抖动几毫秒。用两级 D 触发器串成同步器，再在时钟域里做「连续 N 拍都是同一值才认」，抖动就被滤掉了。单靠延时函数不行，因为延时期间的真按键会被吞掉，这就是开头第一个场景的答案。
2. 跨时钟域：两个不同频率的时钟域之间传一个信号，必须过同步器。这是唯一正确做法，直接连过去就是让目标触发器去采样一个随机相位的信号，亚稳态概率高到会真的出事。
3. 寄存器的本质：CPU 里的通用寄存器、ADC 的结果寄存器，都是一群共用时钟的 D 触发器。所谓写入寄存器，物理上就是在一个时钟沿上把数据抄进去。
4. 复位设计：几乎所有芯片手册都推荐异步复位、同步释放。你可以在很多 MCU 的复位电路里看到那两个串联的触发器，它们不干别的，只负责把复位释放对齐到时钟。
5. 频率上限：一颗标称 200 MHz 的 MCU，内部最长的组合逻辑路径决定了它跑不到 250 MHz。所谓超频，本质就是让信号在不足一个周期的时间内赶到，赌工艺和温度；赌输了的表现就是偶发计算错误，和亚稳态的症状一模一样。

## 九、易错清单（按踩坑频率排序）

1. 把电平触发当成边沿触发，仿真里会出现「一个时钟周期内翻好几次」，或者输出跟着输入乱动。先问它在高电平期间是不是透明的，透明就是锁存器。
2. 漏掉建立时间，算出的频率比实际能跑的高，实物偶发出错。永远用 $T\ge t_{co}+t_{comb}+t_{su}$，并且 $t_{comb}$ 取最大值、留余量。
3. 保持时间检查用了最大值，以为很安全，实际可能违规。**$t_h$ 这一侧用的是最小延迟**，建立时间 $t_{su}$ 那一侧才用最大延迟：$t_{co}+t_{comb,min}\ge t_h$。
4. 以为异步复位随时按都行，结果复位释放时踩进采样窗口，系统偶发进亚稳态。用异步复位、同步释放。
5. 把 $Q^n$ 的上标当成指数，代入时算成 $Q$ 的 $n$ 次方，整题作废。上标只是第几拍的编号。
6. RS 触发器同时给 $S=R=1$，$Q$ 与 $\bar Q$ 同时为低（或同时为高），互补关系被破坏，之后状态不可预测。记住约束 $SR=0$。
7. 认为两级同步器能消除亚稳态，高估可靠性，不算 MTBF。它只是把概率降到可接受，物理上无法消除。
8. 主从 JK 与边沿 JK 混用，主从结构有一次变化限制，高电平期间输入变两次结果就错。看清题目写的是主从还是边沿。

## 十、自检

合上页面自己说一遍：

1. 两个反相器接成一个环，为什么能存住一位？为什么说第三个解不稳定？
2. 电平触发和边沿触发的区别是什么？各自会出什么错？主从结构为什么不算边沿触发？
3. 一块电路 $t_{co}=1.8$ ns、$t_{comb}=4$ ns、$t_{su}=1.2$ ns，它能跑多快？如果要求跑 250 MHz，你会怎么改？

## 下一步

触发器解决了存一位，但一位几乎没用。真实系统要存一个字节、要数数、要按顺序搬数据。下一章把触发器成组用起来：计数器按节拍数数，寄存器按节拍搬数据。那里会第一次出现模这个概念，以及异步清零和同步清零之间那个差 1 的坑。

<Prereq id="setup-hold" /> → [06 · 计数器与寄存器](./counters.md)
