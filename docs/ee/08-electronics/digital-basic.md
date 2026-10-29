---
title: 24 · 数字电路基础
description: 电压落在哪条带子里才算 0 或 1，同一串 0/1 怎么读成二进制、十六进制和 BCD，又怎么用真值表、布尔代数和卡诺图把它算出来。
---

# 24 · 数字电路基础

<Meta time="30 min" level="了解" note="两个坑最深：把 0/1 当成一个确切的电压数值，还有把 CMOS 多余输入悬空不管" />

先摆两个真事。

一块 5 V 供电的单片机板，外接一个 3.3 V 的传感器，传感器吐出来的高电平只有 3.3 V。这算不算「1」？如果算，手册上为什么还要写一堆 $V_{IH}$、$V_{IL}$ 的门限数字。另一件事：示波器上量到某根线是 2.1 V 的方波，你正准备写「高电平」，旁边的人说，这得看是什么器件。

两件事问的是同一个问题：0 和 1 到底指什么。

> 📎 教材下册速览：这是《电工学》下册第 24 章（数制与逻辑代数）的压缩版，先把框架搭起来。同一主题在[数字电路课](../../digital/index.md)有完整版，推导更长、演示更多：[01 数制与编码](../../digital/number-systems.md)、[02 逻辑代数与卡诺图](../../digital/boolean-kmap.md)、[03 门电路与集成器件](../../digital/gates.md)。这里只给判据，想看展开就去那三页。

::: tip 读这页之前
会欧姆定律，知道电压和电流这两个量在说什么，就够用（<Prereq id="circuit-model" />），十进制四则运算别生疏。符号先交代一下：`0b` 前缀是二进制（`0b1010` = 10），`0x` 前缀是十六进制（`0xFF` = 255），上划线 $\overline{A}$ 读作「A 非」，$A$、$B$ 是逻辑变量，$Y$ 是输出。全部约定见[符号与约定](../../guide/notation.md)。

三个新词各给一句话。逻辑电平是用电压区间表示 0/1 的行业约定；真值表把输入的所有组合和对应输出逐行列出来；布尔代数是只对 0、1 成立的代数，运算只有与、或、非三种。

模拟电子不用先学。这里把门电路当黑盒，只问输入输出怎么对应；门里面三极管怎么开关，在[模拟电子](../../analog/index.md)那条线里。
:::

::: tip 心智模型：数字电路是一台把电压翻译成符号的机器
输入端把连续电压判成 0 或 1，中间只做符号运算，输出端再把 0/1 还原成电压。所以它不怕干扰把电压推高 0.3 V，怕的是干扰大到跨过判决门限。它比模拟电路抗干扰强，根子就在这儿；先讲电平、再讲逻辑的顺序，也是从这儿来的。
:::

## 一、数制与编码：同一串 0/1 的三种读法

数制（number system）管的是「每一位值多少」。二进制每一位的权是 $2^k$，从右往左依次是 1、2、4、8、16、32、64、128。

编码（code）管的是另一件事：它不关心值有多大，只规定「这几位合起来代表什么」。同样 8 位，可以读成一个数，也可以读成两位十进制数字。十六进制之所以能直接换，是因为 $16=2^4$，一位十六进制恰好装得下二进制四位。

三条换算规则，考试就考这三条：

| 方向 | 做法 | 例 |
| --- | --- | --- |
| 十进制 → 二进制 | 除 2 取余，倒序排列 | $182 \to 1011\,0110$ |
| 二进制 → 十进制 | 按权展开相加 | $1011\,0110 = 128+32+16+4+2 = 182$ |
| 二进制 ↔ 十六进制 | 每 4 位一组直接换，不经十进制 | $1011\,0110 \to \text{B}6$ |

十六进制比十进制多出来的六个符号 A~F，就是 10~15。写 B6 的时候 B 要念成十一，别顺口念成字母 B。

<FigBox title="182 的一副骨架：位权在上，十六进制分组在下" kind="结构" note="上排是每一位的权，格子里是那一位的取值。左 4 位一组正好是 B（=11），右 4 位一组是 6——十六进制不需要经过十进制换算，直接按 4 位一组读。">

<svg viewBox="0 0 470 205" role="img" aria-label="8 位二进制 1011 0110 的位权与十六进制分组：左四格为 B，右四格为 6">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="44" y="26" fill="var(--vp-c-text-3)">每一位的权（2 的幂）</text>
  <text x="67" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">128</text>
  <text x="116" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">64</text>
  <text x="165" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">32</text>
  <text x="214" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">16</text>
  <text x="263" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">8</text>
  <text x="312" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">4</text>
  <text x="361" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">2</text>
  <text x="410" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">1</text>

  <rect x="44" y="86" width="46" height="40" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="93" y="86" width="46" height="40" rx="4" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="142" y="86" width="46" height="40" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="191" y="86" width="46" height="40" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="240" y="86" width="46" height="40" rx="4" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="289" y="86" width="46" height="40" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="338" y="86" width="46" height="40" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="387" y="86" width="46" height="40" rx="4" fill="none" stroke="var(--vp-c-divider)" />

  <text x="67" y="113" text-anchor="middle" font-size="16" font-weight="700">1</text>
  <text x="116" y="113" text-anchor="middle" font-size="16" font-weight="700">0</text>
  <text x="165" y="113" text-anchor="middle" font-size="16" font-weight="700">1</text>
  <text x="214" y="113" text-anchor="middle" font-size="16" font-weight="700">1</text>
  <text x="263" y="113" text-anchor="middle" font-size="16" font-weight="700">0</text>
  <text x="312" y="113" text-anchor="middle" font-size="16" font-weight="700">1</text>
  <text x="361" y="113" text-anchor="middle" font-size="16" font-weight="700">1</text>
  <text x="410" y="113" text-anchor="middle" font-size="16" font-weight="700">0</text>

  <rect x="40" y="82" width="205" height="48" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-dasharray="5 4" />
  <rect x="236" y="82" width="205" height="48" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-dasharray="5 4" />
  <text x="130" y="152" text-anchor="middle" fill="var(--vp-c-brand-1)">高位 4 位 → B（= 11）</text>
  <text x="340" y="152" text-anchor="middle" fill="var(--vp-c-text-3)">低位 4 位 → 6</text>

  <text x="44" y="182" fill="var(--vp-c-text-3)">按权展开：1×128 + 0×64 + 1×32 + 1×16</text>
  <text x="44" y="198" fill="var(--vp-c-text-3)">+ 0×8 + 1×4 + 1×2 + 0×1 = 182</text>
</g>
</svg>

</FigBox>

BCD（Binary-Coded Decimal，二-十进制编码）属于第二种读法：它不把整个数转成二进制，而是把每一位十进制数字单独编成 4 位，只用到 0000~1001 这十个码。所以 $182$ 的 BCD 是 `0001 1000 0010`，一共 12 位，比二进制多花 4 位。多花的钱换来的是「一眼念出十进制」，数码管显示全靠这个。

位数这两个上限顺手记一下：8 位二进制能装 0~255 共 256 个值，16 位能装 0~65535。存 300 就得两个字节，只存 100 一个字节还有富余。负数另有说法，最高位当符号、其余位取反加一，叫补码（two's complement），右边的进制转换器里也能看到它的样子。

::: tip 例 1 · 同一个 182，四种长相

**题目**：把 $(182)_{10}$ 写成二进制、十六进制和 BCD 码，并说明为什么 BCD 和二进制差那么远。

<FigBox title="四种写法对照：值变了没有？" kind="结构" note="四行说的是同一个数。注意 BCD 那行不是 182 的二进制展开，而是 1、8、2 三个数字各占一格——位数多了，但每一格都能直接念出来。">

<svg viewBox="0 0 470 190" role="img" aria-label="182 的四种写法：十进制 182、二进制 10110110、十六进制 B6、BCD 0001 1000 0010">
<g font-size="12" fill="var(--vp-c-text-1)">
  <text x="18" y="34" fill="var(--vp-c-text-3)">十进制</text>
  <text x="120" y="34" font-size="14" font-weight="700">182</text>
  <text x="240" y="34" fill="var(--vp-c-text-3)">三位十进制数</text>

  <text x="18" y="72" fill="var(--vp-c-text-3)">二进制</text>
  <text x="120" y="72" font-size="14" font-weight="700">1011 0110</text>
  <text x="240" y="72" fill="var(--vp-c-text-3)">8 位，按权展开得 182</text>

  <text x="18" y="110" fill="var(--vp-c-text-3)">十六进制</text>
  <text x="120" y="110" font-size="14" font-weight="700">B6</text>
  <text x="240" y="110" fill="var(--vp-c-text-3)">两位，每 4 位二进制换一位</text>

  <text x="18" y="148" fill="var(--vp-c-text-3)">BCD</text>
  <text x="120" y="148" font-size="14" font-weight="700">0001 1000 0010</text>
  <text x="240" y="148" fill="var(--vp-c-text-3)">12 位，三位十进制各占 4 位</text>

  <line x1="18" y1="162" x2="452" y2="162" stroke="var(--vp-c-divider)" stroke-dasharray="4 4" />
  <text x="18" y="180" fill="var(--vp-c-text-3)">同样 12 位按二进制读 = 386 —— 所以必须先问「这是哪种编码」</text>
</g>
</svg>

</FigBox>

先想什么：题目给的是十进制数 182，要三种写法。动手之前先分清哪条换算是按值算的、哪条是按位算的：二进制和十六进制换算的是值，BCD 换算的是每一位数字的长相。这一点分不清，BCD 一定会写错。

步骤：

1. **十转二**（除 2 取余，倒序）：$182 = 128+32+16+4+2$，即 `1011 0110`。*（为什么可以这样凑：位权是 1、2、4、8…，任何整数都能唯一拆成这些权之和，这一步等价于「除 2 取余」的竖式。）*
2. **二转十六进制**（每 4 位一组）：高位 `1011` → B，低位 `0110` → 6，得 `B6`。*（为什么不用先转十进制：4 位二进制的 16 种组合恰好就是 16 个十六进制符号，一一对应。）*
3. **BCD**（每位十进制数字单独编 4 位）：$1 \to 0001$、$8 \to 1000$、$2 \to 0010$，得 `0001 1000 0010`。*（为什么每一位都要凑满 4 位：BCD 的每一位固定占 4 位，短了会把位数错开，`1` 写成 `1` 就分不清是 1 还是 8。）*

验算：把十六进制 `B6` 按权展开，$11\times16+6=176+6=182$ ✓；BCD 逐段念回去，0001 是 1、1000 是 8、0010 是 2，连起来 182 ✓；二进制按权展开 128+32+16+4+2=182 ✓。三个方向都回到 182，说明三次换算都没丢位。

一句记牢：看到 `0001 1000 0010` 要立刻问「这是 BCD 还是二进制」。按二进制读它是 386，差得离谱。
:::

到这里，0/1 已经能读成数了。可在电路里 0/1 是电压，而电压是连续量，多高才算 1，得先定一条界线。

## 二、逻辑电平：0 与 1 是一条电压带

**逻辑电平**（logic level）是用电压区间表示逻辑值的行业约定：器件不去测「精确几伏」，只判断「落在哪个带里」。两个门限各有一个名字：

- $V_{IL}$（input low voltage）：输入被判为 0 时允许的最高电压；
- $V_{IH}$（input high voltage）：输入被判为 1 时允许的最低电压。

两条门限中间那条带子叫禁止区，也叫不确定区。输入落在里面，输出是 0 还是 1 全看运气，温度变一点、换一批片子，结果就跟着跳。手册上那串数字的含义就在这里：它是判决线，不是建议值。

还有一类器件容易被漏掉：5 V 供电的 CMOS，门限按同样比例算就是 1.5 V 和 3.5 V，2.1 V 送进去照样落在禁止区。所以「2.1 V 算 0 还是 1」这个问题，脱离器件型号根本没法回答。3.3 V CMOS 说它是 1，5 V TTL 和 5 V CMOS 都说不知道。

还有一层约定要说清：哪条带子叫 1 是人定的。绝大多数电路用正逻辑（positive logic），高电平记作 1、低电平记作 0；反过来叫负逻辑，只在一些老图纸里还看得到，读图时先看图例。

| 参数 | 含义 | 5 V TTL 典型值 | 3.3 V CMOS 典型值 |
| --- | --- | --- | --- |
| $V_{IL}$ | 判 0 的最高输入电压 | 0.8 V | $0.3V_{DD}=0.99$ V |
| $V_{IH}$ | 判 1 的最低输入电压 | 2.0 V | $0.7V_{DD}=2.31$ V |
| $V_{OL}$ | 输出低电平的保证最高值 | 0.4 V | 约 0.1 V |
| $V_{OH}$ | 输出高电平的保证最低值 | 2.4 V | 约 $V_{DD}-0.1$ V |

<FigBox title="两种器件的判决带：落在带外才判得准" kind="结构" note="柱子的高度是电压。带色的那两段是判 0 与判 1 的区间，中间那条窄带是禁止区。注意 CMOS 的门限按 V_DD 的比例给，所以 3.3 V 供电时 2.1 V 已经算 1；同样 2.1 V 落在 5 V TTL 的禁止区里，判不准。">

<svg viewBox="0 0 470 250" role="img" aria-label="电压判决带：左侧 5V TTL 分为逻辑 0、禁止区、逻辑 1，右侧 3.3V CMOS 同样三段但门限不同">
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="90" y="178" width="80" height="32" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="90" y="130" width="80" height="48" fill="none" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3" />
  <rect x="90" y="10" width="80" height="120" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />

  <text x="130" y="198" text-anchor="middle">逻辑 0</text>
  <text x="130" y="158" text-anchor="middle" fill="var(--vp-c-text-3)">禁止区</text>
  <text x="130" y="72" text-anchor="middle">逻辑 1</text>

  <text x="84" y="182" text-anchor="end" fill="var(--vp-c-text-3)">0.8 V</text>
  <text x="84" y="134" text-anchor="end" fill="var(--vp-c-text-3)">2.0 V</text>
  <text x="84" y="16" text-anchor="end" fill="var(--vp-c-text-3)">5 V</text>
  <text x="84" y="214" text-anchor="end" fill="var(--vp-c-text-3)">0 V</text>

  <rect x="300" y="170" width="80" height="40" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="300" y="118" width="80" height="52" fill="none" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3" />
  <rect x="300" y="78" width="80" height="40" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />

  <text x="340" y="194" text-anchor="middle">逻辑 0</text>
  <text x="340" y="148" text-anchor="middle" fill="var(--vp-c-text-3)">禁止区</text>
  <text x="340" y="102" text-anchor="middle">逻辑 1</text>

  <text x="294" y="174" text-anchor="end" fill="var(--vp-c-text-3)">0.99 V</text>
  <text x="294" y="122" text-anchor="end" fill="var(--vp-c-text-3)">2.31 V</text>
  <text x="294" y="84" text-anchor="end" fill="var(--vp-c-text-3)">3.3 V</text>
  <text x="294" y="214" text-anchor="end" fill="var(--vp-c-text-3)">0 V</text>

  <text x="130" y="236" text-anchor="middle" font-weight="700">TTL（5 V 供电）</text>
  <text x="340" y="236" text-anchor="middle" font-weight="700">CMOS（3.3 V 供电）</text>
  <line x1="16" y1="10" x2="16" y2="210" stroke="var(--vp-c-divider)" />
  <text x="16" y="222" text-anchor="middle" fill="var(--vp-c-text-3)">U</text>
</g>
</svg>

</FigBox>

两个器件能不能直连，看两个字就够：驱动方的保证输出，接收方的要求输入。两者之间的余量叫**噪声容限**（noise margin），余量大，抗干扰就强。下面这道题就是拿四个数比大小。

::: tip 例 2 · 3.3 V 的芯片能直接驱动 5 V TTL 吗

**题目**：一块 3.3 V CMOS 芯片要驱动一个 5 V TTL 输入；反过来，5 V TTL 输出要驱动 3.3 V CMOS 输入。两种情况分别可行吗？各留多少余量？

<FigBox title="直连判断：只看四个数" kind="结构" note="箭头方向上，左边出、右边进。判断高电平：左边 V_OH 必须 ≥ 右边 V_IH；判断低电平：左边 V_OL 必须 ≤ 右边 V_IL。两个方向都要过，缺一不可。">

<svg viewBox="0 0 470 170" role="img" aria-label="3.3V CMOS 输出接 5V TTL 输入的电平兼容框图与余量数字">
<defs>
  <marker id="db-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="20" y="46" width="150" height="66" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="95" y="72" text-anchor="middle">3.3 V CMOS</text>
  <text x="95" y="92" text-anchor="middle" fill="var(--vp-c-text-3)">输出：V_OH ≈ 3.2 V</text>
  <rect x="300" y="46" width="150" height="66" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="375" y="72" text-anchor="middle">5 V TTL</text>
  <text x="375" y="92" text-anchor="middle" fill="var(--vp-c-text-3)">输入：V_IH ≥ 2.0 V</text>
  <line x1="172" y1="79" x2="296" y2="79" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#db-ar)" />
  <text x="234" y="66" text-anchor="middle" fill="var(--vp-c-text-3)">3.2 − 2.0 = 1.2 V</text>
  <text x="234" y="98" text-anchor="middle" fill="var(--vp-c-brand-1)">可行 ✓</text>
  <text x="235" y="140" text-anchor="middle" fill="var(--vp-c-text-3)">反过来：TTL 的 V_OH 只保证 2.4 V，对 2.31 V 只剩 0.09 V</text>
</g>
</svg>

</FigBox>

先想什么：这里不算数，只比大小。判断高电平拿 $V_{OH}$ 比 $V_{IH}$，判断低电平拿 $V_{OL}$ 比 $V_{IL}$，一边是输出的保证值，一边是输入的要求值。典型值不能拿来互相凑。

步骤：

1. 3.3 V CMOS 出、5 V TTL 进，先看高电平：$V_{OH}\approx3.2$ V（按 $V_{DD}-0.1$ 算）$\ge V_{IH}=2.0$ V，余量 1.2 V，通过。*（为什么不用 3.3：$V_{OH}$ 是带负载时的保证值，永远比电源低一点，拿 3.2 更保守。）*
2. 同一方向看低电平：$V_{OL}\approx0.1$ V $\le V_{IL}=0.8$ V，余量 0.7 V，通过。*（为什么低电平也要查：多数人的直觉只盯着高电平，可实际翻车的往往出在低电平这一侧。）*
3. 反过来，5 V TTL 出、3.3 V CMOS 进，看高电平：$V_{OH}=2.4$ V（TTL 的保证最低值）$\ge V_{IH}=2.31$ V，余量只剩 0.09 V，勉强通过但很危险。*（为什么危险：0.09 V 这点余量，走线串扰和温漂随便一吃就没了，工程上要加电平转换。）*
4. 剩下那个低电平：$V_{OL}=0.4$ V $\le V_{IL}=0.99$ V，余量 0.59 V，通过。

验算：四次比较都写成「余量 = 保证输出 − 要求输入」，高电平要 $\ge 0$、低电平要 $\le 0$：$1.2$ ✓、$0.7$ ✓、$0.09$ ✓（临界）、$0.59$ ✓。四个数里最小的 0.09 V 才是这条链路的真实短板。电平兼容看最差的一条，不看平均值。

一句记牢：$2.1$ V 送到 3.3 V CMOS 就是 1，送到 5 V TTL 却落在禁止区。同一根线上的同一个电压，答案取决于你问的是哪种器件。
:::

电平把 0/1 的物理含义定死了，剩下的是「0/1 能算什么」。

## 三、逻辑门与真值表

**真值表**（truth table）把输入的所有可能组合逐行列出，对应输出填在同一行。$n$ 个输入就有 $2^n$ 行，三变量 8 行，四变量 16 行。它之所以权威，是因为逻辑函数本身就是一张映射表：给定输入组合，输出唯一确定。表达式能化简成七八种样子，真值表只有一张。

两个输入就有 4 行：00、01、10、11 四种组合，右边一列填输出。多一个输入，行数就翻一倍，所以真值表只对小规模函数好使，五六个变量往上就该换表达式和卡诺图了。

| 门 | 表达式 | 口诀 |
| --- | --- | --- |
| 与 AND | $Y = AB$ | 全 1 出 1 |
| 或 OR | $Y = A+B$ | 有 1 出 1 |
| 非 NOT | $Y = \overline{A}$ | 取反 |
| 与非 NAND | $Y = \overline{AB}$ | 有 0 出 1 |
| 或非 NOR | $Y = \overline{A+B}$ | 有 1 出 0 |
| 异或 XOR | $Y = A\overline{B}+\overline{A}B = A\oplus B$ | 相异出 1 |
| 同或 XNOR | $Y = \overline{A\oplus B}$ | 相同出 1 |

表里的 $\oplus$ 读作异或，两个输入不一样时输出 1。有两类门值得单独记：与非门和或非门，书上管它们叫「全能门」。只用与非门就能搭出与、或、非里的任意一种，所以工厂可以只生产一种片子，剩下的靠连线解决。

顺手做个样子：把与非门的两个输入并在一起，$Y=\overline{AA}=\overline{A}$，一个非门就出来了。要做或，让 $A$、$B$ 各自先过一个非门，再送进与非门。

<DemoBox title="点一下开关，看真值表跟着变" hint="切换与/或/非/与非/或非/异或，改 A、B 的取值。右侧的真值表会自动高亮当前这一行——把六张表都过一遍，比背口诀快。">
  <LogicGateDemo />
</DemoBox>

真值表告诉你门是什么，布尔代数告诉你式子之间凭什么可以互相替换。

## 四、布尔代数：只对 0/1 成立的代数

布尔代数（Boolean algebra）把与、或、非当运算，变量只取 0 和 1。取值只有两个，于是冒出了普通代数里不存在的恒等式：$A+A=A$、$AA=A$。用得最勤的是两条德摩根定律（De Morgan's laws）：

$$
\overline{A+B} = \overline{A}\cdot\overline{B} \qquad \overline{AB} = \overline{A}+\overline{B}
$$

读法只有一句：横线断开的时候，与或互换。用与非门实现或逻辑这件事能成立，依据就是它。

常用公式都可以拿真值表当场验证：

$$
A + AB = A \qquad A(A+B) = A \qquad A + \overline{A}B = A + B
$$

$$
AB + \overline{A}C + BC = AB + \overline{A}C \quad(\text{冗余项可消})
$$

最后这条叫冗余项（consensus term）：$BC$ 被另外两项完全盖住了，删掉不改变函数值。化简时它是白捡的一项，到了下一章的竞争冒险里，它又会以「必须补回来」的身份出现。同一个式子，两种用途。

公式法容易漏项，人眼盯不住。于是有人把化简做成了一张方格纸。

## 五、卡诺图：把化简变成圈格子

**卡诺图**（Karnaugh map）把真值表重排成二维网格，行、列都按**格雷码**（Gray code，相邻两个编码只差一位的排列，如 00、01、11、10）排列。这一改，几何上挨着的格子逻辑上也挨着，只差一个变量。于是「圈住相邻的 1」就等于「把那个变动的变量消掉」。

格数和真值表的行数一一对应：2 变量 4 格，3 变量 8 格，4 变量 16 格。格子填的是输出，一格一个 1 或 0，所以圈之前先把 0 和 1 填满，别边填边圈。

五步走：

```
① 画 2ⁿ 格卡诺图，按格雷码排列（相邻格只有一位不同）
② 真值表 / 表达式 → 填 1
③ 圈 1：圈必须是 2ᵏ 个相邻格，圈越大越好、圈数越少越好
④ 每个圈写成一个与项：变量取值不变的保留，变化的消去
⑤ 各圈相或
```

无关项（don't care，记作 ×）指的是「这组输入根本不会出现」，填 1 填 0 都行，正好用来把圈画大一点。它算不上数学技巧，是个物理事实：BCD 码里 1010~1111 这六个码永远不会出现。

<DemoBox title="交互式卡诺图：自己圈，看表达式怎么变" hint="切换 2/3/4 变量，点格子改 1/0，按提示圈组。注意行、列都按格雷码排，所以最左列与最右列、最上行与最下行也算相邻。">
  <KMapDemo />
</DemoBox>

::: tip 例 3 · 卡诺图化简 $Y = \sum m(1,3,5,7)$

**题目**：三变量函数，最小项为 $m_1, m_3, m_5, m_7$。用卡诺图化简。

先想什么：先别画图，先看编号。$1,3,5,7$ 全是奇数，而三变量时编号的二进制最低位就是 $C$，奇数意味着 $C=1$。四个最小项的共同点可能只有一个：$C=1$。有了这个预期，画图只是去确认。

<FigBox title="四个 1 排成一整列：圈成一个大圈" kind="结构" note="行按格雷码 00/01/11/10 排，列是 C。四个 1 全在 C=1 那一列，且上下首尾相接，可以一口气圈成 4 格（2²，合规）。圈内 C 恒为 1，A、B 都在变 → 消去，只剩 C。">

<svg viewBox="0 0 470 268" role="img" aria-label="三变量卡诺图：AB 为行、C 为列，C 等于 1 的两列四格全为 1，被圈成一个大圈">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="112" y="44" text-anchor="end" fill="var(--vp-c-text-3)">AB \ C</text>
  <text x="147" y="44" text-anchor="middle" fill="var(--vp-c-text-3)">C = 0</text>
  <text x="201" y="44" text-anchor="middle" fill="var(--vp-c-text-3)">C = 1</text>

  <text x="112" y="80" text-anchor="end">00</text>
  <text x="112" y="124" text-anchor="end">01</text>
  <text x="112" y="168" text-anchor="end">11</text>
  <text x="112" y="212" text-anchor="end">10</text>

  <rect x="120" y="54" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="54" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="120" y="98" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="98" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="120" y="142" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="142" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <rect x="120" y="186" width="54" height="44" fill="none" stroke="var(--vp-c-divider)" />
  <rect x="174" y="186" width="54" height="44" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />

  <text x="147" y="80" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="147" y="124" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="147" y="168" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
  <text x="147" y="212" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>

  <text x="201" y="80" text-anchor="middle" font-size="15" font-weight="700">1</text>
  <text x="201" y="124" text-anchor="middle" font-size="15" font-weight="700">1</text>
  <text x="201" y="168" text-anchor="middle" font-size="15" font-weight="700">1</text>
  <text x="201" y="212" text-anchor="middle" font-size="15" font-weight="700">1</text>

  <rect x="170" y="50" width="62" height="184" rx="16" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="6 4" />

  <text x="250" y="100" fill="var(--vp-c-brand-1)">← 4 格圈（2²，合规）</text>
  <text x="250" y="122" fill="var(--vp-c-text-3)">圈内 C 恒为 1</text>
  <text x="250" y="144" fill="var(--vp-c-text-3)">A、B 在圈内都变过</text>
  <text x="250" y="166" fill="var(--vp-c-text-3)">→ 消去 A、B</text>

  <text x="18" y="256" fill="var(--vp-c-text-3)">m₁=001、m₃=011、m₅=101、m₇=111：四个码的最低位全是 1</text>
</g>
</svg>

</FigBox>

步骤：

1. 画表：行按格雷码 00、01、11、10（$AB$），列 $C$ 取 0、1。*（为什么行序不能按 00、01、10、11：那样 01 与 10 在图上相邻，逻辑上却差两位，圈出来的项会错。）*
2. 填 1：$m_1=001$ 落在行 00、列 1；$m_3=011$ 落在行 01、列 1；$m_7=111$ 行 11 列 1；$m_5=101$ 行 10 列 1。*（为什么先写三位码再找格子：编号直接对应变量取值，比先算十进制再找格子少一步出错。）*
3. 圈：四个 1 全在 $C=1$ 那一列，上下首尾相接（格雷码让第一行与最后一行也算相邻，四个角同样两两相邻），合成 4 格一个圈。*（为什么能圈 4 格：$4=2^2$，符合「$2^k$ 个」的规则；圈画得大，能消掉的变量就多。）*
4. 写项：圈内 $C$ 恒为 1，留下；$A$、$B$ 都变过，消去。得 $Y=C$。

验算：逐一代入最小项，$001\to C=1$ ✓、$011\to1$ ✓、$101\to1$ ✓、$111\to1$ ✓；再验两个 0 的行，$000\to C=0$ ✓、$010\to0$ ✓。八行全部吻合，说明化简没有改变函数。

一句记牢：卡诺图三条纪律，按格雷码排、圈 $2^k$ 格、圈能画多大就画多大。少一条，写出来的项就错。
:::

式子和图都会了，可真把芯片焊到板上，问题会换成另外两个：这根线能不能悬空，两个器件怎么共用一根线。

## 六、器件常识：TTL、CMOS、开漏与三态

TTL 用双极型三极管，CMOS 用互补 MOS 管。两者的差别会直接变成接线规矩：

| | TTL | CMOS |
| --- | --- | --- |
| 电源 | 5 V（严格） | 3~18 V（宽） |
| 速度 | 快 | 较慢（现代已很快） |
| 功耗 | 大（静态也耗电） | 极小（静态几乎不耗电，只在翻转时耗） |
| 输入悬空 | 等效高电平（能用但抗干扰差） | **严禁悬空**：会感应电荷、可能损坏 |
| 抗干扰 | 一般 | 强 |

CMOS 的输入为什么怕悬空：它的输入端是 MOS 管的栅极，栅极和沟道之间隔着一层极薄的绝缘层，输入电阻高到 $10^{12}\ \Omega$ 量级。悬空时这点电荷没地方泄放，电位漂到禁止区，上下两个管子同时半导通。输出乱跳还算轻的，直通电流发热把片子烧掉也不稀奇。所以多余的与/与非输入端要接高电平，多余的或/或非输入端要接地。

扇出（fan-out）是第三条纪律：一个输出能可靠带动多少个同类输入，取高、低两个方向里较小的那个。不够就加缓冲器。

推挽和开漏的差别，落在「写 1 的时候谁在干活」。推挽的上管接电源、下管接地，写 1 时上管导通把引脚拉高，写 0 时下管导通把引脚拉低，0 和 1 两种电平都是主动打出去的。开漏只有下面那只管子，写 0 能拉低，写 1 只是把手松开，引脚进高阻，电平归上拉电阻管。所以推挽并联会打架，开漏并联才安全。

上拉电阻取多大，是开漏电路里最常被问的一句。取小了灌电流大、白耗电，取大了上升沿被 RC 拖慢。拿 3.3 V 总线举例：4.7 kΩ 配 100 pF 的线电容，时间常数 $4.7\times10^{3}\times100\times10^{-12}=0.47\ \mu s$，跑 I²C 的 400 kHz 还够用；换成 100 kΩ，边沿就糊了。

后两种输出结构专治「一根线多个主人」：

- **开漏 / 开集电极**（OD / OC，open-drain / open-collector）：输出级只有一只下拉管，只能主动拉低，想要高电平必须外接上拉电阻。好处是可以做「线与」：几个开漏输出直接并在一起，只要有一个拉低，整条线就是低。
- **三态门**（tri-state）：输出除了 0、1 还有第三态 Z，也就是高阻，相当于把引脚断开。多个三态输出可以挂在同一根总线上，前提是同一时刻只有一个使能。

| 结构 | 能输出什么 | 能否直接并联 | 典型用途 |
| --- | --- | --- | --- |
| 推挽（普通门） | 0 / 1 | ✗ 会短路打架 | 一般逻辑 |
| 开漏 / 开集 | 0 / 高阻（高电平靠上拉） | ✓ 线与 | 中断线、I²C、电平转换 |
| 三态 | 0 / 1 / Z | ✓ 分时复用 | 数据总线 |

<DemoBox title="多个器件抢一根总线会发生什么" hint="切换三态与开漏模式，开关各设备的使能，看总线状态。三态下同时使能两个会显示冲突；开漏下多个一起拉低反而是安全的——这就是 I²C 只用两根线的原因。">
  <TriStateBusDemo />
</DemoBox>

<DemoBox title="实时进制转换器：改一个数，四种写法一起动" hint="在十进制、二进制、十六进制之间随手输入，观察 BCD 与补码同时更新。用它检查自己手算的「除 2 取余」有没有错位。">
  <NumberConverter />
</DemoBox>

## 易错清单

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. 把 0/1 当成具体电压（以为 2.1 V 一定是 1）→ 跨器件直连时判错电平，时好时坏 → 先查对方的 $V_{IL}/V_{IH}$，落在禁止区就加电平转换。
2. CMOS 多余输入端悬空 → 输出乱跳、静态电流变大，严重时烧片 → 与/与非端接高电平，或/或非端接地。
3. 把 BCD 当二进制读（`0001 0010` 读成 18）→ 数值完全对不上（二进制是 18，BCD 是 12）→ 先问清是哪一种编码，再决定怎么按权展开。
4. 卡诺图不按格雷码排（按 00 / 01 / 10 / 11 排）→ 相邻格差两位，圈出来的项多一个变量或少一项 → 行列一律 00 / 01 / 11 / 10。
5. 圈不是 $2^k$ 格（圈 3 格、5 格）→ 写出的项里变量数对不上 → 圈只能是 1、2、4、8 格。
6. TTL 输入悬空当可靠高电平 → 逻辑有时正确、有时误触发 → 悬空只是「等效」高电平，工程上仍要接固定电平或上拉。
7. 两个推挽输出直接并联 → 一个输出高、一个输出低时大电流直通，器件发热 → 要并联就用开漏（线与）或三态（分时）。

## 自检

答案不在下面，自己说一遍：

1. 一个 3.3 V 供电的 CMOS 门，输入 2.0 V 时判 0 还是判 1？同样 2.0 V 送到 5 V TTL 输入呢？
2. $(45)_{10}$ 的二进制、十六进制、BCD 各是什么？哪一个位数最多，为什么？
3. 为什么「与非门是全能门」？用与非门怎么搭出一个非门？
4. 一块 5 V 供电的板子要接 3.3 V 的传感器，高电平方向的余量是多少？不够的时候最省事的补救办法是什么？

## 下一步

这里讲的都是「一给输入就立刻给输出」的电路，它有个致命缺陷：算完的结果留不住。教材 24 章搭的这套符号，要到下一章（第 25 章）装上记忆之后才真正忙起来。

<Prereq id="kmap" /> → [25 · 组合逻辑电路](./combinational.md)
