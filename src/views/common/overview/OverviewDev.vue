<template>
  <div class="home-overview">
    <!-- 设备概况 -->
    <device-info ref="deviceInfo" />
    <!-- 设备详细信息 -->
    <sys-info />
    <wifi-info header-style="title" v-if="showWifiInfo" />
    <!-- 接口信息 -->
    <port-status ref="ifaceInfo" />
  </div>
</template>
<script>
import DeviceInfo from './components/DeviceInfo'
import SysInfo from './components/SysInfo'
import PortStatus from './components/PortStatus'
import WifiInfo from './components/WifiInfo'
export default {
  name: 'OverviewDev',
  data() {
    return {}
  },
  computed: {
    // 显示无线信息
    showWifiInfo() {
      return !!this.$store.getters.capacity.wireless // 有无线的能力值
    }
  },
  mounted() {
    this.$nextTick(async () => {
      let _refs = this.$refs
      await _refs.deviceInfo.init()
      await _refs.ifaceInfo.init()
    })
  },
  components: {
    SysInfo,
    DeviceInfo,
    PortStatus,
    WifiInfo
  }
}
</script>
<style lang="scss">
</style>
