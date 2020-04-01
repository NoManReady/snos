<template>
  <div class="port-mac-base">
    <!-- <help-alert title="MAC基础配置"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.mac.mac_agetime')}}</span>
      </div>
      <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="medium">
        <el-form-item :label="$t('msw.mac.agetime_f')" prop="mac_agetime">
          <el-input :placeholder="$t('msw.mac.agetime_range')" class="w300" v-model.number="baseModel.mac_agetime"></el-input>
          <label class="c-info">{{$t('msw.mac.agetime_tip')}}</label>
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="isLoading"
            @click.native="_setConfig"
            class="w160"
            type="primary"
          >{{isLoading?$t('action.editing'):$t('action.save_edit')}}</el-button>
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
        return cb(new Error(I18N.t('msw.mac.agetime_range')))
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
          { required: true, message: I18N.t('msw.mac.agetime_no_empty') },
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
            this.$message.success(I18N.t('tip.edit1_success'))
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>

