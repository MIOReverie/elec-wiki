<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

type Mode = 'D' | 'JK'
const mode = ref<Mode>('D')

const Q = ref(0) // 现态
const D = ref(0)
const J = ref(0)
const K = ref(0)
const lastEdge = ref('—') // 记录上一次边沿算出的 Q+

function risingEdge() {
  if (mode.value === 'D') {
    Q.value = D.value
    lastEdge.value = `Q⁺ = D = ${D.value}`
  } else {
    // Q⁺ = J·Q̄ + K̄·Q
    Q.value = (J.value & (Q.value ? 0 : 1)) | ((K.value ? 0 : 1) & Q.value)
    lastEdge.value = `Q⁺ = JQ̄ + K̄Q = ${Q.value}`
  }
}
function asyncSet() { Q.value = 1; lastEdge.value = '̄SD 异步置 1' }
function asyncReset() { Q.value = 0; lastEdge.value = '̄RD 异步清 0' }

const Qbar = computed(() => (Q.value ? 0 : 1))
</script>

<template>
  <div class="ff">
    <div class="ff-bar">
      <Seg
        v-model="mode"
        label="类型"
        :options="[
          { value: 'D', label: 'D 触发器' },
          { value: 'JK', label: 'JK 触发器' }
        ]"
      />
    </div>

    <div class="ff-eq" v-if="mode === 'D'">特性方程&nbsp; Q⁺ = D&nbsp;&nbsp;（边沿到来时 Q 翻成 D）</div>
    <div class="ff-eq" v-else>特性方程&nbsp; Q⁺ = JQ̄ + K̄Q&nbsp;&nbsp;（J=K=1 时每个边沿翻转）</div>

    <div class="ff-row">
      <div class="ff-col">
        <span class="ff-lab">输入</span>
        <template v-if="mode === 'D'">
          <button class="ff-bit" :class="{ on: D }" @click="D = D ? 0 : 1">D = {{ D }}</button>
        </template>
        <template v-else>
          <button class="ff-bit" :class="{ on: J }" @click="J = J ? 0 : 1">J = {{ J }}</button>
          <button class="ff-bit" :class="{ on: K }" @click="K = K ? 0 : 1">K = {{ K }}</button>
        </template>
        <button class="ff-clk" @click="risingEdge">↑ 发一个时钟脉冲</button>
        <button class="ff-async" @click="asyncSet">̄SD 置 1</button>
        <button class="ff-async" @click="asyncReset">̄RD 清 0</button>
      </div>

      <div class="ff-col ff-out">
        <span class="ff-lab">输出</span>
        <span class="ff-q" :class="{ lit: Q }">Q = {{ Q }}</span>
        <span class="ff-q" :class="{ lit: Qbar }">Q̄ = {{ Qbar }}</span>
        <span class="ff-edge">上次边沿：{{ lastEdge }}</span>
      </div>
    </div>

    <p class="ff-note">
      边沿触发器只在<b>上升沿那一刻</b>采样输入；CLK 保持期间你怎么拨 D/J/K 都不影响 Q。异步端 ̄SD/̄RD 不受时钟约束、优先级最高——先点它们强制置位/清零，再发时钟看 Q 被重新决定。
    </p>
  </div>
</template>

<style scoped>
.ff { display: flex; flex-direction: column; gap: 10px; }
.ff-bar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; }
.ff-eq { font-size: 13px; color: var(--vp-c-text-2); text-align: center; font-family: var(--vp-font-family-mono, monospace); }
.ff-row { display: flex; flex-wrap: wrap; gap: 16px; padding: 14px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg-soft); }
.ff-col { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.ff-out { gap: 10px; }
.ff-lab { font-size: 12px; color: var(--vp-c-text-3); margin-right: 2px; }
.ff-bit { min-width: 52px; padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-2); transition: all .12s; }
.ff-bit.on { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.ff-clk { padding: 7px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700; border: 1px solid var(--vp-c-brand); background: var(--vp-c-brand); color: #fff; }
.ff-async { padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-2); }
.ff-q { min-width: 52px; padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); background: var(--vp-c-bg); }
.ff-q.lit { background: #16a34a; border-color: #16a34a; color: #fff; box-shadow: 0 0 0 3px rgba(22,163,74,.18); }
.ff-edge { font-size: 12px; color: var(--vp-c-text-3); font-family: var(--vp-font-family-mono, monospace); }
.ff-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
.ff-note b { color: var(--vp-c-text-2); }
</style>
