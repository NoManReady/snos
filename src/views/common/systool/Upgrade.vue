<template>
  <div class="systool-upgrade">
    <el-tabs v-model="tabValue" v-show="showOnlineTab" @tab-click="_onTabClick">
      <el-tab-pane v-if="showOnlineTab" name="0" label="在线升级"></el-tab-pane>
      <el-tab-pane name="1" label="本地升级"></el-tab-pane>
    </el-tabs>
    <upgrade-tabs :type="tabValue" :key="randomId"></upgrade-tabs>
  </div>
</template>
<script>
import UpgradeTabs from './upgrade/Index'
export default {
  name: 'Upgrade',
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
  created() {
    this.tabValue = this.showOnlineTab ? this.tab : '1'
  },
  components: {
    UpgradeTabs
  },
  computed: {
    showOnlineTab() {
      return !this.$roles().includes('slave') && !this.$roles().includes('eac')
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
<style lang="scss" scoped>
</style>
