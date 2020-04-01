<template>
  <div class="network-lan">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue">
      <el-tab-pane :label="$t('network.lan_cfg')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('network.port_vlan')" name="5" v-if="isEgw && !isEhr"></el-tab-pane>
      <el-tab-pane :label="$t('network.client_list')" name="1"></el-tab-pane>
      <el-tab-pane :label="$t('network.static_addr_alloc')" name="2"></el-tab-pane>
      <el-tab-pane :label="$t('network.dhcp_cfg')" name="3" v-if="isEgw && !isEhr"></el-tab-pane>
      <el-tab-pane :label="$t('network.dns_proxy')" name="4" v-if="isEgw"></el-tab-pane>
    </el-tabs>
    <lan-tabs :key="randomId" :type="tabValue"></lan-tabs>
  </div>
</template>
<script>
import LanTabs from './lan/Index'
export default {
  name: 'NetworkLan',
  data() {
    return {
      tabValue: '0',
      randomId: Math.random()
    }
  },
  computed: {
    isEgw() {
      return this.$dev() === 'egw'
    },
    isEhr() {
      return this.$roles().includes('ehr')
    }
  },
  watch: {
    $route: {
      handler() {
        this.tabValue = this.$route.query.tab
      },
      immediate: true
    }
  },
  components: {
    LanTabs
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
