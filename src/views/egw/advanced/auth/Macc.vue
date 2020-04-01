<template>
  <div class="advanced-macc-auth">
    <help-alert json-key="authTabJson" :title="$t('egw.auth.wechat_sms_one_click_authentication')">
      <template slot="content">
        <div class="c-warning">
          <div class="mt10">
            <b>
              {{$t('egw.auth.wifi_link_wechat_step_tip')}}
              <el-button @click="onMoveToHelp" class="pd0" type="text">{{$t('egw.auth.search_click')}}</el-button>
            </b>
          </div>
          <div class="mt10">
            <b>
              {{$t('egw.auth.sms_step_tip')}}
              <el-button @click="onMoveToHelp" class="pd0" type="text">{{$t('egw.auth.search_click')}}</el-button>
            </b>
          </div>
          <div class="mt10">
            <b>
              <i18n path="egw.auth.erp_mac_to_white">
                <a @click="$parent.tabValue='4'" class="c-success pointer">{{$t('egw.auth.certification_free')}}</a>
              </i18n>
            </b>
          </div>
        </div>
      </template>
    </help-alert>
    <el-form :model="maccAuthData" :rules="baseRules" label-width="160px" ref="authForm" size="medium">
      <el-form-item :label="$t('egw.auth.auth_net_switch')">
        <el-switch active-value="1" inactive-value="0" v-model="maccAuthData.enable"></el-switch>
      </el-form-item>
      <template v-if="maccAuthData.enable === '1'">
        <el-form-item :label="$t('egw.auth.service_type')" prop="authType">
          <el-select class="w300" :placeholder="$t('egw.auth.select_service_type')" v-model="maccAuthData.authType">
            <el-option :label="$t('egw.auth.wifi_link_wechat')" value="wx2"></el-option>
            <el-option :label="$t('egw.auth.msg_click_auth')" value="wifidog"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.auth.name_by_wifi')" prop="wifiName" v-if="maccAuthData.authType !== 'wifidog'">
          <el-autocomplete :fetch-suggestions="querySearch" class="w300" v-model="maccAuthData.wifiName">
            <template slot-scope="props">
              <div class="name">{{ props.item.value }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <!-- <el-form-item label="无感知上线">
          <el-checkbox-group v-model="maccAuthData.macByPass">
            <el-checkbox label="开启" true-label="1" false-label="0"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>-->
        <el-form-item :label="$t('egw.auth.user_escape')">
          <el-checkbox-group v-model="maccAuthData.portalCheck">
            <el-checkbox false-label="0" :label="$t('phrase.enable')" true-label="1"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!-- <el-form-item label="下线检测模式">
          <el-checkbox-group v-model="maccAuthData.flowDetectEn">
            <el-checkbox label="开启" true-label="1" false-label="0"></el-checkbox>
          </el-checkbox-group>
          <div class="flow-detect">
            <el-form-item prop="flowDetectTime" label="" v-if="maccAuthData.flowDetectEn != '0'">
              <el-input size="mini" class="w50 mr5 ml5" v-model="maccAuthData.flowDetectTime"></el-input>
              <span>(1-65535)分钟内无流量，用户将被强制下线</span>
            </el-form-item>
          </div>
        </el-form-item>-->
        <el-form-item class="ip-list mb0 is-required" :label="$t('egw.auth.auth_range_by_ip')" prop="authIpList">
          <template v-for="(item,idx) in maccAuthData.authIpList">
            <el-form-item
              :key="idx"
              :prop="`authIpList[${idx}]`"
              :rules="ipValidate(maccAuthData.authIpList.concat(allAuthList),idx)"
            >
              <el-input class="w300" :placeholder="$t('wan.ip_range_example')" v-model="maccAuthData.authIpList[idx]"></el-input>
              <el-button @click="onDelAuthIpList(idx)" type="text" v-if="maccAuthData.authIpList.length > 1">
                <i class="el-icon-close"></i>
              </el-button>
              <el-button
                @click="onAddAuthIpList()"
                type="text"
                v-if="idx === maccAuthData.authIpList.length - 1 && maccAuthData.authIpList.length < 5"
              >
                <i class="el-icon-plus"></i>
              </el-button>
            </el-form-item>
          </template>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isSaveLoading" class="w160" type="primary" v-auth="onSave">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import { intValidate, isBetween } from '@/utils/rulesUtils'
import { judgeIpRangeRules } from '@/utils/commonValidates'
export default {
  name: 'AuthTab',
  data() {
    const detectTimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error(this.$t('egw.auth.enter_integer_required')))
      if (!isBetween(v, 1, 65535)) return cb(new Error(this.$t('egw.port_limit_tip')))
      return cb()
    }
    return {
      allAuthList: [],
      maccAuthData: { authIpList: [] },
      isSaveLoading: false,
      originDataStr: '',
      baseRules: {
        wifiName: [
          { required: true, message: this.$t('egw.auth.name_by_wifi_is_required')},
          {
            validator: nameLengthValidator,
            size: 64,
            message:  this.$t('egw.auth.wifi_nameno_exceed_64_characters')
          }
        ],
        authType: [{ required: true, message: this.$t('egw.auth.select_service_type')}],
        flowDetectTime: [
          { required: true, message: this.$t('egw.auth.enter_minutes_required') },
          { validator: detectTimeValidate }
        ]
      },
      wifiNames: null
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$api.getMaccAuth().then(d => {
        if (d.authIpList.length === 0) d.authIpList = ['']
        this.maccAuthData = d
        this.allAuthList = d.allAuthList
        this.originDataStr = JSON.stringify(this.maccAuthData)
      })
    },
    onMoveToHelp() {
      window.open('http://www.ruijie.com.cn/fw/qdwd/59789', '_blank')
    },
    ipValidate(list = [], index) {
      return judgeIpRangeRules(list, index)
    },
    async querySearch(queryString, cb) {
      if (!this.wifiNames) {
        let wifiInfo = await this.$api.getWireless()
        this.wifiNames = wifiInfo.ssidList.map(item => {
          return { value: item.ssidName }
        })
      }
      cb(this.wifiNames)
    },
    onAddAuthIpList() {
      this.maccAuthData.authIpList.push('')
    },
    onDelAuthIpList(idx) {
      this.maccAuthData.authIpList.splice(idx, 1)
    },
    onSave() {
      this.$refs.authForm.validate(ok => {
        if (ok) {
          if (this.originDataStr === JSON.stringify(this.maccAuthData))
            return this.$message(this.$t('egw.config_is_no_edit'))
          this.isSaveLoading = true
          this.$api
            .setMaccAuth(this.maccAuthData, true)
            .then(d => {
              if (d.code != '0') return this.$message(this.$t('egw.config_fail_reoperate'))
              this.$message({
                message: this.$t('tip.edit1_success'),
                type: 'success'
              })
              this.originDataStr = JSON.stringify(this.maccAuthData)
            })
            .finally(() => {
              this.isSaveLoading = false
            })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.advanced-macc-auth {
  .el-input__inner {
    padding: 5px;
  }
  .flow-detect {
    position: absolute;
    left: 80px;
    top: 0;
  }
  .ip-list {
    .el-form-item {
      margin-bottom: 22px;
    }
  }
}
</style>
