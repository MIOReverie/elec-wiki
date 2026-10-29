---
title: 电压电流的参考方向
description: 参考方向为什么是人为假设的、关联与非关联差一个负号，以及为什么标错方向也不会把题做错。
---

# 电压电流的参考方向

<Meta time="5 min" level="卡片" note="方向是假设出来的，负号是答案在纠正你，不是你在纠正答案" />

很多人不敢下笔，怕箭头标反了整道题作废。真实情况恰恰相反：方向标反，结果只是整体变号，你一眼就能发现。

先标方向再列方程，省的是脑子，不是准确度。

## 方向是画上去的

日常那句比喻很好用：你说「这辆车向南开了 10 公里」，这个「南」是你站在某个路口定的坐标。车其实朝北，同一句话就变成「−10 公里」。方向不是事实，是描述用的坐标。

参考方向（reference direction）就是人为给电压、电流指定的正方向。算出来为正，说明实际方向与假设一致；为负，说明实际方向相反。

两条约定先记住：

- $U_{ab}$ 等于 a 点电位减 b 点电位，所以 $U_{ab} = -U_{ba}$，换个字母顺序，符号跟着变。
- 关联（被动）方向：电流从电压参考方向的「+」端流入。

$$
\text{关联：} U = RI \qquad \text{非关联：} U = -RI
$$

<FigBox title="同一个元件，两种参考方向" kind="电路" note="参考方向是画在图上的箭头，不是物理事实。关联方向下公式没有负号，非关联方向下要自己带上负号。这一条贯穿后面所有章节。">

<svg viewBox="0 0 470 230" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="60" y="14" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">关联方向 → U = RI</text>
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
  <text x="235" y="94" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电流从 + 端流入</text>

  <line x1="30" y1="116" x2="440" y2="116" stroke-dasharray="5 4" stroke-width="1"/>

  <text x="60" y="146" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">非关联方向 → U = −RI</text>
  <line x1="120" y1="184" x2="188" y2="184"/>
  <polyline points="188,184 202,172 216,196 230,172 244,196 258,184"/>
  <line x1="258" y1="184" x2="320" y2="184"/>
  <line x1="120" y1="162" x2="120" y2="208"/>
  <text x="132" y="156" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
  <text x="132" y="206" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">−</text>
  <text x="150" y="156" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">U</text>
  <line x1="270" y1="166" x2="330" y2="166" stroke-dasharray="4 3"/>
  <path d="M270 166 L280 162.2 L280 169.8 Z" class="sf-solid"/>
  <text x="300" y="158" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">I</text>
  <text x="235" y="226" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电流从 − 端流入</text>
</svg>

</FigBox>

## 三句错话

1. 怕「参考方向标错，答案就全错了」。不会。方向标错只让结果整体变号，你一眼能看出来：不合理的大负值，或者功率符号反了。这正是先假设的好处。
2. 以为电压的正负表示能量流动的方向。它只表示 a 点电位比 b 点高，与能量往哪流无关。能量往哪走，看电流方向和元件性质。
3. 以为关联方向就是电流实际从 + 端流入。关联是假设出来的关系。实际方向可能相反，那时算出来的 $I$ 就是负数。

## 例题

::: tip 例 1 · 同一段电阻，两种标法
题目：一个 $R = 4\ \Omega$ 的电阻，两端电压 12 V。分别按关联方向与非关联方向标注，求电流的代数值。

先想什么：这是纯算术题，唯一要练的是方向不同、符号不同。*（先把两种标法分开写，别在脑子里同时想。）*

步骤：

1. 关联方向（电流从 + 端流入）：$I = U/R = 12/4 = 3\ \text{A}$，为正，说明假设与实际一致。
2. 非关联方向（电流从 − 端流入）：$U = -RI$，即 $I = -U/R = -3\ \text{A}$。

验算：两种标法描述的是同一个物理电流，只是坐标不同，负号把方向信息搬进了符号里 ✓。再算功率：关联方向 $P = UI = 36\ \text{W}$，非关联方向 $P = -UI = -36\ \text{W}$，绝对值一样、符号相反，元件实际吸收的功率是 36 W。
:::

## 后面哪里用得着

> 完整内容见 [01 · 电路模型与参考方向](../01-basics/model-reference.md)

列 KCL/KVL 方程、判功率正负、写相量方程、算变压器同名端，每一步都要有一个参考方向撑着。养成先标箭头再列方程的习惯，这一整类错误就都消失了。
