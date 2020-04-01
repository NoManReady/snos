<template>
  <div class="vpn-user-pool">
    <help-alert json-key="vpnUserJson" :title="$t('egw.manager.vpn_user')">
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.manager.vpn_user_list')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="userList.length>=MAX_NUM||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="_onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" plain size="medium" type="primary" v-auth="_onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="egw.limit_num_tip">
                <b class="c-warning mlr5">{{MAX_NUM}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table :data="userList" ref="baseTable" size="medium" stripe>
          <el-table-column :selectable="row => row.active !== '1'" type="selection" width="55"></el-table-column>
          <el-table-column align="center" :label="$t('egw.user_name')" prop="username"></el-table-column>
          <el-table-column align="center" :label="$t('vpnUserJson.items[1].title')" prop="provider">
             <template slot-scope="scope">
               {{scope.row.provider == 'l2tpserver' ? 'L2TP' : 'PPTP'}}
             </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('egw.l2tp.group_net_mode')" prop="netmode">
            <template slot-scope="scope">
               {{scope.row.netmode == 'client2lan' ? $t('egw.l2tp.pc_enter_route') : $t('egw.l2tp.route_to_route')}}
             </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('egw.l2tp.terminal_network_range')" prop="remotesubnet"></el-table-column>
          <el-table-column align="center" :label="$t('phrase.status')" prop="enable">
            <template slot-scope="scope">
               {{scope.row.enable == 'on' ? $t('egw.start_using') : $t('egw.pppoe.forbid')}}
             </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('action.ope')">
            <template slot-scope="scope">
              <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:_onEdit,params:scope.$index}">{{$t('action.edit')}}</el-button>
              <el-button
                size="medium"
                type="text"
                v-auth="{fn:_onDel,params:scope.row}"
              >{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 用户管理编辑modal -->
    <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
      <el-form
        :model="baseModel"
        :rules="getUserRules(isAddUser)"
        :validate-on-rule-change="false"
        label-width="120px"
        ref="baseForm"
      >
        <el-form-item :label="$t('vpnUserJson.items[1].title')" prop="provider">
          <el-select :disabled="editIndex !== -1" class="w280" v-model="baseModel.provider">
            <el-option label="L2TP" key="l2tpserver" value="l2tpserver"></el-option>
            <el-option label="PPTP" key="pptpserver" value="pptpserver"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.user_name')" prop="username">
          <el-input :disabled="editIndex !== -1" :placeholder="$t('egw.manager.vpn_user_tip')"  class="w300" v-model="baseModel.username"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.password')" prop="password">
          <el-input class="w300" :type="showPwd?'text':'password'" :placeholder="$t('egw.manager.vpn_user_tip')" v-model="baseModel.password"></el-input>
          <i class="el-icon-view fs18 ml5 vm pointer" :class="{'c-success':showPwd}" @click="showPwd=!showPwd"></i>
        </el-form-item>
        <el-form-item :label="$t('egw.l2tp.group_net_mode')" prop="netmode">
          <el-select class="w280" v-model="baseModel.netmode">
            <el-option :label="$t('egw.l2tp.pc_enter_route')" key="client2lan" value="client2lan"></el-option>
            <el-option :label="$t('egw.l2tp.route_to_route')" key="lan2lan" value="lan2lan"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.l2tp.terminal_network_range')" prop="remotesubnet" v-if="baseModel.netmode === 'lan2lan'">
          <el-input class="w300" :placeholder="$t('rules.net_example')" v-model="baseModel.remotesubnet"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.status')" prop="enable">
          <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
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
import formMixins from '@/mixins/formMixins'
import { isIpInNet, ipNetValidate, isExistIpRange } from '@/utils/commonValidates'
import poolMixins from './poolMixins'
export default {
  name: 'vpn-user-pool',
  mixins: [formMixins, poolMixins],
  data() {
    return {
      poolList: [],
      networkLan: [],
      showPwd: false,
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      baseModel: modelFn.vpnPoolFn(),
      modalTitle: '',
      userList: [],
      MAX_NUM: 30
    }
  },
  computed: {
    isAddUser() {
      return this.editIndex === -1
    },
    nameMap() {
      let _map = {};
      this.userList.forEach(p => (_map[p.username] = true));
      return _map;
    },
    ipRangeMap() {
      let _map = {};
      this.userList.forEach(p => (_map[p.remotesubnet] = true));
      return _map;
    },
  },
  watch: {
  },
  created() {
    this.loadVpnUser()
  },
  methods: {
    async loadVpnUser() {
      let _res = await this.$api.getVpnUser()
      this.userList = _res.list || []
      this.loadNetwork()
      this.loadIpPool()
    },
    async loadNetwork() {
      let _res = await this.$api.getNetwork()
      this.networkLan = _res.lan || []
    },
    // 获取地址池
    async loadIpPool() {
      let _res = await this.$api.getIpPool();
      this.poolList = []
      _res.list.forEach(item =>{
        this.poolList.push(item.first_addr + '-' + item.end_addr)
      })
      console.log(this.poolList)
    },
    getUserRules(isAddUser = false, checkIpRange = true) {
      const _sameNameValidate = (r, v, cb) => {
        if (isAddUser && this.nameMap[v])
          return cb(new Error(this.$t('egw.pppoe.username_is_exists')))
        cb()
      }
      const _keyTypeValidate = (r, v, cb) => {
        let keyType = /[,*^ ]/
        if (keyType.test(v))
          return cb(new Error(this.$t('egw.manager.vpn_user_tip')))
        cb()
      }
      const localIpValidate = (r, v, cb) => {
        let _index = this.userList.findIndex(d => d.remotesubnet === v)
        if ((this.ipRangeMap[v] && this.editIndex !== _index) || isExistIpRange(v, -1, this.poolList)) {
          return cb(new Error(I18N.t('egw.l2tp.outside_addr_zone')))
        }
        cb()
      }
      const subnetValidate = (r, v, cb) => {
        if (isIpInNet(v, this.networkLan)) {
          return cb(new Error(I18N.t('egw.l2tp.outside_lan_ip')))
        }
        cb()
      }
      return {
        remotesubnet: [
          {
            required: true,
            message: I18N.t('egw.l2tp.terminal_network_range_is_required')
          },
          { validator: ipNetValidate },
          { validator: subnetValidate },
          { validator: localIpValidate }
        ],
        username: [
          { required: true, message: this.$t('egw.manager.username_is_required') },
          { validator: _keyTypeValidate },
          { validator: _sameNameValidate }
        ],
        password: [
          { required: true, message: this.$t('egw.manager.password_is_required') },
          { validator: _keyTypeValidate }
        ]
      }
    },
    // 添加
    _onAdd() {
      this.isAddUserUser = true
      this.modalTitle = this.$t('egw.ipsec.add_user')
      this.baseModel = modelFn.vpnUserFn()
      this.baseModalShow = true
      this.editIndex = -1
      this._clearValidate()
    },
    // 编辑
    _onEdit(index) {
      this.isAddUserUser = false
      this.modalTitle = this.$t('egw.ipsec.edit_user')
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = { ...this.userList[index] }
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert( this.$t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(this.$t('tip.confirm_delete'), this.$t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .delVpnUser({list:_items})
          .then(d => {
            _items.forEach(ite => {
              let _index = this.userList.findIndex(d => d === ite)
              this.userList.splice(_index, 1)
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
    // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交数据
    _onSubmit() {
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.userList[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _userData = { ...this.baseModel }
      this.$api
        .setVpnUser(_userData, this.isAddUser)
        .then(d => {
          if (this.isAddUser) {
            this.userList.push(_userData)
          } else {
            this.userList.splice(this.editIndex, 1, _userData)
          }
          this.$message({
            message: this.$t('tip.edit1_success'),
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
<style lang="scss" scoped>
</style>
