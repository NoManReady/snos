<template>
  <div class="port-mac-filter">
    <help-alert :title="$t('msw.mac.filter_mac_addr')">
      <div slot="content">
        <i18n path="msw.mac.filter_notice_tip">
          <b>{{$t('phrase.explain_f')}}</b>
        </i18n>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.mac.mac_addr_list')}}</span>
        <div class="fr">
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="_onAdd">{{$t('action.add')}}</el-button>
          <el-button
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onPatchRemove"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="msw.limit_tip">
            <b class="c-warning mlr5">{{maxLimit}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('msw.mac.mac_addr')" align="center" prop="macaddr"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="vlanid"></el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row}">
            <el-button
              class="c-danger"
              size="medium"
              type="text"
              v-auth="{fn:_onPatchRemove,params:{vlanid:row.vlanid,macaddr:row.macaddr}}"
            >{{$t('action.delete')}}</el-button>
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
        :title="$t('action.add')"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item :label="$t('wan.mac_addr_f')" prop="macaddr">
            <el-input :placeholder="$t('wan.mac_example')" class="w300" v-model="baseModel.macaddr"></el-input>
          </el-form-item>
          <el-form-item label="VLAN ID：" prop="vlanid">
            <el-input :placeholder="$t('msw.vlan_no_empty')" class="w300" v-model="baseModel.vlanid"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" class="w120">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click.native="_onModalConfirm"
            class="w120"
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
import { vlanidValidator, macStrictValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
import { macBase } from '@/model/msw/port'
import { mapGetters } from 'vuex'
export default {
  name: 'port-mac-filter',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const macCheckOwnerValidator = (r, v, cb) => {
      if (v === '') {
        return cb()
      }
      if (v.toLowerCase() === this.sysinfo.sys_mac.toLowerCase()) {
        return cb(new Error(I18N.t('msw.mac.no_pc_mac', { mac: v })))
      }
      cb()
    }
    return {
      baseModel: macBase(),
      baseRules: {
        vlanid: [
          { required: true, message: I18N.t('msw.vlan_no_empty') },
          { validator: vlanidValidator, message: I18N.t('msw.vlan_is_invalid') }
        ],
        macaddr: [
          { required: true, message: I18N.t('msw.mac_no_empty') },
          { validator: macStrictValidator },
          { validator: macCheckOwnerValidator }
        ]
      },
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      maxLimit: window.APP_CAPACITY_SW.mac.filter
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap']),
    ...mapGetters(['sysinfo'])
  },
  methods: {
    // 加载port列表
    async _loadList(query) {
      try {
        let _result = await this.$api.cmd(
          'devConfig.get',
          {
            module: 'filter_mac',
            data: query
          },
          { noParse: false }
        )
        let _list = (_result.list || []).map(lis => {
          return {
            ...lis,
            ifname: this.piMap[lis.lpid]
          }
        })
        return _list
      } catch (error) {
        return []
      }
    },
    // 添加
    _onAdd() {
      if (this.pageModel.allItem.length === this.maxLimit) {
        this.$alert(I18N.t('msw.mac.filter_limit_over'), { type: 'warning' })
        return
      }
      this.baseModalShow = true
      this.baseModel = macBase()
    },
    // 批量删除
    async _onPatchRemove(item) {
      let _macs = item
        ? [item]
        : this.$refs.baseTable.selection.map(s => ({
            vlanid: s.vlanid,
            macaddr: s.macaddr
          }))
      if (!_macs.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        await this.$api.cmd('devConfig.del', {
          module: 'filter_mac',
          data: {
            list: _macs
          }
        })
        this.refresh()
        this.$message.success(I18N.t('tip.del_success'))
      } catch (error) {}
    },
    // 检查配置是否有效
    _compareConfIsValid() {
      let _model = this.baseModel
      let _isExist = this.pageModel.allItem.findIndex(item => {
        return (
          item.vlanid === _model.vlanid &&
          item.macaddr.toLowerCase() === _model.macaddr.toLowerCase()
        )
      })
      return _isExist === -1
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          if (!this._compareConfIsValid()) {
            this.$alert(I18N.t('msw.mac.cfg_is_exist'), { type: 'error' })
            return
          }
          this.isLoading = true
          try {
            await this.$api.cmd('devConfig.add', {
              module: 'filter_mac',
              data: this.baseModel
            })
            this.baseModalShow = false
            this.$message.success(I18N.t('tip.add_success'))
            // this.refresh()
            this.pageModel.allItem.push({
              ifname: this.piMap[this.baseModel.lpid],
              ...this.baseModel
            })
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>

