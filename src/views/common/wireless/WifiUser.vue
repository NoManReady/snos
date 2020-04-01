<template>
  <div class="wifi-user">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue" v-show="showBwList">
      <el-tab-pane :label="$t('menu.wifi_user')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('macBwlist.title')" name="1"></el-tab-pane>
    </el-tabs>
    <wireless-user v-if="tabValue === '0'"></wireless-user>
    <mac-bw-list v-else-if="tabValue === '1'"></mac-bw-list>
  </div>
</template>
<script>
import WirelessUser from '@/views/common/wireless/components/WirelessUser'
import MacBwList from '@/views/common/wireless/components/MacBwList'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'WifiUser',
  mixins: [tabMixins],
  components: {
    WirelessUser,
    MacBwList
  },
  computed: {
    showBwList() {
      return this.$roles().includes('wifi_bwlist')
    }
  }
}
</script>
