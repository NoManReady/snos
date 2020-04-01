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
            size="medium"
            type="primary"
            v-auth="_onAdd"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="medium" type="danger" v-auth="_onBatchRemove">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
        </div>
      </help-alert>
      <el-table :data="dateList" ref="baseTable" size="medium" stripe>
        <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column align="center" label="时间名称" prop="name">
          <template slot-scope="scope">
            {{scope.row.name || scope.row.tmngtName}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="时间对象">
          <template slot-scope="{row}">
            <acl-date-view :time="row" icon />
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="!_isSelectable(scope.row)" size="medium" type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
            <el-button
              :class="{'c-danger':_isSelectable(scope.row)}"
              :disabled="!_isSelectable(scope.row)"
              size="medium"
              type="text"
              v-auth="{fn:_onBatchRemove,params:scope.row}"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 时间对象modal -->
      <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="baseModalShow" width="700px">
        <el-divider content-position="left">
          <b class="c-success">时间编辑</b>
        </el-divider>
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item label="时间名称" prop="tmngtName">
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.tmngtName"
              class="w250"
              placeholder="请输入时间名称"
              v-model="baseModel.tmngtName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-form :model="timeModel" :rules="timeRules" label-width="160px" ref="timeForm" size="medium">
          <el-form-item label="星期" prop="week">
            <el-select :disabled="timeRangeEditing" class="w300" clearable multiple placeholder="请选择" v-model="timeModel.week">
              <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in weeks"></el-option>
            </el-select>
            <!-- <treeselect :multiple="true" :options="weeks" style="width:195px;" v-model="timeModel.week" /> -->
          </el-form-item>
          <el-form-item label="时间范围" required>
            <el-form-item class="vm" prop="begin" style="margin-bottom:0;">
              <el-time-picker
                :clearable="true"
                :editable="true"
                @change="_timeChange('end')"
                class="w170"
                format="HH:mm"
                placeholder="开始时间"
                v-model="timeModel.begin"
                value-format="HH:mm"
              ></el-time-picker>
            </el-form-item>
            <span class="vm mr5 ml5">至</span>
            <el-form-item class="vm" prop="end" style="margin-bottom:0;">
              <el-time-picker
                :clearable="true"
                :editable="true"
                @change="_timeChange('begin')"
                class="w170"
                format="HH:mm"
                placeholder="结束时间"
                v-model="timeModel.end"
                value-format="HH:mm"
              ></el-time-picker>
            </el-form-item>
          </el-form-item>
          <el-form-item>
            <el-button @click.native="_onAddTimeRange" class="w120" type="primary">{{timeRangeEditing?'修改':'添加'}}</el-button>
            <el-button @click.native="_onCancelTimeRange" class="w120" type="default" v-show="timeRangeEditing">取消</el-button>
            <small class="ml5 c-warning">（添加完时间段，请点击右下角确定按钮保存时间对象。）</small>
          </el-form-item>
        </el-form>
        <el-divider content-position="left">
          <b class="c-success">时间列表</b>
        </el-divider>
        <el-table :data="timeList" class="el-table__empty-text--warning" empty-text="不添加时间范围，默认所有时间。" size="medium">
          <el-table-column align="center" label="星期" property="label" width="100"></el-table-column>
          <el-table-column align="center" label="时间段" property="slot">
            <template slot-scope="{row}">
              <div class="pt5 pl5 tl">
                <el-tag
                  :closable="_timeRangeClosable(row.value,i)"
                  :disable-transitions="true"
                  :key="`${f}-${row.value}`"
                  @click="_onTabClick(row,i)"
                  @close="_onTabClose(row,i)"
                  class="mr5 mb5 pointer"
                  effect="plain"
                  hit
                  size="mini"
                  v-for="(f,i) in row.slot"
                >{{`${f[0]}-${f[1]}`}}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" class="w120" size="medium">取 消</el-button>
          <el-button :loading="isLoading" @click.native="onModalConfirm" class="w120" size="medium" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import { date, time } from '@/model/msw/advanced'
import { TimePicker, Tag, Divider } from 'element-ui'
import { mergeArray } from '@/utils/utils'
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
      if (!v) {
        return cb(new Error(r.requireMsg))
      }
      let { begin, end } = this.timeModel
      let _time1 = begin.split(':')
      let _time2 = end.split(':')
      let _sec1 = parseInt(_time1[0]) * 60 + parseInt(_time1[1])
      let _sec2 = parseInt(_time2[0]) * 60 + parseInt(_time2[1])
      if (_sec1 >= _sec2) {
        return cb(new Error(r.rangeMsg))
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
        begin: [
          {
            validator: timeValidator,
            requireMsg: '请选择开始时间',
            rangeMsg: '开始时间需小于结束时间'
          }
        ],
        end: [
          {
            validator: timeValidator,
            requireMsg: '请选择结束时间',
            rangeMsg: '结束时间需大于开始时间'
          }
        ]
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
      ]),
      editRangeOption: null
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '添加时间' : '编辑时间'
    },
    timeList() {
      let _timeArr = []
      let _timeObj = this.baseModel.time
      for (let key in _timeObj) {
        let _rangeList = _timeObj[key]
        if (_rangeList.length) {
          let _item = this.weeks.find(week => week.value === key)
          _timeArr.push({
            ..._item,
            slot: [..._rangeList]
          })
        }
      }
      return Object.freeze(_timeArr.sort((a, b) => a.sort - b.sort))
    },
    timeRangeEditing() {
      return Array.isArray(this.editRangeOption)
    }
  },
  created() {
    this._loadDateList()
  },
  methods: {
    // 手否可关闭
    _timeRangeClosable(week, index) {
      if (this.editRangeOption) {
        let [_week, _index] = this.editRangeOption
        if (_week === week && _index === index) {
          return false
        }
      }
      return true
    },
    // 手动校验
    _timeChange(prop) {
      if (this.$refs.timeForm) {
        this.$refs.timeForm.validateField(prop)
      }
    },
    // 取消时间编辑
    _onCancelTimeRange() {
      this.editRangeOption = null
      this.$refs.timeForm.resetFields()
    },
    // 添加时间片段至列表
    _onAddTimeRange() {
      this.$refs.timeForm.validate(valid => {
        if (valid) {
          let _baseModel = { ...this.baseModel }
          let _timeModel = this.timeModel
          let _range = [_timeModel.begin, _timeModel.end]
          if (this.editRangeOption) {
            let [w, i] = this.editRangeOption
            let _tr = _baseModel.time[w]
            _tr.splice(i, 1, _range)
            this.$set(_baseModel.time, w, this._reDoTimeRange2(_tr))
          } else {
            _timeModel.week.forEach(week => {
              let _timeRange = _baseModel.time[week]
              if (!_timeRange) {
                _timeRange = [_range]
              } else {
                _timeRange.push(_range)
              }
              this.$set(_baseModel.time, week, this._reDoTimeRange2(_timeRange))
            })
          }
          this.baseModel = _baseModel
          this._onCancelTimeRange()
        }
      })
    },
    // 时间戳转时间格式
    _stampToFormat(a, b) {
      let _s = `${parseInt(a / 60)
        .toString()
        .padStart(2, 0)}:${(a % 60).toString().padStart(2, 0)}`
      let _e = `${parseInt(b / 60)
        .toString()
        .padStart(2, 0)}:${(b % 60).toString().padStart(2, 0)}`
      return [_s, _e]
    },
    // 时间格式转时间戳
    _formatToStamp(format) {
      let _time1 = format[0].split(':')
      let _time2 = format[1].split(':')
      let _sec1 = parseInt(_time1[0]) * 60 + parseInt(_time1[1])
      let _sec2 = parseInt(_time2[0]) * 60 + parseInt(_time2[1])
      return [_sec1, _sec2]
    },
    // 重组时间范围（控件复杂度高）
    // _reDoTimeRange(timeArr) {
    //   let _timeRange = timeArr.map(this._formatToStamp)
    //   let _set = new Set()
    //   _timeRange.forEach(([a, b]) => {
    //     while (a <= b) {
    //       _set.add(a)
    //       a++
    //     }
    //   })
    //   let _finalStr = mergeArray([..._set], this._stampToFormat)
    //   return _finalStr
    // },
    // 重组时间范围
    _reDoTimeRange2(timeArr) {
      let _timeOrderRange = timeArr
        .map(this._formatToStamp)
        .sort(([begin1, end1], [begin2, end2]) => {
          let _diff = begin1 - begin2
          let _abs = Math.abs(_diff)
          return _diff / _abs
        })
      return _timeOrderRange
        .reduce((prev, next) => {
          let _last = prev[prev.length - 1]
          if (_last) {
            let [begin1, end1] = _last
            let [begin2, end2] = next
            if (end1 < begin2) {
              prev.push(next)
            } else {
              _last[1] = Math.max(end1, end2)
            }
          } else {
            prev.push(next)
          }
          return prev
        }, [])
        .map(range => this._stampToFormat(...range))
    },
    // tag点击事件
    _onTabClick(row, index) {
      let [begin, end] = row.slot[index]
      this.timeModel = {
        week: [row.value],
        begin,
        end
      }
      this.editRangeOption = [row.value, index]
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
