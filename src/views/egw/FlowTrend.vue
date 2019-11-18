<template>
  <div class="block overview-flowinfo">
    <el-row align="middle" class="mb10" justify="center" type="flex">
      <el-col class="c-info tl">{{chartTitle}}</el-col>
      <el-col class="tr">
        <el-select class="w80" size="mini" v-model="unit">
          <el-option :key="unit.value" :label="unit.label" :value="unit.value" v-for="unit of units"></el-option>
        </el-select>
        <el-select class="w80" size="mini" v-model="tabSwitch" v-show="tabs.length">
          <el-option :key="index" :label="tab" :value="index" v-for="(tab,index) in tabs"></el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row align="center" class type="flex">
      <el-col>
        <div class="chart">
          <flow-chart :max-size="10" ref="flowChartRef"></flow-chart>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { Col, Row } from 'element-ui'
import FlowChart from '@/views/egw/components/FlowChart'
const CHART_DATA = {}
let TAB_DATA = []
let timer = null
export default {
  name: 'OverviewFlowTrend',
  data() {
    return {
      tabs: TAB_DATA,
      tabSwitch: 0,
      units: [
        {
          label: 'bps',
          value: 1
        },
        {
          label: 'Kbps',
          value: 2
        },
        {
          label: 'Mbps',
          value: 3
        }
      ],
      unit: 2
    }
  },
  beforeDestroy() {
    clearTimeout(timer)
    timer = null
  },
  components: {
    FlowChart,
    [Col.name]: Col,
    [Row.name]: Row
  },
  computed: {
    // 表格名称
    chartTitle() {
      let _unit = this.units.find(unit => {
        return unit.value === this.unit
      })
      return `实时总流量(${_unit.label})`
    }
  },
  watch: {
    tabSwitch(v) {
      this._showChart()
    },
    unit(u) {
      this._showChart()
    }
  },
  methods: {
    async init() {
      await this._loadFlowChart(true)
    },
    // 流量转成Kbps
    rateTrans(val) {
      return (val / Math.pow(1024, this.unit - 1)).toFixed(2)
    },
    // 加载流量图表
    async _loadFlowChart(isInit) {
      try {
        let _result = await this.$api.interfaceFlow()
        let _chartInfo = _result.data
        this.$bus.$emit('flowIntfInfo', { from: 'FlowInfo', flowInfo: _chartInfo })
        for (let key in _chartInfo) {
          if (!CHART_DATA[key]) {
            TAB_DATA.push(key)
            CHART_DATA[key] = []
          }
          while (CHART_DATA[key].length < 29) {
            CHART_DATA[key].unshift({
              xVal: new Date().getTime() - 10000 * CHART_DATA[key].length,
              up: 0,
              down: 0
            })
          }
          if (CHART_DATA[key].length >= 30) {
            CHART_DATA[key].shift()
          }

          CHART_DATA[key].push({
            xVal: new Date().getTime(),
            up: +_chartInfo[key].up, // || Math.random() * 100000000,
            down: +_chartInfo[key].down // || Math.random() * 100000000
          })
        }
        TAB_DATA.sort()
        this._showChart()
      } finally {
        if (isInit || timer) {
          // 防止网络状态请求未返回时切换到其他页面，已clear的定时器又重新创建导致残留定时器
          timer = setTimeout(() => {
            this._loadFlowChart()
          }, 5000)
        }
      }
    },
    // chart图标渲染
    _showChart() {
      if (!this.$refs.flowChartRef) {
        return
      }
      this.$refs.flowChartRef.loadData(
        (CHART_DATA[this.tabs[this.tabSwitch]] || []).map(data => {
          return {
            xVal: data.xVal,
            up: this.rateTrans(data.up),
            down: this.rateTrans(data.down)
          }
        }),
        { title: { show: false, text: this.chartTitle } }
      )
    }
  }
}
</script>
<style lang="scss" scoped>
.overview-flowinfo {
  .chart {
    width: 100%;
    height: 300px;
  }
}
</style>