<template>
  <div>
    <m-net-view class="block"></m-net-view>
    <div class="block mlr10 down-wrap" v-show="showDownload">
      <label class="lh">推荐下载APP管理网络</label>
      <el-button plain round size="small" type="primary">去下载</el-button>
      <el-button @click="hideDownload" class="fr" icon="el-icon-close fs20" type="text"></el-button>
    </div>
  </div>
</template>
<script>
import MNetView from '../quick/MNetView'
import { saveToSession, loadFromSession } from '@/utils/localStorage'
let HIDE_DOWNLOAD = 'APP_HIDE_DOWNLOAD'
export default {
  name: 'mapp',
  data() {
    return {
      showDownload: !loadFromSession(HIDE_DOWNLOAD)
    }
  },
  components: {
    MNetView
  },
  computed: {},
  async created() {},
  methods: {
    hideDownload() {
      this.showDownload = false
      saveToSession(HIDE_DOWNLOAD, true)
    }
  }
}
</script>
<style lang="scss" scoped>
.down-wrap {
  padding: 10px;
  line-height: 46px;
  .lh {
    line-height: 30px;
  }
}
</style>
