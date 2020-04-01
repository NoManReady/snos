<template>
  <el-switch :value="baseModel.led_all" @change="setLed" active-value="restore" inactive-value="close"></el-switch>
</template>
<script>
export default {
  data() {
    return {
      baseModel: { led_all: 'close' },
      isFirst: true
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      let _res = await this.$api.cmd('acConfig.get', { module: 'devLed' })
      this.baseModel = _res
      this.isFirst = false
    },
    setLed(v) {
      this.$api.cmd('acConfig.set', {
        module: 'devLed',
        data: { ...this.baseModel, led_all: v }
      })
      this.$message.success(I18N.t('tip.edit_success'))
      this.baseModel.led_all = v
    }
  }
}
</script>
<style lang="scss" scoped>
.content .strong {
  font-weight: bolder;
}
</style>