<template>
  <el-form
    :class="formClass"
    :label-position="labelPos"
    :model="baseModel"
    :rules="baseRules"
    class="components_wan web-form"
    label-width="160px"
    ref="baseForm"
  >
    <el-radio-group @change="_onProtoSwitch" class="radio-block mb20" v-if="type==='tab'" v-model="baseModel.proto">
      <el-radio-button
        :key="typer.value"
        :label="typer.value"
        :style="{width:100/staticTypes.length+'%'}"
        v-for="typer in staticTypes"
      >{{typer.label}}</el-radio-button>
    </el-radio-group>
    <el-form-item label="联网类型" prop="proto" required v-if="type==='select'">
      <el-select @change="_onProtoSwitch" style="width:340px;" v-model="baseModel.proto">
        <el-option :key="typer.value" :label="typer.label" :value="typer.value" v-for="typer in staticTypes"></el-option>
      </el-select>
    </el-form-item>
    <template v-if="baseModel.proto==='dhcp'">
      <div class="w100% tc c-info mb10">DHCP动态上网无需账号密码</div>
    </template>
    <template v-if="baseModel.proto==='static'">
      <el-form-item label="IP地址" prop="ipaddr">
        <el-input @blur="_generateGateway" placeholder="格式：192.168.23.2" v-model="baseModel.ipaddr"></el-input>
      </el-form-item>
      <el-form-item label="子网掩码" prop="netmask">
        <net-mask @blur="_generateGateway" placeholder="格式：255.255.255.0" style="width:100%;" v-model="baseModel.netmask"></net-mask>
      </el-form-item>
      <el-form-item label="网关" prop="gateway">
        <el-input placeholder="格式：192.168.1.1" v-model="baseModel.gateway"></el-input>
      </el-form-item>
      <el-form-item label="DNS服务器" prop="dns">
        <el-input placeholder="114.114.114.114，多个以空格隔开" v-model="baseModel.dns"></el-input>
      </el-form-item>
    </template>
    <template v-if="baseModel.proto==='pppoe'">
      <el-form-item label="宽带账号" placeholder="宽带账号" prop="username">
        <el-input placeholder="宽带账号" v-model="baseModel.username"></el-input>
      </el-form-item>
      <el-form-item label="宽带密码" prop="password">
        <el-input :type="inputType" name="password" placeholder="宽带密码" v-model="baseModel.password">
          <i
            :class="[{'c-success': inputType === 'text'}, 'el-input__icon el-icon-view fs18']"
            @click="inputType = (inputType === 'text' ? 'password' : 'text')"
            slot="suffix"
          ></i>
        </el-input>
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="VLAN ID" prop="vlanid" v-if="isBridgeForward">
        <el-input placeholder="范围为2~232 或 234~4090" v-model="baseModel.vlanid"></el-input>
      </el-form-item>
    </template>
    <slot :baseModel="baseModel"></slot>
    <template v-if="!isQuick">
      <p @click="easyConf=!easyConf" class="tc components_wan--conf mb20">
        <el-button size="mini" type="text">高级设置</el-button>
      </p>
      <div class="mt20" v-show="!easyConf">
        <el-form-item label="MTU" prop="mtu">
          <el-input :placeholder="'范围：（576~'+mtuMax+'）'" v-model="baseModel.mtu"></el-input>
          <span class="web-form--tip">（576-{{mtuMax}}）</span>
        </el-form-item>
        <el-form-item label="MAC地址" prop="macaddr">
          <el-input placeholder="格式：00:11:22:33:44:55" v-model="baseModel.macaddr"></el-input>
        </el-form-item>
        <el-form-item label="默认路由优先级" prop="metric" v-if="isEgw">
          <el-input placeholder="默认路由优先级" v-model="baseModel.metric"></el-input>
          <span class="web-form--tip">（值越小优先级越高）</span>
        </el-form-item>
      </div>
    </template>
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
import NetMask from '@/common/NetMask'
import model from '@/model'
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
      type: [String, Array]
    },
    data: {
      type: Object,
      default: () => {}
    },
    isQuick: {
      type: Boolean,
      default: true
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
    }
  },
  computed: {
    staticTypes() {
      let _types = [
        {
          label: 'PPPOE',
          value: 'pppoe'
        },
        {
          label: '动态IP',
          value: 'dhcp'
        },
        {
          label: '静态IP',
          value: 'static'
        }
      ]
      if (
        this.$roles().includes('eac') ||
        this.isRemote ||
        this.isBridgeForward
      ) {
        _types = _types.filter(t => {
          return t.value !== 'pppoe'
        })
      }
      return _types
    },
    // egw
    isEgw() {
      return this.$dev() === 'egw'
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
      if (this.isEgw) {
        _model.metric = (+this.baseModel.metric || 0) + ''
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
        cb(`请输入有效的数值（范围576~${this.mtuMax}）`)
      }
    }
    const metricValidator = (rule, value, cb) => {
      if (value === '') {
        cb()
      }
      if (!isBetween(value, 0, 100)) {
        cb(`请输入有效的数值（范围0~100）`)
      }
      if (this.otherWans.includes(value)) {
        cb(`两个WAN不能用相同值，请修改其中一个WAN让优先级不同`)
      }
      let _valid = isBetween(value, 0, Infinity)
      if (_valid && /^\d+$/.test(value)) {
        cb()
      } else {
        cb('请输入有效的数值（大于等于0的整数）')
      }
    }
    const compareLanIp = (rule, value, cb) => {
      if (isIpInNet(value, this.lan)) {
        cb(`与LAN内网IP地址冲突`)
      }
      cb()
    }
    const illegalIp = (rule, value, cb) => {
      if (value === '10.44.77.254' || value === '10.44.77.253') {
        cb(`请勿使用预留的IP地址`)
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
        return cb(new Error('网段地址不可使用'))
      }
      if (m === 0) {
        return cb(new Error('广播地址不可使用'))
      }
      if (_ip === _gateWay) {
        return cb(new Error('IP地址不可与网关地址一样'))
      }
      cb()
    }
    return {
      baseModel: Object.assign(model.wanFn()),
      mtuMax: 1500,
      easyConf: true,
      inputType: 'password',
      baseRules: {
        ipaddr: [
          { required: true, message: '请输入IP地址', whitespace: true },
          { validator: ipValidator, message: '请输入有效的IP地址' },
          { validator: compareLanIp },
          { validator: illegalIp },
          { validator: ipAddrValidate }
        ],
        netmask: [
          { required: true, message: '请输入子网掩码', whitespace: true },
          { validator: maskValidator, message: '请输入有效的子网掩码' },
          { validator: maskUsedValidator }
        ],
        dns: [
          { required: true, message: '请输入DNS服务器', whitespace: true },
          { validator: dnsValidator }
        ],
        gateway: [
          { required: true, message: '请输入网关地址', whitespace: true },
          { validator: ipValidator, message: '请输入有效的IP地址' },
          {
            validator: gatewayValidator,
            message: '网关地址与IP地址不在同一个网段'
          },
          { validator: ipAddrValidate }
        ],
        password: [
          { required: true, message: '请输入宽带密码', whitespace: true }
        ],
        username: [
          { required: true, message: '请输入宽带账号', whitespace: true }
        ],
        macaddr: [
          { required: true, message: '请输入MAC地址', whitespace: true },
          { validator: macValidator, message: '请输入有效的MAC地址' }
        ],
        mtu: [
          { required: true, message: '请输入MTU', whitespace: true },
          { validator: intValidator },
          { validator: mtuValidator }
        ],
        vlanid: [{ validator: vlanidOldValidator }],
        metric: [
          { required: true, message: '请输入路由优先级', whitespace: true },
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
    NetMask
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
    // 协议tab切换
    _onProtoSwitch() {
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
<style lang="scss">
.components_wan {
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
