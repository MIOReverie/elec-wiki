<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

// GPIO 模式 + 外部接法 → 引脚到底是什么电平、CPU 又读到什么
type Mode = 'in-float' | 'in-pu' | 'in-pd' | 'out-pp' | 'out-od' | 'af' | 'analog'
type Ext = 'none' | 'gnd' | 'vcc' | 'pullup' | 'pulldown' | 'led'

const mode = ref<Mode>('out-pp')
const ext = ref<Ext>('led')
const outVal = ref(1)

const isOut = computed(() => mode.value === 'out-pp' || mode.value === 'out-od')

const detail = computed(() => {
  const m = mode.value
  const e = ext.value
  const o = outVal.value
  let level = '?'
  let warn = ''
  let note = ''

  // 外部对引脚的"驱动强度"：直连 VCC/GND 是强驱，经电阻是弱驱，悬空是没驱
  if (m === 'in-float') {
    if (e === 'none' || e === 'led') {
      level = '?'
      note =
        '浮空输入 + 外部什么都没接：引脚像一根天线，电平由感应噪声决定，IDR 读到的值会随机跳变。**输入引脚绝不允许悬空**。'
    } else if (e === 'gnd' || e === 'pulldown') {
      level = '0'
      note = '外部把引脚拉到地，读到稳定的 0。'
    } else if (e === 'vcc' || e === 'pullup') {
      level = '1'
      note = '外部把引脚拉到 VCC，读到稳定的 1。'
    }
  } else if (m === 'in-pu') {
    if (e === 'gnd' || e === 'pulldown') {
      level = '0'
      note = '外部接地（强驱）压过了内部上拉，读到 0——这正是按键按下的工作方式。'
    } else {
      level = '1'
      note =
        '内部上拉电阻把引脚默认拉成 1；外部什么都不接时读到 1，按键松开就是这个状态。所以按键电路可以省掉外部电阻。'
    }
  } else if (m === 'in-pd') {
    if (e === 'vcc' || e === 'pullup') {
      level = '1'
      note = '外部接 VCC 压过内部下拉，读到 1。'
    } else {
      level = '0'
      note = '内部下拉把引脚默认拉成 0，外部悬空时读到 0。常见于"高电平有效"的按键。'
    }
  } else if (m === 'out-pp') {
    level = String(o)
    if ((o === 1 && (e === 'gnd' || e === 'pulldown')) || (o === 0 && e === 'vcc')) {
      level = '✕'
      warn = `推挽输出 ${o} 却把引脚${o === 1 ? '直接接地' : '直接接 VCC'}——上下两个 MOS 管同时导通，等于电源短路，电流会烧引脚。`
    } else if (e === 'led') {
      note = `推挽输出 ${o}：${o === 1 ? '引脚输出高，LED 导通点亮' : '引脚输出低，LED 两端无压差而熄灭'}。推挽能主动拉高也能主动拉低，所以灌电流和拉电流都行。`
    } else {
      note = `推挽输出 ${o}：芯片用一个 P 管拉高、一个 N 管拉低，始终主动驱动，不需要外部电阻。`
    }
  } else if (m === 'out-od') {
    if (o === 0) {
      level = '0'
      note = '开漏写 0：内部 N 管导通，把引脚**主动拉低**到地。'
      if (e === 'vcc') {
        level = '✕'
        warn = '开漏拉低却把引脚直接接 VCC——同样短路。开漏输出高电平必须靠上拉电阻，不能直接接电源。'
      }
    } else {
      // 写 1 = 释放引脚（高阻），电平完全由外部决定
      if (e === 'pullup' || e === 'vcc') {
        level = '1'
        note =
          '开漏写 1 是**释放**引脚（N 管关断、呈高阻），高电平由外部上拉电阻"拉"出来，不是芯片驱动的。这就是 I²C 总线"线与"的物理基础：谁都能拉低，没人拉低时才是高。'
      } else if (e === 'pulldown' || e === 'gnd' || e === 'led') {
        level = '0'
        note =
          '开漏写 1 只是释放，外部下拉把引脚拉成 0。**开漏本身永远不会主动输出高电平**，没有上拉就得不到 1。'
      } else {
        level = '?'
        note = '开漏写 1 后引脚被释放且外部没接上拉——处于悬空高阻，电平不确定。开漏必须配上拉电阻才有意义。'
      }
    }
  } else if (m === 'af') {
    level = '—'
    note =
      '复用功能模式：引脚不再由 GPIO 寄存器控制，而是交给片上外设（如 USART 的 TX、TIM 的 PWM 输出、SPI 的 SCK）。忘了配复用，外设就不会有信号出来。'
  } else {
    level = '≈'
    note =
      '模拟模式：数字输入缓冲被断开（省电也避免干扰），引脚直接接到 ADC 或比较器。此时读 IDR 永远是 0——想采模拟量必须配成模拟模式。'
  }

  return { level, warn, note }
})

const level = computed(() => detail.value.level)
const lvlClass = computed(() => {
  const map: Record<string, string> = { '1': '1', '0': '0', '\u2715': 'x', '?': 'q' }
  return 'gm-l-' + (map[level.value] ?? 'q')
})
const warn = computed(() => detail.value.warn)
const note = computed(() => detail.value.note)
const idr = computed(() => {
  const l = level.value
  if (l === '0' || l === '1') return l
  if (l === '≈') return '0（模拟模式读不到数字量）'
  if (l === '—') return '由外设决定'
  return '不定（可能是 0 也可能是 1）'
})
</script>

<template>
  <div class="gm">
    <Seg
      v-model="mode"
      :options="[
        { value: 'in-float', label: '输入·浮空' },
        { value: 'in-pu', label: '输入·上拉' },
        { value: 'in-pd', label: '输入·下拉' },
        { value: 'out-pp', label: '输出·推挽' },
        { value: 'out-od', label: '输出·开漏' },
        { value: 'af', label: '复用功能' },
        { value: 'analog', label: '模拟' }
      ]"
      label="GPIO 模式"
    />
    <Seg
      v-model="ext"
      :options="[
        { value: 'none', label: '悬空不接' },
        { value: 'gnd', label: '直接接地/按键按下' },
        { value: 'vcc', label: '直接接 VCC' },
        { value: 'pullup', label: '经上拉电阻接 VCC' },
        { value: 'pulldown', label: '经下拉电阻接地' },
        { value: 'led', label: 'LED+电阻到地' }
      ]"
      label="外部接法"
    />

    <div v-if="isOut" class="gm-out">
      <span class="gm-ok">输出寄存器写的值</span>
      <button class="gm-ob" :class="{ 'gm-o1': outVal === 1 }" @click="outVal = 1">写 1</button>
      <button class="gm-ob" :class="{ 'gm-o0': outVal === 0 }" @click="outVal = 0">写 0</button>
    </div>

    <div class="gm-res">
      <div class="gm-lv" :class="lvlClass">{{ level }}</div>
      <div class="gm-meta">
        <span class="gm-k">引脚实际电平</span>
        <b class="gm-v">{{ level }}</b>
        <span class="gm-k">IDR 读到</span>
        <b class="gm-v2">{{ idr }}</b>
      </div>
    </div>

    <div v-if="warn" class="gm-warn">
      <b>⚠ 危险</b>
      <span>{{ warn }}</span>
    </div>
    <p class="gm-note">{{ note }}</p>

    <p class="gm-tip">
      试这几组，把最容易踩的坑亲手撞一遍：输入浮空 + 悬空（读到随机值）→ 输入上拉 + 接地（读到 0，这就是按键）→
      输出开漏 + 写 1 + 上拉（得到 1）→ 输出开漏 + 写 1 + 悬空（得不到高电平）。
    </p>
  </div>
</template>

<style scoped>
.gm {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gm-out {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.gm-ok {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.gm-ob {
  padding: 4px 14px;
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.gm-ob:hover {
  border-color: var(--vp-c-brand-1);
}
.gm-o1 {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.gm-o0 {
  border-color: var(--vp-c-text-2);
  background: var(--vp-c-text-2);
  color: var(--vp-c-bg);
  font-weight: 700;
}
.gm-res {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.gm-lv {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  border-radius: 10px;
  border: 2px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
}
.gm-l-1 {
  border-color: #22c55e;
  color: #22c55e;
}
.gm-l-0 {
  border-color: var(--vp-c-text-2);
  color: var(--vp-c-text-2);
}
.gm-l-x {
  border-color: var(--vp-c-danger-1);
  color: var(--vp-c-danger-1);
}
.gm-l-q {
  border-color: #f59e0b;
  color: #f59e0b;
}
.gm-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gm-k {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.gm-v {
  font-size: 16px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.gm-v2 {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.gm-warn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft, rgba(220, 38, 38, 0.1));
  border-left: 3px solid var(--vp-c-danger-1);
  border-radius: 6px;
}
.gm-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.gm-tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
  padding: 7px 10px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
}
</style>
