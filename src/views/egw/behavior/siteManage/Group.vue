<template>
  <div class="component_sitegroup-tab">
    <help-alert json-key="behaviorSiteGroupJson" :title="$t('egw.SiteManage.web_group')">
      <div class="fs14" slot="content">{{$t('egw.SiteManage.web_group_tip')}}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.SiteManage.web_group')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="groupList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{maxLimit}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="groupList" ref="baseTable" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" :label="$t('egw.SiteManage.group_name')" prop="alias_name"></el-table-column>
        <el-table-column align="center" :label="$t('egw.SiteManage.group_member')" prop="url_list">
          <template slot-scope="scope">
            <span v-if="scope.row.url_list.length<=1">{{scope.row.url_list[0]}}</span>
            <div v-else>
              <span>{{scope.row.url_list[0]}}...</span>
              <el-popover :title="$t('egw.SiteManage.group_member') + `（${scope.row.url_list.length}）`" placement="right" trigger="click">
                <div class="max-w300 popover-container">
                  <el-tag
                    :key="scope.row.entry_name+index+'-'+app"
                    class="mr10 mb10"
                    type="success"
                    v-for="(app,index) in scope.row.url_list"
                  >{{app}}</el-tag>
                </div>
                <a class="pointer f-theme" href="javascript:;" slot="reference">{{$t('egw.more')}}</a>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:onEdit,params:scope.$index}">{{$t('action.edit')}}</el-button>
            <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:onDel,params:scope.row}">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分组编辑modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
        <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.SiteManage.group_name')" prop="alias_name">
            <input name="behaviorSiteGroupName" type="text" v-show="false" />
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.alias_name"
              class="w300"
              name="behaviorSiteGroupName"
              :placeholder="$t('egw.SiteManage.group_name_tip')"
              v-model="baseModel.alias_name"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.SiteManage.group_member')" prop="url_list">
            <el-input
              :rows="6"
              class="w300"
              :placeholder="$t('egw.SiteManage.group_member_tip')"
              type="textarea"
              v-model="urlTranslate"
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import { urlRegexp } from '@/utils/rulesUtils'
import formMixins from '@/mixins/formMixins'
import model from '@/model'
import { Tag } from 'element-ui'
export default {
  name: 'SiteGroupTab',
  data() {
    const urlValidator = (rule, value, cb) => {
      if (!this.urlTranslate) {
        cb(new Error(this.$t('egw.SiteManage.group_member_is_required')))
        return
      }
      let _invalid = value.filter(acc => {
        return !!acc && !(urlRegexp.test(acc) || /^\*\.([\w+\.])+/.test(acc))
      })
      if (_invalid && _invalid.length) {
        cb(new Error(this.$t('egw.SiteManage.invalid_group_member',{str: _invalid.join(',')})))
        return
      }
      // https校验
      // let _invalidHttps = value.filter(acc => {
      //   return /^https.*/.test(acc)
      // })
      // if (_invalidHttps && _invalidHttps.length) {
      //   cb(new Error(`组成员:${_invalid.join(',')}无效(不支持https类型)`))
      //   return
      // }
      cb()
    }
    return {
      baseModel: model.behaviorSiteGroupManageFn(),
      baseRules: {
        alias_name: [
          { required: true, message: this.$t('egw.SiteManage.group_name_is_required') },
          { validator: nameLengthValidator, size: 64 }
        ],
        url_list: [
          { required: true, message: this.$t('egw.SiteManage.group_member_is_required') },
          { validator: urlValidator }
        ]
      },
      maxLimit: 20,
      editIndex: -1,
      isLoading: true,
      baseModalShow: false,
      groupList: []
    }
  },
  mixins: [formMixins],
  components: {
    [Tag.name]: Tag
  },
  created() {
    this._loadGroupList()
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? this.$t('egw.SiteManage.group_edit')  : this.$t('egw.SiteManage.group_add')
    },
    urlTranslate: {
      get() {
        return (this.baseModel.url_list || []).join('\n')
      },
      set(v) {
        v = v.replace(/^\n+/g, '')
        this.baseModel.url_list = [...new Set(v.split(/\n+/) || [])].map(v =>
          v.trim()
        )
      }
    }
  },
  methods: {
    // 加载分组列表
    async _loadGroupList() {
      try {
        this.isLoading = true
        let _result = await this.$api.getSiteGroupList()
        this.groupList = _result || []
      } finally {
        this.isLoading = false
      }
    },
    // 新增分组
    onAdd() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = model.behaviorSiteGroupManageFn()
      this._clearValidate()
    },
    // 编辑分组
    onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = { ...this.groupList[index] }
      this._clearValidate()
    },
    //删除分组
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.isLoading = true
        this.$api
          .delSiteGroup({ names: _items.map(ite => ite.entry_name) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.groupList.findIndex(d => d === ite)
              this.groupList.splice(_index, 1)
            })
            this.$message({
              message: this.$t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 编辑分组确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交数据
    _onSubmit() {
      this.baseModel.url_list = this.baseModel.url_list.filter(v => !!v)
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.groupList[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _isnew = this.editIndex === -1
      this.$api
        .setSiteGroup({ ...this.baseModel }, _isnew)
        .then(d => {
          if (_isnew) {
            this.groupList.push({ ...this.baseModel, entry_name: d.entry_name })
          } else {
            this.groupList.splice(this.editIndex, 1, { ...this.baseModel })
          }
          this.$message({
            message: this.$t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
