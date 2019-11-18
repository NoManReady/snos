<template>
  <div class="authentication">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" v-if="showAppauth" label="微信/短信/一键认证"></el-tab-pane>
      <el-tab-pane name="1" v-if="showGuestauth" label="账号认证"></el-tab-pane>
      <el-tab-pane name="2" v-if="showGuestauth" label="授权访客上网"></el-tab-pane>
      <el-tab-pane name="3" v-if="showGuestauth" label="访客扫码上网"></el-tab-pane>
      <el-tab-pane name="4" v-if="showAppauth" label="免认证"></el-tab-pane>
      <el-tab-pane name="5" v-if="showAppauth" label="在线用户"></el-tab-pane>
    </el-tabs>
    <auth-tabs :type="tabValue" :key="randomId"></auth-tabs>
  </div>
</template>
<script>
import AuthTabs from './auth/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'Authentication',
  props: {
    tab: String,
    default: '0'
  },
  mixins: [tabMixins],
  components: {
    AuthTabs
  },
  computed: {
    showAppauth() {
      return this.$roles().includes('app_auth')
    },
    showGuestauth() {
      return this.$roles().includes('guest_auth')
    }
  },
  created () {
    this.tabValue = this.showAppauth ? '0' : this.showGuestauth ? '1' : '-1' // -1都没有显示空
  }
}
</script>
<style lang="scss" scoped>
</style>
