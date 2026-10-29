---
title: 08 · 波形的发生和变换
---

# 08 · 波形的发生和变换

<Meta time="50 min" level="核心" note="相位条件与幅值条件是两个独立条件，漏查任何一个都不起振" />

设想一个场景：你把示波器的探头接到电路输出，发现没有信号源的地方，屏幕上却浮着一个漂亮的正弦波，频率还不低。同一台示波器换个探头点，又什么都没了。它到底在测信号，还是电路自己造了一个信号？

更常见的是家用收音机：没有外接信号源，喇叭里却有节目。这台机器的「信号源」是它自己的振荡电路，它造出一个高频正弦，再从天线收到的调制信号里去「搬」频率。造得出这个正弦，功放才有得放；造不出，喇叭就是哑的。

放大电路的工程师最头痛自激振荡，信号发生器的工程师却天天设计正弦振荡，两者是同一件事的正反面。判据也只有一条：环路回到起点时相位转了整圈、幅值不小于 1，输出就能自己长起来。会写振荡频率公式、会判断某个环路起不起振、能解释 RC 与石英的频率稳定度为什么差三个数量级、能用两个方块搭出方波与三角波发生器，这页的东西就算拿到了。

::: tip 读这页之前
需要会正弦量与相量（<Prereq id="sine-params" />、<Prereq id="complex-number" />）、RLC 谐振与品质因数 $Q$（[第 09 章 · RLC 与阻抗](../ee/04-ac/rlc.md)）、负反馈与反馈深度（[第 6 章](feedback.md)）。

最要紧的一张卡是 <Prereq id="virtual-short" />。非正弦波发生器的两块积木里，迟滞比较器工作在非线性区，积分器工作在**线性区**，虚短只在积分器那半边成立，两边混用会算出完全不搭界的数。

复数只用到「幅值与相位分开看」这一条，不需要复杂运算。没学过先看 <Prereq id="complex-number" />，5 分钟够。

符号先定死（约定见[符号与约定](../guide/notation.md)）：

- $f_0$：振荡频率。
- $AF$：**环路增益**，信号沿环路走一圈回到起点的总增益。
- $F$：反馈系数，反馈网络自己的分压比。
- $R_f$、$R_1$、$C$、$L$：决定频率与增益的那几个元件。
- $Q$：品质因数，谐振锐度。
- $U_Z$：稳压管限幅值。
:::

## 振荡的两个条件：先问相位，再问幅值

把整个环路拆成「放大器（增益 $A$）」和「选频反馈网络（系数 $F$）」。信号从放大器输入出发，绕一圈回到自己：幅值被乘了 $|AF|$，相位被转了 $\Delta\varphi$。要它自己站住，这两件事都得满足。

<FigBox title="正弦振荡环路：增益、相位、选频、稳幅四件事的位置" kind="结构" note="环路相移 360°（相位条件）与 |AF|≥1（幅值条件）必须同时成立；选频网络负责只在 f_0 处相移为零，稳幅元件负责把 |AF| 从大于 1 压回等于 1。">
<svg viewBox="0 0 760 320" role="img" aria-label="正弦振荡环路结构框图：选频网络与放大器构成环路，稳幅环节与输出">
<defs><marker id="aro" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<rect x="300" y="70" width="150" height="60" rx="8" fill="none" stroke="currentColor" stroke-width="1.8" />
<text x="375" y="96" text-anchor="middle" font-size="14" fill="currentColor">放大器</text>
<text x="375" y="116" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">增益 A、相移</text>
<rect x="120" y="70" width="150" height="60" rx="8" fill="none" stroke="currentColor" stroke-width="1.8" />
<text x="195" y="96" text-anchor="middle" font-size="14" fill="currentColor">选频网络</text>
<text x="195" y="116" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">系数 F、选 f₀</text>
<rect x="510" y="70" width="150" height="60" rx="8" fill="none" stroke="currentColor" stroke-width="1.8" />
<text x="585" y="96" text-anchor="middle" font-size="14" fill="currentColor">稳幅环节</text>
<text x="585" y="116" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">二极管/热敏电阻</text>
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="120" y1="100" x2="30" y2="100" marker-end="url(#aro)" />
<line x1="270" y1="100" x2="300" y2="100" marker-end="url(#aro)" />
<line x1="450" y1="100" x2="510" y2="100" marker-end="url(#aro)" />
<line x1="660" y1="100" x2="712" y2="100" marker-end="url(#aro)" />
<path d="M712 100 L712 190 L375 190 L375 130" marker-end="url(#aro)" />
</g>
<text x="742" y="96" font-size="14" fill="currentColor">u_o</text>
<text x="30" y="90" text-anchor="start" font-size="13" fill="currentColor">u_i</text>
<text x="545" y="205" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">反馈回到选频网络（正反馈：相移 0°）</text>
<text x="420" y="248" text-anchor="middle" font-size="13" fill="currentColor">相位条件：绕一圈相移 = 360°</text>
<text x="420" y="270" text-anchor="middle" font-size="13" fill="currentColor">幅值条件：绕一圈幅值 |AF| ≥ 1</text>
<text x="420" y="292" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">两个条件缺一不可：相位对但增益 0.5 不起振，增益够但相移不对也不起振</text>
</svg>
</FigBox>

相位条件说的是：反馈信号必须同相地加回输入端。正反馈的原点就是信号每绕一圈相位增加 360°，等价于 0°。环路总相移若是 180°，那是负反馈，输出会被自己的反馈按住，永远长不起来。这一条也解释了[第 06 章](feedback.md)里「相移累积到 360° 就自激」的病：同一个环路，相移在 180° 是安全，在 360° 是振荡。

幅值条件说的是：绕一圈后幅值不能变小（$|AF|\ge1$）。如果 $|AF|=0.5$，每圈衰减一半，那是稳定的衰减过程；只有 $|AF|>1$ 才会指数增长。但增长不能一直下去，线性元件的增益是常数，幅值会一路涨到运放饱和、波形削成平顶方波。所以稳态必须由某个非线性元件（二极管、热敏电阻、灯丝、AJC）把增益拉回来。

::: tip 起振与稳态：两个不同的机制
起振阶段靠设计留余量，$|AF|>1$，输出指数增长。上电瞬间电路里只有噪声，噪声里各个频率都有，$f_0$ 附近的分量长得最快，几百个周期后只剩它。

稳态阶段靠非线性元件。整流二极管并联在 $R_f$ 上：幅值小时二极管截止，增益高；幅值大时二极管导通分流，增益降，于是把 $|AF|$ 压回 1，幅值不再增长。

为什么「刚好等于 1」反而危险？设计时 $R_f$ 取 $2R_1$，环路增益正好 1，看着是临界；但元件公差、温度漂移只要让增益略小于 1，就永远不起振。起振余量（约 5%~10%）不是浪费，是必需的容错空间。
:::

两条判据合起来就是一句话：相位 360°，幅值 $|AF|\ge1$。起振靠 $|AF|>1$，稳态靠 $|AF|=1$，两个机制别混。它们都在 $f_0$ 处满足、在别的频率不满足，这就是选频网络的任务。

## 选频网络：为什么必须有一个

普通的放大电路，每个元件都会引入相移：耦合电容、晶体管的结电容、杂散电容，每一级都有极点和零点。这些相移随频率变化，没有任何单一频率能保证环路总相移是 360°。你想在 1 kHz 振荡，结果整个频带里 1.5 kHz、17 kHz、3 MHz 都可能恰好满足条件，输出是一堆正弦的叠加，听起来就是噪声。

选频网络在整条频带里只对一个频率给出 0° 或 360° 的相移，对其余频率给别的相移，于是振荡频率被钉死。它要做的就是在 $f_0$ 上凑够 360°，别处不给。判断它好坏的标准有两个：相移准确度，以及通带增益。

<FigBox title="三块积木：振荡器=放大器+选频网络+稳幅" kind="结构" note="同样的两块电路，换一个选频网络就得到 RC、LC 或石英振荡器；稳幅环节是三者共用的，区别只在非线性元件怎么接。">
<svg viewBox="0 0 760 240" role="img" aria-label="振荡器三块积木组合示意">
<defs><marker id="ar4" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<g font-size="13" fill="currentColor" text-anchor="middle">
<text x="130" y="40">RC 网络</text><text x="130" y="60" opacity="0.75">f₀=1/(2πRC)</text>
<text x="380" y="40">LC 回路</text><text x="380" y="60" opacity="0.75">f₀=1/(2π√LC)</text>
<text x="630" y="40">石英晶体</text><text x="630" y="60" opacity="0.75">f₀ 由切片厚度定</text>
</g>
<g stroke="currentColor" fill="none">
<rect x="70" y="75" width="120" height="52" rx="8" stroke-width="1.6" />
<rect x="320" y="75" width="120" height="52" rx="8" stroke-width="1.6" />
<rect x="570" y="75" width="120" height="52" rx="1.6" stroke-width="1.6" />
<path d="M130 127 L130 165" stroke-width="1.8" marker-end="url(#ar4)" />
<path d="M380 127 L380 165" stroke-width="1.8" marker-end="url(#ar4)" />
<path d="M630 127 L630 165" stroke-width="1.8" marker-end="url(#ar4)" />
<rect x="290" y="168" width="180" height="52" rx="8" stroke-width="1.8" />
</g>
<g font-size="13" fill="currentColor" text-anchor="middle">
<text x="130" y="107">选频网络</text><text x="380" y="107">选频网络</text><text x="630" y="107">选频网络</text>
<text x="380" y="192">同相放大器</text><text x="380" y="212" font-size="12" opacity="0.75">增益略大于 1</text>
</g>
</svg>
</FigBox>

$Q$（**品质因数**，谐振的尖锐程度）就是把这个尖峰量化成一个数：$Q=\dfrac{\text{谐振时的能量}}{\text{每周期损失的能量}}$。谐振峰有多尖全看它：$Q$ 大，曲线就尖，能量损失就小，环路增益只在 $f_0$ 附近过 1。

<FigBox title="选频网络的 Q：为什么振荡频率被钉死" kind="曲线" note="几条只有 Q 不同的谐振曲线：Q 大了，峰自然就尖，环路增益只在 f_0 附近过 1，其余频率被压到 1 以下；选频网络就是靠这条尖峰把振荡频率钉死的。">
<WavePreset kind="qfamily" />
</FigBox>

看懂这张图的方法：横轴扫过去，每条曲线在 $f_0$ 处的高度就是该频率下的 $|F|$。把放大器增益 $|A|$ 水平地画在同一张图上，两条线的交点才是真正的振荡点。$Q$ 高时交点唯一且尖锐，频率准；$Q$ 低时曲线平坦，交点附近一片范围都能过 1，频率就飘。

三种选频网络的取舍如下，稳定度那一列基本就是 $Q$ 的排行榜：

| | 文氏桥 RC | LC 变压器反馈 | 石英晶体 |
| --- | --- | --- | --- |
| 频率公式 | $f_0=1/2\pi RC$ | $f_0=1/2\pi\sqrt{LC}$ | 由切片厚度决定（标称值） |
| 典型频段 | 1 Hz ~ 数百 kHz | 数百 kHz ~ 数百 MHz | 32.768 kHz ~ 100 MHz+ |
| 稳定度 | $10^{-3}\sim10^{-2}$ | $10^{-4}\sim10^{-5}$ | $10^{-6}\sim10^{-8}$ |
| 成本/体积 | 最低 | 中 | 低（但需专用振荡电路） |
| 用途 | 音频信号源、报警音 | 收音机本振、射频 | 单片机时钟、通信基准 |

稳定度指频率相对标称值的偏离量：$10^{-3}$ 就是千分之三，1 kHz 的振荡器能偏到 997~1003 Hz。RC、LC、石英三条路线在稳定度上依次是 $10^{-3}$、$10^{-5}$、$10^{-6}$ 以上，代价落在频段与成本上。

<DemoBox title="起振、选频与稳幅：振荡器三要素演示" hint="文氏桥页签拖增益看包络怎么起振与稳幅；方波-三角波页签分别调峰值与频率；LC 页签拖 Q 看谐振曲线变尖。">
<OscillatorDemo />
</DemoBox>

三个页签把上表最难「想出来」的部分变成可拖动的：文氏桥起振时包络怎么增长、怎么衰减；方波-三角波的峰值与频率各归各管；LC 谐振曲线随 $Q$ 变尖。拖过一遍，下面三道例题就不需要额外背景。

## 三道例题：文氏桥、LC、石英

### 例 1 · 文氏桥 RC 振荡器

**题目**：$R=10\,\text{k}\Omega$、$C=0.01\,\mu\text{F}$，后级为同相放大器，$R_1=10\,\text{k}\Omega$、反馈电阻 $R_f$ 由设计决定。求振荡频率、$R_f$ 的下限，并说明为什么不能取临界值。

<FigBox title="文氏桥 RC 振荡器：串并联网络 + 同相放大器" kind="结构" note="上支路是 R 串 C、下支路是 C 并 R，构成在 f₀ 处相移为 0、反馈系数 1/3 的选频网络；右侧同相放大器增益须大于 3；二极管并联在 R_f 上做稳幅。">
<svg viewBox="0 0 760 330" role="img" aria-label="文氏桥 RC 振荡器电路原理图">
<defs><marker id="ar5" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<!-- 上支路 R 串 C -->
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="40" y1="60" x2="110" y2="60" />
<rect x="110" y="44" width="70" height="32" />
<line x1="180" y1="60" x2="240" y2="60" />
<line x1="240" y1="60" x2="278" y2="60" /><line x1="278" y1="52" x2="298" y2="52" /><line x1="288" y1="44" x2="298" y2="52" /><line x1="288" y1="68" x2="298" y2="68" />
<line x1="298" y1="60" x2="560" y2="60" />
<!-- 下支路 C 并 R -->
<line x1="40" y1="180" x2="560" y2="180" />
<rect x="110" y="164" width="70" height="32" />
<line x1="40" y1="180" x2="110" y2="180" /><line x1="180" y1="180" x2="560" y2="180" />
<line x1="278" y1="180" x2="278" y2="172" /><line x1="278" y1="172" x2="298" y2="172" /><line x1="288" y1="164" x2="298" y2="172" /><line x1="288" y1="188" x2="298" y2="188" />
</g>
<g font-size="13" fill="currentColor" text-anchor="middle">
<text x="145" y="40">R</text><text x="288" y="40">C</text><text x="145" y="216">R</text><text x="288" y="216">C</text>
</g>
<line x1="40" y1="120" x2="40" y2="180" stroke="currentColor" stroke-width="2" />
<line x1="40" y1="60" x2="40" y2="120" stroke="currentColor" stroke-width="2" />
<circle cx="40" cy="120" r="3" fill="currentColor" />
<circle cx="560" cy="60" r="3" fill="currentColor" />
<circle cx="560" cy="180" r="3" fill="currentColor" />
<line x1="560" y1="120" x2="560" y2="180" stroke="currentColor" stroke-width="2" />
<circle cx="560" cy="120" r="3" fill="currentColor" />
<line x1="560" y1="60" x2="560" y2="120" stroke="currentColor" stroke-width="2" />
<!-- 运放 -->
<path d="M600 60 L600 180 L700 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
<text x="640" y="104" font-size="12" fill="currentColor">同相</text>
<text x="640" y="150" font-size="12" fill="currentColor">放大器</text>
<text x="608" y="82" font-size="13" fill="currentColor">+</text>
<text x="608" y="166" font-size="13" fill="currentColor">−</text>
<line x1="560" y1="120" x2="600" y2="120" stroke="currentColor" stroke-width="2" />
<line x1="700" y1="120" x2="742" y2="120" stroke="currentColor" stroke-width="2" />
<text x="748" y="116" font-size="13" fill="currentColor">u_o</text>
<!-- 负反馈 Rf + 二极管 -->
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="660" y1="180" x2="660" y2="260" /><line x1="660" y1="260" x2="596" y2="260" />
<rect x="560" y="244" width="72" height="32" />
<line x1="524" y1="260" x2="470" y2="260" /><line x1="470" y1="260" x2="470" y2="140" /><line x1="470" y1="140" x2="600" y2="140" />
<line x1="596" y1="244" x2="596" y2="260" />
</g>
<text x="596" y="290" text-anchor="middle" font-size="13" fill="currentColor">R_f</text>
<line x1="628" y1="260" x2="628" y2="214" stroke="currentColor" stroke-width="2" />
<path d="M616 210 L640 210 L640 194 L662 210 L640 226 L640 210" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="672" y="212" font-size="12" fill="currentColor">稳幅二极管</text>
<text x="200" y="316" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.85">中点电位 1/3 u_o 送回同相端 ⇒ 同相放大器必须增益 &gt; 3</text>
</svg>
</FigBox>

先猜一下：选频网络在 $f_0$ 处把信号衰减到三分之一，放大器就该补回三倍，$R_f$ 大约是 $R_1$ 的两倍。剩下的只是数相位和幅值，不需要重新分析放大器内部的频率响应。相位上，串并联网络在 $f_0$ 处相移为 0，同相放大器也不引入相移，总相移天然 360°；幅值上，网络把信号衰减到 $F=1/3$，放大器必须补回 3 倍以上。

步骤：

1. $f_0=\dfrac{1}{2\pi RC}=\dfrac{1}{2\pi\times10^4\times10^{-8}}=1591.5\,\text{Hz}\approx1.59\,\text{kHz}$。
2. 网络反馈系数：$f=f_0$ 时 $R$ 与 $1/(j\omega C)$ 阻抗相等，两条支路对称，$F=\dfrac13$。
3. 同相放大器增益 $A=1+\dfrac{R_f}{R_1}$，幅值条件要求 $A\cdot F>1$，即 $A>3$，故 $\dfrac{R_f}{R_1}>2$，$R_f>20\,\text{k}\Omega$。
4. 取 $R_1=10\,\text{k}\Omega$、$R_f=22\,\text{k}\Omega$：$A=3.2$，$|AF|=3.2/3=1.067$，留了 6.7% 余量。起振后靠并联二极管把增益压回 3。

**回代**：$|AF|=1.067>1$ ✓ 起振条件满足；稳态二极管导通分流后 $A\to3$，$|AF|\to1$ ✓ 幅值不再增长。**$R_f$ 的另一端接在 $R_1$ 上**，若误接到 $R_1$ 的另一侧，增益公式就变成 $-R_f/R_1$，环路相位差 180°，这是本拓扑最常见的接错。

### 例 2 · LC 振荡器与谐振阻抗

**题目**：$L=100\,\mu\text{H}$、$C=0.01\,\mu\text{F}$，线圈品质因数 $Q=100$。求 $f_0$、特性阻抗 $\rho$、谐振时的并联阻抗。

<FigBox title="LC 谐振回路：f₀ 处阻抗最高" kind="曲线" note="并联 LC 的阻抗随频率先升后降，谐振点处达到峰值 Qρ。振荡器把晶体管接在这个峰上，只有 f₀ 附近的信号能拿得到足够增益。">
<svg viewBox="0 0 760 260" role="img" aria-label="并联 LC 谐振回路的阻抗频率曲线与电路">
<defs><marker id="ar6" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="60" y1="140" x2="140" y2="140" />
<rect x="140" y="120" width="26" height="92" />
<line x1="166" y1="140" x2="200" y2="140" />
<path d="M200 220 L230 220 L230 96 L260 96" />
<line x1="200" y1="220" x2="330" y2="220" /><line x1="200" y1="96" x2="330" y2="96" />
<path d="M330 220 L330 130 L300 130 L300 182 L270 182" />
<line x1="330" y1="96" x2="330" y2="70" />
<rect x="288" y="70" width="84" height="26" />
<line x1="372" y1="83" x2="420" y2="83" />
</g>
<g font-size="13" fill="currentColor">
<text x="153" y="230" text-anchor="middle">L</text>
<text x="330" y="240" text-anchor="middle">C</text>
<text x="330" y="60" text-anchor="middle">Rsh（线圈损耗）</text>
<text x="430" y="80">→ 放大器</text>
</g>
<!-- 曲线 -->
<g stroke="currentColor" fill="none">
<line x1="450" y1="230" x2="740" y2="230" stroke-width="1.4" />
<line x1="450" y1="230" x2="450" y2="80" stroke-width="1.4" />
<path d="M460 210 Q540 215 592 96 Q644 130 730 224" stroke-width="2" />
<line x1="592" y1="96" x2="592" y2="230" stroke-dasharray="5 4" stroke-width="1.2" opacity="0.6" />
</g>
<g font-size="12" fill="currentColor">
<text x="592" y="248" text-anchor="middle">f₀</text>
<text x="440" y="74" text-anchor="end">|Z|</text>
<text x="600" y="92">峰值 = Qρ</text>
</g>
</svg>
</FigBox>

图上那个峰是两件事叠在一起：频率只由 $L$、$C$ 的数值乘积决定，谁都没占便宜，所以稳定；$Q$ 只影响峰有多高，峰的高度由回路损耗决定。两个问题分开算。

步骤：

1. $f_0=\dfrac{1}{2\pi\sqrt{LC}}=\dfrac{1}{2\pi\sqrt{100\times10^{-6}\times0.01\times10^{-6}}}=159.2\,\text{kHz}$。
2. 特性阻抗 $\rho=\sqrt{\dfrac{L}{C}}=\sqrt{\dfrac{100\times10^{-6}}{0.01\times10^{-6}}}=100\,\Omega$。
3. 谐振时并联阻抗 $=Q\rho=100\times100=10\,\text{k}\Omega$。

**回代**：谐振时感性与容性电纳（电流与电压之比的虚部，$Y=1/Z$）相消，$Y$ 只剩一个很小的实部，$Z=1/Y$ 就变得很大，与「峰值 $Q\rho$」一致 ✓。另一条回代是量级检查：$\rho=100\,\Omega$ 与 $\sqrt{L/C}$ 对得上，说明第 2 步没算错单位。

为什么要用抽头（部分接入）？负载接在回路两端会与 $C$ 并联，把有效 $C$ 变大、$f_0$ 拉低、$Q$ 拉崩。实用电路把线圈只取一部分接入回路（抽头），让负载只「看得到」部分回路能量。耦合一松，$Q$ 就高，输出功率却变低，这是一对交换。

### 例 3 · 石英晶体为什么准：$Q$ 的三个数量级

**题目**：某 32.768 kHz 手表晶振的等效参数为 $C_0=3\,\text{pF}$（封装并联电容）、$R_q=10\,\text{k}\Omega$、$C_q=25\,\text{fF}$、$L_q=944\,\text{H}$。求串联谐振频率 $f_s$、并联（反谐振）频率 $f_p$，以及 $Q$ 值。

晶体是**压电效应**（某些晶体被机械挤压时表面产生电荷，反之加电压会变形）的谐振子，等效成一个极大的 $L$ 配一个极小的 $C$，$Q$ 会大得离谱，稳定度该比 RC 高好几个数量级。四个参数里 $C_q$ 最难猜，先由 $f_s$ 反求 $L_q$，再算其它。

步骤：

1. $C_q$ 是并联支路的小电容、$C_0$ 是封装电容（更大），所以 $C_0>C_q$，$f_p>f_s$。反求 $L_q$：
$$L_q=\frac{1}{(2\pi f_s)^2C_q}=\frac{1}{(2\pi\times32768)^2\times25\times10^{-15}}\approx944\,\text{H}$$
2. $f_p=f_s\sqrt{1+\dfrac{C_q}{C_0}}=32768\times\sqrt{1+\dfrac{25\times10^{-15}}{3\times10^{-12}}}=32768\times1.00416=32904\,\text{Hz}$。
3. 窗口宽度 $\Delta f=f_p-f_s=136\,\text{Hz}$，相对间隔 $0.42\%$。晶体工作在 $f_s$ 附近极窄的一段里，所以它像一个「一个频率上的高 $Q$ 电感」。
4. 品质因数 $Q=\dfrac{1}{R_q}\sqrt{\dfrac{L_q}{C_q}}=\dfrac{1}{10\times10^{3}}\sqrt{\dfrac{944}{25\times10^{-15}}}\approx1.9\times10^{4}$。$Q$ 高近两万倍，谐振峰的半宽 $\Delta f=\dfrac{f_0}{Q}$ 就窄近两万倍。

**回代**：与 RC 振荡器的稳定度 $10^{-3}$ 对比，石英在 $10^{-6}$ 以上，差三个数量级，与 $Q$ 的差别同量级。32.768 kHz 手表晶振一天误差不到一秒，而 RC 音频振荡器按小时漂移，说的就是这件事。另一条回代：把 $L_q=944$ H 代回第 1 步的式子，应恰好得到 $32768$ Hz。

::: tip 石英的两个特殊之处
- 频率窗口极窄：$f_s$ 与 $f_p$ 之间通常只有千分之几的相对间隔。晶体要么当串联谐振器工作（阻抗最小，可用作短路），要么工作在 $f_s\sim f_p$ 之间当电感。
- 有驱动功率上限。过驱会升温、改变频率甚至振裂，数据手册的 $P_{max}$ 不是装饰条款。
:::

## 方波与三角波发生器：两个积木闭环

正弦振荡依赖频率连续微调才能自洽，方波、三角波不需要这么麻烦：只要有一个「判决器」和一个「爬坡器」接成环，环就自己转起来了。这就是它为什么不套用 $AF$ 判据。两块积木本身，就是[第 07 章 · 信号的运算和处理](signal-processing.md)里那两个电路的直接组合。

<FigBox title="方波-三角波发生器：判决器 + 爬坡器闭环" kind="结构" note="迟滞比较器输出固定幅值的方波，积分器把它变成斜坡；当斜坡越过阈值，比较器翻转，方波反号，斜坡反向。两个电路本可独立，闭环后成了振荡器。">
<svg viewBox="0 0 760 250" role="img" aria-label="方波三角波发生器框图：迟滞比较器与积分器闭环">
<defs><marker id="ar7" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<rect x="80" y="80" width="170" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1.8" />
<text x="165" y="110" text-anchor="middle" font-size="13" fill="currentColor">迟滞比较器</text>
<text x="165" y="132" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">输出固定 ±U_Z 方波</text>
<rect x="510" y="80" width="170" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1.8" />
<text x="595" y="110" text-anchor="middle" font-size="13" fill="currentColor">反相积分器</text>
<text x="595" y="132" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">方波 → 三角波</text>
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="250" y1="115" x2="510" y2="115" marker-end="url(#ar7)" />
<path d="M595 150 L595 210 L165 210 L165 150" marker-end="url(#ar7)" />
</g>
<text x="380" y="105" text-anchor="middle" font-size="12" fill="currentColor">方波</text>
<text x="380" y="228" text-anchor="middle" font-size="12" fill="currentColor">三角波回送作阈值判断依据</text>
<text x="46" y="118" font-size="13" fill="currentColor">u_o</text>
<text x="690" y="118" font-size="12" fill="currentColor">三角</text>
</svg>
</FigBox>

环路是这样转的：比较器输出 $+U_Z$ → 积分器输出以固定斜率下降 → 下降越过下阈值 → 比较器翻转，输出 $-U_Z$ → 斜率变正 → 上升越过上阈值 → 再翻转。每半周时长由积分器斜率与阈值幅度共同决定：

$$f=\frac{R_1+R_2}{4R_1RC}$$

::: tip 例 4 · 方波/三角波发生器：频率与峰值各归各管
**题目**：$R_1=R_2=R=10\,\text{k}\Omega$、$C=0.1\,\mu\text{F}$，稳压管 $U_Z=6\,\text{V}$。求输出频率与三角波幅度。

两个旋钮该各管一件事：改 $C$ 只动频率，改 $R_2/R_1$ 只动峰值，互不干扰。

步骤：

1. $f=\dfrac{10\,\text{k}+10\,\text{k}}{4\times10\,\text{k}\times10\,\text{k}\times0.1\,\mu}=500\,\text{Hz}$。
2. 阈值 $V_{th}=\pm U_Z\dfrac{R_1}{R_1+R_2}=\pm6\times\dfrac12=\pm3\,\text{V}$，三角波峰峰值 $6\,\text{V}$。
3. 验算斜率：方波 $\pm6$ V 经 $R$ 给电容充放电，$i=6/10\,\text{k}=0.6$ mA，斜率 $=\pm\dfrac{0.6\,\text{mA}}{0.1\,\mu\text{F}}=6\,\text{V/ms}$。从 $+3$ V 走到 $-3$ V 需 $\dfrac{6}{6}=1\,\text{ms}$，半周 1 ms → 整周期 2 ms → $f=500\,\text{Hz}$ ✓ 与公式一致。

**回代**：拿半周时间除以周期，$\frac{1}{2}=0.5$ ✓ 占空比 50%，方波必须如此，因为两个半周完全对称。

怎么换频段：把 $C$ 改一个数量级就换一个频段，函数信号器的核心级就是这么干的。三角波再过一级折线近似电路，就成正弦波。
:::

这套电路的频率精度由 $R$、$C$ 决定（频率正比于 $1/RC$，与阈值无关），比文氏桥的稳定度好，但仍属 RC 量级；波形幅度由稳压管决定，很稳。频率和幅度各自被不同元件决定，这就是它比文氏桥好调的根本原因。

## 一块单片机板上的三种振荡

| 用途 | 器件 | 频段 | 稳定度 | 为什么这样选 |
| --- | --- | --- | --- | --- |
| CPU 主时钟 | 16 MHz 石英 + 反相器 | 16 MHz | $10^{-6}$ | 串口波特率由它分频，错频就丢帧 |
| RTC 实时时钟 | 32.768 kHz 石英 | 32.768 kHz | $10^{-6}$ | 2<sup>15</sup> = 32768 分频正好得 1 s |
| 看门狗 / 上电延时 | 内部 RC 振荡 | 数十 kHz | $10^{-2}$ | 只要求「慢一点也没事」，省一颗晶振 |
| PWM 调速 | 直接用主时钟分频 | 由定时器决定 | 同主时钟 | 频率精度跟随主时钟，不需要独立选频网络 |

看最后一行：PWM 调频根本不需要振荡器，[数电 08 章](../digital/ad-da.md)的定时器已经有一个主时钟，分频得到 PWM 频率即可。每增加一个振荡源，就是多一个会漂的器件，能用已有的时钟就别自己造。

## 易错清单

1. 只查一个条件。相位 0° 但增益 0.5，不起振；增益 3 但相移不对，不起振或乱振。上电第一件事是用示波器看波形，别只看频率计读数。
2. 起振增益取临界值。$R_f=2R_1$ 时环路增益正好 1，理论上临界，元件公差一来就小于 1。留 5%~10% 余量。
3. 稳态增益仍大于 1。波形会削顶成方波，稳幅元件（二极管、热敏电阻）必须真的接上，且二极管方向要保证大信号时导通。
4. 忘记文氏桥的 $F=1/3$。直接接增益 1 的射随，永远不振。
5. LC 回路挂重负载。$Q$ 被拉崩、频率漂移，用抽头或射随隔离。
6. 忽略运放 GBW。文氏桥在 100 kHz 时运放增益只剩十几倍，环路增益跌破 1，不起振。
7. 石英过驱。$P_{max}$ 是硬限制，过驱会频漂甚至振裂。
8. 非正弦发生器也套振荡条件。方波-三角波不靠「环路增益过 1」，它靠两个状态的翻转与阈值判断，硬套 $AF$ 判据会得出错误结论。

自检三问：你的环路相移在 $f_0$ 处是 180° 还是 360°？稳幅元件在起振初期是导通还是截止（答案应是截止）？你手上的那颗源是 RC、LC 还是石英，需求容不容得下它的稳定度？
