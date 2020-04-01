<template>
  <div class="wifi-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :max="MAX_NUM"></dev-ssid>
    <!-- WiFi列表 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          <span class="vm">{{$t('wifi_comm.wifi_list')}}</span>
          <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
        </span>
        <div class="fr" v-if="editable">
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="onAdd">{{$t('action.add')}}</el-button>
        </div>
      </div>
      <!-- wifi列表 -->
      <div class="box-content">
        <help-alert :show-icon="false" key="maxNum" title v-if="editable">
          <div slot="content">
            <i18n path="wifi_comm.wifi_cnt_limit" tag="span">
              <b class="c-warning mlr5" place="max">{{MAX_NUM}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table
          :data="wireless.ssidList.slice(0,Math.min(this.MAX_NUM,wireless.ssidList.length)).filter(ssid => ssid.wlanId < 9 && !!ssid.ssidName)"
          size="medium"
          stripe
        >
          <el-table-column :label="$t('quickmacc.wifi_name')" prop="ssidName">
            <template slot-scope="scope">
              <ssid-name-popover
                :indexs="scope.$index"
                :ssid="scope.row.ssidName"
                :ssid-names="ssidNames"
                @submit="onSubmitWifiName($event, scope)"
                v-if="editable && scope.row.enable === 'true'"
              />
              <el-button
                :title="`${wlanIdMap[scope.row.wlanId]}${$t('wifi_comm.ssid_has_close',{ssid:scope.row.ssidName})}`"
                disabled
                type="text"
                v-else-if="scope.row.enable === 'false'"
              >{{scope.row.ssidName}}</el-button>
              <span v-else>{{scope.row.ssidName}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('wifi_comm.apply_radio')" align="center" prop="relatedRadio">
            <template slot-scope="scope">{{getRadioName(scope.row.relatedRadio)}}</template>
          </el-table-column>
          <el-table-column :label="$t('wifi_comm.encry_type')" align="center" prop="encryptionMode">
            <template slot-scope="scope">{{(scope.row.encryptionMode||'').toUpperCase()}}</template>
          </el-table-column>
          <el-table-column :label="$t('wifi_comm.is_hidden')" align="center" prop="ishidden">
            <template slot-scope="scope">{{scope.row.ishidden==='true'?$t('phrase.yes'):$t('phrase.no')}}</template>
          </el-table-column>
          <!-- <el-table-column prop="fowardType" label="转发类型" align="center">
            <template slot-scope="scope">{{scope.row.fowardType==='bridge'?'AP模式(桥接)':'路由模式(NAT)'}}</template>
          </el-table-column>-->
          <el-table-column :formatter="formatVlanId" align="center" label="VLAN ID" prop="vlanId" v-if="showVlan"></el-table-column>
          <!-- <el-table-column prop="enable" label="状态" align="center">
            <template slot-scope="scope">{{scope.row.enable==='true'?'启用':'关闭'}}</template>
          </el-table-column>-->
          <el-table-column :label="$t('action.ope')" align="center" v-if="editable">
            <template slot-scope="scope">
              <el-button
                :disabled="scope.row.enable === 'false'"
                :title="scope.row.enable === 'false' && $t('wifi_comm.ssid_has_close',{ssid:wlanIdMap[scope.row.wlanId]})"
                type="text"
                v-auth="{fn:onEdit,params:scope.$index}"
              >{{$t('action.edit')}}</el-button>
              <el-button
                :disabled="scope.row.wlanId === '1'"
                :title="isDisabled(scope.row) && `${wlanIdMap[scope.row.wlanId]}`"
                type="text"
                v-auth="{fn:onDel,params:scope.$index}"
              >{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- wifi编辑 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="modalTitle"
      :visible.sync="wifiModalShow"
      @close="editIndex = -2"
      v-if="editable"
      width="570px"
    >
      <wifi
        :data="editData"
        :disabled="!editable"
        :is-quick="false"
        :rs-map="rsMap"
        :show-guest="editData.wlanId !== '8'"
        :ssid-names="ssidNames"
        label-pos="right"
        ref="wifiRef"
      ></wifi>
      <span class="dialog-footer" slot="footer">
        <el-button @click="wifiModalShow = false" plain size="medium">{{$t('action.cancel')}}</el-button>
        <el-button size="medium" type="primary" v-auth="onModalConfirm">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Wifi from './Wifi'
import SsidNamePopover from './SsidNamePopover'
import wifiMixins from './wifiMixins'
import DevSsid from './DevSsid'
import DevGroup from './DevGroup'
export default {
  name: 'WifiTab',
  data() {
    return {
      wlanIdMap: {
        1: I18N.t('wifi_comm.wifi_net'),
        8: I18N.t('wifi_comm.wifi_guest')
      },
      wifiModalShow: false,
      editIndex: -1
    }
  },
  components: {
    Wifi,
    SsidNamePopover,
    [DevSsid.name]: DevSsid,
    [DevGroup.name]: DevGroup
  },
  computed: {
    showVlan() {
      return (
        this.$roles().includes('master') ||
        this.$store.getters.devMode.forwardMode !== 'ROUTER'
      )
    },
    modalTitle() {
      return this.editIndex !== -1
        ? I18N.t('action.edit')
        : I18N.t('action.add')
    },
    // 当前编辑数据
    editData() {
      let _data =
        this.editIndex > -1
          ? this.wireless.ssidList[this.editIndex] || {}
          : { relatedRadio: this.rsMap[0].v, wlanId: this._generatorWlanid() }
      return _data
    }
  },
  mixins: [wifiMixins],
  methods: {
    isDisabled(ssid) {
      return Object.keys(this.wlanIdMap).includes(ssid.wlanId)
    },
    // 添加
    onAdd() {
      if (this.wireless.ssidList.length >= this.MAX_NUM) {
        return this.$message.warning(
          I18N.t('wifi_comm.wifi_cnt_limit', { max: this.MAX_NUM })
        )
      }
      this.editIndex = -1
      this.wifiModalShow = true
    },
    // 修改
    onEdit(index) {
      this.editIndex = index
      this.wifiModalShow = true
    },
    // 删除
    onDel(index) {
      this.$confirm(I18N.t('tip.confirm_delete')).then(() => {
        this.wireless.ssidList.splice(index, 1)
        this._postWifiData()
      })
    },
    // 提交wifi
    onModalConfirm() {
      this.$refs.wifiRef.validForm().then(wifi => {
        this._postWifiData(wifi)
        this.wifiModalShow = false
      })
    },
    onSubmitWifiName(value, scope) {
      scope.row.ssidName = value
      this._postWifiData()
    }
  }
}
</script>
