<template>
  <div class="component-overview-ifaceinfo">
    <help-alert :title="$t('network.port_vlan')" json-key="vlanPortJson" type="info">
      <div class="h30" slot="content">
        <i18n path="network.vlan_port_tip">
          <a @click="$parent.tabValue = '0'" class="c-success pointer" href="javascript:void();">{{ $t("network.lan_cfg") }}</a>
        </i18n>
      </div>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">{{ $t("network.port_vlan") }}</span>
    </div>
    <div class="component-overview-ifaceinfo-port tc" v-show="portStatus.length">
      <div class="port-wrap-container">
        <div class="port-wrap vm">
          <i class="rjucd-upport vm on"></i>
          <span class="vm">{{ $t("phrase.connection") }}</span>
        </div>
        <div class="port-wrap vm ml20">
          <i class="rjucd-upport vm off"></i>
          <span class="vm">{{ $t("phrase.disconnection") }}</span>
        </div>
      </div>
      <el-row :gutter="10" class="mt15" justify="star" type="flex">
        <el-col class="mw w90"></el-col>
        <el-col :key="k" :lg="spanLg" :sm="spanSm" :xs="spanXs" class="mw" v-for="(p, k) in portStatus">
          <el-popover :key="p.portId" @after-leave="_onPopHide" placement="top" popper-class="pop-class" trigger="click">
            <div>
              <!-- <p>{{`${p.name} ${p.name === 'LAN' ? p.portId - 1 : ''}`}}</p> -->
              <p>{{ $t("network.speed_f") }}{{ p.speed === "auto" ? $t("phrase.auto") : (p.speed || 0) + "M" }}</p>
              <template v-if="p.poe_direct !== 'none'">
                <p>POE：{{ p.poe_enable === "0" ? $t("network.disable"): $t("network.enable") }}({{ p.poe_direct === "in" ? $t("network.receive_power") : $t("network.supply_power") }})</p>
              </template>
              <p class="w180">
                {{ $t("network.desc_f") }}
                <span v-show="isEditDes">
                  <el-input class="w100 lh" ref="portDes" size="mini" v-model="curPortDes"></el-input>
                  <i @click="_onSavePortDes(p.portId - 1)" class="pointer c-success">{{ $t("action.save") }}</i>
                </span>
                <span @click="_onEditPortDes(p.portId - 1)" class="c-success pointer" v-show="!isEditDes">
                  <label class="pointer">{{ (portInfo[p.portId - 1] || {}).des || "" }}</label>
                  <i class="el-icon-edit"></i>
                </span>
              </p>
            </div>
            <port :port="p" class="component-overview-ifaceinfo-port-item" slot="reference">
              <strong class="c-success" slot="bottom" slot-scope="{ port }">{{ $t("esw.dhcp.port_tip", { p: port.portId - 1 }) }}</strong>
            </port>
          </el-popover>
        </el-col>
      </el-row>
      <el-row
        :gutter="10"
        :key="i"
        justify="star"
        type="flex"
        v-for="(vlan, i) in portVlan"
        v-show="!unSupportVlan.includes(vlan.vlanid)"
      >
        <el-col class="mw w90">
          <el-popover :key="i" placement="top" trigger="hover">
            <p>{{ $t("phrase.remark_f") }}{{ (vlanMap[vlan.vlanid] && vlanMap[vlan.vlanid].desc) || "-" }}</p>
            <div slot="reference">{{ vlan.vlanid === "233" ? $t("network.def_vlan") : `VLAN ${vlan.vlanid}` }}</div>
          </el-popover>
        </el-col>
        <el-col :key="idx" :lg="spanLg" :sm="spanSm" :xs="spanXs" class="mw" v-for="idx in portStatus.length">
          <el-select
            :class="typeMap[vlan.port[idx - 1]].clazz"
            :disabled="vlan.vlanid === '233' && idx === 1"
            :placeholder="$t('action.select')"
            @change="_onChange"
            class="w90"
            size="mini"
            v-model="vlan.port[idx - 1]"
          >
            <el-option
              :disabled="_isDisabled(vlan, idx - 1, key)"
              :key="key"
              :label="type.html"
              :value="key"
              v-for="(type, key) in typeMap"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="10" class="mt15" justify="star" type="flex">
        <el-col class="w90"></el-col>
        <el-col :lg="spanLg" :sm="spanSm" :xs="spanXs">
          <el-button class="w160" type="primary" v-auth="_save" v-show="isChanged">{{ $t("action.save") }}</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { hostnameRegexp, lengthValidate } from '@/utils/rulesUtils'
import Port from '@/common/Port'
let timer = null
const UNTAG = '-1',
  TAG = '1',
  NONE = '0'
export default {
  name: 'NetworkVlanPort',
  data() {
    return {
      isEditDes: false,
      curPortDes: '',
      unSupportVlan: ['1', '4094', '4093', '4092', '4091'],
      portInfo: {
        // 从0开始
        // 0: {
        //   des: 'IPTV使用',
        //   portId: '0',
        //   otherInfo: '其他预留信息'
        // },
        // 2: {
        //   des: '办公网',
        //   portId: '2'
        // },
        // 3: {
        //   des: '访客网',
        //   portId: '3'
        // }
      },
      typeMap: {
        [TAG]: {
          html: 'TAG',
          clazz: 'success'
        },
        [UNTAG]: {
          html: 'UNTAG',
          clazz: 'warning'
        },
        [NONE]: {
          html: I18N.t('network.no_join'),
          clazz: 'none'
        }
      },
      isChanged: false,
      portStatus: [],
      portVlan: [
        // { vlanid: '22', port: ['0', '0', '0', '0', '0'] },
        // { vlanid: '11', port: ['0', '0', '0', '0', '0'] },
        // { vlanid: '1', port: ['0', '0', '0', '0', '-1'] }, // "0"不加入，"1"带tag，"-1"不带tag
        // { vlanid: '233', port: ['-1', '-1', '-1', '0', '1'] },
        // { vlanid: '90', port: ['0', '0', '0', '0', '0'] }
      ],
      vlanMap: {}
    }
  },
  beforeDestroy() {
    clearTimeout(timer)
    timer = null
  },
  computed: {
    spanWidth() {
      return this.portStatus.length > 5 ? 24 : 16
    },
    spanXs() {
      // <768px
      return Math.round(this.spanWidth / this.portStatus.length) || 5
    },
    spanSm() {
      // ≥768px
      return Math.round((this.spanWidth - 2) / this.portStatus.length) || 4
    },
    spanLg() {
      // ≥1200px
      return Math.round((this.spanWidth - 6) / this.portStatus.length) || 3
    }
  },
  components: {
    Port
  },
  async created() {
    await this._loadPortVlan()
    await this._loadPortStatus(true)
    await this._getNetworkVlan()
    this._loadPortInfo()
  },
  methods: {
    async _loadPortVlan() {
      this.originalData = await this.$api.getVlanPort()
      this.portVlan = (this.originalData.list || []).sort((a, b) => {
        // 按vlanid大小排序，默认VLAN放第一个
        if (a.vlanid === '233') {
          return -1
        }
        if (b.vlanid === '233') {
          return 1
        }
        return +a.vlanid - b.vlanid
      })
    },
    // 加载接口信息
    async _loadPortStatus(isInit) {
      try {
        let _portSataus = await this.$api.portStatus()

        this.portStatus = ((_portSataus && _portSataus.List) || [])
          .filter(p => p.name.toLocaleUpperCase() === 'LAN')
          .sort((a, b) => +a.portId - b.portId)
          .map(port => {
            return Object.assign({}, port, {
              _status: port.status == 'on' ? 'on-on' : 'off-off'
            })
          })
      } finally {
        if (isInit || timer) {
          // 防止网络状态请求未返回时切换到其他页面，已clear的定时器又重新创建导致残留定时器
          // timer = setTimeout(() => {
          //   this._loadPortStatus()
          // }, 8000)
        }
      }
    },
    // 加载接口信息
    async _loadPortInfo() {
      this.portInfo = await this.$api.getPortInfo({ showError: false })
    },
    async _getNetworkVlan() {
      let _res = await this.$api.getNetwork()
      ;(_res.lan || []).forEach(
        (o, i) => this.vlanMap[o.vlanid] || (this.vlanMap[o.vlanid] = o)
      )
    },
    // 当前curVlan信息， portIdx列（端口1在第0列）
    _isDisabled(curVlan, portIdx, value) {
      // UNTAG的选项 并且 当前选项值不是UNTAG的才要判断是否disabled
      if (value === UNTAG && curVlan.port[portIdx] !== UNTAG) {
        return this.portVlan.some(vlan => vlan.port[portIdx] === UNTAG)
      }
      return false
    },
    _onChange() {
      this.isChanged = true
      this.$message.info(I18N.t('network.vlan_save_tip'))
    },
    _save() {
      this.originalData.list = this.portVlan
      this.$api.setVlanPort(this.originalData).then(_ => {
        this.isChanged = false
        this.$message.success(I18N.t('tip.edit1_success'))
      })
    },
    _onSavePortDes(portId) {
      if (!hostnameRegexp.test(this.curPortDes)) {
        return this.$message.warning(I18N.t('network.portname_rule'))
      } else if (!lengthValidate(this.curPortDes, 0, 28)) {
        return this.$message.warning(I18N.t('network.portname_len_rule'))
      }

      let _tmp = this.portInfo[portId]
      if (_tmp) {
        _tmp.des = this.curPortDes
      } else {
        this.portInfo[portId] = {
          portId: portId,
          des: this.curPortDes
        }
      }
      this.isEditDes = false
      this.curPortDes = ''
      this.$api.setPortInfo(this.portInfo)
    },
    _onEditPortDes(portId) {
      this.curPortDes = (this.portInfo[portId] || {}).des || ''
      this.isEditDes = true
      this.$nextTick(_ => {
        this.$refs.portDes[portId].focus()
      })
    },
    _onPopHide() {
      this.isEditDes = false
    }
  }
}
</script>
<style lang="scss">
@import '~@/style/utils/_variable.scss';
// 覆盖element-ui的select样式
.component-overview-ifaceinfo {
  .el-select.warning input.el-input__inner {
    color: $--color-warning;
    background: $--color-warning-lighter;
    border-color: $--color-warning-light;
  }
  .el-select.success input.el-input__inner {
    color: $--color-success;
    background: $--color-success-lighter;
    border-color: $--color-success-light;
  }
}
</style>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.pop-class {
  p {
    line-height: 28px;
  }
  .lh {
    height: 26px;
    line-height: 26px;
  }
}
.component-overview-ifaceinfo {
  .el-row {
    margin-bottom: 20px;
  }
  .mw {
    min-width: 95px;
  }
  .port-wrap-container {
    position: absolute;
    top: 10px;
    left: 10px;
    i {
      font-size: 22px;
      border: 1px solid currentColor;
      border-radius: 3px;
      padding: 2px;
    }
    span {
      font-size: 12px;
      color: $--color-info;
    }
  }
  &-port {
    position: relative;
    border: 1px solid #ccc;
    border-radius: $--border-radius-base;
    padding: 40px 20px 20px;
    min-width: 600px;
    overflow: auto;
    &-item {
      cursor: pointer;
    }
  }
}
</style>
