<template>
  <div
    :element-loading-text="loadingText"
    class="backup-tab"
    element-loading-background="rgba(0, 0, 0, .1)"
    element-loading-spinner="el-icon-loading"
    v-loading.fullscreen="loading"
  >
    <help-alert :title="$t('systool.back_and_import')" json-key="backupJson">
      <div slot="content">
        <p class="mt10">{{ $t("systool.back_diff_tip") }}</p>
        <i18n path="systool.back_export_tip" tag="p">
          <span @click="onToRecover" class="c-success pointer">
            {{
            $t("systool.reset")
            }}
          </span>
        </i18n>
      </div>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">{{ $t("systool.back_cfg_info") }}</span>
    </div>
    <el-form label-width="160px" size="medium">
      <el-form-item :label="$t('systool.back_cfg')">
        <el-button @click.native="onBackup" class="w120" type="primary">
          {{
          $t("systool.backup")
          }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="box-header">
      <span class="box-header-tit">{{ $t("systool.export_cfg_info") }}</span>
    </div>
    <el-form label-width="160px" ref="baseForm" size="medium">
      <el-form-item :label="$t('systool.file_path')" class="vm">
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
            <el-input :placeholder="$t('systool.select_bin')" :value="file.name" class="w200" readonly></el-input>
            <el-button class="w120" plain type="primary">
              {{
              $t("systool.view")
              }}
            </el-button>
          </div>
          <el-button
            :disabled="!file.name"
            @click.native.stop="onSubmit"
            class="ml5 w120"
            type="primary"
          >{{ $t("systool.import") }}</el-button>
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
      loadingText: I18N.t('systool.uploading'),
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
        awaitOnLine(30000, I18N.t('systool.restoreing')).then(() => {
          window.top.location.reload()
        })
      } else {
        message = this.$message({
          showClose: true,
          type: 'error',
          duration: 5000,
          message: I18N.t('systool.require_valid_bin')
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
        message: I18N.t('systool.file_upgrade_fail')
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
          this.loadingText = I18N.t('systool.upload_per', {
            n: e.percent.toFixed(0)
          })
        } else {
          this.loadingText = I18N.t('systool.upload_success')
        }
      }
    },
    // 上传文件至服务器
    onSubmit() {
      this.$confirm(
        I18N.t('systool.back_import_confirm'),
        I18N.t('phrase.tip'),
        {
          confirmButtonText: I18N.t('action.confirm'),
          cancelButtonText: I18N.t('action.cancel'),
          type: 'info'
        }
      ).then(() => {
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
      this.$router.push({
        name: 'admin/alone/systool/systool_recover',
        query: { tab: '1' }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
