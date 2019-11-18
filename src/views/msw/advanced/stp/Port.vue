<template>
  <div class="advanced-stp-port">
    <help-alert title="生成树端口设置">
      <div slot="content">
        <b>说明：</b> 建议直连PC的端口开启Port Fast
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">端口列表</span>
        <div class="fr">
          <el-button icon="el-icon-refresh" size="small" type="primary" v-auth="refresh">刷新</el-button>
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量设置</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="端口角色" prop="role">
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
        <el-table-column align="center" label="端口状态" prop="status">
          <template slot-scope="{row}">
            <!-- 0 ：disabled  1 ：blocking 2 ：learning 3 ：forwarding -->
            <span v-if="row.status===0">disabled</span>
            <span v-if="row.status===1">blocking</span>
            <span v-if="row.status===2">learning</span>
            <span v-if="row.status===3">forwarding</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="优先级" prop="priority"></el-table-column>
        <el-table-column align="center" label="连接类型">
          <el-table-column align="center" label="配置状态" prop="linktype">
            <template slot-scope="{row}">
              <span v-if="row.linktype===2">自动</span>
              <span v-if="row.linktype===0">共享</span>
              <span v-if="row.linktype===1">点对点</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="实际状态" prop="r_linktype">
            <template slot-scope="{row}">
              <span v-if="row.r_linktype===0">共享</span>
              <span v-if="row.r_linktype===1">点对点</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="BPDU Guard" prop="bpdu_guard">
          <template slot-scope="{row}">
            <span v-if="row.bpdu_guard===0">关闭</span>
            <span v-if="row.bpdu_guard===1">开启</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Port Fast" prop="fastport">
          <template slot-scope="{row}">
            <span v-if="row.fastport===0">关闭</span>
            <span v-if="row.fastport===1">开启</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <span class="c-info" v-if="row.aggregate_port>0">当前口属于lag{{row.aggregate_port}},不可配置</span>
            <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}" v-else>修改</el-button>
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
        width="650px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
          <el-form-item label="Port Fast：" prop="fastport">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.fastport"></el-switch>
          </el-form-item>
          <el-form-item label="BPDU Guard：" prop="bpdu_guard">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.bpdu_guard"></el-switch>
          </el-form-item>
          <el-form-item label="连接类型：" prop="linktype">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.linktype">
              <el-option :value="2" label="自动"></el-option>
              <el-option :value="0" label="共享"></el-option>
              <el-option :value="1" label="点对点"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优先级：" prop="priority">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.priority">
              <el-option :key="i" :label="(i-1)*16" :value="`${(i-1)*16}`" v-for="i in 16"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid"></el-form-item>
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
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
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
        portid: [{ required: true, message: '请选择需要配置的端口' }],
        priority: [
          { required: true, message: '请输入优先级' },
          { validator: rangeValidator, min: 0, max: 240 }
        ]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'lagPort', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item ? `端口：${_item.interface}` : '批量配置'
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
        return (
          stpPort.list
            .map(lis => {
              return {
                ...lis,
                ..._statusList.find(status => status.lpid === lis.lpid),
                ...this.portinfo.find(p => p.lpid === lis.lpid)
              }
            })
            // 过滤逻辑口和具有成员口的聚合口
            .filter(port => {
              return (
                port.aggregate_port !== undefined ||
                this.lagPort.find(p => p.lpid === port.lpid)
              )
            })
        )
      } catch (error) {
        return []
      }
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
            this.$message.success('配置成功')
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
<style lang="scss" scoped>
.advanced-stp-port {
}
</style>

