<template>
  <el-form
    :class="formClass"
    :disabled="disabled"
    :label-position="labelPos"
    :label-width="isMobile ? '105px' : '160px'"
    :model="baseModel"
    :rules="baseRules"
    class="components-wan web-form"
    ref="baseForm"
    size="medium"
  >
    <el-radio-group @change="_onProtoSwitch" class="radio-block mb20" v-if="type==='tab'" v-model="baseModel.proto">
      <el-radio-button
        :key="typer.value"
        :label="typer.value"
        :style="{width:100/staticTypes.length+'%'}"
        v-for="typer in staticTypes"
      >{{typer.label}}</el-radio-button>
    </el-radio-group>
    <el-form-item :label="$t('network.wan.link_type')" prop="proto" required v-if="type==='select'">
      <el-select :class="isMobile ? 'w100p' : 'w340'" @change="_onProtoSwitch" v-model="baseModel.proto">
        <el-option :key="typer.value" :label="typer.label" :value="typer.value" v-for="typer in staticTypes"></el-option>
      </el-select>
    </el-form-item>
    <template v-if="baseModel.proto==='dhcp'">
      <div class="w100% tc c-info mb10">{{$t('network.wan.dhcp_user_no_required')}}</div>
    </template>
    <template v-if="baseModel.proto==='static'">
      <el-form-item :label="$t('network.ip')" prop="ipaddr">
        <el-input :placeholder="$t('wan.ip_example')" @blur="_generateGateway" v-model="baseModel.ipaddr"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.mask')" prop="netmask">
        <net-mask :placeholder="$t('wan.mask_example')" @blur="_generateGateway" style="width:100%;" v-model="baseModel.netmask"></net-mask>
      </el-form-item>
      <el-form-item :label="$t('network.gateway')" prop="gateway">
        <el-input :placeholder="$t('wan.ip_example')" v-model="baseModel.gateway"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.wan.dns_service')" prop="dns">
        <el-input :placeholder="$t('wan.dns_example')" v-model="baseModel.dns"></el-input>
      </el-form-item>
    </template>
    <template v-if="baseModel.proto==='pppoe'">
      <el-form-item :label="$t('network.wan.broadband_account')" prop="username">
        <el-input :placeholder="$t('network.wan.broadband_account')" v-model="baseModel.username"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.wan.broadband_password')" prop="password">
        <eweb-input-password :placeholder="$t('network.wan.broadband_password')" type="password" v-model="baseModel.password"></eweb-input-password>
      </el-form-item>
      <pppoe-learn :value="baseModel.password" @result="_onLearnOk" v-if="!isRemote && $dev() === 'egw' && checkProtos"></pppoe-learn>
    </template>
    <slot :baseModel="baseModel"></slot>
    <template v-if="!isQuick">
      <p @click="easyConf=!easyConf" class="tc components-wan--conf mb20">
        <el-button size="mini" type="text">{{$t('network.advanced')}}</el-button>
      </p>
      <div class="mt20" v-show="!easyConf">
        <el-form-item label="VLAN ID" prop="vlanid" v-if="isBridgeForward && checkProtos">
          <el-input :placeholder="$t('network.wan.vlanid_range')" v-model="baseModel.vlanid"></el-input>
        </el-form-item>
        <el-form-item label="MTU" prop="mtu">
          <el-input :placeholder="$t('network.wan.mtu_range', {mtuMax: mtuMax})" v-model="baseModel.mtu"></el-input>
          <span class="web-form--tip">（576-{{mtuMax}}）</span>
        </el-form-item>
        <el-form-item :label="$t('network.mac')" prop="macaddr">
          <el-input :placeholder="$t('wan.mac_example')" v-model="baseModel.macaddr"></el-input>
        </el-form-item>
        <template v-if="showMultWan">
          <el-form-item :label="$t('network.wan.default_route_priority')" prop="metric">
            <el-input :placeholder="$t('network.wan.default_route_priority')" v-model="baseModel.metric"></el-input>
            <span class="web-form--tip">{{$t('network.wan.biger_priority_by_smaller_value')}}</span>
          </el-form-item>
          <el-form-item :label="$t('network.wan.is_only_link_wan')">
            <el-switch active-value="1" inactive-value="0" v-model="baseModel.special_line"></el-switch>
          </el-form-item>
        </template>
      </div>
    </template>
    <slot :baseModel="baseModel" name="submit"></slot>
  </el-form>
</template>
<script>
import {
  maskValidator,
  maskUsedValidator,
  vlanidOldValidator,
  ipValidator,
  dnsValidator,
  macValidator,
  intValidator
} from '@/utils/rules'
import {
  ipToLong,
  inSameNet,
  getGateway,
  isIp,
  isBetween
} from '@/utils/rulesUtils'
import { isAuth } from '@/directives/auth'
import InputPassword from '@/common/InputPassword'
import NetMask from '@/common/NetMask'
import model from '@/model'
import PppoeLearn from '@/views/common/network/components/PppoeLearn'
import { isIpInNet } from '@/utils/commonValidates'
export default {
  name: 'ComponentsWan',
  props: {
    labelPos: {
      type: String,
      default: 'top'
    },
    type: {
      type: String,
      default: 'tab',
      validator(v) {
        return ['tab', 'select'].indexOf(v) > -1
      }
    },
    formClass: {
      type: [String, Array],
      default: 'w500'
    },
    data: {
      type: Object,
      default: () => {}
    },
    isQuick: {
      type: Boolean,
      default: true
    },
    showMultWan: {
      type: Boolean,
      default: false
    },
    otherWans: {
      type: Array,
      default: () => []
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    lan: {
      type: Array,
      default: () => []
    },
    checkProtos: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    staticTypes() {
      let _types = [
        {
          label: this.$t('wan.pppoe'),
          value: 'pppoe'
        },
        {
          label: this.$t('wan.dynamic_ip'),
          value: 'dhcp'
        },
        {
          label: this.$t('wan.static_ip'),
          value: 'static'
        }
      ]
      if (this.checkProtos) {
        if (
          this.$roles().includes('eac') ||
          this.isRemote ||
          this.isBridgeForward
        ) {
          _types = _types.filter(t => {
            return t.value !== 'pppoe'
          })
        }
      }
      return _types
    },
    isBridgeForward() {
      return !this.$roles().includes('ROUTER')
    },
    netObj() {
      return (
        this.baseModel.ipaddr + this.baseModel.gateway + this.baseModel.netmask
      )
    },
    realBaseModel() {
      let _model = {
        proto: this.baseModel.proto,
        mtu: this.baseModel.mtu,
        vlanid: this.baseModel.vlanid,
        macaddr: this.baseModel.macaddr
      }
      if (_model.proto === 'static') {
        _model.dns = this.baseModel.dns
        _model.ipaddr = this.baseModel.ipaddr
        _model.netmask = this.baseModel.netmask
        _model.gateway = this.baseModel.gateway
      } else if (_model.proto === 'pppoe') {
        _model.password = this.baseModel.password
        _model.username = this.baseModel.username
        delete _model.vlanid
      }
      if (this.showMultWan) {
        _model.metric = (+this.baseModel.metric || 0) + ''
        _model.special_line = (+this.baseModel.special_line || 0) + ''
      }
      return _model
    }
  },
  data() {
    const gatewayValidator = (rule, value, cb) => {
      if (!inSameNet(this.baseModel.ipaddr, value, this.baseModel.netmask)) {
        cb(rule.message)
      } else {
        cb()
      }
    }
    const mtuValidator = (rule, value, cb) => {
      if (value === '') {
        cb()
      }
      let _valid = isBetween(value, 576, this.mtuMax)
      if (_valid) {
        cb()
      } else {
        cb(
          this.$t('network.wan.invalid_num', { num1: '576', num2: this.mtuMax })
        )
      }
    }
    const metricValidator = (rule, value, cb) => {
      if (value === '') {
        cb()
      }
      if (!isBetween(value, 0, 100)) {
        cb(this.$t('network.wan.invalid_num', { num1: '0', num2: '100' }))
      }
      if (this.otherWans.includes(value)) {
        cb(this.$t('network.wan.between_wan_diffren_priority'))
      }
      let _valid = isBetween(value, 0, Infinity)
      if (_valid && /^\d+$/.test(value)) {
        cb()
      } else {
        cb(this.$t('network.wan.invalid_value_more_then_0'))
      }
    }
    const compareLanIp = (rule, value, cb) => {
      if (isIpInNet(value, this.lan)) {
        cb(this.$t('network.wan.clash_by_lan_ip'))
      }
      cb()
    }
    const illegalIp = (rule, value, cb) => {
      if (value === '10.44.77.254' || value === '10.44.77.253') {
        cb(this.$t('network.wan.change_ip_required'))
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
        return cb(new Error(this.$t('network.wan.no_use_network')))
      }
      if (m === 0) {
        return cb(new Error(this.$t('network.wan.broadcast_address_invalid')))
      }
      if (_ip === _gateWay) {
        return cb(new Error(this.$t('network.wan.ip_diffrent_with_gateway')))
      }
      cb()
    }
    return {
      isMobile: !!ISMOBILE,
      baseModel: Object.assign(model.wanFn()),
      mtuMax: 1500,
      easyConf: true,
      baseRules: {
        ipaddr: [
          {
            required: true,
            message: this.$t('wan.ip_no_empty'),
            whitespace: true
          },
          { validator: ipValidator, message: this.$t('wan.invalid_ip_addr') },
          { validator: compareLanIp },
          { validator: illegalIp },
          { validator: ipAddrValidate }
        ],
        netmask: [
          {
            required: true,
            message: this.$t('wan.mask_no_empty'),
            whitespace: true
          },
          {
            validator: maskValidator,
            message: this.$t('wan.invalid_mask_addr')
          },
          { validator: maskUsedValidator }
        ],
        dns: [
          {
            required: true,
            message: this.$t('network.wan.dns_is_required'),
            whitespace: true
          },
          { validator: dnsValidator }
        ],
        gateway: [
          {
            required: true,
            message: this.$t('network.wan.gateway_is_required'),
            whitespace: true
          },
          { validator: ipValidator, message: this.$t('wan.invalid_ip_addr') },
          {
            validator: gatewayValidator,
            message: this.$t('network.wan.ip_diffrent_with_gateway')
          },
          { validator: ipAddrValidate }
        ],
        password: [
          {
            required: true,
            message: this.$t('network.wan.broadband_password_is_required'),
            whitespace: true
          }
        ],
        username: [
          {
            required: true,
            message: this.$t('network.wan.broadband_account_is_required'),
            whitespace: true
          }
        ],
        macaddr: [
          {
            required: true,
            message: this.$t('network.wan.mac_is_required'),
            whitespace: true
          },
          {
            validator: macValidator,
            message: this.$t('network.wan.invalid_mac')
          }
        ],
        mtu: [
          {
            required: true,
            message: this.$t('network.wan.mtu_is_required'),
            whitespace: true
          },
          { validator: intValidator },
          { validator: mtuValidator }
        ],
        vlanid: [{ validator: vlanidOldValidator }],
        metric: [
          {
            required: true,
            message: this.$t('network.wan.route_priority_is_required'),
            whitespace: true
          },
          { validator: metricValidator }
        ]
      }
    }
  },
  created() {
    // this._generateGateway()
    this.baseModel = this._getModelData()
  },
  components: {
    NetMask,
    [InputPassword.name]: InputPassword,
    PppoeLearn
  },
  watch: {
    data() {
      this.baseModel = this._getModelData()
    },
    netObj(v) {
      this.$refs.baseForm.validate()
    },
    'baseModel.proto'(v) {
      // if (!this.baseModel.mtu.trim()) {
      if (v === 'pppoe') {
        this.baseModel.mtu =
          this.baseModel.mtu > 1492 ? '1492' : this.baseModel.mtu
        this.mtuMax = 1492
      } else {
        this.baseModel.mtu =
          this.baseModel.mtu === '1492' ? '1500' : this.baseModel.mtu
        this.mtuMax = 1500
      }
      this.$emit(
        'proto-change',
        this.data.proto !== 'static' && this.data.proto === this.baseModel.proto
      )
      // }
    }
  },
  methods: {
    _getModelData() {
      return Object.assign(model.wanFn(), this.data)
    },
    // 网关生成
    _generateGateway() {
      if (isIp(this.baseModel.ipaddr) && isIp(this.baseModel.netmask)) {
        if (
          inSameNet(
            this.baseModel.ipaddr,
            this.baseModel.gateway,
            this.baseModel.netmask
          )
        ) {
          return
        }
        this.baseModel.gateway = getGateway(
          this.baseModel.ipaddr,
          this.baseModel.netmask
        )
      }
    },
    _onLearnOk(res) {
      this.baseModel.username = res.user
      this.baseModel.password = res.pwd
    },
    // 协议tab切换
    _onProtoSwitch() {
      isAuth()
      this._clearValidate()
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
            resolve(this.realBaseModel)
          } else {
            reject()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.components-wan {
  .w100p {
    width: 100%;
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
  &--conf {
    position: relative;
    &:before {
      content: '';
      display: block;
      border: 1px #ccc dashed;
      position: absolute;
      width: 100%;
      top: 50%;
      z-index: 0;
    }
    .el-button--text {
      z-index: 1;
      background: #fff !important;
      position: relative;
      padding: 7px 8px;
    }
  }
}
</style>
