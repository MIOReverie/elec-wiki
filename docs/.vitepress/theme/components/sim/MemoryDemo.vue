<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

const WORDS = 8
const BITS = 4

const mode = ref<'SRAM' | 'DRAM'>('SRAM')
const addr = ref(0)
const data = ref([1, 0, 1, 1])
const mem = ref<number[]>(Array.from({ length: WORDS }, () => 0))
const log = ref<string[]>(['上电：SRAM 内容随机（这里初始化为 0）'])
const lastOp = ref('—')

function bin(n: number, w: number) {
  return n.toString(2).padStart(w, '0')
}
function say(s: string) {
  log.value.unshift(s)
  if (log.value.length > 6) log.value.pop()
}

function doWrite() {
  const v = data.value.reduce((a, b, i) => a | (b << (BITS - 1 - i)), 0)
  mem.value[addr.value] = v
  lastOp.value = `写 A=${addr.value} → ${bin(v, BITS)}`
  say(`WE=1：把 ${bin(v, BITS)} 写入 ${addr.value} 号单元（译码器只使能第 ${addr.value} 行）`)
}
function doRead() {
  const v = mem.value[addr.value]
  lastOp.value = `读 A=${addr.value} → ${bin(v, BITS)}`
  say(`WE=0：译码器使能第 ${addr.value} 行，数据线上出现 ${bin(v, BITS)}（非破坏性读出）`)
}

// DRAM 演示：电容电荷衰减
const charge = ref(100) // 百分比
const decayTimer = ref<number | null>(null)
function startDecay() {
  if (decayTimer.value !== null) return
  say('DRAM 模式：存储电容开始漏电，电荷会归零——必须定时刷新')
  decayTimer.value = window.setInterval(() => {
    charge.value = Math.max(0, charge.value - 7)
    if (charge.value === 0) {
      say('电荷漏光！该位数据丢失（不刷新的话这就是全部结局）')
      stopDecay()
    }
  }, 300)
}
function stopDecay() {
  if (decayTimer.value !== null) {
    clearInterval(decayTimer.value)
    decayTimer.value = null
  }
}
function doRefresh() {
  charge.value = 100
  say('刷新：读出放大再写回，电荷充满（刷新只续命、不改数据）')
}
function toggleMode(v: 'SRAM' | 'DRAM') {
  mode.value = v
  stopDecay()
  charge.value = 100
  if (v === 'DRAM') startDecay()
  else say('切回 SRAM：触发器自保持，不刷新也丢不了')
}

const decoder = computed(() => {
  const a = bin(addr.value, 3)
  return a
})
const nonZero = computed(() => mem.value.filter((v) => v !== 0).length)
</script>

<template>
  <div class="mem">
    <div class="mem-bar">
      <Seg v-model="mode" label="类型" :options="[{ value: 'SRAM', label: 'SRAM（触发器）' }, { value: 'DRAM', label: 'DRAM（电容）' }]" @update:model-value="toggleMode" />
    </div>

    <div class="mem-dec">
      地址线 A₂A₁A₀ = <b>{{ decoder }}</b> → 3-8 译码器使能第 <b>{{ addr }}</b> 行
    </div>

    <div class="mem-grid">
      <div class="mem-row mem-head">
        <span class="mem-cell">行</span>
        <span v-for="b in BITS" :key="'h' + b" class="mem-cell">D{{ b - 1 }}</span>
      </div>
      <div v-for="(v, i) in mem" :key="i" class="mem-row" :class="{ sel: i === addr }">
        <span class="mem-cell mem-addr" :class="{ sel: i === addr }">{{ i }}</span>
        <span v-for="b in BITS" :key="'b' + b" class="mem-cell" :class="{ on: (v >> (BITS - b)) & 1, sel: i === addr }">
          {{ (v >> (BITS - b)) & 1 }}
        </span>
      </div>
    </div>

    <div class="mem-ctl">
      <span class="mem-lab">地址</span>
      <input v-model.number="addr" type="range" min="0" :max="WORDS - 1" class="mem-slider" />
      <span class="mem-val">A = {{ addr }}</span>
    </div>
    <div class="mem-ctl">
      <span class="mem-lab">数据</span>
      <template v-for="(b, i) in data" :key="i">
        <button class="mem-bit" :class="{ on: b }" @click="data[i] = b ? 0 : 1">D{{ BITS - 1 - i }} = {{ b }}</button>
      </template>
    </div>
    <div class="mem-ctl">
      <button class="mem-btn" @click="doWrite">写入（WE=1）</button>
      <button class="mem-btn" @click="doRead">读出（WE=0）</button>
      <span class="mem-last">{{ lastOp }}</span>
    </div>

    <div v-if="mode === 'DRAM'" class="mem-dram">
      <div class="mem-lab">选中行电容电荷</div>
      <div class="mem-charge"><div class="mem-charge-fill" :style="{ width: charge + '%' }" :class="{ low: charge < 40 }"></div></div>
      <button class="mem-btn" @click="doRefresh">刷新这一行</button>
      <span class="mem-hint">真实 DRAM 每 15~64 μs 要把整个存储体刷一遍</span>
    </div>

    <div class="mem-log">
      <div class="mem-lab">操作记录</div>
      <div v-for="(l, i) in log" :key="i" class="mem-logline">{{ l }}</div>
      <div class="mem-hint">当前非零单元 {{ nonZero }} / {{ WORDS }} 个</div>
    </div>
  </div>
</template>

<style scoped>
.mem { display: flex; flex-direction: column; gap: 8px; }
.mem-dec {
  font-size: 12.5px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
}
.mem-grid {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 12.5px;
}
.mem-row { display: flex; gap: 2px; }
.mem-cell {
  min-width: 26px;
  text-align: center;
  padding: 3px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-2);
}
.mem-cell.on { background: color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent); color: var(--vp-c-text-1); font-weight: 600; }
.mem-cell.sel { border-color: var(--vp-c-brand-1); }
.mem-addr { background: var(--vp-c-bg-alt); font-weight: 600; color: var(--vp-c-text-1); }
.mem-addr.sel { background: var(--vp-c-brand-1); color: #fff; }
.mem-head .mem-cell { background: transparent; border-color: transparent; color: var(--vp-c-text-3); }
.mem-ctl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mem-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); min-width: 30px; }
.mem-slider { width: 180px; }
.mem-val { font-family: var(--vp-font-family-mono, monospace); font-size: 12.5px; }
.mem-bit {
  padding: 3px 9px;
  font-size: 12.5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-family: var(--vp-font-family-mono, monospace);
}
.mem-bit.on { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; font-weight: 600; }
.mem-btn {
  padding: 4px 12px;
  font-size: 12.5px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-weight: 600;
}
.mem-btn:hover { background: var(--vp-c-brand-1); color: #fff; }
.mem-last { font-size: 12.5px; color: var(--vp-c-text-3); font-family: var(--vp-font-family-mono, monospace); }
.mem-dram {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
}
.mem-charge {
  width: 160px;
  height: 10px;
  border-radius: 5px;
  background: var(--vp-c-bg-alt);
  overflow: hidden;
}
.mem-charge-fill { height: 100%; background: var(--vp-c-brand-1); transition: width 0.3s; }
.mem-charge-fill.low { background: #d5303e; }
.mem-hint { font-size: 12px; color: var(--vp-c-text-3); }
.mem-log { display: flex; flex-direction: column; gap: 3px; }
.mem-logline { font-size: 12px; color: var(--vp-c-text-2); }
.mem-logline:first-of-type { color: var(--vp-c-text-1); }
</style>
