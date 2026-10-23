---
title: 12 · 三相电路
description: 为什么用三相、线电压与相电压的区别、Y 接的 √3 与 30° 推导、△ 接的电流关系、一相计算法、中性点与中性点位移（含断中性线实算），配四道带图例题。
---

# 12 · 三相电路

<Meta time="55 min" level="核心" note="这一页最像工程：所有结论都能从单相知识推出来，但必须先分清「线」和「相」——分不清，后面每个数都会差 √3 倍" />

**这一页要解决什么**：家里的插座是 220 V，工厂的动力线是 380 V，而它们来自同一台变压器。这一页要解释这个 380 是怎么从 220 变出来的、为什么三根火线不加中性线也能构成回路，以及一个更要命的问题：如果中性线断了，为什么有的灯变暗、有的灯反而烧掉。读完你应该能对任意一个三相电路判断接法、分清线量与相量、用一相计算法算出电流与功率，并在负载不对称时算出中性点位移。

::: tip 读这页之前
- **需要会**：相量与阻抗（<Prereq id="impedance" />、<Prereq id="sine-params" />）、有效值（<Prereq id="rms" />）；「电位是相对量、要选参考点」这件事（<Prereq id="potential" />）。这一页不引入新定律，全部是 KVL、KCL 加上相量运算。
- **这一页用到的符号**：$U_p$、$I_p$ **相电压、相电流**（每相负载或每个绕组自己的电压电流）；$U_l$、$I_l$ **线电压、线电流**（两根火线之间、每根火线上流过的量，下标 l 来自 line）；$N$ 电源中性点、$N'$ 负载中性点、$\dot U_{N'N}$ **中性点位移电压**。全部约定见[符号与约定](../../guide/notation.md)。
- **需要的数学**：复数的极坐标与代数型互换、$\sqrt3$ 的来历（$\cos30^\circ=\sqrt3/2$）、相量相加。你会反复用到一个事实：$1\angle0^\circ+1\angle{-120^\circ}+1\angle120^\circ=0$。
- **两个词先给一句话**：**相电压**是从一根火线到中性点之间的电压；**线电压**是两根火线之间的电压。第六节再专门讲中性点为什么会「跑掉」。
:::

先看两个场景，它们是同一件事的两面。

**第一个**：家里的电饭锅标 220 V，工厂的电机标 380 V，电工说这是「同一路电」。你不信——同一路电怎么能有两个电压？答案在于量的是哪两点之间：火线对零线 220 V，两根火线之间 380 V，而 $380\approx\sqrt3\times220$。这个 $\sqrt3$ 不是巧合，是 120° 的直接后果。

**第二个**：一栋老楼检修，电工误断了进户的中性线。几分钟后，三楼的灯特别亮、五楼的灯发红，几台电器冒烟。没有任何元件损坏，电压却全乱了——因为中性点跑了。**中性点为什么会跑、跑到哪里去**，是这一页最难也最值钱的一节。

## 结论先行

1. 对称三相电源：三相等幅、同频、相位互差 $120^\circ$，任一时刻三者之和为零——这是三根火线就能构成回路的全部依据。
2. **Y 接**：$U_l=\sqrt3\,U_p$、$I_l=I_p$，且线电压**超前**对应相电压 $30^\circ$；**△ 接**：$U_l=U_p$、$I_l=\sqrt3\,I_p$，线电流**滞后**对应相电流 $30^\circ$。
3. 口诀「Y 起压，△ 起流」：Y 接差在电压上，△ 接差在电流上，另一个量在两种接法下相等。
4. 对称三相电路可以**只算一相**，其余两相把相量旋转 $\mp120^\circ$ 即得——前提是负载对称且中性点不位移。
5. 中性线的作用是把负载中性点钉死在零电位；一旦中性线断开且负载不对称，就会发生**中性点位移**，负载轻的那相电压升高，可能烧毁设备。

::: tip 本章唯一要背的口诀
**「Y 起压，△ 起流」**——Y 接时是**电压**差 $\sqrt3$ 倍，△ 接时是**电流**差 $\sqrt3$ 倍，另一个量在两种接法下相等。记不住时回到一句话：$\sqrt3$ 永远出现在「有两个同类量相加/相减」的那一侧（Y 接的线电压是两个相电压之差，△ 接的线电流是两个相电流之差）。
:::

## 一、为什么用三相，而不是三套单相

这一节只回答一个问题：既然单相也能输电，为什么全世界的电网都用三相。

三个理由，一个比一个硬：

1. **瞬时功率恒定**。单相电路的 $p(t)=ui$ 以两倍频率脉动（见[10 · 功率与功率因数](../04-ac/power.md)那张三栏波形图），电机的转矩会跟着抖。三相合成后 $p=3U_pI_p\cos\varphi$ 是一条平线。
2. **能产生旋转磁场**。三个空间上互差 120° 的绕组通入互差 120° 的电流，合成磁场自然旋转——这是所有交流电机的地基。
3. **省铜**。同样输送功率、同样损耗，三相比单相省约 25% 的导线。

<FigBox title="三相瞬时功率：三条脉动相加成一条平线" kind="波形" note="三条虚线是各相的瞬时功率（都以 2ω 脉动，各自会过零甚至为负），加总后是那条平线。这就是三相电机转矩恒定、运行平稳的根本原因——不是「更平稳」，而是数学上完全不脉动。">

<WavePreset kind="instp3" :q="0.6" />

</FigBox>

三条理由都成立的前提是「三相等幅、同频、互差 120°」，这叫**对称三相**。工程上只要三相负载相同，电源就近似对称，后面绝大多数结论都在这个前提下成立。下一个问题很具体：三个绕组怎么接成三根线？

## 二、先分清「线」与「相」：两种接法

这一节只回答一个问题：三相绕组与三相负载各有哪两种接法，两种接法下「线量」和「相量」的关系有什么不同。

先把四个词定死，这是全页最容易混的地方：

| 词 | 定义 | 怎么量 |
| --- | --- | --- |
| **相电压** $U_p$ | 一根火线到中性点之间的电压 | 火线对零线，家用 220 V |
| **线电压** $U_l$ | 两根火线之间的电压 | 火线对火线，动力 380 V |
| **相电流** $I_p$ | 流过每一相绕组（或每相负载）的电流 | 绕组内部，钳形表夹不到 |
| **线电流** $I_l$ | 流过每根火线（外线）的电流 | 钳形表夹火线，能直接读到 |

**接法一：星形（Y 接）**——三个绕组的末端接在一起成为中性点 $N$，三个首端引出成三根火线。
**接法二：三角形（△ 接）**——三个绕组首尾相接成一个闭合三角形，三个顶点引出成三根火线。

<CircuitFig kind="wye-delta" title="Y 接（星形）与 △ 接（角形）：同一套三相的两种接法" note="左：三个绕组一端共接于中性点 N，另一端引出 A、B、C，此时相电压是「火线对 N」，线电压是「火线对火线」。右：三个绕组首尾相接成三角形，此时相电压就是线电压，但线电流是相邻两相电流之差。看拓扑时先找有没有那个公共点 N——有 N 就是 Y 接。" />

两句话记住差别：**Y 接有一个公共中性点，所以「相」是对 N 说的；△ 接没有中性点，所以「相」就是两个顶点之间。**

::: warning 电源接法与负载接法是两件事
变压器高压侧可能是 △、低压侧是 Y（配电变压器就是这样：低压侧 Y 接引出中性线，才有 220/380 两种电压）；而电动机铭牌上写 △/Y，说的是它**自己的绕组**能怎么接。判断 $\sqrt3$ 关系时，先问「问的是电源侧还是负载侧、是 Y 还是 △」，三句话问清再动笔。
:::

关系式先摆出来，下一节推 Y 接，再下一节推 △ 接：

| 接法 | 线电压与相电压 | 线电流与相电流 | 相位关系 |
| --- | --- | --- | --- |
| Y 接 | $U_l=\sqrt3\,U_p$ | $I_l=I_p$ | 线电压超前相电压 $30^\circ$ |
| △ 接 | $U_l=U_p$ | $I_l=\sqrt3\,I_p$ | 线电流滞后相电流 $30^\circ$ |

先看 Y 接——那两个结论（$\sqrt3$ 倍、超前 30°）其实是一次减法算出来的。

## 三、Y 接的 √3 与 30° 是怎么来的

这一节只回答一个问题：$U_l=\sqrt3U_p$ 和「超前 30°」这两个结论，能不能一次推出来。

电源 Y 接时，相电压 $\dot U_A$、$\dot U_B$、$\dot U_C$ 是三个等幅、互差 120° 的相量：

$$
\dot U_A=U_p\angle0^\circ,\qquad \dot U_B=U_p\angle{-120^\circ},\qquad \dot U_C=U_p\angle120^\circ
$$

线电压按 KVL 就是两个相电压之差，例如 $\dot U_{AB}=\dot U_A-\dot U_B$。把它算完：

$$
\dot U_{AB}=U_p\angle0^\circ-U_p\angle{-120^\circ}
=U_p\big[(1+0.5)+j\,0.866\big]
=U_p(1.5+j0.866)
$$

模与幅角一起读出来：

$$
\lvert\dot U_{AB}\rvert=U_p\sqrt{1.5^2+0.866^2}=U_p\sqrt3,\qquad \angle\dot U_{AB}=\arctan\frac{0.866}{1.5}=30^\circ
$$

**一次减法，两个结论同时到手**：幅值是 $\sqrt3$ 倍，相位超前 $30^\circ$。其余两个线电压同理：$\dot U_{BC}$ 超前 $\dot U_B$ 30°、$\dot U_{CA}$ 超前 $\dot U_C$ 30°，彼此仍差 120°。

<FigBox title="线电压是两个相电压的相量差" kind="结构" note="从公共点 N 画出三个相电压（互差 120°），U_AB 就是从 U_B 的端点指向 U_A 的端点的那条箭头。平行四边形画出来看得很清楚：两条邻边夹角 60°（因为 120° 的补角是 60°），所以对角线是边长 √3 倍，而且正好把 0° 与 60° 平分成 30°。">

<svg viewBox="0 0 420 300" role="img" aria-label="Y 接相量图：三个相电压互差 120 度，线电压 U_AB 是 U_A 与 U_B 的差，长度为相电压的根号三倍并超前 30 度">
<defs>
  <marker id="tp-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="tp-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <line x1="150" y1="160" x2="260" y2="160" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#tp-a)" />
  <line x1="150" y1="160" x2="95" y2="255.3" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#tp-a)" />
  <line x1="150" y1="160" x2="95" y2="64.7" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#tp-a)" />
  <line x1="150" y1="160" x2="314.5" y2="65" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#tp-a)" />
  <line x1="260" y1="160" x2="314.5" y2="65" stroke="var(--vp-c-text-3)" stroke-width="1.1" stroke-dasharray="5 4" />
  <line x1="205" y1="64.7" x2="314.5" y2="65" stroke="var(--vp-c-text-3)" stroke-width="1.1" stroke-dasharray="5 4" />
  <line x1="150" y1="160" x2="205" y2="64.7" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="6 3" marker-end="url(#tp-b)" />
  <path d="M 206 160 A 56 56 0 0 0 198.5 132" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.1" />
  <text x="212" y="146" fill="var(--vp-c-text-3)">30°</text>
  <circle cx="150" cy="160" r="3.5" fill="var(--vp-c-text-1)" />
  <text x="138" y="176" text-anchor="end">N</text>
  <text x="268" y="168">U_A（220 V）</text>
  <text x="84" y="272" text-anchor="middle">U_B（220 V）</text>
  <text x="84" y="56" text-anchor="middle">U_C（220 V）</text>
  <text x="312" y="44" text-anchor="end">U_AB（380 V）</text>
  <text x="198" y="58" text-anchor="end" fill="var(--vp-c-text-2)">−U_B</text>
  <text x="210" y="292" text-anchor="middle" fill="var(--vp-c-text-3)">对角线长 = 边长的 √3 倍，方向落在两条边正中间（30°）</text>
</g>
</svg>

</FigBox>

<FigBox title="三条相电压与三条线电压的波形对照" kind="波形" note="灰虚线是相电压，三条实线是相电压两两相减得到的线电压。看图只需验证两件事：峰高是 √3 倍（220 → 380），每个线电压的过零点都比对应相电压早 30°。">

<WavePreset kind="threewire" />

</FigBox>

::: warning 这条 $\sqrt3$ 只属于 Y 接
$U_l=\sqrt3U_p$ 只对 **Y 接**成立。△ 接是 $U_l=U_p$。更常见的错误是把这条用到负载上：负载 Y 接且中性线完好时，负载相电压确实等于电源相电压；**一旦中性线断开且负载不对称，这个 220 V 就不成立了**（第六节）。
:::

Y 接的电压关系摸清了，△ 接换了个位置——$\sqrt3$ 跑到电流那一侧去。

## 四、△ 接：电压不变，电流乘 √3

这一节只回答一个问题：为什么 △ 接的 $\sqrt3$ 出现在电流上而不是电压上。

△ 接时三个绕组首尾相接，两个顶点之间的电压就是某一相的电压，所以直接有 $U_l=U_p$。麻烦出在电流：每个顶点连着两相绕组，而外线只引出一根线。

对顶点 A 列 KCL：外线电流 $\dot I_A$ 等于流入顶点的那一相电流减去流出的那一相电流：

$$
\dot I_A=\dot I_{AB}-\dot I_{CA}=\sqrt3\,I_p\angle{-30^\circ}
$$

即 $I_l=\sqrt3I_p$，且线电流**滞后**对应相电流 $30^\circ$。与 Y 接对照着记：

- Y 接：两个**电压**相减 → 线电压**超前** 30°；
- △ 接：两个**电流**相减 → 线电流**滞后** 30°。

两处 $30^\circ$ 方向相反，原因藏在加减号的顺序里（$\dot U_A-\dot U_B$ 与 $\dot I_{AB}-\dot I_{CA}$ 差一个旋转方向）。记不住方向不要紧，现场算一遍只要几秒。

::: tip 一个立刻能用的推论：Y-△ 降压启动
同一台电机，绕组接成 △ 时每相承受线电压 380 V，接成 Y 时每相只承受 $380/\sqrt3=220$ V。相电压降 $\sqrt3$ 倍 → 相电流降 $\sqrt3$ 倍 → 又因为 △ 的线电流还要再乘 $\sqrt3$ → **Y 接启动时线电流与转矩都只有 △ 接的 1/3**。这就是 Y-△ 降压启动的全部依据，[17 · 机械特性 · 起动 · 调速](../06-machine/motor-characteristic.md)会直接用这个结论。
:::

接法、线相关系都齐了。接下来是最省时间的一件事：三相能不能只算一相？

## 五、对称三相 → 只算一相

这一节只回答一个问题：什么条件下可以把三相问题压缩成一个单相问题。

::: tip 心智模型：一相计算法是一种「降维」
对称负载下 $\dot U_A$、$\dot U_B$、$\dot U_C$ 只是同一组量旋转 120° 的结果，而电路对三相完全对称（旋转对称性）——B、C 的一切结论都能从 A 相「转」出来，不必重算。这不是新规律，是省时间。
:::

条件要说清：**负载对称 + 中性线完好（或三线制且负载对称）**。此时两个中性点等电位（$U_{N'N}=0$），三相彼此独立。

$$
①\ \text{取出 A 相，按单相交流电路算（}Z、I、P\ \text{全会）}
$$
$$
②\ \text{B 相：把 A 相所有相量旋转}-120^\circ\qquad ③\ \text{C 相：旋转}+120^\circ
$$
$$
④\ \text{中性线电流 }\dot I_N=\dot I_A+\dot I_B+\dot I_C=0
$$

操作顺序不能颠倒，这是本章最省时间的一条纪律：

1. 先判断接法（Y 还是 △）；
2. 再定每相承受的电压（Y 接取 $U_l/\sqrt3$，△ 接取 $U_l$）；
3. 只算 A 相的电流与功率；
4. 最后才用线量关系（$I_l=I_p$ 或 $\sqrt3I_p$）。

一上来就问「线电流怎么算」，十有八九会绕晕——因为线电流是由相电流推出来的，不是输入。

对称情况下中性线上没有电流，那这根线是不是可以省掉？答案是：**对称时可以，不对称时绝对不行**。为什么，下一节说清。

## 六、中性点与中性点位移

这一节只回答一个问题：中性线断了以后，负载上的电压为什么会变。

先把两个词说清：

- **中性点**（$N$）：电源三个绕组末端共接的那个点，正常运行时它被中性线钉在零电位。
- **中性点位移**：负载 Y 接、中性线断开时，负载中性点 $N'$ 不再与 $N$ 等电位，两者之间出现的电压 $\dot U_{N'N}$ 就叫中性点位移电压。

<Prereq id="potential" /> 这其实就是**三相版的分压器**：三个负载各自分压，而它们共用同一个「分点」。单相分压器里，分点电位由两个电阻的比值决定；三相 Y 接里，分点 $N'$ 的电位由三个阻抗的比值决定——负载一变，分点就漂。

用节点电压法（以 $N$ 为参考点）直接写出 $N'$ 的电位：

$$
\dot U_{N'N}=\frac{\dfrac{\dot U_A}{Z_A}+\dfrac{\dot U_B}{Z_B}+\dfrac{\dot U_C}{Z_C}}{\dfrac{1}{Z_A}+\dfrac{1}{Z_B}+\dfrac{1}{Z_C}}
\qquad\Longrightarrow\qquad
\dot U'_A=\dot U_A-\dot U_{N'N}
$$

分子是三条支路「注入」$N'$ 的电流之和（等效电流源），分母是三条支路的**导纳**之和（<Prereq id="admittance" />）：导纳 $Y=1/Z$，单位 S，**并联时导纳直接相加**，所以这个分母就是三条并联支路合起来的「导电能力」；串联时才用阻抗相加。$\dot U'_A$ 就是负载实际承受的电压——它等于电源相电压减去位移电压，所以位移一旦不为零，三相电压就一升一降。

<FigBox title="中性点位移：一相变化如何连累另外两相" kind="曲线" note="横轴是 C 相负载阻抗的相对大小（对数刻度）。k = 1 时完全对称、位移为零；k → 0 是 C 相短路；k → ∞ 是 C 相开路。看三条曲线的分叉：C 相阻抗一变，另外两相的电压立刻跟着动——这就是「共用分点」的代价。">

<WavePreset kind="neutraldisp" />

</FigBox>

::: danger 中性点位移的后果（按严重程度排）
| 情形 | A / B 相 | C 相 | 后果 |
| --- | --- | --- | --- |
| 对称（$k=1$） | 220 V | 220 V | 正常 |
| C 相轻载（$k$ 大） | 被压低 | 升高（可到 1.5 倍） | C 相设备过压 |
| C 相短路（$k\to0$） | **冲到 380 V** | 0 | A / B 相设备瞬间烧毁 |
| C 相开路（$k\to\infty$） | 掉到 190 V | 升到 330 V | A / B 欠压、C 过压 |

所以规范要求：**三相四线制的中性线上严禁装开关、严禁装熔断器**，而且中性线截面不得小于相线。它断开的那一瞬间，负载轻的那一相就会过压。
:::

公式和后果都有了，剩下的是把数字代进去。下一节四道题，从最规矩的对称负载一直到断中性线。

## 七、例题

四道题按「规矩程度」排：例 1 是最标准的对称 Y 接，例 2 是同一负载改 △（差 3 倍），例 3 是断中性线的不对称实算，例 4 是中性线电流。每题都要先判断接法与中性线状态。

:::: tip 例 1 · Y 接对称负载（一相计算法） {#ex-tp-1}
**题目**：三相四线制，线电压 380 V。每相负载 $Z=8+j6\ \Omega$（感性）。求相电流、线电流、中性线电流与总有功功率。

**先想什么**：Y 接 + 有中性线 → 负载相电压就等于电源相电压 $380/\sqrt3=220$ V，三相互不影响。所以这题只需要算一相，其余照抄旋转。判断顺序：接法（Y）→ 相电压（220 V）→ 一相电流 → 线电流（$I_l=I_p$）。

<FigBox title="一相计算法的四步" kind="结构" note="关键是第二步：先把 380 V 换成每相 220 V。这一步错了，后面所有数字都差 √3 倍。第四步的旋转只改幅角、不改模——所以三相电流大小必然相同。">

<svg viewBox="0 0 470 170" role="img" aria-label="一相计算法四步流程图：判断接法、取相电压、算一相、旋转得其余两相">
<defs>
  <marker id="tp-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="8" y="46" width="102" height="56" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="59" y="68" text-anchor="middle">① 判接法</text>
  <text x="59" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">Y 还是 △</text>
  <line x1="112" y1="74" x2="126" y2="74" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#tp-c)" />
  <rect x="128" y="46" width="110" height="56" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="183" y="68" text-anchor="middle">② 取相电压</text>
  <text x="183" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">380/√3 = 220 V</text>
  <line x1="240" y1="74" x2="254" y2="74" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#tp-c)" />
  <rect x="256" y="46" width="110" height="56" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="311" y="68" text-anchor="middle">③ 算 A 相</text>
  <text x="311" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">İ_A = 22∠−36.9°</text>
  <line x1="368" y1="74" x2="382" y2="74" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#tp-c)" />
  <rect x="384" y="46" width="78" height="56" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="423" y="68" text-anchor="middle">④ 转 ∓120°</text>
  <text x="423" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">得 B、C</text>
  <text x="235" y="132" text-anchor="middle" fill="var(--vp-c-text-3)">顺序颠倒（先找线电流）是最常见的绕晕原因</text>
</g>
</svg>

</FigBox>

**步骤**：

1. 算阻抗模与阻抗角：

$$
\lvert Z\rvert=\sqrt{8^2+6^2}=10\ \Omega,\qquad \cos\varphi=\frac{8}{10}=0.8,\qquad \varphi=36.9^\circ
$$

2. 只算 A 相（设 $\dot U_A=220\angle0^\circ$）：

$$
\dot I_A=\frac{220\angle0^\circ}{10\angle36.9^\circ}=22\angle{-36.9^\circ}\ \text{A}
$$

3. 推另外两相（阻抗角不变，只转电源相量）：

$$
\dot I_B=22\angle{-156.9^\circ}\ \text{A},\qquad \dot I_C=22\angle83.1^\circ\ \text{A}
$$

4. Y 接线电流等于相电流：$I_l=I_p=22$ A。

5. 中性线电流（相量和）：

$$
\dot I_N=\dot I_A+\dot I_B+\dot I_C=0
$$

6. 功率：

$$
P=\sqrt3\,U_lI_l\cos\varphi=\sqrt3\times380\times22\times0.8=11.58\ \text{kW}
$$

**验算**（两条路径）：

- 一相功率乘 3：$P=3\times220\times22\times0.8=11.62$ kW，与 11.58 kW 差 0.3%——差的来源是 $380$ 与 $\sqrt3\times220=381.05$ 的取整 ✓（工程上这两个数等价，考试按题目给的走）。
- 中性线电流为零旁证了三相对称：三个等模相量互差 120°，和必为 0 ✓。

::: warning 本题的思路含量
**一相计算法的顺序不能颠倒**：判接法 → 定相电压 → 算一相 → 旋转推其余 → 最后才用线量关系。很多人一上来就找「线电流怎么算」，反而把自己绕晕。
:::
::::

:::: tip 例 2 · 同一负载改成 △ 接（功率差 3 倍） {#ex-tp-2}
**题目**：把例 1 的负载 $Z=8+j6\ \Omega$ 改接成 △，仍接 380 V 线电压。求相电流、线电流与总功率。

**先想什么**：只改接法，负载和电源都不变。第一步仍然是判断「每相承受多少电压」——△ 接时负载相电压就是线电压 380 V，比 Y 接时高了 $\sqrt3$ 倍。这个判断决定了后面全部数字。

<FigBox title="同一组阻抗，两种接法：每相电压差 √3 倍" kind="电路" note="左：Y 接，每相拿到 220 V（线电压被两个绕组分掉）。右：△ 接，每相直接跨在两根火线之间，拿到 380 V。绕组没变、电源没变，只有接法变了——这就是 3 倍功率的全部来源。">

<svg viewBox="0 0 470 232" role="img" aria-label="对比图：Y 接每相承受 220 伏，三角形接每相承受 380 伏">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="112" y="18" text-anchor="middle" font-weight="700">Y 接：每相 220 V</text>
  <circle cx="112" cy="130" r="3.5" fill="var(--vp-c-text-1)" />
  <line x1="112" y1="130" x2="112" y2="100.9" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="112" y1="68.9" x2="112" y2="48" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="99" y="78.9" width="26" height="12" rx="2" transform="rotate(-90 112 84.9)" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="112" y1="130" x2="87.5" y2="148" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="61.7" y1="167" x2="44" y2="180" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="61.6" y="151.5" width="26" height="12" rx="2" transform="rotate(143.7 74.6 157.5)" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="112" y1="130" x2="136.5" y2="148" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="162.3" y1="167" x2="180" y2="180" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="136.4" y="151.5" width="26" height="12" rx="2" transform="rotate(36.3 149.4 157.5)" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="112" y="42" text-anchor="middle">A</text>
  <text x="34" y="194" text-anchor="middle">B</text>
  <text x="190" y="194" text-anchor="middle">C</text>
  <text x="126" y="144">N</text>
  <text x="112" y="214" text-anchor="middle" fill="var(--vp-c-text-3)">Z = 8 + j6，I_p = 22 A</text>

  <text x="350" y="18" text-anchor="middle" font-weight="700">△ 接：每相 380 V</text>
  <line x1="310" y1="52" x2="282.5" y2="101.8" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="267.1" y1="129.8" x2="246" y2="168" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="261.8" y="109.8" width="26" height="12" rx="2" transform="rotate(118.9 274.8 115.8)" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="374" y1="168" x2="346.5" y2="118.2" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="331.1" y1="90.2" x2="310" y2="52" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="325.8" y="98.2" width="26" height="12" rx="2" transform="rotate(-118.9 338.8 104.2)" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <line x1="246" y1="168" x2="300.4" y2="168" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="332.4" y1="168" x2="374" y2="168" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="303.4" y="162" width="26" height="12" rx="2" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="310" y="40" text-anchor="middle">A</text>
  <text x="234" y="184" text-anchor="middle">B</text>
  <text x="386" y="184" text-anchor="middle">C</text>
  <text x="350" y="214" text-anchor="middle" fill="var(--vp-c-text-3)">同一个 Z，I_p = 38 A</text>
  <text x="235" y="228" text-anchor="middle" fill="var(--vp-c-text-3)">同一台设备、同一个电源：接法一换，每相电压 220 → 380 V</text>
</g>
</svg>

</FigBox>

**步骤**：

1. △ 接时负载相电压 = 线电压：

$$
I_p=\frac{380}{10}=38\ \text{A}
$$

2. 线电流（$I_l=\sqrt3I_p$，且滞后对应相电流 30°）：

$$
I_l=\sqrt3\times38=65.8\ \text{A}
$$

3. 功率：

$$
P=\sqrt3\times380\times65.8\times0.8=34.66\ \text{kW}
$$

**验算**：

- 与例 1 比：$34.66/11.58=2.99\approx3$ ✓
- 功率为什么正好 3 倍？两步叠加：相电压涨 $\sqrt3$ 倍 → 相电流涨 $\sqrt3$ 倍（阻抗不变）→ 每相功率涨 3 倍；同时线电流又多一个 $\sqrt3$ 倍，但 $P=\sqrt3U_lI_l\cos\varphi$ 里的 $\sqrt3$ 是固定的，两个 $\sqrt3$ 在 $U_lI_l$ 里合起来正好 3 倍 ✓

::: tip 记住这个结论，后面直接用
**正常 △ 接运行的电机，启动时改接成 Y，启动电流和启动转矩都降到 1/3。** 这就是 Y-△ 降压启动的全部依据（见[17 · 机械特性 · 起动 · 调速](../06-machine/motor-characteristic.md)）。
:::
::::

:::: tip 例 3 · 断中性线 + 不对称负载（中性点位移实算） {#ex-tp-3}
**题目**：三相四线制给三盏白炽灯供电：A、B 相各接 220 V／100 W，C 相接 220 V／40 W。中性线断开后，各灯电压变成多少？哪盏灯危险？

**先想什么**：中性线一断，两个中性点脱钩，三个灯变成「串联在 380 V 线电压之间的三个电阻」，必须用中性点位移公式。第一步不是代公式，而是**把灯换算成电阻**——公式里要的是 $Z$，不是功率。

<FigBox title="断中性线：三个灯变成共用分点的分压器" kind="电路" note="左：三盏灯 Y 接、中性线完好，每盏各拿 220 V，互不干扰。右：中性线断开处打叉，三个灯只能串联分压，共用 N′ 这个漂移的分点。40 W 的灯电阻大，分到的电压反而更高——这就是它会先烧的原因。">

<svg viewBox="0 0 470 240" role="img" aria-label="对比图：中性线完好时每灯 220 伏；中性线断开后电压重新分配为 198、198、275 伏">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="118" y="16" text-anchor="middle" font-weight="700">中性线完好</text>
  <line x1="56" y1="40" x2="56" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="118" y1="40" x2="118" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="180" y1="40" x2="180" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <text x="56" y="34" text-anchor="middle">A</text>
  <text x="118" y="34" text-anchor="middle">B</text>
  <text x="180" y="34" text-anchor="middle">C</text>
  <circle cx="56" cy="100" r="14" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <circle cx="118" cy="100" r="14" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <circle cx="180" cy="100" r="14" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <line x1="56" y1="114" x2="56" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="118" y1="114" x2="118" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="180" y1="114" x2="180" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="50" y1="160" x2="186" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="118" y1="160" x2="118" y2="186" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <text x="118" y="202" text-anchor="middle">N（钉在 0 V）</text>
  <text x="40" y="104" text-anchor="end" fill="var(--vp-c-text-3)">100 W</text>
  <text x="196" y="104" text-anchor="start" fill="var(--vp-c-text-3)">40 W</text>
  <text x="118" y="230" text-anchor="middle" fill="var(--vp-c-text-3)">每灯 220 V，正常</text>

  <text x="352" y="16" text-anchor="middle" font-weight="700">中性线断开</text>
  <line x1="290" y1="40" x2="290" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="352" y1="40" x2="352" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="414" y1="40" x2="414" y2="86" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <text x="290" y="34" text-anchor="middle">A</text>
  <text x="352" y="34" text-anchor="middle">B</text>
  <text x="414" y="34" text-anchor="middle">C</text>
  <circle cx="290" cy="100" r="14" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <circle cx="352" cy="100" r="14" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <circle cx="414" cy="100" r="14" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <line x1="290" y1="114" x2="290" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="352" y1="114" x2="352" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="414" y1="114" x2="414" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="284" y1="160" x2="420" y2="160" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="352" y1="160" x2="352" y2="176" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <line x1="340" y1="176" x2="364" y2="192" stroke="var(--vp-c-danger-1, #e5484d)" stroke-width="2.4" />
  <line x1="364" y1="176" x2="340" y2="192" stroke="var(--vp-c-danger-1, #e5484d)" stroke-width="2.4" />
  <text x="378" y="190" fill="var(--vp-c-danger-1, #e5484d)">断</text>
  <text x="424" y="166" fill="var(--vp-c-text-3)">N′</text>
  <text x="352" y="216" text-anchor="middle" fill="var(--vp-c-text-3)">198 V　198 V　275 V</text>
  <text x="352" y="234" text-anchor="middle" fill="var(--vp-c-text-3)">40 W 那只过压 25%，先烧</text>
</g>
</svg>

</FigBox>

**步骤**：

1. 把灯换算成电阻（$R=U^2/P$，用额定 220 V）：

$$
R_A=R_B=\frac{220^2}{100}=484\ \Omega,\qquad R_C=\frac{220^2}{40}=1210\ \Omega
$$

2. 代入中性点位移公式（取 $\dot U_A=220\angle0^\circ$）：

$$
\dot U_{N'N}=\frac{\dfrac{220\angle0^\circ}{484}+\dfrac{220\angle{-120^\circ}}{484}+\dfrac{220\angle120^\circ}{1210}}{\dfrac{1}{484}+\dfrac{1}{484}+\dfrac{1}{1210}}
$$

分子是三个相量之和（注意不是有效值相加）：实数部分 $0.4545-0.2273-0.0909=0.1364$，虚数部分 $-0.3936+0.1575=-0.2362$，所以分子 $=0.2727\angle{-60^\circ}$；分母 $=4.959\times10^{-3}\ \text{S}$。相除得

$$
\dot U_{N'N}=55.0\angle{-60^\circ}\ \text{V}
$$

3. 各相负载的实际电压（电源相电压减位移电压）：

$$
\dot U'_A=220\angle0^\circ-55\angle{-60^\circ}\Rightarrow U'_A=198\ \text{V}
$$

$$
\dot U'_C=220\angle120^\circ-55\angle{-60^\circ}\Rightarrow U'_C=275\ \text{V}
$$

B 相同理得 $U'_B=198$ V（三个电压之和为零，这一点也可以用来验算）。

4. 判断后果：

- 100 W 的灯：$P=198^2/484=81$ W，**变暗**（欠压 10%）
- 40 W 的灯：$P=275^2/1210=62.5$ W，**过压 25%**，很快烧毁

**验算（三条）**：

- 三相电压之和必须为零：$198\angle{-8.1^\circ}+198\angle{-128.1^\circ}+275\angle{48^\circ}$ 的实部与虚部同时归零 ✓（Y 接无中性线时，三个负载电压构成闭合三角形）
- 灯的总功率：$81+81+62.5=224.5$ W，三相总功率守恒 ✓
- 位移电压的模 55 V 落在「相电压的 0~220 V」之间，量级合理 ✓

::: warning 本例反直觉的地方
粗看会以为「电阻小的相电压低」，方向对；但真正危险的是**轻载那相的电压会超过额定值**（275 V > 220 V）。中性线断开的瞬间，先烧的往往是功率小、电阻大的那一路——老楼里「灯总是一齐坏」常和这个有关。
:::
::::

:::: tip 例 4 · 中性线电流：什么时候不为零 {#ex-tp-4}
**题目**：三相四线制，$U_p=220$ V，$Z_A=20\angle0^\circ\ \Omega$、$Z_B=20\angle{-30^\circ}\ \Omega$、$Z_C=20\angle30^\circ\ \Omega$。求各相电流与中性线电流。

**先想什么**：有中性线 → 每相彼此独立，相电压都是 220 V，所以这题不需要位移公式，分别是三个单相题。唯一的考点在最后一步：$\dot I_N$ 是**相量和**，不是有效值相加。

**步骤**：

1. 三个相电流（模相同，都是 $220/20=11$ A）：

$$
\dot I_A=\frac{220\angle0^\circ}{20\angle0^\circ}=11\angle0^\circ\ \text{A}
$$

$$
\dot I_B=\frac{220\angle{-120^\circ}}{20\angle{-30^\circ}}=11\angle{-90^\circ}\ \text{A}
$$

$$
\dot I_C=\frac{220\angle120^\circ}{20\angle30^\circ}=11\angle90^\circ\ \text{A}
$$

2. 中性线电流按 KCL 相加：

$$
\dot I_N=\dot I_A+\dot I_B+\dot I_C=11+(-j11)+(j11)=11\angle0^\circ\ \text{A}
$$

<FigBox title="三个 11 A 相加，中性线只有 11 A" kind="结构" note="İ_B 与 İ_C 一个朝下、一个朝上，虚部正好抵消，只剩同相的 İ_A。所以三个 11 A 的相电流，中性线电流既不是 33 A 也不是 0——相量相加的结果可以是任何值。若把三个有效值直接相加得 33 A，就错成了三倍。">

<svg viewBox="0 0 420 290" role="img" aria-label="相量图：İ_A 水平向右 11 安，İ_B 竖直向下 11 安，İ_C 竖直向上 11 安，İ_B 与 İ_C 抵消，中性线电流等于 İ_A">
<defs>
  <marker id="tp-n" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <line x1="60" y1="150" x2="300" y2="150" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
  <line x1="120" y1="260" x2="120" y2="40" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
  <line x1="120" y1="150" x2="208" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#tp-n)" />
  <line x1="120" y1="150" x2="120" y2="238" stroke="var(--vp-c-text-2)" stroke-width="2" marker-end="url(#tp-n)" />
  <line x1="120" y1="150" x2="120" y2="62" stroke="var(--vp-c-text-2)" stroke-width="2" marker-end="url(#tp-n)" />
  <text x="216" y="146" fill="var(--vp-c-brand-1)">İ_A = 11∠0°</text>
  <text x="128" y="244" fill="var(--vp-c-text-2)">İ_B = 11∠−90°</text>
  <text x="128" y="58" fill="var(--vp-c-text-2)">İ_C = 11∠+90°</text>
  <text x="20" y="196" fill="var(--vp-c-text-3)">İ_N = İ_A + İ_B + İ_C</text>
  <text x="20" y="214" fill="var(--vp-c-brand-1)">　　 = İ_A = 11 A（与 İ_A 重合）</text>
  <text x="220" y="276" text-anchor="middle" fill="var(--vp-c-text-3)">竖直方向两条等长、反向，抵消为零；只剩水平那条</text>
</g>
</svg>

</FigBox>

3. 一般规律：

- 负载**对称**（三相阻抗完全相同）→ $\dot I_N=0$，中性线可以省掉（三相三线制）
- 负载**不对称** → $\dot I_N\neq0$，**必须**有中性线，否则进入中性点位移（例 3）

**验算**：把 $\dot I_N$ 代回 KCL——在负载中性点 $N'$ 处，流入的三相电流之和应等于流出的中性线电流：$11+(-j11)+(j11)-11=0$ ✓。

::: tip 判断口诀
「**对称可省线，不对称必须留**」。这里的「对称」指三相**阻抗完全相同**（模和阻抗角都要一样），不是「功率相同」——本例三个负载都是 20 Ω，只是阻抗角不同，中性线电流就已经不是零了。
:::
::::

四道题覆盖了对称、接法换算、不对称、中性线四件事。下面把这一页的结论放回真实配电系统里。

## 八、工程实例

**为什么家里是 220 V，工厂动力是 380 V？** 两者都从同一套 Y 接系统引出来：一根火线加中性线是 220 V（相电压），供照明和家用电器；两根火线之间是 380 V（线电压），接三相电机。**一套系统，两种用法**——配电变压器低压侧做成 Y 接并引出中性线，就是为了同时提供这两个电压。

**中性线为什么不能断？** 居民楼是典型的不对称负载（各家电器不同时开、功率各不相同）。检修时若误断中性线，轻载那几户电压飙升，电视、空调首先烧毁。因此规范要求中性线截面不小于相线，且不得加装开关或熔断器。

**三相插头为什么有三根粗线加一根细线？** 三根粗的是三相火线（或火线、零线、地线），细的那根是保护接地 PE，它和中性线 N 在变压器处相连、在用户侧严格分开——一旦混用，设备外壳可能带电。

三个问题都指向同一件事：三相系统的可靠性取决于中性点有没有被钉住。下面把最常见的错法排一遍。

## 九、易错清单（按踩坑频率排序）

按踩坑频率从高到低排，每条格式是「错误做法 → 会得到什么 → 正确做法」。

1. **把 $\sqrt3$ 用错地方** → 差 1.73 倍，全部数字跟着错 → Y 接是 $U_l=\sqrt3U_p$，△ 接是 $I_l=\sqrt3I_p$；先判接法再套公式。
2. **两个 30° 记反** → 相位全反 → Y 接「线电压**超前**相电压 30°」，△ 接「线电流**滞后**相电流 30°」，一个在电压侧、一个在电流侧。
3. **相量当有效值直接加减** → $\dot U_{AB}=\dot U_A-\dot U_B$ 算成 $220-220=0$ → 必须转成代数型做复数减法。
4. **对不对称三线制用一相计算法** → 结果与实际差很远 → 一相法的前提是「对称 + 中性点不位移」，否则先算 $\dot U_{N'N}$。
5. **中性线电流按有效值相加** → 三个 11 A 算成 33 A → 相量和，可能是 0、11 A 或 19 A，取决于相位。
6. **以为中性线断开只是「断了一条线」** → 忽视电压重新分配 → 断中性线会让轻载相过压，是烧设备的典型原因。
7. **铭牌 380 V 当成绕组电压** → 电机绝缘选型错 → 380 V 是**线**电压；Y 接时每相绕组只承受 220 V。
8. **忘记 $380\approx\sqrt3\times220$ 是取整** → 纠结末位 → 精确值是 381.05，工程与考试都按题目给的数走。

## 十、自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. 一台 △ 接的电机，线电压 380 V，线电流 10 A。它的相电压、相电流各是多少？
2. 为什么三根火线不加中性线也能构成回路？这个结论依赖哪个前提？
3. 三相四线制中，A 相负载断开、B、C 相正常，中性线完好与中性线断开两种情况，B 相电压分别是多少？

## 下一步

这一页把「电压电流怎么分配」讲完了，但还没算功率——三相功率的公式为什么长得像单相、两块功率表为什么能测三相，是下一页的事。

<Prereq id="power-factor" /> → [13 · 三相功率与测量](./power.md)
