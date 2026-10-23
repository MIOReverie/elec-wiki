---
title: 02 · 基本放大电路
description: 交直流共存的分析套路：静态工作点 Q 的估算、直流通路与交流通路为什么必须分开画、共射电路的 Au/ri/ro 三大动态参数、最大不失真输出与两种失真，以及三种接法的性格对比，配五道带电路图例题。
---

# 02 · 基本放大电路

<Meta time="60 min" level="核心" note="全课最高频的错误是「直流通路与交流通路混用」——电容在直流里开路、在交流里短路，这一句话决定 Q 点与增益算得对不对" />

**这一页要解决什么**：一颗三极管本身不会放大任何一个「信号」——它只把直流电源的能量按 $I_B$ 的比例搬运到集电极。要做放大器，必须先给它一个稳定的直流站位（**静态工作点 Q**：无信号时那组确定的 $I_{CQ}$、$V_{CEQ}$），再把待放大的交流信号叠加上去。读完你应该能对一个分压偏置共射电路完整地算一遍：静态 Q 点、电压增益 $\dot A_u$、输入电阻 $r_i$、输出电阻 $r_o$、最大不失真输出幅度，并说出 Q 点偏高偏低各会造成哪一种失真。

::: tip 读这页之前
- **需要会**：KCL 与 KVL（<Prereq id="kcl" />、<Prereq id="kvl" />）、戴维南等效（<Prereq id="thevenin" />）、三极管在哪个区该怎么判（<Prereq id="bjt-regions" />）。
- **这一页用到的符号**：小写带下标的直流量用双下标，如 $I_{CQ}$（静态集电极电流，Q 是 Quiescent「静止」的缩写）、$V_{CEQ}$；交流量用小写瞬时值 $u_i$、$i_c$，交流有效值相量用 $\dot U_o$、$\dot A_u$；$r_{be}$ 是基极-发射极间的**动态**（交流）电阻；$R_L'=R_C\parallel R_L$ 是交流负载；$g_m$ 是跨导（定义见[上一页](semiconductor.md)第七节）；$\beta$ 是电流放大系数。全部约定见[符号与约定](../guide/notation.md)，首次出现处本页都会就地解释一次。
- **会用到对数与自然常数**：只在解释 $r_{be}$ 与 $g_m$ 来历的一句话里出现，不参与任何例题计算。
- **先接受一条纪律**：这一页的每一步计算都要先问「我现在算的是直流还是交流」。这个提问本身就是本页最重要的方法。
:::

麦克风输出的是几十毫伏的交流电压，喇叭却要十几伏才能推动。中间少了一个环节：**把小信号的「形状」复制放大，而能量由直流电源出**。三极管做的正是这件事——它像一个由 $I_B$ 控制开度的阀门，用小电流控制从电源流向集电极的大电流。

但这里有个陷阱：三极管在放大之前必须先**通上电**。$I_B$ 为零时管子是关死的，负半周的交流信号会让基极电位低于零、管子直接截止。所以真实电路里必须让管子在无信号时就站在一个中间位置（静态工作点），交流信号再围着它上下摆动。这个「先直流站位、再交流放大」的双重性，是这一页的全部内容。

## 结论先行

1. **放大 = 交直流共存**：先算直流（确定 Q 点），再算交流（确定增益）。两套通路分开画——**直流通路电容开路，交流通路电容短路 + 直流源接地**。
2. **Q 点必须设在中部**：偏低截止失真（输出顶部削平），偏高饱和失真（输出底部削平）；分压式偏置靠发射极电阻 $R_E$ 的直流负反馈把它稳住。
3. **共射电路**：电压增益 $\dot A_u=-\beta R_L'/r_{be}$（负号 = 倒相）、输入电阻 kΩ 级、输出电阻 kΩ 级，**电压和电流都能放大**。
4. **共集电极（射极输出器）**：$\dot A_u\approx1$、输入电阻高、输出电阻低，不放大电压，**专治「带不动负载」**。
5. **共基极电路**：输入电阻低到几十 Ω、高频特性好，适合宽频带与高频前端。

::: tip 一句话记住本页的动作顺序
拿到一张放大电路图，**先画两张图**：把电容换成开路得到「直流通路」（求 Q 点），把电容换成短路、直流电源换成接地得到「交流通路」（求增益）。混用这两张图是本课程最高频的错误。后面所有小题都是这两张图的应用。
:::

## 一、先看主角：一张完整的共射放大电路

这一节只做一件事：认识后文反复要用的那张电路图，并把每个元件的角色说清楚。

全章的例题都用同一组分压偏置共射电路：$V_{CC}=12$ V，$R_{b1}=20\ \text{k}\Omega$，$R_{b2}=10\ \text{k}\Omega$，$R_C=2\ \text{k}\Omega$，$R_E=2\ \text{k}\Omega$，$R_L=3\ \text{k}\Omega$，$\beta=60$，信号源内阻 $R_S=1\ \text{k}\Omega$。

<FigBox title="分压偏置共射放大电路：本章的标准电路" kind="电路" note="R_b1、R_b2 分压给基极直流电位，R_E 提供直流负反馈稳住 Q 点并被 C_E 旁路。输入经 C₁ 耦合到基极，输出经 C₂ 耦合到负载 R_L。三个电容正好是「直流 / 交流」的分界线。" >

<svg viewBox="0 0 560 320" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="70" y1="40" x2="352" y2="40"/>
<line x1="30" y1="270" x2="500" y2="270"/>
<line x1="70" y1="40" x2="70" y2="24"/>
<text x="78" y="18" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+V_CC = 12 V</text>
<line x1="60" y1="270" x2="60" y2="284"/>
<line x1="48" y1="284" x2="72" y2="284" stroke-width="1.8"/>
<line x1="52" y1="290" x2="68" y2="290" stroke-width="1.8"/>
<line x1="56" y1="296" x2="64" y2="296" stroke-width="1.8"/>
<circle cx="30" cy="182" r="15"/>
<path d="M 22 182 q 4 -8 8 0 q 4 8 8 0" stroke="var(--vp-c-text-3)" stroke-width="1.3"/>
<line x1="30" y1="167" x2="30" y2="150"/>
<line x1="30" y1="150" x2="90" y2="150"/>
<line x1="30" y1="197" x2="30" y2="270"/>
<text x="52" y="196" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="61" y="205" text-anchor="start" dominant-baseline="middle" font-size="8.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">i</text>
<g transform="translate(110 150)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<text x="110" y="130" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_S = 1 kΩ</text>
<line x1="130" y1="150" x2="196" y2="150"/>
<line x1="196" y1="136" x2="196" y2="164" stroke-width="2.6"/>
<line x1="206" y1="136" x2="206" y2="164" stroke-width="2.6"/>
<text x="201" y="122" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">C</text>
<text x="208" y="130" text-anchor="start" dominant-baseline="middle" font-size="8.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">1</text>
<line x1="206" y1="150" x2="250" y2="150"/>
<line x1="228" y1="40" x2="228" y2="75"/>
<g transform="translate(228 95) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="228" y1="115" x2="228" y2="150"/>
<line x1="228" y1="150" x2="228" y2="190"/>
<g transform="translate(228 210) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="228" y1="230" x2="228" y2="270"/>
<circle cx="228" cy="150" r="4" class="sf-dot"/>
<text x="212" y="95" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_b1 = 20 kΩ</text>
<text x="212" y="210" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_b2 = 10 kΩ</text>
<line x1="250" y1="128" x2="250" y2="172" stroke-width="2.4"/>
<path d="M 250 136 L 292 150 L 250 164" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="292" y1="150" x2="292" y2="116"/>
<line x1="292" y1="150" x2="292" y2="184"/>
<line x1="292" y1="116" x2="292" y2="100"/>
<line x1="292" y1="100" x2="352" y2="100"/>
<line x1="292" y1="184" x2="292" y2="200"/>
<path d="M 286.5 187 L 297.5 187 L 292 198.5 Z" class="sf-solid"/>
<line x1="292" y1="200" x2="380" y2="200"/>
<text x="244" y="120" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">B</text>
<text x="300" y="104" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C</text>
<text x="300" y="197" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">E</text>
<line x1="352" y1="40" x2="352" y2="50"/>
<g transform="translate(352 70) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="352" y1="90" x2="352" y2="100"/>
<circle cx="352" cy="100" r="4" class="sf-dot"/>
<text x="370" y="70" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_C = 2 kΩ</text>
<line x1="352" y1="100" x2="414" y2="100"/>
<line x1="414" y1="86" x2="414" y2="114" stroke-width="2.6"/>
<line x1="426" y1="86" x2="426" y2="114" stroke-width="2.6"/>
<text x="420" y="74" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">C</text>
<text x="427" y="82" text-anchor="start" dominant-baseline="middle" font-size="8.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">2</text>
<line x1="426" y1="100" x2="462" y2="100"/>
<circle cx="462" cy="100" r="4" class="sf-dot"/>
<line x1="462" y1="100" x2="500" y2="100"/>
<text x="508" y="100" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="518" y="109" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<line x1="462" y1="100" x2="462" y2="165"/>
<g transform="translate(462 185) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="462" y1="205" x2="462" y2="270"/>
<text x="480" y="185" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_L = 3 kΩ</text>
<line x1="330" y1="200" x2="330" y2="215"/>
<g transform="translate(330 235) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="330" y1="255" x2="330" y2="270"/>
<text x="314" y="235" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_E = 2 kΩ</text>
<line x1="380" y1="200" x2="380" y2="232"/>
<line x1="370" y1="232" x2="390" y2="232" stroke-width="2.6"/>
<line x1="370" y1="240" x2="390" y2="240" stroke-width="2.6"/>
<line x1="380" y1="240" x2="380" y2="270"/>
<text x="396" y="236" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">C_E（旁路）</text>
<text x="280" y="312" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">C₁、C₂、C_E 三个电容隔直通交——它们正是「直流通路 / 交流通路」的分界线</text>
</svg>

</FigBox>

四个「新」名词要先说清，不然后面的图读不懂：

- **耦合电容**（$C_1$、$C_2$）：把前级的直流电位挡住、只让交流信号通过，叫作 coupling（耦合）。所以静态分析时它是**开路**，动态分析时它是**短路**。
- **旁路电容**（$C_E$）：与 $R_E$ 并联，给交流信号提供一条「绕过」$R_E$ 的通路。它对直流是开路（$R_E$ 照常工作），对交流是短路（$R_E$ 被绕过）。
- **负载** $R_L$：静态时被 $C_2$ 隔断，所以**算 Q 点时不带 $R_L$**；动态时通过 $C_2$ 接进来，所以**算增益时必须带 $R_L$**。
- **源划分**：$R_S$ 是信号源内阻，$u_i$ 是送到放大器输入端的电压；两者不同，第五步会算「对源而言的增益」。

有了这张图，下一步就把它按「直流」和「交流」拆成两张。下一节先画直流那张。

## 二、直流通路：给管子找一个站位（静态工作点 Q）

这一节只回答一个问题：无信号时管子站在哪，怎么算。

规则只有一条：**电容开路**（$C_1$、$C_2$、$C_E$ 全部断开），于是图上只剩 $V_{CC}$、$R_{b1}$、$R_{b2}$、$R_C$、$R_E$ 和管子本身。得到的三个量——静态基极/集电极电流 $I_{BQ}$、$I_{CQ}$ 与静态管压降 $V_{CEQ}$——合称**静态工作点 Q**（Q 是 Quiescent，意为「静止的、无信号的」）。

估算顺序是固定的三步，每一步只用欧姆定律：$V_B\to V_E\to I_E\to V_{CE}$。

<FigBox title="直流通路：电容开路后剩下的那张图" kind="电路" note="C₁、C₂、C_E 全部断开，R_L 被 C₂ 隔断而不出现。于是 R_b1、R_b2 构成一个简单的分压器，V_B 由它定死——这是分压式偏置能稳住工作点的根源。" >

<svg viewBox="0 0 520 280" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="80" y1="50" x2="420" y2="50"/>
<line x1="80" y1="50" x2="80" y2="250"/>
<line x1="80" y1="250" x2="420" y2="250"/>
<text x="80" y="36" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
<line x1="72" y1="50" x2="88" y2="50" stroke="var(--vp-c-text-1)" stroke-width="2.6"/>
<text x="64" y="70" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">V</text>
<text x="71" y="78" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">CC</text>
<text x="64" y="92" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">12 V</text>

<line x1="160" y1="50" x2="160" y2="90"/>
<g transform="translate(160 110) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="160" y1="130" x2="160" y2="160"/>
<text x="140" y="110" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="147" y="118" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">b1</text>
<text x="140" y="136" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">20 kΩ</text>
<line x1="160" y1="160" x2="160" y2="190"/>
<g transform="translate(160 210) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="160" y1="230" x2="160" y2="250"/>
<text x="140" y="210" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="147" y="218" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">b2</text>
<text x="140" y="236" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">10 kΩ</text>
<circle cx="160" cy="160" r="4.5" class="sf-dot"/>
<text x="176" y="150" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">V_B = 4 V</text>

<line x1="160" y1="160" x2="250" y2="160"/>
<text x="205" y="146" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_BQ</text>
<path d="M 236 154 L 246 160 L 236 166 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>

<path d="M 250 118 L 250 202" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="240" y1="150" x2="250" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 250 156 L 290 178 L 290 154 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 250 162 L 290 182 L 290 166 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="246" y="104" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">B</text>

<line x1="290" y1="160" x2="330" y2="160" stroke="var(--vp-c-text-1)" stroke-width="2.6"/>
<text x="330" y="128" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C</text>
<line x1="330" y1="50" x2="330" y2="80"/>
<g transform="translate(330 100) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="330" y1="120" x2="330" y2="160"/>
<text x="310" y="100" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="317" y="108" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">C</text>
<text x="310" y="126" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">2 kΩ</text>
<text x="352" y="104" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_CQ</text>

<line x1="330" y1="160" x2="330" y2="200" stroke="var(--vp-c-text-1)" stroke-width="2.6"/>
<line x1="330" y1="182" x2="298" y2="174" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 292 172 L 300.7 167.2 L 301.5 175.9 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="284" y="166" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">E</text>
<text x="352" y="196" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_EQ</text>
<line x1="330" y1="200" x2="330" y2="216"/>
<g transform="translate(330 234) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="330" y1="252" x2="330" y2="250"/>
<text x="352" y="234" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="359" y="242" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">E</text>
<text x="352" y="256" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">2 kΩ</text>
<text x="330" y="270" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_EQ = V_B − 0.7 = 3.3 V</text>
<text x="250" y="22" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电容全部开路 · R_L 被 C₂ 隔断，不出现在静态分析里</text>
</svg>

</FigBox>

::: tip 例 1 · 分压偏置电路的静态工作点 {#ex-amp-1}
**题目**：对上图电路（$V_{CC}=12$ V，$R_{b1}=20\ \text{k}\Omega$，$R_{b2}=10\ \text{k}\Omega$，$R_C=R_E=2\ \text{k}\Omega$，$\beta=60$），估算静态工作点 $I_{CQ}$、$I_{BQ}$、$V_{CEQ}$，并检验「分压器够不够硬」。

<FigBox title="例 1 的直流通路：三步是怎么走下来的" kind="电路" note="① R_b1、R_b2 分压定 V_B = 4 V；② 发射结降 0.7 V 得 V_E = 3.3 V，再由 R_E 定出 I_EQ；③ I_C 沿 R_C、R_E 各降一段，剩下的就是 V_CEQ = 5.4 V。三步只用欧姆定律和 KVL。" >

<svg viewBox="0 0 520 300" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="q1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="70" y1="40" x2="330" y2="40"/>
<text x="70" y="24" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+V_CC = 12 V</text>
<line x1="150" y1="40" x2="150" y2="46"/>
<g transform="translate(150 72) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<text x="128" y="58" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_b1 = 20 k</text>
<line x1="150" y1="98" x2="150" y2="118"/>
<circle cx="150" cy="118" r="4" class="sf-dot"/>
<text x="176" y="110" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">① V_B = 4 V</text>
<line x1="150" y1="120" x2="150" y2="134"/>
<g transform="translate(150 154) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<text x="128" y="140" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_b2 = 10 k</text>
<line x1="150" y1="174" x2="150" y2="250"/>
<line x1="240" y1="40" x2="240" y2="50"/>
<g transform="translate(240 70) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<text x="218" y="56" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_C = 2 k</text>
<line x1="240" y1="96" x2="240" y2="118"/>
<line x1="150" y1="118" x2="240" y2="118"/>
<line x1="240" y1="118" x2="240" y2="152" stroke="var(--vp-c-text-1)" stroke-width="2"/>
<line x1="240" y1="126" x2="196" y2="140"/>
<line x1="240" y1="144" x2="196" y2="156"/>
<line x1="196" y1="140" x2="196" y2="156" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 204 154 L 196 156 L 201.5 149 Z" class="sf-solid"/>
<line x1="196" y1="156" x2="196" y2="180"/>
<text x="218" y="176" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T</text>
<path d="M 160 46 L 160 82" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#q1)"/>
<text x="184" y="60" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-it">I_Rb1 = 400 μA</text>
<text x="184" y="78" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">（≥ 10·I_B 才够硬）</text>
<g transform="translate(196 214) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<text x="174" y="200" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_E = 2 k</text>
<line x1="196" y1="234" x2="196" y2="250"/>
<path d="M 192 246 L 192 214" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#q1)"/>
<text x="168" y="200" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">I_EQ = 1.65 mA</text>
<text x="212" y="196" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">② V_E = 3.3 V</text>
<line x1="70" y1="250" x2="330" y2="250"/>
<line x1="70" y1="40" x2="70" y2="262"/>
<line x1="58" y1="262" x2="82" y2="262" stroke-width="2.2"/>
<line x1="64" y1="269" x2="76" y2="269" stroke-width="1.8"/>
<line x1="69" y1="276" x2="71" y2="276" stroke-width="1.8"/>
<text x="300" y="120" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">③ V_CEQ</text>
<text x="300" y="140" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">= 12 − 1.65m×(2k+2k)</text>
<text x="300" y="158" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">= 5.4 V</text>
<text x="210" y="290" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电容全部开路，R_L 被 C₂ 隔断——这一张图里没有它</text>
</svg>

</FigBox>

**先想什么**：估算而不是精确解方程，靠的是一句近似——**$I_{BQ}$ 远小于流过 $R_{b1}$、$R_{b2}$ 的电流，所以基极几乎不从分压器取流，$V_B$ 由两个电阻的分压决定**。这条近似必须事后校核，校核通过才能用。（为什么不直接解完整方程：三端口的耦合方程解起来慢，而且 $\beta$ 本身误差就有几十个百分点，精确解反而不值得。）*

**第一步，$V_B$（分压）。**

$$
V_B\approx V_{CC}\frac{R_{b2}}{R_{b1}+R_{b2}}=12\times\frac{10}{20+10}=4\ \text{V}
$$

**第二步，$V_E$、$I_E$（跟随发射结）。** 发射结正偏，所以发射极电位比基极低约 0.7 V：

$$
V_E=V_B-0.7=3.3\ \text{V},\qquad I_{EQ}=\frac{V_E}{R_E}=\frac{3.3}{2\ \text{k}\Omega}=1.65\ \text{mA}
$$

*（为什么先算 $I_E$ 而不是 $I_C$：$R_E$ 上的电流就是发射极电流，它与 $V_E$ 的关系是纯粹的欧姆定律，不受 $\beta$ 影响；先抓住这个不依赖 $\beta$ 的量，估算才稳。）*

**第三步，$V_{CEQ}$（沿集电极回路走一圈）。** $I_{CQ}\approx I_{EQ}=1.65$ mA（因为 $I_{BQ}$ 只占 $I_E$ 的 $1/(1+\beta)$，约 1.6%）：

$$
V_{CEQ}=V_{CC}-I_{CQ}(R_C+R_E)=12-1.65\ \text{mA}\times4\ \text{k}\Omega=5.4\ \text{V}
$$

$I_{BQ}=I_{CQ}/\beta=1.65/60=27.5\ \mu$A。

**第四步，校核「分压器够不够硬」。** 这是最常被跳过的一步：

$$
I_{R_{b1}}=\frac{V_{CC}-V_B}{R_{b1}}=\frac{12-4}{20\ \text{k}\Omega}=400\ \mu\text{A},\qquad \frac{I_{R_{b1}}}{I_{BQ}}=\frac{400}{27.5}\approx14.5
$$

工程要求这个比值大于 5~10，本例约 14.5 ✓，说明基极电流对分压的「拖拽」可以忽略，第一步的估算成立。

**第五步，审视结果。** $V_{CEQ}=5.4$ V 接近 $\frac12V_{CC}=6$ V，说明 Q 点大致落在负载线中部——这正是设计意图（留给摆幅的空间最大）。

**验算（KVL 沿最外圈走一遍）**：$V_{CC}=I_{CQ}R_C+V_{CEQ}+I_{EQ}R_E$，代入得 $1.65\times2+5.4+1.65\times2=3.3+5.4+3.3=12$ V ✓，与电源相等。

**最该带走的一句**：若把 $R_E$ 误当成被 $C_E$ 短路（画错图），$I_E$ 会从 1.65 mA 暴涨到十几 mA、$V_{CE}$ 掉到 0 附近。**$R_E$ 上有没有并 $C_E$，是静态与动态分析最容易看错的地方**——直流通路里 $C_E$ 是开路，$R_E$ 一定在场。
:::

> **为什么要有 $R_E$：它就是「稳定」这个词本身**
> 假如温度上升使 $I_C$ 增大，则 $I_E$ 增大 → $V_E=I_ER_E$ 抬高 → 而 $V_B$ 被分压器钉住不动 → $V_{BE}=V_B-V_E$ 减小 → $I_B$ 减小 → 反过来压制 $I_C$。这一整串反作用在教科书里叫**直流负反馈**，它的物理执行者就是那颗 $R_E$。$R_E$ 越大抑制越强，但太大的 $R_E$ 会吃掉电源电压——取值总是折中。

Q 点站好了，下一步才能让信号摆起来。但「信号」这张图和「直流」这张图长得完全不同，下一节就是那张翻倍的图。

## 三、交流通路：把管子换成一个线性模型

这一节回答两个问题：为什么交流通路里 $V_{CC}$ 要「接地」，以及三极管被换成了什么东西。

规则仍然是两条，只是反过来：**电容短路**（$C_1$、$C_2$、$C_E$ 全部当成导线），**直流电压源短路**（理想电源内阻为零，对交流而言它是一个交流接地点）。于是 $V_{CC}$ 那一端在交流图里等价于接地，$R_C$ 的上端、$R_{b1}$ 的上端都接到地——这是第一次看交流图时最不适应的一步。

管子的替换是整个分析的转折点。在小信号条件下（交流幅度远小于**热电压** $V_T\approx26$ mV——这个数由温度决定，等于 $kT/q$——时管子可近似看作线性），三极管被换成**微变等效电路**（也称小信号模型 small-signal model）：

- 基极与发射极之间是一个**动态电阻** $r_{be}$；
- 集电极与发射极之间是一个**受控电流源** $\beta i_b$（电流由基极电流线性控制）。

**$r_{be}$**（读作 r-b-e，基极-发射极间的微变等效电阻）由经验公式给出：

$$
r_{be}=r_{bb'}+(1+\beta)\frac{V_T}{I_{EQ}}\approx300+(1+\beta)\frac{26\ \text{mV}}{I_{EQ}}
$$

$V_T\approx26$ mV 是**热电压**（$V_T=kT/q$，由温度决定）。这个式子说明一件很重要的事：**$r_{be}$ 不是器件的固定参数，它随静态电流 $I_{EQ}$ 变化**—— $I_E$ 翻倍，$r_{be}$ 大致减半。这就是工作点会影响增益的原因。

<FigBox title="微变等效电路：三极管被换成「r_be + 受控源 βi_b」" kind="电路" note="左：三极管符号（B、C、E 三个极）。右：它的微变等效电路——b-e 之间一个电阻 r_be，c-e 之间一个由 i_b 控制的电流源 βi_b。有了这一张替换图，后面所有动态计算都只是欧姆定律和 KCL。" >

<svg viewBox="0 0 520 240" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="110" y="34" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">三极管符号</text>
<path d="M 60 60 L 60 180" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="60" y1="104" x2="60" y2="136" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="48" y1="120" x2="60" y2="120"/>
<line x1="60" y1="104" x2="130" y2="108" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="60" y1="136" x2="130" y2="172" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="130" y1="108" x2="130" y2="172" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 114.4 166.8 L 130 172 L 121.6 159.2 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="42" y="120" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">B</text>
<text x="142" y="116" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C</text>
<text x="142" y="190" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">E</text>
<line x1="130" y1="108" x2="170" y2="108"/>
<line x1="130" y1="172" x2="130" y2="200"/>
<text x="110" y="222" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">非线性三端器件</text>

<line x1="220" y1="60" x2="220" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="5 4"/>
<path d="M 340 80 L 340 60 L 372 60 L 372 200 L 340 200 Z" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
<text x="356" y="106" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">≈</text>
<text x="300" y="112" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">小信号替换</text>

<circle cx="340" cy="80" r="4.5" class="sf-dot"/>
<circle cx="340" cy="200" r="4.5" class="sf-dot"/>
<circle cx="500" cy="96" r="4.5" class="sf-dot"/>
<circle cx="500" cy="200" r="4.5" class="sf-dot"/>
<line x1="336" y1="80" x2="340" y2="80"/>
<g transform="translate(400 140) rotate(90)">
<line x1="-28" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-14" width="20" height="28" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="28" y2="0"/>
</g>
<line x1="340" y1="80" x2="340" y2="112"/>
<line x1="340" y1="168" x2="340" y2="200"/>
<text x="420" y="140" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">r</text>
<text x="425" y="150" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">be</text>
<text x="330" y="70" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">B</text>
<text x="330" y="212" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">E</text>
<line x1="340" y1="80" x2="404" y2="80"/>
<line x1="404" y1="80" x2="404" y2="96"/>
<line x1="404" y1="96" x2="500" y2="96"/>
<line x1="404" y1="96" x2="404" y2="184"/>
<line x1="404" y1="184" x2="500" y2="184"/>
<line x1="500" y1="96" x2="500" y2="184"/>
<path d="M 440 184 L 440 96" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 436 106 L 440 96 L 444 106 Z" fill="var(--vp-c-brand-1)" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/>
<text x="452" y="140" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">βi</text>
<text x="463" y="150" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">b</text>
<text x="510" y="140" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C</text>
<line x1="500" y1="184" x2="500" y2="200"/>
<line x1="340" y1="200" x2="500" y2="200"/>
<text x="420" y="222" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">线性二端口：一个输入电阻 + 一个受控电流源</text>
</svg>

</FigBox>

模型有了，把它装回原电路就得到完整的交流通路。这里有一个关键的替代：$R_C$ 与 $R_L$ 在交流图上**并联**（两者上端都交流接地），所以定义一个组合电阻

$$
R_L'=R_C\parallel R_L=\frac{R_CR_L}{R_C+R_L}
$$

**$R_L'$ 读作「交流负载」**。凡是说到增益，用到的都是它；而 $R_C$ 单独只在算输出电阻时出现。

::: tip 例 2 · 共射电路的三个动态参数 {#ex-amp-2}
**题目**：接例 1 的静态结果，已知 $\beta=60$、$R_C=2\ \text{k}\Omega$、$R_L=3\ \text{k}\Omega$、$R_{b1}=20\ \text{k}\Omega$、$R_{b2}=10\ \text{k}\Omega$。求 $\dot A_u$、$r_i$、$r_o$；并计算信号源内阻 $R_S=1\ \text{k}\Omega$ 时的源增益 $\dot A_{us}$。

<FigBox title="例 2 的交流通路：电容短路、V_CC 接地后的样子" kind="电路" note="C₁、C₂、C_E 全部短接，V_CC 变成交流接地点，于是 R_C 与 R_L 并联成 R_L′ = 1.2 kΩ。三极管已被换成「r_be + 受控源 βi_b」，整张图退化成一个纯电阻网络。" >

<svg viewBox="0 0 520 300" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="90" y1="250" x2="460" y2="250"/>
<line x1="30" y1="126" x2="104" y2="126"/>
<g transform="translate(54 126) rotate(90)">
<line x1="-14" y1="0" x2="-5" y2="0"/>
<rect x="-5" y="-6" width="10" height="12" rx="1.2" fill="none"/>
<line x1="5" y1="0" x2="14" y2="0"/>
</g>
<text x="36" y="152" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_S</text>
<circle cx="104" cy="126" r="4" class="sf-dot"/>
<text x="104" y="104" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">b</text>
<line x1="104" y1="126" x2="104" y2="140"/>
<line x1="104" y1="140" x2="104" y2="180"/>
<g transform="translate(104 200) rotate(90)">
<line x1="-22" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="22" y2="0"/>
</g>
<line x1="104" y1="220" x2="104" y2="250"/>
<text x="80" y="200" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">r_be = 1.26 kΩ</text>
<line x1="104" y1="126" x2="166" y2="126"/>
<line x1="166" y1="112" x2="166" y2="140" stroke="var(--vp-c-text-1)" stroke-width="2"/>
<line x1="166" y1="126" x2="240" y2="126"/>
<circle cx="166" cy="126" r="4" class="sf-dot"/>
<text x="166" y="98" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">B</text>
<line x1="240" y1="126" x2="240" y2="168"/>
<path d="M 234 232 L 240 250 L 246 232 Z" class="sf-solid"/>
<line x1="240" y1="168" x2="240" y2="246" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="252" y="206" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">βi_b</text>
<line x1="240" y1="126" x2="330" y2="126"/>
<circle cx="240" cy="126" r="4" class="sf-dot"/>
<text x="240" y="104" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C</text>
<circle cx="330" cy="126" r="4" class="sf-dot"/>
<line x1="330" y1="126" x2="330" y2="150"/>
<g transform="translate(330 176) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<text x="308" y="162" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_C = 2 k</text>
<line x1="330" y1="202" x2="330" y2="250"/>
<line x1="420" y1="126" x2="420" y2="150"/>
<g transform="translate(420 176) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<text x="398" y="162" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_L = 3 k</text>
<line x1="420" y1="202" x2="420" y2="250"/>
<line x1="330" y1="126" x2="420" y2="126"/>
<circle cx="456" cy="126" r="4" class="sf-dot"/>
<line x1="420" y1="126" x2="452" y2="126"/>
<text x="470" y="126" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="479" y="135" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<line x1="90" y1="250" x2="90" y2="274"/>
<line x1="74" y1="274" x2="106" y2="274" stroke-width="2.2"/>
<line x1="82" y1="281" x2="98" y2="281" stroke-width="1.8"/>
<line x1="89" y1="288" x2="91" y2="288" stroke-width="1.8"/>
<text x="140" y="270" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">交流接地点</text>
<text x="290" y="70" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">R_C ∥ R_L = R_L′ = 1.2 kΩ</text>
<path d="M 300 84 L 336 118" stroke="var(--vp-c-brand-1)" stroke-width="1.4" stroke-dasharray="4 3"/>
<path d="M 382 84 L 404 118" stroke="var(--vp-c-brand-1)" stroke-width="1.4" stroke-dasharray="4 3"/>
<text x="470" y="52" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_b1 ∥ R_b2 ∥ r_be = r_i</text>
<path d="M 466 60 L 466 96 L 420 96" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
</svg>

</FigBox>

**先想什么**：动态计算就三件事——先把管子换成 $r_{be}$ 和受控源，再写出 $u_o$ 与 $u_i$ 的关系得到增益，最后分别「从前级看进去」「从后级看进去」得到 $r_i$、$r_o$。*（为什么按这个顺序：$r_{be}$ 由静态电流决定，所以动态必须在静态之后；而增益的分母里正好有 $r_i$ 的影子，先算增益再算两个电阻，逻辑最顺。）*

**第一步，算 $r_{be}$（由静态 $I_{EQ}$ 决定）。**

$$
r_{be}=300+(1+\beta)\frac{26\ \text{mV}}{I_{EQ}}=300+61\times\frac{26}{1.65}\approx1.26\ \text{k}\Omega
$$

**第二步，算交流负载 $R_L'$。**

$$
R_L'=R_C\parallel R_L=\frac{2\times3}{2+3}=1.2\ \text{k}\Omega
$$

**第三步，列交流通路的输出电压。** 输入电压加在 b-e 上产生 $i_b=u_i/r_{be}$；集电极电流 $\beta i_b$ 流过 $R_L'$，方向向下，所以集电极电位的变化与输入**相反**：

$$
\dot A_u=\frac{\dot U_o}{\dot U_i}=-\frac{\beta R_L'}{r_{be}}=-\frac{60\times1.2\ \text{k}}{1.26\ \text{k}}\approx-57
$$

*（负号从哪来：$i_b$ 增大 → 集电极电流增大 → $R_C$ 上压降增大 → 集电极电位**下降**。所以输入升高时输出反而降低，这就是「倒相」。符号别丢，后面判断[第 6 章 · 放大电路中的反馈](feedback.md)的极性全靠它。）*

**第四步，输入电阻（从输入端看进去）。** 三条支路并联：$R_{b1}$、$R_{b2}$ 到地，还有往基极里看的 $r_{be}$：

$$
r_i=R_{b1}\parallel R_{b2}\parallel r_{be}=\left(\frac{1}{20}+\frac{1}{10}+\frac{1}{1.26}\right)^{-1}\ \text{k}\Omega\approx1.06\ \text{k}\Omega
$$

**第五步，输出电阻（从输出端看进去，信号源置零）。** 受控源在输入为零时电流为零，于是从集电极看进去只剩 $R_C$：

$$
r_o\approx R_C=2\ \text{k}\Omega
$$

**第六步，源增益。** 放大器不是孤立器件——信号源有内阻 $R_S=1\ \text{k}\Omega$，它先与 $r_i$ 分压，真正进到放大器输入端的只有一部分：

$$
\dot A_{us}=\dot A_u\times\frac{r_i}{R_S+r_i}=-57\times\frac{1.06}{1.06+1.0}\approx-29
$$

**验算（信号链闭合）**：输入源电压 $u_s=10$ mV 时，落到放大器输入端的是 $u_i=u_s\cdot r_i/(R_S+r_i)=10\times\dfrac{1.06}{2.06}=5.15$ mV；乘以 $\dot A_u=-57$ 得 $u_o=-293.6$ mV。而按源增益一次算：$u_o=\dot A_{us}u_s=-29\times10=-290$ mV ✓。两条路径只差中间取整造成的 1%，说明「增益 × 输入衰减」这条链路自洽。

**再来一次独立验算（用 $g_m$ 交叉核对）**：由静态电流直接算跨导 $g_m=I_{EQ}/V_T=1.65\ \text{mA}/26\ \text{mV}=63.5$ mS；把它还原成 $r_{be}$：

$$
r_{be}=300+\frac{1+\beta}{g_m}=300+\frac{61}{63.5\ \text{mS}}=300+961=1261\ \Omega
$$

与第一步的 $1.26\ \text{k}\Omega$ 完全吻合 ✓。这条链条说明 $r_{be}$、$g_m$、$I_{EQ}$ 三者不是三个独立参数，而是同一个静态工作点的三种写法——**改动任何一个，另两个跟着变**。

**最该带走的一句**：放大倍数永远是对「源」而言的，写增益时先问一句「这个增益的输入端接在哪」。
:::

::: warning 旁路电容失效时会怎样（高频故障）
若 $C_E$ 开路（虚焊或失效），$R_E$ 在交流图里不再被短路，而是**串进发射极回路**，于是分母多一项：

$$
\dot A_u=-\frac{\beta R_L'}{r_{be}+(1+\beta)R_E}=-\frac{60\times1.2\ \text{k}}{1.26\ \text{k}+61\times2\ \text{k}}=-\frac{72\ \text{k}}{123.3\ \text{k}}\approx-0.58
$$

也就是说增益从 $-57$ 掉到约 $-0.58$，近百倍的损失，而**电路照样「通」、Q 点照样正常**。这正是「负反馈提高稳定性、牺牲增益」的代价（[第 6 章](feedback.md)会给出一般形式）。现场排查放大倍数凭空变小时，先怀疑旁路电容。
:::

三个参数齐了，还有一个直击设计的问题没回答：这个电路最大能输出多大的信号？下一节回答它。

## 四、Q 点位置决定失真：最大不失真输出

这一节回答两个问题：Q 点偏高偏低各会造成什么失真，以及输出幅度被什么限住。

把负载线画出来就全清楚了。它是一条独立于器件参数的外部约束：$V_{CE}=V_{CC}-I_CR_C$，在 $I_C$–$V_{CE}$ 平面上是一条直线；Q 点必须落在这条线上。信号摆动时 Q 点沿**交流**负载线（斜率由 $R_L'$ 决定）上下移动，两侧各有一堵墙：

- **往下撞饱和**：$V_{CE}$ 降到 $V_{CE(sat)}\approx0.3$ V 就不能再降 → 输出**底部**被削平，称**饱和失真**；
- **往上撞截止**：$I_C$ 降到 0 就不能再降 → 输出**顶部**被削平，称**截止失真**。

<FigBox title="直流负载线与工作点：Q 点两侧各有一堵墙" kind="直线" note="横轴 V_CE、纵轴 I_C 的负载线由 V_CC/R_C 定死，Q 点位置只由 I_B 决定。信号摆动时 Q 沿交流负载线走：太靠上会撞饱和（底部削平），太靠下会撞截止（顶部削平）。" >
<WavePreset kind="loadline" :p="0.5" />
</FigBox>

::: tip 例 3 · 最大不失真输出电压 {#ex-amp-3}
**题目**：接例 1、例 2，$V_{CEQ}=5.4$ V、$I_{CQ}=1.65$ mA、$R_L'=1.2\ \text{k}\Omega$。求最大不失真输出峰值、有效值与峰峰值，并判断这个电路是哪一侧先到。

> **三个幅度词先分清**：**峰值** $U_m$ 是正弦偏离零点的最大值（正弦下 $U_m=\sqrt2\,U$，$U$ 为有效值）；**峰峰值** $U_{pp}$ 是正峰到负峰的全宽，等于 $2U_m$；**有效值**是按发热等效的直流值（<Prereq id="rms" />）。示波器读的是峰峰值，万用表交流档读的是有效值，两者差 $2\sqrt2$ 倍。

<FigBox title="例 3 的两堵墙：Q 点两侧各能走多远" kind="直线" note="横轴 V_CE、纵轴 I_C。Q 点 (5.4 V, 1.65 mA) 沿交流负载线摆动：向右最多走到 V_CE = 0.3 V（饱和，余量 5.1 V），向上最多走到 I_C = 0（截止，余量 I_CQ·R_L′ = 1.98 V）。输出幅度由较小的那一边决定。" >

<svg viewBox="0 0 470 290" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="70" y1="230" x2="430" y2="230" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<line x1="70" y1="230" x2="70" y2="30" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="436" y="246" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_CE / V</text>
<text x="56" y="20" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_C / mA</text>
<line x1="70" y1="230" x2="390" y2="60" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
<text x="398" y="54" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">直流负载线</text>
<line x1="208" y1="230" x2="208" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="208" y="248" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">V_CEQ = 5.4</text>
<line x1="70" y1="152" x2="390" y2="152" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="62" y="152" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_CQ = 1.65</text>
<circle cx="208" cy="152" r="5.5" fill="var(--vp-c-brand-1)" stroke="none"/>
<text x="220" y="140" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">Q</text>
<line x1="208" y1="152" x2="392" y2="86" stroke="var(--vp-c-brand-1)" stroke-width="2"/>
<text x="356" y="70" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">交流负载线</text>
<text x="356" y="88" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">斜率由 R_L′ = 1.2 kΩ</text>
<line x1="208" y1="152" x2="376" y2="152" stroke="var(--vp-c-brand-1)" stroke-width="2"/>
<line x1="376" y1="230" x2="376" y2="212" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
<text x="300" y="222" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">截止侧余量</text>
<text x="300" y="206" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">I_CQ·R_L′ = 1.98 V</text>
<line x1="376" y1="152" x2="376" y2="110" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="3 3"/>
<text x="292" y="138" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">饱和侧余量</text>
<text x="292" y="122" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">5.4 − 0.3 = 5.1 V</text>
<line x1="90" y1="230" x2="90" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="90" y="248" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0.3</text>
<text x="240" y="278" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">取两侧较小者：最大不失真峰值 = 1.98 V（截止侧先到）</text>
</svg>

</FigBox>

**先想什么**：输出幅度被「哪一侧先撞墙」限制，所以要分别算两个方向的余量再取小者。*（为什么不能直接取 $\frac12V_{CC}$：$\frac12V_{CC}$ 只保证 $V_{CEQ}$ 居中，但截止侧的余量是 $I_{CQ}R_L'$，它跟负载有关，与饱和侧不一定对称。）*

**第一步，饱和侧余量。** 从 $V_{CEQ}$ 往下能走多少：

$$
U_{\text{om,饱和}}=V_{CEQ}-V_{CE(sat)}=5.4-0.3=5.1\ \text{V}
$$

**第二步，截止侧余量。** 从 $I_{CQ}$ 往上（电流减到 0）能走多少，换算成电压要乘**交流**负载：

$$
U_{\text{om,截止}}=I_{CQ}R_L'=1.65\ \text{mA}\times1.2\ \text{k}\Omega=1.98\ \text{V}
$$

**第三步，取小者。**

$$
U_{\text{om}}=1.98\ \text{V（峰值）},\qquad U_{o,\text{rms}}=\frac{1.98}{\sqrt2}=1.40\ \text{V},\qquad U_{\text{opp}}=2\times1.98=3.96\ \text{V}
$$

这个电路是**截止侧先到**——$I_{CQ}$ 偏小、$R_L'$ 偏小。

**第四步，怎么改进。** 想提高输出幅度就得让两侧余量相等：$I_{CQ}R_L'=V_{CEQ}-0.3$。抬高 $I_{CQ}$ 能加大截止侧余量，但会让饱和侧余量变小（$V_{CEQ}=V_{CC}-I_{CQ}(R_C+R_E)$ 跟着降）；最优解在两者相等处。

**验算**：把两侧相等当作方程解一次看看。设目标 $I_{CQ}R_L'=V_{CC}-I_{CQ}(R_C+R_E)-0.3$，代入数值：$1.2I_{CQ}=12-4I_{CQ}-0.3$，得 $5.2I_{CQ}=11.7$，$I_{CQ}=2.25$ mA，此时 $V_{CEQ}=12-2.25\times4=3.0$ V，两侧余量各为 $2.25\times1.2=2.7$ V 与 $3.0-0.3=2.7$ V ✓。确实相等，且最大输出从 1.98 V 提高到 2.7 V。

**最该带走的一句**：最大不失真输出取两侧余量的**较小值**，最优 Q 点让两侧**相等**——这两个结论记住，比背公式管用。
:::

共射是主力，但它不是万能的。三种接法各有性格，下一节做横向对比。

## 五、三种接法：同一颗管子的三种性格

这一节做一张横向对比表，并解释为什么多级放大器常常「共射提增益 + 共集做输出」。

所谓三种接法指的是：**输入信号加到哪两个极之间、输出又从哪两个极取出**。剩下的那个极就是输入输出的公共端，名字由此而来。**不是换管子，是换接地方式**。

| | 共射 | 共集（射极输出器） | 共基 |
| --- | --- | --- | --- |
| 电压增益 | 大（几十~几百） | ≈1（略小于 1） | 大（同共射量级） |
| 电流增益 | $\beta$ | $1+\beta$ | $\alpha\approx1$ |
| 输入电阻 | 中（kΩ 级） | **高**（几十 kΩ 以上） | **低**（几十 Ω） |
| 输出电阻 | 高（$R_C$） | **低**（几十 Ω） | 高（$R_C$） |
| 相位 | 倒相 | 同相 | 同相 |
| 典型用途 | 电压放大主力 | **缓冲 / 阻抗匹配** | 高频、宽频带 |

表里出现的 **$\alpha$**（阿尔法，共基电流放大系数）是 $\alpha=\beta/(1+\beta)$，略小于 1——共基电路的输出电流几乎等于输入电流，不放大电流。

记忆法：**共射是全能选手，共集是「和事佬」（电压不放大但谁都带得动），共基是「高速直男」（不挑负载但输入阻抗太低）**

> **「输入阻抗」与正文的「输入电阻」是一回事吗**：低频下是一回事——**输入阻抗** $Z_i=\dot U_i/\dot I_i$ 是从输入端看进去的等效阻抗，在工作频段内它就是前面算的那个**输入电阻** $r_i$，本页三张表里的「输入电阻」指的都是它。它的大小决定前级信号被分掉多少：$r_i$ 越大，从前级「借」走的电流越少。含电抗或受控源时 $Z_i$ 才是复数（见<Prereq id="input-impedance" />）。

<FigBox title="三种接法：差别只在哪个极当公共端" kind="结构" note="同一颗管子，把「公共端」从发射极（共射）换到集电极（共集）再到基极（共基），输入输出电阻就整体换一副性格。看图时先找信号从哪进、从哪出，剩下的那个极就是名字里的那个字。" >

<svg viewBox="0 0 560 220" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="am-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<text x="90" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">共射 CE</text>
<rect x="24" y="40" width="140" height="156" rx="8" stroke-dasharray="5 4"/>
<circle cx="90" cy="150" r="5" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="90" y="176" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">E 接地（公共端）</text>
<line x1="60" y1="86" x2="120" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="90" y1="86" x2="90" y2="96" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 84 96 L 90 86 L 96 96 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="52" y="80" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">输入 B</text>
<text x="128" y="80" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">输出 C</text>
<text x="90" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">增益大 · 倒相 · 阻抗中等</text>

<text x="280" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">共集 CC（射随）</text>
<rect x="210" y="40" width="140" height="156" rx="8" stroke="var(--vp-c-brand-1)" stroke-width="1.8"/>
<circle cx="280" cy="72" r="5" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="280" y="58" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C 接 V_CC（交流接地）</text>
<text x="280" y="46" text-anchor="middle" dominant-baseline="middle" font-size="0" stroke="none" fill="var(--vp-c-text-1)" class="sf-t"> </text>
<line x1="250" y1="122" x2="310" y2="122" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="280" y1="122" x2="280" y2="150" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 274 150 L 280 160 L 286 150 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="242" y="116" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">输入 B</text>
<text x="318" y="116" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">输出 E</text>
<text x="280" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A_u≈1 · 同相 · 输入高 / 输出低</text>

<text x="470" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">共基 CB</text>
<rect x="396" y="40" width="140" height="156" rx="8" stroke-dasharray="5 4"/>
<line x1="440" y1="86" x2="500" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="466" y="100" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">B 交流接地</text>
<path d="M 432 106 L 432 76" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 420 96 L 446 76 L 446 116 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 420 100 L 436 88 L 436 112 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="418" y="140" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">输入 E</text>
<text x="512" y="86" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">输出 C</text>
<path d="M 446 96 L 512 96" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="470" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输入极低 · 高频好</text>
<text x="280" y="216" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">三种接法 = 三种「输入两边、输出两边」的组合；管还是那一颗</text>
</svg>

</FigBox>

对比表有了，只剩一个问题：共集那一行「输入高、输出低」具体有多大？下一节的例题把它算出来。

## 六、演示

这一节把上面的结论变成可以动手拖的东西：改偏置看 Q 点走动、加大输入看波形从哪一侧开始削。

<DemoBox title="共射放大电路沙盒：亲手把 Q 点拖进失真区" hint="拖动 R_b2 改变工作点、加大输入幅度逼近削顶——看 A_u、r_i、r_o 四个读数怎么随偏置联动。先拖出失真再回正文看解释。">
<AmpDemo />
</DemoBox>

拖动 $R_{b2}$ 直接搬动 Q 点，输入幅度不变，看输出波形哪一侧先塌——这就是「截止失真 / 饱和失真」的现场。再加大输入幅度，波形从某一侧开始削顶，**边界永远先撞向靠近的那一侧**。面板同时实时给出 $\dot A_u$、$r_i$、$r_o$ 和最大不失真峰值，四个参数随偏置联动的趋势一眼可见。

看完了「共射怎么算」，还剩两件事没落地：共集那两个阻抗到底多大，以及三个流传最广的误判错在哪。

## 七、剩下两道题：射极输出器与三个误判

这一节把上一节对比表里「输入高、输出低」那一行算成具体的数，并逐条拆掉三个高频误判。

::: tip 例 4 · 共集电极（射极输出器）的阻抗匹配账 {#ex-amp-4}
**题目**：同一组偏置，$R_E=2\ \text{k}\Omega$ 直接作为负载接在发射极（无旁路电容），$R_S=1\ \text{k}\Omega$。求 $\dot A_u$、$r_i$、$r_o$。

<FigBox title="例 4 的电路：输出改从发射极取" kind="电路" note="集电极直接接 V_CC（交流上等于接地），信号从基极进、从发射极出。输出跟着输入走（A_u≈1），但输入阻抗高、输出阻抗低——两个阻抗才是它真正的价值。" >

<svg viewBox="0 0 470 290" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="am-x" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="70" y1="46" x2="300" y2="46"/>
<text x="70" y="30" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+V_CC（交流接地）</text>
<line x1="250" y1="46" x2="250" y2="80"/>
<line x1="250" y1="80" x2="250" y2="126" stroke="var(--vp-c-text-1)" stroke-width="2"/>
<line x1="250" y1="88" x2="200" y2="100"/>
<line x1="250" y1="118" x2="200" y2="130"/>
<line x1="200" y1="100" x2="200" y2="130" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 208 128 L 200 130 L 205.5 123 Z" class="sf-solid"/>
<line x1="200" y1="130" x2="200" y2="196"/>
<line x1="250" y1="126" x2="250" y2="196" stroke-dasharray="4 3"/>
<text x="222" y="166" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T</text>
<line x1="146" y1="100" x2="200" y2="100"/>
<line x1="60" y1="100" x2="60" y2="196"/>
<line x1="46" y1="196" x2="74" y2="196" stroke-width="2.2"/>
<line x1="52" y1="203" x2="68" y2="203" stroke-width="1.8"/>
<line x1="57" y1="210" x2="63" y2="210" stroke-width="1.8"/>
<text x="30" y="88" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="37" y="97" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">i</text>
<line x1="52" y1="100" x2="112" y2="100"/>
<g transform="translate(129 100)">
<line x1="-17" y1="0" x2="-5" y2="0"/>
<rect x="-5" y="-6" width="10" height="12" rx="1.2" fill="none"/>
<line x1="5" y1="0" x2="17" y2="0"/>
</g>
<text x="129" y="82" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t sf-it">R_S</text>
<line x1="200" y1="130" x2="200" y2="160"/>
<g transform="translate(200 178) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="200" y1="196" x2="200" y2="240"/>
<text x="180" y="178" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_E = 2 kΩ</text>
<path d="M 196 236 L 196 200" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#am-x)"/>
<text x="214" y="222" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">i</text>
<text x="219" y="231" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">e</text>
<line x1="70" y1="240" x2="330" y2="240"/>
<line x1="70" y1="46" x2="70" y2="252"/>
<line x1="58" y1="252" x2="82" y2="252" stroke-width="2.2"/>
<line x1="64" y1="259" x2="76" y2="259" stroke-width="1.8"/>
<line x1="69" y1="266" x2="71" y2="266" stroke-width="1.8"/>
<circle cx="300" cy="130" r="4" class="sf-dot"/>
<line x1="200" y1="130" x2="300" y2="130"/>
<text x="316" y="130" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="325" y="139" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<text x="270" y="112" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输出取自发射极</text>
<text x="240" y="282" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">u_o 跟着 u_i 走（A_u ≈ 1）：发射极电位 = 基极电位 − 0.7 V</text>
</svg>

</FigBox>

**先想什么**：共集电路的分析可以直接借用上面那张微变等效图，但有一件事变了——**输出从发射极取，而发射极电位跟随基极**，于是增益接近 1。真正有价值的是两个电阻：**看进去很大、看回来很小**。*（为什么这两个数重要：共集几乎不放大电压，它的全部价值在于 $r_i$ 大（不拖累前级）与 $r_o$ 小（带得动后级）——「阻抗变换」才是它的正经用途。）*

**第一步，先算跨导。** 由静态电流得到

$$
g_m=\frac{I_{EQ}}{V_T}=\frac{1.65\ \text{mA}}{26\ \text{mV}}=63.5\ \text{mS}
$$

$g_m$ 是跨导（把 $v_{be}$ 的变化转成 $i_e$ 的变化），它与上面 $\beta/r_{be}$ 表达的是同一件事：$\beta/r_{be}=60/1.26\ \text{k}\Omega=47.6$ mS，与 $g_m=63.5$ mS 的差异来自 $r_{be}$ 里的 $300\ \Omega$ 项；共集的标准写法用 $g_m$，本页沿用教材这一惯例。

**第二步，电压增益。** 发射极电流在 $R_E$ 上产生压降，该压降本身又是反馈量，所以

$$
\dot A_u=\frac{g_mR_E}{1+g_mR_E}=\frac{63.5\ \text{mS}\times2\ \text{k}\Omega}{1+63.5\ \text{mS}\times2\ \text{k}\Omega}=\frac{127}{128}\approx0.992
$$

不到 1，**且略小于 1**——这就是「射随器」名字的来源：输出跟着输入走，只差一点点。

**第三步，输入电阻。** 发射极接的那颗 $R_E$ 折算到基极回路时要乘 $(1+\beta)$：

$$
r_i=R_{b1}\parallel R_{b2}\parallel\big[r_{be}+(1+\beta)R_E\big]=6.67\ \text{k}\parallel123\ \text{k}\approx6.3\ \text{k}\Omega
$$

**第四步，输出电阻（最有用的一项）。** 从发射极看回去，基极回路的电阻要除以 $(1+\beta)$：

$$
r_o=R_E\parallel\frac{r_{be}+(R_S\parallel R_{b1}\parallel R_{b2})}{1+\beta}=2\ \text{k}\Omega\parallel\frac{1.26\ \text{k}+0.87\ \text{k}}{61}\approx34\ \Omega
$$

**结论**：电压增益不到 1，但输入 $6.3\ \text{k}\Omega$、输出 $34\ \Omega$。

**验算**：把 $r_i$ 代回链路。源电压 $u_s=1$ V 时，落到输入端的是 $1\times6.3/(6.3+1)=0.863$ V；乘 $\dot A_u=0.992$ 得 $0.856$ V。再走输出侧的戴维南等效：开路输出 0.856 V、输出电阻 34 Ω，接上 $R_E=2\ \text{k}\Omega$ 的负载后实际得 $0.856\times2000/2034=0.842$ V。全程增益 $0.842$ ✓——与「$A_u\approx1$ 但带载能力极强」的定性判断一致，而且可以看到负载跌到 34 Ω 时输出才会减半。

**最该带走的一句**：把高阻信号源接到低阻负载的经典桥。传感器、麦克风、电缆驱动，全是它的活。
:::

射极输出器的两个阻抗算出来了，它的用途也就清楚了。最后一道不做计算，专门拆掉三个「听起来很有道理」的判断——它们对应本页最容易混的三组量。

::: tip 例 5 · 概念辨析：三个判断题 {#ex-amp-5}
**题目**：(a) 有人说静态工作点的 $V_{CEQ}$ 等于 $\frac12V_{CC}$ 时输出幅度一定最大。(b) 有人说共射电路的 $\dot A_u$ 是固定常数，与负载无关。(c) 有人用万用表量静态电位时发现 $V_C$ 明显偏低，判断 $R_C$ 开路了。逐条判断并说明理由。

<FigBox title="例 5 的三个误判各错在哪" kind="结构" note="(a) Q 点居中不等于摆幅最大——两侧约束的量纲不同；(b) 增益含 R_L′，负载一变增益就变；(c) V_C 偏低说明电流偏大，而 R_C 开路会让 V_C 升到 V_CC。" >

<svg viewBox="0 0 520 230" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="88" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">(a) 居中 ≠ 最大</text>
<rect x="16" y="40" width="144" height="160" rx="8" stroke-dasharray="5 4"/>
<line x1="34" y1="180" x2="142" y2="60" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="150" y="58" text-anchor="end" dominant-baseline="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">负载线</text>
<circle cx="88" cy="120" r="5" fill="var(--vp-c-brand-1)" stroke="none"/>
<text x="98" y="112" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">居中 Q</text>
<line x1="88" y1="120" x2="142" y2="94" stroke="var(--vp-c-text-3)" stroke-width="1.6"/>
<text x="88" y="196" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">两侧余量不等</text>
<text x="88" y="214" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">→ 截止侧先到</text>

<text x="260" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">(b) 增益随负载变</text>
<rect x="188" y="40" width="144" height="160" rx="8" stroke-dasharray="5 4"/>
<line x1="228" y1="150" x2="292" y2="150" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<circle cx="260" cy="150" r="4" class="sf-dot"/>
<line x1="260" y1="150" x2="260" y2="172"/>
<g transform="translate(260 188) rotate(90)">
<line x1="-18" y1="0" x2="-7" y2="0"/>
<rect x="-7" y="-5" width="14" height="10" rx="1.2" fill="none"/>
<line x1="7" y1="0" x2="18" y2="0"/>
</g>
<text x="240" y="168" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_L</text>
<text x="260" y="76" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">R_L′ = R_C ∥ R_L</text>
<text x="260" y="96" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">A_u = −βR_L′ / r_be</text>
<text x="260" y="196" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_L 开路 ↑ → A_u ↑</text>

<text x="432" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">(c) V_C 偏低说明什么</text>
<rect x="360" y="40" width="144" height="160" rx="8" stroke-dasharray="5 4"/>
<text x="432" y="66" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_C 开路：</text>
<line x1="392" y1="88" x2="472" y2="88" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="432" y="106" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">I_C ≈ 0 → V_C 升到 V_CC</text>
<line x1="392" y1="126" x2="472" y2="126" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="432" y="148" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">实测 V_C 偏低：</text>
<text x="432" y="168" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">I_C 偏大 → 靠近饱和</text>
<text x="432" y="190" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">判据看 V_CE ≈ 0.3 V</text>
<text x="260" y="222" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">三条都指向同一件事：哪些量是「外部约束」，哪些量是「器件状态」</text>
</svg>

</FigBox>

**先想什么**：三条都指向同一件事——**哪些量能从图上直接读，哪些必须算**。抓住一句：本页所有动态参数都依赖静态点，而静态点又依赖每一个电阻；所谓「固定常数」在半导体电路里几乎不存在。

**(a) 错。** 由例 3 已知：输出幅度取饱和侧 $V_{CEQ}-0.3$ 与截止侧 $I_{CQ}R_L'$ 的**较小**者。$V_{CEQ}=\frac12V_{CC}$ 只保证管子在直流负载线上居中，但截止侧受的是交流负载 $R_L'$ 约束；本电路 $V_{CEQ}=5.4$ V 已接近 $\frac12V_{CC}=6$ V，却因截止侧余量只有 1.98 V 而远未用满。

**(b) 错。** $\dot A_u=-\beta R_L'/r_{be}$，其中 $R_L'=R_C\parallel R_L$ 显式依赖负载。负载开路时 $R_L'=R_C=2\ \text{k}\Omega$，$\dot A_u=-95$；接上 $R_L=3\ \text{k}\Omega$ 后 $R_L'$ 降到 1.2 kΩ，$\dot A_u$ 掉到 $-57$。**接了负载增益变小，这是正常的**，不是故障。

**(c) 错（判反了）。** $R_C$ 开路时集电极没有电流通路，$I_C\approx0$，$R_C$ 上压降为零，集电极电位应**升高到接近 $V_{CC}$**。测到 $V_C$ 偏低说明 $I_C$ 偏大——可能是基极偏置过高把管子推近饱和，也可能是 $R_C$ 阻值变小。判据要用 $V_{CEQ}$ 而不是单点电位：$V_{CE}\approx0.3$ V 才是饱和。

**验算**：对 (b) 作一次极限检查。令 $R_L\to0$（输出短路），则 $R_L'\to0$，$\dot A_u\to0$ ✓，符合物理——输出被短到地当然没有电压输出。这个极限检验是判断公式是否写对的最快手段。
:::

两道题做完后，本页的四件工具（Q 点、$\dot A_u$、$r_i$、$r_o$）就齐了。把它们放回一条真实的信号链上，就看得出每一件各管什么。

## 工程实例：示波器前级的信号链

一台示波器的输入衰减 + 前放，就是上面那张电路图的工程放大版：

- 探头衰减 10:1，把几百伏的信号压到示波器量程；
- 前级共射放大器提增益，用**多级级联**（级间直接耦合或电容耦合）达到 $1\ \text{mV/div}$ 的灵敏度；
- 最后一级射随做缓冲——示波器输入阻抗标称 $1\ \text{M}\Omega$，没有高阻输入级，探头一接就把被测电路拖垮了；
- 增益切换用继电器换反馈电阻，本质就是改变闭环增益（[第 6 章 · 放大电路中的反馈](feedback.md)负反馈的雏形）。

这条链上每一环对应本页的一个结论：**Q 点决定会不会失真，$\dot A_u$ 决定灵敏度，$r_i$ 决定会不会拖垮被测电路，$r_o$ 决定能带多大负载**。

信号链把四件工具的用途串起来了，接下来按踩坑频率排一遍本页的错法。

## 易错清单

按踩坑频率从高到低排，每条格式是「错误做法 → 会得到什么 → 正确做法」。

1. **直流通路与交流通路混用** → 两种错误方向：把 $R_L$ 算进静态（$V_{CEQ}$ 偏小），或把 $R_E$ 漏在动态之外 → 画两张图，电容在直流里开路、在交流里短路，$V_{CC}$ 在交流图里接地。
2. **把 $r_{be}$ 当定值** → 换了偏置或管子后增益算错一大截 → $r_{be}=300+(1+\beta)26\ \text{mV}/I_{EQ}$，先算静态 $I_{EQ}$ 再算 $r_{be}$。
3. **丢掉 $\dot A_u$ 的负号** → 后面判断反馈极性时把负反馈判成正反馈 → 共射输出倒相，符号必须写进结果。
4. **算静态 Q 点时把 $R_L$ 也算进去** → $V_{CEQ}$ 偏小，误判为饱和 → 静态时 $R_L$ 被 $C_2$ 隔断。
5. **最大不失真输出取 $\frac12V_{CC}$** → 高估可用输出 → 取两侧余量的较小值；最优 Q 点让两侧相等。
6. **以为 $A_u$ 与负载无关** → 接上负载后输出掉一半，误以为电路坏了 → $R_L'=R_C\parallel R_L$，增益显式依赖负载。
7. **旁路电容失效后乱查短路** → 增益暴跌而静态全正常，是最难查的故障之一 → 先查 $C_E$ 是否虚焊（例 2 的警告区给了定量后果）。
8. **分压式偏置不校核「够不够硬」** → $I_{R_{b1}}/I_{BQ}<5$ 时估算失效 → 验流过分压器的电流至少是 $I_B$ 的 5~10 倍。

## 自检

1. 若把本电路里的 $R_E$ 从 2 kΩ 减到 1 kΩ，$I_{CQ}$ 大致变成多少？$r_{be}$ 变大还是变小？$\dot A_u$ 的绝对值变大还是变小？
2. 为什么输出底部被削平叫「饱和失真」而不是「截止失真」？（提示：输出与集电极电位的关系里有那个负号。）
3. 你要把一个 10 kΩ 内阻的传感器接到 50 Ω 的电缆上，中间该插一级什么电路？为什么不能用共射？

## 下一步

这一页把静态、动态、失真都算过了，但默认所有电容的阻抗足够低、所有频率都一样。下一页处理「频率变了会怎样」——增益为什么会随频率掉下来。

<Prereq id="q-point-loadline" /> → [03 · 放大电路的频率响应](frequency.md)
