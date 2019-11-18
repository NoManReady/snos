<template>
  <div class="switch-list">
    <help-alert title="交换机列表">
      <div slot="content">查看当前网络中的交换机信息。</div>
    </help-alert>
    <help-alert :show-icon="true" title type="warning" v-if="showConflict">
      <p slot="content">
        {{confilctMsg}}
        <a @click="_onEditConflict" class="f-theme fs15" href="javascript:void(0);">点击去处理</a>
      </p>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">交换机列表</span>
      <div class="fr">
        <el-button icon="el-icon-delete" size="small" type="danger" v-auth="_onDelete">批量删除离线设备</el-button>
        <el-button icon="el-icon-place" size="small" type="primary" v-auth="_onPatchUpdate">批量升级设备</el-button>
      </div>
    </div>
    <el-table :data="list" class="has-banner" ref="multipleTable" row-key="ip" size="small" tooltip-effect="dark">
      <el-table-column align="center" fixed="left" width="40">
        <template slot-scope="{row}">
          <div class="banner-wrap">
            <div class="banner" v-if="curSn===row.serialNumber">
              <span>本机</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="left" type="selection" width="25"></el-table-column>
      <el-table-column align="center" fixed="left" label="操作" width="90">
        <template slot-scope="{row,$index}">
          <el-button :disabled="row.status!=='ON'" @click.native="_onEdit(row,$index)" type="text">配置管理</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="设备名称" min-width="120" prop="hostName">
        <template slot-scope="{row}">
          <template v-if="row.status === 'ON'">
            <common-popover
              :rules="_getHostnameRule(row.role==='SWITCH'?23:64)"
              :value="row.hostName"
              @submit="_onHostnameSubmit($event)"
              title="修改设备名称"
            >
              <el-tooltip content="修改设备名称" placement="top">
                <div>
                  <i class="el-icon-loading" v-if="!row.hostName||row.$isLoading"></i>
                  <span @click="_editHostname(row)" class="c-success" v-else>
                    {{row.hostName}}
                    <span class="c-warning" v-if="row.devSN === $store.getters.master.sn">【主】</span>
                    <i class="el-icon-edit" v-show="row.hostName"></i>
                  </span>
                </div>
              </el-tooltip>
            </common-popover>
          </template>
          <template v-else>
            <el-button :disabled="true" class="fs12 btn-word-wrap" type="text">{{ row.hostName }}</el-button>
          </template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="IP地址" prop="ip" width="130">
        <template slot-scope="{row}">
          <template v-if="row.role==='SWITCH'">
            <el-button :disabled="row.status!=='ON'" @click="goToIp(row.ip)" type="text">
              <el-tooltip placement="top">
                <p slot="content">点击前往EWEB配置界面</p>
                <span>{{ row.ip }}</span>
              </el-tooltip>
            </el-button>
          </template>
          <span v-else>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="MAC地址" prop="devMac" width="125"></el-table-column>
      <el-table-column align="center" label="在线状态" prop="status" width="80">
        <template slot-scope="{row}">
          <span :class="row.status === 'ON' ? 'c-success' : 'c-info'">{{ _getStatus(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="型号" prop="deviceType"></el-table-column>
      <el-table-column align="center" label="软件版本" width="300">
        <template slot-scope="scope">
          <el-button :loading="true" type="text" v-if="onGetingVersion"></el-button>
          <div v-else-if="scope.row.hasNewVersion">
            <el-tooltip effect="light" placement="left">
              <div slot="content">
                有新的推荐版本
                <a @click="_onSingleUpdate(scope.row)" class="c-success pointer">{{scope.row.newVersion}}</a>
                ，点击确认升级
              </div>
              <el-button
                :disabled="scope.row.status !== 'ON'"
                @click="_onSingleUpdate(scope.row)"
                class="fs12 btn-word-wrap"
                type="text"
              >
                {{scope.row.software}}
                <i>
                  <sup :class="['new-tip', {'new-tip-disabled': scope.row.status !== 'ON'}]">new</sup>
                </i>
              </el-button>
            </el-tooltip>
          </div>
          <div v-else>{{scope.row.software}}</div>
        </template>
      </el-table-column>
      <el-table-column :sortable="true" align="center" label="序列号" prop="devSN" width="130"></el-table-column>
    </el-table>
    <el-drawer :visible.sync="showDrawer" class="no-header-drawer" size="550px">
      <switch-viewer :item="editItem" v-if="showDrawer" />
    </el-drawer>
    <input class="hidden" ref="inputHidden" />
  </div>
</template>
<script>
import Viewer from './components/Viewer'
import { hostNameValidator, nameLengthValidator } from '@/utils/rules'
import { Drawer } from 'element-ui'
import { popDevDetail } from '@/utils/iframeUtils'
import CommonPopover from '@/common/CommonPopover'
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
    this.$bus.$on('SW_CHANGE', this._swItemChange)
    this._getConflictStatus()
  },
  mounted() {
    window.addEventListener('message', this._owItemChange, false)
  },
  beforeDestroy() {
    this.$bus.$off('SW_CHANGE')
    window.removeEventListener('message', this._owItemChange)
  },
  components: {
    [Drawer.name]: Drawer,
    [Viewer.name]: Viewer,
    [CommonPopover.name]: CommonPopover
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
        { required: true, message: '请输入设备名称', whitespace: true },
        {
          validator: nameLengthValidator,
          max: size,
          message: `设备名称不能超过${size}个字符，中文占3字符`
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
            this.confilctMsg = '发现不属于本网络管理的设备，'
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
          message: '名称修改成功',
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
          this.$alert('可升级版本获取失败，请刷新页面重新获取')
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
        ON: '在线',
        OFF: '离线',
        NEVER_ON: '从未上线'
      }
      return map[status]
    },
    // 编辑交换机
    _onEdit(row, index) {
      if (row.role === 'SWITCH') {
        this.editIndex = index
        this.showDrawer = true
      } else {
        popDevDetail(
          {
            ip: row.ip,
            sn: row.serialNumber
          },
          'switchList',
          row.product
        )
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
        return this.$message.warning('请选择要升级的设备')
      }

      let msgList = []
      selection.forEach(item => {
        if (item.hasNewVersion && item.status === 'ON') {
          msgList.push(this._getMsgList(item))
        }
      })
      if (msgList.length == 0)
        return this.$alert('当前选中的设备已是最新版本或是离线状态，不可升级。')
      this.$confirm(
        `<div>当前选中 <span class="f-theme">${
          selection.length
        }</span> 台设备，其中已是最新版本和处于离线状态的设备有<span class="f-theme">${selection.length -
          msgList.length} </span>台，将不执行升级，是否确认升级 <span class="f-red">${
          msgList.length
        }</span> 台设备？</div>`,
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
      this.$confirm(`是否确认升级到新版本（${row.newVersion}）？`)
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
            message:
              '升级命令已下发，请等待设备后台<strong>静默升级</strong>，<div class="c-warning pt10">请几分钟后刷新页面查看。<div/>',
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
        return this.$message.warning('请选择要删除的设备')
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
        return this.$alert('当前选中的设备均为在线设备，不可删除')
      this.$confirm(
        `<div>当前选中 <span class="f-theme">${
          selection.length
        }</span> 台设备，其中 <span class="f-theme">${selection.length -
          data.snList
            .length} </span>台是在线设备不会删除，将删除 <span class="f-red">${
          data.snList.length
        }</span> 台非在线设备，是否确认删除？</div>`,
        '',
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
      this.$confirm('确认跳转到设备管理界面？')
        .then(() => {
          window.open(['http:', ip].join('//'), '_blank')
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
.switch-list {
  .btn-word-wrap {
    white-space: normal;
    line-height: 23px;
    padding: 0;
  }
  .new-tip {
    color: white;
    width: 50px;
    height: 10px;
    background: $theme;
    -moz-border-radius: 100px/50px;
    -webkit-border-radius: 100px/50px;
    border-radius: 100px/50px;
    padding: 0 5px;
  }
  .new-tip-disabled {
    background: $--color-info;
  }
}
</style>
