<template>
  <div class="flow-chart chart_js"></div>
</template>
<script>
import { formatDay } from '@/filters/time'
import { debounce } from '@/utils/utils'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
const getBaseSerie = color => {
  return {
    smooth: true,
    symbol: 'circle',
    symbolSize: 5,
    sampling: 'average',
    itemStyle: {
      normal: {
        color: color
      }
    },
    smoothMonotone: 'x',
    areaStyle: {
      normal: {
        opacity: 0.2,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color
          },
          {
            offset: 1,
            color: '#fff'
          }
        ])
      }
    }
  }
}
const OPT = {
  title: {
    text: I18N.t('egw.chart')
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 0,
    left: 'center',
    data: [I18N.t('egw.update_rate'), I18N.t('egw.download_rate')]
  },
  grid: {
    top: 20,
    left: '1%',
    right: '2%',
    bottom: '2%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    Object.assign(getBaseSerie('#2B6AFD'), {
      type: 'up',
      name: I18N.t('egw.update_rate'),
      type: 'line',
      data: []
    }),
    Object.assign(getBaseSerie('#018903'), {
      type: 'down',
      name:  I18N.t('egw.download_rate'),
      type: 'line',
      data: []
    })
  ]
}
export default {
  name: 'component_flowChart',
  props: {
    maxSize: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      chart: null,
      resizeFn: null
    }
  },
  mounted() {
    this.chart = echarts.init(this.$el)
    this.resizeFn = this.debounceResize()
    window.addEventListener('resize', this.resizeFn)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeFn)
    this.resizeFn = null
  },
  methods: {
    loadData(d, opt) {
      let _opt = this.getOpt(d, opt)
      this.chart.setOption(_opt)
    },
    getOpt(data = [], opt = {}) {
      let _labels = []
      let _v1 = []
      let _v2 = []
      let _opt = Object.assign({}, OPT, opt)
      data.forEach(d => {
        _labels.push(formatDay(new Date(d.xVal), false))
        _v1.push(d.up)
        _v2.push(d.down)
      })
      _opt.xAxis.data = _labels
      _opt.series[0].data = _v1
      _opt.series[1].data = _v2
      return _opt
    },
    debounceResize() {
      return debounce(() => {
        this.chart.resize()
      }, 200)
    }
  }
}
</script>
<style lang="scss" scoped>
.flow-chart {
  width: 100%;
  height: 100%;
}
</style>
