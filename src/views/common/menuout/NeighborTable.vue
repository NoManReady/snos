<template>
  <div class="neighbor-table">
    <el-collapse v-model="activeNames">
      <el-collapse-item :key="i" :name="network.networkId" v-for="(network, i) in fromNetworkData">
        <template slot="title">
          <div class="w280">
            <strong :title="getNetworkName(network)" class="fs14 ellipsis vm width-name pl10">{{ getNetworkName(network) }}</strong>
            <span class="vm">{{ $t("nei.dev_cnt", { cnt: network.subDevice.length }) }}</span>
          </div>
          <el-button
            :disabled="isMergerLock"
            @click.stop="onPreMergeNetwork(network)"
            size="medium"
            type="plain"
            v-if="isNeiborNetwork"
          >{{ $t("nei.add_to_mynet") }}</el-button>
        </template>
        <el-table
          :data="network.subDevice"
          :ref="`deviceRef${network.networkId}`"
          @row-click="onRowSelect"
          class="has-banner"
          size="medium"
          stripe
        >
          <el-table-column align="center" type="selection" v-if="isNeiborNetwork" width="40"></el-table-column>
          <el-table-column :label="$t('sysinfo.dev_type')" :min-width="isNeiborNetwork ? 185 : 245" align="center">
            <template slot-scope="{ row }">
              <div :class="{ pl15: !isNeiborNetwork }" class="banner-wrap tl">
                <el-tag class="device-tag tc" size="mini" type="success" v-if="row.product === 'EHR'">{{ $t("nei.router") }}</el-tag>
                <el-tag class="device-tag tc" size="mini" v-else-if="row.product === 'EAP' || row.forwardMode === 'AP' ">A P</el-tag>
                <el-tag class="device-tag tc" size="mini" type="success" v-else-if="row.forwardMode === 'AC'">A C</el-tag>
                <el-tag
                  class="device-tag tc"
                  size="mini"
                  type="success"
                  v-else-if="['GW_RGOS', 'EGW', 'EWR'].includes(row.product)"
                >{{ $t("nei.gateway") }}</el-tag>
                <el-tag
                  class="device-tag tc"
                  size="mini"
                  type="warning"
                  v-else-if="['SW', 'MSW'].includes(row.product)"
                >{{ $t("nei.switch") }}</el-tag>
                <el-tag class="device-tag tc" size="mini " type="danger" v-else>{{ row.product }}</el-tag>
                <span
                  :class="{ 'widther-type': !isNeiborNetwork }"
                  :title="row.deviceType"
                  class="ellipsis vm width-type"
                >{{ row.deviceType }}</span>
                <template v-if="!isNeiborNetwork">
                  <span class="c-warning" v-if="row.devSN === $store.getters.master.sn">[{{ $t("devlist.master") }}]</span>
                  <div class="banner" v-if="curSn === row.devSN">
                    <span>{{ $t("devlist.local") }}</span>
                  </div>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('devlist.sn')" align="center" min-width="145">
            <template slot-scope="{ row }">{{ row.devSN }}</template>
          </el-table-column>
          <el-table-column :label="$t('sysinfo.ip_addr')" align="center" min-width="130">
            <template slot-scope="{ row }">{{ row.ip }}</template>
          </el-table-column>
          <el-table-column :label="$t('sysinfo.mac_addr')" align="center" min-width="145">
            <template slot-scope="{ row }">{{ row.devMac }}</template>
          </el-table-column>
          <el-table-column :label="$t('sysinfo.soft_version')" align="center" min-width="300">
            <template slot-scope="{ row }">{{ row.software }}</template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
    <el-dialog :title="tips" :visible.sync="isModalShow" @open="_clearValidate" width="450px">
      <el-form :model="mergeData" :rules="baseRules" @submit.native.prevent label-width="80px" ref="baseForm" size="medium">
        <!-- 表单单个输入框回车会刷新页面，放一个隐藏输入框, 改用@submit.native.prevent解决
        <el-form-item label v-show="false">
          <el-input></el-input>
        </el-form-item>-->
        <el-form-item :label="$t('nei.manage_pass')" prop="password">
          <el-input
            :placeholder="$t('nei.input_dev_pass', { netname: fromNetworkName })"
            @keydown.enter.native="onAdd"
            ref="password"
            type="password"
            v-model="mergeData.password"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('nei.dest_net')" prop="toNetworkId" v-if="!isNeiborNetwork">
          <el-select :placeholder="$t('nei.dest_net_id')" class="w100p" v-model="mergeData.toNetworkId">
            <el-option :key="item.networkId" :label="item.networkId" :value="item.networkId" v-for="item in toNetworkData"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="forgotShow = true" class="c-info" type="text">{{ $t("nei.forgot") }}</el-button>
        <el-button @click="onAdd" size="medium" type="primary">{{ $t("nei.join_to_mynet") }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="$t('nei.forget_pass')" :visible.sync="forgotShow" width="450px">
      <div>
        {{ $t("nei.cfg_step_f") }}
        <ol class="ul-tips ml15">
          <li>{{ $t("nei.dev_power_on") }}</li>
          <li>{{ $t("nei.dev_reset") }}</li>
          <li>{{ $t("nei.dev_long_click") }}</li>
        </ol>
      </div>
      <span class="dialog-footer" slot="footer">
        <el-button @click="forgotShow = false" size="medium" type="primary">{{ $t("nei.i_know") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
import { Tag, Collapse, CollapseItem } from 'element-ui'
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
  components: {
    [Tag.name]: Tag,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem
  },
  computed: {
    tips() {
      return this.isNeiborNetwork
        ? I18N.t('nei.destnet_to_mynet')
        : I18N.t('nei.mynet_to_destnet')
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
  watch: {
    myNetworkId() {
      this.activeNames = [this.myNetworkId]
    }
  },
  data() {
    return {
      activeNames: [],
      mergeData: {},
      isModalShow: false,
      forgotShow: false,
      deviceRef: 'deviceRef',
      selectObj: {
        eswItems: [],
        apItems: []
      },
      baseRules: {
        password: [
          {
            required: true,
            message: I18N.t('nei.pass_no_empty'),
            trigger: 'blur'
          }
        ],
        toNetworkId: [
          { required: true, message: I18N.t('nei.destnet_no_empty') }
        ]
      },
      fromNetworkName: ''
    }
  },
  methods: {
    onRowSelect(row, col, e) {
      this.$refs[`deviceRef${row.networkId}`][0].toggleRowSelection(row)
    },
    isUseEswMerger(ite) {
      return ite.role === 'SWITCH' || ite.product === 'GW_RGOS'
    },
    onPreMergeNetwork(row) {
      this.fromNetworkName = this.getNetworkName(row, true)
      let patch = { esw_fromSn: [], fromSn: [] }
      this.selectObj = {
        eswItems: [],
        apItems: []
      }
      row.subDevice.forEach(ite => {
        if (this.isUseEswMerger(ite)) {
          this.selectObj.eswItems.push(ite.devSN)
        } else {
          this.selectObj.apItems.push(ite.devSN)
        }
      })
      this.$nextTick(() => {
        let fromDevices = this.$refs[`deviceRef${row.networkId}`][0].selection
        if (!fromDevices.length) {
          if (!this.activeNames.includes(row.networkId)) {
            this.activeNames.push(row.networkId)
          }
          return this.$message(I18N.t('nei.joindev_no_empty'))
        }
        fromDevices.forEach(ite => {
          if (this.isUseEswMerger(ite)) {
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
          I18N.t('nei.devjoin_confirm', { cnt: this.fromDevicesLen || '' }),
          I18N.t('phrase.tip'),
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
        ? I18N.t('nei.new_dev')
        : row.networkName && row.networkName !== 'defaultNetwork'
        ? row.networkName
        : I18N.t('nei.unname_network')
    },
    onAdd() {
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
            <i18n path="nei.join_err_pass" tag="span">
              <b class="c-danger" place="pass">
                {_401.length}
              </b>
            </i18n>
            {_401.map(e => (
              <p>{e.sn}</p>
            ))}
          </div>
        )
      }
      if (_500.length) {
        _jsx500 = (
          <div class="mb10">
            <i18n path="nei.join_err_server" tag="span">
              <b class="c-danger" place="server">
                {_500.length}
              </b>
            </i18n>
            {_500.map(e => (
              <p>{e.sn}</p>
            ))}
          </div>
        )
      }
      if (_000.length) {
        _jsx000 = (
          <div class="mb10">
            <i18n path="nei.join_err_timeout" tag="span">
              <b class="c-danger" place="timeout">
                {_000.length}
              </b>
            </i18n>
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
            {I18N.t('nei.join_err_common', {
              reason: reason ? `(${reason})` : null,
              len: patch.length
            })}
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
                    <i18n path="nei.join_result_tip" tag="span">
                      <b class="c-success" place="success">
                        {Math.max(_successSize, 0)}
                      </b>
                      <b class="c-danger" place="faile">
                        {_errSize}
                      </b>
                    </i18n>
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
.neighbor-table .el-collapse-item__header {
  line-height: 1;
}
.neighbor-table {
  .device-tag {
    min-width: 40px;
  }
  .el-table.has-banner .banner-wrap {
    height: 45px !important;
    line-height: 45px !important;
  }
  .el-icon-arrow-right {
    font-weight: bold;
    color: $--color-primary;
  }
  .ul-tips li {
    margin-top: 3px;
    list-style: decimal;
  }
  .ellipsis {
    width: auto;
    &.width-name {
      max-width: 170px;
    }
    &.width-type {
      max-width: 120px;
    }
    &.widther-type {
      max-width: 170px;
    }
  }
}
</style>
