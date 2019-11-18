<template>
  <div class="port-panel">
    <div class="port-panel--header clearfix">
      <div class="fl">
        <port-icon :hover="false" :size="24" class="vm" direct="h" icon="upport" type="info">
          <template #after>
            <span class="label vm">可选端口</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="24" class="vm ml5" direct="h" icon="upport" type="closed">
          <template #after>
            <span class="label vm">不可选端口</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="24" class="vm ml5" direct="h" icon="upport" type="success">
          <template #after>
            <span class="label vm">选中端口</span>
          </template>
        </port-icon>
      </div>
      <div class="fr port-type--bar">
        <port-icon :hover="false" :size="22" class="vm" direct="h" icon="upport" text="1" type="info" v-show="showLag">
          <template #after>
            <span class="label vm">聚合端口</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="22" class="vm ml5" direct="h" icon="upport" type="info">
          <template #after>
            <span class="label vm">上联口</span>
          </template>
          <template #inner>
            <i class="rjucd-shanglian fs14 inner-icon"></i>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="22" class="vm ml5" direct="h" icon="upport" type="info">
          <template #after>
            <span class="label vm">电口</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="22" class="vm ml5" direct="h" icon="guangkou" type="info">
          <template #after>
            <span class="label vm">光口</span>
          </template>
        </port-icon>
      </div>
    </div>
    <div class="port-panel--body" ref="containerRef">
      <table class="body-table">
        <tbody>
          <tr :class="{'up':index===0,'down':index===1}" :key="index" v-for="(row,index) in renderPorts">
            <td class="empty"></td>
            <template v-for="p in row">
              <td :key="p.lpid" style="width:10px;" v-if="p.empty"></td>
              <td :key="p.lpid" v-else>
                <port-icon
                  :data-index="p.lpid"
                  :disabled="p.disabled"
                  :icon="p.media_type===2?'guangkou':'upport'"
                  :inner-icon="_getPortInnerIcon(p)"
                  :rotate="index===1"
                  :text="p.ag"
                  :type="p.disabled?'closed':(p.selected?'success':'info')"
                  @click.native="_onToggle(p)"
                  class="vm"
                  direct="v"
                >
                  <template #before v-if="index===0">
                    <span class="label" v-show="p.lpid!==undefined">{{p.lpid+1}}</span>
                  </template>
                  <template #after v-if="index===1">
                    <span class="label" v-show="p.lpid!==undefined">{{p.lpid+1}}</span>
                  </template>
                </port-icon>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      <div :style="rangeStyl" class="select-range--box" ref="rangeRef" v-show="isRangeActive"></div>
    </div>
    <div class="port-panel--footer clearfix">
      <div class="fl c-warning" v-if="mutilple">
        <strong>提示：</strong>
        <small style="font-style: italic;">可按住左键拖拽选取多个端口</small>
      </div>
      <div class="fr">
        <el-button :disabled="!enable" @click.native="_onSelectAll" size="mini" style="padding:0;" type="text" v-if="mutilple">全选</el-button>
        <el-button :disabled="!enable" @click.native="_onReverseAll" size="mini" style="padding:0;" type="text" v-if="mutilple">反选</el-button>
        <el-button :disabled="!enable" @click.native="_onClear" size="mini" style="padding:0;" type="text">取消选择</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import PortIcon from './PortIcon'
export default {
  name: 'port-panel',
  components: {
    [PortIcon.name]: PortIcon
  },
  props: {
    // 选中值
    selecteds: {
      type: Array | String,
      default: () => []
    },
    // 是否可多选
    mutilple: {
      type: Boolean,
      default: false
    },
    // 是否开启勾选功能
    enable: {
      type: Boolean,
      default: true
    },
    // 最终返回值处理
    handleData: {
      type: Function,
      default: ids => ids.sort((a, b) => a - b)
    },
    // 聚合口是否联动
    hasAgg: {
      type: Boolean,
      default: false
    },
    // 禁用值
    disableds: {
      type: Array,
      default: () => []
    },
    // 是否展示lag标识
    showLag: {
      type: Boolean,
      default: true
    },
    groupCols: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      begin: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      rangeStyl: {},
      isRangeActive: false,
      hasMove: false,
      tempSelectes: Object.freeze([]),
      panelPorts: Object.freeze(window.APP_CAPACITY_SW.port.panel_list)
    }
  },
  mounted() {
    if (this.enable && this.mutilple) {
      document.addEventListener('mousedown', this._onMousedown, false)
      document.addEventListener('mousemove', this._onMousemove, false)
      document.addEventListener('mouseup', this._onMouseup, false)
    }
  },
  beforeDestroy() {
    if (this.enable && this.mutilple) {
      document.removeEventListener('mousedown', this._onMousedown)
      document.removeEventListener('mousemove', this._onMousemove)
      document.removeEventListener('mouseup', this._onMouseup)
    }
  },
  computed: {
    ...mapGetters('switcher', ['logicPort', 'lagPortsMap', 'piMap', 'uplink']),
    // 真正选中的值
    realSelectes() {
      let _selectes = this.selecteds
      if (!this.mutilple) {
        _selectes = [this.selecteds]
      }
      return this._getRealIds(_selectes)
    },
    realDisableds() {
      return Object.freeze(this._getRealIds(this.disableds))
    },
    renderPorts() {
      let _panelPort = this.panelPorts.map(row => {
        return row.map((port, index) => {
          if (port) {
            let _realPort =
              this.logicPort.find(p => p.interface === port.ifname) || {}
            // 判断是否选中
            let _selected =
              this.realSelectes.includes(_realPort.lpid) ||
              this.tempSelectes.includes(_realPort.lpid)
            let _disabled = this.realDisableds.includes(_realPort.lpid)
            let _ag =
              this.showLag && _realPort.aggregate_port > 0
                ? _realPort.aggregate_port
                : null
            return {
              ..._realPort,
              selected: _selected,
              disabled: _disabled,
              ag: _ag
            }
          }
          return { empty: true, span: 1, lpid: -index }
        })
      })
      return Object.freeze(_panelPort)
    },
    allPorts() {
      return Object.freeze(
        this.renderPorts.reduce((ports, next) => {
          return [...ports, ...next]
        }, [])
      )
    }
  },
  methods: {
    _getPortInnerIcon(port) {
      let _innerIcon = null
      if (this.uplink.lpid.includes(port.lpid)) {
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
    },
    // 获取真实选中值
    _getRealIds(selectes) {
      return selectes.reduce((a, b) => {
        let _lagPorts = this.lagPortsMap[b] || [b]
        return [...a, ..._lagPorts]
      }, [])
    },
    // 处理选中值
    _handleSelectes(select) {
      // 判断是否多选
      if (!this.mutilple) {
        return select
      }
      if (!this.hasAgg) {
        return this.handleData(select)
      }
      let _allSelects = select.reduce((all, pid) => {
        // 为聚合口直接加入
        if (pid > this.logicPort.length - 1) {
          all.push(pid)
        } else {
          // 获取端口id对应的聚合口id，无聚合口则加入端口id
          let _port = this.logicPort.find(logic => logic.lpid === pid)
          all.push(this.piMap[`lag${_port.aggregate_port}`] || pid)
        }
        return all
      }, [])
      // 去重
      let _set = new Set([..._allSelects])
      return this.handleData([..._set])
    },
    // 配置选中值
    _hookSelecteds(ids) {
      this.$emit('update:selecteds', this._handleSelectes(ids))
    },
    // 全选
    _onSelectAll() {
      let _selecteds = this.logicPort
        .filter(p => !this.realDisableds.includes(p.lpid))
        .map(p => p.lpid)
      this._hookSelecteds(_selecteds)
    },
    // 反选
    _onReverseAll() {
      let _selecteds = this.logicPort
        .filter(
          p =>
            !this.realSelectes.includes(p.lpid) &&
            !this.realDisableds.includes(p.lpid)
        )
        .map(p => p.lpid)
      this._hookSelecteds(_selecteds)
    },
    // 清空
    _onClear() {
      this._hookSelecteds([])
    },
    /**
     * 选中格切换
     */
    _onToggle(item) {
      if (this.enable && !this.realDisableds.includes(item.lpid)) {
        // 获取点击值（有agg则获取ag）
        let _select = item.lpid
        // 开启lag联动并且具有聚合口则获取聚合口id
        if (this.hasAgg && item.aggregate_port > 0) {
          _select = this.piMap[`lag${item.aggregate_port}`]
        }
        if (this.mutilple) {
          let _selecteds = [...this.selecteds]
          let _index = this.selecteds.findIndex(s => {
            return s === _select
          })
          if (_index > -1) {
            _selecteds.splice(_index, 1)
          } else {
            _selecteds.push(_select)
          }
          this._hookSelecteds(_selecteds)
        } else {
          this._hookSelecteds(_select)
        }
      }
    },
    /**
     * 判断元素的包含关系
     */
    _contains(refNode, childNode) {
      if (typeof refNode.contains == 'function') {
        return refNode.contains(childNode)
      } else if (typeof refNode.compareDocumentPosition == 'function') {
        return !!(refNode.compareDocumentPosition(childNode) & 16)
      } else {
        let _parentNode = childNode.parentNode
        do {
          if (_parentNode === refNode) {
            return true
          } else {
            _parentNode = _parentNode.parentNode
          }
        } while (_parentNode !== null)
        return false
      }
    },
    /**
     * 滚动窗口距离(所有父层)
     */
    _getScrollContainerDistance() {
      let _parent = this.$parent
      let _parentContainer = _parent.$el || _parent
      let _scrollTop = 0
      let _scrollLeft = 0
      while (_parentContainer) {
        _scrollTop += _parentContainer.scrollTop || 0
        _scrollLeft += _parentContainer.scrollLeft || 0
        _parentContainer = _parentContainer.parentNode
      }
      return {
        _scrollTop,
        _scrollLeft
      }
    },
    /**
     * 获取点击点真实距离
     */
    _getScrollDistance(e) {
      let { _scrollTop, _scrollLeft } = this._getScrollContainerDistance()
      return {
        x: (e.clientX || e.touches[0].clientX) + _scrollLeft,
        y: (e.clientY || e.touches[0].clientY) + _scrollTop
      }
    },
    /**
     * 重置选框及mouse状态
     */
    _resetRangeState() {
      this.isRangeActive = false
      this.begin = this.end = { x: 0, y: 0 }
      this.tempSelectes = []
      this.hasMove = false
    },
    /**
     * 判断鼠标是否位于判断范围内
     */
    _hasInWrap(e) {
      let _target = e.target
      let _container = this.$refs.containerRef
      return this._contains(_container, _target)
    },
    /**
     * 鼠标点击mousedown
     */
    _onMousedown(e) {
      if (!this.enable) {
        return
      }
      //e.preventDefault()
      if (this._hasInWrap(e)) {
        this.begin = this.end = this._getScrollDistance(e)
        this._setRangePosition(e)
        this.isRangeActive = true
      }
    },
    /**
     * 鼠标移动
     */
    _onMousemove(e) {
      if (!this.enable) {
        return
      }
      if (!this.isRangeActive) {
        return
      }
      this.hasMove = true
      if (this._hasInWrap(e)) {
        e.preventDefault()
        this.end = this._getScrollDistance(e)
        this._setRangePosition(e)
      } else {
        this._resetRangeState()
      }
    },
    /**
     * 鼠标结束
     */
    _onMouseup(e) {
      if (!this.enable) {
        return
      }
      e.preventDefault()
      if (this._hasInWrap(e)) {
        //do something
      }
      if (this.hasMove) {
        this._hookSelecteds(
          [...new Set([...this.tempSelectes, ...this.selecteds])].sort()
        )
      }
      this._resetRangeState()
    },
    /**
     * 设置选框的position
     */
    _setRangePosition(e) {
      let _rangeRef = this.$refs.rangeRef
      let _containerRef = this.$refs.containerRef
      let _opt = _containerRef.getBoundingClientRect()
      let { _scrollTop, _scrollLeft } = this._getScrollContainerDistance()
      let _left = 0
      let _top = 0
      if (this.end.x < this.begin.x) {
        _left = this.end.x - _opt.left - _scrollLeft
      } else {
        _left = this.begin.x - _opt.left - _scrollLeft
      }
      if (this.end.y < this.begin.y) {
        _top = this.end.y - _opt.top - _scrollTop
      } else {
        _top = this.begin.y - _opt.top - _scrollTop
      }
      let _width = Math.abs(this.end.x - this.begin.x)
      let _height = Math.abs(this.end.y - this.begin.y)
      this.rangeStyl = {
        left: `${_left}px`,
        top: `${_top}px`,
        width: `${_width}px`,
        height: `${_height}px`
      }
      if (_height || _width) {
        this._setSelectedItem()
      }
    },
    /**
     * 设置选中单元格数据
     */
    _setSelectedItem(e) {
      let _containerRef = this.$refs.containerRef
      let _items = _containerRef.querySelectorAll('[data-index]')
      let { _scrollTop, _scrollLeft } = this._getScrollContainerDistance()
      // 确定选框横纵坐标范围（1比2小）
      let _bx1 = this.begin.x
      let _bx2 = this.end.x
      let _by1 = this.begin.y
      let _by2 = this.end.y
      if (_bx1 > _bx2) {
        ;[_bx1, _bx2] = [_bx2, _bx1]
      }
      if (_by1 > _by2) {
        ;[_by1, _by2] = [_by2, _by1]
      }
      // 过滤单元格
      let _filterItems = Array.from(_items).filter(td => {
        let _range = td.getBoundingClientRect()
        let _x1 = _range.left + _scrollLeft
        let _x2 = _x1 + _range.width
        let _y1 = _range.top + _scrollTop
        let _y2 = _y1 + _range.height
        if (_x2 < _bx1 || _x1 > _bx2 || _y2 < _by1 || _y1 > _by2) {
          return false
        }
        return true
      })
      let _selecteds = []
      _filterItems.forEach(ite => {
        let _lpid = ite.getAttribute('data-index')
        if (_lpid) {
          _lpid = +_lpid
          let _item = this.allPorts.find(p => p.lpid === _lpid)
          if (_item && !_item.disabled) {
            _selecteds.push(_item.lpid)
          }
        }
      })
      this.tempSelectes = Object.freeze(_selecteds)
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
    border: 1px solid $--border-color-base;
    border-radius: $--border-radius-base;
    padding: 8px;
    // margin-top: 8px;
    position: relative;
    user-select: none;
    .select-range--box {
      position: absolute;
      border: 1px dashed $--color-info;
    }
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
