<template>
  <div class="block overview-cur-dev-info mb10">
    <el-row align="middle" justify="center" type="flex">
      <el-col class="c-info tl">{{ $t("overview.cur_dev") }}</el-col>
      <el-col class="tr">
        <el-button @click="_onPopDevDetail" type="text">{{ $t("action.config") }}></el-button>
      </el-col>
    </el-row>
    <dev-info :show-cur="true" :timer="false" />
  </div>
</template>
<script>
import DevInfo from '@/views/common/overview/components/DevInfo'
import { popDevDetail } from '@/utils/iframeUtils'
export default {
  name: 'CurDevInfo',
  data() {
    return {}
  },
  components: {
    DevInfo
  },
  methods: {
    _onPopDevDetail() {
      popDevDetail(false, 'CurDevInfo')
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
