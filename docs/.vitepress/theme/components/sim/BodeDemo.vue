<script setup lang="ts">
import { computed, ref } from 'vue'

// 波特图演示：幅频 |A| 与相频 φ
const Au0 = ref(57) // 中频增益（倍）
const fL = ref(100)
const fH = ref(100000)

const gainDb = computed(() => 20 * Math.log10(Math.abs(Au0.value)))
const BW = computed(() => fH.value - fL.value)
const GBD = computed(() => Math.abs(Au0.value) * fH.value)

// 幅频渐近线：低频段 +20dB/dec，中频段水平，高频段 −20dB/dec
const magPath = computed(() => {
  const pts: string[] = []
  const X = (f: number) => 40 + ((Math.log10(f) - 1) / 5) * 400 // 10Hz..1MHz
  const Y = (db: number) => 150 - ((db + 40) / 100) * 120
  const startDb = gainDb.value + 20 * Math.log10(fL.value / 10)
  pts.push(`${X(10).toFixed(1)},${Y(Math.max(-40, startDb)).toFixed(1)}`)
  pts.push(`${X(fL.value).toFixed(1)},${Y(gainDb.value).toFixed(1)}`)
  pts.push(`${X(fH.value).toFixed(1)},${Y(gainDb.value).toFixed(1)}`)
  const endDb = gainDb.value - 20 * Math.log10(1e6 / fH.value)
  pts.push(`${X(1e6).toFixed(1)},${Y(Math.max(-40, endDb)).toFixed(1)}`)
  return pts.join(' ')
})

// 相频渐近线：低频段 −90°（0.1fL 开始），中频 0，高频 +90°（10fH 到顶）→ 反相放大器总 −180
const phasePath = computed(() => {
  const X = (f: number) => 40 + ((Math.log10(f) - 1) / 5) * 400
  const Y = (deg: number) => 150 - ((deg + 200) / 400) * 120
  const pts: string[] = []
  pts.push(`${X(10).toFixed(1)},${Y(-200).toFixed(1)}`)
  pts.push(`${X(fL.value / 10).toFixed(1)},${Y(-200).toFixed(1)}`)
  pts.push(`${X(fL.value).toFixed(1)},${Y(-190).toFixed(1)}`)
  pts.push(`${X(fH.value).toFixed(1)},${Y(-190).toFixed(1)}`)
  pts.push(`${X(fH.value * 10).toFixed(1)},${Y(-200).toFixed(1)}`)
  pts.push(`${X(1e6).toFixed(1)},${Y(-200).toFixed(1)}`)
  return pts.join(' ')
})

// 精确曲线（实线叠加，帮助看清渐近线与实际的差别）
const exactMag = computed(() => {
  const pts: string[] = []
  const X = (f: number) => 40 + ((Math.log10(f) - 1) / 5) * 400
  const Y = (db: number) => 150 - ((db + 40) / 100) * 120
  for (let i = 0; i <= 120; i++) {
    const f = Math.pow(10, 1 + (i / 120) * 5)
    const a = (Au0.value * (f / fL.value)) / Math.sqrt(1 + (f / fL.value) ** 2) / Math.sqrt(1 + (f / fH.value) ** 2)
    const db = 20 * Math.log10(Math.max(1e-4, Math.abs(a)))
    pts.push(`${X(f).toFixed(1)},${Y(db).toFixed(1)}`)
  }
  return pts.join(' ')
})
function reset() {
  Au0.value = 57
  fL.value = 100
  fH.value = 100000
}

const svgLabel = computed(
  () =>
    `波特图：中频增益 ${Au0.value} 倍（${gainDb.value.toFixed(1)} dB），下限频率 ${fL.value} Hz，` +
    `上限频率 ${fH.value} Hz；带宽 ${(BW.value / 1000).toFixed(1)} kHz，增益带宽积 ${(GBD.value / 1e6).toFixed(1)} MHz。`
)
</script>

<template>
  <div class="bode">
    <div class="bode-ctl">
      <span class="bode-lab">中频增益</span>
      <input
        v-model.number="Au0" type="range" min="10" max="200" step="1" class="bode-slider"
        aria-label="中频增益" :aria-valuetext="Au0 + ' 倍（' + gainDb.toFixed(1) + ' dB）'" />
      <span class="bode-val">{{ Au0 }} 倍（{{ gainDb.toFixed(1) }} dB）</span>
      <span class="bode-lab">下限频率</span>
      <input
        v-model.number="fL" type="range" min="10" max="1000" step="10" class="bode-slider"
        aria-label="下限频率" :aria-valuetext="fL + ' 赫兹'" />
      <span class="bode-val">{{ fL }} Hz</span>
      <span class="bode-lab">上限频率</span>
      <input
        v-model.number="fH" type="range" min="10000" max="1000000" step="10000" class="bode-slider"
        aria-label="上限频率" :aria-valuetext="(fH / 1000).toFixed(0) + ' 千赫'" />
      <span class="bode-val">{{ (fH / 1000).toFixed(0) }} kHz</span>
      <button
        type="button"
        class="bode-reset"
        aria-label="重置波特图演示：把中频增益与上下限频率恢复到默认值"
        @click="reset"
      >重置</button>
    </div>

    <svg viewBox="0 0 460 200" class="bode-svg" role="img" :aria-label="svgLabel">
      <!-- 网格与坐标 -->
      <line x1="40" y1="150" x2="440" y2="150" stroke="var(--vp-c-divider)" />
      <line x1="40" y1="150" x2="40" y2="20" stroke="var(--vp-c-divider)" />
      <text x="420" y="168" font-size="11" fill="var(--vp-c-text-3)">lg f</text>
      <text x="10" y="32" font-size="11" fill="var(--vp-c-text-3)">dB</text>
      <text x="44" y="145" font-size="10" fill="var(--vp-c-text-3)">10Hz</text>
      <text x="220" y="168" font-size="10" fill="var(--vp-c-text-3)">10kHz</text>
      <text x="410" y="168" font-size="10" fill="var(--vp-c-text-3)">1MHz</text>
      <!-- 精确幅频曲线 -->
      <polyline :points="exactMag" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.6" />
      <!-- 渐近线 -->
      <polyline :points="magPath" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" stroke-dasharray="6 3" />
      <!-- 3dB 点 -->
      <line x1="40" :y1="150 - ((gainDb - 3 + 40) / 100) * 120" x2="440" :y2="150 - ((gainDb - 3 + 40) / 100) * 120" stroke="#d5303e" stroke-dasharray="2 3" />
      <text x="46" :y="150 - ((gainDb - 3 + 40) / 100) * 120 - 3" font-size="10" fill="#d5303e">半功率点 −3dB（0.707 倍）</text>
      <text x="46" y="24" font-size="11" fill="var(--vp-c-text-2)">蓝虚线 = 渐近近似（画图用）　黑实线 = 实际响应</text>
    </svg>
    <p class="sr-only">{{ svgLabel }}</p>

    <div class="bode-read">
      带宽 $BW=f_H-f_L\approx{{ (BW / 1000).toFixed(1) }}\,\text{kHz}$；增益带宽积 $\approx{{ (GBD / 1e6).toFixed(1) }}\,\text{MHz}$
    </div>
    <div class="bode-hint">
      把「中频增益」拖大而 fH 不变：注意带宽不变但增益带宽积在涨——单级放大器的增益带宽积由管子决定，负反馈才能「拿增益换带宽」（[第 6 章](/analog/feedback) 的核心用途）。
    </div>
  </div>
</template>

<style scoped>
.bode { display: flex; flex-direction: column; gap: 10px; }
.bode-ctl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.bode-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.bode-slider { width: 100px; }
.bode-reset {
  padding: 4px 12px;
  font-size: 12px;
  font-family: inherit;
  border-radius: 7px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}
.bode-reset:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.bode-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 90px; }
.bode-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
.bode-read {
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-1);
}
.bode-hint { font-size: 12px; color: var(--vp-c-text-2); }
</style>
