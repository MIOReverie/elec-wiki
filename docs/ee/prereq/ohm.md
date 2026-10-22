---
title: 欧姆定律
description: 欧姆定律的日常说法与正式定义、关联与非关联参考方向下的符号规则，以及一道带验算的例题。
---

# 欧姆定律

<Meta time="5 min" level="卡片" note="关联方向才用 U = RI，方向反了自己记得变号" />

一句话结论：**同一段线性电阻两端，电压与电流成正比，比例系数就是电阻本身；参考方向选成关联时写成 $U = RI$。**

## 日常说法与正式定义

- 日常说法：水管两头压差越大，水流越猛；管子越细，同样的压差水流越小。
- 对应关系：压差是电压，水流是电流，管子粗细是电阻。
- 正式定义：满足 $U = RI$ 的**线性电阻**（阻值不随电压电流改变）。$R$ 的单位是欧姆（$\Omega$），$1\ \Omega = 1\ \text{V}/\text{A}$。

## 公式里的符号

| 符号 | 含义 | 单位 |
| --- | --- | --- |
| $U$ | 电阻两端的电压 | V |
| $I$ | 流过电阻的电流 | A |
| $R$ | 电阻值 | $\Omega$ |

## 方向决定正负号

- **关联（被动）方向**：电流从电压参考方向的「+」端流入 → $U = RI$。
- **非关联方向**：电流从「−」端流入 → $U = -RI$。

<FigBox title="关联方向与非关联方向" kind="电路" note="上面那条：电流从 + 端进，写 U = RI。下面那条：电流从 − 端进，同一个电阻、同一个电流值，U 的符号必须反过来。">

<svg viewBox="0 0 470 210" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="60" y="26" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">关联方向</text>
  <line x1="120" y1="52" x2="188" y2="52"/>
  <polyline points="188,52 202,40 216,64 230,40 244,64 258,52"/>
  <line x1="258" y1="52" x2="320" y2="52"/>
  <line x1="120" y1="30" x2="120" y2="76"/>
  <text x="132" y="26" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
  <text x="132" y="74" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">−</text>
  <text x="150" y="26" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">U</text>
  <line x1="270" y1="34" x2="330" y2="34" stroke-dasharray="4 3"/>
  <path d="M330 34 L320 30.2 L320 37.8 Z" class="sf-solid"/>
  <text x="300" y="26" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">I</text>
  <text x="235" y="94" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电流从 + 端流入 → U = RI</text>

  <line x1="30" y1="112" x2="440" y2="112" stroke-dasharray="5 4" stroke-width="1"/>

  <text x="60" y="150" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">非关联方向</text>
  <line x1="120" y1="182" x2="188" y2="182"/>
  <polyline points="188,182 202,170 216,194 230,170 244,194 258,182"/>
  <line x1="258" y1="182" x2="320" y2="182"/>
  <line x1="120" y1="160" x2="120" y2="206"/>
  <text x="132" y="154" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
  <text x="132" y="204" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">−</text>
  <text x="150" y="154" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">U</text>
  <line x1="270" y1="164" x2="330" y2="164" stroke-dasharray="4 3"/>
  <path d="M270 164 L280 160.2 L280 167.8 Z" class="sf-solid"/>
  <text x="300" y="156" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">I</text>
  <text x="235" y="124" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电流从 − 端流入 → U = −RI</text>
</svg>

</FigBox>

## 常见误解

1. **「欧姆定律对所有元件都成立」** → 只有电阻成立。电感、电容是「电压与电流的变化率成正比」，直接套 $U = RI$ 会算出一个随频率变化的假电阻。
2. **「R 越大，消耗的功率越大」** → 电阻只决定比例关系；功率还取决于流过它的电流。
3. **「电压和电流谁是原因」** → 对电阻没有因果可言，三个数里定下两个，第三个就定了。

## 例题

::: tip 例 1 · 12 V 电源带一个 4 Ω 电阻
**题目**：$R = 4\ \Omega$ 的电阻接在 12 V 电源上，电流与电压采用关联参考方向。求电流与电阻消耗的功率。

**先想什么**：纯代数题，方法只有一个——先确认方向，再套 $U = RI$。*（方向先定，符号就不会错。）*

**步骤**：

1. 关联方向下 $I = U/R = 12/4 = 3\ \text{A}$。*（为什么先写方向：非关联方向下这一步要带负号。）*
2. 功率 $P = UI = 12 \times 3 = 36\ \text{W}$。

**验算**：换用 $P = I^2R = 3^2 \times 4 = 36\ \text{W}$，与上一步一致 ✓（电阻的三个功率公式互为变形，数值必须自洽）。
:::

## 在正文里什么时候用得上

> 完整内容见 [01 · 电路模型与参考方向](../01-basics/model-reference.md)

写任何一条支路的方程之前，这张卡给你三样东西：一个能直接用的比例关系、一条「方向决定符号」的纪律，以及一个检查答案是否自洽的验算习惯。
