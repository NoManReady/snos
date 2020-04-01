<template>
  <div class="home-overview">
    <el-row :gutter="10" class="tc">
      <!-- 当前登录设备 -->
      <el-col :lg="9" :md="11" :span="24">
        <cur-dev-info class="auto-height" ref="CurDevInfo" />
      </el-col>
      <!-- 无线信息 -->
      <el-col :lg="15" :md="13" :span="24">
        <net-view class="auto-height" v-if="isMsw" />
        <wifi-info class="auto-height" v-else />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="tc" v-if="!isMsw">
      <!-- 整网拓扑 -->
      <el-col>
        <net-view />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import CurDevInfo from '@/views/common/overview/components/CurDevInfo'
import NetView from '@/views/common/overview/components/NetView'
import WifiInfo from '@/views/common/overview/components/WifiInfo'
export default {
  name: 'Overview',
  data() {
    return {}
  },
  components: {
    CurDevInfo,
    NetView,
    WifiInfo
  },
  computed: {
    isMsw() {
      return this.$roles().includes('msw')
    }
  }
}
</script>
<style lang="scss" scope>
.home-overview {
  // min-width: 380px;
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
