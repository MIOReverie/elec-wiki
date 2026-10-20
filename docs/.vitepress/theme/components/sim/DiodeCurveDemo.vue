<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

const tab = ref<'diode' | 'zener' | 'bjt'>('diode')

// ============ 图解①：二极管伏安特性 + 负载线 ============
const Vsrc = ref(5)
const R = ref(1000)

// 二极管模型 I = Is(e^(V/nVt)-1)，Vt≈25.85mV(300K)，n=1.5
const diodeCurve = computed(() => {
  const Is = 1e-9, nVt = 0.0388
  const pts: string[] = []
  const VMAX = 5
  const IMAX = 8 // mA 显示上限
  for (let i = 0; i <= 200; i++) {
    const v = -0.5 + (i / 200) * (VMAX + 0.5)
    let imA: number
    if (v > -0.2) imA = Is * (Math.exp(v / nVt) - 1) * 1000
    else imA = -Is * 1000 // 反向饱和（显示为 0 附近）
    imA = Math.max(-0.05, Math.min(IMAX, imA))
    pts.push(`${x(v, VMAX)},${y(imA, IMAX)}`)
  }
  return pts.join(' ')
})

const loadLine = computed(() => {
  const VMAX = 5, IMAX = 8
  // I = (Vsrc - V)/R，V 从 0 到 min(Vsrc, ...)
  const imax = (Vsrc.value / R.value) * 1000 // mA
  const vEnd = Math.min(VMAX, Vsrc.value)
  const iEnd = ((Vsrc.value - vEnd) / R.value) * 1000
  return `${x(0, VMAX)},${y(0, IMAX)} ${x(vEnd, VMAX)},${y(iEnd, IMAX)}`
})

// Q 点：数值求解负载线与指数曲线交点
const Q = computed(() => {
  const Is = 1e-9, nVt = 0.0388
  const VMAX = 5, IMAX = 8
  let lo = 0, hi = Vsrc.value
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2
    const f = Is * (Math.exp(mid / nVt) - 1) * 1000 - ((Vsrc.value - mid) / R.value) * 1000
    if (f < 0) lo = mid
    else hi = mid
  }
  const v = (lo + hi) / 2
  const imA = ((Vsrc.value - v) / R.value) * 1000
  return { v, imA }
})

const idealCheck = computed(() => Math.abs(Q.value.v - 0.7) < 0.03)

function x(v: number, VMAX: number) { return 40 + (v / VMAX) * 400 }
function y(imA: number, IMAX: number) { return 160 - (imA / IMAX) * 140 }

// ============ 图解②：稳压管 ============
const Vs = ref(12)
const Vz = ref(6)
const Rz = ref(360)
const RLmin = ref(1000)
const zenerStats = computed(() => {
  const Vsmin = Vs.value * 0.9, Vsmax = Vs.value * 1.1
  const IRmin = (Vsmin - Vz.value) / Rz.value * 1000
  const IRmax = (Vsmax - Vz.value) / Rz.value * 1000
  const ILmax = Vz.value / RLmin.value * 1000
  const Izmin = IRmin - ILmax
  const Izmax = IRmax
  const regulated = Izmin > 0
  return { IRmin, IRmax, ILmax, Izmin, Izmax, regulated }
})

// ============ 图解③：三极管输出特性 ============
const beta = ref(60)
const VCC = ref(12)
const Rc = ref(2000)
const IBQ = ref(30) // μA

const ibCurves = [0, 10, 20, 30, 40, 50]
const VMAXb = 12, IMAXb = 4 // mA

function bjtCurve(ib: number): string {
  // 饱和压降 0.3V；放大区 IC=β·IB（带 Early 效应斜率 VA=100V）
  const VA = 100
  const pts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const vce = (i / 100) * VMAXb
    let ic = 0
    if (vce > 0.3) ic = beta.value * ib * 1e-3 * (1 + vce / VA)
    ic = Math.min(ic, IMAXb)
    pts.push(`${x(vce, VMAXb)},${y(ic, IMAXb)}`)
  }
  return pts.join(' ')
}

const bjtLoadLine = computed(() => {
  const icEnd = VCC.value / Rc.value * 1000
  return `${x(0, VMAXb)},${y(0, IMAXb)} ${x(VCC.value, VMAXb)},${y(Math.min(icEnd, IMAXb), IMAXb)}`
})

const bjtQ = computed(() => {
  const ic = Math.min(beta.value * IBQ.value * 1e-3, VCC.value / Rc.value * 1000)
  const vce = Math.max(0.3, VCC.value - ic * 1e-3 * Rc.value)
  return { ic, vce }
})

const bjtRegion = computed(() => {
  if (IBQ.value <= 0) return '截止'
  if (bjtQ.value.ic >= VCC.value / Rc.value * 1000 - 0.01) return '饱和'
  return '放大'
})
</script>

<template>
  <div class="cur">
    <Seg v-model="tab" :options="[
      { value: 'diode', label: '二极管 + 负载线' },
      { value: 'zener', label: '稳压管电路' },
      { value: 'bjt', label: '三极管输出特性' }
    ]" />

    <!-- ===== 二极管 ===== -->
    <template v-if="tab === 'diode'">
      <div class="cur-ctl">
        <span class="cur-lab">电源 V</span>
        <input
          v-model.number="Vsrc" type="range" min="1" max="10" step="0.5" class="cur-slider"
          aria-label="电源电压 V" :aria-valuetext="Vsrc + ' 伏特'" />
        <span class="cur-val">{{ Vsrc }} V</span>
        <span class="cur-lab">电阻 R</span>
        <input
          v-model.number="R" type="range" min="100" max="3000" step="100" class="cur-slider"
          aria-label="电阻 R" :aria-valuetext="R + ' 欧姆'" />
        <span class="cur-val">{{ R }} Ω</span>
      </div>
      <svg viewBox="0 0 460 200" class="cur-svg">
        <!-- 坐标轴 -->
        <line x1="40" y1="160" x2="440" y2="160" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="160" x2="40" y2="20" stroke="var(--vp-c-divider)" />
        <text x="430" y="176" font-size="11" fill="var(--vp-c-text-3)">V_D</text>
        <text x="12" y="30" font-size="11" fill="var(--vp-c-text-3)">I_D</text>
        <text x="44" y="152" font-size="10" fill="var(--vp-c-text-3)">0</text>
        <!-- 死区标注 -->
        <line x1="40" y1="160" x2="66" y2="160" stroke="var(--vp-c-text-3)" stroke-dasharray="3 2" />
        <text x="70" y="140" font-size="10" fill="var(--vp-c-text-3)">死区≈0.5V</text>
        <!-- 二极管曲线 -->
        <polyline :points="diodeCurve" fill="none" stroke="var(--vp-c-text-1)" stroke-width="1.8" />
        <!-- 负载线 -->
        <polyline :points="loadLine" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="6 3" />
        <!-- Q 点 -->
        <circle :cx="x(Q.v, 5)" :cy="y(Q.imA, 8)" r="5" fill="var(--vp-c-brand-1)" />
        <text :x="x(Q.v, 5) + 8" :y="y(Q.imA, 8) - 6" font-size="11" font-weight="600" fill="var(--vp-c-brand-1)">Q</text>
        <text x="44" y="24" font-size="11" fill="var(--vp-c-text-2)">硅管导通后 ≈0.7 V（曲线几乎竖直的那段）</text>
      </svg>
      <div class="cur-read" :class="{ warn: !idealCheck }">
        负载线斜率 = −1/R = {{ (-1000 / R).toFixed(2) }} mA/V，与曲线交于 <b>V_D = {{ Q.v.toFixed(3) }} V、I_D = {{ Q.imA.toFixed(2) }} mA</b>
        <template v-if="idealCheck"> —— 与「0.7 V 恒压模型」的估算几乎一致，工程估算可以直接用</template>
        <template v-else> —— 电流较小，离开 0.7 V 恒压区，此时按指数特性算</template>
      </div>
    </template>

    <!-- ===== 稳压管 ===== -->
    <template v-else-if="tab === 'zener'">
      <div class="cur-ctl">
        <span class="cur-lab">输入电压</span>
        <input
          v-model.number="Vs" type="range" min="8" max="20" step="0.5" class="cur-slider"
          aria-label="稳压管输入电压" :aria-valuetext="Vs + ' 伏特'" />
        <span class="cur-val">{{ Vs }} V</span>
        <span class="cur-lab">稳压值</span>
        <input
          v-model.number="Vz" type="range" min="3" max="9" step="0.5" class="cur-slider"
          aria-label="稳压值 Vz" :aria-valuetext="Vz + ' 伏特'" />
        <span class="cur-val">{{ Vz }} V</span>
        <span class="cur-lab">限流电阻</span>
        <input
          v-model.number="Rz" type="range" min="100" max="1000" step="20" class="cur-slider"
          aria-label="限流电阻 Rz" :aria-valuetext="Rz + ' 欧姆'" />
        <span class="cur-val">{{ Rz }} Ω</span>
      </div>
      <svg viewBox="0 0 460 200" class="cur-svg">
        <line x1="40" y1="160" x2="440" y2="160" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="160" x2="40" y2="20" stroke="var(--vp-c-divider)" />
        <text x="430" y="176" font-size="11" fill="var(--vp-c-text-3)">V（V）</text>
        <text x="12" y="30" font-size="11" fill="var(--vp-c-text-3)">I_z</text>
        <!-- 输出横线（稳压段） -->
        <line :x1="x(0, 12)" :y1="y(0, 40)" :x2="x(Vz, 12)" :y2="y(0, 40)" stroke="var(--vp-c-text-1)" stroke-width="1.8" />
        <!-- 击穿竖线 -->
        <line :x1="x(Vz, 12)" :y1="y(0, 40)" :x2="x(Vz, 12)" :y2="y(38, 40)" stroke="var(--vp-c-text-1)" stroke-width="1.8" />
        <!-- 负载线族 -->
        <line :x1="x(Vz, 12)" :y1="y(0, 40)" :x2="x(Vs * 1.1, 12)" :y2="y((Vs * 1.1 - Vz) / Rz * 1000, 40)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="6 3" />
        <line :x1="x(Vz, 12)" :y1="y(0, 40)" :x2="x(Vs * 0.9, 12)" :y2="y((Vs * 0.9 - Vz) / Rz * 1000, 40)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="2 3" />
        <text :x="x(Vz, 12) - 20" :y="y(0, 40) + 16" font-size="10" fill="var(--vp-c-text-3)">Vz</text>
        <text x="44" y="24" font-size="11" fill="var(--vp-c-text-2)">反向击穿段（几乎竖直）→ 电压稳住，电流全被电阻吸收</text>
      </svg>
      <div class="cur-read" :class="{ warn: !zenerStats.regulated }">
        输入 ±10% 波动 → 电阻电流 {{ zenerStats.IRmin.toFixed(1) }} ~ {{ zenerStats.IRmax.toFixed(1) }} mA；负载最重（RL={{ RLmin }} Ω）时分走 {{ zenerStats.ILmax.toFixed(1) }} mA
        <template v-if="zenerStats.regulated">
          → 稳压管电流 {{ zenerStats.Izmin.toFixed(1) }} ~ {{ zenerStats.Izmax.toFixed(1) }} mA，<b>始终处于击穿区，输出稳稳压在 {{ Vz }} V</b>
        </template>
        <template v-else>
          → 电流不够，稳压管退出击穿区，<b>失去稳压</b>：请减小限流电阻或限制负载电流
        </template>
      </div>
    </template>

    <!-- ===== 三极管 ===== -->
    <template v-else>
      <div class="cur-ctl">
        <span class="cur-lab">β</span>
        <input
          v-model.number="beta" type="range" min="20" max="200" step="10" class="cur-slider"
          aria-label="电流放大系数 β" :aria-valuetext="'β = ' + beta" />
        <span class="cur-val">{{ beta }}</span>
        <span class="cur-lab">V_CC</span>
        <input
          v-model.number="VCC" type="range" min="6" max="20" class="cur-slider"
          aria-label="集电极电源电压 V_CC" :aria-valuetext="VCC + ' 伏特'" />
        <span class="cur-val">{{ VCC }} V</span>
        <span class="cur-lab">R_C</span>
        <input
          v-model.number="Rc" type="range" min="500" max="5000" step="100" class="cur-slider"
          aria-label="集电极电阻 R_C" :aria-valuetext="Rc + ' 欧姆'" />
        <span class="cur-val">{{ Rc }} Ω</span>
        <span class="cur-lab">I_BQ</span>
        <input
          v-model.number="IBQ" type="range" min="0" max="80" step="5" class="cur-slider"
          aria-label="静态基极电流 I_BQ" :aria-valuetext="IBQ + ' 微安'" />
        <span class="cur-val">{{ IBQ }} μA</span>
      </div>
      <svg viewBox="0 0 460 200" class="cur-svg">
        <line x1="40" y1="160" x2="440" y2="160" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="160" x2="40" y2="20" stroke="var(--vp-c-divider)" />
        <text x="430" y="176" font-size="11" fill="var(--vp-c-text-3)">V_CE</text>
        <text x="12" y="30" font-size="11" fill="var(--vp-c-text-3)">I_C</text>
        <!-- 各 IB 曲线 -->
        <polyline v-for="ib in ibCurves" :key="ib" :points="bjtCurve(ib)" fill="none"
          :stroke="ib === IBQ ? 'var(--vp-c-brand-1)' : 'var(--vp-c-text-3)'"
          :stroke-width="ib === IBQ ? 1.8 : 1" stroke-dasharray="3 2" />
        <!-- 负载线 -->
        <polyline :points="bjtLoadLine" fill="none" stroke="#d5303e" stroke-width="1.5" />
        <!-- Q 点 -->
        <circle :cx="x(bjtQ.vce, VMAXb)" :cy="y(bjtQ.ic, IMAXb)" r="5" fill="var(--vp-c-brand-1)" />
        <text :x="x(bjtQ.vce, VMAXb) + 8" :y="y(bjtQ.ic, IMAXb) - 6" font-size="11" font-weight="600" fill="var(--vp-c-brand-1)">Q</text>
        <text x="44" y="24" font-size="11" fill="var(--vp-c-text-2)">红色负载线斜率 = −1/R_C；I_BQ 越大 Q 点沿负载线越往上爬</text>
      </svg>
      <div class="cur-read">
        I_BQ = {{ IBQ }} μA → 工作区：<b>{{ bjtRegion }}</b>；Q 点 V_CE = {{ bjtQ.vce.toFixed(2) }} V、I_C = {{ bjtQ.ic.toFixed(2) }} mA
        <template v-if="bjtRegion === '饱和'">（负载线已到顶：再增大 I_B 也涨不动 I_C，饱和压降约 0.3 V）</template>
        <template v-else-if="bjtRegion === '截止'">（I_B=0，发射结未导通，I_C≈0，C-E 间相当于断开）</template>
        <template v-else>（放大区：I_C = β·I_B，V_CE 随 I_B 增大沿负载线下滑）</template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cur { display: flex; flex-direction: column; gap: 10px; }
.cur-ctl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.cur-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.cur-slider { width: 100px; }
.cur-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 46px; }
.cur-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
.cur-read {
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-1);
}
.cur-read.warn { background: color-mix(in srgb, #d5303e 14%, transparent); }
</style>
