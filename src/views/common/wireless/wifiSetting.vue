<template>
  <div class="wifi-setting">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue">
      <el-tab-pane :label="$t('wifi_comm.wifi_net')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('wifi_comm.wifi_guest')" name="1"></el-tab-pane>
      <el-tab-pane :label="$t('wifi_comm.wifi_list')" name="2" v-if="!$roles().includes('ehr')"></el-tab-pane>
      <el-tab-pane :label="$t('wifi_comm.healthy_mode')" name="3"></el-tab-pane>
      <el-tab-pane :label="$t('wifi_comm.advanced_cfg')" name="4"></el-tab-pane>
    </el-tabs>
    <div class="wifi-setting-content">
      <wifi-tab :key="randomId" :type="tabValue"></wifi-tab>
    </div>
  </div>
</template>
<script>
import WifiTab from './components/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'Wifi',
  mixins: [tabMixins],
  components: {
    [WifiTab.name]: WifiTab
  }
}
</script>
