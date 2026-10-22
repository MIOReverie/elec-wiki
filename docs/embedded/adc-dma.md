---
title: 10 · ADC 与 DMA
description: 把连续世界接进数字世界：SAR 采样原理、分辨率与 LSB、量化误差、采样时间与源阻抗、DMA 循环与双缓冲流水线、分压测电池与平均滤波，配四道带图例题与验算。
---

# 10 · ADC 与 DMA

<Meta time="45 min" level="核心" note="把连续世界接进数字世界；DMA 让数据搬运不再占用 CPU；最容易错的是源阻抗大却采样时间短、双缓冲处理错半区" />

**这一页要解决什么**：温度、电压、光强都是连续变化的模拟量，单片机只认识 0 和 1——中间那一步怎么跨？这一页讲 ADC（Analog-to-Digital Converter，模数转换器：把电压按比例变成整数数码的外设）怎么把电压变成数字码，以及为什么连续采样必须配 DMA（Direct Memory Access，直接存储器访问：一个独立于 CPU 的数据搬运工）。读完你应该能：算出 1 LSB 对应多少电压、判断采样时间够不够、为连续采样选对 DMA 模式，并算清一次分压测量的误差链。

::: tip 读这页之前
- **需要会**：欧姆定律与分压（<Prereq id="ohm" />、<Prereq id="voltage-divider" />，分压测电池的例 3 全程用它们）、时钟树（<Prereq id="clock-tree" />，ADCCLK 由 PCLK2 分频得到）、中断与轮询的差别（[06 章](./interrupt.md)）。
- **这一页用到的符号**：$V_{ref}$（参考电压，ADC 把它作为满量程基准来切分）、LSB（Least Significant Bit，最低有效位；这里指 ADC 能分辨的最小电压增量）、`0x`（十六进制前缀）。记号约定见[符号与约定 · 数字与嵌入式](../guide/notation.md)。
- **需要的数学**：乘除法、平方根 $\sqrt N$（平均滤波的降噪规律）。不用复数、不用微积分。
:::

先看一个实际场景。你要测一块 12 V 锂电池的电压，但 ADC 引脚最高只能承受 3.3 V——先用两个电阻把 12 V 分成四分之一，接进 ADC，读出来一个 0~4095 之间的整数。数字有了，可它准不准？会不会系统性偏低？能不能再提高一位精度？这三个问题的答案分别藏在**量化误差**、**采样时间与源阻抗**、**过采样平均**三个概念里，这一页就把它们一个一个拆开。

## 结论先行

1. **ADC 把模拟电压变成数字码**：$\text{code} = \dfrac{V_{in}}{V_{ref}} \times (2^n - 1)$，反算电压则除以同样比例。
2. **分辨率由位数和参考电压共同决定**：$\text{1 LSB} = V_{ref} / 2^n$（LSB：最低有效位，这里指 ADC 输出的最小一步所代表的电压）。12 位、3.3 V 参考 → **0.806 mV/LSB**。
3. **量化误差（quantization error：连续电压被切成台阶后，真实值与最近台阶之差）±0.5 LSB 是原理性固有的**，提高位数只能减小它，不能消除它。
4. **转换时间 = (采样周期 + 12.5) / ADCCLK**；采样时间（sample time：内部采样开关闭合、给采样电容充电的时间）要**匹配信号源阻抗**，源阻抗越大就要采越久，否则读数偏低。
5. **多通道/连续采样必须配 DMA**：让 DMA 自动把转换结果搬到内存，CPU 只在收满一批时才被打扰一次。

## 一、ADC 是怎么把电压变成数字的

这一节只讲一个原理：SAR 型 ADC 的「采样—保持—二分查找」三步，以及为什么精度卡在采样电容有没有充满。

STM32 里最常见的是 **SAR**（Successive Approximation Register，逐次逼近：用二分查找逐位确定数字码）型 ADC，工作过程分两步：

1. **采样**：内部开关闭合，给采样电容充电，让它跟上输入电压（这段时间叫**采样时间**）；
2. **保持 + 转换**：开关断开，电容上的电压被锁住，然后 SAR 用「二分查找」的方式逐位比较（12 位需要 12 次比较），得出数字码。

**关键洞察**：转换的精度取决于**采样电容有没有充到足够接近输入电压**。如果信号源阻抗很大（source impedance：信号源内阻，它和采样电容构成充电回路、决定充电快慢），充电慢，而采样时间又短，电容没充满就开始转换——**读数会偏低**，而且是系统性的偏差。

<FigBox title="源阻抗 × 采样时间：读数为什么偏低" kind="时序" note="上排：源阻抗小，采样开关一闭合电容迅速充到 V_in，采样结束时读数准确。下排：源阻抗大，RC 充电慢，采样窗口结束时电容只爬到 V_in 的一部分——转换就从这个偏低的值开始，于是每个读数都系统性偏低。加大采样时间，等于把充电窗口拉长，让电容来得及充满。">

<svg viewBox="0 0 700 300" role="img" aria-label="采样电容充电过程：源阻抗小时充满、源阻抗大时充不满导致读数偏低">
<defs>
  <marker id="ad-e" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <text x="20" y="24" font-weight="700">源阻抗小：来得及充满 ✓</text>
  <line x1="60" y1="80" x2="660" y2="80" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
  <text x="654" y="72" text-anchor="end" fill="var(--vp-c-text-3)">V_in</text>
  <path d="M 60 130 Q 90 80 120 80 L 320 80" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <line x1="300" y1="50" x2="300" y2="140" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="3 3" />
  <text x="60" y="152" fill="var(--vp-c-text-3)">开关闭合</text>
  <text x="286" y="44" text-anchor="end" fill="var(--vp-c-text-3)">采样窗口结束</text>
  <text x="360" y="120" fill="var(--vp-c-brand-1)">电容已到 V_in → 读数准</text>

  <text x="20" y="184" font-weight="700">源阻抗大：没充满就开始转换 ✗</text>
  <line x1="60" y1="240" x2="660" y2="240" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
  <text x="654" y="232" text-anchor="end" fill="var(--vp-c-text-3)">V_in</text>
  <path d="M 60 290 Q 130 262 210 252 Q 280 246 330 244" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.2" />
  <line x1="300" y1="210" x2="300" y2="300" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="3 3" />
  <text x="60" y="296" fill="var(--vp-c-text-3)">开关闭合</text>
  <circle cx="300" cy="244.5" r="3.5" fill="var(--vp-c-brand-1)" />
  <text x="292" y="210" text-anchor="end" fill="var(--vp-c-text-3)">采样窗口结束：只爬到 80%</text>
  <text x="360" y="270" fill="var(--vp-c-text-2)">转换从偏低值开始 → 读数系统性偏低</text>
</g>
</svg>

</FigBox>

这就是为什么「信号源阻抗大 → 要加大采样周期」：

$$R_{source}\ \text{大} \Rightarrow \text{采样周期要长} \Rightarrow \text{转换变慢} \Rightarrow \text{最高采样率下降}$$

**工程解法**：高阻抗信号（如用 100 kΩ 电阻分压出来的电压）要先经过**运放跟随器**（voltage follower：输出直接接反相输入端的运放接法，增益为 1，作用是把源阻抗从几十 kΩ 降到几 Ω）缓冲，再进 ADC。

单个转换的精度问题讲清了；接下来看这个转换出来的数字到底细到什么程度——分辨率与量化误差。

## 二、分辨率、LSB 与量化误差

这一节算三笔账：1 LSB 是多少伏、一个电压对应什么码、误差最坏多大。

<DemoBox title="ADC 量化演示：拖输入电压看数字码、量化台阶与 ±0.5 LSB 误差" hint="默认 12 位 / 3.3 V，把电压拖到 1.65 V 看码值 2048；再切 8 位看台阶变得多粗糙；打开「前端分压」体会信号调理对量程的影响。">
  <AdcQuantDemo />
</DemoBox>

::: tip 例 1 · 12 位、3.3 V 参考下的量化
先想什么：分清两个分母的用途——**转换用 4095、算 LSB 用 4096**，先把这条规矩立好再动笔。

**步骤**：

1. **一个 LSB 代表多少电压**：

$$\text{1 LSB} = \frac{V_{ref}}{2^{12}} = \frac{3.3}{4096} \approx 0.806\ \text{mV}$$

*（为什么用 4096：12 位能把量程等分成 $2^{12}$ 份，每份的大小才是台阶高度。）*

2. **输入 1.65 V 得到什么码**：

$$\text{code} = \frac{1.65}{3.3} \times 4095 = 2047.5 \approx 2048$$

*（为什么这里用 4095：满量程电压对应最大码 4095，不是 4096。）*

3. **反算回来**：

$$V = \frac{2048}{4095} \times 3.3 \approx 1.6504\ \text{V}$$

**验算**：与真实值差 $1.6504 - 1.65 = +0.4$ mV，而理论上限是 ±0.5 LSB = ±0.403 mV ✓，正好落在界内。

**要点**：分母到底是 4095 还是 4096？**转换时用 4095**（满量程对应最大码），**算 LSB 大小时用 4096**（把量程等分成 $2^n$ 份）。两者混用会带来约 0.024% 的差异，通常可忽略，但写高精度算法时要统一。
:::

量化台阶带来的 ±0.5 LSB 误差**永远去不掉**：输入电压是连续的，输出码是台阶状的，两者之间必有一段对不齐。三位 ADC 的台阶长这样：

<FigBox title="量化：连续电压被切成台阶，台阶差就是 ±0.5 LSB" kind="结构" note="蓝色阶梯是 ADC 的输出码对输入电压的响应：在 0~1.5 LSB 区间内输出都是码 1，无论输入是 0.6 LSB 还是 1.4 LSB。灰色的斜线是理想的无穷位 ADC。两者的最大偏差恰好出现在台阶中央，等于 ±0.5 LSB——这就是量化误差的来源，它只能靠加位数来缩小。">

<svg viewBox="0 0 700 280" role="img" aria-label="三位 ADC 的量化台阶与理想直线对比，量化误差最大为半 LSB">
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <line x1="70" y1="230" x2="660" y2="230" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <line x1="70" y1="30" x2="70" y2="230" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="66" y="244" text-anchor="end" fill="var(--vp-c-text-3)">0</text>
  <text x="654" y="246" text-anchor="end" fill="var(--vp-c-text-3)">V_in</text>
  <text x="64" y="26" text-anchor="end" fill="var(--vp-c-text-3)">输出码</text>
  <line x1="70" y1="230" x2="640" y2="44" stroke="var(--vp-c-text-3)" stroke-width="1.2" stroke-dasharray="5 4" />
  <text x="548" y="34" fill="var(--vp-c-text-3)">理想（无穷位）</text>
  <polyline fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.4"
    points="70,230 130,230 130,193 250,193 250,156 370,156 370,118 490,118 490,81 610,81 610,44 640,44" />
  <g fill="var(--vp-c-text-2)">
    <text x="78" y="222">码 0</text>
    <text x="198" y="185">码 1</text>
    <text x="318" y="148">码 2</text>
    <text x="438" y="110">码 3</text>
    <text x="558" y="73">码 4</text>
  </g>
  <rect x="130" y="205" width="120" height="20" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="0.8" />
  <text x="190" y="244" text-anchor="middle" fill="var(--vp-c-text-2)">0.5 LSB 误差区（台阶中央最大）</text>
  <text x="360" y="268" text-anchor="middle" fill="var(--vp-c-text-3)">输出只能落在台阶上：输入在台阶内怎么变，码都不动 → 最多差半个台阶 = ±0.5 LSB</text>
</g>
</svg>

</FigBox>

## 三、转换时间与采样率

这一节把「一转要多久」算成数字，并回答采样周期该怎么选。

::: tip 例 2 · 转换时间与采样率
F103 的 ADC 时钟由 PCLK2 分频得到，**上限 14 MHz**（取 72 MHz ÷ 6 = 12 MHz 比较稳妥）。先想什么：单次转换时间是「采样周期 + 固定的 12.5 周期」两部分之和——前者可调、后者固定，所以拉长采样时间必然牺牲采样率。

**步骤**：

1. 列公式：

$$T_{conv} = \frac{\text{采样周期} + 12.5}{f_{ADC}}$$

2. 代 $f_{ADC} = 12$ MHz 算出下表：

| 采样周期（可配） | $T_{conv}$ | 最高采样率 |
| --- | --- | --- |
| 1.5 | 1.17 µs | **857 kHz** |
| 7.5 | 1.67 µs | 600 kHz |
| 13.5 | 2.17 µs | 462 kHz |
| 28.5 | 3.42 µs | 293 kHz |
| 239.5 | 21.0 µs | 47.6 kHz |

3. **怎么选采样周期**：查数据手册的公式，由信号源阻抗决定。粗略规则：

- 源阻抗 < 1 kΩ → 1.5~7.5 周期足够；
- 源阻抗 10 kΩ 量级（如直接接电位器）→ 28.5 周期以上；
- 源阻抗 50 kΩ 以上（如高阻分压）→ **必须加运放跟随器**，靠加大采样时间救不回来（会拖慢到不可接受）。

**验算**：采样周期 1.5 时 $T_{conv} = (1.5+12.5)/12\,\text{MHz} = 14/12\,\mu\text{s} = 1.17\ \mu\text{s}$，其倒数 $1/1.17\ \mu\text{s} \approx 857$ kHz ✓（周期与速率互为倒数，两条路核对）。

**多通道时还要乘以通道数**：4 个通道轮流转换，每个 21 µs，一轮就要 84 µs——这是很多人「采样率上不去」的真正原因。
:::

转换时间算清了，还剩最后一个工程问题：转换结果源源不断地出来，谁来搬？答案就是 DMA。

## 四、为什么要配 DMA

这一节对比三种搬运方式的开销，并给出三种 DMA 模式的取舍。

DMA 搬运的边界、以及带 D-Cache 芯片上必须显式维护缓存的问题，见 <Prereq id="dma-cache" />。

不用 DMA 时，ADC 连续采样有两种做法：

| 方式 | 问题 |
| --- | --- |
| 轮询等待每次转换完成 | CPU 被完全占用，什么都干不了 |
| 每次转换完成进中断 | 若采样率 100 kHz，每秒 10 万次中断，CPU 被中断淹没 |

用 DMA 后：

```
ADC 转换完成 → 触发 DMA 请求 → DMA 自动搬运到数组 → 搬满 N 个才产生一次中断
```

CPU 只在「一批数据收满」时才被打扰一次，其余时间可以做算法、通信、进睡眠。

```c
uint16_t adc_buf[4];                     // 4 个通道的结果
HAL_ADC_Start_DMA(&hadc1, (uint32_t *)adc_buf, 4);   // 启动，之后自动循环搬运

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc) {
  // 4 个通道都采完了才进这里一次
  process(adc_buf);
}
```

**DMA 的常见模式**：

- **Normal**（普通）：搬完指定数量就停，需要重新启动；
- **Circular**（循环）：搬完自动回到开头继续，**连续采样必备**；
- **双缓冲**（Double Buffer：DMA 准备好两块内存 A 和 B，先把数据写进 A，A 满了自动切到 B 并通知你处理 A，写 B 的同时你处理 A）——实现「一边采一边处理」的流水线。

<FigBox title="双缓冲流水线：DMA 写一半，CPU 处理另一半" kind="时序" note="时间轴从左到右。DMA 先写缓冲区 A（左上），A 满后立即切到 B 继续写，同时发半满中断通知 CPU 处理 A；B 写满后切回 A，同时通知 CPU 处理 B。只要 CPU 处理一块的时间不超过 DMA 写另一块的时间，采集就永不间断——这就是「乒乓」流水线。">

<svg viewBox="0 0 700 250" role="img" aria-label="DMA 双缓冲时序：缓冲区 A 与 B 交替写入，CPU 交替处理">
<defs>
  <marker id="ad-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>
<g font-size="11.5" fill="var(--vp-c-text-1)">
  <rect x="50" y="40" width="140" height="40" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="120" y="65" text-anchor="middle">DMA 写 A</text>
  <rect x="190" y="40" width="140" height="40" rx="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" stroke-dasharray="4 3" />
  <text x="260" y="65" text-anchor="middle">DMA 写 B</text>
  <rect x="330" y="40" width="140" height="40" rx="6" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
  <text x="400" y="65" text-anchor="middle">DMA 写 A</text>
  <rect x="470" y="40" width="140" height="40" rx="6" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" stroke-dasharray="4 3" />
  <text x="540" y="65" text-anchor="middle">DMA 写 B</text>
  <rect x="190" y="120" width="140" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="260" y="145" text-anchor="middle">CPU 处理 A</text>
  <rect x="330" y="120" width="140" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="400" y="145" text-anchor="middle">CPU 处理 B</text>
  <rect x="470" y="120" width="140" height="40" rx="6" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.6" />
  <text x="540" y="145" text-anchor="middle">CPU 处理 A</text>
  <line x1="188" y1="86" x2="188" y2="116" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ad-p)" />
  <text x="188" y="106" text-anchor="end" fill="var(--vp-c-text-3)">A 满 → 切 B + 中断</text>
  <line x1="328" y1="86" x2="328" y2="116" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ad-p)" />
  <text x="322" y="106" text-anchor="end" fill="var(--vp-c-text-3)">B 满 → 切 A + 中断</text>
  <line x1="468" y1="86" x2="468" y2="116" stroke="var(--vp-c-brand-1)" stroke-width="1.6" marker-end="url(#ad-p)" />
  <text x="462" y="106" text-anchor="end" fill="var(--vp-c-text-3)">A 满 → 切 B + 中断</text>
  <line x1="50" y1="196" x2="650" y2="196" stroke="var(--vp-c-divider)" stroke-width="1.2" />
  <text x="350" y="216" text-anchor="middle" fill="var(--vp-c-text-3)">时间 →</text>
  <text x="350" y="238" text-anchor="middle" fill="var(--vp-c-text-3)">铁律：CPU 处理一块的耗时 ≤ DMA 写另一块的耗时，否则新数据会覆盖没处理完的旧数据</text>
</g>
</svg>

</FigBox>

## 五、提高 ADC 精度的工程手段

这一节把「读数不准」的原因按硬件、软件两条线列出对策，例 3 和例 4 把两处最常用的算清楚。

硬件上：

1. **干净的参考电压**：Vref 上的任何纹波都会直接进到读数里。高精度场合用外部基准（如 TL431、REF3033）而不是直接用 VDD；
2. **去耦与模拟/数字地分离**：ADC 的电源引脚要单独去耦；
3. **信号调理**：加 RC 低通滤掉高频噪声，加运放跟随降低源阻抗；
4. **避免引脚串扰**：ADC 引脚旁边不要走高频数字信号（尤其是 PWM）。

软件上：

5. **多次平均**：对同一信号连续采样 N 次取平均，随机噪声降低 $\sqrt{N}$ 倍；
6. **过采样**（oversampling：以远高于需要的速率采样再抽取平均；注意与 UART 那章的过采样同名不同物）：以 4 倍速率采样并平均，可多得 1 位有效分辨率（$4^N$ 倍过采样 → 提高 $N$ 位）；
7. **丢弃前几次采样**：切换通道后前 1~2 次结果往往不准（采样电容还残留上一个通道的电荷）；
8. **校准**：STM32 内置了 ADC 校准（`HAL_ADCEx_Calibration_Start`），上电后应执行一次。

::: tip 例 3 · 用分压测 12 V 电池电压
要测 0~13 V 的电池，但 ADC 量程只有 0~3.3 V，必须用电阻分压。先想什么：先选分压比（由最高被测电压决定），再核对耗电与源阻抗两个约束——三个要求互相牵制，不能只看第一个。

**步骤**：

1. **选阻值**：希望 12.6 V（3 串锂电满电）时仍在量程内，并留余量。取 **上臂 30 kΩ、下臂 10 kΩ**：

$$\text{分压比} = \frac{10}{30 + 10} = 0.25,\qquad \text{最大可测} = \frac{3.3}{0.25} = 13.2\ \text{V} \quad \checkmark$$

*（为什么留余量：电池充满可能到 13 V 以上，分压比算得太满会顶饱和。）*

2. **换算**（12 位、3.3 V 参考）：

| 电池电压 | ADC 引脚 | 数字码 | 反算电压 |
| --- | --- | --- | --- |
| 11.1 V | 2.775 V | 3444 | 11.10 V |
| 12.0 V | 3.000 V | **3723** | 12.00 V |
| 12.6 V | 3.150 V | 3909 | 12.60 V |

3. 代码里这样反算：

```c
float v_pin = adc_code / 4095.0f * 3.3f;   // 先还原成引脚电压
float v_bat = v_pin / 0.25f;               // 再除以分压比
```

**验算**：12.0 V × 0.25 = 3.000 V；$\text{code} = 3.0/3.3 \times 4095 = 3722.7 \approx 3723$ ✓；反算 $3723/4095 \times 3.3 / 0.25 = 12.00$ V ✓（正反两趟闭环）。

**分辨率**：引脚上 1 LSB = 0.806 mV，折算到电池端是

$$0.806\ \text{mV} \div 0.25 = 3.22\ \text{mV/LSB}$$

**两个容易忽略的点**：

1. **分压电阻一直在耗电**：12.6 V 时流过 $12.6/40\text{k} \approx 0.315$ mA。对电池供电设备，这个电流常年在流，**要选尽量大的阻值**（但太大又会让源阻抗过高、ADC 采不准——通常取几十 kΩ 到几百 kΩ 的折中，必要时加运放缓冲）。
2. **电阻精度决定测量精度**：普通 1% 电阻会让分压比偏差 1%，测出来就有 1% 的系统误差。要准就得用 **0.1% 精密电阻**，或者做单点校准（测一个已知电压，把实际分压比算出来存进 Flash）。
:::

::: tip 例 4 · 平均多少次才够
ADC 读数常带随机噪声（随机噪声：幅值与方向都无规律、只能统计描述的干扰；假设单次噪声标准差 σ = 1 LSB）。对同一信号连续采样 N 次取平均，噪声降低为：

$$\sigma_N = \frac{\sigma}{\sqrt{N}}$$

先想什么：平均只能压**随机**噪声，对系统性偏差（如源阻抗导致的偏低）完全无效——先分清噪声种类再谈平均。

**步骤**：

| 平均次数 N | 噪声 σ | 改善 |
| --- | --- | --- |
| 1 | 1.000 LSB | — |
| 4 | 0.500 LSB | 2 倍 |
| **16** | **0.250 LSB** | **4 倍** |
| 64 | 0.125 LSB | 8 倍 |

**验算**：$\sqrt{16} = 4$，$1/4 = 0.250$ LSB ✓；$\sqrt{64} = 8$，$1/8 = 0.125$ LSB ✓（规律自洽）。

**结论**：平均的收益是 **$\sqrt{N}$**，边际效益递减——从 16 次加到 64 次只多改善 2 倍，却要多花 4 倍时间。**16 次平均是性价比最高**的选择。

**顺便区分两个概念**：

- **平均（averaging）**：降低随机噪声，**不增加有效位数**（同一信号测多次）；
- **过采样（oversampling）**：以 $4^N$ 倍速率采样并抽取，**真正提高 N 位有效分辨率**——前提是信号里存在至少 1 LSB 的白噪声（若信号太干净，需要人为加一点抖动噪声，即 dither）。
:::

## 六、DMA 的其他典型用途

这一节把 DMA 的视角拉宽：ADC 之外的四个场景，规则相同——「成批搬运、攒够了再打扰 CPU」。

DMA 不只是给 ADC 用：

| 场景 | 用法 |
| --- | --- |
| **UART 接收** | `HAL_UARTEx_ReceiveToIdle_DMA`，收满或空闲才中断（见 [08 章](./uart.md)） |
| **SPI 收发** | 大批量读写 Flash / 刷屏时用 DMA，速度提升明显 |
| **内存到内存** | 快速搬数组，比 CPU 循环快 |
| **DAC 波形输出** | DMA 循环送数据，硬件自动产生任意波形 |

**DMA 的坑**：

- **缓存一致性**（M7 带 Cache 的芯片）：DMA 改了内存而 CPU 的 Cache 里还是旧值，需要手动失效/清理 Cache；
- **源/目的地址不能越界**，数组要足够大；
- **Circular 模式下要小心处理时机**：DMA 可能正在写数组的前半段，而你在处理后半段——这正是双缓冲模式要解决的问题。

## 七、工程实例

两个真实产品场景收尾：测温看非线性，电量监测看功耗。

**NTC 测温**（NTC：Negative Temperature Coefficient，负温度系数热敏电阻，温度越高阻值越低）：NTC 与一个固定电阻串联分压，用 ADC 测分压点，再按 NTC 的阻值—温度曲线（通常用 B 值公式或查表）换算成温度。要点是 **NTC 的阻值随温度非线性变化**，所以分压电阻应取 NTC 在目标温区中点的阻值，这样灵敏度最均匀。

**电池电量监测**：见例 3。工业做法还会**在分压电路里加一个 MOS 管开关**——只在采样瞬间导通，避免分压电阻常年耗电，这对纽扣电池供电的产品是必需的。

## 八、易错清单 + 自检

- [ ] **信号超过 Vref**：读数饱和在满量程，超出部分丢失（还可能损坏引脚）
- [ ] **信号源阻抗大却用了很短的采样时间**：读数系统性偏低
- [ ] **忘了开 ADC 时钟、忘了校准**
- [ ] **多通道切换后前几次读数不准**：丢弃最初 1~2 次采样
- [ ] **连续采样没用 DMA**：用轮询或每转换一次中断，CPU 被拖垮
- [ ] **Circular 模式忘了开**：搬完一次就停了
- [ ] **分压电阻精度不够 / 常年耗电没考虑**
- [ ] **参考电压纹波大**：直接反映为读数噪声

**自检**：12 位、3.3 V 参考时 1 LSB 是多少？信号源阻抗很大时该怎么办？连续采样 4 个通道、每个 21 µs，一轮要多久？（答案：0.806 mV；加大采样周期，或加运放跟随器降低阻抗；84 µs）

## 下一步

模拟量进来了、数据也搬好了，最后一步是把数据用起来——最直接的用法就是输出 PWM 去驱动真实世界的东西，那是定时器一章的主角。

<Prereq id="dma-cache" /> → [11 · 定时器与 PWM](./timer-pwm.md)
