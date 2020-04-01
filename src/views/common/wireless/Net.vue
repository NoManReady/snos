<template>
  <div class="whitelist">
    <help-alert :title="$t('wifi_comm.net_security')" json-key="acNetJson">
      <div slot="content">
        <label class="c-warning">{{$t('wifi_comm.net_security_tip')}}</label>
      </div>
    </help-alert>
    <el-form :model="globalModel" class="w460" :rules="globalModelRules" label-width="160px" ref="globalForm" size="medium">
      <el-form-item :label="$t('wifi_comm.rate_switch')">
        <el-switch active-value="1" inactive-value="0" v-model="globalModel.bridge_enable"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('wifi_comm.arp_burst')" prop="arp_burst" v-if="globalModel.bridge_enable=='1'">
        <el-input class="w300" v-model="globalModel.arp_burst"></el-input>
        <span class="web-form--tip">{{$t('wifi_comm.burst_tip')}}</span>
      </el-form-item>
      <el-form-item :label="$t('wifi_comm.broadcast_burst')" prop="broadcast_burst" v-if="globalModel.bridge_enable=='1'">
        <el-input class="w300" v-model="globalModel.broadcast_burst"></el-input>
        <span class="web-form--tip">{{$t('wifi_comm.burst_tip')}}</span>
      </el-form-item>
      <el-form-item :label="$t('wifi_comm.multicast_burst')" prop="multicast_burst" v-if="globalModel.bridge_enable=='1'">
        <el-input class="w300" v-model="globalModel.multicast_burst"></el-input>
        <span class="web-form--tip">{{$t('wifi_comm.burst_tip')}}</span>
      </el-form-item>
      <el-form-item>
        <el-button class="w160" type="primary" @click="_setDhcpSnoop">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import {
  rangeValidator
} from '@/utils/rules'
export default {
  name: 'Net',
  data() {
    return {
      globalModel: {
        bridge_enable:"0",
        arp_burst:"", 
        arp_rate:'', 
        broadcast_burst:"", 
        broadcast_rate:'', 
        multicast_burst:"",
        multicast_rate:''
      },
      globalModelRules: {
        arp_burst: [
          {required: true, message: this.$t('wifi_comm.arp_burst_is_required')},
          {validator: rangeValidator,min: 0,max: 100000,message:this.$t('wifi_comm.arp_burst_range')}
        ],
        broadcast_burst: [
          {required: true, message: this.$t('wifi_comm.broadcast_burst_is_required')},
          {validator: rangeValidator,min: 0,max: 100000,message:this.$t('wifi_comm.broadcast_burst_range')}
        ],
        multicast_burst: [
          {required: true, message: this.$t('wifi_comm.ulticast_burst_is_required')},
          {validator: rangeValidator,min: 0,max: 100000,message:this.$t('wifi_comm.ulticast_range')}
        ]
      },
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 获取DHCP SNOOPING
    async init() {
      let _res = await this.$api.getNet()
      this.globalModel = Object.assign({}, this.globalModel, _res)
    },
    //设置DHCP SNOOPING
    _setDhcpSnoop() {
      this.$refs.globalForm.validate(ok => {
        if (ok) {
          this.globalModel.arp_rate = this.globalModel.arp_burst
          this.globalModel.broadcast_rate = this.globalModel.broadcast_burst
          this.globalModel.multicast_rate = this.globalModel.multicast_burst
          this.$api.setNet(this.globalModel).then(d => {
            this.$message({
              message:this.$t('tip.edit1_success'),
              type: 'success'
            })
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
