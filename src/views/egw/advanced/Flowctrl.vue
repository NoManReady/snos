<template>
  <div class="advanced-flowctrl">
    <el-tabs v-model="tabValue" @tab-click="_onTabClick">
      <el-tab-pane name="0" :label="$t('egw.flowctrl.smart_flow_control')"></el-tab-pane>
      <el-tab-pane v-if="switchOn" name="1" :label="$t('egw.flowctrl.coustom_strategy')"></el-tab-pane>
      <!-- <el-tab-pane v-if="switchOn" name="2" label="应用流控"></el-tab-pane> -->
    </el-tabs>
    <flow-tabs @smart-change='onSmartChange' :type="tabValue" :smart-data='smartFlow' :key="randomId"></flow-tabs>
  </div>
</template>
<script>
import FlowTabs from './flowctrl/Index'
export default {
  name: 'Flowctrl',
  props: {
    tab: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      switchOn: false,
      smartFlow: false,
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
    FlowTabs
  },
  async created() {
    this.smartFlow = await this.$api.getSmartFlow()
    this.switchOn = this.smartFlow.tcSwitch === 'on'
  },
  methods: {
    onSmartChange(v) {
      this.switchOn = v === 'on'
    },
    _onTabClick(v) {
      this.randomId = Math.random()
      this.$router.push({ query: { tab: v.name } })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
