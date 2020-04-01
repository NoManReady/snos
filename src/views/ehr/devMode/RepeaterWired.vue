<template>
  <div class="repeater">
    <help-alert jsonKey title="有线中继">
      <div slot="content">
        <p>通过有线中继功能，主、从路由器之间可以使用有线进行连接，以扩展网络的覆盖范围。</p>
        <p class="c-danger" v-if="!hasWanLink">WAN口未插网线，请将本路由器WAN口连接上级路由器LAN口。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <div class="box-header-tit">
          <span class="vm">有线中继</span>
        </div>
      </div>
      <el-form
        :label-width="labelWidth"
        :model="repeaterStatus"
        class="w500"
        size="medium"
        v-if="repeaterStatus.enable === 'true'"
      >
        <el-form-item label="中继状态">
          <label class="c-success-green" v-if="repeaterStatus.status === 'true'">中继完成</label>
          <label class="c-warning" v-else>中继失败</label>
        </el-form-item>
        <el-form-item label="IP地址">
          <label>{{repeaterStatus.network.ipaddr}}</label>
        </el-form-item>
        <el-form-item label="子网掩码">
          <label>{{repeaterStatus.network.netmask}}</label>
        </el-form-item>
        <el-form-item label="DNS服务器">
          <div :key="v" v-for="v in repeaterStatus.network.dns">{{v}}</div>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetWiredRepeater" class="w160" type="primary">更改中继</el-button>
        </el-form-item>
      </el-form>
      <el-form
        :label-width="labelWidth"
        :model="detect"
        :rules="baseRules"
        class="w500"
        ref="baseForm"
        size="medium"
        v-else-if="hasCheckOk"
      >
        <el-form-item label="网线连接状态">
          <p class="c-success-green" v-if="detect.wanLink === 'up'">网线已连接</p>
          <p class="c-warning" v-else>网线未连接</p>
          <p class="c-success-green" v-if="detect.detectIp">{{$t('ehr.repeater.device_ip',{ip:detect.detectIp})}}</p>
        </el-form-item>
        <el-form-item label="本路由Wi-Fi名称" prop="wifi.ssid">
          <el-input v-model="detect.wifi.ssid"></el-input>
        </el-form-item>
        <el-form-item label="本路由Wi-Fi密码" prop="wifi.key">
          <el-input clearable placeholder="不填表示不加密" show-password v-model="detect.wifi.key"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="isLoading"
            :element-loading-text="loadingMsg"
            @click="onSubmit"
            class="w160"
            element-loading-background="rgba(255, 255, 255, .5)"
            type="primary"
            v-loading.fullscreen.lock="!!loadingMsg"
          >保存</el-button>
        </el-form-item>
      </el-form>
      <el-form :label-width="labelWidth" size="medium" v-else-if="!isLoading">
        <el-form-item label="中继状态">
          <label class="c-warning">
            <p>当前未开启“有线中继”模式</p>
            <p>1、开始检测网络环境；</p>
            <p>2、设置本路由的Wi-Fi；</p>
            <p>3、点击保存，完成模式切换。</p>
          </label>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="isLoading"
            :element-loading-text="loadingMsg"
            @click="getDetect"
            class="w160"
            element-loading-background="rgba(255, 255, 255, .5)"
            type="primary"
            v-loading.fullscreen.lock="!!loadingMsg"
          >开始检测网络环境</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import {
  ssidNameValidator,
  passwdValidator,
  wifiNameValidator
} from '@/utils/rules'
import { sleep, awaitOnLine_plus } from '@/utils'
export default {
  name: 'repeaterWired',
  props: {
    showSwitch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const ssidValidtor = [
      { validator: wifiNameValidator },
      { validator: ssidNameValidator, size: 32 }
    ]
    return {
      isLoading: true,
      loadingMsg: false,
      hasCheckOk: false,
      hasWanLink: true,
      labelWidth: '160px',
      detect: {
        wifi: {
          ssid: '',
          key: ''
        },
        detectIp: '',
        wanLink: ''
      },
      repeaterStatus: {
        status: 'false',
        network: {
          netmask: '',
          ipaddr: '',
          dns: []
        },
        enable: 'false'
      },
      baseRules: {
        'wifi.ssid': [
          {
            required: true,
            message: I18N.t('overview.wifi_no_empty'),
            whitespace: true
          },
          ...ssidValidtor
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
  methods: {
    async isWanLink() {
      let _res = await this.$api.cmd('devSta.get', {
        module: 'port_status'
      })
      this.hasWanLink = (_res.List || []).some(
        p => p.name === 'WAN' && p.status === 'on'
      )
      if (!this.hasWanLink) {
        return this.$confirm(
          'WAN口未插网线，请将本路由器WAN口连接上级路由器LAN口。',
          `检测到当前WAN口未插网线`,
          {
            cancelButtonText: '我不切换模式',
            confirmButtonText: '我已连接网线',
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
    // 获取中继状态信息
    async _getRepeaterStatus() {
      this.isLoading = true
      try {
        let _res = await this.$api.cmd('devSta.get', {
          module: 'wired_repeater_status'
        })
        this.repeaterStatus = Object.assign({}, this.repeaterStatus, _res)
      } finally {
        this.isLoading = false
      }
    },
    resetWiredRepeater() {
      this.repeaterStatus.enable = 'false'
      this.hasCheckOk = false
    },
    getDetect() {
      return new Promise(async (resolve, reject) => {
        if ((await this.isWanLink()) === 'cancel') {
          return
        }
        this.loadingMsg = this.$t('ehr.repeater.checking')
        let _detect = await this.$api.cmd(
          'devSta.get',
          {
            module: 'wired_repeater_detect'
          },
          { timeout: 0, isSilence: true }
        )
        this.detect = _detect
        if (_detect.detectIp && _detect.wanLink === 'up') {
          this.$message.success(
            this.$t('ehr.repeater.check_success', { ip: _detect.detectIp })
          )
          this.hasCheckOk = true
          resolve(_detect.detectIp)
        } else {
          this.$alert(
            `${_detect.wanLink !== 'up' ? '<p>网线未连接</p>' : ''}
             ${
               !_detect.detectIp
                 ? '<p>未分配到IP地址，可能<strong>上联DHCP地址分配异常</strong></p>'
                 : ''
             }`,
            '中继环境不满足',
            {
              dangerouslyUseHTMLString: true,
              type: 'warning'
            }
          )
          this.hasCheckOk = false
          resolve(false)
        }
        this.loadingMsg = false
      })
    },
    async onSubmit() {
      if ((await this.isWanLink()) === 'cancel') {
        return
      }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.loadingMsg = this.$t('ehr.repeater.config_setting')
          this.$api.cmd(
            'devSta.set',
            {
              module: 'wired_repeater_finish',
              data: {
                wifi: {
                  ssid: this.detect.wifi.ssid,
                  key: this.detect.wifi.key
                }
              }
            },
            { isSilence: true }
          ).catch()
          this.loadingMsg = this.$t('ehr.repeater.wifi_has_setted')
          await sleep(12000)
          this.awaitOk(this.detect.detectIp)
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
        await sleep(4000)
        window.top.location.href = `http://${ip}`
      })
    }
  }
}
</script>
<style lang="scss">
</style>
