<template>
  <div>
    <div class="mb10">
      <help-alert json-key="dnsProxyJson" title="DNS服务器代理设置" type="info">
        <div slot="content">DNS服务器代理设置不是必须配置，设备默认会从上联设备中获取DNS服务器地址。</div>
      </help-alert>
    </div>
    <el-form :model="baseModel" :rules="baseRules" class="w500" label-width="160px" ref="baseForm" status-icon>
      <el-form-item label="DNS代理开关" prop="enable">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
      </el-form-item>
      <el-form-item label="DNS服务器" prop="dnsIp" v-if="baseModel.enable !== '0'">
        <el-input placeholder="114.114.114.114，多个以空格隔开" v-model="baseModel.dnsIp"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSubmit" class="w200" type="primary">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { dnsValidator } from '@/utils/rules'
export default {
  name: 'NetworkDnsProxyTab',
  data() {
    return {
      baseModel: {
        enable: '',
        dnsIp: ''
      },
      baseRules: {
        dnsIp: [
          { required: true, message: '请输入DNS服务器地址' },
          {
            validator: dnsValidator
          }
        ]
      }
    }
  },
  created() {
    this._load()
  },
  methods: {
    // 加载wan口信息
    _load() {
      this.$api.getDnsProxy().then(d => {
        this.baseModel = Object.assign({}, this.baseModel, d)
      })
    },
    // 提交表单验证
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.setDnsProxy(this.baseModel).then(d => {
            this.$message({
              type: 'success',
              message: '设置完成'
            })
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
