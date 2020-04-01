<template>
  <div class="port-setting-protect">
    <help-alert :title="$t('msw.protect.port_protect')">
      <div slot="content">{{$t('msw.protect.protect_tip')}}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center" prop="enable">
          <template slot-scope="{row,$index}">
            <span class="c-info" v-if="row.aggregate_port>0">{{$t('msw.agg_port_tip',{id:row.aggregate_port})}}</span>
            <el-switch
              :active-value="1"
              :inactive-value="0"
              :value="row.enable"
              @change="_onEnableChange(row,$index)"
              size="medium"
              v-else
            ></el-switch>
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
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.protect.protect_status_f')" prop="enable">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.enable"></el-switch>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" prop="portid"></el-form-item>
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
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }]
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
            return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
          })
        return _list
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
        I18N.t('msw.protect.protect_status_confirm', {
          port: row.ifname,
          status:
            row.enable === 1
              ? I18N.t('phrase.disable')
              : I18N.t('phrase.enable')
        }),
        {
          confirmButtonText: I18N.t('action.confirm'),
          cancelButtonText: I18N.t('action.cancel'),
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
    async _saveData(params) {
      let { portid, ...model } = params
      let _confirmData = portid.map(p => {
        return {
          ...model,
          lpid: p
        }
      })
      this.isLoading = true
      try {
        await this.$api.cmd('devConfig.update', {
          module: 'protected',
          data: { data: _confirmData }
        })
        this.$message.success(I18N.t('tip.edit1_success'))
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
  }
}
</script>

