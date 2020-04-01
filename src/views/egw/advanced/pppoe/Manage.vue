<template>
  <div class="vpn-l2tp-tunnel">
    <help-alert :title="$t('egw.auth.user_manager')" json-key="pppoeManageJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.pppoe.user_manager_list')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="list.length>=MAX_NUM||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="_onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button
            :disabled="isLoading"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onDel"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{MAX_NUM}}</b>
            </i18n> {{$t('devlist.user_cnt') + ' '}}<b class="c-warning mlr5">{{userNum}}</b>
          </div>
        </help-alert>
        <el-table :data="list" ref="baseTable" size="medium" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('egw.username')" align="center" prop="name"></el-table-column>
          <el-table-column :label="$t('egw.password')" align="center" prop="passwd"></el-table-column>
          <el-table-column :label="$t('egw.pppoe.deal_time')" align="center" prop="dealline"></el-table-column>
          <el-table-column :label="$t('phrase.remark')" align="center" prop="note"></el-table-column>
          <el-table-column :label="$t('phrase.status')" align="center" prop="enable">
             <template slot-scope="scope">{{scope.row.enable==='1'?$t('egw.start_using'):$t('egw.pppoe.forbid')}}</template>
          </el-table-column>
          <el-table-column :label="$t('action.ope')" align="center">
                <template slot-scope="scope">
                  <el-button
                    :disabled="isLoading"
                    size="medium"
                    type="text"
                    v-auth="{fn:_onEdit,params:scope.$index}"
                  >{{$t('action.edit')}}</el-button>
                  <el-button
                    :disabled="isLoading"
                    size="medium"
                    type="text"
                    v-auth="{fn:_onDel,params:scope.row}"
                  >{{$t('action.delete')}}</el-button>
                </template>
              </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
      <el-form
        :model="baseModel"
        :rules="baseRules"
        :validate-on-rule-change="false"
        label-width="120px"
        ref="baseForm"
      >
        <el-form-item :label="$t('egw.username')" prop="name">
          <el-input :disabled="editIndex !== -1" class="w300" v-model="baseModel.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.password')" prop="passwd">
          <el-input class="w300" v-model="baseModel.passwd"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.deal_time')">
          <el-date-picker
            required
            v-model="baseModel.dealline"
            type="date"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            :placeholder="$t('systool.select_date')">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('egw.l2tp.addr_zone')" prop="ippool_name">
          <el-input disabled class="w300" v-model="baseModel.ippool_name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.remark')" prop="note">
          <el-input class="w300" v-model="baseModel.note"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.status')" prop="enable">
          <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button @click="_onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modelFn from '@/model'
import { DatePicker } from "element-ui";
export default {
  name: 'pppoe-manage',
  data() {
    const nameSameValid = (r, v, cb) => {
      let _index = this.list.findIndex(d => d.name === v)
      if (this.nameMap[v] && this.editIndex !== _index)
        return cb(new Error(this.$t('egw.pppoe.username_is_exists')))
      cb()
    }
    const nameValidator = (rule, value, cb) => {
      if (/[\/\\\[\]:;\|=,\+\*\?\<\>@"'&]/.test(value)) {
        cb(new Error(this.$t('egw.auth.name_symbol_invalid')))
      } else if (value.replace(/[^\x00-\xff]/g, '01').length > 32) {
        cb(new Error(this.$t('egw.auth.name_length_invalid')))
      }
      cb()
    }
    return {
      userNum: 0,
      pickerOptions: { // 限制时间不让选择今天以前的
      　　disabledDate(time) {
      　　　　return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
      　　}
      },
      list: [],
      MAX_NUM: this.$store.getters.capacity.gateway.pppoe_server_maxnum || 15,
      isLoading: false,
      baseModel: modelFn.pppoeManageFn(),
      poolList: [],
      editIndex: -1,
      baseModalShow: false,
      baseRules: {
        name: [
          {required: true, message: I18N.t('egw.username_is_required')},
          { validator: nameValidator },
          { validator: nameSameValid }
        ],
        passwd: [
          {required: true, message: I18N.t('egw.password_is_required')},
          { max: 16, message: this.$t('egw.auth.password_length_invalid') }
        ],
        note: [
          { validator: nameValidator }
        ]
      }
    }
  },
  created() {
    this._initPage()
  },
  components: {
    [DatePicker.name]: DatePicker
  },
  computed: {
    isAddManage() {
      return this.editIndex === -1
    },
    modalTitle() {
      return this.isAddManage ? I18N.t('action.add') : I18N.t('action.edit')
    },
    nameMap() {
      let _map = {};
      this.list.forEach(p => (_map[p.name] = true));
      return _map;
    }
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getPppoeManage()
      this.list = _res.list || []
      this.userNum =  _res.count || 0
      let _resPool = await this.$api.getPppoePool()
      this.poolList = _resPool.list || []
      this.baseModel.ippool_name = 'pppoe_pool'
    },
    // 清除验证信息
    _clearValidate() {
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate();
      });
    },
    // 添加
    _onAdd() {
      this.baseModel = modelFn.pppoeManageFn()
      this.baseModel.ippool_name = 'pppoe_pool'
      this.editIndex = -1
      this.baseModalShow = true
      this._clearValidate()
    },
    // 编辑
    _onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = { ...this.list[index] }
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert(I18N.t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(I18N.t('tip.confirm_delete'), I18N.t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        let delList = []
        _items.forEach(ite => {
          let _index = this.list.findIndex(d => d === ite)
          delList.push({name:this.list[_index].name})
        })
        this.$api
          .delPppoeManage({ list:delList })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
            })
            this.$message({
              message: I18N.t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 提交数据
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    _onSubmit() {
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.list[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _manageData = {}
      if (this.isAddManage) {
        _manageData = { ...this.baseModel }
      } else {
        _manageData = {"new": { ...this.baseModel}, "old": this.baseModel.name}
      }
      this.$api
        .setPppoeManage(_manageData, this.isAddManage)
        .then(d => {
          if (this.isAddManage) {
            this.list.push(_manageData)
          } else {
            this.list.splice(this.editIndex, 1, _manageData.new)
          }
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    }
  }
}
</script>