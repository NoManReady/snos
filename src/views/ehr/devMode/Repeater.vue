<template>
  <div class="repeater">
    <help-alert :title="$t('ehr.repeater.repeater')" jsonKey>
      <div slot="content">
        <ul class="ul-tips ml20">
          <li>通过无线中继功能，主、从路由器之间可以使用无线进行连接，以扩展无线网络的覆盖范围。</li>
          <li>当成功切换到无线中继模式，本路由器将作为从路由器进行无线中继。</li>
        </ul>
        <p class="c-warning">注意：如果中继到我司相关系列的路由器，无线配置将会被覆盖。</p>
        <p class="c-danger" v-if="hasWanLink">为避免出现环路等网络问题，请将WAN口网线拔出。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <div class="box-header-tit">
          <span class="vm">{{$t('ehr.repeater.repeater')}}</span>
        </div>
      </div>
      <el-form :model="repeaterStatus" :rules="baseRules" class="w500" label-width="160px" ref="baseForm" size="medium">
        <el-form-item :label="$t('ehr.repeater.repeater_switch')" v-if="false">
          <el-switch :value="repeaterStatus.repeater.enable" @click.native="onSwitch" active-value="true" inactive-value="false"></el-switch>
          <template v-if="!isLoading && repeaterStatus.repeater.enable === 'true' && curStatus === 'true'">
            <el-tooltip effect="light" placement="right" v-if="repeaterStatus.repeater.status === 'true'">
              <div slot="content">
                <p>{{$t('ehr.repeater.device_ip',{ip:repeaterStatus.deviceIp || '-'})}}</p>
              </div>
              <strong class="c-success">
                {{$t('ehr.repeater.repeater_action')}}
                <i class="el-icon-info"></i>
              </strong>
            </el-tooltip>
            <el-tooltip effect="light" placement="right" v-else>
              <div slot="content">
                <p>{{$t('ehr.repeater.check_success_tip2')}}</p>
                <p>{{$t('ehr.repeater.check_success_tip3')}}</p>
              </div>
              <strong class="c-warning">
                {{$t('ehr.repeater.repeater_fail')}}
                <i class="el-icon-info"></i>
              </strong>
            </el-tooltip>
          </template>
        </el-form-item>
        <el-form-item label="中继状态">
          <label class="c-success-green" v-if="repeaterStatus.repeater.status === 'true'">
            <p>{{$t('ehr.repeater.repeater_action')}}</p>
            <p>{{$t('ehr.repeater.device_ip',{ip:repeaterStatus.deviceIp || '-'})}}</p>
          </label>
          <label class="c-warning" v-else>
            <p>当前未开启“无线中继”模式</p>
            <p>1、选择附近的Wi-Fi；</p>
            <p>2、设置本路由的Wi-Fi；</p>
            <p>3、点击保存，完成模式切换。</p>
          </label>
        </el-form-item>
        <template v-if="repeaterStatus.repeater.enable === 'true'">
          <el-form-item :label="$t('ehr.repeater.wifi_master')" prop="repeater.ssid">
            <strong>{{repeaterStatus.repeater.ssid}}</strong>
            <repeater-scan @select="setRepeater" v-model="repeaterStatus.repeater.ssid">
              <template slot="title">
                <el-button plain size="small" type="primary">{{$t('ehr.repeater.selecte_wifi')}}</el-button>
              </template>
            </repeater-scan>
          </el-form-item>
          <el-form-item :label="$t('ehr.repeater.wifi_pwd')" prop="repeater.wpaPsk" v-if="needAuth">
            <el-input clearable show-password v-model="repeaterStatus.repeater.wpaPsk">
              <!-- <template slot="append">
                <el-button @click="getDetect" type="primary">{{$t('ehr.repeater.check')}}</el-button>
              </template>-->
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('ehr.repeater.new_wifi')">
            <el-radio-group @change="changeNewType" size="small" v-model="newType">
              <el-radio label="same">{{$t('ehr.repeater.same_wifi')}}</el-radio>
              <el-radio label="new">{{$t('ehr.repeater.new_wifi_set')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="newType === 'new'">
            <el-form-item :label="$t('ehr.repeater.new_wifi_name')" prop="wifi.ssid">
              <el-input v-model="repeaterStatus.wifi.ssid"></el-input>
            </el-form-item>
            <el-form-item :label="$t('ehr.repeater.new_wifi_pwd')" prop="wifi.key">
              <el-input
                :placeholder="$t('ehr.repeater.no_entry_empty')"
                clearable
                show-password
                v-model="repeaterStatus.wifi.key"
              ></el-input>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button
              :disabled="isLoading"
              :element-loading-text="loadingMsg"
              @click="onSubmit"
              class="w160"
              element-loading-background="rgba(255, 255, 255, .5)"
              type="primary"
              v-loading.fullscreen.lock="!!loadingMsg"
            >{{$t('action.save')}}</el-button>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </div>
</template>
<script>
import RepeaterScan from './RepeaterScan'
import {
  ssidNameValidator,
  passwdValidator,
  wifiNameValidator
} from '@/utils/rules'
import { sleep, awaitOnLine_plus } from '@/utils'
export default {
  name: 'repeater',
  data() {
    const localWifiValidator = (rule, value, cb) => {
      if (value === this.repeaterStatus.repeater.ssid) {
        return cb(new Error(this.$t('ehr.repeater.same_wifi_error')))
      }
      cb()
    }
    return {
      isLoading: true,
      loadingMsg: false,
      curStatus: false,
      needAuth: true,
      newType: 'same',
      hasWanLink: false,
      repeaterStatus: this.defRepeaterStatus(),
      repeater: {},
      baseRules: {
        'repeater.ssid': [
          {
            required: true,
            message: this.$t('ehr.repeater.wifi_is_required'),
            trigger: 'change'
          }
        ],
        'wifi.ssid': [
          {
            required: true,
            message: I18N.t('overview.wifi_no_empty'),
            whitespace: true
          },
          { validator: localWifiValidator },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 }
        ],
        'wifi.key': [
          { validator: passwdValidator },
          { min: 8, max: 16, message: I18N.t('overview.wifipass_rule') }
        ]
      }
    }
  },
  async created() {
    await this.isWanLink()
    this._getRepeaterStatus()
  },
  components: {
    [RepeaterScan.name]: RepeaterScan
  },
  methods: {
    async isWanLink() {
      let _res = await this.$api.cmd('devSta.get', {
        module: 'port_status'
      })
      this.hasWanLink = (_res.List || []).some(
        p => p.name === 'WAN' && p.status === 'on'
      )
      if (this.hasWanLink) {
        return this.$confirm(
          '为避免出现环路等网络问题，请将WAN口网线拔出。',
          `检测到当前WAN口有连接网线`,
          {
            cancelButtonText: '我不切换模式',
            confirmButtonText: '我已拔出网线',
            closeOnClickModal: false
          }
        )
          .then(async _ok => {
            return await this.isWanLink()
          })
          .catch(action => {
            return 'cancel'
          })
      }
    },
    defRepeaterStatus() {
      return {
        repeater: {
          // 无线中继信息
          radio: '',
          ssid: '',
          repeaterstatus: 'false',
          wpaPsk: '',
          enable: 'false'
        },
        wifi: {
          // 本机的无线信息
          key: '',
          ssid: ''
        }
      }
    },
    // 获取中继状态信息
    async _getRepeaterStatus() {
      this.isLoading = true
      try {
        let _res = await this.$api.cmd('devSta.get', {
          module: 'repeater_status'
        })
        this.curStatus = _res.repeater.enable
        // 未启用时，置空让用户选择附近的Wi-Fi
        if (
          _res.repeater.status === 'false' &&
          _res.repeater.enable === 'false'
        ) {
          _res.repeater.ssid = ''
          _res.repeater.wpaPsk = ''
        }
        this.repeaterStatus = _res
        this.repeaterStatus.repeater.enable = 'true' // 模式切换直接设置为开启
        if (_res.repeater && _res.repeater.ssid) {
          this.setRepeater(_res.repeater)
        }
        // 判断本机Wi-Fi是否和扩展Wi-Fi一样
        this.newType =
          !!_res.wifi.ssid && _res.repeater.ssid !== _res.wifi.ssid
            ? 'new'
            : 'same'
      } finally {
        this.isLoading = false
      }
    },
    setRepeater(repeater) {
      this.repeater = { ...repeater }
      this.repeaterStatus.repeater.ssid = repeater.ssid
      this.needAuth = repeater.authMode !== 'OPEN'
      if (!this.needAuth) {
        this.repeaterStatus.repeater.wpaPsk = ''
      }
    },
    getDetect() {
      return new Promise(async (resolve, reject) => {
        if ((await this.isWanLink()) === 'cancel') {
          return
        }
        if (!this.repeaterStatus.repeater.ssid) {
          return this.$message.warning(this.$t('ehr.repeater.wifi_is_required'))
        }
        this.loadingMsg = this.$t('ehr.repeater.wifi_info_set')
        if (this.repeater.rssi) {
          delete this.repeater.rssi
        }
        let _hostrouter = {
          repeater: {
            enable: 'true',
            ...this.repeater,
            wpaPsk: this.repeaterStatus.repeater.wpaPsk
          },
          radio: this.repeater.radio
        }
        if (_hostrouter.repeater.ssid === '********') {
          _hostrouter.repeater.ssid = '@Ruijie-Repeater'
        }
        if (_hostrouter.repeater.wpaPsk === '********') {
          _hostrouter.repeater.wpaPsk = 'qwEr1234'
        }
        await this.$api.cmd(
          'devConfig.set',
          {
            module: 'repeater_hostrouter',
            data: _hostrouter
          },
          { isSilence: true }
        )
        await sleep(1000)
        this.loadingMsg = this.$t('ehr.repeater.checking')

        let _detect = await this.$api.cmd(
          'devSta.get',
          {
            module: 'repeater_detect'
          },
          { timeout: 0, isSilence: true }
        )
        if (_detect.detectIp) {
          this.$message.success(
            this.$t('ehr.repeater.check_success', { ip: _detect.detectIp })
          )
          resolve(_detect.detectIp)
        } else {
          this.$alert(
            `<p>${this.$t('ehr.repeater.check_res_tip2')}</p>
            <p>${this.$t('ehr.repeater.check_res_tip3')}</p>
            <p>${this.$t('ehr.repeater.check_res_tip4')}</p> `,
            this.$t('ehr.repeater.check_res_tip'),
            {
              dangerouslyUseHTMLString: true,
              type: 'warning'
            }
          )
          resolve(false)
        }
        this.loadingMsg = false
      })
    },
    changeNewType(v = 'same') {
      if (v === 'same') {
        this.repeaterStatus.wifi.ssid = this.repeaterStatus.repeater.ssid
        this.repeaterStatus.wifi.key = this.repeaterStatus.repeater.wpaPsk
      } else {
        this.repeaterStatus.wifi.ssid = ''
        this.repeaterStatus.wifi.key = ''
      }
    },
    onSwitch() {
      if (this.repeaterStatus.repeater.enable === 'false') {
        return (this.repeaterStatus.repeater.enable = 'true')
      } else if (this.curStatus === 'false') {
        return (this.repeaterStatus.repeater.enable = 'false')
      }
      this.$confirm(this.$t('ehr.repeater.close_wifi_confirm')).then(
        _ok => {
          this.$api
            .cmd('devSta.set', {
              module: 'repeater_switch',
              data: {
                switch: 'off',
                radio: this.repeaterStatus.repeater.radio
              }
            })
            .then(async _ => {
              this.loadingMsg = this.$t('ehr.repeater.close_wifi_action')
              await sleep(13000)
              this.awaitOk()
            })
        },
        _cancel => {}
      )
    },
    async onSubmit() {
      if ((await this.isWanLink()) === 'cancel') {
        return
      }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _detectIp = await this.getDetect()
          if (_detectIp) {
            this.loadingMsg = this.$t('ehr.repeater.config_setting')
            if (this.newType === 'same') {
              this.changeNewType()
            }
            await sleep(1000)
            this.$api
              .cmd(
                'devSta.set',
                {
                  module: 'repeater_finish',
                  data: { wifi: this.repeaterStatus.wifi }
                },
                { isSilence: true }
              )
              .catch()
            this.loadingMsg = this.$t('ehr.repeater.wifi_has_setted')
            await sleep(15000)
            this.repeaterStatus.deviceIp = _detectIp
            this.repeaterStatus.repeater.enable = 'true'
            this.repeaterStatus.repeater.status = 'true'
            this.curStatus = this.repeaterStatus.repeater.enable
            this.awaitOk(_detectIp)
          }
        } else {
          this.$message.warning(this.$t('ehr.repeater.check_fail'))
        }
      })
    },
    awaitOk(ip = '192.168.110.1') {
      this.loadingMsg = false
      awaitOnLine_plus({
        time: 3000,
        text: `检测 ${ip} 的连通性`,
        host: ip,
        maxTry: 10
      }).then(async () => {
        this.loadingMsg = '自动跳转中...'
        await sleep(6000)
        window.top.location.href = `http://${ip}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.repeater {
  .ul-tips {
    li {
      list-style-type: disc;
    }
  }
}
</style>
