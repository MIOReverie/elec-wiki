<script setup lang="ts">
import { computed } from 'vue'
import {
  svg, wire, sourceDC, sourceAC, sourceI, resistor, capacitor, inductor,
  dot, txt, sub, arrow, arrow2, seg, sw, diode, coil, motor, rect
} from '../../lib/schematic'

const props = defineProps<{
  kind: 'node-loop' | 'source-transform' | 'thevenin' | 'superpose' | 'rlc-series' | 'pf-comp'
    | 'wye-delta' | 'transformer-eq' | 'relay-lock' | 'ladder' | 'bridge-rectifier' | 'rc-charge'
  title?: string
  note?: string
}>()

/**
 * 画图纪律（与 lib/schematic.ts 约定一致）：
 * 1. 所有元件一律用 seg(起, 止) 放置，引线由库自动补齐，绝不手算元件坐标；
 * 2. 回路每条边只能是「一个 seg」或「一条 wire」，不能既画整边又放元件（会重叠）；
 * 3. 横平竖直优先；斜线只走 45°/60°（本图斜边都用等 delta 或 √3 比例）；
 * 4. T 型结点（≥3 根线相交）必须补 dot；两线相交的拐角不补；
 * 5. 出图不带网格。
 */

/** KCL：对结点（点）；KVL：对回路（圈）。一句话本质 + 一张对照图 */
function nodeLoop(): string {
  let s = ''
  // —— 左：结点（KCL）——
  const nx = 130, ny = 112
  s += dot(nx, ny, 4)
  s += wire(nx, ny, nx, 52)                                  // 上支路（电流流入）
  s += arrow(nx, 78, nx, 102)
  s += wire(nx, ny, 66, 170)                                 // 左下支路（流出）
  s += arrow(108, 132, 89, 149)
  s += wire(nx, ny, 194, 170)                                // 右下支路（流出）
  s += arrow(152, 132, 171, 149)
  s += sub(148, 68, 'I', '1', { anchor: 'start', size: 13 })
  s += sub(94, 150, 'I', '2', { anchor: 'end', size: 13 })
  s += sub(166, 150, 'I', '3', { anchor: 'start', size: 13 })
  s += txt(nx, 30, 'KCL · 对结点', { size: 13, weight: 700 })
  s += txt(nx, 196, 'ΣI入 = ΣI出', { size: 12, color: 'var(--vp-c-text-3)' })
  // —— 中：分隔 ——
  s += '<line x1="310" y1="40" x2="310" y2="180" stroke-dasharray="4 4"/>'
  // —— 右：回路（KVL）—— 四边各是一个整体，避免边线与元件引线重叠
  s += seg('resistor', 400, 62, 560, 62, { label: 'R₁' })     // 顶边
  s += seg('sourceDC', 560, 62, 560, 152, { label: 'E' })     // 右边（+ 在上）
  s += seg('resistor', 400, 152, 560, 152, { label: 'R₂' })   // 底边
  s += wire(400, 62, 400, 152)                                // 左边
  s += arrow(400, 100, 400, 138)                              // 电流参考方向（沿左支路向下，与 E 的实际驱动方向一致）
  s += txt(386, 119, 'I', { anchor: 'end', size: 12, italic: true })
  s += txt(480, 30, 'KVL · 对回路', { size: 13, weight: 700 })
  s += txt(480, 196, 'ΣU升 = ΣU降', { size: 12, color: 'var(--vp-c-text-3)' })
  return svg(680, 215, s)
}

/** 电源等效变换：电压源串 R₀ ⇄ 电流源并 R₀。端子 A、B 不变，R₀ 始终保留 */
function sourceTransform(): string {
  let s = ''
  // —— 左：电压源 E 串 R₀（A 上 B 下）——
  s += txt(110, 28, '电压源 E 串 R₀', { size: 12.5, weight: 700 })
  s += dot(110, 60, 4); s += txt(94, 60, 'A', { anchor: 'end', size: 13, weight: 700 })
  s += seg('sourceDC', 110, 60, 110, 150, { label: 'E' })     // + 在 A 侧
  s += seg('resistor', 110, 150, 110, 240, { label: 'R₀' })
  s += dot(110, 240, 4); s += txt(94, 240, 'B', { anchor: 'end', size: 13, weight: 700 })
  // —— 中：⇄ ——
  s += arrow2(300, 150, 392, 150)
  s += txt(346, 136, '等效', { size: 12, color: 'var(--vp-c-text-3)' })
  // —— 右：电流源 I_S 并 R₀（同一对端子 A、B）——
  s += txt(525, 28, '电流源 I_S 并 R₀', { size: 12.5, weight: 700 })
  const yT = 90, yB = 210
  s += wire(440, yT, 610, yT); s += wire(440, yB, 610, yB)
  s += dot(440, yT, 4); s += txt(424, yT, 'A', { anchor: 'end', size: 13, weight: 700 })
  s += dot(440, yB, 4); s += txt(424, yB, 'B', { anchor: 'end', size: 13, weight: 700 })
  s += seg('sourceI', 480, yT, 480, yB, { label: 'I_S', dir: -1 })   // 电流向上：从 B 流向 A，与电压源同向输出
  s += seg('resistor', 580, yT, 580, yB, { label: 'R₀' })
  ;[480, 580].forEach(x => { s += dot(x, yT, 3.5); s += dot(x, yB, 3.5) })
  s += txt(340, 258, '端子 A、B 不变 · R₀ 在两种模型里都保留 · I_S = E / R₀', {
    size: 12, color: 'var(--vp-c-text-3)'
  })
  return svg(680, 280, s)
}

/** 戴维南：切割电路 → 只讨论衔接点 A、B 两端等效；可多次切割 */
function thevenin(): string {
  let s = ''
  // —— 左：原含源网络 + 负载 ——
  s += txt(130, 68, '原电路', { size: 12, weight: 700 })
  s += rect(60, 84, 140, 106)
  s += txt(130, 137, '含源网络 N', { size: 12.5, weight: 700 })
  s += dot(200, 114, 4); s += txt(210, 114, 'A', { anchor: 'start', size: 13, weight: 700 })
  s += dot(200, 160, 4); s += txt(210, 160, 'B', { anchor: 'start', size: 13, weight: 700 })
  s += wire(200, 114, 250, 114); s += wire(200, 160, 250, 160)
  s += seg('resistor', 250, 114, 250, 160, { label: 'R_L' })
  // 切割虚线
  s += '<line x1="226" y1="64" x2="226" y2="212" stroke-dasharray="5 4" stroke-width="1.6"/>'
  s += txt(226, 54, '切割', { size: 12, color: 'var(--vp-c-brand-1)', weight: 700 })
  // —— 右箭头 ——
  s += arrow(300, 137, 372, 137)
  // —— 右：等效 U_OC 串 R_eq ——
  s += txt(485, 68, '戴维南等效', { size: 12, weight: 700 })
  s += dot(450, 94, 4); s += txt(436, 94, 'A', { anchor: 'end', size: 13, weight: 700 })
  s += seg('sourceDC', 450, 94, 450, 154, { label: 'U_OC' })   // + 在 A 侧
  s += seg('resistor', 450, 154, 450, 234, { label: 'R_eq' })
  s += dot(450, 234, 4); s += txt(436, 234, 'B', { anchor: 'end', size: 13, weight: 700 })
  s += wire(450, 94, 520, 94); s += wire(450, 234, 520, 234)
  s += seg('resistor', 520, 94, 520, 234, { label: 'R_L' })
  s += txt(340, 258, '切割后只讨论 A、B 两端：U_OC、R_eq 由所切网孔回路决定（先算回路电流，再 KVL 写 U_AB）；可多次切割', {
    size: 11.5, color: 'var(--vp-c-text-3)'
  })
  return svg(680, 280, s)
}

/** 叠加：对单个电源分析，其余电压源→短路、电流源→开路，再叠加 */
function superpose(): string {
  let s = ''
  // 每个子电路：一个矩形回路，顶边 R，左边 E₁（+在上），右边 E₂（+在下，两源互助）
  const draw = (ox: number, mode: 'both' | 'e1' | 'e2') => {
    let t = ''
    const L = ox, R = ox + 130
    t += seg('resistor', L, 70, R, 70, { label: 'R' })
    t += wire(L, 160, R, 160)
    if (mode === 'both' || mode === 'e1') {
      t += seg('sourceDC', L, 70, L, 160, { label: 'E₁' })
    } else {
      t += wire(L, 70, L, 160)
      t += txt(L + 10, 115, 'E₁ 短路', { size: 10, anchor: 'start', color: 'var(--vp-c-text-3)' })
    }
    if (mode === 'both' || mode === 'e2') {
      t += seg('sourceDC', R, 160, R, 70, { label: 'E₂' })
    } else {
      t += wire(R, 70, R, 160)
      t += txt(R - 10, 115, 'E₂ 短路', { size: 10, anchor: 'end', color: 'var(--vp-c-text-3)' })
    }
    return t
  }
  s += draw(40, 'both')
  s += txt(105, 48, '两源同作用', { size: 11.5, anchor: 'middle' })
  s += txt(197, 115, '+', { size: 22, weight: 700 })
  s += draw(225, 'e1')
  s += txt(290, 48, '仅 E₁ 作用', { size: 11.5, anchor: 'middle' })
  s += txt(382, 115, '+', { size: 22, weight: 700 })
  s += draw(410, 'e2')
  s += txt(475, 48, '仅 E₂ 作用', { size: 11.5, anchor: 'middle' })
  s += txt(340, 205, '电压源 → 短路（导线），电流源 → 开路；分别计算同一元件的响应，再代数叠加（功率不能叠加）', {
    size: 11.5, color: 'var(--vp-c-text-3)'
  })
  return svg(680, 235, s)
}

/** RLC 串联：同一电流 I 依次流过 R、L、C。强调「串联=电流相同」这一前提 */
function rlcSeries(): string {
  let s = ''
  const yT = 80, yB = 160
  s += seg('sourceAC', 60, yT, 60, yB, { label: 'U' })        // 左侧交流电源（竖直）
  s += seg('resistor', 60, yT, 200, yT, { label: 'R' })       // 顶边
  s += wire(200, yT, 350, yT)                                  // 顶边余段
  s += wire(350, yT, 350, yB)                                  // 右缘
  s += wire(350, yB, 290, yB)                                  // 底边右段
  s += seg('capacitor', 290, yB, 220, yB, { label: 'C' })      // 底边电容
  s += wire(220, yB, 190, yB)
  s += seg('inductor', 190, yB, 120, yB, { label: 'L' })       // 底边电感
  s += wire(120, yB, 60, yB)                                   // 底边左段
  s += arrow(240, yT, 295, yT)                                 // 电流参考方向
  s += txt(267, yT - 15, 'İ', { size: 12, italic: true })
  s += txt(215, 190, '电流相同 → 以 İ 为参考相量：U_R 同相、U_L 超前 90°、U_C 滞后 90°，矢量合成得端电压', {
    size: 11.5, color: 'var(--vp-c-text-3)'
  })
  return svg(430, 210, s)
}

/** 功率因数补偿：感性负载两端并联电容。强调「并联不改负载、只动线路」 */
function pfComp(): string {
  let s = ''
  const yT = 90, yB = 160
  s += seg('sourceAC', 60, yT, 60, yB, { label: 'U' })        // 左侧交流电源（竖直）
  s += wire(60, yT, 290, yT)                                   // 上母线
  s += wire(60, yB, 290, yB)                                   // 下母线
  s += seg('inductor', 160, yT, 160, yB, { label: '感性负载' })
  s += seg('capacitor', 250, yT, 250, yB, { label: 'C' })
  ;[160, 250].forEach(x => { s += dot(x, yT, 3.5); s += dot(x, yB, 3.5) })
  s += txt(170, 190, 'İ_C 抵消负载的无功分量 → 线路总电流变小', { size: 11.5, color: 'var(--vp-c-text-3)' })
  s += txt(170, 206, '负载两端电压、İ₁、P、cosφ₁ 均不变（并联只动线路，不动负载）', { size: 11.5, color: 'var(--vp-c-text-3)' })
  return svg(340, 220, s)
}

/** 三相 Y 接（星）vs △ 接（角）：同一套三相的两种负载接法 */
function wyeDelta(): string {
  let s = ''
  // ===== 左：Y 接 —— 三条相线末端共接中性点，顶部是三个线端子（绝不相连！）=====
  s += txt(140, 20, 'Y 接（星形）', { size: 12.5, weight: 700 })
  ;[60, 140, 220].forEach((x, i) => {
    s += wire(x, 44, x, 64)
    s += txt(x, 34, ['A', 'B', 'C'][i], { size: 13, weight: 700 })
    s += seg('resistor', x, 64, x, 170, { label: ['Z_A', 'Z_B', 'Z_C'][i] })
  })
  s += wire(60, 170, 220, 170)                                 // 中性线
  ;[60, 140, 220].forEach(x => s += dot(x, 170, 3.5))
  s += txt(140, 190, 'N（中性点）', { size: 12, weight: 700 })
  s += txt(140, 214, '线电压 = √3·相电压；线电流 = 相电流', { size: 11, color: 'var(--vp-c-text-3)' })
  // ===== 右：△ 接 —— 首尾相接成三角形，60° 斜边 =====
  s += txt(460, 20, '△ 接（角形）', { size: 12.5, weight: 700 })
  const T: [number, number] = [460, 60], L: [number, number] = [385, 190], R: [number, number] = [535, 190]
  s += seg('resistor', T[0], T[1], L[0], L[1])                 // 左上边 A–B
  s += seg('resistor', T[0], T[1], R[0], R[1])                 // 右上边 A–C
  s += seg('resistor', L[0], L[1], R[0], R[1], { label: 'Z_BC' }) // 底边 B–C
  s += txt(404, 106, 'Z_AB', { size: 11, italic: true })       // 贴左上边
  s += txt(516, 106, 'Z_CA', { size: 11, italic: true })       // 贴右上边
  s += wire(T[0], T[1], T[0], 38); s += txt(448, 49, 'A', { size: 13, weight: 700, anchor: 'end' })
  s += wire(L[0], L[1], L[0] - 30, L[1]); s += txt(347, L[1], 'B', { size: 13, weight: 700, anchor: 'end' })
  s += wire(R[0], R[1], R[0] + 30, R[1]); s += txt(573, R[1], 'C', { size: 13, weight: 700, anchor: 'start' })
  ;[T, L, R].forEach(p => s += dot(p[0], p[1], 3.5))
  s += txt(460, 214, '线电压 = 相电压；线电流 = √3·相电流（滞后 30°）', { size: 11, color: 'var(--vp-c-text-3)' })
  return svg(640, 250, s)
}

/** 变压器 T 型等效电路：原边漏阻抗 + 励磁支路（Rm∥Xm）+ 折算到原边的副边 */
function transformerEq(): string {
  let s = ''
  const yT = 100, yM = 150, yB = 270
  // 主回路：U₁ → R₁ → X₁ → 结点 → R₂' → X₂' → 负载 → 回线
  s += seg('sourceAC', 50, yT, 50, 240, { label: 'U₁' })       // 原边电源（竖直）
  s += seg('resistor', 50, yT, 200, yT, { label: 'R₁' })
  s += seg('inductor', 200, yT, 350, yT, { label: 'X₁' })
  s += wire(350, yT, 400, yT)
  s += dot(400, yT, 3.5)                                        // 结点（励磁支路接入点）
  // 励磁支路：Rm 与 Xm 并联，从结点下垂到回线
  s += wire(400, yT, 400, yM)
  s += wire(370, yM, 430, yM)
  s += dot(400, yM, 3.5)
  s += seg('resistor', 370, yM, 370, yB, { label: 'R_m' })
  s += seg('inductor', 430, yM, 430, yB, { label: 'X_m' })
  s += dot(370, yB, 3.5); s += dot(430, yB, 3.5)
  // 折算副边 + 负载
  s += wire(400, yT, 450, yT)
  s += seg('resistor', 450, yT, 560, yT, { label: "R₂'" })
  s += seg('inductor', 560, yT, 670, yT, { label: "X₂'" })
  s += wire(670, yT, 690, yT)
  s += seg('resistor', 690, yT, 690, yB, { label: 'Z_L' })      // 右侧竖直负载
  // 回线
  s += wire(690, yB, 50, yB)
  s += wire(50, yB, 50, 240)
  // 理想变压器边界（虚线）
  s += '<line x1="425" y1="72" x2="425" y2="292" stroke-dasharray="5 4"/>'
  s += txt(425, 60, '理想变压器', { size: 10, color: 'var(--vp-c-text-3)' })
  s += txt(375, 316, "副边按变比折算到原边（U₂′=kU₂、I₂′=I₂/k、R₂′=k²R₂）后，全电路变成「两串一并」", {
    size: 11, color: 'var(--vp-c-text-3)'
  })
  return svg(750, 330, s)
}

/** 电动机自锁（起保停）控制：主电路 + 控制电路 */
function relayLock(): string {
  let s = ''
  s += txt(300, 20, '电动机自锁（起保停）控制电路', { size: 13, weight: 700 })
  // ===== 主电路：L1/L2/L3 → QS → FU → KM 主触点 → M =====
  const px = [150, 210, 270]
  px.forEach((x, i) => {
    s += txt(x, 36, ['L1', 'L2', 'L3'][i], { size: 12, weight: 700 })
    s += wire(x, 44, x, 48)
    s += seg('sw', x, 48, x, 92, { kind: 'spst', closed: false })    // QS 闸刀开关
    s += wire(x, 92, x, 100)
    s += seg('fuse', x, 100, x, 144)                                  // FU 熔断器
    s += wire(x, 144, x, 156)
    s += seg('sw', x, 156, x, 200, { kind: 'cont', closed: false })   // KM 主触点（常开）
    s += wire(x, 200, x, 225)
  })
  s += '<line x1="158" y1="70" x2="278" y2="70" stroke-dasharray="4 3" opacity=".6"/>'
  s += txt(140, 70, 'QS', { size: 12, italic: true, anchor: 'end' })
  s += txt(140, 122, 'FU', { size: 12, italic: true, anchor: 'end' })
  s += '<line x1="158" y1="178" x2="278" y2="178" stroke-dasharray="4 3" opacity=".6"/>'
  s += txt(140, 178, 'KM', { size: 12, italic: true, anchor: 'end' })
  s += txt(292, 178, '主触点', { size: 11, anchor: 'start', color: 'var(--vp-c-text-3)' })
  // 电机：三相经接线排汇入 M
  s += wire(150, 225, 270, 225)
  ;[150, 270].forEach(x => s += dot(x, 225, 3.5))
  s += dot(210, 225, 3.5)
  s += wire(210, 225, 210, 232)
  s += motor(210, 250)
  // ===== 控制电路：L1 → SB1(常闭) → [KM 常开 ∥ SB2] → KM 线圈 → L2 =====
  const cy = 320
  s += txt(48, 300, '控制电路', { size: 11, weight: 700, color: 'var(--vp-c-text-3)' })
  s += wire(60, cy, 90, cy)
  s += txt(52, cy, 'L1', { size: 12, weight: 700, anchor: 'end' })
  s += seg('sw', 90, cy, 170, cy, { kind: 'button', nc: true, label: 'SB1 停止' })  // 停止：常闭按钮
  s += wire(170, cy, 195, cy)
  s += dot(195, cy, 3.5)
  // 自锁并联支路：只跨 SB2，不框 SB1
  s += wire(195, cy, 195, 288)
  s += seg('sw', 195, 288, 275, 288, { kind: 'cont', closed: false })                // KM 辅助常开
  s += txt(285, 288, 'KM 常开', { size: 11, italic: true, anchor: 'start' })
  s += wire(275, 288, 275, cy)
  s += dot(275, cy, 3.5)
  s += seg('sw', 195, cy, 275, cy, { kind: 'button', closed: false, label: 'SB2 起动' }) // 起动：常开按钮
  s += wire(275, cy, 320, cy)
  s += seg('coil', 320, cy, 400, cy, { label: 'KM', inside: true })                  // KM 线圈
  s += wire(400, cy, 440, cy)
  s += wire(440, cy, 440, 350)
  s += wire(440, 350, 60, 350)
  s += txt(52, 350, 'L2', { size: 12, weight: 700, anchor: 'end' })
  s += txt(300, 374, '按 SB2 → KM 吸合 → 辅助触点闭合自锁，松开 SB2 仍运转；按 SB1 → 断电释放', {
    size: 11, color: 'var(--vp-c-text-3)'
  })
  s += txt(300, 390, '自锁支路只跨接起动按钮 SB2 —— 绝不能把停止按钮 SB1 框进并联支路，否则停止失效', {
    size: 11, color: 'var(--vp-c-text-3)'
  })
  return svg(600, 400, s)
}

/** PLC 梯形图：左母线 → 触点串联 → 线圈 → 右母线 */
function ladder(): string {
  let s = ''
  s += wire(120, 60, 120, 230)                                  // 左母线
  s += wire(400, 60, 400, 230)                                  // 右母线
  s += txt(120, 48, '左母线', { size: 11, color: 'var(--vp-c-text-3)' })
  s += txt(400, 48, '右母线', { size: 11, color: 'var(--vp-c-text-3)' })
  // 梯级 1：X0 常开 → X1 常闭 → Y0
  s += wire(120, 110, 160, 110)
  s += seg('sw', 160, 110, 225, 110, { kind: 'cont', closed: false, label: 'X0 常开' })
  s += wire(225, 110, 260, 110)
  s += seg('sw', 260, 110, 325, 110, { kind: 'cont', nc: true, label: 'X1 常闭' })
  s += wire(325, 110, 360, 110)
  s += seg('coil', 360, 110, 400, 110, { label: 'Y0', inside: true })
  // 梯级 2：X2 常开 → X3 常开 → Y1
  s += wire(120, 170, 160, 170)
  s += seg('sw', 160, 170, 225, 170, { kind: 'cont', closed: false, label: 'X2 常开' })
  s += wire(225, 170, 260, 170)
  s += seg('sw', 260, 170, 325, 170, { kind: 'button', closed: false, label: 'X3' })
  s += wire(325, 170, 360, 170)
  s += seg('coil', 360, 170, 400, 170, { label: 'Y1', inside: true })
  s += txt(260, 254, '梯形图是扫描执行的逻辑程序，不是实物接线：触点是输入映像，线圈是输出映像', {
    size: 11, color: 'var(--vp-c-text-3)'
  })
  return svg(520, 275, s)
}

/** 桥式整流：四个二极管组成电桥，交流两侧进、直流上下出 */
function bridgeRectifier(): string {
  let s = ''
  const T: [number, number] = [230, 70], R: [number, number] = [330, 170], B: [number, number] = [230, 270], L: [number, number] = [130, 170]
  // 四个二极管：seg 的起止点按「导通时的电流方向」排序（阳极 → 阴极），dir 默认 1 即可
  s += seg('diode', L[0], L[1], T[0], T[1])                     // D₁：正半周 L→T
  s += seg('diode', R[0], R[1], T[0], T[1])                     // D₂：负半周 R→T
  s += seg('diode', B[0], B[1], R[0], R[1])                     // D₃：正半周 B→R
  s += seg('diode', B[0], B[1], L[0], L[1])                     // D₄：负半周 B→L
  // 二极管编号：贴在各自外侧，正文用它指代导通路径
  s += txt(168, 110, 'D₁', { size: 11, italic: true, anchor: 'middle' })
  s += txt(292, 110, 'D₂', { size: 11, italic: true, anchor: 'middle' })
  s += txt(292, 232, 'D₃', { size: 11, italic: true, anchor: 'middle' })
  s += txt(168, 232, 'D₄', { size: 11, italic: true, anchor: 'middle' })
  // 负载（T→B 竖直）
  s += seg('resistor', T[0], T[1], B[0], B[1], { label: 'R_L' })
  // 四顶点结点 + 交流进线
  ;[T, R, B, L].forEach(p => s += dot(p[0], p[1], 3.5))
  s += wire(L[0], L[1], L[0] - 40, L[1]); s += txt(L[0] - 48, L[1], '~', { size: 14, weight: 700, anchor: 'end' })
  s += wire(R[0], R[1], R[0] + 40, R[1]); s += txt(R[0] + 48, R[1], '~', { size: 14, weight: 700, anchor: 'start' })
  s += txt(T[0], T[1] - 16, '+', { size: 16, weight: 700 })
  s += txt(B[0], B[1] + 24, '−', { size: 16, weight: 700 })
  s += txt(230, 306, '正半周（L 为正）：L → D₁ → R_L → D₃ → R', { size: 11, color: 'var(--vp-c-text-3)' })
  s += txt(230, 322, '负半周（R 为正）：R → D₂ → R_L → D₄ → L', { size: 11, color: 'var(--vp-c-text-3)' })
  return svg(460, 340, s)
}

/** RC 充电电路：闭合开关后 u_C 按指数趋近 E */
function rcCharge(): string {
  let s = ''
  const yT = 80, yB = 170
  s += seg('sourceDC', 60, yT, 60, yB, { label: 'E' })          // 左源，+ 在上
  s += wire(60, yT, 130, yT)
  s += seg('sw', 130, yT, 200, yT, { kind: 'spst', closed: false, label: 'S' })
  s += wire(200, yT, 250, yT)
  s += seg('resistor', 250, yT, 320, yT, { label: 'R' })
  s += wire(320, yT, 360, yT)
  s += seg('capacitor', 360, yT, 360, yB, { label: 'C' })
  s += wire(360, yB, 60, yB)
  // 充电电流方向（闭合后）
  s += arrow(85, yT, 122, yT)
  s += txt(103, yT - 15, 'i', { size: 12, italic: true })
  // u_C 跨电容测量
  s += arrow2(340, yT, 340, yB)
  s += sub(332, (yT + yB) / 2, 'u', 'C', { anchor: 'end', size: 12 })
  s += txt(215, 202, 'τ = RC；u_C(t) = E(1 − e^(−t/τ))，i(t) = (E/R)·e^(−t/τ)', {
    size: 11, color: 'var(--vp-c-text-3)'
  })
  return svg(430, 225, s)
}

const inner = computed(() => {
  switch (props.kind) {
    case 'node-loop': return nodeLoop()
    case 'source-transform': return sourceTransform()
    case 'thevenin': return thevenin()
    case 'superpose': return superpose()
    case 'rlc-series': return rlcSeries()
    case 'pf-comp': return pfComp()
    case 'wye-delta': return wyeDelta()
    case 'transformer-eq': return transformerEq()
    case 'relay-lock': return relayLock()
    case 'ladder': return ladder()
    case 'bridge-rectifier': return bridgeRectifier()
    case 'rc-charge': return rcCharge()
    default: return svg(680, 120, txt(340, 60, '未知图种', { size: 13 }))
  }
})
</script>

<template>
  <figure class="fig-box">
    <div class="fig-head">
      <span class="fig-tag">电路</span>
      <span v-if="title" class="fig-title">{{ title }}</span>
    </div>
    <div class="fig-body" v-html="inner"></div>
    <figcaption v-if="note" class="fig-note">{{ note }}</figcaption>
  </figure>
</template>

<style scoped>
.fig-box {
  margin: 24px 0;
  padding: 14px 16px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.fig-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
}
.fig-tag {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 5px;
  color: #fff;
  background: var(--wiki-fig-tag-bg);
  flex: none;
}
.fig-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.fig-body :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
.fig-note {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 7px;
}
</style>
