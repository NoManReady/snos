<template>
  <div class="authentication">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" :label="$t('egw.route.priority_route')"></el-tab-pane>
      <el-tab-pane name="1" :label="$t('egw.route.route_static')"></el-tab-pane>
    </el-tabs>
    <menu-tabs :type="tabValue" :key="randomId"></menu-tabs>
  </div>
</template>
<script>
import menuTabs from './route/Index'
export default {
  name: 'Router',
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
   menuTabs
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
