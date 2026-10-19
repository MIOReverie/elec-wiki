---
title: 对称三相电源
---

# 对称三相电源

三个**幅值相同、频率相同、相位互差 120°** 的正弦电动势：

$$
u_A = U_m\sin\omega t,\quad u_B = U_m\sin(\omega t - 120^\circ),\quad u_C = U_m\sin(\omega t + 120^\circ)
$$

关键性质：$\sum u = 0$，$\sum \dot U = 0$ → 对称时中性线电流为 0。

**星形（Y）联接**：

$$
U_l = \sqrt3\,U_p \qquad I_l = I_p \qquad \dot U_{AB} = \sqrt3\,\dot U_A\angle 30^\circ
$$

**三角形（△）联接**：

$$
U_l = U_p \qquad I_l = \sqrt3\,I_p
$$

::: warning 别混
"线电压超前对应相电压 30°"只在**Y 接电源**下成立；△ 接时线电压就是相电压，没有 30°。
:::

> 完整内容见 [12 · 三相电路](../05-three-phase/circuit.md)
