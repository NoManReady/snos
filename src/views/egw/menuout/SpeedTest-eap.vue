<template>
  <div class="diagnose-speed">
    <help-alert json-key title="测速结果和实际带宽可能有误差，建议多测试几次查看带宽。"></help-alert>
    <el-form :model="baseModel" class="w500" label-width="160px" ref="baseForm" status-icon>
      <el-form-item label="选择测速接口">
        <el-select class="w340" placeholder="请选择" v-model="baseModel.intf">
          <el-option :key="value" :label="key" :value="value" v-for="(key, value) in intfObj"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="btnText === '正在测速...'" @click="onSubmit" class="w160" type="primary">{{btnText}}</el-button>
      </el-form-item>
      <template v-if="resMsg">
        <el-form-item label="您的IP地址">
          <label>{{speedRes.client_ip}}</label>
        </el-form-item>
        <el-form-item label="所属运营商">
          <label>{{speedRes.client_isp}}</label>
        </el-form-item>
        <el-form-item label="测速服务器">
          <span v-if="speedRes.best_server == 'NA'">
            <i class="el-icon-loading fs18"></i>正在获取服务器...
          </span>
          <span type="text" v-else>{{speedRes.best_server}}</span>
        </el-form-item>
        <el-form-item label="测速结果">
          <span class="c-success fs14">{{resMsg}}</span>&nbsp;
          <small v-show="speedRes.status === 'finish'">({{speedRes.end_time}})</small>
          <br />下载速度 =
          <span :class="{'c-success': isDownload}">{{speedRes.download}} Mbit/s</span>
          <br />上传速度 =
          <span :class="{'c-success': isUpload}">{{speedRes.upload}} Mbit/s</span>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import timer from '@/utils/timer'
import { sleep } from '@/utils'
export default {
  name: 'DiagnoseSpeed',
  data() {
    const countValidate = (r, v, cb) => {
      if (v && !isBetween(v, 20, 100)) return cb(new Error('超时次数 20~100'))
      cb()
    }
    return {
      intfObj: {},
      baseModel: {
        intf: 'wan'
      },
      speedRes: {},
      interval: null,
      btnText: '开始测速'
    }
  },
  computed: {
    isDownload() {
      return (
        this.speedRes.status === 'download' || this.speedRes.status === 'finish'
      )
    },
    isUpload() {
      return (
        this.speedRes.status === 'upload' || this.speedRes.status === 'finish'
      )
    },
    resMsg() {
      const resMap = {
        running: '计算最优测速服务器...',
        upload: '检测上传速度...',
        download: '检测下载速度...',
        finish: '测速完成'
      }
      let status = this.speedRes.status

      if (resMap[status]) {
        return resMap[status]
      } else if (status === 'error') {
        return this.speedRes.error.replace('NA', '检测失败，请尝试重新检测')
      }
      return false
    }
  },
  beforeDestroy() {
    this.interval && clearTimeout(this.interval)
  },
  created() {
    this.loadIfaceTypes()
    this._showRes(true)
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
    // 开始诊断
    onSubmit() {
      this.btnText = '正在测速...'
      this.$api.setSpeedTest(this.baseModel)

      setTimeout(() => {
        this._showRes()
      }, 4000)
    },
    // 结果轮询
    async _showRes(isFirst) {
      this.speedRes = await this.$api.getSpeedTest()

      if (
        this.speedRes.status === 'finish' ||
        this.speedRes.status === 'error'
      ) {
        this.btnText = '重新测速'
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

        this.interval = setTimeout(() => {
          this._showRes()
        }, time)
      }
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
