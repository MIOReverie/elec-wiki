---
title: 变压器变比
---

# 变压器变比

$$
\frac{U_1}{U_2} \approx \frac{N_1}{N_2} = k \qquad \frac{I_1}{I_2} \approx \frac{1}{k} \qquad Z_{in} = k^2 Z_L
$$

三条关系对应三个用途：**变电压、变电流、变阻抗**。

原理：

- 空载：$u_1 \to$ 交变磁通 $\Phi \to$ 感应 $e_1 = -N_1\frac{d\Phi}{dt}$，$e_2 = -N_2\frac{d\Phi}{dt}$ → $U_1/U_2 = N_1/N_2$
- 负载时 $I_2$ 产生去磁磁动势，$I_1$ 自动增大来抵消 → 主磁通基本不变

::: warning
变压器**只能变交流**。接直流时磁通不变化 → 副边无感应电压 → 原边电流仅受绕组电阻限制 → 烧毁。
:::

> 完整内容见 [15 · 变压器](../06-machine/transformer.md)
