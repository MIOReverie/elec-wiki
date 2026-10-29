---
title: 示波器 · 探头带宽触发与地线
description: 探头怎么调补偿、带宽会吃掉多少边沿、触发怎么让波形停住，以及地线夹夹错为什么当场烧板子。
outline: [2, 3]
---

# 示波器

<Meta time="50 min" level="核心" note="示波器能看到的不是电压，是『电压对时间』；探头是电路的一部分，地线夹是大地的一部分" />

万用表给你 1 个数，示波器给你一条线。线里藏着数里没有的东西：上升沿多快、有没有振铃、占空比稳不稳、纹波里是开关频率还是工频干扰、触发点前后发生了什么。

这条线要过 4 道关才画得出来：探头、耦合、触发、显示。哪一关设错，屏幕上那条线就不是电路里的波形。

按手边一台 50~100 MHz 带宽、1 GSa/s 采样率的入门数字示波器（DSO，digital storage oscilloscope，数字存储示波器）来说。换更贵的机器，操作一样，数字会变。

::: tip 读这页之前
会分压和容抗 $X_C = 1/(2\pi f C)$、RC 的时间常数、正弦量的幅值与有效值，探头那一关就过得去（<Prereq id="voltage-divider" />、<Prereq id="time-constant" />、<Prereq id="sine-params" />）。复数用不上，全是实数乘除和平方和。

符号摆在这儿，读的时候回头查：

- $B$：带宽（bandwidth，幅度衰减到 −3 dB 即 0.707 倍时的频率，单位 Hz）
- $t_r$：上升时间（幅度从 10% 走到 90% 花了多久）
- $C_s$：探头里的补偿电容
- CMRR：共模抑制比（common-mode rejection ratio，对两端共同电压的抑制能力，dB 越大越好）

全部约定见[符号与约定](../guide/notation.md)。
:::

## 探头：1X、10X 与补偿

探头拨到 1X 还是 10X，多数人随手一拨就过去了。这一拨决定示波器看到的是电路，还是探头自己。

10X 把输入阻抗从 1 MΩ／几十 pF 提到 10 MΩ／十几 pF，对被测电路的影响小一个数量级，所以它是默认选择。1X 只有三种场合轮得上：测低电平、高阻源、需要低噪声。

还有一个动作是补偿：拿校准方波把探头调平，两分钟，换掉的是后面所有读数的可信度。

### 三种探头，三种用法

| 类型 | 输入阻抗 | 带宽 | 典型用途 |
| --- | --- | --- | --- |
| 1X 无源探头 | 1 MΩ 并联 80~120 pF | 通常 6~20 MHz | 低电平、高阻源、纹波、与 DDS/音频信号 |
| 10X 无源探头 | 10 MΩ 并联 10~20 pF | 常与示波器带宽匹配（50~500 MHz） | 绝大多数通用测量 |
| 差分探头 | 每端数 MΩ 并联数 pF | 几十 MHz 到 GHz | 浮地测量、电流采样、半桥与市电相关电路 |

挑探头的顺序：先用 10X，1X 只在测低电平、高阻源、要低噪声这三件事上出场。差分探头平时不必买，碰到浮地测量再借。

10X 为什么更好，看一眼容抗就明白。1X 探头在 1 MHz 处的容抗只有

$$X_C = \frac{1}{2\pi f C} = \frac{1}{2\pi \times 10^6 \times 100\times10^{-12}} = 1592\ \Omega$$

同样频率下 10X 探头是 10.6 kΩ。一个 1 kΩ 的被测节点上并一只 1592 Ω，读数当场掉三分之一。1X 探头测什么信号都变小、变圆，原因在这儿，不在电路。

### 补偿：两分钟的校准

10X 探头头部有一个可调电容（有的是可调螺丝），跟示波器里的 9 MΩ 串联电阻凑成一个频率补偿的分压器。低频由电阻分压，9 MΩ : 1 MΩ = 10 : 1；高频由电容分压。要想整段频带都保持 10 : 1，两个分压比必须相等：

$$\frac{C_s}{C_s + C_{\text{cable}} + C_{\text{in}}} = \frac{R_{\text{in}}}{R_s + R_{\text{in}}} = \frac{1}{10}$$

一条 1 m 的探头电缆约 100 pF，示波器输入 20 pF，合起来 120 pF，代进去解得

$$C_s = \frac{0.1 \times (100 + 20)}{1 - 0.1} = 13.33\ \text{pF}$$

这个电容就装在探头里，你手里那把绝缘螺丝刀转的就是它。调好之后每 2~3 个月复查一次，换过通道就更要查。

把「探头 ＋ 示波器输入」当成一个频率相关的分压器，理解补偿就快了：低频看电阻，高频看电容，两个分压比都得落在 10 : 1 上。

<FigBox title="10X 探头的等效电路：电阻分压与电容分压必须同时成立" kind="结构" note="左：探头内部是 9 MΩ 串联电阻加可调补偿电容 C_s，示波器输入是 1 MΩ 并联输入电容。低频看电阻分压 10:1，高频看电容分压：C_s 太小欠补偿（圆角），太大过补偿（上冲）。调 C_s 就是让两个分压比在全频段重合。">

<svg viewBox="0 0 560 250" role="img" aria-label="左图 10X 探头等效电路含 9 兆欧串联电阻与补偿电容，右图三种补偿状态的方波形状对比">
<defs>
  <marker id="osc-p1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="120" y="18" text-anchor="middle" font-weight="700">等效电路</text>
  <line x1="30" y1="60" x2="70" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="70" y="48" width="60" height="24" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="100" y="64" text-anchor="middle" fill="var(--vp-c-brand-1)">9 MΩ</text>
  <line x1="130" y1="60" x2="180" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="150" y1="60" x2="150" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <line x1="136" y1="80" x2="164" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="136" y1="90" x2="164" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="150" y1="90" x2="150" y2="110" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="176" y="88" fill="var(--vp-c-brand-1)">C_s 可调</text>
  <line x1="180" y1="60" x2="230" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="230" y1="60" x2="230" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <line x1="216" y1="90" x2="244" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="216" y1="100" x2="244" y2="100" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="230" y1="100" x2="230" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="252" y="98" fill="var(--vp-c-brand-1)">1 MΩ ∥ 20 pF</text>
  <text x="26" y="64" text-anchor="end" fill="var(--vp-c-text-3)">信号</text>
  <line x1="230" y1="130" x2="30" y2="130" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="30" y1="130" x2="30" y2="60" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="130" y="152" text-anchor="middle" fill="var(--vp-c-text-3)">R 分压：9:1 → 10:1（低频）</text>
  <text x="130" y="168" text-anchor="middle" fill="var(--vp-c-text-3)">C 分压：C_s 与后级电容比 → 也要 10:1（高频）</text>

  <text x="420" y="18" text-anchor="middle" font-weight="700">调 C_s 时的方波</text>
  <line x1="320" y1="30" x2="320" y2="80" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="314" y="60" text-anchor="end" fill="var(--vp-c-text-3)">欠：圆角下陷</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" points="322,30 330,58 340,64 360,62 380,58 400,58 420,58 440,58 460,58 480,58" />
  <line x1="320" y1="130" x2="320" y2="180" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="314" y="160" text-anchor="end" fill="var(--vp-c-text-2)">正：方正平顶</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="322,130 328,132 332,130 350,130 370,130 390,130 410,130 430,130 450,130 470,130 490,130" />
  <line x1="320" y1="230" x2="320" y2="180" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="314" y="210" text-anchor="end" fill="var(--vp-c-text-3)">过：上冲振铃</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" points="322,230 330,198 338,192 346,206 354,198 362,204 370,198 380,200 400,198 420,198 440,198 460,198 480,198" />
  <text x="420" y="244" text-anchor="middle" fill="var(--vp-c-text-3)">目标：四角是直角、平顶水平、无过冲无圆角</text>
</g>
</svg>

</FigBox>

| 补偿状态 | 在高频方波上的表现 | 高频增益相对低频 |
| --- | --- | --- |
| 欠补偿（$C_s$ 偏小，如 10 pF） | 上升沿圆角、幅度偏小、平顶下陷 | 0.77 倍 |
| 正好（$C_s \approx 13.3$ pF） | 方正的方波 | 1.00 倍 |
| 过补偿（$C_s$ 偏大，如 26.7 pF） | 上升沿上冲、振铃 | 1.82 倍 |

探头上的 1X / 10X 开关，和示波器里那个探头倍率设置必须对上。对不上，读数就差 10 倍，而且屏幕上一点提示都没有。1X 探头身上没有这个可调电容，宽带只能靠 10X 补。

操作步骤：

1. 探头拨到 10X；
2. 探头尖端钩住示波器前面板的 1 kHz / 3 V（不同型号可能是 1 V 或 5 V）校准方波输出，地线夹夹在旁边的地柱上；
3. 按 `AUTO`，或者手动把时基调到 500 μs/div、垂直 1 V/div；
4. 用绝缘螺丝刀慢慢转探头尾部的补偿螺丝，转到方波四个角都是直角、平顶水平、无过冲无圆角为止；
5. 换通道要每只探头单独做一遍。探头换了通道，补偿就得重调。

这 5 条里，第 2 步和第 3 步决定成败，其余三步是收尾。

> 补偿做错的代价不是「看起来不好看」，而是高频段的分压比错了。一个欠补偿的探头会把 50 MHz 以上的成分压掉 30%，于是你测到一个方方正正的开关波形，而它身上带着你没看到的大振铃。

## 带宽与上升时间

**带宽**（$B$）是幅度衰减到 −3 dB（0.707 倍）的那个频率。它决定示波器自己最快能看清多陡的边沿，粗算一句就是 $t_r \approx 0.35/B$：100 MHz 的机子对应 3.5 ns，想从 10 ns 的上升沿里读出准数，带宽得留 3~5 倍余量。买机器时看它，怀疑读数时也看它。

**上升时间**（$t_r$）指幅度从 10% 走到 90% 的那一段。对一阶低通模型，阶跃响应的时间常数 $\tau = 1/(2\pi B)$，对应的 10%–90% 上升时间为

$$t_r \approx \frac{0.35}{B}$$

| 带宽 | 对应上升时间 | 能测多快的边沿 |
| --- | --- | --- |
| 20 MHz | 17.5 ns | 50 ns 以上的边沿（勉强） |
| 50 MHz | 7.0 ns | 20 ns 以上 |
| 100 MHz | 3.5 ns | 10 ns 以上 |
| 200 MHz | 1.75 ns | 5 ns 以上 |
| 500 MHz | 0.70 ns | 2 ns 以上 |

测出来的上升时间永远是「信号 + 示波器」的合成，按平方和叠加：

$$t_{r,\text{测得}} \approx \sqrt{t_{r,\text{信号}}^2 + t_{r,\text{示波器}}^2}$$

100 MHz 的机器测一个真实 20 ns 的上升沿，读到 $\sqrt{3.5^2 + 20^2} = 20.3$ ns，够用。测一条 3.5 ns 的边沿，读到 $\sqrt{3.5^2 + 3.5^2} = 4.95$ ns，比真实值慢 41%。这就是「带宽要 3~5 倍于信号」的来历。三个带宽档位对同一条 5 ns 边沿做了什么，一张图看完：

<FigBox title="带宽不足如何吃掉一条 5 ns 的边沿" kind="波形" note="三条曲线是同一信号经不同带宽示波器后的样子：100 MHz 时边沿只被拉长一点，读数可信；20 MHz 时边沿被拉成 18 ns，幅度也开始掉。判断标准就是 $t_r \approx 0.35/B$ 与平方和叠加。">

<svg viewBox="0 0 560 240" role="img" aria-label="同一 5 纳秒上升沿经不同带宽示波器后的波形：100 兆赫基本保持，20 兆赫被拉长成 18 纳秒">
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="280" y="16" text-anchor="middle" font-weight="700">真实信号上升沿 t_r = 5 ns（灰色为基准）</text>
  <line x1="40" y1="200" x2="540" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="40" y1="60" x2="40" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="36" y="56" text-anchor="end">5 V</text>
  <text x="36" y="204" text-anchor="end">0 V</text>
  <polyline fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" points="100,200 140,200 145,60 300,60" />
  <text x="152" y="52" fill="var(--vp-c-text-3)">真实边沿（5 ns）</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="100,200 140,200 152,76 170,64 300,62" />
  <text x="176" y="80" fill="var(--vp-c-brand-1)">100 MHz：6.1 ns，可信</text>
  <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" points="100,200 140,200 175,150 205,120 235,102 265,88 300,80" />
  <text x="212" y="140" fill="var(--vp-c-text-2)">20 MHz：18.2 ns，边沿与幅度全失真</text>
  <text x="290" y="228" text-anchor="end" fill="var(--vp-c-text-3)">时间 →</text>
  <text x="280" y="248" text-anchor="middle" fill="var(--vp-c-text-3)">判据：信号上升时间 ≥ 3 × 示波器固有上升时间，读数误差 5% 以内</text>
</g>
</svg>

</FigBox>

> 更实用的判断：被测信号的上升时间比示波器的固有上升时间大 3 倍以上，边沿误差就在 5% 以内。边沿本身比带宽更要紧。频率低不代表边沿慢，1 kHz 的方波如果上升沿是 5 ns，一样要 100 MHz 以上的带宽。

## 触发：让波形停住

波形在屏幕上乱滚，新手总先怀疑机器坏了。九成是触发没设对。触发决定的是波形稳不稳，不是波形存不存在。它给采集定一个起点条件，条件满足才从那一点开始画。

数字示波器能把波形定在屏幕上，靠的就是在满足条件的事件上开始采集。触发菜单里最常用的几个参数：

| 参数 | 选项 | 什么时候用 |
| --- | --- | --- |
| 触发源 | CH1 / CH2 / 外触发 | 看哪个通道的信号，就触发哪个 |
| 触发电平 | 屏幕上一个可调的横线 | 放在幅度的 20%~80% 之间都能触发，最常用是幅度中点（50%） |
| 触发边沿 | 上升沿 / 下降沿 | 看上升沿用上升沿触发，看 PWM 的下降沿用下降沿 |
| 触发模式 | Auto / Normal / Single | Auto 用于「先让它显示出来」；Normal 用于「只在满足条件时更新」；Single 用于抓单次事件 |

<FigBox title="触发电平与边沿：每一次采集都从满足条件的那个点开始" kind="波形" note="左边是触发条件：电平线设在幅度中点、选上升沿。信号每次上穿这条线，采集就从那里开始，于是每屏波形都对齐在同一个相位上。右边对比三种模式：Auto 找不到触发也硬刷，Normal 只在满足条件时更新，Single 抓一次就停。">

<svg viewBox="0 0 560 250" role="img" aria-label="左图触发电平与上升沿示意，右图 Auto Normal Single 三种模式的行为对比">
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="140" y="16" text-anchor="middle" font-weight="700">触发条件</text>
  <line x1="30" y1="130" x2="270" y2="130" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="30" y1="50" x2="270" y2="50" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="26" y="54" text-anchor="end">3.3 V</text>
  <text x="26" y="134" text-anchor="end">0 V</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="30,130 70,130 74,124 78,96 82,60 82,50 122,50 126,56 130,84 134,120 138,130 178,130 182,124 186,96 190,60 190,50 230,50 234,56 238,84 242,120 246,130 270,130" />
  <line x1="30" y1="90" x2="270" y2="90" stroke="var(--vp-c-text-2)" stroke-width="1.4" stroke-dasharray="5 3" />
  <text x="274" y="94" fill="var(--vp-c-text-2)">触发电平（中点）</text>
  <circle cx="81" cy="90" r="4" fill="var(--vp-c-brand-1)" />
  <text x="86" y="76" fill="var(--vp-c-brand-1)">上穿此点 → 开始采集</text>
  <text x="140" y="164" text-anchor="middle" fill="var(--vp-c-text-3)">每屏波形都从这一个相位对齐，所以「停住」</text>

  <text x="420" y="16" text-anchor="middle" font-weight="700">三种模式</text>
  <rect x="320" y="34" width="220" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" />
  <text x="330" y="52" fill="var(--vp-c-text-2)">Auto</text>
  <text x="330" y="70" fill="var(--vp-c-text-3)">没触发也按固定间隔刷新 → 波形可能滚</text>
  <rect x="320" y="96" width="220" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" />
  <text x="330" y="114" fill="var(--vp-c-text-2)">Normal</text>
  <text x="330" y="132" fill="var(--vp-c-text-3)">只在满足条件时更新 → 稳定但可能空屏</text>
  <rect x="320" y="158" width="220" height="52" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" />
  <text x="330" y="176" fill="var(--vp-c-text-2)">Single</text>
  <text x="330" y="194" fill="var(--vp-c-text-3)">抓一次就停 → 上电浪涌、毛刺、复位沿</text>
  <text x="420" y="234" text-anchor="middle" fill="var(--vp-c-text-3)">调试先用 Auto 找信号，测量换 Normal，抓偶发用 Single</text>
</g>
</svg>

</FigBox>

三种模式的区别值得背下来：

- Auto（自动）：没有触发也按固定间隔刷新，波形可能滚。调试初期用它把信号找出来。
- Normal（正常）：只在触发时更新，稳，但屏幕可能一直空着。确认信号存在以后，用它做测量。
- Single（单次）：只抓一次，抓完停住。抓上电瞬间的浪涌、毛刺、复位沿。

高级触发能救急：脉冲宽度触发抓窄于 10 ns 的毛刺，另有欠幅触发、上升时间触发、串行总线触发（UART/I²C 解码）。毛刺抓不到的时候，先别急着说信号不存在，先回头看看触发。

## 耦合：DC、AC 与接地

| 耦合方式 | 实际行为 | 什么时候用 |
| --- | --- | --- |
| DC | 直通 | 默认，看真实电压 |
| AC | 串联一个约 0.1 μF 的电容 | 只看交流成分，如看纹波、噪声、音频 |
| GND | 断开输入，显示 0 V 基线 | 校准零位、确认探头位置 |

AC 耦合带一个高通转折频率（典型 1~10 Hz），缓慢变化的分量会被它吃掉。看纹波用 AC 耦合是对的，但要知道，用 AC 耦合看到的纹波幅度，和用 DC 耦合加放大到 10 mV/div 看到的，在低频处可能对不上。还有一种情况容易误判：瞬间注进去的直流突变会让 AC 耦合输出一个衰减很慢的「跳变」，那不是信号。

GND 耦合算不上测量。它只是把 0 V 那条横线对齐到屏幕上的固定刻度，好把地电平放到便于读数的位置。

## 地线夹：最危险的那根线

示波器的地线夹通过外壳接大地。它不是负极，是**大地**的延伸。这句话听着平淡，代价是烧板子、烧探头，甚至烧到笔记本。

### 它到底连到了哪里

单端示波器的 BNC 外壳、探头地线、后面板的地端子，在仪器内部是连通的；仪器外壳又通过三脚插头中间那根接大地（PE）。所以手里那个鳄鱼夹就是大地：

<FigBox title="地线夹的真实路径：探头地 → 示波器外壳 → 插座 PE → 大地" kind="结构" note="整条绿色路径在仪器内部与电网的地是连通的。把地线夹夹到任何对大地有电压的点上，都等于用这根细地线把这个电压直接对地短路，浪涌电流走的就是这条路。">

<svg viewBox="0 0 560 200" role="img" aria-label="探头地线经示波器外壳与三脚插头连到插座保护地再到大地的路径图">
<defs>
  <marker id="osc-g1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="20" y="40" width="120" height="60" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="80" y="66" text-anchor="middle" fill="var(--vp-c-brand-1)">被测电路</text>
  <text x="80" y="84" text-anchor="middle" fill="var(--vp-c-text-3)">那个「以为是地」的点</text>
  <line x1="140" y1="70" x2="200" y2="70" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#osc-g1)" />
  <text x="170" y="60" text-anchor="middle" fill="var(--vp-c-brand-1)">探头地线夹</text>
  <rect x="200" y="40" width="140" height="60" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="270" y="66" text-anchor="middle">示波器</text>
  <text x="270" y="84" text-anchor="middle" fill="var(--vp-c-text-3)">BNC 外壳 = 机壳</text>
  <line x1="340" y1="70" x2="400" y2="70" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#osc-g1)" />
  <text x="370" y="60" text-anchor="middle" fill="var(--vp-c-brand-1)">三脚插头 PE 脚</text>
  <rect x="400" y="40" width="130" height="60" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="465" y="66" text-anchor="middle">墙上插座</text>
  <text x="465" y="84" text-anchor="middle" fill="var(--vp-c-text-3)">保护地 → 大地</text>
  <text x="280" y="140" text-anchor="middle" fill="var(--vp-c-brand-1)">整条路径电气连通，阻抗可能只有 0.1 Ω</text>
  <text x="280" y="160" text-anchor="middle" fill="var(--vp-c-text-2)">被测点对大地有 U 伏 → 短路电流理论值 = U / 0.1 Ω</text>
  <text x="280" y="182" text-anchor="middle" fill="var(--vp-c-text-3)">这条线是全实验台唯一一根「夹错立刻炸」的线</text>
</g>
</svg>

</FigBox>

这么接不是为了省事，是为了安全：示波器本身得接大地，探头才能稳定测量。麻烦在于，很多人把黑鳄鱼夹当成一根普通的负极线。

### 夹错会发生什么

情形一，夹到电路里非地的点。比如 H 桥一个开关管的源极，或者开关电源的开关节点。那个点对大地有一个电压 $U$，示波器地线就被加上这个电压，几十安的浪涌电流灌进地线，路径是：探头地线 → 探头外壳 → 示波器 → 墙上插座的地线 → 被测板的另一个接地点。这条路的阻抗可能只有 0.1 Ω，100 V 的电位差就是 1000 A 的理论电流。

后果通常是：探头地线冒烟、示波器输入通道烧毁、被测板的地平面烧出焦痕。更糟的一种，你的 220 V 电路顺着示波器地线摸进了笔记本的 USB 口。

情形二，两个探头的黑夹子夹在两个不同的「地」上。一路测市电整流后的母线地，另一路测控制板的信号地，两块地之间只要有电位差，两个鳄鱼夹就通过示波器地线把这个差短路了。电流全走示波器地线。

情形三，夹到「以为是地」的负电源轨上。一个 ±12 V 双电源系统，逻辑地是中间那根。你要是把黑夹子夹在 −12 V 上，示波器就把 −12 V 当成 0 V，屏幕上那个波形在 0 V 以下正向偏移 12 V，读数全错；此刻若还有别的接地连接，一样会短路。

### 正确的做法

1. 地线夹只夹在被测电路真正的参考地，也就是与安全地直接相连的那一点；
2. 电路里有多个地（模拟地、数字地、功率地）时只选一个点，最好是你自己能确认与大地之间没有电位差的那个；
3. 要测两个点的电位差，用差分探头，或者两通道相减，绝不拿 1 只探头跨两点；
4. 确认示波器是三脚头，插座有有效的 PE。有人故意让示波器浮空使用，那就必须用隔离变压器，并且清楚这等于取消了保护。

> 记一条：整个实验台上，唯一一根夹错了会立刻炸的线，就是示波器的地线夹。别的线接错一般是读数错，它接错往往是器件烧。

### 探头地线本身也是一根电感

探头地线一般长 10~15 cm。一段 10 cm 直导线的电感约 0.1 μH。电流以 $di/dt$ 的速率变化，它上面就冒出一个感应电压：

$$u_L = L\frac{di}{dt}$$

| $di/dt$ | 10 cm 地线上的感应电压 |
| --- | --- |
| 1 A/μs | 0.10 V |
| 10 A/μs | 1.00 V |
| 100 A/μs | 10.0 V |

所以看开关电源的开关节点、或者 MOSFET 的开关波形时，必须换上探头自带的**短地弹簧**（ground spring，接地弹簧，把地回路压到最短的探头配件），把头套直接压在旁边的地过孔上，把地回路压到 5 mm 以内。不换，你会看到一个由探头地线造出来的振铃。两种接法差多少：

<FigBox title="长地线夹 vs 短地弹簧：假振铃是地线电感造出来的" kind="结构" note="左：长地线夹 10 cm，电感约 0.1 μH，开关电流的 di/dt 在它上面感应出像振铃的电压，你看到的抖动不是电路的，是地线的。右：短地弹簧把回路压到 5 mm 内，感应电压小 20 倍以上，测开关波形必须用它。">

<svg viewBox="0 0 560 230" role="img" aria-label="左图长地线夹在开关电流下感应出假振铃，右图短地弹簧贴近焊盘测得干净波形">
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="130" y="16" text-anchor="middle" font-weight="700">长地线夹（10 cm，≈0.1 μH）</text>
  <rect x="40" y="40" width="90" height="34" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="85" y="61" text-anchor="middle">被测板</text>
  <line x1="130" y1="52" x2="180" y2="40" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="182" y="36" fill="var(--vp-c-brand-1)">探头尖</text>
  <path d="M 175 58 C 150 92, 100 96, 78 76" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="52" y="106" fill="var(--vp-c-text-2)">地线夹绕一大圈</text>
  <text x="130" y="136" text-anchor="middle" fill="var(--vp-c-text-3)">10 A/μs → 地线上 1.0 V 假电压</text>
  <line x1="40" y1="150" x2="220" y2="150" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" points="50,150 70,150 72,130 74,164 76,124 78,168 80,128 84,158 88,138 92,152 96,144 100,150 220,150" />
  <text x="130" y="188" text-anchor="middle" fill="var(--vp-c-text-3)">看到：边沿上的「振铃」（多半是假的）</text>

  <text x="430" y="16" text-anchor="middle" font-weight="700">短地弹簧（≈5 mm）</text>
  <rect x="340" y="40" width="90" height="34" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="385" y="61" text-anchor="middle">被测板</text>
  <line x1="430" y1="52" x2="470" y2="46" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="472" y="42" fill="var(--vp-c-brand-1)">探头尖</text>
  <line x1="466" y1="56" x2="430" y2="70" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="422" y="86" fill="var(--vp-c-text-2)">地弹簧贴焊盘</text>
  <text x="430" y="112" text-anchor="middle" fill="var(--vp-c-text-3)">回路 5 mm：感应电压缩小 20 倍以上</text>
  <line x1="340" y1="130" x2="520" y2="130" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="350,130 390,130 394,104 398,130 520,130" />
  <text x="430" y="168" text-anchor="middle" fill="var(--vp-c-text-3)">看到：干净的边沿，这才是电路的真实波形</text>
  <text x="280" y="206" text-anchor="middle" fill="var(--vp-c-text-2)">测开关电源、MOSFET 波形：先换短地弹簧，再谈波形好不好</text>
</g>
</svg>

</FigBox>

## 测 PWM 占空比

**占空比**（duty cycle，一个周期里高电平占的比例）是日常测得最多的一项。三个动作：找到周期，找到高电平时间，两者相除。

时基先把屏幕上塞满 2~3 个完整周期，光标两端才看得清。每屏 2~3 个周期是经验值：多了光标挤在一起，少了连一个整周期都放不下。25 kHz 的 PWM：

$$T = \frac{1}{25\times10^3} = 40.0\ \mu\text{s}$$

屏幕 10 格 × 10 μs/div = 100 μs，正好 2.5 个周期，合适。

光标读数：两根竖直光标，一根放在上升沿的 50% 处，一根放在下降沿的 50% 处，读出的 Δt 就是高电平时间 $T_H$，于是

$$D = \frac{T_H}{T} \times 100\%$$

12.5% 占空比对应 40 μs 里的 5.00 μs。光标放哪、读哪段，看图：

<FigBox title="光标怎么放：T_H 在两个 50% 点之间，T 在两个同相边沿之间" kind="波形" note="虚线是 50% 电平，两根竖直光标夹住高电平时间 T_H；周期 T 取两个相邻上升沿同一点。25 kHz 信号时基 10 μs/div 时屏幕正好 2.5 个周期，光标两端都看得清。">

<svg viewBox="0 0 560 230" role="img" aria-label="方波上标注周期与高电平时间的光标测量法，50 百分电平与两根竖直光标">
<defs>
  <marker id="osc-c1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="30" y1="60" x2="540" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="30" y1="160" x2="540" y2="160" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="26" y="64" text-anchor="end">3.3 V</text>
  <text x="26" y="164" text-anchor="end">0 V</text>
  <line x1="30" y1="110" x2="540" y2="110" stroke="var(--vp-c-text-2)" stroke-width="1" stroke-dasharray="4 4" />
  <text x="544" y="114" fill="var(--vp-c-text-2)">50%</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="40,160 90,160 95,152 100,72 105,60 185,60 190,68 195,148 200,160 280,160 285,152 290,72 295,60 375,60 380,68 385,148 390,160 470,160 475,152 480,72 485,60 540,60" />
  <line x1="100" y1="30" x2="100" y2="190" stroke="var(--vp-c-brand-1)" stroke-width="1.2" stroke-dasharray="3 3" />
  <line x1="195" y1="30" x2="195" y2="190" stroke="var(--vp-c-brand-1)" stroke-width="1.2" stroke-dasharray="3 3" />
  <line x1="100" y1="22" x2="195" y2="22" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-start="url(#osc-c1)" marker-end="url(#osc-c1)" />
  <text x="148" y="16" text-anchor="middle" fill="var(--vp-c-brand-1)">光标 Δt = T_H = 5.00 μs</text>
  <line x1="100" y1="206" x2="290" y2="206" stroke="var(--vp-c-text-2)" stroke-width="1.4" marker-start="url(#osc-c1)" marker-end="url(#osc-c1)" />
  <text x="195" y="222" text-anchor="middle" fill="var(--vp-c-text-2)">T = 40.0 μs（相邻上升沿同一点）</text>
  <text x="430" y="222" text-anchor="middle" fill="var(--vp-c-text-3)">D = 5.00 / 40.0 = 12.5%</text>
</g>
</svg>

</FigBox>

自动测量：现代示波器有 Frequency、Period、+Width（正脉宽）、−Width、Duty Cycle 这些项，通常也按 50% 电平判定，还会做多次平均。数值比手动光标准，但要注意它取的是哪个周期。PWM 一旦被抖动（jitter）调制，单次读数和多次平均能差很远。

采样率与周期数：1 GSa/s 的机器测 25 kHz 信号，一个周期有 40000 个采样点，精确得没话说。反过来，PWM 换到 2 MHz，一个周期只有 10 μs，屏幕 10 格、每格 100 ns，1 GSa/s 只剩 10 个点/格，波形还看得见，但边沿只有 2~3 个采样点，读数精度到头了。想看清 2 MHz 的边沿，要么提高采样率，要么缩短时基窗，用单次触发后放大的延迟扫描。

## 测电源纹波

**纹波**（ripple，直流电源输出上叠加的交流成分）通常是开关频率的整数倍，也是开关电源和线性电源最实在的差别之一。测它的时候，纹波被地线电感与高频噪声淹掉的机会，比被测不准的机会大得多。

标准做法，三样东西一起上：10X 探头、短地弹簧、20 MHz 带宽限制。少一样，读数里就多一层假成分。

1. 优先用 10X 探头加短地弹簧。1X 探头的 $B$ 通常只有 6~20 MHz，电源纹波里那些几十 MHz 的开关边沿会被它抹平；1X 的输入电容又大（约 100 pF），高频上等于给被测电源加了负载。只有确定带宽与输入电容不影响结果，才用 1X。
2. 探头尖端直接点输出电容的正极焊盘，地弹簧压在旁边最近的接地焊盘上，两条路径合起来不超过 5 mm。
3. 垂直档位调到 10 或 20 mV/div，AC 耦合。
4. 打开 20 MHz 带宽限制，把高频环境噪声滤掉。这一条会让读数从 200 mV 掉到 50 mV，别当成测坏了。
5. 记录峰峰值 $U_{pp}$（一条波形最高点与最低点之差，等于正峰到负峰的全宽；纹波习惯用它报，见[符号与约定](../guide/notation.md)），同时记下当时的负载电流与输入电压。

长地线夹为什么不行：纹波是 mV 级，10 cm 地线在 500 kHz 上对应的感抗有几十到几百毫欧，任何开关电流流过去都变成几十毫伏的假纹波。你测到的可能只是地线自己的电感。

看纹波要问三件事：

- 它是开关频率（例如 500 kHz）还是工频（50/100 Hz）？前者查滤波电容与电感，后者查整流与变压器屏蔽。
- 峰峰值随负载怎么变？开关电源轻载时可能进跳周期模式，纹波反而变大。
- 有没有尖峰（spike，开关器件反向恢复与寄生电感造成的窄脉冲）？带宽限制下看着不明显，但它会耦合进后级电路。

<FigBox title="一次纹波测量该看到什么：开关纹波 + 尖峰 + 20 MHz 限制后的样子" kind="波形" note="绿色是 AC 耦合、20 MHz 带宽限制后的典型纹波：与开关频率同周期的三角状成分。灰色虚线提示被限制滤掉的窄尖峰，它们仍然存在于电路里，只是这台设置看不见，需要时另开全带宽单独确认。">

<svg viewBox="0 0 560 220" role="img" aria-label="开关纹波波形：周期性三角纹波叠加窄尖峰，20 兆赫带宽限制后尖峰被滤掉">
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="30" y1="110" x2="540" y2="110" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="26" y="114" text-anchor="end">0</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="40,86 60,110 80,134 100,110 120,86 140,110 160,134 180,110 200,86 220,110 240,134 260,110 280,86 300,110 320,134 340,110 360,86 380,110 400,134 420,110 440,86 460,110 480,134 500,110 520,86 540,110" />
  <text x="290" y="160" text-anchor="middle" fill="var(--vp-c-brand-1)">开关纹波：与开关频率同周期（如 500 kHz）</text>
  <line x1="140" y1="60" x2="140" y2="40" stroke="var(--vp-c-text-3)" stroke-width="1" marker-start="url(#osc-c1)" />
  <text x="146" y="36" fill="var(--vp-c-text-3)">窄尖峰位置（被 20 MHz 限制滤掉）</text>
  <text x="290" y="190" text-anchor="middle" fill="var(--vp-c-text-2)">记录：峰峰值 + 当时的负载电流与输入电压，缺一个都无法对比</text>
</g>
</svg>

</FigBox>

## 用 FFT 看开关噪声

FFT（fast Fourier transform，快速傅里叶变换）把一段时域波形拆成「有哪些频率、各多大」。找干扰源的时候，它比肉眼看波形快得多。

| 设定 | 含义 | 建议 |
| --- | --- | --- |
| FFT 点数 $N$（记忆深度） | 频率分辨率 $\Delta f = f_s / N$ | 分辨率不够就加大 $N$ 或降低采样率 |
| 采样率 $f_s$ | 决定最高可分析频率 $f_s/2$ | 只看 1 MHz 以内就降到 10 MSa/s |
| 窗函数 | 矩形 / Hanning / 平顶 | 看已知频率用矩形；看幅值精度用平顶；看噪声本底用 Hanning |
| 平均次数（Averaging） | 多次平均降低噪声本底 | 噪声测量时开 8~64 次 |

举个例子：一个 500 kHz 的降压电路，FFT 上应该站着一排 500 kHz、1 MHz、1.5 MHz 的谐波。这里有个硬条件，采样率必须高于你想看的最高谐波频率的两倍（奈奎斯特定理）。想看到第 10 次谐波（5 MHz），或者一个 500 kHz 开关电源的第 7 次谐波（3.5 MHz），采样率就不能低于 10 MSa/s。否则高次谐波会折叠到低频去（混叠），你会在 3 MHz 以下看到一个可能并不存在的峰。

噪声本底：8 位 ADC 的理论信噪比是 $6.02 \times 8 + 1.76 = 49.9$ dB，10 位是 62.0 dB。FFT 上看到的噪声本底不会比这个更低（除非做了平均）。所以判断「噪声很小」之前，先知道示波器自己有多少位。

## 差分测量

两个点都不是地的时候怎么测？单端探头的地线夹夹哪个都不对，一夹就是短路，只能换方法。三种做法按成本排：差分探头、两通道相减、隔离技术。正确性也按这个顺序排。

<FigBox title="差分测量的三种做法与适用边界" kind="结构" note="A 差分探头：两个输入端都对地高阻，内部仪表放大器只取差值，共模几百伏也能抑制，最贵最正确。B 两通道相减：零成本，但两只探头的地夹必须夹同一点，且共模抑制取决于增益失配，10% 失配在 100 V 共模下残差 10 V。C 隔离技术：取消保护地的方案，新手不要碰。">

<svg viewBox="0 0 560 260" role="img" aria-label="差分测量三种做法的结构框图与优缺点对比">
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="16" y="30" width="160" height="76" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="96" y="52" text-anchor="middle" fill="var(--vp-c-brand-1)">A · 差分探头</text>
  <text x="96" y="70" text-anchor="middle" fill="var(--vp-c-text-3)">两端高阻、内部取差</text>
  <text x="96" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">CMRR 60~100 dB</text>
  <text x="200" y="72" fill="var(--vp-c-text-2)">← 最贵，也最正确</text>

  <rect x="16" y="126" width="160" height="92" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="96" y="148" text-anchor="middle" fill="var(--vp-c-text-2)">B · 两通道相减</text>
  <text x="96" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">CH1 − CH2</text>
  <text x="96" y="182" text-anchor="middle" fill="var(--vp-c-text-3)">前提：两黑夹夹同一点</text>
  <text x="96" y="198" text-anchor="middle" fill="var(--vp-c-text-3)">探头同型号、补偿一致</text>
  <text x="200" y="168" fill="var(--vp-c-text-2)">← 零成本，只适用小共模</text>

  <rect x="16" y="238" width="160" height="56" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="5 3" />
  <text x="96" y="260" text-anchor="middle">C · 隔离技术</text>
  <text x="96" y="278" text-anchor="middle" fill="var(--vp-c-text-3)">取消保护地，新手勿用</text>

  <rect x="320" y="30" width="224" height="100" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <text x="332" y="52" fill="var(--vp-c-text-2)">B 的代价：增益失配直接变成误差</text>
  <text x="332" y="74">10% 失配 → CMRR 20 dB</text>
  <text x="332" y="92">共模 100 V → 残差 10 V</text>
  <text x="332" y="110" fill="var(--vp-c-text-3)">你要测的可能是 100 mV 的采样压降</text>

  <rect x="320" y="150" width="224" height="100" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <text x="332" y="172" fill="var(--vp-c-text-2)">安全规则</text>
  <text x="332" y="194">· 涉及 220 V：没有专业差分探头就不测</text>
  <text x="332" y="212">· 必须隔离时，隔离被测设备，不隔离示波器</text>
  <text x="332" y="230">· 任何时刻，两只黑夹只能夹同一点</text>
</g>
</svg>

</FigBox>

### 三种做法

做法 A，差分探头。买一个有源的差分探头，内部就是一个仪表放大器。它有两个输入端子，**共模抑制比**（CMRR，common-mode rejection ratio）在 60~100 dB 量级，几百伏的共模也压得住。最贵，也最正确。

做法 B，两通道相减（CH1 − CH2）。两只 10X 探头分别接两个点，示波器用数学功能算 $CH1 - CH2$。前提有三条：

1. 两个通道的地线夹必须夹在同一点（真实参考地），做不到就不能这么干；
2. 两只探头经过相同的补偿，最好同型号；
3. 相位与增益匹配。

两通道相减的 CMRR 全看两只探头的增益失配：

$$\text{CMRR} = 20\log_{10}\left(\frac{1}{\delta}\right)$$

| 增益失配 | 对应 CMRR | 共模 100 V 时的残余 |
| --- | --- | --- |
| 1% | 40.0 dB | 1.0 V |
| 2% | 34.0 dB | 2.0 V |
| 5% | 26.0 dB | 5.0 V |
| 10% | 20.0 dB | 10.0 V |

也就是说，两通道相减对「小差分、大共模」几乎无能为力。你要测的是 100 mV 的采样电阻压降，共模是 100 V，10% 失配就是 10 V 的误差。它只适合共模本身不大的场合。

做法 C，隔离技术。用电池供电的便携示波器（Fluke 等品牌的某些手持型号）、隔离变压器（不推荐，等于取消了保护地）、或者隔离放大器。这些都不是给新手用的，误用会造成人身伤害。

### 安全规则

- 涉及市电（220 V）的测量，没有专业差分探头与隔离电源就不测；
- 非得测，用隔离变压器给被测设备供电，而不是给示波器供电；
- 任何时刻，两只探头的地线夹都只能夹同一点。

## 例题

两道题把前面的概念落成数字。第一题用示波器读数反推 PWM 的平均电压，回答「万用表直测 PWM 可不可信」；第二题算带宽不够时读数错多少。两题的做法一样：先想清楚仪器在这一步等效成了什么。

::: tip 例 1 · 用示波器反过来验证万用表 {#ex-scope-pwm}
题干：一个 PWM 输出在示波器上测得周期 40.0 μs、正脉宽 5.00 μs，高电平 3.3 V、低电平 0 V。万用表用直流档直接测高电平与低电平，分别读 3.28 V 与 0.04 V。求占空比、理论平均电压与理论真有效值，并判断用万用表直流档直接测这路 PWM 的平均电压是否可靠。

解。

第 1 步：由示波器读数算占空比

信号是 25 kHz，周期 $T = 1/25\,\text{kHz} = 40.0\ \mu\text{s}$，跟屏幕读数一致，说明时基没设错。

$$D = \frac{5.00}{40.0} = 0.125 = 12.5\%$$

第 2 步：算理论平均电压

$$\bar{U} = D \cdot U_{\text{高}} + (1-D)\cdot U_{\text{低}} = 0.125 \times 3.3 + 0.875 \times 0 = 0.4125\ \text{V}$$

第 3 步：算理论真有效值

$$U_{\text{rms}} = \sqrt{0.125 \times 3.3^2 + 0.875 \times 0^2} = 3.3\sqrt{0.125} = 1.167\ \text{V}$$

第 4 步：回答万用表的问题

万用表直流档量的是「一段时间上的平均值」，它对 25 kHz 的 PWM 做积分，理论上确实该读到 0.41 V 左右。实测常常偏离，原因有两个：直流档的输入级本身有带宽限制与数字积分，快变的方波在它的输入电容上被部分滤掉，读数会偏向高电平；低电平也不是严格的 0 V，带着 40 mV 的驱动残留，占空比一抖，直流读数就跟着抖。

正确做法：先用 RC 把 PWM 滤成直流（10 kΩ + 100 nF，$\tau = 1$ ms，截止频率 $1/2\pi\tau = 159$ Hz），再用直流档测滤波后的电压。读数稳定在 0.41 V 附近，跟理论值比才有意义。

> 为什么这么想：万用表只能给出「一段时间上一个数」。PWM 的全部信息（周期、占空比、电平）都在时间结构里，被平均之后就只剩一个数。任何「用万用表测 PWM」的做法，只有在已经确认波形被滤成直流时才成立，滤波截止频率必须远低于 PWM 频率，否则滤波后的电压仍然在抖。
:::

::: tip 例 2 · 带宽不够时读数错多少 {#ex-scope-bw}
题干：用一台 100 MHz 示波器测 5 V 方波，信号实际上升时间 5 ns，示波器读数为 4.8 V 峰峰值。判断读数是否可信；换成 20 MHz 的示波器，读数会变成多少？

解。

第 1 步：示波器自身上升时间

$$t_{r,\text{示波器}} = \frac{0.35}{100\times10^6} = 3.5\ \text{ns}$$

第 2 步：合成上升时间

$$t_{r,\text{测}} = \sqrt{5^2 + 3.5^2} = 6.10\ \text{ns}$$

第 3 步：判断幅度误差

被测信号的上升时间 5 ns 是示波器固有上升时间 3.5 ns 的 1.43 倍，不到 3 倍，所以幅度读数不一定准。实测 4.8 V 对应 4% 的误差，可能来自示波器输入前端的一阶低通，探头与通道的高频被它衰减了。

第 4 步：换 20 MHz 的示波器

$$t_{r,20\text{M}} = \frac{0.35}{20\times10^6} = 17.5\ \text{ns}$$

$$t_{r,\text{测}} = \sqrt{5^2 + 17.5^2} = 18.2\ \text{ns}$$

上升时间被拉成 18.2 ns，大约是真实值的 3.6 倍。幅度误差一并恶化：上升沿斜率变小，方波平顶占比变少，峰峰值读数偏低 3~5%，边沿的位置误差可以到 10 ns 以上。

第 5 步：结论与对策

测 5 ns 上升沿的信号，至少要 100 MHz 带宽（35/5 = 7 MHz 是理论下限，实际要留 3~5 倍余量）。手上只有 20 MHz 的机子，就得接受「只能看有没有，不能看有多快」，转去用逻辑分析仪，或者干脆降低对上升时间的要求。

> 为什么这么想：带宽不足不只是「看得模糊一点」，它让读数变慢、幅度变小、边沿被抹平。所有超过 $0.35/B$ 的信号细节都会系统性地失真。别把「我看到了方波」当成「我看到了正确的方波」。
:::

## 工程实例：地线夹引起的一次死机

这次事故把「地线夹是大地」演到极致：夹点只差几厘米，结果从冒烟到死机。排查也按「断开可疑路径 → 验证电位差 → 换差分测量」的顺序走。

某同学用示波器调一块 STM32 板上的电机驱动。他测 H 桥下管的栅极电压，把黑夹子夹在电机的负极上。上电后板子瞬间死机，探头地线冒出一缕青烟。

查下来四条：

1. 电机负极不等于电路地。驱动用了低边采样，电机负极与电源地之间有一个 0.1 Ω 的采样电阻加关断 MOS 管，两者不总是等电位；
2. 地线夹把这个点与大地直接短接，开关瞬间电机电流从探头地线回流；
3. 探头地线的电感与电阻让这部分电流产生巨大压降，示波器输入的保护二极管被击穿；
4. 同一条地路上的大电流把 MCU 的复位脚拉低，板子死机。

修复：改用差分探头测下管栅极，地线夹只接在电源输入的地上。探头换掉，板子重新焊了复位上拉。

## 常见错误

四个错误按「先仪器后电路」排：探头没补偿、地线夹乱夹、AC 耦合看慢信号、存储深度不够。每个都有明确的症状和一步到位的处理。

::: tip 错误 1 · 探头没有补偿，直接看波形
现象：所有方波的边沿都圆滚滚的，或者每个上升沿带一个小尖峰，于是怀疑电路有问题。

处理：花两分钟在 1 kHz 校准信号上把补偿调好，再测一遍。波形变干净了，说明问题出在探头，不在电路。
:::

::: tip 错误 2 · 地线夹随便夹
现象：一夹上就冒烟、死机、示波器通道报错，或者波形完全失真。

处理：先确认地线夹所夹的点是不是电路的真实参考地，不是的话改用差分探头或两通道相减。夹之前用手指碰一下外壳放电，不要带电夹。
:::

::: tip 错误 3 · 用 AC 耦合看 20 Hz 以下的信号
现象：想看一段缓慢的热漂移或电池放电曲线，AC 耦合下波形一直在回零。

处理：AC 耦合是高通滤波器，转折频率在几 Hz 到几十 Hz。缓慢变化的量必须用 DC 耦合。
:::

::: tip 错误 4 · 采样率够但存储深度不够
现象：把时基拉到很慢（例如 1 s/div）想看一次上电过程，细节全被抹平。

处理：存储深度不够，示波器自己把采样率降了。用单次触发加延迟扫描，在触发事件前后保留细节；或者把存储深度设置提上去。
:::

## 自检清单

上电测量之前，按信号流过的顺序过一遍：探头、补偿、耦合、触发、地。8 条里 6 条是仪器设置。设置没错，读数才可能是电路自己的读数。

- [ ] 探头已补偿，并且每换一次通道都重新补偿过；
- [ ] 地线夹夹在真实参考地上，或改用差分探头；
- [ ] 示波器三脚插头接在有效接地插座上；
- [ ] 触发电平设在幅度中点，触发模式与场景匹配（Auto / Normal / Single）；
- [ ] 测纹波用 AC 耦合 + 20 MHz 带宽限制 + 短地；
- [ ] 垂直档位让波形占据 4~6 格，不是挤在屏幕底部；波形只占 1~2 格时，光标一挪就是几十毫伏的误差；
- [ ] 读幅度时看的是平均值而不是单次采样点；
- [ ] 涉及 220 V 的测量，除非有专业设备与隔离，否则不做。

## 下一步

- 还需要测静态电压、电流与电阻：[万用表](multimeter.md)
- 准备把电路焊成固定板：[焊接与搭电路](soldering.md)
- 布置实验台与安全用电：[实验台与安全](bench.md)
- 电路原理复习：[公式速查表](../shared/cheatsheet.md)
