<template>
  <div class="advanced-acl-ace">
    <!-- <help-alert title="ACL列表"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.acl.access_ctrl')}}</span>
        <div class="fr">
          <el-button
            :disabled="isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="_onAddAcl"
          >{{$t('action.add')}}</el-button>
          <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="_onDelAcl">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="msw.limit_tip" tag="span">
            <b class="c-warning mlr5">{{maxLimit}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column :selectable="_isSelectionable" type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('msw.desc')" align="center" prop="name"></el-table-column>
        <el-table-column :label="$t('msw.acl.ctrl_type')" align="center" prop="type">
          <template slot-scope="{row}">
            <span v-if="row.type===1">{{$t('msw.acl.mac_ctrl')}}</span>
            <span v-if="row.type===2">{{$t('msw.acl.ip_ctrl')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('phrase.status')" align="center" prop="binding">
          <template slot-scope="{row}">
            <span class="c-success" v-if="row.bindcnt!==0">{{$t('phrase.effective')}}</span>
            <span v-else>{{$t('phrase.ineffective')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <el-button size="medium" type="text" v-auth="{fn:_onViewRule,params:row.uuid}">{{$t('msw.acl.view_rule')}}</el-button>
            <el-button
              :disabled="row.bindcnt>0"
              size="medium"
              type="text"
              v-auth="{fn:_onEditAcl,params:$index}"
            >{{$t('action.edit')}}</el-button>
            <el-button
              :class="{'c-danger':row.bindcnt===0}"
              :disabled="row.bindcnt>0"
              size="medium"
              type="text"
              v-auth="{fn:_onDelAcl,params:row.uuid}"
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
      <!-- ACL -->
      <el-dialog
        :close-on-click-modal="false"
        :title="aclModalTitle"
        :visible.sync="aclModalShow"
        @open="_clearValidate('aclForm')"
        append-to-body
        width="700px"
      >
        <el-form :model="aclModel" :rules="aclRules" @submit.native.prevent label-width="160px" ref="aclForm" size="medium">
          <el-form-item :label="$t('msw.acl.acl_name_f')" prop="name">
            <el-input :placeholder="$t('msw.acl.acl_name_tip')" class="w300" v-model="aclModel.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('msw.acl.access_ctrl_type_f')" prop="type">
            <el-radio-group :disabled="editIndex!==-1" v-model="aclModel.type">
              <el-radio :label="1">{{$t('msw.acl.mac_ctrl_type')}}</el-radio>
              <el-radio :label="2">{{$t('msw.acl.ip_ctrl_type')}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="aclModalShow = false" class="w120">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click="_onAclModalConfirm"
            class="w120"
            type="primary"
          >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>

      <el-drawer
        :title="`【${currentAcl.name}】${$t('msw.acl.cfg_rule')}`"
        :visible.sync="ruleModalShow"
        :wrapperClosable="false"
        append-to-body
        direction="rtl"
        size="700px"
      >
        <acl-ace :acl="currentAcl" :times="timeList" v-if="ruleModalShow" />
      </el-drawer>
    </div>
  </div>
</template>
<script>
import { Checkbox, Drawer } from 'element-ui'
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import Ace from './Ace'
import {
  nameLengthValidator,
  rangeHexValidator,
  rangeValidator,
  macValidator,
  ipValidator,
  intValidator
} from '@/utils/rules'
import { isBetween, intValidate } from '@/utils/rulesUtils'
import { acl } from '@/model/msw/advanced'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'advanced-acl-ace',
  mixins: [pageMixins, formMixins],
  components: {
    [Drawer.name]: Drawer,
    [Checkbox.name]: Checkbox,
    [Ace.name]: Ace
  },
  data() {
    // acl名称验证
    const aclNameValidator = (r, v, cb) => {
      let _index = this.pageModel.allItem.findIndex(acl => acl.name === v)
      if (_index > -1 && this.editIndex !== _index) {
        return cb(new Error(I18N.t('msw.acl.name_is_exist', { name: v })))
      }
      if (!v.trim()) {
        return cb(new Error(I18N.t('msw.acl.name_is_invalid')))
      }
      cb()
    }
    return {
      isLoading: false,
      // 时间列表
      timeList: [],
      editIndex: -1,
      // 当前acl值
      aclUuid: '',
      aclModel: acl(),
      aclRules: {
        name: [
          { required: true, message: I18N.t('msw.acl.name_no_empty') },
          {
            validator: nameLengthValidator,
            max: 32
          },
          { validator: aclNameValidator }
        ]
      },
      aclModalShow: false,
      ruleModalShow: false,
      maxLimit: window.APP_CAPACITY_SW.acl.acl_num
    }
  },
  computed: {
    aclModalTitle() {
      return this.editIndex !== -1
        ? I18N.t('action.edit')
        : I18N.t('action.add')
    },
    // 当前acl
    currentAcl() {
      return this.pageModel.allItem.find(acl => acl.uuid === this.aclUuid) || {}
    }
  },
  methods: {
    // 加载acl列表
    async _loadList() {
      try {
        // let params = [
        //   { method: 'devSta.get', params: { module: 'acl' } },
        //   { method: 'acConfig.get', params: { module: 'tmngt' } }
        // ]
        // let [acl, tmngt] = await this.$api.cmd('cmdArr', { params })
        let acl = await this.$api.cmd('devSta.get', { module: 'acl' })
        // let _timeList = Array.isArray(tmngt.list) ? tmngt.list : []
        // this.timeList = Object.freeze(
        //   _timeList.filter(lis => lis.type !== 'auto')
        // )
        return acl.list
      } catch (error) {
        return []
      }
    },
    // 是否可勾选
    _isSelectionable(row, index) {
      return row.bindcnt === 0
    },
    // 查看规则
    _onViewRule(uuid) {
      this.aclUuid = uuid
      this.ruleModalShow = true
    },
    // 添加acl
    _onAddAcl() {
      if (this.pageModel.allItem.length === this.maxLimit) {
        this.$alert(I18N.t('msw.acl.acl_has_limit'), { type: 'warning' })
        return
      }
      this.aclModalShow = true
      this.editIndex = -1
      this.aclModel = acl()
    },
    // 编辑ACL
    _onEditAcl(index) {
      this.aclModalShow = true
      this.editIndex = index
      this.aclModel = { ...this.getItem(this.editIndex) }
    },
    // 删除ACL
    async _onDelAcl(uuid) {
      let _uuids = uuid
        ? [uuid]
        : this.$refs.baseTable.selection.map(s => s.uuid)
      if (!_uuids.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        await this.$api.cmd('devSta.del', {
          module: 'acl',
          data: { uuid: _uuids }
        })
        this.$message.success(I18N.t('tip.del_success'))
        this.refresh()
      } catch (error) {}
    },
    // 确认添加acl
    _onAclModalConfirm() {
      this.$refs.aclForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          let _model = this.aclModel
          let _isEdit = this.editIndex !== -1
          try {
            if (!_isEdit) {
              await this.$api.cmd('devSta.add', {
                module: 'acl',
                data: { type: _model.type, name: _model.name }
              })
            } else {
              await this.$api.cmd('devSta.update', {
                module: 'acl',
                data: { uuid: _model.uuid, name: _model.name }
              })
            }
            this.$message.success(
              `${
                _isEdit ? I18N.t('tip.edit_success') : I18N.t('tip.add_success')
              }`
            )
            this.aclModalShow = false
            this.refresh()
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>

