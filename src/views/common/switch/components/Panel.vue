<template>
  <div class="switch-panel tc">
    <port-panel-view :loading="portCount===0" :panel-ports="panelList" :ports="renderPorts" :uplink="[+uplink.port]"></port-panel-view>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import PortPanelView from '@/common/PortPanelView'
export default {
  name: 'switch-panel',
  components: {
    [PortPanelView.name]: PortPanelView
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters('switch', ['item', 'portInfoList', 'panelList', 'uplink']),
    portCount() {
      return this.portInfoList.length
    },
    renderPorts() {
      let _ports = this.portInfoList.map((p, i) => {
        let _r_speed
        switch (p.dup_r) {
          case 1:
          case 2:
            _r_speed = 0
            break
          case 3:
          case 4:
            _r_speed = 1
            break
          case 5:
            _r_speed = 2
            break
          default:
            _r_speed = -1
            break
        }
        let _port_type = 'closed'
        if (p.enable) {
          if (p.status) {
            if (p.dup_r === 5) {
              _port_type = 'success'
            } else {
              _port_type = 'warning'
            }
          } else {
            _port_type = 'info'
          }
        }
        let _portInfo = {
          lpid: p.port,
          icon: p.isFiber ? 'guangkou' : 'upport',
          portType: _port_type,
          isUplink: p.port === Number(this.uplink.port),
          poe: p.pEnable && p.pPower,
          poeError: p.pEnable && p.pFault,
          link: p.status,
          r_speed: _r_speed,
          input_total: (p.rxBytes || 0) * 1024,
          output_total: p.txBytes || 0 * 1024,
          input: (p.rxBytes || 0) * 1024,
          output: p.txBytes || 0 * 1024,
          inrate_10s: p.rxSpeed || 0,
          outtrate_10s: p.txSpeed || 0,
          input_rate: p.rxSpeed || 0,
          output_rate: p.txSpeed || 0,
          media_type: p.isFiber ? 2 : 1,
          enable: p.enable,
          exception: p.loop !== 0 ? (p.loop === 1 ? '3' : '-1') : '0'
        }
        // esw自环时设置端口使能为0
        if (p.loop) {
          _portInfo.enable = 0
          _portInfo.portType = 'error'
        }
        return _portInfo
      })
      return Object.freeze(_ports)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
.switch-panel {
  min-height: 100px;
  padding: 8px 0;
  width: 100%;
  transition: height 0.3s ease-in;
  position: relative;
  padding-bottom: 15px;
  &--item {
    float: left;
    &.gutter {
      margin-right: 8px;
    }
    &.gutter-l {
      margin-left: 8px;
    }
  }
  &--path {
    position: relative;
    bottom: 0;
    & > div {
      position: absolute;
      border: 1px solid;
      border-top: none;
      height: 10px;
      span {
        background-color: #fff;
        font-size: 12px;
      }
      &.up {
        color: $theme;
        border-color: $theme;
      }
      &.down {
        color: $--color-info;
        border-color: $--color-info;
      }
      &.no-border {
        border: none;
      }
    }
  }
}
</style>
