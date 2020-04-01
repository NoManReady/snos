<template>
  <div class="acl-ace">
    <p class="c-danger mb5" v-show="isBinding">
      <i class="el-icon-warning"></i>
      <span>{{$t('msw.acl.ace_binded_tip')}}</span>
    </p>
    <div class="ace-edit-box">
      <el-form :disabled="isBinding" :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
        <el-form-item :label="$t('msw.acl.acl_name_f')">
          <span>{{acl.name}}</span>
        </el-form-item>
        <el-form-item :label="$t('msw.acl.access_ctrl_f')" prop="action">
          <el-radio-group v-model="baseModel.action">
            <el-radio :label="1">{{$t('msw.acl.forbid')}}</el-radio>
            <el-radio :label="0">{{$t('msw.acl.allow')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="生效时间：" prop="tmngtName">
          <el-select class="w160" id="acl-list" placeholder="请选择" v-model="baseModel.tmngtName">
            <el-option :key="time.tmngtName" :label="time.name" :value="time.tmngtName" v-for="time in times"></el-option>
          </el-select>
        </el-form-item>-->
        <!-- IP -->
        <template v-if="acl.type===2">
          <el-form-item :label="$t('msw.acl.ip_protocol')" prop="protol">
            <el-checkbox v-model="protolType">{{$t('msw.acl.all')}}</el-checkbox>
            <div v-if="!protolType">
              <!-- <el-input :disabled="protolType" class="w180" placeholder="0-255" v-model.number="baseModel.protol"></el-input> -->
              <el-autocomplete :fetch-suggestions="_querySearch" placeholder="0-255" v-model="baseModel.protol">
                <template slot-scope="{ item }">
                  <span class="value">{{ item.value }}</span>
                  <span class="label" v-show="item.label">({{ item.label }})</span>
                </template>
              </el-autocomplete>
              <label class="c-info">(0-255)</label>
              <el-tooltip effect="light" placement="right">
                <div class="content" slot="content">
                  <p :key="item.v" v-for="item of protolList">
                    <label>{{item.k}}</label>：
                    <span>{{item.v}}</span>
                  </p>
                </div>
                <i class="el-icon-info form-tip"></i>
              </el-tooltip>
            </div>
          </el-form-item>
          <!-- 源IP -->
          <el-form-item :label="$t('msw.acl.source_ip_f')">
            <el-checkbox v-model="sipType">{{$t('msw.acl.all')}}</el-checkbox>
            <div v-if="!sipType">
              <el-form-item class="vm" label-width="0px" prop="sip" style="margin-bottom:0;">
                <el-input :disabled="sipType" class="w180" placeholder="192.168.1.1" v-model="baseModel.sip"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="smask" style="margin-bottom:0;">
                <net-mask :disabled="sipType" class="w180" v-model="baseModel.smask" />
              </el-form-item>
              <span class="c-info vm">{{$t('msw.acl.addr_mask')}}</span>
            </div>
          </el-form-item>
          <!-- 目的IP -->
          <el-form-item :label="$t('msw.acl.dest_ip_f')">
            <el-checkbox v-model="dipType">{{$t('msw.acl.all')}}</el-checkbox>
            <div v-if="!dipType">
              <el-form-item class="vm" label-width="0px" prop="dip" style="margin-bottom:0;">
                <el-input :disabled="dipType" class="w180" placeholder="192.168.1.1" v-model="baseModel.dip"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="dmask" style="margin-bottom:0;">
                <net-mask :disabled="dipType" class="w180" v-model="baseModel.dmask" />
              </el-form-item>
              <span class="c-info vm">{{$t('msw.acl.addr_mask')}}</span>
            </div>
          </el-form-item>
          <!-- 只有tcp和udp才有端口 -->
          <template v-if="baseModel.protol==6||baseModel.protol==17">
            <!-- 源端口 -->
            <el-form-item :label="$t('msw.acl.source_port_f')">
              <el-checkbox v-model="sportType">{{$t('msw.acl.all')}}</el-checkbox>
              <div v-if="!sportType">
                <el-form-item class="vm" label-width="0px" prop="sports" style="margin-bottom:0;">
                  <el-input :disabled="sportType" class="w180" placeholder="0-65535" v-model.number="baseModel.sports"></el-input>
                </el-form-item>
                <span class="vm">-</span>
                <el-form-item class="vm" label-width="0px" prop="sporte" style="margin-bottom:0;">
                  <el-input :disabled="sportType" class="w180" placeholder="0-65535" v-model.number="baseModel.sporte"></el-input>
                </el-form-item>
                <span class="c-info vm">{{$t('msw.acl.begin_end')}}</span>
              </div>
            </el-form-item>
            <!-- 目的端口 -->
            <el-form-item :label="$t('msw.acl.dest_port_f')">
              <el-checkbox v-model="dportType">{{$t('msw.acl.all')}}</el-checkbox>
              <div v-if="!dportType">
                <el-form-item class="vm" label-width="0px" prop="dports" style="margin-bottom:0;">
                  <el-input :disabled="dportType" class="w180" placeholder="0-65535" v-model.number="baseModel.dports"></el-input>
                </el-form-item>
                <span class="vm">-</span>
                <el-form-item class="vm" label-width="0px" prop="dporte" style="margin-bottom:0;">
                  <el-input :disabled="dportType" class="w180" placeholder="0-65535" v-model.number="baseModel.dporte"></el-input>
                </el-form-item>
                <span class="c-info vm">{{$t('msw.acl.begin_end')}}</span>
              </div>
            </el-form-item>
          </template>
        </template>
        <!-- MAC -->
        <template v-else>
          <el-form-item :label="$t('msw.acl.pack_type_f')">
            <el-checkbox v-model="ethType">{{$t('msw.acl.all')}}</el-checkbox>
            <el-form-item prop="eth" v-if="!ethType">
              <el-input class="w180" v-model="baseModel.eth">
                <template slot="prepend">0x</template>
              </el-input>
              <span class="c-info">(0x600 ~ 0xFFFF)</span>
            </el-form-item>
          </el-form-item>
          <!-- 源MAC -->
          <el-form-item :label="$t('msw.acl.source_mac_f')">
            <el-checkbox v-model="smacType">{{$t('msw.acl.all')}}</el-checkbox>
            <div v-if="!smacType">
              <el-form-item class="vm" label-width="0px" prop="smac" style="margin-bottom:0;">
                <el-input :disabled="smacType" class="w180" placeholder="00:11:22:33:44:55" v-model="baseModel.smac"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="smask" style="margin-bottom:0;">
                <net-mask :disabled="smacType" class="w180" type="mac" v-model="baseModel.smask" />
              </el-form-item>
              <span class="c-info vm">{{$t('msw.acl.addr_mask')}}</span>
            </div>
          </el-form-item>
          <!-- 目的MAC -->
          <el-form-item :label="$t('msw.acl.dest_mac_f')">
            <el-checkbox v-model="dmacType">{{$t('msw.acl.all')}}</el-checkbox>
            <div v-if="!dmacType">
              <el-form-item class="vm" label-width="0px" prop="dmac" style="margin-bottom:0;">
                <el-input :disabled="dmacType" class="w180" placeholder="00:11:22:33:44:55" v-model="baseModel.dmac"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="dmask" style="margin-bottom:0;">
                <net-mask :disabled="dmacType" class="w180" type="mac" v-model="baseModel.dmask" />
              </el-form-item>
              <span class="c-info vm">{{$t('msw.acl.addr_mask')}}</span>
            </div>
          </el-form-item>
        </template>
        <el-form-item v-show="!isBinding">
          <el-button
            :disabled="aceLoading"
            :loading="isLoading&&!aceLoading"
            class="w120"
            type="primary"
            v-auth="_onConfirmRule"
          >{{this.editIndex===-1?$t('msw.acl.add_rule'):$t('msw.acl.edit_rule')}}</el-button>
          <el-button
            :disabled="isLoading"
            @click.native="_onReset"
            class="w120"
          >{{this.editIndex===-1?$t('msw.acl.reset'):$t('msw.acl.cancel_edit')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <h4 class="header-tit">
      <strong>{{$t('msw.acl.exist_rule')}}</strong>
      <small class="c-info">{{$t('msw.acl.drag_tip')}}</small>
      <!-- <span>
        最大支持配置
        <b class="c-warning mlr5">{{maxLimit}}</b>条。
      </span>-->
    </h4>
    <el-table
      :data="aceList"
      :empty-text="$t('msw.acl.no_rule')"
      :row-class-name="_aceRowClass"
      @row-click="_onRowClick"
      class="drag-table"
      max-height="300px"
      ref="aceTable"
      row-key="uuid"
      size="medium"
      v-loading="aceLoading"
    >
      <!-- <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column> -->
      <el-table-column :label="$t('phrase.serial')" align="center" width="60">
        <template slot-scope="{row,$index}">
          <span class="drag-icon">{{$index+1}}</span>
        </template>
      </el-table-column>
      <!-- MAC -->
      <template v-if="acl.type===1">
        <el-table-column :label="$t('msw.acl.matched_rule')">
          <template slot-scope="{row}">
            <p class="ace-tit">
              <b>【{{$t('msw.acl.source_mac')}}】</b>
              <span>{{row.smac!=='any'?`${row.smac}/${row.smask}`:$t('msw.acl.all')}}</span>
            </p>
            <p class="ace-tit">
              <b>【{{$t('msw.acl.dest_mac')}}】</b>
              <span>{{row.dmac!=='any'?`${row.dmac}/${row.dmask}`:$t('msw.acl.all')}}</span>
            </p>
            <p class="ace-tit">
              <b>【{{$t('msw.acl.pack_type')}}】</b>
              <span>{{row.eth!=='any'?`${row.eth}`:$t('msw.acl.all')}}</span>
            </p>
          </template>
        </el-table-column>
      </template>
      <!-- IP -->
      <template v-if="acl.type===2">
        <el-table-column :label="$t('msw.acl.matched_rule')">
          <template slot-scope="{row}">
            <p class="ace-tit">
              <b>【{{$t('msw.acl.source_ip')}}】</b>
              <span>{{row.sip!=='any'?`${row.sip}/${row.smask}`:$t('msw.acl.all')}}</span>
            </p>
            <p class="ace-tit" v-if="row.protol==6||row.protol==17">
              <b>【{{$t('msw.acl.source_port_range')}}】</b>
              <span>{{row.sports!=='any'?`${row.sports}-${row.sporte}`:$t('msw.acl.all')}}</span>
            </p>
            <p class="ace-tit">
              <b>【{{$t('msw.acl.dest_ip')}}】</b>
              <span>{{row.dip!=='any'?`${row.dip}/${row.dmask}`:$t('msw.acl.all')}}</span>
            </p>
            <p class="ace-tit" v-if="row.protol==6||row.protol==17">
              <b>【{{$t('msw.acl.dest_port_range')}}】</b>
              <span>{{row.dports!=='any'?`${row.dports}-${row.dporte}`:$t('msw.acl.all')}}</span>
            </p>
            <p class="ace-tit">
              <b>【{{$t('msw.acl.ip_protocol')}}】</b>
              <span>{{row.protol!=='any'?`${_getProtolName(row.protol)}`:$t('msw.acl.all')}}</span>
            </p>
          </template>
        </el-table-column>
      </template>
      <el-table-column :label="$t('msw.acl.rule_type')" align="center" width="100px">
        <template slot-scope="{row}">
          <span>{{row.action===1?$t('msw.acl.block'):$t('msw.acl.allow')}}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="生效时间" width="100px">
        <template slot-scope="{row}">
          <acl-date-view :time="_getTimeByName(row.tmngtName)" />
        </template>
      </el-table-column>-->
      <el-table-column :label="$t('action.ope')" align="center" width="160px">
        <template slot-scope="{row,$index}">
          <el-button
            size="medium"
            type="text"
            v-auth="{fn:_onEditRule,params:$index}"
            v-if="editIndex!==$index"
          >{{$t('action.edit')}}</el-button>
          <el-button @click.native="_onReset" size="medium" type="text" v-else>{{$t('msw.acl.cancel_edit')}}</el-button>
          <el-button
            :disabled="aceList.length<=1||editIndex>-1"
            size="medium"
            type="text"
            v-auth="{fn:_onMoveRule,params:$index}"
          >{{$t('msw.acl.move')}}</el-button>
          <el-button
            :class="{'c-danger':editIndex===-1}"
            :disabled="editIndex>-1"
            size="medium"
            type="text"
            v-auth="{fn:_onDelRule,params:row.uuid}"
          >{{$t('action.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 上下移动 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="$t('msw.acl.move_tip')"
      :visible.sync="moveModalShow"
      @open="_clearValidate('moveForm')"
      append-to-body
      width="500px"
    >
      <el-form :model="moveModel" :rules="moveRules" class="inline-tip" inline inline-message ref="moveForm" size="medium">
        <i18n path="msw.acl.move_desc" tag="div">
          <b class="c-success" place="begin">{{moveIndex+1}}</b>
          <el-form-item class="vm" inline-message place="end" prop="index" style="margin:0;vertical-align:middle;">
            <el-input :placeholder="$t('msw.acl.index')" class="w80" v-model="moveModel.index"></el-input>
          </el-form-item>
        </i18n>
      </el-form>
      <p class="c-info">{{$t('msw.acl.move_rule_tip')}}</p>
      <span class="dialog-footer" slot="footer">
        <el-button @click.native="moveModalShow = false" class="w120">{{$t('action.cancel')}}</el-button>
        <el-button :loading="isLoading" @click.native="_onMoveModalConfirm" class="w120" type="primary">{{$t('msw.acl.move')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
import { isBetween, intValidate, isIp, macValidate } from '@/utils/rulesUtils'
import {
  rangeHexValidator,
  rangeValidator,
  macValidator,
  ipValidator,
  intValidator
} from '@/utils/rules'
import { objIsSame } from '@/utils/utils'
import { ace } from '@/model/msw/advanced'
import { Checkbox } from 'element-ui'
import NetMask from '@/common/NetMask'
import DateView from './DateView'
import Sortable from 'sortablejs'

const SP = Object.freeze([
  { v: '1', k: 'ICMP' },
  { v: '6', k: 'TCP' },
  { v: '17', k: 'UDP' }
])
export default {
  name: 'acl-ace',
  components: {
    [Checkbox.name]: Checkbox,
    [DateView.name]: DateView,
    NetMask
  },
  mixins: [formMixins],
  props: {
    acl: Object,
    times: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 端口号验证
    const portValidator = (r, v, cb) => {
      if (this.baseModel[`${r.type}ports`] > this.baseModel[`${r.type}porte`]) {
        return cb(new Error(I18N.t('msw.acl.bp_not_lg_ep')))
      }
      cb()
    }
    // 移动优先级验证
    const moveValidator = (r, v, cb) => {
      if (!v) {
        return cb()
      }
      if (!intValidate(v)) {
        return cb(new Error(I18N.t('rules.require_int')))
      }
      if (v == this.moveIndex + 1) {
        return cb(new Error(I18N.t('msw.acl.is_same_rule')))
      }
      let _aceLen = this.aceList.length
      if (!isBetween(v, 1, _aceLen)) {
        return cb(new Error(I18N.t('msw.acl.rule_range', { end: _aceLen })))
      }
      cb()
    }
    // 协议号验证规则
    const protolValidator = (r, v, cb) => {
      if (v === 'any') {
        cb()
        return
      }
      if (!intValidate(v)) {
        cb(new Error(I18N.t('rules.require_int')))
        return
      }
      if (!isBetween(v, 0, 255)) {
        cb(new Error(I18N.t('msw.acl.protocol_range')))
        return
      }
      cb()
    }
    // 掩码验证规则
    const maskValidator = (r, v, cb) => {
      if (v === 'any') {
        return cb()
      }
      if (!v) {
        return cb(new Error(I18N.t('msw.acl.mask_no_empty')))
      }
      if (this.acl.type === 1) {
        if (!macValidate(v)) {
          return cb(new Error(I18N.t('msw.acl.mac_mask_format')))
        }
      } else {
        if (!isIp(v)) {
          return cb(new Error(I18N.t('msw.acl.ip_mask_format')))
        }
      }
      cb()
    }
    return {
      settingKeys: [],
      aceLoading: false,
      isLoading: false,
      aceList: [],
      baseModel: ace(this.acl.type),
      editIndex: -1,
      moveIndex: -1,
      baseRules: {
        // tmngtName: [{ required: true, message: '请选择生效时间' }],
        smask: [{ validator: maskValidator }],
        dmask: [{ validator: maskValidator }],
        sip: [
          { required: true, message: I18N.t('msw.acl.sourceip_no_empty') },
          { validator: ipValidator }
        ],
        dip: [
          { required: true, message: I18N.t('msw.acl.destip_no_empty') },
          { validator: ipValidator }
        ],
        smac: [
          { required: true, message: I18N.t('msw.acl.sourcemac_no_empty') },
          { validator: macValidator }
        ],
        dmac: [
          { required: true, message: I18N.t('msw.acl.destmac_no_empty') },
          { validator: macValidator }
        ],
        protol: [{ validator: protolValidator }],
        sports: [
          { required: true, message: I18N.t('msw.acl.sp_begin_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 's' }
        ],
        sporte: [
          { required: true, message: I18N.t('msw.acl.sp_end_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 's' }
        ],
        dports: [
          { required: true, message: I18N.t('msw.acl.dp_begin_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 'd' }
        ],
        dporte: [
          { required: true, message: I18N.t('msw.acl.dp_end_no_empty') },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 'd' }
        ],
        eth: [
          { required: true, message: I18N.t('msw.acl.eth_no_empty') },
          { validator: rangeHexValidator, min: '600', max: 'ffff' }
        ]
      },
      ruleModalShow: false,
      editIndex: -1,
      moveModalShow: false,
      moveModel: {
        index: ''
      },
      moveRules: {
        index: [
          { required: true, message: I18N.t('msw.acl.should_be_number') },
          { validator: moveValidator }
        ]
      },
      protolList: SP,
      maxLimit: window.APP_CAPACITY_SW.acl.ace_num,
      dataSources: Object.freeze(
        Array.from({ length: 256 })
          .map((_, i) => {
            let _v = i.toString()
            let _sp = SP.find(lis => lis.v === _v)
            return { value: _v, label: _sp ? _sp.k : null }
          })
          .sort((a, b) => (a.label ? -1 : 1))
      )
    }
  },
  computed: {
    isBinding() {
      return false //this.acl.bindcnt > 0
    },
    protolType: {
      get() {
        return this.baseModel.protol === 'any'
      },
      set(v) {
        if (v) {
          this.baseModel.protol = 'any'
        } else {
          this.baseModel.protol = '1'
        }
      }
    },
    sipType: {
      get() {
        return this.baseModel.sip === 'any'
      },
      set(v) {
        if (v) {
          this.baseModel.sip = 'any'
          this.baseModel.smask = 'any'
        } else {
          this.baseModel.sip = ''
          this.baseModel.smask = ''
        }
      }
    },
    dipType: {
      get() {
        return this.baseModel.dip === 'any'
      },
      set(v) {
        if (v) {
          this.baseModel.dip = 'any'
          this.baseModel.dmask = 'any'
        } else {
          this.baseModel.dip = ''
          this.baseModel.dmask = ''
        }
      }
    },
    sportType: {
      get() {
        return (
          this.baseModel.sports === 'any' && this.baseModel.sporte === 'any'
        )
      },
      set(v) {
        if (v) {
          this.baseModel.sports = 'any'
          this.baseModel.sporte = 'any'
        } else {
          this.baseModel.sports = 0
          this.baseModel.sporte = 65535
        }
      }
    },
    dportType: {
      get() {
        return (
          this.baseModel.dports === 'any' && this.baseModel.dporte === 'any'
        )
      },
      set(v) {
        if (v) {
          this.baseModel.dports = 'any'
          this.baseModel.dporte = 'any'
        } else {
          this.baseModel.dports = 0
          this.baseModel.dporte = 65535
        }
      }
    },
    ethType: {
      get() {
        return this.baseModel.eth === 'any'
      },
      set(v) {
        if (v) {
          this.baseModel.eth = 'any'
        } else {
          this.baseModel.eth = '600'
        }
      }
    },
    smacType: {
      get() {
        return this.baseModel.smac === 'any'
      },
      set(v) {
        if (v) {
          this.baseModel.smac = 'any'
          this.baseModel.smask = 'any'
        } else {
          this.baseModel.smac = ''
          this.baseModel.smask = ''
        }
      }
    },
    dmacType: {
      get() {
        return this.baseModel.dmac === 'any'
      },
      set(v) {
        if (v) {
          this.baseModel.dmac = 'any'
          this.baseModel.dmask = 'any'
        } else {
          this.baseModel.dmac = ''
          this.baseModel.dmask = ''
        }
      }
    }
  },
  watch: {
    acl: {
      handler(v) {
        let _model = ace(v.type)
        this.settingKeys = Object.freeze(Object.keys(_model))
        this.baseModel = _model
        this._loadAceList()
        this._setInitTime()
      },
      immediate: true
    }
  },
  mounted() {
    this._setRowDragable()
  },
  methods: {
    async _loadAceList() {
      this.aceLoading = true
      try {
        let _result = await this.$api.cmd(
          'devSta.get',
          {
            module: 'ace',
            data: { acl_uuid: this.acl.uuid }
          },
          { isSilence: true }
        )
        this.aceList = _result.aces.map(ace => {
          if (ace.protol) {
            ace.protol = ace.protol.toString()
          }
          return ace
        })
      } catch (error) {}
      this.aceLoading = false
    },
    //行拖拽
    _setRowDragable() {
      let tbody = document.querySelector(
        '.drag-table .el-table__body-wrapper tbody'
      )
      let sortable = Sortable.create(tbody, {
        handle: '.drag-icon',
        onStart: e => {
          if (this.editIndex > -1) {
            this.editIndex = -1
            this._onReset()
          }
        },
        onEnd: async ({ newIndex, oldIndex }) => {
          if (newIndex === oldIndex) {
            return
          }
          let _oldItem = this.aceList[oldIndex]
          let _newItem = this.aceList[newIndex]
          let _model = {
            opt: 2,
            acl_uuid: this.acl.uuid,
            uuid: [_oldItem.uuid, _newItem.uuid]
          }
          await this._onMovePostData(_model)
          await this._loadAceList()
          this.$message.success(I18N.t('tip.ope_success'))
          // this.aceList.splice(
          //   newIndex,
          //   1,
          //   ...this.aceList.splice(oldIndex, 1, _newItem)
          // )
        }
      })
    },
    // 配置初始化时间（默认所有时段）
    _setInitTime() {
      if (this.times.length) {
        this.baseModel.tmngtName = this.times[0].tmngtName
      } else {
        this.baseModel.tmngtName = I18N.t('phrase.alltime')
      }
    },
    // 获取ip协议号名称
    _getProtolName(protol) {
      let _protol = this.protolList.find(p => p.v === protol)
      return _protol ? `${_protol.k}(${_protol.v})` : protol
    },
    // 是否可勾选
    _isSelectable() {
      return !this.isBinding
    },
    // 根据时间名称获取时间对象
    _getTimeByName(name) {
      return this.times.find(t => t.tmngtName === name)
    },
    // ace选中样式
    _aceRowClass({ row, rowIndex }) {
      if (rowIndex === this.editIndex) {
        return 'current-row'
      }
      return ''
    },
    // protocol
    _querySearch(queryString, cb) {
      let results = queryString
        ? this.dataSources.filter(
            data => JSON.stringify(data).indexOf(queryString) > -1
          )
        : this.dataSources
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    // 点击行
    _onRowClick(row) {
      // let _index = this.aceList.findIndex(ace => ace.uuid === row.uuid)
      // this.editIndex = _index
      // this.baseModel = this.aceList[this.editIndex]
    },
    // 删除规则
    async _onDelRule(uuid) {
      let _uuids = uuid
        ? [uuid]
        : this.$refs.aceTable.selection.map(s => s.uuid)
      if (!_uuids.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        await this.$api.cmd('devSta.del', {
          module: 'ace',
          data: { uuid: _uuids, acl_uuid: this.acl.uuid }
        })
        this.aceList = this.aceList.filter(ace => !_uuids.includes(ace.uuid))
        // this._loadAceList()
        this.$message.success(I18N.t('tip.del_success'))
      } catch (error) {}
    },
    // 重置规则
    _onReset() {
      this.editIndex = -1
      this.baseModel = ace(this.acl.type)
      this._setInitTime()
      this.$nextTick(() => {
        this.$refs.baseForm.resetFields()
      })
    },
    // 重置移动规则
    _onMoveReset() {
      this.moveIndex = -1
      this.moveModel = { index: '' }
      this.$nextTick(() => {
        this.$refs.moveForm.resetFields()
      })
    },
    // 编辑规则
    _onEditRule(index) {
      this.editIndex = index
      let _item = this.aceList[this.editIndex]
      this.baseModel = { ..._item }
    },
    // 判断规则是否重复
    _judgeRuleIsExist() {
      let _isExist = this.aceList.find((ace, index) => {
        if (this.editIndex === index) {
          return false
        }
        for (let key of this.settingKeys) {
          if (
            !['tmngtName', 'acl_uuid', 'acl_type', 'uuid'].includes(key) &&
            this.baseModel[key] !== ace[key]
          ) {
            return false
          }
        }
        return true
      })
      return !!_isExist
    },
    // 提交rule
    _onConfirmRule() {
      // if (this.aceList.length === this.maxLimit) {
      //   this.$alert('规则已配置最大容量', { type: 'warning' })
      //   return
      // }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          if (this._judgeRuleIsExist()) {
            this.$alert(I18N.t('msw.acl.rule_is_exist'), { type: 'error' })
            return
          }
          let _isEdit = this.editIndex !== -1
          let _model = { ...this.baseModel }
          _model.acl_uuid = this.acl.uuid
          _model.acl_type = this.acl.type
          if (_model.protol && _model.protol !== 'any') {
            _model.protol = +_model.protol
          }
          if (_isEdit) {
            let _oldItem = this.aceList[this.editIndex]
            if (objIsSame(_oldItem, { ...this.baseModel })) {
              this.$message(I18N.t('msw.acl.rule_no_modify'))
              this._onReset()
              return
            }
          }
          this.isLoading = true
          try {
            if (!_isEdit) {
              await this.$api.cmd(
                'devSta.add',
                {
                  module: 'ace',
                  data: _model
                },
                { isSilence: true }
              )
              // 添加要获取uuid
              this._loadAceList()
            } else {
              await this.$api.cmd(
                'devSta.update',
                {
                  module: 'ace',
                  data: { ..._model, opt: 1 }
                },
                { isSilence: true }
              )
              this.aceList.splice(this.editIndex, 1, _model)
            }
            this.$message.success(
              `${
                _isEdit ? I18N.t('tip.edit_success') : I18N.t('tip.add_success')
              }`
            )
            this._onReset()
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // 移动
    _onMoveRule(index) {
      this.moveIndex = index
      this.moveModalShow = true
    },
    // 移动提交数据
    async _onMovePostData(data) {
      this.aceLoading = true
      try {
        await this.$api.cmd(
          'devSta.update',
          {
            module: 'ace',
            data
          },
          { isSilence: true }
        )
      } catch (error) {}
      this.aceLoading = false
    },
    // 移动modal提交
    _onMoveModalConfirm() {
      this.$refs.moveForm.validate(async valid => {
        if (valid) {
          let _curAce = this.aceList[this.moveIndex]
          let _replaceAce = this.aceList[this.moveModel.index - 1]
          let _model = {
            opt: 2,
            acl_uuid: this.acl.uuid,
            uuid: [_curAce.uuid, _replaceAce.uuid]
          }
          await this._onMovePostData(_model)
          await this._loadAceList()
          // this.aceList.splice(
          //   this.moveModel.index - 1,
          //   1,
          //   ...this.aceList.splice(this.moveIndex, 1, _replaceAce)
          // )
          this.moveModalShow = false
          this.$message.success(I18N.t('action.ope_success'))
          this._onMoveReset()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
@import '~@/style/utils/mixins';
.acl-ace {
  .drag-icon {
    cursor: move;
    font-size: 14px;
  }
  .header-tit {
    padding: 5px 20px;
  }
  padding: 0 8px;
  .ace-edit-box {
    background-color: #f4f4f4;
    padding: 5px;
    border-radius: 3px;
    max-height: 350px;
    overflow-y: auto;
  }
  .ace-tit {
    b {
      min-width: 90px;
      display: inline-block;
      text-align: right;
      font-size: 13px;
    }
  }
}
</style>
