<template>
  <div class="switch-sys">
    <!-- 恢复出厂 -->
    <el-popover placement="top" ref="resetPopover" trigger="click" v-model="resetPopover" width="200">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>是否确认恢复出厂？
      </p>
      <div class="tr">
        <el-button @click.native="resetPopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleReset" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <!-- 重启 -->
    <el-popover placement="top" ref="rebootPopover" trigger="click" v-model="rebootPopover" width="200">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>是否确认重启设备？
      </p>
      <div class="tr">
        <el-button @click.native="rebootPopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleReboot" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <!-- 工具bar -->
    <div class="clearfix">
      <div class="fl">
        <small class="c-info">支持VLAN配置</small>
        <switch-vmode class="vm" />
      </div>
      <div class="fr">
        <el-button plain round size="mini" type="primary" v-popover:rebootPopover>
          <i class="rjucd-reload fs16 pr5"></i>重启
        </el-button>
        <!-- <el-button size="mini" type="danger" v-popover:resetPopover>恢复出厂配置</el-button> -->
      </div>
    </div>
    <!-- 端口面板 -->
    <div class="box-desc mt10">
      <switch-panel />
    </div>
    <!-- 系统信息 -->
    <div class="box-desc mt10" v-loading="isLoading">
      <div class="box-desc--icon">
        <i class="rjucd-systemset"></i>
        <span>SYS</span>
      </div>
      <div class="box-desc--lab">
        <p>
          <span class="box-desc--key">设备名称</span>
          <span class="box-desc--value">{{sysinfo.hostname}}</span>
          <common-popover :rules="hostNameRules" :value="sysinfo.hostname" @submit="_onNameSubmit(sysinfo,$event)" title="修改设备名称">
            <el-tooltip content="修改设备名称" placement="top">
              <span>
                <i class="el-icon-loading c-success fs16 ml5" v-show="sysinfo.$nLoading"></i>
                <i :class="['c-success']" class="el-icon-edit fs16 c-success ml5 pointer" v-show="!sysinfo.$nLoading"></i>
              </span>
            </el-tooltip>
          </common-popover>
        </p>
        <p>
          <span class="box-desc--key">连接云AC</span>
          <span
            :class="{'box-desc--active':sysinfo.coap_status!==0}"
            class="box-desc--value"
          >{{sysinfo.coap_status===0?'未接云':(sysinfo.coap_status===2?'已接云':'可接云')}}</span>
        </p>
        <p>
          <span class="box-desc--key">设备型号</span>
          <span class="box-desc--value">{{sysinfo.devtype||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">软件版本</span>
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
    <div class="box-desc mt10" v-loading="isLoading">
      <div class="box-desc--icon">
        <i class="rjucd-upport"></i>
        <span>WAN</span>
      </div>
      <div class="box-desc--lab">
        <p>
          <span class="box-desc--key">IP地址</span>
          <span class="box-desc--value">{{sysinfo.ip||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">子网掩码</span>
          <span class="box-desc--value">{{sysinfo.netmask||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">网关地址</span>
          <span class="box-desc--value">{{sysinfo.gateway||'--'}}</span>
        </p>
        <p>
          <span class="box-desc--key">DNS地址</span>
          <span class="box-desc--value">{{sysinfo.dns||'--'}}</span>
        </p>
      </div>
    </div>
    <!-- 端口信息 -->
    <div class="collapse-group">
      <div class="collapse-group__title">监控信息</div>
      <el-collapse accordion v-model="accordionMonitor">
        <el-collapse-item name="portstatistics">
          <div class="c-info" slot="title">
            <strong>端口统计</strong>
          </div>
          <switch-portstatistics v-if="accordionMonitor==='portstatistics'" />
        </el-collapse-item>
        <el-collapse-item name="cable">
          <div class="c-info" slot="title">
            <strong>线缆检测</strong>
          </div>
          <switch-cable v-if="accordionMonitor==='cable'" />
        </el-collapse-item>
        <el-collapse-item name="mactable">
          <div class="c-info" slot="title">
            <strong>MAC列表</strong>
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
    [MacTable.name]: MacTable
  },
  data() {
    return {
      hostNameRules: [
        { required: true, message: '请输入设备名称', whitespace: true },
        {
          validator: nameLengthValidator,
          size: 23,
          message: '设备名称不能超过23个字符，中文占3字符'
        },
        { validator: hostNameValidator }
      ],
      rebootPopover: false,
      resetPopover: false,
      accordionMonitor: '',
      sysinfo: {},
      isLoading: false
    }
  },
  created() {
    setTimeout(() => {
      this._loadInfo()
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
        message: '重启指令下发成功'
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
        message: '恢复出厂指令下发成功'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../../style/utils/mixins';
@import '../../../../style/utils/variable';
.box-desc {
  display: flex;
  flex-direction: item;
  justify-content: center;
  align-items: center;
  min-width: 480px;
  background-color: #fff;
  box-shadow: 0 0 5px $--border-color-lighter;
  border-radius: 5px;
  padding: 6px;
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
