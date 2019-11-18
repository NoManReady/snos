<template>
  <div
    :element-loading-text="loadingText"
    class="backup-tab"
    element-loading-background="rgba(0, 0, 0, .1)"
    element-loading-custom-class="eweb-loading"
    element-loading-spinner="el-icon-loading"
    v-loading.fullscreen="loading"
  >
    <help-alert json-key="backupJson" title="备份与导出">
      <div slot="content">
        <p class="mt10">如果您导入的配置文件版本与现有版本差距过大，有可能导致配置信息丢失。</p>
        <p class>
          导入配置前建议先
          <span @click="onToRecover" class="c-success pointer">恢复出厂</span>再导入配置！导入配置信息后，设备将自动重启。
        </p>
      </div>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">备份配置信息</span>
    </div>
    <el-form label-width="120px">
      <el-form-item label="备份配置">
        <el-button @click.native="onBackup" size="small w100" type="primary">备份</el-button>
      </el-form-item>
    </el-form>

    <div class="box-header">
      <span class="box-header-tit">导入配置信息</span>
    </div>
    <el-form label-width="120px" ref="baseForm">
      <el-form-item class="vm" label="文件路径">
        <el-upload
          :accept="accept"
          :action="actionUrl"
          :auto-upload="false"
          :before-upload="onBeforeUpload"
          :data="baseModel"
          :multiple="false"
          :name="formName"
          :on-change="onFileChange"
          :on-error="onError"
          :on-progress="onProgress"
          :on-success="onSuccess"
          :show-file-list="false"
          class="vm"
          ref="baseUpload"
        >
          <div slot="trigger">
            <el-input :value="file.name" class="w200" placeholder="请选择配置包" readonly size="small"></el-input>
            <el-button size="small w100" type="primary">浏览</el-button>
          </div>
          <el-button :disabled="!file.name" @click.native.stop="onSubmit" class="ml5 w100" size="small" type="primary">导入</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { awaitOnLine } from '@/utils'
import { formSubmit } from '@/utils/utils'
import { Upload } from 'element-ui'
let message = null
export default {
  name: 'BackupTab',
  data() {
    return {
      loading: false,
      loadingText: '上传中...',
      accept: '.gz',
      baseModel: {},
      file: {},
      actionUrl: `${process.env.PROXY}${window.BASE_URI ||
        process.env
          .BASE_PATH}/api/upload/restoreConfig?auth=${window.Cookie.get(
        window.sn
      )}`,
      formName: 'file'
    }
  },
  components: {
    [Upload.name]: Upload
  },
  beforeDestroy() {
    message && message.close()
  },
  activated() {
    message && message.close()
  },
  methods: {
    // 上传文件变更
    onFileChange(file, fileList) {
      this.$refs.baseUpload.uploadFiles = [file]
      if (file.status === 'ready') {
        this.file = file
      }
    },
    // 上传成功
    onSuccess(res, file) {
      this.$refs.baseUpload.clearFiles()
      this.loading = false
      this.file = {}
      if (res.code === 0) {
        awaitOnLine(30000, '配置恢复中...').then(() => {
          window.top.location.reload()
        })
      } else {
        message = this.$message({
          showClose: true,
          type: 'error',
          duration: 5000,
          message: '请上传正确的配置包'
        })
      }
    },
    // 上传失败
    onError(err) {
      this.loading = false
      this.$refs.baseUpload.clearFiles()
      this.file = {}
      message = this.$message({
        showClose: true,
        type: 'error',
        duration: 0,
        message: '文件上传失败，请重新上传'
      })
    },
    // 上传文件前
    onBeforeUpload(file, fileList) {
      message && message.close()
      return true
    },
    // 上传进度
    onProgress(e) {
      if (e.percent) {
        let _persent = e.percent.toFixed(0)
        if (_persent < 100) {
          this.loadingText = `上传中（${e.percent.toFixed(0)}%）`
        } else {
          this.loadingText = `上传成功`
        }
      }
    },
    // 上传文件至服务器
    onSubmit() {
      this.$confirm('确定导入配置并重启设备？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.loading = true
        this.$refs.baseUpload.submit()
      })
    },
    // 生成备份
    onBackup() {
      let _backupUrl = `${process.env.PROXY}${window.BASE_URI ||
        process.env.BASE_PATH}/api/download?auth=${window.Cookie.get(
        window.sn
      )}`
      formSubmit(_backupUrl, { method: 'backupConfig' })
    },
    onToRecover() {
      if (this.$roles().includes('alone')) {
        this.$parent.tabValue = '1'
      } else {
        this.$router.push({ name: 'admin/alone/systool/recover' })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
