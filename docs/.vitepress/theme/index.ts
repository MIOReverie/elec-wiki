import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { defineAsyncComponent } from 'vue'
import 'katex/dist/katex.min.css'
import './styles/base.css'

import Layout from './Layout.vue'
import Prereq from './components/Prereq.vue'
import PrereqBar from './components/PrereqBar.vue'
import DemoBox from './components/DemoBox.vue'
import Meta from './components/Meta.vue'
import Ctrl from './components/Ctrl.vue'
import Seg from './components/Seg.vue'

import FigBox from './components/fig/FigBox.vue'
import WaveChart from './components/fig/WaveChart.vue'
import WavePreset from './components/fig/WavePreset.vue'
import CircuitFig from './components/fig/CircuitFig.vue'

import CourseRoadmap from './components/CourseRoadmap.vue'
import StatusTable from './components/StatusTable.vue'
import AllPages from './components/AllPages.vue'
import PrereqIndex from './components/PrereqIndex.vue'
import HomeCourses from './components/home/HomeCourses.vue'
import HomeRecent from './components/home/HomeRecent.vue'
import HomeStats from './components/home/HomeStats.vue'

// 仿真组件改为按需加载：import.meta.glob 只生成「名字 → 动态 import」的映射，
// 每个组件各自成为独立 chunk，只有页面真正渲染到对应标签时才拉取。
// 全局组件名保持不变（由文件名推导），md 页面零改动。
const simLoaders = import.meta.glob('./components/sim/*.vue') as Record<
  string,
  () => Promise<any>
>

const sims: Record<string, any> = {}
for (const [file, loader] of Object.entries(simLoaders)) {
  const name = file.replace(/^.*\/([^/]+)\.vue$/, '$1')
  sims[name] = defineAsyncComponent(loader)
}
// 依赖图谱不在 sim/ 目录，但同样按需加载（仅 /ee/graph 使用）
sims.DependencyGraph = defineAsyncComponent(() => import('./components/DependencyGraph.vue'))

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Prereq', Prereq)
    app.component('PrereqBar', PrereqBar)
    app.component('DemoBox', DemoBox)
    app.component('FigBox', FigBox)
    app.component('WaveChart', WaveChart)
    app.component('WavePreset', WavePreset)
    app.component('CircuitFig', CircuitFig)
    app.component('Meta', Meta)
    app.component('Ctrl', Ctrl)
    app.component('Seg', Seg)
    app.component('CourseRoadmap', CourseRoadmap)
    app.component('StatusTable', StatusTable)
    app.component('AllPages', AllPages)
    app.component('PrereqIndex', PrereqIndex)
    app.component('HomeCourses', HomeCourses)
    app.component('HomeRecent', HomeRecent)
    app.component('HomeStats', HomeStats)
    for (const [name, comp] of Object.entries(sims)) app.component(name, comp)
  }
} satisfies Theme
