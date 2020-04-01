<template>
  <div>
    <div class="mb10">
      <help-alert :title="$t('network.dns_proxy_cfg')" json-key="dnsProxyJson" type="info">
        <div slot="content">{{$t('network.dns_proxy_tip')}}</div>
      </help-alert>
    </div>
    <el-form :model="baseModel" :rules="baseRules" class="w500" label-width="160px" ref="baseForm" size="medium" status-icon>
      <el-form-item :label="$t('network.dns_status')" prop="enable">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('sysinfo.dns_addr')" prop="dnsIp" v-if="baseModel.enable !== '0'">
        <el-input :placeholder="$t('network.wan.dns_is_required')" v-model="baseModel.dnsIp"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="w160" type="primary" v-auth="onSubmit">{{ $t("action.save_edit") }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ipValidator } from '@/utils/rules'
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
          { required: true, message: I18N.t('network.dns_no_empty') },
          {
            validator: ipValidator
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
              message: I18N.t('tip.edit1_success')
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
