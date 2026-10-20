<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: number
    min: number
    max: number
    step?: number
    unit?: string
    fixed?: number
    log?: boolean
  }>(),
  { step: 1, fixed: 2, log: false }
)
const emit = defineEmits<{ 'update:modelValue': [number] }>()

function onInput(e: Event) {
  const raw = parseFloat((e.target as HTMLInputElement).value)
  // NaN 兜底：解析失败时不动模型值（保持上次有效值），避免 NaN 传染到计算与绘制
  if (Number.isNaN(raw)) return
  const v = props.log ? Math.pow(10, raw) : raw
  if (!Number.isFinite(v)) return
  emit('update:modelValue', v)
}
const sliderVal = computed(() => (props.log ? Math.log10(props.modelValue) : props.modelValue))
const sliderMin = computed(() => (props.log ? Math.log10(props.min) : props.min))
const sliderMax = computed(() => (props.log ? Math.log10(props.max) : props.max))
const sliderStep = computed(() => (props.log ? (sliderMax.value - sliderMin.value) / 200 : props.step))

const shown = computed(() => {
  const v = props.modelValue
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(1)
  return String(parseFloat(v.toFixed(props.fixed)))
})
const valueText = computed(() => (props.unit ? `${shown.value} ${props.unit}` : shown.value))
</script>

<template>
  <label class="ctrl">
    <span class="c-label">{{ label }}</span>
    <input
      class="c-range"
      type="range"
      :aria-label="label"
      :aria-valuetext="valueText"
      :min="sliderMin"
      :max="sliderMax"
      :step="sliderStep"
      :value="sliderVal"
      @input="onInput"
    />
    <span class="c-val">{{ shown }}<em v-if="unit">{{ unit }}</em></span>
  </label>
</template>

<style scoped>
.ctrl {
  display: grid;
  grid-template-columns: 74px 1fr 78px;
  align-items: center;
  gap: 10px;
  padding: 3px 0;
  font-size: 12.5px;
}
.c-label { color: var(--vp-c-text-2); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.c-range { width: 100%; accent-color: var(--vp-c-brand-1); cursor: pointer; }
.c-val {
  text-align: right;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}
.c-val em { font-style: normal; color: var(--vp-c-text-3); margin-left: 2px; }
@media (max-width: 520px) {
  .ctrl { grid-template-columns: 62px 1fr 66px; }
}
</style>
