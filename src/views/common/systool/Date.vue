<template>
  <div class="system-date">
    <help-alert json-key="dateJson" title="时间设置">
      <div slot="content">查看和设置系统时间。
        <span class="c-warning">(设备没有RTC模块，重启设备不保存时间。)</span>
      </div>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" class="w500" label-width="160px" ref="baseForm" size="small">
      <el-form-item label="当前时间" prop="time">
        <span v-show="baseModel.time">{{baseModel.time|formatDay}}</span>
      </el-form-item>
      <el-form-item label="设置时间" prop="timeType">
        <el-radio-group v-model="baseModel.timeType">
          <el-radio label="auto">网络获取时间</el-radio>
          <el-radio label="self">手动设置时间</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="时间" prop="selfTime" v-show="baseModel.timeType==='self'">
        <el-date-picker placeholder="选择日期时间" type="datetime" v-model="baseModel.selfTime"></el-date-picker>
        <el-button @click.native="getPcTime" class="ml10" size="small" type="primary">获取主机时间</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :loading="asyncLoading" class="w100" size="small" type="primary" v-auth="onSetTime">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import timer from '@/utils/timer'
import { formatDay } from '@/filters/time'
import { DatePicker } from 'element-ui'
export default {
  name: 'SystemDate',
  data() {
    const selfValidator = (rule, value, cb) => {
      if (this.baseModel.timeType === 'self' && !value) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      asyncLoading: false,
      baseModel: {
        time: '',
        timeType: 'auto',
        selfTime: ''
      },
      baseRules: {
        selfTime: [{ validator: selfValidator, message: '请选择要设置的时间' }]
      }
    }
  },
  mounted() {
    this.onAsyncTime()
  },
  beforeDestroy() {
    timer.clean()
  },
  components: {
    [DatePicker.name]: DatePicker
  },
  filters: {
    formatDay
  },
  methods: {
    // 同步当前pc时间
    getPcTime() {
      this.baseModel.selfTime = new Date()
    },
    // 保存同步时间
    onSetTime() {
      let _date = new Date().getTime()
      this.asyncLoading = true
      if (this.baseModel.timeType === 'self') {
        _date = new Date(this.baseModel.selfTime || null).getTime()
      }
      _date = parseInt(_date / 1000)
      let _jsx = (
        <p class="c-danger">
          请确认您所设置的时间与当前网络时间一致，否则可能导致配置无法同步
        </p>
      )
      this.$msgbox({
        dangerouslyUseHTMLString: true,
        message: _jsx,
        showCancelButton: true,
        title: '提示'
      }).then(
        () => {
          this.$api.setSysTime({ time: _date, force: 'true' }).then(
            () => {
              setTimeout(() => {
                this.asyncLoading = false
                this.onAsyncTime()
              }, 1000)
            },
            () => {
              this.asyncLoading = false
            }
          )
        },
        () => {
          this.asyncLoading = false
        }
      )
    },
    // 同步时间
    onAsyncTime(type) {
      timer.clean()
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.asyncTime().then(d => {
            this.baseModel.time = d * 1000
            timer.setInterval(() => {
              this.baseModel.time += 1000
            }, 1000)
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
