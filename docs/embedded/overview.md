---
title: 01 · 嵌入式与 STM32 概览
description: 嵌入式系统与 PC 的真正分界、MCU 与 MPU 两条路线、Cortex-M 内核与外设的分工、型号命名逐位拆解、最小系统四要素与选型四问；配型号拆解图、两条路线框图、最小系统框图与资源估算例题。
---

# 01 · 嵌入式与 STM32 概览

<Meta time="30 min" level="了解" note="最容易错的是把「内核」当「芯片」：Cortex-M 只是 CPU 那一部分，串口、定时器这些外设是 ST 自己加的，换一家厂商就用不了" />

**这一页要解决什么**：你买回来一块开发板，上面印着 `STM32F103C8T6`。教程让你装几个软件、点一下「生成代码」，然后灯就亮了——但那串字母数字在说什么、这块板子凭什么能跑程序，你并不知道。这一页把四件事讲清楚：嵌入式系统与 PC 到底差在哪、MCU 和 MPU 是两条什么路、这颗芯片型号的每一位是什么意思、它靠哪几样东西才能活。读完你应该能对着任意一块 STM32 板子说出它属于什么级别、够不够你的项目用，以及最小系统缺了哪一样它就不跑。

::: tip 读这页之前
- **需要会**：二进制与十六进制互转（`0b1010` 是 10，`0xFF` 是 255），认得按位与 `&`、按位或 `|` 这两个运算符；还有单位词头 k 与 M 的差别——1 MHz = $10^6$ Hz，而 64 KB 里的 K 是 $1024$。这一页不会让你算位运算，只需要看得懂。
- **这一页用到的符号**：`0x` 是十六进制前缀、`0b` 是二进制前缀、`<<` 是左移（左移 n 位等于乘 $2^n$）、`|=` 是按位或赋值（常用于「只把某一位写成 1」）、`~` 是按位取反。全部读法见[符号与约定 · 数字与嵌入式](../guide/notation.md)。
- **三个词先给一句话**：**MCU**（Microcontroller Unit，微控制器，国内常叫单片机）是一片芯片里自带 CPU、存储器和外设、上电就能直接跑程序的芯片；**MPU**（Microprocessor Unit，微处理器）是只有 CPU 运算核心、必须外挂内存才能跑的芯片；**外设**（peripheral）指芯片里除了 CPU 之外那些能独立干活的电路块——串口、定时器、模数转换器都算。
- **不要求会**：不用先学电路，也不用会别的编程语言。这一页只建地图，不写复杂代码。
- **一个预告**：后面会反复出现「寄存器」这个词，它其实就是有地址的内存——那张地址地图在 <Prereq id="register-map" /> 里，本页只需要知道有这么回事。
:::

你手上是一块二十几块钱的最小系统板：插上 USB，板上的 LED 按你写下的节奏闪。可是换个型号，同一份代码可能编不过，也可能编过了灯不亮；你想加一句串口打印，教程说「先把这一路的时钟打开」，你不知道为什么非开不可；老师傅扫一眼型号就说「这颗 Flash 太小，别上文件系统」，你也听不出他读的是哪几位。

三个困惑其实指向同一张地图：**这颗芯片里有什么、这些东西是怎么被组织起来的、以及哪些参数会先卡住你**。这一页就把这张地图铺开——从「什么叫嵌入式」开始，一直讲到「你手上这块板子的型号怎么读、还缺哪几样才能跑」。

## 结论先行

这一页的结论先集中放这里，每条一句话，后面每一节展开其中一条。

1. **嵌入式系统 = 藏在设备里、专做一件事的计算机系统**；它与 PC 的根本区别不是「小」，而是**专用 + 资源受限 + 常常要求实时**。
2. **MCU 与 MPU 的分界线是「内存是否在片内」**：MCU 上电就能跑裸机或 RTOS，MPU 得先跑引导程序再起 Linux。
3. **Cortex-M 是内核（CPU + 中断控制器 + 调试口），外设是厂商加的**；所以同一份 HAL 代码能在 F1/F4/H7 之间搬，换一家厂商就搬不动。
4. **型号每一位都在报参数**：`STM32F103C8T6` 的 8 不是「8 KB」而是 64 KB Flash，读错一位选型就翻车。
5. **最小系统四件套：电源、复位、时钟、调试下载口**，任何一块能跑的板子都少不了这四样。

::: tip 心智模型：MCU 是一间「拎包入住」的小公寓
MPU 像毛坯厂房：CPU 有了，内存、存储、外设全靠你在外面盖，盖好才能开工（这就是为什么它要先跑引导程序）。MCU 像精装小公寓：厨房、卫生间、床都在屋里，门一开就能住——代价是面积固定，住不下就得换房。

所以嵌入式选型的日常问题不是「性能够不够强」，而是「这间房装不装得下我这些东西」。后面每一章讲的配置动作（开时钟、配引脚、用 DMA、进睡眠），都是在这间小公寓里省空间、省电、抢时间。
:::

## 一、什么是嵌入式系统

这一节只回答一个问题：洗衣机里的那块芯片，和你的笔记本到底差在哪。

一个系统只要满足「**以计算机为核心，但用户并不知道里面有个计算机**」，它就是嵌入式。洗衣机、电表、遥控器、汽车 ECU（Electronic Control Unit，电子控制单元）都是；手机和 PC 不是——它们的计算机本身就是产品，你能直接看见、直接操作。

这个定位带来四条硬约束。它们不是「特点」，而是**约束条件**：后面每一章的配置动作，几乎都能追溯到这四条之一。

| 约束 | 具体表现 | 导致的工程习惯 |
| --- | --- | --- |
| **专用** | 只做固定的几件事 | 不需要通用操作系统，裸机循环或轻量 RTOS（Real-Time OS，实时操作系统）就够 |
| **资源受限** | Flash 几十 KB、RAM 几 KB 到几百 KB | 不随便 `malloc`，栈要算着用，避免深递归 |
| **实时性** | 必须在确定时间内响应外部事件 | 中断要快进快出，不长时间关中断 |
| **低功耗 / 成本** | 电池供电、百万量产出货 | 睡眠模式、关掉不用的外设时钟、抠每一分钱 BOM（物料清单）成本 |

举个具体的例子：一块电表要每 20 ms 采一次电压、算一次有效值，同时响应按键、刷新液晶、还要在断电瞬间把累计电量写进存储器。它跑不了 Linux（没那么快的内存和外存，也不允许几十毫秒的调度抖动），但又确实需要一个「任务」的组织方式——这正是 MCU 加 RTOS 的位置。

四条约束划出了「用哪种计算机」的边界，那么具体有哪两条技术路线可选？下一节就把 MCU、MPU、SoC 这三个常被混用的词分清。

## 二、MCU、MPU 与 SoC

这一节只做一件事：给这三个天天被混用的词划出可执行的界限。

判断标准很实际：**看内存（运行程序用的 RAM 和存放程序的 Flash）是不是在芯片里面**。

<FigBox title="两条路线：内存放片内还是片外" kind="结构" note="左：MCU——CPU、Flash、SRAM、外设都在同一个封装里，上电直接取指运行。右：MPU——芯片里只有 CPU 和存储器控制器，DDR 与 eMMC 在封装外面，所以上电时片内没有可执行的程序，必须先由固化的引导程序把系统从外部存储搬进来。">

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
| **MCU** 微控制器 | 片内 Flash + SRAM，上电就能跑 | 几十 ~ 几百 MHz | 裸机循环 / RTOS（FreeRTOS、RT-Thread） | STM32F103、GD32、ESP32 里的 MCU 部分 |
| **MPU** 微处理器 | 需外挂 DDR、eMMC，上电要先跑 U-Boot | 几百 MHz ~ 几 GHz | Linux / Android | 树莓派（博通）、全志、瑞芯微、NXP i.MX |
| **SoC** 片上系统 | 看情况 | — | 强调「把整个系统集成进一颗芯片」 | 手机芯片、STM32MP1（Cortex-A + Cortex-M 双核） |

本课程在 **MCU 这条线**上。判断该用哪条的实用标准是：需要跑 Linux、需要网络协议栈 / 文件系统 / 复杂图形界面 → MPU；只需要定时、采集、控制、简单通信 → MCU。

路线划清了，下一个问题是「这间小公寓里谁管什么」——也就是内核与外设的分工。下一节就拆开芯片内部。

## 三、ARM Cortex-M 内核

这一节回答：为什么说「STM32」和「Cortex-M」不是一回事，以及这个区别对你的代码意味着什么。

ARM 公司自己不造芯片，它只卖**内核设计**（IP，知识产权核）。ST（意法半导体）、NXP、GD、TI 买过去，配上自己设计的外设，做成各自的芯片。所以「STM32」和「Cortex-M」是两个层次的东西：

- **Cortex-M 内核**：CPU 本身——通用寄存器、指令集（Thumb-2，ARM 的 16/32 位混合指令集，兼顾代码密度与性能）、中断控制器 **NVIC**、调试接口。
- **外设**：GPIO、定时器、ADC、UART、SPI、I²C、DMA 等，这些是 ST 自己设计的，不同系列差异很大。

这里出现一个必须就地解释的缩写：**NVIC**（Nested Vectored Interrupt Controller，嵌套向量中断控制器）是内核里那个负责「谁可以打断谁」的模块——它记住每个中断源该跳到哪个函数（这叫向量），也记住谁的优先级更高，还能让高优先级中断打断正在执行的低优先级中断（这叫嵌套）。「向量」指的是中断服务函数的入口地址表。

常见 M 系列内核：

| 内核 | 定位 | 关键特性 | 代表 |
| --- | --- | --- | --- |
| **M0 / M0+** | 超低成本、低功耗 | 指令集最小，无除法指令优化 | F0、L0、G0 |
| **M3** | 经典主力 | 性能与成本平衡，生态最老 | **F1（F103）** |
| **M4** | 带 DSP 与浮点 | **单精度 FPU**（Floating Point Unit，硬件浮点运算单元） | **F4（F407）**、F3 |
| **M7** | 高性能 | 双精度 FPU、指令与数据 Cache、更高主频 | F7、H7 |

它和经典 8 位单片机（8051、AVR）最本质的差别是**位宽与地址空间**：32 位数据通路意味着算一个 32 位数不需要拆成四次 8 位运算；32 位地址意味着有一个 4 GB 的线性地址空间（实际只用了其中一小段来放 Flash、SRAM 和外设寄存器），指针可以直接指向整个空间里的任何一个字节。这两条后面会反复用到——比如「寄存器就是某个固定地址上的一个 32 位整数」，正是靠这个线性地址空间才成立。

内核决定了算力和指令集，外设决定了能接什么。那么这些信息在买芯片时怎么一眼读到？答案就在型号里——下一节把那串字母数字逐位拆开。

## 四、读懂 STM32 的型号

这一节只做一件事：把 `STM32F103C8T6` 拆成七个字段，并说清每个字段怎么影响你的选型。

型号不是随机字符串，每一位都有含义：

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

原始排版（两种写法说的是同一件事，教程里两种都会出现）：

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
| **F1**（F103） | M3 | 72 MHz | 最老牌、资料最多、最便宜 | 入门学习、成本敏感的量产 |
| **F4**（F407） | M4 | 168 MHz | 带 FPU、外设更全 | 需要浮点运算 / 电机 / 音频 |
| **L4 / L0** | M4 / M0+ | 80 MHz | 低功耗为设计目标 | 电池供电 |
| **H7** | M7 | 400 MHz+ | 高性能、带 Cache | 复杂界面、高速采集 |
| **G0 / G4** | M0+ / M4 | 64 / 170 MHz | 新架构，性价比替代 F1 | 新设计选型 |
| **WB / WL** | M4 + 无线 | — | 片内蓝牙 / LoRa | 物联网节点 |

::: tip 例 1 · 读型号，说出它是什么芯片 {#ex-emb-ov-1}
**题目**：解释 `STM32F103C8T6` 与 `STM32F407VET6` 两个型号，各说出内核、主频、引脚数、Flash 容量，并判断哪个适合带浮点滤波的项目。

<FigBox title="例 1 用到的两个型号，逐位对照" kind="结构" note="左边是入门板「蓝色药丸」上那颗，右边是高性能型号。注意 C 与 V 的差别是 48 脚对 100 脚，8 与 E 的差别是 64 KB 对 512 KB——两个都是数量级差异。">

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

**先想什么**：第一步不是背参数，而是按位置切片——把型号写成七段，每段单独查表。四个要问的量（内核、主频、引脚、Flash）分别落在第二、第三、第四、第五段，一位不错位就不会算错。*（为什么按位置切而不整体记：型号后面的数字是查表值不是数量，整体记必然记混。）*

**步骤**：

1. 切段：`STM32` | `F` | `103` | `C` | `8` | `T` | `6`。
2. 查表读：103 → Cortex-M3、最高 72 MHz；C → 48 脚；8 → 64 KB Flash；T → LQFP 封装；6 → 工业级温度。*（为什么第三个字段要查表：103 不是 103 MHz，它是子系列编号。）*
3. 第二个型号：407 → Cortex-M4、168 MHz、带单精度 FPU；V → 100 脚；E → 512 KB Flash。
4. 结论：要跑浮点滤波（每毫秒几百次乘加），选 M4 的 F407——M3 没有硬件浮点，`float` 全靠软件模拟，慢一个量级。

**验算**：RAM 也一起核对。F103C8T6 是 64 KB Flash / 20 KB SRAM，F407VET6 是 512 KB Flash / 192 KB SRAM（容量比 8:1，与 Flash 一致地偏大），与「同一位数越大容量越大」的规律吻合 ✓。

**顺带记一句**：这就是俗称「**蓝色药丸**」的最小系统板上那颗芯片，48 脚、64 KB Flash、20 KB SRAM。它成为入门首选不是因为性能强，而是因为资料最多、最便宜、坏了不心疼。
:::

型号读得懂，接下来要回答的是另一个问题：假如型号有一堆可选，你自己的项目该挑哪一颗。下一节把它变成四个可问的问题。

## 五、选型时到底看什么

这一节只回答一个问题：手上一张参数表，先看哪几行、怎么算够不够。

选型不是比参数表，而是回答四个问题：

1. **算力够不够**：要跑浮点滤波、电机 FOC（磁场定向控制）→ 必须有 M4 的 FPU；只是采数据发串口 → M0 都够。
2. **存储够不够**：Flash 放代码和常量，RAM 放全局变量、栈、堆和 RTOS 任务栈。**按最坏情况估，并留 30% 以上余量**。
3. **外设对不对得上**：需要几路 UART？要 CAN 吗？ADC 要几通道、多少位？USB 是 Device 还是 Host？
4. **供货与成本**：量产项目里供货稳定性和价格往往比性能更重要——这也是 2007 年发布的 F103 至今仍在大量出货的原因。

四个问题里，**最先爆的通常是 RAM**，因为它不像 Flash 那样能靠删代码省下来。看一个具体的估算。

::: tip 例 2 · 估算一个项目的资源够不够 {#ex-emb-ov-2}
**题目**：需求是采集 4 路传感器（ADC）、驱动一块 128×64 的 OLED（I²C）、串口上报（UART）、跑 FreeRTOS 管理 3 个任务。手上一颗 `STM32F103C8T6`（64 KB Flash / 20 KB SRAM），够吗？

<FigBox title="例 2 的 RAM 预算：8.5 KB 是怎么堆出来的" kind="结构" note="每一格都是「最坏情况」而不是平均值：任务栈按最大调用深度算，缓冲按整帧算。20 KB 里已用 8.5 KB，余量约 57%，看起来宽松；但只要任务栈翻倍、再开一路 DMA 双缓冲，余量就会掉到四分之一。">

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

**先想什么**：这道题不是算一个数，而是**把每项开销按最坏情况累加**，再看剩下的余量够不够安全。RAM 的每一项都要问一句「最大会是多少」，而不是「平时是多少」。*（为什么先算 RAM 而不是 Flash：Flash 不够可以删功能、砍库，RAM 不够只能换芯片；而 RAM 又会在最深的调用栈上突然爆掉，症状是随机的死机。）*

**步骤**：

1. 3 个 RTOS 任务栈，每个 512 字节 → $3\times512=1536$ 字节 ≈ 1.5 KB。
2. FreeRTOS 内核对象与堆 → 约 4 KB。
3. 串口收发缓冲 + OLED 显存：$128\times64/8=1024$ 字节 = 1 KB，加串口约 1 KB → 约 2 KB。*（OLED 显存为什么除以 8：每个像素只占一位，8 个像素挤在一个字节里。）*
4. 全局变量与 ADC 缓冲 → 约 1 KB。
5. 合计 $1.5+4+2+1=8.5$ KB，占 20 KB 的 42.5%，余量 57.5%。

**验算**：用另一条路径复核——假如把任务栈加到 1 KB（3 KB 合计）、再开一路 DMA 双缓冲（+2.25 KB），总占用 $3+4+2+1+2.25=12.25$ KB，占 61%，余量 39%。仍然够，但已接近警戒线；此时更稳的做法是换 `CBT6`（128 KB Flash）或 `RCT6`（64 脚 / 256 KB Flash）同级更大容量的型号 ✓。

**Flash 单独算一遍**：带 HAL 库 + FreeRTOS 的中等规模工程约 40~60 KB，64 KB 会很紧张，**建议直接上 128 KB 的 CBT6**。结论与 RAM 的估算指向同一个型号。
:::

两个估算都指向同一个型号，这说明选型不是「找一颗性能好的」，而是「找一颗刚好装得下的」。装了哪些东西靠这张预算表，那么把它通电跑起来又需要什么？最后一节回到板子上。

## 六、最小系统：让一颗裸片跑起来需要什么

这一节回答：芯片焊到板上之后，还差哪几样东西它才会跑第一条指令。

<FigBox title="最小系统四要素：电源、复位、时钟、调试下载口" kind="结构" note="四样缺一不可，且各有各的失效症状：电源不够会随机复位，复位脚被拉低会一直停住，时钟不起振会卡在等待就绪的循环里，调试口不通则连程序都下不进去。BOOT0 决定上电后从哪里取指，是第五个「隐藏开关」。">

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

四样东西各管一件事：

1. **电源**：VDD/VSS 往往有多组引脚，每组旁边放 100 nF 去耦电容（尽量贴近引脚），再并一个 10 µF 的储能电容。去耦电容的作用是当芯片瞬间拉电流时就近供电，避免电压被拉塌。
2. **复位**：NRST 引脚，通常 10 kΩ 上拉 + 100 nF 到地构成上电复位（很多芯片内部已有上拉，外部可简化）。
3. **时钟**：8 MHz 晶振（HSE，High Speed External，高速外部时钟）+ 两个负载电容（通常 20 pF 量级，具体看晶振规格书）；RTC（实时时钟）另配 32.768 kHz。不用外部晶振也能跑（切到内部 HSI），但精度差、串口波特率容易出错——原因在[04 · 时钟系统](./clock.md)。
4. **调试下载口**：**SWD**（Serial Wire Debug，串行线调试）只要两根信号线（SWDIO 数据、SWCLK 时钟）加 GND，比 JTAG 省引脚，是 ST-Link 的标准接法。再引出 VCC 即可给目标板供电（或由目标板自供电）。

另外还有 **BOOT0 / BOOT1** 两个引脚，决定上电后从哪里取指：BOOT0 = 0 从主 Flash 启动（正常工作），BOOT0 = 1 进入芯片内部固化的系统 BootLoader（可用串口下载程序，即 ISP，In-System Programming，在系统编程）。

四样都接对，板子就活了；可实际调试时「不跑」的原因往往不在原理，而在某一只引脚的状态。看一道排查题。

::: tip 例 3 · 拿到一块新板子，先确认什么 {#ex-emb-ov-3}
**题目**：一块陌生的 STM32 板子，程序能下载成功但 LED 不闪。按什么顺序排查？

<FigBox title="排查顺序：从「芯片从哪取指」查到「时钟有没有到」" kind="结构" note="四条按「越靠前越常见、越靠前越省时间」排列。顺序的意义在于：每一条都是上一条成立的前提——BOOT0 错了根本不会跑你的程序，后面三条查得再对也没用。">

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

**先想什么**：症状是「下载成功但不运行」，这类问题不要从代码找起，而要从**硬件给芯片的条件**找起——因为下载成功只证明调试口通了，不证明芯片在跑你的程序。*（为什么先查 BOOT0：它是唯一一个「下载完全正常、程序就是不跑」的开关，也是最常见的现场原因。）*

**步骤**：

1. 量 BOOT0：必须为低。为高则芯片上电进了 BootLoader，等在那里，你的程序根本没被取指执行。
2. 确认真的在跑：用调试器看程序计数器 PC 是否停在 `main` 里，或在 `while(1)` 里翻转 LED。
3. 查时钟配置：若外部晶振没焊或不起振，`SystemClock_Config()` 会卡在等待 HSE 就绪的循环里（HAL 会死等或返回错误）。先切到内部 HSI 验证，能跑就说明是晶振的问题。
4. 查复位：NRST 被意外拉低（比如复位按键卡住、外部电容漏电），芯片一直处于复位状态，读不到你写的程序。

**验算**：四条都是「必要条件」而不是「可能原因」，可以反过来验：任意一条不满足，芯片都无法执行你写的第一行代码——BOOT0 高则取指地址不对；PC 不在 `main` 则说明程序没进；时钟不起振则外设全废；NRST 低则内核被按住。四条同时满足后程序就必须在跑 ✓。

**这一节最该带走的一句**：板子不跑，先查环境（电源、时钟、BOOT0、复位），再查代码。
:::

到这里，芯片选型、型号、最小系统都清楚了。最后两节把视角拉远，看看这套东西在真实项目里怎么被使用与取舍。

## 七、工程实例

**为什么 2026 年了还有大量产品在用 2007 年发布的 F103？** 因为它已经不是「一款芯片」，而是一个**生态**：十几年的中文教程、成熟的原理图、大量已验证的代码、极低的单价和极稳的供货。工程选型里，「能被稳定复现」往往比「参数漂亮」更有价值。反过来，全新项目如果不需要兼容老代码，G0/G4 系列在价格和功耗上都更划算。

**为什么很多产品一颗芯片里既有 M4 又有 M0？**（如 STM32WB、STM32MP1）因为两类任务的需求是冲突的：无线协议栈要求实时响应，应用逻辑要求算力。用一个小核专门跑协议栈、一个大核跑应用，比在一个核上硬挤要可靠得多——这和后面讲 RTOS 时的「任务分离」是同一个思路。

这两条取舍不会写进参数表，只能从踩过的坑里学。把这一页最容易踩的坑排成清单，就是下一节。

## 易错清单（按踩坑频率排序）

1. **把 MCU 和 MPU 的区别说成「主频高低」** → 选型时以为降频就能当单片机用，实际是上电没有可执行程序、根本跑不起来 → 记住分界线是**内存是否在片内**。
2. **把 Cortex-M 当芯片** → 以为 F4 的 HAL 代码能直接搬到 NXP 的 M4 上 → 内核相同不等于外设相同，换厂商必须重写外设驱动。
3. **型号里的 Flash 容量码当乘数** → 以为 `8` 是 8 KB，按这个估预算方案直接废掉 → 容量码是查表值：`8`=64 KB、`B`=128 KB、`C`=256 KB、`E`=512 KB。
4. **忽略 IO 电平** → 3.3 V 的引脚直连 5 V 器件，轻则不识别、重则烧脚 → STM32 的 IO 是 3.3 V 电平，只有标注 FT（Five-volt Tolerant，五伏容忍）的引脚才容忍 5 V，其余要加电平转换。
5. **BOOT0 被拉高** → 下载成功、程序不跑，白白怀疑代码一整天 → BOOT0 接地才从 Flash 启动。
6. **选型先看 Flash 后看 RAM** → 带 RTOS 和缓冲区的项目 RAM 先不够，运行时随机死机 → 先按最坏情况算 RAM，留 30% 以上余量。

## 自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. `STM32F103C8T6` 的内核、主频、引脚数、Flash 容量分别是多少？`STM32F407VET6` 呢？
2. 一个 MCU 最小系统必须包含哪四部分？少一样会分别出现什么症状？
3. 「同一份 HAL 代码能跨 F1/F4，但不能跨到别家 M4」——这条说法背后的分工是什么？

## 下一步

这一页只建了地图，还没动手。真正的第一步是把工具链搭起来：编译器怎么把 C 变成 ARM 指令、CubeMX 生成的工程里哪块能改、点灯那三步究竟在动哪几个寄存器。

→ [02 · 开发环境与第一个工程](./environment.md)
