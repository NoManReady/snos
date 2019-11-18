<template>
  <div class="behavior-application-control">
    <help-alert json-key="behaviorAppControlJson" title="应用控制"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          应用控制
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="visiterList.length>=maxLimit||isLoading"
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
      <el-table :data="visiterList" :row-key="row=>row.policy" ref="baseTable" size="mini" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="受管理IP地址组" prop="ip_group">
          <template slot-scope="{row}">
            <ip-detail :ipGroups="ipGroups" :row="row" v-if="ipGroups.length"></ip-detail>
          </template>
        </el-table-column>
        <el-table-column align="center" label="受管理时间段" prop="tr_group">
          <template slot-scope="{row}">
            <time-detail :row="row" :timeGroups="timeGroups" v-if="timeGroups.length"></time-detail>
          </template>
        </el-table-column>
        <el-table-column align="center" label="禁用列表" prop="member">
          <template slot-scope="scope">
            <div v-if="scope.row.applist&&scope.row.applist.length">
              <span v-if="scope.row.applist.length===1">{{scope.row.applist[0]||''}}</span>
              <div v-else>
                <span>{{scope.row.applist[0]}}...</span>
                <el-popover :title="`禁用列表(${scope.row.applist.length})`" placement="right" trigger="click">
                  <div class="max-w450" style="max-height: 500px;overflow-y: auto;">
                    <el-tag :key="app" class="mr10 mb10" type="success" v-for="app of scope.row.applist">{{app}}</el-tag>
                  </div>
                  <a class="pointer f-theme" href="javascript:;" slot="reference">更多</a>
                </el-popover>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="enable">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.enable==='1'?'点击关闭':'点击开启'" effect="dark" placement="right">
              <div @click="_toggleEnable(scope.row.enable,scope.$index)" class="vm">
                <span class="c-success pointer" v-if="scope.row.enable==='1'">
                  启用
                  <i class="el-icon-circle-check"></i>
                </span>
                <span class="c-warning pointer" v-else>
                  未启用
                  <i class="el-icon-circle-close"></i>
                </span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注" prop="comment"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="isLoading" type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
            <el-button :disabled="isLoading" type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item label="受管理IP地址组" prop="ip_group">
            <el-select class="w260" placeholder="请选择" v-model="baseModel.ip_group">
              <el-option :key="item.ip_group" :label="item.name" :value="item.ip_group" v-for="item in ipGroups"></el-option>
              <el-option label="自定义" value></el-option>
            </el-select>
          </el-form-item>
          <template v-if="baseModel.ip_group === ''">
            <el-form-item class="is-required" label="自定义" prop="ip_slots">
              <el-form-item
                :class="{mb20:index!==baseModel.ip_slots.length-1}"
                :key="index"
                :prop="`ip_slots[${index}]`"
                :rules="ipValidate(baseModel.ip_slots,index)"
                v-for="(item,index) in baseModel.ip_slots"
              >
                <el-input class="w260" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.ip_slots[index]"></el-input>
                <el-button @click="onDelIpList(index)" size="medium" type="text" v-if="baseModel.ip_slots.length > 1">
                  <i class="el-icon-close"></i>
                </el-button>
                <el-button
                  @click="onAddIpList"
                  size="medium"
                  type="text"
                  v-if="index === baseModel.ip_slots.length - 1 && baseModel.ip_slots.length < 5"
                >
                  <i class="el-icon-plus"></i>
                </el-button>
              </el-form-item>
            </el-form-item>
          </template>
          <el-form-item label="受管理时间段" prop="tr_group">
            <el-select class="w260" placeholder="请选择" v-model="baseModel.tr_group">
              <el-option :key="item.tmngtName" :label="item.tmngtName" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
              <el-option label="自定义" value></el-option>
            </el-select>
          </el-form-item>
          <template v-if="baseModel.tr_group === ''">
            <el-form-item class="hide" label="时间设置" prop="time_mode">
              <el-radio-group v-model="baseModel.time_mode">
                <el-radio label="calendar">日历</el-radio>
                <!-- <el-radio label="input">手动设置</el-radio> -->
              </el-radio-group>
            </el-form-item>
            <template v-if="baseModel.time_mode==='calendar'">
              <el-form-item class="is-required" label="日历" prop="tr_slots">
                <span @click="onOpenTimeSelection(baseModel.tr_slots,true)" class="f-theme pointer">
                  <i class="el-icon-date"></i>
                  选择时间
                </span>
              </el-form-item>
            </template>
            <template v-else></template>
          </template>
          <el-form-item label="禁用列表" prop="applist">
            <treeselect :multiple="true" :options="appTree" class="w260" v-model="baseModel.applist" />
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <el-input class="w260" v-model="baseModel.comment"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="enable">
            <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false">取 消</el-button>
          <el-button :disabled="isLoading" @click="onModalConfirm" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import IpDetail from '@/common/IpDetail'
import TimeDetail from '@/common/TimeDetail'
import { nameLengthValidator } from '@/utils/rules'
import timeSelection from '@/utils/timeSelection'
import { judgeIpRangeRules } from '@/utils/commonValidates'
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import Treeselect from '@riophae/vue-treeselect'
import { Tag } from 'element-ui'
import clone from 'clone'
export default {
  name: 'BehaviorApplicationControl',
  data() {
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      baseModel: model.behaviorApplicationControlFn(),
      baseRules: {
        applist: [{ required: true, message: '受管理网站类型至少选择一个' }],
        tr_slots: [{ validator: timeValidator, message: '请选择时间范围' }],
        comment: [
          {
            validator: nameLengthValidator,
            size: 64,
            message: '组名称不能超过64个字符，中文占3字符'
          }
        ]
      },
      editIndex: -1,
      baseModalShow: false,
      maxLimit: 20,
      visiterList: [],
      ipGroups: [],
      defaultIpGroup: '',
      timeGroups: [],
      defaultTimeGroup: '',
      websiteGroups: [],
      // id,label,children
      appTree: [],
      isLoading: true
    }
  },
  components: {
    IpDetail,
    TimeDetail,
    Treeselect,
    [Tag.name]: Tag
  },
  async created() {
    await this._loadApplicationList()
    await this._loadIpGroupList()
    await this._loadTimeGroupList()
    this._loadAppTree()
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑应用' : '添加应用'
    }
  },
  methods: {
    // 加载应用列表
    async _loadApplicationList() {
      this.isLoading = true
      try {
        let _result = await this.$api.getApplicationList()
        this.visiterList = _result.map(a => {
          return {
            ...a,
            ip_slots: a.ip_slots.length === 0 ? [''] : a.ip_slots,
            tr_slots: a.tr_slots.length === 0 ? {} : a.tr_slots
          }
        })
      } finally {
        this.isLoading = false
      }
    },
    // 加载ip地址列表
    async _loadIpGroupList() {
      this.ipGroups = await this.$api.getAddrManage(true)
      this.defaultIpGroup = this.ipGroups[0] ? this.ipGroups[0].ip_group : ''
    },
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
      this.defaultTimeGroup = this.timeGroups[0]
        ? this.timeGroups[0].tmngtName
        : ''
    },
    // 加载应用app树
    async _loadAppTree() {
      let _result = await this.$api.getApplicationTree()
      this.appTree = this._getTreeModelData(_result.grp_list || [])
    },
    // 获取树形数据
    _getTreeModelData(tree) {
      let _tree = []
      tree.forEach(tr => {
        if (tr.app_name) {
          let _child = {
            id: tr.app_name,
            label: tr.app_name
          }
          if (tr.app_list && Array.isArray(tr.app_list) && tr.app_list.length) {
            _child.children = this._getTreeModelData(tr.app_list)
          }
          _tree.push(_child)
        }
      })
      return _tree
    },
    // IP范围验证数组
    ipValidate(list, index) {
      return judgeIpRangeRules(list, index)
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.baseModel.tr_slots = d
        this.$refs.baseForm.validateField('tr_slots')
      })
    },
    // 添加IP范围
    onAddIpList() {
      this.baseModel.ip_slots.push('')
    },
    // 删除IP范围
    onDelIpList(index) {
      this.baseModel.ip_slots.splice(index, 1)
    },
    // 新增应用
    onAdd() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = model.behaviorApplicationControlFn(
        this.defaultIpGroup,
        this.defaultTimeGroup
      )
      this._clearValidate()
    },
    // 编辑应用
    onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = clone({
        ...model.behaviorApplicationControlFn(
          this.defaultIpGroup,
          this.defaultTimeGroup
        ),
        ...this.visiterList[index]
      })
      this._clearValidate()
    },
    //删除应用
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
          .delApplicationList({ names: _items.map(ite => ite.policy) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.visiterList.findIndex(d => d === ite)
              this.visiterList.splice(_index, 1)
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
    // 切换策略状态
    _toggleEnable(enable, index) {
      this.editIndex = index
      this.baseModel = {
        ...model.behaviorApplicationControlFn(),
        ...this.visiterList[index],
        enable: enable === '1' ? '0' : '1'
      }
      this._onSubmit()
    },
    // 编辑应用确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交数据
    _onSubmit() {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _isnew = this.editIndex === -1
      this.$api
        .setApplicationList(this.baseModel, _isnew)
        .then(d => {
          if (_isnew) {
            this.visiterList.push({ ...this.baseModel, policy: d.policy })
          } else {
            this.visiterList.splice(this.editIndex, 1, { ...this.baseModel })
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
<style lang="scss">
</style>
