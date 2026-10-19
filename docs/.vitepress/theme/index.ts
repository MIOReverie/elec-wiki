import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import 'katex/dist/katex.min.css'
import './styles/base.css'

import Layout from './Layout.vue'
import Prereq from './components/Prereq.vue'
import PrereqBar from './components/PrereqBar.vue'
import DemoBox from './components/DemoBox.vue'
import Meta from './components/Meta.vue'
import Ctrl from './components/Ctrl.vue'
import Seg from './components/Seg.vue'

import CircuitSandbox from './components/sim/CircuitSandbox.vue'
import OhmDemo from './components/sim/OhmDemo.vue'
import KclKvlDemo from './components/sim/KclKvlDemo.vue'
import TheveninDemo from './components/sim/TheveninDemo.vue'
import PhasorDemo from './components/sim/PhasorDemo.vue'
import RlcDemo from './components/sim/RlcDemo.vue'
import ResonanceDemo from './components/sim/ResonanceDemo.vue'
import PowerFactorDemo from './components/sim/PowerFactorDemo.vue'
import ThreePhaseDemo from './components/sim/ThreePhaseDemo.vue'
import TransientDemo from './components/sim/TransientDemo.vue'
import TransformerDemo from './components/sim/TransformerDemo.vue'
import MotorDemo from './components/sim/MotorDemo.vue'
import RectifierDemo from './components/sim/RectifierDemo.vue'
import DividerLoadDemo from './components/sim/DividerLoadDemo.vue'
import CounterDemo from './components/sim/CounterDemo.vue'
import RelayCircuit from './components/sim/RelayCircuit.vue'
import LadderDemo from './components/sim/LadderDemo.vue'
import NumberConverter from './components/sim/NumberConverter.vue'
import LogicGateDemo from './components/sim/LogicGateDemo.vue'
import CombinationalDemo from './components/sim/CombinationalDemo.vue'
import FlipFlopDemo from './components/sim/FlipFlopDemo.vue'
import ModCounterDemo from './components/sim/ModCounterDemo.vue'
import MemoryDemo from './components/sim/MemoryDemo.vue'
import AdcDemo from './components/sim/AdcDemo.vue'
import KMapDemo from './components/sim/KMapDemo.vue'
import OscillatorDemo from './components/sim/OscillatorDemo.vue'
import OpampDemo from './components/sim/OpampDemo.vue'
import DiodeCurveDemo from './components/sim/DiodeCurveDemo.vue'
import AmpDemo from './components/sim/AmpDemo.vue'
import BodeDemo from './components/sim/BodeDemo.vue'
import PowerAmpDemo from './components/sim/PowerAmpDemo.vue'
import FeedbackDemo from './components/sim/FeedbackDemo.vue'
import FilterDemo from './components/sim/FilterDemo.vue'
import TriStateBusDemo from './components/sim/TriStateBusDemo.vue'
import BitManipDemo from './components/sim/BitManipDemo.vue'
import ClockTreeDemo from './components/sim/ClockTreeDemo.vue'
import GpioModeDemo from './components/sim/GpioModeDemo.vue'
import NvicDemo from './components/sim/NvicDemo.vue'
import TimerPwmDemo from './components/sim/TimerPwmDemo.vue'
import UartFrameDemo from './components/sim/UartFrameDemo.vue'
import SpiI2cDemo from './components/sim/SpiI2cDemo.vue'
import AdcQuantDemo from './components/sim/AdcQuantDemo.vue'
import RtosScheduleDemo from './components/sim/RtosScheduleDemo.vue'
import DependencyGraph from './components/DependencyGraph.vue'

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

const sims: Record<string, any> = {
  CircuitSandbox,
  OhmDemo,
  KclKvlDemo,
  TheveninDemo,
  PhasorDemo,
  RlcDemo,
  ResonanceDemo,
  PowerFactorDemo,
  ThreePhaseDemo,
  TransientDemo,
  TransformerDemo,
  MotorDemo,
  RectifierDemo,
  DividerLoadDemo,
  CounterDemo,
  RelayCircuit,
  LadderDemo,
  NumberConverter,
  LogicGateDemo,
  CombinationalDemo,
  FlipFlopDemo,
  ModCounterDemo,
  MemoryDemo,
  AdcDemo,
  KMapDemo,
  OscillatorDemo,
  OpampDemo,
  DiodeCurveDemo,
  AmpDemo,
  BodeDemo,
  PowerAmpDemo,
  FeedbackDemo,
  FilterDemo,
  TriStateBusDemo,
  BitManipDemo,
  ClockTreeDemo,
  GpioModeDemo,
  NvicDemo,
  TimerPwmDemo,
  UartFrameDemo,
  SpiI2cDemo,
  AdcQuantDemo,
  RtosScheduleDemo,
  DependencyGraph
}

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
    for (const [name, comp] of Object.entries(sims)) app.component(name, comp)
  }
} satisfies Theme
