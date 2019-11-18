<template>
  <div class="port-setting-protect">
    <help-alert title="端口保护">
      <div slot="content">设为保护口的端口之间无法互相通讯。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量编辑</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" prop="enable">
          <template slot-scope="{row,$index}">
            <span class="c-info" v-if="row.aggregate_port>0">当前口属于lag{{row.aggregate_port}},不可配置</span>
            <el-switch :active-value="1" :inactive-value="0" :value="row.enable" @change="_onEnableChange(row,$index)" v-else></el-switch>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
          <el-form-item label="端口保护开关：" prop="enable">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.enable"></el-switch>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" label="端口：" prop="portid"></el-form-item>
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
import { protect } from '@/model/msw/port'
import { mapGetters } from 'vuex'
export default {
  name: 'port-setting-protect',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      baseModel: protect(),
      isLoading: false,
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'lagPort', 'piMap', 'uplink']),
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
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'protected'
        })
        let _list = _result.data
          .sort((a, b) => a.lpid - b.lpid)
          .map((port, index) => {
            return {
              ...port,
              ...this.portinfo.find(p => p.lpid === port.lpid)
            }
          })
          // 过滤逻辑口和具有成员口的聚合口
          .filter(port => {
            return (
              port.aggregate_port !== undefined ||
              this.lagPort.find(p => p.lpid === port.lpid)
            )
          })
        return Object.freeze(_list)
      } catch (error) {}
      return []
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.baseModel = protect()
      this.editIndex = -1
    },
    // 状态值改变
    _onEnableChange(row, index) {
      this.$confirm(
        `是否确认${row.enable === 1 ? '关闭' : '开启'}端口${
          row.interface
        }端口保护功能？`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this._saveData({ enable: row.enable === 1 ? 0 : 1, portid: [row.lpid] })
      })
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._saveData(this.baseModel)
        }
      })
    },
    // 提交port数据
    _saveData(params) {
      let { portid, ...model } = params
      let _confirmData = portid.map(p => {
        return {
          ...model,
          lpid: p,
          interface: this.piMap[p]
        }
      })
      this.isLoading = true
      this.$api
        .cmd('devConfig.update', {
          module: 'protected',
          data: { data: _confirmData }
        })
        .then(() => {
          this.$message.success('配置成功')
          this.refresh()
          this.baseModalShow = false
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.port-setting-protect {
}
</style>
<style lang="scss">
</style>

