---
title: 布尔代数与逻辑门
---

# 布尔代数与逻辑门

基本运算：**与**（$Y=AB$）、**或**（$Y=A+B$）、**非**（$Y=\bar A$）。

常用公式：

- 德摩根：$\overline{A+B} = \bar A \cdot \bar B$，$\overline{AB} = \bar A + \bar B$
- 吸收：$A + AB = A$，$A(A+B) = A$
- 分配：$A + BC = (A+B)(A+C)$

| 门 | 表达式 | 口诀 |
| --- | --- | --- |
| 与非 | $Y = \overline{AB}$ | 有 0 出 1 |
| 或非 | $Y = \overline{A+B}$ | 有 1 出 0 |
| 异或 | $Y = A\bar B + \bar A B$ | 相异出 1 |
| 同或 | $Y = \overline{A\oplus B}$ | 相同出 1 |

三种表示互转是基本功：**真值表 ↔ 逻辑表达式 ↔ 逻辑图**。

> 完整内容见 [23 · 数字电路基础](../08-electronics/digital-basic.md)
