<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'
import Ctrl from '../Ctrl.vue'

// 定时器 / PWM：PSC、ARR 决定周期，CCR 决定占空比
const timClk = ref(72) // 定时器时钟 MHz
const psc = ref(71)
const arr = ref(999)
const mode = ref<'pwm' | 'servo' | 'tick'>('pwm')
const duty = ref(30) // pwm 模式占空比 %
const angle = ref(90) // servo 模式角度

const fcnt = computed(() => (timClk.value * 1e6) / (psc.value + 1)) // 计数频率 Hz
const freq = computed(() => fcnt.value / (arr.value + 1)) // 溢出/PWM 频率
const periodMs = computed(() => ((arr.value + 1) / fcnt.value) * 1000)
const tickUs = computed(() => 1e6 / fcnt.value) // 一个计数多久

// 舵机：50 Hz 周期 20 ms，脉宽 0.5~2.5 ms 对应 0~180°
const servoPulseUs = computed(() => 500 + (angle.value / 180) * 2000)
const ccr = computed(() => {
  if (mode.value === 'servo') return Math.round((servoPulseUs.value / 1e6) * fcnt.value)
  return Math.round(((arr.value + 1) * duty.value) / 100)
})
const actualDuty = computed(() => (ccr.value / (arr.value + 1)) * 100)
const highUs = computed(() => (ccr.value / fcnt.value) * 1e6)

const fmtHz = (v: number) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(2)} MHz` : v >= 1e3 ? `${(v / 1e3).toFixed(2)} kHz` : `${v.toFixed(2)} Hz`

function preset(m: 'pwm' | 'servo' | 'tick') {
  mode.value = m
  timClk.value = 72
  psc.value = 71 // 计数 1 MHz
  if (m === 'servo') {
    arr.value = 19999 // 50 Hz
    angle.value = 90
  } else {
    arr.value = 999 // 1 kHz / 1 ms
    duty.value = m === 'tick' ? 50 : 30
  }
}

// PWM 波形：画 2 个周期
const W = 600
const H = 84
const baseY = 66
const topY = 18
const wavePath = computed(() => {
  const r = Math.min(1, Math.max(0, actualDuty.value / 100))
  const cyc = W / 2
  let d = ''
  for (let c = 0; c < 2; c++) {
    const x0 = c * cyc
    const xh = x0 + cyc * r
    d += `M ${x0} ${topY} L ${xh} ${topY} L ${xh} ${baseY} L ${x0 + cyc} ${baseY} `
  }
  return d
})
const gridPath = computed(() => {
  let d = ''
  for (let c = 0; c <= 2; c++) {
    const x = (c * W) / 2
    d += `M ${x} 10 L ${x} 76 `
  }
  return d
})
</script>

<template>
  <div class="tp">
    <div class="tp-top">
      <Seg
        v-model="mode"
        :options="[
          { value: 'pwm', label: 'PWM 调光/调速' },
          { value: 'servo', label: '舵机角度' },
          { value: 'tick', label: '定时中断' }
        ]"
        label="用途"
      />
      <button class="tp-pb" @click="preset('pwm')">1 kHz 调光</button>
      <button class="tp-pb" @click="preset('servo')">50 Hz 舵机</button>
      <button class="tp-pb" @click="preset('tick')">1 ms 定时</button>
    </div>

    <div class="tp-cfg">
      <Ctrl v-model="timClk" label="定时器时钟" unit="MHz" :min="8" :max="168" :step="1" />
      <Ctrl v-model="psc" label="PSC 预分频" unit="" :min="0" :max="9999" :step="1" />
      <Ctrl v-model="arr" label="ARR 重装载" unit="" :min="0" :max="65535" :step="1" />
      <Ctrl v-if="mode === 'servo'" v-model="angle" label="舵机角度" unit="°" :min="0" :max="180" :step="1" />
      <Ctrl v-else-if="mode === 'pwm'" v-model="duty" label="占空比" unit="%" :min="0" :max="100" :step="1" />
      <Ctrl v-else v-model="duty" label="占空比" unit="%" :min="0" :max="100" :step="1" />
    </div>

    <div class="tp-grid">
      <div class="tp-c">
        <span class="tp-k">计数频率 = f<sub>TIM</sub> ÷ (PSC+1)</span>
        <b class="tp-v">{{ fmtHz(fcnt) }}</b>
        <span class="tp-s">1 个计数 = {{ tickUs.toFixed(3) }} µs</span>
      </div>
      <div class="tp-c">
        <span class="tp-k">周期 = (ARR+1) ÷ 计数频率</span>
        <b class="tp-v">{{ periodMs < 1 ? (periodMs * 1000).toFixed(1) + ' µs' : periodMs.toFixed(3) + ' ms' }}</b>
        <span class="tp-s">PWM / 溢出频率 {{ fmtHz(freq) }}</span>
      </div>
      <div class="tp-c tp-main">
        <span class="tp-k">CCR 比较值</span>
        <b class="tp-v">{{ ccr }}</b>
        <span class="tp-s">实际占空比 {{ actualDuty.toFixed(2) }}%（高电平 {{ highUs.toFixed(1) }} µs）</span>
      </div>
    </div>

    <svg class="tp-wave" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
      <path :d="gridPath" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="3 3" fill="none" />
      <path :d="wavePath" stroke="var(--vp-c-brand-1)" stroke-width="2.5" fill="none" />
      <text :x="6" :y="topY - 4" font-size="11" fill="var(--vp-c-text-3)">高</text>
      <text :x="6" :y="baseY + 14" font-size="11" fill="var(--vp-c-text-3)">低</text>
    </svg>
    <p class="tp-wl">PWM 波形（两个周期）</p>

    <p v-if="mode === 'servo'" class="tp-note">
      舵机不看占空比，只看<b>绝对脉宽</b>：0.5 ms → 0°，1.5 ms → 90°，2.5 ms → 180°。当前角度 {{ angle }}° 对应脉宽
      {{ servoPulseUs.toFixed(0) }} µs（占空比 {{ actualDuty.toFixed(1) }}%）。所以舵机必须先固定 50 Hz 周期，再调 CCR。
    </p>
    <p v-else class="tp-note">
      <b>分辨率提醒：</b>占空比的最小步进 = 1 ÷ (ARR+1) = {{ (100 / (arr + 1)).toFixed(3) }}%。ARR 越大分辨率越高，但
      PWM 频率越低（两者由同一个计数器决定，此消彼长）。调光一般 1~20 kHz 即可，太高会加重开关损耗，太低会看到闪烁。
    </p>
  </div>
</template>

<style scoped>
.tp {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tp-top {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.tp-pb {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.tp-pb:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.tp-cfg {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.tp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
}
.tp-c {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.tp-c.tp-main {
  border-color: var(--vp-c-brand-1);
}
.tp-k {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.tp-v {
  font-size: 15px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.tp-s {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.tp-wave {
  width: 100%;
  height: 84px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.tp-wl {
  margin: -4px 0 0;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  text-align: center;
}
.tp-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.tp-note b {
  color: var(--vp-c-text-2);
}
</style>
