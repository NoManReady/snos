<template>
  <div class="behavior-date-manage">
    <help-alert json-key="behaviorDateManageJson" title="时间列表">
      <div slot="collapseFoot">
        <h3 class="tit">注意</h3>
        <p class="desc">时间一旦在其他地方被引用则无法在本页面被删除，除非解除引用。</p>
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
            v-auth="onAdd"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="small" type="primary" v-auth="onDel">批量删除</el-button>
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
        <el-table-column align="center" label="时间名称" prop="tmngtName"></el-table-column>
        <el-table-column align="center" label="工作时间" prop="time">
          <template slot-scope="scope">
            <i @click="onOpenTimeSelection(scope.row.time,false)" class="el-icon-date f-theme pointer"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.type==='system'" type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
            <el-button :disabled="!_isSelectable(scope.row)" type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 时间对象modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item label="时间名称" prop="tmngtName">
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.tmngtName"
              class="w250"
              placeholder="请输入时间名称"
              v-model="baseModel.tmngtName"
            ></el-input>
          </el-form-item>
          <!-- <el-form-item class="hide" label="时间设置" prop="time_mode">
            <el-radio-group v-model="baseModel.time_mode">
              <el-radio label="calendar">日历</el-radio>
              <el-radio label="input">手动设置</el-radio>
            </el-radio-group>
          </el-form-item>-->
          <el-form-item class="is-required" label="日历" prop="time" v-show="baseModel.type==='user'">
            <span @click="onOpenTimeSelection(baseModel.time,true)" class="f-theme pointer">
              <i class="el-icon-date"></i>
              选择时间
            </span>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false">取 消</el-button>
          <el-button :disabled="isLoading" @click="onModalConfirm" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import { judgeIpRangeRules } from '@/utils/commonValidates'
export default {
  name: 'BehaviorDateManage',
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
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      isLoading: true,
      baseModalShow: false,
      maxLimit: 20,
      editIndex: -1,
      baseModel: model.behaviorDateManageFn(),
      baseRules: {
        tmngtName: [
          { required: true, message: '请输入时间名称', whitespace: true },
          {
            validator: nameLengthValidator,
            size: 64,
            message: '时间名称不能超过64个字符，中文占3字符'
          },
          {
            validator: uniqueValidator
          }
        ],
        time: [{ validator: timeValidator, message: '请选择时间范围' }]
      },
      dateList: [],
      selections: {}
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
    // 判断是否可编辑
    _isSelectable(row, index) {
      return row.type === 'user' && row.user == 0
    },
    // 打开时间选择控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.baseModel.time = d
        this.$refs.baseForm.validateField('time')
      })
    },
    // 删除NAT
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
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
    // 添加NAT
    onAdd() {
      this.editIndex = -1
      this.baseModalShow = true
      this.baseModel = model.behaviorDateManageFn()
      this._clearValidate()
    },
    // 编辑NAT
    onEdit(index) {
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = JSON.parse(JSON.stringify(this.dateList[index]))
      this._clearValidate()
    },
    // 编辑时间确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          if (
            JSON.stringify(this.baseModel) ===
            JSON.stringify(this.dateList[this.editIndex])
          ) {
            this.baseModalShow = false
            return
          }
          this.isLoading = true
          let _isnew = this.editIndex === -1
          this.$api
            .setDateManage(
              { list: [this.baseModel] },
              _isnew ? 'add' : 'update'
            )
            .then(() => {
              if (_isnew) {
                this.dateList.push({ ...this.baseModel })
              } else {
                this.dateList.splice(this.editIndex, 1, { ...this.baseModel })
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
<style lang="scss" scoped>
</style>
