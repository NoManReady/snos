<template>
  <div class="quickset">
    <div class="app-header tc fs24 quickset-tit">欢迎使用向导配置</div>
    <div class="app-main mt20 mb20 sc-y plr20 quickset-main">
      <div class="quickset-box">
        <transition mode="out-in" name="fade">
          <quickset-step
            :data="moduleData"
            :label-pos="labelPos"
            :lan="lanData"
            :module="moduleName[step]"
            :out-proto="outProto"
            class="step"
            ref="quicksetStep"
            type="tab"
            v-if="step>=0"
          ></quickset-step>
          <div @click="onToAppUrl" class="pointer quickset-qrcode" v-else>
            <qrcode-vue :value="url" level="L" size="260"></qrcode-vue>
            <p class="mtb10 c-info fs16">扫码下载APP，全面享受易网络！</p>
            <ul class="ml20 tl qrcode-tip fs18 c-info">
              <li>整网配置，简单！</li>
              <li>远程管理，方便！</li>
              <li>故障诊断，智能！</li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
    <div class="app-footer tc quickset-footer">
      <transition mode="out-in" name="fade">
        <div class="quickset-box">
          <template v-if="step>=0">
            <el-button @click.native="onPrev">上一步</el-button>
            <el-button @click.native="onNext" type="primary" v-if="step<maxStep-1">下一步</el-button>
            <el-button @click.native="onComplete" type="primary" v-if="step===maxStep-1">完成配置</el-button>
          </template>
          <template v-else>
            <el-button @click.native="goSystem" plain>直接进入系统</el-button>
            <el-button @click.native="onNext" type="primary">使用WEB快速配置</el-button>
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import QuicksetStep from './quickset/Index'
import QrcodeVue from 'qrcode.vue'
import { isAuthOld } from '@/directives/auth'
export default {
  name: 'Quickset',
  data() {
    return {
      step: -1,
      labelPos: 'top',
      stepData: {},
      radioList: [],
      originData: {}
    }
  },
  computed: {
    sysinfo() {
      return this.$store.getters.sysinfo || {}
    },
    url() {
      if (!this.sysinfo.sys_mac) {
        return ''
      }
      return `http://rj.link/e?s=${this.sysinfo.serial_num}&d=${
        this.sysinfo.product_class
      }&m=${this.sysinfo.sys_mac.replace(/:/g, '')}&l=90`
    },
    moduleName() {
      return Object.keys(this.stepData)
    },
    maxStep() {
      return this.moduleName.length
    },
    rsMapValue() {
      return this.$store.getters.rsMapValue
    },
    moduleData() {
      let _module = this.moduleName[this.step]
      switch (_module) {
        case 'network':
          return this.stepData[_module] ? this.stepData[_module].wan[0] : {}
          break
        case 'wireless':
          let _masterWifi = this._getMasterWifi(this.stepData[_module].ssidList)
          return Object.assign({}, _masterWifi, {
            relatedRadio: this.rsMapValue
          })
          break
        default:
          return {}
          break
      }
    },
    lanData() {
      return this.stepData.network ? this.stepData.network.lan : []
    },
    outProto() {
      return this.stepData['network']
        ? this.stepData['network'].wan[0].proto
        : null
    }
  },
  components: {
    QuicksetStep,
    QrcodeVue
  },
  async created() {
    await this._loadData()
  },
  mounted() {
    window.addEventListener('resize', this._onResize, false)
    this._onResize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    // 加载数据
    async _loadData() {
      let _data = await this.$api.getQuickInfo()
      this.originData = JSON.parse(JSON.stringify(_data))
      this.stepData = _data
    },
    // 浏览器收缩
    _onResize() {
      let _innerWidth = document.documentElement.offsetWidth
      if (_innerWidth < 768) {
        this.labelPos = 'top'
      } else {
        this.labelPos = 'right'
      }
    },
    // 上一步
    onPrev() {
      this.step--
    },
    // 下一步
    onNext() {
      this.onValidate().then(() => {
        this.step++
      })
    },
    // 跳转到APP下载页
    onToAppUrl() {
      window.open(this.url, '_blank')
    },
    // 验证数据有效性（整合多个步骤数据）
    onValidate() {
      return new Promise((resolve, reject) => {
        let _ref = this.$refs.quicksetStep
        if (!_ref) {
          resolve()
          return
        }
        _ref.validForm().then(
          d => {
            let _module = this.moduleName[this.step]
            switch (_module) {
              case 'network':
                this.stepData[_module] = Object.assign(
                  {},
                  this.stepData[_module],
                  { wan: [d] }
                )
                this.stepData[_module].wanNum = '1'
                break
              case 'wireless':
                if (!d.wlanId) {
                  d.wlanId = '1'
                }
                if (!d.relatedRadio) {
                  d.relatedRadio =
                    this.rsMapValue ||
                    (!this.$store.getters.isSingleRadio ? '1,2' : '1')
                }
                let _ssidList = this.stepData[_module].ssidList

                let _idx = _ssidList.findIndex(s => s.wlanId === d.wlanId)
                if (_idx != -1) {
                  _ssidList.splice(_idx, 1, d)
                } else {
                  _ssidList.unshift(d)
                }
                this.stepData[_module].ssidList = _ssidList // [Object.assign({}, d)]
                break
            }
            resolve()
          },
          () => {
            reject()
          }
        )
      })
    },
    _getMasterWifi(list = []) {
      return list.find(ssid => ssid.wlanId === '1') || {}
    },
    // 判断数据是否改变
    _dataIsChange() {
      let _origin_wif = {}
      let _now_wif = {}
      if (this.originData.wireless) {
        _origin_wif = this._getMasterWifi(this.originData.wireless.ssidList)
        _now_wif = this._getMasterWifi(this.stepData.wireless.ssidList)
      }
      let _origin_net = {}
      let _now_net = {}
      if (this.originData.network) {
        _origin_net = this.originData.network.wan[0]
        _now_net = this.stepData.network.wan[0]
      }
      for (let _net in _origin_net) {
        if (_origin_net.hasOwnProperty(_net)) {
          if (
            JSON.stringify(_now_net[_net]) !== JSON.stringify(_origin_net[_net])
          ) {
            return true
          }
        }
      }
      for (let _net in _now_wif) {
        if (_now_wif.hasOwnProperty(_net)) {
          if (
            JSON.stringify(_now_wif[_net]) !== JSON.stringify(_origin_wif[_net])
          ) {
            return true
          }
        }
      }
      return false
    },
    // 提交数据
    onSubmit() {
      return this.$api.setQuickInfo(this.stepData).then(() => {
        this.$message({ type: 'success', message: '配置成功' })
      })
    },
    // 完成配置
    onComplete() {
      this.onValidate().then(() => {
        if (this._dataIsChange()) {
          isAuthOld(this.onSubmit).then(() => {
            this.goSystem()
          })
        } else {
          this.goSystem()
        }
      })
    },
    // 进入系统
    goSystem() {
      this.$router.replace({ name: 'admin/alone' })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../style/utils/mixins.scss';
@import '../../style/utils/variable.scss';
.quickset {
  &-qrcode {
    width: 260px;
    margin: 60px auto 0;
  }
  .qrcode-tip li {
    margin-top: 5px;
    list-style: disc;
  }
  .empty-col {
    height: 1px;
    opacity: 0;
  }
  @extend %position-absolute;
  .quickset-tit {
    @include text-middle(60px);
    padding: 0;
    background: $theme;
    box-shadow: 0 1px 5px 0 #999;
    color: #fff;
  }
  .quickset-box {
    width: 50%;
    margin: 0 auto;
  }
  .quickset-main {
    margin-bottom: 80px !important;
    overflow-y: auto;
  }
  .quickset-footer {
    .el-button {
      width: 45%;
    }
    height: 80px;
  }
  @media screen and (max-width: 768px) {
    .quickset-box {
      width: 100%;
      margin: 0 auto;
    }
  }
}
</style>
