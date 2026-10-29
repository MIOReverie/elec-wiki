---
title: DMA 与缓存一致性
description: DMA 搬运的三种模式、CPU 不参与的边界，以及带 D-Cache 的芯片上漏掉 Cache 维护会读到什么。
---

# DMA 与缓存一致性

<Meta time="5 min" level="卡片" note="带 D-Cache 的芯片上漏掉 Cache 维护，读到的是上一批数据" />

STM32H7 上用 DMA 循环采 ADC，输入明明在变，屏幕上的数字却几乎不动，偶尔跳一下。硬件没坏，是 CPU 读到了 Cache 里的旧行。

DMA（Direct Memory Access，直接存储器访问）是独立于 CPU 的搬运工：外设数据就绪后，它自动把数据搬进内存（或反向搬出去），全程不占 CPU。也正因为它绕开 CPU 直接读写内存，在带 D-Cache 的芯片上就多出一道要软件自己补的工序。

麻烦的地方在于，Cache 带来的性能和「读到的值是旧的」这两件事同时存在，而后一件平时看不出来，只在调试时咬人。

三种常用模式：Normal（搬完就停）、Circular（循环搬，连续采样必备）、双缓冲（一半装满触发一次，可以做流水线）。

## 收益有多大

100 kHz 采样，若每次转换完成都进中断，CPU 每秒被打断 10 万次；改用 DMA 循环模式，CPU 只在「一批收满」时才被打扰一次。

按每点 12 位算：中断方式在 100 kHz 下每秒 10 万次进入；DMA 循环缓冲开到 1000 点，每秒只进 100 次中断，少了 1000 倍。

## 一致性怎么维护

带 D-Cache 的芯片（STM32F7/H7、M7 内核）上，DMA 直接写内存，CPU 的 Cache 里还是旧值；反过来 CPU 刚写完的数据可能滞留在 Cache 里，DMA 读不到。

所以要软件显式动手：DMA 写内存之后、CPU 读之前，把对应区域 Invalidate（失效）；CPU 写内存之后、DMA 读之前，做一次 Clean（回写）。

STM32F7 的 D-Cache 行大小是 32 字节。做 Cache 操作时地址必须按 32 字节对齐、长度取 32 的整数倍，否则失效范围不完整。

- CPU 读 DMA 缓冲前：`SCB_InvalidateDCache_by_Addr(addr, size)`；
- CPU 写完缓冲、DMA 要读时：`SCB_CleanDCache_by_Addr(addr, size)`。

顺带一句：M7 的 AXI 总线带宽远高于 DMA 请求速率，DMA 的瓶颈通常不是总线，而是数据量与内存布局。

## 常见坑

- 在带 Cache 的芯片上用 DMA，却没做 Cache 维护，读到的永远是上一批数据。
- Cache 操作地址没按 32 字节对齐，失效只覆盖半行，另半行还是脏数据。
- DMA 缓冲区放在栈上，函数一返回就失效。要放全局或静态区。
- 环形缓冲区的写指针与读指针不是原子操作，多字节变量会被中断读到一半，需要临界区保护。
- 在 F1/F4（无 Cache）上写这套代码是多余的，但无害；反过来在 F7/H7 上漏掉就是故障，调试时几乎无法定位。移植时最容易漏的正是这一步。

::: tip 例 1 · DMA 采回来的是旧数据，怎么办 {#ex-dma-cache-1}

现象：STM32H7 上用 DMA 循环采 ADC，示波器看到输入在变，但屏幕上数字几乎不动，偶尔跳一下。

原因：H7 的 D-Cache 是写回（write-back）的。DMA 把新数据直接写进 SRAM，不经过 Cache；CPU 读的时候命中的是 Cache 里的旧行，只要那个行还没被替换，CPU 就一直读到旧值。

处理分三步，缺一不可：

1. DMA 缓冲区放在全局数组里，且起始地址按 32 字节对齐（用 `__attribute__((aligned(32)))`）；
2. DMA 一批搬完（回调里），Clean 不必要，Invalidate 该区域：
   `SCB_InvalidateDCache_by_Addr((uint32_t*)buf, sizeof(buf));`
3. 之后 CPU 才去读 `buf`。

> **为什么这么想**
> Cache 是一份本地副本，DMA 是外来的写入者。它不知道 Cache 存在，也不通知 Cache，于是本地副本与真实内存分家。Invalidate 就是命令 CPU：别信你的副本了，下次去内存取。

:::

> 深入：完整内容见 [10 · ADC 与 DMA](../embedded/adc-dma.md)
