<template>
  <div
    :element-loading-text="loadingText"
    class="sys-tab"
    element-loading-background="rgba(0, 0, 0, .3)"
    element-loading-spinner="el-icon-loading"
    v-loading.fullscreen="loading"
  >
    <help-alert :title="$t('systool.local_upgrade')" json-key="localUpdateJson">
      <p slot="content">{{ $t("systool.upgrade_tip1") }}</p>
      <div slot="collapseFoot">
        <h3 class="tit">{{ $t("phrase.notice") }}</h3>
        <p class="desc">{{ $t("systool.upgrade_tip2") }}</p>
      </div>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="medium">
      <el-form-item :label="$t('sysinfo.dev_type')">
        <span>{{ sysinfo.product_class }}</span>
      </el-form-item>
      <el-form-item :label="$t('systool.cur_version')">
        <span @click.ctrl="$refs.develop.onShowDevelop()" ref="softVersion">{{ sysinfo.software_version }}</span>
        <span class="ml10">{{ sysinfo.hardware_version }}</span>
      </el-form-item>
      <develop ref="develop"></develop>
      <el-form-item :label="$t('systool.keep_cfg')">
        <el-checkbox :label="$t('systool.bin_diff_large')" v-model="baseModel.isPersist"></el-checkbox>
      </el-form-item>
      <el-form-item :label="$t('systool.pack_path')" class="vm">
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
          class="base-upload vm"
          ref="baseUpload"
        >
          <div slot="trigger">
            <el-input :placeholder="$t('systool.select_bin')" :value="file.name" class="w200" readonly></el-input>
            <el-button class="w120" plain type="primary">{{ $t("systool.view") }}</el-button>
          </div>
          <el-button :disabled="!file.name" @click.native.stop="onSubmit" class="ml5 w120" type="primary">{{$t('action.upload')}}</el-button>
        </el-upload>
      </el-form-item>
      <auto-upgrade v-if="$roles().includes('ehr')"></auto-upgrade>
    </el-form>
    <!-- 文件信息 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="$t('systool.file_info')"
      :visible.sync="fileModal"
      @close="onModalCancel"
      width="490px"
    >
      <help-alert :closable="false" :title="$t('systool.upload_success')" show-icon type="info"></help-alert>
      <div v-if="fileInfo">
        <div class="mt10" style="display:flex;" v-if="fileInfo.name">
          <span class="vm tr w100">{{ $t("systool.bin_name_f") }}</span>
          <div class="vm" style="flex:1;">
            <p style="word-break: break-all;">{{ fileInfo.name }}</p>
          </div>
        </div>
        <div class="mt10">
          <span class="vm tr w100">{{ $t("systool.bin_size_f") }}</span>
          <span class="vm">{{ fileInfo.size | rateTrans }}</span>
          <span class="vm c-warning" v-if="!fileInfo.valid">{{ $t("systool.file_bin_size_over") }}</span>
        </div>
        <div class="mt10">
          <span class="vm tr w100">{{ $t("phrase.tip_f") }}</span>
          <span class="vm" v-if="baseModel.isPersist">{{ $t("systool.keep_cfg_upgrade") }}</span>
          <span class="vm" v-else>{{ $t("systool.clear_cfg_upgrade") }}</span>
          <!-- <el-checkbox v-model="baseModel.isPersist" label="保留配置"></el-checkbox> -->
        </div>
      </div>
      <span class="dialog-footer" slot="footer">
        <el-button @click="fileModal = false" size="medium">{{ $t("action.cancel") }}</el-button>
        <el-button
          :disabled="fileInfo && !fileInfo.valid"
          @click="onModalConfirm"
          size="medium"
          type="primary"
        >{{ $t("action.confirm") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { awaitOnLine } from '@/utils'
import { rateTrans, registerNclick } from '@/utils/utils'
import { Upload } from 'element-ui'
import Develop from '@/views/common/menuout/Develop'
import AutoUpgrade from '@/views/common/menuout/AutoUpgrade'
let message = null
export default {
  name: 'UpgradeLocal',
  data() {
    return {
      fileModal: false,
      loading: false,
      loadingText: I18N.t('systool.uploading'),
      baseModel: {
        isPersist: true
      },
      accept: '.gz',
      file: {},
      actionUrl: `${process.env.PROXY}${window.BASE_URI ||
        process.env.BASE_PATH}/api/upload/upgradeLocal?auth=${window.Cookie.get(
        window.sn
      )}`,
      formName: 'file',
      baseRules: {},
      fileInfo: null,
      isConfirm: false,
      autoUpgrade: '0'
    }
  },
  computed: {
    sysinfo() {
      return this.$store.getters.sysinfo || {}
    }
  },
  components: {
    [Upload.name]: Upload,
    Develop,
    AutoUpgrade
  },
  filters: {
    rateTrans
  },
  beforeDestroy() {
    message && message.close()
    this.removeNClick()
  },
  activated() {
    message && message.close()
  },
  mounted() {
    this.removeNClick = this.addNClick()
  },
  methods: {
    addNClick() {
      return registerNclick(
        5,
        this.$refs.softVersion,
        _ => {
          this.$refs.develop.onShowDevelop()
        },
        'click',
        false
      )
    },
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
      if (res.invalid) {
        message = this.$message({
          showClose: true,
          type: 'error',
          duration: 0,
          message: I18N.t('systool.upload_valid_pack')
        })
        return
      }
      this.fileInfo = res
      this.fileInfo.name = file.name
      this.fileModal = true
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
          this.loadingText = I18N.t('systool.pack_validing')
        }
      }
    },
    // 上传文件至服务器
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$refs.baseUpload.submit()
        }
      })
    },
    // 确认升级
    onModalConfirm() {
      this.isConfirm = true
      this.$api
        .system(
          'upgradeConfirm',
          Object.assign({}, this.baseModel, { path: this.fileInfo.path })
        )
        .then(d => {
          this.fileModal = false
          awaitOnLine(60000, I18N.t('systool.on_upgradeing'), null, 50).then(
            () => {
              window.top.location.reload()
            }
          )
        })
    },
    // 取消升级
    onModalCancel() {
      if (!this.isConfirm) {
        // 点击确定的时不能删除安装包
        this.$api.system('upgradeCancel') // 删除安装包
      }
    }
  }
}
</script>
