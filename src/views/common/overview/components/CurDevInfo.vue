<template>
  <div class="block overview-cur-dev-info mb10">
    <el-row align="middle" justify="center" type="flex">
      <el-col class="c-info tl">当前登录设备</el-col>
      <el-col class="tr">
        <el-button @click="_onPopDevDetail" type="text">配置></el-button>
      </el-col>
    </el-row>
    <dev-info :alone="false" :timer="false" />
  </div>
</template>
<script>
import { Col, Row } from 'element-ui'
import DevInfo from '@/views/common/overview/components/DevInfo'
import { popDevDetail } from '@/utils/iframeUtils'
export default {
  name: 'CurDevInfo',
  data() {
    return {}
  },
  components: {
    DevInfo,
    [Col.name]: Col,
    [Row.name]: Row
  },
  computed: {
    sysinfo() {
      return this.$store.getters.sysinfo
    },
    curSysinfo() {
      return window.top.APP_SYSINFO || this.sysinfo
    }
  },
  methods: {
    _onPopDevDetail() {
      popDevDetail(
        {
          ip: this.curSysinfo.auth_ip,
          sn: this.curSysinfo.serial_num
        },
        'CurDevInfo',
        this.curSysinfo.productType
      )
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
