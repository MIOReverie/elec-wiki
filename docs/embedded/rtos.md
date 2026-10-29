---
title: 11 · RTOS 入门（FreeRTOS）
description: 裸机 super-loop 的响应延迟差在哪、任务与优先级怎么调度、队列与信号量的分工、优先级反转怎么修、任务栈怎么估，以及中断里能调用什么。
---

# 11 · RTOS 入门（FreeRTOS）

<Meta time="45 min" level="核心" note="什么时候该上 RTOS、任务怎么切、共享资源怎么保护" />

你在写一个环境监测终端：每 200 ms 采一次温湿度，每秒刷一次 OLED 屏，按键要能随时切换显示页面。功能都对，可按键按下去要将近半秒才有反应，因为主循环这一圈正好卡在刷屏上。奇怪的是，把刷屏挪到另一个线程里，延迟立刻降到几毫秒。

同样的功能，代码一行没改，只是不再「排队等着轮到我」了。差别到底在哪？裸机结构慢在哪里、RTOS 用什么机制让它变快、以及引入多任务后新冒出来的三类故障（栈溢出、优先级反转、用错中断 API）怎么防，是这一页要讲清的事。

::: tip 读这页之前
会中断的基本写法，也就是「中断里只置标志、主循环里处理」（[06 · 中断与 NVIC](./interrupt.md)），再加上 C 语言的基本语法，就够读了。中断优先级与抢占、系统时钟与 SysTick、寄存器就是一段有地址的内存，这三样会了会省很多事：<Prereq id="nvic-priority" />、<Prereq id="clock-tree" />、<Prereq id="register-map" />。

用到的符号与记号：$T_{tick}$（一个系统节拍的时间长度）、$t_{ctx}$（一次上下文切换的耗时）、$usStackDepth$（任务栈深度，单位是 `StackType_t` 个字）、$f_{TIM}$（定时器时钟）。记号约定（十六进制 `0x`、位运算 `|`、`~`、`&`）见[符号与约定](../guide/notation.md)。

五个词先各给一句：任务是带自己栈和优先级的独立执行流；优先级数字大的先跑；时间片是同优先级任务轮流用的时间配额；信号量是一个计数器，表示资源还剩几个或某件事发生了；队列是一条先进先出的数据通道。准确定义在第二节和第三节。

没有复数、没有微积分，只有加减乘除。
:::

## 一、裸机 super-loop 的极限

典型的裸机结构是「中断置标志、主循环轮询处理」：

```c
while (1) {
  if (flag_key)   { handle_key();   flag_key = 0; }
  if (flag_uart)  { handle_uart();  flag_uart = 0; }
  if (flag_adc)   { handle_adc();   flag_adc = 0; }
  // ...
}
```

这套结构清晰、开销小，但有一个致命弱点：任何一个处理函数耗时长，其他所有事件的响应就被推迟。中断把「事件发生」记下来，只做到了不丢，没做到不晚，真正处理的那一格还在主循环里排着队。

::: tip 例 1 · 裸机下的响应延迟到底有多糟
**题目**：某系统主循环里有三个处理：

| 处理 | 耗时 |
| --- | --- |
| 传感器采集与计算 | 80 ms |
| 屏幕刷新（SPI 刷一屏） | 50 ms |
| 按键处理 | 1 ms |

求：(a) 一轮循环的周期；(b) 按键在循环开始时按下，延迟多久；(c) 按键在屏幕刷新开始时按下，延迟多久。

<FigBox title="一轮 131 ms 的主循环：按键的等待时间取决于它落在哪一段" kind="时序" note="横轴是循环内的时间。三段处理依次执行、互不重叠。按键事件在段 1 落下，要等段 1 走完才被处理；在段 2 落下就要等两段。同一份代码、同样的负载，延迟却差了一倍多，这就是「响应时间不可预测」的来源。">

<svg viewBox="0 0 640 250" role="img" aria-label="主循环时间条：传感器采集 80 毫秒、屏幕刷新 50 毫秒、按键处理 1 毫秒，合计 131 毫秒；按键在第一段落下时等待 80 毫秒">
  <defs>
    <marker id="rt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
    </marker>
    <marker id="rt-arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-2)" />
    </marker>
  </defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="20" y="24" fill="var(--vp-c-text-3)">主循环一轮（时间轴 0 → 131 ms）</text>
    <rect x="60" y="40" width="342" height="34" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="231" y="62" text-anchor="middle">传感器采集与计算 · 80 ms</text>
    <rect x="402" y="40" width="214" height="34" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.6" />
    <text x="509" y="62" text-anchor="middle">刷屏 50 ms</text>
    <rect x="616" y="40" width="14" height="34" fill="var(--vp-c-brand-2)" />
    <text x="626" y="62" font-size="10" text-anchor="middle" fill="var(--vp-c-text-1)">1</text>
    <line x1="60" y1="40" x2="60" y2="98" stroke="var(--vp-c-text-3)" stroke-width="1" />
    <line x1="402" y1="40" x2="402" y2="98" stroke="var(--vp-c-text-3)" stroke-width="1" />
    <line x1="616" y1="40" x2="616" y2="98" stroke="var(--vp-c-text-3)" stroke-width="1" />
    <text x="60" y="114" text-anchor="middle" fill="var(--vp-c-text-3)">0</text>
    <text x="402" y="114" text-anchor="middle" fill="var(--vp-c-text-3)">80</text>
    <text x="616" y="114" text-anchor="middle" fill="var(--vp-c-text-3)">130</text>
    <text x="640" y="136" text-anchor="end" fill="var(--vp-c-text-3)">131 ms</text>

    <line x1="60" y1="150" x2="60" y2="176" stroke="var(--vp-c-brand-2)" stroke-width="2" marker-end="url(#rt-arrow2)" />
    <text x="60" y="192" text-anchor="middle" fill="var(--vp-c-brand-2)">按键落下</text>
    <line x1="60" y1="212" x2="402" y2="212" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#rt-arrow)" />
    <text x="231" y="232" text-anchor="middle" fill="var(--vp-c-brand-1)">等待 80 ms 才被处理</text>
  </g>
</svg>

</FigBox>

先别算，先想清楚延迟是怎么来的。中断里按键事件立刻被记下，但处理代码要等主循环转到它那一格。所以延迟等于事件落下时，距离循环下一次转到该分支还剩多少时间。这决定了本题要画时间轴，而不是列公式。

步骤：

1. 一轮循环的周期 = 三段处理之和：$80 + 50 + 1 = 131$ ms。*（为什么直接相加：三段是顺序执行、互不重叠的，没有并行。）*
2. (b) 按键在循环刚开始（t = 0）落下：此时循环正要跑传感器采集，这 80 ms 内不会去看按键标志，延迟 80 ms。*（为什么不是 131：按键分支排在传感器分支后面，但传感器跑完的瞬间就轮到它了，不用等完整个循环。）*
3. (c) 按键在 t = 80 ms（刷屏刚开始）落下：按键分支要等到 $50 + 1$ ms 之后，延迟 51 ms。

回代验算：两种情形的延迟分别是 80 ms 和 51 ms，相差 29 ms，而两次按键的操作完全一样、用户也察觉不到区别。这就是「延迟不可预测」的准确含义：不是延迟大，是延迟会变。人类感知迟钝的阈值约 100 ms，所以 80 ms 尚在「明显能感觉到」的边缘；一旦刷屏变成 150 ms，按键延迟就会突破这个阈值。

更糟的情况：如果传感器处理里有一个 `HAL_Delay(100)` 之类的等待，整个系统的响应就变成 180 ms 以上。`HAL_Delay` 是空转死等，CPU 一直转，什么也没干，这段时间里连串口收来的字节都处理不了。

RTOS 的做法：把三件事拆成三个任务，按键任务设为最高优先级。按键一就绪就立刻抢占正在跑的采集任务，1 ms 处理完再回去，响应时间稳定在 1 ms 量级，而且与系统当时在做什么无关。
:::

到这里能看清一件事：RTOS 并没有让刷屏变快，它只是让「等待」不再占着 CPU。要理解这个机制，先得把 RTOS 的五个基本零件说清。

## 二、RTOS 的核心概念：任务、优先级、时间片

| 概念 | 含义 |
| --- | --- |
| 任务（Task） | 一个独立的执行流，有自己的栈、优先级和状态。本质是一个永不返回的函数 |
| 调度器（Scheduler） | 决定此刻哪个任务获得 CPU。FreeRTOS 默认抢占式 + 优先级 + 同优先级时间片轮转 |
| 任务状态 | 运行（Running）、就绪（Ready）、阻塞（Blocked）、挂起（Suspended） |
| 时间片（Tick） | 系统心跳，由 SysTick 产生，周期由 `configTICK_RATE_HZ` 决定（常设 1000，即 1 ms） |
| 上下文切换 | 保存当前任务的寄存器到它的栈、恢复下一个任务的寄存器 |

五个词里最容易混的是「就绪」和「阻塞」。任务在 CPU 上跑叫运行；准备好了但排在后面叫就绪；在等一个还没发生的事件（等信号量、等队列数据、等延时结束）叫阻塞，阻塞的任务不占用 CPU，调度器根本不会考虑它。调度器永远只在就绪的任务里挑一个来跑。

优先级是一个整数，数字越大越优先，它决定谁先跑；时间片决定同优先级的几个任务怎么轮流。这两件事互不替代：把三个任务全设成同一优先级，调度器只能靠时间片轮着来，你的按键任务仍然要等别人跑完它的时间片。

时间片的长度就是 $T_{tick}$。FreeRTOS 每隔 $T_{tick}$ 触发一次 SysTick 中断，检查有没有更高优先级任务就绪、或者同优先级的任务该换人了。所以「时间片 1 ms」意味着同优先级的两个任务各跑 1 ms 就要换一次。

```c
void vTaskBlink(void *arg) {
  for (;;) {                          // 任务函数必须是无限循环，不能返回
    HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
    vTaskDelay(pdMS_TO_TICKS(500));   // 阻塞 500 ms，让出 CPU
  }
}

xTaskCreate(vTaskBlink, "blink", 128, NULL, 2, NULL);  // 栈深 128、优先级 2
vTaskStartScheduler();                 // 启动调度器，此后不再返回
```

`vTaskDelay` 与 `HAL_Delay` 完全不同：前者让出 CPU，其他任务可以跑；后者是空转死等，占着 CPU 什么都不干。这是整页最该记住的一行代码级区别。

<FigBox title="任务状态与调度：调度器只在「就绪」集合里挑人" kind="结构" note="一个任务在任一时刻只处于一种状态。阻塞态（比如在延时或等信号量）的任务完全不参与调度，所以「等待」不花 CPU 成本，这正是 RTOS 相对裸机轮询的全部意义。">

<svg viewBox="0 0 620 250" role="img" aria-label="任务状态图：就绪、运行、阻塞、挂起四种状态之间的转换关系">
  <defs>
    <marker id="rt-st" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
    </marker>
  </defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <rect x="30" y="100" width="110" height="44" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <text x="85" y="127" text-anchor="middle">就绪 Ready</text>
    <rect x="215" y="100" width="110" height="44" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="2.4" />
    <text x="270" y="127" text-anchor="middle">运行 Running</text>
    <rect x="400" y="40" width="110" height="44" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.8" />
    <text x="455" y="67" text-anchor="middle">阻塞 Blocked</text>
    <rect x="400" y="170" width="110" height="44" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.8" />
    <text x="455" y="197" text-anchor="middle">挂起 Suspended</text>
    <line x1="140" y1="116" x2="213" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1.8" marker-end="url(#rt-st)" />
    <text x="176" y="108" text-anchor="middle" fill="var(--vp-c-text-3)">调度</text>
    <line x1="325" y1="116" x2="398" y2="116" stroke="var(--vp-c-text-3)" stroke-width="1.8" marker-end="url(#rt-st)" />
    <text x="360" y="108" text-anchor="middle" fill="var(--vp-c-text-3)">等待事件</text>
    <line x1="455" y1="86" x2="455" y2="168" stroke="var(--vp-c-text-3)" stroke-width="1.6" marker-end="url(#rt-st)" />
    <text x="465" y="130" fill="var(--vp-c-text-3)">挂起</text>
    <path d="M 398 190 L 90 190 L 90 146" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#rt-st)" />
    <text x="240" y="182" text-anchor="middle" fill="var(--vp-c-text-3)">恢复 → 回到就绪</text>
    <text x="530" y="120" fill="var(--vp-c-text-3)">阻塞任务不参与</text>
    <text x="530" y="136" fill="var(--vp-c-text-3)">调度，不占 CPU</text>
    <path d="M 270 100 L 270 80 L 85 80 L 85 98" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.6" marker-end="url(#rt-st)" />
    <text x="178" y="70" text-anchor="middle" fill="var(--vp-c-text-3)">时间片到 / 更高优先级任务就绪 → 换人（上下文切换）</text>
  </g>
</svg>

</FigBox>

::: tip 例 2 · 抢占调度的时间线
**题目**：三个任务：低（优先级 1）、中（优先级 2）、高（优先级 3）。低、中在 t = 0 就绪，高在 t = 2 就绪。中任务在 t = 5 时因等待信号量进入阻塞态。画出 0 ~ 10 ms 的运行时间线。

<DemoBox title="RTOS 调度演示：调优先级与就绪时刻，看抢占如何发生；再看优先级反转" hint="把「高优先级就绪时刻」从 2 拖到 0，看它一开始就把其他任务压住；再切到「优先级反转」页签，看中优先级如何插队挡住高优先级。">
  <RtosScheduleDemo />
</DemoBox>

先明确调度的唯一规则：永远运行就绪集合里优先级最高的那一个，同优先级才看时间片。有这条规则，时间线不用推导，逐段问「此刻谁就绪、谁优先级最高」即可。

步骤：

1. t = 0：低、中都就绪，中优先级高，跑中。*（为什么不是「低先来先服务」：抢占式调度不看到达顺序，看优先级。）*
2. t = 2：高变为就绪，立刻抢占中，t = 2 ~ 5 跑高。*（为什么是「立刻」而不是「等中跑完」：这就是抢占式与协作式的唯一区别。）*
3. t = 5：中在等待信号量，进入阻塞态（假设此时高还没跑完）。就绪集合只剩高，继续跑高。
4. t = 5 ~ 7：高跑完，进入阻塞态等待数据；中被唤醒变为就绪，跑中。
5. t = 7 ~ 10：中跑完，轮到低。

| 时刻 | 运行的任务 | 说明 |
| --- | --- | --- |
| 0~2 | 中 | 中优先级高于低，先跑 |
| 2~5 | 高 | 高优先级在 t = 2 就绪，立刻抢占中 |
| 5~7 | 中 | 中在 t = 5 短暂阻塞，高完成后中继续 |
| 7~10 | 低 | 中跑完，才轮到低 |
| 10+ | 空闲 | 全部阻塞，运行空闲任务（idle task） |

回代验算：检查两件事。(a) 每个时间段里运行的都必须是「就绪且优先级最高」的那个：0~2 是中（就绪的低优先级更靠后）✓，2~5 是高 ✓；(b) 抢占只发生在高优先级任务变为就绪的那一刻：全时间线只有 t = 2 这一次抢占 ✓。若某段时间线里高优先级任务就绪了却没在跑，那就是错的。

抢占发生在高优先级任务变为就绪的那一刻（可能是中断里释放了一个信号量），而不是等到当前任务的时间片用完。这就是「实时」的含义：可预期的响应时间。
:::

到这儿你能画出 CPU 在谁手里了。可时间线只解决「谁跑」，没解决「任务之间怎么传数据、怎么互相打招呼」。

## 三、任务间通信：队列、信号量、互斥量

| 机制 | 用途 | 特点 |
| --- | --- | --- |
| 队列 Queue | 任务间传数据（先进先出 FIFO） | 可传结构体；可阻塞等待；是首选的数据通道 |
| 二值信号量 | 同步/通知（「事情发生了」） | 不传数据；没有优先级继承 |
| 计数信号量 | 资源计数（如「还有几个缓冲可用」） | 一般信号量的可计数版本 |
| 互斥量 Mutex | 保护共享资源（互斥访问） | 带优先级继承；必须同一任务「获取—释放」配对 |
| 事件组 | 等待多个事件的组合（与/或） | 适合「等 A 和 B 都发生」 |

三个词各用一句话钉死。

- 队列是信箱，把数据本身送过去，先进先出，容量有限（满了会阻塞或丢弃）。
- 信号量是计数器，它不传数据，只表示一个数。最常见的二值信号量就退化成一根线：取 1 代表事件已发生，0 代表还没发生。
- 互斥量是锁，一次只允许一个任务持有，用来保护共享资源。它和二值信号量在使用上很像（都是取/放），差别在第四节：互斥量带优先级继承。

```c
// 队列：中断里收串口数据，任务里解析
QueueHandle_t q = xQueueCreate(32, sizeof(uint8_t));
// 发送（中断里必须用 FromISR 版本）
xQueueSendFromISR(q, &byte, &pxHigherPriorityTaskWoken);
// 接收（任务里阻塞等待）
uint8_t b;
if (xQueueReceive(q, &b, portMAX_DELAY) == pdTRUE) { /* 处理 b */ }
```

这段代码里有一个必须讲清楚的设计：中断和任务之间不要直接共享那个 `byte` 变量。如果中断写 `rx_byte`、任务读 `rx_byte`，两者之间没有任何先后保证，任务可能在中断写到一半时就把旧值读走了。中断与任务之间正确的数据通路就是队列：中断负责入队（不阻塞、不等待），任务负责出队（可以阻塞等待）。

::: tip 例 3 · 该用哪个：三个真实场景
**题目**：判断下列三个需求分别该用队列、信号量还是互斥量，并说明理由。

(a) 串口中断收到字节，要交给协议解析任务处理。
(b) 采集任务采完一帧数据，要通知发送任务「可以发了」。
(c) 两个任务都要往同一个环形缓冲区（ring buffer）里写日志。

<FigBox title="三种机制在数据流上的位置" kind="结构" note="队列搬运的是数据本身；信号量只递一个信号；互斥量不递任何东西，只保证同一时刻只有一个任务在临界区内。选错的典型症状是：用信号量传数据（数据并没被搬走，只是双方都以为搬走了），或者用互斥量传数据（能跑，但把数据塞进了共享变量，等于绕开了队列）。">

<svg viewBox="0 0 640 210" role="img" aria-label="队列、信号量、互斥量三种机制的结构对比">
  <defs>
    <marker id="rt-com" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
    </marker>
  </defs>
  <g font-size="11.5" fill="var(--vp-c-text-1)">
    <rect x="16" y="30" width="196" height="160" rx="9" fill="none" stroke="var(--vp-c-divider)" />
    <text x="114" y="22" text-anchor="middle" font-weight="700">队列 Queue</text>
    <rect x="32" y="86" width="60" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="62" y="110" text-anchor="middle">生产者</text>
    <rect x="136" y="86" width="60" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="166" y="110" text-anchor="middle">消费者</text>
    <path d="M 92 106 L 134 106" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#rt-com)" />
    <text x="113" y="64" text-anchor="middle" fill="var(--vp-c-text-3)">FIFO 缓冲</text>
    <text x="113" y="172" text-anchor="middle" fill="var(--vp-c-text-3)">传的是数据本身</text>

    <rect x="222" y="30" width="196" height="160" rx="9" fill="none" stroke="var(--vp-c-divider)" />
    <text x="320" y="22" text-anchor="middle" font-weight="700">信号量 Semaphore</text>
    <rect x="238" y="86" width="60" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="268" y="110" text-anchor="middle">给出</text>
    <rect x="342" y="86" width="60" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="372" y="110" text-anchor="middle">等待</text>
    <path d="M 298 106 L 340 106" stroke="var(--vp-c-brand-1)" stroke-width="2" marker-end="url(#rt-com)" />
    <text x="319" y="64" text-anchor="middle" fill="var(--vp-c-text-3)">一个计数器</text>
    <text x="319" y="172" text-anchor="middle" fill="var(--vp-c-text-3)">不传数据</text>

    <rect x="428" y="30" width="196" height="160" rx="9" fill="none" stroke="var(--vp-c-divider)" />
    <text x="526" y="22" text-anchor="middle" font-weight="700">互斥量 Mutex</text>
    <rect x="444" y="86" width="60" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="474" y="110" text-anchor="middle">任务 A</text>
    <rect x="548" y="86" width="60" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="578" y="110" text-anchor="middle">任务 B</text>
    <line x1="504" y1="106" x2="510" y2="106" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <rect x="510" y="92" width="32" height="28" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="526" y="111" text-anchor="middle" font-size="10.5">锁</text>
    <line x1="542" y1="106" x2="548" y2="106" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    <text x="526" y="64" text-anchor="middle" fill="var(--vp-c-text-3)">同一把锁</text>
    <text x="526" y="172" text-anchor="middle" fill="var(--vp-c-text-3)">互斥进入临界区</text>
  </g>
</svg>

</FigBox>

先问一句「这件事是在搬数据、在通知、还是在防打架」。搬数据用队列，通知用信号量，防打架用互斥量。第三种有一个额外约束必须记住：保护共享资源要用互斥量，不要用二值信号量，理由下一节讲。

解答：

- (a) 队列。要搬的是数据本身。`uint8_t` 小，也可以用队列传 `uint8_t`；若传结构体，队列的元素大小就是 `sizeof(结构体)`。
- (b) 二值信号量。数据已经在别处（共享缓冲区或另一个队列）了，采集任务只需要敲一下门。用队列反而浪费，传一个没人读的空数据。
- (c) 互斥量（或关中断的短临界区）。两个任务要同时往同一个缓冲区写，这是典型的共享资源需要互斥。

回代验算：把三个方案代回需求逐条对。(a) 字节会不会丢？队列满了会阻塞或丢，要选策略（见易错清单）；(b) 发送任务是不是被数据卡住？信号量不传数据，不存在这个问题；(c) 会不会写坏？两个任务同时写环形缓冲区的索引指针就会错，必须互斥。三条都对得上，分类正确。
:::

三件套选对了，还有一个隐蔽的危险：互斥量用错了，会让最高优先级的任务被低优先级的任务挡住。这在裸机里根本不存在，是引入 RTOS 后特有的故障。

## 四、优先级反转

低优先级任务 L 正在跑（它拿到了某把锁），高优先级任务 H 就绪了。H 比 L 优先级高，所以立刻抢占 L。但 H 需要同一把锁，而锁在 L 手里，H 只能阻塞等待。麻烦就在这儿：L 被 H 抢占了，可 L 因为被 H 挡住，没能继续跑完去释放锁。

<FigBox title="优先级反转：最高优先级的 H 被锁在低优先级 L 手里" kind="时序" note="关键在 t2 到 t3 这一段：H 已经就绪却跑不了，因为锁在 L 手里；而 L 又被中优先级 M 抢占，迟迟释放不了锁。H 被挡多久，完全取决于 M 要跑多久。">

<svg viewBox="0 0 640 260" role="img" aria-label="优先级反转时间线：高优先级 H 被低优先级 L 持有的锁挡住，中优先级 M 插队跑，H 长时间无法运行">
  <defs>
    <marker id="rt-blk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
    </marker>
  </defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="70" y="40" fill="var(--vp-c-brand-2)">H（最高）</text>
    <text x="70" y="96" fill="var(--vp-c-text-1)">M（中）</text>
    <text x="70" y="152" fill="var(--vp-c-text-3)">L（最低，持锁）</text>
    <text x="70" y="208" fill="var(--vp-c-text-3)">锁的状态</text>

    <rect x="130" y="22" width="200" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-2)" stroke-width="1.8" />
    <text x="230" y="40" text-anchor="middle">阻塞：等锁</text>
    <rect x="330" y="22" width="280" height="26" rx="5" fill="var(--vp-c-brand-2)" stroke-width="0" fill-opacity="0.15" />
    <text x="470" y="40" text-anchor="middle" fill="var(--vp-c-brand-2)">仍然阻塞（被 M 拖着）</text>
    <line x1="330" y1="14" x2="330" y2="56" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="3 3" />

    <rect x="130" y="78" width="200" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.5" stroke-dasharray="4 3" />
    <text x="230" y="96" text-anchor="middle" fill="var(--vp-c-text-3)">阻塞</text>
    <rect x="330" y="78" width="280" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="470" y="96" text-anchor="middle">插队运行（抢占 L）</text>
    <line x1="330" y1="70" x2="330" y2="112" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="3 3" />

    <rect x="130" y="134" width="200" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-3)" stroke-width="1.8" />
    <text x="230" y="152" text-anchor="middle">运行（持锁）</text>
    <rect x="330" y="134" width="280" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-3)" stroke-width="1.8" />
    <text x="470" y="152" text-anchor="middle">被 M 抢占，未能释放锁</text>

    <rect x="130" y="190" width="200" height="26" rx="5" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
    <text x="230" y="208" text-anchor="middle">锁被 L 持有</text>
    <rect x="330" y="190" width="280" height="26" rx="5" fill="var(--vp-c-brand-2)" stroke-width="1.6" />
    <text x="470" y="208" text-anchor="middle" fill="var(--vp-c-brand-2)">锁仍未释放 → H 继续等</text>

    <line x1="100" y1="18" x2="100" y2="220" stroke="var(--vp-c-divider)" stroke-width="1.2" />
    <text x="230" y="240" text-anchor="middle" fill="var(--vp-c-text-3)">t1：H 就绪</text>
    <text x="470" y="240" text-anchor="middle" fill="var(--vp-c-text-3)">t2：M 就绪并插队 → t3：L 释放锁</text>
  </g>
</svg>

</FigBox>

::: tip 例 4 · 优先级反转是怎么发生的，怎么修
**题目**：任务 L（优先级 1）持有一个互斥量访问共享资源；任务 H（优先级 3）就绪后抢占，但需要同一个互斥量，于是阻塞；此时任务 M（优先级 2）就绪，它的优先级高于正在持锁的 L，于是抢占 L 开始运行。问：H 最坏被挡多久？怎么修？

先别急着写代码，先把因果链捋直。关键的一环是：L 被 H 抢占后，为什么不能马上跑完把锁释放掉？因为 M 又把它抢走了。这条链子里，H 是被 M 间接挡住的。

步骤：

1. t1：H 就绪，抢占 L；但 L 持锁，H 请求同一把锁，于是 H 阻塞，让出 CPU。
2. t2：L 恢复运行，本该立刻跑完释放锁。
3. t2'：M 就绪，优先级高于 L，M 抢占 L 继续跑。L 被挡在门外。
4. t3：M 跑完，L 恢复，释放锁，H 才被唤醒。

结果：最高优先级的 H 在等锁，而中优先级的 M 却在跑，H 被比它优先级低的任务挡住了，而且被挡多久取决于 M 跑多久，完全不可预期。1997 年火星探路者号（Mars Pathfinder）在轨重启的著名故障，根源就是优先级反转。

解法叫优先级继承（priority inheritance）：当高优先级任务等待某个互斥量时，临时把持锁的低优先级任务提升到等待者的优先级，让中优先级任务无法插队，L 就能尽快跑完释放锁。

回代验算：加上优先级继承后重跑时间线。t2' 时 L 的优先级被临时提升到与 H 相同（3），而 M 只有 2，M 无法抢占 L（抢占规则要求新任务优先级严格更高）。L 跑完释放锁，H 被唤醒，H 优先级最高，立即运行。M 被推迟了，H 的等待时间从「M 的运行时长」缩短到「L 剩余的临界区长度」✓。这就是「继承」这个名字的来历：低优先级任务在等待期间继承了高优先级任务的优先级。

三条实践：

- 保护共享资源要用 mutex（`xSemaphoreCreateMutex`，带优先级继承），不要用二值信号量，后者没有优先级继承，挡不住这个问题；
- 临界区（持锁时间）要尽可能短，只在真正访问共享资源的那几行加锁，别在锁里做打印、延时这类耗时操作；
- 若能用队列代替共享变量，就优先用队列，从根源上消除共享。
:::

优先级反转的根因是「任务在等待时还占着别人需要的资源」。还有一类更隐蔽的故障：任务还没开始用资源，就先把内存写坏了。那是栈。

## 五、任务栈：最容易悄悄炸掉的地方

每个任务有独立的栈，大小在 `xTaskCreate` 时指定，单位是 `StackType_t`（32 位下 4 字节），所以：

$$\text{栈字节数} = usStackDepth \times 4$$

例如 `usStackDepth = 128` 就是 512 字节。

为什么要给每个任务单独一个栈？函数调用会往栈上压返回地址、局部变量、寄存器保存现场。任务切换时，这些现场必须被保存起来，保存到哪儿？就是这个任务自己的栈。所以栈是任务存在的物理基础，没有栈就没有任务的现场。

::: tip 例 5 · 估算任务栈并留余量
**题目**：某任务会：调用若干层函数（最深约 3 层）、每层若干局部变量（合计约 80 字节），并调用 `printf`（`printf` 内部的格式化缓冲可能吃掉 500~1000 字节）。求 `usStackDepth` 的建议取值。

<FigBox title="栈上到底堆了什么：从最深调用点往下数" kind="结构" note="栈是「后进先出」的一段内存：调用最深的那层函数占最上面，栈底是任务入口。每个被调用的函数都要压入自己的返回地址与局部变量。">

<svg viewBox="0 0 620 250" role="img" aria-label="任务栈结构示意：栈顶是 printf 的格式化缓冲，其下是三层调用帧和局部变量，栈底是任务入口">
  <defs>
    <marker id="rt-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
    </marker>
  </defs>
  <g font-size="12" fill="var(--vp-c-text-1)">
    <text x="60" y="34" fill="var(--vp-c-text-3)">栈顶（SP）</text>
    <rect x="60" y="44" width="300" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-2)" stroke-width="1.8" />
    <text x="76" y="70">printf 格式化缓冲</text>
    <text x="300" y="70" text-anchor="end" fill="var(--vp-c-brand-2)">≈ 1000 B</text>
    <rect x="60" y="88" width="300" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="76" y="114">第 3 层调用帧 + 局部变量</text>
    <text x="300" y="114" text-anchor="end" fill="var(--vp-c-text-3)">≈ 59 B</text>
    <rect x="60" y="132" width="300" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="76" y="158">第 2 层调用帧 + 局部变量</text>
    <text x="300" y="158" text-anchor="end" fill="var(--vp-c-text-3)">≈ 59 B</text>
    <rect x="60" y="176" width="300" height="42" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="76" y="202">第 1 层调用帧 + 局部变量</text>
    <text x="300" y="202" text-anchor="end" fill="var(--vp-c-text-3)">≈ 59 B</text>
    <rect x="60" y="220" width="300" height="18" rx="4" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.4" />
    <text x="76" y="233" font-size="11">栈底：任务入口与保存的寄存器现场</text>
    <line x1="392" y1="230" x2="392" y2="50" stroke="var(--vp-c-text-3)" stroke-width="1.6" marker-end="url(#rt-up)" />
    <text x="404" y="140" fill="var(--vp-c-text-3)">占用随调用深度增长</text>
    <text x="500" y="70" fill="var(--vp-c-text-3)">越往下越深</text>
    <text x="500" y="88" fill="var(--vp-c-text-3)">（先压后弹）</text>
  </g>
</svg>

</FigBox>

估算栈的思路是「从最深的那次调用算起，一层层加上去」，栈的占用等于最坏情况下所有同时存在的调用帧之和。容易漏的是库函数（`printf`、`snprintf`、浮点格式化）的内部缓冲，以及中断里用到的栈（见第六节）。

步骤：

1. 局部变量合计：80 字节。
2. 调用帧：最深 3 层，每层按 32 字节（返回地址 + 若干保存的寄存器）估，$3\times32 = 96$ 字节。
3. `printf` 内部缓冲：取上限 1000 字节。
4. 浮点/上下文余量：100 字节。

$$\text{估算} = \underbrace{80}_{\text{局部变量}} + \underbrace{3 \times 32}_{\text{调用帧}} + \underbrace{1000}_{\text{printf}} + \underbrace{100}_{\text{浮点/上下文}} \approx 1300\ \text{字节}$$

5. 换算成栈深度：$1300 / 4 = 325$，取 384（约 1.5 KB）并留余量。

回代验算：$384 \times 4 = 1536$ 字节 > 1300 字节估算，余量 236 字节（约 18%）✓。余量给谁用？给编译器对齐、给将来新增的局部变量、给中断嵌套。栈溢出几乎从来不是「正好差一个字节」，多半是「差一点」。

验证方法：FreeRTOS 提供 `uxTaskGetStackHighWaterMark()` 查询「历史最小剩余栈」，也就是栈的高水位线：

```c
printf("剩余栈: %lu words\n", uxTaskGetStackHighWaterMark(NULL));
```

运行时打印这个值，剩余量很小（接近 0）就说明栈快溢出了。开发阶段应该给每个任务查一次。

栈溢出的可怕之处是它不会立刻报错，而是静默破坏相邻内存，表现为「某个变量莫名其妙变了」「程序跑几天后死机」，极难定位。所以要么开 `configCHECK_FOR_STACK_OVERFLOW`，要么主动查高水位线。

栈大小还和 RAM 预算是一对。每个任务的栈都是常驻 RAM 的（任务运行时才用，但栈空间在创建时就分配好了）。三个任务各 1.5 KB 就是 4.5 KB，在 RAM 只有 8 KB 的小芯片上直接吃掉一半，这会影响第七节的判断。
:::

栈估完了，任务跑起来也安全了。但还有一个雷区在中断那边：中断里能调用什么、不能调用什么。

## 六、中断与 RTOS 的配合

铁律：在中断服务程序里，只能调用带 `FromISR` 后缀的 API（`xQueueSendFromISR`、`xSemaphoreGiveFromISR` 等）。普通版本可能触发任务切换，而中断上下文里切换任务会导致系统崩溃。

```c
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
  BaseType_t xHigherPriorityTaskWoken = pdFALSE;
  xQueueSendFromISR(uart_queue, &rx_byte, &xHigherPriorityTaskWoken);
  portYIELD_FROM_ISR(xHigherPriorityTaskWoken);   // 若有更高优先级任务被唤醒，立刻切换
}
```

为什么普通版会崩？普通版 `xQueueSend` 在成功后会当场调用调度器做一次上下文切换，把当前任务的寄存器存进它的栈、恢复另一个任务的栈。这套动作依赖「当前正在运行的是一个任务」这个前提。而中断里跑的是中断上下文：它压在同一份硬件栈上，但内核的「当前任务」指针指向的是被中断的那个任务。在中断里做一次完整的任务切换，内核状态和硬件现场就对不上，轻则任务栈错乱，重则跳到野地址直接 HardFault。

所以 FreeRTOS 提供了两套 API：普通版用于任务上下文，`FromISR` 版用于中断上下文。后者不切换任务，只做「记一笔：有个更高优先级的任务被唤醒了」。最后由 `portYIELD_FROM_ISR` 统一决定要不要在中断退出时切换一次。

另一个要点是中断优先级与 RTOS 的关系。FreeRTOS 能管理的中断优先级有上限（由 `configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY` 决定）。优先级高于这个值的中断不受 RTOS 管理，里面绝不能调用任何 FreeRTOS API，连 `FromISR` 版本都不行，这是很多人踩的坑。

> **为什么会有这个上限**
> RTOS 要在中断里保存/恢复内核自己的数据结构（比如就绪列表的指针），这些操作不是原子的。中断嵌套进来会把内核状态改到一半。所以 FreeRTOS 规定：优先级低于等于配置值的中断才能碰内核变量；优先级更高的中断属于「不可打断 RTOS 临界区」的范畴，只能做纯粹的硬件操作。相关的优先级分组规则见 <Prereq id="nvic-priority" />。

还有一个与栈有关的点：中断使用同一份硬件栈（MSP），不占用任务的 PSP（进程栈）。但中断服务函数里如果调用了带深栈的库函数（`printf`、浮点运算），一样会把栈压得很深。所以中断服务函数里应该避免调用 `printf` 这类吃栈的函数，用 `ITM_SendChar` 或串口 DMA 代替。

机制、坑、与中断的配合，到这里都齐了。剩下一个工程判断：你的项目到底该不该上 RTOS。

## 七、什么时候不需要 RTOS

| 场景 | 建议 |
| --- | --- |
| 逻辑简单、只有一两条时序 | 裸机（中断 + 状态机），可靠且省资源 |
| RAM < 8 KB 的小芯片 | 裸机（每个任务栈都要占 RAM） |
| 多组独立时序（采集 + 通信 + UI） | 上 RTOS |
| 需要复杂协议栈（网络、USB、文件系统） | 上 RTOS（这些协议栈本身就依赖任务） |
| 硬实时、微秒级响应 | 用中断保证，而不是靠提高任务优先级 |

RTOS 的代价是额外的 RAM（任务栈）、额外的 CPU 开销（上下文切换），以及更高的调试难度（竞态、死锁）。别为了「显得专业」而上 RTOS。

上下文切换的开销到底多大？一次切换（保存 + 恢复寄存器、切换栈指针）通常在 1~10 µs 量级，取决于内核实现与编译器。若 $T_{tick} = 1$ ms、每次切换 10 µs，那么光切换开销就占约 1% 的 CPU 时间。这个比例对绝大多数应用可以忽略，所以「RTOS 太慢」通常是个伪问题，问题从来不在切换开销，而在任务划分得对不对。

判断标准一句话：如果你能用一句「主循环里有几件事」把程序说清楚，用裸机；如果你要画图才能说清「谁在等谁」，用 RTOS。

真要上手，顺序大致是：

1. 先量一遍裸机下的最坏延迟，看项目能不能接受；
2. 把任务拆出来，一个任务只做一件事；
3. 定优先级，按响应要求排，而不是按「哪个模块更重要」排；
4. 用队列把中断和任务隔开；
5. 最后才估栈、查高水位线，并补上超时与错误处理。

RTOS 解决的是「怎么跑得又快又对」，没解决「怎么跑得久」。电池供电的设备活不过一天，再快的调度也没用，那件事在低功耗那一章。

## 八、易错清单 + 自检

易错清单按踩坑频率排序，每条是「错误做法 → 会得到什么 → 正确做法」：

- [ ] 在中断里用了不带 `FromISR` 的 API → 系统崩溃或 HardFault → 中断里只调 `FromISR` 版本 + `portYIELD_FROM_ISR`。
- [ ] 中断优先级高于 RTOS 管理上限，却在里面调了 FreeRTOS API → 内核状态被改坏，行为随机 → 用 `configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY` 把优先级分组设对。
- [ ] 用二值信号量当互斥量用 → 没有优先级继承，会反转 → 保护共享资源一律用 `xSemaphoreCreateMutex`。
- [ ] 任务栈太小 → 静默破坏内存（用高水位线检查）→ 开 `configCHECK_FOR_STACK_OVERFLOW`，并对每个任务查 `uxTaskGetStackHighWaterMark()`。
- [ ] 任务函数里写了 `return` 或不是无限循环 → 任务结束会跑飞（返回地址是垃圾）→ 任务函数必须 `for(;;)`。
- [ ] 用 `HAL_Delay` 而不是 `vTaskDelay` → 占着 CPU 空转，其他任务无法运行，优先级抢占形同虚设 → 用 `vTaskDelay(pdMS_TO_TICKS(x))`。
- [ ] 在持锁期间做耗时操作（打印、延时）→ 加剧优先级反转 → 临界区只留真正访问共享资源的几行。
- [ ] 共享变量/资源没加保护（关中断、互斥量或队列）→ 数据错乱，且错得随机、极难复现 → 中断与任务之间用队列，任务之间用互斥量。
- [ ] 中断与任务之间直接共享一个变量（不经过队列）→ 读到半新半旧的数据 → 中断只负责入队，任务负责出队。
- [ ] 以为「优先级设高就一定先跑完」→ 任务一旦阻塞，CPU 照样给别的任务 → 靠优先级分配「谁先开始」，靠队列/信号量分配「谁先做完」。

自检（答案不在本页，自己说一遍）：

1. 抢占式调度中，高优先级任务在什么时刻获得 CPU？时间片在什么时候起作用？
2. 优先级反转是怎么发生的？解法是什么？为什么二值信号量当互斥量用会出问题？
3. `usStackDepth = 128` 对应多少字节栈？为什么栈溢出会「静默」？
4. 为什么中断里不能调用普通的 `xQueueSend`？`FromISR` 版本做了一件不一样的事，是什么？
