<template>
  <div class="vpn-security">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" label="IPSec安全策略"></el-tab-pane>
      <el-tab-pane name="1" label="IPSec连接状态"></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <ip-sec-tab :type="tabValue" :key="randomId"></ip-sec-tab>
    </keep-alive>
  </div>
</template>
<script>
import ipSecTab from './ipSecTab/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'vpn-security',
  components: {
    ipSecTab
  },
  mixins: [tabMixins],
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
</style>