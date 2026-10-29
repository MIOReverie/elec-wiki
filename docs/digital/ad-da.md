---
title: 08 · 数电接口：AD/DA 与脉冲调制
description: 麦克风的电压是连续的，计算机只认 0 和 1，中间这座桥就是 AD/DA。采样、量化、编码怎么走，混叠为什么救不回来，PWM 又怎么用通断等效出电压。
---

# 08 · 数电接口：AD/DA 与脉冲调制

<Meta time="50 min" level="核心" note="最贵的错误不是算错精度，而是在 ADC 前面忘了加抗混叠滤波器" />

::: tip 读这页之前
会正弦量的三要素与有效值（<Prereq id="sine-params" />）、会分压器和 RC 低通（<Prereq id="voltage-divider" />、<Prereq id="time-constant" />）就够。这里不推电路定律，只拿它们算指标。

用到的符号：$f_s$ 是采样频率（sampling rate：每秒取几个样点，单位 Hz）；$f_{max}$ 是信号的最高频率；$V_{ref}$ 是参考电压（reference voltage：ADC/DAC 用来定义满量程的那个基准）；$N$ 是位数；LSB（least significant bit，最低位，也指 ADC/DAC 的最小分辨单位，单位与电压相同）；$D$ 是占空比（duty cycle：高电平时间占整个周期的比例）。全部约定见[符号与约定](../guide/notation.md)。

三个词就地解释：采样（sampling）是把连续信号在若干时刻取值，幅度仍然连续；量化（quantization）是把连续幅度归到有限个台阶上；混叠（aliasing）是采样不足时高频信号伪装成低频信号的现象。

算术上只需要四舍五入和 $\log_2$，不碰微积分。
:::

你在手机上录了一段 8 kHz 的语音，听着还行；换成 44.1 kHz 录，同样的声音就「有细节」了。采样率翻五倍多，代价是文件大了五倍多。多出来的到底是不是真信息？答案是：大部分时候不是，但也有一部分是。采样率不足时，高频成分会被伪装成低频混进你的录音里，而你听不出来。

同样的陷阱在另一边：数模转换器输出的是一串台阶，不是平滑曲线。要变成能用的模拟信号，台阶后面必须跟一个滤波器。

这两头合起来，就是整页要讲的事。

## 一、转换链条：一个模拟量怎么变成一串数字

```
温度/声音/电压（连续）
   │  ① 采样：按 fs 周期性取值        ← 采样定理在这里把关
   ▼
一串离散的样点（幅度还是连续的）
   │  ② 保持：样值稳住，等量化
   ▼
   │  ③ 量化：幅度归到邻近的电平栅格  ← 误差在这里产生
   ▼
   │  ④ 编码：电平编号写成二进制
   ▼
数字码流 ──► 数字系统处理 ──► DAC ──► 模拟世界
```

注意②③的次序不可换：不保持的话，量化还没做完样值就变了。采样定理是整条链的入口门槛，进来时丢了的信息，后面任何处理都变不回来。

<FigBox title="四个术语在链条上的位置" kind="结构" note="采样解决「什么时候取值」，保持解决「取值期间别变」，量化解决「幅度落在哪一格」，编码解决「这一格叫什么名字」。只有量化和编码会产生数值误差，采样和保持的误差是时间上的。">

<svg viewBox="0 0 560 200" role="img" aria-label="AD 转换四步链条：采样、保持、量化、编码，每一步的输出形态">
  <defs>
    <marker id="ad-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
    </marker>
  </defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <rect x="16" y="60" width="110" height="58" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="71" y="84" text-anchor="middle">① 采样</text>
    <text x="71" y="104" text-anchor="middle" fill="var(--vp-c-text-3)">时间上离散</text>
    <line x1="128" y1="89" x2="158" y2="89" stroke="var(--vp-c-brand-1)" stroke-width="1.7" marker-end="url(#ad-ar)" />

    <rect x="160" y="60" width="110" height="58" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="215" y="84" text-anchor="middle">② 保持</text>
    <text x="215" y="104" text-anchor="middle" fill="var(--vp-c-text-3)">样值稳住</text>
    <line x1="272" y1="89" x2="302" y2="89" stroke="var(--vp-c-brand-1)" stroke-width="1.7" marker-end="url(#ad-ar)" />

    <rect x="304" y="60" width="110" height="58" rx="8" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
    <text x="359" y="84" text-anchor="middle">③ 量化</text>
    <text x="359" y="104" text-anchor="middle" fill="var(--vp-c-text-3)">幅度离散</text>
    <line x1="416" y1="89" x2="446" y2="89" stroke="var(--vp-c-brand-1)" stroke-width="1.7" marker-end="url(#ad-ar)" />

    <rect x="448" y="60" width="100" height="58" rx="8" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
    <text x="498" y="84" text-anchor="middle">④ 编码</text>
    <text x="498" y="104" text-anchor="middle" fill="var(--vp-c-text-3)">二进制码</text>

    <text x="71" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">丢掉「时间连续性」</text>
    <text x="359" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">丢掉「幅度连续性」</text>
    <text x="280" y="176" text-anchor="middle" fill="var(--vp-c-text-3)">这两步丢的信息都是不可逆的——所以抗混叠滤波器要放在 ADC 之前</text>
  </g>
</svg>

</FigBox>

链条看着顺，但第一步「采样」有一个硬门槛：采得不够快，后面全白做。

## 二、采样定理与混叠

采样定理（Nyquist-Shannon 采样定理，也叫奈奎斯特采样定理）说：一个最高频率为 $f_{\max}$ 的信号，要能由它的样点唯一重建，采样频率必须满足

$$
f_s \ge 2f_{\max}
$$

原因是：一条正弦波每周期被采 2 次时，你拿到的是一串上下交替的点。这串点既可能来自 1 kHz 的波，也可能来自 3 kHz、5 kHz 的波，它们在这些采样点上完全一样，从样点本身无法分辨。这就是混叠的根源。

2 倍只是理论下限，它保证样点能唯一重建，不保证重建得好看。

<FigBox title="同一串样点可以来自两个完全不同的信号" kind="波形" note="上：1 kHz 的正弦，每周期采两点。下：3 kHz 的正弦，在同样的采样点上取值完全相同。所以后端无论怎么算，都只能还原成其中较低的那个频率。">

<svg viewBox="0 0 560 260" role="img" aria-label="1 千赫兹与 3 千赫兹正弦在采样频率 2 千赫兹时取到相同的样点序列">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="50" y1="110" x2="540" y2="110" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="50,60 75,160 100,60 125,160 150,60 175,160 200,60 225,160 250,60 275,160 300,60 325,160 350,60 375,160 400,60 425,160 450,60 475,160 500,60" />
    <text x="54" y="48" fill="var(--vp-c-brand-1)">信号 A：1 kHz（每周期 2 个样点）</text>
    <g fill="var(--vp-c-brand-1)">
      <circle cx="50" cy="60" r="3.4" /><circle cx="100" cy="60" r="3.4" /><circle cx="150" cy="60" r="3.4" />
      <circle cx="200" cy="60" r="3.4" /><circle cx="250" cy="60" r="3.4" /><circle cx="300" cy="60" r="3.4" />
      <circle cx="350" cy="60" r="3.4" /><circle cx="400" cy="60" r="3.4" /><circle cx="450" cy="60" r="3.4" /><circle cx="500" cy="60" r="3.4" />
    </g>
    <text x="56" y="182" fill="var(--vp-c-text-3)">采样点 f_s = 2 kHz</text>

    <line x1="50" y1="215" x2="540" y2="215" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <polyline fill="none" stroke="var(--vp-c-text-3)" stroke-width="2" stroke-dasharray="6 4" points="50,165 75,215 100,265 125,215 150,165 175,215 200,265 225,215 250,165 275,215 300,265 325,215 350,165 375,215 400,265 425,215 450,165 475,215 500,265 525,215 540,193" />
    <text x="54" y="196" fill="var(--vp-c-text-3)">信号 B：3 kHz（同样的点，全部重合）</text>
    <g fill="var(--vp-c-text-3)">
      <circle cx="50" cy="165" r="3.4" /><circle cx="100" cy="265" r="3.4" /><circle cx="150" cy="165" r="3.4" />
      <circle cx="200" cy="265" r="3.4" /><circle cx="250" cy="165" r="3.4" /><circle cx="300" cy="265" r="3.4" />
      <circle cx="350" cy="165" r="3.4" /><circle cx="400" cy="265" r="3.4" /><circle cx="450" cy="165" r="3.4" /><circle cx="500" cy="265" r="3.4" />
    </g>
  </g>
</svg>

</FigBox>

混叠的别名频率有一个可以直接算的公式：

$$
f_{alias} = \left|f_{in} - \operatorname{round}\!\left(\frac{f_{in}}{f_s}\right) f_s\right|
$$

也就是把 $f_{in}$ 折叠回 $[0,\,f_s/2]$ 区间。例如 $f_{in}=6$ kHz、$f_s=8$ kHz 时，$f_{alias}=|6-8|=2$ kHz，你采到的是一个 2 kHz 的假信号。

混叠一旦发生就无法在后端挽回，原因就是上面那张图：样点里的信息已经被抹掉了，软件再聪明也变不出没采到的东西。防线只有两个，而且都必须在 ADC 前面：提高采样率，或者在 ADC 前加抗混叠滤波器（低通，截止频率压在 $f_s/2$ 以下）。

<DemoBox title="采样定理：低于 2 倍频就看到假信号" hint="把采样频率拖到输入频率 2 倍以下，红色混叠波立刻出现；再拖回 2 倍以上看它消失。位数滑块管的是量化栅格的粗细。">
  <AdcDemo />
</DemoBox>

三个滑块就是整条链的三个参数。把采样频率拖到低于输入频率的 2 倍，红色虚线会冒出来。它才是采样后系统以为的真实信号，频率低得多、波形像得多，这正是混叠的阴险之处：看起来毫无异常。位数滑块控制量化栅格的粗细，位数少，阶梯自然就粗。

时间上的坑解决了，幅度上还有一个：即使采样率足够，样点的幅度仍是连续的，要塞进有限个数字码就必须取整。

## 三、量化与量化误差

量化就是把连续幅度归到 $2^N$ 个电平上，每个电平叫一个 LSB（最低有效位，也指相邻电平之间的最小电压差）。满量程 $V_{FS}$ 除以台阶数就是 LSB：

$$
\text{LSB} = \frac{V_{FS}}{2^N}
$$

理想量化器的输出总是落在最近的电平上，所以误差不会超过 1/2 个台阶：

$$
|e| \le \frac{1}{2}\text{LSB} = \frac{V_{FS}}{2^{N+1}}
$$

这个误差不可能消掉，它是把连续的东西塞进有限格子的固有代价。8 位 ADC 一共 256 个台阶，位数每多 1 位，台阶数翻一倍，误差减半，代价是数据量与转换电路的复杂度也跟着翻倍。

<FigBox title="量化误差从哪里来" kind="波形" note="红线是原信号，蓝色的横线是量化后的台阶。误差（绿色竖线）最大出现在两个台阶的正中间，为半个台阶。所以理想量化器的最大误差就是 ±½ LSB。">

<svg viewBox="0 0 560 220" role="img" aria-label="量化误差示意：正弦波与阶梯波之间的竖直误差最大为一个台阶的一半">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="40" y1="120" x2="540" y2="120" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="40,120 70,70 100,45 130,70 160,120 190,170 220,195 250,170 280,120 310,70 340,45 370,70 400,120 430,170 460,195 490,170 520,120 540,90" />
    <g stroke="var(--vp-c-text-3)" stroke-width="1.6">
      <path d="M 70 95 L 160 95 L 160 145 L 250 145 L 250 95 L 340 95 L 340 145 L 430 145 L 430 95 L 520 95" fill="none" />
    </g>
    <line x1="115" y1="57" x2="115" y2="95" stroke="var(--vp-c-text-2)" stroke-width="1.4" stroke-dasharray="3 3" />
    <text x="121" y="72" fill="var(--vp-c-text-2)">e ≤ ½ LSB</text>
    <line x1="115" y1="57" x2="115" y2="120" stroke="var(--vp-c-text-2)" stroke-width="1.4" stroke-dasharray="3 3" />
    <text x="34" y="40" fill="var(--vp-c-brand-1)">原信号</text>
    <text x="34" y="212" fill="var(--vp-c-text-3)">量化后的台阶（每个台阶宽 1 LSB）</text>
  </g>
</svg>

</FigBox>

位数够不够，可以直接用相对满量程的最大误差来判断：

$$
\frac{\text{最大误差}}{V_{FS}} = \frac{1}{2^{N+1}}
$$

8 位是 $0.195\%$，10 位是 $0.049\%$，12 位是 $0.012\%$。所以「要 0.1% 以内，至少 10 位」不是背来的，是 $2^{N+1}\ge1000$ 解出来的。

量化讲的是分得多细，却没讲按什么办法分。那是器件结构的事，先看 DAC 怎么把码值变回电压。

## 四、DAC：数字怎么变回电压

DAC 的原理是用数字码控制一个电压比例。最朴素的做法是权电阻网络（weighted resistor network：每一位电阻的阻值按二的幂加权，阻值大的那一位贡献的电流就小）：每一位配一个电阻，电阻比按 $2:1:4:8:\dots$ 展开，各位电流相加就是输出。直观，但位数一多就要准备一堆不同阻值的电阻，匹配精度也很难保证。

主流是 R-2R 梯形网络（R-2R ladder network：只用阻值 R 与 2R 两种电阻搭成的梯形）：从梯形的每个节点往右看，等效电阻恒等于 2R，于是每一位的贡献天然按二的幂加权，只需要两种阻值。这是几乎所有商用 DAC 的默认结构。

DAC 的三个关键指标：

| 指标 | 含义 | 为什么重要 |
| --- | --- | --- |
| **分辨率**（resolution） | 用几位表示，常说「12 位 DAC」 | 决定最小台阶 $\text{LSB}=V_{FS}/2^N$ |
| **建立时间**（settling time） | 从输入码变化到输出稳定所需时间 | 决定最高更新速率 |
| **线性度**（linearity） | 实际输出与理想直线的偏差（INL/DNL） | 决定「台阶是否均匀」，精度需求高时是主项 |

还有一个特性必须记住：$N$ 位 DAC 的输出永远到不了满量程 $V_{FS}$。满量程码 $111\dots1_2=2^N-1$ 的输出是 $(2^N-1)\times\text{LSB}=V_{FS}-\text{LSB}$。这由结构决定，不是故障。

<FigBox title="R-2R 梯形网络：只用两种阻值做加权求和" kind="结构" note="从每个节点往右看，后面的网络等效成一个 2R 的电阻，所以每一节的电压按二分之一衰减，各位贡献自然按 2 的幂加权。位数增加只需要加长梯形，阻值种类始终是两种。">

<svg viewBox="0 0 560 200" role="img" aria-label="R-2R 梯形网络：纵向 2R 电阻与横向 R 电阻构成的梯形，每一级电压减半">
  <defs>
    <marker id="ad-ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
    </marker>
  </defs>
  <g font-size="11" fill="var(--vp-c-text-1)">
    <text x="60" y="34" text-anchor="middle" fill="var(--vp-c-text-3)">Vref</text>
    <line x1="60" y1="40" x2="60" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ad-ar2)" />
    <g stroke="var(--vp-c-text-2)" stroke-width="1.8" fill="none">
      <rect x="52" y="60" width="16" height="34" />
      <rect x="52" y="104" width="16" height="34" />
      <rect x="52" y="148" width="16" height="34" />
      <line x1="120" y1="60" x2="120" y2="60" />
      <rect x="112" y="60" width="16" height="34" />
      <rect x="112" y="104" width="16" height="34" />
      <rect x="112" y="148" width="16" height="34" />
      <rect x="172" y="60" width="16" height="34" />
      <rect x="172" y="104" width="16" height="34" />
      <rect x="172" y="148" width="16" height="34" />
    </g>
    <g stroke="var(--vp-c-text-2)" stroke-width="1.6">
      <line x1="60" y1="77" x2="120" y2="77" />
      <line x1="60" y1="121" x2="120" y2="121" />
      <line x1="60" y1="165" x2="120" y2="165" />
      <line x1="120" y1="77" x2="180" y2="77" />
      <line x1="120" y1="121" x2="180" y2="121" />
      <line x1="120" y1="165" x2="180" y2="165" />
    </g>
    <text x="60" y="200" text-anchor="middle" fill="var(--vp-c-text-3)">2R</text>
    <text x="120" y="200" text-anchor="middle" fill="var(--vp-c-text-3)">2R</text>
    <text x="180" y="200" text-anchor="middle" fill="var(--vp-c-text-3)">2R</text>
    <g font-size="10.5" fill="var(--vp-c-text-3)">
      <text x="60" y="70" text-anchor="middle">D₀</text>
      <text x="60" y="114" text-anchor="middle">D₁</text>
      <text x="60" y="158" text-anchor="middle">D₂</text>
    </g>
    <text x="220" y="112" text-anchor="middle" fill="var(--vp-c-text-3)">横向 R</text>
    <line x1="180" y1="121" x2="300" y2="121" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ad-ar2)" />
    <text x="330" y="112" font-size="12" fill="var(--vp-c-brand-1)">Vout</text>
    <text x="330" y="132" font-size="11" fill="var(--vp-c-text-3)">= D₀·LSB + D₁·2·LSB + …</text>
  </g>
</svg>

</FigBox>

DAC 讲完，反方向的问题就是 ADC：同样把模拟量变成数字，为什么有快有慢、有便宜有贵。

## 五、ADC 的四种结构

四种经典结构，差别在于用什么办法把模拟电压变成数字码：

| 结构 | 原理 | 速度 | 成本 | 典型用途 |
| --- | --- | --- | --- | --- |
| **并行比较**（flash） | 用 $2^N-1$ 个比较器一次比出全部位 | 最快 | 最贵、功耗大 | 高速示波器、射频采样 |
| **逐次逼近 SAR**（successive approximation） | 从最高位开始，一位一位试探、比较、保留 | 中等 | 中等 | **MCU 内置 ADC 主流** |
| **双积分**（dual-slope） | 先积分一段时间，再用参考电压反向积分到零，测时间比 | 最慢 | 低、抗干扰强 | 数字万用表 |
| **计数式**（counter） | 从零数到与输入相等，数多少个计数 | 最慢 | 低 | 已淘汰 |

SAR 的核心是试探：$N$ 位要比较 $N$ 次，每次定一位，从最高位到最低位。它的转换时间固定在 $N$ 次比较加一次采样保持，也就是 $N+1$ 个时钟周期。这个固定正是它的优点，转换时间可预测，便于定周期采样。

双积分的杀手锏是抗干扰：把积分时间取成工频（50 Hz 或 60 Hz）周期的整数倍，混入的工频干扰在一个积分周期内的平均值为零，被积分器平均掉。代价是每次转换要几十到几百毫秒。

结构看完，选型时按这个顺序问自己：

1. 要多少位？0.1% 的精度门槛，12 位就绰绰有余。
2. 每秒要采多少次？由 $f_s\ge2f_{\max}$ 定下限，再留余量给滤波器。
3. 现场有没有工频干扰？有就优先双积分或 Σ-Δ。
4. 前端要不要采样保持？SAR 前面必须有，否则高位比完低位就漂了。
5. 成本与功耗卡在哪？并行比较最贵，SAR 最中庸。

这几个问题答完，指标就该用数字说话了。

## 六、例题

四道题按采样、量化、DAC、速度的顺序排。每题先写「先想什么」，那是方法选择，比算出数字更重要。

::: tip 例 1 · 采样定理验算 {#ex-adda-1}
题目：语音信号频率上限 4 kHz，CD 音质上限 20 kHz。分别算出需要的最低采样率；若用 8 kHz 去采 6 kHz 的信号，会混叠出什么频率？

先想什么：采样定理只给下限，实际取值要留余量，因为抗混叠滤波器不可能是砖墙，截止频率附近总有过渡带。

<FigBox title="采样率下限与工程余量" kind="结构" note="理论下限是 2 倍；工程取值在 2 倍之上留一段余量，用来给抗混叠滤波器的过渡带留位置。采样率再高也不能把高于上限的频率救回来——上限以下的才谈得上。">

<svg viewBox="0 0 560 180" role="img" aria-label="采样定理：理论下限两倍频，工程取值留余量；超出信号上限的频率无法重建">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="50" y1="110" x2="540" y2="110" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <rect x="50" y="60" width="150" height="50" rx="5" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
    <text x="125" y="82" text-anchor="middle" font-weight="700">语音</text>
    <text x="125" y="100" text-anchor="middle">上限 4 kHz</text>
    <line x1="200" y1="42" x2="200" y2="128" stroke="var(--vp-c-brand-1)" stroke-width="1.8" stroke-dasharray="5 4" />
    <text x="200" y="34" text-anchor="middle" fill="var(--vp-c-brand-1)">下限 8 kHz</text>
    <rect x="200" y="60" width="130" height="50" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="265" y="82" text-anchor="middle" font-weight="700">CD</text>
    <text x="265" y="100" text-anchor="middle">上限 20 kHz</text>
    <line x1="330" y1="42" x2="330" y2="128" stroke="var(--vp-c-brand-1)" stroke-width="1.8" stroke-dasharray="5 4" />
    <text x="330" y="34" text-anchor="middle" fill="var(--vp-c-brand-1)">下限 40 kHz</text>
    <rect x="330" y="60" width="120" height="50" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="390" y="82" text-anchor="middle" font-weight="700">实际 44.1 kHz</text>
    <text x="390" y="100" text-anchor="middle">≈ 2.21 倍余量</text>
    <rect x="470" y="60" width="70" height="50" rx="5" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.3" stroke-dasharray="4 3" />
    <text x="505" y="90" text-anchor="middle" fill="var(--vp-c-text-3)">超出上限</text>
    <text x="505" y="106" text-anchor="middle" fill="var(--vp-c-text-3)">无法重建</text>
  </g>
</svg>

</FigBox>

步骤：

1. 语音：$f_s\ge2\times4=8\,\text{kHz}$，电话系统正是取 $8\,\text{kHz}$。*（为什么电话里人声还是听得清：4 kHz 以上的内容本来就很少，而且在采样前会被低通滤掉。）*
2. CD：理论下限 $2\times20=40\,\text{kHz}$，实际取 $44.1\,\text{kHz}$（约 2.21 倍余量），既防混叠又给滤波器过渡带留空间。
3. 混叠验算：$f_{in}=6$ kHz、$f_s=8$ kHz → $f_{alias}=|6-8|=2\,\text{kHz}$，耳朵听到的是一个 2 kHz 的假信号。

验算：$8\,\text{kHz}/4\,\text{kHz}=2$ ✓ 恰在下限；$44.1/20=2.205$ ✓ 与「约 2.21 倍」一致；混叠频率 $|6-\operatorname{round}(6/8)\times8|=|6-8|=2$ kHz ✓。
:::

::: tip 例 2 · DAC 分辨率 {#ex-adda-2}
题目：8 位 DAC、参考电压 10 V。求 LSB；输入码 `10000001₂` 时输出多少？满量程码输出多少？换成 12 位呢？

先想什么：DAC 输出是码值乘 LSB，而 LSB 由位数和参考电压共同决定。位宽决定分辨率，参考电压决定每个台阶有多大。

<FigBox title="DAC 输出的码值与电压对应关系" kind="结构" note="横轴是码值，纵轴是输出电压。台阶高度就是 1 LSB。注意最右边那个码：它离满量程电压还差一个 LSB，永远到不了顶。">

<svg viewBox="0 0 560 200" role="img" aria-label="DAC 台阶输出：码值 0 到 255 对应 0 到 9.961 伏，满量程 10 伏永远达不到">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="50" y1="160" x2="530" y2="160" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <g fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.3">
      <rect x="60" y="140" width="52" height="20" />
      <rect x="112" y="120" width="52" height="40" />
      <rect x="164" y="100" width="52" height="60" />
      <rect x="216" y="80" width="52" height="80" />
      <rect x="268" y="60" width="52" height="100" />
      <rect x="320" y="40" width="52" height="120" />
    </g>
    <text x="86" y="132" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
    <text x="138" y="112" text-anchor="middle" fill="var(--vp-c-text-3)">64</text>
    <text x="190" y="92" text-anchor="middle" fill="var(--vp-c-text-3)">128</text>
    <text x="242" y="72" text-anchor="middle" fill="var(--vp-c-text-3)">192</text>
    <text x="294" y="52" text-anchor="middle" fill="var(--vp-c-text-3)">255</text>
    <line x1="320" y1="24" x2="470" y2="24" stroke="var(--vp-c-text-3)" stroke-width="1.3" stroke-dasharray="4 3" />
    <text x="474" y="28" fill="var(--vp-c-text-3)">满量程 10 V（到不了）</text>
    <line x1="372" y1="40" x2="372" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="4 3" />
    <text x="378" y="178" fill="var(--vp-c-brand-1)">129 → 5.039 V</text>
    <text x="54" y="24" fill="var(--vp-c-text-3)">8 位 DAC，Vref = 10 V，1 LSB = 39.06 mV</text>
  </g>
</svg>

</FigBox>

步骤：

1. $\text{LSB}=10/2^8=39.06\,\text{mV}$。*（为什么是 $2^8$ 而不是 256：8 位码共有 $2^8=256$ 个台阶，把 10 V 平分 256 份。）*
2. 输入码 `10000001₂` $=129$，输出 $=129\times39.06\,\text{mV}\approx5.039\,\text{V}$。
3. 满量程码 `11111111₂` $=255$ 只输出 $9.961\,\text{V}$（＝量程 − 1 LSB），永远到不了 10 V。这是 DAC 的固有特性，别当成故障。
4. 同量程 12 位：$\text{LSB}=10/2^{12}=2.44\,\text{mV}$，分辨率提升 16 倍。

验算：$10/256=0.0390625$ V ✓；$129\times0.0390625=5.0391$ V ✓；$255\times0.0390625=9.9609$ V，且 $10-9.9609=0.0391=1$ LSB ✓；$2^{12}/2^8=16$ ✓。
:::

::: tip 例 3 · ADC 量化误差 {#ex-adda-3}
题目：8 位 ADC、量程 $0\sim5$ V。输入 3.300 V，求量化码、重建值与误差；并问要达到满量程 0.1% 以内的精度，至少需要几位？

先想什么：量化就是数一共有多少个 LSB，然后四舍五入。误差的上限由位数决定，与具体输入无关，所以选位数的依据是上限，不是某一次的运气。

<FigBox title="量化码与误差：从输入到格子中心的距离" kind="结构" note="输入电压落在相邻两个电平之间，量化器把它归到更近的那一格。竖直箭头就是这一次转换的误差，它最大为一个台阶的一半。">

<svg viewBox="0 0 560 170" role="img" aria-label="8 位 ADC 量化：输入 3.300 伏落在码 168 与 169 之间，被归到 169，重建值 3.3008 伏">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="40" y1="120" x2="540" y2="120" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <g stroke="var(--vp-c-text-3)" stroke-width="1.2">
      <line x1="200" y1="60" x2="200" y2="120" />
      <line x1="260" y1="60" x2="260" y2="120" />
      <line x1="320" y1="60" x2="320" y2="120" />
    </g>
    <text x="200" y="52" text-anchor="middle">码 168</text>
    <text x="260" y="52" text-anchor="middle">码 169</text>
    <text x="320" y="52" text-anchor="middle">码 170</text>
    <text x="230" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">3.281 V</text>
    <text x="290" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">3.301 V</text>
    <text x="350" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">3.320 V</text>
    <circle cx="288" cy="78" r="4.5" fill="var(--vp-c-brand-1)" />
    <text x="296" y="76" fill="var(--vp-c-brand-1)">输入 3.300 V</text>
    <text x="40" y="30" fill="var(--vp-c-text-3)">1 LSB = 19.53 mV</text>
  </g>
</svg>

</FigBox>

步骤：

1. $\text{LSB}=5/2^8=19.53\,\text{mV}$。
2. 量化码 $=\operatorname{round}(3.300/0.01953)=169=10101001_2$。*（为什么用 round 而不是截断：截断会引入最大一个 LSB 的单向误差，四舍五入把上限压到半个 LSB。）*
3. 重建值 $=169\times19.53\,\text{mV}=3.3008\,\text{V}$，这一回的误差 $=3.300-3.3008=-0.8\,\text{mV}$。
4. 上限 $\frac12\text{LSB}=9.77\,\text{mV}$，折合满量程 $\frac{9.77\text{ mV}}{5\text{ V}}=0.195\%$。
5. 要 0.1% 以内：$\frac{1}{2^{N+1}}\le0.001\Rightarrow 2^{N+1}\ge1000\Rightarrow N\ge10$。

验算：$3.300/0.01953=168.96\to169$ ✓；$169\times0.01953125=3.30078$ V ✓，误差 $-0.78$ mV，在 ±9.77 mV 之内 ✓；$1/2^{11}=0.0488\%\le0.1\%$ ✓，9 位则为 $1/2^{10}=0.195\%>0.1\%$ ✗，所以 10 位是及格线 ✓。
:::

::: tip 例 4 · SAR 与双积分的速度账 {#ex-adda-4}
题目：SAR 型 8 位 ADC 每次转换要几个时钟？时钟 1 MHz 时每秒能转多少次？双积分型在 50 Hz 工频下为什么不怕干扰？

先想什么：SAR 的转换时间是固定的（$N$ 次比较 + 1 次采样保持），这是它能被定周期采样的原因；双积分的转换时间很长，而长恰恰是它抗干扰的来源。

<FigBox title="两种 ADC 的时间账" kind="结构" note="SAR：一串固定长度的比较，像跑步一样每圈一样长。双积分：一段很长的积分期，工频干扰在整段里被平均成零。">

<svg viewBox="0 0 560 180" role="img" aria-label="SAR 转换时间是固定的九个时钟，双积分的积分期取工频整数倍把干扰平均掉">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <text x="30" y="34" font-weight="700" fill="var(--vp-c-text-1)">SAR：固定 9 拍</text>
    <g fill="var(--vp-c-brand-1)" opacity="0.85">
      <rect x="30" y="46" width="26" height="20" rx="3" />
      <rect x="60" y="46" width="26" height="20" rx="3" />
      <rect x="90" y="46" width="26" height="20" rx="3" />
      <rect x="120" y="46" width="26" height="20" rx="3" />
      <rect x="150" y="46" width="26" height="20" rx="3" />
      <rect x="180" y="46" width="26" height="20" rx="3" />
      <rect x="210" y="46" width="26" height="20" rx="3" />
      <rect x="240" y="46" width="26" height="20" rx="3" />
      <rect x="270" y="46" width="26" height="20" rx="3" />
    </g>
    <text x="163" y="84" text-anchor="middle" fill="var(--vp-c-text-3)">1 拍采样保持 + 8 拍逐位比较</text>
    <text x="340" y="34" font-weight="700" fill="var(--vp-c-text-1)">双积分：一次 20 ms</text>
    <rect x="300" y="46" width="200" height="20" rx="3" fill="var(--vp-c-text-3)" opacity="0.6" />
    <text x="400" y="84" text-anchor="middle" fill="var(--vp-c-text-3)">积分期 = 工频 50 Hz 的整数倍 → 干扰平均为 0</text>
    <text x="30" y="130" fill="var(--vp-c-text-3)">1 MHz 时钟下：9 µs 一次 → 每秒约 111 k 次转换</text>
    <text x="30" y="156" fill="var(--vp-c-text-3)">双积分：每秒只能转几十次，但抗干扰能力理论上无穷大</text>
  </g>
</svg>

</FigBox>

步骤：

1. SAR 型 8 位 ADC 每次要采样保持加逐位比较 8 回，至少 9 个时钟。
2. 时钟 $1\,\text{MHz}$ 时转换时间约 $9\,\mu\text{s}$，每秒可完成 $1/9\,\mu\text{s}\approx111\,\text{k}$ 次转换，这就是 MCU 内置 ADC 的典型速度。
3. 双积分型：积分时间取工频周期的整数倍（$20\,\text{ms}$ 的整数倍），$50\,\text{Hz}$ 干扰在一个积分周期内平均为零，抗干扰能力理论上无穷大，代价是每秒只能转几十次。

验算：$9\times1\,\mu\text{s}=9\,\mu\text{s}$ ✓；$10^6/9=111111$ 次/s ≈ 111 k ✓；$50\,\text{Hz}$ 的周期是 $20$ ms，取整数倍即 20、40、60 ms，干扰在这段时间里正好整数个周期，积分结果为 0 ✓。
:::

## 七、工程实例：从传感器到云端的完整链路

一条物联网温度链，把这一页的概念全走一遍：

1. NTC 热敏电阻随温度改变阻值，经分压变成电压（[欧姆定律与分压器](../ee/01-basics/model-reference.md)的老本行）。
2. 抗混叠滤波器（RC 低通）先把高频噪声挡在采样频率一半以下。没有它，噪声会混叠进有用频段。
3. SAR ADC（MCU 内置 12 位）把电压变成码值，每秒采几千次。
4. MCU 算出温度，通过 PWM 控制加热器占空比做恒温，整套系统只靠比较、计数、通断就完成了模拟量的精确处理。

反过来，播放端：存储器里的数字音频经 DAC（R-2R 或 Σ-Δ）重建为阶梯波，再经低通滤波器平滑，才到你耳朵里。数字音乐的最后一站，就在本章的电路上。

PWM 的等效电压是这条链上最省事的一环。PWM（pulse width modulation，脉冲宽度调制：用通断时间比例来表达一个连续量）本身只有 0 和 1 两种电平，但它的平均值等于占空比乘高电平：

$$
V_{eq} = D \times V_{high}
$$

例如 $5$ V 供电、占空比 $0.25$，等效电压就是 $1.25$ V。要把这个等效值真正变成平滑的模拟电压，后面还要跟一只 RC 低通：截止频率 $f_c=\frac{1}{2\pi RC}$ 要远低于 PWM 频率，台阶才被滤平。

<FigBox title="PWM 与它的低通重建" kind="结构" note="上面是方波，下面是经 RC 低通后的平滑电压。方波的平均值（虚线）就是等效电压 D × Vhigh。负载若是「认瞬时值」的器件，必须有这一级滤波；惯性负载（电机、加热丝）则可以直接用平均值。">

<svg viewBox="0 0 560 200" role="img" aria-label="PWM 方波经 RC 低通后变成与占空比成正比的平滑电压">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="40" y1="90" x2="540" y2="90" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="60,40 120,40 120,140 240,140 240,40 300,40 300,140 420,140 420,40 480,40 480,140 540,140" />
    <text x="44" y="32" fill="var(--vp-c-brand-1)">PWM 方波（Vhigh = 5 V）</text>
    <line x1="40" y1="176" x2="540" y2="176" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" points="60,172 90,166 120,158 160,150 200,145 240,142 280,141 320,142 360,144 400,148 440,154 480,161 520,168 540,171" />
    <text x="44" y="196" fill="var(--vp-c-text-3)">RC 低通后的平滑输出</text>
    <line x1="60" y1="146" x2="540" y2="146" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 4" />
    <text x="470" y="140" text-anchor="end" fill="var(--vp-c-text-3)">等效电压 = D × 5 V</text>
  </g>
</svg>

</FigBox>

整条链路从传感器走到执行器：前端采样与滤波，中间 ADC/DAC，最后 PWM 加低通。下面这张清单收拢最容易踩的坑。

## 八、易错清单（按踩坑频率排序）

1. ADC 前面不加抗混叠滤波器 → 噪声混叠进有用频段，后端无法察觉。防线只有两个：提高采样率，或在 ADC 前加抗混叠低通。
2. 指望软件修混叠 → 徒劳。混叠是采样时信息就被抹掉了，重建算法也造不出没采到的东西。
3. 认为量化误差就是噪声的全部，选型时只看位数 → 还有偏置误差、增益误差、非线性（INL/DNL）。datasheet 里找 ENOB（有效位数）才是诚实的做法。
4. SAR 前没有采样保持 → 高位比完、低位还在比时样值已经漂了。比较期间输入必须被冻住。
5. 以为 DAC 能输出满量程电压，误判成故障 → 满量程码输出的是 $V_{FS}-\text{LSB}$，永远差一个台阶。
6. 把 PWM 等效电压当成瞬时值 → 直接驱动运放时会出错。PWM 线上只有 0 和 1 两种电平，等效电压是平均值概念，对惯性负载有效；要平滑输出必须加低通。
7. 把位数当精度 → 选型偏乐观。理想上限是 $\pm\frac12$ LSB，实际受 INL/DNL 影响还会更差。

## 自检

不看答案，自己把这三问答一遍：

1. 为什么 $f_s=8$ kHz 去采一个 6 kHz 的信号会得到 2 kHz 的假信号？后端为什么救不回来？
2. 一个 12 位、量程 0～5 V 的 ADC，最大量化误差是多少伏？折合满量程百分之几？（理想上限 $\le\pm\frac12\text{LSB}$，别查书）
3. 为什么双积分 ADC 转换得那么慢，却不怕 50 Hz 的工频干扰？

## 下一步

模拟的和数字的怎么握手，到这里就清楚了。但数字信号本身还有一套规矩：多根线怎么共用、时序怎么对齐、亚稳态怎么处理。这些在[09 · 从逻辑到芯片：Verilog 与 FPGA 入门](./09-verilog-fpga.md)里展开，那里的「跨时钟域」，本质上就是采样问题的另一副面孔。

<Prereq id="time-constant" /> → [09 · 从逻辑到芯片：Verilog 与 FPGA 入门](./09-verilog-fpga.md)
