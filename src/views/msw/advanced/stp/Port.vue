<template>
  <div class="advanced-stp-port">
    <help-alert :title="$t('msw.stp.cfg_port')">
      <div slot="content">
        <b>{{$t('phrase.explain_f')}}</b>
        {{$t('msw.stp.scf_port_tip')}}
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button
            :disabled="isLoading"
            icon="el-icon-refresh"
            plain
            size="medium"
            type="primary"
            v-auth="_onFresh"
          >{{$t('action.refresh')}}</el-button>
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.stp.port_role')" align="center" prop="role">
          <template slot-scope="{row}">
            <!-- 0 ：disabled   1 ：master 2 ：root 3 ：designated 4 ：alternate 5 ：backup -->
            <span v-if="row.role===0">disabled</span>
            <span v-if="row.role===1">master</span>
            <span v-if="row.role===2">root</span>
            <span v-if="row.role===3">designated</span>
            <span v-if="row.role===4">alternate</span>
            <span v-if="row.role===5">backup</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.stp.port_status')" align="center" prop="status">
          <template slot-scope="{row}">
            <!-- 0 ：disabled  1 ：blocking 2 ：learning 3 ：forwarding -->
            <span v-if="row.status===0">disabled</span>
            <span v-if="row.status===1">blocking</span>
            <span v-if="row.status===2">learning</span>
            <span v-if="row.status===3">forwarding</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.stp.priority')" align="center" prop="priority"></el-table-column>
        <el-table-column :label="$t('msw.stp.link_type')" align="center">
          <el-table-column :label="$t('msw.stp.cfg_status')" align="center" prop="linktype">
            <template slot-scope="{row}">
              <span v-if="row.linktype===2">{{$t('msw.stp.auto')}}</span>
              <span v-if="row.linktype===0">{{$t('msw.stp.share')}}</span>
              <span v-if="row.linktype===1">{{$t('msw.stp.ptop')}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('msw.stp.actual_status')" align="center" prop="r_linktype">
            <template slot-scope="{row}">
              <span v-if="row.r_linktype===0">{{$t('msw.stp.share')}}</span>
              <span v-if="row.r_linktype===1">{{$t('msw.stp.ptop')}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="BPDU Guard" prop="bpdu_guard">
          <template slot-scope="{row}">
            <span v-if="row.bpdu_guard===0">{{$t('phrase.disable')}}</span>
            <span v-if="row.bpdu_guard===1">{{$t('phrase.enable')}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Port Fast" prop="fastport">
          <template slot-scope="{row}">
            <span v-if="row.fastport===0">{{$t('phrase.disable')}}</span>
            <span v-if="row.fastport===1">{{$t('phrase.enable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <span class="c-info" v-if="row.aggregate_port>0">{{$t('msw.agg_port_tip',{id:row.aggregate_port})}}</span>
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}" v-else>{{$t('action.edit')}}</el-button>
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
      <!-- baseModal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item label="Port Fast：" prop="fastport">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.fastport"></el-switch>
          </el-form-item>
          <el-form-item label="BPDU Guard：" prop="bpdu_guard">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.bpdu_guard"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('msw.stp.link_type_f')" prop="linktype">
            <el-select :placeholder="$t('action.select')" class="w200" v-model="baseModel.linktype">
              <el-option :label="$t('msw.stp.auto')" :value="2"></el-option>
              <el-option :label="$t('msw.stp.share')" :value="0"></el-option>
              <el-option :label="$t('msw.stp.ptop')" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.stp.priority_f')" prop="priority">
            <el-select :placeholder="$t('action.select')" class="w200" v-model="baseModel.priority">
              <el-option :key="i" :label="(i-1)*16" :value="`${(i-1)*16}`" v-for="i in 16"></el-option>
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
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { isPhyPort, hasLagmemberByLpid } from '@/utils/lag'
import { stpPort } from '@/model/msw/advanced'
import { rangeValidator } from '@/utils/rules'
import { mapGetters } from 'vuex'
export default {
  name: 'advanced-stp-port',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      isLoading: false,
      baseModel: stpPort(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }],
        priority: [
          { required: true, message: I18N.t('msw.stp.priority_no_empty') },
          { validator: rangeValidator, min: 0, max: 240 }
        ]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    }
  },
  watch: {
    'baseModel.portid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      this.isLoading = true
      let _list = []
      try {
        let params = [
          { method: 'devConfig.get', params: { module: 'stp_port' } },
          { method: 'devSta.get', params: { module: 'stp_port_status' } }
        ]
        let [stpPort, stpPortStatus] = await this.$api.cmd('cmdArr', { params })
        let _statusList = stpPortStatus.list.map(lis => {
          return {
            lpid: lis.lpid,
            r_priority: lis.priority,
            r_linktype: lis.linktype,
            r_fastport: lis.fastport,
            r_bpdu_guard: lis.bpdu_guard,
            role: lis.role,
            status: lis.status
          }
        })
        _list = stpPort.list
          .map(lis => {
            return {
              ...lis,
              ..._statusList.find(status => status.lpid === lis.lpid),
              ...this.portinfo.find(p => p.lpid === lis.lpid)
            }
          })
          // 过滤逻辑口和具有成员口的聚合口
          .filter(port => {
            return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
          })
      } catch (error) {
        return []
      }
      this.isLoading = false
      return _list
    },
    // 刷新数据
    _onFresh() {
      this.refresh()
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = stpPort()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ..._item, portid: [_item.lpid] }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            let { portid, ...model } = this.baseModel
            let _confirmData = portid.map(p => {
              return {
                ...model,
                lpid: p
              }
            })
            await this.$api.cmd('devConfig.update', {
              module: 'stp_port',
              data: {
                list: _confirmData
              }
            })
            this.$message.success(I18N.t('tip.edit1_success'))
            this.refresh()
            this.baseModalShow = false
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === 8) {
            return {
              rowspan: 1,
              colspan: 8
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

