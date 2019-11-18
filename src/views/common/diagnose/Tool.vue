<template>
  <div class="diagnose-tool">
    <help-alert json-key="networkTool" title="网络工具"></help-alert>
    <el-form :model="baseModel" :rules="baseRules" class="w500" label-width="160px" ref="baseForm" size="small" status-icon>
      <el-form-item label="诊断方式">
        <el-radio-group :disabled="isWorking" v-model="baseModel.type">
          <el-radio label="1">PING通信</el-radio>
          <el-radio label="2">路由跟踪</el-radio>
          <el-radio label="3">域名查询</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="目的IP/域名" prop="target">
        <el-input placeholder="www.baidu.com" prop v-model="baseModel.target"></el-input>
      </el-form-item>
      <template v-if="baseModel.type==='1'">
        <el-form-item label="PING次数" prop="count">
          <el-input placeholder="1~50" prop v-model="baseModel.count"></el-input>
          <span></span>
        </el-form-item>
        <el-form-item label="PING数据包大小" prop="size">
          <el-input placeholder="4~1472 Bytes" prop v-model="baseModel.size"></el-input>
        </el-form-item>
      </template>
      <template v-if="baseModel.type==='2'">
        <el-form-item label="路由跟踪最大TTL" prop="ttl">
          <el-input placeholder="1~30" prop v-model="baseModel.ttl"></el-input>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isWorking" @click.native="onSubmit" size="small" type="primary">{{isWorking ? "正在检测" : "开始检测"}}</el-button>
        <el-button :disabled="!isWorking" @click.native="onPause" size="small" type="primary">停止检测</el-button>
      </el-form-item>
    </el-form>
    <el-input
      :autosize="{ minRows: 6, maxRows: 12}"
      :readonly="true"
      class="result"
      placeholder="检测结果"
      type="textarea"
      v-model="result"
    ></el-input>
  </div>
</template>
<script>
import { urlValidator, rangeValidator } from '@/utils/rules'
import { isIp } from '@/utils/rulesUtils'
import timer from '@/utils/timer'
export default {
  name: 'DiagnoseTool',
  data() {
    return {
      baseModel: {
        type: '1',
        count: '4',
        size: '64',
        ttl: '20',
        target: ''
      },
      baseRules: {
        target: [
          { required: true, message: '请输入目的IP/域名', whitespace: true },
          {
            validator: urlValidator,
            message: '请输入正确的IP或域名',
            whitespace: true
          }
        ],
        count: [
          { required: true, message: '请输入PING次数', whitespace: true },
          { validator: rangeValidator, min: 1, max: 50 }
        ],
        size: [
          { required: true, message: '请输入数据包大小', whitespace: true },
          { validator: rangeValidator, min: 4, max: 1472 }
        ],
        ttl: [
          { required: true, message: '请输入最大TTL', whitespace: true },
          { validator: rangeValidator, min: 1, max: 30 }
        ]
      },
      result: '',
      isWorking: false,
      resultHolder: '正在检测...'
    }
  },
  created() {
    if (this.$dev() === 'est') {
      this._getWanInfo()
    } else {
      this.baseModel.target = 'www.baidu.com'
    }
  },
  beforeDestroy() {
    this.$api.diagnose('clearDiagnoseTool')
    timer.clean()
  },
  watch: {
    'baseModel.type'() {
      this.result = ''
    }
  },
  methods: {
    // 获取wan口信息
    async _getWanInfo() {
      let _result = await this.$api.getNetworkByType('wan')
      let _wan1 = _result[0]
      if (_wan1.proto === 'static') {
        this.baseModel.target = _wan1.gateway
      } else {
        this.baseModel.target = '10.10.10.10'
      }
    },
    // 停止诊断
    onPause() {
      this.$api.diagnose('clearDiagnoseTool').then(d => {
        this.isWorking = false
        timer.clean()
        if (this.result === this.resultHolder) {
          this.result = ''
        }
      })
    },
    // 开始诊断
    onSubmit() {
      this.$refs.baseForm.validate(d => {
        if (d) {
          this.isWorking = true
          this.result = this.resultHolder
          if (this.baseModel.type == '1') {
            this.$api
              .diagnose('ping', this.baseModel, { isSilence: true, timeout: 0 })
              .then(d => {
                if (d != 0) {
                  timer.clean()
                  this.isWorking = false
                  if (d === 1) this.result = 'PING通信失败，请检查网络'
                }
              })
            this._showRes()
          } else if (this.baseModel.type == '2') {
            this.$api
              .diagnose('traceroute', this.baseModel, {
                isSilence: true,
                timeout: 0
              })
              .then(d => {
                if (d != 0) {
                  timer.clean()
                  this.isWorking = false
                  if (d === 1) this.result = '路由跟踪失败，请检查网络'
                }
              })
            this._showRes()
          } else if (this.baseModel.type == '3') {
            this.$api
              .diagnose('nslookup', this.baseModel, { isSilence: true })
              .then(d => {
                this.isWorking = false
                this.result = d.res
              })
          }
        }
      })
    },
    // 结果轮询
    _showRes() {
      let count = 0
      let ttl = this.baseModel.ttl
      timer.setInterval(() => {
        this.$api
          .diagnose('getDiagnoseRes', null, { isSilence: true })
          .then(res => {
            let d = res.res
            if (d != '') {
              this.result = d
            }
            if (this.baseModel.type == '1') {
              if (d.indexOf(' packet loss') != -1) {
                timer.clean()
                this.isWorking = false
              }
            } else if (this.baseModel.type == '2') {
              let tmp = d.split('\n')
              let line = tmp[tmp.length - 1].trim()
              let line2 = tmp[tmp.length - 2].trim() //有时会出现多一行乱码的情况

              if (line.indexOf(ttl) === 0 || line2.indexOf(ttl) === 0) {
                timer.setTimeout(() => {
                  timer.clean()
                  this.isWorking = false
                }, 15000)
              } else if (isIp(this.baseModel.target)) {
                let mask = this.baseModel.target.replace(/(.+)\.(\d+)/, '$1.')
                if (line.indexOf(mask) != -1) {
                  // 未到最大TTL就完成跟踪
                  timer.clean()
                  this.isWorking = false
                }
              }
            }
          })
      }, 1000)
    }
  }
}
</script>
<style lang="scss" scoped>
.result {
  width: 450px;
  margin-left: 50px;
}
</style>
