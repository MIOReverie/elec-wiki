---
title: 万用表 · 电压电流电阻与通断
description: 四个功能四种接法，接错一次就烧表；量程、真有效值、四线法、虚电与接触电阻，都是读数骗人的地方。
outline: [2, 3]
---

# 万用表

<Meta time="45 min" level="核心" note="读数错的时候，九成不是表不准，是接法或档位用错了：电压档并联、电流档串联、电阻档断电测，外加一句「先估算再读数」" />

万用表是台上唯一一台任何阶段都能安全上手的仪器，也是翻车率最高的一台。原因很简单：面板上只印着四个符号（V、A、Ω 和一个二极管图标），背后却是四种互斥的接线方式。

把电流档当电压表并联进电路，轻则读数全错，重则电源直接短路。把电阻档接到带电的电路上，读数没意义，严重时烧档。

一句话记住它：万用表会改变被测电路。读数永远要打个折扣去理解。

::: tip 读这页之前
会欧姆定律 $U=IR$、会串并联和分压，四个档的接法就不会弄反（<Prereq id="ohm" />、<Prereq id="series-parallel" />，速查见[公式速查表](../shared/cheatsheet.md)）。复数与微积分用不上，这里只有乘除、开方和百分数。

两个符号先说明：$R_{\text{sh}}$ 是电流档内部的分流电阻（shunt，给电流提供一条已知阻值的取样通路），$R_{\text{in}}$ 是电压档的输入阻抗（input impedance，表自身呈现给被测电路的等效电阻）。单位记两个：mΩ $=10^{-3}$ Ω、MΩ $=10^{6}$ Ω。全部约定见[符号与约定](../guide/notation.md)。
:::

## 五个功能怎么接

先看图，再看字。每一格里的表笔位置，就是你在实物上该接的位置；表里塞了什么元件，决定了这一档会把电路改成什么样。

四条规矩先立在这儿：电压并联，电流串联，电阻与通断必须先断电，二极管档读的是压降而不是电阻。插错一次，可能烧穿分流电阻。

<FigBox title="四个功能的接线与内部等效，一张图记住" kind="结构" note="左上：电压档并联，内部是 10 MΩ 输入阻抗。右上：电流档串联断口，内部是毫欧级分流电阻。左下：电阻档断电测，表自己送出电流。右下：二极管档内部是 1 mA 恒流源。每一格里的表笔位置就是你在实物上该接的位置。">

<svg viewBox="0 0 560 420" role="img" aria-label="万用表四个功能的接线方式与内部等效：电压档并联、电流档串联（R_sh 与负载同流）、电阻档断电送流、二极管档 1 毫安恒流源">
<g fill="none" stroke="var(--vp-c-divider)">
  <rect x="10" y="28" width="260" height="160" />
  <rect x="290" y="28" width="260" height="160" />
  <rect x="10" y="248" width="260" height="140" />
  <rect x="290" y="248" width="260" height="140" />
</g>

<g font-size="11" fill="var(--vp-c-text-1)" text-anchor="middle" font-weight="700">
  <text x="140" y="18">电压档：并联</text>
  <text x="430" y="18">电流档：串联</text>
  <text x="140" y="240">电阻档：断电测</text>
  <text x="430" y="240">二极管档：1 mA 恒流源</text>
</g>

<!-- 电压档 -->
<g stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none">
  <circle cx="50" cy="52" r="7" />
  <circle cx="50" cy="176" r="7" />
  <line x1="57" y1="52" x2="120" y2="52" />
  <line x1="120" y1="52" x2="120" y2="92" />
  <line x1="120" y1="136" x2="120" y2="176" />
  <line x1="120" y1="176" x2="57" y2="176" />
  <line x1="120" y1="52" x2="232" y2="52" />
  <line x1="120" y1="176" x2="232" y2="176" />
  <line x1="232" y1="52" x2="232" y2="92" />
  <line x1="232" y1="136" x2="232" y2="176" />
</g>
<rect x="106" y="92" width="28" height="44" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="120" y="112" font-size="10" text-anchor="middle" fill="var(--vp-c-brand-1)">表</text>
<text x="120" y="127" font-size="10" text-anchor="middle" fill="var(--vp-c-brand-1)">10 MΩ</text>
<rect x="220" y="92" width="24" height="44" rx="3" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="232" y="152" font-size="11" text-anchor="middle">R</text>
<g font-size="10" fill="var(--vp-c-text-3)" text-anchor="end">
  <text x="26" y="56">V</text>
  <text x="26" y="180">COM</text>
</g>
<g font-size="9" fill="var(--vp-c-brand-1)" text-anchor="middle">
  <text x="50" y="55">+</text>
  <text x="50" y="179">−</text>
</g>
<text x="196" y="70" font-size="10" fill="var(--vp-c-text-3)">被测电压</text>
<text x="140" y="206" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">表内只有一只高阻：并联进电路，只分掉一点点电流</text>

<!-- 电流档 -->
<g stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none">
  <circle cx="326" cy="52" r="7" />
  <circle cx="326" cy="176" r="7" />
  <line x1="333" y1="52" x2="470" y2="52" />
  <line x1="514" y1="52" x2="540" y2="52" />
  <line x1="540" y1="52" x2="540" y2="176" />
  <line x1="540" y1="176" x2="428" y2="176" />
  <line x1="380" y1="176" x2="333" y2="176" />
</g>
<rect x="470" y="44" width="44" height="16" rx="3" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="492" y="38" font-size="11" text-anchor="middle">R</text>
<rect x="380" y="168" width="48" height="16" rx="3" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="404" y="160" font-size="10" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh = 10 mΩ</text>
<g font-size="10" fill="var(--vp-c-text-3)" text-anchor="end">
  <text x="306" y="56">A</text>
  <text x="306" y="180">COM</text>
</g>
<g font-size="9" fill="var(--vp-c-brand-1)" text-anchor="middle">
  <text x="326" y="55">+</text>
  <text x="326" y="179">−</text>
</g>
<text x="350" y="104" font-size="10.5" fill="var(--vp-c-brand-1)">电流必须流过表</text>
<text x="430" y="206" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">断开回路、把表串进断口；R_sh 只取样，不改电路</text>

<!-- 电阻档 -->
<g stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none">
  <circle cx="50" cy="282" r="7" />
  <circle cx="50" cy="372" r="7" />
  <line x1="57" y1="282" x2="130" y2="282" />
  <line x1="130" y1="282" x2="130" y2="296" />
  <line x1="130" y1="322" x2="130" y2="372" />
  <line x1="57" y1="372" x2="130" y2="372" />
  <line x1="130" y1="282" x2="220" y2="282" />
  <line x1="220" y1="282" x2="220" y2="300" />
  <line x1="220" y1="360" x2="220" y2="372" />
  <line x1="130" y1="372" x2="220" y2="372" />
</g>
<rect x="108" y="296" width="44" height="26" rx="4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="130" y="313" font-size="10" text-anchor="middle" fill="var(--vp-c-brand-1)">恒压源</text>
<rect x="212" y="300" width="16" height="60" rx="3" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="232" y="334" font-size="11" text-anchor="start">R</text>
<circle cx="220" cy="282" r="4" fill="var(--vp-c-text-2)" />
<circle cx="220" cy="372" r="4" fill="var(--vp-c-text-2)" />
<g font-size="10" fill="var(--vp-c-text-3)" text-anchor="end">
  <text x="26" y="286">Ω</text>
  <text x="26" y="376">COM</text>
</g>
<path d="M 190 282 L 190 262" stroke="var(--vp-c-brand-1)" stroke-width="1.4" fill="none" marker-end="url(#dmm-ar)" />
<text x="196" y="258" font-size="10" fill="var(--vp-c-brand-1)">表送出测试电流</text>
<text x="140" y="410" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">外部必须断电放电，否则外来电压灌进欧姆档</text>

<!-- 二极管档 -->
<g stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none">
  <circle cx="326" cy="282" r="7" />
  <circle cx="326" cy="372" r="7" />
  <line x1="333" y1="282" x2="480" y2="282" />
  <line x1="480" y1="282" x2="480" y2="302" />
  <line x1="480" y1="328" x2="480" y2="372" />
  <line x1="333" y1="372" x2="480" y2="372" />
  <line x1="400" y1="282" x2="400" y2="309" />
  <line x1="400" y1="345" x2="400" y2="372" />
</g>
<circle cx="400" cy="327" r="18" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<path d="M 400 312 L 400 340" stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none" marker-end="url(#dmm-ar)" />
<g stroke="var(--vp-c-text-2)" stroke-width="1.6" fill="none">
  <path d="M 466 302 L 494 302 L 480 328 Z" fill="var(--vp-c-bg-soft)" />
  <line x1="466" y1="328" x2="494" y2="328" />
</g>
<path d="M 296 274 L 308 281 L 296 288 Z" fill="var(--vp-c-text-2)" stroke="var(--vp-c-text-2)" stroke-width="1.2" />
<line x1="308" y1="274" x2="308" y2="288" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="372" y="354" font-size="10" text-anchor="end" fill="var(--vp-c-brand-1)">1 mA 恒流源</text>
<text x="420" y="296" font-size="10" fill="var(--vp-c-text-3)">二极管（正向）</text>
<text x="430" y="410" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">读数是「1 mA 下的导通压降」，不是电阻</text>

<defs>
  <marker id="dmm-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
</svg>

</FigBox>

### 电压档：并联，但并联点要选对

测 $U_{ab}$ 就是测 $a$ 点与 $b$ 点之间的电位差：红笔接 $a$，黑笔接 $b$，表在外面并联在 $a$、$b$ 之间，对应上图左上那一格。数字表的读数带符号，读数为负说明极性与表笔相反，红笔那点电位更低。

买表时唯一值得看的规格是**输入阻抗**，常见 10 MΩ。它的意思是：两个测试点之间，除了被测元件，还并着表自己的 10 MΩ：

$$U_{\text{读数}} = U_{\text{真实}} \cdot \frac{R_{\text{被测}}}{R_{\text{被测}} + 10\,\text{M}\Omega}$$

表里这只 10 MΩ 会分流，所以测之前先算个大概：分压估电压，欧姆定律估电流。实测跟估算差一个数量级以上，八成是档位或接线错了。

测 100 kΩ 上的电压，读数低 1%；测 1 MΩ，低 9%；测 10 MΩ，直接少一半。所以高阻节点上，万用表的读数只能当「有没有」用，不能当「是多少」用。测开路线圈或电容两端，还会读出一个随时间衰减的虚电。表笔本身带几十到 100 pF 的输入电容，量高频节点时它比 10 MΩ 更碍事。

要较真，换示波器（10X 探头 10 MΩ，也是个分压器，但至少你知道它），或者上专用高压探头、静电计。

### 电流档：串联，分流电阻会改电路

测电流得让电流流过表：断开电路的一段，把两根表笔串进断口，构成「电源 → 负载 → 表 → 回电源」的一条回路。表内部是一个**分流电阻**（shunt，给被测电流提供已知阻值的取样通路，表测它两端的压降换算成电流）$R_{\text{sh}}$。它的阻值跟量程反着走，量程小，$R_{\text{sh}}$ 就大：

<FigBox title="电流档的取样原理与三档分流电阻" kind="结构" note="左：电流档的本质是一个毫欧级电阻加一个毫伏表，测出的压降除以阻值就是电流。右：量程小的时候 R_sh 大，串进 10 Ω 电路后压降占比就上来，μA 档的 100 Ω 已经能完全改变电路的工作点。">

<svg viewBox="0 0 560 200" role="img" aria-label="左：分流电阻 R_sh 与跨在它两端的毫伏表组成电流档，测压降换算电流；右：三个量程的分流电阻值与串入 10 欧负载时的附加压降">
<text x="120" y="14" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">电流档内部：R_sh + 毫伏表</text>
<g stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none">
  <line x1="30" y1="60" x2="90" y2="60" />
  <line x1="150" y1="60" x2="210" y2="60" />
</g>
<rect x="90" y="44" width="60" height="32" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="120" y="64" font-size="11" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh</text>
<g stroke="var(--vp-c-text-2)" stroke-width="1.4" fill="none">
  <path d="M 60 60 L 60 36 L 107 36" />
  <path d="M 133 36 L 180 36 L 180 60" />
</g>
<circle cx="120" cy="36" r="13" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
<text x="120" y="40" font-size="10" text-anchor="middle" fill="var(--vp-c-text-2)">mV</text>
<circle cx="60" cy="60" r="3" fill="var(--vp-c-text-2)" />
<circle cx="180" cy="60" r="3" fill="var(--vp-c-text-2)" />
<g font-size="10.5" fill="var(--vp-c-text-3)">
  <text x="120" y="106" text-anchor="middle">mV 表并在 R_sh 两端，只取压降</text>
  <text x="120" y="124" text-anchor="middle">I = U_sh / R_sh：测压降，换算成电流</text>
  <text x="120" y="150" text-anchor="middle">量程越小 → R_sh 越大 → 串进去的电阻越大</text>
</g>
<text x="420" y="14" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">三档对比（串入 10 Ω 负载）</text>
<g stroke="var(--vp-c-divider)" stroke-width="1">
  <line x1="300" y1="26" x2="540" y2="26" />
  <line x1="300" y1="54" x2="540" y2="54" />
  <line x1="300" y1="84" x2="540" y2="84" />
  <line x1="300" y1="114" x2="540" y2="114" />
  <line x1="300" y1="144" x2="540" y2="144" />
</g>
<g font-size="10.5" fill="var(--vp-c-text-3)">
  <text x="300" y="44">量程</text>
  <text x="380" y="44" text-anchor="middle">R_sh</text>
  <text x="480" y="44" text-anchor="middle">附加压降</text>
</g>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="300" y="74">200 mA</text>
  <text x="380" y="74" text-anchor="middle">0.1~1 Ω</text>
  <text x="480" y="74" text-anchor="middle">10~100 mV</text>
  <text x="300" y="104">2~10 A</text>
  <text x="380" y="104" text-anchor="middle">10 mΩ</text>
  <text x="480" y="104" text-anchor="middle">5 mV @ 500 mA</text>
  <text x="300" y="134">μA 档</text>
  <text x="380" y="134" text-anchor="middle">≥100 Ω</text>
  <text x="480" y="134" text-anchor="middle" fill="var(--vp-c-brand-1)">不适用</text>
</g>
<text x="420" y="172" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">被测电路阻值与 R_sh 同量级时，表本身就是电路的一部分</text>
</svg>

</FigBox>

| 量程 | 分流电阻典型值 | 串入 10 Ω 负载时的附加压降 |
| --- | --- | --- |
| 200 mA | 0.1 Ω ~ 1 Ω | 10~100 mV |
| 2 A ~ 10 A | 10 mΩ | 5 mV（500 mA 时） |
| μA 档（部分表） | 100 Ω 以上 | 完全不适用 |

5 V 电源经 10 Ω 负载，真实电流 0.500 A；串进一只 10 mΩ 的分流电阻之后，电流变成

$$I' = \frac{5}{10 + 0.01} = 0.4995\ \text{A}$$

误差只有 −0.1%，在电流档里算好表。10 mΩ 看着微不足道，串在 10 Ω 负载上是 0.1%，串在 1 Ω 负载上就是 1%。可要是被测电路的阻抗跟分流电阻一个量级（比如量一只 10 mΩ 采样电阻上的电流，或者 4~20 mA 回路里的电流），这 0.1%~10% 的改变就不能当没看见。

更危险的是串错位置。把电流档当电压表并联到电源两端，等于用一根 10 mΩ 的导线把电源短路，理论电流 $5 / 0.01 = 500\ \text{A}$（实际上受电源内阻与表保险丝限制）。好表在 mA 档都有保险丝，常见的规格是 200 mA 与 10 A 两只，但保险丝熔断那一瞬间，你的表已经变成了一段导线。μA 级的电流更不能串进 5 V 电路直接量，表本身就会把电路带偏。

### 电阻档：只能断电测

欧姆档的原理是在两端加一个已知电压，测流过被测对象的电流。由此有三条硬规矩：

- 被测对象必须断电，电容还要放电。否则外部电压灌进欧姆档，读数没意义，严重时烧档；
- 被测对象最好从电路上摘下来，或者至少断开一端。不断开，你测到的是「这个元件与周围所有路径的并联」；
- 表笔短接会有非零读数（表笔线电阻加接触电阻，通常 0.1~0.3 Ω）。测 0.1 Ω 级的小电阻之前先记下它再减掉，不然一只 0.1 Ω 的采样电阻能读出三倍。

拿两个 10 kΩ 电阻验证并联：两个都焊在板上没拆，欧姆档读出 5 kΩ，这个数会让你以为「板上有个 5 kΩ 的元件」，也可能让你错判某只电阻「变值了」。

### 通断档：一根会叫的电阻档

**通断档**（蜂鸣档）本质就是电阻档，电阻低于阈值（通常 30~50 Ω）时蜂鸣。用途只有一个：快速找线，查杜邦线断没断、焊点连没连、地线通不通。

一根断掉的杜邦线在通断档上显示 OL，不是 0 V。它只给「通」或「不通」两个状态，判断不了阻值大小。一个 40 Ω 的虚接焊点会叫，一根 0.5 Ω 的好线也会叫。想知道连接质量，换电阻档。

### 二极管与三极管档

二极管档内置一个约 1 mA 的恒流源（部分表用 2 mA，或者按量程切换），测两根表笔之间的电压。正向测硅二极管读 0.55~0.70 V，反向读 OL（溢出，也就是断路）。这个读数随电流变化：同一只 1N4148，1 mA 时约 0.60 V，10 mA 时约 0.68 V。别人说「0.6 V」是不严谨的，得说清是哪个电流下。

按管子类型看压降，一张表就够：

| 管子类型 | 1 mA 正向压降 |
| --- | --- |
| 硅二极管 | 0.55~0.70 V |
| 肖特基二极管 | 0.2~0.4 V |
| 发光二极管 | 1.5~3.2 V |

三极管档（hFE 档）要把管子插进表上的插孔，表用一个小的基极电流测集电极电流，直接读出 $\beta$。这是特定工作点下的 β（通常 $I_C \approx 1\ \text{mA}$），别拿它推算大电流下的放大倍数。同一只 2N3904，1 mA 时 β 可能 200，50 mA 时可能只剩 50。

## 量程与分辨率

买表时最容易被参数表骗的一句话是「多一位更准」。位数和精度是两件事。

规格里写 3½ 位、4½ 位，意思是最高位只能显示 0 到 9 里的少数几个数（半位），能显示 0 或 1 的那一位就叫半位。

- 3½ 位（入门表，1999 计数）：2 V 量程上最高显示 1.999 V，分辨率 1 mV；
- 4½ 位（20000 计数）：2 V 量程上最高显示 1.9999 V，分辨率 0.1 mV；
- 5½ 位、6½ 位（台式表）：分辨率到 1 μV，用于校准与精密分析；实验室里还有 7½ 位的机器，那是校准别的表用的。

同一块 3½ 位表，2 V 档末位一个字是 1 mV，20 V 档就是 10 mV。位数决定的是最小刻度，不是可信程度。手持表的量程一般从 200 mV、2 V、20 V 一路到 200 V 与 1000 V，共 5 档；位数往上加，价格跟着翻：3½ 位是入门，4½ 位是进阶，6½ 位已经是校准实验室的设备。

分辨率不等于精度。一块 4½ 位表的精度可能写着「±(0.05% + 3)」，即读数的 0.05% 加最后三位数的 3 个字。测量值 1.0000 V 时，真实值落在

$$1.0000 \pm (0.0005 + 0.003) = 1.0000 \pm 0.0035\ \text{V}$$

范围内，也就是 3.5 mV 的不确定度。那个「+ 3」的意思是末位再放宽 3 个字，别只盯着百分数看。你需要的不是更多位数，是先看精度那一行：那个 0.05% 才是真话，后头的位数只是分辨率。

自动量程与手动量程各有用处。自动量程会来回跳，读数稳定时更省心；手动量程在你知道大概多少的时候更快，也不会因为量程切换瞬间的过压而受伤。测未知电压，先用手动最高档测一次，确认量级再切。

## 真有效值与平均值

同一块表，量市电很准、量 PWM 就错一半，这种事天天发生。关键在「平均值响应」四个字：它只对正弦波成立。

**有效值**（RMS，root mean square，均方根，指热效应等效的直流值）的定义是

$$U_{\text{rms}} = \sqrt{\frac{1}{T}\int_0^T u^2(t)\,dt}$$

对纯正弦波，$U_{\text{rms}} = U_p / \sqrt{2} = 0.707\,U_p$，波形因数 $U_{\text{rms}} / U_{\text{avg,rect}} = 1.111$。低价万用表（非真有效值，叫「平均值响应、有效值标定」）就按 1.111 这个系数标定：它测整流后的平均值，再乘 1.111 显示出来。

对正弦波，这个换算是精确的。对任何非正弦波，误差就看波形因数偏离 1.111 多少。

两种表的分工：

- 真有效值表（true-RMS）：内部直接按 $U_{\text{rms}} = \sqrt{\frac{1}{T}\int_0^T u^2(t)\,dt}$ 算，任何波形都给真实的热效应等效值；
- 平均值响应表（average-responding）：先整流取平均，再乘 1.111 显示，这个系数只对正弦波正确。

波形被开关电路削过之后，1.111 就不再成立。三种典型波形摆在一起看：

<FigBox title="平均值表只在正弦波上是对的" kind="结构" note="三种波形幅值同为 12 V：正弦波两种表读数一致；25% 占空比方波的真有效值是 6.0 V，平均表只显示 3.33 V，偏低 44.5%；削顶正弦介于两者之间。凡是 PWM、相控调光、开关电源输出，都必须用真有效值表。">

<svg viewBox="0 0 620 340" role="img" aria-label="三种波形的平均表读数与真有效值对比：正弦两者一致，25% 方波真值 6.0 V 而平均表只给 3.33 V，削顶正弦介于两者之间">
<text x="150" y="18" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">正弦：两者都准</text>
<text x="460" y="18" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">25% 方波：平均表错 44.5%</text>
<text x="150" y="206" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">削顶正弦：介于两者之间</text>
<text x="460" y="206" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">结论</text>
<line x1="20" y1="80" x2="280" y2="80" stroke="var(--vp-c-divider)" stroke-width="1" />
<polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="20,80 27,58 34,38 41,26 48,22 55,22 62,26 69,38 76,58 83,80 90,102 97,122 104,134 111,138 118,134 125,122 132,102 139,80 146,58 153,38 160,26 167,22 174,22 181,26 188,38 195,58 202,80 209,102 216,122 223,134 230,138 237,134 244,122 251,102 258,80 265,58" />
<text x="150" y="158" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">真有效值 12 / √2 = 8.49 V</text>
<text x="150" y="174" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">平均表也显示 8.49 V：通过</text>
<line x1="340" y1="80" x2="600" y2="80" stroke="var(--vp-c-divider)" stroke-width="1" />
<polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="340,80 340,20 360,20 360,80 420,80 420,20 440,20 440,80 500,80 500,20 520,20 520,80 580,80" />
<line x1="340" y1="50" x2="580" y2="50" stroke="var(--vp-c-text-2)" stroke-width="1.2" stroke-dasharray="4 3" />
<line x1="340" y1="63.4" x2="580" y2="63.4" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="2 3" />
<text x="460" y="158" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">虚线：真有效值 6.0 V（高）／平均表 3.33 V（低）</text>
<text x="460" y="174" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">两条虚线的高度差就是 44.5% 的读数误差</text>
<line x1="20" y1="268" x2="280" y2="268" stroke="var(--vp-c-divider)" stroke-width="1" />
<polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="20,268 25,253.6 30,240.1 35,228.2 40,228 45,228 50,228 55,228 60,228 65,228 70,228.2 75,240.1 80,253.6 85,268 90,282.4 95,295.9 100,307.8 105,308 110,308 115,308 120,308 125,308 130,308 135,307.8 140,295.9 145,282.4 150,268 155,253.6 160,240.1 165,228.2 170,228 175,228 180,228 185,228 190,228 195,228 200,228.2 205,240.1 210,253.6 215,268 220,282.4 225,295.9 230,307.8 235,308 240,308 245,308 250,308 255,308 260,308 265,307.8 270,295.9 275,282.4 280,268" />
<text x="150" y="330" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">相控调光、整流削波的常见形状：读数分叉，差多少看削掉多少</text>
<g font-size="10.5" fill="var(--vp-c-text-2)">
  <text x="460" y="236" text-anchor="middle">正弦波：平均表可用</text>
  <text x="460" y="258" text-anchor="middle">任何开关波形：必须真有效值</text>
  <text x="460" y="284" text-anchor="middle" fill="var(--vp-c-text-3)">测 PWM、可控硅调压、开关电源</text>
  <text x="460" y="304" text-anchor="middle" fill="var(--vp-c-text-3)">先确认表上有没有 true-RMS 标志</text>
</g>
</svg>

</FigBox>

### 25% 占空比的方波

一个 12 V 幅值、占空比 25% 的单极性方波（低电平为 0）。它的真有效值是 6.0 V，平均表只给 3.33 V，差 44.5%，先记住这三个数，下面再算一遍：

$$U_{\text{rms}} = \sqrt{0.25 \times 12^2 + 0.75 \times 0^2} = \sqrt{36} = 6.000\ \text{V}$$

$$U_{\text{avg}} = 0.25 \times 12 = 3.000\ \text{V}$$

平均值响应的表会显示 $1.111 \times 3.000 = 3.332\ \text{V}$，相对真有效值偏低

$$\frac{3.332 - 6.000}{6.000} = -44.5\%$$

差了将近一半。测 PWM 调光、可控硅调压、开关电源输出、LED 驱动，天天会遇到这个坑。占空比低的时候，平均表偏得更凶：同样是 12 V 幅值，占空比 10% 时真有效值 3.79 V，平均表只给 1.33 V。

### 正弦波为什么准

220 V 有效值的市电正弦，峰值与整流平均值分别是

$$U_p = 220 \times \sqrt{2} = 311.1\ \text{V}, \quad U_{\text{avg}} = 0.6366 \times 311.1 = 198.1\ \text{V}$$

$$1.111 \times 198.1 = 220.0\ \text{V}$$

这就是「平均表也能量市电」的原因：市电是正弦。一旦市电接进有相控调光器的线路，波形被削掉一块，平均表就再也不准了。

::: tip 例 1 · 用真有效值补算占空比 {#ex-dmm-rms}
题干：一台真有效值万用表在一个 12 V 幅值、低电平为 0 的 PWM 输出上读到有效值 7.0 V。求这路 PWM 的占空比；换成平均响应的表，会读多少？

解。

第 1 步：由有效值反推占空比

对幅值 $V_p$、占空比 $D$ 的单极性方波，$U_{\text{rms}} = V_p\sqrt{D}$。代入：

$$D = \left(\frac{7.0}{12}\right)^2 = \frac{49}{144} = 0.3403 \approx 34.0\%$$

第 2 步：算平均响应表的读数

平均值 $= 0.3403 \times 12 = 4.083\ \text{V}$，平均表显示 $1.111 \times 4.083 = 4.537 \approx 4.54\ \text{V}$。

第 3 步：验算一致性

用刚才 25% 占空比、12 V 幅值那组数据反查：$D = (3.332/1.111)/12 = 0.25$，跟已知结果吻合，说明这个反推方法靠谱。

> 为什么这么想：真有效值表本身就是按 $\sqrt{\frac{1}{T}\int u^2 dt}$ 算的，对单极性方波它才保有 $V_p\sqrt{D}$ 这个干净的关系。波形一旦不是方波（比如经过 RC 滤波、带上升下降沿），这个式子就不成立了，必须回到定义式，或者直接用示波器量占空比。
:::

## 四线法

电阻档有个盲区：被测电阻小到跟表笔接触电阻一个量级时，读数就没法看了。救法是让电流回路与电压回路分开走，也就是四线法。

万用表的电阻档是**两线制**：激励电流和测量电压共用两根表笔。表笔线、插头、焊点、接触电阻，全算进了读数。

### 10 mΩ 采样电阻

电流检测常用 10 mΩ 的采样电阻（比如电源芯片的 $I_{\text{sense}}$ 电阻）。假设四线焊盘本身没问题，但你的表笔与焊盘之间各有 10 mΩ 接触电阻，加起来 20 mΩ：

$$R_{\text{读数}} = 0.010 + 0.020 = 0.030\ \Omega, \quad \text{误差} = \frac{0.030 - 0.010}{0.010} = +200\%$$

读数是真实值的三倍。这不是表不准，是测量方法把接触电阻一起量进去了。

### 四线法怎么接

**四线法**（开尔文接法，Kelvin connection）用两对表笔：一对注入电流（Force，激励端，给被测电阻提供已知测试电流），另一对测电压（Sense，取样端，只取电压、几乎不取电流）。电流路径与电压路径只在被测电阻内部汇合，两条电压表笔上几乎不取电流，所以表笔电阻不产生压降：

$$R = \frac{U_{\text{sense}}}{I_{\text{force}}}$$

<FigBox title="两线与四线：接触电阻藏在了哪条回路里" kind="结构" note="左：两线法里接触电阻与被测电阻串联在同一条路上，读数 = R + 2R_c，小电阻时误差被放大。右：四线法里电流沿外侧回路流，电压取样点在电阻根部内侧，接触电阻上的压降不进入电压表读数，误差只剩表自身精度。">

<svg viewBox="0 0 560 230" role="img" aria-label="左图两线法接触电阻串联在读数里，右图四线法电压取样点避开接触电阻">
<defs>
  <marker id="dmm-k1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="dmm-k2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="130" y="18" text-anchor="middle" font-weight="700">两线：R_c 在读数里</text>
  <line x1="30" y1="60" x2="60" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="60" y="48" width="46" height="24" rx="4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="83" y="44" text-anchor="middle" fill="var(--vp-c-text-3)">R_c</text>
  <line x1="106" y1="60" x2="140" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="140" y="46" width="52" height="28" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="166" y="44" text-anchor="middle" fill="var(--vp-c-brand-1)">R = 0.1 Ω</text>
  <line x1="192" y1="60" x2="226" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="226" y="48" width="46" height="24" rx="4" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="249" y="44" text-anchor="middle" fill="var(--vp-c-text-3)">R_c</text>
  <line x1="272" y1="60" x2="292" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="30" cy="60" r="3" fill="var(--vp-c-brand-1)" />
  <circle cx="292" cy="60" r="3" fill="var(--vp-c-brand-1)" />
  <text x="30" y="80" text-anchor="middle">红</text>
  <text x="292" y="80" text-anchor="middle">黑</text>
  <path d="M 30 60 L 30 24 L 292 24 L 292 60" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#dmm-k1)" />
  <text x="161" y="94" text-anchor="middle" fill="var(--vp-c-text-3)">读数 = 0.1 + 2×0.005 = 0.110 Ω</text>
  <text x="161" y="110" text-anchor="middle" fill="var(--vp-c-brand-1)">误差 +10%：R_c 与 R 串在一条路上</text>

  <text x="430" y="18" text-anchor="middle" font-weight="700">四线：取样点在内侧</text>
  <line x1="330" y1="60" x2="392" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="392" y="46" width="52" height="28" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="418" y="44" text-anchor="middle" fill="var(--vp-c-brand-1)">R = 0.1 Ω</text>
  <line x1="444" y1="60" x2="510" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="330" cy="60" r="3" fill="var(--vp-c-brand-1)" />
  <circle cx="510" cy="60" r="3" fill="var(--vp-c-brand-1)" />
  <text x="330" y="80" text-anchor="middle">F+</text>
  <text x="510" y="80" text-anchor="middle">F−</text>
  <circle cx="396" cy="60" r="3" fill="var(--vp-c-text-2)" />
  <circle cx="440" cy="60" r="3" fill="var(--vp-c-text-2)" />
  <line x1="396" y1="60" x2="396" y2="120" stroke="var(--vp-c-text-2)" stroke-width="1.2" />
  <line x1="440" y1="60" x2="440" y2="120" stroke="var(--vp-c-text-2)" stroke-width="1.2" />
  <rect x="384" y="120" width="68" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="418" y="137" text-anchor="middle">电压表</text>
  <text x="396" y="160" text-anchor="middle" fill="var(--vp-c-text-2)">S+</text>
  <text x="440" y="160" text-anchor="middle" fill="var(--vp-c-text-2)">S−</text>
  <path d="M 330 60 L 330 24 L 510 24 L 510 60" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#dmm-k1)" />
  <text x="420" y="184" text-anchor="middle" fill="var(--vp-c-text-2)">电流走外侧，取样在电阻根部</text>
  <text x="420" y="200" text-anchor="middle" fill="var(--vp-c-brand-1)">R_c 上的压降不进电压表 → 读数只剩 R 本身</text>
</g>
</svg>

</FigBox>

代价是激励电流。用 1 mA 去测 10 mΩ，端电压只有

$$U = 0.010 \times 10^{-3} = 10\ \mu\text{V}$$

普通 4½ 位表在 200 mV 档的分辨率是 10 μV，读到的只有 1 个字。所以四线测量通常配 1 A 恒定电流：

$$U = 0.010 \times 1 = 10.0\ \text{mV}$$

这时 200 mV 档读到 $10.00\ \text{mV}$，换算 10.00 mΩ，分辨率就够了。台式四线微欧计就是这么干的：一次注入 1 A 或 10 A，测几十 μV 到几 mV 的端电压。

手里没有四线表，两个替代法。一是两线测完手动减短接读数：先短接表笔记下 $R_0$，再测，用 $R_{\text{测}} - R_0$。二是乘一个已知系数：把 10 mΩ 电阻与 1 Ω 电阻串联，测总电阻再反推。两者在小电阻上都只能做到 ±若干 mΩ 的精度。

## 二极管与三极管怎么判

### 二极管：三个读数定生死

用二极管档，把管子从电路上拔下来（至少断开一端），测三次：

| 测法 | 硅二极管正常读数 | 异常读数与含义 |
| --- | --- | --- |
| 红笔接阳极、黑笔接阴极 | 0.55~0.70 V | OL：开路；0.0 V：短路 |
| 黑笔接阳极、红笔接阴极 | OL | 有读数：漏电或反向击穿 |
| 用电阻档测反向 | 高阻/OL | 几十 kΩ 以下：漏电 |

红笔要接阳极，因为二极管档的红笔是正电位输出，黑笔是回流端，红笔接阳极才是正偏。这一点跟「红笔是正极」的直觉一致，但跟三极管的判别方法不同，别混。

### 三极管：红黑笔的位置有讲究

NPN 管有两个背靠背的 PN 结：B→E 与 B→C。用二极管档以基极为基准测六次：

| 测法（NPN） | 读数 | 用红/黑笔顺序描述 |
| --- | --- | --- |
| 红 B、黑 E | 0.6~0.7 V（或 0.2~0.3 V，锗） | 正向 B-E 结 |
| 红 B、黑 C | 0.5~0.65 V（略小于 B-E） | 正向 B-C 结 |
| 红 E、黑 B | OL | 反向 |
| 红 C、黑 B | OL | 反向 |
| E 与 C 之间任意方向 | OL | 正常情况下有两个结阻断 |

PNP 管把红黑笔对调：黑笔接 B，红笔依次接 E、C，两个正向读数相同，其余 OL。

判别 NPN 还是 PNP 的快速方法：找到那个「红笔一接上去，另外两脚都有读数」的脚，那是 NPN 的基极；反过来，「黑笔一接上去，另外两脚都有读数」，那是 PNP 的基极。

### 读数之外还要看什么

二极管档只能判断「结还在不在」。要看管子有没有放大能力，得测 hFE，或者接一个 $I_B$ 已知的电路：

$$\beta = \frac{I_C}{I_B}$$

## 虚电与接触电阻

有两类情形最坑人：表没坏、电路也没坏，读数却把你带进沟里。一类是虚电（读到一个不存在的电压），一类是接触电阻（一个真实存在却被忽略的电阻）。两者都能用一个小动作验证。

### 虚电

把万用表接到一个开路的电感、一根长导线、或者已经断电但电容没放完的节点上，它会显示「有一个电压」。这电压的来头可能是：

- 容性耦合：附近的交流导线通过几十 pF 的分布电容耦合过来，高阻表把它当成电压；
- 电容残压：大电容放完电后，表笔一碰又充上一点，读数瞬间是满的，慢慢下降；
- 电池与触点氧化：断开的开关两端可能因为氧化层维持一个微小电压（几十 mV）。

识别方法：在表笔两端并一只 100 kΩ 到 1 MΩ 的电阻当假负载。真电压不掉，虚电压立刻掉到接近 0 V。并上假负载读数就归零，那这个电压从头到尾就不属于电路。数字电路里，一个显示 1.5 V 的悬空输入比显示 0 V 更危险：它可能只是虚电，接上负载就掉。

### 接触电阻

面包板的弹簧片、杜邦线的插针、鳄鱼夹的齿，每个接点都有接触电阻。典型范围：

| 接法 | 典型接触电阻 |
| --- | --- |
| 插拔良好的杜邦线 + 面包板 | 10~50 mΩ |
| 用了很久、孔松了的面包板 | 200 mΩ ~ 2 Ω |
| 鳄鱼夹夹细导线 | 20~100 mΩ |
| 焊接良好的焊点 | < 5 mΩ |

两个触点串起来，1 A 电流下就是 0.02 V 到 2 V。加上表笔线自己那点电阻，短接读数常在 0.1~0.3 Ω，鳄鱼夹夹细导线也有 20~100 mΩ；0.1 Ω 的接点在 1 A 下就是 0.1 V 压降，足够把 3.3 V 的数字电平判错。面包板上的 3.3 V 系统只跑出 2.8 V、焊好的板子一装进壳就不工作，根子都在这儿。

怎么量接触电阻：用四线法，或者至少做到「两线读数减去短接读数」。更实用的办法是压降法：让 1 A 电流通过，用 mV 档量两点之间的电压，1 mV 就是 1 mΩ。

## 例题

两道题对应这块表最贵的两类错误：烧表（接法错）和测不准（方法错）。数字都不难，难的是把「表内部是什么」想对。

::: tip 例 2 · 电流档错插成并联会怎样 {#ex-dmm-parallel}
题干：手上有一节标称 3 V、内阻约 0.2 Ω 的电池，和一个 5 V 台式电源。有人把万用表拨到电流档（2 A 档，分流电阻 50 mΩ），然后并联接到电池两端（以为在测电压）。求电流；接到 5 V 电源上又会怎样？

<FigBox title="电流档并联 = 用 50 mΩ 短路电源" kind="结构" note="左：正确接法，电流档串联在「电源 → 负载 → 表」回路里，R_sh 与负载同流。右：错误接法，电流档直接跨在电源两端，回路里只剩电源内阻与 R_sh，12 A 的电流远超 2 A 档量程。正确与错误只差「断没断开回路」这一个动作。">

<svg viewBox="0 0 560 220" role="img" aria-label="左图正确串联接法：电池、负载与分流电阻构成一条回路，电流被负载限制；右图错误并联接法：分流电阻直接跨在电源两端，只剩内阻与分流电阻，电流 12 安">
<text x="150" y="18" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">正确：串联进回路</text>
<text x="430" y="18" font-size="11" text-anchor="middle" font-weight="700" fill="var(--vp-c-text-1)">错误：并联在电源上</text>
<g stroke="var(--vp-c-brand-1)" stroke-width="1.8" fill="none">
  <line x1="40" y1="60" x2="140" y2="60" />
  <line x1="180" y1="60" x2="220" y2="60" />
  <line x1="264" y1="60" x2="292" y2="60" />
  <line x1="292" y1="60" x2="292" y2="150" />
  <line x1="40" y1="60" x2="40" y2="90" />
  <line x1="40" y1="98" x2="40" y2="150" />
  <line x1="40" y1="150" x2="292" y2="150" />
</g>
<g stroke="var(--vp-c-text-2)" stroke-width="2">
  <line x1="28" y1="90" x2="52" y2="90" />
  <line x1="34" y1="98" x2="46" y2="98" />
</g>
<rect x="140" y="48" width="40" height="24" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="160" y="42" font-size="10" text-anchor="middle" fill="var(--vp-c-text-3)">负载</text>
<rect x="220" y="46" width="44" height="28" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="242" y="42" font-size="10" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh 50 mΩ</text>
<path d="M 190 60 L 212 60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" fill="none" marker-end="url(#dmm-e1)" />
<text x="58" y="80" font-size="10" fill="var(--vp-c-text-3)">电池 3 V</text>
<text x="58" y="112" font-size="10" fill="var(--vp-c-text-3)">r = 0.2 Ω</text>
<text x="166" y="176" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">回路电阻 = 0.2 + 负载 + 0.05</text>
<text x="166" y="194" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">电流被负载限制，表只是取样</text>
<g stroke="var(--vp-c-brand-1)" stroke-width="1.8" fill="none">
  <line x1="350" y1="60" x2="520" y2="60" />
  <line x1="350" y1="60" x2="350" y2="90" />
  <line x1="350" y1="98" x2="350" y2="150" />
  <line x1="350" y1="150" x2="520" y2="150" />
  <line x1="520" y1="60" x2="520" y2="150" />
  <line x1="460" y1="60" x2="460" y2="84" />
  <line x1="460" y1="128" x2="460" y2="150" />
</g>
<g stroke="var(--vp-c-text-2)" stroke-width="2">
  <line x1="338" y1="90" x2="362" y2="90" />
  <line x1="344" y1="98" x2="356" y2="98" />
</g>
<rect x="446" y="84" width="28" height="44" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="360" y="80" font-size="10" fill="var(--vp-c-text-3)">3 V</text>
<text x="360" y="132" font-size="10" fill="var(--vp-c-text-3)">r = 0.2 Ω</text>
<text x="460" y="170" font-size="10" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh = 50 mΩ</text>
<text x="430" y="192" font-size="10.5" text-anchor="middle" fill="var(--vp-c-brand-1)">I = 3 / 0.25 = 12 A，远超 2 A 量程</text>
<text x="430" y="210" font-size="10.5" text-anchor="middle" fill="var(--vp-c-text-3)">回路里没有负载：只剩内阻 + 分流电阻</text>
<defs>
  <marker id="dmm-e1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
</svg>

</FigBox>

解。

第 1 步：确定回路的全部电阻

并联意味着电流只经过电池和表的分流电阻：$R_{\text{总}} = 0.2 + 0.05 = 0.25\ \Omega$。

第 2 步：算电流

$$I = \frac{3}{0.25} = 12.0\ \text{A}$$

2 A 档的表会被 12 A 直接烧穿（保险丝可能反应不过来），电池瞬间也发热。

第 3 步：换 5 V 电源

台式电源内阻远小于 0.2 Ω，忽略后 $I = 5 / 0.05 = 100\ \text{A}$。电源限流设在 1 A，它会立刻进 CC 模式，表承受的电流被限制在 1 A 左右，保险丝可能不烧；限流设在 5 A 以上，表大概率报废。

第 4 步：正确做法

测电压就拨电压档，表笔并上去；测电流才串进去。每次换功能之前看一眼表笔插在哪个孔。很多表的电流孔与电压孔是两个独立插孔，插错孔再叠上保护电路，花样比你想象的多。

> 为什么这么想：电流档的本质是一根带 50 mΩ 电阻的导线。把它并联到电源两端，等于用这根导线短路电源。真正的保护只有两种：表内部的保险丝，和电源的限流。所以做实验先设好限流，再允许表笔碰电源的任何一端。
:::

::: tip 例 3 · 两线测 0.1 Ω，误差 10% 从哪来 {#ex-dmm-2wire}
题干：用两线欧姆档测一只 0.1 Ω 的采样电阻，表笔与焊盘的接触电阻各 5 mΩ。求读数与相对误差；怎么降到 1% 以下？

解。

第 1 步：两线读数

$$R_{\text{读}} = 0.1 + 2 \times 0.005 = 0.110\ \Omega$$

第 2 步：相对误差

$$\frac{0.110 - 0.100}{0.100} = +10.0\%$$

第 3 步：误差与电阻比的关系

误差是固定的 $2R_w = 10\ \text{m}\Omega$。要让相对误差小于 1%，被测电阻必须大于 $10\ \text{m}\Omega / 0.01 = 1\ \Omega$。0.1 Ω 的电阻用两线法测不准，这是原理问题，不是仪器精度问题。

第 4 步：改进

改用四线法，用 1 A 注入电流：端电压 $U = 0.1 \times 1 = 100.0\ \text{mV}$。接触电阻不流过电压回路，误差只剩表本身的精度（例如 ±0.05% + 3 个字，约 ±0.05 mV），也就是 ±0.05%。

第 5 步：没有四线表

先短接表笔，记下 $R_0 = 0.010\ \Omega$，再测，读数减去 $R_0$。这样能做到 ±1~2 mΩ，对 0.1 Ω 来说是 ±1~2%。

> 为什么这么想：两线法的误差是一个绝对值，不是百分比。$2R_w$ 在 1 kΩ 上可以忽略，在 0.1 Ω 上就是 10%。看电阻档误差之前，先问被测电阻是哪个数量级，再决定要不要上四线。
:::

## 工程实例：一次虚电误判

**虚电**（phantom voltage，不是电源提供的、由容性耦合或电容残压形成的读数）排查有个固定顺序：先怀疑表，再怀疑读数，最后找根因。下面这张图就是那次排查走的路：

<FigBox title="虚电排查流程：换表 → 看趋势 → 并假负载 → 找根因" kind="结构" note="圆角框是步骤，第三个框下面的分叉就是判断点。关键判断：读数随时间衰减就是虚电；读数稳定就是真有电压或真有高阻分压。假负载（100 kΩ~1 MΩ 电阻）是终结争议的那一步。">

<svg viewBox="0 0 560 300" role="img" aria-label="虚电排查流程图：换表复核、看衰减趋势、并假负载、最后定位根因">
<defs>
  <marker id="dmm-fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="215" y="12" width="130" height="34" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="280" y="33" text-anchor="middle">读到可疑电压</text>
  <line x1="280" y1="46" x2="280" y2="64" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#dmm-fl)" />
  <rect x="205" y="64" width="150" height="34" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="280" y="85" text-anchor="middle">换另一只表重测</text>
  <line x1="280" y1="98" x2="280" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#dmm-fl)" />
  <rect x="180" y="116" width="200" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="280" y="133" text-anchor="middle">用示波器看同一节点</text>
  <text x="280" y="149" text-anchor="middle" fill="var(--vp-c-text-3)">它是稳定的直流，还是在缓慢衰减？</text>
  <line x1="180" y1="137" x2="130" y2="137" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <line x1="380" y1="137" x2="430" y2="137" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="128" y="130" text-anchor="end" fill="var(--vp-c-text-3)">缓慢衰减</text>
  <text x="438" y="130" fill="var(--vp-c-text-3)">稳定</text>
  <rect x="24" y="200" width="212" height="42" rx="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="130" y="217" text-anchor="middle" fill="var(--vp-c-brand-1)">虚电：找耦合来源或残压电容</text>
  <text x="130" y="233" text-anchor="middle" fill="var(--vp-c-text-3)">悬空引脚要加上拉 / 下拉再谈电平</text>
  <line x1="130" y1="137" x2="130" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#dmm-fl)" />
  <rect x="324" y="200" width="212" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="430" y="217" text-anchor="middle">并 100 kΩ~1 MΩ 假负载复测</text>
  <text x="430" y="233" text-anchor="middle" fill="var(--vp-c-text-3)">读数掉了 → 虚电；不掉 → 真有分压，查分压链</text>
  <line x1="430" y1="137" x2="430" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#dmm-fl)" />
  <text x="280" y="278" text-anchor="middle" fill="var(--vp-c-text-3)">判定顺序：工具 → 波形 → 负载 → 根因，每一步都有明确结论</text>
</g>
</svg>

</FigBox>

某次调试，一块 3.3 V 的 MCU 板子，上电后一个 GPIO 输入脚用万用表读到 1.5 V，程序读到的却是 0。两个结论打架。

排查按四步走：

1. 怀疑万用表。换另一只，读数一样，排除单表故障。
2. 怀疑那 1.5 V 是真的。用示波器（10X 探头，1 MΩ）量同一引脚，看到一条缓慢衰减的 RC 曲线，初始 1.6 V，200 ms 内掉到 0.3 V。悬空输入被耦合进来的虚电。
3. 找根因。该引脚在原理图上是另一个芯片的输出，那颗芯片没上电，引脚处于高阻；板上 10 kΩ 下拉电阻又因焊接不良虚接。万用表 10 MΩ 的输入阻抗跟 10 kΩ 下拉并联，读数就是这个分压结果。
4. 修复。重新焊下拉电阻，读数 0.02 V，程序读到 0。

教训一句话：万用表的 10 MΩ 输入，对一个高阻悬空节点来说是一个很重的负载。悬空引脚的正确测法是并一只下拉电阻再测，或者用示波器看它有没有在漂。

## 常见错误

四类现场错误，按踩坑频率排。每一例都是「现象 → 处理」。

::: tip 错误 1 · 用电阻档测还在电路里的元件
现象：想测某只电阻有没有变值，直接在板上测，读数偏小，以为电阻坏了。

处理：读数偏小是因为它跟周围所有路径并联着。至少拆下一端，或者把读数与旁边的元件对照。测之前先确认两端没有别的元件分流。
:::

::: tip 错误 2 · 电流档测微安级电流
现象：把 μA 档串进 5 V 电路想测 20 μA 的漏电流，结果读到 0，或者电路直接不工作。

处理：μA 档的分流电阻可能有几十到几百欧姆，串进 5 V 电路就把电路状态改了。测漏电流要用专用微电流计，或者用「在旁边并一只已知电阻、测电阻上的电压」这种间接办法。
:::

::: tip 错误 3 · 把悬空引脚读到的电压当真
现象：数字电路的输入脚读到 1.5 V，程序判断为 0，不知道谁对。

处理：悬空引脚是高阻节点，10 MΩ 的表与耦合电容凑成一个读数陷阱。并一只 10 kΩ 或 100 kΩ 到地再测，或者用示波器看它是不是稳定直流。
:::

::: tip 错误 4 · 用蜂鸣档判断连接质量
现象：两块板子之间的地线，蜂鸣档「叫」，一接负载地电位差就到 0.5 V。

处理：蜂鸣档只判「通不通」，不判「好不好」。用电阻档量，或者让 1 A 电流流过，用 mV 档测压降，1 mV 就是 1 mΩ。
:::

## 自检清单

动表之前扫一眼，八条都在前面出现过：

- [ ] 表笔插孔与当前功能对应（电压档在 VΩ 孔，电流档在 A/mA 孔）；
- [ ] 量程比预估高一个档位起步，确认量级后再切；
- [ ] 测电压是并联，测电流是串联，测电阻先断电；
- [ ] 测电阻前表笔短接，读一下零位；
- [ ] 测高阻节点时，想想 10 MΩ 输入会不会把读数拉下来；
- [ ] 测非正弦波形时，确认表是不是真有效值（25% 占空比的方波就能差一半）；
- [ ] 测小于 1 Ω 的电阻，改用四线法或压降法；
- [ ] 读数与手算差一个量级时，先怀疑接线，再怀疑仪器。

## 下一步

- 需要看波形、看上升沿、看纹波：[示波器](oscilloscope.md)
- 把小电阻和采样电阻焊进电路：[焊接与搭电路](soldering.md)
- 布置实验台、设限流、买一台合适的表：[实验台与安全](bench.md)
- 复习欧姆定律与串并联：[公式速查表](../shared/cheatsheet.md)
