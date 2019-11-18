<template>
  <div class="recover-tab">
    <help-alert json-key="recoverJson" title="恢复出厂设置">
      <div slot="content">
        恢复出厂设置，将删除当前所有配置。如果当前系统存在有用的配置，可先
        <a @click="onBackup" class="c-success pointer" href="javascript:void();">导出当前配置</a> 后再恢复出厂设置。
      </div>
    </help-alert>
    <el-button @click.native="onRecover" class="w100" size="small" type="primary">恢复出厂设置</el-button>
  </div>
</template>
<script>
import { awaitOnLine } from '@/utils'
import { formSubmit } from '@/utils/utils'
export default {
  name: 'RecoverTab',
  data() {
    return {
      loading: false,
      allConf: '',
      searchConfig: '',
      loadingText: '设备重启中...'
    }
  },
  methods: {
    // 生成备份
    onBackup() {
      let _backupUrl = `${process.env.PROXY}${window.BASE_URI ||
        process.env.BASE_PATH}/api/download?auth=${window.Cookie.get(
        window.sn
      )}`
      formSubmit(_backupUrl, { method: 'backupConfig' })
    },
    // 恢复出厂配置
    onRecover() {
      this.$confirm(
        '此操作将删除所有自定义的配置信息并重启设备，确定恢复出厂设置？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$api.system('restoreConfiguration').then(d => {
          awaitOnLine(20000, '恢复出厂并重启设备中...').then(() => {
            window.location.reload()
          })
        })
      })
    },
    // 查看当前配置
    onViewConf(isClear) {
      this.searchConfig = this.searchConfig.trim()
      isClear && (this.searchConfig = '')
      this.$api.common('allConf', { search: this.searchConfig }).then(d => {
        this.allConf = d.conf
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-input {
  width: 200px;
}
</style>
