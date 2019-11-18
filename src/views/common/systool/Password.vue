<template>
  <div class="system-password">
    <help-alert json-key="passwordJson" title="设备密码" v-if="!firstInit">
      <div slot="content">修改设备密码成功后需重新登录。</div>
    </help-alert>
    <div class="app-header tc fs24" style="line-height:60px;" v-if="firstInit&&showHeader">修改设备密码</div>
    <help-alert title v-if="firstInit">
      <div class="fs16" slot="content">
        当前设备密码是
        <span class="c-danger">默认密码</span>！请先设置密码以管理设备。设备密码是
        <span class="c-danger">
          管理设备的凭证
          <template v-if="showApp">(也是APP管理设备的密码)</template>
        </span>，确认修改前请牢记设备密码。
      </div>
    </help-alert>
    <el-form
      :class="{'center mt20':firstInit,'w500':!isMobile}"
      :label-position="labelPos"
      :model="baseModel"
      :rules="baseRules"
      class="plr20 web-form"
      label-width="120px"
      ref="baseForm"
      size="small"
    >
      <el-form-item label="原设备密码" prop="oldpassword" v-if="!firstInit">
        <el-input type="password" v-model="baseModel.oldpassword"></el-input>
      </el-form-item>
      <el-form-item label="新设备密码" prop="password">
        <el-input @keyup.native.enter="onSubmit" type="password" v-model="baseModel.password"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="passwordConfirm">
        <el-input @keyup.native.enter="onSubmit" type="password" v-model="baseModel.passwordConfirm"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :class="{w100p:isMobile}" :loading="isLoading" @click.native="onSubmit" size="small" type="primary">修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { passwdValidator } from '@/utils/rules'
export default {
  name: 'SystemPassword',
  props: {
    firstInit: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const pwdConfirmValidator = (rule, value, cb) => {
      if (
        this.baseModel.password &&
        this.baseModel.password !== this.baseModel.passwordConfirm
      ) {
        cb(new Error(rule.message))
      } else {
        cb()
      }
    }
    const checkPassword = async (rule, value, cb) => {
      if (this.isEncry) {
        value = this.$encry(value)
      }
      let _result = await this.$api.checkPassword(value, this.isEncry)
      if (_result) {
        cb()
      } else {
        cb(new Error(rule.message))
      }
    }
    return {
      labelPos: 'right',
      isLoading: false,
      baseModel: {
        oldpassword: '',
        password: '',
        passwordConfirm: ''
      },
      baseRules: {
        oldpassword: [
          { required: true, message: '请输入原密码' },
          { validator: checkPassword, message: '原密码错误', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入新密码' },
          { min: 6, max: 16, message: '密码至少6位，最多16位' },
          {
            validator: passwdValidator
          }
        ],
        passwordConfirm: [
          { required: true, message: '请再次输入新密码' },
          { validator: pwdConfirmValidator, message: '两次密码输入不一致' }
        ]
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this._onResize, false)
    this._onResize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onResize)
  },
  computed: {
    // 是否开启加密处理
    isEncry() {
      return true
    },
    isMobile() {
      return this.labelPos === 'top'
    },
    // 是否显示APP管理密码
    showApp() {
      return this.$roles().includes('egw') || this.$roles().includes('eap')
    }
  },
  methods: {
    // 浏览器收缩
    _onResize() {
      let _innerWidth = document.documentElement.offsetWidth
      if (_innerWidth < 768) {
        this.labelPos = 'top'
      } else {
        this.labelPos = 'right'
      }
    },
    // 修改
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          const _data = {
            type: this.isEncry,
            password: this.isEncry
              ? this.$encry(this.baseModel.password)
              : this.baseModel.password
          }
          this.$api.pwdmodify(_data).then(
            () => {
              this.isLoading = false
              this.$message({
                type: 'success',
                message: '密码修改成功',
                duration: 2000
              })
              this.$bus.$emit('set-is-default-pass', {
                from: 'Password',
                value: false
              })
              if (this.firstInit && this.showHeader) {
                this.$router.push({ name: 'quickset' })
              }
              this.$emit('after-change', true)
              this.baseModel.oldpassword = ''
              this.baseModel.password = ''
              this.baseModel.passwordConfirm = ''
              this.$nextTick(() => {
                this.$refs.baseForm.clearValidate()
              })
            },
            () => {
              this.isLoading = false
              this.$emit('after-change', false)
            }
          )
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
