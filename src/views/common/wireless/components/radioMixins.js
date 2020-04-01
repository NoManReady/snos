
export default {
  data() {
    return {
      repeaterRadio: false
    }
  },
  async created() {
    if (this.isWirelessBridge) {
      this._loadRepeaterStatus()
    }
  },
  computed: {
    isWirelessBridge() {
      let _devMode = this.$store.getters.devMode || {}
      return (
        _devMode.forwardMode === 'AP' && _devMode.relayMode === 'wirelessBridge'
      )
    }
  },
  methods: {
    async _loadRepeaterStatus() {
      let _res = await this.$api.cmd('devSta.get', {
        module: 'repeater_status'
      })
      this.repeaterRadio =
        _res.repeater.radio === '24G' ? '2.4G' : _res.repeater.radio
    }
  }
}
