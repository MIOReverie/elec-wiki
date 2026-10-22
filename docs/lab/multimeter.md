---
title: 万用表 · 电压电流电阻与通断
description: 数字万用表五个功能的正确接线方式、串并联接错会发生什么、量程与分辨率的差别、真有效值与平均值读数的差异、四线法测小电阻、二极管与三极管的判别，以及虚电、接触电阻这几类最常见的误判。
outline: [2, 3]
---

# 万用表

<Meta time="45 min" level="核心" note="读数错的时候，九成不是表不准，是接法或档位用错了：电压档并联、电流档串联、电阻档断电测，外加一句「先估算再读数」" />

**这一页要解决什么**：万用表面板上 V、A、Ω、二极管四个符号背后是**四种互斥的接线方式**。这一页按「接法 → 原理 → 误差 → 误判」的顺序，讲清每一档该把表笔接到哪、表内部在这一档等效成了什么、读数会往哪个方向偏。读完你应该能：对任意一次测量先说出「该并联还是串联、要不要断电」，并且在读数不对时能分辨原因是档位、接线，还是表本身。

::: tip 读这页之前
- **需要会**：欧姆定律 $U=IR$、串并联与分压（<Prereq id="ohm" />、<Prereq id="series-parallel" />，速查见[公式速查表](../shared/cheatsheet.md)）。
- **这一页用到的符号**：$R_{\text{sh}}$ 是电流档内部的**分流电阻**（shunt，给电流提供一条已知阻值的取样通路），$R_{\text{in}}$ 是电压档的**输入阻抗**（input impedance：表自身呈现给被测电路的等效电阻）；单位 mΩ $=10^{-3}$ Ω、MΩ $=10^{6}$ Ω。全部约定见[符号与约定](../guide/notation.md)。
- **不需要**复数与微积分：这一页的公式只有乘除、开方与百分数。
:::

万用表是实验台上唯一一台**在任何阶段都能安全投入使用**的仪器，也是翻车率最高的一台。原因在于它的四个功能要求四种**互斥的**接线方式，而面板上只印着四个字母：V、A、Ω 与一个二极管符号。把电流档当成电压档并联进电路，轻则读数全错，重则电源直接短路；把电阻档接到带电电路上，读数无意义，还可能烧档。

这一页按「接法 → 原理 → 误差 → 误判」的顺序组织。核心只有一句话：**万用表是一个会改变被测电路的东西，读数永远要打一个折扣去理解。**

## 结论先行

1. **电压档并联，电流档串联，电阻与通断必须断电测。** 这四条不容许商量，插错一次可能烧穿分流电阻。
2. **读数前先估算。** 分压估电压、欧姆定律估电流。实测与估算差一个数量级以上，八成是档位或接线错了，而不是「电路的工作原理很神奇」。
3. **电压档输入阻抗 10 MΩ 是分压器，不是探针。** 测 1 MΩ 以上的高阻节点，表本身就把读数拉低了 10%；测开路线圈或电容两端，会读出一个随时间衰减的「虚电」。
4. **电流档串进去有一个 10 mΩ 到 1 Ω 的分流电阻。** 它会让被测电路的工作点改变，测小电流时尤其明显；测微安级电流绝不能串在 5 V 电路里直接量。
5. **电阻档自己送电流。** 短路表笔读数为接触电阻（好的表笔 0.1~0.3 Ω），测 0.1 Ω 级电阻时必须先减去它；想测得更准就上四线法。
6. **非真有效值表按正弦波标定。** 测 25% 占空比的 12 V 方波，真有效值是 6.0 V，平均值表会显示 3.33 V，差 44.5%。
7. **二极管档不是一个电压表，是一个约 1 mA 的恒流源。** 它测的是「在这个电流下，导通压降是多少」。硅管 0.55~0.70 V，肖特基 0.2~0.4 V，发光二极管 1.5~3.2 V。

## 五个功能怎么接

这一节只回答一个问题：**每一档的表笔该接到哪里、表内部等效成了什么**。四张等效电路图放在每小节开头，先看图再读文字——接法记住了，后面的误差分析才有落点。

<FigBox title="四个功能的接线与内部等效，一张图记住" kind="结构" note="左上：电压档并联，内部是 10 MΩ 输入阻抗。右上：电流档串联断口，内部是毫欧级分流电阻。左下：电阻档断电测，表自己送出电流。右下：二极管档内部是 1 mA 恒流源。每一格里的表笔位置就是你在实物上该接的位置。">

<svg viewBox="0 0 560 400" role="img" aria-label="万用表四个功能的接线方式与内部等效电路：电压档并联、电流档串联、电阻档断电送流、二极管档恒流源">
<defs>
  <marker id="dmm-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="dmm-ar3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">

  <text x="140" y="18" text-anchor="middle" font-weight="700">电压档：并联</text>
  <rect x="10" y="28" width="260" height="160" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <circle cx="50" cy="52" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="50" cy="176" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="36" y="46">+</text><text x="36" y="188">−</text>
  <text x="26" y="56">V</text><text x="26" y="180">COM</text>
  <line x1="57" y1="52" x2="120" y2="52" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="57" y1="176" x2="120" y2="176" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="120" y1="52" x2="120" y2="92" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="120" y1="136" x2="120" y2="176" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="108" y="92" width="24" height="44" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="120" y="110" text-anchor="middle" fill="var(--vp-c-brand-1)">表</text>
  <text x="120" y="126" text-anchor="middle" fill="var(--vp-c-brand-1)">10 MΩ</text>
  <line x1="120" y1="52" x2="220" y2="52" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <line x1="120" y1="176" x2="220" y2="176" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <rect x="208" y="86" width="24" height="56" rx="4" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="220" y="118" text-anchor="middle">R</text>
  <text x="222" y="60" fill="var(--vp-c-text-3)">被测电压</text>
  <text x="222" y="170" fill="var(--vp-c-text-3)">跨在 R 两端</text>
  <text x="140" y="210" text-anchor="middle" fill="var(--vp-c-text-3)">表内只有一个高阻值：它并联进电路分掉一点点电流</text>

  <text x="430" y="18" text-anchor="middle" font-weight="700">电流档：串联</text>
  <rect x="290" y="28" width="260" height="160" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <text x="306" y="46">A</text><text x="306" y="180">COM</text>
  <circle cx="326" cy="52" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="326" cy="176" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="333" y1="52" x2="400" y2="52" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="333" y1="176" x2="400" y2="176" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="400" y1="52" x2="400" y2="70" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="390" y="70" width="20" height="30" rx="3" fill="var(--vp-c-brand-1)" />
  <rect x="390" y="126" width="20" height="30" rx="3" fill="var(--vp-c-brand-1)" />
  <line x1="400" y1="100" x2="400" y2="126" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="416" y="90" fill="var(--vp-c-brand-1)">R_sh</text>
  <text x="416" y="102" fill="var(--vp-c-brand-1)">10 mΩ</text>
  <line x1="400" y1="156" x2="400" y2="176" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="400" y1="176" x2="500" y2="176" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <line x1="500" y1="176" x2="500" y2="52" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <line x1="400" y1="52" x2="500" y2="52" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <rect x="488" y="92" width="24" height="44" rx="4" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="500" y="118" text-anchor="middle">R</text>
  <line x1="410" y1="52" x2="410" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1" marker-end="url(#dmm-ar3)" />
  <text x="440" y="34" fill="var(--vp-c-text-3)">电流必须流过表</text>
  <text x="430" y="210" text-anchor="middle" fill="var(--vp-c-text-3)">断开回路、把表串进断口；R_sh 只是取样，别让它改电路</text>

  <text x="140" y="238" text-anchor="middle" font-weight="700">电阻档：断电测</text>
  <rect x="10" y="248" width="260" height="140" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <text x="26" y="276">Ω</text><text x="26" y="376">COM</text>
  <circle cx="50" cy="282" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="50" cy="372" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="57" y1="282" x2="130" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="57" y1="372" x2="130" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="108" y="296" width="44" height="26" rx="4" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="130" y="314" text-anchor="middle" fill="var(--vp-c-brand-1)">恒压源</text>
  <line x1="130" y1="282" x2="130" y2="296" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="130" y1="322" x2="130" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="220" cy="282" r="5" fill="var(--vp-c-text-2)" />
  <circle cx="220" cy="372" r="5" fill="var(--vp-c-text-2)" />
  <line x1="130" y1="282" x2="215" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="130" y1="372" x2="215" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="220" y="298" width="16" height="58" rx="4" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="228" y="332">R</text>
  <path d="M 190 282 L 190 262" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#dmm-ar)" />
  <text x="196" y="258" fill="var(--vp-c-brand-1)">表送出测试电流</text>
  <text x="140" y="410" text-anchor="middle" fill="var(--vp-c-text-3)">外部必须断电放电，否则外来电压灌进欧姆档</text>

  <text x="430" y="238" text-anchor="middle" font-weight="700">二极管档：1 mA 恒流源</text>
  <rect x="290" y="248" width="260" height="140" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <text x="306" y="276">⏚▸</text><text x="306" y="376">COM</text>
  <circle cx="326" cy="282" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="326" cy="372" r="7" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="333" y1="282" x2="400" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="333" y1="372" x2="400" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="400" cy="327" r="18" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="400" y1="309" x2="400" y2="345" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#dmm-ar)" />
  <text x="400" y="327" text-anchor="middle" fill="var(--vp-c-brand-1)">1 mA</text>
  <line x1="400" y1="282" x2="400" y2="309" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="400" y1="345" x2="400" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <polygon points="460,292 460,362 478,327" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <line x1="478" y1="292" x2="478" y2="362" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <line x1="400" y1="282" x2="460" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="478" y1="282" x2="478" y2="292" stroke="var(--vp-c-brand-1)" stroke-width="0" />
  <line x1="400" y1="372" x2="478" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="478" y1="362" x2="478" y2="372" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="478" y1="282" x2="478" y2="292" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="400" y1="282" x2="478" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="0" />
  <line x1="400" y1="282" x2="460" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="460" y1="282" x2="460" y2="292" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="460" y1="292" x2="460" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="0" />
  <line x1="478" y1="282" x2="460" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="0" />
  <line x1="460" y1="282" x2="478" y2="282" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="468" y="386" text-anchor="middle">二极管</text>
  <text x="430" y="410" text-anchor="middle" fill="var(--vp-c-text-3)">读数是「1 mA 下的导通压降」，不是电阻，也不是电压</text>
</g>
</svg>

</FigBox>

### 电压档：并联，但并联点要选对

测 $U_{ab}$ 就是测 $a$ 点与 $b$ 点之间的电位差：红笔接 $a$，黑笔接 $b$，表在外部**并联**在 $a$、$b$ 之间——对应上图左上那一格。数字表的读数带符号，读数为负说明实际极性与表笔相反，红笔所在点电位更低。

选购时唯一值得看的规格是**输入阻抗**（input impedance：表自身呈现给被测电路的等效电阻），常见 10 MΩ。它意味着两点之间的等效电路里，除了被测元件，还并联了一个 10 MΩ 的电阻：

$$U_{\text{读数}} = U_{\text{真实}} \cdot \frac{R_{\text{被测}}}{R_{\text{被测}} + 10\,\text{M}\Omega}$$

测 100 kΩ 上的电压，读数低 1%；测 1 MΩ，低 9%；测 10 MΩ，直接少一半。所以**在高阻节点上，万用表的读数只能当「有没有」用，不能当「是多少」用**，要用示波器（10X 探头 10 MΩ，也是分压器，但至少你知道它）或专用高压探头、甚至静电计。

### 电流档：串联，而且分流电阻会改电路

测电流必须让电流**流过表**：断开电路的一段，把表的两根表笔串在断口两端，构成「电源 → 负载 → 表 → 回电源」的一条回路。表内部是一个**分流电阻**（shunt：给被测电流提供一条已知阻值的取样通路，表测它两端的压降换算出电流）$R_{\text{sh}}$ 取样，量程越小，$R_{\text{sh}}$ 越大：

<FigBox title="电流档的取样原理与三档分流电阻" kind="结构" note="左：电流档的本质是一个毫欧级电阻加一个毫伏表，测出的压降除以阻值就是电流。右：量程越小、R_sh 越大，串进 10 Ω 电路后压降占比就越高——μA 档的 100 Ω 已经能完全改变电路的工作点。">

<svg viewBox="0 0 560 200" role="img" aria-label="左：分流电阻与毫伏表等效；右：三个量程的分流电阻值与串入 10 欧电路的压降对比">
<defs>
  <marker id="dmm-sh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="120" y="18" text-anchor="middle" font-weight="700">电流档内部：R_sh + 毫伏表</text>
  <line x1="30" y1="60" x2="90" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="90" y="44" width="60" height="32" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="120" y="64" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh</text>
  <line x1="150" y1="60" x2="210" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <circle cx="180" cy="60" r="3" fill="var(--vp-c-brand-1)" />
  <text x="180" y="94" text-anchor="middle" fill="var(--vp-c-text-3)">mV 表并联在 R_sh 两端</text>
  <path d="M 120 76 L 120 60" stroke="var(--vp-c-text-3)" stroke-width="1" />
  <path d="M 60 60 L 60 26 L 180 26 L 180 56" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" marker-end="url(#dmm-sh)" />
  <path d="M 180 64 L 180 104 L 60 104 L 60 60" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" marker-end="url(#dmm-sh)" />
  <text x="120" y="130" text-anchor="middle" fill="var(--vp-c-text-3)">I = U_sh / R_sh：表测的是压降，换算成电流</text>
  <text x="120" y="152" text-anchor="middle" fill="var(--vp-c-text-3)">量程越小 → R_sh 越大 → 串入电路的「额外电阻」越大</text>

  <text x="420" y="18" text-anchor="middle" font-weight="700">三档对比（串入 10 Ω 负载）</text>
  <line x1="300" y1="140" x2="540" y2="140" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="300" y="156" fill="var(--vp-c-text-3)">量程</text>
  <text x="380" y="156" text-anchor="middle" fill="var(--vp-c-text-3)">R_sh</text>
  <text x="480" y="156" text-anchor="middle" fill="var(--vp-c-text-3)">附加压降</text>
  <text x="300" y="52">200 mA</text>
  <text x="380" y="52" text-anchor="middle">0.1~1 Ω</text>
  <text x="480" y="52" text-anchor="middle">10~100 mV</text>
  <line x1="300" y1="62" x2="540" y2="62" stroke="var(--vp-c-divider)" stroke-width="0.6" />
  <text x="300" y="82">2~10 A</text>
  <text x="380" y="82" text-anchor="middle">10 mΩ</text>
  <text x="480" y="82" text-anchor="middle">5 mV @ 500 mA</text>
  <line x1="300" y1="92" x2="540" y2="92" stroke="var(--vp-c-divider)" stroke-width="0.6" />
  <text x="300" y="112">μA 档</text>
  <text x="380" y="112" text-anchor="middle">≥100 Ω</text>
  <text x="480" y="112" text-anchor="middle" fill="var(--vp-c-brand-1)">不适用</text>
  <line x1="300" y1="122" x2="540" y2="122" stroke="var(--vp-c-divider)" stroke-width="0.6" />
  <text x="420" y="176" text-anchor="middle" fill="var(--vp-c-text-3)">被测电路阻值与 R_sh 同量级时，表本身就是电路的一部分</text>
</g>
</svg>

</FigBox>

| 量程 | 分流电阻典型值 | 串入 10 Ω 负载时的附加压降 |
| --- | --- | --- |
| 200 mA | 0.1 Ω ~ 1 Ω | 10~100 mV |
| 2 A ~ 10 A | 10 mΩ | 5 mV（500 mA 时） |
| μA 档（部分表） | 100 Ω 以上 | 完全不适用 |

5 V 电源经 10 Ω 负载，真实电流 0.500 A；串入 10 mΩ 的分流电阻后，电流变成

$$I' = \frac{5}{10 + 0.01} = 0.4995\ \text{A}$$

误差只有 −0.1%，在电流档里算「好表」。但是如果被测电路的阻抗和分流电阻同量级（比如测一个 10 mΩ 采样电阻上的电流，或者测 4~20 mA 回路里的电流），这个 0.1%~10% 的改变就不能忽略了。

更危险的是**串错位置**：把电流档当成电压表并联到电源两端，相当于用 10 mΩ 的导线把电源短路，理论电流 $5 / 0.01 = 500\ \text{A}$（实际上受电源内阻与表保险丝限制）。好的万用表在 mA 档上都有保险丝，但**保险丝熔断的那一瞬间，你的表已经变成了一段导线**。

### 电阻档：只能断电测

欧姆档的原理是在两端施加一个已知电压，测流过被测对象的电流。所以：

- 被测对象**必须断电**，且电容要放电，否则外部电压会灌进欧姆档，读数无意义，严重时烧档；
- 被测对象最好**从电路上摘下来或至少断开一端**，否则测到的是「这个元件与周围所有路径的并联」；
- 表笔短接会有一个非零读数（表笔线电阻 + 接触电阻，通常 0.1~0.3 Ω），测小电阻时要先记下来再减去。

拿两个 10 kΩ 电阻验证并联：如果两个电阻都焊在板上没拆，欧姆档读出的就是它们的并联值 5 kΩ，可能让你误以为「板上有一个 5 kΩ 的元件」，也可能让你错误地判断某个电阻「变值了」。

### 通断档：一根会叫的电阻档

通断档（蜂鸣档）本质上是电阻档，只是当电阻低于阈值（通常 30~50 Ω）时蜂鸣。它的用途只有一个：**快速找线**，查杜邦线断没断、查焊点连没连、查地线通不通。

它给出的结论是「通」或「不通」两个状态，**不能拿它判断阻值大小**。一个 40 Ω 的虚接焊点会叫，一个 0.5 Ω 的正常导线也会叫。要判断连接质量，用电阻档。

### 二极管与三极管档

二极管档内置一个约 1 mA 的恒流源（部分表用 2 mA 或按量程切换），并测量两个表笔之间的电压。正向测硅二极管读 0.55~0.70 V，反向读 OL（溢出/断路）。这个读数**随电流变化**：同一个 1N4148，1 mA 时约 0.60 V，10 mA 时约 0.68 V。所以别人说「0.6 V」是不严谨的，要说「哪个电流下」。

三极管档（hFE 档）是把管子插进表面的插孔，由一个小的基极电流测集电极电流，直接读出 $\beta$。这是**特定工作点下的 β**（通常 $I_C \approx 1\ \text{mA}$），别拿它去推算大电流下的放大倍数，同一只 2N3904，1 mA 时 β 可能 200，50 mA 时可能只有 50。

## 量程与分辨率：为什么多显示一位就贵好几倍

这一节回答买表时最容易被参数表骗到的问题：**位数与精度到底哪个重要**。看完你应该能从一串规格（3½ 位、±(0.05% + 3)）里算出一次测量的真实不确定度。

万用表的规格通常写成「3½ 位」「4½ 位」，意思是最高位能显示 0~9 的一位数**较少**（半位），能显示 0 或 1（或 0~3）的是半位。

- **3½ 位**（入门表，如 1999 计数）：在 2 V 量程上最高显示 1.999 V，分辨率 1 mV；
- **4½ 位**（20000 计数）：在 2 V 量程上最高显示 1.9999 V，分辨率 0.1 mV；
- **5½ 位、6½ 位**（台式表）：分辨率到 1 μV，用于校准与精密分析。

分辨率不等于精度。一块 4½ 位表的精度可能写着「±(0.05% + 3)」，即读数的 0.05% 加最后三位数的 3 个字。测量值 1.0000 V 时，真实值在

$$1.0000 \pm (0.0005 + 0.003) = 1.0000 \pm 0.0035\ \text{V}$$

范围内，**3.5 mV 的不确定度**。所以你需要的不是「更多位数」，而是先看精度那一行。

**自动量程 vs 手动量程**：自动量程会来回跳，读数稳定的前提下更省心；手动量程在你知道大约多少的时候更快，而且不会因为量程切换瞬间的过压而损坏。测未知电压时，**先用手动最高档测一次**，确认量级后再切到自动或合适档位。

## 真有效值与平均值：正弦以外的波形都会骗人

这一节只解释一件让无数人误判的事：**为什么同一块表，量市电很准、量 PWM 就错一半**。关键在「平均值响应」这四个字——看完你会知道手里的表对哪些波形值得信任。

有效值（RMS，root mean square：一周期内均方根，热效应等效的直流值）的定义是「做功能力等效的直流值」：

$$U_{\text{rms}} = \sqrt{\frac{1}{T}\int_0^T u^2(t)\,dt}$$

对于**纯正弦波**，$U_{\text{rms}} = U_p / \sqrt{2} = 0.707\,U_p$，且波形因数为 $U_{\text{rms}} / U_{\text{avg,rect}} = 1.111$。低价万用表（非真有效值，叫「平均值响应、有效值标定」）就是按这个 1.111 系数去标定的：它测的是整流后的平均值，再乘 1.111 显示出来。

对正弦波，这个换算是精确的。对**任何非正弦**波形，误差取决于波形因数偏离 1.111 多少。

**两种表的区别**：

- **真有效值表**（true-RMS）：内部直接按 $U_{\text{rms}} = \sqrt{\frac{1}{T}\int_0^T u^2(t)\,dt}$ 计算，对任何波形都给出真实的热效应等效值；
- **平均值响应表**（average-responding）：先整流取平均，再乘 1.111 显示——这个系数只对正弦波正确。

波形被开关电路「削」过之后，这个 1.111 就不再成立。下面用一幅图把三种典型波形的真有效值与平均表读数摆在一起：

<FigBox title="平均值表只在正弦波上是对的" kind="结构" note="三种波形幅值同为 12 V：正弦波两种表读数一致；25% 占空比方波的真有效值是 6.0 V，平均表只显示 3.33 V，偏低 44.5%；削顶正弦介于两者之间。凡是 PWM、相控调光、开关电源输出，都必须用真有效值表。">

<svg viewBox="0 0 560 240" role="img" aria-label="三种波形的平均表读数与真有效值对比：正弦一致，方波差 44.5%，削顶正弦介于两者之间">
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="120" y="18" text-anchor="middle" font-weight="700">正弦：两者都准</text>
  <line x1="20" y1="70" x2="220" y2="70" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="20,70 27.5,46 35,26 42.5,14 50,10 57.5,14 65,26 72.5,46 80,70 87.5,94 95,114 102.5,126 110,130 117.5,126 125,114 132.5,94 140,70 147.5,46 155,26 162.5,14 170,10 177.5,14 185,26 192.5,46 200,70 207.5,94 215,114" />
  <text x="120" y="92" text-anchor="middle" fill="var(--vp-c-text-3)">真有效值 8.49 V</text>
  <text x="120" y="106" text-anchor="middle" fill="var(--vp-c-text-3)">平均表 8.49 V 通过</text>

  <text x="420" y="18" text-anchor="middle" font-weight="700">25% 方波：平均表错 44.5%</text>
  <line x1="320" y1="70" x2="520" y2="70" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="320,70 320,10 350,10 350,70 395,70 395,10 425,10 425,70 470,70 470,10 500,10 500,70" />
  <line x1="320" y1="34.6" x2="520" y2="34.6" stroke="var(--vp-c-text-2)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="524" y="38" fill="var(--vp-c-text-2)">真 6.0 V</text>
  <line x1="320" y1="57.3" x2="520" y2="57.3" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="2 3" />
  <text x="524" y="61" fill="var(--vp-c-text-3)">平均表 3.33 V</text>
  <text x="420" y="92" text-anchor="middle" fill="var(--vp-c-text-3)">虚线高度差就是 44.5% 的读数误差</text>

  <text x="120" y="140" text-anchor="middle" font-weight="700">削顶正弦：介于两者之间</text>
  <line x1="20" y1="192" x2="220" y2="192" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" points="20,192 27.5,168 35,148 42.5,136 50,132 57.5,132 65,132 72.5,136 80,148 87.5,168 95,192 102.5,216 110,236 117.5,248 125,252 132.5,248 140,236 147.5,216 155,192 162.5,168 170,148 177.5,136 185,132 192.5,132 200,136 207.5,148 215,168" />
  <text x="120" y="214" text-anchor="middle" fill="var(--vp-c-text-3)">相控调光、整流削波的常见形状</text>
  <text x="120" y="228" text-anchor="middle" fill="var(--vp-c-text-3)">两种表读数开始分叉，差距取决于削掉多少</text>

  <text x="420" y="140" text-anchor="middle" font-weight="700">结论</text>
  <text x="420" y="164" text-anchor="middle" fill="var(--vp-c-text-2)">正弦波：平均表可用</text>
  <text x="420" y="184" text-anchor="middle" fill="var(--vp-c-text-2)">任何开关波形：必须真有效值</text>
  <text x="420" y="204" text-anchor="middle" fill="var(--vp-c-text-3)">测 PWM、可控硅调压、开关电源、LED 驱动时</text>
  <text x="420" y="220" text-anchor="middle" fill="var(--vp-c-text-3)">先确认表上有没有 true-RMS 标志</text>
</g>
</svg>

</FigBox>

### 算一遍：25% 占空比的方波

一个 12 V 幅值、占空比 25% 的单极性方波（低电平为 0）：

$$U_{\text{rms}} = \sqrt{0.25 \times 12^2 + 0.75 \times 0^2} = \sqrt{36} = 6.000\ \text{V}$$

$$U_{\text{avg}} = 0.25 \times 12 = 3.000\ \text{V}$$

平均值响应的表会显示 $1.111 \times 3.000 = 3.332\ \text{V}$，**相对真有效值偏低**

$$\frac{3.332 - 6.000}{6.000} = -44.5\%$$

差了将近一半。这在测 PWM 调光、可控硅调压、开关电源输出、LED 驱动时天天发生。

### 再看正弦波：平均表是准的

220 V 有效值的市电正弦，峰值与整流平均值分别是

$$U_p = 220 \times \sqrt{2} = 311.1\ \text{V}, \quad U_{\text{avg}} = 0.6366 \times 311.1 = 198.1\ \text{V}$$

$$1.111 \times 198.1 = 220.0\ \text{V}$$

这就解释了为什么「平均表也能量市电」，因为市电是正弦。但一旦市电接到了有相控调光器的电路上，波形被削掉一块，平均表就再也不准了。

::: tip 例 1 · 用真有效值补算占空比 {#ex-dmm-rms}
**题干**：一台真有效值万用表在一个 12 V 幅值、低电平为 0 的 PWM 输出上读到有效值 7.0 V。求这路 PWM 的占空比；如果换成平均响应的表，会读多少？

**解**

**第 1 步：由有效值反推占空比**

对幅值为 $V_p$、占空比为 $D$ 的单极性方波，$U_{\text{rms}} = V_p\sqrt{D}$。代入：

$$D = \left(\frac{7.0}{12}\right)^2 = \frac{49}{144} = 0.3403 \approx 34.0\%$$

**第 2 步：算平均响应表的读数**

平均值 $= 0.3403 \times 12 = 4.083\ \text{V}$，平均表显示 $1.111 \times 4.083 = 4.537 \approx 4.54\ \text{V}$。

**第 3 步：验算一致性**

用刚才的 25% 例子反查：$D = (3.332/1.111)/12 = 0.25$，与已知结果吻合，说明这个反推方法是对的。

> **为什么这么想**
> 真有效值表本身就是按 $\sqrt{\frac{1}{T}\int u^2 dt}$ 算的，对单极性方波它才保有 $V_p\sqrt{D}$ 这个干净的关系。一旦波形不是方波（比如是经过 RC 滤波的、有上升下降沿的），这个式子就不再成立，必须回到定义式或直接用示波器测占空比。
:::

## 四线法：测 0.1 Ω 为什么两线不行

这一节处理电阻档最后一个盲区：**被测电阻小到和表笔接触电阻同量级时，读数怎么救**。答案是让电流回路与电压回路分开走，也就是四线法。

万用表的电阻档是**两线制**：激励电流与测量电压共用两根表笔。这就把表笔线、插头、焊点、接触电阻全部算进了读数。

### 算一遍：10 mΩ 采样电阻

电流检测常用 10 mΩ 的采样电阻（比如电源芯片的 $I_{\text{sense}}$ 电阻）。假设四线焊盘本身没问题，但你的表笔与焊盘之间的接触电阻各有 10 mΩ，加起来 20 mΩ：

$$R_{\text{读数}} = 0.010 + 0.020 = 0.030\ \Omega, \quad \text{误差} = \frac{0.030 - 0.010}{0.010} = +200\%$$

**读数是真实值的三倍。** 这不是表不准，是测量方法本身把「接触电阻」加进去了。

### 四线法怎么接

四线法（开尔文接法）用两对表笔：一对**注入电流**（Force，激励端：给被测电阻提供已知测试电流），另一对**测量电压**（Sense，取样端：只取电压、几乎不取电流）。电流路径与电压路径只在被测电阻的内部汇合，两条电压表笔上几乎不取电流（因此表笔电阻不产生压降）：

$$R = \frac{U_{\text{sense}}}{I_{\text{force}}}$$

<FigBox title="两线与四线：接触电阻藏在了哪条回路里" kind="结构" note="左：两线法里接触电阻与被测电阻串联在同一条路上，读数 = R + 2R_c，小电阻时误差被放大。右：四线法里电流沿外侧回路流，电压取样点在电阻根部内侧——接触电阻上的压降不进入电压表读数，误差只剩表自身精度。">

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

现在的代价是激励电流。若用 1 mA 去测 10 mΩ，端电压只有

$$U = 0.010 \times 10^{-3} = 10\ \mu\text{V}$$

普通 4½ 位表在 200 mV 档的分辨率是 10 μV，读到的只是 1 个字。所以四线测量通常配合 **1 A 恒定电流**：

$$U = 0.010 \times 1 = 10.0\ \text{mV}$$

这时 200 mV 档读到 $10.00\ \text{mV}$，换算 10.00 mΩ，分辨率已经足够。台式四线微欧计就是这么做的：一次注入 1 A 或 10 A，测几十 μV 到几 mV 的端电压。

没有四线表怎么办？两个替代做法：一是**两线测量后手动减去短接读数**（先短接表笔记下 $R_0$，再测，用 $R_{\text{测}} - R_0$）；二是**乘一个已知系数**：把 10 mΩ 电阻与 1 Ω 电阻串联，测总电阻再反推。两者在小电阻上都只能做到 ±若干 mΩ 的精度。

## 测二极管与三极管

### 二极管：三个读数定生死

用二极管档，把管子从电路上拔下来（或至少断开一端），测三次：

| 测法 | 硅二极管正常读数 | 异常读数与含义 |
| --- | --- | --- |
| 红笔接阳极、黑笔接阴极 | 0.55~0.70 V | OL：开路；0.0 V：短路 |
| 黑笔接阳极、红笔接阴极 | OL | 有读数：漏电或反向击穿 |
| 用电阻档测反向 | 高阻/OL | 几十 kΩ 以下：漏电 |

**为什么红笔要接阳极**：二极管档的红笔是正电位输出，黑笔是回流端。红笔接阳极才是正偏。这一点和「红笔是正极」的直觉一致，但和后面三极管的判别方法不同，别混。

### 三极管：两个 PN 结，红笔和黑笔的位置有讲究

NPN 管有两个背靠背的 PN 结：B→E 与 B→C。用二极管档以**基极为基准**测六次：

| 测法（NPN） | 读数 | 用红/黑笔顺序描述 |
| --- | --- | --- |
| 红 B、黑 E | 0.6~0.7 V（或 0.2~0.3 V，锗） | 正向 B-E 结 |
| 红 B、黑 C | 0.5~0.65 V（略小于 B-E） | 正向 B-C 结 |
| 红 E、黑 B | OL | 反向 |
| 红 C、黑 B | OL | 反向 |
| E 与 C 之间任意方向 | OL | 正常情况下有两个结阻断 |

对 PNP 管，把红黑笔对调：黑笔接 B，红笔依次接 E、C，两个正向读数相同，其余 OL。

**判别 NPN 还是 PNP 的快速方法**：找到那个「红笔一接上去，另外两脚都有读数」的脚，那是 NPN 的基极；如果「黑笔一接上去，另外两脚都有读数」，是 PNP 的基极。

### 三个结论怎么用

用二极管档只能判断「结还在不在」。要看管子有没有放大能力，还得测 hFE 或接一个 $I_B$ 已知的电路：

$$\beta = \frac{I_C}{I_B}$$

## 常见误判：虚电与接触电阻

这一节把两类「表没坏、电路没坏、读数却把人带沟里」的情形单独拎出来：**虚电**（读到一个不存在的电压）与**接触电阻**（一个真实存在却被忽略的电阻）。两者的共同点是都能用一个小动作验证。

### 虚电

把万用表接到一个开路的电感、长导线、或者已经断电但电容没放完的节点上，读数会显示「有一个电压」。电压的真实来源可能是：

- **容性耦合**：附近的交流导线通过几十 pF 的分布电容耦合过来，高阻表把它看成「电压」；
- **电容残压**：大电容放完电后，表笔一碰就充电，读数瞬间是满的，慢慢下降；
- **电池与触点氧化**：断开的开关两端可能因为氧化层而保持一个微小电压（几十 mV）。

**识别方法**：在表笔两端并一个 100 kΩ 到 1 MΩ 的电阻（「假负载」）。真电压不会掉，虚电压会立刻掉到接近 0。**在数字电路里，一个显示 1.5 V 的「悬空输入」比显示 0 V 更危险**，它可能只是虚电，接上负载就掉。

### 接触电阻

面包板的弹簧片、杜邦线的插针、鳄鱼夹的齿，每个接点都有接触电阻。它的典型范围：

| 接法 | 典型接触电阻 |
| --- | --- |
| 插拔良好的杜邦线 + 面包板 | 10~50 mΩ |
| 用了很久、孔松了的面包板 | 200 mΩ ~ 2 Ω |
| 鳄鱼夹夹细导线 | 20~100 mΩ |
| 焊接良好的焊点 | < 5 mΩ |

两个触点串起来，1 A 电流下就是 0.02 V 到 2 V。这就是「面包板上的 3.3 V 系统只跑出 2.8 V」和「焊好的板子工作，一装进壳就不工作」的根源。

**测量接触电阻的方法**：用四线法或至少「两线减去短接读数」。更实用的方法是**压降法**：让 1 A 电流通过，用万用表 mV 档测量两点之间的电压，1 mV 就是 1 mΩ。

到这里，本页的测量方法已经讲完：接法（并联 / 串联 / 断电）、原理（分压器 / 分流电阻 / 恒流源）、误差（输入阻抗、波形因数、接触电阻）、误判（虚电）。接下来两道例题把这些动作串成完整的解题过程。

## 例题

这一节两道题对应本页两种最贵的错误：**烧表**（接法错）与**测不准**（方法错）。第一题算电流档插错孔的短路电流，第二题算两线法测小电阻的误差——数字都不难，难的是把「表内部是什么」想对。

::: tip 例 2 · 电流档错插成并联会怎样 {#ex-dmm-parallel}
**题干**：你手上有一节标称 3 V、内阻约 0.2 Ω 的电池，和一个 5 V 台式电源。有人把万用表拨到电流档（2 A 档，分流电阻 50 mΩ），然后**并联**接到电池两端（以为在测电压）。求电流；如果接到 5 V 电源上又会怎样？

<FigBox title="电流档并联 = 用 50 mΩ 短路电源" kind="结构" note="左：正确接法，电流档串联在「电源 → 负载 → 表」回路里，R_sh 与负载同流。右：错误接法，电流档直接跨在电源两端，回路里只剩电源内阻与 R_sh，12 A 的电流远超 2 A 档量程。正确与错误只差「断没断开回路」这一个动作。">

<svg viewBox="0 0 560 220" role="img" aria-label="左图正确串联接法电流经过负载与分流电阻，右图错误并联接法只剩内阻与分流电阻构成 12 安短路回路">
<defs>
  <marker id="dmm-e1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="130" y="18" text-anchor="middle" font-weight="700">正确：串联进回路</text>
  <line x1="40" y1="60" x2="80" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="40" y="44" width="10" height="32" rx="2" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="45" y="90" text-anchor="middle" fill="var(--vp-c-text-3)">电池 3 V</text>
  <text x="45" y="104" text-anchor="middle" fill="var(--vp-c-text-3)">r = 0.2 Ω</text>
  <line x1="80" y1="60" x2="140" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="140" y="48" width="40" height="24" rx="4" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="160" y="44" text-anchor="middle" fill="var(--vp-c-text-3)">负载</text>
  <line x1="180" y1="60" x2="220" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="220" y="46" width="44" height="28" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="242" y="64" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh</text>
  <text x="242" y="92" text-anchor="middle" fill="var(--vp-c-brand-1)">50 mΩ</text>
  <line x1="264" y1="60" x2="292" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="40" y1="60" x2="40" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="292" y1="60" x2="292" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="40" y1="150" x2="292" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="166" y="130" text-anchor="middle" fill="var(--vp-c-text-3)">回路电阻 = 0.2 + 负载 + 0.05</text>
  <text x="166" y="146" text-anchor="middle" fill="var(--vp-c-text-3)">电流被负载限制，表只是取样</text>

  <text x="440" y="18" text-anchor="middle" font-weight="700">错误：并联在电源上</text>
  <rect x="380" y="70" width="10" height="32" rx="2" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="385" y="120" text-anchor="middle" fill="var(--vp-c-text-3)">3 V</text>
  <text x="385" y="134" text-anchor="middle" fill="var(--vp-c-text-3)">r = 0.2 Ω</text>
  <line x1="390" y1="78" x2="440" y2="78" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="390" y1="94" x2="440" y2="94" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <rect x="440" y="70" width="44" height="32" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="462" y="90" text-anchor="middle" fill="var(--vp-c-brand-1)">R_sh</text>
  <line x1="484" y1="78" x2="510" y2="78" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="484" y1="94" x2="510" y2="94" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="510" y1="78" x2="510" y2="94" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="475" y="134" text-anchor="middle" fill="var(--vp-c-brand-1)">I = 3 / 0.25 = 12 A</text>
  <path d="M 445 70 L 445 40 L 480 40" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#dmm-e1)" />
  <text x="516" y="44" fill="var(--vp-c-brand-1)">远超 2 A 量程</text>
  <text x="445" y="158" text-anchor="middle" fill="var(--vp-c-text-3)">回路里没有负载：只剩内阻 + 分流电阻</text>
  <text x="445" y="174" text-anchor="middle" fill="var(--vp-c-brand-1)">换 5 V 电源：I = 5 / 0.05 = 100 A（受限流保护）</text>
</g>
</svg>

</FigBox>

**解**

**第 1 步：确定回路的全部电阻**

并联意味着电流只经过电池和表的分流电阻：$R_{\text{总}} = 0.2 + 0.05 = 0.25\ \Omega$。

**第 2 步：算电流**

$$I = \frac{3}{0.25} = 12.0\ \text{A}$$

2 A 档的表会被 12 A 直接烧穿（保险丝可能反应不过来）；电池瞬间也会发热。

**第 3 步：换 5 V 电源**

台式电源内阻远小于 0.2 Ω，忽略后 $I = 5 / 0.05 = 100\ \text{A}$。如果电源限流设在 1 A，它会立刻进入 CC 模式，表承受的电流被限制在 1 A 左右，保险丝可能不烧；但如果限流设的是 5 A 以上，表大概率报废。

**第 4 步：正确做法**

测电压就拨电压档，表笔并上去；测电流才串进去。**养成习惯：每次换功能之前先看一眼表笔插在哪个孔**，很多表的电流孔与电压孔是两个独立的插孔，插错孔和保护电路的组合比你想象得多。

> **为什么这么想**
> 电流档的本质是「一根带 50 mΩ 电阻的导线」。把它并联到电源两端，等于用这根导线短路电源。真正的保护只有两种：表内部的保险丝，和电源的限流。所以做实验时**永远先把限流设好**，再允许表笔接触电源的任何一端。
:::

::: tip 例 3 · 两线测 0.1 Ω，误差 10% 从哪来 {#ex-dmm-2wire}
**题干**：用两线欧姆档测一只 0.1 Ω 的采样电阻。表笔与焊盘的接触电阻各 5 mΩ。求读数与相对误差；如何降低到 1% 以下？

**解**

**第 1 步：两线读数**

$$R_{\text{读}} = 0.1 + 2 \times 0.005 = 0.110\ \Omega$$

**第 2 步：相对误差**

$$\frac{0.110 - 0.100}{0.100} = +10.0\%$$

**第 3 步：误差与电阻比的关系**

误差是固定的 $2R_w = 10\ \text{m}\Omega$。要让相对误差小于 1%，被测电阻必须大于 $10\ \text{m}\Omega / 0.01 = 1\ \Omega$。0.1 Ω 的电阻用两线法测不准，这是原理问题，不是仪器精度问题。

**第 4 步：改进**

改用四线法，用 1 A 注入电流：端电压 $U = 0.1 \times 1 = 100.0\ \text{mV}$。表笔接触电阻不流过电压回路，误差只剩表本身的精度（例如 ±0.05% + 3 个字，约 ±0.05 mV），也就是 ±0.05%。

**第 5 步：没有四线表**

先短接表笔，记下 $R_0 = 0.010\ \Omega$，再测，读数减去 $R_0$。这种方法可以做到 ±1~2 mΩ，对 0.1 Ω 来说是 ±1~2%。

> **为什么这么想**
> 记住「两线法的误差是一个绝对值，不是百分比」：$2R_w$ 在 1 kΩ 上可以忽略，在 0.1 Ω 上就是 10%。所以看电阻档误差时，先问被测电阻是多少数量级，再决定要不要上四线。
:::

## 工程实例：一次「虚电」误判现场

**虚电**（phantom voltage：不是真实电源提供的、由容性耦合或电容残压形成的读数）的排查有一个固定顺序：先怀疑表，再怀疑读数，最后找根因。下面的流程图就是这次排查的路径：

<FigBox title="虚电排查流程：换表 → 看趋势 → 并假负载 → 找根因" kind="结构" note="菱形是判断，圆角框是动作。关键判断是第 2 步：读数随时间衰减 → 虚电；读数稳定 → 真有电压或真有高阻分压。假负载（100 kΩ~1 MΩ 电阻）是终结争议的那一步。">

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
  <line x1="380" y1="137" x2="440" y2="137" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="128" y="130" text-anchor="end" fill="var(--vp-c-text-3)">缓慢衰减</text>
  <text x="444" y="130" fill="var(--vp-c-text-3)">稳定</text>
  <rect x="24" y="200" width="212" height="42" rx="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="130" y="217" text-anchor="middle" fill="var(--vp-c-brand-1)">虚电：找耦合来源或残压电容</text>
  <text x="130" y="233" text-anchor="middle" fill="var(--vp-c-text-3)">悬空引脚要加上拉 / 下拉再谈电平</text>
  <line x1="130" y1="158" x2="130" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#dmm-fl)" />
  <rect x="324" y="200" width="212" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="430" y="217" text-anchor="middle">并 100 kΩ~1 MΩ 假负载复测</text>
  <text x="430" y="233" text-anchor="middle" fill="var(--vp-c-text-3)">读数掉了 → 虚电；不掉 → 真有分压，查分压链</text>
  <line x1="430" y1="158" x2="430" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1.2" marker-end="url(#dmm-fl)" />
  <text x="280" y="278" text-anchor="middle" fill="var(--vp-c-text-3)">判定顺序：工具 → 波形 → 负载 → 根因，每一步都有明确结论</text>
</g>
</svg>

</FigBox>

某次调试，一块 3.3 V 的 MCU 板子，上电后一个 GPIO 的输入引脚用万用表读到 1.5 V，程序读到的却是 0。两个测量结论矛盾。

排查路径：

1. **怀疑万用表**：换另一只用同样读数，排除单表故障。
2. **怀疑真的 1.5 V**：用示波器（10X 探头，1 MΩ）测同一引脚，看到的是一个缓慢衰减的 RC 曲线，初始 1.6 V，200 ms 内掉到 0.3 V。**这是悬空输入被耦合进来的虚电。**
3. **找根因**：该引脚在原理图上是另一个芯片的输出，但那个芯片没有上电，引脚处于高阻；PCB 上的 10 kΩ 下拉电阻因焊接不良虚接。**万用表 10 MΩ 的输入阻抗与 10 kΩ 的下拉并联后，读数变成了分压结果。**
4. **修复**：重新焊接下拉电阻，读数为 0.02 V，程序读到 0。

**教训**：万用表的 10 MΩ 输入，对一个高阻悬空节点来说，是一个非常重要的「负载」。悬空引脚的正确测法是**并一个下拉电阻再测**，或者用示波器看它是不是在漂移。

## 常见错误

这一节按踩坑频率列四个现场错误。每一例都是「现象 → 处理」的格式：先认出症状，再按对应的方法自救。

::: tip 错误 1 · 用电阻档测还在电路里的元件
**现象**：想测某个电阻有没有变值，直接在板上测，读数偏小，以为是电阻坏了。

**处理**：读数偏小是因为电阻与周围所有路径并联。至少要拆下一端，或把万用表读数与旁边的元件对照。测量前先确认电阻两端没有其他元件分流。
:::

::: tip 错误 2 · 电流档测微安级电流
**现象**：把一块表的 μA 档串进 5 V 电路想测一个 20 μA 的漏电流，结果读数 0，或者电路直接不工作。

**处理**：μA 档的分流电阻可能有几十到几百欧姆，串进 5 V 电路后，它本身就改变了电路状态。测漏电流应该用专用的微电流计，或者用「在被测对象旁并一个已知电阻测电压」的间接方法。
:::

::: tip 错误 3 · 把引脚悬空时读到的电压当真
**现象**：万用表在数字电路的一个输入脚读到 1.5 V，程序逻辑判断为 0，不知道谁对。

**处理**：悬空引脚是高阻节点，10 MΩ 的表与耦合电容构成一个读数陷阱。并一个 10 kΩ 或 100 kΩ 到地再测，或者用示波器看它是否是稳定的直流。
:::

::: tip 错误 4 · 用蜂鸣档判断连接质量
**现象**：两个板子之间的地线，万用表蜂鸣档「叫」，但一接上负载，地电位差达到 0.5 V。

**处理**：蜂鸣档只判断「通不通」，不判断「好不好」。用电阻档测，或者让 1 A 电流流过，用 mV 档测压降；1 mV 就是 1 mΩ。
:::

## 自检清单

方法学完了，上电之前用这张清单把本页的关键动作过一遍——前三条就是结论先行的前三条。

用到万用表之前，快速过一遍：

- [ ] 表笔插孔与当前功能对应（电压档在 VΩ 孔，电流档在 A/mA 孔）；
- [ ] 量程比预估高一个档位起步，确认量级后再切；
- [ ] 测电压是并联，测电流是串联，测电阻先断电；
- [ ] 测电阻前表笔短接，读一下零位；
- [ ] 测高阻节点时，想想 10 MΩ 输入会不会把读数拉下来；
- [ ] 测非正弦波形时，确认表是否是真有效值；
- [ ] 测小于 1 Ω 的电阻，改用四线法或压降法；
- [ ] 读数与手算差一个量级时，先怀疑接线，再怀疑仪器。

## 下一步

- 需要看波形、看上升沿、看纹波：[示波器](oscilloscope.md)
- 把小电阻和采样电阻焊进电路：[焊接与搭电路](soldering.md)
- 布置实验台、设限流、买一台合适的表：[实验台与安全](bench.md)
- 复习欧姆定律与串并联：[公式速查表](../shared/cheatsheet.md)
