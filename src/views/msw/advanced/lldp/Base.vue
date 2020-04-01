<template>
  <div class="advanced-lldp-base">
    <!-- <help-alert title="生成树协议全局设置"></help-alert> -->
    <div class="box">
      <!-- <div class="box-header">
        <span class="box-header-tit">全局配置</span>
      </div>-->
      <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="medium">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('msw.lldp.lldp_switch_f')" prop="enable">
              <el-switch :active-value="1" :inactive-value="0" @change="_onModeChange" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="baseModel.enable===1">
          <el-row>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.lldp.ttl_mul_f')" prop="holdtime">
                <el-input :placeholder="$t('msw.range_digit',{range:'2-10'})" class="w260" v-model="baseModel.holdtime"></el-input>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.lldp.init_delay_f')" prop="reinit_delay">
                <el-input :placeholder="$t('msw.range_digit',{range:'1-10'})" class="w260" v-model="baseModel.reinit_delay"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.lldp.send_interval_f')" prop="tx_interval">
                <el-input :placeholder="$t('msw.range_digit',{range:'5-32768'})" class="w260" v-model="baseModel.tx_interval"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.lldp.send_delay_f')" prop="tx_delay">
                <el-input :placeholder="$t('msw.range_digit',{range:'1-8191'})" class="w260" v-model="baseModel.tx_delay"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.lldp.send_pack_cnt_f')" prop="fast_count">
                <el-input :placeholder="$t('msw.range_digit',{range:'1-10'})" class="w260" v-model="baseModel.fast_count"></el-input>
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
import { lldpBase } from '@/model/msw/advanced'
import { mapGetters, mapActions } from 'vuex'
import bus from '@/utils/bus'
export default {
  name: 'advanced-lldp-base',
  components: {
    [Row.name]: Row,
    [Col.name]: Col
  },
  data() {
    const ruleLimitValidator = (r, v, cb) => {
      let _baseModel = this.baseModel
      let _ttl = +_baseModel.holdtime
      let _tx_interval = +_baseModel.tx_interval
      if (_ttl * _tx_interval + 1 > 65535) {
        return cb(new Error(I18N.t('msw.lldp.ttl_pack_rule')))
      }
      cb()
    }
    // tx-interval * 0.25 => tx_delay
    const ruleLimitValidator2 = (r, v, cb) => {
      let _baseModel = this.baseModel
      let _tx_delay = +_baseModel.tx_delay
      let _tx_interval = +_baseModel.tx_interval
      if (_tx_interval * 0.25 < _tx_delay) {
        return cb(new Error(I18N.t('msw.lldp.interval_delay')))
      }
      cb()
    }
    return {
      baseModel: lldpBase(),
      isLoading: false,
      baseRules: {
        holdtime: [
          { required: true, message: I18N.t('msw.lldp.ttl_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 2, max: 10 },
          { validator: ruleLimitValidator }
        ],
        reinit_delay: [
          { required: true, message: I18N.t('msw.lldp.init_delay_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 10 }
        ],
        tx_delay: [
          { required: true, message: I18N.t('msw.lldp.send_delay_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 8191 },
          { validator: ruleLimitValidator2 }
        ],
        tx_interval: [
          { required: true, message: I18N.t('msw.lldp.interval_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 5, max: 32768 },
          { validator: ruleLimitValidator },
          { validator: ruleLimitValidator2 }
        ],
        fast_count: [
          { required: true, message: I18N.t('msw.lldp.pack_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 10 }
        ]
      }
    }
  },
  computed: {
    calcLimit() {
      return [this.baseModel.tx_interval, this.baseModel.holdtime]
    },
    calcLimit1() {
      return [this.baseModel.tx_interval, this.baseModel.tx_delay]
    }
  },
  watch: {
    calcLimit() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField(['tx_interval', 'holdtime'])
      }
    },
    calcLimit1() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField(['tx_interval', 'tx_delay'])
      }
    }
  },
  created() {
    this._loadConf()
  },
  methods: {
    // 加载配置
    async _loadConf() {
      this.isLoading = true
      try {
        let _result = await this.$api.cmd('devConfig.get', { module: 'lldp' })
        this.baseModel = _result
        bus.$emit('lldp-status-change', {
          from: 'advanced-lldp-base',
          value: this.baseModel.enable
        })
      } catch (error) {}
      this.isLoading = false
    },
    // 模式改变
    async _onModeChange(v) {
      try {
        await this.$confirm(
          I18N.t('msw.lldp.lldp_enable_confirm', {
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
              module: 'lldp',
              data: this.baseModel
            })
            bus.$emit('lldp-status-change', {
              from: 'advanced-lldp-base',
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
