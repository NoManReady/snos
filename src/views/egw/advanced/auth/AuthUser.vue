<template>
  <div class="aut-user">
    <help-alert json-key="exampleJson" :title="$t('egw.auth.auth_user_online')"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.auth.auth_config')}}
          <small></small>
        </span>
      </div>
      <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
        <el-form-item :label="$t('egw.auth.style_by_offline')">
          <el-checkbox-group class="hide" v-model="baseModel.flowDetectEn">
            <el-checkbox false-label="0" :label="$t('phrase.enable')" true-label="1"></el-checkbox>
          </el-checkbox-group>
          <el-form-item label prop="flowDetectTime" v-if="baseModel.flowDetectEn != '0'">
            <el-input class="w90" v-model="baseModel.flowDetectTime"></el-input>
            <span>{{$t('egw.auth.mandatory_offline_tip')}}</span>
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button :loading="onSaveLoading" class="w160" type="primary" v-auth="setAppAuth">{{$t('action.save_edit')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.online_user')}}
          <small></small>
        </span>
        <div class="fr">
          <el-select class="w300" size="medium" v-model="searchKey">
            <el-option :label="$t('egw.auth.search_by_ip')" value="ip"></el-option>
            <el-option :label="$t('egw.auth.search_by_mac')" value="mac"></el-option>
            <el-option :label="$t('egw.auth.search_by_username')" value="userName"></el-option>
          </el-select>
          <el-input class="w200 mr5 verm" clearable :placeholder="$t('egw.auth.search_wright')" size="medium" v-model="search">
            <el-button @click.native="onSearchOnlineUser" icon="el-icon-search" slot="append"></el-button>
          </el-input>
          <el-button @click="onRefresh" icon="el-icon-refresh" plain size="medium" type="primary">{{$t('action.refresh')}}</el-button>
          <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDelUser">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="userTable" row-key="mac" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" :label="$t('egw.user_name')" prop="userName"></el-table-column>
        <el-table-column align="center" label="IP" prop="ip"></el-table-column>
        <el-table-column align="center" :label="$t('egw.mac')" prop="mac"></el-table-column>
        <el-table-column align="center" :label="$t('egw.auth.inline_time')" prop="time"></el-table-column>
        <el-table-column align="center" :label="$t('egw.auth.online_times')" prop="timeUsed"></el-table-column>
        <el-table-column align="center" :label="$t('egw.auth.auth_type')" prop="auth_type">
          <template slot-scope="scope">
            <span>{{_getAuthMapName(scope.row.auth_type)}}</span>
          </template>
        </el-table-column>
        <el-table-column :formatter="getStatus" align="center" :label="$t('phrase.status')" prop="status"></el-table-column>
        <el-table-column align="center" :label="$t('action.ope')" width="100px">
          <template slot-scope="scope">
            <el-button size="medium" type="text" v-auth="{fn:onDelUser,params:scope.row}">{{$t('action.delete')}}</el-button>
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
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/pageMixins'
import { intValidate, isBetween } from '@/utils/rulesUtils'
export default {
  name: 'AuthUser',
  data() {
    const detectTimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error(this.$t('egw.auth.enter_integer_required')))
      if (!isBetween(v, 5, 65535)) return cb(new Error(this.$t('egw.port_limit_tip')))
      return cb()
    }
    return {
      user: [],
      search: '',
      searchKey: 'ip',
      onSaveLoading: false,
      baseModel: {
        flowDetectEn: '1',
        flowDetectTime: ''
      },
      baseRules: {
        flowDetectTime: [
          { required: true, message: this.$t('egw.auth.enter_minutes_required') },
          { validator: detectTimeValidate }
        ]
      },
      authMaps: Object.freeze({
        wx2: this.$t('egw.auth.wifi_link_wechat'),
        wifidog: this.$t('egw.auth.sms_one_click_authentication'),
        user_pwd_auth: this.$t('egw.password'),
        qrcode_active_auth: this.$t('egw.auth.qrcode_active_auth'),
        qrcode_passive_auth: this.$t('egw.auth.qrcode_passive_auth')
      })
    }
  },
  created() {
    setTimeout(() => {
      this.getAppAuth()
    }, 600)
  },
  mixins: [pageMixins],
  methods: {
    async _loadList() {
      let data = await this.$api.getUserOnline()
      return (data && data.user) || []
    },
    // 获取app认证信息
    async getAppAuth() {
      this.baseModel = await this.$api.getAppAuth()
      this.baseModel.flowDetectEn = '1'
    },
    // 设置app认证信息
    setAppAuth() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.onSaveLoading = true
          this.$api
            .setAppAuth(this.baseModel)
            .then(d => {
              this.$message({
                message: this.$t('tip.edit1_success'),
                type: 'success'
              })
            })
            .finally(() => {
              this.onSaveLoading = false
            })
        }
      })
    },
    // 获取认证方式
    _getAuthMapName(k) {
      return this.authMaps[k] || ''
    },
    onSearchOnlineUser() {
      this.searchListFuzzy(this.search, this.searchKey)
    },
    onRefresh() {
      this._initPage()
    },
    getStatus() {
      return this.$t('phrase.online')
    },
    onDelUser(item) {
      let _items = this.$refs.userTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        let data = _items.map(ite => {
          return {
            ip: ite.ip,
            mac: ite.mac,
            status: 'down'
          }
        })
        this.$api.setUserOnline(data, true).then(d => {
          // if (d.code != '0') return this.$message('删除失败，请重新操作')
          // this._loadList()
          _items.forEach(ite => {
            let _index = this.pageList.findIndex(p => p.ip === ite.ip)
            if (_index >= 0) {
              this.removeList(_index)
            }
          })
          this.$message( this.$t('tip.edit1_success'))
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.aut-user {
  .verm {
    vertical-align: middle;
  }
}
</style>
