<template>
  <div class="switch-list">
    <help-alert :title="$t('devlist.switch_list')">
      <div slot="content">{{ $t("devlist.switch_list_tip") }}</div>
    </help-alert>
    <help-alert :show-icon="true" title type="warning" v-if="showConflict">
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
      <span class="box-header-tit">{{ $t("devlist.switch_list") }}</span>
      <div class="fr">
        <el-button
          icon="el-icon-delete"
          plain
          size="medium"
          type="primary"
          v-auth="_onDelete"
        >{{ $t("devlist.patch_del_off_dev") }}</el-button>
        <el-button plain size="medium" type="primary" v-auth="_onPatchUpdate">
          {{
          $t("devlist.patch_upgrade_dev")
          }}
        </el-button>
      </div>
    </div>
    <el-table :data="list" class="has-banner" ref="multipleTable" row-key="ip" size="medium" stripe>
      <el-table-column align="center" fixed="left" width="40">
        <template slot-scope="{ row }">
          <div class="banner-wrap">
            <div class="banner" v-if="curSn === row.serialNumber">
              <span>{{ $t("devlist.local") }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="left" type="selection" width="25"></el-table-column>
      <el-table-column :label="$t('action.ope')" align="center" fixed="left" width="90">
        <template slot-scope="{ row, $index }">
          <el-button
            :disabled="row.status !== 'ON'"
            @click.native="_onEdit(row, $index)"
            size="medium"
            type="text"
          >{{ $t("devlist.cfg_manage") }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('sysinfo.dev_name')" align="center" min-width="120" prop="hostName">
        <template slot-scope="{ row }">
          <template v-if="row.status === 'ON'">
            <common-popover
              :rules="_getHostnameRule(row.role === 'SWITCH' ? 23 : 64)"
              :title="$t('sysinfo.dev_name_modify')"
              :value="row.hostName"
              @submit="_onHostnameSubmit($event)"
            >
              <el-tooltip :content="$t('sysinfo.dev_name_modify')" placement="top">
                <div>
                  <i class="el-icon-loading" v-if="!row.hostName || row.$isLoading"></i>
                  <label @click="_editHostname(row)" class="c-success break-word" v-else>
                    {{ row.hostName }}
                    <span
                      class="c-warning"
                      v-if="row.devSN === $store.getters.master.sn"
                    >[{{ $t("devlist.master") }}]</span>
                    <i class="el-icon-edit" v-show="row.hostName"></i>
                  </label>
                </div>
              </el-tooltip>
            </common-popover>
          </template>
          <template v-else>
            <el-button :disabled="true" class="fs12 btn-word-wrap" size="medium" type="text">{{ row.hostName }}</el-button>
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="ip" width="135">
        <template slot-scope="{ row }">
          <template v-if="row.role === 'SWITCH'">
            <el-button :disabled="row.status !== 'ON'" @click="goToIp(row.ip)" size="medium" type="text">
              <el-tooltip placement="top">
                <p slot="content">{{ $t("devlist.go_eweb") }}</p>
                <span>{{ row.ip }}</span>
              </el-tooltip>
            </el-button>
          </template>
          <span v-else>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('sysinfo.mac_addr')" align="center" prop="devMac" width="138"></el-table-column>
      <el-table-column :label="$t('devlist.online_status')" align="center" prop="status" width="80">
        <template slot-scope="{ row }">
          <span :class="row.status === 'ON' ? 'c-success' : 'c-info'">
            {{
            _getStatus(row.status)
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('sysinfo.dev_type')" align="center" prop="deviceType"></el-table-column>
      <el-table-column :label="$t('sysinfo.soft_version')" align="center" width="300">
        <template slot-scope="scope">
          <el-button :loading="true" size="medium" type="text" v-if="onGetingVersion"></el-button>
          <div v-else-if="scope.row.hasNewVersion">
            <el-tooltip effect="light" placement="left">
              <div slot="content">
                <i18n path="devlist.ver_to_upgrade" tag="span">
                  <a @click="_onSingleUpdate(scope.row)" class="c-success pointer">{{ scope.row.newVersion }}</a>
                </i18n>
              </div>
              <el-button
                :disabled="scope.row.status !== 'ON'"
                @click="_onSingleUpdate(scope.row)"
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
      <el-table-column :label="$t('devlist.sn')" :sortable="true" align="center" prop="devSN" width="140"></el-table-column>
    </el-table>
    <el-drawer :visible.sync="showDrawer" class="no-header-drawer" size="650px">
      <switch-viewer :item="editItem" v-if="showDrawer" />
    </el-drawer>
    <input class="hidden" ref="inputHidden" />
  </div>
</template>
<script>
import { Badge } from 'element-ui'
import Viewer from './components/Viewer'
import { hostNameValidator, nameLengthValidator } from '@/utils/rules'
import { Drawer } from 'element-ui'
import { popDevDetail } from '@/utils/iframeUtils'
import CommonPopover from '@/common/CommonPopover'
import { getMaccVersion } from '@/api/maccApi'
export default {
  name: 'SwitchList',
  data() {
    return {
      confilctMsg: false,
      list: [],
      onGetingVersion: true,
      showDrawer: false,
      editIndex: -1,
      deviceInfo: null,
      mapData: {},
      hostname: '',
      editHostnameItem: null
    }
  },
  computed: {
    showConflict() {
      return !!this.confilctMsg
    },
    editItem() {
      if (this.editIndex !== -1) {
        return this.list[this.editIndex]
      } else {
        return null
      }
    },
    curSn() {
      return (window.top.APP_SYSINFO || this.$store.getters.sysinfo).serial_num
    }
  },
  async created() {
    try {
      await this._loadNeighber()
    } catch (error) {}
    this._getConflictStatus()
  },
  mounted() {
    window.addEventListener('message', this._owItemChange, false)
  },
  beforeDestroy() {
    window.removeEventListener('message', this._owItemChange)
  },
  components: {
    [Drawer.name]: Drawer,
    [Viewer.name]: Viewer,
    [CommonPopover.name]: CommonPopover,
    [Badge.name]: Badge
  },
  methods: {
    // ow修改名称检测
    _owItemChange(e) {
      if (e.data && e.data.type === 'ewebHostname') {
        let _item = this.list.find(lis => lis.devSN === e.data.sn)
        if (_item) {
          this.$set(_item, 'hostName', e.data.value)
        }
      }
    },
    // 弱网管修改检测事件
    _swItemChange({ data }) {
      this.list.splice(this.editIndex, 1, data)
    },
    // hostname修改规则
    _getHostnameRule(size = 64) {
      return [
        {
          required: true,
          message: I18N.t('overview.hostname_no_empty'),
          whitespace: true
        },
        {
          validator: nameLengthValidator,
          max: size,
          message: I18N.t('devlist.hostname_len_rule', { len: size })
        },
        { validator: hostNameValidator }
      ]
    },
    _editHostname(row) {
      this.editHostnameItem = row || {}
    },
    // 判断是否冲突
    async _getConflictStatus() {
      if (this.$roles().includes('master')) {
        try {
          let d = await this.$api.cmd(
            'devSta.get',
            {
              module: 'conflict_status'
            },
            { isSilence: true }
          )
          if (d.conflict_status === true) {
            this.confilctMsg = I18N.t('devlist.found_diff_dev')
          }
        } catch (error) {}
      }
    },
    // 加载邻居
    async _loadNeighber() {
      let _aplist = await this.$api.getAplist({ productType: 'MSW' })
      let d = await this.$api.getNetworkNeighbor(false, ['esw'])
      let _list = d.neighbor
        .filter(nei => d.curNetwork.networkId === nei.networkId)
        .map(lis => {
          return {
            ...lis,
            status: 'ON'
          }
        })
      // _list.forEach(esw => this._getEswLastestVersion(esw))
      if (_aplist.code == '0') {
        _list.push(
          ..._aplist.list.map(lis => {
            return {
              ...lis,
              devMac: lis.mac,
              devSN: lis.serialNumber
            }
          })
        )
      }
      this.list = _list
      // 加载可升级版本
      if (_list.length) {
        this.onMatchVersion()
      }
    },
    // esw获取最新版本
    async _getEswLastestVersion(item) {
      await this._getMd5Key(item)
    },
    // 获取MD5-key
    async _getMd5Key(item) {
      let ts = new Date().getTime()
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: item.ip,
            sn: item.devSN,
            method: 'get',
            url: `get_md5_key.cgi?ts=${ts}`
          },
          { isSilence: true }
        )
        await this._getNewestVersion(item, _result)
      } catch (error) {}
    },
    // 获取云端最新版本号
    async _getNewestVersion(item, verSess) {
      let _res = await getMaccVersion(verSess)
      _res = _res.data
      if (_res.code === 0) {
        let _lis = _res.firmwareList
        let _cur_v = verSess.reqList[0].software
        _lis = (_lis || []).filter(l => l.versionCode !== _cur_v)
        if (_lis && _lis[0]) {
          let key = [item.deviceType, item.software, item.hardware].join('&')
          item.newVersion = _lis[0]
          this.mapData[key] = item
        }
      }
    },
    // 处理列表数据
    _handleNeighborList() {
      this.list = this.list.map(item => {
        if (item.role === 'SWITCH') {
          return item
        }
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
    async _onHostnameSubmit(hostname) {
      let _promise = null
      this.$set(this.editHostnameItem, '$isLoading', true)
      try {
        if (this.editHostnameItem.role === 'SWITCH') {
          await this.$api.switchApi(
            'doSwitchApi',
            {
              ip: this.editHostnameItem.ip,
              sn: this.editHostnameItem.devSN,
              method: 'post',
              data: {
                hostname: hostname
              },
              url: 'set_hostname.cgi'
            },
            { isSilence: true }
          )
        } else {
          await this.$api.setHostName({
            name: hostname,
            sn: [this.editHostnameItem.devSN]
          })
        }
        this.editHostnameItem.hostName = hostname
        this.editingSn = ''
        this.$message({
          message: I18N.t('tip.edit_success'),
          type: 'success'
        })
      } catch (error) {}
      this.$set(this.editHostnameItem, '$isLoading', false)
    },
    // 判断可升级版本
    onMatchVersion() {
      if (!this.onGetingVersion) return this._handleNeighborList()
      this.$api
        .getVersion({ deviceType: 'bottom' })
        .then(verData => {
          if (verData.new && verData.new.totalCount > 0) {
            this._getMapData(verData.new.firmwareList)
            this._handleNeighborList()
          }
          this.onGetingVersion = false
        })
        .catch(() => {
          this.$alert(I18N.t('devlist.enable_dev_fail'))
        })
    },
    // 保存版本映射map
    _getMapData(data = []) {
      data.forEach(item => {
        let key = [item.devType, item.devSversion, item.devHversion].join('&')
        this.mapData[key] = item
      })
    },
    // 设备状态
    _getStatus(status) {
      let map = {
        ON: I18N.t('devlist.online'),
        OFF: I18N.t('devlist.offline'),
        NEVER_ON: I18N.t('devlist.never_online')
      }
      return map[status]
    },
    // 编辑交换机
    _onEdit(row, index) {
      if (row.role === 'SWITCH') {
        this.editIndex = index
        this.showDrawer = true
      } else {
        popDevDetail(row, 'SwitchList')
      }
    },
    // 获取升级数据
    _getMsgList(msgListData) {
      return {
        deviceSn: msgListData.serialNumber,
        devType: msgListData.deviceType,
        devHversion: msgListData.hardware,
        devSversion: msgListData.software,
        downloadUrlTar: msgListData.downloadUrlTar,
        fileSize: msgListData.fileSize,
        fileName: msgListData.fileName,
        md5: msgListData.md5
      }
    },
    // 批量升级数据准备
    _onPatchUpdate() {
      let selection = this.$refs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning(I18N.t('devlist.dev_upgrade_no_empty'))
      }

      let msgList = []
      selection.forEach(item => {
        if (item.hasNewVersion && item.status === 'ON') {
          msgList.push(this._getMsgList(item))
        }
      })
      if (msgList.length == 0) return this.$alert(I18N.t('devlist.upgrade_tip'))
      this.$confirm(
        I18N.t('devlist.upgrade_confirm_tip', {
          cnt: selection.length,
          off_cnt: selection.length - msgList.length,
          on_cnt: msgList.length
        }),
        '',
        {
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        this._onBatchUpdateDevice({
          msgList: msgList,
          totalCount: msgList.length
        })
      })
    },
    // 批量升级
    _onBatchUpdateDevice(data) {
      this.onUpdateList(data)
    },
    // 单台升级
    _onSingleUpdate(row) {
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
          this.onUpdateList(data)
          this._hideToolTip()
        })
        .catch(() => {
          this._hideToolTip()
        })
    },
    // hack methods
    _hideToolTip() {
      this.$nextTick(() => {
        this.$refs.inputHidden.focus()
      })
    },
    // 下发升级命令
    onUpdateList(param) {
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
          this._loadNeighber()
        })
        .catch(e => {})
    },
    // 删除离线设备
    _onDelete() {
      let selection = this.$refs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning(I18N.t('devlist.delete_dev_item'))
      }

      let data = { snList: [] }
      let deleteSelection = []
      selection.forEach(item => {
        if (item.status != 'ON') {
          data.snList.push(item.serialNumber)
          deleteSelection.push(item)
        }
      })
      if (!data.snList.length)
        return this.$alert(I18N.t('devlist.online_dev_tip'))
      this.$confirm(
        I18N.t('devlist.delete_confirm_tip', {
          cnt: selection.length,
          off_cnt: data.snList.length,
          on_cnt: selection.length - data.snList.length
        }),
        {
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        // 删除设备
        this.$api.deleteDevice(data).then(() => {
          this._loadNeighber()
        })
      })
    },
    // 跳转编辑冲突页
    _onEditConflict() {
      this.$router.push({
        name: 'admin/network_neighbor'
      })
    },
    goToIp(ip) {
      this.$confirm(I18N.t('devlist.go_eweb'))
        .then(() => {
          window.open(['http:', ip].join('//'), '_blank')
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss">
.switch-list {
  .cus-badge sup {
    line-height: 14px;
    right: 5px !important;
  }
}
</style>
<style lang="scss" scoped>
.switch-list {
  .btn-word-wrap {
    white-space: normal;
    line-height: 23px;
    padding: 0;
  }
}
</style>
