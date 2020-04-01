<template>
  <div class="switch-basic">
    <!-- 环路保护 -->
    <el-popover placement="top" ref="loopPopover" trigger="click" v-model="loopPopover" width="240">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>{{$t('esw.basic.loop_status_confirm',{status:loopmode==='1'?$t('phrase.disable'):$t('phrase.enable')})}}</span>
      </p>
      <div class="tr">
        <el-button
          @click.native="loopPopover = false"
          class="c-info"
          size="mini"
          type="text"
        >{{$t('action.cancel')}}</el-button>
        <el-button @click.native="_handleLoopMode" size="mini" type="text">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <!-- 端口隔离 -->
    <el-popover placement="top" ref="isoPopover" trigger="click" v-model="isoPopover" width="240">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>{{$t('esw.basic.iso_status_confirm',{status:isomode==='1'?$t('phrase.disable'):$t('phrase.enable')})}}</span>
      </p>
      <div class="tr">
        <el-button
          @click.native="isoPopover = false"
          class="c-info"
          size="mini"
          type="text"
        >{{$t('action.cancel')}}</el-button>
        <el-button @click.native="_handleIsoMode" size="mini" type="text">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <!-- 开发模式 -->
    <el-popover
      placement="top"
      ref="devModePopover"
      trigger="click"
      v-model="devModePopover"
      width="240"
    >
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>{{$t('esw.basic.devmode_status_confirm',{status:devmode==='1'?$t('phrase.disable'):$t('phrase.enable')})}}</span>
      </p>
      <div class="tr">
        <el-button
          @click.native="devModePopover = false"
          class="c-info"
          size="mini"
          type="text"
        >{{$t('action.cancel')}}</el-button>
        <el-button @click.native="_handleDevMode" size="mini" type="text">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <!-- switch模块 -->
    <div class="celler">
      <div class="clearfix celler-item">
        <strong class="c-info fl">
          {{$t('esw.basic.loop')}}
          <el-tooltip placement="top">
            <p class="w200" slot="content">{{$t('esw.basic.loop_tip')}}</p>
            <i class="el-icon-info"></i>
          </el-tooltip>
        </strong>
        <el-switch
          :value="loopmode"
          active-value="1"
          class="fr"
          inactive-value="0"
          v-popover:loopPopover
          v-show="showLoopmode"
        ></el-switch>
        <div class="fr" v-show="!showLoopmode">
          <i class="el-icon-loading fs14" v-if="loopmode===''"></i>
          <el-button
            @click.native="_loadLoopMode"
            class="c-danger"
            size="mini"
            type="text"
            v-else-if="loopmode==='-1'"
          >{{$t('esw.basic.re_fetch')}}</el-button>
          <span class="c-info" v-else>{{$t('esw.basic.unsupport_ver')}}</span>
        </div>
      </div>
      <div class="clearfix celler-item">
        <strong class="c-info fl">
          {{$t('esw.basic.iso')}}
          <el-tooltip placement="top">
            <p class="w260" slot="content">
              <template
                v-if="item.deviceType==='RG-ES226GC-P'"
              >{{$t('esw.basic.iso_tip1',{range1:'1-22',n:'4',range2:'23-26'})}}</template>
              <template
                v-if="item.deviceType==='RG-ES224GC'"
              >{{$t('esw.basic.iso_tip1',{range1:'1-22',n:'2',range2:'23-24'})}}</template>
              <template
                v-else-if="item.deviceType==='RG-ES218GC-P'"
              >{{$t('esw.basic.iso_tip1',{range1:'1-14',n:'4',range2:'15-18'})}}</template>
              <template
                v-else-if="item.deviceType==='RG-ES216GC'"
              >{{$t('esw.basic.iso_tip1',{range1:'1-14',n:'2',range2:'15-16'})}}</template>
              <template
                v-else-if="item.deviceType==='RG-ES209GC-P'||item.deviceType==='RG-ES209C-P'"
              >{{$t('esw.basic.iso_tip2',{range:'1-8',n:'9'})}}</template>
              <template
                v-else-if="item.deviceType==='RG-ES205GC-P'||item.deviceType==='RG-ES205C-P'"
              >{{$t('esw.basic.iso_tip2',{range:'1-4',n:'5'})}}</template>
              <template v-else>{{$t('esw.basic.iso_tip3')}}</template>
            </p>
            <i class="el-icon-info"></i>
          </el-tooltip>
        </strong>
        <el-switch
          :value="isomode"
          active-value="1"
          class="fr"
          inactive-value="0"
          v-popover:isoPopover
          v-show="showIsomode"
        ></el-switch>
        <div class="fr" v-show="!showIsomode">
          <i class="el-icon-loading fs14" v-if="isomode===''"></i>
          <el-button
            @click.native="_loadIsoMode"
            class="c-danger"
            size="mini"
            type="text"
            v-else-if="isomode==='-1'"
          >{{$t('esw.basic.re_fetch')}}</el-button>
          <span class="c-info" v-else>{{$t('esw.basic.unsupport_ver')}}</span>
        </div>
      </div>
      <div class="clearfix celler-item" v-show="showDevmodeFunction">
        <strong class="c-info fl">{{$t('esw.basic.devmode')}}</strong>
        <el-switch
          :value="devmode"
          active-value="1"
          class="fr"
          inactive-value="0"
          v-popover:devModePopover
          v-show="showDevmode"
        ></el-switch>
        <div class="fr" v-show="!showDevmode">
          <i class="el-icon-loading fs14" v-if="devmode===''"></i>
          <el-button
            @click.native="_loadDevMode"
            class="c-danger"
            size="mini"
            type="text"
            v-else-if="devmode==='-1'"
          >{{$t('esw.basic.re_fetch')}}</el-button>
          <span class="c-info" v-else>{{$t('esw.basic.unsupport_ver')}}</span>
        </div>
      </div>
    </div>
    <!-- 端口配置 -->
    <div class="collapse-group">
      <div class="collapse-group__title">{{$t('esw.basic.port_cfg')}}</div>
      <el-collapse accordion class="custom-collapse" v-model="accordionPort">
        <el-collapse-item name="portsetting">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.port_cfg')}}</strong>
            <el-tooltip placement="top">
              <p class="w200" slot="content">{{$t('esw.basic.port_cfg_tip')}}</p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-portsetting v-if="accordionPort==='portsetting'" />
        </el-collapse-item>
        <el-collapse-item name="mirror">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.mirror_cfg')}}</strong>
            <el-tooltip placement="top">
              <p slot="content">{{$t('esw.basic.mirror_cfg_tip')}}</p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-mirror v-if="accordionPort==='mirror'" />
        </el-collapse-item>
        <el-collapse-item name="mac">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.mac_cfg')}}</strong>
            <el-tooltip placement="top">
              <p slot="content">
                <i18n path="esw.basic.mac_cfg_limit" tag="span">
                  <b class="c-success">16</b>
                </i18n>
              </p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-mac v-if="accordionPort==='mac'" />
        </el-collapse-item>
        <el-collapse-item name="macsearch">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.mac_search')}}</strong>
          </div>
          <switch-macsearch v-if="accordionPort==='macsearch'" />
        </el-collapse-item>
        <el-collapse-item name="dhcpsnooping" v-show="hasDhcp">
          <div class="c-info" slot="title">
            <strong>DHCP Snooping</strong>
            <el-tooltip placement="top">
              <div slot="content">
                <i18n path="esw.basic.dhcp_cfg_tip1" tag="p">
                  <strong place="explain">{{$t('phrase.explain_f')}}</strong>
                  <br place="line" />
                </i18n>
                <i18n path="esw.basic.dhcp_cfg_tip2" tag="p">
                  <strong place="explain">{{$t('phrase.notice_f')}}</strong>
                </i18n>
              </div>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-dhcpsnooping v-if="accordionPort==='dhcpsnooping'" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- VLAN配置 -->
    <div class="collapse-group" v-if="vmode==='1'">
      <div class="collapse-group__title">{{$t('esw.basic.vlan_cfg')}}</div>
      <el-collapse accordion class="custom-collapse" v-model="accordionVlan">
        <el-collapse-item name="vmember">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.vlan_member')}}</strong>
            <el-tooltip placement="top">
              <p slot="content">
                <i18n path="esw.basic.vlan_member_limit" tag="span">
                  <b class="c-success">16</b>
                </i18n>
              </p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-vmember v-if="accordionVlan==='vmember'" />
        </el-collapse-item>
        <el-collapse-item name="vsetting">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.vlan_cfg')}}</strong>
          </div>
          <switch-vlansetting v-if="accordionVlan==='vsetting'" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- qos配置 -->
    <div class="collapse-group">
      <div class="collapse-group__title">{{$t('esw.basic.qos_cfg')}}</div>
      <el-collapse accordion class="custom-collapse" v-model="accordionQos">
        <el-collapse-item name="speed">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.rate_cfg')}}</strong>
          </div>
          <switch-speed v-if="accordionQos==='speed'" />
        </el-collapse-item>
        <el-collapse-item name="storm">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.storm_cfg')}}</strong>
          </div>
          <switch-storm v-if="accordionQos==='storm'" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- poe配置 -->
    <div class="collapse-group" v-if="showPoe">
      <div class="collapse-group__title">{{$t('esw.basic.por_cfg')}}</div>
      <el-collapse accordion class="custom-collapse" v-model="accordionPoe">
        <el-collapse-item name="poe">
          <div class="c-info" slot="title">
            <strong>{{$t('esw.basic.por_cfg')}}</strong>
          </div>
          <switch-poe v-if="accordionPoe==='poe'" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
import { Collapse, CollapseItem } from "element-ui";
import CommonPopover from "@/common/CommonPopover";
import VlanMember from "./VlanMember";
import Poe from "./Poe";
import VlanSetting from "./VlanSetting";
import PortSetting from "./PortSetting";
import Mirror from "./Mirror";
import Mac from "./Mac";
import MacSearch from "./MacSearch";
import Dhcpsnooping from "./Dhcpsnooping";
import Speed from "./Speed";
import Storm from "./Storm";
import { hostNameValidator } from "@/utils/rules";
import { mapGetters } from "vuex";
export default {
  name: "switch-basic",
  components: {
    [CommonPopover.name]: CommonPopover,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [VlanMember.name]: VlanMember,
    [VlanSetting.name]: VlanSetting,
    [PortSetting.name]: PortSetting,
    [Poe.name]: Poe,
    [Mac.name]: Mac,
    [MacSearch.name]: MacSearch,
    [Dhcpsnooping.name]: Dhcpsnooping,
    [Mirror.name]: Mirror,
    [Speed.name]: Speed,
    [Storm.name]: Storm
  },
  data() {
    return {
      // ''表示loading,'-1'表示重新加载,false表示不支持
      loopmode: "",
      isomode: "",
      devmode: "",
      loopPopover: false,
      isoPopover: false,
      devModePopover: false,
      accordionVlan: "",
      accordionPort: "",
      accordionPoe: "",
      accordionQos: "",
      showDevmodeFunction: false
    };
  },
  computed: {
    ...mapGetters("switch", ["vmode", "item", "hasDhcp"]),
    showLoopmode() {
      return this.loopmode && this.loopmode !== "-1";
    },
    showIsomode() {
      return this.isomode && this.isomode !== "-1";
    },
    showDevmode() {
      return this.devmode && this.devmode !== "-1";
    },
    showPoe() {
      let _devType = this.item.deviceType;
      return !["RG-ES224GC", "RG-ES216GC"].includes(_devType);
    }
  },
  async created() {
    try {
      await this._loadLoopMode();
      await this._loadIsoMode();
      // await this._loadDevMode()
    } catch (error) {}
  },
  mounted() {
    // window.addEventListener('keypress', this._onKeydown, false)
  },
  beforeDestroy() {
    // window.removeEventListener('keypress', this._onKeydown)
  },
  methods: {
    _onKeydown(e) {
      if (e.shiftKey) {
        if (e.charCode === 68) {
          this.showDevmodeFunction = true;
        } else if (e.charCode === 67) {
          this.showDevmodeFunction = false;
        }
      }
    },
    // 环路保护获取
    async _loadLoopMode() {
      this.loopmode = "";
      try {
        let _result = await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "get",
            url: "rest_get_port_loop.cgi"
          },
          { isSilence: true }
        );
        this.loopmode = _result ? _result.mode : false;
      } catch (error) {
        this.loopmode = "-1";
      }
    },
    // 端口隔离获取
    async _loadIsoMode() {
      this.isomode = "";
      try {
        let _result = await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "get",
            url: "rest_get_port_isolation.cgi"
          },
          { isSilence: true }
        );
        this.isomode = _result ? _result.mode : false;
      } catch (error) {
        this.isomode = "-1";
      }
    },
    // 开发模式获取
    async _loadDevMode() {
      this.devmode = "";
      try {
        let _result = await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "get",
            url: "rest_get_dev_mode.cgi"
          },
          { isSilence: true }
        );
        this.devmode = _result ? _result.devmode : false;
      } catch (error) {
        this.devmode = "-1";
      }
    },
    // 环路保护配置
    async _handleLoopMode() {
      this.loopPopover = false;
      let data = {};
      if (this.loopmode === "0") {
        data.mode = "1";
      }
      try {
        this.loopmode = "";
        await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            url: "loop.cgi",
            data
          },
          { isSilence: true }
        );
        this.loopmode = data.mode || "0";
        this.$message({
          type: "success",
          message: I18N.t("esw.basic.mode_change_success")
        });
      } catch (error) {
        this.loopmode = data.mode === "1" ? "0" : "1";
      }
    },
    // 端口隔离配置
    async _handleIsoMode() {
      this.isoPopover = false;
      let data = {};
      if (this.isomode === "0") {
        data.mode = "1";
      }
      try {
        this.isomode = "";
        await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            url: "port.cgi?cmd=isolation",
            data
          },
          { isSilence: true }
        );
        this.isomode = data.mode || "0";
        this.$message({
          type: "success",
          message: I18N.t("esw.basic.mode_change_success")
        });
      } catch (error) {
        this.isomode = data.mode === "1" ? "0" : "1";
      }
    },
    // 开发模式配置
    async _handleDevMode() {
      if (!this.showDevmodeFunction) {
        return;
      }
      this.devModePopover = false;
      let data = {};
      if (this.devmode === "0") {
        data.mode = "1";
      }
      try {
        this.devmode = "";
        await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            url: "set_dev_mode.cgi",
            data
          },
          { isSilence: true }
        );
        this.devmode = data.mode || "0";
        this.$message({
          type: "success",
          message: I18N.t("esw.basic.mode_change_success")
        });
      } catch (error) {
        this.devmode = data.mode === "1" ? "0" : "1";
      }
    }
  }
};
</script>
