<template>
  <div class="visitor-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :max="MAX_NUM"></dev-ssid>
    <!-- WiFi配置 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit vm">
          <span>访客Wi-Fi</span>
        </span>
        <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
      </div>
      <div class="box-content w500">
        <el-form label-width="160px">
          <el-form-item label="是否开启">
            <el-switch :disabled="!editable || isDisable" active-value="true" inactive-value="false" v-model="vistorSsid.enable"></el-switch>
            <span v-if="isDisable">
              Wi-Fi已达{{MAX_NUM}}个，请先删除一个
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
        <el-form class="mt20" label-width="160px" v-if="editable">
          <el-form-item>
            <el-button class="w200" type="primary" v-auth="_onSaveBaseWifi">保 存</el-button>
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
