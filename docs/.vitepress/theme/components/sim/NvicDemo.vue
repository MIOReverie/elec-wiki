<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Seg from '../Seg.vue'

// NVIC 优先级演示：抢占优先级决定能不能打断，子优先级只决定同时挂起时谁先
const group = ref(2) // 优先级分组 0~4（F1/F4 用 4 位优先级）
const a = ref({ pre: 1, sub: 0 })
const b = ref({ pre: 0, sub: 1 })
const scene = ref<'seq' | 'sim'>('seq') // seq = A 先执行中 B 到来；sim = A、B 同时挂起

const preBits = computed(() => group.value)
const subBits = computed(() => 4 - group.value)
const preLevels = computed(() => Math.pow(2, preBits.value))
const subLevels = computed(() => Math.pow(2, subBits.value))

// 分组改变后，原来的优先级数值可能超出新的取值范围，需要收敛
watch(preLevels, (n) => {
  if (a.value.pre > n - 1) a.value.pre = n - 1
  if (b.value.pre > n - 1) b.value.pre = n - 1
})
watch(subLevels, (n) => {
  if (a.value.sub > n - 1) a.value.sub = n - 1
  if (b.value.sub > n - 1) b.value.sub = n - 1
})

const preOpts = computed(() => Array.from({ length: preLevels.value }, (_, i) => i))
const subOpts = computed(() => Array.from({ length: subLevels.value }, (_, i) => i))

// 数值越小优先级越高
const verdict = computed(() => {
  const A = a.value
  const B = b.value
  if (scene.value === 'sim') {
    if (A.pre !== B.pre)
      return A.pre < B.pre
        ? `A 的抢占优先级更高（${A.pre} < ${B.pre}）→ A 先执行，B 等 A 结束。`
        : `B 的抢占优先级更高（${B.pre} < ${A.pre}）→ B 先执行，A 等 B 结束。`
    if (A.sub !== B.sub)
      return A.sub < B.sub
        ? `抢占相同，比子优先级：A 更小（${A.sub} < ${B.sub}）→ A 先执行。注意这**不是嵌套**，A 不会打断别人，只是在排队时排在前面。`
        : `抢占相同，比子优先级：B 更小（${B.sub} < ${A.sub}）→ B 先执行。同样不产生嵌套。`
    return `抢占与子优先级都相同 → 按中断号（向量表里的顺序）决定，编号小的先响应。`
  }
  // A 正在执行，B 到来
  if (B.pre < A.pre)
    return `B 的抢占优先级更高（${B.pre} < ${A.pre}）→ **B 直接打断 A**（嵌套中断）：A 被暂停，B 执行完，A 再从断点继续。`
  if (B.pre > A.pre)
    return `B 的抢占优先级更低（${B.pre} > ${A.pre}）→ **B 不能打断 A**，只能排队等 A 执行完毕后才轮到 B。`
  return `抢占优先级相同 → **不嵌套**。无论子优先级如何，B 都不能打断正在执行的 A，必须等 A 结束。子优先级只在「多个中断同时挂起排队」时才起作用。`
})

const nested = computed(
  () => scene.value === 'seq' && b.value.pre < a.value.pre
)

// 时间线分段
const segments = computed(() => {
  if (scene.value === 'sim') {
    const first = a.value.pre < b.value.pre || (a.value.pre === b.value.pre && a.value.sub <= b.value.sub) ? 'A' : 'B'
    const second = first === 'A' ? 'B' : 'A'
    return [
      { label: `主循环`, kind: 'main' },
      { label: `${first} 先执行`, kind: 'a' },
      { label: `${second} 再执行`, kind: 'b' },
      { label: `返回主循环`, kind: 'main' }
    ]
  }
  if (nested.value)
    return [
      { label: '主循环', kind: 'main' },
      { label: 'A 开始执行', kind: 'a' },
      { label: 'B 抢占（嵌套）', kind: 'b' },
      { label: 'A 从断点继续', kind: 'a' },
      { label: '返回主循环', kind: 'main' }
    ]
  return [
    { label: '主循环', kind: 'main' },
    { label: 'A 执行', kind: 'a' },
    { label: 'B 排队后执行', kind: 'b' },
    { label: '返回主循环', kind: 'main' }
  ]
})
</script>

<template>
  <div class="nv">
    <div class="nv-grp">
      <span class="nv-gk">优先级分组</span>
      <button
        v-for="g in 5"
        :key="g"
        class="nv-gb"
        :class="{ 'nv-gon': group === g - 1 }"
        @click="group = g - 1"
      >
        {{ g - 1 }}
      </button>
      <span class="nv-gv">
        → 抢占 {{ preBits }} 位（{{ preLevels }} 级） + 子优先级 {{ subBits }} 位（{{ subLevels }} 级）
      </span>
    </div>

    <Seg
      v-model="scene"
      :options="[
        { value: 'seq', label: 'A 执行中 B 到来' },
        { value: 'sim', label: 'A、B 同时挂起' }
      ]"
      label="场景"
    />

    <div class="nv-irqs">
      <div class="nv-irq">
        <span class="nv-ik">中断 A</span>
        <div class="nv-pr">
          <span class="nv-pk">抢占</span>
          <button
            v-for="p in preOpts"
            :key="p"
            class="nv-pb"
            :class="{ 'nv-pon': a.pre === p }"
            @click="a.pre = p"
          >
            {{ p }}
          </button>
        </div>
        <div class="nv-pr">
          <span class="nv-pk">子优先级</span>
          <button
            v-for="s in subOpts"
            :key="s"
            class="nv-pb"
            :class="{ 'nv-pon': a.sub === s }"
            @click="a.sub = s"
          >
            {{ s }}
          </button>
        </div>
      </div>
      <div class="nv-irq">
        <span class="nv-ik">中断 B</span>
        <div class="nv-pr">
          <span class="nv-pk">抢占</span>
          <button
            v-for="p in preOpts"
            :key="p"
            class="nv-pb"
            :class="{ 'nv-pon': b.pre === p }"
            @click="b.pre = p"
          >
            {{ p }}
          </button>
        </div>
        <div class="nv-pr">
          <span class="nv-pk">子优先级</span>
          <button
            v-for="s in subOpts"
            :key="s"
            class="nv-pb"
            :class="{ 'nv-pon': b.sub === s }"
            @click="b.sub = s"
          >
            {{ s }}
          </button>
        </div>
      </div>
    </div>

    <div class="nv-tl">
      <div
        v-for="(s, i) in segments"
        :key="i"
        class="nv-seg"
        :class="'nv-s-' + s.kind"
      >
        {{ s.label }}
      </div>
    </div>

    <p class="nv-v" :class="{ 'nv-nest': nested }">{{ verdict }}</p>

    <p class="nv-note">
      <b>两条规则要分清：</b>①<b>抢占优先级</b>决定「能不能打断」——只有抢占更高才能嵌套进去；
      ②<b>子优先级</b>只在「几个中断同时挂着等待响应」时决定谁排前面，<b>它永远不会让一个中断打断另一个</b>。
      常见误解是以为子优先级也能嵌套，结果系统里出现意料之外的延迟。
      另外，<b>数值越小优先级越高</b>（0 是最高），这一点和很多 RTOS 任务优先级的习惯相反。
    </p>
  </div>
</template>

<style scoped>
.nv {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.nv-grp {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.nv-gk {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.nv-gb {
  min-width: 26px;
  padding: 2px 7px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.nv-gb:hover {
  border-color: var(--vp-c-brand-1);
}
.nv-gon {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.nv-gv {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.nv-irqs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.nv-irq {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.nv-ik {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.nv-pr {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.nv-pk {
  width: 56px;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.nv-pb {
  min-width: 24px;
  padding: 2px 6px;
  font-size: 11.5px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.nv-pon {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.nv-tl {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: stretch;
}
.nv-seg {
  flex: 1;
  min-width: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 6px;
  font-size: 11.5px;
  text-align: center;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}
.nv-s-main {
  background: var(--vp-c-bg);
}
.nv-s-a {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  background: rgba(59, 130, 246, 0.12);
}
.nv-s-b {
  border-color: #f59e0b;
  color: var(--vp-c-text-1);
  background: rgba(245, 158, 11, 0.14);
}
.nv-v {
  margin: 0;
  padding: 9px 11px;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 6px;
}
.nv-v.nv-nest {
  border-left-color: #f59e0b;
}
.nv-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.nv-note b {
  color: var(--vp-c-text-2);
}
@media (max-width: 520px) {
  .nv-irqs {
    grid-template-columns: 1fr;
  }
}
</style>
