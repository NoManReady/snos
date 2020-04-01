<template>
  <div class="security-macfilter">
    <help-alert :title="$t('wifi_comm.wire_cfg')" json-key>
      <template slot="content">
        <div>{{$t('wifi_comm.wire_tip1')}}</div>
        <div v-if="!isAlone">
          <strong>{{$t('wifi_comm.wire_cfg_rule_f')}}</strong>
          {{$t('wifi_comm.wire_rule_tip1')}}
          <span class="c-warning">{{$t('wifi_comm.wire_rule_tip2')}}</span>
        </div>
      </template>
    </help-alert>
    <div class="box">
      <div class="box-header" v-if="!isAlone">
        <span class="box-header-tit">{{$t('wifi_comm.ap_def_cfg')}}</span>
      </div>
      <el-form :model="globalModel" class="w650" label-width="160px" ref="globalForm" size="medium">
        <el-form-item :label="$t('wifi_comm.trans_type')" v-if="showTransMode">
          <el-select class="w340" v-model="globalModel.transmode">
            <el-option :key="k" :label="v" :value="k" v-for="(v, k) of transmodeMap"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :rules="[{ validator: vlanIdValidator }]"
          label="VLAN ID"
          prop="vlanId"
          v-if="globalModel.transmode === 'bridge'"
        >
          <el-autocomplete
            :fetch-suggestions="(query, cb) => cb(query ? netVlanId.filter(o => o.value.includes(query)) : netVlanId) "
            class="w340"
            v-model="globalModel.vlanId"
          >
            <template slot-scope="{item}">
              <span>{{ item.value || '-'}}</span>
              <span class="c-info" v-if="item.desc">（{{ item.desc || '-' }}）</span>
            </template>
          </el-autocomplete>
          <el-button @click.native="goToLan" size="medium" type="text" v-if="showVlan">{{$t('wifi_comm.to_add_vlan')}}</el-button>
        </el-form-item>
        <el-form-item>
          <span class="c-info">({{$t('wifi_comm.vlan_tip')}})</span>
        </el-form-item>
        <el-form-item :label="$t('wifi_comm.apply_to_ap')" prop="snList" v-if="!isAlone">
          <el-popover placement="right" title trigger="hover" width="200">
            <div class="el-select clearfix" v-if="globalApList.length > 0">
              <span
                :key="sn"
                :title="$t('wifi_comm.sn_type',{sn,type:apMap[sn] ? apMap[sn].dt : '-'})"
                class="el-tag el-tag--info el-tag--small fl"
                v-for="sn in globalApList"
              >{{apMap[sn] ? apMap[sn].nm : sn}}</span>
            </div>
            <div
              v-else
            >{{$t('wifi_comm.no_eap_result',{reason:aplist.length === 0 ? $t('wifi_comm.reason1') : $t('wifi_comm.reason2')})}}</div>
            <label slot="reference">
              <span>{{$t('wifi_comm.unapply_eap')}}</span>
              <i class="el-icon-info"></i>
            </label>
          </el-popover>
        </el-form-item>
        <el-form-item>
          <el-button class="w160" type="primary" v-auth="onGlobalConfirm">{{$t('action.save_edit')}}</el-button>
        </el-form-item>
      </el-form>
      <template v-if="!isAlone">
        <div class="box-header">
          <span class="box-header-tit">{{$t('wifi_comm.ap_wire_list')}}</span>
          <div class="fr">
            <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn:onEdit,params:-1}">{{$t('action.add')}}</el-button>
            <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
          </div>
        </div>
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="wifi_comm.wire_limit" tag="span">
              <b class="c-warning mr5" place="max">{{MAX_NUM}}</b>
              <b class="c-warning mr5" place="ap">{{MAX_AP_NUM}}</b>
              <b class="c-warning mr5" place="cfg">{{apConfiged.length}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table :data="pageData.singleList" ref="baseTable" row-key="mac" size="medium" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            :label="$t('wifi_comm.trans_type')"
            align="center"
            min-width="80"
            prop="transmode"
            v-if="showTransMode"
          >
            <template slot-scope="{row}">{{ transmodeMap[row.transmode] || '-' }}</template>
          </el-table-column>
          <el-table-column align="center" label="VLAN ID" min-width="110" prop="vlanId" sortable>
            <template slot-scope="{row}">{{ row.transmode === 'bridge' ? (row.vlanId || $t('wifi_comm.vlan_sameas_wan')) : '-' }}</template>
          </el-table-column>
          <el-table-column :label="$t('wifi_comm.apply_to_ap')" align="center" min-width="300" prop="snList">
            <template slot-scope="{row}">
              <div class="el-select clearfix">
                <span
                  :key="sn"
                  :title="$t('wifi_comm.sn_type',{sn,type:apMap[sn] ? apMap[sn].dt : '-'})"
                  class="el-tag el-tag--info el-tag--small fl"
                  v-for="sn in row.snList"
                >{{apMap[sn] ? apMap[sn].nm || sn : sn}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('action.ope')" align="center" min-width="120">
            <template slot-scope="scope">
              <el-button size="medium" type="text" v-auth="{fn:onEdit,params:scope.$index}">{{$t('action.edit')}}</el-button>
              <el-button size="medium" type="text" v-auth="{fn:onDel,params:scope.row}">{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增/编辑 -->
        <el-dialog :title="modalTitle" :visible.sync="modalShow" width="550px">
          <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="medium">
            <el-form-item :label="$t('wifi_comm.trans_type')" prop="transmode" v-if="showTransMode">
              <el-select class="w340" v-model="baseModel.transmode">
                <el-option :key="k" :label="v" :value="k" v-for="(v, k) of transmodeMap"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="VLAN ID" prop="vlanId" v-if="baseModel.transmode === 'bridge'">
              <el-autocomplete
                :fetch-suggestions="(query, cb) => cb(query ? netVlanId.filter(o => o.value.includes(query)) : netVlanId) "
                class="w340"
                v-model="baseModel.vlanId"
              >
                <template slot-scope="{item}">
                  <span>{{ item.value || '-'}}</span>
                  <span class="c-info" v-if="item.desc">（{{ item.desc || '-' }}）</span>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item>
              <span class="c-info">({{$t('wifi_comm.vlan_tip')}})</span>
            </el-form-item>
            <el-form-item :label="$t('wifi_comm.apply_to_ap')" prop="snList">
              <el-select
                :filter-method="filterAp"
                :placeholder="$t('wifi_comm.filter_ap')"
                class="w340"
                filterable
                multiple
                v-model="baseModel.snList"
              >
                <el-option-group
                  :disabled="AP_UNSUPPORT_LIST.includes(type)"
                  :key="type"
                  :label="$t('wifi_comm.ap_unsupport',{type,tip:!AP_UNSUPPORT_LIST.includes(type) ? $t('wifi_comm.selected_num',{num:_getSumGroup(type)}) : $t('wifi_comm.unsupport_tip')})"
                  v-for="type in apGroupKeys"
                >
                  <el-option
                    :disabled="disabledAp.includes(ap.sn)"
                    :key="ap.sn"
                    :label="`${ap.sn}`"
                    :value="ap.sn"
                    v-for="ap in apGroup[type]"
                  >
                    <span :title="`${ap.nm || ap.sn}-${ap.dt}`" class="fl ellipsis w150">{{ ap.nm || ap.sn}}</span>
                    <span class="fr c-info mr20">{{ ap.sn }}</span>
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
          </el-form>
          <span class="dialog-footer" slot="footer">
            <el-button @click="modalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
            <el-button @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
          </span>
        </el-dialog>
      </template>
    </div>
  </div>
</template>
<script>
import { vlanidOldValidator } from '@/utils/rules'
import ArpInput from '@/common/ArpInput'
export default {
  name: 'NetworkWirelan',
  data() {
    const apNumValidator = (rule, value, cb) => {
      if (value.length > this.ableApNum) {
        return cb(
          new Error(I18N.t('wifi_comm.ap_over_limit', { max: this.MAX_AP_NUM }))
        )
      }
      cb()
    }
    const existVlanValidator = (rule, value, cb) => {
      if (
        this.globalModel.transmode === 'bridge' &&
        value === this.globalModel.vlanId
      ) {
        return cb(new Error(I18N.t('wifi_comm.has_cfg_vlan', { vlan: vlan })))
      }
      if (this.existVlanid.includes(value)) {
        return cb(
          new Error(
            I18N.t('wifi_comm.has_exist_wire_cfg', {
              vlan: value
                ? ' VLAN ' + value
                : `“${I18N.t('wifi_comm.vlan_sameas_wan')}”`
            })
          )
        )
      }
      cb()
    }
    const existTransmodelidator = (rule, value, cb) => {
      if (
        value === 'nat' &&
        this.baseModel.editVlanId !== '233' &&
        this.pageData.singleList.some(o => o.transmode === 'nat')
      ) {
        return cb(I18N.t('wifi_comm.exist_route_rule'))
      }
      cb()
    }
    return {
      MAX_NUM: 8,
      MAX_AP_NUM: 32,
      AP_UNSUPPORT_LIST: ['EAP201', 'EAP202', 'EAP212(G)', 'EAP212(F)'],
      showTransMode: false,
      modalTitle: I18N.t('wifi_comm.ap_wire_cfg'),
      transmodeMap: {
        nat: I18N.t('wifi_comm.route'),
        bridge: I18N.t('wifi_comm.bridge')
      },
      aplist: [
        // { sn: 'CAL91GE016016', dt: 'EAP201', nm: 'EAP104' },
        // { sn: 'CAL91GE016017', dt: 'EAP202', nm: 'EAP104' },
        // { sn: 'CAL91GE016018', dt: 'EAP201', nm: 'EAP105' },
        // { sn: 'CAL91GE016019', dt: 'EAP105', nm: 'EAP105 SN' },
        // { sn: 'H1MQ3W9000474', dt: 'EAP101', nm: 'ruijie1' },
        // { sn: 'CAL91GE01601C', dt: 'EAP101', nm: '工位' },
        // { sn: '1234942570022', dt: 'EAP102', nm: '11楼AP102' },
        // { sn: 'MACC8CX017421', dt: 'EAP101', nm: '8楼101' },
        // { sn: 'CAL91GE016011', dt: 'EAP102', nm: 'ABC' },
        // { sn: 'CAL91GE016012', dt: 'EAP102', nm: 'ruijie6' },
        // { sn: 'CAL91GE016013', dt: 'EAP101', nm: 'ruijie7' },
        // { sn: 'CAL91GE016014', dt: 'EAP101', nm: 'ruijie8' },
        // { sn: 'CAL91GE016015', dt: 'EAP101', nm: 'ruijie9' }
      ],
      pageData: {
        list: [],
        singleList: []
      },
      globalModel: {
        portId: '1',
        transmode: 'bridge',
        vlanId: ''
      },
      baseModel: this._getModelWirelan(),
      baseRules: {
        snList: [
          { required: true, message: I18N.t('wifi_comm.select_match_ap') },
          { validator: apNumValidator, maxApNum: this.MAX_AP_NUM }
        ],
        transmode: [{ validator: existTransmodelidator }],
        vlanId: [
          { validator: this.vlanIdValidator },
          { validator: existVlanValidator }
        ]
      },
      modalShow: false,
      disabledAp: [],
      netVlanId: [],
      editIndex: -1
    }
  },
  components: {
    ArpInput
  },
  computed: {
    isAlone() {
      return this.$roles().includes('alone')
    },
    globalApList() {
      let _global = this.pageData.list[0] || {}
      let _globalInSingleList = this.pageData.singleList.find(
        list =>
          _global.vlanId === list.vlanId && _global.transmode === list.transmode
      )
      _globalInSingleList = _globalInSingleList
        ? _globalInSingleList.snList
        : []

      return this.aplist
        .filter(
          ap =>
            !this.apConfiged.includes(ap.sn) &&
            !this.AP_UNSUPPORT_LIST.includes(ap.dt)
        )
        .map(ap => ap.sn)
        .concat(_globalInSingleList)
    },
    apConfiged() {
      return this.pageData.singleList.reduce(
        (apArr, n) => apArr.concat(n.snList),
        []
      )
    },
    apMap() {
      let _map = {}
      this.aplist.forEach(o => !_map[o.sn] && (_map[o.sn] = o))
      return _map
    },
    apGroup() {
      let _map = {}
      this.aplist.forEach(
        o => (!_map[o.dt] && (_map[o.dt] = [o])) || _map[o.dt].push(o)
      )
      return _map
    },
    // 排序AP列表，把不支持的列表放在最后
    apGroupKeys() {
      return Object.keys(this.apGroup)
        .sort()
        .sort((a, b) => (this.AP_UNSUPPORT_LIST.includes(a) ? 1 : 0))
    },
    ableApNum() {
      return this.MAX_AP_NUM - this.disabledAp.length
    },
    existVlanid() {
      return this.pageData.singleList
        .filter(
          o =>
            o.transmode === 'bridge' && o.vlanId !== this.baseModel.editVlanId
        )
        .map(o => o.vlanId)
    },
    showVlan() {
      return this.$roles().includes('ROUTER')
    }
  },
  created() {
    this._loadList()
    this._getStaListLite()
    this._getNetwork()
  },
  methods: {
    vlanIdValidator(rule, value, cb) {
      if (this.globalModel.transmode === 'bridge' && value !== '') {
        return vlanidOldValidator(rule, value, cb)
      }
      cb()
    },
    _getModelWirelan() {
      return {
        portId: '1',
        snList: [],
        transmode: 'bridge',
        vlanId: ''
      }
    },
    // 加载
    async _loadList() {
      let _res = await this.$api.getWireLan()
      // 转发模式根据设备工作模式生效，去掉转发模式配置（都设为bridge可设置vlanid）
      if (!this.showTransMode) {
        _res.list[0] && (_res.list[0].transmode = 'bridge')
        _res.singleList && _res.singleList.map(o => (o.transmode = 'bridge'))
      }
      this.globalModel = Object.assign({}, this.globalModel, _res.list[0] || {})
      this.pageData = Object.assign({}, this.pageData, _res || {})
    },
    async _getStaListLite() {
      let _res = await this.$api.getAplistLite({
        status: 'ON',
        productType: 'EAP'
      })
      this.aplist = (_res.list || []).filter(ap => ap.dt.includes('AP'))
      this.aplistCopy = [...this.aplist]
    },
    async _getNetwork() {
      let _res = await this.$api.getNetwork()
      this.netVlanId = (_res.lan || [])
        .filter(o => o.vlanid !== '233')
        .map(o => ({ value: o.vlanid, desc: o.desc }))
    },
    _getSumGroup(type) {
      const _typeList = this.apGroup[type] || []
      return (
        this.baseModel.snList.filter(sn => !!_typeList.find(ap => ap.sn === sn))
          .length || 0
      )
    },
    // 新增 || 编辑
    onEdit(index) {
      this.editIndex = index
      let row = this.pageData.singleList[index] || {}

      this.baseModel = Object.assign(this._getModelWirelan(), row)
      if (index === -1) {
        this.modalTitle = I18N.t('action.add')

        if (this.pageData.singleList.length >= this.MAX_NUM) {
          return this.$message.warning(
            I18N.t('tip.max_limit', { cnt: this.MAX_NUM })
          )
        }
        if (this.apConfiged.length >= this.MAX_AP_NUM) {
          return this.$message.warning(
            I18N.t('wifi_comm.match_ap_limit', { max: this.MAX_AP_NUM })
          )
        }

        this.disabledAp = this.apConfiged
      } else {
        this.modalTitle = I18N.t('action.edit')

        this.baseModel.editVlanId =
          row.transmode === 'bridge' ? row.vlanId : '233'
        this.disabledAp = this.apConfiged.filter(sn => !row.snList.includes(sn))
      }

      this.modalShow = true
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    //删除
    onDel(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning(I18N.t('tip.select_del_item'))
        }
      }
      this.$confirm(I18N.t('tip.confirm_delete')).then(() => {
        // 更新本地数据
        this.pageData.singleList = this.pageData.singleList.filter(o => {
          return !_items.find(so =>
            so.transmode === 'nat'
              ? o.transmode === 'nat'
              : o.transmode === 'bridge' && o.vlanId === so.vlanId
          )
        })
        this.onSave(true)
      })
    },
    onGlobalConfirm() {
      this.$refs.globalForm.validate(valid => {
        if (valid) {
          this.$set(
            this.pageData.list,
            0,
            Object.assign({}, this.pageData.list[0], this.globalModel)
          )
          this.onSave()
        }
      })
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          delete this.baseModel.editVlanId

          this.editIndex === -1
            ? this.pageData.singleList.push(this.baseModel)
            : this.pageData.singleList.splice(this.editIndex, 1, this.baseModel)
          this.onSave()
        }
      })
    },
    // 校验通过下发数据
    async onSave(isDel) {
      await this.$api.setWireLan(this.pageData)
      this.$message.success(
        isDel ? I18N.t('tip.del_success') : I18N.t('tip.edit1_success')
      )
      this.modalShow = false
    },
    goToLan() {
      this.$router.push({
        name: 'admin/alone/network/network_lan',
        query: { tab: '0' }
      })
    },
    filterAp(val) {
      if (val) {
        let _val = val.toLocaleLowerCase()
        this.aplist = this.aplistCopy.filter(
          ap =>
            ap.nm.toLocaleLowerCase().includes(_val) ||
            ap.sn.toLocaleLowerCase().includes(_val)
        )
      } else {
        this.aplist = this.aplistCopy
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
