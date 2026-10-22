---
title: 08 · 正弦量与相量法
description: 正弦量三要素与有效值、虚数单位为什么用 j、复数的三种写法与加减乘除、相量与相量图；把交流电路的微积分方程翻译成复数代数，配五道带图例题。
---

# 08 · 正弦量与相量法

<Meta time="55 min" level="核心" note="两个坑最深：把 j 当成电流、把两个有效值直接相加" />

**这一页要解决什么**：交流电路里的元件关系是微积分，写出来的方程带导数。这一页把「对正弦量求导、积分」翻译成「复数乘、除」，让你在交流电路里能像直流一样只做代数。读完你应该能：把一个正弦量写成相量、把相量还原成瞬时表达式、判断谁超前谁、以及算对两个正弦量相加——并且知道式子里那个 $j$ 到底是什么。

::: tip 读这页之前
- **需要会**：欧姆定律与串并联（<Prereq id="ohm" />、<Prereq id="series-parallel" />）、正弦量的基本形状（<Prereq id="sine-params" />）。
- **这一页用到的符号**：$u$、$i$ 是**瞬时值**（随时间变，可正可负），$U$、$I$ 是**有效值**（仪表读数），$U_m$ 是**幅值**（峰值）；另有 $\omega$（角频率）、$\psi$（初相位）、$\varphi$（相位差）、$\dot U$（相量，字母上的点号）。全部约定见[符号与约定](../../guide/notation.md)。
- **会用到复数**：代数型、极坐标、模与幅角、加减乘除。没学过的话先看 <Prereq id="complex-number" />，5 分钟够；本页第二节也会把要用的五件工具重讲一遍，你可以只把那一节当复习。
:::

先看两件看似不相干、其实是同一件事的事。**第一件**：你拿万用表电阻档量一个电感线圈，读数是 10 Ω；把它接到 220 V 工频交流上，串一个电流表，读数只有 1.2 A。按欧姆定律 $220/10$ 该是 22 A——差了一个数量级，线圈像是「变大」了 18 倍。可你摸它，半个小时也不烫；而 22 A 直流通过 10 Ω 会烧出 4.8 kW 的热。它变大了，却不发热。

**第二件**：发电厂把第二台发电机并入电网，操作规程要求并网瞬间的电压幅值、频率、相位全部对上。相位差一点点，两台机之间就会出现巨大的环流，保护动作、母线跳闸——没有人能用「看着差不多」来判断相位。两件事问的是同一个问题：**正弦量之间怎么比较、怎么相加、怎么算「大小」**。这一页就干这件事。

## 结论先行

1. 正弦量由幅值、频率、初相位三个数定死；频率相同的电路里，频率这个数可以整页划掉。
2. 有效值是热效应等效出来的均方根值，仪表读数、设备铭牌、说「220 V」时指的都是它，$U=U_m/\sqrt2$。
3. 相量是把「有效值 + 初相位」塞进一个复数的写法，字母上加一个点；电类学科把虚数单位记作 $j$（$j^2=-1$），不用数学课的 $i$，因为 $i$ 已经被瞬时电流占用。
4. 相量法的全部作用：把求导、积分换乘除 $j\omega$，微分方程变复数代数方程，KCL、KVL 的形式一个字不改。
5. 只有同频才能画在同一张相量图上、才能用复数相加；有效值不能直接相加（同相除外）。

::: tip 心智模型：相量法是一台「微积分 → 代数」的编译器
它没有改变任何物理规律——KCL、KVL 照样成立。它只是把「对正弦量求导 / 积分」翻译成「复数乘 $j\omega$ / 除 $j\omega$」。所以相量域里，你直流电路的全部解题动作（串并联、分压、节点法……）原封不动可用。记住一句话：**频率已被「同频假设」定死，剩下要解的只有幅值和相位两个数——恰好是一个复数的两个自由度**。
:::

## 一、先认这个字母：$j$ 是虚数单位，不是电流

这一节只回答一个问题：式子里那个 $j$ 是谁，为什么不是数学课上的 $i$。

数学课本里虚数单位记作 $i$，$i^2=-1$。但电路里 $i$ 早就被占用了——$i(t)$ 是瞬时电流。一个式子里同时出现电流 $i$ 和虚数单位 $i$，就会变成这样：

$$
u = R\,i + j\,i\,\omega L \qquad\text{（错误写法：两个 } i \text{ 含义不同）}
$$

自己读一遍就知道问题在哪：你分不清哪个是「流过电感的电流」，哪个是「转 90° 的那个算符」。所以电类学科（电工学、电路分析、电力系统、电子技术）统一改用 $j$：

$$
j^2 = -1, \qquad j=\sqrt{-1}
$$

> **为什么用 $j$ 不用 $i$**：这不是新数学，只是换了个字母。$i$ 在电路里已经是瞬时电流，两个 $i$ 写进一个式子没法读，于是电类学科统一把虚数单位记作 $j$（$j^2=-1$）。看到 $j$ 读作「虚数单位」，永远不要读成电流。详细约定见[符号与约定 · 虚数单位](../../guide/notation.md#一、虚数单位-为什么是-j-而不是-i)。

$j$ 的几何意义比它的代数定义有用得多：**乘一个 $j$，等于在复平面上逆时针转 90°**。因为

$$
j\cdot 1 = j = 1\angle 90^\circ, \qquad j\cdot j = j^2 = -1 = 1\angle 180^\circ
$$

转两次 90° 就是转 180°，也就是乘 $-1$——$j^2=-1$ 就是这么来的。顺手记住两条推论：$1/j=-j$（除以 $j$ 等于顺时针转 90°），以及 $j$ 的模是 1（旋转不改长度，只改方向）。

<!-- 图：j 的旋转意义 -->

<FigBox title="乘一个 j，就是逆时针转 90°" kind="结构" note="转两次 90° 回到反方向，这就是 j² = −1 的几何版本；乘 -j 则是顺时针转 90°，对应 1/j = -j。">

<svg viewBox="0 0 420 170" role="img" aria-label="复平面上 1 乘 j 得 j、再乘 j 得 -1，两次旋转共 180 度">
<defs>
  <marker id="ph-rot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <line x1="40" y1="120" x2="380" y2="120" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="210" y1="20" x2="210" y2="155" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="372" y="134" text-anchor="end" fill="var(--vp-c-text-3)">实轴</text>
  <text x="222" y="34" fill="var(--vp-c-text-3)">虚轴</text>
  <line x1="210" y1="120" x2="330" y2="120" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ph-rot)" />
  <text x="336" y="124" fill="var(--vp-c-brand-1)">1</text>
  <line x1="210" y1="120" x2="210" y2="30" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ph-rot)" />
  <text x="200" y="18" text-anchor="end" fill="var(--vp-c-brand-1)">j</text>
  <line x1="210" y1="120" x2="90" y2="120" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ph-rot)" />
  <text x="84" y="124" text-anchor="end" fill="var(--vp-c-brand-1)">-1</text>
  <path d="M 246 120 A 36 36 0 0 0 210 84" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
  <path d="M 210 84 A 36 36 0 0 0 174 120" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="252" y="92" fill="var(--vp-c-text-3)">×j → 90°</text>
  <text x="150" y="92" text-anchor="end" fill="var(--vp-c-text-3)">再 ×j → 共 180°</text>
  <text x="210" y="150" text-anchor="middle" fill="var(--vp-c-text-3)">旋转不改变长度，只改变方向</text>
</g>
</svg>

</FigBox>

到这里，$j$ 只是字母层面的约定。真正要动手的是复数运算——下一节把这页要用的复数工具一次补齐，因为相量的一切操作都建立在它们上面。

## 二、复数的五件工具（电气语境版）

这一节只干一件事：让一个复数在三种写法之间来回换，并且会做加减乘除。会了这五件工具，后面的相量就只是「换个名字的复数」。

一个复数有三种写法，它们说的是同一个数：

| 写法 | 形式 | 什么时候用 |
| --- | --- | --- |
| 代数型（直角坐标） | $z = a + jb$ | 加、减 |
| 三角型 | $z = r(\cos\varphi + j\sin\varphi)$ | 从模和角推出实部虚部 |
| 指数型 / 极坐标 | $z = r e^{j\varphi} = r\angle\varphi$ | 乘、除，以及电气里的相量 |

表里的 $r$ 叫**模**（长度），$\varphi$ 叫**幅角**（从正实轴逆时针量起的角度）。把这三行写法连同模、幅角、运算规则一起数，就是这一节要的五件工具：

1. **代数型** $a+jb$——加减只在它上面做；
2. **三角型与指数型** $r(\cos\varphi+j\sin\varphi)=re^{j\varphi}=r\angle\varphi$——同一个数的另一种写法；
3. **模** $r=\sqrt{a^2+b^2}$——复数到原点的距离；
4. **幅角** $\varphi$——从正实轴逆时针量起的角；
5. **运算规则**——加减用代数型（实部加实部、虚部加虚部），乘除用极坐标（模相乘除、角相加减）。

拿电气里最常用的一个数走一遍：$z=3+j4$。

$$
r=\sqrt{3^2+4^2}=5, \qquad \varphi=\arctan\frac{4}{3}=53.1^\circ
$$

所以 $3+j4 = 5\angle 53.1^\circ$。反向验算：$5\cos 53.1^\circ = 5\times0.6=3.00$，$5\sin 53.1^\circ = 5\times0.8=4.00$，回到 $3+j4$ ✓。

<!-- 图：复平面上的 3+j4 -->

<FigBox title="同一个复数的两个坐标：实部虚部，或者模与幅角" kind="结构" note="加减在代数型里做（实部管实部、虚部管虚部），乘除在极坐标里做（模乘除、角加减）。选错形式是这一节最费时间的错。">

<svg viewBox="0 0 420 250" role="img" aria-label="复平面上的向量 3+j4：实部 3、虚部 4、模 5、幅角 53.1 度">
<defs>
  <marker id="ph-vec" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <line x1="60" y1="200" x2="380" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="80" y1="225" x2="80" y2="30" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="374" y="216" text-anchor="end" fill="var(--vp-c-text-3)">实轴（Re）</text>
  <text x="86" y="26" fill="var(--vp-c-text-3)">虚轴（Im）</text>
  <line x1="215" y1="20" x2="215" y2="200" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 4" />
  <line x1="80" y1="20" x2="215" y2="20" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 4" />
  <line x1="80" y1="200" x2="215" y2="20" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#ph-vec)" />
  <path d="M 118 200 A 38 38 0 0 0 102.8 169.6" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="126" y="188" fill="var(--vp-c-text-3)">53.1°</text>
  <text x="147" y="216" text-anchor="middle">3</text>
  <text x="70" y="112" text-anchor="end">4</text>
  <text x="118" y="76">模 5</text>
  <text x="222" y="34">3 + j4</text>
</g>
</svg>

</FigBox>

**乘除验算一遍**，方法比结论重要。算 $5\angle 53.1^\circ \times 2\angle 30^\circ$：极坐标下模乘角加，得 $10\angle 83.1^\circ$。换成代数型复核：$2\angle 30^\circ = 1.732 + j1$，乘开

$$
(3+j4)(1.732+j1) = (3\times1.732 - 4\times1) + j(3\times1 + 4\times1.732) = 1.196 + j9.928
$$

模 $\sqrt{1.196^2+9.928^2}=10.0$，幅角 $\arctan(9.928/1.196)=83.1^\circ$ ✓，两种写法完全一致。

::: warning 幅角只有一个坑，但踩的人最多
$\arctan$ 的值域只有 $(-90^\circ, 90^\circ)$，它分不清第一象限和第三象限。$z=-3-j4$ 的实部为负，算出来 $\arctan(4/3)=53.1^\circ$ 是错的，真正的幅角是 $53.1^\circ-180^\circ=-126.9^\circ$。判别方法：**先看实部符号**，实部为负就把角加（或减）$180^\circ$。相量算错相位，后面超前滞后的结论会整体反过来。
:::

复数这个容器已经会用了，现在要决定往里装什么。装之前，先把正弦量本身拆成几个数。

## 三、正弦量的三要素与有效值

这一节把正弦量拆成三个数字，并说清仪表读的那个数到底是三个里的哪一个。

$$
u(t)=U_m\sin(\omega t+\psi), \qquad \omega = 2\pi f = \frac{2\pi}{T}
$$

| 量 | 符号 | 单位 | 说明 |
| --- | --- | --- | --- |
| 幅值（最大值） | $U_m$ | V / A | 波形偏离零线的最大距离 |
| 角频率 | $\omega$ | rad/s | 每秒转过的弧度，$\omega=2\pi f$ |
| 周期 / 频率 | $T$ / $f$ | s / Hz | $T=1/f$，工频 50 Hz → $T=20$ ms、$\omega=314$ rad/s |
| 初相位 | $\psi$ | rad 或 ° | $t=0$ 时刻的相位，与计时起点有关 |

三要素确定，波形就唯一确定——这句话的意思是：**知道这三个数，你不需要看波形图也能把它画出来，也不需要波形图就能算出任意时刻的值。**

**有效值**不是随手定义的，它是热效应等效的结果：让交流电和直流电分别通过同一个电阻，一个周期内产生相同热量的那个直流值，就叫这个交流量的有效值。

$$
\int_0^T \frac{u^2}{R}\,dt = \frac{U^2}{R}T \;\Longrightarrow\; U=\sqrt{\frac{1}{T}\int_0^T u^2\,dt}
$$

把 $u=U_m\sin(\omega t+\psi)$ 代进去积一遍，就得到那句要背一辈子的话：

$$
\boxed{U=\frac{U_m}{\sqrt2}\approx 0.707\,U_m}
$$

::: warning 为什么处处用有效值
万用表测出来的、电机铭牌上印的、配电网说的「220 V」，**全是有效值**。所以相量的模默认取有效值——这样 $P=UI\cos\varphi$ 可以直接用，不用到处除 $\sqrt2$。只有画波形图、算绝缘耐压和二极管反压时才回到幅值：220 V 市电的峰值是 $220\sqrt2=311$ V。选器件看峰值，算发热看有效值。
:::

到这里，三个数里有两个（$U_m$ 换成 $U$、$\psi$）是「每个量各不相同」的，而 $\omega$ 在同一个电路里对所有量都一样。既然频率一样，它就是公共信息，可以整页划掉。剩下的两个数——有效值和初相位——**恰好是一个复数的两个自由度**。这个巧合值得给它一个名字。

## 四、相量：把两个数装进一个复数

这一节给相量下定义，并回答一个反复被问的问题：相量到底是复数，还是旋转的矢量？

定义很短：把同频正弦量的**有效值**当模、**初相位**当幅角，写成一个复数，就得到**相量**（phasor，用复数同时表示同频正弦量的有效值与相位）：

$$
u(t)=\sqrt2\,U\sin(\omega t+\psi) \quad\Longleftrightarrow\quad \dot U = U\angle\psi
$$

字母上方那个点是全站统一的相量记号（有些书用粗体 $\mathbf U$ 或下划线 $\underline U$，含义相同）。三条读法必须记住：

- $\dot U$ 的**模是有效值**，不是峰值——这是电类学科的约定，与数学里「复数模就是幅值」的习惯不同；
- $\angle$ 后面是**初相位**，单位默认度；
- 相量**不是时间函数**，它不带 $t$。$\dot U\neq u(t)$ 永远不能画等号——它们描述的是同一个物理量的两个不同侧面。

**「旋转相量」是它的来历，不是它的定义。** 让复数 $U_m e^{j(\omega t+\psi)}$ 以角速度 $\omega$ 逆时针转，它在虚轴上的投影就是瞬时值：

$$
\mathcal{Im}\left[U_m e^{j(\omega t+\psi)}\right] = U_m\sin(\omega t+\psi)=u(t)
$$

所以相量可以理解成这个旋转矢量在 $t=0$ 时刻拍下的一张快照：模和初相位留在照片上，时间那部分被同频假设收走了。同一张相量图上并排画几个相量，它们之间的夹角就是相位差。

**为什么这样换不丢信息？** 因为线性电路里，如果所有电源同频，那么全电路各处的响应也都同频（这是线性时不变系统的性质，不是近似）。频率不用求解，KCL、KVL 又只涉及电流电压的加减，于是整个方程组在相量域里形式不变：

$$
\sum \dot I = 0, \qquad \sum \dot U = 0
$$

<CircuitFig kind="node-loop" title="KCL / KVL 在相量域里形式不变" note="结点上电流的代数和为零、回路上电压的代数和为零，这两条与直流完全一样；变的只是每个符号上面多了一个点，运算从实数变成复数。" />

这就是相量法的全部魔法：**换一套符号，解题动作和直流电路一模一样。**

<DemoBox title="旋转相量如何生成正弦波" hint="左边旋转的相量在虚轴上的投影就是右边的瞬时值。拖动相位差 φ，看电压和电流谁先到峰值——谁先到峰值谁超前。">

  <PhasorDemo />
</DemoBox>

KCL、KVL 保住了，可元件自己的伏安关系还是微积分。下一节专门处理这三种元件——处理完，整套直流方法就真的能搬过来了。

## 五、三种元件的相量关系

这一节只算三件事：$R$、$L$、$C$ 各自把 $\dot I$ 变成什么样的 $\dot U$，以及那个 90° 是从哪冒出来的。

<CircuitFig kind="rlc-series" title="R、L、C 串联：以电流相量为参考" note="串联的物理事实是「电流相同」——同一个电流依次流过三个元件。所以画相量图时把 İ 放在水平方向当参考，三个电压按各自的相位差摆在它周围，端电压是三者矢量和。" />

先看结论，推导在后面：

| 元件 | 时域关系 | 相量关系 | 相位 |
| --- | --- | --- | --- |
| $R$ | $u=Ri$ | $\dot U=R\dot I$ | 同相 |
| $L$ | $u=L\dfrac{di}{dt}$ | $\dot U=j\omega L\,\dot I$ | **电压超前 90°** |
| $C$ | $i=C\dfrac{du}{dt}$ | $\dot U=\dfrac{1}{j\omega C}\dot I=-j\dfrac{1}{\omega C}\dot I$ | **电压滞后 90°** |

电容这一行值得跟一遍推导（电感留作同样的练习）：

$$
i=C\frac{du}{dt} \;\Longrightarrow\; u=\frac{1}{C}\int i\,dt=\frac{1}{C}\int \sqrt2 I\sin(\omega t+\psi_i)\,dt
$$

$$
u=\frac{\sqrt2 I}{\omega C}\sin(\omega t+\psi_i-90^\circ)
$$

$$
\boxed{\dot U=\frac{I}{\omega C}\angle(\psi_i-90^\circ)=\frac{1}{j\omega C}\dot I}
$$

看清两件事：幅值被除掉了 $\omega C$ 倍，$1/(\omega C)$ 就是**容抗**（单位仍是 Ω）；相位退了 90°。除 $j$ 就是乘 $-j$，就是顺时针转 90°——**和「除以 $j\omega$」的代数效应完全一致**。电感那边是乘法，于是超前 90°。三个元件的差别，全部由「乘还是除、乘的是 $j\omega L$ 还是 $1/(j\omega C)$」决定。

<FigBox title="三种元件的相位关系（以电流为参考）" kind="波形" note="电阻：电压电流同相。电感：电压超前电流 90°（因为求了一次导）。电容：电压滞后电流 90°（因为积分了一次）。电感和电容的相位永远相反——这正是它们能互相抵消的原因。">

  <WavePreset kind="phasorref" />
</FigBox>

三种元件的关系都是「乘一个复数」。既然都是乘法，串联分压、并联分流、节点法这些直流里的动作就能原样搬过来。但搬之前要先过一关：**两个相量怎么相加**。

## 六、同频相加：有效值为什么不能直接加

这一节回答一个具体错误：两个 10 V 的有效值，为什么不能加成 20 V。

两个同频正弦量相加，频率不变，合成幅值由**相位差** $\varphi$ 决定：

$$
\boxed{U_m=\sqrt{U_{1m}^2+U_{2m}^2+2U_{1m}U_{2m}\cos\varphi}}
$$

这个式子的形状就是余弦定理：两个相量首尾相接，合成就等于三角形的第三边。相位差为 0 时两边拉直（相加），为 180° 时反向（相减）。

<FigBox title="相位差如何决定合成幅值" kind="曲线" note="拖动相位差：同相时合成幅值最大（2U），反相时完全抵消（0），正交（90°）时是 √2·U 而不是 2U。绿线是两条虚线的逐点代数和。">

<WavePreset kind="sinesum" :p="0.5" />
</FigBox>

三种最特殊的情况值得单独记住：

| 相位差 | 合成幅值 | 合成有效值 |
| --- | --- | --- |
| $\varphi=0$（同相） | $U_{1m}+U_{2m}$ | $U_1+U_2$ |
| $\varphi=180^\circ$（反相） | $\vert U_{1m}-U_{2m}\vert$ | $\vert U_1-U_2\vert$ |
| $\varphi=90^\circ$（正交） | $\sqrt{U_{1m}^2+U_{2m}^2}$ | $\sqrt{U_1^2+U_2^2}$ |

::: warning 最高频错误
把两个同频正弦量的**有效值直接相加**。除非同相，否则一定错。正确做法只有一条路：**各自写成相量 → 复数相加 → 取模**。比如两个有效值 10 V、相位差 90° 的电压串联，总电压有效值是 $\sqrt{10^2+10^2}=14.14$ V，不是 20 V。
:::

**相量法求合成的标准三步**：

1. 各量统一成同一种模（都用有效值，或都用幅值，**别混用**）；
2. 转成代数型 $a+jb$，实部、虚部分别相加；
3. 结果转回极坐标：模 = 幅值，幅角 = 初相位。

**相量图的画法规则**：只有同频量才能画在同一张图上；选一个**参考相量**摆在水平方向（串联选电流，并联选电压），其余相量按与它的相位差摆放；箭头长度按同一比例尺。参考相量本身可以任意选，因为只有夹角（相位差）有意义。

工具齐了。下面五道题从最简单的换写开始，一道比一道多一个动作。

## 七、例题

这一节的五道题按难度排：前两道是纯换写与相加，第三道考读图，第四道考概念，第五道落到真电路上。每题先看「先想什么」——那是方法选择，比算出数字重要。

::: tip 例 1 · 瞬时表达式 ↔ 相量（必会互换） {#ex-phasor-1}
**题目**：(a) 已知 $i(t)=10\sqrt2\sin(314t-60^\circ)$ A，写相量。(b) 已知 $\dot U=220\angle 30^\circ$ V、$f=50$ Hz，写瞬时表达式。

<FigBox title="两个方向都要会走" kind="结构" note="左边是时域，右边是相量域。注意两个方向的换算不对称：去的时候除 √2，回来的时候乘 √2，这是漏算最多的一步。">

<svg viewBox="0 0 470 180" role="img" aria-label="时域表达式与相量之间的双向换算框图：时域除以根号二取初相位得相量，相量乘根号二补回频率得瞬时表达式">
<defs>
  <marker id="ph-ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <rect x="18" y="52" width="170" height="64" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="103" y="78" text-anchor="middle">时域</text>
  <text x="103" y="98" text-anchor="middle" fill="var(--vp-c-text-3)">u(t) = √2·U·sin(ωt+ψ)</text>
  <rect x="282" y="52" width="170" height="64" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="367" y="78" text-anchor="middle">相量域</text>
  <text x="367" y="98" text-anchor="middle" fill="var(--vp-c-text-3)">U̇ = U∠ψ（模为有效值）</text>
  <line x1="190" y1="72" x2="280" y2="72" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ph-ab)" />
  <text x="235" y="64" text-anchor="middle">÷√2</text>
  <line x1="280" y1="98" x2="190" y2="98" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ph-ab)" />
  <text x="235" y="116" text-anchor="middle">×√2 并补回 ω</text>
  <text x="235" y="152" text-anchor="middle" fill="var(--vp-c-text-3)">ψ 在两个方向上都照抄，不取负、不加 90°</text>
</g>
</svg>

</FigBox>

**先想什么**：两个方向都要走，但只有一个动作容易错——模的换算。相量的模是有效值，瞬时表达式前面挂的是幅值，所以中间差的永远是那个 $\sqrt2$。相位不参与换算，直接照抄。

**步骤**：

1. （a）对照 $i=\sqrt2 I\sin(\omega t+\psi_i)$：$I_m=10\sqrt2$、$\omega=314$、$\psi_i=-60^\circ$。*（为什么先对照标准形式：只有标准形式才能一眼读出三个数，缺项时先补成标准形式。）*
2. 模取有效值：$I=10\sqrt2/\sqrt2=10$ A，角照抄，得 $\dot I=10\angle{-60^\circ}$ A。
3. （b）模已是有效值，还原时前面补 $\sqrt2$：

$$
u(t)=\sqrt2\times220\sin(2\pi\times50\,t+30^\circ)=311\sin(314t+30^\circ)\ \text{V}
$$

**验算**：把 (b) 的结果再转回相量，模 $311/\sqrt2=220$ V、角 $30^\circ$，回到 $\dot U=220\angle30^\circ$ ✓（来回一趟必须闭环，这是检查 $\sqrt2$ 有没有漏的唯一办法）。
:::

::: tip 例 2 · 同频正弦量求和（相量法标准考题） {#ex-phasor-2}
**题目**：$u_1=10\sin(\omega t+30^\circ)$ V、$u_2=10\sin(\omega t-60^\circ)$ V，求 $u=u_1+u_2$。

<FigBox title="两个相量首尾相接，合成量是对角线" kind="结构" note="虚线补出平行四边形。两量等长、夹角 90°，所以合成量落在角平分线上——相位正好是两个初相位的中间值 (−15°)，长度是 10√2。">

<svg viewBox="0 0 470 260" role="img" aria-label="相量合成图：U1 在 30 度、U2 在负 60 度，合量 14.14 在负 15 度">
<defs>
  <marker id="ph-p1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="ph-p2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <line x1="30" y1="145" x2="440" y2="145" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
  <line x1="90" y1="145" x2="159" y2="105" stroke="var(--vp-c-text-2)" stroke-width="1.8" marker-end="url(#ph-p2)" />
  <line x1="90" y1="145" x2="130" y2="214" stroke="var(--vp-c-text-2)" stroke-width="1.8" marker-end="url(#ph-p2)" />
  <line x1="90" y1="145" x2="199" y2="174" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#ph-p1)" />
  <line x1="159" y1="105" x2="199" y2="174" stroke="var(--vp-c-text-3)" stroke-width="1.1" stroke-dasharray="4 3" />
  <line x1="130" y1="214" x2="199" y2="174" stroke="var(--vp-c-text-3)" stroke-width="1.1" stroke-dasharray="4 3" />
  <text x="164" y="98">U₁ = 10∠30°</text>
  <text x="134" y="232">U₂ = 10∠−60°</text>
  <text x="206" y="184">U = 14.14∠−15°</text>
  <text x="96" y="132" fill="var(--vp-c-text-3)">30°</text>
  <text x="100" y="170" fill="var(--vp-c-text-3)">−60°</text>
  <text x="330" y="30" text-anchor="end" fill="var(--vp-c-text-3)">比例尺：8 px = 1 V</text>
</g>
</svg>

</FigBox>

**先想什么**：题给的是幅值 $10$，所以整题都用幅值做模，最后不必再除以 $\sqrt2$。两量相位差 $30^\circ-(-60^\circ)=90^\circ$，属于正交情形，合成幅值应当是 $10\sqrt2$——先有这个预期，算出来不对就知道哪一步错了。

**步骤**：

1. 写相量（用幅值做模）：$\dot U_{1m}=10\angle30^\circ=8.66+j5.00$，$\dot U_{2m}=10\angle{-60^\circ}=5.00-j8.66$。*（为什么先转代数型：只有代数型才能把实部、虚部分开相加，极坐标不能直接加。）*
2. 代数型相加：$\dot U_m=(8.66+5.00)+j(5.00-8.66)=13.66-j3.66$。
3. 转回极坐标：

$$
\vert\dot U_m\vert=\sqrt{13.66^2+3.66^2}=14.14\ \text{V}, \qquad \psi=\arctan\frac{-3.66}{13.66}=-15^\circ
$$

$$
u=14.14\sin(\omega t-15^\circ)\ \text{V}
$$

**验算**：用余弦定理独立算一遍，$U_m=\sqrt{10^2+10^2+2\times10\times10\cos90^\circ}=10\sqrt2=14.14$ ✓。再补一个常识检查：两个等长相量夹角 90°，合成量必在角平分线上，$(30^\circ-60^\circ)/2=-15^\circ$ ✓。

**如果直接加会怎样**：$10+10=20$ V，与正确答案 14.14 V 差 41%，而且相位信息全丢了。
:::

::: tip 例 3 · 从波形读三要素（工程读图题） {#ex-phasor-3}
**题目**：示波器测得某电压：波峰 100 V，周期 10 ms，$t=0$ 时 $u=50$ V 且正在上升。写瞬时表达式和相量。

<FigBox title="波形上的三个读数：峰值、周期、t=0 的值与趋势" kind="波形" note="峰值给出幅值，相邻两个峰之间给出周期；t=0 时的高度给出初相位的正弦值，上升还是下降决定取哪一个解。">

<svg viewBox="0 0 480 250" role="img" aria-label="正弦波形：峰值 100 伏，周期 10 毫秒，t 等于 0 时 u 等于 50 伏且正在上升">
<defs>
  <marker id="ph-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <line x1="34" y1="120" x2="470" y2="120" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="40" y1="210" x2="40" y2="34" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="40.0,166.8 46.0,159.9 52.0,152.4 58.0,144.4 64.0,136.0 70.0,127.3 76.0,118.5 82.0,109.8 88.0,101.2 94.0,92.9 100.0,85.0 106.0,77.7 112.0,71.0 118.0,65.1 124.0,60.1 130.0,56.1 136.0,53.0 142.0,51.0 148.0,50.1 154.0,50.2 160.0,51.5 166.0,53.9 172.0,57.3 178.0,61.7 184.0,67.0 190.0,73.2 196.0,80.1 202.0,87.6 208.0,95.6 214.0,104.0 220.0,112.7 226.0,121.5 232.0,130.2 238.0,138.8 244.0,147.1 250.0,155.0 256.0,162.3 262.0,169.0 268.0,174.9 274.0,179.9 280.0,183.9 286.0,187.0 292.0,189.0 298.0,189.9 304.0,189.8 310.0,188.5 316.0,186.1 322.0,182.7 328.0,178.3 334.0,173.0 340.0,166.8 346.0,159.9 352.0,152.4 358.0,144.4 364.0,136.0 370.0,127.3 376.0,118.5 382.0,109.8 388.0,101.2 394.0,92.9 400.0,85.0 406.0,77.7 412.0,71.0 418.0,65.1 424.0,60.1 430.0,56.1 436.0,53.0 442.0,51.0 448.0,50.1 454.0,50.2 460.0,51.5" />
  <line x1="100" y1="85" x2="100" y2="120" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <circle cx="100" cy="85" r="3" fill="var(--vp-c-brand-1)" />
  <text x="104" y="106">u(0) = 50 V ↑</text>
  <line x1="148" y1="50" x2="148" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="152" y="44">U_m = 100 V</text>
  <line x1="148" y1="218" x2="448" y2="218" stroke="var(--vp-c-text-3)" stroke-width="1" marker-start="url(#ph-t)" marker-end="url(#ph-t)" />
  <text x="298" y="236" text-anchor="middle">T = 10 ms</text>
  <text x="34" y="134" text-anchor="end" fill="var(--vp-c-text-3)">0</text>
  <text x="46" y="30" fill="var(--vp-c-text-3)">u/V</text>
  <text x="468" y="136" text-anchor="end" fill="var(--vp-c-text-3)">t</text>
</g>
</svg>

</FigBox>

**先想什么**：这类题不考计算，考的是「哪个数对应三要素中的哪一个」。峰值→幅值，两个相邻峰的间隔→周期，$t=0$ 的高度和斜率→初相位。三样取齐，答案唯一。

**步骤**：

1. 幅值 $U_m=100$ V → 有效值 $U=100/\sqrt2=70.7$ V。*（先分清楚后面写相量时要用有效值，所以这一步不能省。）*
2. $T=10$ ms → $f=1/T=100$ Hz → $\omega=2\pi f=628$ rad/s。
3. 初相位：$u(0)=100\sin\psi=50$，得 $\sin\psi=0.5$，两个解 $30^\circ$ 与 $150^\circ$；题目说正在上升，取 $30^\circ$。*（为什么另一个解不行：$150^\circ$ 附近 $\cos\psi<0$，对应下降段。）*

$$
u(t)=100\sin(628t+30^\circ)\ \text{V}, \qquad \dot U=70.7\angle30^\circ\ \text{V}
$$

**验算**：$t=0$ 代入得 $100\sin30^\circ=50$ V ✓；求导 $u^{\prime}(0)=100\omega\cos30^\circ>0$，确实是上升 ✓；峰值应出现在相位 $90^\circ$ 处，即 $t=(90^\circ-30^\circ)/360^\circ\times10=1.67$ ms，与图上第一个峰的位置对得上 ✓。
:::

::: tip 例 4 · 概念辨析（判断题高频） {#ex-phasor-4}
**题目**：判断下列说法对错并说明理由。(a) 两个正弦电压频率不同，也可以画在同一张相量图上比较相位。(b) 相量 $\dot U$ 是一个随时间旋转的矢量。(c) 相量等于瞬时值，只是写法不同。

<FigBox title="能画 / 不能画，差别只在频率是否相同" kind="结构" note="左：同频时两个相量的夹角恒等于相位差，画在纸上永远是那个角度。右：异频时相位差本身随时间变化，图上画出来的角度到下一个瞬间就作废了。">

<svg viewBox="0 0 460 200" role="img" aria-label="对比图：同频两个相量夹角固定可画，异频两个相量夹角随时间变化不可画">
<defs>
  <marker id="ph-c1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="114" y="22" text-anchor="middle" font-weight="700">同频：夹角固定，可以画</text>
  <rect x="16" y="34" width="196" height="152" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <line x1="56" y1="166" x2="156" y2="166" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ph-c1)" />
  <line x1="56" y1="166" x2="106" y2="79" stroke="var(--vp-c-text-2)" stroke-width="2" marker-end="url(#ph-c1)" />
  <path d="M 102 166 A 46 46 0 0 0 79 126.2" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
  <text x="108" y="152" fill="var(--vp-c-text-3)">φ 恒定</text>
  <text x="114" y="178" text-anchor="middle" fill="var(--vp-c-text-3)">夹角就是相位差</text>

  <text x="344" y="22" text-anchor="middle" font-weight="700">异频：夹角随时间变，不能画</text>
  <rect x="246" y="34" width="196" height="152" rx="8" fill="none" stroke="var(--vp-c-divider)" />
  <line x1="286" y1="166" x2="386" y2="166" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ph-c1)" />
  <line x1="286" y1="166" x2="336" y2="79" stroke="var(--vp-c-text-2)" stroke-width="2" marker-end="url(#ph-c1)" />
  <path d="M 332 166 A 46 46 0 0 0 309 126.2" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="340" y="152" fill="var(--vp-c-text-3)">φ(t) 在变</text>
  <text x="344" y="178" text-anchor="middle" fill="var(--vp-c-text-3)">没有固定的夹角</text>
</g>
</svg>

</FigBox>

**先想什么**：三道题问的是同一件事——相量到底「存了什么、丢了什么」。抓住一句：相量只存有效值和初相位，频率是被同频假设**外部固定**住的参数，不在相量里。所以相量一旦离开「同频」这个前提就没有意义。

**解答**：

**(a) 错。** 相量图上相量之间的夹角代表相位差，而不同频率的两个量，相位差 $\varphi(t)=(\omega_1-\omega_2)t+(\psi_1-\psi_2)$ 本身随时间变化，没有固定值可画。相量图只对同频量有意义。

**(b) 错。** 相量是**复数**——一对固定的数（模和幅角）。「旋转相量」是理解其来历的教学模型：真正随时间旋转的是 $U_me^{j\omega t}$，相量只是它 $t=0$ 时刻的快照。快照不会自己转。

**(c) 错。** 同 (b)。相量携带的是有效值 + 初相位，丢掉了「随时间变化」这部分信息——因为频率已被同频假设定死，不需要携带。所以 $\dot U\neq u(t)$，两者不是同一种东西的两种写法，而是同一个物理量的**两个不同侧面**。

**验算（反证）**：如果 (c) 成立，那么 $\dot U$ 应当能直接代入 $u=Ri$ 算出瞬时值；但 $\dot U$ 不含 $t$，代入后右边与时间无关，与「电压随时间正弦变化」矛盾 ✓。
:::

::: tip 例 5 · RLC 串联：用相量法算电流与各元件电压 {#ex-phasor-5}
**题目**：$R=6\ \Omega$ 的电感线圈（$L=44.6$ mH）与 $C=530\ \mu$F 串联，接在 $220$ V、50 Hz 的正弦电源上。求电流相量、各元件电压，并验证 KVL。

<CircuitFig kind="rlc-series" title="串联 RLC：同一电流，三个电压相量按相位差摆放" note="电源电压是三个元件电压的矢量和，不是代数和——这就是「220 V 加不出 220 V」的地方。" />

**先想什么**：这是第一次把相量法用到真电路上。方法选择很清楚——串联电路电流相同，所以**以电流为参考相量**，先算总阻抗（一个复数），再除一次就得到电流。全程只做复数乘除，不解微分方程。

**步骤**：

1. 算两个电抗（$X_L$、$X_C$ 是感抗与容抗，单位都是 Ω）：

$$
X_L=\omega L=314\times44.6\times10^{-3}=14\ \Omega, \qquad X_C=\frac{1}{\omega C}=\frac{1}{314\times530\times10^{-6}}=6\ \Omega
$$

2. 写总阻抗 $Z=R+j(X_L-X_C)=6+j(14-6)=6+j8\ \Omega$，转极坐标 $Z=10\angle53.1^\circ\ \Omega$。*（为什么电抗要相减：电感电压超前 90°、电容电压滞后 90°，两个 $j$ 方向相反，在复平面上互相抵消一部分。）*
3. 设电源电压为参考相量 $\dot U=220\angle0^\circ$ V，则

$$
\dot I=\frac{\dot U}{Z}=\frac{220\angle0^\circ}{10\angle53.1^\circ}=22\angle{-53.1^\circ}\ \text{A}
$$

4. 各元件电压（同一个 $\dot I$ 分别乘三种阻抗）：

$$
\dot U_R=R\dot I=6\times22\angle{-53.1^\circ}=132\angle{-53.1^\circ}\ \text{V}
$$

$$
\dot U_L=jX_L\dot I=14\angle90^\circ\times22\angle{-53.1^\circ}=308\angle36.9^\circ\ \text{V}
$$

$$
\dot U_C=-jX_C\dot I=6\angle{-90^\circ}\times22\angle{-53.1^\circ}=132\angle{-143.1^\circ}\ \text{V}
$$

**验算（KVL 相量相加）**：$132\angle{-53.1^\circ}+308\angle36.9^\circ+132\angle{-143.1^\circ}$。先把三个都写成代数型：$79.2-j105.6$、$246.4+j184.8$、$-105.6-j79.2$，实部 $79.2+246.4-105.6=220.0$，虚部 $-105.6+184.8-79.2=0$，得 $220+j0$，正好等于电源电压 ✓。几何上更好看：$\sqrt{132^2+(308-132)^2}=\sqrt{17424+30976}=220$ V ✓。

**注意两个反直觉结果**：电流滞后电压 $53.1^\circ$（感性），而 $U_L=308$ V 比电源电压 220 V 还大——串联谐振附近这很常见，所以电感、电容的耐压要单独考核，不能按电源电压选。
:::

五道题走完，相量法的动作已经齐了：换写、相加、读图、辨析、上电路。下面把这些动作放回真实场合——它们决定的是仪表怎么读、器件怎么选、发电机怎么并网。

## 工程实例

- **仪表读数**：交流电压表、电流表读的都是有效值。测 220 V 单相电机时，$U=220$ V 是有效值，绝缘和耐压要按峰值 311 V 考核。
- **电网频率**：中国电网 $f=50$ Hz，$\omega=314$ rad/s，$T=20$ ms。这个数字后面每一章都会反复出现，建议形成条件反射：看到 314 就想到 50 Hz。
- **示波器测相位**：双通道示波器是唯一能直接看到 $\psi$ 的仪器——数格数 × 每格时间 × 360° = 相位差。相量法算出的相位最终要靠它验证。
- **并网条件**：两台发电机并列运行要求电压幅值、频率、相位三个都对齐——本质就是要求两个相量重合。相位差不为零时，两台机之间会通过很小的回路阻抗产生巨大环流，这是并网必须用同步表而不能靠眼睛的原因。
- **音频频段**：人耳 20 Hz – 20 kHz，对应角频率 125 – 125660 rad/s。同一个电容在 20 Hz 与 20 kHz 下的容抗差 1000 倍——这就是分频器能工作的原因。

## 易错清单（按踩坑频率排序）

1. **把两个有效值直接相加** → 得到 20 V，真值 14.14 V，差 41% → 各自写成相量、复数相加、再取模。
2. **相量与瞬时值互换时漏掉 $\sqrt2$** → 结果差 1.414 倍，且量纲看着都对，很难发现 → 记住「去时除 $\sqrt2$、回来乘 $\sqrt2$」，并做一次来回验算。
3. **把 $j$ 当成电流** → 式子读不通，后续所有相位推理失效 → $j$ 是虚数单位，$j^2=-1$，乘 $j$ 即逆时针 90°；电流写 $i$ 或 $\dot I$。
4. **不同频率的量画在同一张相量图上** → 得到一张自相矛盾的图 → 相量图只对同频量成立。
5. **加减法直接用极坐标的模** → 相位丢失、模也不对 → 加减先转代数型，乘除才用极坐标。
6. **$\arctan$ 不分象限** → 实部为负时幅角差 $180^\circ$，超前滞后整体说反 → 先看实部符号，再决定加不加 $180^\circ$。
7. **把相量当成时间函数** → 认为 $\dot U=u(t)$，代入时域公式 → 相量不含 $t$，只是 $t=0$ 的快照。
8. **电感电压超前、电容电压滞后说反** → 后面阻抗三角形、功率因数、谐振全部反向 → 记「电感 $L$ 在前，电压超前」，用 $j\omega L$ 里的 $+j$ 提醒自己。

## 自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. 为什么电类学科用 $j$ 而不用 $i$？$1/j$ 等于多少，几何上是什么意思？
2. 一个有效值 10 V、初相位 $-30^\circ$ 的电压，它的幅值是多少？写成相量是什么？再还原成瞬时表达式是什么？
3. 两个有效值都是 10 V 的电压串联，什么情况下总电压是 20 V，什么情况下是 14.14 V，什么情况下是 0 V？

## 下一步

这页把「怎么表示」解决了，但阻抗 $Z$ 还只是一个符号 $R+jX$，没有解释它在图上长什么样、串联并联怎么算。

<Prereq id="impedance" /> → [09 · RLC 串联与阻抗](./rlc.md)
