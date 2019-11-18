<template>
  <div class="systool-reload">
    <el-tabs v-model="tabValue" v-show="showTimeReload" @tab-click="_onTabClick">
      <el-tab-pane name="0" label="系统重启"></el-tab-pane>
      <el-tab-pane v-if="showTimeReload" name="1" label="定时重启"></el-tab-pane>
    </el-tabs>
    <reload-tabs :type="tabValue" :key="randomId"></reload-tabs>
  </div>
</template>
<script>
import ReloadTabs from './reload/Index'
export default {
  name: 'Reload',
  props: {
    tab: String,
    default: '0'
  },
  computed: {
    showTimeReload() {
      return !this.$roles().includes('slave')
    }
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
    ReloadTabs
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
