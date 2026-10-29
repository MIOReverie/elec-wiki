---
title: 10 · 传感器与信号调理：把物理量送进 ADC
description: 传感器输出为什么几乎都不能直接进 ADC，四类前端各缺什么，电桥与仪表放大器的增益怎么算，抗混叠为什么只能放在采样之前。
---

# 10 · 传感器与信号调理：把物理量送进 ADC

<Meta time="45 min" level="核心" note="传感器靠『接口』落地：同一颗 PT100，接错一根线就凭空多出 10 ℃" />

前面九章的运放、反馈、滤波、电源，全部在这里被拧成一条流水线：从物理量到数字码。数字化那一步的采样与量化在[数电 08 章 · AD/DA](../digital/ad-da.md)已经推导过，这里只讨论送进去之前发生了什么。

举个具体到能想象的场面。你把一颗 Pt100（铂电阻，阻值随温度变化的元件，0 ℃ 时 100 Ω）按手册接进一块板：红线进 AIN0，蓝线进 GND。室温 25 ℃，程序读回来显示 35.2 ℃。你换板子、换室温，它都偏得差不多同一个数；把板子搬到夏天，读数又整体上移。这个误差不需要任何精密仪器就能解释：两根引线的电阻被算进了测量结果，而它随环境温度在变。

同一颗传感器，接成三线制，误差立刻降到 0.05 ℃。这中间的差别，就是传感器前端要干的活。

::: tip 读这页之前
只要会分压比例（<Prereq id="voltage-divider" />）、把网络等效成「源 + 内阻」（<Prereq id="thevenin" />）、运放的虚短虚断（<Prereq id="virtual-short" />，见 [05 · 集成运算放大电路](opamp.md)），剩下的全靠这三条推。所有「放大」的字眼都指这三条规则。

会用到复数与频率：噪声、相移、幅频曲线用 $j\omega$ 表示，见 <Prereq id="complex-number" />。采样定理与混叠的完整推导在[数电 08 章](../digital/ad-da.md)，这里只说送进去之前怎么防。

符号：$V_S$（电桥激励电压）、$V_{ref}$（ADC 参考电压，也就是量程标尺）、$R_{sh}$（4–20 mA 采样电阻）、$R_G$（INA 的增益设定电阻）、$\varepsilon$（应变，无量纲的相对形变，单位常写 με）、$K$（灵敏系数，应变片阻值相对变化与应变的比值）、$f_s$（采样率）、$f_c$（滤波器截止频率）、$\mathrm{CMRR}$（共模抑制比，差模增益与共模增益之比）、$R_{shunt}$。约定见[符号与约定](../guide/notation.md#四、常用符号速查)。
:::

## 一、直接接上会出哪几类问题

把一颗传感器直接怼到 MCU 的 ADC 引脚上，出问题的顺序几乎总是这一串：

| 问题 | 症状 | 典型对策 |
| --- | --- | --- |
| 量程 | 1000 με 全桥才 10 mV，12 位 ADC 只用掉 248 个码 | 仪表放大器放大 100~330 倍 |
| 偏置 | 信号悬在 1.65 V 之上，或低于 ADC 的 0 V 轨 | 加直流偏置 / 差分输入 / 芯片内部 PGA |
| 阻抗 | 接分压后读数偏低、随线长变化 | 高输入阻抗缓冲 / 三运放输入级 |
| 噪声 | 读数末位乱跳，50 Hz 附近最强 | RC 低通 + 差分走线 + 屏蔽 |
| 非线性 | 中间量程准、两端偏差大 | 查表 / 多点标定 / 分段线性化 |

前四件是电路问题，第五件是算法与标定问题。可最后的误差都体现在同一个读数上，所以设计时必须合在一起做误差预算（见工程实例那节）。

最常见的误解是把传感器当电源直接接 ADC，以为 ADC 自己会放大。ADC 只做对齐，不做放大：它把 0~Vref 的区间线性切分，你的 10 mV 在里面只占 0.3%。

五件事的顺序不是随机的，它正好是设计的先后：

1. 量程：先算出信号只有几毫伏，才知道要多少增益。
2. 偏置：决定输出落在电压范围的哪个位置。
3. 阻抗：决定信号能不能活着走到运放输入端。
4. 噪声：决定这个增益最多能用多少倍。
5. 非线性：最后才轮到标定算法去补。

## 二、四类传感器，缺的前端各不相同

### 2.1 电阻式：PT100、热敏电阻、应变片

这类元件的输出是电阻变化，而 ADC 只认电压，中间必须转一道。两条路。

一条是分压或恒流激励，热敏电阻和 PT100 常走这条。恒流源 $I$ 流过 $R_t$，$V=I R_t$，输出与电阻严格成正比，比电桥直接，PT100 尤其偏爱。分压更便宜，可分母里带着 $R_t$，输出天生不是直线。

另一条是电桥，给应变片这类只有微小相对变化（$\Delta R/R\approx10^{-3}$ 量级）的元件用。初始阻值巨大，变化量微小，电桥把固定那部分在差分里减掉，只剩变化量。

阻抗问题在这里最突出。PT100 是 100 Ω、应变片是 350 Ω，看着挺「低」，但导线不只是电阻：长引线的电阻 2 Ω 就能让两线制读数偏 5 ℃（例 2 会算）。应变片还要考虑供电对自热的影响，电流大了片子自己就热起来，测的是自己给自己加的热量。

### 2.2 热电偶：μV 级信号对放大器的考验

热电偶是两种不同金属焊在一起构成的元件，接点上温差变化时输出一个微小电压。注意它测的是温差，不是温度本身。K 型灵敏度约 $41\,\mu\text{V}/^\circ\text{C}$，教材与工程口算常用简化值 $10\,\mu\text{V}/^\circ\text{C}$ 估量级，按 10~40 μV/℃ 这个区间理解都成立。100 ℃ 温差也才 1~4 mV，而且信号本身就带着共模：两根不同的金属一接，测的是热端与冷端的温差。

冷端补偿是绕不过去的。热电偶测温差，不知道冷端温度就推不出热端温度。常用办法是在接线端子处放一颗数字温度计（如 LM75、DS18B20）测冷端，再查表求和。冷端测错 1 ℃，结果就错约 1 ℃，冷端那颗温度计的精度直接决定系统精度，不能随手抓一颗。

放大器必须用斩波或零漂运放。信号只有几十 μV，而普通运放的失调（0.5~5 mV）就比整个量程还大。合适的器件是斩波稳零运放（如 AD8551、ICL7650）或集成的热电偶专用前端（如 MAX31855、AD8495）。

还有一条容易忽略：热电偶信号不要拿去做比例式。它的激励是零，没有激励源就没有可共享的参考，只能靠绝对电压精度。这也是热电偶对参考电压和运放失调特别敏感的原因。

### 2.3 电流输出：4–20 mA 与采样电阻

工业现场爱用电流不爱用电压，因为电流在回路里处处相等，导线电阻的压降不影响读数（只要回路电压够），线可以拉几百米。

前端就是一颗精密采样电阻 $R_{sh}$ 加一个处理共模的减法输入：

$$V_{out}=I\cdot R_{sh}$$

$R_{sh}$ 的选择是三个方向的拉扯。取大了，20 mA 在它上面掉的电压太高，抬高接收端共模，还可能超出 ADC 输入范围，165 Ω 配上 20 mA 正好是 3.3 V，一点余量都不剩；取小了，4 mA 满量程才零点几伏，12 位 ADC 分辨不出 0.1% 的电流变化。

第三个方向是共模抑制。采样电阻的一端总是在「地 + 采样电压」附近浮着，用单端测量的话，共模误差直接进读数。

4 mA 的活零点是有意设计的。它让变送器自身有电可用（两线制供电），也让断线等于 0 mA 这件事能与「信号为零等于 4 mA」区分开，故障检测写进了规程里。

### 2.4 数字式：什么时候根本不需要模拟前端

I²C（SHT3x 温湿度、INA219 电流监测）、SPI（MAX31855 热电偶）、单总线（DS18B20），还有各种带 UART 输出的模块，芯片内部已经把前端做完了：放大器、ADC、标定系数全封装进去，主机只管读寄存器。

| 条件 | 建议 |
| --- | --- |
| 精度要求 ≤ 0.1 ℃，量程小 | 数字传感器，省掉全部模拟设计与标定 |
| 需要多点、走线长 | 数字总线（RS-485 或 CAN），抗干扰远好于模拟 |
| 需要在现场做线性化、补偿 | 芯片内置 lookup 表或出厂标定，直接用 |
| 信号本身是 μV 级、或需要 > 100 Hz 带宽 | 必须自己搭模拟前端 |
| 成本敏感、单点简单测量 | 数字式通常更便宜（一颗芯片 = 前端 + ADC + 标定） |

数字式不是更先进，它只是把模拟前端的难点转移给了芯片厂。代价也明摆着：速度受总线限制、地址会冲突、量程换不动。工程师要判断的是「我的信号能不能被厂商的现成前端接住」，不是见数字就选。

四类看下来，电阻式最难，尤其应变片：信号天生只有毫伏级，还骑在一个很大的电位上。

## 三、电桥与仪表放大器

### 3.1 差模与共模：先分清两种信号

这组术语最要紧，后面全靠它。

**差模信号**（differential）是两个输入端互相反着动的部分，$u_d=\dfrac{u_1-u_2}{2}$。它才是你想测的那个物理量，应变、温度、压力变化的信号全在这里。

**共模信号**（common mode）是两个输入端同向一起动的部分，$u_{cm}=\dfrac{u_1+u_2}{2}$。它通常是干扰：地弹、电阻失配、桥臂不匹配产生的差值。

这里有个必须理解的事实：单个输入放大器（反相或同相）对差模和共模一视同仁地放大，增益由外部电阻决定，与信号是两路还是一路无关。所以共模 2.5 V 会被一起放大成 2.5 V 乘增益。只有做差分相减，才能把共模消掉。

### 3.2 惠斯通电桥：把微小变化从巨大基线里挖出来

惠斯通电桥就是四个电阻接成一个菱形，对角加激励，另两个对角取输出。平衡时两个中点等电位，输出为零；某臂阻值一变，两个中点分压比例不再相等，输出出现电压。

<FigBox title="惠斯通电桥：激励对角、输出对角" kind="结构" note="R1、R2 与 R3、R4 各自串联分压，两条中点之间取输出。平衡时中点等电位、输出为零；某臂阻值变化破坏平衡，输出才出现毫伏级电压。">
<svg viewBox="0 0 420 380" role="img" aria-label="惠斯通电桥电路图，激励加在上下两端，输出取左右中点">
<defs><marker id="arb" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="120" y1="30" x2="120" y2="68" />
<rect x="110" y="68" width="20" height="90" />
<line x1="120" y1="158" x2="120" y2="190" />
<rect x="110" y="190" width="20" height="90" />
<line x1="120" y1="30" x2="300" y2="30" />
<rect x="272" y="20" width="20" height="90" />
<line x1="300" y1="110" x2="300" y2="190" />
<rect x="290" y="190" width="20" height="90" />
<line x1="300" y1="280" x2="300" y2="310" />
<line x1="120" y1="310" x2="300" y2="310" />
<line x1="120" y1="155" x2="60" y2="155" />
<line x1="300" y1="155" x2="360" y2="155" />
</g>
<g font-size="13" fill="currentColor">
<text x="100" y="118" text-anchor="end">R₁</text>
<text x="100" y="240" text-anchor="end">R₂</text>
<text x="316" y="70">R₃</text>
<text x="316" y="240">R₄</text>
</g>
<g stroke="currentColor" fill="none">
<line x1="60" y1="155" x2="60" y2="340" stroke-width="1.6" />
<line x1="42" y1="340" x2="78" y2="340" stroke-width="2.2" />
<line x1="48" y1="348" x2="72" y2="348" stroke-width="2.2" />
<line x1="54" y1="356" x2="66" y2="356" stroke-width="2.2" />
<circle cx="60" cy="30" r="3.5" fill="currentColor" />
<text x="60" y="16" text-anchor="middle">+V_S</text>
<circle cx="300" cy="310" r="3.5" fill="currentColor" />
<text x="316" y="300">−V_S</text>
<text x="40" y="152" text-anchor="end">Vo⁺</text>
<text x="376" y="152">Vo⁻</text>
</g>
<text x="210" y="372" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.85">四个阻值相等时 Vo⁺ = Vo⁻，输出为零</text>
<text x="210" y="270" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7">差模电压 = 两中点之差</text>
<text x="210" y="288" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7">共模电位 ≈ V_S/2 = 2.5 V</text>
</svg>
</FigBox>

四个电阻 $R_1\sim R_4$ 构成桥，激励 $V_S$：

$$V_o=V_S\left(\frac{R_1}{R_1+R_2}-\frac{R_4}{R_3+R_4}\right)$$

平衡时四项相等、输出为零。某一臂变化 $\Delta R$ 时，单臂的小信号近似是

$$\Delta V_o\approx V_S\frac{\Delta R}{4R}$$

推一下：单臂时 $R_1=R+\Delta R$，输出 $=V_S[\frac{R+\Delta R}{2R+\Delta R}-\frac12]=V_S\frac{\Delta R}{2(2R+\Delta R)}\approx V_S\frac{\Delta R}{4R}$，分母里 $\Delta R\ll R$ 撑起了这个近似。注意 $V_S$ 的符号：单臂桥对 $V_S$ 的极性敏感，接线反了读数变负。

半桥是两臂反向变化，比如 $R_1$ 增、$R_2$ 减，$\Delta V_o\approx V_S\frac{\Delta R}{2R}$，单臂的 2 倍。全桥四臂两增两减，$\Delta V_o\approx V_S\frac{\Delta R}{R}$，恰好是单臂的 4 倍。

这个 4 倍不是数学巧合，它来自能量的利用率：单臂桥里另外三臂的静态压降白白存在，全桥让四个臂的变化都参与贡献。

### 3.3 仪表放大器：三运放的增益与共模抑制

电桥输出 10 mV、源阻抗 700 Ω 量级，共模电位在 2.5 V 附近（两条分压支路的中点都落在激励的一半处）。这种信号直接进 ADC 必死。**仪表放大器**（INA，instrumentation amplifier）就是为它设计的：只放大差模，把共模消掉。

<FigBox title="三运放仪表放大器：共模在前级就被压住" kind="结构" note="第一级两个同相放大器只做放大，两个输出之差已把共模消掉；第二级差分相减再次相减，只留差模。共模抑制比主要来自第一级的对称性。">
<svg viewBox="0 0 760 320" role="img" aria-label="三运放仪表放大器结构：两个同相放大器加差分后级">
<defs><marker id="ari" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<!-- 输入 -->
<g font-size="13" fill="currentColor">
<text x="34" y="118">V_in⁺</text><text x="34" y="240">V_in⁻</text>
</g>
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="34" y1="130" x2="130" y2="130" />
<line x1="34" y1="228" x2="130" y2="228" />
<path d="M130 60 L130 180 L230 120 Z" />
<path d="M130 180 L130 300 L230 240 Z" />
<line x1="230" y1="120" x2="470" y2="120" />
<line x1="230" y1="240" x2="470" y2="240" />
<path d="M470 90 L470 270 L600 180 Z" />
<line x1="600" y1="180" x2="700" y2="180" marker-end="url(#ari)" />
<!-- RG 跨接 -->
<line x1="180" y1="150" x2="180" y2="210" />
<line x1="180" y1="180" x2="512" y2="180" />
</g>
<g font-size="12" fill="currentColor" text-anchor="middle">
<text x="180" y="56">A1 同相</text><text x="180" y="316">A2 同相</text>
<text x="535" y="82">A3 差分</text>
</g>
<g stroke="currentColor" fill="none">
<rect x="150" y="166" width="60" height="28" />
</g>
<text x="180" y="185" text-anchor="middle" font-size="12" fill="currentColor">R_G</text>
<text x="330" y="228" text-anchor="middle" font-size="12" fill="currentColor">共模在这里被消掉</text>
<text x="330" y="246" text-anchor="middle" font-size="12" fill="currentColor">两路输出之差只剩差模</text>
<text x="716" y="176" font-size="13" fill="currentColor">V_out</text>
<text x="120" y="86" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.75">G₁=1+2R₁/R_G</text>
<text x="560" y="272" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.75">× R₃/R₂</text>
</svg>
</FigBox>

第一级是两个同相放大器加一个跨接在两输出之间的 $R_G$：

$$G_1=1+\frac{2R_1}{R_G}$$

第二级是标准差分放大器，增益 $R_3/R_2$。总增益

$$G=\left(1+\frac{2R_1}{R_G}\right)\frac{R_3}{R_2}$$

工程上直接写 $G=1+\dfrac{100\,\text{k}\Omega}{R_G}$，INA333、AD8226 这类「三运放加固定 $R_3/R_2=1$」的标准结构都适用。

共模抑制靠什么？第一级两个运放各放大「本端对地」，可它们的输出被 $R_G$ 串起来形成差分，共模信号在 $R_G$ 上不产生压差，于是两个输出同向移动，被第二级差分整体减掉。只要两级对称，同批芯片内匹配到 0.01% 量级，CMRR 可达 100 dB 以上。第二级本身也是差分对，可 CMRR 的来源主要在第一级的对称性。

那为什么不干脆用一个运放做差分放大？因为单运放差分放大的 CMRR 由外接电阻的匹配度决定，1% 电阻只给约 40 dB：共模 2.5 V 泄漏到输出 25 mV，比整个信号还大。INA 把输入级的匹配做在硅片上，不用你配电阻。共模抑制这件事必须用专用芯片，原因就在这儿。

### 3.4 电阻误差与温漂

就算 CMRR 完美，电桥自身的失配仍是最大误差源。

四个臂的初始阻值不可能完美平衡，会有零点失调。零点是稳定的，用调零网络或软件零点校准能消掉。麻烦的是温漂不同步：应变片的热膨胀系数、胶层、母材温度系数各不相同，典型的零点漂移是几十 με 量级，温度每变 10 ℃，读数可能飘 10~100 με。选同批、同材料的四片，把它们贴在同一个温度区，这是全桥方案最大的价值之一。

## 四、抗混叠与滤波

### 4.1 混叠：把高频伪装成低频

**混叠**（aliasing）指的是采样时高于 $f_s/2$ 的信号成分被折叠到带内，冒充成一个真实存在的低频。完整推导在[数电 08 章](../digital/ad-da.md)，这里只说后果。

采样率 $f_s$ 下，一个 $f>f_s/2$ 的频率会以 $\left|f-k f_s\right|$ 的形式出现在带内，$k$ 取最近的整数。只要信号里有超过 $f_s/2$ 的成分，这条防线就漏了。一旦折叠，就再也分不开：采样值和「真的有一个这么低的信号」完全一样。所以模拟滤波器不是可选的优化，它是整条链唯一的防线。

<FigBox title="混叠：1 kHz 的干扰在 600 Hz 采样下变成 200 Hz" kind="波形" note="采样点只取到若干离散瞬间。1 kHz 的信号在 600 Hz 采样下每隔几个采样点落在同样的高度，看起来就像一条 200 Hz 的慢波，这条 200 Hz 曲线是凭空捏出来的。">
<svg viewBox="0 0 760 300" role="img" aria-label="混叠示意图：1 kHz 信号在 600 Hz 采样下呈现为 200 Hz 假信号">
<g stroke="currentColor" fill="none">
<line x1="60" y1="230" x2="730" y2="230" stroke-width="1.4" />
<line x1="60" y1="40" x2="60" y2="230" stroke-width="1.4" />
<path d="M60 190 L100 70 L140 190 L180 70 L220 190 L260 70 L300 190 L340 70 L380 190 L420 70 L460 190 L500 70 L540 190 L580 70 L620 190 L660 70 L700 190 L730 120" stroke-width="1.8" />
<g stroke="currentColor" stroke-width="2">
<circle cx="60" cy="190" r="4" fill="currentColor" />
<circle cx="160" cy="70" r="4" fill="currentColor" />
<circle cx="260" cy="190" r="4" fill="currentColor" />
<circle cx="360" cy="70" r="4" fill="currentColor" />
<circle cx="460" cy="190" r="4" fill="currentColor" />
<circle cx="560" cy="70" r="4" fill="currentColor" />
<circle cx="660" cy="190" r="4" fill="currentColor" />
</g>
<path d="M60 200 L460 160 L460 200 Z" fill="currentColor" opacity="0.14" stroke="none" />
<path d="M60 200 L260 190 L460 200 Z" fill="currentColor" opacity="0.14" stroke="none" />
</g>
<text x="46" y="46" text-anchor="end" font-size="13" fill="currentColor">真实信号</text>
<text x="46" y="204" text-anchor="end" font-size="13" fill="currentColor">1 kHz</text>
<text x="370" y="252" text-anchor="middle" font-size="12" fill="currentColor">采样点（f_s = 600 Hz，只隔 1/600 s 取一个值）</text>
<text x="370" y="278" text-anchor="middle" font-size="13" fill="currentColor">把这些点连起来 → 看起来是一条 200 Hz 的波（|1000−600|=400，再折一次 |400−600|=200）</text>
<text x="370" y="296" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">频谱里那条 200 Hz 纹波根本不存在，它是 1 kHz 的鬼影</text>
</svg>
</FigBox>

看这张图，先看细曲线（真实信号），再看实心圆点（采样时刻取到的值）。这些点连成的折线与真实信号形状完全不同，这就是折叠的可视化。数字滤波处理不了它，因为采样值里已经没有任何证据表明那些高点来自 1 kHz。

### 4.2 RC 截止频率怎么选

先问一句：最危险的干扰频率是哪个？常见的是 50 Hz 工频及其谐波、开关电源的 100 kHz~2 MHz、PWM 调光与驱动的十几 kHz。

再定 $f_c$：取信号带宽的 3~10 倍，保证有用信号不被削，同时让第一个危险干扰频率被压到噪声底以下。一阶 RC 的衰减只有 20 dB/dec，所以

$$f_c\approx\frac{f_s}{10}\quad\text{（常用的经验起点）}$$

这只是经验起点，$f_c$ 具体取多少，要看最低的那个危险干扰频率离 $f_s/2$ 有多远。在 $f_c$ 处信号本身已经衰减 3 dB，这就是为什么抗混叠滤波器必须把带宽预留算进误差预算：如果 $f_c$ 正好等于信号带宽，最坏情况损耗 3 dB，ADC 可用码数直接少一半。

### 4.3 数字滤波：什么时候够

采样之后还能做数字滤波，但它们只能处理已经被采进来的频段。

滑动平均（矩形窗）在 $f_s/M$ 的整数倍处有零点，能精确压掉工频，前提是你把 $M$ 选成整数个工频周期，比如 20 ms 的采样窗口，50 Hz 与其整数倍谐波就被全消。中值滤波适合去掉偶发尖峰（电磁阀动作、ESD），对连续噪声无能为力。Sigma-Delta ADC 的内置数字滤波属于硬件抗混叠的一部分，可它的调制器前面仍然需要 RC，否则边带高频会混叠进调制器本身。

判断口诀：低于 $f_s/2$ 的成分交给数字滤波，省事又灵活；越过 Nyquist 的成分只能靠模拟 RC 拦，数字滤波对它们无能为力。两者分工，缺一不可。

## 五、参考电压与量化

ADC 的读数公式是

$$\text{code}=\text{round}\left(\frac{V_{in}}{V_{ref}}\cdot(2^N-1)\right)$$

两件事必须记住。

第一，$V_{ref}$ 的噪声与精度直接变成读数误差。Vref 噪声 1 mV、Vref 等于 3.3 V，则每个码都可能偏 $\pm1$ mV，相当于 12 位 ADC 丢了 2 位。MCU 内部 Vref 的温漂常在 50 ppm/℃ 以上，精密测量要换外部基准，比如 REF3033，±0.05%。

第二，量化误差与有效位数。理想 ADC 的量化误差是 ±½ LSB。LSB（Least Significant Bit，最低有效位）是 ADC 能分辨的最小电压台阶，$1\,\text{LSB}=V_{FS}/2^N$，$V_{FS}$ 为满量程、$N$ 为位数；12 位、3.3 V 满量程时 $1\,\text{LSB}=3.3/4096=0.81\,\text{mV}$。模拟量每变 1 LSB 码才动一个字，所以四舍五入本身就有 ±½ LSB 的误差。串口那边的「LSB 先发」是最低位先发送的意思，同一个词的另一义，与这里的量化台阶无关。实际有效位数（ENOB）由噪声决定，经典近似是

$$\text{ENOB}=\frac{\text{SINAD}-1.76\,\text{dB}}{6.02\,\text{dB}}$$

每多 1 位，理论动态范围加 6.02 dB，噪声要求翻倍。这条线在选 ADC 时比「多少位」有用得多。

| 用词 | 说清的一件事 |
| --- | --- |
| $\pm\frac12$ LSB | 量化本身带来的舍入误差 |
| ENOB | 扣掉噪声之后，这颗 ADC 实际能当几位用 |
| 比例式测量 | 激励与参考同源，$V_{ref}$ 在读数公式里被约掉 |

最后一格值得展开。**比例式测量**（ratiometric）的前提是激励和参考来自同一个源，比如都用 3.3 V，于是 $V_{in}=V_{ref}\cdot f(x)$，$V_{ref}$ 在读数公式里被约掉。分压器、比例式电桥都能用这个技巧，参考源的误差、温漂、噪声全部不出现。代价是激励源必须能给电桥供电，负载能力要好看得多，接线也多一根。这是性价比最高的技巧之一，见[第 07 章 · 信号的运算和处理](signal-processing.md)里比较器的思路：「比较基准与信号」本质上是同一个想法。

## 六、拖一遍：非线性长什么样

非线性是传感器前端最难在纸上讲清的概念。传感器本身、放大器、ADC 三段里任何一段不直，读数就会在量程两端挤在一起。下面这个演示拿二极管的指数特性当「传感器」，把 $V_{in}$ 从小拖到大，看输出电流怎么在低端爬得慢、高端蹿得快。量程和非线性在曲线上长什么样，看一眼就懂。

<DemoBox title="非线性传感器：为什么需要参数" hint="在二极管页签拖动输入电压：电流在 0.4 V 以下几乎没有，超过 0.6 V 后飚升。想象这就是一颗传感器的输出曲线，如果只用一条直线去拟合，低端几乎没灵敏度、高端全挤在一起。">
<DiodeCurveDemo />
</DemoBox>

把它换成电桥，用同样的眼光看：单臂电桥的输出不是 $V_S\cdot\Delta R/(4R)$ 的纯粹线性，而是 $V_S\cdot\Delta R/[2(2R+\Delta R)]$。$\Delta R$ 大了，分母被拉得更多，读数在满量程处偏低，例 1 会算出 0.1% 的偏差。线性度差 0.1% 的电阻式传感器，要靠全桥或软件多点标定把这点偏差修回来。

<FigBox title="一条完整的传感器信号链" kind="结构" note="从左到右：物理量 → 传感器 → 前端（放大/滤波/偏置） → 抗混叠 RC → ADC → 数字处理与校准。五件事（量程/偏置/阻抗/噪声/非线性）各自落在哪个环节，图下方标得很清楚。">
<svg viewBox="0 0 760 190" role="img" aria-label="传感器信号链框图：物理量、传感器、前端、抗混叠、ADC、数字处理、输出">
<rect x="8" y="60" width="92" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="54" y="82" text-anchor="middle" font-size="13" fill="currentColor">物理量</text>
<text x="54" y="99" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">温度/应力</text>
<rect x="118" y="60" width="100" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="168" y="82" text-anchor="middle" font-size="13" fill="currentColor">传感器</text>
<text x="168" y="99" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">阻抗·非线性</text>
<rect x="238" y="60" width="120" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="298" y="82" text-anchor="middle" font-size="13" fill="currentColor">前端 INA</text>
<text x="298" y="99" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">量程·偏置</text>
<rect x="378" y="60" width="108" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="432" y="82" text-anchor="middle" font-size="13" fill="currentColor">RC 抗混叠</text>
<text x="432" y="99" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">噪声</text>
<rect x="506" y="60" width="92" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="552" y="82" text-anchor="middle" font-size="13" fill="currentColor">ADC</text>
<text x="552" y="99" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">Vref·量化</text>
<rect x="618" y="60" width="128" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" />
<text x="682" y="82" text-anchor="middle" font-size="13" fill="currentColor">标定与输出</text>
<text x="682" y="99" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">两点校准</text>
<line x1="100" y1="86" x2="118" y2="86" stroke="currentColor" stroke-width="1.8" marker-end="url(#ar)" />
<line x1="218" y1="86" x2="238" y2="86" stroke="currentColor" stroke-width="1.8" marker-end="url(#ar)" />
<line x1="358" y1="86" x2="378" y2="86" stroke="currentColor" stroke-width="1.8" marker-end="url(#ar)" />
<line x1="486" y1="86" x2="506" y2="86" stroke="currentColor" stroke-width="1.8" marker-end="url(#ar)" />
<line x1="598" y1="86" x2="618" y2="86" stroke="currentColor" stroke-width="1.8" marker-end="url(#ar)" />
<defs><marker id="ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<text x="54" y="140" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.65">物理量本身</text>
<text x="298" y="140" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.65">最关键的一段</text>
<text x="552" y="140" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.65">标尺</text>
<text x="380" y="172" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.75">前两级决定「能不能测出来」，后两级决定「测得准不准」</text>
</svg>
</FigBox>

## 七、三道例题

::: tip 例 1 · 全桥应变片的输出与仪表放大器增益 {#ex-sensor-1}
题目：$R=350\,\Omega$ 应变片，灵敏系数 $K=2.0$，应变 $\varepsilon=1000\,\mu\varepsilon$，电桥激励 $V_S=5\,\text{V}$。求单臂、半桥、全桥的输出；若全桥输出要填满 ADS1115（$V_{ref}=3.3\,\text{V}$）的全程，增益多大？用 INA333 时 $R_G$ 取多少？

先猜什么：这是一道算链条的题。先把应变翻译成电阻变化，再翻译成桥输出，最后翻译成增益需求。关键是认清哪一段是差模、哪一段是共模：全桥那 10 mV 是差模，要放大；2.5 V 是共模，必须消掉。

第 1 步：先求电阻变化。

$$\Delta R=R\cdot K\varepsilon=350\times2.0\times1000\times10^{-6}=0.7\,\Omega,\qquad\frac{\Delta R}{R}=2.0\times10^{-3}$$

<FigBox title="本例的信号链：全桥 → INA → ADC" kind="结构" note="全桥输出 10 mV 差模骑在 2.5 V 共模上；INA333 把差模放大 304 倍、消掉共模；结果 0~3.04 V 进入 3.3 V 量程的 ADC，留了约 10% 余量。">
<svg viewBox="0 0 760 220" role="img" aria-label="全桥应变片经 INA333 到 ADS1115 的信号链框图">
<defs><marker id="ars" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" /></marker></defs>
<rect x="20" y="60" width="130" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1.7" />
<text x="85" y="88" text-anchor="middle" font-size="13" fill="currentColor">全桥 350Ω×4</text>
<text x="85" y="110" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">V_S = 5 V</text>
<rect x="230" y="60" width="150" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1.7" />
<text x="305" y="88" text-anchor="middle" font-size="13" fill="currentColor">INA333</text>
<text x="305" y="110" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">R_G = 330 Ω</text>
<rect x="470" y="60" width="130" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1.7" />
<text x="535" y="88" text-anchor="middle" font-size="13" fill="currentColor">ADS1115</text>
<text x="535" y="110" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">16 位，3.3 V</text>
<rect x="670" y="60" width="70" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1.7" />
<text x="705" y="100" text-anchor="middle" font-size="13" fill="currentColor">码</text>
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="150" y1="95" x2="230" y2="95" marker-end="url(#ars)" />
<line x1="380" y1="95" x2="470" y2="95" marker-end="url(#ars)" />
<line x1="600" y1="95" x2="670" y2="95" marker-end="url(#ars)" />
</g>
<g font-size="12" fill="currentColor">
<text x="190" y="78" text-anchor="middle">±10 mV 差模</text>
<text x="190" y="116" text-anchor="middle" opacity="0.75">共模 2.5 V</text>
<text x="425" y="88" text-anchor="middle">0~3.04 V</text>
<text x="425" y="114" text-anchor="middle" opacity="0.7">共模已消</text>
</g>
<text x="380" y="180" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.85">全桥放大 4 倍只拿到 10 mV：桥的输出永远是毫伏级，所以增益必须大</text>
<text x="380" y="202" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.85">而增益又被 3.3 V 量程封顶——两个约束一起决定 R_G</text>
</svg>
</FigBox>

第 2 步：三种桥的输出。

$$\Delta V_{\text{单臂}}=5\times\frac{2.0\times10^{-3}}{4}=2.5\,\text{mV}$$

$$\Delta V_{\text{半桥}}=5\,\text{mV},\qquad \Delta V_{\text{全桥}}=10\,\text{mV}$$

比较的是变化，不是总量。$350\,\Omega$ 里只有 $0.7\,\Omega$ 携带信息，单臂桥一个臂的变化只被检出 1/4，全桥四个臂全部参与，恰好 4 倍。

第 3 步：增益与 $R_G$。

$$G=\frac{3.3\,\text{V}}{10\,\text{mV}}=330,\qquad R_G=\frac{100\,\text{k}\Omega}{G-1}=\frac{100\,\text{k}}{329}=304\,\Omega$$

取标准值 $301\,\Omega$（1% 精度）得 $G=333.2$，输出 3.33 V，刚过满量程。实际设计要留 10% 余量，取 $R_G=330\,\Omega$，此时 $G=304$，输出 3.04 V。标称「填满」和「留余量」是两回事：电桥失配、温漂都会让零点偏一点，满量程设计成 0.9 满量程才不会被削顶。

第 4 步：单臂方案会怎样。

同样 330 倍增益，单臂只占 $2.5\,\text{mV}\times330=0.825\,\text{V}$，在 16 位 ADS1115（单端量程 3.3 V）里约 $0.825/3.3\times65535\approx16384$ 个码；全桥则占满 65535 个码。单臂方案白白丢掉 2 位分辨率。

再算灵敏度：全桥下应变片等效增益为 $\Delta V/\varepsilon=V_S K=5\times2.0=10\,\text{V}$ 每单位应变，经 $G=330$ 后为 3300 V/$\varepsilon$。1 LSB（50.35 μV）对应

$$\varepsilon_{1\text{LSB}}=\frac{50.35\,\mu\text{V}}{3300\,\text{V}}=1.53\times10^{-8}=0.015\,\mu\varepsilon$$

理论分辨率远低于应变片自身的噪声（几十 με 量级的热漂移），所以换更高位数的 ADC 没有意义，噪声和温漂才是真限制。

验算：把增益代回链路。$10\,\text{mV}\times330=3.30\,\text{V}$，与 3.3 V 量程相比只差 0.9%，说明 $R_G=330\,\Omega$ 这一档确实留下了约 10% 的余量，与设计意图一致。
:::

::: tip 例 2 · PT100 三线制与引线电阻 {#ex-sensor-2}
题目：PT100（$R_0=100\,\Omega$、$\alpha=3.9083\times10^{-3}/^\circ\text{C}$）用 $1\,\text{mA}$ 恒流激励，引线每根 $R_L=2\,\Omega$。求：两线制在 0 ℃ 与 100 ℃ 的误差；三线制怎么消掉它；$R_L$ 失配 0.1 Ω 的后果；ADS1115（LSB 50.35 μV）能分辨多少度。

先猜什么：误差等于 4 Ω 除以 0.3908 Ω/℃，约 10.2 ℃。先在脑子里做这个除法，就知道两线制为什么在工业上被淘汰。

第 1 步：PT100 特性与测量电压。

$$R_t=100(1+\alpha t),\quad R_{100}=138.505\,\Omega,\quad V_t=I R_t=100\,\text{mV}+0.3908\,\text{mV}/^\circ\text{C}$$

第 2 步：两线制误差。两根引线电阻串进测量回路，测到的是 $R_t+2R_L=R_t+4\,\Omega$：

$$t=0:\ R_{\text{测}}=104\,\Omega\rightarrow t_{\text{显}}=10.25\,^\circ\text{C}\quad(\text{多 10.25 ℃})$$

在 100 ℃ 时读数是 $142.505\,\Omega$，反解得 $110.56\,^\circ\text{C}$。几乎恒定的 10.25 ℃ 偏差，看起来还挺线性，所以靠软件单点修正也能凑合。但只要引线长度或温度一变，就得重标。

第 3 步：三线制的原理。

三根同样长度、同样材料的引线：两根接 PT100 两端，进差分放大器的两端；第三根接在恒流源回路，把同一根引线的压降也送进放大器的一端。这样两个输入端各含一份 $I R_L$，在差分里相消。只要两根引线电阻相等（同一根电缆、同一批次），误差就是零。

再往上还有四线制，也叫开尔文接法：恒流两端与电压采样两端物理分开，连引线失配都不用担心，这是精密测量的终极答案。

<FigBox title="两线制 vs 三线制：引线压降去了哪里" kind="结构" note="两线制里两根引线的压降与信号混在同一个测量回路中，被当成传感器阻值读出；三线制把第三根引线的压降送进差分的另一端，两份 I·R_L 在相减时抵消。">
<svg viewBox="0 0 760 300" role="img" aria-label="两线制与三线制 PT100 接线的对比示意图">
<g stroke="currentColor" stroke-width="2" fill="none">
<!-- 两线制 -->
<circle cx="60" cy="60" r="4" fill="currentColor" />
<circle cx="60" cy="140" r="4" fill="currentColor" />
<line x1="60" y1="60" x2="150" y2="60" /><line x1="60" y1="140" x2="150" y2="140" />
<rect x="150" y="44" width="64" height="32" /><rect x="150" y="124" width="64" height="32" />
<text x="182" y="36" text-anchor="middle" font-size="12" fill="currentColor">引线 2 Ω</text>
<text x="182" y="176" text-anchor="middle" font-size="12" fill="currentColor">引线 2 Ω</text>
<rect x="240" y="80" width="80" height="40" rx="4" />
<text x="280" y="105" text-anchor="middle" font-size="12" fill="currentColor">Pt100</text>
<line x1="214" y1="60" x2="240" y2="80" /><line x1="214" y1="140" x2="240" y2="120" />
<text x="60" y="30" font-size="13" fill="currentColor">I+</text>
<text x="60" y="170" font-size="13" fill="currentColor">I−</text>
<text x="380" y="100" font-size="13" fill="currentColor">两线制：R_L 串进读数 → 恒偏 4 Ω ≈ 10.2 ℃</text>
</g>
<!-- 三线制 -->
<g stroke="currentColor" stroke-width="2" fill="none">
<line x1="60" y1="230" x2="150" y2="230" />
<circle cx="60" cy="300" r="4" fill="currentColor" />
<circle cx="60" cy="215" r="4" fill="currentColor" />
<rect x="150" y="214" width="64" height="32" /><rect x="150" y="254" width="64" height="32" />
<text x="182" y="208" text-anchor="middle" font-size="12" fill="currentColor">引线</text>
<text x="182" y="302" text-anchor="middle" font-size="12" fill="currentColor">引线</text>
<line x1="214" y1="230" x2="240" y2="240" /><line x1="214" y1="270" x2="240" y2="262" />
<line x1="60" y1="215" x2="60" y2="230" />
<rect x="240" y="240" width="80" height="34" rx="4" />
<text x="280" y="262" text-anchor="middle" font-size="12" fill="currentColor">Pt100</text>
<line x1="320" y1="250" x2="370" y2="250" />
<line x1="214" y1="285" x2="370" y2="285" />
<text x="182" y="322" text-anchor="middle" font-size="12" fill="currentColor">第三根</text>
</g>
<text x="440" y="248" font-size="13" fill="currentColor">三线制：第三根引线的 I·R_L 送进差分另一端</text>
<text x="440" y="272" font-size="13" fill="currentColor">→ 两个输入各含一份 I·R_L，相减归零</text>
</svg>
</FigBox>

第 4 步：失配与分辨率。

两根引线差 $0.1\,\Omega$ 时，残差对应温度 $0.1/0.3908=0.256\,^\circ\text{C}$，这就是三线制剩下的误差。ADS1115 在 1 mA 激励下的 1 LSB 是：

$$\Delta R=\frac{50.35\,\mu\text{V}}{1\,\text{mA}}=0.0504\,\Omega\ \rightarrow\ \frac{0.0504}{0.3908}=0.129\,^\circ\text{C}$$

实际可以用更低的偏置，180 Ω 对地，$1\,\text{mA}$ 下共模只有 180 mV，让信号落在 $0.100\sim0.212\,\text{V}$（0~300 ℃）的小量程里，配合 PGA 再放大，分辨率还会更好。

验算：把 4 Ω 的引线误差代回第一种算法。$4/0.3908=10.2\,^\circ\text{C}$，与反解出来的 10.25 ℃ 一致；三线制剩下 0.1 Ω 失配时，$0.1/0.3908=0.256\,^\circ\text{C}$，两级误差的量级关系（40 倍）也对得上。
:::

::: tip 例 3 · RC 抗混叠滤波与采样率 {#ex-sensor-3}
题目：应变信号带宽 0~20 Hz，主要干扰是 50 Hz 工频及其 3 次、5 次谐波。设计单端 $R_s=1\,\text{k}\Omega$ 的 RC 低通，ADC 用 ADS1115。求 $f_c$、$C$、衰减，并解释为什么不能把 $f_c$ 定在 $f_s/2$。

第 1 步：定 $f_c$。信号上限 20 Hz，取 5 倍余量 $f_c=100\,\text{Hz}$：

$$C=\frac{1}{2\pi R_s f_c}=\frac{1}{2\pi\times1000\times100}=1.59\,\mu\text{F}\rightarrow\text{取 }1.5\,\mu\text{F}$$

第 2 步：各频点衰减。

$$|H|=\frac{1}{\sqrt{1+(f/f_c)^2}}$$

| 频率 | $f/f_c$ | 衰减 |
| --- | --- | --- |
| 100 Hz | 1 | −3.01 dB |
| 300 Hz | 3 | −10.00 dB |
| 1000 Hz | 10 | −20.04 dB |

问题来了：300 Hz 只衰减 10 倍，而 50 Hz 工频本身（$f/f_c=0.5$）才衰减 1.12 倍。RC 只负责抗混叠，真要压工频得靠数字滑动平均，选 20 ms 的整数周期。

抗混叠滤波器不是用来压 50 Hz 的，它的使命是让超过 $f_s/2$ 的成分不要折回。把两种滤波器的分工搞混，就会出现「加了 RC 但工频还是跳」的抱怨。

第 3 步：为什么不能 $f_c=f_s/2$。

设 $f_s=1\,\text{kHz}$、$f_c=f_s/2=500\,\text{Hz}$：300 Hz 处 $20\lg\frac{1}{\sqrt{1+(300/500)^2}}=-1.34\,\text{dB}$，几乎没滤；1 kHz 处才 $-7\,\text{dB}$。而 1 kHz 在这个采样率下正好落在 1 倍 Nyquist 边界上，折回后直接混进直流。这是最常见的混叠形态，也是滤波器截止频率选错时最常看到的症状。

改成 $f_c=f_s/10=100\,\text{Hz}$，300 Hz 已有 $-10\,\text{dB}$，1 kHz 有 $-20\,\text{dB}$。折算成丢掉的位数：

| 采样率 $f_s$ | $f_c=f_s/10$ | 1 kHz 处衰减 | 等效位数损失 |
| --- | --- | --- | --- |
| 1 kHz | 100 Hz | −20.0 dB | 3.3 位 |
| 10 kHz | 1 kHz | −40.0 dB | 6.6 位 |
| 100 kHz | 10 kHz | −60.0 dB | 10.0 位 |

采样率一高，一阶 RC 就更难把高频干扰挡在 Nyquist 之外。这就是高速 ADC 前面必须用二阶以上有源滤波器的原因，也是「采样率」和「分辨率」在传感器系统里不能分开讨论的理由。

第 4 步：一个反例。

$f_s=600\,\text{Hz}$ 时，1 kHz 的开关电源干扰折叠到 $|1000-600|=400\,\text{Hz}$，再折一次得到 $|400-600|=200\,\text{Hz}$，在 600 Hz 采样下它显示为 200 Hz。你在频谱里看到的「200 Hz 纹波」根本不存在，它是 1 kHz 的鬼影。抗混叠必须在采样前做，理由就在这个反例里。

验算：拿表里第一行核对。1 kHz 处 $f/f_c=10$，一阶 RC 给出 $-20\lg\sqrt{1+100}=-20.04\,\text{dB}$，与表里的 −20.0 dB 一致；按每 6 dB 折一位，20 dB 正好对应 3.3 位，与最后一列的估算也对得上。
:::

## 八、工程实例：STM32 加 ADS1115 的完整信号链

### 8.1 需求与架构

测一只全桥应变片，量程 ±1000 με，$V_S=5\,\text{V}$，ADC 用 16 位、860 SPS 的 ADS1115，要求读数分辨率优于 10 με、总误差小于 3% F.S.。架构是这样：

```
5 V 激励 ── 全桥(350Ω×4) ── 差模 ±10 mV，共模 2.5 V
                │
        INA333（Rg=330Ω，G=304，CMRR>100dB，轨到轨）
                │  输出 1.65 V ± 3.04 V 中的 0~3.04 V（配 0.9 满量程留余量）
        RC 1.5 kΩ + 1.5 μF（fc≈70 Hz）
                │
        ADS1115（16 位，PGA=1，±4.096V 量程，860 SPS）
                │  I²C
        STM32F103（I²C1，100 kHz）── 两点校准 ── 温度修正 ── 输出
```

### 8.2 代码骨架（STM32F103 加 ADS1115 单端）

STM32F103 上跑 HAL，ADS1115 接单端 AIN0：

```c
/* ADS1115：A0 单端 → PGA=±4.096V → 860SPS 连续转换 */
#define ADS_ADDR      0x48
#define ADS_REG_CONF  0x01
#define ADS_REG_CONV  0x00

static int16_t ads_read(void)
{
    uint8_t cmd[3] = { ADS_REG_CONV };
    uint8_t buf[2];
    HAL_I2C_Master_Transmit(&hi2c1, ADS_ADDR << 1, cmd, 1, 10);
    HAL_I2C_Master_Receive(&hi2c1, ADS_ADDR << 1, buf, 2, 10);
    return (int16_t)((buf[0] << 8) | buf[1]);   /* 已是有符号数 */
}

static void ads_start(void)
{
    /* OS=1 MUX=000(AIN0-GND) PGA=001(±4.096V) MODE=0 CONT SR=100(860SPS) */
    const uint16_t cfg = 0x8000 | 0x0400 | 0x0000 | 0x0080;
    uint8_t d[3] = { ADS_REG_CONF, (uint8_t)(cfg >> 8), (uint8_t)(cfg & 0xFF) };
    HAL_I2C_Master_Transmit(&hi2c1, ADS_ADDR << 1, d, 3, 10);
}
```

读回的是有符号 16 位码，对应电压 $V=\text{code}\times4.096\,\text{V}/32768$，单端模式下码是 0~32767。

### 8.3 两点校准

ADC 的绝对精度不可靠，基准、增益误差、偏置都会漂，可它的线性度很好。所以用两点校准消掉零点和增益误差。

空载零点：安装后不加负载，读 $N_0$，记 $V_0$。满量程：挂已知标准砝码或标准力源，读 $N_1$。然后直线拟合，$\text{读数}=\dfrac{N_0-N}{N_1-N_0}\times\text{满量程}$，符号取决于安装方向。

```c
static float two_point(int16_t raw, float n0, float n1, float fs)
{
    return (raw - n0) / (n1 - n0) * fs;   /* 两点定斜率与截距 */
}
```

两点校准消掉的是电桥零点失配、INA 失调 $V_{OS}$、$R_G$ 的容差、ADC 零点误差、ADS1115 增益误差，全是常数项或增益项，两点正好定出这两个参数。它消不掉的是随温度变化的漂移、噪声、非线性。所以两点校准不是万能偏移修正，它只是在常温下把一条有偏的直线平移到正确位置。

### 8.4 误差预算

口径统一为折算到传感器输出端的 RMS 值，前端增益 $G=10$：

| 误差项 | 折算到输入（μV） | 来源与口径 |
| --- | --- | --- |
| 电桥失配（4 片 × 100 ppm） | 800 | 传感器本身，最大项，$20\,\text{mV}\times0.04$ |
| $V_{ref}$ 容差 0.1% | 20 | 满量程读数的 0.1%，$20\,\text{mV}\times0.001$ |
| 仪表放大器增益误差 0.1% | 20 | $R_G$ 1% 加芯片误差，同属比例误差 |
| $V_{OS}$（单片） | 25 | 校准可消，列入备用项 |
| $V_{OS}$ 温漂 0.2 μV/℃ × 40 ℃ | 8 | 温升 40 ℃ 带来的漂移 |
| INA 噪声 0.6 μVpp（≈0.1 μVrms） | 0.1 | 0.1~10 Hz，峰峰值 ÷ 6 折 RMS |
| ADC 量化：1 LSB ÷ √12 ÷ G | 23 | 12 位内置 ADC，LSB = 3.3/4096 = 0.806 mV |
| ADC 噪声：2 LSB ÷ G | 160 | 2 个 LSB 的抖动，未再折 RMS |

RSS 合成得 $\sqrt{\sum u_i^{2}}=817\,\mu\text{V}$，以量程 20 mV 计约 4.1%；各项线性叠加是 1056 μV，约 5.3%。RSS 是统计意义上最可能的结果，线性叠加是「最坏情况」，工程上两者都报：给客户看 RSS，可靠性试验按最坏情况留余量。

换算口径要交代清楚，否则「μV」会自相矛盾。12 位 ADC 的 LSB 是 $3.3/4096=0.806\,\text{mV}$，量化误差取 1 LSB 并按均匀分布折成 RMS，$0.806/\sqrt{12}=233\,\mu\text{V}$，再除以增益 10 得 23 μV。ADC 噪声若按 2 LSB 计，则是 $2\times806/10=161\,\mu\text{V}$，量级上一举超过所有模拟项。这一步就是「位数多不等于精度高」的算术证据。

结论也很清楚：误差最大的一项（电桥失配，800 μV）永远不可能靠电路消除，只能选更好的应变片，把 1000 ppm 的旧料换成 300 ppm 的精密级，或者做整体温度补偿。这就是为什么传感器选型比电路设计更重要。前端增益也不是想要多大就给多大：信号 20 mV 若放大 100 倍就是 2 V，已经逼近 3.3 V ADC 的输入上限，增益被 ADC 的输入范围封顶。

### 8.5 温度补偿

应变片随温度漂移，加一颗 DS18B20 测环境温度，用二项式拟合修正：

$$N_{\text{修正}}=N\cdot(1+k_1\Delta T+k_2\Delta T^2)$$

$k_1$、$k_2$ 由标定台给出，一般在 $-3\times10^{-4}/^\circ\text{C}$ 量级，单片机型可以直接用查表插值。

## 九、易错清单

- [ ] 以为 ADC 会自动放大。ADC 只把 0~$V_{ref}$ 切分，信号小就是没用上位数，必须在前端放大。
- [ ] 两线制接 PT100。凭空多出 2 倍引线电阻，0 ℃ 显示 10.25 ℃（例 2），而且随导线温度变化。
- [ ] 单运放差分放大的 CMRR。1% 电阻只有约 40 dB，2.5 V 共模泄漏 25 mV，必须用 INA。
- [ ] 把 RC 当作压 50 Hz 的手段。$f_c=100\,\text{Hz}$ 时 50 Hz 才衰减 1.12 倍，压工频要靠数字滤波。
- [ ] 在 ADC 之后做抗混叠。折叠进来的频率与真实低频无法区分，任何数字滤波都救不回来。
- [ ] $V_{ref}$ 用 MCU 内部参考做精密测量。内部基准温漂常超过 50 ppm/℃，直接拖垮有效位数。
- [ ] 忽略热电偶冷端。冷端补偿错 1 ℃ 就是读数错 1 ℃，冷端不放温度传感器等于只测一半。
- [ ] 4–20 mA 的采样电阻 $R_{sh}$ 取太大。20 mA 乘 165 Ω 等于 3.3 V，正好顶满，超过就削顶。
- [ ] 忘记电桥激励的共模。全桥共模 2.5 V，INA 的输入范围必须包含它。
- [ ] 两点校准后以为万事大吉。校准只消常数与增益误差，温度漂移与非线性还在。
- [ ] 用数字传感器却要求 100 Hz 以上带宽。I²C 转换时间通常在 ms 级，采样率被总线卡死。

## 十、考点速记

| 考点 | 一句话 |
| --- | --- |
| 电桥输出 | 单臂 $V_S\Delta R/4R$，半桥 ×2，全桥 ×4 |
| 应变片 | $\Delta R/R=K\varepsilon$，$K\approx2$，「2 万 με 全桥约 10 mV」 |
| 仪表放大器 | $G=(1+2R_1/R_G)(R_3/R_2)$，第二级 $=1$ 时简化为 $G=1+2R_1/R_G$；CMRR 靠第一级对称 |
| PT100 | $100\,\Omega$ / $\alpha=3.9\,\text{m}\Omega/\Omega{}^\circ\text{C}$，0~100 ℃ 约 $0.39\,\Omega/^\circ\text{C}$ |
| 三线制 | 两根引线进差分两端、第三根供电，引线压降相消 |
| 热电偶 | μV 级加冷端补偿加斩波放大器，不能用比例式 |
| 4–20 mA | $V=I\cdot R_{sh}$，活零点用于断线检测 |
| 抗混叠 | 必须在 ADC 前；$f_c\approx f_s/10$ 起点 |
| 参考电压 | 直接决定满量程精度；比例式可约掉 $V_{ref}$ |
| 两点校准 | 消零偏与增益，消不掉温漂与非线性 |

## 十一、自检

1. 1 只 350 Ω 应变片接成单臂桥，激励 5 V、应变 1000 με，输出多少？换成 2 只、4 只呢？
2. 12 位 ADC、3.3 V 量程，1 LSB 是多少 mV？换成 16 位、24 位又各是多少？
3. 4–20 mA 变送器配 165 Ω 采样电阻，满量程电压是多少？把电阻换成 100 Ω 呢？
4. 3 线制接 PT100，两根引线差 0.2 Ω，误差折成多少 ℃？换成两线制呢？
5. 50 Hz 工频在 200 Hz 采样下会折到哪个频率？在 1 kHz 采样下呢？

## 下一步

<Prereq id="thevenin" /> → [07 · 信号的运算和处理](signal-processing.md)

- 采样与量化的完整推导：[数电 08 · AD/DA 与脉冲调制](../digital/ad-da.md)
- 运放与虚短虚断：[05 · 集成运算放大电路](opamp.md)、[07 · 信号的运算和处理](signal-processing.md)
- MCU 侧的 ADC 与 DMA：[嵌入式 · ADC 与 DMA](../embedded/adc-dma)
- 回到[模拟电子 · 课程主页](./index)，看 10 章的完整路线
