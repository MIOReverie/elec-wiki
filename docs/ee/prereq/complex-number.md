---
title: 复数与相量运算
description: 复数四种写法怎么互换、加减为什么只能用代数型、乘除为什么只能用极坐标，以及相量的模为什么取有效值。
---

# 复数与相量运算

<Meta time="5 min" level="卡片" note="加减用代数型、乘除用极坐标；相量的模取有效值而不是峰值，这一处写错整体差 √2 倍" />

数学课上的虚数单位是 $i$，翻开电路书全变成了 $j$。不是印刷错误。

$i$ 在电路里早就被瞬时电流占用了。一个式子里同时出现电流 $i$ 和虚数单位 $i$，谁都读不下去，于是电类学科统一改用 $j$。数学没变，只是换了个字母。详见[符号与约定 · 虚数单位](../../guide/notation.md#一、虚数单位-为什么是-j-而不是-i)。

## 四种写法，一个数

复数像是「带方向的数」：$3+j4$ 说的是朝某个方向、长度 5 的一个量，在平面上看就是一个点，横向 3、纵向 4。

正式定义里，复数 $A = a+jb$ 的 $a$ 叫实部、$b$ 叫虚部，$j$ 是虚数单位（$j^2=-1$）。

四种写法写的是同一个数：

$$
A = a + jb = |A|(\cos\varphi + j\sin\varphi) = |A|e^{j\varphi} = |A|\angle\varphi
$$

| 写法 | 形式 | 什么时候用 |
| --- | --- | --- |
| 代数型（直角坐标） | $A = a+jb$ | 加、减 |
| 三角型 | $A = \lvert A\rvert(\cos\varphi+j\sin\varphi)$ | 从模和角推出实部虚部 |
| 指数型 / 极坐标 | $A = \lvert A\rvert e^{j\varphi} = \lvert A\rvert\angle\varphi$ | 乘、除，以及电气里的相量 |

| 符号 | 含义 |
| --- | --- |
| $a$ | 实部，复数在实轴上的坐标 |
| $b$ | 虚部，复数在虚轴上的坐标 |
| $\lvert A\rvert$ | 模（长度），复数到原点的距离 |
| $\varphi$ | 幅角，从正实轴逆时针量起的角度 |
| $j$ | 虚数单位，$j^2=-1$ |

换算是这两个方向：

$$
|A| = \sqrt{a^2+b^2},\quad \varphi = \arctan\frac{b}{a},\quad a = |A|\cos\varphi,\quad b = |A|\sin\varphi
$$

## 加减一种写法，乘除另一种

$$
\frac{A_1\angle\varphi_1}{A_2\angle\varphi_2} = \frac{|A_1|}{|A_2|}\angle(\varphi_1-\varphi_2)
\qquad
j = 1\angle 90^\circ,\quad \frac{1}{j} = -j
$$

::: tip 记这条口诀就够了
加减用代数型（$a+jb$），乘除用极坐标（$|A|\angle\varphi$）。选错形式不是算得慢，是根本算不出来：两个极坐标形式的复数不能直接相加，实部虚部没有对齐。
:::

<FigBox title="同一个复数的两种坐标" kind="结构" note="左边按实部虚部分量，右边按模和幅角。两个相量相加就是首尾相接成三角形，取模时用勾股定理。">

<svg viewBox="0 0 470 250" role="img" aria-label="复平面上 3 加 j4：实部 3，虚部 4，模 5，幅角 53.1 度">
<g font-size="12" fill="var(--vp-c-text-1)">
  <line x1="60" y1="200" x2="400" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
  <line x1="90" y1="225" x2="90" y2="30" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
  <text x="394" y="216" text-anchor="end" fill="var(--vp-c-text-3)">实轴（Re）</text>
  <text x="96" y="26" fill="var(--vp-c-text-3)">虚轴（Im）</text>
  <line x1="195" y1="60" x2="195" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="90" y1="60" x2="195" y2="60" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="90" y1="200" x2="195" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
  <path d="M 117 200 A 27 27 0 0 0 108.8 176.6" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2"/>
  <text x="126" y="190" fill="var(--vp-c-text-3)">53.1°</text>
  <text x="142" y="218" text-anchor="middle">3</text>
  <text x="78" y="134" text-anchor="end">4</text>
  <text x="204" y="52" fill="var(--vp-c-brand-1)">3 + j4</text>
  <text x="204" y="70" fill="var(--vp-c-text-3)">模 5</text>
  <text x="235" y="240" text-anchor="middle" fill="var(--vp-c-text-3)">实部 3、虚部 4 给出代数型；模 5、幅角 53.1° 给出极坐标型</text>
</g>
</svg>

</FigBox>

## 相量：给正弦量装个复数壳

相量（phasor）就是把同频正弦量的有效值当模、初相位当幅角，写成的一个复数：

$$
\dot U = U\angle\psi
$$

字母上方那个点号是全站统一的相量记号，有些书用粗体 $\mathbf U$ 或下划线 $\underline U$，含义相同。三条读法必须记住：

- $\dot U$ 的模是有效值，不是峰值。这是电类学科的约定，和数学里「复数模就是幅值」的习惯不一样。
- $\angle$ 后面是初相位，单位默认度。
- 相量不是时间函数，它不带 $t$。$\dot U \neq u(t)$，永远不能画等号。

## 四个错处

1. 相量的模用峰值。结果整体差一个 $\sqrt2$ 倍。相量取有效值，瞬时表达式取幅值；去的时候除 $\sqrt2$，回来的时候乘 $\sqrt2$。
2. 加减也用极坐标直接加模。相位丢了，模也不对。加减先转代数型，实部加实部、虚部加虚部。
3. 用 $\arctan$ 算幅角时不分象限。实部为负时幅角差 $180^\circ$。先看实部符号，实部为负就把角加（或减）$180^\circ$。
4. 把 $j$ 读成电流 $i$，式子读不通。$j$ 是虚数单位，$j^2=-1$；电流写 $i$ 或 $\dot I$，两者不能混。

## 例题

::: tip 例 1 · 复数换算与除法
题目：已知 $Z = 6+j8\ \Omega$，电源相量 $\dot U = 220\angle0^\circ$ V。求电流相量 $\dot I = \dot U/Z$，并给出它的代数型。

先想什么：这是相量法里最常见的动作，除法必须用极坐标。所以先把 $Z$ 从代数型转成极坐标。

步骤：

1. 模与幅角：$|Z| = \sqrt{6^2+8^2} = 10\ \Omega$，$\varphi = \arctan\frac{8}{6} = 53.1^\circ$，所以 $Z = 10\angle53.1^\circ\ \Omega$。*（为什么先转极坐标：模相除、角相减是除法在极坐标下的形式，代数型下没有对应的除法。）*
2. 相除：$\dot I = \dfrac{220\angle0^\circ}{10\angle53.1^\circ} = 22\angle{-53.1^\circ}\ \text{A}$。*（角是相减：$0^\circ-53.1^\circ=-53.1^\circ$。）*
3. 转回代数型：$22\cos(-53.1^\circ) = 13.2$，$22\sin(-53.1^\circ) = -17.6$，得 $\dot I = 13.2-j17.6\ \text{A}$。

验算，反乘回去：$Z\cdot\dot I = (6+j8)(13.2-j17.6) = 79.2+140.8 + j(-105.6+105.6) = 220+j0$，正是电源电压 $220\angle0^\circ$ ✓。

注意：电流滞后电压 $53.1^\circ$，负号表示滞后，这是感性电路的典型特征。
:::

## 后面哪里用得着

> 完整内容见 [08 · 正弦量与相量法](../04-ac/phasor.md)

后面所有交流电路的计算都建立在这三件事上：能用极坐标做乘除、能用代数型做加减、知道相量的模是有效值。第一次在「有效值、相量、瞬时表达式」三者之间来回换的时候，回来再看一眼这张卡。
