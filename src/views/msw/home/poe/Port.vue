<template>
  <div class="home-poe">
    <help-alert title="POE端口设置"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">整机信息</span>
      </div>
      <el-row :gutter="30">
        <el-col :md="8" :sm="12" :xs="24">
          <el-card class="tc" shadow="never">
            <h2>总功率</h2>
            <p>
              <strong class="c-success fs22">{{globalInfo.machinePower}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-card class="tc" shadow="never">
            <h2>使用功率</h2>
            <p>
              <strong class="c-success fs22">{{globalInfo.machineUsePower}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-card class="tc" shadow="never">
            <h2>工作情况</h2>
            <p>
              <strong class="c-danger fs22" v-show="globalInfo.machineFaultInfo===1">异常</strong>
              <strong class="c-success fs22" v-show="globalInfo.machineFaultInfo===0">正常</strong>
            </p>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">端口列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量设置端口</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="POE状态">
          <template slot-scope="{row}">
            <span v-if="row.enable===0">关闭</span>
            <span v-if="row.enable===1">开启</span>
            <span class="c-danger" v-if="row.enable===2">异常</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否上电">
          <template slot-scope="{row}">
            <span v-if="row.pdStatus===0">否</span>
            <span v-else>是</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="PD等级" prop="pdClass"></el-table-column>
        <el-table-column align="center" label="当前功率(W)" prop="power"></el-table-column>
        <el-table-column align="center" label="非标模式" prop="nonstanMode">
          <template slot-scope="{row}">
            <span v-if="row.nonstanMode===0">否</span>
            <span v-else>是</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="信息" prop="faultInfo"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}">编辑</el-button>
            <el-button :disabled="row.pdStatus===0" size="mini" type="text" v-auth="{fn:_onReset,params:$index}">重新上电</el-button>
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
        v-show="pageTotal"
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
          <el-form-item label="POE功能：" prop="enable">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.enable">
              <el-option :value="0" label="关闭"></el-option>
              <el-option :value="1" label="开启"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="非标模式：" prop="nonstanMode">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.nonstanMode">
              <el-option :value="0" label="关闭"></el-option>
              <el-option :value="1" label="开启"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" mutilple />
          </template>
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
import { Row, Col, Card } from 'element-ui'
import { port } from '@/model/msw/poe'
export default {
  name: 'home-poe',
  mixins: [pageMixins, formMixins],
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Card.name]: Card,
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      isLoading: false,
      globalInfo: {
        machineFaultInfo: 0,
        machineUsePower: 45,
        machinePower: 200
      },
      baseModel: port(),
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    modalTitle() {
      let _item = this.pageList[this.editIndex]
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
        let _result = await this.$api.cmd('devSta.get', {
          module: 'poe'
        })
        let { data, ...info } = _result
        this.globalInfo = info || {}
        return data
      } catch (error) {
        return []
      }
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = port()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.pageList[index]
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ..._item, portid: [_item.lpid] }
    },
    // poe重启
    _onReset(index) {
      let _item = this.pageList[index]
      this.$confirm(`是否确认重启端口POE功能？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .cmd('devSta.set', {
            module: 'poe',
            params: { portList: [_item.lpid] }
          })
          .then(() => {
            this.$message.success('下发成功')
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          let _data = this.baseModel.portid.map(p => {
            return {
              lpid: p,
              enable: this.baseModel.enable,
              nonstanMode: this.baseModel.nonstanMode
            }
          })
          this.$api
            .cmd('devConfig.update', {
              module: 'poe',
              data: {
                data: _data
              }
            })
            .then(() => {
              this.baseModalShow = false
              this.refresh()
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    // 提交port数据
    _saveData() {}
  }
}
</script>
<style lang="scss" scoped>
.home-poe {
}
</style>

