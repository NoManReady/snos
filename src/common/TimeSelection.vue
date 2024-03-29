<template>
  <div class="time-selection">
    <div class="time-selection--header" v-if="showHeader">
      <slot name="timeSelection_title">
        <h2>{{ title }}</h2>
      </slot>
    </div>
    <div class="time-selection-wrap" ref="timeSelectionWrap">
      <div :style="yaxisStyl" class="time-selection--yaxis" ref="timeSelectionYaxis">
        <div
          :class="['yaxis-picker', `time-selection--yaxis_item_${index}`]"
          :key="row.value"
          :style="yaxisItemStyl"
          @click="_onTableAxisBetweenClick(index, 'row', $event)"
          v-for="(row, index) in rows"
        >{{ row.label }}</div>
      </div>
      <div :style="{ 'margin-left': `${yaxisWidth}px` }" class="time-selection--main">
        <table class="time-selection-picker">
          <thead ref="timeSelectionPickerHeader">
            <tr v-if="columns.length">
              <th
                :class="[
                  'header-picker',
                  `time-selection-picker--header_item_${index}`
                ]"
                :key="col.value"
                :style="{ height: `${headerHeight}px` }"
                @click="_onTableAxisClick(index, 'col', $event)"
                v-for="(col, index) in columns"
              >{{ col.label }}</th>
            </tr>
          </thead>
          <tbody ref="timeSelectionArea">
            <tr :key="`${row.value}-${i}`" v-for="(row, i) in rows">
              <template v-if="i < rows.length - 1">
                <td
                  :class="{ begin: enable }"
                  :data-col="j"
                  :data-row="i"
                  :key="col.value"
                  @click="
                    _onTimePickerClick({
                      row: i,
                      col: j,
                      value: [`${row.value}-${rows[i + 1].value}`, col.value]
                    })
                  "
                  class="time-selection-picker--bordered"
                  v-for="(col, j) in columns"
                >
                  <div
                    :class="[
                      'time-picker',
                      `time-selection-picker--body_item_${j}`,
                      { 'is-active': _hasActive(i, j) }
                    ]"
                    :style="timeItemStyl"
                  ></div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="time-selection--range" ref="timeSelectionRange"></div>
    </div>
    <div class="time-selection--footer" v-if="showFooter">
      <slot name="timeSelection_legend">
        <h2>{{ legend }}</h2>
      </slot>
    </div>
  </div>
</template>
<script>
import browser from '@/utils/browser'
export default {
  name: 'ComponentTimeSelection',
  props: {
    // 行头数据（value,label对象）
    rows: {
      type: Array,
      default: () =>
        Array.from({ length: 25 }).map((_, i) => {
          let _value = `${i.toString().padStart(2, '0')}:00`
          if (i === 24) {
            _value = `${(i - 1).toString().padStart(2, '0')}:59`
          }
          return {
            value: _value,
            label: _value
          }
        })
    },
    // 列头数据（value,label对象）
    columns: {
      type: Array,
      default: () => [
        { value: 'mon', label: I18N.t('comp.week[0]') },
        { value: 'tue', label: I18N.t('comp.week[1]') },
        { value: 'wed', label: I18N.t('comp.week[2]') },
        { value: 'thu', label: I18N.t('comp.week[3]') },
        { value: 'fri', label: I18N.t('comp.week[4]') },
        { value: 'sat', label: I18N.t('comp.week[5]') },
        { value: 'sun', label: I18N.t('comp.week[6]') }
      ]
    },
    // 初始选中数据（数组标识每个单元格索引，对象标识每种数据的范围）
    selections: {
      type: [Array, Object],
      default: () => []
    },
    // 表头title
    title: {
      type: String,
      default: 'PickerComponentTitle'
    },
    // 表尾title
    legend: {
      type: String,
      default: 'PickerComponentLegend'
    },
    // item单元格高度
    itemHeight: {
      type: Number,
      default: 20
    },
    // header单元格高度
    headerHeight: {
      type: Number,
      default: 32
    },
    // yAxis宽度
    yaxisWidth: {
      type: Number,
      default: 50
    },
    // 是否显示header
    showHeader: {
      type: Boolean,
      default: true
    },
    // 是否显示footer
    showFooter: {
      type: Boolean,
      default: true
    },
    // 行头是否可点击
    rowEnable: {
      type: Boolean,
      default: true
    },
    // 列头是否可点击
    colEnable: {
      type: Boolean,
      default: true
    },
    // 控件是否可编辑
    enable: {
      type: Boolean,
      default: true
    },
    // 数据排序规则，x标识行排序，y标识列数据排序
    sortDirective: {
      type: String,
      validator(v) {
        return ['x', 'y'].indexOf(v) > -1
      },
      default: 'x'
    }
  },
  data() {
    return {
      begin: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 0
      },
      isRangeActive: false,
      datas: [],
      isMobile: browser.versions.mobile
    }
  },
  computed: {
    // 选区单元格样式
    timeItemStyl() {
      return {
        height: `${this.itemHeight - 1}px`,
        'line-height': `${this.itemHeight - 1}px`
      }
    },
    // y轴单元格样式
    yaxisItemStyl() {
      return {
        height: `${this.itemHeight}px`,
        'line-height': `${this.itemHeight}px`
      }
    },
    // y轴样式
    yaxisStyl() {
      return {
        width: `${this.yaxisWidth}px`,
        'margin-top': `${this.headerHeight - this.itemHeight / 2}px`
      }
    }
  },
  watch: {
    selections: {
      handler() {
        this._setIndexSelected()
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (this.enable) {
      if (this.isMobile) {
        document.addEventListener('touchstart', this._onMousedown, false)
        document.addEventListener('touchmove', this._onMousemove, false)
        document.addEventListener('touchend', this._onMouseup, false)
      } else {
        document.addEventListener('mousedown', this._onMousedown, false)
        document.addEventListener('mousemove', this._onMousemove, false)
        document.addEventListener('mouseup', this._onMouseup, false)
      }
    }
  },
  beforeDestroy() {
    if (this.enable) {
      if (this.isMobile) {
        document.removeEventListener('touchstart', this._onMousedown)
        document.removeEventListener('touchmove', this._onMousemove)
        document.removeEventListener('touchend', this._onMouseup)
      } else {
        document.removeEventListener('mousedown', this._onMousedown)
        document.removeEventListener('mousemove', this._onMousemove)
        document.removeEventListener('mouseup', this._onMouseup)
      }
    }
  },
  methods: {
    /**
     * 判断是否选中状态
     */
    _hasActive(row, col) {
      return this.datas.includes(`${row}-${col}`)
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
        x: _scrollLeft + (e.clientX || e.touches[0].clientX),
        y: _scrollTop + (e.clientY || e.touches[0].clientY)
      }
    },
    /**
     * 表头表列中间点击事件(before表示上半部，after表示下半部)
     */
    _onTableAxisBetweenClick(value, type, e) {
      if (this.enable && this[`${type}Enable`]) {
        // 选中行label比格子数多1
        let _diff = type === 'row' ? 1 : 0
        let _MAX = this[`${type}s`].length - 1 - _diff
        let _MIN = 0
        let _targetRange = e.target.getBoundingClientRect()
        let _pos = null
        if (type === 'row') {
          _pos =
            e.clientY - _targetRange.top - _targetRange.height / 2 > 0
              ? 'after'
              : 'before'
        }
        if (_pos === 'before') {
          value = Math.max(value - 1, _MIN)
        }
        if (_pos === 'after') {
          value = Math.min(value, _MAX)
        }
        this._onTableAxisClick(value, type, e)
      }
    },
    /**
     * 表头表列点击事件
     */
    _onTableAxisClick(value, type, e) {
      if (this.enable && this[`${type}Enable`]) {
        let _timeSelectionArea = this.$refs.timeSelectionArea
        let _tds = _timeSelectionArea.querySelectorAll(
          `[data-${type}="${value}"]`
        )
        this._selectAllByTds(_tds, e)
      }
    },
    /**
     * 根据选中所有td范围
     */
    _selectAllByTds(tds, e) {
      let { _scrollTop, _scrollLeft } = this._getScrollContainerDistance()
      // 配置虚拟数据（start与end）
      let _range1 = tds[0].getBoundingClientRect()
      let _left1 = _range1.left + _scrollLeft
      let _x1 = _left1 + Math.random() * _range1.width
      let _top1 = _range1.top + _scrollTop
      let _y1 = _top1 + Math.random() * _range1.height
      this.begin = { x: _x1, y: _y1 }

      let _range2 = tds[tds.length - 1].getBoundingClientRect()
      let _left2 = _range2.left + _scrollLeft
      let _x2 = _left2 + Math.random() * _range2.width
      let _top2 = _range2.top + _scrollTop
      let _y2 = _top2 + Math.random() * _range2.height
      this.end = { x: _x2, y: _y2 }
      // 设置选中区域数据
      this._setSelectedItem(e)

      // 还原数据
      this.begin = this.end = { x: 0, y: 0 }
    },
    /**
     * 重置选框及mouse状态
     */
    _resetRangeState() {
      this.isRangeActive = false
      let _timeSelectionRange = this.$refs.timeSelectionRange
      _timeSelectionRange.style.display = 'none'
      this.begin = this.end = { x: 0, y: 0 }
    },
    /**
     * 鼠标按下事件
     */
    _onMousedown(e) {
      if (!this.isMobile) {
        e.preventDefault()
      }
      if (!this._hasInWrap(e)) {
        return
      }
      // document.documentElement.style.cursor="move"
      this.isRangeActive = true
      let _timeSelectionRange = this.$refs.timeSelectionRange
      _timeSelectionRange.style.display = 'block'
      this.begin = this.end = this._getScrollDistance(e)
      this._setRangePosition(e)
    },
    /**
     * 鼠标移动事件
     */
    _onMousemove(e) {
      // preventDefault(解决微信内置浏览器里，下拉无法捕获 touchEnd 事件:https://www.cnblogs.com/xwant/p/8213545.html)
      // 手机端在点击确定按钮时不可以移动手指，否则触发touchmove事件preventDefault导致点击事件无效
      e.preventDefault()
      if (!this.isRangeActive) {
        return
      }
      if (!this._hasInWrap(e)) {
        this._resetRangeState()
        return
      }
      this.end = this._getScrollDistance(e)
      this._setRangePosition(e)
    },
    /**
     * 鼠标放起事件
     */
    _onMouseup(e) {
      if (!this.isMobile) {
        e.preventDefault()
      }
      // 结束时在范围内
      if (this._hasInWrap(e)) {
        this._setSelectedItem(e)
      }
      this._resetRangeState()
    },
    /**
     * 设置选中单元格数据
     */
    _setSelectedItem(e) {
      let _timeSelectionArea = this.$refs.timeSelectionArea
      let _tds = _timeSelectionArea.querySelectorAll('td')
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
      let _filterTds = Array.from(_tds).filter(td => {
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
      // 判断所选单元格是否全部是is-active状态
      let _isAllActive = _filterTds.every(td => {
        let _classList = td
          .querySelector('div')
          .getAttribute('class')
          .split(' ')
        return _classList.includes('is-active')
      })
      // 全部active状态做反选操作（全部移除），否则全部添加然后做去重操作
      let _selections = [...this.datas]
      if (_isAllActive) {
        _filterTds.forEach(td => {
          let _value = `${td.getAttribute('data-row')}-${td.getAttribute(
            'data-col'
          )}`
          let _index = _selections.findIndex(s => s === _value)
          if (_index >= 0) {
            _selections.splice(_index, 1)
          }
        })
      } else {
        _filterTds.forEach(td => {
          _selections.push(
            `${td.getAttribute('data-row')}-${td.getAttribute('data-col')}`
          )
        })
      }
      this.datas = [...new Set(_selections)].sort()
    },
    /**
     * 判断鼠标是否位于判断范围内
     */
    _hasInWrap(e) {
      let _timeSelectionWrap = this.$refs.timeSelectionWrap
      let _timeSelectionYaxis = this.$refs.timeSelectionYaxis
      let _timeSelectionPickerHeader = this.$refs.timeSelectionPickerHeader
      let _target = e.target
      return (
        this._contains(_timeSelectionWrap, _target) &&
        !this._contains(_timeSelectionYaxis, _target) &&
        !this._contains(_timeSelectionPickerHeader, _target)
      )
    },
    /**
     * 设置选框的position
     */
    _setRangePosition(e) {
      let _timeSelectionRange = this.$refs.timeSelectionRange
      let _timeSelectionArea = this.$refs.timeSelectionArea
      let _opt = _timeSelectionArea.getBoundingClientRect()
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
      _timeSelectionRange.style.left = `${_left + this.yaxisWidth}px`
      _timeSelectionRange.style.top = `${_top + this.headerHeight}px`
      _timeSelectionRange.style.width = `${Math.abs(
        this.end.x - this.begin.x
      )}px`
      _timeSelectionRange.style.height = `${Math.abs(
        this.end.y - this.begin.y
      )}px`
    },
    /**
     * picker格子点击事件
     */
    _onTimePickerClick({ row, col, value }) {
      this.$emit('time-picker', { row, col, value })
    },
    /**
     * 设置选中单元格数据-索引值（根据范围数据：key为列值，value为行范围值数组）
     */
    _setIndexSelected() {
      let _datas = []
      if (Array.isArray(this.selections)) {
        _datas = [...this.selections]
      } else {
        for (let _k in this.selections) {
          let _kIndex = this.columns.findIndex(col => col.value === _k)
          if (_kIndex === undefined) {
            continue
          }
          let _value = this.selections[_k]
          for (let _t = 0; _t < _value.length; _t++) {
            let _rang = _value[_t]
            let _s = _rang[0]
            let _e = _rang[1]
            let _sIndex =
              this.rows.findIndex(
                row => row.value === _s || row.value === `${_s}:00`
              ) || 0
            let _eIndex =
              this.rows.findIndex(
                row => row.value === _e || row.value === `${_e}:00`
              ) || 0
            while (_sIndex < _eIndex) {
              _datas.push(`${_sIndex}-${_kIndex}`)
              _sIndex++
            }
          }
        }
      }
      this.datas = _datas
    },
    /**
     * 全选
     */
    setAllSelected() {
      let _timeSelectionArea = this.$refs.timeSelectionArea
      let _tds = _timeSelectionArea.querySelectorAll('td')
      this._selectAllByTds(_tds)
    },
    /**
     * 获取选中单元格(索引值)
     */
    getIndexSelected() {
      return this.datas
    },
    /**
     * 获取选中单元格(真实值)
     */
    getSelected() {
      let _datasMap = {}
      this.datas.forEach(d => {
        let [row, col] = d.split('-')
        let _key = this.columns[+col].value
        if (!_datasMap[_key]) {
          _datasMap[_key] = []
        }
        _datasMap[_key].push([this.rows[+row].value, this.rows[+row + 1].value])
      })
      return _datasMap
    },
    /**
     * 获取合并时间范围
     */
    getMergeSelected() {
      let _datasMap = this.getSelected()
      for (let _key in _datasMap) {
        let _k_datas = _datasMap[_key]
        _datasMap[_key] = []
        let _uni_datas = Array.prototype.concat
          .apply([], _k_datas)
          .sort((a, b) => {
            // 获取对应索引值，按索引值排序
            let _sIndex = this.rows.findIndex(row => row.value === a) || 0
            let _eIndex = this.rows.findIndex(row => row.value === b) || 0
            return _sIndex - _eIndex
          })
        let _flatArr = []
        _uni_datas.forEach((ite, i, arr) => {
          if (arr.indexOf(ite) === arr.lastIndexOf(ite)) {
            _flatArr.push(ite)
          }
        })
        for (let _i = 0, _len = _flatArr.length; _i < _len; _i++) {
          if ((_i + 1) % 2 === 0) {
            _datasMap[_key].push([_flatArr[_i - 1], _flatArr[_i]])
          }
        }
      }
      return _datasMap
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../style/utils/_mixins.scss';
@import '../style/utils/_variable.scss';
.time-selection {
  height: 100%;
  width: 100%;
  position: relative;
  @extend %clearfix;
  &--header,
  &--footer {
    text-align: center;
    h2 {
      color: $--color-text-regular;
      font-size: 150%;
      margin: 0.5em 0;
    }
  }
  &--header {
  }
  &--footer {
  }
  &--range {
    position: absolute;
    border: 2px dashed #b2b2b2;
    z-index: 10;
    display: none;
  }
  &-wrap {
    @extend %clearfix;
    position: relative;
    .time-picker,
    .yaxis-picker {
      width: 100%;
      height: 100%;
      text-align: center;
      color: $--color-text-regular;
    }
    .header-picker {
      // height: 32px;
    }
    .time-picker {
      border: 1px solid #fff;
      cursor: pointer;
      &.is-active {
        background-color: $--color-success;
      }
    }
  }
  &--yaxis {
    // width: 50px;
    // margin-top: 21px;
    float: left;
    font-size: 12px;
  }
  &--main {
    // margin-left: 50px;
  }
  &-picker {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    &--bordered {
      border: 1px solid $--border-color-base;
    }
  }
}
</style>
