<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'

// —— 电路参数（固定，来自 05 章例题）——
const BETA = 100
const ICQ = 1e-3        // 每管静态电流（尾电流 2mA 均分）
const RC = 10e3
const RO = 100e3        // 恒流源输出电阻
const VRAIL = 10        // 电源轨 ±10V
const rbe = computed(() => 300 + (1 + BETA) * 26e-3 / ICQ)

// —— 用户可调 ——
const ui1 = ref(11)     // mV
const ui2 = ref(9)      // mV
const outMode = ref<'diff' | 'single'>('diff')
const tailMode = ref<'re' | 'cccs'>('re')
const reK = ref(10)     // kΩ

const uid = computed(() => (ui1.value - ui2.value) / 1000)   // V
const uic = computed(() => (ui1.value + ui2.value) / 2000)   // V

const Ad = computed(() => (outMode.value === 'diff' ? -BETA * RC / rbe.value : -BETA * RC / (2 * rbe.value)))
const ReEff = computed(() => (tailMode.value === 're' ? reK.value * 1e3 : RO))
const Ac = computed(() => (outMode.value === 'diff' ? 0 : -RC / (2 * ReEff.value)))
const cmrr = computed(() => (Ac.value === 0 ? Infinity : Math.abs(Ad.value / Ac.value)))

const uoDiff = computed(() => Ad.value * uid.value)
const uoCm = computed(() => Ac.value * uic.value)
const uo = computed(() => uoDiff.value + uoCm.value)
const saturated = computed(() => Math.abs(uo.value) > VRAIL)

// 分解条比例：uid ±40mV → ±100%；uic ±20mV → ±100%
const uidPct = computed(() => Math.max(-100, Math.min(100, (uid.value / 0.04) * 100)))
const uicPct = computed(() => Math.max(-100, Math.min(100, (uic.value / 0.02) * 100)))
const uoPct = computed(() => Math.max(-100, Math.min(100, (uo.value / VRAIL) * 100)))

const cmrrText = computed(() => (cmrr.value === Infinity ? '∞（理想对称）' : `${cmrr.value.toFixed(0)}（${(20 * Math.log10(cmrr.value)).toFixed(1)} dB）`))

const scen = computed(() => {
  if (Math.abs(uid.value) > 0.0015 && Math.abs(uic.value) < 0.001) return { label: '纯差模', desc: '两输入等值反向——只有有用信号，共模分量为零' }
  if (Math.abs(uid.value) < 0.001 && Math.abs(uic.value) > 0.001) return { label: '纯共模', desc: '两输入等值同向——比如两根线拾取的同相干扰，输出应为零' }
  if (Math.abs(uic.value) > 4 * Math.abs(uid.value) && Math.abs(uid.value) > 0) return { label: '信号 + 共模干扰', desc: '小差模叠大共模——双端输出只认差模，共模被抑制掉' }
  return { label: '混合输入', desc: '差模与共模并存，输出 = 两者各自放大的和' }
})

function setScene(a: number, b: number) {
  ui1.value = a
  ui2.value = b
}
</script>

<template>
  <div class="df">
    <div class="df-top">
      <!-- 电路示意 -->
      <svg class="df-sch" viewBox="0 0 210 168">
        <text x="105" y="12" text-anchor="middle" font-size="10" fill="var(--vp-c-text-3)">长尾式差分对（示意）</text>
        <!-- 电源 -->
        <line x1="185" y1="20" x2="185" y2="150" stroke="var(--vp-c-divider)" stroke-width="1.5" />
        <text x="185" y="16" text-anchor="middle" font-size="9" fill="var(--vp-c-text-3)">+VCC</text>
        <!-- Rc 两只 -->
        <line x1="60" y1="20" x2="60" y2="42" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <rect x="52" y="42" width="16" height="26" fill="var(--vp-c-bg-alt)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <text x="60" y="59" text-anchor="middle" font-size="9" fill="var(--vp-c-text-2)">Rc</text>
        <line x1="150" y1="20" x2="150" y2="42" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <rect x="142" y="42" width="16" height="26" fill="var(--vp-c-bg-alt)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <text x="150" y="59" text-anchor="middle" font-size="9" fill="var(--vp-c-text-2)">Rc</text>
        <line x1="60" y1="68" x2="60" y2="80" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <line x1="150" y1="68" x2="150" y2="80" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <!-- 三极管（圆 + 斜线） -->
        <circle cx="60" cy="96" r="16" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <line x1="52" y1="104" x2="68" y2="88" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <line x1="60" y1="80" x2="60" y2="80" stroke="none" />
        <text x="60" y="99" text-anchor="middle" font-size="9" fill="var(--vp-c-text-2)">T1</text>
        <circle cx="150" cy="96" r="16" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <line x1="142" y1="104" x2="158" y2="88" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <text x="150" y="99" text-anchor="middle" font-size="9" fill="var(--vp-c-text-2)">T2</text>
        <!-- 输入 -->
        <line x1="30" y1="88" x2="46" y2="88" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
        <text x="28" y="86" text-anchor="end" font-size="10" fill="var(--vp-c-brand-1)">ui1</text>
        <line x1="120" y1="88" x2="136" y2="88" stroke="var(--vp-c-brand-1)" stroke-width="1.5" />
        <text x="118" y="86" text-anchor="end" font-size="10" fill="var(--vp-c-brand-1)">ui2</text>
        <!-- 发射极汇合 + 尾 -->
        <line x1="60" y1="112" x2="60" y2="124" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <line x1="150" y1="112" x2="150" y2="124" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <line x1="60" y1="124" x2="150" y2="124" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <line x1="105" y1="124" x2="105" y2="136" stroke="var(--vp-c-text-2)" stroke-width="2" />
        <rect x="96" y="136" width="18" height="20" fill="var(--vp-c-bg-alt)" stroke="var(--vp-c-text-2)" stroke-width="1.5" />
        <text x="105" y="150" text-anchor="middle" font-size="8.5" fill="var(--vp-c-text-2)">{{ tailMode === 're' ? 'Re' : 'Io' }}</text>
        <!-- 输出 -->
        <line x1="150" y1="80" x2="196" y2="80" stroke="var(--vp-c-tip-1)" stroke-width="1.5" />
        <text x="198" y="78" font-size="10" fill="var(--vp-c-tip-1)">uo</text>
        <text x="198" y="90" font-size="8.5" fill="var(--vp-c-text-3)">{{ outMode === 'diff' ? '双端 C1−C2' : '单端 C2' }}</text>
      </svg>

      <!-- 控制 + 读数 -->
      <div class="df-ctrl">
        <div class="df-row">
          <label class="df-sl">
            <span>ui1</span>
            <input type="range" min="-20" max="20" step="1" v-model.number="ui1" />
            <b>{{ ui1 > 0 ? '+' : '' }}{{ ui1 }} mV</b>
          </label>
          <label class="df-sl">
            <span>ui2</span>
            <input type="range" min="-20" max="20" step="1" v-model.number="ui2" />
            <b>{{ ui2 > 0 ? '+' : '' }}{{ ui2 }} mV</b>
          </label>
        </div>
        <div class="df-btns">
          <button @click="setScene(10, -10)">纯差模</button>
          <button @click="setScene(10, 10)">纯共模</button>
          <button @click="setScene(15, -5)">混合</button>
          <button @click="setScene(11, 9)">信号+干扰</button>
        </div>
        <div class="df-segs">
          <Seg v-model="outMode" label="输出" :options="[{ value: 'diff', label: '双端' }, { value: 'single', label: '单端' }]" />
          <Seg v-model="tailMode" label="尾电流源" :options="[{ value: 're', label: '长尾电阻' }, { value: 'cccs', label: '恒流源' }]" />
        </div>
        <label v-if="tailMode === 're'" class="df-sl">
          <span>Re</span>
          <input type="range" min="2" max="50" step="2" v-model.number="reK" />
          <b>{{ reK }} kΩ</b>
        </label>
      </div>
    </div>

    <!-- 分解 + 读数 -->
    <div class="df-mid">
      <div class="df-dec">
        <div class="df-kv"><span>差模分量 uid = ui1−ui2</span><b>{{ (uid * 1000).toFixed(0) }} mV</b></div>
        <div class="df-bar"><div class="df-fill brand" :style="{ width: Math.abs(uidPct) / 2 + '%', left: uidPct >= 0 ? '50%' : (50 + uidPct / 2) + '%' }" /></div>
        <div class="df-kv"><span>共模分量 uic = (ui1+ui2)/2</span><b>{{ (uic * 1000).toFixed(1) }} mV</b></div>
        <div class="df-bar"><div class="df-fill tip" :style="{ width: Math.abs(uicPct) / 2 + '%', left: uicPct >= 0 ? '50%' : (50 + uicPct / 2) + '%' }" /></div>
      </div>
      <div class="df-res">
        <div class="df-kv"><span>差模增益 Ad</span><b>{{ Ad.toFixed(1) }}</b></div>
        <div class="df-kv"><span>共模增益 Ac</span><b>{{ Ac === 0 ? '0（理想）' : Ac.toFixed(3) }}</b></div>
        <div class="df-kv"><span>共模抑制比 CMRR</span><b>{{ cmrrText }}</b></div>
        <div class="df-kv big" :class="{ over: saturated }"><span>输出电压 uo = Ad·uid + Ac·uic</span><b>{{ uo.toFixed(3) }} V{{ saturated ? '（超线性区）' : '' }}</b></div>
        <div class="df-bar tall"><div class="df-fill out" :style="{ width: Math.abs(uoPct) / 2 + '%', left: uoPct >= 0 ? '50%' : (50 + uoPct / 2) + '%' }" /></div>
      </div>
    </div>

    <p class="df-note">
      <b>当前输入：{{ scen.label }}</b>——{{ scen.desc }}。
      任意一对输入都可以拆成「差模 + 共模」：差分放大只放大前者，后者被尾电流源的负反馈死死摁住
      （换成恒流源，等效 Re 从 {{ tailMode === 're' ? reK + ' kΩ' : '100 kΩ' }} 变成无穷大，CMRR 再抬一个量级）。
      双端输出下共模增益理想为 0——这就是仪表放大器敢在工业现场用的本钱。
    </p>
  </div>
</template>

<style scoped>
.df { margin: 22px 0; }
.df-top { display: grid; grid-template-columns: 210px 1fr; gap: 14px; align-items: start; }
@media (max-width: 700px) { .df-top { grid-template-columns: 1fr; } }
.df-sch { width: 100%; height: auto; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 10px; }
.df-ctrl { display: grid; gap: 9px; }
.df-row { display: grid; gap: 7px; }
.df-sl { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--vp-c-text-2); }
.df-sl span { width: 28px; flex: none; font-family: var(--vp-font-family-mono); }
.df-sl input[type='range'] { flex: 1; accent-color: var(--vp-c-brand-1); }
.df-sl b { font-family: var(--vp-font-family-mono); color: var(--vp-c-text-1); min-width: 66px; text-align: right; }
.df-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.df-btns button {
  padding: 4px 11px; font-size: 12px; border-radius: 7px; cursor: pointer;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); color: var(--vp-c-text-2);
  font-family: inherit;
}
.df-btns button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.df-segs { display: grid; gap: 6px; }
.df-mid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 12px; }
@media (max-width: 700px) { .df-mid { grid-template-columns: 1fr; } }
.df-dec, .df-res { display: grid; gap: 7px; align-content: start; }
.df-kv { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 12px; color: var(--vp-c-text-3); }
.df-kv b { font-size: 13.5px; color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }
.df-kv.big b { font-size: 16px; color: var(--vp-c-brand-1); }
.df-kv.big.over b { color: var(--vp-c-danger-1); }
.df-bar { position: relative; height: 9px; border-radius: 5px; background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider); overflow: hidden; }
.df-bar.tall { height: 14px; }
.df-fill { position: absolute; top: 0; bottom: 0; border-radius: 4px; transition: width 0.15s, left 0.15s; }
.df-fill.brand { background: var(--vp-c-brand-1); }
.df-fill.tip { background: var(--vp-c-tip-1); }
.df-fill.out { background: var(--vp-c-brand-1); opacity: 0.75; }
.df-note { margin: 12px 2px 0; font-size: 12.5px; color: var(--vp-c-text-3); line-height: 1.75; }
.df-note b { color: var(--vp-c-text-2); }
</style>
