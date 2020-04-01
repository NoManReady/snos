<template>
  <div class="diagnose-speed">
    <help-alert :title="$t('egw.test_error_tip')" json-key></help-alert>
    <el-form :model="baseModel" class="w500" label-width="160px" ref="baseForm" size="medium" status-icon>
      <el-form-item :label="$t('egw.select_speedTest')">
        <el-select :placeholder="$t('action.select')" class="w340" v-model="baseModel.intf">
          <el-option :key="value" :label="key" :value="value" v-for="(key, value) in intfObj"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="btnText === $t('egw.speedtesting')" @click="onSubmit" class="w160" type="primary">{{btnText}}</el-button>
      </el-form-item>
      <template v-if="resMsg">
        <el-form-item :label="$t('egw.your_ip')">
          <label>{{speedRes.client_ip}}</label>
        </el-form-item>
        <el-form-item :label="$t('egw.beyond_manage')">
          <label>{{speedRes.client_isp}}</label>
        </el-form-item>
        <el-form-item :label="$t('egw.test_service')">
          <span v-if="speedRes.best_server == 'NA'">
            <i class="el-icon-loading fs18"></i>
            {{$t('egw.getting_service')}}
          </span>
          <span type="text" v-else>{{speedRes.best_server}}</span>
        </el-form-item>
        <el-form-item :label="$t('egw.result_test')">
          <span class="c-success fs14">{{resMsg}}</span>&nbsp;
          <small v-show="speedRes.status === 'finish'">({{speedRes.end_time}})</small>
          <br />
          {{$t('egw.download_speed')}}
          <span :class="{'c-success': isDownload}">{{speedRes.download}} Mbit/s</span>
          <br />
          {{$t('egw.update_speed')}}
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
      if (v && !isBetween(v, 20, 100))
        return cb(new Error(I18N.t('egw.exceeding_number_tip')))
      cb()
    }
    return {
      intfObj: {},
      baseModel: {
        intf: 'wan'
      },
      speedRes: {},
      interval: null,
      btnText: I18N.t('egw.speedtest_start')
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
        running: I18N.t('egw.calculate_test_service'),
        upload: I18N.t('egw.check_update_speed'),
        download: I18N.t('egw.check_download_speed'),
        finish: I18N.t('egw.test_finish')
      }
      let status = this.speedRes.status

      if (resMap[status]) {
        return resMap[status]
      } else if (status === 'error') {
        return this.speedRes.error.replace('NA', I18N.t('egw.check_error_tip'))
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
      this.btnText = I18N.t('egw.speedtesting')
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
        this.btnText = I18N.t('egw.speedtest_sencond')
        if (isFirst) {
          // 发现上次测速已结束，设置status空，计算出resMsg为false不显示上次结果
          this.speedRes.status = ''
          this.btnText = I18N.t('egw.speedtest_start')
        }
      } else {
        if (isFirst && !this.speedRes.status) {
          // 未执行过测速返回还是空数据时
          return
        }
        this.btnText = I18N.t('egw.speedtesting')
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
