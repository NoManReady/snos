<template>
  <div class="wifi-setting">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue">
      <el-tab-pane label="无线网络" name="0"></el-tab-pane>
      <el-tab-pane label="访客Wi-Fi" name="1"></el-tab-pane>
      <el-tab-pane label="Wi-Fi列表" name="2"></el-tab-pane>
      <el-tab-pane label="健康模式" name="3"></el-tab-pane>
      <el-tab-pane label="黑白名单" v-if="$roles().includes('wifi_bwlist')" name="5"></el-tab-pane>
      <el-tab-pane label="高级设置" name="4"></el-tab-pane>
    </el-tabs>
    <div class="wifi-setting-content">
      <wifi-tab :key="randomId" :type="tabValue"></wifi-tab>
    </div>
  </div>
</template>
<script>
import WifiTab from './components/Index'
export default {
  name: 'Wifi',
  props: ['tab'],
  data() {
    return {
      tabValue: '0',
      randomId: Math.random()
    }
  },
  components: {
    [WifiTab.name]: WifiTab
  },
  watch: {
    tab: {
      handler() {
        this.tabValue = this.$route.query.tab
      },
      immediate: true
    }
  },
  methods: {
    _onTabClick(v) {
      this.randomId = Math.random()
      this.$router.push({ query: { tab: v.name } })
    }
  }
}
</script>
