<template>
  <div class="system-password">
    <help-alert :title="$t('systool.dev_pass')" json-key="passwordJson" v-if="!firstInit">
      <div slot="content">{{$t('systool.dev_pass_tip')}}</div>
    </help-alert>
    <div class="app-header tc fs24" style="line-height:60px;" v-if="firstInit&&showHeader">{{$t('systool.edit_dev_pass')}}</div>
    <help-alert title v-if="firstInit">
      <div class="fs16" slot="content">
        <i18n path="systool.dev_pass_desc" tag="p">
          <span class="c-danger" place="def">{{$t('systool.dev_pass_def')}}</span>
          <span class="c-danger" place="card">
            {{$t('systool.dev_pass_card')}}
            <template v-if="showApp">{{$t('systool.dev_pass_card_app')}}</template>
          </span>
        </i18n>
      </div>
    </help-alert>
    <el-form
      :class="{'center mt20':firstInit,'w500':!isMobile}"
      :label-position="labelPos"
      :label-width="isMobile ? '105px' : '160px'"
      :model="baseModel"
      :rules="baseRules"
      ref="baseForm"
      size="medium"
      status-icon
    >
      <el-form-item :label="$t('systool.old_pass')" prop="oldpassword" v-if="!firstInit">
        <el-input type="password" v-model="baseModel.oldpassword"></el-input>
      </el-form-item>
      <el-form-item :label="$t('systool.new_pass')" prop="password">
        <el-input @keyup.native.enter="onSubmit" type="password" v-model="baseModel.password"></el-input>
      </el-form-item>
      <el-form-item :label="$t('systool.confirm_pass')" prop="passwordConfirm">
        <el-input @keyup.native.enter="onSubmit" type="password" v-model="baseModel.passwordConfirm"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :loading="isLoading" @click="onSubmit" class="w160" type="primary" v-if="isEhr">{{$t('action.save')}}</el-button>
        <el-button :loading="isLoading" class="w160" type="primary" v-auth="onSubmit" v-else>{{$t('action.save')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { webPasswdValidator } from '@/utils/rules'
import store from '@/store'
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
      if (_result.isOk) {
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
          { required: true, message: I18N.t('systool.old_no_empty') },
          {
            validator: checkPassword,
            message: I18N.t('systool.old_pass_err'),
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: I18N.t('systool.new_no_empty') },
          { validator: webPasswdValidator },
          { min: 8, max: 31, message: I18N.t('quickmacc.manage_pass_rule') }
        ],
        passwordConfirm: [
          { required: true, message: I18N.t('systool.new_pass_again') },
          {
            validator: pwdConfirmValidator,
            message: I18N.t('systool.pass_is_diff')
          }
        ]
      }
    }
  },
  computed: {
    // 是否开启加密处理
    isEncry() {
      return true
    },
    isMobile() {
      return !!ISMOBILE // this.labelPos === "top";
    },
    // 是否显示APP管理密码
    showApp() {
      return this.$roles().includes('egw') || this.$roles().includes('eap')
    },
    isEhr() {
      return this.$roles().includes('ehr')
    }
  },
  methods: {
    // 修改
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          const _data = {
            type: this.isEncry,
            password: this.isEncry
              ? this.$encry(this.baseModel.password)
              : this.baseModel.password,
            username: window.APP_USERNAME || 'admin'
          }
          this.$api.pwdmodify(_data, this.isEhr).then(
            () => {
              this.isLoading = false
              this.$message({
                type: 'success',
                message: I18N.t('systool.modify_pass_success'),
                duration: 2000
              })
              store.dispatch(
                'setIsDefaultPass',
                this.baseModel.password === 'admin'
              )
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
