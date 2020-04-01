<template>
  <div class="vpn-security-strategy">
    <help-alert :title="$t('egw.ipsec.ipsec_security_policy')" json-key="vpnSecurityJson">
      <div slot="content">
        <p>
          <strong>{{$t('phrase.notice_f')}}</strong>
          {{$t('egw.ipsec.mask_module_tip')}}
        </p>
        <p>
          <strong>{{$t('phrase.tip_f')}}</strong>
          {{$t('egw.ipsec.mask_example')}}
        </p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.ipsec.policy_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="list.length>=TOTAL_NUM||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="{fn:_onEdit,params:-1}"
          >{{$t('action.add')}}</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="egw.limit_num_tip" tag="span">
              <b class="c-warning mlr5">1</b>
            </i18n>
            <template v-if="hasByOthers">{{$t('egw.ipsec.no_edit_l2tp')}}</template>
          </div>
        </help-alert>
        <el-table :data="list" ref="baseTable" row-ke="name" size="medium" stripe>
          <el-table-column :label="$t('egw.ipsec.policy_type')" align="center" prop="connection_type">
            <template slot-scope="{row}">
              <el-tag color="#409eff1a" v-if="row.connection_type === 'initiator'">{{$t('egw.ipsec.initiator')}}</el-tag>
              <el-tag color="#67c23a1a" v-else>{{$t('egw.ipsec.master')}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('egw.ipsec.policy_name')" align="center" prop="name"></el-table-column>
          <el-table-column :label="$t('egw.ipsec.peer_gateway')" align="center" min-width="120" prop="remote_gateway"></el-table-column>
          <el-table-column :label="$t('egw.ipsec.local_subnet_scope')" align="center" min-width="135" prop="local_network">
            <template slot-scope="{row}">
              <div :key="ip" v-for="ip in row.local_network">{{ip}}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('egw.ipsec.terminal_network_range')" align="center" min-width="135" prop="remote_network">
            <template slot-scope="{row}">
              <div :key="ip" v-for="ip in row.remote_network">{{ip}}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('phrase.status')" align="center" prop="status">
            <template slot-scope="{row, $index}">
              <el-button
                :class="row.status === 'enable' ? 'success' : 'c-warning'"
                :disabled="row.create_by!=='web'"
                @click="toggleStatus(row,$index)"
                size="medium"
                type="text"
              >
                {{row.status === 'enable' ? $t('phrase.enable') : $t('phrase.disable')}}
                <i
                  :class="row.status === 'enable' ? 'el-icon-circle-check' : 'el-icon-remove'"
                ></i>
              </el-button>
            </template>
          </el-table-column>
          <el-table-column :label="$t('action.ope')" align="center" min-width="100">
            <template slot-scope="{row, $index}">
              <el-button
                :disabled="isLoading || row.create_by!=='web'"
                size="medium"
                type="text"
                v-auth="{fn:_onEdit,params:$index}"
              >{{$t('action.edit')}}</el-button>
              <el-button
                :disabled="isLoading || row.create_by!=='web'"
                size="medium"
                type="text"
                v-auth="{fn:_onDel,params:row}"
              >{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 用户管理编辑modal -->
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="baseModalShow" width="520px">
      <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm" size="medium">
        <el-form-item :label="$t('egw.ipsec.policy_type')" prop="connection_type">
          <el-radio-group v-model="baseModel.connection_type">
            <el-radio label="initiator">{{$t('egw.ipsec.initiator')}}</el-radio>
            <el-radio label="responder">{{$t('egw.ipsec.master')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.policy_name')" prop="name">
          <el-input
            :disabled="editIndex > -1"
            :placeholder="$t('egw.rule_name_length_tip')"
            class="w300"
            v-model="baseModel.name"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.peer_gateway')" prop="remote_gateway" v-if="isClient">
          <el-input :placeholder="$t('egw.ipsec.mac_or_ip')" class="w300" v-model="baseModel.remote_gateway"></el-input>
          <el-button @click="showOhterGateway=!showOhterGateway" size="medium" type="text" v-show="!showOhterGateway">
            <i :class="showOhterGateway ? 'el-icon-close' : 'el-icon-plus'"></i>
          </el-button>
        </el-form-item>
        <el-form-item prop="remote_gateway1" v-if="isClient && showOhterGateway">
          <el-input :placeholder="$t('egw.ipsec.gateway_second')" class="w300" v-model="baseModel.remote_gateway1"></el-input>
          <el-button @click="showOhterGateway=false" type="text">
            <i class="el-icon-close"></i>
          </el-button>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.interface_bind')" prop="intf_binding">
          <el-select class="w300" v-model="baseModel.intf_binding">
            <el-option :label="$t('phrase.auto')" key="AUTO" value="AUTO"></el-option>
            <el-option
              :key="`WAN${n-1}`"
              :label="`WAN${n === 1 ? '' : n-1}`"
              :value="`WAN${n === 1 ? '' : n-1}`"
              v-for="n in wanNum"
            ></el-option>
          </el-select>
          <el-tooltip :content="$t('egw.ipsec.interface_auto_tip')" effect="light" placement="right">
            <el-button type="text">
              <i class="rjucd-help fs22"></i>
            </el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.local_subnet_scope')" class="is-required" prop="local_network">
          <!-- <el-input
            class="w300"
            v-model="baseModel.local_network"
            placeholder="格式：192.168.110.0/24"
          ></el-input>-->
          <el-form-item
            :class="{mb20:index!==baseModel.local_network.length-1}"
            :key="index"
            :prop="`local_network[${index}]`"
            :rules="ipValidate(item,index, true)"
            v-for="(item,index) in baseModel.local_network"
          >
            <el-input :placeholder="$t('rules.net_example')" class="w300" v-model="baseModel.local_network[index]"></el-input>
            <!-- <el-button type="text" @click="onDelAuthIpList(index, true)" v-if="baseModel.local_network.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button type="text" @click="onAddAuthIpList(true)" v-if="index === baseModel.local_network.length - 1 && baseModel.local_network.length < 2">
              <i class="el-icon-plus"></i>
            </el-button>-->
          </el-form-item>
        </el-form-item>
        <el-form-item class="is-required" :label="$t('egw.ipsec.terminal_network_range')" prop="remote_network" v-if="isClient">
          <el-form-item
            :class="{mb20:index!==baseModel.remote_network.length-1}"
            :key="index"
            :prop="`remote_network[${index}]`"
            :rules="ipValidate(item,index)"
            v-for="(item,index) in baseModel.remote_network"
          >
            <el-input :placeholder="$t('rules.net_example')" class="w300" v-model="baseModel.remote_network[index]"></el-input>
            <el-button @click="onDelAuthIpList(index)" type="text" v-if="baseModel.remote_network.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button
              @click="onAddAuthIpList(false)"
              type="text"
              v-if="index === baseModel.remote_network.length - 1 && baseModel.remote_network.length < 2"
            >
              <i class="el-icon-plus"></i>
            </el-button>
          </el-form-item>
        </el-form-item>
        <el-form-item :label="$t('egw.ipsec.psk')" prop="psk">
          <el-input @change="_onChangePsk" class="w300" v-model="baseModel.psk"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.status')" prop="status">
          <el-switch active-value="enable" inactive-value="disable" v-model="baseModel.status"></el-switch>
        </el-form-item>
        <p @click="showPartOneConf=!showPartOneConf" class="tc more-conf">
          <el-button size="small" type="text">{{$t('egw.ipsec.ike_policy_step')}}</el-button>
        </p>
        <div class="mt20" v-show="showPartOneConf">
          <el-form-item
            :key="i"
            :label="`${$t('egw.ipsec.ike_policy')} ${i}`"
            :prop="`ike_proposal_${i}`"
            :rules="getIkeRules()"
            ref="ike_proposal"
            v-for="i in 5"
          >
            <el-select @change="_onIkeChange" class="w300" v-model="baseModel[`ike_proposal_${i}`]">
              <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in proposal1"></el-option>
              <!-- :disabled="_isDisabled('ike_proposal_', item.val)" -->
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.negotiation_mode')" prop="exchange_mode">
            <el-radio-group v-model="baseModel.exchange_mode">
              <el-radio label="main">{{$t('egw.ipsec.main')}}</el-radio>
              <el-radio label="aggressive">{{$t('egw.ipsec.aggressive')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.local_id_type')" prop="local_id_type">
            <el-radio-group v-model="baseModel.local_id_type">
              <el-radio label="IP_ADDRESS">{{$t('sysinfo.ip_addr')}}</el-radio>
              <el-radio label="NAME">NAME</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.local_id')" prop="local_id_value" v-if="baseModel.local_id_type === 'NAME'">
            <el-input
              :disabled="baseModel.local_id_type === 'IP_ADDRESS'"
              :placeholder="$t('egw.rule_name_length_tip')"
              class="w300"
              v-model="baseModel.local_id_value"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.peer_id_type')" prop="remote_id_type">
            <el-radio-group v-model="baseModel.remote_id_type">
              <el-radio label="IP_ADDRESS">{{$t('sysinfo.ip_addr')}}</el-radio>
              <el-radio label="NAME">NAME</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.peer_id')" prop="remote_id_value" v-if="baseModel.remote_id_type === 'NAME'">
            <el-input
              :disabled="baseModel.remote_id_type === 'IP_ADDRESS'"
              :placeholder="$t('egw.rule_name_length_tip')"
              class="w300"
              v-model="baseModel.remote_id_value"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.lifetime')" prop="ikelifetime">
            <el-input class="w300" placeholder="(60-604800)" v-model="baseModel.ikelifetime"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.open_dpd_check')" prop="dpd_enable">
            <el-radio-group v-model="baseModel.dpd_enable">
              <el-radio label="enable">{{$t('egw.start_using')}}</el-radio>
              <el-radio label="disable">{{$t('egw.ipsec.forbid')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.range_dpd_check')" prop="dpd_interval">
            <el-input :placeholder="$t('egw.ipsec.time_dpd_check')" class="w300" v-model="baseModel.dpd_interval"></el-input>
            <span>{{$t('time.second')}}</span>
          </el-form-item>
        </div>
        <p @click="showPartTwoConf=!showPartTwoConf" class="tc more-conf">
          <el-button size="small" type="text">{{$t('egw.ipsec.ike_policy_step2')}}</el-button>
        </p>
        <div class="mt20" v-show="showPartTwoConf">
          <!-- <el-form-item label="封装模式" prop="mode">
            <el-radio-group v-model="baseModel.mode">
              <el-radio label="tunnel">隧道模式</el-radio>
              <el-radio label="transport">传输模式</el-radio>
            </el-radio-group>
          </el-form-item>-->
          <el-form-item
            :key="i"
            :label="$t('egw.ipsec.transform',{n:i})"
            :prop="`ph2_proposal_${i}`"
            :rules="getPh2Rules()"
            ref="ph2_proposal"
            v-for="i in 2"
          >
            <el-select @change="_onPh2Change" class="w300" v-model="baseModel[`ph2_proposal_${i}`]">
              <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in proposal2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.perfect_forward_encryption')" prop="pfs">
            <el-select class="w300" v-model="baseModel.pfs">
              <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in pfs"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('egw.ipsec.lifetime')" prop="lifetime">
            <el-input class="w300" placeholder="(120-604800)" v-model="baseModel.lifetime"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button @click="_onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { Tag } from 'element-ui'
import { quoteValidator, domainValidator, rangeValidator } from '@/utils/rules'
import { isIpInNet, ipNetValidate } from '@/utils/commonValidates'
import modelFn from '@/model'
import formMixins from '@/mixins/formMixins'
export default {
  name: 'vpn-security-strategy',
  mixins: [formMixins],
  data() {
    const _sameNameValidate = (r, v, cb) => {
      if (this.editIndex === -1 && this.nameMap.includes(v))
        return cb(new Error(I18N.t('egw.ipsec.policy_name_is_has')))
      cb()
    }
    return {
      MAX_NUM: 1,
      showOhterGateway: false,
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      list: [],
      proposal1: modelFn.proposal1(),
      proposal2: modelFn.proposal2(),
      pfs: [
        { name: 'none', val: 'none' },
        { name: 'd1', val: 'd1' },
        { name: 'd2', val: 'd2' },
        { name: 'd5', val: 'd5' }
      ],
      baseModel: modelFn.vpnSecurityFn(),
      showPartOneConf: false,
      showPartTwoConf: false,
      wanNum: 1,
      commonPsk: '',
      baseRules: {
        name: [
          {
            required: true,
            message: I18N.t('egw.ipsec.policy_name_is_required')
          },
          {
            range: true,
            min: 1,
            max: 28,
            message: I18N.t('egw.rule_name_length_tip')
          },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ],
        remote_gateway: [
          { required: true, message: I18N.t('egw.gateway_is_required') },
          {
            validator: domainValidator,
            message: I18N.t('wan.invalid_ip_addr')
          }
        ],
        remote_gateway1: [
          {
            validator: domainValidator,
            message: I18N.t('wan.invalid_ip_addr')
          }
        ],
        psk: [
          { required: true, message: I18N.t('egw.ipsec.psk_is_required') },
          {
            range: true,
            min: 1,
            max: 128,
            message: I18N.t('egw.ipsec.cnt_128_char')
          }
        ],
        // ike_proposal_1: [{ required: true, message: '请输入' }],
        local_id_value: [
          { required: true, message: I18N.t('egw.ipsec.local_id_is_required') },
          {
            range: true,
            min: 1,
            max: 28,
            message: I18N.t('egw.rule_name_length_tip')
          }
        ],
        remote_id_value: [
          { required: true, message: I18N.t('egw.ipsec.peer_id_is_required') },
          {
            range: true,
            min: 1,
            max: 28,
            message: I18N.t('egw.rule_name_length_tip')
          }
        ],
        ikelifetime: [
          { required: true, message: I18N.t('egw.ipsec.lifetime_is_required') },
          {
            validator: rangeValidator,
            min: 60,
            max: 604800
          }
        ],
        dpd_interval: [
          {
            required: true,
            message: I18N.t('egw.ipsec.range_dpd_is_required')
          },
          {
            validator: rangeValidator,
            min: 1,
            max: 300
          }
        ],
        // ph2_proposal_1: [{ required: true, message: '请输入' }],
        lifetime: [
          { required: true, message: I18N.t('egw.ipsec.lifetime_is_required') },
          {
            validator: rangeValidator,
            min: 120,
            max: 604800
          }
        ]
      }
    }
  },
  computed: {
    hasByOthers() {
      return this.list.some(o => o.create_by !== 'web')
    },
    TOTAL_NUM() {
      return this.MAX_NUM + this.list.filter(o => o.create_by !== 'web').length
    },
    isClient() {
      return this.baseModel.connection_type === 'initiator'
    },
    modalTitle() {
      return this.editIndex !== -1
        ? I18N.t('action.edit')
        : I18N.t('action.add')
    },
    nameMap() {
      return this.list.map(o => o.name) || []
    },
    coverPsk() {
      return !!this.commonPsk && this.commonPsk !== this.baseModel.psk
    }
  },
  watch: {
    'baseModel.connection_type'(v) {
      if (v === 'initiator') {
        if (this.baseModel.remote_gateway === '0.0.0.0') {
          this.baseModel.remote_gateway = ''
        }
        if (this.baseModel.remote_network[0] === '0.0.0.0/0') {
          this.baseModel.remote_network = ['']
        }
      }
    }
    // 'baseModel.remote_gateway'(v) {
    //   // 增改客户端时，若存在配置过的对端网关，设置已配置过的 预共享密钥
    //   if (this.baseModel.connection_type === 'initiator') {
    //     let _ipsec = this.list.find(o => v === o.remote_gateway)
    //     this.commonPsk = this.baseModel.psk = _ipsec ? _ipsec.psk || '' : ''
    //   }
    // }
  },
  components: {
    [Tag.name]: Tag
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      const _res = await this.$api.getIpSec()
      const _net = await this.$api.getNetwork()
      this.wanNum = +_net.wanNum || 1
      this.list = _res.data || []
    },
    // 添加/编辑
    _onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index

      if (index === -1) {
        // Add
        this.baseModel = modelFn.vpnSecurityFn()
        this.showOhterGateway = false
      } else {
        this.baseModel = Object.assign(
          modelFn.vpnSecurityFn(),
          {
            ...this.list[index]
          },
          {
            remote_network: [...this.list[index].remote_network] // 拷贝数组
          }
        )
        this.showOhterGateway =
          this.baseModel.remote_gateway1 && this.baseModel.remote_gateway1 != ''
      }
      this.showPartOneConf = false
      this.showPartTwoConf = false
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert(I18N.t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(I18N.t('tip.confirm_delete'), I18N.t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .setIpSec('delete', _items)
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
            })
            this.$message({
              message: I18N.t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 切换状态
    toggleStatus(item, index) {
      item.status = item.status === 'enable' ? 'disable' : 'enable'
      this.editIndex = index
      this._onSubmit(item)
    },
    // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate((valid, errors) => {
        if (valid) {
          this._onSubmit()
        } else {
          let partOneKey = [
            'local_id_value',
            'remote_id_value',
            'ikelifetime',
            'dpd_interval'
          ]
          let partTwoKey = ['lifetime']

          Object.keys(errors).forEach(k => {
            if (partOneKey.includes(k)) {
              this.showPartOneConf = true
            } else if (partTwoKey.includes(k)) {
              this.showPartTwoConf = true
            }
          })
        }
      })
    },
    // 判断是否存在相同对端网关并且共享密钥不同
    _onChangePsk(psk) {
      if (this.coverPsk) {
        this.$confirm(
          I18N.t('egw.ipsec.psk_is_has_tip', {
            ip: this.baseModel.remote_gateway
          }),
          I18N.t('egw.ipsec.psk_is_has_tip2'),
          {
            type: 'warning'
          }
        ).then(
          _ => {},
          () => {
            this.baseModel.psk = this.commonPsk
          }
        )
      }
    },
    // 提交数据
    _onSubmit(data) {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _isnew = this.editIndex === -1

      let _data = data
      if (!_data) {
        _data = { ...this.baseModel }

        if (this.coverPsk) {
          // console.log('覆盖相同对端网关的PSK')
        }
        if (!this.isClient) {
          // 服务端
          Object.assign(_data, {
            remote_gateway: '0.0.0.0',
            remote_gateway1: '',
            remote_network: ['0.0.0.0/0']
          })
        } else {
          // 客户端
          if (!this.showOhterGateway) {
            _data.remote_gateway1 = ''
          }
        }
      }

      _data.create_by = 'web' // 标识为web添加，l2tp可能也会自动添加
      this.$api
        .setIpSec(_isnew ? 'add' : 'modify', _data, _isnew)
        .then(_ => {
          if (_isnew) {
            this.list.push(_data)
          } else {
            this.list.splice(this.editIndex, 1, _data)
          }
          this.$message.success(I18N.t('tip.edit1_success'))
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    },
    // IP范围验证数组
    ipValidate(_, index, isLocal = false) {
      // return judgeIpRangeRules(
      //   this.baseModel.remote_network,
      //   index
      // )
      let _compareArr = isLocal
        ? [...this.baseModel.local_network]
        : [...this.baseModel.remote_network]
      _compareArr.splice(index, 1)
      const subnetValidate = (r, v, cb) => {
        if (isIpInNet(v, _compareArr)) {
          return cb(new Error(I18N.t('egw.ipsec.mask_is_has')))
        }
        cb()
      }
      let rules = [
        { required: true, message: I18N.t('egw.ipsec.mask_is_required') },
        { validator: ipNetValidate },
        { validator: subnetValidate }
      ]
      if (!isLocal) {
        const remoteSubValidate = (r, v, cb) => {
          if (isIpInNet(v, [...this.baseModel.local_network])) {
            return cb(new Error(I18N.t('egw.ipsec.mask_beyond_network')))
          }
          cb()
        }
        rules.push({ validator: remoteSubValidate })
      }
      return rules
    },
    // 添加IP范围
    onAddAuthIpList(isLocal = false) {
      isLocal
        ? this.baseModel.local_network.push('')
        : this.baseModel.remote_network.push('')
    },
    // 删除IP范围
    onDelAuthIpList(index, isLocal = false) {
      isLocal
        ? this.baseModel.local_network.splice(index, 1)
        : this.baseModel.remote_network.splice(index, 1)
    },
    _isDisabled(preKey, curValue) {
      return (
        '12345'
          .split('')
          .findIndex(idx => this.baseModel[`${preKey}${idx}`] === curValue) !==
        -1
      )
    },
    getIkeRules() {
      const _proposalValidate = (r, v, cb) => {
        if (v === '---') return cb()

        const preKey = 'ike_proposal_',
          _repeatArr = '12345'.split('')
        const _same = _repeatArr.filter(
          idx => this.baseModel[`${preKey}${idx}`] === v
        )
        if (_same.length > 1)
          return cb(new Error(I18N.t('egw.ipsec.algorithm_no_repeated')))

        cb()
      }
      return [{ validator: _proposalValidate }]
    },
    getPh2Rules() {
      const _proposalValidate = (r, v, cb) => {
        if (v === '---') return cb()

        const preKey = 'ph2_proposal_',
          _repeatArr = '12345'.split('')
        const _proposal = _repeatArr
          .map(idx => this.baseModel[`${preKey}${idx}`].split('-')[0])
          .filter(v => !!v)

        if (new Set(_proposal).size > 1) {
          return cb(new Error(I18N.t('egw.ipsec.ah_esp_no_confuse')))
        }

        const _same = _repeatArr.filter(
          idx => this.baseModel[`${preKey}${idx}`] === v
        )
        if (_same.length > 1)
          return cb(new Error(I18N.t('egw.ipsec.algorithm_no_repeated')))

        cb()
      }
      return [{ validator: _proposalValidate }]
    },
    _onIkeChange() {
      this.$refs.ike_proposal.forEach($rf => $rf.validate())
    },
    _onPh2Change() {
      this.$refs.ph2_proposal.forEach($rf => $rf.validate())
    }
  }
}
</script>
<style lang="scss" scoped>
.vpn-security-strategy {
  .more-conf {
    position: relative;
    &:before {
      content: '';
      display: block;
      border: 1px #ccc dashed;
      position: absolute;
      width: 100%;
      top: 50%;
      z-index: 0;
    }
    .el-button--text {
      z-index: 1;
      background: #fff;
      position: relative;
      padding: 7px 8px;
    }
  }
}
</style>
