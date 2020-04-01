<template>
  <div class="advanced-strategy-tab">
    <help-alert :title="$t('egw.flowctrl.coustom_strategy')" json-key="strategyJson">
      <div slot="content">
        <p class="mb5">{{$t('egw.flowctrl.strategy_over_flow_tip')}}</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.flowctrl.strategy_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn:onEdit,params:-1}">{{$t('action.add')}}</el-button>
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="egw.limit_num_tip">
            <b class="c-warning mlr5">{{MAX_NUM}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="strategyList" ref="multipleTable" size="medium" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column :label="$t('egw.flowctrl.strategy_name')" align="center" prop="comment"></el-table-column>
        <el-table-column :label="$t('egw.flowctrl.range_by_ip')" align="center" prop="ipRange"></el-table-column>
        <el-table-column :label="$t('egw.flowctrl.rate_module')" align="center">
          <template slot-scope="scope">{{modeObj[scope.row.mode || 'share']}}</template>
        </el-table-column>
        <el-table-column :label="$t('egw.up_rate')" align="center" min-width="140px">
          <template slot-scope="scope">
            <div>{{$t('egw.flowctrl.ensure')}} {{scope.row.upRateG}} Kbps</div>
            <div>{{$t('egw.flowctrl.bigest')}} {{scope.row.upRate}} Kbps</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.down_rate')" align="center" min-width="140px">
          <template slot-scope="scope">
            <div>{{$t('egw.flowctrl.ensure')}} {{scope.row.downRateG}} Kbps</div>
            <div>{{$t('egw.flowctrl.bigest')}} {{scope.row.downRate}} Kbps</div>
          </template>
        </el-table-column>
        <el-table-column :formatter="getIntfName" :label="$t('egw.flowctrl.application_interface')" align="center"></el-table-column>
        <el-table-column :label="$t('phrase.status')" align="center" prop="enable">
          <template slot-scope="scope">
            <el-button
              @click="toggleStatus(scope.row,scope.$index)"
              class="c-success"
              size="medium"
              type="text"
              v-if="scope.row.enable==='on'"
            >
              {{$t('phrase.enable')}}
              <i class="el-icon-circle-check"></i>
            </el-button>
            <el-button @click="toggleStatus(scope.row,scope.$index)" class="c-danger" size="medium" type="text" v-else>
              {{$t('phrase.disable')}}
              <i class="el-icon-remove"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.flowctrl.effective_status')" align="center">
          <template slot-scope="scope">
            <span class="c-success" type="text" v-if="scope.row.effective === '1'">{{$t('egw.effective')}}</span>
            <span class="c-warning" type="text" v-else-if="scope.row.effective === '0'">
              {{$t('egw.ineffective')}}
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content" v-if="scope.row.enable === 'on'">{{$t('egw.flowctrl.network_has_no_ip_tip')}}</div>
                <div slot="content" v-else>{{$t('egw.flowctrl.close_status_now')}}</div>
                <span>
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </span>
            <i class="el-icon-loading fs18" v-else></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.matching_order')" align="center" v-if="strategyList.length > 1">
          <template slot-scope="scope">
            <el-button
              @click="onSetSort(scope.$index, scope.row.comment, 'up')"
              size="medium"
              type="text"
              v-if="scope.$index > 0"
            >
              <i class="el-icon-sort-up"></i>
            </el-button>
            <el-button
              @click="onSetSort(scope.$index, scope.row.comment, 'down')"
              size="medium"
              type="text"
              v-if="scope.$index < strategyList.length-1"
            >
              <i class="el-icon-sort-down"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center" min-width="100px">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
            <el-button @click.native="onDel(scope.row)" size="medium" type="text">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- strategy编辑 -->
      <el-dialog :model="baseModel" :title="modalTitle" :visible.sync="strategyModalShow" width="600px">
        <el-form :inline="true" :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.flowctrl.strategy_name')" prop="comment">
            <el-input :disabled="editIndex > -1" class="w320" v-model="baseModel.comment"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.flowctrl.range_by_ip')" :rules="ipValidate()" prop="ipRange">
            <el-input :placeholder="$t('wan.ip_range_example')" class="w320" v-model="baseModel.ipRange"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.flowctrl.rate_module')">
            <el-select :placeholder="$t('action.select')" class="w320" v-model="baseModel.mode">
              <el-option :key="value" :label="key" :value="value" v-for="(key, value) in modeObj"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('egw.up_rate')">
            <el-form-item :label="$t('egw.flowctrl.ensure')" label-width="54px" prop="upRateG">
              <el-input @change="onValidateField('upRate')" class="w100" v-model="baseModel.upRateG"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.flowctrl.bigest')" label-width="54px" prop="upRate">
              <el-input @change="onValidateField('upRateG')" class="w100" v-model="baseModel.upRate"></el-input>Kbps
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('egw.down_rate')">
            <el-form-item :label="$t('egw.flowctrl.ensure')" label-width="54px" prop="downRateG">
              <el-input @change="onValidateField('downRate')" class="w100" v-model="baseModel.downRateG"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.flowctrl.bigest')" label-width="54px" prop="downRate">
              <el-input @change="onValidateField('downRateG')" class="w100" v-model="baseModel.downRate"></el-input>Kbps
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('egw.flowctrl.application_interface')" v-if="supportWanNum > 1">
            <el-select :placeholder="$t('action.select')" class="w320" v-model="baseModel.intf">
              <el-option :key="value" :label="key" :value="value" v-for="(key, value) in intfObj"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('phrase.status')" prop="enable">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="strategyModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onSubmitForm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import { intValidator, quoteValidator } from '@/utils/rules'
import { isBetween, isIp, isIpRange } from '@/utils/rulesUtils'
import { isIpInNet, isExistIpRange } from '@/utils/commonValidates'
export default {
  name: 'AdvancedStrategyTab',
  data() {
    const _flowValidator = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      if (!isBetween(val, 1, 10000000)) {
        cb(new Error(this.$t('egw.flowctrl.band_range')))
      }
      cb()
    }
    const _bandCompare = (rule, val, cb) => {
      let isUp = rule.field.includes('up')
      if (val === '') {
        cb()
      }
      let m = this.baseModel
      if (isUp) {
        if (m.upRate && m.upRateG && m.upRate - m.upRateG < 0) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      } else {
        if (m.downRate && m.downRateG && m.downRate - m.downRateG < 0) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      }
      cb()
    }
    const _getRules = isG => {
      return [
        {
          required: true,
          message: isG
            ? this.$t('egw.flowctrl.enter_ensure_rate')
            : this.$t('egw.flowctrl.enter_bigest_rate')
        },
        {
          validator: intValidator,
          message: this.$t('egw.enter_positive_integer')
        },
        { validator: _flowValidator },
        {
          validator: _bandCompare,
          message: isG
            ? this.$t('egw.flowctrl.less_then_bigest_rate')
            : this.$t('egw.flowctrl.more_then_ensure_rate')
        }
      ]
    }
    const _sameNameValidate = (r, v, cb) => {
      let _editName =
        this.editIndex > -1 ? this.strategyList[this.editIndex].comment : ''
      if (v != _editName && this.nameMap[v])
        return cb(new Error(this.$t('egw.rule_name_is_duplication')))
      cb()
    }
    return {
      poolList: [],
      MAX_NUM: 30,
      modalTitle: '',
      editIndex: -1,
      strategyList: [],
      ipRange: [],
      intfObj: {},
      modeObj: {
        share: this.$t('egw.share'),
        per_ip: this.$t('egw.flowctrl.independence')
      },
      strategyModalShow: false,
      baseModel: model.strategyFn(),
      baseRules: {
        upRate: _getRules(false),
        upRateG: _getRules(true),
        downRate: _getRules(false),
        downRateG: _getRules(true),
        comment: [
          { required: true, message: this.$t('egw.enter_rule_name') },
          {
            range: true,
            min: 1,
            max: 28,
            message: this.$t('egw.rule_name_length_tip')
          },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ]
      }
    }
  },
  mixins: [formMixins],
  computed: {
    nameMap() {
      let map = {}
      this.strategyList.forEach(d => (map[d.comment] = true))
      return map
    },
    existIpRange() {
      return this.strategyList.map(o => o.ipRange)
    },
    ipRangeList() {
      return this.poolList.map(o => o.first_addr + '-' + o.end_addr)
    },
    supportWanNum() {
      return +(this.$store.getters.capacity.eth_port.wan_number || 1)
    }
  },
  async created() {
    await this.loadIfaceTypes()
    await this.loadNetwork()
    await this.loadData()
    await this.loadIpPool()
  },
  destroyed() {
    this.time && clearTimeout(this.time)
  },
  methods: {
    async loadData(isSilence = false) {
      let _result = await this.$api.getPolicyFlow(isSilence)
      this.strategyList = _result.list.reverse() // 先匹配的放上面
      this.strategyList.forEach(_item => {
        // 更新生效状态
        this.updateEffective(_item)
      })
    },
    // 添加/编辑策略
    onEdit(index, item) {
      let isAdd = index < 0
      if (isAdd && this.strategyList.length >= this.MAX_NUM)
        return this.$message.warning(
          this.$t('egw.limit_num_tip3', { num: this.MAX_NUM })
        )
      this.editIndex = index
      this.modalTitle = isAdd ? this.$t('action.add') : this.$t('action.edit1')
      this.strategyModalShow = true
      this.baseModel = Object.assign(
        {},
        model.strategyFn(),
        { intf: this.intfObj['br-wan1'] ? 'br-allwan' : 'br-wan' }, // 接口默认选择“所有WAN口”或“WAN”
        item
      )
      this._clearValidate()
    },
    async loadIfaceTypes() {
      const result = await this.$api.getIfaceTypes()

      result.forEach(item => {
        this.intfObj[`br-${item}`] = item.toLocaleUpperCase()
      })
      // if (result.length > 1)
      this.intfObj['br-allwan'] = this.$t('egw.flowctrl.all_wan')
    },
    getIntfName(row) {
      return this.intfObj[row.intf] || '-'
    },
    // 获取地址池
    async loadIpPool() {
      let _res = await this.$api.getIpPool()
      this.poolList = (_res.list || []).map(o =>
        Object.assign(o, { ipRange: `${o.first_addr}-${o.end_addr}` })
      )
    },
    async loadNetwork() {
      let _res = await this.$api.getNetwork()
      this.networkLan = _res.lan
    },
    ipValidate() {
      const isLegalIp = (r, v, cb) => {
        if (!isIp(v) && !isIpRange(v)) {
          return cb(new Error(this.$t('egw.ip_or_range')))
        }
        cb()
      }
      const isBelongRange = (r, v, cb) => {
        if (
          !isIpInNet(v, this.networkLan) &&
          !isExistIpRange(v, -1, this.ipRangeList)
        )
          return cb(new Error(this.$t('egw.flowctrl.network_has_no_ip_tip')))
        cb()
      }
      return [
        { required: true, message: this.$t('egw.ip_or_range_is_required') },
        { validator: isLegalIp },
        { validator: isBelongRange }
      ]
    },
    // 删除策略
    async onDel(row) {
      let _nameArr = []
      if (row) {
        _nameArr = [row.comment]
      } else {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning(this.$t('tip.select_del_item'))
        }
        _nameArr = selection.map(item => item.comment)
      }
      await this.$confirm(this.$t('tip.confirm_delete'))

      this.$api.setPolicyFlow({ rulename: _nameArr }, 'del').then(() => {
        let _data = this.strategyList.filter(item => {
          return _nameArr.indexOf(item.comment) < 0
        })
        this.strategyList = _data
        this.$message({
          type: 'success',
          message: this.$t('tip.del_success')
        })
      })
    },
    onSort(idx, type) {
      let data = this.strategyList.splice(idx, 1)[0]
      idx = type == 'up' ? idx - 1 : idx + 1
      this.strategyList.splice(idx, 0, data)
    },
    onSetSort(idx, name, type) {
      this.$api.setStrategySort(name, type).then(d => {
        this.onSort(idx, type)
        this.$message.success(
          type === 'up'
            ? this.$t('egw.flowctrl.move_up_success')
            : this.$t('egw.flowctrl.move_down_success')
        )
      })
    },
    // 编辑策略确认
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _model = Object.assign({}, this.baseModel)
          let _isAdd = this.editIndex < 0

          this.$api
            .setPolicyFlow({ list: [_model] }, _isAdd ? 'add' : 'update')
            .then(() => {
              this.$message({
                type: 'success',
                message: this.$t('tip.edit1_success')
              })
              this.updateEffective(_model)
              if (_isAdd) {
                this.strategyList.unshift(_model)
              } else {
                this.strategyList.splice(this.editIndex, 1, _model)
              }
              this.strategyModalShow = false
            })
        }
      })
    },
    updateEffective(item) {
      if (item.enable === 'off') {
        item.effective = '0'
      } else {
        item.effective = isIpInNet(item.ipRange, this.networkLan) ? '1' : '0'
      }
    },
    // 切换状态
    toggleStatus(item, index) {
      let _item = Object.assign({}, item, {
        enable: item.enable === 'on' ? 'off' : 'on'
      })
      this.updateEffective(_item)
      this.$api.setPolicyFlow({ list: [_item] }, 'update').then(() => {
        this.$message({
          type: 'success',
          message: this.$t('tip.edit1_success')
        })
        this.strategyList.splice(index, 1, _item)
      })
    },
    // 验证字段
    onValidateField(field) {
      this.$refs.baseForm.validateField(field)
    }
  }
}
</script>
<style lang="scss" scoped>
.advanced-strategy-tab {
  .el-button--text.c-danger,
  .c-danger:hover {
    color: #ed3e6c;
  }
  .c-danger.is-disabled {
    color: #aaadb2;
  }
}
</style>
