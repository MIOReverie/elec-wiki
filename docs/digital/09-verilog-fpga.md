---
title: 09 · 从逻辑到芯片：Verilog 与 FPGA 入门
description: 卡诺图与触发器是纸面逻辑，FPGA 把它变成同时工作的硬件；本页讲清 Verilog 的 module/assign/always、阻塞与非阻塞、最小 testbench、两级同步器与亚稳态、综合到布局布线，以及本站数电章节在代码里长什么样。
---

# 09 · 从逻辑到芯片：Verilog 与 FPGA 入门

<Meta time="45 min" level="了解" note="从纸面逻辑到并行硬件：Verilog 是在写电路，不是在写程序" />

**这一页要解决什么**：前面八章的结论都在纸面上——卡诺图圈出一个最简与或式，触发器写出一条次态方程，计数器排出模值。这一页解决唯一的衔接问题：**这些纸面结论怎么变成一块芯片里同时运转的硬件**。读完你应该能：解释 Verilog 的 `for` 为什么不是循环、说清阻塞与非阻塞的区别与后果、写出最小的 testbench、判断什么时候必须加两级同步器，并知道从代码到比特流要经过哪几步。不涉及 PCB 与电源。

::: tip 读这页之前
- **需要会**：布尔代数与化简（<Prereq id="boolean-algebra" />）、卡诺图与最小项（<Prereq id="kmap" />）、触发器与次态（<Prereq id="flip-flop" />）、建立时间与保持时间（<Prereq id="setup-hold" />）、门电路扇出（<Prereq id="gate-fanout" />）。这一页不发明新的逻辑，只发明新的「写法」。
- **这一页用到的符号**：$t_{cq}$（时钟沿到 Q 端有效的延迟）、$t_{comb}$（中间组合逻辑延迟）、$t_{su}$（建立时间）、$t_h$（保持时间）、$t_{skew}$（时钟偏斜：同一个时钟到达不同触发器的时间差）、$\tau$（亚稳态时间常数，决定恢复快慢）、$T_{clk}$（时钟周期）。全部约定见[符号与约定](../guide/notation.md)。
- **四个词先给一句话**：**综合**（synthesis：把 Verilog 源码翻译成门级网表）；**布局布线**（place & route：把网表摆到芯片里的具体位置并连上线）；**时序约束**（timing constraint：用 SDC 文件告诉工具「这个时钟跑多快」）；**关键路径**（critical path：延迟最长的那条数据通路，它决定最高频率）。正文第一次用到时再展开。
- **三个术语在这里就地解释**：**阻塞赋值 `=`**（blocking assignment：语句按书写顺序执行、立刻生效）；**非阻塞赋值 `<=`**（non-blocking assignment：整个块执行完才统一更新，等效于「读旧值写新值」）；**亚稳态**（metastability：触发器输出既不是 0 也不是 1、停在中间电平漂一段时间的异常状态）。
:::

你用 C 语言写一个「8 路 ADC 同时采样」的循环，CPU 要轮流切 8 次通道，每次切换之间要等采样保持电容跟上——8 路采样天然是错开的。你改用 FPGA，把 8 路 ADC 接到 8 个引脚，共用一个时钟：8 片采样保持电路**真的在同一个瞬间**锁存。这不是「C 写得不够快」，是两种**执行模型**的根本差别。

再具体一点：你在 Verilog 里写 `for (i=0; i<8; i=i+1)`，C 编译器生成 8 条指令；Verilog 编译器生成**8 份电路**，它们同时存在、同时工作。同样的关键字，在两种语言里指向完全不同的东西。这一页就把这层差别讲透，并且回答那个新手最常问的问题：**为什么我在时序逻辑里用 `=`，仿真结果和上板结果不一样**。

## 结论先行

1. **Verilog 描述的是电路，不是执行流程**。一段 `always` 块综合出来是一堆**同时工作**的触发器与门电路，而不是 CPU 一条条跑的指令；`for` 是「复制电路」的缩写。
2. **时序逻辑用非阻塞 `<=`，组合逻辑用阻塞 `=`**。前者是「读旧写新、所有寄存器同时更新」，后者是「按顺序、立刻生效」。写错会导致仿真与综合对不上，是新手最常见的「玄学 bug」。
3. **时序逻辑一定带复位**：异步复位 `posedge clk or negedge rst_n` 或同步复位 `posedge clk` + `if(!rst_n)`，二选一但全项目统一。
4. **跨时钟域的单个信号，必须先过两级触发器同步器**；多比特数据用 FIFO 或握手，绝不用两级同步器硬搬。亚稳态**不可消除**，只能把它的影响概率压到工程可接受。
5. **FPGA 流程是 综合 → 布局布线 → 时序约束 → 下载**，其中**时序约束**决定工具是不是真的按 100 MHz 去努力；跑不到目标频率，九成是组合逻辑太长或时钟扇出太大。

## 一、为什么数电学完还要学这个

这一节只回答一个问题：**纸面逻辑和真实硬件之间，差的到底是什么**。

前八章的结论都是「**在纸上算出来**」的：卡诺图圈格子得到化简式，触发器代特性方程得到次态，计数器排时序图数出模值。这些都对，但它们只告诉你「逻辑关系是什么」，没有回答「这个逻辑怎么变成一块能同时跑几十、几百路的硬件」。

::: tip 真正的差别：并行与顺序 {#why-hw}
- **单片机是「一个人按清单干活」**：取指 → 译码 → 执行，一条指令占一个或几个机器周期，顺序推进。想看 8 路 ADC 同时采样？它其实是轮流切通道，靠 ADC 采样保持电容顶一下。
- **FPGA 是「一排工人同时干活」**：你写的每一条数据通路都是独立的门电路与触发器，只要时钟一响，它们**全部同时**更新；8 路 ADC 接 8 个不同的引脚，就是**真的 8 路并行**。
:::

这个差别带来三个具体后果，决定了「为什么卡诺图不够用」：

| 维度 | 单片机（STM32 一类） | FPGA |
| --- | --- | --- |
| 执行模型 | 顺序执行，一次一条 | 空间并行，所有通路同时工作 |
| 时间精度 | 微秒级，受中断与 RTOS 调度抖动 | 纳秒级，由时钟周期直接决定 |
| 灵活性 | 改硬件要换芯片、改电路板 | 改逻辑只需改代码、重新下载 |
| 功耗与成本 | 小系统极便宜 | 入门板卡门槛高，大芯片很贵 |
| 适合做什么 | 控制流程、人机交互、串口与网络协议栈 | 高速采样、视频处理、电机 FOC、并行 IO |

一句话概括：**单片机擅长「按顺序处理事件」，FPGA 擅长「同时处理很多路」**。一个完整的工程里，两者常常同时出现：FPGA 负责并行采样与预处理，单片机负责通信与人机界面。

::: warning 学 Verilog ≠ 学编程语言
C 语言里 `for (i=0;i<16;i++) y = y + x[i];` 是循环 16 次。Verilog 里写同样一句，综合工具会**展开成 16 个加法器串起来**——它等价于 16 级组合逻辑，而不是 16 个时钟周期。**Verilog 的 `for` 是「复制电路」的缩写，不是循环。**
:::

差别清楚了，接下来只需要三块积木就能把任何纸面逻辑写出来。

## 二、最小 Verilog：三个东西就够了

这一节只回答一个问题：**写 Verilog 到底需要哪几个积木**。

Verilog 入门其实只需要三块积木：**`module` 包接口**、**`assign` 写组合逻辑**、**`always @(posedge clk)` 写时序逻辑**。

### 2.1 module 与端口

```verilog
// 名字叫 mux2，接口写在括号里
module mux2 (
    input  wire a,      // 输入 A
    input  wire b,      // 输入 B
    input  wire sel,    // 选择：0 选 a，1 选 b
    output wire y       // 输出
);
    assign y = sel ? b : a;   // 组合逻辑：一行就是一层二选一
endmodule
```

`module` 是**电路块**，括号里是它的**引脚**（端口）。`input`/`output` 表示方向，`wire` 是「连线」——组合逻辑的输出必须用 `wire`（或 `logic` + `assign`）。**这里的端口就是一个物理引脚**，综合后它会对应到芯片上某个焊盘。

### 2.2 组合逻辑完整例子：3-8 译码器

前八章[组合逻辑](combinational)讲过 74LS138：3 个输入译成 8 个输出，**输出低电平有效**。写成 Verilog 是这样：

```verilog
module dec3to8 (
    input  wire [2:0] a,     // A2 A1 A0
    input  wire       en_n,  // 使能，低有效
    output reg  [7:0] y_n    // Y7..Y0，低有效
);
    integer i;
    always @(*) begin                    // * 表示「敏感列表自动推断」
        for (i = 0; i < 8; i = i + 1) begin
            // 下标匹配且使能有效时输出 0，否则全 1
            y_n[i] = ~(en_n == 1'b0 && a == i);
        end
    end
endmodule
```

**为什么 `always @(*)` 里的 `for` 能行**：这不是循环执行，而是**生成 8 份电路**——综合工具把 `i` 展开成 8 个常数，得到 8 条「`a` 等于某个常数」的比较器加一个使能与门。8 个门**同时**工作，所以一个 3-8 译码器只占几层门延迟。

对照前八章的式子：真值表里「`a` 等于 5 时只有那一根输出为低」，在代码里就是 `a == 5`。

### 2.3 时序逻辑完整例子：带分频的计数器

[计数器](counters)那一章的结论是「每个时钟沿加 1，计到 N 归零」。Verilog 里写：

```verilog
module cnt_div (
    input  wire        clk,     // 50 MHz 系统时钟
    input  wire        rst_n,   // 异步复位，低有效
    output reg  [15:0] cnt,     // 16 位计数器
    output reg         tick     // 每 N 拍出一个时钟周期的脉冲
);
    localparam N = 50000;       // 50 MHz / 50000 = 1 kHz

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin            // 复位：二选一优先级最高
            cnt  <= 16'd0;
            tick <= 1'b0;
        end else if (cnt == N - 1) begin
            cnt  <= 16'd0;
            tick <= 1'b1;
        end else begin
            cnt  <= cnt + 16'd1;
            tick <= 1'b0;
        end
    end
endmodule
```

这里有三处必须看懂：

- **`<=` 是非阻塞赋值**：右边读的是时钟沿**之前**的旧值，所有寄存器在本拍末尾**同时**更新。这正好对应硬件事实——触发器同时被时钟沿触发。
- **`posedge clk or negedge rst_n`**：异步复位，`rst_n` 一拉低立刻清零，不等时钟。同步复位则写成 `always @(posedge clk)` + `if (!rst_n)`，对时钟要求低、但对复位脉冲宽度有要求。
- **`N - 1` 而不是 `N`**：计数值是 `0,1,…,N−1`，共 N 个状态，所以 `cnt == N-1` 是第 N 拍。写成 `cnt == N` 会多出 N 这一个状态。

### 2.4 阻塞 vs 非阻塞：一句话原则

**组合逻辑用 `=`，时序逻辑用 `<=`**。原因不是风格，而是它们描述的对象不同：

| 写法 | 何时生效 | 用例 | 综合结果 |
| --- | --- | --- | --- |
| 阻塞 `=` | 语句顺序执行，立刻生效 | `always @(*)` 内 | 组合逻辑（门电路） |
| 非阻塞 `<=` | 块结束时统一更新 | `always @(posedge clk)` 内 | 触发器（时序逻辑） |

用 node 手算一遍差别。两段代码都是三个寄存器首尾相接成环，只有赋值方式不同：

下面用 node 把两种写法各推三拍，初值 a=1、b=2、c=0：

```text
非阻塞  always @(posedge clk) begin a <= b; b <= c; c <= a; end
沿1: 同时读旧值 -> a=2 b=0 c=1    沿2: a=0 b=1 c=2    沿3: a=1 b=2 c=0   ← 三个值在环里轮转

阻塞    always @(posedge clk) begin a = b; b = c; c = a; end
沿1: a=2(旧b) -> b=0(旧c) -> c=2(新a!)   沿2: a=0 b=2 c=0   沿3: a=2 …   ← c 读到的是刚被改写的 a
```

结论：**非阻塞让三个寄存器在同一沿同时「读旧写新」，结果与语句顺序无关，对应真实的三级触发器；阻塞让后一句读到前一句刚写的新值，结果取决于语句顺序**。上例沿 1 的 c 拿到的是「新的 a = 2」而不是旧值 1，整条环路每拍都被短路一次；若把三句顺序改成 `c = a; b = c; a = b;`，沿 1 立刻变成 a=1、b=1、c=1，结果完全不同。这就是「用阻塞写时序逻辑」的经典坑——**仿真结果随书写顺序变，综合后电路可能和你想的也不一样**。

三块积木齐了，电路就能写出来了。但代码写完怎么知道它对不对？下一节引入仿真。

## 三、仿真与时序：让波形说话

这一节回答一个问题：**不花钱买板子，怎么知道我的电路行为对不对**。

**仿真是 FPGA 调试的主要手段**，比上板找 bug 便宜一百倍。最小 testbench（testbench：专门用来验证设计的行为的测试平台代码，它本身不综合成硬件）只要做三件事：**产生时钟、施加激励、看输出**。

```verilog
module tb_cnt_div;
    reg  clk = 0;
    reg  rst_n = 0;
    wire [15:0] cnt;
    wire tick;

    cnt_div uut (.clk(clk), .rst_n(rst_n), .cnt(cnt), .tick(tick));

    always #10 clk = ~clk;   // 20 ns 周期 = 50 MHz

    initial begin
        #25 rst_n = 1;        // 复位保持 25 ns
        #2_000_000 $finish;    // 跑 2 ms，足够看到 2 个 1 kHz tick
    end
endmodule
```

`.clk(clk)` 是**按名连接**，引脚名与线网名各写一遍，比按位置连接安全得多。`#10` 是延时 10 个时间单位，配合 `` `timescale 1ns/1ps `` 就是 10 ns。**testbench 里用阻塞赋值完全没问题**——它是软件世界，不是在描述电路。

### 3.1 亚稳态：为什么必须两级同步器

这一节回答一个具体问题：**为什么同一个时钟域里好好的信号，跨到另一个时钟域就可能出错**。

时钟沿到来的一瞬间，如果数据恰好也在翻转，触发器可能**既不是 0 也不是 1**，输出在中间电平漂一会儿才随机落下——这就是**亚稳态**。它在单一时钟域内靠**建立/保持时间**约束可以避免（见 <Prereq id="setup-hold" />），但**跨时钟域**时，源端不知道目的端何时采样，**必然**偶尔撞上。

**跨时钟域**（CDC，clock domain crossing：把信号从一个时钟域送到另一个时钟域）的麻烦在于：两个时钟**各自独立**，没有任何办法保证源端翻转的时刻与目的端的采样时刻错开。哪怕两个时钟频率相同、相位差固定，只要你不知道那个相位差是多少，就无法排除「恰好撞上」。

::: tip 一句话原则
**跨时钟域的单 bit 控制信号 → 先用两级触发器同步，再用它；多 bit 数据 → 用异步 FIFO 或握手，绝不用两级同步器硬搬。**
:::

```verilog
module cdc_2ff (
    input  wire clk_b,      // 目的域时钟
    input  wire rst_n,
    input  wire sig_a,      // 来自另一个时钟域的单 bit 信号
    output reg  sig_b       // 已同步
);
    reg mid;
    always @(posedge clk_b or negedge rst_n) begin
        if (!rst_n) begin
            mid   <= 1'b0;
            sig_b <= 1'b0;
        end else begin
            mid   <= sig_a;   // 第一级：可能进入亚稳态
            sig_b <= mid;     // 第二级：再给一个周期恢复时间
        end
    end
endmodule
```

第一级有概率进入亚稳态，但它有一个完整时钟周期去恢复；到第二级时已经是稳定的 0 或 1。要算的话：单次同步失败的**概率**约是 $e^{-T_{clk}/\tau}$，经过两级只剩 $e^{-2T_{clk}/\tau}$。**亚稳态不能被消除，只能把 MTBF（平均无故障间隔）提高到比设备寿命长得多**，例 3 会把这条算出来。

<FigBox title="两级同步器如何把亚稳态挡在门外" kind="时序" note="信号恰好在目的时钟沿附近翻转时，第一级触发器进入亚稳态，输出在中间电平漂一段时间。第二级在这段时间之后才采样，所以拿到的已经是稳定的 0 或 1。代价是多一个时钟周期的延迟。">

<svg viewBox="0 0 560 250" role="img" aria-label="两级同步器时序图：第一级触发器进入亚稳态，第二级采样到稳定值">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <text x="16" y="42" fill="var(--vp-c-text-3)">clk_b</text>
    <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.8" points="70,52 70,36 150,36 150,52 230,52 230,36 310,36 310,52 390,52 390,36 470,36 470,52 545,52" />
    <line x1="150" y1="18" x2="150" y2="62" stroke="var(--vp-c-brand-1)" stroke-width="1.3" stroke-dasharray="4 3" />
    <text x="150" y="14" text-anchor="middle" fill="var(--vp-c-brand-1)">采样沿撞上翻转</text>

    <text x="16" y="98" fill="var(--vp-c-text-3)">sig_a</text>
    <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.8" points="70,118 140,118 140,92 545,92" />
    <line x1="140" y1="92" x2="140" y2="124" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3" />
    <text x="144" y="134" fill="var(--vp-c-text-3)">翻转时刻恰好接近采样沿</text>

    <text x="16" y="160" fill="var(--vp-c-text-3)">mid</text>
    <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="70,178 150,178 158,150 172,178 230,178" />
    <text x="196" y="160" fill="var(--vp-c-brand-1)">亚稳态：漂在中间电平</text>

    <text x="16" y="222" fill="var(--vp-c-text-3)">sig_b</text>
    <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" points="70,240 230,240 230,214 545,214" />
    <text x="248" y="222" fill="var(--vp-c-text-3)">第二级采样到稳定电平（多一拍延迟）</text>
  </g>
</svg>

</FigBox>

> 注意区分两件事：**同步器只负责「把单 bit 电平变稳定」**，它不负责「数据不丢」。如果源端每个时钟都在丢新数据，同步器再稳也追不上——那种场合要的是 FIFO 缓冲，不是同步器。

### 3.2 时序分析：建立/保持简单一眼

这一节回答一个问题：**两个触发器之间，最快能跑多快**。

单个触发器之间一条数据路径，时钟周期至少要装下：**源触发器延迟 + 组合逻辑延迟 + 建立时间 + 时钟偏斜**。这就是「最高工作频率」的由来：

$$
T_{clk} \ge t_{cq} + t_{comb} + t_{su} + t_{skew}
$$

其中 $t_{cq}$ 是时钟沿到 Q 输出（数据有效）的延迟，$t_{comb}$ 是中间组合逻辑的延迟，$t_{su}$ 是目的触发器的建立时间，$t_{skew}$ 是时钟到达目的触发器的偏斜。**保持时间**约束走的是另一条路径（$t_{cq}+t_{comb} \ge t_h$），它**与频率无关**——降频救不了保持时间违例，这也是 <Prereq id="setup-hold" /> 里反复强调的一点。

时序算清楚了，接下来是「代码怎么变成芯片里的硅」。

## 四、FPGA 开发流程：从代码到芯片

这一节回答一个问题：**从一行 Verilog 到一颗会工作的芯片，中间要经过哪几步**。

代码写完、仿真通过，还需要四步才能变成芯片里真实的电路：

```text
① 综合 Synthesis         Verilog → 门级网表（LUT、触发器、BRAM、DSP 的拼接）
② 布局布线 Place&Route   把网表摆到芯片里具体位置并连好线
③ 时序约束 + 时序分析     告诉工具时钟是多少，检查路径是否满足 T_su / T_h
④ 生成比特流并下载       下载到 SRAM 型 FPGA，掉电丢失；或烧写 Flash 配置
```

### 4.1 资源：LUT / FF / BRAM / DSP

这一节回答一个问题：**FPGA 芯片里到底有哪些「零件」可用**。

FPGA 里没有「与门芯片」，只有**可编程的资源块**：

| 资源 | 是什么 | 典型用法 | 占比估算 |
| --- | --- | --- | --- |
| **LUT** | n 输入查找表，4~6 输入最典型，能实现任意 n 输入逻辑 | 组合逻辑、加法器、状态机 | 一个 4 输入与门占 1 个 |
| **FF** | 触发器，紧挨着 LUT | 寄存器、计数器、流水级 | 每一位寄存器占 1 个 |
| **BRAM** | 片上块状 RAM，常见 18 Kb / 36 Kb 一块 | 大容量数据缓冲、FIFO、查找表 | 8K×16bit = 16 KiB 要用多块拼 |
| **DSP** | 硬核乘法器（18×18 或 25×18） | 滤波、FFT、电机坐标变换 | 一个 DSP 一拍完成一次乘法 |

**资源怎么估**：先数寄存器个数（≈ FF 数），再数组合逻辑层数（≈ LUT 数 × 层数/输入数），最后看大数组用不用 BRAM。一个 8 通道、每通道 16 位、1024 深度的采样缓冲区 = 8×1024×16 bit = 128 Kbit，用 36 Kb 的 BRAM 也要拼上 4 块左右。

### 4.2 为什么我的设计跑不到 100 MHz

这一节回答一个具体问题：**报告说时序不收敛，该从哪儿下手**。

时序报告里只会告诉你一句话：**关键路径（critical path）太长了**。按影响程度排序，跑不到目标频率的原因通常是：

1. **组合逻辑太深**：一个 32 位加法器后面再接 32 位比较，延迟就叠成几十级 LUT，必须**插流水级**，每级之间放寄存器。
2. **时钟扇出/偏斜太大**：时钟要驱动几千个触发器，偏斜吃掉周期余量。用全局时钟缓冲、别把时钟当普通信号走逻辑门。
3. **没有写时序约束**：不写 `create_clock`，工具就不知道要跑多快，随便给个结果——**约束是承诺，不是愿望**。
4. **高扇出网**：一个使能信号扇出几百个触发器，布线延迟拉长。
5. **异步逻辑与锁存器**：工具没法分析，只能给你的路径一个悲观估计。

**顺序固定**：先看报告 → 找出最慢的那条路径 → 插寄存器或改结构 → 重新跑。降频只是妥协，不是方法。

流程讲完了，把它和前面八章的纸面结论一一对上，你就知道每一条「纸上结论」在代码里长什么样。

## 五、和前八章对照：纸面公式在 Verilog 里长什么样

这一节回答一个问题：**前面学的每一章，在代码里对应哪一行**。

| 前八章内容 | 纸面形态 | Verilog 形态 | 关键差异 |
| --- | --- | --- | --- |
| [门电路](gates) | 与或非真值表、74LS 系列 | `assign` + `& \| ^`，综合成 LUT | LUT 实现任意 4~6 输入函数，不区分与/或/非 |
| [组合逻辑](combinational) | 卡诺图圈格子、最简与或式 | `assign y = a & b \| c;` 或 `case` 表 | 化简由工具做，你要管的是**延迟层数** |
| [触发器](flip-flops) | D/JK 特性方程、异步端 | `always @(posedge clk)` + `<=` | D 触发器最常见；JK 少见，靠 D + 反馈搭 |
| [计数器](counters) | 74LS161、任意进制、异步/同步 | `cnt <= cnt + 1;` + 比较归零 | 同步化是默认，异步级联反而要刻意避免 |
| [存储器与 PLD](memory-pld) | 74138、RAM、ROM、PLD | `reg [W-1:0] mem [0:D-1];` 推断 BRAM | 数组就是存储器，是否进 BRAM 由工具判断 |

### 5.1 门电路 → `assign`

```verilog
assign y = (a & b) | (~a & c);          // 与或式，一行一个组合表达式
assign y2 = (a & b) ^ c;                 // 异或门就是 ^
```

综合后每个 `&` 和 `|` 都落在一个 LUT 里，多层逻辑合并到 4~6 输入。**不用你去画卡诺图**，但要关心**层数**：层数多了延迟就大。

### 5.2 触发器 → `always @(posedge clk)`

```verilog
always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 1'b0;      // 异步清零（对应前八章的异步端 R̄_D）
    else        q <= d;          // D 触发器：一拍后 Q = D
end
```

注意 `q <= d` 就是 $Q^{n+1}=D$，一字不差。

### 5.3 计数器 → 加 1 与比较

```verilog
if (cnt == N - 1) cnt <= 0;
else              cnt <= cnt + 1;
```

这就是 74LS161 的「置数法/清零法」，只不过比较与清零都在**同一拍**由综合工具自动完成，不需要外接与非门——**同步**是默认而不是选项。

对照表讲清了「纸上到代码」的映射，下面三道题把它变成可以算的数。

## 六、例题

这一节的三道题按「算位宽 → 算频率 → 算可靠性」的顺序排。每题先看「先想什么」——那是方法选择，比算出数字重要。

::: tip 例 1 · 计数器位宽与分频 {#ex-verilog-1}
**题目**：系统时钟 50 MHz，要用计数器得到 1 kHz、200 Hz、50 Hz 三个时钟，分别需要几位计数器？若为节省资源把计数器位宽「凑成 2 的整数次幂」会怎样？

**先想什么**：位宽只决定「数得到多大」，与分频比无关。分频比 $N$ 写在 `localparam` 里、位宽按 $\lceil \log_2 N \rceil$ 给，才既省资源又精确。

<FigBox title="分频计数器：计数值决定分频比，位宽只决定上限" kind="时序" note="cnt 每个时钟沿加一，从 0 数到 N−1；数到 N−1 的那一拍把 tick 拉高一拍，其余时候 tick 为低。所以 tick 的频率正好是 f_clk 除以 N。位宽是 N 能被装下的容器大小，与 N 本身不是一回事。">

<svg viewBox="0 0 560 220" role="img" aria-label="分频计数器时序：cnt 从 0 数到 N 减 1，tick 每 N 个时钟输出一个脉冲">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <text x="16" y="34" fill="var(--vp-c-text-3)">clk</text>
    <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="1.8" points="70,50 70,36 110,36 110,50 150,50 150,36 190,36 190,50 230,50 230,36 270,36 270,50 310,50 310,36 350,36 350,50 390,50 390,36 430,36 430,50 470,50 470,36 510,36 510,50 545,50" />

    <text x="16" y="94" fill="var(--vp-c-text-3)">cnt</text>
    <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" points="70,150 110,150 110,140 150,140 150,130 190,130 190,120 230,120 230,110 270,110 270,120 310,120 310,130 350,130 350,140 390,140 390,150 430,150 430,140 470,140 470,130 510,130 510,120 545,120" />
    <text x="88" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
    <text x="128" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">1</text>
    <text x="168" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">2</text>
    <text x="208" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">3</text>
    <text x="248" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">4</text>
    <text x="288" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">…</text>
    <text x="328" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">N−1</text>
    <text x="368" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
    <text x="408" y="166" text-anchor="middle" fill="var(--vp-c-text-3)">1</text>

    <text x="16" y="200" fill="var(--vp-c-text-3)">tick</text>
    <polyline fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" points="70,212 70,196 310,196 310,212 545,212" />
    <text x="340" y="200" fill="var(--vp-c-text-3)">一个周期的高脉冲（每 N 拍一次）</text>
  </g>
</svg>

</FigBox>

**步骤**：

1. 分频比 $N = f_{clk} / f_{out}$，计数器位宽需满足 $2^n \ge N$，即 $n = \lceil \log_2 N \rceil$。

   | 目标 $f_{out}$ | $N = 50\,\text{MHz}/f_{out}$ | 位宽 $n$ | 16 / 18 / 20 位能表示的最大值 |
   | --- | --- | --- | --- |
   | 1 kHz | 50 000 | 16 | 65 535 |
   | 200 Hz | 250 000 | 18 | 262 143 |
   | 50 Hz | 1 000 000 | 20 | 1 048 575 |

2. 三个 $N$ 都能被 50 MHz 整除，所以**输出频率精确**，没有误差；`cnt == N-1` 归零即可。
3. 反例：若为了「好取」把比较值取成 $2^{16} = 65536$，实际频率变成 $50\,\text{MHz}/65536 \approx 762.9\,\text{Hz}$，1 kHz 直接掉到 −23.7%——**位宽是上限，计数值才是分频比，两者别混**。

**验算**：$50\,\text{MHz}/50000=1000$ Hz ✓；$50\,\text{MHz}/250000=200$ Hz ✓；$50\,\text{MHz}/1\,000\,000=50$ Hz ✓；反例 $50\,\text{MHz}/65536=762.94$ Hz，相对 1000 Hz 偏差 $(762.94-1000)/1000=-23.71\%$ ✓。位宽验算：$2^{16}=65536\ge50000$ ✓、$2^{18}=262144\ge250000$ ✓、$2^{20}=1048576\ge1000000$ ✓。

> **为什么这么想**
> 位宽只决定「数得到多大」，与分频比无关。`N` 写在 `localparam` 里、位宽按 $\lceil \log_2 N \rceil$ 给，才既省资源又精确。反例更隐蔽：20 位的 $N=1\,000\,000$ 写进 16 位寄存器会被截成 16960，仿真里频率凭空变成约 2.9 kHz。
:::

::: tip 例 2 · 建立时间与最高频率估算 {#ex-verilog-2}
**题目**：某 FPGA 设计里，一条路径上 $t_{cq} = 0.9\,\text{ns}$、组合逻辑 $t_{comb} = 6.5\,\text{ns}$、目的触发器 $t_{su} = 0.5\,\text{ns}$、$t_h = 0.1\,\text{ns}$，时钟从源端到目的端偏斜 $t_{skew} = 1.0\,\text{ns}$。这条路径最高能跑多少？想上 100 MHz 怎么办？

**先想什么**：先画时序图，把 $t_{cq}$、$t_{comb}$、$t_{su}$、$t_{skew}$ 四段按比例摆在一条时间轴上——比直接套公式更不容易搞错方向。

<FigBox title="一条数据路径的时间预算" kind="时序" note="源时钟沿触发源触发器；数据经过 t_cq 后出现在 Q 端，再经过 t_comb 的组合逻辑才到达目的端；目的触发器要求数据在它的时钟沿之前 t_su 就已稳定（建立窗口）、之后 t_h 内不变（保持窗口）。时钟偏斜会吃掉周期余量。">

<svg viewBox="0 0 560 250" role="img" aria-label="时序图：源时钟沿后 t_cq 得到数据，t_comb 组合逻辑延迟后到达目的端，目的端需要 t_su 建立时间和 t_h 保持时间，时钟偏斜 t_skew 吃掉余量">
  <defs>
    <marker id="vf-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
    </marker>
  </defs>
  <g font-size="11" fill="var(--vp-c-text-1)">
    <line x1="60" y1="34" x2="540" y2="34" stroke="var(--vp-c-divider)" stroke-width="1.1" />
    <text x="54" y="38" text-anchor="end" fill="var(--vp-c-text-3)">源时钟</text>
    <line x1="110" y1="24" x2="110" y2="48" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <text x="110" y="18" text-anchor="middle" fill="var(--vp-c-brand-1)">源沿</text>

    <line x1="60" y1="92" x2="540" y2="92" stroke="var(--vp-c-divider)" stroke-width="1.1" />
    <text x="54" y="96" text-anchor="end" fill="var(--vp-c-text-3)">Q 输出</text>
    <line x1="110" y1="82" x2="128" y2="82" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <line x1="128" y1="78" x2="128" y2="96" stroke="var(--vp-c-brand-1)" stroke-width="2" />

    <line x1="60" y1="150" x2="540" y2="150" stroke="var(--vp-c-divider)" stroke-width="1.1" />
    <text x="54" y="154" text-anchor="end" fill="var(--vp-c-text-3)">组合逻辑</text>
    <line x1="128" y1="140" x2="258" y2="140" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <line x1="258" y1="136" x2="258" y2="154" stroke="var(--vp-c-brand-1)" stroke-width="2" />

    <line x1="60" y1="208" x2="540" y2="208" stroke="var(--vp-c-divider)" stroke-width="1.1" />
    <text x="54" y="212" text-anchor="end" fill="var(--vp-c-text-3)">目的时钟</text>
    <line x1="268" y1="198" x2="268" y2="222" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <text x="268" y="238" text-anchor="middle" fill="var(--vp-c-brand-1)">目的沿</text>
    <rect x="258" y="188" width="10" height="10" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
    <text x="240" y="182" text-anchor="end" fill="var(--vp-c-text-3)">建立窗口</text>
    <rect x="268" y="188" width="3" height="10" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
    <text x="300" y="182" fill="var(--vp-c-text-3)">保持窗口</text>
    <line x1="288" y1="190" x2="288" y2="208" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="4 3" />
    <text x="292" y="200" fill="var(--vp-c-text-3)">无偏斜时的目的沿</text>

    <g stroke="var(--vp-c-text-3)" stroke-width="1.1">
      <line x1="110" y1="60" x2="128" y2="60" marker-end="url(#vf-ar)" marker-start="url(#vf-ar)" />
      <line x1="128" y1="60" x2="258" y2="60" marker-end="url(#vf-ar)" marker-start="url(#vf-ar)" />
      <line x1="258" y1="60" x2="268" y2="60" marker-end="url(#vf-ar)" marker-start="url(#vf-ar)" />
      <line x1="268" y1="60" x2="288" y2="60" marker-end="url(#vf-ar)" marker-start="url(#vf-ar)" />
    </g>
    <g font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">
      <text x="119" y="54">t_cq</text>
      <text x="193" y="54">t_comb</text>
      <text x="263" y="54">t_su</text>
      <text x="278" y="50">t_skew</text>
    </g>
  </g>
</svg>

</FigBox>

**步骤**：

1. 建立时间约束：$T_{clk} \ge t_{cq} + t_{comb} + t_{su} + t_{skew} = 0.9 + 6.5 + 0.5 + 1.0 = 8.9\,\text{ns}$。*（为什么这四项要加：它们串成一条从源沿到目的沿的关键路径，任何一段变长都会吃掉同一个周期预算。）*

$$
f_{max} = \frac{1}{8.9\,\text{ns}} \approx 112.4\,\text{MHz}
$$

2. 100 MHz 对应 $T = 10\,\text{ns}$，有 1.1 ns 余量，**能跑**。
3. 但把 $t_{comb}$ 翻成 10 ns，$T \ge 12.4\,\text{ns}$，$f_{max} \approx 80.6\,\text{MHz}$，就到不了 100 MHz 了。

   | 改法 | 新的 $T_{min}$ | $f_{max}$ |
   | --- | --- | --- |
   | 原设计（$t_{comb}=6.5$，$t_{skew}=1.0$） | 8.9 ns | 112.4 MHz |
   | 去掉 1.0 ns 偏斜 | 7.9 ns | 126.6 MHz |
   | 组合逻辑翻倍到 10 ns | 12.4 ns | 80.6 MHz |
   | 组合逻辑中间插一级寄存器（拆成 3.25 + 3.25） | 5.65 ns | 177.0 MHz |

**验算**：$8.9\,\text{ns}$ 对应 $1/8.9\,\text{ns}=112.36\,\text{MHz}$ ✓；100 MHz 周期 $10\,\text{ns}$，余量 $10-8.9=1.1$ ns ✓；$t_{comb}=10$ 时 $T=0.9+10+0.5+1.0=12.4$ ns，$1/12.4=80.65$ MHz ✓；插流水级后每一段都从**自己的寄存器**出发，因此只需满足较慢的那一段：$T=0.9+3.25+0.5+1.0=5.65$ ns，$1/5.65=176.99$ MHz ✓。

> **为什么这么想**
> 公式里只有 $t_{comb}$ 是你**设计时能改**的，$t_{cq}$、$t_{su}$ 由器件决定，$t_{skew}$ 由布局布线决定。**插流水级**把长组合链切成两段，每段各自满足约束，是提速最直接的手段——代价是多一拍延迟与一排寄存器。$t_h$ 不参与这个式子，它管的是「时钟沿之后数据还要稳」的另一条路径，与频率无关。
:::

::: tip 例 3 · 用两级触发器消除亚稳态 {#ex-verilog-3}
**题目**：一个 25 MHz 时钟域的单 bit 信号进 200 MHz 时钟域（$T_{clk} = 5\,\text{ns}$），触发器亚稳态时间常数 $\tau = 0.15\,\text{ns}$，数据翻转间隔 $T_w = 40\,\text{ns}$。分别估算单级、两级、三级触发器的 MTBF。

**先想什么**：亚稳态的恢复时间服从指数分布，所以每多给一级恢复窗口，故障率就乘一个巨大的倍数 $e^{T_r/\tau}$。算之前先记住一个判断：**单级同步器在工程上等于没有**，因为它把亚稳态原样传了下去。

<FigBox title="级数与 MTBF：每加一级乘一个巨大的倍数" kind="结构" note="横轴是同步器级数，纵轴是 MTBF（对数标度）。相邻两级之间差着一个 e^(T_clk/τ) 的倍数，这个倍数大到工程上两级就通常足够。左边那一格只有 1 秒——单级同步器等于没有同步器。">

<svg viewBox="0 0 560 210" role="img" aria-label="同步级数与 MTBF 的对数关系：单级约 1 秒，两级约 3 乘 10 的 14 秒，三级约 9 乘 10 的 28 秒">
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <line x1="80" y1="160" x2="520" y2="160" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <line x1="80" y1="30" x2="80" y2="160" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <text x="74" y="34" text-anchor="end" fill="var(--vp-c-text-3)">10²⁹ s</text>
    <text x="74" y="97" text-anchor="end" fill="var(--vp-c-text-3)">10¹⁴ s</text>
    <text x="74" y="162" text-anchor="end" fill="var(--vp-c-text-3)">10⁰ s</text>
    <text x="44" y="100" text-anchor="middle" fill="var(--vp-c-text-3)">MTBF</text>
    <text x="300" y="182" text-anchor="middle" fill="var(--vp-c-text-3)">同步器级数 n</text>
    <circle cx="130" cy="155" r="5" fill="var(--vp-c-brand-1)" />
    <text x="130" y="145" text-anchor="middle">n = 1</text>
    <text x="130" y="174" text-anchor="middle" fill="var(--vp-c-text-3)">≈ 1 s（等于没有）</text>
    <circle cx="270" cy="96" r="5" fill="var(--vp-c-brand-1)" />
    <text x="270" y="86" text-anchor="middle">n = 2</text>
    <text x="270" y="120" text-anchor="middle" fill="var(--vp-c-text-3)">3.0×10¹⁴ s ≈ 9.5×10⁶ 年</text>
    <circle cx="410" cy="44" r="5" fill="var(--vp-c-brand-1)" />
    <text x="410" y="34" text-anchor="middle">n = 3</text>
    <text x="410" y="66" text-anchor="middle" fill="var(--vp-c-text-3)">9.0×10²⁸ s ≈ 2.8×10²¹ 年</text>
    <path d="M 130 155 Q 200 96 270 96 Q 340 96 410 44" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="5 4" />
  </g>
</svg>

</FigBox>

**步骤**：

1. 先把模型写清楚。亚稳态的恢复时间服从指数分布，所以给第一级留的**恢复窗口** $T_r$ 越长，残留概率越小；而一个 $n$ 级同步器的恢复窗口是 $T_r=(n-1)T_{clk}$（第一级之后每多一级，就多出一个时钟周期的等待）。工程近似式写作

$$
\text{MTBF} = \frac{e^{\,T_r/\tau}}{f_{clk}\cdot f_{data}\cdot T_w\cdot T_{clk}}, \qquad T_r=(n-1)T_{clk}
$$

其中 $f_{data} = 1/T_w = 25\,\text{MHz}$ 是数据翻转率，$T_{clk}$ 同时作为每一次采样「撞上亚稳态」的概率窗口。*（为什么分母里有 $f_{clk}$ 与 $f_{data}$：撞上的机会取决于时钟有多少次采样、数据跳变有多频繁；分母越小（时钟慢、数据慢）MTBF 越大。）*

2. 代入 $\tau = 0.15\,\text{ns}$、$T_{clk} = 5\,\text{ns}$、$f_{clk} = 200\,\text{MHz}$、$f_{data} = 25\,\text{MHz}$、$T_w = 40\,\text{ns}$。先算分母：$200\,\text{MHz}\times25\,\text{MHz}\times40\,\text{ns}\times5\,\text{ns}=1.0$，所以这台具体设备上 **MTBF 的秒数就等于 $e^{T_r/\tau}$ 的值**：

   | 级数 $n$ | 恢复窗口 $T_r$ | $e^{T_r/\tau}$ | MTBF |
   | --- | --- | --- | --- |
   | 1 | 0（没有恢复窗口） | $e^{0}=1$ | $\approx1\,\text{s}$ —— 约等于每秒出错一次，**等于没同步** |
   | 2 | 5 ns | $e^{33.3}\approx2.996\times10^{14}$ | $\approx3.0\times10^{14}\,\text{s}\approx9.5\times10^{6}$ 年 |
   | 3 | 10 ns | $e^{66.7}\approx8.974\times10^{28}$ | $\approx9.0\times10^{28}\,\text{s}\approx2.8\times10^{21}$ 年 |

3. **关键不是绝对数量级，而是每加一级乘上的那个倍数** $e^{T_{clk}/\tau} = e^{33.3} \approx 3.0\times10^{14}$。$\tau$ 越大（老工艺）倍数越小：$\tau = 0.3\,\text{ns}$ 时只有 $e^{5/0.3} \approx 1.7\times10^{7}$，同样这台设备上两级只能做到 $\approx1.7\times10^{7\,\text{s}}\approx0.55$ 年，要到三级才回到 $3.0\times10^{14}$ s。

**验算**：$e^{5/0.15}=e^{33.3}=2.996\times10^{14}$ ✓；$e^{10/0.15}=e^{66.7}=8.974\times10^{28}$ ✓；$e^{5/0.3}=1.731\times10^{7}$ ✓；分母 $200\times10^6\times25\times10^6\times40\times10^{-9}\times5\times10^{-9}=1.0$ ✓；$3.0\times10^{14}$ s 折合 $3.0\times10^{14}/3.156\times10^{7}\approx9.5\times10^{6}$ 年 ✓；$9.0\times10^{28}$ s 折合 $\approx2.8\times10^{21}$ 年 ✓。

> **为什么这么想**
> 亚稳态的恢复时间服从指数分布，每多给一级恢复窗口，故障率就乘一个 $e^{T_r/\tau}$。这个指数是**巨大的**，所以两级同步器几乎总能满足工程要求。但注意：**两级同步器只同步单 bit**。多 bit 总线如果让每一位各自过两级，它们会在不同时钟周期稳定，采到的可能是一个「从未存在过」的中间值（比如 8 位数从 `0111_1111` 变到 `1000_0000`，可能被采成 `1111_1111`）。这就是为什么**多 bit 必须用 FIFO 或格雷码握手**。
:::

三道题算完，工具链的最后一环还差一块：这些代码最终要变成一个真实的产品。下面用两个具体工程把前面所有概念串起来。

## 七、工程实例：用 FPGA 做 PWM 与舵机信号发生器

这一节回答一个问题：**把前面所有概念加起来，能做出什么东西**。

嵌入式第 13 章讲过 [舵机控制](../embedded/13-servo-control)：50 Hz、脉宽 0.5–2.5 ms、角度与脉宽线性。STM32 用定时器 + CCR 实现，FPGA 用**计数器 + 比较器**——结构上其实是同一件事，只是从「寄存器写数值、硬件比较」变成了「代码直接搭比较逻辑」。

```verilog
module servo_pwm (
    input  wire        clk,        // 50 MHz
    input  wire        rst_n,
    input  wire [9:0]  angle,      // 0..1000 对应 -90°..+90°
    output reg         pwm         // 50 Hz 输出
);
    localparam T_20MS = 27'd1_000_000;  // 20 ms = 1,000,000 拍

    reg [26:0] cnt;
    // 0.5 ms 对应 25,000 拍；满量程 2 ms 对应 100,000 拍
    wire [26:0] high = 27'd25_000 + angle * 27'd100;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            cnt <= 27'd0;
            pwm <= 1'b0;
        end else begin
            cnt <= (cnt == T_20MS - 1) ? 27'd0 : cnt + 27'd1;
            pwm <= (cnt < high) ? 1'b1 : 1'b0;
        end
    end
endmodule
```

几个数字先对一遍：50 MHz 下 20 ms = **1 000 000 拍**；0.5 ms = 25 000 拍，2.5 ms = 125 000 拍；角度 −90°…+90° 映射到 500…2500 µs，即 25 000…125 000 拍，量程 100 000 拍对应 180°，每度约 555.6 拍。`angle × 100` 后从 25 000 起算，`angle=1000` 正好是 125 000。

**与 STM32 版本的区别**：

| 维度 | STM32 定时器 PWM | FPGA 计数器比较 |
| --- | --- | --- |
| 通道数 | 受定时器通道数限制，要复用就换定时器 | 复制即得，20 路舵机就是 20 份逻辑，天然同相 |
| 相位一致性 | 同定时器的通道天然同步 | 所有通道共用一个 `cnt`，严格同相 |
| 改参数 | 改 CCR 寄存器，运行时可调 | 改 `localparam` 重新综合，或做成寄存器输入 |
| 资源代价 | 极低 | 每路几十个 LUT + FF，资源宽裕时可忽略 |

### 7.1 并行采样：FPGA 真正的主场

这一节回答一个问题：**前面说的「并行」，落到代码里长什么样**。

把 8 路 ADC 接到 FPGA 的 8 个引脚，让它们**共用同一个采样时钟**：

```verilog
// 8 路并行采样：每路独立走线，但共用 clk 与同一拍
genvar k;
generate
    for (k = 0; k < 8; k = k + 1) begin : ch
        always @(posedge clk) begin
            sample[k] <= adc_data[k];   // 8 路在同一拍锁存
        end
    end
endgenerate
```

`generate` 在综合时展开成 8 份电路，**不是循环执行 8 次**。8 通道、100 MHz 采样、每路 16 bit，每通道数据率 12.5 MS/s，8 路加起来 1.6 Gbit/s——这个带宽单片机很难顺序顶住，而 FPGA 因为它本来就是并行结构，随手就能接。

两个实例讲完，最后把这页的坑与速记表各收一遍。

## 八、易错清单

1. **时序逻辑里用阻塞赋值 `=`**：仿真可能对、综合后是三选一覆盖，旧值丢失。记住「组合逻辑用 `=`、时序逻辑用 `<=`」。
2. **组合逻辑里用 `<=`**：仿真会出现一个时间单位的延迟伪影，而硬件里不存在，波形与上板表现不一致。
3. **`always @(*)` 里有分支没赋值**：推断出**锁存器（latch）**，综合工具报警。所有分支都要赋值。
4. **位宽不声明**：`reg [15:0] cnt` 与 `reg [26:0] cnt` 差着可表示的最大值；比较常量的字面量也别偷懒不写位宽（`27'd1_000_000` 比 `1000000` 安全）。
5. **异步复位写在同步 `always` 里**：`always @(posedge clk)` 内用 `if (!rst_n)` 是**同步**复位，需要复位脉冲至少一个时钟周期；写成 `or negedge rst_n` 才是异步复位。两者混用会出现「有些寄存器强复位、有些晚一拍」。
6. **用两级同步器同步多 bit 总线**：每一位独立恢复，采到的可能是中间值。多 bit 用异步 FIFO 或格雷码。
7. **拿时钟给别的逻辑当数据**：`always @(posedge clk_div)` 把分频后的信号当时钟，工具无法做时序分析。**分频出来的时钟只做使能 `tick`，不要当时钟用**。
8. **忘记写时序约束**：不写 `create_clock`，工具不知道你要多快，报告里没有违例不等于满足 100 MHz。
9. **`for` 当循环用**：Verilog 的 `for` 会被展开成多份电路，循环次数太多会直接撑爆 LUT。
10. **仿真通过就以为没问题**：testbench 只验证了你的**理解**，没验证时序收敛与跨时钟域，上板前必须跑时序报告。

## 九、考点速记

| 记住 | 内容 |
| --- | --- |
| 三块积木 | `module`（接口）、`assign`（组合）、`always @(posedge clk)`（时序） |
| 赋值原则 | 组合 `=`，时序 `<=`；后者是「读旧写新」 |
| 复位 | 异步 `posedge clk or negedge rst_n`；同步 `posedge clk` + `if(!rst_n)` |
| 分频位宽 | $n = \lceil \log_2 N \rceil$，$N = f_{clk}/f_{out}$ |
| 最高频率 | $T_{clk} \ge t_{cq} + t_{comb} + t_{su} + t_{skew}$；$t_h$ 与频率无关 |
| 跨时钟域 | 单 bit：两级同步器；多 bit：FIFO / 握手 |
| MTBF | 每多一级乘 $e^{T_r/\tau}$，指数级改善 |
| 流程 | 综合 → 布局布线 → 时序约束/分析 → 下载 |
| 资源 | LUT（组合）、FF（触发）、BRAM（存储）、DSP（乘法） |
| 跑不到 100 MHz | 先看关键路径，插流水级；别只降频或改约束 |

## 十、顺手接下去

- 想先把算术侧打牢：[组合逻辑](combinational) 的译码器、选择器、加法器，在 Verilog 里都是 `case` / `assign`。
- 想深入时序：[触发器](flip-flops) 与 <Prereq id="setup-hold" /> 是这里所有时序分析的根。
- 想看模拟与数字的接口：[08 · 数电接口：AD/DA 与脉冲调制](./ad-da.md) 里的采样与 PWM，是这里的 PWM 代码在模拟侧的对应物。
- 想与 STM32 对照：[13 · 舵机控制](../embedded/13-servo-control) 是同一套 PWM 数值在单片机上的写法。
- 想理解指令级顺序：[嵌入式开发](../embedded/) 的主线就是从启动到外设，和这里的「并行硬件」正好互补。
