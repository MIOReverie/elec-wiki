---
title: 05 · 集成运算放大电路
description: 差分对凭什么放大差模、无视共模，镜像电流源怎么给整片运放供偏置，虚短虚断的边界在哪，真实运放的误差账怎么算。
---

# 05 · 集成运算放大电路

<Meta time="50 min" level="核心" note="虚短虚断的成立条件是「负反馈 + 深反馈」：开环或正反馈时套上去是概念性错误；另一定频错误是双端与单端输出增益差 2 倍" />

热电偶给出的信号只有几十毫伏。它拖着的两根导线，同时感应了几十毫伏的工频干扰。两者混在一起，幅度相当。拿普通单管放大器去放，放大出来的一半是噪声。换成运放的两个输入端，一根线接一个，输出端几乎只剩那几十毫伏的有用信号。

原因不在运放有多灵敏，而在它的输入级只承认两根线之间的差值：同向的那部分干扰，被结构本身抵消掉了。这种同时兼顾两件事的能力，来自一个极简单的想法：把电路做成左右完全对称。

::: tip 读这页之前
只要会 KCL 与 KVL（<Prereq id="kcl" />、<Prereq id="kvl" />）、戴维南等效（<Prereq id="thevenin" />），知道三极管工作区与 $r_{be}$ 的来历（<Prereq id="bjt-regions" />、[上一页第 3 节](amplifiers.md)），差分对和电流源就能自己推。

符号：$u_{ID}$、$u_{IC}$ 是差模与共模输入电压；$\dot A_d$、$\dot A_c$ 是差模与共模电压增益；$\text{CMRR}$ 是共模抑制比；$I_O$ 是恒流源电流；$A_{od}$、$r_{id}$、$r_o$ 分别是开环增益、输入电阻、输出电阻；$V_{BE}$ 是发射结压降，硅管约 0.7 V；$V_T$ 是热电压，常温 26 mV；$u_+$、$u_-$ 是同相端、反相端电位。全部约定见[符号与约定](../guide/notation.md)，每个符号第一次出现时正文里还会再说一遍。

只需要对数，而且只在解释微电流源的一行里出现，不参与例题计算。不用复数，本页只做中频小信号，频率问题留给[第 3 章 · 放大电路的频率响应](frequency.md)。

三个术语先给一句话：差分放大是用两只参数相同的管子对称地放大两个输入之差的电路；镜像电流源是用一路基准电流复制出多路相同电流的电路；虚短虚断是运放在深度负反馈下的两条近似规则。
:::

::: tip 整页的骨架
集成运放内部就三段：差分输入级决定抗干扰能力，中间电压放大级决定增益，互补输出级决定带载能力，外加一条电流源链给三级供静态偏置。四节内容正好对这四块。抓住这张框图，参数表上几十个数就知道该归到哪一段。
:::

## 一、差分放大：把「差」挑出来的对称性

差分放大器（differential amplifier）的两个输入端 $u_{I1}$、$u_{I2}$，可以拆成一对搭档：**差模信号**（differential-mode signal）是两者之差，共模信号（common-mode signal）是两者的平均值：

$$
u_{ID}=u_{I1}-u_{I2}\ (\text{差模}),\qquad u_{IC}=\frac{u_{I1}+u_{I2}}{2}\ (\text{共模})
$$

这个分解不是数学游戏，它对应物理世界里的两件事。有用信号通常加在两线之间，也就是差模；干扰通常同时、同向地加到两根线上，比如 50 Hz 工频、地电位差、温度引起的两输入端同向漂移，那是共模。所以分辨差共，等于分辨信号与干扰。

反过来合成也成立，用上面两式解一下就有：

$$
u_{I1}=u_{IC}+\frac{u_{ID}}{2},\qquad u_{I2}=u_{IC}-\frac{u_{ID}}{2}
$$

任何一对输入都可以看成「一个共模分量，加一半差模在这边、减一半在那边」。整个差分电路的分析入口，就是这一句。

<FigBox title="差分电路的对称结构：差模一增一减，共模同增同减" kind="电路" note="两只管子 T₁、T₂ 参数完全相同，集电极各接一颗 R_C，发射极并起来通过「尾巴」（R_E 或恒流源 I_O）接地。差模输入使两管电流反向变化；共模输入使两管电流同向变化，尾巴上的电流跟着走。" >

<svg viewBox="0 0 520 320" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="60" y1="40" x2="460" y2="40"/>
<text x="260" y="22" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">两臂参数完全相同——对称性就是共模抑制的本钱</text>
<line x1="120" y1="40" x2="120" y2="72"/>
<g transform="translate(120 92) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="120" y1="112" x2="120" y2="134"/>
<text x="104" y="92" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_C</text>
<text x="120" y="28" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+V_CC</text>
<line x1="400" y1="40" x2="400" y2="72"/>
<g transform="translate(400 92) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="400" y1="112" x2="400" y2="134"/>
<text x="416" y="92" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_C</text>
<text x="104" y="134" text-anchor="end" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C₁</text>
<text x="416" y="134" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">C₂</text>
<line x1="30" y1="166" x2="104" y2="166"/>
<line x1="120" y1="150" x2="120" y2="182" stroke-width="2"/>
<line x1="120" y1="158" x2="160" y2="172"/>
<line x1="120" y1="174" x2="160" y2="188"/>
<line x1="160" y1="172" x2="160" y2="188" stroke-width="2"/>
<path d="M 152 185.5 L 160 188 L 154.5 181 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="24" y="166" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="33" y="176" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">I1</text>
<text x="176" y="206" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T₁</text>
<line x1="490" y1="166" x2="416" y2="166"/>
<line x1="400" y1="150" x2="400" y2="182" stroke-width="2"/>
<line x1="400" y1="158" x2="360" y2="172"/>
<line x1="400" y1="174" x2="360" y2="188"/>
<line x1="360" y1="172" x2="360" y2="188" stroke-width="2"/>
<path d="M 368 185.5 L 360 188 L 365.5 181 Z" fill="var(--vp-c-text-1)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="496" y="166" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="502" y="176" text-anchor="end" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">I2</text>
<text x="344" y="206" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T₂</text>
<line x1="160" y1="180" x2="160" y2="222"/>
<line x1="360" y1="180" x2="360" y2="222"/>
<circle cx="260" cy="222" r="4" class="sf-dot"/>
<line x1="160" y1="222" x2="260" y2="222"/>
<line x1="360" y1="222" x2="260" y2="222"/>
<text x="152" y="238" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">E</text>
<text x="368" y="238" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">E</text>
<line x1="260" y1="222" x2="260" y2="246"/>
<g transform="translate(260 266) rotate(90)">
<line x1="-20" y1="0" x2="-6" y2="0"/>
<rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none"/>
<line x1="6" y1="0" x2="20" y2="0"/>
</g>
<line x1="260" y1="286" x2="260" y2="300"/>
<line x1="230" y1="300" x2="290" y2="300" stroke-width="2.2"/>
<line x1="238" y1="307" x2="282" y2="307" stroke-width="1.8"/>
<line x1="246" y1="314" x2="274" y2="314" stroke-width="1.8"/>
<text x="226" y="266" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R_E</text>
<text x="300" y="266" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">或恒流源 I_O</text>
<text x="260" y="318" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">公共发射极的「尾巴」</text>
</svg>

</FigBox>

对称性为什么有用，把两半边分开看就明白。

差模输入时，$u_{I1}=+u_{ID}/2$、$u_{I2}=-u_{ID}/2$，T1 的电流增加、T2 的电流减小，一增一减。两个集电极电位反向变化，从两个集电极之间取出的电压就是两者之差，等于单边变化的两倍。

共模输入时，$u_{I1}=u_{I2}=u_{IC}$，两管电流同时增加，尾巴上的总电流随之增大，尾巴上的压降把两管的发射极电位一起顶高。这相当于给两管同时加了一股负反馈，把电流压回去，于是两个集电极电位同向变化。若从两个集电极之间取输出，也就是双端输出，两个相同的变化互相抵消，什么也不剩。

一个漂亮的分工就此落地：双端输出对差模有两倍增益，对共模增益为零。

能把这个「零」做到多小，全看尾巴。恒流源尾巴的交流电阻能做到 100 kΩ 以上，CMRR 于是被推到 70 dB 量级；换成分立电阻搭的尾巴，这个数立刻掉下来。

::: tip 例 1 · 长尾差分电路的增益与 CMRR {#ex-opamp-1}
题目：长尾差分电路，恒流源 $I_O=2$ mA（每管静态电流 $I_{CQ}=1$ mA）、$\beta=100$、$R_C=10\ \text{k}\Omega$，恒流源的交流等效电阻 $r_o=100\ \text{k}\Omega$。求双端与单端输出的差模增益、单端输出的共模增益，以及共模抑制比 CMRR。

<FigBox title="例 1 的关键：同一个尾巴，在两种激励下表现完全不同" kind="结构" note="差模激励：两管电流一增一减，尾巴里总电流不变，尾巴两端无交流压降，交流上可当接地。共模激励：两管电流同增同减，总电流变化是单管的两倍，尾巴上的压降把两管发射极一起顶高，形成负反馈，压低共模增益。" >

<svg viewBox="0 0 520 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="op-d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="op-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<text x="130" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">差模：一增一减</text>
<rect x="30" y="40" width="200" height="186" rx="8" stroke="var(--vp-c-brand-1)" stroke-width="1.8"/>
<line x1="70" y1="120" x2="190" y2="120" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<line x1="100" y1="120" x2="100" y2="170"/>
<line x1="160" y1="120" x2="160" y2="170"/>
<line x1="100" y1="170" x2="160" y2="170" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<circle cx="130" cy="170" r="4" class="sf-dot"/>
<line x1="130" y1="170" x2="130" y2="196"/>
<g transform="translate(130 208) rotate(90)">
<line x1="-14" y1="0" x2="-5" y2="0"/>
<rect x="-5" y="-5" width="10" height="10" rx="1.2" fill="none"/>
<line x1="5" y1="0" x2="14" y2="0"/>
</g>
<text x="148" y="208" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">r_o</text>
<path d="M 86 158 L 94 158" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#op-d)"/>
<path d="M 174 158 L 166 158" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#op-d)"/>
<text x="78" y="150" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">+ΔI</text>
<text x="182" y="150" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">−ΔI</text>
<text x="130" y="224" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">尾巴电流不变 ⇒ 交流接地</text>
<text x="390" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">共模：同增同减</text>
<rect x="290" y="40" width="200" height="186" rx="8" stroke-dasharray="5 4"/>
<line x1="330" y1="120" x2="450" y2="120" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<line x1="360" y1="120" x2="360" y2="170"/>
<line x1="420" y1="120" x2="420" y2="170"/>
<line x1="360" y1="170" x2="420" y2="170" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<circle cx="390" cy="170" r="4" class="sf-dot"/>
<line x1="390" y1="170" x2="390" y2="196"/>
<g transform="translate(390 208) rotate(90)">
<line x1="-14" y1="0" x2="-5" y2="0"/>
<rect x="-5" y="-5" width="10" height="10" rx="1.2" fill="none"/>
<line x1="5" y1="0" x2="14" y2="0"/>
</g>
<text x="408" y="208" text-anchor="start" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">r_o</text>
<path d="M 346 158 L 354 158" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#op-c)"/>
<path d="M 434 158 L 426 158" stroke="var(--vp-c-text-3)" stroke-width="2" marker-end="url(#op-c)"/>
<text x="338" y="150" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">+ΔI</text>
<text x="442" y="150" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">+ΔI</text>
<path d="M 384 190 L 396 190" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#op-d)"/>
<text x="404" y="196" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">2ΔI</text>
<text x="390" y="224" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">尾巴压降顶高发射极 ⇒ 负反馈</text>
<text x="260" y="246" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">双端输出：差模两倍的响应，共模两半抵消 → CMRR 就来自这张图的差别</text>
</svg>

</FigBox>

先猜什么：动作顺序是先静态，再 $r_{be}$，然后分差模、共模两种情况各算一次增益。为什么要分开算两次：两种模式下尾巴的表现完全不同。差模时两管电流一增一减，尾巴里的总电流不变、两端没有交流压降，可以当成接地；共模时总电流的变化是单管的两倍，尾巴上的压降实实在在，必须算进式子。

第一步，静态与 $r_{be}$。恒流源的 2 mA 被两管平分，所以每管 $I_{CQ}=1$ mA：

$$
r_{be}=300+(1+\beta)\frac{26\ \text{mV}}{I_{CQ}}=300+101\times\frac{26}{1}=2.93\ \text{k}\Omega
$$

第二步，差模增益（双端输出）。差模时两管的发射极在交流上就是接地点，理由见上，于是每半边都是一颗普通的共射管，增益 $-\beta R_C/r_{be}$；双端输出取两集电极之差，等于单边变化的两倍：

$$
\dot A_d=-\frac{\beta R_C}{r_{be}}=-\frac{100\times10\ \text{k}}{2.93\ \text{k}}=-341.8
$$

第三步，差模增益（单端输出）。只从某一个集电极取信号，另一半的变化白白浪费：

$$
\dot A_{d(\text{单端})}=-\frac{\beta R_C}{2r_{be}}=-170.9
$$

（这就是「双端与单端差 2 倍」这句话的来历。注意是把 $\beta R_C/r_{be}$ 里的分母乘 2，不是外面除以 2 之后再莫名其妙加负号。）

第四步，共模增益（单端输出）。共模时两管等效为并联，每管的发射极上串了 $2r_o$，因为总电流变化是单管的两倍，尾巴的折算电阻跟着翻倍：

$$
\dot A_c=-\frac{R_C}{2r_o}=-\frac{10\ \text{k}}{2\times100\ \text{k}}=-0.05
$$

这个数极小，意思是 1 V 的同相干扰在输出端只有 50 mV 不到的响应。

第五步，共模抑制比。CMRR（Common-Mode Rejection Ratio，共模抑制比）的定义是差模增益与共模增益的绝对值之比：

$$
\text{CMRR}=\left|\frac{\dot A_d}{\dot A_c}\right|=\frac{170.9}{0.05}=3418,\qquad 20\lg 3418=70.7\ \text{dB}
$$

这里用单端输出的 $\dot A_d$，因为 $\dot A_c$ 也是单端的，两者口径必须一致。分贝换算用 $20\lg$，因为 CMRR 是两个电压之比；功率比才用 $10\lg$（见[符号与约定](../guide/notation.md)第五节）。

对比实验：把恒流源换成普通 $R_E=10\ \text{k}\Omega$，共模增益变成

$$
\dot A_c=-\frac{R_C}{2R_E}=-\frac{10\ \text{k}}{2\times10\ \text{k}}=-0.5,\qquad \text{CMRR}=\frac{170.9}{0.5}=342\to50.7\ \text{dB}
$$

CMRR 从 70.7 dB 掉到 50.7 dB，差了整整 20 dB，也就是 10 倍。

验算：用定义反推。恒流源的交流电阻比 10 kΩ 电阻大了 10 倍，共模增益按比例也该小 10 倍，$-0.05$ 对 $-0.5$ ✓，CMRR 相应大 10 倍，3418 对 342 ✓。这条验算用的是 $\dot A_c$ 与 $r_o$ 的反比关系，同时说明一件事：长尾接近理想恒流源时，共模抑制也跟着变强。运放输入级非用恒流源不可，原因就在这儿。

最该带走的一句：CMRR 70 dB 意味着有用信号比同相干扰优先放大三千多倍。开头那个热电偶问题能被解决，数量依据就是这一条。
:::

这两个过程看不见摸不着。下面这个演示把任意一对输入实时拆成差模和共模两根条，各用一套增益算出输出。最有意思的是「信号+干扰」按钮：两输入端混进同一股干扰、中间只夹一点点有用信号，切到双端输出，干扰项直接消失。

<DemoBox title="差模与共模：一对输入怎么被拆开放大" hint="拖两个输入看差模/共模两根条怎么变；点「信号+干扰」按钮，看双端输出为什么对同相干扰免疫。">
<OpampDemo />
</DemoBox>

差模与共模分开了，可整套电路还需要一个稳定的偏置电流。

## 二、偏置：镜像电流源与微电流源

集成运放里为什么几乎见不到大电阻？答案在硅片工艺里：做一颗电阻占用的面积远大于做一颗管子，而且大电阻的绝对精度差、温度系数大。于是集成设计的第一原则是，用管子做电阻，用电流源代替电阻。

**镜像电流源**（current mirror）的工作方式很朴素。两只参数完全相同的管子，基极连在一起，发射极都接地，它们的 $V_{BE}$ 就相同，$I_B$ 相同，$I_C$ 自然也相同。左边那一路流多大电流，右边那一路就照镜子一样复制出多大电流。

<FigBox title="镜像电流源：一路基准复制出多路偏置" kind="电路" note="T₁、T₂ 参数相同且基极连在同一个节点上，所以 V_BE 相同 ⇒ I_C2 = I_C1。左边电阻 R 里的电流就是「基准」I_R，右边 T₂ 集电极输出的 I_C2 就是被复制出来的偏置电流。T₁ 自身的集电极与基极短接（接成二极管），为两管提供那个公共的 V_BE。" >

<svg viewBox="0 0 520 330" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="op-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="80" y1="40" x2="420" y2="40"/>
<text x="80" y="24" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+V_CC = 15 V</text>
<line x1="100" y1="40" x2="100" y2="46"/>
<rect x="94" y="46" width="12" height="24" rx="1.5" fill="none"/>
<line x1="100" y1="70" x2="100" y2="100"/>
<text x="86" y="58" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R = 15 kΩ</text>
<line x1="100" y1="100" x2="180" y2="100"/>
<path d="M 104 100 L 176 100" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#op-m)"/>
<text x="140" y="88" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">I</text>
<text x="147" y="97" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">R</text>
<line x1="180" y1="88" x2="340" y2="88"/>
<line x1="180" y1="88" x2="180" y2="100"/>
<circle cx="180" cy="100" r="4.5" class="sf-dot"/>
<text x="188" y="112" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">基准节点</text>
<line x1="216" y1="88" x2="216" y2="106"/>
<line x1="250" y1="88" x2="250" y2="98"/>
<line x1="340" y1="88" x2="340" y2="106"/>
<line x1="216" y1="106" x2="216" y2="142" stroke="var(--vp-c-text-1)" stroke-width="2.4"/>
<line x1="216" y1="110" x2="250" y2="98"/>
<line x1="216" y1="138" x2="250" y2="150"/>
<line x1="250" y1="98" x2="250" y2="150" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 241 148.5 L 250 150 L 244.5 143 Z" class="sf-solid"/>
<line x1="250" y1="150" x2="250" y2="254"/>
<text x="240" y="186" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T₁</text>
<text x="240" y="202" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">集电极接基极</text>
<line x1="340" y1="106" x2="340" y2="142" stroke="var(--vp-c-text-1)" stroke-width="2.4"/>
<line x1="340" y1="110" x2="374" y2="98"/>
<line x1="340" y1="138" x2="374" y2="150"/>
<line x1="374" y1="98" x2="374" y2="150" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<path d="M 365 148.5 L 374 150 L 368.5 143 Z" class="sf-solid"/>
<line x1="374" y1="150" x2="374" y2="254"/>
<text x="384" y="186" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">T₂</text>
<line x1="374" y1="98" x2="374" y2="64"/>
<line x1="374" y1="64" x2="470" y2="64"/>
<path d="M 380 64 L 462 64" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#op-m)"/>
<text x="404" y="50" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">I</text>
<text x="411" y="59" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">C2</text>
<text x="400" y="80" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">→ 供给各级偏置</text>
<line x1="180" y1="254" x2="420" y2="254"/>
<line x1="310" y1="254" x2="310" y2="266"/>
<line x1="298" y1="266" x2="322" y2="266" stroke-width="2.2"/>
<line x1="304" y1="273" x2="316" y2="273" stroke-width="1.8"/>
<line x1="309" y1="280" x2="311" y2="280" stroke-width="1.8"/>
<text x="164" y="200" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0 V</text>
<text x="278" y="118" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">基极相连 ⇒ V_BE 相同</text>
<text x="260" y="312" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">两管参数相同、V_BE 相同 ⇒ I_C2 = I_C1（T₁ 接成二极管，为两管提供公共 V_BE）</text>
</svg>

</FigBox>

::: tip 例 2 · 镜像电流源与微电流源 {#ex-opamp-2}
题目：$V_{CC}=15$ V、基准支路电阻 $R=15\ \text{k}\Omega$ 的镜像电流源，$\beta=100$。求基准电流 $I_{C1}$ 与输出电流 $I_{C2}$ 的粗略值与精确值。若改用微电流源，$R=100\ \Omega$ 与 $R=500\ \Omega$ 时各输出多少？

<FigBox title="例 2 的微电流源：电阻大一点，电流小一截" kind="曲线" note="横轴是 T₂ 发射极电阻 R，纵轴是解出的 I_C2。曲线下降得很陡，所以几十微安的偏置只需要几百欧的小电阻，这正是硅片上「用小电阻换小电流」的收益所在。" >

<svg viewBox="0 0 470 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<line x1="70" y1="200" x2="430" y2="200" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<line x1="70" y1="200" x2="70" y2="30" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="436" y="216" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R / Ω</text>
<text x="58" y="20" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">I_C2 / μA</text>
<polyline stroke="var(--vp-c-brand-1)" stroke-width="2.2" fill="none" points="90,54 110,66 130,78 150,90 170,101 190,112 210,122 230,132 250,141 270,150 290,158 310,166 330,173 350,180 370,186 390,192 410,197"/>
<line x1="140" y1="200" x2="140" y2="78" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3"/>
<circle cx="140" cy="78" r="4.5" fill="var(--vp-c-brand-1)" stroke="none"/>
<text x="150" y="70" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">R = 100 Ω → 300 μA</text>
<line x1="300" y1="200" x2="300" y2="162" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3"/>
<circle cx="300" cy="162" r="4.5" fill="var(--vp-c-brand-1)" stroke="none"/>
<text x="310" y="154" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">R = 500 Ω → 112 μA</text>
<text x="90" y="220" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0</text>
<text x="410" y="220" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">1 k</text>
<text x="62" y="54" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">900</text>
<text x="62" y="200" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">0</text>
<text x="250" y="242" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">方程 V_T·ln(I_C1 / I_C2) = I_C2·R 的解：电流随电阻快速下降</text>
</svg>

</FigBox>

先猜什么：关键在分清「粗略值」和「精确值」差在哪一项。粗略时认为两个管子的 $I_C$ 相等；精确时要把两个基极电流从基准里扣掉。为什么值得算两次：粗略值用来快速估算数量级，精确值用来判断误差能不能接受，$\beta$ 大一些，两者就更接近。

第一步，粗略值。$R$ 支路里两只管子的压降是 $V_{CC}-V_{BE}$：

$$
I_R=I_{C1}=\frac{V_{CC}-V_{BE}}{R}=\frac{15-0.7}{15\ \text{k}\Omega}=0.953\ \text{mA}
$$

由镜像关系，$I_{C2}\approx I_{C1}=0.953$ mA。

第二步，精确值。基准电流 $I_R$ 还要供给两个基极，$I_R=I_{C1}+2I_B$，而 $I_B=I_{C1}/\beta$，于是

$$
I_{C2}=I_{C1}=\frac{I_R}{1+2/\beta}=\frac{0.953}{1+2/100}=0.935\ \text{mA}
$$

相对粗略值的误差为 $\dfrac{2}{\beta}=2\%$。误差与 $\beta$ 成反比，$\beta$ 翻倍它就减半。

第三步，微电流源。想给输入级提供几十微安的小电流，用大电阻在硅片上太占地，几百 kΩ 的电阻要占一大块。微电流源（Widlar current source）换个办法：在 T2 的发射极串一个小电阻 $R$，利用两管 $V_{BE}$ 的差值来设定电流：

$$
V_T\ln\frac{I_{C1}}{I_{C2}}=I_{C2}R
$$

其中 $V_T\approx26$ mV 是热电压。这个方程里 $I_{C2}$ 两边都有，得数值求解：

| $R$ | 解出的 $I_{C2}$ | 说明 |
| --- | --- | --- |
| $100\ \Omega$ | $300\ \mu$A | 电阻小，电流较大 |
| $500\ \Omega$ | $112\ \mu$A | 电阻大一点，电流小一截 |

电阻大一点，电流小一截，而硅片上只花一点点面积，这就是微电流源的全部优势。

验算：把 $R=100\ \Omega$、$I_{C2}=300\ \mu$A 代回原方程。左边 $V_T\ln(I_{C1}/I_{C2})=26\ \text{mV}\times\ln(0.935\ \text{mA}/0.3\ \text{mA})=26\times\ln 3.12=26\times1.137=29.6$ mV；右边 $I_{C2}R=0.3\ \text{mA}\times100\ \Omega=30$ mV ✓。差 0.4 mV 是取整造成的。这条验算直接检查的是微电流源的定义方程本身。

集成运放内部几乎看不到大电阻，偏置全靠电流源链。它的内部设计和分立电路几乎对不上号，理由只有这一个。
:::

输入级有了，偏置也有了，于是可以把整块电路当成一个器件来用。

## 三、虚短与虚断：把运放当黑箱

$u_+=u_-$ 是真的吗？不是真的。但它是一个好到可以把误差忽略掉的近似，推导只有两行。运放的输出是

$$
u_o=A_{od}(u_+-u_-)
$$

其中 $A_{od}$（open-loop differential gain，开环差模增益：没有外接反馈时运放自身的电压放大倍数）典型值 $10^5\sim10^6$。把上式反解：

$$
u_+-u_-=\frac{u_o}{A_{od}}
$$

输出 10 V 时，$u_+-u_-=10/2\times10^5=0.05$ mV。相对 10 V 的输出，两输入端之间只差 0.05 mV，在绝大多数工程计算里这就是零。这就是**虚短**（virtual short：两输入端电压近似相等，像短路但并没有真的短接，$i=0$）。

同理，**虚断**（virtual open：两输入端电流近似为零）来自输入电阻 $r_{id}$ 极大，$10^{6}\sim10^{12}\ \Omega$，流进输入端的电流小到可以忽略。

一个运放有 2 个输入端、1 个输出端，两条法则说的就是输入端这一侧的事，必须同时成立：

1. 虚短：$u_+=u_-$（负反馈下）；
2. 虚断：$i_+=i_-=0$。

<FigBox title="虚短与虚断：两条法则各从哪条参数来" kind="结构" note="左：虚短来自开环增益 A_od 极大，有限的 u_o 除以巨大的 A_od，两输入端之间只剩微伏级残差。右：虚断来自输入电阻 r_id 极大，输入端几乎不取电流。两条合起来，运放的分析就退化为「两个节点方程」。" >

<svg viewBox="0 0 520 230" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<text x="140" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">虚短的来源</text>
<rect x="24" y="40" width="232" height="172" rx="8" stroke-dasharray="5 4"/>
<path d="M 90 70 L 290 70 L 290 190 L 90 190 Z" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
<path d="M 150 80 L 150 180" stroke="var(--vp-c-text-1)" stroke-width="1"/>
<text x="122" y="130" text-anchor="end" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
<text x="176" y="130" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">−</text>
<text x="194" y="62" text-anchor="start" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输出 u_o</text>
<text x="90" y="56" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">A_od = 2×10⁵</text>
<text x="140" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">u₊ − u₋ = u_o / A_od ≈ 0</text>
<text x="140" y="220" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">10 V 输出时两端只差 0.05 mV</text>

<text x="396" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">虚断的来源</text>
<rect x="280" y="40" width="232" height="172" rx="8" stroke-dasharray="5 4"/>
<line x1="300" y1="110" x2="360" y2="110"/>
<line x1="440" y1="110" x2="486" y2="110"/>
<rect x="360" y="86" width="80" height="48" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
<text x="400" y="110" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">r_id</text>
<text x="400" y="72" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">= 2 MΩ ~ 10¹² Ω</text>
<text x="316" y="96" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">i</text>
<text x="322" y="104" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">+</text>
<text x="396" y="156" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">i₊ = i₋ ≈ 0</text>
<text x="396" y="176" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输入端几乎不从信号源取流</text>
<text x="396" y="204" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">前提：负反馈 + 深反馈</text>
<text x="396" y="220" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">开环（比较器）时不成立</text>
</svg>

</FigBox>

::: warning 虚短的前提必须每次检查
虚短的推导用了「$u_o=A_{od}(u_+-u_-)$，而 $u_o$ 是有限值」这一步。只有负反馈闭环，输出才会稳定在某个有限值。若运放开环（比如当比较器用）或接成正反馈，输出直接打到正负饱和，此时 $u_+-u_-$ 可能相差好几伏，虚短完全不成立。两条法则及其成立条件的详细说明见 <Prereq id="virtual-short" />，[第 7 章 · 信号的运算和处理](signal-processing.md)所有公式都建立在这个前提上。
:::

::: tip 例 3 · 虚短虚断的三道题 {#ex-opamp-3}
题目：(a) 反相放大器 $R_1=10\ \text{k}\Omega$、$R_f=100\ \text{k}\Omega$、$u_i=1$ V，求 $u_o$ 与 $\dot A_{uf}$；(b) 同相放大器用同样两个电阻，求 $\dot A_{uf}$；(c) 加法器 $R_1=R_2=10\ \text{k}\Omega$、$R_f=20\ \text{k}\Omega$、$u_{i1}=1$ V、$u_{i2}=2$ V，求 $u_o$。

先猜什么：三道题共用一个动作，先用虚短把反相端的电位定下来，再用虚断对那个节点列 KCL。为什么按这个顺序：虚短给出一个已知电位，虚断给出「只有两条支路有电流」，两者合起来，一个含源器件的电路就退化成一个节点的 KCL。

(a) 反相放大器。同相端经电阻接地，虚断使该端无电流，所以 $u_+=0$；由虚短得 $u_-=0$。这个特殊情形叫**虚地**（virtual ground：电位等于 0 V、电流也等于 0 的节点，看起来像地却不是地）。

<FigBox title="(a) 反相放大器：虚地把电流全部逼进反馈支路" kind="电路" note="同相端接地，虚短使反相端 u₋ 也等于 0 V（虚地）；虚断使 i₁ 无法流进运放，只能全部流经 R_f。于是 u_o = −i₁R_f，负号来自电流方向。" >

<svg viewBox="0 0 520 300" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="op-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<path d="M 170 60 L 170 200 L 290 130 Z" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
<text x="184" y="106" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">−</text>
<text x="184" y="156" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
<text x="230" y="130" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A_od 很大</text>
<line x1="290" y1="130" x2="400" y2="130"/>
<text x="414" y="130" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="423" y="139" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<circle cx="234" cy="106" r="3.5" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<text x="248" y="98" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">u₋ = u₊</text>
<text x="30" y="106" text-anchor="start" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="37" y="115" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">i</text>
<line x1="52" y1="106" x2="52" y2="130"/>
<line x1="52" y1="130" x2="86" y2="130"/>
<g transform="translate(120 130)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="146" y1="130" x2="170" y2="130"/>
<text x="120" y="108" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="127" y="117" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">1</text>
<text x="120" y="154" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">10 kΩ</text>
<path d="M 56 106 L 142 106" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#op-b)"/>
<text x="78" y="94" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">i</text>
<text x="85" y="103" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">1</text>
<text x="158" y="112" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">虚地 0 V</text>
<circle cx="170" cy="130" r="4" class="sf-dot"/>
<line x1="170" y1="130" x2="170" y2="70"/>
<line x1="170" y1="70" x2="290" y2="70"/>
<g transform="translate(230 70)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="256" y1="70" x2="290" y2="70"/>
<text x="230" y="50" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<text x="237" y="59" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">f</text>
<text x="230" y="92" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">100 kΩ</text>
<path d="M 186 70 L 282 70" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#op-b)"/>
<text x="204" y="56" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">i</text>
<text x="211" y="65" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">1</text>
<line x1="290" y1="70" x2="290" y2="130"/>
<text x="300" y="166" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">u_o = −i₁R_f</text>
<line x1="170" y1="156" x2="110" y2="156"/>
<line x1="110" y1="156" x2="110" y2="240"/>
<line x1="96" y1="240" x2="124" y2="240" stroke-width="2.2"/>
<line x1="102" y1="247" x2="118" y2="247" stroke-width="1.8"/>
<line x1="107" y1="254" x2="113" y2="254" stroke-width="1.8"/>
<text x="92" y="228" text-anchor="end" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">同相端接地</text>
<text x="260" y="284" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">虚断：i₁ 进不了运放，只能全部流过 R_f；虚短：u₋ 被拉到 0 V</text>
</svg>

</FigBox>

在虚地节点列 KCL，虚断使流入运放的电流为零：

$$
i_1=\frac{u_i}{R_1}=\frac{1}{10\ \text{k}\Omega}=0.1\ \text{mA},\qquad u_o=-i_1R_f=-0.1\ \text{mA}\times100\ \text{k}\Omega=-10\ \text{V}
$$

$$
\dot A_{uf}=-\frac{R_f}{R_1}=-\frac{100}{10}=-10
$$

(b) 同相放大器。输入直接加到同相端，$u_+=u_i$；虚短使 $u_-=u_i$。$R_f$ 与 $R_1$ 构成的分压器，把输出电压的一部分送回反相端：

$$
u_-=u_o\frac{R_1}{R_1+R_f}=u_i\;\Rightarrow\;\dot A_{uf}=\frac{u_o}{u_i}=1+\frac{R_f}{R_1}=1+\frac{100}{10}=11
$$

(c) 加法器。两路输入各自经 $R_1$、$R_2$ 汇到虚地点，两路电流在虚地处相加，然后全部流经 $R_f$：

$$
u_o=-\left(\frac{u_{i1}}{R_1}+\frac{u_{i2}}{R_2}\right)R_f=-\left(\frac{1}{10\ \text{k}}+\frac{2}{10\ \text{k}}\right)\times20\ \text{k}=-6\ \text{V}
$$

加法不过就是电流相加。虚地点像一个电流汇合点，各路按自己的电阻贡献电流。

验算：(a) 用闭环增益反过来求 $u_+-u_-$：$u_o=-10$ V，$A_{od}=2\times10^5$，故 $u_+-u_-=-10/2\times10^5=-0.05$ mV ✓，这就是虚短的近似误差，相对 10 V 输出完全可以忽略。(c) 用叠加的思想独立复核：只有 $u_{i1}=1$ V 时输出 $-1\times20/10=-2$ V；只有 $u_{i2}=2$ V 时输出 $-2\times20/10=-4$ V；相加得 $-6$ V ✓。

三个电路的分析动作完全一样，虚短定电位，虚断列 KCL。公式不必背。
:::

两条法则都好用，可它们毕竟是近似。把近似和真实器件的差距算成一本账，就知道什么时候该认真。

## 四、理想与现实的差距账

理想运放的四条假设是 $A_{od}\to\infty$、$r_{id}\to\infty$、$r_o\to0$、带宽无限。真实的 $\mu$A741 是这样的：

| 参数 | 理想值 | $\mu$A741 典型值 | 主要影响 |
| --- | --- | --- | --- |
| 开环差模增益 $A_{od}$ | $\infty$ | $2\times10^5$（106 dB） | 闭环增益略偏离电阻比 |
| 输入电阻 $r_{id}$ | $\infty$ | $2\ \text{M}\Omega$ | 高阻信号源下产生误差 |
| 输出电阻 $r_o$ | $0$ | $75\ \Omega$ | 带载时增益下降 |
| 增益带宽积 GBD | $\infty$ | $1\ \text{MHz}$ | 增益与带宽成反比 |
| 输入失调电压 | $0$ | $1\ \text{mV}$ 量级 | 直流精度受它限制 |

开环增益约 100 dB，看上去大得没边。可它随频率一路下滑，这正是下面 GBD 那条约束的来历。

其中 GBD（Gain-Bandwidth Product，增益带宽积）是一条硬约束：$A_{od}\times f_{\text{带宽}}\approx\text{常数}$。闭环增益一高，可用带宽就窄，两者只能权衡。

::: tip 例 4 · 真实运放会造成多大误差 {#ex-opamp-4}
题目：用 $\mu$A741 搭一个放大 10 倍的反相放大器（$R_1=10\ \text{k}\Omega$、$R_f=100\ \text{k}\Omega$），$A_{od}=2\times10^5$、$r_o=75\ \Omega$、GBD$=1$ MHz。估算三件事：(a) 有限开环增益带来的闭环增益相对误差；(b) 驱动 $2\ \text{k}\Omega$ 负载时 $r_o$ 造成的增益损失；(c) 同相接法（增益 11）时的闭环带宽。

<FigBox title="例 4 的运放：理想符号背后藏着四个不理想参数" kind="电路" note="三角形是理想运放（A_od→∞、r_id→∞、r_o→0）。真实运放要在外面挂四个「不完美」：有限开环增益、有限输入电阻、非零输出电阻、有限带宽。本例逐项算它们各造成多少误差。" >

<svg viewBox="0 0 470 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<path d="M 150 60 L 150 160 L 250 110 Z" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.8"/>
<text x="164" y="88" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">−</text>
<text x="164" y="140" text-anchor="start" dominant-baseline="middle" font-size="13" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">+</text>
<text x="200" y="106" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">理想运放</text>
<line x1="90" y1="88" x2="150" y2="88"/>
<line x1="90" y1="140" x2="150" y2="140"/>
<circle cx="90" cy="88" r="3.5" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<circle cx="90" cy="140" r="3.5" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<text x="80" y="80" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">u₋</text>
<text x="80" y="152" text-anchor="end" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">u₊</text>
<line x1="210" y1="100" x2="240" y2="110" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<line x1="210" y1="120" x2="240" y2="110" stroke="var(--vp-c-text-1)" stroke-width="1.4"/>
<rect x="240" y="98" width="40" height="24" rx="3" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="4 3"/>
<text x="260" y="110" text-anchor="middle" dominant-baseline="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">r_o</text>
<line x1="280" y1="110" x2="330" y2="110"/>
<text x="342" y="110" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="351" y="119" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<line x1="100" y1="88" x2="100" y2="70"/>
<line x1="100" y1="70" x2="130" y2="70"/>
<line x1="100" y1="140" x2="100" y2="160"/>
<line x1="100" y1="160" x2="130" y2="160"/>
<rect x="112" y="82" width="28" height="46" rx="3" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="4 3"/>
<text x="126" y="105" text-anchor="middle" dominant-baseline="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">r_id</text>
<text x="330" y="150" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">r_o = 75 Ω</text>
<text x="330" y="168" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">r_id = 2 MΩ</text>
<text x="330" y="186" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A_od = 2×10⁵</text>
<text x="330" y="204" text-anchor="start" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">GBD = 1 MHz</text>
<line x1="60" y1="180" x2="150" y2="180" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="58" y="180" text-anchor="end" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">失调电压 ≈ 1 mV</text>
<text x="250" y="234" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">虚线框里的四件事，就是「理想运放」这四个字被省略掉的全部内容</text>
</svg>

</FigBox>

先猜什么：三个问题分别对应运放的三个不理想参数，办法是把理想公式里的那一步换成有限值，再看相对偏差。为什么用相对误差而不是绝对误差：运放参数随温度、随个体差异很大，厂家只给典型值，估算量级比算出精确数字有用得多。

(a) 有限开环增益的影响。负反馈理论给出闭环增益与开环增益的关系：实际闭环增益比理想值小一个因子 $1/(1+A_{od}F)$，其中 $F$ 是反馈系数（反馈网络送回输入端的比例）。本电路中反馈网络是 $R_1$、$R_f$ 构成的分压器：

$$
F=\frac{R_1}{R_1+R_f}=\frac{10}{10+100}=0.0909
$$

$$
\frac{1}{1+A_{od}F}=\frac{1}{1+2\times10^5\times0.0909}=\frac{1}{18190}=0.0055\%
$$

闭环增益误差只有十万分之五左右。工程上敢把 $A_{od}$ 当无穷大，靠的就是这个数。

(b) 输出电阻的影响。$r_o=75\ \Omega$ 与 $2\ \text{k}\Omega$ 负载串联分压，损失的比例是

$$
\frac{r_o}{r_o+R_L}=\frac{75}{75+2000}=3.6\%
$$

接上重负载后，增益会比空载低 3.6% 左右。

(c) 带宽限制。同相接法闭环增益为 11，由增益带宽积：

$$
f_{\text{BW}}=\frac{\text{GBD}}{A_{uf}}=\frac{1\ \text{MHz}}{11}=90.9\ \text{kHz}
$$

增益翻一倍，带宽就减半。选运放时，这条规则的实用性比参数表上任何一个数字都高。

验算：对 (c) 做一次交叉检查。同相放大器的反馈系数 $F=1/A_{uf}=1/11=0.0909$，而深度负反馈下闭环带宽近似为 $F\times\text{GBD}=0.0909\times1\ \text{MHz}=90.9$ kHz ✓，两种算法给出同一个数。这不是巧合：负反馈把带宽放大了 $(1+A_{od}F)$ 倍，把增益压小了同样的倍数，乘积守恒。

精密测量只有三条路：选低失调型号、调零、斩波稳零。把三种误差的量级记住，就知道什么时候该为运放多花钱。
:::

## 工程实例：一片运放是怎么被造出来的

一片运放的版图，就是这四块内容拼起来的：

- 输入级：PNP 差分对（耐压高、输入范围宽）或 NPN，尾端一个恒流源，是例 1、例 2 的硅片版；
- 电平移位：直接耦合会把电位一级一级往上抬，用 PNP 或电流源搬回中线；
- 中间级：达林顿加有源负载，一级拿下 60 dB 以上增益；内部至少 3 处用到电流源：输入级的尾巴、中间级的有源负载、输出级的偏置；
- 输出级：甲乙类互补（[第 4 章 · 功率放大电路](power-amp.md)）加限流保护，附过温关断；
- 频率补偿：内部一颗 30 pF 电容做主极点（[第 3 章 · 放大电路的频率响应](frequency.md)的波特图，加[第 6 章 · 放大电路中的反馈](feedback.md)的稳定性），保证单位增益闭环不自激，741 敢开深反馈还稳，靠的就是它。

<FigBox title="集成运放的内部框图：四块内容各占一段" kind="结构" note="信号从左到右流过差分输入级、中间电压放大级、互补输出级；偏置由底部的电流源链统一供给。本页四节正好对应这四块，记住这张图，运放数据手册就能读懂一半。" >

<svg viewBox="0 0 560 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="op-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<rect x="30" y="46" width="120" height="66" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8"/>
<text x="90" y="72" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">差分输入级</text>
<text x="90" y="92" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">高 CMRR · 抑制温漂</text>
<rect x="180" y="46" width="120" height="66" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="240" y="72" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">中间电压级</text>
<text x="240" y="92" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">有源负载 · 高增益</text>
<rect x="330" y="46" width="120" height="66" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<text x="390" y="72" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">互补输出级</text>
<text x="390" y="92" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">甲乙类 · 限流保护</text>
<rect x="200" y="140" width="200" height="42" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="5 4"/>
<text x="300" y="160" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">镜像 / 微电流源偏置链</text>
<line x1="150" y1="79" x2="178" y2="79" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#op-c)"/>
<line x1="300" y1="79" x2="328" y2="79" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#op-c)"/>
<line x1="450" y1="79" x2="500" y2="79" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#op-c)"/>
<text x="514" y="79" text-anchor="start" dominant-baseline="middle" font-size="12.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="523" y="87" text-anchor="start" dominant-baseline="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">o</text>
<line x1="8" y1="66" x2="28" y2="66"/>
<line x1="8" y1="92" x2="28" y2="92"/>
<text x="20" y="44" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="25" y="52" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">+</text>
<text x="20" y="114" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700 sf-it">u</text>
<text x="25" y="122" text-anchor="start" dominant-baseline="middle" font-size="8" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t">−</text>
<line x1="240" y1="112" x2="240" y2="138" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<line x1="390" y1="112" x2="390" y2="138" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text x="90" y="128" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">30 pF 补偿电容</text>
<text x="90" y="190" text-anchor="middle" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">↓ 偏置</text>
<text x="300" y="196" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">虚线：偏置送到各级；实线：信号通路</text>
</svg>

</FigBox>

## 易错清单

按踩坑频率从高到低排，每条格式是「错误做法 → 会得到什么 → 正确做法」。

1. 在开环或正反馈场合套用虚短 → 比较器输出已饱和，$u_+\ne u_-$ → 虚短的前提是负反馈加深反馈，判断反馈极性是第一步。
2. 把双端输出的公式套到单端输出上 → 增益算成两倍 → 单端 $\dot A_d=-\beta R_C/(2r_{be})$，双端是这个的两倍；口径要与 $\dot A_c$ 一致。
3. 以为虚短等于同一点，把两输入端用导线连起来分析 → 电路被短成错的拓扑 → 虚短只是 $u_+=u_-$、电流仍为零；虚断给的才是 $i_+=i_-=0$，两条必须同时用。
4. 共模输入范围不考虑 → 输入共模电压太高会把尾电流源推饱和、差分管退出放大区 → 选型时要确认输入共模范围覆盖信号的实际摆幅。
5. 镜像电流源精度当无穷 → 多路偏置不一致 → 精确值 $I_{C2}=I_{C1}/(1+2/\beta)$；高精度场合用威尔逊电流源或外接精密电阻。
6. 忘记 CMRR 用 $20\lg$ 而不是 $10\lg$ → dB 值差一倍 → CMRR 是两个电压之比。
7. 以为 CMRR 与负载无关 → 两输出端负载不匹配会破坏对称性 → 双端取值时两侧负载要对称。
8. 忽略增益带宽积 → 增益调到 100 倍后带宽只剩 10 kHz，波形被削 → 先按信号最高频率反推允许增益：$A_{uf}\le \text{GBD}/f_{\max}$。

## 自检

1. 若把例 1 的恒流源换成 $R_E=100\ \text{k}\Omega$，CMRR 大约是多少 dB？换成 $R_E=1\ \text{k}\Omega$ 呢？（提示：$\dot A_c=-R_C/(2r_o)$ 或 $-R_C/(2R_E)$。）
2. 一个放大 20 倍的同相放大器，用 GBD $=1$ MHz 的运放，可用带宽是多少？若改放大 2 倍呢？
3. 反相放大器里那个 $R_1$ 下端为什么接 GND 而不是悬空？如果把它接到 1 V 的参考电压上，输出会多出一个什么项？（提示：虚地点的电位不再是 0。）
4. 一片运放的 CMRR 标成 100 dB，换成比值是多少？若它的差模增益是 100，共模增益剩多少？
5. 741 的 GBD 只有 1 MHz。闭环增益调到 7 倍和 70 倍，可用带宽各剩多少？

## 下一步

运放本身讲完了。下一页给它接上不同的反馈网络，让它完成比例、加减、积分、滤波，那些公式全都是虚短虚断的排列组合。

<Prereq id="virtual-short" /> → [07 · 信号的运算和处理](signal-processing.md)
