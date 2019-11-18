<template>
  <div class="component_sitegroup-tab">
    <help-alert json-key="behaviorSiteGroupJson" title="网站分组">
      <div class="fs14" slot="content">可以添加完整网址(www.baidu.com)或一类网址(如*.56.com) 关键字。必须按照上述格式输入才能正确生效</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          网站分组
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="groupList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            size="small"
            type="primary"
            v-auth="onAdd"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="small" type="primary" v-auth="onDel">批量删除</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
        </div>
      </help-alert>
      <el-table :data="groupList" ref="baseTable" size="mini" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="组名称" prop="alias_name"></el-table-column>
        <el-table-column align="center" label="组成员" prop="url_list">
          <template slot-scope="scope">
            <span v-if="scope.row.url_list.length<=1">{{scope.row.url_list[0]}}</span>
            <div v-else>
              <span>{{scope.row.url_list[0]}}...</span>
              <el-popover :title="`组成员（${scope.row.url_list.length}）`" placement="right" trigger="click">
                <div class="max-w300 popover-container">
                  <el-tag
                    :key="scope.row.entry_name+index+'-'+app"
                    class="mr10 mb10"
                    type="success"
                    v-for="(app,index) in scope.row.url_list"
                  >{{app}}</el-tag>
                </div>
                <a class="pointer f-theme" href="javascript:;" slot="reference">更多</a>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="isLoading" type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
            <el-button :disabled="isLoading" type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分组编辑modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
        <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm">
          <el-form-item label="组名称" prop="alias_name">
            <input name="behaviorSiteGroupName" type="text" v-show="false" />
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.alias_name"
              class="w300"
              name="behaviorSiteGroupName"
              placeholder="组名称（1-64个字符）"
              v-model="baseModel.alias_name"
            ></el-input>
          </el-form-item>
          <el-form-item label="组成员" prop="url_list">
            <el-input
              :rows="6"
              class="w300"
              placeholder="可以添加完整网址(www.baidu.com)或一类网址(如*.56.com) 关键字"
              type="textarea"
              v-model="urlTranslate"
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false">取 消</el-button>
          <el-button @click="onModalConfirm" type="primary">确 定</el-button>
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
        cb(new Error(`组成员不能为空`))
        return
      }
      let _invalid = value.filter(acc => {
        return !(urlRegexp.test(acc) || /^\*\.([\w+\.])+/.test(acc))
      })
      if (_invalid && _invalid.length) {
        cb(new Error(`组成员:${_invalid.join(',')}无效`))
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
          { required: true, message: '组名称不能为空' },
          { validator: nameLengthValidator, size: 64 }
        ],
        url_list: [
          { required: true, message: '组成员不能为空' },
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
      return this.editIndex !== -1 ? '编辑分组' : '添加分组'
    },
    urlTranslate: {
      get() {
        return (this.baseModel.url_list || []).join('\n')
      },
      set(v) {
        v = v.replace(/(^\s*)|(\s*$)|(\n*$)|(^\n*)/g, '')
        this.baseModel.url_list = [...new Set(v.split(/\s+|\n+/) || [])].filter(
          v => !!v
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
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除？').then(() => {
        this.isLoading = true
        this.$api
          .delSiteGroup({ names: _items.map(ite => ite.entry_name) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.groupList.findIndex(d => d === ite)
              this.groupList.splice(_index, 1)
            })
            this.$message({
              message: '删除成功',
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
            message: '配置成功',
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
