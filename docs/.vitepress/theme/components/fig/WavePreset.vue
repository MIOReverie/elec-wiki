<script setup lang="ts">
import { computed } from 'vue'
import WaveChart from './WaveChart.vue'
import { curve, waves, type Pt } from '../../lib/wave'

/**
 * 预设波形图：把教材里最常见的那些"必须看图才懂"的曲线做成开箱即用的组件。
 * 全部由数学计算生成，不含手工布局，不会出现对不齐的问题。
 */
const props = withDefaults(
  defineProps<{
    kind:
      | 'threephase'
      | 'rc'
      | 'rl'
      | 'resonance'
      | 'magnetize'
      | 'damped'
      | 'logic'
      | 'threewire'
      | 'source'
      | 'ladder'
      | 'loadline'
      | 'nodepot'
      | 'maxpower'
      | 'superpose'
      | 'sinesum'
      | 'reactance'
      | 'pfcurve'
      | 'qfamily'
      | 'parares'
      | 'phasorref'
      | 'powertriangle'
      | 'neutraldisp'
      | 'twowatt'
      | 'instp3'
      | 'traeff'
      | 'vadjust'
      | 'rotfield'
      | 'torslip'
      | 'startcurve'
      | 'dcmotor'
      | 'relaytime'
      | 'scancycle'
      | 'humanbody'
      | 'stepvolt'
      | 'rectify3'
      | 'loadreg'
    /** 通用调节旋钮，按 kind 解释 */
    p?: number
    /** 辅助参数 */
    q?: number
    h?: number
  }>(),
  { p: 1, q: 1, h: 1 }
)

const C = {
  a: '#f59e0b',
  b: '#34d399',
  c: '#38bdf8',
  v: '#a78bfa',
  g: '#f472b6',
  n: '#94a3b8'
}

/** 三相电流（含和为零的演示） */
const threePhase = computed(() => {
  const ph = waves.threePhase(1, 1)
  return {
    series: [
      { label: 'i_A', color: C.a, width: 2, points: curve(ph[0], 0, 1, 240) },
      { label: 'i_B', color: C.b, width: 2, points: curve(ph[1], 0, 1, 240) },
      { label: 'i_C', color: C.c, width: 2, points: curve(ph[2], 0, 1, 240) },
      { label: 'i_A+i_B+i_C ≡ 0', color: C.n, width: 1.4, dash: true, points: curve(() => 0, 0, 1, 3) }
    ],
    yLabel: 'i',
    yMin: -1.35,
    yMax: 1.35,
    note: '三相对称：任一时刻和为零，因此三线制只需三根线（加地线共四根）'
  }
})

/** RC 充电：p 控制 τ（越大越慢） */
const rc = computed(() => {
  const tau = 0.08 * props.p
  const f = (t: number) => 1 - Math.exp(-t / tau)
  const marks = [1, 3, 5].map((k, i) => ({ x: Math.min(0.98, (k * tau) / 0.5), label: `${k}τ`, color: [C.a, C.b, C.v][i] }))
  return {
    series: [
      { label: 'u_C', color: C.a, width: 2.2, points: curve(f, 0, 0.5, 240) },
      { label: 'E', color: C.n, width: 1.3, dash: true, points: curve(() => 1, 0, 0.5, 3) }
    ],
    marks,
    yLabel: 'u_C/E',
    yMin: 0,
    yMax: 1.25,
    xTickFmt: (v: number) => `${(v / tau).toFixed(1)}τ`,
    note: 'τ = RC。t = τ 时完成 63%，3τ 时 95%，5τ 后基本认为完成'
  }
})

/** RL 接通：电流爬升 + 电感电压衰减 */
const rl = computed(() => {
  const tau = 0.08 * props.p
  return {
    series: [
      { label: 'i(t)', color: C.b, width: 2.2, points: curve(x => 1 - Math.exp(-x / tau), 0, 0.5, 240) },
      { label: 'u_L(t)', color: C.a, width: 2, dash: true, points: curve(x => Math.exp(-x / tau), 0, 0.5, 240) }
    ],
    yLabel: 'i/I∞ , u_L/E',
    yMin: 0,
    yMax: 1.25,
    xTickFmt: (v: number) => `${(v / tau).toFixed(1)}τ`,
    note: 'L 两端在接通瞬间相当于开路（u_L = E），稳态相当于短路（u_L = 0）'
  }
})

/** 串联谐振：|Z|、U_R、I 随频率（横轴对数） */
const resonance = computed(() => {
  const Q = props.q
  const f0 = props.p
  const z = (f: number) => Math.sqrt(1 + Q * Q * ((f / f0 - f0 / f) ** 2))
  const I = (f: number) => 1 / z(f)
  const U = (f: number) => Q / z(f)
  return {
    series: [
      { label: 'U_R/U', color: C.v, width: 2.2, points: curve(U, 0.05, 4, 300) },
      { label: 'I/I₀', color: C.a, width: 2, points: curve(I, 0.05, 4, 300) },
      { label: '|Z|/R', color: C.n, width: 1.4, dash: true, points: curve(z, 0.05, 4, 300) }
    ],
    marks: [{ x: f0, label: 'f₀', color: C.b }],
    xLog: true,
    xTicks: [0.05, 0.1, 0.2, 0.5, 1, 2, 4],
    xLabel: 'f / f₀ （对数刻度）',
    yLabel: '',
    xMin: 0.05,
    xMax: 4,
    yMin: 0,
    yMax: Math.max(1.35, Q * 1.15),
    note: `Q = ${Q}：谐振时电阻电压被放大 Q 倍，电抗电压相互抵消，所以 ${Q} > 1 时总电压反而变小`
  }
})

/**
 * 同频正弦量相加：u₁ + u₂ 的合成幅值取决于相位差。
 * p ∈ [0, 1] → 相位差 φ = p·180°。
 *
 * 这是「有效值不能直接相加」的图形证明：φ = 90° 时合成有效值 = √2·U，
 * 而直接加起来会得到 2U。两条虚线是分量，实线是逐点代数和。
 */
const sinesum = computed(() => {
  const phi = Math.PI * props.p
  const amp = 2 * Math.cos(phi / 2)
  const u1 = (t: number) => Math.sin(2 * Math.PI * t)
  const u2 = (t: number) => Math.sin(2 * Math.PI * t + phi)
  return {
    series: [
      { label: 'u₁', color: C.a, width: 1.4, dash: true, points: curve(u1, 0, 2, 400) },
      { label: 'u₂', color: C.c, width: 1.4, dash: true, points: curve(u2, 0, 2, 400) },
      { label: `u₁+u₂（幅值 ${amp.toFixed(2)}U）`, color: C.b, width: 2.4, points: curve((t: number) => u1(t) + u2(t), 0, 2, 400) }
    ],
    yLabel: 'u / U',
    xLabel: 't →',
    xMin: 0,
    xMax: 2,
    yMin: -2.3,
    yMax: 2.3,
    xTicks: [0, 0.5, 1, 1.5, 2],
    note: `相位差 ${(props.p * 180).toFixed(0)}°：合成幅值 = 2U·cos(φ/2) = ${amp.toFixed(2)}U。同相最大（2U）、反相抵消（0）、90° 时只有 √2U —— 所以同频正弦量的有效值不能直接相加`
  }
})

/**
 * 电抗频率特性：X_L = ωL 与 X_C = 1/ωC 随频率变化（对数横轴）。
 * 横轴用 f/f₀ 归一化，于是两曲线交点恒在 f = f₀，与 L、C 取值无关。
 */
const reactance = computed(() => {
  const XL = (x: number) => x
  const XC = (x: number) => 1 / x
  return {
    series: [
      { label: 'X_L / ω₀L', color: C.a, width: 2.2, points: curve(XL, 0.2, 5, 200) },
      { label: 'X_C / ω₀L', color: C.c, width: 2.2, points: curve(XC, 0.2, 5, 200) },
      { label: 'X = X_L − X_C', color: C.v, width: 1.5, dash: true, points: curve((x: number) => x - 1 / x, 0.2, 5, 200) }
    ],
    marks: [{ x: 1, label: 'f = f₀', color: C.b }],
    xLog: true,
    xTicks: [0.2, 0.5, 1, 2, 5],
    xLabel: 'f / f₀ （对数刻度）',
    yLabel: '电抗 / ω₀L',
    xMin: 0.2,
    xMax: 5,
    yMin: -1.6,
    yMax: 5.4,
    note: '同一个 RLC：低频段 X_C 大（呈容性），高频段 X_L 大（呈感性），交点处电抗为零——这就是谐振频率。注意两条曲线在对数轴上都是直线'
  }
})

/**
 * 功率因数与电流：P 一定时 I = P/(U·cosφ)。
 * 展示 cosφ 从 0.5 提到 0.9，电流下降 44%（线损下降到 31%）。
 */
const pfcurve = computed(() => {
  const I = (cos: number) => 1 / cos
  return {
    series: [
      { label: 'I / I(cosφ=1)', color: C.a, width: 2.4, points: curve(I, 0.3, 1, 300) }
    ],
    dots: [
      { x: 0.5, y: 2, label: '0.5 → 2 倍电流', color: C.g, dx: 8, dy: -8 },
      { x: 0.7, y: 1 / 0.7, label: '0.7 → 1.43 倍', color: C.c, dx: 8, dy: -8 },
      { x: 0.9, y: 1 / 0.9, label: '0.9 → 1.11 倍', color: C.b, dx: -8, dy: -12 }
    ],
    marks: [{ x: 0.9, label: '供电局考核线', color: C.b }],
    xLabel: '功率因数 cosφ',
    yLabel: 'I / I₁',
    xMin: 0.3,
    xMax: 1,
    yMin: 0.8,
    yMax: 3.4,
    xTicks: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    note: '输出同样的有功功率：cosφ = 0.5 要从电网吸取 2 倍电流，0.9 只要 1.11 倍。电流每大一倍，线路损耗 I²R 就是四倍'
  }
})

/** 不同 Q 值的串联谐振曲线族：选择性 vs 通频带的取舍 */
const qfamily = computed(() => {
  const qs = [2, 5, 10, 25]
  const colors = [C.c, C.b, C.a, C.g]
  const I = (eta: number, Q: number) => 1 / Math.sqrt(1 + Q * Q * (eta - 1 / eta) ** 2)
  return {
    series: qs.map((Q, i) => ({
      label: `Q = ${Q}`,
      color: colors[i],
      width: 2,
      points: curve((x: number) => I(x, Q), 0.2, 5, 400)
    })),
    marks: [{ x: 1, label: 'f₀', color: C.n }],
    xLog: true,
    xTicks: [0.2, 0.5, 1, 2, 5],
    xLabel: 'f / f₀ （对数刻度）',
    yLabel: 'I / I₀',
    xMin: 0.2,
    xMax: 5,
    yMin: 0,
    yMax: 1.12,
    note: 'Q 越大曲线越尖：选台能力强，但通频带 BW = f₀/Q 越窄。收音机选台要高 Q，音频放大要低 Q —— 同一个参数，两种相反的需求'
  }
})

/** 串联 vs 并联谐振：阻抗频率特性（谷 vs 峰，同一 Q） */
const parares = computed(() => {
  const Q = 5
  const g = (x: number) => Q * (x - 1 / x)
  const mag = (x: number) => Math.sqrt(1 + g(x) ** 2)
  return {
    series: [
      { label: '串联 |Z|/R（最小）', color: C.a, width: 2.2, points: curve(mag, 0.7, 1.4, 300) },
      { label: '并联 |Z|/R（最大）', color: C.c, width: 2.2, points: curve((x: number) => 1 / mag(x), 0.7, 1.4, 300) }
    ],
    marks: [{ x: 1, label: 'f₀', color: C.b }],
    xLabel: 'f / f₀',
    yLabel: '|Z| / R',
    xMin: 0.7,
    xMax: 1.4,
    yMin: 0,
    yMax: 4.2,
    xTicks: [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4],
    note: '两条曲线互为倒数：串联谐振时阻抗最小（≈R，电源几乎遇到短路，电流巨大）；并联谐振时阻抗最大（≈R，几乎开路，电流极小）。选频用串联，阻波/振荡器负载用并联'
  }
})

/**
 * R / L / C 的伏安相位关系（以电流为参考，时域图）。
 * u_R 与 i 同相；u_L = ωL·I 超前 90°；u_C 滞后 90°。
 */
const phasorref = computed(() => {
  const w = 2 * Math.PI
  return {
    series: [
      { label: 'i（参考）', color: C.n, width: 1.8, points: curve(t => Math.sin(w * t), 0, 2, 400) },
      { label: 'u_R = Ri（同相）', color: C.a, width: 1.5, dash: true, points: curve(t => Math.sin(w * t), 0, 2, 400) },
      { label: 'u_L（超前 90°）', color: C.b, width: 2.2, points: curve(t => Math.cos(w * t), 0, 2, 400) },
      { label: 'u_C（滞后 90°）', color: C.c, width: 2.2, points: curve(t => -Math.cos(w * t), 0, 2, 400) }
    ],
    yLabel: 'i / u',
    xLabel: 't →',
    xMin: 0,
    xMax: 2,
    yMin: -1.35,
    yMax: 1.35,
    xTicks: [0, 0.5, 1, 1.5, 2],
    note: 'u_R 与 i 完全重合（同相）；u_L 比 i 早四分之一周期到峰值（超前 90°）；u_C 晚四分之一周期（滞后 90°）。u_L 与 u_C 永远反相 —— 这正是它们在串联电路里能互相抵消的原因'
  }
})

/**
 * 功率三角形：固定视在功率 S 下，工作点 (P, Q) 随阻抗角沿圆弧滑动。
 * p = cosφ（0.05 ~ 0.99）。
 */
const powertriangle = computed(() => {
  const S = 1100
  const cos = Math.min(0.99, Math.max(0.05, props.p))
  const phi = Math.acos(cos)
  const P = S * cos
  const Q = S * Math.sin(phi)
  // 参数圆弧：t 从 0（纯有功）扫到 90°（纯无功）
  const arc: Pt[] = []
  for (let i = 0; i <= 120; i++) {
    const t = (Math.PI / 2) * (i / 120)
    arc.push([S * Math.cos(t), S * Math.sin(t)])
  }
  return {
    series: [
      { label: `S = ${S} VA（电源容量）`, color: C.b, width: 2.4, points: [[0, 0], [P, Q]] as Pt[] },
      { label: `P = ${P.toFixed(0)} W`, color: C.a, width: 2, points: [[0, 0], [P, 0]] as Pt[] },
      { label: `Q = ${Q.toFixed(0)} var`, color: C.c, width: 2, points: [[P, 0], [P, Q]] as Pt[] },
      { label: '阻抗角变化时沿圆弧滑动', color: C.n, width: 1.3, dash: true, points: arc }
    ],
    dots: [{ x: P, y: Q, label: `cosφ = ${cos.toFixed(2)}`, color: C.b, dx: 6, dy: -8 }],
    xLabel: 'P / W',
    yLabel: 'Q / var',
    xMin: 0,
    xMax: 1400,
    yMin: 0,
    yMax: 1400,
    xTicks: [0, 220, 440, 660, 880, 1100],
    yTicks: [0, 220, 440, 660, 880, 1100],
    note: '斜边 S 是电源容量（固定不动），阻抗角越大：P 越短、Q 越长 —— 同样的容量能干活的部分越少。cosφ = P/S 就是容量利用率'
  }
})

/**
 * 中性点位移：Y 接负载 + 中性线断开 + 负载不对称时，
 * 中性点电位不再为 0，各相负载电压重新分配。
 *
 * 模型：Z_A = Z_B = Z（纯电阻），Z_C = k·Z，k 沿对数轴从 0.03 到 30。
 *   V_N' = (Σ U/Z) / (Σ 1/Z)，U'_phase = U_phase − V_N'
 * k = 1：对称，A/B/C 三根线重合在 1
 * k → 0（C 相短路）：V_N' = U_C，C 相电压归零，A/B 被抬到 √3 ≈ 1.73
 * k → ∞（C 相开路）：V_N' = (U_A+U_B)/2，A/B 掉到 √3/2 ≈ 0.87，C 相反升到 1.5
 * A、B 两相因对称，电压大小始终相等 —— 所以只画两条线。
 */
const neutraldisp = computed(() => {
  // 对称三相电源相量（有效值 = 1）
  const U: [number, number][] = [
    [1, 0],
    [Math.cos((-2 * Math.PI) / 3), Math.sin((-2 * Math.PI) / 3)],
    [Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)]
  ]
  const vols = (k: number): [number, number] => {
    const Y: [number, number][] = [
      [1, 0],
      [1, 0],
      [1 / k, 0]
    ]
    let sr = 0, si = 0, gr = 0, gi = 0
    for (let i = 0; i < 3; i++) {
      sr += U[i][0] * Y[i][0] - U[i][1] * Y[i][1]
      si += U[i][0] * Y[i][1] + U[i][1] * Y[i][0]
      gr += Y[i][0]
      gi += Y[i][1]
    }
    const den = gr * gr + gi * gi
    const vr = (sr * gr + si * gi) / den
    const vi = (si * gr - sr * gi) / den
    return [Math.hypot(U[0][0] - vr, U[0][1] - vi), Math.hypot(U[2][0] - vr, U[2][1] - vi)]
  }
  const ks: number[] = []
  for (let i = 0; i <= 140; i++) ks.push(0.03 * Math.pow(30 / 0.03, i / 140))
  const ab = ks.map(k => [k, vols(k)[0]] as [number, number])
  const cc = ks.map(k => [k, vols(k)[1]] as [number, number])
  return {
    series: [
      { label: 'A/B 相电压', color: C.a, width: 2.2, points: ab },
      { label: 'C 相电压（可变负载）', color: C.c, width: 2.2, points: cc }
    ],
    marks: [{ x: 1, label: 'k=1 完全对称', color: C.n }],
    dots: [
      { x: 0.03, y: vols(0.03)[1], label: 'C 相短路 → 0', color: C.g, dx: 6, dy: -8 },
      { x: 30, y: 1.5, label: 'C 相开路 → 1.5', color: C.c, dx: -120, dy: -6 },
      { x: 30, y: 0.866, label: 'A/B 掉到 0.87', color: C.a, dx: -130, dy: 14 }
    ],
    xLog: true,
    xTicks: [0.03, 0.1, 0.3, 1, 3, 10, 30],
    xLabel: 'Z_C / Z （对数刻度）',
    yLabel: "U' / U_p",
    xMin: 0.03,
    xMax: 30,
    yMin: 0,
    yMax: 1.95,
    yTicks: [0, 0.5, 1, 1.5],
    note: '中性线一断，中性点电位就漂了：负载越轻（电阻越大）的那相，电压反而越高（可超过电源电压）；越重的那相被压得越低。C 相短路时 A/B 冲到 √3 倍（220V 系统 → 380V）立刻烧毁；C 相开路时它自己升到 1.5 倍。所以不对称负载必须保留中性线'
  }
})

/**
 * 两表法：电流线圈串 A 相与 C 相，电压线圈公共端接 B 相。
 *   W_A = U_AB·I_A = U_l·I_l·cos(φ+30°)
 *   W_C = U_CB·I_C = U_l·I_l·cos(φ−30°)
 * φ > 60°（cosφ < 0.5）时 W_A 变负 —— 这就是「一个表反偏」的来历。
 */
const twowatt = computed(() => {
  const d2r = (d: number) => (d * Math.PI) / 180
  const pts = (f: (d: number) => number) => {
    const out: [number, number][] = []
    for (let d = 0; d <= 90; d += 0.5) out.push([d, f(d)])
    return out
  }
  return {
    series: [
      { label: 'W_A = cos(φ+30°)', color: C.a, width: 2.2, points: pts(d => Math.cos(d2r(d + 30))) },
      { label: 'W_C = cos(φ−30°)', color: C.c, width: 2.2, points: pts(d => Math.cos(d2r(d - 30))) },
      { label: 'W_A+W_C = √3·cosφ', color: C.b, width: 2.4, points: pts(d => Math.sqrt(3) * Math.cos(d2r(d))) }
    ],
    marks: [{ x: 60, label: 'φ = 60°', color: C.g }],
    dots: [
      { x: 60, y: 0, label: 'W_A = 0，再感性就翻负', color: C.g, dx: -150, dy: -6 },
      { x: 0, y: 0.866, label: '阻性：两表相等', color: C.b, dx: 10, dy: -8 }
    ],
    xLabel: '负载阻抗角 φ（度）',
    yLabel: 'W / (U_l·I_l)',
    xMin: 0,
    xMax: 90,
    yMin: -0.75,
    yMax: 1.05,
    xTicks: [0, 15, 30, 45, 60, 75, 90],
    yTicks: [-0.5, 0, 0.5, 1],
    note: 'cosφ > 0.5 时两表都正、直接相加；cosφ < 0.5 时 W_A 为负（把它的电流线圈反接，读数按负值代入）。两表读数还能反推功率因数：tanφ = √3·(W_C−W_A)/(W_A+W_C)（读数大的减小的，保证为正）'
  }
})

/**
 * 三相瞬时功率：p = p_A + p_B + p_C = 1.5·U_p·I_p·cosφ —— **恒定值**！
 * q = cosφ（默认 1）。单相时 p 以 2ω 脉动，三相合成后脉动抵消。
 */
const instp3 = computed(() => {
  const cos = Math.min(0.99, Math.max(0.05, props.q))
  const phi = Math.acos(cos)
  const w = 2 * Math.PI
  const p = (uph: number) => (t: number) => Math.sin(w * t + uph) * Math.sin(w * t + uph - phi)
  const pA = p(0), pB = p((-2 * Math.PI) / 3), pC = p((2 * Math.PI) / 3)
  const sum = 1.5 * cos
  return {
    series: [
      { label: 'p_A', color: C.a, width: 1.5, dash: true, points: curve(pA, 0, 2, 400) },
      { label: 'p_B', color: C.b, width: 1.5, dash: true, points: curve(pB, 0, 2, 400) },
      { label: 'p_C', color: C.c, width: 1.5, dash: true, points: curve(pC, 0, 2, 400) },
      { label: `总功率 p = ${sum.toFixed(2)}（恒定！）`, color: C.v, width: 2.4, points: curve(() => sum, 0, 2, 3) }
    ],
    yLabel: 'p / (U_p·I_p)',
    xLabel: 't →',
    xMin: 0,
    xMax: 2,
    yMin: -1.25,
    yMax: 1.25,
    xTicks: [0, 0.5, 1, 1.5, 2],
    note: `cosφ = ${cos.toFixed(2)}：三条虚线各自以两倍频率脉动（单相功率永远在抖），但三者错开 120° 后脉动正好抵消，总和是一条平线。这就是三相电机转矩恒定、运行平稳的根本原因`
  }
})

/** 变压器效率曲线：η(β)，最大效率出现在铁损 = 铜损处 */
const traeff = computed(() => {
  const PN = 50 // kW 额定输出
  const Pfe = 0.5 // kW 铁损（近似不变）
  const Pcu = 1.5 // kW 额定铜损（∝ β²）
  const eta = (b: number) => (b * PN) / (b * PN + Pfe + b * b * Pcu)
  const bStar = Math.sqrt(Pfe / Pcu)
  return {
    series: [{ label: '效率 η', color: C.a, width: 2.4, points: curve(eta, 0.02, 1.3, 300) }],
    marks: [{ x: bStar, label: `β* = ${bStar.toFixed(2)}`, color: C.b }],
    dots: [
      { x: 1, y: eta(1), label: `额定点 η = ${(eta(1) * 100).toFixed(1)}%`, color: C.c, dx: -150, dy: -8 },
      { x: bStar, y: eta(bStar), label: `最高 η = ${(eta(bStar) * 100).toFixed(1)}%`, color: C.b, dx: -60, dy: -10 }
    ],
    xLabel: '负载率 β = S₂/S_N',
    yLabel: 'η',
    xMin: 0,
    xMax: 1.3,
    yMin: 0.8,
    yMax: 1,
    xTicks: [0, 0.25, 0.5, 0.75, 1, 1.25],
    yTicks: [0.8, 0.85, 0.9, 0.95, 1],
    yTickFmt: (v: number) => `${(v * 100).toFixed(0)}%`,
    note: `铁损不随负载变、铜损按 β² 涨：β* = √(P_Fe/P_Cu) = ${bStar.toFixed(2)} 时两者相等、效率最高。变压器不宜按额定容量长期满载选型，留 20%~30% 余量反而更经济`
  }
})

/** 电压调整率：ΔU% = β(R*·cosφ + X*·sinφ)，感性为正、容性为负 */
const vadjust = computed(() => {
  const R = 0.02
  const X = 0.05
  const d = (deg: number) => (R * Math.cos((deg * Math.PI) / 180) + X * Math.sin((deg * Math.PI) / 180)) * 100
  return {
    series: [
      { label: '感性（φ > 0）', color: C.a, width: 2.4, points: curve(d, 0, 80, 160) },
      { label: '容性（φ < 0）', color: C.c, width: 2.4, points: curve((deg: number) => d(-deg), 0, 80, 160) }
    ],
    marks: [{ x: 0, label: '纯电阻负载', color: C.n }],
    dots: [{ x: 0, y: 2, label: '只有铜压降', color: C.n, dx: 8, dy: -8 }],
    xLabel: '负载阻抗角 φ（度）',
    yLabel: 'ΔU / %',
    xMin: -80,
    xMax: 80,
    yMin: -6,
    yMax: 6.5,
    xTicks: [-80, -40, 0, 40, 80],
    yTicks: [-5, 0, 5],
    note: '同样的漏阻抗：感性负载时副边电压下降，容性负载时反而升高（ΔU 为负）—— 电容电流对变压器有"抬压"作用。所以电网里电容补偿除了减小线损，还能顺便稳住电压'
  }
})

/**
 * 旋转磁场：三相绕组磁动势的空间分布，取 4 个瞬间。
 * F(θ,t) = 1.5·Fm·sin(θ − ωt)，整条曲线随时间向 θ 正方向平移。
 */
const rotfield = computed(() => {
  const inst = [0, 30, 60, 90]
  const colors = [C.a, C.b, C.c, C.v]
  return {
    series: inst.map((deg, i) => ({
      label: `ωt = ${deg}°`,
      color: colors[i],
      width: 2.2,
      points: curve((th: number) => 1.5 * Math.sin(((th - deg) * Math.PI) / 180), 0, 360, 240)
    })),
    marks: [{ x: 120, label: 'A 相轴线', color: C.n }],
    dots: inst.map(deg => ({ x: 90 + deg, y: 1.5, label: deg === 90 ? '峰值向前移动 → 旋转' : '', color: C.v, dx: 0, dy: -8 })),
    xLabel: '空间角度 θ（度）',
    yLabel: 'F / Fm',
    xMin: 0,
    xMax: 360,
    yMin: -2,
    yMax: 2,
    xTicks: [0, 60, 120, 180, 240, 300, 360],
    yTicks: [-1.5, 0, 1.5],
    note: '每条曲线是某一瞬间磁动势沿圆周的分布。四张快照对比着看：波形整体在向 θ 正方向平移，幅值始终是 1.5Fm —— 这就是旋转磁场。转向只由三相电流的相序决定，对调两根火线就反向'
  }
})

/**
 * 异步电机转矩-转差率特性：T = 2T_max·(s·s_m)/(s² + s_m²)。
 * 三条曲线：固有特性、转子串电阻（s_m 右移、T_max 不变）、降压（T_max 按平方衰减）。
 */
const torslip = computed(() => {
  const sm1 = 0.15
  const sm2 = 0.5
  const T = (s: number, sm: number) => (2 * s * sm) / (s * s + sm * sm)
  return {
    series: [
      { label: '固有特性（s_m = 0.15）', color: C.a, width: 2.2, points: curve((s: number) => T(s, sm1), 0.002, 1.15, 320) },
      { label: '转子串电阻（s_m = 0.5）', color: C.c, width: 2.2, points: curve((s: number) => T(s, sm2), 0.002, 1.15, 320) },
      { label: '降压 U₁ = 0.8U_N', color: C.v, width: 1.8, dash: true, points: curve((s: number) => 0.64 * T(s, sm1), 0.002, 1.15, 320) }
    ],
    marks: [
      { x: 1, label: '起动点 s = 1', color: C.n },
      { x: sm1, label: 's_m₁', color: C.a },
      { x: sm2, label: 's_m₂', color: C.c }
    ],
    dots: [
      { x: 1, y: T(1, sm1), label: 'T_st = 0.29', color: C.a, dx: -56, dy: -8 },
      { x: 1, y: T(1, sm2), label: 'T_st = 0.80（↑）', color: C.c, dx: -92, dy: 14 },
      { x: 1, y: 0.64 * T(1, sm1), label: '只剩 0.19', color: C.v, dx: -78, dy: 14 }
    ],
    xLabel: '转差率 s',
    yLabel: 'T / T_max',
    xMin: 0,
    xMax: 1.15,
    yMin: 0,
    yMax: 1.15,
    xTicks: [0, 0.25, 0.5, 0.75, 1],
    yTicks: [0, 0.5, 1],
    note: 'T_max 只由 U₁² 和漏抗决定，与 R₂ 无关；R₂ 增大只是让 s_m 右移 → 起动转矩从 0.29 涨到 0.80。降压则整条曲线按平方衰减（0.8² = 0.64），重载时起动转矩掉到 0.19 —— 起不来'
  }
})

/**
 * 起动电流/转矩倍数曲线：都按 k² 衰减（k = 加到电机上的电压与全压之比）。
 * 标出 Y-△（k = 1/√3 → 1/3）与常用自耦抽头。
 */
const startcurve = computed(() => {
  return {
    series: [
      { label: 'I_st（电网侧）/ T_st = k²', color: C.a, width: 2.4, points: curve((k: number) => k * k, 0.4, 1.05, 200) }
    ],
    marks: [{ x: 1, label: '直接启动', color: C.n }],
    dots: [
      { x: 1 / Math.sqrt(3), y: 1 / 3, label: 'Y-△（k=1/√3 → 1/3）', color: C.b, dx: -150, dy: -8 },
      { x: 0.8, y: 0.64, label: '自耦 80%', color: C.c, dx: -66, dy: 12 },
      { x: 0.65, y: 0.4225, label: '自耦 65%', color: C.v, dx: -70, dy: 12 }
    ],
    xLabel: '电压比 k = U′/U_N',
    yLabel: '相对直接启动的倍数',
    xMin: 0.4,
    xMax: 1.05,
    yMin: 0,
    yMax: 1.1,
    xTicks: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    yTicks: [0, 0.25, 0.5, 0.75, 1],
    note: '电流和转矩按同一条 k² 曲线衰减：电机侧电流 ∝ k，折算到电网侧再乘一个 k；转矩 ∝ U² = k²。代价是起动变慢 —— 所以降压启动只适合空载/轻载'
  }
})

/** 直流电机机械特性：他励硬特性 vs 串励软特性 */
const dcmotor = computed(() => {
  const sep = (t: number) => 1 - 0.06 * t
  const sser = (t: number) => 0.85 / t
  return {
    series: [
      { label: '他励 / 并励（硬特性）', color: C.a, width: 2.4, points: curve(sep, 0.3, 2, 200) },
      { label: '串励（软特性）', color: C.c, width: 2.4, points: curve(sser, 0.3, 2, 200) }
    ],
    marks: [{ x: 1, label: '额定工作点', color: C.n }],
    dots: [{ x: 0.3, y: 0.85 / 0.3, label: '轻载就飞车', color: C.g, dx: 10, dy: -6 }],
    xLabel: 'T / T_N',
    yLabel: 'n / n₀',
    xMin: 0.3,
    xMax: 2,
    yMin: 0,
    yMax: 3,
    xTicks: [0.3, 0.6, 1, 1.5, 2],
    yTicks: [0, 1, 2, 3],
    note: '他励：Φ 恒定 → n = (U−IR_a)/(K_eΦ) 近似直线，负载变化转速只掉 5%。串励：Φ ∝ I_a → n ∝ 1/T，转矩越大转速越低；反过来轻载时转速冲向无穷 —— 所以串励电机严禁空载/皮带传动'
  }
})

/** 磁化曲线 + 磁滞回线 */
const magnetize = computed(() => {
  const Hc = 0.3 * props.p
  const Hs = 0.7 * props.q
  const up: number[][] = []
  const dn: number[][] = []
  for (let i = 0; i <= 60; i++) {
    const H = -1 + (2 * i) / 60
    up.push([H, Math.tanh((H + Hc * 0.5) / Hs)])
    dn.push([H, Math.tanh((H - Hc * 0.5) / Hs)])
  }
  return {
    series: [
      { label: '上升支', color: C.a, width: 2, points: up },
      { label: '下降支', color: C.c, width: 2, points: dn }
    ],
    xLabel: 'H (磁场强度)',
    yLabel: 'B (磁感应强度)',
    xMin: -1,
    xMax: 1,
    yMin: -1.2,
    yMax: 1.2,
    note: '剩磁 Br 与矫顽力 Hc 的大小，决定了铁磁材料适不适合做变压器（要求 Br 大、Hc 小）'
  }
})

/** 衰减振荡（欠阻尼） */
const damped = computed(() => {
  const z = props.p
  const f = (x: number) => Math.exp(-z * x) * Math.cos(2 * Math.PI * 3 * x)
  return {
    series: [{ label: '响应', color: C.v, width: 2.2, points: curve(f, 0, 1, 300) }],
    yLabel: 'x(t)',
    yMin: -1.1,
    yMax: 1.1,
    note: '阻尼越小振荡越强（RCL 串联中 R 越小越容易振荡）'
  }
})

/** 数电时序：时钟与各路输出（密集采样，视觉上就是方波阶梯） */
const logic = computed(() => {
  const n = 8
  const mk = (f: (i: number) => number) => curve(x => f(Math.floor(x)), 0, n, n * 10)
  return {
    series: [
      { label: 'CLK', color: C.a, width: 2, points: mk(i => i % 2) },
      { label: 'Q1', color: C.b, width: 2, points: mk(i => (i >> 1) & 1) },
      { label: 'Q2', color: C.c, width: 2, points: mk(i => (i >> 2) & 1) },
      { label: '进位 C', color: C.g, width: 2, points: mk(i => (i % 4 >= 2 ? 1 : 0)) }
    ],
    yLabel: '',
    yMin: -0.15,
    yMax: 1.15,
    xTicks: Array.from({ length: n + 1 }, (_, i) => i),
    note: '边沿在哪、输出就在哪变——数电的所有问题最后都要落到这张时序图上看'
  }
})

/** 三线制与四线制 */
const threewire = computed(() => {
  const ph = waves.threePhase(1, 1)
  return {
    series: [
      { label: 'u_AB', color: C.a, width: 2, points: curve(x => Math.sin(2 * Math.PI * x) - Math.sin(2 * Math.PI * x - (2 * Math.PI) / 3), 0, 1, 240) },
      { label: 'u_BC', color: C.b, width: 2, points: curve(x => Math.sin(2 * Math.PI * x - (2 * Math.PI) / 3) - Math.sin(2 * Math.PI * x + (2 * Math.PI) / 3), 0, 1, 240) },
      { label: 'u_CA', color: C.c, width: 2, points: curve(x => Math.sin(2 * Math.PI * x + (2 * Math.PI) / 3) - Math.sin(2 * Math.PI * x), 0, 1, 240) },
      { label: '相电压', color: C.n, width: 1.3, dash: true, points: curve(ph[0], 0, 1, 240) }
    ],
    yLabel: 'u',
    yMin: -1.8,
    yMax: 1.8,
    note: '线电压是两个相电压的差：幅值是相电压的 √3 倍，相位超前 30°'
  }
})

/** 电源外特性：U = E − I·R₀ 与负载线交点 */
const source = computed(() => {
  const E = 1
  const R0 = 0.28 * props.p
  const RL = 0.9 * props.q
  // 负载线：U = RL · I
  const ext = (I: number) => E - I * R0
  const load = (I: number) => RL * I
  const Istar = E / (R0 + RL)
  return {
    series: [
      { label: '电源外特性 U=E−I·R₀', color: C.a, width: 2.2, points: curve(ext, 0, 1 / R0, 60) },
      { label: `负载线 U=R_L·I (R_L=${(RL * 50).toFixed(0)}Ω)`, color: C.c, width: 2, points: curve(load, 0, 1 / R0, 60) },
      { label: '短路点', color: C.g, width: 1.3, dash: true, points: curve(() => 0, 0, 1, 3) }
    ],
    marks: [
      { x: Istar, label: '工作点', color: C.b },
      { x: 1 / R0, label: 'I_sc', color: C.g }
    ],
    xLabel: '输出电流 I',
    yLabel: '端电压 U',
    xMin: 0,
    xMax: Math.max(1 / R0, 1),
    yMin: 0,
    yMax: 1.2,
    note: '外特性与负载线的交点就是工作点。R_L 越大，交点越靠左上（电压高、电流小）；短路时电流冲到 E/R₀'
  }
})

/**
 * 电位阶梯：一条串联分压链，各节点电位随「末端负载」变化。
 *
 * 模型：E = 1V，n 节等值电阻 R（每节阻值 1/n），末端接负载 RL。
 *   空载：  V_i = 1 - i·R/ΣR = 1 - i/n            （等差下降的直线）
 *   带载：  末节被 RL 并联，等效阻值变成 R∥RL，于是后面每一级都被"压"下去。
 *          逐点用分压公式算，不做近似 —— 这样末端电位掉得最明显。
 */
const ladder = computed(() => {
  const n = 5
  const R = 1 / n // 每节电阻
  const RL = 0.6 * props.p // 负载越大电位掉得越多

  // 从末端倒推：负载节点电位 = E·(R∥RL) / (R + R∥RL)
  const Req = (R * RL) / (R + RL)
  const vLast = Req / (R + Req)
  const v = [1]
  for (let i = 1; i < n; i++) v.push(v[i - 1] - R * vLast)
  v.push(vLast)

  const ideal = Array.from({ length: n + 1 }, (_, i) => [i, 1 - i / n] as [number, number])
  const loaded = v.map((val, i) => [i, val] as [number, number])

  return {
    series: [
      { label: '空载电位', color: C.n, width: 1.6, dash: true, points: ideal },
      { label: '带负载电位', color: C.a, width: 2.2, points: loaded }
    ],
    xLabel: '节点序号 i（共 n 节）',
    yLabel: 'V',
    xMin: 0,
    xMax: n,
    yMin: 0,
    yMax: 1.15,
    xTicks: Array.from({ length: n + 1 }, (_, i) => i),
    note: '空载时电位是等差直线；接上负载后，负载两端那一节被并联短路掉一部分，电位曲线整体下弯、末端掉得最多 —— 这就是分压器不能当电源用的原因'
  }
})

/** 负载效应：U_L 随 R_L 变化（比值曲线） */
const loadline = computed(() => {
  const R1 = 1
  const ratio = (r: number) => r / (R1 + r)
  return {
    series: [
      { label: 'U_L/U', color: C.a, width: 2.2, points: curve(ratio, 0.03, 30, 300) },
      { label: '空载值 = 1', color: C.n, width: 1.3, dash: true, points: curve(() => 1, 0.03, 30, 3) }
    ],
    marks: [{ x: 10, label: 'R_L = 10R₁', color: C.b }],
    xLog: true,
    xTicks: [0.03, 0.1, 0.3, 1, 3, 10, 30],
    xLabel: 'R_L / R₁ （对数刻度）',
    yLabel: 'U_L / U',
    yMin: 0,
    yMax: 1.15,
    note: 'R_L 远大于 R₁ 时才接近空载值。要得到稳定电压，必须让 R₁ ≪ R_L（这正是运放电压跟随器的用法）'
  }
})

/** 结点电位：两结点网络的 V₁ 随 E₂/R₂ 变化 */
const nodepot = computed(() => {
  const R1 = 1, R2 = 1.5
  const V1 = (e2: number) => (1 + e2 / R2) / (1 / R1 + 1 / R2)
  return {
    series: [
      { label: 'V₁', color: C.v, width: 2.2, points: curve(V1, -1.2, 2, 200) },
      { label: 'V₁ = E₁ = 1（E₂=0 时的基准）', color: C.n, width: 1.3, dash: true, points: curve(() => 1, -1.2, 2, 3) }
    ],
    marks: [{ x: 0, label: 'E₂=0', color: C.b }],
    xLabel: 'E₂ （V）',
    yLabel: 'V₁ （V）',
    xMin: -1.2,
    xMax: 2,
    yMin: -0.4,
    yMax: 1.6,
    note: '结点电压是各电源"加权平均"的结果，权重是电导。R₂ 越大，这一路的贡献越小'
  }
})

/** 功率曲线：P_L 随 R_L（含效率） */
const maxpower = computed(() => {
  const R0 = 1, U = 1
  const r = 0.05 + (19.95 - 0.05) * props.p
  const P = (x: number) => (U * x) / ((R0 + x) * (R0 + x))
  const eta = (x: number) => x / (R0 + x)
  return {
    series: [
      { label: 'P_L / P_max', color: C.a, width: 2.2, points: curve(P, 0.05, 20, 400) },
      { label: 'η（效率）', color: C.c, width: 2, points: curve(eta, 0.05, 20, 400) }
    ],
    marks: [{ x: 1, label: 'R_L = R₀', color: C.b }],
    xLabel: 'R_L / R₀',
    yLabel: '',
    xMin: 0.05,
    xMax: 20,
    yMin: 0,
    yMax: 1.1,
    note: '功率最大时效率恰好 50%：R_L = R₀ 时负载拿到的功率是被浪费掉功率的一半，所以电力系统绝不这样匹配'
  }
})

/** 叠加定理：分量的合成 */
const superpose = computed(() => {
  const a1 = (x: number) => 0.55 * Math.exp(-1.6 * x) * Math.sin(2 * Math.PI * 1.5 * x)
  const a2 = (x: number) => 0.55 * Math.exp(-0.5 * x) * Math.sin(2 * Math.PI * 1.5 * x + 1.9)
  return {
    series: [
      { label: 'E₁ 单独作用', color: C.a, width: 1.8, dash: true, points: curve(a1, 0, 3, 300) },
      { label: 'E₂ 单独作用', color: C.c, width: 1.8, dash: true, points: curve(a2, 0, 3, 300) },
      { label: '代数相加 = 实际响应', color: C.b, width: 2.4, points: curve((x: number) => a1(x) + a2(x), 0, 3, 300) }
    ],
    yLabel: 'i',
    xLabel: 't →',
    xMin: 0,
    xMax: 3,
    yMin: -0.85,
    yMax: 0.85,
    note: '绿线（和）不是蓝线与橙线的"包络"，而是逐点代数相加——注意某些时刻两条分量同号、相加后比任何一条都大'
  }
})

/**
 * 阶梯信号采样：断点处插入重复 x，画出真正竖直的跳变沿。
 * segs = [[起始x, 电平], ...]，第 i 段从 segs[i][0] 画到 segs[i+1][0]。
 * 跳变前后各留一小段水平线，SVG 里就是一条竖线。
 */
function stepPts(segs: [number, number][], flat = 30): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < segs.length; i++) {
    const x1 = i + 1 < segs.length ? segs[i + 1][0] : segs[i][0]
    for (let k = 0; k <= flat; k++) pts.push([segs[i][0] + ((x1 - segs[i][0]) * k) / flat, segs[i][1]])
  }
  return pts
}

/**
 * 起保停时序：按钮只是"点一下"，靠自锁触点一直运行，按停止才断电。
 * 关键看 t = 2s：SB2 早就松开了，KM 线圈却照样得电——多出来的那段就是自锁。
 */
const relaytime = computed(() => ({
  series: [
    { label: 'SB2 起动', color: C.a, width: 2, points: stepPts([[0, 0], [0.5, 1], [2, 1], [2.05, 0], [8, 0]]) },
    { label: 'SB1 停止', color: C.g, width: 2, points: stepPts([[0, 1], [5, 1], [5.05, 0], [5.4, 0], [5.45, 1], [8, 1]]) },
    { label: 'KM 线圈', color: C.b, width: 2.6, points: stepPts([[0, 0], [0.5, 1], [5, 1], [5.05, 0], [8, 0]]) },
    {
      label: '电机转速',
      color: C.c,
      width: 2.2,
      points: (() => {
        const pts: Pt[] = []
        for (let i = 0; i <= 400; i++) {
          const t = (8 * i) / 400
          let v = 0
          if (t < 0.5) v = 0
          else if (t < 2) v = (t - 0.5) / 1.5 // 起动加速
          else if (t < 5) v = 1 // 稳速运行
          else v = Math.exp(-(t - 5) / 1.2) // 断电后自由停车
          pts.push([t, v])
        }
        return pts
      })()
    }
  ],
  xLabel: 't（s）',
  yLabel: '',
  xMin: 0,
  xMax: 8,
  yMin: -0.15,
  yMax: 1.15,
  xTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  yTicks: [0, 1],
  note: 'SB2 在 t = 2s 就松开了，KM 线圈却一直得电到 t = 5s —— 中间这段没人按着按钮却仍在运行，就是自锁触点把线圈回路"锁住"了。按 SB1 切断回路，线圈立即失电，电机靠惯性渐停'
}))

/**
 * PLC 扫描周期：输入采样 → 执行程序 → 输出刷新。
 * 输入在周期"中间"变化，要等下一次采样才被看见，输出再晚半个周期才刷新。
 */
const scancycle = computed(() => ({
  series: [
    { label: 'I0.0 实际输入', color: C.a, width: 2, dash: true, points: stepPts([[0, 0], [1.5, 0], [1.55, 1], [6, 1]]) },
    { label: '输入映像', color: C.b, width: 2.2, points: stepPts([[0, 0], [2, 0], [2.05, 1], [6, 1]]) },
    { label: 'Q0.0 输出', color: C.c, width: 2.6, points: stepPts([[0, 0], [2.85, 0], [2.9, 1], [6, 1]]) }
  ],
  marks: [
    { x: 1.5, label: '输入变化', color: C.a },
    { x: 2, label: '采样', color: C.b },
    { x: 2.85, label: '输出刷新', color: C.c }
  ],
  xLabel: '扫描周期（每格一个周期）',
  yLabel: '',
  xMin: 0,
  xMax: 6,
  yMin: -0.15,
  yMax: 1.35,
  xTicks: [0, 1, 2, 3, 4, 5, 6],
  yTicks: [0, 1],
  note: '输入在周期中间跳变（1.5），采样要等到下一个周期开始（2.0），输出刷新又晚半个周期（2.85）——所以输出滞后输入最多约一个扫描周期。周期越长，响应越慢，这是 PLC"串行扫描"的代价'
}))

/**
 * 工频电流对人体的效应（IEC 60479 分区）。
 * 横轴通电时间、纵轴电流，双对数。颤动边界按 I ≈ 50mA·√(1s/t) 简化。
 */
const humanbody = computed(() => {
  const fib = (t: number) => (t >= 1 ? 50 : 50 * Math.sqrt(1 / t))
  return {
    series: [
      { label: '感知阈值', color: C.b, width: 1.6, dash: true, points: curve(() => 0.5, 0.01, 10, 60) },
      { label: '摆脱阈值', color: C.a, width: 1.6, dash: true, points: curve(() => 10, 0.01, 10, 60) },
      { label: '心室颤动边界', color: C.g, width: 2.6, points: curve(fib, 0.01, 10, 200) }
    ],
    dots: [
      { x: 0.012, y: 0.35, label: '① 无感觉', color: C.n, dx: 8, dy: 4 },
      { x: 0.03, y: 3, label: '② 有感觉，能自行摆脱', color: C.b, dx: 8, dy: -6 },
      { x: 0.08, y: 45, label: '③ 痉挛，无法自行挣脱', color: C.a, dx: 8, dy: -6 },
      { x: 0.25, y: 300, label: '④ 心室颤动', color: C.g, dx: 8, dy: -6 },
      { x: 0.1, y: 220, label: '220 V 触电工频电流 ≈ 220 mA', color: C.c, dx: 10, dy: -6 }
    ],
    xLog: true,
    yLog: true,
    xTicks: [0.01, 0.1, 1, 10],
    yTicks: [0.5, 1, 10, 100, 1000],
    xTickFmt: (v: number) => (v < 1 ? `${v * 1000} ms` : `${v} s`),
    yTickFmt: (v: number) => (v < 1 ? `${v} mA` : v < 1000 ? `${v} mA` : `${v / 1000} A`),
    xLabel: '通电时间',
    yLabel: '通过人体的电流',
    xMin: 0.01,
    xMax: 10,
    yMin: 0.3,
    yMax: 1000,
    note: '双对数坐标。10 mA 是一道坎：低于它能自己甩开，高于它就「抓住」了；50 mA 持续 1 s 以上即有心室颤动风险。漏电保护器取 30 mA·0.1 s 动作，远在任何危险边界之下'
  }
})

/**
 * 跨步电压：接地故障点周围电位按 1/r 衰减，两脚之间的电位差就是跨步电压。
 * 归一化：U(0.5 m) = 1。步距取 0.8 m。
 */
const stepvolt = computed(() => {
  const U = (r: number) => 0.5 / r
  const step = (r: number) => U(r) - U(r + 0.8)
  return {
    series: [
      { label: '对地电位 U(r)', color: C.a, width: 2.4, points: curve(U, 0.5, 20, 200) },
      { label: '跨步电压', color: C.g, width: 2.4, points: curve(step, 0.5, 20, 200) }
    ],
    dots: [
      { x: 0.5, y: 1, label: '落地点电位最高', color: C.a, dx: 10, dy: -6 },
      { x: 1, y: 0.22, label: '距 1 m 处跨步电压 0.22 U₀', color: C.g, dx: 10, dy: -8 },
      { x: 10, y: 0.0035, label: '10 m 外已无危险', color: C.n, dx: -120, dy: -6 }
    ],
    xLog: true,
    xTicks: [0.5, 1, 2, 5, 10, 20],
    xTickFmt: (v: number) => `${v} m`,
    xLabel: '距故障点的距离 r',
    yLabel: 'U / U₀',
    xMin: 0.5,
    xMax: 20,
    yMin: 0,
    yMax: 1.1,
    note: '电位按 1/r 衰减（对数横轴上接近一条斜直线）；跨步电压是两脚之间的电位差，越靠近落地点越大。逃离要并脚跳离或单脚跳——双脚不离地就没有电位差，正常大步走反而制造出最大的跨步电压'
}
})

/**
 * 整流波形三连：半波 / 桥式 / 桥式加电容滤波。
 * 滤波段用真正的 RC 充放电仿真（二极管导通时电容被充到瞬时值，截止时指数放电）。
 */
const rectify3 = computed(() => {
  const Vp = 1
  const cycles = 4 // 4 个半波
  const rcHalf = 3 // RC = 3 个半周期
  const tau = rcHalf / cycles // 折算成归一化时间 x（一个半周期 = 1/cycles）
  const N = 1600
  const dt = 1 / N
  const filtered: Pt[] = []
  let v = 0
  for (let i = 0; i <= N; i++) {
    const x = i * dt
    const u = Math.abs(Math.sin(Math.PI * cycles * x))
    v = u > v ? u : v - v * (dt / tau)
    filtered.push([x, v])
  }
  return {
    series: [
      { label: 'u₂', color: C.n, width: 1.3, dash: true, points: curve(x => Vp * Math.sin(Math.PI * cycles * x), 0, 1, 400) },
      { label: '半波', color: C.a, width: 1.6, points: curve(x => Math.max(0, Vp * Math.sin(Math.PI * cycles * x)), 0, 1, 400) },
      { label: '桥式', color: C.c, width: 2, points: curve(x => Math.abs(Vp * Math.sin(Math.PI * cycles * x)), 0, 1, 400) },
      { label: '桥式+滤波', color: C.b, width: 2.6, points: filtered },
      { label: 'U_dc ≈ 0.32 U_m', color: C.a, width: 1.2, dash: true, points: curve(() => 0.32, 0, 1, 3) },
      { label: 'U_dc ≈ 0.89 U_m', color: C.b, width: 1.2, dash: true, points: curve(() => 0.89, 0, 1, 3) }
    ],
    yLabel: 'u / U_m',
    xLabel: 't（4 个半波）',
    xMin: 0,
    xMax: 1,
    yMin: -0.2,
    yMax: 1.45,
    yTicks: [-1, -0.5, 0, 0.5, 1],
    note: '半波均值 0.32U_m ≈ 0.45U₂（负半周全丢了）；桥式 0.64U_m ≈ 0.9U₂；加电容滤波后升到 ≈0.89U_m ≈ 1.2U₂，但纹波仍看得出——C 越大放电越慢，空载时甚至逼近 √2·U₂ = 1.41U₂'
}
})

/**
 * 稳压特性：负载电流变化时，三种电源的输出电压表现。
 * E = 15V、R_s = 50Ω、稳压管 12V（能提供 60mA，留 5mA 维持击穿）。
 */
const loadreg = computed(() => {
  const un = (I: number) => 15 - 50 * I
  const ze = (I: number) => Math.min(12, 15 - 50 * I)
  const ser = (I: number) => 12 - 0.5 * I
  return {
    series: [
      { label: '无稳压', color: C.g, width: 2, points: curve(un, 0, 0.1, 60) },
      { label: '稳压管', color: C.a, width: 2.2, points: curve(ze, 0, 0.1, 120) },
      { label: '串联稳压', color: C.b, width: 2.6, points: curve(ser, 0, 0.1, 60) }
    ],
    marks: [{ x: 0.06, label: '稳压管极限 60 mA', color: C.a }],
    dots: [
      { x: 0.1, y: 11.95, label: '负载调整率 0.4%', color: C.b, dx: -110, dy: -8 },
      { x: 0.1, y: 10, label: '无稳压：掉到 10 V', color: C.g, dx: -108, dy: 14 }
    ],
    xTickFmt: (v: number) => `${Math.round(v * 1000)}`,
    xTicks: [0, 0.02, 0.04, 0.06, 0.08, 0.1],
    xLabel: '负载电流 I_L（mA）',
    yLabel: '输出电压（V）',
    xMin: 0,
    xMax: 0.1,
    yMin: 9.5,
    yMax: 15.4,
    note: '同样的 0→100 mA 负载变化：无稳压从 15 V 掉到 10 V（−33%）；稳压管在 60 mA 以内钉在 12 V，超限后和没稳压一样往下掉；串联稳压只掉 0.05 V（0.4%）。选型时先算最大负载电流，再决定用哪一种'
}
})

const cfg = computed(() => {
  switch (props.kind) {
    case 'threephase': return threePhase.value
    case 'rc': return rc.value
    case 'rl': return rl.value
    case 'resonance': return resonance.value
    case 'magnetize': return magnetize.value
    case 'damped': return damped.value
    case 'logic': return logic.value
    case 'threewire': return threewire.value
    case 'source': return source.value
    case 'ladder': return ladder.value
    case 'loadline': return loadline.value
    case 'nodepot': return nodepot.value
    case 'maxpower': return maxpower.value
    case 'superpose': return superpose.value
    case 'sinesum': return sinesum.value
    case 'reactance': return reactance.value
    case 'pfcurve': return pfcurve.value
    case 'qfamily': return qfamily.value
    case 'parares': return parares.value
    case 'phasorref': return phasorref.value
    case 'powertriangle': return powertriangle.value
    case 'neutraldisp': return neutraldisp.value
    case 'twowatt': return twowatt.value
    case 'instp3': return instp3.value
    case 'traeff': return traeff.value
    case 'vadjust': return vadjust.value
    case 'rotfield': return rotfield.value
    case 'torslip': return torslip.value
    case 'startcurve': return startcurve.value
    case 'dcmotor': return dcmotor.value
    case 'relaytime': return relaytime.value
    case 'scancycle': return scancycle.value
    case 'humanbody': return humanbody.value
    case 'stepvolt': return stepvolt.value
    case 'rectify3': return rectify3.value
    case 'loadreg': return loadreg.value
  }
})

/**
 * 把预设配置整理成 WaveChart 的 props。
 * 对数轴交给 WaveChart 的 xLog 统一处理，这里只做透传 ——
 * 曾经在预设内部先 log10 一次，结果 marks 没跟着转，标记线跑到了负半轴。
 */
const shown = computed(() => {
  const c = cfg.value
  return {
    series: c.series,
    xMin: c.xMin ?? 0,
    xMax: c.xMax ?? 1,
    xLog: c.xLog ?? false,
    xLabel: c.xLabel ?? 't →',
    yLabel: c.yLabel,
    yMin: c.yMin,
    yMax: c.yMax,
    marks: c.marks,
    dots: c.dots,
    xTicks: c.xTicks,
    yTicks: c.yTicks,
    xTickFmt: c.xTickFmt,
    yTickFmt: c.yTickFmt,
    note: c.note
  }
})
</script>

<template>
  <div class="preset">
    <WaveChart
      :series="shown.series as any"
      :w="620"
      :h="260"
      :x-min="shown.xMin"
      :x-max="shown.xMax"
      :x-log="shown.xLog"
      :y-min="shown.yMin"
      :y-max="shown.yMax"
      :marks="shown.marks"
      :dots="shown.dots"
      :x-label="shown.xLabel"
      :y-label="shown.yLabel"
      :x-ticks="shown.xTicks"
      :y-ticks="shown.yTicks"
      :x-tick-fmt="shown.xTickFmt"
      :y-tick-fmt="shown.yTickFmt"
    />
    <p v-if="shown.note" class="cap">{{ shown.note }}</p>
  </div>
</template>

<style scoped>
.preset :deep(svg) { width: 100%; height: auto; display: block; }
.cap {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}
</style>
