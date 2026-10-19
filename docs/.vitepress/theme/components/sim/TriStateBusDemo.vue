<script setup lang="ts">
import { computed, ref } from 'vue'

type Mode = 'tri' | 'od'
interface Dev { id: string; name: string; data: number; en: boolean }

const mode = ref<Mode>('tri')
const devs = ref<Dev[]>([
  { id: 'A', name: '设备 A', data: 1, en: true },
  { id: 'B', name: '设备 B', data: 0, en: false },
  { id: 'C', name: '设备 C', data: 1, en: false }
])

// 每个设备当前往总线上发的东西：'0' | '1' | 'Z'
const out = computed(() =>
  devs.value.map((d) => {
    if (!d.en) return 'Z'
    return mode.value === 'tri' ? String(d.data) : '0'
  })
)

// 总线状态：'0' | '1' | 'Z' | 'conflict'
const bus = computed(() => {
  const active = devs.value.filter((d) => d.en)
  if (mode.value === 'od') return active.length > 0 ? '0' : '1'
  if (active.length === 0) return 'Z'
  if (active.length === 1) return String(active[0].data)
  const allSame = active.every((d) => d.data === active[0].data)
  return allSame ? String(active[0].data) : 'conflict'
})

const driverCount = computed(() => devs.value.filter((d) => d.en).length)

const busLabel = computed(() => {
  switch (bus.value) {
    case '0': return '0（低电平）'
    case '1': return '1（高电平）'
    case 'Z': return 'Z（高阻 · 悬空）'
    default: return '⚠ 冲突'
  }
})

const busNote = computed(() => {
  if (mode.value === 'od') {
    if (driverCount.value === 0) {
      return '没有设备拉低，上拉电阻把总线抬到高电平 —— 这就是开漏「线与」：任一设备拉低，整线为低；都释放，线才是高。'
    }
    return `${driverCount.value} 个设备正在拉低，总线被钳到 0。开漏输出只会拉低、不会主动拉高，所以多个设备同时拉低也不会冲突。`
  }
  if (driverCount.value === 0) {
    return '三个设备全是高阻，总线悬空 —— 读端拿到的是不确定值，这就是「总线上必须至少有一个驱动」的原因。'
  }
  if (driverCount.value === 1) {
    const only = devs.value.filter((d) => d.en)[0]
    return `只有${only.name} 在驱动，总线电平由它单独决定 —— 总线的正确用法。`
  }
  if (bus.value === 'conflict') {
    return '两个以上设备同时驱动且电平相反：一个拉高一个拉低，电流不受限地灌过对管，既读不出确定值也可能烧毁 —— 这就是总线冲突。'
  }
  return '两个以上设备同时驱动（电平凑巧相同）。虽然此刻不过流，仍然违反「任意时刻至多一个驱动」的仲裁规则。'
})

function preset(kind: 'single' | 'float' | 'conflict' | 'same' | 'wired') {
  const mk = (a: [number, boolean], b: [number, boolean], c: [number, boolean], m: Mode): Dev[] => [
    { id: 'A', name: '设备 A', data: a[0], en: a[1] },
    { id: 'B', name: '设备 B', data: b[0], en: b[1] },
    { id: 'C', name: '设备 C', data: c[0], en: c[1] }
  ]
  if (kind === 'single') { mode.value = 'tri'; devs.value = mk([1, true], [0, false], [1, false], 'tri') }
  else if (kind === 'float') { mode.value = 'tri'; devs.value = devs.value.map((d) => ({ ...d, en: false })) }
  else if (kind === 'conflict') { mode.value = 'tri'; devs.value = mk([1, true], [0, true], [1, false], 'tri') }
  else if (kind === 'same') { mode.value = 'tri'; devs.value = mk([1, true], [1, true], [1, false], 'tri') }
  else { mode.value = 'od'; devs.value = mk([0, false], [0, false], [0, false], 'od') }
}
</script>

<template>
  <div class="tsb">
    <div class="tsb-modes">
      <button :class="{ on: mode === 'tri' }" @click="mode = 'tri'">三态门总线（推挽）</button>
      <button :class="{ on: mode === 'od' }" @click="mode = 'od'">开漏 OD + 上拉（线与）</button>
    </div>

    <div class="tsb-devs">
      <div v-for="(d, i) in devs" :key="d.id" class="tsb-dev">
        <div class="tsb-devname">{{ d.name }}</div>
        <div class="tsb-ctrl">
          <button v-if="mode === 'tri'" class="tsb-bit" :class="{ on: d.data === 1 }" @click="d.data = d.data ? 0 : 1">
            数据 D = {{ d.data }}
          </button>
          <button class="tsb-bit" :class="{ on: d.en }" @click="d.en = !d.en">
            {{ mode === 'tri' ? (d.en ? 'EN 有效' : 'EN 高阻') : (d.en ? '拉低中' : '已释放') }}
          </button>
        </div>
        <div class="tsb-out" :class="'o-' + out[i]">输出 {{ out[i] }}</div>
        <div class="tsb-stub" :class="{ z: out[i] === 'Z' }" />
      </div>
    </div>

    <div class="tsb-buswrap">
      <div class="tsb-bus" :class="'b-' + bus">
        <span>{{ mode === 'od' && driverCount === 0 ? '总线 = 1（上拉电阻抬至高电平）' : '总线 = ' + busLabel }}</span>
      </div>
      <div class="tsb-reader">
        <span class="tsb-readertag">读端看到</span>
        <span class="tsb-readval" :class="'r-' + bus">{{ bus === 'conflict' ? '不定 / 报警' : bus === 'Z' ? '不定' : bus }}</span>
      </div>
    </div>

    <p class="tsb-note">{{ busNote }}</p>

    <div class="tsb-presets">
      <span class="tsb-presetlbl">一键场景：</span>
      <button @click="preset('single')">仅 A 驱动</button>
      <button @click="preset('float')">全部高阻</button>
      <button @click="preset('conflict')">A、B 冲突驱动</button>
      <button @click="preset('same')">A、B 同电平驱动</button>
      <button @click="preset('wired')">开漏：都释放 → 线为高</button>
    </div>
  </div>
</template>

<style scoped>
.tsb { display: flex; flex-direction: column; gap: 12px; }
.tsb-modes { display: flex; gap: 8px; flex-wrap: wrap; }
.tsb-modes button {
  padding: 6px 12px; font-size: 13px; border: 1px solid var(--vp-c-divider);
  border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-2); cursor: pointer;
}
.tsb-modes button.on { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); }
.tsb-devs { display: flex; gap: 12px; flex-wrap: wrap; }
.tsb-dev {
  flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px; align-items: center;
  padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg-soft);
}
.tsb-devname { font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); }
.tsb-ctrl { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.tsb-bit {
  padding: 6px 10px; font-size: 13px; font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);
  color: var(--vp-c-text-2); cursor: pointer;
}
.tsb-bit.on { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); }
.tsb-out { font-size: 12.5px; font-family: var(--vp-font-family-mono); color: var(--vp-c-text-3); }
.tsb-out.o-0, .tsb-out.o-1 { color: var(--vp-c-text-1); font-weight: 700; }
.tsb-stub { width: 2px; height: 18px; background: var(--vp-c-brand-1); }
.tsb-stub.z { background: repeating-linear-gradient(to bottom, var(--vp-c-divider) 0 4px, transparent 4px 8px); }
.tsb-buswrap { display: flex; flex-direction: column; gap: 6px; }
.tsb-bus {
  height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-family: var(--vp-font-family-mono); font-size: 14px; font-weight: 700;
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); border: 1px solid var(--vp-c-divider);
}
.tsb-bus.b-0 { background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.tsb-bus.b-1 { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); }
.tsb-bus.b-Z { background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); }
.tsb-bus.b-conflict { background: var(--vp-c-danger-1, #d13c3c); color: #fff; border-color: var(--vp-c-danger-1, #d13c3c); }
.tsb-reader { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.tsb-readertag { color: var(--vp-c-text-3); }
.tsb-readval {
  padding: 2px 12px; border-radius: 6px; font-family: var(--vp-font-family-mono); font-weight: 700;
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-2);
}
.tsb-readval.r-1 { background: var(--vp-c-brand-soft, #e8f0fe); color: var(--vp-c-brand-1); }
.tsb-readval.r-conflict { background: var(--vp-c-danger-soft, #fbeaea); color: var(--vp-c-danger-1, #d13c3c); }
.tsb-note { margin: 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.7; }
.tsb-presets { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.tsb-presetlbl { font-size: 12.5px; color: var(--vp-c-text-3); }
.tsb-presets button {
  padding: 4px 10px; font-size: 12.5px; border: 1px solid var(--vp-c-divider);
  border-radius: 999px; background: var(--vp-c-bg); color: var(--vp-c-text-2); cursor: pointer;
}
.tsb-presets button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
</style>
