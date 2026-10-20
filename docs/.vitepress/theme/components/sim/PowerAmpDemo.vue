<script setup lang="ts">
import { computed, ref } from 'vue'

const VCC = ref(12)
const RL = ref(8)
const VOM = ref(6) // 输出峰值
const crossover = ref(true) // 是否加甲乙类偏置

const POM = computed(() => (VOM.value * VOM.value) / (2 * RL.value))
const PV = computed(() => (2 * VCC.value * VOM.value) / (Math.PI * RL.value))
const eta = computed(() => (PV.value > 0 ? (POM.value / PV.value) * 100 : 0))
const PTtotal = computed(() => Math.max(0, PV.value - POM.value))
const PT1 = computed(() => PTtotal.value / 2)
const etaMax = computed(() => (Math.PI / 4) * 100)
const PT1max = computed(() => (VCC.value * VCC.value) / (Math.PI * Math.PI * RL.value))
const vPeakMax = computed(() => (2 * VCC.value) / Math.PI)

// 波形：输出 + 两管半波电流（归一化到同一画布）
const N = 120
const cycles = 2
const outPts = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const v = VOM.value * Math.sin(2 * Math.PI * cycles * t)
    pts.push(`${(40 + t * 400).toFixed(1)},${(110 - (v / VCC.value) * 60).toFixed(1)}`)
  }
  return pts.join(' ')
})
const ic1Pts = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const s = Math.sin(2 * Math.PI * cycles * t)
    const ic = s > 0 ? (s * VOM.value) / RL.value : 0
    pts.push(`${(40 + t * 400).toFixed(1)},${(110 - (ic / (VCC.value / RL.value)) * 55).toFixed(1)}`)
  }
  return pts.join(' ')
})
const ic2Pts = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const s = Math.sin(2 * Math.PI * cycles * t)
    const ic = s < 0 ? (-s * VOM.value) / RL.value : 0
    pts.push(`${(40 + t * 400).toFixed(1)},${(110 - (ic / (VCC.value / RL.value)) * 55).toFixed(1)}`)
  }
  return pts.join(' ')
})
// 交越失真：零附近的死区造成输出毛刺
const deadPts = computed(() => {
  if (!crossover.value) return ''
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const s = Math.sin(2 * Math.PI * cycles * t)
    let v = VOM.value * s
    if (Math.abs(v) < 0.35) v = 0
    pts.push(`${(40 + t * 400).toFixed(1)},${(110 - (v / VCC.value) * 60).toFixed(1)}`)
  }
  return pts.join(' ')
})

// 效率 / 管耗曲线（横轴 VOM/VCC 从 0 到 1）
const etaCurve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 50; i++) {
    const x = i / 50
    pts.push(`${(40 + x * 400).toFixed(1)},${(180 - (x * 0.785) * 50).toFixed(1)}`)
  }
  return pts.join(' ')
})
const ptCurve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 50; i++) {
    const x = i / 50
    const pt = VCC.value * (x * VCC.value) / (Math.PI * RL.value) - ((x * VCC.value) ** 2) / (4 * RL.value)
    const y = Math.max(0, Math.min(50, (pt / PT1max.value) * 50))
    pts.push(`${(40 + x * 400).toFixed(1)},${(180 - y).toFixed(1)}`)
  }
  return pts.join(' ')
})
const qMark = computed(() => ({
  cx: 40 + (VOM.value / VCC.value) * 400,
  cy: 180 - eta.value / 100 * 50
}))
</script>

<template>
  <div class="pa">
    <div class="pa-ctl">
      <span class="pa-lab">V_CC</span>
      <input
        v-model.number="VCC" type="range" min="6" max="24" step="0.5" class="pa-slider"
        aria-label="电源电压 V_CC" :aria-valuetext="VCC + ' 伏特'" />
      <span class="pa-val">{{ VCC }} V</span>
      <span class="pa-lab">负载</span>
      <input
        v-model.number="RL" type="range" min="4" max="16" step="0.5" class="pa-slider"
        aria-label="负载电阻" :aria-valuetext="RL + ' 欧姆'" />
      <span class="pa-val">{{ RL }} Ω</span>
      <span class="pa-lab">输出幅度</span>
      <input
        v-model.number="VOM" type="range" min="0.5" :max="VCC" step="0.5" class="pa-slider"
        aria-label="输出电压幅度" :aria-valuetext="VOM + ' 伏特'" />
      <span class="pa-val">{{ VOM }} V</span>
      <span class="pa-lab">偏置</span>
      <button class="pa-btn" :class="{ on: crossover }" @click="crossover = !crossover">
        {{ crossover ? '甲乙类（无交越失真）' : '乙类（有交越失真）' }}
      </button>
    </div>

    <svg viewBox="0 0 460 200" class="pa-svg">
      <!-- 波形区 -->
      <line x1="40" y1="110" x2="440" y2="110" stroke="var(--vp-c-divider)" />
      <polyline :points="outPts" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
      <polyline v-if="!crossover" :points="deadPts" fill="none" stroke="#d5303e" stroke-width="2.4" />
      <polyline :points="ic1Pts" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 2" />
      <polyline :points="ic2Pts" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="1 2" />
      <text x="44" y="24" font-size="11" fill="var(--vp-c-text-2)">蓝 = 输出电压　虚线 = 上管电流　点线 = 下管电流（各导半周）</text>
      <!-- 曲线区 -->
      <line x1="40" y1="180" x2="440" y2="180" stroke="var(--vp-c-divider)" />
      <line x1="40" y1="180" x2="40" y2="125" stroke="var(--vp-c-divider)" />
      <polyline :points="etaCurve" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.2" />
      <polyline :points="ptCurve" fill="none" stroke="#d5303e" stroke-width="1.2" />
      <circle :cx="qMark.cx" :cy="qMark.cy" r="4" fill="var(--vp-c-brand-1)" />
      <text x="44" y="142" font-size="10" fill="var(--vp-c-brand-1)">蓝 = 效率 η(VOM)，峰值 π/4 ≈ 78.5%</text>
      <text x="44" y="155" font-size="10" fill="#d5303e">红 = 单管管耗 PT1(VOM)，最高点在 VOM = 2VCC/π ≈ {{ vPeakMax.toFixed(1) }} V</text>
    </svg>

    <div class="pa-grid">
      <div class="pa-cell">输出功率<br><b>{{ POM.toFixed(2) }} W</b></div>
      <div class="pa-cell">电源提供<br><b>{{ PV.toFixed(2) }} W</b></div>
      <div class="pa-cell">效率<br><b>{{ eta.toFixed(1) }} %</b></div>
      <div class="pa-cell">每管管耗<br><b>{{ PT1.toFixed(2) }} W</b></div>
      <div class="pa-cell">管耗极值<br><b>{{ PT1max.toFixed(2) }} W</b></div>
    </div>
    <div class="pa-hint">
      选管看三个数：功耗 > {{ (PT1max * 1.3).toFixed(1) }} W、耐压 > 2V<sub>CC</sub> = {{ 2 * VCC }} V、电流 > V<sub>CC</sub>/R<sub>L</sub> = {{ (VCC / RL).toFixed(2) }} A。
      <template v-if="!crossover">当前乙类：看输出波形在零点的断裂——这就是交越失真，小信号级尤其不能忍。</template>
    </div>
  </div>
</template>

<style scoped>
.pa { display: flex; flex-direction: column; gap: 10px; }
.pa-ctl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.pa-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.pa-slider { width: 100px; }
.pa-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 40px; }
.pa-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.pa-btn.on { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); font-weight: 600; }
.pa-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
.pa-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
.pa-cell {
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.pa-cell b { font-size: 15px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono, monospace); }
.pa-hint { font-size: 12px; color: var(--vp-c-text-2); }
</style>
