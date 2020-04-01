<template>
  <div class="vpn-l2tp-client">
    <help-alert :title="$t('egw.l2tp.l2tp_initiator')" json-key="vpnL2tpCliJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.l2tp.initiator_set')}}
          <small></small>
        </span>
      </div>
      <div class="box-content">
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" class="web-form w460" ref="baseForm" size="medium">
            <!-- <el-form-item :label="$t('egw.l2tp.tunnel_name')" prop="tunnelname">
              <el-input class="w280" :placeholder="$t('egw.l2tp.tunnelname_length_tip')" v-model="baseModel.tunnelname"></el-input>
            </el-form-item> -->
            <el-form-item :label="$t('egw.user_name')" prop="username">
              <el-input class="w280" :placeholder="$t('egw.pptp.tunnel_user_tip',{type:'L2TP',name:$t('egw.user_name')})" v-model="baseModel.username"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.password')" prop="password">
              <el-input class="w280" :type="showPwd?'text':'password'" :placeholder="$t('egw.pptp.tunnel_user_tip',{type:'L2TP',name:$t('egw.password')})" v-model="baseModel.password"></el-input>
              <i class="el-icon-view fs18 ml5 vm pointer" :class="{'c-success':showPwd}" @click="showPwd=!showPwd"></i>
            </el-form-item>
            <el-form-item :label="$t('egw.l2tp.service_addr')" prop="lns">
              <el-input class="w280" :placeholder="$t('wan.ip_example')" v-model="baseModel.lns"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.l2tp.remotesubnet')" prop="remotesubnet">
              <el-input class="w280" :placeholder="$t('rules.net_example')" v-model="baseModel.remotesubnet"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.l2tp.ipsec_encryption')" prop="ipsecenc">
              <el-select class="w280" v-model="baseModel.ipsecenc">
                <el-option :label="$t('egw.l2tp.encryption')" value="yes"></el-option>
                <el-option :label="$t('egw.l2tp.no_encryption')" value="no"></el-option>
              </el-select>
            </el-form-item>
              <el-form-item :label="$t('egw.ipsec.psk')" prop="presharekey" v-if="baseModel.ipsecenc === 'yes'">
                <el-input class="w280" v-model="baseModel.presharekey"></el-input>
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
            <el-form-item :label="$t('egw.ipsec.peer_id_type')" prop="remote_id_type" v-if="baseModel.ipsecenc === 'yes'">
              <el-radio-group v-model="baseModel.remote_id_type">
                <el-radio label="IP_ADDRESS">{{$t('sysinfo.ip_addr')}}</el-radio>
                <el-radio label="NAME">NAME</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('egw.ipsec.peer_id')" prop="remote_id_value" v-if="baseModel.remote_id_type === 'NAME' && baseModel.ipsecenc === 'yes'">
              <el-input
                :disabled="baseModel.remote_id_type === 'IP_ADDRESS'"
                :placeholder="$t('egw.rule_name_length_tip')"
                class="w300"
                v-model="baseModel.remote_id_value"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.l2tp.workmode')" prop="workmode">
              <el-radio-group v-model="baseModel.workmode">
                <el-radio label="nat">NAT</el-radio>
                <el-radio label="route">{{$t('egw.route_tag')}}</el-radio>
              </el-radio-group>
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
              <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button class="w160" :loading="isLoading" @click="_onModalConfirm" type="primary">{{$t('action.save')}}</el-button>
            </el-form-item>
          </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { ipValidator, intValidator, rangeValidator } from '@/utils/rules'
import modelFn from '@/model'
import formMixins from '@/mixins/formMixins'
import { isIpInNet, ipNetValidate } from '@/utils/commonValidates'
export default {
  name: 'vpn-l2tp-client',
  mixins: [formMixins],
  data() {
    return {
      showPwd: false,
      MAX_NUM: 20,
      baseModalShow: false,
      isLoading: false,
      editIndex: 0,
      list: [],
      proposal1: modelFn.proposal1(),
      proposal2: modelFn.proposal2(),
      baseModel: modelFn.vpnL2tpCliFn(),
      baseRules: {
        username: [{ required: true, message: I18N.t('egw.is_required') }],
        password: [{ required: true, message: I18N.t('egw.is_required') }],
        lns: [
          { required: true, message: I18N.t('egw.is_required') },
          { validator:ipValidator}
        ],
        presharekey: [{ required: true, message: I18N.t('egw.is_required') }],
        remotesubnet: [
          { required: true, message: I18N.t('egw.is_required') },
          { validator: ipNetValidate }
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
  computed: {
    modalTitle() {
      return this.editIndex !== -1
        ? I18N.t('action.edit')
        : I18N.t('action.add')
    }
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getL2tpClient()
      this.list = _res.list || []
      this.baseModel =
       ( this.editIndex === -1 || this.list  === []) ? modelFn.vpnL2tpCliFn() : Object.assign({}, this.baseModel, this.list[this.editIndex])
    },
    // // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交客户端设置
    _onSubmit() {
      // if (
      //   JSON.stringify(this.baseModel) ===
      //   JSON.stringify(this.list[this.editIndex])
      // ) {
      //   this.baseModalShow = false
      //   return this.$message({
      //     message: '配置未修改',
      //     type: 'success'
      //   })
      // }
      this.isLoading = true
      let _isAdd = this.editIndex === -1
      this.$api
        .setL2tpClient({ ...this.baseModel }, _isAdd)
        .then(d => {
          if (_isAdd) {
            this.list.push({ ...this.baseModel })
          } else {
            this.list.splice(this.editIndex, 1, { ...this.baseModel })
          }
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
