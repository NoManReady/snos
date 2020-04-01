<template>
  <div class="authentication">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" :label="$t('egw.l2tp.global')"></el-tab-pane>
      <el-tab-pane v-if="false" name="1" label="IP地址池"></el-tab-pane>
      <el-tab-pane name="2" :label="$t('egw.auth.user_manager')"></el-tab-pane>
      <el-tab-pane name="3" :label="$t('egw.pppoe.except_ip')"></el-tab-pane>
      <el-tab-pane name="4" :label="$t('egw.online_user')"></el-tab-pane>
    </el-tabs>
    <menu-tabs :type="tabValue" :key="randomId"></menu-tabs>
  </div>
</template>
<script>
import menuTabs from './pppoe/Index'
export default {
  name: 'Pppoe',
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
