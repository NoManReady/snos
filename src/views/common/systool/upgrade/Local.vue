<template>
  <div
    :element-loading-text="loadingText"
    class="sys-tab"
    element-loading-background="rgba(0, 0, 0, .1)"
    element-loading-custom-class="eweb-loading"
    element-loading-spinner="el-icon-loading"
    v-loading.fullscreen="loading"
  >
    <help-alert json-key="localUpdateJson" title="本地升级">
      <p slot="content">升级过程中请不要刷新页面或者关闭浏览器。</p>
      <div slot="collapseFoot">
        <h3 class="tit">注意</h3>
        <p class="desc">请确保在设备升级过程中，不要将设备断电，不要对页面进行刷新。升级完毕，设备将自动重启。</p>
      </div>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="small">
      <el-form-item label="设备型号">
        <span>{{sysinfo.product_class}}</span>
      </el-form-item>
      <el-form-item label="当前版本">
        <span>{{sysinfo.software_version}}</span>
        <span class="ml10">{{sysinfo.hardware_version}}</span>
      </el-form-item>
      <el-form-item label="保留配置">
        <el-checkbox label="(如果版本差异太大，建议不保留配置升级)" v-model="baseModel.isPersist"></el-checkbox>
      </el-form-item>
      <el-form-item class="vm" label="安装包路径">
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
            <el-input :value="file.name" class="w200" placeholder="请选择安装包" readonly size="small"></el-input>
            <el-button size="small" type="primary">浏览</el-button>
          </div>
          <el-button :disabled="!file.name" @click.native.stop="onSubmit" class="ml5 w100" size="small" type="primary">上传</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <!-- 文件信息 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="fileModal"
      @close="onModalCancel"
      size="small"
      title="文件信息"
      width="490px"
    >
      <help-alert :closable="false" show-icon title="升级包已上传，点击确认开始升级。升级过程请勿断电！" type="info"></help-alert>
      <div v-if="fileInfo">
        <div class="mt10" style="display:flex;" v-if="fileInfo.name">
          <span class="vm tr w100">升级包名称：</span>
          <div class="vm" style="flex:1;">
            <p style="word-break: break-all;">{{fileInfo.name}}</p>
          </div>
        </div>
        <div class="mt10">
          <span class="vm tr w100">升级包大小：</span>
          <span class="vm">{{fileInfo.size|rateTrans}}</span>
          <span class="vm c-warning" v-if="!fileInfo.valid">(升级包文件太大，无法升级)</span>
        </div>
        <div class="mt10">
          <span class="vm tr w100">提示：</span>
          <span class="vm" v-if="baseModel.isPersist">将保留配置升级</span>
          <span class="vm" v-else>将清空配置升级</span>
          <!-- <el-checkbox v-model="baseModel.isPersist" label="保留配置"></el-checkbox> -->
        </div>
      </div>
      <span class="dialog-footer" slot="footer">
        <el-button @click="fileModal = false" size="small">取 消</el-button>
        <el-button :disabled="fileInfo&&!fileInfo.valid" @click="onModalConfirm" size="small" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { awaitOnLine } from '@/utils'
import { rateTrans } from '@/utils/utils'
import { Upload } from 'element-ui'
let message = null
export default {
  name: 'UpgradeLocal',
  data() {
    return {
      fileModal: false,
      loading: false,
      loadingText: '上传中...',
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
      isConfirm: false
    }
  },
  computed: {
    sysinfo() {
      return this.$store.getters.sysinfo || {}
    }
  },
  components: {
    [Upload.name]: Upload
  },
  filters: {
    rateTrans
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
      if (res.invalid) {
        message = this.$message({
          showClose: true,
          type: 'error',
          duration: 0,
          message: '请上传正确的安装包'
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
          this.loadingText = `文件校验中`
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
          awaitOnLine(60000, '正在升级设备...', null, 50).then(() => {
            window.top.location.reload()
          })
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
<style lang="scss" scoped>
</style>
