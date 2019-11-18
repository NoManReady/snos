<template>
  <div class="home-overview">
    <el-row :gutter="10" class="tc">
      <!-- 当前登录设备 -->
      <el-col :lg="isMsw?12:8" :md="isMsw?12:10" :span="24">
        <cur-dev-info class="auto-height" ref="CurDevInfo" />
      </el-col>
      <!-- 无线信息 -->
      <el-col :lg="16" :md="14" :span="24" v-if="showWifiInfo">
        <wifi-info class="auto-height" />
      </el-col>
      <!-- 整网拓扑 -->
      <el-col :lg="isMsw?12:24" :md="isMsw?12:10" :span="24">
        <net-view class="auto-height" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import CurDevInfo from './components/CurDevInfo'
import NetView from './components/NetView'
import WifiInfo from './components/WifiInfo'
import { Col, Row } from 'element-ui'
export default {
  name: 'Overview',
  data() {
    return {}
  },
  components: {
    [Col.name]: Col,
    [Row.name]: Row,
    CurDevInfo,
    NetView,
    WifiInfo
  },
  computed: {
    // 判断msw
    isMsw() {
      return this.$roles().includes('msw')
    },
    // 显示无线信息
    showWifiInfo() {
      return (
        !this.isMsw &&
        (this.$roles().includes('master') || this.$roles().includes('ewr'))
      )
    }
  }
}
</script>
<style lang="scss" scope>
.home-overview {
  min-width: 380px;
  .auto-height {
    height: auto;
  }
  @media only screen and (min-width: 992px) {
    .auto-height {
      height: 190px;
    }
  }
}
</style>
