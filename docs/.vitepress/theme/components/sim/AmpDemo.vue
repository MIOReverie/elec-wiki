<script setup lang="ts">
import { computed, ref } from 'vue'

// 固定电路拓扑（与 02 章例题一致）：VCC=12V, Rb1=20k, Rc=2k, Re=2k, RL=3k
const VCC = 12
const Rb1 = 20e3
const Rc = 2e3
const Re = 2e3
const RL = 3e3

// 可调：偏置分压 Rb2（决定工作点）与 β、输入幅度
const Rb2 = ref(10e3)
const beta = ref(60)
const viAmp = ref(0.02) // V 峰值

const VB = computed(() => (VCC * Rb2.value) / (Rb1 + Rb2.value))
const VE = computed(() => VB.value - 0.7)
const IE = computed(() => VE.value / Re)
const ICQ = computed(() => IE.value)
const VCEQ = computed(() => VCC - ICQ.value * (Rc + Re))
const rbe = computed(() => 300 + (1 + beta.value) * 26e-3 / IE.value)
const RLp = computed(() => (Rc * RL) / (Rc + RL))
const Au = computed(() => (-beta.value * RLp.value) / rbe.value)
const ri = computed(() => {
  const rb = (Rb1 * Rb2.value) / (Rb1 + Rb2.value)
  return (rb * rbe.value) / (rb + rbe.value)
})

// 最大不失真输出
const VOM = computed(() => {
  const sat = VCEQ.value - 0.3
  const cut = ICQ.value * RLp.value
  return Math.max(0, Math.min(sat, cut))
})

// 波形：uCE = VCEQ − |Au|·vi(t)，限制在 [0.3, VCC]
const N = 160
const cycles = 2
const wave = computed(() => {
  const ptsUCE: string[] = []
  const ptsUI: string[] = []
  const ptsUO: string[] = []
  let clippedSat = false
  let clippedCut = false
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const ui = viAmp.value * Math.sin(2 * Math.PI * cycles * t)
    const uo = Au.value * ui
    let uce = VCEQ.value - uo
    if (uce < 0.3) { uce = 0.3; clippedSat = true }
    if (uce > VCC) { uce = VCC; clippedCut = true }
    const X = (t) => 40 + t * 400
    const Y = (v) => 170 - ((v - 0) / VCC) * 140
    ptsUCE.push(`${X(t).toFixed(1)},${Y(uce).toFixed(1)}`)
    ptsUI.push(`${X(t).toFixed(1)},${Y(ui * 10 + 0).toFixed(1)}`)
    ptsUO.push(`${X(t).toFixed(1)},${Y(Au.value * ui).toFixed(1)}`)
  }
  return { ptsUCE: ptsUCE.join(' '), ptsUI: ptsUI.join(' '), ptsUO: ptsUO.join(' '), clippedSat, clippedCut }
})

const clipText = computed(() => {
  const w = wave.value
  const drive = Math.abs(Au.value * viAmp.value)
  if (w.clippedSat && w.clippedCut) return '双向削顶：输入太大，且工作点不在中点'
  if (w.clippedSat) return '底部被削平 → 饱和失真（工作点偏高，或输入过大）'
  if (w.clippedCut) return '顶部被削平 → 截止失真（工作点偏低，或输入过大）'
  return '波形完整无失真'
})
const clipOK = computed(() => !wave.value.clippedSat && !wave.value.clippedCut)
</script>

<template>
  <div class="amp">
    <div class="amp-ctl">
      <span class="amp-lab">Rb₂（偏置）</span>
      <input v-model.number="Rb2" type="range" min="2000" max="60000" step="1000" class="amp-slider" />
      <span class="amp-val">{{ (Rb2 / 1000).toFixed(0) }} kΩ</span>
      <span class="amp-lab">β</span>
      <input v-model.number="beta" type="range" min="20" max="200" step="10" class="amp-slider" />
      <span class="amp-val">{{ beta }}</span>
      <span class="amp-lab">输入幅度</span>
      <input v-model.number="viAmp" type="range" min="0" max="0.06" step="0.005" class="amp-slider" />
      <span class="amp-val">{{ (viAmp * 1000).toFixed(0) }} mV</span>
    </div>

    <svg viewBox="0 0 460 200" class="amp-svg">
      <!-- 电源轨 -->
      <line x1="40" y1="20" x2="440" y2="20" stroke="var(--vp-c-divider)" stroke-dasharray="4 3" />
      <text x="42" y="16" font-size="10" fill="var(--vp-c-text-3)">VCC = {{ VCC }} V（截止边界）</text>
      <line x1="40" y1="30" x2="440" y2="30" stroke="var(--vp-c-divider)" stroke-dasharray="4 3" />
      <text x="42" y="46" font-size="10" fill="var(--vp-c-text-3)">0.3 V（饱和边界）</text>
      <!-- 工作点 -->
      <line x1="40" :y1="170 - (VCEQ / VCC) * 140" x2="440" :y2="170 - (VCEQ / VCC) * 140" stroke="var(--vp-c-text-3)" stroke-dasharray="6 3" />
      <text x="42" :y="170 - (VCEQ / VCC) * 140 - 4" font-size="10" fill="var(--vp-c-text-3)">V_CEQ = {{ VCEQ.toFixed(2) }} V</text>
      <!-- uCE 总波形（粗） -->
      <polyline :points="wave.ptsUCE" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
      <!-- 纯交流输出（细） -->
      <polyline :points="wave.ptsUO" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="3 2" />
      <text x="42" y="192" font-size="10" fill="var(--vp-c-text-3)">蓝粗线 = u_CE（交直流叠加）　灰细线 = u_o（纯交流）　横轴 = 时间</text>
    </svg>

    <div class="amp-read" :class="{ warn: !clipOK }">
      <b>{{ clipText }}</b>　Q 点：I_CQ = {{ (ICQ * 1000).toFixed(2) }} mA、V_CEQ = {{ VCEQ.toFixed(2) }} V、I_BQ = {{ ((ICQ / beta) * 1e6).toFixed(1) }} μA
    </div>
    <div class="amp-grid">
      <div class="amp-cell">电压放大倍数<br><b>{{ Au.toFixed(1) }}</b>（负号已体现为波形倒相）</div>
      <div class="amp-cell">输入电阻<br><b>{{ (ri / 1000).toFixed(2) }} kΩ</b></div>
      <div class="amp-cell">输出电阻<br><b>{{ (Rc / 1000).toFixed(1) }} kΩ</b></div>
      <div class="amp-cell">最大不失真峰值<br><b>{{ VOM.toFixed(2) }} V</b></div>
    </div>
    <div class="amp-hint">
      把 Rb₂ 拖大 → 工作点下移 → 顶部先削（截止失真）；拖小 → 底部先削（饱和失真）。输入幅度不变而波形变形的，永远是先碰到边界的那一侧。
    </div>
  </div>
</template>

<style scoped>
.amp { display: flex; flex-direction: column; gap: 10px; }
.amp-ctl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.amp-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.amp-slider { width: 100px; }
.amp-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 44px; }
.amp-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
.amp-read {
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-1);
}
.amp-read.warn { background: color-mix(in srgb, #d5303e 14%, transparent); }
.amp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
.amp-cell {
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.amp-cell b { font-size: 15px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono, monospace); }
.amp-hint { font-size: 12px; color: var(--vp-c-text-2); }
</style>
