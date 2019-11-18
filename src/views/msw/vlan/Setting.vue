<template>
  <div class="vlan-setting">
    <div class="box">
      <div class="clearfix mb5">
        <span class="box-header-tit hide">VLAN列表</span>
        <div class="fr">
          <el-button icon="el-icon-plus" size="small" type="primary" v-auth="_onPatchAdd">批量添加VLAN</el-button>
          <el-button icon="el-icon-plus" size="small" type="primary" v-auth="_onAdd">添加VLAN</el-button>
          <el-button icon="el-icon-delete" size="small" type="danger" v-auth="_onPatchRemove">删除选中VLAN</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
          （
          <span class="c-warning">默认vlan、管理vlan、native vlan及access vlan不允许被删除。</span>）
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column :selectable="_onSelectable" type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="v" sortable></el-table-column>
        <el-table-column align="center" label="描述" prop="n"></el-table-column>
        <el-table-column align="center" label="端口">
          <template slot-scope="{$index}">
            <i class="el-icon-loading" v-if="vlanPortLoading"></i>
            <span v-else>{{vlanPortList[$index]?vlanPortList[$index].p:'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <el-button size="small" type="text" v-auth="{fn:_onEdit,params:$index}">编辑</el-button>
            <el-button
              :class="{'c-danger':!(vlanPortLoading||(vlanPortList[$index]&&vlanPortList[$index].f===1)||row.v===wanVlanid)}"
              :disabled="vlanPortLoading||(vlanPortList[$index]&&vlanPortList[$index].f===1)||row.v===wanVlanid"
              size="small"
              type="text"
              v-auth="{fn:_onPatchRemove,params:row.v}"
            >删除</el-button>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="small">
          <el-form-item label="VLAN ID：" prop="v">
            <el-input :disabled="editIndex>-1" class="w220" clearable placeholder="范围(1-4094)" v-model="baseModel.v"></el-input>
            <el-tooltip content="范围(1-4094)" effect="dark" placement="right">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="描述：" prop="n">
            <el-input class="w220" clearable placeholder="描述最多32位" v-model="baseModel.n"></el-input>
            <el-tooltip content="描述最多32位" effect="dark" placement="right">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-form-item>
          <!-- <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid" />
          <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />-->
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click="_onModalConfirm" size="small" type="primary">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { vlanValidate } from '@/utils/rulesUtils'
import { vlanidValidator, nameLengthValidator } from '@/utils/rules'
import { base } from '@/model/msw/vlan'
import bus from '@/utils/bus'
export default {
  name: 'vlan-setting',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const sameVlanValidate = (r, v, cb) => {
      if (v != this.curVlan.v && this.vlanids.indexOf(v) >= 0)
        return cb(new Error('该VLAN ID已存在'))
      cb()
    }
    const nameRequiredValidator = (r, v, cb) => {
      if (this.editIndex !== -1 && !v) {
        return cb(new Error('VLAN描述不能为空'))
      }
      cb()
    }
    return {
      baseModel: base(),
      baseRules: {
        v: [
          { required: true, message: '请输入VLAN ID' },
          { validator: vlanidValidator },
          { validator: sameVlanValidate }
        ],
        n: [
          { validator: nameLengthValidator },
          { validator: nameRequiredValidator }
        ]
      },
      baseModalShow: false,
      editIndex: -1,
      isLoading: false,
      vlanPortList: [],
      vlanPortLoading: false,
      wanVlanid: '',
      maxLimit: window.APP_CAPACITY_SW.vlan
    }
  },
  created() {
    bus.$on('create-vlan', () => {
      this._onAdd()
    })
    bus.$on('portVlanUpdate', () => {
      this.refresh()
    })
    this._loadNetworkWan()
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑VLAN' : '添加VLAN'
    },
    vlanids() {
      return Object.freeze(this.pageModel.allItem.map(vlan => vlan.v))
    },
    curVlan() {
      return this.getItem(this.editIndex) || {}
    }
  },
  watch: {
    pageList: '_loadVlanPort'
  },
  methods: {
    // 加载wan口信息（获取管理vlan）
    async _loadNetworkWan() {
      try {
        let _wan = await this.$api.getNetworkByType('wan', { isSilence: true })
        this.wanVlanid = _wan[0].vlanid
      } catch (error) {}
    },
    // 加载port列表
    async _loadList() {
      let _result = await this.$api.cmd('devConfig.get', { module: 'vlan' })
      bus.$emit('vlanComplete', _result.list)
      return Object.freeze(_result.list)
    },
    // 加载vlan-port接口
    async _loadVlanPort(v) {
      if (v.length === 0) {
        return
      }
      this.vlanPortLoading = true
      try {
        let vlanPort = await this.$api.cmd(
          'devSta.get',
          {
            module: 'vlan_port',
            data: {
              index: this.pageModel.page,
              size: this.pageModel.size
            }
          },
          { noParse: false }
        )
        this.vlanPortList = Object.freeze(vlanPort.list)
      } catch (error) {}
      this.vlanPortLoading = false
    },
    // 判断是否可选择
    _onSelectable(row, index) {
      let _vPort = this.vlanPortList[index]
      return _vPort && _vPort.f !== 1 && row.v !== this.wanVlanid
    },
    // 批量添加
    _onPatchAdd() {
      this.$prompt('', '批量添加VLAN', {
        inputPlaceholder: '如3-5,20',
        inputValidator: v => {
          return vlanValidate(v, true)
        }
      }).then(d => {
        this._saveData({ n: '', v: d.value }, 'devConfig.add', '添加成功').then(
          () => {
            this.refresh()
          }
        )
      })
    },
    // 添加
    _onAdd() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = base()
    },
    // 批量删除
    async _onPatchRemove(vid) {
      let _vids = vid ? [vid] : this.$refs.baseTable.selection.map(s => s.v)
      if (!_vids.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      await this.$confirm(`是否确认删除？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      this._saveData({ v: _vids.join(',') }, 'devConfig.del', '删除成功').then(
        () => {
          this.refresh()
        }
      )
    },
    // 编辑
    _onEdit(index) {
      let _item = this.pageList[index]
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ..._item }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          let _promise = null
          if (this.editIndex === -1) {
            _promise = this._saveData(
              this.baseModel,
              'devConfig.add',
              '添加成功'
            )
          } else {
            _promise = this._saveData(
              this.baseModel,
              'devConfig.update',
              '修改成功'
            )
          }
          _promise
            .then(() => {
              this.refresh()
            })
            .finally(() => {
              this.isLoading = false
            })
          this.baseModalShow = false
        }
      })
    },
    // 提交port数据
    async _saveData(model, method, message = '操作成功') {
      await this.$api.cmd(
        method,
        {
          module: 'vlan',
          data: model
        },
        { timeout: 0 }
      )
      return this.$message.success(message)
    }
  }
}
</script>
<style lang="scss" scoped>
.vlan-setting {
}
</style>

