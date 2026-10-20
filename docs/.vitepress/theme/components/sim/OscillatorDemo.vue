<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Seg from '../Seg.vue'

type Mode = 'wien' | 'square' | 'lc'
const mode = ref<Mode>('wien')

const WAVE_W = 480
const WAVE_H = 170
const MID = WAVE_H / 2
const UZ = 6

// ============ 页签 1：文氏桥起振 ============
const A = ref(3.4)          // 同相放大倍数
const Rw = ref(10)          // kΩ
const Cw = ref(0.01)        // μF
const f0 = computed(() => 1 / (2 * Math.PI * Rw.value * 1e3 * Cw.value * 1e-6))
const gain = computed(() => A.value / 3) // f0 处 F = 1/3
const oscState = computed(() => {
  if (gain.value < 0.995) return { key: 'die', label: '衰减——起不来', cls: 'bad' }
  if (gain.value <= 1.005) return { key: 'crit', label: '临界——理论上刚好维持', cls: 'warn' }
  return { key: 'grow', label: '起振→稳幅', cls: 'ok' }
})

// 起振包络动画：每拍乘一次环路增益，超 1 后被稳幅电路按住
const env = ref(0.3)
const phase = ref(0)
let timer: number | undefined
function resetEnv() { env.value = 0.3 }
watch([A, mode], () => { if (mode.value === 'wien') resetEnv() })

const wavePoints = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 160; i++) {
    const x = (i / 160) * WAVE_W
    const y = MID - env.value * 62 * Math.sin(phase.value + (i / 160) * Math.PI * 4)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
})

// |F(f)| 幅频小曲线（log 频率轴）
const FW = 480, FH = 96, FMID = FH - 18
function fMag(f: number): number {
  const w = 2 * Math.PI * f, x = w * Rw.value * 1e3 * Cw.value * 1e-6 - 1 / (w * Rw.value * 1e3 * Cw.value * 1e-6)
  return 1 / Math.sqrt(9 + x * x)
}
const fCurve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 120; i++) {
    const f = f0.value * Math.pow(10, -1 + (i / 120) * 2)
    const x = (i / 120) * FW
    const y = FMID - Math.min(1, fMag(f) / 0.36) * (FH - 26)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
})
const f0x = computed(() => FW / 2)
const thirdY = computed(() => FMID - (1 / 3 / 0.36) * (FH - 26))

// ============ 页签 2：方波 / 三角波发生器 ============
const kRatio = ref(2)       // R2/R1
const tauMs = ref(1)      // R·C，单位 ms
const Um = computed(() => UZ / (1 + kRatio.value))
const freq = computed(() => (1 + kRatio.value) / (4 * tauMs.value * 1e-3))
const sqPhase = ref(0)

const sqPoints = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 200; i++) {
    const t = i / 200
    const x = t * WAVE_W
    const v = Math.sin(sqPhase.value + t * Math.PI * 4) >= 0 ? 1 : -1
    const y = MID - 10 - v * 34
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
})
const triPoints = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 200; i++) {
    const t = i / 200
    const x = t * WAVE_W
    const p = (sqPhase.value / (Math.PI * 2) + t * 2) % 1
    const tri = p < 0.5 ? (1 - 4 * p) : (4 * p - 3)
    const y = MID + 34 - tri * (34 - 8)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
})

// ============ 页签 3：LC 选频 ============
const Lh = ref(100)         // μH
const Cf = ref(0.01)        // μF
const Qv = ref(100)
const RW = 1                // 线圈电阻 Ω
const lcF0 = computed(() => 1 / (2 * Math.PI * Math.sqrt(Lh.value * 1e-6 * Cf.value * 1e-6)))
const lcBW = computed(() => lcF0.value / Qv.value)
const lcRp = computed(() => Qv.value * Qv.value * RW)
const rho = computed(() => Math.sqrt(Lh.value / Cf.value))

const LW = 480, LH = 190, LMID = LH - 26
function zMag(f: number): number {
  const d = Qv.value * (f / lcF0.value - lcF0.value / f)
  return lcRp.value / Math.sqrt(1 + d * d)
}
const lcCurve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 140; i++) {
    const f = lcF0.value * Math.pow(10, -1.5 + (i / 140) * 3)
    const x = (i / 140) * LW
    const y = LMID - Math.min(1, zMag(f) / lcRp.value) * (LH - 44)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
})
const lcF0x = computed(() => LW / 2)
const lcRpY = computed(() => LMID - (LH - 44))
const lcBwX = computed(() => ({
  lo: LW / 2 - (Math.log10(1 + 1 / (2 * Qv.value)) / 3) * LW,
  hi: LW / 2 + (Math.log10(1 + 1 / (2 * Qv.value)) / 3) * LW
}))

// ============ 动画驱动 ============
let raf = 0
let lastBeat = 0
function tick(t: number) {
  if (!lastBeat) lastBeat = t
  if (mode.value === 'wien') {
    phase.value += 0.055
    if (t - lastBeat > 110) {
      lastBeat = t
      env.value = Math.min(1, Math.max(0.02, env.value * gain.value))
    }
  } else if (mode.value === 'square') {
    sqPhase.value += 0.05
  }
  raf = requestAnimationFrame(tick)
}
onMounted(() => { raf = requestAnimationFrame(tick) })
onUnmounted(() => { cancelAnimationFrame(raf) })

function fmt(f: number): string {
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz'
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz'
  return f.toFixed(0) + ' Hz'
}
</script>

<template>
  <div class="osc">
    <Seg
      v-model="mode"
      :options="[
        { value: 'wien', label: '文氏桥起振' },
        { value: 'square', label: '方波 / 三角波' },
        { value: 'lc', label: 'LC 选频' }
      ]"
    />

    <!-- 页签 1：文氏桥 -->
    <div v-if="mode === 'wien'" class="osc-body">
      <div class="osc-row">
        <label class="osc-slider">
          <span>放大倍数 A（同相放大器 1+R<sub>f</sub>/R₁）</span>
          <input
            type="range" min="1" max="4.5" step="0.1" v-model.number="A"
            aria-label="同相放大器放大倍数 A" :aria-valuetext="'A = ' + A.toFixed(1)" />
          <b>{{ A.toFixed(1) }}</b>
        </label>
        <label class="osc-slider">
          <span>R（选频电阻，C = 0.01 μF）</span>
          <input
            type="range" min="3" max="30" step="1" v-model.number="Rw"
            aria-label="文氏桥选频电阻 R" :aria-valuetext="Rw + ' 千欧'" />
          <b>{{ Rw }} kΩ</b>
        </label>
      </div>
      <div class="osc-read">
        <div class="osc-kv"><span>f₀ = 1/2πRC</span><b>{{ fmt(f0) }}</b></div>
        <div class="osc-kv"><span>F(f₀)</span><b>1/3</b></div>
        <div class="osc-kv"><span>|AF|</span><b>{{ gain.toFixed(2) }}</b></div>
        <div class="osc-kv" :class="oscState.cls"><span>状态</span><b>{{ oscState.label }}</b></div>
      </div>
      <svg class="osc-svg" :viewBox="`0 0 ${WAVE_W} ${WAVE_H}`">
        <line :x1="0" :y1="MID" :x2="WAVE_W" :y2="MID" stroke="var(--vp-c-divider)" stroke-width="1" />
        <line :x1="0" :y1="MID - 62" :x2="WAVE_W" :y2="MID - 62" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
        <line :x1="0" :y1="MID + 62" :x2="WAVE_W" :y2="MID + 62" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
        <polyline :points="wavePoints" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.5" />
        <text :x="8" :y="18" font-size="11" fill="var(--vp-c-text-3)">输出幅度包络：每振荡一个周期乘一次 |AF|</text>
      </svg>
      <svg class="osc-svg small" :viewBox="`0 0 ${FW} ${FH}`">
        <line :x1="0" :y1="FMID" :x2="FW" :y2="FMID" stroke="var(--vp-c-divider)" stroke-width="1" />
        <line :x1="f0x" :y1="0" :x2="f0x" :y2="FH" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />
        <line :x1="0" :y1="thirdY" :x2="FW" :y2="thirdY" stroke="var(--vp-c-tip-1)" stroke-width="1" stroke-dasharray="4 3" />
        <polyline :points="fCurve" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <text :x="f0x + 6" :y="14" font-size="11" fill="var(--vp-c-brand-1)">f₀</text>
        <text :x="8" :y="thirdY - 6" font-size="11" fill="var(--vp-c-tip-1)">1/3</text>
        <text :x="8" :y="FH - 4" font-size="10" fill="var(--vp-c-text-3)">选频网络 |F(f)|：只有 f₀ 处相移为 0、衰减 1/3</text>
      </svg>
      <p class="osc-note">
        起振要同时满足两个条件：<b>相位条件</b>（选频网络在 f₀ 处相移 0°，配合同相放大器正好正反馈）和
        <b>幅度条件</b>（|AF| > 1，这里就是要 A &gt; 3）。把 A 拖到 3 以下看包络衰减；拖过 3 后包络增长，
        真实电路靠稳压管或热敏电阻这类非线性元件把幅度「按住」在 1——否则会一直增大到电源轨饱和。
      </p>
    </div>

    <!-- 页签 2：方波 / 三角波 -->
    <div v-else-if="mode === 'square'" class="osc-body">
      <div class="osc-row">
        <label class="osc-slider">
          <span>R₂/R₁（决定三角波峰值）</span>
          <input
            type="range" min="0.5" max="4" step="0.1" v-model.number="kRatio"
            aria-label="电阻比 R₂/R₁" :aria-valuetext="'R₂/R₁ = ' + kRatio.toFixed(1)" />
          <b>{{ kRatio.toFixed(1) }}</b>
        </label>
        <label class="osc-slider">
          <span>积分时间常数 R·C</span>
          <input
            type="range" min="0.05" max="5" step="0.05" v-model.number="tauMs"
            aria-label="积分时间常数 R·C" :aria-valuetext="tauMs.toFixed(2) + ' 毫秒'" />
          <b>{{ tauMs.toFixed(2) }} ms</b>
        </label>
      </div>
      <div class="osc-read">
        <div class="osc-kv"><span>三角波峰值 U<sub>m</sub> = U<sub>Z</sub>·R₁/(R₁+R₂)</span><b>{{ Um.toFixed(2) }} V</b></div>
        <div class="osc-kv"><span>频率 f = (1+R₂/R₁)/(4RC)</span><b>{{ fmt(freq) }}</b></div>
      </div>
      <svg class="osc-svg" :viewBox="`0 0 ${WAVE_W} ${WAVE_H}`">
        <line :x1="0" :y1="MID" :x2="WAVE_W" :y2="MID" stroke="var(--vp-c-divider)" stroke-width="1" />
        <polyline :points="sqPoints" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2.5" />
        <polyline :points="triPoints" fill="none" stroke="var(--vp-c-tip-1)" stroke-width="2.5" />
        <text :x="8" :y="18" font-size="11" fill="var(--vp-c-brand-1)">滞回比较器输出：方波 ±U_Z = ±6 V</text>
        <text :x="8" :y="WAVE_H - 8" font-size="11" fill="var(--vp-c-tip-1)">积分器输出：三角波 ±U_m</text>
      </svg>
      <p class="osc-note">
        这是一个「用反馈把两个运放锁死在一起」的经典结构：比较器输出方波，积分器把它积分成三角波，
        三角波的峰值一旦碰到比较器的门限 ±U<sub>m</sub> 就翻转。所以<b>调 R₂/R₁ 只改峰値不改变频率的趋势</b>，
        调 RC 直接改频率——R₂/R₁ 和 RC 在公式里各管一头，互不打架。
      </p>
    </div>

    <!-- 页签 3：LC 选频 -->
    <div v-else class="osc-body">
      <div class="osc-row">
        <label class="osc-slider">
          <span>L（C = 0.01 μF，线圈电阻 1 Ω）</span>
          <input
            type="range" min="10" max="500" step="10" v-model.number="Lh"
            aria-label="振荡电感 L" :aria-valuetext="Lh + ' 微亨'" />
          <b>{{ Lh }} μH</b>
        </label>
        <label class="osc-slider">
          <span>品质因数 Q</span>
          <input
            type="range" min="10" max="300" step="10" v-model.number="Qv"
            aria-label="品质因数 Q" :aria-valuetext="'Q = ' + Qv" />
          <b>{{ Qv }}</b>
        </label>
      </div>
      <div class="osc-read">
        <div class="osc-kv"><span>f₀ = 1/2π√(LC)</span><b>{{ fmt(lcF0) }}</b></div>
        <div class="osc-kv"><span>带宽 BW = f₀/Q</span><b>{{ fmt(lcBW) }}</b></div>
        <div class="osc-kv"><span>谐振阻抗 Q²·R<sub>w</sub></span><b>{{ (lcRp / 1000).toFixed(1) }} kΩ</b></div>
        <div class="osc-kv"><span>特性阻抗 √(L/C)</span><b>{{ rho.toFixed(0) }} Ω</b></div>
      </div>
      <svg class="osc-svg" :viewBox="`0 0 ${LW} ${LH}`">
        <line :x1="0" :y1="LMID" :x2="LW" :y2="LMID" stroke="var(--vp-c-divider)" stroke-width="1" />
        <line :x1="lcF0x" :y1="0" :x2="lcF0x" :y2="LH" stroke="var(--vp-c-brand-1)" stroke-width="1" stroke-dasharray="4 3" />
        <line :x1="0" :y1="lcRpY" :x2="LW" :y2="lcRpY" stroke="var(--vp-c-tip-1)" stroke-width="1" stroke-dasharray="4 3" />
        <rect :x="lcBwX.lo" :y="lcRpY" :width="lcBwX.hi - lcBwX.lo" :height="LMID - lcRpY" fill="var(--vp-c-brand-1)" fill-opacity="0.12" />
        <polyline :points="lcCurve" fill="none" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <text :x="lcF0x + 6" :y="14" font-size="11" fill="var(--vp-c-brand-1)">f₀</text>
        <text :x="8" :y="lcRpY - 6" font-size="11" fill="var(--vp-c-tip-1)">谐振阻抗（log 频率轴）</text>
        <text :x="8" :y="LH - 4" font-size="10" fill="var(--vp-c-text-3)">阴影 = 通频带 BW；Q 越大曲线越尖、选频能力越强，但相位/幅度随频率漂移也越敏感</text>
      </svg>
      <p class="osc-note">
        LC 并联谐振回路是变压器反馈式、电感三点式振荡器的选频网络：阻抗在 f₀ 达到峰值，
        偏离 f₀ 就迅速跌落，等于只允许 f₀ 附近的频率满足起振条件。代价是 Q 越高越「娇气」——
        元件老化引起的频率漂移同样被放大，所以石英晶体（等效 Q 上万）专治频率稳定度。
      </p>
    </div>
  </div>
</template>

<style scoped>
.osc { margin: 22px 0; }
.osc-body { margin-top: 12px; }
.osc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
@media (max-width: 700px) { .osc-row { grid-template-columns: 1fr; } }
.osc-slider { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--vp-c-text-2); flex-wrap: wrap; }
.osc-slider span { flex: 1; min-width: 140px; }
.osc-slider input[type='range'] { flex: 1; min-width: 110px; accent-color: var(--vp-c-brand-1); }
.osc-slider b { font-family: var(--vp-font-family-mono); color: var(--vp-c-text-1); min-width: 62px; text-align: right; }
.osc-read { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.osc-kv {
  display: flex; flex-direction: column; gap: 2px;
  padding: 6px 11px; border-radius: 8px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  font-size: 12px; color: var(--vp-c-text-3);
}
.osc-kv b { font-size: 14px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.osc-kv.ok b { color: var(--vp-c-brand-1); }
.osc-kv.warn b { color: var(--vp-c-tip-1); }
.osc-kv.bad b { color: var(--vp-c-danger-1); }
.osc-svg { width: 100%; height: auto; display: block; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 10px; }
.osc-svg.small { margin-top: 8px; }
.osc-note {
  margin: 10px 2px 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.75;
}
.osc-note b { color: var(--vp-c-text-2); }
</style>
