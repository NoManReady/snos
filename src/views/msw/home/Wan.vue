<template>
  <div class="network-wan">
    <help-alert :title="$t('msw.wanip.manage_ip')" json-key="wanMswJson">
      <div slot="content">{{$t('msw.wanip.wan_cfg_page')}}</div>
    </help-alert>
    <el-form
      :disabled="isLoading"
      :model="baseModel"
      :rules="baseRules"
      label-width="160px"
      ref="baseForm"
      size="medium"
      status-icon
    >
      <el-form-item :label="$t('msw.wanip.protocol_type_f')" prop="proto">
        <el-select @change="_onProtoSwitch" class="w300" v-model="baseModel.proto">
          <el-option :key="typer.value" :label="typer.label" :value="typer.value" v-for="typer in staticTypes"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('msw.wanip.manage_vlan_f')" prop="vlanid">
        <el-input :debounce="500" class="w300" v-model="baseModel.vlanid"></el-input>
        <span class="c-info">({{$t('msw.wanip.vlan_tip')}})</span>
      </el-form-item>
      <template v-if="baseModel.proto==='dhcp'">
        <template v-if="showStaticInfo">
          <el-form-item :label="$t('wan.ip_addr_f')">
            <label>{{staticInfo.ip}}</label>
          </el-form-item>
          <el-form-item :label="$t('wan.mask_addr_f')">
            <label>{{staticInfo.mask}}</label>
          </el-form-item>
          <el-form-item :label="$t('wan.gateway_addr_f')">
            <label>{{staticInfo.gateway||'0.0.0.0'}}</label>
          </el-form-item>
          <el-form-item :label="$t('wan.dns_addr_f')">
            <div v-if="staticInfo.dnsList.length">
              <p :key="dns+index" v-for="(dns,index) in staticInfo.dnsList.split(/\,|\s/)">{{dns}}</p>
            </div>
            <span v-else>0.0.0.0</span>
          </el-form-item>
        </template>
      </template>
      <template v-if="baseModel.proto==='static'">
        <el-form-item :label="$t('wan.ip_addr_f')" key="ipaddr" prop="ipaddr">
          <el-input
            :placeholder="$t('wan.ip_example')"
            @blur="_generateGateway('netmask')"
            class="w300"
            v-model="baseModel.ipaddr"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('wan.mask_addr_f')" key="netmask" prop="netmask">
          <net-mask
            :placeholder="$t('wan.mask_example')"
            @blur="_generateGateway('ipaddr')"
            class="w300"
            v-model="baseModel.netmask"
          ></net-mask>
        </el-form-item>
        <el-form-item :label="$t('wan.gateway_addr_f')" key="gateway" prop="gateway">
          <el-input :placeholder="$t('wan.ip_example')" class="w300" v-model="baseModel.gateway"></el-input>
        </el-form-item>
        <el-form-item :label="$t('wan.dns_addr_f')" key="dns" prop="dns">
          <el-input :placeholder="$t('wan.dns_example')" class="w300" v-model="baseModel.dns"></el-input>
          <span class="c-info">{{$t('wan.dns_example')}}</span>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isLoading||vlanVertity" class="w160" size="medium" type="primary" v-auth="onSubmit">{{btnText}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import {
  maskValidator,
  ipValidator,
  dnsValidator,
  vlanidOldValidator
} from '@/utils/rules'
import {
  inSameNet,
  getGateway,
  isIp,
  getNetCodeNum,
  ipToLong
} from '@/utils/rulesUtils'
import NetMask from '@/common/NetMask'
import { sleep } from '@/utils'
import { debounce } from '@/utils/utils'
import { wan } from '@/model/msw/sec'
export default {
  name: 'home-wan',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    NetMask
  },
  data() {
    // 网关判断
    const gatewayValidator = (rule, value, cb) => {
      if (!inSameNet(this.baseModel.ipaddr, value, this.baseModel.netmask)) {
        cb(rule.message)
      } else {
        cb()
      }
    }
    // 判断管理vlan是否存在
    const vlanExistValidator = async (rule, value, cb) => {
      // vlan可以为空
      if (!value) {
        return cb()
      }
      // if (this.vlanList.length === 0) {
      //   return cb(new Error('远程验证VLAN ID失败（请求超时或出现错误）'))
      // }
      // if (this.vlanList.find(lis => lis.v == value)) {
      //   cb()
      // } else {
      //   cb(new Error('管理VLAN ID还未创建，请前往VLAN划分进行创建'))
      // }
      let _result = null
      if (!this.vlanCache[value]) {
        this.vlanVertity = true
        try {
          this.vlanCache[value] = await this.$api.cmd(
            'devSta.get',
            {
              module: 'vlan_port',
              data: { v: value }
            },
            { isSilence: true, timeout: 0 }
          )
        } catch (error) {}
        this.vlanVertity = false
      }
      _result = this.vlanCache[value]
      if (_result && _result.v) {
        // 暂时不判断上联口this._getPortidsAndExist(_result.l, uplink)
        if (!_result.l) {
          return cb(new Error(I18N.t('msw.wanip.vlan_no_port_tip')))
        }
      } else {
        return cb(new Error(I18N.t('msw.wanip.vlan_no_exist_tip')))
      }
      cb()
    }
    const ipAddrValidate = (rule, value, cb) => {
      let _mask = this.baseModel.netmask
      let _ip = this.baseModel.ipaddr
      let _gateWay = this.baseModel.gateway
      if (!_mask) return cb()
      let n = ipToLong(value) & ~ipToLong(_mask)
      let m = (ipToLong(value) + 1) & ~ipToLong(_mask)
      if (n === 0) {
        return cb(new Error(I18N.t('wan.net_addr')))
      }
      if (m === 0) {
        return cb(new Error(I18N.t('wan.cast_addr')))
      }
      if (_ip === _gateWay) {
        return cb(new Error(I18N.t('wan.ip_gateway_same')))
      }
      cb()
    }
    return {
      vlanCache: {},
      vlanVertity: false,
      loop: true,
      isLoading: false,
      network: null,
      staticInfo: {
        ip: '0.0.0.0',
        mask: '0.0.0.0',
        dnsList: '0.0.0.0',
        gateway: '0.0.0.0'
      },
      // vlanList: [],
      baseModel: wan(),
      baseRules: {
        ipaddr: [
          {
            required: true,
            message: I18N.t('wan.ip_no_empty'),
            whitespace: true
          },
          { validator: ipValidator, message: I18N.t('wan.invalid_ip_addr') },
          { validator: ipAddrValidate }
        ],
        netmask: [
          {
            required: true,
            message: I18N.t('wan.mask_no_empty'),
            whitespace: true
          },
          { validator: maskValidator, message: I18N.t('wan.invalid_mask_addr') }
        ],
        dns: [
          {
            required: true,
            message: I18N.t('wan.dns_no_empty'),
            whitespace: true
          },
          {
            validator: dnsValidator,
            message: I18N.t('wan.invalid_dns_addr')
          }
        ],
        gateway: [
          {
            required: true,
            message: I18N.t('wan.gateway_no_empty'),
            whitespace: true
          },
          { validator: ipValidator, message: I18N.t('wan.invalid_ip_addr') },
          {
            validator: gatewayValidator,
            message: I18N.t('wan.ip_gateway_net_diff')
          },
          { validator: ipAddrValidate }
        ],
        vlanid: [
          { validator: vlanidOldValidator },
          { validator: vlanExistValidator }
        ]
      }
    }
  },
  async created() {
    try {
      await this._loadNetwork()
    } catch (error) {
      this.$message({
        message: I18N.t('msw.wanip.request_err'),
        type: 'warning'
      })
    }
  },
  beforeDestroy() {
    this.loop = false
  },
  computed: {
    staticTypes() {
      let _types = [
        {
          label: I18N.t('wan.static_ip'),
          value: 'static'
        },
        {
          label: I18N.t('wan.dynamic_ip'),
          value: 'dhcp'
        }
      ]
      return _types
    },
    showStaticInfo() {
      if (!this.network) {
        return false
      }
      return (
        this.baseModel.proto === 'dhcp' &&
        this.network.wan[0].proto === this.baseModel.proto
      )
    },
    btnText() {
      if (this.isLoading) {
        return I18N.t('msw.wanip.loading')
      }
      if (this.vlanVertity) {
        return I18N.t('msw.wanip.validing')
      }
      return I18N.t('action.submit')
    }
  },
  methods: {
    // 加载network信息
    _loadNetwork() {
      this.isLoading = true
      let _promise = null
      if (this.data && Object.keys(this.data).length) {
        _promise = Promise.resolve({ wan: [this.data] })
      } else {
        _promise = this.$api.getNetwork(true)
      }
      _promise
        .then(d => {
          let _wan = d ? d.wan[0] : null
          if (_wan) {
            this.network = { ...d }
            this.baseModel = Object.assign(wan(), _wan || {})
            this._getWanIp(true)
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 获取wan口ip
    async _getWanIp(first = false) {
      if (!this.loop) {
        return
      }
      try {
        if (this.showStaticInfo || first) {
          let _result = await this.$api.getWanIp()
          if (_result.wan) {
            this.staticInfo = _result.wan
          }
          this._settingWanData()
        }
      } finally {
        await sleep(3000)
        this._getWanIp(false)
      }
    },
    // 获取端口原子信息,并判断是否存在
    _getPortidsAndExist(portStr, p) {
      let _items = portStr.split(',')
      let _ranges = []
      _ranges = _items.map(item => {
        let [b, e] = item.split('-').map(Number)
        if (e) {
          return [b, e]
        } else {
          return [b, b]
        }
      })
      for (let _range of _ranges) {
        let [b, e] = _range
        if (p >= b && p <= e) {
          return true
        }
      }
      return false
    },
    // 网关生成
    _generateGateway(field) {
      try {
        this.$refs.baseForm && this.$refs.baseForm.validateField(field)
      } catch (e) {
      } finally {
        if (isIp(this.baseModel.ipaddr) && isIp(this.baseModel.netmask)) {
          if (
            this.baseModel.gateway &&
            inSameNet(
              this.baseModel.ipaddr,
              this.baseModel.gateway,
              this.baseModel.netmask
            )
          ) {
            return
          }
          this.baseModel.dns = this.baseModel.gateway = getGateway(
            this.baseModel.ipaddr,
            this.baseModel.netmask
          )
        }
      }
    },
    // 协议tab切换
    _onProtoSwitch(v) {
      this._settingWanData()
      this._clearValidate()
    },
    // 配置动态数据
    _settingWanData() {
      if (!this.baseModel.ipaddr || this.baseModel.ipaddr === '0.0.0.0') {
        this.baseModel.ipaddr = this.staticInfo.ip
      }
      if (!this.baseModel.netmask || this.baseModel.netmask === '0.0.0.0') {
        this.baseModel.netmask = this.staticInfo.mask
      }
      if (!this.baseModel.dns || this.baseModel.dns === '0.0.0.0') {
        this.baseModel.dns = (this.staticInfo.dnsList || '').replace(/,/g, ' ')
      }
      if (!this.baseModel.gateway || this.baseModel.gateway === '0.0.0.0') {
        this.baseModel.gateway = this.staticInfo.gateway
      }
    },
    // 清除验证信息
    _clearValidate() {
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 表单验证
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(valid => {
          if (valid) {
            let _model = {
              proto: this.baseModel.proto,
              vlanid: this.baseModel.vlanid
            }
            if (_model.proto === 'static') {
              _model.dns = this.baseModel.dns
              _model.ipaddr = this.baseModel.ipaddr
              _model.netmask = this.baseModel.netmask
              _model.gateway = this.baseModel.gateway
            }
            resolve(_model)
          } else {
            reject()
          }
        })
      })
    },
    // 表单验证
    async onSubmit() {
      let _model = await this.validForm()
      this.isLoading = true
      this.$set(this.network.wan, 0, _model)
      this.$api
        .setNetwork(this.network)
        .then(d => {
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(async () => {
          this.isLoading = false
        })
    }
  }
}
</script>
<style lang="scss">
.network-wan {
  .form-tip {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(105%, -50%);
  }
  .radio-block {
    width: 100%;
    .el-radio-button {
      // width: 33%;
      .el-radio-button__inner {
        width: 100%;
      }
    }
  }
}
</style>
