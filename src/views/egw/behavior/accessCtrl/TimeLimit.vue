<template>
  <div class="behavior-accessctrl-timelimit">
    <help-alert json-key="timeLimitJson" :title="$t('egw.accessCtrl.time_limit')">
      <div slot="content"></div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        {{$t('egw.accessCtrl.time_limit')}}
        <small></small>
      </span>
      <div class="fr">
        <el-button :disabled="loading" @click.native="_onEdit(-1)" plain size="medium" type="primary">
          <i class="el-icon-plus"></i>
          <span>{{$t('action.add')}}</span>
        </el-button>
        <el-button :disabled="loading" @click.native="_onDel" plain size="medium" type="primary">
          <i class="el-icon-delete"></i>
          <span>{{$t('action.patch_delete')}}</span>
        </el-button>
      </div>
    </div>
    <help-alert :show-icon="false" title>
      <div slot="content">
        <i18n path="egw.limit_num_tip">
            <b class="c-warning mlr5">{{MAX_NUM}}</b>
        </i18n>
      </div>
    </help-alert>
    <el-table :data="pageList" ref="multipleTable" row-key="uuid" size="medium" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" :label="$t('egw.mac')" prop="mac"></el-table-column>
      <el-table-column align="center" :label="$t('egw.user_name')" prop="hostname">
        <span slot-scope="{row}">{{_getHostName(row)}}</span>
      </el-table-column>
      <el-table-column align="center" :label="$t('egw.accessCtrl.no_allow_time')" prop="tmngtName">
        <template slot-scope="{row}">
          <span v-if="row.tmngtName !== SELF_DEFINED">{{row.tmngtName}}</span>
          <template v-else>
            <i @click="onOpenTimeSelection(row.time,false)" class="el-icon-date f-theme pointer"></i>
          </template>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('phrase.status')" prop="hostname">
        <div slot-scope="{row}">
          <i class="el-icon-loading fs14" v-if="loadingStatus"></i>
          <span class="c-success" v-else-if="row.status==='ACTIVE'">{{$t('egw.accessCtrl.effectiving')}}</span>
          <span class="c-info" v-else>{{$t('egw.accessCtrl.ineffectiving')}}</span>
        </div>
      </el-table-column>
      <el-table-column align="center" :label="$t('action.ope')" width="100px">
        <template slot-scope="scope">
          <el-button :disabled="loading" @click="_onEdit(scope.$index,scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
          <el-button :disabled="loading" @click="_onDel([scope.row.uuid])" size="medium" type="text">{{$t('action.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page.sync="pageModel.pageIndex"
      :page-size="pageModel.pageSize"
      :page-sizes="pageModel.pageSizes"
      :total="pageTotal"
      @current-change="onCurrentChange"
      @size-change="_onSizeChange"
      background
      class="mt20"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <el-dialog
      :closable="!loading"
      :close-on-click-modal="false"
      :title="modalTitle"
      :visible.sync="isModalShow"
      @open="_clearValidate"
      width="500px"
    >
      <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="medium">
        <el-form-item :label="$t('egw.mac')" prop="mac">
          <auto-complete
            :data-source="userList"
            class="w280"
            label="hostName"
            :placeholder="$t('egw.accessCtrl.select_user')"
            v-model="baseModel.mac"
            value-key="mac"
          >
            <div slot-scope="{item}">
              <span class="strong">{{ item.hostName||$t('phrase.unkown') }}</span>
              <span>({{ item.mac||'--' }})</span>
            </div>
          </auto-complete>
        </el-form-item>
        <el-form-item :label="$t('egw.accessCtrl.no_allow_time')" prop="tmngtName">
          <el-select class="w280" :placeholder="$t('action.select')" v-model="baseModel.tmngtName">
            <el-option :key="item.tmngtName" :label="item.name" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
            <el-option :value="SELF_DEFINED" :label="$t('egw.custom')"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="baseModel.tmngtName === SELF_DEFINED">
          <el-form-item class="is-required" :label="$t('egw.accessCtrl.custom_time')" prop="time">
            <a @click="onOpenTimeSelection(baseModel.time,true)" class="f-theme pointer">
              <i class="el-icon-date mr5"></i>{{$t('egw.accessCtrl.select_time')}}
            </a>
          </el-form-item>
        </template>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button :disabled="loading" @click="isModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button :loading="loading" @click="_onSubmit" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import AutoComplete from '@/common/AutoComplete'
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import pageMixins from '@/mixins/pageMixins'
import { macValidator } from '@/utils/rules'
export default {
  name: 'BehaviorAccessctrlTimeLimit',
  data() {
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    const checkMacUnit = (rule, value, cb) => {
      let _index = this.pageModel.allItem.findIndex(item => {
        return item.mac.toLocaleLowerCase() === value.toLocaleLowerCase()
      })
      let _isExit = false
      if (_index > -1) {
        if (this.editIndex > -1) {
          _isExit = _index !== this.getRealIndex(this.editIndex)
        } else {
          _isExit = true
        }
      }
      if (_isExit) {
        cb(new Error(this.$t('egw.accessCtrl.mac_is_has')))
      }
      cb()
    }
    return {
      MAX_NUM: 50,
      SELF_DEFINED: 'SELF_DEFINED',
      timeGroups: [],
      userList: [],
      defaultTimeGroup: '',
      editIndex: -1,
      isModalShow: false,
      loading: false,
      loadingStatus: true,
      isFirst: true,
      baseModel: {
        mac: '',
        tmngtName: '',
        time: {}
      },
      baseRules: {
        mac: [
          { required: true, message: this.$t('egw.accessCtrl.select_mac_or_user') },
          { validator: macValidator },
          { validator: checkMacUnit }
        ],
        time: [{ validator: timeValidator, message: this.$t('egw.accessCtrl.select_time_range') }]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    AutoComplete
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? this.$t('action.add') : this.$t('action.edit1')
    }
  },
  watch: {
    'baseModel.tmngtName'(v) {
      if (v !== this.SELF_DEFINED) {
        delete this.baseModel.time
      } else if (
        !this.baseModel.time ||
        !typeof this.baseModel.time === 'object'
      ) {
        this.baseModel.time = {}
      }
    }
  },
  async created() {
    this.loading = true
    try {
      await this._loadTimeGroupList()
      await this._loadUserList()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async _loadList() {
      this.loading = true
      try {
        let _d = await this.$api.getTimeLimit()
        this.isFirst && this._loadStatusList()
        return _d.list || []
      } finally {
        this.loading = false
        this.isFirst = false
      }
    },
    async _loadStatusList() {
      try {
        this.loadingStatus = true
        let _result = await this.$api.getTimeLimitStatus()
        let _list = _result.list || []
        _list.forEach(lis => {
          let _index = this.pageModel.allItem.findIndex(
            ite => ite.uuid === lis.uuid
          )
          if (_index > -1) {
            this.pageModel.allItem.splice(_index, 1, {
              ...this.pageModel.allItem[_index],
              status: lis.status
            })
          }
        })
      } finally {
        this.loading = false
        this.loadingStatus = false
      }
    },
    // 加载用户列表
    async _loadUserList() {
      let _result = await this.$api.userList(true)
      this.userList = (_result.list || []).filter(lis => !!lis.mac)
    },
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
      this.defaultTimeGroup = this.timeGroups[0]
        ? this.timeGroups[0].tmngtName
        : ''
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.baseModel.time = d
        this.$refs.baseForm.validateField('time')
      })
    },
    // 获取用户hostName
    _getHostName(item) {
      let _item = this.userList.find(user => user.mac === item.mac)
      return _item ? _item.hostName : '-'
    },
    // 编辑
    _onEdit(idx, row = {}) {
      this.editIndex = idx
      if (
        this.editIndex === -1 &&
        this.pageModel.allItem.length >= this.MAX_NUM
      ) {
        return this.$message.warning(
          this.$t('egw.accessCtrl.limit_time_rule_num',{num:this.MAX_NUM})
        )
      }
      this.baseModel = Object.assign(
        {
          tmngtName: this.defaultTimeGroup,
          mac: ''
        },
        row
      )
      this.isModalShow = true
    },
    // 删除
    async _onDel(uuids) {
      if (!uuids) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning(this.$t('tip.select_del_item'))
        }
        uuids = selection.map(item => item.uuid)
      }
      await this.$confirm(this.$t('tip.confirm_delete'))
      try {
        await this.$api.delTimeLimit(uuids, 'del', true)
        uuids.forEach(uuid => {
          let _index = this.pageList.findIndex(item => item.uuid === uuid)
          this.removeList(_index)
        })
        this.$message.success(this.$t('tip.del_success'))
      } finally {
      }
    },
    // 确定提交
    _onSubmit() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          this.loading = true
          let _data = { ...this.baseModel }
          let _promise = null
          if (this.editIndex > -1) {
            _promise = this.$api.updateTimeLimit(_data).then(d => {
              this.editList(this.editIndex, _data)
            })
          } else {
            _promise = this.$api.addTimeLimit(_data, true).then(d => {
              this._initPage(false)
            })
          }
          _promise
            .then(d => {
              setTimeout(this._loadStatusList, 1000)
              this.$message(this.$t('tip.edit1_success'))
            })
            .finally(() => {
              this.isModalShow = false
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
