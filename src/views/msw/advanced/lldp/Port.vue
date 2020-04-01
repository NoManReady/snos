<template>
  <div class="advanced-lldp-port">
    <!-- <help-alert title="LLDP端口设置"></help-alert> -->
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
        <el-table-column :label="$t('msw.lldp.send_lldpdu')" align="center" prop="tx">
          <template slot-scope="{row}">
            <span v-if="row.tx===1">{{$t('phrase.enable')}}</span>
            <span v-else>{{$t('phrase.disable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.receive_lldpdu')" align="center" prop="rx">
          <template slot-scope="{row}">
            <span v-if="row.rx===1">{{$t('phrase.enable')}}</span>
            <span v-else>{{$t('phrase.disable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.media_terminal')" align="center" prop="med">
          <template slot-scope="{row}">
            <span v-if="row.med===1">{{$t('phrase.enable')}}</span>
            <span v-else>{{$t('phrase.disable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{$index}">
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
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
          <el-form-item :label="$t('msw.lldp.send_lldpdu_f')" prop="tx">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.tx"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('msw.lldp.receive_lldpdu_f')" prop="rx">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.rx"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('msw.lldp.media_terminal_f')" prop="med">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.med"></el-switch>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" :showLag="false" mutilple />
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
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }],
        delaytime: [
          { required: true, message: I18N.t('msw.stp.priority_no_empty') },
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
          module: 'lldp_port'
        })
        return _result.list.map(lis => {
          return {
            ...lis,
            ifname: this.piMap[lis.lpid]
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
    }
  }
}
</script>

