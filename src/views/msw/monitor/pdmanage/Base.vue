<template>
  <div class="port-mac-base">
    <help-alert title="MAC基础配置"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">MAC老化时间</span>
      </div>
      <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
        <el-form-item label="老化时间：" prop="mac_agetime">
          <el-input class="w200" placeholder="老化时间范围:10~630" v-model.number="baseModel.mac_agetime"></el-input>
          <label class="c-info">(范围:10~630，单位:秒，0表示不老化)</label>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading" @click.native="_setConfig" size="small" type="primary">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { intValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
export default {
  name: 'port-mac-base',
  data() {
    const rangeValidator = (r, v, cb) => {
      if (!v) {
        return cb()
      }
      if (v !== 0 && !isBetween(v, 10, 630)) {
        return cb(new Error('老化时间范围:10~630'))
      }
      cb()
    }
    return {
      isLoading: false,
      baseModel: {
        mac_agetime: 10
      },
      baseRules: {
        mac_agetime: [
          { required: true, message: '请输入MAC老化时间' },
          { validator: intValidator },
          { validator: rangeValidator }
        ]
      }
    }
  },
  created() {
    this._getConfig()
  },
  methods: {
    // 获取老化时间
    async _getConfig() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'mac_agetime'
        })
        this.baseModel.mac_agetime = _result.mac_agetime
      } catch (error) {}
    },
    // 提交老化时间
    _setConfig() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            await this.$api.cmd('devConfig.set', {
              module: 'mac_agetime',
              data: this.baseModel
            })
            this.$message.success('配置成功')
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.port-mac-base {
}
</style>

