<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

// 位操作演练台：把 |= (1<<n) / &= ~(1<<n) / ^= / (>>n)&1 变成看得见的动作
type Op = 'set' | 'clear' | 'toggle' | 'read'

const W = 16 // 演示用 16 位（真实寄存器是 32 位，操作方式完全一样）
const reg = ref(0x00a0)
const op = ref<Op>('set')
const n = ref(5)

const bits = computed(() =>
  Array.from({ length: W }, (_, k) => {
    const i = W - 1 - k
    return { i, v: (reg.value >> i) & 1 }
  })
)

const maskVal = computed(() => 1 << n.value)
const result = computed(() => {
  const v = reg.value
  const m = maskVal.value
  let r: number
  if (op.value === 'set') r = v | m
  else if (op.value === 'clear') r = v & ~m
  else if (op.value === 'toggle') r = v ^ m
  else r = v
  return r & 0xffff
})
const bitVal = computed(() => (reg.value >> n.value) & 1)
const changed = computed(() => op.value !== 'read' && result.value !== reg.value)

const hex = (v: number) => '0x' + v.toString(16).toUpperCase().padStart(4, '0')
const bin = (v: number) =>
  v
    .toString(2)
    .padStart(W, '0')
    .replace(/(.{4})(?=.)/g, '$1 ')

const expr = computed(() => {
  switch (op.value) {
    case 'set':
      return `reg |= (1 << ${n.value});`
    case 'clear':
      return `reg &= ~(1 << ${n.value});`
    case 'toggle':
      return `reg ^= (1 << ${n.value});`
    default:
      return `bit = (reg >> ${n.value}) & 1;`
  }
})

const exprNote = computed(() => {
  switch (op.value) {
    case 'set':
      return `置位：把第 ${n.value} 位强行写成 1，其余位保持原样（因为 OR 上的是只有一位为 1 的掩码）。`
    case 'clear':
      return `清零：把第 ${n.value} 位强行写成 0。注意掩码要取反——若直接 AND 上 (1<<${n.value})，会把除这一位外的所有位都清掉，这是初学者最常犯的错。`
    case 'toggle':
      return `翻转：第 ${n.value} 位是 1 变 0、是 0 变 1。异或同一个掩码两次会回到原值，所以翻转是可逆的。`
    default:
      return `读取：先右移把目标位挪到最低位，再 AND 1 把其余位屏蔽掉，得到 0 或 1。`
  }
})

const readText = computed(() =>
  op.value === 'read'
    ? `读出 bit${n.value} = ${bitVal.value}`
    : `执行后 = ${hex(result.value)}`
)

function pickBit(i: number) {
  n.value = i
}
function apply() {
  if (op.value !== 'read') reg.value = result.value
}
function setPreset(v: number) {
  reg.value = v
}
</script>

<template>
  <div class="bm">
    <Seg
      v-model="op"
      :options="[
        { value: 'set', label: '置位 |= ' },
        { value: 'clear', label: '清零 &=~ ' },
        { value: 'toggle', label: '翻转 ^= ' },
        { value: 'read', label: '读位 >>&1' }
      ]"
      label="操作"
    />

    <div class="bm-bits">
      <button
        v-for="b in bits"
        :key="b.i"
        class="bm-bit"
        :class="{ 'bm-on': b.v === 1, 'bm-sel': b.i === n }"
        @click="pickBit(b.i)"
        :title="`bit${b.i} = ${b.v}`"
      >
        <span class="bm-bv">{{ b.v }}</span>
        <span class="bm-bi">{{ b.i }}</span>
      </button>
    </div>
    <p class="bm-tip">
      点方块选中要操作的位号（当前 <b>bit{{ n }}</b>，值 = {{ bitVal }}）。位号从右往左数，最低位是 bit0。
    </p>

    <div class="bm-presets">
      <span class="bm-pk">寄存器初值：</span>
      <button class="bm-pbtn" @click="setPreset(0x0000)">0x0000</button>
      <button class="bm-pbtn" @click="setPreset(0x00a0)">0x00A0（bit5、bit7 为 1）</button>
      <button class="bm-pbtn" @click="setPreset(0xffff)">0xFFFF</button>
    </div>

    <div class="bm-io">
      <div class="bm-cell">
        <span class="bm-k">当前寄存器</span>
        <b class="bm-v">{{ hex(reg) }}</b>
        <span class="bm-sub">{{ bin(reg) }}</span>
      </div>
      <div class="bm-arrow">→</div>
      <div class="bm-cell" :class="{ 'bm-hl': changed }">
        <span class="bm-k">执行后</span>
        <b class="bm-v">{{ op === 'read' ? '不变' : hex(result) }}</b>
        <span class="bm-sub">{{ op === 'read' ? '读取不改寄存器' : bin(result) }}</span>
      </div>
    </div>

    <div class="bm-code">
      <code>{{ expr }}</code>
      <button class="bm-apply" @click="apply" :disabled="op === 'read'">执行并写入</button>
    </div>
    <p class="bm-note">{{ exprNote }}</p>

    <div class="bm-res">
      <b>{{ readText }}</b>
      <span v-if="op === 'read'" class="bm-sub2">
        当前 bit{{ n }} 是 {{ bitVal }}，所以读出来就是 {{ bitVal }}
      </span>
      <span v-else-if="changed" class="bm-sub2">
        第 {{ n }} 位发生了变化：{{ (reg >> n) & 1 }} → {{ (result >> n) & 1 }}，其余位未动
      </span>
      <span v-else class="bm-sub2">这一位本来就是这个值，操作后寄存器不变</span>
    </div>
  </div>
</template>

<style scoped>
.bm {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bm-bits {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.bm-bit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 30px;
  padding: 3px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-family: var(--vp-font-family-mono);
}
.bm-bit:hover {
  border-color: var(--vp-c-brand-1);
}
.bm-on {
  background: var(--vp-c-brand-dimm-1, rgba(59, 130, 246, 0.15));
  color: var(--vp-c-text-1);
  font-weight: 700;
}
.bm-sel {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}
.bm-bv {
  font-size: 13px;
}
.bm-bi {
  font-size: 9px;
  opacity: 0.65;
}
.bm-tip,
.bm-note {
  margin: 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
  line-height: 1.7;
}
.bm-tip b {
  color: var(--vp-c-text-1);
}
.bm-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.bm-pk {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.bm-pbtn {
  padding: 3px 9px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.bm-pbtn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.bm-io {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.bm-cell {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.bm-cell.bm-hl {
  border-color: var(--vp-c-brand-1);
}
.bm-k {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.bm-v {
  font-size: 16px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.bm-sub {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.5px;
  word-break: break-all;
}
.bm-arrow {
  color: var(--vp-c-text-3);
  font-size: 18px;
}
.bm-code {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.bm-code code {
  flex: 1;
  min-width: 180px;
  padding: 7px 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
}
.bm-apply {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
}
.bm-apply:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.bm-res {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 6px;
}
.bm-res b {
  font-size: 14px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.bm-sub2 {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
