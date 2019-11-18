<template>
  <div class="auth-account">
    <help-alert json-key="accountJson" title="账号认证">
      <template slot="content">
        <div class="mt10">1、开启账号认证，新增账号密码。</div>
        <div class="mt10">2、用户在认证界面输入步骤1配置的账号密码，认证通过后即可上网。</div>
        <div class="c-warning">
          <div class="mt10">
            <b>设备能够联通互联网的情况下终端才会弹出认证界面。</b>
          </div>
          <div class="mt10">
            <b>
              如果EAP的IP在认证范围内，请将EAP的MAC添加到
              <a @click="$parent.tabValue='4'" class="c-success pointer">“免认证”</a>的MAC白名单中。
            </b>
          </div>
        </div>
      </template>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
      <el-form-item label="账号认证">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.en"></el-switch>
      </el-form-item>
      <template v-if="baseModel.en === '1'">
        <el-form-item label="账号数">
          <label>{{pageModel.allItem.length}}</label>
        </el-form-item>
        <el-form-item class="is-required" label="认证IP/范围" prop="authList">
          <el-form-item
            :class="{mb20:index!==baseModel.authList.length-1}"
            :key="index"
            :prop="`authList[${index}]`"
            :rules="ipValidate(item,index)"
            v-for="(item,index) in baseModel.authList"
          >
            <el-input class="w300" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.authList[index]"></el-input>
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
        <el-button class="w200" type="primary" v-auth="onSubmit">保存配置</el-button>
      </el-form-item>
    </el-form>
    <template v-if="baseModel.en === '1'">
      <div class="box">
        <div class="box-header">
          <span class="box-header-tit">
            账号管理
            <small></small>
          </span>
          <div class="fr">
            <div class="vm mr10">
              <el-input class="w200" placeholder="账户名称查询" size="small" v-model="searchKey">
                <el-button @click.native="onAccountSearch" slot="append">查询</el-button>
              </el-input>
            </div>
            <el-button icon="el-icon-plus" size="small" type="primary" v-auth="onAddAccount">新增</el-button>
            <el-button icon="el-icon-delete" size="small" type="primary" v-auth="onDelAccount">批量删除</el-button>
          </div>
        </div>
        <help-alert :show-icon="false" title>
          <div slot="content">
            最大支持配置
            <b class="c-warning mlr5">{{MAX_NUM}}</b>个账号。
          </div>
        </help-alert>
        <el-table :data="pageList" ref="accountTable" row-key="username" size="mini" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="账号" prop="username"></el-table-column>
          <el-table-column align="center" label="密码" prop="password"></el-table-column>
          <el-table-column align="center" label="mac地址" prop="mac">
            <template slot-scope="scope">
              <p :key="m" v-for="m of scope.row.mac||[]">{{m}}</p>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button @click="onEditAccount(scope.$index)" type="text">修改</el-button>
              <el-button type="text" v-auth="{fn:onDelAccount,params:scope.row}">删除</el-button>
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
      <el-form :model="accountModel" :rules="accountRules" label-width="160px" ref="accountForm">
        <el-form-item label="账户名称" prop="username">
          <input name="advancedAccountName" type="text" v-show="false" />
          <el-input
            :disabled="editIndex!==-1"
            :title="accountModel.username"
            class="w250"
            name="advancedAccountName"
            placeholder="账户名称"
            v-model="accountModel.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="账户密码" prop="password">
          <input name="advancedAccountPassword" type="text" v-show="false" />
          <el-input class="w250" name="advancedAccountPassword" placeholder="账户密码" type="text" v-model="accountModel.password"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="accountModalShow = false">取 消</el-button>
        <el-button :loading="isAddLoading" @click="onModalConfirm" type="primary">确 定</el-button>
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
        cb(new Error(`不能包含[/\[]:;|=,\+\*?\<\>@"'&`))
      } else if (value.replace(/[^\x00-\xff]/g, '01').length > 32) {
        cb(new Error(`长度不能超过32个字符，中文占2个字符！`))
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
        cb(new Error(`账户名称已被使用`))
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
          { required: true, message: '账户名称不能为空' },
          { validator: nameValidator },
          { validator: uniqueValidator }
        ],
        password: [
          { required: true, message: '账户密码不能为空' },
          { max: 16, message: '密码最多16位' },
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
      return this.editIndex !== -1 ? '编辑账户' : '添加账户'
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
        this.$message.warning(`最多只能添加 ${this.MAX_NUM} 个账号`)
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
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除?').then(() => {
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
              message: '删除成功',
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
                message: '配置成功',
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
              message: '配置成功',
              type: 'success'
            })
          })
        }
      })
    }
  }
}
</script>
