<template>
  <div class="sec-storm">
    <help-alert title="风暴控制">
      <div slot="content">配置交换机端口风暴控制</div>
    </help-alert>
    <!-- <div class="box" v-if="isGlobalCtrlType">
      <div class="box-header">
        <span class="box-header-tit">控制类型配置</span>
      </div>
      <el-form :model="ctrlModel" :rules="baseRules" label-width="120px" ref="ctrlForm" size="small">
        <el-form-item label="控制类型：" prop="ctroller_type">
          <el-select v-model="ctrlModel.control_type">
            <el-option :value="0" label="按报文数"></el-option>
            <el-option :value="1" label="按千比特数"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading" @click.native="_onSaveConf" size="small" type="primary">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>-->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量配置</el-button>
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
        <el-table-column align="center" label="广播" prop="broadcast">
          <template slot-scope="{row}">
            <span v-if="row.broadcast">{{row.broadcast}}{{row.control_type===0?'pps':'kbps'}}</span>
            <span v-else>不限制</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="未知名组播" prop="multicast">
          <template slot-scope="{row}">
            <span v-if="row.multicast">{{row.multicast}}{{row.control_type===0?'pps':'kbps'}}</span>
            <span v-else>不限制</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="未知名单播" prop="unicast">
          <template slot-scope="{row}">
            <span v-if="row.unicast">{{row.unicast}}{{row.control_type===0?'pps':'kbps'}}</span>
            <span v-else>不限制</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <!-- <span class="c-info" v-if="row.aggregate_port>0">当前口属于lag{{row.aggregate_port}},不可配置</span> -->
            <template>
              <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}">编辑</el-button>
              <el-button class="c-danger" size="mini" type="text" v-auth="{fn:_onPatchRemove,params:row.lpid}">删除</el-button>
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
        hide-on-single-page
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
          <el-form-item label="配置类型：" prop="control_type" v-if="!isGlobalCtrlType">
            <el-radio-group v-model="baseModel.control_type">
              <!-- <el-radio :label="0">按带宽百分比</el-radio> -->
              <el-radio :label="1">按报文数</el-radio>
              <el-radio :label="2">按千比特数</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="广播：" prop="broadcast">
            <el-input :placeholder="`(${range[0]}~${range[1]})`" class="w180" v-model.number="baseModel.broadcast"></el-input>
            <span>
              {{ctrlSymbol}}（
              <span class="c-warning">不输入表示关闭限速功能</span>）
            </span>
          </el-form-item>
          <el-form-item label="未知名组播：" prop="multicast">
            <el-input :placeholder="`(${range[0]}~${range[1]})`" class="w180" v-model.number="baseModel.multicast"></el-input>
            <span>
              {{ctrlSymbol}}（
              <span class="c-warning">不输入表示关闭限速功能</span>）
            </span>
          </el-form-item>
          <el-form-item label="未知名单播：" prop="unicast">
            <el-input :placeholder="`(${range[0]}~${range[1]})`" class="w180" v-model.number="baseModel.unicast"></el-input>
            <span>
              {{ctrlSymbol}}（
              <span class="c-warning">不输入表示关闭限速功能</span>）
            </span>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="端口：" prop="portid"></el-form-item>
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
import { intValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
import { storm } from '@/model/msw/sec'
import { mapGetters } from 'vuex'
import { judgePortAttrMutil } from '@/utils/lag'
export default {
  name: 'sec-storm',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const rangeValidator = (rule, val, cb) => {
      if (val === '') {
        return cb()
      }
      let _valid = isBetween(val, ...this.range)
      if (_valid) {
        return cb()
      } else {
        return cb(`请输入有效的数值（范围${this.range[0]}~${this.range[1]}）`)
      }
    }
    return {
      isLoading: false,
      realCtrlType: '',
      ctrlModel: {
        control_type: ''
      },
      baseModel: storm(),
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }],
        broadcast: [
          // { required: true, message: '请输入广播值' },
          { validator: rangeValidator }
          // { validator: intValidator }
        ],
        multicast: [
          // { required: true, message: '请输入未知名组播值' },
          { validator: rangeValidator }
          // { validator: intValidator }
        ],
        unicast: [
          // { required: true, message: '请输入未知名单播值' },
          { validator: rangeValidator }
          // { validator: intValidator }
        ]
      },
      baseModalShow: false,
      editIndex: -1,
      isGlobalCtrlType: window.APP_CAPACITY_SW.storm.global_storm
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'lagPort', 'piMap', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item ? `端口：${_item.interface}` : '批量配置'
    },
    // 配置符号
    ctrlSymbol() {
      let _ctrl = null
      if (this.isGlobalCtrlType) {
        _ctrl = this.ctrlModel.control_type
      } else {
        _ctrl = this.baseModel.control_type
      }
      if (_ctrl === 0) {
        return 'pps'
      } else {
        return 'kbps'
      }
    },
    // 配置范围
    range() {
      let _ctrl = null
      if (this.isGlobalCtrlType) {
        _ctrl = this.ctrlModel.control_type
      } else {
        _ctrl = this.baseModel.control_type
      }
      if (_ctrl === 0) {
        return [1, 262143]
      } else {
        let _portid = this.baseModel.portid
        let _attr = judgePortAttrMutil(_portid)
        let _ds = 1
        if (_attr.hasGPort) {
          _ds = 10
        }
        if (_attr.hasFPort) {
          _ds = 100
        }
        return [16, parseInt(10000000 / _ds)]
      }
    }
  },
  watch: {
    'baseModel.portid'(portid) {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    'baseModel.control_type'(v) {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    baseModalShow(v) {
      if (v && this.isGlobalCtrlType) {
        this.ctrlModel.control_type = this.realCtrlType
      }
    },
    realCtrlType(v) {
      if (this.isGlobalCtrlType) {
        this.pageModel.allItem = this.pageModel.allItem.map(port => {
          return {
            ...port,
            control_type: v
          }
        })
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'storm'
        })
        if (this.isGlobalCtrlType) {
          this.ctrlModel.control_type = _result.control_type
          this.$nextTick(() => {
            this.realCtrlType = _result.control_type
          })
        }
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
          module: 'storm',
          data: { storm_list: _lpids }
        })
        this.refresh()
        this.$message.success('删除成功')
      } catch (error) {}
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = storm()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      let _baseModel = {
        ...storm(),
        ..._item,
        portid: [_item.lpid]
      }
      this.baseModel = _baseModel
    },
    // 配置独立控制类型
    _onSaveConf() {
      this.$refs.ctrlForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            await this.$api.cmd('devConfig.update', {
              module: 'storm',
              data: this.ctrlModel
            })
            this.realCtrlType = this.ctrlModel.control_type
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          let { portid, ...model } = this.baseModel
          let _confirmData = portid.map(p => {
            let _data = {
              lpid: p
            }
            if (model.broadcast) {
              _data.broadcast = model.broadcast
            }
            if (model.multicast) {
              _data.multicast = model.multicast
            }
            if (model.unicast) {
              _data.unicast = model.unicast
            }
            if (!this.isGlobalCtrlType) {
              _data.control_type = model.control_type
            }
            return _data
          })
          try {
            await this.$api.cmd('devConfig.update', {
              module: 'storm',
              data: { data: _confirmData }
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
.sec-storm {
}
</style>

