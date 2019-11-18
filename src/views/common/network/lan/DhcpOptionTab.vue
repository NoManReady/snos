<template>
  <div>
    <div class="mb10">
      <help-alert json-key="dhcpOptionJson" title="DHCP服务器选项设置" type="info">
        <div slot="content">DHCP服务器选项是所有LAN口共用的配置。</div>
      </help-alert>
    </div>
    <el-form
      :model="baseModel"
      class="w500"
      label-position="left"
      label-width="90px"
      ref="baseForm"
      status-icon
      style="padding-left: 70px;"
      v-if="loaded"
    >
      <el-form-item
        :key="idx"
        :label="optionMap[opt.id] && optionMap[opt.id].label || `Option ${opt.id}`"
        :prop="`option[${idx}].value`"
        :rules="_getRule(opt.id)"
        v-for="(opt,idx) in baseModel.option"
      >
        <el-input :placeholder="optionMap[opt.id] && optionMap[opt.id].placeholder || defPlaceholder" v-model="opt.value"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="w200" type="primary" v-auth="onSubmit">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { nameLengthValidator, dnsValidator, ipValidator } from '@/utils/rules'
export default {
  name: 'NetworkDhcpOptionTab',
  data() {
    return {
      loaded: false,
      defPlaceholder: '请输入数字、字母、空格或小数点.',
      optionMap: {
        6: {
          label: 'DNS服务器',
          placeholder: '114.114.114.114，多个以空格隔开',
          rule: [{ validator: dnsValidator }]
        },
        43: {
          placeholder: 'IP地址、16进制字符或字符串，见右方问号说明',
          rule: [
            {
              validator: nameLengthValidator,
              size: 128,
              message: '超过最大长度128（中文占3个字符）'
            }
          ]
        },
        138: {
          placeholder: '格式：192.168.23.2',
          rule: [{ validator: ipValidator, message: '请输入有效的IP地址' }]
        }
      },
      baseModel: {
        option: [
          {
            id: '6',
            value: ''
          },
          {
            id: '43',
            value: ''
          },
          {
            id: '138',
            value: ''
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
      this.$api.getDhcpOption().then(d => {
        this.baseModel = Object.assign({}, this.baseModel, d)
        this.loaded = true
      })
    },
    _getRule(id) {
      let _map = this.optionMap[id] || {}
      if (_map.rule) {
        return _map.rule
      }
      const _commonValidate = (rule, value, cb) => {
        if (value && !/^[0-9a-zA-Z\.\s]+$/.test(value)) {
          return cb(this.defPlaceholder)
        }
        cb()
      }
      return [{ validator: _commonValidate, message: this.defPlaceholder }]
    },
    // 提交表单验证
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.setDhcpOption(this.baseModel).then(d => {
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
