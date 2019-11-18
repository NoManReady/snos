<template>
  <div class="port-rate">
    <help-alert title="端口限速"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">端口列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量编辑</el-button>
          <el-button icon="el-icon-delete" size="small" type="danger" v-auth="_onPatchRemove">批量删除</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="入口速率 (kbps)" prop="irate">
          <template slot-scope="{row}">
            <span v-if="row.irate">{{row.irate}}</span>
            <span v-else>不限制</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="出口速率 (kbps)" prop="orate">
          <template slot-scope="{row}">
            <span v-if="row.orate">{{row.orate}}</span>
            <span v-else>不限制</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}">修改</el-button>
            <el-button class="c-danger" size="mini" type="text" v-auth="{fn:_onPatchRemove,params:row.lpid}">删除</el-button>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="150px" ref="baseForm" size="small">
          <el-form-item label="入口速率：" prop="irate">
            <el-input :placeholder="`${rateRange[0]}-${rateRange[1]}`" class="w160" clearable v-model.number="baseModel.irate"></el-input>
            <label class="c-info">
              ({{rateRange[0]}}-{{rateRange[1]}}kbps,
              <span class="c-warning">不输入表示关闭限速功能</span> )
            </label>
          </el-form-item>
          <el-form-item label="出口速率：" prop="orate">
            <el-input :placeholder="`${rateRange[0]}-${rateRange[1]}`" class="w160" clearable v-model.number="baseModel.orate"></el-input>
            <label class="c-info">
              ({{rateRange[0]}}-{{rateRange[1]}}kbps,
              <span class="c-warning">不输入表示关闭限速功能</span> )
            </label>
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
import { rate } from '@/model/msw/port'
import { isBetween } from '@/utils/rulesUtils'
import { mapGetters } from 'vuex'
import { judgePortAttrMutil } from '@/utils/lag'
export default {
  name: 'port-rate',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const rateValidator = (r, v, cb) => {
      // if (!this.baseModel.irate && !this.baseModel.orate) {
      //   return cb(new Error('入口速率和出口速率必须配置一个'))
      // }
      if (!v) {
        return cb()
      }
      if (!isBetween(v, ...this.rateRange)) {
        return cb(
          new Error(`速率配置范围为${this.rateRange[0]}~${this.rateRange[1]}`)
        )
      }
      cb()
    }
    return {
      isLoading: false,
      baseModel: rate(),
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }],
        irate: [
          // { required: true, message: '请输入入口速率' },
          { validator: rateValidator }
        ],
        orate: [
          // { required: true, message: '请输入出口速率' },
          { validator: rateValidator }
        ]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'uplink', 'lagPortsMap']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item ? `端口：${_item.interface}` : '批量配置'
    },
    // 端口限速范围
    rateRange() {
      let _ds = 1
      let _portid = this.baseModel.portid
      if (_portid.length) {
        let _attr = judgePortAttrMutil(_portid)
        if (_attr.hasGPort) {
          _ds = 10
        }
        if (_attr.hasFPort) {
          _ds = 100
        }
      }
      return [16, parseInt(10000000 / _ds)]
    }
  },
  watch: {
    'baseModel.portid'(v) {
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
          module: 'rate_limit'
        })
        let _list = _result.data
          .map(port => {
            return {
              ...port,
              interface: this.piMap[port.lpid]
            }
          })
          .sort((a, b) => a.lpid - b.lpid)
        return Object.freeze(_list)
      } catch (error) {}
      return []
    },
    // 批量删除
    async _onPatchRemove(lpid) {
      let _lpids =
        lpid !== undefined
          ? [lpid]
          : this.$refs.baseTable.selection.map(s => s.lpid)
      if (!_lpids.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      await this.$confirm(`是否确认删除？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      try {
        await this.$api.cmd('devConfig.del', {
          module: 'rate_limit',
          data: { lpid_list: _lpids }
        })
        this.refresh()
        this.$message.success('删除成功')
      } catch (error) {}
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = rate()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ...rate(), ..._item, portid: [_item.lpid] }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            let { portid, ...model } = this.baseModel
            let _confirmData = portid.map(p => {
              let _data = { lpid: p }
              if (model.irate) {
                _data.irate = model.irate
              }
              if (model.orate) {
                _data.orate = model.orate
              }
              return _data
            })
            await this.$api.cmd('devConfig.update', {
              module: 'rate_limit',
              data: { data: _confirmData }
            })
            this.$message.success('配置成功')
            this.refresh()
          } catch (error) {}
          this.baseModalShow = false
          this.isLoading = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.port-rate {
}
</style>

