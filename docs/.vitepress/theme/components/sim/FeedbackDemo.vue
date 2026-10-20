<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

const tab = ref<'closed' | 'stab'>('closed')

// ============ 闭环增益估算 ============
const topo = ref<'vs' | 'vp' | 'is' | 'ip'>('vs')
const A = ref(100000) // 开环增益（倍）
const F = ref(0.01) // 反馈系数

const AF = computed(() => A.value * F.value)
const depth = computed(() => 1 + AF.value)
const Af = computed(() => A.value / depth.value)
const AfIdeal = computed(() => 1 / F.value)
const errPct = computed(() => (Math.abs(Af.value - AfIdeal.value) / AfIdeal.value) * 100)
const sens = computed(() => (100 / depth.value).toFixed(3)) // A 变 100% 时 Af 变百分之几

const topoName: Record<string, string> = {
  vs: '电压串联负反馈',
  vp: '电压并联负反馈',
  is: '电流串联负反馈',
  ip: '电流并联负反馈'
}
const topoNote: Record<string, string> = {
  vs: '稳定输出电压、提高输入电阻、降低输出电阻 → 电压放大首选（同相放大器）',
  vp: '输出端电压采样、输入端并联比较 → 反相放大器、电流-电压变换器',
  is: '稳定输出电流、输入输出电阻都提高 → 恒流源、跨导放大器',
  ip: '稳定输出电流、输入输出电阻都降低 → 电流放大'
}
const riEffect: Record<string, string> = {
  vs: '×（1+AF）大幅提高',
  vp: '÷（1+AF）大幅降低',
  is: '×（1+AF）提高',
  ip: '÷（1+AF）降低'
}
const roEffect: Record<string, string> = {
  vs: '÷（1+AF）大幅降低',
  vp: '÷（1+AF）大幅降低',
  is: '×（1+AF）提高',
  ip: '×（1+AF）提高'
}

// ============ 自激与相位裕度 ============
const fp = ref(100000) // 每级极点（三级相同）
const Fs = ref(0.01)

// 三级开环响应
function aolMag(f: number) {
  const g = (x: number) => 1 / Math.sqrt(1 + x * x)
  return A.value * g(f / fp.value) ** 3
}
function aolPhase(f: number) {
  return -(Math.atan(f / fp.value) * 3 * 180) / Math.PI
}

// 数值求 |AF| = 1 的穿越频率
const cross = computed(() => {
  let lo = 1, hi = 1e12
  for (let k = 0; k < 200; k++) {
    const m = (lo * hi) ** 0.5
    if (aolMag(m) * Fs.value > 1) lo = m
    else hi = m
  }
  return (lo * hi) ** 0.5
})
const PM = computed(() => 180 + aolPhase(cross.value))
const stable = computed(() => PM.value > 0)

// 波特图数据
const magCurve = computed(() => {
  const pts: string[] = []
  for (let i = 0; i <= 140; i++) {
    const f = Math.pow(10, 1 + (i / 140) * 8) // 10Hz..100MHz
    const mag = aolMag(f) * Fs.value
    const x = 40 + ((Math.log10(f) - 1) / 8) * 400
    const y = 150 - ((20 * Math.log10(Math.max(1e-6, mag)) + 40) / 160) * 120
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
})
</script>

<template>
  <div class="fb">
    <Seg v-model="tab" :options="[
      { value: 'closed', label: '闭环增益估算' },
      { value: 'stab', label: '自激与相位裕度' }
    ]" />

    <template v-if="tab === 'closed'">
      <div class="fb-ctl">
        <span class="fb-lab">反馈类型</span>
        <Seg v-model="topo" :options="[
          { value: 'vs', label: '电压·串联' },
          { value: 'vp', label: '电压·并联' },
          { value: 'is', label: '电流·串联' },
          { value: 'ip', label: '电流·并联' }
        ]" />
      </div>
      <div class="fb-ctl">
        <span class="fb-lab">开环增益 A</span>
        <input
          v-model.number="A" type="range" min="100" max="1000000" step="100" class="fb-slider"
          aria-label="开环增益 A" :aria-valuetext="(20 * Math.log10(A)).toFixed(0) + ' dB（A = ' + A + '）'" />
        <span class="fb-val">{{ (20 * Math.log10(A)).toFixed(0) }} dB</span>
        <span class="fb-lab">反馈系数 F</span>
        <input
          v-model.number="F" type="range" min="0.001" max="0.5" step="0.001" class="fb-slider"
          aria-label="反馈系数 F" :aria-valuetext="'F = ' + F" />
        <span class="fb-val">{{ F }}</span>
      </div>

      <div class="fb-block">
        <div class="fb-diag">输入 ─► [ 基本放大 A ] ─► 输出<br>　　　　　　▲　　　　　│<br>　　　　　　└─ [ 反馈 F ] ─┘</div>
      </div>

      <div class="fb-grid">
        <div class="fb-cell">反馈深度 1+AF<br><b>{{ depth > 1e6 ? depth.toExponential(1) : depth.toFixed(0) }}</b></div>
        <div class="fb-cell">闭环增益 A_f=A/(1+AF)<br><b>{{ Af > 1e5 ? Af.toExponential(2) : Af.toFixed(2) }}</b></div>
        <div class="fb-cell">理想值 1/F<br><b>{{ AfIdeal.toFixed(2) }}</b></div>
        <div class="fb-cell">估算误差<br><b>{{ errPct.toFixed(3) }} %</b></div>
        <div class="fb-cell">A 变化 100% → A_f 变<br><b>{{ sens }} %</b></div>
        <div class="fb-cell">输入电阻 r_i<br><b>{{ riEffect[topo] }}</b></div>
        <div class="fb-cell">输出电阻 r_o<br><b>{{ roEffect[topo] }}</b></div>
      </div>
      <div class="fb-read">
        当前为 <b>{{ topoName[topo] }}</b>：{{ topoNote[topo] }}。
        <template v-if="depth > 100">深度负反馈（1+AF &gt; 100）成立，直接用 1/F 估算，误差不足千分之一。</template>
        <template v-else>反馈深度不足，1/F 估算误差偏大，需用 A/(1+AF) 精确式。</template>
      </div>
    </template>

    <template v-else>
      <div class="fb-ctl">
        <span class="fb-lab">每级极点 f_p</span>
        <input
          v-model.number="fp" type="range" min="10000" max="500000" step="10000" class="fb-slider"
          aria-label="每级极点频率 f_p" :aria-valuetext="(fp / 1000).toFixed(0) + ' 千赫'" />
        <span class="fb-val">{{ (fp / 1000).toFixed(0) }} kHz</span>
        <span class="fb-lab">反馈系数 F</span>
        <input
          v-model.number="Fs" type="range" min="0.0001" max="0.1" step="0.0001" class="fb-slider"
          aria-label="反馈系数 F" :aria-valuetext="'F = ' + Fs" />
        <span class="fb-val">{{ Fs }}</span>
      </div>

      <svg viewBox="0 0 460 200" class="fb-svg">
        <line x1="40" y1="150" x2="440" y2="150" stroke="var(--vp-c-divider)" />
        <line x1="40" y1="150" x2="40" y2="20" stroke="var(--vp-c-divider)" />
        <text x="10" y="32" font-size="11" fill="var(--vp-c-text-3)">|AF|</text>
        <text x="420" y="168" font-size="11" fill="var(--vp-c-text-3)">lg f</text>
        <polyline :points="magCurve" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1.8" />
        <!-- 0dB 线 -->
        <line x1="40" :y1="150 - ((0 + 40) / 160) * 120" x2="440" :y2="150 - ((0 + 40) / 160) * 120" stroke="var(--vp-c-text-3)" stroke-dasharray="4 3" />
        <text x="44" :y="150 - ((0 + 40) / 160) * 120 - 4" font-size="10" fill="var(--vp-c-text-3)">0 dB（|AF|=1）</text>
        <text x="46" y="24" font-size="11" fill="var(--vp-c-text-2)">三级放大：每级贡献最多 −90°，总相移可达 −270°</text>
      </svg>

      <div class="fb-read" :class="{ warn: !stable }">
        |AF|=1 穿越频率 ≈ <b>{{ (cross / 1e6).toPrecision(3) }} MHz</b>，该处环路相移 ≈ <b>{{ aolPhase(cross).toFixed(0) }}°</b>
        <template v-if="stable">
          → 相位裕度 PM = <b>{{ PM.toFixed(0) }}°</b> &gt; 0，<b>闭环稳定</b>（工程上希望 PM ≥ 45°）
        </template>
        <template v-else>
          → 相位裕度 PM = <b>{{ PM.toFixed(0) }}°</b> &lt; 0，<b>电路将自激振荡</b>：减小 F 或加主极点补偿（把某一级极点压低）
        </template>
      </div>
      <div class="fb-hint">
        规律：F 越大（反馈越深）越容易自激——这是「增益换带宽」的代价。把 F 拖小，看 PM 怎么从负变正；这就是运放外部补偿电容在做的事。
      </div>
    </template>
  </div>
</template>

<style scoped>
.fb { display: flex; flex-direction: column; gap: 10px; }
.fb-ctl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.fb-lab { font-size: 12.5px; font-weight: 600; color: var(--vp-c-text-2); }
.fb-slider { width: 110px; }
.fb-val { font-size: 12.5px; font-family: var(--vp-font-family-mono, monospace); min-width: 56px; }
.fb-block { display: flex; justify-content: center; }
.fb-diag {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 12px;
  line-height: 1.5;
  padding: 10px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  white-space: pre;
}
.fb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
.fb-cell {
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.fb-cell b { font-size: 13px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono, monospace); }
.fb-read {
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-1);
}
.fb-read.warn { background: color-mix(in srgb, #d5303e 14%, transparent); }
.fb-hint { font-size: 12px; color: var(--vp-c-text-2); }
.fb-svg { width: 100%; height: auto; background: var(--vp-c-bg-alt); border-radius: 8px; }
</style>
