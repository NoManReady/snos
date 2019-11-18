<template>
  <div class="advanced-acl-date">
    <help-alert title="ACL时间">
      <div slot="content">
        <p>
          <b>说明：</b>ACL生效时间目前只支持周期性时间配置，不支持绝对时间配置。
        </p>
      </div>
      <div slot="collapseFoot">
        <h3 class="tit">注意</h3>
        <p>时间一旦在其他地方被引用则无法在本页面被删除，除非解除引用。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          时间列表
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="dateList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            size="small"
            type="primary"
            v-auth="_onAdd"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="small" type="danger" v-auth="_onBatchRemove">批量删除</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
        </div>
      </help-alert>
      <el-table :data="dateList" ref="baseTable" size="mini" stripe>
        <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column align="center" label="时间名称" prop="tmngtName"></el-table-column>
        <el-table-column align="center" label="时间对象">
          <template slot-scope="{row}">
            <acl-date-view :time="row" icon />
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="!_isSelectable(scope.row)" size="mini" type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
            <el-button
              :class="{'c-danger':_isSelectable(scope.row)}"
              :disabled="!_isSelectable(scope.row)"
              size="mini"
              type="text"
              v-auth="{fn:_onBatchRemove,params:scope.row}"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 时间对象modal -->
      <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="baseModalShow" width="700px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="small">
          <el-form-item label="时间名称" prop="tmngtName">
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.tmngtName"
              class="w250"
              placeholder="请输入时间名称"
              v-model="baseModel.tmngtName"
            ></el-input>
          </el-form-item>
          <el-form-item label="时间段：">
            <el-form :model="timeModel" :rules="timeRules" inline ref="timeForm" size="small">
              <el-form-item prop="week">
                <!-- <el-select class="w170" clearable multiple placeholder="请选择" v-model="timeModel.week">
                  <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in weeks"></el-option>
                </el-select>-->
                <treeselect :multiple="true" :options="weeks" style="width:195px;" v-model="timeModel.week" />
              </el-form-item>
              <el-form-item prop="time">
                <el-time-picker
                  :clearable="false"
                  :editable="true"
                  :picker-options="{format:'HH:mm'}"
                  align="center"
                  class="time-select vm w220"
                  end-placeholder="结束时间"
                  format="HH:mm"
                  is-range
                  range-separator="至"
                  start-placeholder="开始时间"
                  v-model="timeModel.time"
                  value-format="HH:mm"
                ></el-time-picker>
              </el-form-item>
              <el-form-item>
                <el-button @click.native="_onAddTimeRange" type="plain">添加</el-button>
                <small class="ml5 c-warning">（添加完时间段，请点击右下角确定按钮保存时间对象。）</small>
              </el-form-item>
            </el-form>
          </el-form-item>
          <el-divider content-position="left">
            <b class="c-success">时间列表</b>
          </el-divider>
          <el-table
            :data="_getTimeArr(baseModel.time)"
            class="el-table__empty-text--warning"
            empty-text="不添加时间范围，默认所有时间。"
            size="mini"
          >
            <el-table-column align="center" label="星期" property="label" width="100"></el-table-column>
            <el-table-column align="center" label="时间段" property="slot">
              <template slot-scope="{row}">
                <div class="pt5 pl5 tl">
                  <el-tag
                    :key="`${f}-${row.value}`"
                    @click="_onTabClick(row,i)"
                    @close="_onTabClose(row,i)"
                    class="mr5 mb5 pointer"
                    closable
                    size="mini"
                    v-for="(f,i) in row.slot"
                  >{{`${f[0]}-${f[1]}`}}</el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click.native="onModalConfirm" size="small" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import { date, time } from '@/model/msw/advanced'
import { TimePicker, Tag, Divider } from 'element-ui'
import { getConnectStrByType } from '@/utils/utils'
import DateView from './DateView'
import formMixins from '@/mixins/formMixins'
import Treeselect from '@riophae/vue-treeselect'

export default {
  name: 'advanced-acl-date',
  components: {
    [TimePicker.name]: TimePicker,
    [Tag.name]: Tag,
    [Divider.name]: Divider,
    [DateView.name]: DateView,
    Treeselect
  },
  data() {
    const uniqueValidator = (rule, value, cb) => {
      if (
        this.dateList.find(
          (date, index) => date.tmngtName === value && index !== this.editIndex
        )
      ) {
        cb(new Error(`时间名称已被使用`))
      }
      cb()
    }
    const slotValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    const timeValidator = (r, v, cb) => {
      if (!v[0] || !v[1]) {
        return cb(new Error('请选择时间范围'))
      }
      let _time1 = v[0].split(':')
      let _time2 = v[1].split(':')
      let _sec1 = parseInt(_time1[0]) * 60 + parseInt(_time1[1])
      let _sec2 = parseInt(_time2[0]) * 60 + parseInt(_time2[1])
      if (_sec1 >= _sec2) {
        return cb(new Error('开始时间需小于结束时间'))
      }
      cb()
    }
    return {
      isLoading: true,
      baseModalShow: false,
      maxLimit: 20,
      editIndex: -1,
      timeModel: time(),
      baseModel: date(),
      baseRules: {
        tmngtName: [
          { required: true, message: '请输入时间名称', whitespace: true },
          {
            validator: nameLengthValidator,
            max: 64
          },
          {
            validator: uniqueValidator
          }
        ],
        slot: [
          { required: true, message: '请添加时间段至时间列表' },
          { validator: slotValidator, message: '请添加时间段至时间列表' }
        ]
      },
      timeRules: {
        week: [{ required: true, message: '请选择星期' }],
        time: [{ validator: timeValidator }]
      },
      dateList: [],
      weeks: Object.freeze([
        { label: '星期一', value: 'mon', id: 'mon', sort: 1 },
        { label: '星期二', value: 'tue', id: 'tue', sort: 2 },
        { label: '星期三', value: 'wed', id: 'wed', sort: 3 },
        { label: '星期四', value: 'thu', id: 'thu', sort: 4 },
        { label: '星期五', value: 'fri', id: 'fri', sort: 5 },
        { label: '星期六', value: 'sat', id: 'sat', sort: 6 },
        { label: '星期日', value: 'sun', id: 'sun', sort: 7 }
      ])
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '添加时间' : '编辑时间'
    }
  },
  created() {
    this._loadDateList()
  },
  methods: {
    // 获取时间对象数组
    _getTimeArr(timeObj) {
      let _timeArr = []
      for (let key in timeObj) {
        if (timeObj[key].length) {
          let _item = this.weeks.find(week => week.value === key)
          _timeArr.push({
            ..._item,
            slot: timeObj[key]
          })
        }
      }
      return Object.freeze(_timeArr.sort((a, b) => a.sort - b.sort))
    },
    // 添加时间片段至列表
    _onAddTimeRange() {
      this.$refs.timeForm.validate(valid => {
        if (valid) {
          let _baseModel = { ...this.baseModel }
          let _timeModel = this.timeModel
          _timeModel.week.forEach(week => {
            let _timeRange = _baseModel.time[week]
            if (!_timeRange) {
              _timeRange = [_timeModel.time]
            } else {
              _timeRange.push(_timeModel.time)
            }
            _baseModel.time[week] = this._reDoTimeRange(_timeRange)
          })
          this.baseModel = _baseModel
          this.$refs.timeForm.resetFields()
        }
      })
    },
    // 重组时间范围
    _reDoTimeRange(timeArr) {
      timeArr = timeArr.map(t => {
        let _time1 = t[0].split(':')
        let _time2 = t[1].split(':')
        let _sec1 = parseInt(_time1[0]) * 60 + parseInt(_time1[1])
        let _sec2 = parseInt(_time2[0]) * 60 + parseInt(_time2[1])
        return [_sec1, _sec2]
      })
      let _set = new Set()
      timeArr.forEach(([a, b]) => {
        while (a <= b) {
          _set.add(a)
          a++
        }
      })
      let _finalStr = getConnectStrByType([..._set], (a, b) => {
        let _s = `${parseInt(a / 60)
          .toString()
          .padStart(2, 0)}:${(a % 60).toString().padStart(2, 0)}`
        let _e = `${parseInt(b / 60)
          .toString()
          .padStart(2, 0)}:${(b % 60).toString().padStart(2, 0)}`
        return [_s, _e]
      })
      return _finalStr
    },
    // tag点击事件
    _onTabClick() {
      // console.log(arguments)
    },
    // tag关闭事件
    _onTabClose(row, index) {
      this.baseModel.time[row.value].splice(index, 1)
    },
    // 加载时间对象列表
    _loadDateList() {
      this.isLoading = true
      this.$api
        .getDateManage()
        .then(d => {
          this.dateList = d
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 移除时间对象
    _onRemoveTIme(index) {
      this.baseModel.timeArray.splice(index, 1)
    },
    // 判断是否可编辑
    _isSelectable(row, index) {
      return row.type === 'user' && row.user == 0
    },
    // 打开时间选择控件
    onOpenTimeSelection(selections, enable) {},
    // 删除NAT
    _onBatchRemove(item) {
      let _items
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
      }
      if (!_items.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除？').then(() => {
        this.isLoading = true
        this.$api
          .setDateManage({ tmngtName: _items.map(ite => ite.tmngtName) }, 'del')
          .then(d => {
            _items.forEach(ite => {
              let _index = this.dateList.findIndex(d => d === ite)
              this.dateList.splice(_index, 1)
            })
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 添加
    _onAdd() {
      this.editIndex = -1
      this.baseModalShow = true
      this.baseModel = date()
      this.timeModel = time()
      this._clearValidate()
      this._clearValidate('timeForm')
    },
    // 编辑
    onEdit(index) {
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = JSON.parse(JSON.stringify(this.dateList[index]))
      this.timeModel = time()
      this._clearValidate()
      this._clearValidate('timeForm')
    },
    // 编辑时间确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          // 清除空数据
          let _model = { ...this.baseModel }
          if (Object.keys(_model.time).length) {
            for (let key in _model.time) {
              if (!_model.time[key].length) {
                delete _model.time[key]
              }
            }
          }
          // 比较数据是否修改
          if (
            JSON.stringify(_model) ===
            JSON.stringify(this.dateList[this.editIndex])
          ) {
            this.baseModalShow = false
            return
          }
          // 提交数据
          this.isLoading = true
          let _isnew = this.editIndex === -1
          this.$api
            .setDateManage({ list: [_model] }, _isnew ? 'add' : 'update')
            .then(() => {
              if (_isnew) {
                this.dateList.push({ ..._model })
              } else {
                this.dateList.splice(this.editIndex, 1, { ..._model })
              }
            })
            .finally(() => {
              this.baseModalShow = false
              setTimeout(() => {
                this.isLoading = false
              }, 300)
            })
        }
      })
    }
  }
}
</script>
<style lang="scss">
@import '~@/style/utils/variable';
@import '~@/style/utils/mixins';
.el-table__empty-text--warning {
  .el-table__empty-text {
    color: $--color-warning;
  }
}
</style>
