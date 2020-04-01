export default {
  methods: {
    // 清除验证信息
    _clearValidate(form) {
      this.$nextTick(() => {
        this.$refs[form || 'baseForm'].clearValidate()
      })
    },
    // 验证表单字段
    _onValidateField(prop, cb = () => { }, form) {
      this.$refs[form || 'baseForm'].validateField(prop, cb)
    }
  }
}
