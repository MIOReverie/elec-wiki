---
title: 电阻串并联等效
description: 串联与并联的等效公式、分压与分流公式，以及化简电路的第一刀该怎么下。
---

# 电阻串并联等效

<Meta time="5 min" level="卡片" note="串联看电流相同，并联看电压相同；串多了变大，并多了变小" />

一句话结论：**串联电流相同所以电阻相加，并联电压相同所以电阻的倒数相加——化简电路的第一刀，就是看能不能把网络拆成纯串联或纯并联。**

## 日常说法与正式定义

- 日常说法：一根水管接了三段管子，每段都有阻力，接起来总阻力是三段相加（因为水在每段里流过的量一样）；把三根管子并排接，两端压力一样，每根分到的流量就少了。
- 正式定义：
  - **串联**（电流相同）：$R = R_1 + R_2 + \cdots$，分压 $U_k = \dfrac{R_k}{\sum R}\,U$。
  - **并联**（电压相同）：$\dfrac{1}{R} = \dfrac{1}{R_1} + \dfrac{1}{R_2} + \cdots$，分流 $I_k = \dfrac{G_k}{\sum G}\,I$（$G = 1/R$ 是电导）。

两个电阻并联速记：$R = \dfrac{R_1R_2}{R_1+R_2}$（「积除以和」）。

## 两条方向相反的规律

- 串联电阻越多，总电阻越大，且**总电阻大于任一个**。
- 并联电阻越多，总电阻越小，且**总电阻小于任一个**。

<FigBox title="一个能拆成串并联的电路" kind="电路" note="先把 R₁、R₂ 串成一段，再和 R₃ 并联——这是最常见的「串并联」结构。化简顺序：先串后并，从最内层开始。">

<svg viewBox="0 0 470 232" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="60" y1="40" x2="120" y2="40"/>
  <polyline points="120,40 134,28 148,52 162,28 176,52 190,40"/>
  <line x1="190" y1="40" x2="230" y2="40"/>
  <polyline points="230,40 244,28 258,52 272,28 286,52 300,40"/>
  <line x1="300" y1="40" x2="400" y2="40"/>
  <line x1="400" y1="40" x2="400" y2="100"/>

  <line x1="60" y1="160" x2="120" y2="160"/>
  <polyline points="120,160 134,148 148,172 162,148 176,172 190,160"/>
  <line x1="190" y1="160" x2="400" y2="160"/>
  <line x1="400" y1="160" x2="400" y2="100"/>

  <line x1="60" y1="40" x2="60" y2="100"/>
  <line x1="60" y1="100" x2="60" y2="160"/>
  <circle cx="60" cy="100" r="4.5" class="sf-dot"/>
  <circle cx="400" cy="100" r="4.5" class="sf-dot"/>
  <text x="50" y="104" text-anchor="end" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">a</text>
  <text x="412" y="104" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">b</text>

  <text x="155" y="18" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R₁ = 4 Ω</text>
  <text x="265" y="18" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R₂ = 8 Ω</text>
  <text x="155" y="188" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R₃ = 6 Ω</text>
  <text x="235" y="214" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R₁、R₂ 串联（12 Ω）后与 R₃ 并联 → 4 Ω</text>
</svg>

</FigBox>

## 常见误解

1. **「并联电阻要相加」** → 并联的是**倒数**相加，不是阻值相加。$1/R$ 才是相加的那个量。
2. **「只要画得整齐就能串并联化简」** → 图形整齐不代表拓扑可化简。电桥（四个电阻围成方框加一条对角线）就**不能**用串并联化简，必须换方法。
3. **「串联分压一定能用」** → 分压公式要求各电阻中流过同一个电流。有一路被旁路（并联了一条支路）之后，分压关系就要重新推。

## 例题

::: tip 例 1 · 化简并求总电流
**题目**：$R_1 = 4\ \Omega$、$R_2 = 8\ \Omega$ 串联后，再与 $R_3 = 6\ \Omega$ 并联，接在 12 V 电源上。求总电阻与总电流。

**先想什么**：先判断拓扑能不能拆——能。顺序是**先串后并**，从最内层开始。*（化简顺序错了会把自己绕进去，先内层后外层永远没错。）*

**步骤**：

1. 串联段：$R_{12} = 4 + 8 = 12\ \Omega$。
2. 与 $R_3$ 并联：$R = \dfrac{12 \times 6}{12 + 6} = \dfrac{72}{18} = 4\ \Omega$。
3. 总电流：$I = U/R = 12/4 = 3\ \text{A}$。

**验算**：$4\ \Omega$ 小于并联支路里的每一个（12 和 6）✓，符合「并联变小」。再验算支路：串联段电流 $12/12 = 1\ \text{A}$，$R_3$ 支路电流 $12/6 = 2\ \text{A}$，两者相加 $1 + 2 = 3\ \text{A}$ = 总电流 ✓（KCL 在结点处闭合）。
:::

## 在正文里什么时候用得上

> 完整内容见 [03 · 串并联与电源等效变换](../02-methods/equivalent.md)

化简电路的第一步、算分压器、算电流传感器与偏置电阻网络、以及判断一个网络「能不能用串并联解决」——最后这一条决定了你要不要换方法。
