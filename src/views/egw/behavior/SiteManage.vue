<template>
  <div class="behavior-site-manage">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" :label="$t('egw.SiteManage.web_filter')"></el-tab-pane>
      <el-tab-pane name="1" :label="$t('egw.SiteManage.web_group')"></el-tab-pane>
    </el-tabs>
    <site-tabs :type="tabValue" :key="randomId"></site-tabs>
  </div>
</template>
<script>
import SiteTabs from './siteManage/Index'
export default {
  name: 'BehaviorSiteManage',
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
    SiteTabs
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