---
title: 14 · 三相功率与测量
description: 三相功率为什么等于 3 倍单相、为什么两种接法最后都化成 √3U_lI_lcosφ、两个 φ 的区别、二瓦计法的接线与读数推导、一块表为什么会反偏，配四道带图例题。
---

# 14 · 三相功率与测量

<Meta time="35 min" level="核心" note="一个公式加一种测量方法就够用，但细节全在丢分：φ 取错对象、读数取绝对值、四线制误用两表法" />

**这一页要解决什么**：上一页算清了电压电流怎么分配，但功率还没算。这一页回答三个具体问题：为什么三相功率的公式里是 $\sqrt3$ 而不是 3、为什么 Y 接和 △ 接算出来的公式居然一模一样、以及配电室里那两块功率表凭什么只用两块就能测出三相的总功率。读完你应该能读懂电机铭牌算出输入功率与效率、能用两块表的读数反推功率因数、并且知道什么时候必须换成三块表。

::: tip 读这页之前
- **需要会**：单相的有功、无功、视在与功率因数（<Prereq id="power" />、<Prereq id="power-factor" />）；三相的线量与相量关系、Y 接 $U_l=\sqrt3U_p$、△ 接 $I_l=\sqrt3I_p$（<Prereq id="three-phase-source" />）。这一页不引入新定律。
- **这一页用到的符号**：$U_p$、$I_p$ 相电压与相电流（每相绕组自己的量）；$U_l$、$I_l$ 线电压与线电流（火线之间、火线上的量）；$P$、$Q$、$S$ 有功（W）、无功（var）、视在（VA）；$\varphi$ 相电压与相电流的夹角（也就是每相负载的阻抗角）；$W_A$、$W_C$ 两块功率表的读数（单位 W，两位数的读取习惯见第四节）。全部约定见[符号与约定](../../guide/notation.md)。
- **需要的数学**：三角恒等式 $\cos(A+B)+\cos(A-B)=2\cos A\cos B$、$\sin^2$ 的平均值、$\sqrt3\approx1.732$。不用微积分。
- **一个数先记住**：$\sqrt3\times380=658$。后文所有「380 V 系统的电流估算」都用它。
:::

配电室里有一面墙的仪表。三相电机的大电流回路只引出三根火线（没有中性线），可柜门上只有**两块**功率表。你可能会想：三相不是三份吗，两块表怎么够？

答案有点反直觉：第三相的功率信息并不需要单独测——它被 KCL 锁死了（$\dot I_B=-(\dot I_A+\dot I_C)$）。两块表各读一个「电压乘电流再乘夹角余弦」，加起来正好是三相总有功。这一页把这个「正好」算给你看，并且说清为什么某一天其中一块表会指到零以下还理直气壮。

## 结论先行

1. 对称三相总有功 $P=3U_pI_p\cos\varphi=\sqrt3\,U_lI_l\cos\varphi$，而且 **Y 接与 △ 接的形式完全相同**。
2. 公式里的 $\varphi$ 是**相电压与相电流**的夹角（每相负载的阻抗角），不是线电压与线电流的夹角——后者是 $\varphi+30^\circ$。
3. 无功与视在同形：$Q=\sqrt3U_lI_l\sin\varphi$、$S=\sqrt3U_lI_l$，且 $S^2=P^2+Q^2$。
4. 测量：**两表法**用于三相三线制（最常用），**三表法**用于三相四线制；四线制不对称负载不能用两表法。
5. 两表读数是**代数和**；$\cos\varphi<0.5$ 时必有一表为负，那不是表坏，读数要带符号代入。

::: tip 规律层：一个公式管两种接法
Y 接把电压除 $\sqrt3$、电流不变；△ 接把电流除 $\sqrt3$、电压不变——一个乘在电压上、一个乘在电流上，$3\times\frac{1}{\sqrt3}$ 殊途同归，都化成 $\sqrt3$。所以只记 $P=\sqrt3U_lI_l\cos\varphi$ 一个式子就够，接法只影响你「求相量」那一步。
:::

## 一、三个相各贡献一份，为什么系数是 3/2 又变成 3

这一节只回答一个问题：三相功率的推导里为什么先出现 $\frac32$，最后又变成 3。

先看单相。$u=\sqrt2U\sin\omega t$、$i=\sqrt2I\sin(\omega t-\varphi)$，则

$$
p=ui=2UI\sin\omega t\sin(\omega t-\varphi)=UI\cos\varphi-UI\cos(2\omega t-\varphi)
$$

用**幅值**（峰值）写就更清楚：$u=U_m\sin\omega t$、$i=I_m\sin(\omega t-\varphi)$，则

$$
p=\frac{U_mI_m}{2}\big[\cos\varphi-\cos(2\omega t-\varphi)\big]
$$

那个 $\frac12$ 是「两个正弦相乘、平均后只保留一半」的结果——它就是 $\frac32$ 里那个 2 的来历。

三相各自错开 $120^\circ$，把三份瞬时功率加起来：

$$
p=p_A+p_B+p_C=\frac32U_mI_m\cos\varphi-\frac{U_mI_m}{2}\Big[\cos(2\omega t-\varphi)+\cos(2\omega t-\varphi-240^\circ)+\cos(2\omega t-\varphi+240^\circ)\Big]
$$

方括号里是三个等幅、互差 $120^\circ$ 的余弦之和，恒为零（和第二节「三根火线之和为零」是同一个事实）。于是

$$
\boxed{p(t)=\frac32U_mI_m\cos\varphi=\text{常量}}
$$

换成有效值（$U_m=\sqrt2U_p$、$I_m=\sqrt2I_p$），$\frac32\times\sqrt2\times\sqrt2=3$：

$$
\boxed{P=3U_pI_p\cos\varphi}
$$

**瞬时功率等于平均功率**——因为它根本不脉动。这不是「更平稳一点」，而是数学上完全平直，也是三相电机转矩恒定的根源。

<FigBox title="从 3/2 到 3 再到 √3：一次换算的三步" kind="结构" note="第①步用幅值写，系数是 3/2；第②步换成有效值，系数变 3（因为 √2×√2=2）；第③步再换成线量，3/√3 收成 √3。每一步只改「用哪套量」，物理内容一点没变——这就是三相功率公式看着复杂、其实只有一条的原因。">

<svg viewBox="0 0 470 168" role="img" aria-label="三步换算链：幅值形式的二分之三，换成有效值得到 3 倍相量乘积，再换成线量得到根号三倍">
<defs>
  <marker id="tq-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="6" y="44" width="136" height="64" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="74" y="66" text-anchor="middle">① 幅值形式</text>
  <text x="74" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">p = 1.5·U_m·I_m·cosφ</text>
  <text x="74" y="100" text-anchor="middle" fill="var(--vp-c-text-3)">常数项，无脉动</text>
  <line x1="146" y1="76" x2="176" y2="76" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#tq-a)" />
  <rect x="180" y="44" width="126" height="64" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="243" y="66" text-anchor="middle">② 换有效值</text>
  <text x="243" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">P = 3·U_p·I_p·cosφ</text>
  <text x="243" y="100" text-anchor="middle" fill="var(--vp-c-text-3)">√2×√2 = 2，3/2 → 3</text>
  <line x1="310" y1="76" x2="340" y2="76" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#tq-a)" />
  <rect x="344" y="44" width="120" height="64" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="404" y="66" text-anchor="middle">③ 换线量</text>
  <text x="404" y="86" text-anchor="middle" fill="var(--vp-c-text-3)">P = √3·U_l·I_l·cosφ</text>
  <text x="404" y="100" text-anchor="middle" fill="var(--vp-c-text-3)">3/√3 = √3</text>
  <text x="235" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">三步只换「用哪套量」，物理内容不变；现场读铭牌只需要第③步</text>
</g>
</svg>

</FigBox>

::: tip 顺带记住一个副产品
三相机器的「利用率」比单相高：同样体积的铁芯与绕组，三相输出是 $3U_pI_p$ 而不是 $U I$，这也是输电采用三相的数学根源之一（见[13 · 三相电路](./circuit.md)第一节）。
:::

$\frac32$ 的来源清楚了，但现场更愿意用线量直接算。下一节把两种接法都推一遍，看它们为什么殊途同归。

## 二、统一成线电压线电流：两种接法殊途同归

这一节只回答一个问题：为什么 Y 接和 △ 接的功率公式长得一模一样。

线量是钳形表和万用表实际能读到的量（相量藏在绕组里、夹不到），所以工程上一定要换成线量。

**Y 接**：相电压比线电压小 $\sqrt3$ 倍，相电流就是线电流。

$$
P=3\cdot\frac{U_l}{\sqrt3}\cdot I_l\cos\varphi=\sqrt3\,U_lI_l\cos\varphi
$$

**△ 接**：相电压等于线电压，相电流比线电流小 $\sqrt3$ 倍。

$$
P=3\cdot U_l\cdot\frac{I_l}{\sqrt3}\cos\varphi=\sqrt3\,U_lI_l\cos\varphi
$$

两条路径在同一个式子上会合。无功与视在同理：

$$
Q=3U_pI_p\sin\varphi=\sqrt3\,U_lI_l\sin\varphi,\qquad S=3U_pI_p=\sqrt3\,U_lI_l
$$

而且 $S^2=P^2+Q^2$ 照旧成立——它只是把单相的功率三角形放大了 3 倍，形状没变。

公式统一了，但里面那个 $\varphi$ 到底是谁与谁的夹角？这是本章丢分最多的地方。

## 三、那个 φ 是谁与谁的夹角

这一节只回答一个问题：给定「线电压与线电流的相位差」，能不能直接代进公式。

不能。**公式里的 $\varphi$ 是相电压与相电流的夹角，也就是每相负载的阻抗角**；而线电压与线电流的夹角要比它大 $30^\circ$。原因是上一页推出来的那两处 $30^\circ$：

| 接法 | 线电压相对相电压 | 线电流相对相电流 | 线电压与线电流的夹角 |
| --- | --- | --- | --- |
| Y 接 | 超前 $30^\circ$ | 相同 | $\varphi+30^\circ$ |
| △ 接 | 相同 | 滞后 $30^\circ$ | $\varphi+30^\circ$ |

两种接法居然都得 $\varphi+30^\circ$——这不是巧合：$\sqrt3$ 倍的关系必然伴随 $30^\circ$ 的旋转，而旋转方向在电压侧和电流侧正好相反。记住这一点，第四节的两表法公式就不用背了。

::: warning 这一条最容易被教错
常见说法是「线电压与线电流的夹角就是 $\varphi$，所以 $P=\sqrt3U_lI_l\cos\theta$ 里的 $\theta$ 随便用」。**错。** 若把线量夹角 $\theta=\varphi+30^\circ$ 代进去，$\cos(\varphi+30^\circ)$ 与 $\cos\varphi$ 差得远（$\varphi=0$ 时差 13%，$\varphi=30^\circ$ 时差 100%）。判断办法只有一条：**先问这个夹角是在哪两个量之间量的**——量在相上就是 $\varphi$，量在线对上就要先减 $30^\circ$。
:::

$\varphi$ 的身份定下来了，可它藏在绕组里量不到。下一节解决这个工程难题：只用两块表，怎么把总功率和 $\varphi$ 一起测出来。

## 四、两表法（二瓦计法）

这一节只回答一个问题：三线制只有三根火线，两块表凭什么能测全三相功率。

**适用场合**：三相三线制（没有中性线），对称或不对称负载都行。
**接法**：两块表的**电流线圈**分别串入 A、C 两根火线；两块表的**电压线圈**一端接各自火线、另一端**都接到第三条火线 B**。

<FigBox title="两表法的接线：电流线圈串在 A、C，电压线圈共接 B" kind="电路" note="关键在电压线圈的公共端接 B——两块表测的电压分别是 U_AB 与 U_CB，而 B 相电流不需要单独测（它由 KCL 被另外两条锁死）。接线时最常犯的错是把两个电压线圈都接到中性线或都接到 A，那样读数就没有意义了。">

<svg viewBox="0 0 470 240" role="img" aria-label="两表法接线框图：两块功率表的电流线圈分别串在 A、C 相，W_A 的电压端接 A 与 B，W_C 的电压端接 C 与 B">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="16" y="34" width="62" height="140" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="47" y="98" text-anchor="middle">三相</text>
  <text x="47" y="116" text-anchor="middle">电源</text>
  <line x1="78" y1="44" x2="392" y2="44" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="78" y1="104" x2="392" y2="104" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="78" y1="164" x2="392" y2="164" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <text x="72" y="48" text-anchor="end" font-weight="700">A</text>
  <text x="72" y="108" text-anchor="end" font-weight="700">B</text>
  <text x="72" y="168" text-anchor="end" font-weight="700">C</text>
  <rect x="108" y="36" width="48" height="16" rx="2" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="132" y="28" text-anchor="middle" fill="var(--vp-c-brand-1)">电流线圈</text>
  <rect x="108" y="156" width="48" height="16" rx="2" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="132" y="190" text-anchor="middle" fill="var(--vp-c-brand-1)">电流线圈</text>
  <rect x="392" y="34" width="62" height="140" rx="8" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <text x="423" y="98" text-anchor="middle">负载</text>
  <text x="423" y="116" text-anchor="middle" fill="var(--vp-c-text-3)">三相</text>
  <rect x="200" y="56" width="122" height="34" rx="6" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <text x="261" y="71" text-anchor="middle">W_A</text>
  <text x="261" y="85" text-anchor="middle" fill="var(--vp-c-text-3)">电压端：A 与 B</text>
  <line x1="212" y1="44" x2="212" y2="56" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="308" y1="90" x2="308" y2="104" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <rect x="200" y="118" width="122" height="34" rx="6" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.5" />
  <text x="261" y="133" text-anchor="middle">W_C</text>
  <text x="261" y="147" text-anchor="middle" fill="var(--vp-c-text-3)">电压端：C 与 B</text>
  <line x1="308" y1="104" x2="308" y2="118" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <line x1="212" y1="152" x2="212" y2="164" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <text x="235" y="212" text-anchor="middle" fill="var(--vp-c-text-3)">W_A 测 U_AB 与 I_A　　W_C 测 U_CB 与 I_C　　P = W_A + W_C</text>
  <text x="235" y="232" text-anchor="middle" fill="var(--vp-c-text-3)">B 相不串电流线圈：它的电流由 KCL 决定，信息已被另外两相带出</text>
</g>
</svg>

</FigBox>

两块表各自读到的功率：

$$
W_A=U_lI_l\cos(\varphi+30^\circ),\qquad W_C=U_lI_l\cos(\varphi-30^\circ)
$$

注意这两个角：第三节刚说过，线电压与线电流的夹角是 $\varphi+30^\circ$——$W_A$ 量的正是它；而 $W_C$ 量的是 $U_{CB}$ 与 $I_C$ 的夹角，$U_{CB}$ 比 $U_C$ 滞后 $30^\circ$，所以夹角变成 $\varphi-30^\circ$。

两数相加，用积化和差 $\cos(A+B)+\cos(A-B)=2\cos A\cos B$：

$$
W_A+W_C=U_lI_l\cdot2\cos30^\circ\cos\varphi=\sqrt3\,U_lI_l\cos\varphi=P\ ✓
$$

**为什么两块表就够了**：三相总功率是三个「电压乘电流乘夹角」之和，但三根线的电流受 KCL 约束（$\dot I_A+\dot I_B+\dot I_C=0$），独立信息只有两份。两块表正好取两份独立信息，第三份自动包含在内。

<FigBox title="两表读数随负载阻抗角变化" kind="曲线" note="横轴是 φ。φ 小时两表都为正且读数接近（纯阻时相等）；φ 到 60°（cosφ = 0.5）时 W_A 正好过零，再往感性走就翻负。W_C 要等到 φ = 120° 才过零，常规负载到不了。绿线是两表之和，正好是 √3cosφ。">

<WavePreset kind="twowatt" />

</FigBox>

::: danger 读到负值怎么办（不是表坏了）
负载功率因数很低（$\cos\varphi<0.5$，例如空载变压器、轻载电机）时，$W_A$ 必然为负。处理办法：把那只表的电流线圈两个端钮对调（或扳极性开关），让它正偏，然后**按负值代入** $P=W_A+W_C$。若图省事取绝对值相加，总功率会明显偏大。
:::

由两块表的读数还能反推功率因数。把两式相减：

$$
W_C-W_A=U_lI_l\big[\cos(\varphi-30^\circ)-\cos(\varphi+30^\circ)\big]=U_lI_l\sin\varphi\cdot\sqrt3
$$

而 $W_A+W_C=\sqrt3U_lI_l\cos\varphi$，两式相除：

$$
\boxed{\tan\varphi=\sqrt3\,\frac{W_C-W_A}{W_A+W_C}}
$$

分母是两表代数和，分子是差值——**读数大的减小的**（本节按感性负载写，此时 $W_C>W_A$；若 $W_A$ 更大，说明负载呈容性，$\varphi$ 取负）。

两表法要求三根线、没有第四根。有四根线时该怎么办，是下一节的事。

## 五、三表法：四线制的标准做法

这一节只回答一个问题：为什么有中性线时两表法会失效。

三相四线制（有中性线）且负载不对称时，每相接一块表，电流线圈串在该相火线、电压线圈接该相与中性线之间：

$$
P=W_A+W_B+W_C
$$

**两表法为什么在这里不行**：两表法只用两条火线的电流，默认第三条的电流「由 KCL 补齐」。但四线制里中性线也有电流 $\dot I_N\neq0$，四个电流才满足 KCL，第三条不再由前两条决定——漏掉的那部分功率没有人测。

::: warning 两表法 vs 三表法的分界线
| 对比项 | 两表法 | 三表法 |
| --- | --- | --- |
| 适用接线 | 三相三线制（无中性线） | 三相四线制（有中性线） |
| 表数 | 2 | 3 |
| 对称负载 | 可以 | 可以 |
| 不对称负载 | 可以 | 可以 |
| 四线制不对称 | **不行** | 必须用 |

一句话记：**有中性线电流，就必须每相单独测。**
:::

测法与公式都齐了，剩下把数字代进去。

## 六、例题

四道题按使用场景排：例 1 读铭牌（最常考），例 2 两表读数求功率因数，例 3 一表翻负，例 4 反求电流（配电第一步）。

:::: tip 例 1 · 读铭牌（最常见的题型） {#ex-tp3-1}
**题目**：一台三相异步电动机铭牌：$P_N=5.5$ kW、$U_N=380$ V、$I_N=11.6$ A、$n_N=1440$ r/min、$\cos\varphi_N=0.84$。求额定输入功率与效率。

**先想什么**：铭牌上五个数分属两类，先分类再动笔——$U_N$、$I_N$、$\cos\varphi_N$ 是**输入侧**的量（线电压、线电流），$P_N$ 是**输出侧**的轴上机械功率。要求输入功率，直接用输入侧那三个数；要求效率，才把两者相除。

<FigBox title="铭牌上的功率流：输入 → 损耗 → 输出" kind="结构" note="输入 6.41 kW 来自三个线量相乘，输出 5.5 kW 是轴上能带动的机械功率，中间 0.91 kW 变成铜损、铁损、机械损耗与风摩损。铭牌写的是输出，公式算的是输入——两者之间隔着效率，这是铭牌题唯一的陷阱。">

<svg viewBox="0 0 470 170" role="img" aria-label="功率流图：输入功率 6.41 千瓦，损耗 0.91 千瓦，输出功率 5.5 千瓦">
<defs>
  <marker id="tq-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="10" y="52" width="118" height="56" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="69" y="74" text-anchor="middle">输入 P₁</text>
  <text x="69" y="94" text-anchor="middle" fill="var(--vp-c-text-3)">6.41 kW（算出来）</text>
  <line x1="132" y1="80" x2="176" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#tq-b)" />
  <rect x="180" y="52" width="110" height="56" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.5" stroke-dasharray="5 3" />
  <text x="235" y="74" text-anchor="middle">损耗 ΔP</text>
  <text x="235" y="94" text-anchor="middle" fill="var(--vp-c-text-3)">0.91 kW（14.2%）</text>
  <line x1="294" y1="80" x2="338" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#tq-b)" />
  <rect x="342" y="52" width="118" height="56" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="401" y="74" text-anchor="middle">输出 P_N</text>
  <text x="401" y="94" text-anchor="middle" fill="var(--vp-c-text-3)">5.5 kW（铭牌）</text>
  <text x="235" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">效率 η = 输出 / 输入 = 5.5 / 6.41 = 85.8%</text>
</g>
</svg>

</FigBox>

**步骤**：

1. 输入功率（用**线**电压、**线**电流）：

$$
P_{1N}=\sqrt3\,U_NI_N\cos\varphi_N=\sqrt3\times380\times11.6\times0.84=6.41\ \text{kW}
$$

2. 效率（铭牌功率是轴上输出）：

$$
\eta_N=\frac{P_N}{P_{1N}}=\frac{5.5}{6.41}=85.8\%
$$

3. 顺带读两个转速信息：同步转速 $n_0=\dfrac{60f}{p}=\dfrac{60\times50}{2}=1500$ r/min（极对数 $p=2$ 由 1440 反推）；**转差率**（slip，转子实际转速比同步转速慢的那一点比例）$s=\dfrac{n_0-n}{n_0}=\dfrac{1500-1440}{1500}=0.04$。

**验算**：效率落在这个功率等级的常见区间（中小型异步电机 80%~92%）✓。若把 5.5 kW 当成输入去反求 $\cos\varphi$，会得 $0.72$，与铭牌 0.84 差一大截——这正说明铭牌功率不是输入。

::: warning 本题的三个陷阱
铭牌 $P_N$ 是**输出**机械功率；$U_N$、$I_N$ 是**线**电压、线电流；$\cos\varphi_N$ 是**相**电压与相电流的夹角。三件事必须同时用对，公式才不会错。
:::
::::

:::: tip 例 2 · 两表读数求总功率与功率因数 {#ex-tp3-2}
**题目**：三相三线制，两块表读数 $W_A=1200$ W、$W_C=600$ W。求总有功功率、无功功率与功率因数。

**先想什么**：两表法只有两条规则——总功率取**代数和**，功率因数用**差值除以和**。但动手前先看一眼哪个读数大：感性负载必然是 $W_C>W_A$，本题 $W_A>W_C$，说明负载呈**容性**（$\varphi$ 为负）。这个判断决定了无功的符号。

<FigBox title="两表读数合成三个量" kind="结构" note="两个读数先做和与差：和给出总有功（1800 W），差给出 tanφ 的分子。这里 W_A > W_C，所以 tanφ 为负、负载容性——同一个 tanφ 的绝对值对应两个相位，符号只能靠读数大小判断。">

<svg viewBox="0 0 470 190" role="img" aria-label="结构图：两表读数相加得有功功率，相减得功率因数角的正切，再得无功功率">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="34" fill="var(--vp-c-brand-1)">已知两块表的读数：W_A = 1200 W　　W_C = 600 W</text>
  <line x1="24" y1="48" x2="446" y2="48" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="24" y="72">① 和 = W_A + W_C = 1800 W　→　总有功 P = 1800 W</text>
  <text x="24" y="96">② 差 = W_C − W_A = −600 W　→　tanφ 的分子</text>
  <text x="24" y="120">③ tanφ = √3 × 差 ÷ 和 = −0.577　→　φ = −30°（负号即容性）</text>
  <text x="24" y="144">④ cosφ = cos(−30°) = 0.866　　Q = P·tanφ = −1039 var</text>
  <text x="24" y="172" fill="var(--vp-c-text-3)">注意 ② 的符号：W_A 比 W_C 大，所以差为负、负载呈容性；若负载是感性的，两只表的读数会互换。</text>
</g>
</svg>

</FigBox>

**步骤**：

1. 总有功（两表都为正，直接相加）：

$$
P=W_A+W_C=1200+600=1800\ \text{W}
$$

2. 功率因数角：

$$
\tan\varphi=\sqrt3\,\frac{W_C-W_A}{P}=\sqrt3\times\frac{-600}{1800}=-0.577
$$

$$
\varphi=-30^\circ,\qquad \cos\varphi=0.866
$$

3. 无功功率：

$$
Q=P\tan\varphi=1800\times(-0.577)=-1039\ \text{var}
$$

**验算**：

- 用 $\sqrt3U_lI_l$ 反查容量：$S=\sqrt{1800^2+1039^2}=2078$ VA，而 $2078/\sqrt3=1200=U_lI_l$；且 $\sqrt3\times1200\times0.866=1800$ ✓
- 用读数定义反查：$U_lI_l=1200$，则 $W_A=1200\cos(-30^\circ+30^\circ)=1200$ ✓、$W_C=1200\cos(-30^\circ-30^\circ)=600$ ✓，与题给完全吻合

::: tip 两表读数的信息量
两块表不仅给出 $P$，还定出了 $\cos\varphi$——现场没有功率因数表时，两块功率表就够。三种特殊情形很好记：$W_A=W_C$ 时 $\varphi=0$（纯阻）；$W_A=0$ 时 $\varphi=60^\circ$（$\cos\varphi=0.5$）；$W_A=-W_C$ 时 $\varphi=90^\circ$（纯电抗）。
:::
::::

:::: tip 例 3 · 一表翻负（低功率因数负载） {#ex-tp3-3}
**题目**：同一电路，负载变成 $\cos\varphi=0.4$。设 $U_lI_l=1000$ VA，求两块表的读数。

**先想什么**：$\cos\varphi=0.4$ 对应 $\varphi=66.4^\circ>60^\circ$，按第四节的曲线，$W_A$ 一定为负。先把预期说出来（「会有一块表反偏」），再算数字——这样算出来是负数时不会怀疑自己算错。

<FigBox title="低功率因数时两块表的表盘" kind="结构" note="左表指针指到零刻度左侧（读数约 −112 W），右表正常（约 805 W）。真实仪表要把左表的电流线圈反接才能读出正值刻度，但记数时必须按负值写——表可以反接，符号不能改。">

<svg viewBox="0 0 470 190" role="img" aria-label="两个功率表表盘：左表指针偏到零的左侧，右表指针在正刻度区">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <circle cx="110" cy="100" r="52" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <path d="M 110 100 L 78 62" stroke="var(--vp-c-danger-1, #e5484d)" stroke-width="2.4" />
  <line x1="110" y1="56" x2="110" y2="66" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="66" y1="100" x2="76" y2="100" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="154" y1="100" x2="144" y2="100" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="110" y="126" text-anchor="middle" fill="var(--vp-c-text-3)">W_A</text>
  <text x="62" y="96" text-anchor="end" fill="var(--vp-c-text-3)">−</text>
  <text x="158" y="96" text-anchor="start" fill="var(--vp-c-text-3)">+</text>
  <text x="110" y="172" text-anchor="middle" fill="var(--vp-c-danger-1, #e5484d)">读数 −112 W</text>
  <circle cx="330" cy="100" r="52" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
  <path d="M 330 100 L 366 66" stroke="var(--vp-c-brand-1)" stroke-width="2.4" />
  <line x1="330" y1="56" x2="330" y2="66" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="286" y1="100" x2="296" y2="100" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <line x1="374" y1="100" x2="364" y2="100" stroke="var(--vp-c-text-3)" stroke-width="1.4" />
  <text x="330" y="126" text-anchor="middle" fill="var(--vp-c-text-3)">W_C</text>
  <text x="330" y="172" text-anchor="middle" fill="var(--vp-c-brand-1)">读数 +805 W</text>
  <text x="235" y="186" text-anchor="middle" fill="var(--vp-c-text-3)">代数和 693 W，正好等于 √3·U_lI_l·cosφ</text>
</g>
</svg>

</FigBox>

**步骤**：

1. 求阻抗角：$\varphi=\arccos0.4=66.4^\circ$。

2. 两块表的读数：

$$
W_A=1000\times\cos(66.4^\circ+30^\circ)=1000\times\cos96.4^\circ=-112\ \text{W}
$$

$$
W_C=1000\times\cos(66.4^\circ-30^\circ)=1000\times\cos36.4^\circ=805\ \text{W}
$$

3. 总功率（代数和）：

$$
P=W_A+W_C=-112+805=693\ \text{W}
$$

**验算**：用总公式独立算一遍，$\sqrt3\times1000\times0.4=693$ W ✓。若误取绝对值相加（112+805=917 W），与真值差 32%——这就是为什么符号不能改。

::: danger 本例的操作要点
$W_A$ 是负的。实际接线时要把 $W_A$ 的电流线圈反接（否则指针反偏，模拟表可能打坏），然后**按 −112 W 代入求和**。表可以反接，符号不能改。
:::
::::

:::: tip 例 4 · 反问题：已知功率求电流 {#ex-tp3-4}
**题目**：某三相负载 $P=30$ kW、$U_l=380$ V、$\cos\varphi=0.75$。求线电流。

**先想什么**：这是选导线、选开关、选接触器的第一步。所有配电计算都从「电流」出发，而现场最容易给的是功率，所以这个反求必须练熟。

**步骤**：

$$
I_l=\frac{P}{\sqrt3\,U_l\cos\varphi}=\frac{30000}{\sqrt3\times380\times0.75}=60.8\ \text{A}
$$

**验算**：回代 $P=\sqrt3\times380\times60.8\times0.75=30.0$ kW ✓。

::: tip 一个现场估算技巧
380 V 系统里 $\sqrt3\times380\approx658$，所以 $I_l\approx\dfrac{P(\text{kW})\times1000}{658\cos\varphi}$。$\cos\varphi=0.8$ 时**每千瓦约 1.9 A**——估电缆、估开关够用了。
:::
::::

四道题覆盖了铭牌、两表、翻负、反求四种场合。最后看这些结论在工程里各自落在哪。

## 七、工程实例

**为什么供电局考核功率因数？** 从 $I_l=\dfrac{P}{\sqrt3U_l\cos\varphi}$ 看，$\cos\varphi$ 越低，送同样的有功需要的电流越大，线路损耗 $I^2R$ 按平方涨。$\cos\varphi=0.5$ 时的线损是 $\cos\varphi=1$ 时的 **4 倍**——这部分损耗由供电部门承担，所以要考核、要罚款（详见[10 · 功率与功率因数](../04-ac/power.md)）。

**一块表能不能测三相功率？** 能，但只在**严格对称**时：只测一相再乘 3（叫一表法）。现场负载几乎不可能严格对称，所以三线制用两表法、四线制用三表法。

**配电柜上的三块电流表与一块电压表**：电压表通过转换开关轮流显示三个线电压，电流表各看一相——读数偏差超过 10% 就说明三相不平衡，要查负载分配。

**电费单上的 kVA 与 kW**：大工业用户按**最大需量**（kVA）计费，这正是因为变压器的容量是视在功率。功率因数低，同一台变压器能卖出的 kW 就少（见[10 · 功率与功率因数](../04-ac/power.md)例 3）。

上面几件事的共同点：三相功率永远能化成「√3 × 线量 × 线量 × cosφ」，难点全在选对量、取对符号。下面把错法排一遍。

## 八、易错清单（按踩坑频率排序）

按踩坑频率从高到低排，每条格式是「错误做法 → 会得到什么 → 正确做法」。

1. **$\varphi$ 用成线量与线量的夹角** → $\cos(\varphi+30^\circ)$ 代进 cosφ，$\varphi=0$ 时功率差 13%、$\varphi=30^\circ$ 时差一倍 → $\varphi$ 是相电压与相电流的夹角。
2. **两表读数取绝对值相加** → $\cos\varphi<0.5$ 时总功率偏大（例 3 会得 917 W 而非 693 W）→ 代数和，负号必须保留。
3. **四线制不对称用两表法** → 漏掉中性线电流那部分功率 → 换成三表法。
4. **$\tan\varphi$ 公式里大减小写反** → 结果符号错、误判容性/感性 → 分子写 $W_C-W_A$；若得负值，说明负载容性。
5. **铭牌功率当输入** → $\cos\varphi$ 反求成 0.72 而非 0.84 → 铭牌是轴上输出，求输入要除以效率。
6. **$380=\sqrt3\times220$ 当精确式** → 纠结末位 1 V 的差 → 精确值 381.05，工程与考试都按题目给的数走。
7. **一表法用在不对称负载上** → 总功率错 → 一表法只在严格对称时成立。

## 九、考点速记

| 题型 | 公式 |
| --- | --- |
| 求总有功功率 | $P=\sqrt3\,U_lI_l\cos\varphi=3U_pI_p\cos\varphi$ |
| 求无功与视在 | $Q=\sqrt3U_lI_l\sin\varphi$、$S=\sqrt3U_lI_l$ |
| 已知 $P$ 求电流 | $I_l=\dfrac{P}{\sqrt3U_l\cos\varphi}$ |
| 两表读数求 $\varphi$ | $\tan\varphi=\sqrt3\dfrac{W_C-W_A}{W_A+W_C}$ |
| 由 $\varphi$ 求无功 | $Q=P\tan\varphi$ |
| 铭牌题 | 先分输入/输出，再用线量；输入 $=\sqrt3U_NI_N\cos\varphi_N$ |
| 估算 | 380 V 系统 $\cos\varphi=0.8$ 时每千瓦约 1.9 A |

## 十、自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. 为什么 Y 接与 △ 接的功率公式完全一样？各自少乘的那 $\sqrt3$ 跑到哪里去了？
2. 两块表的读数分别是 800 W 与 200 W，总功率、$\cos\varphi$ 各是多少？负载是感性还是容性？
3. 一台 100 kVA 的变压器带 $\cos\varphi=0.7$ 的负载，输出有功多少？若补到 0.95 呢？

## 下一步

三相讲完，电工学的基础部分就结束了。下面进入电机与变压器——那里所有的量（磁通、励磁电流、转差）都要用前面这些电压、电流、功率、相位的语言来描述。

<Prereq id="magnetic-circuit" /> → [15 · 磁路基础](../06-machine/magnetic.md)
