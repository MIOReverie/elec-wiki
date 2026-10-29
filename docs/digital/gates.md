---
title: 03 · 门电路与集成器件
description: 一个逻辑门能不能带得动负载、信号穿过它要等多久、多个设备怎么共用一条线。扇出、噪声容限、传输延迟，加上开漏、三态与竞争冒险这几个实战坑。
---

# 03 · 门电路与集成器件

<Meta time="28 min" level="核心" note="TTL / CMOS、开漏、三态、竞争冒险——从『门』到『能用』" />

::: tip 读这页之前
看到 $AB+\overline A C$ 这种与或式不陌生就行，布尔代数与卡诺图在[另一页](../digital/boolean-kmap.md)讲过。另外要认得[符号与约定](../guide/notation.md)里的上划线 $\overline{\text{EN}}$：引脚名上加横线表示低有效。

这一页还要用到两个词，先各给一句：扇出，一个输出能带动多少个同类输入；建立/保持时间，触发器采样时对信号稳定性的要求。

<Prereq id="gate-fanout" text="扇出：一个输出能带动多少个同类输入" />
<Prereq id="setup-hold" text="建立/保持时间：采样时序约束" />
:::

单个门只是数学上的与或非。真要做成能用的电路，你还得知道它到底能带几个负载、信号在门之间跑要等多久、怎么让多个设备共用一条线而不打架。门从「原理图」走到「工程器件」，靠的就是这几个约束。

## 一、门不是魔法，是开关网络

早期的二极管-三极管逻辑（DTL）用二极管做与/或，再用三极管反相，得到与非、或非。以与非门为例：输入全高时二极管截止、三极管饱和导通，输出低；任一输入低时二极管导通钳位、三极管截止，输出高。「非」这一步靠三极管，「与/或」靠二极管。

今天的芯片里，单个门早已是微米级的 CMOS 结构，但「与或非靠开关网络」这个本质没变。理解了这一点，后面所有电平兼容、多余端处理都能自己推出来。

## 二、TTL 与 CMOS：选型时看什么

| | TTL（如 74LS 系列） | CMOS（如 74HC 系列） |
| --- | --- | --- |
| 电源电压 | 严格 5 V | 宽（3 ~ 18 V） |
| 速度 | 较快 | 现代已很快 |
| 静态功耗 | 较大 | 极小（近乎 0） |
| 输入悬空 | 等效高电平（但抗干扰差） | 严禁悬空（感应电荷可损坏） |
| 抗干扰 | 一般 | 强 |
| 驱动能力 | 强（拉/灌电流大） | 一般 |

电池供电、低功耗场合选 CMOS；要驱动大电流负载，或者在 legacy 5 V 系统里，选 TTL。两者逻辑兼容（都是高≈供电、低≈0），但电平阈值不完全一致，混用时得看 $V_{IH}/V_{IL}$（输入高/低电平阈值）。

混用两族器件时，手册上要核对的就 6 个参数：

1. $V_{OH}$：输出高电平的下限；
2. $V_{OL}$：输出低电平的上限；
3. $V_{IH}$：输入判定为高的门限；
4. $V_{IL}$：输入判定为低的门限；
5. $I_{OH}$：高电平时能给出的电流；
6. $I_{OL}$：低电平时能灌入的电流。

前 4 个决定能不能连上，后 2 个决定能带几个负载。而扇出在不同电平方向并不一样，TTL 的高电平扇出往往比低电平扇出小得多，这是选型时最容易漏的一项，详见 <Prereq id="gate-fanout" text="扇出：取高/低电平两方向中较小者" />。

这 6 个数还能顺手算出一个量：噪声容限（noise margin），也就是「信号被噪声推歪多少还认得出」。高电平方向是 $V_{OH}-V_{IH}$，低电平方向是 $V_{IL}-V_{OL}$，取两者中小的那个。74LS 的输出高下限 2.7 V 对上 74HC 的输入高门限 3.5 V，减出来是负的，等于一点余量都没有；反过来 74HC 驱 74LS 就宽裕。抗干扰能力不是「CMOS 天生强」这么一句，而是这两个差值。

传输延迟 $t_{pd}$（propagation delay）是另一笔账：信号穿过一级门要等多久。手册给典型值与最大值两栏，算最坏情况必须用最大值，再乘上信号串过的级数。它和最高工作频率是一体两面，时钟周期得大于「路径级数 × $t_{pd}$」再加上接收端的建立时间（<Prereq id="setup-hold" />），这正是后面时序分析要算的东西。

::: tip 例 1 · 74LS 能直接驱动 74HC 吗
先想什么：电平兼容不能只看「都是 5 V」，要把高电平下限对上。驱动者的输出高，必须高于接收者的输入高阈值。

<FigBox title="74LS 输出接 74HC 输入（同供 5 V）的电平链" kind="波形" note="高电平段 2.7 V 落在 74HC 要求的 3.5 V 之下，缺口即不兼容；低电平段 0.5 V ≤ 1.5 V，安全。">
<svg viewBox="0 0 460 220" role="img" aria-label="电平对比图：74LS 输出高 2.7V 低于 74HC 输入高阈值 3.5V，低电平安全">
  <g font-size="12" fill="var(--vp-c-text-1)">
    <line x1="40" y1="40" x2="440" y2="40" stroke="var(--vp-c-divider)"/>
    <line x1="40" y1="90" x2="440" y2="90" stroke="var(--vp-c-divider)"/>
    <line x1="40" y1="160" x2="440" y2="160" stroke="var(--vp-c-divider)"/>
    <line x1="40" y1="190" x2="440" y2="190" stroke="var(--vp-c-divider)"/>
    <text x="30" y="44" text-anchor="end" fill="var(--vp-c-text-3)">5V</text>
    <text x="36" y="94" text-anchor="end" fill="var(--vp-c-brand-1)">3.5V VIH</text>
    <text x="36" y="164" text-anchor="end" fill="var(--vp-c-brand-1)">2.7V VOH</text>
    <text x="30" y="194" text-anchor="end" fill="var(--vp-c-text-3)">0V</text>
  </g>
  <rect x="120" y="40" width="280" height="50" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)" stroke-dasharray="5 4"/>
  <text x="150" y="72" font-size="12" fill="var(--vp-c-brand-1)">74HC 要求的高电平区 (≥3.5V)</text>
  <line x1="80" y1="160" x2="400" y2="160" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <text x="150" y="150" font-size="12" fill="var(--vp-c-text-1)">74LS 实际输出高 2.7V（缺口）</text>
</svg>
</FigBox>

查手册：

- 74LS 输出高电平最低 $V_{OH(\min)} = 2.7\text{ V}$；
- 74HC 在 $V_{CC}=5\text{ V}$ 时要求输入高电平最低 $V_{IH(\min)} = 0.7 \times 5 = 3.5\text{ V}$。

高电平段 $2.7 < 3.5$，不满足，74HC 可能把 2.7 V 判成中间电平，行为不确定。再看低电平段：$V_{OL(\max)} = 0.5\text{ V} \le V_{IL(\max)} = 0.3\times5 = 1.5\text{ V}$，反而没问题。所以问题只出在高的一端不够高。

两种解法：

1. 输出侧加上拉电阻把高电平抬到 5 V（用 OC 缓冲如 7407 推动）；
2. 换 74HCT 系列。它的输入阈值按 TTL 设计，$V_{IH(\min)} = 2.0\text{ V} \le 2.7\text{ V}$，直接兼容。

反过来，74HC 驱动 74LS 则没问题（$V_{OH}\approx4.4\text{ V} \ge 2.0\text{ V}$）。一句话：TTL 驱动 CMOS 要查电平，CMOS 驱动 TTL 一般放心。
:::

## 三、多余输入端怎么处理

悬空为什么危险？CMOS 的输入端是一片极薄的栅氧化层，悬空时它像个小天线，感应电荷一点点攒起来，轻则误触发，重则击穿。所以多余端不能任其飘着。

- 与门、与非门的多余端接高电平（接 1 不影响「全 1 才…」的判定）；
- 或门、或非门的多余端接低电平（接地）；
- 原则是让多余端处于不改变输出有效性的电平，同时把它固定住，以免引入噪声。

## 四、OC / OD 门：开漏与开集电极

普通 CMOS 输出是推挽结构，有上拉管也有下拉管，能主动拉高也能主动拉低。**开漏**（Open-Drain，OD）门只有下拉管，要输出高电平必须外接上拉电阻到电源，让电阻把线拉向高电平。代价是上升沿变慢，收益是两大绝活：

1. 线与（wired-AND）：多个 OD 门输出直接并接，任一拉低则整线为低，天然实现「与」。
2. 电平转换：上拉到 5 V 就能和 5 V 器件通信，上拉到 3.3 V 就接 3.3 V 系统。

::: tip 例 2 · 选上拉电阻 $R_p$
先想什么：上拉电阻有两头约束。太大，高电平时压降过大、达不到 $V_{OH}$；太小，低电平时灌电流灌不过来。先把上界和下界分别算出来。

<FigBox title="OD 门经上拉电阻 Rp 接负载，高/低两种状态" kind="结构" note="高态：电流经 Rp 流向上拉源，Rp 大则压降大；低态：Rp 需把灌电流分给负载，Rp 小则灌不过来。">
<svg viewBox="0 0 460 180" role="img" aria-label="OD 门开漏结构：下拉管接地，上拉电阻接 VCC，输出接到负载输入端">
  <g font-size="12" fill="var(--vp-c-text-1)">
    <rect x="120" y="40" width="90" height="40" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-divider)"/>
    <text x="165" y="64" text-anchor="middle">OD 门</text>
    <line x1="210" y1="60" x2="320" y2="60" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <text x="300" y="50" text-anchor="end">输出</text>
    <line x1="320" y1="60" x2="320" y2="110" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <rect x="290" y="110" width="60" height="30" fill="none" stroke="var(--vp-c-text-1)"/>
    <text x="320" y="130" text-anchor="middle">负载</text>
    <line x1="320" y1="140" x2="320" y2="160" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <line x1="120" y1="80" x2="120" y2="160" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <line x1="120" y1="160" x2="320" y2="160" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <line x1="60" y1="80" x2="120" y2="80" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <text x="60" y="72" text-anchor="end">Rp</text>
    <line x1="60" y1="80" x2="60" y2="160" stroke="var(--vp-c-text-1)" stroke-width="2"/>
    <text x="55" y="120" text-anchor="end" fill="var(--vp-c-brand-1)">VCC</text>
  </g>
</svg>
</FigBox>

某 OD 门驱动 4 个同类输入，参数：$V_{CC}=5\text{ V}$，$V_{OH(\min)}=2.4\text{ V}$（高电平下限），最大拉电流 $I_{OH}=0.4\text{ mA}$；低电平时最大灌电流 $I_{OL(\max)}=16\text{ mA}$，每个负载输入漏电流 $I_{IL}=0.4\text{ mA}$。

输出高时电流经 $R_p$ 流向上拉源，$R_p$ 不能太大，否则压降过大：

$$R_{p(\max)} = \frac{V_{CC} - V_{OH(\min)}}{I_{OH}} = \frac{5 - 2.4}{0.4\text{ mA}} = 6.5\text{ k}\Omega$$

输出低时 $R_p$ 要把灌电流分流给负载，不能太小，否则灌不过来：

$$R_{p(\min)} = \frac{V_{CC} - V_{OL(\max)}}{I_{OL(\max)} - n I_{IL}} = \frac{5 - 0.4}{16 - 4\times 0.4}\text{ k}\Omega \approx 0.32\text{ k}\Omega = 319\ \Omega$$

所以 $R_p$ 取 $319\ \Omega \sim 6.5\text{ k}\Omega$ 之间，工程上常用 $1\text{ k}\Omega$ 或 $4.7\text{ k}\Omega$。选太大上升沿钝，选太小功耗大。
:::

## 五、三态门与总线

三态门比普通门多一个使能端 $\overline{EN}$（上划线表示低有效：引脚为低时使能有效）。使能有效时正常输出 0 或 1；无效时输出**高阻 Z**，既不是 0 也不是 1，相当于从线上断开。

总线就是一条被多个设备共享的线。规则只有一条：同一时刻只能有一个设备使能有效（输出 0 或 1），其余都必须是高阻，否则两个设备一个拉高一个拉低会短路。计算机里地址总线、数据总线的仲裁基础就是这条。

<DemoBox title="三态总线 vs 开漏线与：两种共享一条线的玩法" hint="切换两种模式，逐个开关各设备的 EN，看总线变成 0 / 1 / 高阻 Z 还是冲突。重点试『A、B 冲突驱动』和『开漏都释放』两个一键场景。">
  <TriStateBusDemo />
</DemoBox>

两条路的规则差得很远。三态门靠高阻断开，必须外加仲裁保证只有一个驱动；开漏门根本输出不了高，多个设备同时拉低也不冲突，靠上拉电阻得到线与。I²C 用的就是后者。

::: tip 例 3 · 三态总线冲突
三条设备挂在一条数据线上，若设备 A 使能有效输出 1、设备 B 也使能有效输出 0，则线上既被上拉又被下拉，结果是不确定的中间电平，还可能过流。正确做法是控制器保证任意时刻至多一个 $\overline{EN}$ 有效，这层逻辑叫总线仲裁。

（用上面的演示复现：点「A、B 冲突驱动」，看总线变红、读端报警；再点「仅 A 驱动」对比正常情况。注意「A、B 同电平驱动」虽然不过流，依然违反仲裁规则。）
:::

## 六、竞争冒险

信号经过不同路径的门，延迟不同，可能在输出端冒出一个不该出现的窄脉冲，也就是**毛刺**。典型特征是表达式里同一变量以原变量和反变量同时出现（如 $Y = A + \bar A$ 型）。这里的传输延迟（每级门的固有延时）是毛刺宽度的直接来源。

消除三招：

1. 加滤波电容（最简单，但拖慢边沿）
2. 增加冗余项（在卡诺图里多圈一个圈，堵住冒险点）
3. 加选通脉冲（等电路稳定后再去采样输出）

::: tip 例 4 · 一个 10 ns 的毛刺是怎么冒出来的
先想什么：A 跳变时，两条路径经过的门级数不同，到达输出端有先后，这个时间差就是毛刺。先把每级延时的到达时刻画在时间轴上。

<FigBox title="A 1→0 跳变时两乘积项的到达时间轴（每门 10 ns）" kind="时序" note="AB 路经 1 个与门，第 10ns 变 0；ĀC 路经非门+与门，第 20ns 才变 1；10~20ns 两路同为 0，输出出现 10ns 负毛刺。">
<svg viewBox="0 0 460 170" role="img" aria-label="时间轴：AB 路第10ns变0，AC路第20ns变1，中间10ns重叠为0产生毛刺">
  <g font-size="11" fill="var(--vp-c-text-1)">
    <line x1="40" y1="30" x2="440" y2="30" stroke="var(--vp-c-divider)"/>
    <line x1="40" y1="80" x2="440" y2="80" stroke="var(--vp-c-divider)"/>
    <line x1="40" y1="130" x2="440" y2="130" stroke="var(--vp-c-divider)"/>
    <text x="30" y="34" text-anchor="end" fill="var(--vp-c-text-3)">AB</text>
    <text x="30" y="84" text-anchor="end" fill="var(--vp-c-text-3)">ĀC</text>
    <text x="30" y="134" text-anchor="end" fill="var(--vp-c-text-3)">Y</text>
    <text x="60" y="160" fill="var(--vp-c-text-3)">t=0</text>
    <text x="200" y="160" fill="var(--vp-c-brand-1)">10ns</text>
    <text x="330" y="160" fill="var(--vp-c-brand-1)">20ns</text>
  </g>
  <polyline points="60,30 200,30 200,55 200,30 440,30" fill="none" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <polyline points="60,80 330,80 330,105 330,80 440,80" fill="none" stroke="var(--vp-c-text-1)" stroke-width="2"/>
  <rect x="200" y="115" width="130" height="20" fill="var(--vp-c-brand-soft)" stroke="var(--vp-c-brand-1)"/>
  <text x="265" y="129" text-anchor="middle" font-size="11" fill="var(--vp-c-brand-1)">10ns 毛刺</text>
</svg>
</FigBox>

电路 $Y = AB + \bar{A}C$，设 $B = C = 1$ 不变。静态分析：$A = 1$ 时 $AB = 1$，输出为 1；$A = 0$ 时 $\bar{A}C = 1$，输出还是 1。输出本该恒为 1。

设每个门延迟都是 10 ns。当 $A$ 从 1 跳变为 0：

- 乘积项 $AB$ 经过 1 个与门，第 10 ns 时变为 0；
- 乘积项 $\bar{A}C$ 要先过非门再过与门，第 20 ns 时才变为 1。

于是第 10 ~ 20 ns 之间两个乘积项同时为 0，输出出现一个宽 10 ns 的负向毛刺。这就是竞争冒险。

用卡诺图看更清楚：$AB$ 圈覆盖 $m_6, m_7$，$\bar{A}C$ 圈覆盖 $m_1, m_3$；$A$ 跳变对应从 $m_7$ 到 $m_3$，这两个相邻格分属不同的圈，圈与圈交接处就是冒险点。修法是把交接处再圈一个冗余项 $BC$（覆盖 $m_3, m_7$）：

$$Y = AB + \bar{A}C + BC$$

逐格枚举验证：加 $BC$ 前后真值表完全一致（都是 `01010011`），逻辑功能没变；但 $B=C=1$ 时 $BC$ 恒为 1，输出被它托住，毛刺消失。
:::

## 七、工程实例

I²C 总线就是 OD 结构的经典应用：SDA/SCL 两根线靠外部上拉电阻，所有从设备都是开漏输出，靠线与仲裁谁在说话。理解了 OC/OD 和总线仲裁，才看得懂为什么 I²C 能挂这么多设备还不会打架。

按键消抖常用施密特触发（迟滞）输入，或者软件去抖。两者本质都是对付「信号在阈值附近反复横跳」这类噪声，和竞争冒险同源，都跟噪声容限、边沿抖动有关。

## 八、易错清单 + 自检

- [ ] CMOS 多余输入端严禁悬空；TTL 悬空虽等效高但抗干扰差，最好也固定
- [ ] 与/与非的多余端接高，或/或非的多余端接低，别接反
- [ ] OC/OD 门必须接上拉电阻，否则输出不了高电平；它靠线与工作，不能直接并推挽输出
- [ ] 三态总线：同一时刻只许一个驱动，其余高阻
- [ ] 竞争冒险看「$A+\bar A$ 型」，不是所有毛刺都叫冒险

自检：一个 OD 门上拉到 3.3 V，要求高电平不低于 3.0 V、拉电流 1 mA，上拉电阻最大多少？（答案：$R_p \le (3.3-3.0)/1\text{ mA} = 300\ \Omega$）
