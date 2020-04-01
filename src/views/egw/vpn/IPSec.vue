<template>
  <div class="vpn-security">
    <el-tabs @tab-click="_onTabClick" v-model="tabValue">
      <el-tab-pane :label="$t('egw.ipsec.ipsec_security_policy')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('egw.ipsec.ipsec_link_status')" name="1"></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <ip-sec-tab :key="randomId" :type="tabValue"></ip-sec-tab>
    </keep-alive>
  </div>
</template>
<script>
import ipSecTab from './ipSecTab/Index'
import tabMixins from '@/mixins/tabMixins'
export default {
  name: 'vpn-security',
  components: {
    ipSecTab
  },
  mixins: [tabMixins]
}
</script>