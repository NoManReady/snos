<template>
  <div class="box">
    <div class="box-header">
      <span class="box-header-tit">
        {{$t('egw.set_operator')}}
        <small></small>
      </span>
    </div>
    <help-alert :closable="false" :title="$t('egw.open_isp_tip')" class="mb15" type="info"></help-alert>
    <el-form :class="formClass" :label-position="labelPos" :model="isp" label-width="160px" ref="ispForm" size="medium">
      <el-form-item :label="$t('egw.open_isp')">
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
        {{$t('egw.multilink_load_mode')}}
        <small></small>
      </span>
    </div>
    <help-alert :closable="false" :title="$t('egw.flow_by_isp')" class="mb15" type="info">
      <template slot="content">
        <div class="mtb10">{{$t('egw.balance_model_tip')}}</div>
        <div>{{$t('egw.active_backup_tip')}}</div>
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
      size="medium"
    >
      <!-- <el-form-item label="开启多链路负载均衡">
        <el-switch v-model="weight.enable" active-value="1" inactive-value="0"></el-switch>
      </el-form-item>-->
      <el-form-item :label="$t('egw.traffic_pattern')" prop="mode">
        <el-select :disabled="weight.enable === '0'" class="w300" v-model="weight.mode">
          <el-option :label="$t('egw.balance')" value="weight"></el-option>
          <el-option :label="$t('egw.active_backup')" value="master"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('egw.balanced_strategy')"
        :style="$store.state.app.lang==='en'?{'margin-bottom':'30px'}:{}"
        prop="policy"
      >
        <el-select class="w300" v-model="weight.policy">
          <el-option :label="$t('egw.balanced_by_link')" value="session"></el-option>
          <el-option :label="$t('egw.balanced_by_originator_ip')" value="sip"></el-option>
        </el-select>
        <div class="el-form-item__error c-warning" v-if="weight.policy === 'session'">{{$t('egw.balanced_by_originator_ip_tip')}}</div>
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
              <el-option :label="$t('egw.interface_main_set')" value="1"></el-option>
              <el-option :label="$t('egw.interface_second_set')" value="0"></el-option>
            </el-select>
          </el-form-item>
          <span>
            <i class="c-danger mlr5">*</i>
            {{$t('egw.weight')}}
          </span>
          <el-form-item :prop="`master_list[${i}].w`" :rules="getPositiveValidator(weight.enable)" label>
            <el-input :disabled="weight.enable==='0'" class="w120" v-model="o.w"></el-input>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item
        :key="`weight_list_${i}`"
        :label="`WAN${i===0 ? '' : i} `+ $t('egw.weight')"
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
          k: this.$t('egw.telecom'),
          v: this.$t('egw.telecom')
        },
        {
          k: this.$t('egw.unicom'),
          v: this.$t('egw.unicom')
        },
        {
          k: this.$t('egw.mobile'),
          v: this.$t('egw.mobile')
        },
        {
          k: this.$t('egw.maze'),
          v: this.$t('egw.maze')
        },
        {
          k: this.$t('egw.other'),
          v: this.$t('egw.other')
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
            isp: this.$t('egw.other')
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
        if (value === this.$t('egw.other')) {
          return cb()
        }
        let _list = this.isp.isp_list
          .slice(0, this.switchValue)
          .filter(o => o.isp !== this.$t('egw.other'))
          .map(o => o.isp)

        if (
          _list.length >= 2 &&
          _list.indexOf(value) !== _list.lastIndexOf(value)
        ) {
          cb(this.$t('egw.select_diffrent_operator'))
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
          cb(this.$t('egw.select_more_interface_main'))
        } else if (_flag === _mlist.length) {
          cb(this.$t('egw.select_more_interface_second'))
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
          {
            required: true,
            message: this.$t('egw.weight_is_require'),
            whitespace: true
          },
          {
            validator: rangeValidator,
            min: 1,
            max: 100000,
            message: this.$t('egw.weight_range')
          }
        ]
      }
    }
  }
}
</script>
<style lang="scss">
</style>
