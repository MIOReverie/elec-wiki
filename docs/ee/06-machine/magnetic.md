---
title: 15 · 磁路基础
---

# 15 · 磁路基础

<Meta time="45 min" level="核心" note="全书最容易卡住的一章：公式像电路，但磁路不能照搬电路的算法" />

## 这一页要解决什么

你带着「磁通、磁场强度、磁感应强度到底差在哪」以及「为什么电磁铁一卡住就烧线圈」这两个问题进来。读完你应该能分清 $\Phi$、$B$、$H$ 三个量，会用安培环路定律和磁路欧姆定律算带气隙的磁路，并且看懂交流电磁铁那条「恒磁通、气隙大则电流暴涨」的因果链。

::: tip 读这页之前
- **需要会**：电路里的欧姆定律与基尔霍夫定律（<Prereq id="magnetic-circuit" />）
- **这一页用到的符号**：$F=NI$（磁通势）、$\Phi$、$B$、$H$、$\mu$，含义见[符号与约定](../../guide/notation.md)
- **会用到复数 $j$**：下一页旋转磁场才用，先看 <Prereq id="complex-number" /> 也行；本页纯实数运算
:::

## 结论先行

1. **安培环路定律**：$\oint H\,dl = \sum NI$ —— 这是**恒成立**的，是磁路计算的地基
2. **磁路欧姆定律**：$\Phi = \dfrac{NI}{l/(\mu S)}$ —— **只在 $\mu$ 为常数时成立**，是近似
3. $B = \mu H$、$\Phi = BS$、$\mu = \mu_0\mu_r$
4. 铁磁材料的 $B$-$H$ 曲线**非线性且有磁滞**，所以磁路题几乎都要查曲线
5. 铁损 = 磁滞损耗 + 涡流损耗；硅钢片叠压是为了切断涡流回路

这一章的核心矛盾只有一句话：

> **电路的 $\gamma$（电导率）是常数，磁路的 $\mu$（磁导率）不是。**
> 所以电路题可以纯算，磁路题必须看曲线。

## 一、三个量，先分清楚

初学磁路最常见的混乱，是 $\Phi$、$B$、$H$ 三个量混着说。其实它们的关系只有两句话：

$$
B = \mu H \qquad \Phi = B S
$$

| 量 | 名称 | 单位 | 是什么 | 类比电路 |
| --- | --- | --- | --- | --- |
| $H$ | 磁场强度 | A/m | 由**电流**（安匝）产生的，是「因」 | 电压降 $U = E - IR$ 中的「驱动力」 |
| $B$ | 磁感应强度 | T（特斯拉） | 磁介质中的实际磁通密度，是「果」 | 电流密度 |
| $\Phi$ | 磁通 | Wb（韦伯） | 穿过一个面的磁通总量，$\Phi = BS$ | 电流 |
| $\mu$ | 磁导率 | H/m | 材料的「磁通透性」 | 电导率 $\gamma$ |
| $F = NI$ | 磁动势 | A（安匝） | 线圈产生的磁化能力的度量 | 电动势 $E$ |

**关键在最后一行。** 电流 $I$ 是「通过量」，$NI$ 是「产生磁化的能力」。安匝数是磁路的「电压源」，$\Phi$ 是「电流」。

**为什么要引入 $H$？** 因为电流 $I$ 是与材料无关的物理量，而 $B$ 强烈依赖材料。拆成 $B = \mu H$ 后，$H$ 就变成一个「纯几何/电流决定的量」，可以在各种材料之间比较。工程上（比如设计一个电磁铁要多大电流）我们关心的是 $H$，因为 $H$ 才对应我们能控制的安匝数。

::: tip $H$ 和 $B$ 的实用差别
- 问「要多大的励磁电流」 → 求 $H$（A/m）
- 问「铁心会不会饱和」 → 看 $B$（T），硅钢片饱和点约 $1.6\sim2\text{ T}$
- 问「铁心能传多少磁通」 → 求 $\Phi$（Wb）

永磁材料、电磁材料厂商给的规格书也是按这个分法列的。
:::

## 二、安培环路定律：唯一能无脑用的公式

安培环路定律（安培环路定理）：

$$
\oint_C H\,dl = \sum_{C内} I
$$

对单线圈绕 $N$ 匝、磁路平均长度 $l$（各处 $H$ 相同）：

$$
Hl = NI \quad\Longrightarrow\quad H = \dfrac{NI}{l}
$$

**这条定律永远成立**，不管磁路里是铁、是空气、还是非线性材料。

::: warning 最容易踩的坑
**「磁场强度 $H$ 只由电流和几何尺寸决定，与磁介质的 $\mu$ 无关」——这句话不完全对。**

正确说法：安培环路定律给的是 $\oint H\,dl$，是**沿程的积分**。如果磁路各段材质不同，$H$ 在各段是不同的：

$$
\sum_i H_i l_i = NI
$$

比如一个有铁心段和一个气隙的磁路：$H_{铁}l_{铁} + H_{气}l_{气} = NI$。因为 $\mu_{气} \ll \mu_{铁}$，同样大小的 $H$ 在气隙里产生的 $B$ 远小于铁心，所以**气隙段的 $H$ 会大得多**，占据了绝大部分的安匝。

**这就是为什么电机和交流接触器的铁心必须有气隙，而气隙大小直接决定励磁电流大小的原因。**
:::

## 三、磁阻与磁路欧姆定律

定义磁阻 $R_m$，让安培环路定律看起来像欧姆定律：

$$
R_m = \dfrac{l}{\mu S},\qquad \mu = \mu_0\mu_r
$$

于是：

$$
\Phi = \dfrac{F}{R_m} = \dfrac{NI}{l/(\mu S)}
$$

$\mu_0 = 4\pi\times 10^{-7}\ \text{H/m}$（真空磁导率），硅钢片 $\mu_r \sim 1000\sim10000$，空气 $\mu_r \approx 1$。

**对照表**（这张表值得背下来）：

| 电路 | 磁路 | 备注 |
| --- | --- | --- |
| 电动势 $E$ | 磁动势 $F = NI$ | 单位：V ↔ A（安匝） |
| 电流 $I$ | 磁通 $\Phi$ | |
| 电阻 $R = \dfrac{l}{\gamma S}$ | 磁阻 $R_m = \dfrac{l}{\mu S}$ | 形式完全相同 |
| 电导率 $\gamma$ | 磁导率 $\mu$ | **电路里是常数，磁路里不是** |
| 电流密度 $J$ | 磁密 $B$ | |
| 欧姆定律 $I = E/R$ | 磁路欧姆定律 $\Phi = F/R_m$ | **只在 $\mu$ 常数时成立** |
| 导线截面 $S$ | 磁路截面 $S$ | |

::: tip 心智模型：磁路题的固定动作 —— 分段、查曲线、累加安匝
拿到任何磁路题，按这个顺序走就不会乱：① 沿磁路**分段**（铁心段、气隙段，截面积/材质/长度相同的并成一段）；② 每段用 $\Phi=BS$ 和该段 $B$-$H$ 曲线（或 $\mu$）建立 $H$-$B$ 关系；③ 用**恒成立**的安培环路定律 $\sum H_il_i = NI$ 把所有段串起来解。磁路欧姆定律只是把 ③ 包装成欧姆定律的样子，$\mu$ 一变就不准——真正的地基永远是安培环路定律。
:::

### 气隙为什么「很贵」

磁阻 $R_m = l/(\mu S)$。空气的 $\mu_0$ 比铁心的 $\mu$ 小三到四个数量级，所以同样 $l$、$S$ 的空气段，磁阻是铁心段的**几千倍**。

**结论：磁路里哪怕只有 0.1 mm 的气隙，它承担的磁阻可能超过整个铁心。**

工程推论：
- 变压器叠片之间要压紧、涂绝缘漆不是为绝缘电，而是**减少气隙**（减少励磁电流）
- 电机气隙是设计中最关键的尺寸：气隙大 → 励磁电流大、功率因数低、启动转矩下降
- 电磁铁吸合时气隙消失 → 励磁电流大幅下降，这是直流电磁铁吸合「不费电」的原因

::: tip 磁路计算的两种方法
**方法一（近似法，用于初步估算）**：假设铁心 $\mu_r$ 很大 → 铁心磁阻可忽略 → 全部安匝落在气隙上：

$$
NI \approx H_{气}l_{气} = \dfrac{B_{气}}{\mu_0}l_{气} \quad\Longrightarrow\quad B_{气} \approx \dfrac{\mu_0 NI}{l_{气}}
$$

这个式子极其好用——很多电机/电磁铁的估算题就靠它。

**方法二（精确法，用 $B$-$H$ 曲线）**：查硅钢片的 $B$-$H$ 曲线得到 $H_{铁}$，再逐段累加安匝。设计变压器、电机时必须这么做。
:::

## 四、铁磁材料的 $B$-$H$ 曲线

<FigBox title="磁化曲线与磁滞回线" kind="曲线" note="横轴 H 增大时 B 先快速增长，进入「膝部」后放缓，最终在 1.6~2 T 附近饱和。铁心设计永远工作在膝部附近——再多加电流也换不来多少磁通，这就是变压器「嗡嗡响」和励磁电流上不去的原因。">
<WavePreset kind="magnetize" :p="1.2" :q="0.9" />
</FigBox>

### 三个必须记住的特征

1. **非线性 + 饱和**：$B$ 到 1.6~2 T 后再怎么加 $H$ 都不怎么涨。工程上绝不会让铁心工作在饱和区（电流白涨、发热剧增、效率骤降）
2. **剩磁 $B_r$**：$H$ 降到 0 时 $B$ 还有残留。剩磁大 → 变压器空载时「通电不放」、电表 remanent 偏转
3. **矫顽力 $H_c$**：要让 $B$ 回到 0 需要反向加一个不小的 $H$。$H_c$ 小 → 材料「软」（易磁化易退磁，用于变压器铁心）；$H_c$ 大 → 材料「硬」（剩磁强，用于永磁材料）

**软磁 vs 硬磁**：

| | 软磁材料 | 硬磁材料 |
| --- | --- | --- |
| $B_r$ | 小 | **大** |
| $H_c$ | **小** | 大 |
| 回线面积 | 窄 → 磁滞损耗小 | 宽 |
| 典型 | 硅钢片、铁氧体、软磁铁氧体 | 铝镍钴、钕铁硼 |
| 用途 | 变压器、电机、电感 | 永磁电机、扬声器磁钢 |

::: danger 回线面积 = 每周期损耗
磁滞损耗 $P_h = f V k_h B_m^n$（$n \approx 1.6$）。回线围的面积正比于每周期损耗，频率 $f$ 决定每秒循环多少次。

**所以 $P_h \propto f \cdot B_m^{1.6}$**——电压升高（$B_m$ 升）会让铁损以接近平方的速度暴涨。这就是变压器不能过电压运行的原因。
:::

### 涡流损耗与叠片

交变磁通在铁心里会感生**涡流**（闭合的环形电流），涡流造成的损耗 $P_e \propto B_m^2 f^2 t^2 / \rho$。

$$P_e \propto \frac{B_m^2 f^2 d^2}{\rho_{\text{铁}}}$$

- 与 $B_m^2$、$f^2$ 成正比 → **升频特别致命**
- 与片厚 $d^2$ 成正比 → **减薄最有效**

**所以硅钢片要叠成 0.35 mm 薄片**，片间涂绝缘漆切断涡流回路。高频场合进一步用更薄的 0.2 mm、0.1 mm 或非晶合金。

> **一个有用的判断**：50 Hz 用 0.35 mm 硅钢片；400 Hz（航空、 military）要用 0.2 mm 以下；几千 Hz（开关电源）通常干脆不用硅钢片，改用**铁氧体**或纳米晶。

## 五、例题

::: tip 例 1 · 空心线圈的基本计算
**题干**：长 $l = 20\text{ cm}$ 的空心线圈，$N = 1000$ 匝，通 $I = 0.5\text{ A}$。求线圈内部的磁场强度 $H$、磁感应强度 $B$、磁通 $\Phi$（线圈截面积 $S = 5\text{ cm}^2$）。

**解答**

**先想什么**：这是一条「直路」磁路题——既无铁心也无气隙，所以不用碰磁阻。顺序是先 $H$（安培环路定律按几何算）、再 $B$（乘 $\mu_0$）、最后 $\Phi$（乘面积），三步全是定义式，别跳。单位先统一成国际单位再代，比算完再换安全。

**第 1 步：$H$** —— 安培环路定律，与材料无关：

$$
H = \frac{NI}{l} = \frac{1000 \times 0.5}{0.2} = 2500\ \text{A/m}
$$

**第 2 步：$B$** —— 空心线圈是空气，$\mu = \mu_0$：

$$
B = \mu_0 H = 4\pi\times10^{-7} \times 2500 = 3.14\times10^{-3}\ \text{T} = 3.14\ \text{mT}
$$

**第 3 步：磁通**

$$
\Phi = BS = 3.14\times10^{-3} \times 5\times10^{-4} = 1.57\times10^{-6}\ \text{Wb}
$$

> **为什么这么想**
> 注意 $S = 5\text{ cm}^2 = 5\times10^{-4}\ \text{m}^2$。电工学里单位换算出错是丢分重灾区，这里建议所有计算**先统一换算成国际单位再代入**，比算完再换算安全得多。
> 另外注意：$B$ 只有 3.14 mT，非常小。这就是为什么「电磁铁要靠铁心」——空气的 $\mu$ 太小，做不出强磁场。

**答**：$H = 2500\text{ A/m}$，$B = 3.14\text{ mT}$，$\Phi = 1.57\ \mu\text{Wb}$。

**验算**：$NI = 1000\times0.5 = 500$ 安匝，除以 $l=0.2$ m 得 $H=2500$ A/m（安培环路定律复核），再乘 $\mu_0$ 与 $S$ 依次得到 $B$、$\Phi$，与上面一致 ✓。
:::

::: tip 例 2 · 有气隙的电磁铁（近似法）
**题干**：U 形电磁铁，铁心由硅钢片叠成，线圈 $N = 500$ 匝，通 $I = 1\text{ A}$。铁心截面积 $S = 20\text{ cm}^2$，平均磁路长度中铁心部分 $l_1 = 30\text{ cm}$，气隙 $\delta = 0.5\text{ mm}$。求气隙中的磁通（用近似法）。

**解答**

**先想什么**：这道题的坑是「近似法」未必真能近似。先别急着套公式，先用 $R_{m1}/R_{m2}=l_1/(\mu_r\delta)$ 估一下铁心磁阻占比。比值远小于 1（约 0.1 以内）才敢忽略铁心；否则必须按 $NI=H_1l_1+H_{\delta}\delta$ 分摊安匝。这里算出来是 0.6，所以走「按比例分摊」而不是「全落气隙」。

**思路：用近似法，安匝几乎全落在气隙上。**

为什么？铁心磁阻 $R_{m1} = l_1/(\mu_0\mu_r S)$，气隙磁阻 $R_{m2} = \delta/(\mu_0 S)$。取 $\mu_r = 1000$：

$$
\frac{R_{m1}}{R_{m2}} = \frac{l_1/(\mu_0\mu_r S)}{\delta/(\mu_0 S)} = \frac{l_1}{\mu_r\delta} = \frac{0.3}{1000\times 5\times10^{-4}} = 0.6
$$

铁心磁阻只有气隙的 60%——已经不算很小了，说明 $l_1$ 太长或气隙太小。

按比例分配安匝（更准确）：气隙承担 $1/(1+0.6) = 62.5\%$ 的安匝：

$$
H_{气} = \frac{NI}{l_1/\mu_r + \delta} = \frac{500}{0.3/1000 + 5\times10^{-4}} = \frac{500}{3\times10^{-4} + 5\times10^{-4}} = \frac{500}{8\times10^{-4}} = 6.25\times10^5\ \text{A/m}
$$

$$
B_{气} = \mu_0 H_{气} = 4\pi\times10^{-7}\times 6.25\times10^5 = 0.785\ \text{T}
$$

$$
\Phi = BS = 0.785 \times 20\times10^{-4} = 1.57\times10^{-3}\ \text{Wb}
$$

**验算**：$0.785\text{ T}$ 远低于饱和点（约 1.6 T），工作点合理 ✓

把这条磁路画出来，500 安匝「花在哪」就看得很清楚了：

<FigBox title="带气隙的电磁铁：铁心与气隙串联，安匝按磁阻分摊" kind="结构" note="铁心（硅钢片，μ_r = 1000）与气隙（空气，μ = μ₀）是串联的同一条磁路：穿过二者的磁通 Φ 相同，截面同为 S。虚线箭头是磁通走向，红色窄条是气隙 δ = 0.5 mm（未按比例画，等比只有一条发丝）。图下方把 500 安匝按 H₁l₁ 与 H_δδ 两段画成条形，长度比就是安匝比。">
<svg viewBox="0 0 560 360" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="带气隙的 U 形电磁铁磁路与 500 安匝在铁心与气隙之间的分配"><rect x="120" y="62" width="310" height="170" fill="var(--vp-c-brand-1)" opacity="0.06" stroke="none"/><path d="M120 62 H268 M296 62 H430 V232 H120 Z" fill="none" stroke="var(--vp-c-text-1)" stroke-width="2"/><path d="M150 92 H268 M296 92 H400 V202 H150 Z" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4"/><text x="120" y="48" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">硅钢片铁心：l₁ = 30 cm，S = 20 cm²，μ_r = 1000</text><rect x="268" y="56" width="28" height="42" fill="var(--vp-c-danger-1)" opacity="0.2" stroke="var(--vp-c-danger-1)" stroke-width="1.4"/><line x1="263" y1="38" x2="263.4" y2="38"/><path d="M269 38 L261.7 41.26 L261.7 34.74 Z" class="sf-solid"/><line x1="301" y1="38" x2="300.6" y2="38"/><path d="M295 38 L302.3 34.74 L302.3 41.26 Z" class="sf-solid"/><text x="282" y="24" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   sf-w700">δ = 0.5 mm</text><text x="318" y="110" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   ">气隙：μ = μ₀</text><circle cx="104" cy="96" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><line x1="101" y1="93" x2="107" y2="99" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><line x1="101" y1="99" x2="107" y2="93" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><circle cx="446" cy="96" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><circle cx="446" cy="96" r="2" class="sf-dot"/><circle cx="104" cy="116" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><line x1="101" y1="113" x2="107" y2="119" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><line x1="101" y1="119" x2="107" y2="113" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><circle cx="446" cy="116" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><circle cx="446" cy="116" r="2" class="sf-dot"/><circle cx="104" cy="136" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><line x1="101" y1="133" x2="107" y2="139" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><line x1="101" y1="139" x2="107" y2="133" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><circle cx="446" cy="136" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><circle cx="446" cy="136" r="2" class="sf-dot"/><circle cx="104" cy="156" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><line x1="101" y1="153" x2="107" y2="159" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><line x1="101" y1="159" x2="107" y2="153" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><circle cx="446" cy="156" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><circle cx="446" cy="156" r="2" class="sf-dot"/><circle cx="104" cy="176" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><line x1="101" y1="173" x2="107" y2="179" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><line x1="101" y1="179" x2="107" y2="173" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><circle cx="446" cy="176" r="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6"/><circle cx="446" cy="176" r="2" class="sf-dot"/><text x="92" y="84" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t   sf-w600">N = 500 匝</text><text x="92" y="100" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t   ">I = 1 A</text><text x="92" y="116" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t   sf-w600">NI = 500 安匝</text><text x="456" y="100" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t   sf-w600">N = 500 匝</text><path d="M135 217 H415 V77 H135 Z" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" stroke-dasharray="7 5"/><line x1="300" y1="217" x2="215.6" y2="217"/><path d="M210 217 L217.3 213.74 L217.3 220.26 Z" class="sf-solid"/><line x1="415" y1="200" x2="415" y2="125.6"/><path d="M415 120 L418.26 127.3 L411.74 127.3 Z" class="sf-solid"/><line x1="210" y1="77" x2="324.4" y2="77"/><path d="M330 77 L322.7 80.26 L322.7 73.74 Z" class="sf-solid"/><line x1="135" y1="120" x2="135" y2="184.4"/><path d="M135 190 L131.74 182.7 L138.26 182.7 Z" class="sf-solid"/><text x="238.88" y="200" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">Φ</text><text x="246.32" y="206.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   "></text><text x="268" y="200" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t   sf-w600">= 1.57 mWb</text><text x="150" y="150" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t   sf-w600">B ≈ 0.785 T</text><text x="150" y="166" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">（远低于 1.6 T 饱和点）</text><rect x="120" y="268" width="187.5" height="26" fill="var(--vp-c-brand-1)" opacity="0.25" stroke="var(--vp-c-brand-1)" stroke-width="1.4"/><rect x="307.5" y="268" width="312.5" height="26" fill="var(--vp-c-danger-1)" opacity="0.28" stroke="var(--vp-c-danger-1)" stroke-width="1.4"/><text x="214" y="281" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w600">铁心 187.5 安匝（37.5%）</text><text x="464" y="281" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   sf-w600">气隙 312.5 安匝（62.5%）</text><text x="120" y="256" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">500 安匝怎么分：H₁l₁ + H_δδ = NI</text><text x="120" y="316" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">R_m1/R_m2 = l₁/(μ_r δ) = 0.6：铁心磁阻是气隙的 60%，不能忽略</text><text x="120" y="334" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   ">若按「安匝全落气隙」的近似法：B = μ₀NI/δ = 1.26 T，比 0.785 T 高 60%</text></svg>
</FigBox>

**看图能读出什么**：气隙只占磁路长度的 **0.166%**（0.5 mm / 30.05 cm），却吃掉 **62.5%** 的安匝——条形图右侧那一大段红色就是它的代价。这正是「气隙很贵」的字面含义：磁阻 $R_m=l/(\mu S)$ 里 $\mu$ 差了三个数量级，长度上的劣势被 $\mu$ 完全抵消还有余。也正因为铁心这 187.5 安匝占到了 37.5%，本例才不能走「安匝全落气隙」的近似法——那样算出 $B=\mu_0NI/\delta=1.26$ T，比 0.785 T 高 60%，一脚踩进饱和区附近。

> **为什么这么想**
> 这里我用了比例法而不是「近似法」，因为验算发现铁心磁阻占比 38%，忽略它误差太大。
> **做题时的判断习惯**：先估算 $R_{m1}/R_{m2} = l_1/(\mu_r\delta)$，如果这个比值 < 0.1，铁心磁阻可以忽略，用简化公式；否则老老实实分摊安匝。
> 另外 $20\text{ cm}^2 = 20\times10^{-4}\text{ m}^2$——注意 $1\text{ cm}^2 = 10^{-4}\text{ m}^2$，不是 $10^{-2}$。

**答**：$\Phi \approx 1.57\ \text{mWb}$，$B \approx 0.785\text{ T}$。
:::

::: tip 例 3 · 为什么交流电磁铁卡住会烧
**题干**：某交流接触器线圈额定 $220\text{ V}$、$50\text{ Hz}$。正常吸合时励磁电流 $I_1 = 30\text{ mA}$。问：铁心被卡住、气隙保持 2 mm 不闭合时，电流约为多少？

**解答**

**先想什么**：直流电磁铁和交流电磁铁卡住后果不同，根子在「谁决定磁通」。交流电磁铁的磁通由电压决定（$U\approx 4.44fN\Phi_m$，恒磁通），所以卡住时磁通不变、但气隙磁阻翻倍 → 安匝必须翻倍 → 电流随气隙成正比涨。直流电磁铁则恒磁动势、电流由电阻定，与气隙无关。所以这道题只盯一条链：气隙比 = 电流比。

**第一性思考：交流电磁铁是什么在决定磁通？**

$$
U \approx E = 4.44\,f N \Phi_m
$$

$$
\Phi_m = \frac{U}{4.44 fN}
$$

**$U$、$f$、$N$ 都不变 → $\Phi_m$ 不变。** 这就是交流电磁铁「恒磁通」的来历。

**气隙大 → 磁阻大 → 要维持同样的 $\Phi_m$ 需要更大的 $H$ → 更大的励磁电流。**

安培环路定律：$H_{气} = \dfrac{NI}{\delta}$，而 $B_{气} = \dfrac{\Phi_m}{S}$ 固定，所以 $H_{气} = \dfrac{B_{气}}{\mu_0}$ 也是固定的。

于是：

$$
\frac{I_{卡}}{I_{1}} = \frac{H_{卡}\,\delta_{卡}}{H_1\,\delta_1}
$$

设正常吸合气隙 $\delta_1 = 0.1\text{ mm}$，卡住时 $\delta_{卡} = 2\text{ mm}$（且铁心部分安匝可忽略）：

$$
\frac{I_{卡}}{I_1} \approx \frac{2}{0.1} = 20
$$

$$
I_{卡} \approx 30\text{ mA} \times 20 = 600\ \text{mA} = 0.6\text{ A}
$$

**20 倍！** 线圈匝数是按 $30\text{ mA}$ 选的，铜损按 $I^2R$ 算，现在电流大 20 倍 → 铜损**大 400 倍** → 几分钟内线圈烧毁。

::: danger 这是真实事故
工业现场「接触器吸不上、嗡嗡响、然后烧了」就是这个原理。处理办法：
1. 先查机械卡涩（铁锈、异物、油污、弹簧失效）
2. 选型时保证**线圈额定电压与电源一致**（有的厂商标 220 V 的用在 380 V 网上，直接导致长期过励磁）
3. 电子式接触器 / 软启动器可规避
:::

**对比直流电磁铁**：恒磁动势 $F = NI$，电流由电阻决定，与气隙几乎无关。吸合后气隙消失 → 磁路磁阻下降 → 但电流不变 → 吸力反而因为磁通增大而增大。**所以直流电磁铁吸合后「更省电」，交流电磁铁吸合前后电流基本不变。**

**答**：卡住时电流约为 $0.6\text{ A}$，是正常值的约 20 倍。

**验算**：气隙由 $\delta_1=0.1$ mm 变到 $\delta_{卡}=2$ mm，比值 20；安培环路定律下维持同一 $\Phi_m$ 所需励磁电流与气隙成正比，故 $I_{卡}\approx20I_1=0.6$ A（安培环路定律复核）✓。

两张图并排放，这条事故链就不用背了：

<FigBox title="交流电磁铁：吸合与卡住的磁路对比" kind="结构" note="两图共用同一套线圈与铁心（交流 220 V、50 Hz），唯一差别是衔铁与铁心柱之间的气隙：左边正常吸合（δ₁ = 0.1 mm），右边被异物卡住（δ_卡 = 2 mm）。交流电磁铁的磁通由电压定死（U ≈ 4.44 fN Φ_m），Φ_m 不变；气隙变大 → 气隙磁阻变大 → 要在气隙上凑出同样的 B，所需安匝按气隙长度成正比增长。">
<svg viewBox="0 0 600 360" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="交流电磁铁正常吸合与铁心卡住两种状态的磁路与电流对比"><rect x="40" y="82" width="148" height="138" fill="var(--vp-c-brand-1)" opacity="0.05" stroke="none"/><path d="M40 118 V220 H188 V118" fill="none" stroke="var(--vp-c-text-1)" stroke-width="2"/><path d="M66 118 V194 H162 V118" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4"/><rect x="34" y="88" width="160" height="26" fill="var(--vp-c-text-1)" opacity="0.14" stroke="var(--vp-c-text-1)" stroke-width="1.6"/><rect x="40" y="114" width="148" height="4" fill="var(--vp-c-danger-1)" opacity="0.35" stroke="var(--vp-c-danger-1)" stroke-width="1.2"/><circle cx="26" cy="134" r="5.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/><circle cx="26" cy="134" r="1.8" class="sf-dot"/><circle cx="26" cy="154" r="5.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/><circle cx="26" cy="154" r="1.8" class="sf-dot"/><circle cx="26" cy="174" r="5.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/><circle cx="26" cy="174" r="1.8" class="sf-dot"/><text x="114" y="20" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">正常吸合</text><text x="114" y="40" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   sf-w600">δ₁ = 0.1 mm</text><text x="114" y="242" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="#34d399" class="sf-t   sf-w700">I₁ = 30 mA（额定）</text><text x="114" y="260" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">铜损 ∝ I²：基准 1×</text><rect x="350" y="46" width="148" height="174" fill="var(--vp-c-brand-1)" opacity="0.05" stroke="none"/><path d="M350 118 V220 H498 V118" fill="none" stroke="var(--vp-c-text-1)" stroke-width="2"/><path d="M376 118 V194 H472 V118" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4"/><rect x="344" y="52" width="160" height="26" fill="var(--vp-c-text-1)" opacity="0.14" stroke="var(--vp-c-text-1)" stroke-width="1.6"/><rect x="350" y="78" width="148" height="40" fill="var(--vp-c-danger-1)" opacity="0.35" stroke="var(--vp-c-danger-1)" stroke-width="1.2"/><circle cx="336" cy="134" r="5.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/><circle cx="336" cy="134" r="1.8" class="sf-dot"/><circle cx="336" cy="154" r="5.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/><circle cx="336" cy="154" r="1.8" class="sf-dot"/><circle cx="336" cy="174" r="5.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5"/><circle cx="336" cy="174" r="1.8" class="sf-dot"/><text x="424" y="20" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">铁心被卡住</text><text x="424" y="40" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   sf-w600">δ_卡 = 2 mm（20 倍）</text><text x="424" y="242" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   sf-w700">I_卡 ≈ 600 mA（20 倍）</text><text x="424" y="260" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">铜损 ∝ I²：400× → 烧毁</text><line x1="278" y1="170" x2="316.4" y2="170"/><path d="M322 170 L314.7 173.26 L314.7 166.74 Z" class="sf-solid"/><text x="300" y="154" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-danger-1)" class="sf-t   sf-w700">气隙 ×20</text><text x="300" y="288" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">U ≈ 4.44 fN Φ_m：U、f、N 都不变 → Φ_m 恒定 → 磁阻涨多少，安匝就得涨多少</text><text x="300" y="306" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">NI = H_δ·δ 且 H_δ = B/μ₀ 被 Φ_m 定死 → NI ∝ δ → I ∝ δ</text><text x="300" y="324" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">直流电磁铁反过来：恒磁动势，电流由线圈电阻定，与气隙无关 → 卡住不烧</text><text x="300" y="344" text-anchor="middle" dominant-baseline="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">（两图共用同一线圈：交流 220 V、50 Hz；气隙未按比例画，等比画右图会撑破纸面）</text></svg>
</FigBox>

**看图能读出什么**：两图里**磁通是一样多的**（同一个 $\Phi_m$，由 220 V / 50 Hz / N 定死），变的只有中间那条红色空气缝的厚度。缝厚 20 倍 → 安匝 20 倍 → 电流 20 倍（30 mA → 600 mA），而铜损按 $I^2R$ 走，就是 **400 倍**，几分钟烧掉。右下角那句对比要一起记住：直流电磁铁是恒磁动势，电流由线圈电阻定，卡住了也不涨电流——**只有交流电磁铁会因为这个原因烧线圈**。
:::

::: tip 例 4 · 铁损估算
**题干**：一台变压器铁心用 0.35 mm 硅钢片叠成，工作在 $B_m = 1.2\text{ T}$、$50\text{ Hz}$。若改用 0.2 mm 硅钢片，只考虑涡流损耗，涡流损耗大约降低多少？

**解答**

**先想什么**：题面问「只考虑涡流损耗」时，直接套 $P_e\propto d^2$ 一个平方比就完事。但真正容易丢分的是后半句——总铁损还含磁滞损耗（$P_h\propto fB_m^{1.6}$，与片厚无关），所以减薄的收益对总铁损被「稀释」了。先算纯涡流，再补一句「总降幅更小」，别把两个损耗混为一个。

涡流损耗与片厚平方成正比：

$$
\frac{P_{e2}}{P_{e1}} = \left(\frac{d_2}{d_1}\right)^2 = \left(\frac{0.2}{0.35}\right)^2 = (0.571)^2 \approx 0.327
$$

**涡流损耗降低到原来的 33%，即降低约 67%。**

但注意：**总**铁损不只看涡流。还有磁滞损耗 $P_h \propto fB_m^{1.6}$，它与片厚无关。

所以总铁损的降低幅度**小于** 67%。如果原来涡流占总铁损的 40%，那总铁损降低：

$$
0.4\times 67\% = 27\%
$$

> **为什么这么想**
> 这道题考的是「你知不知道磁滞和涡流对片厚的依赖不同」。
> 实际工程中：如果铁损主要是磁滞（比如工频、低硅钢片），减薄片厚收益有限；如果是高频（开关变压器），涡流占比高，减薄/换材料收益巨大。
> 另外片数增加会带来新的损耗——**片间绝缘不良会形成新的涡流回路**，这就是硅钢片涂层质量这么重要的原因。

**答**：涡流损耗降低约 67%；总铁损降幅更小，取决于两种损耗的占比。

**验算**：涡流损耗正比于片厚平方，故 $(0.2/0.35)^2\approx0.327$，即剩 33%、降 67%（涡流损耗与片厚平方成正比复核）；磁滞部分与厚度无关，故总降幅 = 涡流占比 × 67% < 67% ✓。
:::

## 六、易错清单

1. **磁路欧姆定律当精确公式用**：$\mu$ 不常数，必须查 $B$-$H$ 曲线
2. **气隙磁阻被忽略**：0.1 mm 气隙的磁阻可能等于 1 m 的铁心
3. **单位换算**：$1\text{ cm}^2 = 10^{-4}\text{ m}^2$、$1\text{ mm} = 10^{-3}\text{ m}$、$\mu_0 = 4\pi\times10^{-7}$
4. **交流电磁铁按直流思路算**：交流是恒磁通不是恒磁动势，气隙大 → 电流暴涨
5. **认为 $\Phi$ 与电流成正比**：只在未饱和、$\mu$ 近常数时成立
6. **铁心饱和**：$B_m$ 超过 1.6~2 T 后电流剧增、发热、波形畸变（设计铁心要工作在膝部）

## 七、自检

- [ ] 能默写磁路/电路对照表，并说出**唯一照搬不了**的是哪一项
- [ ] 给一个带气隙的磁路，能判断「气隙吃掉了多少安匝」
- [ ] 能解释交流电磁铁卡住为什么烧线圈（完整因果链）
- [ ] 知道为什么硅钢片要叠薄、叠压紧

<Prereq id="magnetic-circuit" /> → 接着看 [16 · 变压器](./transformer.md)
