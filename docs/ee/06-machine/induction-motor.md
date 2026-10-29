---
title: 17 · 三相异步电动机原理
description: 旋转磁场从哪来、转差率为什么是理解异步电机的总开关、转矩为什么和电压平方成正比。
---

# 17 · 三相异步电动机原理

<Meta time="40 min" level="核心" note="全章只有两个新概念：旋转磁场和转差率。这两个懂了，剩下的都是单相交流电路的套用" />

三相电怎么能让一个铁疙瘩自己转起来？这是很多人第一次打开接线盒时的疑问。

答案里只有两样新东西：**旋转磁场**和**转差率**。旋转磁场解释「为什么会转」，转差率解释「转得多快、为什么永远追不上同步速」。其余部分都是单相交流电路的老套路，只是搬到了转子那一侧。

讲到尾，旋转磁场从哪来、转速由什么定，应该都能讲清；转差率应该能把转子电流、转子频率、转矩串成一条链；电压一低转矩就崩，原因也应该能自己说出来。

::: tip 读这页之前
要会三相电源是怎么来的（<Prereq id="three-phase-source" />），还有磁路基础（<Prereq id="magnetic-circuit" />）。

符号不多：$n_0$ 是同步转速，$s$ 是转差率，$f_2$ 是转子频率，$T_N$ 是额定转矩，$I_{st}$ 是起动电流，约定见[符号与约定](../../guide/notation.md)。
:::

## 一、旋转磁场：三相制的杀手锏

三个结构完全相同、空间上互差 120° 的绕组（AX、BY、CZ），通进互差 120° 的三相电流。任取一个时刻看，每一相各自产生一个脉动磁通，方向沿本相轴线，大小随时间按正弦变化：

$$
\Phi_A = \Phi_m\sin\omega t,\quad
\Phi_B = \Phi_m\sin(\omega t-120^\circ),\quad
\Phi_C = \Phi_m\sin(\omega t+120^\circ)
$$

三个脉动磁通在空间上叠加，结果是

$$
F(\theta,t) = \frac32 F_m\sin(\theta-\omega t)
$$

这个式子只说两件事。幅值恒定，$\dfrac32F_m$ 不随时间变；位置在动，正弦的峰值出现在 $\theta = \omega t + 90^\circ$，以角速度 $\omega$ 旋转。

<FigBox title="四个瞬间的磁动势分布：波形整体在平移" kind="曲线" note="每条曲线是一个瞬间磁动势沿气隙圆周的分布。对比四条曲线：幅值始终 1.5Fm，波形却整体向 θ 正方向移动。这就是旋转磁场。">
<WavePreset kind="rotfield" />
</FigBox>

::: tip 心智模型：三个脉动合成一个旋转
不必逐点推公式。每一相单独只产生沿本相轴线脉动的磁通，三个脉动在空间上错开 120°，一叠加，合成磁动势就变成幅值恒定、位置匀速旋转。

记住这句：空间互差 120°，时间也互差 120°，结果就是幅值恒定加匀速旋转。转速只由 $n_0=60f/p$ 决定，与负载无关。
:::

转速与极对数怎么挂钩？磁场转一圈（$p=1$，一对极），交流电正好也变化一个周期，所以

$$
n_0 = \frac{60f}{p}\quad(\text{r/min})
$$

| 极对数 $p$ | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| $n_0$（50 Hz） | 3000 | 1500 | 1000 | 750 | 600 |

公式 $n_0 = \dfrac{60f}{p}$ 里的两个量，一个来自电源、一个来自绕组，都和轴上带多少东西无关。感应电机的转速上限就是它。

::: warning 转向只由相序决定
把三根火线中的任意两根对调，电流相序反了，磁场立刻反向。电机正反转控制就靠这个（[第 20 章 · 继电接触器控制](../07-control/relay.md)会用到）。注意是「任意两根」，只对调一根没有用。
:::

## 二、转子为什么转：转差率

旋转磁场以 $n_0$ 转，转子导体切割磁力线，感应出电动势，进而有感应电流，通电导体在磁场里受力，转子就跟着转起来了。

那转子为什么追不上 $n_0$？假设真追上了，$n = n_0$，转子与磁场之间没有相对运动，不切割磁力线，也就没有感应电动势、没有电流、没有力矩。所以转子必须落后一点，落后的程度就是**转差率**：

$$
s = \frac{n_0-n}{n_0}
$$

| 状态 | $s$ | 说明 |
| --- | --- | --- |
| 理想空载 | 0 | 无转矩（实际到不了） |
| 额定运行 | 0.02 ~ 0.06 | 该区间特性很硬 |
| 堵转（起动瞬间） | 1 | $n=0$ |
| 发电制动 | $<0$ | $n > n_0$，回馈电能 |
| 反接制动/能耗制动 | $>1$ | 反转或外加直流 |

::: tip 心智模型：转差率 $s$ 是这台电机的总开关
把 $s$ 当成理解异步电机的唯一入口：转子电动势、频率、电流、功率因数、转矩全部随 $s$ 变（$f_2=sf_1$、$E_{2s}=sE_{20}$、$X_{2s}=sX_{20}$）。每道异步电机题，第一步永远是先定 $s$（由 $n$ 和 $n_0$ 算出），后面所有量都从它展开。

$s$ 还直接告诉你电机在哪个状态：0 是理想空载，额定 0.02~0.06，堵转时 $s=1$，发电时 $<0$。
:::

分清两个转速：$n$ 是转子实际转速，$n_0$ 是磁场转速，两者差多少由负载决定。用定义写出来就是 $s = \dfrac{n_0-n}{n_0}$，分子是转速差，分母是同步速。

转子电路的频率也跟着变，这也是异步电机最妙的地方：

$$
f_2 = sf_1
$$

这个关系和 $E_{2s} = sE_{20}$ 是一套的：转子频率 $f_2 = sf_1$，转子电动势也按 $s$ 打折。额定运行时 $f_2 = 0.04\times50 = 2$ Hz。转子里的电学过程几乎是直流的，绕线式转子能把转差功率回收，根子也在这里。

## 三、转子电路的三个「随 $s$ 变」

转子不动时 $s=1$，转子感应电动势最大，记为 $E_{20}$。转起来之后：

$$
E_{2s} = sE_{20},\qquad
X_{2s} = sX_{20},\qquad
I_2 = \frac{sE_{20}}{\sqrt{R_2^2+(sX_{20})^2}},\qquad
\cos\varphi_2 = \frac{R_2}{\sqrt{R_2^2+(sX_{20})^2}}
$$

四条曲线其实是一张图：转速一降，$s$ 变大，$E_{2s}$ 跟着大、$f_2$ 变高、$X_{2s}$ 变大、$\cos\varphi_2$ 变低。

<FigBox title="转子电流与功率因数随转差率变化" kind="曲线" note="横轴是转差率 s，左轴读转子电流 I₂（A），右轴读功率因数 cosφ₂；数据取本节例 2 的转子参数（E₂₀ = 20 V、R₂ = 0.02 Ω、X₂₀ = 0.08 Ω）。s 从 0.04 拉到 1，电流从 39.4 A 涨到 242 A（6.1 倍），功率因数却从 0.985 掉到 0.24：电流大，无功分量占了大头，所以起动转矩并不大。">

<svg viewBox="0 0 450 262" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="转子电流与功率因数随转差率的变化：起动时电流约为额定 6 倍、功率因数只有 0.24">
<line x1="78" y1="200" x2="384" y2="200" stroke="var(--vp-c-text-2)" stroke-width="1.6"/>
<line x1="78" y1="34" x2="78" y2="200" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/>
<line x1="384" y1="34" x2="384" y2="200" stroke="var(--vp-c-danger-1)" stroke-width="1.6"/>
<line x1="74" y1="200" x2="78" y2="200" stroke="var(--vp-c-brand-1)"/>
<text x="70" y="200" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">0</text>
<line x1="74" y1="161.7" x2="78" y2="161.7" stroke="var(--vp-c-brand-1)"/>
<text x="70" y="161.7" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">60</text>
<line x1="74" y1="123.4" x2="78" y2="123.4" stroke="var(--vp-c-brand-1)"/>
<text x="70" y="123.4" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">120</text>
<line x1="74" y1="85.1" x2="78" y2="85.1" stroke="var(--vp-c-brand-1)"/>
<text x="70" y="85.1" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">180</text>
<line x1="74" y1="46.8" x2="78" y2="46.8" stroke="var(--vp-c-brand-1)"/>
<text x="70" y="46.8" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">240</text>
<line x1="384" y1="200" x2="390" y2="200" stroke="var(--vp-c-danger-1)"/>
<text x="394" y="200" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">0</text>
<line x1="384" y1="158.5" x2="390" y2="158.5" stroke="var(--vp-c-danger-1)"/>
<text x="394" y="158.5" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">0.25</text>
<line x1="384" y1="117" x2="390" y2="117" stroke="var(--vp-c-danger-1)"/>
<text x="394" y="117" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">0.5</text>
<line x1="384" y1="75.5" x2="390" y2="75.5" stroke="var(--vp-c-danger-1)"/>
<text x="394" y="75.5" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">0.75</text>
<line x1="384" y1="34" x2="390" y2="34" stroke="var(--vp-c-danger-1)"/>
<text x="394" y="34" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">1</text>
<line x1="78" y1="200" x2="78" y2="204" stroke="var(--vp-c-text-2)"/>
<text x="78" y="216" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0</text>
<line x1="139.2" y1="200" x2="139.2" y2="204" stroke="var(--vp-c-text-2)"/>
<text x="139.2" y="216" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0.2</text>
<line x1="200.4" y1="200" x2="200.4" y2="204" stroke="var(--vp-c-text-2)"/>
<text x="200.4" y="216" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0.4</text>
<line x1="261.6" y1="200" x2="261.6" y2="204" stroke="var(--vp-c-text-2)"/>
<text x="261.6" y="216" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0.6</text>
<line x1="322.8" y1="200" x2="322.8" y2="204" stroke="var(--vp-c-text-2)"/>
<text x="322.8" y="216" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0.8</text>
<line x1="384" y1="200" x2="384" y2="204" stroke="var(--vp-c-text-2)"/>
<text x="384" y="216" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">1</text>
<text x="231" y="232" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">转差率 s</text>
<text x="30" y="117" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t" transform="rotate(-90 30 117)">I₂ / A</text>
<text x="428" y="117" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t" transform="rotate(90 428 117)">cosφ₂</text>
<polyline points="78,34 81.1,34.1 84.1,34.5 87.2,35.2 90.2,36.1 93.3,37.2 96.4,38.6 99.4,40.1 102.5,41.9 105.5,43.8 108.6,45.9 111.7,48.1 114.7,50.3 117.8,52.7 120.8,55.2 123.9,57.7 127,60.2 130,62.7 133.1,65.3 136.1,67.8 139.2,70.4 142.3,72.9 145.3,75.4 148.4,77.8 151.4,80.2 154.5,82.6 157.6,84.9 160.6,87.2 163.7,89.4 166.7,91.6 169.8,93.7 172.9,95.8 175.9,97.8 179,99.8 182,101.7 185.1,103.5 188.2,105.3 191.2,107.1 194.3,108.8 197.3,110.4 200.4,112 203.5,113.6 206.5,115.1 209.6,116.6 212.6,118 215.7,119.4 218.8,120.7 221.8,122 224.9,123.3 227.9,124.6 231,125.8 234.1,126.9 237.1,128.1 240.2,129.2 243.2,130.3 246.3,131.3 249.4,132.3 252.4,133.3 255.5,134.3 258.5,135.2 261.6,136.2 264.7,137 267.7,137.9 270.8,138.8 273.8,139.6 276.9,140.4 280,141.2 283,142 286.1,142.7 289.1,143.5 292.2,144.2 295.3,144.9 298.3,145.6 301.4,146.2 304.4,146.9 307.5,147.5 310.6,148.1 313.6,148.7 316.7,149.3 319.7,149.9 322.8,150.5 325.9,151 328.9,151.6 332,152.1 335,152.6 338.1,153.2 341.2,153.7 344.2,154.2 347.3,154.6 350.3,155.1 353.4,155.6 356.5,156 359.5,156.5 362.6,156.9 365.6,157.3 368.7,157.8 371.8,158.2 374.8,158.6 377.9,159 380.9,159.4 384,159.7" fill="none" stroke="var(--vp-c-danger-1)" stroke-width="2.2"/>
<polyline points="78,200 81.1,193.6 84.1,187.3 87.2,181 90.2,174.8 93.3,168.7 96.4,162.8 99.4,157 102.5,151.4 105.5,145.9 108.6,140.7 111.7,135.7 114.7,130.9 117.8,126.4 120.8,122 123.9,117.9 127,114 130,110.2 133.1,106.7 136.1,103.4 139.2,100.3 142.3,97.3 145.3,94.6 148.4,91.9 151.4,89.5 154.5,87.1 157.6,84.9 160.6,82.9 163.7,80.9 166.7,79.1 169.8,77.4 172.9,75.8 175.9,74.2 179,72.8 182,71.4 185.1,70.1 188.2,68.9 191.2,67.7 194.3,66.7 197.3,65.6 200.4,64.6 203.5,63.7 206.5,62.8 209.6,62 212.6,61.2 215.7,60.5 218.8,59.8 221.8,59.1 224.9,58.4 227.9,57.8 231,57.2 234.1,56.7 237.1,56.1 240.2,55.6 243.2,55.2 246.3,54.7 249.4,54.2 252.4,53.8 255.5,53.4 258.5,53 261.6,52.7 264.7,52.3 267.7,52 270.8,51.6 273.8,51.3 276.9,51 280,50.7 283,50.5 286.1,50.2 289.1,49.9 292.2,49.7 295.3,49.4 298.3,49.2 301.4,49 304.4,48.8 307.5,48.6 310.6,48.4 313.6,48.2 316.7,48 319.7,47.8 322.8,47.7 325.9,47.5 328.9,47.3 332,47.2 335,47 338.1,46.9 341.2,46.7 344.2,46.6 347.3,46.5 350.3,46.3 353.4,46.2 356.5,46.1 359.5,46 362.6,45.9 365.6,45.7 368.7,45.6 371.8,45.5 374.8,45.4 377.9,45.3 380.9,45.2 384,45.2" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<line x1="90.2" y1="34" x2="90.2" y2="200" stroke="var(--vp-c-text-3)" stroke-dasharray="5 4" stroke-width="1.2"/>
<circle cx="90.2" cy="174.8" r="3.4" fill="var(--vp-c-brand-1)" stroke="none"/>
<circle cx="384" cy="45.2" r="3.4" fill="var(--vp-c-brand-1)" stroke="none"/>
<circle cx="90.2" cy="36.1" r="3.4" fill="var(--vp-c-danger-1)" stroke="none"/>
<circle cx="384" cy="159.7" r="3.4" fill="var(--vp-c-danger-1)" stroke="none"/>
<text x="94.2" y="26" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">额定 s = 0.04</text>
<text x="378" y="38" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">起动 s = 1</text>
<text x="376" y="86" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">242 A ≈ 6.1 I_N</text>
<text x="376" y="173.7" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">0.24</text>
<text x="98.2" y="190.8" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">39.4 A</text>
<text x="268" y="26" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t">cosφ₂ = 0.985</text>
<line x1="78" y1="246" x2="100" y2="226" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
<text x="106" y="246" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">转子电流 I₂（左轴，A）</text>
<line x1="268" y1="246" x2="290" y2="226" stroke="var(--vp-c-danger-1)" stroke-width="2.4"/>
<text x="296" y="246" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-2)" class="sf-t">功率因数 cosφ₂（右轴）</text>
</svg>

</FigBox>

## 四、转矩从哪来

转子电流与磁场作用，产生转矩 $T$。把 $I_2$ 的表达式代入 $T = K_T\Phi I_2\cos\varphi_2$：

$$
T = K\,\frac{sR_2\,U_1^2}{R_2^2+(sX_{20})^2}
$$

从这个式子能直接读出三条：

1. $T \propto U_1^2$。电网电压降 10%，转矩掉 19%（$0.9^2 = 0.81$）。曲线的高度整个由 $U_1^2$ 撑着，所以降压起动时 $T_{st}$ 掉得比电压还狠。这是异步电机最脆的地方。
2. $T_{max}$ 与 $R_2$ 无关，只由 $U_1^2$ 和 $X_{20}$ 决定；$R_2$ 只改变 $T_{max}$ 出现的位置。绕线式转子外串电阻，就是拿这条做文章：起动电流能压到 3~5 倍，起动转矩反而抬上去，代价是运行效率。
3. 起动时矛盾出在这里：$s=1$ 时 $X_{20}$ 全部上场，$\cos\varphi_2$ 很低。于是起动电流通常是 $I_{st} = (5\sim7)I_N$，起动转矩却只有 $(1\sim2)T_N$，电流大而拉不动重载。

<FigBox title="转矩-转差率特性：三条曲线的故事" kind="曲线" note="橙线是固有特性；蓝线是转子串电阻（T_max 不变、位置右移、起动转矩从 0.29 涨到 0.80）；紫虚线是降压（整条曲线按平方衰减，起动转矩只剩 0.19）。">
<WavePreset kind="torslip" />
</FigBox>

## 五、铭牌数据

| 项目 | 含义 | 易错点 |
| --- | --- | --- |
| 额定功率 $P_N$ | 轴上输出的机械功率 | 不是输入电功率 |
| 额定电压 $U_N$ | 定子线电压 | 铭牌 380/220 两种接法 |
| 额定电流 $I_N$ | 定子线电流 | 同上 |
| 额定转速 $n_N$ | 额定负载下的转速 | 略低于 $n_0$ |
| $\cos\varphi_N$、$\eta_N$ | 额定功率因数与效率 | 两项都要用 |

两个常用换算：

$$
P_{1N} = \sqrt3\,U_NI_N\cos\varphi_N,\qquad P_N = \eta_NP_{1N}
$$

额定转矩是最常用的一个数：

$$
\boxed{T_N = 9550\,\frac{P_N(\text{kW})}{n_N(\text{r/min})}\ \text{N·m}}
$$

::: tip 9550 的来历
$T = P/\omega = P/(2\pi n/60)$，$P$ 用 W 代入得 $T = \dfrac{60}{2\pi}\cdot\dfrac{P}{n} = 9.55\,\dfrac{P}{n}$；$P$ 换成 kW（乘 1000）就是 $9550\,\dfrac{P(\text{kW})}{n}$。记住推导，就不用记数字。
:::

## 六、例题

4 道题按「先原理、后铭牌」的顺序排，每题都是先定 $s$ 再算别的。

::: tip 例 1 · 求同步转速、转差率、转子频率
一台 6 极三相异步电动机（$p=3$），$f_1 = 50$ Hz，额定转速 $n_N = 960$ r/min。求 $n_0$、$s_N$、转子电动势频率 $f_{2N}$。

先想什么：三个量串成一条链，先由 $p$ 和 $f_1$ 定 $n_0$，再用 $n_0$ 与 $n_N$ 求 $s_N$，最后用 $s_N$ 算 $f_{2N}=s_Nf_1$。顺序不能乱，$n_0$ 是地基。现场没有 $p$ 时，先拿转速牌反推最接近的标准同步转速。

解

$$
n_0 = \frac{60f_1}{p} = \frac{60\times50}{3} = 1000\ \text{r/min}
$$

$$
s_N = \frac{n_0-n_N}{n_0} = \frac{1000-960}{1000} = 0.04
$$

$$
f_{2N} = s_Nf_1 = 0.04\times50 = 2\ \text{Hz}
$$

反向技巧：现场只看到转速牌，先找最接近的标准同步转速（3000/1500/1000/750/600）反推极对数。960 最接近 1000，所以 $p=3$，即 6 极。

::: warning 一个常见错误
$s = (n_0-n)/n$（分母用 $n$）是错的。分母永远是 $n_0$。若按错的算：$(1000-960)/960 = 0.0417$，差 4%，后续 $E_{2s}$、$I_2$ 全跟着偏。
:::
:::

::: tip 例 2 · 转子电路：起动 vs 额定（本章最值的题）
某异步电动机转子参数（折算到副边）：$E_{20} = 20$ V、$R_2 = 0.02\,\Omega$、$X_{20} = 0.08\,\Omega$。求 $s = 1$（起动）和 $s = 0.04$（额定）时的转子电流和功率因数。

先想什么：转子电路的核心，是把「频率随转差变」这件事装进等效电路：感应电动势 $E_{2s}=sE_{20}$，漏电抗也变成 $sX_{20}$，电阻 $R_2$ 不变。所以起动（$s=1$）和额定（$s=0.04$）只是同一个电路换两组参数。每档都按「先电动势、再阻抗模、最后电流与功率因数」三步走，两档算完再比，规律一眼就出来。

<FigBox title="转子等效电路：频率被转差率 s 收进电路" kind="概念" note="转子侧等效为 $R_2$ 串 $sX_{20}$，感应电动势 $sE_{20}$。起动时 $s=1$，电抗最大；额定 $s=0.04$，电抗缩到 1/25，功率因数随之从 0.24 升到 0.985。">

<svg viewBox="0 0 340 130" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
  <text x="16" y="18" fill="currentColor" stroke="none" font-size="11">转子等效电路</text>
  <line x1="62" y1="40" x2="110" y2="40" stroke="currentColor"/>
  <rect x="110" y="25" width="50" height="30" rx="4" fill="none" stroke="currentColor"/>
  <text x="135" y="40" fill="currentColor" stroke="none" font-size="11" text-anchor="middle" dominant-baseline="middle">R₂</text>
  <line x1="160" y1="40" x2="190" y2="40" stroke="currentColor"/>
  <rect x="190" y="25" width="50" height="30" rx="4" fill="none" stroke="currentColor"/>
  <text x="215" y="40" fill="currentColor" stroke="none" font-size="11" text-anchor="middle" dominant-baseline="middle">sX₂₀</text>
  <line x1="240" y1="40" x2="286" y2="40" stroke="currentColor"/>
  <line x1="286" y1="40" x2="286" y2="96" stroke="currentColor"/>
  <line x1="62" y1="96" x2="286" y2="96" stroke="currentColor"/>
  <line x1="62" y1="40" x2="62" y2="48" stroke="currentColor"/>
  <circle cx="62" cy="58" r="10" fill="none" stroke="currentColor"/>
  <path d="M56 58 q3 -5 6 0 q3 5 6 0" fill="none" stroke="currentColor"/>
  <line x1="62" y1="68" x2="62" y2="96" stroke="currentColor"/>
  <text x="44" y="58" fill="currentColor" stroke="none" font-size="10" text-anchor="end" dominant-baseline="middle">sE₂₀</text>
  <text x="174" y="84" fill="currentColor" stroke="none" font-size="10" text-anchor="middle" dominant-baseline="middle">I₂ = sE₂₀ / √(R₂² + (sX₂₀)²)</text>
</svg>

</FigBox>

解

额定档，$s = 0.04$：

$$
E_{2s} = sE_{20} = 0.04\times20 = 0.8\ \text{V}
$$

$$
|Z_2| = \sqrt{R_2^2+(sX_{20})^2} = \sqrt{0.02^2+0.0032^2} = 0.0203\ \Omega
$$

$$
I_2 = \frac{0.8}{0.0203} = 39.4\ \text{A},\qquad
\cos\varphi_2 = \frac{0.02}{0.0203} = 0.985
$$

起动档，$s = 1$：

$$
E_{2s} = 20\ \text{V},\qquad |Z_2| = \sqrt{0.02^2+0.08^2} = 0.0825\ \Omega
$$

$$
I_2 = \frac{20}{0.0825} = 242\ \text{A},\qquad
\cos\varphi_2 = \frac{0.02}{0.0825} = 0.24
$$

两档摆在一起：

| | $s=0.04$ | $s=1$ | 倍数 |
| --- | --- | --- | --- |
| $E_{2s}$ | 0.8 V | 20 V | 25 |
| $I_2$ | 39.4 A | 242 A | 6.1 |
| $\cos\varphi_2$ | 0.985 | 0.24 | 0.24 |

::: warning 这道题解释了「起动矛盾」
电流大了 6 倍，但 $\cos\varphi_2$ 从 0.985 掉到 0.24，无功分量占了四分之三。而转矩只看有功分量 $I_2\cos\varphi_2$：

$$
\frac{T_{st}}{T_N} \approx \frac{242\times0.24}{39.4\times0.985} = \frac{58.1}{38.8} = 1.5
$$

起动电流是额定的 6 倍，起动转矩只有额定的 1.5 倍。这就是为什么要专门研究起动方法（[第 18 章 · 机械特性 · 起动 · 调速](motor-characteristic.md)）。
:::

验算：取额定档复核 $I_2=E_{2s}/|Z_2|=0.8/0.0203\approx39.4$ A，$\cos\varphi_2=R_2/|Z_2|=0.02/0.0203\approx0.985$（欧姆定律与阻抗定义复核）；起动档同样校验 $20/0.0825\approx242$ A、$\cos\varphi_2=0.24$，两档比值与对比表一致 ✓。
:::

::: tip 例 3 · $T \propto U_1^2$ 的后果
某电机 $T_{st} = 1.5T_N$。电网电压降到 90%（其他不变），求起动转矩变成多少；若降到 80% 呢？

先想什么：这道题只有一个关系要记牢，转矩和电压平方成正比（$T\propto U_1^2$），电压降一成，转矩掉近两成。所以把新电压百分比平方，再乘原 $T_{st}$ 即可。两个电压各算一次，真正的门槛在最后一句判断：降到 80% 时，起动转矩已经跌破额定。

解

$$
\frac{T'_{st}}{T_{st}} = \left(\frac{U'_1}{U_1}\right)^2
$$

电压 90%：

$$
T'_{st} = 1.5\times0.9^2 = 1.5\times0.81 = 1.22\,T_N
$$

电压 80%：

$$
T'_{st} = 1.5\times0.8^2 = 1.5\times0.64 = 0.96\,T_N
$$

结论：电压降到 80% 时，起动转矩已经小于额定转矩。若负载接近额定，电机根本起不来，或者起动过程中过热保护跳闸。所以 $T \propto U_1^2$ 要当铁律看：电压 90% 只剩 81% 的转矩，电压 80% 只剩 64%。

::: tip 工程现场
夏天用电高峰电压偏低，「空调压缩机嗡嗡响不启动」就是这个原因。判断方法：测起动时的端电压，低于 85% $U_N$ 先解决电压问题，别怀疑电机。
:::
:::

::: tip 例 4 · 铭牌求额定转矩
一台电机 $P_N = 10$ kW、$n_N = 1450$ r/min。求额定转矩。若 $\eta_N = 0.88$、$\cos\varphi_N = 0.87$，求额定电流（380 V）。

先想什么：铭牌的 10 kW 是轴上输出，求电流必须先回到输入电功率：除以效率得到 $P_{1N}$，再用三相功率公式反解 $I_N$。转矩则用机械公式 $T_N=9550P_N/n_N$ 一步出。一句话，功率换算走「输出除以效率得输入」，别把效率乘反。

解

$$
T_N = 9550\times\frac{P_N}{n_N} = 9550\times\frac{10}{1450} = 65.9\ \text{N·m}
$$

先求输入功率，注意铭牌 10 kW 是输出：

$$
P_{1N} = \frac{P_N}{\eta_N} = \frac{10}{0.88} = 11.36\ \text{kW}
$$

再求线电流：

$$
I_N = \frac{P_{1N}}{\sqrt3\,U_N\cos\varphi_N}
= \frac{11360}{\sqrt3\times380\times0.87}
= 19.9\ \text{A}
$$

验算：$\sqrt3\times380\times19.9\times0.87 = 11.4$ kW（输入电功率），再乘效率 $0.88\times11.4 = 10.0$ kW，正好是铭牌输出 ✓

::: warning 本题最值得记的一件事
$P_N = \sqrt3\,U_NI_N\cos\varphi_N\times\eta_N$，电功率乘效率才是轴上功率。两条路都走得通：先除效率求电功率，或者把效率直接写进分母，结果一样；混着用就会差一个 $\eta^2$。这个坑几乎每个班都有人踩，而且一验算就露馅，所以例题一定要验算。
:::
:::

## 七、工程实例

一般电机的额定转差率落在 0.02 ~ 0.06 之间，这个数直接反映转子电阻的大小。现场判断一台电机处在什么状态，按顺序问三个问题就够了：

1. 按铭牌极对数和电源频率，$n_0$ 算出来是多少？
2. 实测转速 $n$ 与它差多少？$s$ 就出来了。
3. $s$ 落在哪个区间？0.02 上下是正常带载，贴近 1 说明堵转，为负说明在被外力拖着转。

电机铭牌上为什么写 380/220 V 两种电压？先把两个电压名分清（<Prereq id="three-phase-source" />）：线电压 $U_l$ 是两根火线之间的电压，相电压 $U_p$ 是火线对中性点、也就是对每相绕组的电压，Y 接时 $U_l=\sqrt3\,U_p$。

铭牌上「380/220 V」斜杠两侧都是线电压。同一台电机的每相绕组按 220 V 设计：电源线电压 380 V 时接成 Y，每相拿到 $380/\sqrt3=220$ V；电源线电压 220 V 时接成 △，△ 接的线电压就等于相电压，每相也是 220 V。接法错了，电机要么欠压要么过压。380 V 电源上把该接 Y 的电机接成 △，每相承受 380 V，会直接烧毁。

变频调速为什么还要同时调压？由 $U_1 \approx 4.44f_1N_1\Phi_m$，只降 $f_1$ 而 $U_1$ 不变的话，$\Phi_m \propto 1/f_1$ 会增大，铁心饱和，励磁电流暴增。所以变频时必须保持 $U_1/f_1$ 恒定（[第 18 章 · 机械特性 · 起动 · 调速](motor-characteristic.md)）。

## 八、易错清单

1. $n_0 = 60f/p$ 与负载无关；$n$ 随负载略降，两者不是一回事。
2. $s$ 的分母是 $n_0$，不是 $n$。
3. 转子频率 $f_2 = sf_1$ 额定只有 1~3 Hz，不是 50 Hz。
4. $T \propto U_1^2$：电压降 10% 转矩掉 19%，不是 10%。
5. 起动电流大（5~7 倍）但起动转矩不大，因为 $\cos\varphi_2$ 太差。
6. 铭牌功率是轴上输出，换算电流时别忘了效率。
7. 对调两根火线才能反转，对调一根无效。
8. $T_{max}$ 与 $R_2$ 无关，$R_2$ 只移动它的位置。

## 九、考点速记

| 题型 | 关键 |
| --- | --- |
| 求 $n_0$、$s$、$f_2$ | $n_0=60f/p$，$s=(n_0-n)/n_0$，$f_2=sf_1$ |
| 求转子电流/功率因数 | $I_2 = sE_{20}/\sqrt{R_2^2+(sX_{20})^2}$ |
| 电压变化对转矩的影响 | 按平方折算 |
| 铭牌求转矩 | $T_N = 9550P_N/n_N$ |
| 铭牌求电流 | $I_N = P_N/(\sqrt3U_N\cos\varphi_N\eta_N)$ |

## 下一步

<Prereq id="slip" /> → [18 · 机械特性 · 起动 · 调速](./motor-characteristic.md)
