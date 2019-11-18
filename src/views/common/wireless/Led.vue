<template>
  <div>
    <div class="mb10">
      <help-alert json-key title="LED状态控制" type="info">
        <div slot="content">
          控制下联设备
          <strong class="c-warning">EAP</strong>的LED灯开关。
          <label class="c-warning" v-if="!editAble">此配置项由主AP统一管理。</label>
        </div>
      </help-alert>
    </div>
    <el-form :model="baseModel" class="w500" label-width="160px" ref="baseForm" size="small">
      <el-form-item label="LED灯开关" prop="led_all">
        <el-switch :disabled="!editAble" active-value="restore" inactive-value="close" v-model="baseModel.led_all"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!editAble" @click="onSubmit" size="small" type="primary">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'SystoolLedTab',
  data() {
    return {
      baseModel: {
        led_all: 'close'
      }
    }
  },
  computed: {
    editAble() {
      return !this.$roles().includes('slave')
    }
  },
  created() {
    this._load()
  },
  methods: {
    // 加载wan口信息
    async _load() {
      let _res = await this.$api.cmd('acConfig.get', {
        module: 'devLed'
      })
      this.baseModel = Object.assign({}, this.baseModel, _res)
    },
    // 提交表单验证
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api
            .cmd('acConfig.set', {
              module: 'devLed',
              data: this.baseModel
            })
            .then(d => {
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
