<template>
  <div class="advanced-nat">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" label="端口映射"></el-tab-pane>
      <el-tab-pane name="1" label="NAT-DMZ"></el-tab-pane>
    </el-tabs>
    <nat-tabs :type="tabValue" :key="randomId"></nat-tabs>
  </div>
</template>
<script>
import NatTabs from './nat/Index'
export default {
  name: 'AdvancedNat',
  props: {
    tab: String,
    default: '0'
  },
  data() {
    return {
      tabValue: '0',
      randomId: Math.random()
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
    NatTabs
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
