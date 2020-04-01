<template>
  <div :element-loading-text="loadingMsg" class="quickset" v-loading.fullscreen.lock="!!loadingMsg">
    <app-header :is-macc="true" :title="title" @exit="onExit">
      <a slot="exitText">{{step === 4 ? '完成' : '退出'}}</a>
    </app-header>
    <div :class="{'main-mb': step < 4}" class="app-main quickset-main">
      <div class="step">
        <transition mode="out-in" name="fade">
          <m-net-view :is-quick="true" v-if="step === 1" />
          <m-network :is-quick="true" @post="getMsgFromNetwork" ref="mNetwork" v-else-if="step === 2"></m-network>
          <m-wifi :is-quick="true" @toNetwork="step = 2" ref="mWifi" v-else-if="step === 3"></m-wifi>
          <m-wechat :base-model="wechat" @toHomepage="onToHomepage" v-else-if="step === 4"></m-wechat>
        </transition>
      </div>
    </div>
    <div class="app-footer tc quickset-footer" v-show="hasFooter">
      <transition mode="out-in" name="fade">
        <div class="quickset-box">
          <template v-if="step == 1">
            <el-button
              :disabled="isCheckingNet"
              :loading="isCheckingNet"
              @click.native="step = isConnectOk ? 3 : 2"
              class="start"
              size="medium"
              type="primary"
            >{{ isCheckingNet ? '检测联网状态' : '开始配置'}}</el-button>
          </template>
          <template v-else-if="step <= 3">
            <el-button @click.native="onPreStep" size="medium">上一步</el-button>
            <el-button :loading="loading" @click.native="onNextStep" size="medium" type="primary">{{nextStepText}}</el-button>
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import quickMixins from '@/views/common/quickmacc/quickMixins'
import { AppHeader } from '@/layout'
import MNetView from './quick/MNetView'
import MNetwork from './quick/MNetwork'
import MWifi from './quick/MWifi'
import MWechat from './quick/MWechat'
import { mapGetters } from 'vuex'
import { sleep } from '@/utils'
export default {
  name: 'MQuick',
  data() {
    return {
      loading: false,
      loadingMsg: false,
      hasFooter: true,
      isSameConifg: true,
      pwd: '',
      step: 1,
      connect: '',
      baseModel: {
        network: false,
        wireless: false,
        ewebPassword: false
      },
      wechat: {}
    }
  },
  mixins: [quickMixins],
  components: {
    AppHeader,
    MNetView,
    MNetwork,
    MWifi,
    MWechat
  },
  computed: {
    ...mapGetters(['netStatus']),
    title() {
      return (
        ['发现设备', '上网方式', '无线设置', '扫码上云'][this.step - 1] ||
        '快速配置'
      )
    },
    isCheckingNet() {
      return this.netStatus.connnected === ''
    },
    isConnectOk() {
      return this.netStatus.connnected === 'true'
    },
    nextStepText() {
      return this.step < 4 ? '下一步' : '下发配置'
    }
  },
  async created() {
    this.step = 1
  },
  methods: {
    async onExit() {
      if (this.step === 4) {
        if (await this.checkConnectWifi()) {
          this.onToHomepage()
        }
      } else {
        // 退出配置未保存提示
        if (!(await this.checkUnSaveExit())) {
          this.onToHomepage()
        }
      }
    },
    // 上网设置页面点击时间
    getMsgFromNetwork(data) {
      if (data.footer !== undefined) {
        this.hasFooter = data.footer
      } else if (data.loadingMsg !== undefined) {
        this.loadingMsg = data.loadingMsg
      } else if (data.loading !== undefined) {
        this.loading = data.loading
      }
    },
    // 完成手机配置，跳转到首页前提示连接Wi-Fi
    async checkConnectWifi() {
      if (this.isSameConifg) {
        // 未下发配置就不提示重连无线
        return true
      }
      let _doConnectWifi = true
      try {
        _doConnectWifi =
          (await this.$confirm(
            `<p>请确认您手机已联上以下Wi-Fi</p>
             <p class="fs16 bolder">${this.wechat.masterSsid.ssidName}
              ${this.wechat.ssidName5G && ' 或 ' + this.wechat.ssidName5G}</p>
             <p class="c-warning">否则页面将访问失败！</p>`,
            '完成配置，进入首页',
            {
              showCancelButton: false,
              dangerouslyUseHTMLString: true,
              confirmButtonText: '我已连上Wi-Fi，去首页看看吧',
              closeOnClickModal: false
            }
          )) === 'confirm'
      } catch (error) {
        _doConnectWifi = false
      }
      return _doConnectWifi
    },
    // 进入eweb首页
    onToHomepage() {
      this.$router.push({
        name: 'm/main'
      })
    },
    // 上一步
    onPreStep() {
      if (this.step === 3 && this.isConnectOk) {
        return (this.step = 1)
      }
      this.step--
    },
    // 下一步
    onNextStep() {
      if (this.step === 2) {
        // 上网方式
        this.$refs.mNetwork.onSave().then(async isOk => {
          this.step += isOk ? 1 : 0 // 联网正常 或 暂不联网，继续配置
        })
      } else if (this.step === 3) {
        // 无线配置
        this.$refs.mWifi.onSave().then(data => {
          if (data && data.wechat) {
            this.isSameConifg = !data.doConfig
            this.wechat = { ...data.wechat, unset: this.isSameConifg }
            this.step++
          }
        })
      } else {
        this.step++
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_mixins.scss';
@import '~@/style/utils/_variable.scss';
.quickset {
  background-color: #fff;
  @extend %position-absolute;
  .quickset-tit {
    @include text-middle(60px);
    padding: 0;
    background: $theme;
    box-shadow: 0 1px 5px 0 #999;
    color: #fff;
  }
  .quickset-main {
    overflow-y: auto;
    .step {
      padding: 14px 4% 10px;
      // min-height: calc(100% - 30px);
    }
  }
  .main-mb {
    margin-bottom: 62px !important;
  }
  .quickset-footer {
    .el-button {
      width: 45%;
      &.start {
        width: 96% !important;
      }
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
