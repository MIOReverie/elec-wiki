---
title: 25 · 组合逻辑电路
description: 怎么一眼看出电路有没有记忆，按四步把图读成功能、按五步把需求画成图，再用一片 138 或 151 把化简整段省掉。
---

# 25 · 组合逻辑电路

<Meta time="35 min" level="了解" note="两个坑最深：把带反馈的电路当成组合逻辑；用 138 时忘了它的输出是低电平有效" />

两个真事，说的是同一件事。

老师要求做一个三人表决器，至少两人同意时输出 1。有人老老实实画三个与门、三个或门再加一堆非门，涂满半页；同桌只用一片 74LS138 加一个与非门，三根线接完。功能一模一样，器件数差了五倍，差在知不知道该用中规模器件。

另一件事：你按表达式 $Y=A+\overline{A}$ 搭了个电路，静态分析它恒等于 1，可示波器上每次输入翻转都冒一个 10 ns 的负脉冲。

怎么用最少的门实现功能，以及实现完了为什么还会骗人，是同一件事的两面。

> 📎 教材下册速览：这一篇是《电工学》下册第 25 章（组合逻辑电路）的压缩版。完整版见数字电路课 [04 · 组合逻辑电路](../../digital/combinational.md)，那里有译码器与选择器的完整设计和交互演示；化简工具见 [02 逻辑代数与卡诺图](../../digital/boolean-kmap.md)，器件层纪律见 [03 门电路](../../digital/gates.md)。

::: tip 读这页之前
会与、或、非三种运算，会读真值表（[24 · 数字电路基础](./digital-basic.md)），二进制和十六进制别生疏（<Prereq id="boolean-algebra" />），这页就跟得上。

符号先认：$A$、$B$、$C$ 是输入变量，$Y$ 是输出；$\overline{A}$ 是逻辑非，读作「A 非」；$m_i$ 是最小项，也就是第 $i$ 个输入组合对应的乘积项，三变量时 $m_5=\overline{A}B C$，编号 5 就是 `101` 的十进制值；$\sum m(\dots)$ 读作「这些最小项相或」；$\oplus$ 是异或。全部约定见[符号与约定](../../guide/notation.md)。

两个词各给一句话。组合逻辑的每个输出只由当前输入决定；时序逻辑的输出还取决于之前存下来的状态。这两句话就是整章的骨架。

触发器不用先学。这里所有电路都没有记忆元件，「记忆」那一半在 [26 · 触发器与时序电路](./sequential.md)。
:::

::: tip 规律层：组合逻辑的命门是「无记忆」
判断一个电路是不是组合逻辑，只问一句：输出会不会受上一次的影响？不会，输出纯粹是当前输入的函数，像一张查表。所以分析和设计其实是同一条流水线的两个方向；中规模器件（编码、译码、MUX、加法器）无非是把这条流水线的某一段固化进了芯片。
:::

## 一、判据：先问「有没有记忆」

怎么一眼看出一个电路是组合逻辑还是时序逻辑。

**组合逻辑**（combinational logic）指输出只由当前输入决定的电路：输入变，输出立刻跟着变；输入不变，输出就停在那里，跟历史上发生过什么无关。它的对立面是**时序逻辑**（sequential logic），输出还取决于电路内部存着的状态。

判据不在门数多少，而在有没有把输出接回输入。查的时候看 2 个地方：有没有存储元件，有没有反馈线。占一样，就可能带记忆。

<FigBox title="上：组合逻辑；下：时序逻辑（多了一个存储块与一条反馈）" kind="结构" note="两条路的输入端、输出端长得一样，差别只在下面那条多了一个存储块，并且输出被引回输入端。看到这种回环，就不能再用真值表直接描述整个电路了。">

<svg viewBox="0 0 470 232" role="img" aria-label="组合逻辑与时序逻辑的结构对比：时序逻辑多一个存储块和一条反馈线">
<defs>
  <marker id="cb-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="cb-ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="16" font-weight="700">组合逻辑：输出只看当前输入</text>
  <rect x="24" y="24" width="104" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="76" y="52" text-anchor="middle">输入</text>
  <line x1="130" y1="47" x2="172" y2="47" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-ar)" />
  <rect x="176" y="24" width="120" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="236" y="52" text-anchor="middle">组合网络（只有门）</text>
  <line x1="298" y1="47" x2="340" y2="47" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-ar)" />
  <rect x="344" y="24" width="104" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="396" y="52" text-anchor="middle">输出</text>

  <text x="24" y="106" font-weight="700">时序逻辑：输出还看「存着的那一位」</text>
  <rect x="24" y="114" width="104" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="76" y="142" text-anchor="middle">输入</text>
  <line x1="130" y1="137" x2="172" y2="137" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-ar)" />
  <rect x="176" y="114" width="120" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="236" y="142" text-anchor="middle">组合网络</text>
  <line x1="298" y1="137" x2="340" y2="137" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#cb-ar)" />
  <rect x="344" y="114" width="104" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="396" y="142" text-anchor="middle">输出</text>

  <rect x="176" y="188" width="120" height="34" rx="7" fill="none" stroke="var(--vp-c-text-3)" stroke-dasharray="5 4" />
  <text x="236" y="210" text-anchor="middle" fill="var(--vp-c-text-3)">存储（触发器）</text>
  <line x1="236" y1="188" x2="236" y2="164" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#cb-ar2)" />
  <path d="M 396 160 L 396 205 L 300 205" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#cb-ar2)" />
  <text x="410" y="196" fill="var(--vp-c-text-3)">反馈</text>
</g>
</svg>

</FigBox>

判据有了，拿到一张图之后按什么顺序读？顺序错了会白算一遍。

## 二、分析四步：从图到功能

给你一张门电路图，按固定顺序把它的功能说出来。

**真值表**（truth table）在这一步是终点：把输入的所有组合逐行列出，输出填在同一行。它不依赖任何化简技巧，是对电路功能的完整描述。四步是：

```
① 从输入到输出逐级写出表达式（每个门的输出都起个名字）
② 化简
③ 列真值表（2ⁿ 行，逐行代）
④ 归纳功能（用人话说：这是加法器？比较器？多数表决？）
```

给每个门的输出起名时，用 $N_1$、$N_2$ 这类临时记号就行，别把一整串括号直接嵌进式子里，不然化简到一半就看不清层次了。

顺序不能乱。先写表达式是为了把「级」压成「式」；式子里如果直接带中间变量，真值表就得逐级算，行数翻倍。先化简再列表还有个隐蔽的好处：化简后要是出现 $\overline{A}B + A\overline{B}$ 这类熟悉形状，功能往往一眼可辨，不必列完 8 行才发现是异或。

分析只考读懂，设计要反过来把它造出来。

## 三、设计五步：从功能到图

给你一句需求，走完五步，得到一张门电路图。

**最小项**（minterm）是与或式的基本砖块：一个包含全部输入变量、每个变量以原变量或反变量出现一次的乘积项。$n$ 个变量有 $2^n$ 个最小项，编号就是这个组合的十进制值。三变量的 $m_5$ 对应 `101`，所以 $m_5 = A\overline{B}C$。

| 编号 | $ABC$ | 最小项 | 编号 | $ABC$ | 最小项 |
| --- | --- | --- | --- | --- | --- |
| $m_0$ | 000 | $\overline{A}\overline{B}\overline{C}$ | $m_4$ | 100 | $A\overline{B}\overline{C}$ |
| $m_1$ | 001 | $\overline{A}\overline{B}C$ | $m_5$ | 101 | $A\overline{B}C$ |
| $m_2$ | 010 | $\overline{A}B\overline{C}$ | $m_6$ | 110 | $AB\overline{C}$ |
| $m_3$ | 011 | $\overline{A}BC$ | $m_7$ | 111 | $ABC$ |

五步是：

```
① 确定输入/输出变量，给每个取值赋含义（1 表示什么、0 表示什么）
② 列真值表（2ⁿ 行，一行都不许漏）
③ 写出表达式：从输出为 1 的每一行写一个最小项，全体相或（与或式）
④ 化简（卡诺图 / 公式法）
⑤ 画逻辑图（按手头有哪种门变换形式）
```

**与或式**（sum of products）读作「先与后或」：每个最小项是一个与项，最后全体相或。第 ③ 步能做得这么机械，是因为真值表里输出为 1 的那几行恰好就是让函数为 1 的全部条件。把它们并起来，自然覆盖所有为 1 的情形。

五步里最费时间的是第 ④ 步，而这一步有时可以整段跳过。

## 四、中规模器件：把化简这一步省掉

常考的就这 4 类器件，各有各的白送之处，认清这一点比记型号有用。

**编码器**（encoder）解决「多路里哪一路有信号」：输入 $2^n$ 根线，输出 $n$ 位二进制码。优先编码器（priority encoder）在几路同时有效时只编优先级最高的那一路，现实里总要有个先后，比如键盘同时按下两个键。以 8-3 线 74LS148 为例（输入低电平有效）：

$$
Y_2 = I_4+I_5+I_6+I_7,\quad Y_1 = I_2+I_3+I_6+I_7,\quad Y_0 = I_1+I_3+I_5+I_7
$$

**译码器**（decoder）反过来：输入 $n$ 位码，$2^n$ 个输出里只有一个有效。以 3-8 线 74LS138 为例，它的输出是低电平有效，被选中的那一路输出 0，其余全 1；另有使能端（enable，$G_1$、$\overline{G_{2A}}$、$\overline{G_{2B}}$），三个使能必须都满足，芯片才工作，否则所有输出恒为 1。

片子不够用的时候可以级联：两片 138 拼成 4-16 线译码器，用最高位那根变量去选片子，另一片靠使能端关掉，十六个输出就都有了。这个套路在存储器地址译码里天天见。

它的白送之处在于：8 个输出就是三变量的全部最小项，只是取反形式。于是任意三变量函数，只要把需要的那几路取出来与非一下就行：

$$
Y(A,B,C)=\sum m(1,3,5)=\overline{\overline{Y_1}\cdot\overline{Y_3}\cdot\overline{Y_5}}
$$

**数据选择器**（multiplexer，MUX）是从 $2^n$ 路数据里按地址选一路送到输出：

$$
Y=\sum_i m_i D_i
$$

以 8 选 1 的 74LS151 为例：三根地址线接 $A$、$B$、$C$，八个数据端按真值表填。真值表里 $Y=1$ 的那几行接 1，其余接 0，接完就是答案。

把地址端当逻辑变量、数据端按真值表接 0 或 1，它就成了一台通用函数发生器，连化简都不用做。74LS151 之所以常被拿来顶替 138，原因就在这儿：一片接完，一行式子都不用写。代价是器件浪费，这就是它和译码器路线的取舍：省脑子还是省芯片。

**加法器**是组合逻辑的样板工程：

- 半加器（half adder）：只加两个本位，$S=A\oplus B$，$C=AB$，不考虑低位来的进位；
- 全加器（full adder）：再加一个进位输入 $C_{in}$，$S=A\oplus B\oplus C_{in}$，$C_{out}=AB+(A\oplus B)C_{in}$；
- 多位加法有两种进位组织方式：串行进位让低位进位一级级传，慢；超前进位并行算出各位进位，快。

这几类器件在真板子上常常连着用：计数器后面接译码器去驱动数码管，加法器后面接比较器判溢出，选择器夹在中间负责切换信号来源。把单片看懂了，再看整块板子就不慌。

**数值比较器**（comparator）比较两个二进制数的大小：1 位时 $A>B$ 就是 $A\overline{B}$；多位从高位往低位比，高位分出胜负就不再管低位。

<DemoBox title="一片芯片三种用法：全加器、2-4 译码器、4 选 1 选择器" hint="切换三个模式，改输入看输出。注意译码器那一栏永远只有一个输出为 1（高有效版本），选择器那一栏则是把地址当变量在用。">
  <CombinationalDemo />
</DemoBox>

器件本身没错，错的是「多个信号同时变」时的时序。

## 五、竞争冒险：恒为 1 的输出为什么冒负脉冲

一个理论上永远输出 1 的电路，为什么示波器上每次输入翻转都冒一个窄脉冲。

**竞争**（race）指同一个信号经不同路径到达同一个门的时间不同；**冒险**（hazard）指竞争造成的错误输出；那个窄脉冲俗称**毛刺**（glitch）。判据很具体：表达式里某个变量同时以原变量和反变量出现，且两条路径延迟不等，就可能冒险。最典型的是 $Y=A+\overline{A}$，静态看恒为 1，动态时 A 先变、$\overline{A}$ 后变，中间那一小段两个输入都是 0，输出就掉下去了。这段错开的时间通常只有 1~5 ns，可下游的计数器照样会把它当成一个有效脉冲。凡是式子里出现 $A+\overline{A}$ 这种形状，就要停一下想一想。

<FigBox title="毛刺是怎么冒出来的：两条路径差一个门延迟" kind="时序" note="A 下降、经过一个非门后 Ā 才上升。在这段错开的时间里，或门的两个输入同时为 0，输出就出现一个负脉冲。脉冲宽度约等于两条路径的延迟差——所以它随工艺、温度、批次变，静态分析永远看不见它。">

<svg viewBox="0 0 470 214" role="img" aria-label="时序图：A 下降、非门延迟后 A 非才上升，或门输出在两条路径错开的空隙里出现负脉冲">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="44" y="36" text-anchor="end">A</text>
  <text x="44" y="100" text-anchor="end">Ā</text>
  <text x="44" y="152" text-anchor="end">Y = A+Ā</text>

  <polyline points="56,22 150,22 150,44 450,44" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <polyline points="56,104 160,104 160,82 450,82" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <polyline points="56,146 150,146 150,168 160,168 160,146 450,146" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />

  <line x1="150" y1="10" x2="150" y2="188" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <line x1="160" y1="10" x2="160" y2="188" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="140" y="204" text-anchor="middle" fill="var(--vp-c-text-3)">两条路径差 t_pd</text>
  <text x="240" y="140" fill="var(--vp-c-text-3)">← 这里两个输入同时为 0</text>
  <text x="250" y="204" fill="var(--vp-c-text-3)">静态看 Y ≡ 1，实际却冒负脉冲</text>
</g>
</svg>

</FigBox>

消除的办法书上有 3 种，按工程上从便宜到彻底的顺序排：

1. 加冗余项（在卡诺图上补一个多余的圈）：给 $Y=AB+\overline{A}C$ 补上 $BC$ 这一项。它平时被另外两项覆盖、不影响函数值，但当 $B=C=1$、$A$ 正在翻转时 $BC$ 始终为 1，毛刺就被兜住了。代价是多一个门。
2. 加滤波电容：靠电容把窄脉冲磨平，最简单，但会拖慢边沿，高速电路不能用。
3. 加选通脉冲：等信号稳定之后再取样，本质是把「什么时候读输出」这件事推迟到毛刺之后。

工程上还有一条退路：把整个功能塞进一片 CPLD 或者交给单片机查表，竞争就不存在了，因为结果不再由门延迟决定。这条路这里不展开，但知道它存在，遇到怎么改都去不掉的毛刺时就不会死磕。

顺便说一句，反馈本身不坏。振荡器就是靠反馈起振的，那是故意的、想要的；只有在你以为它是组合逻辑的时候，反馈才变成麻烦。

判据、流程、器件与陷阱，四件事齐了。用两道题把它们串成动作。

## 六、例题

两道题方向相反。例 1 用现成芯片实现函数，省掉化简；例 2 从需求画到图，走完五步。每道题都先看先想什么，那是方法选择。

::: tip 例 1 · 用 74LS138 实现 $Y=\sum m(1,3,5)$

题目：只用一片 74LS138 和一个门，实现三变量函数 $Y=\sum m(1,3,5)$。

先想什么：题目没要求门数最少，只要求用 138，这就是提示，别去化简，直接把最小项拿来用。138 的 8 个输出恰好是三变量的全部最小项（低有效），所以 $Y$ 等于「$m_1,m_3,m_5$ 里至少一个为真」，也就是三个低有效输出里至少一个为 0。这个逻辑正是与非门。

<FigBox title="接线图：地址端接变量，三个输出进一个与非门" kind="结构" note="138 的输出端画了小圆圈，表示低电平有效：输入为 i 时只有第 i 路输出 0，其余全 1。所以「至少一路为 0」等价于与非门「有 0 出 1」。使能端三个都必须接有效电平，漏接一个芯片就不工作。">

<svg viewBox="0 0 470 236" role="img" aria-label="用 74LS138 实现三变量函数：A B C 接地址端，Y1 Y3 Y5 三个低有效输出接三输入与非门">
<defs>
  <marker id="dc-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="168" y="40" width="132" height="150" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="234" y="62" text-anchor="middle" font-weight="700">74LS138</text>
  <text x="234" y="78" text-anchor="middle" fill="var(--vp-c-text-3)">3-8 线译码器</text>

  <text x="60" y="102" text-anchor="end">A（高位）</text>
  <text x="60" y="130" text-anchor="end">B</text>
  <text x="60" y="158" text-anchor="end">C（低位）</text>
  <line x1="64" y1="98" x2="164" y2="98" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#dc-ar)" />
  <line x1="64" y1="126" x2="164" y2="126" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#dc-ar)" />
  <line x1="64" y1="154" x2="164" y2="154" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#dc-ar)" />

  <text x="234" y="205" text-anchor="middle" fill="var(--vp-c-text-3)">G₁ = 1，G̅₂A = 0，G̅₂B = 0（三个使能都要满足）</text>

  <circle cx="304" cy="72" r="4" fill="none" stroke="var(--vp-c-brand-1)" />
  <circle cx="304" cy="106" r="4" fill="none" stroke="var(--vp-c-brand-1)" />
  <circle cx="304" cy="140" r="4" fill="none" stroke="var(--vp-c-brand-1)" />
  <circle cx="304" cy="174" r="4" fill="none" stroke="var(--vp-c-text-3)" />
  <text x="314" y="76" fill="var(--vp-c-brand-1)">Y₁</text>
  <text x="314" y="110" fill="var(--vp-c-brand-1)">Y₃</text>
  <text x="314" y="144" fill="var(--vp-c-brand-1)">Y₅</text>
  <text x="314" y="178" fill="var(--vp-c-text-3)">其余 Y 空着</text>

  <path d="M 310 72 L 360 72 L 360 96" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <path d="M 310 106 L 348 106 L 348 112" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <path d="M 310 140 L 336 140 L 336 128" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />

  <path d="M 336 96 L 336 128 L 372 112" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <circle cx="352" cy="112" r="3.4" fill="none" stroke="var(--vp-c-brand-1)" />
  <text x="352" y="94" text-anchor="middle" fill="var(--vp-c-text-3)">与非门</text>
  <line x1="376" y1="112" x2="428" y2="112" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#dc-ar)" />
  <text x="434" y="116" fill="var(--vp-c-brand-1)">Y</text>
</g>
</svg>

</FigBox>

步骤：

1. 地址端接线：题目说 $A$ 是最高位，所以 $A\to$ 138 的最高地址端，$C\to$ 最低地址端。*（为什么必须按位序接：地址端接反时输入码与实际最小项编号错位，八个输出全乱。）*
2. 使能端接有效电平：$G_1=1$、$\overline{G_{2A}}=0$、$\overline{G_{2B}}=0$。*（为什么单独强调：138 不使能时所有输出恒为 1，此时 $Y$ 恒为 0，现象是「完全没反应」，非常难查。）*
3. 三个需要的输出 $\overline{Y_1}$、$\overline{Y_3}$、$\overline{Y_5}$ 接到三输入与非门。*（为什么用与非门而不是与门：输出低有效，1 在输出上表现为 0，所以「取或」要变成「取与非」。）*
4. 写出表达式：$Y=\overline{\overline{Y_1}\cdot\overline{Y_3}\cdot\overline{Y_5}}$。

验算，逐行对：$ABC=001$ 时 $\overline{Y_1}=0$，与非门「有 0 出 1」，$Y=1$ ✓；$011$、$101$ 同理为 1 ✓；其余五种输入时三个输出全为 1，与非门输出 0 ✓。八行全部吻合。

万一手头只有与门：每个输出后各串一级非门，把 $\overline{Y_i}$ 变回 $Y_i$，再用或门合并。功能相同，多三个门。这就是「按手头器件变形」那一步的实际含义。
:::

::: tip 例 2 · 设计三人表决器

题目：三个人各投一票（赞成 = 1），多数赞成时通过（$Y=1$）。按设计五步走一遍。

先想什么：三个输入、一个输出，需求是「1 的个数 ≥ 2」。这是一句关于个数的话，不是关于某个变量的话，所以真值表按「数 1 的个数」填，比硬背快；化简之后期望得到三项，每项对应「某两人同时赞成」。

<FigBox title="卡诺图上的三个两格圈：AB、BC、CA" kind="结构" note="四个 1 在图上构成阶梯形。三个圈各覆盖一对相邻格，每个圈消掉一个变化的变量：圈 AB 的两格 C 在变；圈 BC 的两格 A 在变；圈 CA 的两格 B 在变。三个圈相或就是答案。">

<svg viewBox="0 0 470 272" role="img" aria-label="三人表决器的卡诺图：m3 m5 m6 m7 为 1，圈出 AB、BC、CA 三个两格圈">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="112" y="40" text-anchor="end" fill="var(--vp-c-text-3)">AB \ C</text>
  <text x="147" y="40" text-anchor="middle" fill="var(--vp-c-text-3)">C = 0</text>
  <text x="201" y="40" text-anchor="middle" fill="var(--vp-c-text-3)">C = 1</text>

  <text x="112" y="76" text-anchor="end">00</text>
  <text x="112" y="120" text-anchor="end">01</text>
  <text x="112" y="164" text-anchor="end">11</text>
  <text x="112" y="208" text-anchor="end">10</text>

  <rect x="120" y="50" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="50" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="120" y="94" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="94" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="120" y="138" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="174" y="138" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="120" y="182" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="182" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />

  <text x="147" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="201" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="147" y="120" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="201" y="120" text-anchor="middle" font-size="15" font-weight="700">1</text>
  <text x="147" y="164" text-anchor="middle" font-size="15" font-weight="700">1</text>
  <text x="201" y="164" text-anchor="middle" font-size="15" font-weight="700">1</text>
  <text x="147" y="208" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="201" y="208" text-anchor="middle" font-size="15" font-weight="700">1</text>

  <rect x="116" y="134" width="116" height="52" rx="12" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" stroke-dasharray="6 4" />
  <rect x="170" y="90" width="62" height="96" rx="12" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="2 3" />
  <rect x="170" y="134" width="62" height="96" rx="12" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.6" stroke-dasharray="6 2 2 2" />

  <text x="250" y="112" fill="var(--vp-c-brand-1)">AB：行 11 的两格（C 在变）</text>
  <text x="250" y="136" fill="var(--vp-c-text-2)">BC：列 1 的 01、11（A 在变）</text>
  <text x="250" y="160" fill="var(--vp-c-text-3)">CA：列 1 的 11、10（B 在变）</text>
  <text x="250" y="192" fill="var(--vp-c-text-3)">三圈相或 → Y = AB + BC + CA</text>
  <text x="18" y="244" fill="var(--vp-c-text-3)">m₃=011 → 行 01 列 1；m₅=101 → 行 10 列 1</text>
  <text x="18" y="262" fill="var(--vp-c-text-3)">m₆=110 → 行 11 列 0；m₇=111 → 行 11 列 1</text>
</g>
</svg>

</FigBox>

步骤：

1. 定变量：输入 $A$、$B$、$C$（各代表一个人的票，1 = 赞成），输出 $Y$（1 = 通过）。*（为什么先赋值含义：不写清 1 代表什么，真值表填到一半就会犹豫。）*
2. 列真值表，输出为 1 的行是「1 的个数 ≥ 2」，一共四行：

| $A$ | $B$ | $C$ | $Y$ | 赞成的票数 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 1 | 1 | 2 |
| 1 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 1 | 2 |
| 1 | 1 | 0 | 1 | 2 |
| 1 | 1 | 1 | 1 | 3 |

3. 写与或式：$Y=m_3+m_5+m_6+m_7=\overline{A}BC+A\overline{B}C+AB\overline{C}+ABC$。*（为什么四行都写：与或式不做任何取舍，是照抄真值表的结果。）*
4. 卡诺图化简：四个 1 构成阶梯，圈出三个两格圈，得 $Y=AB+BC+CA$。*（为什么是三项：每个圈消一个变量，三个圈对应三种「两人同时赞成」的情形。）*
5. 画逻辑图：三个两输入与门分别接 $AB$、$BC$、$CA$，输出接一个三输入或门。*（若只有与非门：把或门换成「与非 + 非」两级，功能不变。）*

验算：八行逐一代入 $Y=AB+BC+CA$，$Y=1$ 当且仅当至少两个输入为 1，与真值表一致 ✓。再抽查 $ABC=110$：$AB=1$ 就出 1 ✓，而 $BC=0$、$CA=0$，说明三项之间是或不是与，这一步能抓出把或门画成与门的错。

一句记牢：所有「多数」「至少几个」的需求，化简后都会变成「两两组合」的样子，可以直接当结论记住。
:::

## 考点速记

| 考法 | 做法 |
| --- | --- |
| 分析电路功能 | 逐级写表达式 → 化简 → 列真值表 → 用人话归纳 |
| 设计电路 | 定变量 → 真值表 → 与或式 → 卡诺图 → 逻辑图 |
| 判断组合 / 时序 | 看输出是否受「上一次」影响，有没有反馈与存储 |
| 用 138 实现函数 | $Y=\overline{\prod \overline{Y_i}}$，使能端别忘接 |
| 用 151 实现函数 | 地址接变量，数据端按真值表接 0/1，不用化简 |
| 判断 / 消除冒险 | 找 $A+\overline{A}$ 型结构 → 加冗余项 / 滤波 / 选通 |

## 易错清单

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. 把带反馈的电路当组合逻辑 → 列出的真值表与实际输出对不上，越算越乱 → 先找有没有输出回流到输入，有就按时序电路分析。
2. 用 138 实现函数时忘了输出低有效 → 用与门去合并，得到的是原函数的反 → 用与非门合并；只有与门时先各串一级非门。
3. 使能端漏接或接反 → 芯片不工作，所有输出恒 1，表现出来是「完全没反应」 → 三个使能端按有效电平接死。
4. 优先编码器的优先级搞反 → 编码结果指向错的那一路 → 通常下标大的优先（$I_7$ 最高），查手册确认。
5. 真值表漏行 → $n$ 变量只写了 $2^n-2$ 行，化简出错的项找不到来源 → 习惯按 000、001、010…顺序写满。
6. 卡诺图圈 3 格或 5 格 → 写出的项变量个数对不上 → 圈只能是 $2^k$ 格。
7. 以为静态分析正确就没问题 → 实际电路在输入翻转瞬间冒毛刺，下游误触发 → 检查 $A+\overline{A}$ 型结构，必要时加冗余项。

## 自检

答案不在下面，自己说一遍。

1. 一个八输入、三输出的电路，所有门都没有反馈，它一定是组合逻辑吗？为什么？
2. 为什么译码器的输出「就是全部最小项」？低电平有效这件事让表达式多了什么？
3. 表达式 $Y=AB+\overline{A}C$ 里有没有竞争冒险的可能？如果有，冗余项应该加哪一项？

## 下一步

设计里的图是画在纸上的，可真正的电路还要在时钟沿上把结果存住。那个能力属于触发器。

<Prereq id="flip-flop" /> → [26 · 触发器与时序电路](./sequential.md)
