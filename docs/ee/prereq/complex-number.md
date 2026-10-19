---
title: 复数与相量运算
---

# 复数与相量运算

复数的四种写法（做电路题时来回切换是基本功）：

$$
A = a + jb = |A|(\cos\varphi + j\sin\varphi) = |A|e^{j\varphi} = |A|\angle\varphi
$$

换算：

$$
|A| = \sqrt{a^2+b^2},\quad \varphi = \arctan\frac{b}{a},\quad a = |A|\cos\varphi,\quad b = |A|\sin\varphi
$$

运算口诀：**加减用代数型（$a+jb$），乘除用极坐标（$|A|\angle\varphi$）**。

$$
\frac{A_1\angle\varphi_1}{A_2\angle\varphi_2} = \frac{A_1}{A_2}\angle(\varphi_1-\varphi_2)
\qquad
j = 1\angle 90^\circ,\quad \frac{1}{j} = -j
$$

**相量**就是表示正弦量的复数：$\dot U = U\angle\psi$（用**有效值**作模）。

> 完整内容见 [08 · 正弦量与相量法](../04-ac/phasor.md)
