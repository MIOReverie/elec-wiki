---
title: 05 · GPIO 与按键
description: 八种工作模式怎么选、上拉下拉在电路里干什么活、推挽与开漏差在哪、按键抖动怎么消、输出速度调的是压摆率，还有单脚能给出多少电流。
---

# 05 · GPIO 与按键

<Meta time="40 min" level="核心" note="三个坑：开漏写 1 得不到高电平、输入引脚悬空、把输出速度当成频率上限" />

一块最小系统板，按键一端接 PA0、一端接地，程序里读 PA0。松开手时读数在 0 和 1 之间乱跳，手指一碰又变成 0。代码没错，是引脚内部既没上拉也没下拉，PA0 悬在半空，读到的就是周围空间的电场噪声。

另一个场景：有人把 LED 串电阻接到 VCC、另一端接 PA0，想让低电平点亮，于是把 PA0 配成开漏输出，以为写 1 就灭、写 0 就亮。结果写 1 时 LED 也亮着，万用表上量到的只有 0.4 V，不是 3.3 V。他缺的那一条是「开漏写 1 到底输出了什么」。

两个现象指向同一件事：引脚的模式并不控制通断，它选的是内部哪条通路接到引脚上。把内部电路画出来，这些问题就没有解释不清的了。

::: tip 读这页之前
会欧姆定律（<Prereq id="ohm" />）、会二进制位操作（`|=`、`&= ~` 的写法见 <Prereq id="register-map" />）、会串并联分压（<Prereq id="series-parallel" />），这页就读得动。中断和定时器的细节这里不展开，只在「用定时扫描做消抖」那一处用到定时器，看到链接跳过去就行。

用到的符号：$R_{pu}$（上拉电阻，pull-up）、$R_{pd}$（下拉电阻，pull-down）、$V_{CC}$（供电正极，F103 上是 3.3 V）、$I_{OH}$ / $I_{OL}$（输出高 / 输出低时引脚能给出的电流）、$t_r$（上升时间，电平从 10% 升到 90% 所用的时间）、$h_{FE}$（三极管电流放大系数，$I_C=h_{FE}I_B$）。全部约定见[符号与约定](../guide/notation.md)。

四个词先各给一句：上拉是用一个电阻把引脚默认拽到高电平；下拉相反，拽到低电平；推挽是内部上下各有一个开关管、高低都能主动驱动；开漏只有下面那个管子，写 1 等于撒手不管。
:::

::: tip 心智模型：一个引脚 = 一扇门 + 一根默认门位的弹簧
把引脚想成一扇可以开到 VCC 或 GND 的门。推挽是「门后有两个工人，一个负责推开、一个负责关上」，你说开就开、说关就关；开漏只留了「关」那个工人，你说开的时候他只是松手，门会不会开，取决于门外有没有人拉（外部上拉电阻）。

上拉和下拉则是门框上的一根弹簧：没人动的时候把门压向一侧。松手时门停在哪里，由弹簧决定；有人硬推时，弹簧的力气（$V_{CC}/R_{pu}$ 那点电流）远小于人，门就听人的。这条类比能解释后面几乎所有细节：为什么开漏必须配上拉、为什么上拉电阻不能太小也不能太大、为什么悬空输入读数是随机的。
:::

## 一、先把四个词定死：上拉、下拉、推挽、开漏

上拉（pull-up）：把一个电阻 $R_{pu}$ 从引脚接到 $V_{CC}$。引脚没有被外部器件驱动时，这点漏电流把引脚电位拉到接近 $V_{CC}$，读到的就是 1。一旦外部把它短到地，电流从电阻流进地，引脚变成 0，弹簧被硬按过去了。被按下去时流过电阻的电流只有

$$I=\frac{V_{CC}}{R_{pu}}$$

这点电流远小于任何器件能给出的驱动力，所以弹簧永远「按不过」外部电路。

下拉（pull-down）：同样的电阻接到 GND，默认电平变成 0。两者只差一个默认值，用途正好互补。

| 名称 | 电阻接到 | 空闲时读到 | 被人按到另一极时读到 |
| --- | --- | --- | --- |
| 上拉 | $V_{CC}$ | 1 | 0 |
| 下拉 | GND | 0 | 1 |

推挽（push-pull）：内部上管（P-MOS，接 $V_{CC}$）与下管（N-MOS，接 GND）串联，输出取自两个管子中间那一点。写 1 时上管导通、下管关断，引脚被主动推到高；写 0 时反过来。两个方向都有低阻抗的驱动通路。

开漏（open-drain）：只保留下面那只 N-MOS，上面那只不存在，于是「漏极开路」。写 0 时下管导通，引脚被强拉到地；写 1 时下管也关断，引脚进入高阻（high-Z，既不输出高也不输出低，等效于和外部断开），电平交给外部电路决定。

<FigBox title="推挽与开漏的内部电路：差别只在上管在不在" kind="电路" note="左：推挽的上、下管都由输出寄存器控制，高电平是「推上去」的。右：开漏没有上管，写 1 只是把下管关断，引脚靠外部上拉电阻 R_pu 才被拉到高电平。没有 R_pu，写 1 得到的是一个悬空引脚。" >

<svg viewBox="0 0 600 262" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="158" y="24" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">推挽输出（push-pull）</text>
  <text x="460" y="24" text-anchor="middle" font-size="12" stroke="none" fill="var(--vp-c-text-1)" class="sf-t sf-w700">开漏输出（open-drain）</text>

  <line x1="96" y1="50" x2="250" y2="50"/>
  <text x="96" y="42" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">VCC</text>
  <rect x="30" y="92" width="44" height="24" rx="3" class="sf-fill"/>
  <text x="52" y="107" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">输出控制</text>
  <line x1="74" y1="104" x2="96" y2="104"/>
  <line x1="96" y1="77" x2="96" y2="131"/>
  <line x1="96" y1="77" x2="120" y2="77"/>
  <line x1="96" y1="131" x2="120" y2="131"/>
  <rect x="120" y="64" width="52" height="26" rx="3" class="sf-fill"/>
  <text x="146" y="81" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">P-MOS 上管</text>
  <rect x="120" y="118" width="52" height="26" rx="3" class="sf-fill"/>
  <text x="146" y="135" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">N-MOS 下管</text>
  <line x1="146" y1="50" x2="146" y2="64"/>
  <line x1="146" y1="90" x2="146" y2="118"/>
  <line x1="146" y1="144" x2="146" y2="200"/>
  <line x1="96" y1="200" x2="250" y2="200"/>
  <text x="96" y="216" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">GND</text>
  <line x1="146" y1="105" x2="222" y2="105"/>
  <circle cx="222" cy="105" r="3.5" class="sf-dot"/>
  <text x="232" y="109" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PA0</text>
  <text x="158" y="240" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">高、低都由芯片主动驱动，外部无需元件</text>

  <line x1="400" y1="50" x2="560" y2="50"/>
  <text x="400" y="42" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">VCC</text>
  <rect x="330" y="92" width="44" height="24" rx="3" class="sf-fill"/>
  <text x="352" y="107" text-anchor="middle" font-size="9" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">输出控制</text>
  <line x1="374" y1="104" x2="400" y2="104"/>
  <line x1="400" y1="104" x2="400" y2="131"/>
  <line x1="400" y1="131" x2="424" y2="131"/>
  <rect x="424" y="64" width="52" height="26" rx="3" stroke-dasharray="4 3"/>
  <text x="450" y="81" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">无上管</text>
  <rect x="424" y="118" width="52" height="26" rx="3" class="sf-fill"/>
  <text x="450" y="135" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">N-MOS</text>
  <line x1="450" y1="118" x2="450" y2="105"/>
  <line x1="450" y1="144" x2="450" y2="200"/>
  <line x1="400" y1="200" x2="560" y2="200"/>
  <text x="400" y="216" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">GND</text>
  <line x1="470" y1="50" x2="470" y2="62"/>
  <rect x="461" y="62" width="18" height="24" rx="2" class="sf-fill"/>
  <line x1="470" y1="86" x2="470" y2="105"/>
  <text x="488" y="78" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_pu（外部）</text>
  <circle cx="470" cy="105" r="3" class="sf-dot"/>
  <line x1="470" y1="105" x2="540" y2="105"/>
  <circle cx="540" cy="105" r="3.5" class="sf-dot"/>
  <text x="548" y="109" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PA0</text>
  <text x="460" y="240" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">写 1 = 放开引脚，高电平只能靠 R_pu</text>
</svg>

</FigBox>

四种形态放在一张表里对比，差别就只剩「谁决定电平」这一列：

| 形态 | 写 1 时（输入行：外部给高） | 写 0 时（输入行：外部给低） | 谁决定引脚电平 |
| --- | --- | --- | --- |
| 推挽输出 | 上管导通，强推高 | 下管导通，强拉低 | 芯片 |
| 开漏输出 | 下管关断，引脚高阻 | 下管导通，强拉低 | 外部上拉电阻 |
| 上拉输入 | 悬空：内部 $R_{pu}$ 约 30~50 kΩ 接到 $V_{CC}$，读到 1 | 外部把它短到地，读到 0 | 外部电路 + 内部弹簧 |
| 下拉输入 | 外部把它接到 $V_{CC}$，读到 1 | 悬空：内部 $R_{pd}$ 接到 GND，读到 0 | 外部电路 + 内部弹簧 |

四个词到这里就够用了。可「模式」这个词在手册里是八个名字，它们并不是八个新东西。

## 二、八种模式：三个维度拼出来的

输入引脚读回来的永远只有 0 和 1，难的是让这两个数靠得住。引脚的模式也从来不是一个孤零零的选项，是三个维度拼出来的：方向和复用（输入 / 输出 / 复用 / 模拟）、输出级（推挽 / 开漏）、默认电平（无 / 上拉 / 下拉）。

STM32F1 用 `CRL`（管 Pin0~7）与 `CRH`（管 Pin8~15）里每根引脚 4 位来配置：2 位 `MODE`（方向）加 2 位 `CNF`（具体形态）。这两个字段一共给出八种组合，看起来要背八个名字，实际上只回答两个问题：

1. 它要不要驱动引脚？要就输出或复用；不要就输入；完全不接数字电路就模拟。
2. 不驱动时，默认电平由谁定？内部上拉、内部下拉，还是谁都不管（浮空）。

<FigBox title="八个模式名字，两个问题" kind="结构" note="上半支回答「要不要驱动」：输入不驱动，只负责读，所以它的差别在默认电平。下半支回答「怎么驱动」：推挽能主动给高给低，开漏只能拉低；再叠加「由 CPU 写还是由外设驱动」就得到复用模式。" >

<svg viewBox="0 0 560 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="280" y="18" text-anchor="middle" font-size="11.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">一个引脚要回答的两个问题</text>
  <line x1="280" y1="26" x2="280" y2="46"/>
  <line x1="130" y1="46" x2="430" y2="46"/>
  <line x1="130" y1="46" x2="130" y2="58"/>
  <line x1="430" y1="46" x2="430" y2="58"/>
  <rect x="70" y="58" width="120" height="26" rx="3" class="sf-fill"/>
  <text x="130" y="75" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">① 不驱动：输入</text>
  <rect x="370" y="58" width="120" height="26" rx="3" class="sf-fill"/>
  <text x="430" y="75" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">② 驱动：输出 / 复用</text>
  <line x1="130" y1="84" x2="130" y2="96"/>
  <line x1="48" y1="96" x2="258" y2="96"/>
  <line x1="48" y1="96" x2="48" y2="106"/>
  <line x1="118" y1="96" x2="118" y2="106"/>
  <line x1="188" y1="96" x2="188" y2="106"/>
  <line x1="258" y1="96" x2="258" y2="106"/>
  <rect x="18" y="106" width="60" height="26" rx="3" class="sf-fill"/>
  <text x="48" y="123" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">浮空</text>
  <rect x="88" y="106" width="60" height="26" rx="3" class="sf-fill"/>
  <text x="118" y="123" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">上拉</text>
  <rect x="158" y="106" width="60" height="26" rx="3" class="sf-fill"/>
  <text x="188" y="123" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">下拉</text>
  <rect x="228" y="106" width="60" height="26" rx="3" class="sf-fill"/>
  <text x="258" y="123" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">模拟</text>
  <line x1="430" y1="84" x2="430" y2="96"/>
  <line x1="396" y1="96" x2="466" y2="96"/>
  <line x1="396" y1="96" x2="396" y2="106"/>
  <line x1="466" y1="96" x2="466" y2="106"/>
  <rect x="366" y="106" width="60" height="34" rx="3" class="sf-fill"/>
  <text x="396" y="120" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">推挽</text>
  <text x="396" y="133" text-anchor="middle" font-size="8.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">普通 / 复用</text>
  <rect x="436" y="106" width="60" height="34" rx="3" class="sf-fill"/>
  <text x="466" y="120" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">开漏</text>
  <text x="466" y="133" text-anchor="middle" font-size="8.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">普通 / 复用</text>
  <text x="280" y="166" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">输入 4 种 + 推挽 2 种 + 开漏 2 种 = 8 种（F1 的 CNF + MODE 四位正好编完）</text>
  <text x="280" y="184" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">F4 把这四个位拆成 MODER / OTYPER / PUPDR 三个寄存器，按维度各自选</text>
</svg>

</FigBox>

展开成一张可查的表：

| 大类 | 模式 | 内部做了什么 | 典型用途 |
| --- | --- | --- | --- |
| 输入 | 浮空输入 | 不接上下拉，数字输入缓冲直连引脚 | 外部已有确定驱动的信号（如另一颗芯片的输出） |
| | 上拉输入 | 内部电阻拉到 $V_{CC}$，默认读到 1 | 按键（按下接地）、开漏总线的输入 |
| | 下拉输入 | 内部电阻拉到 GND，默认读到 0 | 高电平有效的按键 |
| | 模拟输入 | 断开数字输入缓冲，直连 ADC | ADC 采样、比较器输入 |
| 输出 | 推挽输出 | 上、下管都能主动驱动 | 驱动 LED、普通数字器件 |
| | 开漏输出 | 只能拉低，写 1 就是释放引脚 | I²C 总线、电平转换、线与 |
| 复用 | 复用推挽 | 由片上外设驱动（推挽级） | UART 的 TX、SPI 的 MOSI/SCK、定时器的 PWM |
| | 复用开漏 | 由片上外设驱动（开漏级） | I²C 的 SDA/SCL |

F4 及以后把这 4 位拆成几个独立寄存器，更好理解：`MODER`（输入 / 输出 / 复用 / 模拟）、`OTYPER`（推挽 / 开漏）、`OSPEEDR`（速度）、`PUPDR`（无 / 上拉 / 下拉）。方向和上下拉变成正交的两个维度，可以任意组合，组合出来的含义与上表一一对应。

输出那两种模式最容易踩坑，因为它们对「高电平」这件事的定义根本不同。

## 三、推挽与开漏：线与、电平转换，以及最常见的那个坑

先记住一条差别：

- 推挽写 1：上管导通，引脚被低阻通路接到 $V_{CC}$，谁也别想把它拉低（硬拉会过流）。
- 开漏写 1：下管关断，引脚进高阻，谁都可能把它拉低或拉高，电平由外部决定。

由此派生出开漏的三个正经用途。

1. 线与（wired-AND）：几个开漏引脚直接并在一起，共用一个上拉电阻。哪怕只有 1 个器件拉低，整条线就是低。这正好是「有任意一个设备要说话」的信号语义，也是 I²C 的物理基础。
2. 电平转换：3.3 V 的 MCU 用开漏输出，上拉电阻接到 5 V，就能安全地驱动 5 V 器件，因为引脚只会「拉低」和「放手」两种动作，永远不会把 5 V 灌进 3.3 V 的芯片。
3. 共享总线：多主多从的总线上，任何时刻只允许一个设备驱动，其余必须放手。

<FigBox title="线与：两个开漏引脚并在一根线上" kind="电路" note="A、B 都写 1（放手）时，上拉电阻把线拉到 5 V；只要有一个写 0，整条线就被拉低。这就是 I²C 的 SDA/SCL 为什么要配上拉，也解释了为什么总线上任意一个器件拉低就能让所有器件都看到低电平。" >

<svg viewBox="0 0 560 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="150" y1="40" x2="400" y2="40"/>
  <text x="150" y="32" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">+5 V</text>
  <line x1="250" y1="40" x2="250" y2="54"/>
  <rect x="241" y="54" width="18" height="26" rx="2" class="sf-fill"/>
  <line x1="250" y1="80" x2="250" y2="100"/>
  <text x="266" y="70" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_pu</text>
  <rect x="30" y="86" width="90" height="28" rx="3" class="sf-fill"/>
  <text x="75" y="104" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">开漏输出 A</text>
  <rect x="30" y="136" width="90" height="28" rx="3" class="sf-fill"/>
  <text x="75" y="154" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">开漏输出 B</text>
  <line x1="120" y1="100" x2="190" y2="100"/>
  <line x1="120" y1="150" x2="190" y2="150"/>
  <line x1="190" y1="100" x2="190" y2="150"/>
  <line x1="190" y1="100" x2="250" y2="100"/>
  <circle cx="250" cy="100" r="3" class="sf-dot"/>
  <line x1="250" y1="100" x2="300" y2="100"/>
  <rect x="300" y="86" width="100" height="28" rx="3" class="sf-fill"/>
  <text x="350" y="104" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">5 V 器件输入</text>
  <text x="280" y="180" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">任一引脚拉低 → 整条线为低；两个都放手 → 上拉把它拉到 5 V</text>
</svg>

</FigBox>

先用一个可交互的模型看一遍这四种接法，再进入计算：

<DemoBox title="GPIO 模式演示：选模式 + 外部接法，看引脚到底是什么电平" hint="必试四组：输入浮空+悬空（随机电平）→ 输入上拉+接地（读到 0，这就是按键）→ 输出开漏+写1+上拉（得到 1）→ 输出开漏+写1+悬空（得不到高电平）。">
  <GpioModeDemo />
</DemoBox>

::: tip 例 1 · 按键电路的上拉电阻怎么取
**题目**：按键一端接 MCU 引脚、另一端接地，要求松开时读到 1、按下时读到 0，用 3.3 V 供电。上拉电阻取多大？能否改用芯片内部上拉？

<FigBox title="例 1 的两种接法：上拉输入与下拉输入" kind="电路" note="左：弹簧在上，按键把引脚按到地，松开读到 1，这是最常见的按键接法。右：弹簧在下，按键把引脚推到 VCC，松开读到 0。两种接法在代码里只是判断的电平反了一下，务必和原理图对齐。" >

<svg viewBox="0 0 560 210" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="150" y="190" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">上拉输入：松开读到 1，按下读到 0</text>
  <text x="430" y="190" text-anchor="middle" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">下拉输入：松开读到 0，按下读到 1</text>
  <line x1="60" y1="30" x2="240" y2="30"/>
  <text x="60" y="22" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">VCC</text>
  <line x1="110" y1="30" x2="110" y2="44"/>
  <rect x="101" y="44" width="18" height="26" rx="2" class="sf-fill"/>
  <line x1="110" y1="70" x2="110" y2="100"/>
  <text x="126" y="60" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_pu</text>
  <circle cx="110" cy="100" r="3" class="sf-dot"/>
  <line x1="110" y1="100" x2="230" y2="100"/>
  <circle cx="230" cy="100" r="3.5" class="sf-dot"/>
  <text x="238" y="104" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PA0</text>
  <line x1="170" y1="100" x2="170" y2="114"/>
  <circle cx="170" cy="114" r="2.6" class="sf-dot"/>
  <line x1="170" y1="146" x2="170" y2="114" stroke-dasharray="0"/>
  <line x1="170" y1="118" x2="184" y2="142"/>
  <line x1="170" y1="146" x2="170" y2="162"/>
  <circle cx="170" cy="146" r="2.6" class="sf-dot"/>
  <line x1="150" y1="162" x2="190" y2="162"/>
  <line x1="158" y1="168" x2="182" y2="168"/>
  <line x1="165" y1="174" x2="175" y2="174"/>
  <line x1="320" y1="30" x2="470" y2="30"/>
  <text x="320" y="22" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">VCC</text>
  <line x1="385" y1="100" x2="385" y2="66"/>
  <line x1="385" y1="34" x2="385" y2="30"/>
  <line x1="378" y1="38" x2="392" y2="38"/>
  <line x1="385" y1="38" x2="385" y2="46"/>
  <line x1="381" y1="46" x2="389" y2="46"/>
  <circle cx="385" cy="52" r="2.6" class="sf-dot"/>
  <line x1="385" y1="52" x2="399" y2="76"/>
  <circle cx="385" cy="80" r="2.6" class="sf-dot"/>
  <line x1="385" y1="80" x2="385" y2="100"/>
  <circle cx="340" cy="100" r="3.5" class="sf-dot"/>
  <text x="332" y="104" text-anchor="end" font-size="10.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">PA0</text>
  <line x1="340" y1="100" x2="450" y2="100"/>
  <circle cx="430" cy="100" r="3" class="sf-dot"/>
  <line x1="430" y1="100" x2="430" y2="112"/>
  <rect x="421" y="112" width="18" height="26" rx="2" class="sf-fill"/>
  <text x="446" y="128" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_pd</text>
  <line x1="430" y1="138" x2="430" y2="156"/>
  <line x1="416" y1="156" x2="444" y2="156"/>
  <line x1="420" y1="162" x2="440" y2="162"/>
  <line x1="425" y1="168" x2="435" y2="168"/>
</svg>

</FigBox>

题目给了电压和接法，问的是电阻值，所以这是「按电流下限与上限两头卡」的题，不是套公式。两头是：电阻太大拉不动、电阻太小太费电。

第一步，按下时的电流（电阻直接跨在 3.3 V 与地之间）：

$$R = 4.7\ \text{k}\Omega:\quad I = \frac{3.3}{4700} \approx 0.70\ \text{mA}\qquad R = 10\ \text{k}\Omega:\quad I = \frac{3.3}{10000} \approx 0.33\ \text{mA}$$

第二步，两头约束。*（为什么不能更小：按下时这电流白流，电池产品直接掉续航；为什么不能更大：引脚输入阻抗极高，阻值大则抗干扰差、边沿变慢。）*

| 取值 | 按下电流 | 问题 |
| --- | --- | --- |
| 1 kΩ | 3.3 mA | 太费电，按键是常闭几秒的操作，白白发热 |
| 4.7 kΩ ~ 10 kΩ | 0.70 ~ 0.33 mA | 功耗与抗干扰的平衡点，工程惯例 |
| 47 kΩ 以上 | 0.07 mA | 易受空间耦合干扰，长引线时读数会跳 |

第三步，能不能省掉这个电阻：能。配成上拉输入即可，内部上拉典型 30~50 kΩ，按 40 kΩ 算：

$$I = \frac{3.3}{40000} = 82.5\ \mu\text{A}$$

比外部 10 kΩ 还省电，且省一个元件。代价是内部上拉的绝对阻值有 ±50% 的分散性，只适合短引线、干净环境。

回代验算：$4.7\ \text{k}\Omega$ 时 $0.70\ \text{mA}$，比芯片单脚 20 mA 的能力低两个数量级，所以上拉电阻的电流对引脚完全无害，它耗的是电源，不是引脚。✓
:::

::: tip 例 2 · 开漏做电平转换：上拉电阻不能随便取
**题目**：3.3 V 的 MCU 用开漏输出驱动一条 5 V 的总线，总线电容约 100 pF，上拉电阻 4.7 kΩ。若这条线要跑 400 kHz 的 I²C（快速模式要求上升时间不超过 300 ns），这个电阻合适吗？

开漏写 1 时引脚是「放手」，电平靠上拉电阻给总线电容充电，所以上升沿是一条 RC 曲线，这是开漏唯一但最要命的短板。下降沿由下管强拉，很快，不用管。

第一步，算时间常数：

$$\tau = R_{pu}C = 4700 \times 100\times10^{-12} = 0.47\ \mu\text{s}$$

第二步，算 10%~90% 上升时间（RC 充电的 $t_r \approx 2.2\tau$）：

$$t_r = 2.2 \times 0.47\ \mu\text{s} \approx 1.03\ \mu\text{s}$$

第三步，对照要求：快速模式要求 $t_r \le 300$ ns，实测 1030 ns，超了三倍多，波形会被对方采错（尤其是高位被读成低）。

第四步，反解允许的最大电阻：

$$R_{pu} \le \frac{t_r}{2.2C} = \frac{300\ \text{ns}}{2.2 \times 100\ \text{pF}} \approx 1364\ \Omega$$

所以快速模式应取 1 kΩ 量级（此时 $t_r \approx 0.22\ \mu\text{s}$ ✓）。若总线电容涨到 200 pF，允许的电阻还要减半到约 680 Ω。

回代验算：$1\ \text{k}\Omega$、100 pF → $\tau = 0.1\ \mu\text{s}$，$t_r = 0.22\ \mu\text{s} < 0.3\ \mu\text{s}$ ✓。

代价：电阻越小，器件拉低时的灌电流越大（$5\ \text{V}/1\ \text{k}\Omega = 5\ \text{mA}$），所以 I²C 规范同时给了「最小电阻」。上拉电阻是上升时间与灌电流之间的一笔交易，不是一个随手填的数。*（为什么这条一定要算：开漏总线的时序问题，八成都出在这个电阻上。）*
:::

::: tip 例 3 · 为什么开漏输出时 LED 不亮或状态诡异
**题目**：LED 串电阻接到 $V_{CC}$（低电平点亮），另一端接配置成开漏输出的引脚。程序写 1 期待 LED 灭、写 0 期待亮，结果写 1 时 LED 也亮着，或者亮度不对。

先问一句「我这个引脚写 1 之后，电平由谁决定」。开漏写 1 就是释放引脚，此时引脚是高阻，电平由外电路（LED + 电阻 + $V_{CC}$ 这条通路）决定。这不是 bug，是定义。

逐条对账：

- 引脚写 0 → 下管导通，强拉低 → LED 两端有压差 → 亮（符合预期）；
- 引脚写 1 → 下管关断，引脚悬空，$V_{CC}$ 经 LED 与电阻几乎不给电流（LED 正向压降约 2 V，剩下的电压没有回路）→ 引脚被 LED 的漏电流抬到某个不确定值 → LED 状态不确定；
- 若外部还有上拉电阻，写 1 时引脚被拉到高 → LED 两端压差不足 → 灭（这才是他想要的效果）。

排查规则：用开漏输出时，先问一句「我的上拉电阻在哪里」。没有上拉的开漏，永远得不到确定的高电平。要用开漏点 LED，就得在 LED 之外再给引脚一个上拉；不想加上拉，就把引脚改成推挽输出。点 LED 本来就该用推挽。
:::

输入这一侧的问题长在另一个地方：机械按键给出的信号，从来不是干净方波。

## 四、按键与消抖：抖动在时序上长什么样

机械按键的触点是两片金属。按下瞬间它们不会「啪」地贴死，总是先弹跳几下才稳定接触；松开时同理。这段弹跳持续 5~20 ms，对运行在几十 MHz 的 MCU 来说，相当于「按了又松、松了又按」几十次。

<FigBox title="一次按键的真实波形与 10 ms 采样点" kind="时序" note="第二行是触点实际电平：在 5~20 ms 内来回跳。第三行是软件判定：每 10 ms 采一次，且要求连续两次都读到低才认「按下」，所以判定点比真实按下晚了约一个扫描周期，这 10~20 ms 的延迟人手感觉不到。" >

<svg viewBox="0 0 600 250" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="60" y1="40" x2="60" y2="240" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <line x1="60" y1="240" x2="580" y2="240" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <g stroke="var(--vp-c-divider)" stroke-width="0.8" stroke-dasharray="3 4">
    <line x1="80" y1="44" x2="80" y2="236"/>
    <line x1="106" y1="44" x2="106" y2="236"/>
    <line x1="132" y1="44" x2="132" y2="236"/>
    <line x1="158" y1="44" x2="158" y2="236"/>
    <line x1="184" y1="44" x2="184" y2="236"/>
    <line x1="210" y1="44" x2="210" y2="236"/>
    <line x1="236" y1="44" x2="236" y2="236"/>
    <line x1="262" y1="44" x2="262" y2="236"/>
    <line x1="288" y1="44" x2="288" y2="236"/>
    <line x1="314" y1="44" x2="314" y2="236"/>
  </g>
  <text x="60" y="36" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">① 手指真正的动作</text>
  <path d="M 60 62 L 96 62 L 96 84 L 580 84" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
  <text x="60" y="118" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">② 触点实际电平（抖动）</text>
  <path d="M 60 130 L 96 130 L 102 156 L 110 130 L 118 156 L 128 130 L 140 156 L 154 130 L 168 156 L 180 156 L 580 156" stroke="var(--vp-c-brand-2)" stroke-width="2"/>
  <text x="96" y="176" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">5~20 ms 内反复弹跳</text>
  <text x="60" y="204" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">③ 软件判定（连续两次读到低）</text>
  <path d="M 60 206 L 158 206 L 158 228 L 580 228" stroke="var(--vp-c-brand-1)" stroke-width="2.2"/>
  <circle cx="132" cy="156" r="2.6" class="sf-dot"/>
  <circle cx="158" cy="156" r="2.6" class="sf-dot"/>
  <text x="166" y="150" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">两次都为低 → 判定按下</text>
  <text x="320" y="238" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">竖虚线 = 每 10 ms 一次的定时扫描</text>
</svg>

</FigBox>

硬件消抖：在按键两端并联一只电容，配合上拉电阻构成 RC 低通，把毛刺滤平。设 $R_{pu}=10\ \text{k}\Omega$、$C=100\ \text{nF}$：

$$\tau = RC = 10\times10^{3}\times100\times10^{-9} = 1\ \text{ms}$$

也就是说它只能压掉 1 ms 以内的毛刺，而抖动可以持续到 20 ms。单靠一只电容往往不够，硬件滤波通常与软件消抖配合使用。

软件消抖工程上必做：读到电平变化后等一段时间再确认。但不要用死等延时，`HAL_Delay` 会把整个 CPU 停在原地，这期间所有中断处理都被推迟。正确做法是用定时器定时扫描（每 5~10 ms 一次），配合「记录上一次电平」的状态机：

```c
// 由定时器中断每 10 ms 调用一次
static uint8_t raw_last = 1;   // 上一次读到的原始电平
static uint8_t stable  = 1;    // 已确认的稳定状态
void Key_Scan(void) {
  uint8_t now = HAL_GPIO_ReadPin(KEY_GPIO_Port, KEY_Pin);
  if (now == raw_last) {          // 连续两次读到同一电平 → 认为不是抖动
    if (stable != now) {          // 且与已确认状态不同 → 才算一次真实变化
      stable = now;
      if (stable == 0) key_pressed = 1;   // 只在「松开变按下」时触发一次
    }
  }
  raw_last = now;
}
```

*（为什么用「连续两次相同」而不是「延时后再读一次」：前者不需要等待，函数立刻返回，主循环一秒也不耽误；后者把「等待」写进了代码结构，一旦放进中断就会阻塞别人。注意两个变量分工：`raw_last` 判「两次采样是否一致」，`stable` 判「这是不是一次新的变化」，少了后一个，按住不放会每 10 ms 触发一次。）* 定时器与中断本身的配置见 [07 · 定时器与 PWM](./timer-pwm.md) 与 [06 · 中断与 NVIC](./interrupt.md)。

::: tip 例 4 · 消抖时间取多少
**题目**：抖动实测 5~20 ms，扫描周期、消抖窗口各取多少？

这是「两头卡时间」的题：取小了漏抖、取大了迟钝，中间是一段很宽的安全区。

| 取值 | 结果 |
| --- | --- |
| 扫描 2 ms、确认 1 次 | 仍在抖动窗口内，一次按下被读成多次 |
| 扫描 10 ms、确认 2 次 | 覆盖 10~20 ms 抖动，响应延迟约 10~20 ms |
| 扫描 20 ms、确认 3 次 | 更可靠，但延迟 40~60 ms，开始接近人能察觉的下限（约 50~100 ms） |

结论：扫描周期取 10 ms，连续两次读到同一电平才认定。延迟 10~20 ms，人完全感觉不到。

额外一条：音量加减、菜单上下这类需要「按住连发」的功能，还要在首次触发后延时约 500 ms 才进入连发，否则按住时会以 10 ms 一次的速度疯跑。*（为什么是 500 ms：这是人对「按住」与「连点」的心理分界，短了会误连发。）*
:::

消抖本质上是在时间轴上做判断，而它依赖一个前提：扫描的时刻是准的。要做到准，就得理解引脚的另一个参数，输出速度。它常被误解成频率上限。

## 五、输出速度：它调的是压摆率，不是频率上限

配置里那个「输出速度 2 / 10 / 50 MHz」到底在调什么？调的是驱动管翻转的快慢，也就是边沿的陡峭程度，术语叫压摆率（slew rate：电压每秒变化多少伏）。选得高，边沿陡；选得低，边沿缓。它决定的是信号在 1 与 0 之间翻转的那一小段时间有多长。它不是「引脚最高能翻转多少次」，那个上限由芯片工艺和负载决定，通常远高于这几个选项。

<FigBox title="同一个 3.3 V 跳变，两种压摆率" kind="波形" note="左：边沿缓（约 50 ns），高次谐波少、EMI 小，但走高速信号时波形会被「磨圆」，接收端采样点错位。右：边沿陡（约 5 ns），频谱拐点抬到 70 MHz，容易激起过冲与振铃，辐射也大。原则是够用即可。" >

<svg viewBox="0 0 600 200" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <text x="160" y="26" text-anchor="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">低速档：边沿缓（t_r ≈ 50 ns）</text>
  <line x1="60" y1="150" x2="270" y2="150" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <line x1="60" y1="60" x2="270" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="3 4"/>
  <path d="M 60 150 L 100 150 C 130 150 140 60 175 60 L 270 60" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
  <line x1="100" y1="166" x2="175" y2="166"/>
  <text x="137" y="180" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">t_r</text>
  <text x="160" y="196" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">拐点 ≈ 7 MHz，辐射小</text>
  <text x="470" y="26" text-anchor="middle" font-size="11" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">高速档：边沿陡（t_r ≈ 5 ns）</text>
  <line x1="370" y1="150" x2="580" y2="150" stroke="var(--vp-c-divider)" stroke-width="1"/>
  <line x1="370" y1="60" x2="580" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="3 4"/>
  <path d="M 370 150 L 430 150 C 438 108 444 62 452 56 C 460 50 466 66 474 62 C 482 58 490 60 500 60 L 580 60" stroke="var(--vp-c-brand-1)" stroke-width="2.4"/>
  <line x1="430" y1="166" x2="452" y2="166"/>
  <text x="441" y="180" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">t_r</text>
  <text x="470" y="196" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">拐点 ≈ 70 MHz，易过冲、振铃</text>
</svg>

</FigBox>

::: tip 例 5 · 边沿时间决定辐射的频段
**题目**：3.3 V 输出，取 50 MHz 档时 $t_r \approx 5$ ns，取 2 MHz 档时 $t_r \approx 50$ ns。两种情况下，这条走线要当成多少频率的信号来对待？

方波的频谱不是某一条谱线，最高有效频率由边沿决定，而不是由重复频率决定。工程估算用经验式 $f_{\text{拐点}} \approx 0.35/t_r$。

第一步，算压摆率：

$$\text{50 ns 档：}\ \frac{3.3}{50\ \text{ns}} = 0.066\ \text{V/ns}\qquad \text{5 ns 档：}\ \frac{3.3}{5\ \text{ns}} = 0.66\ \text{V/ns}$$

第二步，算频谱拐点：

$$f_{\text{拐点}} = \frac{0.35}{t_r}:\quad t_r=50\ \text{ns} \Rightarrow 7\ \text{MHz},\qquad t_r=5\ \text{ns} \Rightarrow 70\ \text{MHz}$$

第三步，取结论：同一根线，慢档只需当 7 MHz 看待（几乎不会辐射），快档要当 70 MHz 看待（这时几厘米的走线就成了天线）。

为什么够用即可：点一颗 LED 只需要几百 Hz，边沿再陡也没有好处；而跑 SPI 几十 MHz 时，边沿慢会让波形严重变圆，接收端在采样点上读到错的电平。所以判据是「信号的最高频率分量」对「边沿时间」，不是「我想让它跑多快」。
:::

::: warning 选档经验
点 LED、读按键、驱动继电器 → 最低档；UART、I²C 这类几 MHz 以下的信号 → 低速或中速；SPI 几十 MHz → 中速或高速。默认先选低档，出问题再往上调。反过来做（一律选最高档）会让 EMI 测试与 PCB 调试同时变难。
:::

还剩一条硬约束没有交代：引脚到底能给出多少电流。

## 六、驱动能力：什么时候必须加三极管

电流这条线就没那么好过了。STM32 单个 IO 的吸收 / 灌入电流一般限制在 20 mA 量级（手册写 20~25 mA），整片总电流也有上限（F103 约 150 mA，具体看数据手册的 Absolute Maximum Ratings 一节）。下表最右一列，就是按 20 mA 这条线画的。

| 负载 | 能否直接驱动 | 说明 |
| --- | --- | --- |
| 指示 LED（5~10 mA） | ✅ 可以 | 必须串限流电阻，按 $(V_{CC}-V_F)/I$ 算 |
| 有源蜂鸣器（20 mA 以内） | ✅ 勉强 | 启动电流常超规格，建议仍用三极管 |
| 继电器线圈（70 mA 以上） | ❌ 不行 | 必须三极管 / MOS 管 |
| 直流电机 | ❌ 不行 | 用 MOS 管或专用驱动芯片 |
| 大功率 LED / 灯带 | ❌ 不行 | 用 MOS 管 |

::: tip 例 6 · 用 NPN 三极管驱动继电器，算基极电阻
**题目**：继电器线圈 5 V、吸合电流 70 mA；NPN 三极管 S8050，$h_{FE}\approx100$；MCU 用 3.3 V IO 控制，$V_{BE}\approx0.7$ V。求基极电阻。

<FigBox title="例 6 的低边开关：三极管 + 续流二极管 + 基极下拉" kind="电路" note="三极管做低边开关：IO 出高 → 基极有电流 → 集电极对地导通 → 线圈得电。两个不能省的元件都在图上：反向并联的续流二极管（关断瞬间给线圈电流一条回路）与基极下拉电阻（复位期间 IO 是高阻，防止三极管误导通）。" >

<svg viewBox="0 0 560 210" class="sf " xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
  <line x1="240" y1="26" x2="420" y2="26"/>
  <text x="240" y="18" font-size="10.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">+5 V</text>
  <rect x="30" y="86" width="66" height="28" rx="3" class="sf-fill"/>
  <text x="63" y="104" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-1)" class="sf-t">3.3 V IO</text>
  <line x1="96" y1="100" x2="140" y2="100"/>
  <rect x="140" y="94" width="36" height="12" rx="2" class="sf-fill"/>
  <text x="158" y="88" text-anchor="middle" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">R_B 1k</text>
  <line x1="176" y1="100" x2="240" y2="100"/>
  <circle cx="210" cy="100" r="3" class="sf-dot"/>
  <line x1="210" y1="100" x2="210" y2="126"/>
  <rect x="201" y="126" width="18" height="26" rx="2" class="sf-fill"/>
  <line x1="210" y1="152" x2="210" y2="176"/>
  <line x1="196" y1="176" x2="224" y2="176"/>
  <line x1="200" y1="182" x2="220" y2="182"/>
  <text x="238" y="166" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">10k 下拉</text>
  <line x1="240" y1="80" x2="240" y2="120" stroke-width="2.4"/>
  <line x1="240" y1="88" x2="276" y2="62"/>
  <line x1="240" y1="112" x2="276" y2="138"/>
  <path d="M 276 138 L 264 136 L 268 126 Z" class="sf-solid"/>
  <line x1="276" y1="62" x2="276" y2="40"/>
  <rect x="266" y="40" width="20" height="24" rx="2" class="sf-fill"/>
  <line x1="276" y1="26" x2="276" y2="40"/>
  <text x="292" y="54" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">继电器线圈</text>
  <line x1="276" y1="138" x2="276" y2="176"/>
  <line x1="240" y1="176" x2="330" y2="176"/>
  <line x1="256" y1="182" x2="286" y2="182"/>
  <line x1="266" y1="188" x2="276" y2="188"/>
  <line x1="340" y1="26" x2="340" y2="34"/>
  <line x1="334" y1="34" x2="346" y2="34"/>
  <path d="M 334 34 L 346 34 L 340 46 Z" class="sf-solid"/>
  <line x1="340" y1="46" x2="340" y2="62"/>
  <line x1="276" y1="62" x2="340" y2="62"/>
  <circle cx="276" cy="62" r="2.6" class="sf-dot"/>
  <text x="352" y="40" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">续流二极管</text>
  <text x="352" y="150" font-size="9.5" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">三极管低边开关</text>
  <text x="300" y="204" text-anchor="middle" font-size="10" stroke="none" fill="var(--vp-c-text-3)" class="sf-t">IO 出高 → I_B 流过 → 集电极导通 → 线圈得电</text>
</svg>

</FigBox>

题目问电阻，实际要的是「让三极管进饱和区」这件事，所以先算集电极需要多少电流，再按最小放大倍数反推基极电流，最后留 3~5 倍余量。

第一步，理论最小基极电流：

$$I_{B(\min)} = \frac{I_C}{h_{FE}} = \frac{70}{100} = 0.7\ \text{mA}$$

第二步，取饱和余量：工程上取理论值的 3~5 倍，避免三极管停在放大区发热。直接选 $R_B = 1\ \text{k}\Omega$：

$$I_B = \frac{3.3 - 0.7}{1000} = 2.6\ \text{mA}\quad(\approx 3.7\ \text{倍})$$

第三步，核对能带的集电极电流：

$$I_{C(\max)} = 2.6\ \text{mA} \times 100 = 260\ \text{mA} \gg 70\ \text{mA}$$

回代验算：$2.6/0.7 = 3.7$ 倍余量，集电极能力 260 mA 是需求的 3.7 倍，三极管深度饱和，$V_{CE(\text{sat})}$ 约 0.2 V，管耗只有 $70\ \text{mA}\times0.2\ \text{V}=14\ \text{mW}$，不会烫。✓

两个不能漏的元件：续流二极管（反向并联在线圈两端，关断瞬间给电感电流一条回路，否则反向电动势直接击穿三极管）与基极下拉电阻（10 kΩ 到地，保证 MCU 复位期间 IO 是高阻时三极管不误导通）。
:::

驱动能力这一层是硬件边界。再往上就是软件配置：同一个引脚一旦交给外设，需要的是另一种模式。

## 七、复用功能与重映射

普通输出模式下，引脚的电平由你写 `ODR` 决定；外设（UART 的移位器、定时器的比较器）想直接控制这个引脚，就必须把引脚从 CPU 手里交给外设，这就是复用（alternate function）。F1 上还要先开 AFIO 时钟，重映射时才需要动 `AFIO->MAPR`：

```c
__HAL_RCC_AFIO_CLK_ENABLE();          // F1 上复用/重映射必须先开 AFIO 时钟
// 然后把引脚配成 GPIO_MODE_AF_PP（复用推挽）
```

| 用途 | 该配的模式 | 忘了会怎样 |
| --- | --- | --- |
| UART TX、SPI MOSI/SCK、TIM PWM 输出 | 复用推挽 | 外设在跑，引脚没信号，示波器一片平 |
| I²C SDA/SCL | 复用开漏（+ 外部上拉） | 总线拉不低或拉不高，通信时好时坏 |
| ADC 输入 | 模拟 | 数字输入缓冲带来漏电与钳位，读数偏移 |

「外设没信号」的第一嫌疑永远是模式没配成复用：定时器在跑、中断也在进，但引脚还是普通 GPIO，示波器上要么是恒定的 0，要么是恒定的 1，中间连一点过渡都没有。排在第二的嫌疑是时钟没开（见 [04 · 时钟系统](./clock.md)）。

## 八、工程实例：矩阵键盘与电平转换

**矩阵键盘**：$4\times4$ 的 16 个按键只需要 8 根引脚。扫描分三步：

1. 4 行依次设为推挽输出低电平，其余行输出高；
2. 同时把 4 列配成上拉输入去读；
3. 若某列读到 0，说明该行该列的按键被按下。

配一个 10 ms 的定时扫描，消抖顺便一起做完。按键越多，这套「输出扫描 + 输入读取」的省引脚办法越划算。

**电平转换**：3.3 V 的 MCU 要控制 5 V 器件时，把引脚配成开漏输出、外部上拉到 5 V：输出 0 时拉低，输出 1 时由上拉电阻把线拉到 5 V。第三节说过，开漏永远不会把 5 V 灌回芯片，所以这条通路是安全的，但只在标注 FT（5 V 容忍，five-volt tolerant）的引脚上成立，非 FT 引脚这样接会损坏芯片。上升时间按例 2 的方式核对一遍。接线本身按 5 步走：

1. 确认这个引脚是 FT；
2. 确认上拉接的是 5 V 而不是 3.3 V；
3. 量空闲时的电平；
4. 量上升时间；
5. 上电顺序先主控后器件。

## 九、易错清单 + 自检

按踩坑频率从高到低排，格式是「错误做法 → 会得到什么 → 正确做法」。

1. 开漏输出没接上拉 → 写 1 得不到高电平，读数随机 → 开漏的每一根线都要问「上拉在哪」。
2. 输入引脚浮空 → 读到随机值，按键误触发 → 配成上拉或下拉输入。
3. 把「输出速度」当成输出频率上限 → 选了高速档却不知道为什么 EMI 超标 → 它调的是压摆率，够用即可。
4. 用 IO 直接驱动继电器 / 电机 → 超过 20 mA，引脚过热甚至烧断 → 加三极管或 MOS 管。
5. 驱动感性负载忘续流二极管 → 关断瞬间反向电动势击穿三极管 → 反向并联一只二极管。
6. 配了外设却忘了配复用模式（F1 上还忘开 AFIO 时钟）→ 外设运行但引脚无信号 → 模式改成复用推挽 / 复用开漏。
7. 按键没消抖 → 一次按下被读成多次 → 10 ms 定时扫描 + 连续两次判定。
8. 用 `HAL_Delay` 做消抖 → 整个程序阻塞，中断被推迟 → 换成定时扫描的状态机。
9. 上拉电阻取得过大（47 kΩ 以上）→ 长引线时读数跳变 → 4.7 kΩ~10 kΩ，或改用内部上拉。

自检（先自己想，答案在下面一行）：

1. 按键「按下接地、松开为高」，引脚该配成什么模式？为什么不用浮空输入？
2. 开漏输出要得到确定的高电平，外部必须有什么？如果只是点一颗 LED，应该用哪种输出？
3. 按键抖动一般持续多久？为什么消抖不能用 `HAL_Delay`？

（答案：上拉输入，浮空时松开手引脚没有回路，读数随机；上拉电阻，点 LED 用推挽输出；5~20 ms，`HAL_Delay` 会阻塞 CPU，改用定时扫描。）
