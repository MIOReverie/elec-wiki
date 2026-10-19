<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

type Mode = 'adder' | 'decoder' | 'mux'
const mode = ref<Mode>('adder')

// —— 全加器 ——
const A = ref(0), B = ref(0), Cin = ref(0)
const S = computed(() => A.value ^ B.value ^ Cin.value)
const Cout = computed(() => (A.value & B.value) | ((A.value ^ B.value) & Cin.value))

// —— 2-4 译码器（输出高有效）——
const DA = ref(0), DB = ref(0)
const Ydec = computed(() => {
  const addr = (DA.value << 1) | DB.value
  return [0, 1, 2, 3].map((i) => (i === addr ? 1 : 0))
})

// —— 4 选 1 选择器 ——
const SA = ref(0), SB = ref(0)
const D = ref([0, 1, 1, 0]) // D0 D1 D2 D3
const Ymux = computed(() => D.value[(SA.value << 1) | SB.value])

function flip(v: number) { return v ? 0 : 1 }
function toggleD(i: number) { D.value[i] = flip(D.value[i]) }
</script>

<template>
  <div class="cd">
    <div class="cd-bar">
      <Seg
        v-model="mode"
        label="电路"
        :options="[
          { value: 'adder', label: '1 位全加器' },
          { value: 'decoder', label: '2-4 译码器' },
          { value: 'mux', label: '4 选 1 MUX' }
        ]"
      />
    </div>

    <!-- 全加器 -->
    <div v-if="mode === 'adder'" class="cd-body">
      <div class="cd-io">
        <span class="cd-lab">输入</span>
        <button class="cd-bit" :class="{ on: A }" @click="A = flip(A)">A = {{ A }}</button>
        <button class="cd-bit" :class="{ on: B }" @click="B = flip(B)">B = {{ B }}</button>
        <button class="cd-bit" :class="{ on: Cin }" @click="Cin = flip(Cin)">C<sub>in</sub> = {{ Cin }}</button>
      </div>
      <div class="cd-eq">S = A ⊕ B ⊕ C<sub>in</sub> &nbsp;|&nbsp; C<sub>out</sub> = AB + (A⊕B)C<sub>in</sub></div>
      <div class="cd-io">
        <span class="cd-lab">输出</span>
        <span class="cd-lamp" :class="{ lit: S }">S = {{ S }}</span>
        <span class="cd-lamp" :class="{ lit: Cout }">C<sub>out</sub> = {{ Cout }}</span>
      </div>
    </div>

    <!-- 2-4 译码器 -->
    <div v-else-if="mode === 'decoder'" class="cd-body">
      <div class="cd-io">
        <span class="cd-lab">地址</span>
        <button class="cd-bit" :class="{ on: DA }" @click="DA = flip(DA)">A<sub>1</sub> = {{ DA }}</button>
        <button class="cd-bit" :class="{ on: DB }" @click="DB = flip(DB)">A<sub>0</sub> = {{ DB }}</button>
      </div>
      <div class="cd-eq">Y<sub>i</sub> = m<sub>i</sub>（只有被寻址的输出为 1）</div>
      <div class="cd-io cd-wrap">
        <span class="cd-lab">输出</span>
        <span v-for="i in 4" :key="i" class="cd-lamp" :class="{ lit: Ydec[i - 1] }">Y{{ i - 1 }} = {{ Ydec[i - 1] }}</span>
      </div>
    </div>

    <!-- 4 选 1 MUX -->
    <div v-else class="cd-body">
      <div class="cd-io">
        <span class="cd-lab">地址</span>
        <button class="cd-bit" :class="{ on: SA }" @click="SA = flip(SA)">S<sub>1</sub> = {{ SA }}</button>
        <button class="cd-bit" :class="{ on: SB }" @click="SB = flip(SB)">S<sub>0</sub> = {{ SB }}</button>
      </div>
      <div class="cd-io cd-wrap">
        <span class="cd-lab">数据（点一下改 0/1）</span>
        <button v-for="i in 4" :key="i" class="cd-bit sm" :class="{ on: D[i - 1] }" @click="toggleD(i - 1)">D{{ i - 1 }} = {{ D[i - 1] }}</button>
      </div>
      <div class="cd-eq">Y = D<sub>(S₁S₀)</sub>（把地址当变量、数据端接 0/1，可拼出任意组合逻辑）</div>
      <div class="cd-io">
        <span class="cd-lab">输出</span>
        <span class="cd-lamp" :class="{ lit: Ymux }">Y = {{ Ymux }}</span>
      </div>
    </div>

    <p class="cd-note">
      自己把 A/B/C<sub>in</sub> 或地址/数据拨一遍，对照上面的公式逐位核对——比背真值表快得多。
    </p>
  </div>
</template>

<style scoped>
.cd { display: flex; flex-direction: column; gap: 10px; }
.cd-bar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; }
.cd-body { display: flex; flex-direction: column; gap: 12px; padding: 14px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg-soft); }
.cd-io { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.cd-wrap { gap: 8px 10px; }
.cd-lab { font-size: 12px; color: var(--vp-c-text-3); margin-right: 4px; }
.cd-bit {
  min-width: 58px; padding: 7px 10px; border-radius: 8px; cursor: pointer;
  font-size: 13px; font-weight: 600; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); color: var(--vp-c-text-2); transition: all .12s;
}
.cd-bit.sm { min-width: 50px; padding: 5px 8px; font-size: 12px; }
.cd-bit.on { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.cd-eq { font-size: 13px; color: var(--vp-c-text-2); text-align: center; font-family: var(--vp-font-family-mono, monospace); }
.cd-lamp {
  min-width: 58px; padding: 7px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;
  border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); background: var(--vp-c-bg);
}
.cd-lamp.lit { background: #16a34a; border-color: #16a34a; color: #fff; box-shadow: 0 0 0 3px rgba(22,163,74,.18); }
.cd-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.65; }
</style>
