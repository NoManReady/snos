<template>
  <div class="components-wifi">
    <help-alert :closable="false" :title="$t('wifi_comm.wifi_tip')" class="mb20" show-icon type="info" v-if="isEgw&&showLimitTip"></help-alert>
    <el-form
      :class="{'w500': !isMobile, 'mobile-form': isMobile}"
      :disabled="disabled"
      :label-position="labelPos"
      :label-width="isMobile ? '105px' : '160px'"
      :model="baseModel"
      :rules="baseRules"
      ref="baseForm"
      size="medium"
    >
      <template v-if="showConfig">
        <el-form-item label="双频合一" prop="relatedRadio" v-if="isEhr">
          <el-switch v-model="isSameSsid"></el-switch>
          <label class="ml10 c-info">(2.4G和5G使用同一个Wi-Fi名称)</label>
        </el-form-item>
        <el-form-item :label="`${$t('quickmacc.wifi_name')}${isSameSsid?'':'(2.4G)'}`" prop="ssidName">
          <el-input class v-model="baseModel.ssidName"></el-input>
        </el-form-item>
        <el-form-item :label="`${$t('quickmacc.wifi_name')}(5G)`" prop="ssidName5G" v-if="!isSameSsid">
          <el-input class v-model="baseModel.ssidName5G"></el-input>
        </el-form-item>
        <el-form-item :label="$t('wifi_comm.ssid_encode')" prop="ssidEncode" v-show="includeChinese">
          <el-select v-model="baseModel.ssidEncode">
            <el-option label="UTF-8" value="utf-8"></el-option>
            <el-option label="GBK" value="gbk"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('wifi_comm.apply_radio')" prop="relatedRadio" v-if="!isQuick && !isEhr">
          <el-select v-model="baseModel.relatedRadio">
            <el-option :key="rs.k" :label="rs.k" :value="rs.v" v-for="rs in rsMap"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('wifi_comm.encry_type')" prop="encryptionMode">
          <el-select v-model="baseModel.encryptionMode">
            <el-option :label="$t('wifi_comm.no_encry')" value="open"></el-option>
            <el-option label="WPA-PSK" value="wpa-psk"></el-option>
            <el-option label="WPA2-PSK" value="wpa2-psk"></el-option>
            <el-option label="WPA_WPA2-PSK" value="wpa_wpa2-psk"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('quickmacc.wifi_pass')" prop="password" v-if="baseModel.encryptionMode!=='open'">
          <eweb-input-password :class="{'w300': !isMobile}" type="password" v-model="baseModel.password"></eweb-input-password>
        </el-form-item>
        <template v-if="showMoreConf">
          <p @click="moreConf=!moreConf" class="tc components-wifi--conf mlr20">
            <el-button size="mini" type="text">{{moreConfText}}</el-button>
          </p>
          <div class="mt20" v-show="moreConf">
            <template v-if="showTmMode">
              <el-form-item :label="$t('wifi_comm.effective_time')" prop="tmMode">
                <el-select v-model="baseModel.tmMode">
                  <el-option :label="$t('wifi_comm.never_close')" value="all"></el-option>
                  <el-option :label="$t('wifi_comm.close_after_hour')" value="1h"></el-option>
                  <el-option :label="$t('wifi_comm.close_after_six')" value="6h"></el-option>
                  <el-option :label="$t('wifi_comm.close_after_half')" value="12h"></el-option>
                  <el-option :label="$t('wifi_comm.other_time')" value="def"></el-option>
                </el-select>
              </el-form-item>
            </template>
            <template v-if="baseModel.tmMode==='def'">
              <el-form-item :label="$t('wifi_comm.select_time')">
                <el-select :placeholder="$t('action.select')" @change="_onTmModeChange" v-model="baseModel.tmValue.tmngtName">
                  <el-option :key="item.tmngtName" :label="item.name" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
                  <el-option :label="$t('wifi_comm.by_self')" value></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                :label="$t('wifi_comm.date')"
                class="is-required"
                prop="tmValue.slot"
                v-if="baseModel.tmValue.tmngtName === ''"
              >
                <span @click="onOpenTimeSelection(baseModel.tmValue.slot||{},disabled?false:true)" class="f-theme pointer">
                  <i class="el-icon-date"></i>
                  {{disabled?$t('wifi_comm.view_time'):$t('wifi_comm.select_time')}}
                </span>
              </el-form-item>
            </template>
            <div v-show="showVlan">
              <el-form-item label="VLAN" v-if="isRouter">
                <el-select v-model="baseModel.vlanId">
                  <el-option :label="$t('wifi_comm.def_vlan')" value></el-option>
                  <el-option
                    :key="`vlan_${i}`"
                    :label="`${o.vlanid}  ${o.desc ? '（'+o.desc+'）' : ''}`"
                    :value="o.vlanid"
                    v-for="(o, i) in lans"
                  ></el-option>
                  <el-option :label="$t('wifi_comm.add_new_vlan')" @click.native="goToLan" v-if="!isQuick" value="-1"></el-option>
                </el-select>
              </el-form-item>
              <template v-else>
                <el-form-item label="VLAN">
                  <el-select v-model="vlanType">
                    <el-option :label="$t('wifi_comm.vlan_as_ap')" value="0"></el-option>
                    <el-option :label="$t('wifi_comm.other_vlan')" value="1"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="VLAN ID" prop="vlanId" ref="wifiVlanid" v-if="vlanType === '1'">
                  <auto-complete
                    :data-source="lans"
                    :placeholder="$t('wifi_comm.vlan_limit')"
                    @input="onVlanChange"
                    v-model="baseModel.vlanId"
                    value-key="vlanid"
                  ></auto-complete>
                </el-form-item>
              </template>
            </div>
            <template v-if="!isQuick">
              <el-form-item :label="$t('wifi_comm.hidden_wifi')" prop="ishidden">
                <el-switch active-value="true" inactive-value="false" v-model="baseModel.ishidden">{{$t('wifi_comm.hidden')}}</el-switch>
                <label class="ml10 c-info">{{$t('wifi_comm.hidden_wifi_tip')}}</label>
              </el-form-item>
              <el-form-item :label="$t('wifi_comm.user_isolation')" prop="guest">
                <el-switch
                  :disabled="!showGuest"
                  :title="!showGuest && $t('wifi_comm.isolation_tip')"
                  active-value="true"
                  inactive-value="false"
                  v-model="baseModel.guest"
                ></el-switch>
                <label class="ml10 c-info">{{$t('wifi_comm.iso_user_tip')}}</label>
              </el-form-item>
              <el-form-item :label="$t('wifi_comm.priority_5g')" prop="bandSelectEnable" v-if="show5GSwitch">
                <el-switch
                  :disabled="baseModel.relatedRadio.trim() !== '1,2'"
                  active-value="true"
                  inactive-value="false"
                  v-model="baseModel.bandSelectEnable"
                ></el-switch>
                <label class="ml10 c-info">{{$t('wifi_comm.priority_5g_tip')}}</label>
              </el-form-item>
              <el-form-item :label="$t('wifi_comm.xpress')" prop="xpress">
                <el-switch active-value="true" inactive-value="false" v-model="baseModel.xpress"></el-switch>
                <label class="ml10 c-info">{{$t('wifi_comm.xpress_tip')}}</label>
              </el-form-item>
              <el-form-item :label="$t('wifi_comm.roam')" prop="roam" v-if="!isEhr">
                <el-switch active-value="true" inactive-value="false" v-model="baseModel.roam"></el-switch>
                <label class="ml10 c-info">{{$t('wifi_comm.roam_tip')}}</label>
              </el-form-item>
            </template>
          </div>
        </template>
      </template>
    </el-form>
  </div>
</template>
<script>
import {
  vlanidOldValidator,
  ssidNameValidator,
  passwdValidator,
  wifiNameValidator
} from '@/utils/rules'
import { isBetween, existValidate } from '@/utils/rulesUtils'
import { deepClone } from '@/utils/utils'
import formMixins from '@/mixins/formMixins'
import AutoComplete from '@/common/AutoComplete'
import InputPassword from '@/common/InputPassword'
import timeSelection from '@/utils/timeSelection'
import { wirelessFn } from '@/model/modules/wireless'
export default {
  name: 'ComponentsWifi',
  props: {
    labelPos: {
      type: String,
      default: 'right'
    },
    data: {
      type: Object,
      required: true
    },
    rsMap: {
      type: Array,
      default: () => []
    },
    isQuick: {
      type: Boolean,
      default: true
    },
    outProto: {
      type: String,
      default: ''
    },
    ssidNames: {
      type: Array,
      default: () => []
    },
    showLimitTip: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showConfig: {
      type: Boolean,
      default: true
    },
    showGuest: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    includeChinese() {
      return (
        /[\u4e00-\u9fa5]/.test(this.baseModel.ssidName) ||
        /[\u4e00-\u9fa5]/.test(this.baseModel.ssidName5G)
      )
    },
    show5GSwitch() {
      return (
        !this.$store.getters.isSingleRadio || this.$roles().includes('master')
      )
    },
    moreConfText() {
      return this.moreConf
        ? I18N.t('wifi_comm.close_advanced')
        : I18N.t('wifi_comm.open_advanced')
    },
    isEgw() {
      return this.$dev() === 'egw'
    },
    isEap() {
      return this.$dev() === 'eap' // && EWR的AP模式
    },
    showMoreConf() {
      return this.outProto !== 'pppoe'
    },
    isEhr() {
      return this.$roles().includes('ehr')
    },
    showVlan() {
      return (
        !this.isEhr &&
        (this.$roles().includes('master') ||
          this.$store.getters.devMode.forwardMode !== 'ROUTER')
      )
    },
    showTmMode() {
      return this.data.wlanId === '8'
    },
    isRouter() {
      return this.$store.getters.devMode.forwardMode === 'ROUTER'
    }
  },
  data() {
    const vlanIdValidator = (rule, value, cb) => {
      if (value) {
        return vlanidOldValidator(rule, value, cb)
      }
      cb()
    }
    const ssidNameUniValidator = (rule, value, cb) => {
      if (existValidate(this.ssidNames, value, this.data.ssidName)) {
        return cb(new Error(I18N.t('overview.wifi_is_exist', { name: value })))
      }
      cb()
    }
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    const ssidRules = [
      {
        required: true,
        message: I18N.t('overview.wifi_no_empty'),
        whitespace: true
      },
      { validator: wifiNameValidator },
      { validator: ssidNameValidator, size: 32 },
      { validator: ssidNameUniValidator }
    ]
    return {
      isSameSsid: false,
      isMobile: !!ISMOBILE,
      baseModel: { ...wirelessFn(), ssidName5G: '' },
      showFowardType: true,
      defaultSlot: '',
      timeGroups: [],
      baseRules: {
        ssidName: ssidRules,
        ssidName5G: ssidRules,
        password: [
          { required: true, message: I18N.t('overview.wifipass_no_empty') },
          { validator: passwdValidator },
          { min: 8, max: 16, message: I18N.t('overview.wifipass_rule') }
        ],
        vlanId: [
          {
            required: true,
            message: I18N.t('wan.vid_no_empty'),
            whitespace: true
          },
          { validator: vlanIdValidator }
        ],
        'tmValue.slot': [
          {
            validator: timeValidator,
            message: I18N.t('wifi_comm.timerange_no_empty')
          }
        ]
      },
      editIndex: 0, //-1表示新增，其他表示修改
      moreConf: false,
      lans: [],
      vlanType: '0',
      specialVlans: ['1', '233', undefined],
      editVlanId: '' // 记录编辑的wifi的vlanid
    }
  },
  mixins: [formMixins],
  components: {
    AutoComplete,
    [InputPassword.name]: InputPassword
  },
  async created() {
    if (this.showMoreConf) {
      let _net = await this.$api.getNetwork()
      let _lans = _net.lan || []
      this.lans = Object.freeze(_lans.filter(lan => lan.vlanid !== '233'))
    }
    if (this.showMoreConf) {
      this._loadTimeGroupList()
    }
    if (this.isEhr) {
      // this.initEhrData()
    }
    // this._setModel(!this.data.ssidName)
  },
  watch: {
    data: {
      handler(v) {
        this._setModel(!v.ssidName) // 新增Wi-Fi时，data没有ssidName
        this._clearValidate()
      },
      deep: true,
      immediate: false
    },
    'baseModel.encryptionMode'(v) {
      if (v === 'open') {
        this.baseModel.password = ''
      }
    },
    'baseModel.relatedRadio'(v) {
      if (v.trim() !== '1,2') {
        this.baseModel.bandSelectEnable = 'false'
      }
    },
    isSameSsid(v) {
      if (v) {
        this.baseModel.ssidName5G = ''
        this.baseModel.relatedRadio = '1,2'
      } else {
        this.baseModel.ssidName5G = this.baseModel.ssidName + '_5G'
        this.baseModel.relatedRadio = '1'
      }
    }
  },
  methods: {
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
    },
    // 时间模式改变事件
    _onTmModeChange(v) {
      if (v) {
        this.baseModel.tmValue.slot = ''
      } else {
        this.baseModel.tmValue.slot = this.defaultSlot
      }
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.baseModel.tmValue.slot = Object.keys(d).length ? d : ''
        this.$refs.baseForm.validateField('tmValue.slot')
      })
    },
    onVlanChange(v, o) {
      this.$refs.wifiVlanid.validate()
    },
    goToLan() {
      this.$confirm(I18N.t('wifi_comm.jump_to_vlan')).then(
        _ => {
          this.$router.push({
            name: 'admin/alone/network/network_lan',
            query: { tab: '0' }
          })
        },
        _ => {
          this.baseModel.vlanId = ''
        }
      )
    },
    _setModel(isSetDefVal) {
      let defVal = {}
      if (isSetDefVal) {
        // 默认值
        defVal = {
          fowardType: 'bridge',
          vlanId: '1',
          tmMode: 'all',
          tmValue: {
            slot: '',
            tmngtName: I18N.t('phrase.alltime')
          }
        }
      }
      this.baseModel = Object.assign(
        {},
        this.baseModel,
        deepClone(this.data),
        defVal
      )
      // 编辑wifi时，记录原vlanId
      this.editVlanId = isSetDefVal ? this.baseModel.vlanId : this.data.vlanId
      if (this.specialVlans.includes(this.editVlanId)) {
        // 显示为 “默认VLAN” 或 “与AP同VLAN”
        this.baseModel.vlanId = ''
        this.vlanType = '0'
      } else {
        this.vlanType = '1'
      }

      // 隐藏生效时段时，生效时段默认为其他时段
      if (this.showTmMode === false) {
        this.baseModel.tmMode = 'def'
      }

      if (
        this.baseModel.tmMode === 'def' &&
        this.baseModel.tmValue.slot &&
        this.baseModel.tmValue.slot !== ''
      ) {
        this.baseModel.tmValue.tmngtName = ''
      }
      this.defaultSlot = this.baseModel.tmValue.slot

      // 访问网络设置用户隔离
      if (this.baseModel.wlanId === '8') {
        this.baseModel.guest = 'true'
      }
      // 是否双频合一
      this.isSameSsid = this.baseModel.relatedRadio === '1,2'
      if (this.isSameSsid) {
        this.baseModel.ssidName5G = this.baseModel.ssidName
      }
    },
    // 验证表单
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate((valid, res) => {
          if (valid) {
            let _model = deepClone(this.baseModel)
            // 时间模式数据处理
            if (_model.tmMode === 'def') {
              if (_model.tmValue.tmngtName) {
                _model.tmValue.slot = ''
              } else {
                _model.tmValue.tmngtName = new Date().getTime().toString()
              }
            } else {
              _model.tmValue = {
                slot: '',
                tmngtName: ''
              }
            }

            if (
              (!this.isRouter && this.vlanType == '0') ||
              _model.vlanId === ''
            ) {
              // 默认VLAN 或 与AP同VLAN 时，处理数据
              if (this.specialVlans.includes(this.editVlanId)) {
                if (this.editVlanId === undefined) {
                  // nat删除vlanId
                  delete _model.vlanId
                } else {
                  // 恢复原数据1或233
                  _model.vlanId = this.editVlanId || '1'
                }
              } else {
                // 原数据不是特殊vlanId时，修改为默认VLAN，设置vlanId为'1'
                _model.vlanId = '1'
              }
            } else {
              // vlanId不为1或233时，转发改成桥，兼容P16（才能生效）
              _model.fowardType = 'bridge'
            }

            resolve({ ..._model, isSameSsid: this.isSameSsid })
          } else {
            // 高级设置里校验不通过时，展开高级设置
            if (res.vlanId || res['tmValue.slot']) {
              this.moreConf = true
            }
            reject()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.components-wifi {
  .el-input,
  .el-select {
    width: 300px;
  }
  .mobile-form {
    .el-input,
    .el-select {
      width: 100%;
    }
  }
  &--conf {
    position: relative;
    &:before {
      content: '';
      display: block;
      border: 1px #ccc dashed;
      position: absolute;
      width: 100%;
      top: 50%;
      z-index: 0;
    }
    .el-button--text {
      z-index: 1;
      background: #fff;
      position: relative;
      padding: 7px 8px;
    }
  }
}
</style>
