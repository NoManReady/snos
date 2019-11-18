<template>
  <div class="port-panel">
    <div class="port-panel--header clearfix">
      <div class="fl">
        <port-icon :hover="false" :size="26" class="vm" direct="v" icon="upport" type="success">
          <template #after>
            <span class="label vm">1G/10G/20G</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport" type="warning">
          <template #after>
            <span class="label vm">10M/100M</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport" type="info">
          <template #after>
            <span class="label vm">断开</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport" type="closed">
          <template #after>
            <span class="label vm">关闭</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport" type="error">
          <template #after>
            <span class="label vm">异常</span>
          </template>
        </port-icon>
      </div>
      <div class="fr port-type--bar">
        <!-- <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport">
          <template #after>
            <span class="label vm">POE供电</span>
          </template>
          <template #inner>
            <i class="rjucd-gongdian fs14 inner-icon"></i>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport">
          <template #after>
            <span class="label vm">供电异常</span>
          </template>
          <template #inner>
            <i class="rjucd-bugongdian fs14 inner-icon"></i>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport">
          <template #after>
            <span class="label vm">堵塞口</span>
          </template>
          <template #inner>
            <i class="rjucd-zusai fs14 inner-icon"></i>
          </template>
        </port-icon>-->
        <port-icon :hover="false" :size="26" class="vm" direct="h" icon="upport" text="1" type="info" v-show="showLag">
          <template #after>
            <span class="label vm" style="display:block;">聚合端口</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport">
          <template #after>
            <span class="label vm">上联口</span>
          </template>
          <template #inner>
            <i class="rjucd-shanglian fs14 inner-icon"></i>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="upport">
          <template #after>
            <span class="label vm">电口</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="26" class="ml5 vm" direct="v" icon="guangkou">
          <template #after>
            <span class="label vm">光口</span>
          </template>
        </port-icon>
      </div>
    </div>
    <div class="port-panel--body" v-loading="loading">
      <table class="body-table">
        <tbody>
          <tr :class="{'up':index===0,'down':index===1}" :key="index" v-for="(row,index) in renderPorts">
            <td class="empty"></td>
            <template v-for="p in row">
              <td :key="p.lpid" style="width:10px;" v-if="p.empty"></td>
              <td :key="p.lpid" v-else>
                <port-panel-view-tip :port="p" pos="top">
                  <port-icon
                    :icon="p.icon"
                    :inner-icon="_getPortInnerIcon(p)"
                    :rotate="index===1"
                    :text="p.text"
                    :type="p.portType"
                    class="vm"
                    direct="v"
                  >
                    <template #before v-if="index===0">
                      <span class="label">{{p.lpid+1}}</span>
                    </template>
                    <template #after v-if="index===1">
                      <span class="label">{{p.lpid+1}}</span>
                    </template>
                  </port-icon>
                </port-panel-view-tip>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div class="port-panel--footer clearfix hide"></div> -->
  </div>
</template>
<script>
import PortPanelViewTip from './PortPanelViewTip'
import PortIcon from './PortIcon'
export default {
  name: 'port-panel-view',
  components: {
    [PortPanelViewTip.name]: PortPanelViewTip,
    [PortIcon.name]: PortIcon
  },
  props: {
    // 端口信息
    ports: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    panelPorts: {
      type: Array,
      default: () => Object.freeze(window.APP_CAPACITY_SW.port.panel_list)
    },
    uplink: {
      type: Array,
      default: () => []
    },
    showLag: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    renderPorts() {
      return this.panelPorts.map(row => {
        return row.map((port, index) => {
          if (port && this.ports.length) {
            let _port =
              this.ports.find(
                p => p.interface === port.ifname || p.lpid === port.lpid
              ) || {}
            _port.interface = port.ifname
            return _port
          }
          return { empty: true, span: 1, lpid: -index }
        })
      })
    }
  },
  methods: {
    _getPortInnerIcon(port) {
      let _innerIcon = null
      if (this.uplink.includes(port.lpid)) {
        _innerIcon = 'shanglian'
      }
      if (port.poe) {
        _innerIcon = 'gongdian'
      }
      if (port.poeError) {
        _innerIcon = 'bugongdian'
      }
      if (port.block) {
        _innerIcon = 'zusai'
      }
      return _innerIcon
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
@import '~@/style/utils/mixins';
.port-panel {
  color: $--color-info;
  font: 10px/18px normal;
  &--item {
    font-size: 18px;
    margin: auto;
    text-align: center;
    vertical-align: middle;
    display: inline-block;
    white-space: nowrap;
  }
  &--header {
    margin-bottom: 5px;
  }
  &--footer {
    margin-top: 5px;
    .link {
      color: $theme;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
    .link ~ .link {
      margin-left: 5px;
    }
  }
  &--body {
    min-height: 118px;
    border: 1px solid $--border-color-base;
    border-radius: $--border-radius-base;
    padding: 8px;
    position: relative;
    user-select: none;
    .body-table {
      td {
        &.empty {
          width: 20px;
        }
      }
    }
  }
}
</style>
