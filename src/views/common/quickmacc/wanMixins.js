import model from '@/model'
import {
  maskValidator,
  maskUsedValidator,
  ipValidator,
  dnsValidator
} from '@/utils/rules'
import {
  ipToLong,
  inSameNet,
  getGateway,
  isIp
} from '@/utils/rulesUtils'
import { isIpInNet } from '@/utils/commonValidates'
import { mapGetters, mapActions } from 'vuex'
import { sleep } from '@/utils'

export default {
  data() {
    const gatewayValidator = (rule, value, cb) => {
      if (
        this.baseModel.wan.ipaddr &&
        this.baseModel.wan.netmask &&
        !inSameNet(this.baseModel.wan.ipaddr, value, this.baseModel.wan.netmask)
      ) {
        cb(rule.message)
      } else {
        cb()
      }
    }
    const compareLanIp = (rule, value, cb) => {
      if (isIpInNet(value, this.network.lan)) {
        cb(I18N.t('quickmacc.lan_ip_conflict'))
      }
      cb()
    }
    const illegalIp = (rule, value, cb) => {
      if (value === '10.44.77.254' || value === '10.44.77.253') {
        cb(I18N.t('quickmacc.reserved_ip_addr'))
      }
      cb()
    }
    const ipAddrValidate = (rule, value, cb) => {
      let _mask = this.baseModel.wan.netmask
      let _ip = this.baseModel.wan.ipaddr
      let _gateWay = this.baseModel.wan.gateway
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
      wanModel: {
        wan: model.wanFn()
      },
      wanRules: {
        'wan.ipaddr': [
          {
            required: true,
            message: I18N.t('wan.ip_no_empty'),
            whitespace: true
          },
          { validator: ipValidator, message: I18N.t('wan.invalid_ip_addr') },
          { validator: compareLanIp },
          { validator: illegalIp },
          { validator: ipAddrValidate }
        ],
        'wan.netmask': [
          {
            required: true,
            message: I18N.t('wan.mask_no_empty'),
            whitespace: true
          },
          {
            validator: maskValidator,
            message: I18N.t('wan.invalid_mask_addr')
          },
          { validator: maskUsedValidator }
        ],
        'wan.dns': [
          {
            required: true,
            message: I18N.t('wan.dns_no_empty'),
            whitespace: true
          },
          { validator: dnsValidator }
        ],
        'wan.gateway': [
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
        'wan.password': [
          {
            required: true,
            message: I18N.t('network.wan.broadband_password_is_required'),
            whitespace: true
          }
        ],
        'wan.username': [
          {
            required: true,
            message: I18N.t('network.wan.broadband_account_is_required'),
            whitespace: true
          }
        ]
      },
      staticTypes: [
        {
          label: I18N.t('wan.pppoe'),
          value: 'pppoe'
        },
        {
          label: I18N.t('wan.dynamic_ip'),
          value: 'dhcp'
        },
        {
          label: I18N.t('wan.static_ip'),
          value: 'static'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['netStatus']),
    isEhr() {
      return this.$roles().includes('ehr')
    },
    supportTypes() {
      let _types = [...this.staticTypes]
      if (this.isBridgeForward) {
        _types = _types.filter(t => {
          return t.value !== 'pppoe'
        })
      }
      return _types
    },
    protoMap() {
      let _map = {}
      this.staticTypes.forEach(o => {
        _map[o.value] = o.label
      })
      return _map
    },
    isRouter() {
      return this.$roles().includes('ROUTER')
    },
    isBridgeForward() {
      // 如果有从网关，支持PPPoE设置
      return !this.slaverEgIp && !this.isRouter
    },
    netObj() {
      if (this.baseModel.wan) {
        return (
          this.baseModel.wan.ipaddr +
          this.baseModel.wan.netmask +
          this.baseModel.wan.gateway
        )
      }
      return ''
    },
    supportWanNum() {
      return +(this.$store.getters.capacity.eth_port.wan_number || 1)
    }
  },
  watch: {
    netObj(v) {
      this.$refs.baseForm.validateField([
        'wan.ipaddr',
        'wan.netmask',
        'wan.gateway'
      ])
    }
  },
  methods: {
    ...mapActions(['getNetStatus']),
    _onLearnOk(res) {
      this.baseModel.wan.username = res.user
      this.baseModel.wan.password = res.pwd
    },
    _onSelectProto() {
      let _proto = this.dialType
      if (this.dialType === 'pppoe' && this.isBridgeForward) {
        return
      }
      this.baseModel.wan.proto = _proto.includes('unkonw') ? 'static' : _proto
    },
    async _getIpinfo() {
      const _ipinfo = await this.$api.cmd(
        'devSta.get',
        { module: 'ipinfo' },
        { isSilence: true }
      )
      let _wan = _ipinfo.wan || {}
      if (_wan.ip) {
        this.baseModel.wan = Object.assign(this.baseModel.wan, {
          ipaddr: _wan.ip,
          netmask: _wan.mask,
          gateway: _wan.gateway,
          dns: _wan.dnsList.split(/\s*,\s*/g).join(' ')
        })
        this.$message.success(I18N.t('quickmacc.pppoe_info'))
      } else {
        this.$message(I18N.t('quickmacc.fetch_info_fail'))
      }
    },
    // 网关生成
    _generateGateway() {
      if (isIp(this.baseModel.wan.ipaddr) && isIp(this.baseModel.wan.netmask)) {
        if (
          inSameNet(
            this.baseModel.wan.ipaddr,
            this.baseModel.wan.gateway || '',
            this.baseModel.wan.netmask
          )
        ) {
          return
        }
        this.baseModel.wan.gateway = getGateway(
          this.baseModel.wan.ipaddr,
          this.baseModel.wan.netmask
        )
      }
    },
    // 协议tab切换
    _onProtoSwitch() {
      this.$nextTick(() => {
        // 清除验证信息
        this.$refs.baseForm.clearValidate()
      })
    },
    _getWanModel(baseModel) {
      let _model = {
        proto: baseModel.proto,
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

      if (this.supportWanNum > 1) {
        _model.metric = (+baseModel.metric || 0) + ''
        _model.special_line = (+baseModel.special_line || 0) + ''
      }
      if (baseModel.vlanid) {
        _model.vlanid = baseModel.vlanid
      }
      if (baseModel.mtu && baseModel.mtu != '1500') {
        _model.mtu = baseModel.mtu
      }
      return _model
    },
    // 获取联网状态
    async getNetworkStatus(timeout = 30) {
      let _start = new Date().getTime()
      let _countError = 1
      let _countOk = 1
      let _isOk = false
      const _isTimeout = () => {
        let _now = new Date().getTime()
        if (_now - _start > timeout * 1000) {
          timeout = 0
          return true
        }
        return false
      }
      // 网络不通(异常/不通)累计2次，或者 网络连通正常连续2次 退出循环
      while (timeout > 0 && _countError <= 2 && _countOk <= 2) {
        try {
          await this.getNetStatus()
        } catch (error) { }
        _isOk = this.netStatus.connnected === 'true'
        if (_isOk) {
          // 连续成功次数
          _countOk++
        } else {
          // 累计失败次数
          _countError++
          // 一旦失败重新计数
          _countOk = 1
        }
        // 判断是否超时
        if (!_isTimeout()) {
          await sleep(2000)
        }
      }
      const _netStatus = {
        isOk: true,
        message: false
      }
      // 连续2次OK 未达标
      if (_countOk <= 2) {
        _netStatus.isOk = false
        // 网络连通失败原因
        if (_countError >= 2) {
          _netStatus.message = this.netStatus.message || I18N.t('quickmacc.connect_fail')
        } else if (timeout === 0) {
          if (_isOk) {
            // 网络连通成功过
            _netStatus.message = I18N.t('quickmacc.connect_timeout')
          } else {
            _netStatus.message = this.netStatus.message || I18N.t('quickmacc.connect_err_unknow')
          }
        }
      }
      return Promise.resolve(_netStatus)
    }
  }
};
