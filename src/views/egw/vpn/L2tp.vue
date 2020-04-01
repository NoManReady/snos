<template>
  <div class="vpn-l2tp">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue">
      <el-tab-pane :label="$t('egw.l2tp.l2tp_service')" name="0" v-if="showServer"></el-tab-pane>
      <el-tab-pane :label="$t('egw.l2tp.l2tp_initiator')" name="1" v-if="showClient"></el-tab-pane>
      <el-tab-pane :label="$t('egw.l2tp.tunnel_information_tab')" name="2"></el-tab-pane>
    </el-tabs>
    <l2tp-tab :key="randomId" :type="tabValue"></l2tp-tab>
  </div>
</template>
<script>
import l2tpTab from './l2tpTab/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'vpn-l2tp',
  components: {
    l2tpTab
  },
  mixins: [tabMixins],
  computed: {
    showServer() {
      return this.$roles().includes('l2tp_server')
    },
    showClient() {
      return this.$roles().includes('l2tp_client')
    }
  },
  created() {
    this.tabValue = this.showServer ? '0' : this.showClient ? '1' : '2'
  }
}
</script>
<style lang="scss" scoped>
</style>