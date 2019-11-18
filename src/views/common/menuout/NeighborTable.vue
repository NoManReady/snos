<template>
  <div class="neighbor-table">
    <el-table
      :data="fromNetworkData"
      :default-expand-all="!isNeiborNetwork"
      class="mb15"
      ref="multipleTable"
      size="small"
      tooltip-effect="dark"
    >
      <el-table-column label="展开/收起" type="expand" width="80">
        <template slot-scope="props">
          <el-table :data="props.row.subDevice" :ref="`deviceRef${props.row.networkId}`" class="has-banner" size="small">
            <el-table-column align="center" type="selection" v-if="isNeiborNetwork" width="70"></el-table-column>
            <el-table-column align="center" label="IP地址" width="160">
              <template slot-scope="subprops">
                <div class="banner-wrap">
                  {{subprops.row.ip}}
                  <span class="c-warning" v-if="subprops.row.devSN === $store.getters.master.sn">【主】</span>
                  <div class="banner" v-if="curSn===subprops.row.devSN">
                    <span>本机</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="设备MAC">
              <template slot-scope="subprops">{{subprops.row.devMac}}</template>
            </el-table-column>
            <el-table-column align="center" label="设备序列号">
              <template slot-scope="subprops">{{subprops.row.devSN}}</template>
            </el-table-column>
            <el-table-column align="center" label="软件版本">
              <template slot-scope="subprops">{{subprops.row.software}}</template>
            </el-table-column>
            <el-table-column align="center" label="设备类型">
              <template slot-scope="subprops">{{subprops.row.deviceType}}</template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column :label="isNeiborNetwork ? '操作' : ' '" align="center" width="150">
        <template slot-scope="scope">
          <el-button
            :disabled="isMergerLock"
            @click="onPreMergeNetwork(scope.row)"
            size="mini"
            type="text"
            v-show="isNeiborNetwork"
          >添加到我的网络</el-button>
        </template>
      </el-table-column>
      <el-table-column :formatter="getNetworkNameDetail" align="center" label="网络名称"></el-table-column>
    </el-table>
    <el-dialog :visible.sync="isModalShow" @open="_clearValidate" width="450px">
      <el-form :model="mergeData" :rules="baseRules" label-width="80px" ref="baseForm">
        <div class="tc mb30 fs14">{{ tips }}</div>
        <!-- 表单单个输入框回车会刷新页面，放一个隐藏输入框 -->
        <el-form-item label v-show="false">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="管理密码" prop="password">
          <el-input
            :placeholder="`请输入选中设备的管理密码 -（网络：${fromNetworkName}）`"
            ref="password"
            type="password"
            v-model="mergeData.password"
          ></el-input>
        </el-form-item>
        <el-form-item label="目标网络" prop="toNetworkId" v-if="!isNeiborNetwork">
          <el-select class="w100p" placeholder="请选择目标网络ID" v-model="mergeData.toNetworkId">
            <el-option :key="item.networkId" :label="item.networkId" :value="item.networkId" v-for="item in toNetworkData"></el-option>
          </el-select>
        </el-form-item>
        <div class="tc">
          <el-button @click="onClickFormBtn()" size="small">取 消</el-button>
          <el-button @click="onClickFormBtn(true)" size="small" type="primary">确 定</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
export default {
  name: 'NeighborTable',
  props: {
    fromNetworkData: {
      default: [],
      type: Array
    },
    toNetworkData: {
      default: [],
      type: Array
    },
    isNeiborNetwork: {
      default: false,
      type: Boolean
    },
    isMergerLock: {
      default: false,
      type: Boolean
    }
  },
  mixins: [formMixins],
  computed: {
    tips() {
      return this.isNeiborNetwork
        ? '将选中设备添加到我的网络当中'
        : '将我的设备添加到目标网络中'
    },
    myNetworkId() {
      return this.isNeiborNetwork
        ? this.toNetworkData[0].networkId
        : this.fromNetworkData[0].networkId
    },
    myGroupId() {
      return this.isNeiborNetwork
        ? this.toNetworkData[0].groupId
        : this.fromNetworkData[0].groupId
    },
    // 是否开启加密处理
    isEncry() {
      return true
    },
    curSn() {
      return (window.top.APP_SYSINFO || this.$store.getters.sysinfo).serial_num
    }
  },
  data() {
    return {
      mergeData: {},
      isModalShow: false,
      deviceRef: 'deviceRef',
      selectObj: {
        eswItems: [],
        apItems: []
      },
      baseRules: {
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        toNetworkId: [{ required: true, message: '请选择目标网络' }]
      },
      fromNetworkName: ''
    }
  },
  methods: {
    onPreMergeNetwork(row) {
      this.fromNetworkName = this.getNetworkName(row, true)
      let patch = { esw_fromSn: [], fromSn: [] }
      this.$refs.multipleTable.toggleRowExpansion(row, true)
      this.selectObj = {
        eswItems: [],
        apItems: []
      }
      row.subDevice.forEach(ite => {
        if (ite.role === 'SWITCH') {
          this.selectObj.eswItems.push(ite.devSN)
        } else {
          this.selectObj.apItems.push(ite.devSN)
        }
      })
      this.$nextTick(() => {
        let fromDevices = this.$refs[`deviceRef${row.networkId}`].selection
        if (!fromDevices.length) {
          return this.$message('请先选中当前网络下需要进行网络合并的设备')
        }
        fromDevices.forEach(ite => {
          if (ite.role === 'SWITCH') {
            patch.esw_fromSn.push(ite.devSN)
          } else {
            patch.fromSn.push(ite.devSN)
          }
        })
        this.fromDevicesLen = fromDevices.length
        this.setMergeData(row, patch)
      })
    },
    setMergeData(row, patch) {
      this.mergeData = {
        type: this.isEncry ? 'enc' : 'noenc',
        fromNetworkId: row.networkId,
        toNetworkId: this.isNeiborNetwork ? this.myNetworkId : '',
        password: row.networkId === '0' ? 'admin' : '' // 新设备免输入默认密码
      }
      this.mergeData.patch = patch
      if (row.networkId === '0') {
        this.$confirm(
          `确认将这 ${this.fromDevicesLen || ''} 个新设备添加到我的网络中吗?`,
          '提示',
          {
            type: 'info'
          }
        ).then(() => {
          this._addToMyNetwork(true)
        })
      } else {
        this.isModalShow = true
      }
    },
    getNetworkName(row, hideDetail) {
      return row.networkId === '0'
        ? '新设备'
        : row.networkName
        ? row.networkName
        : '未命名网络'
    },
    getNetworkNameDetail(row) {
      let name = this.getNetworkName(row)
      return `${name}　（${row.subDevice.length} 台设备）`
    },
    onClickFormBtn(isConfirm) {
      if (!isConfirm) return (this.isModalShow = false)
      this.$refs.baseForm.validate(ok => {
        if (ok) {
          this._addToMyNetwork()
        }
      })
    },
    // 合并esw
    _mergeEsw(patch, { ret }) {
      if (!ret || !(ret instanceof Array)) {
        return {
          realPatch: [],
          errPatch: [],
          errMsg: null
        }
      }
      // 合并时设备丢失默认000
      if (patch.length !== ret.length) {
        patch.forEach(p => {
          if (!ret.find(r => r.sn === p)) {
            ret.push({ sn: p, code: '000', ip: '' })
          }
        })
      }

      let _err = ret.filter(r => r.code !== '200')
      let _200 = ret.filter(r => r.code === '200')
      let _401 = _err.filter(r => r.code === '401')
      let _500 = _err.filter(r => r.code === '500')
      let _000 = _err.filter(r => r.code === '000')
      // 清除合并成功的设备（this.selectObj）
      _200.forEach(ite => {
        let _index = this.selectObj.eswItems.findIndex(e => e === ite.sn)
        if (_index > -1) {
          this.selectObj.eswItems.splice(_index, 1)
        }
      })
      let _jsx401 = null
      let _jsx500 = null
      let _jsx000 = null
      if (_401.length) {
        _jsx401 = (
          <div class="mb10">
            密码错误：<b class="c-danger">{_401.length}</b>台,SN:
            {_401.map(e => (
              <p>{e.sn}</p>
            ))}
          </div>
        )
      }
      if (_500.length) {
        _jsx500 = (
          <div class="mb10">
            配置失败（可能网络相关问题）：
            <b class="c-danger">{_500.length}</b>台,SN:
            {_500.map(e => (
              <p>{e.sn}</p>
            ))}
          </div>
        )
      }
      if (_000.length) {
        _jsx000 = (
          <div class="mb10">
            网络超时（可能邻居IP变更，尝试重新选择设备再进行合并操作）：
            <b class="c-danger">{_000.length}</b>台,SN:
            {_000.map(e => (
              <p>{e.sn}</p>
            ))}
          </div>
        )
      }
      return {
        realPatch: ret,
        errPatch: _err.map(e => e.sn),
        errMsg: [_jsx401, _jsx500, _jsx000].filter(e => !!e)
      }
    },
    // 合并ap
    _mergeAp(patch, { result, reason }) {
      let _errPatch = []
      let _apFail = patch.length && result === 'fail'
      if (_apFail) {
        _errPatch = patch
      }
      return {
        realPatch: patch,
        errPatch: _errPatch,
        errMsg: _apFail ? (
          <div class="mb10">
            合并失败{reason ? `(${reason})` : null}：
            <b class="c-danger">{patch.length}</b>
            台,SN:
            {patch.map(sn => (
              <p>{sn}</p>
            ))}
          </div>
        ) : null
      }
    },
    // 合并所有设备
    _mergeAllDevice(setting, patch) {
      let _setting = {
        ...setting,
        ...patch,
        password: this.$encry(setting.password)
      }
      if (patch.fromSn.length === 0) {
        delete _setting.fromSn
      } else if (patch.fromSn.length === this.selectObj.apItems.length) {
        _setting.fromSn = []
      }
      if (patch.esw_fromSn.length === 0) {
        delete _setting.esw_fromSn
      } else if (patch.esw_fromSn.length === this.selectObj.eswItems.length) {
        _setting.esw_fromSn = []
      }
      return this.$api.setNetworkNeighbor(_setting).then(d => {
        return [
          this._mergeEsw(patch.esw_fromSn, d),
          this._mergeAp(patch.fromSn, d)
        ]
      })
    },
    _addToMyNetwork() {
      let _data = JSON.parse(JSON.stringify(this.mergeData))
      delete _data.patch
      this._mergeAllDevice(_data, this.mergeData.patch).then(([esw, ap]) => {
        let _patch = {
          esw_fromSn: esw.errPatch,
          fromSn: ap.errPatch
        }
        let _errSize = _patch.esw_fromSn.length + _patch.fromSn.length
        // if (_patch.esw_fromSn.length) {
        //   this.mergeData.patch.esw_fromSn = _patch.esw_fromSn
        // }
        // if (_patch.fromSn.length) {
        //   this.mergeData.patch.fromSn = _patch.fromSn
        // }
        this.mergeData.patch = _patch
        if (_errSize) {
          this.isModalShow = true
          let _successSize = this.fromDevicesLen - _errSize
          this.$nextTick().then(() => {
            this.mergeData.password = ''
            this.$refs.password && this.$refs.password.focus()
            this.$msgbox({
              dangerouslyUseHTMLString: true,
              message: (
                <div style="max-height:500px;overflow-y:auto;">
                  <h3 class="mb10">
                    合并成功：
                    <b class="c-success">{Math.max(_successSize, 0)}</b>
                    台, 失败：
                    <b class="c-danger">{_errSize}</b>
                    台,原因：
                  </h3>
                  {ap.errMsg}
                  {esw.errMsg}
                </div>
              ),
              type: 'warning'
            })
          })
        } else {
          this.isModalShow = false
        }
        this.$log('fromDevicesLen-before', this.fromDevicesLen)
        this.$log('failed', _errSize)
        this.$log('stayMergerCount', this.$parent.stayMergerCount)
        this.$log('fromDevicesLen after', _errSize)
        let _stayCount =
          this.fromDevicesLen - _errSize + this.$parent.stayMergerCount
        this.fromDevicesLen = _errSize
        this.$emit('onMerger', _stayCount)
      })
    }
  }
}
</script>
<style lang="scss">
@import '~@/theme/theme.scss';
.neighbor-table {
  .el-icon-arrow-right {
    font-weight: bold;
    color: $--color-primary;
  }
}
</style>
