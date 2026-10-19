<script setup lang="ts">
import { computed, ref } from 'vue'
import Seg from '../Seg.vue'
import Ctrl from '../Ctrl.vue'

// SPI 四种相位 vs I²C 的起始/地址/应答时序
const bus = ref<'spi' | 'i2c'>('spi')

/* ---------- SPI ---------- */
const mode = ref(0) // 模式 0~3
const txByte = ref(0x9a) // 1001 1010，MSB first
const APB2 = 72 // MHz（F103 的 SPI1 挂在 APB2）
const spiDiv = ref(4)

const cpol = computed(() => (mode.value === 2 || mode.value === 3 ? 1 : 0))
const cpha = computed(() => (mode.value === 1 || mode.value === 3 ? 1 : 0))
const sckMHz = computed(() => APB2 / spiDiv.value)
const sckOver = computed(() => sckMHz.value > 18) // F103 的 SPI1 上限 18 MHz

// MSB first
const bits = computed(() => Array.from({ length: 8 }, (_, i) => (txByte.value >> (7 - i)) & 1))

const W = 600
const LEFT = 44
const CW = (W - LEFT) / 8 // 每个 SCK 周期宽度
const sckHi = 30
const sckLo = 58
const moHi = 100
const moLo = 128

// SCK：空闲电平由 CPOL 决定，每周期两半
const sckPath = computed(() => {
  let d = `M ${LEFT} ${cpol.value === 0 ? sckLo : sckHi} `
  for (let i = 0; i < 8; i++) {
    const x0 = LEFT + i * CW
    const xm = x0 + CW / 2
    const x1 = x0 + CW
    if (cpol.value === 0) {
      d += `L ${x0} ${sckHi} L ${xm} ${sckHi} L ${xm} ${sckLo} L ${x1} ${sckLo} `
    } else {
      d += `L ${x0} ${sckLo} L ${xm} ${sckLo} L ${xm} ${sckHi} L ${x1} ${sckHi} `
    }
  }
  return d
})
// MOSI：位值在整个周期内保持稳定（在采样边沿之前已建立）
const mosiPath = computed(() => {
  let d = ''
  bits.value.forEach((b, i) => {
    const x0 = LEFT + i * CW
    const x1 = x0 + CW
    const y = b === 1 ? moHi : moLo
    d += `M ${x0} ${y} L ${x1} ${y} `
  })
  return d
})
// 采样沿位置：CPHA=0 在周期起点（第一边沿），CPHA=1 在周期中点（第二边沿）
const sampleX = computed(() =>
  bits.value.map((_, i) => (cpha.value === 0 ? LEFT + i * CW : LEFT + i * CW + CW / 2))
)
const sampleLabel = computed(() => {
  if (cpol.value === 0) return cpha.value === 0 ? '上升沿采样（SCK 由低变高）' : '下降沿采样（SCK 由高变低）'
  return cpha.value === 0 ? '下降沿采样（SCK 由高变低）' : '上升沿采样（SCK 由低变高）'
})
const idleLabel = computed(() => (cpol.value === 0 ? '空闲为低电平' : '空闲为高电平'))

function setByte(v: number) {
  txByte.value = v
}

/* ---------- I²C ---------- */
const addr7 = ref(0x68) // MPU6050
const i2cRate = ref(100) // kHz
const cbPf = ref(200) // 总线电容

const addrWr = computed(() => (addr7.value << 1) & 0xff)
const addrRd = computed(() => ((addr7.value << 1) | 1) & 0xff)
const hex2 = (v: number) => '0x' + v.toString(16).toUpperCase().padStart(2, '0')

const bitTimeUs = computed(() => (1e6 / (i2cRate.value * 1e3)).toFixed(2))
const byteUs = computed(() => ((9 * 1e6) / (i2cRate.value * 1e3)).toFixed(2)) // 8 数据 + 1 ACK
const trNs = computed(() => (i2cRate.value === 100 ? 1000 : 300))
const rpMax = computed(() => trNs.value / (0.8473 * cbPf.value))
const rpPick = computed(() => {
  const r = rpMax.value
  if (r >= 4.7) return 4.7
  if (r >= 2.2) return 2.2
  if (r >= 1.5) return 1.5
  return 1.0
})

const i2cSlots = computed(() => [
  { label: 'START', kind: 'start' },
  { label: `地址 ${hex2(addrWr.value)}`, kind: 'addr' },
  { label: 'ACK', kind: 'ack' },
  { label: '数据', kind: 'data' },
  { label: 'ACK', kind: 'ack' },
  { label: 'STOP', kind: 'stop' }
])
</script>

<template>
  <div class="si">
    <Seg
      v-model="bus"
      :options="[
        { value: 'spi', label: 'SPI 四种相位' },
        { value: 'i2c', label: 'I²C 地址与时序' }
      ]"
      label="总线"
    />

    <!-- SPI -->
    <template v-if="bus === 'spi'">
      <div class="si-row">
        <span class="si-k">工作模式</span>
        <button
          v-for="m in 4"
          :key="m"
          class="si-b"
          :class="{ 'si-on': mode === m - 1 }"
          @click="mode = m - 1"
        >
          模式 {{ m - 1 }}
        </button>
        <span class="si-hint">
          CPOL={{ cpol }}（{{ idleLabel }}），CPHA={{ cpha }}（{{ sampleLabel }}）
        </span>
      </div>

      <div class="si-row">
        <span class="si-k">发送字节</span>
        <button class="si-b" @click="setByte(0x9a)">0x9A（1001 1010）</button>
        <button class="si-b" @click="setByte(0x55)">0x55</button>
        <button class="si-b" @click="setByte(0xff)">0xFF</button>
        <span class="si-hint">MSB 先发：{{ bits.join('') }}</span>
      </div>

      <svg class="si-wave" :viewBox="`0 0 ${W} 170`">
        <text x="4" :y="sckHi + 4" font-size="11" fill="var(--vp-c-text-3)">SCK</text>
        <path :d="sckPath" stroke="var(--vp-c-brand-1)" stroke-width="2.2" fill="none" />
        <text x="4" :y="moHi + 4" font-size="11" fill="var(--vp-c-text-3)">MOSI</text>
        <path :d="mosiPath" stroke="#22c55e" stroke-width="2.2" fill="none" />
        <g v-for="(x, i) in sampleX" :key="i">
          <line :x1="x" y1="20" :x2="x" y2="140" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 3" />
          <circle :cx="x" :cy="moHi - 14" r="2.5" fill="#f59e0b" />
          <text :x="x" :y="158" font-size="9.5" text-anchor="middle" fill="var(--vp-c-text-3)">
            {{ bits[i] }}
          </text>
        </g>
        <text x="4" y="14" font-size="10" fill="#f59e0b">虚线 = 采样时刻</text>
      </svg>

      <div class="si-grid">
        <div class="si-c">
          <span class="si-ck">SCK 频率 = PCLK ÷ 分频</span>
          <b class="si-cv" :class="{ 'si-bad': sckOver }">{{ sckMHz.toFixed(2) }} MHz</b>
          <span class="si-cs">{{ APB2 }} MHz ÷ {{ spiDiv }}{{ sckOver ? '（超过 F103 的 18 MHz 上限）' : '' }}</span>
        </div>
        <div class="si-c">
          <span class="si-ck">采样沿</span>
          <b class="si-cv">{{ sampleLabel }}</b>
          <span class="si-cs">{{ idleLabel }}</span>
        </div>
      </div>

      <p class="si-note">
        <b>四种模式怎么记：</b>CPOL 决定时钟<b>空闲时</b>是高还是低；CPHA 决定在<b>第几个边沿</b>采样数据。
        主从双方必须配置成同一模式，否则会每个字节都错位一位——表现为收到的数据整体右移或左移一位。
        绝大多数器件（如 SPI Flash、OLED 屏）用的是<b>模式 0 或模式 3</b>，接不上时优先试这两个。
        SPI 是<b>全双工</b>：主机发一位的同时也在收一位，所以读操作必须「发一个字节才能换回一个字节」（通常发 0xFF）。
      </p>
    </template>

    <!-- I²C -->
    <template v-else>
      <div class="si-row">
        <span class="si-k">7 位从机地址</span>
        <button class="si-b" @click="addr7 = 0x68">0x68（MPU6050）</button>
        <button class="si-b" @click="addr7 = 0x3c">0x3C（OLED）</button>
        <button class="si-b" @click="addr7 = 0x27">0x27（PCF8574）</button>
        <Ctrl v-model="addr7" label="自定义" unit="" :min="1" :max="127" :step="1" />
      </div>

      <div class="si-row">
        <span class="si-k">一次写寄存器的时序</span>
        <div class="si-slots">
          <span v-for="(s, i) in i2cSlots" :key="i" class="si-slot" :class="'si-s-' + s.kind">
            {{ s.label }}
          </span>
        </div>
      </div>

      <div class="si-grid">
        <div class="si-c">
          <span class="si-ck">7 位地址</span>
          <b class="si-cv">{{ hex2(addr7) }}</b>
          <span class="si-cs">{{ addr7.toString(2).padStart(7, '0') }}</span>
        </div>
        <div class="si-c">
          <span class="si-ck">地址字节 · 写</span>
          <b class="si-cv">{{ hex2(addrWr) }}</b>
          <span class="si-cs">地址左移 1 位，最低位 0</span>
        </div>
        <div class="si-c">
          <span class="si-ck">地址字节 · 读</span>
          <b class="si-cv">{{ hex2(addrRd) }}</b>
          <span class="si-cs">地址左移 1 位，最低位 1</span>
        </div>
        <div class="si-c si-main">
          <span class="si-ck">上拉电阻 Rp 上限</span>
          <b class="si-cv">{{ rpMax.toFixed(2) }} kΩ</b>
          <span class="si-cs">建议取 {{ rpPick }} kΩ</span>
        </div>
      </div>

      <div class="si-row">
        <Seg
          v-model="i2cRate"
          :options="[
            { value: 100, label: '标准 100 kHz' },
            { value: 400, label: '快速 400 kHz' }
          ]"
          label="速率"
        />
        <Ctrl v-model="cbPf" label="总线电容" unit="pF" :min="50" :max="400" :step="10" />
      </div>

      <div class="si-grid">
        <div class="si-c">
          <span class="si-ck">位时间</span>
          <b class="si-cv">{{ bitTimeUs }} µs</b>
        </div>
        <div class="si-c">
          <span class="si-ck">传 1 字节（8 数据 + ACK）</span>
          <b class="si-cv">{{ byteUs }} µs</b>
        </div>
        <div class="si-c">
          <span class="si-ck">上升时间要求</span>
          <b class="si-cv">{{ trNs }} ns</b>
          <span class="si-cs">Rp ≤ tr ÷ (0.8473 × Cb)</span>
        </div>
      </div>

      <p class="si-note">
        <b>I²C 三个必须记住的点：</b>① 总线是<b>开漏 + 上拉</b>，任何器件都只能拉低，所以「线与」——
        这也是为什么<b>必须接上拉电阻</b>，且速率越高、线缆越长（电容越大），上拉电阻要越小；
        ② 每个字节后接收方要回一个 <b>ACK</b>（把 SDA 拉低），没回应说明地址错了或器件不在；
        ③ <b>START 条件</b>是 SCL 为高时 SDA 下降沿，<b>STOP</b> 是 SCL 为高时 SDA 上升沿——
        正因为这个定义，I²C 在传输途中不能随便拉高 SDA。
        <b>地址别搞混</b>：手册上写的 0x68 是 7 位地址，真正发出去的字节是 0xD0（写）/ 0xD1（读）。
      </p>
    </template>
  </div>
</template>

<style scoped>
.si {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.si-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.si-k {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.si-b {
  padding: 3px 9px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.si-b:hover {
  border-color: var(--vp-c-brand-1);
}
.si-on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}
.si-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.si-wave {
  width: 100%;
  height: 170px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.si-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.si-c {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.si-c.si-main {
  border-color: var(--vp-c-brand-1);
}
.si-ck {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.si-cv {
  font-size: 15px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}
.si-cv.si-bad {
  color: var(--vp-c-danger-1);
}
.si-cs {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.si-slots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.si-slot {
  padding: 2px 8px;
  font-size: 11.5px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
}
.si-s-start {
  border-color: #f59e0b;
  color: #f59e0b;
}
.si-s-stop {
  border-color: #22c55e;
  color: #22c55e;
}
.si-s-ack {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.si-s-addr {
  border-color: var(--vp-c-text-2);
  color: var(--vp-c-text-1);
}
.si-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--vp-c-text-3);
}
.si-note b {
  color: var(--vp-c-text-2);
}
</style>
