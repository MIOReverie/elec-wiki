---
title: 06 · 中断与 NVIC
description: 一次中断从发生到返回的时间线、压栈出栈与咬尾的周期账、抢占优先级和子优先级各自管什么、EXTI 那条线的硬约束、HAL 的三层处理链条，以及 ISR 里什么不能写。
---

# 06 · 中断与 NVIC

<Meta time="45 min" level="核心" note="抢占管打断、子优先级管排队；数值小的是高优先级，这两句反过来记，系统会变得极难调" />

主循环里用 `while(!flag)` 等一个 1 ms 一次的采样完成，结果串口每收一个字节就把等待拉长一次，采样间隔从 1 ms 变成 1.3 ms，因为轮询是在跟所有事情抢 CPU。改成中断之后，两个中断都设成「抢占 0、子 0」，于是谁也不能打断谁，一个慢中断（比如刷屏）直接把另一个 1 ms 采样堵在门外。再往下还有更惨的：有人在中断里写了 `HAL_Delay(10)`，程序从此不动，不是死循环，是连时间都不走了。

三种现象问的是同一个东西：CPU 在任意时刻到底在执行谁，又凭什么决定换人。把这条换人规则连同它的时间代价讲清楚，三个现象就都有答案了。

::: tip 读这页之前
C 语言的函数指针与回调得认得（[03 · 嵌入式 C](./embedded-c.md) 里讲过函数指针与 `volatile`），寄存器位操作要会（<Prereq id="register-map" />），上拉下拉那一套按键电路见 [05 · GPIO 与按键](./gpio.md)。

用到的记号：`IRQn` 是中断号（如 `TIM2_IRQn`）；`ISR`（Interrupt Service Routine）是中断服务程序；`NVIC`（Nested Vectored Interrupt Controller）是嵌套向量中断控制器；`EXTI`（External Interrupt/Event Controller）是外部中断与事件控制器；`PRIMASK` 是关中断用的那一位。寄存器与位的写法见[符号与约定 · 数字与嵌入式](../guide/notation.md)。

4 个词先各给一句：中断是外设主动打断 CPU 的机制；压栈是把 CPU 当前的寄存器值存进内存，相当于给程序夹了个书签；抢占优先级高的中断可以暂停正在执行的中断；挂起（pending）指中断已经发生、但还没轮到执行。正文里第一次遇到时会逐个展开。

还得有一点硬件直觉：程序计数器 PC 指向下一条要执行的指令。中断发生时 PC 被压进栈，返回时弹回来。这一条吃透，整页的时序都通了。
:::

::: tip 心智模型：中断像插队，优先级是通行证，咬尾是「换人不换岗」
把 CPU 想成只有一个窗口的办事柜台。中断是有人举着号来办事；NVIC 是门口的保安，手里有一张按优先级排好的名单；压栈是窗口暂停时把桌面上的文件码好放进抽屉，出栈是再摆回桌面。咬尾是「下一位早就等在窗口前了，不用收摊再摆一次，直接接着办」。子优先级只管「同时来了三个人，先叫谁」，一点也不影响能不能插队。

这条类比还能解释 ISR 纪律：窗口每停一次、摆一次桌面都要花时间（24 个周期），所以办事本身必须短，分析、打印、计算拿回去慢慢做。
:::

## 一、从外设事件到回到原地，中间谁在干活

Cortex-M 内核里有一个 NVIC（Nested Vectored Interrupt Controller，嵌套向量中断控制器），所有中断的登记、排队、放行都由它管。一次完整的中断这样走完：

1. 外设置标志。按键消抖电路、定时器的计数器、串口的接收寄存器，各自在自己那一位置起中断请求位。
2. NVIC 登记为挂起。请求进入 NVIC，与当前正在执行的那段代码的优先级比较。比它高才放行，否则先挂着（pending）等机会。
3. CPU 自动压栈。硬件把 R0~R3、R12、LR、PC、xPSR 八个寄存器推进当前栈，这就是**压栈**（stacking），相当于给程序夹了个书签，全部由硬件完成，不用写一行汇编。
4. 取向量、跳转。从向量表里取出这个中断对应的 ISR 地址。向量表是放在 Flash 最开头的一张地址表，每个中断占一项，中断号就是这张表的行号。
5. 执行 ISR。
6. 自动出栈（unstacking）。书签弹回来，PC 恢复成被打断处，程序继续。

这 6 步里只有第 5 步是你写的代码，其余全是硬件和外设替你做的。

<FigBox title="一次中断的时间线：谁在花时间" kind="时序" note="八个寄存器由硬件压栈（12 个周期），ISR 结束后再出栈（12 个周期）。这两笔开销与 ISR 写了多少代码无关，属于进门费。图中方块宽度不代表真实周期数的比例，只表示先后顺序。">

<svg viewBox="0 0 600 176" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <rect x="60" y="56" width="110" height="28" rx="3" class="sf-fill"/>
  <text x="115" y="74" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">主循环</text>
  <rect x="176" y="46" width="36" height="48" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="194" y="66" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">压栈</text>
  <text x="194" y="79" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">12 周期</text>
  <rect x="218" y="56" width="150" height="28" rx="3" class="sf-fill"/>
  <text x="293" y="74" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">ISR 本体</text>
  <rect x="374" y="46" width="36" height="48" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="392" y="66" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">出栈</text>
  <text x="392" y="79" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">12 周期</text>
  <rect x="416" y="56" width="110" height="28" rx="3" class="sf-fill"/>
  <text x="471" y="74" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">主循环继续</text>
  <line x1="194" y1="128" x2="194" y2="100"/>
  <path d="M 194 94 L 190.7 102 L 197.3 102 Z" class="sf-solid"/>
  <text x="194" y="144" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">外设事件 → NVIC 判断</text>
  <line x1="60" y1="160" x2="560" y2="160" stroke="var(--vp-c-text-3)" stroke-width="1"/>
  <path d="M 566 160 L 556 157 L 556 163 Z" class="sf-solid"/>
  <text x="560" y="174" text-anchor="end" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">时间</text>
</svg>

</FigBox>

自动压栈是 Cortex-M 相对老架构的关键改进。老架构进中断要软件自己保存寄存器，慢且容易漏；Cortex-M 把这八个寄存器交给硬件，中断延迟因此缩到十几个周期。这里的延迟（latency）专指「从事件发生到 ISR 第 1 条指令执行」的时间，与 ISR 本身的长度无关。

固定开销的账先记下：一次进出 24 个周期。这笔钱还有压小的余地，只要 ISR 结束前下一个中断已经在门口等着，接上只花 6 个周期，净省 18 个。

## 二、时间账：压栈、出栈、咬尾与迟到

Cortex-M 的典型数字（零等待存储器、72 MHz 主频）如下，全部按 72 MHz 换算：

| 动作 | 周期 | 折算时间 | 什么时候发生 |
| --- | --- | --- | --- |
| 压栈（响应中断） | 12 | 166.7 ns | 每次进入 ISR |
| 出栈（中断返回） | 12 | 166.7 ns | 每次离开 ISR |
| 咬尾（tail-chaining） | 6 | 83.3 ns | 出栈时已有中断在等 |
| 迟到（late arrival） | 6 | 83.3 ns | 压栈过程中来了更高优先级 |

**咬尾**（tail-chaining，中文也译尾链）：一个 ISR 刚执行完，NVIC 发现还有中断处于挂起状态，硬件就跳过出栈和下一次压栈，直接取出新中断的向量跳过去。因为两组寄存器内容本来就还在栈上，没必要弹出来再压回去。于是本该花 12 + 12 = 24 个周期的一段，只花 6 个，净省 18 个周期（250 ns）。

<FigBox title="同一对背靠背中断：不咬尾 vs 咬尾" kind="时序" note="上排：ISR A 结束，出栈 12 周期，压栈 12 周期，然后进 ISR B。下排：硬件发现 B 已挂起，只花 6 个周期就接着跑 B。中断密集的场景里（例如每 10 µs 就来一次的高频采样），这一招能省下可观的 CPU。">

<svg viewBox="0 0 600 196" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="24" y="66" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">不咬尾</text>
  <rect x="60" y="46" width="160" height="28" rx="3" class="sf-fill"/>
  <text x="140" y="64" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">ISR A</text>
  <rect x="224" y="40" width="40" height="40" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="244" y="64" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">出栈 12</text>
  <rect x="268" y="40" width="40" height="40" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="288" y="64" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">压栈 12</text>
  <rect x="312" y="46" width="160" height="28" rx="3" class="sf-fill"/>
  <text x="392" y="64" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">ISR B</text>
  <text x="480" y="64" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">多花 24 周期</text>

  <text x="24" y="136" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">咬尾</text>
  <rect x="60" y="116" width="160" height="28" rx="3" class="sf-fill"/>
  <text x="140" y="134" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">ISR A</text>
  <rect x="224" y="110" width="24" height="40" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="236" y="134" text-anchor="middle" font-size="8.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">6</text>
  <rect x="252" y="116" width="160" height="28" rx="3" class="sf-fill"/>
  <text x="332" y="134" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">ISR B</text>
  <text x="422" y="134" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">只花 6 周期，省 18 周期</text>
  <line x1="60" y1="176" x2="560" y2="176" stroke="var(--vp-c-text-3)" stroke-width="1"/>
  <path d="M 566 176 L 556 173 L 556 179 Z" class="sf-solid"/>
  <text x="560" y="190" text-anchor="end" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">时间</text>
</svg>

</FigBox>

迟到（late arrival）是另一招：压栈还没做完，一个更高优先级的中断来了。此时硬件不打断压栈、也不重复压栈，只是把要取的向量换成更高优先级的那个，多花约 6 个周期。所以「中断响应延迟 12 周期」是理想情况，真实值在 12~18 周期之间浮动。

::: tip 例 1 · 每 10 kHz 一次的定时中断，CPU 被吃掉了多少
**题目**：72 MHz 主频，定时器每 100 µs 中断一次（10 kHz），ISR 本体 100 条单周期量级的指令。问这套中断占用多少 CPU？若在 ISR 里加一句耗时 500 µs 的 `printf` 会怎样？

先猜一句：一次中断进出才二十几个周期，一百条指令也就一百来个周期，占不了多少。数量级是对的，可频率是 10 kHz，一秒一万次，加起来就不小了。

这是一笔「固定开销加可变开销」的账。固定开销是进出中断的 24 个周期，可变开销是 ISR 里真正干的活。判断能不能接受，比起绝对时间更该看占周期的百分比。

第一步，单次时间：

$$t_{\text{进出}} = \frac{24}{72\times10^6} = 0.333\ \mu\text{s}\qquad t_{\text{ISR}} = \frac{100}{72\times10^6} = 1.39\ \mu\text{s}$$

$$t_{\text{合计}} = 1.72\ \mu\text{s}\quad(\text{占 } 100\ \mu\text{s} \text{ 周期的 } 1.72\%)$$

第二步，若紧挨着还有一次中断：本来要花「出栈 12 加压栈 12 = 24 个周期」的交接，被咬尾压成 6 个周期，省 18 个周期，即 250 ns。

第三步，加 `printf` 的后果：

$$\frac{500\ \mu\text{s}}{100\ \mu\text{s}} = 5\ \text{倍周期}$$

一条中断要占用 5 个完整周期的时间。这期间同优先级与低优先级的中断全部排队，队列一路变长，最终表现就是「程序像卡死」。*（结论：不是 `printf` 慢，是它比整个中断周期还长。）*

回代核对：100 µs 里花掉 1.72 µs，就是 1.72% 的 CPU。换个口径再算一遍，一秒下来 10000 次中断，每次 1.72 µs，累计 17.2 ms，占一秒的 1.72%，两条路对得上 ✓。
:::

这些周期数只回答了「贵不贵」，没回答「谁先谁后」。

## 三、两个优先级：一个管插队，一个管排队

Cortex-M 给每个中断配一个优先级数值，数值小的优先（0 是最高）。这个 8 位数值在 STM32 上只实现高 4 位，也就是 16 个等级。而它又被切成两段：

- 抢占优先级（preemption priority）管「能不能打断正在执行的 ISR」，数值更小的一方可以嵌套进去。
- 子优先级（subpriority）只在多个中断同时挂起、且抢占优先级相同时，决定谁先被放行。它永远不造成嵌套。

2 段怎么切由优先级分组（priority grouping）决定，整个系统只能选一种：

| 分组 | 抢占位数 | 抢占级数 | 子优先级位数 | 子级数 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 1 级（全相同） | 4 | 16 级 |
| 1 | 1 | 2 级 | 3 | 8 级 |
| 2 | 2 | 4 级 | 2 | 4 级 |
| 3 | 3 | 8 级 | 1 | 2 级 |
| 4 | 4 | 16 级 | 0 | 1 级（无子优先级） |

分组用 `HAL_NVIC_SetPriorityGrouping()` 设置，通常在 `HAL_Init()` 之后、`SystemClock_Config()` 里完成。全系统只用一种分组，因为改分组会让所有已经设过的优先级含义整体平移，这是最难查的一类 bug。

<FigBox title="抢占优先级 vs 子优先级：一个决定插队，一个决定排队顺序" kind="时序" note="上：B 的抢占优先级高于 A，B 插进来执行，A 停在原地（图中虚线缺口），B 结束后 A 继续。下：两者抢占优先级相同、B 只是子优先级更高，B 只能在 A 结束后才开始，子优先级再高也打不断 A。">

<svg viewBox="0 0 600 212" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="24" y="52" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A</text>
  <text x="24" y="102" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">B</text>
  <rect x="60" y="36" width="80" height="24" rx="3" class="sf-fill"/>
  <text x="100" y="52" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">执行中</text>
  <rect x="140" y="36" width="100" height="24" rx="3" stroke-dasharray="4 3"/>
  <text x="190" y="52" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">暂停（现场在栈里）</text>
  <rect x="240" y="36" width="80" height="24" rx="3" class="sf-fill"/>
  <text x="280" y="52" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">继续</text>
  <rect x="140" y="86" width="100" height="24" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="190" y="102" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">B 抢占执行</text>
  <line x1="140" y1="60" x2="140" y2="86" stroke-dasharray="3 3"/>
  <line x1="240" y1="86" x2="240" y2="60" stroke-dasharray="3 3"/>
  <text x="330" y="56" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">抢占优先级更高 → 打断，A 之后接着跑</text>

  <text x="24" y="164" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">A</text>
  <rect x="60" y="148" width="100" height="24" rx="3" class="sf-fill"/>
  <text x="110" y="164" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">A 执行</text>
  <rect x="160" y="148" width="100" height="24" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="210" y="164" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">B 排队后执行</text>
  <text x="270" y="164" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">抢占相同 → 只能等</text>
  <line x1="60" y1="192" x2="560" y2="192" stroke="var(--vp-c-text-3)" stroke-width="1"/>
  <path d="M 566 192 L 556 189 L 556 195 Z" class="sf-solid"/>
  <text x="560" y="206" text-anchor="end" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">时间</text>
</svg>

</FigBox>

::: warning 记反一次，整页白学
「数值小等于优先级高」这条只在中断这里成立。很多 RTOS（FreeRTOS 等）里任务是数字大的优先，2 套约定经常同时在一个人手上出现。所以配优先级之前先写下数字，再念一遍「0 号最急」。
:::

用可交互的模型验证一遍，比读表格快：

<DemoBox title="NVIC 优先级演示：设两个中断的抢占 / 子优先级，看谁打断谁" hint="先选分组 2（4 级抢占 + 4 级子），把 A 设成抢占 1、B 设成抢占 0，选「A 执行中 B 到来」，看 B 如何嵌套进去；再把 B 改成抢占 2，看它只能排队。">
  <NvicDemo />
</DemoBox>

::: tip 例 2 · 该选哪个优先级分组
**题目**：系统有 3 个中断：按键（外部中断）、串口接收、定时采样。要求定时采样可以打断另外两个，另外两个之间不需要互相打断。

第一反应通常是把定时采样设 0、其他设 1，分组随便挑一个。分组不能随便挑，它决定了你以后有多少级可用。

题目只在描述「谁能打断谁」，这是抢占优先级的职责；「谁先谁后」没提，说明子优先级可以留少量余量。所以判据是：抢占级数够不够，以及将来加中断要不要改分组。

第一步，算需要的抢占级数：定时采样要压过另外两个，至少 2 级（采样用 0，其余用 1）。

第二步，查表选分组：

- 分组 2（抢占 4 级加子 4 级）→ 满足，子优先级余量充足；
- 分组 3（抢占 8 级加子 2 级）→ 也满足，抢占余量更大。

第三步，选分组 3：抢占级数多一档，将来加中断不用改分组。*（为什么强调不改分组：改分组会让所有已设的优先级整体改变含义，等于把整张优先级表重排一遍，风险最大而收益最小。）*

```c
HAL_NVIC_SetPriorityGrouping(NVIC_PRIORITYGROUP_3);
HAL_NVIC_SetPriority(TIM2_IRQn,   0, 0);   // 定时采样：抢占 0（最高），可打断别人
HAL_NVIC_SetPriority(USART1_IRQn, 1, 0);   // 串口：抢占 1
HAL_NVIC_SetPriority(EXTI0_IRQn,  1, 1);   // 按键：抢占 1，子 1（同时挂起时排在串口后）
HAL_NVIC_EnableIRQ(TIM2_IRQn);
HAL_NVIC_EnableIRQ(USART1_IRQn);
HAL_NVIC_EnableIRQ(EXTI0_IRQn);
```

验算：分组 3 是 3 位抢占加 1 位子，抢占可用 0~7、子可用 0~1。上面用到的抢占值 0 和 1 在范围内，子值 0 和 1 也在范围内 ✓。另外记一句：只调用 `HAL_NVIC_SetPriority` 并不会打开中断，还要 `HAL_NVIC_EnableIRQ`，这是「中断配了却不进」最常见的原因。
:::

::: tip 例 3 · 判断这三个场景会不会嵌套
**题目**：设分组 2（抢占 4 级、子 4 级）。分别判断：

| 情形 | 结果 |
| --- | --- |
| A 抢占 = 1 正在执行，B 抢占 = 0 到来 | B 抢占 A：A 暂停，B 执行完 A 继续 |
| A 抢占 = 1 正在执行，B 抢占 = 2 到来 | B 不能打断：等 A 结束才轮到 B |
| A 抢占 = 1、子 = 0；B 抢占 = 1、子 = 1；A 正在执行 | 不嵌套：抢占相同，B 只能排队 |

三行情形摆在表里，凭直觉会猜总有一行要嵌套。只有第一行会嵌套，后两行都只是排队。

判据只有一个：看抢占那一位。先把子优先级整个划掉，题目立刻变成三个一次比较。

第三行是最常见的误解，很多人以为子优先级高就能插队。记住一句：抢占管打断，子优先级管排队。

验算：把三行按「谁能打断谁」重读一遍，第一行 B 的抢占值更小，能打断；第二行 B 更大，不能；第三行相等，不能。三条判据自洽 ✓。
:::

优先级定了谁先跑，接着要问的是这些请求从哪根线进来。对 GPIO 来说，那是条有硬约束的通路。

## 四、EXTI：一条线在同一时刻只能接一个端口

STM32 上 GPIO 的电平变化要变成中断请求，必须经过 EXTI（External Interrupt/Event Controller，外部中断与事件控制器）。它的输入不是「引脚」，是「引脚编号」：

- EXTI 有 16 条线（EXTI0~EXTI15），线的编号等于引脚编号；
- 所有端口的 0 号引脚（PA0、PB0、PC0……）都接到同一条 EXTI0，由 `AFIO->EXTICR` 寄存器选择此刻选哪个端口；
- 于是同一条线在同一时刻只能分配给一个端口。

<FigBox title="EXTI 线是按引脚编号组织的" kind="结构" note="PA0、PB0、PC0 的 0 号引脚都接到同一个选择器上，再由 AFIO->EXTICR 决定谁连到 EXTI0。所以 PA0 与 PB0 互斥；而 PA0（EXTI0）与 PB1（EXTI1）用的是两条不同的线，可以共存。">

<svg viewBox="0 0 560 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <rect x="24" y="28" width="72" height="26" rx="3" class="sf-fill"/>
  <text x="60" y="45" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PA0</text>
  <rect x="24" y="76" width="72" height="26" rx="3" class="sf-fill"/>
  <text x="60" y="93" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PB0</text>
  <rect x="24" y="124" width="72" height="26" rx="3" class="sf-fill"/>
  <text x="60" y="141" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PC0</text>
  <line x1="96" y1="41" x2="150" y2="41"/>
  <line x1="96" y1="89" x2="150" y2="89"/>
  <line x1="96" y1="137" x2="150" y2="137"/>
  <rect x="150" y="28" width="96" height="122" rx="3" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="198" y="84" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">16 选 1</text>
  <text x="198" y="100" text-anchor="middle" font-size="8.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">AFIO-&gt;EXTICR</text>
  <line x1="246" y1="89" x2="320" y2="89"/>
  <rect x="320" y="72" width="96" height="34" rx="3" class="sf-fill"/>
  <text x="368" y="93" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">EXTI0</text>
  <line x1="416" y1="89" x2="470" y2="89"/>
  <rect x="470" y="72" width="66" height="34" rx="3" class="sf-fill"/>
  <text x="503" y="93" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">NVIC</text>
  <text x="280" y="176" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">同一时刻只有一根引脚能接到 EXTI0，其余端口的 0 号引脚都连不上</text>
</svg>

</FigBox>

触发方式有上升沿、下降沿、双边沿三种。按键通常配下降沿，配合上拉输入，按下时由高变低。这根线是硬连线，改不了，所以引脚分配要在画原理图阶段就查，改板的代价远高于改代码。

::: tip 例 4 · 两个按键分别接 PA0 和 PB0，能都用外部中断吗
**题目**：两个按键，一个接 PA0、一个接 PB0，都想用外部中断。能同时用吗？

两个引脚，两个编号，看上去各走各的线。编号确实不同，但 0 号引脚只有一条线。

所以先别写代码，先问这两根引脚的中断请求走哪条线。走同一条线的两个引脚，硬件上就是互斥的。

结论：不能直接同时用。两者都对应 EXTI0（引脚编号都是 0），而 EXTICR 同一时刻只能选一个端口。

3 种解法，按推荐顺序：

1. 改引脚分配。把两个按键放到不同编号的引脚上，例如 PA0 与 PB1，各用一条 EXTI 线。这是最干净的做法。
2. 共享一条线，在 ISR 里读 `IDR` 判断。把两个引脚都配成 EXTI0，触发后读两个引脚的电平区分是谁。可行，但要额外处理「同时按下」的歧义。
3. 根本不用外部中断。改用 10 ms 定时扫描，顺便完成消抖（见 [05 · GPIO](./gpio.md)）。按键这种慢信号，扫描往往比中断更可靠。

回代看这个坑的表现：若配置成 PA0 与 PB0 都开中断，实际现象是「只有后配置的那个能用」，或者「按 PB0 进的却是 PA0 的回调」，因为第二条配置把第一条覆盖掉了。*（这类现象不是代码 bug，是硬件拓扑决定的，调试时先画这张选择器图能省半天。）*
:::

请求送到之后，三层函数谁调谁这件事全在软件侧，调错一层等于没改。

## 五、HAL 的中断处理链条：你的代码该写在哪一层

HAL 把一次中断处理拆成三层，看清这个链条才知道自己该改哪一层。

```c
// ① 向量表里的入口（stm32f1xx_it.c，由 CubeMX 生成）
void EXTI0_IRQHandler(void) {
  HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_0);   // ② 转交给 HAL 的公共处理
}

// ② HAL 公共处理（在库里，不用改）：检查标志、清标志，再调用回调
void HAL_GPIO_EXTI_IRQHandler(uint16_t GPIO_Pin) {
  if (__HAL_GPIO_EXTI_GET_IT(GPIO_Pin) != RESET) {
    __HAL_GPIO_EXTI_CLEAR_IT(GPIO_Pin);          // 清标志（必须！）
    HAL_GPIO_EXTI_Callback(GPIO_Pin);            // ③ 调用弱定义的回调
  }
}

// ③ 用户在自己的文件里重写这个弱函数
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
  if (GPIO_Pin == GPIO_PIN_0) key_flag = 1;      // 只置标志，不做重活
}
```

3 个关键点：

- 不要改 `stm32f1xx_it.c` 里 `IRQHandler` 的内容，CubeMX 重新生成时会覆盖掉；
- 用户逻辑写在 `HAL_xxx_Callback` 里。它是 `__weak` 弱定义（weak symbol：链接器发现用户提供了同名强定义时，自动用用户那份替换库里那份），你重写一份即可覆盖；
- 清中断标志是必须的。这一位是「事件已发生」的锁存器，不清它，硬件认为事件一直在，中断会立刻再次进入，现象是程序卡在 ISR 里反复执行。

知道该改哪一层，不等于知道那一层里能写什么。

## 六、ISR 的编写纪律

判据先摆出来：ISR 会推迟所有同优先级与低优先级的中断，也会推迟主循环。所以凡是耗时的、会阻塞的动作，一律挪到外面去。

```c
// ✅ 好的 ISR：短、只做必要的事
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
  ringbuf_put(&rx_buf, rx_byte);   // 存数据就返回
}

// ❌ 坏的 ISR
void HAL_GPIO_EXTI_Callback(uint16_t pin) {
  printf("key pressed\n");         // 串口打印是毫秒级，比中断周期还长
  HAL_Delay(20);                   // 延时 = 让 CPU 在中断里空转
  process_data();                  // 耗时算法，堵住所有低优先级中断
}
```

ISR 里绝对不要做这几件事：调用阻塞函数（`HAL_Delay`）、打印日志、做浮点运算（M3 没有 FPU，软件浮点很慢）、调用不可重入的函数（`malloc`、`printf`）。

共享数据的保护是另一半。ISR 与主循环共享的变量要加 `volatile`（禁止编译器把它缓存进寄存器，否则主循环可能永远读不到更新，见 [03 · 嵌入式 C](./embedded-c.md)）；若是多字节结构，比如环形缓冲的读写指针，访问时还要关中断形成临界区。

::: tip 例 5 · 中断里调 `HAL_Delay` 为什么会卡死
**题目**：某外部中断的抢占优先级是 1，SysTick 的抢占优先级是 3（数值更大，也就是更低）。在这个外部中断的 ISR 里调用 `HAL_Delay(10)`，会发生什么？

10 ms 听着是个小数目，等一等就该过去了。它过不去，因为「10 ms」这个时间本身停住了。

先问一句 `HAL_Delay` 靠谁推动。它的实现是死等 `uwTick` 涨到目标值，而 `uwTick` 由 SysTick 中断里的 `HAL_IncTick()` 递增。于是问题变成：SysTick 这个中断现在能不能进来？

推理链：

1. 当前正在执行抢占 1 的 ISR；
2. SysTick 是抢占 3，数值更大，优先级更低，不能打断当前 ISR；
3. `uwTick` 因此停止增长；
4. `HAL_Delay(10)` 的等待条件永远不满足，整个系统停在这里。

这不是偶发问题。只要在比 SysTick 优先级更高或相同的 ISR 里等 SysTick，死锁是必然的，不是概率问题。抢占值相同也一样，相同优先级不能互相打断。

3 种解法：

1. 不要在 ISR 里用 `HAL_Delay`。这是根本解法，ISR 本来就该快进快出。
2. 确实需要延时的话，把 SysTick 的抢占优先级设为最高（数值 0），让它能抢占任何用户中断。
3. 用 CubeMX 检查 Timebase Source 的优先级设置。很多人把某个用户中断也设成抢占 0，于是又变成同级，再次死锁。

验算：把第 2 条代回去，SysTick 抢占 0 小于外部中断 1，能打断，`uwTick` 继续增长，`HAL_Delay` 正常返回 ✓。*（注意这只是「不卡死」，ISR 里空转 10 ms 仍然挤掉了其它中断 10 ms，本质错误没消除。）*
:::

纪律的另一半是「不被打断」：有些操作必须一次做完。这就是临界区。

## 七、临界区：怎么关、怎么开、关多久

临界区（critical section）指一段执行期间不允许被中断打断的代码，典型场景是操作共享的环形缓冲、读一个多字节变量。做法是临时关总中断：

```c
uint32_t primask = __get_PRIMASK();   // 保存关中断前的状态
__disable_irq();                      // 关总中断（置 PRIMASK = 1）
/* —— 临界区：尽量短 —— */
__set_PRIMASK(primask);               // 按原状态恢复，而不是无条件打开
```

为什么要保存再恢复：如果调用前中断本来就是关的（比如你正处在一个更大的临界区里），粗暴地 `__enable_irq()` 会提前打开中断，可能引入极难复现的时序错误。`PRIMASK` 就是专门记这个状态的那一位：置 1 是关，清 0 是开。

关中断的时间要尽量短，它直接增加系统的中断延迟。被测信号很密的时候（例如每 10 µs 一次），关中断 50 µs 就会丢掉 5 次事件，而丢事件在计数器、编码器这类场景里是永久误差。经验上临界区控制在几微秒以内，绝不跨越函数调用与等待。

规则、时间、纪律都齐了。最后看两个真实系统里这些规则怎么互相牵制。

## 八、工程实例：从轮询改中断，以及中断风暴

用中断代替轮询的收益很实在。一个需要每 1 ms 采集一次 ADC 的系统，轮询写法是 `while(1)` 里不断查标志，CPU 要么空转等待，要么被别的任务拖慢，采样间隔随之漂移。改成定时器中断触发采样后，采样时刻由硬件保证，抖动只有几个时钟周期；CPU 在两次中断之间还可以进低功耗模式。

反过来的坑是中断风暴。某产品把某个外部中断配成双边沿触发，接的是一路有干扰的信号，结果每秒产生上万次中断，一次哪怕只写 1 行代码，也要 24 个周期起步：

$$10000 \times \frac{24}{72\times10^6} \approx 3.3\ \text{ms/s}$$

这还只是进出开销；若 ISR 本体有几十个周期，CPU 就几乎全花在进出中断上，主循环几乎不执行。教训有三条：外部中断要确认信号干净（必要时加硬件滤波）、能用定时扫描就别用边沿中断、中断频率本身就是一项设计指标，上线前算一遍占空比。

## 九、易错清单 + 自检

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. 把优先级数值记反 → 设为 0 的「次要」中断反而压住了关键中断 → 0 是最高，写下来再念一遍。
2. 以为子优先级也能嵌套 → 期望的抢占没发生，时序全部错位 → 只有抢占优先级更高才能打断。
3. EXTI 线冲突（PA0 与 PB0 同时用）→ 只有一个按键能用，或进错回调 → 同编号不同端口互斥，改引脚编号。
4. 忘记清中断标志 → 中断反复进入，程序像卡死 → 用 HAL 公共函数，或自己写时手动清标志。
5. 在 ISR 里调 `HAL_Delay`、`printf` 或浮点运算 → 死锁或严重挤占 → 只置标志，把活留给主循环。
6. 共享变量没加 `volatile` 或没保护临界区 → 主循环读到旧值、指针错乱 → 加 `volatile`，多字节访问关中断。
7. 前后用了两种优先级分组 → 所有已设优先级的含义都变了 → 全系统只用一种分组。
8. 开了中断却没使能 NVIC（漏了 `HAL_NVIC_EnableIRQ`）→ 配了优先级但永远不进中断 → 使能是独立的一步。
9. 关了中断忘了按原状态恢复 → 在更大的临界区里提前开中断 → 先 `__get_PRIMASK()` 存状态再恢复。

自检（先自己想，答案在下面一行）：

1. 抢占优先级与子优先级各在什么时候起作用？哪一个会造成嵌套？
2. 一次中断进出的固定开销是多少个周期？咬尾能省多少？
3. EXTI0 能不能同时接 PA0 和 PB0？为什么 ISR 里不能调 `HAL_Delay`？

（答案：抢占决定能否打断、子优先级只决定同时挂起时的先后，只有抢占会造成嵌套；约 24 个周期，咬尾只花 6 个、省 18 个；不能，同一条线同时只能选一个端口，而 `HAL_Delay` 依赖 SysTick 递增 `uwTick`，SysTick 抢占不了当前 ISR 就永远死等。）
