<template>
  <div class="vpn-l2tp-server">
    <help-alert :title="$t('egw.l2tp.global')" json-key="pppoeGlobalJson">
       <div slot="content">
        <p>
          {{$t('egw.pppoe.ineffective_pppoe_tip')}}
        </p>
        <p>
         {{$t('egw.pppoe.ineffective_pppoe_tip2')}}
        </p>
        <p>
         {{$t('egw.pppoe.ineffective_pppoe_tip3')}}
        </p>
      </div>
    </help-alert>
    <div class="box">
      <el-form
        :model="baseModel"
        :rules="baseRules"
        :validate-on-rule-change="false"
        class="web-form w460"
        label-width="180px"
        ref="baseForm"
      >
        <el-form-item :label="$t('egw.pppoe.pppoe_server')" prop="state">
          <el-radio-group v-model="baseModel.state">
            <el-radio label="1">{{$t('egw.start_using')}}</el-radio>
            <el-radio label="0">{{$t('egw.no_start_using')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.pppoe_required')" prop="force_state">
          <el-radio-group v-model="baseModel.force_state">
            <el-radio label="1">{{$t('egw.start_using')}}</el-radio>
            <el-radio label="0">{{$t('egw.pppoe.forbid')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form
          :model="poolModel"
          :rules="getPoolRules(isAddPool, true)"
          :validate-on-rule-change="false"
          class="web-form w600"
          label-width="180px"
          ref="poolForm"
        >
          <el-form-item :label="$t('egw.l2tp.addr_zone_ip_range')" prop="ipRange">
            <el-input class="w280" placeholder="1.1.1.2-1.1.1.100" v-model="poolModel.ipRange"></el-input>
          </el-form-item>
        </el-form>
        <el-form-item label="VLAN">
          <el-select class="w280" v-model="baseModel.monitor_port">
            <el-option :label="$t('wifi_comm.def_vlan')" value></el-option>
            <el-option
              :key="`vlan_${i}`"
              :label="`${o.vlanid}  ${o.desc ? '('+o.desc+')' : ''}`"
              :value="o.vlanid"
              v-for="(o, i) in lans"
            ></el-option>
            <el-option :label="$t('wifi_comm.add_new_vlan')" @click.native="goToLan" value="-1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.first_dns_server')" prop="first_dns_server">
          <el-input :placeholder="$t('wan.ip_example')" v-model="baseModel.first_dns_server"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.second_dns_server')" prop="second_dns_server">
          <el-input :placeholder="$t('wan.ip_example')" v-model="baseModel.second_dns_server"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.max_sessions')" prop="max_sessions">
          <el-input v-model="baseModel.max_sessions"></el-input>
          <span class="web-form--tip">{{$t('egw.pppoe.global_range',{cnt:50})}}</span>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.max_noreply_lcp')" prop="max_noreply_lcp">
          <el-input v-model="baseModel.max_noreply_lcp"></el-input>
          <span class="web-form--tip">{{$t('egw.pppoe.global_range',{cnt:60})}}</span>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.idle_time')" prop="idle_time">
          <el-input v-model="baseModel.idle_time"></el-input>
          <span class="web-form--tip">{{$t('egw.pppoe.idle_time_tip')}}</span>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.chap_type')">
          <el-checkbox active-value="1" inactive-value="0" v-model="baseModel.pap" label="PAP"></el-checkbox>
          <el-checkbox active-value="1" inactive-value="0" v-model="baseModel.chap" label="CHAP"></el-checkbox>
          <el-checkbox active-value="1" inactive-value="0" v-model="baseModel.mschap" label="MSCHAP"></el-checkbox>
          <el-checkbox active-value="1" inactive-value="0" v-model="baseModel.mschapv2" label="MSCHAP2"></el-checkbox>
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
import { ipRangeRegxp, ipToLong } from "@/utils/rulesUtils";
import { isIpInNet, isExistIpRange } from "@/utils/commonValidates";
import modelFn from '@/model'
export default {
  name: 'pppoe-global',
  components: {
  },
  data() {
    const localIpValidate = (r, v, cb) => {
      if (isIpInNet(v, [this.poolModel.ipRange])) {
        //this.ipRangeList)) {
        return cb(new Error(I18N.t('egw.l2tp.outside_addr_zone')))
      }
      cb()
    }
    return {
      lans: [],
      lansAll: [],
      isLoading: false,
      baseModel: modelFn.pppoeGlobalFn(),
      poolModel: modelFn.vpnPoolFn(),
      baseRules: {
        // monitor_port: [
        //   {
        //     required: true,
        //     message: I18N.t('wan.vid_no_empty')
        //   }
        // ],
        first_dns_server: [
          // { required: true, message: I18N.t('egw.l2tp.dns_is_required') },
          { validator: strictIpValidator }
        ],
        second_dns_server: [
          { validator: strictIpValidator }
        ],
        max_sessions: [
          {required: true, message: I18N.t('egw.pppoe.max_sessions_is_required')},
          {
            validator: rangeValidator,
            min: 1,
            max: 50,
            message: I18N.t('egw.pppoe.global_range',{cnt:50})
          }
        ],
        max_noreply_lcp: [
          {required: true, message: I18N.t('egw.pppoe.max_noreply_lcp_is_required')},
          {
            validator: rangeValidator,
            min: 1,
            max: 60,
            message: I18N.t('egw.pppoe.global_range',{cnt:60})
          }
        ],
        idle_time: [
          {required: true, message: I18N.t('egw.pppoe.idle_time_is_required')},
          {
            validator: rangeValidator,
            min: 0,
            max: 10080,
            message: I18N.t('egw.pppoe.idle_time_range')
          }
        ]
      }
    }
  },
  async created() {
    this._initPage()
    let _net = await this.$api.getNetwork()
    let _lans = _net.lan || []
    this.lansAll = _lans
    this.lans = Object.freeze(_lans.filter(lan => lan.vlanid !== '233'))
  },
  computed: {
    isAddPool() {
      return this.baseModel.ippool_name === 'SELF_DEFINED'
    },
    nameMap() {
      let _map = {};
      this.poolList.forEach(p => (_map[p.ippool_name] = true));
      return _map;
    },
    ipRangeList() {
      return this.poolList.map(o => o.first_addr + "-" + o.end_addr);
    }
  },
  methods: {
    goToLan() {
      this.$confirm(I18N.t('wifi_comm.jump_to_vlan')).then(
        _ => {
          this.$router.push({
            name: 'admin/alone/network/network_lan',
            query: { tab: '0' }
          })
        },
        _ => {
          this.baseModel.monitor_port = 'br-lan'
        }
      )
    },
    // 获取地址池
    async loadIpPool() {
      let _res = await this.$api.getIpPool();
      this.poolList = (_res.list || []).map(o =>
        Object.assign(o, { ipRange: `${o.first_addr}-${o.end_addr}` })
      );
    },
    getPoolRules(isAddPool = false, checkIpRange = true) {
      const _sameNameValidate = (r, v, cb) => {
        if (isAddPool && this.nameMap[v])
          return cb(new Error(I18N.t("egw.pool.addr_zone_is_has")));
        cb();
      };
      const isLegalIp = (r, v, cb) => {
        if (!ipRangeRegxp.test(v)) {
          return cb(new Error(I18N.t('egw.pppoe.pool_range_valid')));
        } else {
          let _sIp = v.split(/\s*-\s*/)[0];
          let _eIp = v.split(/\s*-\s*/)[1];
          let _ipNum = ipToLong(_eIp) - ipToLong(_sIp);
          if (_ipNum < 0) {
            return cb(
              new Error(I18N.t("egw.pool.end_addr_less_then_start_addr"))
            );
          } else if (_ipNum > 1000) {
            return cb(
              new Error(I18N.t("egw.pool.within_addr_num", { cnt: _ipNum }))
            );
          }
        }
        if (checkIpRange) {
          this.poolList.forEach((item,idx)=>{
            if(this.poolModel.ippool_name == item.ippool_name) {
              this.editIndex = idx
            }
          })
          if (isExistIpRange(v, this.editIndex, this.ipRangeList)) {
            return cb(new Error(I18N.t("egw.pool.addr_range_is_has")));
          }
          this.lansAll.forEach((item,idx)=>{
            if (isIpInNet(item.ipaddr, [v])){
              return cb(new Error(I18N.t("egw.pool.addr_range_is_has")));
            }
          })
          // let _ipList = this.baseModel.used_ip_list;
          // if (_ipList && _ipList.length > 0) {
          //   let _usedIp = _ipList.find(ip =>
          //     isIpInNet(ip, [this.poolModel.ipRange])
          //   );
          //   if (_usedIp) {
          //     return cb(
          //       new Error(
          //         I18N.t("egw.pool.addr_used_in_service", { ip: _usedIp })
          //       )
          //     );
          //   }
          // }
        }
        cb();
      };
      return {
        ipRange: [
          { required: true, message: I18N.t("egw.pool.iprange_no_empty") },
          { validator: isLegalIp }
        ]
      };
    },
    async _initPage() {
      let _res = await this.$api.getPppoeGlobal()
      await this.loadIpPool()
      _res.chap = _res.chap === '1' ? true : false,
      _res.mschap = _res.mschap === '1' ? true : false,
      _res.mschapv2 = _res.mschapv2 === '1' ? true : false,
      _res.pap = _res.pap === '1' ? true : false
      this.baseModel = Object.assign({}, this.baseModel, _res)
      this._onChangePool('pppoe_pool')
    },
    // 保存
    _onSave() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$refs.poolForm.validate(valid2 => {
            if (valid2) {
              this._addPool()
              this._onSubmit()
            }
          })
        }
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
      let _pool = this.poolList.find(o => o.ippool_name === 'pppoe_pool')
      if (_pool) {
        await this.$api.setIpPool(_poolData, false)
      } else {
        await this.$api.setIpPool(_poolData, true)
      }
    },
    _onChangePool(poolName) {
      let _pool = this.poolList.find(o => o.ippool_name === poolName)
      if (_pool) {
        this.poolModel.ippool_name = poolName
        this.poolModel.ipRange = `${_pool.first_addr}-${_pool.end_addr}`
      } else {
        this.poolModel.ippool_name = 'pppoe_pool'
        this.poolModel.ipRange = ''
      }
    },
    // 提交全局配置
    _onSubmit() {
      this.isLoading = true
      let subData = JSON.parse(JSON.stringify(this.baseModel))
      subData.chap = subData.chap ? '1' : '0',
      subData.mschap = subData.mschap ? '1' : '0',
      subData.mschapv2 = subData.mschapv2 ? '1' : '0',
      subData.pap = subData.pap ? '1' : '0'
      this.$api
        .setPppoeGlobal({ ...subData })
        .then(d => {
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
