<template>
  <div class="vpn-l2tp-client">
    <help-alert :title="$t('egw.pptp.pptp_initiator')" json-key="vpnPptpCliJson"></help-alert>
    <!-- <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.l2tp.global')}}
          <small></small>
        </span>
      </div>
      <el-form :model="globalModel" :rules="globalRules" class="w500" label-width="180px" ref="globalForm" size="medium">
        <el-form-item :label="$t('egw.pptp.pptp_maintenance_interval')" prop="lcpechointerval">
          <el-input placeholder="60-1000" v-model="globalModel.lcpechointerval"></el-input>
          <span class="web-form--tip">{{$t('time.second')}}</span>
        </el-form-item>
        <el-form-item>
          <el-button class="w160" type="primary" v-auth="_onSubmitGlobal">{{$t('action.save')}}</el-button>
        </el-form-item>
      </el-form>
    </div>-->
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
          </el-form-item>-->
          <el-form-item :label="$t('egw.user_name')" prop="username">
            <el-input
              :placeholder="$t('egw.pptp.tunnel_user_tip',{type:'PPTP',name:$t('egw.user_name')})"
              class="w280"
              v-model="baseModel.username"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.password')" prop="password">
            <el-input
              :placeholder="$t('egw.pptp.tunnel_user_tip',{type:'PPTP',name:$t('egw.password')})"
              class="w280"
              :type="showPwd?'text':'password'"
              v-model="baseModel.password"
            ></el-input>
            <span class="web-form--tip"><i class="el-icon-view fs18 ml5 vm pointer" :class="{'c-success':showPwd}" @click="showPwd=!showPwd"></i></span>
          </el-form-item>
          <el-form-item :label="$t('egw.l2tp.service_addr')" prop="lns">
            <el-input :placeholder="$t('wan.ip_example')" class="w280" v-model="baseModel.lns"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.l2tp.remotesubnet')" prop="remotesubnet">
            <el-input :placeholder="$t('rules.net_example')" class="w280" v-model="baseModel.remotesubnet"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.l2tp.workmode')" prop="workmode">
            <el-radio-group v-model="baseModel.workmode">
              <el-radio label="nat">NAT</el-radio>
              <el-radio label="route">{{$t('egw.route_tag')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('egw.pptp.ppp_maintenance_interval')" prop="lcpechointerval">
            <el-input class="w280" placeholder="60-1000" v-model="baseModel.lcpechointerval"></el-input>
            <span class="web-form--tip">{{$t('time.second')}}</span>
          </el-form-item>
          <el-form-item :label="$t('phrase.status')" prop="enable">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button :loading="isLoading" @click="_onModalConfirm" class="w160" type="primary">{{$t('action.save')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { ipValidator, intValidator, rangeValidator } from '@/utils/rules'
import modelFn from '@/model'
import { isIpInNet, ipNetValidate } from '@/utils/commonValidates'
export default {
  name: 'vpn-pptp-client',
  data() {
    return {
      showPwd: false,
      MAX_NUM: 20,
      isLoading: false,
      baseModel: modelFn.vpnPptpCliFn(),
      baseRules: {
        username: [{ required: true, message: I18N.t('egw.is_required') }],
        password: [{ required: true, message: I18N.t('egw.is_required') }],
        lns: [
          { required: true, message: I18N.t('egw.is_required') },
          { validator: ipValidator }
        ],
        presharekey: [{ required: true, message: I18N.t('egw.is_required') }],
        remotesubnet: [
          { required: true, message: I18N.t('egw.is_required') },
          { validator: ipNetValidate }
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
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getPptpClient()
      let _list = _res.list || []
      if (_list.length > 0) {
        this.baseModel = Object.assign({}, this.baseModel, _list[0])
      }
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
      this.isLoading = true
      this.$api.setPptpClient({ ...this.baseModel }).finally(_ => {
        this.$message({
          message: I18N.t('tip.edit1_success'),
          type: 'success'
        })
        this.isLoading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
