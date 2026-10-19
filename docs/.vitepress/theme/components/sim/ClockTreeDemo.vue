<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'
import Ctrl from '../Ctrl.vue'

// 时钟树计算器：HSE → PLL → SYSCLK → AHB/APB1/APB2 → 定时器时钟 → 定时周期 / PWM
const chip = ref<'f103' | 'f407'>('f103')

const hse = ref(8) // 外部晶振 MHz
// F103：PLL 倍频系数（2~16），输入为 HSE 或 HSE/2
const pllMul = ref(9)
// F407：M 输入分频 / N 倍频 / P 输出分频
const pllM = ref(8)
const pllN = ref(336)
const pllP = ref(2)

const ahbDiv = ref(1)
const apb1Div = ref(2)
const apb2Div = ref(1)

const psc = ref(71)
const arr = ref(999)
const duty = ref(30)
// 分频系数实际只能取 2 的幂，用按钮组避免拖出非法值
const divOpts = [1, 2, 4, 8, 16]

// 各芯片上限（数据手册约束，超出会跑飞甚至锁死）
const LIMIT = {
  f103: { sys: 72, apb1: 36, apb2: 72, name: 'STM32F103（Cortex-M3）' },
  f407: { sys: 168, apb1: 42, apb2: 84, name: 'STM32F407（Cortex-M4）' }
}
const lim = computed(() => LIMIT[chip.value])

const pllIn = computed(() => (chip.value === 'f103' ? hse.value : hse.value / pllM.value))
const vco = computed(() =>
  chip.value === 'f103' ? hse.value * pllMul.value : (hse.value / pllM.value) * pllN.value
)
const sysclk = computed(() =>
  chip.value === 'f103' ? hse.value * pllMul.value : vco.value / pllP.value
)
const hclk = computed(() => sysclk.value / ahbDiv.value)
const pclk1 = computed(() => hclk.value / apb1Div.value)
const pclk2 = computed(() => hclk.value / apb2Div.value)

// 关键规则：APB 预分频系数 ≠ 1 时，挂在该总线上的定时器时钟自动 ×2
const tim1 = computed(() => (apb1Div.value === 1 ? pclk1.value : pclk1.value * 2))
const tim2 = computed(() => (apb2Div.value === 1 ? pclk2.value : pclk2.value * 2))

const errs = computed(() => {
  const out: string[] = []
  if (sysclk.value > lim.value.sys)
    out.push(`SYSCLK ${sysclk.value.toFixed(1)} MHz 超过 ${chip.value.toUpperCase()} 上限 ${lim.value.sys} MHz`)
  if (pclk1.value > lim.value.apb1)
    out.push(`PCLK1 ${pclk1.value.toFixed(1)} MHz 超过上限 ${lim.value.apb1} MHz`)
  if (pclk2.value > lim.value.apb2)
    out.push(`PCLK2 ${pclk2.value.toFixed(1)} MHz 超过上限 ${lim.value.apb2} MHz`)
  if (chip.value === 'f407' && (pllIn.value < 1 || pllIn.value > 2))
    out.push(`F4 要求 PLL 输入在 1~2 MHz，当前 ${pllIn.value.toFixed(2)} MHz`)
  if (chip.value === 'f407' && (vco.value < 100 || vco.value > 432))
    out.push(`F4 的 VCO 应在 100~432 MHz，当前 ${vco.value.toFixed(0)} MHz`)
  return out
})

// 定时器：用 APB1 上的定时器时钟算
const fcnt = computed(() => (tim1.value * 1e6) / (psc.value + 1)) // Hz
const periodMs = computed(() => ((arr.value + 1) / fcnt.value) * 1000)
const pwmFreq = computed(() => fcnt.value / (arr.value + 1))
const ccr = computed(() => Math.round(((arr.value + 1) * duty.value) / 100))
const highUs = computed(() => ((duty.value / 100) * (arr.value + 1) / fcnt.value) * 1e6)

const fmt = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(v < 10 ? 2 : 1))
const clk = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(2)} MHz` : `${(v / 1e3).toFixed(2)} kHz`)

function preset(c: 'f103' | 'f407') {
  chip.value = c
  if (c === 'f103') {
    hse.value = 8
    pllMul.value = 9
    ahbDiv.value = 1
    apb1Div.value = 2
    apb2Div.value = 1
  } else {
    hse.value = 8
    pllM.value = 8
    pllN.value = 336
    pllP.value = 2
    ahbDiv.value = 1
    apb1Div.value = 4
    apb2Div.value = 2
  }
}
</script>

<template>
  <div class="ct">
    <div class="ct-top">
      <Seg
        v-model="chip"
        :options="[
          { value: 'f103', label: 'STM32F103' },
          { value: 'f407', label: 'STM32F407' }
        ]"
        label="芯片"
      />
      <button class="ct-pbtn" @click="preset('f103')">载入 F103 经典配置（72 MHz）</button>
      <button class="ct-pbtn" @click="preset('f407')">载入 F407 经典配置（168 MHz）</button>
    </div>
    <p class="ct-chip">{{ lim.name }} · 上限 SYSCLK {{ lim.sys }} MHz / APB1 {{ lim.apb1 }} MHz / APB2 {{ lim.apb2 }} MHz</p>

    <div class="ct-cfg">
      <Ctrl v-model="hse" label="HSE 外部晶振" unit="MHz" :min="4" :max="25" :step="1" />
      <template v-if="chip === 'f103'">
        <Ctrl v-model="pllMul" label="PLL 倍频" unit="×" :min="2" :max="16" :step="1" />
      </template>
      <template v-else>
        <Ctrl v-model="pllM" label="PLL_M 输入分频" unit="" :min="2" :max="63" :step="1" />
        <Ctrl v-model="pllN" label="PLL_N 倍频" unit="" :min="50" :max="432" :step="1" />
        <Ctrl v-model="pllP" label="PLL_P 输出分频" unit="" :min="2" :max="8" :step="2" />
      </template>
    </div>

    <div class="ct-divs">
      <div class="ct-dgrp">
        <span class="ct-dk">AHB 分频</span>
        <button
          v-for="d in divOpts"
          :key="d"
          class="ct-dbtn"
          :class="{ 'ct-don': ahbDiv === d }"
          @click="ahbDiv = d"
        >
          {{ d }}
        </button>
      </div>
      <div class="ct-dgrp">
        <span class="ct-dk">APB1 分频</span>
        <button
          v-for="d in divOpts"
          :key="d"
          class="ct-dbtn"
          :class="{ 'ct-don': apb1Div === d }"
          @click="apb1Div = d"
        >
          {{ d }}
        </button>
      </div>
      <div class="ct-dgrp">
        <span class="ct-dk">APB2 分频</span>
        <button
          v-for="d in divOpts"
          :key="d"
          class="ct-dbtn"
          :class="{ 'ct-don': apb2Div === d }"
          @click="apb2Div = d"
        >
          {{ d }}
        </button>
      </div>
    </div>

    <div class="ct-warn" v-if="errs.length">
      <b>⚠ 超出芯片允许范围：</b>
      <span v-for="(e, i) in errs" :key="i">{{ e }}<br v-if="i < errs.length - 1" /></span>
    </div>

    <div class="ct-grid">
      <div class="ct-cell">
        <span class="ct-k">PLL 输入（{{ chip === 'f103' ? 'HSE' : 'HSE/M' }}）</span>
        <b class="ct-v">{{ fmt(pllIn) }} MHz</b>
      </div>
      <div class="ct-cell">
        <span class="ct-k">{{ chip === 'f103' ? 'PLL 输出' : 'VCO 输出' }}</span>
        <b class="ct-v">{{ fmt(vco) }} MHz</b>
      </div>
      <div class="ct-cell ct-main">
        <span class="ct-k">SYSCLK 系统时钟</span>
        <b class="ct-v" :class="{ 'ct-bad': sysclk > lim.sys }">{{ fmt(sysclk) }} MHz</b>
      </div>
      <div class="ct-cell">
        <span class="ct-k">HCLK（AHB / 内核与内存）</span>
        <b class="ct-v">{{ fmt(hclk) }} MHz</b>
      </div>
      <div class="ct-cell">
        <span class="ct-k">PCLK1（APB1 低速外设）</span>
        <b class="ct-v" :class="{ 'ct-bad': pclk1 > lim.apb1 }">{{ fmt(pclk1) }} MHz</b>
      </div>
      <div class="ct-cell">
        <span class="ct-k">PCLK2（APB2 高速外设）</span>
        <b class="ct-v" :class="{ 'ct-bad': pclk2 > lim.apb2 }">{{ fmt(pclk2) }} MHz</b>
      </div>
      <div class="ct-cell ct-tim">
        <span class="ct-k">APB1 定时器时钟（TIM2/3/4…）</span>
        <b class="ct-v">{{ fmt(tim1) }} MHz</b>
        <span class="ct-sub">{{ apb1Div === 1 ? 'APB1 不分频 → 不 ×2' : 'APB1 分频 ≠ 1 → 自动 ×2' }}</span>
      </div>
      <div class="ct-cell ct-tim">
        <span class="ct-k">APB2 定时器时钟（TIM1…）</span>
        <b class="ct-v">{{ fmt(tim2) }} MHz</b>
        <span class="ct-sub">{{ apb2Div === 1 ? 'APB2 不分频 → 不 ×2' : 'APB2 分频 ≠ 1 → 自动 ×2' }}</span>
      </div>
    </div>

    <div class="ct-split">
      <div class="ct-box">
        <span class="ct-bk">定时周期（用 APB1 定时器时钟 {{ fmt(tim1) }} MHz）</span>
        <div class="ct-row">
          <Ctrl v-model="psc" label="PSC 预分频" unit="" :min="0" :max="9999" :step="1" />
          <Ctrl v-model="arr" label="ARR 自动重装载" unit="" :min="0" :max="9999" :step="1" />
        </div>
        <p class="ct-f">
          计数频率 = {{ fmt(tim1) }} MHz ÷ ({{ psc }} + 1) = <b>{{ clk(fcnt) }}</b><br />
          溢出周期 = ({{ arr }} + 1) ÷ {{ clk(fcnt) }} = <b>{{ periodMs.toFixed(3) }} ms</b>
        </p>
      </div>
      <div class="ct-box">
        <span class="ct-bk">PWM 输出（同一定时器）</span>
        <Ctrl v-model="duty" label="占空比" unit="%" :min="0" :max="100" :step="1" />
        <p class="ct-f">
          PWM 频率 = {{ clk(fcnt) }} ÷ ({{ arr }} + 1) = <b>{{ pwmFreq.toFixed(1) }} Hz</b><br />
          CCR 比较值 = ({{ arr }} + 1) × {{ duty }}% = <b>{{ ccr }}</b>（高电平 {{ highUs.toFixed(1) }} µs）
        </p>
      </div>
    </div>

    <p class="ct-note">
      <b>为什么定时器要 ×2：</b>APB 预分频不为 1 时，硬件会自动把定时器时钟再乘 2，让定时器仍能拿到较高的时钟
      （F103 经典配置下 APB1 是 36 MHz，但 TIM2~7 实际跑在 72 MHz）。忘了这条，算出来的延时和波特率会整体差一倍——
      这是「代码没问题但时间就是不对」的头号原因。
    </p>
  </div>
</template>

<style scoped>
.ct {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ct-top {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.ct-pbtn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.ct-pbtn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.ct-chip {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.ct-cfg {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.ct-divs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ct-dgrp {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.ct-dk {
  width: 66px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.ct-dbtn {
  min-width: 30px;
  padding: 2px 8px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.ct-dbtn:hover {
  border-color: var(--vp-c-brand-1);
}
.ct-don {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.ct-warn {
  padding: 8px 10px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft, rgba(220, 38, 38, 0.1));
  border-left: 3px solid var(--vp-c-danger-1);
  border-radius: 6px;
}
.ct-warn b {
  display: block;
}
.ct-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 8px;
}
.ct-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.ct-cell.ct-main {
  border-color: var(--vp-c-brand-1);
}
.ct-cell.ct-tim {
  background: var(--vp-c-bg-alt, var(--vp-c-bg-soft));
}
.ct-k {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.ct-v {
  font-size: 15px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.ct-v.ct-bad {
  color: var(--vp-c-danger-1);
}
.ct-sub {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.ct-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ct-box {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 9px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.ct-bk {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.ct-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ct-f {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}
.ct-f b {
  color: var(--vp-c-text-1);
}
.ct-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.ct-note b {
  color: var(--vp-c-text-2);
}
@media (max-width: 560px) {
  .ct-split {
    grid-template-columns: 1fr;
  }
}
</style>
