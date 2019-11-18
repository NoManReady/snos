<template>
  <div class="advanced-smart-tab">
    <help-alert json-key="smartJson" title="智能流控">
      <div slot="content">根据用户数智能的调整每个用户的带宽，保证每个用户公平共享带宽。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          智能流控
          <small></small>
        </span>
        <span class="ml20 c-danger" v-if="baseModel.tcSwitch === 'on' && showTip">检测到有wan口未配置流控，请重新点击“保存配置”生效流控。</span>
      </div>
      <el-form :inline="true" :model="baseModel" class="w600" label-width="150px" ref="baseForm">
        <el-form-item label="开启流控" prop="tcSwitch">
          <el-switch active-value="on" inactive-value="off" v-model="baseModel.tcSwitch"></el-switch>
          <strong class="vm ml10 c-warning">如需测试外网宽带的真实速度，可先暂时关闭流控功能</strong>
        </el-form-item>
        <el-form-item
          :key="index"
          :label="`${wan.ifname.split(/-/)[1].toLocaleUpperCase()} 口线路带宽`"
          v-for="(wan,index) in baseModel.list"
          v-show="baseModel.tcSwitch==='on'"
        >
          <el-form-item
            :prop="`list[${index}].uploadBand`"
            :rules="getPositiveValidator(wan.enable)"
            label="上行"
            label-width="60px"
          >
            <el-input class="w80" v-model="wan.uploadBand"></el-input>Mbps
          </el-form-item>
          <el-form-item
            :prop="`list[${index}].downloadBand`"
            :rules="getPositiveValidator(wan.enable)"
            label="下行"
            label-width="60px"
          >
            <el-input class="w80" v-model="wan.downloadBand"></el-input>Mbps
          </el-form-item>
        </el-form-item>
        <el-form-item class="ml150">
          <el-button class="w200" type="primary" v-auth="onSubmit">保存配置</el-button>
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
        { required: true, message: '请输入数值' },
        {
          validator: rangeValidator,
          min: 1,
          max: 10000,
          message: '带宽范围 1~10000'
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
              message: '设置成功'
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
