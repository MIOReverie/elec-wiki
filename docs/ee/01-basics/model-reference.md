---
title: 01 · 电路模型与参考方向
description: 真器件凭什么能换成理想符号、电位电压电动势差在哪、箭头画反了会怎样，最后用一节旧电池讲清「有电压却带不动」。
---

# 01 · 电路模型与参考方向

<Meta time="45 min" level="核心" note="算出来的负号不是错，是方向在说话" />

手电筒里装两节 1.5 V 的电池，其中一节装反了，灯不亮。多数人的第一反应是「反的那节没电了」，可把它取出来单独量，好好的 1.5 V。真正发生的事是：两节电池串联时方向相反，净电动势 $1.5-1.5=0$ V，电路里根本没有电流（就是下面这张图）。

<FigBox title="两节电池反着接：净电动势为零" kind="电路" note="串联时电动势按方向相加。+ 对着 +，两个电动势互相顶住，净值为 0；只有当两节的 + 与 − 首尾相接时，电动势才相加。">

<svg viewBox="0 0 440 236" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="80" y1="76" x2="80" y2="112"/>
<g transform="translate(80 138) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="80" y1="164" x2="80" y2="200"/>
<line x1="80" y1="76" x2="188" y2="76"/>
<g transform="translate(210 76)">
<line x1="-22" y1="0" x2="-10" y2="0"/>
<circle cx="0" cy="0" r="10" fill="none"/>
<line x1="-5" y1="-5" x2="5" y2="5"/>
<line x1="5" y1="-5" x2="-5" y2="5"/>
<line x1="10" y1="0" x2="22" y2="0"/>
</g>
<line x1="232" y1="76" x2="340" y2="76"/>
<text x="210" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">小灯泡</text>
<line x1="340" y1="200" x2="340" y2="164"/>
<g transform="translate(340 138) rotate(-90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="340" y1="112" x2="340" y2="76"/>
<line x1="80" y1="200" x2="340" y2="200"/>
<text x="80" y="120" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">E₁ 1.5 V</text>
<text x="352" y="120" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">E₂ 1.5 V</text>
<text x="64" y="80" text-anchor="end" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="64" y="196" text-anchor="end" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<text x="356" y="196" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="356" y="80" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<text x="210" y="130" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">I = 0（没有电流）</text>
</svg>

</FigBox>

同一件事还有另一种表现。你量一节用旧的电池，读数 1.35 V，看起来「有电压」，装进闹钟，闹钟立刻停。电压是有的，带不动而已。

这两个现象都不是元件坏了，是图没画全、方向没标对。你手上的电路图里，元件早被换成了理想符号，图上那些箭头也不是电路里真存在的东西。凭什么能换，箭头是谁画的，算出来是负数要不要改，这三件事得先说清楚。

::: tip 读这页之前
会欧姆定律 $U=IR$、会算串并联分压就够，忘了也不要紧，用到时会重算一遍（<Prereq id="ohm" />、<Prereq id="series-parallel" />）。电压是两点之间的电位差（V），电流是每秒通过截面的电荷量（A），电阻是对电流的阻碍（Ω），功率的单位是瓦（W）。复数、微积分、相量一概不用，这里只用加减乘除。

本页符号：$U_{ab}$ 是 a 点相对 b 点的电压，$E$ 是电源电动势，$R_0$ 是电源内阻，$R_L$ 是负载电阻，$P$ 是功率。全部约定见[符号与约定](../../guide/notation.md)。
:::

## 一、什么能换成理想符号

一个真实器件能不能用一个理想符号代表，判据只有一条：接上任意一个外电路，模型在**端口**上表现出的电压-电流关系和真器件一致。端口指元件对外的两个接线端，只看这两端之间的电压和流进的电流，内部发生什么一概不管。

| 器件 | 真实情况 | 模型 | 丢掉的是什么 |
| --- | --- | --- | --- |
| 电阻 | 温度升高后阻值变大 | 理想电阻 $R$（常数） | 温度效应 |
| 电感 | 绕组有电阻、匝间有电容 | 理想电感 $L$ | 损耗、高频特性 |
| 电容 | 有漏电流、有等效串联电阻 | 理想电容 $C$ | 漏电、频率上限 |
| 干电池 | 电动势随放电缓慢下降 | 电动势 $E$ 串内阻 $R_0$ | 电动势的漂移 |
| 交流电源 | 频率与电压都有波动 | 定频定压的理想源 | 波动与内阻 |

表里每一行都是一次取舍。干电池被写成「电动势串内阻」，是因为你只从两个电极取电，关心的是这两个电极之间的电压怎么随电流变，电极内部那套化学反应怎么进行，对端口没有直接影响。电感被写成理想 $L$，前提是工作频率不高、绕组电阻小到可以并进外电路一起算。

被丢掉的统称非理想特性。工程上还习惯用三个词给电路分类，这三个词后面反复出现，值得先认识：

- 线性与非线性，看元件参数是不是常数。阻值不随电压电流变的叫线性，叠加定理只在**线性**电路里成立。
- 时变与定常，看参数是否随时间变化。这门课只处理定常电路，也就是参数不随时间变的电路。
- 集中参数与分布参数，看电路尺寸是否远小于工作波长。尺寸能与波长相比时（长线、高频），同一根导线上各处的电压电流都不相同，必须按分布参数处理，那时 KCL、KVL（基尔霍夫两条定律，下一页细讲）会失效。

::: tip 为什么可以「丢掉」
因为在题目给定的条件下，丢掉的量远小于保留的量：直流稳态下电感的绕组电阻可以忽略；50 Hz 工频下的变压器，铁损相对传输功率很小。

这是受控的近似，不是「无所谓」。真要精确，做法是在理想元件旁边再并上或串上一个小小的非理想元件，比如给电容并一个漏电阻 $R_{\text{漏}}$。题目一旦给了漏电阻，就必须老实算进去。
:::

模型是一份只对端口负责的合同。合同要能用，得先把三个词的用法统一：电压、电位、电动势。这三个词天天混着用，混错一次，后面每道题的符号都跟着错。

## 二、电压、电位、电动势：三个词先分清

先立一个参照。**电位**（electric potential，符号 $V$）是某一点相对参考点的高度，单位也是伏。参考点由你指定，规定它的电位为 0；工程上常把电源负极、机壳或接地符号处定为 0。单下标就表示这一点相对参考点的电位，例如 $V_a$。

有了高度，两点之间的差就是**电压**（voltage，符号 $U$）：$U_{ab}=V_a-V_b$，即 a 点比 b 点高多少伏，所以电压也叫电位差。注意它天生是两个点的事：只说「这点的电压」并不严谨，要么补上「相对谁」，要么你说的是电位。

**电动势**（electromotive force，符号 $E$）是另一回事：它描述电源内部把正电荷从负极搬到正极的能力，单位同样是伏。电动势是电源自身的属性，电压是两点之间的差。两者在开路时数值相等（$U=E$），一有电流就拉开差距，差值就是内阻上的压降。

| 名称 | 符号 | 单位 | 参照物 | 一句话读法 |
| --- | --- | --- | --- | --- |
| 电位 | $V_a$ | V | 参考点（人为定 0） | 这一点有多高 |
| 电压 | $U_{ab}$ | V | 另一点 b | a 比 b 高多少 |
| 电动势 | $E$ | V | 电源自身 | 电源能搬多高 |

电子线路里更常见的写法是单下标：把地定为参考点，所有电压都写成对地的值，$V_{CC}$、$V_{BE}$ 都是这个意思。看到单下标就该想到「它对地」，看到双下标就该想到「前一个减后一个」。

::: warning 一句话区分电位与电压
电位是高度，换参考点会整体平移；电压是高度差，换参考点一点不变。后面算电位时会反复用到这句话。
:::

三个词分清之后，剩下一件事：图上那条箭头该画在哪、指向谁。

## 三、箭头是人画的：参考方向

**参考方向**（reference direction）是解题前你人为选定的正方向：电流用一支箭头表示「我假定电流往这边流」，电压用一对「+ −」或一支箭头表示「我假定这边电位高」。它和真实方向没有关系，真实方向由计算结果告诉你。

电压的参考方向写作双下标：$U_{ab}$ 就是从 a 指向 b、电位降低的那个方向。下标的顺序就是减法的顺序，所以 $U_{ab}=V_a-V_b$；两个下标换个位置，数值跟着反号，而 $V_a-V_b$ 这个差本身一点没变。于是

$$
U_{ab}=V_a-V_b,\qquad U_{ab}=-U_{ba}
$$

<FigBox title="U_ab 的参考方向就是一支从 a 指向 b 的箭头" kind="电路" note="双下标的顺序 = 减法的顺序 = 箭头的方向。把箭头反过来标成 U_ba，数值整体反号，物理一点没变。">

<svg viewBox="0 0 740 192" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="205" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">U_ab 的参考方向：从 a 指向 b</text>
<circle cx="110" cy="86" r="4" class="sf-dot"/>
<circle cx="300" cy="86" r="4" class="sf-dot"/>
<line x1="110" y1="86" x2="300" y2="86"/>
<text x="110" y="62" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">a</text>
<text x="300" y="62" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">b</text>
<text x="124" y="62" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="286" y="62" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<line x1="140" y1="110" x2="264.4" y2="110"/>
<path d="M270 110 L262.7 113.26 L262.7 106.74 Z" class="sf-solid"/>
<text x="203.79" y="136" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="211.85" y="143.15" text-anchor="start" dominant-baseline="middle" font-size="9.36" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">ab</text>
<text x="205" y="172" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">U_ab = V_a − V_b：a 比 b 高多少</text>
<text x="565" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">反过来标：从 b 指向 a</text>
<circle cx="470" cy="86" r="4" class="sf-dot"/>
<circle cx="660" cy="86" r="4" class="sf-dot"/>
<line x1="470" y1="86" x2="660" y2="86"/>
<text x="470" y="62" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">b</text>
<text x="660" y="62" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">a</text>
<line x1="500" y1="110" x2="624.4" y2="110"/>
<path d="M630 110 L622.7 113.26 L622.7 106.74 Z" class="sf-solid"/>
<text x="563.79" y="136" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="571.85" y="143.15" text-anchor="start" dominant-baseline="middle" font-size="9.36" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">ba</text>
<text x="565" y="172" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">U_ba = V_b − V_a = −U_ab</text>
</svg>

</FigBox>

新手第一大错是把 $U_{ab}$ 写成 $V_b-V_a$。自检的办法只有一个：用具体数字代一遍。若 $V_a=3$ V、$V_b=5$ V，则 $U_{ab}=3-5=-2$ V，负号说明 b 点电位反而更高。算出负数不要去改电路图，那是答案的一部分。

电流的参考方向是一支箭头。电流箭头得和电压的「+ −」配成一对，这一对怎么配，决定了后面所有公式的符号。

**关联方向**（associated direction，也叫被动符号约定）：电流从标着「+」的那一端流入元件内部。此时元件在「吃」功率，电压与电流的关系是最顺的形式 $U=IR$。非关联方向：电流从「+」端流出，此时 $U=-IR$。

有一件事值得早点养成习惯：动笔之前先把每个元件上的电流箭头、电压「+ −」都标出来，标完再列方程，中途不再改。标错不丢人，标了又改才丢人，因为改一处，全题符号都得重来。

<FigBox title="关联与非关联：只看电流从「+」端进还是出" kind="电路" note="同一个元件、同一套电压电流，只因电流箭头方向不同，公式就差一个负号。所以每道题的第一步永远是：标好箭头，再判关联性。">

<svg viewBox="0 0 640 182" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="150" y="34" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">关联：电流从 + 端流入</text>
<rect x="110" y="70" width="90" height="60" rx="0" fill="none"/>
<line x1="56" y1="100" x2="110" y2="100"/>
<line x1="200" y1="100" x2="254" y2="100"/>
<text x="124" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="186" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<line x1="62" y1="100" x2="98.4" y2="100"/>
<path d="M104 100 L96.7 103.26 L96.7 96.74 Z" class="sf-solid"/>
<text x="80" y="84" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="150" y="160" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">P = +UI：算出来 &gt; 0 表示吸收</text>
<text x="470" y="34" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">非关联：电流从 + 端流出</text>
<rect x="430" y="70" width="90" height="60" rx="0" fill="none"/>
<line x1="376" y1="100" x2="430" y2="100"/>
<line x1="520" y1="100" x2="574" y2="100"/>
<text x="444" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="506" y="86" text-anchor="middle" dominant-baseline="middle" font-size="14" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<line x1="424" y1="100" x2="387.6" y2="100"/>
<path d="M382 100 L389.3 96.74 L389.3 103.26 Z" class="sf-solid"/>
<text x="400" y="84" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="470" y="160" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">P = −UI：同一套电压电流，符号反号</text>
</svg>

</FigBox>

::: warning 符号规则，整页只需记这一条
代数上一律按参考方向算，符号会自动告诉你答案对不对。

若算得 $I=-3$ A，含义是实际电流 3 A、方向与你假设的相反。不要重算，也不要怀疑电路图：写 $-3$ A 或者把箭头反过来写 $3$ A 都对。唯一不能做的是把负号丢掉。
:::

## 四、功率：符号跟着方向走

参考方向定了，关联性判了，功率的符号就只剩机械的读法。

**吸收功率**（absorbed power）是元件从电路里拿走、转成热或存进电场磁场的功率；发出功率是元件向电路送出功率。同一个元件在同一时刻只能是一种，靠符号区分。

关联方向下，吸收功率就是 $P=UI$；非关联方向就是 $P=-UI$。先按关联方向写：

$$
P=UI \quad\text{（任意元件，关联方向）}
$$

$P>0$ 表示吸收，$P<0$ 表示发出。非关联方向整体反号：电流从「+」端流出，功率按 $-UI$ 算，符号判断的规则不变。

对纯电阻，无论方向怎么标都吸收，因为

$$
P_R=I^2R=\frac{U^2}{R}\ge 0
$$

四种元件的功率去向可以归成一张表：

| 元件 | 功率性质 |
| --- | --- |
| 电阻 | 纯耗散，永远吸收 |
| 电感、电容 | 储能，与电路来回交换，$P$ 可正可负 |
| 理想电压源 | 电流为零时才不输出功率，否则一般发出 |
| 实际电源 | 一般发出（$P<0$），被充电时吸收 |

换个角度读这张表：电阻只吸收，储能元件来回交换，电源通常发出。算完一题，若发现某个电阻在发出功率，那不会是电阻错了，一定是符号标错了。

**全电路功率平衡**：$\sum P=0$，即发出的总功率等于吸收的总功率。这是最省时间的验算手段：算完所有支路（支路就是一段电路），把功率加一遍，应该正好为零。不平衡说明某个符号搞错了，比重新解一遍方程快得多。

::: tip 为什么纯电阻 $P\ge0$ 值得单独记
它意味着纯电阻网络里电流必然从高电位流向低电位，不用先分析方向：$I=U/R$ 且 $R>0$，$U>0$ 时 $I$ 一定从「+」流向「−」。

含电源的网络不能这样推。电源内部电流是从低电位流向高电位的，那正是电源在推动电荷。所以含源元件里电流的真实方向，只能算完看符号。
:::

功率的记账规则到此闭合。把它用到最常见的一类元件上：电源。

## 五、内阻把外特性压弯

一节旧电池「有电压却带不动负载」，原因就在内阻。

**内阻**（internal resistance，符号 $R_0$）是电源内部对电流的阻碍，把发热、电极极化、电解液电阻等一切内部损耗折算成的一个串联电阻。它不是某个零件的阻值，而是等效出来的一个数，所以同型号的新旧电池，$R_0$ 能差好几倍。

模型是理想电动势 $E$ 串内阻 $R_0$。接上负载 $R_L$ 后：

$$
I=\frac{E}{R_0+R_L},\qquad U_L=E-IR_0=\frac{E\,R_L}{R_0+R_L}
$$

把 $U$ 对 $I$ 画出来是一条直线，方程就是 $U=E-IR_0$，这条线叫**外特性**（外部端电压随输出电流变化的曲线）。直线的两个截距可以直接读：

$$
U=E-IR_0\quad\Longrightarrow\quad \text{纵截距}=U_{oc}=E,\qquad \text{横截距}=I_{sc}=\frac{E}{R_0}
$$

内阻越大，外特性越软，带负载的能力越差，这是电源最要紧的品质指标。下面这张图画了三种典型状态。

<FigBox title="电源的三种状态：开路、有载、短路" kind="电路" note="开路时电流为零、端电压等于电动势；有载时端电压被内阻拉低；短路时端电压为零、电流只由内阻决定，全部功率烧在电源内部。">

<svg viewBox="0 0 700 224" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="110" y="32" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">开路</text>
<line x1="60" y1="66" x2="60" y2="67"/>
<g transform="translate(60 93) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="60" y1="119" x2="60" y2="120"/>
<text x="78" y="93" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">E</text>
<line x1="60" y1="120" x2="60" y2="123"/>
<g transform="translate(60 147) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="60" y1="171" x2="60" y2="174"/>
<text x="78" y="147" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₀</text>
<line x1="60" y1="66" x2="160" y2="66"/>
<line x1="60" y1="174" x2="160" y2="174"/>
<line x1="160" y1="66" x2="160" y2="100"/>
<line x1="160" y1="140" x2="160" y2="174"/>
<line x1="151" y1="112" x2="169" y2="112" stroke-dasharray="3 3"/>
<line x1="151" y1="128" x2="169" y2="128" stroke-dasharray="3 3"/>
<text x="166" y="62" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">A</text>
<text x="166" y="162" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">B</text>
<text x="110" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">I = 0，U = E</text>
<text x="330" y="32" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">有载</text>
<line x1="280" y1="66" x2="280" y2="67"/>
<g transform="translate(280 93) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="280" y1="119" x2="280" y2="120"/>
<text x="298" y="93" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">E</text>
<line x1="280" y1="120" x2="280" y2="123"/>
<g transform="translate(280 147) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="280" y1="171" x2="280" y2="174"/>
<text x="298" y="147" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₀</text>
<line x1="280" y1="66" x2="380" y2="66"/>
<line x1="280" y1="174" x2="380" y2="174"/>
<line x1="380" y1="66" x2="380" y2="96"/>
<g transform="translate(380 120) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="380" y1="144" x2="380" y2="174"/>
<text x="398" y="120" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R_L</text>
<text x="386" y="62" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">A</text>
<text x="386" y="162" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">B</text>
<text x="330" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">U = E − I·R₀</text>
<text x="550" y="32" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">短路</text>
<line x1="500" y1="66" x2="500" y2="67"/>
<g transform="translate(500 93) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="500" y1="119" x2="500" y2="120"/>
<text x="518" y="93" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">E</text>
<line x1="500" y1="120" x2="500" y2="123"/>
<g transform="translate(500 147) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="500" y1="171" x2="500" y2="174"/>
<text x="518" y="147" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₀</text>
<line x1="500" y1="66" x2="600" y2="66"/>
<line x1="500" y1="174" x2="600" y2="174"/>
<line x1="600" y1="66" x2="600" y2="174"/>
<text x="590" y="120" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">短路</text>
<text x="606" y="62" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">A</text>
<text x="606" y="162" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">B</text>
<text x="550" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">U = 0，I = E/R₀</text>
</svg>

</FigBox>

<FigBox title="外特性与负载线的交点就是工作点" kind="曲线" note="R₀ 大，外特性就倾斜；R_L 大，交点靠左上。短路时电流冲到 E/R₀，这就是导线短路会烧保险丝的原因。">

<WavePreset kind="source" :p="1" :q="1.8" />

</FigBox>

三种状态的对照：

| 状态 | 电流 $I$ | 端电压 $U$ | 功率去向 |
| --- | --- | --- | --- |
| 开路（$R_L\to\infty$） | $0$ | $E$ | 不输出 |
| 有载 | $\dfrac{E}{R_0+R_L}$ | $<E$ | $UI$ 送给负载 |
| 短路（$R_L\to0$） | $\dfrac{E}{R_0}$ | $0$ | 全部烧在 $R_0$ 上 |

短路电流只由 $R_0$ 决定，与外部线路无关。所以随手换一根更粗的保险丝，不是让设备更能干，是让它烧得更彻底。

外特性的斜率就是 $-R_0$：在图上量斜率，等于把内阻量了出来。工程上判断一块电源行不行，不用拆开，接两个不同的负载各读一次端电压，斜率就有了。本页例 4 那套两次测量，走的正是这条路。

回到开头那节旧电池：它的电动势还有 1.35 V，内阻却比新电池大了好几倍。闹钟启动的瞬间要吸几十毫安的冲击电流，内阻上白掉的电压比稳态时大得多，剩下的电压推不动电机，表针就停在原地。万用表量的是开路电压，内阻不参与分压，所以读数看着还挺健康。

::: warning 反过来看电流源
理想电压源怕短路（电流无界），理想电流源怕开路（电压无界）。实用电流源都并联或串联大电阻来限制这个极端值。
:::

电源模型解释了「带不动」。工程上更常见的问题不在电源，而在负载选错，LED（发光二极管，light-emitting diode）就是最典型的例子。

## 六、额定值不是工作点

器件上印的参数，和它实际工作的状态是两回事。

**额定值**（rated value）是长期工作不损坏的上限，由散热能力、绝缘强度决定。它不是器件自己会达成的状态：一个标着 12 V、1 A 的电源，接 12 Ω 负载时既不输出 12 V，也不输出 1 A。

LED 是电流控制器件：亮度由电流决定，而它的电压-电流曲线极陡。3 mm 红色 LED 的正向压降约 1.8~2.2 V，但电压从 1.9 V 变到 2.0 V，电流可能从 1 mA 冲到 50 mA。

反过来把 LED 当电源看：它的等效电动势约 2 V，导通后的动态电阻 $R_d$ 只有十几欧。直接接 5 V：

$$
I=\frac{5-2}{R_d},\qquad R_d=15\ \Omega \;\Rightarrow\; I\approx 200\ \text{mA}
$$

而 LED 的额定电流是 10~20 mA，超了十几倍，几秒钟就烧。串一个限流电阻，工作点被压回来：

$$
R=\frac{5-2}{0.015}\approx 200\ \Omega
$$

<FigBox title="LED 必须串限流电阻" kind="电路" note="电阻吃掉多余的 3 V，把电流限制在 15 mA 左右。没有这个电阻，LED 的陡峭伏安特性会让电流由「几乎为零」直接跳到「烧毁」。">

<svg viewBox="0 0 440 240" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="80" y1="76" x2="80" y2="112"/>
<g transform="translate(80 138) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="80" y1="164" x2="80" y2="200"/>
<line x1="80" y1="76" x2="141" y2="76"/>
<g transform="translate(165 76)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="189" y1="76" x2="250" y2="76"/>
<text x="165" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R</text>
<line x1="250" y1="76" x2="340" y2="76"/>
<line x1="340" y1="76" x2="340" y2="118"/>
<g transform="translate(340 138) rotate(90)">
<line x1="-20" y1="0" x2="-5" y2="0"/>
<path d="M-5 -8 L5 0 L-5 8 Z" class="sf-solid"/>
<line x1="5" y1="-10" x2="5" y2="10" stroke-width="2.4"/>
<line x1="10" y1="-4" x2="13.56" y2="-8.58"/>
<path d="M17 -13 L15.09 -5.23 L9.94 -9.24 Z" class="sf-solid"/>
<line x1="16" y1="-4" x2="19.56" y2="-8.58"/>
<path d="M23 -13 L21.09 -5.23 L15.94 -9.24 Z" class="sf-solid"/>
<line x1="5" y1="0" x2="20" y2="0"/>
</g>
<line x1="340" y1="158" x2="340" y2="200"/>
<text x="370" y="138" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">LED</text>
<line x1="340" y1="200" x2="80" y2="200"/>
<text x="66" y="150" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">5 V</text>
<line x1="110" y1="76" x2="144.4" y2="76"/>
<path d="M150 76 L142.7 79.26 L142.7 72.74 Z" class="sf-solid"/>
<text x="130" y="42" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="207.56" y="178" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="215" y="184.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">F</text>
<text x="215" y="156" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">≈ 2 V</text>
</svg>

</FigBox>

::: tip 两种算法，场合不同
估算法：假定 LED 压降 2 V、目标电流 15 mA，直接算 $R=(V_{CC}-2)/0.015$（$V_{CC}$ 是这条支路所接的电源电压），再取最接近的标准阻值（200 Ω 是标准值）。工程上九成的情况用这个。

精确法：把 LED 实测的伏安曲线与负载线联立求交点，就是外特性那张图的求法。要求亮度精确、或者电流很小时才需要。
:::

顺带说一句为什么限流要用串而不是并：并联只是给 LED 多开一条通路，它自己那条支路的电压电流一点没变；串联才是把电阻和 LED 放进同一条支路，LED 过多少电流，电阻就过多少。

约定和模型这两块到这里就齐了。先用演示把概念连成动作，再看四道例题。

## 演示

拖动滑块的时候，盯住 $U$、$I$、$P$ 三个量怎么互相牵制，动画本身没什么可看的。

<DemoBox title="电源三种状态与外特性" hint="拖动 R_L 看工作点沿外特性滑动；切到短路看电流如何暴涨。">
  <OhmDemo />
</DemoBox>

## 例题

四道题，一道对上前面的一个话题：例 1 考电源模型与额定值，例 2 考含源回路的功率记账，例 3 考箭头标反之后的后果，例 4 是黑盒测量的实验做法。四道都过手一遍，概念才算真站住。

::: tip 例 1 · 电源模型与额定值（概念辨析） {#ex-model-1}
**题目**：一个标着 12 V、1 A 的直流电源，接一个 12 Ω 的灯泡。灯泡亮不亮？电源内部损耗多少？

<FigBox title="例 1 的电路：电动势串内阻，再接 12 Ω 灯泡" kind="电路" note="虚线框里是电源的模型（E 串 R₀），框外才是负载。题目里的 1 A 是这块电源允许输出的上限，不是它现在输出的电流。">

<svg viewBox="0 0 500 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<rect x="105" y="30" width="72" height="196" rx="6" stroke-dasharray="5 4"/>
<text x="141" y="22" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">电源内部</text>
<line x1="140" y1="70" x2="140" y2="79"/>
<g transform="translate(140 105) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="140" y1="131" x2="140" y2="140"/>
<line x1="140" y1="140" x2="140" y2="151"/>
<g transform="translate(140 175) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="140" y1="199" x2="140" y2="210"/>
<line x1="140" y1="70" x2="380" y2="70"/>
<line x1="380" y1="70" x2="380" y2="118"/>
<g transform="translate(380 140) rotate(90)">
<line x1="-22" y1="0" x2="-10" y2="0"/>
<circle cx="0" cy="0" r="10" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
<line x1="-5" y1="-5" x2="5" y2="5"/>
<line x1="5" y1="-5" x2="-5" y2="5"/>
<line x1="10" y1="0" x2="22" y2="0"/>
</g>
<line x1="380" y1="162" x2="380" y2="210"/>
<line x1="380" y1="210" x2="140" y2="210"/>
<text x="186" y="105" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">E = 12 V</text>
<text x="186" y="176" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">R₀ = 12 Ω</text>
<text x="398" y="140" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">12 Ω 灯泡</text>
<line x1="210" y1="70" x2="254.4" y2="70"/>
<path d="M260 70 L252.7 73.26 L252.7 66.74 Z" class="sf-solid"/>
<text x="235" y="54" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">I = 0.5 A</text>
</svg>

</FigBox>

先想一句：这道题考的不是计算，是「1 A 是什么意思」。它决定 $R_0$ 怎么来，理解错了后面全错。

第 1 步，先别动手算。1 A 是额定电流，也就是长期工作不烧坏的电流上限，由散热能力决定，并不是接到任何负载都会流过的电流。把额定值当成工作点，是最高频的错误。

第 2 步，推内阻。额定状态意味着输出 1 A 时端电压恰好跌到 0，这是额定电流的工程定义方式：输出端短路、电流恰为额定值。于是

$$
R_0=\frac{E}{I_{\text{额}}}=\frac{12}{1}=12\ \Omega
$$

第 3 步，接上负载。$R_L=12\ \Omega$：

$$
I=\frac{E}{R_0+R_L}=\frac{12}{12+12}=0.5\ \text{A},\qquad U_L=IR_L=0.5\times12=6\ \text{V}
$$

为什么只有 6 V？因为 $R_0=R_L$，两个一样大，电动势被平分。

第 4 步，亮不亮？$P_L=U_LI=6\times0.5=3$ W。额定状态下是 12 W，现在只剩四分之一，但远超可见亮度阈值，肉眼看是正常亮。

第 5 步，算内部损耗，这一项最容易被忘：

$$
P_{\text{内}}=I^2R_0=0.5^2\times12=3\ \text{W}
$$

损耗与灯泡一样大，效率只有 50%。

验算用全电路功率平衡：电源发出 $EI=12\times0.5=6$ W，负载吸收 3 W，内阻吸收 3 W，$-6+3+3=0$ ✓。
:::

::: tip 例 2 · 含理想电流源的功率记账（易错点密集） {#ex-model-2}
**题目**：12 V 理想电压源串 4 Ω、再串 6 Ω，末端接一个理想电流源 $I_S=1$ A（箭头从 N 点指向下方）。求各元件功率并验算。

<FigBox title="例 2 的电路：电压源、两个电阻、一个理想电流源" kind="电路" note="电流源把这条支路的电流钉死在 1 A，方向由图中的箭头给出；它两端的电压则由外电路决定，这正是本题要算的未知量。">

<svg viewBox="0 0 470 252" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="80" y1="76" x2="80" y2="112"/>
<g transform="translate(80 138) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="80" y1="164" x2="80" y2="200"/>
<line x1="80" y1="76" x2="121" y2="76"/>
<g transform="translate(145 76)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="169" y1="76" x2="210" y2="76"/>
<text x="145" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">4 Ω</text>
<line x1="210" y1="76" x2="251" y2="76"/>
<g transform="translate(275 76)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="299" y1="76" x2="340" y2="76"/>
<text x="275" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">6 Ω</text>
<line x1="340" y1="76" x2="340" y2="124"/>
<circle cx="340" cy="138" r="14" fill="none"/>
<line x1="340" y1="127" x2="340" y2="143.4"/>
<path d="M340 149 L336.74 141.7 L343.26 141.7 Z" class="sf-solid"/>
<line x1="340" y1="152" x2="340" y2="200"/>
<line x1="340" y1="200" x2="80" y2="200"/>
<circle cx="340" cy="76" r="3.5" class="sf-dot"/>
<text x="352" y="100" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">N</text>
<text x="362" y="138" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">I_S = 1 A</text>
<text x="66" y="150" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">12 V</text>
<line x1="110" y1="76" x2="144.4" y2="76"/>
<path d="M150 76 L142.7 79.26 L142.7 72.74 Z" class="sf-solid"/>
<text x="130" y="58" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="210.88" y="236" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="218.32" y="242.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">S</text>
</svg>

</FigBox>

先想一句：这里有一个电压源和一个电流源。电压源钉电压、电流源钉电流，先看哪个量已经被钉死，未知数就少一个。

第 1 步，标方向。设回路电流 $I$ 沿「电压源 + → 4 Ω → 6 Ω → 电流源 → 回电压源 −」流动，即顺时针。

第 2 步，用 KCL 定电流。KCL（基尔霍夫电流定律：结点处流入之和等于流出之和，下一页细讲）看一眼结点 N（几条支路相接的点）：从 6 Ω 流进来的电流只能全部流进电流源，所以

$$
I=I_S=1\ \text{A}
$$

能直接写，是因为理想电流源的电流与它两端电压无关，KCL 又不许电荷堆积，串联回路里各元件电流都被它钉住了。

第 3 步，用 KVL 求电流源两端电压。KVL（基尔霍夫电压定律：沿闭合回路走一圈，各段电压降之和为零）用起来很机械：沿回路顺时针走一圈，把各段电压降代数相加，

$$
12-4\times1-6\times1-U_S=0\;\Rightarrow\;U_S=2\ \text{V}
$$

这里 $U_S$ 的参考方向取「N 点高于下端」。

第 4 步，逐个记功率，先判关联性：关联的用 $P=UI$，非关联的用 $P=-UI$，两种写法混着套，$\sum P=0$ 一定对不上。

| 元件 | 功率 | 性质 |
| --- | --- | --- |
| 4 Ω 电阻 | $I^2R=1^2\times4=4$ W | 吸收 |
| 6 Ω 电阻 | $I^2R=1^2\times6=6$ W | 吸收 |
| 12 V 电压源 | $-EI=-12\times1=-12$ W | 发出 |
| 1 A 电流源 | $+U_SI_S=+2$ W | 吸收 |

电流源这一行是本题唯一的坑。电流在电流源内部从 N 点（$12-4-6=2$ V）流向下方（0 V），从高电位流向低电位，也就是从「+」端流入，属于关联方向。所以 $P=+U_SI_S=+2$ W，它在吸收功率。

第 5 步，验算。

$$
\sum P=-12+4+6+2=0
$$

两端相等 ✓。

负号不是「负数」，它表示方向相反。判断符号唯一可靠的办法是先确认电流从哪个端子进出，再看该用 $UI$ 还是 $-UI$，不要在「发出」和「吸收」上凭感觉。
:::

::: tip 例 3 · 参考方向标反了会怎样 {#ex-model-3}
**题目**：一条串联支路（两段电阻首尾相接），电流 $I=2$ A，参考方向从 a 流向 b；$R_1=3\ \Omega$（a 到 b 段）、$R_2=5\ \Omega$（b 到 c 段）。求 $U_{ab}$、$U_{bc}$、$U_{ac}$。若把电流参考方向改成从 b 流向 a，结果怎么变？物理世界变了吗？

<FigBox title="例 3 的电路：一条串联支路，三处电压" kind="电路" note="电流箭头与电压箭头都只是标注。标注换了，方程里的符号跟着换，但电流实际怎么流、电位实际怎么降，一点也不变。">

<svg viewBox="0 0 460 186" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="62" y1="100" x2="100" y2="100"/>
<circle cx="100" cy="100" r="4" class="sf-dot"/>
<circle cx="240" cy="100" r="4" class="sf-dot"/>
<circle cx="380" cy="100" r="4" class="sf-dot"/>
<line x1="100" y1="100" x2="146" y2="100"/>
<g transform="translate(170 100)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="194" y1="100" x2="240" y2="100"/>
<text x="170" y="84" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₁ = 3 Ω</text>
<line x1="240" y1="100" x2="286" y2="100"/>
<g transform="translate(310 100)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="334" y1="100" x2="380" y2="100"/>
<text x="310" y="84" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₂ = 5 Ω</text>
<text x="100" y="60" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">a</text>
<text x="240" y="60" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">b</text>
<text x="380" y="60" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">c</text>
<line x1="66" y1="100" x2="90.4" y2="100"/>
<path d="M96 100 L88.7 103.26 L88.7 96.74 Z" class="sf-solid"/>
<text x="80" y="82" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">I = 2 A</text>
<line x1="115" y1="134" x2="219.4" y2="134"/>
<path d="M225 134 L217.7 137.26 L217.7 130.74 Z" class="sf-solid"/>
<text x="168.88" y="158" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="176.32" y="164.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">ab</text>
<line x1="255" y1="134" x2="359.4" y2="134"/>
<path d="M365 134 L357.7 137.26 L357.7 130.74 Z" class="sf-solid"/>
<text x="308.88" y="158" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="316.32" y="164.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">bc</text>
</svg>

</FigBox>

先想一句：电流的参考方向和电压的下标是两套独立标注，先确认它们在这道题里顺不顺。顺着时用 $U=IR$，反着时用 $U=-IR$。

按原标注（电流 a→b，与 a 到 b 的电位降同方向，即关联）：

$$
U_{ab}=IR_1=2\times3=6\ \text{V},\qquad U_{bc}=IR_2=2\times5=10\ \text{V}
$$

逐段相加得总电压，这就是 KVL 的电压形式：

$$
U_{ac}=U_{ab}+U_{bc}=6+10=16\ \text{V}
$$

改标参考方向（b→a）之后，计算时 $I=-2$ A，于是 $U_{ab}=-6$ V、$U_{bc}=-10$ V、$U_{ac}=-16$ V。

物理世界一点没变。电流还是那样流，电位还是那样降，变的只是符号：负号在说「实际方向与你标的相反」。

功率也不受标注影响：

$$
P=I^2(R_1+R_2)=2^2\times(3+5)=32\ \text{W}
$$

$I^2$ 把符号平方掉了。所以「电阻永远吸收功率」这句话与参考方向无关，这也是 $P=I^2R$ 永远为正的原因。

验算：两种标法下 $P$ 都是 32 W；再用 $P=UI$ 交叉验证一次，$U_{ac}I=16\times2=32$ W ✓。

记法：参考方向是给方程用的坐标系，不是对电路的判决。标错方向不会算错物理，只会得到一堆负号；但同一道题里必须全程用同一套标注，中途换标注等于中途换坐标系，必错。
:::

::: tip 例 4 · 黑盒电源：两次测量定参数（实验方法） {#ex-model-4}
**题目**：一个黑盒直流电源（$E$、$R_0$ 未知）。接 $R_1=10\ \Omega$ 时端电压 20 V；换接 $R_2=5\ \Omega$ 时端电压 15 V。求 $E$、$R_0$、最大输出功率及此时的效率。

<FigBox title="例 4 的实验安排：同一个黑盒，换两次负载各量一次端电压" kind="电路" note="两次测量给出两条约束，正好解两个未知数。这也是工程上测电池内阻的标准做法：换负载、读端电压、联立。">

<svg viewBox="0 0 680 196" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="140" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">第一次测量</text>
<rect x="50" y="64" width="70" height="70" rx="4"/>
<text x="85" y="90" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">黑盒</text>
<text x="85" y="108" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">E、R₀ 未知</text>
<circle cx="120" cy="76" r="3.5" class="sf-dot"/>
<text x="126" y="60" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">A</text>
<circle cx="120" cy="122" r="3.5" class="sf-dot"/>
<text x="126" y="138" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">B</text>
<line x1="120" y1="76" x2="210" y2="76"/>
<line x1="120" y1="122" x2="210" y2="122"/>
<line x1="210" y1="76" x2="210" y2="75"/>
<g transform="translate(210 99) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="210" y1="123" x2="210" y2="122"/>
<text x="218" y="99" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">R₁ = 10 Ω</text>
<text x="140" y="178" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">量得端电压 U = 20 V</text>
<text x="480" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">第二次测量</text>
<rect x="390" y="64" width="70" height="70" rx="4"/>
<text x="425" y="90" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">黑盒</text>
<text x="425" y="108" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">E、R₀ 未知</text>
<circle cx="460" cy="76" r="3.5" class="sf-dot"/>
<text x="466" y="60" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">A</text>
<circle cx="460" cy="122" r="3.5" class="sf-dot"/>
<text x="466" y="138" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">B</text>
<line x1="460" y1="76" x2="550" y2="76"/>
<line x1="460" y1="122" x2="550" y2="122"/>
<line x1="550" y1="76" x2="550" y2="75"/>
<g transform="translate(550 99) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="550" y1="123" x2="550" y2="122"/>
<text x="558" y="99" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">R₂ = 5 Ω</text>
<text x="480" y="178" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">量得端电压 U = 15 V</text>
</svg>

</FigBox>

先想一句：$E$ 与 $R_0$ 是两个未知数，需要两个方程。每做一次「接负载、量端电压」就得到一个方程，所以测两次。

列外特性方程。端电压 $U=E\dfrac{R_L}{R_0+R_L}$，两次测量代入：

$$
E\cdot\frac{10}{R_0+10}=20\;\Rightarrow\;E=2R_0+20
$$

$$
E\cdot\frac{5}{R_0+5}=15\;\Rightarrow\;E=3R_0+15
$$

联立：$2R_0+20=3R_0+15$，得 $R_0=5\ \Omega$，代回 $E=30$ V。

验算：$30\times10/15=20$ V ✓；$30\times5/10=15$ V ✓。

最大输出功率在匹配条件 $R_L=R_0$ 下取得：

$$
P_{\max}=\frac{E^2}{4R_0}=\frac{30^2}{4\times5}=45\ \text{W}
$$

再验一次：$R_L=5\ \Omega$ 时 $I=30/10=3$ A，$P=I^2R_L=9\times5=45$ W ✓。

效率：匹配时内阻上的损耗与输出相等（各 45 W），总功率 90 W，效率只有 50%。所以「最大功率传输」和「高效率」是矛盾的：匹配用于信号传输，要的是信号，不是效率；电力传输绝不这么干。

工程注脚：真实电池的 $R_0$ 随电量、温度变化，这两次测量在旧电池上可能对不上。测电源参数要快，而且两次负载别差太多。
:::

四道题做完，再用一份清单把全页的坑排一遍。

## 易错清单

按踩坑频率从高到低排，每条格式是「错误做法 → 会得到什么 → 正确做法」。

1. 把参考方向当成真实方向 → 算出一堆负数就以为错了，反复重算 → 负数只表示「反了」，大小照抄，方向改写在结论里。
2. $U_{ab}$ 写成 $V_b-V_a$ → 全题符号翻转 → 记「下标顺序 = 减法顺序」，用 $3-5=-2$ 代一遍自检。
3. 不判关联性就套 $P=UI$ → 发出与吸收颠倒，功率不平衡 → 先看电流从「+」端进还是出，再决定用 $UI$ 还是 $-UI$。
4. 把额定值当工作点 → 认为 12 V/1 A 的电源接哪都是 12 V → 额定值是上限，实际值由 $E$、$R_0$、$R_L$ 一起决定。
5. 以为内阻是某个零件的阻值 → 换电池后算不对 → $R_0$ 是等效值，$R_0=U_{oc}/I_{sc}$，同型号新旧差别很大。
6. 算完不验算 → 符号错一处，整题白做 → 收尾必查 $\sum P=0$。
7. 把理想电流源开路 → 以为「没接东西就没事」 → 理想电流源开路时电压无界，比电压源短路更危险。
8. 在长线、高频下照用集中参数模型 → KCL/KVL 失效却不知道 → 尺寸接近波长时按分布参数处理。

## 自检

1. 一段导线里电流从 a 流向 b，你标了 $U_{ab}$ 并在旁边画「+ −」。若实际 $V_a<V_b$，$U_{ab}$ 算出来是正还是负？
2. 一个元件上电流从「+」端流出，你算得 $P=UI=+5$ W。它是在吸收还是发出？该写成 $+5$ W 还是 $-5$ W？
3. 一节电池开路电压 1.5 V，短路电流 0.5 A。它的内阻多大？接 3 Ω 负载时端电压多少？

## 下一步

<Prereq id="kvl" /> → 进入 [02 · 基尔霍夫定律与电位](./kcl-kvl.md)
