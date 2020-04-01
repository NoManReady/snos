<template>
  <div class="user-account">
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          账户管理
          <small class="ml10 c-warning fs14">
            最多可配置
            <b class="c-success" style="font-weight: normal;">{{max_limit}}</b>个账户
          </small>
        </span>
        <div class="fr">
          <el-button icon="el-icon-add" plain size="medium" type="primary" v-auth="_onAdd">{{$t('action.add')}}</el-button>
        </div>
      </div>
    </div>
    <el-table :data="accountList" ref="baseTable" size="medium" stripe>
      <el-table-column :label="'账户名称'" align="center" prop="name"></el-table-column>
      <el-table-column :label="'账户密码'" align="center" prop="passwd"></el-table-column>
      <el-table-column :label="$t('action.ope')" align="center">
        <template slot-scope="{row,$index}">
          <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
          <el-button size="medium" type="text" v-auth="{fn:_onDel,params:$index}">{{$t('action.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :close-on-click-modal="false"
      :title="modalTitle"
      :visible.sync="baseModalShow"
      @open="_clearValidate"
      append-to-body
      width="700px"
    >
      <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
        <el-form-item :label="'账户名称'" prop="name">
          <el-input :disabled="editIndex!==-1" class="w300" v-model="baseModel.name"></el-input>
        </el-form-item>
        <el-form-item :label="'账户密码'" prop="passwd">
          <el-input class="w300" v-model="baseModel.passwd"></el-input>
        </el-form-item>
        <el-form-item :label="'权限菜单'" prop="page">
          <div class="page-box">
            <el-tree
              :data="pages"
              :default-checked-keys="baseModel.page"
              :props="defaultProps"
              @check="_onCheck"
              default-expand-all
              highlight-current
              node-key="id"
              ref="tree"
              show-checkbox
            ></el-tree>
          </div>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click.native="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button
          :loading="isLoading"
          @click.native="_onModalConfirm"
          class="w120"
          size="medium"
          type="primary"
        >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { Tree } from 'element-ui'
import formMixins from '@/mixins/formMixins'
import { webPasswdValidator } from '@/utils/rules'
export default {
  name: 'user-account',
  components: {
    [Tree.name]: Tree
  },
  mixins: [formMixins],
  data() {
    const nameValidator = (r, v, cb) => {
      if (v === 'admin') {
        return cb(new Error('admin账户不可配置'))
      }
      let _index = this.userNames.findIndex(user => user === v)
      if (_index >= 0 && _index !== this.editIndex) {
        return cb(new Error(`${v}账户已配置`))
      }
      cb()
    }
    return {
      max_limit: APP_CAPACITY.account_number || 3,
      accountList: [],
      baseModalShow: false,
      editIndex: -1,
      isLoading: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      baseModel: {
        name: '',
        passwd: '',
        page: []
      },
      baseRules: {
        name: [
          { required: true, message: '请输入账户名称' },
          { validator: nameValidator }
        ],
        passwd: [
          { required: true, message: I18N.t('systool.new_no_empty') },
          { validator: webPasswdValidator },
          { min: 8, max: 31, message: I18N.t('quickmacc.manage_pass_rule') }
        ],
        page: [{ required: true, message: '请选择账户的权限菜单' }]
      }
    }
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1
        ? I18N.t('action.add')
        : I18N.t('action.edit')
    },
    pages() {
      return this.walkData(window.APP_ACCOUNT_CTRL, [])
    },
    userNames() {
      return Object.freeze(this.accountList.map(user => user.name))
    }
  },
  created() {
    this._onLoad()
  },
  methods: {
    walkData(data = [], copy = []) {
      data.forEach(d => {
        if (d.path !== 'egw_account' && !d.hidden) {
          let _node = {
            label: d.t ? I18N.t(d.t) : d.label,
            id: d.fullPath
          }
          if (d.children && d.children.length) {
            _node.children = this.walkData(d.children)
          }
          copy.push(_node)
        }
      })
      return copy
    },
    async _onLoad() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'multiuser'
        })
        this.accountList = _result.list.map(ac => {
          let _passwd
          try {
            _passwd = this.$decry(ac.passwd)
          } catch (error) {
            _passwd = ac.passwd
          }
          return {
            ...ac,
            passwd: _passwd
          }
        })
      } catch (error) {
        this.$log(error)
      }
    },
    _onAdd() {
      if (this.accountList.length >= this.max_limit) {
        this.$message.warning('配置账户已达上限')
        return
      }
      this.editIndex = -1
      this.baseModalShow = true
      this.baseModel = {
        name: '',
        passwd: '',
        page: []
      }
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys([])
      })
    },
    _onEdit(index) {
      this.editIndex = index
      this.baseModel = this.accountList[this.editIndex]
      this.baseModalShow = true
    },
    _onCheck(_, { checkedKeys }) {
      this.baseModel.page = checkedKeys.filter(Boolean)
    },
    async _onDel(index) {
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        this.isLoading = true
        let _data = this.accountList[index]
        await this.$api.cmd('devConfig.del', {
          module: 'multiuser',
          data: { name: _data.name }
        })
        this.$message.success(I18N.t('tip.del_success'))
        this.accountList.splice(index, 1)
      } catch (error) {}
      this.isLoading = false
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          try {
            this.isLoading = true
            let _cmd = 'devConfig.add'
            let _isEdit = this.editIndex !== -1
            if (_isEdit) {
              _cmd = 'devConfig.update'
            }
            let _postData = { ...this.baseModel }
            await this.$api.cmd(_cmd, {
              module: 'multiuser',
              data: {
                ..._postData,
                passwd: this.$encry(this.baseModel.passwd)
              }
            })
            this.$message.success(
              _isEdit ? I18N.t('tip.edit1_success') : I18N.t('tip.add_success')
            )
            if (_isEdit) {
              this.accountList.splice(this.editIndex, 1, _postData)
            } else {
              this.accountList.push(_postData)
            }
            this.baseModalShow = false
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-box {
  width: 250px;
  max-height: 300px;
  overflow: hidden;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
}
</style>
