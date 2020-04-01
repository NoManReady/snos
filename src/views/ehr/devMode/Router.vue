<template>
  <div class="repeater">
    <help-alert content jsonKey title="路由模式"></help-alert>
    <div class="box">
      <div class="box-header">
        <div class="box-header-tit">
          <span class="vm">路由模式</span>
        </div>
      </div>
      <el-form :model="wan" class="w500" label-width="160px" size="medium" v-if="curMode === 'ROUTER'">
        <el-form-item label="工作模式">
          <p class="c-success-green">当前已是路由模式</p>
          <p>
            去
            <a @click="onToWan" class="c-success pointer">"WAN设置"</a>修改上网方式
          </p>
        </el-form-item>
      </el-form>
      <wan
        :check-protos="false"
        :data="wan"
        :disabled="curMode === 'ROUTER'"
        :is-quick="false"
        :lan="lan"
        :other-wans="otherWans"
        label-pos="right"
        ref="baseWanRef"
        type="select"
      >
        <el-form-item slot="submit">
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
      </wan>
    </div>
  </div>
</template>
<script>
import Wan from '@/views/common/network/components/Wan'
import { sleep, awaitOnLine_plus } from '@/utils'
export default {
  name: 'DevModeRouter',
  props: {
    curMode: {
      type: String,
      default: 'ROUTER'
    }
  },
  data() {
    return {
      isLoading: true,
      loadingMsg: false,
      network: {},
      wan: {},
      otherWans: [],
      lan: []
    }
  },
  components: {
    Wan
  },
  created() {
    this._loadNetwork()
  },
  methods: {
    // 获取中继状态信息
    async _loadNetwork() {
      let [net, wanMacs = {}] = await Promise.all([
        this.$api.getNetwork(),
        this.$api.getWanMac()
      ])
      let _wanMac = wanMacs['br-wan'] || ''
      this.network = net
      const _wans = net && net.wan
      this.wan = Object.assign({}, _wans[0], {
        macaddr: _wanMac
      })
      this.lan = (net.lan && net.lan) || []
      this.otherWans = _wans.filter((w, i) => i !== 0).map(w => w.metric) // 获取除当前的其他wan-metric信息
      this.isLoading = false
    },
    onToWan() {
      this.$router.push({ name: 'admin/alone/network/network_wan' })
    },
    onSubmit() {
      this.$refs.baseWanRef.validForm().then(
        async wan0 => {
          this.loadingMsg = this.$t('ehr.repeater.config_setting')
          this.network.wan[0] = wan0
          await this.$api.cmd(
            'devSta.set',
            {
              module: 'recov_network',
              data: this.network
            },
            { isSilence: true }
          )
          this.loadingMsg = this.$t('ehr.repeater.wifi_has_setted')
          await sleep(15000)
          this.awaitOk()
        },
        _fail => {
          this.$message.warning(this.$t('ehr.repeater.check_fail'))
        }
      )
    },
    awaitOk(ip = 'ruiyi.cn') {
      this.loadingMsg = false
      awaitOnLine_plus({
        time: 3000,
        text: `检测 ${ip} 的连通性`,
        host: ip,
        maxTry: 10
      }).then(async () => {
        this.loadingMsg = '自动跳转中...'
        await sleep(5000)
        location.href = `http://${ip}`
      })
    }
  }
}
</script>
<style lang="scss">
</style>
