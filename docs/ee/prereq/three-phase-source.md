---
title: 对称三相电源
description: 三个互差 120° 的电压源为什么捆在一起用、线电压与相电压的 √3 与 30° 从哪来、中性线什么时候能省。
---

# 对称三相电源

<Meta time="5 min" level="卡片" note="√3 和 30° 只属于星形接法；三角形接法里 √3 乘在电流上" />

**对称三相电源就是三个幅值相同、频率相同、相位互差 $120^\circ$ 的正弦电压源捆在一起——它比单相强不是因为「电压更高」，而是因为三相瞬时功率之和恒定，并且能省掉一根回线。**

## 日常说法与正式定义

日常说法是「三相四线，380 / 220」。这句话里藏着一件容易糊涂的事：380 V 和 220 V 不是两个电源，而是**同一组电源的两种量法**——量两根火线之间是 380 V，量一根火线与零线之间是 220 V。

正式定义：三个电动势满足

$$
u_A = U_m\sin\omega t,\quad u_B = U_m\sin(\omega t - 120^\circ),\quad u_C = U_m\sin(\omega t + 120^\circ)
$$

即**幅值相同、频率相同、相位依次差 $120^\circ$**。这样的三个量叫对称三相。

符号先认全，后面全靠它们：

| 符号 | 含义 | 说明 |
| --- | --- | --- |
| $U_p$ | 相电压（phase voltage） | 每相绕组两端的电压，即火线对中性点 |
| $U_l$ | 线电压（line voltage） | 两根火线之间的电压 |
| $I_p$ / $I_l$ | 相电流 / 线电流 | 绕组里的电流 / 出线上的电流 |
| N | 中性线（零线） | 三个绕组的公共点引出的线 |
| 相序 | A→B→C 的先后顺序 | 反相序会让电动机反转 |

关键性质：三相对称时 $\sum u = 0$，写成相量就是 $\sum \dot U = 0$。三个等长、互差 $120^\circ$ 的相量首尾相接正好闭合一个三角形——这就是「中性线电流为零」的来源。

## √3 与 30° 是怎么冒出来的

**星形（Y）联接**：三个绕组一端接在一起（中性点），另一端引出三根火线。

$$
U_l = \sqrt3\,U_p \qquad I_l = I_p \qquad \dot U_{AB} = \sqrt3\,\dot U_A\angle 30^\circ
$$

第二条式子最好理解：星形接法里，出线上的电流就是绕组里的电流，同一条路。第一条要画图才看得清：

<FigBox title="线电压是两相电压之差，长度是 √3 倍、方向超前 30°" kind="结构" note="三相电压 A、B、C 互差 120°，端点落在一个圆上。线电压 U_AB 等于 U_A 减 U_B，几何上是从 B 的箭头尖端指向 A 的箭头尖端这一段。等腰三角形的顶角 120°，底边自然是腰长的 √3 倍；底边还正好垂直于顶角的角平分线，于是超前 A 相 30°。">

<svg viewBox="0 0 520 300" role="img" aria-label="三相相量图：A、B、C 三相互差一百二十度，线电压 U_AB 由 A 减 B 得到，长度是相电压的根号三倍">
<defs>
  <marker id="tp-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
  </marker>
  <marker id="tp-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
  </marker>
</defs>
<g font-size="12" fill="var(--vp-c-text-1)">
  <circle cx="210" cy="170" r="95" fill="none" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
  <line x1="210" y1="170" x2="305" y2="170" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#tp-a)" />
  <line x1="210" y1="170" x2="162.5" y2="252.3" stroke="var(--vp-c-brand-1)" stroke-width="2.2" marker-end="url(#tp-a)" />
  <line x1="210" y1="170" x2="162.5" y2="87.7" stroke="var(--vp-c-text-3)" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#tp-b)" />
  <line x1="162.5" y1="252.3" x2="305" y2="170" stroke="var(--vp-c-text-2)" stroke-width="2" marker-end="url(#tp-b)" />
  <text x="313" y="174">U_A</text>
  <text x="150" y="268" text-anchor="end">U_B</text>
  <text x="150" y="82" text-anchor="end" fill="var(--vp-c-text-3)">U_C</text>
  <text x="252" y="222">U_AB = U_A − U_B</text>
  <text x="238" y="146" fill="var(--vp-c-text-3)">互差 120°</text>
  <text x="210" y="20" text-anchor="middle" font-weight="700">|U_AB| = √3 |U_A|，且超前 U_A 30°</text>
  <text x="210" y="288" text-anchor="middle" fill="var(--vp-c-text-3)">220 V × √3 = 381 V ≈ 380 V；反过来 380 V ÷ √3 = 219 V</text>
</g>
</svg>

</FigBox>

**三角形（△）联接**：三个绕组首尾相接成一个环，三个接点引出三根火线。

$$
U_l = U_p \qquad I_l = \sqrt3\,I_p
$$

注意这里的对应关系正好对调：Y 接是「电压乘 √3」，△ 接是「电流乘 √3」。

::: warning 常见误解一：以为 380 V 和 220 V 是两个不同的电源
它们是同一组绕组的两种量法。任意两根火线之间的电压是线电压 $U_l$，任意一根火线与中性线之间是相电压 $U_p$，两者差 $\sqrt3$ 倍。所以「220 V 的电机」和「380 V 的电机」常常是**接法不同**（Y 或 △）而不是电源不同——这就是铭牌上写「220/380 V」的意思。
:::

::: warning 常见误解二：以为中性线随时可以省
$\sum \dot U = 0$ 只在**三相对称**（三个负载也一样）时成立。三相负载不对称时中性线电流不为零；一旦把中性线断开，中性点会漂移，三相电压不再均分——轻则设备欠压，重则烧毁。所以中性线上严禁装开关和熔断器。
:::

::: warning 常见误解三：把 √3 和 30° 无脑套在 △ 接上
「线电压超前相电压 $30^\circ$」只在**星形接法**下成立。三角形接法里线电压就是相电压，根本没有 $30^\circ$ 这个偏移；那里乘 $\sqrt3$ 的是电流。两套结论互为对偶，写反了整题结论都错。
:::

**为什么容易错**：因为两套公式形状对称，只有「电压」和「电流」两个词换了位置。记的时候抓住一句：**Y 接看电压（√3 倍），△ 接看电流（√3 倍）**，再从「哪两个端点是同一个点」推一遍，比死记可靠。

## 什么时候用得上

正文里凡是出现「三相」「火线零线」「电机铭牌上的 380/220」，都要先分清这句话说的是线量还是相量；三相功率 $P = \sqrt3 U_l I_l\cos\varphi$ 里那个 $\sqrt3$ 就是从这里来的。

> 详见 [12 · 三相电路](../05-three-phase/circuit.md)
