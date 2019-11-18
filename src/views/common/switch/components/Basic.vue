<template>
  <div class="switch-basic">
    <!-- 环路保护 -->
    <el-popover placement="top" ref="loopPopover" trigger="click" v-model="loopPopover" width="240">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>是否确认{{loopmode==='1'?'关闭':'开启'}}环路保护功能？</span>
      </p>
      <div class="tr">
        <el-button @click.native="loopPopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleLoopMode" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <!-- 端口隔离 -->
    <el-popover placement="top" ref="isoPopover" trigger="click" v-model="isoPopover" width="240">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>是否确认{{isomode==='1'?'关闭':'开启'}}端口隔离功能？</span>
      </p>
      <div class="tr">
        <el-button @click.native="isoPopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleIsoMode" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <!-- 开发模式 -->
    <el-popover placement="top" ref="devModePopover" trigger="click" v-model="devModePopover" width="240">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>是否确认{{devmode==='1'?'关闭':'开启'}}开发模式？</span>
      </p>
      <div class="tr">
        <el-button @click.native="devModePopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleDevMode" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <!-- switch模块 -->
    <div class="celler">
      <div class="clearfix celler-item">
        <strong class="c-info fl">
          环路保护
          <el-tooltip placement="top">
            <p class="w200" slot="content">开启环路保护后，如果当前设备存在环路，引起环路的端口将被自动禁用；环路解除后该端口自动恢复。</p>
            <i class="el-icon-info"></i>
          </el-tooltip>
        </strong>
        <el-switch
          :value="loopmode"
          active-value="1"
          class="fr"
          inactive-value="0"
          v-popover:loopPopover
          v-show="loopmode&&loopmode!=='-1'"
        ></el-switch>
        <div class="fr" v-show="loopmode===''">
          <i class="el-icon-loading fs14" v-if="loopmode!=='-1'"></i>
          <el-button @click.native="_loadLoopMode" class="c-danger" size="mini" type="text" v-else>重新加载</el-button>
        </div>
      </div>
      <div class="clearfix celler-item">
        <strong class="c-info fl">
          端口隔离
          <el-tooltip placement="top">
            <p class="w260" slot="content">
              <template
                v-if="item.deviceType==='RG-ES226GC-P'"
              >开启端口隔离后，下联口(1~22)之间相互隔离；后4口（23~26）为上联口，不做隔离限制；（只能上联口和下联口之间转发数据，下联口之间无法转发数据）。</template>
              <template
                v-if="item.deviceType==='RG-ES224GC'"
              >开启端口隔离后，下联口(1~22)之间相互隔离；后2口（23~24）为上联口，不做隔离限制；（只能上联口和下联口之间转发数据，下联口之间无法转发数据）。</template>
              <template
                v-else-if="item.deviceType==='RG-ES218GC-P'"
              >开启端口隔离后，下联口(1~14)之间相互隔离；后4口（15~18）为上联口，不做隔离限制；（只能上联口和下联口之间转发数据，下联口之间无法转发数据）。</template>
              <template
                v-else-if="item.deviceType==='RG-ES216GC'"
              >开启端口隔离后，下联口(1~14)之间相互隔离；后2口（15~16）为上联口，不做隔离限制；（只能上联口和下联口之间转发数据，下联口之间无法转发数据）。</template>
              <template
                v-else-if="item.deviceType==='RG-ES209GC-P'||item.deviceType==='RG-ES209C-P'"
              >开启端口隔离后，下联口(1~8)之间相互隔离；第9口为上联口，不做隔离限制；（只能上联口和下联口之间转发数据）</template>
              <template
                v-else-if="item.deviceType==='RG-ES205GC-P'||item.deviceType==='RG-ES205C-P'"
              >开启端口隔离后，下联口(1~4)之间相互隔离；第5口为上联口，不做隔离限制；（只能上联口和下联口之间转发数据）。</template>
              <template v-else>开启端口隔离后，下联口之间相互隔离；（只能上联口和下联口之间转发数据）。</template>
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
          v-show="isomode&&isomode!=='-1'"
        ></el-switch>
        <div class="fr" v-show="isomode===''">
          <i class="el-icon-loading fs14" v-if="isomode!=='-1'"></i>
          <el-button @click.native="_loadIsoMode" class="c-danger" size="mini" type="text" v-else>重新加载</el-button>
        </div>
      </div>
      <div class="clearfix celler-item">
        <strong class="c-info fl">开发模式</strong>
        <el-switch
          :value="devmode"
          active-value="1"
          class="fr"
          inactive-value="0"
          v-popover:devModePopover
          v-show="devmode&&devmode!=='-1'"
        ></el-switch>
        <div class="fr" v-show="devmode===''">
          <i class="el-icon-loading fs14" v-if="devmode!=='-1'"></i>
          <el-button @click.native="_loadDevMode" class="c-danger" size="mini" type="text" v-else>重新加载</el-button>
        </div>
      </div>
    </div>
    <!-- 端口配置 -->
    <div class="collapse-group">
      <div class="collapse-group__title">端口配置</div>
      <el-collapse accordion v-model="accordionPort">
        <el-collapse-item name="portsetting">
          <div class="c-info" slot="title">
            <strong>端口配置</strong>
            <el-tooltip placement="top">
              <p class="w200" slot="content">端口关闭后，该端口无法收发（POE功能不受影响），关闭所有端口会导致交换机无法管理，请慎重关闭端口。</p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-portsetting v-if="accordionPort==='portsetting'" />
        </el-collapse-item>
        <el-collapse-item name="mirror">
          <div class="c-info" slot="title">
            <strong>端口镜像</strong>
            <el-tooltip placement="top">
              <p slot="content">源镜像端口输入/输出的报文，将被镜像到目的端口。</p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-mirror v-if="accordionPort==='mirror'" />
        </el-collapse-item>
        <el-collapse-item name="mac">
          <div class="c-info" slot="title">
            <strong>静态MAC</strong>
            <el-tooltip placement="top">
              <p slot="content">
                静态MAC最多配置
                <b class="c-success">16</b>个。
              </p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-mac v-if="accordionPort==='mac'" />
        </el-collapse-item>
        <el-collapse-item name="macsearch">
          <div class="c-info" slot="title">
            <strong>MAC搜索</strong>
          </div>
          <switch-macsearch v-if="accordionPort==='macsearch'" />
        </el-collapse-item>
        <el-collapse-item name="dhcpsnooping" v-show="hasDhcp">
          <div class="c-info" slot="title">
            <strong>DHCP Snooping</strong>
            <el-tooltip placement="top">
              <div slot="content">
                <p>
                  <strong>说明</strong>：开启DHCP Snooping可以起到DHCP报文过滤的功能。
                  <br />对于DHCP客户端请求报文，仅将其转发到信任口，对于DHCP服务器响应报文，仅转发来自信任口的响应报文。
                </p>
                <p>
                  <strong>注意</strong>：一般连接DHCP服务器端口（上联口）设置为信任口。
                </p>
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
      <div class="collapse-group__title">VLAN配置</div>
      <el-collapse accordion v-model="accordionVlan">
        <el-collapse-item name="vmember">
          <div class="c-info" slot="title">
            <strong>VLAN成员</strong>
            <el-tooltip placement="top">
              <p slot="content">
                VLAN成员最多配置
                <b class="c-success">16</b>个。
              </p>
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <switch-vmember v-if="accordionVlan==='vmember'" />
        </el-collapse-item>
        <el-collapse-item name="vsetting">
          <div class="c-info" slot="title">
            <strong>VLAN配置</strong>
          </div>
          <switch-vlansetting v-if="accordionVlan==='vsetting'" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- qos配置 -->
    <div class="collapse-group">
      <div class="collapse-group__title">QOS配置</div>
      <el-collapse accordion v-model="accordionQos">
        <el-collapse-item name="speed">
          <div class="c-info" slot="title">
            <strong>端口限速</strong>
          </div>
          <switch-speed v-if="accordionQos==='speed'" />
        </el-collapse-item>
        <el-collapse-item name="storm">
          <div class="c-info" slot="title">
            <strong>风暴控制</strong>
          </div>
          <switch-storm v-if="accordionQos==='storm'" />
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- poe配置 -->
    <div class="collapse-group">
      <div class="collapse-group__title">POE配置</div>
      <el-collapse accordion v-model="accordionPoe">
        <el-collapse-item name="poe">
          <div class="c-info" slot="title">
            <strong>POE配置</strong>
          </div>
          <switch-poe v-if="accordionPoe==='poe'" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
import { Collapse, CollapseItem } from 'element-ui'
import CommonPopover from '@/common/CommonPopover'
import VlanMember from './VlanMember'
import Poe from './Poe'
import VlanSetting from './VlanSetting'
import PortSetting from './PortSetting'
import Mirror from './Mirror'
import Mac from './Mac'
import MacSearch from './MacSearch'
import Dhcpsnooping from './Dhcpsnooping'
import Speed from './Speed'
import Storm from './Storm'
import { hostNameValidator } from '@/utils/rules'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-basic',
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
      loopmode: '',
      isomode: '',
      devmode: '',
      loopPopover: false,
      isoPopover: false,
      devModePopover: false,
      accordionVlan: '',
      accordionPort: '',
      accordionPoe: '',
      accordionQos: ''
    }
  },
  computed: {
    ...mapGetters('switch', ['vmode', 'item', 'hasDhcp'])
  },
  async created() {
    try {
      await this._loadLoopMode()
      await this._loadIsoMode()
      await this._loadDevMode()
    } catch (error) {}
  },
  methods: {
    // 环路保护获取
    async _loadLoopMode() {
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_port_loop.cgi'
          },
          { isSilence: true }
        )
        this.loopmode = _result.mode
      } catch (error) {
        this.loopmode = '-1'
      }
    },
    // 端口隔离获取
    async _loadIsoMode() {
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_port_isolation.cgi'
          },
          { isSilence: true }
        )
        this.isomode = _result.mode
      } catch (error) {
        this.isomode = '-1'
      }
    },
    // 开发模式获取
    async _loadDevMode() {
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_dev_mode.cgi'
          },
          { isSilence: true }
        )
        this.devmode = _result.devmode
      } catch (error) {
        this.devmode = '-1'
      }
    },
    // 环路保护配置
    async _handleLoopMode() {
      this.loopPopover = false
      let data = {}
      if (this.loopmode === '0') {
        data.mode = '1'
      }
      try {
        this.loopmode = ''
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'loop.cgi',
            data
          },
          { isSilence: true }
        )
        this.loopmode = data.mode || '0'
        this.$message({
          type: 'success',
          message: '模式切换成功'
        })
      } catch (error) {
        this.loopmode = data.mode === '1' ? '0' : '1'
      }
    },
    // 端口隔离配置
    async _handleIsoMode() {
      this.isoPopover = false
      let data = {}
      if (this.isomode === '0') {
        data.mode = '1'
      }
      try {
        this.isomode = ''
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'port.cgi?cmd=isolation',
            data
          },
          { isSilence: true }
        )
        this.isomode = data.mode || '0'
        this.$message({
          type: 'success',
          message: '模式切换成功'
        })
      } catch (error) {
        this.isomode = data.mode === '1' ? '0' : '1'
      }
    },
    // 开发模式配置
    async _handleDevMode() {
      this.devModePopover = false
      let data = {}
      if (this.devmode === '0') {
        data.mode = '1'
      }
      try {
        this.devmode = ''
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'set_dev_mode.cgi',
            data
          },
          { isSilence: true }
        )
        this.devmode = data.mode || '0'
        this.$message({
          type: 'success',
          message: '模式切换成功'
        })
      } catch (error) {
        this.devmode = data.mode === '1' ? '0' : '1'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../../style/utils/mixins';
@import '../../../../style/utils/variable';
.switch-basic {
}
</style>
