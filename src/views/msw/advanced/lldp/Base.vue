<template>
  <div class="advanced-lldp-base">
    <!-- <help-alert title="生成树协议全局设置"></help-alert> -->
    <div class="box">
      <!-- <div class="box-header">
        <span class="box-header-tit">全局配置</span>
      </div>-->
      <el-form :model="baseModel" :rules="baseRules" label-width="125px" ref="baseForm" size="mini">
        <el-row>
          <el-col :span="24">
            <el-form-item label="LLDP开关：" prop="enable">
              <el-switch :active-value="1" :inactive-value="0" @change="_onModeChange" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="baseModel.enable===1">
          <el-row>
            <el-col :span="12" :xs="24">
              <el-form-item label="TTL乘数：" prop="holdtime">
                <el-input class="w160" placeholder="范围（2~10）" v-model="baseModel.holdtime"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="初始延迟时间：" prop="reinit_delay">
                <el-input class="w160" placeholder="范围（1~10）" v-model="baseModel.reinit_delay"></el-input>
                <span>秒</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="发送时间间隔：" prop="tx_interval">
                <el-input class="w160" placeholder="范围（5~32768）" v-model="baseModel.tx_interval"></el-input>
                <span>秒</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="发送延迟时间：" prop="tx_delay">
                <el-input class="w160" placeholder="范围（1~8191）" v-model="baseModel.tx_delay"></el-input>
                <span>秒</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="发送报文个数：" prop="fast_count">
                <el-input class="w160" placeholder="范围（1~10）" v-model="baseModel.fast_count"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item>
                <el-button v-auth="_onSaveConf" size="small" type="primary">保存配置</el-button>
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
        return cb(new Error('TTL乘数×报文发送时间间隔+1必须小于等于65535'))
      }
      cb()
    }
    // tx-interval * 0.25 => tx_delay
    const ruleLimitValidator2 = (r, v, cb) => {
      let _baseModel = this.baseModel
      let _tx_delay = +_baseModel.tx_delay
      let _tx_interval = +_baseModel.tx_interval
      if (_tx_interval * 0.25 < _tx_delay) {
        return cb(new Error('发送间隔时间x0.25必须大于等于发送延迟时间'))
      }
      cb()
    }
    return {
      baseModel: lldpBase(),
      baseRules: {
        holdtime: [
          { required: true, message: '请输入TTL乘数' },
          { validator: intValidator },
          { validator: rangeValidator, min: 2, max: 10 },
          { validator: ruleLimitValidator }
        ],
        reinit_delay: [
          { required: true, message: '请输入初始化延迟时间' },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 10 }
        ],
        tx_delay: [
          { required: true, message: '请输入发送时间延迟' },
          { validator: intValidator },
          { validator: rangeValidator, min: 1, max: 8191 },
          { validator: ruleLimitValidator2 }
        ],
        tx_interval: [
          { required: true, message: '请输入发送时间间隔' },
          { validator: intValidator },
          { validator: rangeValidator, min: 5, max: 32768 },
          { validator: ruleLimitValidator },
          { validator: ruleLimitValidator2 }
        ],
        fast_count: [
          { required: true, message: '请输入发送报文个数' },
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
        await this.$confirm(`是否确认${v === 1 ? '开启' : '关闭'}LLDP？`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
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
            this.$message.success('配置成功')
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>
