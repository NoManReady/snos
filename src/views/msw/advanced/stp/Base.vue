<template>
  <div class="advanced-stp-base">
    <help-alert :title="''" type="info">
      <div class="c-danger" slot="content">
        <b>注意：</b>开启生成树功能及改变生成树模式，浏览器将会重新连接，配置过程中请勿刷新页面。
      </div>
    </help-alert>
    <div class="box">
      <!-- <div class="box-header">
        <span class="box-header-tit">全局配置</span>
      </div>-->
      <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="mini">
        <el-row>
          <el-col :span="24">
            <el-form-item label="STP开关：" prop="enable">
              <el-switch :active-value="1" :inactive-value="0" @change="_onEnableChange" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="baseModel.enable===1">
          <el-row>
            <el-col :span="12" :xs="24">
              <el-form-item label="优先级：" prop="priority">
                <el-select class="w160" placeholder="请选择" v-model="baseModel.priority">
                  <el-option :key="i" :label="(i-1)*4096" :value="`${(i-1)*4096}`" v-for="i in 16"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="握手时间：" prop="hello_time">
                <el-input class="w160" placeholder="范围（1~10）" v-model="baseModel.hello_time"></el-input>
                <span>秒</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="老化时间：" prop="age_time">
                <el-input class="w160" placeholder="范围（6~40）" v-model="baseModel.age_time"></el-input>
                <span>秒</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="转发延迟：" prop="forward_time">
                <el-input class="w160" placeholder="范围（4~30）" v-model="baseModel.forward_time"></el-input>
                <span>秒</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="恢复时间：" prop="recovery_time">
                <el-input class="w160" placeholder="范围（30~86400）" v-model="baseModel.recovery_time"></el-input>
                <span>秒</span>
                <el-tooltip content="Errdisabled端口自动恢复时间">
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="生成树模式：" prop="mode">
                <el-select class="w160" placeholder="请选择" v-model="baseModel.mode">
                  <el-option :value="0" label="STP"></el-option>
                  <el-option :value="1" label="RSTP"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item>
                <el-button :loading="isLoading" v-auth="_onSaveConf" size="small" type="primary">保存配置</el-button>
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
        return cb(new Error('2×(握手时间+1)<=老化时间<=2×(转发延迟时间-1)'))
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
          { required: true, message: '请输入转发延迟' },
          { validator: intValidator },
          { validator: rangeValidator, min: 4, max: 30 },
          { validator: ruleLimitValidator }
        ],
        hello_time: [
          { required: true, message: '请输入握手时间' },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 10 },
          { validator: ruleLimitValidator }
        ],
        age_time: [
          { required: true, message: '请输入老化时间' },
          { validator: intValidator },
          { validator: rangeValidator, min: 6, max: 40 },
          { validator: ruleLimitValidator }
        ],
        priority: [
          { required: true, message: '请输入优先级' },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 61440 }
        ],
        recovery_time: [
          { required: true, message: '请输入恢复时间' },
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
          `是否确认${v === 1 ? '开启' : '关闭'}生成树功能？`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
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
            text: _delay ? '配置下发中...' : 0,
            maxTry: 50
          }).then(() => {
            this.originEnable = _model.enable
            this.originMode = _model.mode
            bus.$emit('stp-status-change', {
              from: 'advanced-stp-base',
              value: _model.enable
            })
            this.isLoading = false
            this.$message.success('配置成功')
          })
        }
      })
    }
  }
}
</script>
