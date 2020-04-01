<template>
  <div class="behavior-date-manage">
    <help-alert :title="$t('egw.DataManage.times_tab')" json-key="behaviorDateManageJson">
      <div slot="collapseFoot">
        <h3 class="tit">{{$t('phrase.notice')}}</h3>
        <p class="desc">{{$t('egw.DataManage.times_tab_tip')}}</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.DataManage.times_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="dateList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button
            :disabled="isLoading"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="onDel"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="egw.limit_num_tip">
            <b class="c-warning mlr5">{{maxLimit}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="dateList" ref="baseTable" size="medium" stripe>
        <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('egw.DataManage.times_name')" align="center" prop="name">
          <template slot-scope="scope">
            {{scope.row.name || scope.row.tmngtName}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.DataManage.times_job')" align="center" prop="time">
          <template slot-scope="scope">
            <i @click="onOpenTimeSelection(scope.row.time,false)" class="el-icon-date f-theme pointer"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.type==='system'"
              size="medium"
              type="text"
              v-auth="{fn:onEdit,params:scope.$index}"
            >{{$t('action.edit')}}</el-button>
            <el-button
              :disabled="!_isSelectable(scope.row)"
              size="medium"
              type="text"
              v-auth="{fn:onDel,params:scope.row}"
            >{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 时间对象modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.DataManage.times_name')" prop="tmngtName">
            <el-input
              :disabled="editIndex!==-1"
              :placeholder="$t('egw.DataManage.enter_time_name')"
              :title="baseModel.tmngtName"
              class="w250"
              v-model="baseModel.tmngtName"
            ></el-input>
          </el-form-item>
          <!-- <el-form-item class="hide" label="时间设置" prop="time_mode">
            <el-radio-group v-model="baseModel.time_mode">
              <el-radio label="calendar">日历</el-radio>
              <el-radio label="input">手动设置</el-radio>
            </el-radio-group>
          </el-form-item>-->
          <el-form-item :label="$t('egw.calendar')" class="is-required" prop="time" v-show="baseModel.type==='user'">
            <span @click="onOpenTimeSelection(baseModel.time,true)" class="f-theme pointer">
              <i class="el-icon-date"></i>
              {{$t('egw.accessCtrl.select_time')}}
            </span>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button :disabled="isLoading" @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
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
        cb(new Error(this.$t('egw.DataManage.times_name_is_has')))
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
          {
            required: true,
            message: this.$t('egw.DataManage.enter_time_name'),
            whitespace: true
          },
          {
            validator: nameLengthValidator,
            size: 64,
            message: this.$t('egw.DataManage.invalid_times_name')
          },
          {
            validator: uniqueValidator
          }
        ],
        time: [
          {
            validator: timeValidator,
            message: this.$t('egw.select_time_range')
          }
        ]
      },
      dateList: [],
      selections: {}
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1
        ? this.$t('egw.DataManage.times_add')
        : this.$t('egw.DataManage.times_edit')
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
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.isLoading = true
        this.$api
          .setDateManage({ tmngtName: _items.map(ite => ite.tmngtName) }, 'del')
          .then(d => {
            _items.forEach(ite => {
              let _index = this.dateList.findIndex(d => d === ite)
              this.dateList.splice(_index, 1)
            })
            this.$message({
              message: this.$t('tip.del_success'),
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
</script>s
<style lang="scss" scoped>
</style>
