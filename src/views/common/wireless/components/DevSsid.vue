<template>
  <div class="dev-ssid">
    <help-alert :json-key="jsonKey" key="jsonKey" type="info">
      <span slot="title">
        <p v-if="existIndepend||isDevGroup">
          <i18n path="wifi_comm.unsupport_local_cfg" tag="span">
            <a class="c-success" href="https://noc.ruijie.com.cn/nocindex/" target="_blank">{{$t('wifi_comm.noc')}}</a>
          </i18n>
        </p>
        <p class="mt5" v-if="isSlave">{{$t('wifi_comm.dev_ssid_tip')}}</p>
      </span>
      <template slot="content">
        <p :class="isSlave || isDevGroup ? 'mt10' : 'mt5'">{{$t('wifi_comm.dev_ssid_tip1')}}</p>
        <p class="c-warning" v-if="isDefWanIp">{{$t('wifi_comm.dev_ssid_tip2')}}</p>
      </template>
    </help-alert>
    <!-- 公寓SSID -->
    <el-dialog :title="$t('wifi_comm.dev_ssid_cfg')" :visible.sync="showModal" @open="_onOpenModel" width="640px">
      <el-table :data="devWireless.ssidList.slice(0,Math.min(this.max,devWireless.ssidList.length))" size="medium" stripe>
        <el-table-column :label="$t('quickmacc.wifi_name')" prop="ssidName"></el-table-column>
        <el-table-column :label="$t('wifi_comm.apply_radio')" align="center" prop="relatedRadio">
          <template slot-scope="scope">{{getRadioName(scope.row.relatedRadio)}}</template>
        </el-table-column>
        <el-table-column :label="$t('wifi_comm.encry_type')" align="center" prop="encryptionMode">
          <template slot-scope="scope">{{scope.row.encryptionMode.toUpperCase()}}</template>
        </el-table-column>
        <el-table-column :label="$t('wifi_comm.is_hidden')" align="center" prop="ishidden">
          <template slot-scope="scope">{{scope.row.ishidden==='true'?$t('phrase.yes'):$t('phrase.no')}}</template>
        </el-table-column>
        <el-table-column :label="$t('wifi_comm.trans_type')" align="center" prop="fowardType">
          <template slot-scope="scope">{{scope.row.fowardType==='bridge'?$t('wifi_comm.ap_mode'):$t('wifi_comm.nat_mode')}}</template>
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
      return this.$dev() === 'eap'
    }
  },
  created() {
    // this._loadDevWiress() // 去掉公寓Wi-Fi的全局提示信息
    if (this.isEap) {
      setTimeout(() => {
        this._getWanIp()
      }, 3000)
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
          '1': I18N.t('wifi_comm.sameas_ap'),
          '233': '-'
        }[row.vlanId] || row.vlanId
      )
    }
  }
}
</script>
