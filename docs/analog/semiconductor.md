---
title: 01 · 半导体器件
description: 一块本征硅怎么长出四种器件：PN 结、二极管的三个模型、稳压管的击穿区、三极管的电流分配、场效应管的开启电压与跨导。
---

# 01 · 半导体器件

<Meta time="50 min" level="核心" note="最容易错的不是公式，是「先判区再选公式」：三极管在饱和区已经不满足 I_C=βI_B，MOS 低于 V_GS(th) 则是完全关断" />

桌上放一支 LED 和一节 5 V 电源。顺着插，它亮；反过来插，它不亮。换成普通白炽灯泡，怎么插都亮。区别不在电源，也不在线，而在那个只有两个脚的小东西身上：它只让电流往一个方向走。这个「单向」不是碰巧长出来的，是一块半导体内部的电场设计出来的。

再往大处看一步。单片机要 3.3 V，电网给的是 220 V 交流，中间得降压、整流、滤波、稳压。干这四件事的器件，二极管、稳压管、三极管、MOS 管，在同一块板上各管一段，可它们全都从同一件事派生：一块半导体里，两种不同性质的区域贴在一起。

::: tip 读这页之前
欧姆定律、串并联（<Prereq id="ohm" />、<Prereq id="series-parallel" />）、KCL 与 KVL（<Prereq id="kcl" />、<Prereq id="kvl" />）、戴维南等效（<Prereq id="thevenin" />），四样凑齐就够，每一步计算都是这几样，没有新的电路定律。

符号先交代：$V_{BE}$、$V_{CE}$ 是三极管两个结的电压，$\beta$ 是电流放大系数，$V_{GS(th)}$ 是 MOS 的开启电压（阈值电压 threshold voltage：栅源电压低于它时管子完全没有沟道、$I_D=0$），$g_m$ 是跨导（transconductance：栅压变化 1 V 能引起漏极电流变化多少，单位 S），$V_T$ 是热电压，常温下约 26 mV。全部约定见[符号与约定](../guide/notation.md)，每个符号第一次出现时正文里还会再说一遍。

数学只用到指数函数与自然对数（稳压管示例里的 $\ln$）和二次方程（MOS 的 $I_D=KV_{ov}^2$），不用复数，不用微积分。

四个词先给一句话，正文第一次遇到时会展开：掺杂是往纯硅里掺极少量杂质、改变导电能力；耗尽层是 PN 结界面那一薄层缺少可动载流子的区域；正偏是把电源正极接到 P 侧；沟道是 MOS 里连通源漏的那条导电通路。
:::

## 一、从一块硅到一个结：器件是怎么来的

纯净的硅（本征半导体，intrinsic semiconductor：没掺任何杂质的硅，可动载流子极少，几乎不导电）在常温下能提供的载流电子很少。往里掺极微量的五价元素（磷、砷，外层五个电子），多出来的那个电子可以自由移动，得到 N 型半导体。掺三价元素（硼，外层三个电子），晶格里缺一个电子，这个空缺就是空穴（hole：可以看成带正电、能移动的位置），它能像正电荷一样参与导电，得到 P 型半导体。掺杂（doping：往纯硅里按百万分之一量级掺入杂质）不改变化学性质，只改导电能力。

把 P 型和 N 型贴在一起，界面附近发生两件事。N 区的电子扩散到 P 区填补空穴，P 区的空穴扩散到 N 区，界面两侧于是各留下一层不能移动的正负离子，这就是空间电荷区，也叫**耗尽层**（depletion region：这一薄层里几乎没有可动载流子）。这些固定离子建立一个从 N 指向 P 的内电场，反过来阻止扩散继续。PN 结的全部物理来源，到这里就说完了。

<FigBox title="PN 结：扩散造出耗尽层，耗尽层造出内电场" kind="结构" note="左：P 区多空穴、N 区多电子。中：界面附近的载流子互相扩散后复合，留下不能移动的正负离子（耗尽层），建立从 N 指向 P 的内电场。右：这个内电场的方向决定了只有「P 接正」才能让电流顺利通过。" >

<svg viewBox="0 0 560 230" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="sc-e" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<rect x="40" y="60" width="140" height="110" rx="6" stroke-dasharray="5 4"/>
<text x="110" y="82" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">P 区</text>
<text x="110" y="102" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">多空穴（+）</text>
<rect x="380" y="60" width="140" height="110" rx="6" stroke-dasharray="5 4"/>
<text x="450" y="82" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">N 区</text>
<text x="450" y="102" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">多电子（−）</text>
<rect x="180" y="60" width="200" height="110" fill="var(--vp-c-brand-soft)" stroke-dasharray="5 4"/>
<text x="280" y="88" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">空间电荷区（耗尽层）</text>
<text x="280" y="108" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">几乎无可动载流子</text>
<text x="204" y="140" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">⊖ 负离子</text>
<text x="356" y="140" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">⊕ 正离子</text>
<line x1="320" y1="52" x2="240" y2="52" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#sc-e)"/>
<text x="280" y="44" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">内电场 E：N → P</text>
<text x="110" y="192" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">P 区一侧</text>
<text x="450" y="192" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">N 区一侧</text>
<text x="280" y="216" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">三步链：掺杂 → 耗尽层 → 内电场 → 单向导电</text>
</svg>

</FigBox>

::: tip 整页在回答同一个问题
一块半导体上，控制电流的办法一共有几种？三种。用电压方向，结要么通要么不通；用小电流，三极管拿 $I_B$ 去换 $\beta$ 倍的 $I_C$；用电场，MOS 用栅压控制沟道宽窄。后面四种器件只是这三种办法的工程形态。抓住这一点，参数表上几十个数就不会互相打架。
:::

## 二、正偏导通、反偏截止

正偏（forward bias，外加电压使 P 侧电位高于 N 侧）：外电场与内电场相反，把耗尽层压薄，多数载流子可以源源不断穿过界面，导通。此时管压降维持在约 0.7 V（硅），这是克服内电场所需的过路费。

反偏（reverse bias，外加电压使 P 侧电位低于 N 侧）：外电场与内电场同向，把耗尽层拉宽，多数载流子被推得更远。只有极少量少数载流子（minority carrier：P 区里的电子、N 区里的空穴，数量极少）漂过界面，形成微安级漏电流，视作截止。

合起来就是那句要背的话：正偏导通、反偏截止，即**单向导电性**。更细的物理图像与三种模型的成立条件见 <Prereq id="pn-diode" />。

::: warning 这里最常犯的方向错
电流从阳极（P 侧）流入才降压 0.7 V。方向反了，要把管子当断路，而不是当一个 −0.7 V 的电源。判断办法只有一条：先假设管子导通，算出电流，看是否为正；为负就说明假设不成立，管子截止。
:::

单向导电只是一个行为。同一个结还能被利用出另外两个行为，于是长出四种器件。

## 三、四种器件：同一个结的四种用法

| 器件 | 用的是结的什么 | 控制量 | 被控量 | 关键公式 |
| --- | --- | --- | --- | --- |
| 二极管 | 单向导电 | — | 通/断 | 恒压模型 $U_D\approx0.7$ V |
| 稳压管 | 反向击穿时电压恒定 | — | 端电压 | $U_Z$ 与 $I_Z$ 几乎无关 |
| 三极管 BJT | 两个背靠背的结 + 薄基区 | 基极电流 $I_B$ | 集电极电流 $I_C$ | $I_C=\beta I_B$（仅放大区） |
| 场效应管 MOS | 栅极电场控制沟道宽度 | 栅源电压 $V_{GS}$ | 漏极电流 $I_D$ | $I_D=K(V_{GS}-V_{GS(th)})^2$ |

三条读法要先钉死，否则表里的公式没法读。

$\beta$（贝塔，电流放大系数）等于 $\beta=I_C/I_B$，常见 50~200。它不是常数：$\beta$ 随 $I_C$ 和温度明显变化，设计时按最小值、甚至折半留余量。

$V_{GS(th)}$（threshold voltage，开启电压，也叫阈值电压）：栅源电压 $V_{GS}$ 超过它，硅表面才形成连通源漏的沟道（channel：一条可以被电场调宽调窄的导电通路），管子才开始导电。低于它，$I_D=0$，管子彻底关断。CMOS 输入端不能悬空，根源就在这儿：悬空时栅压不确定，可能半开不全开，管子发热。

$g_m$（transconductance，跨导）：描述栅压每变 1 V，漏极电流变多少安，$g_m=\Delta I_D/\Delta V_{GS}$，单位是 S（西门子）。它把输入电压和输出电流联系起来，所以单位是电流除以电压。

三套公式各有各的门票，混着用必错。三极管只在放大区认 $I_C=\beta I_B$，$\beta$ 一换、温度一变，这条式子给出的数就变，所以设计要按最小值留余量。MOS 只在恒流区认 $I_D=K(V_{GS}-V_{GS(th)})^2$，$V_{GS}$ 掉到 $V_{GS(th)}$ 以下就是 $I_D=0$。稳压管更简单，只认一条：端电压 $V_Z$ 与 $I_Z$ 几乎无关。

跨导 $g_m$ 是把 $V_{ov}=V_{GS}-V_{GS(th)}$ 换算成电流变化的系数，$V_{ov}$ 大的管子 $g_m$ 也大，后面的放大器章节全靠它。

三条读法记牢，表里四行公式就不会串味。先从最简单的那只开始。

## 四、二极管：先选模型，再动手算

面对一个含二极管的电路，第一步永远不是算，是判断：题中这只管子到底导通还是截止。判断完，再按模型代值。三档模型按精度从粗到精排：

| 模型 | 导通时做法 | 什么时候用 |
| --- | --- | --- |
| 理想模型 | 压降 0 V，当导线 | 纯拓扑分析、开关电源的理想开关 |
| 恒压模型 | 硅管恒定 0.7 V（锗 0.2 V） | 工程估算首选 |
| 折线模型 | 0.7 V 再串一个导通电阻 $r_d$ | 大电流、要算功耗时 |
| 指数模型 | $I=I_S(e^{U_D/V_T}-1)$ | 精度分析、求小信号电阻 |

图上的死区落在 0 V 到 0.5 V 之间：1 mA 以下的电流几乎测不出来，所以万用表二极管档给的是导通电压，不是曲线。硅管的拐点在 0.6~0.7 V，锗管在 0.2 V，肖特基管在 0.3 V。

同样是硅管，手册给的可能是 0.7 V，实物散落在 0.6~0.75 V 之间；锗管取 0.2 V，肖特基管取 0.3 V 左右。估算够用，别当成精确值。

为什么允许把 0.7 V 当常数？因为指数曲线在大电流区非常陡：电流差几十倍，压降才差 0.1 V 左右。把非线性压平成常数，收益就来自这里（推导见 <Prereq id="pn-diode" />）。

<FigBox title="二极管的伏安特性：0.7 V 这个估算值的来历" kind="曲线" note="硅管在 0~0.5 V 几乎无电流（死区）；超过之后电流沿指数曲线急剧上升。在 mA 量级的正常工作区，曲线极陡，所以「压降恒定 0.7 V」是很好的近似；锗管的拐点在 0.2 V 左右，肖特基管更低。" >

<svg viewBox="0 0 480 260" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="60" y1="220" x2="440" y2="220" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<line x1="60" y1="220" x2="60" y2="20" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="444" y="234" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">U_D / V</text>
<text x="46" y="26" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I / mA</text>
<polyline points="60.0,218.0 80.0,217.6 100.0,217.0 120.0,215.6 140.0,212.4 160.0,203.0 180.0,178.0 200.0,132.0 220.0,86.0 240.0,58.0 260.0,44.0 280.0,36.0 300.0,32.0 320.0,30.0 340.0,29.0 360.0,28.4 380.0,28.0" stroke="var(--vp-c-brand-1)" stroke-width="2.2" fill="none"/>
<line x1="220" y1="86" x2="220" y2="220" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3"/>
<text x="224" y="238" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">0.7 V</text>
<text x="196" y="72" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">mA 级工作区</text>
<rect x="60" y="20" width="46" height="200" fill="var(--vp-c-brand-soft)" stroke="none" opacity="0.5"/>
<text x="83" y="222" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">死区</text>
<text x="380" y="52" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">曲线很陡</text>
<text x="270" y="256" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">工程估算把这一段压平成一条 0.7 V 的竖线</text>
</svg>

</FigBox>

顺手算一笔小账：5 V 电源串一只硅管，输出只剩 4.3 V；串一只锗管，剩 4.8 V。驱一支 20 mA 的 LED，这 0.7 V 就是 14 mW 的热量，管子封装得按这个数选。

有了「导通时压降 0.7 V」这条，第一个直接应用就是限幅：把输出摁在安全线以内。

::: tip 例 1 · 二极管限幅电路：负半周去哪了 {#ex-semi-1}
题目：输入 $u_i=10\sin\omega t$ V，经一只硅二极管（恒压模型 0.7 V）限幅后再输出，如图所示。求输出波形与输出峰值。

<FigBox title="例 1 的电路：一只二极管串在输出回路里" kind="电路" note="二极管只在 u_i 高于 0.7 V 时才导通；低于 0.7 V（含整个负半周）时它相当于断路，输出回路被切断，输出电压为 0。" >

<svg viewBox="0 0 470 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="sc-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<text x="30" y="80" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">u</text>
<text x="37" y="88" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">i</text>
<g transform="translate(48 82)">
<circle cx="0" cy="0" r="16" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M -9 -16 L -9 16 M -9 -8 L 9 0 M -9 8 L 9 0" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
</g>
<text x="66" y="52" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">正弦源</text>
<line x1="64" y1="82" x2="150" y2="82"/>
<text x="160" y="62" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">D</text>
<g transform="translate(160 82)">
<polygon points="-10,-10 -10,10 8,0" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="8" y1="-10" x2="8" y2="10" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
</g>
<text x="160" y="104" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">阳极←</text>
<line x1="170" y1="82" x2="300" y2="82"/>
<line x1="170" y1="82" x2="286" y2="82" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#sc-a)"/>
<text x="228" y="66" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-it">i</text>
<line x1="300" y1="82" x2="300" y2="132"/>
<g transform="translate(300 152) rotate(90)">
<line x1="-26" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="26" y2="0"/>
</g>
<line x1="300" y1="172" x2="300" y2="182"/>
<text x="286" y="152" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="300" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">负载</text>
<line x1="48" y1="82" x2="48" y2="182"/>
<line x1="48" y1="182" x2="300" y2="182"/>
<circle cx="352" cy="132" r="4" class="sf-dot"/>
<line x1="300" y1="132" x2="346" y2="132"/>
<text x="386" y="132" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="397" y="140" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<line x1="352" y1="132" x2="352" y2="182"/>
<circle cx="352" cy="182" r="4" class="sf-dot"/>
</svg>

</FigBox>

先猜什么：这是一个分段电路，不是线性电路。所以方法只有一条，分段讨论：正半周看导通，负半周看截止，各算一段，再把两段拼起来。为什么不能整体套公式：二极管的伏安关系不是一条直线，欧姆定律在整区间上不成立；只有先判通断，才能在每一段里把管子换成一个线性模型。

第一步，判断导通条件。二极管的阳极接着信号源，只有当 $u_i$ 高于 0.7 V 时阳极才够正，管子才会通。所以导通区间是 $|u_i|>0.7$ V 的正半周部分。

第二步，正半周输出。导通时管子压降恒为 0.7 V，输出被钳在

$$
u_o=u_i-0.7\quad\Rightarrow\quad u_{o,\text{峰}}=10-0.7=9.3\ \text{V}
$$

（为什么是减不是加：电流从阳极流向阴极时，阳极电位比阴极高 0.7 V；阴极侧就是输出端，所以输出比输入低 0.7 V。）

第三步，负半周输出。$u_i<0.7$ V 时管子截止，回路断开，负载上没有电流，$u_o=0$。整个负半周被切掉。

<FigBox title="例 1 的输入输出波形：负半周被整段削掉，正半周削掉 0.7 V" kind="波形" note="虚线是输入 ±10 V 正弦，实线是输出：负半周为零，正半周峰值 9.3 V。注意峰值不是 10 V 而是 9.3 V，差的这 0.7 V 就是二极管的过路费。" >

<svg viewBox="0 0 500 210" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="40" y1="120" x2="470" y2="120" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<line x1="40" y1="120" x2="40" y2="26" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<polyline stroke="var(--vp-c-text-3)" stroke-width="1.4" fill="none" stroke-dasharray="4 3" points="40.0,120.0 42.3,115.8 44.6,111.6 46.8,107.5 49.1,103.5 51.4,99.5 53.7,95.6 55.9,91.8 58.2,88.2 60.5,84.7 62.8,81.4 65.1,78.3 67.3,75.4 69.6,72.7 71.9,70.3 74.2,68.0 76.4,66.1 78.7,64.4 81.0,62.9 83.3,61.8 85.6,60.9 87.8,60.3 90.1,60.0 92.4,60.0 94.7,60.3 96.9,60.9 99.2,61.8 101.5,62.9 103.8,64.4 106.1,66.1 108.3,68.0 110.6,70.3 112.9,72.7 115.2,75.4 117.4,78.3 119.7,81.4 122.0,84.7 124.3,88.2 126.6,91.8 128.8,95.6 131.1,99.5 133.4,103.5 135.7,107.5 137.9,111.6 140.2,115.8 142.5,120.0 144.8,124.2 147.1,128.4 149.3,132.5 151.6,136.5 153.9,140.5 156.2,144.4 158.4,148.2 160.7,151.8 163.0,155.3 165.3,158.6 167.6,161.7 169.8,164.6 172.1,167.3 174.4,169.7 176.7,172.0 178.9,173.9 181.2,175.6 183.5,177.1 185.8,178.2 188.1,179.1 190.3,179.7 192.6,180.0 194.9,180.0 197.2,179.7 199.4,179.1 201.7,178.2 204.0,177.1 206.3,175.6 208.6,173.9 210.8,172.0 213.1,169.7 215.4,167.3 217.7,164.6 219.9,161.7 222.2,158.6 224.5,155.3 226.8,151.8 229.1,148.2 231.3,144.4 233.6,140.5 235.9,136.5 238.2,132.5 240.4,128.4 242.7,124.2 245.0,120.0 247.3,115.8 249.6,111.6 251.8,107.5 254.1,103.5 256.4,99.5 258.7,95.6 260.9,91.8 263.2,88.2 265.5,84.7 267.8,81.4 270.1,78.3 272.3,75.4 274.6,72.7 276.9,70.3 279.2,68.0 281.4,66.1 283.7,64.4 286.0,62.9 288.3,61.8 290.6,60.9 292.8,60.3 295.1,60.0 297.4,60.0 299.7,60.3 301.9,60.9 304.2,61.8 306.5,62.9 308.8,64.4 311.1,66.1 313.3,68.0 315.6,70.3 317.9,72.7 320.2,75.4 322.4,78.3 324.7,81.4 327.0,84.7 329.3,88.2 331.6,91.8 333.8,95.6 336.1,99.5 338.4,103.5 340.7,107.5 342.9,111.6 345.2,115.8 347.5,120.0 349.8,124.2 352.1,128.4 354.3,132.5 356.6,136.5 358.9,140.5 361.2,144.4 363.4,148.2 365.7,151.8 368.0,155.3 370.3,158.6 372.6,161.7 374.8,164.6 377.1,167.3 379.4,169.7 381.7,172.0 383.9,173.9 386.2,175.6 388.5,177.1 390.8,178.2 393.1,179.1 395.3,179.7 397.6,180.0 399.9,180.0 402.2,179.7 404.4,179.1 406.7,178.2 409.0,177.1 411.3,175.6 413.6,173.9 415.8,172.0 418.1,169.7 420.4,167.3 422.7,164.6 424.9,161.7 427.2,158.6 429.5,155.3 431.8,151.8 434.1,148.2 436.3,144.4 438.6,140.5 440.9,136.5 443.2,132.5 445.4,128.4 447.7,124.2 450.0,120.0"/>
<polyline stroke="var(--vp-c-brand-1)" stroke-width="2.4" fill="none" points="40.0,120.0 42.3,120.0 44.6,115.8 46.8,111.7 49.1,107.7 51.4,103.7 53.7,99.8 55.9,96.0 58.2,92.4 60.5,88.9 62.8,85.6 65.1,82.5 67.3,79.6 69.6,76.9 71.9,74.5 74.2,72.2 76.4,70.3 78.7,68.6 81.0,67.1 83.3,66.0 85.6,65.1 87.8,64.5 90.1,64.2 92.4,64.2 94.7,64.5 96.9,65.1 99.2,66.0 101.5,67.1 103.8,68.6 106.1,70.3 108.3,72.2 110.6,74.5 112.9,76.9 115.2,79.6 117.4,82.5 119.7,85.6 122.0,88.9 124.3,92.4 126.6,96.0 128.8,99.8 131.1,103.7 133.4,107.7 135.7,111.7 137.9,115.8 140.2,120.0 142.5,120.0 144.8,120.0 147.1,120.0 149.3,120.0 151.6,120.0 153.9,120.0 156.2,120.0 158.4,120.0 160.7,120.0 163.0,120.0 165.3,120.0 167.6,120.0 169.8,120.0 172.1,120.0 174.4,120.0 176.7,120.0 178.9,120.0 181.2,120.0 183.5,120.0 185.8,120.0 188.1,120.0 190.3,120.0 192.6,120.0 194.9,120.0 197.2,120.0 199.4,120.0 201.7,120.0 204.0,120.0 206.3,120.0 208.6,120.0 210.8,120.0 213.1,120.0 215.4,120.0 217.7,120.0 219.9,120.0 222.2,120.0 224.5,120.0 226.8,120.0 229.1,120.0 231.3,120.0 233.6,120.0 235.9,120.0 238.2,120.0 240.4,120.0 242.7,120.0 245.0,120.0 247.3,120.0 249.6,115.8 251.8,111.7 254.1,107.7 256.4,103.7 258.7,99.8 260.9,96.0 263.2,92.4 265.5,88.9 267.8,85.6 270.1,82.5 272.3,79.6 274.6,76.9 276.9,74.5 279.2,72.2 281.4,70.3 283.7,68.6 286.0,67.1 288.3,66.0 290.6,65.1 292.8,64.5 295.1,64.2 297.4,64.2 299.7,64.5 301.9,65.1 304.2,66.0 306.5,67.1 308.8,68.6 311.1,70.3 313.3,72.2 315.6,74.5 317.9,76.9 320.2,79.6 322.4,82.5 324.7,85.6 327.0,88.9 329.3,92.4 331.6,96.0 333.8,99.8 336.1,103.7 338.4,107.7 340.7,111.7 342.9,115.8 345.2,120.0 347.5,120.0 349.8,120.0 352.1,120.0 354.3,120.0 356.6,120.0 358.9,120.0 361.2,120.0 363.4,120.0 365.7,120.0 368.0,120.0 370.3,120.0 372.6,120.0 374.8,120.0 377.1,120.0 379.4,120.0 381.7,120.0 383.9,120.0 386.2,120.0 388.5,120.0 390.8,120.0 393.1,120.0 395.3,120.0 397.6,120.0 399.9,120.0 402.2,120.0 404.4,120.0 406.7,120.0 409.0,120.0 411.3,120.0 413.6,120.0 415.8,120.0 418.1,120.0 420.4,120.0 422.7,120.0 424.9,120.0 427.2,120.0 429.5,120.0 431.8,120.0 434.1,120.0 436.3,120.0 438.6,120.0 440.9,120.0 443.2,120.0 445.4,120.0 447.7,120.0 450.0,120.0"/>
<line x1="90" y1="64" x2="470" y2="64" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3"/>
<text x="474" y="64" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">9.3 V</text>
<line x1="90" y1="60" x2="470" y2="60" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3"/>
<text x="474" y="54" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输入 10 V</text>
<text x="46" y="30" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">u/V</text>
<text x="470" y="134" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">ωt</text>
<text x="255" y="200" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">虚线 = 输入 u_i；实线 = 输出 u_o（负半周整段被切掉）</text>
</svg>

</FigBox>

验算：把三个点代回去检查。$\omega t=90^\circ$ 时 $u_i=10$ V，输出应为 $9.3$ V ✓，图上实线峰值正好对着 9.3 V 那条虚线；$\omega t=270^\circ$ 时 $u_i=-10$ V，管子反偏，$u_o=0$ ✓；$\omega t=0$ 时 $u_i=0$，$u_o=0$ ✓。验算用的是「分段边界处必须连续」这一条，以及恒压模型本身的定义。

延伸一句：把 0.7 V 换成锗管的 0.2 V，输出峰值变成 9.8 V。信号在 mV 量级时（比如收音机的检波），这 0.7 V 不可忽略，所以高频小信号检波至今偏爱锗管或肖特基管。
:::

限幅用的是「正向压降恒定」。同一个结反过来还有一种恒定：击穿时电压也恒定，而且恒定得更好。

## 五、稳压管：故意工作在「危险区」

为什么有人说二极管怕反向击穿，稳压管却专门工作在反向击穿区？因为可控的击穿不损坏器件。反向电压超过某一数值时，结内载流子在强电场下发生雪崩倍增，电流急剧增大而端电压几乎不变。只要外部有限流电阻把功耗压住，这个过程可以长期稳定重复。

于是两者的分工很清楚。普通二极管反向击穿就是永久损坏，必须避免。稳压管（齐纳二极管，Zener diode：专门设计工作在反向击穿区的二极管）反向击穿就是正常工作点，符号的区别是阴极那道折线改成「⏊」形。

工程用法的关键是一颗限流电阻 $R$。它承担多余的电压，同时把穿透管子的电流限制在安全范围内。

<FigBox title="稳压管电路：R 承担多余的电压，同时限定电流" kind="电路" note="三个电流的关系：I_R = I_Z + I_L。输入升高或负载变轻时，多出来的电流全部被稳压管吸走（I_Z 变大），输出电压几乎不变，这就是稳压的整个秘密。" >

<svg viewBox="0 0 470 240" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="sc-z" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="70" y1="60" x2="70" y2="190" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 62 60 L 78 60" stroke="var(--vp-c-text-1)" stroke-width="2.6"/>
<path d="M 66 74 L 74 74" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="56" y="105" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">V</text>
<text x="63" y="113" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">S</text>
<text x="70" y="44" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
<line x1="70" y1="60" x2="170" y2="60"/>
<g transform="translate(200 60)">
<line x1="-30" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="30" y2="0"/>
</g>
<line x1="230" y1="60" x2="330" y2="60"/>
<text x="200" y="42" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="200" y="80" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">限流电阻</text>
<circle cx="330" cy="60" r="4" class="sf-dot"/>
<text x="318" y="44" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">a</text>
<line x1="330" y1="60" x2="330" y2="100"/>
<g transform="translate(330 122) rotate(-90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<polygon points="-10,-10 -10,10 8,0" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 8 -11 L 8 11" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
<path d="M 8 -11 L 15 -11 M 8 11 L 15 11" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
<line x1="12" y1="0" x2="26" y2="0"/>
</g>
<line x1="330" y1="144" x2="330" y2="190"/>
<text x="352" y="122" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">D</text>
<text x="365" y="130" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">Z</text>
<text x="352" y="140" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">阴极在上（反接）</text>
<line x1="330" y1="60" x2="410" y2="60"/>
<line x1="410" y1="60" x2="410" y2="120"/>
<g transform="translate(410 150) rotate(90)">
<line x1="-30" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="30" y2="0"/>
</g>
<line x1="410" y1="180" x2="410" y2="190"/>
<text x="396" y="150" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="386" y="158" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">L</text>
<line x1="70" y1="190" x2="410" y2="190"/>
<text x="318" y="208" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">b</text>
<line x1="236" y1="60" x2="312" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#sc-z)"/>
<text x="229" y="86" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-it">I</text>
<text x="237" y="94" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">R</text>
<text x="240" y="224" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_R = I_Z + I_L：KCL 在结点 a 上成立</text>
</svg>

</FigBox>

结点 a 处按 KCL 有 $I_R=I_Z+I_L$。稳压的全部机制就在这一条式子里：输入或负载一变，差额由 $I_Z$ 吸收。设计 $R$ 时要同时卡住两头，下限保住 $I_Z$ 不低于维持电流（手册上常记 $I_{Z\min}$，本例取 5 mA），上限保住功耗不超限。两个极端的 $I_Z$ 都得算出来，只算一头等于没算。

::: tip 例 2 · 稳压管限流电阻的两个约束 {#ex-semi-2}
题目：$V_S=12$ V（允许 ±10% 波动）、$V_Z=6$ V、负载 $R_L=1\ \text{k}\Omega\sim\infty$，要求稳压管电流始终不低于 $I_{Z\min}=5$ mA。选限流电阻 $R$ 并校核功耗。

<FigBox title="例 2 的两个工况：一头是饿死，一头是烧坏" kind="结构" note="同一个 R，在两种极端工况下给出两个 I_Z。下限工况（输入最低 10.8 V + 负载最重 6 mA）给出最小值 7.33 mA，必须不低于维持电流 5 mA；上限工况（输入最高 13.2 V + 负载开路）给出最大值 20 mA，必须不超过管子的功耗上限。" >

<svg viewBox="0 0 500 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="130" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">下限工况：最容易「饿死」</text>
<rect x="30" y="42" width="200" height="164" rx="8" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-dasharray="5 4"/>
<text x="130" y="72" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输入最低 V_S = 10.8 V</text>
<text x="130" y="92" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">负载最重 I_L = 6 mA</text>
<line x1="60" y1="110" x2="200" y2="110" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="130" y="132" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">I_R = (10.8 − 6) / R</text>
<text x="130" y="152" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">= 13.33 mA（R = 360 Ω）</text>
<text x="130" y="180" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_Z = 13.33 − 6</text>
<text x="130" y="198" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">= 7.33 mA ✓ > 5 mA</text>

<text x="370" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">上限工况：最容易「烧坏」</text>
<rect x="270" y="42" width="200" height="164" rx="8" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-dasharray="5 4"/>
<text x="370" y="72" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输入最高 V_S = 13.2 V</text>
<text x="370" y="92" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">负载开路 I_L = 0</text>
<line x1="300" y1="110" x2="440" y2="110" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="370" y="132" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">I_R = (13.2 − 6) / R</text>
<text x="370" y="152" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">= 20 mA（R = 360 Ω）</text>
<text x="370" y="180" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">P_Z = 6 V × 20 mA</text>
<text x="370" y="198" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">= 120 mW（选 1/2 W）</text>
<text x="250" y="234" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">一个 R 要同时满足两侧：下限定 R 的上限，上限定功耗的账</text>
</svg>

</FigBox>

先猜什么：这不是求一个数的题，是选一个数让两个不等式同时成立的题。所以先把两头的最坏工况找出来：下限工况是输入最低加负载最重，此时电流最少，$I_Z$ 最容易被饿死；上限工况是输入最高加负载开路，电流全灌进管子，容易烧。为什么分两头找：一个 $R$ 要同时满足电流够和功耗不超，前者要求 $R$ 小，后者要求 $R$ 大，方向相反，只能各算一次再取交集。

第一步，下限工况，得到 $R$ 的上限。

输入最低 $V_{S\min}=12\times0.9=10.8$ V；负载最重 $R_L=1\ \text{k}\Omega$，此时 $I_{L\max}=6/1000=6$ mA。

$$
I_{R\min}=\frac{V_{S\min}-V_Z}{R},\qquad I_{Z}=I_{R\min}-I_{L\max}\ge 5\ \text{mA}
$$

$$
\frac{10.8-6}{R}\ge 5+6\;\Rightarrow\; R\le\frac{4.8}{11}\ \text{k}\Omega=436\ \Omega
$$

（为什么这一步给出的是上限：为了让电流够，$R$ 不能太大。这条不等式定的是最大允许多大。）

第二步，取标称值并校验上限工况。

取 $R=360\ \Omega$（比 436 Ω 小的常用标称值）。输入最高 $V_{S\max}=12\times1.1=13.2$ V、负载开路（$I_L=0$）时：

$$
I_{Z\max}=\frac{13.2-6}{360}=\frac{7.2}{360}=20\ \text{mA}
$$

下限工况再算一遍：$I_{Z\min}=\dfrac{10.8-6}{360}-6=13.33-6=7.33$ mA，仍大于 5 mA ✓。

第三步，功耗校核，这也是选封装的依据。

| 器件 | 最坏功耗 | 计算 | 选型 |
| --- | --- | --- | --- |
| 限流电阻 $R$ | $(13.2-6)^2/360$ | $144$ mW | 选 1/2 W |
| 稳压管 $D_Z$ | $V_Z\times I_{Z\max}=6\times20$ mA | $120$ mW | 选 1/2 W |

（为什么按上限工况校核功耗：功耗与电流平方（电阻）或一次方（管子）正相关，电流最大那一刻就是最热的一刻。）

第四步，失效模式检查，最容易漏的一步。

若负载跌到 $300\ \Omega$，$I_L=6/300=20$ mA，而此时最小供流只有 $I_{R\min}=13.33$ mA。需求超过供给，$I_Z$ 被迫降到 0 以下，管子退出击穿，稳压失败。标题里说的「饿死」就是这件事。

验算：把 $R=360\ \Omega$ 代回第一式，$I_{R\min}=13.33$ mA、$I_{L\max}=6$ mA，得 $I_Z=7.33\ \text{mA}>5$ mA ✓。这条式子验的是 KCL，结点 a 上电流收支必须平衡，且 $I_Z$ 落在允许区间内。独立验算：管子两端电压始终被钉在 6 V，代入负载支路得 $I_L=6/1000=6$ mA，与上面算出的所有电流值自洽 ✓。

最该带走的一句：限流电阻必须按最坏工况算。只算标称值，电网一波动或负载一跳变就失手。
:::

> 为什么要用这么啰嗦的两头算
> 稳压管的生命线两头都不能碰：电流太小，退出击穿，不稳压；电流太大，过热烧毁，永久损坏。只有一个约束的器件，设计一个参数就够；有两个约束的器件，必须算两次。这个思路后面设计三极管偏置、设计 MOS 驱动电阻会反复用到。

二极管与稳压管都是两端器件，控制不了别的电流。要做出能放大的东西，得有三个极。

## 六、三极管：用小电流搬大电流

双极型三极管（BJT，Bipolar Junction Transistor）内部是两个背靠背的 PN 结，中间夹一层极薄的基区，结构上分三个极：发射极 E、基极 B、集电极 C。它的巧妙之处在于基极电流只需要很小：发射结正偏时，从发射区注入的多数载流子几乎全部穿过薄基区被集电极收集，只有极少部分在基区复合形成 $I_B$。于是 $I_C$ 与 $I_B$ 的比例基本恒定：

$$
I_C=\beta I_B,\qquad I_E=I_B+I_C=(1+\beta)I_B
$$

这里的 $\beta$（beta，共射电流放大系数）就是「一个基极电子能带动多少个集电极电子」，典型 50~200。它会随 $I_C$ 与温度变化，可能腰斩，所以设计时要按最小值折算留余量。规格书上给的是 $\beta$ 的一个范围，不是一个数，这就是设计要按最坏那一端算的原因。

拿 $I_B$ 买 $I_C$，汇率就是 $\beta$。可这张汇率表只在放大区有效，出了放大区，$I_C=\beta I_B$ 立刻作废。

但这条公式有一个前提：管子必须在放大区。

### 三个工作区

| 发射结 | 集电结 | 状态 | 特征 |
| --- | --- | --- | --- |
| 正偏 | 反偏 | 放大区 | $I_C=\beta I_B$，$V_{CE}$ 随 $I_B$ 增大而减小 |
| 正偏 | 正偏 | 饱和区 | $I_C$ 到顶（受 $V_{CC}/R_C$ 限制），$V_{CE}\approx0.3$ V，c-e 当开关用 |
| 反偏 | 反偏 | 截止区 | $I_B\le0$、$I_C\approx0$，c-e 当断开用 |

放大是线性区，饱和与截止是开关区。[第 2 章 · 基本放大电路](amplifiers.md)用放大区；数字电路的驱动、继电控制用开关区（见[电工学 20-22 章](../ee/07-control/relay.md)）。

避开这个坑的办法只有一句：把三极管当成一个由 $I_B$ 控制开度的阀门，而流过它的水量由上游水压和管路决定。想开多大是控制量，最多能开多大是电路的天花板，两件事分开算。工作区判据见 <Prereq id="bjt-regions" />。

<FigBox title="三极管的三个区：同一个管子，两套完全不同的公式" kind="结构" note="左：截止区，阀门关死，I_C≈0，c-e 相当于断开。中：放大区，阀门半开，I_C 由 I_B 线性决定。右：饱和区，阀门已全开，I_C 被 R_C 限死，再增大 I_B 也没用，c-e 相当于闭合。" >

<svg viewBox="0 0 560 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<rect x="24" y="30" width="160" height="180" rx="8" stroke-dasharray="5 4"/>
<text x="104" y="50" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">截止区（开关：断）</text>
<line x1="60" y1="100" x2="150" y2="100"/>
<line x1="105" y1="100" x2="105" y2="150"/>
<line x1="105" y1="150" x2="150" y2="150"/>
<line x1="140" y1="100" x2="142" y2="102" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<circle cx="105" cy="150" r="4" class="sf-dot"/>
<path d="M 100 106 L 110 106 M 105 106 L 105 116" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="3 2"/>
<text x="104" y="176" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_B ≤ 0，沟道不通</text>
<text x="104" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_C ≈ 0</text>

<rect x="200" y="30" width="160" height="180" rx="8" stroke="var(--vp-c-brand-1)" stroke-width="2"/>
<text x="280" y="50" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">放大区（线性）</text>
<line x1="236" y1="100" x2="326" y2="100"/>
<line x1="281" y1="100" x2="281" y2="150"/>
<line x1="281" y1="150" x2="326" y2="150"/>
<circle cx="281" cy="150" r="4" class="sf-dot"/>
<line x1="288" y1="150" x2="322" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<path d="M 316 150 L 309 146.6 L 309 153.4 Z" class="sf-solid"/>
<text x="300" y="134" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-it">I</text>
<text x="306" y="142" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">C</text>
<text x="280" y="176" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">发射结正偏、集电结反偏</text>
<text x="280" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_C = β I_B</text>

<rect x="376" y="30" width="160" height="180" rx="8" stroke-dasharray="5 4"/>
<text x="456" y="50" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">饱和区（开关：通）</text>
<line x1="412" y1="100" x2="502" y2="100"/>
<line x1="457" y1="100" x2="457" y2="150"/>
<line x1="457" y1="150" x2="502" y2="150"/>
<circle cx="457" cy="150" r="4" class="sf-dot"/>
<line x1="440" y1="150" x2="498" y2="150" stroke="var(--vp-c-text-1)" stroke-width="3.4"/>
<text x="470" y="134" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">被 R_C 限死</text>
<text x="456" y="176" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">两个结都正偏</text>
<text x="456" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">V_CE ≈ 0.3 V</text>
<text x="280" y="234" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">同一个管子：「怎样偏置」决定它该用哪一套公式</text>
</svg>

</FigBox>

::: tip 例 3 · 三极管的电流分配与工作区判断 {#ex-semi-3}
题目：$\beta=100$、$I_B=20\ \mu$A，$V_{CC}=12$ V、$R_C=3\ \text{k}\Omega$。求 $I_C$、$I_E$、$V_{CE}$，并判断工作区；若 $I_B$ 增大到 $60\ \mu$A，重判。

<FigBox title="例 3 的电路：一个电流分配关系加一个回路约束" kind="电路" note="左侧回路给出 I_B；右侧回路决定 I_C 的上限：V_CC 全部落在 R_C 上时电流最大（4 mA）。中间的三极管只有在放大区里才服从 I_C = βI_B，判区就是判断这条关系还成不成立。" >

<svg viewBox="0 0 470 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="sc-x" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="60" y1="40" x2="330" y2="40"/>
<text x="60" y="24" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+V_CC = 12 V</text>
<line x1="230" y1="40" x2="230" y2="46"/>
<g transform="translate(230 60) rotate(90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="230" y1="74" x2="230" y2="120"/>
<text x="208" y="60" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_C = 3 kΩ</text>
<path d="M 226 116 L 226 68" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#sc-x)"/>
<text x="242" y="96" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">I</text>
<text x="249" y="105" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">C</text>
<line x1="230" y1="120" x2="230" y2="146" stroke="var(--vp-c-text-1)" stroke-width="2"/>
<line x1="230" y1="128" x2="176" y2="140"/>
<line x1="230" y1="142" x2="176" y2="154"/>
<line x1="176" y1="140" x2="176" y2="154" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 184 152 L 176 154 L 181.5 147 Z" class="sf-solid"/>
<line x1="176" y1="154" x2="176" y2="200"/>
<text x="196" y="176" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T</text>
<line x1="120" y1="140" x2="176" y2="140"/>
<line x1="120" y1="140" x2="120" y2="200"/>
<line x1="106" y1="200" x2="134" y2="200" stroke-width="2.2"/>
<line x1="112" y1="207" x2="128" y2="207" stroke-width="1.8"/>
<line x1="117" y1="214" x2="123" y2="214" stroke-width="1.8"/>
<text x="92" y="132" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">I</text>
<text x="99" y="141" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">B</text>
<path d="M 100 154 L 116 154" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#sc-x)"/>
<text x="92" y="170" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">= 20 μA</text>
<line x1="60" y1="200" x2="330" y2="200"/>
<line x1="60" y1="40" x2="60" y2="212"/>
<line x1="48" y1="212" x2="72" y2="212" stroke-width="2.2"/>
<line x1="54" y1="219" x2="66" y2="219" stroke-width="1.8"/>
<line x1="59" y1="226" x2="61" y2="226" stroke-width="1.8"/>
<text x="296" y="124" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">天花板 = V_CC / R_C</text>
<text x="296" y="146" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">= 12 / 3 k = 4 mA</text>
<text x="210" y="240" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">需求 I_C = βI_B = 2 mA 与 天花板 4 mA 比大小，谁小听谁的</text>
</svg>

</FigBox>

先猜什么：求三个电流只要一个式子，可判工作区要两个数，需求和天花板。所以动作顺序是固定的：先按 $\beta$ 算出需求 $I_C$，再按外部电路算出天花板，最后比大小。为什么第二步不能省：$I_C=\beta I_B$ 只在放大区成立，未经检验就直接用，是模电最常见的分析错误。

第一步，算需求。假设管子在放大区：

$$
I_C=\beta I_B=100\times20\ \mu\text{A}=2.0\ \text{mA},\qquad I_E=(1+\beta)I_B=101\times20\ \mu\text{A}=2.02\ \text{mA}
$$

注意 $I_E=2.02$ mA 比 $I_C=2.0$ mA 只大一点点，差的正好是那 $20\ \mu$A 的基极电流。

第二步，算天花板。基极要求再大的电流也没用，集电极能拿到的最大电流，只能是把 $V_{CC}$ 全部降在 $R_C$ 上的那一个：

$$
I_{C(\max)}=\frac{V_{CC}}{R_C}=\frac{12}{3\ \text{k}\Omega}=4.0\ \text{mA}
$$

第三步，比较并判决。需求 $2.0$ mA 小于天花板 $4.0$ mA，管子在放大区，此时

$$
V_{CE}=V_{CC}-I_CR_C=12-2.0\ \text{mA}\times3\ \text{k}\Omega=6.0\ \text{V}
$$

第四步，换条件重判。$I_B=60\ \mu$A 时需求 $I_C=100\times60\ \mu\text{A}=6.0$ mA，超过天花板 4.0 mA，管子饱和。此时 $I_C$ 不再等于 $\beta I_B$，而是被摁在 4.0 mA，$V_{CE}\approx0.3$ V。

验算：用 KVL 检查放大区的解。沿 $V_{CC}\to R_C\to \text{c-e}\to$ 地这一圈，$12-2.0\ \text{mA}\times3\ \text{k}\Omega-6.0=12-6-6=0$ ✓。这条验算保证了 $V_{CE}$ 的计算与外部回路一致。饱和那一组再验：$12-4.0\times3-0.3=-0.3\approx0$ ✓，0.3 V 正是 $V_{CE(sat)}$ 的取值。

判区按这个顺序走：先算 $I_C=\beta I_B$，再算 $V_{CC}/R_C$ 这个天花板，谁小听谁的。
:::

三极管靠电流控制，输入端必须从信号源索取电流。信号源本身很弱时（比如电容式麦克风），这个 $I_B$ 就是负担。于是有了用电场控制的器件。

## 七、场效应管：用电压控制，输入端几乎不取电流

场效应管（FET，Field Effect Transistor，这里只讲最常见的 N 沟道增强型 MOS）的三个极是栅极 G、漏极 D、源极 S。栅极与半导体之间隔着一层绝缘的氧化物，所以直流下栅极几乎不取电流，输入电阻极高，$10^{9}\ \Omega$ 以上。它的原理是：栅压 $V_{GS}$ 为正时，把电子吸引到栅下面的硅表面，形成一条连通源漏的沟道（channel）；栅压升高，沟道变宽，导电能力跟着变强。

判据只有两条：$V_{GS}$ 跟 $V_{GS(th)}$ 比大小，$V_{DS}$ 跟 $V_{ov}$ 比大小。据此分三段：

1. 截止：$V_{GS}<V_{GS(th)}$，没有沟道，$I_D=0$；
2. 可变电阻区（三极管区）：$V_{GS}>V_{GS(th)}$ 但 $V_{DS}$ 很小，沟道完整，管子像个由栅压控制的小电阻；
3. 恒流区（饱和区）：$V_{DS}\ge V_{GS}-V_{GS(th)}$，沟道在漏端被夹断，$I_D$ 几乎不再随 $V_{DS}$ 变化，做放大器就用这一段。

在**恒流区**，漏极电流由过驱动电压 $V_{ov}=V_{GS}-V_{GS(th)}$（overdrive voltage：栅压比开启电压高出多少）决定：

$$
I_D=K\,V_{ov}^2=K\left(V_{GS}-V_{GS(th)}\right)^2
$$

这里的 $K$ 是与管子几何尺寸、工艺相关的常数（单位 mA/V²）。跨导 $g_m$（transconductance：交流下 $\Delta I_D/\Delta V_{GS}$，单位 S）由微分给出：

$$
g_m=\frac{dI_D}{dV_{GS}}=2K\,V_{ov}
$$

$g_m$ 是联系输入电压与输出电流的比例系数，是[第 2 章 · 基本放大电路](amplifiers.md)里放大倍数的核心参数。它依赖工作点：过驱动电压大的管子，跨导也大。

两种写法要分清。由定义得 $g_m=2KV_{ov}$，把 $K$ 换成 $I_D$ 得 $g_m=2I_D/V_{ov}$，两者说的是同一件事。工程上更常用后者，因为静态工作点一算完，$I_D$ 与 $V_{ov}$ 都是现成的数。放大器的增益与 $g_m$ 成正比，想提增益就得加大偏置电流，代价是功耗。

<FigBox title="MOS 的三段：V_GS(th) 决定开不开，V_ov 决定有多开" kind="结构" note="左：V_GS 低于开启电压，没有沟道，I_D=0。中：刚过阈值，沟道细窄。右：V_ov 加大，沟道变宽，注意漏端出现了夹断点，这就是进入恒流区的标志。" >

<svg viewBox="0 0 560 220" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<rect x="20" y="34" width="160" height="152" rx="8" stroke-dasharray="5 4"/>
<text x="100" y="52" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">① V_GS &lt; V_GS(th)</text>
<rect x="42" y="80" width="116" height="12" rx="3" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="100" y="112" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">栅极（绝缘层）</text>
<rect x="42" y="130" width="116" height="42" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="100" y="152" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">P 型衬底：无沟道</text>
<text x="100" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_D = 0（截止）</text>

<rect x="200" y="34" width="160" height="152" rx="8" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/>
<text x="280" y="52" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">② V_ov 较小</text>
<rect x="222" y="80" width="116" height="12" rx="3" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<rect x="222" y="130" width="116" height="42" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<rect x="222" y="128" width="116" height="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
<text x="280" y="152" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">薄沟道刚形成</text>
<text x="280" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">I_D ∝ V_ov²（小）</text>

<rect x="380" y="34" width="160" height="152" rx="8" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<text x="460" y="52" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">③ V_ov 大</text>
<rect x="402" y="80" width="116" height="12" rx="3" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<rect x="402" y="130" width="116" height="42" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 402 128 L 518 128 L 518 116 L 402 146 Z" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/>
<text x="452" y="160" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">沟道宽，右端夹断</text>
<text x="452" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">恒流区（放大用）</text>
<text x="280" y="216" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">栅极始终不取直流电流——输入电阻极高</text>
</svg>

</FigBox>

> 为什么 $g_m$ 与 $I_D$ 的关系重要
> 由上面两式消去 $K$ 可得 $g_m=2\sqrt{KI_D}$，也就是 $g_m$ 随 $\sqrt{I_D}$ 增长。想把 MOS 放大器的增益翻倍，光加偏置电流的收益只有平方根。这个收益递减后面在[第 3 章 · 放大电路的频率响应](frequency.md)讨论增益带宽权衡时还会再遇到一次。

::: tip 例 4 · 增强型 MOS 的恒流区计算 {#ex-semi-4}
题目：N 沟道增强型 MOS，$V_{GS(th)}=2$ V、跨导参数 $K=0.5\ \text{mA/V}^2$。当 $V_{GS}=4$ V、$V_{DS}=6$ V 时，求 $I_D$、$g_m$ 并判断工作区；若 $V_{GS}$ 掉到 1.5 V，结果如何？

<FigBox title="例 4 的判据：先比 V_GS(th)，再校核 V_DS" kind="结构" note="两条坐标轴把 MOS 的状态分成三块：V_GS 低于开启电压是截止；高于它但 V_DS 小是可变电阻区；高于它且 V_DS ≥ V_ov 是恒流区。本题 V_GS=4 V、V_DS=6 V，落在右上角的恒流区。" >

<svg viewBox="0 0 480 280" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="70" y1="230" x2="440" y2="230" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<line x1="70" y1="230" x2="70" y2="30" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="446" y="244" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_DS</text>
<text x="56" y="22" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_GS</text>
<line x1="180" y1="230" x2="180" y2="30" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="180" y="248" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">V_GS(th) = 2 V</text>
<rect x="70" y="30" width="110" height="200" fill="var(--vp-c-bg-soft)" stroke="none" opacity="0.6"/>
<text x="125" y="140" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t sf-w700">截止区</text>
<text x="125" y="158" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_D = 0</text>
<path d="M 180 230 L 320 120 L 440 120" stroke="var(--vp-c-brand-1)" stroke-width="2" fill="none"/>
<rect x="180" y="120" width="260" height="110" fill="var(--vp-c-brand-soft)" stroke="none" opacity="0.55"/>
<text x="330" y="180" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">恒流区（饱和区）</text>
<text x="330" y="198" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_D = K·V_ov²，做放大用</text>
<path d="M 180 230 L 320 120" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-dasharray="4 3" fill="none"/>
<text x="300" y="96" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">预夹断线</text>
<text x="300" y="112" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_DS = V_GS − V_GS(th)</text>
<text x="248" y="220" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">可变电阻区</text>
<line x1="290" y1="60" x2="290" y2="230" stroke="var(--vp-c-brand-1)" stroke-width="1.4" stroke-dasharray="4 3"/>
<circle cx="290" cy="70" r="5" fill="var(--vp-c-brand-1)" stroke="none"/>
<text x="300" y="56" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">本题工作点</text>
<text x="300" y="72" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_GS = 4 V，V_DS = 6 V</text>
<text x="255" y="264" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">判断顺序：先看 V_GS 过没过阈值，再看 V_DS 够不够撑住恒流区</text>
</svg>

</FigBox>

先猜什么：动作顺序是「先比阈值，再算电流，最后校核 $V_{DS}$ 够不够撑住恒流区」。为什么最后还要校核：$I_D=KV_{ov}^2$ 是恒流区公式，只有 $V_{DS}$ 足够大时才成立；$V_{DS}$ 太小说明管子还在可变电阻区，套这个式子会高估电流。

第一步，比阈值。$V_{GS}=4$ V $>V_{GS(th)}=2$ V，管子开启，过驱动电压

$$
V_{ov}=V_{GS}-V_{GS(th)}=4-2=2\ \text{V}
$$

第二步，算电流。$I_D=K\,V_{ov}^2=0.5\times2^2=2.0$ mA。

第三步，校核 $V_{DS}$。恒流区要求 $V_{DS}\ge V_{GS}-V_{GS(th)}=V_{ov}=2$ V。实际 $V_{DS}=6$ V $>2$ V，确认在恒流区，第二步的公式有效。

第四步，算跨导。$g_m=2KV_{ov}=2\times0.5\times2=2.0$ mS。读法：栅压每增加 1 V，漏极电流约增 2 mA，这就是 $g_m$ 的含义。

第五步，改变栅压。$V_{GS}=1.5$ V $<V_{GS(th)}=2$ V，掉到开启电压 $V_{GS(th)}$ 以下，管子彻底关断，$I_D=0$、$g_m=0$。这不是电流变小，是完全不通。

验算：用 $I_D=K V_{ov}^2$ 反代检查 $V_{ov}=\sqrt{2.0/0.5}=\sqrt4=2$ V ✓，与第一步一致。再用 $g_m$ 的定义反推：在 $V_{GS}=4$ V 附近让 $V_{GS}$ 增加 0.1 V，则 $V_{ov}=2.1$ V，$I_D=0.5\times2.1^2=2.205$ mA，增量 $\Delta I_D=0.205$ mA；而 $g_m\Delta V_{GS}=2.0\ \text{mS}\times0.1=0.2$ mA ✓，两者吻合，0.005 mA 的差是二次项的高阶残差。

MOS 的输入端几乎不取电流，所以它的栅极必须始终有确定的直流路径。悬空的栅极会因静电积累停在未知电位，可能半开不全开而烧毁。CMOS 器件都要戴防静电手环，原因在这儿，双极型三极管没这么娇气。
:::

## 演示

四条结论都能变成可以拖的东西：0.7 V 这个估算值怎么来的、稳压管的工作点为什么只在竖直段上滑、$I_B$ 怎么把 Q 点抬起来。

<DemoBox title="二极管 / 稳压管 / 三极管：三条曲线一张图" hint="二极管页签看 0.7 V 估算的来历；稳压管页签拖输入电压看工作点只在竖直段滑动；三极管页签拖 I_B 看 Q 点沿负载线上爬到饱和封顶。">
<DiodeCurveDemo />
</DemoBox>

三个页签对的是三张核心图像。二极管那张看指数曲线与负载线的交点，验证「0.7 V 是估算」这句话。稳压管那张看输入波动时工作点只在击穿区的竖直段上滑动，所以输出电压不动。三极管那张看 $I_B$ 曲线族与负载线的交点：Q 点被 $I_B$ 抬着沿负载线走，走到 $V_{CC}/R_C$ 就被摁住不再涨。

三条曲线看一遍，四种器件的行为就有了图像。

## 工程实例：一块电路板上的四种管子

打开一台普通的开关电源适配器，四种器件都在：

- 整流桥里的四个二极管：把交流切成单向（见[电工学 23 章](../ee/08-electronics/rectifier.md)），工作在开关区，用的是第一层行为「单向导电」；
- 功率三极管或 MOS：高频开关，饱和与截止两态来回切（[PWM 调速](../digital/ad-da.md)是同一思想），用的是三个工作区；
- 稳压管或 TL431：采样反馈回路的基准电压源，用反向击穿，就是例 2 的实际应用；
- 运放：误差放大器，比较输出采样与基准，一个运放内部就有十几对差分管（[第 5 章 · 集成运算放大电路](opamp.md)的主角）。

四种器件在一块板上各占一段。选型的依据就是上面那四条：要不怕反接，用二极管；要稳定的参考，用稳压管；要线性放大，用三极管的放大区；要高效率开关，用 MOS 的饱和与截止。

## 易错清单

按踩坑频率从高到低排，每条格式是「错误做法 → 会得到什么 → 正确做法」。

1. 不管工作区直接套 $I_C=\beta I_B$ → 在饱和时算出远大于实际的电流 → 先算需求 $I_C=\beta I_B$，再算天花板 $V_{CC}/R_C$，谁小听谁的。
2. 二极管导通压降方向搞反 → 把一个 0.7 V 的电源当成断路，或者反过来把断路算成导通 → 电流必须从阳极（P 侧）流入才降 0.7 V；不确定就先假设导通，算出的电流为负说明它截止。
3. 稳压管反接当普通二极管用 → 正偏时它反倒像个普通二极管，失去稳压能力 → 稳压管的工作点在反向击穿区，符号上阴极那道线是折线。
4. 以为 $\beta$ 是常数 → 温度一变工作点漂出放大区 → $\beta$ 随 $I_C$ 与温度明显变化，设计时按最小值（甚至 $\beta/2$）留余量。
5. 限流电阻只按标称输入算 → 电网波动或负载跳变时稳压失效，或者管子烧毁 → 下限工况（低输入加负载）与上限工况（高输入加空载）各算一次。
6. MOS 栅极悬空 → 静电使栅压不确定，管子半开不全开而过热烧毁 → 栅极必须有确定的直流通路；拆封、焊接前先放电。
7. 把 $V_{GS(th)}$ 当成「刚开始有一点点电流」的电压 → 用它估算电流会得到偏小的结果 → 它是沟道形成的门槛，电流由超过它多少（$V_{ov}$）的平方决定。

## 自检

1. 一个 $V_{CC}=12$ V、$R_C=3\ \text{k}\Omega$、$\beta=100$ 的电路，$I_B$ 从 0 增到 $80\ \mu$A。在哪一个 $I_B$ 上管子进入饱和？进入之后 $I_C$ 是多少？
2. 稳压管电路里负载开路和输入升高，哪一个让管子更容易烧？为什么它与第 5 条的最坏工况一致？
3. $V_{GS(th)}=2$ V、$K=0.5\ \text{mA/V}^2$ 的 MOS，$V_{GS}$ 从 3 V 加到 5 V，$I_D$ 变为原来的几倍？$g_m$ 呢？（提示：两条都是与 $V_{ov}$ 的关系，但幂次不同。）
4. 3 只硅管串联，每只按恒压模型 0.7 V 算，总压降是多少？把其中 1 只接反，输出又会怎样？

## 下一步

单个器件怎么算，到这里就齐了。可单个器件还放大不了信号，它需要被放进一个电路里，给一个稳定的工作电压，再把交流信号叠上去。

<Prereq id="q-point-loadline" /> → [02 · 基本放大电路](amplifiers.md)
