<template>
  <div class="advanced-stp-base">
    <help-alert :title="''" type="info">
      <div class="c-danger" slot="content">
        <i18n path="msw.stp.cfg_tip" tag="span">
          <b>{{$t('phrase.notice_f')}}</b>
        </i18n>
      </div>
    </help-alert>
    <div class="box">
      <!-- <div class="box-header">
        <span class="box-header-tit">全局配置</span>
      </div>-->
      <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('msw.stp.stp_switch_f')" prop="enable">
              <el-switch :active-value="1" :inactive-value="0" @change="_onEnableChange" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="baseModel.enable===1">
          <el-row>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.stp.priority_f')" prop="priority">
                <el-select :placeholder="$t('msw.select')" class="w260" v-model="baseModel.priority">
                  <el-option :key="i" :label="(i-1)*4096" :value="`${(i-1)*4096}`" v-for="i in 16"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.stp.hand_time_f')" prop="hello_time">
                <el-input :placeholder="$t('msw.range_digit',{range:'1-10'})" class="w260" v-model="baseModel.hello_time"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.stp.age_time_f')" prop="age_time">
                <el-input :placeholder="$t('msw.range_digit',{range:'6-40'})" class="w260" v-model="baseModel.age_time"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.stp.forward_delay_f')" prop="forward_time">
                <el-input :placeholder="$t('msw.range_digit',{range:'4-30'})" class="w260" v-model="baseModel.forward_time"></el-input>
                <span>{{$t('time.second')}}</span>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.stp.recovery_time_f')" prop="recovery_time">
                <el-input :placeholder="$t('msw.range_digit',{range:'30-86400'})" class="w260" v-model="baseModel.recovery_time"></el-input>
                <span>{{$t('time.second')}}</span>
                <el-tooltip :content="$t('msw.stp.auto_time')">
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :md="12" :sm="24" :xs="24">
              <el-form-item :label="$t('msw.stp.spantree_mode_f')" prop="mode">
                <el-select :placeholder="$t('msw.select')" class="w260" v-model="baseModel.mode">
                  <el-option :value="0" label="STP"></el-option>
                  <el-option :value="1" label="RSTP"></el-option>
                </el-select>
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
import { isBetween } from '@/utils/rulesUtils'
import { stpBase } from '@/model/msw/advanced'
import { mapGetters, mapActions } from 'vuex'
import { awaitOnLine_plus } from '@/utils'
import bus from '@/utils/bus'
export default {
  name: 'advanced-stp-base',
  components: {
    [Row.name]: Row,
    [Col.name]: Col
  },
  data() {
    const ruleLimitValidator = (r, v, cb) => {
      let _baseModel = this.baseModel
      let _min = 2 * (+_baseModel.hello_time + 1)
      let _max = 2 * (+_baseModel.forward_time - 1)
      let _cur = +_baseModel.age_time
      if (!isBetween(_cur, _min, _max)) {
        return cb(new Error(I18N.t('msw.stp.hand_recovery_forward_rule')))
      }
      cb()
    }
    return {
      baseModel: stpBase(),
      originEnable: 0,
      originMode: 0,
      isLoading: false,
      baseRules: {
        forward_time: [
          { required: true, message: I18N.t('msw.stp.forward_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 4, max: 30 },
          { validator: ruleLimitValidator }
        ],
        hello_time: [
          { required: true, message: I18N.t('msw.stp.hand_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 10 },
          { validator: ruleLimitValidator }
        ],
        age_time: [
          { required: true, message: I18N.t('msw.stp.age_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 6, max: 40 },
          { validator: ruleLimitValidator }
        ],
        priority: [
          { required: true, message: I18N.t('msw.stp.priority_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 61440 }
        ],
        recovery_time: [
          { required: true, message: I18N.t('msw.stp.recovery_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 30, max: 86400 }
        ]
      }
    }
  },
  created() {
    this._loadConf()
  },
  computed: {
    commonValidate() {
      return Object.freeze([
        this.baseModel.age_time,
        this.baseModel.hello_time,
        this.baseModel.forward_time
      ])
    }
  },
  watch: {
    commonValidate() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('age_time')
        this.$refs.baseForm.validateField('hello_time')
        this.$refs.baseForm.validateField('forward_time')
      }
    }
  },
  methods: {
    // 加载配置
    async _loadConf() {
      this.isLoading = true
      try {
        let _result = await this.$api.cmd('devConfig.get', { module: 'stp' })
        this.baseModel = _result
        this.originEnable = this.baseModel.enable
        this.originMode = this.baseModel.mode
        bus.$emit('stp-status-change', {
          from: 'advanced-stp-base',
          value: this.baseModel.enable
        })
      } catch (error) {}
      this.isLoading = false
    },
    // 模式改变
    async _onEnableChange(v) {
      try {
        await this.$confirm(
          I18N.t('msw.stp.stp_enable_confirm', {
            status: v === 1 ? I18N.t('phrase.enable') : I18N.t('phrase.disable')
          }),
          {
            confirmButtonText: I18N.t('action.confirm'),
            cancelButtonText: I18N.t('action.cancel'),
            type: 'warning'
          }
        )
        this._onSaveConf()
      } catch (error) {
        this.baseModel.enable = v === 1 ? 0 : 1
      }
    },
    // 保存配置
    _onSaveConf() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          let _model = this.baseModel
          // stp模式切换及关闭，web连接会断开
          let _delay = 0
          if (
            (_model.enable !== this.originEnable && _model.enable === 1) ||
            (this.originEnable === _model.enable &&
              this.originMode !== _model.mode)
          ) {
            _delay = 5000
          }

          this.$api.cmd(
            'devConfig.set',
            {
              module: 'stp',
              data: _model
            },
            { isSilence: true }
          )
          awaitOnLine_plus({
            time: _delay,
            text: _delay ? I18N.t('msw.cfg_wait') : 0,
            maxTry: 50
          }).then(() => {
            this.originEnable = _model.enable
            this.originMode = _model.mode
            bus.$emit('stp-status-change', {
              from: 'advanced-stp-base',
              value: _model.enable
            })
            this.isLoading = false
            this.$message.success(I18N.t('tip.edit1_success'))
          })
        }
      })
    }
  }
}
</script>
