<template>
  <div class="master-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :max="MAX_NUM" :is-dev-group="wireless.existIndepend === 'true'"></dev-ssid>
    <!-- WiFi配置 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit vm">
          <span>无线网络</span>
        </span>
        <dev-group
          @change-group="changeGroup"
          :exist-independ="wireless.existIndepend === 'true'"
          v-if="!hideGroup"
        ></dev-group>
      </div>
      <div class="box-content w500">
        <wifi
          ref="masterRef"
          :disabled="!editable"
          :data="masterSsid"
          :show-limit-tip="false"
          :ssid-names="ssidNames"
          :rs-map="rsMap"
          label-pos="right"
          :is-quick="false"
          :show-guest="true"
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
  name: 'WifiMasterTab',
  data() {
    return {
      masterSsid: { ...wirelessFn(), guest: 'false', enable: 'true', wlanId: '1' }
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
      let _masterSsid = this.wireless.ssidList.find(
        ssid => ssid.wlanId === '1'
      )
      if (_masterSsid) {
        this.masterSsid = {...this.masterSsid, ..._masterSsid}
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
