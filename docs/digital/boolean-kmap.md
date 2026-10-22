---
title: 02 · 布尔代数与卡诺图
---

# 02 · 布尔代数与卡诺图

<Meta time="30 min" level="核心" note="用『圈圈』代替代数变形，把任意逻辑式化简到最少门" />

**这一页要解决什么**：布尔代数告诉你「逻辑可以怎么变」，但人肉代数变形又慢又容易漏。这一页给你一张叫「卡诺图」的方格纸——把真值表画成二维格子，化简变成「圈出相邻的 1」，一眼就能得到门数最少的与或式。读完你应该能：写出任意函数的「最小项」形式、在 3~4 变量卡诺图上正确圈组、并知道「无关项」这种白送的化简机会怎么用。

::: tip 读这页之前
- **需要会**：布尔代数的基本运算（与、或、非）和德摩根定律；本页会用到 [符号与约定](../guide/notation.md) 里的**上划线** $\overline{A}$（表示逻辑非）。
- **本页前置**：先读 [布尔代数基础](../prereq/boolean-algebra.md)（变量只有 0/1、公理与基本定律）。
  <Prereq id="boolean-algebra" text="布尔代数：与或非、公理与基本定律" />
:::

数字电路里，一个函数 $F(A,B,C)$ 该用几个门实现，直接决定芯片面积和速度。手写代数化简 $A\overline B+\overline A B+AB$ 还行，换成 6 个变量就肉眼抓瞎了。卡诺图（Karnaugh map）把这个问题变成「在格子上圈方块」——一种连草稿纸上都能做的图形化简法。这一页就从「变量只有 0/1」这个事实出发，把图形法讲透。

## 结论先行

1. **最小项是化简的基本单位**：n 个变量各出现一次（原或反）的乘积项，如 3 变量的 $m_1=\overline A\,\overline B\,C$；下标就是它为真时变量取值的二进制数。
2. **卡诺图 = 把真值表铺成方格**，列/行地址用格雷码排列，保证「物理相邻 = 逻辑相邻」，于是圈出相邻的 1 就能合并掉变量。
3. **圈组只许 1、2、4、8…（2 的幂）个格子**，且必须成矩形（可跨边界回绕）；圈得越大，消掉的变量越多。
4. **无关项（don't-care）是白送的**：某些输入组合永远不会出现，其输出可 0 可 1，化简时挑着当 1 用能进一步减门。
5. **4 变量以内卡诺图最顺手**；再多就改用奎因–麦克拉斯基等算法，图形法会乱。

## 一、基本门与布尔恒等式（回顾）

这一节快速回顾「积木」和「拼接规则」——后面所有化简都建立在它们之上。

| 运算 | 名称 | 真值（A,B） | 表达式 |
| --- | --- | --- | --- |
| 与 | AND | 11→1，其余→0 | $A\cdot B$ 或 $AB$ |
| 或 | OR | 00→0，其余→1 | $A+B$ |
| 非 | NOT | 取反 | $\overline A$ |
| 与非 | NAND | 11→0，其余→1 | $\overline{AB}$ |
| 或非 | NOR | 00→1，其余→0 | $\overline{A+B}$ |
| 异或 | XOR | 相异为 1 | $A\oplus B$ |

两个最常被用错、也最省门的定律是**德摩根定律**：

$$\overline{A+B}=\overline A\cdot\overline B,\qquad \overline{A\cdot B}=\overline A+\overline B$$

一句话记法：「**非号下去，加减互换**」——长横线盖住一个和，拆开后变成乘积，每个变量各自取反。

到这里工具齐了；但纯代数化简对多变量很笨拙，下一节先用代数法暖身，再引出图形法。

## 二、代数化简示例（暖身）

这一节用纯代数把一个函数化到最简，目的是让你体会「人肉变形容易漏项」，从而珍惜下一节的图形法。

::: tip 例 1 · 代数法化简 $F=A\overline B+\overline A B+AB$
**先想什么**：后两项都含 $B$，先把它提出来试试。
**为什么**：

$$F=A\overline B+(\overline A B+AB)=A\overline B+B(\overline A+A)=A\overline B+B=A+B$$

其中 $\overline A+A=1$，再用吸收律 $X+\overline X Y=X+Y$（这里 $X=B,\;Y=A$）。

**验算**：列真值——当 $A=1$ 或 $B=1$ 时 $F=1$，只有 $A=B=0$ 时 $F=0$，正是或门。结果 $F=A+B$ 正确。
:::

代数法能解，但变量一多就抓瞎。下面用「方格纸」把同一件事变简单。

## 三、最小项与无关项（必须先懂的两个概念）

这一节定义整张卡诺图的两种「格子内容」：**最小项**（必定的 1）和**无关项**（可 0 可 1）。不先分清它们，后面的圈组会圈错。

**最小项（minterm）**：n 个变量的乘积项，每个变量恰好以原变量或反变量出现一次。3 变量的 8 个最小项记作 $m_0\sim m_7$：

$$m_0=\overline A\overline B\overline C,\; m_1=\overline A\overline B C,\; \dots,\; m_7=ABC$$

下标 $i$ 的二进制就是「让这一项等于 1 的输入取值」。比如 $m_1$ 对应 $A=0,B=0,C=1$。记号 $\sum m(0,1,2)$ 就是「这些最小项取或」，代表函数在这几个输入上为 1。

**无关项（don't-care）**：某些输入组合**在现实里永远不会出现**（例如 BCD 码只用到 0~9，10~15 不会出现），这些格子的输出写成 $\phi$ 或 $\times$，化简时**可以当 1 也可以当 0**，哪边利于圈组就取哪边。

概念清楚后，下一节就把真值表铺成格子。

## 四、卡诺图怎么画、怎么圈

这一节给出画图和圈组的硬规则。记住一条核心：**卡诺图的行/列地址用格雷码（00,01,11,10），所以相邻格子只差一个变量**——这正是「圈相邻即消变量」成立的前提。

**圈组规则**：
1. 只圈值为 1 的格子（无关项 $\phi$ 可酌情计入）。
2. 圈的大小必须是 $1,2,4,8,\dots$（2 的幂），且形状是矩形。
3. **允许跨边界回绕**（最左列与最右列相邻、最上行与最下行相邻）。
4. 圈越大越好（消掉的变量越多）；圈之间可以重叠，但每个 1 至少被圈一次。
5. 一个圈对应一个乘积项：圈里「保持不变」的变量留下（原/反依值而定），「来回变」的变量消掉。

<FigBox title="3 变量卡诺图：列是 AB（格雷码），行是 C" kind="结构" note="地址用格雷码排列，所以左右相邻、上下相邻都只差一个变量；最左列与最右列也相邻（回绕）。">
<svg viewBox="0 0 360 220" role="img" aria-label="3 变量卡诺图骨架：上方 AB 为 00 01 11 10，左侧 C 为 0 和 1，共 8 格">
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="210" y="30" fill="var(--vp-c-text-3)">AB（格雷码）</text>
    <text x="170" y="55">00</text><text x="230" y="55">01</text><text x="290" y="55">11</text><text x="350" y="55">10</text>
    <text x="60" y="105" fill="var(--vp-c-text-3)">C=0</text>
    <text x="60" y="175" fill="var(--vp-c-text-3)">C=1</text>
  </g>
  <g fill="none" stroke="var(--vp-c-divider)" stroke-width="1.5">
    <rect x="120" y="68" width="240" height="148"/>
    <line x1="180" y1="68" x2="180" y2="216"/>
    <line x1="240" y1="68" x2="240" y2="216"/>
    <line x1="300" y1="68" x2="300" y2="216"/>
    <line x1="120" y1="142" x2="360" y2="142"/>
  </g>
</svg>
</FigBox>

规则看完，下面用实时交互图动手圈一遍。

## 五、演示：交互式卡诺图

<DemoBox title="点格子标 1 / 标 φ，看自动给出的化简结果" hint="先点几个 1，再试试把 φ 也点上，体会无关项如何帮你把圈并大。">
  <KMapDemo />
</DemoBox>

看懂了自动圈组，接下来三个手写例题把「先想 / 为什么 / 验算」走一遍。

## 六、例题：从真值到最简与或式

这一节用三道题覆盖「3 变量普通」「3 变量含无关项」「4 变量」三种典型情形，每题都先说圈哪、再说为什么、最后验算。

### 例 2 · 3 变量：$F=\sum m(0,1,2,4,6)$

::: tip 例 2 · 3 变量化简 {#ex-kmap-3var}
**先想什么**：把 0,1,2,4,6 这五个 1 在图上摆出来，找能拼成 2×1 或 2×2 矩形的圈。

<FigBox title="m0,m1,m2,m4,m6 为 1 的三变量卡诺图" kind="结构" note="三条圈分别对应 ĀB̄、ĀC̄、AB̄；注意它们彼此重叠（m0 被两个圈共享），但每个 1 都至少被圈到。">
<svg viewBox="0 0 520 210" role="img" aria-label="三变量卡诺图，m0 m1 m2 m4 m6 为 1，画出三个圈">
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="140" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">00</text>
    <text x="240" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">01</text>
    <text x="340" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">11</text>
    <text x="440" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">10</text>
    <text x="30" y="78" fill="var(--vp-c-text-3)">C=0</text>
    <text x="30" y="148" fill="var(--vp-c-text-3)">C=1</text>
  </g>
  <rect x="90" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <rect x="190" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <rect x="290" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <rect x="390" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <line x1="190" y1="40" x2="190" y2="190" stroke="var(--vp-c-divider)"/>
  <line x1="290" y1="40" x2="290" y2="190" stroke="var(--vp-c-divider)"/>
  <line x1="390" y1="40" x2="390" y2="190" stroke="var(--vp-c-divider)"/>
  <line x1="90" y1="140" x2="490" y2="140" stroke="var(--vp-c-divider)"/>
  <g font-size="15" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="140" y="100">1</text><text x="240" y="100">1</text><text x="340" y="100">0</text><text x="440" y="100">1</text>
    <text x="140" y="170">1</text><text x="240" y="170">0</text><text x="340" y="170">0</text><text x="440" y="170">1</text>
  </g>
  <rect x="90" y="40" width="200" height="100" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4"/>
  <rect x="90" y="40" width="100" height="150" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4"/>
  <rect x="390" y="40" width="100" height="150" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4"/>
</svg>
</FigBox>

**为什么**：
- 圈①（m0,m1，C=0 且 A=0）→ $\overline A\,\overline C$
- 圈②（m0,m4，A=0 且 B=0）→ $\overline A\,\overline B$
- 圈③（m2,m6，A=1 且 B=0）→ $A\,\overline B$

所以 $F=\overline A\,\overline B+\overline A\,\overline C+A\overline B$。

**验算**：把五项最小项分别代入三式之一——m1 只在圈①、m4 只在圈②、m2/m6 只在圈③、m0 被圈①②覆盖，五项全覆盖且无非 1 被误包含（m3/m5/m7 不在任何圈里）。正确。
:::

### 例 3 · 含无关项：$F=\sum m(0,1,5)+d(4)$

::: tip 例 3 · 利用无关项减门 {#ex-kmap-dontcare}
**先想什么**：m4 是无关项，标成 $\phi$。如果把它当 1，左上 2×2 的格子（m0,m1,m4,m5）就能合成一个大圈，直接消掉两个变量。

<FigBox title="m0 m1 m5 为 1，m4 为 φ；把 φ 当 1 后左上 2×2 成圈" kind="结构" note="不利用 φ 时需两笔（ĀC̄ + ĀB）；把 m4 当 1，左上整块 = A=0，一笔搞定。">
<svg viewBox="0 0 520 210" role="img" aria-label="三变量卡诺图，m0 m1 m5 为 1，m4 为 phi，画出覆盖左上的大圈">
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="140" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">00</text>
    <text x="240" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">01</text>
    <text x="340" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">11</text>
    <text x="440" y="24" text-anchor="middle" fill="var(--vp-c-text-3)">10</text>
    <text x="30" y="78" fill="var(--vp-c-text-3)">C=0</text>
    <text x="30" y="148" fill="var(--vp-c-text-3)">C=1</text>
  </g>
  <rect x="90" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <rect x="190" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <rect x="290" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <rect x="390" y="40" width="100" height="100" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
  <line x1="190" y1="40" x2="190" y2="190" stroke="var(--vp-c-divider)"/>
  <line x1="290" y1="40" x2="290" y2="190" stroke="var(--vp-c-divider)"/>
  <line x1="390" y1="40" x2="390" y2="190" stroke="var(--vp-c-divider)"/>
  <line x1="90" y1="140" x2="490" y2="140" stroke="var(--vp-c-divider)"/>
  <g font-size="15" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="140" y="100">1</text><text x="240" y="100">1</text><text x="340" y="100">0</text><text x="440" y="100">0</text>
    <text x="140" y="170" fill="var(--vp-c-brand-1)">φ</text><text x="240" y="170">1</text><text x="340" y="170">0</text><text x="440" y="170">0</text>
  </g>
  <rect x="90" y="40" width="200" height="150" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4"/>
</svg>
</FigBox>

**为什么**：把 $d(4)$ 取为 1，则左上 2×2（m0,m1,m4,m5）全为 1，对应 $A=0$（B、C 都在变），得到 $F=\overline A$。

**验算**：$\overline A=1$ 当 $A=0$，即覆盖 m0,m1,m4,m5——其中 m4 本就是无关项，取 1 合法；m0,m1,m5 是要求为 1 的项，全中。若**不**利用无关项，则需 $\overline A\overline C+\overline A B$ 两笔，多一个门。所以本例靠 $\phi$ 省了一个门。
:::

### 例 4 · 4 变量：$F=\sum m(4,5,6,7,12,13,14,15)$

::: tip 例 4 · 四变量化简 {#ex-kmap-4var}
**先想什么**：这 8 个 1 正好落在「B=1」的两整行上，应该能直接合并成单变量 $B$。

<FigBox title="B=1 的两整行全为 1 的四变量卡诺图" kind="结构" note="行地址 AB，列地址 CD（均为格雷码）。中间两行（AB=01 与 11，即 B=1）整行是 1，跨行一个圈即 B。">
<svg viewBox="0 0 520 250" role="img" aria-label="四变量卡诺图，B=1 的两行全为 1，画出一个覆盖它们的大圈">
  <g font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="140" y="24" fill="var(--vp-c-text-3)">00</text><text x="240" y="24" fill="var(--vp-c-text-3)">01</text>
    <text x="340" y="24" fill="var(--vp-c-text-3)">11</text><text x="440" y="24" fill="var(--vp-c-text-3)">10</text>
    <text x="30" y="72" fill="var(--vp-c-text-3)">00</text><text x="30" y="120" fill="var(--vp-c-text-3)">01</text>
    <text x="30" y="168" fill="var(--vp-c-text-3)">11</text><text x="30" y="216" fill="var(--vp-c-text-3)">10</text>
  </g>
  <g fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)">
    <rect x="90" y="92" width="100" height="48"/><rect x="190" y="92" width="100" height="48"/>
    <rect x="290" y="92" width="100" height="48"/><rect x="390" y="92" width="100" height="48"/>
    <rect x="90" y="140" width="100" height="48"/><rect x="190" y="140" width="100" height="48"/>
    <rect x="290" y="140" width="100" height="48"/><rect x="390" y="140" width="100" height="48"/>
  </g>
  <g fill="none" stroke="var(--vp-c-divider)">
    <rect x="90" y="44" width="400" height="192"/>
    <line x1="190" y1="44" x2="190" y2="236"/><line x1="290" y1="44" x2="290" y2="236"/><line x1="390" y1="44" x2="390" y2="236"/>
    <line x1="90" y1="92" x2="490" y2="92"/><line x1="90" y1="140" x2="490" y2="140"/><line x1="90" y1="188" x2="490" y2="188"/>
  </g>
  <g font-size="13" fill="var(--vp-c-text-1)" text-anchor="middle">
    <text x="140" y="124">1</text><text x="240" y="124">1</text><text x="340" y="124">1</text><text x="440" y="124">1</text>
    <text x="140" y="172">1</text><text x="240" y="172">1</text><text x="340" y="172">1</text><text x="440" y="172">1</text>
  </g>
  <rect x="90" y="92" width="400" height="96" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="500" y="146" font-size="13" fill="var(--vp-c-brand-1)" text-anchor="middle">B</text>
</svg>
</FigBox>

**为什么**：中间两行对应 $AB=01$ 与 $AB=11$，两者唯一共同点就是 $B=1$（A 在变），列（$C,D$）全变，故整块 = $B$。

**验算**：代入 $B=1$ 覆盖 m4~7 与 m12~15，正是题目所给八项；$B=0$ 时（$AB=00,10$ 两行）全为 0，符合。结果 $F=B$。
:::

三道题走完，下一节看一个真实芯片怎么把「最小项」直接变成硬件。

## 七、工程实例：74LS138 译码器

这一节把抽象的最小项落到实物：3-8 译码器 74LS138 的每个低有效输出，恰好就是某个最小项。

74LS138 有 3 个地址输入 $A_2A_1A_0$ 和 8 个低有效输出 $\overline{Y_0}\sim\overline{Y_7}$。在使能有效时：

$$\overline{Y_i}=m_i\quad(\text{低有效})$$

也就是说，第 $i$ 个输出为低，当且仅当地址等于 $i$。于是**任意 3 变量函数**都能用 138 加少量门搭出来：例如 $F(A,B,C)=m_1+m_2+m_4+m_7$，只要把 $\overline{Y_1},\overline{Y_2},\overline{Y_4},\overline{Y_7}$ 接一个 4 输入与非门再取反即可。卡诺图帮你选最小项集合，138 帮你把它们「物理实现」——这就是理论与芯片的连接点。

## 八、易错清单

- [ ] **漏圈 / 圈太小**：能并成 4 格的别只圈 2 格，否则多出门
- [ ] **忘了回绕相邻**：最左列与最右列、最上行与最下行是相邻的，能跨边界圈
- [ ] **把无关项 $\phi$ 全当 1**：它是「可 1 可 0」，只挑对化简有利的取 1，别无脑填
- [ ] **圈重叠但没覆盖全部 1**：每个 1 至少被一个圈包住，否则化简结果会少项
- [ ] **圈的形状不是矩形 / 大小不是 2 的幂**：斜着的、L 形的圈都是非法的
