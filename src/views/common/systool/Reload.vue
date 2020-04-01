<template>
  <div class="systool-reload">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue" v-show="showTimeReload">
      <el-tab-pane :label="$t('systool.reboot')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('systool.reboot_time')" name="1" v-if="showTimeReload"></el-tab-pane>
    </el-tabs>
    <reload-tabs :key="randomId" :type="tabValue"></reload-tabs>
  </div>
</template>
<script>
import ReloadTabs from './reload/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'Reload',
  computed: {
    showTimeReload() {
      return !this.$roles().includes('slave')
    }
  },
  mixins: [tabMixins],
  components: {
    ReloadTabs
  }
}
</script>
