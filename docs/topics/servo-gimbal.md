---
title: 项目三 · 双轴舵机云台
description: 用两路 50 Hz PWM 做一台能指向指定坐标的双轴舵机云台。脉宽怎么换算、为什么必须独立 5 V 供电还要共地、min/max/中位三个数字怎么校准、坐标怎么变成两个角度，以及抖起来按什么顺序查。
---

# 项目三 · 双轴舵机云台

<Meta time="70 min" level="核心" note="云台的难点不在代码，两个定时器通道就够；难点在「两根独立电源的地要连在一起」这一句话上" />

下午三点，云台装好了，代码跑通了，俯仰和水平都能动。你把手搭在舵机上，它开始细微地来回颤。打开调试器看，脉宽完全正确。

问题在两根舵机线的黑线。它们从面包板各接各的回地，而 MCU 的地是从另一块板引过来的。抖动 90% 来自这里，不在代码里。

前两个项目（[电源](./power-supply.md)、[电机驱动](./motor-drive.md)）都是造一台机器。云台更像调一台仪器：舵机内部已经有完整的位置闭环，你要负责的只有三件事：一个宽度准确的脉冲、一个扛得住堵转的电源、一个合理的地。三件事里任何一件做歪，症状都一样，抖。

先按症状对号：

| 表面症状 | 原因通常在 | 本页对应的小节 |
| --- | --- | --- |
| 云台细微地来回颤 | 供电与接地 | 第三节 · 电源与共地 |
| 两轴一起动就不同步 | 定时器频率不一致 | 第二节 · 两路 50 Hz PWM |
| 走到某个角度就顶死 | 机械限位与脉宽限位没取交集 | 第四节 · 校准三个数字 |

三个硬指标先摆出来：脉冲 50 Hz，脉宽 0.5–2.5 ms；两只 MG996R 各 2.5 A 堵转，合起来 5 A；0.1 mm² 的杜邦线走 2.5 A，就有 0.17 V 的压降。后面每一节处理的，基本都是这三个数字引出来的麻烦。

::: tip 读这页之前
定时器的 PSC/ARR/CCR 与 PWM（Pulse Width Modulation，脉宽调制）模式在[嵌入式 07](../embedded/timer-pwm.md)，舵机脉宽协议与内部结构在[嵌入式 13](../embedded/13-servo-control.md)，这两样会了就能往下走；时钟树 <Prereq id="clock-tree" /> 与寄存器映射 <Prereq id="register-map" /> 忘了可以回查。

用到的符号：$D$ 是占空比，高电平时间占周期的比例，50 Hz 配 1.5 ms 就是 7.5%；$f_{cnt}$ 是计数频率，定时器每秒计多少个数，1 µs 步进就是 1 MHz；ARR 是自动重装载值，决定周期；CCR 是捕获/比较寄存器，决定脉宽；纹波 $\Delta U$ 是电压在一个周期内上下摆动的峰峰值；死区是舵机内部的容差窗口，典型 5–10 µs，和电机页里上下管关断的那个空窗同名词、不同含义；$R=\rho l/A$ 是导线电阻，$\rho$ 是铜的电阻率。约定见[符号与约定](../guide/notation.md)。

三角函数只用 $\operatorname{atan2}$（二参数反正切，一次连象限一起给出，不用先判断象限）加 $\sqrt{\ }$ 和 $\pi$，例题里都附 node 验算。
:::

舵机的原理、内部结构、PSC/ARR/CCR 换算与烧板原因，在[嵌入式 13 · 舵机控制](../embedded/13-servo-control.md)里写得极细，这里不重复。这页只做云台特有的三件事：两路 PWM 怎么共存、两轴坐标怎么映射成角度、已经抖了怎么排查。

## 一、机械结构：两轴的顺序

两个舵机谁在上、谁在下，这个顺序决定了载荷能不能被撑住。

拓扑有两种。水平轴在下、俯仰轴在上，叫 yaw-on-top（英文里 yaw 指绕竖直轴的水平转向）；反过来叫 pitch-on-top（pitch 指绕水平轴的俯仰）。

| 拓扑 | 水平轴 pan | 俯仰轴 tilt | 适合的场景 |
| --- | --- | --- | --- |
| yaw-on-top | 在下 | 在上 | 载荷较重、俯仰范围不大 |
| pitch-on-top | 在上 | 在下 | 载荷较轻、需要大俯仰范围 |

本页按标准结构走：

```
底座 ── ① 水平旋转舵机（pan，绕竖直轴）
          └── ② U 形支架（随 pan 一起转）
                └── ③ 俯仰舵机（tilt，绕水平轴）
                      └── ④ 载荷（摄像头 / 激光笔 / 传感器）
```

① 号舵机（pan）要扛整个上方结构的重量，② 号（tilt）只扛载荷本身。所以载荷重（> 500 g）就把扭矩大的那个放在下面；载荷轻但要求俯仰范围大，俯仰舵机可以在支架两侧做双出轴布置，受力对称。

### 1.1 扭矩要留多少余量

载荷 200 g、重心距俯仰轴 5 cm，静态扭矩：

$$
T = m g r = 0.2 \times 9.8 \times 0.05 = 0.098\ \text{N·m} \approx 1.0\ \text{kg·cm}
$$

SG90 标称 1.8 kg·cm（4.8 V），看起来够。可那是堵转扭矩，实际可用不到一半，瞬间加速还要额外力矩。

| 载荷 | 推荐舵机 | 理由 |
| --- | --- | --- |
| < 100 g（小摄像头、激光笔） | SG90 × 2 | 1.8 kg·cm 够用，轻 |
| 100–400 g（手机、小型传感器） | MG996R × 2 | 9.4 kg·cm，金属齿轮 |
| > 400 g | 数字舵机（20 kg·cm 以上） | 塑料齿轮会被瞬间力矩打滑 |

舵机能转的角度也不对称。pan 一般走满 180°，tilt 只用 −20° 到 +70°，90° 出头就够，所以 tilt 那只可以选小一号。

### 1.2 打印与装配上的四个坑

齿轮轴受力的方向不能垂直于输出轴。输出轴是轴承撑着的，径向受力没问题，轴向外推会把齿轮压坏，所以载荷重心要尽量落在轴线附近。

U 形支架的配合间隙留 0.2–0.4 mm。太松会晃，晃就是抖；太紧会卡，卡就是堵转发热。

舵机用自攻螺丝加减振垫固定，别只靠热熔胶。走线也要留余量：pan 转 180° 时，从底座到 tilt 的线要绕成螺旋，否则会被拉断。

## 二、两路 50 Hz PWM

### 2.1 参数只要一张表

两个通道共享一个定时器、同一个 ARR，脉宽由各自的 CCR 决定。以 1 µs 计数为例（下表是[嵌入式 13](../embedded/13-servo-control.md)那张表的展开，三个主频都列上）：

| 主频（APB1 定时器 ×2 后） | PSC | $f_{cnt}$ | ARR | 周期 | 脉宽步进 |
| --- | --- | --- | --- | --- | --- |
| 72 MHz（F103） | 71 | 1 MHz | 19999 | 20 ms | 1 µs = 0.1° |
| 84 MHz（F407 默认） | 83 | 1 MHz | 19999 | 20 ms | 1 µs = 0.1° |
| 168 MHz（F407 + HSE） | 167 | 1 MHz | 19999 | 20 ms | 1 µs = 0.1° |

验算：`72e6/(71+1) = 1e6`，`1e6/20000 = 50 Hz`；`84e6/84 = 1e6`；`168e6/168 = 1e6`。三行都是 50 Hz ✓。

频率是硬指标，脉宽是软指标。50 Hz 偏 17%，大多数舵机还能忍；脉宽算错 1 µs 就是 0.1°，算错 100 µs 就是 10°。这就是为什么代码里只写**绝对脉宽**，不写占空比百分比。

想要更细的步进，用 0.5 µs 计数：PSC = 35 / 41 / 167 的一半，ARR = 39999，此时 CCR 的范围是 1000–5000（对应 0.5–2.5 ms）。但舵机自己的死区就有 5–10 µs，再细的分辨率没有意义，0.5 µs 只对多轴同步有用。

### 2.2 引脚分配

以 STM32F103C8T6 为例，用 TIM3 的 CH1 与 CH2：

| 舵机 | 信号 | STM32 引脚 | 通道 |
| --- | --- | --- | --- |
| pan（水平） | PWM 1 | PA6 | TIM3_CH1 |
| tilt（俯仰） | PWM 2 | PA7 | TIM3_CH2 |
| 编码器/别的 | — | — | 注意 PA6/PA7 也被 TIM3 的编码器占用，不能同时用 |

PA6/PA7 与 TIM3 编码器的那点复用冲突，[嵌入式 13](../embedded/13-servo-control.md)里有寄存器级的说明，这里只提醒一句：别在同一个定时器上同时开编码器模式和 PWM 输出。

### 2.3 代码：两轴接口

```c
/* ============ 舵机 PWM：两轴共用 TIM3 ============ */
#define SERVO_PERIOD   19999        /* ARR */
#define P_MIN          500          /* 脉宽下限 0.5 ms（1 µs 计数） */
#define P_MAX          2500         /* 脉宽上限 2.5 ms */
#define P_MID          1500         /* 中位 1.5 ms */

/* 每度对应的 CCR：默认 10 µs/°（即 2000 µs 走 180°） */
static const int16_t s_ccr_per_deg[2] = { 10, 10 };
/* 校准后的限位：单位是 CCR，不是度 */
static int16_t s_lim_lo[2] = { 500, 500 };
static int16_t s_lim_hi[2] = { 2500, 2500 };

/* 把角度钳到机械允许的范围，再换 CCR */
static uint16_t angle_to_ccr(int axis, int16_t deg)
{
    int32_t ccr = P_MID + (int32_t)deg * s_ccr_per_deg[axis];
    if (ccr < s_lim_lo[axis]) ccr = s_lim_lo[axis];
    if (ccr > s_lim_hi[axis]) ccr = s_lim_hi[axis];
    return (uint16_t)ccr;
}

void Servo_Set(int axis, int16_t deg)
{
    if (axis == 0)
        __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, angle_to_ccr(0, deg));
    else
        __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_2, angle_to_ccr(1, deg));
}

/* 上电：先写中位再启输出，避免初始化瞬间输出 0 脉宽让摇臂撞到底 */
void Servo_Init(void)
{
    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, P_MID);
    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_2, P_MID);
    HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
    HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
}
```

::: tip 平滑：50 Hz 下每 20 ms 才能更新一次
舵机每个周期只认一次脉宽，所以你能做到的最大角速度由舵机本身决定。MG996R 在 6 V 下 0.17 s 转 60°，90° 要 `0.17×1.5 = 0.255 s`，也就是每秒约 353°，每 20 ms 约 7°。代码以 100 Hz 写 CCR，多写的那几次不会带来任何效果；一次跳 90°，舵机会全速冲过去，瞬间电流拉满，电源跌落，然后就是抖。正确做法是把大角度拆成每 20 ms 不超过 7° 的小步。
:::

## 三、电源：独立 5 V 与共地

### 3.1 电流账

| 舵机 | 空载 | 运行 | 堵转 |
| --- | --- | --- | --- |
| SG90（4.8–6 V） | 100–220 mA | 300–500 mA | 650 mA |
| MG996R（4.8–7.2 V） | 100 mA | 500–800 mA | 2.5 A |

两只 MG996R 同时堵转 = 5 A，比大多数 5 V 模块的额定电流高一个数量级。选电源时按「两路堵转之和 × 1.2」：

- 两只 SG90：$0.65\times2\times1.2 = 1.56\ \text{A}$ → 5 V / 2 A 模块
- 两只 MG996R：$2.5\times2\times1.2 = 6\ \text{A}$ → 5 V / 6 A 以上。这个价钱不建议，实际做法是「一个 5 V 5 A 工业模块」，外加一条纪律：两轴不同时到限位

真用起来，舵机很少同时堵转，5 V / 3 A 通常够。但你让两轴同时顶在极限位置，3 A 就不够了。

### 3.2 接线

```
5 V 独立电源（≥ 3 A） ─┬── 4700 µF 电解（靠近舵机）
                       ├── 0.1 µF 陶瓷（紧贴舵机电源脚）
                       ├── pan  舵机 VCC
                       ├── tilt 舵机 VCC
                       └── GND ──┬── pan GND
                                 ├── tilt GND
                                 └── STM32 GND（必须连！）

STM32 PA6 ── pan  舵机 信号（橙/黄线）
STM32 PA7 ── tilt 舵机 信号（橙/黄线）
```

为什么必须**共地**？舵机内部比较脉宽时，拿「高电平」和「它自己的 GND」比。接线上最容易漏的是第 4 根线：地。开发板的 LDO（Low Dropout Regulator，低压差线性稳压器）也扛不住 5 A 的堵转电流；不共地时，信号线会成为唯一的电流回路，几十毫安灌进 IO 就能烧 MCU。STM32 的地如果和舵机的地分开，两者之间可能有几百毫伏的电位差，脉宽判断跟着偏，表现是角度轻微不准、偶发乱跳、一开串口就抖。

<FigBox title="云台接线：两个电源、一条共地点" kind="接线" note="红线是舵机自己的 +5 V（独立电源，≥ 3 A），黑线是地；MCU 自己的 3.3/5 V 由 USB 或开发板供给，两者唯一的连接点就是这条地线。所有地必须汇聚到同一点；信号线 PA6/PA7 只送脉宽，不承载回流电流。两只电容都跨在 +5 V 与地之间，电解电容靠近舵机、陶瓷电容紧贴舵机电源脚。">

<svg viewBox="0 0 680 360" role="img" aria-label="云台接线图：5 V 独立电源经 4700 微法与 0.1 微法电容分给 pan 与 tilt 两只舵机的 VCC；MCU 的 PA6、PA7 分别送脉宽；电源地、两只舵机地、MCU 地全部汇到同一个公共接地点">
<defs>
  <marker id="sg-wire-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>

<g font-size="11.5" fill="var(--vp-c-text-1)" text-anchor="middle">
  <rect x="16" y="30" width="124" height="84" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-2)" stroke-width="1.8" />
  <text x="78" y="56" font-weight="600">5 V 独立电源</text>
  <text x="78" y="76" fill="var(--vp-c-text-3)">≥ 3 A</text>
  <text x="78" y="96" fill="var(--vp-c-text-3)">与 MCU 不同源</text>

  <rect x="240" y="60" width="140" height="90" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.6" />
  <text x="310" y="94" font-weight="600">pan 舵机</text>
  <text x="310" y="114" fill="var(--vp-c-text-3)">MG996R</text>

  <rect x="420" y="60" width="140" height="90" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)" stroke-width="1.6" />
  <text x="490" y="94" font-weight="600">tilt 舵机</text>
  <text x="490" y="114" fill="var(--vp-c-text-3)">MG996R</text>

  <rect x="16" y="180" width="124" height="110" rx="8" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
  <text x="78" y="204" font-weight="600">STM32</text>
  <text x="78" y="226" fill="var(--vp-c-text-3)">TIM3_CH1 → PA6</text>
  <text x="78" y="246" fill="var(--vp-c-text-3)">TIM3_CH2 → PA7</text>
  <text x="78" y="268" fill="var(--vp-c-text-3)">GND 与舵机共地</text>
</g>

<g font-size="9.5" fill="var(--vp-c-text-3)" text-anchor="end">
  <text x="268" y="52">VCC</text>
  <text x="232" y="100">SIG</text>
  <text x="268" y="168">GND</text>
  <text x="448" y="52">VCC</text>
  <text x="412" y="100">SIG</text>
  <text x="448" y="168">GND</text>
</g>

<!-- 两只滤波电容跨在 +5 V 与 GND 之间 -->
<g stroke="var(--vp-c-text-3)" stroke-width="2" fill="none">
  <line x1="588" y1="34" x2="588" y2="118" />
  <line x1="588" y1="131" x2="588" y2="300" />
  <line x1="640" y1="34" x2="640" y2="118" />
  <line x1="640" y1="126" x2="640" y2="300" />
</g>
<g stroke="var(--vp-c-brand-2)" fill="none" stroke-width="2.2">
  <line x1="570" y1="118" x2="606" y2="118" />
  <rect x="570" y="124" width="36" height="7" rx="2" fill="var(--vp-c-brand-2)" stroke="none" />
  <line x1="622" y1="118" x2="658" y2="118" />
  <line x1="622" y1="126" x2="658" y2="126" />
</g>
<text x="560" y="114" font-size="12" fill="var(--vp-c-brand-2)" text-anchor="end">+</text>
<text x="588" y="170" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">4700 µF</text>
<text x="640" y="196" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="middle">0.1 µF</text>

<!-- +5 V 母线：电源正极 → 两只舵机 VCC -->
<g stroke="var(--vp-c-danger-1)" stroke-width="2.4" fill="none">
  <path d="M 140 52 L 176 52 L 176 34 L 640 34" />
  <line x1="280" y1="34" x2="280" y2="60" />
  <line x1="460" y1="34" x2="460" y2="60" />
</g>

<!-- GND：电源地、两只舵机地、MCU 地，汇到同一条底线 -->
<g stroke="var(--vp-c-text-2)" stroke-width="2.4" fill="none">
  <path d="M 140 88 L 158 88 L 158 300 L 640 300" />
  <path d="M 140 272 L 170 272 L 170 300" />
  <line x1="280" y1="150" x2="280" y2="300" />
  <line x1="460" y1="150" x2="460" y2="300" />
</g>

<!-- 信号线：MCU → 舵机，只送脉宽 -->
<g stroke="var(--vp-c-brand-1)" stroke-width="2" fill="none">
  <path d="M 140 206 L 200 206 L 200 105 L 236 105" marker-end="url(#sg-wire-arrow)" />
  <path d="M 140 236 L 268 236 A 12 12 0 0 0 292 236 L 400 236 L 400 105 L 416 105" marker-end="url(#sg-wire-arrow)" />
</g>

<g fill="var(--vp-c-danger-1)">
  <circle cx="280" cy="34" r="4" />
  <circle cx="460" cy="34" r="4" />
  <circle cx="588" cy="34" r="4" />
</g>
<g fill="var(--vp-c-text-2)">
  <circle cx="170" cy="300" r="4.5" />
  <circle cx="280" cy="300" r="4" />
  <circle cx="460" cy="300" r="4" />
  <circle cx="588" cy="300" r="4" />
</g>

<text x="330" y="24" font-size="10.5" fill="var(--vp-c-danger-1)" text-anchor="middle">红线：+5 V（两路舵机电流都从这里出）</text>
<text x="60" y="326" font-size="10.5" fill="var(--vp-c-text-2)">公共接地点：所有 GND 只在这里汇一次</text>
<text x="470" y="326" font-size="10.5" fill="var(--vp-c-text-2)" text-anchor="middle">黑线：GND</text>
</svg>

</FigBox>

信号线要不要串电阻？在 PA6/PA7 各串一只 100 Ω，能挡住地线环路上的浪涌把 MCU 打复位，代价是脉宽前沿略钝（100 Ω × 3 nF 的输入电容约 0.3 µs，对着 1500 µs 的脉宽可以忽略）。这是排查抖动时最便宜的一次尝试。

### 3.3 线材：被低估的 0.17 V

杜邦线的导体截面积只有 0.1 mm² 左右。铜的电阻率 $1.7\times10^{-8}\ \Omega\cdot\text{m}$，20 cm 往返（0.4 m）的电阻：

$$
R = \frac{\rho \, l}{A} = \frac{1.7\times10^{-8}\times0.4}{0.1\times10^{-6}} = 0.068\ \Omega
$$

2.5 A 堵转时的压降：

$$
\Delta U = I R = 2.5 \times 0.068 = 0.17\ \text{V}
$$

0.17 V 听着不多。可这只舵机的最低工作电压是 4.8 V，从 5.0 V 掉到 4.83 V 就已经越线，只要再叠加一点电源线损与电池内阻，就跌破了。换成 0.5 mm² 的线，同一长度只有 0.034 V。

| 线材 | 20 cm 往返电阻 | 2.5 A 压降 |
| --- | --- | --- |
| 0.1 mm² 杜邦 | 0.068 Ω | 0.17 V |
| 0.26 mm² | 0.026 Ω | 0.065 V |
| 0.5 mm² | 0.014 Ω | 0.034 V |

所以舵机的电源线不要用杜邦线。用 0.5 mm² 的硅胶线，焊到电源模块上，长度越短越好。

### 3.4 电容能顶多久

4700 µF 在 2.5 A 的冲击下，从 5.0 V 放到 4.2 V（0.8 V 余量）能撑：

$$
t = \frac{C\,\Delta U}{I} = \frac{4700\times10^{-6}\times0.8}{2.5} = 1.5\ \text{ms}
$$

1.5 ms 只够覆盖 PWM 周期内的电流尖峰，远不够应对启动时那 100 ms 级的冲击。电容补的是细节，担大梁的永远是电源。而且一根都不够：3 节 0.1 mm² 的线串起来，压降再乘 3，5 V 掉到 4.8 V 以下只是时间问题。换粗线、加 4700 µF、换大电源，比改任何一行代码都有用。

<FigBox title="舵机启动电流冲击与电源跌落" kind="波形" note="上：舵机从静止启动到 45° 的电流包络（峰值可达堵转电流的 60%–80%）。下：5 V 模块输出端的电压。若模块额定电流小于冲击电流，电压会掉进舵机的最低工作电压区（虚线），舵机内部 MCU 复位，表现为「抖一下再重新定位」。">

<svg viewBox="0 0 660 250" role="img" aria-label="舵机启动电流冲击波形与 5 V 输出跌落曲线：上图为电流包络，峰值约 2 A，下图为电压从 5.0 V 跌到 4.85 V，仍在 4.8 V 最低工作电压之上">
<g stroke="var(--vp-c-divider)" stroke-width="1">
  <line x1="70" y1="110" x2="600" y2="110" />
  <line x1="70" y1="110" x2="70" y2="44" />
  <line x1="70" y1="210" x2="600" y2="210" />
  <line x1="70" y1="150" x2="600" y2="150" />
</g>

<g font-size="10.5" fill="var(--vp-c-text-3)">
  <text x="34" y="72" text-anchor="end">i / A</text>
  <text x="34" y="166" text-anchor="end">u / V</text>
  <text x="64" y="48" text-anchor="end">3</text>
  <text x="64" y="114" text-anchor="end">0</text>
  <text x="64" y="154" text-anchor="end">5.0</text>
  <text x="64" y="199" text-anchor="end">4.8</text>
</g>

<path d="M 70 104 L 120 104 Q 160 62 210 60 L 250 68 L 320 82 L 400 94 L 470 100 L 600 104"
      stroke="var(--vp-c-brand-1)" stroke-width="2.4" fill="none" />
<path d="M 70 150 L 120 150 Q 160 170 210 170 L 250 166 L 320 161 L 400 156 L 470 152 L 600 150"
      stroke="var(--vp-c-brand-2)" stroke-width="2.4" fill="none" />

<line x1="70" y1="176" x2="600" y2="176" stroke="var(--vp-c-danger-1)" stroke-width="1.4" stroke-dasharray="5 3" />

<g font-size="10.5" fill="var(--vp-c-text-2)">
  <text x="252" y="46">冲击电流峰值约 2 A（堵转的 80%）</text>
  <text x="252" y="142">电压最低跌到 4.85 V：还在 4.8 V 之上，勉强</text>
</g>
<text x="104" y="196" font-size="10" fill="var(--vp-c-danger-1)">虚线：4.8 V 最低工作电压，跌穿它舵机内部就复位</text>
<text x="600" y="226" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="end">t / ms</text>
</svg>

</FigBox>

## 四、校准：三个数字

同一批舵机，1.5 ms 的中位各不相同。规格书上写「0.5–2.5 ms 对应 0–180°」，可每一只的实际对应关系都不一样：有的中位在 1.48 ms，有的在 1.52 ms；有的打死在 2.35 ms，有的在 2.6 ms。齿轮比差一点、电位器装配偏一点，都会改。

### 4.1 校准的是什么

校准就是为每一只舵机单独求出三个数字：

| 参数 | 含义 | 怎么得到 |
| --- | --- | --- |
| `p_min` | 能转到的最小脉宽 | 从 1500 开始每次减 25 µs，直到听见「嗡嗡」的电流声（顶墙）为止，退回去两档 |
| `p_max` | 能转到的最大脉宽 | 同理往上加 |
| `p_mid` | 中位 | 舵机规格书给的中位 ±100 µs 范围内，取机械对称点 |

顺序很重要：先用小幅度、慢速度试探，不要一上来就给 500 或 2500。顶墙堵转 2 秒，齿轮就可能磨坏。

用的还是 2.3 那个串口，USB 转串口接 STM32 的 USART1，输入脉宽、回车，舵机就跟着走。

### 4.2 校准代码

```c
/* 交互式校准：串口输入脉宽（µs），回车发送 */
void Servo_CalibrateStep(void)
{
    static int16_t pw = 1500;
    char buf[8];
    if (uart_readline(buf, sizeof buf)) {
        int v = atoi(buf);
        if (v == 0) {                       /* 输入 0 = 回中位 */
            pw = 1500;
        } else if (v >= 400 && v <= 2600) { /* 只允许安全窗口 */
            pw = v;
        }
        __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, pw);
        printf("pw=%d us\n", pw);
    }
}
```

### 4.3 校准后的限位与死区

把三个数字写进固件，并且只允许在 `[p_min, p_max]` 内输出：

```c
#define PAN_P_MIN  520      /* 校准值示例 */
#define PAN_P_MAX  2380
#define PAN_P_MID  1480
#define TILT_P_MIN 600      /* tilt 机械范围只有 -20°~+70° */
#define TILT_P_MAX 2200
#define TILT_P_MID 1400
```

**死区**是舵机内部的一个容差窗口，典型 5–10 µs：目标与当前位置的差落在窗口以内时，电机干脆不动。5 µs 对应 0.5°，10 µs 对应 1°，这是舵机的静态精度极限。再怎么调也调不到 0.1° 的重复定位，认这一点能省掉很多怀疑自己的时间。

::: warning 机械限位要独立于脉宽限位
很多云台的支架本身有物理限位（比如 U 形支架挡住 tilt，转不过 −20°）。软件里的 `p_min`/`p_max` 必须比机械限位更保守，否则脉宽还没到舵机的极限、支架已经顶死了，这时候舵机还在加扭矩，电流飙升，齿轮打滑。取三者的交集：舵机限位 ∩ 支架限位 ∩ 载荷不碰底座。
:::

## 五、坐标到角度：两段 atan2

给定目标点 $(x, y, h)$，水平角 $\alpha=\operatorname{atan2}(x, y)$，俯仰角 $\beta=\operatorname{atan2}(h, \sqrt{x^2+y^2})$，两个角度再各按自己的量程线性映射成脉宽。

### 5.1 模型

设云台底座为原点，$x$ 向右、$y$ 向前、$h$ 向上，目标是 $(x, y, h)$。

水平角（pan）是目标在水平面上的方位角：

$$
\alpha = \operatorname{atan2}(x,\ y)
$$

俯仰角（tilt）是目标相对水平面的仰角，要先求水平距离：

$$
R = \sqrt{x^2 + y^2},\qquad \beta = \operatorname{atan2}(h,\ R)
$$

用 `atan2` 而不是 `atan(h/R)`，为的是同时处理四个象限，而且 `R = 0` 时不会除零（`atan2(h, 0)` 直接给 ±90°）。

<FigBox title="坐标到两个角度的几何关系" kind="几何" note="左：(x, y) 水平面的俯视图，方位角 α 是「向前（+y）」转到目标投影所扫过的角，α = atan2(x, y)。右：沿水平方向竖起来的剖面，底边就是水平距离 R = √(x²+y²)，竖边是高度 h，仰角 β 是视线与底边的夹角，β = atan2(h, R)。两张图合起来才是一个点：α 只看 x 与 y 的比值，β 只看 h 与 R 的比值。">

<svg viewBox="0 0 660 300" role="img" aria-label="云台坐标几何图：左图是水平面俯视，(x, y) 平面上方位角 alpha 从 y 轴量到目标投影；右图是竖直剖面，横边为水平距离 R、竖边为高度 h，仰角 beta 从 R 量到视线">
<defs>
  <marker id="sg-geo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
</defs>

<!-- (a) 水平面 -->
<text x="170" y="24" font-size="11.5" fill="var(--vp-c-text-1)" text-anchor="middle" font-weight="700">(a) 水平面俯视：方位角 α（pan）</text>
<g stroke="var(--vp-c-text-3)" stroke-width="1.4" fill="none">
  <line x1="90" y1="220" x2="290" y2="220" marker-end="url(#sg-geo-arrow)" />
  <line x1="90" y1="220" x2="90" y2="70" marker-end="url(#sg-geo-arrow)" />
</g>
<path d="M 90 220 L 210 110" stroke="var(--vp-c-brand-1)" stroke-width="2" stroke-dasharray="6 4" fill="none" />
<circle cx="210" cy="110" r="5" fill="var(--vp-c-brand-1)" />
<text x="216" y="104" font-size="11" fill="var(--vp-c-text-1)">P′(x, y)</text>
<path d="M 90 186 A 34 34 0 0 1 115 197" stroke="var(--vp-c-text-2)" stroke-width="1.6" fill="none" />
<text x="120" y="208" font-size="11" fill="var(--vp-c-text-2)">α = atan2(x, y)</text>
<g font-size="10.5" fill="var(--vp-c-text-3)">
  <text x="97" y="88">y（向前）</text>
  <text x="286" y="238" text-anchor="end">x（向右）</text>
  <text x="90" y="252" text-anchor="middle" font-size="10.5">O（云台底座）</text>
</g>

<!-- (b) 竖直剖面 -->
<text x="490" y="24" font-size="11.5" fill="var(--vp-c-text-1)" text-anchor="middle" font-weight="700">(b) 竖直剖面：仰角 β（tilt）</text>
<g stroke="var(--vp-c-text-3)" stroke-width="1.4" fill="none">
  <line x1="380" y1="220" x2="612" y2="220" marker-end="url(#sg-geo-arrow)" />
  <line x1="380" y1="220" x2="380" y2="70" marker-end="url(#sg-geo-arrow)" />
</g>
<path d="M 380 220 L 540 110" stroke="var(--vp-c-brand-1)" stroke-width="2" fill="none" />
<line x1="540" y1="110" x2="540" y2="220" stroke="var(--vp-c-text-2)" stroke-width="1.6" stroke-dasharray="6 4" />
<circle cx="540" cy="110" r="5" fill="var(--vp-c-brand-1)" />
<text x="546" y="104" font-size="11" fill="var(--vp-c-text-1)">P(x, y, h)</text>
<path d="M 420 220 A 40 40 0 0 1 413 197.4" stroke="var(--vp-c-text-2)" stroke-width="1.6" fill="none" />
<text x="430" y="200" font-size="11" fill="var(--vp-c-text-2)">β = atan2(h, R)</text>
<g font-size="10.5" fill="var(--vp-c-text-3)">
  <text x="452" y="238" text-anchor="middle">R = √(x² + y²)</text>
  <text x="548" y="172">h（向上）</text>
  <text x="380" y="252" text-anchor="middle">O（云台底座）</text>
</g>

<text x="40" y="282" font-size="10.5" fill="var(--vp-c-text-3)">α 只看 x 与 y 的比值，β 只看 h 与 R 的比值；R 与这两个角一起把目标点唯一确定</text>
</svg>

</FigBox>

### 5.2 算例

::: tip 例 1 · 把目标点换算成两轴脉宽 {#ex-gimbal-1}
目标位于 $x = 1.5\ \text{m}$、$y = 2.0\ \text{m}$、$h = 0.4\ \text{m}$。pan 舵机的量程是 $\pm90°$（脉宽 600–2400 µs），tilt 舵机的机械限位是 $-20°$ 到 $+70°$（脉宽 1300–2200 µs）。求两轴的角度与 CCR。

先猜一下量级：水平方位落在第一象限靠 x 轴那一侧，应该比 45° 小；俯仰只有 0.4 m 高、水平 2 m 出头的距离，仰角应当是个位数到十来度。

第 1 步，水平角：

$$
\alpha = \operatorname{atan2}(1.5, 2.0) = 36.87°
$$

第 2 步，水平距离与俯仰角：

$$
R = \sqrt{1.5^2 + 2.0^2} = \sqrt{6.25} = 2.5\ \text{m}
$$

$$
\beta = \operatorname{atan2}(0.4, 2.5) = 9.09°
$$

第 3 步，角度换 CCR（10 µs/°，中位 1500）：

$$
CCR_{pan} = 1500 + 36.87 \times 10 = 1868.7 \Rightarrow \mathbf{1869}
$$

$$
CCR_{tilt} = 1500 + 9.09 \times 10 = 1590.9 \Rightarrow \mathbf{1591}
$$

第 4 步，检查限位：1869 在 600–2400 内 ✓；1591 在 1300–2200 内 ✓。两个都在安全区，可以直接下发。

| 轴 | 角度 | 脉宽 CCR | 允许范围 | 判定 |
| --- | --- | --- | --- | --- |
| pan | 36.87° | 1869 | 600–2400 | ✓ |
| tilt | 9.09° | 1591 | 1300–2200 | ✓ |

node 验算：`Math.atan2(1.5,2.0)*180/Math.PI = 36.870`，`Math.hypot(1.5,2)=2.5`，`Math.atan2(0.4,2.5)*180/Math.PI = 9.090`，`1500+36.87*10 = 1868.7`。

> 把「角度」和「脉宽」分开算，不塞进一个大公式里一步到位，是为了让第 4 步那个限位检查有个明确的位置。真实项目里，舵机损坏绝大多数发生在「角度算对了、忘了钳位」的那一刻。
:::

### 5.3 代码

```c
#include <math.h>

typedef struct { float x, y, h; } Point3;

/* 返回 0 成功，-1 表示目标在云台后方、不可达 */
int Gimbal_AimAt(Point3 target)
{
    float R  = sqrtf(target.x * target.x + target.y * target.y);
    float a  = atan2f(target.x, target.y) * 57.29578f;   /* 转成度 */
    float b  = atan2f(target.h, R) * 57.29578f;

    if (target.y < 0.0f) return -1;      /* 目标在云台背后，pan 无法指向 */

    /* 限位取「舵机量程 ∩ 机械限位」 */
    if (a < -90.0f) a = -90.0f;
    if (a >  90.0f) a =  90.0f;
    if (b < -20.0f) b = -20.0f;
    if (b >  70.0f) b =  70.0f;

    Servo_Set(0, (int16_t)lroundf(a));
    Servo_Set(1, (int16_t)lroundf(b));
    return 0;
}
```

::: danger 别用 int 做角度运算
`atan2f` 返回的是浮点数。`lroundf` 之后再转整型是对的；但如果把 float 直接赋给 `int16_t`，小数部分会被截断而不是四舍五入，于是 ±0.5° 的系统偏差就出现了。在 10 µs/° 的映射下，0.5° 就是 5 µs 的脉宽误差，刚好到死区边缘。
:::

## 六、抖动与电源跌落排查

### 6.1 抖动的四种来源

抖是最常见的故障，可它的成因分属四个完全不同的层次。按「先排除最简单、最可能」的顺序排：

| 层次 | 现象特征 | 排除方法 |
| --- | --- | --- |
| 电源 | 每次加速或到极限时抖，MCU 偶尔复位 | 示波器看 5 V 轨；换粗线、加大电容、加大电源 |
| 地 | 一开串口就抖，角度轻微偏 | 量 STM32 GND 与舵机 GND 之间的电压，应 < 10 mV |
| 信号 | 脉宽不准、频率不对 | 示波器看 PWM 引脚，测周期与高电平宽度 |
| 机械 | 静止时周期性微抖，载荷晃动 | 加固支架、减小间隙、减重 |

### 6.2 一个标准的排查顺序

1. 断电，量地。万用表直流毫伏档，红表笔 STM32 GND、黑表笔舵机 GND，读数应 ≤ 10 mV。读到 100 mV，说明两地不在同一个回路上。
2. 上电，空载测 PWM。示波器接 PA6，测周期 20 ms ± 0.5 ms、高电平 1.5 ms ± 0.1 ms。不对就回去改 PSC/ARR。
3. 带载测 5 V。示波器交流耦合看电源模块输出，舵机运动时跌落应 ≤ 0.2 V。超了就换电源或加电容。
4. 单轴测试。先只驱动 pan，再只驱动 tilt，看是哪一轴出问题。常常是某个特定角度堵转，比如 pan 快走到 +90° 那一侧。
5. 拆负载。把载荷取下再测。空载不抖、带载才抖，那是扭矩或机械问题，不在电上。

### 6.3 反直觉的一条：抖的不一定是舵机

舵机内部的控制板会在电压跌落时复位。复位后它重新上电、重新解码脉宽，于是先猛跳回中位再走向目标。你看到的抖，其实是「复位、重定位」的循环。所以排查抖动时，第一件事是看 5 V 轨有没有掉，不是去调 PID 或改代码。

<FigBox title="一个典型云台的电流—电压时序" kind="时序" note="斜坡加速到 45° 的整个过程中，舵机电流从 100 mA 升到 1.5 A。如果 5 V 模块只有 1 A 额定能力，电压会在第 2 个 PWM 周期开始塌陷；3 A 的模块则仅在峰值处轻微下凹。">

<svg viewBox="0 0 660 250" role="img" aria-label="舵机电流与 5 V 电压随时间的时序：电流从 100 毫安升到 1.5 安再回落，电压在峰值处轻微下凹但始终高于 4.8 V">
<g stroke="var(--vp-c-divider)" stroke-width="1">
  <line x1="70" y1="110" x2="600" y2="110" />
  <line x1="70" y1="110" x2="70" y2="50" />
  <line x1="70" y1="170" x2="600" y2="170" />
  <line x1="70" y1="214" x2="600" y2="214" />
</g>

<g font-size="10.5" fill="var(--vp-c-text-3)">
  <text x="34" y="72" text-anchor="end">i / A</text>
  <text x="34" y="184" text-anchor="end">u / V</text>
  <text x="64" y="54" text-anchor="end">2.0</text>
  <text x="64" y="114" text-anchor="end">0</text>
  <text x="64" y="174" text-anchor="end">5.0</text>
  <text x="64" y="199" text-anchor="end">4.8</text>
</g>

<path d="M 70 97 L 110 97 Q 200 70 260 65 Q 360 62 440 78 Q 520 92 600 94"
      stroke="var(--vp-c-brand-1)" stroke-width="2.4" fill="none" />
<path d="M 70 170 L 110 170 Q 200 182 260 184 Q 360 180 440 173 Q 520 170 600 170"
      stroke="var(--vp-c-brand-2)" stroke-width="2.4" fill="none" />

<line x1="70" y1="195" x2="600" y2="195" stroke="var(--vp-c-danger-1)" stroke-width="1.3" stroke-dasharray="5 3" />

<g font-size="10.5" fill="var(--vp-c-text-2)">
  <text x="176" y="44">加速段：电流接近堵转</text>
  <text x="420" y="138">稳态：电压回升</text>
</g>
<text x="104" y="212" font-size="10" fill="var(--vp-c-danger-1)">4.8 V 最低工作电压：本图全程在它之上</text>
<text x="600" y="236" font-size="10.5" fill="var(--vp-c-text-3)" text-anchor="end">t / ms</text>
</svg>

</FigBox>

## 七、BOM

| 序号 | 名称 | 规格 | 数量 | 参考单价（¥） | 备注 |
| --- | --- | --- | --- | --- | --- |
| 1 | STM32 开发板 | F103C8T6 最小系统 | 1 | 15 | 与项目二共用 |
| 2 | 舵机 | SG90 或 MG996R | 2 | 12 / 35 | 按载荷选（见 1.1） |
| 3 | 云台支架 | U 形支架 + 舵机盘组 | 1 | 15 | 3D 打印或铝合金 |
| 4 | 5 V 电源 | 5 V / 3 A 独立模块 | 1 | 20 | 必须是独立，不能用开发板 |
| 5 | 电解电容 | 4700 µF / 10 V | 1 | 3 | 靠近舵机 |
| 6 | 陶瓷电容 | 0.1 µF / 50 V | 2 | 0.2 | 每只舵机一个 |
| 7 | 硅胶线 | 0.5 mm²，红黑各 30 cm | 2 | 2 | 不用杜邦线 |
| 8 | 杜邦线 | 信号线用 | 2 | 0.5 | 信号线可以细 |
| 9 | 自攻螺丝 | M2 × 8 | 8 | 1 | 固定舵机 |
| 10 | 减振垫 | 橡胶垫片 3 mm | 4 | 1 | 减少机械抖动 |
| 11 | USB 转串口 | CH340 | 1 | 8 | 校准与调试用 |
| 12 | 示波器 | 任意 50 MHz 以上 | 1 | — | 测 PWM 与电压必需 |

合计约 ¥100（不含示波器）。第 7 项别省：那两米硅胶线是整个清单里性价比最高的东西。

## 八、接线与结构图

```
                  ┌──────────────────────┐
                  │   载荷（摄像头等）      │
                  └──────────┬───────────┘
                             │
                      ③ tilt 舵机 ──── PA7
                             │
                      ② U 形支架
                             │
                      ① pan 舵机 ───── PA6
                             │
                      底座（与 5 V 电源同点接地）

5 V ──┬── 4700 µF ──┬── pan VCC
      │  0.1 µF     └── tilt VCC
      └── GND ── 公共地星形汇聚点 ── STM32 GND
```

叠放顺序和走线一次定好，后面就不用返工。线的长度按「pan 转到 180° 的两个极限都不绷紧」来剪：电源走 2 根 0.5 mm² 硅胶线，信号走细的就行。

## 九、调试：四步

### 第 1 步：空载测 PWM

不装舵机，示波器接 PA6/PA7。判据是周期 20.0 ms ± 0.5 ms，`Servo_Set(0, 0)` 时高电平 1.5 ms ± 50 µs。周期读到 40 ms，说明 ARR 写成了 39999；10 ms 是 PSC 少一半；高电平宽度不随角度变，是两个通道连到了同一个 CCR。

### 第 2 步：单只舵机、中位

只接 pan 舵机，上电就是 1500。摇臂应停在几何中位（目测），而且不发热。一上电就撞向一端，是中位脉宽不对或舵机内部中位偏移，要校准；持续发热，说明顶在限位上堵转。

### 第 3 步：手动校准 min/max

按[第四节](#四、校准：三个数字)逐 25 µs 试探到极限。把 `p_min`/`p_max` 记下来写进固件，然后在极限位置静置 30 s，舵机外壳温度应 ≤ 45 °C。要是持续发热，就是机械限位比脉宽限位更紧，把范围缩小。

### 第 4 步：带载与坐标映射

装上载荷，调用 `Gimbal_AimAt`。指向误差应 ≤ 2°，拿激光笔照 3 m 外，偏差 ≤ 10 cm。方向反了，是 `x`/`y` 的符号或 `atan2` 的参数顺序错了；总偏一个固定角度，是中位没校准；误差随角度增大，是脉宽比例 `ccr_per_deg` 不对。

四步都过了，指向误差能压到 2° 以内。

## 十、故障排查表

| 现象 | 最可能原因 | 一分钟验证 | 处理 |
| --- | --- | --- | --- |
| 舵机不动，但信号有波形 | 电源没接 / 电源模块过流截止 | 测舵机 VCC | 换电源或降低负载 |
| 角度比预期偏 37.5° | 按占空比写的代码，周期不是 20 ms | 示波器测周期 | 改成绝对脉宽 |
| 抖动，偶尔猛跳回中位 | 5 V 跌落触发内部复位 | 示波器看 5 V 轨 | 加粗线、加大电容、换电源 |
| 一开串口就抖 | 未共地 / 信号地串扰 | 量两地间压差 | 单点接地，串口线远离舵机线 |
| 持续「嗡嗡」声且发热 | 顶在机械限位堵转 | 手动拨一下摇臂是否卡住 | 缩小限位、改支架 |
| 只有某个角度抖 | 该角度齿轮啮合间隙大 / 死区 | 换角度试 | 换舵机或调整负载重心 |
| 两个舵机互相影响 | 共用一根粗电流回路 / 电源跌落 | 单独供电试 | 分开供电，星形接地 |
| 舵机上电撞到底 | 初始化瞬间 CCR=0 | 看 `Servo_Init` | 先写中位再启动输出 |
| 角度不重复（来回差 2°） | 齿轮回差 / 电位器磨损 | 来回走同一目标点 | 数字舵机；或软件加回程补偿 |
| MCU 复位但 5 V 正常 | 地线环路 / 反灌 | 量 PA6 对 GND | 加 100 Ω 串联电阻（信号线） |
| 舵机烧毁 | 用开发板 5 V 供电 / 反接 | 查供电 | 独立供电，加反接保护 |
| 精度只有 1°，提不上去 | 舵机死区 5–10 µs | 手册查死区 | 换数字舵机 |

这张表按行往下走，抖动和不动的定位几分钟就能收窄。

## 十一、与嵌入式第 13 章的分工

这两页有意做了分工，读的时候别混：

| 内容 | 在哪一页 |
| --- | --- |
| 舵机内部结构、电位器反馈、H 桥 | [嵌入式 13](../embedded/13-servo-control.md) 第一节 |
| 脉宽 ↔ 角度线性关系、例题 | [嵌入式 13](../embedded/13-servo-control.md) 第二、五节 |
| PSC/ARR/CCR 换算与 HAL 代码 | [嵌入式 13](../embedded/13-servo-control.md) 第三节 |
| 电源电流账、烧板原因 | [嵌入式 13](../embedded/13-servo-control.md) 第四节 |
| 两轴共用定时器、云台结构、校准流程 | 本页 |
| 坐标到角度的映射、抖动排查顺序 | 本页 |

一句话记住分工：第十三章讲一个舵机怎么转准，本页讲两个舵机怎么一起转准。

## 十二、易错清单

- [ ] 用「占空比 7.5%」代替绝对脉宽，周期一变角度就偏
- [ ] 两轴用了两个定时器，频率不一致导致同步抖动
- [ ] 上电先 `PWM_Start` 而 CCR 还是 0，舵机先撞到底限一次
- [ ] 校准只做了 `p_min`/`p_max`，没检查机械限位
- [ ] 舵机电源用开发板 5 V 引脚
- [ ] 不共地，或只共信号线
- [ ] 电源线用杜邦线
- [ ] 角度用 `int` 截断而非四舍五入
- [ ] 大角度一步到底，瞬间电流拉满
- [ ] 把 `atan2` 的 `(y, x)` 写成 `(x, y)`，全程偏 90°

这十条都是「看起来对」的错法。代码能跑，角度是偏的。

## 十三、自检

做完以后，用这四个问题验收：

1. 把载荷装在 pan 轴最远端，pan 从 −90° 扫到 +90°，5 V 轨最低掉到多少伏？低于 4.8 V 说明电源不合格。
2. tilt 在 −20° 与 +70° 两个极限位置各停 30 s，舵机外壳温度是多少？超过 45 °C 说明限位没调对。
3. 给定一个坐标，实际指向与理论角度的偏差多少度？用激光笔量，误差要在 2° 以内。
4. 拔掉 tilt 舵机的电源，pan 还能正常工作吗？如果 pan 也乱了，说明两轴之间没有做成独立供电回路。

四个问题都答得上来，云台就能上台了。三个项目到这里全部完成，它们串起来的那套「独立电源 + 公共地 + 去耦 + 钳位」的纪律，比任何一行代码都值钱。

回到[专题总览](./index.md)，或者回看[项目一：可调实验电源](./power-supply.md)，给这三个项目造的那台电源做最后的纹波复测。好电源做出来的云台，连抖都不会抖。
