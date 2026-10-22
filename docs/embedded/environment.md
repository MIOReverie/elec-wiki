---
title: 02 · 开发环境与第一个工程
description: 工具链三件事与交叉编译到底在做什么、CubeMX 生成了什么、USER CODE 保护区为什么能救命、点灯三步的顺序、HAL 与寄存器的两套写法、SWD 与三种启动方式；配工具链框图、代码保护区示意图、LED 限流电阻电路与 CRH 位段图。
---

# 02 · 开发环境与第一个工程

<Meta time="40 min" level="了解" note="三个坑：交叉编译不是「装个编译器」、写在 USER CODE 外的代码会被重新生成覆盖、点灯第一步的时钟使能漏了不报错" />

**这一页要解决什么**：你按教程装完 CubeIDE，新建工程、点一下生成、编译通过，然后——灯不亮，或者过了两天重新生成一次代码，自己写的几百行没了。这一页要回答三件事：**装的那堆东西各自在干什么**（尤其是「交叉编译」这个词到底指什么）、**CubeMX 生成出来的代码里哪些能改哪些不能改**、以及**点灯那三步为什么一步都不能少**。读完你应该能从零建一个能跑的工程，并且知道程序是怎么从一行 C 变成芯片里的一条指令的。

::: tip 读这页之前
- **需要会**：欧姆定律 $U=IR$（算 LED 限流电阻要用，见 <Prereq id="ohm" />）；会读十六进制数和按位运算的写法（`0x`、`<<`、`|=`、`&=`、`~`），读法见[符号与约定 · 数字与嵌入式](../guide/notation.md)。
- **这一页用到的符号**：`|=` 是按位或赋值（常用于「把某一位写成 1」）、`&=` 配合 `~` 是按位与赋值（常用于「把某一位写成 0」）、`<<` 是左移（左移 n 位等于乘 $2^n$）、`0x` 是十六进制前缀。还有两个寄存器名反复出现：`RCC->APB2ENR`（外设时钟使能寄存器）与 `GPIOC->CRH`（引脚 8~15 的配置寄存器）。
- **需要会一点点 C**：认得变量、函数、结构体、指针就够，这一页的代码都是照抄级别的；指针为什么能指向寄存器，是[03 · 嵌入式 C](./embedded-c.md) 的主题。
- **三个词先给一句话**：**交叉编译**（cross compile）是在一种机器上生成另一种机器能执行的代码；**工具链**（toolchain）是编译器、汇编器、链接器和一组配套工具的总称；**固件**（firmware）指最终烧进芯片 Flash 里的那个二进制文件。
:::

装环境的第一个下午通常是这样过去的：下载 IDE、装驱动、插上 ST-Link、新建工程、点「生成代码」、编译——全绿。然后你把程序下载进去，灯不亮。你改代码、重新生成、再编译，结果上次写的东西不见了。旁边的人说「你没开时钟」，你打开了，灯亮了，但你不知道为什么开一个「时钟」能让寄存器开始工作。

这一页就把这三个卡点依次拆开：先把工具链里每个零件摆到台面上，再看 CubeMX 到底吐出了什么，最后落在这块板子上最小的一件事——点亮一颗 LED。

## 结论先行

这一页的结论集中放这里，每条一句话，后面每一节展开其中一条。

1. **工具链只有三件事**：把 C 编译成 ARM 机器码（交叉编译器）、把引脚和时钟配好（CubeMX）、把固件灌进芯片并调试（ST-Link 加调试服务器）；IDE 只是把它们打包。
2. **交叉编译的「交叉」指架构不同**：编译器跑在 x86 的 PC 上，产出的却是 ARM 指令，所以必须用 `arm-none-eabi-gcc` 而不是系统自带的 `gcc`。
3. **CubeMX 的产物里只有 `USER CODE BEGIN/END` 之间的代码会被保留**，写在别处，下次重新生成就没了。
4. **点灯三步的顺序不能换**：开 GPIO 时钟 → 配引脚为输出 → 写电平；漏第一步的症状是「配置都不报错，但一点反应也没有」。
5. **HAL 优先，按需下探**：入门与跨型号移植用 HAL，时序吃紧或排查硬件时换 LL 或直接写寄存器；下载调试走 SWD 两根线，串口 ISP 只用来救砖。

::: tip 心智模型：生成代码是「装修队交房」，USER CODE 是你可以摆家具的位置
CubeMX 像装修队：按时钟树和引脚表把水电（初始化代码）布好，然后交房。`USER CODE BEGIN/END` 那几块是合同里写明的「业主自装区」，装修队下次返工时不会动；其余墙面（生成的初始化代码）他们有权改动、重刷、甚至拆掉重来。

所以你的应用逻辑一律写进保护区，而「修改生成结果」这种念头要提前掐掉——想改配置，就回 `.ioc` 改，让装修队重做一遍。
:::

## 一、工具链到底是什么

这一节只回答一个问题：装完 IDE 之后，你机器上多了哪些零件，它们各自负责哪一段。

把嵌入式开发想成「在 PC 上写代码，给另一台机器运行」，中间必须有三段：把 C 变成机器码、把引脚和时钟配置对、把成果送进芯片。三段各有一件工具。

<FigBox title="一条固件的三段旅程：编译 → 配置 → 下载" kind="结构" note="上排是「代码变成什么」，下排是「配置与调试怎么参与」。要注意 .elf 与 .hex/.bin 的分工：.elf 带调试信息（哪条机器码对应哪行 C），调试器靠它单步；.hex/.bin 是纯数据，烧写和量产用它。">

<svg viewBox="0 0 720 320" role="img" aria-label="工具链框图：C 源码经交叉编译器生成 elf 与 hex，经 SWD 下载到芯片 Flash，CubeMX 提供初始化代码与 ioc 配置">
<defs>
  <marker id="ev-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="ev-ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="16" y="60" width="132" height="64" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="82" y="84" text-anchor="middle" font-weight="700">你的 C 源码</text>
  <text x="82" y="104" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">main.c …</text>

  <rect x="182" y="52" width="150" height="80" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="257" y="76" text-anchor="middle" font-weight="700">交叉编译器</text>
  <text x="257" y="96" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">arm-none-eabi-gcc</text>
  <text x="257" y="116" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">跑在 x86，产出 ARM 指令</text>

  <rect x="366" y="30" width="150" height="52" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="441" y="52" text-anchor="middle" font-weight="700">.elf（带调试信息）</text>
  <text x="441" y="70" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">断点、单步要用它</text>
  <rect x="366" y="102" width="150" height="52" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="441" y="124" text-anchor="middle" font-weight="700">.hex / .bin</text>
  <text x="441" y="142" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">纯数据，烧写量产用</text>

  <rect x="552" y="30" width="150" height="124" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="627" y="54" text-anchor="middle" font-weight="700">ST-Link + OpenOCD</text>
  <text x="627" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">经 SWD 写 Flash</text>
  <text x="627" y="96" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">设断点、读变量、</text>
  <text x="627" y="112" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">停下来看寄存器</text>
  <text x="627" y="136" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">芯片里：Flash 0x0800 0000</text>

  <line x1="150" y1="92" x2="178" y2="92" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ev-ar)" />
  <line x1="334" y1="76" x2="362" y2="58" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ev-ar)" />
  <line x1="334" y1="110" x2="362" y2="126" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ev-ar)" />
  <line x1="518" y1="92" x2="548" y2="92" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ev-ar)" />

  <rect x="16" y="212" width="316" height="86" rx="8" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="174" y="236" text-anchor="middle" font-weight="700">STM32CubeMX：配置 → 生成代码</text>
  <text x="174" y="258" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">引脚复用表、时钟树、外设参数 → .ioc（下次还能改）</text>
  <text x="174" y="278" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">加初始化 C 代码（SystemClock_Config、MX_GPIO_Init）</text>
  <line x1="174" y1="208" x2="174" y2="140" stroke="var(--vp-c-text-3)" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#ev-ar2)" />
  <text x="348" y="196" font-size="10.5" fill="var(--vp-c-text-3)">配置的结果最终也变成 C 源码，</text>
  <text x="348" y="212" font-size="10.5" fill="var(--vp-c-text-3)">一并交给同一个交叉编译器</text>
</g>
</svg>

</FigBox>

| 环节 | 工具 | 作用 | 产物 |
| --- | --- | --- | --- |
| **配置** | STM32CubeMX | 图形化分配引脚、配时钟树、生成初始化代码 | `.ioc` 文件 + 初始化 C 代码 |
| **编译** | `arm-none-eabi-gcc`（交叉编译器） | 在 x86 PC 上编译出 ARM 指令 | `.o` → `.elf` → `.hex` / `.bin` |
| **下载调试** | ST-Link / J-Link + OpenOCD | 通过 SWD 把固件写进 Flash，支持断点单步 | — |

### 交叉编译：这个名字里三个词各说一件事

**为什么叫「交叉编译」**：编译器是一个普通程序，它跑在你的 PC 上（x86 指令集），但它吐出来的代码要跑在 ARM 上（另一套指令集）。一条指令在两种架构里编码完全不同，所以 PC 自带的 `gcc` 编出来的东西芯片根本认不了——这也是新手最容易的误解：以为「装了编译器就能编单片机」。

名字 `arm-none-eabi-gcc` 里的三段正好回答了三个问题：

- **arm**：目标架构是 ARM，不是 x86；
- **none**：没有操作系统（no OS）——程序直接跑在裸机上，没有 Linux 帮你分配内存、处理文件；
- **eabi**：Embedded Application Binary Interface，嵌入式应用二进制接口，规定了函数怎么传参、结构体怎么摆放，保证不同人编出来的库能互相链接。

这三段合起来就是「**给 ARM 架构、无操作系统环境、按嵌入式 ABI 生成代码的编译器**」。你装 IDE 时它被默默装进某个目录，IDE 每次点编译就是去调它。

还有两个文件在这一步登场，后面会反复听到：

- **启动文件**（startup 开头、后缀 `.s` 的汇编文件）：上电后执行的**第一段代码**。它做的事很朴素：把栈指针设到 RAM 末尾、把已初始化的全局变量从 Flash 拷到 RAM、把未初始化的清零，然后跳到 `main`。
- **链接脚本**（`.ld` 文件）：一张地址分配表，规定「代码段放 Flash 的哪个地址、变量放 RAM 的哪个地址、栈放在哪」。换芯片型号时它必须跟着换，因为 Flash 和 RAM 的起止地址变了。

一段 C 变成芯片里一条指令，这条路走通了；但「配置引脚和时钟」这活儿不该靠人手算——下一节看 CubeMX 把这件事做成了什么。

## 二、CubeMX 生成了什么

这一节只回答一个问题：生成出来的那些文件里，哪些是你的、哪些是它的。

CubeMX 做两件手工做起来极易出错的事：**引脚复用分配**（一个引脚可能有五六个功能，选错就冲突）和**时钟树计算**（倍频分频一串，算错就超频）。它把结果写进 `.ioc` 文件，并生成一套初始化代码。

生成的工程结构（CubeIDE 典型布局）：

```
项目/
├─ Core/
│  ├─ Inc/           头文件：main.h、gpio.h、stm32f1xx_it.h…
│  └─ Src/           源文件：main.c、gpio.c、stm32f1xx_it.c…
├─ Drivers/
│  ├─ CMSIS/         内核相关（Cortex-M 的寄存器定义）
│  └─ STM32F1xx_HAL_Driver/   HAL 库源码
├─ Startup/          启动文件（startup_stm32f103xb.s）
├─ 项目.ioc          CubeMX 配置文件（双击可用 CubeMX 打开）
└─ STM32F103C8TX_FLASH.ld    链接脚本（决定代码放在 Flash 的哪里）
```

`main.c` 的骨架是这样的——**注意注释里那两行「用户代码」保护区**：

```c
int main(void) {
  HAL_Init();                  // 初始化 HAL 库（含 SysTick 时基）
  SystemClock_Config();        // 配置时钟树（CubeMX 生成）
  MX_GPIO_Init();              // 配置 GPIO（CubeMX 生成）

  while (1) {
    /* USER CODE BEGIN 3 */     // ← 你的代码写在这里
    /* USER CODE END 3 */
  }
}
```

**关键约定**：只有写在 `USER CODE BEGIN` 和 `USER CODE END` 之间的代码，才会在你下次用 CubeMX 改配置、重新生成时**被保留**；写在外面的会被覆盖。这是新手丢代码的头号原因。

<FigBox title="重新生成时的分界线：谁会被覆盖" kind="结构" note="每次点「生成代码」，生成器都会按 .ioc 重算并重写整份文件，唯一的例外是保护区。所以正确的开发姿势是：配置改动一律回 .ioc 做，应用逻辑一律写在保护区里；两者不要混在同一段代码里。">

<svg viewBox="0 0 660 300" role="img" aria-label="main.c 的重新生成边界示意：初始化调用会被覆盖，USER CODE 保护区会被保留">
<defs>
  <marker id="ev-gen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="24" y="26" width="300" height="240" rx="8" fill="none" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="174" y="48" text-anchor="middle" fill="var(--vp-c-text-3)">main.c（生成的文件）</text>

  <rect x="44" y="62" width="260" height="30" rx="4" fill="var(--vp-c-bg-soft)" stroke="none" />
  <text x="56" y="82" font-size="11">HAL_Init();</text>
  <rect x="44" y="98" width="260" height="30" rx="4" fill="var(--vp-c-bg-soft)" stroke="none" />
  <text x="56" y="118" font-size="11">SystemClock_Config();</text>
  <rect x="44" y="134" width="260" height="30" rx="4" fill="var(--vp-c-bg-soft)" stroke="none" />
  <text x="56" y="154" font-size="11">MX_GPIO_Init();</text>

  <rect x="44" y="176" width="260" height="34" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="56" y="198" font-size="11" fill="var(--vp-c-brand-1)">/* USER CODE BEGIN 3 */</text>
  <rect x="44" y="210" width="260" height="30" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="56" y="230" font-size="11">HAL_GPIO_TogglePin(…);</text>
  <rect x="44" y="240" width="260" height="22" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="56" y="255" font-size="11" fill="var(--vp-c-brand-1)">/* USER CODE END 3 */</text>

  <line x1="330" y1="90" x2="392" y2="90" stroke="var(--vp-c-text-3)" stroke-width="1.4" marker-end="url(#ev-gen)" />
  <line x1="330" y1="222" x2="392" y2="222" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ev-gen)" />

  <rect x="400" y="62" width="236" height="86" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="518" y="84" text-anchor="middle" font-weight="700">重新生成：整段重写</text>
  <text x="518" y="106" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">按 .ioc 重算参数，</text>
  <text x="518" y="122" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">你手改的内容全部丢失</text>
  <text x="518" y="140" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">（这三行只是「被改」）</text>

  <rect x="400" y="186" width="236" height="76" rx="8" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="518" y="208" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">重新生成：原样保留</text>
  <text x="518" y="230" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">你的应用逻辑写在这里</text>
  <text x="518" y="248" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">改配置只回 .ioc，别改生成代码</text>
</g>
</svg>

</FigBox>

配置和骨架都有了，接下来才是真正的第一行应用代码。下一节从硬件算起：一颗 LED 该怎么接、串多大电阻。

## 三、第一个工程：点亮一颗 LED

这一节做两件事：先把硬件算对（LED 串多大电阻），再把软件三步的顺序讲清（为什么第一步不能漏）。

### 硬件：LED 必须串限流电阻

LED 是电流驱动器件——它的亮度由电流决定，而它的伏安特性很陡：电压稍微高一点，电流就冲上去了。所以不能把 LED 直接挂到 IO 上，必须串**限流电阻**，由欧姆定律决定阻值：

$$R = \frac{V_{CC} - V_F}{I_F}$$

其中 $V_F$ 是 LED 的正向压降（forward voltage，导通后它两端几乎恒定的那个电压；红光约 1.8~2.0 V，蓝/白光约 3.0~3.3 V），$I_F$ 是想要的工作电流（普通指示 LED 取 5~10 mA 即可）。

<FigBox title="LED 的两条路：拉电流与灌电流" kind="电路" note="左：IO 输出高电平，电流从引脚流出经 LED 到地，叫拉电流。右：LED 阳极接 3.3 V、阴极接引脚，IO 输出低电平时电流从引脚灌入地，叫灌电流——最小系统板的 PC13 就是这种接法，所以它是低电平点亮。两种接法的电阻都在中间那个位置。" >

<svg viewBox="0 0 660 230" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="ev-led" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<text x="150" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">拉电流（高电平点亮）</text>
<rect x="46" y="46" width="208" height="152" rx="8" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="60" y="66" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">IO 输出高</text>
<line x1="60" y1="90" x2="150" y2="90"/>
<g transform="translate(180 90)">
<line x1="-30" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="30" y2="0"/>
</g>
<line x1="210" y1="90" x2="240" y2="90"/>
<text x="180" y="72" text-anchor="middle" dominant-baseline="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R</text>
<line x1="150" y1="90" x2="150" y2="130"/>
<g transform="translate(150 150) rotate(90)">
<polygon points="-10,-10 -10,10 8,0" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="8" y1="-10" x2="8" y2="10" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
</g>
<line x1="150" y1="170" x2="150" y2="182"/>
<line x1="60" y1="182" x2="240" y2="182"/>
<line x1="60" y1="182" x2="60" y2="90"/>
<line x1="70" y1="128" x2="70" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ev-led)"/>
<text x="150" y="212" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电流从引脚流出 → 单脚总输出有上限</text>

<text x="490" y="26" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">灌电流（低电平点亮）</text>
<rect x="386" y="46" width="208" height="152" rx="8" stroke="var(--vp-c-divider)" stroke-width="1.2"/>
<text x="400" y="66" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">VDD = 3.3 V</text>
<line x1="400" y1="90" x2="470" y2="90"/>
<text x="404" y="106" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">阳极接电源</text>
<g transform="translate(500 90)">
<polygon points="-10,-10 -10,10 8,0" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="8" y1="-10" x2="8" y2="10" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
</g>
<line x1="530" y1="90" x2="540" y2="90"/>
<g transform="translate(566 90)">
<line x1="-26" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="26" y2="0"/>
</g>
<line x1="470" y1="90" x2="470" y2="130"/>
<line x1="400" y1="90" x2="400" y2="182"/>
<line x1="400" y1="182" x2="580" y2="182"/>
<line x1="580" y1="182" x2="580" y2="90"/>
<line x1="580" y1="120" x2="580" y2="90" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ev-led)"/>
<text x="490" y="212" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电流灌入引脚 → PC13 就是这种接法</text>
<text x="330" y="226" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">同一个电流方向问题：灌电流是「引脚吸收」，拉电流是「引脚输出」</text>
</svg>

</FigBox>

::: tip 例 1 · 算 LED 的限流电阻 {#ex-emb-env-1}
**题目**：用 3.3 V 供电、红色 LED（$V_F = 2.0$ V），想让它工作在 10 mA；若改用 5 V 供电，电阻取多少？

<FigBox title="例 1 的电路：一个电压、一个电阻、一颗 LED" kind="电路" note="LED 不是电阻，它的伏安曲线很陡，所以「按 2.0 V 减掉、剩下全给电阻」这个做法只在导通后成立。计算用的 2.0 V 是它的正向压降，不是内阻的产物。" >

<svg viewBox="0 0 460 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
<defs>
  <marker id="ev-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<line x1="60" y1="60" x2="60" y2="140"/>
<path d="M 52 60 L 68 60" stroke-width="2.6"/>
<path d="M 56 74 L 64 74"/>
<text x="44" y="96" text-anchor="end" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">3.3 V</text>
<line x1="60" y1="60" x2="160" y2="60"/>
<g transform="translate(190 60)">
<line x1="-30" y1="0" x2="-10" y2="0"/>
<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="none"/>
<line x1="10" y1="0" x2="30" y2="0"/>
</g>
<line x1="220" y1="60" x2="300" y2="60"/>
<text x="190" y="42" text-anchor="middle" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-it">R = ?</text>
<line x1="300" y1="60" x2="300" y2="96"/>
<g transform="translate(300 116) rotate(90)">
<polygon points="-10,-10 -10,10 8,0" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-text-1)" stroke-width="1.6"/>
<line x1="8" y1="-10" x2="8" y2="10" stroke="var(--vp-c-text-1)" stroke-width="2.2"/>
</g>
<line x1="300" y1="136" x2="300" y2="150"/>
<line x1="60" y1="150" x2="300" y2="150"/>
<line x1="300" y1="150" x2="300" y2="140"/>
<line x1="60" y1="150" x2="60" y2="140"/>
<line x1="70" y1="60" x2="146" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#ev-r)"/>
<text x="108" y="44" text-anchor="middle" dominant-baseline="middle" font-size="11" stroke="none" fill="var(--vp-c-brand-1)" class="sf-t sf-w700">I = 10 mA</text>
<text x="330" y="116" dominant-baseline="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">LED</text>
<text x="330" y="134" dominant-baseline="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">V_F = 2.0 V</text>
<text x="230" y="180" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">电源 3.3 V 被分成两段：2.0 V 落在 LED 上，剩下的 1.3 V 落在电阻上</text>
</svg>

</FigBox>

**先想什么**：这不是求未知电压的题，而是**分配电压**的题。电源给的 3.3 V 必须恰好被两段吃掉：LED 拿走它的正向压降 $V_F$，剩下的一段全落在电阻上。所以先用减法求出电阻两端的电压，再用欧姆定律求阻值。*（为什么不能直接用 3.3 V 除以 10 mA：那等于假设 LED 不占电压，会把阻值算小 60%，实际电流会冲到 33 mA，超 IO 上限。）*

**步骤**：

1. 电阻两端电压：$U_R = V_{CC}-V_F = 3.3-2.0 = 1.3$ V。*（为什么是减：串联电路电压按回路分配，LED 已经占掉 2.0 V。）*
2. 求阻值：$R = U_R / I_F = 1.3 / 0.010 = 130\ \Omega$。
3. 取标称值：**130 Ω** 是 E24 系列里的标准值，直接可用（没有的话取 150 Ω，电流会降到 8.7 mA，肉眼几乎看不出差别）。
4. 5 V 供电同样算：$R = (5-2.0)/0.010 = 300\ \Omega$，取 300 Ω 或 330 Ω。

**验算**：把 $R=130\ \Omega$ 代回原式，$I = (3.3-2.0)/130 = 10.0$ mA ✓，与设定值一致。再用功率复核：$P_R = I^2R = 0.01^2\times130 = 13$ mW，用最普通的 1/8 W（125 mW）电阻有近 10 倍余量 ✓。

**注意灌电流限制**：STM32 单个 IO 的吸收/输出电流一般不超过 20~25 mA，整片总电流也有上限（F103 约 150 mA）。驱动大功率 LED、继电器、电机**必须**用三极管或 MOS 管，不能直接挂 IO。
:::

### 软件三步：顺序不能换

```c
// ① 开时钟（最容易漏！）
__HAL_RCC_GPIOC_CLK_ENABLE();

// ② 配置引脚为推挽输出
GPIO_InitTypeDef g = {0};
g.Pin   = GPIO_PIN_13;
g.Mode  = GPIO_MODE_OUTPUT_PP;   // 推挽输出：上下两个管子交替导通
g.Pull  = GPIO_NOPULL;
g.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOC, &g);

// ③ 写电平（PC13 低电平点亮，因为板子上 LED 是灌电流接法）
HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET);   // 亮
HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);                  // 翻转
```

这里出现一个必须解释的词：**推挽输出**（push-pull）指引脚内部有上下两个开关管，输出高电平时上管导通把引脚拉到电源、输出低电平时下管导通把引脚拉到地，所以两个方向都能主动驱动。与之相对的是**开漏输出**（open-drain），只有下管，只能主动拉低、高电平要靠外部上拉电阻，多用于 I²C 这类总线。

**为什么第一步不能漏**：STM32 上电后所有外设时钟默认是**关闭**的（为了省电，这叫时钟门控）。不打开时钟，对应外设的寄存器根本收不到时钟信号，你对 GPIO 的任何写入都像打在棉花上——不报错，也没效果。这个坑在[04 · 时钟系统](./clock.md)会从时钟树的角度再讲一次。

三步做完，灯该亮了。可如果没有 HAL 库，同样的事怎么写？这就引出寄存器版本。

::: tip 例 2 · 同一个点灯，寄存器版 vs HAL 版 {#ex-emb-env-2}
**题目**：不用 HAL，直接操作寄存器让 PC13 输出低电平，并说明 PC13 的配置位为什么在 `CRH` 的 bit[23:20]。

<FigBox title="PC13 的配置位落在 CRH 的哪 4 位" kind="结构" note="每个引脚占 4 位配置（2 位模式 + 2 位速度）。CRL 管 Pin0~7、CRH 管 Pin8~15，所以 Pin13 在 CRH 里排第 13−8=5 组，从 bit20 开始。算错这一步，你会把别的引脚配成输出——症状是「另一个灯乱闪」。">

<svg viewBox="0 0 700 260" role="img" aria-label="GPIOC 的 CRL 与 CRH 各管 8 个引脚，每脚 4 位；Pin13 位于 CRH 的 bit23 到 bit20">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="24" y="26" font-weight="700">CRL（0x00）：Pin0 ~ Pin7，每脚 4 位</text>
  <rect x="24" y="36" width="640" height="42" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="104" y1="36" x2="104" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="184" y1="36" x2="184" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="264" y1="36" x2="264" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="344" y1="36" x2="344" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="424" y1="36" x2="424" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="504" y1="36" x2="504" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="584" y1="36" x2="584" y2="78" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="64" y="62" text-anchor="middle">P0</text>
  <text x="144" y="62" text-anchor="middle">P1</text>
  <text x="224" y="62" text-anchor="middle">P2</text>
  <text x="304" y="62" text-anchor="middle">P3</text>
  <text x="384" y="62" text-anchor="middle">P4</text>
  <text x="464" y="62" text-anchor="middle">P5</text>
  <text x="544" y="62" text-anchor="middle">P6</text>
  <text x="624" y="62" text-anchor="middle">P7</text>
  <text x="24" y="96" fill="var(--vp-c-text-3)">bit31 ──────────────────────────────────────────────── bit0</text>

  <text x="24" y="132" font-weight="700">CRH（0x04）：Pin8 ~ Pin15，每脚 4 位</text>
  <rect x="24" y="142" width="640" height="42" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="104" y1="142" x2="104" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="184" y1="142" x2="184" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="264" y1="142" x2="264" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="344" y1="142" x2="344" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="424" y1="142" x2="424" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="504" y1="142" x2="504" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <line x1="584" y1="142" x2="584" y2="184" stroke="var(--vp-c-divider)" stroke-width="1" />
  <text x="64" y="168" text-anchor="middle">P8</text>
  <text x="144" y="168" text-anchor="middle">P9</text>
  <text x="224" y="168" text-anchor="middle">P10</text>
  <text x="304" y="168" text-anchor="middle">P11</text>
  <text x="384" y="168" text-anchor="middle">P12</text>
  <rect x="424" y="142" width="80" height="42" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="464" y="168" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">P13</text>
  <text x="544" y="168" text-anchor="middle">P14</text>
  <text x="624" y="168" text-anchor="middle">P15</text>
  <text x="464" y="202" text-anchor="middle" fill="var(--vp-c-brand-1)">第 5 组：bit[23:20]</text>

  <text x="24" y="232" fill="var(--vp-c-text-3)">算法：(13 − 8) × 4 = 20 → 掩码 0xF &lt;&lt; 20；模式位取 0x1（通用推挽输出，10 MHz）</text>
</g>
</svg>

</FigBox>

**先想什么**：寄存器版的第一步不是背地址，而是**把一个「引脚号」换算成「位段位置」**。所有寄存器操作都是这个问题：找到那几位、改它、别碰其余位。*（为什么要强调「别碰其余位」：一个 32 位寄存器里塞着 8 个引脚的配置，整字覆盖会把相邻 7 个引脚全改掉。）*

**步骤**：

1. 开时钟：`RCC->APB2ENR |= (1 << 4)`。第 4 位是 `IOPCEN`，也就是 GPIOC 的时钟使能位。*（为什么是 APB2ENR：GPIO 挂在 APB2 这条总线上，每条总线有各自的使能寄存器。）*
2. 清掉 PC13 的旧配置：`GPIOC->CRH &= ~(0xF << 20)`。先清再写，避免残留的旧值混进新配置。
3. 写入新配置：`GPIOC->CRH |= (0x1 << 20)`。低 2 位 `01` 表示输出模式、速度 10 MHz（速度位在高 2 位，取 00 就是 10 MHz）。
4. 输出电平：`GPIOC->BSRR = (1 << 13)` 置高，`GPIOC->BRR = (1 << 13)` 拉低（`BSRR` 与 `BRR` 见 [03 · 嵌入式 C](./embedded-c.md)）。

**验算**：用「位段位置」反查。Pin13 是 8~15 号里的第 5 个（从 0 数），$5\times4=20$ ✓；`0xF<<20` 覆盖 bit20~23，正好 4 位，不多不少 ✓。再核时钟：GPIOA 在 APB2ENR 的 bit2、GPIOC 在 bit4，与[04 · 时钟系统](./clock.md)里的使能表对得上 ✓。
:::

同一件事，HAL 用结构体描述意图、寄存器版直接操作地址。两种写法之外还有一层，下一节把这三个层次摆在一起比较。

## 四、HAL、LL、寄存器：三层怎么选

这一节只回答一个决策：什么时候该用哪一层。

| 层次 | 特点 | 代码体积 / 效率 | 适合 |
| --- | --- | --- | --- |
| **HAL**（Hardware Abstraction Layer，硬件抽象层） | 跨系列可移植，API 统一，CubeMX 直接生成 | 体积大、有函数调用开销 | 入门、快速开发、跨型号移植 |
| **LL**（Low Layer，底层库） | 接近寄存器，但用宏封装了位定义 | 接近手写效率 | 需要效率又想少查手册 |
| **寄存器直写** | 完全手工，最快最小 | 最优 | 时序苛刻的场合（如软件模拟协议） |
| ~~SPL 标准库~~ | F1 时代的旧库，ST 已停止维护 | — | 仅在维护老项目时遇到 |

**实践建议**：用 HAL 跑通功能，遇到「时序差几个微秒」「中断响应不够快」再针对性换成 LL 或寄存器写法，不要一上来就全部手写。反过来，全用寄存器直写会让换型号变成重写——这是 HAL 存在的唯一理由。

代码写完了，接下来是把它弄进芯片，以及出了问题时怎么查。下一节讲下载与启动。

## 五、下载、启动模式与调试

这一节回答两个问题：程序是怎么进芯片的，以及它为什么不跑。

**SWD**（Serial Wire Debug，串行线调试）是 ARM 的调试接口，只需 **SWDIO**（数据）和 **SWCLK**（时钟）两根信号线加 GND，比 JTAG 省引脚。ST-Link V2 就是最常见的 SWD 调试器（十几元）。调试器能做的事：下载固件、设断点、单步、查看/修改变量和寄存器、看调用栈——**会用断点，就不需要靠点灯猜程序跑到哪了**。

往芯片里塞程序不止一条路，用途也完全不同：

| 方式 | 怎么进 | 用途 |
| --- | --- | --- |
| **SWD 下载**（常规） | BOOT0 = 0，接 ST-Link | 日常开发，可调试 |
| **串口 ISP** | BOOT0 = 1 上电，走 USART1 | 没有调试器时的救急；进的是芯片内部固化的 BootLoader |
| **DFU（USB）** | 部分型号支持，BOOT0 = 1 | 产品现场升级 |

::: tip 例 3 · 程序下载成功却不运行，怎么排查 {#ex-emb-env-3}
**题目**：ST-Link 显示下载成功，但程序没有任何反应。按什么顺序查？

<FigBox title="下载成功 ≠ 程序在跑：四条独立前提" kind="结构" note="下载成功只证明调试口连通、Flash 写进去了。要程序真正执行，还需要：芯片从 Flash 取指（BOOT0）、时钟配置成功、芯片没被复位按住。四条里任一条不满足，表现都是「一片安静」。" >

<svg viewBox="0 0 700 250" role="img" aria-label="四条排查项：BOOT0 电平、PC 位置、时钟配置、复位脚">
<g font-size="11" fill="var(--vp-c-text-1)">
  <rect x="20" y="30" width="152" height="120" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="96" y="54" text-anchor="middle" font-weight="700">① BOOT0</text>
  <text x="96" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">必须为低电平</text>
  <text x="96" y="92" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">高电平 → 进</text>
  <text x="96" y="108" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">BootLoader</text>
  <text x="96" y="132" text-anchor="middle" font-size="10" fill="var(--vp-c-brand-1)">最常见</text>

  <rect x="190" y="30" width="152" height="120" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="266" y="54" text-anchor="middle" font-weight="700">② 是否在跑</text>
  <text x="266" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">调试器看 PC</text>
  <text x="266" y="92" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">是否在 main</text>
  <text x="266" y="108" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">或循环翻转 LED</text>

  <rect x="360" y="30" width="152" height="120" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="436" y="54" text-anchor="middle" font-weight="700">③ 时钟配置</text>
  <text x="436" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">晶振不起振 →</text>
  <text x="436" y="92" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">卡在等 HSE 就绪</text>
  <text x="436" y="108" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">先切 HSI 验证</text>

  <rect x="530" y="30" width="152" height="120" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="606" y="54" text-anchor="middle" font-weight="700">④ NRST</text>
  <text x="606" y="76" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">被拉低则一直</text>
  <text x="606" y="92" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">处于复位状态</text>
  <text x="606" y="108" text-anchor="middle" font-size="10.5" fill="var(--vp-c-text-3)">查按键与电容</text>

  <text x="350" y="184" text-anchor="middle" fill="var(--vp-c-text-3)">四条都是必要条件：任一条不满足，芯片就执行不到你的第一行代码</text>
  <text x="350" y="212" text-anchor="middle" fill="var(--vp-c-text-3)">顺序原则：先查硬件给的条件，再查代码逻辑</text>
</g>
</svg>

</FigBox>

**先想什么**：看到「下载成功但不运行」，不要从代码找起——下载成功只证明调试口连通、Flash 写进去了，**不证明芯片在取指执行**。所以先查硬件给芯片的四项条件，这四项都是必要条件而不是可能原因。*（为什么先查 BOOT0：它是唯一一个「下载完全正常、程序就是不跑」的开关。）*

**步骤**：

1. 量 BOOT0：必须接地（低电平）才从主 Flash 启动。若被拉高，芯片上电进 BootLoader 等命令，你的程序根本没被执行。
2. 确认真的在跑：在 `while(1)` 里放一个翻转 LED，或用调试器看 PC 指针是否在 `main` 里。
3. 查时钟配置：若外部晶振没焊或不起振，`SystemClock_Config()` 会卡在等待 HSE 就绪的循环里（HAL 会返回错误或死等）。先改用内部 HSI 验证。
4. 查复位：NRST 被意外拉低会让芯片一直处于复位状态，读不到你的程序。

**验算**：四条同时满足后程序必然执行——BOOT0 决定取指地址、PC 决定是否进了 `main`、时钟决定外设与内核是否有时序、NRST 决定内核是否被按住。所以「四条都过而仍不跑」在逻辑上不可能出现；若真出现，说明还有一条没查到（比如电源塌陷导致反复复位）✓。
:::

下载链路、启动模式、调试手段都清楚了。最后两节处理这个环节里最常被误用的两件事：串口打印和软件延时——它们看起来与时钟无关，其实全是时钟问题。

## 六、工程实例

**`printf` 重定向**：把 `printf` 的输出转到串口，是嵌入式最实用的调试手段。做法是重定向底层写函数（不同工具链函数名不同，GCC 下是 `_write`）：

```c
int _write(int fd, char *ptr, int len) {
  HAL_UART_Transmit(&huart1, (uint8_t *)ptr, len, 100);
  return len;
}
```

之后 `printf` 就能从串口打印变量。注意浮点格式化（`%f`）在新工具链里默认可能被裁剪以节省空间，需要显式开启。串口的详细配置见 [08 · 串口 UART](./uart.md)。

**软件延时为什么不准**：很多人入门时写 `for(i=0;i<72000;i++);` 当作 1 ms 延时。问题在于——编译器优化等级一变、循环体内容一改，每次循环的机器周期数就变了，延时会整体漂移。

::: tip 例 4 · 估算空循环延时，并看清它为什么不可靠 {#ex-emb-env-4}
**题目**：72 MHz 主频下，用空循环做 1 ms 延时，循环次数大约取多少？改变编译优化等级会怎样？

<FigBox title="一个 1 ms 的时间窗里能塞多少次循环" kind="结构" note="周期预算是固定的（72000 个周期），但「一次循环吃几个周期」是由编译器决定的。所以同一个数字在不同优化等级下误差能到 60%，这也是为什么精确定时只能交给定时器。" >

<svg viewBox="0 0 700 250" role="img" aria-label="1 毫秒对应 72000 个时钟周期，按每次循环 3、4、5 个周期分别得到 24000、18000、14400 次">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="24" y="40" width="652" height="42" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="350" y="66" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">1 ms × 72 MHz = 72000 个时钟周期（固定预算）</text>

  <rect x="24" y="108" width="204" height="60" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="126" y="130" text-anchor="middle">-O0：每次约 5 周期</text>
  <text x="126" y="152" text-anchor="middle" font-weight="700">14400 次</text>

  <rect x="248" y="108" width="204" height="60" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="350" y="130" text-anchor="middle">-O1：每次约 4 周期</text>
  <text x="350" y="152" text-anchor="middle" font-weight="700" fill="var(--vp-c-brand-1)">18000 次</text>

  <rect x="472" y="108" width="204" height="60" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
  <text x="574" y="130" text-anchor="middle">-O2：每次约 3 周期</text>
  <text x="574" y="152" text-anchor="middle" font-weight="700">24000 次</text>

  <text x="350" y="200" text-anchor="middle" fill="var(--vp-c-text-3)">同一行代码，在最差与最好情况下相差 67%（24000 对 14400）</text>
  <text x="350" y="224" text-anchor="middle" fill="var(--vp-c-text-3)">若循环体里再加一条语句，每次周期数还会变——这就是「软延时不可靠」的算术版本</text>
</g>
</svg>

</FigBox>

**先想什么**：这是一个**除法预算题**：时间是固定的，周期数是 $72\times10^6\times0.001$，剩下只要估「一次循环吃几个周期」。关键不是算出 18000 这个数，而是意识到**除数本身不确定**——所以这道题的正确答案是「这个数不可靠，精确定时要用定时器」。*（为什么不能靠数指令：C 的一行会被编译成几条指令，取决于优化等级、是否内联、是否展开循环。）*

**步骤**：

1. 周期预算：$72\times10^6\times0.001=72000$ 个周期。
2. 估每次循环约 4 个周期（一次自增、一次比较、一次跳转、取指开销各算一点）→ $72000/4=18000$ 次。
3. 但优化等级一变，这个「4」就变成 5 或 3 → 14400 或 24000 次。*（为什么要列三行而不是只给一个数：只给一个数会让人误以为它是标准答案。）*
4. 想更稳一点：把循环变量加 `volatile` 可以阻止编译器优化掉循环，但每次访问又要多花时间，误差换了方向。

**验算**：反向代入。若真跑 18000 次、每次 4 周期，总周期 $18000\times4=72000$，除以 $72\times10^6$ 得 1.0 ms ✓。但若编译器把循环展开成每次 3 周期，实际延时变成 $18000\times3/72\times10^6=0.75$ ms，短了 25%——这正好说明为什么串口时序、编码器采样这类场合必须用定时器（见 [07 · 定时器与 PWM](./timer-pwm.md)）。
:::

两个例子都指向同一个习惯：任何依赖时间的代码，先问一句「计时基准是什么、它由谁决定」。把这一页的坑按频率排出来，就是下一节。

## 易错清单（按踩坑频率排序）

1. **忘记开外设时钟** → 配置全对、寄存器也写了，但外设一点反应都没有，且不报错 → GPIO、定时器、串口都要先 `__HAL_RCC_xxx_CLK_ENABLE()`。
2. **把代码写在 USER CODE 保护区之外** → 下次用 CubeMX 重新生成，代码被整段覆盖 → 应用逻辑一律写在 `USER CODE BEGIN/END` 之间，配置改动回 `.ioc`。
3. **用 PC 自带的 `gcc` 编译单片机工程** → 报一堆架构不认识的错，或产出一个芯片不能执行的 `.elf` → 必须用 `arm-none-eabi-gcc`。
4. **LED 没串限流电阻，或电流超过 IO 承受能力** → LED 烧掉或 IO 输出级损坏 → 按 $R=(V_{CC}-V_F)/I_F$ 算电阻，单脚不超过 20 mA 左右。
5. **BOOT0 没接地** → 下载成功却不运行 → BOOT0 接地才从 Flash 启动。
6. **外部晶振不起振，卡在 `SystemClock_Config()`** → 程序看着像死机 → 先切 HSI 定位问题，再查晶振与负载电容。
7. **`printf` 的 `%f` 打不出来** → 浮点数显示成空白或乱码 → 新工具链默认裁剪了浮点格式化支持，需要在链接选项里打开。
8. **用软件延时做精确定时** → 换个优化等级或改一行循环体，延时整体漂移几十个百分点 → 精确定时一律用定时器。

## 自检

读完这页，你应该能回答（答案不在本页，自己说一遍）：

1. 点灯的固定三步是什么？漏掉第一步会看到什么现象，为什么它不报错？
2. `arm-none-eabi` 里那三段分别是什么意思？为什么不能用 PC 上的 `gcc`？
3. BOOT0 = 1 上电时芯片会做什么？它和「下载成功」矛盾吗？

## 下一步

环境通了、灯也会点了，但你可能已经发现：HAL 那几行背后全是「往某个地址的某几位写数」。想真正看懂这些，得先弄清寄存器为什么就是内存、位操作怎么不伤到邻居、`volatile` 为什么能救回一个只在 `-O2` 下出现的 bug。

<Prereq id="register-map" /> → [03 · 嵌入式 C 与寄存器思维](./embedded-c.md)
