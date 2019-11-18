<template>
  <div class="device-list">
    <help-alert :json-key="jsonKey" :key="isAp" :title="listTitle">
      <div slot="content">查看网络中的{{listTitle}}信息{{this.isAp ?"":"(不包含交换机设备)"}}。</div>
    </help-alert>
    <help-alert :show-icon="true" title type="warning" v-if="!!confilctMsg">
      <p slot="content">
        {{confilctMsg}}
        <a @click="_onEditConflict" class="f-theme fs15" href="javascript:void(0);">点击去处理</a>
      </p>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">
        {{listTitle}}
        <small></small>
      </span>
      <div class="fr">
        <template v-if="isAp">
          <label class="mr10">
            当前分组：
            <strong class="c-success">{{ curGroup }}</strong>
          </label>
          <el-button @click.native="expandGroup()" class="mr10" plain size="small" type="primary">
            <span>{{ expandGroupText }}</span>
          </el-button>
        </template>
        <device-list-popover :isAp="isAp" @oncrated="onCratedListPopover" @search="onCurrentChange(1)" class="mr10"></device-list-popover>
        <device-batch-operation
          :faterRefs="$refs"
          :isApEmpty="aplist.list.length == 0"
          :tree="groupTree"
          @delete="_initPage()"
          @transfer="_transfer"
          @update="onBatchUpdateDevice"
          v-if="isAp"
        ></device-batch-operation>
      </div>
    </div>
    <el-row>
      <el-col :style="{width:groupWidth + 'px'}" class="pt15" v-if="isAp">
        <device-group-tree
          @choose="onGroupChoose"
          @delete="onGroupDelete"
          @edit="onEditGroupName"
          @getGroupTree="getGroupTreeData"
        ></device-group-tree>
      </el-col>
      <el-col :style="{width:`calc(100% - ${groupWidth}px)`}">
        <el-table :data="pageList" class="has-banner" ref="multipleTable" row-key="mac" size="small">
          <el-table-column align="center" fixed="left" width="40">
            <template slot-scope="{row}">
              <div class="banner-wrap">
                <div class="banner" v-if="curSn===row.serialNumber">
                  <span>本机</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="left" type="selection" v-if="isAp" width="25"></el-table-column>
          <el-table-column align="center" fixed="left" label="操作" width="90">
            <template slot-scope="{row}">
              <el-button :disabled="!_isEditAble(row)" @click="_onEdit(row)" type="text">配置管理</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" label="设备名称" min-width="120" prop="hostName" v-if="apProps.hostName">
            <template slot-scope="{row}">
              <template v-if="row.status === 'ON'">
                <div @click="onEditHostName(row,true)" class="hostname f-theme pointer" v-if="row.serialNumber != editingSn">
                  {{row.hostName}}
                  <span class="c-warning" v-if="row.serialNumber === $store.getters.master.sn">【主】</span>
                  <i class="el-icon-edit fs14 f-theme"></i>
                </div>
                <device-host-name :row="row" @cancel="editingSn=''" @save="onChangeHostName" v-else></device-host-name>
              </template>
              <template v-else>
                <el-button :disabled="true" class="fs12 btn-word-wrap" type="text">{{ row.hostName }}</el-button>
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="IP地址" prop="ip" v-if="apProps.ip" width="120"></el-table-column>
          <el-table-column align="center" label="MAC地址" prop="mac" v-if="apProps.mac" width="125"></el-table-column>
          <el-table-column align="center" label="在线状态" prop="status" v-if="apProps.status" width="80">
            <template slot-scope="scope">
              <span :class="scope.row.status === 'ON' ? 'f-theme' : 'c-info'">{{ getStatus(scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="型号" prop="deviceType" v-if="apProps.deviceType"></el-table-column>
          <el-table-column align="center" label="用户数" prop="staNum" v-if="apProps.staNum" width="60"></el-table-column>
          <el-table-column align="center" label="软件版本" v-if="apProps.update" width="280">
            <template slot-scope="scope">
              <el-button :loading="true" type="text" v-if="onGetingVersion"></el-button>
              <div v-else-if="scope.row.hasNewVersion">
                <el-tooltip effect="light" placement="left">
                  <div slot="content">
                    有新的推荐版本
                    <a @click="onSingleUpdate(scope.row)" class="c-success pointer">{{scope.row.newVersion}}</a>
                    ，点击确认升级
                  </div>
                  <el-button
                    :disabled="scope.row.status !== 'ON'"
                    @click="onSingleUpdate(scope.row)"
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
          <el-table-column
            :sortable="true"
            align="center"
            label="序列号"
            prop="serialNumber"
            v-if="apProps.serialNumber"
            width="130"
          ></el-table-column>
          <el-table-column align="center" label="分组名称" prop="groupName" show-overflow-tooltip v-if="apProps.groupName"></el-table-column>
          <!-- <el-table-column align="center" v-if="apProps.software" label="软件版本" prop="software"> </el-table-column>-->
          <el-table-column align="center" label="信道" prop="channel" v-if="apProps.channel">
            <template slot-scope="scope">{{ scope.row.channel || '-'}}</template>
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
          :total="pageModel.pageTotal"
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
import DeviceGroupTree from './components/DeviceGroupTree'
import DeviceListPopover from './components/DeviceListPopover'
import DeviceHostName from './components/DeviceHostName'
import DeviceBatchOperation from './components/DeviceBatchOperation'
import reqPageMixins from '@/mixins/reqPageMixins'
import { popDevDetail, isNewVersion } from '@/utils/iframeUtils'
import { Col, Row } from 'element-ui'
// import { loadNetworkNeighbor } from '@/utils'
import bus from '@/utils/bus'
export default {
  name: 'DeviceList',
  data() {
    return {
      confilctMsg: false,
      aplist: {
        list: []
      },
      onGetingVersion: true,
      mapData: {},
      editingSn: '',
      // query、apProps 组件DeviceListPopover提供
      query: {},
      apProps: {},
      // groupTree 组件DeviceGroupTree提供
      groupTree: {},
      groupWidth: 0,
      expandGroupText: '展开分组',
      curGroup: '所有分组'
    }
  },
  computed: {
    isAp() {
      return true // this.$route.meta.t === 'wifi_ap'
    },
    listTitle() {
      return this.isAp ? 'AP列表' : '设备列表'
    },
    jsonKey() {
      return this.isAp ? 'apListJson' : 'deviceListJson'
    },
    curSn() {
      return (window.top.APP_SYSINFO || this.$store.getters.sysinfo).serial_num
    }
  },
  mixins: [reqPageMixins],
  components: {
    DeviceGroupTree,
    DeviceListPopover,
    DeviceBatchOperation,
    DeviceHostName,
    [Col.name]: Col,
    [Row.name]: Row
  },
  mounted() {
    setTimeout(() => {
      this._getConflictStatus()
    }, 1000)
    window.addEventListener('message', this._owItemChange, false)
  },
  beforeDestroy() {
    this.$bus.$off('SW_CHANGE')
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
    async loadPageList(query) {
      if (this.isAp) {
        query.productType = 'EAP|EWR'
      }
      let _aplist = await this.$api.getAplist(query)

      if (_aplist.list && Array.isArray(_aplist.list)) {
        this.aplist = _aplist
      }
      if (this.aplist.list.length) {
        this.onMatchVersion()
      }
      return this.aplist
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
          `建议升级目标设备版本，体验更便捷的WEB管理。旧版本设备需新开浏览器页查看/配置，是否跳转到该设备的WEB页面？`,
          `检测到目标设备的版本较旧`,
          {
            showClose: false,
            cancelButtonText: '不看了',
            confirmButtonText: '好的，跳转查看'
          }
        ).then(
          _ => {
            window.open(`http://${row.ip}`, '_blank')
          },
          _ => {}
        )
      }
      popDevDetail(
        {
          ip: row.ip,
          sn: row.serialNumber
        },
        'ApList',
        row.product
      )
    },
    _isEditAble(row) {
      return row.status === 'ON'
    },
    // 判断是否冲突
    async _getConflictStatus() {
      if (this.$roles().includes('master')) {
        // loadNetworkNeighbor()
        let d = await this.$api.cmd('devSta.get', { module: 'conflict_status' })
        if (d.conflict_status === true) {
          this.confilctMsg = '发现不属于本网络管理的设备，'
        }
      }
    },
    // 跳转编辑冲突页
    _onEditConflict() {
      this.$router.push({ name: 'admin/network_neighbor' })
    },
    handleAplist() {
      this.aplist.list = this.aplist.list.map(item => {
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
    onMatchVersion() {
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
          this.$alert('可升级版本获取失败，请刷新页面重新获取')
        })
    },
    onBatchUpdateDevice(data) {
      this.onUpdateAplist(data)
    },
    onSingleUpdate(row) {
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
            message:
              '升级命令已下发，请等待设备后台<strong>静默升级</strong>，<div class="c-warning pt10">请几分钟后刷新页面查看。<div/>',
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
        ON: '在线',
        OFF: '离线',
        NEVER_ON: '从未上线'
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
      this.expandGroupText = isExpanded ? '展开分组' : '收起分组'
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
          data.isDefault === 'true' ? '默认组' : data.groupName || '所有分组'
        this._initPage()
      }
    },
    onEditGroupName(data) {
      if (this.isOprateCurGroup(data.groupId)) {
        this.curGroup = data.isDefault === 'true' ? '默认组' : data.groupName
      }
      this._initPage()
    },
    onGroupDelete(data) {
      if (this.isOprateCurGroup(data.groupId)) {
        this.clearQuery()
        this.query.groupId = ''
        this.curGroup = '所有分组'
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
  .hidden {
    width: 0;
    height: 0;
    opacity: 0;
  }
}
</style>
