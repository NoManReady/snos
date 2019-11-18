<template>
  <div class="diagnose-speed">
    <help-alert json-key="networkTool" title="网络测速"></help-alert>
    <div class="gauge-box">
      <div class="L-con">
        <div class="aZ-bV">
          <span class="bV-title">用户信息</span>
        </div>
        <div class="clearfix ellipsis">您的IP地址：{{speedRes.client_ip}}</div>
        <div class="quote">运营商：{{speedRes.client_isp}}</div>
      </div>
      <div class="sevinfo-con">
        <div class="aZ-bV">
          <span class="bV-title">测速点信息</span>
        </div>
        <div class="clearfix ellipsis" id="tp_title">
          当前测速点：
          <span v-if="speedRes.best_server == 'NA'">
            <i class="el-icon-loading fs18 c-success"></i>正在获取服务器...
          </span>
          <div :title="speedRes.best_server" type="text" v-else>{{speedRes.best_server}}</div>
        </div>
      </div>
      <div class="speed-gauge-box">
        <div class="speed-gauge chart_js" id="speed_gauge"></div>
        <el-form :model="baseModel" class="w450 form-box" label-width="220px" ref="baseForm" status-icon>
          <el-form-item label="选择测速接口">
            <el-select class="w110" placeholder="请选择" v-model="baseModel.intf">
              <el-option :key="value" :label="key" :value="value" v-for="(key, value) in intfObj"></el-option>
            </el-select>
          </el-form-item>
          <div class="tc">
            <el-button :loading="btnText === '正在测速...'" @click="onSubmit" class="w160" type="primary">{{btnText}}</el-button>
          </div>
        </el-form>
        <div class="current-detail tc fs18" v-html="currentText"></div>
      </div>
    </div>
  </div>
</template>
<script>
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/gauge'
import { sleep } from '@/utils'
const TICKS = [0, 1, 3, 5, 10, 20, 40, 70, 100]
const Max = 100
const SPLITNUM = 8
const TICKVAL = Max / SPLITNUM

const OPT = {
  series: [
    {
      name: '网速',
      type: 'gauge',
      z: 3,
      min: 0,
      max: Max,
      splitNumber: SPLITNUM,
      radius: '100%',
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          width: 25,
          color: [[0.249, '#91c7ae'], [0.75, '#63869e'], [1, '#c23531']]
          // color: [[0.25, '#00EFAF'], [0.75, '#2BC5FE'], [1, '#FF3E83']]
        }
      },
      axisTick: {
        // 坐标轴小标记
        show: false
      },
      splitLine: {
        // 分隔线
        length: 33, // 属性length控制线长
        lineStyle: {
          width: 3,
          color: 'auto'
        }
      },
      axisLabel: {
        distance: 15,
        backgroundColor: 'auto',
        borderRadius: 2,
        color: '#eee',
        padding: 3,
        textShadowBlur: 2,
        textShadowOffsetX: 1,
        textShadowOffsetY: 1,
        textShadowColor: '#222',
        formatter: function(v) {
          return TICKS[v / TICKVAL]
        }
      },
      title: {
        // 其余属性默认使用全局文本样式，详见TEXTSTYLE
        fontWeight: 'bolder',
        fontSize: 20,
        fontStyle: 'italic'
      },
      detail: {
        // 其余属性默认使用全局文本样式，详见TEXTSTYLE
        fontWeight: 'bolder',
        borderRadius: 3,
        backgroundColor: '#444',
        borderColor: '#aaa',
        shadowBlur: 5,
        shadowColor: '#333',
        shadowOffsetX: 0,
        shadowOffsetY: 3,
        borderWidth: 2,
        textBorderColor: '#000',
        textBorderWidth: 2,
        textShadowBlur: 2,
        textShadowColor: '#fff',
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
        fontFamily: 'Arial',
        width: 100,
        color: '#eee',
        rich: {}
      },
      data: [{ value: 0.0, name: 'Mbit/s' }]
    }
  ]
}
export default {
  name: 'DiagnoseSpeedTest',
  data() {
    return {
      intfObj: {},
      baseModel: {
        intf: 'wan'
      },
      speedRes: {
        client_ip: '0.0.0.0',
        client_isp: '-',
        best_server: '-'
      },
      interval: null,
      isWorking: false,

      count: 0,
      chart: null,
      btnText: '开始测速',
      currentText: ''
    }
  },
  async mounted() {
    this.chart = echarts.init(document.getElementById('speed_gauge'))
    this.chart.setOption(OPT)
  },
  created() {
    this.loadIfaceTypes()
    this._showRes()
  },
  watch: {
    speedRes(res) {
      let v = res.status
      if (v === 'running') {
        this.currentText = '正在获取测速服务器...'
      } else if (v === 'upload') {
        this.currentText = '当前上传速度'
      } else if (v === 'download') {
        this.currentText = '当前下载速度'
      } else if (v === 'finish') {
        this.currentText = `上传=${res.upload}Mbit/s<br/>下载=${res.upload}Mbit/s`
      }
    }
  },
  methods: {
    // 获取wan口信息
    async loadIfaceTypes() {
      const result = await this.$api.getIfaceTypes()
      let intf = {}
      result.forEach(item => {
        intf[`${item}`] = item.toLocaleUpperCase()
      })
      this.intfObj = intf
    },
    onSubmit() {
      this.btnText = '正在测速...'
      this.$api.setSpeedTest(this.baseModel)

      setTimeout(() => {
        this._showRes()
      }, 4000)
    },
    _parseSpeed(speedRes) {
      let speedVal = 0
      speedVal = speedRes[speedRes.status] || '0.0'
      speedVal = parseFloat(speedVal.replace(/\s*Mbit\/s/, ''))
      // speedVal = Math.random() * 50
      this._setGauge(speedVal)
    },
    _setGauge(speedVal) {
      let _v = this._valToShow(speedVal)
      this.chart.setOption({
        series: [
          {
            animationDurationUpdate: 2000,
            detail: {
              formatter: function(value) {
                value = speedVal
                value = (value + '').split('.')
                value.length < 2 && value.push('00')
                return (
                  ('00' + value[0]).slice(-2) +
                  '.' +
                  (value[1] + '00').slice(0, 2)
                )
              }
            },
            data: [{ value: _v, name: 'Mbit/s' }]
          }
        ]
      })
    },
    _valToShow(v) {
      let i = 0,
        t = v
      while (i < TICKS.length && t >= TICKS[i]) {
        i++
      }
      t -= TICKS[--i]
      let sv = 0
      sv = i * TICKVAL
      sv += (t / (TICKS[i + 1] - TICKS[i])) * TICKVAL

      return sv
    },
    // 结果轮询
    async _showRes(isFirst) {
      this.speedRes = await this.$api.getSpeedTest()

      if (
        this.speedRes.status === 'finish' ||
        this.speedRes.status === 'error'
      ) {
        this.btnText = '重新测速'
        this._setGauge(0)
        if (isFirst) {
          // 发现上次测速已结束，设置status空，计算出resMsg为false不显示上次结果
          this.speedRes.status = ''
          this.btnText = '开始测速'
        }
      } else {
        if (isFirst && !this.speedRes.status) {
          // 未执行过测速返回还是空数据时
          return
        }
        this.btnText = '正在测速...'
        let time = this.speedRes.status === 'running' ? 3000 : 1000
        this._parseSpeed(this.speedRes)

        this.interval = setTimeout(() => {
          this._showRes()
        }, time)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.diagnose-speed {
  .gauge-box {
    position: relative;
    width: 976px;
  }
  .speed-gauge-box {
    width: 450px;
    height: 560px;
    margin: 0 260px;
  }
  .current-detail {
    position: relative;
    top: -450px;
    font-weight: bold;
  }
  .speed-gauge {
    width: 100%;
    height: 100%;
  }
  .form-box {
    position: relative;
    top: -125px;
  }
  .L-con,
  .sevinfo-con {
    height: 110px;
    width: 250px;
    padding: 10px 20px;
    font-size: 13px;
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 210;
    border-bottom: 1px solid $border-main;
    border-top: 1px solid $border-main;
  }
  .sevinfo-con {
    right: 20px;
    left: auto;
  }
  .bV-title {
    margin: 6px 0 10px 5px;
    font-size: 15px;
    color: $theme;
    float: left;
  }
}
</style>
