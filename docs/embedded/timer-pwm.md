---
title: 07 · 定时器与 PWM
description: 三个寄存器各管什么、改一个会连带动到谁，定时中断与 PWM 的参数怎么反解，占空比和分辨率为什么此消彼长，还有输入捕获、编码器和死区换算。
---

# 07 · 定时器与 PWM

<Meta time="48 min" level="核心" note="PSC / ARR 忘了 +1、改了 ARR 没同步改 CCR、死区换算用错基准，这三个错占了定时器问题的大半" />

代码里写 `Prescaler = 71; Period = 999;`，你以为得到 1 ms，示波器上量到 1.001 ms。多出来的那 1 个计数，就是「数到 ARR 就溢出」这句话里藏着的 +1。

另一回：舵机本来稳在 90°，为了让 PWM 细一点，把 ARR 从 19999 改成 9999。同一句 `CCR = 1500`，舵机立刻转到别的角度去了。占空比是 $CCR/(ARR+1)$，分母动了，CCR 没动也救不回来。

还有一次发生在电机驱动上。上下两管互补输出，示波器里偶尔冒一个尖峰电流，最后炸掉一颗 MOS 管。那不是干扰，是两管同时导通，行业里管这个叫直通。

三件事栽在同一处：定时器看着只有三个旋钮，可它们互相牵连。PSC 改一格，ARR 的含义就变了；ARR 变一次，这个定时器上所有通道的占空比全跟着变。

::: tip 读这页之前
会频率与周期的倒数关系（$f=1/T$）、百分比和整除的估算、十六进制与寄存器位域（<Prereq id="register-map" />），这页就读得动。数学只有乘除，没有微积分。

$f_{TIM}$ 从哪来见 <Prereq id="clock-tree" />。有一条得先记住：APB 预分频不为 1 时，挂在那条总线上的定时器时钟会自动 ×2。漏了这一条，所有时间都差一倍，而且差得理直气壮。

符号：$f_{TIM}$（送进定时器的时钟）、$f_{cnt}$（PSC 分频之后的计数频率）、`PSC`（预分频寄存器）、`ARR`（自动重装载寄存器，auto-reload）、`CNT`（当前计数值）、`CCR`（捕获 / 比较寄存器，capture-compare）、$t_{DTS}$（死区计数的单位时间）、`DTG`（死区发生器寄存器的 8 位字段）。总表在[符号与约定](../guide/notation.md)。

四个词先用一句话顶着：预分频（prescaler）是把输入时钟除以一个整数；自动重装载（auto-reload）是计数器数到某个值就回零；占空比（duty）是一个周期里高电平占的比例；死区（dead time）是互补的两路输出之间强行插进去的一小段「都关断」的空档。正文里遇到时逐个展开。
:::

::: tip 心智模型：三级流水线，四个数决定一切
时钟定下「一拍多长」，`PSC` 定下「一个计数多长」，`ARR` 定下「数到哪里算一轮」，`CCR` 定下「一轮里哪一段是高」。所有时间参数都是这四个数的函数，没有第五个旋钮。

这条模型能解释三处困惑：改 ARR 为什么让舵机角度漂，因为分母变了；改 CCR 为什么波形不抖，因为新值下一轮才生效；中心对齐模式频率为什么只有一半，因为一轮要走两趟，先上后下。
:::

## 一、三个寄存器各管什么

定时器内部可以分成三块，各管一段：

| 部分 | 寄存器 | 作用 |
| --- | --- | --- |
| 时基单元 | `PSC`、`ARR`、`CNT` | 产生时间基准：多久数一次、数到多少算一轮 |
| 捕获 / 比较通道 | `CCRx` | 输出 PWM（比较）或测量外部信号（捕获），每个通道一套 |
| 时钟与触发 | 内部时钟 / 外部脉冲 / 其他定时器 | 决定计数来源，可实现级联与同步 |

拿开头那组数验一遍：`PSC = 71`、`ARR = 999`，CNT 从 0 数到 999 正好 1000 次，一次 1 µs，合计 1 ms，和示波器对得上。把 ARR 写成 1000，就变成 1.001 ms，误差 0.1%，示波器上几乎看不出来，跑一天却会慢慢偏出去。

为什么要 +1 这件事值得说透。`PSC` 的分频比是「寄存器值加一」：硬件数到 PSC 就发一次计数脉冲，从 0 数到 71 一共 72 次，所以实际分频比是 $PSC+1$。`ARR` 同理，CNT 从 0 数到 ARR 一共 $ARR+1$ 个数，然后回零。手册里写的是寄存器值，公式里用的是实际次数，差的那一个计数就是这么来的。

<FigBox title="PSC、ARR、CCR 在一条链上的位置" kind="结构" note="PSC 把送进来的时钟除成计数频率 f_cnt；CNT 在这个频率上从 0 数到 ARR；比较器把 CNT 与 CCR 相比决定引脚电平。所以改 ARR 会同时改变频率与占空比（分母变了），而改 CCR 只改变占空比。" >

<svg viewBox="0 0 580 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <rect x="24" y="68" width="96" height="36" rx="3" class="sf-fill"/>
  <text x="72" y="84" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">f_TIM</text>
  <text x="72" y="97" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">72 MHz</text>
  <line x1="120" y1="86" x2="140" y2="86"/>
  <path d="M 146 86 L 138 89.3 L 138 82.7 Z" class="sf-solid"/>
  <rect x="146" y="66" width="104" height="40" rx="3" class="sf-fill"/>
  <text x="198" y="83" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PSC 预分频</text>
  <text x="198" y="97" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">÷ (PSC+1)</text>
  <line x1="250" y1="86" x2="270" y2="86"/>
  <path d="M 276 86 L 268 89.3 L 268 82.7 Z" class="sf-solid"/>
  <text x="263" y="60" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">f_cnt</text>
  <rect x="276" y="66" width="104" height="40" rx="3" class="sf-fill"/>
  <text x="328" y="83" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">CNT 计数</text>
  <text x="328" y="97" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0 … ARR，溢出回零</text>
  <line x1="380" y1="86" x2="400" y2="86"/>
  <path d="M 406 86 L 398 89.3 L 398 82.7 Z" class="sf-solid"/>
  <rect x="406" y="66" width="104" height="40" rx="3" class="sf-fill"/>
  <text x="458" y="83" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">比较器</text>
  <text x="458" y="97" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">CNT 与 CCR 比</text>
  <line x1="510" y1="86" x2="536" y2="86"/>
  <path d="M 542 86 L 534 89.3 L 534 82.7 Z" class="sf-solid"/>
  <text x="548" y="90" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">引脚</text>
  <rect x="276" y="146" width="104" height="28" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="328" y="164" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">ARR：定一轮多长</text>
  <line x1="328" y1="146" x2="328" y2="112"/>
  <path d="M 328 106 L 324.7 114 L 331.3 114 Z" class="sf-solid"/>
  <rect x="406" y="146" width="104" height="28" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="458" y="164" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">CCR：定翻转点</text>
  <line x1="458" y1="146" x2="458" y2="112"/>
  <path d="M 458 106 L 454.7 114 L 461.3 114 Z" class="sf-solid"/>
</svg>

</FigBox>

计数模式有三种，它决定 CNT 怎么走：

- 向上计数：最常用。CNT 从 0 数到 ARR，溢出后回 0，产生更新事件（可以触发中断）。
- 向下计数：从 ARR 数到 0，溢出回 ARR。溢出时刻与向上计数相同，但翻转点落在周期末端，某些斩波场合方便。
- 中心对齐：一个周期内 CNT 先 0→ARR 再 ARR→0，共 $2(ARR+1)$ 步。PWM 波形左右对称，谐波更小。

<FigBox title="中心对齐：一轮要走两趟，所以频率减半" kind="时序" note="CNT 走三角波，比较点两侧各遇到一次，于是输出脉冲在周期正中。代价是走完一轮需要 2(ARR+1) 步，所以同样参数下频率只有边沿对齐的一半：1 MHz 计数、ARR = 999 时是 500 Hz 而不是 1 kHz。" >

<svg viewBox="0 0 480 216" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="24" y="106" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">CNT</text>
  <text x="24" y="192" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输出</text>
  <text x="140" y="44" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">ARR</text>
  <line x1="60" y1="50" x2="420" y2="50" stroke="var(--vp-c-divider)" stroke-width="0.9" stroke-dasharray="3 4"/>
  <line x1="60" y1="90" x2="420" y2="90" stroke="var(--vp-c-brand-2)" stroke-width="1" stroke-dasharray="5 4"/>
  <text x="428" y="94" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">CCR</text>
  <line x1="60" y1="150" x2="420" y2="150" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <text x="428" y="154" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0</text>
  <path d="M 60 150 L 140 50 L 220 150 L 300 50 L 380 150" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
  <path d="M 60 196 L 108 196 L 108 172 L 172 172 L 172 196 L 268 196 L 268 172 L 332 172 L 332 196 L 380 196" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
  <line x1="60" y1="172" x2="60" y2="196" stroke="var(--vp-c-text-3)" stroke-width="0.8"/>
  <text x="240" y="212" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">一轮 = 2(ARR+1) 步，脉冲居中对称</text>
</svg>

</FigBox>

频率与周期公式，记住那个 +1：

$$f_{cnt} = \frac{f_{TIM}}{PSC + 1},\qquad T_{更新} = \frac{ARR + 1}{f_{cnt}} = \frac{(PSC+1)(ARR+1)}{f_{TIM}}$$

顺序也只能是这样：第 1 步定 PSC，挑一个好算的计数频率；第 2 步定 ARR，由目标周期反除出来；第 3 步定 CCR，由占空比乘出来。反过来先定 CCR 会没地方放，因为 $ARR+1$ 是从 $f_{TIM}/(PSC+1)$ 里除出来的。

整条式子连起来读就是 $T=(PSC+1)(ARR+1)/f_{TIM}$。两个 +1 分居上下，动到哪一个，周期都跟着动。

计数来源也可以换，常见的有四种：

- 内部时钟：默认，做定时与 PWM；
- 外部脉冲引脚：直接数脉冲个数，做流量计、转速计；
- 另一个定时器的触发输出：级联，让几路 PWM 同步启动；
- 编码器接口：两相正交输入，硬件自动增减 CNT。

公式是死的，参数是活的，同一条式子在不同板子上要填不同的数。

## 二、定时中断：最基础的用法

要让定时器「每隔 T 精确地做一次事」，两个寄存器该怎么取值，是最好上手的一道题。

用硬件定时器做周期任务，比软件延时可靠得多。软件延时的误差来自循环体每次执行的周期数：一次循环被中断打断、被流水线填充、被编译器重排，几个百分点就累积成肉眼可见的偏差，而且换个优化等级结果就变了。硬件定时器跟代码无关，只跟时钟树有关。

<DemoBox title="定时器 / PWM 演示：调 PSC、ARR、占空比，看周期、频率与波形" hint="载入「1 ms 定时」看 PSC=71、ARR=999 怎么得到 1 ms；再切「50 Hz 舵机」，拖动角度看 CCR 从 500 变到 2500（注意占空比始终很小，舵机只看脉宽）。">
  <TimerPwmDemo />
</DemoBox>

::: tip 例 1 · 用 72 MHz 定时器做 1 ms 定时中断 {#ex-timer-1}
**题目**：定时器时钟 $f_{TIM}=72$ MHz（F103 经典配置，APB1 上的定时器已 ×2），要求每 1 ms 进一次更新中断。求 PSC、ARR，并说明为什么不是 1000。

先猜一下：两个未知数、一个方程，所以有一个自由度。把它用在「让计数频率变成好算的数」上最划算。1 MHz 意味着每次计数正好 1 µs，后面所有时间都能拿微秒数直接当寄存器值写。

第一步，定 PSC。想让 $f_{cnt}=1$ MHz：

$$PSC + 1 = \frac{72\ \text{MHz}}{1\ \text{MHz}} = 72\ \Rightarrow\ PSC = 71$$

第二步，定 ARR。1 ms = 1000 µs，需要数 1000 次：

$$ARR + 1 = 1000\ \Rightarrow\ ARR = 999,\qquad T = \frac{999+1}{1\ \text{MHz}} = 1\ \text{ms}$$

```c
htim2.Instance = TIM2;
htim2.Init.Prescaler = 71;          // PSC
htim2.Init.Period = 999;            // ARR
htim2.Init.CounterMode = TIM_COUNTERMODE_UP;
HAL_TIM_Base_Init(&htim2);
HAL_TIM_Base_Start_IT(&htim2);      // 带中断启动

void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim) {
  if (htim->Instance == TIM2) {
    HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);   // 每 1 ms 翻转一次 → 500 Hz 方波
  }
}
```

为什么不写 1000：CNT 从 0 数到 1000 一共 1001 个数，周期会变成 1001 µs，误差 0.1%。想「数 1000 次」，寄存器就要填 999。

回代验算：$T=(71+1)(999+1)/72\times10^6 = 72000/72\times10^6 = 1$ ms ✓。

为什么选 71 而不是别的：PSC 本身要 +1，选 71 才得到 72 分频。选 PSC 的判据从来不是「好看」，是「除得尽」，例 5 里有个反例。
:::

定时中断把「时间」这条线走通了。定时器更值钱的用法是输出波形，那才是它出现在电机、灯、舵机里的原因。

## 三、PWM 输出：占空比到底在改什么

PWM（Pulse Width Modulation，脉宽调制）用「高电平占多大比例」来等效地给出一个模拟量。占空比（duty cycle）就是这个比例：

$$\text{duty} = \frac{CCR}{ARR+1},\qquad f_{PWM} = \frac{f_{cnt}}{ARR+1},\qquad V_{avg} = V_{CC}\times \text{duty}$$

三个式子各管一件事，正好对上三个寄存器的分工：

1. 改 CCR，只改占空比，频率不动，而且只影响本通道；
2. 改 ARR，频率变，占空比也变，因为分母变了。舵机角度漂移就是这么来的；
3. 改 PSC，计数频率变，频率与分辨率一起变，并且影响该定时器的所有通道。

一句话概括第 2 条：占空比 $=CCR/(ARR+1)$，改 ARR 就是改分母，改 CCR 才是改分子。想要高频率又要高分辨率，唯一出路是把 $f_{cnt}$ 抬上去，因为 $f_{PWM}\times\text{级数}=f_{cnt}$ 这条关系卡在那里，三个量只能转两个。

<FigBox title="一个 PWM 周期里各寄存器怎么对上图" kind="时序" note="同一个计数器同时被三样东西引用：PSC 决定每个刻度多宽，ARR+1 决定刻度总数（周期），CCR 决定高电平段占多少个刻度（占空比）。图中 ARR+1 = 10、CCR = 3，所以占空比 30%、频率为计数频率的十分之一。" >

<svg viewBox="0 0 620 190" role="img" aria-label="PWM 波形与 PSC、ARR、CCR 的对应关系：ARR+1 = 10 个计数、CCR = 3 个计数，占空比 30%">
  <defs>
    <marker id="tpw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
    </marker>
  </defs>
  <g stroke="var(--vp-c-divider)" stroke-width="1">
    <line x1="60" y1="40" x2="560" y2="40" />
    <line x1="60" y1="96" x2="560" y2="96" />
    <line x1="60" y1="34" x2="60" y2="104" />
    <line x1="110" y1="34" x2="110" y2="104" stroke-dasharray="3 3" />
    <line x1="160" y1="34" x2="160" y2="104" stroke-dasharray="3 3" />
    <line x1="210" y1="34" x2="210" y2="104" stroke-dasharray="3 3" />
    <line x1="260" y1="34" x2="260" y2="104" stroke-dasharray="3 3" />
    <line x1="310" y1="34" x2="310" y2="104" stroke-dasharray="3 3" />
    <line x1="360" y1="34" x2="360" y2="104" stroke-dasharray="3 3" />
    <line x1="410" y1="34" x2="410" y2="104" stroke-dasharray="3 3" />
    <line x1="460" y1="34" x2="460" y2="104" stroke-dasharray="3 3" />
    <line x1="510" y1="34" x2="510" y2="104" stroke-dasharray="3 3" />
  </g>
  <text x="6" y="44" font-size="11" fill="var(--vp-c-text-3)">高</text>
  <text x="6" y="100" font-size="11" fill="var(--vp-c-text-3)">低</text>
  <path d="M 60 40 L 210 40 L 210 96 L 560 96" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.5" />
  <g stroke="var(--vp-c-brand-2)" stroke-width="1.5" fill="none">
    <line x1="60" y1="14" x2="560" y2="14" marker-start="url(#tpw-arrow)" marker-end="url(#tpw-arrow)" />
    <line x1="60" y1="30" x2="210" y2="30" marker-end="url(#tpw-arrow)" />
  </g>
  <text x="310" y="10" text-anchor="middle" font-size="11" fill="var(--vp-c-text-2)">一个周期 = ARR+1 = 10 个计数</text>
  <text x="66" y="26" font-size="11" fill="var(--vp-c-text-2)">高电平 = CCR = 3 个计数</text>
  <g font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">
    <text x="85" y="112">CNT 0</text>
    <text x="135" y="112">1</text>
    <text x="185" y="112">2</text>
    <text x="235" y="112">3</text>
    <text x="285" y="112">4</text>
    <text x="335" y="112">5</text>
    <text x="385" y="112">6</text>
    <text x="435" y="112">7</text>
    <text x="485" y="112">8</text>
    <text x="535" y="112">9</text>
  </g>
  <g stroke="var(--vp-c-text-3)" stroke-width="1">
    <line x1="110" y1="120" x2="110" y2="138" />
    <line x1="210" y1="120" x2="210" y2="138" />
    <line x1="560" y1="120" x2="560" y2="138" />
  </g>
  <g font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">
    <text x="110" y="152">PSC 定刻度宽</text>
    <text x="210" y="152">CCR 定翻转点</text>
    <text x="560" y="152">ARR 定周期</text>
  </g>
  <text x="60" y="176" font-size="11" fill="var(--vp-c-text-3)">若 f_cnt = 1 MHz，则刻度宽 1 µs，周期 10 µs（100 kHz），高电平 3 µs，占空比 30%</text>
</svg>

</FigBox>

「等效直流」是低频等效的说法。后级电路带宽远高于 $f_{PWM}$ 时，它看到的近似是一个恒定电压。LED 的热时间常数在几十毫秒量级，1 kHz 的 PWM 对它就是平均电流；换成音频功放的输入端，20 kHz 的载波会被直接放大成可听见的噪声。同一条原理，边界不同。

配置上就三句：

```c
HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);             // 启动 PWM 输出
__HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, 300);    // 改 CCR（占空比）
__HAL_TIM_SET_AUTORELOAD(&htim3, 999);                // 改 ARR（频率）
```

`__HAL_TIM_SET_COMPARE` 只写 CCR，不产生更新事件，所以随时调用都不会打断当前这一轮波形；`__HAL_TIM_SET_AUTORELOAD` 改 ARR 同理，新值下一轮生效。在线调参不出毛刺，靠的就是这一点。

PWM 模式 1 与模式 2 的差别只有一句话：模式 1 是「CNT < CCR 时输出有效电平」，模式 2 反过来。「有效电平」由极性（`TIM_OCPOLARITY_HIGH/LOW`）决定。占空比反了，一定是这两处之一调错。此外还有模式 3、4（PWM + 互补），留给高级定时器的死区控制用。

::: tip 例 2 · 驱动舵机：50 Hz、90° {#ex-timer-2}
**题目**：舵机要求 50 Hz（周期 20 ms）的 PWM，靠绝对脉宽定角度：0.5 ms→0°、1.5 ms→90°、2.5 ms→180°。用 1 MHz 计数频率（PSC = 71）求 ARR 与 CCR。

三个脉宽摆在面前：0.5 ms、1.5 ms、2.5 ms，对应三个角度。舵机只认脉宽，不认占空比，所以顺序必须是先锁频率、再算脉宽。先锁频还有一层意思：ARR 一旦定了就不许动。

第一步，锁频率：

$$ARR + 1 = \frac{1\ \text{MHz}}{50\ \text{Hz}} = 20000\ \Rightarrow\ ARR = 19999$$

第二步，把脉宽换成计数值。1 µs 一个计数，脉宽多少微秒，CCR 就是多少：

| 角度 | 脉宽 | CCR | 占空比 |
| --- | --- | --- | --- |
| 0° | 0.5 ms | 500 | 2.5% |
| 90° | 1.5 ms | 1500 | 7.5% |
| 180° | 2.5 ms | 2500 | 12.5% |

回代验算：$CCR=1500$ → 脉宽 $1500/1\ \text{MHz}=1.5$ ms ✓；占空比 $1500/20000=7.5\%$ ✓。

为什么不能改 ARR：若把 ARR 改成 9999，频率变成 100 Hz，同样写 CCR = 1500，脉宽还是 1.5 ms，可周期变成 10 ms。舵机内部的解码会把「1.5 ms 相对 10 ms」当成另一个指令，角度立刻漂。极端情况下频率远低于 50 Hz，舵机会一直顶到限位不停机，那是真会烧舵机的。改 CCR 就安全，因为它只改脉宽，分母没动。
:::

::: tip 例 3 · PWM 分辨率与频率的取舍 {#ex-timer-4}
**题目**：同一个定时器、1 MHz 计数频率，ARR 取 99、999、9999 三档，各自的频率与占空比步进是多少？该选哪一档？

先看量级：ARR 从 99 到 9999 跨了一百倍，可它们分的是同一块蛋糕。一轮的刻度总数就是 $ARR+1$，它同时决定频率和最小步进，两者只能一起变。

$$f_{PWM} = \frac{1\ \text{MHz}}{ARR+1},\qquad \text{步进} = \frac{1}{ARR+1}$$

| ARR | 频率 | 占空比步进 | 级数 |
| --- | --- | --- | --- |
| 99 | 10 kHz | 1% | 100 级 |
| 999 | 1 kHz | 0.1% | 1000 级 |
| 9999 | 100 Hz | 0.01% | 10000 级 |

怎么选，看负载：

- LED 调光取 ARR = 999，1 kHz、0.1% 步进，人眼完全看不出台阶；
- 舵机频率被锁死在 50 Hz，ARR = 19999，步进 0.005%，分辨率非常富裕；
- 音频、超声波要 20 kHz 以上，ARR 被迫变小，分辨率下降，此时必须提高计数频率（减小 PSC）来补偿。

关系式记这一条就够：$f_{PWM}\times\text{级数} = f_{cnt}$。$f_{cnt}$ 固定时，频率与分辨率此消彼长。

回代验算：$1000 \times 0.1\% = 1$，即「1000 级 × 1 kHz = 1 MHz」，与 $f_{cnt}$ 对得上 ✓。这个此消彼长只在 $f_{cnt}$ 固定时成立，把 PSC 从 71 改成 35，等于把蛋糕本身放大一倍，例 5 就是干这个的。
:::

## 四、输入捕获与编码器接口

输入捕获是 PWM 的逆过程。外部信号的边沿到来时，硬件把此刻的 CNT 值锁存进 CCR，你再读出来。「锁存」意味着这个数不会因为 CNT 继续跑而变。两次捕获之差就是信号周期：

$$\text{周期} = \frac{\Delta CNT}{f_{cnt}},\qquad f = \frac{f_{cnt}}{\Delta CNT}$$

::: tip 例 4 · 用输入捕获测频率，以及它的分辨率极限 {#ex-timer-3}
**题目**：计数频率 1 MHz，捕获配成上升沿触发。测 1 kHz 与 100 kHz 两种信号，各自的计数值与误差是多少？

先算一个周期里有多少个计数，答案会一个比一个小。计数值越大，一个计数带来的相对误差越小，这就是测周期法的精度公式。

| 被测频率 | $\Delta CNT$ | 一个计数对应的频率误差 |
| --- | --- | --- |
| 1 kHz | 1000 | 约 1 Hz（0.1%） |
| 10 kHz | 100 | 约 100 Hz（1%） |
| 100 kHz | 10 | 约 10 kHz（10%） |

高频为什么测不准：$f = f_{cnt}/\Delta CNT$，$\Delta CNT$ 变小时，同样的 ±1 个计数会让 $f$ 跳得更大。100 kHz 时只有 10 个计数，差一个就是 10% 的误差。

解法有两条，管用的那条通常要换思路：

1. 降低 PSC，把计数频率抬上去。72 MHz 计数时 $\Delta CNT$ 变成 720，误差回到 0.14%；
2. 改用测频法：用另一个定时器开 100 ms 闸门，在闸门内累计边沿数 $N$，则 $f=N/0.1$ Hz。误差只取决于闸门本身的精度，与被测信号无关。测高频这是正解。

回代验算：1 MHz 计数、测 1 kHz → $\Delta CNT = 10^6/10^3 = 1000$ ✓，与表一致；频率分辨率 $10^6/1000 - 10^6/1001 \approx 1$ Hz ✓。

还有一个坑：被测信号周期很长时，CNT 可能在两次捕获之间溢出多次，必须把溢出次数一起记进去算。这是输入捕获最常见的进阶错误。
:::

编码器接口走的是另一条路。正交编码器输出 A、B 两相脉冲（相位差 90°），定时器配成编码器模式后，硬件根据两相的相位关系自动判断方向并增减 CNT，软件一个中断都不用写。两条要点：

- 通常配成 TI1 与 TI2 双边沿计数（4 倍频），转一圈的计数 = 物理线数 × 4；
- 测速流程是每隔 10 ms 读一次 CNT，用本次值减上次值：$\text{转速} = \Delta/(\text{线数}\times4)/0.01\ \text{s}$。若 $\Delta$ 长期为负或大幅超过 ARR，说明发生了回绕（低速时溢出）或转向翻转。这时候必须用有符号减法并判断跨越，否则电机一反转，读数就会出现正负跳变甚至恒定不变这类反直觉现象。

数时间和量波形都用不到功率管，推电流要的另一半不在普通定时器上。

## 五、高级定时器：互补输出与死区

TIM1、TIM8 这类高级定时器多出三样东西：互补输出加死区（一对反相的 PWM，中间插入都关断的空档）、刹车输入 BKIN（外部故障信号直接硬件关断输出，比软件快得多）、重复计数器（让 PWM 周期是更新周期的整数倍）。TIM1 一共 4 个通道，其中 3 个带互补输出（CH1/CH1N、CH2/CH2N、CH3/CH3N），CH4 就没有反相脚了。驱动三相 H 桥用前三对刚好够，而那个 8 位的 `DTG` 该填几，是这一段真正会算错的地方。

死区的物理来源值得单独说清。MOSFET 从栅压超过阈值到真正导通、以及从导通到彻底关断，都需要时间，典型几十到几百纳秒，还要加上栅极电荷的充放电。如果上管的下降沿与下管的上升沿严格落在同一时刻，那几十纳秒里两管同时导通，母线电压经它们直接短路到地，这叫直通（shoot-through）。它持续时间极短，但峰值电流可达安培级，反复发生会让开关管和驱动芯片一起烧掉。死区的做法很直接：先让一只彻底关断，再让另一只开始导通。

<FigBox title="互补输出里的死区：两段「都关断」的空档" kind="时序" note="CH1 与 CH1N 互为反相，但翻转时刻错开 t_dead。这两段空档里上下两管都不导通，母线不会短路。代价是高电平被吃掉一点：一个周期总共损失 2·t_dead，所以实际送到电机的电压低于设定值。" >

<svg viewBox="0 0 580 220" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="24" y="54" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">CH1</text>
  <text x="24" y="136" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">CH1N</text>
  <text x="24" y="72" font-size="8.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">上管</text>
  <text x="24" y="154" font-size="8.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">下管</text>
  <rect x="150" y="44" width="10" height="102" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-dasharray="3 3"/>
  <rect x="270" y="44" width="10" height="102" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-dasharray="3 3"/>
  <path d="M 60 50 L 150 50 L 150 80 L 280 80 L 280 50 L 380 50" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
  <path d="M 60 140 L 160 140 L 160 110 L 270 110 L 270 140 L 380 140" stroke="var(--vp-c-brand-2)" stroke-width="2.2"/>
  <text x="155" y="38" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">t_dead</text>
  <text x="275" y="38" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">t_dead</text>
  <line x1="60" y1="180" x2="380" y2="180" stroke="var(--vp-c-text-3)" stroke-width="1"/>
  <path d="M 386 180 L 378 177 L 378 183 Z" class="sf-solid"/>
  <text x="60" y="200" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">阴影段：两管都关断，母线不会被短路</text>
  <text x="60" y="212" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">没有死区 → 两管同时导通 → 直通电流尖峰</text>
</svg>

</FigBox>

::: tip 例 5 · 电机调速：16 kHz、30% 占空比的完整参数 {#ex-timer-5}
**题目**：72 MHz 定时器（TIM1 挂在 APB2，不 ×2，$f_{TIM}=72$ MHz），驱动直流电机，要求 $f_{PWM}=16$ kHz、占空比 30%。求 PSC、ARR、CCR，并核对分辨率。

多数人的第一反应是「PSC 取 71 凑 1 MHz」，这题偏走不通。16 kHz 与 1 MHz 除不尽（62.5），得反过来，先让频率精确，再接受计数频率不是整数兆赫。判据是除得尽，不是好看。

第 1 步，试 1 MHz 行不行：

$$ARR + 1 = \frac{1\times10^6}{16000} = 62.5\ \Rightarrow\ \text{只能取 } 62 \Rightarrow f_{PWM} = \frac{10^6}{62} \approx 16.13\ \text{kHz}$$

偏高 0.8%，不好看，也没必要。

第 2 步，改让 $f_{cnt}$ 除得尽。取 $ARR+1 = 250$，则

$$f_{cnt} = 16000 \times 250 = 4\ \text{MHz} \Rightarrow PSC + 1 = \frac{72\times10^6}{4\times10^6} = 18 \Rightarrow PSC = 17$$

$$ARR = 249,\qquad f_{PWM} = \frac{4\times10^6}{250} = 16000\ \text{Hz}\ \checkmark$$

第 3 步，定 CCR：

$$CCR = 0.30 \times 250 = 75\quad(\text{高电平 } 75/4\ \text{MHz} = 18.75\ \mu\text{s})$$

第 4 步，核对分辨率。步进 $=1/250 = 0.4\%$，也就是 250 级。对直流电机调速，0.4% 的台阶在手感和听感上都无感。

回代验算：$72\times10^6/18 = 4\times10^6$ ✓；$4\times10^6/250 = 16000$ ✓；$75/250 = 0.3$ ✓；周期 $250/4\ \text{MHz} = 62.5\ \mu\text{s}$ ✓。

为什么宁可放弃 1 MHz：16.13 kHz 与 16 kHz 对电机毫无区别，而计数频率偏离 1 MHz 只是让 CCR 的换算系数变了。「除得尽优先」的全部理由就这一条。
:::

::: tip 例 6 · 死区 1 µs 对应 DTG 填多少 {#ex-timer-6}
**题目**：沿用例 5 的参数（$f_{cnt}=4$ MHz、$f_{PWM}=16$ kHz），栅极驱动手册要求死区不小于 1 µs。求 `DTG` 字段的值，并核对它吃掉多少有效占空比。

先问一句这个数按什么计时：死区计数的单位是 $t_{DTS}$，而 $t_{DTS}$ 跟计数频率走，不跟定时器时钟走。这是配死区时最容易取错的地方。

第 1 步，算 $t_{DTS}$：

$$t_{DTS} = \frac{1}{f_{cnt}} = \frac{1}{4\ \text{MHz}} = 250\ \text{ns}$$

第 2 步，求 DTG。在 `DTG[7:0] = 0xxxxxxx` 这一档，$t_{dead} = DTG \times t_{DTS}$：

$$DTG = \frac{1\ \mu\text{s}}{250\ \text{ns}} = 4 \Rightarrow \text{寄存器写 } 0x04$$

第 3 步，核对占空比损失。死区同时吃掉两路输出的导通时间，一个周期总损失 $2t_{dead}$：

$$\Delta = \frac{2\times1\ \mu\text{s}}{62.5\ \mu\text{s}} = 3.2\%$$

所以「给 100% 也只有约 96.8%」。实际可用区间通常要收缩到 5%~95%，并在软件里对 CCR 做上下限钳位。

回代验算：$4 \times 250\ \text{ns} = 1000\ \text{ns} = 1\ \mu\text{s}$ ✓；$2/62.5 = 3.2\%$ ✓。

顺手做两个反向检查：

- 若 $f_{cnt}$ 是 72 MHz（PSC = 0），$t_{DTS} = 13.9$ ns，凑 1 µs 得填 $DTG = 72$；想改成 2 µs 就是 144。一旦超出 8 位量程，必须改用 `CKD` 两位时钟分频把 $t_{DTS}$ 放大。
- 若 PSC 改成 71（$f_{cnt}=1$ MHz），$t_{DTS}=1\ \mu\text{s}$，死区被硬件量化成 1 µs 一档，1 µs 刚好，1.5 µs 就做不到。

死区不是越小越好，也不是越大越安全。定得比开关时间还短等于没设，定得太大会明显压缩可用占空比。取手册最小值加一点余量。
:::

灯、电机、舵机是三拨不同的负载，对这四个数的要求各不相同，同一块板子上常常要同时满足好几拨。

## 六、工程实例

真实产品里这些参数很少单独出现，总是几个旋钮一起拧，而且改错哪一个，后果不一样。

**LED 呼吸灯**。PWM 调光，让 CCR 从 0 平滑升到 ARR 再降回 0。频率取 1~2 kHz、ARR = 999，步进 0.1%。实现上别用软件延时扫亮度，把 CCR 的更新挂到 100 Hz 左右的更新中断上按表递增，中断里只做一次寄存器写入，扫完一轮约 10 ms。

::: tip 亮度不是线性的
人眼对暗部变化更敏感，所以线性 ramp 会觉得「前半段变化快、后半段慢」。产品里通常存一张 256 级的 gamma 表（按平方或指数曲线，如 CIE 1931 校准值），用亮度等级号去查 CCR，而不是把等级号直接当 CCR 写。
:::

**直流电机调速**。频率怎么选是关键。太低（<1 kHz）会听到线圈啸叫并出现抖动，太高（>20 kHz）开关损耗上升，常用区间是 10~20 kHz。参数就是例 5：PSC = 17、ARR = 249 得 16 kHz，CCR 在 0~250 之间连续可调。换上小电机、开关损耗压力不大时，可降到 8 kHz（$ARR+1=500$）换取 0.2% 的更细台阶。别直接照搬「电机说明书里的 25 kHz」，那是电机本体允许的范围，驱动端还得看栅极驱动器能不能在这个周期里塞下死区。

三个场景的参数一览（都按 72 MHz 定时器）：

| 场景 | 频率 | PSC / ARR | CCR 怎么用 |
| --- | --- | --- | --- |
| LED 呼吸灯 | 1 kHz | 71 / 999 | 0→999 扫一轮，按 gamma 表取值 |
| 直流电机 | 16 kHz | 17 / 249 | 0~250 对应 0~100%，实取 5%~95% |
| 舵机 | 50 Hz | 71 / 19999 | 500~2500 对应 0°~180° |

**舵机**。参数完全由例 2 锁死：PSC = 71、ARR = 19999、CCR 写 500~2500。工程上再加两件事。一是用输出比较或输入捕获实测脉宽，确认硬件真的输出了 0.5~2.5 ms，串口转接线上串的二极管会吃掉约 0.6~0.7 V，压降之后脉宽可能不足。二是上电时先把 CCR 写 1500（中间位）再启动输出，避免初始化瞬间输出 0 脉宽，让舵机猛撞限位。

**死区与 H 桥**。每一相都是上下管互补驱动，必须开死区。设 1 µs 死区之后，占空比两端会被压缩甚至钳死，工程上按三条处理：给 100% 其实只有约 96.8%（死区吃掉的那 3.2%，见例 6）；可用调速区间收缩到 5%~95%；软件里对 CCR 做上下限钳位，不允许直接跑到 0 或 $ARR+1$。

死区造成的损失跟 PWM 频率成反比。同样是 1 µs 死区，16 kHz 时吃掉 3.2%，降到 5 kHz 就只剩 1%，周期拉长了，那两段空档占比自然小了。

::: warning 最后一个坑：时基寄存器与通道寄存器是分工的
ARR、PSC 改了，影响该定时器的所有通道与溢出频率；CCR 改了只影响本通道。电机与舵机共用同一个定时器会互相干扰，原因就在这里。一个定时器干一件事，比事后调参数便宜得多。
:::

## 七、易错清单 + 自检

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. PSC、ARR 忘了 +1 → 周期差一个计数，高频时误差放大 → 记住「寄存器值 = 次数 − 1」。
2. 定时器时钟忘了 ×2 → 所有时间差一倍 → APB 分频 ≠ 1 时定时器时钟自动翻倍（见 [04 · 时钟系统](./clock.md)）。
3. 改了 ARR 却没同步改 CCR → 占空比跟着变，舵机角度漂移 → 先锁频率再调 CCR。
4. PWM 引脚没配成复用推挽（F1 上还忘开 AFIO 时钟）→ 定时器在跑，引脚无信号 → 配成复用模式（见 [05 · GPIO](./gpio.md)）。
5. 占空比反了 → 亮度、转速与预期相反 → 检查 PWM 模式 1/2 与输出极性。
6. 中心对齐忘了周期翻倍 → 频率只有设定值的一半 → $T = 2(ARR+1)/f_{cnt}$。
7. 输入捕获测高频时分辨率不够 → ±1 个计数就是百分之几的误差 → 减小 PSC，或改用测频法。
8. 编码器模式没设 4 倍频 → 分辨率少 4 倍 → TI1、TI2 双边沿计数。
9. 死区换算用错基准 → 死区时间差几十倍 → $t_{DTS}$ 跟 $f_{cnt}$ 走，不是 $f_{TIM}$。
10. 死区过大 → H 桥两端调不到 0% 与 100% → 取手册最小值加余量。
11. 把溢出频率当成定时中断周期用 → 数与预期不符 → 溢出频率 $=f_{cnt}/(ARR+1)$，与 CCR 无关。

自检（先自己想，答案在下面一行）：

1. 72 MHz 定时器要产生 1 ms 中断，PSC 与 ARR 各取多少？为什么不是 1000？
2. 舵机 90° 在 50 Hz、1 MHz 计数下的 CCR 是多少？若把 ARR 改成 9999 会怎样？
3. ARR 从 999 改到 99，PWM 频率与占空比步进分别怎么变？16 kHz 下死区 1 µs 对应 DTG 填几？

（答案：PSC = 71、ARR = 999，因为 CNT 从 0 数到 1000 是 1001 个数；CCR = 1500，改 ARR 会改变分母，角度漂移；频率从 1 kHz 升到 10 kHz，步进从 0.1% 变成 1%；$t_{DTS}$ = 250 ns，DTG = 4。）
