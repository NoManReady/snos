<template>
  <div class="acl-ace">
    <p class="c-danger mb5" v-show="isBinding">
      <i class="el-icon-warning"></i>
      <span>当前ACL已被应用，不可进行修改，点击指定规则可查看规则详细信息。</span>
    </p>
    <div class="ace-edit-box">
      <el-form :disabled="isBinding" :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="small">
        <el-form-item label="ACL名称：">
          <span>{{acl.name}}</span>
        </el-form-item>
        <el-form-item label="访问控制：" prop="action">
          <el-radio-group v-model="baseModel.action">
            <el-radio :label="1">禁止</el-radio>
            <el-radio :label="0">允许</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="生效时间：" prop="tmngtName">
          <el-select class="w160" id="acl-list" placeholder="请选择" v-model="baseModel.tmngtName">
            <el-option :key="time.tmngtName" :label="time.name" :value="time.tmngtName" v-for="time in times"></el-option>
          </el-select>
        </el-form-item>-->
        <!-- IP -->
        <template v-if="acl.type===2">
          <el-form-item label="IP协议号：" prop="protol">
            <el-checkbox v-model="protolType">所有</el-checkbox>
            <div v-if="!protolType">
              <!-- <el-input :disabled="protolType" class="w180" placeholder="0-255" v-model.number="baseModel.protol"></el-input> -->
              <el-autocomplete :fetch-suggestions="_querySearch" placeholder="0-255" v-model="baseModel.protol">
                <template slot-scope="{ item }">
                  <span class="value">{{ item.value }}</span>
                  <span class="label" v-show="item.label">({{ item.label }})</span>
                </template>
              </el-autocomplete>
              <label class="c-info">(0-255)</label>
            </div>
          </el-form-item>
          <!-- 源IP -->
          <el-form-item label="源IP地址：">
            <el-checkbox v-model="sipType">所有</el-checkbox>
            <div v-if="!sipType">
              <el-form-item class="vm" label-width="0px" prop="sip" style="margin-bottom:0;">
                <el-input :disabled="sipType" class="w180" placeholder="192.168.1.1" v-model="baseModel.sip"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="smask" style="margin-bottom:0;">
                <net-mask :disabled="sipType" class="w180" v-model="baseModel.smask" />
              </el-form-item>
              <span class="c-info vm">(地址/掩码)</span>
            </div>
          </el-form-item>
          <!-- 目的IP -->
          <el-form-item label="目的IP地址：">
            <el-checkbox v-model="dipType">所有</el-checkbox>
            <div v-if="!dipType">
              <el-form-item class="vm" label-width="0px" prop="dip" style="margin-bottom:0;">
                <el-input :disabled="dipType" class="w180" placeholder="192.168.1.1" v-model="baseModel.dip"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="dmask" style="margin-bottom:0;">
                <net-mask :disabled="dipType" class="w180" v-model="baseModel.dmask" />
              </el-form-item>
              <span class="c-info vm">(地址/掩码)</span>
            </div>
          </el-form-item>
          <!-- 只有tcp和udp才有端口 -->
          <template v-if="baseModel.protol==6||baseModel.protol==17">
            <!-- 源端口 -->
            <el-form-item label="源端口：">
              <el-checkbox v-model="sportType">所有</el-checkbox>
              <div v-if="!sportType">
                <el-form-item class="vm" label-width="0px" prop="sports" style="margin-bottom:0;">
                  <el-input :disabled="sportType" class="w180" placeholder="0-65535" v-model.number="baseModel.sports"></el-input>
                </el-form-item>
                <span class="vm">-</span>
                <el-form-item class="vm" label-width="0px" prop="sporte" style="margin-bottom:0;">
                  <el-input :disabled="sportType" class="w180" placeholder="0-65535" v-model.number="baseModel.sporte"></el-input>
                </el-form-item>
                <span class="c-info vm">(起始-结束)</span>
              </div>
            </el-form-item>
            <!-- 目的端口 -->
            <el-form-item label="目的端口：">
              <el-checkbox v-model="dportType">所有</el-checkbox>
              <div v-if="!dportType">
                <el-form-item class="vm" label-width="0px" prop="dports" style="margin-bottom:0;">
                  <el-input :disabled="dportType" class="w180" placeholder="0-65535" v-model.number="baseModel.dports"></el-input>
                </el-form-item>
                <span class="vm">-</span>
                <el-form-item class="vm" label-width="0px" prop="dporte" style="margin-bottom:0;">
                  <el-input :disabled="dportType" class="w180" placeholder="0-65535" v-model.number="baseModel.dporte"></el-input>
                </el-form-item>
                <span class="c-info vm">(起始-结束)</span>
              </div>
            </el-form-item>
          </template>
        </template>
        <!-- MAC -->
        <template v-else>
          <el-form-item label="报文类型号：">
            <el-checkbox v-model="ethType">所有</el-checkbox>
            <el-form-item prop="eth" v-if="!ethType">
              <el-input class="w180" v-model="baseModel.eth">
                <template slot="prepend">0x</template>
              </el-input>
              <span class="c-info">(0x600 ~ 0xFFFF)</span>
            </el-form-item>
          </el-form-item>
          <!-- 源MAC -->
          <el-form-item label="源MAC地址：">
            <el-checkbox v-model="smacType">所有</el-checkbox>
            <div v-if="!smacType">
              <el-form-item class="vm" label-width="0px" prop="smac" style="margin-bottom:0;">
                <el-input :disabled="smacType" class="w180" placeholder="00:11:22:33:44:55" v-model="baseModel.smac"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="smask" style="margin-bottom:0;">
                <net-mask :disabled="smacType" class="w180" type="mac" v-model="baseModel.smask" />
              </el-form-item>
              <span class="c-info vm">(地址/掩码)</span>
            </div>
          </el-form-item>
          <!-- 目的MAC -->
          <el-form-item label="目的MAC地址：">
            <el-checkbox v-model="dmacType">所有</el-checkbox>
            <div v-if="!dmacType">
              <el-form-item class="vm" label-width="0px" prop="dmac" style="margin-bottom:0;">
                <el-input :disabled="dmacType" class="w180" placeholder="00:11:22:33:44:55" v-model="baseModel.dmac"></el-input>
              </el-form-item>
              <span class="vm">/</span>
              <el-form-item class="vm" label-width="0px" prop="dmask" style="margin-bottom:0;">
                <net-mask :disabled="dmacType" class="w180" type="mac" v-model="baseModel.dmask" />
              </el-form-item>
              <span class="c-info vm">(地址/掩码)</span>
            </div>
          </el-form-item>
        </template>
        <el-form-item v-show="!isBinding">
          <el-button
            :disabled="aceLoading"
            :loading="isLoading&&!aceLoading"
            size="small"
            type="primary"
            v-auth="_onConfirmRule"
          >{{this.editIndex===-1?'添加规则':'修改规则'}}</el-button>
          <el-button :disabled="isLoading" @click.native="_onReset" size="small">{{this.editIndex===-1?'重置':'取消修改'}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <h4 class="ace-tit">
      <strong>已有规则：</strong>
      <small class="c-info">(拖动序号可交换规则顺序)</small>
      <!-- <span>
        最大支持配置
        <b class="c-warning mlr5">{{maxLimit}}</b>条。
      </span>-->
    </h4>
    <el-table
      :data="aceList"
      :row-class-name="_aceRowClass"
      @row-click="_onRowClick"
      class="drag-table"
      empty-text="暂无规则"
      max-height="300px"
      ref="aceTable"
      row-key="uuid"
      size="mini"
      v-loading="aceLoading"
    >
      <!-- <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column> -->
      <el-table-column align="center" label="序号" width="60">
        <template slot-scope="{row,$index}">
          <span class="drag-icon">{{$index+1}}</span>
        </template>
      </el-table-column>
      <!-- MAC -->
      <template v-if="acl.type===1">
        <el-table-column label="匹配规则">
          <template slot-scope="{row}">
            <p>
              <b>【源MAC】</b>
              <span>{{row.smac!=='any'?`${row.smac}/${row.smask}`:'所有'}}</span>
            </p>
            <p>
              <b>【目的MAC】</b>
              <span>{{row.dmac!=='any'?`${row.dmac}/${row.dmask}`:'所有'}}</span>
            </p>
            <p>
              <b>【报文类型号】</b>
              <span>{{row.eth!=='any'?`${row.eth}`:'所有'}}</span>
            </p>
          </template>
        </el-table-column>
      </template>
      <!-- IP -->
      <template v-if="acl.type===2">
        <el-table-column label="匹配规则">
          <template slot-scope="{row}">
            <p>
              <b>【源IP】</b>
              <span>{{row.sip!=='any'?`${row.sip}/${row.smask}`:'所有'}}</span>
            </p>
            <p v-if="row.protol==6||row.protol==17">
              <b>【源地址端口范围】</b>
              <span>{{row.sports!=='any'?`${row.sports}-${row.sporte}`:'所有'}}</span>
            </p>
            <p>
              <b>【目的IP】</b>
              <span>{{row.dip!=='any'?`${row.dip}/${row.dmask}`:'所有'}}</span>
            </p>
            <p v-if="row.protol==6||row.protol==17">
              <b>【目的地址端口范围】</b>
              <span>{{row.dports!=='any'?`${row.dports}-${row.dporte}`:'所有'}}</span>
            </p>
            <p>
              <b>【IP协议号】</b>
              <span>{{row.protol!=='any'?`${_getProtolName(row.protol)}`:'所有'}}</span>
            </p>
          </template>
        </el-table-column>
      </template>
      <el-table-column align="center" label="规则类型" width="100px">
        <template slot-scope="{row}">
          <span>{{row.action===1?'阻塞':'允许'}}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="生效时间" width="100px">
        <template slot-scope="{row}">
          <acl-date-view :time="_getTimeByName(row.tmngtName)" />
        </template>
      </el-table-column>-->
      <el-table-column align="center" label="操作" width="160px">
        <template slot-scope="{row,$index}">
          <el-button size="mini" type="text" v-auth="{fn:_onEditRule,params:$index}" v-if="editIndex!==$index">修改</el-button>
          <el-button @click.native="_onReset" size="mini" type="text" v-else>取消修改</el-button>
          <el-button
            :disabled="aceList.length<=1||editIndex>-1"
            size="mini"
            type="text"
            v-auth="{fn:_onMoveRule,params:$index}"
          >移动</el-button>
          <el-button
            :class="{'c-danger':editIndex===-1}"
            :disabled="editIndex>-1"
            size="mini"
            type="text"
            v-auth="{fn:_onDelRule,params:row.uuid}"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 上下移动 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="moveModalShow"
      @open="_clearValidate('moveForm')"
      append-to-body
      title="移动规则选择"
      width="650px"
    >
      <el-form :model="moveModel" :rules="moveRules" class="inline-tip" inline inline-message ref="moveForm" size="small">
        <span class="vm">
          将选中的第
          <b class="c-success">{{moveIndex+1}}</b> 条规则和第
        </span>
        <el-form-item class="vm" inline-message prop="index" style="margin:0;vertical-align:middle;">
          <el-input class="w60" placeholder="索引" v-model="moveModel.index"></el-input>
        </el-form-item>
        <span class="vm">条规则互换</span>
      </el-form>
      <p class="c-info">（注：规则匹配优先级是从上到下依次匹配）</p>
      <span class="dialog-footer" slot="footer">
        <el-button @click.native="moveModalShow = false" size="small">取 消</el-button>
        <el-button :loading="isLoading" @click.native="_onMoveModalConfirm" size="small" type="primary">移动</el-button>
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
    times: Array
  },
  data() {
    // 端口号验证
    const portValidator = (r, v, cb) => {
      if (this.baseModel[`${r.type}ports`] > this.baseModel[`${r.type}porte`]) {
        return cb(new Error('起始端口号不能小于结束端口号'))
      }
      cb()
    }
    // 移动优先级验证
    const moveValidator = (r, v, cb) => {
      if (!v) {
        return cb()
      }
      if (!intValidate(v)) {
        return cb(new Error('请输入数字'))
      }
      if (v == this.moveIndex + 1) {
        return cb(new Error('互换的规则号不能相同'))
      }
      let _aceLen = this.aceList.length
      if (!isBetween(v, 1, _aceLen)) {
        return cb(new Error(`规则号范围为1~${_aceLen}`))
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
        cb(new Error('请输入整数'))
        return
      }
      if (!isBetween(v, 0, 255)) {
        cb(new Error(`取值范围 0~255`))
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
        return cb(new Error('请输入掩码'))
      }
      if (this.acl.type === 1) {
        if (!macValidate(v)) {
          return cb(new Error('请输入正确的掩码格式,如ff:ff:ff:ff:ff:00'))
        }
      } else {
        if (!isIp(v)) {
          return cb(new Error('请输入正确的掩码格式,如255.255.255.0'))
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
          { required: true, message: '请输入源IP地址' },
          { validator: ipValidator }
        ],
        dip: [
          { required: true, message: '请输入目的IP地址' },
          { validator: ipValidator }
        ],
        smac: [
          { required: true, message: '请输入源MAC地址' },
          { validator: macValidator }
        ],
        dmac: [
          { required: true, message: '请输入目的MAC地址' },
          { validator: macValidator }
        ],
        protol: [{ validator: protolValidator }],
        sports: [
          { required: true, message: '请输入源端口起始端口号' },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 's' }
        ],
        sporte: [
          { required: true, message: '请输入源端口结束端口号' },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 's' }
        ],
        dports: [
          { required: true, message: '请输入目的端口起始端口号' },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 'd' }
        ],
        dporte: [
          { required: true, message: '请输入目的端口结束端口号' },
          { validator: intValidator },
          { validator: rangeValidator, min: 0, max: 65535 },
          { validator: portValidator, type: 'd' }
        ],
        eth: [
          { required: true, message: '请输入报文类型号' },
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
          { required: true, message: '请输入数字' },
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
          this.$message.success('操作成功')
          // this._loadAceList()
          this.aceList.splice(
            newIndex,
            1,
            ...this.aceList.splice(oldIndex, 1, _newItem)
          )
        }
      })
    },
    // 配置初始化时间
    _setInitTime() {
      if (this.times.length) {
        this.baseModel.tmngtName = this.times[0].tmngtName
      }
    },
    // 获取ip协议号名称
    _getProtolName(protol) {
      let _protol = this.protolList.find(p => p.v === protol)
      return _protol ? _protol.k : protol
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
        return this.$message.warning('请选择要删除的列表项')
      }
      await this.$confirm(`是否确认删除？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      try {
        await this.$api.cmd('devSta.del', {
          module: 'ace',
          data: { uuid: _uuids, acl_uuid: this.acl.uuid }
        })
        this.aceList = this.aceList.filter(ace => !_uuids.includes(ace.uuid))
        // this._loadAceList()
        this.$message.success('删除成功')
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
            this.$alert('规则已被配，请重新修改', { type: 'error' })
            return
          }
          let _isEdit = this.editIndex !== -1
          let _model = { ...this.baseModel }
          _model.acl_uuid = this.acl.uuid
          _model.acl_type = this.acl.type
          if (_model.protol && _model.protol !== 'any') {
            _model.protol = +_model.protol
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
            this.$message.success(`${_isEdit ? '编辑程功' : '添加成功'}`)
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
          // this._loadAceList()
          this.aceList.splice(
            this.moveModel.index - 1,
            1,
            ...this.aceList.splice(this.moveIndex, 1, _replaceAce)
          )
          this.moveModalShow = false
          this.$message.success('操作成功')
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
  .ace-tit {
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
}
</style>
