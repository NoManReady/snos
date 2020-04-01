<template>
  <div @click.ctrl="_setMaccDomain" class="macc">
    <iframe :src="maccUrl" class="iframe" ref="maccIframe"></iframe>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { saveToSession, loadFromSession } from '@/utils/localStorage'
const MACC_DOMAIN = 'APP_MACC_DOMAIN'
export default {
  name: 'Macc',
  data() {
    return {
      maccDomain:
        loadFromSession(MACC_DOMAIN) ||
        'https://noc.ruijie.com.cn/sceneConfAdmin2', // demo地址 'https://nocdemo.ruijie.com.cn/sceneConfAdmin2'
      maccDomainEn: 'https://cloud.ruijienetworks.com/'
    }
  },
  computed: {
    ...mapGetters(['networkId', 'sysinfo', 'lang']),
    curSysinfo() {
      return window.top.APP_SYSINFO || this.sysinfo
    },
    isAlone() {
      return this.$roles().includes('alone')
    },
    sessionId() {
      // wan口未获取到ip地址时要有个默认值，否则MACC页面登不上
      return this.curSysinfo.wan_ip || '192.168.110.1'
    },
    maccUrl() {
      let _domain = this.lang === 'en' ? this.maccDomainEn : this.maccDomain
      if (this.networkId && this.networkId.networkId) {
        return `${_domain}/?sessionId=${this.sessionId}&lnid=${
          this.networkId.networkId
        }&projectName=${this.networkId.networkName}&sn=${
          this.curSysinfo.serial_num
        }&type=${this.curSysinfo.productType.toLocaleUpperCase()}&masterSn=${
          this.sysinfo.serial_num
        }&masterType=${this.sysinfo.productType.toLocaleUpperCase()}&isAlone=${
          this.isAlone
        }`
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('message', this._listenerFn, false)
  },
  async created() {
    window.addEventListener('message', this._listenerFn, false)
  },
  methods: {
    _setMaccDomain() {
      this.$prompt('请输入MACC测试地址', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^((https|http):\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?((([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|([0-9a-z_!~*'()-]+.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].[a-z]{2,6})(:([1-9]?[0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|[1-5][0-9]{4}|6[0-5][0-5][0-3][0-5]))?((\/?)|(\/[\0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+\/?)$/,
        inputErrorMessage: '地址不合法'
      }).then(({ value }) => {
        this.maccDomain = value
        this.$message.success('MACC测试地址已切换到: ' + value)
        saveToSession(MACC_DOMAIN, value)
      })
    },
    _listenerFn(e) {
      let _data = e.data
      if (_data) {
        if (_data.parentGroupId) {
          // 设置parentGroupId
          this._setParentGroupId(_data.parentGroupId)
        } else if (_data.master_info) {
          // 触发infrom快速上报，使设备快速上线
          this._setInform({ data: _data.value })
        } else if (_data.master_cwmp) {
          // 开启所有自组网设备的cwmp
          this._setCwmp(_data.master_cwmp)
        } else if (_data.getArpDhcp) {
          // 获取设备的arp和dhcp表项
          this._getArpDhcp()
        } else if (_data.getNeighbor) {
          // 获取设备的邻居列表
          this._getNeighbor()
        } else if (_data.backIndex) {
          // 返回eweb首页
          this.$emit('toHomepage')
          // this.$router.push({ name: 'admin/home_overview' })
        } else if (_data.refresh) {
          // 刷新页面
          this._loadData()
          // location.reload()
        } else if (_data.getIp) {
          // 返回电脑IP
          this._sendPcIp()
        } else if (_data.sendCmd) {
          this._setCmd(_data.sendCmd)
        }
      }
    },
    _setParentGroupId(id) {
      this.$api.cmd(
        'devSta.set',
        {
          module: 'parentGroupId',
          data: {
            parentGroupId: id
          }
        },
        { isSilence: true }
      )
    },
    _setInform(data) {
      this.$api.cmd(
        'devSta.set',
        {
          module: 'cwmp_inform',
          data: {
            user: 'eweb by macc',
            sn: [],
            event: 'connection_request'
          }
        },
        { isSilence: true }
      )
    },
    async _setCwmp(status) {
      let _cwmp = await this.$api.cmd(
        'acConfig.get',
        { module: 'cwmp' },
        { isSilence: true }
      )

      this.$api.cmd(
        'acConfig.set',
        {
          module: 'cwmp',
          data: Object.assign(_cwmp, {
            user: 'eweb by macc',
            CWMPEnable: status.toString()
          })
        },
        { isSilence: true }
      )
    },
    async _getArpDhcp(data) {
      let params = [
        {
          method: 'devSta.get',
          params: { module: 'arp' }
        },
        {
          method: 'devSta.get',
          params: { module: 'dhcp_lease' }
        }
      ]
      let _res = await this.$api.cmd(
        'cmdArr',
        { params },
        { isSilence: true, noParse: true }
      )
      let _arpList = _res[0].arpList || []
      let _dhcpList = _res[1].count === '0' ? [] : _res[1].List || [] // 空数据变成{}
      let _ArpDhcpData = {
        arpList: _arpList.map(o => ({
          address: o.address,
          hardware: this._macFormate(o.hardware),
          intf: o.intf
        })),
        dhcpList: _dhcpList.map(o => ({
          address: o.ip,
          hardware: this._macFormate(o.mac)
        }))
      }
      this.$refs.maccIframe.contentWindow.postMessage(
        { sendArpDhcp: _ArpDhcpData },
        '*'
      )
    },
    _macFormate(mac) {
      let _mac = mac.split(/\s*:\s*/g)
      return _mac.length === 6
        ? `${_mac[0]}${_mac[1]}.${_mac[2]}${_mac[3]}.${_mac[4]}${_mac[5]}`
        : mac
    },
    // 获取设备的邻居列表
    async _getNeighbor() {
      let _NeighborData = await this.$api.getNeighborListByType(['ap', 'esw'])
      this.$refs.maccIframe.contentWindow.postMessage(
        { sendNeighbor: _NeighborData },
        '*'
      )
    },
    // 通告MACC退出全网配置
    exitMacc() {
      this.$refs.maccIframe.contentWindow.postMessage({ exit: true }, '*')
    },
    // 通告MACC退出全网配置
    _sendPcIp() {
      this.$refs.maccIframe.contentWindow.postMessage(
        { ip: window.APP_CURRENT_IP },
        '*'
      )
    },
    // 执行命令
    async _setCmd(data) {
      let _res = await this.$api.cmd(
        'syshell',
        {
          cmd: data.value,
          async: !!data.async // 默认false,同步下发返回执行结果
        },
        { isSilence: true }
      )
      // if (!data.async) {
      this.$refs.maccIframe.contentWindow.postMessage({ getCmdRes: _res }, '*')
      // }
    }
  }
}
</script>
<style lang="scss">
.macc {
  .iframe {
    width: 100%;
    height: 98%;
    border: none;
  }
}
</style>
