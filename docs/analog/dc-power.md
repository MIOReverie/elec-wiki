---
title: 09 · 直流电源
---

# 09 · 直流电源

<Meta time="45 min" level="核心" note="整流滤波稳压三段论 + 纹波与线性调整率两笔账 + 线性/开关的效率账，模电的工程终点" />

手里有一块 220 V 市电插排，电路芯片要 5 V 直流，中间发生了什么？

先把两个现象摆出来。你给开发板配了个 12 V 电源适配器，上电后芯片正常工作，可用示波器一量，5 V 轨上叠着一个 100 Hz 的小锯齿。音频里嗡嗡的交流声、ADC 读数的抖动，都是它的锅。同一个适配器，空载量是 12.3 V，插上满载再量只剩 11.6 V，你什么都没改，电压自己掉了。

前一个现象叫**纹波**（ripple：输出直流上叠加的周期性小波动，峰峰值记作 $\Delta U$）。后一个由两个指标衡量：**线性调整率**（line regulation：输入电网电压波动 ±10% 时输出电压变化的百分比）与**负载调整率**（load regulation：负载电流从零到满载时输出变化的百分比）。把整流、滤波、稳压三段拆开，这两个现象各从哪来、怎么算、怎么压下去，就都清楚了。

::: tip 读这页之前
需要会二极管的单向导电与稳压管（<Prereq id="pn-diode" />）、电容充放电与时间常数（<Prereq id="rc-transient" />）、欧姆定律与功率计算（<Prereq id="ohm" />）。这三条在手，页里的公式都能自己推出来。

符号里最容易被混的是电压的两种写法：$U_2$ 是变压器副边电压有效值（仪表读数），$\sqrt2U_2$ 是它的峰值。选电容耐压、二极管反压时用峰值，算功率用有效值，两者的区别见[符号与约定 · 大小写](../guide/notation.md)。其余：$U_o$ 输出电压、$I_L$ 负载电流、$\Delta U$ 纹波峰峰值、$\eta$ 效率，正文首次出现处都有解释。
:::

## 三段的地图：从 220 V 到 5 V

```
220 V 市电 ─► 变压器降压（隔离 + 变比）─► 副边 U2（有效值）
   │
   ├─ 整流：二极管单向导电性 ─► 半波（0.45U2）/ 桥式全波（0.9U2）
   │
   ├─ 滤波：电容充电快放电慢 ─► 1.2U2（带载时掉到 1.0~1.1U2）
   │
   └─ 稳压：线性（串联调整）或开关（PWM 占空比）
```

每一级都在做「能量形式不变、质量提升」的事：整流管给电流定方向，电容储存能量填坑，调整管（或 PWM）按反馈调缺口。这条链上真正要盯的参数只有四个：输出电压、输出电流、纹波、效率。稳压那一环的反馈思想，是[第 6 章 · 放大电路中的反馈](feedback.md)的工程大结局。

## 整流与滤波：纹波的出生地

四个二极管搭成一座「桥」，正半周走对角线的一对，负半周走另一对。无论副边电压是正是负，流过负载的电流方向都不变。两个口诀先记住：无滤波时 $U_o=0.9U_2$，加电容滤波带载时 $U_o\approx1.2U_2$；分开看：无滤波那一路就是 $0.9U_2$，加了电容才抬到 $1.2U_2$。前一个是把半波的 $0.45U_2$ 翻了一倍，后一个是大量实测的折中。

<CircuitFig kind="bridge-rectifier" />

滤波电容接在负载两端。副边电压超过电容电压的短暂瞬间，二极管导通给电容「快充」到峰值 $\sqrt2U_2$；其余时间二极管全部截止，电容独自向负载放电，电压沿 $\tau=R_LC$ 的指数曲线缓降。一充一放，锯齿就出来了，这个锯齿就是纹波，$\Delta U$ 指它的峰峰值。

<FigBox title="桥式整流 + 电容滤波：纹波的几何形状（示意）" kind="波形" note="实线是输出：在峰值附近被充到 √2U₂，随后以近似恒定的斜率放电（负载电流近似恒定时 ΔU≈I_L·T/fC，比指数曲线更好算）；虚线是不加电容的桥式输出 |sin|。谷底到下一个峰的落差就是纹波 ΔU。下图纵向按 12 V 量程夸张画出；真实 12 V 输出上 0.5 V 的纹波，在示波器上只是贴着顶的一条细带。">

<svg viewBox="0 0 420 180" role="img" aria-label="桥式整流加电容滤波后的输出波形：顶部平缓锯齿叠加在正弦包络之下">
  <line x1="30" y1="160" x2="400" y2="160" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="30" y1="20" x2="30" y2="160" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <g font-size="11" fill="var(--vp-c-text-3)">
    <text x="396" y="152" text-anchor="end">t →</text>
    <text x="36" y="28">u</text>
  </g>
  <!-- 正弦包络（√2U2 峰值参考） -->
  <line x1="30" y1="40" x2="400" y2="40" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="34" y="52" font-size="11" fill="var(--vp-c-text-3)">√2U₂ = 14.1 V</text>
  <!-- 桥式无滤波 |sin|：峰值40，零点160 -->
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" opacity="0.45" points="30,160 39,141 48,124 57,109 66,97 75,88 84,81 93,77 102,75 111,77 120,81 129,88 138,97 147,109 156,124 165,141 174,160 183,141 192,124 201,109 210,97 219,88 228,81 237,77 246,75 255,77 264,81 273,88 282,97 291,109 300,124 309,141 318,160 327,141 336,124 345,109 354,97 363,88 372,81 381,77 390,75 399,77" />
  <!-- 滤波后：锯齿，顶≈40，谷≈58（ΔU 0.5V 对应 18px，纵向夸张） -->
  <polyline fill="none" stroke="var(--vp-c-danger-1)" stroke-width="2.4" points="30,40 44,57 58,74 65,82 70,44 84,61 98,78 105,86 110,44 124,61 138,78 145,86 150,44 164,61 178,78 185,86 190,44 204,61 218,78 225,86 230,44 244,61 258,78 265,86 270,44 284,61 298,78 305,86 310,44 324,61 338,78 345,86 350,44 364,61 378,78 385,86 390,44 399,54" />
  <!-- 谷值连线 = 输出平均值参考 -->
  <line x1="30" y1="49" x2="400" y2="49" stroke="var(--vp-c-text-2)" stroke-width="1" stroke-dasharray="6 4" />
  <text x="260" y="45" font-size="11" fill="var(--vp-c-text-2)">U_o ≈ 1.2U₂ = 12 V</text>
  <!-- ΔU 标注 -->
  <line x1="70" y1="44" x2="70" y2="82" stroke="var(--vp-c-danger-1)" stroke-width="1" />
  <path d="M 66 44 L 70 44 L 70 82 L 66 82" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="1" />
  <text x="76" y="70" font-size="11" fill="var(--vp-c-danger-1)">ΔU = 0.5 V</text>
  <g font-size="11">
    <rect x="255" y="152" width="10" height="3" fill="var(--vp-c-brand-1)" opacity="0.45" />
    <text x="269" y="157" fill="var(--vp-c-text-2)">桥式无滤波</text>
    <rect x="340" y="152" width="10" height="3" fill="var(--vp-c-danger-1)" />
    <text x="354" y="157" fill="var(--vp-c-text-2)">加滤波电容</text>
  </g>
</svg>
</FigBox>

纹波大小由放电那一段决定。电容放电时输出电压以近似恒定的速率下降（下降速率就是负载电流 $I_L$），两个充电峰之间隔了半个市电周期，于是 $\Delta U\approx\dfrac{I_L}{fC}$，其中 $f$ 是纹波频率：半波等于市电频率，桥式全波是市电的 2 倍，也就是 $f=2\times$ 市电频率。这笔账还可以写成 $\Delta U\approx I_L\cdot T_f/2=I_L/(fC)$，两种写法算的是同一件事。波形看懂了，例 1 才有落点；波形背后的能量账，留到稳压环节一起算。

二极管要扛的反压也在这一步定下来：桥式 $U_{DRM}=\sqrt2U_2$，中心抽头全波是 $2\sqrt2U_2$。拓扑不同，选型差一倍。

## 稳压：两笔账，效率与调整率

电容滤波的输出会随两件事漂：电网电压波动（副边 $U_2$ 变）、负载电流变化（放电更陡、平均电压下掉）。衡量前者的是线性调整率，衡量后者的是负载调整率。三个方案在负载加重时的表现差距极大：

<FigBox title="负载加重时，三种方案的输出电压（示意）" kind="曲线" note="从空载到满载（0→100 mA）：无稳压从 15 V 一路掉到 10 V；稳压管在极限电流内钉住，超限即失效；串联稳压只掉 0.05 V（负载调整率 0.4%）。选型顺序：先算最大负载电流，再决定用哪一种。">
<WavePreset kind="loadreg" />
</FigBox>

串联线性稳压的原理是「可变电阻扛压差」：调整管串在输入与输出之间，反馈环控制它的导通程度，把 $U_{in}$ 与 $U_o$ 的差全部扛在自己身上。扛压差就要发热，压差 $(U_{in}-U_o)$ 那一截全变成热，$P=(U_{in}-U_o)I_o$，这笔热账决定了效率与散热设计，也是线性与开关的分水岭。效率只有一个比值：$=U_o/U_{in}$；统一的口径是 $\eta=P_o/P_{in}$，压差占多少，就烧掉多少。

开关电源把调整管只当开关用（要么全通，要么全断，不泡在中间的线性区），用 PWM 占空比（duty cycle：一个开关周期内导通时间占整周期的比例）控制传过去的能量，理论损耗只剩开关瞬间与导通电阻上的少量发热，所以效率能上 85%~95%，这一点是线性方案拿不到的。

三段到这里齐了。可「调整管是可变电阻」这句话太粗：它凭什么知道该变多少？背后是一条负反馈闭环。

## 串联型稳压电路：调整管怎么把电压钉住

串联型稳压电路（series regulator：调整管与负载串联在主回路里，靠改变自身压降来调节输出）由四块拼成：

- 调整管：一颗功率三极管，工作在放大区（<Prereq id="bjt-regions" />），串在输入与输出之间，扛下 $U_{in}-U_o$ 的全部压差。
- 取样电路：$R_1$、$R_2$ 两个电阻分压，从输出端取一个按比例缩小的反馈电压 $U_F=U_o\cdot\dfrac{R_2}{R_1+R_2}$。
- 基准电压：一只稳压管给出稳定参照 $U_Z$，反向击穿区端电压几乎不随电流变（见[第 1 章 · 半导体器件](semiconductor.md)）。
- 比较放大：一个误差放大器（常用运放或差分对），把 $U_F$ 与 $U_Z$ 的差值放大，去驱动调整管基极（<Prereq id="virtual-short" />）。

<FigBox title="串联型稳压电路：四块 + 一条负反馈回路" kind="框图" note="主回路从左到右：输入电压进调整管，出来的是输出电压、带负载；反馈回路从输出取样，与基准电压比较放大后回到调整管。两条线要看清：取样从输出端拿、控制回到调整管，这就是闭环；回路里任何一环断开，稳压立刻失效。">

<svg viewBox="0 0 680 300" role="img" aria-label="串联型稳压电路框图：调整管串联在主回路，取样电路分压取反馈电压，与基准电压在比较放大器中比较后驱动调整管基极">
<defs>
  <marker id="sr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<text x="36" y="76" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="end">U_in</text>
<line x1="44" y1="70" x2="120" y2="70" stroke="var(--vp-c-text-2)" stroke-width="2" />
<rect x="120" y="46" width="150" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="195" y="66" font-size="12.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">调整管</text>
<text x="195" y="82" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">（放大区 · 串联）</text>
<line x1="270" y1="70" x2="380" y2="70" stroke="var(--vp-c-text-2)" stroke-width="2" />
<circle cx="380" cy="70" r="3.5" fill="var(--vp-c-text-2)" />
<text x="394" y="62" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="start">U_o</text>
<rect x="430" y="46" width="110" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="485" y="75" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="middle">负载 R_L</text>
<line x1="540" y1="70" x2="540" y2="120" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="528" y1="120" x2="552" y2="120" stroke="var(--vp-c-text-2)" stroke-width="2.4" />
<line x1="380" y1="70" x2="380" y2="150" stroke="var(--vp-c-text-2)" stroke-width="2" />
<rect x="356" y="150" width="48" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
<text x="380" y="175" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">R₁</text>
<line x1="380" y1="190" x2="380" y2="196" stroke="var(--vp-c-text-2)" stroke-width="2" />
<circle cx="380" cy="196" r="3.5" fill="var(--vp-c-text-2)" />
<rect x="356" y="206" width="48" height="40" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
<text x="380" y="231" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">R₂</text>
<line x1="380" y1="246" x2="380" y2="262" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="368" y1="262" x2="392" y2="262" stroke="var(--vp-c-text-2)" stroke-width="2.4" />
<text x="352" y="200" font-size="11" fill="var(--vp-c-text-3)" text-anchor="end">U_F</text>
<line x1="380" y1="196" x2="300" y2="196" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#sr-arrow)" />
<rect x="150" y="182" width="150" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
<text x="225" y="202" font-size="12.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">比较放大</text>
<text x="225" y="218" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">（误差放大）</text>
<rect x="150" y="250" width="150" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
<text x="225" y="275" font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">基准电压 U_Z</text>
<line x1="225" y1="250" x2="225" y2="230" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="195" y1="182" x2="195" y2="94" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#sr-arrow)" />
<text x="205" y="140" font-size="11" fill="var(--vp-c-text-3)" text-anchor="start">控制基极</text>
<text x="400" y="120" font-size="11" fill="var(--vp-c-text-3)" text-anchor="start">取样</text>
</svg>
</FigBox>

反馈怎么把电压钉住：设输出 $U_o$ 因为电网升高或负载变轻而上漂，$U_F$ 跟着上漂，$U_F-U_Z$ 变大，比较放大器的输出把调整管基极电流往下压。调整管「关小一点」、自身压降变大，把 $U_o$ 拉回来。整个闭环就是「输出一变 → 取样立刻察觉 → 反着拉一把」，输出电压最终钉在 $U_F\approx U_Z$ 的平衡点上：

$$U_o \approx U_Z\left(1+\frac{R_1}{R_2}\right)$$

输出只由 $U_Z$ 和分压比决定，与 $U_{in}$、$I_L$ 几乎无关，写成式子就是 $U_o\approx U_Z\left(1+\dfrac{R_1}{R_2}\right)$。这就是[第 6 章 · 放大电路中的反馈](feedback.md)里「深度负反馈以精度换增益」的工程落地：环路增益越大，扰动被压得越平。

衡量它的两个指标都是比值：

- 稳压系数 $S_U$：负载电流与温度不变时，输入电压相对变化引起输出电压相对变化的比值，$S_U=\dfrac{\Delta U_o/U_o}{\Delta U_{in}/U_{in}}$。它无量纲，数值小才叫稳；分立串联稳压典型在 $10^{-2}\sim10^{-4}$，意思是输入跳 10%、输出只跳 0.1%~0.001%。
- 输出电阻 $R_o$：输入电压与温度不变时，负载电流变化引起的输出电压变化（取负号），$R_o=-\dfrac{\Delta U_o}{\Delta I_o}$。这一项小，负载加重时输出才掉得少，典型 $0.01\sim0.1\,\Omega$。负载调整率就是它的百分比写法：负载从空载到满载时 $\dfrac{\Delta U_o}{U_o}$。

> 稳压系数压的是「电网波动」这条线，输出电阻（负载调整率）压的是「负载波动」这条线，正好对应上一节的两笔账。

## 三端集成稳压器：78xx / 79xx / LM317

把上一节那四块（调整管、取样、基准、比较放大）全做进一颗芯片、只留三只脚，就是三端集成稳压器（three-terminal regulator）。三只脚分别是输入、输出、公共端（78xx 系列为 IN / GND / OUT），这是直流电源从「搭电路」变成「买零件」的分水岭。

三大家族的接法（78xx、79xx、LM317，覆盖了实验室里绝大多数需求）：

- 78xx 正压固定。7805 出 +5 V、7812 出 +12 V，输出电压定死；输入接整流滤波后的正母线，公共脚直接接地。
- 79xx 负压固定。7905 出 −5 V，它稳的是负输出、输入接负母线，而且引脚顺序与 78xx 不同（正面朝向自己、引脚朝下时，78xx 是 IN / GND / OUT，79xx 是 GND / IN / OUT），接错即烧。
- LM317 可调正压。输出 $U_o=1.25\left(1+\dfrac{R_2}{R_1}\right)$，靠外接两只电阻调压，范围 1.25 V 到约 37 V。式子里那只 1.25 V 是它内部的基准。

<FigBox title="78xx 固定输出与 LM317 可调输出的接线" kind="接线" note="78xx 三只脚定死：输入、地、输出，各并一颗电容即用；LM317 多一只 ADJ 调整端，靠 R1（OUT 接 ADJ）与 R2（ADJ 接地）两只电阻定电压。注意两者引脚顺序不同，LM317 从左到右是 ADJ / OUT / IN。">

<svg viewBox="0 0 680 250" role="img" aria-label="78xx 与 LM317 接线对照：78xx 三脚为输入地输出并接电容，LM317 三脚为调整输出输入并外接设定电阻">
<text x="165" y="26" font-size="12.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">78xx（固定输出）</text>
<rect x="110" y="40" width="110" height="84" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
<text x="165" y="76" font-size="13" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">78xx</text>
<text x="165" y="94" font-size="10" fill="var(--vp-c-text-3)" text-anchor="middle">IN · GND · OUT</text>
<line x1="140" y1="124" x2="140" y2="154" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="165" y1="124" x2="165" y2="154" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="190" y1="124" x2="190" y2="154" stroke="var(--vp-c-text-2)" stroke-width="2" />
<text x="140" y="170" font-size="11.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">IN</text>
<text x="165" y="170" font-size="11.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">GND</text>
<text x="190" y="170" font-size="11.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">OUT</text>
<text x="140" y="190" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">接 U_in</text>
<text x="165" y="190" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">接地</text>
<text x="190" y="190" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">接 U_o</text>
<text x="140" y="208" font-size="10" fill="var(--vp-c-brand-2)" text-anchor="middle">并 0.33 µF 到地</text>
<text x="190" y="208" font-size="10" fill="var(--vp-c-brand-2)" text-anchor="middle">并 0.1 µF 到地</text>
<line x1="330" y1="20" x2="330" y2="230" stroke="var(--vp-c-divider)" stroke-width="1.4" stroke-dasharray="5 4" />
<text x="510" y="26" font-size="12.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">LM317（可调输出）</text>
<rect x="455" y="40" width="110" height="84" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
<text x="510" y="76" font-size="13" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">LM317</text>
<text x="510" y="94" font-size="10" fill="var(--vp-c-text-3)" text-anchor="middle">ADJ · OUT · IN</text>
<line x1="480" y1="124" x2="480" y2="154" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="510" y1="124" x2="510" y2="154" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="540" y1="124" x2="540" y2="154" stroke="var(--vp-c-text-2)" stroke-width="2" />
<text x="480" y="170" font-size="11.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">ADJ</text>
<text x="510" y="170" font-size="11.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">OUT</text>
<text x="540" y="170" font-size="11.5" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">IN</text>
<text x="480" y="190" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">经 R₂ 到地</text>
<text x="510" y="190" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">接 U_o</text>
<text x="540" y="190" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">接 U_in</text>
<text x="510" y="208" font-size="10" fill="var(--vp-c-brand-2)" text-anchor="middle">R₁ 240Ω 接 OUT↔ADJ</text>
</svg>
</FigBox>

压差（dropout）是稳压器能正常工作的前提：输入必须比输出高出至少一个最小值，这个最小值叫压差。78xx 典型要求 $U_{in}-U_o\ge2.5\,\text{V}$（工程上常取 3 V），LM317 约 3 V。滤波后的谷底电压一旦低于 $U_o+\text{dropout}$，调整管进入饱和区，输出跟着输入一起掉，这正是前面反复强调「谷底余量」的原因。低压差（LDO，low-dropout regulator）是压差可低至 0.3 V 的品种，代价是更挑输入输出电容、稳定性更敏感。

扩流：78xx 输出电流上限约 1~1.5 A（78M 系列 0.5 A，78L 系列 0.1 A）。要更大的电流，就在调整管上并一颗大功率三极管「分走」大部分电流，这个做法叫扩流（current boost）。扩流管的选型、限流与散热的完整账，在[项目一 · 可调实验电源](../topics/power-supply.md)里已经算过，这里不重复。

散热：功耗 $P=(U_{in}-U_o)I_o$ 全部变热。TO-220 封装的 7805 自然散热只有约 1~2 W，超过就要加散热器。结温链 $T_j=T_a+P\,R_{\theta}$ 与散热器热阻的选型，同样在[项目一](../topics/power-supply.md)第 3.5 节有完整账。稳压器功耗超出自散热能力，结温就往上跑，这是电源短命的头号原因。

输入输出电容：输入侧并一颗 $0.33\,\mu\text{F}$ 瓷片电容（离引脚 1 cm 以内最好），压住输入线上的电感尖峰与高频振荡；输出侧并一颗 $0.1\,\mu\text{F}$ 改善瞬态响应，负载有较大脉冲电流时再并一颗 $10\sim100\,\mu\text{F}$ 电解电容。78xx 内部自带过流、过热保护，但这两颗电容是它稳定工作的前提，别省。

从分立件的串联稳压到成品三端芯片，这条线到这里通了，下面用六道例题把数字坐实。

## 六道例题：数字均经 node 计算验证

::: tip 例 1 · 桥式整流 + 电容滤波的参数账
**题目**：副边 $U_2=10\,\text{V}$（有效值）、负载电流 $I_L=50\,\text{mA}$、$C=1000\,\mu\text{F}$，求输出电压、纹波与器件选型。

<CircuitFig kind="bridge-rectifier" />

先猜一下：峰值 14 V 上下，带载平均值落到 12 V，纹波估计零点几伏。这题没有复杂拓扑要解，难在三组数用哪个公式：峰值选耐压、有效值算功率、纹波用 $I_L/(fC)$，混用任何一个都会差 $\sqrt2$ 或 2 倍。

步骤：
1. 峰值 $\sqrt2U_2=14.1\,\text{V}$；带载经验值 $\approx1.2U_2=12\,\text{V}$。*（为什么两个数：电容充电到峰值，但带载放电把平均值拉低，工程取 1.2 倍是大量实测的折中。）*
2. 二极管反压 $U_{DRM}=\sqrt2U_2=14.14\,\text{V}$ → 留 3 倍余量选 50 V 管；每管平均电流 $I_L/2=25\,\text{mA}$ → 选 1 A 管绰绰有余。*（为什么留 3 倍：上电浪涌与电网尖峰不吃余量，管子死得又快又静。）*
3. 纹波 $\Delta U\approx\dfrac{I_L}{fC}=\dfrac{0.05}{100\times10^{-3}}=0.5\,\text{V}$，其中 $f=100\,\text{Hz}$ 是全波纹波频率（市电 50 Hz 的两倍）。
4. 纹波系数 $0.5/12\approx4.2\%$。要压到 1%，$C$ 需约 $4200\,\mu\text{F}$。纹波要求严一倍，电容就大一倍。

**回代**：纹波与平均值自洽——谷值 $\approx12-0.25=11.75\,\text{V}$、峰值 $14.1\,\text{V}$，平均落在 12 V 附近 ✓；$\Delta U=I_L/(fC)$ 与图一中 0.5 V 的标注一致，用的是放电速率 $I_L/C$ 的定义。
:::

::: tip 例 2 · 78M05 线性稳压的效率与散热
**题目**：输入 10 V、输出 5 V、$I_o=0.5\,\text{A}$，求效率、损耗与散热方案。

10 V 进、5 V 出，第一反应是效率对半，热全堆在芯片上。

步骤：
1. 输入功率 $P_{in}=10\times0.5=5\,\text{W}$，输出功率 $P_o=5\times0.5=2.5\,\text{W}$；*（为什么从功率入手：效率与热设计共用同一个中间量，只算电压会漏掉电流这条腿。）*
2. 稳压器功耗 $P=(U_{in}-U_o)I_o=(10-5)\times0.5=2.5\,\text{W}$，效率 $\eta=P_o/P_{in}=50\%$，一半电能变成了热；
3. TO-220 封装自然散热约 1 W，2.5 W 必须加散热器，热阻按 $R_{\theta JA}=\dfrac{T_{j\max}-T_a}{P}$ 选型。*（为什么按功耗而不是按输出功率选热阻：发热的正是压差那 2.5 W。）*

**回代**：能量守恒 $P_{in}=P_o+P$，即 $5=2.5+2.5$ ✓。这也是手机充电器弃用线性方案的算术原因：同样 5 W 输出，开关电源损耗不到 0.4 W。
:::

::: tip 例 3 · 开关电源的效率对比
**题目**：同样输出 2.5 W，开关电源效率 88%，求输入功率与损耗，并与例 2 对比。

输出还是 2.5 W，效率换到 88%，输入功率只会比它多一点点，损耗是零点几瓦的量级。

步骤：
1. $P_{in}=P_o/\eta=2.5/0.88=2.84\,\text{W}$；*（为什么用除：效率小于 1，输入必须比输出多。）*
2. 损耗 $P_{in}-P_o=0.34\,\text{W}$，只有线性方案 2.5 W 的约七分之一；
3. 损耗去向：MOS 开关损耗、导通损耗、磁芯损耗、控制电路，每一项都是[第 4 章 · 功率放大电路](power-amp.md)功率管选型的翻版。*（为什么列出去向：散热设计需要知道热在哪个器件上，不是只看总数。）*

**回代**：$2.84\times0.88=2.50$ W ✓，回到输出功率，用的是效率定义本身。代价也要写清楚：输出纹波比线性大（mV 级）、EMI 需要滤除、控制环路有稳定性问题（[第 6 章 · 反馈](feedback.md)自激的现场）。
:::

::: tip 例 4 · 电源保护三件套
**题目**：一台成品电源要防哪些异常？各自用什么器件？

这题一个数都不给，方向倒清楚：输入侧防电网，输出侧防短路，自身防过热，三个方向各管一段。

要点：
- 输入过压、欠压：压敏电阻吸收电网浪涌，TVS 管钳位；*（为什么在输入侧：浪涌来自电网，钳位得早，后级才安全。）*
- 过流：线性电源用恒流限或保险丝；开关电源用打嗝模式（hiccup：故障时周期性关断重试，避免持续大电流）；*（为什么打嗝：反复试比持续发热温和，短路移除后能自恢复。）*
- 过热：热敏电阻或芯片内置温度检测，超温关断。*（为什么必须有过热：例 2 的热账在散热器积灰后全部失效。）*

正常工况的参数算完只算了一半，电源设计 80% 的精力花在异常工况。
:::

::: tip 例 5 · 7805 的耗散功率与散热判断 {#ex-dcpower-5}
**题目**：整流滤波后输入 $U_{in}=12\,\text{V}$，用 7805 输出 5 V，负载电流 $I_o=0.5\,\text{A}$。求 7805 的功耗与效率，并判断是否需要散热器。

压差 7 V、0.5 A 的负载电流，$P=(U_{in}-U_o)I_o$ 一乘就是 3.5 W 上下，远超一颗 TO-220 裸装能散的那点热。

<FigBox title="7805 接线：12 V 进、5 V 出，压差 7 V 全耗在芯片上" kind="接线" note="7805 三只脚：IN 接 12 V、GND 接地、OUT 出 5 V。输入输出各并一颗小电容。图上标的 7 V 就是那笔要变成热的压差。">

<svg viewBox="0 0 560 170" role="img" aria-label="7805 接线：12 伏进 IN、5 伏出 OUT、GND 接地，压差 7 伏乘 0.5 安等于 3.5 瓦耗散">
<text x="36" y="72" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="end">12 V</text>
<line x1="44" y1="68" x2="130" y2="68" stroke="var(--vp-c-text-2)" stroke-width="2" />
<rect x="130" y="44" width="110" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
<text x="185" y="72" font-size="13" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">7805</text>
<line x1="240" y1="68" x2="330" y2="68" stroke="var(--vp-c-text-2)" stroke-width="2" />
<text x="336" y="64" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="start">5 V</text>
<line x1="330" y1="68" x2="330" y2="100" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
<text x="336" y="104" font-size="11" fill="var(--vp-c-text-3)" text-anchor="start">I_o = 0.5 A</text>
<line x1="185" y1="92" x2="185" y2="124" stroke="var(--vp-c-text-2)" stroke-width="2" />
<text x="185" y="140" font-size="11" fill="var(--vp-c-text-3)" text-anchor="middle">GND</text>
<line x1="90" y1="68" x2="90" y2="124" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
<text x="90" y="140" font-size="10" fill="var(--vp-c-text-3)" text-anchor="middle">0.33 µF</text>
<line x1="280" y1="68" x2="280" y2="124" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
<text x="280" y="140" font-size="10" fill="var(--vp-c-text-3)" text-anchor="middle">0.1 µF</text>
<text x="185" y="26" font-size="11.5" font-weight="600" fill="var(--vp-c-danger-1)" text-anchor="middle">压差 7 V × 0.5 A = 3.5 W 耗散</text>
</svg>
</FigBox>

步骤：
1. 稳压器功耗 $P=(U_{in}-U_o)I_o=(12-5)\times0.5=3.5\,\text{W}$；
2. 效率 $\eta=\dfrac{U_o}{U_{in}}=\dfrac{5}{12}\approx41.7\%$，一半多电能变成热；*（为什么效率只看电压比：输入输出电流几乎相同，$I_o$ 上下约掉。）*
3. 判断散热：TO-220 裸装自散热的上限 $P_{\max}=\dfrac{T_{j\max}-T_a}{R_{\theta JA}}=\dfrac{125-30}{50}=1.9\,\text{W}$（$T_{j\max}=125\,\text{°C}$、$T_a=30\,\text{°C}$、$R_{\theta JA}\approx50\,\text{°C/W}$）。$3.5>1.9$，必须加散热器；工程上常更保守地按 1 W 估，两种口径下 3.5 W 都远超上限。

**回代**：`(12-5)*0.5 = 3.5`、`5/12*100 = 41.667`、`(125-30)/50 = 1.9`。散热器热阻的完整选型（$R_{\theta JC}+R_{\theta CS}+R_{\theta SA}$ 三段链）在[项目一 · 可调实验电源](../topics/power-supply.md)第 3.5 节已算过，这里不再展开。
:::

::: tip 例 6 · LM317 输出电压的设定 {#ex-dcpower-6}
**题目**：LM317 取 $R_1=240\,\Omega$，$R_2$ 分别取 $240\,\Omega$、$1.2\,\text{k}\Omega$、$2.64\,\text{k}\Omega$，用简化式 $U_o=1.25\left(1+\dfrac{R_2}{R_1}\right)$ 求输出电压。

心算一下：$R_2$ 与 $R_1$ 相等时是 2.5 V；电阻往上加一个数量级，输出也该跟着往上走，7.5 V、15 V 这个量级。LM317 内部把 OUT 与 ADJ 之间钉在 1.25 V，所以 $R_1$ 上流过恒定电流 $1.25/R_1$，这只电流再流过 $R_2$ 到地，抬高了 ADJ 对地的电压，输出就是这两段之和。

<FigBox title="LM317 可调输出：R1 定基准电流、R2 定电压" kind="接线" note="LM317 在 OUT 与 ADJ 之间维持 1.25 V 基准；R1 从 OUT 接到 ADJ、R2 从 ADJ 接到地。改变 R2 就改变输出电压。">

<svg viewBox="0 0 560 215" role="img" aria-label="LM317 可调输出接线：OUT 与 ADJ 之间接 240 欧姆的 R1，ADJ 经 R2 到地，改变 R2 改变输出电压">
<text x="36" y="60" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="end">U_in</text>
<line x1="44" y1="56" x2="130" y2="56" stroke="var(--vp-c-text-2)" stroke-width="2" />
<rect x="130" y="32" width="110" height="48" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
<text x="185" y="60" font-size="13" font-weight="600" fill="var(--vp-c-text-1)" text-anchor="middle">LM317</text>
<line x1="240" y1="56" x2="300" y2="56" stroke="var(--vp-c-text-2)" stroke-width="2" />
<text x="306" y="52" font-size="12.5" fill="var(--vp-c-text-1)" text-anchor="start">U_o</text>
<line x1="185" y1="80" x2="185" y2="150" stroke="var(--vp-c-text-2)" stroke-width="2" />
<line x1="300" y1="56" x2="300" y2="150" stroke="var(--vp-c-brand-2)" stroke-width="1.6" />
<line x1="300" y1="150" x2="185" y2="150" stroke="var(--vp-c-brand-2)" stroke-width="1.6" />
<rect x="222" y="138" width="56" height="24" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-2)" stroke-width="1.4" />
<text x="250" y="154" font-size="10" fill="var(--vp-c-text-2)" text-anchor="middle">R₁ 240Ω</text>
<circle cx="185" cy="150" r="3.5" fill="var(--vp-c-text-2)" />
<text x="250" y="126" font-size="10" fill="var(--vp-c-text-3)" text-anchor="middle">OUT 与 ADJ 之间 1.25 V</text>
<line x1="185" y1="150" x2="185" y2="184" stroke="var(--vp-c-brand-2)" stroke-width="1.6" />
<rect x="164" y="184" width="42" height="22" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-2)" stroke-width="1.4" />
<text x="185" y="199" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">R₂</text>
<line x1="185" y1="206" x2="185" y2="212" stroke="var(--vp-c-brand-2)" stroke-width="1.6" />
<line x1="173" y1="212" x2="197" y2="212" stroke="var(--vp-c-text-2)" stroke-width="2" />
</svg>
</FigBox>

步骤：
1. $R_2=240\,\Omega$：$U_o=1.25\times(1+240/240)=1.25\times2=2.5\,\text{V}$；
2. $R_2=1.2\,\text{k}\Omega$：$U_o=1.25\times(1+1200/240)=1.25\times6=7.5\,\text{V}$；
3. $R_2=2.64\,\text{k}\Omega$：$U_o=1.25\times(1+2640/240)=1.25\times12=15.0\,\text{V}$。

**回代**：`1.25*(1+240/240) = 2.5`、`1.25*(1+1200/240) = 7.5`、`1.25*(1+2640/240) = 15`。注意简化式 $U_o=1.25\left(1+\dfrac{R_2}{R_1}\right)$ 漏掉了 $I_{adj}R_2$ 一项（$I_{adj}\approx50\,\mu\text{A}$），$R_2=1.2\,\text{k}\Omega$ 时真实输出约 7.56 V、多出 60 mV，精确式与分压取值的完整表在[项目一](../topics/power-supply.md)第 3.4 节。
:::

## 手机充电器的技术演进史

- 线性时代（1990s）：变压器 + 整流 + 7805，半斤重、待机功耗大、充电发烫。
- RCC 开关电源（2000s）：自激振荡 + 光耦反馈，效率上 80%，重量减半，但空载功耗高。
- 反激 + 同步整流（2010s）：原边反馈省光耦，同步整流把副边二极管换成 MOS，效率冲到 90%+。开关电源的常见区间就是 85%~95%，比线性方案高出一大截。
- 氮化镓（GaN）时代（2020s）：开关频率提到 MHz 级，变压器缩到核桃大小，65 W 充电器比当年的 5 W 还小。

一条演进线就是这一章的全部：同样的 5 V，从烧掉一半电能到只损耗 10%。

## 易错清单 + 自检

1. $0.9U_2$ 与 $1.2U_2$ 别混。前者是无滤波，后者是带大电容的带载经验值；负载一重，实际值就往 $0.9U_2$ 靠。
2. 峰值与有效值别混。选电容耐压、二极管反压用 $\sqrt2U_2$，算功率用有效值，见[符号与约定 · 大小写](../guide/notation.md)。
3. 纹波频率：半波等于市电频率，全波、桥式是 2 倍市电频率；算 $\Delta U$ 时用错 $f$，结果差一倍。
4. 线性稳压的压差要有余量。78 系列要 $U_{in}-U_o\ge2.5\,\text{V}$，低压差（LDO，low dropout：压差可低至 0.3 V 的线性稳压器）能省热，但稳压性能更挑输入。
5. 别用带载电压选变压器。空载 $1.414U_2$ 会超后级耐压，裕量按空载算。
6. 自检：在 <RectifierDemo /> 里把负载从 5000 Ω 拖到 50 Ω（电流 ×100），观察输出电压平均值往下掉多少、纹波涨多少，然后用例 1 的公式 $\Delta U=I_L/(fC)$ 手算一遍对比。两个数字对上了，滤波电容的选择逻辑就归你了。
