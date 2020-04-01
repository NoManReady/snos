<template>
  <div class="behavior-accessctrl-rule">
    <help-alert :title="title" json-key="accessCtrlJson">
      <div slot="content"></div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        {{$t('egw.accessCtrl.ask_ctrl_rule_tab')}}
        <small></small>
      </span>
      <div class="fr">
        <el-button @click.native="onEdit(-1)" size="small" type="primary">
          <i class="el-icon-plus"></i>
          <span>{{$t('action.add')}}</span>
        </el-button>
        <el-button @click.native="onDel()" size="small" type="primary">
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
    <el-table :data="pageList" ref="multipleTable" row-key="ruleName" size="medium" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <el-table-column :label="$t('egw.mac')" align="center" min-width="120" prop="mac">
        <template slot-scope="{row}">{{row.mac || '-'}}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.originator_ip_or_port')" align="center" min-width="175" prop="srcIP">
        <template
          slot-scope="{row}"
        >{{row.by === 'ip' ? `${row.srcIP || $t('egw.all_ip')}:${row.srcPort || $t('egw.all_port')}` : "-" }}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.destination_ip_or_port')" align="center" min-width="175" prop="destIP">
        <template
          slot-scope="{row}"
        >{{row.by === 'ip' ? `${row.destIP || $t('egw.all_ip')}:${row.destPort || $t('egw.all_port')}` : "-" }}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.protocol_type')" align="center" prop="proto">
        <template slot-scope="{row}">{{row.by === 'ip' ? (row.proto.toLocaleUpperCase()) : "-" }}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.strategy_type')" align="center" prop="target">
        <template slot-scope="scope">{{scope.row.target === 'ACCEPT' ? $t('egw.accessCtrl.allow') : $t('egw.accessCtrl.block')}}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.effective_time')" align="center" prop="tmngtName">
        <template slot-scope="scope">
          <span v-if="scope.row.tmngtName !== 'SELF_DEFINED'">{{scope.row.tmngtName}}</span>
          <template v-else>
            <i @click="onOpenTimeSelection(scope.row.time,false)" class="el-icon-date f-theme pointer"></i>
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('egw.accessCtrl.effective_time')" align="center" prop="dest">
        <template slot-scope="scope">{{scope.row.dest === 'lan' ? $t('egw.lan') : $t('egw.internet')}}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.flowctrl.effective_status')" align="center" prop="tmngtName">
        <template slot-scope="scope">
          <i class="el-icon-loading fs18" v-if="isActive(scope.row) === null"></i>
          <span class="c-success" type="text" v-else-if="isActive(scope.row) === 'ACTIVE'">{{$t('egw.accessCtrl.effectiving')}}</span>
          <span class="c-warning" type="text" v-else>
            {{$t('egw.accessCtrl.ineffective')}}
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">{{$t('egw.accessCtrl.outside_effective_time')}}</div>
              <span>
                <i class="el-icon-question"></i>
              </span>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('phrase.remark')" align="center" min-width="100" prop="ruleName"></el-table-column>
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
          <el-button @click="onEdit(scope.$index,scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
          <el-button @click="onDel([scope.row.uuid])" size="medium" type="text">{{$t('action.delete')}}</el-button>
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
          <el-form-item :label="$t('egw.mac')" key="mac" prop="mac">
            <el-input :placeholder="$t('egw.accessCtrl.select_mac_online')" class="w300" v-model="modelData.mac"></el-input>
          </el-form-item>
        </template>
        <template v-if="modelData.by === 'ip'">
          <el-form-item>
            <el-form-item :label="$t('egw.accessCtrl.originator_ip_range_or_port')" prop="srcIP">
              <el-input :placeholder="$t('egw.accessCtrl.ip_range_tip')" class="w180" v-model="modelData.srcIP"></el-input>
            </el-form-item>
            <span class="mr10">:</span>
            <el-form-item label prop="srcPort">
              <el-input class="w90" placeholder="1-65535" v-model="modelData.srcPort"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item>
            <el-form-item :label="$t('egw.accessCtrl.destination_ip_range_or_port')" prop="destIP">
              <el-input :placeholder="$t('egw.accessCtrl.ip_range_tip')" class="w180" v-model="modelData.destIP"></el-input>
            </el-form-item>
            <span class="mr10">:</span>
            <el-form-item label prop="destPort">
              <el-input class="w90" placeholder="1-65535" v-model="modelData.destPort"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('egw.protocol_type')" prop="proto">
            <el-select :placeholder="$t('egw.protocol_type_select')" class="w300" v-model="modelData.proto">
              <el-option label="ALL" value="all"></el-option>
              <el-option label="TCP" value="tcp"></el-option>
              <el-option label="UDP" value="udp"></el-option>
              <el-option label="ICMP" value="icmp"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.accessCtrl.strategy_type')" prop="target">
          <el-select :placeholder="$t('egw.accessCtrl.select_strategy_type')" class="w300" v-model="modelData.target">
            <el-option :label="$t('egw.accessCtrl.allow')" value="ACCEPT"></el-option>
            <el-option :label="$t('egw.accessCtrl.block')" value="REJECT"></el-option>
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
            <a @click="onOpenTimeSelection(modelData.time,true)" class="f-theme pointer">
              <i class="el-icon-date mr5"></i>
              {{$t('egw.accessCtrl.select_time')}}
            </a>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.accessCtrl.effective_interfations')" prop="dest" v-if="modelData.by === 'ip'">
          <el-select :placeholder="$t('egw.accessCtrl.select_effective_interfations')" class="w300" v-model="modelData.dest">
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
      aclList: [],
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
  watch: {
    'modelData.tmngtName'(v) {
      if (v !== SELF_DEFINED) {
        delete this.modelData.time
      } else if (
        !this.modelData.time ||
        !typeof this.modelData.time === 'object'
      ) {
        this.modelData.time = {}
      }
    }
  },
  created() {
    setTimeout(() => {
      this._loadTimeGroupList()
    }, 1000)
  },
  methods: {
    async _loadList() {
      let _d = await this.$api.getAccessCtrlList()
      this.getAclStatus()
      this.aclList = _d.list || []
      return _d.list || []
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
    onEdit(idx, row = {}) {
      this.isAdd = idx < 0
      if (this.isAdd && this.aclList.length >= this.MAX_NUM) {
        return this.$message.warning(
          `${this.title}` + this.$t('egw.limit_num_tip3', { num: this.MAX_NUM })
        )
      }
      this.modalTitle = this.isAdd
        ? this.$t('egw.accessCtrl.ask_rule_add')
        : this.$t('egw.accessCtrl.ask_rule_edit')
      if (row.time && Object.keys(row.time).length > 0) {
        row.tmngtName = SELF_DEFINED
      }
      this.modelData = Object.assign(
        model.behaviorAccessCtrlFn(this.defaultTimeGroup),
        row
      )
      this.isModalShow = true
    },
    async onDel(uuidArr) {
      if (!uuidArr) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning(this.$t('tip.select_del_item'))
        }
        uuidArr = selection.map(item => item.uuid)
      }
      await this.$confirm(this.$t('tip.confirm_delete'))
      this.$api.setAccessCtrl({ uuid: uuidArr }, 'del', true).then(_ => {
        this._initPage()
        this.$message.success(this.$t('tip.del_success'))
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          let _data = this.modelData
          if (
            _data.srcIP === '' &&
            _data.destIP === '' &&
            _data.target === 'REJECT'
          ) {
            await this.$confirm(
              this.$t('egw.accessCtrl.deny_all_ip_ask_internat')
            )
          }
          this.onSave(_data)
          this.isModalShow = false
        }
      })
    },
    onSave(rule) {
      let _setData = {
        list: [rule || this.modelData]
      }
      this.$api
        .setAccessCtrl(_setData, this.isAdd ? 'add' : 'update', true)
        .then(d => {
          this._initPage()
          this.$message.success(this.$t('tip.edit1.success'))
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
    onSort(idx, type) {
      let data = this.aclList.splice(idx, 1)[0]
      idx = type == 'up' ? idx - 1 : idx + 1
      this.aclList.splice(idx, 0, data)
    },
    onSetAclSort(idx, name, type) {
      this.$api.setAccessCtrlSort(name, type).then(d => {
        let _realIdx = this.getRealIndex(idx)
        this.onSort(_realIdx, type)
        this.$message.success(
          type === 'up'
            ? this.$t('egw.flowctrl.move_up_success')
            : this.$t('egw.flowctrl.move_down_success')
        )
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
