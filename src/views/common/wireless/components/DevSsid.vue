<template>
  <div class="dev-ssid">
    <help-alert :json-key="jsonKey" key="jsonKey" type="info">
      <span slot="title">
        <p v-if="existIndepend||isDevGroup">
          <strong class="c-warning">此分组</strong>配置了
          <span class="c-warning">公寓Wi-Fi</span>
          <!-- <a class="c-success pointer" @click="showModal = true">公寓WI-Fi【查看】</a> -->
          ，不支持本地修改，去
          <a class="c-success" href="https://noc.ruijie.com.cn/nocindex/" target="_blank">诺客</a>修订。
        </p>
        <p class="mt5" v-if="isSlave">
          <strong class="c-warning">从AP</strong>由主AP统一管理，不支持本地修改。如要做单台AP管理Wi-Fi，请点击页头栏【自组网开关】并切换为关闭状态。
        </p>
      </span>
      <template slot="content">
        <p :class="isSlave || isDevGroup ? 'mt10' : 'mt5'">提示：修改配置会重启无线配置，可能导致当前连接的终端掉线。</p>
        <p class="c-warning" v-if="isDefWanIp">WAN口未获取到IP，WiFi将使用本机分配的192.168.120.0/24段的IP，请确认上联是否存在DHCP服务器。</p>
      </template>
    </help-alert>
    <!-- 公寓SSID -->
    <el-dialog :visible.sync="showModal" @open="_onOpenModel" title="公寓Wi-Fi配置" width="640px">
      <el-table :data="devWireless.ssidList.slice(0,Math.min(this.max,devWireless.ssidList.length))" size="small" stripe>
        <el-table-column label="Wi-Fi名称" prop="ssidName"></el-table-column>
        <el-table-column align="center" label="应用频段" prop="relatedRadio">
          <template slot-scope="scope">{{getRadioName(scope.row.relatedRadio)}}</template>
        </el-table-column>
        <el-table-column align="center" label="加密类型" prop="encryptionMode">
          <template slot-scope="scope">{{scope.row.encryptionMode.toUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" label="是否隐藏" prop="ishidden">
          <template slot-scope="scope">{{scope.row.ishidden==='true'?'是':'否'}}</template>
        </el-table-column>
        <el-table-column align="center" label="转发类型" prop="fowardType">
          <template slot-scope="scope">{{scope.row.fowardType==='bridge'?'AP模式(桥接)':'路由模式(NAT)'}}</template>
        </el-table-column>
        <el-table-column :formatter="formatVlanId" align="center" label="VLAN ID" prop="vlanId"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'DevSsid',
  props: {
    max: {
      type: Number,
      default: 8
    },
    isDevGroup: Boolean,
    jsonKey: {
      type: String,
      default: 'wifiJson'
    }
  },
  data() {
    return {
      showModal: false,
      existIndepend: false,
      devWireless: {
        ssidList: []
      },
      isDefWanIp: false
    }
  },
  computed: {
    // 从AP模式
    isSlave() {
      return this.$roles().includes('slave')
    },
    isEap() {
      return true //this.$dev() === "eap"
    }
  },
  created() {
    // this._loadDevWiress() // 去掉公寓Wi-Fi的全局提示信息
    if (this.isEap) {
      this._getWanIp()
    }
  },
  methods: {
    async _onOpenModel() {
      this.devWireless = await this.$api.getWirelessIndepend()
    },
    // 获取wan口ip
    async _getWanIp() {
      const _res = await this.$api.getWanIp()
      this.isDefWanIp = _res.wan && _res.wan.ip === '10.44.77.254'
    },
    // 获取公寓Wi-Fi信息
    async _loadDevWiress() {
      let _res = await this.$api.getExistIndepend()
      this.existIndepend = _res.independ === 'true'
    },
    // 获取射频名称
    getRadioName(radioIndex) {
      let _rsMap = {
        '1': '2.4G',
        '2': '5G',
        '1,2': '2.4G + 5G'
      }
      return _rsMap[radioIndex]
    },
    // vlanId格式化
    formatVlanId(row, column) {
      return (
        {
          '1': '与AP同VLAN',
          '233': '-'
        }[row.vlanId] || row.vlanId
      )
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
