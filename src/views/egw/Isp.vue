<template>
  <div class="box">
    <div class="box-header">
      <span class="box-header-tit">
        运营商设置
        <small></small>
      </span>
    </div>
    <help-alert
      :closable="false"
      class="mb15"
      title="开启地址库选路并设置正确的出口运营商后，数据流将按运营商地址库自动选路，达到如电信数据走电信、联通数据走联通的效果，避免跨运营商访问，实现更快速的网络访问。如果两个出口属于同一运营商，不建议开启地址库选路。"
      type="info"
    ></help-alert>
    <el-form :class="formClass" :label-position="labelPos" :model="isp" class="web-form" label-width="160px" ref="ispForm">
      <el-form-item label="开启地址库选路">
        <el-switch active-value="1" inactive-value="0" v-model="isp.enable"></el-switch>
      </el-form-item>
      <el-form-item
        :key="`isp_list_${i}`"
        :label="`WAN${i===0 ? '' : i }`"
        :prop="`isp_list[${i}].isp`"
        :rules="getIspValidator(isp.enable)"
        v-for="(o, i) in isp.isp_list.slice(0, switchValue)"
      >
        <el-select :disabled="isp.enable==='0'" class="w300" v-model="o.isp">
          <el-option :key="so.v" :label="so.k" :value="so.v" v-for="so in selectItems"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="box-header">
      <span class="box-header-tit">
        多链路负载模式设置
        <small></small>
      </span>
    </div>
    <help-alert :closable="false" class="mb15" title="流量先根据地址库选路的情况进行选路，剩余的流量根据负载模式进行分配。" type="info">
      <template slot="content">
        <div class="mtb10">1、均衡模式：流量按WAN口的权重值比例分配，比如WAN口和WAN1的权重分别设置为3和2，则流量给WAN分配60%,WAN1分配40%。</div>
        <div>2、主备模式：主接口工作正常时，流量全部走主接口；主接口发生故障时，流量自动切换到备接口。多个主/备接口时，需设置权重(同均衡模式说明)。</div>
      </template>
    </help-alert>
    <el-form
      :class="formClass"
      :inline="true"
      :label-position="labelPos"
      :model="weight"
      class="web-form w500"
      label-width="160px"
      ref="weightForm"
    >
      <!-- <el-form-item label="开启多链路负载均衡">
        <el-switch v-model="weight.enable" active-value="1" inactive-value="0"></el-switch>
      </el-form-item>-->
      <el-form-item label="负载模式" prop="mode">
        <el-select :disabled="weight.enable === '0'" class="w300" v-model="weight.mode">
          <el-option label="均衡" value="weight"></el-option>
          <el-option label="主备" value="master"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="均衡策略" prop="policy">
        <el-select class="w300" v-model="weight.policy">
          <el-option label="基于连接进行均衡" value="session"></el-option>
          <el-option label="基于源IP进行均衡" value="sip"></el-option>
        </el-select>
        <div class="el-form-item__error c-warning" v-if="weight.policy === 'session'">若出现网银业务访问失败，请选择“基于源IP进行均衡”</div>
      </el-form-item>
      <!-- <el-form-item label="主接口" prop="intf" v-if="weight.mode === 'master'">
        <el-select class="w300" v-model="weight.intf">
          <el-option
            :key="`master_intf_${i}`"
            :label="`WAN${i===1 ? '' : i-1}`"
            :value="`wan${i===1 ? '' : i-1}`"
            v-for="i in switchValue"
          ></el-option>
        </el-select>
      </el-form-item>-->
      <template v-if="weight.mode === 'master'">
        <el-form-item :key="`master_list_${i}`" v-for="(o, i) in weight.master_list.slice(0, switchValue)">
          <el-form-item :label="`WAN${i===0 ? '' : i }`" :prop="`master_list[${i}].m`" :rules="getMasterValidator(weight.enable)">
            <el-select :disabled="weight.enable==='0'" class="w120" v-model="o.m">
              <el-option label="设为主接口" value="1"></el-option>
              <el-option label="设为备接口" value="0"></el-option>
            </el-select>
          </el-form-item>
          <span>
            <i class="c-danger mlr5">*</i>权重
          </span>
          <el-form-item :prop="`master_list[${i}].w`" :rules="getPositiveValidator(weight.enable)" label>
            <el-input :disabled="weight.enable==='0'" class="w120" v-model="o.w"></el-input>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item
        :key="`weight_list_${i}`"
        :label="`WAN${i===0 ? '' : i} 权重`"
        :prop="`weight_list[${i}].w`"
        :rules="getPositiveValidator(weight.enable)"
        v-else
        v-for="(o, i) in weight.weight_list.slice(0, switchValue)"
      >
        <el-input :disabled="weight.enable === '0'" class="w300" v-model="o.w"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { rangeValidator } from '@/utils/rules'
import modelFn from '@/model'
export default {
  name: 'ComponentsIsp',
  props: {
    labelPos: {
      type: String,
      default: 'top'
    },
    formClass: {
      type: [String, Array]
    },
    switchValue: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      isp: modelFn.wanIspFn(),
      weight: modelFn.wanWeightFn(),
      selectItems: [
        {
          k: '电信',
          v: '电信'
        },
        {
          k: '联通',
          v: '联通'
        },
        {
          k: '移动',
          v: '移动'
        },
        {
          k: '教育网',
          v: '教育网'
        },
        {
          k: '其它',
          v: '其它'
        }
      ]
    }
  },
  created() {
    this._initPage()
  },
  watch: {
    switchValue: {
      handler: function(v, o) {
        this.updateDataBySwitchValue(v)
      },
      immediate: false
    },
    'isp.enable'(v) {
      // 清除验证信息
      this.$nextTick(() => {
        if (v === '0') {
          this.$refs.ispForm.clearValidate()
          // this.$refs.weightForm.clearValidate()
        } else {
          this.$refs.ispForm.validate()
        }
      })
    },
    // 'weight.mode'(v, o) {
    //   if (v === 'weight') {
    //     this.weight.weight_list = this.weight.weight_list.map((o, i) => ({
    //       ifname: o.ifname,
    //       w: (this.weight.master_list[i] || {}).w || '1'
    //     }))
    //   } else if (v === 'master') {
    //     this.weight.master_list = this.weight.master_list.map((o, i) => ({
    //       ifname: o.ifname,
    //       m: o.m || '1',
    //       w: (this.weight.weight_list[i] || {}).w || '1'
    //     }))
    //   }
    // },
    // 主备接口同时校验提示
    'weight.master_list': {
      handler() {
        this.$refs.weightForm.validate()
      },
      deep: true
    },
    // ISP选路同时校验提示
    'isp.isp_list': {
      handler() {
        this.$refs.ispForm.validate()
      },
      deep: true
    }
  },
  methods: {
    async _initPage() {
      let params = [
        {
          method: 'devSta.get',
          params: { module: 'route_db', data: { func: 'state' } }
        },
        {
          method: 'devSta.get',
          params: { module: 'mllb' }
        }
      ]
      let _res = await this.$api.cmd('cmdArr', { params })
      this.isp = Object.assign({}, this.isp, _res[0])
      this.weight = Object.assign({}, this.weight, _res[1])
      // 根据线路数，设置数据
      this.updateDataBySwitchValue(this.switchValue)
    },
    updateDataBySwitchValue(v) {
      Array.from({ length: v }, (_, i) => {
        // 补齐地址库选路，默认"其它"
        if (!this.isp.isp_list[i]) {
          this.isp.isp_list.push({
            ifname: `wan${i === 0 ? '' : i}`,
            isp: '其它'
          })
        }
        // 补齐负载模式-均衡，默认"1"
        if (!this.weight.weight_list[i]) {
          this.weight.weight_list.push({
            ifname: `wan${i === 0 ? '' : i}`,
            w: '1'
          })
        }
        // 补齐负载模式-主备，
        if (!this.weight.master_list[i]) {
          this.weight.master_list.push({
            ifname: `wan${i === 0 ? '' : i}`,
            m: i == 0 ? '1' : '0', // 第一个是主，其他是备
            w: '1'
          })
        }
      })
      this.isp.intf_cnt = String(v)
      this.weight.intf_cnt = String(v)
      this.weight.enable = '1' // 负载均衡需开启
    },
    setMultWan() {
      let _weight
      if (this.switchValue === 1) {
        // 单WAN口关闭ISP选路和负载均衡
        this.isp.enable = '0'
        this.weight.enable = '0'
      } else {
        // 多WAN口，截取前switchValue个数据
        this.isp.isp_list = this.isp.isp_list.slice(0, this.switchValue)

        _weight = { ...this.weight }
        if (_weight.mode === 'master') {
          _weight.master_list = _weight.master_list.slice(0, this.switchValue)
          delete _weight.weight_list
        } else if (_weight.mode === 'weight') {
          _weight.weight_list = _weight.weight_list.slice(0, this.switchValue)
          delete _weight.master_list
        } else {
          // console.log('weight mode error')
        }
      }
      this.$api.setMultWan({
        isp: this.isp,
        weight: _weight,
        switchValue: this.switchValue
      })
    },
    // 表单验证
    validForm() {
      return new Promise((resolve, reject) => {
        Promise.all([
          this.$refs.ispForm.validate(),
          this.$refs.weightForm.validate()
        ]).then(
          valid => {
            resolve()
          },
          _ => {
            reject()
          }
        )
      })
    },
    getIspValidator(enable) {
      const ispCheck = (rule, value, cb) => {
        if (value === '其它') {
          return cb()
        }
        let _list = this.isp.isp_list
          .slice(0, this.switchValue)
          .filter(o => o.isp !== '其它')
          .map(o => o.isp)

        if (
          _list.length >= 2 &&
          _list.indexOf(value) !== _list.lastIndexOf(value)
        ) {
          cb('请选择不同的运营商')
        } else {
          cb()
        }
      }
      if (enable === '0') {
        return []
      } else {
        return [
          {
            validator: ispCheck
          }
        ]
      }
    },
    getMasterValidator(enable) {
      const masterCheck = (rule, value, cb) => {
        let _mlist = this.weight.master_list.slice(0, this.switchValue)
        let _flag = _mlist.reduce((a, b) => a + +b.m, 0)
        if (_flag === 0) {
          cb('请至少设置一个主接口')
        } else if (_flag === _mlist.length) {
          cb('请至少设置一个备接口')
        } else {
          cb()
        }
      }
      if (enable === '0') {
        return []
      } else {
        return [
          {
            validator: masterCheck
          }
        ]
      }
    },
    getPositiveValidator(enable) {
      if (enable === '0') {
        return []
      } else {
        return [
          { required: true, message: '请输入权重值', whitespace: true },
          {
            validator: rangeValidator,
            min: 1,
            max: 100000,
            message: '权重值范围1~100000'
          }
        ]
      }
    }
  }
}
</script>
<style lang="scss">
</style>
