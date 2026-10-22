---
title: 时间常数 τ
description: 一阶电路过渡快慢的唯一参数、RC 与 RL 两种算法、63.2% 这个数字的来历，以及为什么 3τ 到 5τ 就算结束。
---

# 时间常数 τ

<Meta time="5 min" level="卡片" note="τ 不是「充满所需的时间」，只是走完 63.2% 的时间；RL 的 τ 分母是 R" />

**时间常数 $\tau$ 是一阶电路过渡过程的时间尺度：它等于过渡量走完全部变化量的 63.2% 所需的时间，只由 $R$、$C$、$L$ 决定，与初始值和终值都无关。**

## 日常说法与正式定义

日常说法是「电容越大充电越慢，电阻越大也越慢」。这句直觉是对的，而且可以量化成一个数——这就是 $\tau$。

正式定义：

$$
\tau_{RC} = R_{eq}C \quad[\text{s}] \qquad \tau_{RL} = \frac{L}{R_{eq}} \quad[\text{s}]
$$

符号说明：

| 符号 | 含义 | 说明 |
| --- | --- | --- |
| $\tau$ | 时间常数（time constant） | 单位秒；越大过渡越慢 |
| $R_{eq}$ | **从储能元件两端看进去**的戴维南等效电阻 | 不是随便挑一个电阻 |
| $C$ | 电容 | 单位 F |
| $L$ | 电感 | 单位 H |
| $e^{-t/\tau}$ | 过渡过程的衰减因子 | $t=\tau$ 时等于 0.368 |

为什么是 63.2%？因为一阶电路的过渡量都长成

$$
f(t) = f(\infty) + \left[f(0_+) - f(\infty)\right]e^{-t/\tau}
$$

把 $t = \tau$ 代进去，指数项就是 $e^{-1} = 0.368$，于是**已经走完 $1 - 0.368 = 63.2\%$**。这个数字不是约定，是 $e$ 的定义算出来的。

| $t$ | $e^{-t/\tau}$ | 完成度 |
| --- | --- | --- |
| $\tau$ | 0.368 | 63.2% |
| $3\tau$ | 0.050 | 95.0% |
| $5\tau$ | 0.0067 | 99.3% |

工程上认为 $t \ge (3\sim5)\tau$ 时过渡过程结束——注意「认为」，不是「确实」。

<FigBox title="同一条指数曲线上的三个刻度" kind="曲线" note="曲线从 0 爬向终值，永远不严格到达。τ 处爬完 63.2%，3τ 处 95%，5τ 处 99.3% 已经看不出差别。终点标的是渐近线，不是曲线上的点——这正是「过渡过程理论上永不结束」的图形证据。">

<svg viewBox="0 0 430 250" role="img" aria-label="指数上升曲线：τ 处完成百分之六十三点二，三倍 τ 处百分之九十五，五倍 τ 处百分之九十九点三">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <line x1="70" y1="200" x2="410" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="70" y1="215" x2="70" y2="44" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="70" y1="70" x2="400" y2="70" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="404" y="66" text-anchor="end" fill="var(--vp-c-text-3)">终值（渐近线）</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" points="70,200 92.5,148.9 115,117.8 137.5,99 160,87.6 182.5,80.7 205,76.5 227.5,73.9 250,72.4 295,70.9 340,70.3 385,70.1" />
  <line x1="115" y1="117.8" x2="115" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <line x1="70" y1="117.8" x2="115" y2="117.8" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <circle cx="115" cy="117.8" r="3.5" fill="var(--vp-c-brand-1)" />
  <text x="121" y="112">τ：完成 63.2%</text>
  <line x1="205" y1="200" x2="205" y2="86" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="205" y="218" text-anchor="middle">3τ</text>
  <text x="212" y="90" fill="var(--vp-c-text-3)">95.0%</text>
  <line x1="295" y1="200" x2="295" y2="82" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="295" y="218" text-anchor="middle">5τ</text>
  <text x="302" y="82" fill="var(--vp-c-text-3)">99.3%</text>
  <text x="115" y="218" text-anchor="middle">τ</text>
  <text x="64" y="200" text-anchor="end" fill="var(--vp-c-text-3)">0</text>
  <text x="62" y="74" text-anchor="end" fill="var(--vp-c-text-3)">终值</text>
  <text x="398" y="216" text-anchor="end" fill="var(--vp-c-text-3)">t</text>
</g>
</svg>

</FigBox>

两个例子把数字落下来：

- **RC**：$R = 10\ \text{k}\Omega$、$C = 100\ \mu\text{F}$ → $\tau = 10^4\times10^{-4} = 1$ s。于是 1 s 走完 63.2%、3 s 走完 95%、5 s 走完 99.3%。
- **RL**：$L = 0.5$ H、$R = 100\ \Omega$ → $\tau = 0.5/100 = 5$ ms，$3\tau = 15$ ms。

::: warning 常见误解一：把 τ 当成「充满时间」
$\tau$ 处只完成 63.2%，还差三分之一多。要「看起来充满」至少得 $3\tau$，要「纹丝不动」得 $5\tau$。把 $\tau$ 当结束时间，继电器延时、采样等待时间都会设计得偏短。
:::

::: warning 常见误解二：$R_{eq}$ 随手取一个电阻
$R_{eq}$ 是**从储能元件两端看进去**的等效电阻，要把其余独立源置零后再看。电路里有三个电阻时，它可能是三个的某个串并联组合，也可能是无穷大（该元件根本没有放电回路）。
:::

::: warning 常见误解三：RL 的 τ 写成 $R/L$
$\tau_{RL} = L/R_{eq}$，分母是电阻。量纲检查能救你：$L/R$ 的单位是 $(\text{H})/(\Omega) = \text{s}$，而 $R/L$ 是 $1/\text{s}$。凡是想写出一个「时间」，先在纸上做一次量纲。
:::

**为什么容易错**：因为 $\tau$ 的单位就是秒，一看就想把它读成「一段时间」。它其实是**曲线的形状参数**——决定曲线多陡，而不是曲线在哪结束。指数函数永远不真正到达终值，所以「结束」只能是工程近似。

## 什么时候用得上

正文里凡是要求「多久到稳态」「开关动作后多长时间可以采样」，都是先算 $\tau$ 再乘 3 到 5；三要素法里的第三个要素就是它。

> 详见 [07 · 三要素法](../03-transient/three-factor.md)
