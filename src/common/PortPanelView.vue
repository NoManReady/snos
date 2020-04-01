<template>
  <div class="port-panel">
    <div class="port-panel--header clearfix">
      <slot name="header"></slot>
    </div>
    <div :class="{'d3-box':show3d}">
      <div class="viewboard"></div>
      <div class="viewborder">
        <div :style="minHeightStyl" class="port-panel--body" v-loading="loading">
          <table class="body-table">
            <tbody>
              <tr :class="[`row_${index}`]" :key="index" v-for="(row,index) in renderPorts">
                <td class="empty"></td>
                <template v-for="p in row">
                  <td :key="`${p.lpid}-${p.phyMediaType}`" v-if="p.empty"></td>
                  <td :key="`${p.lpid}-${p.phyMediaType}`" class="port-panel--item" v-else>
                    <port-panel-view-tip :port="p" :pos="index===1?'bottom':'top'">
                      <port-icon
                        :dot="p.dot"
                        :icon="p.icon"
                        :inner-icon="_getPortInnerIcon(p)"
                        :rotate="index===1"
                        :sub-icon="_getPortSubIcon(p)"
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
                <td class="empty"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="viewboard-shadow"></div>
    </div>
    <div class="port-panel--footer clearfix">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script>
import PortPanelViewTip from './PortPanelViewTip'
import PortIcon from './PortIcon'
import browser from '@/utils/browser'
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
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 面板信息
    panelPorts: {
      type: Array,
      default: () => Object.freeze(window.APP_CAPACITY_SW.port.panel_list)
    },
    // 上联口
    uplink: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    renderPorts() {
      return this.panelPorts.map(row => {
        return row.map((port, index) => {
          if (port && this.ports.length) {
            let _portItem =
              this.ports.find(
                p => p.ifname.toUpperCase() === port.ifname.toUpperCase()
              ) || {}
            let _icon = port.media_type === 1 ? 'upport' : 'guangkou'
            // 光电复用口禁用(设备当前实际模式跟口模式不一样，说明当前口模式不启用)
            let _hybridDisabled =
              _portItem.media_flag === 1 &&
              _portItem.media_type !== port.media_type
            return {
              ..._portItem,
              icon: _icon,
              phyMediaType: port.media_type,
              hybridDisabled: _hybridDisabled,
              // 复合口重写text、enable、portType（设置成天然关闭状态）
              text: _hybridDisabled ? null : _portItem.text,
              exception: _hybridDisabled ? 0 : _portItem.exception,
              dot: _hybridDisabled ? false : _portItem.dot,
              enable: _hybridDisabled ? 0 : _portItem.enable,
              portType: _hybridDisabled ? 'closed' : _portItem.portType
            }
          }
          return { empty: true, span: 1, lpid: -index }
        })
      })
    },
    minHeightStyl() {
      return {
        'min-height': `${this.panelPorts.length * 50 + 16}px`
      }
    },
    // 是否显示面板图
    show3d() {
      if (browser.versions.isIe) {
        return browser.versions.ieVersion > 9
      }
      return true
    }
  },
  methods: {
    // 端口中间图标
    _getPortInnerIcon(port) {
      let _innerIcon = []
      if (!port.hybridDisabled) {
        if (this.uplink.includes(port.lpid)) {
          _innerIcon.push('shanglian')
        }
        if (port.exception) {
          if (port.exception === 3) {
            _innerIcon.push('refresh')
          } else {
            _innerIcon.push('notcertified')
          }
        }
      }
      return _innerIcon
    },
    // 端口下标图标
    _getPortSubIcon(port) {
      let _subIcon = []
      if (!port.hybridDisabled) {
        if (port.poeUp) {
          _subIcon.push('gongdian')
        }
        if (port.poeError) {
          _subIcon.push('bugongdian')
        }
        if (port.block) {
          _subIcon.push('zusai')
        }
      }
      return _subIcon
    }
  }
}
</script>
