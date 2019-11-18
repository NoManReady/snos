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

const OPT = {
  title: {
    text: '折线图'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 0,
    left: 'center',
    data: ['上传流量', '下载流量']
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
    {
      type: 'up',
      name: '上传流量',
      type: 'line',
      data: [],
      smooth: true
    },
    {
      type: 'down',
      name: '下载流量',
      type: 'line',
      data: [],
      smooth: true
    }
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
