<template>
  <div class="block overview-wifi-info mb10">
    <div :class="{'pointer': !disableClick}" @click="_onToWifiSetting('2')" class="box-header" v-if="headerStyle=='title'">
      <span class="box-header-tit">无线信息</span>
    </div>
    <el-row align="middle" class="mb10" justify="center" type="flex" v-else>
      <el-col class="c-info tl">无线信息</el-col>
      <el-col class="tr">
        <el-button @click="_onToWifiSetting('2')" type="text">配置></el-button>
      </el-col>
    </el-row>
    <el-row align="center" class="wifi-info">
      <el-col :lg="11" :md="24" :span="11" :xs="24">
        <el-row align="center" class="tc auto-margin" justify="center" type="flex">
          <el-col :lg="2" :span="3">
            <div :class="{'pointer': !disableClick}" @click="_onToWifiSetting('0')">
              <i class="rjucd-wifi c-success"></i>
            </div>
          </el-col>
          <el-col :lg="22" :span="21">
            <div class="view-item">
              <label class="title">无线网络：</label>
              <div class="content word-break">{{ !!masterWifi ? masterWifi.ssidName : '-'}}</div>
            </div>
            <div class="view-item">
              <label class="title">是否加密：</label>
              <div class="content">{{isEncry(masterWifi)}}</div>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :lg="13" :md="24" :span="13" :xs="24">
        <el-row align="center" class="tc auto-margin" justify="center" type="flex">
          <el-col :lg="2" :span="3">
            <div :class="{'pointer': !disableClick}" @click="_onToWifiSetting('1')">
              <i :class="editVistor.enable === 'true' ? 'c-success' : 'c-info'" class="rjucd-wifi"></i>
            </div>
          </el-col>
          <el-col :lg="22" :span="21">
            <div class="view-item">
              <label class="title">访客Wi-Fi：</label>
              <div class="content">
                <label class="vm" v-popover:vistorSsidPopover>
                  <label
                    @click="vistorSsidPopover = true"
                    class="pointer mr10 word-break"
                    v-if="editable && vistorSsid.enable === 'true'"
                  >
                    <a class="c-success" href="javascript:;">{{ !!vistorSsid ? vistorSsid.ssidName : '-'}}</a>
                    <i class="el-icon-edit fs16 c-success ml5"></i>
                  </label>
                  <label class="word-break" v-else-if="vistorSsid.enable === 'true'">{{ !!vistorSsid ? vistorSsid.ssidName : '-'}}</label>
                  <el-switch
                    :disabled="!editable"
                    :title="!editable && '从AP或公寓WiFi不可编辑' "
                    active-value="true"
                    inactive-value="false"
                    v-model="editVistor.enable"
                  ></el-switch>
                </label>
              </div>
            </div>
            <div class="view-item">
              <label class="title">是否加密：</label>
              <div class="content">{{isEncry(vistorSsid)}}</div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-popover :value="vistorSsidPopover" placement="top" ref="vistorSsidPopover" trigger="manual" width="260">
      <el-form :model="editVistor" :rules="baseRules" @submit.native.prevent ref="baseForm" size="mini">
        <el-form-item prop="ssidName">
          <p class="tc fs15">编辑访客Wi-Fi名称</p>
          <el-input
            :title="editVistor.ssidName"
            @keydown.enter.native="_onVistorSubmit"
            ref="inputSsidName"
            v-model="editVistor.ssidName"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="tc">
        <el-button @click="vistorSsidPopover = false" size="mini" type="text">取消</el-button>
        <el-button :loading="false" @click="_onVistorSubmit" size="mini" type="primary">确定</el-button>
      </div>
    </el-popover>
  </div>
</template>
<script>
import { wirelessFn } from '@/model/modules/wireless'
import { Col, Row } from 'element-ui'
import { isAuth } from '@/directives/auth'
import { ssidNameValidator, wifiNameValidator } from '@/utils/rules'
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
      if (this.includeChinese) {
        return cb()
      }
      if (
        this.ssidNames.includes(value) &&
        this.vistorSsid.ssidName !== value
      ) {
        cb(new Error(`已存在该名称：${value}`))
      }
      cb()
    }
    return {
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
          { required: true, message: '请输入Wi-Fi名称', whitespace: true },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 },
          { validator: ssidNameUniValidator }
        ]
      }
    }
  },
  mixins: [wifiMixins],
  components: {
    [Col.name]: Col,
    [Row.name]: Row
  },
  computed: {
    ssidNames() {
      return this.ssidList.map(o => o.ssidName)
    },
    includeChinese() {
      return /[\u4e00-\u9fa5]/.test(this.editVistor.ssidName)
    },
    masterWifi() {
      return this.ssidList.find(ssid => ssid.wlanId === '1')
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
              `当前Wi-Fi已达8个，请先去删除一个才能开启访客Wi-Fi。`,
              '提示',
              {
                type: 'warning',
                showClose: false,
                cancelButtonText: '暂不开启',
                confirmButtonText: '去删除Wi-Fi',
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
          this.$confirm('是否关闭访问Wi-Fi？').then(
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
      !this.disableClick &&
        this.$router.push({
          name:
            this.headerStyle === 'row'
              ? 'admin/wifi/wifi_setting'
              : 'admin/alone/network/wifi_setting',
          query: { tab: tab }
        })
    },
    isEncry(wifi) {
      return wifi ? (wifi.encryptionMode === 'open' ? '否' : '是') : '-'
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
