<template>
  <div class="vpn-pptp">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" label="PPTP服务器"></el-tab-pane>
      <el-tab-pane name="1" label="PPTP客户端"></el-tab-pane>
      <el-tab-pane name="2" label="隧道信息列表"></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <pptp-tab :type="tabValue"></pptp-tab>
    </keep-alive>
  </div>
</template>
<script>
import pptpTab from './Pptp'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'vpn-pptp',
  components: {
    pptpTab
  },
  mixins: [tabMixins],
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
</style>