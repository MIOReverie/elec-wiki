<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

// UART 帧结构：起始位 → 数据位（LSB 先发）→ 校验位（可选）→ 停止位
const byteVal = ref(0x55)
const baud = ref(115200)
const parity = ref<'none' | 'odd' | 'even'>('none')
const stopBits = ref(1)

const bitTimeUs = computed(() => 1e6 / baud.value)

// LSB first：先发 bit0
const dataBits = computed(() => Array.from({ length: 8 }, (_, i) => (byteVal.value >> i) & 1))
const ones = computed(() => dataBits.value.reduce((s, b) => s + b, 0))
const parityBit = computed(() => {
  if (parity.value === 'even') return ones.value % 2 // 使 1 的总数为偶
  if (parity.value === 'odd') return 1 - (ones.value % 2) // 使 1 的总数为奇
  return null
})

interface Slot {
  label: string
  val: number
  kind: string
}
const slots = computed<Slot[]>(() => {
  const out: Slot[] = [{ label: '起始', val: 0, kind: 'start' }]
  dataBits.value.forEach((v, i) => out.push({ label: `D${i}`, val: v, kind: 'data' }))
  if (parityBit.value !== null) out.push({ label: '校验', val: parityBit.value, kind: 'par' })
  out.push({ label: '停止', val: 1, kind: 'stop' })
  if (stopBits.value === 2) out.push({ label: '停止', val: 1, kind: 'stop' })
  return out
})

const totalBits = computed(() => slots.value.length)
const frameUs = computed(() => totalBits.value * bitTimeUs.value)
const bytesPerSec = computed(() => baud.value / totalBits.value)

const W = 620
const H = 96
const topY = 22
const baseY = 62
const wavePath = computed(() => {
  const n = slots.value.length
  const w = W / n
  let d = ''
  slots.value.forEach((s, i) => {
    const x0 = i * w
    const x1 = (i + 1) * w
    const y = s.val === 1 ? topY : baseY
    // 先竖线跳到本位电平，再横线走完本位
    d += `M ${x0} ${y} L ${x1} ${y} `
    if (i < n - 1) {
      const yn = slots.value[i + 1].val === 1 ? topY : baseY
      if (yn !== y) d += `L ${x1} ${yn} `
    }
  })
  return d
})
const waveW = computed(() => W / slots.value.length)

const hex = computed(() => '0x' + byteVal.value.toString(16).toUpperCase().padStart(2, '0'))
const bin = computed(() => byteVal.value.toString(2).padStart(8, '0'))

function toggleBit(i: number) {
  byteVal.value ^= 1 << i
}
function setByte(v: number) {
  byteVal.value = v
}
function setBaud(b: number) {
  baud.value = b
}
</script>

<template>
  <div class="uf">
    <div class="uf-row">
      <span class="uf-k">数据字节</span>
      <button class="uf-bb" @click="setByte(0x55)">0x55（交替 0101…）</button>
      <button class="uf-bb" @click="setByte(0x41)">0x41（字符 A）</button>
      <button class="uf-bb" @click="setByte(0x00)">0x00</button>
      <button class="uf-bb" @click="setByte(0xff)">0xFF</button>
    </div>

    <div class="uf-row">
      <span class="uf-k">位值（点一下翻转）</span>
      <div class="uf-bits">
        <button
          v-for="i in 8"
          :key="i"
          class="uf-bit"
          :class="{ 'uf-on': (byteVal >> (8 - i)) & 1 }"
          @click="toggleBit(8 - i)"
        >
          <span class="uf-bv">{{ (byteVal >> (8 - i)) & 1 }}</span>
          <span class="uf-bl">b{{ 8 - i }}</span>
        </button>
      </div>
      <span class="uf-hex">{{ hex }} = {{ bin }}</span>
    </div>

    <div class="uf-row">
      <span class="uf-k">波特率</span>
      <button
        v-for="b in [9600, 19200, 38400, 57600, 115200]"
        :key="b"
        class="uf-bb"
        :class="{ 'uf-bon': baud === b }"
        @click="setBaud(b)"
      >
        {{ b }}
      </button>
    </div>

    <div class="uf-row">
      <Seg
        v-model="parity"
        :options="[
          { value: 'none', label: '无校验' },
          { value: 'odd', label: '奇校验' },
          { value: 'even', label: '偶校验' }
        ]"
        label="校验位"
      />
      <Seg
        v-model="stopBits"
        :options="[
          { value: 1, label: '1 位停止位' },
          { value: 2, label: '2 位停止位' }
        ]"
        label="停止位"
      />
    </div>

    <svg class="uf-wave" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
      <line x1="0" :y1="topY" :x2="W" :y2="topY" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
      <line x1="0" :y1="baseY" :x2="W" :y2="baseY" stroke="var(--vp-c-divider)" stroke-width="1" stroke-dasharray="4 4" />
      <path :d="wavePath" stroke="var(--vp-c-brand-1)" stroke-width="2.5" fill="none" />
      <text x="4" :y="topY - 6" font-size="10.5" fill="var(--vp-c-text-3)">1（空闲/停止）</text>
      <text x="4" :y="baseY + 16" font-size="10.5" fill="var(--vp-c-text-3)">0（起始）</text>
      <g v-for="(s, i) in slots" :key="i">
        <text
          :x="i * waveW + waveW / 2"
          :y="H - 6"
          font-size="9.5"
          text-anchor="middle"
          fill="var(--vp-c-text-3)"
        >
          {{ s.label }}
        </text>
        <text
          :x="i * waveW + waveW / 2"
          :y="s.val === 1 ? topY - 6 : baseY + 16"
          font-size="9.5"
          text-anchor="middle"
          fill="var(--vp-c-text-3)"
          v-if="s.kind !== 'start' && s.kind !== 'stop'"
        >
          {{ s.val }}
        </text>
      </g>
    </svg>

    <div class="uf-grid">
      <div class="uf-c">
        <span class="uf-ck">每位时间 = 1 ÷ 波特率</span>
        <b class="uf-cv">{{ bitTimeUs.toFixed(2) }} µs</b>
      </div>
      <div class="uf-c">
        <span class="uf-ck">一帧位数</span>
        <b class="uf-cv">{{ totalBits }} 位</b>
        <span class="uf-cs">1 起始 + 8 数据{{ parity === 'none' ? '' : ' + 1 校验' }} + {{ stopBits }} 停止</span>
      </div>
      <div class="uf-c">
        <span class="uf-ck">一帧时间</span>
        <b class="uf-cv">{{ frameUs.toFixed(1) }} µs</b>
      </div>
      <div class="uf-c uf-main">
        <span class="uf-ck">有效数据速率</span>
        <b class="uf-cv">{{ bytesPerSec.toFixed(0) }} 字节/秒</b>
        <span class="uf-cs">1000 字节需 {{ ((1000 * totalBits) / baud * 1000).toFixed(1) }} ms</span>
      </div>
    </div>

    <div class="uf-slots">
      <span
        v-for="(s, i) in slots"
        :key="i"
        class="uf-slot"
        :class="'uf-s-' + s.kind"
      >
        {{ s.label }}={{ s.val }}
      </span>
    </div>

    <p class="uf-note">
      <b>注意发送顺序是 LSB 先发</b>：字节 {{ hex }}（{{ bin }}）在线路上的顺序是
      <b>{{ dataBits.join('') }}</b>——最低位 D0 最先出去。用逻辑分析仪抓波形时，
      如果按波形顺序读成正常顺序，会得到完全错误的字节，这是串口调试最常见的误读。
      另外，线路<b>空闲时是高电平</b>，所以第一个下降沿就是起始位，接收端靠这个边沿同步。
    </p>
  </div>
</template>

<style scoped>
.uf {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.uf-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.uf-k {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.uf-bb {
  padding: 3px 9px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.uf-bb:hover {
  border-color: var(--vp-c-brand-1);
}
.uf-bon {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.uf-bits {
  display: flex;
  gap: 3px;
}
.uf-bit {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30px;
  padding: 2px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-family: var(--vp-font-family-mono);
}
.uf-bit:hover {
  border-color: var(--vp-c-brand-1);
}
.uf-on {
  background: rgba(59, 130, 246, 0.15);
  color: var(--vp-c-text-1);
  font-weight: 700;
}
.uf-bv {
  font-size: 13px;
}
.uf-bl {
  font-size: 9px;
  opacity: 0.65;
}
.uf-hex {
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}
.uf-wave {
  width: 100%;
  height: 96px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.uf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.uf-c {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 9px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.uf-c.uf-main {
  border-color: var(--vp-c-brand-1);
}
.uf-ck {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.uf-cv {
  font-size: 14.5px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.uf-cs {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.uf-slots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.uf-slot {
  padding: 2px 7px;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
}
.uf-s-start {
  border-color: #f59e0b;
  color: #f59e0b;
}
.uf-s-stop {
  border-color: #22c55e;
  color: #22c55e;
}
.uf-s-par {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.uf-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.uf-note b {
  color: var(--vp-c-text-2);
}
</style>
