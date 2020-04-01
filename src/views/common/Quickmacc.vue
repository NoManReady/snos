<template>
  <div :element-loading-text="loadingMsg" class="quickset" v-loading.fullscreen.lock="!!loadingMsg">
    <app-header :is-macc="true" :title="title" @exit="onExit"></app-header>
    <macc @toHomepage="onToHomepage" class="app-main" ref="macc" v-if="step === 4" />
    <template v-else>
      <div class="app-main quickset-main">
        <div class="block step">
          <transition mode="out-in" name="fade">
            <net-neighbor v-if="step === 1" />
            <wan-wifi @reCheck="onReCheck" @toWechat="step = 3" ref="wanWifi" v-else-if="step === 2" />
            <wechat :pwd="pwd" @toHomepage="onToHomepage" v-else-if="step === 3"></wechat>
          </transition>
        </div>
      </div>
      <div class="app-footer tc quickset-footer">
        <transition mode="out-in" name="fade">
          <div class="quickset-box">
            <template v-if="step == 1">
              <el-button @click.native="onRefresh" plain size="medium">{{ $t("quickset.re_discover") }}</el-button>
              <el-button @click.native="step++" size="medium" type="primary">{{ $t("quickset.begin_cfg") }}</el-button>
            </template>
            <template v-else-if="step == 2">
              <el-button @click.native="step--" size="medium" v-if="!this.isAlone">{{ $t("quickset.prev") }}</el-button>
              <el-button @click.native="onSubmit" size="medium" type="primary">{{ submitText }}</el-button>
            </template>
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>
<script>
import quickMixins from '@/views/common/quickmacc/quickMixins'
import NetNeighbor from './quickmacc/NetNeighbor'
import WanWifi from './quickmacc/WanWifi'
import { AppHeader } from '@/layout'
import Macc from './quickmacc/Macc'
import Wechat from './quickmacc/Wechat'
import { mapGetters, mapActions } from 'vuex'
import { sleep } from '@/utils'
export default {
  name: 'Quickmacc',
  data() {
    return {
      loadingMsg: false,
      pwd: '',
      step: 1,
      maccConnected: 'loading'
    }
  },
  mixins: [quickMixins],
  components: {
    AppHeader,
    NetNeighbor,
    WanWifi,
    Macc,
    Wechat
  },
  computed: {
    ...mapGetters(['cwmpStatus']),
    isSmb() {
      return !this.$store.getters.isIndustry
    },
    title() {
      return (
        [
          I18N.t('quickset.discover_dev'),
          I18N.t('quickset.create_network'),
          I18N.t('quickset.scan_cloud'),
          I18N.t('quickset.whole_new_cfg')
        ][this.step - 1] || I18N.t('quickset.whole_new_cfg')
      )
    },
    isAlone() {
      return this.$roles().includes('alone')
    },
    isEhr() {
      return this.$roles().includes('ehr')
    },
    hasMaccStep() {
      return this.maccConnected === 'false'
    },
    submitText() {
      return {
        loading: I18N.t('quickset.check_cloud_status'),
        false: I18N.t('quickset.create_and_connection'),
        true: I18N.t('quickset.complete_cfg'),
        unset: I18N.t('quickset.cfg_action')
      }[this.maccConnected]
    },
    isRouter() {
      return this.$roles().includes('ROUTER')
    }
  },
  async created() {
    this.step = this.isAlone ? 2 : 1
    if (this.isEhr || !this.isSmb) {
      // 家用路由器和行业版交换机 不走上云流程
      this.maccConnected = 'unset'
    } else {
      await this.getCwmpStatus()
      this.maccConnected = this.cwmpStatus.connected || 'false'
    }
  },
  methods: {
    ...mapActions([
      'getCwmpStatus',
      'getNetworkId',
      'updateNetworkId',
      'setIsDefaultPass',
      'getSysinfo'
    ]),
    async onExit() {
      if (this.step === 4) {
        // 通告MACC
        this.$refs.macc.exitMacc()
      } else {
        // 弹出二次确认退出
        if (!(await this.checkUnSaveExit())) {
          if (this.isAlone) {
            this.onToHomepage()
          } else if (await this.goToHomepage()) {
            this.onToHomepage()
          }
        }
      }
    },
    // 进入eweb首页
    onToHomepage() {
      this.$router.push({
        name: this.isAlone || this.isEhr ? 'admin/alone' : 'admin/home_overview'
      })
    },
    // 重新发现设备
    onRefresh() {
      this.$bus.$emit('LOAD-NETVIEW', { from: 'Quickmacc' })
    },
    // 重新检测网络
    onReCheck() {
      this.checkNetwork()
    },
    // 创建项目并联通网络
    onSubmit() {
      this.$refs.wanWifi.validForm().then(
        async ([data, doConfig]) => {
          let _timeout = doConfig ? 60 : 40 // 共限时60s；跳过配置检测限时 40s
          this.pwd = data.ewebPassword
          if (doConfig) {
            this.loadingMsg = I18N.t('quickset.cfging')
            let _result = await this.$api.setQuickInfo(data, true) // await this.$refs.wanWifi.submit()
            if (_result.ewebPassword === 'ok') {
              this.setIsDefaultPass(false)
            }
            this.updateNetworkId(_result.networkId) // 更新networkId
            this.showTips(data, this.hasMaccStep ? _timeout : 6000) // 提示信息
          }
          // 生效倒计时
          if (this.hasMaccStep) {
            // 非路由模式通过WAN口访问检测接口，wan口要重新获取ip地址生效慢，一般要30s后调用接口才正常
            let _effectTime = this.isRouter ? 15 : 30
            do {
              this.loadingMsg = `${_timeout}s ${I18N.t(
                'quickset.cfg_effecting'
              )}`
              await sleep(1000)
            } while (--_timeout > 60 - _effectTime)
            // 配置下发 _effectTime 秒后检测网络
            this.checkNetwork(_timeout)
          } else {
            if (this.isEhr && this.isSmb) {
              // 家用路由器 提示易点点二维码
              this.loadingMsg = false
              this.step = 3
            } else {
              // 非家用或行业版直接进入首页
              this.onToHomepage()
            }
          }
        },
        _error => {
          if (_error === 'close cancel' || _error === 'unkonwn cancel') {
            // this.$message.info('取消配置')
          }
        }
      )
    },
    async checkNetwork(_timeout = 30) {
      this.loadingMsg = `${_timeout}s ${I18N.t('quickset.check_connect')}`
      let _tInt = setInterval(() => {
        // 超时或者检测完毕清除定时器
        if (--_timeout === 0 || !this.loadingMsg) {
          return clearInterval(_tInt)
        }
        this.loadingMsg = `${_timeout}s ${I18N.t('quickset.check_connect')}`
      }, 1000)

      let _connectOk = await this.$refs.wanWifi.checkNetwork(_timeout)
      this.loadingMsg = false

      this.msgTips && this.msgTips.close()
      if (_connectOk) {
        await this.getNetworkId() // 更新networkId
        this.getSysinfo() // 更新sysinfo
        await sleep(3000) // 延迟3秒后跳转
        this.step = 4 // 网络连通正常直接跳转到MACC页面
      }
    },
    showTips(data, time) {
      let _tips = []
      if (data.wireless) {
        let _masterSsid = data.wireless.ssidList.find(
          ssid => ssid.wlanId === '1'
        )
        _tips.push(
          `<li class="mt5">${I18N.t('quickset.re_connect_wifi', {
            ssid: _masterSsid.ssidName
          })}</li>`
        )
      }
      // 非路由模式的主设备通过wan口访问，wan口地址若变化，需提示刷新
      if (!this.isRouter) {
        let _isMaster = top.APP_ROLES.includes('master') // 当前登录的是否主设备
        _tips.push(
          `<li class="mt5 c-warning">${I18N.t('quickset.ip_change_tip', {
            msg: _isMaster
              ? I18N.t('quickset.ip_change_msg1')
              : I18N.t('quickset.ip_change_msg2')
          })}</li>`
        )
      }
      if (_tips.length > 0) {
        this.msgTips = this.$message({
          dangerouslyUseHTMLString: true,
          message: `<ol class="ml20 ${
            _tips.length > 1 ? 'ol-num' : ''
          }">${_tips.join('')}</ol>`,
          showClose: true,
          center: true,
          duration: time
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_mixins.scss';
@import '~@/style/utils/_variable.scss';
.quickset {
  @extend %position-absolute;
  .quickset-tit {
    @include text-middle(60px);
    padding: 0;
    background: $theme;
    box-shadow: 0 1px 5px 0 #999;
    color: #fff;
  }
  .quickset-main {
    margin-bottom: 62px !important;
    overflow-y: auto;
    .step {
      margin: 30px 24px 0;
      padding: 28px 8% 10px;
      min-height: calc(100% - 30px);
    }
  }
  .quickset-footer {
    .el-button {
      min-width: 40%;
    }
    height: 62px;
    line-height: 62px;
  }
  .quickset-box {
    width: 40%;
    margin: 0 auto;
  }
  @media screen and (max-width: 768px) {
    .quickset-box {
      width: 100%;
      margin: 0 auto;
    }
  }
}
</style>
