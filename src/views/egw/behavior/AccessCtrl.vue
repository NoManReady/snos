<template>
  <div class="behavior-accessctrl-rule">
    <help-alert :title="title" json-key="accessCtrlJson">
      <div slot="content">
        {{$t('egw.accessCtrl.rule_by_ip')}}
        <strong>{{$t('egw.accessCtrl.reverse_flow_mismatch')}}</strong>
        {{$t('symbol.period')}}
        <div>
          {{$t('egw.example')}}
          <strong>{{$t('egw.accessCtrl.block_rule_make')}}</strong>
          {{$t('egw.accessCtrl.block_rule_make2')}}
          <span class="c-warning">{{$t('egw.accessCtrl.block_rule_make3')}}</span>
        </div>
        <div>
          {{$t('phrase.tip_f')}}
          <strong>{{$t('egw.accessCtrl.block_second_rule_make')}}</strong>
          <span class="c-warning">{{$t('egw.accessCtrl.block_second_rule_make2')}}</span>
        </div>
      </div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        {{$t('egw.accessCtrl.ask_ctrl_rule_tab')}}
        <small></small>
      </span>
      <div class="fr">
        <el-button
          :loading="loading"
          icon="el-icon-plus"
          plain
          size="medium"
          type="primary"
          v-auth="{fn:onEdit,params:{idx:-1}}"
        >{{$t('action.add')}}</el-button>
        <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
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
      <el-table-column :selectable="row => row.type !== 'single'" align="center" type="selection" width="50"></el-table-column>
      <el-table-column :label="$t('egw.matching_rule')" align="center" prop="mac" width="260">
        <div class="tl vm w240" slot-scope="{row}">
          <div v-if="row.by === 'ip'">
            <div>
              <strong class="vm w65 tr c-info">{{$t('egw.accessCtrl.originator_ip_title')}}</strong>
              <em class="vm">{{`${row.srcIP || $t('egw.all_address')} : ${row.srcPort || $t('egw.all_port')}`}}</em>
            </div>
            <div>
              <strong class="vm w65 tr c-info">{{$t('egw.accessCtrl.destination_ip_title')}}</strong>
              <em class="vm">{{`${row.destIP || $t('egw.all_address')} : ${row.destPort || $t('egw.all_port')}`}}</em>
            </div>
            <div>
              <strong class="vm w65 tr c-info">{{$t('egw.accessCtrl.agreement_title')}}</strong>
              <em class="vm">{{ row.proto.toLocaleUpperCase().replace('ALL', $t('egw.all_agreement') ) }}</em>
            </div>
          </div>
          <div v-if="row.by === 'mac'">
            <strong class="vm w65 tr c-info">{{$t('egw.accessCtrl.mac_title')}}</strong>
            <em class="vm">{{row.mac || '-'}}</em>
          </div>
        </div>
      </el-table-column>
      <el-table-column :label="$t('egw.rule_type')" align="center" prop="target">
        <template slot-scope="{row}">
          <el-tag color="#409eff1a" disable-transitions v-if="row.target === 'ACCEPT'">{{$t('egw.accessCtrl.allow')}}</el-tag>
          <el-tag color="#67c23a1a" disable-transitions v-else>{{$t('egw.accessCtrl.block')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.effective_time')" align="center" prop="tmngtName" width="120">
        <template slot-scope="scope">
          <template v-if="scope.row.type === 'single'">
            <span>{{getTmngtTime(scope.row)}}</span>
          </template>
          <template v-else>
            <span v-if="scope.row.tmngtName !== 'SELF_DEFINED'">{{scope.row.tmngtName}}</span>
            <i @click="onOpenTimeSelection(scope.row.time,false)" class="el-icon-date f-theme pointer" v-else></i>
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.effective_interfations')" align="center" prop="dest">
        <template slot-scope="scope">{{scope.row.dest === 'lan' ? $t('egw.lan') : $t('egw.internet')}}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.flowctrl.effective_status')" align="center" prop="tmngtName">
        <template slot-scope="scope">
          <i class="el-icon-loading fs18" v-if="isActive(scope.row) === null"></i>
          <span class="c-success" type="text" v-else-if="isActive(scope.row) === 'ACTIVE'">{{$t('phrase.effective')}}</span>
          <span class="c-warning" type="text" v-else>
            {{$t('egw.accessCtrl.ineffectiving')}}
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">{{$t('egw.accessCtrl.outside_effective_time')}}</div>
              <span>
                <i class="el-icon-question"></i>
              </span>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('egw.remarks')" align="center" min-width="100" prop="ruleName"></el-table-column>
      <el-table-column :label="$t('egw.matching_order')" align="center" v-if="aclList.length > 1" width="100px">
        <template slot-scope="scope">
          <el-button
            :title="$t('egw.move_up_strategy')"
            @click="onSetAclSort(scope.$index, scope.row.uuid, 'up')"
            size="medium"
            type="text"
            v-if="getRealIndex(scope.$index) > 0"
          >
            <i class="el-icon-sort-up"></i>
          </el-button>
          <el-button
            :title="$t('egw.move_down')"
            @click="onSetAclSort(scope.$index, scope.row.uuid, 'down')"
            size="medium"
            type="text"
            v-if="getRealIndex(scope.$index) < aclList.length - 1"
          >
            <i class="el-icon-sort-down"></i>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('action.ope')" align="center" min-width="95">
        <template slot-scope="scope">
          <el-button
            :disabled="scope.row.type === 'single'"
            size="medium"
            type="text"
            v-auth="{fn:onEdit, params:{idx:scope.$index,row:scope.row}}"
          >{{$t('action.edit')}}</el-button>
          <el-button
            :disabled="scope.row.type === 'single'"
            size="medium"
            type="text"
            v-auth="{fn:onDel, params:scope.row.uuid}"
          >{{$t('action.delete')}}</el-button>
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
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="550px">
      <el-form :inline="true" :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
        <el-form-item :label="$t('egw.base_on')" prop="by">
          <el-radio-group v-model="modelData.by">
            <el-radio label="mac">{{$t('egw.mac')}}</el-radio>
            <el-radio label="ip">{{$t('egw.ip')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="modelData.by === 'mac'">
          <el-form-item :label="$t('egw.mac')" key="acl_mac" prop="mac">
            <auto-complete
              :data-source="userList"
              :placeholder="$t('egw.accessCtrl.select_mac_online')"
              @select="onSelectMac"
              class="w300"
              label="hostName"
              v-model="modelData.mac"
              value-key="mac"
            >
              <div slot-scope="{item}">
                <span class="strong">{{ item.hostName||$t('phrase.unknow') }}</span>
                <span>({{ item.mac||'--' }})</span>
              </div>
            </auto-complete>
          </el-form-item>
        </template>
        <template v-if="modelData.by === 'ip'">
          <el-form-item>
            <el-form-item :label="$t('egw.accessCtrl.originator_ip_or_port')" prop="srcIP">
              <el-input :placeholder="$t('egw.accessCtrl.ip_range_tip')" class="w180" v-model="modelData.srcIP"></el-input>
            </el-form-item>
            <span class="mr10">:</span>
            <el-form-item label prop="srcPort">
              <el-input class="w90" placeholder="1-65535" v-model="modelData.srcPort"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item>
            <el-form-item :label="$t('egw.accessCtrl.destination_ip_or_port')" prop="destIP">
              <el-input :placeholder="$t('egw.accessCtrl.ip_range_tip')" class="w180" v-model="modelData.destIP"></el-input>
            </el-form-item>
            <span class="mr10">:</span>
            <el-form-item label prop="destPort">
              <el-input class="w90" placeholder="1-65535" v-model="modelData.destPort"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('egw.protocol_type')" prop="proto">
            <el-select class="w300" v-model="modelData.proto">
              <el-option :label="$t('egw.all_agreement')" value="all"></el-option>
              <el-option label="TCP" value="tcp"></el-option>
              <el-option label="UDP" value="udp"></el-option>
              <el-option label="ICMP" value="icmp"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.rule_type')" prop="target">
          <el-select class="w300" v-model="modelData.target">
            <el-option :label="$t('egw.accessCtrl.allow')" value="ACCEPT"></el-option>
            <el-option
              :label=" modelData.by == 'ip' ? $t('egw.accessCtrl.block_reverse_flow_mismatch') : $t('egw.accessCtrl.block') "
              value="REJECT"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('egw.accessCtrl.effective_time')" prop="tmngtName">
          <el-select :placeholder="$t('action.select')" class="w300" v-model="modelData.tmngtName">
            <el-option :key="item.tmngtName" :label="item.name" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
            <el-option :label="$t('egw.custom')" value="SELF_DEFINED"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.tmngtName === 'SELF_DEFINED'">
          <el-form-item :label="$t('egw.accessCtrl.custom_time')" class="is-required" prop="time">
            <div class="w300">
              <a @click="onOpenTimeSelection(modelData.time,true)" class="f-theme pointer">
                <i class="el-icon-date mr5"></i>
                {{$t('egw.accessCtrl.select_time')}}
              </a>
            </div>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.accessCtrl.effective_interfations')" prop="dest" v-if="modelData.by === 'ip'">
          <el-select class="w300" v-model="modelData.dest">
            <el-option :label="$t('egw.lan')" value="lan"></el-option>
            <el-option :label="$t('egw.internet')" value="wan"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('phrase.remark')" prop="ruleName">
          <el-input :placeholder="$t('egw.accessCtrl.identify_rule_usage')" class="w300" v-model="modelData.ruleName"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="isModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button @click="onClickFormBtn()" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { Tag } from 'element-ui'
import AutoComplete from '@/common/AutoComplete'
import { macValidator } from '@/utils/rules'
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import pageMixins from '@/mixins/pageMixins'
import model from '@/model'
import { isNetSeg, isBetween, isStrictIP } from '@/utils/rulesUtils'
const SELF_DEFINED = 'SELF_DEFINED'
export default {
  name: 'BehaviorAccessctrlRule',
  data() {
    const macSameValidator = (r, v, cb) => {
      if (this.isAdd && this.macMap.includes(v))
        return cb(new Error(this.$t('egw.accessCtrl.mac_is_has')))
      cb()
    }
    const ipValidate = (r, v, cb) => {
      if (v && v !== '0.0.0.0/0' && !isStrictIP(v) && !isNetSeg(v))
        return cb(new Error(this.$t('egw.enter_valid_ip_or_network')))
      cb()
    }
    const portValidate = (r, v, cb) => {
      if (v && !isBetween(v, 1, 65535))
        return cb(new Error(this.$t('egw.port_limit_tip')))
      cb()
    }
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      MAX_NUM: 50,
      title: this.$t('egw.accessCtrl.ask_control'),
      loading: false,
      aclList: [],
      userList: [],
      timeGroups: [],
      defaultTimeGroup: '',
      modalTitle: '',
      isAdd: true,
      isModalShow: false,
      modelData: model.behaviorAccessCtrlFn(),
      aclStatus: [],
      baseRules: {
        mac: [
          { required: true, message: this.$t('egw.mac_is_required') },
          // { validator: macSameValidator },
          { validator: macValidator, message: this.$t('egw.enter_valid_mac') }
        ],
        srcIP: [{ validator: ipValidate }],
        destIP: [{ validator: ipValidate }],
        srcPort: [
          { validator: portValidate, message: this.$t('egw.port_limit_tip') }
        ],
        destPort: [
          { validator: portValidate, message: this.$t('egw.port_limit_tip') }
        ],
        time: [
          {
            validator: timeValidator,
            message: this.$t('egw.select_time_range')
          }
        ],
        ruleName: [
          {
            range: true,
            min: 1,
            max: 28,
            message: this.$t('egw.accessCtrl.remark_length_tip')
          }
        ]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    AutoComplete,
    [Tag.name]: Tag
  },
  computed: {
    macMap() {
      return this.aclList.filter(o => o.by === 'mac').map(o => o.mac)
    },
    query() {
      return this.$route.query || {}
    }
  },
  async created() {
    this.loading = true
    try {
      await this._loadTimeGroupList()
      this._autoShowDialog()
      await this._loadUserList()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async _loadList() {
      let _d = await this.$api.getAccessCtrlList()
      this.getAclStatus()
      let _list = _d.list || [] // .filter(o => o.type !== 'single')
      this.aclList = _list
      return _list
    },
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
      this.defaultTimeGroup = this.timeGroups[0]
        ? this.timeGroups[0].tmngtName
        : ''
    },
    // 在线用户跳转过来，自动弹框添加规则
    _autoShowDialog() {
      if (this.query.mac) {
        this.modelData = Object.assign(
          model.behaviorAccessCtrlFn(
            this.defaultTimeGroup || this.$t('egw.all_times')
          ),
          {
            by: 'mac',
            mac: this.query.mac,
            ruleName: this.query.hostName
          }
        )
        this.isModalShow = true
      }
    },
    // 加载用户列表
    async _loadUserList() {
      let _result = await this.$api.userList(true)
      this.userList = (_result.list || []).filter(lis => !!lis.mac)
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.modelData.time = d
        this.$refs.baseForm.validateField('time')
      })
    },
    async getAclStatus() {
      let _res = await this.$api.getAccessCtrlListSta()
      this.aclStatus = _res.list || []
    },
    isActive(row) {
      let effective = null
      this.aclStatus.some(item => {
        if (item.uuid === row.uuid) {
          effective = item.status
        }
      })
      return effective
    },
    onEdit({ idx, row = {} }) {
      this.isAdd = idx < 0
      if (this.isAdd && this.aclList.length >= this.MAX_NUM) {
        return this.$message.warning(
          `${this.title}` + this.$t('egw.limit_num_tip3', { num: this.MAX_NUM })
        )
      }
      this.modalTitle = this.isAdd
        ? this.$t('egw.accessCtrl.ask_rule_add')
        : this.$t('egw.accessCtrl.ask_rule_edit')
      this.modelData = Object.assign(
        model.behaviorAccessCtrlFn(this.defaultTimeGroup),
        row
      )
      this.isModalShow = true
    },
    async onDel(uuidArr) {
      uuidArr = uuidArr
        ? [uuidArr]
        : this.$refs.multipleTable.selection.map(item => item.uuid)
      if (!uuidArr.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      await this.$confirm(this.$t('tip.confirm_delete'))
      this.$api.setAccessCtrl({ uuid: uuidArr }, 'del', true).then(_ => {
        this._initPage(false)
        this.$message.success(this.$t('tip.del_success'))
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          let _data = this.modelData
          if (
            _data.by === 'ip' &&
            _data.srcIP === '' &&
            _data.destIP === '' &&
            _data.target === 'REJECT'
          ) {
            await this.$confirm(
              this.$t('egw.accessCtrl.deny_all_ip_ask_internat')
            )
          }
          if (_data !== SELF_DEFINED) {
            delete _data.time
          }
          this.onSave(_data)
          this.isModalShow = false
        }
      })
    },
    onSave(data) {
      let _data = { ...(data || this.modelData) }
      if (_data.by === 'mac') {
        _data = Object.assign(_data, {
          dest: 'wan',
          srcIP: '',
          destIP: '',
          srcPort: '',
          destPort: '',
          proto: 'all'
        })
      } else {
        _data = Object.assign(_data, {
          mac: ''
        })
      }
      this.$api
        .setAccessCtrl({ list: [_data] }, this.isAdd ? 'add' : 'update', true)
        .then(d => {
          this._initPage(false)
          this.$message.success(this.$t('tip.edit1_success'))
        })
    },
    onSetAcl(idx, data) {
      if (data) {
        if (idx < 0) {
          this.aclList.unshift(data)
        } else {
          this.aclList.splice(idx, 1, data)
        }
      } else {
        this.aclList.splice(idx, 1)
      }
    },
    onSort(idx, opt) {
      let data = this.aclList.splice(idx, 1)[0]
      idx = opt == 'up' ? idx - 1 : idx + 1
      this.aclList.splice(idx, 0, data)
    },
    onSetAclSort(idx, uuid, opt) {
      this.$api.setAccessCtrlSort({ uuid: uuid, opt: opt }).then(d => {
        let _realIdx = this.getRealIndex(idx)
        this.onSort(_realIdx, opt)
        this.$message.success(
          opt === 'up'
            ? this.$t('egw.flowctrl.move_up_success')
            : this.$t('egw.flowctrl.move_down_success')
        )
      })
    },
    onSelectMac(row) {
      if (row.hostName) {
        this.modelData.ruleName = row.hostName
      }
    },
    getTmngtTime(row) {
      let _keys = Object.keys(row.time || {})
      return _keys.length > 0
        ? this.$t('egw.today') + `${row.time[_keys[0]][0].join('-') || ''}`
        : '-'
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
