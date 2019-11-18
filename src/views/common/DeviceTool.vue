<template>
  <!-- <el-button-group> -->
  <el-button @click.native="_onReload" plain round size="mini" type="primary">
    <i class="rjucd-reload fs16 pr5"></i>重启
  </el-button>
  <!-- <el-button @click.native="_onReset" plain size="mini" type="danger">恢复出厂配置</el-button> -->
  <!-- </el-button-group> -->
</template>
<script>
// import { ButtonGroup } from 'element-ui'
import { awaitOnLine_plus } from '@/utils'
export default {
  name: 'device-tool',
  // components: {
  //   [ButtonGroup.name]: ButtonGroup
  // },
  data() {
    return {}
  },
  methods: {
    async _onReload() {
      try {
        await this.$confirm('重启设备需要重新登录，是否确认重启？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$api.reboot()
        await awaitOnLine_plus({ text: '设备重启中...' })
        this.$alert('设备重启完成', '提示', {
          confirmButtonText: '刷新页面',
          callback: action => {
            window.top.location.reload()
          }
        })
      } catch (error) {}
    },
    async _onReset() {
      try {
        await this.$confirm(
          '确认要删除所有配置吗？此动作可能导致无法访问web页面！',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await this.$api.system('restoreConfiguration')
        await awaitOnLine_plus({ text: '设备重启中...' })
        window.top.location.reload()
      } catch (error) {}
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
