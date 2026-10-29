---
title: 10 · 脉冲波形的产生与整形
description: 按键为什么会抖、施密特凭什么用两个阈值压住噪声、单稳态怎么把任意窄脉冲拉成定宽、多谐振荡器怎么凭空造出方波；555 的内部结构与三种接法，加 t=1.1RC 与 f=1.44/((R₁+2R₂)C) 两个公式、九张图与六道带验算的例题。
---

# 10 · 脉冲波形的产生与整形

<Meta time="45 min" level="核心" note="最容易错三处：把回差当成一个阈值；以为单稳态会被再次触发；忘了 555 的输出高电平不是 Vcc。" />

一颗机械按键接到 MCU 的引脚上，按一次，程序里进了七次中断。示波器一搭上去就明白了：那根线在 10 ms 内上下弹了十几回，金属触点真的在物理上弹跳。

再换一个。光电传感器接比较器，人走过去输出倒是变了，可同一次经过触发了五六次计数，因为光强是渐变的，信号在阈值附近反复横跳。

第三个更干脆：要一个 1 Hz 的心跳灯，手边只有电阻电容，没有晶振，也没有单片机。

三件事问的是三个不同的问题：波形不好看怎么办、宽度不确定怎么办、根本没有信号源怎么办。修波形用施密特触发器，定宽度用单稳态，造方波用多谐振荡器。而把这三样装在同一个八脚芯片里的，就是那颗叫 555 的器件。

::: tip 读这页之前
要会 RC 充放电与时间常数（<Prereq id="time-constant" />），知道触发器能记住一位（<Prereq id="flip-flop" />），也记得运放在非线性区不能用虚短（<Prereq id="virtual-short" />）、门电路有扇出限制（<Prereq id="gate-fanout" />）。这些忘了也能读下去，用到的地方会重说一遍。

符号先交代：$V_{CC}$ 是电源电压；$V_{TH}$ 是上阈值，输入升到它时输出翻转；$V_{TL}$ 是下阈值，输入降到它时输出翻回来；$\Delta V$ 是回差，$\Delta V=V_{TH}-V_{TL}$；$t_W$ 是脉宽，一个高电平持续多久；$T$ 与 $f$ 是周期与频率；$D$ 是占空比；$C$ 与 $R$ 是定时电容与定时电阻；$v_C$ 是电容两端的电压。全部约定见[符号与约定](../guide/notation.md)。

四个词各一句话：脉冲（pulse）是短暂存在一下的电压跳变，它只有高低两个取值，信息藏在什么时候跳、跳多久里；整形（wave shaping）是把不好看的波形修成边沿陡、宽度确定的标准方波；比较器（comparator）只回答谁大谁小，输出永远只有高低两种；正反馈（positive feedback）是把输出的一部分送回输入、并且帮着同方向使劲，它和[负反馈](../analog/feedback.md)相反，会让电路一路跑偏直到翻过去。

还要用一点对数：推脉宽与频率时要解 $e^{-t/\tau}$ 型的方程，用到 $\ln 2\approx0.693$ 与 $\ln 3\approx1.099$。不想推就直接拿结论，公式都给全了。
:::

::: tip 一句话抓住本质
这些电路都在做同一件事：拿电容电压的慢，去换输出电平的准。电容慢慢充，充到某个分数时比较器一翻，输出立刻跳，于是时间被折算成了电压。想通这一句，脉宽公式和频率公式都不用死记。
:::

## 一、三种毛病，三种药

脉冲波形出问题时，症状基本只有三类，处理办法完全不同，用错了就白搭：

| 症状 | 典型来源 | 该用什么 | 治好以后 |
| --- | --- | --- | --- |
| 边沿爬得慢、顶上带毛刺 | 传感器渐变信号、长线干扰、机械触点 | 施密特触发器 | 陡边沿，毛刺消失 |
| 脉冲太窄、宽度不定 | 按键、单次触发、干扰尖峰 | 单稳态电路 | 宽度固定、幅度标准的脉冲 |
| 根本没有脉冲 | 需要时钟却没有时钟源 | 多谐振荡器 | 连续的方波 |

第一个要解释的词是**施密特触发器**（Schmitt trigger）。它是带滞回的比较器：普通比较器只有一个阈值，施密特有两个。至于滞回是什么，下面专门讲，先记住它的效果：输出翻转之后，阈值会自己挪到另一个位置，把噪声挡在外面。

<FigBox title="三种毛病，三种药：先认症状再选电路" kind="波形" note="左边一列是病，中间是药，右边是治好以后的样子。三者的输入完全不同：第一行有输入但要修整，第二行有输入但太短，第三行压根没有输入。">

<svg viewBox="0 0 560 360" role="img" aria-label="三种脉冲问题与对应电路：缓慢带毛刺的边沿用施密特触发器修成陡边沿，窄而不定的脉冲用单稳态拉成定宽脉冲，无输入时用多谐振荡器产生连续方波">
<defs>
  <marker id="ps-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="16" y="16" font-size="10" fill="var(--vp-c-text-3)">病：输入长什么样</text>
  <text x="214" y="16" font-size="10" fill="var(--vp-c-text-3)">药：用什么电路</text>
  <text x="418" y="16" font-size="10" fill="var(--vp-c-text-3)">果：输出长什么样</text>
  <line x1="10" y1="26" x2="550" y2="26" stroke="var(--vp-c-divider)" stroke-width="1" />

  <text x="14" y="44" font-size="10">① 边沿爬得慢、顶上带毛刺</text>
  <line x1="14" y1="98" x2="158" y2="98" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="14,98 32,97 48,88 62,93 78,74 92,80 108,62 122,68 138,54 158,54" fill="none" stroke="#f59e0b" stroke-width="1.8" />
  <line x1="160" y1="76" x2="180" y2="76" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#ps-a)" />
  <rect x="182" y="56" width="120" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="242" y="81" text-anchor="middle" font-size="10.5">施密特触发器</text>
  <line x1="304" y1="76" x2="326" y2="76" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#ps-a)" />
  <line x1="328" y1="98" x2="546" y2="98" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="328,98 352,98 352,56 402,56 402,98 448,98 448,56 498,56 498,98 546,98" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="330" y="116" font-size="9.5" fill="var(--vp-c-text-3)">毛刺被走廊吞掉，边沿变陡</text>

  <line x1="10" y1="130" x2="550" y2="130" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="14" y="148" font-size="10">② 脉冲很窄、宽度每次都不一样</text>
  <line x1="14" y1="204" x2="158" y2="204" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="14,204 60,204 60,170 74,170 74,204 100,204 100,170 110,170 110,204 158,204" fill="none" stroke="#f59e0b" stroke-width="1.8" />
  <text x="66" y="222" font-size="9.5" fill="var(--vp-c-text-3)">两个窄脉冲，宽度还不一样</text>
  <line x1="160" y1="182" x2="180" y2="182" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#ps-a)" />
  <rect x="182" y="162" width="120" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="242" y="187" text-anchor="middle" font-size="10.5">单稳态电路</text>
  <line x1="304" y1="182" x2="326" y2="182" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#ps-a)" />
  <line x1="328" y1="204" x2="546" y2="204" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="328,204 360,204 360,166 424,166 424,204 460,204 460,166 524,166 524,204 546,204" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="330" y="222" font-size="9.5" fill="var(--vp-c-text-3)">两个一样宽的定宽脉冲</text>

  <line x1="10" y1="236" x2="550" y2="236" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="14" y="254" font-size="10">③ 什么输入都没有</text>
  <line x1="14" y1="308" x2="158" y2="308" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="14" y1="308" x2="158" y2="308" stroke="var(--vp-c-text-3)" stroke-width="1.6" stroke-dasharray="4 4" />
  <text x="52" y="326" font-size="9.5" fill="var(--vp-c-text-3)">无输入</text>
  <line x1="160" y1="286" x2="180" y2="286" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#ps-a)" />
  <rect x="182" y="266" width="120" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="242" y="291" text-anchor="middle" font-size="10.5">多谐振荡器</text>
  <line x1="304" y1="286" x2="326" y2="286" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#ps-a)" />
  <line x1="328" y1="308" x2="546" y2="308" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="328,308 352,308 352,268 386,268 386,308 420,308 420,268 454,268 454,308 488,308 488,268 522,268 522,308 546,308" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="330" y="326" font-size="9.5" fill="var(--vp-c-text-3)">自己一直振荡，等间隔方波</text>
</g>
</svg>

</FigBox>

三种电路的共同点值得点破：它们都在用「电容慢慢充放电」来度量时间。施密特不管时间，只管有没有越过门槛；单稳态和多谐则把电容的充电时间直接变成了脉宽与周期。

还有一组必须立起来的概念：双稳态、单稳态、无稳态（也叫多谐），分类依据是「有几个稳定状态」。

| 类型 | 稳定状态数 | 谁在干这个活 | 要不要外界触发 |
| --- | --- | --- | --- |
| 双稳态（bistable） | 2 个，高和低都稳得住 | [触发器](./flip-flops.md)、RS 锁存器 | 要，来一个沿才翻 |
| 单稳态（monostable） | 1 个，另一个是暂时待一会 | 本页的单稳态电路 | 要，来一次触发才输出一个脉冲 |
| 无稳态 / 多谐（astable） | 0 个，两个状态都待不住 | 多谐振荡器 | 不要，上电自己就开始振荡 |

「多谐」这个名字容易让人以为它跟谐波有关，其实它是 astable 的旧译：电路在两个状态之间来回翻，没有一个站得住，所以叫无稳态。555 的三种模式正好就是这张表的三行，它是少有的能同时干这三件事的通用芯片。

下面先把最常用、也最容易被忽略的那个讲透：施密特触发器。

## 二、施密特：两个阈值，一条走廊

### 滞回是什么

滞回（hysteresis）的字面意思是「滞后回不来」。翻译成电路行为只有一句：输出翻转之后，翻转门槛会跟着挪位置。

普通比较器只有一个门槛 $V_{ref}$，输入在它上方输出高，下方输出低。施密特触发器有两个：输入上升时要在 $V_{TH}$（上阈值）才翻，输入下降时要跌到 $V_{TL}$（下阈值）才翻回来。两者之差

$$
\Delta V = V_{TH} - V_{TL}
$$

就叫**回差**（也叫滞回宽度、迟滞电压）。下标 TH 来自 threshold（阈值），H 与 L 分别指 high 与 low。

一句话记住：输入升到 $V_{TH}$ 翻一次，降到 $V_{TL}$ 再翻回来，中间隔着 $\Delta V$。

回差的用处只有一条，但这一条顶得上大半节内容：只要噪声的峰峰值小于 $\Delta V$，输入在阈值附近怎么抖，输出都纹丝不动。因为输入一旦越过 $V_{TH}$，门槛立刻掉到 $V_{TL}$，噪声得先把信号拉回去整整 $\Delta V$ 那么远，才能再翻一次。

### 滞回是正反馈造出来的

滞回不是器件天生的属性，是接法造出来的。办法就是把输出的一部分送回比较器的输入端，而且送回去的方向要帮着同方向使劲，也就是正反馈。

循环是这样的：输入略微超过门槛，输出翻转，反馈把门槛往「不利于再翻回去」的方向挪，输入必须退得更远才能翻回来。这个循环一旦形成，一个阈值就变成了两个。

<FigBox title="滞回的传输特性：两个阈值围出一条走廊" kind="特性" note="横轴是输入、纵轴是输出。向右走沿下面的横线，到 V_TH 才跳上去；向左走沿上面的横线，到 V_TL 才跳下来。中间那块矩形就是噪声待着也安全的走廊，宽度就是回差 ΔV。">

<svg viewBox="0 0 470 300" role="img" aria-label="施密特触发器的滞回传输特性：输入上升在 V_TH 处翻转，输入下降在 V_TL 处翻转，中间形成矩形回环">
<defs>
  <marker id="ps-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <line x1="70" y1="230" x2="440" y2="230" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="70" y1="230" x2="70" y2="40" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="446" y="234" font-size="9.5" fill="var(--vp-c-text-3)">输入 u_i</text>
  <text x="70" y="32" font-size="9.5" fill="var(--vp-c-text-3)">输出 u_o</text>

  <line x1="70" y1="190" x2="440" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="62" y="186" text-anchor="end" font-size="9.5" fill="var(--vp-c-text-3)">低</text>
  <line x1="70" y1="90" x2="440" y2="90" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="62" y="86" text-anchor="end" font-size="9.5" fill="var(--vp-c-text-3)">高</text>

  <polyline points="70,190 270,190 270,90 440,90" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.4" marker-end="url(#ps-h)" />
  <polyline points="440,90 170,90 170,190 70,190" fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#ps-h)" />

  <line x1="270" y1="230" x2="270" y2="80" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="3 3" />
  <text x="270" y="248" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">V_TH（上升时翻）</text>
  <line x1="170" y1="230" x2="170" y2="80" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 3" />
  <text x="170" y="266" text-anchor="middle" font-size="10" fill="#f59e0b">V_TL（下降时翻）</text>

  <line x1="170" y1="150" x2="270" y2="150" stroke="var(--vp-c-text-2)" stroke-width="1.4" marker-end="url(#ps-h)" />
  <text x="220" y="143" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-2)">ΔV 回差</text>
  <text x="220" y="162" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">噪声小于它，输出不动</text>

  <text x="290" y="70" font-size="9.5" fill="var(--vp-c-brand-1)">上行：越过 V_TH 才跳高</text>
  <text x="86" y="212" font-size="9.5" fill="#f59e0b">下行：跌破 V_TL 才落回</text>
  <text x="86" y="286" font-size="9.5" fill="var(--vp-c-text-3)">箭头方向就是「滞」：去的时候走下面，回来的时候走上面</text>
</g>
</svg>

</FigBox>

看懂这张图，普通比较器与施密特的区别就一句话：普通比较器的传输特性是一条竖线，施密特的是一个矩形框。竖线没有宽度，噪声一碰就翻；矩形框有宽度 $\Delta V$，噪声在里面随便晃。

同一条叠了噪声的输入，喂给两种电路，结果差十几倍：

<FigBox title="同一个含噪输入：比较器翻 12 次，施密特翻 2 次" kind="波形" note="输入是 0~9 V 的三角波（周期 20 ms）叠上 1 kHz、±1.2 V 的噪声。普通比较器把阈值定在中点 4.5 V，噪声每次穿过它就翻一次；施密特用 6 V 与 3 V 两个阈值，噪声幅度远小于回差 3 V，输出干干净净。">

<svg viewBox="0 0 560 250" role="img" aria-label="含噪三角波输入分别送入普通比较器与施密特触发器的输出对比，前者多次误翻转，后者只有两次">
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="10" y="26" font-size="10" fill="var(--vp-c-text-3)">输入</text>
  <line x1="52" y1="60" x2="546" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="52,60 78,58 96,50 112,55 130,42 148,47 166,34 184,39 202,28 220,32 240,24 260,28 280,32 300,38 320,44 340,50 360,56 380,52 400,46 420,50 440,56 460,60 480,64 500,66 520,62 546,60" fill="none" stroke="#f59e0b" stroke-width="1.8" />
  <text x="60" y="20" font-size="9.5" fill="#f59e0b">锯齿（缓慢上升）+ 高频抖动</text>
  <line x1="52" y1="34" x2="546" y2="34" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="540" y="30" text-anchor="end" font-size="8.5" fill="var(--vp-c-text-3)">V_TH = 6 V</text>
  <line x1="52" y1="76" x2="546" y2="76" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="540" y="88" text-anchor="end" font-size="8.5" fill="var(--vp-c-text-3)">V_TL = 3 V</text>

  <line x1="10" y1="112" x2="550" y2="112" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="10" y="130" font-size="10" fill="var(--vp-c-text-3)">普通比较器</text>
  <line x1="52" y1="164" x2="546" y2="164" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="52,164 96,164 96,134 108,134 108,164 120,164 120,134 132,134 132,164 146,164 146,134 158,134 158,164 170,164 170,134 182,134 182,164 196,164 196,134 206,134 206,164 220,164 220,134 234,134 234,164 250,164 250,134 262,134 262,164 300,164 300,134 320,134 320,164 340,164 340,134 356,134 356,164 380,164 380,134 396,134 396,164 420,164 420,134 434,134 434,164 460,164 460,134 474,134 474,164 546,164" fill="none" stroke="#f43f5e" stroke-width="1.8" />
  <text x="300" y="182" font-size="9.5" fill="#f43f5e">在 4.5 V 附近反复横跳：一个周期翻 12 次</text>

  <line x1="10" y1="196" x2="550" y2="196" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="10" y="214" font-size="10" fill="var(--vp-c-text-3)">施密特</text>
  <line x1="52" y1="248" x2="546" y2="248" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="52,248 200,248 200,218 300,218 300,248 546,248" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <text x="300" y="240" font-size="9.5" fill="var(--vp-c-brand-1)">一个周期只翻 2 次</text>
</g>
</svg>

</FigBox>

波形看完就该算数了。555 自己就能当施密特用，而且阈值出厂就定死了。

::: tip 例 1 · 555 施密特模式的两个阈值，以及它能不能压住噪声 {#ex-pulse-1}
题目：555 接成施密特触发器（2 脚与 6 脚并在一起当输入），$V_{CC}=9$ V。求上阈值、下阈值与回差。若输入是 0~9 V 的三角波（周期 20 ms）叠上 1 kHz、$\pm1.2$ V 的噪声，判断输出会不会被噪声带翻；换成单阈值 4.5 V 的普通比较器又会怎样。

图见上面那张「比较器翻 12 次，施密特翻 2 次」的对照图。

先想什么：555 的两个阈值不是算出来的，是内部三个 5 kΩ 电阻分压定死的，不管外面接什么，上阈值永远是 $\frac23V_{CC}$、下阈值永远是 $\frac13V_{CC}$。所以第一步只做一次乘法。第二步判断噪声，比的不是噪声幅度与阈值，要比的是噪声峰峰值与回差，这是唯一正确的比法。

步骤：

1. 上阈值：$V_{TH}=\frac23V_{CC}=\frac23\times9=6$ V。*（为什么是 2/3：分压链上它下面还剩两个 5 kΩ，分到的是三分之二。）*
2. 下阈值：$V_{TL}=\frac13V_{CC}=\frac13\times9=3$ V。
3. 回差：$\Delta V=6-3=3$ V。
4. 噪声峰峰值 $=2\times1.2=2.4$ V，$2.4<3$，压得住。
5. 边界复核：三角波峰值为 9 V，减去噪声后最低仍有 $9-1.2=7.8$ V，稳稳高于 $V_{TH}=6$ V；谷值为 0 V，加上噪声后最高只有 $1.2$ V，稳稳低于 $V_{TL}=3$ V。所以在峰和谷附近噪声也够不着阈值。

验算（数值积分，步长 1 µs 扫一个完整周期）：

- 普通比较器（单阈值 4.5 V）：一周期内输出翻转 12 次；
- 施密特（6 V / 3 V）：一周期内输出翻转 2 次，正好是「上升翻一次、下降翻一次」的理想值 ✓。

为什么这题值得算两遍：普通比较器翻 12 次，意味着一次经过被数成 6 个人。而输入停留在 $4.5\pm1.2$ V 这条走廊里的时间只有 $10\ \text{ms}\times\dfrac{2.4}{9}=2.67$ ms，约 2.7 个噪声周期，就这 2.7 个周期，输出已经抖了六下。把噪声幅度降到 $\pm0.4$ V 也没救：数值积分给出的比较器翻转次数降到 4 次，仍然是施密特（恒为 2 次）的两倍。
:::

### 用运放搭：反相型施密特

555 的阈值是死的，想要别的阈值就得自己搭。标准做法是一只运放（或专用比较器）加两只电阻，接法和[模拟电子 07 章](../analog/signal-processing.md)例 4 同款。

反相型施密特的接法是：输入 $u_i$ 接到反相端（$-$），输出经 $R_1$ 反馈到同相端（$+$），同相端再经 $R_2$ 接地。同相端的电压由输出分压决定：

$$
u_+ = \frac{R_2}{R_1+R_2}\,u_o
$$

阈值如下，其中 $U_Z$ 是输出被限幅后的幅度，例如用稳压管钳位在 $\pm6$ V：

$$
V_{TH}=+\frac{R_2}{R_1+R_2}U_Z,\qquad V_{TL}=-\frac{R_2}{R_1+R_2}U_Z,\qquad \Delta V=2\cdot\frac{R_2}{R_1+R_2}U_Z
$$

<FigBox title="反相型施密特：两只电阻定死回差" kind="结构" note="输入进反相端，输出经 R₁ 回灌到同相端、R₂ 把同相端拉向地。输出为 +U_Z 时同相端是 +kU_Z，输入得升到它之上才能把输出压下去；输出翻成 −U_Z 后同相端也跟着变负，输入得退到 −kU_Z 以下才翻回来。">

<svg viewBox="0 0 520 250" role="img" aria-label="反相型施密特触发器电路：运放反相端接输入，输出经 R1 反馈至同相端，R2 接地">
<defs>
  <marker id="ps-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="10" y="72" font-size="10" fill="var(--vp-c-text-3)">u_i</text>
  <line x1="34" y1="68" x2="150" y2="68" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ps-c)" />
  <polygon points="150,34 200,84 150,134" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="164" y="80" font-size="9.5">−</text>
  <text x="164" y="98" font-size="9.5">+</text>
  <text x="176" y="112" font-size="9" fill="var(--vp-c-text-3)">运放</text>
  <line x1="200" y1="84" x2="258" y2="84" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ps-c)" />
  <text x="262" y="80" font-size="10" fill="var(--vp-c-brand-1)">u_o = ±U_Z</text>

  <line x1="240" y1="84" x2="240" y2="176" stroke="var(--vp-c-brand-1)" stroke-width="1.3" />
  <line x1="150" y1="176" x2="240" y2="176" stroke="var(--vp-c-brand-1)" stroke-width="1.3" />
  <rect x="150" y="164" width="46" height="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="173" y="180" text-anchor="middle" font-size="9.5">R₁</text>
  <line x1="150" y1="176" x2="150" y2="150" stroke="var(--vp-c-brand-1)" stroke-width="1.3" />
  <circle cx="150" cy="140" r="3" fill="var(--vp-c-brand-1)" />
  <line x1="150" y1="140" x2="150" y2="124" stroke="var(--vp-c-brand-1)" stroke-width="1.3" />

  <line x1="150" y1="176" x2="150" y2="212" stroke="var(--vp-c-text-2)" stroke-width="1.3" />
  <rect x="150" y="188" width="46" height="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="173" y="204" text-anchor="middle" font-size="9.5">R₂</text>
  <line x1="150" y1="212" x2="150" y2="230" stroke="var(--vp-c-text-2)" stroke-width="1.3" />
  <line x1="136" y1="230" x2="164" y2="230" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="120" y="234" font-size="9.5" fill="var(--vp-c-text-3)">地</text>

  <text x="280" y="150" font-size="10.5">同相端电压：</text>
  <text x="280" y="170" font-size="11" fill="var(--vp-c-brand-1)">u₊ = R₂/(R₁+R₂) · u_o</text>
  <text x="280" y="196" font-size="10.5" fill="var(--vp-c-brand-1)">V_TH = +k·U_Z，V_TL = −k·U_Z</text>
  <text x="280" y="214" font-size="10.5" fill="var(--vp-c-text-2)">回差 ΔV = 2k·U_Z（k = R₂/(R₁+R₂)）</text>
  <text x="280" y="240" font-size="9.5" fill="var(--vp-c-text-3)">改两只电阻的比值就能改回差，改 U_Z 也能改</text>
</g>
</svg>

</FigBox>

::: tip 例 2 · 反相型施密特：回差要按噪声来定，不是一味求大 {#ex-pulse-2}
题目：输出经稳压管限幅在 $\pm U_Z=\pm6$ V，$R_1=30\ \text{k}\Omega$（输出到同相端）、$R_2=20\ \text{k}\Omega$（同相端到地）。输入是 $\pm5$ V 的三角波（周期 20 ms）叠上 1 kHz、$\pm1.5$ V 的噪声。① 求两个阈值与回差；② 判断输出会不会误翻；③ 若把 $R_1$ 换成 40 kΩ、$R_2$ 换成 10 kΩ，结果如何？

图见上面那张接法图。

先想什么：这是一道先算静态、再判动态的题。阈值只由电阻比与限幅值决定，与输入波形毫无关系，所以不要一上来就去画波形。判据只有一条：**噪声峰峰值与回差比大小**。噪声峰峰值 $=3$ V，这是全题的标尺。

步骤：

1. 反馈系数 $k=\dfrac{R_2}{R_1+R_2}=\dfrac{20}{30+20}=0.4$。*（为什么分子是 $R_2$：被分压取出来的是「同相端到地」那一段，也就是 $R_2$ 上的电压。）*
2. $V_{TH}=+0.4\times6=+2.4$ V，$V_{TL}=-2.4$ V，回差 $\Delta V=4.8$ V。
3. 噪声峰峰值 $2\times1.5=3.0$ V $<4.8$ V，压得住，输出每周期只翻 2 次。
4. 换电阻后 $k=\dfrac{10}{40+10}=0.2$，得 $V_{TH}=+1.2$ V、$V_{TL}=-1.2$ V，回差只有 $2.4$ V。此时 $2.4<3.0$，噪声比回差还大，会误翻。

验算（数值积分，步长 1 µs，扫一个 20 ms 周期）：

| 方案 | 阈值 | 回差 | 噪声峰峰 | 一周期翻转次数 |
| --- | --- | --- | --- | --- |
| 单阈值比较器（0 V） | 0 V | 0 V | 3.0 V | 12 次 |
| 施密特 $R_1{:}R_2=30{:}20$ | $\pm2.4$ V | 4.8 V | 3.0 V | 2 次 ✓ |
| 施密特 $R_1{:}R_2=40{:}10$ | $\pm1.2$ V | 2.4 V | 3.0 V | 4 次 ✗ |

另外做一条自洽检查：回差 4.8 V 时，输入峰值为 $5$ V，能达到 $V_{TH}=2.4$ V ✓（否则根本翻不了，电路变成了永远不动作）。这就是回差不能无限加大的原因：回差大，抗噪能力强，但比回差还小的信号就再也检测不到了。

这道题的教训：回差拿灵敏度换抗噪能力，**调得过大反而更迟钝**。设计时的正确顺序是，先量出噪声峰峰值，再让 $\Delta V$ 比它大出 50% 以上，而不是先把电阻随手抓一对。
:::

现成的带滞回反相器（74HC14 那一类）省事，但它的两个阈值是跟着电源电压走的，手册给的是典型值，做产品时要按最坏情况留余量。

波形好不好看，施密特管。剩下两个问题，宽度不定和没有信号源，都要靠电容充电来度量时间，而 555 是干这事最省事的芯片。

## 三、555：三个 5 kΩ、两个比较器、一只放电管

555 是个模数混血的器件：内部是模拟的比较器和分压电阻，输出却是干净的数字电平。名字就来自内部那三个串联的 $5\ \text{k}\Omega$ 电阻，三个 5，555。拆开看，里面只有 3 只 5 kΩ 电阻、2 个比较器、1 个 RS 触发器、1 只放电管，剩下的都是引脚和缓冲。三只电阻每只各分到三分之一，所以分压链上正好出现 $2/3V_{CC}$ 与 $\frac13V_{CC}$ 两个节点。

<FigBox title="555 内部：分压链给出两个电平，比较器盯着两个输入" kind="结构" note="三个 5 kΩ 串在 Vcc 与地之间，分出 2/3Vcc 与 1/3Vcc。上面那只比较器 C1 盯 TH（6 脚）：TH 超过 2/3Vcc 就把 RS 触发器复位，输出变低、放电管导通。下面那只 C2 盯 TR（2 脚）：TR 低于 1/3Vcc 就把触发器置位，输出变高、放电管关断。">

<svg viewBox="0 0 560 350" role="img" aria-label="555 定时器内部结构：三个 5 千欧电阻分压、上下两个比较器、RS 触发器、输出缓冲与放电管">
<defs>
  <marker id="p5m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <line x1="60" y1="26" x2="330" y2="26" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <text x="336" y="30" font-size="9.5">Vcc（8 脚）</text>
  <line x1="76" y1="26" x2="76" y2="56" stroke="var(--vp-c-text-2)" stroke-width="1.8" />

  <rect x="66" y="56" width="20" height="56" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <rect x="66" y="122" width="20" height="56" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <rect x="66" y="188" width="20" height="56" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="92" y="88" font-size="9">5 kΩ</text>
  <text x="92" y="154" font-size="9">5 kΩ</text>
  <text x="92" y="220" font-size="9">5 kΩ</text>
  <line x1="76" y1="244" x2="76" y2="292" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <line x1="40" y1="292" x2="520" y2="292" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <text x="10" y="296" font-size="9.5">GND（1 脚）</text>

  <circle cx="76" cy="122" r="3.2" fill="var(--vp-c-brand-1)" />
  <text x="10" y="118" font-size="9.5" fill="var(--vp-c-brand-1)">2/3 Vcc</text>
  <polyline points="76,122 128,122 128,88 150,88" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#p5m)" />
  <circle cx="76" cy="188" r="3.2" fill="var(--vp-c-brand-1)" />
  <text x="10" y="192" font-size="9.5" fill="var(--vp-c-brand-1)">1/3 Vcc</text>
  <line x1="76" y1="188" x2="150" y2="188" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#p5m)" />

  <text x="6" y="116" font-size="9.5" fill="var(--vp-c-text-3)">TH（6 脚）</text>
  <line x1="52" y1="112" x2="150" y2="112" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5m)" />
  <polygon points="152,74 202,102 152,130" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
  <text x="158" y="90" font-size="9">+</text>
  <text x="158" y="116" font-size="9">−</text>
  <text x="174" y="108" font-size="9.5">C1</text>
  <polyline points="202,102 228,102 228,144 248,144" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.4" marker-end="url(#p5m)" />
  <text x="206" y="96" font-size="8.5" fill="var(--vp-c-text-3)">TH&gt;2/3Vcc → 复位</text>

  <text x="6" y="216" font-size="9.5" fill="var(--vp-c-text-3)">TR（2 脚）</text>
  <line x1="52" y1="212" x2="150" y2="212" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5m)" />
  <polygon points="152,174 202,202 152,230" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
  <text x="158" y="190" font-size="9">−</text>
  <text x="158" y="216" font-size="9">+</text>
  <text x="174" y="208" font-size="9.5">C2</text>
  <polyline points="202,202 228,202 228,166 248,166" fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.4" marker-end="url(#p5m)" />
  <text x="206" y="238" font-size="8.5" fill="var(--vp-c-text-3)">TR&lt;1/3Vcc → 置位</text>

  <rect x="250" y="132" width="94" height="50" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="297" y="152" text-anchor="middle" font-size="10.5">RS 触发器</text>
  <text x="297" y="170" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">Q / Q̄</text>
  <text x="244" y="140" font-size="9">R</text>
  <text x="244" y="170" font-size="9">S</text>
  <line x1="297" y1="118" x2="297" y2="132" stroke="var(--vp-c-text-3)" stroke-width="1.3" marker-end="url(#p5m)" />
  <text x="301" y="112" font-size="9">R̄D（4 脚）</text>

  <line x1="344" y1="146" x2="382" y2="146" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#p5m)" />
  <rect x="384" y="128" width="52" height="36" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="410" y="150" text-anchor="middle" font-size="9">缓冲</text>
  <line x1="436" y1="146" x2="500" y2="146" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#p5m)" />
  <text x="504" y="150" font-size="9.5" fill="var(--vp-c-brand-1)">OUT（3 脚）</text>

  <polyline points="344,168 366,168 366,228 390,228" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#p5m)" />
  <rect x="392" y="206" width="66" height="44" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="425" y="233" text-anchor="middle" font-size="9.5">放电管</text>
  <line x1="458" y1="228" x2="500" y2="228" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#p5m)" />
  <text x="504" y="232" font-size="9.5" fill="var(--vp-c-brand-1)">DIS（7 脚）</text>
  <line x1="425" y1="250" x2="425" y2="292" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />

  <text x="392" y="270" font-size="9" fill="var(--vp-c-text-3)">Q̄ 控制放电管：</text>
  <text x="392" y="284" font-size="9" fill="var(--vp-c-text-3)">输出低 → 导通 → 电容放电</text>

  <line x1="14" y1="316" x2="546" y2="316" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="14" y="336" font-size="9.5" fill="var(--vp-c-text-3)">CV（5 脚）接在 2/3Vcc 那个节点上：外加一个电压就能把上阈值改掉，不用时可以并一只 10 nF 到地防干扰</text>
</g>
</svg>

</FigBox>

八个脚按顺序背也容易：1 脚地、2 脚触发、3 脚输出、4 脚复位、5 脚控制电压、6 脚阈值、7 脚放电、8 脚电源。一张表说清各自的分工：

| 脚号 | 名称 | 作用 | 不用时怎么处理 |
| --- | --- | --- | --- |
| 1 | GND | 地 | 必接 |
| 2 | TR（触发） | 低于 $\frac13V_{CC}$ 时置位，输出变高 | 接 $V_{CC}$（保持无效） |
| 3 | OUT（输出） | 推挽输出，高电平约 $V_{CC}-1.5$ V | 必接负载 |
| 4 | $\overline{R_D}$（复位） | 低电平强制输出为低，优先级最高 | 接 $V_{CC}$ |
| 5 | CV（控制电压） | 外接电压可改上阈值 | 经 10 nF 接地 |
| 6 | TH（阈值） | 高于 $\frac23V_{CC}$ 时复位，输出变低 | 与 2 脚并接（施密特模式） |
| 7 | DIS（放电） | 内部放电管的集电极，导通时把电容拉向地 | 单稳与多谐模式必接 |
| 8 | $V_{CC}$ | 电源，4.5~15 V（NE555） | 必接，旁并 0.1 µF |

实验箱上通常只给一路 5 V 电源，555 在这个电压下工作得很好，这也是它进教材的原因之一。

三条内部规则要先记牢，后面所有工作模式都是它们的组合：

1. TH $>\frac23V_{CC}$，触发器复位，OUT 变低、放电管导通；
2. TR $<\frac13V_{CC}$，触发器置位，OUT 变高、放电管关断；
3. $\overline{R_D}$ 为低，无条件清 0，与上面两条无关。

外面接几只电阻电容，同一个芯片就能变成三种电路：

<FigBox title="同一颗 555，三种接法" kind="结构" note="单稳态：一个 R 一个 C，2 脚当触发，6、7 脚并在一起接电容。多谐：两个电阻一个电容，2、6 脚并接电容，7 脚插在两电阻之间。施密特：2、6 脚并起来当输入，别的都不用接。">

<svg viewBox="0 0 560 300" role="img" aria-label="555 的三种工作模式接法：单稳态、多谐振荡器与施密特触发器">
<defs>
  <marker id="p5b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="16" y="18" font-size="10.5" fill="var(--vp-c-brand-1)">① 单稳态</text>
  <line x1="76" y1="26" x2="76" y2="34" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <rect x="58" y="34" width="36" height="26" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.3" />
  <text x="76" y="51" text-anchor="middle" font-size="9">R</text>
  <line x1="76" y1="60" x2="76" y2="76" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="62" y1="88" x2="90" y2="88" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <line x1="62" y1="95" x2="90" y2="95" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <text x="96" y="96" font-size="9">C</text>
  <line x1="76" y1="95" x2="76" y2="112" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="76" y="126" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">地</text>
  <circle cx="76" cy="76" r="2.6" fill="var(--vp-c-brand-1)" />
  <line x1="76" y1="76" x2="140" y2="76" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#p5b)" />
  <line x1="76" y1="76" x2="140" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#p5b)" />
  <rect x="142" y="46" width="60" height="44" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="172" y="73" text-anchor="middle" font-weight="700">555</text>
  <line x1="202" y1="60" x2="240" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#p5b)" />
  <text x="244" y="56" font-size="9">OUT</text>
  <line x1="16" y1="34" x2="56" y2="34" stroke="var(--vp-c-text-2)" stroke-width="1.4" marker-end="url(#p5b)" />
  <text x="12" y="30" font-size="9" fill="var(--vp-c-text-3)">触发</text>
  <line x1="34" y1="34" x2="34" y2="60" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="34" y1="60" x2="140" y2="60" stroke="var(--vp-c-text-2)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#p5b)" />
  <text x="66" y="24" font-size="8.5" fill="var(--vp-c-text-3)">6、7 脚 → C</text>
  <text x="16" y="146" font-size="9" fill="var(--vp-c-text-3)">来一次触发，出一个定宽脉冲</text>

  <line x1="10" y1="160" x2="550" y2="160" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />

  <text x="16" y="180" font-size="10.5" fill="var(--vp-c-brand-1)">② 多谐振荡器</text>
  <line x1="76" y1="188" x2="76" y2="196" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <rect x="58" y="196" width="36" height="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.3" />
  <text x="76" y="212" text-anchor="middle" font-size="9">R₁</text>
  <line x1="76" y1="220" x2="76" y2="228" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <circle cx="76" cy="228" r="2.6" fill="var(--vp-c-brand-1)" />
  <line x1="76" y1="228" x2="140" y2="228" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#p5b)" />
  <text x="100" y="222" font-size="8.5" fill="var(--vp-c-brand-1)">DIS</text>
  <rect x="58" y="234" width="36" height="24" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.3" />
  <text x="76" y="250" text-anchor="middle" font-size="9">R₂</text>
  <line x1="76" y1="258" x2="76" y2="266" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <circle cx="76" cy="266" r="2.6" fill="var(--vp-c-brand-1)" />
  <line x1="76" y1="266" x2="140" y2="266" stroke="var(--vp-c-brand-1)" stroke-width="1.2" marker-end="url(#p5b)" />
  <line x1="62" y1="278" x2="90" y2="278" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <line x1="62" y1="284" x2="90" y2="284" stroke="var(--vp-c-text-2)" stroke-width="1.8" />
  <text x="96" y="285" font-size="9">C</text>
  <line x1="76" y1="284" x2="76" y2="296" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <rect x="142" y="212" width="60" height="44" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="172" y="239" text-anchor="middle" font-weight="700">555</text>
  <line x1="202" y1="228" x2="240" y2="228" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#p5b)" />
  <text x="244" y="224" font-size="9">OUT</text>
  <text x="250" y="252" font-size="9" fill="var(--vp-c-brand-1)">自己一直振荡，不用触发</text>
  <text x="250" y="268" font-size="9" fill="var(--vp-c-text-3)">充电走 R₁+R₂，放电只走 R₂</text>
  <text x="250" y="284" font-size="9" fill="var(--vp-c-text-3)">→ 公式里出现 2R₂，占空比 &gt; 50%</text>

  <text x="330" y="88" font-size="10.5" fill="var(--vp-c-brand-1)">③ 施密特触发器</text>
  <line x1="322" y1="130" x2="386" y2="130" stroke="var(--vp-c-text-2)" stroke-width="1.5" marker-end="url(#p5b)" />
  <text x="316" y="126" font-size="9">输入</text>
  <rect x="388" y="108" width="60" height="44" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="418" y="135" text-anchor="middle" font-weight="700">555</text>
  <line x1="448" y1="130" x2="500" y2="130" stroke="var(--vp-c-brand-1)" stroke-width="1.5" marker-end="url(#p5b)" />
  <text x="504" y="134" font-size="9">OUT</text>
  <text x="388" y="170" font-size="9" fill="var(--vp-c-text-3)">2、6 脚并起来当输入：</text>
  <text x="388" y="184" font-size="9" fill="var(--vp-c-text-3)">升过 2/3Vcc 输出变低，</text>
  <text x="388" y="198" font-size="9" fill="var(--vp-c-text-3)">跌破 1/3Vcc 输出变高，</text>
  <text x="388" y="212" font-size="9" fill="var(--vp-c-brand-1)">回差固定为 1/3Vcc</text>
  <text x="388" y="236" font-size="9" fill="var(--vp-c-brand-1)">注意是反相的：输入越高，</text>
  <text x="388" y="250" font-size="9" fill="var(--vp-c-brand-1)">输出反而越低</text>
</g>
</svg>

</FigBox>

三种模式认清之后，下面两节分别算它们的数。先看最容易理解也最常用的单稳态，555 接成它只要 1 只电阻加 1 只电容。

## 四、单稳态：一次触发，一个定宽脉冲

**单稳态电路**（monostable multivibrator，也叫 one-shot）在上面那张分类表里是第二行：只有一个稳定状态。平时它安静地待在输出低电平上，电容被放电管短接在地；来一个触发脉冲，它翻到高电平并开始计时，计满 $t_W$ 自动翻回来。触发一次只出一个脉冲，中间再来多少次触发都不理，这个性质叫**不可重触发**（non-retriggerable），也是最容易踩的坑。

计时靠电容充电：触发之后放电管关断，$V_{CC}$ 通过 $R$ 给 $C$ 充电，电容电压从 0 按指数往 $V_{CC}$ 爬，这条曲线本身就是<Prereq id="time-constant" />里那条 RC 指数曲线：

$$
v_C(t)=V_{CC}\left(1-e^{-t/RC}\right)
$$

爬到 $\frac23V_{CC}$ 时，TH 脚越过上阈值，触发器复位，输出落下、放电管导通，电容瞬间被放光。所以脉宽就是 $v_C$ 从 0 爬到 $\frac23V_{CC}$ 所需的时间：

$$
V_{CC}\left(1-e^{-t_W/RC}\right)=\frac23V_{CC}
\ \Rightarrow\ e^{-t_W/RC}=\frac13
\ \Rightarrow\ t_W=RC\ln 3\approx1.099\,RC\approx1.1RC
$$

工程上就用 $t_W\approx1.1RC$ 这一个式子，它只在「电容从 0 起步、阈值停在 $\frac23V_{CC}$」这两个前提下成立。

这个 1.1 就是 $\ln 3$：1.1 与 $\ln3$ 只差 0.1%，在 1 kΩ 到 1 MΩ 的常用范围里都够准，可以放心用。要记住的是它的含义：脉宽只由 $R$ 和 $C$ 决定，与触发信号有多宽、有多脏完全无关，只要触发够窄、够低。

<FigBox title="单稳态时序：触发一下，电容慢慢充，充到 2/3Vcc 输出就落下" kind="时序" note="第一行是触发脉冲（必须是窄的负脉冲）；第二行是电容电压，从 0 按指数爬到 2/3Vcc 后被放电管瞬间放光；第三行是输出。脉宽 t_W 就是电容充电段的长度，与触发脉冲的宽度无关。">

<svg viewBox="0 0 560 270" role="img" aria-label="555 单稳态时序图：触发负脉冲、电容充电曲线与输出定宽脉冲">
<defs>
  <marker id="p5w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)" />
  </marker>
</defs>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="8" y="60" font-size="10" fill="var(--vp-c-text-3)">TR 触发</text>
  <line x1="72" y1="52" x2="546" y2="52" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="72,38 118,38 118,58 150,58 150,38 546,38" fill="none" stroke="#f59e0b" stroke-width="2" />
  <text x="126" y="74" font-size="9" fill="#f59e0b">负脉冲</text>
  <text x="160" y="30" font-size="9" fill="var(--vp-c-text-3)">触发必须窄于 t_W，否则输出会被拉长</text>

  <line x1="8" y1="90" x2="552" y2="90" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="136" font-size="10" fill="var(--vp-c-text-3)">v_C</text>
  <line x1="72" y1="182" x2="546" y2="182" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="72" y1="136" x2="546" y2="136" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="546" y="132" text-anchor="end" font-size="9" fill="var(--vp-c-text-3)">2/3 Vcc</text>
  <polyline points="118,182 161,168 204,157 247,150 290,145 333,142 376,140 419,139 462,138 505,137.6 546,137.5" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <circle cx="546" cy="137.5" r="3" fill="var(--vp-c-brand-1)" />
  <text x="430" y="152" font-size="9" fill="var(--vp-c-brand-1)">指数爬升，永远到不了 Vcc</text>
  <text x="8" y="200" font-size="9" fill="var(--vp-c-text-3)">0 V</text>

  <line x1="8" y1="212" x2="552" y2="212" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="240" font-size="10" fill="var(--vp-c-text-3)">OUT</text>
  <line x1="72" y1="256" x2="546" y2="256" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="72,256 118,256 118,228 546,228" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <line x1="118" y1="268" x2="546" y2="268" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5w)" />
  <line x1="546" y1="268" x2="118" y2="268" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5w)" />
  <text x="300" y="264" text-anchor="middle" font-size="10" fill="var(--vp-c-text-2)">t_W = 1.1 RC</text>
</g>
</svg>

</FigBox>

::: tip 例 3 · 555 单稳态的脉宽与取值 {#ex-pulse-3}
题目：555 接成单稳态，$R=91\ \text{k}\Omega$、$C=10\ \mu\text{F}$。求输出脉宽 $t_W$；若需要一个 5 s 左右的定时、$C$ 仍用 $10\ \mu\text{F}$，$R$ 该取多大？触发脉冲最宽允许多少？

图见上面那张时序图。

先想什么：只有一个公式 $t_W\approx1.1RC$，所以三问都是同一个式子的三种用法，正算、反算，再加上「触发脉宽必须小于 $t_W$」这条约束。第二问要注意，反算出来的值往往不是标称阻值，得就近取一个标称值再回代验一次。

步骤：

1. $\tau=RC=91\times10^3\times10\times10^{-6}=0.91$ s。
2. $t_W=1.1\times0.91=1.001$ s $\approx1.0$ s。*（为什么先算 $\tau$ 再乘：这样量纲先落定成秒，不容易把 kΩ 与 µF 的换算搞错。）*
3. 精确值核对：$\tau\ln3=0.91\times1.0986=0.9997$ s。与 1.1 那个系数算出的 1.001 s 只差 $0.13\%$，所以 1.1 是 $\ln3$ 的合格近似 ✓。
4. 反算 5 s：$R=\dfrac{t_W}{1.1C}=\dfrac{5}{1.1\times10\times10^{-6}}=4.545\times10^5\ \Omega\approx455\ \text{k}\Omega$。取标称 470 kΩ，回代得 $t_W=1.1\times470\times10^3\times10\times10^{-6}=5.17$ s。
5. 触发脉冲宽度上限：$t_W$ 本身，本题是 1.0 s，也就是说触发端必须先于输出结束回到高电平。

验算：$C$ 从 0 充到 $\frac23V_{CC}$ 的时间按定义为 $RC\ln\dfrac{1}{1-\frac23}=RC\ln3=0.9997$ s，与第 2 步的 1.001 s 一致 ✓。量纲检查：$\text{k}\Omega\times\mu\text{F}=10^3\times10^{-6}=10^{-3}$，乘出来就是毫秒量级，$91\times10=910$ ms，与 0.91 s 对得上 ✓。

这道题的教训在第 4 步：算出来 455 kΩ、实际取 470 kΩ，这才是真实工程的常态。电解电容的容差常常是 $\pm20\%$，就算电阻取到 0.1% 精度，$t_W$ 也会飘到 4.1~6.2 s。凡是对定时精度有要求的场合，555 都不是正确答案，要精确延时请用[单片机的定时器](../embedded/timer-pwm.md)或晶振分频。
:::

单稳态会定时，但它自己不会开始。下一个电路不需要任何人推一把，上电就自己振荡。

## 五、多谐振荡器：自己给自己打拍子

**多谐振荡器**（astable multivibrator）在分类表里是第三行：两个状态都不稳定，所以电路在它们之间自动来回翻，输出一串方波。555 接成这个模式时，外面挂 2 只电阻和 1 只电容，电容在 $\frac13V_{CC}$ 与 $\frac23V_{CC}$ 之间来回充放电，两条路径不一样长，这就是全部关键：

- 充电：$V_{CC}\to R_1\to R_2\to C$，路径电阻 $R_1+R_2$，电容从 $\frac13V_{CC}$ 爬到 $\frac23V_{CC}$；
- 放电：$C\to R_2\to$ 放电管 $\to$ 地，路径电阻只有 $R_2$，电容从 $\frac23V_{CC}$ 落到 $\frac13V_{CC}$。

两段都是指数走到一半，所以各自耗时都是 $\ln 2$ 个时间常数：

$$
t_{高}=0.693\,(R_1+R_2)C,\qquad t_{低}=0.693\,R_2C
$$

加起来就是周期，取倒数就是频率：

$$
T=t_{高}+t_{低}=0.693\,(R_1+2R_2)C,\qquad
f=\frac{1}{T}\approx\frac{1.44}{(R_1+2R_2)C}
$$

（$1/0.693=1.4427$，教材里也常写 1.43，两者差 0.7%，不影响选型。）书上的 $f\approx\dfrac{1.44}{(R_1+2R_2)C}$ 就是这样来的：分母里的 $R_1+2R_2$ 是充放电两条路径的加权和，$R_1$ 出现一次、$R_2$ 出现两次。

占空比（duty cycle，记作 $D$）的定义是高电平时间占整个周期的比例：

$$
D=\frac{t_{高}}{T}=\frac{R_1+R_2}{R_1+2R_2}
$$

因为**分子永远比分母少一个 $R_2$**，而 $R_1$ 又不能取 0（有人真试过把 $R_1$ 短掉，结果放电管一导通就把电源灌进地）（那样放电管会把 $V_{CC}$ 直接短路到地），所以 $D$ 恒大于 50%，555 的多谐振荡器做不出对称方波，50% 这条线只能从上边逼近。

<FigBox title="多谐振荡器时序：锯齿上来是充电，下去是放电" kind="时序" note="上面是电容电压，在 1/3Vcc 与 2/3Vcc 之间来回；下面是输出方波，充电段为高、放电段为低。两段长度不同，所以占空比永远偏向高电平那一侧。">

<svg viewBox="0 0 600 250" role="img" aria-label="555 多谐振荡器的电容锯齿波与输出方波时序图，标出充电段、放电段与周期">
<defs>
  <marker id="p5d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-2)" />
  </marker>
</defs>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="8" y="30" font-size="10" fill="var(--vp-c-text-3)">v_C</text>
  <line x1="56" y1="46" x2="592" y2="46" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="592" y="42" text-anchor="end" font-size="9" fill="var(--vp-c-text-3)">2/3 Vcc</text>
  <line x1="56" y1="80" x2="592" y2="80" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 3" />
  <text x="592" y="94" text-anchor="end" font-size="9" fill="var(--vp-c-text-3)">1/3 Vcc</text>
  <line x1="56" y1="116" x2="592" y2="116" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="8" y="120" font-size="9" fill="var(--vp-c-text-3)">0</text>

  <polyline points="60,86.7 105,79.2 150,73.0 195,67.8 240,63.3 271,70.8 302,77.0 332,82.3 363,86.7 408,79.2 453,73.0 498,67.8 543,63.3 570,68.5 592,74.0" fill="none" stroke="#f59e0b" stroke-width="2.2" />
  <text x="120" y="60" font-size="9" fill="#f59e0b">充电（走 R₁+R₂）</text>
  <text x="248" y="60" font-size="9" fill="var(--vp-c-text-3)">放电（只走 R₂）</text>
  <text x="400" y="60" font-size="9" fill="#f59e0b">充电</text>

  <line x1="8" y1="140" x2="592" y2="140" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="166" font-size="10" fill="var(--vp-c-text-3)">OUT</text>
  <line x1="56" y1="196" x2="592" y2="196" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="56,196 60,196 60,166 240,166 240,196 363,196 363,166 543,166 543,196 592,196" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.4" />

  <line x1="60" y1="216" x2="240" y2="216" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5d)" />
  <line x1="240" y1="216" x2="60" y2="216" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5d)" />
  <text x="150" y="212" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-2)">t_高</text>
  <line x1="240" y1="216" x2="363" y2="216" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5d)" />
  <line x1="363" y1="216" x2="240" y2="216" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5d)" />
  <text x="300" y="212" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-2)">t_低</text>
  <line x1="60" y1="234" x2="363" y2="234" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#p5d)" />
  <line x1="363" y1="234" x2="60" y2="234" stroke="var(--vp-c-brand-1)" stroke-width="1.3" marker-end="url(#p5d)" />
  <text x="210" y="230" text-anchor="middle" font-size="9.5" fill="var(--vp-c-brand-1)">T = t_高 + t_低</text>

  <text x="400" y="212" font-size="9" fill="var(--vp-c-brand-1)">D = t_高/T = (R₁+R₂)/(R₁+2R₂)</text>
  <text x="400" y="228" font-size="9" fill="var(--vp-c-text-3)">充电路径永远多一个 R₁，所以 D 恒大于 50%</text>
</g>
</svg>

</FigBox>

::: tip 例 4 · 555 多谐振荡器的频率与占空比 {#ex-pulse-4}
题目：555 接成多谐振荡器，$R_1=4.7\ \text{k}\Omega$、$R_2=10\ \text{k}\Omega$、$C=0.1\ \mu\text{F}$。求 $t_{高}$、$t_{低}$、周期 $T$、频率 $f$ 与占空比 $D$。

图见上面那张时序图。

先想什么：先分清哪一段走几个电阻，这是全题唯一的难点。充电经过 $R_1+R_2$，放电只有 $R_2$。记不住的时候就顺着电流走一遍路径，别硬背公式。

步骤：

1. $t_{高}=0.693\times(4.7+10)\times10^3\times0.1\times10^{-6}=1.019$ ms。
2. $t_{低}=0.693\times10\times10^3\times0.1\times10^{-6}=0.693$ ms。
3. $T=1.019+0.693=1.712$ ms，故 $f=\dfrac{1}{1.712\times10^{-3}}=584$ Hz。
4. 用频率公式交叉核对：$f=\dfrac{1.44}{(R_1+2R_2)C}=\dfrac{1.44}{(4.7+20)\times10^3\times0.1\times10^{-6}}=\dfrac{1.44}{2.47\times10^{-3}}=583$ Hz。
5. $D=\dfrac{R_1+R_2}{R_1+2R_2}=\dfrac{14.7}{24.7}=59.5\%$；用时间核对：$\dfrac{1.019}{1.712}=59.5\%$。

验算：三条独立路径互相对齐，由周期算频率得 584 Hz、由频率公式得 583 Hz（差 0.2%，来自 1.44 与 $1/0.693=1.4427$ 的取位）、由电阻比与时间比算出的占空比都是 59.5% ✓。再做一次精确推导：$t_{高}=(R_1+R_2)C\ln\dfrac{V_{CC}-\frac13V_{CC}}{V_{CC}-\frac23V_{CC}}=(R_1+R_2)C\ln2=1.019$ ms，与第 1 步一致 ✓，0.693 就是 $\ln 2$，不是凑出来的系数。

延伸一步：$D=59.5\%$ 说明高电平比低电平长 47%。要对称方波，这个接法做不到。常见办法是在 $R_2$ 上并一只二极管把充放电路径分开，此时充电只走 $R_1$、放电只走 $R_2$，$D=\dfrac{R_1}{R_1+R_2}$ 就能自由调到 50%。代价是频率公式也跟着变，要重算。
:::

公式与波形都齐了，最后把它们放回真实电路里看一眼。

## 六、工程实例：去抖、触摸、PWM、红外

### 1. 按键去抖

机械按键闭合时，金属触点会在几毫秒到十几毫秒内物理弹跳。一个单阈值输入会把这十几次弹跳全部当成按了十几次。单稳态的解法很直接：让第一次弹跳触发一个比抖动时间更长的脉冲，后面的弹跳全被忽略。

<FigBox title="按键去抖：用一个比抖动更长的脉冲盖住所有弹跳" kind="时序" note="上面是按键的直接电平，10 ms 内上下弹跳十几次；中间是单稳态的输出，只出一个干净的定宽脉冲；下面是把它接进计数器或 MCU 中断后的效果，一次按下只算一次。">

<svg viewBox="0 0 560 240" role="img" aria-label="按键抖动波形经单稳态整形后变成单个干净脉冲">
<defs>
  <marker id="p5k" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="8" y="34" font-size="10" fill="var(--vp-c-text-3)">按键</text>
  <line x1="66" y1="60" x2="546" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="66,60 100,60 100,36 108,36 108,60 116,60 116,36 126,36 126,60 134,60 134,36 142,36 142,60 152,60 152,36 160,36 160,60 170,60 170,36 178,36 178,60 186,60 186,36 194,36 194,60 300,60 300,36 546,36" fill="none" stroke="#f43f5e" stroke-width="1.8" />
  <text x="200" y="76" font-size="9" fill="#f43f5e">触点在 10 ms 内弹跳十几次</text>
  <text x="320" y="76" font-size="9" fill="var(--vp-c-text-3)">然后稳定闭合</text>

  <line x1="8" y1="94" x2="552" y2="94" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="124" font-size="10" fill="var(--vp-c-text-3)">整形后</text>
  <line x1="66" y1="150" x2="546" y2="150" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="66,150 100,150 100,120 300,120 300,150 546,150" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <line x1="100" y1="164" x2="300" y2="164" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5k)" />
  <line x1="300" y1="164" x2="100" y2="164" stroke="var(--vp-c-text-2)" stroke-width="1.3" marker-end="url(#p5k)" />
  <text x="200" y="160" text-anchor="middle" font-size="9.5" fill="var(--vp-c-text-2)">t_W = 20 ms（盖住抖动）</text>
  <text x="310" y="146" font-size="9" fill="var(--vp-c-brand-1)">一次按下，一个脉冲</text>

  <line x1="8" y1="182" x2="552" y2="182" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="212" font-size="10" fill="var(--vp-c-text-3)">计数</text>
  <text x="80" y="212" font-size="11" fill="#f43f5e">整形前：+13 次</text>
  <text x="240" y="212" font-size="11" fill="var(--vp-c-brand-1)">整形后：+1 次</text>
  <text x="8" y="234" font-size="9" fill="var(--vp-c-text-3)">注意：人手按住往往有 100 ms 以上，远长于 t_W，所以触发端要先微分（串一个小电容）只取按下的那一瞬间</text>
</g>
</svg>

</FigBox>

::: tip 例 5 · 按键去抖的单稳态取值 {#ex-pulse-5}
题目：按键抖动持续约 10 ms，要求输出一个约 20 ms 的干净脉冲。取 $C=1\ \mu\text{F}$，求 $R$；并说明「人手按住 100 ms 不放」时会发生什么。

图见上面那张时序图。

先想什么：这是唯一一道先提需求再选元件的题，所以顺序反过来，由 $t_W$ 反算 $R$。另外必须额外想一件事：单稳态不可重触发，而人手按住的时间远长于 $t_W$，所以触发端不能长期停留在低电平。

步骤：

1. 由 $t_W=1.1RC$ 反算：$R=\dfrac{20\times10^{-3}}{1.1\times1\times10^{-6}}=1.818\times10^4\ \Omega\approx18.2\ \text{k}\Omega$。取标称 18 kΩ。
2. 回代：$t_W=1.1\times18\times10^3\times1\times10^{-6}=19.8$ ms $\approx20$ ms ✓，且 $19.8>10$ ms，盖得住抖动 ✓。
3. 若取 22 kΩ，则 $t_W=1.1\times22\times10^3\times10^{-6}=24.2$ ms，也够用，只是响应稍慢。
4. 按住 100 ms 的问题：触发端会持续为低超过 $t_W$，输出被强制维持在高电平（555 的 TR 长期有效会让输出一直高），松手后才落下，得到的是一个 100 ms 的长脉冲，而不是 20 ms。

验算：$19.8\ \text{ms} > 10\ \text{ms}$（抖动时间）✓；$19.8\ \text{ms} < 100\ \text{ms}$（人手按住时间），所以触发端必须加微分 ✓。量纲：$18\ \text{k}\Omega\times1\ \mu\text{F}=18$ ms，乘 1.1 得 19.8 ms ✓。

正确的接法：在按键与 2 脚之间串一只小电容（例如 10 nF）配一个上拉电阻，把长低电平微分成一个窄负脉冲，这样无论按多久，送进 2 脚的都是按下瞬间的一个尖。这就是为什么去抖电路里总能看到一只看起来多余的电容。现代设计里这一步更常被软件接管（检测到按键后延时 20 ms 再读一次），但硬件去抖在 MCU 没上电、或要求上电即可靠动作的场合仍不可替代。
:::

### 2. 触摸开关

触摸开关不用施密特也能做，但用了才好用。手指靠近时感应到的电压是缓慢漂移的，工频 50 Hz 感应、人体电阻变化都在里面，普通比较器会在阈值附近疯狂翻转，灯就闪。典型结构是一条链：

1. 触摸片接高阻输入级（MOS 管栅极或运放同相端），人体感应出毫伏到伏级的缓慢变化；
2. 施密特触发器（74HC14 这种带滞回的反相器最省事，不想加芯片也可以用 555 的施密特模式）把漂移整成一次干净的翻转；
3. 单稳态把这次翻转变成一个定宽脉冲（例如 3 s），驱动继电器或 LED；
4. 输出级用三极管或 MOS 管驱动负载，555 的 OUT 本身就能拉灌 200 mA，小继电器甚至可以直接挂上去。

### 3. PWM 粗调

PWM（pulse width modulation，脉冲宽度调制）在[08 章](./ad-da.md)已讲过：用通断时间的比例来表达一个连续量，平均值等于占空比乘高电平。555 多谐振荡器天生就是个 PWM 发生器，把 $R_2$ 换成电位器，转动它就改变占空比。

但标准接法的占空比被锁在 50% 以上，调光时会发现灯永远关不干净。加一只二极管把充放电路径分开之后，充电只经 $R_1$、放电只经 $R_2$，$D=\dfrac{R_1}{R_1+R_2}$ 可以从接近 0 一路调到接近 100%。算过一遍就清楚：$R_1=2\ \text{k}\Omega$、$R_2=18\ \text{k}\Omega$ 时 $D=10\%$（灯很暗）；$R_1=R_2=10\ \text{k}\Omega$ 时 $D=50\%$，这已经是这条路的中间点；再往下调就轮到二极管登场了。

用在电机或加热丝这类惯性负载上时，PWM 频率要选在人耳听觉之外（>20 kHz）才不会啸叫；而 555 的上限只有几百 kHz，且占空比与频率互相牵扯。真要做 PWM，还是用 MCU 的定时器（[07 · 定时器与 PWM](../embedded/timer-pwm.md)）。

### 4. 红外遥控

38 kHz 是行业里定下来的约定，接收头的带通滤波就按它做。电视遥控器发射的不是直流脉冲，是一串被 38 kHz 方波调制过的脉冲。接收头（如 VS1838B）内部有带通滤波，只认 38 kHz 附近的载波，这个设计让日光、灯光这些直流或低频干扰进不来。555 多谐振荡器是产生这个载波最便宜的办法。

<FigBox title="红外遥控：38 kHz 载波被门控成一段一段的脉冲串" kind="时序" note="上面是 555 自己振荡出来的 38 kHz 载波；中间是 MCU 给出的门控信号（要发 1 就开一段时间）；下面是实际驱动红外管的波形，载波只在门控为高时才发出去。">

<svg viewBox="0 0 560 220" role="img" aria-label="38 kHz 载波被门控信号调制后驱动红外发射管">
<g font-size="10.5" fill="var(--vp-c-text-1)">
  <text x="8" y="34" font-size="10" fill="var(--vp-c-text-3)">载波</text>
  <line x1="66" y1="58" x2="546" y2="58" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="66,58 72,58 72,34 78,34 78,58 84,58 84,34 90,34 90,58 96,58 96,34 102,34 102,58 108,58 108,34 114,34 114,58 120,58 120,34 126,34 126,58 132,58 132,34 138,34 138,58 144,58 144,34 150,34 150,58 156,58 156,34 162,34 162,58 168,58 168,34 174,34 174,58 180,58 180,34 186,34 186,58 192,58 192,34 198,34 198,58 204,58 204,34 210,34 210,58 216,58 216,34 222,34 222,58 228,58 228,34 234,34 234,58 240,58 240,34 246,34 246,58 252,58 252,34 258,34 258,58 264,58 264,34 270,34 270,58 276,58 276,34 282,34 282,58 288,58 288,34 294,34 294,58 300,58 300,34 306,34 306,58 312,58 312,34 318,34 318,58 324,58 324,34 330,34 330,58 336,58 336,34 342,34 342,58 348,58 348,34 354,34 354,58 360,58 360,34 366,34 366,58 372,58 372,34 378,34 378,58 384,58 384,34 390,34 390,58 396,58 396,34 402,34 402,58 408,58 408,34 414,34 414,58 420,58 420,34 426,34 426,58 432,58 432,34 438,34 438,58 444,58 444,34 450,34 450,58 456,58 456,34 462,34 462,58 468,58 468,34 474,34 474,58 480,58 480,34 486,34 486,58 492,58 492,34 498,34 498,58 504,58 504,34 510,34 510,58 516,58 516,34 522,34 522,58 528,58 528,34 534,34 534,58 540,58 540,34 546,34 546,58" fill="none" stroke="#f59e0b" stroke-width="1.6" />
  <text x="180" y="24" font-size="9" fill="#f59e0b">555 自激，约 38 kHz</text>

  <line x1="8" y1="78" x2="552" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="104" font-size="10" fill="var(--vp-c-text-3)">门控</text>
  <line x1="66" y1="128" x2="546" y2="128" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="66,128 130,128 130,104 210,104 210,128 300,128 300,104 360,104 360,128 430,128 430,104 500,104 500,128 546,128" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="240" y="146" font-size="9" fill="var(--vp-c-text-3)">MCU 决定发不发、发多久</text>

  <line x1="8" y1="160" x2="552" y2="160" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="5 4" />
  <text x="8" y="186" font-size="10" fill="var(--vp-c-text-3)">发射</text>
  <line x1="66" y1="210" x2="546" y2="210" stroke="var(--vp-c-divider)" stroke-width="1" />
  <polyline points="66,210 130,210 130,186 136,186 136,210 142,210 142,186 148,186 148,210 154,210 154,186 160,186 160,210 166,210 166,186 172,186 172,210 178,210 178,186 184,186 184,210 190,210 190,186 196,186 196,210 202,210 202,186 208,186 208,210 210,210 210,186 300,186 300,210 360,210 360,186 366,186 366,210 372,210 372,186 378,186 378,210 384,210 384,186 390,186 390,210 396,210 396,186 402,186 402,210 408,210 408,186 414,186 414,210 420,210 420,186 426,186 426,210 430,210 430,186 500,186 500,210 546,210" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="240" y="200" font-size="9" fill="var(--vp-c-brand-1)">只有门控为高时才发出载波</text>
</g>
</svg>

</FigBox>

::: tip 例 6 · 红外 38 kHz 载波的电阻取值 {#ex-pulse-6}
题目：用 555 多谐振荡器产生 38 kHz 左右的红外载波，取 $C=1\ \text{nF}$、$R_1=1\ \text{k}\Omega$。求 $R_2$，并算出此时的占空比与高低电平时间。

图见上面那张调制时序图。

先想什么：这次是已知频率反求电阻，公式要变形。先算出 $R_1+2R_2$ 这个整体，再减掉 $R_1$ 除以 2，不要一上来就猜 $R_2$。另外要想到：红外接收头的带通通常有几 kHz 宽，所以算出来的值最好留一点可调余量。

步骤：

1. 由 $f=\dfrac{1.44}{(R_1+2R_2)C}$ 变形：$R_1+2R_2=\dfrac{1.44}{fC}=\dfrac{1.44}{38\times10^3\times1\times10^{-9}}=3.789\times10^4\ \Omega=37.9\ \text{k}\Omega$。
2. $R_2=\dfrac{37.9-1}{2}=18.45\ \text{k}\Omega$。取标称 18 kΩ 加一只 2 kΩ 电位器微调（或直接用 20 kΩ 电位器）。
3. 取 $R_2=18\ \text{k}\Omega$ 回代：$f=\dfrac{1.44}{(1+36)\times10^3\times10^{-9}}=38.9$ kHz，偏高 2.4%；用精确式 $T=0.693\times(1+2\times18)\times10^3\times10^{-9}=25.6\ \mu$s，$f=39.0$ kHz。调到 $R_2=18.4\ \text{k}\Omega$ 时 $f=38.1$ kHz ✓。
4. 占空比：$D=\dfrac{R_1+R_2}{R_1+2R_2}=\dfrac{19}{37}=51.4\%$，离 50% 只差一点，正好卡在 555 能做到的下限附近。对红外载波足够了，接收头只在乎频率对不对，不在乎占空比。

验算：周期 $T=1/f=1/38\times10^3=26.3\ \mu$s；而 $t_{高}=0.693\times19\ \text{k}\Omega\times1\ \text{nF}=13.2\ \mu$s、$t_{低}=0.693\times18\ \text{k}\Omega\times1\ \text{nF}=12.5\ \mu$s，合计 $25.7\ \mu$s，与 26.3 µs 差 2.3%（来自 1.44 的取位与 $R_2$ 取整），量级与进位都对 ✓。

延伸一步：$t_{低}=12.5\ \mu$s 意味着放电管每 26 µs 就要把 1 nF 放掉一次，平均灌电流很小，555 完全吃得消；但 $R_1=1\ \text{k}\Omega$ 已经接近下限。$R_1$ 不能取得太小：放电管导通时 $V_{CC}$ 会通过 $R_1$ 直接灌进放电管，$R_1=1\ \text{k}\Omega$、$V_{CC}=5$ V 时就有 5 mA 白白流掉，再小就会过热。多数资料建议 $R_1$ 不小于 1 kΩ，就是这个原因。
:::

四个实例走完，最后收拢成两份清单。

## 七、易错清单（按踩坑频率排序）

1. 把回差当成一个阈值用，按单阈值画波形，输出次数全错。施密特永远有两个阈值，先把传输特性那个矩形框画出来再动笔。
2. 判断噪声时比错了对象，拿噪声幅度去和阈值比，得出应该压得住的错误结论。正确比法是噪声峰峰值与回差 $\Delta V$ 比。
3. 以为回差调大就万事大吉，结果调到比信号还大，电路永远不动作。先量噪声峰峰值，再让 $\Delta V$ 比它大 50% 左右。
4. 忘记单稳态不可重触发，触发端一直拉低，输出被拉成长脉冲，时序全乱。取值前先按 $t_W\approx1.1RC$ 把窗口算出来，再看触发源会不会比它长。触发信号必须先微分，且宽度小于 $t_W$。
5. 多谐公式里漏掉 $2R_2$，频率算成两倍多，实物完全不对。回到物理图像：充电走两个电阻、放电只走一个。
6. 以为 555 能出 50% 占空比，按 50% 的对称方波设计时序，结果高电平偏长。标准接法下 $D$ 恒大于 50%，要对称得并一只二极管。
7. 拿 555 当精确时钟，定时飘 ±20%，通信波特率全错。电解电容容差就是这么大，精确时钟用晶振或 MCU 定时器。
8. 把 555 输出当成满幅 $V_{CC}$，实际高电平只有 $V_{CC}-1.5$ V 左右，后级 CMOS 的噪声容限被吃掉一截。查手册的 $V_{OH}$，别默认等于电源。
9. 555 的 5 脚（CV）悬空不管，上阈值被干扰带偏，频率乱跳。不用时经 10 nF 接地。
10. $R_1$ 取得太小，放电管导通时 $V_{CC}$ 经 $R_1$ 直通地，芯片发热甚至损坏。通常取 $R_1\ge1\ \text{k}\Omega$。
11. 忘了 4 脚要接高，$\overline{R_D}$ 悬空，芯片时复位时不复位。不用时直接接到 $V_{CC}$。

## 八、考点速记

| 记住 | 内容 |
| --- | --- |
| 三种电路 | 施密特（修边沿）、单稳态（定宽度）、多谐（造方波） |
| 稳态分类 | 双稳 2 个稳态、单稳 1 个、多谐（无稳）0 个 |
| 施密特 | $V_{TH}$ 上升翻、$V_{TL}$ 下降翻、$\Delta V = V_{TH}-V_{TL}$ |
| 噪声判据 | 噪声峰峰值 $<\Delta V$ 才压得住 |
| 555 内部分压 | $\frac23V_{CC}$（TH）与 $\frac13V_{CC}$（TR） |
| 555 三条规则 | TH 超 2/3 复位、输出低、放电管通；TR 低于 1/3 置位、输出高 |
| 单稳态 | $t_W\approx1.1RC$，精确为 $RC\ln3$；与触发宽度无关 |
| 多谐 | $t_{高}=0.693(R_1+R_2)C$、$t_{低}=0.693R_2C$ |
| 多谐频率 | $f\approx\dfrac{1.44}{(R_1+2R_2)C}$ |
| 占空比 | $D=\dfrac{R_1+R_2}{R_1+2R_2}>50\%$（加二极管后变 $\dfrac{R_1}{R_1+R_2}$） |
| 系数来历 | $0.693=\ln2$，$1.1\approx\ln3$ |
| 555 输出 | $V_{OH}\approx V_{CC}-1.5$ V，拉灌约 200 mA |

## 九、自检

合上页面自己说一遍：

1. 一个回差为 2 V 的施密特触发器（$V_{TH}$ 与 $V_{TL}$ 差 2 V），能不能压住峰峰值 1.5 V 的噪声？如果噪声涨到 3 V，输出会变成什么样？
2. 555 单稳态的触发端被拉低了 3 秒，而设定的 $t_W$ 只有 0.5 秒，输出实际是什么样？该怎么改？
3. 想让 555 多谐振荡器输出 1 kHz、占空比 50% 的方波，能做到吗？做不到的话，你会怎么改电路或换方案？

## 下一步

数字电路里只有这一处是模拟与数字正面握手，555 这类器件正好卡在中间：电容的连续充电被折算成了离散的 0 与 1。往两个方向都能接下去。

- 想看波形在屏幕上长什么样：[示波器](../lab/oscilloscope)，用游标读一次 555 输出的周期与占空比，比背十遍公式记得牢。
- 想追根溯源：[08 · 数电接口：AD/DA 与脉冲调制](./ad-da.md)里的 PWM，正是本页多谐振荡器的下游；[模拟电子 08 章 · 波形的发生和变换](../analog/oscillators.md)则从正弦振荡的角度讲同一件事。
- 想看工业界怎么做的：[07 · 定时器与 PWM](../embedded/timer-pwm.md)里 MCU 用计数器和比较寄存器完成同样的定时，精度高两个数量级。
- 想回头巩固：[06 · 计数器与寄存器](./counters.md)里 555 作为时钟源的用法，和这里的公式是同一套。

<Prereq id="time-constant" /> → [06 · 计数器与寄存器](./counters.md)
