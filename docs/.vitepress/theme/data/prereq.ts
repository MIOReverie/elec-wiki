/**
 * 前置知识索引。
 * - brief：胶囊 hover 时显示的一句话摘要（即时，无需网络）
 * - page ：抽屉里拉取的完整卡片页（docs/ee/prereq/<id>.md 的路由）
 * - full ：想深入时跳转的正文章节
 */
export interface PrereqItem {
  id: string
  title: string
  brief: string
  page?: string
  full?: string
  fullTitle?: string
  group: string
}

export const PREREQ: Record<string, PrereqItem> = {
  'circuit-model': {
    id: 'circuit-model',
    title: '电路模型与理想元件',
    brief: '把实际器件抽象成 R / L / C / 电源 等理想元件的集合，只关心端口的 u-i 关系。',
    page: '/ee/prereq/circuit-model',
    full: '/ee/01-basics/model-reference',
    fullTitle: '01 · 电路模型与参考方向',
    group: '基础'
  },
  'reference-direction': {
    id: 'reference-direction',
    title: '电压电流的参考方向',
    brief: '先任意假设一个方向，算出来为正说明实际方向一致，为负说明相反。关联/非关联方向决定功率符号。',
    page: '/ee/prereq/reference-direction',
    full: '/ee/01-basics/model-reference',
    fullTitle: '01 · 电路模型与参考方向',
    group: '基础'
  },
  ohm: {
    id: 'ohm',
    title: '欧姆定律',
    brief: '关联方向下 U = RI；非关联方向加负号。电阻是耗能元件。',
    page: '/ee/prereq/ohm',
    full: '/ee/01-basics/model-reference',
    fullTitle: '01 · 电路模型与参考方向',
    group: '基础'
  },
  power: {
    id: 'power',
    title: '电功率与电能',
    brief: 'P = UI；关联方向下 P>0 吸收功率，P<0 发出功率。全电路功率守恒。',
    page: '/ee/prereq/power',
    full: '/ee/01-basics/model-reference',
    fullTitle: '01 · 电路模型与参考方向',
    group: '基础'
  },
  'source-states': {
    id: 'source-states',
    title: '电源有载 / 开路 / 短路',
    brief: '有载 I=E/(R₀+R)；开路 I=0、U=E；短路 I=E/R₀ 极大，必须避免。',
    page: '/ee/prereq/source-states',
    full: '/ee/01-basics/model-reference',
    fullTitle: '01 · 电路模型与参考方向',
    group: '基础'
  },
  kcl: {
    id: 'kcl',
    title: '基尔霍夫电流定律 KCL',
    brief: '任一节点：ΣI = 0（流入 = 流出）。本质是电荷守恒，与元件性质无关。',
    page: '/ee/prereq/kcl',
    full: '/ee/01-basics/kcl-kvl',
    fullTitle: '02 · 基尔霍夫定律与电位',
    group: '基础'
  },
  kvl: {
    id: 'kvl',
    title: '基尔霍夫电压定律 KVL',
    brief: '任一回路：ΣU = 0（电压升 = 电压降）。本质是能量守恒。',
    page: '/ee/prereq/kvl',
    full: '/ee/01-basics/kcl-kvl',
    fullTitle: '02 · 基尔霍夫定律与电位',
    group: '基础'
  },
  potential: {
    id: 'potential',
    title: '电位与参考点',
    brief: '电位是相对量，换参考点电位全变，但任意两点间电压不变。',
    page: '/ee/prereq/potential',
    full: '/ee/01-basics/kcl-kvl',
    fullTitle: '02 · 基尔霍夫定律与电位',
    group: '基础'
  },
  'series-parallel': {
    id: 'series-parallel',
    title: '电阻串并联等效',
    brief: '串联 R=ΣRᵢ、分压；并联 1/R=Σ1/Rᵢ、分流。串并联是化简电路的第一刀。',
    page: '/ee/prereq/series-parallel',
    full: '/ee/02-methods/equivalent',
    fullTitle: '03 · 串并联与电源等效变换',
    group: '分析方法'
  },
  'voltage-divider': {
    id: 'voltage-divider',
    title: '分压与分流公式',
    brief: '串联：Uₖ = Rₖ/ΣR · U；并联两电阻：I₁ = R₂/(R₁+R₂) · I。',
    page: '/ee/prereq/voltage-divider',
    full: '/ee/02-methods/equivalent',
    fullTitle: '03 · 串并联与电源等效变换',
    group: '分析方法'
  },
  'source-transform': {
    id: 'source-transform',
    title: '电压源 ⇄ 电流源等效变换',
    brief: '实际电压源 E 串 R₀ ⇄ 实际电流源 Iₛ = E/R₀ 并 R₀。只对外等效。',
    page: '/ee/prereq/source-transform',
    full: '/ee/02-methods/equivalent',
    fullTitle: '03 · 串并联与电源等效变换',
    group: '分析方法'
  },
  'y-delta': {
    id: 'y-delta',
    title: '星形 ⇄ 三角形变换',
    brief: 'Y→△：R△ = ΣR_Y两两积之和 / 对面R_Y；对称时 R△ = 3R_Y。',
    page: '/ee/prereq/y-delta',
    full: '/ee/02-methods/equivalent',
    fullTitle: '03 · 串并联与电源等效变换',
    group: '分析方法'
  },
  nodal: {
    id: 'nodal',
    title: '结点电压法',
    brief: '选参考点，以结点电压为未知量列 KCL：G·U = Iₛ。最省方程数的通用方法。',
    page: '/ee/prereq/nodal',
    full: '/ee/02-methods/nodal',
    fullTitle: '04 · 支路电流法与结点电压法',
    group: '分析方法'
  },
  superposition: {
    id: 'superposition',
    title: '叠加定理',
    brief: '线性电路中，每个独立源单独作用之和 = 共同作用。不作用源置零（电压源短路、电流源开路）。',
    page: '/ee/prereq/superposition',
    full: '/ee/02-methods/theorems',
    fullTitle: '05 · 叠加定理 · 戴维南 · 最大功率',
    group: '分析方法'
  },
  thevenin: {
    id: 'thevenin',
    title: '戴维南 / 诺顿定理',
    brief: '任何含源二端网络 = 电压源 U_oc 串 R_eq（或电流源 I_sc 并 R_eq）。求复杂电路中一条支路的最快方法。',
    page: '/ee/prereq/thevenin',
    full: '/ee/02-methods/theorems',
    fullTitle: '05 · 叠加定理 · 戴维南 · 最大功率',
    group: '分析方法'
  },
  'max-power': {
    id: 'max-power',
    title: '最大功率传输',
    brief: '负载 R_L = R_eq 时获得最大功率 P_max = U_oc²/(4R_eq)，效率仅 50%。',
    page: '/ee/prereq/max-power',
    full: '/ee/02-methods/theorems',
    fullTitle: '05 · 叠加定理 · 戴维南 · 最大功率',
    group: '分析方法'
  },
  'switching-rule': {
    id: 'switching-rule',
    title: '换路定则',
    brief: 'u_C 与 i_L 不能突变：u_C(0₊)=u_C(0₋)、i_L(0₊)=i_L(0₋)。其它量都可以突变。',
    page: '/ee/prereq/switching-rule',
    full: '/ee/03-transient/elements',
    fullTitle: '06 · 储能元件与换路定则',
    group: '暂态'
  },
  'time-constant': {
    id: 'time-constant',
    title: '时间常数 τ',
    brief: 'RC 电路 τ = R_eq·C；RL 电路 τ = L/R_eq。τ 是过渡过程走完 63.2% 所需时间。',
    page: '/ee/prereq/time-constant',
    full: '/ee/03-transient/three-factor',
    fullTitle: '07 · 三要素法：RC / RL',
    group: '暂态'
  },
  'sine-params': {
    id: 'sine-params',
    title: '正弦量三要素',
    brief: '幅值 U_m、角频率 ω、初相位 ψ。三要素确定则正弦量唯一确定。',
    page: '/ee/prereq/sine-params',
    full: '/ee/04-ac/phasor',
    fullTitle: '08 · 正弦量与相量法',
    group: '交流'
  },
  'complex-number': {
    id: 'complex-number',
    title: '复数与相量运算',
    brief: '相量是复数的极坐标写法：A∠ψ = A(cosψ + j sinψ)。乘除用极坐标，加减用代数型。',
    page: '/ee/prereq/complex-number',
    full: '/ee/04-ac/phasor',
    fullTitle: '08 · 正弦量与相量法',
    group: '交流'
  },
  rms: {
    id: 'rms',
    title: '有效值（RMS）',
    brief: '有效值 = 在相同时间内产生相同热效应的直流值。正弦量 U = U_m/√2。',
    page: '/ee/prereq/rms',
    full: '/ee/04-ac/phasor',
    fullTitle: '08 · 正弦量与相量法',
    group: '交流'
  },
  impedance: {
    id: 'impedance',
    title: '阻抗与导纳',
    brief: 'Z = R + jX，Z_L = jωL，Z_C = 1/(jωC) = -j/(ωC)。感抗使电压超前，容抗使电流超前。',
    page: '/ee/prereq/impedance',
    full: '/ee/04-ac/rlc',
    fullTitle: '09 · RLC 串联与阻抗',
    group: '交流'
  },
  admittance: {
    id: 'admittance',
    title: '导纳 Y = 1/Z',
    brief: '导纳是阻抗的倒数，单位 S；并联电路各支路导纳直接相加，串联才用阻抗相加。',
    page: '/ee/prereq/admittance',
    full: '/ee/04-ac/rlc',
    fullTitle: '09 · RLC 串联与阻抗',
    group: '交流'
  },
  'power-factor': {
    id: 'power-factor',
    title: '功率因数 cosφ',
    brief: 'P = UI cosφ，Q = UI sinφ，S = UI。提高 cosφ 可减小线路电流与损耗。',
    page: '/ee/prereq/power-factor',
    full: '/ee/04-ac/power',
    fullTitle: '10 · 功率与功率因数',
    group: '交流'
  },
  resonance: {
    id: 'resonance',
    title: '串联谐振',
    brief: 'ω₀ = 1/√(LC)，此时 X=0、Z=R 最小、I 最大，U_L 与 U_C 可能远高于电源电压。',
    page: '/ee/prereq/resonance',
    full: '/ee/04-ac/resonance',
    fullTitle: '11 · 谐振与频率特性',
    group: '交流'
  },
  fourier: {
    id: 'fourier',
    title: '傅里叶级数',
    brief: '任何周期波形都能拆成「直流分量 + 基波 + 各次谐波」的正弦分量之和，精确相等、不是近似。',
    page: '/ee/prereq/fourier',
    full: '/ee/04-ac/non-sinusoidal',
    fullTitle: '12 · 非正弦周期电路（傅里叶分解与谐波）',
    group: '交流'
  },
  'three-phase-source': {
    id: 'three-phase-source',
    title: '对称三相电源',
    brief: '三个幅值相同、频率相同、相位互差 120° 的正弦电动势。Y 接时 U_l = √3 U_p 且超前 30°。',
    page: '/ee/prereq/three-phase-source',
    full: '/ee/05-three-phase/circuit',
    fullTitle: '13 · 三相电路',
    group: '三相'
  },
  'magnetic-circuit': {
    id: 'magnetic-circuit',
    title: '磁路欧姆定律',
    brief: 'Φ = F/R_m = NI/(l/μS)，与电路欧姆定律同构，但铁磁材料 μ 非线性。',
    page: '/ee/prereq/magnetic-circuit',
    full: '/ee/06-machine/magnetic',
    fullTitle: '15 · 磁路基础',
    group: '磁路与电机'
  },
  transformer: {
    id: 'transformer',
    title: '变压器变比',
    brief: 'U₁/U₂ ≈ N₁/N₂ = k，I₁/I₂ ≈ 1/k，Z₁ = k²Z_L。只变交流、不能变直流。',
    page: '/ee/prereq/transformer',
    full: '/ee/06-machine/transformer',
    fullTitle: '16 · 变压器',
    group: '磁路与电机'
  },
  slip: {
    id: 'slip',
    title: '转差率 s',
    brief: 's = (n₀ - n)/n₀。s=0 空载（理想），s=1 堵转，额定 s_N 通常 2%~6%。',
    page: '/ee/prereq/slip',
    full: '/ee/06-machine/induction-motor',
    fullTitle: '17 · 三相异步电动机原理',
    group: '磁路与电机'
  },
  diode: {
    id: 'diode',
    title: '二极管单向导电',
    brief: '正向导通（硅管压降约 0.7V）、反向截止。整流电路的基础。（模电已学）',
    page: '/ee/prereq/diode',
    full: '/ee/08-electronics/rectifier',
    fullTitle: '23 · 整流 · 滤波 · 稳压',
    group: '电子技术'
  },
  boolean: {
    id: 'boolean',
    title: '布尔代数与逻辑门',
    brief: '与/或/非 + 德摩根定律。真值表 ↔ 逻辑表达式 ↔ 电路图 三者互转是基本功。',
    page: '/ee/prereq/boolean',
    full: '/ee/08-electronics/digital-basic',
    fullTitle: '24 · 数字电路基础',
    group: '电子技术'
  },
  'flip-flop': {
    id: 'flip-flop',
    title: '触发器',
    brief: '具有记忆功能的基本单元。D 触发器：Qⁿ⁺¹ = D（时钟边沿到来时）。',
    page: '/ee/prereq/flip-flop',
    full: '/ee/08-electronics/sequential',
    fullTitle: '26 · 触发器与时序电路',
    group: '电子技术'
  },

  // ---- 数字电路 ----
  'boolean-algebra': {
    id: 'boolean-algebra',
    title: '布尔代数与化简',
    brief: '与或非三种运算、德摩根定律、吸收律与冗余项；化简的判据是项数最少、每项字面数最少。',
    page: '/prereq/boolean-algebra',
    full: '/digital/boolean-kmap',
    fullTitle: '02 · 逻辑代数与卡诺图',
    group: '数字电路'
  },
  kmap: {
    id: 'kmap',
    title: '卡诺图与最小项',
    brief: '按格雷码排列，圈 1 的规则：圈必须含 2^k 个相邻的 1，圈数最少、字面数最少；无关项用来把圈画大。',
    page: '/prereq/kmap',
    full: '/digital/boolean-kmap',
    fullTitle: '02 · 逻辑代数与卡诺图',
    group: '数字电路'
  },
  'gate-fanout': {
    id: 'gate-fanout',
    title: '门电路扇出与驱动能力',
    brief: '扇出 = 输出能带动的输入数，取高电平与低电平两个方向中较小者；扇出不足时用缓冲器扩展。',
    page: '/prereq/gate-fanout',
    full: '/digital/gates',
    fullTitle: '03 · 门电路与集成器件',
    group: '数字电路'
  },
  'setup-hold': {
    id: 'setup-hold',
    title: '建立时间与保持时间',
    brief: '触发器的采样窗口：时钟沿之前数据要稳定够久（建立），沿之后还要稳够久（保持）。',
    page: '/prereq/setup-hold',
    full: '/digital/flip-flops',
    fullTitle: '05 · 触发器',
    group: '数字电路'
  },

  // ---- 模拟电子 ----
  'pn-diode': {
    id: 'pn-diode',
    title: 'PN 结与二极管模型',
    brief: '耗尽层与内电场造成单向导电；工程估算用恒压模型（硅 0.7 V），小信号用动态电阻 nV_T/I_DQ。',
    page: '/prereq/pn-diode',
    full: '/analog/semiconductor',
    fullTitle: '01 · 半导体器件',
    group: '模拟电子'
  },
  'bjt-regions': {
    id: 'bjt-regions',
    title: '三极管工作区',
    brief: '放大区、饱和区、截止区的判据；先算需求 I_C=βI_B，再算天花板 V_CC/R_C，谁小听谁的。',
    page: '/prereq/bjt-regions',
    full: '/analog/semiconductor',
    fullTitle: '01 · 半导体器件',
    group: '模拟电子'
  },
  'q-point-loadline': {
    id: 'q-point-loadline',
    title: '静态工作点与负载线',
    brief: 'Q 点定位置、直流与交流负载线定摆幅；最大不失真输出取两侧余量的较小值。',
    page: '/prereq/q-point-loadline',
    full: '/analog/amplifiers',
    fullTitle: '02 · 基本放大电路',
    group: '模拟电子'
  },
  'input-impedance': {
    id: 'input-impedance',
    title: '输入阻抗',
    brief: '从输入端看进去的等效阻抗 Z_i = U_i/I_i；低频下就是输入电阻 r_i，越大对前级影响越小。',
    page: '/prereq/input-impedance',
    full: '/analog/amplifiers',
    fullTitle: '第 2 章 · 基本放大电路',
    group: '电子技术'
  },
  'virtual-short': {
    id: 'virtual-short',
    title: '虚短与虚断',
    brief: '运放线性区的两条近似规则：输入电流近似为零、两个输入端电位近似相等；前提是有负反馈。',
    page: '/prereq/virtual-short',
    full: '/analog/signal-processing',
    fullTitle: '07 · 信号的运算和处理',
    group: '模拟电子'
  },

  // ---- 嵌入式 ----
  'register-map': {
    id: 'register-map',
    title: '寄存器映射',
    brief: '寄存器就是占据固定地址的一小块内存；基地址加固定偏移，读-改-写或用 BSRR 原子置位。',
    page: '/prereq/register-map',
    full: '/embedded/embedded-c',
    fullTitle: '03 · 嵌入式 C 与寄存器思维',
    group: '嵌入式'
  },
  'nvic-priority': {
    id: 'nvic-priority',
    title: 'NVIC 优先级',
    brief: '抢占优先级决定能否嵌套，子优先级只决定同时挂起时的排队顺序；数值越小优先级越高。',
    page: '/prereq/nvic-priority',
    full: '/embedded/interrupt',
    fullTitle: '06 · 中断与 NVIC',
    group: '嵌入式'
  },
  'dma-cache': {
    id: 'dma-cache',
    title: 'DMA 与缓存一致性',
    brief: 'DMA 搬运不占 CPU；带 D-Cache 的芯片上 DMA 写内存后必须 Invalidate，否则 CPU 读到旧值。',
    page: '/prereq/dma-cache',
    full: '/embedded/adc-dma',
    fullTitle: '10 · ADC 与 DMA',
    group: '嵌入式'
  },
  'clock-tree': {
    id: 'clock-tree',
    title: '时钟树',
    brief: 'HSI/HSE 经 PLL 倍频再分频到各总线；外设时钟默认关闭，APB 预分频不为 1 时定时器时钟自动乘二。',
    page: '/prereq/clock-tree',
    full: '/embedded/clock',
    fullTitle: '04 · 时钟系统（RCC 与时钟树）',
    group: '嵌入式'
  }
}

export const PREREQ_GROUPS = ['基础', '分析方法', '暂态', '交流', '三相', '磁路与电机', '电子技术']

/** 页面 → 它依赖的前置知识 id（用于页面顶部自动列出） */
export const PAGE_PREREQ: Record<string, string[]> = {
  '/ee/01-basics/model-reference': [],
  '/ee/01-basics/kcl-kvl': ['reference-direction', 'ohm'],
  '/ee/02-methods/equivalent': ['ohm', 'kvl'],
  '/ee/02-methods/nodal': ['kcl', 'kvl', 'series-parallel'],
  '/ee/02-methods/theorems': ['series-parallel', 'source-transform', 'nodal'],
  '/ee/03-transient/elements': ['ohm', 'kvl'],
  '/ee/03-transient/three-factor': ['switching-rule'],
  '/ee/04-ac/phasor': ['complex-number', 'kvl'],
  '/ee/04-ac/rlc': ['phasor-implicit', 'impedance'].filter((x) => x !== 'phasor-implicit'),
  '/ee/04-ac/power': ['impedance', 'rms'],
  '/ee/04-ac/resonance': ['impedance'],
  '/ee/04-ac/non-sinusoidal': ['sine-params', 'rms', 'fourier'],
  '/ee/05-three-phase/circuit': ['three-phase-source', 'impedance', 'admittance'],
  '/ee/05-three-phase/power': ['three-phase-source', 'power-factor'],
  '/ee/06-machine/magnetic': ['magnetic-circuit'],
  '/ee/06-machine/transformer': ['magnetic-circuit', 'impedance'],
  '/ee/06-machine/induction-motor': ['three-phase-source', 'magnetic-circuit'],
  '/ee/06-machine/motor-characteristic': ['slip'],
  '/ee/06-machine/other-motors': ['slip'],
  '/ee/07-control/relay': ['series-parallel'],
  '/ee/07-control/plc': ['boolean'],
  '/ee/07-control/safety': ['source-states'],
  '/ee/08-electronics/rectifier': ['diode', 'time-constant'],
  '/ee/08-electronics/digital-basic': ['boolean'],
  '/ee/08-electronics/combinational': ['boolean'],
  '/ee/08-electronics/sequential': ['boolean', 'flip-flop']
}
