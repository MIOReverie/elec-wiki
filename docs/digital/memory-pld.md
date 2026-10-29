---
title: 07 · 存储器与可编程逻辑
description: 一颗 1K×4 的芯片怎么拼成 4K×8，几颗芯片怎么共用一根数据线而不打架，可编程逻辑又把什么东西写进了硅片。地址译码、位扩展与字扩展、三态与开漏、PAL 到 FPGA 的谱系，都在这一页。
---

# 07 · 存储器与可编程逻辑

<Meta time="50 min" level="核心" note="两个坑最深：位扩展与字扩展搞反，以及以为 DRAM 刷新会改写数据" />

::: tip 读这页之前
要会布尔代数与化简（<Prereq id="boolean-algebra" />）、卡诺图与最小项（<Prereq id="kmap" />）、触发器与次态（<Prereq id="flip-flop" />）。这里不再讲化简，只讲化简的结果怎么变成硬件。

符号先对一遍：$A_{n}\sim A_0$ 是地址线（address bus：CPU 送进芯片的「第几个存储单元」的编号，最低位是 $A_0$）；$D_{n}\sim D_0$ 是数据线（data bus：真正存进去或读出来的位）；$V_{ref}$ 是参考电压；容量写成「字数 × 位数」，如 $1\text{K}\times8$ 表示 1024 个字、每字 8 位。全部约定见[符号与约定](../guide/notation.md)。

四个词就地解释：字（word）是芯片一次读写的那个单元，也是「几个字」的单位；位（bit）是一个字里的 1 位，也是「几位」的单位；RAM（random access memory）是读写任意地址耗时相同的那一类存储器；PLD（programmable logic device）是可以通过下载配置改变功能的逻辑芯片。

算术上只会用到 $\log_2$ 与向上取整：地址线数 $=\log_2(\text{字数})$。
:::

你手上的手机有 8 GB 内存，主板上却看不见一颗 8 GB 的芯片，只有一排小方块。为什么？因为 DRAM 厂根本不做大容量的单颗芯片，8 GB 是靠几十片 1 GB 的芯片并起来的：几十片共享同一组地址线，再按片分组轮流应答。

这不是特例。存储器的扩容只有两种手法，而两种手法对应的接线方式完全不同：位扩展是几片同时工作、拼宽一根数据线；字扩展是一次只选中一片。搞混这两者，是这门课里最高频的错误之一。

## 一、从 1 个触发器到一座存储器

一颗 1K×8 的芯片，内部到底由什么拼出来？回想[触发器](./flip-flops.md)：一个 D 触发器存 1 位。要存 8 个字 × 4 位，就把 32 个触发器排成 8 行 4 列的矩阵。问题只剩一个：每次操作到底对准哪一行？

答案就是地址译码（address decoding：把一串二进制地址翻译成一组「选通信号」的过程）。3 根地址线 $A_2A_1A_0$ 经 3-8 译码器产生 8 根字选线（word line：每一根负责选通矩阵里的一行），只有被选中的那一行能和数据线连通。三块骨架于是长这样：

<FigBox title="存储器的通用骨架：矩阵 + 译码器 + 读写控制" kind="结构" note="地址进译码器，选出一根字选线；被选中的那一行存储单元才和数据线连通；读写控制决定这次是往里写还是往外读。ROM 与 RAM、SRAM 与 DRAM 的差别，全部出现在这三块里的具体实现上。">

<svg viewBox="0 0 560 250" role="img" aria-label="存储器骨架：地址线进入译码器产生字选线指向存储矩阵，读写控制控制数据线的方向">
  <defs>
    <marker id="mp-ar1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
    </marker>
    <marker id="mp-ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
    </marker>
  </defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <rect x="20" y="88" width="66" height="46" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="53" y="106" text-anchor="middle">地址线</text>
    <text x="53" y="124" text-anchor="middle" fill="var(--vp-c-text-3)">A₂ A₁ A₀</text>
    <line x1="88" y1="111" x2="132" y2="111" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#mp-ar1)" />
    <rect x="134" y="76" width="96" height="70" rx="8" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="182" y="104" text-anchor="middle" font-weight="700">3-8 译码器</text>
    <text x="182" y="124" text-anchor="middle" fill="var(--vp-c-text-3)">地址译码</text>
    <line x1="232" y1="96" x2="286" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#mp-ar1)" />
    <line x1="232" y1="111" x2="286" y2="111" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#mp-ar1)" />
    <line x1="232" y1="126" x2="286" y2="162" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#mp-ar1)" />
    <text x="258" y="50" text-anchor="middle" fill="var(--vp-c-text-3)">字选线</text>
    <rect x="288" y="42" width="180" height="140" rx="8" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.6" />
    <text x="150" y="212" text-anchor="middle" fill="var(--vp-c-text-3)">存储矩阵：8 行 × 4 列</text>
    <g stroke="var(--vp-c-divider)" stroke-width="1.1">
      <line x1="290" y1="60" x2="420" y2="60" />
      <line x1="290" y1="86" x2="420" y2="86" />
      <line x1="290" y1="112" x2="420" y2="112" />
      <line x1="290" y1="138" x2="420" y2="138" />
      <line x1="290" y1="164" x2="420" y2="164" />
      <line x1="336" y1="52" x2="336" y2="176" />
      <line x1="364" y1="52" x2="364" y2="176" />
      <line x1="392" y1="52" x2="392" y2="176" />
      <line x1="420" y1="52" x2="420" y2="176" />
      <line x1="336" y1="176" x2="420" y2="176" />
    </g>
    <g fill="var(--vp-c-brand-1)">
      <circle cx="316" cy="60" r="3" /><circle cx="316" cy="86" r="3" />
      <circle cx="316" cy="112" r="3" /><circle cx="316" cy="138" r="3" />
      <circle cx="316" cy="164" r="3" />
    </g>
    <text x="300" y="52" text-anchor="end" fill="var(--vp-c-text-3)">W₀</text>
    <text x="300" y="78" text-anchor="end" fill="var(--vp-c-text-3)">W₁</text>
    <text x="300" y="104" text-anchor="end" fill="var(--vp-c-text-3)">W₂</text>
    <text x="300" y="130" text-anchor="end" fill="var(--vp-c-text-3)">W₃</text>
    <text x="300" y="156" text-anchor="end" fill="var(--vp-c-text-3)">…</text>
    <line x1="420" y1="176" x2="486" y2="176" stroke="var(--vp-c-text-3)" stroke-width="1.6" marker-end="url(#mp-ar2)" />
    <text x="500" y="172" text-anchor="middle" fill="var(--vp-c-text-3)">数据线</text>
    <text x="500" y="188" text-anchor="middle" fill="var(--vp-c-text-3)">D₃…D₀</text>
    <rect x="286" y="206" width="120" height="30" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="346" y="226" text-anchor="middle">读写控制 WE</text>
    <text x="470" y="230" text-anchor="middle" fill="var(--vp-c-text-3)">WE=1 写 / WE=0 读</text>
  </g>
</svg>

</FigBox>

<DemoBox title="存储矩阵：地址选行、行列交叉定单元" hint="拖地址看译码器选中哪一行，写入数据再读回；切到 DRAM 看电荷衰减、点刷新续命但不改数据。">
  <MemoryDemo />
</DemoBox>

拖动地址滑块，观察译码器选中哪一行；点「写入」把数据按钮的状态存进去，再拖到别的地址读回来，数据不会跑。切到 DRAM 会看到电荷一路衰减、归零即丢失，点刷新可以续命但不改数据。

往下就分两条路了：触发器保持（SRAM，不断电就一直在）与电容保持（DRAM，电荷会漏，于是有了刷新）。ROM 更简单，数据在制造或编程时就固定，只有读通道。

## 二、ROM 与 RAM：两类器件的分工

手机内存断电就清零，手机闪存断电还在，就是这个分工。闪存属于 $\text{E}^2\text{PROM}$ 这一路，内存属于 RAM 这一路。

| 类别 | 内容 | 典型器件 | 掉电后 | 写入特点 |
| --- | --- | --- | --- | --- |
| ROM | 只读 | PROM、EPROM、$\text{E}^2\text{PROM}$、Flash | **不丢** | PROM 一次写；EPROM 靠紫外线擦（整片擦）；$\text{E}^2\text{PROM}$/Flash 靠电擦（可按字节） |
| RAM | 随机读写 | SRAM、DRAM | **即失** | 随时可写，次数基本不限 |

ROM 这一族内部是一条清晰的演进线，擦除方式一代比一代省事。EPROM 需要把芯片从板子上取下来放到紫外灯下照几十分钟；$\text{E}^2\text{PROM}$（Electrically Erasable Programmable ROM，电可擦可编程只读存储器）用电脉冲擦；Flash 更进一步，按扇区擦。U 盘、SSD 的核心就是这个「电擦 + 不丢」的组合。

RAM 这一族的分歧在用什么存一位：

- SRAM（static RAM，静态随机存取存储器）：用交叉耦合的反相器对当存储单元，两个门互相锁死，只要供电数据就在。访问速度几 ns，集成密度低、单价高。
- DRAM（dynamic RAM，动态随机存取存储器）：每一位只是一个 MOS 管的栅电容加一个刷新用的放大器。电容会漏电，数据活不长，必须定时补。

价格差一位数，速度也差一位数，各取所需：SRAM 做缓存，DRAM 做主存。

材料方案定了，最慢的那一类还得撑住：DRAM 的电荷会漏，所以它得不停给自己续命。

## 三、DRAM 为什么必须刷新

SRAM 的触发器是一个双稳态环路，只要供电就自己保持；DRAM 的每一位只是 MOS 管栅电容上的电荷，漏电流会让它在毫秒量级内流光。所以 DRAM 控制器要在刷新周期内（通常 $15\sim64\,\mu\text{s}$ 刷一行、整个存储体数 ms 内刷完一遍）不断做「读出→放大→写回」。

<FigBox title="DRAM 刷新：轮流读出一行，放大后写回" kind="结构" note="刷新是按行轮流的——同一时刻只处理一行，其余行靠电容自己撑住。整个存储体被扫完一遍的时间必须短于数据能撑住的时间，这就是刷新周期上限的由来。">

<svg viewBox="0 0 540 220" role="img" aria-label="DRAM 刷新时间轴：按行轮流刷新，1024 行在 64 毫秒内被扫完，每行间隔 62.5 微秒">
<defs>
  <marker id="mp-ar2b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="60" y1="40" x2="60" y2="150" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <line x1="60" y1="40" x2="520" y2="40" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <text x="52" y="44" text-anchor="end" fill="var(--vp-c-text-3)">t</text>
    <rect x="70" y="62" width="60" height="18" rx="3" fill="var(--vp-c-brand-1)" opacity="0.85" />
    <text x="100" y="75" text-anchor="middle" fill="var(--vp-c-bg)">刷 W₀</text>
    <rect x="150" y="62" width="60" height="18" rx="3" fill="var(--vp-c-brand-1)" opacity="0.7" />
    <text x="180" y="75" text-anchor="middle" fill="var(--vp-c-bg)">刷 W₁</text>
    <rect x="230" y="62" width="60" height="18" rx="3" fill="var(--vp-c-brand-1)" opacity="0.55" />
    <text x="260" y="75" text-anchor="middle" fill="var(--vp-c-bg)">刷 W₂</text>
    <text x="320" y="75" fill="var(--vp-c-text-3)">… 依次扫过 1024 行 …</text>
    <rect x="440" y="62" width="60" height="18" rx="3" fill="var(--vp-c-brand-1)" opacity="0.4" />
    <text x="470" y="75" text-anchor="middle" fill="var(--vp-c-bg)">刷 W₁₀₂₃</text>
    <line x1="60" y1="110" x2="520" y2="110" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 4" />
    <text x="290" y="126" text-anchor="middle" fill="var(--vp-c-text-3)">一轮扫完 = 64 ms（刷新周期上限）</text>
    <line x1="60" y1="150" x2="130" y2="150" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#mp-ar2b)" />
    <text x="95" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">62.5 µs</text>
    <text x="95" y="184" text-anchor="middle" fill="var(--vp-c-text-3)">相邻两行的间隔</text>
    <text x="300" y="200" text-anchor="middle" fill="var(--vp-c-text-3)">刷新期间存储器没空接待 CPU —— 这正是 DRAM 延迟抖动的来源</text>
  </g>
</svg>

</FigBox>

**刷新不改写数据**。它只是把电容上衰减掉的电荷读出来、放大、再写回去，内容一个 bit 都不变。「刷新 = 清空」是最常见的误解。

到这里，三种材料方案（Flash / SRAM / DRAM）都清楚了。但还有一件事没解决：好几颗芯片怎么共用同一根数据线。

## 四、总线上的多颗芯片：三态与开漏

CPU 内存条上有 8 颗芯片，它们都连在同一组数据线上，为什么不会互相打架？换成 4 颗、16 颗，道理也一样。

三态门（tri-state gate：在普通输出的 0、1 之外，多输出一个高阻态 Z 的门电路）的输出有三种状态：低电平、高电平、高阻 Z（high impedance：既不拉高也不拉低，等效于从这条线上断开）。多颗芯片共用数据线时，靠一个使能端（enable：决定这颗芯片此刻该不该说话的控制输入）来调度：同一时刻只有 1 颗芯片使能有效、其余全在高阻 Z，总线上就不会出现冲突。

开漏输出（open-drain，OD：输出端只有下拉管、没有上拉管的门输出）是另一条路：它只能把总线拉低，永远不会主动拉高。要得到高电平，必须外挂一只上拉电阻（pull-up resistor：从 $V_{CC}$ 拉到总线的那只电阻）。好处有两个。多个开漏输出并在一起时，谁都不拉低，总线就被上拉电阻拉成高，这叫线与（wired-AND）；上拉到几伏就能和几伏的器件通信，这就是电平转换。

<DemoBox title="三态总线 vs 开漏线与：两种共享一条线的玩法" hint="切换两种模式，逐个开关各设备的 EN，看总线变成 0 / 1 / 高阻 Z 还是冲突。重点试『A、B 冲突驱动』和『开漏都释放』两个一键场景。">
  <TriStateBusDemo />
</DemoBox>

这 2 种共享方式的规则完全不同：

| | 三态门 | 开漏输出 |
| --- | --- | --- |
| 高电平怎么来的 | 输出管主动拉高 | **靠上拉电阻** |
| 多个设备同时输出不同值 | 冲突，电流灌进器件 | 不冲突：谁拉低谁赢（线与） |
| 是否必须仲裁 | **必须**，同一时刻至多一个使能 | 不需要仲裁，但需要上拉电阻 |
| 上升沿速度 | 快 | 慢（由 $R_p$ 与总线电容决定） |
| 典型用途 | 处理器地址/数据总线 | I²C、SMBus、复位信号 |

这两条路的完整推导与上拉电阻的取值计算，在[03 · 门电路与集成器件](./gates.md)第四、五节展开。这里只要记住一句判断：能不能有两个设备同时输出高电平？能，用三态，但要仲裁；不能，用开漏，但要上拉。

共享一根线的问题解决之后，剩下的问题是：能不能干脆不焊电路，直接让芯片实现我想要的逻辑。

## 五、PLD：把电路写进芯片

前面几章的组合、时序逻辑，都是拿现成门电路和触发器在面包板上搭。PLD（programmable logic device，可编程逻辑器件）换了个思路：芯片内部就是一大堆可配置的与或阵列加触发器，配置数据由你下载，逻辑改一版只要重新烧一次，不动烙铁。

| 类型 | 结构特点 | 可重复编程 | 典型规模 | 一句话定位 |
| --- | --- | --- | --- | --- |
| PAL | 与或阵列，输出固定 | 否（熔丝） | 数百门 | PLD 的开山之作 |
| GAL | 与或阵列 + 输出宏单元可定义 | **是**（电擦） | 数百门 | 实验室常客，一片顶多片 |
| CPLD | 多个 PAL 块 + 全局布线 | 是 | 数千～数万门 | 延时确定，适合控制类逻辑 |
| FPGA | **LUT + 触发器** 阵列 + 丰富布线 | 是（多数） | 数万～数百万门 | 数字系统的主力，能装下整个 CPU |

LUT（lookup table，查找表）是 FPGA 的灵魂：一个 4 输入 LUT 内部存着 16 位配置数据，等于一张真值表。外部给 4 位输入，它按表查出 1 位输出。任何 4 变量组合函数，改数据就能改逻辑。把几十万个 LUT 配上触发器、RAM 块和布线，就是一片 FPGA。

LUT 里那张真值表正是卡诺图的老故事：逻辑被拆成与项、或项，再映射到硬件。回头再看 <Prereq id="kmap" /> 就明白，PLD 的与或阵列和 LUT 不过是布尔化简的硬件实现。

开发流程是固定的五步：

1. 用 Verilog/VHDL 写 HDL；
2. 综合成门级网表；
3. 布局布线，映射到具体芯片；
4. 生成配置比特流；
5. 下载。掉电丢失的还要外挂 Flash/EEPROM 启动加载。

写法与工具链见[09 · 从逻辑到芯片：Verilog 与 FPGA 入门](./09-verilog-fpga.md)。

存储器按容量卖，可编程逻辑按逻辑卖，分工到此就清楚了。下面四道题把容量、接线与刷新算一遍。

## 六、例题

四道题按先算容量、再扩展、再接线、最后算刷新的顺序排。每题先写「先想什么」，那是方法选择，比算出数字更重要。

::: tip 例 1 · 位扩展与字扩展：用 2114（$1\text{K}\times4$）搭 $4\text{K}\times8$ {#ex-mpld-1}
题目：某 SRAM 芯片为 2114，容量 $1\text{K}\times4$（1024 字 × 4 位）。要用它组成 $4\text{K}\times8$ 的存储器，需要几片？怎么接线？

先想什么：目标容量 ÷ 单片容量 = 总片数，但不能一步除完，容量有两个维度（字数、位数），必须先拆位、再拆字，两个维度分开扩展。

<FigBox title="两级扩展：先位后字" kind="结构" note="第一级用 2 片 1K×4 并成 1K×8（数据线拼高 4 位与低 4 位，两片同时工作）；第二级把 4 组这样的「组」用高位地址译码选片，一次只选中一组。">

<svg viewBox="0 0 560 260" role="img" aria-label="位扩展与字扩展：两片 1K 乘 4 拼成 1K 乘 8，再由四组经译码器组成 4K 乘 8">
  <defs>
    <marker id="mp-ar3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
    </marker>
  </defs>
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <text x="130" y="24" text-anchor="middle" font-weight="700">第一步：位扩展 → 1K×8</text>
    <rect x="30" y="36" width="100" height="54" rx="7" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="80" y="58" text-anchor="middle">2114 #1</text>
    <text x="80" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">D₃…D₀</text>
    <rect x="30" y="104" width="100" height="54" rx="7" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="80" y="126" text-anchor="middle">2114 #2</text>
    <text x="80" y="144" text-anchor="middle" fill="var(--vp-c-text-3)">D₇…D₄</text>
    <line x1="132" y1="63" x2="188" y2="63" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#mp-ar3)" />
    <line x1="132" y1="131" x2="188" y2="131" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#mp-ar3)" />
    <rect x="190" y="36" width="120" height="122" rx="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" stroke-dasharray="5 4" />
    <text x="250" y="94" text-anchor="middle">1 组</text>
    <text x="250" y="112" text-anchor="middle" fill="var(--vp-c-text-3)">1K×8</text>

    <text x="410" y="24" text-anchor="middle" font-weight="700">第二步：字扩展 → 4K×8</text>
    <rect x="300" y="36" width="120" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="360" y="54" text-anchor="middle">组 0（1K×8）</text>
    <rect x="300" y="70" width="120" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="360" y="88" text-anchor="middle">组 1（1K×8）</text>
    <rect x="300" y="104" width="120" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="360" y="122" text-anchor="middle">组 2（1K×8）</text>
    <rect x="300" y="138" width="120" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="360" y="156" text-anchor="middle">组 3（1K×8）</text>
    <rect x="440" y="36" width="100" height="46" rx="7" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="490" y="56" text-anchor="middle">2-4 译码器</text>
    <text x="490" y="72" text-anchor="middle" fill="var(--vp-c-text-3)">A₁₁ A₁₀</text>
    <line x1="438" y1="49" x2="424" y2="49" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#mp-ar3)" />
    <line x1="438" y1="83" x2="424" y2="83" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#mp-ar3)" />
    <line x1="438" y1="117" x2="424" y2="117" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#mp-ar3)" />
    <line x1="438" y1="151" x2="424" y2="151" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#mp-ar3)" />
    <text x="490" y="106" text-anchor="middle" fill="var(--vp-c-text-3)">片选</text>
    <text x="490" y="124" text-anchor="middle" fill="var(--vp-c-text-3)">CS₀…CS₃</text>

    <text x="280" y="196" text-anchor="middle" fill="var(--vp-c-text-3)">地址线分配：4096 字 → 12 根地址线</text>
    <rect x="30" y="208" width="500" height="36" rx="7" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="280" y="231" text-anchor="middle" fill="var(--vp-c-text-1)">A₁₁ A₁₀ → 译码器选组　|　A₉…A₀ → 片内地址（两组并接，同时有效）</text>
  </g>
</svg>

</FigBox>

步骤：

1. 拆位：$8\div4=2$ 片并接。地址线并在一起（两片同时选中同一个字），两片的数据线分别拼成高 4 位 $D_7\sim D_4$ 和低 4 位 $D_3\sim D_0$，得到 $1\text{K}\times8$。*（为什么地址线要并接：位扩展的多片是「同一个字的不同位」，必须同时工作。）*
2. 拆字：$4\text{K}\div1\text{K}=4$ 组。把上面这一对当成一个「组」，用高位地址选组。
3. 总片数 $=2\times4=8$ 片。*（为什么先位后字：字扩展是在位扩展的成果上做的，顺序反了就得拆了重来。）*
4. 地址线：总字数 $4\text{K}=4096=2^{12}$，需要 12 根地址线；片内只用低 10 根（$A_9\sim A_0$），剩下 $A_{11}A_{10}$ 送译码器产生 4 个片选。

验算：总容量 $8$ 片 × $1\text{K}\times4$ = $4\text{K}\times8$ ✓（每组 2 片拼成 $1\text{K}\times8$，4 组共 $4\text{K}\times8$）。地址线验算：12 根地址线能区分 $2^{12}=4096$ 个字 ✓，其中低 10 根能区分片内 $2^{10}=1024$ 个字 ✓，高位 2 根能区分 4 组 ✓。
:::

::: tip 例 2 · 地址线与数据线：$8\text{K}\times8$ 的芯片有多少根线 {#ex-mpld-2}
题目：一片 $8\text{K}\times8$ 的存储器芯片有多少根地址线、多少根数据线？总容量折合多少字节？

先想什么：地址线数只由字数决定（每一位地址线让字数翻一倍），数据线数只由每字的位数决定。两者互不干涉。

<FigBox title="地址线与数据线各自由什么决定" kind="结构" note="地址线的根数 = 字数的二进制位数；数据线的根数 = 每字的位数。引脚总数还要加上片选、读写控制与电源，这就是大容量芯片封装越来越大的原因。">

<svg viewBox="0 0 520 170" role="img" aria-label="8K 乘 8 存储器的引脚构成：13 根地址线、8 根双向数据线、1 根片选、1 根读写控制、两根电源">
<defs>
  <marker id="mp-ar3b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="mp-ar2c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <rect x="150" y="46" width="220" height="80" rx="9" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="260" y="78" text-anchor="middle" font-weight="700">8K×8 存储器芯片</text>
    <text x="260" y="100" text-anchor="middle" fill="var(--vp-c-text-3)">8192 字 × 8 位</text>
    <text x="60" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">地址线</text>
    <text x="60" y="104" text-anchor="middle" fill="var(--vp-c-text-3)">A₁₂…A₀（13 根）</text>
    <line x1="98" y1="86" x2="148" y2="86" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#mp-ar3b)" />
    <text x="460" y="78" text-anchor="middle" fill="var(--vp-c-text-3)">数据线</text>
    <text x="460" y="96" text-anchor="middle" fill="var(--vp-c-text-3)">D₇…D₀（8 根）</text>
    <text x="460" y="114" text-anchor="middle" fill="var(--vp-c-text-3)">双向</text>
    <line x1="372" y1="86" x2="412" y2="86" stroke="var(--vp-c-text-3)" stroke-width="1.8" marker-end="url(#mp-ar2c)" />
    <text x="260" y="156" text-anchor="middle" fill="var(--vp-c-text-3)">再加上：片选 CS、读写 WE、VCC 与 GND</text>
  </g>
</svg>

</FigBox>

步骤：

1. 字数 $8192=2^{13}$ → 13 根地址线（$A_{12}\sim A_0$）。*（为什么：$n$ 根地址线最多区分 $2^n$ 个字，反推即可。）*
2. 每字 8 位 → 8 根数据线（双向，读时输出、写时输入）。
3. 总容量：$8192\times8=65536$ 位 $=8192$ 字节 $=8\ \text{KB}$。

验算：$2^{13}=8192$ ✓；$65536$ 位 ÷ 8 位/字节 $=8192$ 字节 ✓（即 8 KB）。
:::

::: tip 例 3 · 用 74LS138 做片选：4 片 $2\text{K}\times8$ 组成 $8\text{K}\times8$ {#ex-mpld-3}
题目：4 片 $2\text{K}\times8$ 的芯片，用一块 74LS138 译码器做片选，组成 $8\text{K}\times8$，画出地址分配。

先想什么：片选的本质是用高位地址决定哪一片响应。所以先算总字数需要几根地址线，再把高 2 位送去译码、低 11 位全部并接给片内。

<FigBox title="高位地址选片、低位地址选字" kind="结构" note="CPU 送出的地址被劈成两半：低半部在片内选字（11 根并接到每一片），高半部在片间选片（2 根送 74LS138）。两半互不打架，这是所有存储器扩展的基本套路。">

<svg viewBox="0 0 560 220" role="img" aria-label="四片 2K 乘 8 组成 8K 乘 8：高位地址 A12 A11 送 74LS138 产生四个片选，低位地址 A10 到 A0 并接到所有芯片">
  <defs>
    <marker id="mp-ar4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
    </marker>
  </defs>
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <rect x="14" y="40" width="120" height="70" rx="7" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="74" y="64" text-anchor="middle" font-weight="700">74LS138</text>
    <text x="74" y="82" text-anchor="middle" fill="var(--vp-c-text-3)">C=A₁₂, B=A₁₁</text>
    <text x="74" y="98" text-anchor="middle" fill="var(--vp-c-text-3)">A 接地</text>
    <g font-size="11">
      <rect x="170" y="26" width="120" height="30" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.3" />
      <text x="230" y="46" text-anchor="middle">片 0　Y̅₀ → 0000~07FF</text>
      <rect x="170" y="62" width="120" height="30" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.3" />
      <text x="230" y="82" text-anchor="middle">片 1　Y̅₁ → 0800~0FFF</text>
      <rect x="170" y="98" width="120" height="30" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.3" />
      <text x="230" y="118" text-anchor="middle">片 2　Y̅₂ → 1000~17FF</text>
      <rect x="170" y="134" width="120" height="30" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.3" />
      <text x="230" y="154" text-anchor="middle">片 3　Y̅₃ → 1800~1FFF</text>
    </g>
    <line x1="136" y1="52" x2="168" y2="41" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#mp-ar4)" />
    <line x1="136" y1="62" x2="168" y2="77" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#mp-ar4)" />
    <line x1="136" y1="80" x2="168" y2="113" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#mp-ar4)" />
    <line x1="136" y1="96" x2="168" y2="149" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#mp-ar4)" />
    <text x="152" y="180" text-anchor="middle" fill="var(--vp-c-text-3)">高位 A₁₂ A₁₁ 选片</text>
    <rect x="330" y="26" width="200" height="138" rx="8" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.5" />
    <text x="430" y="180" text-anchor="middle" fill="var(--vp-c-text-3)">低位 A₁₀…A₀（11 根）并接到每一片</text>
    <text x="430" y="46" text-anchor="middle" fill="var(--vp-c-text-3)">片内寻址</text>
  </g>
</svg>

</FigBox>

步骤：

1. 总容量 8 K 字需要 $2^{13}$ 根地址线 → 13 根。
2. 低 11 根 $A_{10}\sim A_0$ 直接并接到各片的片内地址端。
3. 高位 $A_{12}A_{11}$ 送 3-8 译码器 74LS138（$C$ 接 $A_{12}$、$B$ 接 $A_{11}$、$A$ 接地，只用到 $\bar Y_0\sim\bar Y_3$ 四个输出）：

   - $A_{12}A_{11}=00$ → 片 0（地址 $0000\sim07\text{FF}$）
   - $=01$ → 片 1（$0800\sim0\text{FFF}$）
   - $=10$ → 片 2（$1000\sim17\text{FF}$）
   - $=11$ → 片 3（$1800\sim1\text{FFF}$）

   *（为什么用低有效输出 $\bar Y$：74LS138 的输出是低有效，正好和大多数 SRAM 的低有效片选 $\overline{CS}$ 直接相连，不用反相器。）*

4. 若 138 的使能端没接好，会出现多片同时选中，数据线冲突。这是硬件调试的经典故障。

验算：四段地址区间首尾相接、长度都是 $2^{11}=2048=2\text{K}$，合起来 $0000\sim1\text{FFF}$ 正好 8 K 无空隙 ✓；任意地址的高 2 位唯一决定片号 ✓。
:::

::: tip 例 4 · DRAM 刷新间隔与带宽 {#ex-mpld-4}
题目：一片 $4\text{M}\times1$ 的 DRAM，内部排成 1024 行。设刷新周期 64 ms，存储周期 60 ns。求每行的平均刷新间隔与突发带宽。

先想什么：刷新是按行轮流的，所以刷新周期 ÷ 行数就是每行必须被轮到一次的时间上限；带宽是单位时间能搬多少位，与刷新无关，两者分开算。

<FigBox title="刷新间隔与突发带宽是两条独立的账" kind="结构" note="左边是刷新：一轮 64 ms 扫完 1024 行，每行间隔 62.5 µs。右边是带宽：存储周期 60 ns 决定每秒能做多少次读写。刷新占用的是「不做读写」的时间，所以平均带宽低于突发带宽。">

<svg viewBox="0 0 560 190" role="img" aria-label="DRAM 刷新间隔 62.5 微秒与突发带宽 16.7 兆字节每秒的两条账">
  <g font-size="12" fill="var(--vp-c-text-1)">
    <rect x="20" y="30" width="250" height="130" rx="9" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.5" />
    <text x="145" y="54" text-anchor="middle" font-weight="700">刷新账</text>
    <text x="145" y="80" text-anchor="middle">64 ms ÷ 1024 行</text>
    <text x="145" y="108" text-anchor="middle" font-size="20" fill="var(--vp-c-brand-1)">= 62.5 µs / 行</text>
    <text x="145" y="136" text-anchor="middle" fill="var(--vp-c-text-3)">超过这个间隔，电容就漏光了</text>
    <rect x="290" y="30" width="250" height="130" rx="9" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.5" />
    <text x="415" y="54" text-anchor="middle" font-weight="700">带宽账</text>
    <text x="415" y="80" text-anchor="middle">1 ÷ 60 ns = 16.7 M 次/s</text>
    <text x="415" y="108" text-anchor="middle" font-size="20" fill="var(--vp-c-brand-1)">× 8 片 → 133 Mbit/s</text>
    <text x="415" y="136" text-anchor="middle" fill="var(--vp-c-text-3)">= 16.7 MB/s（÷8 换成字节）</text>
  </g>
</svg>

</FigBox>

步骤：

1. 平均每行刷新间隔 $=64\,\text{ms}\div1024=62.5\,\mu\text{s}$。*（为什么是上限而不是平均值：只要保证每行在这个间隔内被轮到一次，数据就不丢，设计要按最坏情况取等号。）*
2. 存储周期 $60\,\text{ns}$ → 突发带宽 $=1/60\,\text{ns}\approx16.7\,\text{M}$ 次/s。
3. $\times1$ 芯片一次只出 1 位，把 8 片并联成 1 字节宽度时每次传 8 位，突发带宽约 $133\,\text{Mbit/s}\approx16.7\,\text{MB/s}$。*（为什么这里出现 ÷8：Mbit/s 是比特，MB/s 是字节，1 字节 = 8 比特。）*

验算：$64\,\text{ms}/1024=62.5\,\mu\text{s}$ ✓；$1/60\,\text{ns}=16.67\times10^6$ 次/s ✓；$16.67\times10^6\times8=133.3\times10^6$ bit/s，除以 8 得 $16.67\times10^6$ 字节/s ✓。
:::

## 七、工程实例：一块单片机最小系统里的三兄弟

打开 STM32 最小系统板，你会同时看到三块「可编程的硅」：

- Flash（$\text{E}^2\text{PROM}$ 家族）：存你的程序，掉电不丢，所以上电 CPU 有码可跑。
- SRAM：存运行时的变量和栈，读写快、不用刷新，容量小所以贵。
- 芯片本体：整个 MCU 内核本身就是一片巨大的 PLD 产物，厂商把处理器、总线、外设控制器全写进了 FPGA 类的硅面积里。

这就是存储器和可编程逻辑的真实分工：ROM 类存不变的，RAM 类存变化的，PLD 存你设计的逻辑。

真板子上这三者会同时出现，下面这张清单把它们各自最容易犯的错收拢起来。

## 八、易错清单（按踩坑频率排序）

1. 位扩展与字扩展搞反 → 地址线接反（把高位给了片内），数据错位。位扩展是几片同时工作、拼宽数据；字扩展是一次只选中一片。
2. 以为刷新会改写数据 → 误判 DRAM 内容损坏。刷新只是把衰减的电荷读出、放大、写回，一个 bit 都不变。
3. 片选时机不对 → 数据偶尔错。片选要在地址稳定后才有效，否则会在错误的片里写一下子。
4. 74LS138 使能端只接一个 → 片选永远不使能。$S_1S_2\bar S_3$ 三个使能端必须都满足。
5. LUT 输入个数当成无所谓 → 资源估算失真。4 输入 LUT 实现 4 变量函数，变量超了就要多个 LUT 级联。
6. 把字数当成位数 → 地址线数量算错。$n$ 根地址线对应 $2^n$ 个字。

## 自检

答案不在这页，自己说一遍：

1. 一片 $1\text{K}\times4$ 的芯片要用 8 片组成 $4\text{K}\times8$，其中几片同时工作？地址线怎么分？
2. 为什么 DRAM 需要刷新而 SRAM 不需要？刷新的动作具体是什么？
3. 一条总线上挂了两颗芯片，一颗用三态输出、一颗用开漏输出，各有什么前提条件？
4. 在上面的 `<MemoryDemo />` 里往 5 号单元写个 `1011`，拖到 7 号写个别的，再拖回 5，读出的是不是 `1011`？是的话，说明「地址选行、行列交叉定单元」已经在你脑子里成形了。

## 下一步

存储器讲容量与结构，PLD 讲逻辑怎么塞进芯片。真到动手的时候，你面对的是行行 Verilog：怎么把一个计数器的次态方程写成代码，为什么时序逻辑里必须用非阻塞赋值，为什么跨时钟域的信号一定要过两级同步器。这些是[09 · 从逻辑到芯片：Verilog 与 FPGA 入门](./09-verilog-fpga.md)的内容。

<Prereq id="kmap" /> → [09 · 从逻辑到芯片：Verilog 与 FPGA 入门](./09-verilog-fpga.md)
