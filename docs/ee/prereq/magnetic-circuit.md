---
title: 磁路欧姆定律
description: 磁通、磁动势、磁阻怎么和电路一一对应，为什么零点几毫米的空气隙就能占掉大部分磁阻，以及铁磁材料让这条定律失效的地方。
---

# 磁路欧姆定律

<Meta time="5 min" level="卡片" note="形式同构但物性不同：铁磁材料的 μ 不是常数，磁阻也就不是常数；气隙的磁阻常是铁心的上千倍" />

变压器和电机的铁心上总留着一道缝，零点几毫米，用手都能摸出来。工艺不够精？恰恰相反，那道缝是设计出来的，而且它往往决定了整条磁路。

## 一条公式，三个量

磁路是磁通经过的路径。磁通、磁动势、磁阻的关系长得和欧姆定律一模一样：

$$
\Phi = \frac{F}{R_m} = \frac{NI}{\dfrac{l}{\mu S}}
$$

| 符号 | 含义 | 单位 |
| --- | --- | --- |
| $\Phi$ | 磁通（flux），穿过磁路截面的磁通量 | Wb（韦伯） |
| $F$ | 磁动势（magnetomotive force），产生磁通的「推力」 | A（安培·匝） |
| $N$ | 线圈匝数 | 匝 |
| $I$ | 线圈电流 | A |
| $R_m$ | 磁阻（reluctance） | A/Wb |
| $l$ | 磁路平均长度 | m |
| $S$ | 磁路截面积 | m² |
| $\mu$ | 磁导率（permeability） | H/m |

## 对应关系摆在一起看

| 电路量 | 磁路量 |
| --- | --- |
| 电流 $I$ | 磁通 $\Phi$ |
| 电动势 $E$ | 磁动势 $F = NI$ |
| 电阻 $R = l/(\gamma S)$ | 磁阻 $R_m = l/(\mu S)$ |
| 欧姆定律 $I = E/R$ | $\Phi = F/R_m$ |

一句话概括这一整张表：磁通 $\Phi$ 对电流 $I$，磁动势 $F=NI$ 对电动势 $E$，磁阻 $R_m$ 对电阻 $R$，于是 $\Phi = F/R_m$ 对 $I = E/R$。公式长得一样，脾气不一样：决定磁阻的那个 $\mu$ 不是常数，$\mu$ 一饱和就往下掉，$R_m$ 跟着涨。

能这样对应，是因为两边都是「一个推动量除以一个阻力，得到一个流量」。电流在高电阻的细导线里流得小；磁通在高磁阻的空气隙里也穿得少。

配套还有三条，考试里几乎每题都要用：安培环路定律（Ampère's law）$\oint H\,dl = \sum I$，即 $Hl = NI$；$B = \mu H$；$\Phi = BS$。

其中 $H$ 是磁场强度（单位 A/m），$B$ 是磁感应强度（单位 T，特斯拉）。安培环路定律说的是「磁场强度沿一条闭合回路的积分等于穿过的电流」，和 KCL 一样属于守恒律。

<FigBox title="磁路：磁通走铁心，遇到气隙要挤过去" kind="结构" note="铁心的磁阻小，磁通几乎全走铁心；气隙的磁导率只有真空的量级，一小段气隙就能贡献大部分磁阻。所以电机和变压器的气隙长度是毫米级的设计变量。">

<svg viewBox="0 0 470 250" role="img" aria-label="带气隙的磁路：线圈绕在铁心上，气隙处磁阻大，磁通挤过气隙">
<g font-size="12" fill="var(--vp-c-text-1)">
  <path d="M 110 150 L 110 60 L 330 60 L 330 88" fill="none" stroke="var(--vp-c-text-1)" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 330 112 L 330 150 L 110 150" fill="none" stroke="var(--vp-c-text-1)" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 330 88 L 330 100" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="6"/>
  <path d="M 330 100 L 330 112" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="6"/>
  <line x1="356" y1="88" x2="356" y2="112" stroke="var(--vp-c-brand-1)" stroke-width="2.4" stroke-dasharray="3 3"/>
  <text x="366" y="100" dominant-baseline="middle" fill="var(--vp-c-brand-1)">气隙</text>
  <path d="M 130 60 L 130 30 M 160 60 L 160 30 M 190 60 L 190 30 M 220 60 L 220 30 M 250 60 L 250 30 M 280 60 L 280 30" stroke="var(--vp-c-text-2)" stroke-width="1.6"/>
  <line x1="120" y1="30" x2="290" y2="30" stroke="var(--vp-c-text-2)" stroke-width="1.6"/>
  <text x="205" y="18" text-anchor="middle" fill="var(--vp-c-text-2)">线圈 N 匝，通电流 I → 磁动势 F = NI</text>
  <text x="120" y="182" text-anchor="middle" fill="var(--vp-c-text-3)">铁心：μ 大 → 磁阻小</text>
  <text x="330" y="182" text-anchor="middle" fill="var(--vp-c-brand-1)">气隙：μ 小 → 磁阻大</text>
  <text x="235" y="216" text-anchor="middle" fill="var(--vp-c-text-3)">磁通 Φ 沿铁心闭合，被挤过气隙时才占满整个截面</text>
  <text x="235" y="240" text-anchor="middle" fill="var(--vp-c-text-3)">Φ = F / R_m，R_m = l / (μS)</text>
</g>
</svg>

</FigBox>

## 零点几毫米凭什么当主角

硅钢片的 $\mu_r \approx 1000$ 甚至更高，磁阻很小，磁通自然全挤在铁心里。气隙里只剩空气，$\mu$ 只有真空量级（$\mu_0 = 4\pi\times10^{-7}\ \text{H/m}$），于是哪怕零点几毫米，它也能占掉磁阻的大头。

算一遍最清楚。铁心长 0.2 m、截面积 $10^{-4}\ \text{m}^2$、气隙 0.5 mm：

$$
R_{m,铁} = \frac{0.2}{1000\times1.257\times10^{-6}\times10^{-4}} \approx 1.59\times10^{6}\ \text{A/Wb}
$$

$$
R_{m,隙} = \frac{0.5\times10^{-3}}{1.257\times10^{-6}\times10^{-4}} \approx 3.98\times10^{6}\ \text{A/Wb}
$$

0.5 mm 的气隙，磁阻是 0.2 m 铁心的 2.5 倍。电机、变压器的气隙长度要做成精密控制量，原因就在这两个数字里。

## 五个坑

1. 把磁阻当常数。铁磁材料的 $\mu$ 随磁场强度变，磁路一饱和，磁阻显著变大，照着算出的磁通会偏大。
2. 以为磁通走直线最短、漏磁可以不管。绕组外面也有磁路，这里的公式只算主磁通。
3. 把 $B$ 和 $H$ 混为一谈。$H$ 是 A/m，$B$ 是 T，中间隔着 $\mu$，单位一错整题就废。
4. 以为气隙可以忽略。事实往往相反，气隙就是磁阻的大头。
5. 以为磁路也遵守「电压降等于电压升」。磁路里对应的是安培环路定律 $\oint H\,dl = \sum I$，不是 KVL。

## 例题

::: tip 例 1 · 气隙磁路求磁通
题目：一个 U 形铁心上绕 $N=1000$ 匝线圈，线圈电流 $I=0.5\ \text{A}$。铁心平均长度 0.2 m，截面积 $S=10^{-4}\ \text{m}^2$，相对磁导率 $\mu_r=1000$；铁心中间有一个 0.5 mm 的气隙。求磁通 $\Phi$ 与气隙中的磁感应强度 $B$。

先想什么：气隙是磁阻的主体，铁心那一段虽然长，贡献的磁阻只有气隙的 40% 左右。两段都得算，只算一个是常见失分点。

步骤：

1. 磁动势：$F = NI = 1000\times0.5 = 500\ \text{A·匝}$。*（为什么先算 $F$：它是磁路的「电动势」，后面全靠它除以总磁阻。）*
2. 铁心磁阻（取 $\mu_0=4\pi\times10^{-7}\ \text{H/m}$）：$R_{m,铁} = \dfrac{l}{\mu_r\mu_0 S} \approx 1.59\times10^{6}\ \text{A/Wb}$。
3. 气隙磁阻：$R_{m,隙} = \dfrac{\delta}{\mu_0 S} = \dfrac{0.5\times10^{-3}}{1.257\times10^{-6}\times10^{-4}} \approx 3.98\times10^{6}\ \text{A/Wb}$。
4. 总磁阻（串联相加）：$R_m = R_{m,铁}+R_{m,隙} \approx 5.57\times10^{6}\ \text{A/Wb}$。
5. 磁通：$\Phi = \dfrac{F}{R_m} = \dfrac{500}{5.57\times10^{6}} \approx 8.98\times10^{-5}\ \text{Wb}$。
6. 气隙中的磁感应强度：$B = \dfrac{\Phi}{S} = \dfrac{8.98\times10^{-5}}{10^{-4}} \approx 0.90\ \text{T}$。

验算，换磁场强度法独立算一遍：同一条磁路上 $B$ 处处相同（铁心与气隙截面积一样），由安培环路定律 $H_{铁}l + H_{隙}\delta = F$、$H=B/\mu$，得

$$
B = \frac{F}{\dfrac{l}{\mu_r\mu_0}+\dfrac{\delta}{\mu_0}} = \frac{500}{159.2+397.9} \approx 0.90\ \text{T}
$$

与第 6 步一致 ✓。注意这个式子和第 5 步是同一个 $F/R_m$，只是没除以 $S$ 就直接给了 $B$，因为 $B=\Phi/S$。

注意：$B\approx0.9\ \text{T}$ 已经接近硅钢片磁路的饱和区（典型饱和值 1.6~2.0 T），再加大电流就会明显饱和，$\mu$ 下降、磁通增长放缓。这就是非线性的体现，此时上面的线性公式只作近似。
:::

## 变压器与电机的起点

> 完整内容见 [15 · 磁路基础](../06-machine/magnetic.md)

「变压器为什么要有气隙」「电机的磁通怎么算」「漏磁通和主磁通差在哪」「铁心为什么非用硅钢片」，这类问题都回到这张卡。变压器的变比、异步电动机的转差率与转矩，推导都挂在这条 $\Phi = F/R_m$ 上。
