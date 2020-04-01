<template>
  <div class="switch-sys">
    <!-- 恢复出厂 -->
    <el-popover placement="top" ref="resetPopover" trigger="click" v-model="resetPopover" width="200">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        {{$t('esw.sys.reset_confirm')}}
      </p>
      <div class="tr">
        <el-button @click.native="resetPopover = false" class="c-info" size="mini" type="text">{{$t('action.cancel')}}</el-button>
        <el-button @click.native="_handleReset" size="mini" type="text">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <!-- 重启 -->
    <el-popover placement="top" ref="rebootPopover" trigger="click" v-model="rebootPopover" width="200">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        {{$t('esw.sys.reboot_confirm')}}
      </p>
      <div class="tr">
        <el-button @click.native="rebootPopover = false" class="c-info" size="mini" type="text">{{$t('action.cancel')}}</el-button>
        <el-button @click.native="_handleReboot" size="mini" type="text">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <!-- 工具bar -->
    <div class="clearfix">
      <div class="fl">
        <small class="c-info">{{$t('esw.sys.support_vlan')}}</small>
        <switch-vmode class="vm" />
        <el-popover trigger="hover">
          <el-table :data="dhcpWarnnings" size="mini">
            <el-table-column align="center" label="VLAN ID" property="vid" width="100"></el-table-column>
            <el-table-column :label="$t('esw.port')" align="center" property="port" width="80"></el-table-column>
            <el-table-column align="center" label="IP" property="ip" width="160"></el-table-column>
            <el-table-column align="center" label="MAC" property="mac" width="200"></el-table-column>
          </el-table>
          <span class="c-warning vm pointer fs12 ml20" slot="reference" v-show="dhcpWarnnings.length">
            {{$t('esw.sys.mutil_dhcp')}}
            <i class="el-icon-warning"></i>
          </span>
        </el-popover>
        <port-panel--graphic />
      </div>

      <div class="fr">
        <el-button
          :loading="isLoading"
          @click.native="_refresh"
          class="vm mr5"
          icon="el-icon-refresh"
          size="mini"
          style="padding:0;"
          type="text"
        >{{$t('action.refresh')}}</el-button>
        <el-button plain round size="mini" type="primary" v-popover:rebootPopover>
          <i class="rjucd-reload fs16 pr5"></i>
          {{$t('esw.sys.reboot')}}
        </el-button>
        <!-- <el-button size="mini" type="danger" v-popover:resetPopover>恢复出厂配置</el-button> -->
      </div>
    </div>
    <!-- 端口面板 -->
    <div class="box-desc mt10" v-loading="isLoading">
      <switch-panel />
    </div>
    <!-- 系统信息 -->
    <div class="box-desc" v-loading="isLoading">
      <div class="box-desc--icon">
        <i class="rjucd-systemset"></i>
        <span>SYS</span>
      </div>
      <div class="box-desc--lab">
        <p>
          <span class="box-desc--key">{{$t('sysinfo.dev_name')}}</span>
          <span class="box-desc--value">{{sysinfo.hostname}}</span>
          <common-popover
            :rules="hostNameRules"
            :title="$t('sysinfo.dev_name_modify')"
            :value="sysinfo.hostname"
            @submit="_onNameSubmit(sysinfo,$event)"
          >
            <el-tooltip :content="$t('sysinfo.dev_name_modify')" placement="top">
              <span>
                <i class="el-icon-loading c-success fs16 ml5" v-show="sysinfo.$nLoading"></i>
                <i :class="['c-success']" class="el-icon-edit fs16 c-success ml5 pointer" v-show="!sysinfo.$nLoading"></i>
              </span>
            </el-tooltip>
          </common-popover>
        </p>
        <p>
          <span class="box-desc--key">{{$t('esw.sys.macc_status')}}</span>
          <span
            :class="{'box-desc--active':sysinfo.coap_state!==0}"
            class="box-desc--value"
          >{{sysinfo.coap_state===0?$t('esw.sys.macc_unconnected'):(sysinfo.coap_state===2?$t('esw.sys.macc_connected'):$t('esw.sys.macc_connectable'))}}</span>
        </p>
        <p>
          <span class="box-desc--key">{{$t('sysinfo.dev_type')}}</span>
          <span class="box-desc--value">{{sysinfo.devtype||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">{{$t('sysinfo.soft_version')}}</span>
          <span class="box-desc--value">{{sysinfo.sver||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">SN</span>
          <span class="box-desc--value">{{sysinfo.sn||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">MAC</span>
          <span class="box-desc--value">{{sysinfo.mac||'--'}}</span>
        </p>
      </div>
    </div>
    <!-- wan信息 -->
    <div class="box-desc" v-loading="isLoading">
      <div class="box-desc--icon">
        <i class="rjucd-upport"></i>
        <span>WAN</span>
      </div>
      <div class="box-desc--lab">
        <p>
          <span class="box-desc--key">{{$t('sysinfo.ip_addr')}}</span>
          <span class="box-desc--value">{{sysinfo.ip||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">{{$t('sysinfo.mask')}}</span>
          <span class="box-desc--value">{{sysinfo.netmask||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">{{$t('sysinfo.gateway_addr')}}</span>
          <span class="box-desc--value">{{sysinfo.gateway||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">{{$t('sysinfo.dns_addr')}}</span>
          <span class="box-desc--value">{{sysinfo.dns||'--'}}</span>
        </p>
      </div>
    </div>
    <!-- 端口信息 -->
    <div class="collapse-group">
      <div class="collapse-group__title">{{$t('esw.sys.minitor_info')}}</div>
      <el-collapse accordion class="custom-collapse" v-model="accordionMonitor">
        <el-collapse-item name="portstatistics">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.sys.port_staticstic')}}</strong>
          </div>
          <switch-portstatistics v-if="accordionMonitor==='portstatistics'" />
        </el-collapse-item>
        <el-collapse-item name="cable">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.sys.cable_test')}}</strong>
          </div>
          <switch-cable v-if="accordionMonitor==='cable'" />
        </el-collapse-item>
        <el-collapse-item name="mactable">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.sys.mac_list')}}</strong>
          </div>
          <switch-mactable v-if="accordionMonitor==='mactable'" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
import { Collapse, CollapseItem } from 'element-ui'
import CommonPopover from '@/common/CommonPopover'
import PortPanelGraphic from '@/common/PortPanelGraphic'
import Panel from './Panel'
import PortStatistics from './PortStatistics'
import Cable from './Cable'
import MacTable from './MacTable'
import Vmode from './Vmode'
import { hostNameValidator, nameLengthValidator } from '@/utils/rules'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'switch-sys',
  components: {
    [CommonPopover.name]: CommonPopover,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Panel.name]: Panel,
    [PortStatistics.name]: PortStatistics,
    [Cable.name]: Cable,
    [Vmode.name]: Vmode,
    [MacTable.name]: MacTable,
    [PortPanelGraphic.name]: PortPanelGraphic
  },
  data() {
    return {
      hostNameRules: [
        {
          required: true,
          message: I18N.t('esw.sys.hostname_no_empty'),
          whitespace: true
        },
        {
          validator: nameLengthValidator,
          size: 23,
          message: I18N.t('esw.sys.hostname_rule')
        },
        { validator: hostNameValidator }
      ],
      rebootPopover: false,
      resetPopover: false,
      accordionMonitor: '',
      sysinfo: {},
      isLoading: false,
      dhcpWarnnings: []
    }
  },
  created() {
    setTimeout(() => {
      this._loadInfo()
      this._loadMutilDhcp()
    }, 300)
  },
  computed: {
    ...mapGetters('switch', ['item'])
  },
  methods: {
    ...mapActions('switch', ['updateCurrentItem']),
    // 加载系统信息
    async _loadInfo() {
      this.isLoading = true
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_info.cgi'
          },
          { isSilence: true }
        )
        this.sysinfo = _result
      } catch (error) {}
      this.isLoading = false
    },
    // 加载多dhcp数据
    async _loadMutilDhcp() {
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_dhcp_server_info.cgi'
          },
          { isSilence: true }
        )
        if (_result) {
          let _dhcpWarnnings = []
          let _dhcpMap = {}
          let _hasMutilDhcp = false
          _result.forEach(function(dhcp) {
            if (_dhcpMap[dhcp.vid]) {
              _dhcpMap[dhcp.vid].push(dhcp)
              _hasMutilDhcp = true
            } else {
              _dhcpMap[dhcp.vid] = [dhcp]
            }
          })
          if (_hasMutilDhcp) {
            for (let _vid in _dhcpMap) {
              if (_dhcpMap[_vid].length > 1) {
                let _dhcps = _dhcpMap[_vid].map(dhcp => {
                  return {
                    ip: dhcp.ip,
                    mac: dhcp.mac,
                    vid: dhcp.vid === '0' ? 'Untag' : dhcp.vid,
                    port: `Port ${dhcp.port}`
                  }
                })
                _dhcpWarnnings.push(..._dhcps)
              }
            }
            this.dhcpWarnnings = _dhcpWarnnings
          }
        }
      } catch (error) {}
    },
    // 设备名称修改
    _onNameSubmit(ite, name) {
      this.$set(ite, '$nLoading', true)
      this.$api
        .switchApi(
          'doSwitchApi',
          {
            ip: ite.ip,
            sn: ite.sn,
            method: 'post',
            data: {
              hostname: name
            },
            url: 'set_hostname.cgi'
          },
          { isSilence: true }
        )
        .then(() => {
          this.$set(ite, 'hostname', name)
          this.updateCurrentItem({ hostName: name })
        })
        .finally(() => {
          this.$set(ite, '$nLoading', false)
        })
    },
    // 设备重启
    async _handleReboot() {
      this.rebootPopover = false
      await this.$api.switchApi('doSwitchApi', {
        ip: this.item.ip,
        sn: this.item.devSN,
        method: 'post',
        // async: true,
        url: 'reboot.cgi'
      })
      this.$message({
        type: 'success',
        message: I18N.t('esw.sys.reboot_tip')
      })
    },
    // 设备恢复出厂
    async _handleReset() {
      this.resetPopover = false
      await this.$api.switchApi('doSwitchApi', {
        ip: this.item.ip,
        sn: this.item.devSN,
        method: 'post',
        async: true,
        url: 'reset.cgi'
      })
      this.$message({
        type: 'success',
        message: I18N.t('esw.sys.reset_tip')
      })
    },
    // 刷新数据
    async _refresh() {
      this.isLoading = true
      this.$bus.$emit('ESW_REFRESH', { from: 'switch-sys' })
      await this._loadInfo()
      await this._loadMutilDhcp()
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/mixins';
@import '~@/style/utils/variable';
.box-desc {
  display: flex;
  flex-direction: item;
  justify-content: center;
  align-items: center;
  // min-width: 480px;
  background-color: #fff;
  // box-shadow: 0 0 5px $--border-color-lighter;
  border-radius: 5px;
  padding: 0 0 6px 0;
  font-size: 13px;
  @include clearfix;
  &--icon,
  &--lab {
    vertical-align: middle;
    display: inline-block;
  }
  &--icon {
    color: rgba($theme, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 80px;
    height: 80px;
    text-align: center;
    border-radius: 3px;
    margin-right: 20px;
    padding: 15px 0;
    i,
    span {
      line-height: 30px;
      display: block;
    }
    i {
      font-size: 36px;
    }
  }
  &--lab {
    flex: 1;
  }
  &--key,
  &--value {
    display: inline-block;
  }
  &--key {
    min-width: 90px;
    color: $--color-info;
    text-align: right;
    font-weight: bold;
    margin-right: 2px;
    &:after {
      content: ':';
      font-weight: normal;
      display: inline-block;
      vertical-align: middle;
      margin-left: 2px;
    }
  }
  &--active {
    color: $theme;
  }
}
</style>
