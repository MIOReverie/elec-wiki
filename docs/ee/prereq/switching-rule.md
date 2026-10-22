---
title: 换路定则
description: 换路瞬间哪些量不能跳、哪些量可以跳，为什么只有电容电压和电感电流连续，以及求初始值的标准两步。
---

# 换路定则

<Meta time="5 min" level="卡片" note="连续的只有 u_C 和 i_L 两个量；电容电流、电感电压都能瞬间跳变" />

**换路（开关动作）那一瞬间，只有电容电压 $u_C$ 和电感电流 $i_L$ 不能跳变，其余所有量——电阻上的电压电流、电容电流、电感电压——都可以突变。**

## 日常说法与正式定义

日常的说法是「电感有惯性，电流想变但来不及」「电容像弹簧，压缩量不能一下子改」。这两句比喻都对，而且指向同一件事：**储能元件里存着能量，能量不能瞬间改变。**

正式定义：把开关动作的时刻记作 $t = 0$，则换路前一瞬间记作 $0_-$、换路后一瞬间记作 $0_+$，有

$$
u_C(0_+) = u_C(0_-) \qquad i_L(0_+) = i_L(0_-)
$$

符号说明：

| 符号 | 含义 | 说明 |
| --- | --- | --- |
| $u_C$ | 电容两端电压 | 状态变量，连续 |
| $i_L$ | 流过电感的电流 | 状态变量，连续 |
| $0_-$ / $0_+$ | 换路前 / 后的一瞬间 | 两者时间差为零，但电路结构可能已变 |
| $W_C = \tfrac12 Cu_C^2$ | 电容储能 | 能量不能突变，所以 $u_C$ 不能突变 |
| $W_L = \tfrac12 Li_L^2$ | 电感储能 | 同理，$i_L$ 不能突变 |

## 为什么偏偏是这两个量

能量的表达式里只有 $u_C$ 和 $i_L$ 是以平方出现的：

$$
W_C = \tfrac12 C u_C^2 \qquad W_L = \tfrac12 L i_L^2
$$

如果 $u_C$ 能瞬间从 0 跳到 10 V，那么这段时间趋于零、功率趋于无穷，电源要在零时间里送出有限的能量——物理上做不到。所以**能量连续 ⇒ 状态变量连续**。

而其它量都只是「派生量」：电容电流 $i_C = C\,du_C/dt$ 是 $u_C$ 的变化率，$u_C$ 在 $t=0$ 处有一个折角，斜率就可以瞬间改变，$i_C$ 也就跟着跳；电感电压 $u_L = L\,di_L/dt$ 同理。

<FigBox title="换路前后：一条曲线连续，另一条当场跳变" kind="波形" note="左图 RC：u_C 从 0 起连续上升，而 i_C 在换路瞬间从 0 跳到最大值再衰减。右图 RL 结构完全一样：i_L 连续，u_L 跳变。两条曲线量纲不同，只看形状——连续的那条没有断口，跳变的那条有竖直的针。">

<svg viewBox="0 0 640 258" role="img" aria-label="两幅对比波形：电容电压与电感电流连续上升，电容电流与电感电压在换路瞬间跳变后衰减">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="165" y="20" text-anchor="middle" font-weight="700">RC 电路：u_C 连续，i_C 跳</text>
  <line x1="50" y1="192" x2="282" y2="192" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="60" y1="204" x2="60" y2="58" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="100" y1="58" x2="100" y2="204" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="100" y="220" text-anchor="middle" fill="var(--vp-c-text-3)">换路 t = 0</text>
  <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" points="60,192 100,192" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" points="100,192 116,150.7 132,126.8 148,112.3 164,103.5 196,95 228,91.8 260,90.7" />
  <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="5 3" points="60,192 100,192 100,90 116,129.3 132,153.2 148,167.7 164,176.5 196,185 228,188.2 260,189.3" />
  <text x="248" y="86" fill="var(--vp-c-brand-1)">u_C</text>
  <text x="248" y="178" fill="var(--vp-c-text-2)">i_C</text>
  <text x="56" y="70" text-anchor="end" fill="var(--vp-c-text-3)">大</text>
  <text x="56" y="196" text-anchor="end" fill="var(--vp-c-text-3)">0</text>

  <line x1="310" y1="40" x2="310" y2="200" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />

  <text x="475" y="20" text-anchor="middle" font-weight="700">RL 电路：i_L 连续，u_L 跳</text>
  <line x1="360" y1="192" x2="592" y2="192" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="370" y1="204" x2="370" y2="58" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="410" y1="58" x2="410" y2="204" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="410" y="220" text-anchor="middle" fill="var(--vp-c-text-3)">换路 t = 0</text>
  <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" points="370,192 410,192" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" points="410,192 426,150.7 442,126.8 458,112.3 474,103.5 506,95 538,91.8 570,90.7" />
  <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="5 3" points="370,192 410,192 410,90 426,129.3 442,153.2 458,167.7 474,176.5 506,185 538,188.2 570,189.3" />
  <text x="508" y="86" fill="var(--vp-c-brand-1)">i_L</text>
  <text x="508" y="178" fill="var(--vp-c-text-2)">u_L</text>
  <text x="366" y="70" text-anchor="end" fill="var(--vp-c-text-3)">大</text>
  <text x="366" y="196" text-anchor="end" fill="var(--vp-c-text-3)">0</text>
  <text x="320" y="244" text-anchor="middle" fill="var(--vp-c-text-3)">实线 = 换路前后连续的量　　虚线 = 换路瞬间会跳的量</text>
</g>
</svg>

</FigBox>

三条推论，做题时全靠它们：

- 电容电压不能突变 → 换路瞬间电容可以当成一个**电压源** $u_C(0_+)$。
- 电感电流不能突变 → 换路瞬间电感可以当成一个**电流源** $i_L(0_+)$。
- **其它量（电阻电压与电流、电容电流、电感电压）都可以突变**——这正是每次都要重新算一遍的部分。

## 求初始值的标准两步

1. **先算 $0_-$**：用**换路前**的稳态电路（此时电容开路、电感短路，因为直流稳态下它们就是这样）。
2. **再画 $0_+$ 的等效电路**：把电容换成电压源 $u_C(0_+)$、电感换成电流源 $i_L(0_+)$，其余元件按换路后的接法，然后求其它量。

两步之间唯一连续的桥梁就是那两个状态变量；其它量都要在新电路里重算。

一个 RC 例子：$E = 10$ V、$R = 1\ \text{k}\Omega$、$C = 1\ \mu\text{F}$，换路前电容未充电。

- $0_-$：$u_C(0_-) = 0$。
- $0_+$：电容相当于 0 V 的电压源（就是短路），于是 $i_C(0_+) = (E - 0)/R = 10$ mA。
- 稳态（$t \to \infty$）：电容相当于开路，$i_C = 0$、$u_C = 10$ V。时间常数 $\tau = RC = 1$ ms。

一个 RL 例子：$E = 10$ V、$R = 1\ \text{k}\Omega$、$L = 10$ mH，换路前 $i_L(0_-) = 0$。

- $0_+$：电感相当于 0 A 的电流源（就是开路），于是一整圈电流为零，$R$ 上压降为零，$u_L(0_+) = 10$ V。
- 稳态：电感相当于短路，$i_L = 10$ mA、$u_L = 0$。时间常数 $\tau = L/R = 10\ \mu$s。

::: warning 常见误解：以为「电容电流也不能突变」
这是最高频的错。记法很简单：**只有储能变量连续**。电容电压连续，它的导数（电流）就可以不连续；电感电流连续，它的导数（电压）就可以不连续。你给电容接上一个电阻，瞬间电流就是要跳——这不违反任何守恒，因为储能量没变。
:::

::: warning 第二个误区：拿换路后的电路去求 $0_-$
求 $0_-$ 必须用**换路前**的电路，求 $0_+$ 才是换路后的电路。混用会得到「换路前电压就已经是稳态值」的荒唐结论，整道题的初始条件全错。
:::

**为什么容易错**：因为「能量不能突变」这句正确的话，推不出「这个元件上什么都连着」。它只给出两个等式，两个等式只锁住两个量。

## 什么时候用得上

正文里凡是见到开关、见到「$t = 0$ 时换路」，第一步就是套这两条——它是三要素法里第一个要素（初始值）的唯一来源。

> 详见 [06 · 储能元件与换路定则](../03-transient/elements.md)
