<template>
  <div class="behavior-qqbwlist">
    <div class="mb20">
      <el-radio :disabled="isLoading" :key="k" :label="k" border v-for="(v,k) in modeMap" v-model="mode">{{v}}</el-radio>
    </div>
    <div v-show="mode">
      <help-alert :json-key="mode==='none'?null:'behaviorQqbwListJson'" :key="mode" :title="modeMap[mode]">
        <div slot="content">
          <p v-show="mode==='black'">只有在QQ黑名单列表下的账号才被阻断</p>
          <p v-show="mode==='white'">只有在QQ白名单列表下的账号才能访问</p>
          <p v-show="mode==='none'"></p>
        </div>
      </help-alert>
      <div class="box" v-show="mode!=='none'">
        <div class="box-header">
          <div class="box-header-tit vm">
            <span v-show="mode==='black'">QQ黑名单</span>
            <span v-show="mode==='white'">QQ白名单</span>
          </div>
          <div class="fr">
            <el-button
              :disabled="qqBwList.length>=maxLimit||isLoading"
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
            <b class="c-warning mlr5">{{maxLimit}}</b>条；QQ总个数支持
            <b class="c-warning mlr5">{{MAX_QQ_NUM}}</b>个。
          </div>
        </help-alert>
        <el-table :data="qqBwList" ref="baseTable" size="mini" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column align="center" label="受管理IP地址组" prop="name">
            <template slot-scope="scope">
              <div v-if="!scope.row.ip_group">
                <p :key="ip" v-for="ip of scope.row.ip_slots">{{ip}}</p>
              </div>
              <template v-else>
                <span v-if="ipGroups.length">{{_getIpgroupName(scope.row.ip_group)}}</span>
                <i class="el-icon-loading fs14 f-theme" v-else></i>
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="受管理时间段" prop="tr_group">
            <template slot-scope="scope">
              <span v-if="scope.row.tr_group">{{scope.row.tr_group}}</span>
              <template v-else>
                <i @click="onOpenTimeSelection(scope.row.tr_slots,false)" class="el-icon-date f-theme pointer"></i>
              </template>
            </template>
          </el-table-column>
          <el-table-column :label="`${mode==='white'?'允许':'禁止'}的QQ号码`" align="center" prop="account" width="130">
            <template slot-scope="scope">
              <div v-if="scope.row.account&&scope.row.account.length">
                <span v-if="scope.row.account.length===1">{{scope.row.account[0]||''}}</span>
                <div v-else>
                  <span>{{scope.row.account[0]}}...</span>
                  <el-popover :title="`QQ号码(${scope.row.account.length})`" placement="right" trigger="click">
                    <div class="max-w450" style="max-height: 500px;overflow-y: auto;">
                      <el-tag :key="app" class="mr10 mb10" type="success" v-for="app of scope.row.account">{{app}}</el-tag>
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
        <el-dialog :title="modalTitle" :visible.sync="baseModalShow" @closed="_onDialogClosed" width="550px">
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
            <el-form-item :label="(mode==='black'?'禁止':'允许')+'的QQ号码'" class="is-required" prop="account">
              <el-input :rows="6" class="w260 vt" placeholder="QQ号码以换行分割，5-11位数字组成" type="textarea" v-model="accountTranslate"></el-input>
              <span class="vm">
                剩余
                <b class="c-success">{{Math.max(qqRemainNum-baseModel.account.length,0)}}</b>个
              </span>
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
            <el-button @click="onModalConfirm" type="primary">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import { judgeIpRangeRules } from '@/utils/commonValidates'
import timeSelection from '@/utils/timeSelection'
import formMixins from '@/mixins/formMixins'
import model from '@/model'
import { Tag } from 'element-ui'
import clone from 'clone'
export default {
  name: 'BehaviorQqbwlist',
  data() {
    // qq合法性限制
    const accountValidator = (rule, value, cb) => {
      if (!this.accountTranslate) {
        cb(new Error(`QQ号码不能为空`))
        return
      }
      let _invalid = value.filter(acc => {
        return !/^[1-9]\d{4,10}$/.test(acc)
      })
      if (_invalid && _invalid.length) {
        cb(new Error(`QQ号码:${_invalid.join(',')}无效`))
        return
      }
      cb()
    }
    // qq个数限制
    const qqLengthValidator = (rule, value, cb) => {
      if (!value) {
        cb()
        return
      }
      if (value.length > this.qqRemainNum) {
        cb(new Error(`QQ号个数不能超过${this.qqRemainNum}个`))
        return
      }
      cb()
    }
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
        return
      }
      cb()
    }
    return {
      modeMap: {
        none: '关闭黑白名单模式',
        black: '黑名单模式',
        white: '白名单模式'
      },
      mode: null,
      isModeFallback: false, //是否为取消切换
      baseModel: model.behaviorQqbwlistFn(),
      baseRules: {
        account: [
          { validator: qqLengthValidator },
          { validator: accountValidator }
        ],
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
      isLoading: true,
      baseModalShow: false,
      maxLimit: 20,
      qqBwList: [],
      ipGroups: [],
      defaultIpGroup: '',
      timeGroups: [],
      defaultTimeGroup: '',
      MAX_QQ_NUM: 200
    }
  },
  components: {
    [Tag.name]: Tag
  },
  async created() {
    await this._loadQqList()
    this._loadIpGroupList()
    this._loadTimeGroupList()
  },
  watch: {
    mode: {
      handler(v, o) {
        // 初始化或则取消切换不执行
        if (!o || this.isModeFallback) {
          this.isModeFallback = false
          return
        }
        this.$confirm(`是否切换到“${this.modeMap[v]}”?`).then(
          () => {
            this.qqBwList = []
            this._setQqBwMode(v).then(() => {
              if (v !== 'none') {
                this._loadQqList()
              }
            })
          },
          () => {
            this.isModeFallback = true
            this.mode = o
          }
        )
      }
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑' : '添加'
    },
    // QQ号字符串
    accountTranslate: {
      get() {
        return (this.baseModel.account || []).join('\n')
      },
      set(v) {
        v = v.replace(/(^s*)|(s*$)|(\n*$)|(^\n*)/g, '')
        this.baseModel.account = [...new Set(v.split(/\s+|\n+/) || [])].filter(
          v => !!v
        )
      }
    },
    // 策略QQ号总条数
    qqPolicyNum() {
      return this.qqBwList.reduce((num, item) => {
        return num + item.account.length || 0
      }, 0)
    },
    // QQ剩余个数
    qqRemainNum() {
      let _remainNum = this.MAX_QQ_NUM - this.qqPolicyNum
      if (this.editIndex !== -1) {
        _remainNum += (this.qqBwList[this.editIndex].account || []).length
      }
      return _remainNum
    }
  },
  methods: {
    // 加载QQ列表
    async _loadQqList() {
      try {
        this.isLoading = true
        let _result = await this.$api.getQqBwList()
        this.qqBwList = (_result.data || []).map(a => {
          return {
            ...a,
            ip_slots: a.ip_slots.length === 0 ? [''] : a.ip_slots,
            tr_slots: a.tr_slots.length === 0 ? {} : a.tr_slots
          }
        })
        if (_result.model) {
          this.mode = _result.model
        }
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
    // 设置模式
    _setQqBwMode(mode) {
      let _promise = null
      if (mode) {
        _promise = this.$api.setQqBwMode({ model: this.mode })
      } else {
        _promise = Promise.resolve(mode)
      }
      return _promise
    },
    // 获取ipGroup名称
    _getIpgroupName(group) {
      let _ip = this.ipGroups.find(ip => ip.ip_group === group)
      return _ip ? _ip.name : group || '--'
    },
    // 获取timeGroup名称
    _getTimegroupName(group) {
      let _time = this.timeGroups.find(time => time.tmngtName === group)
      return _time ? _time.tmngtName : group || '--'
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
    // dialog关闭
    _onDialogClosed() {
      this.$nextTick(() => {
        this.editIndex = -1
      })
    },
    // 新增分组
    onAdd() {
      if (this.qqPolicyNum >= this.MAX_QQ_NUM) {
        return this.$msgbox({
          type: 'warning',
          title: '提示',
          message: `策略QQ号码达到上限:${this.MAX_QQ_NUM}个，不可新增`
        })
      }
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = model.behaviorQqbwlistFn(
        this.defaultIpGroup,
        this.defaultTimeGroup
      )
      this._clearValidate()
    },
    // 编辑分组
    onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = clone({
        ...model.behaviorQqbwlistFn(this.defaultIpGroup, this.defaultTimeGroup),
        ...this.qqBwList[index]
      })
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
          .delQqBwList({ names: _items.map(ite => ite.policy) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.qqBwList.findIndex(d => d === ite)
              this.qqBwList.splice(_index, 1)
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
        ...model.behaviorQqbwlistFn(),
        ...this.qqBwList[index],
        enable: enable === '1' ? '0' : '1'
      }
      this._onSubmit()
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
        JSON.stringify(this.qqBwList[this.editIndex])
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
        .setQqBwList({ ...this.baseModel, model: this.mode }, _isnew)
        .then(d => {
          if (_isnew) {
            this.qqBwList.push({ ...this.baseModel, policy: d.policy })
          } else {
            this.qqBwList.splice(this.editIndex, 1, { ...this.baseModel })
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
