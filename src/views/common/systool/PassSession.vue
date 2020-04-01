<template>
  <div class="pass-session">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue" v-show="showPassword">
      <el-tab-pane :label="$t('menu.web_pass')" name="0" v-if="showPassword"></el-tab-pane>
      <el-tab-pane :label="$t('menu.web_session')" name="1"></el-tab-pane>
    </el-tabs>
    <pass-session-tabs :key="randomId" :type="tabValue"></pass-session-tabs>
  </div>
</template>
<script>
import PassSessionTabs from './passsession/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'PassSession',
  computed: {
    isEhr() {
      return this.$roles().includes('ehr')
    },
    isAlone() {
      return this.$roles().includes('alone')
    },
    showPassword() {
      return this.isEhr || this.isAlone
    }
  },
  mixins: [tabMixins],
  components: {
    PassSessionTabs
  },
  created() {
    this.tabValue = this.showPassword ? '0' : '1'
  }
}
</script>
