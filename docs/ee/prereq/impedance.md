---
title: 阻抗与导纳
---

# 阻抗与导纳

$$
Z = R + jX = |Z|\angle\varphi \qquad Y = \frac{1}{Z} = G + jB
$$

| 元件 | 阻抗 | 大小 | 相位 |
| --- | --- | --- | --- |
| $R$ | $R$ | $R$ | 同相 |
| $L$ | $j\omega L$ | $X_L = \omega L$ | **电压超前 90°** |
| $C$ | $\dfrac{1}{j\omega C} = -\dfrac{j}{\omega C}$ | $X_C = \dfrac{1}{\omega C}$ | **电流超前 90°** |

串联：

$$
Z = R + j(X_L - X_C),\quad |Z| = \sqrt{R^2+X^2},\quad \varphi = \arctan\frac{X_L-X_C}{R}
$$

- $X_L > X_C$ → 感性；$X_L < X_C$ → 容性；相等 → 阻性（谐振）

直流（$\omega=0$）：电感短路、电容开路。

> 完整内容见 [09 · RLC 串联与阻抗](../04-ac/rlc.md)
