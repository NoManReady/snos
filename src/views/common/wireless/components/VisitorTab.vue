<template>
  <div class="visitor-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :max="MAX_NUM"></dev-ssid>
    <!-- WiFi配置 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          <span class="vm">{{$t('wifi_comm.visitor_ssid')}}</span>
          <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
        </span>
      </div>
      <div class="box-content">
        <el-form :label-width="isMobile ? '105px' : '160px'" size="medium">
          <el-form-item :label="$t('wifi_comm.is_open')">
            <el-switch :disabled="!editable || isDisable" active-value="true" inactive-value="false" v-model="vistorSsid.enable"></el-switch>
            <span v-if="isDisable">
              {{$t('wifi_comm.wifi_has_limit',{max:MAX_NUM})}}
              <a @click="_onToWifiList" class="c-success pointer">Wi-Fi</a>。
            </span>
          </el-form-item>
        </el-form>
        <wifi
          :data="vistorSsid"
          :disabled="!editable"
          :is-quick="false"
          :rs-map="rsMap"
          :show-config="vistorSsid.enable === 'true'"
          :show-guest="false"
          :show-limit-tip="false"
          :ssid-names="ssidNames"
          label-pos="right"
          ref="visitorRef"
        ></wifi>
        <el-form :label-width="isMobile ? '105px' : '160px'" class="mt20" size="medium" v-if="editable">
          <el-form-item>
            <el-button class="w160" type="primary" v-auth="_onSaveBaseWifi">{{$t('action.save')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import Wifi from '@/views/common/wireless/components/Wifi'
import wifiMixins from './wifiMixins'
import DevSsid from './DevSsid'
import DevGroup from './DevGroup'
import { wirelessFn } from '@/model/modules/wireless'
export default {
  name: 'WifiVistorTab',
  data() {
    return {
      isMobile: !!ISMOBILE,
      isDisable: false,
      vistorSsid: {
        ...wirelessFn(),
        guest: 'true',
        enable: 'false',
        wlanId: '8'
      }
    }
  },
  mixins: [wifiMixins],
  components: {
    Wifi,
    [DevSsid.name]: DevSsid,
    [DevGroup.name]: DevGroup
  },
  watch: {
    'wireless.ssidList'() {
      let _vistorSsid = this.wireless.ssidList.find(ssid => ssid.wlanId === '8')

      if (_vistorSsid) {
        this.vistorSsid = { ...this.vistorSsid, ..._vistorSsid, guest: 'true' }
      } else {
        this.vistorSsid.enable = 'false'
        this.vistorSsid.ssidName = this.defaultVistorName // 默认访客Wi-Fi名称
        if (this.wireless.ssidList.length >= 8) {
          this.isDisable = true
        }
      }
      if (this.isEhr) {
        // 双频合一增加传入wlanid7的ssidName
        let _vistorSsid2 = this.wireless.ssidList.find(
          ssid => ssid.wlanId === '7'
        )
        if (_vistorSsid2) {
          this.vistorSsid.ssidName5G = _vistorSsid2.ssidName
        }
      }
    }
  },
  methods: {
    // 访客保存
    _onSaveBaseWifi() {
      this.$refs.visitorRef.validForm().then(data => {
        this._postWifiData(data)
      })
    },
    _onToWifiList() {
      this.$router.push({
        name: 'admin/wifi/wifi_setting',
        query: { tab: '2' }
      })
    }
  }
}
</script>
