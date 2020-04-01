<template>
  <div>
    <p class="mt10">
      当前工作模式是
      <strong class="c-success-green">{{modeMap[curMode]}}</strong>,
      可选择以下模式，保存切换
    </p>
    <el-radio :key="k" :label="k" border class="mtb20" size="medium" v-for="(v,k) in modeMap" v-model="mode">{{v}}</el-radio>
    <router :cur-mode="curMode" v-if="mode === 'ROUTER'"></router>
    <repeater-wired v-else-if="mode === 'wiredBridge'"></repeater-wired>
    <repeater v-else-if="mode === 'wirelessBridge'"></repeater>
  </div>
</template>
<script>
import Router from '@/views/ehr/devMode/Router'
import RepeaterWired from '@/views/ehr/devMode/RepeaterWired'
import Repeater from '@/views/ehr/devMode/Repeater'
export default {
  name: 'DevMode',
  data() {
    return {
      mode: null, // 初始化
      modeMap: {
        ROUTER: I18N.t('overview.route_mode'),
        wiredBridge: '有线中继',
        wirelessBridge: '无线中继'
      }
    }
  },
  created() {
    this.mode = this.curMode
  },
  components: {
    Router,
    RepeaterWired,
    Repeater
  },
  computed: {
    curMode() {
      // return 'ROUTER'
      let _devMode = this.$store.getters.devMode || {}
      if (_devMode.forwardMode === 'AP') {
        if (_devMode.relayMode === 'wirelessBridge') {
          return 'wirelessBridge'
        } else {
          return 'wiredBridge'
        }
      }
      return 'ROUTER' // 默认路由模式
    },
    hasQuickset() {
      return this.$store.getters.networkId.networkId !== '0'
    }
  },
  watch: {
    mode: {
      async handler(v, o) {
        // 初始化或则取消切换不执行
        if (!o || this.isModeFallback) {
          this.isModeFallback = false
          return
        }
        if (!this.hasQuickset && this.curMode === 'ROUTER' && v !== 'ROUTER') {
          let _jsx = (
            <div>
              <p>中继配置的Wi-Fi生效情况有两种：</p>
              <ol class="ml20 ol-num">
                <li class="mt5">
                  上联设备是我司同系列路由产品，设备将
                  <span class="c-warning">自动加入</span>
                  上联设备网络，中继所配置的Wi-Fi会被上联设备覆盖（上联设备统一管理)。
                </li>
                <li class="mt5">
                  上联设备非我司同系列路由产品，中继所配置的Wi-Fi正常生效。
                </li>
              </ol>
              <p>
                提示：若<span class="c-warning">不想自动加入</span>
                上联设备的网络，请点击 “全网配置” 开局后再来此页面切换模式。
              </p>
            </div>
          )
          await this.$confirm(_jsx, `检测到设备未开局`, {
            cancelButtonText: '全网配置',
            confirmButtonText: '继续切换',
            closeOnClickModal: false,
            dangerouslyUseHTMLString: true,
            distinguishCancelAndClose: true
          })
            .then(_ok => {
              this.mode = v
            })
            .catch(action => {
              this.isModeFallback = true
              this.mode = o
              if (action === 'cancel') {
                this._onToQuick()
              }
            })
        }
      },
      immediate: false
    }
  },
  methods: {
    _onToWan() {
      this.$router.push({
        name: 'admin/alone/network/network_wan'
      })
    },
    _onToQuick() {
      this.$router.push({
        name: 'quickmacc'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
