---
title: 02 · 基尔霍夫定律与电位
description: 结点、支路、回路、网孔的定义，KCL 与 KVL 的符号规则，电位的相对性，独立方程数为什么是 n−1 与 b−n+1，配四道带图例题。
---

# 02 · 基尔霍夫定律与电位

<Meta time="55 min" level="核心" note="KCL/KVL 与元件性质无关，只与连接方式有关；把它们当成两条守恒律，比当成两个公式管用" />

**这一页要解决什么**：上一页给了你一套符号约定，但只有约定还解不了电路——缺两条把整个电路串起来的方程。这一页给出这两条方程（KCL、KVL），以及配套的四个词：结点、支路、回路、网孔。读完你应该能对任意一个电路：数清有几个独立方程、按统一符号规则把它们列出来、用它们求出支路电流与各点电位，并且知道解完之后拿什么验算。

::: tip 读这页之前
- **需要会**：参考方向与 $U_{ab}=V_a-V_b$、关联方向与功率符号（<Prereq id="reference-direction" />）；欧姆定律与串并联（<Prereq id="ohm" />、<Prereq id="series-parallel" />）。
- **这一页用到的符号**：$I$（电流）、$U$（电压）、$V$（电位）、$E$（电动势）、$R$（电阻）、$n$（结点数）、$b$（支路数）。全部约定见[符号与约定](../../guide/notation.md)。
- **四个词先给一句话**：结点是三条以上支路相接的连接点；支路是两个结点之间的一段电路，整段流过同一个电流；回路是沿支路走一圈又回到出发点的闭合路径；网孔是内部不再包含其它支路的最小回路。第二节逐条展开。
- **要提前建立的两个直觉**：「连接点」和「闭合路径」。先有这两个直觉，第二节的定义读起来会顺很多。
:::

万用表的电流档几乎是一条导线——内阻只有零点几欧。有人图省事，把电流表并联在灯泡两端想「看看电流」，结果表针猛地打到底，保险丝烧断。原因不需要任何新定律：并联给电流开了一条几乎零阻的通路，几乎所有电流都从表里走。可「多少电流走表、多少走灯」这件事，必须有个**定量**的说法。

同样的问题还有第二个版本：一块电路板上有 12 个元件、三个电源，你想知道某条支路上的电流，能列的方程到底有几条？列多了是白列，列少了不够解。这两个问题都指向同一件事：**电流怎么在结点处分流、电压怎么沿回路分配**。这就是这一页的两根柱子。

<CircuitFig kind="node-loop" title="KCL 看结点，KVL 看回路" note="左边是「点」：几条支路在一个结点相遇，电流的代数和为零。右边是「圈」：沿一个回路走一圈，各段电压的代数和为零。后面所有分析方法都是这两件事的不同写法。" />

## 结论先行

1. KCL 说的是结点：流入的电流之和等于流出的电流之和，本质是电荷守恒。
2. KVL 说的是回路：沿任意闭合回路走一圈，电位升之和等于电位降之和，本质是能量守恒。
3. 两条定律都与元件性质无关——电阻、电容、电源、非线性器件一视同仁，只取决于电路的连接方式。
4. 电位是相对量：换参考点，所有电位平移同一个常数，任意两点之间的电压不变。
5. 独立方程数只由拓扑（电路的连接方式，与元件数值无关）决定：$n$ 个结点给 $n-1$ 个独立 KCL，$b$ 条支路给 $b-n+1$ 个独立 KVL，两者相加正好等于未知支路电流数。

::: tip 一句话抓住本质，后面所有方法都是它的变形

- **KCL = 对「点」列电流**：流入 = 流出。
- **KVL = 对「圈」列电压**：电位升 = 电位降。
- 支路电流法、网孔法、结点电压法**不是新定律**（这三种方法下一章逐个讲），只是 KCL、KVL 搭配欧姆定律的不同消元策略。这两根柱子吃透了，后面全是应用题。

:::

## 一、为什么只有两条：电荷守恒与能量守恒

这一节只回答一个问题：为什么整个电路分析反复只用两条方程，而不是更多。

因为电路里真正守恒的东西只有两样：电荷和能量。

| 定律 | 守恒的东西 | 作用范围 | 数学形式 |
| --- | --- | --- | --- |
| KCL | 电荷 | 任意闭合面（不限于一个结点） | $\sum I=0$ |
| KVL | 能量 | 任意闭合回路 | $\sum U=0$ |

这两条之所以成立，是因为电路不允许凭空产生电荷，也不允许凭空产生能量：电荷不能在导线里堆积，否则该处电位会一直升高；沿一条闭合路径走一圈回到原点，电位必须回到原值，否则「这一点电位是多少」就没有定义。

::: tip 一个物理图像：水管网络

把电路想成连通的水管。**KCL** 是「任一封闭容器里既不凭空多水也不凭空少水」；**KVL** 是「沿一圈走回原点，水位差的总和为零」。

由此还能得出一条极有用的性质：**两点之间的电压与路径无关**。你从哪条路「量」过去，结果都一样——正是这条性质保证了「电位」可以被定义成一个数。

:::

两条守恒律成立的前提是「集中参数」：电路的尺寸远小于工作波长，同一根导线上各处电流相同。长线、高频下这个前提破了，KCL、KVL 就不再适用，那是传输线的内容，不在本课程范围。

两条定律本身不涉及任何具体元件，所以下一步必须先给电路的「骨架」定几个词——不然「对结点列方程」这句话都说不清指的是哪里。下一节专门定义四个词。

## 二、先把四个词定死：结点、支路、回路、网孔

这一节只做一件事：给出四个拓扑词的定义，并说明它们怎么数。

**结点**（node）是三条或三条以上支路的连接点。两条支路接在一起只算「同一根导线的拐弯」，不算结点——因为它不产生任何分流，对它列 KCL 只会得到 $0=0$。

**支路**（branch）是两个结点之间的一段电路，整段流过同一个电流。

**回路**（loop）是从一个结点出发、沿支路走一圈又回到该结点、途中不重复经过任何结点的闭合路径。

**网孔**（mesh）是内部不再包含其它支路的回路，也就是「平面上最小的那个圈」。一个平面电路里，网孔数恰好等于独立 KVL 方程数，这是下一章网孔法的由来。

::: tip 数词的顺序：先结点，再支路，再回路

很多人一上来就数回路，数着数着就乱了。正确顺序是：**先用点标出结点 → 数出支路 → 回路由支路围成，自然数得清**。数完记下来，这一页最后一节要用它算独立方程数。

:::

有了这四个词，两条定律就能写成可执行的句子了。先看对「点」的那条：KCL。

## 三、KCL：对结点列电流

这一节只回答一个问题：一个结点上几条支路的电流，凭什么加起来等于零。

::: tip KCL · 结点电流定律

$$
\sum I_{\text{入}}=\sum I_{\text{出}}\qquad\text{或}\qquad \sum I=0
$$

**广义结点**：把若干结点、若干支路圈进任意一个闭合面，穿过这个面的电流代数和同样为零。

:::

用的时候只有两条纪律：

1. **只认「穿进、穿出」，不认元件是什么**。电阻、电容、电源、受控源（电压或电流由电路别处的量决定的电源）一视同仁。
2. **电流带符号**。约定流入为正、流出为负（全题统一即可），然后代数相加。

第二条是最容易翻车的地方：$\sum I=0$ 里的每个 $I$ 都带着自己相对结点的方向，不是各支路电流的绝对值相加。若算得某条支路为负，说明它的实际方向与箭头相反，而不是「电流是负的」这种物理上不存在的说法。

**广义结点**是 KCL 最省时间的一个用法：当你想知道「流入某一块电路的总电流」时，不必逐条支路算——在那一块外面画个圈，对穿过这个圈的电流列一次 KCL，一个方程就够。

<FigBox title="广义结点：圈住一块电路，只数穿过边界的电流" kind="结构" note="闭合面内部有多少结点、多少支路都不重要，穿进穿出的电流代数和为零。求某块电路的总电流、求放大器输入端的偏置电流，都用这一招。" >

<svg viewBox="0 0 470 222" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<rect x="140" y="58" width="200" height="120" rx="14" stroke-dasharray="6 4"/>
<text x="240" y="114" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">闭合面</text>
<text x="240" y="136" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">可圈住任意一块电路</text>
<line x1="56" y1="88" x2="140" y2="88"/>
<line x1="70" y1="88" x2="124.4" y2="88"/>
<path d="M130 88 L122.7 91.26 L122.7 84.74 Z" class="sf-solid"/>
<text x="64" y="70" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I₁</text>
<line x1="140" y1="158" x2="56" y2="158"/>
<line x1="126" y1="158" x2="71.6" y2="158"/>
<path d="M66 158 L73.3 154.74 L73.3 161.26 Z" class="sf-solid"/>
<text x="64" y="180" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I₂</text>
<line x1="340" y1="112" x2="424" y2="112"/>
<line x1="352" y1="112" x2="406.4" y2="112"/>
<path d="M412 112 L404.7 115.26 L404.7 108.74 Z" class="sf-solid"/>
<text x="424" y="94" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I₃</text>
<text x="240" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">ΣI入 = ΣI出：穿过这个面的电流一样守恒</text>
</svg>

</FigBox>

对「点」的方程有了，接下来是对「圈」的方程。它的符号规则比 KCL 多一步：要先选定绕行方向。

## 四、KVL：对回路列电压

这一节只回答一个问题：沿一个回路走一圈，各段电压的符号该怎么记。

先任意指定一个**绕行方向**（顺时针或逆时针），然后沿这个方向走，边走边记账：

- 经过电阻，从「+」走到「−」（顺着电流方向）：记 $+IR$（电位降）；
- 经过电阻，从「−」走到「+」：记 $-IR$（电位升）；
- 经过电源，从「−」走到「+」：记 $+E$（电位升）；
- 经过电源，从「+」走到「−」：记 $-E$（电位降）。

全程代数和为零：

$$
\sum U=0\qquad\text{例如}\qquad E-IR_1-IR_2-IR_3=0
$$

**唯一的纪律：绕行方向一旦选定，全程不要改。** 中途改方向等于给自己换了一套符号，结果必然自相矛盾。这与上一页「参考方向全程不换」是同一条纪律的两种说法。

::: tip KVL 的两种列法，看题目问什么

1. **全电压式**：沿圈把每个元件的 $u$ 都写出来。适合串联回路，一步到位。
2. **电位式**：只写电源，用「电位升 = 电位降」把电阻项挪到另一边。适合多电源、又要问各点电位的题，因为串联分压可以直接写成电位差。

考试里若题目要「求各点电位」，第二种通常少写一半符号。

:::

KVL 里出现了「电位」这个词，而且我们默认「走一圈电位回到原值」。这句话需要一个前提：电位本身是可以定义的一个数。下一节就把它说清。

## 五、电位：参考点是人为选的

这一节只回答一个问题：为什么同一点可以有不同的电位值，而电压却唯一。

::: tip 电位与电压的关系

$$
U_{ab}=V_a-V_b
$$

参考点的电位规定为 0。求某点电位：从该点沿任意路径「走」到参考点，把沿途各段的电压降代数相加。

:::

**关键认知：电位是相对量，电压是绝对量。**

- 换参考点，所有 $V$ 都平移同一个常数，但任意两点之间的 $U_{ab}$ **完全不变**。
- 所以「没说参考点的电位」是没有意义的。题目没给参考点，你就自己选一个，习惯选：多条支路的公共汇合点、电源负极、接地符号处。

沿一条串联支路，电位是逐段等差下降的：每一段降 $IR$，画出来就是一条折线（等阻值时是直线）。

<FigBox title="电位阶梯：一条直线的下降" kind="曲线" note="沿一条串联支路，电位逐段下降。接上负载后末级被拉低，整串电位重新分配——这就是「分压器不能当电源用」的原因：一接负载，分压比就变了。">

<WavePreset kind="ladder" :p="1.4" />

</FigBox>

电位与电压的关系清楚了，还剩一个「算题前该知道」的数字：这个电路到底能列几个独立方程。下一节给出公式，并说明为什么是这两个数。

## 六、独立方程数：算题前先数这个

这一节只回答一个问题：一个电路能列出几个「有用」的 KCL、几个「有用」的 KVL。

这是最容易被忽视、也最省时间的一条：

$$
\boxed{\text{独立 KCL 数}=n-1}\qquad \boxed{\text{独立 KVL 数}=b-n+1}
$$

其中 $n$ 是结点数，$b$ 是支路数。两个数字之和正好是 $b$，也就是未知支路电流的个数——所以「列够方程」这件事是可以提前算出来的，不是碰运气。

**为什么 KCL 少一个**：把 $n$ 个结点的 KCL 全写出来会得到 $n$ 个方程，但它们的和恒等于 $0=0$——每条支路电流都在两端的结点各出现一次、符号相反，正好抵消。所以其中任意一个都能由另外 $n-1$ 个推出来，真正独立的只有 $n-1$ 个。这种「其中一条是其余各条的推论」就是**独立方程**（independent equation）的含义：去掉它，方程组仍然解得出全部未知量；留下它则是白写。

**为什么 KVL 是 $b-n+1$**：把电路只看成「点与线」的图。要把 $n$ 个结点连成一张不含回路的网（树），最少需要 $n-1$ 条支路；剩下的每一条支路都恰好新围出一个独立回路。所以独立回路数 $=b-(n-1)=b-n+1$。电路能画在平面上时，这个数正好等于网孔数。

**用法举例**：4 个结点、6 条支路 → 独立 KCL 3 个，独立 KVL $6-4+1=3$ 个。列 3 个 KCL 加 3 个 KVL，正好解 6 个支路电流。

<FigBox title="一个 4 结点、6 支路的例子" kind="结构" note="结点数 4、支路数 6：独立 KCL 3 个、独立 KVL 3 个，共 6 个方程，恰好等于 6 条支路的电流个数。这个账在动笔之前就该算清。" >

<svg viewBox="0 0 460 254" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="110" y1="190" x2="320" y2="190"/>
<line x1="320" y1="190" x2="215" y2="56"/>
<line x1="215" y1="56" x2="110" y2="190"/>
<line x1="215" y1="140" x2="110" y2="190"/>
<line x1="215" y1="140" x2="320" y2="190"/>
<line x1="215" y1="140" x2="215" y2="56"/>
<circle cx="110" cy="190" r="4.5" class="sf-dot"/>
<circle cx="320" cy="190" r="4.5" class="sf-dot"/>
<circle cx="215" cy="56" r="4.5" class="sf-dot"/>
<circle cx="215" cy="140" r="4.5" class="sf-dot"/>
<text x="94" y="194" text-anchor="end" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">①</text>
<text x="336" y="194" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">②</text>
<text x="215" y="36" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">③</text>
<text x="231" y="144" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">④</text>
<text x="215" y="234" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">4 个结点、6 条支路：独立 KCL 3 个 + 独立 KVL 3 个 = 6 个未知支路电流</text>
</svg>

</FigBox>

::: warning 概念判断题常在这里出

问「$n$ 个结点、$b$ 条支路的电路，可列出的独立 KCL 与独立 KVL 方程数分别是多少」，答案就是 $(n-1,\;b-n+1)$。记死，别在考场上现推。

:::

到这里，两条定律、四个词、一个计数公式都有了。下一节用两个演示把它们连成动作，然后进入例题——那才是真正检验你是否会用符号的地方。

## 演示

这一节把两条定律变成可以动手改的东西：改一条支路的电流，看第四条怎么跟着变；看电位沿回路走一圈，怎么恰好回到原点。

<DemoBox title="KCL 结点电流守恒 / KVL 回路电压" hint="KCL：改任意一条支路电流，第四条自动跟着变。KVL：看电位沿回路走一圈如何回到原点。">
  <KclKvlDemo />
</DemoBox>

<DemoBox title="搭个电路自己验证 KCL/KVL" hint="用电路沙盒搭几支路电路，看看每个结点的电流是不是真的守恒。">
  <CircuitSandbox />
</DemoBox>

## 例题

四道题按难度排：例 1 是完整的 KVL 符号练习，例 2 是一步到位的 KCL，例 3 考「被理想电压源钉住的量」，例 4 考「化简失效时怎么办」。每题都要先问一句「这题该用哪条定律」。

::: tip 例 1 · 完整解 KVL：两电源串联回路 {#ex-kcl-1}
**题目**：$E_1=12$ V、$E_2=6$ V、$R_1=R_2=2\ \Omega$、$R_3=4\ \Omega$ 构成一个串联回路，两个电源顺着同一绕行方向串联。求电流与各元件功率。

<FigBox title="例 1 的电路：两个电源同向串联" kind="电路" note="E₁ 的 + 在上、E₂ 的 + 在下——按顺时针绕行，两个电源都是「从 − 到 +」，都是电位升，所以电动势相加。判断同向还是反向，只看 + 极位置，不要凭感觉。" >

<svg viewBox="0 0 470 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="90" y1="76" x2="196" y2="76"/>
<g transform="translate(220 76)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="244" y1="76" x2="350" y2="76"/>
<text x="220" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₁ = 2 Ω</text>
<line x1="350" y1="208" x2="350" y2="168"/>
<g transform="translate(350 142) rotate(-90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="350" y1="116" x2="350" y2="76"/>
<line x1="350" y1="208" x2="299" y2="208"/>
<g transform="translate(275 208) rotate(180)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="251" y1="208" x2="200" y2="208"/>
<text x="275" y="192" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₂ = 2 Ω</text>
<line x1="200" y1="208" x2="169" y2="208"/>
<g transform="translate(145 208) rotate(180)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="121" y1="208" x2="90" y2="208"/>
<text x="145" y="192" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₃ = 4 Ω</text>
<line x1="90" y1="76" x2="90" y2="116"/>
<g transform="translate(90 142) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="90" y1="168" x2="90" y2="208"/>
<text x="72" y="142" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">E₁ = 12 V</text>
<text x="368" y="142" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">E₂ = 6 V</text>
<text x="102" y="92" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="102" y="192" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<text x="338" y="192" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">+</text>
<text x="338" y="92" text-anchor="middle" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">−</text>
<line x1="170" y1="76" x2="214.4" y2="76"/>
<path d="M220 76 L212.7 79.26 L212.7 72.74 Z" class="sf-solid"/>
<text x="195" y="44" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">I = 2.25 A</text>
<text x="220" y="150" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">两源都顺着顺时针方向推</text>
</svg>

</FigBox>

**先想什么**：全串联，可以用串并联等效合并，也可以直接列 KVL。这道题选 KVL，因为它同时要求各元件功率，而功率需要每个元件自己的电压，合并成等效电阻反而要多算一步。*（选方法的依据是「题目还要什么」，不是「哪个公式更熟」。）*

**第一步，判断电路类型。** 全部元件首尾相接，只有一个回路、一条支路电流。

**第二步，定绕行方向与符号。** 设回路电流 $I$ 顺时针。从 $E_1$ 的下端出发：经 $E_1$ 向上，从「−」到「+」，记 $+E_1$；经 $R_1$，记 $-IR_1$；经 $E_2$ 向下，从「−」到「+」，记 $+E_2$；经 $R_3$、$R_2$ 回到起点，记 $-I(R_3+R_2)$。

**第三步，列 KVL 并求解。**

$$
E_1+E_2-I(R_1+R_2+R_3)=0
$$

$$
18-I(2+2+4)=0\;\Rightarrow\;I=\frac{18}{8}=2.25\ \text{A}
$$

**这个判断错了会怎样**：若两源反向，电动势应相减为 $12-6=6$ V，电流变成 $0.75$ A。两个结果差三倍，所以「同向还是反向」这一步错了整题就错。判断依据只有一个：**每个电源的 + 极在哪一端**。

**第四步，各元件功率。** 全串联，电流相同：

| 元件 | 计算 | 功率 |
| --- | --- | --- |
| $R_1$ | $I^2R_1=2.25^2\times2$ | $10.125$ W（吸收） |
| $R_2$ | $I^2R_2=2.25^2\times2$ | $10.125$ W（吸收） |
| $R_3$ | $I^2R_3=2.25^2\times4$ | $20.25$ W（吸收） |
| $E_1$ | $-E_1I=-12\times2.25$ | $-27$ W（发出） |
| $E_2$ | $-E_2I=-6\times2.25$ | $-13.5$ W（发出） |

**第五步，验算。**

$$
\sum P=-27-13.5+10.125+10.125+20.25=-40.5+40.5=0
$$

发出与吸收相等 ✓。

**结论里最该记住的一句**：$R_3$ 阻值最大，耗散最多，所以最热的是它。散热设计看功率分布，不看电流分布。
:::

::: tip 例 2 · 一个结点的 KCL：一次方程解一个未知数 {#ex-kcl-2}
**题目**：一个结点上接三条支路。支路 1 流入 $I_1=2$ A，支路 2 流出 $I_2=3$ A，支路 3 也是流出，电流 $I_3$ 未知。求 $I_3$。

<FigBox title="例 2 的电路：三条支路在一个结点相遇" kind="电路" note="只有三条支路，KCL 就是一个一次方程。注意每个箭头的方向都是题目给定的参考方向，答案的符号才是结论。" >

<svg viewBox="0 0 470 212" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<circle cx="200" cy="108" r="4.5" class="sf-dot"/>
<line x1="200" y1="108" x2="200" y2="40"/>
<line x1="200" y1="70" x2="200" y2="94.4"/>
<path d="M200 100 L196.74 92.7 L203.26 92.7 Z" class="sf-solid"/>
<text x="214" y="58" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="221.44" y="64.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">1</text>
<text x="248" y="58" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">= 2 A（流入）</text>
<line x1="200" y1="108" x2="96" y2="186"/>
<line x1="178" y1="132" x2="122.8" y2="165.12"/>
<path d="M118 168 L122.59 161.44 L125.94 167.04 Z" class="sf-solid"/>
<text x="96.56" y="196" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="104" y="202.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">2</text>
<text x="96" y="196" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">= 3 A（流出）</text>
<line x1="200" y1="108" x2="304" y2="186"/>
<line x1="222" y1="132" x2="277.2" y2="165.12"/>
<path d="M282 168 L274.06 167.04 L277.41 161.44 Z" class="sf-solid"/>
<text x="310" y="196" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="317.44" y="202.6" text-anchor="start" dominant-baseline="middle" font-size="8.64" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">3</text>
<text x="338" y="196" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">= ?（流出）</text>
</svg>

</FigBox>

**先想什么**：题目只问电流、不问电压，所以只需要 KCL——KVL 在这道题里没有用武之地。*（先看未知量的类型，再选定律，这是省时间的关键。）*

**列 KCL**：流入只有 $I_1$，流出有 $I_2+I_3$：

$$
I_1=I_2+I_3\;\Rightarrow\;I_3=2-3=-1\ \text{A}
$$

$I_3<0$ 说明它的实际方向与箭头相反，也就是**流入**该结点 1 A。

**验算**（把结果代回原式，按「流入为正、流出为负」求和）：$2-3-(-1)=0$ ✓。

**这一节最该带走的一句**：若还要求电压，先用电阻关系算出各支路电流，再用 KVL 求电压。顺序永远是「**先电流后电压**」，反过来会多出未知数。
:::

::: tip 例 3 · 被理想电压源钉住的电压（综合） {#ex-kcl-3}
**题目**：$E_1=10$ V 与 $R_1=4\ \Omega$ 串联后接到结点 a；a、b 之间并着两条支路：$R_2=6\ \Omega$ 与理想电压源 $E_2=6$ V（+ 在 a 侧）。求 $U_{ab}$、$R_1$ 上的电流、$R_2$ 上的电流、$E_2$ 上的电流，以及以 b 为参考点时 a 的电位。

<FigBox title="例 3 的电路：一个电压源把 a、b 之间的电压钉死" kind="电路" note="E₂ 是理想电压源，它的端电压不受外电路影响，所以 U_ab 一眼就是 6 V。剩下的工作只是把电流和电位补齐。" >

<svg viewBox="0 0 560 244" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="380" y1="76" x2="261" y2="76"/>
<g transform="translate(235 76) rotate(180)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="209" y1="76" x2="90" y2="76"/>
<text x="235" y="60" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">E₁ = 10 V</text>
<line x1="90" y1="76" x2="90" y2="117"/>
<g transform="translate(90 141) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="90" y1="165" x2="90" y2="206"/>
<line x1="90" y1="206" x2="380" y2="206"/>
<line x1="380" y1="76" x2="380" y2="117"/>
<g transform="translate(380 141) rotate(90)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="380" y1="165" x2="380" y2="206"/>
<text x="398" y="141" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₂ = 6 Ω</text>
<line x1="470" y1="76" x2="470" y2="115"/>
<g transform="translate(470 141) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="470" y1="167" x2="470" y2="206"/>
<text x="494" y="141" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">E₂ = 6 V</text>
<line x1="380" y1="76" x2="470" y2="76"/>
<line x1="380" y1="206" x2="470" y2="206"/>
<circle cx="380" cy="76" r="4" class="sf-dot"/>
<circle cx="380" cy="206" r="4" class="sf-dot"/>
<text x="74" y="141" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">R₁ = 4 Ω</text>
<text x="368" y="64" text-anchor="end" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">a</text>
<text x="368" y="222" text-anchor="end" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   sf-w700">b</text>
<line x1="345" y1="206" x2="260.6" y2="206"/>
<path d="M255 206 L262.3 202.74 L262.3 209.26 Z" class="sf-solid"/>
<text x="300" y="192" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">I</text>
<text x="255" y="148" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">E₂ 把 a、b 之间的电压钉在 6 V</text>
</svg>

</FigBox>

**先想什么**：图里有一个理想电压源直接跨在 a、b 之间。**理想电压源的端电压不由外电路决定**，所以这道题不需要联立方程——先把这个被钉死的量读出来，未知数立刻少一个。*（这是「先找已知」的典型：题目给的不是数字，而是一条约束。）*

**第一步，读钉死的量。**

$$
U_{ab}=E_2=6\ \text{V}
$$

**第二步，对左边回路列 KVL**（从 a 出发顺时针走：a → b 经 E₂（从「+」到「−」，降 6），b → c 走导线，c → d 经 R₁（顺着电流，降 $4I_1$），d → a 经 E₁（从「−」到「+」，升 10））：

$$
10-4I_1-6=0\;\Rightarrow\;I_1=1\ \text{A}
$$

这里 10 是 $E_1$ 的电位升，$4I_1$ 是 $R_1$ 的电位降，6 是 $E_2$ 的电位降（也就是 $U_{ab}$）——三项走一圈归零。

**第三步，$R_2$ 上的电流由它自己的电压决定**：

$$
I_2=\frac{U_{ab}}{R_2}=\frac{6}{6}=1\ \text{A}\quad(\text{方向 }a\to b)
$$

**第四步，对结点 a 列 KCL**：流入的是 $I_1=1$ A（从 $R_1$ 来），流出的是 $I_2=1$ A（往 $R_2$ 去），所以流过 $E_2$ 的电流

$$
I_3=I_1-I_2=0\ \text{A}
$$

*（这一步最反直觉：并联的理想电压源只是把电压钉住，不一定要出电流。它在这里正好「空转」。）*

**第五步，求电位。** 以 b 为参考，$V_b=0$：

$$
V_a-V_b=U_{ab}=6\ \text{V}\;\Rightarrow\;V_a=+6\ \text{V}
$$

若改选 a 为参考，则 $V_a'=0$、$V_b'=-6$ V。**两个电位都变了，差值仍是 6 V**——这就是电位与电压的本质区别。

**验算**（功率平衡）：$P_{E1}=-10\times1=-10$ W（发出），$P_{R1}=1^2\times4=4$ W，$P_{R2}=1^2\times6=6$ W，$P_{E2}=0$；$\sum P=-10+4+6+0=0$ ✓。
:::

::: tip 例 4 · 电桥：什么时候可以直接下结论 {#ex-kcl-4}
**题目**：一个电桥网络，$E=12$ V，$R_1=R_2=100\ \Omega$，$R_3=R_4=50\ \Omega$。求桥支路中的电流 $I_{\text{桥}}$。

<FigBox title="例 4 的电桥：两条并联支路，中间架一条桥" kind="电路" note="上支路 R₁、R₂ 分压，下支路 R₃、R₄ 分压。两条支路的中点电位若不相等，桥支路就有电流；相等时桥支路可以当它不存在。" >

<svg viewBox="0 0 520 258" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="110" y1="80" x2="156" y2="80"/>
<g transform="translate(180 80)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="204" y1="80" x2="250" y2="80"/>
<text x="180" y="64" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₁ = 100 Ω</text>
<line x1="250" y1="80" x2="296" y2="80"/>
<g transform="translate(320 80)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="344" y1="80" x2="390" y2="80"/>
<text x="320" y="64" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₂ = 100 Ω</text>
<line x1="110" y1="210" x2="156" y2="210"/>
<g transform="translate(180 210)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="204" y1="210" x2="250" y2="210"/>
<text x="180" y="194" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₃ = 50 Ω</text>
<line x1="250" y1="210" x2="296" y2="210"/>
<g transform="translate(320 210)">
<line x1="-24" y1="0" x2="-9" y2="0"/>
<rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="none"/>
<line x1="9" y1="0" x2="24" y2="0"/>
</g>
<line x1="344" y1="210" x2="390" y2="210"/>
<text x="320" y="194" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">R₄ = 50 Ω</text>
<line x1="110" y1="80" x2="110" y2="119"/>
<g transform="translate(110 145) rotate(90)">
<line x1="-26" y1="0" x2="-5" y2="0"/>
<line x1="-5" y1="-11" x2="-5" y2="11" stroke-width="2.6"/>
<line x1="5" y1="-6" x2="5" y2="6" stroke-width="2.6"/>
<line x1="5" y1="0" x2="26" y2="0"/>
</g>
<line x1="110" y1="171" x2="110" y2="210"/>
<line x1="390" y1="80" x2="390" y2="210"/>
<circle cx="250" cy="80" r="4" class="sf-dot"/>
<circle cx="250" cy="210" r="4" class="sf-dot"/>
<line x1="250" y1="80" x2="250" y2="210" stroke-dasharray="5 4"/>
<text x="96" y="145" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">E = 12 V</text>
<text x="233.18" y="122" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t  sf-it ">U</text>
<text x="240" y="128.05" text-anchor="start" dominant-baseline="middle" font-size="7.92" stroke="none" fill="var(--vp-c-text-1)" class="sf-t   ">桥</text>
<text x="240" y="150" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">桥支路</text>
<text x="250" y="244" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t   ">平衡判据：R₁/R₂ = R₃/R₄ 时两点等电位，桥支路无电流</text>
</svg>

</FigBox>

**先想什么**：这个网络既不是纯串联也不是纯并联，不能直接合并电阻。但先别急着列方程——先看它是不是**平衡电桥**，平衡的话一步就能出答案。

**判断平衡**：若

$$
\frac{R_1}{R_2}=\frac{R_3}{R_4}
$$

则两条支路的分压比相同，两个中点电位相等，桥支路两端电压为零，电流也就为零。

本题 $\dfrac{100}{100}=1=\dfrac{50}{50}$，所以

$$
U_{\text{桥}}=0,\qquad I_{\text{桥}}=0
$$

**换个条件呢？** 把 $R_4$ 改成 $30\ \Omega$：此时 $\dfrac{R_3}{R_4}=\dfrac{50}{30}\approx1.67\ne1$，两个中点不再等电位，桥支路就有电流。这时网络**既非串联也非并联**，<Prereq id="series-parallel" /> 的化简办法失效，必须用 <Prereq id="y-delta" /> 变换，或者直接列 KCL、KVL 硬解。

**验算（平衡时的旁证）**：平衡时桥支路无电流，可以把它当开路，于是上支路电流 $12/200=0.06$ A，中点电位 $12-0.06\times100=6$ V；下支路电流 $12/100=0.12$ A，中点电位 $12-0.12\times50=6$ V。两个中点都是 6 V，差值为零 ✓。

**这正是下一章存在的理由**：化简不是万能钥匙，遇到电桥这种结构就得换方法——而换方法的底层，仍然是这一页的两条定律。
:::

四道题做完，再用一份清单把这一页的坑排一遍。

## 易错清单

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. **把 $\sum I=0$ 当成绝对值相加** → 方程恒不成立或解出荒唐值 → 每个 $I$ 都带相对结点的符号，先定「流入为正」再代数相加。
2. **列 KVL 时中途改绕行方向** → 同一条支路出现两个相反的符号，方程自相矛盾 → 绕行方向选定后全程不改。
3. **把两条支路的拐弯当结点** → 结点数数多，独立方程数算错 → 结点必须有三条以上支路相接。
4. **电位不选参考点就开算** → 每个电位都差一个常数，答案无法核对 → 先指定参考点（公共汇合点最省事），再逐段累加。
5. **以为 KCL/KVL 依赖元件** → 遇到非线性元件就不敢用 → 两条定律只依赖连接方式，与元件性质无关。
6. **在长线、高频下照用 KCL/KVL** → 结论与实际不符 → 分布参数电路要用传输线理论。
7. **默认电压与电流的参考方向关联** → 功率符号错 → 两者要分别判断，关联性决定 $P=\pm UI$。

## 自检

1. 一个电路有 5 个结点、8 条支路，独立 KCL 与独立 KVL 各几个？两者之和等于什么？
2. 沿一个回路走一圈，经过两个电源（一个从 − 到 +、一个从 + 到 −）和三个电阻。你能不看图就写出 KVL 的左端吗？
3. 你把参考点从 b 换成 a，$V_a$、$V_b$、$U_{ab}$ 各变了没有？为什么？

## 下一步

<Prereq id="series-parallel" /> → [03 · 串并联与电源等效变换](../02-methods/equivalent.md)
