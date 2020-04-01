<template>
  <div class="m-repeater">
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="unset-mobile lable-width"
      label-position="top"
      ref="baseForm"
      size="medium"
      v-loading="loading"
    >
      <div class="fs16 mb10">
        <strong>无线中继设置</strong>
      </div>
      <div class="block m-box">
        <el-form-item prop="ssid">
          <template slot="label">
            <span>要中继的Wi-Fi名称</span>
            <span class="c-success pointer fr" v-if="baseModel.ssid">重新选择</span>
          </template>
          <strong>{{baseModel.ssid}}</strong>
          <el-button class="w100p" size="medium" v-if="!baseModel.ssid">选择附近的Wi-Fi</el-button>
        </el-form-item>
        <el-form-item prop="wpaPsk">
          <template slot="label">
            <span>Wi-Fi密码</span>
            <span class="c-success pointer fr">校验密码</span>
          </template>
          <eweb-input-password placeholder="请输入WiFi密码" type="password" v-model="baseModel.wpaPsk"></eweb-input-password>
        </el-form-item>
      </div>
      <div class="mtb10">
        <i class="el-icon-info c-warning fs16"></i>
        <span>该设备放出的Wi-Fi名称和密码同扩展Wi-Fi。建议优先选择更稳定的5G信号中继。</span>
      </div>
      <div>
        <el-button class="w100p" size="medium" type="primary">确认切换</el-button>
      </div>
      <div>
        <el-button @click="$emit('backNetwork')" class="w100p" size="medium" type="text">暂不切换</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { sleep } from '@/utils'
import InputPassword from '@/common/InputPassword'
export default {
  name: 'MRepeater',
  data() {
    return {
      loading: true,
      baseModel: {
        ssid: '',
        wpaPsk: ''
      },
      baseRules: {
        ssid: [{ required: true, message: '请选择Wi-Fi', whitespace: true }]
      }
    }
  },
  created() {
    this._loadData()
  },
  components: {
    [InputPassword.name]: InputPassword
  },
  methods: {
    async _loadData() {
      this.loading = true
      this.loading = false
    },
    // 表单验证
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate((valid, d) => {
          if (valid) {
            resolve(this.baseModel)
          } else {
            reject(d)
          }
        })
      })
    }
  }
}
</script>
