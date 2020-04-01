<template>
  <div class="network-wan">
    <help-alert :title="$t('network.wan_cfg')" json-key="wanJson">
      <div slot="content">{{ $t("network.net_cfg_page") }}</div>
    </help-alert>
    <div class="pos-r" v-show="network.wan.length">
      <div class="mb20" v-if="showMultWan">
        <el-radio-group v-model="switchValue">
          <el-radio-button :key="item.label" :label="item.label" border size="medium" v-for="item in wanMaps">{{item.text}}</el-radio-button>
        </el-radio-group>
      </div>
      <el-tabs :class="{'hide-header': network.wan.length === 1}" type="card" v-model="activeTab">
        <el-tab-pane
          :key="index"
          :label="_getWanNum(index).toUpperCase()"
          :name="_getWanNum(index)"
          v-for="(wan, index) in network.wan"
        >
          <wan
            :data="_getWanModel(wan, index)"
            :form-class="isMobile ? '' : 'w500'"
            :is-quick="false"
            :lan="network.lan"
            :other-wans="_getOtherWans(network.wan, index)"
            :showMultWan="showMultWan"
            label-pos="right"
            ref="baseWanRef"
            type="select"
          >
            <div slot-scope="{ baseModel }" v-if="baseModel.proto === 'dhcp' || baseModel.proto === 'pppoe'">
              <el-form-item :label="$t('sysinfo.ip_addr')">
                <label
                  class="c-info"
                  v-if="baseModel.ipaddr"
                >{{ _getInfoCompare(originProtos[index] != baseModel.proto || !baseModel.ipaddr, baseModel.ipaddr) }}</label>
                <label v-else>
                  <i class="el-icon-loading fs16"></i>
                </label>
              </el-form-item>
              <el-form-item :label="$t('sysinfo.mask')">
                <label
                  class="c-info"
                >{{ _getInfoCompare(originProtos[index] != baseModel.proto || !baseModel.netmask, baseModel.netmask) }}</label>
              </el-form-item>
              <el-form-item :label="$t('sysinfo.gateway_addr')">
                <label
                  class="c-info"
                >{{ _getInfoCompare(originProtos[index] != baseModel.proto || !baseModel.gateway, baseModel.gateway) }}</label>
              </el-form-item>
              <el-form-item :label="$t('sysinfo.dns_addr')">
                <label
                  class="c-info"
                >{{ _getInfoCompare(originProtos[index] != baseModel.proto || !baseModel.dns, baseModel.dns) }}</label>
              </el-form-item>
            </div>
          </wan>
        </el-tab-pane>
        <el-tab-pane :label="$t('network.isp_cfg')" name="isp" v-if="network.wan.length >= 2">
          <isp :switch-value="+switchValue" label-pos="right" ref="ispRef"></isp>
        </el-tab-pane>
      </el-tabs>
      <el-form :label-width="isMobile ? '105px' : '160px'">
        <el-form-item>
          <el-button class="w160" size="medium" type="primary" v-auth="onSubmit">{{ $t("action.save") }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import Wan from './components/Wan'
import Isp from '@/views/egw/Isp'
import { deepClone, getRandomMac } from '@/utils/utils'
import { sleep } from '@/utils'
import { getType } from '@/utils/utils'
import { isAuth } from '@/directives/auth'
export default {
  name: 'NetworkWan',
  data() {
    return {
      isMobile: !!ISMOBILE,
      timer: true,
      network: {
        wan: []
      },
      staticWans: Object.freeze([]),
      activeTab: 'wan',
      switchValue: '1',
      unwatch: false,
      originWans: Object.freeze([]),
      wanPreDatas: Object.freeze([])
    }
  },
  created() {
    this._loadNetworkAndMac()
  },
  components: {
    Wan,
    Isp
  },
  computed: {
    supportWanNum() {
      return +(this.$store.getters.capacity.eth_port.wan_number || 1)
    },
    wanMaps() {
      return [
        { label: '1', text: I18N.t('network.single_line') },
        { label: '2', text: I18N.t('network.double_line') },
        { label: '3', text: I18N.t('network.three_line') },
        { label: '4', text: I18N.t('network.four_line') }
      ].slice(0, this.supportWanNum)
    },
    isEgw() {
      return this.$dev() === 'egw'
    },
    isEap() {
      return this.$dev() === 'eap'
    },
    showMultWan() {
      return this.$roles().includes('egEnable') && this.supportWanNum > 1
    },
    preMac() {
      return this.$store.getters.sysinfo.sys_mac.substr(0, 8)
    },
    originProtos() {
      return this.originWans.map(w => w.proto)
    }
  },
  beforeDestroy() {
    this.timer = false
  },
  watch: {
    // 确保activeTab的变更放在this.$nextTick中，防止this.$refs.baseWanRef出现undefined
    activeTab(v, o) {
      // 只做wan口的校验
      let _match = v.match(/wan(\d)?/)
      if (!_match) {
        return
      }
      this._syncWanData()
      // let _curIndex = +_match[1] || 0
      // let _wanRefs = this.$refs.baseWanRef.slice(_curIndex, _curIndex + 1)
      // this._validatorAllWan(_wanRefs, _curIndex).catch(unPassTabs => {
      //   for (let i = 0; i < unPassTabs.length; i++) {
      //     let { tab, index } = unPassTabs[i]
      //     if (index === _curIndex) {
      //       this.$refs.baseWanRef[_curIndex].easyConf = false
      //       break
      //     }
      //   }
      // })
    },
    switchValue(v, ov) {
      !this.unwatch &&
        isAuth().then(
          _ => {
            let _newIndex = parseInt(v)
            this._syncWanData()
            let _newWans = deepClone(this.network.wan).slice(0, _newIndex)
            while (_newWans.length < _newIndex) {
              _newWans.push(this.wanPreDatas[_newWans.length])
            }
            this.network.wan = _newWans
            this.$set(this.network, 'wanNum', v)

            this.$nextTick(() => {
              this.activeTab = this._getWanNum(_newIndex - 1)
            })
          },
          _ => {
            this.unwatch = true
            this.switchValue = ov
            this.$nextTick(_ => {
              this.unwatch = false
            })
          }
        )
    }
  },
  methods: {
    _getWanNum(num) {
      return `wan${num ? num : ''}`
    },
    // 加载network信息
    async _loadNetworkAndMac() {
      let [net, wanMacs = {}] = await Promise.all([
        this.$api.getNetwork(),
        this.$api.getWanMac()
      ])
      if (net.wan) {
        let _wanNum = Math.min(net.wan.length, this.supportWanNum)
        net.wan = net.wan.slice(0, _wanNum)
        net.wanNum = net.wan.length.toString()
      }

      this.originWans = Object.freeze(deepClone(net.wan || []))
      let _wanPreDatas = []
      this.wanMaps.forEach((w, i) => {
        _wanPreDatas.push({
          metric: (5 * i).toString(),
          ...(net.wan[i] || {}),
          macaddr:
            wanMacs[`br-${this._getWanNum(i)}`] || getRandomMac(this.preMac)
        })
      })
      this.wanPreDatas = Object.freeze(_wanPreDatas)
      net.wan.forEach((w, i) => {
        w.macaddr = w.macaddr || this.wanPreDatas[i].macaddr
      })
      this.network = net
      this.switchValue = net.wanNum
      while (this.timer) {
        if (this.activeTab !== 'isp') {
          await this._getWanIp()
        }
        await sleep(2500)
      }
    },
    _getWanModel(wan, index) {
      let _wan = { ...wan }
      if (wan.proto === 'static') {
        return _wan
      }
      return { ..._wan, ...this.staticWans[index] }
    },
    // 获取当前wan信息
    _getInfoCompare(isDefault, value, defaultValue = '0.0.0.0') {
      return isDefault ? defaultValue : value
    },
    // 同步wan数据(this._getWanModel方法数据即将改变前调用或使用network.wan数据前)
    _syncWanData() {
      let _wanRefs = this.$refs.baseWanRef || []
      _wanRefs.forEach((w, i) => {
        let _baseModel = w.baseModel
        this.$set(this.network.wan, i, _baseModel)
      })
    },
    realBaseModel(baseModel) {
      let _model = {
        proto: baseModel.proto,
        mtu: baseModel.mtu,
        vlanid: baseModel.vlanid,
        macaddr: baseModel.macaddr
      }
      if (_model.proto === 'static') {
        _model.dns = baseModel.dns
        _model.ipaddr = baseModel.ipaddr
        _model.netmask = baseModel.netmask
        _model.gateway = baseModel.gateway
      } else if (_model.proto === 'pppoe') {
        _model.password = baseModel.password
        _model.username = baseModel.username
        delete _model.vlanid
      }
      if (this.showMultWan) {
        _model.metric = (+baseModel.metric || 0) + ''
        _model.special_line = (+baseModel.special_line || 0) + ''
      }
      return _model
    },
    // 获取wan口ip
    async _getWanIp() {
      const _result = await this.$api.getWanIp()
      let _staticWans = []
      this.network.wan.forEach((wan, i) => {
        let _k = _result[this._getWanNum(i)]
        let _opts = {
          // proto: wan.proto, // ipinfo只更新ip地址
          gateway: _k ? _k['gateway'] : '0.0.0.0',
          netmask: _k ? _k['mask'] : '0.0.0.0',
          dns: _k ? _k['dnsList'].split(',').join(' ') : '0.0.0.0',
          ipaddr: _k ? _k['ip'] : '0.0.0.0'
        }
        _staticWans.push(_opts)
      })
      if (this._dataIsChange(this.staticWans, _staticWans)) {
        this._syncWanData()
        this.staticWans = Object.freeze(_staticWans)
      }
    },
    // 获取除当前的其他wan-metric信息
    _getOtherWans(wans, index) {
      let _wans = []
      return wans.filter((w, i) => i !== index).map(w => w.metric)
    },
    // 默认验证所有wan
    _validatorAllWan(wanRefs = this.$refs.baseWanRef || [], begin = 0) {
      this._syncWanData()
      return new Promise((resolve, reject) => {
        // this.$nextTick(() => {
        let _unPassTabs = []
        let _promises = wanRefs.map((wanRef, index) => {
          return wanRef.validForm().catch(() => {
            _unPassTabs.push({
              tab: this._getWanNum(index),
              index: index + begin
            })
          })
        })
        Promise.all(_promises).then(() => {
          if (_unPassTabs.length) {
            reject(_unPassTabs)
          } else {
            resolve()
          }
        })
        // })
      })
    },
    // 验证Isp
    _validateIsp() {
      return new Promise((resolve, reject) => {
        if (!this.$refs.ispRef) {
          resolve()
        }
        this.$refs.ispRef.validForm().then(
          d => {
            resolve()
          },
          () => {
            reject([{ tab: 'isp', index: this.network.wan.length }])
          }
        )
      })
    },
    // 删除无用数据
    updateWan(wanList) {
      wanList.forEach((wan, i) => {
        wanList[i] = this.realBaseModel(wan)
      })
    },
    // 提交表单验证
    onSubmit() {
      this.$nextTick(_ => {
        Promise.all([this._validatorAllWan(), this._validateIsp()])
          .then(() => {
            //EGW才支持双wan口，设置设置ISP和负载均衡
            if (this.isEgw && this.$refs.ispRef) {
              this.$refs.ispRef.setMultWan() // 单WAN口在后台setNetwork时会设置关闭
            }

            this.updateWan(this.network.wan)
            if (this._dataIsChange(this.network.wan, this.originWans)) {
              this.$api.setNetwork(this.network)
              this.originWans = Object.freeze(deepClone(this.network.wan || []))
            }
            this.$message({
              message: I18N.t('tip.edit1_success'),
              type: 'success'
            })
          })
          .catch(([{ tab, index }]) => {
            this.$message.warning(I18N.t('network.cfg_valid_err'))
            this.activeTab = tab
            if (tab !== 'isp') {
              this.$refs.baseWanRef[index].easyConf = false
            }
          })
      })
    },
    // 判断数据是否改变(object)
    _isSame(target, source) {
      let _targetKeys = Object.keys(target)
      let _sourceKeys = Object.keys(source)
      if (_targetKeys.length !== _sourceKeys.length) {
        return false
      }
      let _isExistNotEqValue = _targetKeys.some(k => {
        let _targetType = getType(target[k])
        let _sourceType = getType(source[k])
        if (_targetType !== _sourceType) {
          return true
        }
        if (_targetType === 'string') {
          return target[k] !== source[k]
        } else if (_targetType === 'array') {
          return this._dataIsChange(target[k], source[k])
        } else if (_targetType === 'object') {
          return !this._isSame(target[k], source[k])
        } else {
          return true
        }
      })
      return !_isExistNotEqValue
    },
    // 判断数据是否改变(array)
    _dataIsChange(target, source) {
      if (target.length != source.length) {
        return true
      }
      return source.some((w, i) => {
        return !this._isSame(w, target[i])
      })
    }
  }
}
</script>
<style lang="scss">
.el-tabs.hide-header {
  .el-tabs__header {
    display: none;
  }
}
</style>