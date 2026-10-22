---
title: 功率因数 cosφ
description: 有功、无功、视在三种功率的物理意义，功率三角形的读法，以及提高功率因数为什么能省电。
---

# 功率因数 cosφ

<Meta time="5 min" level="卡片" note="cosφ 是「容量利用率」：同样的变压器容量，cosφ 低就得多拉电流" />

一句话结论：**功率因数 $\cos\varphi = P/S$ 是设备容量的利用率——同样一台变压器，$\cos\varphi$ 越低，能送出的有功功率越少、线路电流越大。**

## 日常说法与正式定义

- 日常说法：你雇了一辆卡车（容量），它拉了半车货（有用功），剩下的半车位置是空的，但车照样得付钱、照样在费油。空着的比例就是功率因数。
- 正式定义：交流电路中电压与电流的相位差 $\varphi$ 决定了三种功率的分配：

$$
P = UI\cos\varphi \quad[\text{W}] \qquad
Q = UI\sin\varphi \quad[\text{var}] \qquad
S = UI \quad[\text{VA}]
$$

$$
S^2 = P^2 + Q^2 \qquad \cos\varphi = \frac{P}{S}
$$

## 三种功率的物理意义

| 功率 | 符号 | 含义 | 谁在用 |
| --- | --- | --- | --- |
| 有功功率 | $P$ | 真正被消耗掉的（做功、发热） | 用户的活 |
| 无功功率 | $Q$ | 在电源与储能元件之间来回交换的（建立磁场/电场必需） | 电感、电容 |
| 视在功率 | $S$ | 电源需要提供的容量 | 变压器铭牌 |

<FigBox title="功率三角形：斜边是容量，直角边是干活的比例" kind="结构" note="S 固定不动（电源就那么大容量）时，阻抗角越大，Q 越长、P 越短。cosφ = P/S 就是容量利用率。">

<svg viewBox="0 0 470 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <defs>
    <marker id="pf-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-1)" />
    </marker>
  </defs>
  <g font-size="12.5" fill="var(--vp-c-text-1)" class="sf-t">
    <line x1="60" y1="200" x2="360" y2="200"/>
    <line x1="300" y1="200" x2="300" y2="60"/>
    <line x1="60" y1="200" x2="300" y2="60" stroke-width="2.2" marker-end="url(#pf-a)"/>
    <text x="170" y="222" text-anchor="middle">P（有功）</text>
    <text x="312" y="135">Q（无功）</text>
    <text x="196" y="118">S（视在）</text>
    <path d="M 108 200 A 48 48 0 0 0 100 171" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.3"/>
    <text x="118" y="184" fill="var(--vp-c-text-3)" font-size="12">φ</text>
    <text x="60" y="242" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="11.5">cosφ = P / S —— 斜边越长，能干活的比例越低</text>
    <text x="60" y="34" fill="var(--vp-c-text-3)" font-size="11.5">容量 S 固定时，负载越感性，Q 越长、P 越短</text>
  </g>
</svg>

</FigBox>

## 为什么必须提高 $\cos\varphi$

$P$ 一定时，$I = P/(U\cos\varphi)$。所以 $\cos\varphi$ 越低：

- 电流 $I$ 越大 → 线路损耗 $I^2R$ 越大、压降越大；
- 视在功率 $S$ 越大 → 变压器、导线、开关的容量被白白占掉。

## 常见误解

1. **「无功功率是浪费的电」** → 无功不做功，但它建立磁场与电场，是电感电容正常工作必需的。浪费的是**容量和线路损耗**，不是电能本身。
2. **「功率因数低了，负载就多耗电了」** → 负载的 $P$ 没变，多出来的是电网侧的损耗。责任在电网，但账单会反映出来。
3. **「功率因数是电抗器的属性」** → 电机、变压器、荧光灯镇流器都是感性负载，天生 $\cos\varphi$ 低；电容并联进去可以把滞后角抵消掉。

## 例题

::: tip 例 1 · 一台设备把功率因数从 0.8 提到 0.95 能省多少电流
**题目**：某感性负载接在 220 V、50 Hz 电源上，功率因数 0.8，电流 10 A。求有功功率；若并联电容把功率因数提到 0.95，电流变成多少？

**先想什么**：$P$ 由负载决定，加电容前后不变；变的只有电流和容量。所以先算出 $P$，再反推新电流。*（先认出「什么量没变」，题目就解了一半。）*

**步骤**：

1. 有功功率：$P = UI\cos\varphi = 220 \times 10 \times 0.8 = 1760\ \text{W}$。*（为什么先求 P：它是负载真正消耗的功率，也是补偿前后的不变量。）*
2. 补偿后电流：$I' = P/(U\cos\varphi') = 1760/(220 \times 0.95) = 8.42\ \text{A}$。
3. 线路电流下降 $10 - 8.42 = 1.58\ \text{A}$，约减少 16%。

**验算**：补偿后 $S' = 220 \times 8.42 = 1853\ \text{VA}$，小于原来的 $2200\ \text{VA}$ ✓（容量被释放出来了）。再验算功率：$1760 = 220 \times 8.42 \times 0.95 = 1759.6\ \text{W}$，与补偿前一致 ✓。
:::

<CircuitFig kind="pf-comp" title="并联电容做功率因数补偿" note="电容并联在负载两端，只改变线路电流，不改变负载两端的电压、电流和功率——它只在电源与负载之间抵消掉那部分无功电流。" />

## 在正文里什么时候用得上

> 完整内容见 [10 · 功率与功率因数](../04-ac/power.md)

选变压器容量、算线路损耗、算电费（工业用电按功率因数奖惩）、判断一台设备为什么「电流超标但不跳闸」，都要先回到这张卡的功率三角形。
