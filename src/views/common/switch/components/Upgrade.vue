<template>
  <div class="switch-upgrade" v-loading="isLoading">
    <div class="collapse-group">
      <div class="upgrade-local" v-if="false">
        <div class="collapse-group__title">本地升级</div>
        <el-form :model="item" label-width="120px" ref="baseForm" v-if="item">
          <el-form-item label="设备型号">
            <span>{{item.deviceType}}</span>
          </el-form-item>
          <el-form-item label="当前版本">
            <span>{{item.software}}</span>
          </el-form-item>
          <el-form-item label="保留配置">
            <el-checkbox @change="_setConfig" label="(如果版本差异太大，建议不保留配置升级)" v-model="isPersist"></el-checkbox>
          </el-form-item>
          <el-form-item class="vm" label="安装包路径">
            <el-upload
              :action="`http://${item.ip}/httpupg.cgi`"
              :auto-upload="false"
              :before-upload="onBeforeUpload"
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
                <el-button size="small w100" type="primary">浏览</el-button>
              </div>
              <el-button :disabled="!file.name" @click.native.stop="onSubmit" class="ml5 w100" size="small" type="primary">上传</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div class="upgrade-online">
        <div class="collapse-group__title">在线升级</div>
        <el-form :model="item" label-width="120px" ref="baseForm" v-if="item">
          <el-form-item label="设备型号">
            <span>{{item.deviceType}}</span>
          </el-form-item>
          <el-form-item label="当前版本">
            <span>{{item.software}}</span>
          </el-form-item>
          <el-form-item label="最新版本">
            <span class="c-info" v-if="!newVersion">当前已是最新版本</span>
            <span class="c-danger" v-else>{{(newVersion&&newVersion.versionCode)}}</span>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="!newVersion" @click.native="_onPostUpgrade" size="mini" type="primary">升级</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { Upload } from 'element-ui'
import { mapGetters } from 'vuex'
import { getMaccVersion } from '@/api/maccApi'
let message = null
export default {
  name: 'switch-upgrade',
  components: {
    [Upload.name]: Upload
  },
  data() {
    return {
      isLoading: false,
      isPersist: true,
      file: {},
      formName: 'file',
      newVersion: null
    }
  },
  computed: {
    ...mapGetters('switch', ['item', 'vmode'])
  },
  created() {
    this._setConfig()
    this._getMd5Key()
  },
  methods: {
    // 获取上传是否保留配置
    async _setConfig() {
      let data = {}
      if (this.isPersist) {
        data.mode = 1
      }
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'post',
          data,
          url: 'set_config.cgi'
        },
        { isSilence: true }
      )
    },
    // 获取MD5-key
    async _getMd5Key() {
      this.isLoading = true
      let ts = new Date().getTime()
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: `get_md5_key.cgi?ts=${ts}`
          },
          { isSilence: true }
        )
        await this._getNewestVersion(_result)
      } catch (error) {}
      this.isLoading = false
    },
    // 获取云端最新版本号
    async _getNewestVersion(verSess) {
      let _res = await getMaccVersion(verSess)
      _res = _res.data
      if (_res.code === 0) {
        let _lis = _res.firmwareList
        let _cur_v = verSess.reqList[0].software
        _lis = (_lis || []).filter(l => l.versionCode !== _cur_v)
        if (_lis && _lis[0]) {
          this.newVersion = _lis[0]
        }
      }
    },
    // 在线升级
    async _onPostUpgrade() {
      try {
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: `upgrade_online_do.cgi`,
            data: { url: this.newVersion.downloadUrl }
          },
          { isSilence: true }
        )
        this.$message({
          type: 'success',
          message: '在线升级指令下发成功'
        })
      } catch (error) {
        this.$message({
          type: 'error',
          message: '在线升级指令下发失败'
        })
      }
    },
    // 上传文件变更
    onFileChange(file, fileList) {
      this.$refs.baseUpload.uploadFiles = [file]
      if (file.status === 'ready') {
        this.file = file
      }
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
    // 上传成功
    onSuccess(res, file) {
      this.$refs.baseUpload.clearFiles()
      this.loading = false
      this.file = {}
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
    // 上传文件至服务器
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$refs.baseUpload.submit()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../../style/utils/mixins';
@import '../../../../style/utils/variable';
/deep/ .el-collapse {
  border-radius: 3px;
  border: none;
  &-item__header,
  &-item__content {
    padding: 0 6px;
  }
  &-item__header {
    height: 40px;
    line-height: 40px;
    &.is-active strong {
      color: $theme !important;
    }
  }
  &-item__arrow {
    line-height: 40px;
  }
  &-item__content {
    padding-bottom: 20px;
  }
}
</style>
