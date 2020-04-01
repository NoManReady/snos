<template>
  <div class="auth-account">
    <help-alert json-key="accountJson" :title="$t('egw.auth.auth_user')">
      <template slot="content">
        <div class="mt10">1.{{$t('egw.auth.add_user_open_admin')}}</div>
        <div class="mt10">2.{{$t('egw.auth.pass_part1_allow_surfing')}}</div>
        <div class="c-warning">
          <div class="mt10">
            <b>{{$t('egw.auth.open_by_net')}}</b>
          </div>
          <div class="mt10">
            <b>
              <i18n path="egw.auth.erp_mac_to_white">
                <a @click="$parent.tabValue='4'" class="c-success pointer">{{$t('egw.auth.certification_free')}}</a>
              </i18n>
            </b>
          </div>
        </div>
      </template>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
      <el-form-item :label="$t('egw.auth.auth_user')">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.en"></el-switch>
      </el-form-item>
      <template v-if="baseModel.en === '1'">
        <el-form-item :label="$t('egw.auth.auth_number')">
          <label>{{pageModel.allItem.length}}</label>
        </el-form-item>
        <el-form-item class="is-required" :label="$t('egw.auth.auth_ip_or_range')" prop="authList">
          <el-form-item
            :class="{mb20:index!==baseModel.authList.length-1}"
            :key="index"
            :prop="`authList[${index}]`"
            :rules="ipValidate(item,index)"
            v-for="(item,index) in baseModel.authList"
          >
            <el-input class="w300" :placeholder="$t('wan.ip_range_example')" v-model="baseModel.authList[index]"></el-input>
            <el-button @click="onDelAuthIpList(index)" size="medium" type="text" v-if="baseModel.authList.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button
              @click="onAddAuthIpList"
              size="medium"
              type="text"
              v-if="index === baseModel.authList.length - 1 && baseModel.authList.length < 5"
            >
              <i class="el-icon-plus"></i>
            </el-button>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button class="w160" type="primary" v-auth="onSubmit">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
    <template v-if="baseModel.en === '1'">
      <div class="box">
        <div class="box-header">
          <span class="box-header-tit">
            {{$t('egw.auth.user_manager')}}
            <small></small>
          </span>
          <div class="fr">
            <div class="vm mr10">
              <el-input class="w300" :placeholder="$t('egw.auth.username_search')" size="medium" v-model="searchKey">
                <el-button @click.native="onAccountSearch" slot="append">{{$t('phrase.search')}}</el-button>
              </el-input>
            </div>
            <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="onAddAccount">{{$t('action.add')}}</el-button>
            <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDelAccount">{{$t('action.patch_delete')}}</el-button>
          </div>
        </div>
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="egw.auth.username_add_any">
                <b class="c-warning mlr5">{{MAX_NUM}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table :data="pageList" ref="accountTable" row-key="username" size="medium" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('egw.username')" prop="username"></el-table-column>
          <el-table-column align="center" :label="$t('egw.password')" prop="password"></el-table-column>
          <el-table-column align="center" :label="$t('egw.mac')" prop="mac">
            <template slot-scope="scope">
              <p :key="m" v-for="m of scope.row.mac||[]">{{m}}</p>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('action.ope')">
            <template slot-scope="scope">
              <el-button @click="onEditAccount(scope.$index)" size="medium" type="text">{{$t('action.edit')}}</el-button>
              <el-button size="medium" type="text" v-auth="{fn:onDelAccount,params:scope.row}">{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page.sync="pageModel.pageIndex"
          :page-size="pageModel.pageSize"
          :page-sizes="pageModel.pageSizes"
          :total="pageTotal"
          @current-change="onCurrentChange"
          @size-change="_onSizeChange"
          background
          class="mt20"
          layout="total, sizes, prev, pager, next, jumper"
          v-if="pageSearchList.length"
        ></el-pagination>
      </div>
    </template>
    <!-- 账户编辑modal -->
    <el-dialog :title="modalTitle" :visible.sync="accountModalShow" @open="onAccountOpen" width="550px">
      <el-form :model="accountModel" :rules="accountRules" label-width="160px" ref="accountForm" size="medium">
        <el-form-item :label="$t('egw.auth.username')" prop="username">
          <input name="advancedAccountName" type="text" v-show="false" />
          <el-input
            :disabled="editIndex!==-1"
            :title="accountModel.username"
            class="w250"
            name="advancedAccountName"
            :placeholder="$t('egw.auth.username')"
            v-model="accountModel.username"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.auth.password')" prop="password">
          <input name="advancedAccountPassword" type="text" v-show="false" />
          <el-input class="w250" name="advancedAccountPassword" :placeholder="$t('egw.auth.password')" type="text" v-model="accountModel.password"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="accountModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button :loading="isAddLoading" @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  nameLengthValidator,
  passwdValidator,
  macValidator
} from '@/utils/rules'
import pageMixins from '@/mixins/pageMixins'
import { judgeIpRangeRules } from '@/utils/commonValidates'
import model from '@/model'
export default {
  name: 'Account',
  data() {
    const nameValidator = (rule, value, cb) => {
      if (/[\/\\\[\]:;\|=,\+\*\?\<\>@"'&]/.test(value)) {
        cb(new Error(this.$t('egw.auth.name_symbol_invalid')))
      } else if (value.replace(/[^\x00-\xff]/g, '01').length > 32) {
        cb(new Error(this.$t('egw.auth.name_length_invalid')))
      }
      cb()
    }
    const uniqueValidator = (rule, value, cb) => {
      if (
        this.pageModel.allItem.find(
          (item, index) =>
            item.username === value &&
            index !== this.getRealIndex(this.editIndex)
        )
      ) {
        cb(new Error(this.$t('egw.auth.username_is_used')))
      }
      cb()
    }
    return {
      MAX_NUM: 200,
      allAuthList: [],
      baseModel: {
        authList: [''],
        en: '0'
      },
      isAddLoading: false,
      baseRules: {},
      accountModel: model.advancedAccountFn(),
      accountRules: {
        username: [
          { required: true, message: this.$t('egw.auth.username_is_required') },
          { validator: nameValidator },
          { validator: uniqueValidator }
        ],
        password: [
          { required: true, message: this.$t('egw.auth.password_is_required') },
          { max: 16, message: this.$t('egw.auth.password_length_invalid') },
          { validator: passwdValidator }
        ]
      },
      searchKey: '',
      editIndex: -1,
      accountModalShow: false
    }
  },
  mixins: [pageMixins],
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? this.$t('egw.auth.username_edit') : this.$t('egw.auth.username_add')
    }
  },
  methods: {
    // 加载账户认证信息
    async _loadList() {
      let _result = await this.$api.getAccountAuth()
      if (_result.authList.length === 0) {
        _result.authList = ['']
      }
      this.baseModel.authList = _result.authList
      this.baseModel.en = _result.en
      this.allAuthList = _result.allAuthList || []
      return _result.userList
    },
    // IP范围验证数组
    ipValidate(_, index) {
      return judgeIpRangeRules(
        this.baseModel.authList.concat(this.allAuthList),
        index
      )
    },
    // 账户modal打开事件
    async onAccountOpen() {
      await this.$nextTick()
      this.$refs.accountForm.clearValidate()
    },
    // 账户查询
    onAccountSearch() {
      this.searchListFuzzy(this.searchKey, 'username')
    },
    // 添加IP范围
    onAddAuthIpList() {
      this.baseModel.authList.push('')
    },
    // 删除IP范围
    onDelAuthIpList(index) {
      this.baseModel.authList.splice(index, 1)
    },
    // 新增账户
    onAddAccount() {
      if (this.pageModel.allItem.length >= this.MAX_NUM) {
        this.$message.warning( this.$t('egw.auth.username_add_any',{num:this.MAX_NUM}))
        return
      }
      this.accountModalShow = true
      this.editIndex = -1
      this.accountModel = model.advancedAccountFn()
    },
    // 编辑账户
    onEditAccount(index) {
      this.accountModalShow = true
      this.editIndex = index
      this.accountModel = { ...this.pageList[index] }
    },
    //删除账户
    onDelAccount(item) {
      let _items = this.$refs.accountTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.$api
          .setAccountAuthUser({
            username: _items.map(ite => ite.username),
            op: 'delete'
          })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.pageList.findIndex(d => d === ite)
              this.removeList(_index)
            })
            this.$message({
              message: this.$t('tip.del_success'),
              type: 'success'
            })
          })
      })
    },
    // 编辑账户确认
    onModalConfirm() {
      this.$refs.accountForm.validate(valid => {
        if (valid) {
          this.isAddLoading = true
          let _op = this.editIndex === -1 ? 'add' : 'modify'
          if (
            _op === 'modify' &&
            JSON.stringify(this.accountModel) ===
              JSON.stringify(this.pageList[this.editIndex])
          ) {
            this.accountModalShow = false
            return
          }
          let _postData = { ...this.accountModel, op: _op }
          delete _postData.mac
          this.$api
            .setAccountAuthUser(_postData)
            .then(d => {
              if (_op === 'add') {
                this.addList({ ...this.accountModel })
              } else {
                this.editList(this.editIndex, {
                  ...this.accountModel
                })
              }
              this.$message({
                message: this.$t('tip.edit1_success'),
                type: 'success'
              })
            })
            .finally(() => {
              this.accountModalShow = false
              this.isAddLoading = false
            })
        }
      })
    },
    // 提交数据
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.setAccountAuth(this.baseModel).then(d => {
            this.$message({
              message: this.$t('tip.edit1_success'),
              type: 'success'
            })
          })
        }
      })
    }
  }
}
</script>
