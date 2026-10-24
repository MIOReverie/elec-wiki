---
title: 布尔代数与逻辑门
description: 与、或、非三种基本运算的日常说法与正式定义，德摩根定律为什么有用、真值表与逻辑表达式与逻辑图三者如何互转，以及一道带验算的例题。
---

# 布尔代数与逻辑门

<Meta time="5 min" level="卡片" note="德摩根定律是把「或」翻译成「与」的唯一钥匙，翻译时每个字母都要取反" />

一句话结论：**逻辑只认 0 和 1，运算只有与、或、非三种；而德摩根定律说「把或换成与的同时，每个字母都要取反」——这一条是整个数字电路的翻译钥匙。**

## 日常说法与正式定义

- 日常说法：与门是「两个条件都满足才通」；或门是「有一个条件满足就通」；非门是「反着来」。
- 正式定义：把「真」记作 1、「假」记作 0，于是「都满足」是**与**（AND，$Y=AB$），「有一个满足」是**或**（OR，$Y=A+B$），「反过来」是**非**（NOT，$Y=\bar A$）。
- 这里的 $+$ 是**逻辑或**，不是算术加：$1+1=1$，不是 2。

## 公式里的符号

| 符号 | 含义 |
| --- | --- |
| $A$、$B$ | 输入端的逻辑变量，取值只有 0 或 1 |
| $Y$ | 输出端的逻辑变量 |
| $\bar A$ | $A$ 的反（NOT），读作「非 A」 |
| $AB$ | 与（AND），也写成 $A\cdot B$ |
| $A+B$ | 或（OR），也写成 $A\lor B$ |

## 三种基本运算长什么样

<FigBox title="三种基本门：与、或、非" kind="电路" note="与门是平头月牙、或门是弯月牙、非门是三角加一个小圆圈。小圆圈画在输出端表示取反，画在输入端表示这个输入先取反。">

<svg viewBox="0 0 470 220" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <g transform="translate(80,95)">
    <path d="M-14 -16 L0 -16 A10 10 0 0 1 0 16 L-14 16 Z" fill="var(--vp-c-bg-soft)"/>
    <line x1="-26" y1="-7" x2="-14" y2="-7"/>
    <line x1="-26" y1="7" x2="-14" y2="7"/>
    <line x1="10" y1="0" x2="26" y2="0"/>
    <text x="0" y="-30" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">与门 AND</text>
    <text x="0" y="36" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">Y = A·B</text>
  </g>
  <g transform="translate(240,95)">
    <path d="M-14 -16 Q-2 0 -14 16 Q2 -14 14 0 Q2 14 -14 16 Z" fill="var(--vp-c-bg-soft)"/>
    <line x1="-26" y1="-7" x2="-14" y2="-7"/>
    <line x1="-26" y1="7" x2="-14" y2="7"/>
    <line x1="14" y1="0" x2="26" y2="0"/>
    <text x="0" y="-30" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">或门 OR</text>
    <text x="0" y="36" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">Y = A + B</text>
  </g>
  <g transform="translate(375,95)">
    <path d="M-12 -14 L12 0 L-12 14 Z" fill="var(--vp-c-bg-soft)"/>
    <circle cx="12" cy="0" r="2.4"/>
    <line x1="-26" y1="0" x2="-12" y2="0"/>
    <line x1="14.4" y1="0" x2="26" y2="0"/>
    <text x="0" y="-30" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">非门 NOT</text>
    <text x="0" y="36" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">Y = Ā</text>
  </g>
  <text x="235" y="196" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">小圆圈（泡）画在输出端 = 取反；画在输入端 = 该输入先取反</text>
</svg>

</FigBox>

## 常用公式

- **德摩根定律**：$\overline{A+B} = \bar A \cdot \bar B$，$\overline{AB} = \bar A + \bar B$
- **吸收律**：$A + AB = A$，$A(A+B) = A$
- **分配律**：$A + BC = (A+B)(A+C)$

德摩根定律可以读成一句话：**「或」的反 = 「与」，但每个输入都要反；「与」的反 = 「或」，但每个输入都要反。**

::: tip 为什么德摩根定律是「唯一钥匙」
数字电路里真正大量使用的硬件只有与非门（或非门）两种。把一个复杂的「与或非」表达式变成只能用与非门实现的电路，靠的就是反复用德摩根定律把「或」翻成「与」、把「非」挪到输入端。操作顺序固定：**先给整个表达式套一次反号，再用 $\overline{\bar A}=A$ 消掉双反号**。漏掉「每个字母都要反」是最常见的错。
:::

## 其它门与口诀

| 门 | 表达式 | 口诀 |
| --- | --- | --- |
| 与非 | $Y = \overline{AB}$ | 有 0 出 1 |
| 或非 | $Y = \overline{A+B}$ | 有 1 出 0 |
| 异或 | $Y = A\bar B + \bar A B$ | 相异出 1 |
| 同或 | $Y = \overline{A\oplus B}$ | 相同出 1 |

**异或**记作 $A\oplus B$，口语叫「不同则 1」；它还有一个特别有用的身份：$A\oplus B$ 等于「A 不等于 B」，所以异或门天然适合做**比较**（判断两个数是否相等）和**检奇偶**（一串异或的结果，就是这串里 1 的个数的奇偶性）。

## 常见误解

1. **把逻辑加当算术加** → $1+1$ 算成 2 → 记住逻辑或的 $1+1=1$，$1+0=1$，$0+0=0$。
2. **用德摩根时忘了取反** → 把 $\overline{A+B}$ 写成 $AB$ → 每翻一次「或」，括号里每个字母都要加一横。
3. **以为「与」就是数学里的乘、「或」就是数学里的加** → 电路里没有普通加法，输出永远只有 0/1。
4. **以为异或和同或是同一个东西** → 异或是「相异出 1」，同或是「相同出 1」，两者刚好相反。

## 例题

::: tip 例 1 · 用与非门实现一个与或表达式
**题目**：某报警电路的逻辑是「（A 与 B 都满足）**或**（C 不满足）」，即 $Y=AB+\bar C$。现有与非门（NAND），请写出只用与非门的实现。

**先想什么**：与非门是这里的「基本件」，所以目标是把式子里的「或」消掉。正路是**整体套一次反号**——这也是唯一不会丢项的做法。

**步骤**：

1. 整体取反：$Y=\overline{\overline{AB+\bar C}}$。*（为什么先整体取反：这样可以用一次德摩根，把「或」和「非」一起翻进括号里。）*
2. 对内层用德摩根：$\overline{AB+\bar C}=\overline{AB}\cdot\overline{\bar C}=\overline{AB}\cdot C$。*（这一步里 $\overline{\bar C}=C$，是因为原式里那个「非」恰好在括号外被取反了一次。）*
3. 于是 $Y=\overline{\overline{AB}\cdot C}$，**两个与非门就够**：第一个出 $n_1=\overline{AB}$，第二个把 $n_1$ 与 $C$ 相与非，得 $Y$。

**验算（真值表逐行核对）**：$A=1,B=1,C=1$ → 原式 $1+0=1$，改写式 $n_1=\overline{1}=0$、$Y=\overline{0\cdot1}=1$ ✓。$A=0,B=1,C=0$ → 原式 $0+1=1$，改写式 $n_1=\overline{0}=1$、$Y=\overline{1\cdot0}=1$ ✓。$A=1,B=0,C=1$ → 原式 $0+0=0$，改写式 $n_1=1$、$Y=\overline{1\cdot1}=0$ ✓。四行都一致，说明式子没错。

**如果中途写错了会怎样**：常见错误是第 3 步手痒，把 $\overline{\overline{AB}}$ 顺手化成了 $AB$，写成 $Y=\overline{AB\cdot C}$。用 $A=0,B=1,C=0$ 一查就露馅：原式给 1，这个写法给 $\overline{0}=0$ ✗——「或」整个消失了。**丢的那一项永远是验算抓出来的，不是看出来的。**

**这一节最该带走的一句**：德摩根是**整体套一次反号**，不是逐项替换。逐项替换最容易把「或」丢掉。
:::

## 在正文里什么时候用得上

> 完整内容见 [24 · 数字电路基础](../08-electronics/digital-basic.md)

凡是出现「两个条件同时成立才动作」「红灯与黄灯哪个亮」「怎样用与非门拼出这个功能」的地方，都要回到这张卡。后面讲卡诺图化简、PLA 结构、PLC 梯形图里的常开常闭触点，用的都是这三种运算和德摩根定律。
