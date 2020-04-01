<template>
  <div class="behavior-qqbwlist">
    <div class="mb20">
      <el-radio :disabled="isLoading" :key="k" :label="k" border v-for="(v,k) in modeMap" v-model="mode">{{v}}</el-radio>
    </div>
    <div v-show="mode">
      <help-alert :json-key="mode==='none'?null:'behaviorQqbwListJson'" :key="mode" :title="modeMap[mode]">
        <div slot="content">
          <p v-show="mode==='black'">{{$t('egw.QqBwList.qq_black_block')}}</p>
          <p v-show="mode==='white'">{{$t('egw.QqBwList.qq_white_allow')}}</p>
          <p v-show="mode==='none'"></p>
        </div>
      </help-alert>
      <div class="box" v-show="mode!=='none'">
        <div class="box-header">
          <div class="box-header-tit vm">
            <span v-show="mode==='black'">{{$t('egw.QqBwList.qq_black')}}</span>
            <span v-show="mode==='white'">{{$t('egw.QqBwList.qq_white')}}</span>
          </div>
          <div class="fr">
            <el-button
              :disabled="qqBwList.length>=maxLimit||isLoading"
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
            <i18n path="egw.QqBwList.qq_access_number">
                <b class="c-warning mlr5">{{maxLimit}}</b>
                <b class="c-warning mlr5">{{MAX_QQ_NUM}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table :data="qqBwList" ref="baseTable" size="medium" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column align="center" :label="$t('egw.ip_group_manager')" prop="name">
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
          <el-table-column align="center" :label="$t('egw.times_manager')" prop="tr_group">
            <template slot-scope="scope">
              <span v-if="scope.row.tr_group">{{scope.row.tr_group}}</span>
              <template v-else>
                <i @click="onOpenTimeSelection(scope.row.tr_slots,false)" class="el-icon-date f-theme pointer"></i>
              </template>
            </template>
          </el-table-column>
          <el-table-column :label="`${mode==='white'? $t('egw.QqBwList.block_qq_code_f'):$t('egw.QqBwList.block_qq_code_f')}`" align="center" prop="account" width="130">
            <template slot-scope="scope">
              <div v-if="scope.row.account&&scope.row.account.length">
                <span v-if="scope.row.account.length===1">{{scope.row.account[0]||''}}</span>
                <div v-else>
                  <span>{{scope.row.account[0]}}...</span>
                  <el-popover :title="$t('egw.QqBwList.qq_code') +`(${scope.row.account.length})`" placement="right" trigger="click">
                    <div class="max-w450" style="max-height: 500px;overflow-y: auto;">
                      <el-tag :key="app" class="mr10 mb10" type="success" v-for="app of scope.row.account">{{app}}</el-tag>
                    </div>
                    <a class="pointer f-theme" href="javascript:;" slot="reference">{{$t('egw.more')}}</a>
                  </el-popover>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('phrase.status')" prop="enable">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.enable==='1'?$t('egw.close_by_click'):$t('egw.open_by_click')" effect="dark" placement="right">
                <div @click="_toggleEnable(scope.row.enable,scope.$index)" class="vm">
                  <span class="c-success pointer" v-if="scope.row.enable==='1'">
                   {{$t('egw.start_using')}}
                    <i class="el-icon-circle-check"></i>
                  </span>
                  <span class="c-warning pointer" v-else>
                    {{$t('egw.no_start_using')}}
                    <i class="el-icon-circle-close"></i>
                  </span>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('phrase.remark')" prop="comment"></el-table-column>
          <el-table-column align="center" :label="$t('action.ope')">
            <template slot-scope="scope">
              <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:onEdit,params:scope.$index}">{{$t('action.edit')}}</el-button>
              <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:onDel,params:scope.row}">{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 编辑modal -->
        <el-dialog :title="modalTitle" :visible.sync="baseModalShow" @closed="_onDialogClosed" width="550px">
          <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
            <el-form-item :label="$t('egw.ip_group_manager')" prop="ip_group">
              <el-select class="w260" :placeholder="$t('action.select')" v-model="baseModel.ip_group">
                <el-option :key="item.ip_group" :label="item.name" :value="item.ip_group" v-for="item in ipGroups"></el-option>
                <el-option :label="$t('egw.custom')" value></el-option>
              </el-select>
            </el-form-item>
            <template v-if="baseModel.ip_group === ''">
              <el-form-item class="is-required" :label="$t('egw.custom')" prop="ip_slots">
                <el-form-item
                  :class="{mb20:index!==baseModel.ip_slots.length-1}"
                  :key="index"
                  :prop="`ip_slots[${index}]`"
                  :rules="ipValidate(baseModel.ip_slots,index)"
                  v-for="(item,index) in baseModel.ip_slots"
                >
                  <el-input class="w260" :placeholder="$t('wan.ip_range_example')" v-model="baseModel.ip_slots[index]"></el-input>
                  <el-button @click="onDelIpList(index)" type="text" v-if="baseModel.ip_slots.length > 1">
                    <i class="el-icon-close"></i>
                  </el-button>
                  <el-button
                    @click="onAddIpList"
                    type="text"
                    v-if="index === baseModel.ip_slots.length - 1 && baseModel.ip_slots.length < 5"
                  >
                    <i class="el-icon-plus"></i>
                  </el-button>
                </el-form-item>
              </el-form-item>
            </template>
            <el-form-item :label="$t('egw.times_manager')" prop="tr_group">
              <el-select class="w260" :placeholder="$t('action.select')" v-model="baseModel.tr_group">
                <el-option :key="item.tmngtName" :label="item.name" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
                <el-option :label="$t('egw.custom')" value></el-option>
              </el-select>
            </el-form-item>
            <template v-if="baseModel.tr_group === ''">
              <el-form-item class="hide" :label="$t('egw.SiteManage.set_time')" prop="time_mode">
                <el-radio-group v-model="baseModel.time_mode">
                  <el-radio label="calendar">{{$t('egw.calendar')}}</el-radio>
                  <!-- <el-radio label="input">手动设置</el-radio> -->
                </el-radio-group>
              </el-form-item>
              <template v-if="baseModel.time_mode==='calendar'">
                <el-form-item class="is-required" :label="$t('egw.calendar')" prop="tr_slots">
                  <span @click="onOpenTimeSelection(baseModel.tr_slots,true)" class="f-theme pointer">
                    <i class="el-icon-date"></i>
                    {{$t('egw.accessCtrl.select_time')}}
                  </span>
                </el-form-item>
              </template>
              <template v-else></template>
            </template>
            <el-form-item :label="(mode==='black'?$t('egw.QqBwList.block_qq_code_f'):$t('egw.QqBwList.allow_qq_code_f'))" class="is-required" prop="account">
              <el-input :rows="6" class="w260 vt" :placeholder="$t('egw.QqBwList.qq_group_tip')" type="textarea" v-model="accountTranslate"></el-input>
              <span class="vm">
                {{$t('egw.QqBwList.reside')}}
                <b class="c-success">{{Math.max(qqRemainNum-baseModel.account.length,0)}}</b>
              </span>
            </el-form-item>
            <el-form-item :label="$t('phrase.remark')" prop="comment">
              <el-input class="w260" v-model="baseModel.comment"></el-input>
            </el-form-item>
            <el-form-item :label="$t('phrase.status')" prop="enable">
              <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
            </el-form-item>
          </el-form>
          <span class="dialog-footer" slot="footer">
            <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
            <el-button @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
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
        cb(new Error(this.$t('egw.QqBwList.qq_code_is_required')))
        return
      }
      let _invalid = value.filter(acc => {
        return !!acc && !/^[1-9]\d{4,10}$/.test(acc)
      })
      if (_invalid && _invalid.length) {
        cb(new Error(this.$t('egw.QqBwList.invalid_qq_code',{str:_invalid.join(',')})))
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
        cb(new Error(this.$t('egw.QqBwList.qq_code_length', {num: this.qqRemainNum}) + `${this.qqRemainNum}`))
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
        none: this.$t('egw.QqBwList.close_bw_mode'),
        black: this.$t('egw.QqBwList.black_mode'),
        white: this.$t('egw.QqBwList.white_mode')
      },
      mode: null,
      isModeFallback: false, //是否为取消切换
      baseModel: model.behaviorQqbwlistFn(),
      baseRules: {
        account: [
          { validator: qqLengthValidator },
          { validator: accountValidator }
        ],
        tr_slots: [{ validator: timeValidator, message: this.$t('egw.select_time_range') }],
        comment: [
          {
            validator: nameLengthValidator,
            size: 64,
            message: this.$t('egw.invalid_group_name')
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
        this.$confirm(this.$t('egw.QqBwList.change_mode',{addr:this.modeMap[v]})).then(
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
      return this.editIndex !== -1 ? this.$t('action.edit1') : this.$t('action.add')
    },
    // QQ号字符串
    accountTranslate: {
      get() {
        return (this.baseModel.account || []).join('\n')
      },
      set(v) {
        v = v.replace(/^\n+/g, '')
        this.baseModel.account = [...new Set(v.split(/\n+/) || [])].map(v =>
          v.trim()
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
          title: this.$t('phrase.tip'),
          message: this.$t('egw.QqBwList.qq_no_more_tip',{num: this.MAX_QQ_NUM})
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
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.isLoading = true
        this.$api
          .delQqBwList({ names: _items.map(ite => ite.policy) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.qqBwList.findIndex(d => d === ite)
              this.qqBwList.splice(_index, 1)
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
      this.baseModel.account = this.baseModel.account.filter(v => !!v)
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
            message:this.$t('tip.deit1_success'),
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
