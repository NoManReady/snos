<template>
  <div class="vpn-l2tp-client">
    <help-alert json-key="vpnL2tpCliJson" title="L2TP客户端"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          全局设置
          <small></small>
        </span>
      </div>
      <el-form :model="globalModel" :rules="globalRules" class="web-form w500" label-width="180px" ref="globalForm">
        <el-form-item label="L2TP链路维护时间间隔" prop="l2tphellointerval">
          <el-input placeholder="60~1000" v-model="globalModel.l2tphellointerval"></el-input>
          <span class="web-form--tip">秒</span>
        </el-form-item>
        <el-form-item>
          <el-button class="w200" type="primary" v-auth="_onSubmitGlobal">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          客户端设置
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="list.length>=MAX_NUM||isLoading"
            icon="el-icon-plus"
            size="small"
            type="primary"
            v-auth="{fn:_onEdit,params:-1}"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="small" type="primary" v-auth="_onDel">批量删除</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            最大支持配置
            <b class="c-warning mlr5">{{MAX_NUM}}</b>条客户端。
          </div>
        </help-alert>
        <el-table :data="list" ref="baseTable" size="mini" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column align="center" label="隧道名称" prop="tunnelname"></el-table-column>
          <el-table-column align="center" label="用户名" prop="username"></el-table-column>
          <el-table-column align="center" label="服务器地址" prop="lns"></el-table-column>
          <el-table-column align="center" label="IPSec加密" prop="ipsecenc">
            <template slot-scope="scope">{{scope.row.ipsecenc==='no' ? '不加密' : '加密' }}</template>
          </el-table-column>
          <el-table-column align="center" label="对端子网" prop="remotesubnet"></el-table-column>
          <el-table-column align="center" label="工作模式" prop="workmode">
            <template slot-scope="scope">{{scope.row.workmode === 'nat' ? 'NAT' : '路由'}}</template>
          </el-table-column>
          <el-table-column align="center" label="状态" prop="enable">
            <template slot-scope="scope">
              <span v-show="scope.row.enable==='on'">开启</span>
              <span v-show="scope.row.enable==='off'">关闭</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="110">
            <template slot-scope="scope">
              <el-button
                :disabled="isLoading"
                circle
                icon="el-icon-edit"
                size="mini"
                type="primary"
                v-auth="{fn:_onEdit,params:scope.$index}"
              ></el-button>
              <el-button :disabled="isLoading" circle icon="el-icon-delete" size="mini" v-auth="{fn:_onDel,params:scope.row}"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分组编辑modal -->
        <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
          <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm">
            <el-form-item label="隧道名称" prop="tunnelname">
              <el-input :disabled="editIndex !== -1" class="w300" placeholder="1-12个字符" v-model="baseModel.tunnelname"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input class="w300" v-model="baseModel.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input class="w300" v-model="baseModel.password"></el-input>
            </el-form-item>
            <el-form-item label="服务器地址" prop="lns">
              <el-input class="w300" v-model="baseModel.lns"></el-input>
            </el-form-item>
            <el-form-item label="IPSec加密" prop="ipsecenc">
              <el-select class="w300" v-model="baseModel.ipsecenc">
                <el-option label="加密" value="yes">加密</el-option>
                <el-option label="不加密" value="no">不加密</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="预共享密钥" prop="presharekey" v-if="baseModel.ipsecenc === 'yes'">
              <el-input class="w300" v-model="baseModel.presharekey"></el-input>
            </el-form-item>
            <el-form-item label="对端子网" prop="remotesubnet">
              <el-input class="w300" v-model="baseModel.remotesubnet"></el-input>
            </el-form-item>
            <el-form-item label="工作模式" prop="workmode">
              <el-radio-group v-model="baseModel.workmode">
                <el-radio label="nat">NAT</el-radio>
                <el-radio label="route">路由</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态" prop="enable">
              <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-form>
          <span class="dialog-footer" slot="footer">
            <el-button @click="baseModalShow = false">取 消</el-button>
            <el-button :loading="isLoading" @click="_onModalConfirm" type="primary">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<script>
import { intValidator, rangeValidator } from '@/utils/rules'
import modelFn from '@/model'
import formMixins from '@/mixins/formMixins'
export default {
  name: 'vpn-l2tp-client',
  mixins: [formMixins],
  data() {
    return {
      MAX_NUM: 20,
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      list: [],
      globalModel: { l2tphellointerval: '' },
      globalRules: {
        l2tphellointerval: [
          { required: true, message: '请输入时间间隔' },
          { validator: intValidator, message: '时间必须为正整数' },
          {
            validator: rangeValidator,
            min: 60,
            max: 1000,
            message: '时间范围：60~1000'
          }
        ]
      },
      baseModel: modelFn.vpnL2tpCliFn(),
      baseRules: {
        username: [{ required: true, message: '请输入' }],
        password: [{ required: true, message: '请输入' }],
        lns: [{ required: true, message: '请输入' }],
        presharekey: [{ required: true, message: '请输入' }],
        remotesubnet: [{ required: true, message: '请输入' }]
      }
    }
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑L2TP客户端' : '添加L2TP客户端'
    }
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getL2tpClient()
      this.globalModel = await this.$api.getL2tpClientGlobal()
      this.list = _res.list || []
    },
    // 添加/编辑
    _onEdit(index) {
      this.baseModel =
        index === -1 ? modelFn.vpnL2tpCliFn() : { ...this.list[index] }
      this.baseModalShow = true
      this.editIndex = index
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert('请选择要删除的项目', {
          type: 'warning'
        })
        return
      }
      this.$confirm('是否确认删除?', '提示', {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .delL2tpClient({ tunnelname: _items.map(ite => ite.tunnelname) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
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
    // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交客户端设置
    _onSubmit() {
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.list[this.editIndex])
      ) {
        this.baseModalShow = false
        return this.$message({
          message: '配置未修改',
          type: 'success'
        })
      }
      this.isLoading = true
      let _isAdd = this.editIndex === -1
      this.$api
        .setL2tpClient({ ...this.baseModel }, _isAdd)
        .then(d => {
          if (_isAdd) {
            this.list.push({ ...this.baseModel })
          } else {
            this.list.splice(this.editIndex, 1, { ...this.baseModel })
          }
          this.$message({
            message: '配置成功',
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    },
    // 提交全局设置
    _onSubmitGlobal() {
      this.$refs.globalForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          this.$api
            .setL2tpClientGlobal({ ...this.globalModel })
            .then(d => {
              this.$message({
                message: '配置成功',
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
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
