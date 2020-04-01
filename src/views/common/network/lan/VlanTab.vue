<template>
  <div class="network-vlan">
    <help-alert :key="showConflict" :title="$t('network.lan_cfg')" json-key="vlanJson" type="info">
      <template slot="content">
        <div class="mt10" v-if="showConflict">
          <i18n path="network.vlan_tab_tip" tag="span">
            <b place="addr">{{ $t("network.addr_conflict") }}</b>
            <b place="last">{{ defaultVlan.lastaddr }}</b>
            <b place="def">{{ defaultVlan.ipaddr }}</b>
          </i18n>
        </div>
      </template>
    </help-alert>

    <div class="box-header mt20">
      <span class="box-header-tit">
        {{ $t("network.lan_cfg") }}
        <small></small>
      </span>
      <div class="fr" v-if="hasVlans">
        <el-button
          icon="el-icon-plus"
          plain
          size="medium"
          type="primary"
          v-auth="{ fn: onEdit, params: { idx: -1 } }"
        >{{ $t("action.add") }}</el-button>
        <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onBatchDel">{{ $t("action.patch_delete") }}</el-button>
      </div>
    </div>
    <help-alert :show-icon="false" title v-if="hasVlans">
      <div slot="content">
        <i18n path="tip.max_limit_f" tag="span">
          <b class="c-warning mlr5">{{MAX_NUM}}</b>
        </i18n>
      </div>
    </help-alert>
    <el-table :data="vlanData.lan" ref="multipleTable" size="medium" stripe>
      <el-table-column :selectable="isSelectable" align="center" type="selection" width="50"></el-table-column>
      <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="ipaddr"></el-table-column>
      <el-table-column :label="$t('sysinfo.mask')" align="center" prop="netmask"></el-table-column>
      <el-table-column :formatter="getVlanId" align="center" label="VlAN ID" prop="vlanid" v-if="hasVlans"></el-table-column>
      <el-table-column :label="$t('phrase.remark')" align="center" prop="desc">
        <template slot-scope="{ row }">{{ row.desc || "-" }}</template>
      </el-table-column>
      <el-table-column :formatter="isDhcpOpen" :label="$t('network.dhcp_serv')" align="center" prop="ignore"></el-table-column>
      <el-table-column :label="$t('network.begin_addr')" align="center" prop="ipstart"></el-table-column>
      <el-table-column :label="$t('network.alloc_ip_cnt')" align="center" prop="limit"></el-table-column>
      <el-table-column :label="$t('network.addr_lease')" align="center" prop="leasetime"></el-table-column>
      <el-table-column :label="$t('action.ope')" align="center" width="100px">
        <template slot-scope="scope">
          <el-button
            size="medium"
            type="text"
            v-auth="{
              fn: onEdit,
              params: { idx: scope.$index, row: scope.row }
            }"
          >{{ $t("action.edit") }}</el-button>
          <el-button
            :disabled="!isCanEditVlanId(scope.row.vlanid)"
            size="medium"
            type="text"
            v-auth="{ fn: onDel, params: scope.$index }"
            v-if="hasVlans"
          >{{ $t("action.delete") }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- vlan编辑 -->
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="500px">
      <el-form :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm" size="medium" status-icon>
        <el-form-item :label="$t('sysinfo.ip_addr')" prop="ipaddr">
          <el-input @input.native="_onChangeLan" class="w200" v-model="modelData.ipaddr"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.mask')" prop="netmask">
          <netmask-input @input.native="_onChangeLan" @select="_onChangeLan(true)" class="w200" v-model="modelData.netmask"></netmask-input>
        </el-form-item>
        <el-form-item label="VlAN ID" prop="vlanid" v-if="curVlan.canEditVlanId">
          <el-input :disabled="!curVlan.canEditVlanId" class="w200" v-model="modelData.vlanid"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.remark')" prop="desc">
          <el-input :placeholder="$t('phrase.remark')" class="w200" v-model="modelData.desc"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.mac_addr')" prop="macaddr">
          <el-input class="w200" v-model="modelData.macaddr"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.dhcp_serv')" prop="ignore">
          <el-switch active-value="0" inactive-value="1" v-model="modelData.ignore"></el-switch>
        </el-form-item>
        <div v-show="modelData.ignore == '0'">
          <el-form-item :label="$t('network.begin_addr')" prop="ipstart">
            <el-input @change="onValidateField('limit')" class="w200" v-model="modelData.ipstart"></el-input>
          </el-form-item>
          <el-form-item :label="$t('network.alloc_ip_cnt')" prop="limit">
            <el-input class="w200" v-model="modelData.limit"></el-input>
          </el-form-item>
          <el-form-item :label="$t('network.addr_lease')" prop="leasetime">
            <el-input class="w200" v-model="modelData.leasetime"></el-input>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.dns_addr')" v-if="isEg">
            <label class="w200">{{dnsServers || modelData.ipaddr || "-"}}</label>
            <el-tooltip effect="light" placement="bottom" v-if="!isEhr">
              <div slot="content">
                <i18n path="network.dns_serv_modity" tag="span">
                  <a @click="_onToDhcpOption" class="c-success pointer" place="dhcp">{{$t("network.dhcp_cfg")}}</a>
                </i18n>
              </div>
              <i class="el-icon-info c-info"></i>
            </el-tooltip>
          </el-form-item>
        </div>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="isModalShow = false" size="medium">{{ $t("action.cancel") }}</el-button>
        <el-button size="medium" type="primary" v-auth="onClickFormBtn">{{ $t("action.confirm") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getRandomMac } from '@/utils/utils'
import {
  maskValidator,
  maskUsedValidator,
  ipValidator,
  macValidator,
  strictIpValidator,
  vlanidOldValidator
} from '@/utils/rules'
import { ipToLong, longToIp, isBetween, intValidate } from '@/utils/rulesUtils'
import formMixins from '@/mixins/formMixins'
import NetmaskInput from '@/common/NetMask'
import model from '@/model'
export default {
  name: 'NetworkVlan',
  data() {
    const limitValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error(I18N.t('network.ip_cnt_int')))
      let _maxLimit = this.maxLimit || 254
      if (v < 1 || v > _maxLimit)
        return cb(new Error(I18N.t('network.ip_cnt_range', { cnt: _maxLimit })))
      cb()
    }
    const vlanipValidate = (r, v, cb) => {
      let _mask = this.modelData.netmask

      if (!_mask) return cb()
      let n = ipToLong(v) & ~ipToLong(_mask)
      let m = (ipToLong(v) + 1) & ~ipToLong(_mask)
      if (n === 0 || m === 0)
        return cb(new Error(I18N.t('wan.invalid_ip_addr')))
      cb()
    }
    const sameNetValidate = (r, v, cb) => {
      if (!this.modelData.netmask) return cb()
      let flag = true
      let curMaskInt = this.modelData.netmask
      curMaskInt = Number(curMaskInt.replace(/\./g, ''))
      this.vlanData.lan.forEach(item => {
        if (item.vlanid != this.curVlan.id && flag) {
          let listMaskInt = Number(item.netmask.replace(/\./g, ''))
          let mask = item.netmask
          if (listMaskInt > curMaskInt) mask = this.modelData.netmask
          if (
            (ipToLong(mask) & ipToLong(item.ipaddr)) ==
            (ipToLong(mask) & ipToLong(this.modelData.ipaddr))
          )
            flag = false
        }
      })
      if (!flag) return cb(new Error(I18N.t('network.gateway_net_exist')))
      return cb()
    }
    const starValidate = (r, v, cb) => {
      if (ipToLong(v) > this.range.end)
        return cb(
          new Error(I18N.t('network.begin_addr_gt', { max: this.range.endIp }))
        )
      if (ipToLong(v) < this.range.start)
        return cb(
          new Error(
            I18N.t('network.begin_addr_gt', { min: this.range.startIp })
          )
        )
      cb()
    }
    const sameVlanValidate = (r, v, cb) => {
      if (v != this.curVlan.id && this.vlanids.indexOf(v) >= 0)
        return cb(new Error(I18N.t('wan.invalid_vlan_id')))
      cb()
    }
    const leasetimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error(I18N.t('rules.require_int')))
      if (!isBetween(v, 2, 2880))
        return cb(new Error(I18N.t('network.lease_range')))
      cb()
    }
    return {
      MAX_NUM: 8,
      defaultVlan: { conflict: 'false' },
      dnsServers: '',
      vlanData: {
        lan: []
      },
      originDataStr: '',
      modelData: model.lanFn(),
      curVlan: {
        index: -1,
        id: '',
        canEditVlanId: true
      },
      modalTitle: '',
      isModalShow: false,
      baseRules: {
        ipaddr: [
          { required: true, message: I18N.t('wan.ip_no_empty') },
          { validator: strictIpValidator },
          { validator: vlanipValidate },
          { validator: sameNetValidate }
        ],
        macaddr: [
          { required: true, message: I18N.t('wan.mac_no_empty') },
          { validator: macValidator }
        ],
        limit: [
          { required: true, message: I18N.t('network.alloc_no_empty') },
          { validator: limitValidate }
        ],
        ipstart: [
          { required: true, message: I18N.t('network.baddr_no_empty') },
          { validator: ipValidator },
          { validator: starValidate }
        ],
        netmask: [
          { required: true, message: I18N.t('wan.mask_no_empty') },
          {
            validator: maskValidator,
            message: I18N.t('wan.invalid_mask_addr')
          },
          { validator: maskUsedValidator }
        ],
        vlanid: [
          { required: true, message: I18N.t('wan.vid_no_empty') },
          { validator: vlanidOldValidator },
          { validator: sameVlanValidate }
        ],
        desc: [
          {
            range: true,
            min: 1,
            max: 28,
            message: I18N.t('network.remark_len_rule')
          }
        ],
        leasetime: [
          { required: true, message: I18N.t('network.lease_no_empty') },
          { validator: leasetimeValidate }
        ]
      }
    }
  },
  computed: {
    showConflict() {
      let _defaultVlan = this.defaultVlan
      return (
        _defaultVlan.conflict === 'true' &&
        _defaultVlan.lastaddr !== _defaultVlan.ipaddr
      )
    },
    hasVlans() {
      return this.$roles().includes('ROUTER') && !this.$roles().includes('ehr')
    },
    isError() {
      return !this.vlanData.wan
    },
    isEg() {
      return this.$dev() === 'egw'
    },
    isEhr() {
      return this.$roles().includes('ehr')
    },
    vlanids() {
      return this.vlanData.lan.map(item => item.vlanid)
    },
    range() {
      if (!this.modelData.ipaddr || !this.modelData.netmask) {
        return {}
      }
      let _ip = this.modelData.ipaddr
      let _mask = this.modelData.netmask
      let _longIpStart = (ipToLong(_ip) & ipToLong(_mask)) + 1
      let _longIpEnd = (ipToLong(_ip) | ~ipToLong(_mask)) - 1
      return {
        start: _longIpStart,
        end: _longIpEnd,
        startIp: longToIp(_longIpStart),
        endIp: longToIp(_longIpEnd)
      }
    },
    maxLimit() {
      if (!this.range.end || !this.modelData.ipstart) {
        return ''
      }
      let _longIpStart = ipToLong(this.modelData.ipstart)
      if (_longIpStart >= this.range.start && _longIpStart <= this.range.end) {
        //合法的开始地址才更新分配IP数范围
        this.oldMaxLimit = this.range.end - _longIpStart + 1
      }
      return this.oldMaxLimit
    },
    preMac() {
      return this.$store.getters.sysinfo.sys_mac.substr(0, 8)
    }
  },
  created() {
    this.init()
  },
  mixins: [formMixins],
  components: {
    NetmaskInput
  },
  methods: {
    async init() {
      let data = await this.$api.getNetwork()

      this.vlanData = data || { lan: [] }
      if (!this.vlanData.lan || !Array.isArray(this.vlanData.lan))
        this.vlanData.lan = []
      this.originDataStr = JSON.stringify(this.vlanData.lan)
      this.getDefaultVlan(data)
      this._getDhcpOption()
    },
    async _getDhcpOption() {
      if (this.isEg) {
        let _dhcpOption = (await this.$api.getDhcpOption(true)).option || []
        this.dnsServers =
          (_dhcpOption.find(o => o.id === '6') || {}).value || ''
      }
    },
    _onToDhcpOption() {
      this.$router.push({
        name: 'admin/alone/network/network_lan',
        query: { tab: '3' }
      })
    },
    getDefaultVlan(data) {
      if (data && data.lan && data.lan.length > 0) {
        this.defaultVlan = Object.freeze({ ...data.lan[0] })
      } else {
        this.defaultVlan = Object.freeze({ conflict: 'false' })
      }
    },
    // 单个删除
    onDel(idx) {
      this.$confirm(I18N.t('tip.confirm_delete'))
        .then(() => {
          this.setAcConfig(idx)
        })
        .catch(() => {})
    },
    // 批量删除
    onBatchDel() {
      let selection = this.$refs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      this.$confirm(I18N.t('tip.confirm_delete'))
        .then(() => {
          selection = selection.map(item => item.vlanid)
          let data = this.vlanData.lan.filter(item => {
            return selection.indexOf(item.vlanid) < 0
          })
          this.setAcConfig(null, data)
        })
        .catch(() => {})
    },
    onEdit({ idx, row = {} }) {
      let isEdit = idx >= 0
      if (!isEdit && this.vlanData.lan.length >= this.MAX_NUM)
        return this.$message.warning(
          I18N.t('tip.max_limit', { cnt: this.MAX_NUM })
        )
      let title = isEdit ? I18N.t('action.edit') : I18N.t('action.add')
      this.onShowModal(title, idx, row, isEdit)
    },
    onShowModal(title, idx, data, isEdit) {
      this.isModalShow = true
      this.modalTitle = title
      this.curVlan.canEditVlanId = this.isCanEditVlanId(data.vlanid)
      this.curVlan.index = idx
      this.curVlan.id = data.vlanid
      this.modelData = Object.assign(model.lanFn(), data, {
        lastaddr: data.ipaddr,
        ovlanid: data.vlanid || '',
        macaddr: data.macaddr || getRandomMac(this.preMac)
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(ok => {
        if (ok) {
          this.isModalShow = false
          let idx =
            this.curVlan.index < 0
              ? this.vlanData.lan.length + 1
              : this.curVlan.index

          this.modelData.limit = this.modelData.limit.toString() // 参数必须转成string类型
          if (!this.modelData.lastaddr) {
            this.modelData.lastaddr = this.modelData.ipaddr
          }
          this.setAcConfig(idx, Object.assign({}, this.modelData))
        }
      })
    },
    setAcConfig(idx, data) {
      if (typeof idx == 'number') {
        if (!data) {
          this.vlanData.lan.splice(idx, 1)
        } else {
          this.vlanData.lan.splice(idx, 1, data)
        }
      } else {
        this.vlanData.lan = data
      }
      this.vlanData.lanNum = this.vlanData.lan.length.toString()
      this.onSave()
    },
    onSave() {
      if (this.isError)
        return this.$alert(
          I18N.t('network.data_err_fresh'),
          I18N.t('network.warn'),
          { type: 'warning' }
        )
      if (this.originDataStr === JSON.stringify(this.vlanData.lan))
        return this.$message(I18N.t('network.cfg_no_modify'))
      this.$api.setNetwork(this.vlanData).then(
        data => {
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
          this.originDataStr = JSON.stringify(this.vlanData.lan)
          this.getDefaultVlan() // 更新冲突提示信息
        },
        () => {
          return this.$alert(
            I18N.t('network.data_err_fresh'),
            I18N.t('network.warn'),
            { type: 'warning' }
          )
        }
      )
    },
    isDhcpOpen(row) {
      return row.ignore == '0'
        ? I18N.t('network.has_enable')
        : I18N.t('network.has_no_enable')
    },
    _onChangeLan(isSelect) {
      if (this.modelData.ipaddr) {
        // 触发校验网段是否已配置
        this.onValidateField('ipaddr')
      }
      if (this.range.startIp) {
        setTimeout(
          () => {
            this.modelData.ipstart = this.range.startIp
            this.modelData.limit = this.maxLimit
          },
          isSelect === true ? 100 : 0
        )
      }
    },
    getVlanId(row) {
      return this.isCanEditVlanId(row.vlanid) ? row.vlanid : '-'
    },
    isSelectable(row) {
      if (!this.isCanEditVlanId(row.vlanid)) return false
      return true
    },
    isCanEditVlanId(vlanid) {
      return vlanid == '233' ? false : true
    },
    // 验证字段
    onValidateField(field) {
      this.$refs.baseForm.validateField(field)
    }
  }
}
</script>
