---
title: 08 · 串口 UART
description: 一台电脑和一块板子对不上话时该查哪儿：帧结构、波特率误差、三种收法、环形缓冲与不定长帧、TTL 与 RS232/RS485 的电平差别。
---

# 08 · 串口 UART

<Meta time="45 min" level="核心" note="嵌入式最常用的对外接口：帧结构、波特率误差、轮询/中断/DMA 三种收法；最容易错的是 LSB 先发与波特率误差累积" />

TX、RX、地，三根线接好，两边波特率都设成 115200。打开串口助手，屏幕上滚出 `元元鈥君子坦荡荡` 这样的乱码。偶尔一切正常，烧录温度一高又开始偶发地错。

乱码的根源只有两种：两边对「一位有多长」的理解不一致，或者对「哪里是一帧的开头」理解不一致。前者是波特率误差，后者是帧格式、电平标准、LSB 顺序。这两条线拆开讲透，剩下的就都是细节。

UART（Universal Asynchronous Receiver/Transmitter，通用异步收发器）是一种没有时钟线、靠双方事先约定节奏的串行通信方式。

::: tip 读这页之前
会寄存器是什么（<Prereq id="register-map" />，串口的所有配置最终都是往寄存器写数）、看得懂时钟树（<Prereq id="clock-tree" />，波特率由总线时钟 PCLK 分频得到，不知道 PCLK 是多少就没法算误差），波特率那笔账就能自己算。

符号：`0x`（十六进制前缀）、`<<`（左移）、bps（位 / 秒，bit per second）、µs 和 ms（微秒、毫秒）。记号约定见[符号与约定 · 数字与嵌入式](../guide/notation.md)。

不用复数，不用微积分，只需要乘法和除法。
:::

## 一、为什么需要「约定波特率」

同步通信（SPI、I²C）有专门的时钟线，接收方照着时钟采样即可。UART 每个方向只有一根数据线，没有时钟，双方只能事先约定每位持续多久。这就是波特率（baud，单位 bps，位 / 秒）的含义。

发方按约定节奏把每一位放到线上，收方按同样的节奏采样。为了对齐每一帧的起点，UART 规定了三件事：

1. 线路空闲时为高电平。
2. 发送时先拉低一位，这个下降沿就是起始位，也是收方的同步信号。
3. 收方检测到下降沿后，等半个位时间再采第一次（跳过边沿本身、在位的中间采样最可靠），之后每隔一个位时间采一次。

::: tip 例 1 · 算一帧的时间和吞吐
**题目**：115200 bps、8 位数据、无校验、1 位停止位（最常见的 `115200-8-N-1` 格式）。算一帧占多少位、传 1000 字节要多久。

题目给的是 115200 bps 和 `8-N-1`：先把一帧的位数数清楚，再算位时间，最后才算吞吐。顺序反了，很容易把「8 位数据」当成一帧只有 8 位。

步骤：

1. 数位数：一帧 = 起始 1 + 数据 8 + 校验 0 + 停止 1 = 10 位。为什么从起始位开始数：波特率里的「位」包含起始位和停止位，它们照样占线上的时间。
2. 位时间与帧时间：

$$\text{位时间} = \frac{1}{115200} \approx 8.68\ \mu\text{s},\qquad \text{一帧} = 10 \times 8.68 = 86.8\ \mu\text{s}$$

3. 有效数据速率，10 位里只有 8 位是数据：$115200/10 = 11520$ 字节/秒；传 1000 字节要 $1000\times86.8\ \mu\text{s} = 86.8$ ms。为什么按帧时间算而不是位时间：字节之间还夹着起始位和停止位。
4. 换成 9600 bps 对照：一帧 $10/9600 = 1.04$ ms，1000 字节要 1042 ms，超过 1 秒了。

回代验算：11520 字节/秒 × 86.8 µs/字节 = 11520 × 86.8 µs ≈ 1.0 s/11520 字节 → 每字节 86.8 µs ✓。速率与单帧时间互为倒数，两条路算出同一个数。

波特率里的「位」包含起始位和停止位，所以有效数据速率只有标称值的 80%（无校验时）。做传输时间预算必须按这个算，否则会低估耗时。
:::

这张波形图把 `0x55` 在 8-N-1 格式下的完整帧画了出来，左边标每位时长，右边标接收方的采样点：

<FigBox title="115200-8-N-1 下一帧的真实波形（发送 0x55）" kind="时序" note="0x55 的二进制是 01010101，但线上从左到右是 1、0、1、0、1、0、1、0——LSB 先发，顺序正好反过来。灰色虚线是接收方的采样点：起始位下降沿之后等半个位时间才采第一次，之后每个位中间采一次。">

<svg viewBox="0 0 700 210" role="img" aria-label="UART 帧波形：起始位低电平，数据位 LSB 先发，停止位回到高电平，虚线为采样点">
<defs>
  <marker id="ua-s" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2"
    points="20,60 40,60 40,140 120,140 120,60 200,60 200,140 280,140 280,60 360,60 360,140 440,140 440,60 520,60 520,140 600,140 600,60 680,60" />
  <line x1="20" y1="60" x2="680" y2="60" stroke="var(--vp-c-divider)" stroke-width="0.8" stroke-dasharray="3 4" />
  <line x1="20" y1="140" x2="680" y2="140" stroke="var(--vp-c-divider)" stroke-width="0.8" stroke-dasharray="3 4" />
  <text x="24" y="50" fill="var(--vp-c-text-3)">高（空闲）</text>
  <text x="24" y="158" fill="var(--vp-c-text-3)">低</text>
  <text x="80" y="176" text-anchor="middle">起始位</text>
  <text x="160" y="176" text-anchor="middle">D0=1</text>
  <text x="240" y="176" text-anchor="middle">D1=0</text>
  <text x="320" y="176" text-anchor="middle">D2=1</text>
  <text x="400" y="176" text-anchor="middle">D3=0</text>
  <text x="480" y="176" text-anchor="middle">D4=1</text>
  <text x="560" y="176" text-anchor="middle">D5=0</text>
  <text x="640" y="176" text-anchor="middle">停止位=1</text>
  <line x1="40" y1="44" x2="120" y2="44" stroke="var(--vp-c-text-3)" stroke-width="1" marker-start="url(#ua-s)" marker-end="url(#ua-s)" />
  <text x="80" y="36" text-anchor="middle" fill="var(--vp-c-text-3)">位时间 8.68 µs</text>
  <line x1="100" y1="140" x2="100" y2="112" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="180" y1="60" x2="180" y2="92" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="260" y1="140" x2="260" y2="112" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="340" y1="60" x2="340" y2="92" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="420" y1="140" x2="420" y2="112" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="500" y1="60" x2="500" y2="92" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="580" y1="140" x2="580" y2="112" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <line x1="660" y1="60" x2="660" y2="92" stroke="var(--vp-c-text-2)" stroke-width="1.4" />
  <text x="676" y="196" text-anchor="end" fill="var(--vp-c-text-3)">竖线 = 接收方采样点（每个位的中间）</text>
</g>
</svg>

</FigBox>

帧的骨架看到了。传错了怎么办，波特率差一点点会不会出事，是紧跟着的两个问题。

## 二、校验位与波特率误差

校验位（parity bit，附加在数据位之后的一个错误检测位）的能力很朴素：奇校验保证「数据位 + 校验位」里 1 的个数是奇数，偶校验保证是偶数。于是任何奇数个位被干扰翻转都能被发现，偶数个位同时翻错就发现不了。它只能挡最简单的单比特错误，可靠一点的协议都要另加 CRC（Cyclic Redundancy Check，循环冗余校验：对整帧数据做多项式除法得到的校验码，见例 4）。

误差从哪来：UART 用 16 倍过采样（oversampling，接收方用比波特率高 16 倍的内部时钟去数每一位，从而能在位的中间附近采样），分频系数为 $\text{DIV} = f_{PCLK} / (16 \times \text{baud})$。硬件只能取「整数 + 4 位小数」，步长 1/16，PCLK 除不尽的时候，实际波特率就和标称值差一点。

::: tip 例 2 · 波特率误差多大算安全
**题目**：以 USART2（挂在 APB1，PCLK1 = 36 MHz）为例，跑 9600 与 115200，各自误差多少？安全吗？

先猜一下：光算出「误差是百分之几」还不够，得算误差在一帧里累积成多少个位。采样点落在位的中间，只要累积漂移不超过 ±0.5 位就不出错。

步骤：

1. 算理论分频与硬件可取值：

| 波特率 | 理论 DIV | 硬件可取 | 实际波特率 | 误差 |
| --- | --- | --- | --- | --- |
| 9600 | 234.375 | 234 + 6/16 = 234.375 | 9600.00 | 0%（.375 = 6/16 恰好精确） |
| 115200 | 19.5313 | 19 + 9/16 = 19.5625 | 115015.97 | −0.16% |

2. 评估 −0.16%：一帧 10 位，累积漂移 = $10 \times 0.0016 = 0.016$ 位。接收方在每个位中点采样，容错约 ±0.5 位，0.016 位远在容限内。为什么按一帧算而不是按一秒算：UART 每一帧的起始位下降沿都重新同步一次，误差不跨帧累积。

回代验算：115015.97 × (1 + 0.0016) ≈ 115200 ✓。误差方向也自洽：分频取大了，实际波特率偏低，符号为负。
:::

<FigBox title="误差累积：采样点怎么从位中间滑到边界" kind="时序" note="上排是零误差时的采样点，永远落在位中间。下排是双方节奏不一致时的采样点：每采一位就向一侧多漂一点，漂过半位就会把 1 读成 0。起始位的下降沿每帧把漂移清零，所以只有「一帧内的累积」才算数。">

<svg viewBox="0 0 700 230" role="img" aria-label="采样点漂移示意：零误差时采样点在位中间，有误差时逐渐滑向位边界">
<defs>
  <marker id="ua-d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <line x1="60" y1="70" x2="660" y2="70" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="56" y="74" text-anchor="end" fill="var(--vp-c-text-3)">零误差</text>
  <g stroke="var(--vp-c-brand-1)" stroke-width="1.8">
    <line x1="100" y1="58" x2="100" y2="82" />
    <line x1="140" y1="58" x2="140" y2="82" />
    <line x1="180" y1="58" x2="180" y2="82" />
    <line x1="220" y1="58" x2="220" y2="82" />
    <line x1="260" y1="58" x2="260" y2="82" />
    <line x1="300" y1="58" x2="300" y2="82" />
  </g>
  <text x="200" y="44" text-anchor="middle" fill="var(--vp-c-text-3)">每个采样点都落在位中间 ✓</text>
  <line x1="60" y1="170" x2="660" y2="170" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="56" y="174" text-anchor="end" fill="var(--vp-c-text-3)">有误差</text>
  <g stroke="var(--vp-c-brand-1)" stroke-width="1.8">
    <line x1="100" y1="158" x2="100" y2="182" />
    <line x1="142" y1="158" x2="142" y2="182" />
    <line x1="186" y1="158" x2="186" y2="182" />
    <line x1="232" y1="158" x2="232" y2="182" />
    <line x1="280" y1="158" x2="280" y2="182" />
    <line x1="330" y1="158" x2="330" y2="182" />
  </g>
  <g stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 3">
    <line x1="140" y1="150" x2="140" y2="190" />
    <line x1="180" y1="150" x2="180" y2="190" />
    <line x1="220" y1="150" x2="220" y2="190" />
    <line x1="260" y1="150" x2="260" y2="190" />
    <line x1="300" y1="150" x2="300" y2="190" />
  </g>
  <text x="215" y="214" text-anchor="middle" fill="var(--vp-c-text-3)">每采一位就向右漂一点，漂过虚线（位边界）就读错 → 这就是偶发乱码的来源</text>
  <text x="345" y="120" fill="var(--vp-c-text-2)">↓ 每帧起始位下降沿把累积清零，只算一帧内的漂移</text>
</g>
</svg>

</FigBox>

真正出事的时候，误差已经接近或超过 ±2%~3% 了。比如用了不标准的晶振频率，或者波特率取到接近分频极限的值，采样点会滑到位的边界，表现是偶发乱码，而且常常是温度变化时才偶发，极难排查。

一位怎么发、一帧怎么对齐、误差多大安全，到这里都清楚了。剩下的是天天要做的决定：收到的字节怎么交给程序。

## 三、三种接收方式

轮询、中断、DMA，差别全在 CPU 的代价上，把它算成数字就好选了。

| 方式 | 怎么用 | CPU 开销 | 适合 |
| --- | --- | --- | --- |
| 轮询 | `HAL_UART_Receive(&huart1, buf, n, timeout)` | 阻塞等待，期间 CPU 干不了别的 | 调试、初始化阶段的简单交互 |
| 中断 | `HAL_UART_Receive_IT()`，每收到 1 字节进一次中断 | 每字节一次中断 | 低速、数据量小 |
| DMA | `HAL_UART_Receive_DMA()`，DMA 自动搬运，收满或空闲才中断 | 几乎为零 | 大数据量、高波特率（推荐） |

```c
// 轮询（会阻塞）
HAL_UART_Receive(&huart1, buf, 10, 100);

// 中断（非阻塞，需重写回调）
HAL_UART_Receive_IT(&huart1, &rx_byte, 1);
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
  ringbuf_put(&rx_buf, rx_byte);
  HAL_UART_Receive_IT(huart, &rx_byte, 1);   // 重新开启下一次接收！
}

// DMA + 空闲中断（推荐：不定长帧）
HAL_UARTEx_ReceiveToIdle_DMA(&huart1, rx_buf, sizeof(rx_buf));
void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t size) {
  // size 就是本次收到的帧长度
}
```

::: tip 例 3 · 中断方式 vs DMA 方式的 CPU 开销
**题目**：假设每次中断（进出加处理）约消耗 2 µs。115200 与 921600 两种波特率下，中断方式各吃掉多少 CPU？换 DMA 能省到多少？

先估个量级：把「每秒进多少次中断」乘出来，再除以 1 秒，得到 CPU 被打断的时间占比。占比超过 10%，主循环就会明显变卡。

步骤：

1. 115200、每字节一次中断：每秒 $115200/10 = 11520$ 次中断，
$$11520 \times 2\ \mu\text{s} = 23\ \text{ms} \Rightarrow \text{CPU 占用约 } 2.3\%$$
2. 921600 时：每秒 92160 次中断 → $92160 \times 2\ \mu\text{s} = 184$ ms，CPU 占用 18.4%。
3. 改用 DMA：收满 1024 字节才中断一次，115200 下每秒约 $11520/1024 \approx 11$ 次，CPU 占用降到千分之一量级。

回代验算：$11520 \times 2\ \mu\text{s} = 23040\ \mu\text{s} = 23$ ms，$23/1000 = 2.3\%$ ✓，与上式一致。

低波特率、少量数据时中断够用；高波特率或大数据量必须用 DMA，否则 CPU 会被中断淹没，主循环几乎跑不动。
:::

> 中断方式有个坑：`HAL_UART_Receive_IT` 只接收指定长度，收完就停。所以回调里必须重新调用一次才能继续接收，否则你永远只能收到第一字节。

高速长时间收数据时，还会遇到一个新问题：缓冲区迟早会被写满。硬件流控用两根额外的线解决它，RTS（Request To Send，请求发送）和 CTS（Clear To Send，允许发送）。接收方缓冲区快满时把自己的 RTS 拉高，对方的 CTS 跟着变高就暂停发送。麻烦在于很多 USB 转串口模块只引出 TX、RX、GND 三根线，流控根本接不出来，这时只能降波特率或者把缓冲加大。

三种方式最后都会把字节送进某个缓冲区。缓冲区怎么设计、一帧到哪里算结束，往后看。

## 四、环形缓冲与不定长帧

串口数据是流式的，一帧可能分几次到达。标准做法是 ISR（Interrupt Service Routine，中断服务程序）或 DMA 只负责往环形缓冲里放数据，主循环负责解析。环形缓冲（ring buffer，一段首尾相接的数组，写指针追着读指针走，写满不覆盖未读数据）在这里的作用只有一个：主循环正忙的时候，数据不会丢。

<FigBox title="生产者—消费者：中断/DMA 只管放，主循环只管取" kind="结构" note="上半是数据通路，下半是时间关系。环形缓冲是两边的解耦层：只要缓冲没满，主循环再忙数据也不丢；缓冲大小按「主循环最长一次忙多久 × 数据速率」倒推。">

<svg viewBox="0 0 700 240" role="img" aria-label="环形缓冲数据通路：UART 中断或 DMA 写入环形缓冲，主循环取出解析">
<defs>
  <marker id="ua-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <rect x="30" y="30" width="150" height="60" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="105" y="56" text-anchor="middle">ISR / DMA</text>
  <text x="105" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">生产者：只写不解析</text>
  <rect x="270" y="30" width="160" height="60" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="350" y="56" text-anchor="middle">环形缓冲</text>
  <text x="350" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">写指针追读指针</text>
  <rect x="520" y="30" width="150" height="60" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="595" y="56" text-anchor="middle">主循环</text>
  <text x="595" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">消费者：找帧头、校验</text>
  <line x1="182" y1="60" x2="266" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ua-f)" />
  <line x1="432" y1="60" x2="516" y2="60" stroke="var(--vp-c-brand-1)" stroke-width="1.8" marker-end="url(#ua-f)" />
  <text x="350" y="126" text-anchor="middle" fill="var(--vp-c-text-3)">解耦后：主循环忙 50 ms，只要缓冲够大（50 ms × 11520 字节/s ≈ 576 字节）就不丢数据</text>
  <rect x="120" y="160" width="460" height="46" rx="8" fill="none" stroke="var(--vp-c-divider)" stroke-dasharray="5 4" />
  <text x="350" y="180" text-anchor="middle">数据到达是流式的：一帧可能分 3 次到达，缓冲把它攒起来</text>
  <text x="350" y="198" text-anchor="middle" fill="var(--vp-c-text-3)">帧结束的判据 → IDLE 空闲中断</text>
</g>
</svg>

</FigBox>

一帧到哪里结束，靠 IDLE 空闲中断来判断：线路上超过一个字节时间没有新数据，就认为一帧结束。HAL 的 `ReceiveToIdle` 系列就是干这个的，目前最实用。

字节流能安全进程序了，可字节本身还没有语义。哪些是帧头、哪些是数据、错了怎么办，得自己定义协议。

## 五、电平标准：TTL / RS232 / RS485

接对了线还是烧了板，多半是这一层没分清。UART 是协议，电平标准是另一回事。

| 标准 | 电平 | 距离 | 说明 |
| --- | --- | --- | --- |
| TTL 串口（Transistor-Transistor Logic，0 V 表示 0、电源电压表示 1 的数字电平） | 0 V = 0，3.3 V/5 V = 1 | < 1 m | MCU 引脚直接就是这个电平；接 USB 转串口模块时用这个 |
| RS232 | −3~−15 V = 1，+3~+15 V = 0（负逻辑且电压高） | ~15 m | 老式 DB9 串口；必须经 MAX232 等芯片转换，绝不能直接接 MCU |
| RS485 | 两线压差 ±(1.5~6) V（差分：两根线上电压的差值才是信号，共模干扰被抵消） | ~1200 m | 工业现场总线（Modbus 常用），抗干扰强，半双工 |

## 六、工程实例：设计一个简单可靠的帧协议

协议设计是这一章所有知识的合体。帧格式解决「一帧长什么样」，解析状态机解决「收到一半、收到错帧怎么办」，两个问题分开想，别在代码里混着解决。

::: tip 例 4 · 设计一个简单可靠的帧协议
**题目**：裸的字节流无法区分「帧边界」和「数据内容」。设计一个能长期跑在噪声环境里的帧格式，并算出它的开销。

第一步，定帧格式，最小可用版：

| 字段 | 长度 | 值 |
| --- | --- | --- |
| 帧头 | 2 字节 | `0xAA 0x55`（固定，用于定位帧起始） |
| 长度 | 1 字节 | 后续数据长度 N |
| 数据 | N 字节 | 有效载荷 |
| 校验 | 2 字节 | CRC16 |

<FigBox title="帧格式与解析状态机" kind="结构" note="上半是一帧在字节流里的样子：帧头用来在乱流里定位，长度字段告诉解析器还要等几个字节，CRC16 用来确认整帧没错。下半是解析状态机的五个状态：任何一步不合预期都退回「找帧头」重新同步，这是协议能长期跑在噪声环境里的关键。">

<svg viewBox="0 0 700 300" role="img" aria-label="帧协议的字段布局与五状态解析状态机">
<defs>
  <marker id="ua-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="30" y="30" font-weight="700">一帧的字段布局</text>
  <rect x="30" y="42" width="90" height="40" rx="4" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" />
  <text x="75" y="60" text-anchor="middle">帧头</text>
  <text x="75" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">0xAA 0x55</text>
  <rect x="120" y="42" width="70" height="40" rx="4" fill="none" stroke="var(--vp-c-brand-1)" />
  <text x="155" y="60" text-anchor="middle">长度</text>
  <text x="155" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">N</text>
  <rect x="190" y="42" width="240" height="40" rx="4" fill="none" stroke="var(--vp-c-brand-1)" />
  <text x="310" y="60" text-anchor="middle">数据 ×N</text>
  <text x="310" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">有效载荷</text>
  <rect x="430" y="42" width="90" height="40" rx="4" fill="none" stroke="var(--vp-c-brand-1)" />
  <text x="475" y="60" text-anchor="middle">CRC16</text>
  <text x="475" y="76" text-anchor="middle" fill="var(--vp-c-text-3)">2 字节校验</text>

  <text x="30" y="130" font-weight="700">解析状态机</text>
  <g>
    <rect x="30" y="146" width="110" height="42" rx="21" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="85" y="172" text-anchor="middle">① 找帧头</text>
    <rect x="180" y="146" width="110" height="42" rx="21" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="235" y="172" text-anchor="middle">② 收长度</text>
    <rect x="330" y="146" width="110" height="42" rx="21" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="385" y="172" text-anchor="middle">③ 收数据</text>
    <rect x="480" y="146" width="110" height="42" rx="21" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="535" y="172" text-anchor="middle">④ 收校验</text>
    <rect x="480" y="228" width="110" height="42" rx="21" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
    <text x="535" y="254" text-anchor="middle">⑤ 处理帧</text>
    <line x1="140" y1="167" x2="176" y2="167" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ua-p)" />
    <line x1="290" y1="167" x2="326" y2="167" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ua-p)" />
    <line x1="440" y1="167" x2="476" y2="167" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ua-p)" />
    <line x1="535" y1="188" x2="535" y2="224" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ua-p)" />
    <text x="548" y="210" fill="var(--vp-c-text-3)">校验通过</text>
    <path d="M 535 146 L 535 120 L 85 120 L 85 142" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#ua-p)" />
    <text x="300" y="112" text-anchor="middle" fill="var(--vp-c-text-3)">任何一步不合预期（错头 / 长度非法 / 校验失败）→ 退回 ① 重新同步</text>
  </g>
</g>
</svg>

</FigBox>

第二步，算开销，按 115200、10 位/帧：

| 数据长度 | 帧长 | 协议开销 | 传输耗时 |
| --- | --- | --- | --- |
| 8 字节 | 13 字节 | 38.5% | 1.13 ms |
| 32 字节 | 37 字节 | 13.5% | 3.21 ms |
| 128 字节 | 133 字节 | 3.8% | 11.55 ms |

回代验算：13 字节里 5 字节是固定开销，$5/13 = 38.5\%$ ✓；耗时按例 1 的帧时间外推，$13 \times 86.8\ \mu\text{s} = 1.13$ ms ✓。

帧头加长度加校验一共 5 字节固定开销，数据越短，协议开销占比越高。所以高频小数据（比如传感器采样值）应该打包成较长的帧批量发，而不是一字节一帧。

第三步，解析要点：

1. 用状态机（state machine，程序在任何时刻只处于有限几个状态之一，收到什么字节决定跳到哪个状态）解析，不要假设一次就能收完整帧；
2. 校验失败要能重新同步：丢弃当前帧，回到「找帧头」状态；
3. 数据里可能出现帧头字节（`0xAA 0x55`），这时要做转义（escaping，把特殊字节替换成约定序列，比如 `0xAA` 在数据中发成 `0xBB 0xAA`，接收方再还原），否则会误判帧边界。
4. 长度字段要设上限。收到一个 0xFF 就照着分配缓冲区，是嵌入式里最经典的踩踏来源，一个坏帧就能把栈冲掉。
:::

## 七、易错清单 + 自检

按踩坑频率从高到低排：

1. TX/RX 接反。TX 要接对方的 RX，交叉连接；接成 TX-TX 永远收不到。
2. 波特率不一致。双方必须一致，还要注意波特率里的「位」包含起始位和停止位的开销。
3. 电平标准混接。RS232 的 ±12 V 直接进 MCU 会烧片。
4. 忘了在中断回调里重新启动接收，`HAL_UART_Receive_IT` 只收一次。
5. 主循环里用轮询接收，导致系统卡顿。改用中断或 DMA。
6. 读波形时按书写顺序去读。UART 是 LSB 先发，波形顺序与书写顺序相反。
7. 没做帧同步，直接按「收到的第一字节是数据」解析。一旦丢一字节就永久错位。
8. `printf` 的浮点格式化打不出来，新工具链默认裁剪了 `%f` 支持。

自检：115200-8-N-1 下，一帧几位、有效速率多少字节/秒、传 1000 字节多久？USART2 在 36 MHz 下跑 115200 的误差是多少、是否安全？

（答案：10 位 / 11520 字节每秒 / 86.8 ms；−0.16%，一帧累积 0.016 位，远小于 0.5 位容限，安全）

## 八、点对点之外

UART 是「两个设备各说各话」的点对点链路。总线上要挂屏、挂 Flash、挂好几个传感器时，就需要有时钟线、能寻址的总线了。

<Prereq id="register-map" /> → [09 · SPI 与 I²C](./spi-i2c.md)
