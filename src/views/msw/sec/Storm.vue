<template>
  <div class="sec-storm">
    <!-- <help-alert title="风暴控制">
      <div slot="content">配置交换机端口风暴控制</div>
    </help-alert>-->
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
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
          <el-button
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onPatchRemove"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.storm.broadcast')" align="center" prop="broadcast">
          <template slot-scope="{row}">
            <span v-if="row.broadcast">{{row.broadcast}}{{row.control_type===0?'pps':'kbps'}}</span>
            <span v-else>{{$t('msw.rate.no_limit')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.storm.unknow_multilcast')" align="center" prop="multicast">
          <template slot-scope="{row}">
            <span v-if="row.multicast">{{row.multicast}}{{row.control_type===0?'pps':'kbps'}}</span>
            <span v-else>{{$t('msw.rate.no_limit')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.storm.unknow_unicast')" align="center" prop="unicast">
          <template slot-scope="{row}">
            <span v-if="row.unicast">{{row.unicast}}{{row.control_type===0?'pps':'kbps'}}</span>
            <span v-else>{{$t('msw.rate.no_limit')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <!-- <span class="c-info" v-if="row.aggregate_port>0">当前口属于lag{{row.aggregate_port}},不可配置</span> -->
            <template>
              <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
              <el-button
                class="c-danger"
                size="medium"
                type="text"
                v-auth="{fn:_onPatchRemove,params:row.lpid}"
              >{{$t('action.delete')}}</el-button>
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
          <el-form-item :label="$t('msw.storm.cfg_type_f')" prop="control_type" v-if="!isGlobalCtrlType">
            <el-radio-group v-model="baseModel.control_type">
              <!-- <el-radio :label="0">按带宽百分比</el-radio> -->
              <el-radio :label="0">{{$t('msw.storm.by_pack')}}</el-radio>
              <el-radio :label="1">{{$t('msw.storm.by_byte')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('msw.storm.broadcast_f')" prop="broadcast">
            <el-input :placeholder="$t('msw.rate.empty_rate_tip')" class="w300" v-model.number="baseModel.broadcast"></el-input>
            <span>{{ctrlSymbol}}（{{`${range[0]}~${range[1]}`}}）</span>
          </el-form-item>
          <el-form-item :label="$t('msw.storm.unknow_multilcast_f')" prop="multicast">
            <el-input :placeholder="$t('msw.rate.empty_rate_tip')" class="w300" v-model.number="baseModel.multicast"></el-input>
            <span>{{ctrlSymbol}}（{{`${range[0]}~${range[1]}`}}）</span>
          </el-form-item>
          <el-form-item :label="$t('msw.storm.unknow_unicast_f')" prop="unicast">
            <el-input :placeholder="$t('msw.rate.empty_rate_tip')" class="w300" v-model.number="baseModel.unicast"></el-input>
            <span>{{ctrlSymbol}}（{{`${range[0]}~${range[1]}`}}）</span>
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
        return cb(
          I18N.t('msw.storm.storm_limit', {
            range: `${this.range[0]}~${this.range[1]}`
          })
        )
      }
    }
    return {
      isLoading: false,
      // 全局下有用(真实值)
      realCtrlType: '',
      // 临时值
      ctrlModel: {
        control_type: ''
      },
      baseModel: storm(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }],
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
    ...mapGetters('switcher', ['piMap', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    },
    // 真实配置类型控制方式（临时值，控制配置时的页面显示）
    ctrlConfType() {
      let _ctrl = null
      if (this.isGlobalCtrlType) {
        // 全局的不同配置接口，需使用真实值
        _ctrl = this.realCtrlType
      } else {
        _ctrl = this.baseModel.control_type
      }
      return _ctrl
    },
    // 配置符号
    ctrlSymbol() {
      if (this.ctrlConfType === 0) {
        return 'pps'
      } else {
        return 'kbps'
      }
    },
    // 配置范围
    range() {
      let _field = this.ctrlConfType === 0 ? 'pps' : 'bps'
      if (this.isGlobalCtrlType) {
        return APP_CAPACITY_SW.storm[`global_${_field}`]
      } else {
        let _portid = this.baseModel.portid
        let _attr = judgePortAttrMutil(_portid)
        let _range = APP_CAPACITY_SW.storm[`t_${_field}`]
        if (_attr.hasGPort) {
          _range = APP_CAPACITY_SW.storm[`g_${_field}`]
        }
        if (_attr.hasFPort) {
          _range = APP_CAPACITY_SW.storm[`m_${_field}`]
        }
        return _range
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
    // 全局真实值变化，更新项目所有选项
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
          // 等待项目列表更新完成
          this.$nextTick(() => {
            this.realCtrlType = _result.control_type
          })
        }
        let _list = _result.data
          .sort((a, b) => a.lpid - b.lpid)
          .map((port, index) => {
            return {
              ...port,
              ifname: this.piMap[port.lpid]
            }
          })
        return _list
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
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        await this.$api.cmd('devConfig.del', {
          module: 'storm',
          data: { storm_list: _lpids }
        })
        this.pageModel.allItem = this.pageModel.allItem.filter(
          item => !_lpids.includes(item.lpid)
        )
        // this.refresh()
        this.$message.success(I18N.t('tip.del_success'))
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
            this.$message.success(I18N.t('tip.edit_success'))
            // this.refresh()
            for (let _port of _confirmData) {
              let _index = this.pageModel.allItem.findIndex(
                item => item.lpid === _port.lpid
              )
              if (_index > -1) {
                let {
                  broadcast,
                  unicast,
                  multicast,
                  ...oldItem
                } = this.pageModel.allItem[_index]
                this.pageModel.allItem.splice(_index, 1, {
                  ...oldItem,
                  ..._port
                })
              } else {
                this.pageModel.allItem.push({
                  ifname: this.piMap[_port.lpid],
                  ..._port
                })
              }
            }
            this.baseModalShow = false
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
    // 合并策略方法
    // _spanMethods({ row, column, rowIndex, columnIndex }) {
    //   if (row.aggregate_port > 0) {
    //     if (columnIndex > 0) {
    //       if (columnIndex === 4) {
    //         return {
    //           rowspan: 1,
    //           colspan: 4
    //         }
    //       } else {
    //         return {
    //           rowspan: 0,
    //           colspan: 0
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
</script>

