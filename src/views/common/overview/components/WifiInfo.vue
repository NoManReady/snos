<template>
  <div :class="{'block': headerStyle !== 'title'}" class="overview-wifi-info mb10" v-loading="!isLoaded">
    <div :class="{ pointer: !disableClick }" @click="_onToWifiSetting('2')" class="box-header" v-if="headerStyle === 'title'">
      <span class="box-header-tit">{{ $t("overview.wireless_info") }}</span>
    </div>
    <el-row align="middle" justify="center" type="flex" v-else>
      <el-col class="c-info tl">{{ $t("overview.wireless_info") }}</el-col>
      <el-col class="tr">
        <el-button @click="_onToWifiSetting('2')" type="text">{{ $t("action.config") }}></el-button>
      </el-col>
    </el-row>
    <el-row align="center" class="wifi-info">
      <el-col :lg="11" :md="isEg ? 24 : 11" :span="11" :xs="24">
        <el-row align="center" class="tc auto-margin" justify="center" type="flex">
          <el-col :lg="2" :span="3">
            <div :class="{ pointer: !disableClick }" @click="_onToWifiSetting('0')">
              <i class="rjucd-wifi c-success"></i>
            </div>
          </el-col>
          <el-col :lg="22" :span="21">
            <div class="view-item">
              <label class="title">{{ $t("overview.wireless_net_f") }}</label>
              <div class="content word-break">{{ !!masterWifi ? masterWifi.ssidName : "-" }}</div>
            </div>
            <div class="view-item">
              <label class="title">{{ $t("overview.encrypt_or_not_f") }}</label>
              <div class="content">{{ isEncry(masterWifi) }}</div>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :lg="13" :md="isEg ? 24 : 13" :span="13" :xs="24">
        <el-row align="center" class="tc auto-margin" justify="center" type="flex">
          <el-col :lg="2" :span="3">
            <div :class="{ pointer: !disableClick }" @click="_onToWifiSetting('1')">
              <i :class="editVistor.enable === 'true' ? 'c-success' : 'c-info'" class="rjucd-wifi"></i>
            </div>
          </el-col>
          <el-col :lg="22" :span="21">
            <div class="view-item">
              <label class="title">{{ $t("overview.guest_wifi_f") }}</label>
              <div class="content">
                <label class="vm" v-popover:vistorSsidPopover>
                  <label
                    @click="vistorSsidPopover = true"
                    class="pointer mr10 word-break"
                    v-if="editable && vistorSsid.enable === 'true'"
                  >
                    <a class="c-success" href="javascript:;">
                      {{
                      !!vistorSsid ? vistorSsid.ssidName : "-"
                      }}
                    </a>
                    <i class="el-icon-edit fs16 c-success ml5"></i>
                  </label>
                  <label
                    class="word-break"
                    v-else-if="vistorSsid.enable === 'true'"
                  >{{ !!vistorSsid ? vistorSsid.ssidName : "-" }}</label>
                  <el-switch
                    :disabled="!editable"
                    :title="!editable && $t('overview.slave_wifi_notedit')"
                    active-value="true"
                    inactive-value="false"
                    v-model="editVistor.enable"
                  ></el-switch>
                </label>
              </div>
            </div>
            <div class="view-item">
              <label class="title">{{ $t("overview.encrypt_or_not_f") }}</label>
              <div class="content">{{ isEncry(vistorSsid) }}</div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-popover :value="vistorSsidPopover" placement="top" ref="vistorSsidPopover" trigger="manual" width="260">
      <el-form :model="editVistor" :rules="baseRules" @submit.native.prevent ref="baseForm" size="small">
        <el-form-item prop="ssidName">
          <p class="tc fs15">{{ $t("overview.edit_guest_wifi") }}</p>
          <el-input
            :title="editVistor.ssidName"
            @keydown.enter.native="_onVistorSubmit"
            ref="inputSsidName"
            v-model="editVistor.ssidName"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="tc">
        <el-button @click="vistorSsidPopover = false" plain size="small">
          {{
          $t("action.cancel")
          }}
        </el-button>
        <el-button :loading="false" @click="_onVistorSubmit" size="small" type="primary">{{ $t("action.confirm") }}</el-button>
      </div>
    </el-popover>
  </div>
</template>
<script>
import { wirelessFn } from '@/model/modules/wireless'
import { isAuth } from '@/directives/auth'
import { ssidNameValidator, wifiNameValidator } from '@/utils/rules'
import { existValidate } from '@/utils/rulesUtils'
import wifiMixins from '@/views/common/wireless/components/wifiMixins'
export default {
  name: 'WifiInfo',
  props: {
    headerStyle: {
      type: String,
      default: 'row'
    },
    disableClick: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const ssidNameUniValidator = (rule, value, cb) => {
      if (existValidate(this.ssidNames, value, this.vistorSsid.ssidName)) {
        return cb(new Error(I18N.t('overview.wifi_is_exist', { name: value })))
      }
      cb()
    }
    return {
      loadWifi: true,
      isSilence: true,
      ignoreEnable: true,
      ssidList: [],
      isDisable: false,
      vistorSsidPopover: false,
      vistorSsid: {
        ...wirelessFn(),
        guest: 'true',
        enable: 'false',
        wlanId: '8',
        vlanId: '1'
      },
      editVistor: {
        enable: 'false',
        ssidName: '@Ruijie-guest'
      },
      baseRules: {
        ssidName: [
          {
            required: true,
            message: I18N.t('overview.wifi_no_empty'),
            whitespace: true
          },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 },
          { validator: ssidNameUniValidator }
        ]
      }
    }
  },
  mixins: [wifiMixins],
  computed: {
    ssidNames() {
      return this.ssidList.map(o => o.ssidName)
    },
    includeChinese() {
      return /[\u4e00-\u9fa5]/.test(this.editVistor.ssidName)
    },
    masterWifi() {
      return this.ssidList.find(ssid => ssid.wlanId === '1')
    },
    isEg() {
      return this.$roles().includes('egw')
    }
  },
  watch: {
    'wireless.ssidList'() {
      let _vistorSsid = this.wireless.ssidList.find(ssid => ssid.wlanId === '8')

      if (_vistorSsid) {
        this.vistorSsid = { ...this.vistorSsid, ..._vistorSsid, guest: 'true' }
        this.editVistor = { ...this.vistorSsid }
      } else {
        this.vistorSsid.ssidName = this.defaultVistorName // 默认访客Wi-Fi名称
        if (this.wireless.ssidList.length >= 8) {
          this.isDisable = true
        }
      }
      this.ssidList = this.wireless.ssidList || []
      this.$nextTick(_ => {
        this.ignoreEnable = false
      })
    },
    'editVistor.enable': {
      handler(v, o) {
        if (this.ignoreEnable) {
          // 开关时忽略弹框
          return
        }
        if (v === 'true') {
          if (this.isDisable) {
            return this.$confirm(
              I18N.t('overview.wifi_limit_tip'),
              I18N.t('phrase.tip'),
              {
                type: 'warning',
                showClose: false,
                cancelButtonText: I18N.t('overview.unopened_now'),
                confirmButtonText: I18N.t('overview.delete_wifi'),
                closeOnClickModal: false,
                dangerouslyUseHTMLString: true
              }
            ).then(
              _ => {
                this._onToWifiSetting('2')
              },
              _ => {
                this.editVistor.enable = 'false'
              }
            )
          } else {
            this.vistorSsidPopover = true
          }
        } else if (this.vistorSsid.enable === 'true') {
          this.$confirm(I18N.t('overview.close_wifi_confirm')).then(
            _ => {
              this._onVistorSubmit()
            },
            _ => {
              this.editVistor.enable = 'true'
              // this.ignoreEnable = true
              this.$nextTick(_ => {
                // this.ignoreEnable = false
                this.vistorSsidPopover = false
              })
            }
          )
        }
      },
      immediate: false
    },
    vistorSsidPopover(v) {
      if (v) {
        this.editVistor.ssidName =
          this.vistorSsid.ssidName || this.defaultVistorName
        this.$nextTick(_ => {
          this.$refs.inputSsidName.focus()
        })
      } else {
        this.editVistor.enable = this.vistorSsid.enable
      }
    }
  },
  methods: {
    // 跳转至无线管理列表
    _onToWifiSetting(tab) {
      let _initpath =
        this.headerStyle === 'row'
          ? 'admin/wifi/wifi_setting'
          : 'admin/alone/wifi/wifi_setting'
      if (
        !this.disableClick &&
        this.$router.getMatchedComponents({ name: _initpath }).length > 0
      ) {
        if (this.$roles().includes('ehr') && tab === '2') {
          // 家用去掉Wi-Fi列表页面，跳转到无线网络配置页面
          tab = '0'
        }
        this.$router.push({
          name: _initpath,
          query: { tab: tab }
        })
      }
    },
    isEncry(wifi) {
      return wifi
        ? wifi.encryptionMode === 'open'
          ? I18N.t('phrase.no')
          : I18N.t('phrase.yes')
        : '-'
    },
    async _onVistorSubmit(e) {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          isAuth(_ => {
            this.vistorSsidPopover = false
            this.vistorSsid = Object.assign(this.vistorSsid, this.editVistor)

            this._postWifiData(this.vistorSsid)
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.wifi-info {
  .rjucd-wifi {
    font-size: 40px;
    line-height: 1;
  }
  .view-item {
    .title {
      width: 95px;
      padding-right: 5px;
      text-align: right;
      vertical-align: middle;
      float: left;
    }
    .content {
      margin-left: 95px;
      text-align: left;
    }
  }
  .auto-margin {
    margin: 10px 0;
  }

  @media only screen and (min-width: 1200px) {
    .auto-margin {
      margin: 35px 0;
    }
  }
  .word-break {
    word-break: break-all;
  }
}
</style>
