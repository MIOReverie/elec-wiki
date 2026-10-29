---
title: 功率因数 cosφ
description: 有功、无功、视在三种功率在说什么，功率三角形怎么读，以及提高功率因数为什么能省下线路容量。
---

# 功率因数 cosφ

<Meta time="5 min" level="卡片" note="cosφ 是容量利用率：同样的变压器容量，cosφ 低就得多拉电流" />

一台 100 kVA 的变压器，接一批 cosφ 只有 0.6 的负载，能送出的有功只有 60 kW。铭牌上写着 100，用户只能用到 60，差的 40 用不上，却要照样付容量费。

这就是功率因数被要求写到电费单上的原因。

## 三种功率，一台卡车

日常那句话说得很准：雇了一辆卡车（容量），拉了半车货（有用功），剩下的位置空着，车照样得付钱、照样费油。空着的比例，就是功率因数。

交流电路里，电压与电流的相位差 $\varphi$ 决定三种功率怎么分：

$$
P = UI\cos\varphi \quad[\text{W}] \qquad
Q = UI\sin\varphi \quad[\text{var}] \qquad
S = UI \quad[\text{VA}]
$$

$$
S^2 = P^2 + Q^2 \qquad \cos\varphi = \frac{P}{S}
$$

| 功率 | 符号 | 含义 | 谁在用 |
| --- | --- | --- | --- |
| 有功功率 | $P$ | 真正被消耗掉的（做功、发热） | 用户的活 |
| 无功功率 | $Q$ | 在电源与储能元件之间来回交换的（建立磁场/电场必需） | 电感、电容 |
| 视在功率 | $S$ | 电源需要提供的容量 | 变压器铭牌 |

这个比值 $\cos\varphi = P/S$ 就是容量利用率：$\cos\varphi$ 接近 1，说明容量几乎全用来干活。

<FigBox title="功率三角形：斜边是容量，直角边是干活的比例" kind="结构" note="S 固定不动（电源就那么大容量）时，阻抗角一变大，Q 就长、P 就短。cosφ = P/S 就是容量利用率。">

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

## 为什么必须提高

$P$ 一定时，$I = P/(U\cos\varphi)$。所以 $\cos\varphi$ 偏低时：

- 电流 $I$ 一大，线路损耗 $I^2R$ 就上去、压降也上去；
- 视在功率 $S$ 变大，变压器、导线、开关的容量被白白占掉。

$\cos\varphi$ 是电网考核用户的第一个指标，原因就在这里。

## 三个误解

1. 说「无功功率是浪费的电」。无功不做功，但它建立磁场与电场，是电感电容正常工作的必需品。被浪费的是容量与线路损耗，不是电能本身。
2. 说「功率因数低了，负载就多耗电了」。负载的 $P$ 没变，多出来的是电网侧的损耗。责任在电网，账单会反映出来。
3. 以为功率因数是电抗器的专利。电机、变压器、荧光灯镇流器都是感性负载，天生 $\cos\varphi$ 低；并一只电容进去，就能把滞后角抵消掉。

## 例题

::: tip 例 1 · 一台设备把功率因数从 0.8 提到 0.95 能省多少电流
题目：某感性负载接在 220 V、50 Hz 电源上，功率因数 0.8，电流 10 A。求有功功率；若并联电容把功率因数提到 0.95，电流变成多少？

先想什么：$P$ 由负载决定，加电容前后不变；变的只有电流和容量。所以先算 $P$，再反推新电流。*（先认出什么量没变，题目就解了一半。）*

步骤：

1. 有功功率：$P = UI\cos\varphi = 220 \times 10 \times 0.8 = 1760\ \text{W}$。*（为什么先求 P：它是负载真正消耗的功率，也是补偿前后不变的量。）*
2. 补偿后电流：$I' = P/(U\cos\varphi') = 1760/(220 \times 0.95) = 8.42\ \text{A}$。
3. 线路电流下降 $10 - 8.42 = 1.58\ \text{A}$，约减少 16%。

验算：补偿后 $S' = 220 \times 8.42 = 1853\ \text{VA}$，小于原来的 $2200\ \text{VA}$ ✓（容量被释放出来了）。再验功率：$1760 = 220 \times 8.42 \times 0.95 = 1759.6\ \text{W}$，与补偿前一致 ✓。
:::

<CircuitFig kind="pf-comp" title="并联电容做功率因数补偿" note="电容并联在负载两端，只改变线路电流，不改变负载两端的电压、电流和功率；它只在电源与负载之间抵消掉那部分无功电流。" />

## 后面哪里用得着

> 完整内容见 [10 · 功率与功率因数](../04-ac/power.md)

选变压器容量、算线路损耗、算电费（工业用电按功率因数奖惩）、想弄明白一台设备为什么「电流超标却不跳闸」，都先回到这张卡的功率三角形。
