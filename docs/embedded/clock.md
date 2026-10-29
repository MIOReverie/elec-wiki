---
title: 04 · 时钟系统（RCC 与时钟树）
description: 为什么时钟长成一棵树、五个时钟源怎么挑、F103 从 8 MHz 到 72 MHz 的分频链、总线与外设开关的层级、定时器时钟为什么自动×2、用时钟算定时与波特率误差。
---

# 04 · 时钟系统（RCC 与时钟树）

<Meta time="50 min" level="核心" note="所有外设的心跳都从这里来；算错分频 = 时间全错，而 APB1 上定时器时钟要×2这件事最容易漏" />

3 个真实场景。新板子没配时钟就烧进一个 `HAL_Delay(1)`，你以为等 1 ms，实际等了 9 ms，因为芯片上电默认跑在内部 8 MHz，而不是标称的 72 MHz。USART2 配 115200 收到的是乱码，同一条代码换成 USART1 就正常。F103 的 TIM3 挂在 APB1 上、APB1 是 36 MHz，你按 36 MHz 算分频，实测延时正好差一倍。

3 个现象的答案都不在代码里，而在芯片出厂时定下的一张图上：时钟树。把这张图看懂，剩下的是乘除。

::: tip 读这页之前
会频率与周期的倒数关系（$f=1/T$），会整数乘除和百分比误差的算法（$(\text{实际}-\text{标称})/\text{标称}$），认得十六进制地址和位。分频与倍频本身不需要新数学，就是乘除。

用到的符号：$f_{\text{SYSCLK}}$、$f_{\text{HCLK}}$、$f_{\text{PCLK1}}$、$f_{\text{PCLK2}}$ 分别是系统时钟、AHB 总线时钟、APB1 与 APB2 总线时钟，$f_{\text{TIM}}$ 是定时器的计数时钟，`PSC`、`ARR`、`CCR` 是定时器的三个寄存器。单位用 MHz（$10^6$ Hz）与 kHz（$10^3$ Hz），读法见[符号与约定 · 单位词头](../guide/notation.md)。

使能时钟就是往某个寄存器的某一位写 1，位操作的写法在 <Prereq id="register-map" /> 里讲过，这页直接用。

4 个词先各给一句：RCC（Reset and Clock Control，复位与时钟控制）是管「谁用哪个频率、开还是关」的那组寄存器；PLL（Phase-Locked Loop，锁相环）是用反馈把输出频率锁成输入频率整数倍的电路；AHB 与 APB（Advanced High-performance Bus、Advanced Peripheral Bus）是 ARM 规定的高速与低速两条片上总线；预分频（prescaler）是把输入频率除以一个整数的计数器。
:::

::: tip 心智模型：时钟树 = 水厂 + 分区阀门 + 楼内开关
水厂是时钟源（HSI 或 HSE），出厂水压固定。增压泵是 PLL，把 8 MHz 的水压按整数倍提上去，变成 72 MHz。分区阀门是 AHB/APB 的分频器，主干管给内核和内存全压，支管给外设降压（APB1 只能承受到 36 MHz，超了会爆管，也就是芯片跑飞）。楼内开关是每个外设自己的使能位：管子通到楼下不等于你家有水，得把自家阀门打开。

这条类比还能解释一个反直觉的规则。区里降压了，可消防栓（定时器）要求高压，于是硬件给定时器单独接了一根×2的增压支管。这就是第五节要讲的那条规则。
:::

## 一、为什么不让所有外设跑同一个频率

如果所有外设都跑同一个频率，1 个时钟源就够了。但现实是 3 个需求互相冲突。

- 性能需求不同。CPU 和 DMA（Direct Memory Access，不占 CPU 的数据搬运器，外设就绪后自己把数据搬进内存，见<Prereq id="dma-cache" />）要最快；UART 只需要几十 kHz 到几 MHz 的时钟来产生波特率；看门狗几十 kHz 就够。
- 省电是第一约束。不用的外设把时钟关掉，它就几乎不耗电，这叫**时钟门控**（clock gating），是嵌入式低功耗最基础的一招。
- 精度需求不同。USB 和串口通信要求时钟精度在千分之几以内，内部 RC 振荡器（误差 1%~2%）做不到，必须用外部晶振。

于是芯片长成这个样子：时钟源先经 PLL 倍频，再经多路分频器分发给各外设，中间每个节点都有开关。源头可以是 1 个，也可以有几个，看芯片的定位。这套结构像一棵倒挂的树，根是时钟源，主干是系统时钟，枝杈是各条总线，叶子是每个外设，所以叫**时钟树**（clock tree）。管这棵树的是 RCC 模块。

树根上有几个源，得先数清楚。

## 二、五个时钟源，以及上电那一刻在用的是谁

<FigBox title="5 个时钟源：2 个高速给系统，2 个低速给计时与看门狗" kind="结构" note="HSI 与 HSE 是高速源，供给系统主时钟；LSI 与 LSE 是低速源，一个给独立看门狗，一个给实时时钟。PLL 不是源，它必须吃一个源才能吐频率，所以「用 PLL」永远意味着先选好输入。">

<svg viewBox="0 0 700 300" role="img" aria-label="五个时钟源：HSI、HSE 两个高速源经 PLL 供系统；LSI 与 LSE 两个低速源供看门狗与实时时钟">
<defs>
  <marker id="ck-src" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="26" font-weight="700">高速源（供系统主时钟）</text>
  <rect x="24" y="38" width="196" height="56" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="122" y="60" text-anchor="middle" font-weight="700">HSE 8 MHz 外部晶振</text>
  <text x="122" y="80" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">精度高（几十 ppm），主时钟首选</text>
  <rect x="24" y="104" width="196" height="56" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="122" y="126" text-anchor="middle" font-weight="700">HSI 8 MHz 内部 RC</text>
  <text x="122" y="146" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">上电默认，误差 1%~2%</text>

  <rect x="262" y="58" width="180" height="80" rx="7" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="352" y="84" text-anchor="middle" font-weight="700">PLL 锁相环</text>
  <text x="352" y="104" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">只做倍频，必须选一个输入</text>
  <text x="352" y="124" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">8 MHz × 9 = 72 MHz</text>
  <line x1="222" y1="66" x2="258" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-src)" />
  <line x1="222" y1="132" x2="258" y2="118" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#ck-src)" />
  <text x="240" y="164" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">虚线 = 可选输入</text>

  <rect x="474" y="68" width="202" height="60" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="575" y="92" text-anchor="middle" font-weight="700">→ SYSCLK 72 MHz</text>
  <text x="575" y="112" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">进 AHB 后分给各总线</text>
  <line x1="444" y1="98" x2="470" y2="98" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-src)" />

  <text x="24" y="204" font-weight="700">低速源（永远不进 PLL）</text>
  <rect x="24" y="216" width="196" height="56" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="122" y="238" text-anchor="middle" font-weight="700">LSI ≈ 40 kHz 内部</text>
  <text x="122" y="258" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">独立看门狗 IWDG</text>
  <rect x="262" y="216" width="196" height="56" rx="7" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="360" y="238" text-anchor="middle" font-weight="700">LSE 32.768 kHz 晶振</text>
  <text x="360" y="258" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">实时时钟 RTC（走时）</text>
  <text x="480" y="238" font-size="10.5" fill="var(--vp-c-text-3)">32.768 kHz = 32768 Hz，</text>
  <text x="480" y="256" font-size="10.5" fill="var(--vp-c-text-3)">分频 15 次正好 1 Hz</text>
</g>
</svg>

</FigBox>

| 时钟源 | 频率 | 精度 | 用途 |
| --- | --- | --- | --- |
| HSI 高速内部 | 8 MHz（F1）/ 16 MHz（F4） | 差（±1%~2%，受温漂影响） | 上电默认时钟；HSE 失效时的备份 |
| HSE 高速外部 | 通常 4~25 MHz（板载晶振） | 高（几十 ppm） | 主时钟源，经 PLL 倍频到系统主频 |
| LSI 低速内部 | 约 40 kHz | 很差 | 独立看门狗 IWDG |
| LSE 低速外部 | 32.768 kHz | 高 | RTC 实时时钟（钟表晶振） |
| PLL 锁相环 | — | 跟随输入 | 倍频器，把 8 MHz 变成 72 MHz / 168 MHz |

晶振（crystal oscillator）指「石英晶体加起振电路」：石英片的机械谐振频率非常稳定，比内部 RC 振荡器准两个数量级。这也是为什么需要精确定时的场合（串口、USB、RTC）都要外接晶振。

上电后的默认状态值得单独说一句。芯片复位后跑在 HSI 上，F103 就是 8 MHz 直接当 SYSCLK，不分频不倍频。这意味着你不配时钟，程序照样能跑，只是主频是 8 MHz 而不是 72 MHz，于是所有基于时间的计算（延时、波特率、PWM 频率）都会差 9 倍（$72/8=9$）。新手「程序跑了但串口全是乱码」，八成是从这儿来的。

源认清了，把从源到外设的整条链画出来看看。

## 三、F103 的时钟树：一条从 8 MHz 到 72 MHz 的链

<FigBox title="F103 完整时钟树（8 MHz 晶振 → 72 MHz 系统时钟）" kind="结构" note="从上往下读：两个高速源二选一进 PLL，PLL 倍频出 SYSCLK，SYSCLK 经 AHB 变成 HCLK，再经两条 APB 分频变成 PCLK1 与 PCLK2。注意 APB1 那一支的虚线框：定时器拿到的是 PCLK1 再×2的结果，而不是 PCLK1 本身。">

<svg viewBox="0 0 720 480" role="img" aria-label="F103 时钟树：HSE 8MHz 与 HSI 8MHz 经 PLL 乘九得 72MHz，经 AHB 分频得 HCLK 72MHz，再经 APB2 除一得 72MHz、APB1 除二得 36MHz，定时器时钟乘二回 72MHz">
<defs>
  <marker id="ck-tree" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="ck-tree2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="150" y="24" width="150" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="225" y="42" text-anchor="middle" font-weight="700">HSE 8 MHz</text>
  <text x="225" y="58" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">外部晶振（主时钟）</text>
  <rect x="420" y="24" width="150" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="495" y="42" text-anchor="middle" font-weight="700">HSI 8 MHz</text>
  <text x="495" y="58" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">内部 RC（默认 / 备份）</text>

  <rect x="150" y="90" width="420" height="48" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="360" y="110" text-anchor="middle" font-weight="700">PLL 锁相环：×9</text>
  <text x="360" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">输入 8 MHz → 输出 72 MHz（PLL 只能整数倍频）</text>
  <line x1="225" y1="66" x2="225" y2="88" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-tree)" />
  <line x1="495" y1="66" x2="495" y2="88" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#ck-tree2)" />

  <rect x="150" y="158" width="420" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="360" y="178" text-anchor="middle" font-weight="700">SYSCLK = 72 MHz（系统时钟）</text>
  <text x="360" y="196" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">全芯片的节拍基准；所有延时、波特率都从它算起</text>
  <line x1="360" y1="138" x2="360" y2="156" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-tree)" />

  <rect x="150" y="226" width="420" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="360" y="246" text-anchor="middle" font-weight="700">AHB 预分频 ÷1 → HCLK = 72 MHz</text>
  <text x="360" y="264" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">挂内核、Flash、SRAM、DMA——必须全速</text>
  <line x1="360" y1="206" x2="360" y2="224" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-tree)" />

  <line x1="360" y1="274" x2="360" y2="296" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="220" y1="296" x2="500" y2="296" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />

  <line x1="220" y1="296" x2="220" y2="316" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-tree)" />
  <rect x="90" y="318" width="260" height="56" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="220" y="338" text-anchor="middle" font-weight="700">APB2 ÷1 → PCLK2 = 72 MHz</text>
  <text x="220" y="356" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">上限 72 MHz：GPIO / ADC / USART1 / SPI1</text>
  <text x="220" y="368" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">分频 = 1，定时器不 ×2 → TIM1 = 72 MHz</text>

  <line x1="500" y1="296" x2="500" y2="316" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-tree)" />
  <rect x="370" y="318" width="290" height="56" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="515" y="338" text-anchor="middle" font-weight="700">APB1 ÷2 → PCLK1 = 36 MHz</text>
  <text x="515" y="356" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">上限 36 MHz：USART2/3 / I²C / USB / TIM2~7</text>
  <text x="515" y="368" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">分频 ≠ 1 → 定时器时钟 ×2</text>

  <rect x="370" y="392" width="290" height="46" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" stroke-dasharray="5 3" />
  <text x="515" y="412" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">TIM2~7 实际计数时钟 = 36 × 2 = 72 MHz</text>
  <text x="515" y="430" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">定时器越过了 APB1 的降压，吃的是倍频后的高压</text>
  <line x1="515" y1="374" x2="515" y2="390" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-tree)" />
  <text x="24" y="468" font-size="10.5" fill="var(--vp-c-text-3)">读法：方框是「节点」，箭头是「信号流向」，÷ 是预分频系数、× 是倍频系数。任何一级超上限，芯片都会跑飞且不报错。</text>
</g>
</svg>

</FigBox>

各总线上挂什么（F103）：

| 总线 | 最高频率 | 典型外设 |
| --- | --- | --- |
| AHB（HCLK） | 72 MHz | 内核、内存、DMA、CRC |
| APB2（PCLK2） | 72 MHz（高速） | GPIO、AFIO、ADC、USART1、SPI1、TIM1、TIM8 |
| APB1（PCLK1） | 36 MHz（低速） | TIM2~7、USART2/3、SPI2/3、I²C、CAN、USB、DAC、看门狗 |

两个词必须就地解释，否则「挂在哪条总线上」这句话没法读。AHB（Advanced High-performance Bus）是 ARM 定义的片内高速总线，宽、快、直连内核，适合高频大流量；APB（Advanced Peripheral Bus）是慢速外设总线，省线、省功耗，所以频率必须压低。F103 把 APB 分成两条：APB2 可到 72 MHz，APB1 只到 36 MHz。

APB1 的上限只有 36 MHz，意味着它必须至少二分频。这就是为什么挂在 APB1 上的外设（USART2、TIM2~7）时钟比 APB2 上的慢一半，选串口、选定时器之前先看它挂在哪条总线上。

::: tip 例 1 · 把 F103 配到 72 MHz，算出各路时钟 {#ex-emb-clk-1}
**题目**：外部晶振 HSE = 8 MHz，PLL 倍频 ×9，AHB 不分频，APB1 二分频，APB2 不分频。求 SYSCLK、HCLK、PCLK1、PCLK2，以及 TIM2~7 与 TIM1 的实际计数时钟。

<FigBox title="例 1 走的那条路，逐级标注" kind="结构" note="四个数依次算出：72 → 72 → 36 与 72；定时器再单独乘一次。最大的坑在最后一行：APB1 明明只有 36 MHz，定时器却是 72 MHz。">

<svg viewBox="0 0 700 210" role="img" aria-label="例 1 的分频链：8 MHz 乘九得 72，AHB 除一得 72，APB1 除二得 36 再乘二得定时器 72，APB2 除一得 72">
<defs>
  <marker id="ck-ex1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="16" y="46" width="104" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="68" y="64" text-anchor="middle" font-weight="700">HSE</text>
  <text x="68" y="80" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">8 MHz</text>
  <line x1="124" y1="67" x2="156" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-ex1)" />
  <text x="140" y="60" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">×9</text>

  <rect x="160" y="46" width="104" height="42" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="212" y="64" text-anchor="middle" font-weight="700">SYSCLK</text>
  <text x="212" y="80" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">72 MHz</text>
  <line x1="268" y1="67" x2="300" y2="67" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-ex1)" />
  <text x="284" y="60" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">÷1</text>

  <rect x="304" y="46" width="104" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="356" y="64" text-anchor="middle" font-weight="700">HCLK</text>
  <text x="356" y="80" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">72 MHz</text>

  <line x1="412" y1="52" x2="442" y2="38" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ck-ex1)" />
  <rect x="446" y="20" width="240" height="34" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="566" y="33" text-anchor="middle" font-weight="700">APB2 ÷1 → PCLK2 = 72 MHz</text>
  <text x="566" y="47" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">TIM1 = 72 MHz（分频 = 1，不 ×2）</text>

  <line x1="412" y1="82" x2="442" y2="96" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ck-ex1)" />
  <rect x="446" y="80" width="240" height="34" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="566" y="93" text-anchor="middle" font-weight="700">APB1 ÷2 → PCLK1 = 36 MHz</text>
  <text x="566" y="107" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">分频 = 2 ≠ 1 → 定时器 ×2</text>

  <line x1="566" y1="114" x2="566" y2="132" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ck-ex1)" />
  <rect x="446" y="136" width="240" height="34" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="566" y="149" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">TIM2~7 = 36 × 2 = 72 MHz</text>
  <text x="566" y="163" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">算定时周期用这个数，不是 36</text>

  <text x="16" y="196" font-size="10.5" fill="var(--vp-c-text-3)">四个数 + 一个「隐藏的乘二」，就是 F103 最经典配置的全部内容</text>
</g>
</svg>

</FigBox>

先猜一句：8 MHz 乘 9 是 72，APB1 除以 2 是 36，定时器跟着 36 走。最后半句就是错的，也是这页最值钱的一条。

这是沿链路逐级乘除的题，不是解方程。做法固定：从源开始，每过一个节点乘或除一次，把结果写在节点旁边；定时器要单独再考虑一次×2。*（为什么必须逐级写：中间任何一级都可能撞上限，跳着算会漏掉「超限」这个致命检查。）*

步骤：

1. PLL 输出即系统时钟：$8\times9=72$ MHz。
2. AHB 不分频：$72\div1=72$ MHz，这是 HCLK，内核与内存用它。
3. APB1 二分频：$72\div2=36$ MHz。先查上限：36 ≤ 36 ✓。
4. APB2 不分频：$72\div1=72$ MHz。上限 72 ✓。
5. 定时器：APB1 分频系数为 2（≠1），所以 TIM2~7 的计数时钟 = $36\times2=72$ MHz；APB2 分频为 1，TIM1 就是 72 MHz，不再乘。

回代走 3 条独立检查。① 上限：PCLK1 = 36 不超过 36，PCLK2 = 72 不超过 72 ✓。② 反向：从 TIM 的 72 MHz 往回推，若没有×2规则，定时器只有 36 MHz，与你将要写的分频值对不上（第五节会用具体数字演示差一倍）。③ 常识：F103 标称主频 72 MHz，SYSCLK 正好等于它 ✓。

顺手看清一个危险：把 APB1 也设成不分频，PCLK1 就是 72 MHz，超过 36 MHz 上限，芯片可能直接不启动，症状是「程序不跑」，没有任何报错。所以超限检查必须写在算完之后。
:::

树配好了，可「时钟到达总线」不等于「时钟到达外设」。中间还隔着最后一级开关，这一级也是「代码全对但没反应」的头号原因。

## 四、外设时钟使能：最容易漏的一步

每个外设在 RCC 的使能寄存器里有自己的开关。总线上的时钟一直在跑，但外设的时钟输入被门关着。

```c
// F103：APB2 外设使能寄存器 RCC->APB2ENR
RCC->APB2ENR |= (1 << 2);    // IOPAEN：GPIOA 时钟
RCC->APB2ENR |= (1 << 4);    // IOPCEN：GPIOC 时钟
RCC->APB2ENR |= (1 << 14);   // USART1EN：USART1 时钟

// HAL 写法（推荐，可读性好）
__HAL_RCC_GPIOA_CLK_ENABLE();
__HAL_RCC_USART1_CLK_ENABLE();
__HAL_RCC_TIM2_CLK_ENABLE();
```

忘了使能的症状很统一：配置代码全部正确、寄存器也写了，外设毫无反应，而且不报错。因为对未使能时钟的外设寄存器写入，硬件根本不响应，写操作不会失败，只是石沉大海。

| 使能寄存器 | 挂哪些外设（F103） | 常用位 |
| --- | --- | --- |
| `RCC->AHBENR` | DMA1、SRAM、Flash 接口 | bit0 DMA1EN、bit2 SRAMEN |
| `RCC->APB2ENR` | GPIOA~E、AFIO、ADC1、USART1、SPI1、TIM1 | bit2 IOPAEN、bit4 IOPCEN、bit14 USART1EN |
| `RCC->APB1ENR` | TIM2~7、USART2/3、I²C、USB、CAN | bit0 TIM2EN、bit17 USART2EN |

三张表记不住没关系，记住 1 条动作就够：用哪个外设，先打开它所在总线的那个位。至于「APB1 上的定时器时钟为什么要×2」，那是硬件设计师留下的 1 个坑。

## 五、定时器时钟为什么会自动 ×2

这是 F1/F4 上一个反直觉的设计，规则只有 1 句：

$$f_{\text{TIM}} = \begin{cases} f_{\text{PCLK}}, & \text{APB 预分频系数} = 1 \\ 2\,f_{\text{PCLK}}, & \text{APB 预分频系数} \ne 1 \end{cases}$$

用意是：即使你把 APB1 分频降到 36 MHz 来省电，定时器仍能拿到 72 MHz 的高分辨率，不至于为了省电牺牲定时精度。

<FigBox title="×2 规则：定时器不在 APB 分频的下游，而是在它旁边" kind="结构" note="图里两个出口：串口直接吃 PCLK1，定时器吃的是 PCLK1 经过倍频器之后的值。倍频器只在 APB 分频系数不为 1 时生效，这也是为什么同一条 APB1 上，串口和定时器的时钟能不一样。">

<svg viewBox="0 0 700 280" role="img" aria-label="PCLK1 36MHz 分两路：一路直接给串口，一路经乘二给定时器 72MHz；APB 分频为 1 时无乘二">
<defs>
  <marker id="ck-x2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="20" y="52" width="150" height="46" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="95" y="72" text-anchor="middle" font-weight="700">APB1 ÷2</text>
  <text x="95" y="88" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">PCLK1 = 36 MHz</text>
  <line x1="174" y1="75" x2="212" y2="75" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="212" y1="42" x2="212" y2="152" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />

  <line x1="212" y1="42" x2="268" y2="42" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-x2)" />
  <rect x="272" y="20" width="220" height="44" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="382" y="38" text-anchor="middle" font-weight="700">USART2 / I²C / USB</text>
  <text x="382" y="56" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">直接用 36 MHz（不加倍）</text>

  <line x1="212" y1="152" x2="268" y2="152" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-x2)" />
  <rect x="272" y="128" width="150" height="48" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="347" y="148" text-anchor="middle" font-weight="700">×2 倍频器</text>
  <text x="347" y="166" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">仅当 APB 分频 ≠ 1</text>
  <line x1="426" y1="152" x2="462" y2="152" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-x2)" />
  <rect x="466" y="128" width="216" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="574" y="148" text-anchor="middle" font-weight="700">TIM2~7 = 72 MHz</text>
  <text x="574" y="166" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">定时、PWM、输入捕获都用它</text>

  <rect x="20" y="206" width="662" height="56" rx="6" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="34" y="228" font-weight="700">对照：如果 APB1 分频 = 1（PCLK1 = 72 MHz）</text>
  <text x="34" y="248" font-size="10.5" fill="var(--vp-c-text-3)">倍频器不生效，定时器时钟就等于 PCLK1 = 72 MHz——结果一样，但走的是另一条分支，算的时候要看分频系数。</text>
</g>
</svg>

</FigBox>

这条规则落到手上的影响有两条：

- 算定时周期、PWM 频率时，用的时钟是×2之后的值；
- 算 UART 波特率时，用的却是×2之前的 PCLK。USART 不在×2之列，只有定时器享受这个待遇。同一条 APB1 上，定时器和串口用的时钟不一样，这是最容易算混的地方。

::: tip 例 2 · 同一条 1 ms 定时，用 36 还是 72 会差多少 {#ex-emb-clk-2}
**题目**：用 TIM3（挂 APB1，PCLK1 = 36 MHz、定时器时钟 72 MHz）做 1 ms 定时。取 `PSC = 71`、`ARR = 999` 时实际周期是多少？若误把定时器时钟当成 36 MHz，同样的寄存器值会得到多少？

<FigBox title="例 2 的对照：同一个 PSC，两个时钟源，两个周期" kind="结构" note="PSC 把 72 MHz 分到 1 MHz，再数 1000 个数得到 1 ms。若以为时钟是 36 MHz，则分频后只有 500 kHz，数 1000 个数要 2 ms，正好差一倍，而这正是「定时器时钟忘了×2」的现场症状。">

<svg viewBox="0 0 700 240" role="img" aria-label="例 2 对照：72MHz 经 PSC 71 得 1MHz 计数、1000 个数为 1ms；36MHz 经同一 PSC 得 500kHz、1000 个数为 2ms">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="20" y="30" width="320" height="150" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="180" y="54" text-anchor="middle" font-weight="700">正确：定时器时钟 72 MHz</text>
  <text x="36" y="80" font-size="11">f_cnt = 72 MHz ÷ (71+1) = 1 MHz</text>
  <text x="36" y="102" font-size="11">T = (999+1) ÷ 1 MHz = 1 ms ✓</text>
  <text x="36" y="124" font-size="10.5" fill="var(--vp-c-text-3)">一个计数 = 1 µs，数到 1000 溢出</text>
  <text x="36" y="146" font-size="10.5" fill="var(--vp-c-text-3)">PWM 频率 = 1 MHz ÷ 1000 = 1 kHz</text>
  <text x="36" y="168" font-size="10.5" fill="var(--vp-c-text-3)">30% 占空比 → CCR = 300（高 300 µs）</text>

  <rect x="360" y="30" width="320" height="150" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="520" y="54" text-anchor="middle" font-weight="700">错误：把时钟当成 36 MHz</text>
  <text x="376" y="80" font-size="11">f_cnt = 36 MHz ÷ (71+1) = 500 kHz</text>
  <text x="376" y="102" font-size="11">T = (999+1) ÷ 500 kHz = 2 ms ✗</text>
  <text x="376" y="124" font-size="10.5" fill="var(--vp-c-text-3)">一个计数 = 2 µs，周期整整长一倍</text>
  <text x="376" y="146" font-size="10.5" fill="var(--vp-c-text-3)">表现：闪灯慢一倍、PWM 频率 500 Hz</text>
  <text x="376" y="168" font-size="10.5" fill="var(--vp-c-text-3)">波形看起来完全正常，只是时间全错</text>

  <text x="350" y="212" text-anchor="middle" fill="var(--vp-c-text-3)">判断用哪个时钟只需问一句：这个外设是定时器吗？是就 ×2，不是就不 ×2</text>
</g>
</svg>

</FigBox>

PSC 和 ARR 两个数都没动，周期看上去就该一样。差就差在分母那个时钟上，它一变，整条账翻倍。

算定时周期只有两个动作：先算计数频率（$f_{\text{TIM}}/(PSC+1)$），再算周期（$(ARR+1)/f_{cnt}$）。难点不在算术，在分母上那个 $f_{\text{TIM}}$ 到底填多少。所以先确定这颗定时器挂在哪条总线、分频系数是不是 1，再动笔。*（为什么先定时钟再定寄存器：反过来的话，你会先凑出一堆好看的数字，再去解释为什么实测不对。）*

步骤：

1. 确认时钟：TIM3 挂 APB1；APB1 分频 2 ≠ 1，所以 $f_{\text{TIM}}=36\times2=72$ MHz。
2. 算计数频率：$f_{cnt}=72\ \text{MHz}/(71+1)=1$ MHz，即一个计数 1 µs。
3. 算周期：$T=(999+1)/1\ \text{MHz}=1$ ms。
4. 换成错误假设：$f_{cnt}=36/72=0.5$ MHz，$T=1000/0.5\ \text{MHz}=2$ ms。

回代用「计数次数乘单次时间」独立复核。正确情形 1000 次乘 1 µs 得 1 ms ✓；错误情形 1000 次乘 2 µs 得 2 ms ✓。再补一个比例检查：$72/36=2$，周期应该正好翻倍，与结果一致 ✓。

顺带把 PWM 也算出来：同一定时器下，PWM 频率 = $f_{cnt}/(ARR+1)=1\ \text{MHz}/1000=1$ kHz。要 30% 占空比，比较寄存器取 $\text{CCR}=(ARR+1)\times30\%=1000\times0.3=300$，对应高电平时间 $300/1\ \text{MHz}=300$ µs。

公式里的 +1 单独提一句。分频器和计数器都是「数到设定值再加一」，写成 $PSC$ 而不是 $PSC+1$ 是高频错误，差 1 在低频段看不出来，在高频段就是百分之几的误差。
:::

F1 的树就这一条链，F4 加了两级分频，还多一个给 USB 的分支。

## 六、F407 的时钟树：PLL 拆成 M、N、P、Q 4 个参数

<FigBox title="F4 的 PLL：四个参数 M / N / P / Q 各管一段" kind="结构" note="M 先把晶振降到 1~2 MHz（输入太高的 PLL 锁不住），N 把它倍到 VCO，P 决定系统时钟，Q 单独给 USB 与 SDIO 供 48 MHz。四个参数必须同时满足各自的范围，否则芯片可能根本起不来。">

<svg viewBox="0 0 720 270" role="img" aria-label="F4 的 PLL 结构：8MHz 经 M=8 得 1MHz，经 N=336 得 VCO 336MHz，经 P=2 得 168MHz 系统时钟，经 Q=7 得 48MHz 给 USB">
<defs>
  <marker id="ck-f4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="16" y="52" width="110" height="46" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="71" y="72" text-anchor="middle" font-weight="700">HSE</text>
  <text x="71" y="88" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">8 MHz</text>
  <line x1="130" y1="75" x2="158" y2="75" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-f4)" />
  <text x="144" y="66" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">÷M</text>

  <rect x="162" y="52" width="120" height="46" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="222" y="72" text-anchor="middle" font-weight="700">M = 8</text>
  <text x="222" y="88" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">→ 1 MHz</text>
  <line x1="286" y1="75" x2="314" y2="75" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ck-f4)" />
  <text x="300" y="66" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">×N</text>

  <rect x="318" y="52" width="130" height="46" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="383" y="72" text-anchor="middle" font-weight="700">N = 336</text>
  <text x="383" y="88" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">VCO 336 MHz</text>

  <line x1="452" y1="64" x2="482" y2="50" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ck-f4)" />
  <text x="464" y="44" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">÷P</text>
  <rect x="486" y="28" width="216" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="594" y="46" text-anchor="middle" font-weight="700">P = 2 → SYSCLK 168 MHz</text>
  <text x="594" y="62" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">再经 AHB/APB 分给各总线</text>

  <line x1="448" y1="96" x2="482" y2="124" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#ck-f4)" />
  <text x="462" y="132" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-3)">÷Q</text>
  <rect x="486" y="106" width="216" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="594" y="124" text-anchor="middle" font-weight="700">Q = 7 → 48 MHz</text>
  <text x="594" y="140" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">USB OTG / SDIO 专用</text>

  <line x1="16" y1="172" x2="704" y2="172" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="16" y="196" font-weight="700">四条约束（必须同时满足）</text>
  <text x="16" y="218" font-size="10.5" fill="var(--vp-c-text-3)">① PLL 输入 = HSE ÷ M 落在 1~2 MHz　② VCO = 输入 × N 落在 100~432 MHz</text>
  <text x="16" y="238" font-size="10.5" fill="var(--vp-c-text-3)">③ SYSCLK = VCO ÷ P ≤ 168 MHz（P 只能取 2/4/6/8）　④ USB 时钟 = VCO ÷ Q 必须正好 48 MHz</text>
  <text x="16" y="260" font-size="10.5" fill="var(--vp-c-brand-1)">任一条不满足：芯片可能起不来，症状是「程序不跑」而不是报错。</text>
</g>
</svg>

</FigBox>

| 参数 | 约束 |
| --- | --- |
| M 输入分频 | 使 PLL 输入落在 1~2 MHz（推荐 2 MHz 以内） |
| N 倍频 | 使 VCO 输出落在 100~432 MHz |
| P 输出分频 | 取 2 / 4 / 6 / 8，决定 SYSCLK（F407 上限 168 MHz） |
| Q 分频 | 给 USB OTG、SDIO 用，需得到 48 MHz |

APB2 二分频后是 84 MHz，正好压在 F407 的 84 MHz 上限上，一点余量都不留。

::: tip 例 3 · 把 F407 配到 168 MHz，并给 USB 凑出 48 MHz {#ex-emb-clk-3}
**题目**：HSE = 8 MHz。要求 SYSCLK = 168 MHz、USB 得到 48 MHz。选 M、N、P、Q，并算出 HCLK、PCLK1、PCLK2 与 TIM1、TIM2~7 的计数时钟（APB1 四分频、APB2 二分频）。

参数这么多，多数人会随手凑一组能除尽的。不行，4 条约束同时卡着，顺序错了要来回试。

M、N、P、Q 这 4 个参数不是自由选的，被 4 条约束夹着。先定 P（只有 2/4/6/8 四档），再从「SYSCLK 乘 P 等于 VCO」反推 N，最后让 N 能被 Q 整除出 48 MHz，顺序是 P → N → Q → M。*（为什么不先定 M：M 只影响输入频率的落点，自由度最大、约束最松，放最后调。）*

步骤：

1. 取 P = 2，VCO 必须是 $168\times2=336$ MHz，落在 100~432 内 ✓。
2. 取 N = 336，输入必须是 $336/336=1$ MHz，于是 M = 8（$8/8=1$），落在 1~2 MHz ✓。
3. USB 要 48 MHz：$Q=336/48=7$，正好整数 ✓。
4. 总线分频：AHB ÷1 → HCLK 168；APB1 ÷4 → 42 MHz（≤42 ✓）；APB2 ÷2 → 84 MHz（≤84 ✓）。
5. 定时器：APB1 分频 4 ≠ 1 → TIM2~7 = $42\times2=84$ MHz；APB2 分频 2 ≠ 1 → TIM1 = $84\times2=168$ MHz。

回代 3 条独立检查。① 输入 1 MHz 在 1~2 内、VCO 336 在 100~432 内、SYSCLK 168 等于上限，三条都对得上。② USB 的 48 MHz 是 336 除以 7 的整除结果，不是近似值。③ 定时器反推：忘了×2的话 TIM1 只有 84 MHz，与「TIM1 是高级定时器、跑满 168」的常识不符。4 条全过 ✓。

约束检查不是形式。VCO 超 432 MHz 或 PLL 输入不在 1~2 MHz，芯片可能根本起不来，症状是「程序不跑」而不是报错。
:::

前面那些乘除，最后都收在两个能直接用的式子里。

## 七、从时钟到定时周期与 PWM

定时器时钟确定后，周期和频率就由 2 个寄存器决定。

- PSC（prescaler，预分频器）把定时器时钟再分一次，得到计数频率 $f_{cnt} = f_{TIM} / (PSC + 1)$。
- ARR（auto-reload register，自动重装载寄存器）是计数器数到就重装的那个值，周期 $T = (ARR + 1) / f_{cnt}$。
- CCR（capture/compare register，比较寄存器）决定翻点：计数值小于 CCR 时输出一种电平，大于时另一种，这就是 PWM 占空比的来源。

<FigBox title="一个 PWM 周期的三个数字：PSC 决定尺子的刻度，ARR 决定数到几，CCR 决定哪天翻转" kind="结构" note="上半是计数器 CNT 的锯齿波：从 0 数到 ARR 再回 0，一个来回就是一个 PWM 周期。下半是比较输出的方波：CNT 小于 CCR 时为高，超过后变低，所以 CCR 与 ARR+1 的比值就是占空比。">

<svg viewBox="0 0 700 320" role="img" aria-label="定时器计数锯齿波与对应 PWM 方波：CNT 从 0 数到 999，CCR 等于 300 时高电平占 30%">
<defs>
  <marker id="ck-pwm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="60" y="24" font-weight="700">CNT 计数（一个锯齿 = 一个周期）</text>
  <line x1="60" y1="170" x2="670" y2="170" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="60" y1="170" x2="60" y2="40" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="52" y="44" text-anchor="end" font-size="10" fill="var(--vp-c-text-3)">999</text>
  <text x="52" y="174" text-anchor="end" font-size="10" fill="var(--vp-c-text-3)">0</text>
  <line x1="60" y1="44" x2="670" y2="44" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="676" y="44" font-size="10" fill="var(--vp-c-text-3)">ARR</text>
  <line x1="60" y1="132" x2="670" y2="132" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="676" y="132" font-size="10" fill="var(--vp-c-brand-1)">CCR</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="60,170 260,44 260,170 460,44 460,170 660,44" />
  <line x1="60" y1="186" x2="260" y2="186" stroke="var(--vp-c-text-3)" stroke-width="1" marker-start="url(#ck-pwm)" marker-end="url(#ck-pwm)" />
  <text x="160" y="200" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">1 ms（1000 个计数）</text>

  <text x="60" y="238" font-weight="700">比较输出（PWM 方波）</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" points="60,250 120,250 120,286 260,286 260,250 320,250 320,286 460,286 460,250 520,250 520,286 660,286" />
  <line x1="60" y1="250" x2="60" y2="286" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 2" />
  <line x1="120" y1="250" x2="120" y2="286" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 2" />
  <text x="90" y="306" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">300 µs</text>
  <text x="190" y="306" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">700 µs</text>
  <text x="640" y="238" text-anchor="end" font-size="10" fill="var(--vp-c-text-3)">占空比 = CCR / (ARR+1) = 30%</text>
</g>
</svg>

</FigBox>

::: tip 例 4 · 用 72 MHz 定时器做 1 ms 定时并配出 30% 占空比 {#ex-emb-clk-4}
**题目**：F103 的定时器时钟 72 MHz。要 1 ms 周期、占空比 30%，取 PSC 与 ARR、算 CCR，并说明测量时该期待什么。

能凑出 1 ms 的取法不少，乘起来等于 1000 的组合随便列。可分辨率会不一样，占空比能调的步数也不同。

PSC 和 ARR 的分工要分清。PSC 决定 1 个计数占多少时间，ARR 决定数多少个计数。2 个往大调都能延长周期，但只有 ARR 直接对应 PWM 的分辨率，所以习惯上先定「一个计数 = 1 µs」把 PSC 定下来，再用 ARR 凑周期。*（为什么这样分工：PSC 只影响分辨率，ARR 影响周期和占空比分辨率，先固定分辨率能让后面的数字都是整数。）*

步骤：

1. 目标分辨率 1 µs/计数 → $f_{cnt}=1$ MHz → $PSC=72\ \text{MHz}/1\ \text{MHz}-1=71$。
2. 周期 1 ms → 需要 1000 个计数 → $ARR=1000-1=999$。
3. 占空比 30% → $CCR=(ARR+1)\times0.3=300$。
4. 高电平时间 $=300\times1\ \mu\text{s}=300\ \mu\text{s}$；PWM 频率 $=1\ \text{MHz}/1000=1$ kHz。

回代反算三点。① $f_{cnt}=72/(71+1)=1$ MHz ✓。② $T=(999+1)/1\ \text{MHz}=1$ ms ✓。③ 占空比 $300/1000=30\%$ ✓。再用示波器口径核对：1 kHz 的周期是 1 ms，高电平 300 µs，3 个数字互相自洽，说明 PSC 与 ARR 没有互相抵消的错误。顺带说，PSC=35、ARR=1999 也能得到 1 ms，但分辨率变成 2 µs，占空比只能取偶数步。

最容易错的地方还是那个 $+1$。写成 $f_{cnt}=f_{TIM}/PSC$ 会得到 1.014 MHz，周期 0.986 ms，差 1.4%。在 1 ms 这个量级看不出来，可做的是 20 µs 的高频 PWM 时就致命了。
:::

定时算对了，还有一个「看起来不是时钟问题、其实是时钟问题」的场合：串口。

## 八、工程实例：波特率误差是怎么来的

同一个 115200，一条串口正常、另一条乱码，根子在这里。串口的波特率由 PCLK 分频得到。16 倍过采样（每个位时间里采 16 次，取中间几次判值，以抵抗噪声与时钟偏差），分频系数是

$$\text{DIV} = \frac{f_{PCLK}}{16 \times \text{baud}}$$

DIV 通常不是整数，硬件只能写「整数部分加 4 位小数部分」，小数步长是 $1/16=0.0625$，于是产生误差。

<FigBox title="为什么 19.53125 写不进去：4 位小数的刻度尺" kind="结构" note="USART 的分频寄存器只有 4 位小数，只能落在 1/16 的格点上。19.53125 落在两个格点之间，硬件只能取最近的 19.5625，这 0.03 的偏差折算成波特率就是 −0.16%。">

<svg viewBox="0 0 700 250" role="img" aria-label="数轴 19 到 20，每 1/16 一个刻度；19.53125 落在两刻度之间，最近的格点是 19.5625">
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="60" y1="110" x2="660" y2="110" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="60" y1="100" x2="60" y2="120" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="660" y1="100" x2="660" y2="120" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <text x="60" y="138" text-anchor="middle" font-size="10.5">19.0</text>
  <text x="660" y="138" text-anchor="middle" font-size="10.5">20.0</text>
  <line x1="97.5" y1="104" x2="97.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="135" y1="104" x2="135" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="172.5" y1="104" x2="172.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="210" y1="104" x2="210" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="247.5" y1="104" x2="247.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="285" y1="104" x2="285" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="322.5" y1="104" x2="322.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="360" y1="100" x2="360" y2="120" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="360" y="138" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">19.5</text>
  <line x1="397.5" y1="104" x2="397.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="435" y1="104" x2="435" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="472.5" y1="104" x2="472.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="510" y1="104" x2="510" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="547.5" y1="104" x2="547.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="585" y1="104" x2="585" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <line x1="622.5" y1="104" x2="622.5" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1" />

  <circle cx="377.5" cy="110" r="4.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <line x1="377.5" y1="110" x2="377.5" y2="168" stroke="var(--vp-c-brand-1)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="377.5" y="184" text-anchor="middle" fill="var(--vp-c-brand-1)">19.53125（算出来的真值）</text>

  <circle cx="395" cy="110" r="5" fill="var(--vp-c-brand-1)" />
  <line x1="395" y1="110" x2="395" y2="206" stroke="var(--vp-c-brand-1)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="395" y="222" text-anchor="middle" fill="var(--vp-c-brand-1)">19.5625 = 19 + 9/16（唯一可写值）</text>
  <text x="60" y="66" font-size="10.5" fill="var(--vp-c-text-3)">刻度间隔 1/16 = 0.0625：小数部分只能是 0/16、1/16、…、15/16</text>
  <text x="660" y="66" text-anchor="end" font-size="10.5" fill="var(--vp-c-text-3)">真值离格点越远，误差越大</text>
</g>
</svg>

</FigBox>

::: tip 例 5 · 算两个串口在 115200 下的实际误差 {#ex-emb-clk-5}
**题目**：USART1 挂 APB2（PCLK2 = 72 MHz）、USART2 挂 APB1（PCLK1 = 36 MHz），都配 115200。分别算实际波特率与误差，并判断能否通信。

72 MHz 对 36 MHz，差一倍，按说两条的误差都不小。结果一条为零，另一条也只差千分之一点几。

先算 DIV 的真值，再看它的小数部分能不能用 $1/16$ 精确表示。能表示就没有误差，不能就取最近格点，再用实际 DIV 反推波特率。*（为什么不能直接四舍五入到小数点后两位：误差按比例影响每一位采样，必须用实际 DIV 重算波特率才知道真实偏差。）*

步骤：

1. USART1：$\text{DIV}=72\times10^6/(16\times115200)=39.0625$。
2. 小数 0.0625 正好是 $1/16$，4 位小数能精确表示 → 实际波特率就是 115200，误差 0%。
3. USART2：$\text{DIV}=36\times10^6/(16\times115200)=19.53125$。
4. 小数 0.53125 不能表示（格点间隔 0.0625），最近格点是 $9/16=0.5625$ → 实际 DIV = 19.5625。
5. 反推波特率：$36\times10^6/(16\times19.5625)\approx115016$ bps。

回代验误差：$=(115016-115200)/115200\approx-0.16\%$。这个值远小于串口允许的 ±2%~3% 容差，通信完全正常 ✓。另一个方向的检查也顺手做掉：39.0625 的小数部分乘 16 得 1，整数，说明能精确落在格点上；19.53125 的小数部分乘 16 得 8.5，不是整数，说明必然要取近似 ✓。

误差还随帧长累积。10 位一帧、每帧偏 0.16% 的一位时间，累计约 0.016 位，远小于半个位宽，所以能正确采样；但误差到 3%，10 位就累积到 0.3 位，靠近临界点，长帧高波特率时就开始出错。所以串口出问题，先确认这条 USART 挂在哪条总线、当前 PCLK 是多少，再算误差，别急着怀疑代码。
:::

## 九、易错清单（按踩坑频率排序）

1. 忘记开外设时钟 → 配置全对、寄存器也写了，外设毫无反应且不报错 → 先 `__HAL_RCC_xxx_CLK_ENABLE()`，再写配置。
2. 以为不配时钟就是 72 MHz → 实际跑在 HSI 的 8 MHz，所有基于时间的量差 9 倍 → 上电默认 HSI，必须手工配时钟树。
3. 定时器时钟忘了×2 → 延时、PWM 频率整体差一倍，波形看着完全正常 → APB 分频不为 1 时定时器时钟 = PCLK × 2。
4. 把×2规则套到串口上 → 波特率算成两倍，通信直接乱码 → USART 用 PCLK 本身，不×2。
5. PSC / ARR 公式忘了 +1 → 周期偏小百分之几，低频看不出来、高频致命 → 分频与重装都是「数到值再加一」。
6. 超过总线频率上限 → 芯片跑飞或不启动，且不报错 → F103 的 APB1 ≤ 36 MHz、APB2 ≤ 72 MHz；F407 的 APB1 ≤ 42 MHz、APB2 ≤ 84 MHz。
7. F4 的 VCO 或 PLL 输入越界 → 芯片直接起不来，症状是「程序不跑」 → VCO 100~432 MHz、PLL 输入 1~2 MHz。
8. HSE 晶振不起振 → `SystemClock_Config()` 死在等待就绪的循环里 → 先切 HSI 定位，再查晶振与负载电容。

## 自检

合上页面，自己说一遍（答案不在这一页）：

1. F103 用 8 MHz 晶振配到 72 MHz 时，PCLK1 是多少？TIM3 的实际计数时钟是多少？USART2 配置波特率时用的时钟又是多少？
2. 为什么 APB1 上的定时器时钟会×2，而串口不会？这条规则的用意是什么？
3. 同样的 115200，为什么 USART1 误差 0%、USART2 误差 −0.16%？

## 下一步

时钟通了，该碰最基础也最容易出错的外设了：一个引脚。八种工作模式怎么选、上拉下拉为什么必须有、按键为什么要消抖，这些都要在「时钟已经打开」的前提下才谈得上。

<Prereq id="register-map" /> → [05 · GPIO 与按键](./gpio.md)
