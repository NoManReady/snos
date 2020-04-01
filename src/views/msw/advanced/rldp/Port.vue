<template>
  <div class="advanced-rldp-port">
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
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
        <el-table-column :label="$t('msw.rldp.loop_status')" align="center" prop="detect_enable">
          <template slot-scope="{row}">
            <span v-if="row.detect_enable===1">{{$t('phrase.enable')}}</span>
            <span v-else>{{$t('phrase.disable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.rldp.loop_action')" align="center" prop="detect_action">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.detect_action===0">--</span>
            <span v-if="row.detect_action===1">{{$t('msw.rldp.port_err_1')}}</span>
            <span v-if="row.detect_action===2">{{$t('msw.rldp.port_err_2')}}</span>
            <span v-if="row.detect_action===3">{{$t('msw.rldp.port_err_3')}}</span>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.rldp.loop_status_f')" prop="detect_enable">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.detect_enable"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('msw.rldp.loop_action_f')" prop="detect_action" v-if="baseModel.detect_enable===1">
            <el-radio-group v-model="baseModel.detect_action">
              <el-radio :label="1" v-show="!hasContainLagid">{{$t('msw.rldp.port_err_1')}}</el-radio>
              <el-radio :label="2" v-show="!hasContainLagid">{{$t('msw.rldp.port_err_2')}}</el-radio>
              <el-radio :label="3">{{$t('msw.rldp.port_err_3')}}</el-radio>
            </el-radio-group>
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
import { rldpPort } from '@/model/msw/advanced'
import { isPhyPort, hasLagmemberByLpid } from '@/utils/lag'
import { rangeValidator } from '@/utils/rules'
import { mapGetters } from 'vuex'
export default {
  name: 'advanced-rldp-port',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      isLoading: false,
      baseModel: rldpPort(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['uplink', 'portinfo']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    },
    hasContainLagid() {
      let _lpid = this.baseModel.portid
      return _lpid.find(id => !isPhyPort(id))
    }
  },
  watch: {
    'baseModel.portid'(v) {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    'baseModel.detect_enable'(v) {
      if (v === 0) {
        this.baseModel.detect_action = 0
      } else {
        this.baseModel.detect_action = this.hasContainLagid
          ? 3
          : this.baseModel.detect_action || 1
      }
    },
    hasContainLagid(v) {
      if (v && this.baseModel.detect_enable) {
        this.baseModel.detect_action = 3
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'rldp_port'
        })
        return (
          _result.list
            .map(lis => {
              return {
                ...lis,
                ...this.portinfo.find(p => p.lpid === lis.lpid)
              }
            })
            // 过滤逻辑口和具有成员口的聚合口
            .filter(port => {
              return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
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
      this.baseModel = rldpPort()
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
              module: 'rldp_port',
              data: {
                list: _confirmData
              }
            })
            this.$message.success(I18N.t('tip.edit1_success'))
            // this.refresh()
            for (let _port of _confirmData) {
              let _index = this.pageModel.allItem.findIndex(
                item => item.lpid === _port.lpid
              )
              if (_index > -1) {
                this.pageModel.allItem.splice(_index, 1, {
                  ...this.pageModel.allItem[_index],
                  ..._port
                })
              }
            }
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
          if (columnIndex === 3) {
            return {
              rowspan: 1,
              colspan: 3
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

