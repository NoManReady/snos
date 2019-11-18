<template>
  <div class="advanced-lldp-port">
    <!-- <help-alert title="LLDP端口设置"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">端口列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量设置</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发送LLDPDU" prop="tx">
          <template slot-scope="{row}">
            <span v-if="row.tx===1">开启</span>
            <span v-else>关闭</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="接收LLDPDU" prop="rx">
          <template slot-scope="{row}">
            <span v-if="row.rx===1">开启</span>
            <span v-else>关闭</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="媒体终端发现MED" prop="med">
          <template slot-scope="{row}">
            <span v-if="row.med===1">开启</span>
            <span v-else>关闭</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{$index}">
            <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}">修改</el-button>
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
          <el-form-item label="发送LLDPDU：" prop="tx">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.tx"></el-switch>
          </el-form-item>
          <el-form-item label="接收LLDPDU：" prop="rx">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.rx"></el-switch>
          </el-form-item>
          <el-form-item label="媒体终端发现MED：" prop="med">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.med"></el-switch>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" :showLag="false" mutilple />
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
import { lldpPort } from '@/model/msw/advanced'
import { rangeValidator } from '@/utils/rules'
import { mapGetters } from 'vuex'
export default {
  name: 'advanced-lldp-port',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      isLoading: false,
      baseModel: lldpPort(),
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }],
        delaytime: [
          { required: true, message: '请输入优先级' },
          { validator: rangeValidator, min: 1, max: 10 }
        ]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'uplink']),
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
          module: 'lldp_port'
        })
        return _result.list.map(lis => {
          return {
            ...lis,
            interface: this.piMap[lis.lpid]
          }
        })
      } catch (error) {
        return []
      }
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = lldpPort()
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
              module: 'lldp_port',
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
    }
  }
}
</script>
<style lang="scss" scoped>
.advanced-lldp-port {
}
</style>

