<template>
  <div class="components-wifi">
    <help-alert :closable="false" class="mb20" show-icon title="该配置需下发至无线EAP后才能生效" type="info" v-if="isEgw&&showLimitTip"></help-alert>
    <el-form
      :disabled="disabled"
      :label-position="labelPos"
      :model="baseModel"
      :rules="baseRules"
      label-width="140px"
      ref="baseForm"
      status-icon
    >
      <template v-if="showConfig">
        <el-form-item label="Wi-Fi名称" prop="ssidName">
          <el-input class="w300" v-model="baseModel.ssidName"></el-input>
        </el-form-item>
        <el-form-item label="Wi-Fi名称编码" prop="ssidEncode" v-show="includeChinese">
          <el-select class="w300" v-model="baseModel.ssidEncode">
            <el-option label="UTF-8" value="utf-8"></el-option>
            <el-option label="GBK" value="gbk"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用频段" prop="relatedRadio" v-if="!isQuick">
          <el-select class="w300" v-model="baseModel.relatedRadio">
            <el-option :key="rs.k" :label="rs.k" :value="rs.v" v-for="rs in rsMap"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="加密类型" prop="encryptionMode">
          <el-select class="w300" v-model="baseModel.encryptionMode">
            <el-option label="不加密" value="open"></el-option>
            <el-option label="WPA-PSK" value="wpa-psk"></el-option>
            <el-option label="WPA2-PSK" value="wpa2-psk"></el-option>
            <el-option label="WPA_WPA2-PSK" value="wpa_wpa2-psk"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Wi-Fi密码" prop="password" v-if="baseModel.encryptionMode!=='open'">
          <eweb-input-password class="w300" type="password" v-model="baseModel.password"></eweb-input-password>
        </el-form-item>
        <template v-if="showMoreConf">
          <p @click="moreConf=!moreConf" class="tc components-wifi--conf ml40">
            <el-button size="mini" type="text">{{moreConfText}}</el-button>
          </p>
          <div class="mt20" v-show="moreConf">
            <template v-if="showTmMode">
              <el-form-item label="生效时段" prop="tmMode">
                <el-select class="w300" v-model="baseModel.tmMode">
                  <el-option label="永远不关闭" value="all"></el-option>
                  <el-option label="一小时后关闭" value="1h"></el-option>
                  <el-option label="六小时后关闭" value="6h"></el-option>
                  <el-option label="十二小时后关闭" value="12h"></el-option>
                  <el-option label="其他时段" value="def"></el-option>
                </el-select>
              </el-form-item>
            </template>
            <template v-if="baseModel.tmMode==='def'">
              <el-form-item label="选择时段">
                <el-select @change="_onTmModeChange" class="w300" placeholder="请选择" v-model="baseModel.tmValue.tmngtName">
                  <el-option :key="item.tmngtName" :label="item.tmngtName" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
                  <el-option label="自定义" value></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="is-required" label="日历" prop="tmValue.slot" v-if="baseModel.tmValue.tmngtName === ''">
                <span @click="onOpenTimeSelection(baseModel.tmValue.slot||{},disabled?false:true)" class="f-theme pointer">
                  <i class="el-icon-date"></i>
                  {{disabled?'查看时间':'选择时间'}}
                </span>
              </el-form-item>
            </template>
            <div v-show="showVlan">
              <el-form-item label="VLAN" v-if="isRouter">
                <el-select class="w300" v-model="baseModel.vlanId">
                  <el-option label="默认VLAN" value></el-option>
                  <el-option
                    :key="`vlan_${i}`"
                    :label="`${o.vlanid}  ${o.desc ? '（'+o.desc+'）' : ''}`"
                    :value="o.vlanid"
                    v-for="(o, i) in lans"
                  ></el-option>
                  <el-option @click.native="goToLan" label="去添加新VLAN" v-if="!isQuick" value="-1"></el-option>
                </el-select>
              </el-form-item>
              <template v-else>
                <el-form-item label="VLAN">
                  <el-select class="w300" v-model="vlanType">
                    <el-option label="用户与AP同VLAN" value="0"></el-option>
                    <el-option label="其他VLAN" value="1"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="VLAN ID" prop="vlanId" ref="wifiVlanid" v-if="vlanType === '1'">
                  <auto-complete
                    :data-source="lans"
                    @input="onVlanChange"
                    class="w300"
                    placeholder="范围为2~232 或 234~4090"
                    v-model="baseModel.vlanId"
                    value-key="vlanid"
                  ></auto-complete>
                </el-form-item>
              </template>
            </div>
            <template v-if="!isQuick">
              <el-form-item label="隐藏Wi-Fi" prop="ishidden">
                <el-switch active-value="true" inactive-value="false" v-model="baseModel.ishidden">隐藏</el-switch>
                <label class="ml10 c-info">（让别人看不到WiFi热点，只能手动添加）</label>
              </el-form-item>
              <el-form-item label="用户隔离" prop="guest">
                <el-switch
                  :disabled="!showGuest"
                  :title="!showGuest && '这是访客Wi-Fi，默认开启隔离'"
                  active-value="true"
                  inactive-value="false"
                  v-model="baseModel.guest"
                ></el-switch>
                <label class="ml10 c-info">（隔离接入该WIFI的用户）</label>
              </el-form-item>
              <el-form-item label="5G优先" prop="bandSelectEnable" v-if="show5GSwitch">
                <el-switch
                  :disabled="baseModel.relatedRadio.trim() !== '1,2'"
                  active-value="true"
                  inactive-value="false"
                  v-model="baseModel.bandSelectEnable"
                ></el-switch>
                <label class="ml10 c-info">（支持5G的终端优先关联到5G）</label>
              </el-form-item>
              <el-form-item label="竞速模式" prop="xpress">
                <el-switch active-value="true" inactive-value="false" v-model="baseModel.xpress"></el-switch>
                <label class="ml10 c-info">（开启后体验更快的上网速度）</label>
              </el-form-item>
              <el-form-item label="三层漫游" prop="roam">
                <el-switch active-value="true" inactive-value="false" v-model="baseModel.roam"></el-switch>
                <label class="ml10 c-info">（开启后终端在同一个Wi-Fi下IP保持不变）</label>
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
import { isBetween } from '@/utils/rulesUtils'
import { deepClone } from '@/utils/utils'
import formMixins from '@/mixins/formMixins'
import AutoComplete from '@/common/AutoComplete'
import InputPassword from '@/common/InputPassword'
import timeSelection from '@/utils/timeSelection'
import model from '@/model'
export default {
  name: 'ComponentsWifi',
  props: {
    labelPos: {
      type: String,
      default: 'top'
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
      return /[\u4e00-\u9fa5]/.test(this.baseModel.ssidName)
    },
    show5GSwitch() {
      return (
        !this.$store.getters.isSingleRadio || this.$roles().includes('master')
      )
    },
    moreConfText() {
      return this.moreConf ? '收起高级设置' : '展开高级设置'
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
    showVlan() {
      return (
        this.$roles().includes('master') ||
        this.$store.getters.devMode.forwardMode !== 'ROUTER'
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
      if (this.includeChinese) {
        return cb()
      }
      if (this.ssidNames.includes(value) && this.data.ssidName !== value) {
        cb(new Error(`已存在该名称：${value}`))
      }
      cb()
    }
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      baseModel: model.wirelessFn(),
      showFowardType: true,
      defaultSlot: '',
      timeGroups: [],
      baseRules: {
        ssidName: [
          { required: true, message: '请输入Wi-Fi名称', whitespace: true },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 },
          { validator: ssidNameUniValidator }
        ],
        password: [
          { required: true, message: '请输入Wi-Fi密码' },
          { min: 8, max: 16, message: '密码至少8位，最多16位' },
          { validator: passwdValidator }
        ],
        vlanId: [
          { required: true, message: '请输入VLAN ID', whitespace: true },
          { validator: vlanIdValidator }
        ],
        'tmValue.slot': [
          { validator: timeValidator, message: '请选择时间范围' }
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

    this._setModel(!this.data.ssidName)
  },
  watch: {
    data: {
      handler(v) {
        this._setModel(!v.ssidName) // 新增Wi-Fi时，data没有ssidName
        this._clearValidate()
      },
      deep: true
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
      this.$confirm('确认跳转到【LAN设置】页面添加VLAN ？').then(
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
            tmngtName: '所有时段'
          }
        }
      }
      let _model = model.wirelessFn(null)
      this.baseModel = Object.assign({}, _model, deepClone(this.data), defVal)
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
        this.baseModel.tmValue.slot !== ''
      ) {
        this.baseModel.tmValue.tmngtName = ''
      }
      this.defaultSlot = this.baseModel.tmValue.slot
    },
    // 验证表单
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(valid => {
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

            resolve(_model)
          } else {
            // 高级设置里校验不通过时，展开高级设置
            if (obj.vlanId || obj['tmValue.slot']) {
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
  .wifi-tip {
    width: 87%;
    margin-left: 13%;
  }
  @media screen and (max-width: 768px) {
    .wifi-tip {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
