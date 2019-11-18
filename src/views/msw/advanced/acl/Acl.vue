<template>
  <div class="advanced-acl-ace">
    <help-alert title="ACL列表"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">访问控制</span>
        <div class="fr">
          <el-button :disabled="isLoading" icon="el-icon-plus" size="small" type="primary" v-auth="_onAddAcl">新增访问控制</el-button>
          <el-button icon="el-icon-delete" size="small" type="danger" v-auth="_onDelAcl">批量删除访问控制</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column :selectable="_isSelectionable" type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="描述" prop="name"></el-table-column>
        <el-table-column align="center" label="控制类型" prop="type">
          <template slot-scope="{row}">
            <span v-if="row.type===1">基于MAC</span>
            <span v-if="row.type===2">基于IP</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="binding">
          <template slot-scope="{row}">
            <span class="c-success" v-if="row.bindcnt!==0">已生效</span>
            <span v-else>未生效</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <el-button size="mini" type="text" v-auth="{fn:_onViewRule,params:row.uuid}">查看规则</el-button>
            <el-button :disabled="row.bindcnt>0" size="mini" type="text" v-auth="{fn:_onEditAcl,params:$index}">修改</el-button>
            <el-button
              :class="{'c-danger':row.bindcnt===0}"
              :disabled="row.bindcnt>0"
              size="mini"
              type="text"
              v-auth="{fn:_onDelAcl,params:row.uuid}"
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
      <!-- ACL -->
      <el-dialog
        :close-on-click-modal="false"
        :title="aclModalTitle"
        :visible.sync="aclModalShow"
        @open="_clearValidate('aclForm')"
        append-to-body
        width="650px"
      >
        <el-form :model="aclModel" :rules="aclRules" @submit.native.prevent label-width="160px" ref="aclForm" size="small">
          <el-form-item label="ACL名称：" prop="name">
            <el-input class="w260" placeholder="例如：服务器访问控制" v-model="aclModel.name"></el-input>
          </el-form-item>
          <el-form-item label="访问控制类型：" prop="type">
            <el-radio-group :disabled="editIndex!==-1" v-model="aclModel.type">
              <el-radio :label="1">基于MAC地址控制</el-radio>
              <el-radio :label="2">基于IP地址控制</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="aclModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click="_onAclModalConfirm" size="small" type="primary">确定</el-button>
        </span>
      </el-dialog>

      <el-drawer
        :title="`【${currentAcl.name}】规则配置`"
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
        return cb(new Error(`【${v}】已配置过，请重新输入`))
      }
      if (!v.trim()) {
        return cb(new Error('无效的ACL名称，请重新输入'))
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
          { required: true, message: '请输入ACL名称' },
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
      return this.editIndex !== -1 ? '编辑访问控制' : '添加访问控制'
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
        let params = [
          { method: 'devSta.get', params: { module: 'acl' } },
          { method: 'acConfig.get', params: { module: 'tmngt' } }
        ]
        let [acl, tmngt] = await this.$api.cmd(
          'cmdArr',
          { params },
          { noParse: false }
        )
        this.timeList = Object.freeze(
          tmngt.list.filter(lis => lis.type !== 'auto')
        )
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
        this.$alert('ACL已配置最大容量', { type: 'warning' })
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
        return this.$message.warning('请选择要删除的列表项')
      }
      await this.$confirm(`是否确认删除？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      try {
        await this.$api.cmd('devSta.del', {
          module: 'acl',
          data: { uuid: _uuids }
        })
        this.$message.success('删除成功')
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
            this.$message.success(`${_isEdit ? '编辑成功' : '添加成功'}`)
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
<style lang="scss" scoped>
.advanced-acl-ace {
}
</style>

