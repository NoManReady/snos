<template>
  <div class="vpn-pptp">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue">
      <el-tab-pane :label="$t('egw.pptp.pptp_service')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('egw.pptp.pptp_initiator')" name="1"></el-tab-pane>
      <el-tab-pane :label="$t('egw.pptp.tunnel_information_tab')" name="2"></el-tab-pane>
    </el-tabs>
    <pptp-tab :key="randomId" :type="tabValue"></pptp-tab>
  </div>
</template>
<script>
import pptpTab from './pptpTab/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'vpn-pptp',
  components: {
    pptpTab
  },
  mixins: [tabMixins],
  computed: {
    showServer() {
      return this.$roles().includes('pptp_server')
    },
    showClient() {
      return this.$roles().includes('pptp_client')
    }
  },
  created() {
    this.tabValue = this.showServer ? '0' : this.showClient ? '1' : '2'
  }
}
</script>
<style lang="scss" scoped>
</style>