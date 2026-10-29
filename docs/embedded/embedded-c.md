---
title: 03 · 嵌入式 C 与寄存器思维
description: 寄存器为什么就是有地址的内存，位操作四个动作与掩码纪律，位带怎么把一位变成一个字，volatile 防住了什么、原子性又该怎么解决。
---

# 03 · 嵌入式 C 与寄存器思维

<Meta time="45 min" level="核心" note="四个高频坑：清零忘了取反、读位先移位再屏蔽、volatile 与原子性是两件事、改字段分两步写会被中断撕开" />

新手读 STM32 参考手册经常卡在同一处：手册给一张表，写着 `偏移 0x0C、名称 ODR、复位值 0x0000 0000`，教程里接着出现 `GPIOA->ODR |= (1 << 5)`。偏移、结构体指针、或等号，这三样单看都认识，连起来就不知道在干什么了。

更麻烦的是那些「看着对、跑起来偶尔错」的写法：中断里改 GPIO 偶尔失灵，`while(!flag);` 在 Debug 版正常、Release 版死机，配一个引脚时钟别的引脚莫名其妙被改了。都不是玄学，背后是三件很具体的事：地址怎么算、位怎么改、改动会不会被撕开。

::: tip 读这页之前
会 C 的指针和结构体（`->` 访问成员、把整数强制转成指针）、二进制与十六进制互转、按位与 `&`、或 `|`、异或 `^`、取反 `~` 的真值规律，这页就读得动。这些是全部工具，缺了会很痛苦。

符号：`|=` 按位或赋值、`&=` 按位与赋值、`^=` 按位异或赋值、`~` 按位取反、`<<` 左移、`>>` 右移、`0x` 十六进制、`0b` 二进制。读法与几个易混点见[符号与约定 · 数字与嵌入式](../guide/notation.md)。

术语先用一句话顶住：寄存器映射（register map）是手册里那张「基地址 + 偏移 = 某个功能寄存器」的表；偏移（offset）是寄存器相对基地址的字节距离；掩码（mask）是只保留或只改动某几位的那个数；位带（bit-band）是内核提供的一种地址翻译机制，让某一位也拥有独立地址；原子操作（atomic）指不会被中断撕成两半的操作。正文里遇到时逐个展开。

寄存器为什么能像内存一样访问，依赖 <Prereq id="register-map" /> 那张地址地图。第一节会再讲一遍，熟的话跳过就行。
:::

::: tip 心智模型：寄存器是一排带门牌号的抽屉，位带是给每个格子再发一个门牌号
通常你只能敲开「地址 0x4001 080C 这个抽屉」，把里面 32 个格子整体倒出来、改一个、再整体放回去，这就是读—改—写。麻烦在于倒出来的那一瞬间，别人（中断）可能也往里塞了东西，你还回去时就把他的东西盖掉了。

位带相当于给每个格子单独装了扇门。想改第 5 格，直接敲「0x4221 0194 这扇门」，写 1 就是 1、写 0 就是 0，不碰邻居，也不会覆盖别人。代价是这种办法只对特定内存区有效，而且那扇门的地址得自己算。
:::

## 一、内存映射：寄存器是有地址的内存

手册上那个「偏移 0x0C」，最后是怎么变成 C 表达式里一个成员的？

Cortex-M 有 4 GB 的线性地址空间（32 位地址就是 $2^{32}$ 个字节），厂商把它切成几块，每块放不同性质的东西：

<FigBox title="4 GB 地址空间的划分，以及 GPIOA 内部的偏移" kind="结构" note="上半张图是全局地图：Flash、SRAM、外设寄存器、内核控制块各占一段，互不重叠。下半张图是把其中一小段放大——外设区里每个外设有一段连续地址，内部再按固定偏移排开各个寄存器。所谓「基地址 + 偏移」，说的就是这两层。" >

<svg viewBox="0 0 700 330" role="img" aria-label="Cortex-M 地址空间：Flash 0x08000000、SRAM 0x20000000、外设 0x40000000、内核 0xE0000000；下面放大 GPIOA 的寄存器偏移">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="24" y="28" width="300" height="34" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="36" y="50" font-size="11">0x0000 0000 起：代码区别名</text>
  <rect x="24" y="66" width="300" height="34" rx="5" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="36" y="88" font-size="11" fill="var(--vp-c-brand-1)">0x0800 0000 起：Flash（程序 + const）</text>
  <rect x="24" y="104" width="300" height="34" rx="5" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="36" y="126" font-size="11" fill="var(--vp-c-brand-1)">0x2000 0000 起：SRAM（变量 + 栈）</text>
  <rect x="24" y="142" width="300" height="34" rx="5" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
  <text x="36" y="164" font-size="11" fill="var(--vp-c-brand-1)">0x4000 0000 起：外设寄存器</text>
  <rect x="24" y="180" width="300" height="34" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="36" y="202" font-size="11">0xE000 0000 起：内核控制块（NVIC 等）</text>
  <text x="24" y="238" font-size="10.5" fill="var(--vp-c-text-3)">整片空间是连续的 4 GB，每一段都有明确用途；</text>
  <text x="24" y="256" font-size="10.5" fill="var(--vp-c-text-3)">指针只要能指向这个范围，就能访问对应硬件。</text>

  <line x1="330" y1="159" x2="386" y2="120" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="4 3" />
  <text x="392" y="46" font-weight="700">放大：GPIOA 从 0x4001 0800 开始</text>
  <rect x="392" y="58" width="286" height="26" rx="4" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.1" />
  <text x="402" y="76" font-size="10.5">+0x00  CRL：Pin0~7 配置（每脚 4 位）</text>
  <rect x="392" y="88" width="286" height="26" rx="4" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.1" />
  <text x="402" y="106" font-size="10.5">+0x04  CRH：Pin8~15 配置</text>
  <rect x="392" y="118" width="286" height="26" rx="4" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.1" />
  <text x="402" y="136" font-size="10.5">+0x08  IDR：读引脚电平</text>
  <rect x="392" y="148" width="286" height="26" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
  <text x="402" y="166" font-size="10.5" fill="var(--vp-c-brand-1)">+0x0C  ODR：写引脚电平</text>
  <rect x="392" y="178" width="286" height="26" rx="4" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.1" />
  <text x="402" y="196" font-size="10.5">+0x10  BSRR：原子置位/清零</text>
  <rect x="392" y="208" width="286" height="26" rx="4" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.1" />
  <text x="402" y="226" font-size="10.5">+0x14  BRR：清零（= BSRR 高 16 位）</text>
  <text x="392" y="256" font-size="10.5" fill="var(--vp-c-text-3)">基地址 0x4001 0800 + 偏移 0x0C</text>
  <text x="392" y="274" font-size="10.5" fill="var(--vp-c-text-3)">= 0x4001 080C = ODR 的真实地址</text>
  <text x="392" y="298" font-size="10.5" fill="var(--vp-c-text-3)">结构体里成员按顺序排列，编译器自动累加偏移——</text>
  <text x="392" y="314" font-size="10.5" fill="var(--vp-c-text-3)">这就是 GPIOA-&gt;ODR 能等同于那个地址的原因</text>
</g>
</svg>

</FigBox>

| 地址区间 | 放什么 |
| --- | --- |
| `0x0000 0000` ~ | 代码区（Flash 的别名，实际从 `0x0800 0000` 开始） |
| `0x0800 0000` ~ | Flash：程序代码和 `const` 常量 |
| `0x2000 0000` ~ | SRAM：全局变量、栈、堆 |
| `0x4000 0000` ~ | 外设寄存器（APB1 / APB2 / AHB 各总线挂的外设） |
| `0xE000 0000` ~ | Cortex-M 内核的系统控制块（NVIC、SysTick 等） |

寄存器映射就是手册里那张把「基地址 + 偏移」对到功能名的表。以 F103 为例，GPIOA 的寄存器组从 `0x4001 0800` 开始：

| 偏移 | 寄存器 | 作用 |
| --- | --- | --- |
| `0x00` | `CRL` | 配置 Pin0~7（每脚 4 位） |
| `0x04` | `CRH` | 配置 Pin8~15（每脚 4 位） |
| `0x08` | `IDR` | 输入数据（读引脚电平） |
| `0x0C` | `ODR` | 输出数据（写引脚电平） |
| `0x10` | `BSRR` | 原子置位 / 清零 |
| `0x14` | `BRR` | 清零（等价于 BSRR 高 16 位） |

CMSIS 库（Cortex-M 的官方寄存器定义包）把这些地址定义成一个结构体指针，于是你能这样写：

```c
#define GPIOA_BASE 0x40010800UL
typedef struct {
  volatile uint32_t CRL, CRH, IDR, ODR, BSRR, BRR, LCKR;
} GPIO_TypeDef;
#define GPIOA ((GPIO_TypeDef *)GPIOA_BASE)

GPIOA->ODR |= (1 << 5);   // 就是往 0x4001080C 这个地址写
```

这一点想通了，后面所有外设就都通了。UART 的 `DR` 寄存器、定时器的 `CNT`、ADC 的 `DR`，全都是「有名字的地址」，操作它们就是读写内存。

地址找到了，可一个 32 位寄存器里通常挤着十几个互不相关的字段。麻烦的是怎么只改自己想要的那一位。

## 二、位操作的四个动作

外设寄存器几乎从不整个赋值，因为一个 32 位寄存器里往往塞了十几个配置字段，你只想改其中一位，绝不能让其他位动。于是有了四个标准动作：

| 动作 | 写法 | 含义 |
| --- | --- | --- |
| 置位（把某位写成 1） | `reg \|= (1 << n)` | OR 上「只有第 n 位为 1」的掩码，其余位不变 |
| 清零（把某位写成 0） | `reg &= ~(1 << n)` | AND 上「只有第 n 位为 0」的掩码 |
| 翻转（1↔0） | `reg ^= (1 << n)` | 异或，同掩码翻转两次回到原值 |
| 读位 | `(reg >> n) & 1` | 右移到最低位再屏蔽其余位 |

<DemoBox title="位操作演练台：点选寄存器位，亲手做一遍置位/清零/翻转/读位" hint="先载入 0x00A0，再依次做：置位 bit3 → 清零 bit5 → 翻转 bit7，看十六进制和二进制怎么变。特别注意「清零」为什么必须先取反。">
  <BitManipDemo />
</DemoBox>

位号是从 0 开始数的，这一点得先讲明：最低位叫 bit0，权重是 1；bit1 的权重是 2；bit2 是 4；bit3 是 8。也就是说 `1 << n` 的值正好是 $2^n$，而 `(1 << n)` 这个掩码里只有 bit n 那一位是 1，其余全 0。清零、取反、异或，用的都是同一个掩码，只是配的运算符不同。

为什么是这四个、掩码为什么长这样，看一张位级图最清楚。

<FigBox title="置位与清零：掩码在原值的每一位上做了什么" kind="结构" note="上半：OR 一个只有 bit3 为 1 的掩码，bit3 必变 1，其余位 OR 0 不变。下半：清零要 AND 一个只有 bit5 为 0 的掩码，所以必须先把 (1<<5) 取反。最下一行是忘了取反的样子——AND 上一个只有 bit5 为 1 的数，结果除 bit5 外全被清成 0。">

<svg viewBox="0 0 700 340" role="img" aria-label="位级示意：0xA0 置位 bit3 得 0xA8；0xA8 清零 bit5 得 0x88；忘记取反则得 0x20">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="24" font-weight="700">置位：0xA0 | (1&lt;&lt;3) = 0xA8</text>
  <text x="150" y="52" font-size="11">0xA0</text>
  <text x="150" y="80" font-size="11">0x08</text>
  <text x="150" y="108" font-size="11">0xA8</text>
  <line x1="196" y1="40" x2="196" y2="114" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <rect x="212" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="248" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="284" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="320" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="356" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="392" y="38" width="32" height="20" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
  <rect x="428" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="464" y="38" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="228" y="53" text-anchor="middle" font-size="10.5">1</text>
  <text x="264" y="53" text-anchor="middle" font-size="10.5">0</text>
  <text x="300" y="53" text-anchor="middle" font-size="10.5">1</text>
  <text x="336" y="53" text-anchor="middle" font-size="10.5">0</text>
  <text x="372" y="53" text-anchor="middle" font-size="10.5">0</text>
  <text x="408" y="53" text-anchor="middle" font-size="10.5" fill="var(--vp-c-brand-1)">0</text>
  <text x="444" y="53" text-anchor="middle" font-size="10.5">0</text>
  <text x="480" y="53" text-anchor="middle" font-size="10.5">0</text>
  <rect x="212" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="248" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="284" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="320" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="356" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="392" y="66" width="32" height="20" fill="var(--vp-c-brand-1)" opacity="0.25" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
  <rect x="428" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="464" y="66" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="228" y="81" text-anchor="middle" font-size="10.5">0</text>
  <text x="264" y="81" text-anchor="middle" font-size="10.5">0</text>
  <text x="300" y="81" text-anchor="middle" font-size="10.5">0</text>
  <text x="336" y="81" text-anchor="middle" font-size="10.5">0</text>
  <text x="372" y="81" text-anchor="middle" font-size="10.5">0</text>
  <text x="408" y="81" text-anchor="middle" font-size="10.5" fill="var(--vp-c-brand-1)">1</text>
  <text x="444" y="81" text-anchor="middle" font-size="10.5">0</text>
  <text x="480" y="81" text-anchor="middle" font-size="10.5">0</text>
  <rect x="212" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="248" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="284" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="320" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="356" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="392" y="94" width="32" height="20" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
  <rect x="428" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <rect x="464" y="94" width="32" height="20" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="228" y="109" text-anchor="middle" font-size="10.5">1</text>
  <text x="264" y="109" text-anchor="middle" font-size="10.5">0</text>
  <text x="300" y="109" text-anchor="middle" font-size="10.5">1</text>
  <text x="336" y="109" text-anchor="middle" font-size="10.5">0</text>
  <text x="372" y="109" text-anchor="middle" font-size="10.5">0</text>
  <text x="408" y="109" text-anchor="middle" font-size="10.5" fill="var(--vp-c-brand-1)">1</text>
  <text x="444" y="109" text-anchor="middle" font-size="10.5">0</text>
  <text x="480" y="109" text-anchor="middle" font-size="10.5">0</text>
  <text x="510" y="53" font-size="10" fill="var(--vp-c-text-3)">原值</text>
  <text x="510" y="81" font-size="10" fill="var(--vp-c-text-3)">掩码 (1&lt;&lt;3)</text>
  <text x="510" y="109" font-size="10" fill="var(--vp-c-text-3)">结果</text>
  <text x="510" y="132" font-size="10" fill="var(--vp-c-text-3)">OR 0 保留、OR 1 置一</text>

  <text x="24" y="152" font-weight="700">清零：0xA8 &amp; ~(1&lt;&lt;5) = 0x88</text>
  <text x="150" y="180" font-size="11">0xA8</text>
  <text x="150" y="208" font-size="11">~0x20</text>
  <text x="150" y="236" font-size="11">0x88</text>
  <line x1="196" y1="168" x2="196" y2="242" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="212" y="188" font-size="10.5">1 0 1 0 1 0 0 0</text>
  <text x="212" y="216" font-size="10.5">1 1 0 1 1 1 1 1</text>
  <text x="212" y="244" font-size="10.5">1 0 0 0 1 0 0 0</text>
  <text x="330" y="188" font-size="10" fill="var(--vp-c-text-3)">bit5 = 1</text>
  <text x="330" y="216" font-size="10" fill="var(--vp-c-text-3)">取反后除 bit5 全是 1</text>
  <text x="330" y="244" font-size="10" fill="var(--vp-c-text-3)">只有 bit5 变 0，其余照旧</text>

  <text x="24" y="276" font-weight="700">错误写法：0xA8 &amp; (1&lt;&lt;5) = 0x20</text>
  <text x="212" y="300" font-size="10.5">AND 上一个只有 bit5 为 1 的数 →</text>
  <text x="212" y="320" font-size="10.5" fill="var(--vp-c-text-3)">所有其他位都被 AND 0 清掉，整个寄存器被毁</text>
</g>
</svg>

</FigBox>

::: tip 例 1 · 置位：把寄存器第 3 位写成 1 {#ex-emb-c-1}
**题目**：寄存器初值 `0x0000 00A0`（二进制 `1010 0000`，即 bit5 和 bit7 为 1）。要把 bit3 置 1。

一个掩码就够，不用先把旧值读出来看。OR 的性质是「OR 0 保留、OR 1 置一」，所以哪怕不知道当前值也能安全置位。这也正是置位比清零省事的地方，清零必须知道哪些位要保住。

步骤：

$$\text{0x00A0} \;|\; (1 \ll 3) = \text{0x00A0} \;|\; \text{0x0008} = \text{0x00A8}$$

换成二进制看：`1010 0000` → `1010 1000`，bit5、bit7 原封不动。

回代验算：读回三位的值，bit3 现在为 1 ✓、bit5 仍为 1 ✓、bit7 仍为 1 ✓，其余位为 0 ✓。三个都过，说明没有误伤。
:::

::: tip 例 2 · 清零：把第 5 位写成 0（最易错的一步） {#ex-emb-c-2}
**题目**：承接上一步的 `0x00A8`，要把 bit5 清 0。

先猜一下：清零要保住其他位，掩码里除了目标位之外全都得是 1。而 `(1<<5)` 恰好相反，只有目标位是 1。所以必须取反，得到「只有目标位是 0」的掩码。这一步之所以是最高频错误，是因为 `|=` 和 `&=` 长得太像，脑子自动套用了置位的掩码。

正确做法，掩码取反：

$$\text{0x00A8} \;\&\; \sim(1 \ll 5) = \text{0x00A8} \;\&\; \text{0xFFFF FFDF} = \text{0x0088}$$

错误做法，忘了取反（初学者高频）：

$$\text{0x00A8} \;\&\; (1 \ll 5) = \text{0x00A8} \;\&\; \text{0x20} = \text{0x0020}$$

结果是除了 bit5 之外所有位都被清掉，整个寄存器被毁。口诀就一句：置位用原掩码，清零用反掩码。

回代验算：用十进制复核。`0xA8 = 168`，`bit5 = 32`，$168-32=136=\text{0x88}$ ✓；错误写法得到 `0x20 = 32`，而 168 与 32 的共同位只有 32，说明确实只剩一位 ✓，这也正是「全毁」的样子。
:::

::: tip 例 3 · 翻转与读位 {#ex-emb-c-3}
**题目**：承接 `0x0088`，翻转 bit7；再读出当前 bit5 的值。

手上这个 `0x0088` 要动两处：翻一位，再读一位。翻转用异或，异或 1 取反、异或 0 保持，所以同一个表达式就能做「切换」。读位则要先右移把目标位挪到最低位，再与 1 相与。顺序反过来会得到一个 0 或 $2^n$ 的数，不是干净的 0/1。直接与为什么会出问题：`reg & (1<<n)` 得到的是「第 n 位仍在原位」的数，判断真假时容易把 0x20 当成 0 以外的一切。

步骤：

$$\text{0x0088} \;\oplus\; (1 \ll 7) = \text{0x0088} \;\oplus\; \text{0x80} = \text{0x0008}$$

bit7 从 1 变成 0。翻转是可逆的，再执行一次 `^= (1<<7)` 又会变回 `0x0088`，所以 `LED_Toggle` 这类操作用异或最自然。

读位：读 `0x0008` 的 bit5：

$$(0\text{x}0008 \gg 5) \;\&\; 1 = 0 \;\&\; 1 = 0$$

即 bit5 当前是 0。先移位再屏蔽这个顺序不能颠倒，写成 `reg & (1<<5)` 得到的会是 `0x00` 或 `0x20`，不是干净的 0/1。

回代验算：把翻转后的 `0x0008` 逐位核对，bit3 = 1（因为 $8=2^3$）、bit7 = 0、其余为 0 ✓，与两次异或的预期一致。
:::

::: tip 例 4 · 写多位的配置字段（位域写入） {#ex-emb-c-4}
**题目**：配置 GPIO 时每个引脚占 4 位（2 位模式 + 2 位速度）。要把 `0x00A0` 的 bit[3:2] 这个两位字段改写成 `01`。

<FigBox title="写一个多位字段：先抹掉整段，再写入新值" kind="结构" note="字段写入与单位置位最大的区别是「必须先清空整段」。如果只把新值的位或上去，旧字段里残留的 1 会留下来，得到 01 或 11 这样的混合值——对时钟分频这类寄存器，混合值往往就是非法配置。">

<svg viewBox="0 0 700 230" role="img" aria-label="位域写入过程：0x00A0 的 bit3 位2 字段先与 ~0x0C 清空，再或上 0x04 得到 0xA4">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="26" font-weight="700">第 1 步：用字段掩码清空 bit[3:2]</text>
  <text x="24" y="56" font-size="11">0x00A0</text>
  <text x="24" y="84" font-size="11">&amp; ~0x0C</text>
  <line x1="24" y1="96" x2="300" y2="96" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="24" y="116" font-size="11">= 0x00A0</text>
  <text x="140" y="56" font-size="10.5" fill="var(--vp-c-text-3)">… 1010 0000</text>
  <text x="140" y="84" font-size="10.5" fill="var(--vp-c-text-3)">… 1111 0011</text>
  <text x="140" y="116" font-size="10.5" fill="var(--vp-c-text-3)">… 1010 0000　字段已是 00</text>

  <text x="380" y="26" font-weight="700">第 2 步：或上新值 01</text>
  <text x="380" y="56" font-size="11">0x00A0</text>
  <text x="380" y="84" font-size="11">| (0b01&lt;&lt;2)</text>
  <line x1="380" y1="96" x2="656" y2="96" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="380" y="116" font-size="11">= 0x00A4</text>
  <text x="496" y="56" font-size="10.5" fill="var(--vp-c-text-3)">… 1010 0000</text>
  <text x="496" y="84" font-size="10.5" fill="var(--vp-c-text-3)">… 0000 0100</text>
  <text x="496" y="116" font-size="10.5" fill="var(--vp-c-text-3)">… 1010 0100　字段为 01</text>

  <text x="24" y="158" font-weight="700">为什么不能分两步写</text>
  <text x="24" y="182" font-size="11">先 |= (1&lt;&lt;2) 再 &amp;= ~(1&lt;&lt;3)：单线程里结果一样，</text>
  <text x="24" y="202" font-size="11" fill="var(--vp-c-text-3)">但两次写之间若被中断插入，硬件会短暂看到字段 = 11（非法组合）</text>
  <text x="24" y="222" font-size="11" fill="var(--vp-c-text-3)">对时钟分频、ADC 采样时间这类寄存器，中间态可能直接触发异常行为</text>
</g>
</svg>

</FigBox>

前面三个动作都只碰一位，这一题要写一个几位宽的字段。动作固定两步，先用字段掩码把整段清零，再把新值或进去，顺序不能颠倒，清空也不能省。为什么不能只做第二步：或运算只写 1，旧值里的 1 会留下，字段最终是什么取决于上一个值，这叫不幂等。

步骤：

```c
uint32_t mask = 0b11 << 2;              // 字段掩码：bit[3:2]
reg = (reg & ~mask) | (0b01 << 2);      // 先清空字段，再写入值
```

代入验证：

$$\text{0x00A0} \;\&\; \sim 0\text{x0C} = \text{0x00A0} \;\&\; \text{0xFFFF FFF3} = \text{0x00A0}$$
$$\text{0x00A0} \;|\; (1 \ll 2) = \text{0x00A4}$$

结果 `0x00A4`，其中 bit[3:2] = `01`（因为 `0xA4 = 1010 0100`，bit3=0、bit2=1）。

为什么不能分两步写（先 `|= (1<<2)` 再 `&= ~(1<<3)`）：单线程里结果相同，可中间一旦被中断打断，硬件会短暂看到一个中间态，字段先变成 `11` 之类。对配置敏感的寄存器（比如时钟分频），中间态可能直接引发故障。所以配字段要一次算好、一次写入。

回代验算：$0\text{xA}4 = 164$；字段值 $=\lfloor(164 \;\&\; 0\text{x0C})/4\rfloor = \lfloor(4)/4\rfloor = 1$，即 `01` ✓；再看字段外的位，$164 \;\&\; \sim 0\text{x0C} = 160 = 0\text{xA0}$，与初始值完全一致，说明没有误伤 ✓。
:::

四个动作写熟之后，编译器会在你看不见的地方动手脚。

## 三、`volatile`：别让编译器把你的代码优化没了

一段在 Debug 版能跑的代码，换成 Release 就死循环，问题往往出在这一行关键字上。

编译器的逻辑很聪明：某个变量在这段代码里没被写过，它就认为这个值不会变，把重复读取优化掉。在 PC 上没问题，单线程、内存只由本线程改。嵌入式里就未必了，有些变量会被编译器看不见的东西改变，比如硬件、中断、另一个任务。

三种场景必须加 `volatile`：

```c
// ① 硬件寄存器（CMSIS 的结构体成员全部带 volatile）
while ((USART1->SR & (1 << 5)) == 0) { }   // 等待发送完成标志

// ② 中断服务程序里修改的标志
volatile uint8_t flag = 0;
void HAL_GPIO_EXTI_Callback(uint16_t pin) { flag = 1; }
int main(void) { while (!flag) { } /* ... */ }

// ③ RTOS / 多线程共享的变量
volatile uint32_t tick_count;
```

不加 `volatile` 会怎样：`while(!flag);` 里编译器发现循环体不修改 `flag`，就优化成「读一次到寄存器，然后死循环」。中断明明把 flag 置 1 了，主循环永远看不到。这类 bug 极其隐蔽，开优化（`-O2`）才出现，关优化（`-O0`）一切正常。

`volatile` 不保证什么：它只保证每次都真的去内存读写，不保证原子性，也不能替代互斥锁。多字节变量的跨任务保护要靠关中断或 RTOS 的同步机制，这是后面要单独讲的话题。

## 四、原子性：为什么需要 `BSRR`，以及位带是什么

先看一行很常见的代码：

```c
GPIOA->ODR |= (1 << 5);   // 看起来是「只改 bit5」
```

它编译后其实是三步机器操作：读 ODR、或运算、写回 ODR。如果这三步之间来了个中断，中断里也改了 ODR 的其他位，中断返回后主程序写回的旧值会把中断的修改覆盖掉。看起来只改了一位，实际是一整字的覆盖。

STM32 为此给了第一条出路，`BSRR`（Bit Set/Reset Register，位置位 / 复位寄存器）：

<FigBox title="BSRR 的两个 16 位半区：低半区置位，高半区清零" kind="结构" note="写 BSRR 只影响你写 1 的那几位，写 0 的位完全不动作——注意这与 ODR「整字覆盖」的本质区别。置位和清零要同时做也能一次写进去：0x0002_0020 就是「bit5 置位、bit9 清零」。">

<svg viewBox="0 0 700 250" role="img" aria-label="BSRR 寄存器：低 16 位 BR 置位，高 16 位 BS 清零；两个例子分别置位 bit5 和清零 bit5">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="24" y="36" width="300" height="46" rx="5" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="174" y="58" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">低 16 位：写 1 的位 → 置位</text>
  <text x="174" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">bit0 ~ bit15 对应引脚 0 ~ 15</text>
  <rect x="336" y="36" width="300" height="46" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="486" y="58" text-anchor="middle" font-weight="700">高 16 位：写 1 的位 → 清零</text>
  <text x="486" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">bit16 ~ bit31 对应引脚 0 ~ 15</text>
  <text x="330" y="30" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">一个字 32 位</text>

  <text x="24" y="120" font-weight="700">置位 bit5：GPIOA-&gt;BSRR = (1 &lt;&lt; 5)</text>
  <text x="24" y="144" font-size="11">写 0x0000 0020 → bit5 变 1，其余引脚不动</text>
  <text x="24" y="164" font-size="10.5" fill="var(--vp-c-text-3)">（若该位当前就是 1，写 1 也不报错，结果仍是 1）</text>

  <text x="380" y="120" font-weight="700">清零 bit5：GPIOA-&gt;BSRR = (1 &lt;&lt; (5+16))</text>
  <text x="380" y="144" font-size="11">写 0x0020 0000 → bit5 变 0，其余引脚不动</text>
  <text x="380" y="164" font-size="10.5" fill="var(--vp-c-text-3)">（等价于 GPIOA-&gt;BRR = (1 &lt;&lt; 5)）</text>

  <line x1="24" y1="188" x2="656" y2="188" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="24" y="212" font-size="11">一次写操作完成，硬件内部改位 → 没有「读—改—写」的窗口，所以不会被中断撕开</text>
  <text x="24" y="234" font-size="11" fill="var(--vp-c-text-3)">这就是 HAL 的 HAL_GPIO_WritePin 内部用 BSRR/BRR 而不是 ODR |= 的原因</text>
</g>
</svg>

</FigBox>

```c
GPIOA->BSRR = (1 << 5);          // 低 16 位：置位 → bit5 = 1
GPIOA->BSRR = (1 << (5 + 16));   // 高 16 位：清零 → bit5 = 0
```

写入 BSRR 是一次写操作，硬件内部完成置位 / 清零，不存在读—改—写的窗口，所以是原子的，中断里改 GPIO 可以放心用。

第二条出路更狠：干脆让「一位」自己拥有一个地址。这就是位带（bit-band，Cortex-M3/M4 内核的一项地址翻译机制，把某个内存区里每一位映射成另一个区里的一整个 32 位字）。

<FigBox title="位带：把某一位映射成一个独立的 32 位字" kind="结构" note="源区的 1 个字节在这个机制里占别名区的 32 个字节（8 位 × 每 4 字节一个字）。所以「想改 bit5」不再是读—改—写，而是往它的别名地址写 1 或 0。代价：只有内核规定的两块源区能用，而且 F1（M3）有、多数 F4 及更新的型号没有这个功能。">

<svg viewBox="0 0 700 300" role="img" aria-label="位带映射：源寄存器 0x4001080C 的每一位映射到别名区从 0x42210180 开始的连续字，bit5 对应 0x42210194">
<defs>
  <marker id="embc-bb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <text x="24" y="26" font-weight="700">源区：GPIOA-&gt;ODR 的一个字节（0x4001 080C）</text>
  <rect x="24" y="36" width="252" height="28" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="60" y1="36" x2="60" y2="64" stroke="var(--vp-c-divider)" stroke-width="0.8" />
  <line x1="96" y1="36" x2="96" y2="64" stroke="var(--vp-c-divider)" stroke-width="0.8" />
  <line x1="132" y1="36" x2="132" y2="64" stroke="var(--vp-c-divider)" stroke-width="0.8" />
  <line x1="168" y1="36" x2="168" y2="64" stroke="var(--vp-c-divider)" stroke-width="0.8" />
  <line x1="204" y1="36" x2="204" y2="64" stroke="var(--vp-c-divider)" stroke-width="0.8" />
  <line x1="240" y1="36" x2="240" y2="64" stroke="var(--vp-c-divider)" stroke-width="0.8" />
  <text x="42" y="55" text-anchor="middle">b7</text>
  <text x="78" y="55" text-anchor="middle">b6</text>
  <text x="114" y="55" text-anchor="middle">b5</text>
  <text x="150" y="55" text-anchor="middle">b4</text>
  <text x="186" y="55" text-anchor="middle">b3</text>
  <text x="222" y="55" text-anchor="middle">b2</text>
  <text x="258" y="55" text-anchor="middle">b1</text>
  <rect x="96" y="36" width="36" height="28" fill="var(--vp-c-brand-1)" opacity="0.18" />
  <text x="114" y="82" text-anchor="middle" fill="var(--vp-c-brand-1)">目标：bit5</text>

  <line x1="114" y1="92" x2="114" y2="112" stroke="var(--vp-c-brand-1)" stroke-width="1.4" marker-end="url(#embc-bb)" />

  <text x="24" y="134" font-weight="700">别名区：每一位占一个 32 位字（从 0x4221 0180 起）</text>
  <rect x="24" y="144" width="252" height="22" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="34" y="159" font-size="10">0x4221 0180 = bit0</text>
  <rect x="24" y="168" width="252" height="22" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="34" y="183" font-size="10">0x4221 0184 = bit1</text>
  <rect x="24" y="192" width="252" height="22" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="34" y="207" font-size="10">0x4221 0188 = bit2 …</text>
  <rect x="24" y="216" width="252" height="24" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="34" y="233" font-size="10" fill="var(--vp-c-brand-1)">0x4221 0194 = bit5 ← 写这里</text>

  <text x="320" y="134" font-weight="700">地址怎么算</text>
  <text x="320" y="158" font-size="11">别名地址 = 别名基址 + 偏移 × 32 + 位号 × 4</text>
  <text x="320" y="182" font-size="10.5" fill="var(--vp-c-text-3)">别名基址：SRAM 区 0x2200 0000，外设区 0x4200 0000</text>
  <text x="320" y="202" font-size="10.5" fill="var(--vp-c-text-3)">偏移 = 源地址 − 源区基址（外设区基址 0x4000 0000）</text>
  <text x="320" y="226" font-size="10.5" fill="var(--vp-c-text-3)">×32：每字节 8 位，每位占 4 字节 → 8×4 = 32</text>
  <text x="320" y="250" font-size="10.5" fill="var(--vp-c-text-3)">代入：0x4200 0000 + 0x1080C×32 + 5×4 = 0x4221 0194</text>
  <text x="320" y="274" font-size="10.5" fill="var(--vp-c-brand-1)">往 0x4221 0194 写 1 → ODR 的 bit5 变 1（一条指令）</text>
</g>
</svg>

</FigBox>

位带的规矩只有三条：

1. 只有两块源区能用：SRAM 的 `0x2000 0000` 起 1 MB、外设区的 `0x4000 0000` 起 1 MB。别的地址没有别名。
2. 别名区基址固定：SRAM 对应 `0x2200 0000`，外设对应 `0x4200 0000`。
3. 换算公式是「别名地址 = 别名基址 + (源地址 − 源区基址) × 32 + 位号 × 4」。乘 32 是因为源区 1 字节要摊成别名区 32 字节，每个位占一个 32 位字，也就是 4 字节。

用一次就明白它好在哪：`*(volatile uint32_t *)0x42210194 = 1;` 这一句就完成了「把 ODR 的 bit5 置 1」，没有读、没有回写、也不会碰到邻居。

::: tip 例 5 · 算一个位的别名地址 {#ex-emb-c-5}
**题目**：要原子地把 GPIOA 的 ODR 第 5 位置 1，别名地址是多少？若改的是 SRAM 里地址 `0x2000 0000` 的第 7 位呢？

看图上那条从 bit5 拉下来的箭头，它落到别名区的一个整字上，地址得自己算。先判断源地址属于哪块源区（SRAM 还是外设），它决定别名基址；再算偏移，最后套公式。三步顺序错了，地址会落在完全无关的地方。写进去当然不会报错，只是改了一个没人看的内存。先判区这一步最要紧：两块别名区基址不同，用错基址算出来的地址依然可写，这类错误最难查。

步骤：

1. GPIOA->ODR 的字节地址是 `0x4001 080C`，落在外设区（`0x4000 0000` 起），别名基址取 `0x4200 0000`。
2. 偏移：$0\text{x}4001080C - 0\text{x}40000000 = 0\text{x}1080C$。
3. 套公式：$0\text{x}42000000 + 0\text{x}1080C\times32 + 5\times4 = 0\text{x}42000000 + 0\text{x}210180 + 0\text{x}14 = \text{0x4221 0194}$。
4. SRAM 那个：源地址就是区首，偏移 0，别名基址 `0x2200 0000`，位 7 → $0\text{x}22000000 + 0 + 28 = \text{0x2200 001C}$。

回代验算：用「每字 4 字节、每字节 32 字节」的数量关系反推。bit5 的别名应落在这个字节别名区起点之后 $5\times4=20$ 字节处，即 `0x4221 0180 + 0x14 = 0x4221 0194` ✓；SRAM 的 bit7 应在区首之后 $7\times4=28$ 字节处，`0x1C` ✓。两个结果与独立算的偏移一致。

先确认你的芯片有没有位带：F1（Cortex-M3）有；多数 F4 及更新的型号并不实现这个功能，写别名地址会直接触发总线错误。用之前翻手册的「Bit banding」一节，别照抄。
:::

位带这条捷径只在部分芯片上存在，而「`volatile` 不保证原子」这个问题在每颗芯片上都存在。再往外放宽一层，还有一批「在 PC 上不算毛病、在单片机上会要命」的 C 习惯。

## 五、嵌入式 C 的额外纪律

在只有几 KB RAM 的机器上写 C，下面这些平时的习惯得改：

| 主题 | 纪律 | 原因 |
| --- | --- | --- |
| 动态内存 | 尽量不用 `malloc` / `free` | 内存碎片；失败时难以恢复；确定性差（实时系统最怕这个） |
| 栈 | 大数组不要放函数内；递归要谨慎 | 栈溢出会静默破坏内存，且默认栈可能只有几 KB |
| 结构体对齐 | 与硬件 / 协议对应的结构体要检查对齐 | 编译器会插填充字节，导致结构体大小和成员偏移与预期不符 |
| `const` | 常量表加 `const` | 会被放进 Flash 而不是占用宝贵的 RAM |
| `static` | 限制作用域，避免全局污染 | 也便于编译器优化 |
| 浮点 | M0/M3 无 FPU，`float` 运算是软件模拟，很慢 | 需要浮点运算选 M4，或改用定点数 |

结构体对齐的例子：

```c
typedef struct {
  uint8_t  a;   // 偏移 0
  uint32_t b;   // 偏移 4（编译器插了 3 字节填充）
  uint8_t  c;   // 偏移 8
} Bad;          // sizeof = 12，不是 6
```

按成员从大到小排列，或者用 `__attribute__((packed))` 消除填充，代价是非对齐访问的性能损失，严重时还会触发硬件错误。

这些纪律在你写第一个驱动时就会一起撞上来：栈溢出、对齐错位、常量占满 RAM，通常同时出现。

## 六、工程实例

为什么 HAL 库的 handle 里到处是 `volatile`：打开 `stm32f1xx_hal_uart.h`，`UART_HandleTypeDef` 里的状态成员都带着 `__IO`，那就是 `volatile` 的宏。UART 的收发状态会被中断服务程序修改，主程序轮询它时必须每次真正读内存。

一个真实的隐蔽 bug：某项目用 `while(!tx_done);` 等 DMA 发送完成，`tx_done` 在 DMA 中断里置位。Debug 版本（`-O0`）正常，Release（`-O2`）死机。原因是 `tx_done` 没加 `volatile`，被优化成只读一次。加上之后两个版本都正常。这类问题只在优化后才暴露，所以尽早用 Release 配置编译验证。

为什么寄存器地址要用结构体而不是一堆宏：`GPIOA->ODR` 让编译器替你算偏移，还能靠类型检查发现「写错寄存器」。代价是结构体成员顺序必须与手册严格一致，这也是 CMSIS 头文件里那些成员不能随手重排的原因。

## 七、易错清单 + 自检

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. 清零忘了取反（写成 `&= (1<<n)`）→ 除目标位外全部清零，整个寄存器被毁，现象是「配置完外设彻底不动」→ `&= ~(1<<n)` 才是清零，记「置位用原掩码、清零用反掩码」。
2. 读位顺序写反（写成 `reg & (1<<n)`）→ 得到 `0x20` 这类值，`if` 判断永远为真 → 先移位再屏蔽：`(reg >> n) & 1`。
3. 改多位字段不分两步（直接 `|= value`）→ 旧字段里的 1 残留，得到 `11` 之类的非法组合 → 先 `& ~mask` 清空整段，再 `| value` 一次写入。
4. 共享变量忘加 `volatile` → `-O0` 正常、`-O2` 死等，断点调试时还看不出来 → 硬件寄存器、中断修改的全局变量、RTOS 共享变量三者必加。
5. 把 `volatile` 当原子 → 多字节变量在中断与主循环之间被撕裂，偶发错值 → 原子性要靠关中断、`BSRR`、或 RTOS 同步机制。
6. 中断里用 `ODR |=` 改 GPIO → 整字读—改—写，覆盖中断里刚改的其它位 → 改用 `BSRR`，或者位带（前提是芯片支持）。
7. 函数里开大数组 → 几 KB 的默认栈瞬间溢出，破坏相邻内存，症状随机 → 改成 `static` 或全局，并核算栈深。
8. 结构体直接映射到硬件或协议 → 填充字节让偏移与预期差几位，读到错的数据 → 检查对齐，必要时 `packed`，但要接受非对齐访问的代价。

自检（答案不在本页，自己说一遍）：

1. 写出「把 32 位寄存器 `reg` 的 bit7 清零、bit3 置位、其余位不变」的两种写法（普通写法 + `BSRR` 原子写法）。
2. `volatile` 必须用的三个场景是什么？它不能保证什么？
3. GPIOA->ODR 的 bit5 在 F1 上的位带别名地址是多少？这个功能在 F407 上能用吗？
4. 一个 8 位寄存器的 bit2 和 bit6 都要置 1，掩码写成什么？为什么不能分两次 `|= ` 写？
5. 把 `0x00A0` 的 bit[5:4] 改写成 `10`，写完后寄存器是多少？

## 八、寄存器会写了之后

寄存器会写了，紧接着会遇到一个新问题：你写的这些代码什么时候执行、跑多快。同样一句 `HAL_Delay(1)`，为什么在 8 MHz 默认时钟下要等 9 倍时间；为什么挂在 APB1 上的定时器算出来的频率正好差一倍。答案全在时钟树里。

<Prereq id="clock-tree" /> → [04 · 时钟系统（RCC 与时钟树）](./clock.md)
