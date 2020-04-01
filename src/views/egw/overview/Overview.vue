<template>
  <div class="home-overview">
    <el-row :gutter="10" class="tc">
      <!-- 当前登录设备 -->
      <el-col :lg="9" :md="11" :span="24">
        <cur-dev-info class="auto-height" ref="CurDevInfo" />
      </el-col>
      <!-- 无线信息 -->
      <el-col :lg="15" :md="13" :span="24">
        <wifi-info class="auto-height" />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="tc">
      <!-- 整网拓扑 -->
      <el-col>
        <net-view />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="tc">
      <!-- 流量走势 -->
      <el-col :span="24">
        <flow-trend ref="flowInfo" v-if="showChartFlow" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import CurDevInfo from '@/views/common/overview/components/CurDevInfo'
import NetView from '@/views/common/overview/components/NetView'
import WifiInfo from '@/views/common/overview/components/WifiInfo'
import FlowTrend from '@/views/egw/FlowTrend'
export default {
  name: 'Overview',
  data() {
    return {}
  },
  created() {},
  mounted() {
    this.$nextTick(async () => {
      let _refs = this.$refs
      if (this.showChartFlow) {
        await _refs.flowInfo.init()
      }
    })
  },
  components: {
    CurDevInfo,
    NetView,
    WifiInfo,
    FlowTrend
  },
  computed: {
    // 显示流量图表
    showChartFlow() {
      return this.$roles().includes('egw') && this.$roles().includes('ROUTER')
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
