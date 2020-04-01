<template>
  <div class="whitelist">
    <help-alert :title="$t('wifi_comm.dhcp_security')" json-key="dhcpSecurityJson"></help-alert>
    <el-form :model="globalModel" class="w460" :rules="globalModelRules" label-width="160px" ref="globalForm" size="medium">
      <el-form-item :label="$t('wifi_comm.ip_check')">
        <el-switch active-value="1" inactive-value="0" v-model="globalModel.ip_check"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('wifi_comm.arp_check')">
        <el-switch active-value="1" inactive-value="0" v-model="globalModel.arp_check"></el-switch>
      </el-form-item>
      <el-form-item v-if="globalModel.ip_check=='1'||globalModel.arp_check=='1'" :label="$t('wifi_comm.escap_time')" prop="escap_time">
        <el-input class="w300" v-model="globalModel.escap_time"></el-input>
        <span class="web-form--tip">{{$t('wifi_comm.escap_time_tip')}}</span>
        
      </el-form-item>
      <el-form-item>
        <el-button class="w160" type="primary" @click="_setDhcpSnoop">{{$t('action.save')}}</el-button>
      </el-form-item>
    </el-form>
    <dhcp-table @delete="onDel" @edit="onEdit" :dhcplist="globalModel.trust_intf_list" :title="$t('wifi_comm.trust_intf_list')" type="trust_intf_list"></dhcp-table>
    <dhcp-table @delete="onDel" @edit="onEdit" :dhcplist="globalModel.sercure_intf_list" :title="$t('wifi_comm.sercure_intf_list')" type="sercure_intf_list"></dhcp-table>
    <dhcp-table v-show="globalModel.ip_check=='1'||globalModel.arp_check=='1'" @delete="onDel" @edit="onEdit" :dhcplist="globalModel.static_ipmac_list" :title="$t('wifi_comm.static_ipmac_list')" type="static_ipmac_list"></dhcp-table>
  </div>
</template>
<script>
import {
  rangeValidator
} from '@/utils/rules'
import DhcpTable from './components/DhcpTable'
export default {
  name: 'Whitelist',
  data() {
    return {
      globalModel: {
        trust_intf_list: [],
        sercure_intf_list: [],
        static_ipmac_list: [],
        ip_check: '0',
        arp_check: '0',
        escap_time: '60'
      },
      globalModelRules: {
        escap_time: [
          {required: true, message: this.$t('wifi_comm.escap_time_is_required')},
          {validator: rangeValidator,min: 0,max: 60,message:this.$t('wifi_comm.escap_time_range')}
        ]
      },
    }
  },
  components: {
    DhcpTable
  },
  created() {
    this.init()
  },
  methods: {
    // 获取DHCP SNOOPING
    async init() {
      let _res = await this.$api.getDhcpSnoop()
      this.globalModel = Object.assign({}, this.globalModel, _res)
      this.globalModel.trust_intf_list = this.globalModel.trust_intf_list || []
      this.globalModel.sercure_intf_list = this.globalModel.sercure_intf_list || []
      this.globalModel.static_ipmac_list = this.globalModel.static_ipmac_list || []
    },
    //设置DHCP SNOOPING
    _setDhcpSnoop() {
      this.$refs.globalForm.validate(ok => {
        if (ok) {
          this.$api.setDhcpSnoop(this.globalModel).then(d => {
            this.$message({
              message:this.$t('tip.edit1_success'),
              type: 'success'
            })
          })
        }
      })
    },
    onDel(type, delData) {
      let setData = {}
      setData.data = this.globalModel[type].filter(
        item => delData.indexOf(item) < 0
      )
      this.globalModel[type] = setData.data
      this._setDhcpSnoop()
    },
    onEdit(type, data, row) {
      let setData = {}
      setData.data = this.globalModel[type] || []
      // let idx = row.idx < 0 ? setData.data.length + 1 : row.idx
      if (row.idx < 0) {
        setData.data.push(data)
      } else {
        setData.data.splice(row.idx, 1, data)
      }
      this._setDhcpSnoop()
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
