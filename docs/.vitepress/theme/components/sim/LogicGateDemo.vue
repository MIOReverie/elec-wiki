<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

type GateId = 'and' | 'or' | 'xor' | 'nand' | 'nor' | 'not'
interface Gate { id: GateId; label: string; expr: string; unary?: boolean; fn: (a: number, b: number) => number }
const gates: Gate[] = [
  { id: 'and', label: '与 AND', expr: 'Y = A · B', fn: (a, b) => (a && b ? 1 : 0) },
  { id: 'or', label: '或 OR', expr: 'Y = A + B', fn: (a, b) => (a || b ? 1 : 0) },
  { id: 'xor', label: '异或 XOR', expr: 'Y = A ⊕ B', fn: (a, b) => (a !== b ? 1 : 0) },
  { id: 'nand', label: '与非 NAND', expr: 'Y = A · B ‾', fn: (a, b) => (a && b ? 0 : 1) },
  { id: 'nor', label: '或非 NOR', expr: 'Y = A + B ‾', fn: (a, b) => (a || b ? 0 : 1) },
  { id: 'not', label: '非 NOT', expr: 'Y = A ‾', unary: true, fn: (a) => (a ? 0 : 1) }
]

const gid = ref<GateId>('and')
const gate = computed(() => gates.find((g) => g.id === gid.value)!)
const A = ref(1)
const B = ref(0)

const output = computed(() => gate.value.fn(A.value, B.value))

// 完整真值表（NOT 只有两行）
const table = computed(() => {
  const g = gate.value
  if (g.unary) return [{ a: 0, b: 0, y: g.fn(0, 0) }, { a: 1, b: 0, y: g.fn(1, 0) }]
  return [
    { a: 0, b: 0, y: g.fn(0, 0) },
    { a: 0, b: 1, y: g.fn(0, 1) },
    { a: 1, b: 0, y: g.fn(1, 0) },
    { a: 1, b: 1, y: g.fn(1, 1) }
  ]
})
</script>

<template>
  <div class="lg">
    <Seg
      v-model="gid"
      :options="gates.map((g) => ({ value: g.id, label: g.label }))"
      label="逻辑门"
    />
    <p class="lg-expr">表达式：<b>{{ gate.expr }}</b></p>

    <div class="lg-io">
      <button class="lg-bit" :class="{ on: A }" @click="A = A ? 0 : 1">A = {{ A }}</button>
      <button v-if="!gate.unary" class="lg-bit" :class="{ on: B }" @click="B = B ? 0 : 1">B = {{ B }}</button>
      <span class="lg-arrow">→</span>
      <span class="lg-out" :class="{ on: output }">Y = {{ output }}</span>
    </div>

    <table class="lg-tbl">
      <thead>
        <tr><th>A</th><th v-if="!gate.unary">B</th><th>Y</th></tr>
      </thead>
      <tbody>
        <tr
          v-for="(r, i) in table"
          :key="i"
          :class="{ cur: r.a === A && (gate.unary || r.b === B) }"
        >
          <td>{{ r.a }}</td>
          <td v-if="!gate.unary">{{ r.b }}</td>
          <td :class="{ hi: r.y }">{{ r.y }}</td>
        </tr>
      </tbody>
    </table>
    <p class="lg-note">
      点 A / B 切换 0/1，下方真值表会<b>高亮当前输入对应的那一行</b>。注意：与非/或非才是「全能门」——
      仅靠 NAND 或仅靠 NOR 就能搭出任意逻辑函数。
    </p>
  </div>
</template>

<style scoped>
.lg { display: flex; flex-direction: column; gap: 10px; }
.lg-expr { margin: 0; font-size: 13.5px; color: var(--vp-c-text-2); }
.lg-expr b { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.lg-io { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.lg-bit {
  min-width: 64px; padding: 8px 12px; font-size: 15px; font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);
  color: var(--vp-c-text-2); cursor: pointer;
}
.lg-bit.on { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); }
.lg-arrow { font-size: 18px; color: var(--vp-c-text-3); }
.lg-out {
  min-width: 64px; padding: 8px 12px; font-size: 15px; font-family: var(--vp-font-family-mono);
  border-radius: 8px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); text-align: center;
}
.lg-out.on { background: var(--vp-c-success-1, #2d9d6a); color: #fff; }
.lg-tbl { border-collapse: collapse; width: 100%; max-width: 280px; font-family: var(--vp-font-family-mono); }
.lg-tbl th, .lg-tbl td { border: 1px solid var(--vp-c-divider); padding: 6px 10px; text-align: center; font-size: 14px; }
.lg-tbl th { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.lg-tbl tbody tr.cur { background: var(--vp-c-brand-soft, #e8f0fe); }
.lg-tbl td.hi { color: var(--vp-c-brand-1); font-weight: 700; }
.lg-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.lg-note b { color: var(--vp-c-text-2); }
</style>
