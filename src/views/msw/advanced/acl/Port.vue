<template>
  <div class="advanced-acl-port">
    <help-alert title="应用ACL">
      <p class="c-warning" slot="content">设备过滤方向：入口方向（只在接收报文上做过滤）。</p>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">应用ACL</span>
        <div class="fr">
          <el-button icon="el-icon-plus" size="small" type="primary" v-auth="_onAdd">批量添加ACL应用端口</el-button>
          <el-button icon="el-icon-delete" size="small" type="danger" v-auth="_onPatchRemove">删除选中ACL应用端口</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="small" stripe>
        <el-table-column :selectable="_onSelectable" type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="端口" prop="intfName">
          <template slot-scope="{row}">
            <span>{{row.intfName}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="MAC ACL" prop="mac_uuid">
          <template slot-scope="{row}">{{_getAclName(row.mac_uuid)}}</template>
        </el-table-column>
        <el-table-column align="center" label="IP ACL" prop="ip_uuid">
          <template slot-scope="{row}">{{_getAclName(row.ip_uuid)}}</template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{$index,row}">
            <span class="c-info" v-if="row.aggregate_port>0">当前口属于lag{{row.aggregate_port}},不可配置</span>
            <template v-else>
              <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}">修改</el-button>
              <el-button
                :class="{'c-danger':row.mac_uuid!=='none'||row.ip_uuid!=='none'}"
                :disabled="row.mac_uuid==='none'&&row.ip_uuid==='none'"
                size="mini"
                type="text"
                v-auth="{fn:_onPatchRemove,params:row.portid}"
              >解除绑定</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.page"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <!--basemodal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="650px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="small">
          <el-form-item label="MAC ACL：" prop="mac_uuid">
            <el-select class="w160" placeholder="请选择" size="mini" v-model="baseModel.mac_uuid">
              <el-option label="无" value="none"></el-option>
              <el-option :key="acl.uuid" :label="acl.name" :value="acl.uuid" v-for="acl in macAcls"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="IP ACL：" prop="ip_uuid">
            <el-select class="w160" placeholder="请选择" size="mini" v-model="baseModel.ip_uuid">
              <el-option label="无" value="none"></el-option>
              <el-option :key="acl.uuid" :label="acl.name" :value="acl.uuid" v-for="acl in ipAcls"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="应用端口：" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click.native="_onModalConfirm" size="small" type="primary">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import PortPanel from '@/common/PortPanel'
import formMixins from '@/mixins/formMixins'
import pageMixins from '@/mixins/msw/pageMixins'
import { aclPort } from '@/model/msw/advanced'
import { mapGetters } from 'vuex'
export default {
  name: 'advanced-acl-port',
  components: {
    [PortPanel.name]: PortPanel
  },
  mixins: [formMixins, pageMixins],
  data() {
    const aclBindValidator = (r, v, cb) => {
      if (
        this.baseModel.mac_uuid === 'none' &&
        this.baseModel.ip_uuid === 'none'
      ) {
        return cb(new Error('至少绑定一个ACL，请选择'))
      }
      cb()
    }
    return {
      isLoading: false,
      // acl列表
      aclList: [],
      baseModalShow: false,
      editIndex: -1,
      baseModel: aclPort(),
      baseRules: {
        portid: [{ required: true, message: '请选择应用的端口' }],
        ip_uuid: [{ validator: aclBindValidator }],
        mac_uuid: [{ validator: aclBindValidator }]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['lagPort', 'portinfo', 'uplink']),
    // modal名称
    modalTitle() {
      return this.editIndex > -1 ? '编辑ACL应用端口' : `添加ACL应用端口`
    },
    macAcls() {
      return this.aclList.filter(acl => acl.type === 1)
    },
    ipAcls() {
      return this.aclList.filter(acl => acl.type === 2)
    },
    aclUuidLimit() {
      return [this.baseModel.mac_uuid, this.baseModel.ip_uuid]
    }
  },
  watch: {
    'baseModel.portid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    aclUuidLimit() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField(['mac_uuid', 'ip_uuid'])
      }
    }
  },
  methods: {
    // 加载acl列表
    async _loadList() {
      try {
        let params = [
          { method: 'devSta.get', params: { module: 'acl' } },
          { method: 'devSta.get', params: { module: 'acl_bind' } }
        ]
        let [acl, aclBind] = await this.$api.cmd(
          'cmdArr',
          { params },
          { noParse: false }
        )
        this.aclList = acl.list
        return Object.freeze(
          aclBind.list
            .sort((a, b) => a.portid - b.portid)
            .map((port, index) => {
              return {
                ...port,
                ...this.portinfo.find(p => p.lpid === port.portid)
              }
            })
            // 过滤逻辑口和具有成员口的聚合口
            .filter(port => {
              return (
                port.aggregate_port !== undefined ||
                this.lagPort.find(p => p.lpid === port.portid)
              )
            })
        )
      } catch (error) {}
    },
    // 获取acl明后才能
    _getAclName(uuid) {
      if (uuid === 'none') {
        return '--'
      }
      let _acl = this.aclList.find(acl => acl.uuid === uuid) || {}
      return _acl.name || uuid
    },
    // 判断是否可删除
    _onSelectable(row, index) {
      if (row.mac_uuid !== 'none' || row.ip_uuid !== 'none') {
        if (row.aggregate_port !== undefined && row.aggregate_port >= 0) {
          return false
        }
        return true
      }
      return false
    },
    // 批量删除
    async _onPatchRemove(pid) {
      let _pids =
        pid !== undefined
          ? [pid]
          : this.$refs.baseTable.selection.map(s => s.portid)
      if (!_pids.length) {
        return this.$message.warning('请选择要解除的列表项')
      }
      await this.$confirm(`是否确认解除绑定？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      this.isLoading = true
      try {
        await this.$api.cmd('devSta.del', {
          module: 'acl_bind',
          data: { portid: _pids }
        })
        this.$message.success('解除绑定成功')
        this.refresh()
      } catch (error) {}
      this.isLoading = false
    },
    // 添加ACL应用
    _onAdd() {
      this.editIndex = -1
      this.baseModalShow = true
      this.baseModel = aclPort()
    },
    // 编辑ACL应用
    _onEdit(index) {
      this.editIndex = index
      this.baseModalShow = true
      let _aclPort = this.getItem(this.editIndex)
      this.baseModel = { ..._aclPort, portid: [_aclPort.portid] }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            await this.$api.cmd('devSta.add', {
              module: 'acl_bind',
              data: this.baseModel
            })
            this.baseModalShow = false
            this.refresh()
            this.$message.success('配置成功')
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 1) {
          if (columnIndex === 4) {
            return {
              rowspan: 1,
              colspan: 4
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.advanced-acl-port {
}
</style>
