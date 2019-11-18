<template>
  <div class="wifi-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :max="MAX_NUM"></dev-ssid>
    <!-- WiFi列表 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit vm">
          <span>Wi-Fi列表</span>
        </span>
        <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
        <div class="fr" v-if="editable">
          <el-button @click.native="onAdd" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>新增WIFI</span>
          </el-button>
        </div>
      </div>
      <!-- wifi列表 -->
      <div class="box-content">
        <help-alert :show-icon="false" key="maxNum" title v-if="editable">
          <div slot="content">
            最大支持配置
            <b class="c-warning mlr5">{{MAX_NUM}}</b>个Wi-Fi。
          </div>
        </help-alert>
        <el-table
          :data="wireless.ssidList.filter(ssid=>!!ssid.ssidName).slice(0,Math.min(this.MAX_NUM,wireless.ssidList.length))"
          size="small"
          stripe
        >
          <el-table-column label="Wi-Fi名称" prop="ssidName">
            <template slot-scope="scope">
              <ssid-name-popover
                :indexs="scope.$index"
                :ssid="scope.row.ssidName"
                :ssid-names="ssidNames"
                @submit="onSubmitWifiName($event, scope)"
                v-if="editable && scope.row.enable === 'true'"
              />
              <el-button
                :title="`${wlanIdMap[scope.row.wlanId]}（${scope.row.ssidName}）已关闭`"
                disabled
                type="text"
                v-else-if="scope.row.enable === 'false'"
              >{{scope.row.ssidName}}</el-button>
              <span v-else>{{scope.row.ssidName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="应用频段" prop="relatedRadio">
            <template slot-scope="scope">{{getRadioName(scope.row.relatedRadio)}}</template>
          </el-table-column>
          <el-table-column align="center" label="加密类型" prop="encryptionMode">
            <template slot-scope="scope">{{(scope.row.encryptionMode||'').toUpperCase()}}</template>
          </el-table-column>
          <el-table-column align="center" label="是否隐藏" prop="ishidden">
            <template slot-scope="scope">{{scope.row.ishidden==='true'?'是':'否'}}</template>
          </el-table-column>
          <!-- <el-table-column prop="fowardType" label="转发类型" align="center">
            <template slot-scope="scope">{{scope.row.fowardType==='bridge'?'AP模式(桥接)':'路由模式(NAT)'}}</template>
          </el-table-column>-->
          <el-table-column :formatter="formatVlanId" align="center" label="VLAN ID" prop="vlanId" v-if="showVlan"></el-table-column>
          <!-- <el-table-column prop="enable" label="状态" align="center">
            <template slot-scope="scope">{{scope.row.enable==='true'?'启用':'关闭'}}</template>
          </el-table-column>-->
          <el-table-column align="center" label="操作" v-if="editable">
            <template slot-scope="scope">
              <el-button
                :disabled="scope.row.enable === 'false'"
                :title="scope.row.enable === 'false' && `${wlanIdMap[scope.row.wlanId]}已关闭`"
                type="text"
                v-auth="{fn:onEdit,params:scope.$index}"
              >修改</el-button>
              <el-button
                :disabled="scope.row.wlanId === '1'"
                :title="isDisabled(scope.row) && `${wlanIdMap[scope.row.wlanId]}`"
                type="text"
                v-auth="{fn:onDel,params:[scope.row.id,scope.$index]}"
              >删除</el-button>
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
        <el-button @click="wifiModalShow = false">取 消</el-button>
        <el-button type="primary" v-auth="onModalConfirm">确 定</el-button>
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
        1: '无线网络',
        8: '访客Wi-Fi'
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
      return this.editIndex !== -1 ? '编辑wifi' : '添加wifi'
    },
    // 当前编辑数据
    editData() {
      let _data =
        this.editIndex > -1
          ? this.wireless.ssidList[this.editIndex] || {}
          : { relatedRadio: this.rsMap[0].v }
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
        return this.$message.warning(`最多支持添加 ${this.MAX_NUM} 个Wi-Fi`)
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
    onDel(id, index) {
      this.$confirm('是否确认删除？').then(() => {
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
