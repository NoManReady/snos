<template>
  <div class="port-setting-base">
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="_onPatchEdit"
          >{{$t('msw.l3interface.add_svi')}}</el-button>
          <!-- <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="{fn: _onDel, params:-1}">{{$t('action.patch_delete')}}</el-button> -->
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <!-- <el-table-column align="center" type="selection" width="50"></el-table-column> -->
        <el-table-column :label="$t('msw.l3interface.l3_interface')" align="center">
          <template slot-scope="{row}">
            <span v-if="row.iftype == 'svi'">{{'VLAN' + row.vlanid}}</span>
            <span v-else-if="row.iftype == 'ap'">{{'Ag' + row.lpid}}</span>
            <span v-else>{{row.ifname}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.l3interface.port_type')" align="center" prop="iftype">
          <template slot-scope="{row}">
            <span v-if="row.iftype == 'svi'">SVI</span>
            <span v-else-if="row.iftype == 'ap'">{{$t('msw.l3interface.l3_ap')}}</span>
            <span v-else>{{$t('wifi_comm.route')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.l3interface.proto')" align="center" prop="proto">
          <template slot-scope="{row}">
            <span v-if="row.proto == 'static'">{{$t('wan.static_ip')}}</span>
            <span v-else>{{row.proto}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="VLAN" align="center" prop="vlanid"></el-table-column> -->
        <!-- <el-table-column label="MAC地址" align="center" prop="macaddr"></el-table-column> -->
        <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="ipaddr"></el-table-column>
        <el-table-column :label="$t('sysinfo.mask')" align="center" prop="netmask"></el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
            <el-button size="medium" type="text" v-auth="{fn:_onDel,params:$index}">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.page"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <!-- baseModal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.l3interface.port_type')" prop="iftype">
            <el-select :disabled="editIndex > -1" :placeholder="$t('msw.select')" class="w300" v-model="baseModel.iftype">
              <el-option label="SVI" value="svi"></el-option>
              <el-option :label="$t('wifi_comm.route')" value="route"></el-option>
              <el-option :label="$t('msw.l3interface.l3_ap')" value="ap"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.l3interface.proto')" prop="proto">
            <el-select :placeholder="$t('msw.select')" class="w300" disabled v-model="baseModel.proto">
              <el-option label="DHCP" value="dhcp"></el-option>
              <el-option :label="$t('wan.static_ip')" value="static"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.ip_addr')" prop="ipaddr">
            <el-input class="w300" v-model="baseModel.ipaddr"></el-input>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.mask')" prop="netmask">
            <el-input class="w300" v-model="baseModel.netmask"></el-input>
          </el-form-item>
          <el-form-item :label="$t('port_panel.agg_port_tip')" prop="aggregateport" v-if="baseModel.iftype=='ap'">
            <el-select :disabled="editIndex>-1" class="w300" v-model="baseModel.aggregateport">
              <el-option
                :disabled="item.lpid.length>0?true:false"
                :key="index"
                :label="'Ag' + item.aggregateport"
                :value="item.aggregateport"
                v-for="(item, index) in aggList"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="VLAN" prop="vlanid" v-if="baseModel.iftype=='svi'">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.vlanid">
              <el-option :key="index" :label="vlan.n" :value="vlan.v" v-for="(vlan,index) in vlanList"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="baseModel.iftype!='svi'">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="lpid"></el-form-item>
            <port-panel :disableds="disabledPorts" :mutilple="baseModel.iftype=='ap'" :selecteds.sync="baseModel.lpid" />
          </div>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click.native="_onModalConfirm"
            class="w120"
            size="medium"
            type="primary"
          >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { isBetween, inSameNet } from '@/utils/rulesUtils'
import { ipValidator, maskValidator, macValidator } from '@/utils/rules'
import { L3interface } from '@/model/msw/port'
import { mapGetters, mapActions } from 'vuex'
import { sleep } from '@/utils'
import {
  judgePortAttrMutil,
  getLpidByAggid,
  getAggidByLpid,
  hasContainUplink
} from '@/utils/lag'
export default {
  name: 'port-L3interface',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const ipSameValid = (r, v, cb) => {
      let _index = this.pageList.findIndex(d => d.ipaddr === v)
      this.pageList.forEach((item, index) => {
        if (
          inSameNet(v, item.ipaddr, item.netmask) &&
          this.editIndex !== _index
        ) {
          return cb(new Error($t('msw.l3interface.same_ipnet')))
        }
      })
      cb()
    }
    const vlanSameValid = (r, v, cb) => {
      let _index = this.pageList.findIndex(d => d.vlanid === v)
      if (this.vlanMap[v] && this.editIndex !== _index)
        return cb(new Error(this.$t('wifi_comm.vlan_is_has')))
      cb()
    }
    const portidValidator = (r, v, cb) => {
      if (typeof v !== 'object') {
        v = [v]
      }
      if (v.length === 0 || v[0] === '') {
        return cb(
          this.baseModel.iftype === 'ap'
            ? I18N.t('msw.ap.apport_required')
            : I18N.t('msw.port_is_required')
        )
      }
      if (v.length > this.lagMemberMax) {
        return cb(I18N.t('msw.ap.ap_max_member', { n: this.lagMemberMax }))
      }

      let _attr = judgePortAttrMutil(v)

      if (_attr.mutilType) {
        return cb(I18N.t('msw.ap.ap_rule1'))
      }
      if (_attr.mutilSpeed) {
        return cb(I18N.t('msw.ap.ap_rule2'))
      }
      cb()
    }
    return {
      vlanList: [],
      aggList: [],
      // l3interfaceList: [],
      baseModel: L3interface(),
      baseRules: {
        lpid: [{ validator: portidValidator }],
        ipaddr: [
          { validator: ipSameValid },
          { validator: ipValidator, message: this.$t('wan.invalid_ip_addr') },
          { required: true, message: this.$t('wan.ip_no_empty') }
        ],
        netmask: [
          {
            validator: maskValidator,
            message: this.$t('wan.invalid_mask_addr')
          },
          { required: true, message: this.$t('wan.mask_no_empty') }
        ],
        macaddr: [
          { validator: macValidator, message: this.$t('wan.invalid_mac_addr') },
          { required: true, message: this.$t('wan.mac_no_empty') }
        ],
        vlanid: [
          { validator: vlanSameValid },
          { required: true, message: this.$t('msw.vlan.vlan_is_required') }
        ],
        aggregateport: [{ required: true, message: I18N.t('msw.l3interface.please_select_ap') }]
      },
      baseModalShow: false,
      editIndex: -1,
      isLoading: false,
      lagMax: window.APP_CAPACITY_SW.port.aggregate_port.total,
      lagMemberMax: window.APP_CAPACITY_SW.port.aggregate_port.member_num
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'lagPortsMap', 'uplink']),
    modalTitle() {
      return this.editIndex > -1
        ? this.$t('action.edit1')
        : this.$t('action.add')
    },
    // 被使用过的port
    disabledPorts() {
      let _disabledPorts = []
      let _item = { lpid: -999 }
      if (this.editIndex !== -1) {
        _item = this.getItem(this.editIndex)
      }
      let _aggLpid = getLpidByAggid(+_item.lpid)
      for (let key in this.lagPortsMap) {
        if (_aggLpid !== +key) {
          _disabledPorts.push(...this.lagPortsMap[key])
        }
      }
      this.pageModel.allItem.forEach(l3 => {
        if (_item.lpid !== l3.lpid) {
          if (l3.iftype === 'route') {
            _disabledPorts.push(+l3.lpid)
          }
        }
      })
      return _disabledPorts
    },
    ipMap() {
      let _map = {}
      this.pageList.forEach(p => (_map[p.ipaddr] = true))
      return _map
    },
    vlanMap() {
      let _map = {}
      this.pageList.forEach(p => (_map[p.vlanid] = true))
      return _map
    }
  },
  watch: {
    'baseModel.lpid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('lpid')
      }
    },
    'baseModel.iftype'(v, o) {
      if (v === 'ap') {
        if (typeof this.baseModel.lpid != 'object') {
          this.baseModel.lpid = this.baseModel.lpid ? [this.baseModel.lpid] : []
        } else {
          this.baseModel.lpid = this.baseModel.lpid
        }
      } else if (typeof this.baseModel.lpid != 'object') {
        this.baseModel.lpid = this.baseModel.lpid
      } else {
        this.baseModel.lpid = this.baseModel.lpid[0] || ''
      }
    }
  },
  created() {
    this._vlanList()
    this._aggList()
  },
  methods: {
    ...mapActions('switcher', ['fetchPortinfo']),
    // vlan 列表
    async _vlanList() {
      try {
        let _result = await this.$api.cmd(
          'devConfig.get',
          { module: 'vlan' },
          { timeout: 0 }
        )
        this.vlanList = _result.list || []
      } catch (error) {}
    },
    // 聚合口列表 列表
    async _aggList() {
      try {
        let _result = await this.$api.cmd(
          'devConfig.get',
          { module: 'aggregate_port' },
          { timeout: 0 }
        )
        this.aggList = _result.data || []
      } catch (error) {}
    },
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'l3_interface'
        })
        let _list = _result.list
          .sort((a, b) => a.lpid - b.lpid)
          .map(port => {
            port.lpid = port.iftype != 'svi' ? parseInt(port.lpid) : port.lpid
            return {
              ...port,
              ifname: this.piMap[port.lpid] || port.ifname
            }
          })
        return _list
      } catch (error) {}
      return []
    },
    // 添加三层口
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = L3interface()
    },
    // 编辑三层口
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      let _lpid = +_item.lpid
      if (_item.iftype === 'ap') {
        this.aggList.forEach((item, idx) => {
          if (item.aggregateport == _lpid) {
            _lpid = item.lpid
          }
        })
      }
      this.baseModel = { ..._item, lpid: _lpid }
      this.baseModel.aggregateport = _item.lpid
      this.baseModalShow = true
    },
    // 删除
    _onDel(index) {
      this.$confirm(this.$t('tip.confirm_delete'), this.$t('phrase.tip'), {
        type: 'warning'
      }).then(async () => {
        this.isLoading = true
        let delData = Object.assign({}, this.pageList[index])
        if (delData.iftype == 'route' || delData.iftype == 'ap') {
          delData.ifname = ''
          delData.lpid = delData.lpid.toString()
        }
        try {
          if (delData.iftype == 'ap') {
            // let delIds = {del_ap:[parseInt(delData.lpid)]}
            await this._aggUpdate(delData.lpid, [])
          }
          this.$api.cmd('devConfig.del', {
            module: 'l3_interface',
            data: delData
          })
          this.$message.success(I18N.t('tip.del_success'))
          this.pageList.splice(index, 1)
        } catch (error) {}
        this.isLoading = false
      })
    },
    async _l3interfaceSubmit(agg) {
      try {
        let submitData = JSON.parse(JSON.stringify(this.baseModel))
        delete submitData.aggregateport
        if (agg) {
          submitData.lpid = agg
        }
        submitData.vlanid =
          submitData.iftype != 'svi' && this.editIndex == -1
            ? ''
            : submitData.vlanid
        submitData.ifname =
          submitData.iftype != 'svi' && this.editIndex == -1
            ? ''
            : 'eth0.' + submitData.vlanid
        submitData.lpid =
          submitData.iftype == 'svi' ? '' : submitData.lpid.toString()
        if (this.editIndex > -1) {
          this.pageList.splice(this.editIndex, 1, submitData)
          this.pageList.forEach((item, idx) => {
            if (typeof item.lpid != 'string') {
              this.pageList[idx].lpid = this.pageList[idx].lpid.toString()
            }
          })
        }
        this.isLoading = true
        await this.$api.cmd(
          this.editIndex > -1 ? 'devConfig.update' : 'devConfig.add',
          {
            module: 'l3_interface',
            data: this.editIndex > -1 ? { list: this.pageList } : submitData
          },
          { isSilence: true, timeout: 0 }
        )
        if (agg) {
          await this._aggUpdate(submitData.lpid, this.baseModel.lpid)
        }
        this.$message.success(I18N.t('tip.edit1_success'))
        await this.refresh()
        this.baseModalShow = false
      } catch (error) {}
      this.isLoading = false
    },
    // 聚合口编辑
    async _aggUpdate(agg, lpid) {
      let _postData = {
        aggregateport: parseInt(agg),
        lpid: lpid
      }
      this.isLoading = true
      await this.$api.cmd(
        'devConfig.update',
        {
          module: 'aggregate_port',
          data: {
            data: [_postData]
          }
        },
        { timeout: 0 }
      )
      await this.fetchPortinfo()
      if (this.baseModel.iftype == 'ap') {
        await this._aggList()
      }
      this.refresh()
    },
    // modal提交
    _onModalConfirm() {
      let _isEdit = this.editIndex !== -1
      // if (!_isEdit && this.aggList.length === this.lagMax) {
      //   this.$alert(I18N.t('msw.ap.cfg_over_limit'), { type: 'warning' })
      //   return
      // }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          if (this.baseModel.iftype == 'ap') {
            // 移除上联口时提示
            // 编辑态并且当前编辑的是上联聚合口
            if (
              _isEdit &&
              getLpidByAggid(this.baseModel.aggregateport) === this.uplink.lagid
            ) {
              // 原先有，编辑后没有包含说明移除上联口
              let _hasUplink = hasContainUplink(this.baseModel.lpid)
              if (!_hasUplink) {
                await this.$confirm(
                  I18N.t('msw.ap.remove_uplink', {
                    ap: this.baseModel.aggregateport
                  }),
                  {
                    confirmButtonText: I18N.t('action.confirm'),
                    cancelButtonText: I18N.t('action.cancel'),
                    type: 'warning'
                  }
                )
              }
            }
            this._l3interfaceSubmit(this.baseModel.aggregateport)
          } else {
            this._l3interfaceSubmit()
          }
        }
      })
    }
  }
}
</script>

