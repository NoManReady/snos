<template>
  <div class="device-list">
    <help-alert :json-key="jsonKey" :key="isAp" :title="listTitle">
      <div slot="content">{{ $t("devlist.list_desc", { name: listTitle }) }}{{ this.isAp ? "" : $t("devlist.no_switch") }}</div>
    </help-alert>
    <help-alert :show-icon="true" title type="warning" v-if="!!confilctMsg">
      <p slot="content">
        {{ confilctMsg }}
        <a
          @click="_onEditConflict"
          class="f-theme fs15"
          href="javascript:void(0);"
        >{{ $t("action.click_to_handle") }}</a>
      </p>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">
        {{ listTitle }}
        <small></small>
      </span>
      <div class="fr">
        <template v-if="showGroup">
          <label class="mr10">
            {{ $t("devlist.cur_group_f") }}
            <strong class="c-success">{{ curGroup }}</strong>
          </label>
          <el-button @click.native="expandGroup()" class="mr10" plain size="medium" type="primary">
            <span>{{ expandGroupText }}</span>
          </el-button>
        </template>
        <device-list-popover :isAp="isAp" @oncrated="onCratedListPopover" @search="_onSearch" class="mr10"></device-list-popover>
        <device-batch-operation
          :faterRefs="$refs"
          :isApEmpty="aplist.length === 0"
          :tree="groupTree"
          @delete="_initPage"
          @transfer="_transfer"
          @update="onBatchUpdateDevice"
          v-if="isAp"
        ></device-batch-operation>
      </div>
    </div>
    <el-row>
      <el-col :style="{ width: groupWidth + 'px' }" class="pt15" v-if="showGroup">
        <device-group-tree
          @choose="onGroupChoose"
          @delete="onGroupDelete"
          @edit="onEditGroupName"
          @getGroupTree="getGroupTreeData"
        ></device-group-tree>
      </el-col>
      <el-col :style="{ width: `calc(100% - ${groupWidth}px)` }">
        <el-table :data="pageList" class="has-banner" ref="multipleTable" row-key="mac" stripe>
          <el-table-column align="center" fixed="left" width="40">
            <template slot-scope="{ row }">
              <div class="banner-wrap">
                <div class="banner" v-if="curSn === row.serialNumber">
                  <span>{{ $t("devlist.local") }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="left" type="selection" v-if="isAp" width="25"></el-table-column>
          <el-table-column :label="$t('action.ope')" align="center" fixed="left" width="90">
            <template slot-scope="{ row }">
              <el-button
                :disabled="!_isEditAble(row)"
                @click="_onEdit(row)"
                size="medium"
                type="text"
              >{{ $t("devlist.cfg_manage") }}</el-button>
            </template>
          </el-table-column>
          <el-table-column :label="$t('sysinfo.dev_name')" align="center" min-width="120" prop="hostName" v-if="apProps.hostName">
            <template slot-scope="{ row }">
              <template v-if="row.status === 'ON'">
                <div @click="onEditHostName(row, true)" class="hostname f-theme pointer" v-if="row.serialNumber != editingSn">
                  {{ row.hostName }}
                  <span
                    class="c-warning"
                    v-if="row.serialNumber === $store.getters.master.sn"
                  >[{{ $t("devlist.master") }}]</span>
                  <i class="el-icon-edit fs14 f-theme"></i>
                </div>
                <device-host-name :row="row" @cancel="editingSn = ''" @save="onChangeHostName" v-else></device-host-name>
              </template>
              <template v-else>
                <el-button :disabled="true" class="fs12 btn-word-wrap" size="medium" type="text">{{ row.hostName }}</el-button>
              </template>
            </template>
          </el-table-column>
          <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="ip" v-if="apProps.ip" width="130"></el-table-column>
          <el-table-column :label="$t('sysinfo.mac_addr')" align="center" prop="mac" v-if="apProps.mac" width="138"></el-table-column>
          <el-table-column :label="$t('devlist.online_status')" align="center" prop="status" v-if="apProps.status" width="80">
            <template slot-scope="scope">
              <span :class="scope.row.status === 'ON' ? 'f-theme' : 'c-info'">{{ getStatus(scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('sysinfo.dev_type')" align="center" prop="deviceType" v-if="apProps.deviceType">
            <template slot-scope="{ row }">
              {{ row.deviceType }}
              <span v-if="row.product === 'EGW' && row.forwardMode === 'AC'">（{{ $t("overview.ac_mode") }}）</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('devlist.user_cnt')" align="center" prop="staNum" v-if="apProps.staNum" width="70"></el-table-column>
          <el-table-column :label="$t('sysinfo.soft_version')" align="center" v-if="apProps.update" width="300">
            <template slot-scope="scope">
              <el-button :loading="true" size="medium" type="text" v-if="onGetingVersion"></el-button>
              <div v-else-if="scope.row.hasNewVersion">
                <el-tooltip effect="light" placement="left">
                  <div slot="content">
                    <i18n path="devlist.ver_to_upgrade" tag="span">
                      <a @click="onSingleUpdate(scope.row)" class="c-success pointer">{{ scope.row.newVersion }}</a>
                    </i18n>
                  </div>
                  <el-button
                    :disabled="scope.row.status !== 'ON'"
                    @click="onSingleUpdate(scope.row)"
                    class="fs12"
                    size="medium"
                    type="text"
                  >
                    <el-badge
                      :type="scope.row.status === 'ON' ? 'warning' : 'info'"
                      class="cus-badge"
                      value="new"
                    >{{ scope.row.software }}</el-badge>
                  </el-button>
                </el-tooltip>
              </div>
              <div v-else>{{ scope.row.software }}</div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('sysinfo.sn_num')"
            :sortable="true"
            align="center"
            prop="serialNumber"
            v-if="apProps.serialNumber"
            width="140"
          ></el-table-column>
          <el-table-column
            :label="$t('devlist.group_name')"
            align="center"
            prop="groupName"
            show-overflow-tooltip
            v-if="apProps.groupName"
          ></el-table-column>
          <!-- <el-table-column align="center" v-if="apProps.software" label="软件版本" prop="software"> </el-table-column>-->
          <el-table-column :label="$t('devlist.channel')" align="center" prop="channel" v-if="apProps.channel">
            <template slot-scope="scope">{{ scope.row.channel || "-" }}</template>
            <!-- <template slot-scope="scope">
              <channel-popover v-if="scope.row.channel !== ''" :ap="scope.row" @submit="value=>scope.row.channel=value" />
              <span v-else>-</span>
            </template>-->
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page.sync="pageModel.pageIndex"
          :page-size="pageModel.pageSize"
          :page-sizes="pageModel.pageSizes"
          :total="pageTotal"
          @current-change="onCurrentChange"
          @size-change="_onSizeChange"
          background
          class="mt20"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </el-col>
    </el-row>
    <input class="hidden" ref="inputHidden" />
  </div>
</template>
<script>
import { Badge } from 'element-ui'
import DeviceGroupTree from './components/DeviceGroupTree'
import DeviceListPopover from './components/DeviceListPopover'
import DeviceHostName from './components/DeviceHostName'
import DeviceBatchOperation from './components/DeviceBatchOperation'
import pageMixins from '@/mixins/pageMixins'
import { popDevDetail, isNewVersion } from '@/utils/iframeUtils'
// import { loadNetworkNeighbor } from '@/utils'
import bus from '@/utils/bus'
export default {
  name: 'DeviceList',
  data() {
    return {
      confilctMsg: false,
      aplist: [],
      onGetingVersion: true,
      mapData: {},
      editingSn: '',
      // query、apProps 组件DeviceListPopover提供
      query: {},
      apProps: {},
      // groupTree 组件DeviceGroupTree提供
      groupTree: {},
      groupWidth: 0,
      expandGroupText: I18N.t('devlist.open_group'),
      curGroup: I18N.t('devlist.all_group')
    }
  },
  computed: {
    isAp() {
      return true // this.$route.meta.t === 'wifi_ap'
    },
    listTitle() {
      return this.isAp ? I18N.t('devlist.aplist') : I18N.t('devlist.devlist')
    },
    jsonKey() {
      return this.isAp ? 'apListJson' : 'deviceListJson'
    },
    curSn() {
      return (window.top.APP_SYSINFO || this.$store.getters.sysinfo).serial_num
    },
    isEhr() {
      return this.$roles().includes('ehr')
    },
    showGroup() {
      return this.isAp && !this.isEhr
    }
  },
  mixins: [pageMixins],
  components: {
    DeviceGroupTree,
    DeviceListPopover,
    DeviceBatchOperation,
    DeviceHostName,
    [Badge.name]: Badge
  },
  mounted() {
    setTimeout(() => {
      this._getConflictStatus()
    }, 1000)
    window.addEventListener('message', this._owItemChange, false)
  },
  beforeDestroy() {
    window.removeEventListener('message', this._owItemChange)
  },
  methods: {
    // ow修改名称检测
    _owItemChange(e) {
      if (e.data && e.data.type === 'ewebHostname') {
        let _item = this.pageList.find(lis => lis.serialNumber === e.data.sn)
        if (_item) {
          this.$set(_item, 'hostName', e.data.value)
        }
      }
    },
    async _loadList() {
      let query = { ...this.query }
      Object.keys(query).forEach(key => {
        !query[key] && delete query[key]
      })
      let _res = await this.$api.getAplist(query)
      this.aplist = ((_res && _res.list) || []).filter(
        o => ['AC', 'AP'].includes(o.forwardMode) || o.product == 'EAP'
      )
      if (this.aplist.length) {
        this.onCheckVersion()
      }
      return this.aplist
    },
    _onSearch(jquery) {
      this.query = { ...jquery }
      this._initPage()
    },
    _transfer() {
      this._initPage()
      setTimeout(() => {
        this._initPage()
      }, 2000)
    },
    _onEdit(row) {
      if (!isNewVersion(row.software) && this.curSn !== row.serialNumber) {
        return this.$confirm(
          I18N.t('devlist.dev_warn_tip'),
          I18N.t('devlist.dev_warn'),
          {
            showClose: false,
            cancelButtonText: I18N.t('devlist.no_see'),
            confirmButtonText: I18N.t('devlist.to_see')
          }
        ).then(
          _ => {
            window.open(`http://${row.ip}`, '_blank')
          },
          _ => {}
        )
      }
      popDevDetail(row, 'ApList')
    },
    _isEditAble(row) {
      return row.status === 'ON'
    },
    // 判断是否冲突
    async _getConflictStatus() {
      if (this.$roles().includes('master')) {
        // loadNetworkNeighbor()
        let d = await this.$api.cmd('devSta.get', {
          module: 'conflict_status'
        })
        if (d.conflict_status === true) {
          this.confilctMsg = I18N.t('devlist.found_diff_dev')
        }
      }
    },
    // 跳转编辑冲突页
    _onEditConflict() {
      this.$router.push({ name: 'admin/network_neighbor' })
    },
    handleAplist() {
      this.aplist = this.aplist.map(item => {
        let key = [item.deviceType, item.software, item.hardware].join('&')
        let mapData = this.mapData[key]
        if (mapData && mapData.versionCode != item.software) {
          item.newVersion = mapData.versionCode
          item.md5 = mapData.md5
          item.downloadUrlTar = mapData.downloadUrlTar
          item.fileSize = mapData.fileSize
          item.fileName = mapData.fileName
          item.hasNewVersion = true
        }
        return item
      })
    },
    onCheckVersion() {
      if (!this.onGetingVersion) return this.handleAplist()

      this.$api
        .getVersion({ deviceType: 'bottom' })
        .then(verData => {
          if (verData.new && verData.new.totalCount > 0) {
            this.getMapData(verData.new.firmwareList)
            this.handleAplist()
          }
          this.onGetingVersion = false
        })
        .catch(() => {
          this.$alert(I18N.t('devlist.enable_dev_fail'))
        })
    },
    onBatchUpdateDevice(data) {
      this.onUpdateAplist(data)
    },
    onSingleUpdate(row) {
      this.$confirm(
        I18N.t('devlist.upgrade_confirm', { version: row.newVersion })
      )
        .then(() => {
          let data = {
            msgList: [
              {
                deviceSn: row.serialNumber,
                devType: row.deviceType,
                devHversion: row.hardware,
                devSversion: row.software,
                downloadUrlTar: row.downloadUrlTar,
                fileSize: row.fileSize,
                fileName: row.fileName,
                md5: row.md5
              }
            ],
            totalCount: 1
          }
          this.onUpdateAplist(data)
          this._hideToolTip()
        })
        .catch(() => {
          this._hideToolTip()
        })
    },
    _hideToolTip() {
      this.$nextTick(() => {
        this.$refs.inputHidden.focus()
      })
    },
    onUpdateAplist(param) {
      this.$api
        .wireless('updateVersion', {
          jsonparam: JSON.stringify(param)
        })
        .then(data => {
          this.$message.success({
            dangerouslyUseHTMLString: true,
            message: I18N.t('devlist.upgrade_tip'),
            duration: 8000
          })
          this._initPage()
        })
        .catch(e => {})
    },
    getMapData(data = []) {
      data.forEach(item => {
        let key = [item.devType, item.devSversion, item.devHversion].join('&')
        this.mapData[key] = item
      })
    },
    getStatus(status) {
      let map = {
        ON: I18N.t('devlist.online'),
        OFF: I18N.t('devlist.offline'),
        NEVER_ON: I18N.t('devlist.never_online')
      }
      return map[status]
    },
    getHostName(row) {
      return row.hostName || '-'
    },
    onCratedListPopover(data) {
      this.apProps = data.props
      this.query = data.query
    },
    expandGroup() {
      let isExpanded = this.groupWidth > 0
      this.groupWidth = isExpanded ? 0 : 200
      this.expandGroupText = isExpanded
        ? I18N.t('devlist.open_group')
        : I18N.t('devlist.close_group')
    },
    onChangeHostName(row, data) {
      this.$api.setHostName(data).then(d => {
        row.hostName = data.name
        this.editingSn = ''
        // 修改当前登录设备名称
        if (row.serialNumber === this.curSn) {
          window.top.postMessage({ value: data.name, type: 'ewebHostname' })
        }
      })
    },
    onEditHostName(row, isFocus) {
      this.editingSn = row.serialNumber
    },
    // 分组展示/操作
    getGroupTreeData(groupTree) {
      this.groupTree = groupTree
    },
    onGroupChoose(data) {
      if (!this.isOprateCurGroup(data.groupId)) {
        this.clearQuery()
        this.query.groupId = data.groupId
        this.curGroup =
          data.isDefault === 'true'
            ? I18N.t('devlist.def_group')
            : data.groupName || I18N.t('devlist.all_group')
        this._initPage()
      }
    },
    onEditGroupName(data) {
      if (this.isOprateCurGroup(data.groupId)) {
        this.curGroup =
          data.isDefault === 'true'
            ? I18N.t('devlist.def_group')
            : data.groupName
      }
      this._initPage()
    },
    onGroupDelete(data) {
      if (this.isOprateCurGroup(data.groupId)) {
        this.clearQuery()
        this.query.groupId = ''
        this.curGroup = I18N.t('devlist.all_group')
      }
      this._initPage()
    },
    isOprateCurGroup(id) {
      return this.query.groupId === id
    },
    clearQuery() {
      Object.keys(this.query).forEach(key => (this.query[key] = ''))
    }
  }
}
</script>
<style lang="scss">
.cus-badge sup {
  line-height: 14px;
  right: 5px !important;
}
</style>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.device-list {
  .btn-word-wrap {
    white-space: normal;
    line-height: 23px;
    padding: 0;
  }
  .hostname:hover > .el-icon-edit {
    display: inline;
  }
  .el-icon-edit {
    display: none;
  }
  .hidden {
    width: 0;
    height: 0;
    opacity: 0;
  }
}
</style>
