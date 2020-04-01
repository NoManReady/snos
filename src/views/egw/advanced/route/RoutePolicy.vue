<template>
  <div class="advanced-route-policy">
    <help-alert :title="title" json-key="routePolicyJson">
      <div slot="content">
        <div>
          <strong>{{$t('egw.route.route_first')}}</strong>{{$t('egw.route.priority_route_tip')}}
        </div>
        <div class="mt5">
          <strong>{{$t('egw.route.explain')}}</strong>{{$t('egw.route.priority_route_tip2')}}
        </div>
      </div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        {{$t('egw.route.strategy_route_tab')}}
        <small></small>
      </span>
      <div class="fr">
        <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn:onEdit, params:-1}">{{$t('action.add')}}</el-button>
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
    <el-table :data="pageList" ref="multipleTable" row-key="name" size="medium" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" :label="$t('egw.nat.rule_name')" prop="name"></el-table-column>
      <el-table-column :formatter="formatProto" align="center" :label="$t('egw.protocol_type')" prop="proto"></el-table-column>
      <el-table-column :formatter="formatIp" align="center" :label="$t('egw.route.originator_ip')" prop="sip"></el-table-column>
      <el-table-column :formatter="formatIp" align="center" :label="$t('egw.route.destination_ip')" prop="dip"></el-table-column>
      <el-table-column :formatter="formatPort" align="center" :label="$t('egw.route.originator_port_limit')" prop="sport"></el-table-column>
      <el-table-column :formatter="formatPort" align="center" :label="$t('egw.route.destination_port_limit')" prop="dport"></el-table-column>
      <el-table-column align="center" :label="$t('egw.interface')" prop="intf">
        <template slot-scope="scope">{{scope.row.intf.toLocaleUpperCase()}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('phrase.status')" prop="enable">
        <template slot-scope="scope">
          <div @click="toggleStatus(scope.row,scope.$index)" class="toggle-status pointer">
            <span class="c-success" v-if="scope.row.enable==='on'">
              {{$t('phrase.enable')}}
              <i class="el-icon-circle-check"></i>
            </span>
            <span class="c-danger" v-else>
              {{$t('phrase.disable')}}
              <i class="el-icon-remove"></i>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('egw.matching_order')" v-if="list.length > 1" width="100px">
        <template slot-scope="scope">
          <el-button
            @click="onSetSort(scope.$index, scope.row.name, 'up')"
            size="medium"
            :title="$t('egw.move_up_strategy')"
            type="text"
            v-if="getRealIndex(scope.$index) > 0"
          >
            <i class="el-icon-sort-up"></i>
          </el-button>
          <el-button
            @click="onSetSort(scope.$index, scope.row.name, 'down')"
            size="medium"
            :title="$t('egw.move_down')"
            type="text"
            v-if="getRealIndex(scope.$index) < list.length - 1"
          >
            <i class="el-icon-sort-down"></i>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('action.ope')" width="100px">
        <template slot-scope="scope">
          <el-button @click="onEdit(scope.$index,scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
          <el-button @click="onDel([scope.row.name])" size="medium" type="text">{{$t('action.delete')}}</el-button>
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
        <el-form-item :label="$t('egw.nat.rule_name')" prop="name">
          <el-input :disabled="!isAdd" class="w260" v-model="modelData.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.protocol_type')" prop="proto">
          <el-select class="w260" :placeholder="$t('egw.protocol_type_select')" v-model="modelData.proto">
            <el-option label="IP" value="ip"></el-option>
            <el-option label="ICMP" value="icmp"></el-option>
            <el-option label="TCP" value="tcp"></el-option>
            <el-option label="UDP" value="udp"></el-option>
            <el-option :label="$t('egw.custom')" value="udef_proto"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.proto === 'udef_proto'">
          <el-form-item :label="$t('egw.route.protocol_number')" prop="udef_proto">
            <el-input class="w260" placeholder="1-255" v-model="modelData.udef_proto"></el-input>
          </el-form-item>
        </template>
        <template v-if="modelData.proto === 'tcp' || modelData.proto === 'udp'">
          <el-form-item class="is-required" :label="$t('egw.route.originator_port_limit')">
            <!-- <el-input v-model="modelData.sport" class="w260" placeholder="1-65535"></el-input> -->
            <el-form-item label prop="sportMin">
              <el-input @change="onValidateField('sportMax')" class="w110" placeholder="1-65535" v-model="modelData.sportMin"></el-input>
            </el-form-item>
            <span>—</span>
            <el-form-item class="ml10" label prop="sportMax">
              <el-input @change="onValidateField('sportMin')" class="w110" placeholder="1-65535" v-model="modelData.sportMax"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item class="is-required" :label="$t('egw.route.destination_port_limit')">
            <el-form-item label prop="dportMin">
              <el-input @change="onValidateField('dportMax')" class="w110" placeholder="1-65535" v-model="modelData.dportMin"></el-input>
            </el-form-item>
            <span>—</span>
            <el-form-item class="ml10" label prop="dportMax">
              <el-input @change="onValidateField('dportMin')" class="w110" placeholder="1-65535" v-model="modelData.dportMax"></el-input>
            </el-form-item>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.route.originator_ip_limit')">
          <el-select class="w260" :placeholder="$t('action.select')" v-model="modelData.sip">
            <el-option :label="$t('egw.all_ip')" value="all"></el-option>
            <el-option :label="$t('egw.custom')" value="udef_src"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.sip === 'udef_src'">
          <el-form-item :rules="ipValidate()" class="is-required" :label="$t('egw.route.custom_originator_ip')" prop="sipRange">
            <el-input class="w260" :placeholder="$t('wan.ip_range_example')" v-model="modelData.sipRange"></el-input>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.route.destination_ip_limit')">
          <el-select class="w260" :placeholder="$t('action.select')" v-model="modelData.dip">
            <el-option :label="$t('egw.all_ip')" value="all"></el-option>
            <el-option :label="$t('egw.custom')" value="udef_dst"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.dip === 'udef_dst'">
          <el-form-item :rules="ipValidate()" class="is-required" :label="$t('egw.route.custom_destination_ip')" prop="dipRange">
            <el-input class="w260" :placeholder="$t('wan.ip_range_example')" v-model="modelData.dipRange"></el-input>
          </el-form-item>
        </template>
        <el-form-item :label="$t('egw.interface')" prop="intf">
          <el-select class="w260" :placeholder="$t('egw.select_interface')" v-model="modelData.intf">
            <el-option :key="index" :label="item" :value="item" v-for="(item, index) in intfArr"></el-option>
            <!-- <el-option label="WAN" value="wan"></el-option>
            <el-option label="WAN1" value="wan1"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('phrase.status')" prop="enable">
          <el-switch active-value="on" inactive-value="off" v-model="modelData.enable"></el-switch>
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
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import pageMixins from '@/mixins/pageMixins'
import model from '@/model'
import { intValidator } from '@/utils/rules'
import { isBetween, isIp, isIpRange } from '@/utils/rulesUtils'
export default {
  name: 'AdvancedRoutePolicy',
  data() {
    const udefProtoValidate = (r, v, cb) => {
      if (v && !isBetween(v, 1, 255)) return cb(new Error(this.$t('egw.protocol_number_limit_tip')))
      cb()
    }
    const sameNameValidate = (r, v, cb) => {
      if (this.isAdd && this.listNameMap.includes(v))
        return cb(new Error(this.$t('egw.rule_name_is_duplication')))
      cb()
    }
    const _portValidate = (r, v, cb) => {
      if (v && !isBetween(v, 1, 65535)) return cb(new Error(this.$t('egw.port_limit_tip')))
      cb()
    }
    const _portCompare = (rule, val, cb) => {
      let isSort = rule.field.includes('sport')
      if (val === '') {
        cb()
      }
      let m = this.modelData
      if (isSort) {
        if (m.sportMin && m.sportMax && m.sportMax - m.sportMin < 0) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      } else {
        if (m.dportMin && m.dportMax && m.dportMax - m.dportMin < 0) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      }
      cb()
    }
    const _getRules = isMin => {
      return [
        {
          required: true,
          message: isMin ? this.$t('egw.route.enter_port_start') : this.$t('egw.route.enter_port_end')
        },
        { validator: intValidator, message: this.$t('egw.enter_positive_integer') },
        { validator: _portValidate },
        {
          validator: _portCompare,
          message: isMin ?  this.$t('egw.route.less_then_port_end') : this.$t('egw.route.more_then_port_start')
        }
      ]
    }
    return {
      MAX_NUM: 30,
      title: this.$t('egw.route.priority_route'),
      list: [],
      modalTitle: '',
      isAdd: true,
      isModalShow: false,
      intfArr: [],
      modelData: model.routePolicyFn(),
      baseRules: {
        name: [
          { required: true, message:  this.$t('egw.enter_rule_name') },
          { range: true, min: 1, max: 28, message: this.$t('egw.rule_name_length_tip') },
          { validator: sameNameValidate }
        ],
        udef_proto: [
          { required: true, message: this.$t('egw.route.enter_protocol_number') },
          { validator: intValidator, message: this.$t('egw.enter_positive_integer') },
          { validator: udefProtoValidate }
        ],
        sportMin: _getRules(true),
        sportMax: _getRules(false),
        dportMin: _getRules(true),
        dportMax: _getRules(false)
      }
    }
  },
  mixins: [pageMixins, formMixins],
  computed: {
    listNameMap() {
      return this.list.map(item => item.name)
    }
  },
  watch: {
    'modelData.proto'(v) {
      let _md = this.modelData
      if (v === 'tcp' || v === 'udp') {
        if (!!_md.sport) {
          let _sports = _md.sport.split(/\s*:\s*/)
          _md.sportMin = _md.sportMin || _sports[0]
          _md.sportMax = _md.sportMax || _sports[1]
        }

        if (!!_md.dport) {
          let _dports = _md.dport.split(/\s*:\s*/)
          _md.dportMin = _md.dportMin || _dports[0]
          _md.dportMax = _md.dportMax || _dports[1]
        }
      } else {
        delete _md.sportMin
        delete _md.sportMax
        delete _md.dportMin
        delete _md.dportMax
      }
    }
  },
  created() {
    this.loadIfaceTypes()
  },
  methods: {
    async _loadList() {
      let _d = await this.$api.getRoutePolicy()
      this.list = _d.list || []
      return _d.list || []
    },
    async loadIfaceTypes() {
      const result = await this.$api.getIfaceTypes()
      this.intfArr = result.map(item => item.toLocaleUpperCase())
    },
    // 切换状态
    toggleStatus(item, index) {
      item.enable = item.enable === 'on' ? 'off' : 'on'
      this.isAdd = false
      this.onSave(item)
    },
    onEdit(idx, row = {}) {
      this.isAdd = idx < 0
      if (this.isAdd && this.list.length >= this.MAX_NUM) {
        return this.$message.warning(
          `${this.title}`+ this.$t('egw.auth.most_can_any') +  `${this.MAX_NUM}`
        )
      }
      this.modalTitle = this.isAdd ? this.$t('egw.route.strategy_route_add') : this.$t('egw.route.strategy_route_edit')
      this.modelData = Object.assign(model.routePolicyFn(), row)
      this.modelData.intf = this.modelData.intf.toLocaleUpperCase()
      this.isModalShow = true
    },
    async onDel(nameArr) {
      if (!nameArr) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning( this.$t('tip.select_del_item'))
        }
        nameArr = selection.map(item => item.name)
      }
      await this.$confirm(this.$t('tip.confirm_delete'))
      this.$api.setRoutePolicy({ rulename: nameArr }, 'del', true).then(_ => {
        nameArr.forEach(item => {
          let _index = this.pageModel.allItem.findIndex(
            ({ name }) => name === item
          )
          this.pageModel.allItem.splice(_index, 1)
        })
        this.$message.success(this.$t('tip.del_success'))
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          this.onSave()
          this.isModalShow = false
        }
      })
    },
    onSave(data) {
      let _data = data
      if (!_data) {
        _data = { ...this.modelData }
        let _proto = _data.proto
        if (_proto === 'tcp' || _proto === 'udp') {
          _data.sport = `${_data.sportMin}:${_data.sportMax}`
          _data.dport = `${_data.dportMin}:${_data.dportMax}`

          delete _data.sportMin
          delete _data.sportMax
          delete _data.dportMin
          delete _data.dportMax
        }

        if (_data.sip === 'all') {
          delete _data.sipRange
        }
        if (_data.dip === 'all') {
          delete _data.dipRange
        }
      }
      _data.intf = _data.intf.toLocaleLowerCase()
      let _setData = {
        list: [_data]
      }
      this.$api
        .setRoutePolicy(_setData, this.isAdd ? 'add' : 'update', true)
        .then(d => {
          if (this.isAdd) {
            this.pageModel.allItem.unshift(_data)
          } else {
            let _index = this.pageModel.allItem.findIndex(
              ({ name }) => name === _data.name
            )
            this.pageModel.allItem.splice(_index, 1, _data)
          }
          this.$message.success(this.$t('tip.edit1_success'))
        })
    },
    onSort(idx, type) {
      let data = this.list.splice(idx, 1)[0]
      idx = type == 'up' ? idx - 1 : idx + 1
      this.list.splice(idx, 0, data)
    },
    onSetSort(idx, name, type) {
      this.$api.setRoutePolicySort(name, type).then(d => {
        let _realIdx = this.getRealIndex(idx)
        this.onSort(_realIdx, type)
        this.$message.success(type === 'up' ? this.$t('egw.flowctrl.move_up_success') : this.$t('egw.flowctrl.move_down_success'))
      })
    },
    formatProto(row, col) {
      let _key = col.property
      let _v = row[_key]

      return _v === 'udef_proto'
        ? this.$t('egw.route.protocol_number') + `${row.udef_proto}`
        : _v.toLocaleUpperCase()
    },
    formatIp(row, col) {
      let _key = col.property
      let _v = row[_key]

      if (_v === 'udef_src') {
        return row.sipRange
      } else if (_v === 'udef_dst') {
        return row.dipRange
      } else {
        return _v === 'all' ? this.$t('egw.all_ip')  : _v
      }
    },
    formatPort(row, col) {
      let _key = col.property
      let _v = row[_key] || '-'
      return (
        {
          all: this.$t('egw.all_port'),
          '-': '-'
        }[_v] || _v.replace(':', '-')
      )
    },
    ipValidate() {
      const isLegalIp = (r, v, cb) => {
        if (!isIp(v) && !isIpRange(v))
          return cb(new Error(this.$t('egw.ip_or_range')))
        cb()
      }
      return [
        { required: true, message: this.$t('egw.ip_or_range_is_required') },
        { validator: isLegalIp }
      ]
    },
    // 验证字段
    onValidateField(field) {
      this.$refs.baseForm.validateField(field)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
