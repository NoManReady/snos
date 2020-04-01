<template>
  <div class="advanced-smart-tab">
    <help-alert json-key="smartJson" :title="$t('egw.flowctrl.smart_flow_control')">
      <div slot="content">{{$t('egw.flowctrl.smart_falow_control_tip')}}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.flowctrl.smart_flow_control')}}
          <small></small>
        </span>
        <span class="ml20 c-danger" v-if="baseModel.tcSwitch === 'on' && showTip">{{$t('egw.flowctrl.wan_fail_reoperate')}}</span>
      </div>
      <el-form :inline="true" :model="baseModel" class="w600" label-width="160px" ref="baseForm" size="medium">
        <el-form-item :label="$t('egw.flowctrl.open_flow_control')" prop="tcSwitch">
          <el-switch active-value="on" inactive-value="off" v-model="baseModel.tcSwitch"></el-switch>
          <strong class="vm ml10 c-warning">{{$t('egw.flowctrl.close_flow_control_tip')}}</strong>
        </el-form-item>
        <el-form-item
          :key="index"
          :label="$t('egw.flowctrl.rate_by_port', {port:wan.ifname.split(/-/)[1].toLocaleUpperCase()})"
          v-for="(wan,index) in baseModel.list"
          v-show="baseModel.tcSwitch==='on'"
        >
          <el-form-item
            :prop="`list[${index}].uploadBand`"
            :rules="getPositiveValidator(wan.enable)"
            :label="$t('egw.flowctrl.upstream')"
            label-width="60px"
          >
            <el-input class="w80" v-model="wan.uploadBand"></el-input>Mbps
          </el-form-item>
          <el-form-item
            :prop="`list[${index}].downloadBand`"
            :rules="getPositiveValidator(wan.enable)"
            :label="$t('egw.flowctrl.downstream')"
            label-width="60px"
          >
            <el-input class="w80" v-model="wan.downloadBand"></el-input>Mbps
          </el-form-item>
        </el-form-item>
        <el-form-item label=" ">
          <el-button class="w160" type="primary" v-auth="onSubmit">{{$t('action.save_edit')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { rangeValidator } from '@/utils/rules'
export default {
  name: 'AdvancedSmartTab',
  props: ['smartData'],
  data() {
    return {
      showTip: false,
      baseModel: {
        tcSwitch: 'off',
        list: [
          {
            enable: 'on',
            ifname: 'br-wan',
            uploadBand: '100',
            downloadBand: '100'
          },
          {
            enable: 'on',
            ifname: 'br-wan1',
            uploadBand: '200',
            downloadBand: '200'
          }
        ]
      }
    }
  },
  created() {
    this._loadData()
  },
  watch: {
    smartData(v) {
      this._loadData()
    }
  },
  methods: {
    // 加载页面数据
    async _loadData() {
      if (this.smartData) {
        this.baseModel = this.smartData // || await this.$api.getSmartFlow()
        if (this.baseModel.tcSwitch === 'on') {
          // 当前流控开启时，判断是否有wan口未配置流控
          this.baseModel.list.forEach(d => {
            if (d.enable === 'off') {
              this.showTip = true
            }
          })
        }
      }
    },
    getPositiveValidator(enable) {
      // if (enable === 'off') {
      //   return []
      // } else {
      return [
        { required: true, message: this.$t('egw.enter_positive_integer') },
        {
          validator: rangeValidator,
          min: 1,
          max: 10000,
          message: this.$t('egw.flowctrl.band_range2')
        }
      ]
      // }
    },
    // 保存配置
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.setSmartFlow(this.baseModel).then(() => {
            this.showTip = false
            this.$message({
              type: 'success',
              message: this.$t('tip.edit1_success')
            })

            this.$emit('smart-change', this.baseModel.tcSwitch)
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.advanced-smart-tab {
  .ml150 {
    margin-left: 150px;
  }
}
</style>
