import { mapGetters, mapActions } from 'vuex'
import { popDevDetail } from '@/utils/iframeUtils'

export default {
  props: {
    isMacc: {
      type: Boolean,
      default: false
    },
    otherCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: true,
      timer: true,
      wanProto: '-',
      ipinfo: false,
      egInfo: false,
      flowInfo: {},
      apList: [],
      swList: [],
      userCount: '-',
      hasAc: false
    }
  },
  computed: {
    ...mapGetters(['netStatus', 'sysinfo']),
    isEgRouter() {
      return (
        this.$dev() === 'egw' &&
        this.$store.getters.devMode.forwardMode === 'ROUTER'
      )
    },
    isMsw() {
      return this.$roles().includes('msw')
    },
    // 是否有互联网WAN口设置页面
    hasWanLink() {
      return !this.isMacc && this.isEgRouter // || this.isMsw
    },
    // 是否有在线用户页面
    hasHomeOnline() {
      return this.$roles().includes('egEnable')
    },
    hasEgLink() {
      return !this.isMacc && !!this.egInfo
    },
    hasFlowInfo() {
      return !this.isMacc && this.isEgRouter
    },
    isEhr() {
      return this.$roles().includes('ehr')
    },
    egRouter() {
      return this.isEhr ? this.$t('nei.router') : this.$t('nei.gateway')
    }
  },
  created() {
    this._loadData()
  },
  mounted() {
    this._loadFlowInfo()
    this._onRefresh()
  },
  beforeDestroy() {
    // 点击整网概览页刷新时保留监听
    // if (this.$route.name !== 'admin/home_overview') {
    this.$bus.$off('flowIntfInfo')
    // }
    this.$bus.$off('LOAD-NETVIEW')
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    _onRefresh() {
      this.$bus.$on('LOAD-NETVIEW', data => {
        let _loadNeighbor = data.from !== 'Neighbor'
        this._loadData(_loadNeighbor)
      })
    },
    async _loadData(loadNeighbor) {
      if (this.isMacc && loadNeighbor) {
        this.$bus.$emit('LOAD-NEIGHBOR', { from: 'NetView' })
      }
      this.loading = true
      await this._loadNetInfo()
      if (!this.isMacc) {
        await this._loadUserCount()
      }
      this._loadNetStatus()
      this.loading = false
    },
    ...mapActions(['getNetStatus']),
    async _loadNetStatus() {
      clearTimeout(this.timer)
      await this.getNetStatus()
      this.timer &&
        (this.timer = setTimeout(() => {
          this._loadNetStatus()
        }, 11000))
    },
    // 获取网络信息，包含网关、交换机（ESW/MSW）、AP信息
    async _loadNetInfo() {
      let params = [
        {
          method: 'devSta.get',
          params: { module: 'networkId' }
        },
        {
          method: 'devSta.get',
          params: { module: 'ap_list', data: { status: 'ON' } } // 只统计在线的设备
        },
        {
          method: 'devSta.get',
          params: { module: 'esw_neighbor' }
        },
        {
          method: 'devSta.get',
          params: {
            module: 'neighbor',
            data: {
              product: 'GW_RGOS'
            }
          }
        }
      ]
      // EG才获取网关出口信息
      if (this.isEgRouter) {
        params.push({
          method: 'devSta.get',
          params: { module: 'ipinfo' }
        })
      }
      if (this.isMsw) {
        params[1].params.data = { productType: 'MSW' }
      }
      const _res = await this.$api.cmd(
        'cmdArr',
        { params },
        { isSilence: true, noParse: true }
      )

      const _devList = _res[1].total === '0' ? [] : _res[1].list || []
      const _myNetworkId = _res[0].networkId || _devList[0].networkId || '-'
      const _eswList = (_res[2].neighbor || []).filter(
        o => o.networkId === _myNetworkId
      )
      // AP列表
      this.apList = []
      // 交换机列表，包含ESW和MSW
      this.swList = [..._eswList] //, { product: 'MSW' }, { product: 'ESW' }]
      _devList.forEach(dev => {
        if (['EGW', 'EWR', 'EHR'].includes(dev.product)) {
          if (dev.forwardMode === 'ROUTER') {
            this.egInfo = dev
          } else if (dev.forwardMode === 'AC') {
            // EGW的AC模式也放在AP列表中
            this.hasAc = true
            this.apList.push(dev)
          } else if (dev.forwardMode === 'AP') {
            // EWR的AP模式放在AP列表中
            this.apList.push(dev)
          }
        } else if (dev.product === "EAC") {
          // EAC也放在AP列表中
          this.hasAc = true
          this.apList.push(dev)
        } else if (dev.product === 'EAP') {
          this.apList.push(dev)
        } else if (dev.product === 'MSW') {
          this.swList.push(dev)
        }
      })
      // 如果没有EG，判断是否有NBR
      if (!this.egInfo && _res[3] && _res[3].count > 0) {
        this.egInfo = _res[3].neighbor[0]
      }
      // WAN口的上网方式
      if (this.isEgRouter) {
        if (_res[4].wan) {
          this.ipinfo = _res[4].wan
          this.wanProto =
            {
              dhcp: 'DHCP',
              pppoe: 'PPPoE',
              static: I18N.t('wan.static_ip')
            }[this.ipinfo.proto] || '-'
        } else {
          this.ipinfo = false
        }
      }
    },
    _loadFlowInfo() {
      if (this.isEgRouter) {
        this.$bus.$on('flowIntfInfo', ({ flowInfo }) => {
          let _up = 0,
            _down = 0
          for (let wan in flowInfo) {
            let _wanFlow = flowInfo[wan]
            _up += +_wanFlow.up
            _down += +_wanFlow.down
          }
          this.flowInfo = {
            up: _up,
            down: _down
          }
        })
      }
    },
    // 加载用户数
    async _loadUserCount() {
      if (this.isMsw) {
        return
      }
      let _result = await this.$api.userCount()
      this.userCount = _result.count || 0
    },
    // 通用跳转接口（在线用户数跳转说明 eg->在线用户，eap->无线用户）
    _onToPath(path, data) {
      if (this.isMacc) {
        return
      }
      this.$router.push({
        name: path
      })
    },
    /**
     * 只有网关在路由模式下才有互联网出口信息，点击跳转到“网关管理-> WAN设置"页面；
     */
    _onToNetWan() {
      if (!this.hasWanLink) {
        return
      }
      let _wanPathName = 'admin/alone/network/network_wan'
      // if (this.isMsw) {
      //   _wanPathName = 'admin/alone/port/home_wan'
      // }
      popDevDetail(this.sysinfo, 'NetView', _wanPathName)
    },
    // 本机是网关，直接跳到“网关管理”页面；本机是其他设备（此时网关做为从设备），需弹出到从设备的网关页面
    _onToGateway() {
      if (!this.hasEgLink) {
        return
      }

      popDevDetail({ ...this.egInfo, hasAc: this.hasAc }, 'NetView')
    },
    _getStatus(status) {
      let map = {
        ON: I18N.t('phrase.online'),
        OFF: I18N.t('phrase.offline'),
        NEVER_ON: I18N.t('phrase.never_on')
      }
      return map[status]
    }
  }
};
