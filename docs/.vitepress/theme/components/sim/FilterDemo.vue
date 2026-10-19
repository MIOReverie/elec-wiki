<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

const tab = ref<'int' | 'filter' | 'comp'>('int')

// ============ 积分器：方波 → 三角波 ============
const R = ref(10e3)
const C = ref(0.1e-6)
const fIn = ref(500)
const amp = ref(2)

const intOut = computed(() => {
  const pts: string[] = []
  const N = 120
  const T = 1 / fIn.value
  const slope = amp.value / (R.value * C.value) // V/s
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 4 * T // 画 4 个周期
    // 三角波：以 T/2 为半周，幅值 = slope·T/2
    const half = (t % T) / T
    const tri = (half < 0.5 ? 2 * half - 0.5 : 1.5 - 2 * half) * (slope * T * 0.5)
    pts.push(`${(40 + (i / N) * 400).toFixed(1)},${(60 - tri * 15).toFixed(1)}`)
  }
  return pts.join(' ')
})
const intSq = computed(() => {
  const pts: string[] = []
  const N = 120
  const T = 1 / fIn.value
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 4 * T
    const s = (t % T) / T < 0.5 ? 1 : -1
    pts.push(`${(40 + (i / N) * 400).toFixed(1)},${(60 - s * amp.value * 8).toFixed(1)}`)
  }
  return pts.join(' ')
})
const intPeak = computed(() => ((amp.value / (R.value * C.value)) * (1 / fIn.value) * 0.5))

// ============ 有源低通：幅频响应 ============
const f0 = ref(1590)
const order = ref(1)
const Q = ref(0.707)
const magCurve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 140; i++) {
    const f = Math.pow(10, 1 + (i / 140) * 4) // 10Hz..100kHz
    const x = f / f0.value
    let mag: number
    if (order.value === 1) mag = 1 / Math.sqrt(1 + x * x)
    else mag = 1 / Math.sqrt((1 - x * x) ** 2 + (x / Q.value) ** 2)
    mag = Math.min(mag, 1.05)
    pts.push(`${(40 + (i / 140) * 400).toFixed(1)},${(150 - mag * 120).toFixed(1)}`)
  }
  return pts.join(' ')
})
const atten = computed(() => {
  const f = 10000
  const x = f / f0.value
  if (order.value === 1) return 1 / Math.sqrt(1 + x * x)
  return 1 / Math.sqrt((1 - x * x) ** 2 + (x / Q.value) ** 2)
})

// ============ 滞环比较器：波形整形 ============
const Uz = ref(6)
const R1c = ref(10e3)
const R2c = ref(20e3)
const Vth = computed(() => (Uz.value * R1c.value) / (R1c.value + R2c.value))
const compIn = computed(() => {
  // 带噪声的正弦输入
  const pts: string[] = []
  for (let i = 0; i <= 160; i++) {
    const t = i / 160
    const s = 3 * Math.sin(2 * Math.PI * 2 * t) + 0.8 * Math.sin(2 * Math.PI * 40 * t)
    pts.push(`${(40 + t * 400).toFixed(1)},${(170 - s * 12).toFixed(1)}`)
  }
  return pts.join(' ')
})
const compOut = computed(() => {
  const pts: string[] = []
  let state = 1
  for (let i = 0; i <= 160; i++) {
    const t = i / 160
    const s = 3 * Math.sin(2 * Math.PI * 2 * t) + 0.8 * Math.sin(2 * Math.PI * 40 * t)
    const thr = state > 0 ? -Vth.value : Vth.value
    if (state > 0 && s < thr) state = -1
    else if (state < 0 && s > thr) state = 1
    pts.push(`${(40 + t * 400).toFixed(1)},${(60 + (state > 0 ? -25 : 25))}`)
  }
  return pts.join(' ')
})
</script>

<template>
  <div class="fd">
    <Seg v-model="tab" :options="[
      { value: 'int', label: '积分器：方波变三角' },
      { value: 'filter', label: '有源低通：滤掉高频' },
      { value: 'comp', label: '滞环比较器：整形' }
    ]" />

    <template v-if="tab === 'int'">
      <div class="fd-ctl">
        <span class="fd-lab">输入频率</span>
        <input v-model.number="fIn" type="range" min="100" max="2000" step="50" class="fd-slider" />
        <span class="fd-val">{{ fIn }} Hz</span>
        <span class="fd-lab">R</span>
        <input v-model.number="R" type="range" min="1000" max="100000" step="1000" class="fd-slider" />
        <span class="fd-val">{{ (R / 1000).toFixed(0) }} kΩ</span>
        <span class="fd-lab">C</span>
        <input v-model.number="C" type="range" min="0.01" max="1" step="0.01" class="fd-slider" />
        <span class="fd-val">{{ (C * 1e6).toFixed(2) }} μF</span>
      </div>
      <svg viewBox="0 0 460 120" class="fd-svg">
        <polyline :points="intSq" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 2" />
        <polyline :points="intOut" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
        <line x1="40" y1="60" x2="440" y2="60" stroke="var(--vp-c-divider)" />
        <text x="44" y="16" font-size="10" fill="var(--vp-c-text-3)">灰虚线 = 输入方波（运放线性区已假设）</text>
      </svg>
      <div class="fd-read">
        三角波峰值 $=\dfrac{U_{im}}{2R C f}=\dfrac{{ amp }}}{2\times{{ (R / 1000).toFixed(0) }}\,\text{k}\times{{ (C * 1e6).toFixed(2) }}\,\mu\times{{ fIn }}}\approx<b>{{ intPeak.toFixed(2) }} V</b>
        ——输入频率越高或 RC 越大，输出幅度越小（积分增益 $1/\omega RC$ 随频率下降）。
      </div>
    </template>

    <template v-else-if="tab === 'filter'">
      <div class="fd-ctl">
        <span class="fd-lab">阶数</span>
        <Seg v-model="order" :options="[{ value: 1, label: '一阶' }, { value: 2, label: '二阶' }]" />
        <span class="fd-lab">特征频率 f₀</span>
        <input v-model.number="f0" type="range" min="200" max="10000" step="10" class="fd-slider" />
        <span class="fd-val">{{ (f0 / 1000).toFixed(2) }} kHz</span>
        <span v-if="order === 2" class="fd-lab">Q</span>
        <input v-if="order === 2" v-model.number="Q" type="range" min="0.5" max="5" step="0.1" class="fd-slider" />
        <span v-if="order === 2" class="fd-val">{{ Q.toFixed(1) }}</span>
      </div>
      <svg viewBox="0 0 460 160" class="fd-svg">
        <line x1="40" y1="150" x2="440" y2="150" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="150" x2="40" y2="20" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="30" x2="440" y2="30" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3" />
        <text x="44" y="27" font-size="10" fill="var(--vp-c-text-3)">|A|=1</text>
        <text x="420" y="168" font-size="11" fill="var(--vp-c-text-3)">lg f</text>
        <text x="10" y="32" font-size="11" fill="var(--vp-c-text-3)">|A|</text>
        <polyline :points="magCurve" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
        <text x="46" y="14" font-size="11" fill="var(--vp-c-text-2)">一阶：过渡带平缓（−20 dB/dec）；二阶 Q 高：靠近 f₀ 有峰</text>
      </svg>
      <div class="fd-read">
        10 kHz 处衰减到 <b>{{ (atten * 100).toFixed(1) }}%</b>（{{ (20 * Math.log10(Math.max(1e-6, atten))).toFixed(1) }} dB）。
        二阶低通的 $Q=0.707$ 是「巴特沃斯」最平坦设计，$Q$ 越高通带内越耸、滚降越陡——**用通带起伏换阻带衰减**。
      </div>
    </template>

    <template v-else>
      <div class="fd-ctl">
        <span class="fd-lab">稳压值 ±Uz</span>
        <input v-model.number="Uz" type="range" min="2" max="12" step="0.5" class="fd-slider" />
        <span class="fd-val">±{{ Uz }} V</span>
        <span class="fd-lab">R₁（下）</span>
        <input v-model.number="R1c" type="range" min="1000" max="50000" step="1000" class="fd-slider" />
        <span class="fd-val">{{ (R1c / 1000).toFixed(0) }} kΩ</span>
        <span class="fd-lab">R₂（反馈）</span>
        <input v-model.number="R2c" type="range" min="1000" max="100000" step="1000" class="fd-slider" />
        <span class="fd-val">{{ (R2c / 1000).toFixed(0) }} kΩ</span>
      </div>
      <svg viewBox="0 0 460 200" class="fd-svg">
        <line x1="40" y1="170" x2="440" y2="170" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="60" x2="440" y2="60" stroke="var(--vp-c-divider)" stroke-dasharray="4 3" />
        <polyline :points="compIn" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1" />
        <polyline :points="compOut" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
        <text x="44" y="16" font-size="10" fill="var(--vp-c-text-3)">灰 = 带噪输入（小幅值也被整成方波）</text>
        <text x="44" y="55" font-size="10" fill="var(--vp-c-text-3)">+Vth</text>
        <text x="44" y="185" font-size="10" fill="var(--vp-c-text-3)">−Vth</text>
      </svg>
      <div class="fd-read">
        阈值 $V_{th}=\pm U_z\dfrac{R_1}{R_1+R_2}=\pm<b>{{ Vth.toFixed(2) }} V</b>，回差宽度 $2V_{th}=$<b>{{ (2 * Vth).toFixed(2) }} V</b>——
        输入只有越过「反方向的阈值」才翻转，所以输出是干净的方波，噪声被回差吃掉。<b>回差越大越抗噪，但灵敏度越低</b>。
      </div>
    </template>
  </div>
</template>

<style scoped>
.fd { display: flex; flex-direction: column; gap: 10px; }
.fd-ctl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.fd-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.fd-slider { width: 100px; }
.fd-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 46px; }
.fd-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
.fd-read {
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-1);
}
</style>
