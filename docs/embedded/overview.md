---
title: 01 · 嵌入式与 STM32 概览
description: 嵌入式跟 PC 差在哪、MCU 与 MPU 两条路怎么分、型号每一位在读什么、一颗裸片要配哪四样才肯跑起来。
---

# 01 · 嵌入式与 STM32 概览

<Meta time="30 min" level="了解" note="最容易错的是把「内核」当「芯片」：Cortex-M 只是 CPU 那一部分，串口、定时器这些外设是 ST 自己加的，换一家厂商就用不了" />

买回来的开发板上印着 `STM32F103C8T6`。教程让你装两个软件、点一下「生成代码」，灯就亮了。可那串字母数字在说什么，这块板子凭什么能跑程序，你想加一句串口打印时教程为什么非让你「先把这一路的时钟打开」，都没人讲过。

老师傅扫一眼型号就说「这颗 Flash 太小，别上文件系统」，你听不出他读的是哪几位。换个型号，同一份代码可能编不过，也可能编过了灯不亮。

三个困惑指向同一张地图：这颗芯片里有什么、这些东西怎么被组织起来、哪些参数会先卡住你。地图铺开之后，型号怎么读、板子怎么选、还缺哪几样才能跑，都不用死记。

::: tip 读这页之前
认得二进制和十六进制就够了（`0b1010` 是 10，`0xFF` 是 255），按位与 `&`、按位或 `|` 看得懂即可，这页不会让你算位运算。单位上留意 k 与 M 的差别：1 MHz 是 $10^6$ Hz，而 64 KB 里的 K 是 $1024$。

用到的记号：`0x` 是十六进制前缀，`0b` 是二进制前缀，`<<` 是左移（左移 n 位等于乘 $2^n$），`|=` 是按位或赋值（常用于只把某一位写成 1），`~` 是按位取反。读法都在[符号与约定 · 数字与嵌入式](../guide/notation.md)。

3 个词先各给一句：MCU（Microcontroller Unit，微控制器，国内也叫单片机）是一片芯片里自带 CPU、存储器和外设、上电就能跑程序的东西；MPU（Microprocessor Unit，微处理器）只有 CPU 运算核心，内存得外挂；外设（peripheral）指芯片里除了 CPU 之外那些能独立干活的电路块，串口、定时器、模数转换器都算。

不用先学电路，也不用会第二门语言。后面反复出现的「寄存器」，眼下只要知道它是有地址的内存就够了，那张地址地图在 <Prereq id="register-map" />。
:::

::: tip 心智模型：MCU 是一间拎包入住的小公寓
MPU 像毛坯厂房。CPU 有了，内存、存储、外设全靠你在外面盖，盖好才能开工，所以它必须先跑一段引导程序。MCU 像精装小公寓，厨房、卫生间、床都在屋里，门一开就能住，代价是面积固定，住不下就得换房。

于是选型的日常问题很少是「性能够不够强」，更多是「这间房装不装得下我这些东西」。后面每一章的配置动作，开时钟、配引脚、用 DMA、进睡眠，都是在这间小公寓里省空间、省电、抢时间。
:::

## 一、洗衣机里那块芯片，和你的笔记本差在哪

一个系统只要满足「以计算机为核心，但用户并不知道里面有个计算机」，它就是嵌入式。洗衣机、电表、遥控器、汽车 ECU（Electronic Control Unit，电子控制单元）都算；手机和 PC 不算，因为它们的计算机本身就是产品，你能直接看见、直接操作。

这个定位带来 4 条硬约束。与其说是特点，不如说是约束条件：后面每一章的配置动作，几乎都能追到其中一条。

| 约束 | 具体表现 | 导致的工程习惯 |
| --- | --- | --- |
| 专用 | 只做固定的几件事 | 不需要通用操作系统，裸机循环或轻量 RTOS（Real-Time OS，实时操作系统）就够 |
| 资源受限 | Flash 几十 KB、RAM 几 KB 到几百 KB | 不随便 `malloc`，栈要算着用，避免深递归 |
| 实时性 | 必须在确定时间内响应外部事件 | 中断要快进快出，不长时间关中断 |
| 低功耗 / 成本 | 电池供电、百万量产出货 | 睡眠模式、关掉不用的外设时钟、抠每一分钱 BOM（物料清单）成本 |

一块电表就是这么干活的：每 20 ms 采一次电压、算一次有效值（RMS：按发热效果等效出来的直流值，正弦下 $U=U_m/\sqrt2$，见<Prereq id="rms" />），同时要响应按键、刷新液晶，还得在断电那一瞬间把累计电量写进存储器。它跑不了 Linux，没那么快的内存和外存，也扛不住几十毫秒的调度抖动。可它确实需要一个「任务」的组织方式，这正是 MCU 加 RTOS 的位置。

四条约束划出了「用哪种计算机」的边界。具体到芯片，市面上其实是两条路。

## 二、MCU、MPU 与 SoC：内存放片内还是片外

判断标准很实际：看内存（跑程序用的 RAM 和存程序的 Flash）在不在芯片里面。以 `STM32F103C8T6` 和一块跑 Linux 的板子对比，一眼就能分出来。

<FigBox title="两条路线：内存放片内还是片外" kind="结构" note="左：MCU，CPU、Flash、SRAM、外设都在同一个封装里，上电直接取指运行。右：MPU，芯片里只有 CPU 和存储器控制器，DDR 与 eMMC 在封装外面，所以上电时片内没有可执行的程序，必须先由固化的引导程序把系统从外部存储搬进来。">

<svg viewBox="0 0 720 280" role="img" aria-label="对比图：左边 MCU 把 CPU、Flash、SRAM、外设都集成在片内；右边 MPU 只有 CPU 与内存控制器，DDR 和 eMMC 在片外">
<defs>
  <marker id="ov-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="168" y="26" text-anchor="middle" font-weight="700">MCU：一颗芯片就是一个系统</text>
  <rect x="24" y="42" width="288" height="200" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" stroke-dasharray="6 4" />
  <text x="168" y="60" text-anchor="middle" fill="var(--vp-c-text-3)">芯片封装边界</text>
  <rect x="44" y="76" width="112" height="52" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="100" y="98" text-anchor="middle" font-weight="700">CPU 内核</text>
  <text x="100" y="116" text-anchor="middle" fill="var(--vp-c-text-3)">Cortex-M3</text>
  <rect x="180" y="76" width="112" height="52" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="236" y="98" text-anchor="middle" font-weight="700">Flash 64 KB</text>
  <text x="236" y="116" text-anchor="middle" fill="var(--vp-c-text-3)">存程序</text>
  <rect x="44" y="146" width="112" height="52" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="100" y="168" text-anchor="middle" font-weight="700">SRAM 20 KB</text>
  <text x="100" y="186" text-anchor="middle" fill="var(--vp-c-text-3)">存变量、栈</text>
  <rect x="180" y="146" width="112" height="52" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="236" y="168" text-anchor="middle" font-weight="700">外设</text>
  <text x="236" y="186" text-anchor="middle" fill="var(--vp-c-text-3)">GPIO/UART/ADC</text>
  <text x="168" y="228" text-anchor="middle" fill="var(--vp-c-text-3)">上电即可取指运行</text>

  <text x="552" y="26" text-anchor="middle" font-weight="700">MPU：芯片之外才是系统</text>
  <rect x="408" y="42" width="288" height="118" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" stroke-dasharray="6 4" />
  <text x="552" y="60" text-anchor="middle" fill="var(--vp-c-text-3)">芯片封装边界</text>
  <rect x="428" y="70" width="112" height="52" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="484" y="92" text-anchor="middle" font-weight="700">CPU 内核</text>
  <text x="484" y="110" text-anchor="middle" fill="var(--vp-c-text-3)">Cortex-A</text>
  <rect x="564" y="70" width="112" height="52" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="620" y="92" text-anchor="middle" font-weight="700">内存控制器</text>
  <text x="620" y="110" text-anchor="middle" fill="var(--vp-c-text-3)">管片外存储</text>
  <rect x="428" y="196" width="112" height="46" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="484" y="216" text-anchor="middle" font-weight="700">DDR 内存</text>
  <text x="484" y="232" text-anchor="middle" fill="var(--vp-c-text-3)">程序跑在这里</text>
  <rect x="564" y="196" width="112" height="46" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="620" y="216" text-anchor="middle" font-weight="700">eMMC / SD</text>
  <text x="620" y="232" text-anchor="middle" fill="var(--vp-c-text-3)">程序存在这里</text>
  <line x1="620" y1="122" x2="620" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ov-ar)" />
  <line x1="484" y1="122" x2="484" y2="190" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ov-ar)" />
  <text x="552" y="262" text-anchor="middle" fill="var(--vp-c-text-3)">片内没有可执行程序，必须先跑引导程序（U-Boot）</text>
</g>
</svg>

</FigBox>

| 类型 | 内存 | 典型主频 | 跑什么 | 例子 |
| --- | --- | --- | --- | --- |
| MCU 微控制器 | 片内 Flash + SRAM，上电就能跑 | 几十 ~ 几百 MHz | 裸机循环 / RTOS（FreeRTOS、RT-Thread） | STM32F103、GD32、ESP32 里的 MCU 部分 |
| MPU 微处理器 | 需外挂 DDR、eMMC，上电要先跑 U-Boot | 几百 MHz ~ 几 GHz | Linux / Android | 树莓派（博通）、全志、瑞芯微、NXP i.MX |
| SoC 片上系统 | 看情况 | — | 强调把整个系统集成进一颗芯片 | 手机芯片、STM32MP1（Cortex-A + Cortex-M 双核） |

这门课只在 MCU 这条线上。真要判断该用哪条，问两句就够：需要跑 Linux、需要网络协议栈 / 文件系统 / 复杂图形界面，走 MPU；只需要定时、采集、控制、简单通信，MCU 就够。

路线划清了，下一个问题是这间小公寓里谁管什么。

## 三、ARM Cortex-M 只是内核，不是芯片

ARM 公司自己不造芯片，它只卖内核设计（IP，知识产权核）。ST（意法半导体）、NXP、GD、TI 买过去，配上自己设计的外设，做成各自的芯片。所以「STM32」和「Cortex-M」从来不是一回事：

- Cortex-M 内核是 CPU 本身，包含通用寄存器、指令集（Thumb-2，ARM 的 16/32 位混合指令集，兼顾代码密度与性能）、中断控制器 NVIC、调试接口。
- 外设是 GPIO、定时器、ADC、UART、SPI、I²C、DMA 这些，ST 自己设计，不同系列差异很大。

**NVIC**（Nested Vectored Interrupt Controller，嵌套向量中断控制器）是内核里那个负责「谁可以打断谁」的模块。它记住每个中断源该跳到哪个函数（这叫向量），也记住谁的优先级更高，还能让高优先级中断打断正在执行的低优先级中断（这叫嵌套）。「向量」指的就是中断服务函数的入口地址表。

常见 M 系列内核：

| 内核 | 定位 | 关键特性 | 代表 |
| --- | --- | --- | --- |
| M0 / M0+ | 超低成本、低功耗 | 指令集最小，无除法指令优化 | F0、L0、G0 |
| M3 | 经典主力 | 性能与成本平衡，生态最老 | F1（F103） |
| M4 | 带 DSP 与浮点 | 单精度 FPU（Floating Point Unit，硬件浮点运算单元） | F4（F407）、F3 |
| M7 | 高性能 | 双精度 FPU、指令与数据 Cache、更高主频 | F7、H7 |

它和经典 8 位单片机（8051、AVR）最本质的差别在位宽与地址空间。32 位数据通路意味着算一个 32 位数不用拆成 4 次 8 位运算；32 位地址意味着有一个 4 GB 的线性地址空间，实际只用了其中一小段放 Flash、SRAM 和外设寄存器，指针可以直接指向整个空间里的任何一个字节。后面那句「寄存器就是某个固定地址上的一个 32 位整数」，靠的就是这个线性地址空间。

内核决定算力和指令集，也决定上电后第 1 条指令长什么样；外设决定能接什么。这些信息买芯片时怎么一眼读到？答案写在型号上。

## 四、读懂型号：`STM32F103C8T6` 七段拆开

型号不是随机字符串，每一位都在报参数。拿 `STM32F103C8T6` 来说，7 个字段从家族一路读到温度等级。

<FigBox title="STM32F103C8T6：七个字段各自的含义" kind="结构" note="同一个字段位置在不同系列里含义稳定：类别、子系列、引脚数、Flash 容量、封装、温度等级。会读这一串，选型时就不会在「差一倍容量」上翻车。">

<svg viewBox="0 0 740 250" role="img" aria-label="型号 STM32 F 103 C 8 T 6 七个字段的拆解，每段下面标注含义">
<g font-size="12" fill="var(--vp-c-text-1)">
  <rect x="20" y="52" width="96" height="40" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="68" y="78" text-anchor="middle" font-weight="700">STM32</text>
  <text x="68" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">家族：ST 的</text>
  <text x="68" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">32 位 MCU</text>

  <rect x="124" y="52" width="96" height="40" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="172" y="78" text-anchor="middle" font-weight="700">F</text>
  <text x="172" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">类别：F 通用 /</text>
  <text x="172" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">L 低功耗 / H 高性</text>
  <text x="172" y="142" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">能 / W 无线</text>

  <rect x="228" y="52" width="96" height="40" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="276" y="78" text-anchor="middle" font-weight="700">103</text>
  <text x="276" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">子系列：103 基础</text>
  <text x="276" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">型（M3，72 MHz）</text>

  <rect x="332" y="52" width="96" height="40" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="380" y="78" text-anchor="middle" font-weight="700">C</text>
  <text x="380" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">引脚数：C=48，</text>
  <text x="380" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">R=64，V=100，Z=144</text>

  <rect x="436" y="52" width="96" height="40" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="484" y="78" text-anchor="middle" font-weight="700">8</text>
  <text x="484" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">Flash：8=64 KB，</text>
  <text x="484" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">B=128，C=256，E=512</text>

  <rect x="540" y="52" width="96" height="40" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="588" y="78" text-anchor="middle" font-weight="700">T</text>
  <text x="588" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">封装：T=LQFP，</text>
  <text x="588" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">H=BGA，U=VFQFPN</text>

  <rect x="644" y="52" width="96" height="40" rx="6" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="692" y="78" text-anchor="middle" font-weight="700">6</text>
  <text x="692" y="114" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">温度：6 =</text>
  <text x="692" y="128" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">−40 ~ 85 ℃</text>

  <text x="380" y="188" text-anchor="middle" fill="var(--vp-c-text-3)">两个字段最容易被读错：Flash 容量码是查表值（8 不是 8 KB），</text>
  <text x="380" y="208" text-anchor="middle" fill="var(--vp-c-text-3)">引脚数码决定你能接多少路外设（C 只有 48 脚，两路串口就要算清楚）</text>
</g>
</svg>

</FigBox>

教程里两种写法都会出现，说的是同一件事：

```
STM32  F   103   C    8    T    6
 │     │    │    │    │    │    └─ 温度范围：6 = −40~85℃
 │     │    │    │    │    └────── 封装：T = LQFP，H = BGA，U = VFQFPN
 │     │    │    │    └─────────── Flash 容量：8 = 64 KB，B = 128 KB，Z = 384 KB…
 │     │    │    └──────────────── 引脚数：C = 48 脚，R = 64 脚，V = 100 脚，Z = 144 脚
 │     │    └───────────────────── 子系列：103 = 基础型，407 = 高性能，411…
 │     └────────────────────────── 产品类别：F = 基础/通用，L = 低功耗，H = 高性能，W = 无线
 └──────────────────────────────── 家族：STM32
```

主流系列怎么选：

| 系列 | 内核 | 主频 | 特点 | 适合 |
| --- | --- | --- | --- | --- |
| F1（F103） | M3 | 72 MHz | 最老牌、资料最多、最便宜 | 入门学习、成本敏感的量产 |
| F4（F407） | M4 | 168 MHz | 带 FPU、外设更全 | 需要浮点运算 / 电机 / 音频 |
| L4 / L0 | M4 / M0+ | 80 MHz | 低功耗为设计目标 | 电池供电 |
| H7 | M7 | 400 MHz+ | 高性能、带 Cache | 复杂界面、高速采集 |
| G0 / G4 | M0+ / M4 | 64 / 170 MHz | 新架构，性价比替代 F1 | 新设计选型 |
| WB / WL | M4 + 无线 | — | 片内蓝牙 / LoRa | 物联网节点 |

::: tip 例 1 · 读型号，说出它是什么芯片 {#ex-emb-ov-1}
**题目**：解释 `STM32F103C8T6` 与 `STM32F407VET6` 两个型号，各说出内核、主频、引脚数、Flash 容量，并判断哪个适合带浮点滤波的项目。

<FigBox title="例 1 用到的两个型号，逐位对照" kind="结构" note="左边是入门板「蓝色药丸」上那颗，右边是高性能型号。C 与 V 的差别是 48 脚对 100 脚，8 与 E 的差别是 64 KB 对 512 KB，两个都是数量级上的差距。">

<svg viewBox="0 0 700 220" role="img" aria-label="两个型号逐位对照表：STM32F103C8T6 与 STM32F407VET6 的类别、子系列、引脚、容量、封装、温度">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="30" font-weight="700">字段</text>
  <text x="220" y="30" text-anchor="middle" font-weight="700">F103C8T6</text>
  <text x="520" y="30" text-anchor="middle" font-weight="700">F407VET6</text>
  <line x1="24" y1="42" x2="676" y2="42" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="24" y="66">类别</text>
  <text x="220" y="66" text-anchor="middle">F：通用基础</text>
  <text x="520" y="66" text-anchor="middle">F：通用基础</text>
  <text x="24" y="94">子系列 / 内核</text>
  <text x="220" y="94" text-anchor="middle">103 / M3，72 MHz</text>
  <text x="520" y="94" text-anchor="middle">407 / M4 + FPU，168 MHz</text>
  <text x="24" y="122">引脚</text>
  <text x="220" y="122" text-anchor="middle">C：48 脚</text>
  <text x="520" y="122" text-anchor="middle">V：100 脚</text>
  <text x="24" y="150">Flash</text>
  <text x="220" y="150" text-anchor="middle">8：64 KB</text>
  <text x="520" y="150" text-anchor="middle">E：512 KB</text>
  <text x="24" y="178">封装 / 温度</text>
  <text x="220" y="178" text-anchor="middle">LQFP / −40~85 ℃</text>
  <text x="520" y="178" text-anchor="middle">LQFP / −40~85 ℃</text>
  <line x1="24" y1="196" x2="676" y2="196" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="350" y="212" text-anchor="middle" fill="var(--vp-c-text-3)">同一个家族里，子系列这一位就决定了内核与主频，其余位只改「装多少东西」</text>
</g>
</svg>

</FigBox>

先猜一句：两个型号只差中间几位，直觉上应该差不多。真拆开就知道差得很多，光 Flash 就差八倍。

第一步不是背参数，是按位置切片。把型号写成七段，每段单独查表。四个要问的量（内核、主频、引脚、Flash）分别落在第二、第三、第四、第五段，一位不错位就不会算错。*（为什么按位置切而不整体记：型号后面的数字是查表值不是数量，整体记必然记混。）*

步骤：

1. 切段：`STM32` | `F` | `103` | `C` | `8` | `T` | `6`。
2. 查表读：103 → Cortex-M3、最高 72 MHz；C → 48 脚；8 → 64 KB Flash；T → LQFP 封装；6 → 工业级温度。*（为什么第三个字段要查表：103 不是 103 MHz，它是子系列编号。）*
3. 第二个型号：407 → Cortex-M4、168 MHz、带单精度 FPU；V → 100 脚；E → 512 KB Flash。
4. 落结论：要跑浮点滤波（每毫秒几百次乘加），选 M4 的 F407。M3 没有硬件浮点，`float` 全靠软件模拟，慢一个量级。

回代核一遍 RAM。F103C8T6 是 64 KB Flash / 20 KB SRAM，F407VET6 是 512 KB Flash / 192 KB SRAM，容量比 8:1，与 Flash 的差距一致地偏大，跟容量码与容量同向增长的规律对得上 ✓。

顺带记一句：这就是俗称「蓝色药丸」的最小系统板上那颗芯片，48 脚、64 KB Flash、20 KB SRAM。它成了入门首选，靠的是资料最多、最便宜、坏了不心疼，跟性能没什么关系。
:::

型号读得懂，接着就是自己的项目该挑哪一颗。

## 五、选型：先算够不够，再看买不买得到

选型不是比参数表，是回答四个问题。

1. 算力够不够。要跑浮点滤波、电机 FOC（磁场定向控制）就得有 M4 的 FPU；只是采数据发串口，M0 都够。
2. 存储够不够。Flash 放代码和常量，RAM 放全局变量、栈、堆和 RTOS 任务栈。按最坏情况估，留 30% 以上余量。
3. 外设对不对得上。需要几路 UART？要 CAN 吗？ADC 要几通道、多少位？USB 是 Device 还是 Host？
4. 供货与成本。量产项目里供货稳定性和价格往往比性能更重要，这也是 2007 年发布的 F103 至今仍在大量出货的原因。

四个问题按顺序问下来，答案常常先出现在第 2 条：手上一颗 `STM32F103C8T6` 到底装不装得下。最先爆的通常是 RAM，它不像 Flash 那样能靠删代码省下来。

::: tip 例 2 · 估算一个项目的资源够不够 {#ex-emb-ov-2}
**题目**：需求是采集 4 路传感器（ADC）、驱动一块 128×64 的 OLED（I²C）、串口上报（UART）、跑 FreeRTOS 管理 3 个任务。手上一颗 `STM32F103C8T6`（64 KB Flash / 20 KB SRAM），够吗？

<FigBox title="例 2 的 RAM 预算：8.5 KB 是怎么堆出来的" kind="结构" note="每一格都是最坏情况而不是平均值：任务栈按最大调用深度算，缓冲按整帧算。20 KB 里已用 8.5 KB，余量约 57%，看起来宽松；但只要任务栈翻倍、再开一路 DMA 双缓冲，余量就会掉到四分之一。">

<svg viewBox="0 0 700 240" role="img" aria-label="20 KB SRAM 的预算条：任务栈 1.5 KB、内核与堆 4 KB、缓冲区 2 KB、全局变量 1 KB，合计 8.5 KB，余量 11.5 KB">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="26" font-weight="700">20 KB SRAM 的分配（1 KB = 32 px）</text>
  <rect x="24" y="44" width="48" height="34" fill="var(--vp-c-brand-1)" opacity="0.85" />
  <rect x="72" y="44" width="128" height="34" fill="var(--vp-c-brand-1)" opacity="0.6" />
  <rect x="200" y="44" width="64" height="34" fill="var(--vp-c-brand-1)" opacity="0.4" />
  <rect x="264" y="44" width="32" height="34" fill="var(--vp-c-brand-1)" opacity="0.25" />
  <rect x="296" y="44" width="344" height="34" fill="none" stroke="var(--vp-c-border)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="48" y="66" text-anchor="middle" font-size="10" fill="#fff">1.5</text>
  <text x="136" y="66" text-anchor="middle" font-size="10" fill="#fff">4</text>
  <text x="232" y="66" text-anchor="middle" font-size="10" fill="#fff">2</text>
  <text x="280" y="66" text-anchor="middle" font-size="10" fill="#fff">1</text>
  <text x="468" y="66" text-anchor="middle" fill="var(--vp-c-text-3)">余量 11.5 KB（约 57%）</text>

  <text x="24" y="106" font-size="10.5" fill="var(--vp-c-text-3)">1.5 KB 任务栈　4 KB 内核与堆　2 KB 串口 + OLED 显存　1 KB 全局与 ADC 缓冲</text>

  <text x="24" y="150" font-weight="700">同一张图，任务栈翻倍并开 DMA 双缓冲之后</text>
  <rect x="24" y="166" width="96" height="30" fill="var(--vp-c-brand-1)" opacity="0.85" />
  <rect x="120" y="166" width="128" height="30" fill="var(--vp-c-brand-1)" opacity="0.6" />
  <rect x="248" y="166" width="64" height="30" fill="var(--vp-c-brand-1)" opacity="0.4" />
  <rect x="312" y="166" width="96" height="30" fill="var(--vp-c-brand-1)" opacity="0.25" />
  <rect x="408" y="166" width="32" height="30" fill="var(--vp-c-brand-1)" opacity="0.18" />
  <rect x="440" y="166" width="200" height="30" fill="none" stroke="var(--vp-c-border)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="408" y="206" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">已用 13.75 KB，余量 31%</text>
  <text x="540" y="186" text-anchor="middle" fill="var(--vp-c-text-3)">仍在安全区，但已逼近 30% 警戒线</text>
</g>
</svg>

</FigBox>

图上已经把两种情形并排画了：8.5 KB 在 20 KB 里时余量 57%，任务栈一翻倍、再开一路 DMA 双缓冲，余量就掉到 31%。改两处配置就吃掉一半。

这里要做的不是算一个数，是把每项开销按最坏情况累加，再看剩下的余量安不安全。RAM 的每一项都得问一句「最大会是多少」，而不是「平时是多少」。*（为什么先算 RAM 而不是 Flash：Flash 不够可以删功能、砍库，RAM 不够只能换芯片；而且 RAM 会在最深的调用栈上突然爆掉，症状是随机死机。）*

步骤：

1. 3 个 RTOS 任务栈，每个 512 字节 → $3\times512=1536$ 字节 ≈ 1.5 KB。
2. FreeRTOS 内核对象与堆 → 约 4 KB。
3. 串口收发缓冲 + OLED 显存：$128\times64/8=1024$ 字节 = 1 KB，加串口约 1 KB → 约 2 KB。*（OLED 显存为什么除以 8：每个像素只占一位，8 个像素挤在一个字节里。）*
4. 全局变量与 ADC 缓冲 → 约 1 KB。
5. 合计 $1.5+4+2+1=8.5$ KB，占 20 KB 的 42.5%，余量 57.5%。

回代换一条路再算一遍。假如把任务栈加到 1 KB（3 KB 合计）、再开一路 DMA 双缓冲（+2.25 KB），总占用 $3+4+2+1+2.25=12.25$ KB，占 61%，余量 39%。仍然够，但已经贴到警戒线；更稳的做法是换 `CBT6`（128 KB Flash）或 `RCT6`（64 脚 / 256 KB Flash）同级更大容量的型号 ✓。

Flash 单独再算一次：带 HAL 库加 FreeRTOS 的中等规模工程约 40~60 KB，64 KB 会很紧张，建议直接上 128 KB 的 CBT6。两条估算指向同一个型号。
:::

选型不是「找一颗性能好的」，是「找一颗刚好装得下的」。装得下还要点得亮，最后回到板子上。

## 六、最小系统：裸片跑起来还缺什么

<FigBox title="最小系统四要素：电源、复位、时钟、调试下载口" kind="结构" note="四样缺一不可，且各有各的失效症状：电源不够会随机复位，复位脚被拉低会一直停住，时钟不起振会卡在等待就绪的循环里，调试口不通则连程序都下不进去。BOOT0 决定上电后从哪里取指，是第 5 个隐藏开关。">

<svg viewBox="0 0 700 300" role="img" aria-label="最小系统框图：MCU 居中，四周分别是电源、复位、外部晶振时钟和 SWD 调试口，下方是 BOOT0 启动选择">
<defs>
  <marker id="ov-sys" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="256" y="96" width="180" height="108" rx="10" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  <text x="346" y="130" text-anchor="middle" font-weight="700">STM32 裸片</text>
  <text x="346" y="152" text-anchor="middle" fill="var(--vp-c-text-3)">内核 + Flash + SRAM</text>
  <text x="346" y="172" text-anchor="middle" fill="var(--vp-c-text-3)">+ 外设</text>

  <rect x="30" y="40" width="168" height="60" rx="8" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="114" y="64" text-anchor="middle" font-weight="700">① 电源 3.3 V</text>
  <text x="114" y="84" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">每组 VDD 旁 100 nF 去耦</text>
  <line x1="198" y1="76" x2="250" y2="112" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-sys)" />

  <rect x="30" y="200" width="168" height="60" rx="8" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="114" y="224" text-anchor="middle" font-weight="700">② 复位 NRST</text>
  <text x="114" y="244" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">10 kΩ 上拉 + 100 nF 到地</text>
  <line x1="198" y1="224" x2="250" y2="188" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-sys)" />

  <rect x="502" y="40" width="168" height="60" rx="8" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="586" y="64" text-anchor="middle" font-weight="700">③ 时钟 HSE 8 MHz</text>
  <text x="586" y="84" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">晶振 + 两个负载电容</text>
  <line x1="502" y1="76" x2="442" y2="112" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-sys)" />

  <rect x="502" y="200" width="168" height="60" rx="8" fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="586" y="224" text-anchor="middle" font-weight="700">④ SWD 调试口</text>
  <text x="586" y="244" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">SWDIO + SWCLK + GND</text>
  <line x1="502" y1="224" x2="442" y2="188" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-sys)" />

  <rect x="256" y="244" width="180" height="44" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="346" y="262" text-anchor="middle" font-size="11">BOOT0 = 0 → 从 Flash 启动</text>
  <text x="346" y="280" text-anchor="middle" font-size="11" fill="var(--vp-c-text-3)">BOOT0 = 1 → 进系统 BootLoader（ISP）</text>
  <line x1="346" y1="204" x2="346" y2="240" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
</g>
</svg>

</FigBox>

下面 4 样东西各管一件事，第 1 样最容易接错。

1. 电源。VDD/VSS 往往有多组引脚，每组旁边放 100 nF 去耦电容（尽量贴近引脚），再并一个 10 µF 的储能电容。去耦电容的作用是芯片瞬间拉电流时就近供电，别让电压被拉塌。
2. 复位。NRST 引脚，通常 10 kΩ 上拉加 100 nF 到地就是上电复位（很多芯片内部已有上拉，外部可以简化）。
3. 时钟。8 MHz 晶振（HSE，High Speed External，高速外部时钟）加两个负载电容，通常 20 pF 量级，具体看晶振规格书；RTC 另配 32.768 kHz。不用外部晶振也能跑（切到内部 HSI），但精度差、串口波特率容易出错，原因在[04 · 时钟系统](./clock.md)。
4. 调试下载口。SWD（Serial Wire Debug，串行线调试）只要两根信号线（SWDIO 数据、SWCLK 时钟）加 GND，比 JTAG 省引脚，是 ST-Link 的标准接法。再引出 VCC 就能给目标板供电，或者由目标板自供电。

另外还有 BOOT0 / BOOT1 两个引脚，决定上电后从哪里取指：BOOT0 = 0 从主 Flash 启动，正常工作；BOOT0 = 1 进芯片内部固化的系统 BootLoader，可以用串口下载程序，也就是 ISP（In-System Programming，在系统编程）。

四样接对，板子就活了。可实际调试时「不跑」的原因常常不在原理，而在某一只引脚的状态。

::: tip 例 3 · 拿到一块新板子，先确认什么 {#ex-emb-ov-3}
**题目**：一块陌生的 STM32 板子，程序能下载成功但 LED 不闪。按什么顺序排查？

<FigBox title="排查顺序：从「芯片从哪取指」查到「时钟有没有到」" kind="结构" note="四条按出现频率从高到低排，也按省时间的先后排。顺序的意义在于每条都是上一条成立的前提：BOOT0 错了根本不会跑你的程序，后面三条查得再对也没用。">

<svg viewBox="0 0 700 200" role="img" aria-label="四步排查流程：BOOT0 电平、是否真的在跑、时钟配置是否成功、复位脚状态">
<defs>
  <marker id="ov-chk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="16" y="52" width="150" height="76" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="91" y="76" text-anchor="middle" font-weight="700">① BOOT0 电平</text>
  <text x="91" y="96" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">必须为低，才从 Flash</text>
  <text x="91" y="112" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">启动</text>

  <rect x="186" y="52" width="150" height="76" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="261" y="76" text-anchor="middle" font-weight="700">② 是否真在跑</text>
  <text x="261" y="96" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">调试器看 PC 是否</text>
  <text x="261" y="112" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">停在 main 里</text>

  <rect x="356" y="52" width="150" height="76" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="431" y="76" text-anchor="middle" font-weight="700">③ 时钟是否起振</text>
  <text x="431" y="96" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">卡在等 HSE 就绪</text>
  <text x="431" y="112" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">时先切 HSI 定位</text>

  <rect x="526" y="52" width="150" height="76" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="601" y="76" text-anchor="middle" font-weight="700">④ NRST 被拉低</text>
  <text x="601" y="96" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">芯片一直处于</text>
  <text x="601" y="112" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">复位状态</text>

  <line x1="168" y1="90" x2="182" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-chk)" />
  <line x1="338" y1="90" x2="352" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-chk)" />
  <line x1="508" y1="90" x2="522" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ov-chk)" />
  <text x="350" y="168" text-anchor="middle" fill="var(--vp-c-text-3)">每条都是下一条的前提：前一条错，后一条查得再仔细也白费</text>
</g>
</svg>

</FigBox>

下载成功、灯不亮，第一嫌疑总落在 `main` 里，于是回头翻代码找错。这个方向八成是白费，因为下载成功只证明调试口连通、Flash 写进去了，不证明芯片在取指执行。

所以先查硬件给芯片的四项条件。这四项都是必要条件，不是「可能原因」之一。*（为什么先查 BOOT0：它是唯一一个「下载完全正常、程序就是不跑」的开关，也是现场最常见的那条。）*

步骤：

1. 量 BOOT0，必须为低。为高则芯片上电进了 BootLoader 等在那里，你的程序根本没被取指执行。
2. 确认真的在跑。用调试器看程序计数器 PC 是否停在 `main` 里，或者在 `while(1)` 里翻转 LED。
3. 查时钟配置。外部晶振没焊或不起振时，`SystemClock_Config()` 会卡在等待 HSE 就绪的循环里（HAL 会死等或返回错误）。先切内部 HSI 验证，能跑就说明是晶振的问题。
4. 查复位。NRST 被意外拉低，比如复位按键卡住、外部电容漏电，芯片一直处于复位状态，读不到你写的程序。

回代反过来验一遍：任一条不满足，第一行代码都执行不到。BOOT0 高则取指地址不对；PC 不在 `main` 说明程序没进；时钟不起振则外设全废；NRST 低则内核被按住。四条同时满足，程序就必然在跑 ✓。

带走一句就够：板子不跑，先查环境（电源、时钟、BOOT0、复位），再查代码。
:::

## 七、工程实例：两个选型上的取舍

2026 年了还有大量产品在用 2007 年发布的 F103。`STM32F103C8T6` 那颗 64 KB 的芯片今天照样在出货，因为它早就不只是一款芯片，而是一个生态：十几年的中文教程、成熟的原理图、大量已验证的代码、极低的单价和极稳的供货。工程选型里，「能被稳定复现」往往比「参数漂亮」更值钱。反过来，全新项目如果不需要兼容老代码，G0/G4 系列在价格和功耗上都更划算。

还有一类产品，一颗芯片里既有 M4 又有 M0，比如 STM32WB、STM32MP1。因为两类任务的需求是冲突的：无线协议栈要实时响应，应用逻辑要算力。用小核专门跑协议栈、大核跑应用，比在一个核上硬挤可靠得多。这和后面讲 RTOS 时的「任务分离」是同一个思路。

这两条取舍写不进参数表，只能从踩过的坑里学。把这页最容易踩的坑排一遍：

## 易错清单（按踩坑频率排序）

1. 把 MCU 和 MPU 的区别说成「主频高低」→ 选型时以为降频就能当单片机用，实际是上电没有可执行程序、根本跑不起来 → 分界线是内存是否在片内。
2. 把 Cortex-M 当芯片 → 以为 F4 的 HAL 代码能直接搬到 NXP 的 M4 上 → 内核相同不等于外设相同，换厂商必须重写外设驱动。
3. 型号里的 Flash 容量码当乘数 → 以为 `8` 是 8 KB，按这个估预算方案直接废掉 → 容量码是查表值：`8`=64 KB、`B`=128 KB、`C`=256 KB、`E`=512 KB。
4. 忽略 IO 电平 → 3.3 V 的引脚直连 5 V 器件，轻则不识别、重则烧脚 → STM32 的 IO 是 3.3 V 电平，只有标注 FT（Five-volt Tolerant，五伏容忍）的引脚才容忍 5 V，其余要加电平转换。
5. BOOT0 被拉高 → 下载成功、程序不跑，白白怀疑代码一整天 → BOOT0 接地才从 Flash 启动。
6. 选型先看 Flash 后看 RAM → 带 RTOS 和缓冲区的项目 RAM 先不够，运行时随机死机 → 先按最坏情况算 RAM，留 30% 以上余量。

## 自检

合上页面，试着自己说一遍（答案不在这页）：

1. `STM32F103C8T6` 的内核、主频、引脚数、Flash 容量分别是多少？`STM32F407VET6` 呢？
2. 一个 MCU 最小系统必须包含哪四部分？少一样会分别出现什么症状？
3. 「同一份 HAL 代码能跨 F1/F4，但不能跨到别家 M4」，这条说法背后的分工是什么？

## 下一步

地图有了，还没动手。真正的第一步是把工具链搭起来：编译器怎么把 C 变成 ARM 指令、CubeMX 生成的工程里哪块能改、点灯那三步究竟在动哪几个寄存器。

→ [02 · 开发环境与第一个工程](./environment.md)
