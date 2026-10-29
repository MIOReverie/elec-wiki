---
title: 分压与分流公式
description: 分压为什么按电阻比例、分流的分子为什么是对面那个电阻、接上负载后分压比为什么会掉，以及分压器为什么当不了电源。
---

# 分压与分流公式

<Meta time="5 min" level="卡片" note="分压公式只在输出端空载时成立；接上负载，分压比立刻变" />

用两个电阻把 12 V 分出 5 V 给单片机采样，是最常见的用法之一。换成两个 10 kΩ 电阻，分出来的应是 6 V，接上单片机一量只有 4 V。电阻没坏，公式也没错，错在「输出」这个位置接上了东西。

分压公式的前提是输出端空着。

## 两条电路事实就够

- 串联时电流相同，$U = IR$ 于是电压正比于 $R$。
- 并联时电压相同，$I = U/R$ 于是电流反比于 $R$。

分压（串联，按电阻比例分总电压）：

$$
U_1 = \frac{R_1}{R_1+R_2}U \qquad U_2 = \frac{R_2}{R_1+R_2}U
$$

分流（并联两电阻，注意分子是对面那个）：

$$
I_1 = \frac{R_2}{R_1+R_2}I \qquad I_2 = \frac{R_1}{R_1+R_2}I
$$

| 符号 | 含义 | 单位 |
| --- | --- | --- |
| $U$ | 串联支路两端的总电压 | V |
| $U_1$、$U_2$ | 各电阻上的电压 | V |
| $R_1$、$R_2$ | 串联（或并联）的两个电阻 | Ω |
| $I$ | 并联支路的总电流 | A |
| $R_L$ | 接在输出端的负载电阻 | Ω |

分流公式的分子为什么是对面那个？电阻越小分到的电流越大。$R_1$ 小，$I_1$ 就大，而公式写成 $R_2/(R_1+R_2)$，分子是另一个电阻，正好表达反比。

这也是分压与分流最容易记混的地方：一个正比，一个反比。

## 接上负载，比例就变了

空载时输出端什么也不接，$R_2$ 就是 $R_2$；一旦接上 $R_L$，$R_2$ 与 $R_L$ 并联，下半段的等效电阻变小，分到的电压当然跟着变小。

<FigBox title="同一个分压器：空载 6 V，带载 4 V" kind="电路" note="左边空载，下半段就是 R₂ = 10 kΩ，分到一半。右边接上 R_L = 10 kΩ，下半段变成 10 k ∥ 10 k = 5 kΩ，只占三分之一，输出掉到 4 V。电阻一个没动，只是「输出」被接上了东西。">

<svg viewBox="0 0 640 250" role="img" aria-label="两幅分压器对比：空载时输出六伏，接上十千欧负载后输出降到四伏">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="150" y="30" text-anchor="middle" font-weight="700">空载：输出 6 V</text>
  <line x1="75" y1="64" x2="245" y2="64" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="150" y1="64" x2="150" y2="76" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="139" y="76" width="22" height="42" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" rx="2" />
  <line x1="150" y1="118" x2="150" y2="140" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <circle cx="150" cy="140" r="3.5" fill="var(--vp-c-text-1)" />
  <line x1="150" y1="140" x2="150" y2="152" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="139" y="152" width="22" height="42" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" rx="2" />
  <line x1="150" y1="194" x2="150" y2="208" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="75" y1="208" x2="245" y2="208" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="168" y1="140" x2="238" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="176" y="90">R₁ = 10 kΩ</text>
  <text x="176" y="170">R₂ = 10 kΩ</text>
  <text x="150" y="52" text-anchor="middle" fill="var(--vp-c-text-3)">U = 12 V</text>
  <text x="150" y="226" text-anchor="middle" fill="var(--vp-c-text-3)">0 V</text>
  <text x="238" y="132" text-anchor="end" fill="var(--vp-c-brand-1)">U_out = 6 V</text>

  <line x1="290" y1="40" x2="290" y2="220" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />

  <text x="435" y="30" text-anchor="middle" font-weight="700">带载：输出掉到 4 V</text>
  <line x1="360" y1="64" x2="560" y2="64" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="435" y1="64" x2="435" y2="76" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="424" y="76" width="22" height="42" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" rx="2" />
  <line x1="435" y1="118" x2="435" y2="140" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <circle cx="435" cy="140" r="3.5" fill="var(--vp-c-text-1)" />
  <line x1="435" y1="140" x2="435" y2="152" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="424" y="152" width="22" height="42" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" rx="2" />
  <line x1="435" y1="194" x2="435" y2="208" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="360" y1="208" x2="560" y2="208" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="435" y1="140" x2="545" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <line x1="545" y1="140" x2="545" y2="152" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="534" y="152" width="22" height="42" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" rx="2" />
  <line x1="545" y1="194" x2="545" y2="208" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <text x="456" y="90">R₁ = 10 kΩ</text>
  <text x="456" y="170">R₂ = 10 kΩ</text>
  <text x="435" y="52" text-anchor="middle" fill="var(--vp-c-text-3)">U = 12 V</text>
  <text x="435" y="226" text-anchor="middle" fill="var(--vp-c-text-3)">0 V</text>
  <text x="568" y="172" fill="var(--vp-c-text-2)">R_L</text>
  <text x="475" y="132" text-anchor="end" fill="var(--vp-c-brand-1)">U_out = 4 V</text>
</g>
</svg>

</FigBox>

数字核对：空载时下半段 $10\ \text{k}\Omega$，输出 $12\times\dfrac{10}{20} = 6$ V。接上 $R_L = 10\ \text{k}\Omega$ 后下半段变成 $10\parallel10 = 5\ \text{k}\Omega$，输出 $12\times\dfrac{5}{15} = 4$ V，掉了三分之一。

分流也走一遍：总电流 1 A 分成 $R_1 = 2\ \Omega$ 与 $R_2 = 3\ \Omega$ 两条并联支路，则

$$
I_1 = 1\times\frac{3}{5} = 0.6\ \text{A} \qquad I_2 = 1\times\frac{2}{5} = 0.4\ \text{A}
$$

验算：$0.6\times2 = 0.4\times3 = 1.2$ V，两支路电压相等 ✓（并联的定义）。

::: warning 常见误解一：分压公式用了却不看负载
分压公式的推导前提是输出端不接任何东西。输出要带负载时，正确做法只有两步：先把下半段换成 $R_2\parallel R_L$，再用分压公式。$R_L$ 越接近 $R_2$，跌落越严重；$R_L \gg R_2$ 时才可以近似忽略。
:::

::: warning 常见误解二：分流公式分子写成同侧
$I_1$ 的分子是 $R_2$，不是 $R_1$。抓一句直觉记：电阻小的那条支路电流大。分子写错会得出「电阻大反而电流大」的荒谬结论，一验算 $I_1R_1 \ne I_2R_2$ 立刻露馅。
:::

::: warning 常见误解三：把分压器当电源用
分压器输出端的内阻就是 $R_1\parallel R_2$，从输出端看进去的等效电阻，上例是 5 kΩ。拿它去驱动需要几十毫安的负载，电压会整个塌下来。要带载就得用稳压器或射极跟随器，两个电阻办不到。
:::

## 一个词的误导

「输出」这个词暗示可以接东西，而分压公式是在不接东西的前提下推出来的。凡是用到分压，先问一句：输出端现在挂着什么。

## 什么时候用得上

需要「从总电压里取一份」的地方都算：传感器分压、基准电压、电桥的一臂、放大器偏置。它也是理解戴维南等效里 $R_{eq}$ 的最简单例子，分压器的输出电阻就是 $R_1\parallel R_2$。

> 详见 [03 · 串并联与电源等效变换](../02-methods/equivalent.md)
