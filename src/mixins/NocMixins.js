export default {
  data() {
    return {
      domain: 'http://cloud.ruijie.com.cn/q',
      ehrDomain: 'http://rj.link/j'  // 家用易点点二维码
    }
  },
  computed: {
    networkName() {
      let _networkId = this.$store.getters.networkId
      return _networkId && encodeURIComponent(_networkId.networkName || I18N.t('nei.unname_network')) || ''
    },
    sysinfo() {
      return this.$store.getters.sysinfo || {}
    },
    type() {
      const _productType = this.sysinfo.productType.toLocaleUpperCase()
      return (
        {
          EGW: 'GATEWAY',
          EWR: 'GATEWAY',
          ESW: 'SWITCH',
          MSW: 'SWITCH',
          EAP: 'AP'
        }[_productType] || _productType
      )
    },
    mac() {
      return this.sysinfo.sys_mac.replace(/\s*[:|\.]\s*/g, "")
    },
    nocUrl() {
      return `${this.domain}?sn=${this.sysinfo.serial_num}&deviceType=${this.sysinfo.product_class}&type=${this.type}&projectName=${this.networkName}&ewebPwd=${this.pwd}&qcodeType=offline`
    },
    ehrUrl() {
      return `${this.ehrDomain}?s=${this.sysinfo.serial_num}&d=${this.sysinfo.product_class}&m=${this.mac}&n=${this.networkName}`
    }
  }
}
