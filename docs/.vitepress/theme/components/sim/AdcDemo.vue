<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

const tab = ref<'samp' | 'dac' | 'pwm'>('samp')

// ========== 采样与量化 ==========
const fin = ref(5) // 输入频率（任意单位）
const fs = ref(40) // 采样频率
const bits = ref(4)
const VFS = ref(5) // 满量程
const N = 200 // 画多少个连续采样时刻

const nyquistOK = computed(() => fs.value >= 2 * fin.value)
const aliasF = computed(() => {
  if (nyquistOK.value) return 0
  return Math.abs(fs.value - fin.value)
})
const LSB = computed(() => VFS.value / Math.pow(2, bits.value))

// 连续波形路径
const wavePts = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    pts.push(`${(t * 460).toFixed(1)},${(60 - Math.sin(2 * Math.PI * fin.value * t) * 45).toFixed(1)}`)
  }
  return pts.join(' ')
})

// 采样点（按 fs 在 t∈[0,1] 内取）
const sampleDots = computed(() => {
  const count = Math.round(fs.value)
  const dots: { x: number; y: number; qy: number; v: number }[] = []
  for (let k = 0; k <= count; k++) {
    const t = k / fs.value
    if (t > 1) break
    const v = Math.sin(2 * Math.PI * fin.value * t) // -1..1
    const av = (v * VFS.value) / 2 // 映射到满量程
    const q = Math.max(0, Math.min(Math.pow(2, bits.value) - 1, Math.round(av / LSB.value)))
    const qv = q * LSB.value
    dots.push({
      x: (t * 460).toFixed(1) as unknown as number,
      y: (60 - v * 45).toFixed(1) as unknown as number,
      qy: (60 - (qv / (VFS.value / 2)) * 45).toFixed(1) as unknown as number,
      v
    })
  }
  return dots
})

// 量化后的阶梯波（零阶保持）
const quantPath = computed(() => {
  const dots = sampleDots.value
  if (dots.length < 2) return ''
  let d = `M ${dots[0].x},${dots[0].qy}`
  for (let i = 1; i < dots.length; i++) {
    d += ` L ${dots[i].x},${dots[i - 1].qy} L ${dots[i].x},${dots[i].qy}`
  }
  return d
})

// 混叠演示波形（如果违反奈奎斯特，显示以 fs 采样后重建出的低频）
const aliasPath = computed(() => {
  if (nyquistOK.value) return ''
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    pts.push(`${(t * 460).toFixed(1)},${(60 - Math.sin(2 * Math.PI * aliasF.value * t) * 45).toFixed(1)}`)
  }
  return pts.join(' ')
})

// ========== DAC ==========
const dBits = ref<number[]>([1, 0, 0, 0, 0, 0, 0, 1])
const dCode = computed(() => dBits.value.reduce((a, b, i) => a + (b << (7 - i)), 0))
const dOut = computed(() => (dCode.value / 256) * VFS.value)
const dacPts = computed(() => {
  // 阶梯输出：每个时钟周期输出当前码对应的电平
  const pts: string[] = []
  const cyc = 8
  for (let k = 0; k < cyc; k++) {
    const x0 = (k / cyc) * 460
    const x1 = ((k + 1) / cyc) * 460
    const y = (60 - (dOut.value / (VFS.value / 2)) * 45).toFixed(1)
    pts.push(`${x0.toFixed(1)},${y} ${x1.toFixed(1)},${y}`)
  }
  return pts.join(' ')
})

// ========== PWM ==========
const duty = ref(35)
const vHigh = ref(12)
const pwmAvg = computed(() => (duty.value / 100) * vHigh.value)
const pwmOn = ref(true)
const pwmPhase = ref(0)

// 三角载波比较法生成 PWM
const pwmPts = computed(() => {
  const pts: string[] = []
  const onX = (duty.value / 100) * 460
  pts.push(`0,15 ${onX.toFixed(1)},15 ${onX.toFixed(1)},95 ${0},95`)
  return pts.join(' ')
})
const filteredPts = computed(() => {
  // RC 低通后的近似（指数趋近）
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    const target = pwmAvg.value / (vHigh.value / 2) // -1..1 标度
    // 一阶 RC 对 PWM 的响应近似：按占空比加权
    const y = (60 - target * 45 * (1 - Math.exp(-6 * t))).toFixed(1)
    pts.push(`${(t * 460).toFixed(1)},${y}`)
  }
  return pts.join(' ')
})
</script>

<template>
  <div class="adc">
    <Seg v-model="tab" :options="[
      { value: 'samp', label: '采样与量化' },
      { value: 'dac', label: 'DAC 重建' },
      { value: 'pwm', label: 'PWM 调速' }
    ]" />

    <!-- ===== 采样与量化 ===== -->
    <template v-if="tab === 'samp'">
      <div class="adc-ctl">
        <span class="adc-lab">输入频率</span>
        <input v-model.number="fin" type="range" min="1" max="30" class="adc-slider" />
        <span class="adc-val">{{ fin }}</span>
        <span class="adc-lab">采样频率</span>
        <input v-model.number="fs" type="range" min="4" max="80" class="adc-slider" />
        <span class="adc-val">{{ fs }}</span>
        <span class="adc-lab">位数</span>
        <input v-model.number="bits" type="range" min="2" max="8" class="adc-slider" />
        <span class="adc-val">{{ bits }} 位</span>
      </div>

      <svg viewBox="0 0 480 120" class="adc-svg">
        <!-- 原始连续波 -->
        <polyline :points="wavePts" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.2" />
        <!-- 混叠警告波 -->
        <polyline v-if="!nyquistOK" :points="aliasPath" fill="none" stroke="#d5303e" stroke-width="1.6" stroke-dasharray="5 3" />
        <!-- 量化阶梯 -->
        <path :d="quantPath" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
        <!-- 采样点 -->
        <g fill="var(--vp-c-brand-1)">
          <circle v-for="(d, i) in sampleDots" :key="i" :cx="d.x" :cy="d.y" r="2.6" />
        </g>
        <!-- 参考线 -->
        <line x1="0" y1="60" x2="460" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" />
        <line x1="0" y1="105" x2="460" y2="105" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="3 3" />
        <line x1="0" y1="15" x2="460" y2="15" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="3 3" />
        <text x="4" y="112" font-size="10" fill="var(--vp-c-text-3)">0 V</text>
        <text x="4" y="13" font-size="10" fill="var(--vp-c-text-3)">+{{ VFS / 2 }} V</text>
      </svg>

      <div class="adc-read" :class="{ warn: !nyquistOK }">
        <template v-if="nyquistOK">
          ✓ 采样频率 {{ fs }} ≥ 2×{{ fin }}，满足采样定理，可以完整重建
        </template>
        <template v-else>
          ⚠ 违反奈奎斯特判据！{{ fin }} Hz 的信号被 {{ fs }} Hz 采样后，会以 <b>{{ aliasF }} Hz</b> 的假信号出现（图中红色虚线）——这就是「混叠」
        </template>
      </div>
      <div class="adc-read">
        LSB = {{ VFS }} V / 2<sup>{{ bits }}</sup> = <b>{{ LSB.toFixed(3) }} V</b>；量化误差 ≤ ±½ LSB = ±{{ (LSB / 2).toFixed(3) }} V
      </div>
    </template>

    <!-- ===== DAC ===== -->
    <template v-else-if="tab === 'dac'">
      <div class="adc-ctl">
        <span class="adc-lab">数字码（高位在前）</span>
        <template v-for="(b, i) in dBits" :key="i">
          <button class="adc-bit" :class="{ on: b }" @click="dBits[i] = b ? 0 : 1">{{ b }}</button>
        </template>
      </div>
      <div class="adc-ctl">
        <span class="adc-lab">满量程</span>
        <input v-model.number="VFS" type="range" min="1" max="10" step="0.5" class="adc-slider" />
        <span class="adc-val">{{ VFS }} V</span>
      </div>

      <svg viewBox="0 0 480 120" class="adc-svg">
        <polyline :points="dacPts" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.6" />
        <line x1="0" y1="60" x2="460" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" />
        <text x="4" y="112" font-size="10" fill="var(--vp-c-text-3)">0 V</text>
        <text x="4" y="13" font-size="10" fill="var(--vp-c-text-3)">+{{ VFS }} V</text>
      </svg>

      <div class="adc-read">
        码值 {{ dCode }}（{{ dBits.join('') }}<sub>2</sub>）→ 输出电压 = 码值 / 256 × {{ VFS }} = <b>{{ dOut.toFixed(4) }} V</b>
      </div>
      <div class="adc-read dim">
        阶梯波纹是 DAC 的固有产物，后端加重建滤波器（低通）就得到平滑模拟量——采样点越密（数字端时钟越高），波纹越细。
      </div>
    </template>

    <!-- ===== PWM ===== -->
    <template v-else>
      <div class="adc-ctl">
        <span class="adc-lab">占空比</span>
        <input v-model.number="duty" type="range" min="0" max="100" class="adc-slider" />
        <span class="adc-val">{{ duty }} %</span>
        <span class="adc-lab">高电平</span>
        <input v-model.number="vHigh" type="range" min="3.3" max="24" step="0.1" class="adc-slider" />
        <span class="adc-val">{{ vHigh }} V</span>
      </div>

      <svg viewBox="0 0 480 120" class="adc-svg">
        <polygon :points="pwmPts" fill="color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent)" stroke="var(--vp-c-brand-1)" stroke-width="1.4" />
        <polyline :points="filteredPts" fill="none" stroke="#d5303e" stroke-width="1.6" />
        <line x1="0" y1="60" x2="460" y2="60" stroke="var(--vp-c-divider)" stroke-width="1" />
        <text x="4" y="13" font-size="10" fill="var(--vp-c-text-3)">+{{ vHigh }} V</text>
        <text x="4" y="112" font-size="10" fill="var(--vp-c-text-3)">0 V</text>
      </svg>

      <div class="adc-read">
        等效电压 = 占空比 × 高电平 = {{ duty }}% × {{ vHigh }} V = <b>{{ pwmAvg.toFixed(2) }} V</b>（红线是经 RC 低通后的效果）
      </div>
      <div class="adc-read dim">
        PWM 的精髓：**开关管只在「全通 / 全断」两态工作，损耗小**；用通断时间比例骗过负载，等效出任意电压。LED 调光、电机调速、开关电源全是它。
      </div>
    </template>
  </div>
</template>

<style scoped>
.adc { display: flex; flex-direction: column; gap: 10px; }
.adc-ctl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.adc-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.adc-slider { width: 110px; }
.adc-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 34px; }
.adc-bit {
  width: 26px;
  padding: 3px 0;
  text-align: center;
  font-size: 12.5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-family: var(--vp-font-family-mono, monospace);
}
.adc-bit.on { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; font-weight: 600; }
.adc-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
.adc-read {
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-1);
}
.adc-read.dim { background: var(--vp-c-bg-alt); color: var(--vp-c-text-2); }
.adc-read.warn { background: color-mix(in srgb, #d5303e 14%, transparent); }
</style>
