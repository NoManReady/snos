<template>
  <div class="system-reload">
    <help-alert json-key="reloadJson" title="系统重启">
      <div slot="content">在系统重启过程中，请不要将设备断电！</div>
      <div slot="collapseFoot">
        <h3>注意：</h3>
        <p>在系统重启过程中，请不要将设备断电！</p>
      </div>
    </help-alert>
    <el-button @click.native="onReload" size="small" type="primary">重启系统</el-button>
  </div>
</template>
<script>
import { awaitOnLine } from '@/utils'
export default {
  name: 'SystemReload',
  data() {
    return {}
  },
  methods: {
    // 重启操作
    onReload() {
      this.$confirm('重启设备需要重新登录，是否确认重启？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api.reboot().then(d => {
          awaitOnLine(30000, '设备重启中...').then(() => {
            window.top.location.reload()
          })
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
