<template>
  <div class="advanced-acl-port">
    <help-alert :title="$t('msw.acl.apply_acl')">
      <p class="c-warning" slot="content">{{$t('msw.acl.acl_port_tip')}}</p>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.acl.apply_acl')}}</span>
        <div class="fr">
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="_onAdd">{{$t('action.patch_add')}}</el-button>
          <el-button
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onPatchRemove"
          >{{$t('msw.acl.patch_release')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="medium" stripe>
        <el-table-column :selectable="_onSelectable" type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('msw.port')" align="center" prop="ifname">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="MAC ACL" prop="mac_uuid">
          <template slot-scope="{row}">{{_getAclName(row.mac_uuid)}}</template>
        </el-table-column>
        <el-table-column align="center" label="IP ACL" prop="ip_uuid">
          <template slot-scope="{row}">{{_getAclName(row.ip_uuid)}}</template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{$index,row}">
            <span class="c-info" v-if="row.aggregate_port>0">{{$t('msw.agg_port_tip',{id:row.aggregate_port})}}</span>
            <template v-else>
              <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
              <el-button
                :class="{'c-danger':row.mac_uuid!=='none'||row.ip_uuid!=='none'}"
                :disabled="row.mac_uuid==='none'&&row.ip_uuid==='none'"
                size="medium"
                type="text"
                v-auth="{fn:_onPatchRemove,params:row.portid}"
              >{{$t('msw.acl.release_bind')}}</el-button>
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
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item label="MAC ACL：" prop="mac_uuid">
            <el-select :placeholder="$t('action.select')" class="w300" v-model="baseModel.mac_uuid">
              <el-option :label="$t('msw.acl.empty')" value="none"></el-option>
              <el-option :key="acl.uuid" :label="acl.name" :value="acl.uuid" v-for="acl in macAcls"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="IP ACL：" prop="ip_uuid">
            <el-select :placeholder="$t('action.select')" class="w300" v-model="baseModel.ip_uuid">
              <el-option :label="$t('msw.acl.empty')" value="none"></el-option>
              <el-option :key="acl.uuid" :label="acl.name" :value="acl.uuid" v-for="acl in ipAcls"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
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
  </div>
</template>
<script>
import PortPanel from '@/common/PortPanel'
import formMixins from '@/mixins/formMixins'
import pageMixins from '@/mixins/msw/pageMixins'
import { isPhyPort, hasLagmemberByLpid } from '@/utils/lag'
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
        return cb(new Error(I18N.t('msw.acl.must_one_rule')))
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
        portid: [
          { required: true, message: I18N.t('msw.acl.apply_port_no_empty') }
        ],
        ip_uuid: [{ validator: aclBindValidator }],
        mac_uuid: [{ validator: aclBindValidator }]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'uplink']),
    // modal名称
    modalTitle() {
      return this.editIndex > -1 ? I18N.t('action.edit1') : I18N.t('action.add')
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
              return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
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
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      this.isLoading = true
      try {
        await this.$api.cmd('devSta.del', {
          module: 'acl_bind',
          data: { portid: _pids }
        })
        this.$message.success(I18N.t('msw.acl.release_success'))
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
            this.$message.success(I18N.t('tip.edit1_success'))
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
