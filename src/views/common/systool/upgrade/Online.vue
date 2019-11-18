<template>
  <el-form :model="form" label-width="120px" ref="form" size="small">
    <help-alert json-key="exampleJson" title="在线升级">
      <div slot="content">在线升级会保留当前配置，升级过程中会重启设备，请不要刷新或关闭浏览器，升级成功会自动跳转到登录页。</div>
    </help-alert>
    <el-form-item label="当前版本号">
      <div :key="form.curVersion" v-html="form.curVersion" v-if="form.curVersion"></div>
      <div v-else>
        <i class="el-icon-loading f-theme"></i> 正在获取版本信息
      </div>
    </el-form-item>
    <div v-if="form.hasNewVersion">
      <el-form-item class="c-warning" label="新版本号">
        <div v-html="form.newVersion"></div>
      </el-form-item>
      <el-form-item label="新版本说明">
        <pre style="font-family: inherit;" v-html="form.versionDesc"></pre>
      </el-form-item>
      <el-form-item label="提示">
        <div>
          1、若您的设备无法访问外网，请点击
          <span @click="onDownload" class="pointer c-success">“下载升级包”</span>
          保存到本地电脑。
        </div>
        <div>
          2、接着通过
          <span @click="onToLocalUpgrade" class="pointer c-success">“本地升级”</span>
          页面，选取升级包文件上传到设备进行升级。
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click.native="onUpgrade()" size="small" type="primary">马上升级（推荐）</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>
<script>
import { getOnlineVers, upgradeOnlineVers } from '@/utils'
export default {
  name: 'UpgradeOnline',
  data() {
    return {
      form: {
        curVersion: '',
        newVersion: '',
        versionDesc: '',
        hasNewVersion: false,
        downloadPath: ''
      },
      loading: {}
    }
  },
  async created() {
    this.form = await getOnlineVers()
  },
  methods: {
    onDownload() {
      window.open(this.form.downloadPath, '_blank')
    },
    onToLocalUpgrade() {
      if (this.$roles().includes('alone')) {
        this.$parent.tabValue = '1'
      } else {
        this.$router.push({ name: 'admin/alone/systoll/local' })
      }
    },
    onUpgrade() {
      upgradeOnlineVers(this.form)
    }
  }
}
</script>
<style lang="scss">
</style>
