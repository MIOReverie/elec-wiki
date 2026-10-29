---
title: 电位与参考点
description: 电位和电压差在哪、参考点为什么能随便选、换参考点时哪个量变哪个量不变，以及从任意路径求电位的技巧。
---

# 电位与参考点

<Meta time="5 min" level="卡片" note="电位是相对量，电压是绝对量；换参考点时电位全变、电压一点不变" />

两个人对着同一块板子报电位，一个说 12 V，一个说 0 V，谁也说服不了谁。电路没毛病，他们选的参考点不一样。

电位这件事，先说基准再说数字。

## 基准怎么定

说「这栋楼五层有多高」，你得先说相对地面还是相对地下室。换个基准，答案就差一层楼。

正式定义：选一个点作参考点（电位规定为 0），任一点的电位 $V_a = U_{a0}$，即 a 点对参考点的电压；任两点间的电压 $U_{ab} = V_a - V_b$。

| 符号 | 含义 |
| --- | --- |
| $V_a$ | a 点的电位，单位 V |
| $U_{ab}$ | a 点相对 b 点的电压，单位 V |
| $0$ | 参考点（电位恒为 0 的那一点） |

## 换参考点，哪些量跟着动

<FigBox title="同一段电路，换两个参考点" kind="电路" note="上面选 a 为参考，下面选 b 为参考：两个电位值整体挪了位置，但它们之间那个电压 U_ab 一个字都没变。电压才是电路里真正被元件感知的量。">

<svg viewBox="0 0 470 240" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="60" y="24" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">选 a 为参考点</text>
  <line x1="120" y1="52" x2="200" y2="52"/>
  <polyline points="200,52 214,40 228,64 242,40 256,64 270,52"/>
  <line x1="270" y1="52" x2="330" y2="52"/>
  <circle cx="120" cy="52" r="5" class="sf-dot"/>
  <circle cx="330" cy="52" r="5" class="sf-dot"/>
  <text x="120" y="36" text-anchor="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">a</text>
  <text x="330" y="36" text-anchor="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">b</text>
  <line x1="120" y1="52" x2="120" y2="82" stroke-dasharray="4 3"/>
  <path d="M112 74 L120 86 L128 74 Z" class="sf-solid"/>
  <text x="120" y="100" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">参考点（V_a = 0）</text>
  <text x="330" y="80" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">V_b = U_ab</text>
  <text x="225" y="76" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">U_ab 不变</text>

  <line x1="30" y1="126" x2="440" y2="126" stroke-dasharray="5 4" stroke-width="1"/>

  <text x="60" y="162" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">选 b 为参考点</text>
  <line x1="120" y1="192" x2="200" y2="192"/>
  <polyline points="200,192 214,180 228,204 242,180 256,204 270,192"/>
  <line x1="270" y1="192" x2="330" y2="192"/>
  <circle cx="120" cy="192" r="5" class="sf-dot"/>
  <circle cx="330" cy="192" r="5" class="sf-dot"/>
  <text x="120" y="176" text-anchor="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">a</text>
  <text x="330" y="176" text-anchor="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">b</text>
  <line x1="330" y1="192" x2="330" y2="222" stroke-dasharray="4 3"/>
  <path d="M322 214 L330 226 L338 214 Z" class="sf-solid"/>
  <text x="330" y="238" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">参考点（V_b = 0）</text>
  <text x="120" y="220" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">V_a = −U_ab</text>
  <text x="225" y="216" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">U_ab 不变</text>
</svg>

</FigBox>

换参考点，所有点的电位都平移同一个常数，任意两点间的电压完全不变。

参考点通常选电源负极或电路的公共端。电子电路里常把公共端画成接地符号，参考点就叫地。选了地之后可以直接写 $V_a$，不必再写 $U_{a0}$。

## 三句常听错的

1. 说「电位高的地方电流就流过去」。这只在电阻上成立，而且前提是电流从高电位流向低电位。电源内部电流是从低电位流向高电位，所以这句话不是通用规则。
2. 说「换个参考点答案就变，电位没意义」。变的是电位，不是电压。元件只关心两端电压，整个电路的行为一个数都不会变。
3. 以为参考点必须选大地。参考点只是记账的基准，随便选，唯一要求是全题统一。选支路汇合点最省事。

::: tip 计算技巧
求某点电位，从该点出发沿任意路径走到参考点，把路上各段的电压降代数相加即可。两点间电压与路径无关，走哪条路结果都一样。
:::

## 例题

::: tip 例 1 · 换参考点后两个电位怎么变
题目：一段电阻两端为 a、b，已知 $U_{ab} = 12\ \text{V}$。分别以 a、b 为参考点，求 $V_a$、$V_b$。

先想什么：只有差被给定，所以每次都靠 $U_{ab} = V_a - V_b$ 这一个关系，配合参考点电位为 0 来解。*（先认出哪个量被钉死，比直接套公式省事。）*

步骤：

1. 以 a 为参考：$V_a = 0$。代入 $12 = 0 - V_b$，得 $V_b = -12\ \text{V}$。
2. 以 b 为参考：$V_b = 0$。代入 $12 = V_a - 0$，得 $V_a = +12\ \text{V}$。

验算：两种参考点下 $V_a - V_b$ 都是 12 V ✓（电压不变，这是唯一该守恒的东西）。
:::

## 后面哪里用得着

> 完整内容见 [02 · 基尔霍夫定律与电位](../01-basics/kcl-kvl.md)

列 KVL 找电位、读电路图上的接地符号、算分压电路里每一节的电位，都要靠这张卡。更常见的场合是争执：两个人对同一个电路给出不同的电位值时，先问一句，他选的参考点和你一样吗。
