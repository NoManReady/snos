<template>
  <div class="vpn-l2tp-server">
    <help-alert :title="$t('egw.l2tp.l2tp_service')" json-key="vpnL2tpSerJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.l2tp.l2tp_service_set')}}
          <small></small>
        </span>
      </div>
      <el-form
        :model="baseModel"
        :rules="baseRules"
        :validate-on-rule-change="false"
        class="web-form w460"
        label-width="180px"
        ref="baseForm"
      >
        <el-form-item :label="$t('egw.l2tp.local_addr')" prop="localip">
          <el-input :placeholder="$t('wan.ip_example')" v-model="baseModel.localip"></el-input>
        </el-form-item>
        <el-form
          :model="poolModel"
          :rules="getPoolRules(isAddPool, true)"
          :validate-on-rule-change="false"
          class="web-form w460"
          label-width="180px"
          ref="poolForm"
        >
          <el-form-item :label="$t('egw.l2tp.addr_zone_ip_range')" prop="ipRange">
            <el-input placeholder="1.1.1.2-1.1.1.100" v-model="poolModel.ipRange"></el-input>
          </el-form-item>
        </el-form>
        <el-form-item :label="$t('sysinfo.dns_addr')" prop="DNS">
          <el-input :placeholder="$t('wan.ip_example')" v-model="baseModel.DNS"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.l2tp.ipsec_encryption')" prop="ipsecenc">
          <el-select class="w280" v-model="baseModel.ipsecenc">
            <el-option :label="$t('egw.l2tp.encryption')" value="yes"></el-option>
            <el-option :label="$t('egw.l2tp.no_encryption')" value="no"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.psk')" prop="presharekey" v-if="baseModel.ipsecenc === 'yes'">
          <el-input v-model="baseModel.presharekey"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.ike_policy')" prop="ike_proposal" v-if="baseModel.ipsecenc === 'yes'">
          <el-select class="w280" v-model="baseModel.ike_proposal">
           <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in proposal1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.transform',{n:''})" prop="ph2_proposal" v-if="baseModel.ipsecenc === 'yes'">
          <el-select class="w280" v-model="baseModel.ph2_proposal">
           <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in proposal2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.negotiation_mode')" prop="exchange_mode" v-if="baseModel.ipsecenc === 'yes'">
          <el-radio-group v-model="baseModel.exchange_mode">
              <el-radio label="main">{{$t('egw.ipsec.main')}}</el-radio>
              <el-radio label="aggressive">{{$t('egw.ipsec.aggressive')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.local_id_type')" prop="local_id_type" v-if="baseModel.ipsecenc === 'yes'">
          <el-radio-group v-model="baseModel.local_id_type">
            <el-radio label="IP_ADDRESS">{{$t('sysinfo.ip_addr')}}</el-radio>
            <el-radio label="NAME">NAME</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.local_id')" prop="local_id_value" v-if="baseModel.ipsecenc === 'yes' && baseModel.local_id_type === 'NAME'">
          <el-input
            :disabled="baseModel.local_id_type === 'IP_ADDRESS'"
            :placeholder="$t('egw.rule_name_length_tip')"
            class="w300"
            v-model="baseModel.local_id_value"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.l2tp.l2tp_maintenance_interval')" prop="l2tphellointerval">
          <el-input placeholder="60-1000" v-model="baseModel.l2tphellointerval"></el-input>
          <span class="web-form--tip">{{$t('time.second')}}</span>
        </el-form-item>
        <el-form-item :label="$t('egw.pptp.ppp_maintenance_interval')" prop="lcpechointerval">
          <el-input placeholder="60-1000" v-model="baseModel.lcpechointerval"></el-input>
          <span class="web-form--tip">{{$t('time.second')}}</span>
        </el-form-item>
        <el-form-item :label="$t('phrase.status')" prop="enable">
          <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button class="w200" type="primary" v-auth="_onSave">{{$t('action.save')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import {
  ipValidator,
  strictIpValidator,
  intValidator,
  rangeValidator
} from '@/utils/rules'
import InputPassword from '@/common/InputPassword'
import { isIpInNet, ipNetValidate } from '@/utils/commonValidates'
import { quoteValidator } from '@/utils/rules'
import modelFn from '@/model'
import poolMixins from '../poolMixins'
export default {
  name: 'vpn-l2tp-server',
  components: {
    [InputPassword.name]: InputPassword
  },
  mixins: [poolMixins],
  data() {
    const localIpValidate = (r, v, cb) => {
      let ip = r.field == 'remotesubnet' ? v.split('/')[0] + 10 : v
      if (isIpInNet(ip, [this.poolModel.ipRange])) {
        //this.ipRangeList)) {
        return cb(new Error(I18N.t('egw.l2tp.outside_addr_zone')))
      }
      cb()
    }
    const subnetValidate = (r, v, cb) => {
      if (isIpInNet(v, this.networkLan)) {
        return cb(new Error(I18N.t('egw.l2tp.outside_lan_ip')))
      }
      cb()
    }
    return {
      isLoading: false,
      editIndex: -1,
      networkLan: [],
      baseModel: modelFn.vpnL2tpSerFn(),
      poolModel: modelFn.vpnPoolFn(),
      proposal1: modelFn.proposal1(),
      proposal2: modelFn.proposal2(),
      baseRules: {
        username: [
          { required: true, message: I18N.t('egw.username_is_required') }
        ],
        password: [
          { required: true, message: I18N.t('egw.password_is_required') }
        ],
        localip: [
          {
            required: true,
            message: I18N.t('egw.l2tp.local_addr_is_required')
          },
          { validator: ipValidator },
          { validator: localIpValidate }
        ],
        ippool_name: [
          { required: true, message: I18N.t('egw.l2tp.addr_zone_is_required') }
        ],
        DNS: [
          { required: true, message: I18N.t('egw.l2tp.dns_is_required') },
          { validator: strictIpValidator }
        ],
        local_id_value: [
          { required: true, message: I18N.t('egw.ipsec.local_id_is_required') },
          {
            range: true,
            min: 1,
            max: 28,
            message: I18N.t('egw.rule_name_length_tip')
          }
        ],
        l2tphellointerval: [
          { required: true, message: I18N.t('egw.l2tp.interval_is_required') },
          {
            validator: intValidator,
            message: I18N.t('egw.l2tp.time_positive_integer')
          },
          {
            validator: rangeValidator,
            min: 60,
            max: 1000,
            message: I18N.t('egw.l2tp.time_positive_integer_range')
          }
        ],
        lcpechointerval: [
          { required: true, message: I18N.t('egw.l2tp.interval_is_required') },
          {
            validator: intValidator,
            message: I18N.t('egw.l2tp.time_positive_integer')
          },
          {
            validator: rangeValidator,
            min: 60,
            max: 1000,
            message: I18N.t('egw.l2tp.time_positive_integer_range')
          }
        ]
      }
    }
  },
  watch: {
    'poolModel.ipRange'(v, o) {
      this.$refs.baseForm.validateField('localip')
    }
  },
  async created() {
    this._initPage()
  },
  computed: {
    isPoolMax() {
      return this.poolList.length >= this.MAX_NUM
    },
    isAddPool() {
      return this.baseModel.ippool_name === 'SELF_DEFINED'
    }
  },
  methods: {
    async _initPage() {
      await this.loadIpPool()
      let _res = await this.$api.getL2tpSer()
      this.baseModel = Object.assign({}, this.baseModel, _res)
      this._onChangePool(_res.ippool_name)
      this.loadNetwork()
    },
    async loadNetwork() {
      let _res = await this.$api.getNetwork()
      this.networkLan = _res.lan || []
    },
    // 保存
    _onSave() {
      Promise.all([this._validPoolForm(), this._validBaseForm()])
        .then(async _ => {
          this.baseModel.ippool_name = 'l2tp_pool'
          await this._addPool()
          this.$api.setL2tpSer(this.baseModel).then(_ => {
            this.$message.success(I18N.t('tip.edit1_success'))
          })
        })
        .catch(e => {
          // this.$message.warning('校验不通过')
        })
    },
    // 地址池表单验证
    _validPoolForm() {
      return new Promise((res, rej) => {
        this.$refs.poolForm.validate(async valid => {
          valid ? res() : rej()
        })
      })
    },
    // 地址池表单验证
    _validBaseForm() {
      return new Promise((res, rej) => {
        this.$refs.baseForm.validate(async valid => {
          valid ? res() : rej()
        })
      })
    },
    async _addPool() {
      let _poolData = { ...this.poolModel }
      let _ipArr = _poolData.ipRange.split(/\s*-\s*/)
      Object.assign(_poolData, {
        first_addr: _ipArr[0],
        end_addr: _ipArr[1]
      })
      delete _poolData.ipRange
      let _pool = this.poolList.find(o => o.ippool_name === _poolData.ippool_name)
      if (_pool) {
        await this.$api.setIpPool(_poolData, false)
      } else {
        await this.$api.setIpPool(_poolData, true)
      }
      // this.poolList.push(_poolData)
    },
    _onChangePool(poolName) {
      let _pool = this.poolList.find(o => o.ippool_name === poolName)
      if (_pool) {
        this.poolModel.ippool_name = poolName
        this.poolModel.ipRange = `${_pool.first_addr}-${_pool.end_addr}`
      } else {
        this.poolModel.ippool_name = 'l2tp_pool'
        this.poolModel.ipRange = ''
      }
    }
  }
}
</script>
