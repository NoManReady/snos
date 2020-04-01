<template>
  <div class="master-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :max="MAX_NUM"></dev-ssid>
    <!-- WiFi配置 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          <span class="vm">{{$t('wifi_comm.wifi_net')}}</span>
          <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
        </span>
      </div>
      <div class="box-content">
        <wifi
          :data="masterSsid"
          :disabled="!editable"
          :is-quick="false"
          :rs-map="rsMap"
          :show-guest="true"
          :show-limit-tip="false"
          :ssid-names="ssidNames"
          label-pos="right"
          ref="masterRef"
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
  name: 'WifiMasterTab',
  data() {
    return {
      isMobile: !!ISMOBILE,
      masterSsid: {
        ...wirelessFn(),
        guest: 'false',
        enable: 'true',
        wlanId: '1'
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
      let _masterSsid = this.wireless.ssidList.find(ssid => ssid.wlanId === '1')
      if (_masterSsid) {
        this.masterSsid = { ...this.masterSsid, ..._masterSsid }
      }
      if (this.isEhr) {
        // 双频合一增加传入wlanid2的ssidName
        let _masterSsid2 = this.wireless.ssidList.find(
          ssid => ssid.wlanId === '2'
        )
        if (_masterSsid2) {
          this.masterSsid.ssidName5G = _masterSsid2.ssidName
        }
      }
    }
  },
  methods: {
    // 主人保存
    _onSaveBaseWifi() {
      this.$refs.masterRef.validForm().then(data => {
        this._postWifiData(data)
      })
    }
  }
}
</script>
