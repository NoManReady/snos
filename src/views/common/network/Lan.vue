<template>
  <div class="network-lan">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" label="LAN设置"></el-tab-pane>
      <el-tab-pane name="5" v-if="isEgw" label="端口VLAN"></el-tab-pane>
      <el-tab-pane name="1" label="客户端列表"></el-tab-pane>
      <el-tab-pane name="2" label="静态地址分配"></el-tab-pane>
      <el-tab-pane v-if="isEgw" name="3" label="DHCP选项"></el-tab-pane>
      <el-tab-pane v-if="isEgw" name="4" label="DNS代理"></el-tab-pane>
    </el-tabs>
    <lan-tabs :type="tabValue" :key="randomId"></lan-tabs>
  </div>
</template>
<script>
import LanTabs from './lan/Index'
export default {
  name: 'NetworkLan',
  props: {
    tab: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      tabValue: '0',
      randomId: Math.random()
    }
  },
  computed: {
    isEgw() {
      return this.$dev() === "egw"
    }
  },
  watch: {
    tab: {
      handler() {
        this.tabValue = this.tab
      },
      immediate: true
    }
  },
  components: {
    LanTabs
  },
  methods: {
    _onTabClick(v) {
      this.randomId = Math.random()
      this.$router.push({ query: { tab: v.name } })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
