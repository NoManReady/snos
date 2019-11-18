<template>
  <div class="aut-user">
    <help-alert json-key="exampleJson" title="在线认证用户"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          认证配置
          <small></small>
        </span>
      </div>
      <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
        <el-form-item label="下线检测模式">
          <el-checkbox-group class="hide" v-model="baseModel.flowDetectEn">
            <el-checkbox false-label="0" label="开启" true-label="1"></el-checkbox>
          </el-checkbox-group>
          <div class="flow-detect">
            <el-form-item label prop="flowDetectTime" v-if="baseModel.flowDetectEn != '0'">
              <el-input class="w100" size="mini" v-model="baseModel.flowDetectTime"></el-input>
              <span>(5-65535)分钟内无流量，用户将被强制下线</span>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button :loading="onSaveLoading" class="w200" type="primary" v-auth="setAppAuth">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          在线用户
          <small></small>
        </span>
        <div class="fr">
          <el-form size="small">
            <el-select class="w150" size="small" v-model="searchKey">
              <el-option label="根据IP查询" value="ip"></el-option>
              <el-option label="根据MAC查询" value="mac"></el-option>
              <el-option label="根据用户名查询" value="userName"></el-option>
            </el-select>
            <el-input class="w150" size="small" v-model="search"></el-input>
            <el-button @click="onSearchOnlineUser" size="small" type="primary">搜索</el-button>
            <el-button @click="onRefresh" size="small" type="primary">
              <i class="el-icon-refresh"></i>
              <span>刷新</span>
            </el-button>
            <el-button icon="el-icon-delete" size="small" type="primary" v-auth="onDelUser">批量删除</el-button>
          </el-form>
        </div>
      </div>
      <el-table :data="pageList" ref="userTable" row-key="mac" size="small" tooltip-effect="dark">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="用户名" prop="userName"></el-table-column>
        <el-table-column align="center" label="IP" prop="ip"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
        <el-table-column align="center" label="上线时间" prop="time"></el-table-column>
        <el-table-column align="center" label="在线时长(s)" prop="timeUsed"></el-table-column>
        <el-table-column align="center" label="认证方式" prop="auth_type">
          <template slot-scope="scope">
            <span>{{_getAuthMapName(scope.row.auth_type)}}</span>
          </template>
        </el-table-column>
        <el-table-column :formatter="getStatus" align="center" label="状态" prop="status"></el-table-column>
        <el-table-column align="center" label="操作" width="100px">
          <template slot-scope="scope">
            <el-button type="text" v-auth="{fn:onDelUser,params:scope.row}">删除</el-button>
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
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      if (!isBetween(v, 5, 65535)) return cb(new Error('范围为5-65535'))
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
          { required: true, message: '请输入分钟数' },
          { validator: detectTimeValidate }
        ]
      },
      authMaps: Object.freeze({
        wx2: '微信连wifi',
        wifidog: '短信/一键认证',
        user_pwd_auth: '账号密码',
        qrcode_active_auth: '访客扫码',
        qrcode_passive_auth: '授权访客'
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
                message: '配置成功',
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
      return '在线'
    },
    onDelUser(item) {
      let _items = this.$refs.userTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除?').then(() => {
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
          this.$message('配置成功')
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
// .aut-user {
//   .flow-detect {
//     position: absolute;
//     left: 80px;
//     top: 0;
//   }
// }
</style>
