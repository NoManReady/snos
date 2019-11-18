<template>
  <div class="diagnose-tech">
    <help-alert title="故障收集">
      <div slot="content">打包设备配置文件到压缩文件，需解密解压，提供给开发人员的定位故障。</div>
    </help-alert>
    <el-button @click.native="onCollect" size="small" type="primary">一键收集</el-button>
  </div>
</template>
<script>
import { formSubmit } from '@/utils/utils'
export default {
  name: 'DiagnoseTech',
  data() {
    return {}
  },
  methods: {
    // 收集操作
    onCollect() {
      let _backupUrl = `${process.env.PROXY}${
        window.BASE_URI || process.env.BASE_PATH
      }/api/download?auth=${window.Cookie.get(window.sn)}`
      formSubmit(_backupUrl, { method: 'techSupport' })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
