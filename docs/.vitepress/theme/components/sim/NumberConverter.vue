<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

// 输入进制：DEC / BIN / HEX。其余表示（二进制、十六进制、BCD、补码）全部实时推导。
const base = ref<'dec' | 'bin' | 'hex'>('dec')
const raw = ref('182')
const err = ref('')

function parse(): number | null {
  const s = raw.value.trim().toLowerCase()
  if (!s) { err.value = ''; return null }
  let v: number
  if (base.value === 'dec') {
    if (!/^\d+$/.test(s)) { err.value = '十进制只能含数字 0-9'; return null }
    v = Number(s)
  } else if (base.value === 'bin') {
    if (!/^[01]+$/.test(s)) { err.value = '二进制只能含 0 / 1'; return null }
    v = parseInt(s, 2)
  } else {
    if (!/^[0-9a-f]+$/.test(s)) { err.value = '十六进制只能含 0-9 a-f'; return null }
    v = parseInt(s, 16)
  }
  if (!Number.isFinite(v) || v < 0) { err.value = '数值无效'; return null }
  if (v > 0xffffffff) { err.value = '超出 32 位无符号范围'; return null }
  err.value = ''
  return v
}

const val = computed(parse)

function group(s: string, n: number): string {
  // 从右往左每 n 位插一个空格
  const neg = s.startsWith('-')
  const body = neg ? s.slice(1) : s
  const out: string[] = []
  for (let i = body.length; i > 0; i -= n) out.unshift(body.slice(Math.max(0, i - n), i))
  return (neg ? '-' : '') + out.join(' ')
}

const decStr = computed(() => (val.value == null ? '—' : val.value.toString(10)))
const binStr = computed(() => (val.value == null ? '—' : group(val.value.toString(2), 4)))
const hexStr = computed(() => (val.value == null ? '—' : group(val.value.toString(16).toUpperCase(), 2)))
const bcdStr = computed(() => {
  if (val.value == null) return '—'
  // BCD：每个十进制数字单独编成 4 位（注意这不是该数的二进制！）
  return decStr.value
    .split('')
    .map((d) => Number(d).toString(2).padStart(4, '0'))
    .join(' ')
})

// 补码（two's complement）：把无符号值当作有符号 N 位来解读
function asSigned(v: number, bits: number): { num: number; ok: boolean } {
  const maxU = Math.pow(2, bits)
  if (v >= maxU) return { num: 0, ok: false }
  const half = Math.pow(2, bits - 1)
  return { num: v < half ? v : v - maxU, ok: true }
}
const s8 = computed(() => (val.value == null ? { num: 0, ok: false } : asSigned(val.value, 8)))
const s16 = computed(() => (val.value == null ? { num: 0, ok: false } : asSigned(val.value, 16)))
</script>

<template>
  <div class="nc">
    <div class="nc-row">
      <Seg
        v-model="base"
        :options="[
          { value: 'dec', label: '十进制' },
          { value: 'bin', label: '二进制' },
          { value: 'hex', label: '十六进制' }
        ]"
        label="输入进制"
      />
      <input
        class="nc-input"
        :value="raw"
        @input="(e: any) => (raw = e.target.value)"
        :placeholder="base === 'bin' ? '如 10110110' : base === 'hex' ? '如 B6' : '如 182'"
        spellcheck="false"
      />
    </div>
    <p v-if="err" class="nc-err">{{ err }}</p>

    <div class="nc-grid">
      <div class="nc-cell"><span class="nc-k">十进制</span><b class="nc-v">{{ decStr }}</b></div>
      <div class="nc-cell"><span class="nc-k">二进制（每 4 位一组）</span><b class="nc-v mono">{{ binStr }}</b></div>
      <div class="nc-cell"><span class="nc-k">十六进制</span><b class="nc-v mono">{{ hexStr }}</b></div>
      <div class="nc-cell"><span class="nc-k">BCD（8421，每位十进制独立 4 位）</span><b class="nc-v mono">{{ bcdStr }}</b></div>
    </div>

    <div class="nc-sign">
      <div class="nc-cell">
        <span class="nc-k">8 位补码解读</span>
        <b class="nc-v">{{ s8.ok ? (s8.num < 0 ? s8.num : '+' + s8.num) : '溢出' }}</b>
      </div>
      <div class="nc-cell">
        <span class="nc-k">16 位补码解读</span>
        <b class="nc-v">{{ s16.ok ? (s16.num < 0 ? s16.num : '+' + s16.num) : '溢出' }}</b>
      </div>
    </div>
    <p class="nc-note">
      补码解读：同一个二进制码，既可以看成无符号数，也可以看成有符号数。最高位为 1 时按「模 − 绝对值」算成负数，
      于是 <b>减法变成加法</b>、<b>0 只有一种表示</b>。试输入 255：无符号是 255，8 位补码却是 −1。
    </p>
  </div>
</template>

<style scoped>
.nc { display: flex; flex-direction: column; gap: 10px; }
.nc-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.nc-input {
  flex: 1; min-width: 160px; padding: 6px 10px; font-size: 14px; font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1);
}
.nc-input:focus { outline: none; border-color: var(--vp-c-brand-1); }
.nc-err { margin: 0; color: var(--vp-c-danger-1); font-size: 12.5px; }
.nc-grid, .nc-sign { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.nc-cell {
  display: flex; flex-direction: column; gap: 2px; padding: 8px 10px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 8px;
}
.nc-k { font-size: 11.5px; color: var(--vp-c-text-3); }
.nc-v { font-size: 15px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); word-break: break-all; }
.nc-v.mono { letter-spacing: 0.5px; }
.nc-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.nc-note b { color: var(--vp-c-text-2); }
@media (max-width: 520px) { .nc-grid, .nc-sign { grid-template-columns: 1fr; } }
</style>
