<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'
import Ctrl from '../Ctrl.vue'

// ADC 量化：电压 → 数字码，看清分辨率与 ±0.5 LSB 的量化误差
const vref = ref(3.3)
const bits = ref(12)
const vin = ref(1.65)
// 前端分压（很多传感器信号要经过分压才能进 ADC）
const useDivider = ref(false)
const rUpper = ref(10) // kΩ，上臂
const rLower = ref(10) // kΩ，下臂（接地的那个）

const maxCode = computed(() => Math.pow(2, bits.value) - 1)
const levels = computed(() => Math.pow(2, bits.value))
const lsbV = computed(() => vref.value / levels.value)
const lsbMv = computed(() => lsbV.value * 1000)

// 分压：输入电压经分压后才是 ADC 引脚上的电压
const dividerRatio = computed(() => rLower.value / (rUpper.value + rLower.value))
const pinV = computed(() => (useDivider.value ? vin.value * dividerRatio.value : vin.value))

const code = computed(() => {
  const c = Math.round((pinV.value / vref.value) * maxCode.value)
  return Math.min(maxCode.value, Math.max(0, c))
})
const codeV = computed(() => (code.value / maxCode.value) * vref.value)
const errMv = computed(() => (codeV.value - pinV.value) * 1000)
const clipped = computed(() => pinV.value > vref.value)

// 阶梯图：横轴电压，纵轴码值（只画 16 级示意，真实级数由位数决定）
const W = 600
const H = 150
const PL = 46
const PB = 26
const PR = 12
const PT = 12
const STEPS = 16
const plotW = W - PL - PR
const plotH = H - PT - PB

const xOf = (v: number) => PL + (v / vref.value) * plotW
const yOf = (c: number) => PT + plotH - (c / maxCode.value) * plotH

const stairPath = computed(() => {
  // 用 16 级示意：每一级对应 levels/16 个码
  let d = ''
  const per = levels.value / STEPS
  for (let i = 0; i < STEPS; i++) {
    const c0 = Math.round(i * per)
    const c1 = Math.round((i + 1) * per) - 1
    const x0 = xOf((c0 / maxCode.value) * vref.value)
    const x1 = xOf(((c1 + 1) / maxCode.value) * vref.value)
    const y = yOf(c0)
    d += `M ${x0} ${y} L ${x1} ${y} L ${x1} ${yOf(c1)} `
  }
  return d
})
const idealPath = computed(() => `M ${PL} ${yOf(0)} L ${PL + plotW} ${yOf(maxCode.value)}`)

const curX = computed(() => xOf(Math.min(pinV.value, vref.value)))
const curY = computed(() => yOf(code.value))
</script>

<template>
  <div class="aq">
    <div class="aq-row">
      <Seg
        v-model="bits"
        :options="[
          { value: 8, label: '8 位' },
          { value: 10, label: '10 位' },
          { value: 12, label: '12 位' },
          { value: 16, label: '16 位' }
        ]"
        label="分辨率"
      />
      <Seg
        v-model="vref"
        :options="[
          { value: 3.3, label: 'Vref 3.3 V' },
          { value: 5, label: '5 V' },
          { value: 2.5, label: '2.5 V' },
          { value: 1.2, label: '1.2 V（内部）' }
        ]"
        label="参考电压"
      />
    </div>

    <Ctrl v-model="vin" label="输入电压" unit="V" :min="0" :max="5" :step="0.01" />

    <div class="aq-row">
      <span class="aq-ck">前端分压</span>
      <button class="aq-b" :class="{ 'aq-on': !useDivider }" @click="useDivider = false">直连</button>
      <button class="aq-b" :class="{ 'aq-on': useDivider }" @click="useDivider = true">
        经电阻分压
      </button>
      <template v-if="useDivider">
        <Ctrl v-model="rUpper" label="上臂" unit="kΩ" :min="1" :max="100" :step="1" />
        <Ctrl v-model="rLower" label="下臂" unit="kΩ" :min="1" :max="100" :step="1" />
      </template>
    </div>

    <svg class="aq-plot" :viewBox="`0 0 ${W} ${H}`">
      <line :x1="PL" :y1="PT" :x2="PL" :y2="PT + plotH" stroke="var(--vp-c-divider)" stroke-width="1" />
      <line
        :x1="PL"
        :y1="PT + plotH"
        :x2="PL + plotW"
        :y2="PT + plotH"
        stroke="var(--vp-c-divider)"
        stroke-width="1"
      />
      <path :d="idealPath" stroke="var(--vp-c-text-3)" stroke-width="1" stroke-dasharray="4 4" fill="none" />
      <path :d="stairPath" stroke="var(--vp-c-brand-1)" stroke-width="2" fill="none" />
      <line :x1="curX" :y1="PT" :x2="curX" :y2="PT + plotH" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 3" />
      <circle :cx="curX" :cy="curY" r="4" fill="#f59e0b" />
      <text :x="PL" :y="H - 8" font-size="10" fill="var(--vp-c-text-3)">0 V</text>
      <text :x="PL + plotW" :y="H - 8" font-size="10" text-anchor="end" fill="var(--vp-c-text-3)">
        {{ vref }} V（Vref）
      </text>
      <text x="4" :y="PT + 8" font-size="10" fill="var(--vp-c-text-3)">{{ maxCode }}</text>
      <text x="4" :y="PT + plotH" font-size="10" fill="var(--vp-c-text-3)">0</text>
      <text :x="W / 2" :y="PT - 2" font-size="10" text-anchor="middle" fill="var(--vp-c-text-3)">
        虚线 = 理想转换；阶梯 = 实际量化（示意 16 级）
      </text>
    </svg>

    <div class="aq-grid">
      <div class="aq-c">
        <span class="aq-k">引脚电压</span>
        <b class="aq-v">{{ pinV.toFixed(4) }} V</b>
        <span class="aq-s" v-if="useDivider">
          分压比 {{ dividerRatio.toFixed(3) }}（{{ rUpper }}k / {{ rLower }}k）
        </span>
        <span class="aq-s" v-else>信号直连 ADC 引脚</span>
      </div>
      <div class="aq-c aq-main">
        <span class="aq-k">数字码（{{ bits }} 位）</span>
        <b class="aq-v">{{ code }}</b>
        <span class="aq-s">0 ~ {{ maxCode }}（共 {{ levels }} 级）</span>
      </div>
      <div class="aq-c">
        <span class="aq-k">1 LSB 分辨率</span>
        <b class="aq-v">{{ lsbMv.toFixed(3) }} mV</b>
        <span class="aq-s">{{ vref }} V ÷ {{ levels }}</span>
      </div>
      <div class="aq-c" :class="{ 'aq-warn': Math.abs(errMv) > lsbMv / 2 + 0.001 }">
        <span class="aq-k">量化误差</span>
        <b class="aq-v">{{ errMv >= 0 ? '+' : '' }}{{ errMv.toFixed(3) }} mV</b>
        <span class="aq-s">理论上限 ±{{ (lsbMv / 2).toFixed(3) }} mV（±0.5 LSB）</span>
      </div>
    </div>

    <div v-if="clipped" class="aq-alert">
      ⚠ 引脚电压 {{ pinV.toFixed(2) }} V 已超过 Vref {{ vref }} V：ADC 只会读到满量程 {{ maxCode }}，
      超出部分的信息全部丢失，且可能损坏引脚（若超过 VDD）。必须先用分压或运放把信号降到 Vref 以内。
    </div>

    <p class="aq-note">
      <b>反算电压的公式</b>：实际电压 ≈ <code>code ÷ {{ maxCode }} × {{ vref }} V</code>。
      当前 {{ code }} → {{ codeV.toFixed(4) }} V，与真实值差 {{ errMv.toFixed(3) }} mV——这个误差是
      <b>量化本身固有的</b>，提高位数只能减小它、不能消除它。
      <b>选型要点</b>：先算「需要分辨的最小电压变化」是多少，再反推需要几位。
      例如要分辨 1 mV，3.3 V 参考下至少需要 12 位（0.806 mV/LSB），10 位（3.22 mV/LSB）就不够。
    </p>
  </div>
</template>

<style scoped>
.aq {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.aq-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.aq-ck {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.aq-b {
  padding: 3px 10px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.aq-b:hover {
  border-color: var(--vp-c-brand-1);
}
.aq-on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.aq-plot {
  width: 100%;
  height: 150px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.aq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 8px;
}
.aq-c {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.aq-c.aq-main {
  border-color: var(--vp-c-brand-1);
}
.aq-c.aq-warn {
  border-color: #f59e0b;
}
.aq-k {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.aq-v {
  font-size: 16px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.aq-s {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.aq-alert {
  padding: 8px 10px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft, rgba(220, 38, 38, 0.1));
  border-left: 3px solid var(--vp-c-danger-1);
  border-radius: 6px;
}
.aq-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.aq-note b {
  color: var(--vp-c-text-2);
}
.aq-note code {
  padding: 1px 5px;
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  color: var(--vp-c-text-2);
}
</style>
