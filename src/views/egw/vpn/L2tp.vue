<template>
  <div class="vpn-l2tp">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" v-if="showServer" label="L2TP服务器"></el-tab-pane>
      <el-tab-pane name="1" v-if="showClient" label="L2TP客户端"></el-tab-pane>
      <el-tab-pane name="2" label="隧道信息列表"></el-tab-pane>
    </el-tabs>
    <l2tp-tab :type="tabValue" :key="randomId"></l2tp-tab>
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