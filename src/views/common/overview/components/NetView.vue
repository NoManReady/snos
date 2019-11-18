<template>
  <div class="block overview-netview mb10">
    <el-row :gutter="0" align="middle" class="mb10" justify="center" type="flex">
      <el-col class="c-info tl">全网状态</el-col>
      <el-col class="tr">
        <el-button @click="_onFresh" type="text">更新></el-button>
      </el-col>
    </el-row>
    <el-row :gutter="0" align="middle" class="netview tc mb10" justify="center" type="flex">
      <el-col :span="2" class="w-auto">
        <div @click="_onToNetWan" class="pointer" v-popover:ipinfoPopover>
          <i :class="netStatus.connnected==='true' ? 'c-success' : 'c-warning'" class="fs36 rjucd-network"></i>
          <strong>{{ wanProto }}</strong>
          <span class="caption">互联网</span>
        </div>
      </el-col>
      <el-col :span="1" :xs="2">
        <div class="line"></div>
      </el-col>
      <el-col :class="{'mw230': isEg}" :span="2" class="w-auto plr5" v-if="egInfo">
        <div>
          <span class="vm xs-hide" v-if="isEg">
            <span>{{flowInfo.up||0 | rateTrans}}</span>bps
            <i class="el-icon-caret-left"></i>
          </span>
          <i @click="_onToGateway" class="fs36 rjucd-gateway vm pointer"></i>
          <span class="vm xs-hide" v-if="isEg">
            <i class="el-icon-caret-right"></i>
            <span>{{flowInfo.down||0 | rateTrans}}</span>bps
          </span>
        </div>
        <strong>1</strong>
        <span @click="_onToGateway" class="caption w60 pointer">网关</span>
      </el-col>
      <el-col :span="1" :xs="2">
        <div class="line"></div>
      </el-col>
      <template v-if="swList.length > 0||isMsw">
        <el-col :span="2" class="w-auto">
          <div @click="_onToPath('admin/switch_list')" class="pointer">
            <i class="fs36 rjucd-switch"></i>
            <strong>{{swList.length||0}}</strong>
            <span class="caption">交换机</span>
          </div>
        </el-col>
        <el-col :lg="2" :md="1" :span="2" v-if="!isMsw">
          <div class="line">
            <span></span>
          </div>
        </el-col>
      </template>
      <template v-if="apList.length > 0">
        <el-col :span="2" class="w-auto">
          <div @click="_onToPath('admin/wifi/wifi_ap')" class="pointer">
            <i class="fs36 rjucd-ap"></i>
            <strong>{{ apList.length||0 }}</strong>
            <span class="caption">AP</span>
          </div>
        </el-col>
        <el-col :lg="2" :md="1" :span="2">
          <div class="line dotted"></div>
        </el-col>
      </template>
      <el-col :span="2" class="w-auto" v-if="!isMsw">
        <div @click="_onToPath($dev()=='egw' ? 'admin/home_online' : 'admin/wifi/wifi_sta')" class="pointer">
          <i class="fs36 rjucd-user"></i>
          <strong>{{userCount||0}}</strong>
          <span class="caption">{{ $dev()=='egw' ? '在线用户' : '无线用户' }}</span>
        </div>
      </el-col>
    </el-row>

    <el-popover placement="left" ref="ipinfoPopover" trigger="hover">
      <el-form class="view-form" label-width="100px" size="mini">
        <el-form-item label="联网类型：">
          <label>{{wanProto}}</label>
        </el-form-item>
        <el-form-item label="IP地址：">
          <label>{{ipinfo.ip}}</label>
        </el-form-item>
        <el-form-item label="子网掩码：">
          <label>{{ipinfo.mask}}</label>
        </el-form-item>
        <el-form-item label="网关：">
          <label>{{ipinfo.gateway}}</label>
        </el-form-item>
        <el-form-item label="DNS服务器：">
          <label>{{ipinfo.dnsList}}</label>
        </el-form-item>
      </el-form>
    </el-popover>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { rateTrans } from '@/utils/utils'
import { popDevDetail } from '@/utils/iframeUtils'
import { Col, Row } from 'element-ui'
export default {
  name: 'OverviewNetView',
  data() {
    return {
      timer: true,
      wanProto: '-',
      ipinfo: {},
      egInfo: false,
      flowInfo: {},
      apList: [],
      swList: [],
      userCount: '-'
    }
  },
  components: {
    [Col.name]: Col,
    [Row.name]: Row
  },
  filters: {
    rateTrans
  },
  computed: {
    ...mapGetters(['netStatus']),
    curSysinfo() {
      return this.$store.getters.sysinfo
    },
    isEg() {
      return this.$dev() === 'egw'
    },
    isMsw() {
      return this.$dev() === 'msw'
    }
  },
  created() {
    this._loadNetInfo()
    this.isEg && this._loadFlowInfo()
    this._loadUserCount()
    // 延迟检测网络
    setTimeout(() => {
      this._loadNetStatus()
    }, 3000)
  },
  beforeDestroy() {
    // 点击整网概览页刷新时保留监听
    if (this.$route.name !== 'admin/home_overview') {
      this.$bus.$off('flowIntfInfo')
    }
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    ...mapActions(['getNetStatus']),
    async _loadNetStatus() {
      await this.getNetStatus()
      this.timer &&
        (this.timer = setTimeout(() => {
          clearTimeout(this.timer)
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
          params: { module: 'ap_list' }
        },
        {
          method: 'devSta.get',
          params: { module: 'esw_neighbor' }
        },
        {
          method: 'devSta.get',
          params: { module: 'ipinfo' }
        }
      ]
      if (this.isMsw) {
        params[1].params.data = { productType: 'MSW' }
      }
      const _res = await this.$api.cmd('cmdArr', { params })
      const _devList = _res[1].list || []
      const _myNetworkId = _res[0].networkId || _devList[0].networkId || '-'
      const _eswList = (_res[2].neighbor || []).filter(
        o => o.networkId === _myNetworkId
      )
      // AP列表
      this.apList = []
      // 交换机列表，包含ESW和MSW
      this.swList = [..._eswList] //, { product: 'MSW' }, { product: 'ESW' }]
      _devList.forEach(dev => {
        if (dev.product === 'EGW') {
          this.egInfo = dev
        } else if (dev.product === 'EAP') {
          this.apList.push(dev)
        } else if (dev.product === 'MSW') {
          this.swList.push(dev)
        }
      })
      // WAN口的上网方式
      this.ipinfo = _res[3].wan || {}
      this.wanProto =
        {
          dhcp: 'DHCP',
          pppoe: 'PPPoE',
          static: '静态地址'
        }[this.ipinfo.proto] || '-'
    },
    _loadFlowInfo() {
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
    _onToPath(path) {
      this.$router.push({
        name: path
      })
    },
    /**
     * 本机是网关，直接跳到“网关管理-> WAN设置"页面；
     * 本机是其他设备
     *  网络中存在网关时，此时网关做为从设备，需弹出到从设备的网关的“WAN设置”页面
     *  网络中没有网关时，此时就跳转到主设备的“WAN设置”页面
     */
    _onToNetWan() {
      let _wanPathName = 'admin/alone/network/network_wan'
      if (this.$dev() === 'egw') {
        this._onToPath(_wanPathName)
      } else {
        if (this.egInfo) {
          popDevDetail(
            {
              ip: this.egInfo.ip,
              sn: this.egInfo.serialNumber,
              initpath: _wanPathName
            },
            'NetView'
          )
        } else {
          if (this.$roles().includes('msw')) {
            _wanPathName = 'admin/alone/port/home_wan'
          }
          popDevDetail(
            {
              ip: this.curSysinfo.auth_ip,
              sn: this.curSysinfo.serial_num,
              initpath: _wanPathName
            },
            'NetView',
            this.curSysinfo.productType
          )
        }
      }
    },
    // 本机是网关，直接跳到“网关管理”页面；本机是其他设备（此时网关做为从设备），需弹出到从设备的网关页面
    _onToGateway() {
      if (this.$dev() === 'egw') {
        this._onToPath('admin/alone')
      } else {
        popDevDetail(
          {
            ip: this.egInfo.ip,
            sn: this.egInfo.serialNumber,
            initpath: 'admin/alone'
          },
          'NetView'
        )
      }
    },
    _onFresh() {
      this._loadNetInfo()
      this._loadUserCount()
      this.getNetStatus()
    },
    _getStatus(status) {
      let map = {
        ON: '在线',
        OFF: '离线',
        NEVER_ON: '从未上线'
      }
      return map[status]
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.overview-netview {
  min-width: 350px;

  .netview {
    i.fs36 {
      font-size: 36px;
    }
    strong {
      display: block;
    }
    .line {
      margin-bottom: 45px;
      border-bottom: 1px solid $theme;
      &.dotted {
        border-bottom-style: dotted;
      }
    }
    .caption {
      display: inline-block;
      background: $box-bgc;
      line-height: 25px;
      height: 25px;
      margin: 0 auto;
      min-width: 56px;
      border-radius: $--border-radius-base;
    }
    .w-auto {
      width: auto;
    }
    .mw230 {
      min-width: 230px;
    }
    @media only screen and (max-width: 768px) {
      .xs-hide {
        display: none;
      }
      .mw230 {
        min-width: auto;
      }
    }
  }
}
</style>
