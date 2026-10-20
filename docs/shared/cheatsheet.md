---
title: 公式速查表
description: 电工学、数字电路、模拟电子与嵌入式开发常用公式的集中速查页，按欧姆定律与阻抗、功率与效率、暂态与一阶响应、时序与逻辑、运放与滤波、采样与调制分组，每条给出符号、SI 单位与适用前提。
outline: [2, 3]
---

# 公式速查表

<Meta time="—" level="工具" note="考前扫这一页 · 单位统一用 SI 基本单位" />

::: tip 用法
Ctrl/⌘ + F 直接搜关键词（"戴维南""τ""√3"）。所有默认单位：V、A、Ω、F、H、Hz、W。
:::

## 1. 基础量与定律

| 名称 | 公式 | 备注 |
| --- | --- | --- |
| 欧姆定律 | $U = RI$（关联方向） | 非关联时 $U = -RI$ |
| 电功率 | $P = UI = I^2R = U^2/R$ | $P>0$ 吸收，$P<0$ 发出 |
| 电能 | $W = Pt$ | 1 kWh = 3.6×10⁶ J |
| KCL | $\sum I = 0$ | 流入 = 流出 |
| KVL | $\sum U = 0$ | 电位升 = 电位降 |
| 电位 | $U_{ab} = V_a - V_b$ | 换参考点电位变、电压不变 |
| 电源有载 | $I = \dfrac{E}{R_0+R}$ | 端电压 $U = E - IR_0$ |
| 短路电流 | $I_{SC} = \dfrac{E}{R_0}$ | 极大，必须避免 |

## 2. 电阻网络

| 名称 | 公式 |
| --- | --- |
| 串联 | $R = \sum R_i$，分压 $U_k = \dfrac{R_k}{\sum R}U$ |
| 并联 | $\dfrac{1}{R} = \sum\dfrac{1}{R_i}$，两电阻 $R = \dfrac{R_1R_2}{R_1+R_2}$ |
| 分流 | $I_1 = \dfrac{R_2}{R_1+R_2}I$（**分子是对面**） |
| 电源变换 | $I_S = \dfrac{E}{R_0}$，$E = I_SR_0$，$R_0$ 不变 |
| Y→△ | $R_{12} = R_1+R_2+\dfrac{R_1R_2}{R_3}$ |
| △→Y | $R_1 = \dfrac{R_{12}R_{31}}{R_{12}+R_{23}+R_{31}}$ |
| 对称 | $R_\triangle = 3R_Y$ |
| 结点电压法 | $G_{kk}V_k - \sum G_{kj}V_j = I_{Sk}$（自导正、互导负） |
| 弥尔曼定理 | $V = \dfrac{\sum E_i/R_i}{\sum 1/R_i}$ |

## 3. 电路定理

| 定理 | 公式 / 要点 |
| --- | --- |
| 叠加定理 | 各独立源单独作用之和；电压源短路、电流源开路、**受控源保留**；**功率不可叠加** |
| 戴维南 | $\dot U_{OC}$ 串 $R_{eq}$；$R_{eq} = U_{OC}/I_{SC}$ |
| 诺顿 | $I_{SC}$ 并 $R_{eq}$ |
| 最大功率 | $R_L = R_{eq}$，$P_{max} = \dfrac{U_{OC}^2}{4R_{eq}}$（η = 50%） |
| 共轭匹配（交流） | $Z_L = Z_{eq}^*$ |

## 4. 储能元件与暂态

| 名称 | 公式 |
| --- | --- |
| 电容 VAR | $i = C\dfrac{du}{dt}$，$W_C = \dfrac12 Cu^2$ |
| 电感 VAR | $u = L\dfrac{di}{dt}$，$W_L = \dfrac12 Li^2$ |
| 换路定则 | $u_C(0_+) = u_C(0_-)$，$i_L(0_+) = i_L(0_-)$ |
| **三要素法** | $f(t) = f(\infty) + [f(0_+)-f(\infty)]e^{-t/\tau}$ |
| RC 时间常数 | $\tau = R_{eq}C$ |
| RL 时间常数 | $\tau = \dfrac{L}{R_{eq}}$ |
| 完成度 | $1\tau\!\to\!63.2\%$，$3\tau\!\to\!95\%$，$5\tau\!\to\!99.3\%$ |

## 5. 正弦交流

| 名称 | 公式 |
| --- | --- |
| 三要素 | $u = U_m\sin(\omega t+\psi)$，$\omega = 2\pi f = \dfrac{2\pi}{T}$ |
| 有效值 | $U = \dfrac{U_m}{\sqrt2}$，$I = \dfrac{I_m}{\sqrt2}$ |
| 相量 | $\dot U = U\angle\psi$（模用有效值） |
| 阻抗 | $Z = R+jX = \|Z\|\angle\varphi$ |
| 感抗 / 容抗 | $X_L = \omega L$，$X_C = \dfrac{1}{\omega C}$ |
| 串联阻抗 | $Z = R + j(X_L-X_C)$，$\lvert Z\rvert = \sqrt{R^2+X^2}$，$\varphi = \arctan\dfrac{X}{R}$ |
| 电压三角形 | $U = \sqrt{U_R^2 + (U_L-U_C)^2}$ |
| 有功功率 | $P = UI\cos\varphi = I^2R$ |
| 无功功率 | $Q = UI\sin\varphi = I^2X$ |
| 视在功率 | $S = UI$，$S^2 = P^2+Q^2$ |
| 功率因数 | $\cos\varphi = \dfrac{P}{S}$ |
| 补偿电容 | $C = \dfrac{P(\tan\varphi_1-\tan\varphi_2)}{\omega U^2}$ |
| 串联谐振 | $\omega_0 = \dfrac{1}{\sqrt{LC}}$，$Q = \dfrac{\omega_0 L}{R}$，$BW = \dfrac{f_0}{Q}$ |
| 谐振特征 | $Z=R$ 最小、$I$ 最大、$U_L=U_C=QU$ |

## 6. 三相电路

| 名称 | 公式 |
| --- | --- |
| 同步转速（电机） | $n_0 = \dfrac{60f}{p}$ |
| **Y 接** | $U_l = \sqrt3 U_p$，$I_l = I_p$，$\dot U_{AB} = \sqrt3\dot U_A\angle 30^\circ$ |
| **△ 接** | $U_l = U_p$，$I_l = \sqrt3 I_p$ |
| 三相有功 | $P = \sqrt3 U_l I_l\cos\varphi = 3U_p I_p\cos\varphi$ |
| 三相无功 / 视在 | $Q = \sqrt3 U_l I_l\sin\varphi$，$S = \sqrt3 U_l I_l$ |
| 两表法 | $P = P_1+P_2$，$\tan\varphi = \sqrt3\dfrac{P_1-P_2}{P_1+P_2}$ |
| 中性点位移 | $\dot U_{N'N} = \dfrac{\sum \dot U_k/Z_k}{\sum 1/Z_k}$ |

## 7. 磁路与变压器

| 名称 | 公式 |
| --- | --- |
| 磁路欧姆定律 | $\Phi = \dfrac{NI}{l/(\mu S)}$ |
| 安培环路定律 | $Hl = NI$，$B = \mu H$，$\Phi = BS$ |
| 感应电动势 | $U \approx E = 4.44 fN\Phi_m$ |
| **变电压** | $\dfrac{U_1}{U_2} = \dfrac{N_1}{N_2} = k$ |
| **变电流** | $\dfrac{I_1}{I_2} = \dfrac{1}{k}$ |
| **变阻抗** | $Z_{in} = k^2 Z_L$ |
| 效率 | $\eta = \dfrac{P_2}{P_2+P_{Fe}+P_{Cu}}$ |

## 8. 异步电动机

| 名称 | 公式 |
| --- | --- |
| 同步转速 | $n_0 = \dfrac{60f}{p}$（50Hz：1→3000，2→1500，3→1000，4→750） |
| **转差率** | $s = \dfrac{n_0-n}{n_0}$（额定 2%~6%，堵转 1） |
| 转子频率 | $f_2 = sf_1$ |
| 转子电流 | $I_2 = \dfrac{sE_{20}}{\sqrt{R_2^2+(sX_{20})^2}}$ |
| 转矩 | $T = K\dfrac{sR_2U_1^2}{R_2^2+(sX_{20})^2}$，**$T\propto U_1^2$** |
| Kloss 公式 | $T = \dfrac{2T_{max}}{s/s_m + s_m/s}$，$s_m = \dfrac{R_2}{X_{20}}$ |
| 输入功率 | $P_1 = \sqrt3 U_N I_N\cos\varphi_N$ |
| 输出功率 | $P_N = \eta_N P_1$ |
| Y-△ 启动 | 电流与转矩都是直接启动的 **1/3** |

## 9. 整流与稳压

| 名称 | 公式 |
| --- | --- |
| 半波整流 | $U_{dc} = 0.45U_2$ |
| 桥式全波 | $U_{dc} = 0.9U_2$ |
| 滤波取值 | $RC \ge (3\sim5)\dfrac{T}{2}$ |
| 纹波 | $\Delta U \approx \dfrac{I}{f_rC}$（全波 $f_r = 2f$） |
| 二极管反压 | 桥式 $\sqrt2U_2$；带中心抽头全波 $2\sqrt2U_2$ |
| 555 多谐振荡 | $f = \dfrac{1.43}{(R_1+2R_2)C}$ |
| 555 单稳态 | $t_W = 1.1RC$ |

## 10. 数字电路

| 名称 | 公式 |
| --- | --- |
| 德摩根 | $\overline{A+B} = \bar A\bar B$，$\overline{AB} = \bar A+\bar B$ |
| 吸收律 | $A+AB = A$，$A+\bar AB = A+B$，$AB+\bar AC+BC = AB+\bar AC$ |
| D 触发器 | $Q^{n+1} = D$ |
| JK 触发器 | $Q^{n+1} = J\bar Q^n + \bar K Q^n$ |
| T 触发器 | $Q^{n+1} = T\bar Q^n + \bar TQ^n$ |
| 译码器实现函数 | $Y = \overline{\prod \bar Y_i}$（$i$ 取最小项下标） |
| 二进制计数分频 | $Q_i$ 频率 = $\dfrac{f_{CLK}}{2^{i+1}}$ |

## 11. 常用常数与单位

| 量 | 值 / 换算 |
| --- | --- |
| 工频 | $f = 50\text{ Hz}$，$T = 20\text{ ms}$，$\omega = 314\text{ rad/s}$ |
| 民用 | 相电压 220 V，线电压 380 V（$\sqrt3$ 倍） |
| 峰值 | $\sqrt2 \approx 1.414$，220 V 峰值 ≈ 311 V |
| 单位前缀 | k=10³，M=10⁶，m=10⁻³，µ=10⁻⁶，n=10⁻⁹，p=10⁻¹² |
| 安全电压 | 一般 36 V；潮湿/金属容器 12 V |
| 人体 | 摆脱电流 ≈ 10 mA；漏电保护动作 30 mA |
| 硅二极管 | 导通压降 ≈ 0.7 V（锗 0.3 V） |

## 12. 符号约定

| 符号 | 含义 |
| --- | --- |
| $U$ / $I$（大写） | **有效值**或直流量 |
| $u$ / $i$（小写） | **瞬时值** |
| $U_m$ / $I_m$ | **幅值**（最大值） |
| $\dot U$ / $\dot I$（加点） | **相量**（复数） |
| $U_l$、$U_p$ | 线电压、相电压 |
| $E$ | 电动势 / 电源理想电压 |
| $R_0$ | 电源内阻 |
| $R_{eq}$ | 等效（戴维南）电阻 |
| $\tau$ | 时间常数 |
| $\varphi$、$\psi$ | 阻抗角/功率因数角、初相位 |
| $s$ | 转差率 |
| $k$ | 变压器变比 $N_1/N_2$ |
