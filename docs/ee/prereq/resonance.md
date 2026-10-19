---
title: 串联谐振
---

# 串联谐振

RLC 串联电路在 $X_L = X_C$ 时发生**串联谐振**：

$$
\omega_0 = \frac{1}{\sqrt{LC}} \qquad f_0 = \frac{1}{2\pi\sqrt{LC}}
$$

谐振时的特征：

- $X = 0$，$Z = R$ **最小**，电流 $I = U/R$ **最大**
- $\dot U$ 与 $\dot I$ **同相**，电路呈纯阻性
- $U_L = U_C = QU$，**可能远高于电源电压**（故又称电压谐振）

品质因数与选择性：

$$
Q = \frac{\omega_0 L}{R} = \frac{1}{\omega_0 C R} = \frac{1}{R}\sqrt{\frac{L}{C}}
\qquad
BW = f_2 - f_1 = \frac{f_0}{Q}
$$

$Q$ 越大 → 曲线越尖 → 选择性越好，但通频带越窄。

> 完整内容见 [11 · 谐振与频率特性](../04-ac/resonance.md)
