<template>
  <div class="advanced-rldp-base">
    <div class="box">
      <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('msw.rldp.rldp_switch_f')" prop="enable">
              <el-switch :active-value="1" :inactive-value="0" @change="_onModeChange" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="baseModel.enable===1">
          <el-row>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.rldp.pack_check_time_f')" prop="detect_interval">
                <el-input :placeholder="$t('msw.range_digit',{range:'2-15'})" class="w220" v-model="baseModel.detect_interval"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.rldp.err_recover_time_f')" prop="recovery_enable">
                <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.recovery_enable"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24" v-if="baseModel.recovery_enable===1">
              <el-form-item :label="$t('msw.rldp.recover_on_time_f')" prop="recovery_interval">
                <el-input
                  :placeholder="$t('msw.range_digit',{range:'30-86400'})"
                  class="w220"
                  v-model="baseModel.recovery_interval"
                ></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item>
                <el-button
                  :loading="isLoading"
                  class="w160"
                  size="medium"
                  type="primary"
                  v-auth="_onSaveConf"
                >{{isLoading?$t('action.editing'):$t('action.save_edit')}}</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
    </div>
  </div>
</template>
<script>
import { Row, Col } from 'element-ui'
import { rangeValidator, intValidator } from '@/utils/rules'
import { rldpBase } from '@/model/msw/advanced'
import bus from '@/utils/bus'
export default {
  name: 'advanced-rldp-base',
  components: {
    [Row.name]: Row,
    [Col.name]: Col
  },
  data() {
    return {
      baseModel: rldpBase(),
      isLoading: false,
      baseRules: {
        detect_interval: [
          {
            required: true,
            message: I18N.t('msw.rldp.pack_check_time_no_empty')
          },
          { validator: intValidator },
          { validator: rangeValidator, min: 2, max: 15 }
        ],
        recovery_interval: [
          {
            required: true,
            message: I18N.t('msw.rldp.recover_no_empty')
          },
          { validator: intValidator },
          { validator: rangeValidator, min: 30, max: 86400 }
        ]
      }
    }
  },
  created() {
    this._loadConf()
  },
  watch: {
    'baseModel.recovery_enable': {
      handler(v) {
        if (v === 0) {
          this.baseModel.recovery_interval = '0'
        } else {
          this.baseModel.recovery_interval =
            this.baseModel.recovery_interval === '0'
              ? '30'
              : this.baseModel.recovery_interval
        }
      },
      immediate: true
    }
  },
  methods: {
    // 加载配置
    async _loadConf() {
      this.isLoading = true
      try {
        let _result = await this.$api.cmd('devConfig.get', { module: 'rldp' })
        this.baseModel = {
          enable: _result.enable,
          detect_interval: _result.detect_interval,
          recovery_enable: _result.recovery_enable,
          recovery_interval: _result.recovery_interval
        }
        bus.$emit('rldp-status-change', {
          from: 'advanced-rldp-base',
          value: +this.baseModel.enable
        })
      } catch (error) {}
      this.isLoading = false
    },
    // 模式改变
    async _onModeChange(v) {
      try {
        await this.$confirm(
          I18N.t('msw.rldp.rldp_enable_confirm', {
            status: v === 1 ? I18N.t('phrase.enable') : I18N.t('phrase.disable')
          }),
          {
            confirmButtonText: I18N.t('action.confirm'),
            cancelButtonText: I18N.t('action.cancel'),
            type: 'warning'
          }
        )
        await this._onSaveConf()
      } catch (error) {
        this.baseModel.enable = v === 1 ? 0 : 1
      }
    },
    // 保存配置
    _onSaveConf() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            await this.$api.cmd('devConfig.set', {
              module: 'rldp',
              data: this.baseModel
            })
            bus.$emit('rldp-status-change', {
              from: 'advanced-rldp-base',
              value: this.baseModel.enable
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
