<template>
  <div class="authentication">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" v-if="showAppauth" :label="$t('egw.auth.wechat_sms_one_click_authentication')"></el-tab-pane>
      <el-tab-pane name="1" v-if="showGuestauth" :label="$t('egw.auth.auth_user')"></el-tab-pane>
      <el-tab-pane name="2" v-if="showGuestauth" :label="$t('egw.auth.access_custom_net')"></el-tab-pane>
      <el-tab-pane name="3" v-if="showGuestauth" :label="$t('egw.auth.custom_code_scanning')"></el-tab-pane>
      <el-tab-pane name="4" v-if="showAppauth" :label="$t('egw.auth.certification_free')"></el-tab-pane>
      <el-tab-pane name="5" v-if="showAppauth" :label="$t('egw.auth.online_user')"></el-tab-pane>
    </el-tabs>
    <auth-tabs :type="tabValue" :key="randomId"></auth-tabs>
  </div>
</template>
<script>
import AuthTabs from './auth/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'Authentication',
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
